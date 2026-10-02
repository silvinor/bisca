// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

const PERSISTENCE_PREFIX = 'bisca';

export class Persistence {
  public get(group: string, name: string, defaultValue = ''): string {
    return localStorage.getItem(`${PERSISTENCE_PREFIX}.${group}.${name}`) ?? defaultValue;
  }

  public set(group: string, name: string, value: string): void {
    localStorage.setItem(`${PERSISTENCE_PREFIX}.${group}.${name}`, value);
  }
}

export const persistence = new Persistence();
