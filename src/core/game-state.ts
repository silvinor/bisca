// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

/** Shared lifecycle for the main loop and its individual state engines. */
export abstract class GameState<State> {
  protected currentState: State;
  private running = false;
  private stopped: Promise<void> = Promise.resolve();
  private resolveStopped: (() => void) | null = null;

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
    this.stopped = new Promise((resolve) => {
      this.resolveStopped = resolve;
    });
    this.running = true;
    this.init();
  }

  public async step(): Promise<State> {
    if (!this.running) return this.currentState;
    this.currentState = await this.tick(this.currentState);
    if (this.running) await this.stopped;
    return this.currentState;
  }

  public render(): void {
    if (this.running) this.draw(this.currentState);
  }

  public async frame(): Promise<void> {
    if (!this.running) return;
    this.render();
    await this.step();
  }

  public stop(): void {
    if (!this.running) return;
    this.running = false;
    this.resolveStopped?.();
    this.resolveStopped = null;
    this.end();
  }

  protected abstract init(): void;
  protected abstract tick(lastState: State): State | Promise<State>;
  protected abstract draw(currentState: State): void;
  protected abstract end(): void;
}
