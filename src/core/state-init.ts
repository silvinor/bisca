// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain, TABLE_COLOR_GREEN, TABLE_TEXTURE_FELT } from '../types/game-state.d';
import { GameState } from './game-state';
import { logger } from './logger';
import { persistence } from './persistence';
import { loadGameProgress } from './game-common';
import { applyTableColorClass, applyTableTextureClass } from './dynamic-css';
import {
  SAVE_GROUP_OPTION,
  SAVE_TABLE_COLOR,
  SAVE_TABLE_TEXTURE,
} from './constants';

export class InitGameState extends GameState<StateMain> {
  public constructor() {
    super(StateMain.INIT);
  }

  protected init(): void {
    // logger.debug('INIT --> init');
  }

  protected tick(): void {
    // logger.debug('INIT --> Tick');
    
    // Best-effort and non-blocking: themes the table as soon as possible
    // without delaying the progress-based routing decision below.
    void persistence.get(SAVE_GROUP_OPTION, SAVE_TABLE_COLOR, TABLE_COLOR_GREEN)
      .then(applyTableColorClass)
      .catch((error: unknown) => {
        logger.warn('[Persistence] Failed to load table color:', error);
      });
    void persistence.get(SAVE_GROUP_OPTION, SAVE_TABLE_TEXTURE, TABLE_TEXTURE_FELT)
      .then(applyTableTextureClass)
      .catch((error: unknown) => {
        logger.warn('[Persistence] Failed to load table texture:', error);
      });
  }

  protected draw(): void {
    // logger.debug('INIT --> Draw');
    this.trigger(undefined);
  }

  protected async tock(): Promise<StateMain> {
    // Use the splash screen for missing, unknown, or stale progress.
    const progress = await loadGameProgress();

    if ((progress == StateMain.GAME_MODE) || (progress == StateMain.SELECT_DEALER)) {
      return progress;
    } else {
      return StateMain.SPLASH;
    }
  }

  protected end(): void {
    // logger.debug('INIT --> end');
  }
}
