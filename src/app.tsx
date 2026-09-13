// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useState } from 'preact/hooks'
import { Table } from './ui/table'
import { IntroScreen, type GameSetupOptions } from './ui/intro-screen'

export function App() {
  const [setup, setSetup] = useState<GameSetupOptions | null>(null)

  return (
    <Table>
      {setup ? (
        <p className='text-center text-white'>Game starting soon…</p>
      ) : (
        <IntroScreen onStart={setSetup} />
      )}
    </Table>
  )
}
