/**
 * Structured data for helensplace.co.uk.
 *
 * Two audiences read this: Google, which uses it for rich results and to
 * understand who Helen is, and AI assistants, which lean on schema.org to
 * decide whether a page is a credible source worth citing. Both reward
 * specific, verifiable, cross-linked facts over marketing language.
 *
 * Everything here is stated once, with stable @id values so the pages can
 * reference the same entities rather than redefining them.
 */

export const SITE = 'https://helensplace.co.uk';

export const IDS = {
  business: `${SITE}/#business`,
  person: `${SITE}/#helen`,
  website: `${SITE}/#website`,
};

export const person = {
  '@type': 'Person',
  '@id': IDS.person,
  name: 'Dr Helen Ross',
  givenName: 'Helen',
  familyName: 'Ross',
  honorificPrefix: 'Dr',
  jobTitle: 'Dyslexia specialist, diagnostic assessor and researcher',
  description:
    'Dr Helen Ross is a dyslexia and SEND specialist, AMBDA-qualified diagnostic assessor and published researcher based in Trowbridge, Wiltshire. She is dyslexic herself.',
  url: `${SITE}/about`,
  image: `${SITE}/images/helen-portrait.jpg`,
  email: 'helen@helensplace.co.uk',
  telephone: '+441225766766',
  worksFor: { '@id': IDS.business },
  knowsAbout: [
    'Dyslexia',
    'Dyscalculia',
    'Special educational needs and disabilities',
    'Diagnostic assessment',
    'Exam access arrangements',
    'Inclusive education',
    'Teacher professional development',
    'Qualitative research',
    'SEND expert witness work',
    'Transition from school to adulthood for neurodivergent young people',
  ],
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'University of Bath' },
    { '@type': 'CollegeOrUniversity', name: 'The Open University' },
    { '@type': 'CollegeOrUniversity', name: 'Sheffield Hallam University' },
    { '@type': 'CollegeOrUniversity', name: 'University of Sheffield' },
    { '@type': 'CollegeOrUniversity', name: 'Bath Spa University' },
    { '@type': 'CollegeOrUniversity', name: 'University of Bedfordshire' },
  ],
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      name: 'PhD',
      recognizedBy: { '@type': 'CollegeOrUniversity', name: 'University of Bath' },
    },
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'certification',
      name: 'AMBDA, Associate Member of the British Dyslexia Association (20/AMB04046)',
      recognizedBy: { '@type': 'Organization', name: 'British Dyslexia Association' },
    },
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'certification',
      name: 'AMBDA Dyscalculia (23/AMD05008)',
      recognizedBy: { '@type': 'Organization', name: 'British Dyslexia Association' },
    },
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'certification',
      name: 'Assessment Practising Certificate (23/APC05078)',
    },
  ],
  award: "Churchill Fellowship 2025, supported by The Mercers' Company",
  memberOf: [
    { '@type': 'Organization', name: 'British Dyslexia Association' },
    { '@type': 'Organization', name: 'Wiltshire Dyslexia Association' },
    { '@type': 'Organization', name: 'Chartered College of Teaching' },
    { '@type': 'Organization', name: 'British Educational Research Association' },
    { '@type': 'Organization', name: 'National Education Union' },
  ],
  sameAs: [
    'https://www.linkedin.com/in/helenlouiseross/',
    'https://www.instagram.com/drhelenlouiseross/',
    'https://www.facebook.com/drhelenross',
    'https://twitter.com/drhelenross',
  ],
};

export const business = {
  '@type': ['ProfessionalService', 'LocalBusiness'],
  '@id': IDS.business,
  name: "Helen's Place",
  alternateName: "Helen's Place Education Consultancy",
  description:
    "Helen's Place is the practice of Dr Helen Ross, offering diagnostic dyslexia assessments, exam access arrangements, specialist tutoring, SEND training for schools, and research and expert witness work. Based in Trowbridge, Wiltshire, working in person and online across the UK.",
  slogan: 'Driving positive change for dyslexic people of all ages',
  url: SITE,
  logo: `${SITE}/images/logo.png`,
  image: `${SITE}/images/helen-hero.jpg`,
  email: 'helen@helensplace.co.uk',
  telephone: '+441225766766',
  founder: { '@id': IDS.person },
  employee: { '@id': IDS.person },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Trowbridge',
    addressRegion: 'Wiltshire',
    addressCountry: 'GB',
  },
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Wiltshire' },
    { '@type': 'AdministrativeArea', name: 'South West England' },
    { '@type': 'Country', name: 'United Kingdom' },
  ],
  availableLanguage: ['en-GB'],
  priceRange: '££',
  sameAs: person.sameAs,
  knowsAbout: person.knowsAbout,
};

/** Services, with the real prices. Google shows these; assistants quote them. */
export const services = [
  {
    name: 'Full diagnostic dyslexia assessment',
    description:
      'A diagnostic assessment of reading, writing, spelling, phonological processing, working memory and processing speed, producing a written report accepted by schools and exam boards.',
    price: '450',
    unit: 'assessment',
    url: `${SITE}/assessments`,
  },
  {
    name: 'Exam access arrangements assessment',
    description:
      'Assessment determining whether a student qualifies for exam accommodations such as extra time, a reader, a scribe or use of a laptop.',
    price: '180',
    unit: 'assessment',
    url: `${SITE}/assessments`,
  },
  {
    name: 'Family support and advice',
    description:
      'Sessions for parents and carers covering the assessment process, the school system, EHCP processes and next steps.',
    price: '50',
    unit: 'hour',
    url: `${SITE}/assessments`,
  },
  {
    name: 'Specialist literacy, dyslexia and mathematics tuition',
    description:
      'Online specialist tuition for learners in KS2, KS3 and KS4, using structured, multi-sensory approaches.',
    price: '45',
    unit: 'hour',
    url: `${SITE}/assessments`,
  },
  {
    name: 'Half-day INSET and CPD for schools',
    description:
      'Practical, research-grounded training on dyslexia, dyscalculia and SEND, delivered in your setting.',
    price: '200',
    unit: 'session',
    url: `${SITE}/schools`,
  },
  {
    name: 'Research, consultancy and SEND expert witness work',
    description:
      'Qualitative research design and analysis, methodology consultation, evidence review, and expert witness reports in SEND and dyslexia matters including EHCP and tribunal contexts.',
    price: '450',
    unit: 'day',
    url: `${SITE}/research-and-expert-witness`,
  },
];

export const offerCatalog = {
  '@type': 'OfferCatalog',
  name: "Services from Helen's Place",
  itemListElement: services.map((s) => ({
    '@type': 'Offer',
    priceSpecification: {
      '@type': 'PriceSpecification',
      price: s.price,
      priceCurrency: 'GBP',
      valueAddedTaxIncluded: true,
      description: `From £${s.price} per ${s.unit}, including VAT`,
    },
    itemOffered: {
      '@type': 'Service',
      name: s.name,
      description: s.description,
      url: s.url,
      provider: { '@id': IDS.business },
      areaServed: { '@type': 'Country', name: 'United Kingdom' },
    },
  })),
};

/** Breadcrumbs help both Google and assistants place a page in the site. */
export const breadcrumbs = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${SITE}${item.path === '/' ? '' : item.path}`,
  })),
});
