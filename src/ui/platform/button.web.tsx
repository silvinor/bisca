// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { ButtonProps } from '../../core/button-props';

export function Button({ children, onPress, webCss }: ButtonProps) {
  return (
    <button type="button" className={['btn', webCss].filter(Boolean).join(' ')} onClick={onPress}>
      {children}
    </button>
  );
}
