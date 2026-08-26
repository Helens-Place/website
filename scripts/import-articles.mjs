/**
 * Imports the research articles into src/content/articles.
 *
 * Each source file opens with a block of publishing notes carrying the intended
 * slug, meta title, meta description and keyword. Those become frontmatter, and
 * the block itself is stripped so it never reaches the site.
 *
 * Three other things happen here:
 *
 * - The "Questions people often ask" section is lifted into a faqs array as
 *   well as staying in the body, so the page can carry FAQPage markup. The
 *   answers are the same text a reader sees, never hidden markup.
 * - The H1 moves to frontmatter, because the page template renders the heading.
 * - Cross-links between articles are rewritten from the root-level slugs the
 *   drafts assumed to the /articles/ paths actually used. Links to real pages
 *   such as /assessments are left alone.
 *
 *   node scripts/import-articles.mjs "<source folder>"
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SRC = process.argv[2];
if (!SRC) { console.error('Pass the folder holding the article markdown.'); process.exit(1); }

const OUT = 'src/content/articles';
mkdirSync(OUT, { recursive: true });

const THEMES = {
  t1: 'Understanding dyslexia',
  t2: 'Wellbeing and mental health',
  t3: 'Families and lived experience',
  t4: 'Teaching and teacher training',
  t5: 'Assistive technology and EdTech',
  t6: 'Voice, identity and hidden needs',
};

/** file number -> [theme, audience] */
const MAP = {
  1: ['t1', 'families'],   2: ['t1', 'families'],
  3: ['t2', 'families'],   4: ['t2', 'schools'],
  5: ['t3', 'families'],   6: ['t3', 'families'],
  7: ['t3', 'families'],   8: ['t3', 'families'],
  9: ['t4', 'schools'],   10: ['t4', 'schools'],
  11: ['t4', 'schools'],  12: ['t4', 'schools'],
  13: ['t5', 'business'], 14: ['t5', 'schools'],
  15: ['t5', 'schools'],  16: ['t5', 'business'],
  17: ['t6', 'families'], 18: ['t6', 'schools'],
  19: ['t6', 'families'],
};

/** Pages that already exist and must not be rewritten. */
const REAL_PAGES = new Set([
  '/assessments', '/schools', '/research-and-expert-witness', '/courses',
  '/publications', '/contact', '/book', '/about', '/speaking', '/faq',
  '/what-to-expect', '/churchill-fellowship', '/dyslexia-toolkit',
  '/elevator-series', '/podcasts-and-interviews', '/blog', '/privacy',
  '/safeguarding', '/terms', '/articles',
]);

const files = readdirSync(SRC).filter((f) => /^\d+-.*\.md$/.test(f)).sort();

/* Pass one: collect every article's slug so cross-links can be rewritten. */
const slugs = new Map();
for (const f of files) {
  const raw = readFileSync(path.join(SRC, f), 'utf8');
  const m = raw.match(/Suggested slug:\s*\/?([a-z0-9-]+)/i);
  if (m) slugs.set('/' + m[1], '/articles/' + m[1]);
}

/**
 * Folded YAML scalar, wrapped at spaces only.
 *
 * Never break inside a word. A long URL is a single token, and splitting one
 * across lines silently corrupts the link and breaks the YAML with it.
 */
const yamlBlock = (text, indent = '  ', width = 74) => {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line) line = w;
    else if (line.length + 1 + w.length <= width) line += ' ' + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return '>-\n' + lines.map((l) => indent + l).join('\n');
};

let written = 0;
const index = [];

for (const f of files) {
  const num = Number(f.match(/^(\d+)/)[1]);
  const raw = readFileSync(path.join(SRC, f), 'utf8').replace(/\r\n/g, '\n');

  /* Publishing notes block, then everything after it. */
  const notesEnd = raw.indexOf('\n---', raw.indexOf('---') + 3);
  /* The house style bans en and em dashes. Every occurrence in these drafts is
     a number range: page numbers in the references, and the book's "0-18"
     subtitle. So a hyphen is the correct replacement, not a comma. */
  const deDash = (t) => t.replace(/(\d)\s*[–—]\s*(\d)/g, '$1-$2');

  const notes = deDash(raw.slice(0, notesEnd));
  let body = deDash(raw.slice(notesEnd + 4).trim());

  const field = (label) => {
    const m = notes.match(new RegExp(`${label}:\\s*(.+)`, 'i'));
    return m ? m[1].trim() : '';
  };

  const slug = (field('Suggested slug').replace(/^\//, '') || f.replace(/^\d+-/, '').replace(/\.md$/, ''));
  let title = field('Meta title').replace(/\s*\|\s*Dr Helen Ross\s*$/i, '').trim();
  const description = field('Meta description');
  const keyword = field('Primary keyword');

  /* H1 becomes the heading. */
  const h1 = body.match(/^#\s+(.+)$/m);
  const heading = h1 ? h1[1].trim() : title;
  body = body.replace(/^#\s+.+$/m, '').trim();

  /* Rewrite cross-links to other articles. */
  for (const [from, to] of slugs) {
    if (REAL_PAGES.has(from)) continue;
    body = body.split(`](${from})`).join(`](${to})`);
    body = body.split(`](${from}#`).join(`](${to}#`);
  }

  /* The closing biography.
   *
   * In the drafts it is one paragraph using alternating emphasis: italic prose
   * with the book and journal titles left upright. That pattern is fragile, and
   * it has already broken. A closing marker sitting directly before a full stop
   * cannot open emphasis, so it renders as a literal asterisk, which is exactly
   * what was showing on the page.
   *
   * Rather than repair the markers, lift the whole thing out as a styled note.
   * The box already sets it apart from the article, so the italics were doing
   * no work. Markdown links are converted so "Get in touch" still works.
   */
  const lastRule = body.lastIndexOf('\n---');
  if (lastRule !== -1) {
    const tail = body.slice(lastRule + 4).trim();
    const looksLikeBio = /^\*/.test(tail) && /Dr Helen Ross/.test(tail) && tail.length < 1200;
    if (looksLikeBio) {
      const note = tail
        .replace(/\*/g, '')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\s+/g, ' ')
        .trim();
      body = body.slice(0, lastRule).trim()
        + `\n\n<p class="author-note">${note}</p>\n`;
    }
  }

  /* Lift the Q&A block for FAQPage markup. */
  const faqs = [];
  const qa = body.match(/##\s*Questions people often ask\s*\n([\s\S]*?)(?=\n---|\n##\s)/i);
  if (qa) {
    const pairs = qa[1].split(/\n(?=\*\*)/).map((s) => s.trim()).filter(Boolean);
    for (const p of pairs) {
      const q = p.match(/^\*\*(.+?)\*\*/);
      if (!q) continue;
      const a = p.slice(q[0].length).trim().replace(/\s+/g, ' ');
      if (a) faqs.push({ question: q[1].trim(), answer: a });
    }
  }

  /* First real paragraph, trimmed, as the card summary. */
  const firstPara = body.split(/\n\n/).find((p) => p.trim() && !p.startsWith('#')) || description;
  const summary = firstPara.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_]/g, '')
    .replace(/\s+/g, ' ').trim().slice(0, 185).replace(/\s+\S*$/, '') + '.';

  const [theme, audience] = MAP[num] ?? ['t1', 'families'];

  const q = (s) => JSON.stringify(s);
  let fm = '---\n';
  fm += `title: ${q(title)}\n`;
  fm += `description: ${yamlBlock(description)}\n`;
  fm += `heading: ${q(heading)}\n`;
  fm += `summary: ${yamlBlock(summary)}\n`;
  fm += `theme: ${q(theme)}\n`;
  fm += `themeLabel: ${q(THEMES[theme])}\n`;
  fm += `audience: ${q(audience)}\n`;
  fm += `order: ${num}\n`;
  if (keyword) fm += `keyword: ${q(keyword)}\n`;
  if (faqs.length) {
    fm += 'faqs:\n';
    for (const { question, answer } of faqs) {
      fm += `  - question: ${q(question)}\n`;
      fm += `    answer: ${yamlBlock(answer, '      ')}\n`;
    }
  }
  fm += '---\n\n';

  writeFileSync(path.join(OUT, `${slug}.md`), fm + body + '\n', 'utf8');
  index.push({ num, slug, theme, audience, faqs: faqs.length, words: body.split(/\s+/).length });
  written++;
}

console.log(`Wrote ${written} articles.\n`);
for (const a of index) {
  console.log(`  ${String(a.num).padStart(2)}  ${a.slug.padEnd(38)} ${a.theme}  ${a.audience.padEnd(9)} ${String(a.words).padStart(5)} words  ${a.faqs} FAQs`);
}
