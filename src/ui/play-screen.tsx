// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useState } from 'preact/hooks';
import {
  GameMode,
  PERSISTENCE_GAME_ENGINE,
  PERSISTENCE_GAME_MODE,
  UNKNOWN_DEALER,
} from '../core/constants';
import {
  GameEngine,
  GameTickAction,
  isGameEngineData,
} from '../core/game-engine';
import { persistenceEngine } from '../core/persistence-engine';
import { PlaySelectDealer } from './play-select-dealer';

interface InitialPlayState {
  gameEngine: GameEngine;
  action: GameTickAction;
  gameMode: GameMode;
}

interface StoredGameMode {
  gameMode: GameMode;
}

function isStoredGameMode(value: unknown): value is StoredGameMode {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return Object.values(GameMode).includes((value as StoredGameMode).gameMode);
}

function loadInitialPlayState(): InitialPlayState {
  const gameMode = persistenceEngine.load(PERSISTENCE_GAME_MODE, isStoredGameMode)?.gameMode
    ?? GameMode.MODE1;
  const stored = persistenceEngine.load(
    PERSISTENCE_GAME_ENGINE,
    isGameEngineData,
  );
  // Step 1: An older saved dealer-selection deck is no longer authoritative;
  // this stage stays in memory until the later card-removal step is defined.
  const gameEngine = new GameEngine(
    stored?.currentDealer === UNKNOWN_DEALER ? undefined : stored ?? undefined,
  );

  // Step 2: Evaluate the engine immediately so the first render
  // already knows which dedicated play component owns the current game step.
  const action = gameEngine.tick();
  if (action === GameTickAction.SELECT_DEALER) {
    persistenceEngine.clear(PERSISTENCE_GAME_ENGINE);
  } else {
    persistenceEngine.save(PERSISTENCE_GAME_ENGINE, gameEngine);
  }

  return { gameEngine, action, gameMode };
}

export function PlayScreen() {
  // Step 3: Create the single GameEngine instance and its current action once
  // when the playing screen opens.
  const [{ gameEngine, action, gameMode }] = useState(loadInitialPlayState);

  // Step 4: Keep dealer selection transient on navigation; later game actions
  // may persist the engine once their state is ready to resume.
  useEffect(() => {
    const persistGame = () => {
      if (action === GameTickAction.SELECT_DEALER) {
        persistenceEngine.clear(PERSISTENCE_GAME_ENGINE);
      } else {
        persistenceEngine.save(PERSISTENCE_GAME_ENGINE, gameEngine);
      }
    };

    persistGame();
    window.addEventListener('pagehide', persistGame);
    return () => {
      persistGame();
      window.removeEventListener('pagehide', persistGame);
    };
  }, [action, gameEngine]);

  // Step 5: Delegate each engine action to its dedicated play component.
  switch (action) {
    case GameTickAction.SELECT_DEALER:
      return (
        <PlaySelectDealer
          gameEngine={gameEngine}
          gameMode={gameMode}
          onComplete={() => {
            // TODO: Call gameEngine.tick() and advance `action` once the next
            // game action (dealing) is implemented.
          }}
        />
      );
    default:
      return null;
  }
}
