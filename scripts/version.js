#!/usr/bin/env node

// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * Build script to generate version info file `version.ts`
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputPath = join(rootDir, 'src', 'core', 'version.ts');
const packageJsonPath = join(rootDir, 'package.json');

const now = new Date();
const year = String(now.getFullYear());
const yy = String(now.getFullYear() - 2000);
const m = String(now.getMonth() + 1);
const d = String(now.getDate());
const version = `${yy}.${m}.${d}`;

function toLocalIso(date) {
  const pad = (n) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const ms = String(date.getMilliseconds()).padStart(3, "0");

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const offsetH = pad(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetM = pad(Math.abs(offsetMinutes) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${sign}${offsetH}:${offsetM}`;
}

const time = toLocalIso(now);

let build = '0';
let commit = '';
let hash = '';
let commitUrl = '';
try {
  build = execSync('git rev-list --count HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
  commit = execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
  hash = commit.slice(0, 7);

  const remoteUrl = execSync('git config --get remote.origin.url', {
    cwd: rootDir,
    encoding: 'utf8',
  }).trim();
  const normalizedRepoUrl = remoteUrl
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/^ssh:\/\/git@github\.com\//, 'https://github.com/')
    .replace(/\.git$/, '');
  if (normalizedRepoUrl.startsWith('http://') || normalizedRepoUrl.startsWith('https://')) {
    commitUrl = `${normalizedRepoUrl}/commit/`;
  }
} catch {
  // Keep defaults if git metadata is unavailable in this environment.
}

const outputLines = [
  '/**',
  '  ▄▖▌ ▘    ▐▘▘▜     ▘',
  '  ▐ ▛▌▌▛▘  ▜▘▌▐ █▌  ▌▛▘',
  '  ▐ ▌▌▌▄▌  ▐ ▌▐▖▙▖  ▌▄▌',
  '',
  '               ▗    ▌',
  '   ▛▌█▌▛▌█▌▛▘▀▌▜▘█▌▛▌',
  '   ▙▌▙▖▌▌▙▖▌ █▌▐▖▙▖▙▌',
  '   ▄▌',
  '',
  '      Do not edit.',
  '     Do not commit.',
  ' */',
  `export const APP_YEAR = "${year}";`,
  `export const APP_VERSION = "${version}";`,
  `export const APP_BUILD = "${build}";`,
  `export const APP_COMMIT = "${commit}";`,
  `export const APP_HASH = "${hash}";`,
  `export const APP_COMMIT_URL = "${commitUrl.replace(/'/g, "\\'")}";`,
  `export const APP_BUILD_TIME = "${time}";`,
];
const output = `${outputLines.join('\n')}\n`;
writeFileSync(outputPath, output, 'utf8');

console.log(
  `⌘ Generated \x1b[32mversion.ts\x1b[0m with version \x1b[34m${version}\x1b[0m, build \x1b[34m${build}\x1b[0m, hash \x1b[34m${hash}\x1b[0m\n`,
);
