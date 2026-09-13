// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

export function addTrailingSlash(s: string): string {
  return s.length > 0 && s.charCodeAt(s.length - 1) === 47 ? s : `${s}/`;
}
