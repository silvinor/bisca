// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native';

import type { ButtonProps } from '../../core/button-props';
import { buttonMetrics, getTheme } from '../../core/theme';

export function Button({ children, onPress }: ButtonProps) {
  const theme = getTheme(useColorScheme());

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, { backgroundColor: theme.buttonBackground }]}
    >
      <Text style={[styles.text, { color: theme.buttonText }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: buttonMetrics.borderRadius,
    paddingHorizontal: buttonMetrics.paddingHorizontal,
    paddingVertical: buttonMetrics.paddingVertical,
  },
  text: {
    fontSize: buttonMetrics.fontSize,
  },
});
