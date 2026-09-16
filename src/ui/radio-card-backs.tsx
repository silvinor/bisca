// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useState } from 'preact/hooks';

export interface RadioCardBackOption<T extends string> {
  id: T;
  label: string;
  image: string;
}

interface RadioCardBacksProps<T extends string> {
  name: string;
  options: RadioCardBackOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  tableColor: string;
  tableTexture: string;
}

function safeHtmlIdPart(value: string): string {
  return Array.from(value, (character) =>
    /^[a-z0-9-]$/i.test(character)
      ? character
      : `_u${character.codePointAt(0)!.toString(16)}_`,
  ).join('');
}

export function RadioCardBacks<T extends string>({
  name,
  options,
  value,
  onChange,
  ariaLabel,
  tableColor,
  tableTexture,
}: RadioCardBacksProps<T>) {
  const [focusedOptionId, setFocusedOptionId] = useState<T | null>(null);

  return (
    <div className='d-flex flex-wrap' role='group' aria-label={ariaLabel}>
      {options.map((option) => {
        const isSelected = option.id === value;
        const isFocused = option.id === focusedOptionId;
        const inputId = `radio-${safeHtmlIdPart(name)}-${safeHtmlIdPart(option.id)}`;
        return (
          <div key={option.id} className='w20 p-1'>
            <input
              type='radio'
              className='toggle-input visually-hidden'
              name={name}
              id={inputId}
              autoComplete='off'
              checked={isSelected}
              onChange={() => onChange(option.id)}
              onFocus={() => setFocusedOptionId(option.id)}
              onBlur={() => setFocusedOptionId(null)}
            />
            <label
              htmlFor={inputId}
              className='toggle-option'
              data-bs-toggle='tooltip'
              data-bs-title={option.label}
            >
              <div
                className={`radio-image-preview radio-card-backs-preview rounded rounded-1 ${isSelected ? 'selected' : 'unselected'} ${isFocused ? 'focused' : 'unfocused'}`}
              >
                <svg
                  className='radio-image-preview-color'
                  width='512'
                  height='512'
                  viewBox='0 0 512 512'
                  aria-hidden='true'
                >
                  <rect width='512' height='512' fill={tableColor} />
                </svg>
                <span
                  className='radio-image-preview-texture'
                  style={{ backgroundImage: `url(${tableTexture})` }}
                  aria-hidden='true'
                />
                <span
                  className='radio-image-preview-art'
                  aria-hidden='true'
                />
                <img
                  src={option.image}
                  alt=''
                  aria-hidden='true'
                  className='radio-image-card-back-art'
                />
                <span className='radio-image-overlay visually-hidden'>{option.label}</span>
              </div>
            </label>
          </div>
        );
      })}
    </div>
  );
}
