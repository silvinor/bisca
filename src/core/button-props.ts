// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { ReactNode } from 'react';

export interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  webCss?: string;
}
