// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useLayoutEffect, useState } from 'preact/hooks';
import { i18n } from './core/i18n'
import { gameEngine, type ActiveGameState } from './core/main-loop';
import {
  I18N_APP_NAME,
  APP_COPYRIGHT_HOLDER,
} from './core/constants';
import {
  APP_YEAR,
  APP_VERSION,
  APP_BUILD,
  APP_URL,
} from './core/version';
import { StateMain } from './types/game-state';
import { NavButton } from './ui/nav-button';
import {
  closeClick,
  helpClick,
  quitClick,
  settingsClick,
} from './core/reactions';

const navButtonsByState: Record<ActiveGameState, string> = {
  [StateMain.INIT]: '',
  [StateMain.SPLASH]: 'c',
  [StateMain.GAME_MODE]: 'sh',
  [StateMain.SELECT_DEALER]: 'shq',
  [StateMain.PLAY]: 'shq',
  [StateMain.WIN_LOSE]: '',
  [StateMain.SETTINGS]: 'hc',
  [StateMain.HELP]: 'c',
  [StateMain.RESUME]: '',
};

function renderNavButtons(state: ActiveGameState) {
  const buttons = navButtonsByState[state];

  return (
    <>
      {buttons.includes('s') && (
        <NavButton
          bs_class='btn-outline-info'
          fa_inner='⚙'
          text={i18n.t('app:settings')}
          onClick={settingsClick}
        />
      )}
      {buttons.includes('h') && (
        <NavButton
          bs_class='btn-outline-success'
          fa_inner='?'
          text={i18n.t('app:help')}
          onClick={helpClick}
        />
      )}
      {buttons.includes('c') && (
        <NavButton
          bs_class='btn-outline-danger'
          fa_inner='×'
          text={i18n.t('app:close')}
          onClick={closeClick}
        />
      )}
      {buttons.includes('q') && (
        <NavButton
          bs_class='btn-outline-secondary'
          fa_inner='×'
          text={i18n.t('app:quit')}
          onClick={quitClick}
        />
      )}
    </>
  );
}

export function App() {
  const [navState, setNavState] = useState<ActiveGameState>(gameEngine.activeState);

  useLayoutEffect(() => gameEngine.subscribe(setNavState), []);

  return (
    <div className='d-flex flex-column min-vh-100'>
      <header id='app_header'>
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
          <div class="container-fluid">
            <div class="navbar-brand">
              <img
                src="assets/img/logo.svg"
                alt={i18n.t(I18N_APP_NAME)}
                className='app-logo'
                />
            </div>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <div class="navbar-nav me-auto" />
              <form class="d-flex">
                {renderNavButtons(navState)}
              </form>
            </div>
          </div>
        </nav>
      </header>
      <main id="app_main" className='d-flex flex-grow-1' />
      <footer id="app_footer" className='sticky-bottom text-center bg-body-tertiary py-1'>
        <i class="fa-solid">©</i> {APP_YEAR} {APP_COPYRIGHT_HOLDER} <i class="fa-solid">&#xf142;</i> v{APP_VERSION} ({APP_BUILD}) <i class="fa-solid">&#xf142;</i> <a href={APP_URL}><i class="fa-brands fa-github-alt" /></a>
      </footer>
    </div>
  )
}
