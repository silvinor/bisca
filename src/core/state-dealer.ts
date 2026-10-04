// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { h, render } from 'preact';
import { GameState } from './game-state';
import { 
  saveGameProgress, 
  playerCount,
  random,
  shuffleDeckString,
} from './game-common';
import { logger } from './logger';
import {
  ACTION_QUIT,
  ACTION_NEXT,
  ACTION_SELECT,
  DEFAULT_DECK_CARDS,
  TWOS_DECK_CARDS,
  SAVE_GROUP_OPTION,
  SAVE_SELECT_DEALER,
} from './constants';
import { persistence } from './persistence';
import {
  type Trigger,
  GAME_MODE_1,
  GAME_MODE_4,
  getGameMode,
  StateMain,
} from '../types/game-state.d';
import { StateSelectDealer, StateSelectPick2 } from '../ui/state-dealer';
// import { g } from './game-context';
import { type S, SELECT_DEALER } from '../types/state-dealer.d';
import { getTrickWinner } from './deck-handler';

export interface DealerSelectionAction extends Trigger {
  nextState: StateMain | null;
  cardIndex: number | null;
}

export class SelectDealerGameState extends GameState<StateMain, DealerSelectionAction | Trigger> {
  private _init: boolean = false;
  private stateStep: SELECT_DEALER = SELECT_DEALER.INIT;
  private s: S = {
    deck: '', // must be empty for the load fallback to shuffle a default deck
    mode: GAME_MODE_1,
    picks: [],
    dealer: -1,
    twos: '',
    twop: 0,
  };

  public constructor() {
    super(StateMain.SELECT_DEALER);
  }

  private readonly onPick = (cardIndex: number): void => {
    if (this.stateStep == SELECT_DEALER.USER_PICKING) {
      this.trigger({  action: ACTION_SELECT, cardIndex: cardIndex });
    }
  };

  private readonly onNext = (): void => {
    if (this.stateStep == SELECT_DEALER.EVAL) {
      this.trigger({ action: ACTION_NEXT });
    }
  };

  private loadS(s: S): S {
    const z = persistence.get( SAVE_GROUP_OPTION, SAVE_SELECT_DEALER, JSON.stringify(s) );
    if (z === null) return s;
    try {
      return JSON.parse(z) as S;
    } catch (error: unknown) {
      logger.error('[Select Dealer] Failed to load saved state:', error);
      return s;
    }
  }

  private saveS(s: S): void {
    persistence.set( SAVE_GROUP_OPTION, SAVE_SELECT_DEALER, JSON.stringify(s) );
  }

  private clearS(s: S): S {
    persistence.set( SAVE_GROUP_OPTION, SAVE_SELECT_DEALER, null ); // delete
    s.deck = '';
    s.picks = [];
    s.dealer = -1;
    return s;
  }

  // -------------------- init() --------------------
  protected init(): void {
    logger.debug('SELECT_DEALER --> Init');
    if (!this._init) {
      saveGameProgress(StateMain.SELECT_DEALER);
      this._init = true;
    }
    this.stateStep = SELECT_DEALER.INIT;
    this.s = this.loadS(this.s);
    this.s.mode = getGameMode(this.s.mode); // just in case we get here from settings
    if (!this.s.deck) {
      this.s.deck = shuffleDeckString(DEFAULT_DECK_CARDS);
      this.s.picks = [];
      this.s.dealer = -1;
      if (this.s.mode == GAME_MODE_4) {
        this.s.twos = shuffleDeckString(TWOS_DECK_CARDS);
        this.s.twop = 0;
      }
    } else if (this.s.mode == GAME_MODE_4) {
      if (this.s.dealer != -1) {
        this.stateStep = SELECT_DEALER.EVAL;
      }
    }

    this.resetTrigger();
  }

  // -------------------- tick() --------------------
  protected async tick(): Promise<void> {
    logger.debug(`SELECT_DEALER --> Tick ${this.stateStep}`);

    if (this.triggered && this.lastTrigger?.action === ACTION_QUIT) return;

    switch (this.stateStep) {
      case SELECT_DEALER.INIT: // FIXME : Comment out - not needed
        logger.debug('********** INIT **********');
        logger.info(this);
        break;

      case SELECT_DEALER.USER_PICKING: // FIXME : Comment out - not needed
        logger.debug('********** USER_PICKING **********');
        // ... do nothing ...
         break;

      case SELECT_DEALER.COMPUTER_PICKING:
        logger.debug('********** COMPUTER_PICKING **********');
        // Give each computer player a distinct card that no earlier player picked.
        for (let player = 1; player < playerCount(this.s.mode); player++) {
          let cardIndex: number;
          do cardIndex = random(1, this.s.deck.length); while (this.s.picks.includes(cardIndex));
          this.s.picks.push(cardIndex);
        }
        logger.info(this.s.picks);
        break;

      case SELECT_DEALER.EVAL:
        logger.debug('********** EVAL **********');
        const trick: string[] = this.s.picks.map((cardIndex) => this.s.deck[cardIndex - 1]);
        this.s.dealer = getTrickWinner(trick);
        logger.info(trick);
        logger.info(`Highest is ${this.s.dealer}`);
        if (this.s.mode === GAME_MODE_4) this.saveS(this.s); // save state in case of refresh
        break;

      case SELECT_DEALER.START_PICK_2: // FIXME : Comment out - not needed
        logger.debug('********** START_PICK_2 **********');
        break;

      case SELECT_DEALER.USER_PICK_2: // FIXME : Comment out - not needed
        logger.debug('********** USER_PICK_2 **********');
        break;

      case SELECT_DEALER.COMPUTER_PICK_2:
        logger.debug('********** COMPUTER_PICK_2 **********');
        logger.warn(this.s);
        this.s.twop = random(1, this.s.twos.length);
        logger.info(this.s.twop);
        break;

      case SELECT_DEALER.DISCARD_2: // FIXME : Comment out - not needed
        logger.debug('********** DISCARD_2 **********');
        break;

      case SELECT_DEALER.END: // FIXME : Comment out - not needed
        logger.debug('********** END **********');
        break;
    }
  }

  // -------------------- draw() --------------------
  protected draw(): void {
    logger.debug(`SELECT_DEALER --> Draw ${this.stateStep}`);

    const appMain = document.getElementById('app-main');
    switch(this.stateStep) {
      case SELECT_DEALER.USER_PICKING:
      case SELECT_DEALER.COMPUTER_PICKING:
      case SELECT_DEALER.EVAL:
        if (appMain) render(h(StateSelectDealer, { 
          step: this.stateStep,
          s: this.s,
          onPick: this.onPick,
          onNext: this.onNext,
        }), appMain);
        break;

      case SELECT_DEALER.START_PICK_2:
      case SELECT_DEALER.USER_PICK_2:
      case SELECT_DEALER.COMPUTER_PICK_2:
        if (appMain) render(h(StateSelectPick2, { 
          step: this.stateStep,
          s: this.s,
          onPick: this.onPick,
          onNext: this.onNext,
        }), appMain);
        break;

    }

    // Auto next set
    switch(this.stateStep) {
        case SELECT_DEALER.INIT:
        case SELECT_DEALER.COMPUTER_PICKING:
        case SELECT_DEALER.COMPUTER_PICK_2:
          this.trigger({ action: ACTION_NEXT });
          break;
    }
  }

  // -------------------- tock() --------------------
  protected tock(): StateMain {
    logger.debug(`SELECT_DEALER --> Tock ${this.stateStep}`);

    const lastStateStep: SELECT_DEALER = this.stateStep;
    let nextState = this.currentState;

    if (this.triggered && this.lastTrigger?.action === ACTION_NEXT) {
      switch(lastStateStep) {

        case SELECT_DEALER.INIT:
          this.stateStep = SELECT_DEALER.USER_PICKING;
          break;

        case SELECT_DEALER.COMPUTER_PICKING:
          this.stateStep = SELECT_DEALER.EVAL;
          break;

        case SELECT_DEALER.EVAL:
          if (this.s.dealer == -1) {
            this.stateStep = SELECT_DEALER.INIT;
            this.s = this.clearS(this.s); // reset the deck to re-shuffle
            this.init(); // refire the initialization
          } else if (this.s.mode == GAME_MODE_4) {
            // Special case where we need to discard a 2-card
            if (this.s.dealer == 0 || this.s.dealer == 2) {
              this.stateStep = SELECT_DEALER.COMPUTER_PICK_2;
            } else {
              this.stateStep = SELECT_DEALER.START_PICK_2;
            }
          } else {
            this.s = this.clearS(this.s);
            this.stateStep = SELECT_DEALER.END;
          }
          break;

        case SELECT_DEALER.COMPUTER_PICK_2:
          this.stateStep = SELECT_DEALER.END;

      }
    } else if (this.triggered && this.lastTrigger?.action === ACTION_SELECT) {
      switch(lastStateStep) {
        case SELECT_DEALER.USER_PICKING:
          if ('cardIndex' in this.lastTrigger
            && this.lastTrigger.cardIndex !== null
            && Number.isInteger(this.lastTrigger.cardIndex)
            && this.lastTrigger.cardIndex >= 1
            && this.lastTrigger.cardIndex <= this.s.deck.length) {
            this.s.picks[0] = this.lastTrigger.cardIndex;
            this.stateStep = SELECT_DEALER.COMPUTER_PICKING;
          }
          break;
      }
    } else if (this.triggered && this.lastTrigger?.action === ACTION_QUIT) {
      if ('nextState' in this.lastTrigger && this.lastTrigger.nextState !== null) {
        this.s = this.clearS(this.s);
        nextState = this.lastTrigger.nextState;
      }
    }

    switch(lastStateStep) {
      case SELECT_DEALER.INIT:
      case SELECT_DEALER.USER_PICKING:
      case SELECT_DEALER.EVAL:
        this.resetTrigger();
        break;
    }
    
    return nextState;
  }

  // -------------------- end() --------------------
  protected end(): void {
    logger.debug('SELECT_DEALER --> End');
    const appMain = document.getElementById('app-main');
    if (appMain) render(null, appMain);
  }

}
