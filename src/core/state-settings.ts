// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { GameState } from './game-state';
import { logger } from './logger';
import { StateMain } from '../types/game-state.d';

export class SettingsScreen extends GameState<StateMain> {
  public constructor() {
    super(StateMain.SETTINGS);
  }

  protected init(): void {
    logger.debug('SETTINGS --> Init');
  }

  protected tick(lastState: StateMain): StateMain {
    logger.debug('SETTINGS --> Tick');
    // reactions.ts's closeClick() calls trigger() on this node; once fired,
    // resume whichever node this overlay interrupted.
    return this.triggered ? StateMain.RESUME : lastState;
  }

  protected draw(): void {
    logger.debug('SETTINGS --> Draw');
  }

  protected end(): void {
    logger.debug('SETTINGS --> End');
  }
}
