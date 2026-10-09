// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { getBackFaceUrl, getCardFaceUrl } from '../core/deck-handler';
import {
  PLAYING_CARD_EDGE_PADDING_RATIO,
  PLAYING_CARD_SIZE_RATIO,
} from '../core/constants';

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
 *  x and y use 1..10 grid coordinates. The y range keeps each card edge 3% inside the table. Values can be fractions. Percentages are rounded to 3 decimal places.
 *  z is the z-index
 *  r is the card rotation in degrees -360-360
 */
export function buildCardStyle(
  x: number,
  y: number,
  z: number,
  r: number
): string {
  const percentX = (coordinate: number): number => Math.round(coordinate * 100 / 11 * 1000) / 1000;
  const yEdge = (PLAYING_CARD_SIZE_RATIO / 2 + PLAYING_CARD_EDGE_PADDING_RATIO) * 100;
  const percentY = (coordinate: number): number =>
    Math.round((yEdge + (coordinate - 1) * (100 - yEdge * 2) / 9) * 1000) / 1000;
  return `left:${percentX(x)}%;top:${percentY(y)}%;z-index:${z};transform:translate(-50%,-50%)${r === 0 ? '' : ` rotate(${r}deg)`};`;
}

interface CardProps {
  id: number;
  chr: string;
  x: number;
  y: number;
  z: number;
  r: number;
  onClick?: () => void;
  disabled?: boolean;
}

export function Card({ id, chr, x, y, z, r, onClick, disabled }: CardProps) {
  const src = chr ? getCardFaceUrl(chr) : getBackFaceUrl();
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
      disabled={disabled}
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

/* ----- Card Face ----- */

export function CardFace(props: CardProps) {
  return <Card {...props} />;
}

/* ----- Card Back ---- */

export function CardBack(props: CardProps) {
  return <Card {...props} chr='' />;
}
