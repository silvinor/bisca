// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

export interface RadioImagesOption<T extends string> {
  id: T;
  label: string;
  description?: string;
  image?: string;
}

interface RadioImagesProps<T extends string> {
  name: string;
  options: RadioImagesOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

function safeHtmlIdPart(value: string): string {
  return Array.from(value, (character) =>
    /^[a-z0-9-]$/i.test(character)
      ? character
      : `_u${character.codePointAt(0)!.toString(16)}_`,
  ).join('');
}

/**
 * A single-choice radio group, styled as plain bordered tiles rather than
 * Bootstrap's `.btn`/`.btn-check` buttons. Each option gets its own `.w20`
 * wrapper (the flex item) so percentage sizing is resolved against a definite
 * width instead of the image's own intrinsic size.
 */
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
      <div className='d-flex flex-wrap' role='group' aria-label={ariaLabel}>
        {options.map((option) => {
          const inputId = `radio-${safeHtmlIdPart(name)}-${safeHtmlIdPart(option.id)}`;
          return (
            <div key={option.id} className='w20 p-1'>
              <input
                type='radio'
                className='toggle-input visually-hidden'
                name={name}
                id={inputId}
                autoComplete='off'
                checked={option.id === value}
                onChange={() => onChange(option.id)}
              />
              <label
                htmlFor={inputId}
                className='toggle-option'
                data-bs-toggle='tooltip'
                data-bs-title={option.label}
              >
                {option.image ? (
                  <img
                    src={option.image}
                    alt={option.label}
                    className={`img-fluid rounded rounded-1 ${option.id === value ? 'radio-image-selected' : 'radio-image-unselected'}`}
                  />
                ) : option.label}
              </label>
            </div>
          );
        })}
      </div>
      <div className='form-text text-info' aria-live='polite'>
        {selectedOption?.description ?? selectedOption?.label}
      </div>
    </div>
  );
}
