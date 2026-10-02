// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { h, render } from 'preact';
import { GameState } from './game-state';
import { logger } from './logger';
import { StateSettings } from '../ui/state-settings';
import { StateMain } from '../types/game-state.d';

export class SettingsScreen extends GameState<StateMain> {
  private loaded: boolean = false;

  public constructor() {
    super(StateMain.SETTINGS);
  }

  protected init(): void {
    logger.debug('SETTINGS --> Init');
    this.loaded = false;
  }

  protected tick(): void {
    logger.debug('SETTINGS --> Tick');
    // ... do nothing ...
  }

  protected draw(): void {
    logger.debug('SETTINGS --> Draw');
    if (!this.loaded) {
      const appMain = document.getElementById('app-main');
      if (!appMain) return;
      render(h(StateSettings, {}), appMain);
      this.loaded = true;
    }
  }

  protected tock(): StateMain {
    logger.debug('SETTINGS --> Tock');
    return this.triggered ? StateMain.RESUME : this.currentState;
  }

  protected end(): void {
    logger.debug('SETTINGS --> End');
    const appMain = document.getElementById('app-main');
    if (appMain) render(null, appMain);
    this.loaded = false;
  }
}
