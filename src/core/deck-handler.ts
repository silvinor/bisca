// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { 
  DEFAULT_CARD_BACK, 
  DEFAULT_COURT_CARD_POINTS, 
  DEFAULT_GAME_DECK_NAME, 
  DEFAULT_TEN_CARD,
  SAVE_GAME_DECK,
  SAVE_GROUP_OPTION,
  SAVE_TEN_CARD,
  SAVE_COURT_CARD_POINTS,
  SAVE_CARD_BACK,
  SAVE_TABLE_COLOR,
  SAVE_TABLE_TEXTURE,
  SAVE_SCORE_KEEPING,
  APP_DECKS_PATHS,
  DEFAULT_TABLE_COLOR,
  DEFAULT_TABLE_TEXTURE,
  DEFAULT_SCORE_KEEPING,
} from './constants';
import { 
  TEN_CARD_THREE,
  TEN_CARD_TEN,
  COURT_CARD_POINTS_J2Q3,
} from '../types/game-state.d';
import { persistence } from './persistence';
import { addTrailingSlash } from './f';
import { 
  type TenCard,
  type CourtCardPoints,
  type TableTexture,
  type ScoreKeeping,
} from '../types/game-state.d';
import { logger } from './logger';
import { applyGameDeckClass } from './dynamic-css';

/** Maps a Digital Deck card identifier to its card-deck file name suffix. See docs/card-deck-numbering.md. */
enum CardDeckFileName {
  A = '01',  // Ace ♠️
  B = '02',  // 2 ♠️
  C = '03',  // 3 ♠️
  D = '04',  // 4 ♠️
  E = '05',  // 5 ♠️
  F = '06',  // 6 ♠️
  G = '07',  // 7 ♠️
  J = '10',  // 10 ♠️
  K = '11',  // J ♠️
  L = '12',  // Q ♠️
  M = '13',  // K ♠️
  a = '14',  // Ace ♥️
  b = '15',  // 2 ♥️
  c = '16',  // 3 ♥️
  d = '17',  // 4 ♥️
  e = '18',  // 5 ♥️
  f = '19',  // 6 ♥️
  g = '20',  // 7 ♥️
  j = '23',  // 10 ♥️
  k = '24',  // J ♥️
  l = '25',  // Q ♥️
  m = '26',  // K ♥️
  N = '27',  // Ace ♣️
  O = '28',  // 2 ♣️
  P = '29',  // 3 ♣️
  Q = '30',  // 4 ♣️
  R = '31',  // 5 ♣️
  S = '32',  // 6 ♣️
  T = '33',  // 7 ♣️
  W = '36',  // 10 ♣️
  X = '37',  // J ♣️
  Y = '38',  // Q ♣️
  Z = '39',  // K ♣️
  n = '40',  // Ace ♦️
  o = '41',  // 2 ♦️
  p = '42',  // 3 ♦️
  q = '43',  // 4 ♦️
  r = '44',  // 5 ♦️
  s = '45',  // 6 ♦️
  t = '46',  // 7 ♦️
  w = '49',  // 10 ♦️
  x = '50',  // J ♦️
  y = '51',  // Q ♦️
  z = '52',  // K ♦️
}

/** Maps a Digital Deck card identifier to its Bisca play-points. See docs/card-deck-numbering.md.
 *  *Note:* unlike getCardFaceUrl, this doesn't apply the tenCard/courtCardPoints letter swaps — those variants
 *  only change which face image is shown, not the card's actual point value (a engine "Jack" is still worth
 *  3 points whether it's drawn with a Jack or Queen face).
*/
enum CardDeckValuePoints {
  A = 11,  // Ace ♠️
  B = 0.02,  // 2 ♠️
  C = 0.03,  // 3 ♠️
  D = 0.04,  // 4 ♠️
  E = 0.05,  // 5 ♠️
  F = 0.06,  // 6 ♠️
  G = 10,  // 7 ♠️
  K = 3,  // J ♠️
  L = 2,  // Q ♠️
  M = 4,  // K ♠️
  a = 11,  // Ace ♥️
  b = 0.02,  // 2 ♥️
  c = 0.03,  // 3 ♥️
  d = 0.04,  // 4 ♥️
  e = 0.05,  // 5 ♥️
  f = 0.06,  // 6 ♥️
  g = 10,  // 7 ♥️
  k = 3,  // J ♥️
  l = 2,  // Q ♥️
  m = 4,  // K ♥️
  N = 11,  // Ace ♣️
  O = 0.02,  // 2 ♣️
  P = 0.03,  // 3 ♣️
  Q = 0.04,  // 4 ♣️
  R = 0.05,  // 5 ♣️
  S = 0.06,  // 6 ♣️
  T = 10,  // 7 ♣️
  X = 3,  // J ♣️
  Y = 2,  // Q ♣️
  Z = 4,  // K ♣️
  n = 11,  // Ace ♦️
  o = 0.02,  // 2 ♦️
  p = 0.03,  // 3 ♦️
  q = 0.04,  // 4 ♦️
  r = 0.05,  // 5 ♦️
  s = 0.06,  // 6 ♦️
  t = 10,  // 7 ♦️
  x = 3,  // J ♦️
  y = 2,  // Q ♦️
  z = 4,  // K ♦️
  J = -1,  // 10 ♠️, not used
  j = -1,  // 10 ♥️, not used
  W = -1,  // 10 ♣️, not used
  w = -1,  // 10 ♦️, not used
}

/** Letters to swap when TenCard.THREE is selected: the 10-point card is depicted by the 3 face instead of the 7 face (Italo-Spanish).
 *  We're swapping the face rendered instead of changing the positional value so that the engine does not need to perform value
 *  swapping in game play.
 */
enum CardsTenThreeSwap {
  C = 'G',
  G = 'C',
  c = 'g',
  g = 'c',
  P = 'T',
  T = 'P',
  p = 't',
  t = 'p',
}

/** Letters to swap when TenCard.TEN is selected: the 10-point card is depicted by a literal 10 face instead of the 7 face. */
enum CardsTenTenSwap {
  G = 'J',
  g = 'j',
  T = 'W',
  t = 'w',
}

/** Letters to swap when CourtCardPoints.JACK_TWO_QUEEN_THREE is selected: Jack and Queen faces trade places (Anglo-French). */
enum CardsJackQueenSwap {
  K = 'L',
  L = 'K',
  k = 'l',
  l = 'k',
  X = 'Y',
  Y = 'X',
  x = 'y',
  y = 'x',
};

/* Card Suite list where S=♠️, H=♥️, C=♣️ & D=♦️ */
enum CardDeckSuits {
  S = 'ABCDEFGKLM',
  H = 'abcdefgklm',
  C = 'NOPQRSTXYZ',
  D = 'nopqrstxyz',
}

/* ----- Singletons ----- */
let _gameDeck: string | null = null;
let _deckBack: string | null = null;
let _tenCard: TenCard | null = null;
let _courtCardPoints: CourtCardPoints | null = null;

export function resetCardCache(): void {
  // reset the singletons
  _gameDeck = null;
  _deckBack = null;
  _tenCard = null;
  _courtCardPoints = null;
}

/** Resolves the currently selected game deck folder from persisted settings. */
export function getGameDeckName(fallback_or_default: string = DEFAULT_GAME_DECK_NAME): string {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_GAME_DECK, fallback_or_default );
}

export function setGameDeckName(name: string = DEFAULT_GAME_DECK_NAME): void {
  persistence.set( SAVE_GROUP_OPTION, SAVE_GAME_DECK, name );
  applyGameDeckClass( name );
}

/** Resolves the currently selected ten-point-card face variant from persisted settings. */
export function getTenCard(fallback_or_default: TenCard = DEFAULT_TEN_CARD): TenCard {
  _tenCard = persistence.get( SAVE_GROUP_OPTION, SAVE_TEN_CARD, fallback_or_default ) as TenCard;
  return _tenCard;
}

export function setTenCard(ten: TenCard = DEFAULT_TEN_CARD): void {
  persistence.set( SAVE_GROUP_OPTION, SAVE_TEN_CARD, ten );
  _tenCard = ten;
}

/** Resolves the currently selected court-card point variant from persisted settings. */
export function getCourtCardPoints(fallback_or_default: CourtCardPoints = DEFAULT_COURT_CARD_POINTS): CourtCardPoints {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_COURT_CARD_POINTS, fallback_or_default );
}

export function setCourtCardPoints(points: CourtCardPoints = DEFAULT_COURT_CARD_POINTS): void {
  persistence.set(SAVE_GROUP_OPTION, SAVE_COURT_CARD_POINTS, points);
}

// /** Shape read from persisted settings to resolve the selected back per game deck. */
// interface CardBackSettings {
//   cardBacks: Record<string, string>;
// }

// /** Reports whether a persisted settings value carries a usable cardBacks map. */
// function isCardBackSettings(value: unknown): value is CardBackSettings {
//   if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
//   const settings = value as Record<string, unknown>;
//   const cardBacks = settings.cardBacks;
//   return typeof cardBacks === 'object' && cardBacks !== null && !Array.isArray(cardBacks)
//     && Object.values(cardBacks).every((back) => typeof back === 'string' && back.trim().length > 0);
// }

/* ---------- Persistence ---------- */

/** Resolves the currently selected card back for the active game deck from persisted settings.
 * Card backs are remembered per deck, under a compounded key (e.g. "back.gilded"), so switching
 * decks and back restores each deck's own last pick instead of sharing one back across all decks.
 */
export function getCardBack(
  fallback_or_default: string = DEFAULT_CARD_BACK, 
  deck: string | null = null,
): string {
  const currentDeckName = deck ?? getGameDeckName();
  return persistence.get( SAVE_GROUP_OPTION,  `${SAVE_CARD_BACK}.${currentDeckName}`,  fallback_or_default );
}

export function setCardBack(
  back: string = DEFAULT_CARD_BACK,
  deck: string | null = null,
): void {
  try {
    const currentDeckName = deck ?? getGameDeckName();
    persistence.set(SAVE_GROUP_OPTION, `${SAVE_CARD_BACK}-${currentDeckName}`, back);
  } catch (error: unknown) {
    logger.warn('[Persistence] Failed to save card back:', error); // don't i18n
  }
}

export function getTableColor(fallback_or_default: string = DEFAULT_TABLE_COLOR): string {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_TABLE_COLOR, fallback_or_default );
}

export function setTableColor(color: string = DEFAULT_TABLE_COLOR): void {
  persistence.set( SAVE_GROUP_OPTION, SAVE_TABLE_COLOR, color );
}

export function getTableTexture(fallback_or_default: TableTexture = DEFAULT_TABLE_TEXTURE): TableTexture {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_TABLE_TEXTURE, fallback_or_default );
}

export function setTableTexture(texture: TableTexture = DEFAULT_TABLE_TEXTURE): void {
  persistence.set( SAVE_GROUP_OPTION, SAVE_TABLE_TEXTURE, texture );
}

export function getScoreKeeping(fallback_or_default: ScoreKeeping = DEFAULT_SCORE_KEEPING): ScoreKeeping {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_SCORE_KEEPING, fallback_or_default );
}

export function setScoreKeeping(scoreKeeping: ScoreKeeping = DEFAULT_SCORE_KEEPING): void {
  persistence.set( SAVE_GROUP_OPTION, SAVE_SCORE_KEEPING, scoreKeeping );
}

/* ---------- Validation ---------- */

/** Reports whether a letter is a Digital Deck identifier used by this game (8, 9, 10 and Jokers are excluded). */
function isCardDeckLetter(letter: string): letter is keyof typeof CardDeckFileName {
  return letter in CardDeckFileName;
}

/* ---------- UI Helpers ---------- */

/** Resolves a stable game-card identifier to its configured face image. */
export function getCardFaceUrl(letter: string): string {
  let resolvedLetter = letter;

  // Step 1: Apply the selected ten-point-card face variant, if needed.
  const cachedTenCard: TenCard = (_tenCard ??= getTenCard());
  if (cachedTenCard === TEN_CARD_THREE && resolvedLetter in CardsTenThreeSwap) {
    resolvedLetter = CardsTenThreeSwap[resolvedLetter as keyof typeof CardsTenThreeSwap];
  } else if (cachedTenCard === TEN_CARD_TEN && resolvedLetter in CardsTenTenSwap) {
    resolvedLetter = CardsTenTenSwap[resolvedLetter as keyof typeof CardsTenTenSwap];
  }

  // Step 2: Apply the selected court-card point variant, swapping Jack and Queen faces, if needed.
  const cachedCourtCardPoints: CourtCardPoints = (_courtCardPoints ??= getCourtCardPoints());
  if (cachedCourtCardPoints === COURT_CARD_POINTS_J2Q3 && resolvedLetter in CardsJackQueenSwap) {
    resolvedLetter = CardsJackQueenSwap[resolvedLetter as keyof typeof CardsJackQueenSwap];
  }

  // Step 3: Resolve the final letter to its deck file name.
  if (!isCardDeckLetter(resolvedLetter)) throw new Error(`Unknown card identifier: ${letter}`);
  const cachedGameDeckName: string = (_gameDeck ??= getGameDeckName());
  const fileName = CardDeckFileName[resolvedLetter];
  return `${addTrailingSlash(APP_DECKS_PATHS)}${encodeURIComponent(cachedGameDeckName)}/${fileName}.png`;
}

/** Resolves the configured card back image for the active game deck. */
export function getBackFaceUrl(): string {
  const cachedGameDeckName = (_gameDeck ??= getGameDeckName(DEFAULT_GAME_DECK_NAME));
  const cachedDeckBack = (_deckBack ??= getCardBack( DEFAULT_CARD_BACK, cachedGameDeckName ));
  return `${addTrailingSlash(APP_DECKS_PATHS)}${encodeURIComponent(cachedGameDeckName)}/${cachedDeckBack}.png`;
}

/* ---------- Game Engine Evaluation ---------- */

/** Resolves a stable game-card identifier to its Bisca point value. */
export function getCardValue(letter: string): number {
  if (!isCardDeckLetter(letter)) throw new Error(`Unknown card identifier: ${letter}`);

  let value: number = CardDeckValuePoints[letter];
  if (value < 0) throw new Error(`Card identifier is not a playable card: ${letter}`);

  // Special case for 3-card is Value 10 scenarios in Briscola/Brisca scoring method.
  if (value == 0.03) {
    const cachedTenCard: TenCard = (_tenCard ??= getTenCard());
    if (cachedTenCard === TEN_CARD_THREE) {
       value = 0.07;
    }
  }

  return value;
}

/** Resolves a stable game-card identifier to its suit key in CardDeckSuits (S=♠️, H=♥️, C=♣️, D=♦️). */
function getCardSuit(letter: string): keyof typeof CardDeckSuits {
  const suit = (Object.keys(CardDeckSuits) as (keyof typeof CardDeckSuits)[])
    .find((key) => CardDeckSuits[key].includes(letter));
  if (suit === undefined) throw new Error(`Card identifier has no playable suit: ${letter}`);
  return suit;
}

/** Decides which player wins a trick (one card from each player, on the table).
 *
 *  `trick[i]` is the card played by player `i`, so the array index is the player index, not the play order.
 *  Every entry must be a playable card. Card strength comes from CardDeckValuePoints: the zero-point cards
 *  carry small fractions (0.02 for the 2 up to 0.06 for the 6), so a higher value is always a stronger card
 *  (A 7 K J Q 6 5 4 3 2), and two cards have the same value only when they have the same face.
 *
 *  The function has two modes:
 *
 *  1. Trump mode (`trump` is a card identifier, normally the trump indicator card, and `leader` is a player
 *     index). The suit of the trump card is the trump suit. The rules from public/help.en.md ("The play") apply:
 *     - If any trumps were played, the highest trump wins.
 *     - Otherwise the highest card of the suit that was led wins. The led suit is the suit of `trick[leader]`.
 *     - A non-trump card of a different suit from the led suit cannot win.
 *     A trick holds distinct cards, so exactly one card can win. The result is that card's player index.
 *
 *  2. Value mode (`trump` is null and/or `leader` is -1, for example when players pick a card to choose the
 *     dealer, where there is no trump and nobody leads). Suits do not matter: the highest card value wins. If two or more players share the highest value (for example the
 *     7 of hearts and the 7 of spades), there is no single winner and the result is -1.
 *
 *  @param trick  The cards on the table, indexed by player.
 *  @param trump  The trump card identifier, or null for value mode.
 *  @param leader The player index who led the trick, or -1 (no leader) for value mode.
 *  @returns      The winning player index, or -1 for a tie in value mode.
 */
export function getTrickWinner(trick: string[], trump: string | null = null, leader: number = -1): number {
  // Step 1: Read every card value once. getCardValue throws on an unknown or unused card (8, 9, 10, Jokers),
  // so an invalid trick fails here instead of producing a wrong winner.
  if (trick.length === 0) throw new Error('Cannot evaluate an empty trick');
  const values = trick.map(getCardValue);

  // Step 2 (value mode): Without a trump and/or without a leader, find the highest value and count how many players hold it.
  // One holder is the winner. More than one holder is a tie, which the caller resolves (for example a redraw).
  if (trump === null || leader === -1) {
    const highest = Math.max(...values);
    const holders = values.filter((value) => value === highest).length;
    return holders === 1 ? values.indexOf(highest) : -1;
  }

  // Step 3 (trump mode): Resolve the trump suit from the trump card, and the led suit from the leader's card.
  if (!Number.isInteger(leader) || leader < 0 || leader >= trick.length) {
    throw new Error(`Trick leader is not a player in the trick: ${leader}`);
  }
  getCardValue(trump); // validates the trump card identifier
  const trumpSuit = getCardSuit(trump);
  const suits = trick.map(getCardSuit);
  const ledSuit = suits[leader];

  // Step 4: Choose the suit that can win. Any trump on the table beats the led suit. Without a trump, only the
  // led suit can win. Cards of every other suit drop out here, which is the "off-suit cannot win" rule.
  const winningSuit = suits.includes(trumpSuit) ? trumpSuit : ledSuit;

  // Step 5: The highest value inside the winning suit takes the trick. The leader's card is always a candidate
  // when no trump was played, so a winner always exists. Values are unique inside a suit, so there is no tie.
  let winner = -1;
  for (let player = 0; player < trick.length; player++) {
    if (suits[player] !== winningSuit) continue;
    if (winner === -1 || values[player] > values[winner]) winner = player;
  }
  return winner;
}
