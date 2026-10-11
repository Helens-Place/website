/**
 * The Worker in front of the site. Almost everything is the static build in
 * dist/, served by Cloudflare's asset handling, which also applies
 * public/_redirects and public/_headers. The Worker only runs first for
 * /api/* (see run_worker_first in wrangler.jsonc): the contact form, and the
 * figures for the Analytics screen in the TinaCMS admin.
 */
import { onRequestGet, onRequestPost } from './contact.js';
import { handleAnalytics } from './analytics.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/contact' || pathname === '/api/contact/') {
      if (request.method === 'POST') return onRequestPost({ request, env });
      if (request.method === 'GET' || request.method === 'HEAD') return onRequestGet();
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, POST' } });
    }

    if (pathname === '/api/analytics') return handleAnalytics(request, env);

    // Anything else under /api/ is not a page. Let the asset handler answer,
    // which gives the site's own 404 page.
    return env.ASSETS.fetch(request);
  },
};
