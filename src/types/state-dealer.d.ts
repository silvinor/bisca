// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { type GameMode } from "./game-state.d";

export enum SELECT_DEALER {
  INIT,
  USER_PICKING,
  COMPUTER_PICKING,
  EVAL,
  // EQUAL_HIGHEST,
  // USER_HIGHEST,
  // COMPUTER_HIGHEST,
  START_PICK_2,
  USER_PICK_2,
  COMPUTER_PICK_2,
  DISCARD_2,
  END,
};

export interface S {
  deck: string; // full deck string
  mode: GameMode; // current game mode
  picks: number[]; // picked cards from deck
  dealer: number; // winning dealer
  twos: string; // deck of two-face cards
  twop: number; // picked two-face card
}
