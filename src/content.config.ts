import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({ label: z.string(), href: z.string() });

/* One card in the three doors block. `audience` drives the colour coding. */
const door = z.object({
  audience: z.enum(['families', 'schools', 'business']),
  label: z.string(),
  title: z.string(),
  body: z.string(),
  price: z.string().optional(),
  linkLabel: z.string(),
  href: z.string(),
});

const testimonial = z.object({
  quote: z.string(),
  name: z.string(),
  role: z.string().optional(),
  tone: z.enum(['families', 'schools', 'business']).default('families'),
});

const service = z.object({
  name: z.string(),
  price: z.string(),
  note: z.string().optional(),
});

const step = z.object({ title: z.string(), body: z.string() });

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    /* SEO and routing */
    title: z.string(),
    description: z.string(),
    /* Hero, editable on every page */
    eyebrow: z.string().optional(),
    heading: z.string(),
    intro: z.string().optional(),
    audience: z.enum(['families', 'schools', 'business', 'neutral']).default('neutral'),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    primaryCta: link.optional(),
    secondaryCta: link.optional(),
    trustLine: z.string().optional(),

    /* Optional blocks, only the pages that use them declare them */
    authority: z.array(z.string()).optional(),
    doorsHeading: z.string().optional(),
    doorsSubheading: z.string().optional(),
    doors: z.array(door).optional(),
    testimonialsHeading: z.string().optional(),
    testimonials: z.array(testimonial).optional(),
    bookBand: z.object({
      heading: z.string(),
      body: z.string(),
      cta: link,
      image: z.string().optional(),
      imageAlt: z.string().optional(),
    }).optional(),
    teasers: z.array(z.object({
      label: z.string(),
      title: z.string(),
      body: z.string(),
      cta: link,
      audience: z.enum(['families', 'schools', 'business']).default('schools'),
    })).optional(),
    /* Audience-specific signposting. Each of the three audience pages surfaces
       the content that suits it, rather than sending everyone to one hub. */
    /* Podcast and video appearances. */
    watchHeading: z.string().optional(),
    watch: z.array(z.object({
      title: z.string(),
      show: z.string(),
      body: z.string(),
      href: z.string(),
      image: z.string().optional(),
    })).optional(),
    listenHeading: z.string().optional(),
    listen: z.array(z.object({
      title: z.string(),
      show: z.string(),
      body: z.string(),
      href: z.string(),
    })).optional(),
    relatedHeading: z.string().optional(),
    relatedIntro: z.string().optional(),
    related: z.array(z.object({
      title: z.string(),
      body: z.string(),
      href: z.string(),
      tag: z.string().optional(),
    })).optional(),
    relatedCta: link.optional(),
    guidesHeading: z.string().optional(),
    guidesIntro: z.string().optional(),
    alsoHeading: z.string().optional(),
    alsoIntro: z.string().optional(),
    servicesHeading: z.string().optional(),
    servicesNote: z.string().optional(),
    services: z.array(service).optional(),
    sessionsHeading: z.string().optional(),
    sessions: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
    alsoHeading: z.string().optional(),
    also: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
    stepsHeading: z.string().optional(),
    steps: z.array(step).optional(),
    whyHeading: z.string().optional(),
    whyBody: z.string().optional(),
    priceLine: z.string().optional(),
    expertWitness: z.object({ heading: z.string(), body: z.string() }).optional(),
    offerHeading: z.string().optional(),
    offerBody: z.string().optional(),
    clientsHeading: z.string().optional(),
    clients: z.array(z.object({ name: z.string(), note: z.string().optional() })).optional(),
    clientsFootnote: link.optional(),
    featuredCourse: z.object({
      label: z.string(),
      title: z.string(),
      body: z.string(),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      bullets: z.array(z.string()).default([]),
      price: z.string().optional(),
      cta: link,
      note: z.string().optional(),
    }).optional(),
    credentialGroups: z.array(z.object({
      heading: z.string(),
      items: z.array(z.string()),
    })).optional(),
    routes: z.array(z.object({
      audience: z.enum(['families', 'schools', 'business']),
      title: z.string(),
      body: z.string(),
      cta: link,
    })).optional(),
    episodes: z.array(z.object({
      number: z.number(),
      title: z.string(),
      description: z.string(),
      vimeoId: z.string(),
      vimeoHash: z.string().default(''),
      duration: z.string().optional(),
      uploadDate: z.string().optional(),
      thumbnail: z.string().optional(),
      transcript: z.array(z.string()).default([]),
    })).optional(),
    faqs: z.array(z.object({
      category: z.string(),
      question: z.string(),
      answer: z.string(),
    })).optional(),
    links: z.array(link).optional(),
    finalCta: z.object({
      heading: z.string(),
      body: z.string(),
      cta: link,
    }).optional(),
    /* Set true to keep a page out of the sitemap and nav */
    draft: z.boolean().default(false),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string().optional(),
    heading: z.string(),
    intro: z.string(),
    /* Controls the order on the hub page. */
    order: z.number().default(50),
    audience: z.enum(['families', 'schools', 'business', 'neutral']).default('families'),
    /* Short line for the hub card. */
    summary: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    signsHeading: z.string().optional(),
    signs: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
    strategiesHeading: z.string().optional(),
    strategies: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
    /* Links back to the video this grew out of, where there is one. */
    episode: z.number().optional(),
    /* Show the book promotion band at the foot of the guide. */
    showBook: z.boolean().default(true),
    draft: z.boolean().default(false),
  }),
});

/* Long-form research-backed articles. These exist to be found from search and
   from AI assistants rather than browsed by visitors already on the site, so
   they live in their own section with a hub that makes the topic cluster
   legible. */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    heading: z.string(),
    summary: z.string(),
    theme: z.string(),
    themeLabel: z.string(),
    audience: z.enum(['families', 'schools', 'business', 'neutral']).default('families'),
    order: z.number().default(50),
    keyword: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const settings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/settings' }),
  schema: z.object({
    siteName: z.string(),
    tagline: z.string(),
    strapline: z.string(),
    email: z.string(),
    phone: z.string(),
    mobile: z.string().optional(),
    location: z.string(),
    responseTime: z.string(),
    bookCallLabel: z.string(),
    bookCallHref: z.string(),
    nav: z.array(link),
    footerNote: z.string(),
    /* Analytics stays off until both are set. See src/components/Analytics.astro. */
    analyticsProvider: z.enum(['none', 'cloudflare', 'plausible']).default('none'),
    analyticsToken: z.string().default(''),
    /* Pasted verification tokens for the search consoles, one-time setup. */
    googleSiteVerification: z.string().default(''),
    bingSiteVerification: z.string().default(''),
    socials: z.array(link),
    legal: z.array(link),
  }),
});

export const collections = { pages, guides, articles, blog, settings };
