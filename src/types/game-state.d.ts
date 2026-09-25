// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

/** Top-level nodes in the main game loop. */
export enum StateMain {
  INIT = 'init',
  SPLASH = 'splash',
  GAME_MODE = 'game-mode',
  SELECT_DEALER = 'select-dealer',
  PLAY = 'play',
  WIN_LOSE = 'win-lose',

  // Overlay states
  SETTINGS = 'settings',
  HELP = 'help',

  // used by Overlay states to resume prior states
  RESUME = 'resume'
}

/** Game mode choices offered on the GAME_MODE screen. */
export type GameMode = 'mode1' | 'mode2' | 'mode3' | 'mode4' | 'mode5';

/** Computer difficulty choices offered on the GAME_MODE screen. */
export type Difficulty = 'easy' | 'normal' | 'hard';

/** Match length choices offered on the GAME_MODE screen. */
export type MatchCount = 'one' | 'two' | 'three' | 'four';
