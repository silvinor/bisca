// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

// Web-only: fetches public/registry/settings.json at app startup and applies
// what it lists — CSS/favicon <link>s into <head>, <script>s at the end of
// <body> — matching where Expo puts its own equivalents. The host can edit
// that JSON without a rebuild, so this must run at runtime rather than being
// bundled in.
//
// Each top-level entry is one of:
//  - a resource entry: a `css` and/or `js` value, each a single URL string or
//    an array of URLs. Any other key on the entry (e.g. the `__css`/`__js`/
//    `_comment` keys used in settings.json as schema examples) is ignored.
//  - the `favicon` entry: maps an icon file extension (`ico`, `svg`, `png`,
//    `gif`) to its URL. When present, it replaces any favicon <link> already
//    in the page (e.g. the static ones in public/index.html).
//
// Once the load attempt is done (whether or not everything — or anything —
// actually loaded), the #anti-fouc <style> from public/index.html is removed,
// since its only job is to hold a sane background/text color until real
// theming has had its chance to load.
type RegistryEntry = Record<string, unknown>;

type FaviconEntry = Record<string, unknown>;

type RegistrySettings = Record<string, RegistryEntry>;

const DEFAULT_REGISTRY_URL = '/registry/settings.json';

const FAVICON_MIME_TYPES: Record<string, string> = {
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  png: 'image/png',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// The app's own compiled CSS (from scss/main.scss, via Metro): a <link> in
// production exports, an inline <style data-expo-css-hmr> in dev. It's always
// imported before this module runs (see index.ts), so it's already in <head>
// by the time we get here. Registry stylesheets are inserted right before it,
// so the app's own CSS stays later in the cascade and wins any specificity
// ties against third-party CSS the registry pulls in (e.g. bootstrap).
function getExpoCssAnchor(): Element | null {
  return document.head.querySelector('style[data-expo-css-hmr], link[rel="stylesheet"]:not([data-registry-src])');
}

function loadStylesheet(href: string): Promise<void> {
  if (document.querySelector(`link[data-registry-src="${href}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.registrySrc = href;
    // Resolve either way — a bad stylesheet shouldn't hang startup.
    link.onload = () => resolve();
    link.onerror = () => {
      console.warn(`[registry] failed to load stylesheet: ${href}`);
      resolve();
    };
    document.head.insertBefore(link, getExpoCssAnchor());
  });
}

// Expo places its own bundle's <script> at the end of <body> (with `defer`),
// not in <head> — the standard place for a page's executable scripts, since
// <head> is for metadata/resource hints. Registry scripts follow the same
// convention and land after Expo's own bundle script, since that script is
// already on the page (it's the one currently running this code) by the time
// loadRegistryResources() is called.
function loadScript(src: string): Promise<void> {
  if (document.querySelector(`script[data-registry-src="${src}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // preserve declared order between dependent scripts
    script.dataset.registrySrc = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

function applyFavicons(favicon: FaviconEntry | undefined): void {
  if (!favicon) return;

  const links = Object.entries(FAVICON_MIME_TYPES)
    .filter(([ext]) => typeof favicon[ext] === 'string' && favicon[ext])
    .map(([ext, mimeType]) => {
      const href = favicon[ext] as string;
      const link = document.createElement('link');
      link.rel = ext === 'ico' ? 'shortcut icon' : 'icon';
      link.type = mimeType;
      link.href = href;
      link.dataset.registrySrc = href;
      return link;
    });

  if (links.length === 0) return;

  // The registry is the source of truth once it declares a favicon: drop any
  // static <link rel="icon"|"shortcut icon"> already in the page first.
  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((el) => el.remove());
  links.forEach((link) => document.head.appendChild(link));
}

function removeAntiFouc(): void {
  document.getElementById('anti-fouc')?.remove();
}

export async function loadRegistryResources(url: string = DEFAULT_REGISTRY_URL): Promise<void> {
  try {
    let settings: RegistrySettings;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      settings = await response.json();
    } catch (error) {
      console.warn(`[registry] could not load ${url}`, error);
      return;
    }

    applyFavicons(settings.favicon as FaviconEntry | undefined);

    const entries = Object.values(settings);

    await Promise.all(
      entries.flatMap((entry) => toArray(entry?.css as string | string[] | undefined).map(loadStylesheet))
    );

    for (const entry of entries) {
      for (const src of toArray(entry?.js as string | string[] | undefined)) {
        try {
          await loadScript(src);
        } catch (error) {
          console.warn('[registry]', error);
        }
      }
    }
  } finally {
    // Whatever happened above — success, partial failure, or no registry at
    // all — the load attempt is over, so the anti-FOUC placeholder can go.
    removeAntiFouc();
  }
}
