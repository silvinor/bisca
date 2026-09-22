// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { CSSProperties, ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface TextProps {
  children: ReactNode;
  leading?: ReactNode;
  accessibilityLabel?: string;
  webCss?: string;
  webStyle?: CSSProperties;
  nativeStyle?: StyleProp<TextStyle>;
  nativeContainerStyle?: StyleProp<ViewStyle>;
}
