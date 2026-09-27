// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain, type GameMode } from '../types/game-state.d';
import { gameEngine } from './main-loop';
import { GameModeGameState } from './state-game-mode';
import { HelpScreen } from './state-help';
import { SettingsScreen } from './state-settings';

interface TooltipInstance {
  hide(): void;
}

interface TooltipPlugin {
  getInstance(element: Element): TooltipInstance | null;
}

/**
 * A clicked button may still be showing its Bootstrap tooltip (delegated
 * from document.body in main.tsx) when the action swaps out the DOM that
 * button lives in. Preact's unmount never fires the mouseleave/blur that
 * would normally hide it, so the tooltip popup is orphaned in <body>.
 * Every reaction below disposes tooltips first so no action can leak one.
 */
function disposeStuckTooltips(): void {
  const Tooltip = (window as Window & { bootstrap?: { Tooltip?: TooltipPlugin } }).bootstrap?.Tooltip;
  if (!Tooltip) return;

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((element) => {
    Tooltip.getInstance(element)?.hide();
  });
}

export function gameModeSubmit(mode: GameMode): void {
  disposeStuckTooltips();
  const node = gameEngine.activeNode;
  if (node instanceof GameModeGameState) node.trigger(mode);
}

export function settingsClick(): void {
  disposeStuckTooltips();
  gameEngine.openOverlay(StateMain.SETTINGS);
}

export function helpClick(): void {
  disposeStuckTooltips();
  gameEngine.openOverlay(StateMain.HELP);
}

export function closeClick(): void {
  disposeStuckTooltips();
  const node = gameEngine.activeNode;
  if (node instanceof SettingsScreen || node instanceof HelpScreen) node.trigger();
}

export function quitClick(): void {
  disposeStuckTooltips();
  // TODO
}
