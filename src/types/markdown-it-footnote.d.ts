// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

declare module 'markdown-it-footnote' {
  import type MarkdownIt from 'markdown-it';

  const markdownItFootnote: (md: MarkdownIt) => void;
  export default markdownItFootnote;
}
