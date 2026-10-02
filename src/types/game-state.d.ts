// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { logger } from "../core/logger";
import { persistence } from '../core/persistence';
import {
  SAVE_GROUP_OPTION,
  SAVE_NAME_COUNT,
  SAVE_NAME_DIFFICULTY,
  SAVE_NAME_MODE,
} from '../core/constants';

export interface Trigger {
  action: string;
}

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
export const GAME_MODE_1 = 'mode1';
export const GAME_MODE_2 = 'mode2';
export const GAME_MODE_3 = 'mode3';
export const GAME_MODE_4 = 'mode4';
export const GAME_MODE_5 = 'mode5';
export type GameMode = GAME_MODE_1 | GAME_MODE_2 | GAME_MODE_3 | GAME_MODE_4 | GAME_MODE_5;

/** Computer difficulty choices offered on the GAME_MODE screen. */
export const GAME_DIFFICULTY_EASY = 'easy';
export const GAME_DIFFICULTY_NORMAL = 'normal';
export const GAME_DIFFICULTY_HARD = 'hard';
export type Difficulty = GAME_DIFFICULTY_EASY | GAME_DIFFICULTY_NORMAL | GAME_DIFFICULTY_HARD;

/** Match length choices offered on the GAME_MODE screen. */
export const  GAME_COUNT_ONE = 'one';
export const  GAME_COUNT_TWO = 'two';
export const  GAME_COUNT_THREE = 'three';
export const  GAME_COUNT_FOUR = 'four';
export type MatchCount = GAME_COUNT_ONE | GAME_COUNT_TWO | GAME_COUNT_THREE |  GAME_COUNT_FOUR;

/** Face used for the 10-point value card, offered on the SETTINGS screen. */
export const TEN_CARD_SEVEN = 'seven';
export const TEN_CARD_THREE = 'three';
export const TEN_CARD_TEN = 'ten';
export type TenCard = TEN_CARD_SEVEN | TEN_CARD_THREE | TEN_CARD_TEN;

/** Point values assigned to the Jack/Queen court cards, offered on the SETTINGS screen. */
export const COURT_CARD_POINTS_Q2J3 = 'jack3';
export const COURT_CARD_POINTS_J2Q3 = 'queen3';
export type CourtCardPoints = COURT_CARD_POINTS_Q2J3 | COURT_CARD_POINTS_J2Q3;

/** Traditional score-keeping method, offered on the SETTINGS screen. */
export const SCORE_KEEPING_CROSSES = 'crosses';
export const SCORE_KEEPING_COMBS = 'combs';
export type ScoreKeeping = SCORE_KEEPING_CROSSES | SCORE_KEEPING_COMBS;

/** Table felt color choices, offered on the SETTINGS screen. */
export const TABLE_COLOR_GREEN = 'green';
export const TABLE_COLOR_RED = 'red';
export const TABLE_COLOR_BLUE = 'blue';
export const TABLE_COLOR_EBONY = 'ebony';
export const TABLE_COLOR_PURPLE = 'purple';
export type TableColor =
  TABLE_COLOR_GREEN | TABLE_COLOR_RED | TABLE_COLOR_BLUE | TABLE_COLOR_EBONY | TABLE_COLOR_PURPLE;

/** Table felt texture choices, offered on the SETTINGS screen. */
export const TABLE_TEXTURE_FELT = 'felt';
export const TABLE_TEXTURE_FABRIC = 'fabric';
export const TABLE_TEXTURE_LEATHER = 'leather';
export const TABLE_TEXTURE_SUEDE = 'suede';
export const TABLE_TEXTURE_DIGITAL = 'digital';
export type TableTexture =
  TABLE_TEXTURE_FELT | TABLE_TEXTURE_FABRIC | TABLE_TEXTURE_LEATHER | TABLE_TEXTURE_SUEDE | TABLE_TEXTURE_DIGITAL;

/** Defaults */
export const DEFAULT_GAME_MODE = GAME_MODE_1;
export const DEFAULT_GAME_DIFFICULTY = GAME_DIFFICULTY_NORMAL;
export const DEFAULT_GAME_COUNT = GAME_COUNT_TWO;


/* ---------- Getters and Setters ---------- */

export async function getGameMode(fallback_or_default: GameMode = DEFAULT_GAME_MODE): Promise<GameMode> {
  return await persistence.get(SAVE_GROUP_OPTION, SAVE_NAME_MODE, fallback_or_default) as GameMode;
} 

export function setGameMode(mode: GameMode = DEFAULT_GAME_MODE): void {
  void persistence.set(SAVE_GROUP_OPTION, SAVE_NAME_MODE, mode).catch((error: unknown) => {
    logger.warn('[Persistence] Failed to save game mode:', error); // don't i18n
  });
} 

export async function getDifficulty(fallback_or_default: Difficulty = DEFAULT_GAME_DIFFICULTY): Promise<Difficulty> {
  return await persistence.get(SAVE_GROUP_OPTION, SAVE_NAME_DIFFICULTY, fallback_or_default) as Difficulty;
}

export function setDifficulty(difficulty: Difficulty = DEFAULT_GAME_DIFFICULTY): void {
  void persistence.set(SAVE_GROUP_OPTION, SAVE_NAME_DIFFICULTY, difficulty).catch((error: unknown) => {
    logger.warn('[Persistence] Failed to save game difficulty:', error); // don't i18n
  });
}

export async function getMatchCount(fallback_or_default: MatchCount = DEFAULT_GAME_COUNT): Promise<MatchCount> {
  return await persistence.get(SAVE_GROUP_OPTION, SAVE_NAME_COUNT, fallback_or_default) as MatchCount;
}

export function setMatchCount(count: MatchCount = DEFAULT_GAME_COUNT): void {
  void persistence.set(SAVE_GROUP_OPTION, SAVE_NAME_COUNT, count).catch((error: unknown) => {
    logger.warn('[Persistence] Failed to save game match count:', error); // don't i18n
  });
}
