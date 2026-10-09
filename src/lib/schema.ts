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
  jobTitle: 'Dyslexia and dyscalculia specialist, diagnostic assessor and researcher',
  description:
    'Dr Helen Ross is an internationally recognised dyslexia and dyscalculia specialist, AMBDA-qualified diagnostic assessor and published researcher based in Trowbridge, Wiltshire, who works across the UK and internationally. She is Chair of the Wiltshire Dyslexia Association, a former Trustee of the British Dyslexia Association and a 2025 Churchill Fellow. She is dyslexic and has ADHD herself.',
  url: `${SITE}/about`,
  image: `${SITE}/images/helen-portrait.jpg`,
  email: 'helen@helensplace.co.uk',
  telephone: '+447541557827',
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
  ],
};

export const business = {
  '@type': ['ProfessionalService', 'LocalBusiness'],
  '@id': IDS.business,
  name: "Helen's Place",
  alternateName: "Helen's Place Education Consultancy",
  description:
    "Helen's Place is the practice of Dr Helen Ross, offering private diagnostic dyslexia and dyscalculia assessments, assessments for Disabled Students' Allowance, exam access arrangements, specialist tutoring, SEND training for schools, and research and expert witness work. Based in Trowbridge, Wiltshire. Diagnostic assessments are always carried out in person, and tutoring and family support are available online across the UK.",
  slogan: 'Driving positive change for dyslexic people of all ages',
  url: SITE,
  logo: `${SITE}/images/logo.png`,
  image: `${SITE}/images/helen-hero.jpg`,
  email: 'helen@helensplace.co.uk',
  telephone: '+447541557827',
  founder: { '@id': IDS.person },
  employee: { '@id': IDS.person },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Trowbridge',
    addressRegion: 'Wiltshire',
    addressCountry: 'GB',
  },
  areaServed: [
    ...['Trowbridge', 'Bradford on Avon', 'Westbury', 'Melksham', 'Warminster', 'Frome', 'Devizes', 'Bath']
      .map((name) => ({ '@type': 'City', name })),
    { '@type': 'AdministrativeArea', name: 'Wiltshire' },
    { '@type': 'AdministrativeArea', name: 'South West England' },
    { '@type': 'Country', name: 'United Kingdom' },
  ],
  availableLanguage: ['en-GB'],
  priceRange: '££',
  sameAs: person.sameAs,
  knowsAbout: person.knowsAbout,
};

/** Services. Prices come from Site settings > Prices, never typed here. Google
    shows these; assistants quote them. */
export const services = [
  {
    name: 'Full diagnostic dyslexia and dyscalculia assessment',
    description:
      'A diagnostic assessment of reading, writing, spelling, phonological processing, working memory and processing speed, and of number sense and calculation where dyscalculia is a concern, in one assessment for one fee. Carried out in person, one young person a day. The price includes the full written report within two weeks, accepted by schools and exam boards, and a follow-up conversation about the findings.',
    priceName: 'Full diagnostic assessment',
    url: `${SITE}/assessments`,
  },
  {
    name: 'Exam access arrangements assessment',
    description:
      'Assessment determining whether a student qualifies for exam accommodations such as extra time, a reader, a scribe or use of a laptop.',
    priceName: 'Exam access arrangements',
    url: `${SITE}/assessments/exam-access-arrangements`,
  },
  {
    name: 'Full diagnostic dyslexia and dyscalculia assessment for adults',
    description:
      'A diagnostic assessment for adults who have never been assessed, covering reading, writing, spelling, phonological processing, working memory and processing speed, and dyscalculia where needed, in one assessment for one fee. In person in Trowbridge, with the full written report within two weeks.',
    priceName: 'Full diagnostic assessment for adults',
    url: `${SITE}/assessments/adults`,
  },
  {
    name: "Diagnostic assessment for Disabled Students' Allowance",
    description:
      "A full diagnostic assessment for students heading to or already at university, written to the standard a Disabled Students' Allowance application needs.",
    priceName: 'Full diagnostic assessment for adults',
    url: `${SITE}/assessments/students-and-dsa`,
  },
  {
    name: 'Family support and advice',
    description:
      'Sessions for parents and carers covering the assessment process, the school system, EHCP processes and next steps.',
    priceName: 'Family support and advice',
    url: `${SITE}/assessments`,
  },
  {
    name: 'Specialist literacy, dyslexia and mathematics tuition',
    description:
      'Online specialist tuition for learners in KS2, KS3 and KS4, using structured, multi-sensory approaches.',
    priceName: 'Tuition',
    url: `${SITE}/assessments`,
  },
  {
    name: 'Half-day INSET and CPD for schools',
    description:
      'Practical, research-grounded training on dyslexia, dyscalculia and SEND, delivered in your setting.',
    priceName: 'Half-day INSET',
    url: `${SITE}/schools`,
  },
  {
    name: 'Research, consultancy and SEND expert witness work',
    description:
      'Qualitative research design and analysis, methodology consultation, evidence review, and expert witness reports in SEND and dyslexia matters including EHCP and tribunal contexts.',
    priceName: 'Research and consultancy',
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
      /* Markers, filled in from Site settings > Prices as the page is built.
         See src/lib/prices.ts. */
      price: `[amount: ${s.priceName}]`,
      priceCurrency: 'GBP',
      valueAddedTaxIncluded: true,
      description: `[price: ${s.priceName}], including VAT`,
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
