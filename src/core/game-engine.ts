// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { DEFAULT_DECK_CARDS, SELECT_DEALER_CARD_COUNT, UNKNOWN_DEALER } from './constants';

export interface GameEngineData {
  currentDealer: number;
  deckInPlay: string;
  dealerSelectionCards: (string | null)[];
  tableDeck: string[];
  playerDecks: string[];
  wonDecks: string[];
}

export enum GameTickAction {
  SELECT_DEALER = 'select-dealer',
}

export function isGameEngineData(value: unknown): value is GameEngineData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  const data = value as Record<string, unknown>;
  return Number.isInteger(data.currentDealer)
    && typeof data.currentDealer === 'number'
    && data.currentDealer >= UNKNOWN_DEALER
    && data.currentDealer <= 3
    && typeof data.deckInPlay === 'string'
    && Array.isArray(data.dealerSelectionCards)
    && data.dealerSelectionCards.every((card) => card === null || typeof card === 'string')
    && Array.isArray(data.tableDeck)
    && data.tableDeck.every((card) => typeof card === 'string')
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

  /** Dealer-selection card values by player: human 0, computers 1-3. */
  public dealerSelectionCards: (string | null)[] = [];

  /** Cards currently visible on the table, indexed by player number. */
  public tableDeck: string[] = [];

  /** Unplayed cards held by each player, indexed by player number. */
  public playerDecks: string[] = [];

  /** Cards won by each player, indexed by player number. */
  public wonDecks: string[] = [];

  public constructor(data?: GameEngineData) {
    if (!data) return;

    this.currentDealer = data.currentDealer;
    this.deckInPlay = data.deckInPlay;
    this.dealerSelectionCards = [...data.dealerSelectionCards];
    this.tableDeck = [...data.tableDeck];
    this.playerDecks = [...data.playerDecks];
    this.wonDecks = [...data.wonDecks];
  }

  /** Returns an independent, JSON-serializable snapshot of this game. */
  public toJSON(): GameEngineData {
    return {
      currentDealer: this.currentDealer,
      deckInPlay: this.deckInPlay,
      dealerSelectionCards: [...this.dealerSelectionCards],
      tableDeck: [...this.tableDeck],
      playerDecks: [...this.playerDecks],
      wonDecks: [...this.wonDecks],
    };
  }

  /* Game loop */

  /** Evaluates persisted game data and performs the next required action. */
  public tick(): GameTickAction {
    // Step 1: A game without a dealer must enter the dealer-selection process.
    if (this.currentDealer === UNKNOWN_DEALER) {
      this.do_select_dealer();
      return GameTickAction.SELECT_DEALER;
    }

    // Every persisted game state will eventually resolve to a defined action.
    throw new Error(`No game action is defined for dealer ${this.currentDealer}.`);
  }

  /** Prepares the complete shuffled deck used to select the first dealer. */
  public do_select_dealer(): void {
    // Step 1: Repeated ticks within this dealer-selection run keep the same
    // in-memory card order, so a picked position cannot change mid-process.
    if (this.deckInPlay) return;

    // Step 2: A fresh dealer selection creates its order without saving it yet.
    this.deckInPlay = this.shuffleDeckString(DEFAULT_DECK_CARDS);
  }

  /** Starts dealer selection again after the highest cards tie. */
  public restartDealerSelection(): void {
    // Step 1: Discard this round's card order and choices without persisting them.
    this.currentDealer = UNKNOWN_DEALER;
    this.deckInPlay = '';
    this.dealerSelectionCards = [];

    // Step 2: Prepare a newly shuffled fan for the next selection round.
    this.do_select_dealer();
  }

  /** Records one player's selected dealer card from a one-based fan position. */
  public selectDealerCard(playerIndex: number, cardIndex: number): string {
    if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex > 3) {
      throw new RangeError(`Invalid dealer-selection player ${playerIndex}.`);
    }

    const card = this.deckInPlay[cardIndex - 1];
    if (!Number.isInteger(cardIndex) || !card) {
      throw new RangeError(`Invalid dealer-selection card ${cardIndex}.`);
    }

    // Keep each player's value at their stable index, including any players
    // whose selections are still pending.
    while (this.dealerSelectionCards.length <= playerIndex) {
      this.dealerSelectionCards.push(null);
    }
    this.dealerSelectionCards[playerIndex] = card;
    return card;
  }

  /** Picks an unused fan position for a computer and records its card. */
  public pickComputerDealerCard(playerIndex: number, random: () => number = Math.random): number {
    if (!Number.isInteger(playerIndex) || playerIndex < 1 || playerIndex > 3) {
      throw new RangeError(`Invalid computer player ${playerIndex}.`);
    }

    // Step 1: Exclude every position already taken by the human or another
    // computer. Choosing from the remaining positions keeps each one equally likely.
    const selectedCards = new Set(this.dealerSelectionCards.filter((card) => card !== null));
    const availablePositions = Array.from(
      { length: Math.min(SELECT_DEALER_CARD_COUNT, this.deckInPlay.length) },
      (_, index) => index + 1,
    ).filter((position) => !selectedCards.has(this.deckInPlay[position - 1]));
    if (availablePositions.length === 0) throw new Error('No dealer-selection cards remain.');

    // Step 2: Record the selected value at this computer's player index and
    // return the one-based fan position for its UI animation.
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
      throw new RangeError('Dealer-selection randomness must be between 0 and 1.');
    }
    const cardIndex = availablePositions[Math.floor(sample * availablePositions.length)];
    this.selectDealerCard(playerIndex, cardIndex);
    return cardIndex;
  }

  /** Removes one card identifier from the deck in play (used by Three-player Bisca's 2-discard). */
  public discardCard(card: string): void {
    const position = this.deckInPlay.indexOf(card);
    if (position === -1) throw new Error(`Card ${card} is not in the deck in play.`);

    this.deckInPlay = this.deckInPlay.slice(0, position) + this.deckInPlay.slice(position + 1);
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
