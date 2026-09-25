// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain, type GameMode } from '../types/game-state.d';
import { gameEngine } from './main-loop';
import { GameModeGameState } from './state-game-mode';
import { HelpScreen } from './state-help';
import { SettingsScreen } from './state-settings';

export function gameModeSubmit(mode: GameMode): void {
  const node = gameEngine.activeNode;
  if (node instanceof GameModeGameState) node.trigger(mode);
}

export function settingsClick(): void {
  gameEngine.openOverlay(StateMain.SETTINGS);
}

export function helpClick(): void {
   gameEngine.openOverlay(StateMain.HELP);
}

export function closeClick(): void {
  const node = gameEngine.activeNode;
  if (node instanceof SettingsScreen || node instanceof HelpScreen) node.trigger();
}

export function quitClick(): void {
  // TODO
}
