// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { h, render } from 'preact';
import { GameState } from './game-state';
import { logger } from './logger';
import { StateGameMode } from '../ui/state-game-mode';
import { StateMain, type GameMode } from '../types/game-state.d';

export class GameModeGameState extends GameState<StateMain, GameMode> {
  private loaded: boolean = false;

  public constructor() {
    super(StateMain.GAME_MODE);
  }

  protected init(): void {
    logger.debug('GAME_MODE --> Init');
    this.loaded = false;
  }

  protected tick(lastState: StateMain): StateMain {
    logger.debug('GAME_MODE --> Tick');

    // triggered is set by reactions.ts calling trigger(mode) from the submit
    // button; until then, stay put and wait for the next trigger.
    if (!this.triggered) return lastState;

    // TODO: persist `mode` once match setup has somewhere to put it.
    logger.debug(`GAME_MODE --> picked ${this.lastTrigger}`);
    return StateMain.SELECT_DEALER;
  }

  protected draw(): void {
    logger.debug('GAME_MODE --> Draw');

    if (!this.loaded) {
      const appMain = document.getElementById('app_main');
      if (!appMain) return;

      render(h(StateGameMode, {}), appMain);
      this.loaded = true;
    }
  }

  protected end(): void {
    logger.debug('GAME_MODE --> End');
    const appMain = document.getElementById('app_main');
    if (appMain) render(null, appMain);
    this.loaded = false;
  }
}
