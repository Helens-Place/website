# helensplace.co.uk

Source for the Helen's Place website, the practice of Dr Helen Ross, dyslexia
and SEND specialist, Trowbridge, Wiltshire.

| | |
|---|---|
| Framework | [Astro](https://docs.astro.build) 7, static output |
| Editing | [TinaCMS](https://tina.io) |
| Hosting | [Netlify](https://docs.netlify.com) |
| Node | 22.12.0, pinned in `.nvmrc` and `netlify.toml` |

Before pointing the domain at Netlify, work through [LAUNCH.md](LAUNCH.md).
It lists the temporary scaffolding that has to come back out, most importantly
the `noindex` header, which will keep the real site out of Google if it is left
in place.

## Getting started

```bash
npm install
```

```bash
npm run dev
```

The site runs at http://localhost:4321

To run the site with the editing interface attached:

```bash
npm run tina:dev
```

The CMS is then at http://localhost:4321/admin/index.html

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Astro dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run tina:dev` | Astro dev server with the TinaCMS editor |
| `npm run tina:build` | Production build including the CMS |
| `npm run check:dashes` | Enforces the no em dash and no en dash rule |
| `npm run check:frontmatter` | Checks every content file's YAML parses |
| `npm run check:tina` | Validates `tina/config.ts` and regenerates `tina-lock.json`. Run before pushing any CMS change |
| `npm run check` | All of the above |

## How the content works

All words, prices and photos live in content files, not in components, so they
can be edited through TinaCMS without touching code.

```
src/content/
  pages/      one Markdown file per page, structured frontmatter
  guides/     one Markdown file per guide
  articles/   one Markdown file per article
  settings/   site wide details: contact, menu, socials
```

Page structure, layout and the colour system live in code and are deliberately
not editable from the CMS. Helen edits words and prices, not layout.

## Design system

Tokens are defined once in `src/styles/global.css`. The three audiences are
colour coded, and that coding is functional wayfinding rather than decoration:

| Audience | Colour |
|---|---|
| Parents and families | soft pink |
| Schools and local authorities | purple |
| Business, research and legal | deep aubergine |

### Accessibility

This is the practice's own field, so the baseline is non negotiable:

- Body text 18px minimum, line height 1.65, measure capped at 64 characters.
  The root font size is set to 112.5%, so `1rem` equals 18px. This matters: with
  the browser default of 16px, every `rem`-sized paragraph silently lands under
  the floor. Keep body copy at `1rem` or above.
- Never pure white backgrounds, never pure black text.
- Left aligned, never justified.
- Visible keyboard focus on every interactive element.
- `prefers-reduced-motion` respected.
- Skip to content link.
- All colour pairs meet WCAG AA. Run `node scripts/contrast.mjs` to re-check
  after any palette change.
- A reading comfort bar offers larger text, roomier spacing and a lilac tint,
  remembered between visits.
- External links open in a new tab, so nobody is sent away from the site. They
  also carry hidden text saying so, and text links get a small arrow, because an
  unannounced new tab is disorienting and a screen reader gives no clue that the
  browser has moved. `src/components/ExternalLinks.astro` does this at runtime,
  so it covers Markdown bodies and anything added later through the CMS.

Two palette notes, both deliberate:

- `--pink-accent` was darkened from `#A83080` to `#972B73`. The original scored
  4.20:1 on the soft pink door fill, below the AA threshold. It now scores 4.91:1.
- `--muted` scores 2.58:1 on the page background, so it is used only for
  dividers and borders, never for text. Secondary text uses `--ink-soft`.

## Photos

Photos go in `public/images/`. See `public/images/README.md` for the filenames
the site expects. Any image not yet present renders as a labelled placeholder
block in the brand colours, so the build never breaks.

## Findability

The site is built to be found by search engines and cited by AI assistants.
Both reward the same thing: specific, verifiable, cross-linked facts.

- `src/lib/schema.ts` holds the entity graph, stated once with stable `@id`
  values, so every page references one consistent Helen rather than redefining
  her. Pages add their own `Service`, `Book`, `Course`, `FAQPage`,
  `BlogPosting` or `BreadcrumbList` on top.
- `/faq` carries `FAQPage` markup. It is the page most likely to be quoted
  directly in a search result or an assistant's answer.
- `/publications` lists peer-reviewed work with DOIs, which is the strongest
  credibility signal on the site.
- `public/robots.txt` records a deliberate decision about AI crawlers, and
  separates retrieval crawlers from training crawlers so either can be changed
  independently.
- `public/llms.txt` is a plain summary of the practice with the key facts and
  prices. The convention is not yet widely honoured, but the file is cheap.

After changing the schema, validate with Google's Rich Results Test and
Schema.org's validator.

## Analytics

Cloudflare Web Analytics, enabled in site settings and editable in the CMS. The
beacon token is public by design, since it ships in the page source, so it lives
in the content file rather than an environment variable.

The component emits nothing at all while the provider is `none` or the token is
blank, so analytics can be turned off without touching code.

Keep the script tag matching whatever snippet Cloudflare currently hands out. It
moved from `defer` to `type="module"`, and a module loaded as a classic script
fails silently. It carries `is:inline` so Astro renders it verbatim instead of
trying to bundle a third-party URL.

Google Analytics is deliberately not one of the options. It sets cookies and
processes visitor-level data for purposes beyond improving this site, so under
PECR it needs consent, which means a banner in front of every visitor. On a site
built for people who find interfaces hard, that is a real cost, and a banner
suppresses the data anyway because many people decline.

The two supported providers produce aggregate statistics only. Cloudflare Web
Analytics is free and writes nothing at all to the browser. Plausible is paid,
EU hosted and also cookieless.

If the provider ever changes, update the Analytics section of the privacy policy
to name it.

## Content rules

Two rules apply to every word on this site:

1. No em dashes or en dashes. Use commas and full stops. Enforced by
   `npm run check:dashes`.
2. Prices, qualifications and credentials are exact. Do not paraphrase them.

## When the dev server disagrees with the build

Astro caches parsed content in `.astro/`, and it does not always invalidate that
cache when `src/content.config.ts` changes. The symptom is a field that is
present in the file and in `npm run build`, but missing in `npm run dev`.

    rm -rf .astro && npx astro sync

The same applies to files added to `public/` while the dev server is running:
it reads that directory at startup, so restart it.

## Before pushing a Tina config change

`npm run build` is Astro only. It never loads `tina/config.ts`, and TypeScript
will not catch Tina's own schema rules either, so a broken CMS config passes
every local check and then fails the deploy.

Run `npm run check:tina` instead. It runs Tina's real validation. Three things
have bitten already:

- **`tina/tina-lock.json` must be regenerated and committed** whenever
  `tina/config.ts` changes. TinaCloud reads that file to learn the schema, so a
  stale one means the CMS loads with the new fields but queries an API that
  knows nothing about them, and shows "GraphQL Schema Mismatch". Regenerate by
  running `npx tinacms dev`, waiting for "Dev Server is active", then stopping
  it, and commit the changed file. Pushing it also triggers a TinaCloud
  re-index.

- Collection `name` must be alphanumeric or underscores. No hyphens. Use `label`
  for the human-readable version.
- Every page under `src/content/pages` needs its own collection, or it simply
  will not appear in the CMS.

## Deployment

Pushes to `main` trigger a Netlify build. The contact form uses Netlify Forms,
so submissions appear in the Netlify dashboard with no backend to maintain.

Every deploy is a full rebuild. Astro has no incremental mode, so changing one
word in the CMS regenerates all 48 pages, takes around 35 seconds locally and
one to two minutes on Netlify, and costs exactly what a large change costs.
Netlify only uploads the files whose contents changed, but build time is what
is metered, not upload.

That allowance is finite, and it can run out. When it does, published sites stay
up and only new deploys stop, so the symptom is a site that quietly will not
update. Check Billing in the Netlify dashboard.

`netlify.toml` carries an `ignore` rule so commits touching only the README,
`scripts/`, `.claude/` or `.gitignore` do not trigger a build. Note that its
exit codes read backwards: exit 0 skips the build. The comment above the rule
explains it.

Editing in TinaCMS commits to `main`, so each save is one deploy. That is fine
at the pace one person edits content. It is not fine at the pace of active
development, so batch pushes while building.
