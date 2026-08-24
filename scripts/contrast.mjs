/**
 * WCAG AA contrast check for the brand palette.
 *
 * Reads the tokens straight out of src/styles/global.css so this stays a real
 * check rather than a copy that drifts. Run after any palette change:
 *
 *   node scripts/contrast.mjs
 *
 * Exits non zero if any pair used for body text falls below 4.5:1.
 */
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/global.css', 'utf8');

/** Pull `--name: #RRGGBB;` declarations out of the stylesheet. */
const tokens = Object.fromEntries(
  [...css.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2].toUpperCase()]),
);
tokens['white'] = '#FFFFFF';

const lum = (hex) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/* Every foreground/background pair the site actually puts text on. */
const pairs = [
  ['ink', 'bg', 'body text on the page'],
  ['ink-soft', 'bg', 'secondary text'],
  ['purple', 'bg', 'schools accent text'],
  ['purple-deep', 'bg', 'links and business accent'],
  ['pink-accent', 'bg', 'families accent text'],
  ['ink', 'bg-tint', 'text on lilac sections'],
  ['ink', 'pink-soft', 'text in the families door'],
  ['ink', 'pink-tint', 'text on soft pink sections'],
  ['ink', 'paper', 'text on cards'],
  ['pink-accent', 'pink-tint', 'families accent on soft pink'],
  ['pink-accent', 'pink-soft', 'families accent in the families door'],
  ['purple-deep', 'pink-soft', 'deep purple in the families door'],
  ['purple', 'bg-tint', 'schools accent on lilac'],
  ['purple-deep', 'bg-tint', 'business accent on lilac'],
  ['white', 'purple', 'button text on purple'],
  ['white', 'purple-deep', 'button text on deep purple'],
  ['white', 'pink-accent', 'button text on the pink accent'],
];

let failures = 0;
console.log('Pair'.padEnd(34) + 'Ratio    Result   Used for');
console.log('-'.repeat(92));

for (const [fg, bg, use] of pairs) {
  if (!tokens[fg] || !tokens[bg]) {
    console.error(`Missing token: ${!tokens[fg] ? fg : bg}`);
    failures++;
    continue;
  }
  const r = ratio(tokens[fg], tokens[bg]);
  const pass = r >= 4.5;
  if (!pass) failures++;
  const verdict = pass ? 'PASS' : r >= 3 ? 'LARGE ONLY' : 'FAIL';
  console.log(
    `${fg} on ${bg}`.padEnd(34) +
      `${r.toFixed(2).padStart(5)}    ${verdict.padEnd(9)}${use}`,
  );
}

/* --muted is deliberately excluded above. At 2.58:1 on the page background it
   cannot carry text, so it is restricted to dividers and borders. Flag it if
   anyone ever tries to use it as a text colour. */
const mutedTextUse = /color:\s*var\(--muted\)/.test(css);
if (mutedTextUse) {
  console.error('\n--muted is being used as a text colour. It scores 2.58:1 and fails AA.');
  failures++;
}

if (failures > 0) {
  console.error(`\n${failures} contrast problem${failures === 1 ? '' : 's'} found.`);
  process.exit(1);
}
console.log('\nAll pairs meet WCAG AA for body text.');
