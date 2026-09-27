// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useState } from 'preact/hooks';
import { i18n } from '../core/i18n';
import { persistence } from '../core/persistence';
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
  SAVE_GROUP_OPTION,
  SAVE_NAME_MODE,
  SAVE_NAME_DIFFICULTY,
  SAVE_NAME_COUNT,
} from '../core/constants';
import { RadioButtons } from './radio-buttons';
import { RadioImages, type RadioImagesLayerClasses } from './radio-images';

const GAME_MODES: readonly {
  id: GameMode;
  image: string;
  labelKey: string;
  classes?: RadioImagesLayerClasses;
}[] = [
  { id: GAME_MODE_1, image: '/assets/img/menu/mode-1.png', labelKey: 'state-game-mode:mode1', classes: ['bg-color bg-texture', '', '', ''] },
  { id: GAME_MODE_2, image: '/assets/img/menu/mode-2.png', labelKey: 'state-game-mode:mode2', classes: ['bg-color bg-texture', '', '', ''] },
  { id: GAME_MODE_3, image: '/assets/img/menu/mode-3.png', labelKey: 'state-game-mode:mode3', classes: ['bg-color bg-texture', '', '', ''] },
  { id: GAME_MODE_4, image: '/assets/img/menu/mode-4.png', labelKey: 'state-game-mode:mode4', classes: ['bg-color bg-texture', '', '', ''] },
  { id: GAME_MODE_5, image: '/assets/img/menu/mode-5.png', labelKey: 'state-game-mode:mode5', classes: ['bg-color bg-texture', '', '', ''] },
];

const DIFFICULTIES = [
  { id: GAME_DIFFICULTY_EASY, labelKey: 'state-game-mode:difficulty-easy', variant: 'success' },
  { id: GAME_DIFFICULTY_NORMAL, labelKey: 'state-game-mode:difficulty-normal', variant: 'info' },
  { id: GAME_DIFFICULTY_HARD, labelKey: 'state-game-mode:difficulty-hard', variant: 'warning' },
] as const;

const MATCH_COUNTS = [
  { id: GAME_COUNT_ONE, labelKey: 'state-game-mode:match-count-one', variant: 'secondary' },
  { id: GAME_COUNT_TWO, labelKey: 'state-game-mode:match-count-two', variant: 'secondary' },
  { id: GAME_COUNT_THREE, labelKey: 'state-game-mode:match-count-three', variant: 'secondary' },
  { id: GAME_COUNT_FOUR, labelKey: 'state-game-mode:match-count-four', variant: 'secondary' },
] as const;

const DEFAULT_OPTIONS = {
  mode: GAME_MODE_1,
  difficulty: GAME_DIFFICULTY_NORMAL,
  count: GAME_COUNT_TWO,
} as const satisfies { mode: GameMode; difficulty: Difficulty; count: MatchCount };

function applySelectionRules(gameMode: GameMode, difficulty: Difficulty) {
  const disabledDifficulties: Difficulty[] = gameMode === GAME_MODE_5 ? [GAME_DIFFICULTY_EASY] : [];

  return {
    disabledDifficulties,
    difficulty: disabledDifficulties.includes(difficulty) ? GAME_DIFFICULTY_NORMAL : difficulty,
  };
}

function validOption<T extends string>(
  value: string,
  options: readonly { id: T }[],
  defaultValue: T,
): T {
  return options.find((option) => option.id === value)?.id ?? defaultValue;
}

function saveOption(name: string, value: string): void {
  void persistence.set(SAVE_GROUP_OPTION, name, value).catch((error: unknown) => {
    console.error(`[Persistence] Failed to save option ${name}:`, error);
  });
}

export function StateGameMode() {
  const [gameMode, setGameMode] = useState<GameMode>(DEFAULT_OPTIONS.mode);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_OPTIONS.difficulty);
  const [matchCount, setMatchCount] = useState<MatchCount>(DEFAULT_OPTIONS.count);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const selectionRules = applySelectionRules(gameMode, difficulty);

  useEffect(() => {
    let active = true;

    // Load each value after the prior read creates or opens the shared store.
    const loadOptions = async () => {
      try {
        const storedMode = await persistence.get(SAVE_GROUP_OPTION, SAVE_NAME_MODE, DEFAULT_OPTIONS.mode);
        const storedDifficulty = await persistence.get(
          SAVE_GROUP_OPTION,
          SAVE_NAME_DIFFICULTY,
          DEFAULT_OPTIONS.difficulty,
        );
        const storedMatchCount = await persistence.get(SAVE_GROUP_OPTION, SAVE_NAME_COUNT, DEFAULT_OPTIONS.count);
        if (!active) return;

        // Validate stored data, then apply rules before publishing the loaded state.
        const loadedMode = validOption(storedMode, GAME_MODES, DEFAULT_OPTIONS.mode);
        const loadedDifficulty = validOption(
          storedDifficulty,
          DIFFICULTIES,
          DEFAULT_OPTIONS.difficulty,
        );
        const loadedMatchCount = validOption(
          storedMatchCount,
          MATCH_COUNTS,
          DEFAULT_OPTIONS.count,
        );
        const rules = applySelectionRules(loadedMode, loadedDifficulty);

        setGameMode(loadedMode);
        setDifficulty(rules.difficulty);
        setMatchCount(loadedMatchCount);
        if (rules.difficulty !== loadedDifficulty) saveOption(SAVE_NAME_DIFFICULTY, rules.difficulty);
      } catch (error: unknown) {
        console.error('[Persistence] Failed to load game options:', error);
      } finally {
        if (active) setOptionsLoaded(true);
      }
    };

    void loadOptions();
    return () => {
      active = false;
    };
  }, []);

  // Apply dependent selection rules before committing the new game mode.
  const changeGameMode = (nextGameMode: GameMode) => {
    const nextDifficulty = applySelectionRules(nextGameMode, difficulty).difficulty;

    setGameMode(nextGameMode);
    setDifficulty(nextDifficulty);
    saveOption(SAVE_NAME_MODE, nextGameMode);
    if (nextDifficulty !== difficulty) saveOption(SAVE_NAME_DIFFICULTY, nextDifficulty);
  };

  const changeDifficulty = (nextDifficulty: Difficulty) => {
    setDifficulty(nextDifficulty);
    saveOption(SAVE_NAME_DIFFICULTY, nextDifficulty);
  };

  const changeMatchCount = (nextMatchCount: MatchCount) => {
    setMatchCount(nextMatchCount);
    saveOption(SAVE_NAME_COUNT, nextMatchCount);
  };

  if (!optionsLoaded) return null;

  return (
    <div className='container d-flex flex-column flex-grow-1'>
      <div className='row mx-0 flex-grow-1 align-items-center justify-content-center'>
        <div className='col-12 col-sm-11 col-md-9 col-lg-7'>
          <div className='card shadow rounded-4'>
            <div className='card-header text-center'>
              <img src='/assets/img/logo.svg' height='32' width='auto'  />
            </div>
            <div className='card-body'>

              {/* ----- Game Mode ----- */}
              <fieldset className='mb-3'>
                <legend className='h5 form-label d-block app-mode-legend'>
                  {i18n.t('state-game-mode:game-mode')}
                </legend>
                <RadioImages
                  name={SAVE_NAME_MODE}
                  value={gameMode}
                  onChange={changeGameMode}
                  ariaLabel={i18n.t('state-game-mode:game-mode')}
                  options={GAME_MODES.map((mode) => ({
                    id: mode.id,
                    image: mode.image,
                    label: i18n.t(mode.labelKey),
                    classes: mode.classes,
                  }))}
                />
              </fieldset>

              {/* ----- Difficulty ----- */}
              <fieldset className='mb-3'>
                <legend className='h5 form-label d-block app-mode-legend'>
                  {i18n.t('state-game-mode:difficulty')}
                </legend>
                <RadioButtons
                  name={SAVE_NAME_DIFFICULTY}
                  value={difficulty}
                  onChange={changeDifficulty}
                  ariaLabel={i18n.t('state-game-mode:difficulty')}
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
                  {i18n.t('state-game-mode:match-count')}
                </legend>
                <RadioButtons
                  name={SAVE_NAME_COUNT}
                  value={matchCount}
                  onChange={changeMatchCount}
                  ariaLabel={i18n.t('state-game-mode:match-count')}
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
                  onClick={() => gameModeSubmit(gameMode)}
                >
                  <i className='fa-solid me-2' aria-hidden='true'>&#xf04b;</i>
                  {i18n.t('state-game-mode:start')}
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
