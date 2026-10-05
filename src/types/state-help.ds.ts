// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItFootnote from 'markdown-it-footnote';

/**
 * Markdown renderer for the help screen (GitHub-style Markdown).
 *
 * - `html`: help files are trusted local content and use inline HTML (card images).
 * - `linkify`: bare URLs become links, as on GitHub.
 * - footnotes (`[^1]`), heading ids (`#heading-text`) and `{.class #id}` attributes.
 */
const md = new MarkdownIt({ html: true, linkify: true })
  .use(markdownItFootnote)
  .use(markdownItAttrs)
  .use(markdownItAnchor);

export function renderHelpMarkdown(markdown: string): string {
  return md.render(markdown);
}
