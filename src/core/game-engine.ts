// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { UNKNOWN_DEALER } from './constants';

export interface GameEngineData {
  currentDealer: number;
  deckInPlay: string;
  playerDecks: string[];
  wonDecks: string[];
}

export function isGameEngineData(value: unknown): value is GameEngineData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  const data = value as Record<string, unknown>;
  return Number.isInteger(data.currentDealer)
    && typeof data.currentDealer === 'number'
    && data.currentDealer >= UNKNOWN_DEALER
    && data.currentDealer <= 3
    && typeof data.deckInPlay === 'string'
    && Array.isArray(data.playerDecks)
    && data.playerDecks.every((deck) => typeof deck === 'string')
    && Array.isArray(data.wonDecks)
    && data.wonDecks.every((deck) => typeof deck === 'string');
}

/**
 * Mutable state and operations for one game.
 *
 * Card collections use the one-character card identifiers documented in
 * docs/card-deck-numbering.md. Each entry in the player arrays belongs to the
 * player with the matching index: player 0 is human and players 1 through 3
 * are computer players.
 *
 * The public data fields are JSON-serializable so the persistence engine can
 * save them. Methods remain on the class and are not included in JSON output.
 */
export class GameEngine {
  /* Game data */

  /** -1 while unknown, 0 for the human, or 1-3 for a computer player. */
  public currentDealer = UNKNOWN_DEALER;

  /** Cards still in the deck, in their current play/draw order. */
  public deckInPlay = '';

  /** Unplayed cards held by each player, indexed by player number. */
  public playerDecks: string[] = [];

  /** Cards won by each player, indexed by player number. */
  public wonDecks: string[] = [];

  public constructor(data?: GameEngineData) {
    if (!data) return;

    this.currentDealer = data.currentDealer;
    this.deckInPlay = data.deckInPlay;
    this.playerDecks = [...data.playerDecks];
    this.wonDecks = [...data.wonDecks];
  }

  /** Returns an independent, JSON-serializable snapshot of this game. */
  public toJSON(): GameEngineData {
    return {
      currentDealer: this.currentDealer,
      deckInPlay: this.deckInPlay,
      playerDecks: [...this.playerDecks],
      wonDecks: [...this.wonDecks],
    };
  }

  /* Deck operations */

  /**
   * Returns a shuffled copy of an encoded deck string.
   *
   *  The Fisher-Yates algorithm guarantees a statistically uniform shuffle
   *  Every permutation is equally likely - which is why it's preferred over naive random sorting approaches.
   *  Math.random() is automatically seeded from an OS-level entropy source -> No way to replay a shuffle.
   */
  public shuffleDeckString(input: string): string {
    const chars = Array.from(input);

    for (let i = chars.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const temp = chars[i];
      chars[i] = chars[j];
      chars[j] = temp;
    }
    
    return chars.join("");
  }
}
