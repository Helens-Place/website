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
function panelQuery({ accountId, siteTag, since, until, dimension, limit, orderBy }) {
  const filter = `{ AND: [{ datetime_geq: "${since}", datetime_leq: "${until}" }, { siteTag: "${siteTag}" }] }`;
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

  // 4. Fetch each panel separately, so one failing does not blank the rest.
  const panels = {
    totals: runPanel(env, { ...range, limit: 1 }),
    daily: runDaily(env, range),
    pages: runPanel(env, { ...range, dimension: 'requestPath', limit: 15, orderBy: 'count_DESC' }),
    referrers: runPanel(env, { ...range, dimension: 'refererHost', limit: 20, orderBy: 'count_DESC' }),
    countries: runPanel(env, { ...range, dimension: 'countryName', limit: 10, orderBy: 'count_DESC' }),
    devices: runPanel(env, { ...range, dimension: 'deviceType', limit: 5, orderBy: 'count_DESC' }),
  };
  const names = Object.keys(panels);
  const settled = await Promise.allSettled(Object.values(panels));
  const out = { days, range, errors: {} };
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

  return json(out);
}
