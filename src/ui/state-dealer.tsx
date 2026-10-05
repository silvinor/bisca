// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { Fragment, type ComponentChildren, type CSSProperties } from 'preact';
import { i18n } from '../core/i18n';
import { CardBack, CardFace } from './card';
import { SpeechBubble } from './speech-bubble';
import { Table } from './table';
import { type S, SELECT_DEALER } from '../types/state-dealer.d';
import { logger } from '../core/logger';
import { getCardValue, getTrickWinner } from '../core/deck-handler';
import {
  GAME_MODE_1,
  GAME_MODE_2,
  GAME_MODE_3,
  GAME_MODE_4,
  GAME_MODE_5,
  type GameMode,
} from '../types/game-state.d';
import { APP_SPEECH_BUBBLE_DELAY } from '../core/constants';

// const CARD_FILES = 'ABCDEFGHIJKLMabcdefghijklmNOPQRSTUVWXYZnopqrstuvwxyz';
// const TWOS = 'BbOo';

// export interface DealerSelectionPick {
//   player: number;
//   cardIndex: number;
//   card: string;
// }

// export type DealerSelectionAction =
//   | { type: 'pick'; cardIndex: number }
//   | { type: 'discard'; card: string }
//   | { type: 'continue' };

interface StateSelectDealerProps {
  step: SELECT_DEALER;
  s: S,
  onPick: (cardIndex: number) => void;
  onNext: () => void;
//   onAction: (action: DealerSelectionAction) => void;
}

function pickedCardStyle(player: number, mode: GameMode): CSSProperties {
  const pre = { zIndex: 100 + player };

  if (player === 0) {
    return { ...pre, left: '50%', bottom: '3%', transform: 'translateX(-50%)' };
  }

  switch (mode) {
    case GAME_MODE_1:
    case GAME_MODE_2:
    case GAME_MODE_3:
      return { ...pre, left: '50%', top: '3%', transform: 'translateX(-50%)' };

    case GAME_MODE_4:
      return player === 1
        ? { ...pre, left: '3%', top: '3%' }
        : { ...pre, right: '3%', top: '3%' };

    case GAME_MODE_5:
      if (player === 1) {
        return { ...pre, left: '3%', top: '15%' };
      }
      if (player === 2) {
        return { ...pre, left: '50%', top: '3%', transform: 'translateX(-50%)' };
      }
      return { ...pre, right: '3%', top: '15%' };
  }

  return { ...pre, left: '50%', top: '3%', transform: 'translateX(-50%)' };
}

function pickedCardBadgeStyle(player: number, mode: GameMode): CSSProperties {
  const pre = { zIndex: 200 + player, pointerEvents: 'none' };

  // return {
  //   ...pickedCardStyle(player, mode),
  //   zIndex: zOfs + player,
  //   pointerEvents: 'none',
  // };
  
  if (player === 0) {
    return { ...pre, left: '50%', bottom: '1%', transform: 'translateX(-50%)' };
  }

  switch (mode) {
    case GAME_MODE_1:
    case GAME_MODE_2:
    case GAME_MODE_3:
      return { ...pre, left: '50%', top: '1%', transform: 'translateX(-50%)' };

    case GAME_MODE_4:
      return player === 1
        ? { ...pre, left: '1%', top: '1%' }
        : { ...pre, right: '1%', top: '1%' };

    case GAME_MODE_5:
      if (player === 1) {
        return { ...pre, left: '1%', top: '13%' };
      }
      if (player === 2) {
        return { ...pre, left: '50%', top: '1%', transform: 'translateX(-50%)' };
      }
      return { ...pre,  right: '1%', top: '13%' };
  }

  return { ...pre, left: '50%', top: '5%', transform: 'translateX(-50%)' };
}

export function StateSelectDealer({
  step,
  s,
  onPick,
  onNext,
}: StateSelectDealerProps) {
  logger.debug(`SELECT_DEALER UI --> ${SELECT_DEALER[step] ?? step}`);

  let bubble: ComponentChildren = null;
  let cards: ComponentChildren = null;
  
  let debugBadges: ComponentChildren[] | null = null;
  // Skip the badges until at least one card is picked, because getTrickWinner rejects an empty trick.
  if (window.isDebug && s.picks.length > 0) {
    // The picks form a value-mode trick indexed by player (no trump, no leader): the highest card wins, -1 is a tie.
    const pickedCards = s.picks.map((cardIndex) => s.deck[cardIndex - 1]);
    const pickedValues = pickedCards.map(getCardValue);
    const winner = getTrickWinner(pickedCards);
    // On a tie, every player holding the highest value is marked, because those players must pick again.
    const highestValue = Math.max(...pickedValues);
    debugBadges = pickedValues.map((value, player) => {
      const badgeVariant = player === winner ? 'success'
        : winner === -1 && value === highestValue ? 'danger'
        : 'primary';
      const shwVal = value.toFixed(2).replace(/^0(?=\.)|\.?0+$/g, '');
      return (
        <span
          key={`debug-badge-${player}`}
          className={`position-absolute badge rounded-pill text-bg-${badgeVariant} debug-badge`}
          style={pickedCardBadgeStyle(player, s.mode)}
          aria-hidden='true'
        >
          {shwVal}
        </span>
      );
    });
  }

  const cardStyle = (index: number) => {
    const progress = index / (s.deck.length - 1);
    return {
      left: `${progress * 100}%`,
      top: '50%',
      transform: `translate(${50 - progress * 200}%, -50%)`,
      zIndex: index + 1,
    };
  };

  switch (step) {
    case SELECT_DEALER.USER_PICKING:
      bubble = <SpeechBubble>{i18n.t('state-dealer:pick-card')}</SpeechBubble>
      cards = Array.from({ length: s.deck.length }, (_, index) => {
          return (
            <CardBack
              key={index}
              onClick={() => onPick(index + 1)}
              style={cardStyle(index)}
            />
          );
        });
      break;

    case SELECT_DEALER.COMPUTER_PICKING:
    case SELECT_DEALER.EVAL: {
      if (step === SELECT_DEALER.EVAL) {
        const prompt = {
          [-1]: 'state-dealer:tie',
          0: 'state-dealer:you-deal',
          1: 'state-dealer:player-1-deals',
          2: 'state-dealer:player-2-deals',
          3: 'state-dealer:player-3-deals',
        }[s.dealer];
        if (prompt) bubble = <SpeechBubble
          timeout={APP_SPEECH_BUBBLE_DELAY}
          onTimeout={onNext}
          >{i18n.t(prompt)}</SpeechBubble>;
      }

      cards = Array.from({ length: s.deck.length }, (_, index) => {
        const cardIndex = index + 1;
        const player = s.picks.indexOf(cardIndex);
        if (player !== -1) {
          return (
            <Fragment key={index}>
              <CardFace
                letter={s.deck[cardIndex - 1]}
                style={pickedCardStyle(player, s.mode)}
              />
              {debugBadges?.[player]}
            </Fragment>
          );
        } else return (
          <CardBack
            key={index}
            style={cardStyle(index)}
          />
        );
      });
      break;
    }

  }

  return (
    <>
      {bubble}
      <Table>
        {cards}
      </Table>
    </>
  );
}

/* --------- StateSelectPick2 ---------- */
export function StateSelectPick2({
  step,
  s,
  onPick,
  onNext,
}: StateSelectDealerProps) {
  logger.debug(`SELECT_PICK_2 UI --> ${SELECT_DEALER[step] ?? step}`);

  void onPick;
  void onNext;

  let bubble: ComponentChildren = null;
  let cards: ComponentChildren = null;

  const cardStyle = (index: number) => {
    return {
      left: `${(index + 1) * 20}%`,
      top: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: index + 1,
    };
  };

  if (step === SELECT_DEALER.ASK_TO_PICK_2) {
    bubble = <SpeechBubble>{i18n.t('state-dealer:pick-two')}</SpeechBubble>;
  } else if (step === SELECT_DEALER.USER_PICKED_2 || step === SELECT_DEALER.COMPUTER_PICK_2) {
    bubble = <SpeechBubble
      timeout={APP_SPEECH_BUBBLE_DELAY}
      onTimeout={onNext}
    >{i18n.t('state-dealer:discard-card')}</SpeechBubble>;
  }

  cards = Array.from({ length: s.twos.length }, (_, index) => {
    const cardIndex = index + 1;
    
    if (s.discard > 0 && cardIndex === s.discard) {
      return (
        <CardFace
          key={cardIndex}
          letter={s.twos[cardIndex - 1]}
          style={cardStyle(index)}
        />
      );
    } else {
      return (
        <CardBack
          key={cardIndex}
          style={cardStyle(index)}
          onClick={step === SELECT_DEALER.ASK_TO_PICK_2 ? () => onPick(cardIndex) : undefined}
        />
      );
    }
  });
 
  return (
    <>
      {bubble}
      <Table>
        {cards}
      </Table>
    </>
  );
};
