// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * Application-wide constants shared across modules.
 */

import { 
  TABLE_COLOR_GREEN,
  TABLE_TEXTURE_FELT,
  TEN_CARD_SEVEN,
  COURT_CARD_POINTS_Q2J3,
  SCORE_KEEPING_COMBS,
} from "../types/game-state.d";

// general items
export const APP_COPYRIGHT_HOLDER = "@SilvinoR";
export const APP_SPEECH_BUBBLE_DELAY = 7500;

// file paths
export const APP_LANGUAGE_PATH = '/lang';
export const APP_HELP_PATH = '/help';
export const APP_DECKS_PATHS = '/assets/img/decks';

export const APP_LOGO_FILE = '/assets/img/logo.svg';
export const APP_SPEECH_BUBBLE_AVATAR_FILE = '/assets/img/user.svg';

/* Reactions and Triggers */
export const ACTION_GO = 'go';
export const ACTION_SETTINGS = 'settings';
export const ACTION_HELP = 'help';
export const ACTION_QUIT = 'quit';
export const ACTION_NEXT = 'next';
export const ACTION_SELECT = 'select';

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
export const SAVE_GLOBAL = 'global';
export const SAVE_SELECT_DEALER = 'select.dealer';

// Deck catalog
export const MAX_CARD_BACKS = 26;

export const REFRESH_RESET_TIMEOUT = 7 * 24 * 60 * 60; // 1 day, in seconds. Saved progress older than this is discarded rather than resumed. 

// Language specific key words
export const I18N_APP_NAME = 'appName';

// playing surface
export const PLAYING_SURFACE_ASPECT_RATIO = 3 / 2;
export const PLAYING_CARD_SIZE_RATIO = 0.2;

/* Game engine */
export const DEFAULT_DECK_CARDS = 'BCDEFLKMGAbcdeflkmgaOPQRSYXZTNopqrsyxztn';
export const TWOS_DECK_CARDS = 'BbOo';
export const UNKNOWN_DEALER = -1;

/* Defaults for settings etc. */
export const DEFAULT_GAME_DECK_NAME = 'default';
export const DEFAULT_CARD_BACK = 'a';
export const DEFAULT_TABLE_COLOR = TABLE_COLOR_GREEN;
export const DEFAULT_TABLE_TEXTURE = TABLE_TEXTURE_FELT;
export const DEFAULT_TEN_CARD = TEN_CARD_SEVEN;
export const DEFAULT_COURT_CARD_POINTS = COURT_CARD_POINTS_Q2J3;
export const DEFAULT_SCORE_KEEPING = SCORE_KEEPING_COMBS;
// export const MAX_CARD_BACKS = 26;
