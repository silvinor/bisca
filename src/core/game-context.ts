// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { 
  type GameMode,
  GAME_MODE_1,
  type Difficulty,
  GAME_DIFFICULTY_NORMAL,
} from '../types/game-state.d';
import { 
  SAVE_GLOBAL, 
  SAVE_GROUP_OPTION,
  DEFAULT_DECK_CARDS,
  UNKNOWN_DEALER,
} from './constants';
import { persistence } from './persistence';
import { logger } from './logger';

// /** boardgame.io player id, e.g. '0', '1'. */
// export type PlayerID = number;

// export interface TrickCard {
//   playerID: PlayerID;
//   card: string; // single Digital Deck character
// }

// export interface ResolvedTrick {
//   cards: TrickCard[];
//   winner: PlayerID;
//   points: number;
// }

// export interface SetResult {
//   scores: Record<PlayerID, number>;
//   winner: PlayerID | 'tie';
//   tricksWon: Record<PlayerID, number>;
// }

// export interface MatchResult {
//   winner: PlayerID | 'tie';
//   setsWon: Record<PlayerID, number>;
// }

/** boardgame.io-shaped game state. Kept as a module singleton until the real boardgame.io Client wiring lands. */
export interface G {
  mode: GameMode;
  difficulty: Difficulty;
  matchCnt: 1 | 2 | 3 | 4;
  deck: string;
  dealer: number;
  
  // matchSetCount: 1 | 2 | 3;
  // setIndex: number;
  // setResults: SetResult[];
  // matchResult: MatchResult | null;

  // dealer: PlayerID;
  // leader: PlayerID;
  // trumpIndicator: string;
  // stock: string;

  // hands: Record<PlayerID, string>;
  // captured: Record<PlayerID, string>;

  // trick: TrickCard[];
  // lastTrick: ResolvedTrick | null;
  // trickNumber: number;
}

/** boardgame.io-shaped turn/phase context. Kept as a module singleton until the real boardgame.io Client wiring lands. */
export interface Ctx {
  // numPlayers: number;
  // currentPlayer: PlayerID;
  // playOrder: PlayerID[];
  // playOrderPos: number;
  // turn: number;
}

function initialG(): G {
  return {
    mode: GAME_MODE_1,
    difficulty: GAME_DIFFICULTY_NORMAL,
    matchCnt: 1,
    deck: DEFAULT_DECK_CARDS,
    dealer: UNKNOWN_DEALER,
    // matchSetCount: 1,
    // setIndex: 0,
    // setResults: [],
    // matchResult: null,

    // dealer: '0',
    // leader: '0',
    // trumpIndicator: '',
    // stock: '',

    // hands: {},
    // captured: {},

    // trick: [],
    // lastTrick: null,
    // trickNumber: 0,

    // dealerSelection: {
    //   pool: '',
    //   picks: [],
    //   revealed: false,
    //   tied: false,
    //   discardPicker: null,
    // },
  };
}

function initialCtx(): Ctx {
  return {
    // numPlayers: 2,
    // currentPlayer: '0',
    // playOrder: ['0', '1'],
    // playOrderPos: 0,
    // turn: 0,
    // phase: 'selectDealer',
  };
}

export function loadG(): G {
  try {
    return JSON.parse(
      persistence.get( SAVE_GROUP_OPTION, SAVE_GLOBAL, JSON.stringify(g) ),
    ) as G;
  } catch (error: unknown) {
    logger.error('[Game context] Failed to load saved state:', error);
    return g;
  }
}

export function saveG(g: G): void {
  persistence.set( SAVE_GROUP_OPTION, SAVE_GLOBAL, JSON.stringify(g) );
}

/** Singleton game state, available from app startup. */
export const g: G = initialG();

/** Singleton turn/phase context, available from app startup. */
export const ctx: Ctx = initialCtx();
