// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

/**
 * Shared lifecycle for the main loop and its individual state engines.
 *
 * `TriggerPayload` is whatever an event handler hands to `trigger()` for this
 * node (`void` for a state with no payload, e.g. a plain "continue" click).
 * `tick()` reads the latest one off `this.lastTrigger`; it does not await it.
 */
export abstract class GameState<State, TriggerPayload = void> {
  protected currentState: State;
  protected lastTrigger: TriggerPayload | undefined;
  /** True for exactly the one tick() pass right after trigger() fired (needed
   * because a `void` payload is `undefined` both before and after a trigger,
   * so `lastTrigger` alone cannot tell "triggered" apart from "not yet"). */
  protected triggered = false;
  private running = false;
  private resolveTrigger: (() => void) | null = null;

  protected constructor(initialState: State) {
    this.currentState = initialState;
  }

  public get state(): State {
    return this.currentState;
  }

  public get finished(): boolean {
    return !this.running;
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.init();
  }

  public async step(): Promise<State> {
    if (!this.running) return this.currentState;
    // Runs the documented cycle in place: tick (non-UI work), then draw (DOM
    // work), then block for the next trigger. This repeats until tick()
    // reports a different state, which is the signal that this node is done
    // and control should return to the caller.
    while (this.running) {
      const before = this.currentState;
      this.currentState = await this.tick(before);
      // Each trigger is consumed by exactly one tick() pass.
      this.lastTrigger = undefined;
      this.triggered = false;
      this.render();
      if (!this.running || this.currentState !== before) break;
      await this.waitForTrigger();
    }
    return this.currentState;
  }

  public render(): void {
    if (this.running) this.draw(this.currentState);
  }

  public async frame(): Promise<void> {
    if (!this.running) return;
    await this.step();
  }

  public stop(): void {
    if (!this.running) return;
    this.running = false;
    this.end();
    // Release a pending wait so an externally-stopped step() (e.g. an
    // overlay opening over whatever was running) settles instead of leaving
    // its caller awaiting a promise that would otherwise never resolve.
    this.resolveTrigger?.();
    this.resolveTrigger = null;
  }

  /**
   * The well-known call: any event handler wired to this node calls this to
   * hand tick() its payload and let the loop cycle over.
   */
  public trigger(payload: TriggerPayload): void {
    this.lastTrigger = payload;
    this.triggered = true;
    this.resolveTrigger?.();
    this.resolveTrigger = null;
  }

  private waitForTrigger(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveTrigger = resolve;
    });
  }

  protected abstract init(): void;
  protected abstract tick(lastState: State): State | Promise<State>;
  protected abstract draw(currentState: State): void;
  protected abstract end(): void;
}
