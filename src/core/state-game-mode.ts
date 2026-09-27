// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { h, render } from 'preact';
import { GameState } from './game-state';
import { logger } from './logger';
import { persistence } from './persistence';
import { StateGameMode } from '../ui/state-game-mode';
import { StateMain, type GameMode } from '../types/game-state.d';
import {
  SAVE_GROUP_OPTION,
  SAVE_PROGRESS,
  SAVE_PROGRESS_TIMESTAMP,
} from './constants';

export class GameModeGameState extends GameState<StateMain, GameMode> {
  private loaded: boolean = false;

  public constructor() {
    super(StateMain.GAME_MODE);
  }

  protected init(): void {
    // logger.debug('GAME_MODE --> Init');
    // Save the resume marker together with a timestamp; state-init.ts uses
    // the timestamp to discard this progress once it goes stale.
    void Promise.all([
      persistence.set(SAVE_GROUP_OPTION, SAVE_PROGRESS, 'mode'),
      persistence.set(SAVE_GROUP_OPTION, SAVE_PROGRESS_TIMESTAMP, String(Date.now())),
    ]).catch((error: unknown) => {
      logger.warn('[Persistence] Failed to save game progress:', error);
    });

    this.loaded = false;
  }

  protected tick(lastState: StateMain): StateMain {
    // logger.debug('GAME_MODE --> Tick');

    // triggered is set by reactions.ts calling trigger(mode) from the submit
    // button; until then, stay put and wait for the next trigger.
    if (!this.triggered) return lastState;

    // logger.debug(`GAME_MODE --> picked ${this.lastTrigger}`);
    return StateMain.SELECT_DEALER;
  }

  protected draw(): void {
    // logger.debug('GAME_MODE --> Draw');

    if (!this.loaded) {
      const appMain = document.getElementById('app_main');
      if (!appMain) return;

      render(h(StateGameMode, {}), appMain);
      this.loaded = true;
    }
  }

  protected end(): void {
    // logger.debug('GAME_MODE --> End');
    const appMain = document.getElementById('app_main');
    if (appMain) render(null, appMain);
    this.loaded = false;
  }
}
