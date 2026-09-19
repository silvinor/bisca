// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { CourtCardPoints, DEFAULT_CARD_BACK, DEFAULT_COURT_CARD_POINTS, DEFAULT_GAME_DECK, DEFAULT_TEN_CARD, PERSISTENCE_SETTINGS, TenCard } from './constants';
import { persistenceEngine } from './persistence-engine';

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
 *  *Note:* unlike getCardFace, this doesn't apply the tenCard/courtCardPoints letter swaps — those variants
 *  only change which face image is shown, not the card's actual point value (a engine "Jack" is still worth
 *  3 points whether it's drawn with a Jack or Queen face).
*/
enum CardDeckValuePoints {
  A = 11,  // Ace ♠️
  B = 0,  // 2 ♠️
  C = 0,  // 3 ♠️
  D = 0,  // 4 ♠️
  E = 0,  // 5 ♠️
  F = 0,  // 6 ♠️
  G = 10,  // 7 ♠️
  K = 3,  // J ♠️
  L = 2,  // Q ♠️
  M = 4,  // K ♠️
  a = 11,  // Ace ♥️
  b = 0,  // 2 ♥️
  c = 0,  // 3 ♥️
  d = 0,  // 4 ♥️
  e = 0,  // 5 ♥️
  f = 0,  // 6 ♥️
  g = 10,  // 7 ♥️
  k = 3,  // J ♥️
  l = 2,  // Q ♥️
  m = 4,  // K ♥️
  N = 11,  // Ace ♣️
  O = 0,  // 2 ♣️
  P = 0,  // 3 ♣️
  Q = 0,  // 4 ♣️
  R = 0,  // 5 ♣️
  S = 0,  // 6 ♣️
  T = 10,  // 7 ♣️
  X = 3,  // J ♣️
  Y = 2,  // Q ♣️
  Z = 4,  // K ♣️
  n = 11,  // Ace ♦️
  o = 0,  // 2 ♦️
  p = 0,  // 3 ♦️
  q = 0,  // 4 ♦️
  r = 0,  // 5 ♦️
  s = 0,  // 6 ♦️
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
enum CardDeckTenThree {
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
enum CardDeckTenTen {
  G = 'J',
  g = 'j',
  T = 'W',
  t = 'w',
}

/** Letters to swap when CourtCardPoints.JACK_TWO_QUEEN_THREE is selected: Jack and Queen faces trade places (Anglo-French). */
enum CardDeckJackQueen {
  K = 'L',
  L = 'K',
  k = 'l',
  l = 'k',
  X = 'Y',
  Y = 'X',
  x = 'y',
  y = 'x',
};

/** Shape read from persisted settings to resolve the active game deck. */
interface GameDeckSettings {
  gameDeck: string;
}

/** Reports whether a persisted settings value carries a usable gameDeck field. */
function isGameDeckSettings(value: unknown): value is GameDeckSettings {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const settings = value as Record<string, unknown>;
  return typeof settings.gameDeck === 'string' && settings.gameDeck.trim().length > 0;
}

/** Resolves the currently selected game deck folder from persisted settings. */
export function currentGameDeck(): string {
  const settings = persistenceEngine.load(PERSISTENCE_SETTINGS, isGameDeckSettings);
  return settings?.gameDeck ?? DEFAULT_GAME_DECK;
}

/** Shape read from persisted settings to resolve the active ten-point-card face variant. */
interface TenCardSettings {
  tenCard: TenCard;
}

/** Reports whether a persisted settings value carries a valid tenCard field. */
function isTenCardSettings(value: unknown): value is TenCardSettings {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const settings = value as Record<string, unknown>;
  return settings.tenCard === TenCard.SEVEN
    || settings.tenCard === TenCard.THREE
    || settings.tenCard === TenCard.TEN;
}

/** Resolves the currently selected ten-point-card face variant from persisted settings. */
function currentTenCard(): TenCard {
  const settings = persistenceEngine.load(PERSISTENCE_SETTINGS, isTenCardSettings);
  return settings?.tenCard ?? DEFAULT_TEN_CARD;
}

/** Shape read from persisted settings to resolve the active court-card point variant. */
interface CourtCardPointsSettings {
  courtCardPoints: CourtCardPoints;
}

/** Reports whether a persisted settings value carries a valid courtCardPoints field. */
function isCourtCardPointsSettings(value: unknown): value is CourtCardPointsSettings {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const settings = value as Record<string, unknown>;
  return settings.courtCardPoints === CourtCardPoints.QUEEN_TWO_JACK_THREE
    || settings.courtCardPoints === CourtCardPoints.JACK_TWO_QUEEN_THREE;
}

/** Resolves the currently selected court-card point variant from persisted settings. */
function currentCourtCardPoints(): CourtCardPoints {
  const settings = persistenceEngine.load(PERSISTENCE_SETTINGS, isCourtCardPointsSettings);
  return settings?.courtCardPoints ?? DEFAULT_COURT_CARD_POINTS;
}

/** Shape read from persisted settings to resolve the selected back per game deck. */
interface CardBackSettings {
  cardBacks: Record<string, string>;
}

/** Reports whether a persisted settings value carries a usable cardBacks map. */
function isCardBackSettings(value: unknown): value is CardBackSettings {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const settings = value as Record<string, unknown>;
  const cardBacks = settings.cardBacks;
  return typeof cardBacks === 'object' && cardBacks !== null && !Array.isArray(cardBacks)
    && Object.values(cardBacks).every((back) => typeof back === 'string' && back.trim().length > 0);
}

/** Resolves the currently selected card back for the active game deck from persisted settings. */
function currentCardBack(): string {
  const settings = persistenceEngine.load(PERSISTENCE_SETTINGS, isCardBackSettings);
  return settings?.cardBacks[currentGameDeck()] ?? DEFAULT_CARD_BACK;
}

/** Reports whether a letter is a Digital Deck identifier used by this game (8, 9, 10 and Jokers are excluded). */
function isCardDeckLetter(letter: string): letter is keyof typeof CardDeckFileName {
  return letter in CardDeckFileName;
}

/** Resolves a stable game-card identifier to its configured face image. */
export function getCardFace(letter: string): string {
  let resolvedLetter = letter;

  // Step 1: Apply the selected ten-point-card face variant, if needed.
  const tenCard = currentTenCard();
  if (tenCard === TenCard.THREE && resolvedLetter in CardDeckTenThree) {
    resolvedLetter = CardDeckTenThree[resolvedLetter as keyof typeof CardDeckTenThree];
  } else if (tenCard === TenCard.TEN && resolvedLetter in CardDeckTenTen) {
    resolvedLetter = CardDeckTenTen[resolvedLetter as keyof typeof CardDeckTenTen];
  }

  // Step 2: Apply the selected court-card point variant, swapping Jack and Queen faces, if needed.
  if (currentCourtCardPoints() === CourtCardPoints.JACK_TWO_QUEEN_THREE && resolvedLetter in CardDeckJackQueen) {
    resolvedLetter = CardDeckJackQueen[resolvedLetter as keyof typeof CardDeckJackQueen];
  }

  // Step 3: Resolve the final letter to its deck file name.
  if (!isCardDeckLetter(resolvedLetter)) throw new Error(`Unknown card identifier: ${letter}`);
  const fileName = CardDeckFileName[resolvedLetter];

  return `/assets/img/decks/${encodeURIComponent(currentGameDeck())}/${fileName}.png`;
}

/** Resolves the configured card back image for the active game deck. */
export function getBackFace(): string {
  const fileName = currentCardBack();
  return `/assets/img/decks/${encodeURIComponent(currentGameDeck())}/${fileName}.png`
}

/** Resolves a stable game-card identifier to its Bisca point value. */
export function getCardValue(letter: string): number {
  if (!isCardDeckLetter(letter)) throw new Error(`Unknown card identifier: ${letter}`);

  const value = CardDeckValuePoints[letter];
  if (value < 0) throw new Error(`Card identifier is not a playable card: ${letter}`);

  return value;
}
