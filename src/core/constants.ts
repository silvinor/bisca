// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * Application-wide constants shared across modules.
 */

/* General */
export const APP_NAME_FALLBACK = "Bisca"; // Name of App if not in language file

/* File handling */
export const APP_LANGUAGE_PATH = "/lang";

/* Startup choices */
export enum GameMode {
  MODE1 = 'mode1', // 3 card Bisca
  MODE2 = 'mode2', // 7 card Bisca
  MODE3 = 'mode3', // 9 card Bisca
  MODE4 = 'mode4', // 3 player Bisca
  MODE5 = 'mode5', // Sueca (4 players)
}

export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'norm',
  HARD = 'hard',
}

export enum MatchCount {
  ONE = 'one', // One single game
  TWO = 'two', // One set
  THREE = 'three', // Best of 3 sets
  FOUR = 'four', // First to 4 sets
}

/* Local storage */
export const PERSISTENCE_SECTION_STARTUP = 'startup';
export const PERSISTENCE_SECTION_GAME_STATE = 'game-state';
export const PERSISTENCE_SECTION_SETTINGS_SCREEN = 'settings-screen';
export const PERSISTENCE_SECTION_HELP_SCREEN = 'help-screen';
export const PERSISTENCE_SECTION_GAME_DECK = 'game-deck';
export const PERSISTENCE_STORAGE_VERSION = 1;
export const PERSISTENCE_STORAGE_PREFIX = 'bisca';

export const DEFAULT_GAME_DECK = 'silvinor';
export const DEFAULT_CARD_BACK = 'a';

export type PersistedSection =
  | typeof PERSISTENCE_SECTION_STARTUP
  | typeof PERSISTENCE_SECTION_GAME_STATE
  | typeof PERSISTENCE_SECTION_SETTINGS_SCREEN
  | typeof PERSISTENCE_SECTION_HELP_SCREEN
  | typeof PERSISTENCE_SECTION_GAME_DECK;
