// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { writeFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
type RasterIcon = { src: string; out: string; width: number; height: number };
type IcoIcon = { src: string; out: string; sizes: number[] };

const icons: Array<RasterIcon | IcoIcon> = [
  { src: "public/favicon.svg", out: "public/favicon.png", width: 48, height: 48 },
  { src: "public/favicon.svg", out: "public/favicon.gif", width: 48, height: 48 },
  { src: "public/favicon.svg", out: "public/favicon.ico", sizes: [16, 32, 48, 64, 128, 256] },
];

async function generateIco(input: string, output: string, sizes: number[]): Promise<void> {
  const images = await Promise.all(
    sizes.map((size) => sharp(input).resize(size, size).png().toBuffer()),
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = header.length + images.length * 16;
  const entries = images.map((image, index) => {
    const entry = Buffer.alloc(16);
    const size = sizes[index];
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += image.length;
    return entry;
  });

  await writeFile(output, Buffer.concat([header, ...entries, ...images]));
}

await Promise.all(icons.map(async (icon) => {
  const input = path.join(root, icon.src);
  const output = path.join(root, icon.out);

  if ("sizes" in icon) {
    await generateIco(input, output, icon.sizes);
  } else {
    await sharp(input).resize(icon.width, icon.height).toFile(output);
  }
}));

console.log(`» ${icons.map((icon) => icon.out).join(", ")}`);
