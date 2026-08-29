/**
 * Catches a stale tina/tina-lock.json.
 *
 * TinaCloud reads tina-lock.json to learn the schema. The admin panel is built
 * from tina/config.ts. When the lock file is older than the config those two
 * disagree, and the CMS loads with "GraphQL Schema Mismatch", which does not
 * look like a lock file problem to anyone reading it.
 *
 * This happened for real. The blog collection was removed from config.ts, the
 * lock was never regenerated, and the CMS was broken for weeks. Every check in
 * this repo passed the whole time, because `tinacms build` validates the config
 * without rewriting the lock.
 *
 * The test is deliberately about commit order rather than schema contents.
 * Comparing the two files' schemas means parsing TypeScript, which is fragile
 * and gave false positives. Commit order is dull and correct.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const CONFIG = 'tina/config.ts';
const LOCK = 'tina/tina-lock.json';

const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

const fail = (message) => {
  console.error(`\n  ${message}\n`);
  console.error('  Regenerate it, then commit the result:\n');
  console.error('      npx tinacms dev\n');
  console.error('  Wait for "Dev Server is active", then stop it.\n');
  process.exit(1);
};

if (!existsSync(LOCK)) fail(`${LOCK} is missing.`);

const dirty = (file) => git(['status', '--porcelain', '--', file]) !== '';
const stamp = (file) => Number(git(['log', '-1', '--format=%ct', '--', file]) || 0);

if (dirty(CONFIG) && !dirty(LOCK)) {
  fail(`${CONFIG} has uncommitted changes but ${LOCK} does not, so the lock is out of date.`);
}

if (!dirty(CONFIG) && !dirty(LOCK) && stamp(CONFIG) > stamp(LOCK)) {
  const c = git(['log', '-1', '--format=%h %s', '--', CONFIG]);
  const l = git(['log', '-1', '--format=%h %s', '--', LOCK]);
  fail(
    `${LOCK} is stale.\n\n` +
      `      config last changed in:  ${c}\n` +
      `      lock last changed in:    ${l}`,
  );
}

console.log('Tina lock file is in step with the config.');
