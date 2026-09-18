// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type {
  AnimationParams,
  ScopeParams,
  TargetsParam,
  TimelineParams,
} from 'animejs';
import type { JSAnimation } from 'animejs/animation';
import type { Scope } from 'animejs/scope';
import type { Timeline } from 'animejs/timeline';

export type AnimeJsGlobal = typeof import('animejs');

declare global {
  interface Window {
    anime?: AnimeJsGlobal;
  }
}

export function getAnimeJs(): AnimeJsGlobal | undefined {
  return typeof window === 'undefined' ? undefined : window.anime;
}

export function isAnimeJsAvailable(): boolean {
  const anime = getAnimeJs();
  return typeof anime?.animate === 'function'
    && typeof anime.createScope === 'function'
    && typeof anime.createTimeline === 'function';
}

function requireAnimeJs(): AnimeJsGlobal {
  const anime = getAnimeJs();
  if (!anime) throw new Error('Anime.js has not been loaded from the configured CDN.');
  return anime;
}

export function animate(targets: TargetsParam, parameters: AnimationParams): JSAnimation {
  return requireAnimeJs().animate(targets, parameters);
}

export function createScope(parameters?: ScopeParams): Scope {
  return requireAnimeJs().createScope(parameters);
}

export function createTimeline(parameters?: TimelineParams): Timeline {
  return requireAnimeJs().createTimeline(parameters);
}

export type {
  AnimationParams,
  JSAnimation,
  Scope,
  TargetsParam,
  Timeline,
  TimelineParams,
};
