/**
 * /api/analytics: the figures behind the Analytics screen in the TinaCMS admin.
 *
 * Who may see them: anyone signed in to this site's TinaCMS project, which is
 * Helen and Andrew. The screen sends the TinaCMS sign-in token it already
 * holds; this asks TinaCloud whether that token belongs to a user of this
 * project, using the same check the admin itself runs (GET
 * identity.tinajs.io/v2/apps/<client id>/currentUser). No valid sign-in, no
 * figures. This also covers the workers.dev address, which no other lock would.
 *
 * Where the figures come from: Cloudflare Web Analytics, through the GraphQL
 * Analytics API (dataset rumPageloadEventsAdaptiveGroups). The API token stays
 * here on the server and never reaches the browser.
 *
 * Settings:
 *   TINA_CLIENT_ID        in wrangler.jsonc (public, it is in the admin too)
 *   CF_ACCOUNT_ID         in wrangler.jsonc, Helen's Cloudflare account
 *   CF_SITE_TAG           in wrangler.jsonc, the Web Analytics site
 *   CF_ANALYTICS_TOKEN    secret, an account API token with
 *                         Account Analytics: Read
 */

const IDENTITY = 'https://identity.tinajs.io';
const GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql';
const ALLOWED_DAYS = [7, 30, 90];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });

/* Is this token a signed-in user of this TinaCMS project? */
async function signedIn(token, clientId) {
  const res = await fetch(`${IDENTITY}/v2/apps/${clientId}/currentUser`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

/* One query for one panel. Values are interpolated rather than passed as
   variables so the query does not depend on the schema's input type names;
   every value is checked or generated here, never taken from the request. */
function panelQuery({ accountId, siteTag, since, until, dimension, limit, orderBy, extraFilter }) {
  const extra = extraFilter ? `, ${extraFilter}` : '';
  const filter = `{ AND: [{ datetime_geq: "${since}", datetime_leq: "${until}" }, { siteTag: "${siteTag}" }${extra}] }`;
  const dims = dimension ? `dimensions { key: ${dimension} }` : '';
  const order = orderBy ? `, orderBy: [${orderBy}]` : '';
  return `{ viewer { accounts(filter: { accountTag: "${accountId}" }) {
    rows: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: ${limit}${order}) {
      count
      sum { visits }
      avg { sampleInterval }
      ${dims}
    }
  } } }`;
}

async function graphql(env, query) {
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors?.length) {
    throw new Error(body.errors?.map((e) => e.message).join('; ') || `Cloudflare returned ${res.status}`);
  }
  return body.data;
}

/* Which field marks a page load as a bot? Cloudflare's dashboard can exclude
   bots, but the field's name is not documented, so ask the API itself: walk
   the schema from the query root to this dataset and look for a field called
   bot (or the nearest match) in its filter and its dimensions. Kept for an
   hour per Worker instance so the lookup does not run on every request. */
let botFieldCache = { at: 0, value: undefined };
const named = (t) => (t?.name ? t : t?.ofType ? named(t.ofType) : null);
async function typeFields(env, name) {
  const q = `{ __type(name: "${name}") { fields { name type { name kind ofType { name kind ofType { name kind } } }
    args { name type { name kind ofType { name kind ofType { name kind } } } } }
    inputFields { name type { name kind ofType { name kind ofType { name kind } } } } } }`;
  return (await graphql(env, q)).__type || {};
}
async function findBotField(env) {
  if (Date.now() - botFieldCache.at < 3600000) return botFieldCache.value;
  let value = null;
  try {
    const root = (await graphql(env, '{ __schema { queryType { name } } }')).__schema.queryType.name;
    const field = async (typeName, fieldName) => (await typeFields(env, typeName)).fields?.find((f) => f.name === fieldName);
    const viewer = named((await field(root, 'viewer'))?.type)?.name;
    const account = named((await field(viewer, 'accounts'))?.type)?.name;
    const dataset = await field(account, 'rumPageloadEventsAdaptiveGroups');
    const filterType = named(dataset?.args?.find((a) => a.name === 'filter')?.type)?.name;
    const groupType = named(dataset?.type)?.name;
    const dimsType = named((await field(groupType, 'dimensions'))?.type)?.name;
    const filterFields = (await typeFields(env, filterType)).inputFields || [];
    const dimFields = (await typeFields(env, dimsType)).fields || [];
    const pick = (list) => list.find((f) => /^bot$/i.test(f.name)) || list.find((f) => /^is_?bot$/i.test(f.name));
    const inFilter = pick(filterFields);
    if (inFilter) {
      const t = named(inFilter.type);
      value = {
        name: inFilter.name,
        // How "yes, a bot" is written depends on the field's type.
        yes: t?.name === 'Boolean' ? 'true' : t?.name === 'String' ? '"1"' : '1',
        no: t?.name === 'Boolean' ? 'false' : t?.name === 'String' ? '"0"' : '0',
        canGroup: dimFields.some((f) => f.name === inFilter.name),
      };
    }
  } catch (err) {
    console.error('analytics: bot field lookup failed:', String(err?.message || err));
  }
  // A failed lookup is retried after five minutes rather than an hour.
  botFieldCache = { at: value === null ? Date.now() - 3300000 : Date.now(), value };
  return value;
}

async function runPanel(env, opts) {
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: panelQuery({ accountId: env.CF_ACCOUNT_ID, siteTag: env.CF_SITE_TAG, ...opts }) }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors?.length) {
    throw new Error(body.errors?.map((e) => e.message).join('; ') || `Cloudflare returned ${res.status}`);
  }
  const rows = body.data?.viewer?.accounts?.[0]?.rows ?? [];
  // Web Analytics samples busy sites; sampleInterval scales a sample back up.
  // On a site this size it is 1, so the figures are exact.
  return rows.map((r) => {
    const scale = r.avg?.sampleInterval || 1;
    return {
      key: r.dimensions?.key ?? null,
      views: Math.round((r.count ?? 0) * scale),
      visits: Math.round((r.sum?.visits ?? 0) * scale),
    };
  });
}

/* The day-by-day panel. Cloudflare's datasets name the day dimension
   differently, so try the usual names in turn. */
async function runDaily(env, opts) {
  let lastError;
  for (const dimension of ['date', 'datetimeDay']) {
    try {
      return await runPanel(env, { ...opts, dimension, limit: 100, orderBy: `${dimension}_ASC` });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export async function handleAnalytics(request, env) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  // 1. Signed in to TinaCMS?
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'Please sign in to TinaCMS to see the analytics.' }, 401);
  if (!env.TINA_CLIENT_ID) return json({ error: 'TINA_CLIENT_ID is not set on the Worker.' }, 500);
  let ok = false;
  try {
    ok = await signedIn(token, env.TINA_CLIENT_ID);
  } catch {
    return json({ error: 'TinaCloud could not be reached to confirm your sign-in. Try again in a minute.' }, 502);
  }
  if (!ok) return json({ error: 'Your TinaCMS sign-in could not be confirmed. Sign out of the editor and back in.' }, 401);

  // 2. Configured?
  const missing = ['CF_ANALYTICS_TOKEN', 'CF_ACCOUNT_ID', 'CF_SITE_TAG'].filter((k) => !env[k]);
  if (missing.length) return json({ error: `The analytics are not set up yet: ${missing.join(', ')} missing on the Worker.` }, 500);
  if (!/^[a-f0-9]{32}$/i.test(env.CF_ACCOUNT_ID) || !/^[a-f0-9]{32}$/i.test(env.CF_SITE_TAG)) {
    return json({ error: 'CF_ACCOUNT_ID or CF_SITE_TAG does not look right: each should be 32 letters and numbers.' }, 500);
  }

  // 3. Which period?
  const asked = Number(new URL(request.url).searchParams.get('days'));
  const days = ALLOWED_DAYS.includes(asked) ? asked : 30;
  const untilDate = new Date();
  const sinceDate = new Date(untilDate.getTime() - days * 86400000);
  // Whole seconds: the API's Time type is written like 2026-10-11T16:00:00Z.
  const iso = (d) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const range = { since: iso(sinceDate), until: iso(untilDate) };

  // 4. People, bots, or everyone? Every panel is filtered the same way.
  const askedWho = new URL(request.url).searchParams.get('who');
  const who = ['people', 'bots', 'all'].includes(askedWho) ? askedWho : 'people';
  const bot = await findBotField(env);
  const whoFilter = !bot || who === 'all' ? '' : `{ ${bot.name}: ${who === 'bots' ? bot.yes : bot.no} }`;
  const scoped = { ...range, extraFilter: whoFilter };

  // 5. Fetch each panel separately, so one failing does not blank the rest.
  // "split" is always over everyone, so the screen can show people and bots
  // side by side whichever view is chosen.
  const panels = {
    totals: runPanel(env, { ...scoped, limit: 1 }),
    split: bot?.canGroup ? runPanel(env, { ...range, dimension: bot.name, limit: 5 }) : Promise.resolve([]),
    daily: runDaily(env, scoped),
    pages: runPanel(env, { ...scoped, dimension: 'requestPath', limit: 15, orderBy: 'count_DESC' }),
    referrers: runPanel(env, { ...scoped, dimension: 'refererHost', limit: 20, orderBy: 'count_DESC' }),
    countries: runPanel(env, { ...scoped, dimension: 'countryName', limit: 10, orderBy: 'count_DESC' }),
    devices: runPanel(env, { ...scoped, dimension: 'deviceType', limit: 5, orderBy: 'count_DESC' }),
  };
  const names = Object.keys(panels);
  const settled = await Promise.allSettled(Object.values(panels));
  const out = { days, range, who: bot ? who : 'all', botsAvailable: !!bot, errors: {} };
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') out[names[i]] = r.value;
    else {
      out[names[i]] = [];
      out.errors[names[i]] = String(r.reason?.message || r.reason);
      console.error(`analytics: ${names[i]} failed:`, out.errors[names[i]]);
    }
  });

  // Moving between pages of the site shows up as a referral from the site
  // itself, which is not where visitors came from.
  // No referrer at all means a typed address, a bookmark, or an app such as
  // email that does not pass one on.
  out.referrers = out.referrers
    .filter((r) => !/(^|\.)helensplace\.co\.uk$|workers\.dev$/i.test(r.key || ''))
    .map((r) => (r.key ? r : { ...r, key: 'Typed in, bookmarks or apps' }))
    .slice(0, 10);
  out.totals = out.totals[0] ?? { views: 0, visits: 0 };

  // People and bots for the whole period, whichever view is shown.
  const isBot = (k) => k === 1 || k === true || k === '1' || k === 'true';
  const sum = (rows) => rows.reduce((a, r) => ({ views: a.views + r.views, visits: a.visits + r.visits }), { views: 0, visits: 0 });
  out.split = out.split.length
    ? { people: sum(out.split.filter((r) => !isBot(r.key))), bots: sum(out.split.filter((r) => isBot(r.key))) }
    : null;

  return json(out);
}
