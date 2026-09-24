// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { GameState } from './game-state';
import { logger } from './logger';
import { StateMain } from '../types/game-state';

export class SettingsScreen extends GameState<StateMain> {
  public constructor() {
    super(StateMain.SETTINGS);
  }

  protected init(): void {
    logger.debug('SETTINGS --> Init');
  }

  protected tick(lastState: StateMain): StateMain {
    logger.debug('SETTINGS --> Tick');
    return lastState;
  }

  protected draw(): void {
    logger.debug('SETTINGS --> Draw');
  }

  protected end(): void {
    logger.debug('SETTINGS --> End');
  }
}
