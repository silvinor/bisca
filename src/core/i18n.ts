// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * Handle multi language UI output
 */

import { addTrailingSlash } from "./f";
import { APP_LANGUAGE_PATH } from "./constants";

type Translations = Record<string, string>;

class I18n {
  private translations: Translations = {};
  private currentLanguage: string = "en";
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadBrowserLanguage();
    return this.loadPromise;
  }

  private async loadBrowserLanguage(): Promise<void> {
    const browserLang = navigator.language.toLowerCase();

    // Try exact match first (e.g., pt-br)
    if (await this.tryLoadLanguage(browserLang)) {
      return;
    }

    // Try root language (e.g., pt)
    const rootLang = browserLang.split("-")[0];
    if (rootLang !== browserLang && (await this.tryLoadLanguage(rootLang))) {
      return;
    }

    // Fallback to default (en)
    await this.tryLoadLanguage("en");
  }

  private async tryLoadLanguage(lang: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${addTrailingSlash(APP_LANGUAGE_PATH)}${lang}.json`,
      );
      if (!response.ok) {
        return false;
      }
      this.translations = await response.json();
      this.currentLanguage = lang;
      this.isLoaded = true;
      document.documentElement.lang = lang;
      return true;
    } catch {
      return false;
    }
  }

  t(key: string, fallback?: string): string {
    return this.translations[key] ?? fallback ?? key;
  }

  tf(key: string, fallback: string, ...args: string[]): string {
    const template = this.translations[key] ?? fallback;
    return template.replace(/{(\d+)}/g, (match, index) => args[index] ?? match);
  }

  get language(): string {
    return this.currentLanguage;
  }

  get loaded(): boolean {
    return this.isLoaded;
  }
}

export const i18n = new I18n();
