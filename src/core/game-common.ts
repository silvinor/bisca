// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import {
  REFRESH_RESET_TIMEOUT,
  SAVE_GROUP_OPTION,
  SAVE_PROGRESS,
  SAVE_PROGRESS_TIMESTAMP,
} from './constants';
import { logger } from './logger';
import { persistence } from './persistence';
import { StateMain } from '../types/game-state.d';
import { 
  type GameMode,
  GAME_MODE_4,
  GAME_MODE_5,
} from '../types/game-state.d';

export function saveGameProgress(progress: StateMain): void {
  void Promise.all([
    persistence.set(SAVE_GROUP_OPTION, SAVE_PROGRESS, progress),
    persistence.set(SAVE_GROUP_OPTION, SAVE_PROGRESS_TIMESTAMP, String(Date.now())),
  ]).catch((error: unknown) => {
    logger.warn('[Persistence] Failed to save game progress:', error);
  });
}

export async function loadGameProgress(): Promise<StateMain | null> {
  try {
    const [progress, savedAt] = await Promise.all([
      persistence.get(SAVE_GROUP_OPTION, SAVE_PROGRESS),
      persistence.get(SAVE_GROUP_OPTION, SAVE_PROGRESS_TIMESTAMP),
    ]);
    const isFresh = Date.now() - Number(savedAt || 0) < REFRESH_RESET_TIMEOUT * 1000;
    return isFresh ? progress as StateMain : null;
  } catch (error: unknown) {
    logger.warn('[Persistence] Failed to load game progress:', error);
    return null;
  }
}

export function random(from: number, to: number): number {
  // return Math.floor(Math.random() * (to - from + 1)) + from;
  const range = to - from + 1;
  const limit = Math.floor(0x1_0000_0000 / range) * range;
  const value = new Uint32Array(1);
  do crypto.getRandomValues(value); while (value[0] >= limit);
  return from + value[0] % range;
}

/**
   * Returns a shuffled copy of an encoded deck string.
   *
   *  The Fisher-Yates algorithm guarantees a statistically uniform shuffle
   *  Every permutation is equally likely - which is why it's preferred over naive random sorting approaches.
   *  crypto.getRandomValues() uses an OS-level entropy source, so the shuffle cannot be replayed.
   */
export function shuffleDeckString(input: string): string {
  const chars = Array.from(input);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(0, i);
    const temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }
  return chars.join('');
}

export function playerCount(mode: GameMode): number {
  if (mode === GAME_MODE_4) return 3;
  if (mode === GAME_MODE_5) return 4;
  return 2;
}
