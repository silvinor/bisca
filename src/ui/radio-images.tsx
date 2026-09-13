// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

export interface RadioImagesOption<T extends string> {
  id: T;
  label: string;
  image?: string;
}

interface RadioImagesProps<T extends string> {
  name: string;
  options: RadioImagesOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
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
          const inputId = `${name}-${option.id}`;
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
                {option.image ? <img src={option.image} alt={option.label} className='img-fluid rounded' /> : option.label}
              </label>
            </div>
          );
        })}
      </div>
      <div className='form-text text-info' aria-live='polite'>
        {selectedOption?.label}
      </div>
    </div>
  );
}
