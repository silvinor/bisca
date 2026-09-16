// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { GameScreen, GameStateAction } from './constants';

export interface GameState {
  screen: GameScreen;
}

export const INITIAL_GAME_STATE: GameState = {
  screen: GameScreen.WELCOME,
};

const TRANSITIONS: Record<GameScreen, Partial<Record<GameStateAction, GameScreen>>> = {
  [GameScreen.WELCOME]: {
    [GameStateAction.WELCOME_COMPLETE]: GameScreen.INTRO,
  },
  [GameScreen.INTRO]: {
    [GameStateAction.OPEN_HELP]: GameScreen.HELP,
    [GameStateAction.OPEN_SETTINGS]: GameScreen.SETTINGS,
    [GameStateAction.START_GAME]: GameScreen.PLAYING,
  },
  [GameScreen.HELP]: {
    [GameStateAction.CLOSE_HELP]: GameScreen.INTRO,
  },
  [GameScreen.SETTINGS]: {
    [GameStateAction.CLOSE_SETTINGS]: GameScreen.INTRO,
  },
  [GameScreen.PLAYING]: {
    [GameStateAction.GAME_WON]: GameScreen.YOU_WIN,
    [GameStateAction.GAME_LOST]: GameScreen.YOU_LOSE,
  },
  [GameScreen.YOU_WIN]: {
    [GameStateAction.CONTINUE]: GameScreen.INTRO,
  },
  [GameScreen.YOU_LOSE]: {
    [GameStateAction.CONTINUE]: GameScreen.INTRO,
  },
};

export function isGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;
  return typeof state.screen === 'string'
    && Object.values(GameScreen).some((screen) => screen === state.screen);
}

export function transitionGameState(state: GameState, action: GameStateAction): GameState {
  const nextScreen = TRANSITIONS[state.screen][action];
  return nextScreen === undefined ? state : { ...state, screen: nextScreen };
}
