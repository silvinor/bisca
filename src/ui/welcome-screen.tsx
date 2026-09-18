// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useCallback, useEffect, useRef } from 'preact/hooks';
import {
  APP_NAME_FALLBACK,
  WELCOME_AMBIGRAM_PATH,
  WELCOME_ANIMATION_DURATION_MS,
  WELCOME_ANIMATION_EASE,
  WELCOME_ANIMATION_END_SIZE_PERCENT,
  WELCOME_ANIMATION_START_ROTATION_DEGREES,
  WELCOME_ANIMATION_START_SIZE_PERCENT,
  WELCOME_ANIMATION_STOP_ROTATION_DEGREES,
  WELCOME_COMPLETION_DELAY_MS,
} from '../core/constants';
import { i18n } from '../core/i18n';
import {
  animationScopePrefersReducedMotion,
  createTimeline,
  isAnimeJsAvailable,
  useAnimationScope,
} from './animation';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const completedRef = useRef(false);

  const completeWelcome = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onContinue();
  }, [onContinue]);

  const { rootRef } = useAnimationScope<HTMLDivElement>((scope, root) => {
    const ambigram = root.querySelector<HTMLImageElement>('.welcome-ambigram');
    if (!ambigram) return;

    const reduceMotion = animationScopePrefersReducedMotion(scope);
    const animationDuration = reduceMotion ? 0 : WELCOME_ANIMATION_DURATION_MS;
    const completionDelay = reduceMotion ? 0 : WELCOME_COMPLETION_DELAY_MS;
    const startScale = WELCOME_ANIMATION_START_SIZE_PERCENT / WELCOME_ANIMATION_END_SIZE_PERCENT;

    createTimeline()
      .add(ambigram, {
        scale: [startScale, 1],
        rotate: [
          WELCOME_ANIMATION_START_ROTATION_DEGREES,
          WELCOME_ANIMATION_STOP_ROTATION_DEGREES,
        ],
        duration: animationDuration,
        ease: WELCOME_ANIMATION_EASE,
      })
      .call(completeWelcome, animationDuration + completionDelay);
  }, [completeWelcome]);

  useEffect(() => {
    if (!isAnimeJsAvailable()) {
      completeWelcome();
      return;
    }

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
    };
  }, [completeWelcome]);

  return (
    <div
      ref={rootRef}
      className='welcome-screen'
    >
      <img
        className='welcome-ambigram'
        src={WELCOME_AMBIGRAM_PATH}
        alt={i18n.t('appName', APP_NAME_FALLBACK)}
        style={{
          width: `${WELCOME_ANIMATION_END_SIZE_PERCENT}%`,
          transform: `rotate(${WELCOME_ANIMATION_START_ROTATION_DEGREES}deg) scale(${WELCOME_ANIMATION_START_SIZE_PERCENT / WELCOME_ANIMATION_END_SIZE_PERCENT})`,
        }}
      />
    </div>
  );
}
