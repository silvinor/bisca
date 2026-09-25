// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useState } from 'preact/hooks';
import { i18n } from '../core/i18n';
import { gameModeSubmit, helpClick, settingsClick } from '../core/reactions';
import type { Difficulty, GameMode, MatchCount } from '../types/game-state';
import { RadioButtons } from './radio-buttons';
import { RadioImages } from './radio-images';

const GAME_MODES: readonly { id: GameMode; image: string; labelKey: string }[] = [
  { id: 'mode1', image: '/assets/img/menu/mode-1.png', labelKey: 'state-game-mode:mode1' },
  { id: 'mode2', image: '/assets/img/menu/mode-2.png', labelKey: 'state-game-mode:mode2' },
  { id: 'mode3', image: '/assets/img/menu/mode-3.png', labelKey: 'state-game-mode:mode3' },
  { id: 'mode4', image: '/assets/img/menu/mode-4.png', labelKey: 'state-game-mode:mode4' },
  { id: 'mode5', image: '/assets/img/menu/mode-5.png', labelKey: 'state-game-mode:mode5' },
];

const DIFFICULTIES = [
  { id: 'easy', labelKey: 'state-game-mode:difficulty-easy', variant: 'success' },
  { id: 'normal', labelKey: 'state-game-mode:difficulty-normal', variant: 'info' },
  { id: 'hard', labelKey: 'state-game-mode:difficulty-hard', variant: 'warning' },
] as const;

const MATCH_COUNTS = [
  { id: 'one', labelKey: 'state-game-mode:match-count-one', variant: 'secondary' },
  { id: 'two', labelKey: 'state-game-mode:match-count-two', variant: 'secondary' },
  { id: 'three', labelKey: 'state-game-mode:match-count-three', variant: 'secondary' },
  { id: 'four', labelKey: 'state-game-mode:match-count-four', variant: 'secondary' },
] as const;

function applySelectionRules(gameMode: GameMode, difficulty: Difficulty) {
  const disabledDifficulties: Difficulty[] = gameMode === 'mode5' ? ['easy'] : [];

  return {
    disabledDifficulties,
    difficulty: disabledDifficulties.includes(difficulty) ? 'normal' : difficulty,
  };
}

export function StateGameMode() {
  const [gameMode, setGameMode] = useState<GameMode>('mode1');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [matchCount, setMatchCount] = useState<MatchCount>('one');
  const selectionRules = applySelectionRules(gameMode, difficulty);

  // Apply dependent selection rules before committing the new game mode.
  const changeGameMode = (nextGameMode: GameMode) => {
    setGameMode(nextGameMode);
    setDifficulty((currentDifficulty) =>
      applySelectionRules(nextGameMode, currentDifficulty).difficulty,
    );
  };

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
                <legend className='h5 form-label d-block'>
                  {i18n.t('state-game-mode:game-mode')}
                </legend>
                <RadioImages
                  name='game-mode'
                  value={gameMode}
                  onChange={changeGameMode}
                  ariaLabel={i18n.t('state-game-mode:game-mode')}
                  layerClassNames={['class1', 'class2', 'class3', 'class4']}
                  options={GAME_MODES.map((mode) => ({
                    id: mode.id,
                    image: mode.image,
                    label: i18n.t(mode.labelKey),
                  }))}
                />
              </fieldset>

              {/* ----- Difficulty ----- */}
              <fieldset className='mb-3'>
                <legend className='h5 form-label d-block'>
                  {i18n.t('state-game-mode:difficulty')}
                </legend>
                <RadioButtons
                  name='difficulty'
                  value={difficulty}
                  onChange={setDifficulty}
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
                <legend className='h5 form-label d-block'>
                  {i18n.t('state-game-mode:match-count')}
                </legend>
                <RadioButtons
                  name='match-count'
                  value={matchCount}
                  onChange={setMatchCount}
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
