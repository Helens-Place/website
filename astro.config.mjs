// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://helensplace.co.uk',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/thank-you') &&
        !page.includes('/privacy') &&
        !page.includes('/terms'),
    }),
  ],
  build: { format: 'directory' },
});
