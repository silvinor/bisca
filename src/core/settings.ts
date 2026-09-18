// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier:
/**
 * App specific settings
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

interface AppSettings {
  bootstrap?: ResourceSettings;
  fontawesome?: ResourceSettings;
  animejs?: ResourceSettings;
  favicon?: FaviconSettings;
}

class Settings {
  private settings: AppSettings | null = null;
  private isLoaded: boolean = false;
  private isBootstrapReady: boolean = false;
  private isAnimeReady: boolean = false;
  private loadPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.load();
    return this.loadPromise;
  }

  private async load(): Promise<void> {
    const response = await fetch("/registry/settings.json");
    this.settings = await response.json();
    this.isLoaded = true;
    await this.injectResources();
  }

  private toArray(value?: string | string[]): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  /** Injects configured assets and resolves after ordered Bootstrap dependencies settle. */
  private async injectResources(): Promise<void> {
    if (!this.settings) return;

    // Clean up temporary DOM items
    for (let n = 1; document.getElementById(`delete-${n}`); n++) {
      document.getElementById(`delete-${n}`)!.remove();
    }

    // Inject Bootstrap CSS
    this.toArray(this.settings.bootstrap?.css).forEach((src, i) =>
      this.injectCSS(src, `bootstrap-${i + 1}`),
    );

    // Load Bootstrap dependencies in configured order so Popper executes before Bootstrap.
    const bootstrapJsUrls = this.toArray(this.settings.bootstrap?.js);
    let bootstrapDependenciesLoaded = bootstrapJsUrls.length > 0;
    for (const src of bootstrapJsUrls) {
      const loaded = await new Promise<boolean>((resolve) => {
        this.injectJS(
          src,
          () => resolve(true),
          () => {
            console.error(
              `[Settings] Failed to load Bootstrap dependency: ${src}`,
            );
            resolve(false);
          },
        );
      });
      bootstrapDependenciesLoaded &&= loaded;
    }
    const bootstrap = (window as Window & {
      bootstrap?: { Dropdown?: unknown };
    }).bootstrap;
    this.isBootstrapReady =
      bootstrapDependenciesLoaded && Boolean(bootstrap?.Dropdown);

    // Load Anime.js before Preact renders so its UMD API is available through window.anime.
    const animeJsUrls = this.toArray(this.settings.animejs?.js);
    let animeDependenciesLoaded = animeJsUrls.length > 0;
    for (const src of animeJsUrls) {
      const loaded = await new Promise<boolean>((resolve) => {
        this.injectJS(
          src,
          () => resolve(true),
          () => {
            console.error(`[Settings] Failed to load Anime.js dependency: ${src}`);
            resolve(false);
          },
        );
      });
      animeDependenciesLoaded &&= loaded;
    }
    const anime = (window as Window & {
      anime?: { createScope?: unknown; createTimeline?: unknown };
    }).anime;
    this.isAnimeReady = animeDependenciesLoaded
      && typeof anime?.createScope === 'function'
      && typeof anime?.createTimeline === 'function';

    // Inject Fontawesome
    this.toArray(this.settings.fontawesome?.css).forEach((src, i) =>
      this.injectCSS(src, `fontawesome-${i + 1}`),
    );
    this.toArray(this.settings.fontawesome?.js).forEach((src) =>
      this.injectJS(src),
    );

    // Inject Favicons
    this.injectFavicons();
  }

  private injectFavicons() {
    const favicon = this.settings?.favicon;
    if (!favicon) return;

    if (favicon.ico) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = favicon.ico;
      link.setAttribute("sizes", "any");
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
      link.setAttribute("sizes", "192x192");
      document.head.appendChild(link);
    }
  }

  private injectCSS(href: string, id?: string) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    if (id) link.id = id;
    document.head.appendChild(link);
  }

  private injectJS(
    src: string,
    onload?: () => void,
    onerror?: () => void,
  ) {
    const script = document.createElement("script");
    script.src = src;
    if (onload) script.onload = onload;
    if (onerror) script.onerror = onerror;
    document.body.appendChild(script);
  }

  get<K extends keyof AppSettings>(key: K): AppSettings[K] | undefined {
    return this.settings?.[key];
  }

  get loaded(): boolean {
    return this.isLoaded;
  }

  /** Reports whether every configured Bootstrap dependency loaded and its dropdown API is available. */
  get bootstrapReady(): boolean {
    return this.isBootstrapReady;
  }

  /** Reports whether every configured Anime.js dependency loaded and its core API is available. */
  get animeReady(): boolean {
    return this.isAnimeReady;
  }
}

export const settings = new Settings();
