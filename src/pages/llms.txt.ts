/**
 * Serves /llms.txt, the plain summary written for AI assistants.
 *
 * A page rather than a static file in public/, because static files are copied
 * straight through and never pass the middleware, so their price markers would
 * never be filled in. The text itself lives in src/data/llms.txt.
 */
import type { APIRoute } from 'astro';
import text from '../data/llms.txt?raw';

export const GET: APIRoute = () =>
  new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
