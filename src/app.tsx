// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useState } from 'preact/hooks'
import {
  DEFAULT_GAME_DECK,
  PERSISTENCE_SECTION_GAME_DECK,
  PERSISTENCE_SECTION_HELP_SCREEN,
  PERSISTENCE_SECTION_SETTINGS_SCREEN,
} from './core/constants'
import { persistanceEngine } from './core/persistance-engine'
import { Table } from './ui/table'
import { IntroScreen, type GameSetupOptions } from './ui/intro-screen'
import { SettingsScreen } from './ui/settings-screen'
import { HelpScreen } from './ui/help-screen'

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
const isDeckId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

export function App() {
  const [setup, setSetup] = useState<GameSetupOptions | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(() =>
    persistanceEngine.load(PERSISTENCE_SECTION_SETTINGS_SCREEN, isBoolean) ?? false,
  )
  const [helpOpen, setHelpOpen] = useState(() =>
    persistanceEngine.load(PERSISTENCE_SECTION_HELP_SCREEN, isBoolean) ?? false,
  )
  const [gameDeck, setGameDeck] = useState(() =>
    persistanceEngine.load(PERSISTENCE_SECTION_GAME_DECK, isDeckId) ?? DEFAULT_GAME_DECK,
  )

  const setSettingsVisibility = (open: boolean) => {
    persistanceEngine.save(PERSISTENCE_SECTION_SETTINGS_SCREEN, open)
    setSettingsOpen(open)
  }

  const setHelpVisibility = (open: boolean) => {
    persistanceEngine.save(PERSISTENCE_SECTION_HELP_SCREEN, open)
    setHelpOpen(open)
  }

  const selectGameDeck = (deckId: string) => {
    persistanceEngine.save(PERSISTENCE_SECTION_GAME_DECK, deckId)
    setGameDeck(deckId)
  }

  return (
    <>
      <Table>
        {setup ? (
          <p className='text-center text-white'>Game starting soon…</p>
        ) : (
          <IntroScreen
            onStart={setSetup}
            onSettings={() => setSettingsVisibility(true)}
            onHelp={() => setHelpVisibility(true)}
            cardDeck={gameDeck}
            shortcutsEnabled={!settingsOpen && !helpOpen}
          />
        )}
      </Table>
      <SettingsScreen
        open={settingsOpen}
        onClose={() => setSettingsVisibility(false)}
        selectedDeck={gameDeck}
        onDeckChange={selectGameDeck}
      />
      <HelpScreen
        open={helpOpen}
        onClose={() => setHelpVisibility(false)}
      />
    </>
  )
}
