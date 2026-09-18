// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { GameScreen, ScreenStateAction } from './constants';

export interface ScreenState {
  screen: GameScreen;
}

export const INITIAL_SCREEN_STATE: ScreenState = {
  screen: GameScreen.WELCOME,
};

const TRANSITIONS: Record<GameScreen, Partial<Record<ScreenStateAction, GameScreen>>> = {
  [GameScreen.WELCOME]: {
    [ScreenStateAction.WELCOME_COMPLETE]: GameScreen.INTRO,
  },
  [GameScreen.INTRO]: {
    [ScreenStateAction.OPEN_HELP]: GameScreen.HELP,
    [ScreenStateAction.OPEN_SETTINGS]: GameScreen.SETTINGS,
    [ScreenStateAction.START_GAME]: GameScreen.PLAYING,
  },
  [GameScreen.HELP]: {
    [ScreenStateAction.CLOSE_HELP]: GameScreen.INTRO,
  },
  [GameScreen.SETTINGS]: {
    [ScreenStateAction.CLOSE_SETTINGS]: GameScreen.INTRO,
  },
  [GameScreen.PLAYING]: {
    [ScreenStateAction.GAME_WON]: GameScreen.YOU_WIN,
    [ScreenStateAction.GAME_LOST]: GameScreen.YOU_LOSE,
  },
  [GameScreen.YOU_WIN]: {
    [ScreenStateAction.CONTINUE]: GameScreen.INTRO,
  },
  [GameScreen.YOU_LOSE]: {
    [ScreenStateAction.CONTINUE]: GameScreen.INTRO,
  },
};

export function isScreenState(value: unknown): value is ScreenState {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;
  return typeof state.screen === 'string'
    && Object.values(GameScreen).some((screen) => screen === state.screen);
}

export function transitionScreenState(state: ScreenState, action: ScreenStateAction): ScreenState {
  if (action === ScreenStateAction.RETURN_TO_WELCOME) {
    return state.screen === GameScreen.WELCOME
      ? state
      : { ...state, screen: GameScreen.WELCOME };
  }

  const nextScreen = TRANSITIONS[state.screen][action];
  return nextScreen === undefined ? state : { ...state, screen: nextScreen };
}
