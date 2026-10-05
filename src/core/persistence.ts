// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

const PERSISTENCE_PREFIX = 'bisca';

export class Persistence {
  public get(group: string, name: string, defaultValue?: string): any {
    const value = localStorage.getItem(`${PERSISTENCE_PREFIX}.${group}.${name}`);
    return value === null ? defaultValue ?? null : value;
  }

  public set(group: string, name: string, value: string | null): void {
    if (value === null) {
      localStorage.removeItem(`${PERSISTENCE_PREFIX}.${group}.${name}`);
    } else {
      localStorage.setItem(`${PERSISTENCE_PREFIX}.${group}.${name}`, value);
    }
  }
}

export const persistence = new Persistence();
