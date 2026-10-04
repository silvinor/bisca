// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { h, render } from 'preact';
import { GameState } from './game-state';
import { saveGameProgress } from './game-common';
import { StateGameMode } from '../ui/state-mode';
import {
  type Trigger,
  type GameMode,
  getGameMode, 
  setGameMode, 
  GAME_MODE_1,
  GAME_MODE_2,
  GAME_MODE_3,
  GAME_MODE_4,
  GAME_MODE_5,
  DEFAULT_GAME_MODE,
  type Difficulty,
  getDifficulty, 
  setDifficulty, 
  GAME_DIFFICULTY_EASY,
  GAME_DIFFICULTY_HARD,
  GAME_DIFFICULTY_NORMAL,
  DEFAULT_GAME_DIFFICULTY,
  type MatchCount,
  getMatchCount,
  setMatchCount,
  GAME_COUNT_FOUR,
  GAME_COUNT_ONE,
  GAME_COUNT_THREE,
  GAME_COUNT_TWO,
  DEFAULT_GAME_COUNT,
  StateMain,
} from '../types/game-state.d';
import { 
  ACTION_SETTINGS,
  ACTION_HELP,
} from './constants';
import { g, type G, saveG } from './game-context';
import { logger } from './logger';

export interface GameModeSelection extends Trigger {
  mode: GameMode;
  difficulty: Difficulty;
  matchCount: MatchCount;
}

const MATCH_COUNT_VALUES: Record<MatchCount, G['matchCnt']> = {
  [GAME_COUNT_ONE]: 1,
  [GAME_COUNT_TWO]: 2,
  [GAME_COUNT_THREE]: 3,
  [GAME_COUNT_FOUR]: 4,
};

const GAME_MODES = [GAME_MODE_1, GAME_MODE_2, GAME_MODE_3, GAME_MODE_4, GAME_MODE_5] as const;
const DIFFICULTIES = [GAME_DIFFICULTY_EASY, GAME_DIFFICULTY_NORMAL, GAME_DIFFICULTY_HARD] as const;
const MATCH_COUNTS = [GAME_COUNT_ONE, GAME_COUNT_TWO, GAME_COUNT_THREE, GAME_COUNT_FOUR] as const;

function validOption<T extends string>(value: string, options: readonly T[], defaultValue: T): T {
  return options.find((option) => option === value) ?? defaultValue;
}

function difficultyForMode(mode: GameMode, difficulty: Difficulty): Difficulty {
  return mode === GAME_MODE_5 && difficulty === GAME_DIFFICULTY_EASY
    ? GAME_DIFFICULTY_NORMAL
    : difficulty;
}

export class GameModeGameState extends GameState<StateMain, GameModeSelection | Trigger> {
  private loaded: boolean = false;
  private mode: GameMode = DEFAULT_GAME_MODE;
  private difficulty: Difficulty = DEFAULT_GAME_DIFFICULTY;
  private matchCount: MatchCount = DEFAULT_GAME_COUNT;

  public constructor() {
    super(StateMain.GAME_MODE);
  }

  protected init(): void {
    // logger.debug('GAME_MODE --> Init');

    saveGameProgress(StateMain.GAME_MODE);

    this.loaded = false;
    // this.mode = DEFAULT_GAME_MODE;
    // this.difficulty = DEFAULT_GAME_DIFFICULTY;
    // this.matchCount = DEFAULT_GAME_COUNT;
  }

  protected async tick(): Promise<void> {
    // logger.debug('GAME_MODE --> Tick');
    if (!this.loaded) await this.loadOptions();
  }

  protected draw(): void {
    // logger.debug('GAME_MODE --> Draw');

    if (!this.loaded) {
      const appMain = document.getElementById('app-main');
      if (!appMain) return;

      render(h(StateGameMode, {
        mode: this.mode,
        difficulty: this.difficulty,
        matchCount: this.matchCount,
        onChangeMode: this.onChangeMode,
        onChangeDifficulty: this.onChangeDifficulty,
        onChangeMatchCount: this.onChangeMatchCount,
      }), appMain);
      this.loaded = true;
    }
  }

  protected tock(): StateMain {
    const selection = this.lastTrigger;

    // logger.info('****************');
    // logger.info(selection);
    // logger.info('****************');

    if (!this.triggered || !selection) return this.currentState;

    // Copy the validated dialog selection into the game context before changing screens.
    if ('mode' in selection) g.mode = selection.mode;
    if ('difficulty' in selection) g.difficulty = selection.difficulty;
    if ('matchCount' in selection) g.matchCnt = MATCH_COUNT_VALUES[selection.matchCount];
    g.deck = ''; // void the deck so that Dealer Selection can initialise
    saveG(g);

    if (selection.action == ACTION_SETTINGS) {
      return StateMain.SETTINGS;
    } else if (selection.action == ACTION_HELP) {
      return StateMain.HELP;
    } else {
      return StateMain.SELECT_DEALER;
    }
  }
  
  protected end(): void {
    // logger.debug('GAME_MODE --> End');
    const appMain = document.getElementById('app-main');
    if (appMain) render(null, appMain);
    this.loaded = false;
  }

  // Enforce the mode dependency before the UI commits and displays the new selection.
  private readonly onChangeMode = (nextMode: GameMode, difficulty: Difficulty): Difficulty => {
    const nextDifficulty = difficultyForMode(nextMode, difficulty);
    this.mode = nextMode;
    this.difficulty = nextDifficulty;

    setGameMode(nextMode);
    if (nextDifficulty !== difficulty) { setDifficulty(nextDifficulty); }

    return nextDifficulty;
  };

  private readonly onChangeDifficulty = (difficulty: Difficulty): void => {
    this.difficulty = difficulty;
    setDifficulty(difficulty);
  };

  private readonly onChangeMatchCount = (matchCount: MatchCount): void => {
    this.matchCount = matchCount;
    setMatchCount(matchCount);
  };

  private async loadOptions(): Promise<void> {
    try {
      const [storedMode, storedDifficulty, storedMatchCount] = await Promise.all([
        getGameMode(),
        getDifficulty(),
        getMatchCount(),
      ]);

      // Validate persisted values, then apply the mode dependency before rendering the screen.
      this.mode = validOption(storedMode, GAME_MODES, DEFAULT_GAME_MODE);
      const loadedDifficulty = validOption(storedDifficulty, DIFFICULTIES, DEFAULT_GAME_DIFFICULTY);
      this.difficulty = difficultyForMode(this.mode, loadedDifficulty);
      this.matchCount = validOption(storedMatchCount, MATCH_COUNTS, DEFAULT_GAME_COUNT);
      if (this.difficulty !== loadedDifficulty) this.onChangeDifficulty(this.difficulty);
    } catch (error: unknown) {
      logger.warn('[Persistence] Failed to load game options:', error);
    }
  }
}
