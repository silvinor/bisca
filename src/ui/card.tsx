// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { getBackFaceUrl, getCardFaceUrl } from '../core/deck-handler';

/**
 * Builds a "style" string for the card for a 10x10 grid.
 * ┌──────────┐
 * │123456789A|
 * │2         |
 * │3         |
 * │4         |
 * │5         |
 * │6         |
 * │7         |
 * │8         |
 * │9         |
 * │A        A|
 * └──────────┘
 * Where:
 *  x & y are the % coordinates for the card given in 1..10 notation - the function then calculates the % offset of the centers from top left, 1=9.09%..10=90.909 ... number can be a fracton. Always rounds to 3 decimal places.
 *  z is the z-index
 *  r is the card rotation in degrees -360-360
 */
export function buildCardStyle(
  x: number,
  y: number,
  z: number,
  r: number
): string {
  const percent = (coordinate: number): number =>
    Math.round(coordinate * 100 / 11 * 1000) / 1000;
  return `left:${percent(x)}%;top:${percent(y)}%;z-index:${z};transform:translate(-50%,-50%)${r === 0 ? '' : ` rotate(${r}deg)`};`;
}

interface CardProps {
  id: number;
  chr: string;
  x: number;
  y: number;
  z: number;
  r: number;
  onClick?: () => void;
}

/* ----- Card Face ----- */

export function CardFace({ id, chr, x, y, z, r, onClick }: CardProps) {
  const src = getCardFaceUrl(chr);
  const style = buildCardStyle(x, y, id+z, r);

  if (!onClick) {
    return (
      <img
        id={`card-id-${id}`}
        className='playing-card position-absolute w-auto'
        style={style}
        src={src}
        alt=''
        draggable={false}
      />
    );
  }

  return (
    <button
      id={`card-id-${id}`}
      type='button'
      className='playing-card position-absolute border-0 bg-transparent p-0'
      style={style}
      onClick={onClick}
    >
      <img
        className='h-100 w-auto'
        src={src}
        alt=''
        draggable={false}
      />
    </button>
  );
}

/* ----- Card Back ---- */

export function CardBack({ id, chr, x, y, z, r, onClick }: CardProps) {
  const src = getBackFaceUrl();
  const style = buildCardStyle(x, y, id+z, r);
  void chr;

  if (!onClick) {
    return (
      <img
        id={`card-id-${id}`}
        className='playing-card position-absolute w-auto'
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
        id={`card-id-${id}`}
        className='h-100 w-auto' 
        src={src}
        alt=''
        draggable={false}
      />
    </button>
  );
}
