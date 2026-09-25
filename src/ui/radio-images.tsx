// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useState } from 'preact/hooks';

export interface RadioImagesOption<T extends string> {
  id: T;
  label: string;
  image: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioImagesProps<T extends string> {
  name: string;
  options: readonly RadioImagesOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  layerClassNames?: readonly [string, string, string, string];
  imageSizePercent?: number;
}

function safeHtmlIdPart(value: string): string {
  return Array.from(value, (character) =>
    /^[a-z0-9-]$/i.test(character)
      ? character
      : `_u${character.codePointAt(0)!.toString(16)}_`,
  ).join('');
}

const LAYER_STYLE = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
} as const;

export function RadioImages<T extends string>({
  name,
  options,
  value,
  onChange,
  ariaLabel,
  layerClassNames,
  imageSizePercent = 100,
}: RadioImagesProps<T>) {
  const selectedOption = options.find((option) => option.id === value);
  const [focusedOptionId, setFocusedOptionId] = useState<T | null>(null);
  const imageSize = `${Math.max(0, Math.min(100, imageSizePercent))}%`;

  return (
    <>
      <div className='radio-images' role='radiogroup' aria-label={ariaLabel}>
        {options.map((option) => {
          const inputId = `radio-${safeHtmlIdPart(name)}-${safeHtmlIdPart(option.id)}`;
          const isSelected = option.id === value;
          const isFocused = option.id === focusedOptionId;

          return (
            <span
              key={option.id}
              className={`radio-images-item ${isSelected ? 'selected' : 'unselected'}${isFocused ? ' focus' : ''}`}
            >
              <input
                type='radio'
                className='btn-check'
                name={name}
                id={inputId}
                value={option.id}
                autoComplete='off'
                checked={isSelected}
                disabled={option.disabled}
                onChange={() => onChange(option.id)}
                onFocus={() => setFocusedOptionId(option.id)}
                onBlur={() => setFocusedOptionId(null)}
              />
              <label
                className='radio-images-button'
                htmlFor={inputId}
                style={{ position: 'relative' }}
              >
                <svg
                  className={`radio-images-bg ${layerClassNames?.[0] ?? ''}`.trim()}
                  style={LAYER_STYLE}
                  viewBox='0 0 256 256'
                  fill='transparent'
                  stroke='transparent'
                >
                  <rect x='0' y='0' width='256' height='265' />
                </svg>
                <div
                  className={`radio-images-tx ${layerClassNames?.[1] ?? ''}`.trim()}
                  style={LAYER_STYLE}
                />
                <img
                  className={`radio-images-img ${layerClassNames?.[2] ?? ''}`.trim()}
                  style={{
                    ...LAYER_STYLE,
                    inset: '50% auto auto 50%',
                    width: imageSize,
                    height: imageSize,
                    objectFit: 'contain',
                    transform: 'translate(-50%, -50%)',
                  }}
                  src={option.image}
                  alt={option.label}
                />
                <div 
                  className={`radio-images-ov ${layerClassNames?.[3] ?? ''}`.trim()} 
                  style={LAYER_STYLE}
                />
              </label>
            </span>
          );
        })}
      </div>
      <div className='form-text text-muted' aria-live='polite'>
        {selectedOption?.description ?? selectedOption?.label}
      </div>
    </>
  );
}
