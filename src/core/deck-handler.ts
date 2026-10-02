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

/* ----- Singletons ----- */
let gameDeck: Promise<string> | null = null;
let deckBack: Promise<string> | null = null;
let tenCard: Promise<TenCard> | null = null;
let courtCardPoints: Promise<CourtCardPoints> | null = null;

export function resetCardCache(): void {
  // reset the singletons
  gameDeck = null;
  deckBack = null;
  tenCard = null;
  courtCardPoints = null;
}

/** Resolves the currently selected game deck folder from persisted settings. */
export function getGameDeckName(fallback_or_default: string = DEFAULT_GAME_DECK_NAME): Promise<string> {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_GAME_DECK, fallback_or_default );
}

export function setGameDeckName(name: string = DEFAULT_GAME_DECK_NAME): void {
  void persistence.set(SAVE_GROUP_OPTION, SAVE_GAME_DECK, name).catch((error: unknown) => {
    logger.warn('[Persistence] Failed to save game deck:', error); // don't i18n
  });
}

/** Resolves the currently selected ten-point-card face variant from persisted settings. */
export function getTenCard(fallback_or_default: TenCard = DEFAULT_TEN_CARD): Promise<TenCard> {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_TEN_CARD, fallback_or_default );
}

export function setTenCard(ten: TenCard = DEFAULT_TEN_CARD): void {
  void persistence.set(SAVE_GROUP_OPTION, SAVE_TEN_CARD, ten).catch((error: unknown) => {
    logger.warn('[Persistence] Failed to save ten card:', error); // don't i18n
  });
}


/** Resolves the currently selected court-card point variant from persisted settings. */
export function getCourtCardPoints(fallback_or_default: CourtCardPoints = DEFAULT_COURT_CARD_POINTS): Promise<CourtCardPoints> {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_COURT_CARD_POINTS, fallback_or_default );
}

export function setCourtCardPoints(points: CourtCardPoints = DEFAULT_COURT_CARD_POINTS): void {
  void persistence.set(SAVE_GROUP_OPTION, SAVE_COURT_CARD_POINTS, points).catch((error: unknown) => {
    logger.warn('[Persistence] Failed to save court card points:', error); // don't i18n
  });
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

/** Resolves the currently selected card back for the active game deck from persisted settings.
 * Card backs are remembered per deck, under a compounded key (e.g. "card-back-gilded"), so switching
 * decks and back restores each deck's own last pick instead of sharing one back across all decks.
 */
export async function getCardBack(
  fallback_or_default: string = DEFAULT_CARD_BACK, 
  deck: string | null = null,
): Promise<string> {
  const currentDeckName = deck ?? await getGameDeckName();
  return persistence.get( SAVE_GROUP_OPTION,  `${SAVE_CARD_BACK}-${currentDeckName}`,  fallback_or_default );
}

export async function setCardBack(
  back: string = DEFAULT_CARD_BACK,
  deck: string | null = null,
): Promise<void> {
  try {
    const currentDeckName = deck ?? await getGameDeckName();
    await persistence.set(SAVE_GROUP_OPTION, `${SAVE_CARD_BACK}-${currentDeckName}`, back);
  } catch (error: unknown) {
    logger.warn('[Persistence] Failed to save card back:', error); // don't i18n
  }
}

export function getTableColor(fallback_or_default: string = DEFAULT_TABLE_COLOR): Promise<string> {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_TABLE_COLOR, fallback_or_default );
}

export function setTableColor(color: string = DEFAULT_TABLE_COLOR): void {
  void persistence.set(SAVE_GROUP_OPTION, SAVE_TABLE_COLOR, color).catch((error: unknown) => {
    logger.warn('[Persistence] Failed to save table color:', error); // don't i18n
  });
}

export function getTableTexture(fallback_or_default: TableTexture = DEFAULT_TABLE_TEXTURE): Promise<TableTexture> {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_TABLE_TEXTURE, fallback_or_default );
}

export function setTableTexture(texture: TableTexture = DEFAULT_TABLE_TEXTURE): void {
  void persistence.set(SAVE_GROUP_OPTION, SAVE_TABLE_TEXTURE, texture).catch((error: unknown) => {
    logger.warn('[Persistence] Failed to save table texture:', error); // don't i18n
  });
}

export function getScoreKeeping(fallback_or_default: ScoreKeeping = DEFAULT_SCORE_KEEPING): Promise<ScoreKeeping> {
  return persistence.get( SAVE_GROUP_OPTION, SAVE_SCORE_KEEPING, fallback_or_default );
}

export function setScoreKeeping(scoreKeeping: ScoreKeeping = DEFAULT_SCORE_KEEPING): void {
  void persistence.set(SAVE_GROUP_OPTION, SAVE_SCORE_KEEPING, scoreKeeping).catch((error: unknown) => {
    logger.warn('[Persistence] Failed to save score keeping:', error); // don't i18n
  });
}

/** Reports whether a letter is a Digital Deck identifier used by this game (8, 9, 10 and Jokers are excluded). */
function isCardDeckLetter(letter: string): letter is keyof typeof CardDeckFileName {
  return letter in CardDeckFileName;
}

/** Resolves a stable game-card identifier to its configured face image. */
export async function getCardFaceUrl(letter: string): Promise<string> {
  let resolvedLetter = letter;

  // Step 1: Apply the selected ten-point-card face variant, if needed.
  const selectedTenCard = await (tenCard ??= getTenCard());
  if (selectedTenCard === TEN_CARD_THREE && resolvedLetter in CardDeckTenThree) {
    resolvedLetter = CardDeckTenThree[resolvedLetter as keyof typeof CardDeckTenThree];
  } else if (selectedTenCard === TEN_CARD_TEN && resolvedLetter in CardDeckTenTen) {
    resolvedLetter = CardDeckTenTen[resolvedLetter as keyof typeof CardDeckTenTen];
  }

  // Step 2: Apply the selected court-card point variant, swapping Jack and Queen faces, if needed.
  const selectedCourtCardPoints = await (courtCardPoints ??= getCourtCardPoints());
  if (selectedCourtCardPoints === COURT_CARD_POINTS_J2Q3 && resolvedLetter in CardDeckJackQueen) {
    resolvedLetter = CardDeckJackQueen[resolvedLetter as keyof typeof CardDeckJackQueen];
  }

  // Step 3: Resolve the final letter to its deck file name.
  if (!isCardDeckLetter(resolvedLetter)) throw new Error(`Unknown card identifier: ${letter}`);
  const selectedGameDeckName = await (gameDeck ??= getGameDeckName());
  const fileName = CardDeckFileName[resolvedLetter];
  return `${addTrailingSlash(APP_DECKS_PATHS)}${encodeURIComponent(selectedGameDeckName)}/${fileName}.png`;
}

/** Resolves the configured card back image for the active game deck. */
export async function getBackFaceUrl(): Promise<string> {
  const selectedGameDeckName = await (gameDeck ??= getGameDeckName(DEFAULT_GAME_DECK_NAME));
  const selectedDeckBack = await (deckBack ??= getCardBack(DEFAULT_CARD_BACK, selectedGameDeckName));
  return `${addTrailingSlash(APP_DECKS_PATHS)}${encodeURIComponent(selectedGameDeckName)}/${selectedDeckBack}.png`;
}

/** Resolves a stable game-card identifier to its Bisca point value. */
export function getCardValue(letter: string): number {
  if (!isCardDeckLetter(letter)) throw new Error(`Unknown card identifier: ${letter}`);

  const value = CardDeckValuePoints[letter];
  if (value < 0) throw new Error(`Card identifier is not a playable card: ${letter}`);

  return value;
}
