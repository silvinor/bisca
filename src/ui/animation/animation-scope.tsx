// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import type { ComponentChildren, JSX, RefObject } from 'preact';
import { useCallback, useLayoutEffect, useRef } from 'preact/hooks';
import {
  ANIMATION_REDUCED_MOTION_MEDIA_QUERY,
  ANIMATION_REDUCED_MOTION_SCOPE_KEY,
} from '../../core/constants';
import { createScope, isAnimeJsAvailable, type Scope } from './anime';

export type AnimationScopeSetup<T extends HTMLElement = HTMLElement> = (
  scope: Scope,
  root: T,
) => void | (() => void);

export type AnimationScopeRunner<T extends HTMLElement = HTMLElement> = <Result>(
  callback: (scope: Scope, root: T) => Result,
) => Result | undefined;

export interface AnimationScopeHandle<T extends HTMLElement> {
  rootRef: RefObject<T>;
  scopeRef: RefObject<Scope>;
  /** Runs event-triggered animation work inside the scope so unmounting can revert it. */
  run: AnimationScopeRunner<T>;
}

export function animationScopePrefersReducedMotion(scope: Scope): boolean {
  return scope.matches[ANIMATION_REDUCED_MOTION_SCOPE_KEY] ?? false;
}

export function useAnimationScope<T extends HTMLElement>(
  setup: AnimationScopeSetup<T>,
  dependencies: readonly unknown[] = [],
): AnimationScopeHandle<T> {
  const rootRef = useRef<T>(null);
  const scopeRef = useRef<Scope>(null);
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !isAnimeJsAvailable()) return;

    const scope = createScope({
      root,
      mediaQueries: {
        [ANIMATION_REDUCED_MOTION_SCOPE_KEY]: ANIMATION_REDUCED_MOTION_MEDIA_QUERY,
      },
    });
    scopeRef.current = scope;
    scope.add(() => setupRef.current(scope, root));

    return () => {
      scope.revert();
      scopeRef.current = null;
    };
  }, dependencies);

  const run = useCallback(function runInAnimationScope<Result>(
    callback: (scope: Scope, root: T) => Result,
  ): Result | undefined {
    const scope = scopeRef.current;
    const root = rootRef.current;
    if (!scope || !root) return undefined;
    return scope.execute(() => callback(scope, root));
  }, []);

  return { rootRef, scopeRef, run };
}

export interface AnimationScopeProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'ref'> {
  children?: ComponentChildren;
  setup: AnimationScopeSetup<HTMLDivElement>;
  dependencies?: readonly unknown[];
}

export function AnimationScope({
  children,
  setup,
  dependencies = [],
  ...attributes
}: AnimationScopeProps) {
  const { rootRef } = useAnimationScope(setup, dependencies);

  return (
    <div {...attributes} ref={rootRef}>
      {children}
    </div>
  );
}
