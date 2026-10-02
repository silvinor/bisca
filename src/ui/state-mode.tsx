// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useState } from 'preact/hooks';
import { i18n } from '../core/i18n';
import { gameModeSubmit, helpClick, settingsClick } from '../core/reactions';
import { 
  GAME_MODE_1,
  GAME_MODE_2,
  GAME_MODE_3,
  GAME_MODE_4,
  GAME_MODE_5,
  type GameMode,
  GAME_DIFFICULTY_EASY,
  GAME_DIFFICULTY_NORMAL,
  GAME_DIFFICULTY_HARD,
  type Difficulty,
  GAME_COUNT_ONE,
  GAME_COUNT_TWO,
  GAME_COUNT_THREE,
  GAME_COUNT_FOUR,
  type MatchCount,
} from '../types/game-state.d';
import {
  SAVE_NAME_MODE,
  SAVE_NAME_DIFFICULTY,
  SAVE_NAME_COUNT,
  APP_LOGO_FILE,
  ACTION_GO,
} from '../core/constants';
import { RadioButtons } from './radio-buttons';
import { RadioImages, type RadioImagesLayerClasses } from './radio-images';

const GAME_MODES: readonly {
  id: GameMode;
  image: string;
  labelKey: string;
  classes?: RadioImagesLayerClasses;
}[] = [
  { id: GAME_MODE_1, image: '/assets/img/menu/mode-1.png', labelKey: 'state-mode:mode1', classes: ['bg-color bg-texture', '', '', ''] },
  { id: GAME_MODE_2, image: '/assets/img/menu/mode-2.png', labelKey: 'state-mode:mode2', classes: ['bg-color bg-texture', '', '', ''] },
  { id: GAME_MODE_3, image: '/assets/img/menu/mode-3.png', labelKey: 'state-mode:mode3', classes: ['bg-color bg-texture', '', '', ''] },
  { id: GAME_MODE_4, image: '/assets/img/menu/mode-4.png', labelKey: 'state-mode:mode4', classes: ['bg-color bg-texture', '', '', ''] },
  { id: GAME_MODE_5, image: '/assets/img/menu/mode-5.png', labelKey: 'state-mode:mode5', classes: ['bg-color bg-texture', '', '', ''] },
];

const DIFFICULTIES: readonly {
  id: Difficulty;
  labelKey: string;
  variant: string;
}[] = [
  { id: GAME_DIFFICULTY_EASY, labelKey: 'state-mode:difficulty-easy', variant: 'success' },
  { id: GAME_DIFFICULTY_NORMAL, labelKey: 'state-mode:difficulty-normal', variant: 'info' },
  { id: GAME_DIFFICULTY_HARD, labelKey: 'state-mode:difficulty-hard', variant: 'warning' },
] as const;

const MATCH_COUNTS: readonly {
  id: MatchCount;
  labelKey: string;
  variant: string;
}[] = [
  { id: GAME_COUNT_ONE, labelKey: 'state-mode:match-count-one', variant: 'secondary' },
  { id: GAME_COUNT_TWO, labelKey: 'state-mode:match-count-two', variant: 'secondary' },
  { id: GAME_COUNT_THREE, labelKey: 'state-mode:match-count-three', variant: 'secondary' },
  { id: GAME_COUNT_FOUR, labelKey: 'state-mode:match-count-four', variant: 'secondary' },
] as const;

function applySelectionRules(gameMode: GameMode, difficulty: Difficulty) {
  const disabledDifficulties: Difficulty[] = gameMode === GAME_MODE_5 ? [GAME_DIFFICULTY_EASY] : [];

  return {
    disabledDifficulties,
    difficulty: disabledDifficulties.includes(difficulty) ? GAME_DIFFICULTY_NORMAL : difficulty,
  };
}

const DIFFICULTY_KEYS: Record<string, Difficulty> = {
  e: GAME_DIFFICULTY_EASY,
  n: GAME_DIFFICULTY_NORMAL,
  m: GAME_DIFFICULTY_NORMAL,
  h: GAME_DIFFICULTY_HARD,
};

const MATCH_COUNT_KEYS: Record<string, MatchCount> = {
  '1': GAME_COUNT_ONE,
  '2': GAME_COUNT_TWO,
  '3': GAME_COUNT_THREE,
  '4': GAME_COUNT_FOUR,
};

export interface StateGameModeProps {
  mode: GameMode;
  difficulty: Difficulty;
  matchCount: MatchCount;
  onChangeMode: (mode: GameMode, difficulty: Difficulty) => Difficulty;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onChangeMatchCount: (matchCount: MatchCount) => void;
}

export function StateGameMode({
  mode,
  difficulty: initialDifficulty,
  matchCount: initialMatchCount,
  onChangeMode,
  onChangeDifficulty,
  onChangeMatchCount,
}: StateGameModeProps) {
  const [gameMode, setGameMode] = useState<GameMode>(mode);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [matchCount, setMatchCount] = useState<MatchCount>(initialMatchCount);
  const selectionRules = applySelectionRules(gameMode, difficulty);

  // Apply the values returned by the core handler to the visible controls.
  const handleModeChange = (nextGameMode: GameMode) => {
    const nextDifficulty = onChangeMode(nextGameMode, difficulty);
    setGameMode(nextGameMode);
    setDifficulty(nextDifficulty);
  };

  const handleDifficultyChange = (nextDifficulty: Difficulty) => {
    setDifficulty(nextDifficulty);
    onChangeDifficulty(nextDifficulty);
  };

  const handleMatchCountChange = (nextMatchCount: MatchCount) => {
    setMatchCount(nextMatchCount);
    onChangeMatchCount(nextMatchCount);
  };

  // Screen-wide shortcuts (carried over from the old intro screen): letter
  // and digit keys jump straight to a difficulty or match count, '.' and '/'
  // open settings/help, and Enter starts the game. Typing into a text field
  // or using a modifier key leaves the keystroke alone.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement &&
        (target.isContentEditable || target.matches('input:not([type="radio"]), textarea, select'))) return;

      const key = event.key.toLowerCase();
      if (key === 'enter' || key === 'return') {
        if (target instanceof HTMLElement && target.closest('button')) return;
        event.preventDefault();
        gameModeSubmit({ action: ACTION_GO, mode: gameMode, difficulty, matchCount });
        return;
      }
      if (key === '.') {
        event.preventDefault();
        settingsClick();
        return;
      }
      if (key === '/') {
        event.preventDefault();
        helpClick();
        return;
      }
      const nextDifficulty = DIFFICULTY_KEYS[key];
      if (nextDifficulty && !selectionRules.disabledDifficulties.includes(nextDifficulty)) {
        event.preventDefault();
        handleDifficultyChange(nextDifficulty);
        return;
      }
      const nextMatchCount = MATCH_COUNT_KEYS[key];
      if (nextMatchCount) {
        event.preventDefault();
        handleMatchCountChange(nextMatchCount);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameMode, difficulty, matchCount, selectionRules.disabledDifficulties]);

  return (
    <div className='container d-flex flex-column flex-grow-1'>
      <div className='row mx-0 flex-grow-1 align-items-center justify-content-center'>
        <div className='col-12 col-sm-11 col-md-9 col-lg-7'>
          <div className='card shadow rounded-4'>
            <div className='card-header text-center'>
              <img src={APP_LOGO_FILE} height='32' width='auto'  />
            </div>
            <div className='card-body'>

              {/* ----- Game Mode ----- */}
              <fieldset className='mb-3'>
                <legend className='h5 form-label d-block app-mode-legend'>
                  {i18n.t('state-mode:game-mode')}
                </legend>
                <RadioImages
                  name={SAVE_NAME_MODE}
                  value={gameMode}
                  onChange={handleModeChange}
                  ariaLabel={i18n.t('state-mode:game-mode')}
                  options={GAME_MODES.map((mode) => ({
                    id: mode.id,
                    image: mode.image,
                    label: i18n.t(mode.labelKey),
                    description: i18n.t(mode.labelKey),
                    hint: true,
                    classes: mode.classes,
                  }))}
                />
              </fieldset>

              {/* ----- Difficulty ----- */}
              <fieldset className='mb-3'>
                <legend className='h5 form-label d-block app-mode-legend'>
                  {i18n.t('state-mode:difficulty')}
                </legend>
                <RadioButtons
                  name={SAVE_NAME_DIFFICULTY}
                  value={difficulty}
                  onChange={handleDifficultyChange}
                  ariaLabel={i18n.t('state-mode:difficulty')}
                  options={DIFFICULTIES.map((option) => ({
                    id: option.id,
                    label: i18n.t(option.labelKey),
                    variant: option.variant,
                    disabled: selectionRules.disabledDifficulties.includes(option.id),
                  }))}
                />
              </fieldset>

              {/* ----- Match Count ----- */}
              <fieldset className='mb-3'>
                <legend className='h5 form-label d-block app-mode-legend'>
                  {i18n.t('state-mode:match-count')}
                </legend>
                <RadioButtons
                  name={SAVE_NAME_COUNT}
                  value={matchCount}
                  onChange={handleMatchCountChange}
                  ariaLabel={i18n.t('state-mode:match-count')}
                  options={MATCH_COUNTS.map((option) => ({
                    id: option.id,
                    label: i18n.t(option.labelKey),
                    variant: option.variant,
                  }))}
                />
              </fieldset>

            </div>
            <div className='card-footer py-4'>
              <div className='d-flex justify-content-center align-items-center gap-2'>
                <button
                  type='button'
                  className='btn btn-success flex-grow-1'
                  onClick={() => gameModeSubmit({ action: ACTION_GO, mode: gameMode, difficulty, matchCount })}
                >
                  <i className='fa-solid me-2' aria-hidden='true'>&#xf04b;</i>
                  {i18n.t('state-mode:start')}
                </button>
                <button
                  type='button'
                  className='btn btn-primary'
                  aria-label={i18n.t('app:settings')}
                  data-bs-toggle='tooltip'
                  data-bs-placement='top'
                  data-bs-title={i18n.t('app:settings')}
                  onClick={settingsClick}
                >
                  <i className='fa-solid' aria-hidden='true'>&#x2699;</i>
                </button>
                <button
                  type='button'
                  className='btn btn-info'
                  aria-label={i18n.t('app:help')}
                  data-bs-toggle='tooltip'
                  data-bs-placement='top'
                  data-bs-title={i18n.t('app:help')}
                  onClick={helpClick}
                >
                  <i className='fa-solid' aria-hidden='true'>?</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
