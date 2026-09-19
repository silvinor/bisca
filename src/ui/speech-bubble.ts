// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { h, type ComponentChildren } from 'preact';
import { SPEECH_BUBBLE_AVATAR_PATH } from '../core/constants';

interface SpeechBubbleProps {
  children: ComponentChildren;
  avatarAlt: string;
  avatarSrc?: string;
}

export function SpeechBubble({
  children,
  avatarAlt,
  avatarSrc = SPEECH_BUBBLE_AVATAR_PATH,
}: SpeechBubbleProps) {
  return h(
    'div',
    {
      className: 'speech-bubble',
      role: 'status',
      'aria-live': 'polite',
    },
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
    ),
  );
}
