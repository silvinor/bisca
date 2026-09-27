// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

/** Finds a same-origin stylesheet rule by selector text (e.g. ".bg-green"), skipping any cross-origin sheet whose rules aren't readable. */
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
