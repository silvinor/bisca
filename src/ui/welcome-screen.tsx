// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useRef } from 'preact/hooks';
import {
  APP_NAME_FALLBACK,
  WELCOME_AMBIGRAM_PATH,
  WELCOME_ANIMATION_DURATION_MS,
  WELCOME_ANIMATION_END_SIZE_PERCENT,
  WELCOME_ANIMATION_START_ROTATION_DEGREES,
  WELCOME_ANIMATION_START_SIZE_PERCENT,
  WELCOME_ANIMATION_STOP_ROTATION_DEGREES,
  WELCOME_COMPLETION_DELAY_MS,
} from '../core/constants';
import { i18n } from '../core/i18n';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const completedRef = useRef(false);
  const completionTimerRef = useRef<number | null>(null);

  const completeWelcome = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
    onContinue();
  };

  const scheduleCompletion = () => {
    if (completedRef.current || completionTimerRef.current !== null) return;
    completionTimerRef.current = window.setTimeout(
      completeWelcome,
      WELCOME_COMPLETION_DELAY_MS,
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      event.preventDefault();
      completeWelcome();
    };
    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      completeWelcome();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
      if (completionTimerRef.current !== null) {
        window.clearTimeout(completionTimerRef.current);
      }
    };
  }, [onContinue]);

  return (
    <div
      className='welcome-screen'
      style={{
        '--welcome-animation-duration': `${WELCOME_ANIMATION_DURATION_MS}ms`,
        '--welcome-animation-start-size': `${WELCOME_ANIMATION_START_SIZE_PERCENT}%`,
        '--welcome-animation-end-size': `${WELCOME_ANIMATION_END_SIZE_PERCENT}%`,
        '--welcome-animation-start-rotation': `${WELCOME_ANIMATION_START_ROTATION_DEGREES}deg`,
        '--welcome-animation-stop-rotation': `${WELCOME_ANIMATION_STOP_ROTATION_DEGREES}deg`,
      }}
    >
      <img
        className='welcome-ambigram'
        src={WELCOME_AMBIGRAM_PATH}
        alt={i18n.t('appName', APP_NAME_FALLBACK)}
        onAnimationEnd={scheduleCompletion}
      />
    </div>
  );
}
