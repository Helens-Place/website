import { defineConfig, type Collection } from 'tinacms';

/**
 * TinaCMS content model for helensplace.co.uk.
 *
 * Design principle from the build brief: Helen edits words, prices and photos,
 * never layout. So each page is its own collection pointing at a single content
 * file, with create and delete switched off and only the fields that page
 * actually has. The colour system, page structure and component choices live in
 * code and cannot be broken from the CMS.
 *
 * The blog is the one exception: it is a normal repeatable collection so Helen
 * can add posts freely.
 */

const branch =
  process.env.TINA_BRANCH ||
  process.env.HEAD ||               // Netlify sets this to the deploy branch
  'main';

/* TinaCloud credentials. Tina's own docs use different variable names across
   framework examples, so accept the common spellings rather than fail a deploy
   over a prefix. Both are set in the Netlify dashboard, not in the repo. */
const clientId =
  process.env.TINA_CLIENT_ID ||
  process.env.TINA_PUBLIC_CLIENT_ID ||
  process.env.PUBLIC_TINA_CLIENT_ID ||
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID ||
  null;

const token = process.env.TINA_TOKEN || process.env.TINA_READ_ONLY_TOKEN || null;

/* ---------- reusable field groups ---------------------------------------- */

const seoFields = [
  {
    type: 'string' as const,
    name: 'title',
    label: 'Browser and search engine title',
    description: 'Shown in the browser tab and in Google results.',
    required: true,
  },
  {
    type: 'string' as const,
    name: 'description',
    label: 'Search engine description',
    description: 'One or two sentences. Google shows this under the title.',
    ui: { component: 'textarea' as const },
    required: true,
  },
];

const heroFields = [
  { type: 'string' as const, name: 'eyebrow', label: 'Small label above the heading' },
  { type: 'string' as const, name: 'heading', label: 'Main heading', required: true },
  {
    type: 'string' as const,
    name: 'intro',
    label: 'Introduction',
    ui: { component: 'textarea' as const },
  },
  { type: 'image' as const, name: 'image', label: 'Photo' },
  { type: 'string' as const, name: 'imageAlt', label: 'Photo description for screen readers' },
];

const ctaField = (name: string, label: string) => ({
  type: 'object' as const,
  name,
  label,
  fields: [
    { type: 'string' as const, name: 'label', label: 'Button text' },
    { type: 'string' as const, name: 'href', label: 'Link' },
  ],
});

const finalCtaField = {
  type: 'object' as const,
  name: 'finalCta',
  label: 'Closing call to action band',
  fields: [
    { type: 'string' as const, name: 'heading', label: 'Heading' },
    { type: 'string' as const, name: 'body', label: 'Body', ui: { component: 'textarea' as const } },
    ctaField('cta', 'Button'),
  ],
};

/** Audience-specific signposting shown near the foot of an audience page. */
const relatedFields = [
  { type: 'string' as const, name: 'relatedHeading', label: 'Related content: heading' },
  {
    type: 'string' as const,
    name: 'relatedIntro',
    label: 'Related content: intro',
    ui: { component: 'textarea' as const },
  },
  {
    type: 'object' as const,
    name: 'related',
    label: 'Related content',
    list: true,
    ui: { itemProps: (item: any) => ({ label: item?.title }) },
    fields: [
      { type: 'string' as const, name: 'tag', label: 'Small label, e.g. Guide or Course' },
      { type: 'string' as const, name: 'title', label: 'Title' },
      { type: 'string' as const, name: 'body', label: 'Body', ui: { component: 'textarea' as const } },
      { type: 'string' as const, name: 'href', label: 'Link' },
    ],
  },
  ctaField('relatedCta', 'Button under the related content'),
];

/** A page that maps to exactly one file, with structure locked. */
const singlePage = (
  name: string,
  label: string,
  file: string,
  fields: any[],
): Collection => ({
  name,
  label,
  path: 'src/content/pages',
  format: 'md',
  match: { include: file },
  /* No `router` here on purpose. Setting one makes Tina open its visual editing
     view, which only works when a page registers a form through Tina's
     client-side data layer. These pages are statically rendered by Astro, so
     that view would sit empty and say "TinaCMS form fields will appear here".
     Without a router, clicking a page opens the normal field editor. */
  ui: {
    allowedActions: { create: false, delete: false },
  },
  fields: [...seoFields, ...fields],
});

/* ---------- collections --------------------------------------------------- */

const settings: Collection = {
  name: 'settings',
  label: 'Site settings',
  path: 'src/content/settings',
  format: 'md',
  match: { include: 'site' },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: 'string', name: 'siteName', label: 'Site name', required: true },
    { type: 'string', name: 'tagline', label: 'Tagline', required: true },
    { type: 'string', name: 'strapline', label: 'Strapline shown in the footer', required: true },
    { type: 'string', name: 'email', label: 'Email address', required: true },
    { type: 'string', name: 'phone', label: 'Phone', required: true },
    { type: 'string', name: 'mobile', label: 'Mobile' },
    { type: 'string', name: 'location', label: 'Location', required: true },
    { type: 'string', name: 'responseTime', label: 'Response time line', required: true },
    { type: 'string', name: 'bookCallLabel', label: 'Header button text', required: true },
    { type: 'string', name: 'bookCallHref', label: 'Header button link', required: true },
    {
      type: 'object',
      name: 'nav',
      label: 'Main menu',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.label }) },
      fields: [
        { type: 'string', name: 'label', label: 'Menu text' },
        { type: 'string', name: 'href', label: 'Link' },
      ],
    },
    {
      type: 'string',
      name: 'footerNote',
      label: 'Footer description',
      ui: { component: 'textarea' },
      required: true,
    },
    {
      type: 'object',
      name: 'socials',
      label: 'Social links',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.label }) },
      fields: [
        { type: 'string', name: 'label', label: 'Name' },
        { type: 'string', name: 'href', label: 'Link' },
      ],
    },
    {
      type: 'object',
      name: 'legal',
      label: 'Footer legal links',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.label }) },
      fields: [
        { type: 'string', name: 'label', label: 'Name' },
        { type: 'string', name: 'href', label: 'Link' },
      ],
    },
  ],
};

const home = singlePage('home', 'Home page', 'home', [
  ...heroFields,
  ctaField('primaryCta', 'Primary button'),
  ctaField('secondaryCta', 'Secondary button'),
  {
    type: 'string',
    name: 'authority',
    label: 'Credibility strip',
    description: 'The single row of credentials under the hero.',
    list: true,
  },
  { type: 'string', name: 'doorsHeading', label: 'Three doors: heading' },
  { type: 'string', name: 'doorsSubheading', label: 'Three doors: subheading' },
  {
    type: 'object',
    name: 'doors',
    label: 'Three doors',
    list: true,
    ui: { itemProps: (item: any) => ({ label: item?.title }) },
    fields: [
      {
        type: 'string',
        name: 'audience',
        label: 'Colour path',
        description: 'Controls the colour coding. Families is pink, schools purple, business deep aubergine.',
        options: [
          { value: 'families', label: 'Families, soft pink' },
          { value: 'schools', label: 'Schools, purple' },
          { value: 'business', label: 'Business and legal, deep aubergine' },
        ],
      },
      { type: 'string', name: 'label', label: 'Small label' },
      { type: 'string', name: 'title', label: 'Title' },
      { type: 'string', name: 'body', label: 'Body', ui: { component: 'textarea' } },
      { type: 'string', name: 'price', label: 'Price line' },
      { type: 'string', name: 'linkLabel', label: 'Link text' },
      { type: 'string', name: 'href', label: 'Link' },
    ],
  },
  { type: 'string', name: 'testimonialsHeading', label: 'Testimonials: heading' },
  {
    type: 'object',
    name: 'testimonials',
    label: 'Testimonials',
    list: true,
    ui: { itemProps: (item: any) => ({ label: item?.name }) },
    fields: [
      { type: 'string', name: 'quote', label: 'Quote', ui: { component: 'textarea' } },
      { type: 'string', name: 'name', label: 'Name' },
      { type: 'string', name: 'role', label: 'Role or description' },
      {
        type: 'string',
        name: 'tone',
        label: 'Colour',
        options: [
          { value: 'families', label: 'Families, soft pink' },
          { value: 'schools', label: 'Schools, purple' },
          { value: 'business', label: 'Business and legal, deep aubergine' },
        ],
      },
    ],
  },
  {
    type: 'object',
    name: 'bookBand',
    label: 'Book band',
    fields: [
      { type: 'string', name: 'heading', label: 'Heading' },
      { type: 'string', name: 'body', label: 'Body', ui: { component: 'textarea' } },
      ctaField('cta', 'Button'),
      { type: 'image', name: 'image', label: 'Book cover' },
      { type: 'string', name: 'imageAlt', label: 'Cover description' },
    ],
  },
  {
    type: 'object',
    name: 'teasers',
    label: 'Courses and speaking teasers',
    list: true,
    ui: { itemProps: (item: any) => ({ label: item?.title }) },
    fields: [
      { type: 'string', name: 'label', label: 'Small label' },
      { type: 'string', name: 'title', label: 'Title' },
      { type: 'string', name: 'body', label: 'Body', ui: { component: 'textarea' } },
      {
        type: 'string',
        name: 'audience',
        label: 'Colour',
        options: [
          { value: 'families', label: 'Families' },
          { value: 'schools', label: 'Schools' },
          { value: 'business', label: 'Business and legal' },
        ],
      },
      ctaField('cta', 'Button'),
    ],
  },
  finalCtaField,
]);

const assessments = singlePage('assessments', 'Assessments page', 'assessments', [
  ...heroFields,
  { type: 'string', name: 'trustLine', label: 'Trust line', ui: { component: 'textarea' } },
  ctaField('primaryCta', 'Primary button'),
  { type: 'string', name: 'servicesHeading', label: 'Prices: heading' },
  { type: 'string', name: 'servicesNote', label: 'Prices: note' },
  {
    type: 'object',
    name: 'services',
    label: 'Services and prices',
    list: true,
    ui: { itemProps: (item: any) => ({ label: item?.name }) },
    fields: [
      { type: 'string', name: 'name', label: 'Service' },
      { type: 'string', name: 'price', label: 'Price' },
      { type: 'string', name: 'note', label: 'Note' },
    ],
  },
  { type: 'string', name: 'whyHeading', label: 'Why choose Helen: heading' },
  { type: 'string', name: 'whyBody', label: 'Why choose Helen: body', ui: { component: 'textarea' } },
  ...relatedFields,
  { type: 'string', name: 'stepsHeading', label: 'What to expect: heading' },
  {
    type: 'object',
    name: 'steps',
    label: 'What to expect steps',
    list: true,
    ui: { itemProps: (item: any) => ({ label: item?.title }) },
    fields: [
      { type: 'string', name: 'title', label: 'Step title' },
      { type: 'string', name: 'body', label: 'Step body', ui: { component: 'textarea' } },
    ],
  },
  finalCtaField,
]);

const titledListField = (name: string, label: string) => ({
  type: 'object' as const,
  name,
  label,
  list: true,
  ui: { itemProps: (item: any) => ({ label: item?.title }) },
  fields: [
    { type: 'string' as const, name: 'title', label: 'Title' },
    { type: 'string' as const, name: 'body', label: 'Body', ui: { component: 'textarea' as const } },
  ],
});

const schools = singlePage('schools', 'Schools and training page', 'schools', [
  ...heroFields,
  ctaField('primaryCta', 'Primary button'),
  { type: 'string', name: 'sessionsHeading', label: 'Sessions: heading' },
  titledListField('sessions', 'Sessions offered'),
  { type: 'string', name: 'alsoHeading', label: 'Also available: heading' },
  titledListField('also', 'Also available'),
  { type: 'string', name: 'priceLine', label: 'Price line', ui: { component: 'textarea' } },
  ...relatedFields,
  finalCtaField,
]);

const research = singlePage(
  'research',
  'Research and expert witness page',
  'research-and-expert-witness',
  [
    ...heroFields,
    ctaField('primaryCta', 'Primary button'),
    {
      type: 'object',
      name: 'expertWitness',
      label: 'Expert witness section',
      fields: [
        { type: 'string', name: 'heading', label: 'Heading' },
        { type: 'string', name: 'body', label: 'Body', ui: { component: 'textarea' } },
      ],
    },
    { type: 'string', name: 'offerHeading', label: 'What Helen offers: heading' },
    { type: 'string', name: 'offerBody', label: 'What Helen offers: body', ui: { component: 'textarea' } },
    { type: 'string', name: 'clientsHeading', label: 'Clients: heading' },
    {
      type: 'object',
      name: 'clients',
      label: 'Selected clients and projects',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.name }) },
      fields: [
        { type: 'string', name: 'name', label: 'Client or project' },
        { type: 'string', name: 'note', label: 'Note' },
      ],
    },
    ctaField('clientsFootnote', 'Link under the client list'),
    { type: 'string', name: 'priceLine', label: 'Price line', ui: { component: 'textarea' } },
    ...relatedFields,
    finalCtaField,
  ],
);

const courses = singlePage('courses', 'Courses and guides page', 'courses', [
  ...heroFields,
  ctaField('primaryCta', 'Primary button'),
  { type: 'string', name: 'guidesHeading', label: 'Guides section: heading' },
  { type: 'string', name: 'guidesIntro', label: 'Guides section: intro', ui: { component: 'textarea' } },
  { type: 'string', name: 'alsoHeading', label: 'Also worth your time: heading' },
  { type: 'string', name: 'alsoIntro', label: 'Also worth your time: intro', ui: { component: 'textarea' } },
  finalCtaField,
  {
    type: 'object',
    name: 'featuredCourse',
    label: 'Featured course',
    fields: [
      { type: 'string', name: 'label', label: 'Small label' },
      { type: 'string', name: 'title', label: 'Course title' },
      { type: 'string', name: 'body', label: 'Description', ui: { component: 'textarea' } },
      { type: 'image', name: 'image', label: 'Course image' },
      { type: 'string', name: 'imageAlt', label: 'Course image description for screen readers' },
      { type: 'string', name: 'bullets', label: 'Key points', list: true },
      { type: 'string', name: 'price', label: 'Price line' },
      ctaField('cta', 'Button'),
      { type: 'string', name: 'note', label: 'Note underneath', ui: { component: 'textarea' } },
    ],
  },
]);

const speaking = singlePage('speaking', 'Speaking page', 'speaking', [
  ...heroFields,
  ctaField('primaryCta', 'Primary button'),
  finalCtaField,
]);

const about = singlePage('about', 'About page', 'about', [
  ...heroFields,
  ctaField('primaryCta', 'Primary button'),
  {
    type: 'object',
    name: 'credentialGroups',
    label: 'Credentials',
    list: true,
    ui: { itemProps: (item: any) => ({ label: item?.heading }) },
    fields: [
      { type: 'string', name: 'heading', label: 'Group heading' },
      { type: 'string', name: 'items', label: 'Items', list: true },
    ],
  },
  {
    type: 'object',
    name: 'links',
    label: 'Links',
    list: true,
    ui: { itemProps: (item: any) => ({ label: item?.label }) },
    fields: [
      { type: 'string', name: 'label', label: 'Text' },
      { type: 'string', name: 'href', label: 'Link' },
    ],
  },
  {
    type: 'rich-text',
    name: 'body',
    label: "Helen's story",
    isBody: true,
  },
]);

const book = singlePage('book', 'The book page', 'book', [
  ...heroFields,
  ctaField('primaryCta', 'Buy button'),
  { type: 'string', name: 'sessionsHeading', label: 'Inside the book: heading' },
  titledListField('sessions', 'Inside the book'),
  { type: 'string', name: 'whyHeading', label: 'Closing section: heading' },
  { type: 'string', name: 'whyBody', label: 'Closing section: body', ui: { component: 'textarea' } },
]);

const contact = singlePage('contact', 'Contact page', 'contact', [
  ...heroFields,
  {
    type: 'object',
    name: 'routes',
    label: 'Three enquiry routes',
    list: true,
    ui: { itemProps: (item: any) => ({ label: item?.title }) },
    fields: [
      {
        type: 'string',
        name: 'audience',
        label: 'Colour',
        options: [
          { value: 'families', label: 'Families' },
          { value: 'schools', label: 'Schools' },
          { value: 'business', label: 'Business and legal' },
        ],
      },
      { type: 'string', name: 'title', label: 'Title' },
      { type: 'string', name: 'body', label: 'Body', ui: { component: 'textarea' } },
      ctaField('cta', 'Button'),
    ],
  },
]);

const whatToExpect = singlePage(
  'whatToExpect',
  'What to expect page',
  'what-to-expect',
  [
    ...heroFields,
    ctaField('primaryCta', 'Primary button'),
    ctaField('secondaryCta', 'Secondary button'),
    { type: 'string', name: 'stepsHeading', label: 'Steps: heading' },
    {
      type: 'object',
      name: 'steps',
      label: 'The process, step by step',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.title }) },
      fields: [
        { type: 'string', name: 'title', label: 'Step title' },
        { type: 'string', name: 'body', label: 'Step body', ui: { component: 'textarea' } },
      ],
    },
    {
      type: 'object',
      name: 'links',
      label: 'Linked episodes',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.label }) },
      fields: [
        { type: 'string', name: 'label', label: 'Text' },
        { type: 'string', name: 'href', label: 'Link' },
      ],
    },
    finalCtaField,
    { type: 'rich-text', name: 'body', label: 'Page content', isBody: true },
  ],
);

const faq = singlePage('faq', 'Questions and answers page', 'faq', [
  ...heroFields,
  ctaField('primaryCta', 'Primary button'),
  {
    type: 'object',
    name: 'faqs',
    label: 'Questions',
    list: true,
    ui: { itemProps: (item: any) => ({ label: item?.question }) },
    fields: [
      {
        type: 'string',
        name: 'category',
        label: 'Section',
        description: 'Questions are grouped under this heading. Reuse the exact wording to keep them together.',
      },
      { type: 'string', name: 'question', label: 'Question' },
      { type: 'string', name: 'answer', label: 'Answer', ui: { component: 'textarea' } },
    ],
  },
  finalCtaField,
]);

const churchill = singlePage(
  'churchill',
  'Churchill Fellowship page',
  'churchill-fellowship',
  [
    ...heroFields,
    ctaField('primaryCta', 'Primary button'),
    ctaField('secondaryCta', 'Secondary button'),
    { type: 'string', name: 'authority', label: 'Credibility strip', list: true },
    { type: 'string', name: 'stepsHeading', label: 'Locations: heading' },
    titledListField('steps', 'Locations visited'),
    { type: 'string', name: 'sessionsHeading', label: 'Research questions: heading' },
    titledListField('sessions', 'Research questions'),
    {
      type: 'object',
      name: 'links',
      label: 'Report links',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.label }) },
      fields: [
        { type: 'string', name: 'label', label: 'Text' },
        { type: 'string', name: 'href', label: 'Link' },
      ],
    },
    finalCtaField,
    { type: 'rich-text', name: 'body', label: 'Page content', isBody: true },
  ],
);

const elevatorSeries = singlePage(
  'elevatorSeries',
  'Elevator Series page',
  'elevator-series',
  [
    ...heroFields,
    ctaField('primaryCta', 'Primary button'),
    {
      type: 'object',
      name: 'episodes',
      label: 'Episodes',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.title }) },
      fields: [
        { type: 'number', name: 'number', label: 'Episode number' },
        { type: 'string', name: 'title', label: 'Title' },
        { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
        { type: 'string', name: 'vimeoId', label: 'Vimeo ID' },
        { type: 'string', name: 'vimeoHash', label: 'Vimeo hash' },
        { type: 'string', name: 'duration', label: 'Duration', description: 'ISO 8601, for example PT2M6S' },
        { type: 'string', name: 'uploadDate', label: 'Upload date' },
        { type: 'string', name: 'thumbnail', label: 'Thumbnail URL' },
        {
          type: 'string',
          name: 'transcript',
          label: 'Transcript',
          description: 'One paragraph per entry. Auto-generated from the captions, so corrections are welcome.',
          list: true,
          ui: { component: 'textarea' },
        },
      ],
    },
  ],
);

const dyslexiaToolkit = singlePage(
  'dyslexiaToolkit',
  'Schools Guide to Dyslexia page',
  'dyslexia-toolkit',
  [
    ...heroFields,
    ctaField('primaryCta', 'Download button'),
    ctaField('secondaryCta', 'Secondary button'),
    { type: 'string', name: 'sessionsHeading', label: 'Skill areas: heading' },
    titledListField('sessions', 'Skill areas'),
    { type: 'string', name: 'whyHeading', label: 'Approach: heading' },
    { type: 'string', name: 'whyBody', label: 'Approach: body', ui: { component: 'textarea' } },
    finalCtaField,
    { type: 'rich-text', name: 'body', label: 'Page content', isBody: true },
  ],
);

const legal: Collection = {
  name: 'legal',
  label: 'Policy and reference pages',
  path: 'src/content/pages',
  format: 'md',
  match: { include: '{privacy,safeguarding,terms,publications}' },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    ...seoFields,
    { type: 'string', name: 'eyebrow', label: 'Small label above the heading' },
    { type: 'string', name: 'heading', label: 'Main heading', required: true },
    { type: 'string', name: 'intro', label: 'Introduction', ui: { component: 'textarea' } },
    {
      type: 'object',
      name: 'links',
      label: 'Links',
      list: true,
      ui: { itemProps: (item: any) => ({ label: item?.label }) },
      fields: [
        { type: 'string', name: 'label', label: 'Text' },
        { type: 'string', name: 'href', label: 'Link' },
      ],
    },
    { type: 'rich-text', name: 'body', label: 'Page content', isBody: true },
  ],
};

const guides: Collection = {
  name: 'guides',
  label: 'Guides',
  path: 'src/content/guides',
  format: 'md',
  fields: [
    ...seoFields,
    { type: 'string', name: 'eyebrow', label: 'Small label above the heading' },
    { type: 'string', name: 'heading', label: 'Main heading', isTitle: true, required: true },
    { type: 'string', name: 'intro', label: 'Introduction', ui: { component: 'textarea' }, required: true },
    {
      type: 'string',
      name: 'summary',
      label: 'Summary for the guides hub card',
      ui: { component: 'textarea' },
      required: true,
    },
    {
      type: 'number',
      name: 'order',
      label: 'Order on the hub page',
      description: 'Lower numbers come first.',
    },
    {
      type: 'string',
      name: 'audience',
      label: 'Colour path',
      options: [
        { value: 'families', label: 'Families, soft pink' },
        { value: 'schools', label: 'Schools, purple' },
        { value: 'business', label: 'Business and legal, deep aubergine' },
        { value: 'neutral', label: 'Neutral' },
      ],
    },
    { type: 'image', name: 'image', label: 'Photo' },
    { type: 'string', name: 'imageAlt', label: 'Photo description for screen readers' },
    { type: 'string', name: 'signsHeading', label: 'First section: heading' },
    titledListField('signs', 'First section: points'),
    { type: 'string', name: 'strategiesHeading', label: 'Second section: heading' },
    titledListField('strategies', 'Second section: points'),
    {
      type: 'number',
      name: 'episode',
      label: 'Related Elevator Series episode',
      description: 'Optional. Adds a link back to the video this grew out of.',
    },
    {
      type: 'boolean',
      name: 'showBook',
      label: 'Show the book promotion',
      description: 'Adds the Literacy Learning Journeys band at the foot of the guide.',
    },
    { type: 'boolean', name: 'draft', label: 'Draft', description: 'Leave on while writing.' },
    { type: 'rich-text', name: 'body', label: 'Main text', isBody: true },
  ],
};

const blog: Collection = {
  name: 'blog',
  label: 'Blog posts',
  path: 'src/content/blog',
  format: 'md',

  fields: [
    { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
    {
      type: 'string',
      name: 'description',
      label: 'Short summary',
      description: 'Shown on the blog index and in search results.',
      ui: { component: 'textarea' },
      required: true,
    },
    { type: 'datetime', name: 'pubDate', label: 'Date', required: true },
    { type: 'image', name: 'image', label: 'Header photo' },
    { type: 'string', name: 'imageAlt', label: 'Photo description for screen readers' },
    {
      type: 'boolean',
      name: 'draft',
      label: 'Draft',
      description: 'Leave switched on while writing. Switch off to publish.',
    },
    { type: 'rich-text', name: 'body', label: 'Post', isBody: true },
  ],
};

export default defineConfig({
  branch,
  clientId,
  token,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      publicFolder: 'public',
      mediaRoot: 'images',
    },
  },
  schema: {
    collections: [
      home,
      assessments,
      whatToExpect,
      guides,
      faq,
      schools,
      research,
      churchill,
      elevatorSeries,
      courses,
      dyslexiaToolkit,
      speaking,
      about,
      book,
      contact,
      blog,
      legal,
      settings,
    ],
  },
});
