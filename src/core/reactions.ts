// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StateMain } from "../types/game-state.d";
import { gameEngine } from "./main-loop";
import { GameModeGameState, type GameModeSelection } from "./state-mode";
import { SelectDealerGameState } from "./state-dealer";
import { PlayGameState } from "./state-play";
import { SettingsScreen } from "./state-settings";
import { HelpScreen } from "./state-help";
import { logger } from "./logger";
import { i18n } from "./i18n";
import { ACTION_QUIT } from "./constants";

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
function clearTooltips(): void {
  const Tooltip = (
    window as Window & { bootstrap?: { Tooltip?: TooltipPlugin } }
  ).bootstrap?.Tooltip;
  if (!Tooltip) return;

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((element) => {
    Tooltip.getInstance(element)?.hide();
  });
}

export function gameModeSubmit(selection: GameModeSelection): void {
  logger.info(`gameModeSubmit:${selection}`);
  clearTooltips();
  const node = gameEngine.node;
  logger.info(`node = ${node}`);
  if (node instanceof GameModeGameState) node.trigger(selection);
}

export function settingsClick(): void {
  logger.info("settingsClick");
  clearTooltips();
  gameEngine.openOverlay(StateMain.SETTINGS);
}

export function helpClick(): void {
  logger.info("helpClick");
  clearTooltips();
  gameEngine.openOverlay(StateMain.HELP);
}

export function closeClick(): void {
  logger.info("closeClick");
  clearTooltips();
  const node = gameEngine.node;
  if (node instanceof SettingsScreen || node instanceof HelpScreen)
    node.trigger(undefined);
}

export function quitClick(): void {
  logger.info("quitClick");
  clearTooltips();

  // FIXME : Make this a SpeechBubble interaction
  if (!window.confirm(i18n.t("reactions:confirm-quit"))) return;

  const node = gameEngine.node;
  if (node instanceof SelectDealerGameState || node instanceof PlayGameState) {
    node.trigger({ action: ACTION_QUIT, nextState: StateMain.GAME_MODE });
  }
}
