// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain } from '../types/game-state';
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
  private activeNode: MainGameNode | null = null;
  private readonly savedNodes: MainGameNode[] = [];
  
  public constructor(
    private readonly nodeFactories: Record<StateMain, MainGameNodeFactory | null>,
  ) {
    super(StateMain.INIT);
  }

  public get activeState(): ActiveGameState {
    return this.state;
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
    await super.frame();
    if (this.activeState !== preFrameState) this.notifyStateListeners();
  }

  public override async step(): Promise<StateMain> {
    if (this.finished) return this.currentState;
    this.currentState = await this.tick(this.currentState);
    return this.currentState;
  }

  public openOverlay(overlay: StateMain): void {
    logger.debug(`openOverlay(${overlay})`);

    if (this.activeNode) this.savedNodes.push(this.activeNode);
    this.activeNode?.stop();
    this.activeNode = null;
    this.currentState = overlay;
    this.activateNode(overlay);
    this.notifyStateListeners();
  }

  public closeOverlay(): void {
    const savedNode = this.savedNodes.pop();
    if (!savedNode) return;

    this.activeNode?.stop();
    this.activeNode = savedNode;
    this.currentState = savedNode.state;
    savedNode.start();
    this.notifyStateListeners();
  }

  protected init(): void {
    // A new run begins at INIT; its node decides what persisted game to restore.
    this.currentState = StateMain.INIT;
    this.activateNode(StateMain.INIT);
  }

  protected async tick(lastState: StateMain): Promise<StateMain> {
    // Advance the current node until it reports completion, then start its successor.
    const node = this.activeNode;
    if (!node) return lastState;
    
    const wantedState = await node.step();
    if (node !== this.activeNode) return this.currentState;
    if (!node.finished) return lastState;
    
    this.activateNode(wantedState);
    return wantedState;
  }

  protected draw(): void {
    this.activeNode?.render();
  }

  protected end(): void {
    this.activeNode?.stop();
    this.activeNode = null;
    this.savedNodes.forEach((node) => node.stop());
    this.savedNodes.length = 0;
  }

  private activateNode(state: StateMain): void {
    this.activeNode?.stop();

    const factory = this.nodeFactories[state];
    this.activeNode = factory?.() ?? null;
    this.activeNode?.start();
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
