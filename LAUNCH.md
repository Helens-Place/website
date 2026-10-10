# Pre-launch checklist

Everything that must happen before helensplace.co.uk points at Netlify, plus
the temporary scaffolding that has to be taken back out.

Nothing here is optional. Two items will silently break the launch if missed:
the `noindex` header, and the review note on the terms page.

Last updated: 9 October 2026.

## 1. Temporary scaffolding to remove

These were put in deliberately to make review possible. They all have to come
out, and none of them announce themselves.

- [ ] **Remove the `X-Robots-Tag` block from `netlify.toml`** (from
      `public/_headers` once the site has moved to Cloudflare). It currently
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
         Build and deploy, Branches and deploy contexts. After the move to
         Cloudflare, delete the Netlify site instead.

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

- [ ] **Search-phrase additions, October 2026.** Added because families search
      in these words and the site never used them:
      - two new FAQs, "How do I get my child tested for dyslexia?" and "Do I
        need an educational psychologist, or is a specialist assessor enough?"
        The second says reports from either are accepted by schools, for exam
        access arrangements and for DSA. That is the general position, but
        Helen should confirm she is happy saying it.
      - JCQ and Form 8 named on the exam access page.
      - SASC named on the DSA page.
      - Corsham and Chippenham added to the "within about half an hour" towns
        and to the structured data. Both are roughly 20 to 30 minutes by road.
        Take them out if she would rather not draw from there.

- [ ] **Research page wording, October 2026.** The title now leads with
      "Dyslexia and SEND research", and the intro and offer say she works with
      charities, technology companies, local authorities and policymakers in
      the UK and internationally, and offers independent EdTech evaluation,
      citing the OrCam paper. Worth her read for anything she would put
      differently.

- [ ] **Eight research, consultancy and expert witness FAQs, October 2026.**
      Built from what the research page, the EdTech evaluation article and the
      terms already say. Two need her particular eye: the EdTech answer says
      every project agrees in writing up front what happens to negative
      results, which is the principle her article argues for, stated here as
      her practice; and the expert witness answers say fees and terms are
      agreed in writing before work begins, matching the terms page.

- [ ] **The new /research page.** Her plain-English research summary, from a
      Claude chat draft. Every figure and quote was checked against the papers,
      the APPG report and her Churchill report before it went on. Two things
      from the draft were left out because nothing could be found to support
      them: chapters "on SEND for early career teachers and on race and SEND".
      If they exist, send the references and they go on /publications and
      back into the summary. The draft also gave the book's title as
      "Dyslexia Across the Ages"; the page uses Routledge's title.

- [ ] **Seven publications still have no link.** Nothing could be found
      online for them: the PATOSS Bulletin article (2024), "No Woman is an
      Island" (2023), the BDA Contact magazine piece on Swindon (2022), the two
      BDA parents' guide and handbook chapters (2021), and the UKEdChat and
      QuickFIRE conference papers (2021). If Helen has copies she is happy to
      share, they could be uploaded to the site and linked.

- [ ] **Two papers added to /publications.** Found on her ORCID record but
      missing from the site: the 2025 Education 3-13 paper with Malone and
      Wood, the 2023 Climate Capability Scale paper in Sustainability, and the
      2025 Child and Adolescent Mental Health commentary with Kucirkova and
      others, which the EdTech article cites but the list did not have, the
      2025 Pastoral Care in Education paper with Wood and Malone, and her PhD
      thesis. The parents paper in the British Journal of Special Education
      is now dated 2019, as the journal has it, rather than 2018.
      Worth checking there are no others she has published that ORCID does
      not know about either.

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

### For research and consultancy

Organisations looking for a researcher check her academic footprint, and AI
assistants use it to decide who she is. The site now names her ORCID iD
(0000-0002-3827-9954) and describes each paper with a DOI as hers. The other
end needs doing by Helen:

- [ ] **Her ORCID record.** It lists her papers but has no websites on it.
      Add helensplace.co.uk and her LinkedIn under "Websites and social
      links", and Helen's Place under employment. That two-way link is how a
      machine confirms the site and the researcher are the same person.

- [ ] **Google Scholar profile.** If she has not got one, create it at
      scholar.google.com with the same papers and a link to helensplace.co.uk.
      Research buyers look her up there first.

- [ ] **Links from co-authors and partners.** The You and CO2 project,
      her co-authors' university pages, the National Coalition of Independent
      Scholars, OrCam, the Council for Science and Technology review, and the
      Churchill Fellowship report page.

- [ ] **What Helen could tell us, to strengthen the page.** The international
      projects she is working on now (countries, organisations, what she did),
      and for expert witness work: roughly how many reports, which tribunals,
      any expert witness training, and turnaround times. Solicitors search for
      "SEND expert witness" specifically, so with those facts expert witness
      work could have a page of its own, as the assessments now do.

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

## Moving to Cloudflare, between the review and go-live

Decided 10 October 2026. Once Helen has finished her review, the site moves
from Netlify to Cloudflare Pages, and only then is helensplace.co.uk connected.

**Why.** Netlify's free plan meters every production deploy, which is why
review edits have been parked on the `content` branch. Cloudflare Pages does
not charge per deploy, so once live Helen can save as often as she likes. It
also gives every branch its own preview address, as Netlify does now. The
analytics move is not the reason: Cloudflare Web Analytics already works on
Netlify.

**Do not start before the review ends.** Netlify also reads `_redirects` and
`_headers` files, so adding them while Netlify is still serving the review copy
would leave two sets of rules fighting.

### In the Cloudflare dashboard (Andrew)

No connector available to Claude can create a Pages project, so these are
clicks.

- [ ] **Create the Pages project.** Workers & Pages, Create, Pages, Connect to
      Git, `Helens-Place/website`. Production branch `main`, build command
      `npm run tina:build`, output directory `dist`.
- [ ] **Environment variables**, for both Production and Preview:
      `NODE_VERSION` = `22.12.0`, `TINA_CLIENT_ID`, `TINA_TOKEN`. The same
      values as in Netlify. Scope them to Preview too, or branch builds fail
      with "Missing clientId", as they did on Netlify.
- [ ] **Build watch paths.** Exclude `README.md`, `scripts/*`, `.claude/*` and
      `.gitignore`. This replaces the `ignore` rule in `netlify.toml`, so a
      commit that only changes notes does not trigger a build.
- [ ] **Where the domain's DNS lives.** If helensplace.co.uk's DNS can move to
      Cloudflare, connecting the domain is a couple of clicks. Cloudflare's
      import copies existing records across, but check the Google Search
      Console TXT record (section 4) and any email records (MX, SPF, DKIM)
      arrived before switching nameservers, or verification and Helen's email
      both break.

### In the repo (Claude)

- [ ] **Branch name for Tina.** `tina/config.ts` reads the branch from
      Netlify's `HEAD`. Add Cloudflare's `CF_PAGES_BRANCH`, or every preview
      build edits `main` in TinaCloud.
- [ ] **Redirects.** Move the 18 redirects from `netlify.toml` into
      `public/_redirects`, one line each: `/helen/ /about 301`.
- [ ] **Headers.** Move the header rules into `public/_headers`, including
      the `X-Robots-Tag: noindex, nofollow` block, which still has to come off
      at go-live.
- [ ] **Contact form.** The one real piece of work. It uses Netlify Forms,
      which Cloudflare has no equivalent of. Replace it with a Pages Function
      that checks the submission with Cloudflare Turnstile (free spam
      protection) and emails it to Helen, keeping the same fields, the
      honeypot and the `/thank-you` redirect. Then send a real test enquiry
      from the preview address and confirm it reaches Helen's inbox. A form
      that silently drops enquiries is the worst failure this site could have.
- [ ] **Remove `netlify.toml`** once the Cloudflare build is confirmed, so
      there is one source of truth.
- [ ] **Update the privacy policy.** It names the host and how contact form
      submissions are processed. Both change.

### The analytics page in the admin area (option 2)

Helen gets an Analytics page inside the editing screen she already uses, next
to her pages and Site settings, rather than a separate Cloudflare login.

- [ ] **A custom screen in TinaCMS** (Tina's screen plugin, registered in
      `tina/config.ts`) showing the last 30 days: visitors and page views,
      top pages, where visitors came from, and devices.
- [ ] **A Pages Function at `/api/analytics`** that fetches those figures
      from Cloudflare's GraphQL Analytics API. It holds a read-only API token,
      stored as a Cloudflare secret. The token must never reach the browser.
- [ ] **Lock it with Cloudflare Access.** Tina's login protects Tina's own
      content API, not code we add, so `/api/analytics` needs its own lock.
      An Access policy allowing only Helen's (and Andrew's) email, with a
      one-time code sent to that address and a session of about a month, so
      it is not a daily chore. Free for this many users.
- [ ] **Check it locked.** Open `/api/analytics` in a private window and
      confirm it asks for the code rather than returning figures.

## 5. Go-live order

The sequence matters.

1. Helen finishes her review on the `content` branch.
2. Merge `content` into `main`.
3. Run `npm run tidy:images` and commit the result.
4. Confirm section 2 sign-offs are done.
5. Move to Cloudflare, the section above: the Pages project, the repo
   changes, and the contact form, tested with a real enquiry.
6. Add the analytics page and check it is locked.
7. Remove the review note from the terms page.
8. Add the meta tag verification codes, if using them as a backup. The DNS
   verification in section 4 should already be done by this point.
9. Remove the `X-Robots-Tag` block, from `public/_headers` by then.
10. Point the domain at the Cloudflare Pages project.
11. Wind up the branch workflow, section 1, and the Netlify site.

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
