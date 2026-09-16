// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { MAX_CARD_BACKS } from './constants';

export interface DeckCatalogEntry {
  id: string;
  label: string;
  description: string;
  backs: number;
}

type DeckCatalogDetails = Pick<DeckCatalogEntry, 'label' | 'description' | 'backs'>;

const DECK_ASSET_BASE = `${import.meta.env.BASE_URL}assets/img/decks/`;

function isDeckCatalogDetails(value: unknown): value is DeckCatalogDetails {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.label === 'string' && entry.label.trim().length > 0
    && typeof entry.description === 'string' && entry.description.trim().length > 0
    && typeof entry.backs === 'number' && Number.isInteger(entry.backs)
    && entry.backs >= 1 && entry.backs <= MAX_CARD_BACKS;
}

function isDeckId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
    && value !== '.' && value !== '..' && !/[\/\\\u0000-\u001f\u007f]/.test(value);
}

function isDeckList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0
    && value.every(isDeckId) && new Set(value).size === value.length;
}

export async function loadDeckCatalog(signal?: AbortSignal): Promise<DeckCatalogEntry[]> {
  const response = await fetch(`${DECK_ASSET_BASE}index.json`, { signal });
  if (!response.ok) throw new Error(`Deck catalog request failed: ${response.status}`);
  const deckIds: unknown = await response.json();
  if (!isDeckList(deckIds)) {
    throw new Error('Deck catalog is empty or invalid');
  }

  return Promise.all(deckIds.map(async (id) => {
    const detailsResponse = await fetch(`${DECK_ASSET_BASE}${encodeURIComponent(id)}/index.json`, { signal });
    if (!detailsResponse.ok) throw new Error(`Deck details request failed for ${id}: ${detailsResponse.status}`);
    const details: unknown = await detailsResponse.json();
    if (!isDeckCatalogDetails(details)) throw new Error(`Deck details are invalid for ${id}`);
    return { id, label: details.label, description: details.description, backs: details.backs };
  }));
}

export function deckPreviewUrl(id: string): string {
  return `${DECK_ASSET_BASE}${encodeURIComponent(id)}.png `;
}

export function deckBackUrl(deckId: string, cardBack: string): string {
  return `${DECK_ASSET_BASE}${encodeURIComponent(deckId)}/${cardBack}.png`;
}
