// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain } from '../types/game-state';
import { GameState } from './game-state';
import { logger } from './logger';

export class InitGameState extends GameState<StateMain> {
  public constructor() {
    super(StateMain.INIT);
  }

  protected init(): void {
    logger.debug('INIT --> init');

    // todo: Load settings from the persistence model.
  }

  protected tick(): StateMain {
    logger.debug('INIT --> Tick');
  
    this.stop();
    return StateMain.SPLASH; // move on to next state
  }

  protected draw(): void {
    
    logger.debug('INIT --> Draw');

    // todo: render the playing table with the correct colors and textures.
  }

  protected end(): void {
    logger.debug('INIT --> end');
  }
}
