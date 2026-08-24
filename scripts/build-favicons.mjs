/**
 * Builds the favicon set from Helen's monogram.
 *
 * The source is the site icon from the existing WordPress site: the handwritten
 * HP monogram in brand purple, 512x512 with a transparent background.
 *
 * Two things worth knowing about the output:
 *
 * - Apple touch icons do not honour transparency. iOS composites them onto
 *   black, which would turn a purple monogram into something unreadable, so
 *   that one is flattened onto the brand background colour first.
 * - sharp cannot write .ico, so the ICO is assembled by hand. Since Windows
 *   Vista the format permits PNG payloads inside the container, which is all
 *   the ICONDIR and ICONDIRENTRY headers below are wrapping.
 *
 *   node scripts/build-favicons.mjs <path to the source png>
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SRC = process.argv[2];
if (!SRC) {
  console.error('Pass the path to the source PNG.');
  process.exit(1);
}

const OUT = path.join(process.cwd(), 'public');
mkdirSync(OUT, { recursive: true });

/** Page background, so the flattened icons sit on brand rather than black. */
const BG = { r: 0xfa, g: 0xf7, b: 0xfc, alpha: 1 };

const png = (size, { flatten = false } = {}) => {
  let img = sharp(SRC).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  if (flatten) img = img.flatten({ background: BG });
  return img.png({ compressionLevel: 9 }).toBuffer();
};

/** Minimal ICO container wrapping PNG payloads. */
const buildIco = (entries) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const dir = [];
  for (const { size, data } of entries) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width, 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2);   // colours in palette
    e.writeUInt8(0, 3);   // reserved
    e.writeUInt16LE(1, 4);  // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    dir.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...dir, ...entries.map((e) => e.data)]);
};

const written = [];
const write = (name, buf) => {
  writeFileSync(path.join(OUT, name), buf);
  written.push(`${name.padEnd(24)} ${(buf.length / 1024).toFixed(1)}KB`);
};

/* Browser tab icons, transparent so they suit light and dark tab bars. */
write('favicon-16.png', await png(16));
write('favicon-32.png', await png(32));

/* iOS home screen, flattened. */
write('apple-touch-icon.png', await png(180, { flatten: true }));

/* Android home screen and the web manifest. */
write('icon-192.png', await png(192, { flatten: true }));
write('icon-512.png', await png(512, { flatten: true }));

/* Legacy and, importantly, the file Google looks for at the site root. */
const ico = buildIco([
  { size: 16, data: await png(16) },
  { size: 32, data: await png(32) },
  { size: 48, data: await png(48) },
]);
write('favicon.ico', ico);

write(
  'site.webmanifest',
  Buffer.from(
    JSON.stringify(
      {
        name: "Helen's Place",
        short_name: "Helen's Place",
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: '#7030A0',
        background_color: '#FAF7FC',
        display: 'standalone',
      },
      null,
      2,
    ) + '\n',
  ),
);

console.log(written.join('\n'));
