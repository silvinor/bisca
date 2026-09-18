// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useLayoutEffect, useState } from 'preact/hooks'
import { createPortal } from 'preact/compat'
import {
  APP_BAR_HEIGHT_REM,
  APP_COPYRIGHT_HOLDER,
  DEFAULT_CARD_BACK,
  DEFAULT_COURT_CARD_POINTS,
  DEFAULT_GAME_DECK,
  DEFAULT_SCORE_KEEPING,
  DEFAULT_TABLE_COLOR,
  DEFAULT_TABLE_TEXTURE,
  DEFAULT_TEN_CARD,
  GameScreen,
  ScreenStateAction,
  LEGACY_PERSISTENCE_SECTIONS,
  PERSISTENCE_SCREEN_STATE,
  PERSISTENCE_SETTINGS,
  TABLE_COLOR_HEX,
  TABLE_SPOTLIGHT_PATH,
  TABLE_TEXTURE_PATH,
  CourtCardPoints,
  ScoreKeeping,
  TableColor,
  TableTexture,
  TenCard,
} from './core/constants'
import { APP_BUILD, APP_VERSION, APP_YEAR } from './core/version'
import {
  INITIAL_SCREEN_STATE,
  isScreenState,
  transitionScreenState,
  type ScreenState,
} from './core/screen-state-engine'
import { persistanceEngine } from './core/persistance-engine'
import { i18n } from './core/i18n'
import { Table } from './ui/table'
import { IntroScreen } from './ui/intro-screen'
import { SettingsScreen } from './ui/settings-screen'
import { HelpScreen } from './ui/help-screen'
import { WelcomeScreen } from './ui/welcome-screen'
import { PlayScreen } from './ui/play-screen'

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
const isDeckId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0
const isCardBack = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-z]$/.test(value)
const isTableColor = (value: unknown): value is TableColor =>
  typeof value === 'string' && Object.values(TableColor).some((tableColor) => tableColor === value)
const isTableTexture = (value: unknown): value is TableTexture =>
  typeof value === 'string' && Object.values(TableTexture).some((texture) => texture === value)
const isTenCard = (value: unknown): value is TenCard =>
  value === TenCard.SEVEN || value === TenCard.THREE || value === TenCard.TEN
const isCourtCardPoints = (value: unknown): value is CourtCardPoints =>
  value === CourtCardPoints.QUEEN_TWO_JACK_THREE
  || value === CourtCardPoints.JACK_TWO_QUEEN_THREE
const isScoreKeeping = (value: unknown): value is ScoreKeeping =>
  value === ScoreKeeping.COMBS || value === ScoreKeeping.CROSSES
type CardBackSelections = Record<string, string>
const isCardBackSelections = (value: unknown): value is CardBackSelections =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
  && Object.entries(value).every(([deckId, cardBack]) => isDeckId(deckId) && isCardBack(cardBack))

interface PersistedSettings {
  gameDeck: string
  cardBacks: CardBackSelections
  tableColor: TableColor
  tableTexture: TableTexture
  tenCard: TenCard
  courtCardPoints: CourtCardPoints
  scoreKeeping: ScoreKeeping
}

type StoredSettings = Omit<
  PersistedSettings,
  'tableColor' | 'tableTexture' | 'tenCard' | 'courtCardPoints' | 'scoreKeeping'
> & {
  open?: boolean
  tableColor?: TableColor
  tableTexture?: TableTexture
  tenCard?: TenCard
  courtCardPoints?: CourtCardPoints
  scoreKeeping?: ScoreKeeping
}

const isStoredSettings = (value: unknown): value is StoredSettings => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const settings = value as Record<string, unknown>
  return isDeckId(settings.gameDeck)
    && isCardBackSelections(settings.cardBacks)
    && (settings.open === undefined || isBoolean(settings.open))
    && (settings.tableColor === undefined || isTableColor(settings.tableColor))
    && (settings.tableTexture === undefined || isTableTexture(settings.tableTexture))
    && (settings.tenCard === undefined || isTenCard(settings.tenCard))
    && (settings.courtCardPoints === undefined || isCourtCardPoints(settings.courtCardPoints))
    && (settings.scoreKeeping === undefined || isScoreKeeping(settings.scoreKeeping))
}

function loadSettings(): PersistedSettings {
  const stored = persistanceEngine.load(PERSISTENCE_SETTINGS, isStoredSettings)
  if (stored) {
    const normalized: PersistedSettings = {
      gameDeck: stored.gameDeck,
      cardBacks: stored.cardBacks,
      tableColor: stored.tableColor ?? DEFAULT_TABLE_COLOR,
      tableTexture: stored.tableTexture ?? DEFAULT_TABLE_TEXTURE,
      tenCard: stored.tenCard ?? DEFAULT_TEN_CARD,
      courtCardPoints: stored.courtCardPoints ?? DEFAULT_COURT_CARD_POINTS,
      scoreKeeping: stored.scoreKeeping ?? DEFAULT_SCORE_KEEPING,
    }
    if (
      stored.open !== undefined
      || stored.tableColor === undefined
      || stored.tableTexture === undefined
      || stored.tenCard === undefined
      || stored.courtCardPoints === undefined
      || stored.scoreKeeping === undefined
    ) {
      persistanceEngine.save(PERSISTENCE_SETTINGS, normalized)
    }
    persistanceEngine.clearLegacy(LEGACY_PERSISTENCE_SECTIONS)
    return normalized
  }

  const gameDeck = persistanceEngine.loadLegacy('game-deck', isDeckId) ?? DEFAULT_GAME_DECK
  const cardBacks = persistanceEngine.loadLegacy('card-backs', isCardBackSelections) ?? {}
  const formerCardBack = persistanceEngine.loadLegacy('card-back', isCardBack)
  const migrated = {
    gameDeck,
    cardBacks: formerCardBack && !cardBacks[gameDeck]
      ? { ...cardBacks, [gameDeck]: formerCardBack }
      : cardBacks,
    tableColor: DEFAULT_TABLE_COLOR,
    tableTexture: DEFAULT_TABLE_TEXTURE,
    tenCard: DEFAULT_TEN_CARD,
    courtCardPoints: DEFAULT_COURT_CARD_POINTS,
    scoreKeeping: DEFAULT_SCORE_KEEPING,
  }
  persistanceEngine.save(PERSISTENCE_SETTINGS, migrated)
  persistanceEngine.clearLegacy(LEGACY_PERSISTENCE_SECTIONS)
  return migrated
}

interface LegacySettingsVisibility {
  open: boolean
}

const hasSettingsVisibility = (value: unknown): value is LegacySettingsVisibility => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  return isBoolean((value as Record<string, unknown>).open)
}

function loadScreenState(): ScreenState {
  const stored = persistanceEngine.load(PERSISTENCE_SCREEN_STATE, isScreenState)
  if (stored) {
    if (stored.screen === GameScreen.INTRO) {
      persistanceEngine.save(PERSISTENCE_SCREEN_STATE, INITIAL_SCREEN_STATE)
      return INITIAL_SCREEN_STATE
    }
    return stored
  }

  const formerSettings = persistanceEngine.load(PERSISTENCE_SETTINGS, hasSettingsVisibility)
  const formerSettingsOpen = formerSettings?.open
    ?? persistanceEngine.loadLegacy('settings-screen', isBoolean)
    ?? false
  const initial = formerSettingsOpen
    ? { screen: GameScreen.SETTINGS }
    : INITIAL_SCREEN_STATE
  persistanceEngine.save(PERSISTENCE_SCREEN_STATE, initial)
  return initial
}

export function App() {
  const [screenState, setScreenState] = useState<ScreenState>(loadScreenState)
  const [settings, setSettings] = useState<PersistedSettings>(loadSettings)
  const cardBack = settings.cardBacks[settings.gameDeck] ?? DEFAULT_CARD_BACK

  useLayoutEffect(() => {
    const screenStateClass = screenState.screen.toLowerCase()
    document.body.classList.add(screenStateClass)

    return () => document.body.classList.remove(screenStateClass)
  }, [screenState.screen])

  useLayoutEffect(() => {
    const app = document.getElementById('app')
    if (!app) return

    const previous = {
      backgroundColor: app.style.backgroundColor,
      backgroundImage: app.style.backgroundImage,
      backgroundSize: app.style.backgroundSize,
      backgroundRepeat: app.style.backgroundRepeat,
      appBarHeight: app.style.getPropertyValue('--app-bar-height'),
    }

    app.style.backgroundColor = TABLE_COLOR_HEX[settings.tableColor]
    app.style.backgroundImage = `url(${TABLE_SPOTLIGHT_PATH}), url(${TABLE_TEXTURE_PATH[settings.tableTexture]})`
    app.style.backgroundSize = '100% 100%, auto'
    app.style.backgroundRepeat = 'no-repeat, repeat'
    app.style.setProperty('--app-bar-height', `${APP_BAR_HEIGHT_REM}rem`)

    return () => {
      app.style.backgroundColor = previous.backgroundColor
      app.style.backgroundImage = previous.backgroundImage
      app.style.backgroundSize = previous.backgroundSize
      app.style.backgroundRepeat = previous.backgroundRepeat
      if (previous.appBarHeight) {
        app.style.setProperty('--app-bar-height', previous.appBarHeight)
      } else {
        app.style.removeProperty('--app-bar-height')
      }
    }
  }, [settings.tableColor, settings.tableTexture])

  const transition = (action: ScreenStateAction) => {
    setScreenState((current) => {
      const next = transitionScreenState(current, action)
      if (next !== current) persistanceEngine.save(PERSISTENCE_SCREEN_STATE, next)
      return next
    })
  }

  const updateSettings = (update: (current: PersistedSettings) => PersistedSettings) => {
    setSettings((current) => {
      const next = update(current)
      persistanceEngine.save(PERSISTENCE_SETTINGS, next)
      return next
    })
  }

  const selectGameDeck = (deckId: string) => {
    updateSettings((current) => ({ ...current, gameDeck: deckId }))
  }

  const selectCardBack = (backId: string) => {
    updateSettings((current) => ({
      ...current,
      cardBacks: { ...current.cardBacks, [current.gameDeck]: backId },
    }))
  }

  const selectTableColor = (tableColor: TableColor) => {
    updateSettings((current) => ({ ...current, tableColor }))
  }

  const selectTableTexture = (tableTexture: TableTexture) => {
    updateSettings((current) => ({ ...current, tableTexture }))
  }

  const selectTenCard = (tenCard: TenCard) => {
    updateSettings((current) => ({ ...current, tenCard }))
  }

  const selectCourtCardPoints = (courtCardPoints: CourtCardPoints) => {
    updateSettings((current) => ({ ...current, courtCardPoints }))
  }

  const selectScoreKeeping = (scoreKeeping: ScoreKeeping) => {
    updateSettings((current) => ({ ...current, scoreKeeping }))
  }

  const handleWelcomeComplete = () => {
    transition(ScreenStateAction.WELCOME_COMPLETE)
  }

  const handleHeaderClose = () => {
    // TODO: Replace this with progression-aware close behavior once gameplay is implemented.
  
    if (screenState.screen === GameScreen.WELCOME) {
      handleWelcomeComplete()
      return
    }

    transition(ScreenStateAction.RETURN_TO_WELCOME)
  }

  const introVisible = [
    GameScreen.INTRO,
    GameScreen.HELP,
    GameScreen.SETTINGS,
  ].includes(screenState.screen)

  return (
    <>
      <header className='app-header p-1'>
        <button
          type='button'
          className='app-close-button btn btn-outline-secondary xxxp-0 xxxm-1'
          aria-label={i18n.t('intro.close', 'Close')}
          onClick={handleHeaderClose}
        >
          <i className='fa-solid fa-xmark' aria-hidden='true' />
        </button>
      </header>
      <main className='app-content'>
        <Table>
          {screenState.screen === GameScreen.PLAYING ? (
            <PlayScreen />
          ) : screenState.screen === GameScreen.YOU_WIN ? (
            // TODO : Win animation
            <p className='text-center text-white'>You win</p>
          ) : screenState.screen === GameScreen.YOU_LOSE ? (
            // TODO : Loss animation
            <p className='text-center text-white'>You lose</p>
          ) : null}
        </Table>
        {screenState.screen === GameScreen.WELCOME ? (
          <div className='screen-overlay'>
            <WelcomeScreen onContinue={handleWelcomeComplete} />
          </div>
        ) : introVisible && (
          <div className='screen-overlay'>
            <IntroScreen
              onStart={() => transition(ScreenStateAction.START_GAME)}
              onSettings={() => transition(ScreenStateAction.OPEN_SETTINGS)}
              onHelp={() => transition(ScreenStateAction.OPEN_HELP)}
              cardDeck={settings.gameDeck}
              cardBack={cardBack}
              tableColor={TABLE_COLOR_HEX[settings.tableColor]}
              tableTexture={TABLE_TEXTURE_PATH[settings.tableTexture]}
              shortcutsEnabled={screenState.screen === GameScreen.INTRO}
            />
          </div>
        )}
      </main>
      <footer className='app-footer'>
        © {APP_YEAR} {APP_COPYRIGHT_HOLDER} <i class="fa-solid fa-ellipsis-vertical"></i> v{APP_VERSION} ({APP_BUILD})
      </footer>
      {createPortal(
        <SettingsScreen
          open={screenState.screen === GameScreen.SETTINGS}
          onClose={() => transition(ScreenStateAction.CLOSE_SETTINGS)}
          selectedDeck={settings.gameDeck}
          onDeckChange={selectGameDeck}
          selectedCardBack={cardBack}
          onCardBackChange={selectCardBack}
          selectedTableColor={settings.tableColor}
          onTableColorChange={selectTableColor}
          selectedTableTexture={settings.tableTexture}
          onTableTextureChange={selectTableTexture}
          selectedTenCard={settings.tenCard}
          onTenCardChange={selectTenCard}
          selectedCourtCardPoints={settings.courtCardPoints}
          onCourtCardPointsChange={selectCourtCardPoints}
          selectedScoreKeeping={settings.scoreKeeping}
          onScoreKeepingChange={selectScoreKeeping}
        />,
        document.body,
      )}
      {createPortal(
        <HelpScreen
          open={screenState.screen === GameScreen.HELP}
          onClose={() => transition(ScreenStateAction.CLOSE_HELP)}
        />,
        document.body,
      )}
    </>
  )
}
