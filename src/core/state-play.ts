// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { GameState } from './game-state';
import { logger } from './logger';
import { StateMain } from '../types/game-state.d';

export class PlayGameState extends GameState<StateMain> {
  public constructor() {
    super(StateMain.PLAY);
  }

  protected init(): void {
    logger.debug('Game State --> PLAY --> Init');
  }

  protected tick(lastState: StateMain): StateMain {
    logger.debug('Tick --> PLAY');
    // TODO: transition once this node has a real trigger to react to.
    return lastState;
  }

  protected draw(): void {
    logger.debug('Draw --> PLAY');
  }

  protected end(): void {
    logger.debug('Game State --> PLAY --> End');
  }
}
