/**
 * Hard rule from the build brief: no em dashes or en dashes anywhere in the
 * written content of this site. Use commas and full stops instead.
 *
 * Run with `npm run check:dashes`. Exits non zero if any are found, so it can
 * be wired into CI later if that is wanted.
 */
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const PATTERNS = ['src/**/*.md', 'src/**/*.mdx', 'src/**/*.astro'];
const BANNED = [
  { char: '—', name: 'em dash' },
  { char: '–', name: 'en dash' },
  { char: '―', name: 'horizontal bar' },
];

const files = PATTERNS.flatMap((p) => globSync(p, { cwd: process.cwd() }));
let found = 0;

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const { char, name } of BANNED) {
      let col = line.indexOf(char);
      while (col !== -1) {
        console.error(`${file}:${i + 1}:${col + 1}  ${name} found`);
        console.error(`    ${line.trim()}`);
        found++;
        col = line.indexOf(char, col + 1);
      }
    }
  });
}

if (found > 0) {
  console.error(`\n${found} dash${found === 1 ? '' : 'es'} found. Replace with commas or full stops.`);
  process.exit(1);
}
console.log(`No em dashes or en dashes found across ${files.length} files.`);
