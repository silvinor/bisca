// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

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
}

function safeHtmlIdPart(value: string): string {
  return Array.from(value, (character) =>
    /^[a-z0-9-]$/i.test(character)
      ? character
      : `_u${character.codePointAt(0)!.toString(16)}_`,
  ).join('');
}

export function RadioImages<T extends string>({
  name,
  options,
  value,
  onChange,
  ariaLabel,
}: RadioImagesProps<T>) {
  const selectedOption = options.find((option) => option.id === value);

  return (
    <div>
      <div className='radio-images' role='radiogroup' aria-label={ariaLabel}>
        {options.map((option) => {
          const inputId = `radio-${safeHtmlIdPart(name)}-${safeHtmlIdPart(option.id)}`;

          return (
            <span key={option.id} className='radio-images-item'>
              <input
                type='radio'
                className='btn-check'
                name={name}
                id={inputId}
                value={option.id}
                autoComplete='off'
                checked={option.id === value}
                disabled={option.disabled}
                onChange={() => onChange(option.id)}
              />
              <label className='radio-images-button' htmlFor={inputId}>
                <img src={option.image} alt={option.label} />
              </label>
            </span>
          );
        })}
      </div>
      <div className='form-text text-muted' aria-live='polite'>
        {selectedOption?.description ?? selectedOption?.label}
      </div>
    </div>
  );
}
