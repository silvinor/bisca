// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { PLAYING_SURFACE_ASPECT_RATIO } from '../core/constants';

interface TableProps {
  children?: ComponentChildren;
}

export function Table({ children }: TableProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    const host = surface?.parentElement;
    if (!surface || !host) return;

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

      surface.style.width = `${width}px`;
      surface.style.height = `${height}px`;
    };

    const resizeObserver = new ResizeObserver(resizeSurface);
    resizeObserver.observe(host);
    resizeSurface();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={surfaceRef} className='surface'>{children}</div>
  );
}
