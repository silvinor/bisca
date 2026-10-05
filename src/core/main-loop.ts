// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain } from '../types/game-state.d';
import { GameState } from './game-state';
import { InitGameState } from './state-init';
import { SplashGameState } from './state-splash';
import { GameModeGameState } from './state-mode';
import { SelectDealerGameState } from './state-dealer';
import { PlayGameState } from './state-play';
// import { WinLoseGameState } from './state-win-lose';
import { SettingsScreen } from './state-settings';
import { HelpScreen } from './state-help';
import { logger } from './logger';
// import { ACTION_HELP, ACTION_SETTINGS } from './constants';

// /** The interface needed from each separately implemented mini state engine. */
export type MainGameNode = Pick<GameState<StateMain>, 'start' | 'step' | /* 'render' | */ 'stop' | 'finished' | 'state'>;
type MainGameNodeFactory = () => MainGameNode;

// type ResumeState = StateMain.SPLASH | StateMain.SELECT_DEALER | StateMain.PLAY;
export type ActiveGameState = StateMain;
type StateListener = (state: ActiveGameState) => void;

/** Coordinates the main game loop while leaving each node's work to its own engine. */
export class MainGameEngine extends GameState<StateMain> {
  // private returnTo: StateMain | null = null;
  // private requestedOverlay: StateOverlay | null = null;
  // private overlayClosed: Promise<void> | null = null;
  // private resolveOverlayClosed: (() => void) | null = null;
  private readonly stateListeners = new Set<StateListener>();
  private currentNode: MainGameNode | null = null;
  private readonly allNodes: MainGameNode[] = [];
  private nextState: StateMain | null = null;
  
  public constructor(
    private readonly nodeFactories: Record<StateMain, MainGameNodeFactory | null>,
  ) {
    super(StateMain.INIT);
  }

  public get node(): MainGameNode | null {
    return this.currentNode;
  }

  // public get activeNode(): MainGameNode | null {
  //   return this.currentNode;
  // }

  public subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.currentState);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public override async frame(): Promise<void> {
    const preFrameState = this.state;
    await this.step();
    if (this.state !== preFrameState) this.notifyStateListeners();
  }

  // // The main loop delegates its whole "tick" to the active node: node.step()
  // // already runs that node's full tick -> draw -> wait cycle until it
  // // transitions, so there is no separate draw/wait phase to run here.
  // public override async step(): Promise<StateMain> {
  //   if (this.finished) return this.currentState;
  //   this.currentState = await this.tick(this.currentState);
  //   return this.currentState;
  // }

  /**
   * Settings and Help can be opened at any time, from any node. Push the
   * current node onto the FILO stack (so Settings and Help can open each
   * other and unwind correctly) and switch to the requested overlay.
   */
  public openOverlay(overlay: StateMain): void {
    logger.debug(`openOverlay(${overlay})`);

    if (this.currentNode) this.allNodes.push(this.currentNode);

    /*
    const node = gameEngine.node;
    logger.info(`node = ${node}`);
    if (node instanceof GameModeGameState) {
      if (overlay == StateMain.SETTINGS) {
        node.trigger({action: ACTION_SETTINGS});
      } else if (overlay == StateMain.HELP) {
        node.trigger({action: ACTION_HELP});
      } else {
        logger.error(`Can't handle openOverlay(${overlay})`);
        node.trigger({action: overlay});
      }
    }
   */
    this.activateNode(overlay); // FIXME: delete
    this.notifyStateListeners(); // FIXME: delete
  }

  protected init(): void {
    // A new run begins at INIT; its node decides what persisted game to restore.
    this.activateNode(StateMain.INIT);
  }

  protected async tick(): Promise<void> {
    logger.debug(`MAIN --> Tick:${this.currentNode?.state}`);
    const node = this.currentNode;
    if (!node) return;

    const nextState = await node.step();
    if (node !== this.currentNode) return;

    this.nextState = nextState;    
  }

  protected async draw(): Promise<void> {
    logger.debug(`MAIN --> Draw:${this.currentNode?.state}`);
    if (this.currentNode) {
      this.trigger(undefined);
    }
  }
  
  protected async tock(): Promise<StateMain> {
    logger.debug(`MAIN --> Tock:${this.currentNode?.state} & nextState:${this.nextState}`);
    if (!this.currentState) return this.currentState;
    if (!this.nextState) return this.currentState;

    const nextState = await this.nextState;
    this.nextState = null;
    return this.activateNode(nextState);
  }

  // protected async tick(lastState: StateMain): Promise<StateMain> {
  //   // node.step() suspends until the active node is ready to progress, so its
  //   // resolution always means "advance" — start the successor it names.
  //   const node = this.currentNode;
  //   if (!node) return lastState;

  //   const wantedState = await node.step();
  //   // The node may have been swapped out (e.g. an overlay opened over it)
  //   // while its step() was pending; a stale result must not resurrect it.
  //   if (node !== this.currentNode) return this.currentState;

  //   return this.activateNode(wantedState);
  // }

  // protected draw(): void {
  //   // Not reached in the normal loop: step() is overridden above and never
  //   // calls render() on this engine itself. Each node draws itself as part
  //   // of its own step() cycle. Kept for interface completeness.
  //   this.currentNode?.render();
  // }

  protected end(): void {
    this.currentNode?.stop();
    this.currentNode = null;
    this.allNodes.forEach((node) => node.stop());
    this.allNodes.length = 0;
  }

  /**
   * Stops whatever is current and switches to `state`. StateMain.RESUME is
   * not a real screen: it means "pop the FILO stack and continue whichever
   * node Settings or Help interrupted." Returns the state actually reached,
   * since resuming reveals a different StateMain than the literal `state`
   * argument.
   */
  private activateNode(state: StateMain): StateMain {
    this.currentNode?.stop();

    // logger.info(101);
    if (state === StateMain.RESUME) {
      // logger.info(102);
      const resumed = this.allNodes.pop();
      if (resumed) {
        this.currentNode = resumed;
        resumed.start();
        this.currentState = resumed.state;
        return this.currentState;
      }
      // logger.info(103);
      // Nothing left to resume (should not happen): fall back to the menu
      // rather than leaving the engine with no active node.
      return this.activateNode(StateMain.GAME_MODE);
    }

    // logger.info(104);
    const factory = this.nodeFactories[state];
    this.currentNode = factory?.() ?? null;
    this.currentNode?.start();
    this.currentState = state;
    // logger.info(105);
    return state;
  }

  private notifyStateListeners(): void {
    const state = this.state;
    this.stateListeners.forEach((listener) => listener(state));
  }
}

/* ----- Singleton ----- */

export const gameEngine = new MainGameEngine(
  {
    [StateMain.INIT]: () => new InitGameState(),
    [StateMain.SPLASH]: () => new SplashGameState(),

    [StateMain.GAME_MODE]: () => new GameModeGameState(),
    // [StateMain.GAME_MODE]: null,
    [StateMain.SELECT_DEALER]: () => new SelectDealerGameState(),
    // [StateMain.SELECT_DEALER]: null,
    [StateMain.PLAY]: () => new PlayGameState(),
    // [StateMain.WIN_LOSE]: () => new WinLoseGameState(),
    [StateMain.WIN_LOSE]: null,

    [StateMain.SETTINGS]: () => new SettingsScreen(),
    [StateMain.HELP]: () => new HelpScreen(),
    [StateMain.RESUME]: null,
  },
);
