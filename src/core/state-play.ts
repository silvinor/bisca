// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { GameState } from './game-state';
import { playerCount } from './game-common';
import { g } from './game-context';
import {
  type Trigger,
  StateMain,
} from '../types/game-state.d';
import type { G } from '../types/game-context.d';
import type { Game } from 'boardgame.io';
import { 
  ACTION_QUIT,
} from './constants';
// import { logger } from './logger';

const Bisca: Game<G> = {
  name: 'bisca',
  setup: () => structuredClone(g),
};

function createBiscaClient() {
  const Client = window.BoardgameIO?.Client;
  if (!Client) throw new Error('[Play] boardgame.io failed to load.');
  const numPlayers = playerCount(g.mode);
  if (!window.isDebug) return Client<G>({ game: Bisca, numPlayers, debug: false });
  const debugTarget = document.getElementById('app-main');
  if (!debugTarget) throw new Error('[Play] #app-main was not found.');
  return Client<G>({ game: Bisca, numPlayers, debug: { target: debugTarget } });
}

type BiscaClient = ReturnType<typeof createBiscaClient>;

export interface PlaySelectionAction extends Trigger {
  nextState: StateMain | null;
}


export class PlayGameState extends GameState<
  StateMain,
  PlaySelectionAction | Trigger
> {
  private game: BiscaClient | null = null;

  public constructor() {
    super(StateMain.PLAY);
  }

  protected init(): void {
    this.game ??= createBiscaClient();
    this.game!.start();
  }

  protected tick(): void {
    if (this.triggered && this.lastTrigger?.action === ACTION_QUIT) return;
  }

  protected draw(): void { 
    /* ... do nothing */
  }

  protected tock(): StateMain {
    let nextState = this.currentState;

    if (this.triggered && this.lastTrigger?.action === ACTION_QUIT) {
      if (
        "nextState" in this.lastTrigger &&
        this.lastTrigger.nextState !== null
      ) {
        nextState = this.lastTrigger.nextState;
      }
    }

    // TODO: Who wins??
    return nextState;
  }

  protected end(): void {
    // Copy the authoritative game state into the existing app singleton.
    Object.assign(g, structuredClone(this.game!.getState()!.G));
    this.game?.stop();
  }
}
