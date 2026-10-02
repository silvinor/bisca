// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { CSSProperties } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getBackFaceUrl, getCardFaceUrl } from '../core/deck-handler';

/* ----- Card Face ----- */

interface CardFaceProps {
  letter: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export function CardFace({ letter, style, onClick }: CardFaceProps) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    setSrc('');
    void getCardFaceUrl(letter)
      .then(setSrc)
      .catch((error: unknown) => console.error('[Card face] Failed to load image:', error));
  }, [letter]);

  if (!src) return null;

  if (!onClick) {
    return (
      <img
        className='playing-card position-absolute w-auto rounded shadow'
        style={style}
        src={src}
        alt=''
        draggable={false}
      />
    );
  }

  return (
    <button
      type='button'
      className='playing-card position-absolute border-0 bg-transparent p-0'
      style={style}
      onClick={onClick}
    >
      <img
        className='h-100 w-auto rounded shadow'
        src={src}
        alt=''
        draggable={false}
      />
    </button>
  );
}

/* ----- Card Back ---- */

interface CardBackProps {
  style?: CSSProperties;
  onClick?: () => void;
}

export function CardBack({ style, onClick }: CardBackProps) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    void getBackFaceUrl()
      .then(setSrc)
      .catch((error: unknown) => console.error('[Card back] Failed to load image:', error));
  }, []);

  if (!src) return null;

  if (!onClick) {
    return (
      <img
        className='playing-card position-absolute w-auto rounded shadow'
        style={style}
        src={src}
        alt=''
        draggable={false}
      />
    );
  }

  return (
    <button
      type='button'
      className='playing-card position-absolute border-0 bg-transparent p-0'
      style={style}
      onClick={onClick}
    >
      <img 
        className='h-100 w-auto rounded shadow' 
        src={src}
        alt=''
        draggable={false}
      />
    </button>
  );
}
