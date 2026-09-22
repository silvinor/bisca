// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { ColorSchemeName } from 'react-native';

export const startupBackground = '#096';

export const copyrightNoticeStyle = {
  color: '#fff',
  fontSize: 14,
  paddingBottom: 8,
};

export const textIconGap = 4;

export interface Theme {
  background: string;
  text: string;
  buttonBackground: string;
  buttonText: string;
}

// Keep in sync with the prefers-color-scheme rules in scss/main.scss.
export const themes: Record<'light' | 'dark', Theme> = {
  light: {
    background: '#fafafa',
    text: '#111',
    buttonBackground: '#0d6efd',
    buttonText: '#fff',
  },
  dark: {
    background: '#1f1f1f',
    text: '#eee',
    buttonBackground: '#0d6efd',
    buttonText: '#fff',
  },
};

export const buttonMetrics = {
  borderRadius: 6,
  paddingHorizontal: 12,
  paddingVertical: 6,
  fontSize: 16,
};

// Anything other than an explicit 'dark' (including 'light', 'unspecified',
// null, or undefined) falls back to light.
export function getTheme(scheme: ColorSchemeName): Theme {
  return themes[scheme === 'dark' ? 'dark' : 'light'];
}
