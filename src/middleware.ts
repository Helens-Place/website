/**
 * Fills in price markers on every page as it is built, and in the dev server.
 * See src/lib/prices.ts for the why.
 *
 * Runs on the finished response, so it reaches everything a page contains:
 * visible text, the meta description, and the structured data search engines
 * and AI assistants read. One place, rather than every template remembering to
 * do it.
 */
import { defineMiddleware } from 'astro:middleware';
import { getEntry } from 'astro:content';
import { resolvePrices } from './lib/prices';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const type = response.headers.get('content-type') || '';
  if (!/text\/(html|plain)|json|xml/.test(type)) return response;

  const body = await response.text();
  if (!/\[(price|amount):/i.test(body)) return new Response(body, response);

  const settings = await getEntry('settings', 'site');
  const resolved = resolvePrices(body, settings?.data.prices ?? [], context.url.pathname);
  return new Response(resolved, response);
});
