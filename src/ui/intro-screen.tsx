// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useState } from 'preact/hooks';
import { i18n } from '../core/i18n';
import { RadioImages } from './radio-images';

export type GameMode = 'bisca-3' | 'bisca-7' | 'bisca-9' | 'bisca-3-players' | 'sueca';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type MatchCount = 1 | 3;

export interface GameSetupOptions {
  gameMode: GameMode;
  cardDeck: string;
  cardBack: string;
  difficulty: Difficulty;
  matchCount: MatchCount;
}

const GAME_MODES: { id: GameMode; image: string; labelKey: string; fallback: string }[] = [
  { id: 'bisca-3', image: '/assets/img/menu/mode-1.jpg', labelKey: 'gameMode.bisca3', fallback: 'Bisca dos Três' },
  { id: 'bisca-7', image: '/assets/img/menu/mode-2.jpg', labelKey: 'gameMode.bisca7', fallback: 'Bisca dos Sete' },
  { id: 'bisca-9', image: '/assets/img/menu/mode-3.jpg', labelKey: 'gameMode.bisca9', fallback: 'Bisca dos Nove' },
  { id: 'bisca-3-players', image: '/assets/img/menu/mode-4.jpg', labelKey: 'gameMode.bisca3players', fallback: 'Bisca dos Três (3 Players)' },
  { id: 'sueca', image: '/assets/img/menu/mode-5.jpg', labelKey: 'gameMode.sueca', fallback: 'Sueca' },
];

const CARD_DECKS: { id: string; labelKey: string; fallback: string }[] = [
  { id: 'classic', labelKey: 'cardDeck.classic', fallback: 'Classic' },
];

const CARD_BACKS: { id: string; labelKey: string; fallback: string }[] = [
  { id: 'default', labelKey: 'cardBack.default', fallback: 'Default' },
];

const DIFFICULTIES: { id: Difficulty; labelKey: string; fallback: string }[] = [
  { id: 'easy', labelKey: 'difficulty.easy', fallback: 'Easy' },
  { id: 'normal', labelKey: 'difficulty.normal', fallback: 'Normal' },
  { id: 'hard', labelKey: 'difficulty.hard', fallback: 'Hard' },
];

const MATCH_COUNTS: { id: MatchCount; labelKey: string; fallback: string }[] = [
  { id: 1, labelKey: 'matchCount.single', fallback: 'Single game' },
  { id: 3, labelKey: 'matchCount.bestOf3', fallback: 'Best of 3' },
];

interface IntroScreenProps {
  onStart: (options: GameSetupOptions) => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const [gameMode, setGameMode] = useState<GameMode>('bisca-3');
  const [cardDeck, setCardDeck] = useState(CARD_DECKS[0].id);
  const [cardBack, setCardBack] = useState(CARD_BACKS[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [matchCount, setMatchCount] = useState<MatchCount>(1);

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    onStart({ gameMode, cardDeck, cardBack, difficulty, matchCount });
  };

  return (
    <div className='card shadow mx-auto intro-card'>
      <div className='card-body'>
        <h1 className='card-title text-center mb-4'>{i18n.t('appName', 'Bisca')}</h1>
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <span className='form-label d-block'>{i18n.t('intro.gameMode', 'Game mode')}</span>
            <RadioImages
              name='game-mode'
              value={gameMode}
              onChange={setGameMode}
              ariaLabel={i18n.t('intro.gameMode', 'Game mode')}
              options={GAME_MODES.map((mode) => ({
                id: mode.id,
                image: mode.image,
                label: i18n.t(mode.labelKey, mode.fallback),
              }))}
            />
          </div>

          <div className='mb-3'>
            <label className='form-label' htmlFor='card-deck'>
              {i18n.t('intro.cardDeck', 'Card deck')}
            </label>
            <select
              id='card-deck'
              className='form-select'
              value={cardDeck}
              onChange={(e) => setCardDeck(e.currentTarget.value)}
            >
              {CARD_DECKS.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {i18n.t(deck.labelKey, deck.fallback)}
                </option>
              ))}
            </select>
          </div>

          {/* <div className='mb-3'>
            <label className='form-label' htmlFor='card-back'>
              {i18n.t('intro.cardBack', 'Card back')}
            </label>
            <select
              id='card-back'
              className='form-select'
              value={cardBack}
              onChange={(e) => setCardBack(e.currentTarget.value)}
            >
              {CARD_BACKS.map((back) => (
                <option key={back.id} value={back.id}>
                  {i18n.t(back.labelKey, back.fallback)}
                </option>
              ))}
            </select>
          </div>

          <div className='mb-3'>
            <label className='form-label' htmlFor='difficulty'>
              {i18n.t('intro.difficulty', 'Difficulty')}
            </label>
            <select
              id='difficulty'
              className='form-select'
              value={difficulty}
              onChange={(e) => setDifficulty(e.currentTarget.value as Difficulty)}
            >
              {DIFFICULTIES.map((level) => (
                <option key={level.id} value={level.id}>
                  {i18n.t(level.labelKey, level.fallback)}
                </option>
              ))}
            </select>
          </div>

          <div className='mb-4'>
            <label className='form-label' htmlFor='match-count'>
              {i18n.t('intro.matchCount', 'Match count')}
            </label>
            <select
              id='match-count'
              className='form-select'
              value={matchCount}
              onChange={(e) => setMatchCount(Number(e.currentTarget.value) as MatchCount)}
            >
              {MATCH_COUNTS.map((count) => (
                <option key={count.id} value={count.id}>
                  {i18n.t(count.labelKey, count.fallback)}
                </option>
              ))}
            </select>
          </div> */}

          <button type='submit' className='btn btn-primary w-100'>
            {i18n.t('intro.start', 'Start game')}
          </button>
        </form>
      </div>
    </div>
  );
}
