// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import {
  PERSISTENCE_STORAGE_PREFIX,
  PERSISTENCE_STORAGE_VERSION,
  type PersistedSection,
} from './constants';

export class PersistanceEngine {
  private getStorage(): Storage | null {
    try {
      return typeof window === 'undefined' ? null : window.localStorage;
    } catch {
      return null;
    }
  }

  private key(section: PersistedSection): string {
    return `${PERSISTENCE_STORAGE_PREFIX}.${section}`;
  }

  save<T>(section: PersistedSection, state: T): boolean {
    try {
      const storage = this.getStorage();
      if (!storage) return false;
      storage.setItem(this.key(section), JSON.stringify({ version: PERSISTENCE_STORAGE_VERSION, state }));
      return true;
    } catch {
      return false;
    }
  }

  load<T>(section: PersistedSection, isValid: (value: unknown) => value is T): T | null {
    try {
      const stored = this.getStorage()?.getItem(this.key(section));
      if (!stored) return null;
      const snapshot: unknown = JSON.parse(stored);
      if (typeof snapshot !== 'object' || snapshot === null) return null;
      if (!('version' in snapshot) || snapshot.version !== PERSISTENCE_STORAGE_VERSION) return null;
      if (!('state' in snapshot) || !isValid(snapshot.state)) return null;
      return snapshot.state;
    } catch {
      return null;
    }
  }

  clear(section: PersistedSection): void {
    try {
      this.getStorage()?.removeItem(this.key(section));
    } catch {
      // Storage can be unavailable or blocked; gameplay must still work.
    }
  }
}

export const persistanceEngine = new PersistanceEngine();
