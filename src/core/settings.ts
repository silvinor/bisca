// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * App specific settings and runtime resources.
 */

interface ResourceSettings {
  css?: string | string[];
  js?: string | string[];
}

interface FaviconSettings {
  ico?: string;
  svg?: string;
  png?: string;
}

const libraries = [
  "bootstrap",
  "fontawesome",
  "fonts",
  "animejs",
  "boardgameio"
] as const;

type LibraryName = typeof libraries[number];
type AppSettings = Partial<Record<LibraryName, ResourceSettings>> & {
  favicon?: FaviconSettings;
};

class Settings {
  private settings: AppSettings | null = null;
  private isLoaded = false;
  private libraryReady: Partial<Record<LibraryName, boolean>> = {};
  private loadPromise: Promise<void> | null = null;

  init(): Promise<void> {
    this.loadPromise ??= this.load();
    return this.loadPromise;
  }

  private async load(): Promise<void> {
    const response = await fetch("/assets/settings.json");
    if (!response.ok) {
      throw new Error(`[Settings] Failed to load settings: ${response.status}`);
    }

    this.settings = await response.json() as AppSettings;
    await this.injectResources();
    this.isLoaded = true;
  }

  private toArray(value?: string | string[]): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  private async injectResources(): Promise<void> {
    if (!this.settings) return;

    this.injectFavicons(this.settings.favicon);

    // Libraries are independent, but each library's JavaScript URLs run in order.
    await Promise.all(libraries.map(async (name) => {
      const resource = this.settings?.[name];
      const cssUrls = this.toArray(resource?.css);
      const jsUrls = this.toArray(resource?.js);
      const cssLoaded = await Promise.all(cssUrls.map((href) => this.injectCSS(href)));

      let jsLoaded = true;
      for (const src of jsUrls) {
        const loaded = await this.injectJS(src);
        jsLoaded = loaded && jsLoaded;
      }

      this.libraryReady[name] = cssUrls.length + jsUrls.length > 0
        && cssLoaded.every(Boolean)
        && jsLoaded;
    }));

    for (let n = 1; document.getElementById(`delete-${n}`); n++) {
      document.getElementById(`delete-${n}`)!.remove();
    }
  }

  private injectFavicons(favicon?: FaviconSettings): void {
    if (!favicon) return;

    if (favicon.ico) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = favicon.ico;
      link.type = "image/x-icon";
      document.head.appendChild(link);
    }

    if (favicon.svg) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = favicon.svg;
      link.type = "image/svg+xml";
      document.head.appendChild(link);
    }

    if (favicon.png) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = favicon.png;
      link.type = "image/png";
      document.head.appendChild(link);
    }
  }

  private injectCSS(href: string): Promise<boolean> {
    return new Promise((resolve) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve(true);
      link.onerror = () => {
        console.error(`[Settings] Failed to load CSS: ${href}`);
        resolve(false);
      };
      document.head.appendChild(link);
    });
  }

  private injectJS(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error(`[Settings] Failed to load JavaScript: ${src}`);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  get<K extends keyof AppSettings>(key: K): AppSettings[K] | undefined {
    return this.settings?.[key];
  }

  get loaded(): boolean {
    return this.isLoaded;
  }

  /** Reports whether every configured resource for a library loaded. */
  isReady(name: LibraryName): boolean {
    return this.libraryReady[name] === true;
  }
}

export const settings = new Settings();
