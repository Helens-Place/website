/**
 * /api/hit: one page read, for the "Towns" panel on the Analytics screen.
 *
 * Cloudflare Web Analytics only goes down to country. Every request that
 * reaches this Worker carries Cloudflare's own estimate of where the
 * connection came from (request.cf.city and region), so each page sends one
 * small same-site ping here and the Worker records the page and the town in
 * Workers Analytics Engine (binding HITS in wrangler.jsonc).
 *
 * Nothing that identifies anyone is kept: no IP address, no postcode, no
 * cookie, no browser details. Analytics Engine deletes rows after three months.
 * The ping is sent by the page's script, so search engines and most other bots
 * never send one: these are, to a good approximation, real people.
 */
const done = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

export async function handleHit(request, env) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  // Only pings from the site's own pages.
  const site = request.headers.get('Sec-Fetch-Site');
  if (site && site !== 'same-origin') return done();
  if (!env.HITS) return done();

  const path = (await request.text().catch(() => '')).trim().slice(0, 200);
  if (!path.startsWith('/') || path.startsWith('/admin')) return done();

  const cf = request.cf || {};
  if (cf.botManagement?.verifiedBot) return done();
  env.HITS.writeDataPoint({
    blobs: [String(cf.city || ''), String(cf.region || ''), String(cf.country || ''), path],
    doubles: [1],
    indexes: ['page'],
  });
  return done();
}
