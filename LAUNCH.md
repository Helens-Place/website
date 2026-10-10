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

- [ ] **Fill in and remove the review note at the top of
      `src/content/pages/privacy.md`.** The policy was rewritten in October
      2026. It has three visible placeholders in square brackets: the ICO
      registration number, the email provider, and two retention periods.
      Search the file for `[` before launch. A placeholder left in a privacy
      policy is a compliance problem, not just an untidy page.

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
      Andrew has since supplied the references (Durrant, 2026, and Akinde,
      2026), so both are now on /publications and back in the summary. The draft also gave the book's title as
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

- [ ] **Final review changes, October 2026.** The homepage credentials strip
      now opens with her assessor qualification and adds "Dyslexic, with ADHD,
      myself" and "Qualified to assess dyscalculia, which many dyslexia
      assessors are not", and merges the House of Commons and Council for
      Science and Technology items into one. The families card now says she
      assesses children, teenagers and adults, with dyscalculia included for
      one fee. /assessments says the dyscalculia qualification is one many
      assessors lack, and the adults page mentions Access to Work. Eleven
      meta descriptions were shortened to fit in search results.

- [ ] **Travel and Moon Hall.** Wherever the site lists the towns within half
      an hour, it now adds that people travel from the Midlands, London, the
      Home Counties, the South East and abroad, and that she also assesses at
      Moon Hall Assessment Centre in Reigate, linking to her profile there.
      Worth checking she is happy to be booked via Moon Hall from this site,
      and that the regions named are ones she wants to draw from.

- [ ] **"Private" in the /assessments title.** Added because it is how families
      search. Worth checking she is comfortable with the word.

## 3. Needs a decision

- [x] **Home address in the privacy policy.** Settled by Helen in October
      2026: she removed it and gave her email address instead. The rewritten
      policy keeps it that way.

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

### What the DNS looked like, 10 October 2026

Checked before the move, because it changes the order of everything.

- **Nameservers:** Just Host Me (`dns1`-`dns4.justhostme.net`).
- **Website:** the apex A record is `51.195.234.92`, the old WordPress site.
- **Helen's email is on that same server.** The MX record points at
  `helensplace.co.uk` itself, and `mail`, `webmail`, `www` and others are
  CNAMEs to the apex. So pointing the apex at Cloudflare would take her email
  with it. Mail must get its own A record first.
- **SPF** `v=spf1 ip4:51.195.234.92 +a +mx +ip4:54.36.160.184 +ip4:54.36.160.53 ~all`,
  a **DKIM** key at `default._domainkey`, and **DMARC** `v=DMARC1; p=none;`.
- **No Google Search Console TXT record yet** (section 4 not done).
- **Keep the Just Host Me account.** It hosts Helen's email. Cancelling it
  when the old website goes would cancel her mailbox too.

### In Helen's Cloudflare account (Andrew)

Use Helen's account, not Andrew's, so the site is hers.

- [ ] **Turnstile widget.** Turnstile, Add widget, name "Helen's Place
      contact form", hostnames `helensplace.co.uk` and `pages.dev` (so
      previews work), mode Managed. Keep the **site key** and **secret key**.
- [ ] **Pages project.** Workers & Pages, Create, Pages, Connect to Git,
      `Helens-Place/website`. Production branch `main`, framework preset
      none, build command `npm run tina:build`, output directory `dist`.
- [ ] **Variables**, for Production and Preview alike:
      `NODE_VERSION` = `22.12.0`; `TINA_CLIENT_ID` and `TINA_TOKEN` (as in
      Netlify); `PUBLIC_TURNSTILE_SITE_KEY` (the site key);
      `CONTACT_FROM` = `Helen's Place website <enquiries@send.helensplace.co.uk>`.
      As **secrets** (encrypted): `TURNSTILE_SECRET_KEY` and `RESEND_API_KEY`.
      Variables only reach a build made after they were added, so retry the
      deployment once they are in.
- [ ] **Build watch paths.** Exclude `README.md`, `LAUNCH.md`, `scripts/*`,
      `.claude/*` and `.gitignore`, replacing the Netlify `ignore` rule.
- [ ] **TinaCloud site URL.** In TinaCloud, project configuration, add the
      `*.pages.dev` address (and later `https://helensplace.co.uk`), or
      Helen's login to `/admin` will be refused there.

### Resend, in Helen's name (Andrew)

- [ ] Sign up at resend.com with Helen's email. Add the domain
      **`send.helensplace.co.uk`**, a subdomain, so nothing about the apex
      or Helen's existing mail changes. Resend lists a few DNS records (an MX
      and TXT for bounces and SPF on the subdomain, and a DKIM TXT). Add them
      wherever the DNS lives at the time, then press Verify in Resend.
- [ ] Create an API key with sending access only, and paste it into the Pages
      project as the `RESEND_API_KEY` secret.

### In the repo (done 10 October 2026)

- [x] `functions/api/contact.js`: checks the honeypot, the fields and
      Turnstile, emails Helen through Resend with Reply-To set to the sender,
      and on any failure shows the visitor their message to copy with Helen's
      email and phone. Every path was tested with the network stubbed.
- [x] The form posts to `/api/contact`; Turnstile shows only when
      `PUBLIC_TURNSTILE_SITE_KEY` is set, in interaction-only mode.
- [x] `public/_redirects` (the 18 old WordPress redirects, each with and
      without its trailing slash) and `public/_headers` (including the
      noindex block, marked REMOVE AT GO-LIVE).
- [x] Pages are built as `about.html` so Cloudflare serves `/about` without
      a trailing-slash redirect, and canonical URLs now match the site's links
      and the sitemap (they had been `/about/`).
- [x] `tina/config.ts` reads `CF_PAGES_BRANCH`.
- [x] Privacy policy names Cloudflare, Turnstile, Resend and Just Host Me.
- [ ] Remove `netlify.toml` once the Cloudflare build is confirmed.
- [ ] Note: the contact form no longer works on Netlify deploys. Netlify is
      not serving the real domain, so nothing live is affected.

### Testing on the preview address, before any DNS change

- [ ] The `content` branch preview builds and loads.
- [ ] `/helen/`, `/privacy-policy` and `/blog/anything` redirect correctly.
- [ ] `/about` loads without redirecting to `/about/`.
- [ ] Response headers include `X-Robots-Tag: noindex, nofollow` (still
      wanted, until go-live).
- [ ] `/admin` opens and Helen can sign in and save a word.
- [ ] **A real enquiry** from the contact form arrives in Helen's inbox, and
      pressing Reply addresses the sender. Then one from a phone.

### Moving the DNS and the domain (go-live, Andrew)

Order matters, because of Helen's email.

1. **Add the site to Helen's Cloudflare account** (Add a domain, Free plan).
   Let it import the existing records, then **check them against the list
   above** before going further.
2. **Fix mail in the Cloudflare DNS before switching nameservers:**
   `mail` becomes an **A record** to `51.195.234.92` (not a CNAME), the MX
   points to `mail.helensplace.co.uk`, and `webmail`, `cpanel`,
   `autodiscover` and `ftp` become A records to `51.195.234.92`. All of
   these **DNS only** (grey cloud). Keep SPF, DKIM and DMARC exactly as they
   are. Add the Resend records and the Google Search Console TXT record.
3. **Change the nameservers** at the registrar to the two Cloudflare gives.
   Wait for Cloudflare to say the site is active.
4. **Send Helen a test email from outside** and have her reply, to prove mail
   still works, before touching the website records.
5. **Certificate settings** (from the section below): Google Trust Services,
   minimum TLS 1.2, HSTS off, Bot Fight Mode off.
6. **Connect the domain** to the Pages project (Custom domains:
   `helensplace.co.uk` and `www.helensplace.co.uk`). This replaces the apex
   and www records with ones pointing at Pages.
7. Then the rest of the go-live order in section 5.

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

### Keeping it reachable from school networks

Teachers will often visit from inside a school web filter. Filters judge the
domain and its category, not the host, and Cloudflare serves a large share of
the web, schools' own sites included, so the move itself changes nothing for
them. What can catch a school out is Cloudflare's own security set too high.

- [ ] **Leave Bot Fight Mode off and the security level at its default.**
      A whole school shares one internet address, and many filters inspect
      and re-sign encrypted traffic, which can look like a bot. Turned up,
      Cloudflare would show those teachers a challenge page or block them.
      A static site needs none of it. Turnstile goes on the contact form only.
- [ ] **Check the domain's category with the main school filter vendors**
      (Smoothwall, Netsweeper, Fortinet FortiGuard, Palo Alto, Cisco Talos,
      Lightspeed). Each has a free lookup. helensplace.co.uk is not a new
      domain, so it should already be categorised; ask for Education or
      Reference wherever it is not.
- [ ] **Certificate: choose Google Trust Services.** The usual school
      HTTPS trouble with free certificates is Let's Encrypt. Its chain has
      changed more than once, and filters that inspect encrypted traffic often
      carry an old list of trusted authorities, so they reject the site or show
      teachers a warning. Cloudflare's free certificate can come from Google
      Trust Services instead, whose chain also leads back to a long-established
      GlobalSign root that old filters still trust. Set it under SSL/TLS, Edge
      Certificates, Universal SSL, Certificate Authority, before connecting the
      domain.
- [ ] **Minimum TLS version 1.2, not 1.3.** Some older school proxies cannot
      speak 1.3. 1.2 is still secure.
- [ ] **Leave HSTS off at launch.** It is a good setting, but it removes the
      option to click past a certificate warning, so if a school filter does
      object, its teachers are locked out entirely rather than warned. Turn it
      on later, once schools have been using the site without complaint.
- [ ] **Run the SSL Labs test** at ssllabs.com/ssltest on helensplace.co.uk
      once it is connected. Expect an A, and no "Chain issues". An incomplete
      chain is the classic cause of a site that works at home but fails behind
      a school filter even when the address has been allowed.
- [ ] **Test from a real school.** Once live, ask a SENCo Helen knows to open
      the site, the contact form and the Schools Guide download from their
      school network.
- **Expect lower analytics counts from schools.** Some filters block the
      Cloudflare analytics script, so visits from school networks will be
      undercounted. The site still works. The Elevator Series videos come from
      Vimeo, which some schools block wherever the site is hosted.

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
