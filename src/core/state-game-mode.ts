// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { h, render } from 'preact';
import { GameState } from './game-state';
import { logger } from './logger';
import { StateGameMode } from '../ui/state-game-mode';
import { StateMain } from '../types/game-state';

export class GameModeGameState extends GameState<StateMain> {
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
    return lastState;
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
