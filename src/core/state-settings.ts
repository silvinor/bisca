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

  protected tick(lastState: StateMain): StateMain {
    logger.debug('SETTINGS --> Tick');
    // reactions.ts's closeClick() calls trigger() on this node; once fired,
    // resume whichever node this overlay interrupted.
    return this.triggered ? StateMain.RESUME : lastState;
  }

  protected draw(): void {
    logger.debug('SETTINGS --> Draw');

    if (!this.loaded) {
      const appMain = document.getElementById('app_main');
      if (!appMain) return;

      render(h(StateSettings, {}), appMain);
      this.loaded = true;
    }
  }

  protected end(): void {
    logger.debug('SETTINGS --> End');
    const appMain = document.getElementById('app_main');
    if (appMain) render(null, appMain);
    this.loaded = false;
  }
}
