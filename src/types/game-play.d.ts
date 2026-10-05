// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

type BoardgameClientFactory = typeof import('boardgame.io/client').Client;

declare global {
  interface Window {
    BoardgameIO?: {
      Client: BoardgameClientFactory;
    };
  }
}

export {};
