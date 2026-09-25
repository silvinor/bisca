// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { GameState } from './game-state';
import { logger } from './logger';
import { StateMain } from '../types/game-state.d';

export class SelectDealerGameState extends GameState<StateMain> {
  public constructor() {
    super(StateMain.SELECT_DEALER);
  }

  protected init(): void {
    logger.debug('Game State --> SELECT_DEALER --> Init');
  }

  protected tick(lastState: StateMain): StateMain {
    logger.debug('Tick --> SELECT_DEALER');
    // TODO: transition once this node has a real trigger to react to.
    return lastState;
  }

  protected draw(): void {
    logger.debug('Draw --> SELECT_DEALER');
  }

  protected end(): void {
    logger.debug('Game State --> SELECT_DEALER --> End');
  }
}
