// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useState } from 'preact/hooks';
import { PERSISTENCE_GAME_ENGINE } from '../core/constants';
import { GameEngine, isGameEngineData } from '../core/game-engine';
import { persistanceEngine } from '../core/persistance-engine';

function loadGameEngine(): GameEngine {
  const stored = persistanceEngine.load(
    PERSISTENCE_GAME_ENGINE,
    isGameEngineData,
  );

  return new GameEngine(stored ?? undefined);
}

export function PlayScreen() {
  const [gameEngine] = useState<GameEngine>(loadGameEngine);

  useEffect(() => {
    const persistGame = () => {
      persistanceEngine.save(PERSISTENCE_GAME_ENGINE, gameEngine);
    };

    persistGame();
    window.addEventListener('pagehide', persistGame);
    return () => {
      persistGame();
      window.removeEventListener('pagehide', persistGame);
    };
  }, [gameEngine]);

  return null;
}
