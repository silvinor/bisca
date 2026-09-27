// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * Application-wide constants shared across modules.
 */

// general items
export const APP_COPYRIGHT_HOLDER = "@SilvinoR";

// file paths
export const APP_LANGUAGE_PATH = "/lang";
export const APP_HELP_PATH = "/help";

// Persistence specific key words
export const P_APP_KEY = 'bisca';

// persistence strings
export const SAVE_GROUP_OPTION = 'settings';
export const SAVE_NAME_MODE = 'mode';
export const SAVE_NAME_DIFFICULTY = 'difficulty';
export const SAVE_NAME_COUNT = 'count';
export const SAVE_PROGRESS = 'progress';
export const SAVE_PROGRESS_TIMESTAMP = 'timestamp';
export const SAVE_TEN_CARD = 'tens';
export const SAVE_COURT_CARD_POINTS = 'royal';
export const SAVE_SCORE_KEEPING = 'score';
export const SAVE_GAME_DECK = 'deck';
export const SAVE_CARD_BACK = 'back';
export const SAVE_TABLE_COLOR = 'color';
export const SAVE_TABLE_TEXTURE = 'texture';

// Deck catalog
export const MAX_CARD_BACKS = 26;

export const REFRESH_RESET_TIMEOUT = 7 * 24 * 60 * 60; // 1 day, in seconds. Saved progress older than this is discarded rather than resumed. 

// Language specific key words
export const I18N_APP_NAME = 'appName';
