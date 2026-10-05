// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { h, type ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { APP_SPEECH_BUBBLE_AVATAR_FILE } from '../core/constants';
import { i18n } from '../core/i18n';

/*
  Just a message
  `<SpeechBubble>message</SpeechBubble>`

  Delay: onTimeout fires after 1 second
  `<SpeechBubble timeout={1000} onTimeout={() => next()}>message</SpeechBubble>`

  Confirm prompt: you get a button for each handler you pass
  `<SpeechBubble onOk={quitEvent} onCancel={stayEvent}>message</SpeechBubble>`
*/

interface SpeechBubbleProps {
  children: ComponentChildren;
  avatarAlt?: string;
  avatarSrc?: string;
  /** Milliseconds before `onTimeout` fires. Space, Enter, or Escape ends the delay early. */
  timeout?: number;
  onTimeout?: () => void;
  /** Supplying `onOk` and/or `onCancel` turns the bubble into a confirm prompt with those buttons. */
  onOk?: () => void;
  onCancel?: () => void;
  okLabel?: string;
  cancelLabel?: string;
}

export function SpeechBubble({
  children,
  avatarAlt = '',
  avatarSrc = APP_SPEECH_BUBBLE_AVATAR_FILE,
  timeout,
  onTimeout,
  onOk,
  onCancel,
  okLabel = i18n.t('speech-bubble:ok'),
  cancelLabel = i18n.t('speech-bubble:cancel'),
}: SpeechBubbleProps) {
  // Keep the latest callback so an inline arrow from the parent does not restart the timer on every render.
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  // Start one timer per mounted message, and let the keyboard shortcuts finish the same timer early.
  useEffect(() => {
    if (timeout === undefined) return;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      onTimeoutRef.current?.();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter' && event.key !== 'Escape') return;
      event.preventDefault();
      finish();
    };

    const timer = window.setTimeout(finish, timeout);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [timeout]);

  const isPrompt = onOk !== undefined || onCancel !== undefined;

  const buttons = isPrompt
    && h(
      'div',
      { className: 'speech-bubble-buttons d-flex justify-content-end gap-2' },
      onCancel && h('button', { type: 'button', className: 'btn btn-sm btn-outline-secondary', onClick: onCancel }, cancelLabel),
      onOk && h('button', { type: 'button', className: 'btn btn-sm btn-primary', onClick: onOk, autoFocus: true }, okLabel),
    );

  // Visual countdown only: the timer above is the source of truth, so reduced motion simply skips the bar.
  const countdown = timeout !== undefined && !window.isReducedMotion
    && h(
      'div',
      { className: 'speech-bubble-countdown progress', 'aria-hidden': 'true' },
      h('div', { className: 'progress-bar', style: { animationDuration: `${timeout}ms` } }),
    );

  return h(
    'div',
    {
      className: `speech-bubble${isPrompt ? ' speech-bubble-prompt' : ''}`,
      role: isPrompt ? 'alertdialog' : 'status',
      'aria-live': isPrompt ? undefined : 'polite',
      // Escape cancels a prompt, matching window.confirm; Enter hits the autofocused Ok button natively.
      onKeyDown: onCancel && ((event: KeyboardEvent) => {
        if (event.key === 'Escape') onCancel();
      }),
    },
    h(
      'div',
      { className: 'speech-bubble-wrapper' },
      h('img', {
        className: 'speech-bubble-avatar',
        src: avatarSrc,
        alt: avatarAlt,
        width: 512,
        height: 512,
      }),
      h(
        'div',
        { className: 'speech-bubble-content' },
        h(
          'svg',
          {
            className: 'speech-bubble-tip',
            xmlns: 'http://www.w3.org/2000/svg',
            width: '15',
            height: '22',
            viewBox: '0 0 15 22',
            fill: 'none',
            'aria-hidden': 'true',
          },
          h('path', {
            className: 'speech-bubble-tip-path',
            d: 'M0 14C8.4 14 12.8333 4.66667 15 0V22C15 22 3.5 22 0 14Z',
          }),
        ),
        h('div', { className: 'speech-bubble-message' }, children),
        (buttons || countdown) && h('div', { className: 'speech-bubble-footer' }, buttons, countdown),
      ),
    ),
  );
}
