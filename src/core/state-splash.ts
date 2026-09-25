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
  }

  protected tick(): StateMain {
    logger.debug('SPLASH --> Tick');

    return StateMain.GAME_MODE; // move on to next state
  }

  protected draw(): void {
    logger.debug('SPLASH --> Draw');
  }

  protected end(): void {
    logger.debug('SPLASH -->  End')
  }
}
