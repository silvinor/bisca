// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain, TABLE_COLOR_GREEN, TABLE_TEXTURE_FELT } from '../types/game-state.d';
import { GameState } from './game-state';
import { logger } from './logger';
import { persistence } from './persistence';
import { applyTableColorClass, applyTableTextureClass } from './dynamic-css';
import {
  SAVE_GROUP_OPTION,
  SAVE_PROGRESS,
  SAVE_PROGRESS_TIMESTAMP,
  SAVE_TABLE_COLOR,
  SAVE_TABLE_TEXTURE,
  REFRESH_RESET_TIMEOUT,
} from './constants';

export class InitGameState extends GameState<StateMain> {
  public constructor() {
    super(StateMain.INIT);
  }

  protected init(): void {
    // logger.debug('INIT --> init');
  }

  protected async tick(): Promise<StateMain> {
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

    // Read saved progress, then use the splash screen for missing, unknown,
    // or stale (older than REFRESH_RESET_TIMEOUT) progress.
    let [progress, savedAt] = await Promise.all([
      persistence.get(SAVE_GROUP_OPTION, SAVE_PROGRESS),
      persistence.get(SAVE_GROUP_OPTION, SAVE_PROGRESS_TIMESTAMP),
    ]).catch((error: unknown): [string, string] => {
      logger.warn('[Persistence] Failed to load game progress:', error);
      return ['', ''];
    });

    const isFresh = Date.now() - Number(savedAt || 0) < (REFRESH_RESET_TIMEOUT  * 1000);
    if (!isFresh) progress = '';

    switch (progress) {
      case 'mode':
        return StateMain.GAME_MODE;
      default:
        return StateMain.SPLASH;
    }
  }

  protected draw(): void {
    // logger.debug('INIT --> Draw');
  }

  protected end(): void {
    // logger.debug('INIT --> end');
  }
}
