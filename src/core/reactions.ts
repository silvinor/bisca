// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain } from '../types/game-state';
import { gameEngine } from './main-loop';

export function settingsClick(): void {
  gameEngine.openOverlay(StateMain.SETTINGS);
}

export function helpClick(): void {
   gameEngine.openOverlay(StateMain.HELP);
}

export function closeClick(): void {
  gameEngine.closeOverlay();
}

export function quitClick(): void {
  // TODO
}
