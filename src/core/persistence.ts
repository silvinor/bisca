// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import {
  P_APP_KEY
} from './constants';

export class Persistence {
  private open(group: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(P_APP_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;

        if (database.objectStoreNames.contains(group)) {
          resolve(database);
          return;
        }

        const version = database.version + 1;
        database.close();

        const upgrade = indexedDB.open(P_APP_KEY, version);
        upgrade.onerror = () => reject(upgrade.error);
        upgrade.onupgradeneeded = () => upgrade.result.createObjectStore(group);
        upgrade.onsuccess = () => resolve(upgrade.result);
      };
    });
  }

  public async get(group: string, name: string, defaultValue = ''): Promise<string> {
    const database = await this.open(group);

    return new Promise((resolve, reject) => {
      const request = database.transaction(group).objectStore(group).get(name);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        database.close();
        resolve(typeof request.result === 'string' ? request.result : defaultValue);
      };
    });
  }

  public async set(group: string, name: string, value: string): Promise<void> {
    const database = await this.open(group);

    return new Promise((resolve, reject) => {
      const request = database.transaction(group, 'readwrite').objectStore(group).put(value, name);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        database.close();
        resolve();
      };
    });
  }
}

export const persistence = new Persistence();
