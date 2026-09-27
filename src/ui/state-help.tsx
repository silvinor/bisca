// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { useEffect, useState } from 'preact/hooks';
import { APP_HELP_PATH } from '../core/constants';
import { i18n } from '../core/i18n';
import { closeClick } from '../core/reactions';
import { renderHelpMarkdown } from '../types/state-help.ds';

async function loadHelpMarkdown(signal: AbortSignal): Promise<string> {
  const language = i18n.language.toLowerCase().split('-')[0];
  const options = { signal, headers: { Accept: 'text/plain' } };

  // Try the current UI language first; fall back to English if untranslated.
  const localized = await fetch(`${APP_HELP_PATH}.${language}.md`, options);
  if (localized.ok) return localized.text();
  if (language === 'en') throw new Error(`Help request failed: ${localized.status}`);

  const fallback = await fetch(`${APP_HELP_PATH}.en.md`, options);
  if (!fallback.ok) throw new Error(`Help request failed: ${fallback.status}`);
  return fallback.text();
}

/** Pulls a leading "# Title" line out of the markdown to use as the modal title. */
function extractHelpHeading(markdown: string): { title: string | null; body: string } {
  const lines = markdown.split(/\r?\n/);
  for (let index = 0; index < Math.min(5, lines.length); index += 1) {
    const line = lines[index].replace(/^﻿/, '');
    const heading = /^#(?!#)[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/.exec(line);
    if (!heading) continue;
    const title = heading[1].trim();
    if (!title) continue;
    lines.splice(index, 1);
    return { title, body: lines.join('\n') };
  }
  return { title: null, body: markdown };
}

export function StateHelp() {
  const [helpHtml, setHelpHtml] = useState<string | null>(null);
  const [helpTitle, setHelpTitle] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    loadHelpMarkdown(controller.signal)
      .then((markdown) => {
        if (controller.signal.aborted) return;
        const { title, body } = extractHelpHeading(markdown);
        setHelpTitle(title);
        setHelpHtml(renderHelpMarkdown(body));
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      {/* Sibling of .modal, not nested inside it: the backdrop's explicit
          z-index would otherwise paint over .modal-dialog, which has none. */}
      <div className='modal-backdrop show' />
      <div className='modal d-block' tabIndex={-1} role='dialog' aria-modal='true' aria-labelledby='help-title'>
        <div className='modal-dialog modal-xl modal-fullscreen-md-down modal-dialog-scrollable modal-dialog-centered'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h1 id='help-title' className='modal-title fs-5'>
                {helpTitle ?? i18n.t('state-help:title')}
              </h1>
              <button
                type='button'
                className='btn-close'
                aria-label={i18n.t('app:close')}
                onClick={closeClick}
              />
            </div>
            <div className='modal-body help-modal-body'>
              {loadError ? (
                <p role='alert'>{i18n.t('state-help:load-error')}</p>
              ) : helpHtml === null ? (
                <p role='status'>{i18n.t('state-help:loading')}</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: helpHtml }} />
              )}
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' onClick={closeClick}>
                <i class="fa-solid me-1">&#120;</i>
                {i18n.t('app:close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
