// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useRef, useState } from 'preact/hooks';
import {
  DEFAULT_CARD_BACK,
  TABLE_COLOR_HEX,
  TABLE_TEXTURE_PATH,
  TableColor,
  TableTexture,
} from '../core/constants';
import { deckBackUrl, deckPreviewUrl, loadDeckCatalog, type DeckCatalogEntry } from '../core/deck-catalog';
import { i18n } from '../core/i18n';
import { RadioCardBacks } from './radio-card-backs';
import { RadioImages } from './radio-images';
import { RadioTableColor } from './radio-table-color';

const TABLE_COLORS = [
  {
    id: TableColor.GREEN,
    labelKey: 'tableColor.green.label',
    label: 'Casino Green',
    descriptionKey: 'tableColor.green.description',
    description: 'Deep traditional green',
  },
  {
    id: TableColor.RED,
    labelKey: 'tableColor.red.label',
    label: 'Burgundy Red',
    descriptionKey: 'tableColor.red.description',
    description: 'Dark wine red',
  },
  {
    id: TableColor.BLUE,
    labelKey: 'tableColor.blue.label',
    label: 'Royal Blue',
    descriptionKey: 'tableColor.blue.description',
    description: 'Rich medium-dark blue',
  },
  {
    id: TableColor.BLACK,
    labelKey: 'tableColor.black.label',
    label: 'Black',
    descriptionKey: 'tableColor.black.description',
    description: 'Soft felt black',
  },
  {
    id: TableColor.PURPLE,
    labelKey: 'tableColor.purple.label',
    label: 'Casino Purple',
    descriptionKey: 'tableColor.purple.description',
    description: 'Deep muted purple',
  },
];

const TABLE_TEXTURES = [
  {
    id: TableTexture.FELT,
    labelKey: 'tableTexture.felt.label',
    label: 'Felt',
    descriptionKey: 'tableTexture.felt.description',
    description: 'Traditional felt texture',
  },
  {
    id: TableTexture.LEATHER,
    labelKey: 'tableTexture.leather.label',
    label: 'Leather',
    descriptionKey: 'tableTexture.leather.description',
    description: 'Leather table texture',
  },
  {
    id: TableTexture.SUEDE,
    labelKey: 'tableTexture.suede.label',
    label: 'Suede',
    descriptionKey: 'tableTexture.suede.description',
    description: 'Soft suede texture',
  },
  {
    id: TableTexture.FABRIC,
    labelKey: 'tableTexture.fabric.label',
    label: 'Fabric',
    descriptionKey: 'tableTexture.fabric.description',
    description: 'Woven fabric texture',
  },
  {
    id: TableTexture.DIGITAL,
    labelKey: 'tableTexture.digital.label',
    label: 'Digital',
    descriptionKey: 'tableTexture.digital.description',
    description: 'Digital table texture',
  },
];

interface ModalInstance {
  show(): void;
  hide(): void;
  handleUpdate(): void;
  dispose(): void;
}

interface ModalPlugin {
  getOrCreateInstance(element: HTMLElement): ModalInstance;
  getInstance(element: HTMLElement): ModalInstance | null;
}

function getBootstrapModal(): ModalPlugin | undefined {
  return (window as Window & { bootstrap?: { Modal?: ModalPlugin } }).bootstrap?.Modal;
}

interface SettingsScreenProps {
  open: boolean;
  onClose: () => void;
  selectedDeck: string;
  onDeckChange: (deckId: string) => void;
  selectedCardBack: string;
  onCardBackChange: (cardBack: string) => void;
  selectedTableColor: TableColor;
  onTableColorChange: (tableColor: TableColor) => void;
  selectedTableTexture: TableTexture;
  onTableTextureChange: (tableTexture: TableTexture) => void;
}

interface TooltipInstance {
  dispose(): void;
}

function cardBackIds(count: number): string[] {
  const firstBackCode = 'a'.charCodeAt(0);
  return Array.from({ length: count }, (_, index) => String.fromCharCode(firstBackCode + index));
}

export function SettingsScreen({
  open,
  onClose,
  selectedDeck,
  onDeckChange,
  selectedCardBack,
  onCardBackChange,
  selectedTableColor,
  onTableColorChange,
  selectedTableTexture,
  onTableTextureChange,
}: SettingsScreenProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const settingsOptionsRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [decks, setDecks] = useState<DeckCatalogEntry[]>([]);
  const [catalogError, setCatalogError] = useState(false);
  const selectedDeckDetails = decks.find((deck) => deck.id === selectedDeck);
  const availableCardBacks = cardBackIds(selectedDeckDetails?.backs ?? 0);

  useEffect(() => {
    const controller = new AbortController();
    loadDeckCatalog(controller.signal)
      .then(setDecks)
      .catch(() => {
        if (!controller.signal.aborted) setCatalogError(true);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (decks.length > 0 && !decks.some((deck) => deck.id === selectedDeck)) {
      onDeckChange(decks[0].id);
    }
  }, [decks, selectedDeck, onDeckChange]);

  useEffect(() => {
    if (selectedDeckDetails && !availableCardBacks.includes(selectedCardBack)) {
      onCardBackChange(DEFAULT_CARD_BACK);
    }
  }, [selectedDeckDetails, availableCardBacks, selectedCardBack, onCardBackChange]);

  useEffect(() => {
    const Tooltip = (window as Window & {
      bootstrap?: {
        Tooltip?: {
          getOrCreateInstance(element: HTMLElement, options: { container: string }): TooltipInstance;
        };
      };
    }).bootstrap?.Tooltip;
    if (!Tooltip || !settingsOptionsRef.current) return;
    const instances = Array.from(settingsOptionsRef.current.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]'))
      .map((element) => Tooltip.getOrCreateInstance(element, { container: 'body' }));
    return () => instances.forEach((instance) => instance.dispose());
  }, [decks, selectedDeck]);

  useEffect(() => {
    const element = modalRef.current;
    if (!element) return;
    const handleHide = () => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && element.contains(activeElement)) {
        const returnTarget = returnFocusRef.current;
        queueMicrotask(() => {
          if (returnTarget?.isConnected) returnTarget.focus();
          if (element.contains(document.activeElement)) activeElement.blur();
        });
      }
      onCloseRef.current();
    };
    element.addEventListener('hide.bs.modal', handleHide);
    return () => {
      element.removeEventListener('hide.bs.modal', handleHide);
      getBootstrapModal()?.getInstance(element)?.dispose();
    };
  }, []);

  useEffect(() => {
    const element = modalRef.current;
    const Modal = getBootstrapModal();
    if (!element || !Modal) return;
    const instance = Modal.getOrCreateInstance(element);
    if (open) {
      const activeElement = document.activeElement;
      returnFocusRef.current = activeElement instanceof HTMLElement
        && activeElement !== document.body
        && !element.contains(activeElement)
        ? activeElement
        : null;
      instance.show();
    }
    else instance.hide();
  }, [open]);

  useEffect(() => {
    if (open && decks.length > 0 && modalRef.current) {
      getBootstrapModal()?.getInstance(modalRef.current)?.handleUpdate();
    }
  }, [decks, open]);

  return (
    <div
      ref={modalRef}
      className='modal fade'
      tabIndex={-1}
      aria-hidden='true'
      aria-labelledby='settings-modal-title'
    >
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h2 className='modal-title fs-5' id='settings-modal-title'>
              {i18n.t('intro.settings', 'Settings')}
            </h2>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label={i18n.t('intro.close', 'Close')}
            />
          </div>
          <div ref={settingsOptionsRef} className='modal-body settings-modal-body'>
            <fieldset className='settings-deck-options mb-4'>
              <legend className='h5'>{i18n.t('settings.gameDeck', 'Game Deck')}</legend>
              {catalogError ? (
                <p role='alert'>{i18n.t('settings.deckLoadError', 'Unable to load card decks.')}</p>
              ) : decks.length === 0 ? (
                <p role='status'>{i18n.t('settings.deckLoading', 'Loading card decks…')}</p>
              ) : (
                <RadioImages
                  name='game-deck'
                  value={selectedDeck}
                  onChange={onDeckChange}
                  ariaLabel={i18n.t('settings.gameDeck', 'Game Deck')}
                  tableColor={TABLE_COLOR_HEX[selectedTableColor]}
                  tableTexture={TABLE_TEXTURE_PATH[selectedTableTexture]}
                  options={decks.map((deck) => ({
                    id: deck.id,
                    label: i18n.t(`deck.${deck.id}.label`, deck.label),
                    description: i18n.t(`deck.${deck.id}.description`, deck.description),
                    image: deckPreviewUrl(deck.id),
                  }))}
                />
              )}
            </fieldset>
            {selectedDeckDetails && (
              <fieldset className='settings-card-back-options mb-4'>
                <legend className='h5'>{i18n.t('settings.cardBack', 'Card Back')}</legend>
                <RadioCardBacks
                  name='card-back'
                  value={selectedCardBack}
                  onChange={onCardBackChange}
                  ariaLabel={i18n.t('settings.cardBack', 'Card Back')}
                  tableColor={TABLE_COLOR_HEX[selectedTableColor]}
                  tableTexture={TABLE_TEXTURE_PATH[selectedTableTexture]}
                  options={availableCardBacks.map((cardBack) => {
                    const label = i18n.tf(
                      'settings.cardBackChoice',
                      'Card back {0}',
                      cardBack.toUpperCase(),
                    );
                    return {
                      id: cardBack,
                      label,
                      image: deckBackUrl(selectedDeck, cardBack),
                    };
                  })}
                />
              </fieldset>
            )}
            <fieldset className='settings-table-color-options mb-4'>
              <legend className='h5'>{i18n.t('settings.tableColor', 'Table Color')}</legend>
              <RadioTableColor
                name='table-color'
                mode='color'
                value={selectedTableColor}
                onChange={onTableColorChange}
                ariaLabel={i18n.t('settings.tableColor', 'Table Color')}
                backgroundTexture={TABLE_TEXTURE_PATH[selectedTableTexture]}
                options={TABLE_COLORS.map((option) => ({
                  id: option.id,
                  label: i18n.t(option.labelKey, option.label),
                  description: i18n.t(option.descriptionKey, option.description),
                  preview: TABLE_COLOR_HEX[option.id],
                }))}
              />
            </fieldset>
            <fieldset className='settings-table-texture-options'>
              <legend className='h5'>{i18n.t('settings.tableTexture', 'Table Texture')}</legend>
              <RadioTableColor
                name='table-texture'
                mode='texture'
                value={selectedTableTexture}
                onChange={onTableTextureChange}
                ariaLabel={i18n.t('settings.tableTexture', 'Table Texture')}
                backgroundColor={TABLE_COLOR_HEX[selectedTableColor]}
                options={TABLE_TEXTURES.map((option) => ({
                  id: option.id,
                  label: i18n.t(option.labelKey, option.label),
                  description: i18n.t(option.descriptionKey, option.description),
                  preview: TABLE_TEXTURE_PATH[option.id],
                }))}
              />
            </fieldset>

            <hr />

            <div className='text-right'>
              <button
                type='button'
                className='btn btn-primary'
                data-bs-dismiss='modal'
              >
                <i className='fa-solid fa-check me-2' aria-hidden='true' />
                Ok
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
