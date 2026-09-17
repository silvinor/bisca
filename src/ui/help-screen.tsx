// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useRef, useState } from 'preact/hooks';
import { i18n } from '../core/i18n';

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

async function loadHelpMarkdown(signal: AbortSignal): Promise<string> {
  const language = i18n.language.toLowerCase().split('-')[0];
  const baseUrl = import.meta.env.BASE_URL;
  const options = { signal, headers: { Accept: 'text/plain' } };
  const localized = await fetch(`${baseUrl}help.${language}.md`, options);
  if (localized.ok) return localized.text();
  if (localized.status !== 404) throw new Error(`Localized help request failed: ${localized.status}`);

  const fallback = await fetch(`${baseUrl}help.md`, options);
  if (!fallback.ok) throw new Error(`Help request failed: ${fallback.status}`);
  return fallback.text();
}

function extractHelpHeading(markdown: string): { title: string | null; body: string } {
  const lines = markdown.split(/\r?\n/);
  for (let index = 0; index < Math.min(5, lines.length); index += 1) {
    const line = lines[index].replace(/^\uFEFF/, '');
    const heading = /^#(?!#)[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/.exec(line);
    if (!heading) continue;
    const title = heading[1].trim();
    if (!title) continue;
    lines.splice(index, 1);
    return { title, body: lines.join('\n') };
  }
  return { title: null, body: markdown };
}

interface HelpScreenProps {
  open: boolean;
  onClose: () => void;
}

export function HelpScreen({ open, onClose }: HelpScreenProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [helpHtml, setHelpHtml] = useState<string | null>(null);
  const [helpHeading, setHelpHeading] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setHelpHtml(null);
    setHelpHeading(null);
    setLoadError(false);

    const loadHelp = async () => {
      const [markdown, { renderHelpMarkdown }] = await Promise.all([
        loadHelpMarkdown(controller.signal),
        import('./help-markdown'),
      ]);
      const { title, body } = extractHelpHeading(markdown);
      const html = renderHelpMarkdown(body);
      if (!controller.signal.aborted) {
        setHelpHeading(title);
        setHelpHtml(html);
      }
    };

    loadHelp().catch(() => {
      if (!controller.signal.aborted) setLoadError(true);
    });
    return () => controller.abort();
  }, [open]);

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
    if (open && modalRef.current) {
      getBootstrapModal()?.getInstance(modalRef.current)?.handleUpdate();
    }
  }, [open, helpHtml, helpHeading, loadError]);

  return (
    <div
      ref={modalRef}
      className='modal fade'
      tabIndex={-1}
      aria-hidden='true'
      aria-labelledby='help-modal-title'
    >
      <div className='modal-dialog modal-xl modal-fullscreen-md-down modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h2 className='modal-title fs-5' id='help-modal-title'>
              {helpHeading ?? i18n.t('intro.help', 'Help')}
            </h2>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label={i18n.t('intro.close', 'Close')}
            />
          </div>
          <div className='modal-body help-modal-body'>
            {loadError ? (
              <p role='alert'>{i18n.t('help.loadError', 'Unable to load help.')}</p>
            ) : helpHtml === null ? (
              <p role='status'>{i18n.t('help.loading', 'Loading help…')}</p>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: helpHtml }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
