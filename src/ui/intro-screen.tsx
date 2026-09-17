// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useRef, useState } from 'preact/hooks';
import {
  Difficulty,
  GameMode,
  MatchCount,
  PERSISTENCE_SECTION_STARTUP,
} from '../core/constants';
import { i18n } from '../core/i18n';
import { persistanceEngine } from '../core/persistance-engine';
import { RadioButtons, type RadioButtonOption } from './radio-buttons';
import { RadioImages } from './radio-images';

export interface GameSetupOptions {
  gameMode: GameMode;
  cardDeck: string;
  cardBack: string;
  difficulty: Difficulty;
  matchCount: MatchCount;
}

const GAME_MODES: { id: GameMode; image: string; labelKey: string; fallback: string }[] = [
  { id: GameMode.MODE1, image: '/assets/img/menu/mode-1.png', labelKey: 'gameMode.mode1', fallback: 'Threes Bisca' },
  { id: GameMode.MODE2, image: '/assets/img/menu/mode-2.png', labelKey: 'gameMode.mode2', fallback: 'Sevens Bisca' },
  { id: GameMode.MODE3, image: '/assets/img/menu/mode-3.png', labelKey: 'gameMode.mode3', fallback: 'Nines Bisca' },
  { id: GameMode.MODE4, image: '/assets/img/menu/mode-4.png', labelKey: 'gameMode.mode4', fallback: '3 Player Bisca' },
  { id: GameMode.MODE5, image: '/assets/img/menu/mode-5.png', labelKey: 'gameMode.mode5', fallback: 'Sueca' },
];

interface LocalizedRadioOption<T extends string> {
  id: T;
  labelKey: string;
  fallback: string;
  variant: RadioButtonOption<T>['variant'];
}

const DIFFICULTIES: LocalizedRadioOption<Difficulty>[] = [
  { id: Difficulty.EASY, labelKey: 'difficulty.easy', fallback: 'Easy', variant: 'success' },
  { id: Difficulty.NORMAL, labelKey: 'difficulty.normal', fallback: 'Normal', variant: 'info' },
  { id: Difficulty.HARD, labelKey: 'difficulty.hard', fallback: 'Hard', variant: 'warning' },
];

const MATCH_COUNTS: LocalizedRadioOption<MatchCount>[] = [
  { id: MatchCount.ONE, labelKey: 'matchCount.one', fallback: 'Single\nGame', variant: 'secondary' },
  { id: MatchCount.TWO, labelKey: 'matchCount.two', fallback: 'One\nSet', variant: 'secondary' },
  { id: MatchCount.THREE, labelKey: 'matchCount.three', fallback: 'Best of\n Three', variant: 'secondary' },
  { id: MatchCount.FOUR, labelKey: 'matchCount.four', fallback: 'First\nto Four', variant: 'secondary' },
];

type StartupSelections = Pick<GameSetupOptions, 'gameMode' | 'difficulty' | 'matchCount'>;

const DEFAULT_SELECTIONS: StartupSelections = {
  gameMode: GameMode.MODE1,
  difficulty: Difficulty.NORMAL,
  matchCount: MatchCount.ONE,
};

function isStartupSelections(value: unknown): value is StartupSelections {
  if (typeof value !== 'object' || value === null) return false;
  const selections = value as Record<string, unknown>;
  return GAME_MODES.some((mode) => mode.id === selections.gameMode)
    && DIFFICULTIES.some((level) => level.id === selections.difficulty)
    && MATCH_COUNTS.some((count) => count.id === selections.matchCount);
}

interface IntroScreenProps {
  onStart: (options: GameSetupOptions) => void;
  onSettings: () => void;
  onHelp: () => void;
  cardDeck: string;
  cardBack: string;
  tableColor: string;
  tableTexture: string;
  shortcutsEnabled: boolean;
}

interface TooltipInstance {
  dispose(): void;
  hide(): void;
}

interface TooltipPlugin {
  getOrCreateInstance(element: HTMLElement, options: { container: string }): TooltipInstance;
  getInstance(element: HTMLElement): TooltipInstance | null;
}

function getBootstrapTooltip(): TooltipPlugin | undefined {
  return (window as Window & { bootstrap?: { Tooltip?: TooltipPlugin } }).bootstrap?.Tooltip;
}

export function IntroScreen({
  onStart,
  onSettings,
  onHelp,
  cardDeck,
  cardBack,
  tableColor,
  tableTexture,
  shortcutsEnabled,
}: IntroScreenProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const [selections, setSelections] = useState<StartupSelections>(() =>
    persistanceEngine.load(PERSISTENCE_SECTION_STARTUP, isStartupSelections) ?? DEFAULT_SELECTIONS,
  );
  const selectionsRef = useRef(selections);
  const { gameMode, difficulty, matchCount } = selections;

  const updateSelections = (change: Partial<StartupSelections>) => {
    const next = { ...selectionsRef.current, ...change };
    selectionsRef.current = next;
    persistanceEngine.save(PERSISTENCE_SECTION_STARTUP, next);
    setSelections(next);
  };

  useEffect(() => {
    if (!shortcutsEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement &&
        (target.isContentEditable || target.matches('input:not([type="radio"]), textarea, select'))) return;

      let change: Partial<StartupSelections> | undefined;
      switch (event.key.toLowerCase()) {
        case 'enter':
        case 'return':
          if (target instanceof HTMLElement && target.closest('button')) return;
          event.preventDefault();
          startButtonRef.current?.click();
          return;
        case '.':
          event.preventDefault();
          settingsButtonRef.current?.click();
          return;
        case '/':
          event.preventDefault();
          helpButtonRef.current?.click();
          return;
        case 'e': change = { difficulty: Difficulty.EASY }; break;
        case 'n':
        case 'm': change = { difficulty: Difficulty.NORMAL }; break;
        case 'h': change = { difficulty: Difficulty.HARD }; break;
        case '1': change = { matchCount: MatchCount.ONE }; break;
        case '2': change = { matchCount: MatchCount.TWO }; break;
        case '3': change = { matchCount: MatchCount.THREE }; break;
        case '4': change = { matchCount: MatchCount.FOUR }; break;
        default: return;
      }
      event.preventDefault();
      updateSelections(change);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutsEnabled]);

  useEffect(() => {
    const Tooltip = getBootstrapTooltip();
    if (!Tooltip || !cardRef.current) return;

    const instances = Array.from(cardRef.current.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]'))
      .map((element) => Tooltip.getOrCreateInstance(element, { container: 'body' }));
    return () => instances.forEach((instance) => instance.dispose());
  }, []);

  const handleStart = () => {
    onStart({ ...selectionsRef.current, cardDeck, cardBack });
  };

  const handleSettings = (button: HTMLButtonElement) => {
    getBootstrapTooltip()?.getInstance(button)?.hide();
    onSettings();
  };

  const handleHelp = (button: HTMLButtonElement) => {
    getBootstrapTooltip()?.getInstance(button)?.hide();
    onHelp();
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
            onChange={(value) => updateSelections({ gameMode: value })}
            ariaLabel={i18n.t('intro.gameMode', 'Game mode')}
            tableColor={tableColor}
            tableTexture={tableTexture}
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
              onChange={(value) => updateSelections({ difficulty: value })}
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
              onChange={(value) => updateSelections({ matchCount: value })}
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
          <button
            ref={startButtonRef}
            type='button'
            className='btn btn-success flex-grow-1'
            onClick={handleStart}
          >
            <i className='fa-solid fa-circle-play me-2' aria-hidden='true' />
            {i18n.t('intro.start', 'Start game')}
          </button>
          <button
            ref={settingsButtonRef}
            type='button'
            className='btn btn-primary'
            aria-label={i18n.t('intro.settings', 'Settings')}
            data-bs-toggle='tooltip'
            data-bs-placement='top'
            data-bs-title={i18n.t('intro.settings', 'Settings')}
            onClick={(event) => handleSettings(event.currentTarget)}
          >
            <i className='fa-solid fa-gear' aria-hidden='true' />
          </button>
          <button
            ref={helpButtonRef}
            type='button'
            className='btn btn-info'
            aria-label={i18n.t('intro.help', 'Help')}
            data-bs-toggle='tooltip'
            data-bs-placement='top'
            data-bs-title={i18n.t('intro.help', 'Help')}
            onClick={(event) => handleHelp(event.currentTarget)}
          >
            <i className='fa-solid fa-question' aria-hidden='true' />
          </button>
        </div>

      </div>
    </div>
  );
}
