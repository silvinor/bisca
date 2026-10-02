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
    logger.debug('PLAY --> Init');
  }

  protected tick(): void {
    logger.debug('PLAY --> Tick');
  }

  protected draw(): void {
    logger.debug('PLAY --> Draw');
  }

  protected tock(): StateMain {
    logger.debug('PLAY --> Tock');
    // TODO: transition once this node has a real trigger to react to.
    return this.currentState;
  }
  

  protected end(): void {
    logger.debug('PLAY --> End');
  }
}
