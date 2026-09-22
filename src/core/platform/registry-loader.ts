// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

// Native (iOS/Android) fallback: there is no DOM to inject <link>/<script> tags
// into, and the registry is a web-hosting concern only. See registry-loader.web.ts
// for the real implementation, which Metro selects automatically on web.
export function loadRegistryResources(): void {}
