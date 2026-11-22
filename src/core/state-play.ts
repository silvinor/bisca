// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { GameState } from './game-state';
import { playerCount } from './game-common';
import { g } from './game-context';
import { StatePlay } from '../ui/state-play';
import { h, render } from 'preact';
import {
  type Trigger,
  StateMain,
} from '../types/game-state.d';
import type { DeckDisplayPosition, G } from '../types/game-context.d';
import {
  ANIM_STATE_DECK_FAN,
  ANIM_STATE_DECK_JOIN,
  ANIM_STATE_NOTHING,
  DEFAULT_ANIMATION_STATE,
} from '../types/anim-state.d';
import type { FnContext, Game } from 'boardgame.io';
import { Step as playBotTurn } from 'boardgame.io/ai';
import { BotEasy } from './bot-easy';
import { BotNormal } from './bot-normal';
import { BotHard } from './bot-hard';
import { 
  ACTION_QUIT,
} from './constants';
// import { logger } from './logger';

function doSetup(): G {
  return structuredClone(g);
}

function firstPlayer({ G }: FnContext<G>): number {
  return G.dealer;
}

function nextPlayer({ ctx }: FnContext<G>): number {
  return (ctx.playOrderPos + 1) % ctx.playOrder.length;
}

function doOnBegin({ G, random }: FnContext<G>): void {
  G.deckDisplayPositions = Array.from({ length: G.deck.length }, () => ({
    x: 1.5 + random.Number() * 8,
    y: 1.5 + random.Number() * 8,
    rotation: -90 + random.Number() * 180,
  }));
  G.animationState = ANIM_STATE_DECK_JOIN;
}

function onTick(
  animationState: G['animationState'],
  positions: DeckDisplayPosition[],
  updatePositions: (positions: DeckDisplayPosition[]) => void,
  updateAnimationState: (animationState: G['animationState']) => void,
): void {
  if (animationState === ANIM_STATE_NOTHING) return;

  switch (animationState) {
    case ANIM_STATE_DECK_JOIN:
      updatePositions(positions.map(() => ({ x: 5.5, y: 5.5, rotation: 0 })));
      updateAnimationState(ANIM_STATE_DECK_FAN);
      return;
    case ANIM_STATE_DECK_FAN:
      updatePositions(positions.map((_, index) => ({
        x: 2 + index * 7 / 39,
        y: 5.5,
        rotation: -10.5 + index / 2,
      })));
      updateAnimationState(ANIM_STATE_NOTHING);
      return;
  }
}

const Bisca: Game<G> = {
  name: 'bisca',
  setup: doSetup,
  turn: {
    order: {
      first: firstPlayer,
      next: nextPlayer,
    },
  },
  phases: {
    selectDealer: {
      start: true,
      onBegin: doOnBegin,
    },
  },
};

const BOTS = {
  easy: BotEasy,
  normal: BotNormal,
  hard: BotHard,
} as const;

function createBiscaClient(g: G) {
  const Client = window.BoardgameIO?.Client;
  if (!Client) throw new Error('[Play] boardgame.io failed to load.');
  const numPlayers = playerCount(g.mode);
  g.hand = Array(numPlayers).fill('');
  g.won = Array(numPlayers).fill('');
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
  private displayPositions: DeckDisplayPosition[] | null = null;
  private animationState: G['animationState'] | null = null;
  private unsubscribePhase: (() => void) | null = null;
  private unsubscribeBotTurns: (() => void) | null = null;
  private botTurn = '';
  private botDelay: ReturnType<typeof setTimeout> | null = null;
  private pulseTimer: ReturnType<typeof setInterval> | null = null;

  public constructor() {
    super(StateMain.PLAY);
  }

  protected init(): void {
    
    this.game ??= createBiscaClient(g);
    this.game!.start();
    const game = this.game!;
    this.pulseTimer = setInterval(() => {
      const G = game.getState()?.G;
      if (!G) return;
      const positions = this.displayPositions ?? G.deckDisplayPositions;
      this.animationState ??= G.animationState ?? DEFAULT_ANIMATION_STATE;
      onTick(
        this.animationState,
        positions,
        (nextPositions) => { this.displayPositions = nextPositions; },
        (nextAnimationState) => { this.animationState = nextAnimationState; },
      );
      this.draw();
    }, 1000);
    this.unsubscribePhase = game.subscribe((state) => {
      if (state?.ctx.phase === 'selectDealer') this.draw();
    });

    const enumerate = game.game.ai?.enumerate;
    if (!enumerate) return;

    const BotClass = BOTS[g.difficulty as keyof typeof BOTS];
    const bots = Object.fromEntries(
      Array.from({ length: playerCount(g.mode) - 1 }, (_, index) => {
        const playerID = String(index + 1);
        return [playerID, new BotClass({ enumerate })];
      }),
    );

    this.unsubscribeBotTurns = game.subscribe((state) => {
      if (!state) return;
      const playerID = state.ctx.currentPlayer;
      const turnID = `${state._stateID}:${playerID}`;
      const bot = bots[playerID];
      if (!bot || state.ctx.gameover !== undefined || this.botTurn === turnID) return;

      this.botTurn = turnID;
      this.botDelay = setTimeout(() => {
        this.botDelay = null;
        void playBotTurn(game, bot);
      }, 350);
    });
  }

  protected tick(): void {
    if (this.triggered && this.lastTrigger?.action === ACTION_QUIT) return;
  }

  protected draw(): void { 
    const appMain = document.getElementById('app-main');
    const G = this.game?.getState()?.G;
    if (appMain && G) {
      render(h(StatePlay, {
        deckDisplayPositions: this.displayPositions ?? G.deckDisplayPositions,
      }), appMain);
    }
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
    if (this.pulseTimer !== null) clearInterval(this.pulseTimer);
    this.pulseTimer = null;
    this.unsubscribePhase?.();
    this.unsubscribePhase = null;
    this.unsubscribeBotTurns?.();
    this.unsubscribeBotTurns = null;
    if (this.botDelay !== null) clearTimeout(this.botDelay);
    this.botDelay = null;
    // Copy the authoritative game state into the existing app singleton.
    Object.assign(g, structuredClone(this.game!.getState()!.G));
    this.game?.stop();
    const appMain = document.getElementById('app-main');
    if (appMain) render(null, appMain);
  }
}
