// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { render } from 'preact'
import { App } from './app.tsx'
import { APP_NAME_FALLBACK } from './core/constants.ts'
import { i18n } from './core/i18n.ts'
import { settings } from './core/settings.ts'

Promise.all([i18n.init(), settings.init()]).then(() => {
  document.title = i18n.t('appName', APP_NAME_FALLBACK)
  render(<App />, document.getElementById('app')!)
})
