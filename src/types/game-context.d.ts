// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { GameMode, Difficulty } from "./game-state";

/** boardgame.io-shaped game state. Kept as a module singleton until the real boardgame.io Client wiring lands. */
export interface G {
  mode: GameMode; // game mode in play
  difficulty: Difficulty; // game difficulty (bot selector) in play
  matchCnt: 1 | 2 | 3 | 4; // how many games to play, not a count or a set
  deck: string; // the card deck in cutting, and on the table as unplayed
  hand: string[]; // each players hands (cannot be seen by bots)
  won: string[]; // each players won cards (can be "remembered" by bots)
  dealer: number; // player who is dealer
  discard: string; // cards removed from deck - mode 4, the picked 2-card

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
