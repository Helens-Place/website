/**
 * Validates that every content file's YAML frontmatter parses.
 *
 * Astro only surfaces this at build time, and the commonest cause is an
 * unquoted colon in a title, which reads perfectly well to a human and is
 * invalid YAML.
 */
import { readFileSync, globSync } from 'node:fs';
import yaml from 'js-yaml';

let bad = 0, n = 0;
for (const file of globSync('src/content/**/*.md')) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) { console.error(`${file}: no frontmatter block`); bad++; continue; }
  n++;
  try {
    yaml.load(m[1]);
  } catch (e) {
    bad++;
    console.error(`${file}: ${e.message.split('\n')[0]}`);
    console.error('   A colon inside an unquoted value is the usual cause. Wrap the value in double quotes.');
  }
}
if (bad) { console.error(`\n${bad} file(s) with invalid frontmatter.`); process.exit(1); }
console.log(`Frontmatter valid in all ${n} content files.`);
