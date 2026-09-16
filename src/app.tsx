// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useLayoutEffect, useState } from 'preact/hooks'
import { createPortal } from 'preact/compat'
import {
  DEFAULT_CARD_BACK,
  DEFAULT_GAME_DECK,
  DEFAULT_TABLE_COLOR,
  DEFAULT_TABLE_TEXTURE,
  GameScreen,
  GameStateAction,
  LEGACY_PERSISTENCE_SECTIONS,
  PERSISTENCE_SECTION_GAME_STATE,
  PERSISTENCE_SECTION_SETTINGS,
  TABLE_COLOR_HEX,
  TABLE_SPOTLIGHT_PATH,
  TABLE_TEXTURE_PATH,
  TableColor,
  TableTexture,
} from './core/constants'
import {
  INITIAL_GAME_STATE,
  isGameState,
  transitionGameState,
  type GameState,
} from './core/game-state-engine'
import { persistanceEngine } from './core/persistance-engine'
import { Table } from './ui/table'
import { IntroScreen } from './ui/intro-screen'
import { SettingsScreen } from './ui/settings-screen'
import { HelpScreen } from './ui/help-screen'
import { WelcomeScreen } from './ui/welcome-screen'

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
const isDeckId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0
const isCardBack = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-z]$/.test(value)
const isTableColor = (value: unknown): value is TableColor =>
  typeof value === 'string' && Object.values(TableColor).some((tableColor) => tableColor === value)
const isTableTexture = (value: unknown): value is TableTexture =>
  typeof value === 'string' && Object.values(TableTexture).some((texture) => texture === value)
type CardBackSelections = Record<string, string>
const isCardBackSelections = (value: unknown): value is CardBackSelections =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
  && Object.entries(value).every(([deckId, cardBack]) => isDeckId(deckId) && isCardBack(cardBack))

interface PersistedSettings {
  gameDeck: string
  cardBacks: CardBackSelections
  tableColor: TableColor
  tableTexture: TableTexture
}

type StoredSettings = Omit<PersistedSettings, 'tableColor' | 'tableTexture'> & {
  open?: boolean
  tableColor?: TableColor
  tableTexture?: TableTexture
}

const isStoredSettings = (value: unknown): value is StoredSettings => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const settings = value as Record<string, unknown>
  return isDeckId(settings.gameDeck)
    && isCardBackSelections(settings.cardBacks)
    && (settings.open === undefined || isBoolean(settings.open))
    && (settings.tableColor === undefined || isTableColor(settings.tableColor))
    && (settings.tableTexture === undefined || isTableTexture(settings.tableTexture))
}

function loadSettings(): PersistedSettings {
  const stored = persistanceEngine.load(PERSISTENCE_SECTION_SETTINGS, isStoredSettings)
  if (stored) {
    const normalized: PersistedSettings = {
      gameDeck: stored.gameDeck,
      cardBacks: stored.cardBacks,
      tableColor: stored.tableColor ?? DEFAULT_TABLE_COLOR,
      tableTexture: stored.tableTexture ?? DEFAULT_TABLE_TEXTURE,
    }
    if (stored.open !== undefined || stored.tableColor === undefined || stored.tableTexture === undefined) {
      persistanceEngine.save(PERSISTENCE_SECTION_SETTINGS, normalized)
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
  }
  persistanceEngine.save(PERSISTENCE_SECTION_SETTINGS, migrated)
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

function loadGameState(): GameState {
  const stored = persistanceEngine.load(PERSISTENCE_SECTION_GAME_STATE, isGameState)
  if (stored) {
    if (stored.screen === GameScreen.INTRO) {
      persistanceEngine.save(PERSISTENCE_SECTION_GAME_STATE, INITIAL_GAME_STATE)
      return INITIAL_GAME_STATE
    }
    return stored
  }

  const formerSettings = persistanceEngine.load(PERSISTENCE_SECTION_SETTINGS, hasSettingsVisibility)
  const formerSettingsOpen = formerSettings?.open
    ?? persistanceEngine.loadLegacy('settings-screen', isBoolean)
    ?? false
  const initial = formerSettingsOpen
    ? { screen: GameScreen.SETTINGS }
    : INITIAL_GAME_STATE
  persistanceEngine.save(PERSISTENCE_SECTION_GAME_STATE, initial)
  return initial
}

export function App() {
  const [gameState, setGameState] = useState<GameState>(loadGameState)
  const [settings, setSettings] = useState<PersistedSettings>(loadSettings)
  const cardBack = settings.cardBacks[settings.gameDeck] ?? DEFAULT_CARD_BACK

  useLayoutEffect(() => {
    const app = document.getElementById('app')
    if (!app) return

    const previous = {
      backgroundColor: app.style.backgroundColor,
      backgroundImage: app.style.backgroundImage,
      backgroundSize: app.style.backgroundSize,
      backgroundRepeat: app.style.backgroundRepeat,
    }

    app.style.backgroundColor = TABLE_COLOR_HEX[settings.tableColor]
    app.style.backgroundImage = `url(${TABLE_SPOTLIGHT_PATH}), url(${TABLE_TEXTURE_PATH[settings.tableTexture]})`
    app.style.backgroundSize = '100% 100%, auto'
    app.style.backgroundRepeat = 'no-repeat, repeat'

    return () => {
      app.style.backgroundColor = previous.backgroundColor
      app.style.backgroundImage = previous.backgroundImage
      app.style.backgroundSize = previous.backgroundSize
      app.style.backgroundRepeat = previous.backgroundRepeat
    }
  }, [settings.tableColor, settings.tableTexture])

  const transition = (action: GameStateAction) => {
    setGameState((current) => {
      const next = transitionGameState(current, action)
      if (next !== current) persistanceEngine.save(PERSISTENCE_SECTION_GAME_STATE, next)
      return next
    })
  }

  const updateSettings = (update: (current: PersistedSettings) => PersistedSettings) => {
    setSettings((current) => {
      const next = update(current)
      persistanceEngine.save(PERSISTENCE_SECTION_SETTINGS, next)
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

  const introVisible = [
    GameScreen.INTRO,
    GameScreen.HELP,
    GameScreen.SETTINGS,
  ].includes(gameState.screen)

  return (
    <>
      <Table>
        {gameState.screen === GameScreen.PLAYING ? (
          // TODO : Start game engine
          <p className='text-center text-white'>Game starting soon…</p>
        ) : gameState.screen === GameScreen.YOU_WIN ? (
          // TODO : Win animation
          <p className='text-center text-white'>You win</p>
        ) : gameState.screen === GameScreen.YOU_LOSE ? (
          // TODO : Loss animation
          <p className='text-center text-white'>You lose</p>
        ) : null}
      </Table>
      {gameState.screen === GameScreen.WELCOME ? (
        <div className='screen-overlay'>
          <WelcomeScreen onContinue={() => transition(GameStateAction.WELCOME_COMPLETE)} />
        </div>
      ) : introVisible && (
        <div className='screen-overlay'>
          <IntroScreen
            onStart={() => transition(GameStateAction.START_GAME)}
            onSettings={() => transition(GameStateAction.OPEN_SETTINGS)}
            onHelp={() => transition(GameStateAction.OPEN_HELP)}
            cardDeck={settings.gameDeck}
            cardBack={cardBack}
            tableColor={TABLE_COLOR_HEX[settings.tableColor]}
            tableTexture={TABLE_TEXTURE_PATH[settings.tableTexture]}
            shortcutsEnabled={gameState.screen === GameScreen.INTRO}
          />
        </div>
      )}
      {createPortal(
        <SettingsScreen
          open={gameState.screen === GameScreen.SETTINGS}
          onClose={() => transition(GameStateAction.CLOSE_SETTINGS)}
          selectedDeck={settings.gameDeck}
          onDeckChange={selectGameDeck}
          selectedCardBack={cardBack}
          onCardBackChange={selectCardBack}
          selectedTableColor={settings.tableColor}
          onTableColorChange={selectTableColor}
          selectedTableTexture={settings.tableTexture}
          onTableTextureChange={selectTableTexture}
        />,
        document.body,
      )}
      {createPortal(
        <HelpScreen
          open={gameState.screen === GameScreen.HELP}
          onClose={() => transition(GameStateAction.CLOSE_HELP)}
        />,
        document.body,
      )}
    </>
  )
}
