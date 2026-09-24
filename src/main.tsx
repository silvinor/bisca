// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { render } from 'preact'
import { App } from './app.tsx'
import { i18n } from './core/i18n.ts'
import { gameEngine } from './core/main-loop.ts'
import { settings } from './core/settings.ts'
import {
  I18N_APP_NAME
} from "./core/constants.ts"
import '../scss/app.scss'

window.isDebug = import.meta.env.DEV
window.gameEngine = gameEngine
document.body.classList.toggle('debug', window.isDebug)

let bodyStateClass: string | null = null
gameEngine.subscribe((state) => {
  if (bodyStateClass !== null) document.body.classList.remove(bodyStateClass)
  document.body.classList.add(state)
  bodyStateClass = state
})

type TooltipConstructor = new (
  element: HTMLElement,
  options: {
    selector: string
    html: boolean
    title: (element: Element) => string | null
  },
) => unknown

function enableTooltips(): void {
  const Tooltip = (window as Window & {
    bootstrap?: { Tooltip?: TooltipConstructor }
  }).bootstrap?.Tooltip

  if (!Tooltip) return

  new Tooltip(document.body, {
    selector: '[data-bs-toggle="tooltip"]',
    html: true,
    // Bootstrap caches data attributes on first hover; read Preact's current title on every show.
    title: (element) => element.getAttribute('data-bs-title'),
  })
}

async function runGameEngine(): Promise<void> {
  gameEngine.start()

  // Each iteration waits inside the active state's tick until that state can progress.
  while (!gameEngine.finished) {
    await gameEngine.frame()
  }
}

const languageReady = i18n.init().then(() => {
  document.title = i18n.t(I18N_APP_NAME)
})

Promise.all([settings.init(), languageReady]).then(async () => {
  render(<App />, document.getElementById('app')!)
  enableTooltips()
  await runGameEngine()
}).catch((error: unknown) => {
  console.error('[Startup] Unable to initialise app:', error)
  document.getElementById('app')!.textContent = i18n.t('main:startupError')
})
