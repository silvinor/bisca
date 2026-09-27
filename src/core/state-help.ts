// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { h, render } from 'preact';
import { GameState } from './game-state';
import { logger } from './logger';
import { StateHelp } from '../ui/state-help';
import { StateMain } from '../types/game-state.d';

export class HelpScreen extends GameState<StateMain> {
  private loaded: boolean = false;

  public constructor() {
    super(StateMain.HELP);
  }

  protected init(): void {
    logger.debug('HELP --> Init');
    this.loaded = false;
  }

  protected tick(lastState: StateMain): StateMain {
    logger.debug('HELP --> Tick');
    // reactions.ts's closeClick() calls trigger() on this node; once fired,
    // resume whichever node this overlay interrupted.
    return this.triggered ? StateMain.RESUME : lastState;
  }

  protected draw(): void {
    logger.debug('HELP --> Draw');

    if (!this.loaded) {
      const appMain = document.getElementById('app_main');
      if (!appMain) return;

      render(h(StateHelp, {}), appMain);
      this.loaded = true;
    }
  }

  protected end(): void {
    logger.debug('HELP --> End');
    const appMain = document.getElementById('app_main');
    if (appMain) render(null, appMain);
    this.loaded = false;
  }
}
