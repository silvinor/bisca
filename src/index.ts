// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { registerRootComponent } from 'expo';

import '../scss/main.scss';
import App from './app';
import { loadRegistryResources } from './core/platform/registry-loader';

// Web-only; resolves to a no-op on iOS/Android (see registry-loader.ts vs .web.ts).
loadRegistryResources();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
