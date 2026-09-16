// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { Fragment } from 'preact';

type ButtonVariant = 'success' | 'primary' | 'info' | 'warning' | 'secondary';

export interface RadioButtonOption<T extends string> {
  id: T;
  label: string;
  variant: ButtonVariant;
}

interface RadioButtonsProps<T extends string> {
  name: string;
  options: RadioButtonOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function RadioButtons<T extends string>({
  name,
  options,
  value,
  onChange,
  ariaLabel,
}: RadioButtonsProps<T>) {
  return (
    <div className='btn-group w-100' role='group' aria-label={ariaLabel}>
      {options.map((option) => {
        const inputId = `${name}-${option.id}`;
        return (
          <Fragment key={option.id}>
            <input
              type='radio'
              className='btn-check'
              name={name}
              id={inputId}
              autoComplete='off'
              checked={option.id === value}
              onChange={() => onChange(option.id)}
            />
            <label
              className={`btn btn-${option.id === value ? '' : 'outline-'}${option.variant}`}
              htmlFor={inputId}
              style={{ flex: '1 1 0%', minWidth: 0, whiteSpace: 'pre-line' }}
            >
              {option.label}
            </label>
          </Fragment>
        );
      })}
    </div>
  );
}
