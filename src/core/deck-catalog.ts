// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { MAX_CARD_BACKS } from './constants';

/** One selectable game deck as listed for the Settings screen. */
export interface DeckCatalogEntry {
  id: string;
  label: string;
  description: string;
  backs: number;
}

type DeckCatalogDetails = Pick<DeckCatalogEntry, 'label' | 'description' | 'backs'>;

const DECK_ASSET_BASE = `${import.meta.env.BASE_URL}assets/img/decks/`;

/** Reports whether a deck's own index.json carries a usable label, description, and back count. */
function isDeckCatalogDetails(value: unknown): value is DeckCatalogDetails {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.label === 'string' && entry.label.trim().length > 0
    && typeof entry.description === 'string' && entry.description.trim().length > 0
    && typeof entry.backs === 'number' && Number.isInteger(entry.backs)
    && entry.backs >= 1 && entry.backs <= MAX_CARD_BACKS;
}

/** Reports whether a value is safe to use as a deck folder name (non-empty, no path traversal or control characters). */
function isDeckId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
    && value !== '.' && value !== '..' && !/[\/\\\u0000-\u001f\u007f]/.test(value);
}

/** Reports whether the top-level catalog index.json is a non-empty list of distinct deck ids. */
function isDeckList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0
    && value.every(isDeckId) && new Set(value).size === value.length;
}

/** Reports whether a value carries the optional pixel dimensions a deck's index.json may declare for its card faces. */
function isDeckCardSize(value: unknown): value is { width: number; height: number } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const size = value as Record<string, unknown>;
  return typeof size.width === 'number' && Number.isFinite(size.width) && size.width > 0
    && typeof size.height === 'number' && Number.isFinite(size.height) && size.height > 0;
}

/** Fetches the list of available decks and each deck's own details for the Settings screen. */
export async function loadDeckCatalog(signal?: AbortSignal): Promise<DeckCatalogEntry[]> {
  // Step 1: Fetch and validate the top-level list of deck ids.
  const response = await fetch(`${DECK_ASSET_BASE}index.json`, { signal });
  if (!response.ok) throw new Error(`Deck catalog request failed: ${response.status}`);
  const deckIds: unknown = await response.json();
  if (!isDeckList(deckIds)) {
    throw new Error('Deck catalog is empty or invalid');
  }

  // Step 2: Fetch and validate each deck's own details in parallel.
  return Promise.all(deckIds.map(async (id) => {
    const detailsResponse = await fetch(`${DECK_ASSET_BASE}${encodeURIComponent(id)}/index.json`, { signal });
    if (!detailsResponse.ok) throw new Error(`Deck details request failed for ${id}: ${detailsResponse.status}`);
    const details: unknown = await detailsResponse.json();
    if (!isDeckCatalogDetails(details)) throw new Error(`Deck details are invalid for ${id}`);
    return { id, label: details.label, description: details.description, backs: details.backs };
  }));
}

/** Resolves a deck's declared card-face aspect ratio from its own index.json, or null if it declares none. */
export async function loadDeckCardAspectRatio(id: string, signal?: AbortSignal): Promise<number | null> {
  try {
    const response = await fetch(`${DECK_ASSET_BASE}${encodeURIComponent(id)}/index.json`, { signal });
    if (!response.ok) return null;
    const details: unknown = await response.json();
    return isDeckCardSize(details) ? details.width / details.height : null;
  } catch {
    return null;
  }
}

/** Builds the preview image URL shown for a deck in the deck-selection list. */
export function deckPreviewUrl(id: string): string {
  return `${DECK_ASSET_BASE}${encodeURIComponent(id)}.png `;
}

/** Builds the image URL for one of a deck's selectable card backs. */
export function deckBackUrl(deckId: string, cardBack: string): string {
  return `${DECK_ASSET_BASE}${encodeURIComponent(deckId)}/${cardBack}.png`;
}
