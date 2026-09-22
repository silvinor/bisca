// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

const icons = {
  copyright: '©',
  ellipsis_vertical: '|'
} as const;

type IconProps = {
  name: string;
  className?: string;
  copyText?: string;
};

export function Icon({ name, className = '', copyText }: IconProps) {
  const glyph = (
    <i
      className={`fa-solid fa-${name} ${className}${copyText ? ' copyable-icon__glyph' : ''}`}
      aria-hidden="true"
    />
  );

  if (!copyText) return glyph;

  return (
    <span className="copyable-icon">
      <span className="copyable-icon__text" aria-hidden="true">{copyText}</span>
      {glyph}
    </span>
  );
}
