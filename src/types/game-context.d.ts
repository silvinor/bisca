// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { GameMode, Difficulty } from "./game-state";

/** boardgame.io-shaped game state. Kept as a module singleton until the real boardgame.io Client wiring lands. */
export interface G {
  mode: GameMode;
  difficulty: Difficulty;
  matchCnt: 1 | 2 | 3 | 4;
  deck: string;
  dealer: number;
  discard: string; // cards removed from deck - mode 4, picked 2

  // matchSetCount: 1 | 2 | 3;
  // setIndex: number;
  // setResults: SetResult[];
  // matchResult: MatchResult | null;

  // leader: PlayerID;
  // trumpIndicator: string;
  // stock: string;

  // hands: Record<PlayerID, string>;
  // captured: Record<PlayerID, string>;

  // trick: TrickCard[];
  // lastTrick: ResolvedTrick | null;
  // trickNumber: number;
}
