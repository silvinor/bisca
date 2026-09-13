// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

const DEFAULT_TABLE_COLOR = '#096';
const DEFAULT_TABLE_TEXTURE = '/assets/img/table/felt.png';
const DEFAULT_TABLE_SPOTLIGHT = '/assets/img/table/_spotlight.png';

interface TableProps {
  color?: string;
  texture?: string;
  spotlight?: string;
}

export function Table({
  color = DEFAULT_TABLE_COLOR,
  texture = DEFAULT_TABLE_TEXTURE,
  spotlight = DEFAULT_TABLE_SPOTLIGHT,
}: TableProps) {
  // Layers are stacked top to bottom: spotlight over texture over the base color.
  const layers = [
    spotlight && { image: spotlight, size: '100% 100%', repeat: 'no-repeat' },
    texture && { image: texture, size: 'auto', repeat: 'repeat' },
  ].filter((layer): layer is { image: string; size: string; repeat: string } => Boolean(layer));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: color,
        backgroundImage: layers.map((layer) => `url(${layer.image})`).join(', ') || undefined,
        backgroundSize: layers.map((layer) => layer.size).join(', '),
        backgroundRepeat: layers.map((layer) => layer.repeat).join(', '),
      }}
    />
  );
}
