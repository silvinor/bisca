// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain } from '../types/game-state.d';
import { GameState } from './game-state';
import { logger } from './logger'

export class SplashGameState extends GameState<StateMain> {
  public constructor() {
    super(StateMain.SPLASH);
  }

  protected init(): void {
    logger.debug('SPLASH --> Init')
    // ... do nothing ...
  }

  protected tick(): void {
    logger.debug('SPLASH --> Tick');
    // ... do nothing ...
  }

  protected draw(): void {
    logger.debug('SPLASH --> Draw');
    this.trigger(undefined);
  }

  protected tock(): StateMain {
    logger.debug('SPLASH --> Tock');
    return StateMain.GAME_MODE; // move on to next state
  }

  protected end(): void {
    logger.debug('SPLASH -->  End')
    // ... do nothing ...
  }
}
