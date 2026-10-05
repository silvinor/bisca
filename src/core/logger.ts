// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

type LogFn = (...args: unknown[]) => void;

const noop: LogFn = () => {};

const logFn = console.log.bind(console);
const infoFn = console.info.bind(console);
const warnFn = console.warn.bind(console);
const debugFn = console.debug.bind(console);
const errorFn = console.error.bind(console);

const dbg = () => typeof window !== 'undefined' && window.isDebug === true;

export const logger = {
  get log(): LogFn {
    return dbg() ? logFn : noop;
  },
  get info(): LogFn {
    return dbg() ? infoFn : noop;
  },
  get warn(): LogFn {
    return dbg() ? warnFn : noop;
  },
  get debug(): LogFn {
    return dbg() ? debugFn : noop;
  },
  get error(): LogFn {
    return errorFn;
  },
};
