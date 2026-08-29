/**
 * Restores image fields in content files to bare filenames.
 *
 * TinaCMS rewrites every field on save, not just the edited one, and it mangles
 * image paths when it does. Two shapes have turned up so far:
 *
 *     /imageshelen-hero.jpg                            separator dropped
 *     /images/__staging/content/__filehelen-hero.jpg   staging prefix
 *
 * Photo.astro reduces all of these to a filename at build time, so the site
 * renders correctly either way and this is not urgent. But the values sitting
 * in the repo are wrong, and they accumulate with every edit, so they are worth
 * clearing out before launch.
 *
 *     node scripts/tidy-image-paths.mjs --check    report, change nothing
 *     node scripts/tidy-image-paths.mjs            rewrite the files
 *
 * It also reports any image that does not exist in public/images. That is a
 * different and more serious problem: a genuinely missing file rather than a
 * mis-written path, which is what happens if someone uploads through the CMS
 * and the upload never reaches the repo.
 *
 * Only the frontmatter block is touched. The body is left alone, so an
 * "image:" line inside a code sample is never rewritten.
 */
import { readFileSync, writeFileSync, existsSync, globSync } from 'node:fs';
import path from 'node:path';

const CHECK = process.argv.includes('--check');
const IMAGES = path.join('public', 'images');

/* Kept deliberately identical to the normalisation in src/components/Photo.astro.
   If one changes, change the other. */
const normalise = (value) =>
  value
    .replace(/^\/?images\/?/, '')
    .replace(/^__staging\/.*?__file/, '')
    .replace(/^.*\//, '');

const files = globSync('src/content/**/*.md');

let rewritten = 0;
let fieldsFixed = 0;
const missing = [];

for (const file of files) {
  const original = readFileSync(file, 'utf8');

  /* Frontmatter only: the opening --- through the next --- on its own line. */
  const match = original.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
  if (!match) continue;

  const [, open, frontmatter, close] = match;
  let changed = false;

  const updated = frontmatter
    .split(/\r?\n/)
    .map((line) => {
      const m = line.match(/^(\s*(?:- )?image:\s*)(.+?)\s*$/);
      if (!m) return line;

      const [, prefix, rawValue] = m;
      const unquoted = rawValue.replace(/^['"]|['"]$/g, '');
      const clean = normalise(unquoted);

      if (!clean) return line;

      if (!existsSync(path.join(IMAGES, clean))) {
        missing.push({ file, value: unquoted, resolvesTo: clean });
      }

      if (clean === unquoted) return line;

      changed = true;
      fieldsFixed += 1;
      console.log(`  ${file}`);
      console.log(`    ${unquoted}`);
      console.log(`    -> ${clean}`);
      return `${prefix}${clean}`;
    })
    .join('\n');

  if (!changed) continue;
  rewritten += 1;
  if (!CHECK) {
    writeFileSync(file, original.replace(match[0], `${open}${updated}${close}`));
  }
}

console.log();
if (fieldsFixed === 0) {
  console.log(`All image paths are already bare filenames. ${files.length} files checked.`);
} else {
  console.log(
    CHECK
      ? `${fieldsFixed} image path(s) need tidying across ${rewritten} file(s). Run without --check to fix.`
      : `Tidied ${fieldsFixed} image path(s) across ${rewritten} file(s).`,
  );
}

if (missing.length) {
  console.error(`\n  ${missing.length} image(s) not found in ${IMAGES}:\n`);
  for (const m of missing) {
    console.error(`    ${m.file}`);
    console.error(`      ${m.value}  ->  ${m.resolvesTo}  (no such file)`);
  }
  console.error('\n  These render as placeholders. If one was uploaded through the CMS,');
  console.error('  the file itself never reached the repo and needs adding by hand.\n');
  process.exit(1);
}

if (CHECK && fieldsFixed > 0) process.exit(1);
