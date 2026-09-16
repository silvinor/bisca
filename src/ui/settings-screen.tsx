// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useRef, useState } from 'preact/hooks';
import { deckPreviewUrl, loadDeckCatalog, type DeckCatalogEntry } from '../core/deck-catalog';
import { i18n } from '../core/i18n';
import { RadioImages } from './radio-images';

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
}

interface TooltipInstance {
  dispose(): void;
}

export function SettingsScreen({ open, onClose, selectedDeck, onDeckChange }: SettingsScreenProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const deckOptionsRef = useRef<HTMLFieldSetElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [decks, setDecks] = useState<DeckCatalogEntry[]>([]);
  const [catalogError, setCatalogError] = useState(false);

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
    const Tooltip = (window as Window & {
      bootstrap?: {
        Tooltip?: {
          getOrCreateInstance(element: HTMLElement, options: { container: string }): TooltipInstance;
        };
      };
    }).bootstrap?.Tooltip;
    if (!Tooltip || !deckOptionsRef.current) return;
    const instances = Array.from(deckOptionsRef.current.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]'))
      .map((element) => Tooltip.getOrCreateInstance(element, { container: 'body' }));
    return () => instances.forEach((instance) => instance.dispose());
  }, [decks]);

  useEffect(() => {
    const element = modalRef.current;
    if (!element) return;
    const handleHide = () => onCloseRef.current();
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
    if (open) instance.show();
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
      <div className='modal-dialog modal-lg modal-xl modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down'>
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
          <div className='modal-body settings-modal-body'>
            <fieldset ref={deckOptionsRef} className='settings-deck-options'>
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
                  options={decks.map((deck) => ({
                    id: deck.id,
                    label: i18n.t(`deck.${deck.id}.label`, deck.label),
                    description: i18n.t(`deck.${deck.id}.dexription`, deck.description),
                    image: deckPreviewUrl(deck.id),
                  }))}
                />
              )}
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
