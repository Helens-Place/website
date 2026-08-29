# Pre-launch checklist

Everything that must happen before helensplace.co.uk points at Netlify, plus
the temporary scaffolding that has to be taken back out.

Nothing here is optional. Two items will silently break the launch if missed:
the `noindex` header, and the review note on the terms page.

Last updated: 29 August 2026.

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

## 3. Needs a decision

- [ ] **Home address in the privacy policy.** Flagged early and still open. It
      is currently the practice address. Decide whether it should be there at
      all, given it is also where she lives.

- [ ] **ADHD disclosure.** Deliberately left out. Her call whether it goes in.

- [ ] **Publisher of the Schools Guide to Dyslexia.** Not identified, so
      `dyslexia-toolkit.md` says "hosted by the publisher" and credits nobody.
      Name them, or confirm that is fine.

## 4. Needs a code or a credential

- [ ] **`googleSiteVerification`** in `src/content/settings/site.md`, from
      Google Search Console.
- [ ] **`bingSiteVerification`**, same file, from Bing Webmaster Tools.

Get both verified before the domain is pointed, so indexing starts the moment
the `noindex` comes off rather than days later.

Cloudflare Web Analytics is already live and needs nothing further. The token is
public by design.

## 5. Go-live order

The sequence matters.

1. Helen finishes her review on the `content` branch.
2. Merge `content` into `main`.
3. Run `npm run tidy:images` and commit the result.
4. Confirm section 2 sign-offs are done.
5. Remove the review note from the terms page.
6. Add the Search Console and Bing verification codes.
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
- [ ] Check Cumulative Layout Shift has moved off Poor. It was 1.0, caused by
      reading preferences being applied after first paint, fixed in `1e2b4fa`.
      That fix has not reached the live site yet, because deploys were paused
      when it was pushed.
