// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useRef, useState } from 'preact/hooks';
import { i18n } from '../core/i18n';
import { RadioButtons, type RadioButtonOption } from './radio-buttons';
import { RadioImages } from './radio-images';

export type GameMode = 'bisca-3' | 'bisca-7' | 'bisca-9' | 'bisca-3-players' | 'sueca';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type MatchCount = 'single-game' | 'one-set' | 'best-of-3' | 'first-to-4';

export interface GameSetupOptions {
  gameMode: GameMode;
  cardDeck: string;
  cardBack: string;
  difficulty: Difficulty;
  matchCount: MatchCount;
}

const GAME_MODES: { id: GameMode; image: string; labelKey: string; fallback: string }[] = [
  { id: 'bisca-3', image: '/assets/img/menu/mode-1.jpg', labelKey: 'gameMode.bisca3', fallback: 'Bisca dos Três' },
  { id: 'bisca-7', image: '/assets/img/menu/mode-2.jpg', labelKey: 'gameMode.bisca7', fallback: 'Bisca dos Sete' },
  { id: 'bisca-9', image: '/assets/img/menu/mode-3.jpg', labelKey: 'gameMode.bisca9', fallback: 'Bisca dos Nove' },
  { id: 'bisca-3-players', image: '/assets/img/menu/mode-4.jpg', labelKey: 'gameMode.bisca3players', fallback: 'Bisca dos Três (3 Players)' },
  { id: 'sueca', image: '/assets/img/menu/mode-5.jpg', labelKey: 'gameMode.sueca', fallback: 'Sueca' },
];

interface LocalizedRadioOption<T extends string> {
  id: T;
  labelKey: string;
  fallback: string;
  variant: RadioButtonOption<T>['variant'];
}

const DIFFICULTIES: LocalizedRadioOption<Difficulty>[] = [
  { id: 'easy', labelKey: 'difficulty.easy', fallback: 'Easy', variant: 'success' },
  { id: 'normal', labelKey: 'difficulty.normal', fallback: 'Normal', variant: 'info' },
  { id: 'hard', labelKey: 'difficulty.hard', fallback: 'Hard', variant: 'warning' },
];

const MATCH_COUNTS: LocalizedRadioOption<MatchCount>[] = [
  { id: 'single-game', labelKey: 'matchCount.single', fallback: 'Single\nGame', variant: 'secondary' },
  { id: 'one-set', labelKey: 'matchCount.oneSet', fallback: 'One\nSet', variant: 'secondary' },
  { id: 'best-of-3', labelKey: 'matchCount.bestOf3', fallback: 'Best of\n Three', variant: 'secondary' },
  { id: 'first-to-4', labelKey: 'matchCount.firstTo4', fallback: 'First\nto Four', variant: 'secondary' },
];

interface IntroScreenProps {
  onStart: (options: GameSetupOptions) => void;
}

interface TooltipInstance {
  dispose(): void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [gameMode, setGameMode] = useState<GameMode>('bisca-3');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [matchCount, setMatchCount] = useState<MatchCount>('single-game');

  useEffect(() => {
    const Tooltip = (window as Window & {
      bootstrap?: {
        Tooltip?: {
          getOrCreateInstance(element: HTMLElement, options: { container: string }): TooltipInstance;
        };
      };
    }).bootstrap?.Tooltip;
    if (!Tooltip || !cardRef.current) return;

    const instances = Array.from(cardRef.current.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]'))
      .map((element) => Tooltip.getOrCreateInstance(element, { container: 'body' }));
    return () => instances.forEach((instance) => instance.dispose());
  }, []);

  const handleStart = () => {
    onStart({ gameMode, cardDeck: 'silvinor', cardBack: 'a', difficulty, matchCount });
  };

  return (
    <div ref={cardRef} className='card shadow mx-auto intro-card rounded-4'>
      <div className='card-header'>
        <h1 className='h2 card-title text-center mb-0'>{i18n.t('appName', 'Bisca')}</h1>
      </div>
      <div className='card-body'>
        <div className='mb-3'>
          <span className='form-label d-block'>{i18n.t('intro.gameMode', 'Game mode')}</span>
          <RadioImages
            name='game-mode'
            value={gameMode}
            onChange={setGameMode}
            ariaLabel={i18n.t('intro.gameMode', 'Game mode')}
            options={GAME_MODES.map((mode) => ({
              id: mode.id,
              image: mode.image,
              label: i18n.t(mode.labelKey, mode.fallback),
            }))}
          />
        </div>

        <fieldset className='mb-3'>
          <legend className='form-label fs-6'>
            {i18n.t('intro.difficulty', 'Difficulty')}
          </legend>
          <RadioButtons
            name='difficulty'
            value={difficulty}
            onChange={setDifficulty}
            ariaLabel={i18n.t('intro.difficulty', 'Difficulty')}
            options={DIFFICULTIES.map((option) => ({
              id: option.id,
              label: i18n.t(option.labelKey, option.fallback),
              variant: option.variant,
            }))}
          />
        </fieldset>

        <fieldset>
          <legend className='form-label fs-6'>
            {i18n.t('intro.matchCount', 'Match count')}
          </legend>
          <RadioButtons
            name='match-count'
            value={matchCount}
            onChange={setMatchCount}
            ariaLabel={i18n.t('intro.matchCount', 'Match count')}
            options={MATCH_COUNTS.map((option) => ({
              id: option.id,
              label: i18n.t(option.labelKey, option.fallback),
              variant: option.variant,
            }))}
          />
        </fieldset>

      </div> 
      <div className='card-footer py-4'>

        <div className='d-flex justify-content-center align-items-center gap-2'>
          <button type='button' className='btn btn-success flex-grow-1' onClick={handleStart}>
            <i className='fa-solid fa-circle-play me-2' aria-hidden='true' />
            {i18n.t('intro.start', 'Start game')}
          </button>
          <button
            type='button'
            className='btn btn-primary'
            aria-label={i18n.t('intro.settings', 'Settings')}
            data-bs-toggle='tooltip'
            data-bs-placement='top'
            data-bs-title={i18n.t('intro.settings', 'Settings')}
          >
            <i className='fa-solid fa-gear' aria-hidden='true' />
          </button>
          <button
            type='button'
            className='btn btn-info'
            aria-label={i18n.t('intro.help', 'Help')}
            data-bs-toggle='tooltip'
            data-bs-placement='top'
            data-bs-title={i18n.t('intro.help', 'Help')}
          >
            <i className='fa-solid fa-question' aria-hidden='true' />
          </button>
        </div>

      </div>
    </div>
  );
}
