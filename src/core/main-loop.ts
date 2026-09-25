// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain } from '../types/game-state.d';
import { GameState } from './game-state';
import { GameModeGameState } from './state-game-mode';
import { HelpScreen } from './state-help';
import { InitGameState } from './state-init';
import { PlayGameState } from './state-play';
import { SelectDealerGameState } from './state-select-dealer';
import { SettingsScreen } from './state-settings';
import { SplashGameState } from './state-splash';
import { WinLoseGameState } from './state-win-lose';
import { logger } from './logger';

/** The interface needed from each separately implemented mini state engine. */
export type MainGameNode = Pick<GameState<StateMain>, 'start' | 'step' | 'render' | 'stop' | 'finished' | 'state'>;
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
  private readonly savedNodes: MainGameNode[] = [];
  
  public constructor(
    private readonly nodeFactories: Record<StateMain, MainGameNodeFactory | null>,
  ) {
    super(StateMain.INIT);
  }

  public get activeState(): ActiveGameState {
    return this.state;
  }

  public get activeNode(): MainGameNode | null {
    return this.currentNode;
  }

  public subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.activeState);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public override async frame(): Promise<void> {
    const preFrameState = this.activeState;
    await this.step();
    if (this.activeState !== preFrameState) this.notifyStateListeners();
  }

  // The main loop delegates its whole "tick" to the active node: node.step()
  // already runs that node's full tick -> draw -> wait cycle until it
  // transitions, so there is no separate draw/wait phase to run here.
  public override async step(): Promise<StateMain> {
    if (this.finished) return this.currentState;
    this.currentState = await this.tick(this.currentState);
    return this.currentState;
  }

  /**
   * Settings and Help can be opened at any time, from any node. Push the
   * current node onto the FILO stack (so Settings and Help can open each
   * other and unwind correctly) and switch to the requested overlay.
   */
  public openOverlay(overlay: StateMain): void {
    logger.debug(`openOverlay(${overlay})`);

    if (this.currentNode) this.savedNodes.push(this.currentNode);
    this.activateNode(overlay);
    this.notifyStateListeners();
  }

  protected init(): void {
    // A new run begins at INIT; its node decides what persisted game to restore.
    this.activateNode(StateMain.INIT);
  }

  protected async tick(lastState: StateMain): Promise<StateMain> {
    // node.step() suspends until the active node is ready to progress, so its
    // resolution always means "advance" — start the successor it names.
    const node = this.currentNode;
    if (!node) return lastState;

    const wantedState = await node.step();
    // The node may have been swapped out (e.g. an overlay opened over it)
    // while its step() was pending; a stale result must not resurrect it.
    if (node !== this.currentNode) return this.currentState;

    return this.activateNode(wantedState);
  }

  protected draw(): void {
    // Not reached in the normal loop: step() is overridden above and never
    // calls render() on this engine itself. Each node draws itself as part
    // of its own step() cycle. Kept for interface completeness.
    this.currentNode?.render();
  }

  protected end(): void {
    this.currentNode?.stop();
    this.currentNode = null;
    this.savedNodes.forEach((node) => node.stop());
    this.savedNodes.length = 0;
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

    if (state === StateMain.RESUME) {
      const resumed = this.savedNodes.pop();
      if (resumed) {
        this.currentNode = resumed;
        resumed.start();
        this.currentState = resumed.state;
        return this.currentState;
      }
      // Nothing left to resume (should not happen): fall back to the menu
      // rather than leaving the engine with no active node.
      return this.activateNode(StateMain.GAME_MODE);
    }

    const factory = this.nodeFactories[state];
    this.currentNode = factory?.() ?? null;
    this.currentNode?.start();
    this.currentState = state;
    return state;
  }

  private notifyStateListeners(): void {
    const state = this.activeState;
    this.stateListeners.forEach((listener) => listener(state));
  }
}

export const gameEngine = new MainGameEngine(
  {
    [StateMain.INIT]: () => new InitGameState(),
    [StateMain.SPLASH]: () => new SplashGameState(),
    [StateMain.GAME_MODE]: () => new GameModeGameState(),
    [StateMain.SELECT_DEALER]: () => new SelectDealerGameState(),
    [StateMain.PLAY]: () => new PlayGameState(),
    [StateMain.WIN_LOSE]: () => new WinLoseGameState(),
    [StateMain.SETTINGS]: () => new SettingsScreen(),
    [StateMain.HELP]: () => new HelpScreen(),
    [StateMain.RESUME]: null,
  },
);
