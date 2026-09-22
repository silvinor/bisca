const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");

// Must match app.json's splash plugin `imageWidth` (native launch screen) so the
// JS splash animation (Phase 5) can start from this exact size for a seamless handoff.
const SPLASH_LOGO_WIDTH = 256;

const icons = [
  { src: "public/favicon.svg", out: "public/android-icon-foreground.png", width: 512, height: 512 },
  { src: "public/favicon.svg", out: "public/android-icon-monochrome.png", width: 512, height: 512, mono: true },
  { src: "public/favicon.svg", out: "public/icon.png", width: 1024, height: 1024 },
  { src: "public/favicon.svg", out: "public/favicon.png", width: 48, height: 48 },
  { src: "public/favicon.svg", out: "public/favicon.gif", width: 48, height: 48 },
  { src: "public/favicon.svg", out: "public/favicon.ico", sizes: [16, 32, 48, 64, 128, 256] },
  { src: "public/assets/img/ambigram.svg", out: "public/splash-light.png", width: SPLASH_LOGO_WIDTH, splash: "light" },
  { src: "public/assets/img/ambigram.svg", out: "public/splash-dark.png", width: SPLASH_LOGO_WIDTH, splash: "dark" },
];

async function genMono(input, out, width, height) {
  const alpha = await sharp(input)
    .resize(width, height)
    .ensureAlpha()
    .extractChannel("alpha")
    .raw()
    .toBuffer();
  const rgba = Buffer.alloc(width * height * 4, 255);
  for (let i = 0; i < width * height; i++) rgba[i * 4 + 3] = alpha[i];
  await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toFile(out);
}

async function genSplash(input, out, width, variant) {
  let svg = fs.readFileSync(input, "utf8");
  if (variant === "dark") {
    svg = svg.replace("fill: #DDD;", "fill: #222;").replace("stroke: #EEE;", "stroke: #111;");
  }
  await sharp(Buffer.from(svg)).resize({ width }).png().toFile(out);
}

async function genIco(input, out, sizes) {
  const images = await Promise.all(
    sizes.map((size) => sharp(input).resize(size, size).png().toBuffer())
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4); // image count

  const dirEntries = [];
  let offset = header.length + images.length * 16;
  images.forEach((data, i) => {
    const size = sizes[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // image data offset
    dirEntries.push(entry);
    offset += data.length;
  });

  fs.writeFileSync(out, Buffer.concat([header, ...dirEntries, ...images]));
}

async function main() {
  for (const { src, out, width, height, mono, sizes, splash } of icons) {
    const input = path.join(root, src);
    const output = path.join(root, out);
    if (sizes) {
      await genIco(input, output, sizes);
    } else if (splash) {
      await genSplash(input, output, width, splash);
    } else if (mono) {
      await genMono(input, output, width, height);
    } else {
      const format = path.extname(output).slice(1).toLowerCase();
      await sharp(input).resize(width, height).toFormat(format).toFile(output);
    }
    const size = sizes ? sizes.join(",") : `${width}${height ? "x" + height : ""}`;
    const tag = mono ? "[mono]" : splash ? `[${splash}]` : "";
    console.log(`» ${src} (${size}) → ${out} ${tag}`);
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
