// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { TextProps } from '../../core/text-props';

export function Text({ children, leading, accessibilityLabel, webCss, webStyle }: TextProps) {
  return (
    <div
      className={webCss}
      style={webStyle}
      role={accessibilityLabel ? 'group' : undefined}
      aria-label={accessibilityLabel}
    >
      {leading}
      {leading ? ' ' : null}
      {children}
    </div>
  );
}
