// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  PLAYING_SURFACE_ASPECT_RATIO,
  PLAYING_CARD_SIZE_RATIO
} from '../core/constants';
import { applyPlayingCardHeight } from '../core/dynamic-css';

interface TableProps {
  children?: ComponentChildren;
}

export function Table({ children }: TableProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const host = surfaceRef.current?.parentElement;
    if (!host) return;

    const resizeSurface = () => {
      const availableWidth = host.clientWidth;
      const availableHeight = host.clientHeight;
      if (availableWidth === 0 || availableHeight === 0) return;

      const fitToHeight = availableWidth / availableHeight > PLAYING_SURFACE_ASPECT_RATIO;
      const width = fitToHeight
        ? availableHeight * PLAYING_SURFACE_ASPECT_RATIO
        : availableWidth;
      const height = fitToHeight
        ? availableHeight
        : availableWidth / PLAYING_SURFACE_ASPECT_RATIO;

      setSize({ width, height });
      applyPlayingCardHeight(height * PLAYING_CARD_SIZE_RATIO);
    };

    const resizeObserver = new ResizeObserver(resizeSurface);
    resizeObserver.observe(host);
    resizeSurface();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={surfaceRef}
      className='play-table position-relative m-auto'
      style={{ width: `${size.width}px`, height: `${size.height}px` }}
      role='group'
    >
      {children}
    </div>
  );
}
