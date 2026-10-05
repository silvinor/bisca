// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

/** Finds a same-origin stylesheet rule by selector text (e.g. ".bg-green"), 
 * skipping any cross-origin sheet whose rules aren't readable.
 */
function findCssRuleText(selector: string): string | null {
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText === selector) return rule.cssText;
    }
  }
  return null;
}

/**
 * Clones a matching rule (scss/app.scss) into a generic class, so the rest
 * of the app can style the active selection by that one fixed class name
 * instead of branching on its value. Reuses the same <style> element (by
 * `styleId`) across calls, so repeat calls replace rather than pile up.
 */
function applyDynamicClass(styleId: string, sourceSelector: string, targetSelector: string): void {
  const sourceRuleText = findCssRuleText(sourceSelector);
  if (!sourceRuleText) return;

  let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = sourceRuleText.replace(sourceSelector, targetSelector);
}

/** Clones the matching ".bg-<color>" rule into ".bg-color" (see applyDynamicClass). */
export function applyTableColorClass(color: string): void {
  applyDynamicClass('app-dynamic-table-color', `.bg-${color}`, '.bg-color');
}

/** Clones the matching ".bg-<texture>" rule into ".bg-texture" (see applyDynamicClass). */
export function applyTableTextureClass(texture: string): void {
  applyDynamicClass('app-dynamic-table-texture', `.bg-${texture}`, '.bg-texture');
}

/** Sets the card height for the current playing surface. */
export function applyPlayingCardHeight(height: number): void {
  let styleElement = document.getElementById('app-dynamic-playing-card') as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'app-dynamic-playing-card';
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = `.playing-card { height: ${Math.round(height * 1000) / 1000}px }`;
}

/** Stores the normalized deck class currently applied to the body so a deck change can remove it. */
let bodyDeckClass: string | null = null;

/** Replaces the deck class on the body with a valid CSS class derived from the selected deck name. */
export function applyGameDeckClass(deck: string): void {
  // Remove the previous deck class before applying the new selection.
  if (bodyDeckClass !== null) document.body.classList.remove(bodyDeckClass);

  // Replace invalid characters and guard names that cannot start a CSS identifier.
  const deckClass = 'deck-' + (deck.trim().replace(/[^a-zA-Z0-9_-]+/g, '-'));
  
  // Apply and remember the exact normalized class for the next deck change.
  document.body.classList.add(deckClass);
  bodyDeckClass = deckClass;
};
