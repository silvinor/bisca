// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { deckBackUrl, deckPreviewUrl, loadDeckCatalog, type DeckCatalogEntry } from '../core/deck-catalog';
import { i18n } from '../core/i18n';
import { persistence } from '../core/persistence';
import { closeClick, helpClick } from '../core/reactions';
import { applyTableColorClass, applyTableTextureClass } from '../core/dynamic-css';
import {
  SAVE_GROUP_OPTION,
  SAVE_GAME_DECK,
  SAVE_CARD_BACK,
  SAVE_TABLE_COLOR,
  SAVE_TABLE_TEXTURE,
  SAVE_TEN_CARD,
  SAVE_COURT_CARD_POINTS,
  SAVE_SCORE_KEEPING,
  DEFAULT_GAME_DECK_NAME,
  DEFAULT_CARD_BACK,
  DEFAULT_TABLE_COLOR,
  DEFAULT_TABLE_TEXTURE,
  DEFAULT_TEN_CARD,
  DEFAULT_COURT_CARD_POINTS,
  DEFAULT_SCORE_KEEPING,
} from '../core/constants';
import { RadioImages, type RadioImagesLayerClasses } from './radio-images';
import { 
  getGameDeckName, 
  setGameDeckName,
  getCardBack,
  setCardBack,
  getTenCard,
  setTenCard,
  getTableColor,
  setTableColor,
  getTableTexture,
  setTableTexture,
  getCourtCardPoints,
  setCourtCardPoints,
  getScoreKeeping,
  setScoreKeeping,
  resetCardCache,
} from '../core/deck-handler';
import {
  COURT_CARD_POINTS_Q2J3,
  COURT_CARD_POINTS_J2Q3,
  type CourtCardPoints,
  SCORE_KEEPING_COMBS,
  SCORE_KEEPING_CROSSES,
  type ScoreKeeping,
  TABLE_COLOR_GREEN,
  TABLE_COLOR_RED,
  TABLE_COLOR_BLUE,
  TABLE_COLOR_EBONY,
  TABLE_COLOR_PURPLE,
  type TableColor,
  TABLE_TEXTURE_FELT,
  TABLE_TEXTURE_FABRIC,
  TABLE_TEXTURE_LEATHER,
  TABLE_TEXTURE_SUEDE,
  TABLE_TEXTURE_DIGITAL,
  type TableTexture,
  TEN_CARD_SEVEN,
  TEN_CARD_TEN,
  TEN_CARD_THREE,
  type TenCard,
} from '../types/game-state.d';

const TEN_CARDS = [
  { id: TEN_CARD_SEVEN, labelKey: 'state-settings:ten-card-seven' },
  { id: TEN_CARD_THREE, labelKey: 'state-settings:ten-card-three' },
  { id: TEN_CARD_TEN, labelKey: 'state-settings:ten-card-ten' },
] as const;

const COURT_CARD_POINTS = [
  { id: COURT_CARD_POINTS_Q2J3, labelKey: 'state-settings:court-card-points-default' },
  { id: COURT_CARD_POINTS_J2Q3, labelKey: 'state-settings:court-card-points-anglo-french' },
] as const;

const SCORE_KEEPINGS = [
  { id: SCORE_KEEPING_CROSSES, labelKey: 'state-settings:score-keeping-crosses' },
  { id: SCORE_KEEPING_COMBS, labelKey: 'state-settings:score-keeping-combs' },
] as const;

const TABLE_COLORS: readonly { id: TableColor; labelKey: string; descriptionKey: string; classes: RadioImagesLayerClasses }[] = [
  { id: TABLE_COLOR_GREEN, labelKey: 'state-settings:table-color-green', descriptionKey: 'state-settings:table-color-green-description', classes: ['bg-texture bg-green', '', '', ''] },
  { id: TABLE_COLOR_RED, labelKey: 'state-settings:table-color-red', descriptionKey: 'state-settings:table-color-red-description', classes: ['bg-texture bg-red', '', '', ''] },
  { id: TABLE_COLOR_BLUE, labelKey: 'state-settings:table-color-blue', descriptionKey: 'state-settings:table-color-blue-description', classes: ['bg-texture bg-blue', '', '', ''] },
  { id: TABLE_COLOR_EBONY, labelKey: 'state-settings:table-color-ebony', descriptionKey: 'state-settings:table-color-ebony-description', classes: ['bg-texture bg-ebony', '', '', ''] },
  { id: TABLE_COLOR_PURPLE, labelKey: 'state-settings:table-color-purple', descriptionKey: 'state-settings:table-color-purple-description', classes: ['bg-texture bg-purple', '', '', ''] },
] as const;

const TABLE_TEXTURES: readonly { id: TableTexture; labelKey: string; descriptionKey: string; classes: RadioImagesLayerClasses }[] = [
  { id: TABLE_TEXTURE_FELT, labelKey: 'state-settings:table-texture-felt', descriptionKey: 'state-settings:table-texture-felt-description', classes: ['bg-color', '', '', 'bg-felt'] },
  { id: TABLE_TEXTURE_FABRIC, labelKey: 'state-settings:table-texture-fabric', descriptionKey: 'state-settings:table-texture-fabric-description', classes: ['bg-color', '', '', 'bg-fabric'] },
  { id: TABLE_TEXTURE_LEATHER, labelKey: 'state-settings:table-texture-leather', descriptionKey: 'state-settings:table-texture-leather-description', classes: ['bg-color', '', '', 'bg-leather'] },
  { id: TABLE_TEXTURE_SUEDE, labelKey: 'state-settings:table-texture-suede', descriptionKey: 'state-settings:table-texture-suede-description', classes: ['bg-color', '', '', 'bg-suede'] },
  { id: TABLE_TEXTURE_DIGITAL, labelKey: 'state-settings:table-texture-digital', descriptionKey: 'state-settings:table-texture-digital-description', classes: ['bg-color', '', '', 'bg-digital'] },
] as const;

// const DEFAULT_OPTIONS = {
//   gameDeck: DEFAULT_GAME_DECK,
//   cardBack: DEFAULT_CARD_BACK,
//   tableColor: DEFAULT_TABLE_COLOR,
//   tableTexture: DEFAULT_TABLE_TEXTURE,
//   tenCard: DEFAULT_TEN_CARD,
//   courtCardPoints: DEFAULT_COURT_CARD_POINTS,
//   scoreKeeping: DEFAULT_SCORE_KEEPING,
// } as const satisfies {
//   gameDeck: string;
//   cardBack: string;
//   tableColor: TableColor;
//   tableTexture: TableTexture;
//   tenCard: TenCard;
//   courtCardPoints: CourtCardPoints;
//   scoreKeeping: ScoreKeeping;
// };

/** Card backs are lettered files ('a', 'b', ...) up to a deck's declared count. */
function cardBackIds(count: number): string[] {
  const firstBackCode = 'a'.charCodeAt(0);
  return Array.from({ length: count }, (_, index) => String.fromCharCode(firstBackCode + index));
}

function validOption<T extends string>(
  value: string,
  options: readonly { id: T }[],
  defaultValue: T,
): T {
  return options.find((option) => option.id === value)?.id ?? defaultValue;
}

/** Separates the leading label text and any "(...)" qualifier, e.g. "7 (Default)". */
function niceCheckLabel(label: string): ComponentChildren {
  const firstPeriod = label.indexOf('.');
  const firstParenthesis = label.indexOf('(');
  const markEnd = Math.min(
    firstPeriod === -1 ? label.length : firstPeriod,
    firstParenthesis === -1 ? label.length : firstParenthesis,
  );
  const parts: ComponentChildren[] = [];
  const parenthesizedText = /\([^)]*\)/g;
  let cursor = 0;

  const addPlainText = (end: number) => {
    if (cursor < markEnd) {
      const endOfMarkText = Math.min(end, markEnd);
      parts.push(
        <span className='form-label' key={`mark-${cursor}`}>
          {label.slice(cursor, endOfMarkText)}
        </span>,
      );
      cursor = endOfMarkText;
    }
    if (cursor < end) parts.push(label.slice(cursor, end));
    cursor = end;
  };

  for (const match of label.matchAll(parenthesizedText)) {
    const matchStart = match.index;
    addPlainText(matchStart);
    parts.push(
      <span className='form-text' key={`muted-${matchStart}`}>
        {match[0]}
      </span>,
    );
    cursor = matchStart + match[0].length;
  }
  addPlainText(label.length);

  return parts;
}

interface SettingsRadioRowProps<T extends string> {
  footnote?: string;
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { id: T; labelKey: string }[];
}

/** One label+hint / radio-list pair, e.g. "Ten Card" — laid out as two Bootstrap columns. */
function SettingsRadioRow<T extends string>({
  footnote,
  name,
  value,
  onChange,
  options,
}: SettingsRadioRowProps<T>) {
  // const hintId = `${name}-hint`;

  return (
    <>
      {options.map((option) => (
        <div className='form-check form-check-reverse' key={option.id}>
          <input
            className='form-check-input'
            type='radio'
            name={name}
            id={`${name}-${option.id}`}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
          />
          <label className='form-check-label' htmlFor={`${name}-${option.id}`}>
            {niceCheckLabel(i18n.t(option.labelKey))}
          </label>
        </div>
      ))}
      {footnote && <span className='text-muted small d-block px-1 text-end'>{footnote}</span>}
    </>
  );
}

// Escape closes the modal regardless of focus; Enter/Space are left alone so
// they keep working as normal form-control activation inside the dialog.
function onEscapeKeyDown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  closeClick();
}

export function StateSettings() {
  const [gameDeck, _setGameDeckName] = useState<string>(DEFAULT_GAME_DECK_NAME);
  const [cardBack, _setCardBack] = useState<string>(DEFAULT_CARD_BACK);
  const [tableColor, _setTableColor] = useState<TableColor>(DEFAULT_TABLE_COLOR);
  const [tableTexture, _setTableTexture] = useState<TableTexture>(DEFAULT_TABLE_TEXTURE);
  const [tenCard, _setTenCard] = useState<TenCard>(DEFAULT_TEN_CARD);
  const [courtCardPoints, _setCourtCardPoints] = useState<CourtCardPoints>(DEFAULT_COURT_CARD_POINTS);
  const [scoreKeeping, _setScoreKeeping] = useState<ScoreKeeping>(DEFAULT_SCORE_KEEPING);
  const [optionsLoaded, _setOptionsLoaded] = useState(false);
  const [decks, _setDecks] = useState<DeckCatalogEntry[]>([]);
  const [deckCatalogError, _setDeckCatalogError] = useState(false);

  useEffect(() => {
    let active = true;

    // Load each value after the prior read creates or opens the shared store.
    const loadOptions = async () => {
      try {
        const storedGameDeckName = await getGameDeckName();
        const storedCardBack = await getCardBack();
        const storedTableColor = await getTableColor();
        const storedTableTexture = await getTableTexture();
        const storedTenCard = await getTenCard();
        const storedCourtCardPoints = await getCourtCardPoints();
        const storedScoreKeeping = await getScoreKeeping();
        if (!active) return;

        // Validate stored data before publishing the loaded state. The stored
        // deck id and card back are checked once the deck catalog itself has
        // loaded, below.
        _setGameDeckName(storedGameDeckName);
        _setCardBack(storedCardBack);
        const loadedTableColor = validOption(storedTableColor, TABLE_COLORS, DEFAULT_TABLE_COLOR);
        _setTableColor(loadedTableColor);
        applyTableColorClass(loadedTableColor);
        const loadedTableTexture = validOption(storedTableTexture, TABLE_TEXTURES, DEFAULT_TABLE_TEXTURE);
        _setTableTexture(loadedTableTexture);
        applyTableTextureClass(loadedTableTexture);
        _setTenCard(validOption(storedTenCard, TEN_CARDS, DEFAULT_TEN_CARD));
        _setCourtCardPoints(validOption(storedCourtCardPoints, COURT_CARD_POINTS, DEFAULT_COURT_CARD_POINTS));
        _setScoreKeeping(validOption(storedScoreKeeping, SCORE_KEEPINGS, DEFAULT_SCORE_KEEPING));
      } catch (error: unknown) {
        console.error('[Persistence] Failed to load settings options:', error);
      } finally {
        if (active) _setOptionsLoaded(true);
      }
    };

    void loadOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', onEscapeKeyDown);
    return () => document.removeEventListener('keydown', onEscapeKeyDown);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadDeckCatalog(controller.signal)
      .then(_setDecks)
      .catch(() => {
        if (!controller.signal.aborted) _setDeckCatalogError(true);
      });
    return () => controller.abort();
  }, []);

  const changeGameDeck = (next: string) => {
    _setGameDeckName(next); // internal
    setGameDeckName(next); // persist

    // Restore whichever back was last picked for this specific deck; the
    // fallback-correction effect below fixes it up once the catalog confirms
    // that deck's actual back count.
    const cardBack: string = persistence.get(SAVE_GROUP_OPTION, `${SAVE_CARD_BACK}-${next}`, DEFAULT_CARD_BACK);
    _setCardBack(cardBack);

    resetCardCache();
  };

  // Once the catalog arrives, a stored deck id it no longer lists (removed,
  // or never valid) falls back to whichever deck the catalog lists first.
  useEffect(() => {
    if (decks.length > 0 && !decks.some((deck) => deck.id === gameDeck)) {
      changeGameDeck(decks[0].id);
    }
  }, [decks, gameDeck]);

  const selectedDeckDetails = decks.find((deck) => deck.id === gameDeck);
  const availableCardBacks = selectedDeckDetails ? cardBackIds(selectedDeckDetails.backs) : [];

  const changeCardBack = (next: string) => {
    _setCardBack(next);
    setCardBack(next, gameDeck);
    resetCardCache();
  };

  // A card back that the now-selected deck doesn't offer (deck just changed,
  // or the stored back is stale) falls back to that deck's first back.
  useEffect(() => {
    if (selectedDeckDetails && !availableCardBacks.includes(cardBack)) {
      changeCardBack(availableCardBacks[0] ?? DEFAULT_CARD_BACK);
    }
  }, [selectedDeckDetails, cardBack]);

  const changeTableColor = (next: TableColor) => {
    _setTableColor(next);
    setTableColor(next);
    applyTableColorClass(next);
  };

  const changeTableTexture = (next: TableTexture) => {
    _setTableTexture(next);
    setTableTexture(next);
    applyTableTextureClass(next);
  };

  const changeTenCard = (next: TenCard) => {
    _setTenCard(next);
    setTenCard(next);
    resetCardCache();
  };

  const changeCourtCardPoints = (next: CourtCardPoints) => {
    _setCourtCardPoints(next);
    setCourtCardPoints(next);
    resetCardCache();
  };

  const changeScoreKeeping = (next: ScoreKeeping) => {
    _setScoreKeeping(next);
    setScoreKeeping(next);
  };

  return (
    <>
      {/* Sibling of .modal, not nested inside it: the backdrop's explicit
          z-index would otherwise paint over .modal-dialog, which has none. */}
      <div className='modal-backdrop show' />
      <div className='modal d-block' tabIndex={-1} role='dialog' aria-modal='true' aria-labelledby='settings-title'>
        <div className='modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h1 id='settings-title' className='modal-title fs-5'>
                {i18n.t('state-settings:title')}
              </h1>
              <button
                type='button'
                className='btn-close'
                aria-label={i18n.t('app:close')}
                onClick={closeClick}
              />
            </div>
            <div className='modal-body settings-modal-body'>
              {optionsLoaded && (
                <>
                  <fieldset className='app-fieldset py-2'>
                    <legend className='h5 form-label d-block app-mode-legend'>
                      {i18n.t('state-settings:game-deck')}
                    </legend>
                    {deckCatalogError ? (
                      <p role='alert'>{i18n.t('state-settings:deck-load-error')}</p>
                    ) : decks.length === 0 ? (
                      <p role='status'>{i18n.t('state-settings:deck-loading')}</p>
                    ) : (
                      <RadioImages
                        name={SAVE_GAME_DECK}
                        value={gameDeck}
                        onChange={changeGameDeck}
                        ariaLabel={i18n.t('state-settings:game-deck')}
                        options={decks.map((deck) => ({
                          id: deck.id,
                          label: deck.label,
                          description: deck.description,
                          hint: deck.label,
                          image: deckPreviewUrl(deck.id),
                          classes: ['bg-color bg-texture', '', '', ''] as RadioImagesLayerClasses,
                        }))}
                      />
                    )}
                  </fieldset>

                  {selectedDeckDetails && (
                    <fieldset className='app-fieldset py-2'>
                      <legend className='h5 form-label d-block app-mode-legend'>
                        {i18n.t('state-settings:card-back')}
                      </legend>
                      <RadioImages
                        name={SAVE_CARD_BACK}
                        value={cardBack}
                        onChange={changeCardBack}
                        ariaLabel={i18n.t('state-settings:card-back')}
                        imageSizePercent={70}
                        options={availableCardBacks.map((back) => ({
                          id: back,
                          image: deckBackUrl(gameDeck, back),
                          classes: ['bg-color bg-texture', '', '', ''] as RadioImagesLayerClasses,
                        }))}
                      />
                    </fieldset>
                  )}

                  <fieldset className='app-fieldset py-2'>
                    <legend className='h5 form-label d-block app-mode-legend'>
                      {i18n.t('state-settings:table-color')}
                    </legend>
                    <RadioImages
                      name={SAVE_TABLE_COLOR}
                      value={tableColor}
                      onChange={changeTableColor}
                      ariaLabel={i18n.t('state-settings:table-color')}
                      options={TABLE_COLORS.map((option) => ({
                        id: option.id,
                        label: i18n.t(option.labelKey),
                        description: i18n.t(option.descriptionKey),
                        hint: i18n.t(option.labelKey),
                        classes: option.classes,
                      }))}
                    />
                  </fieldset>

                  <fieldset className='app-fieldset py-2'>
                    <legend className='h5 form-label d-block app-mode-legend'>
                      {i18n.t('state-settings:table-texture')}
                    </legend>
                    <RadioImages
                      name={SAVE_TABLE_TEXTURE}
                      value={tableTexture}
                      onChange={changeTableTexture}
                      ariaLabel={i18n.t('state-settings:table-texture')}
                      options={TABLE_TEXTURES.map((option) => ({
                        id: option.id,
                        label: i18n.t(option.labelKey),
                        description: i18n.t(option.descriptionKey),
                        hint: i18n.t(option.labelKey),
                        classes: option.classes,
                      }))}
                    />
                  </fieldset>

                  <fieldset className='app-fieldset py-2'>
                    <legend className='h5 form-label d-block app-mode-legend'>
                      {i18n.t('state-settings:game-scoring')}
                    </legend>

                    <div className='row'>

                      <div className='col-md-7 my-1'>
                      <span className='h6'>{i18n.t('state-settings:ten-card')}</span><br/>
                      <span className='text-muted small'>{i18n.t('state-settings:ten-card-hint')}</span>
                      </div>
                      <div className='col-md-5 my-1'>
                        <SettingsRadioRow
                          name={SAVE_TEN_CARD}
                          value={tenCard}
                          onChange={changeTenCard}
                          options={TEN_CARDS}
                        />
                      </div>

                      <div className='col-md-7 my-1'>
                      <span className='h6'>{i18n.t('state-settings:court-card-points')}</span><br/>
                      <span className='text-muted small'>{i18n.t('state-settings:court-card-points-hint')}</span>
                      </div>
                      <div className='col-md-5 my-1'>
                        <SettingsRadioRow
                          footnote={i18n.t('state-settings:court-card-points-king')}
                          name={SAVE_COURT_CARD_POINTS}
                          value={courtCardPoints}
                          onChange={changeCourtCardPoints}
                          options={COURT_CARD_POINTS}
                        />
                      </div>

                      <div className='col-md-7 my-1'>
                      <span className='h6'>{i18n.t('state-settings:score-keeping')}</span><br/>
                      <span className='text-muted small'>{i18n.t('state-settings:score-keeping-hint')}</span>
                      </div>
                      <div className='col-md-5 my-1'>
                        <SettingsRadioRow
                          name={SAVE_SCORE_KEEPING}
                          value={scoreKeeping}
                          onChange={changeScoreKeeping}
                          options={SCORE_KEEPINGS}
                        />
                      </div>

                    </div>
                  </fieldset>  
                </>
              )}
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-info' onClick={helpClick}>
                <i class='fa-solid'>?</i>
              </button>
              <button type='button' className='btn btn-primary' onClick={closeClick}>
                <i class="fa-solid me-1">&#x2713;</i>
                {i18n.t('app:done')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
