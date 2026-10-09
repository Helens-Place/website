# Pre-launch checklist

Everything that must happen before helensplace.co.uk points at Netlify, plus
the temporary scaffolding that has to be taken back out.

Nothing here is optional. Two items will silently break the launch if missed:
the `noindex` header, and the review note on the terms page.

Last updated: 9 October 2026.

## 1. Temporary scaffolding to remove

These were put in deliberately to make review possible. They all have to come
out, and none of them announce themselves.

- [ ] **Remove the `X-Robots-Tag` block from `netlify.toml`.** It currently
      sends `noindex, nofollow` for every page. It exists so the review copy on
      the netlify.app address never reaches Google. Leave it in and the real
      site will never be indexed either, which is the single most expensive
      mistake available here. The block is commented and marked in the file.

- [ ] **Remove the review note from the top of `src/content/pages/terms.md`.**
      It is visible to anyone reading the page and says the cancellation terms
      are unconfirmed proposals.

- [ ] **Tidy the image paths.** TinaCMS rewrites every field on save and mangles
      image paths while doing it, so each page Helen edits gains a value like
      `/images/__staging/content/__filehelen-hero.jpg`. The site renders
      correctly regardless, because `Photo.astro` reduces them to filenames,
      but the repo should not carry them. Run:

          npm run tidy:images

      It also fails if an image is genuinely missing from `public/images`,
      which is a real problem rather than a cosmetic one, and means a CMS upload
      never reached the repo.

- [ ] **Wind up the `content` branch workflow.** Set up so Helen could review
      the whole site while production deploys were paused. Once she is done:
      1. Merge `content` into `main`. This is the deploy that publishes her
         review pass.
      2. Point her back at the CMS on the production URL, `/admin/`, so she
         publishes directly and does not need anyone to merge for her.
      3. Delete the `content` branch.
      4. Turn branch deploys back off in Netlify, under Site configuration,
         Build and deploy, Branches and deploy contexts.

## 2. Needs Helen's sign-off

Content written or rewritten on her behalf, published in her name.

- [ ] **Safeguarding policy.** Rewritten against 2026 guidance and now dated
      August 2026 with review due August 2027. She needs to read and agree it,
      because it is her policy and the dates commit her to reviewing it.

- [ ] **Terms, cancellation sections.** Every notice period and percentage is a
      proposal, not her existing practice. Assessments, research and events all
      needed terms that did not exist before.

- [ ] **FAQ answers.** Drawn from her March 2026 draft rather than written by
      her.

- [ ] **The claims in "Why I assess in person".** The article states that she
      sets aside four to five hours, assesses one young person a day, is booked
      about three months ahead, and returns the report within two weeks. Those
      came from Andrew rather than from Helen, and the same figures now appear
      on /assessments, /what-to-expect and /faq. If any of them is wrong, it is
      wrong in five places at once.

- [ ] **The three new assessment pages.** /assessments/dyscalculia,
      /assessments/exam-access-arrangements and /assessments/students-and-dsa
      were written from facts already on the site plus general knowledge of how
      exam access arrangements and DSA work. Two things in particular need her
      eye: the exam access page says the school must agree to the assessor
      before the assessment, which is the JCQ position as I understand it, and
      the DSA page says her reports meet the standard DSA asks for.

- [ ] **The new "Can you help us with an EHCP?" FAQ.** Built only from facts
      already on the site: EHCP help in family support sessions, reports
      suitable as EHCP evidence, and expert witness work in EHCP and tribunal
      cases. Worth her read, because it now gives EHCP help a headline where
      before it was buried in other answers.

- [ ] **"Private" in the /assessments title.** Added because it is how families
      search. Worth checking she is comfortable with the word.

## 3. Needs a decision

- [ ] **Home address in the privacy policy.** Flagged early and still open. It
      is currently the practice address. Decide whether it should be there at
      all, given it is also where she lives.

- [x] **ADHD disclosure.** Settled by Helen. She now writes "I'm dyslexic and
      have ADHD myself" on /assessments, and the article author note says she
      was diagnosed with ADHD at 44. Carried into the structured data and
      llms.txt to match.

- [x] **Phone number, one everywhere.** Settled: the mobile, 07541 557827, now
      the only number on the site, in the structured data and in llms.txt. Use
      the same number on the Google Business Profile and every directory
      listing, because Google matches name, address and phone across the web
      when ranking local businesses.

- [ ] **Publisher of the Schools Guide to Dyslexia.** Not identified, so
      `dyslexia-toolkit.md` says "hosted by the publisher" and credits nobody.
      Name them, or confirm that is fine.

## Waiting on something else

- [x] **Adult assessments.** Confirmed 9 October 2026: Helen assesses adults.
      The FAQ, the students and DSA page, two articles and src/data/llms.txt all
      say so, and /assessments/adults is the page for the search a competitor
      currently wins.

- [ ] **The adult price.** Set in Site settings > Prices as "from £450", the
      same as children, so the site never shows a figure nobody chose. Change
      it there and every adult price follows. The DSA assessment uses the adult
      price, because DSA is for students heading to or at university.

- [ ] **International work, made specific.** Helen works internationally and
      the site now says so, but the only concrete evidence it gives is the
      Churchill Fellowship fieldwork in Australia and the USA. Named projects
      and countries would do far more for search and for AI answers than the
      word "internationally".

- [ ] **Author notes on the 20 articles.** Each ends with raw HTML for the
      biography. Tina edits article bodies as rich text, and nobody has yet
      saved an article through the CMS, so it is unproven whether that HTML
      survives. Save one article in the CMS and check the bio is still there
      before trusting it. The new assessment pages avoid the question by
      keeping their credentials line in a field instead.

- [ ] **Coaching and mentoring.** Planned, not yet offered. The services
      collection already has a coaching category so these pages can be added
      without rebuilding anything.

## 4. Needs a code or a credential

Verify against **helensplace.co.uk**, never the netlify.app address. The preview
is set to noindex so there would be nothing to report on, and if it ever were
indexed it would compete with the real site as duplicate content.

- [ ] **Google Search Console.** Add `helensplace.co.uk` as a **Domain
      property**, not a URL prefix property, and verify with a **DNS TXT
      record** at the registrar. This works before the domain points at
      Netlify, so do it now rather than at go-live. A domain property also
      covers every subdomain and both http and https at once.

- [ ] **Bing Webmaster Tools.** Sign in and use **Import from Google Search
      Console**. It carries the verification across and takes seconds.

Doing both up front means indexing can start the moment the `noindex` comes
off, rather than the clock starting then.

The `googleSiteVerification` and `bingSiteVerification` fields in
`src/content/settings/site.md` are for the meta tag method instead. They can
only verify once helensplace.co.uk is actually serving the site, so they are a
belt and braces second method rather than the route to take. DNS alone is
enough.

Cloudflare Web Analytics is already live and needs nothing further. The token is
public by design.

## Off the site, and bigger than anything on it

For searches like "best dyslexia assessor Wiltshire", Google shows a map with
three local businesses above the ordinary results. That map comes from Google
Business Profiles and their reviews, not from websites.

- [ ] **Google Business Profile.** Create or claim one for Helen's Place.
      Category close to "Educational consultant", Trowbridge address shown or
      a service area set instead if the home address should stay private,
      the same phone number as the site, and a link to helensplace.co.uk.

- [ ] **Google reviews.** Ask recent families. "Best" searches lean heavily on
      ratings, and without reviews she cannot appear in that map at all.

- [ ] **Links from the places that already trust her.** The Wiltshire Dyslexia
      Association, the British Dyslexia Association assessor directory, the
      Churchill Fellowship site, the University of Bath, Routledge, and every
      podcast she has appeared on. Each should link to helensplace.co.uk, not to
      an old page or to nothing.

## Why launch sooner rather than later

Measured on 9 October 2026, in a test outside this repo. ChatGPT was given what
Helen's site and four local competitors' sites say, and asked 15 questions
families ask, five times each in rotated order. The run was then repeated with
everything identical except Helen's old site in place of the new one.

- New site: Helen first in 53 of 60 fair answers.
- Old site, live today: Helen first in 21 of 60.
- "Who is the best dyslexia assessor in Wiltshire?": old site first 0 times in
  5, new site 5 times in 5.

The old site is what Google and AI assistants read until the domain is pointed
at Netlify. This measures content only, not Google ranking, which also depends
on links, reviews and the Business Profile.

## 5. Go-live order

The sequence matters.

1. Helen finishes her review on the `content` branch.
2. Merge `content` into `main`.
3. Run `npm run tidy:images` and commit the result.
4. Confirm section 2 sign-offs are done.
5. Remove the review note from the terms page.
6. Add the meta tag verification codes, if using them as a backup. The DNS
   verification in section 4 should already be done by this point.
7. Remove the `X-Robots-Tag` block.
8. Point the domain at Netlify.
9. Wind up the branch workflow, section 1.

## 6. Once it is live

- [ ] Confirm `https://helensplace.co.uk` serves and the certificate is valid.
- [ ] Confirm the `noindex` header is gone. `curl -I https://helensplace.co.uk`
      should show no `X-Robots-Tag`.
- [ ] Submit the sitemap, `/sitemap-index.xml`, in Search Console.
- [ ] Spot check the redirects from the old WordPress site. There are 18 in
      `netlify.toml`. `/helen/`, `/ts-and-cs/` and `/support/dyslexia-support/`
      are good samples.
- [ ] Send a test enquiry through the contact form and confirm it arrives in
      Netlify Forms.
- [ ] Confirm Cloudflare Web Analytics is recording against the real hostname
      rather than the netlify.app one.
- [ ] Check Cumulative Layout Shift has moved off Poor. It had three causes,
      all fixed on the review branch: reading preferences applied after first
      paint, the web fonts reflowing the page as they loaded, and the reading
      comfort bar changing height when they did. None of it reaches the live
      site until launch.
