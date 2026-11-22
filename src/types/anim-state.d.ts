// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

export const ANIM_STATE_NOTHING = 'nothing';
export const ANIM_STATE_DECK_JOIN = 'deckJoin';
export const ANIM_STATE_DECK_FAN = 'deckFan';

export type AnimationState =
  | typeof ANIM_STATE_NOTHING
  | typeof ANIM_STATE_DECK_JOIN
  | typeof ANIM_STATE_DECK_FAN;

export const DEFAULT_ANIMATION_STATE = ANIM_STATE_NOTHING;
