// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { GameState } from './game-state';
import { logger } from './logger';
import { StateMain } from '../types/game-state';

export class WinLoseGameState extends GameState<StateMain> {
  public constructor() {
    super(StateMain.WIN_LOSE);
  }

  protected init(): void {
    logger.debug('Game State --> WIN_LOSE --> Init');
  }

  protected tick(lastState: StateMain): StateMain {
    logger.debug('Tick --> WIN_LOSE');
    return lastState;
  }

  protected draw(): void {
    logger.debug('Draw --> WIN_LOSE');
  }

  protected end(): void {
    logger.debug('Game State --> WIN_LOSE --> End');
  }
}
