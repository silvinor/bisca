// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { h, render } from 'preact';
import { GameState } from './game-state';
import { 
  saveGameProgress, 
  playerCount,
  random,
} from './game-common';
import { logger } from './logger';
import {
  ACTION_QUIT,
  ACTION_NEXT,
  ACTION_SELECT,
  DEFAULT_DECK_CARDS,
} from './constants';
import {
  type GameMode,
  type Trigger,
  GAME_MODE_1,
  getGameMode,
  StateMain,
} from '../types/game-state.d';
import { StateSelectDealer } from '../ui/state-dealer';
import { g } from './game-context';
import { SELECT_DEALER } from '../types/state-dealer.d';

export interface DealerSelectionAction extends Trigger {
  nextState: StateMain | null;
  cardIndex: number | null;
}

// export interface DealerSelectionResult {
//   deck: string;
//   currentDealer: number;
// }

// export let dealerSelectionResult: DealerSelectionResult | null = null;

// function randomIndex(length: number): number {
//   const limit = Math.floor(0x1_0000_0000 / length) * length;
//   const value = new Uint32Array(1);
//   do crypto.getRandomValues(value); while (value[0] >= limit);
//   return value[0] % length;
// }

// function cardRank(card: string): number {
//   return Math.floor(RANKS.indexOf(card) / 4) + 1;
// }

// export class SelectDealerGameState extends GameState<StateMain, DealerSelectionAction> {
//   private dealerStep = 0;
//   private deck = '';
//   private gameMode: GameMode = GAME_MODE_1;
//   private deckName = 'default';
//   private cardBack = 'a';
//   private picks: DealerSelectionPick[] = [];
//   private dealer: number | null = null;
//   private tied = false;
//   private discardPicker: number | null = null;

//   public constructor() {
//     super(StateMain.SELECT_DEALER);
//   }

//   protected init(): void {
//     logger.debug('SELECT_DEALER --> Init');

//     saveGameProgress(StateMain.SELECT_DEALER);

//     dealerSelectionResult = null;
//     this.dealerStep = 0;
//     this.deck = '';
//     this.picks = [];
//     this.dealer = null;
//     this.tied = false;
//     this.discardPicker = null;
//   }

//   protected async tick(lastState: StateMain): Promise<StateMain> {
//     logger.debug(`SELECT_DEALER --> Tick ${this.dealerStep}`);

//     // Load the selected mode and card artwork, then create the deck used by the game.
//     if (this.dealerStep === 0) {
//       this.gameMode = await persistence.get(SAVE_GROUP_OPTION, SAVE_NAME_MODE, GAME_MODE_1) as GameMode;
//       this.deckName = await persistence.get(SAVE_GROUP_OPTION, SAVE_GAME_DECK, 'default');
//       this.cardBack = await persistence.get(
//         SAVE_GROUP_OPTION,
//         `${SAVE_CARD_BACK}-${this.deckName}`,
//         'a',
//       );
//       this.restartSelection();
//       return lastState;
//     }

//     if (!this.triggered || !this.lastTrigger) return lastState;

//     // Record the human card before the computer players choose from the remaining cards.
//     if (this.dealerStep === 1 && this.lastTrigger.type === 'pick') {
//       const card = this.deck[this.lastTrigger.cardIndex];
//       if (!card) return lastState;
//       this.picks = [{ player: 0, cardIndex: this.lastTrigger.cardIndex, card }];
//       this.dealerStep = 2;
//       return lastState;
//     }

//     // Select one card for each computer player.
//     if (this.dealerStep === 2 && this.lastTrigger.type === 'continue') {
//       const used = new Set(this.picks.map((pick) => pick.cardIndex));
//       for (let player = 1; player < playerCount(this.gameMode); player++) {
//         const available = Array.from(this.deck, (_, index) => index).filter((index) => !used.has(index));
//         const cardIndex = available[randomIndex(available.length)];
//         used.add(cardIndex);
//         this.picks.push({ player, cardIndex, card: this.deck[cardIndex] });
//       }
//       this.dealerStep = 3;
//       return lastState;
//     }

//     // Reveal the selected cards before evaluating the result.
//     if (this.dealerStep === 3 && this.lastTrigger.type === 'continue') {
//       const highest = Math.max(...this.picks.map((pick) => cardRank(pick.card)));
//       const leaders = this.picks.filter((pick) => cardRank(pick.card) === highest);
//       this.tied = leaders.length !== 1;
//       this.dealer = this.tied ? null : leaders[0].player;
//       this.dealerStep = 4;
//       return lastState;
//     }

//     // Restart a tied draw, or continue to the three-player discard when required.
//     if (this.dealerStep === 4 && this.lastTrigger.type === 'continue') {
//       if (this.tied) {
//         this.restartSelection();
//       } else if (this.gameMode === GAME_MODE_4 && this.dealer !== null) {
//         this.discardPicker = (this.dealer + 1) % 3;
//         this.dealerStep = 6;
//         if (this.discardPicker !== 0) this.removeTwo(TWOS[randomIndex(TWOS.length)]);
//       } else {
//         return this.finish();
//       }
//       return lastState;
//     }

//     // Remove the selected two for the three-player game, then hand the ready deck to PLAY.
//     if (this.dealerStep === 6) {
//       if (this.lastTrigger.type === 'discard' && this.discardPicker === 0) {
//         this.removeTwo(this.lastTrigger.card);
//         return lastState;
//       }
//       if (this.lastTrigger.type === 'continue' && this.discardPicker === null) return this.finish();
//     }

//     return lastState;
//   }

//   protected draw(): void {
//     logger.debug(`SELECT_DEALER --> Draw ${this.dealerStep}`);
//     const appMain = document.getElementById('app-main');
//     if (!appMain || this.dealerStep === 0) return;

//     render(h(StateSelectDealer, {
//       step: this.dealerStep,
//       deck: this.deck,
//       deckName: this.deckName,
//       cardBack: this.cardBack,
//       picks: this.picks,
//       dealer: this.dealer,
//       tied: this.tied,
//       discardPicker: this.discardPicker,
//       onAction: (action: DealerSelectionAction) => this.trigger(action),
//     }), appMain);
//   }

//   protected end(): void {
//     logger.debug('SELECT_DEALER --> End');
//     const appMain = document.getElementById('app-main');
//     if (appMain) render(null, appMain);
//   }

//   private restartSelection(): void {
//     this.deck = shuffle(DECK);
//     this.picks = [];
//     this.dealer = null;
//     this.tied = false;
//     this.discardPicker = null;
//     this.dealerStep = 1;
//   }

//   private removeTwo(card: string): void {
//     if (!TWOS.includes(card)) return;
//     this.deck = this.deck.replace(card, '');
//     this.discardPicker = null;
//   }

//   private finish(): StateMain {
//     if (this.dealer === null) return StateMain.SELECT_DEALER;
//     dealerSelectionResult = { deck: this.deck, currentDealer: this.dealer };
//     return StateMain.PLAY;
//   }
// }

export class SelectDealerGameState extends GameState<StateMain, DealerSelectionAction | Trigger> {
  private stateStep: SELECT_DEALER = SELECT_DEALER.INIT;
  private deck: string = DEFAULT_DECK_CARDS;
  private mode: GameMode = GAME_MODE_1;
  private picks: number[] = [];

  public constructor() {
    super(StateMain.SELECT_DEALER);
  }

  protected init(): void {
    logger.debug('SELECT_DEALER --> Init');
    saveGameProgress(StateMain.SELECT_DEALER);
    this.stateStep = 0;
    logger.info(g);
    this.picks = [];
    this.resetTrigger();
  }

  protected async tick(): Promise<void> {
    logger.debug(`SELECT_DEALER --> Tick ${this.stateStep}`);

    if (this.triggered && this.lastTrigger?.action === ACTION_QUIT) return;
        
    switch (this.stateStep) {
      case SELECT_DEALER.INIT:
        try {
          this.mode = await getGameMode(this.mode);
        } catch (error: unknown) {
          logger.warn('[Persistence] Failed to load game mode:', error);
        }
        logger.info(this);
        break;

      case SELECT_DEALER.USER_PICKING:
        // ... do nothing ...
         break;

      case SELECT_DEALER.COMPUTER_PICKING:
        logger.info('********** COMPUTER_PICKING **********');

        // Give each computer player a distinct card that no earlier player picked.
        for (let player = 1; player < playerCount(this.mode); player++) {
          let cardIndex: number;
          do cardIndex = random(1, this.deck.length); while (this.picks.includes(cardIndex));
          this.picks.push(cardIndex);
        }

        logger.info(this.picks);

        break;
    }
  }

  protected draw(): void {
    logger.debug(`SELECT_DEALER --> Draw ${this.stateStep}`);

    switch(this.stateStep) {
        case SELECT_DEALER.INIT:
          this.trigger({action: ACTION_NEXT});
          break;

        case SELECT_DEALER.USER_PICKING:
        case SELECT_DEALER.COMPUTER_PICKING:
          const appMain = document.getElementById('app-main');
          if (appMain) render(h(StateSelectDealer, { 
            step: this.stateStep,
            picks: this.picks,
            mode: this.mode,
            onPick: this.onPick,
          }), appMain);
          break;

    }
  }

  protected tock(): StateMain {
    logger.debug(`SELECT_DEALER --> Tick ${this.stateStep}`);

    const lastStateStep: SELECT_DEALER = this.stateStep;
    let nextState = this.currentState;

    if (this.triggered && this.lastTrigger?.action === ACTION_NEXT) {
      switch(lastStateStep) {
        case SELECT_DEALER.INIT:
          this.stateStep = SELECT_DEALER.USER_PICKING;
          break;
      }
    } else if (this.triggered && this.lastTrigger?.action === ACTION_SELECT) {
      switch(lastStateStep) {
        case SELECT_DEALER.USER_PICKING:
          if ('cardIndex' in this.lastTrigger
            && this.lastTrigger.cardIndex !== null
            && Number.isInteger(this.lastTrigger.cardIndex)
            && this.lastTrigger.cardIndex >= 1
            && this.lastTrigger.cardIndex <= this.deck.length) {
            this.picks[0] = this.lastTrigger.cardIndex;
            this.stateStep = SELECT_DEALER.COMPUTER_PICKING;
          }
          break;
      }
    } else if (this.triggered && this.lastTrigger?.action === ACTION_QUIT) {
      if ('nextState' in this.lastTrigger && this.lastTrigger.nextState !== null) {
        nextState = this.lastTrigger.nextState;
      }
    }

    switch(lastStateStep) {
      case SELECT_DEALER.INIT:
      case SELECT_DEALER.USER_PICKING:
        this.resetTrigger();
        break;
    }
    
    return nextState;
  }

  protected end(): void {
    logger.debug('SELECT_DEALER --> End');
    const appMain = document.getElementById('app-main');
    if (appMain) render(null, appMain);
  }

  private readonly onPick = (cardIndex: number): void => {
    if (this.stateStep == SELECT_DEALER.USER_PICKING) {
      this.trigger({  action: ACTION_SELECT, cardIndex: cardIndex });
    }
  };
}
