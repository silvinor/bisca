// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

export {
  animate,
  createTimeline,
  getAnimeJs,
  isAnimeJsAvailable,
} from './anime';
export type {
  AnimeJsGlobal,
  AnimationParams,
  JSAnimation,
  Scope,
  TargetsParam,
  Timeline,
  TimelineParams,
} from './anime';
export type { TimelinePosition } from 'animejs';

export {
  AnimationScope,
  animationScopePrefersReducedMotion,
  useAnimationScope,
} from './animation-scope';
export type {
  AnimationScopeHandle,
  AnimationScopeProps,
  AnimationScopeRunner,
  AnimationScopeSetup,
} from './animation-scope';
