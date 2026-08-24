/**
 * One off image preparation.
 *
 * Takes the originals from the photo folder, resizes them to web sizes and
 * writes them into public/images under the names the site expects.
 *
 * The logo is a flat purple wordmark on a solid white background. Placed on
 * the site's off white page colour that white block would show as a pale
 * rectangle, so it is converted to a transparent PNG: alpha is derived from
 * the darkness of each pixel and the colour is replaced with the brand purple.
 * That keeps the letter edges smoothly antialiased.
 *
 *   node scripts/process-photos.mjs "<path to the source folder>"
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const SRC = process.argv[2];
if (!SRC) {
  console.error('Pass the source folder as an argument.');
  process.exit(1);
}

const OUT = path.join(process.cwd(), 'public', 'images');
mkdirSync(OUT, { recursive: true });

/** source file -> output name, long edge in px */
const PHOTOS = [
  ['untitled-1-28.jpg', 'helen-hero.jpg', 1800],
  ['untitled-1-32.jpg', 'helen-contact.jpg', 1800],
  ['925A5270.jpg', 'helen-desk-working.jpg', 1600],
  ['925A5302.jpg', 'helen-book-laptop.jpg', 1400],
  ['925A5311.jpg', 'helen-portrait.jpg', 1400],
  ['925A5325.jpg', 'helen-dog-sofa.jpg', 1800],
  ['925A5369.jpg', 'helen-dog-bw.jpg', 1400],
  ['925A5386.jpg', 'helen-laptop-step.jpg', 1400],
  ['925A5426.jpg', 'helen-garden-laptop.jpg', 1400],
  ['book cover.png', 'book-cover.jpg', 1000],
];

const BRAND_PURPLE = { r: 0x70, g: 0x30, b: 0xa0 };

async function photos() {
  for (const [from, to, size] of PHOTOS) {
    const info = await sharp(path.join(SRC, from))
      .rotate()
      .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OUT, to));
    console.log(`${to.padEnd(26)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
  }
}

/** Flat wordmark on white -> transparent PNG in the brand purple. */
async function logo() {
  const src = sharp(path.join(SRC, 'logo.jpg')).trim({ threshold: 10 });
  const { data, info } = await src
    .resize({ width: 600, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = info.width * info.height;
  const out = Buffer.alloc(px * 4);
  for (let i = 0; i < px; i++) {
    const o = i * info.channels;
    const lum = (data[o] * 0.2126 + data[o + 1] * 0.7152 + data[o + 2] * 0.0722) / 255;
    const alpha = Math.round((1 - lum) * 255);
    out[i * 4] = BRAND_PURPLE.r;
    out[i * 4 + 1] = BRAND_PURPLE.g;
    out[i * 4 + 2] = BRAND_PURPLE.b;
    out[i * 4 + 3] = alpha;
  }

  const res = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'logo.png'));
  console.log(`logo.png                   ${res.width}x${res.height}  ${(res.size / 1024).toFixed(0)}KB  transparent`);
}

await photos();
await logo();
console.log('\nDone.');
