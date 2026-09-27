// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

interface NavButtonProps {
  bs_class: string;
  fa_class?: string;
  fa_inner: string;
  text: string;
  onClick: () => void;
}

export function NavButton({ bs_class, fa_class = '', fa_inner, text, onClick }: NavButtonProps) {
  if (!fa_class) fa_class = 'fa-solid fa-width-fixed';
  return (
    <button
      type='button'
      className={`app-nav-button btn btn-sm ${bs_class}`}
      aria-label={text}
      onClick={(event) => {
        // Tooltip disposal now lives in reactions.ts, run by onClick itself.
        event.currentTarget.blur();
        onClick();
      }}
    >
      <i
        className={`${fa_class} d-none d-lg-inline`}
        aria-hidden='true'
        data-bs-toggle='tooltip'
        data-bs-title={text}
      >{fa_inner}</i>
      <span className='d-lg-none'>{text}</span>
    </button>
  )
}
