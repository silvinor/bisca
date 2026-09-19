// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  DEFAULT_GAME_DECK,
  DEFAULT_CARD_FALLBACK_ASPECT_RATIO,
  DEFAULT_CARD_HEIGHT_PERCENT,
  DEFAULT_CARD_EDGE_GAP_PERCENT,
  GameMode,
  MODE5_DEALER_CARD_TOP_PERCENT,
  PLAYING_SURFACE_ASPECT_RATIO,
  SELECT_DEALER_CARD_COUNT,
  SELECT_DEALER_CARD_FLIP_DURATION_MS,
  SELECT_DEALER_CARD_MOVE_DURATION_MS,
  SELECT_DEALER_RESULT_DELAY_MS,
  SELECT_DEALER_SPREAD_DURATION_MS,
  SPEECH_BUBBLE_AVATAR_PATH,
  SPEECH_BUBBLE_FONT_LOAD_SPEC,
  TWO_FACE_CARDS,
} from '../core/constants';
import { loadDeckCardAspectRatio } from '../core/deck-catalog';
import { currentGameDeck, getBackFace, getCardFace } from '../core/deck-handler';
import { GameEngine } from '../core/game-engine';
import { i18n } from '../core/i18n';
import {
  animate,
  animationScopePrefersReducedMotion,
  isAnimeJsAvailable,
  useAnimationScope,
} from './animation';
import { SpeechBubble } from './speech-bubble';

enum CardDeckValuePoints_Special_Case_for_Select_Dealer {
  B = 1,  // 2 ♠️
  C = 2,  // 3 ♠️
  D = 3,  // 4 ♠️
  E = 4,  // 5 ♠️
  F = 5,  // 6 ♠️
  L = 6,  // Q ♠️
  K = 7,  // J ♠️
  M = 8,  // K ♠️
  G = 9,  // 7 ♠️
  A = 10,  // Ace ♠️
  b = 1,  // 2 ♥️
  c = 2,  // 3 ♥️
  d = 3,  // 4 ♥️
  e = 4,  // 5 ♥️
  f = 5,  // 6 ♥️
  l = 6,  // Q ♥️
  k = 7,  // J ♥️
  m = 8,  // K ♥️
  g = 9,  // 7 ♥️
  a = 10,  // Ace ♥️
  O = 1,  // 2 ♣️
  P = 2,  // 3 ♣️
  Q = 3,  // 4 ♣️
  R = 4,  // 5 ♣️
  S = 5,  // 6 ♣️
  Y = 6,  // Q ♣️
  X = 7,  // J ♣️
  Z = 8,  // K ♣️
  T = 9,  // 7 ♣️
  N = 10,  // Ace ♣️
  o = 1,  // 2 ♦️
  p = 2,  // 3 ♦️
  q = 3,  // 4 ♦️
  r = 4,  // 5 ♦️
  s = 5,  // 6 ♦️
  y = 6,  // Q ♦️
  x = 7,  // J ♦️
  z = 8,  // K ♦️
  t = 9,  // 7 ♦️
  n = 10,  // Ace ♦️
}

/** Dealer selection ranks cards by face only; suit does not affect this value. */
function getCardValue_Special_Case_for_Select_Dealer(card: string): number {
  const value = CardDeckValuePoints_Special_Case_for_Select_Dealer[
    card as keyof typeof CardDeckValuePoints_Special_Case_for_Select_Dealer
  ];
  if (typeof value !== 'number') {
    throw new RangeError(`Unknown dealer-selection card ${card}.`);
  }
  return value;
}

/** Returns the sole highest player's index, or null when the high value ties. */
function dealerSelectionWinner(cards: readonly (string | null)[]): number | null {
  const values = cards.map((card) => {
    if (!card) throw new Error('Dealer selection ended before every player picked a card.');
    return getCardValue_Special_Case_for_Select_Dealer(card);
  });
  const highestValue = Math.max(...values);
  const leaders = values.flatMap((value, playerIndex) => value === highestValue ? [playerIndex] : []);
  return leaders.length === 1 ? leaders[0] : null;
}

interface FanLayout {
  cardHeight: number;
  cardWidth: number;
  firstCardLeft: number;
  cardSpacing: number;
  cardTop: number;
  surfaceWidth: number;
  surfaceHeight: number;
}

interface PlaySelectDealerProps {
  gameEngine: GameEngine;
  gameMode: GameMode;
  /** Called once dealer selection (and any Three-player 2-discard) is fully done and discarded. */
  onComplete: () => void;
}

interface DealerPick {
  playerIndex: number;
  cardIndex: number;
}

/**
 * Dealer selection's progression, one step at a time:
 *   spreading -> prompting -> (traveling -> flipping -> advancing)+ -> result -> [restarting -> spreading]
 * The traveling/flipping/advancing loop repeats once per player who still needs to pick a card.
 * A tie moves to restarting, which resets state and loops back to spreading. A decisive result ends
 * the sequence in Three-player Bisca, where it continues instead into a second, smaller sequence that
 * discards one of the four "2" cards:
 *   result -> discardPrompting -> discardFlipping -> ready -> complete
 * The player to the dealer's right picks (or, if that's a computer, one is picked automatically); the
 * chosen card is flipped in place and removed from the game engine's deck before play is ready to begin.
 * Either way, the sequence ends in complete, which discards every object the sequence created and hands
 * off to the next game-engine tick.
 */
type DealerSelectionPhase =
  | { kind: 'spreading' }
  | { kind: 'prompting' }
  | { kind: 'traveling'; pick: DealerPick }
  | { kind: 'flipping'; pick: DealerPick }
  | { kind: 'advancing'; pick: DealerPick }
  | { kind: 'result'; winner: number | null }
  | { kind: 'restarting' }
  | { kind: 'discardPrompting' }
  | { kind: 'discardFlipping' }
  | { kind: 'ready' }
  | { kind: 'complete' };

/** Number of computer picks in the selected game variant. */
function computerPickCount(gameMode: GameMode): number {
  switch (gameMode) {
    case GameMode.MODE1:
    case GameMode.MODE2:
    case GameMode.MODE3:
      return 1;
    case GameMode.MODE4:
      return 2;
    case GameMode.MODE5:
      return 3;
  }
}

/** The top cards travel together; each card stops after its numbered step. */
function positionSpreadCards(root: HTMLDivElement, progress: number, cardSpacing: number): void {
  const completedSteps = progress * (SELECT_DEALER_CARD_COUNT - 1);
  const cards = root.querySelectorAll<HTMLButtonElement>('.play-select-dealer-card');

  cards.forEach((card, index) => {
    const offset = Math.min(index, completedSteps) * cardSpacing;
    card.style.transform = `translate3d(${offset}px, 0, 0)`;
  });
}

/** Finds the final surface coordinates for a chosen player's card. */
function dealerCardDestination(
  pick: DealerPick,
  layout: FanLayout,
  gameMode: GameMode,
): { left: number; top: number } {
  const horizontalGap = layout.surfaceWidth * DEFAULT_CARD_EDGE_GAP_PERCENT / 100;
  const verticalGap = layout.surfaceHeight * DEFAULT_CARD_EDGE_GAP_PERCENT / 100;
  const centerLeft = (layout.surfaceWidth - layout.cardWidth) / 2;
  const rightLeft = layout.surfaceWidth - horizontalGap - layout.cardWidth;

  if (pick.playerIndex === 0) {
    return {
      left: centerLeft,
      top: layout.surfaceHeight - verticalGap - layout.cardHeight,
    };
  }

  if (gameMode === GameMode.MODE4) {
    return {
      left: pick.playerIndex === 1 ? rightLeft : horizontalGap,
      top: verticalGap,
    };
  }

  if (gameMode === GameMode.MODE5) {
    // Three computers occupy right, center, and left in player order. The
    // center card sits at the top edge gap; the side cards sit lower.
    const left = pick.playerIndex === 1 ? rightLeft
      : pick.playerIndex === 2 ? centerLeft : horizontalGap;
    return {
      left,
      top: pick.playerIndex === 2
        ? verticalGap
        : layout.surfaceHeight * MODE5_DEALER_CARD_TOP_PERCENT / 100,
    };
  }

  return { left: centerLeft, top: verticalGap };
}

/** Moves a selected card from its fan slot to that player's edge of the surface. */
function positionSelectedCard(
  root: HTMLDivElement,
  pick: DealerPick,
  progress: number,
  layout: FanLayout,
  gameMode: GameMode,
): void {
  const card = root.querySelector<HTMLButtonElement>(
    `.play-select-dealer-card[data-card-index="${pick.cardIndex}"]`,
  );
  if (!card) return;

  const startX = (pick.cardIndex - 1) * layout.cardSpacing;
  const destination = dealerCardDestination(pick, layout, gameMode);
  const endX = destination.left - layout.firstCardLeft;
  const endY = destination.top - layout.cardTop;
  const x = startX + (endX - startX) * progress;
  const y = endY * progress;
  card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

/** Left offset for one card in a row of evenly gapped cards, centered on the surface. */
function discardRowCardLeft(index: number, count: number, layout: FanLayout): number {
  const gap = layout.surfaceWidth * DEFAULT_CARD_EDGE_GAP_PERCENT / 100;
  const rowWidth = count * layout.cardWidth + (count - 1) * gap;
  const rowLeft = (layout.surfaceWidth - rowWidth) / 2;
  return rowLeft + index * (layout.cardWidth + gap);
}

/** Renders anonymous card backs for the first-dealer selection. */
export function PlaySelectDealer({ gameEngine, gameMode, onComplete }: PlaySelectDealerProps) {
  const [cardAspectRatio, setCardAspectRatio] = useState(
    DEFAULT_CARD_FALLBACK_ASPECT_RATIO,
  );
  const hasNaturalAspectRatio = useRef(false);
  const [backLoaded, setBackLoaded] = useState(false);
  const [bubbleAssetsReady, setBubbleAssetsReady] = useState(false);
  const [phase, setPhase] = useState<DealerSelectionPhase>({ kind: 'spreading' });
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
  const [flippedCardIndices, setFlippedCardIndices] = useState<number[]>([]);
  const [selectionRound, setSelectionRound] = useState(0);
  const [layout, setLayout] = useState<FanLayout | null>(null);
  const layoutRef = useRef<FanLayout | null>(null);
  const spreadProgressRef = useRef(0);
  const selectedCardIndicesRef = useRef<number[]>([]);
  const cardTravelProgressRef = useRef<Map<number, number>>(new Map());
  const [discardDeck, setDiscardDeck] = useState<string | null>(null);
  const [discardPickerIndex, setDiscardPickerIndex] = useState<number | null>(null);
  const [discardCardIndex, setDiscardCardIndex] = useState<number | null>(null);
  const [discardFlipped, setDiscardFlipped] = useState(false);
  const animationReady = backLoaded && layout !== null;
  const isDiscardPhase = phase.kind === 'discardPrompting' || phase.kind === 'discardFlipping'
    || phase.kind === 'ready';
  const bubbleMessage = phase.kind === 'prompting' && bubbleAssetsReady
    ? i18n.t('play.selectDealerPrompt', 'Pick a card to choose the first dealer.')
    : phase.kind === 'result'
      ? (phase.winner === null
          ? i18n.t('play.dealerSelectionTie', 'Oops! More than one high... redo.')
          : phase.winner === 0
            ? i18n.t('play.youDealFirst', 'You deal first.')
            : i18n.tf('play.playerDealsFirst', 'Player {0} deals first.', String(phase.winner)))
      : phase.kind === 'discardPrompting' && discardPickerIndex === 0
        ? i18n.t('play.pickDiscardCard', 'Pick a card to discard.')
        : phase.kind === 'ready'
          ? i18n.t('play.readyToPlay', 'Ready to play.')
          : null;

  // Phase: spreading. Waits for the selected back image and surface
  // measurements, then fans every card out over the configured duration.
  // Reduced motion (or a missing Anime.js CDN, handled below) skips straight
  // to the final fan.
  const { rootRef: fanRef, run } = useAnimationScope<HTMLDivElement>((scope, root) => {
    if (!animationReady) return;

    const finishSpread = () => {
      spreadProgressRef.current = 1;
      positionSpreadCards(root, 1, layoutRef.current?.cardSpacing ?? 0);
      setPhase({ kind: 'prompting' });
    };

    if (animationScopePrefersReducedMotion(scope)) {
      finishSpread();
      return;
    }

    const spread = { progress: 0 };
    animate(spread, {
      progress: 1,
      duration: SELECT_DEALER_SPREAD_DURATION_MS,
      ease: 'linear',
      onUpdate: () => {
        spreadProgressRef.current = spread.progress;
        positionSpreadCards(root, spread.progress, layoutRef.current?.cardSpacing ?? 0);
      },
      onComplete: finishSpread,
    });
  }, [animationReady, selectionRound]);

  // The CDN is optional at runtime; if it fails to load, show the final fan
  // once the same image and surface prerequisites have been met.
  useEffect(() => {
    if (phase.kind !== 'spreading' || !animationReady || isAnimeJsAvailable()) return;
    const fan = fanRef.current;
    if (!fan) return;
    spreadProgressRef.current = 1;
    positionSpreadCards(fan, 1, layoutRef.current?.cardSpacing ?? 0);
    setPhase({ kind: 'prompting' });
  }, [phase, animationReady, fanRef, selectionRound]);

  useEffect(() => {
    let active = true;
    const avatarReady = new Promise<void>((resolve) => {
      const avatar = new Image();
      avatar.onload = () => {
        avatar.decode().then(resolve, resolve);
      };
      avatar.onerror = () => resolve();
      avatar.src = SPEECH_BUBBLE_AVATAR_PATH;
    });

    // Prepare the avatar and Excalifont while the cards spread. Mounting the
    // prompt after both settle avoids a late image paint or font swap.
    Promise.allSettled([
      avatarReady,
      document.fonts.load(SPEECH_BUBBLE_FONT_LOAD_SPEC),
    ]).then(() => {
      if (active) setBubbleAssetsReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  // Resolve the active deck's declared card size early, so the fan renders at the
  // right proportions before any card image has actually loaded.
  useEffect(() => {
    const controller = new AbortController();
    loadDeckCardAspectRatio(currentGameDeck(), controller.signal).then((ratio) => {
      if (ratio !== null && !hasNaturalAspectRatio.current) setCardAspectRatio(ratio);
    });
    return () => controller.abort();
  }, []);
  const backFace = getBackFace();

  useLayoutEffect(() => {
    const fan = fanRef.current;
    const surface = fan?.closest<HTMLElement>('.surface');
    if (!fan || !surface) return;

    // Step 1: Size every back to the configured share of the surface height.
    const updateLayout = () => {
      const cardHeight = surface.clientHeight * DEFAULT_CARD_HEIGHT_PERCENT / 100;
      const cardWidth = cardHeight * cardAspectRatio;

      // Step 2: Reserve one card width at both surface edges and distribute
      // every card position evenly across the remaining horizontal distance.
      const firstCardLeft = cardWidth * 0.75;
      const lastCardLeft = surface.clientWidth - (cardWidth * 1.75);
      const cardSpacing = (lastCardLeft - firstCardLeft) / (SELECT_DEALER_CARD_COUNT - 1);

      const nextLayout = {
        cardHeight,
        cardWidth,
        firstCardLeft,
        cardSpacing,
        cardTop: (surface.clientHeight - cardHeight) / 2,
        surfaceWidth: surface.clientWidth,
        surfaceHeight: surface.clientHeight,
      };
      layoutRef.current = nextLayout;
      positionSpreadCards(fan, spreadProgressRef.current, cardSpacing);
      selectedCardIndicesRef.current.forEach((cardIndex, playerIndex) => {
        positionSelectedCard(
          fan,
          { playerIndex, cardIndex },
          cardTravelProgressRef.current.get(cardIndex) ?? 0,
          nextLayout,
          gameMode,
        );
      });
      setLayout(nextLayout);
    };

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(surface);
    updateLayout();

    return () => resizeObserver.disconnect();
  }, [cardAspectRatio, gameMode, selectionRound]);

  // Phase: traveling. Slides the picked card from its fan slot to that
  // player's edge of the surface, then hands off to the flipping phase.
  useLayoutEffect(() => {
    if (phase.kind !== 'traveling') return;
    const { pick } = phase;
    let active = true;

    const finishTravel = () => {
      cardTravelProgressRef.current.set(pick.cardIndex, 1);
      const currentLayout = layoutRef.current;
      const fan = fanRef.current;
      if (fan && currentLayout) positionSelectedCard(fan, pick, 1, currentLayout, gameMode);
      if (active) setPhase({ kind: 'flipping', pick });
    };

    const animated = run((scope, root) => {
      if (animationScopePrefersReducedMotion(scope)) return false;

      const travel = { progress: 0 };
      animate(travel, {
        progress: 1,
        duration: SELECT_DEALER_CARD_MOVE_DURATION_MS,
        ease: 'outQuad',
        onUpdate: () => {
          cardTravelProgressRef.current.set(pick.cardIndex, travel.progress);
          const currentLayout = layoutRef.current;
          if (currentLayout) positionSelectedCard(root, pick, travel.progress, currentLayout, gameMode);
        },
        onComplete: finishTravel,
      });
      return true;
    });

    // Respect reduced motion, and still land the card when the optional
    // Anime.js CDN is unavailable.
    if (!animated) finishTravel();

    return () => { active = false; };
  }, [phase, gameMode, run]);

  // Phase: flipping. Flips the arrived card face-up (the same flip used for
  // every player's card), records it as revealed, then moves to advancing.
  useLayoutEffect(() => {
    if (phase.kind !== 'flipping') return;
    const { pick } = phase;
    let active = true;

    const finishFlip = () => {
      setFlippedCardIndices((current) => current.includes(pick.cardIndex)
        ? current : [...current, pick.cardIndex]);
      if (active) setPhase({ kind: 'advancing', pick });
    };

    const selector = `.play-select-dealer-card[data-card-index="${pick.cardIndex}"] .play-select-dealer-card-inner`;
    const animated = run((scope, root) => {
      const cardInner = root.querySelector<HTMLElement>(selector);
      if (!cardInner || animationScopePrefersReducedMotion(scope)) return false;

      animate(cardInner, {
        rotateY: 180,
        duration: SELECT_DEALER_CARD_FLIP_DURATION_MS,
        ease: 'inOutQuad',
        onComplete: finishFlip,
      });
      return true;
    });

    if (!animated) {
      const cardInner = fanRef.current?.querySelector<HTMLElement>(selector);
      if (cardInner) cardInner.style.transform = 'rotateY(180deg)';
      finishFlip();
    }

    return () => { active = false; };
  }, [phase, run]);

  // Phase: advancing. Either sends the next computer player's card into the
  // traveling phase, or - once everyone has picked - resolves the winner.
  useEffect(() => {
    if (phase.kind !== 'advancing') return;
    const { pick } = phase;

    if (pick.playerIndex >= computerPickCount(gameMode)) {
      const cards = gameEngine.dealerSelectionCards.slice(0, pick.playerIndex + 1);
      const winner = dealerSelectionWinner(cards);
      if (winner !== null) gameEngine.currentDealer = winner;
      setPhase({ kind: 'result', winner });
      return;
    }

    const nextPlayerIndex = pick.playerIndex + 1;
    const nextCardIndex = gameEngine.pickComputerDealerCard(nextPlayerIndex);
    const nextIndices = [...selectedCardIndicesRef.current];
    nextIndices[nextPlayerIndex] = nextCardIndex;
    selectedCardIndicesRef.current = nextIndices;
    cardTravelProgressRef.current.set(nextCardIndex, 0);
    setSelectedCardIndices(nextIndices);
    setPhase({ kind: 'traveling', pick: { playerIndex: nextPlayerIndex, cardIndex: nextCardIndex } });
  }, [phase, gameEngine, gameMode]);

  // Phase: result. Shows the outcome message until the player clicks, presses
  // Space/Enter, or the fallback delay elapses. A tie then moves on to
  // restarting; a decisive winner will hand off to the next game-engine tick.
  useEffect(() => {
    if (phase.kind !== 'result' || !bubbleAssetsReady) return;

    let progressed = false;
    const progress = () => {
      if (progressed) return;
      progressed = true;
      if (phase.winner === null) {
        setPhase({ kind: 'restarting' });
        return;
      }
      if (gameMode === GameMode.MODE4) {
        // Three-player Bisca discards one of the four "2" cards next. The
        // player to the dealer's right (anticlockwise) picks which.
        setDiscardDeck(gameEngine.shuffleDeckString(TWO_FACE_CARDS));
        setDiscardPickerIndex((phase.winner + 1) % 3);
        setPhase({ kind: 'discardPrompting' });
        return;
      }
      setPhase({ kind: 'complete' });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      progress();
    };

    window.addEventListener('click', progress);
    window.addEventListener('keydown', handleKeyDown);
    const timeout = window.setTimeout(progress, SELECT_DEALER_RESULT_DELAY_MS);

    return () => {
      window.removeEventListener('click', progress);
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timeout);
    };
  }, [phase, bubbleAssetsReady, gameMode, gameEngine]);

  // Phase: restarting. A tied selection reshuffles the in-memory deck and
  // resets every per-round ref/state, then loops back to spreading. Bumping
  // selectionRound remounts the fan so its spread animation can run again.
  useEffect(() => {
    if (phase.kind !== 'restarting') return;

    gameEngine.restartDealerSelection();
    selectedCardIndicesRef.current = [];
    cardTravelProgressRef.current.clear();
    spreadProgressRef.current = 0;
    setSelectedCardIndices([]);
    setFlippedCardIndices([]);
    setSelectionRound((round) => round + 1);
    setPhase({ kind: 'spreading' });
  }, [phase, gameEngine]);

  // Phase: discardPrompting (computer picker). Picks one of the four "2"
  // cards at random, immediately - only the human picker waits for a click.
  useEffect(() => {
    if (phase.kind !== 'discardPrompting' || discardPickerIndex === null
      || discardPickerIndex === 0 || !discardDeck) return;

    const cardIndex = 1 + Math.floor(Math.random() * discardDeck.length);
    setDiscardCardIndex(cardIndex);
    setPhase({ kind: 'discardFlipping' });
  }, [phase, discardPickerIndex, discardDeck]);

  // Phase transition: discardPrompting -> discardFlipping, once the human
  // picker taps a card. No-op for the computer picker or outside this phase.
  const selectDiscardCard = (cardIndex: number) => {
    if (phase.kind !== 'discardPrompting' || discardPickerIndex !== 0 || !discardDeck) return;

    setDiscardCardIndex(cardIndex);
    setPhase({ kind: 'discardFlipping' });
  };

  // Phase: discardFlipping. Flips the chosen "2" face-up where it sits (no
  // travel), removes it from the game engine's deck, then play is ready.
  useLayoutEffect(() => {
    if (phase.kind !== 'discardFlipping' || discardCardIndex === null || !discardDeck) return;
    let active = true;

    const finishDiscardFlip = () => {
      if (active) setDiscardFlipped(true);
      gameEngine.discardCard(discardDeck[discardCardIndex - 1]);
      if (active) setPhase({ kind: 'ready' });
    };

    const selector = `.play-select-dealer-card[data-card-index="${discardCardIndex}"] .play-select-dealer-card-inner`;
    const animated = run((scope, root) => {
      const cardInner = root.querySelector<HTMLElement>(selector);
      if (!cardInner || animationScopePrefersReducedMotion(scope)) return false;

      animate(cardInner, {
        rotateY: 180,
        duration: SELECT_DEALER_CARD_FLIP_DURATION_MS,
        ease: 'inOutQuad',
        onComplete: finishDiscardFlip,
      });
      return true;
    });

    if (!animated) {
      const cardInner = fanRef.current?.querySelector<HTMLElement>(selector);
      if (cardInner) cardInner.style.transform = 'rotateY(180deg)';
      finishDiscardFlip();
    }

    return () => { active = false; };
  }, [phase, discardCardIndex, discardDeck, gameEngine, run]);

  // Phase: ready. Shows "Ready to play." until the player clicks, presses
  // Space/Enter, or the fallback delay elapses, then moves on to complete.
  useEffect(() => {
    if (phase.kind !== 'ready') return;

    let progressed = false;
    const progress = () => {
      if (progressed) return;
      progressed = true;
      setPhase({ kind: 'complete' });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      progress();
    };

    window.addEventListener('click', progress);
    window.addEventListener('keydown', handleKeyDown);
    const timeout = window.setTimeout(progress, SELECT_DEALER_RESULT_DELAY_MS);

    return () => {
      window.removeEventListener('click', progress);
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timeout);
    };
  }, [phase]);

  // Phase: complete. Discards every object created by dealer selection and the
  // two-discard step, then hands off to the next game-engine tick.
  useEffect(() => {
    if (phase.kind !== 'complete') return;

    selectedCardIndicesRef.current = [];
    cardTravelProgressRef.current.clear();
    setSelectedCardIndices([]);
    setFlippedCardIndices([]);
    setDiscardDeck(null);
    setDiscardPickerIndex(null);
    setDiscardCardIndex(null);
    setDiscardFlipped(false);
    onComplete();
  }, [phase, onComplete]);

  // Phase transition: prompting -> traveling, once the human taps a card.
  const selectCard = (cardIndex: number) => {
    if (phase.kind !== 'prompting' || !gameEngine.deckInPlay[cardIndex - 1]) return;

    gameEngine.selectDealerCard(0, cardIndex);
    selectedCardIndicesRef.current = [cardIndex];
    cardTravelProgressRef.current.set(cardIndex, 0);
    setSelectedCardIndices([cardIndex]);
    setPhase({ kind: 'traveling', pick: { playerIndex: 0, cardIndex } });
  };

  // Compare only revealed cards, so each debug badge updates as the next
  // player's flip finishes without disclosing a card still face down.
  const revealedCardValues = selectedCardIndices.map((cardIndex, playerIndex) => {
    const card = gameEngine.dealerSelectionCards[playerIndex];
    return flippedCardIndices.includes(cardIndex) && card
      ? getCardValue_Special_Case_for_Select_Dealer(card)
      : null;
  });
  const shownValues = revealedCardValues.filter((value): value is number => value !== null);
  const highestValue = shownValues.length > 0 ? Math.max(...shownValues) : null;
  const highestCount = shownValues.filter((value) => value === highestValue).length;

  // Nothing left to show once every sequence object has been discarded.
  if (phase.kind === 'complete') return null;

  return (
    <>
      <div
        key={selectionRound}
        ref={fanRef}
        className='play-select-dealer'
        role='group'
        aria-label={i18n.t('play.selectDealerPrompt', 'Pick a card to choose the first dealer.')}
      >
        {!isDiscardPhase && Array.from({ length: SELECT_DEALER_CARD_COUNT }, (_, index) => {
          const cardIndex = index + 1;
          const playerIndex = selectedCardIndices.indexOf(cardIndex);
          const isSelected = playerIndex !== -1;
          const isFlipped = flippedCardIndices.includes(cardIndex);
          const selectedCard = isSelected ? gameEngine.dealerSelectionCards[playerIndex] : null;
          const selectedCardValue = isSelected ? revealedCardValues[playerIndex] : null;
          const badgeVariant = selectedCardValue === highestValue
            ? highestCount > 1 ? 'danger' : 'success'
            : 'secondary';
          const facePath = selectedCard
            ? getCardFace(selectedCard)
            : null;

          return (
            <button
              key={cardIndex}
              type='button'
              data-card-index={cardIndex}
              className='play-select-dealer-card'
              aria-label={isSelected
                ? i18n.tf('play.selectedDealerCard', 'Selected card {0}', String(cardIndex))
                : i18n.tf('play.chooseDealerCard', 'Choose card {0}', String(cardIndex))}
              aria-pressed={isSelected}
              disabled={phase.kind !== 'prompting' && phase.kind !== 'result'}
              onClick={() => selectCard(cardIndex)}
              style={layout
                ? {
                    top: `${layout.cardTop}px`,
                    left: `${layout.firstCardLeft}px`,
                    width: `${layout.cardWidth}px`,
                    height: `${layout.cardHeight}px`,
                    zIndex: isFlipped ? SELECT_DEALER_CARD_COUNT + playerIndex : index,
                  }
                : {
                    top: `${(100 - DEFAULT_CARD_HEIGHT_PERCENT) / 2}%`,
                    left: `${DEFAULT_CARD_HEIGHT_PERCENT * cardAspectRatio * 0.75
                      / PLAYING_SURFACE_ASPECT_RATIO}%`,
                    height: `${DEFAULT_CARD_HEIGHT_PERCENT}%`,
                    width: 'auto',
                    zIndex: isFlipped ? SELECT_DEALER_CARD_COUNT + playerIndex : index,
                  }}
            >
              <span className='play-select-dealer-card-inner'>
                <img
                  className='play-select-dealer-card-image'
                  src={backFace}
                  alt=''
                  draggable={false}
                  onLoad={index === 0
                    ? (event) => {
                        const image = event.currentTarget;
                        if (image.naturalHeight > 0) {
                          hasNaturalAspectRatio.current = true;
                          setCardAspectRatio(image.naturalWidth / image.naturalHeight);
                        }
                        setBackLoaded(true);
                      }
                    : undefined}
                  onError={(event) => {
                    const image = event.currentTarget;
                    if (image.dataset.fallback === 'true') return;
                    image.dataset.fallback = 'true';
                    image.src = backFace.replace(
                      /\/decks\/[^/]+\//,
                      `/decks/${DEFAULT_GAME_DECK}/`,
                    );
                  }}
                />
                {facePath && (
                  <img
                    className='play-select-dealer-card-image play-select-dealer-card-face'
                    src={facePath}
                    alt=''
                    draggable={false}
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.dataset.fallback === 'true') return;
                      image.dataset.fallback = 'true';
                      image.src = facePath.replace(
                        /\/decks\/[^/]+\//,
                        `/decks/${DEFAULT_GAME_DECK}/`,
                      );
                    }}
                  />
                )}
              </span>
              {isFlipped && selectedCardValue !== null && (
                <span
                  className={`play-select-dealer-card-value badge text-bg-${badgeVariant}`}
                  aria-hidden='true'
                >
                  {selectedCardValue}
                </span>
              )}
            </button>
          );
        })}
        {isDiscardPhase && discardDeck && layout && discardDeck.split('').map((card, index) => {
          const cardIndex = index + 1;
          const isPicked = discardCardIndex === cardIndex;
          const isThisFlipped = isPicked && discardFlipped;
          const facePath = isPicked ? getCardFace(card) : null;
          const canPick = phase.kind === 'discardPrompting' && discardPickerIndex === 0;

          return (
            <button
              key={`discard-${cardIndex}`}
              type='button'
              data-card-index={cardIndex}
              className='play-select-dealer-card'
              aria-label={isPicked
                ? i18n.tf('play.selectedDiscardCard', 'Discarding card {0}', String(cardIndex))
                : i18n.tf('play.chooseDiscardCard', 'Choose card {0} to discard', String(cardIndex))}
              aria-pressed={isPicked}
              disabled={!canPick && phase.kind !== 'ready'}
              onClick={() => selectDiscardCard(cardIndex)}
              style={{
                top: `${layout.cardTop}px`,
                left: `${discardRowCardLeft(index, discardDeck.length, layout)}px`,
                width: `${layout.cardWidth}px`,
                height: `${layout.cardHeight}px`,
                zIndex: isThisFlipped ? discardDeck.length : index,
              }}
            >
              <span className='play-select-dealer-card-inner'>
                <img
                  className='play-select-dealer-card-image'
                  src={backFace}
                  alt=''
                  draggable={false}
                  onError={(event) => {
                    const image = event.currentTarget;
                    if (image.dataset.fallback === 'true') return;
                    image.dataset.fallback = 'true';
                    image.src = backFace.replace(
                      /\/decks\/[^/]+\//,
                      `/decks/${DEFAULT_GAME_DECK}/`,
                    );
                  }}
                />
                {facePath && (
                  <img
                    className='play-select-dealer-card-image play-select-dealer-card-face'
                    src={facePath}
                    alt=''
                    draggable={false}
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.dataset.fallback === 'true') return;
                      image.dataset.fallback = 'true';
                      image.src = facePath.replace(
                        /\/decks\/[^/]+\//,
                        `/decks/${DEFAULT_GAME_DECK}/`,
                      );
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {bubbleAssetsReady && bubbleMessage !== null && (
        <SpeechBubble avatarAlt=''>{bubbleMessage}</SpeechBubble>
      )}
    </>
  );
}
