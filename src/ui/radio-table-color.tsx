// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useState } from 'preact/hooks';

export interface RadioTableOption<T extends string> {
  id: T;
  label: string;
  description: string;
  preview: string;
}

interface RadioTableColorProps<T extends string> {
  name: string;
  mode: 'color' | 'texture';
  options: RadioTableOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  backgroundColor?: string;
  backgroundTexture?: string;
}

function safeHtmlIdPart(value: string): string {
  return Array.from(value, (character) =>
    /^[a-z0-9-]$/i.test(character)
      ? character
      : `_u${character.codePointAt(0)!.toString(16)}_`,
  ).join('');
}

export function RadioTableColor<T extends string>({
  name,
  mode,
  options,
  value,
  onChange,
  ariaLabel,
  backgroundColor = 'transparent',
  backgroundTexture,
}: RadioTableColorProps<T>) {
  const selectedOption = options.find((option) => option.id === value);
  const [focusedOptionId, setFocusedOptionId] = useState<T | null>(null);

  return (
    <div>
      <div className='d-flex flex-wrap' role='group' aria-label={ariaLabel}>
        {options.map((option) => {
          const isSelected = option.id === value;
          const isFocused = option.id === focusedOptionId;
          const inputId = `radio-${safeHtmlIdPart(name)}-${safeHtmlIdPart(option.id)}`;
          const color = mode === 'color' ? option.preview : backgroundColor;
          const texture = mode === 'texture' ? option.preview : backgroundTexture;
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
                  className={`radio-image-preview radio-table-color-preview rounded rounded-1 ${isSelected ? 'selected' : 'unselected'} ${isFocused ? 'focused' : 'unfocused'}`}
                >
                  <svg
                    className='radio-image-preview-color'
                    width='512'
                    height='256'
                    viewBox='0 0 512 256'
                    aria-hidden='true'
                  >
                    <rect width='512' height='256' fill={color} />
                  </svg>
                  {texture && (
                    <span
                      className='radio-image-preview-texture'
                      style={{ backgroundImage: `url(${texture})` }}
                      aria-hidden='true'
                    />
                  )}
                  <span
                    className='radio-image-preview-art'
                    aria-hidden='true'
                  />
                  <span className='radio-image-overlay visually-hidden'>{option.label}
                  </span>
                </div>
              </label>
            </div>
          );
        })}
      </div>
      <div className='form-text text-info' aria-live='polite'>
        {selectedOption?.description}
      </div>
    </div>
  );
}
