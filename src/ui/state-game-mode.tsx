// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useState } from 'preact/hooks';
import { i18n } from '../core/i18n';
import { RadioImages } from './radio-images';

const GAME_MODES = [
  { id: 'mode1', image: '/assets/img/menu/mode-1.png', labelKey: 'state-game-mode:mode1' },
  { id: 'mode2', image: '/assets/img/menu/mode-2.png', labelKey: 'state-game-mode:mode2' },
  { id: 'mode3', image: '/assets/img/menu/mode-3.png', labelKey: 'state-game-mode:mode3' },
  { id: 'mode4', image: '/assets/img/menu/mode-4.png', labelKey: 'state-game-mode:mode4' },
  { id: 'mode5', image: '/assets/img/menu/mode-5.png', labelKey: 'state-game-mode:mode5' },
] as const;

type GameMode = (typeof GAME_MODES)[number]['id'];

export function StateGameMode() {
  const [gameMode, setGameMode] = useState<GameMode>('mode1');

  return (
    <div className='container d-flex flex-column flex-grow-1'>
      <div className='row mx-0 flex-grow-1 align-items-center justify-content-center'>
        <div className='col-12 col-sm-11 col-md-9 col-lg-7'>
          <div className='card shadow rounded-4'>
            <div className='card-header text-center'>
              <img src='/assets/img/logo.svg' height='32' width='auto'  />
            </div>
            <div className='card-body'>
              <div className='mb-3'>
                <fieldset className='mb-3'>
                  <h5 className='form-label d-block'>
                    {i18n.t('state-game-mode:game-mode')}
                  </h5>
                  <RadioImages
                    name='game-mode'
                    value={gameMode}
                    onChange={setGameMode}
                    ariaLabel={i18n.t('state-game-mode:game-mode')}
                    options={GAME_MODES.map((mode) => ({
                      id: mode.id,
                      image: mode.image,
                      label: i18n.t(mode.labelKey),
                    }))}
                  />
                </fieldset>
              </div>
            </div>
            <div className='card-footer'>
              Buttons here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
