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
/* Cloudflare's own dashboard filters on a number field called bot (0 or 1).
   Try that first with a one-row query; null if the API refuses it. */
async function probeBot(env) {
  const now = new Date();
  const range = { since: iso(new Date(now.getTime() - 86400000)), until: iso(now) };
  const base = { accountId: env.CF_ACCOUNT_ID, siteTag: env.CF_SITE_TAG, ...range, limit: 1 };
  try {
    await graphql(env, panelQuery({ ...base, extraFilter: '{ bot: 0 }' }));
  } catch (err) {
    botFieldError = String(err?.message || err);
    return null;
  }
  let canGroup = true;
  try {
    await graphql(env, panelQuery({ ...base, dimension: 'bot' }));
  } catch {
    canGroup = false;
  }
  return { name: 'bot', yes: '1', no: '0', canGroup };
}

let botFieldError = null;
async function findBotField(env) {
  if (Date.now() - botFieldCache.at < 3600000) return botFieldCache.value;
  botFieldError = null;
  let value = await probeBot(env);
  if (value) {
    botFieldCache = { at: Date.now(), value };
    return value;
  }
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
    botFieldError = String(err?.message || err);
  }
  if (!value) console.error('analytics: bot field lookup failed:', botFieldError || 'no bot field in the schema');
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
  // Web Analytics keeps every page load for 7 days, then about one in ten;
  // sampleInterval says how many each kept one stands for. The figures are
  // scaled back up, which is why older periods come out as round numbers.
  return rows.map((r) => {
    const scale = r.avg?.sampleInterval || 1;
    return {
      key: r.dimensions?.key ?? null,
      views: Math.round((r.count ?? 0) * scale),
      visits: Math.round((r.sum?.visits ?? 0) * scale),
      scale,
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

/* Returns a refusal if the request is not from someone signed in to this
   site's TinaCMS, or null to carry on. Shared by both analytics endpoints. */
async function refuse(request, env) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
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
  return null;
}

// Whole seconds: the API's Time type is written like 2026-10-11T16:00:00Z.
const iso = (d) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');

/* Referrers that are AI assistants, so visits from AI answers can be counted.
   Google's AI Overviews arrive as google.com and cannot be told apart. */
const AI_REFERRERS = [
  [/(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com)$/i, 'ChatGPT'],
  [/(^|\.)perplexity\.ai$/i, 'Perplexity'],
  [/(^|\.)claude\.ai$/i, 'Claude'],
  [/(^|\.)(gemini|bard)\.google\.com$/i, 'Gemini'],
  [/(^|\.)copilot\.microsoft\.com$/i, 'Microsoft Copilot'],
  [/(^|\.)meta\.ai$/i, 'Meta AI'],
  [/(^|\.)deepseek\.com$/i, 'DeepSeek'],
  [/(^|\.)grok\.com$/i, 'Grok'],
  [/(^|\.)mistral\.ai$/i, 'Mistral'],
  [/(^|\.)you\.com$/i, 'You.com'],
  [/(^|\.)poe\.com$/i, 'Poe'],
  [/(^|\.)phind\.com$/i, 'Phind'],
];
const aiName = (host) => AI_REFERRERS.find(([re]) => re.test(host || ''))?.[1] ?? null;

export async function handleAnalytics(request, env) {
  if (new URL(request.url).pathname === '/api/analytics/ai') return handleAiCrawlers(request, env);

  // 1. Signed in to TinaCMS?
  const refusal = await refuse(request, env);
  if (refusal) return refusal;

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
    // A long list, so the AI assistants can be picked out before trimming.
    referrers: runPanel(env, { ...scoped, dimension: 'refererHost', limit: 100, orderBy: 'count_DESC' }),
    countries: runPanel(env, { ...scoped, dimension: 'countryName', limit: 10, orderBy: 'count_DESC' }),
    devices: runPanel(env, { ...scoped, dimension: 'deviceType', limit: 5, orderBy: 'count_DESC' }),
  };
  const names = Object.keys(panels);
  const settled = await Promise.allSettled(Object.values(panels));
  const out = { days, range, who: bot ? who : 'all', botsAvailable: !!bot, botsError: bot ? null : botFieldError, errors: {} };
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
  // Visits that came from an AI assistant's answer, by assistant.
  const byAssistant = new Map();
  for (const row of out.referrers) {
    const name = aiName(row.key);
    if (!name) continue;
    const t = byAssistant.get(name) || { key: name, views: 0, visits: 0 };
    t.views += row.views;
    t.visits += row.visits;
    byAssistant.set(name, t);
  }
  const assistants = [...byAssistant.values()].sort((a, b) => b.visits - a.visits);
  out.aiReferrals = {
    visits: assistants.reduce((n, a) => n + a.visits, 0),
    views: assistants.reduce((n, a) => n + a.views, 0),
    assistants,
  };

  out.referrers = out.referrers
    .filter((r) => !/(^|\.)helensplace\.co\.uk$|workers\.dev$/i.test(r.key || ''))
    .map((r) => (r.key ? r : { ...r, key: 'Typed in, bookmarks or apps' }))
    .slice(0, 10);
  out.totals = out.totals[0] ?? { views: 0, visits: 0 };
  // The heaviest sampling behind the headline figures: 1 means exact.
  out.sampleInterval = Math.max(1, out.totals.scale || 1, ...out.daily.map((r) => r.scale || 1));

  // People and bots for the whole period, whichever view is shown.
  const isBot = (k) => k === 1 || k === true || k === '1' || k === 'true';
  const sum = (rows) => rows.reduce((a, r) => ({ views: a.views + r.views, visits: a.visits + r.visits }), { views: 0, visits: 0 });
  out.split = out.split.length
    ? { people: sum(out.split.filter((r) => !isBot(r.key))), bots: sum(out.split.filter((r) => isBot(r.key))) }
    : null;

  return json(out);
}

/* ---------- AI services reading the site --------------------------------- */

/* AI crawlers, recognised by the name they announce in their user agent, which
   is what AI Crawl Control does on the free plan. Order matters: the first
   match wins. The last column is what the visit was for. */
const AI_CRAWLERS = [
  ['ChatGPT-User', 'ChatGPT', 'OpenAI', 'answering'],
  ['OAI-SearchBot', 'ChatGPT search', 'OpenAI', 'search'],
  ['GPTBot', 'GPTBot', 'OpenAI', 'training'],
  ['Claude-User', 'Claude', 'Anthropic', 'answering'],
  ['Claude-SearchBot', 'Claude search', 'Anthropic', 'search'],
  ['ClaudeBot', 'ClaudeBot', 'Anthropic', 'training'],
  ['anthropic-ai', 'Anthropic', 'Anthropic', 'training'],
  ['Perplexity-User', 'Perplexity', 'Perplexity', 'answering'],
  ['PerplexityBot', 'Perplexity search', 'Perplexity', 'search'],
  ['meta-externalfetcher', 'Meta AI', 'Meta', 'answering'],
  ['meta-externalagent', 'Meta AI', 'Meta', 'training'],
  ['MistralAI-User', 'Mistral Le Chat', 'Mistral', 'answering'],
  ['DuckAssistBot', 'DuckDuckGo AI', 'DuckDuckGo', 'answering'],
  ['Google-CloudVertexBot', 'Google Vertex AI', 'Google', 'answering'],
  ['GoogleOther', 'Google (AI and research)', 'Google', 'training'],
  ['Applebot', 'Applebot', 'Apple', 'search'],
  ['Amazonbot', 'Amazonbot', 'Amazon', 'training'],
  ['Bytespider', 'Bytespider', 'ByteDance', 'training'],
  ['CCBot', 'Common Crawl', 'Common Crawl', 'training'],
  ['cohere-ai', 'Cohere', 'Cohere', 'training'],
  ['YouBot', 'You.com', 'You.com', 'search'],
];
const WHY = {
  answering: 'Answering a question someone asked',
  search: 'Indexing for AI search',
  training: 'Collecting for AI training',
};
// The free plan keeps 31 days of request data and allows 30 days per query.
const CRAWLER_MAX_DAYS = 30;

function crawlerQuery(zone, since, until, dimension, limit) {
  const like = AI_CRAWLERS.map(([ua]) => `{ userAgent_like: "%${ua}%" }`).join(', ');
  return `{ viewer { zones(filter: { zoneTag: "${zone}" }) {
    rows: httpRequestsAdaptiveGroups(
      filter: { AND: [{ datetime_geq: "${since}", datetime_leq: "${until}" }, { requestSource: "eyeball" }, { OR: [${like}] }] }
      limit: ${limit}, orderBy: [count_DESC]
    ) { count avg { sampleInterval } dimensions { key: ${dimension} } }
  } } }`;
}

async function runCrawlerPanel(env, since, until, dimension, limit) {
  const data = await graphql(env, crawlerQuery(env.CF_ZONE_ID, since, until, dimension, limit));
  return (data?.viewer?.zones?.[0]?.rows ?? []).map((r) => ({
    key: r.dimensions?.key ?? '',
    requests: Math.round((r.count ?? 0) * (r.avg?.sampleInterval || 1)),
  }));
}

async function handleAiCrawlers(request, env) {
  const refusal = await refuse(request, env);
  if (refusal) return refusal;
  const missing = ['CF_ANALYTICS_TOKEN', 'CF_ZONE_ID'].filter((k) => !env[k]);
  if (missing.length) return json({ error: `Not set up yet: ${missing.join(', ')} missing on the Worker.` }, 500);
  if (!/^[a-f0-9]{32}$/i.test(env.CF_ZONE_ID)) {
    return json({ error: 'CF_ZONE_ID does not look right: it should be 32 letters and numbers.' }, 500);
  }

  const asked = Number(new URL(request.url).searchParams.get('days'));
  const days = Math.min(ALLOWED_DAYS.includes(asked) ? asked : 30, CRAWLER_MAX_DAYS);
  const until = new Date();
  const since = new Date(until.getTime() - days * 86400000);

  const [agents, paths] = await Promise.allSettled([
    runCrawlerPanel(env, iso(since), iso(until), 'userAgent', 200),
    runCrawlerPanel(env, iso(since), iso(until), 'clientRequestPath', 40),
  ]);
  const out = { days, errors: {} };

  if (agents.status === 'fulfilled') {
    const byCrawler = new Map();
    for (const row of agents.value) {
      const match = AI_CRAWLERS.find(([ua]) => row.key.toLowerCase().includes(ua.toLowerCase()));
      if (!match) continue;
      const [, name, company, why] = match;
      const id = `${name}|${why}`;
      const t = byCrawler.get(id) || { name, company, why: WHY[why], requests: 0 };
      t.requests += row.requests;
      byCrawler.set(id, t);
    }
    out.crawlers = [...byCrawler.values()].sort((a, b) => b.requests - a.requests);
    out.total = out.crawlers.reduce((n, c) => n + c.requests, 0);
  } else {
    out.crawlers = [];
    out.total = 0;
    out.errors.crawlers = String(agents.reason?.message || agents.reason);
    console.error('analytics: AI crawlers failed:', out.errors.crawlers);
  }

  if (paths.status === 'fulfilled') {
    // Pages only: leave out the stylesheets, scripts and photos pages load.
    out.pages = paths.value
      .filter((p) => !/^\/(_astro|images|admin)\//.test(p.key) && !/\.(css|js|png|jpe?g|webp|svg|ico|woff2?)$/i.test(p.key))
      .slice(0, 10);
  } else {
    out.pages = [];
    out.errors.pages = String(paths.reason?.message || paths.reason);
  }
  return json(out);
}
