// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StyleSheet, Text as NativeText, View } from 'react-native';

import type { TextProps } from '../../core/text-props';
import { textIconGap } from '../../core/theme';

export function Text({ children, leading, accessibilityLabel, nativeStyle, nativeContainerStyle }: TextProps) {
  if (!leading) {
    return (
      <NativeText style={nativeStyle} accessibilityLabel={accessibilityLabel}>
        {children}
      </NativeText>
    );
  }

  return (
    <View style={[styles.withLeading, nativeContainerStyle]} accessible accessibilityLabel={accessibilityLabel}>
      {leading}
      <NativeText style={nativeStyle}>{children}</NativeText>
    </View>
  );
}

const styles = StyleSheet.create({
  withLeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: textIconGap,
  },
});
