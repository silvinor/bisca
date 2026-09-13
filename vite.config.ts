// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * https://vite.dev/config/
 */

import preact from '@preact/preset-vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // const isProduction = mode === "production";
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      host: env.DEV_HOST || "localhost",
      port: 8080,
    },
    plugins: [preact()],
  }
});
