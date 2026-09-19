// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * Application-wide constants shared across modules.
 */

/* General */
export const APP_NAME_FALLBACK = "Bisca"; // Name of App if not in language file
export const APP_COPYRIGHT_HOLDER = "Silvino R.";
export const APP_BAR_HEIGHT_REM = 1.5;
export const DEBUG_BODY_CLASS = "debug";
export const PLAYING_SURFACE_ASPECT_RATIO = 3 / 2;
export const WELCOME_AMBIGRAM_PATH = "/assets/img/ambigram.svg";
export const WELCOME_ANIMATION_DURATION_MS = 3_000;
export const WELCOME_COMPLETION_DELAY_MS = 2_000;
export const WELCOME_ANIMATION_START_SIZE_PERCENT = 20;
export const WELCOME_ANIMATION_END_SIZE_PERCENT = 80;
export const WELCOME_ANIMATION_START_ROTATION_DEGREES = -270;
export const WELCOME_ANIMATION_STOP_ROTATION_DEGREES = 0;
export const WELCOME_ANIMATION_EASE = "inOutQuad";

/* Game engine */
export const UNKNOWN_DEALER = -1;
export const DEFAULT_DECK_CARDS = "BCDEFLKMGAbcdeflkmgaOPQRSYXZTNopqrsyxztn";
export const SELECT_DEALER_CARD_COUNT = 40;
export const SELECT_DEALER_SPREAD_DURATION_MS = 750;
export const SELECT_DEALER_CARD_MOVE_DURATION_MS = 500;
export const SELECT_DEALER_CARD_FLIP_DURATION_MS = 250;
export const SELECT_DEALER_RESULT_DELAY_MS = 10_000;
export const SPEECH_BUBBLE_AVATAR_PATH = "/assets/img/anonymous.svg";
export const SPEECH_BUBBLE_FONT_LOAD_SPEC = '1rem "Excalifont"';
export const TWO_FACE_CARDS = "BbOo";
export const DEFAULT_CARD_HEIGHT_PERCENT = 25;
export const DEFAULT_CARD_EDGE_GAP_PERCENT = 2.5;
export const MODE5_DEALER_CARD_TOP_PERCENT = 25;
export const DEFAULT_CARD_FALLBACK_ASPECT_RATIO = 5 / 7;

/* Animation */
export const ANIMATION_REDUCED_MOTION_SCOPE_KEY = "reducedMotion";
export const ANIMATION_REDUCED_MOTION_MEDIA_QUERY =
  "(prefers-reduced-motion: reduce)";

/* File handling */
export const APP_LANGUAGE_PATH = "/lang";

/* Startup choices */
export enum GameMode {
  MODE1 = "mode1", // 3 card Bisca
  MODE2 = "mode2", // 7 card Bisca
  MODE3 = "mode3", // 9 card Bisca
  MODE4 = "mode4", // 3 player Bisca
  MODE5 = "mode5", // Sueca (4 players)
}

export enum Difficulty {
  EASY = "easy",
  NORMAL = "norm",
  HARD = "hard",
}

export enum MatchCount {
  ONE = "one", // One single game
  TWO = "two", // One set
  THREE = "three", // Best of 3 sets
  FOUR = "four", // First to 4 sets
}

export enum TableColor {
  GREEN = "green",
  RED = "red",
  BLUE = "blue",
  BLACK = "black",
  PURPLE = "purple",
}

export const TABLE_COLOR_HEX: Record<TableColor, string> = {
  [TableColor.GREEN]: "#096",
  [TableColor.RED]: "#C50",
  [TableColor.BLUE]: "#069",
  [TableColor.BLACK]: "#555",
  [TableColor.PURPLE]: "#A7C",
};

export enum TableTexture {
  FELT = "felt",
  LEATHER = "leather",
  SUEDE = "suede",
  FABRIC = "fabric",
  DIGITAL = "digital",
}

export enum TenCard {
  SEVEN = 0,
  THREE = 1,
  TEN = 2,
}

export enum CourtCardPoints {
  QUEEN_TWO_JACK_THREE = 0,
  JACK_TWO_QUEEN_THREE = 1,
}

export enum ScoreKeeping {
  COMBS = 0,
  CROSSES = 2,
}

export enum GameScreen {
  WELCOME = "welcome",
  INTRO = "intro",
  HELP = "help",
  SETTINGS = "settings",
  PLAYING = "playing",
  YOU_WIN = "you-win",
  YOU_LOSE = "you-lose",
}

export enum ScreenStateAction {
  WELCOME_COMPLETE = "welcome-complete",
  RETURN_TO_WELCOME = "return-to-welcome",
  OPEN_HELP = "open-help",
  CLOSE_HELP = "close-help",
  OPEN_SETTINGS = "open-settings",
  CLOSE_SETTINGS = "close-settings",
  START_GAME = "start-game",
  GAME_WON = "game-won",
  GAME_LOST = "game-lost",
  CONTINUE = "continue",
}

export const TABLE_TEXTURE_PATH: Record<TableTexture, string> = {
  [TableTexture.FELT]: "/assets/img/table/felt.png",
  [TableTexture.LEATHER]: "/assets/img/table/leather.png",
  [TableTexture.SUEDE]: "/assets/img/table/suede.png",
  [TableTexture.FABRIC]: "/assets/img/table/fabric.png",
  [TableTexture.DIGITAL]: "/assets/img/table/digital.png",
};

export const TABLE_SPOTLIGHT_PATH = "/assets/img/table/_spotlight.png";

/* Local storage */
export const PERSISTENCE_GAME_MODE = "mode";
export const PERSISTENCE_SCREEN_STATE = "screen";
export const PERSISTENCE_GAME_ENGINE = "game";
export const PERSISTENCE_SETTINGS = "settings";
export const PERSISTENCE_STORAGE_VERSION = 1;
export const PERSISTENCE_STORAGE_PREFIX = "bisca";

export const LEGACY_PERSISTENCE_SECTIONS = [
  "settings-screen",
  "game-deck",
  "card-back",
  "card-backs",
  "help-screen",
] as const;

export const DEFAULT_GAME_DECK = "default";
export const DEFAULT_CARD_BACK = "a";
export const DEFAULT_TABLE_COLOR = TableColor.GREEN;
export const DEFAULT_TABLE_TEXTURE = TableTexture.FELT;
export const DEFAULT_TEN_CARD = TenCard.SEVEN;
export const DEFAULT_COURT_CARD_POINTS = CourtCardPoints.QUEEN_TWO_JACK_THREE;
export const DEFAULT_SCORE_KEEPING = ScoreKeeping.COMBS;
export const MAX_CARD_BACKS = 26;

export type PersistedSection =
  | typeof PERSISTENCE_GAME_MODE
  | typeof PERSISTENCE_SCREEN_STATE
  | typeof PERSISTENCE_GAME_ENGINE
  | typeof PERSISTENCE_SETTINGS;

export type LegacyPersistedSection =
  (typeof LEGACY_PERSISTENCE_SECTIONS)[number];
