// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { GameState } from './game-state';
import { logger } from './logger';
import { StateMain } from '../types/game-state.d';

export class WinLoseGameState extends GameState<StateMain> {
  public constructor() {
    super(StateMain.WIN_LOSE);
  }

  protected init(): void {
    logger.debug('Game State --> WIN_LOSE --> Init');
  }

  protected tick(): void {
    logger.debug('Tick --> WIN_LOSE');
    // ... do nothing ...
  }

  protected draw(): void {
    logger.debug('Draw --> WIN_LOSE');
  }

  protected tock(): StateMain {
    logger.debug('Tock --> WIN_LOSE');
    // TODO: transition once this node has a real trigger to react to.
    return this.currentState;
  }

  protected end(): void {
    logger.debug('Game State --> WIN_LOSE --> End');
  }
}
