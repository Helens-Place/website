# Deploying helensplace.co.uk

Two separate things get set up here, and it is worth doing them in this order:

1. **Netlify**, which builds and hosts the site. Do this first and review the
   shadow site.
2. **TinaCloud**, which lets Helen edit the live site. Do this second, once the
   site itself is agreed.

The real domain is pointed at Netlify **last**, only once the shadow site has
been reviewed and approved.

---

## 1. Netlify, the shadow site

You have a Netlify account but nothing set up on it yet. This is the whole
first pass.

### Connect the repo

1. Log in at [app.netlify.com](https://app.netlify.com).
2. **Add new site** → **Import an existing project**.
3. Choose **GitHub**. Netlify asks for authorisation.
4. **This is the step people get wrong.** When GitHub asks which account to
   install Netlify on, choose the **Helens-Place organisation**, not just your
   personal `drajross` account. If you only authorise the personal account,
   the `Helens-Place/website` repo will not appear in the list.
   If you miss it, fix it at GitHub → Settings → Applications → Netlify →
   Configure, then grant access to the Helens-Place org.
5. Pick **Helens-Place/website**.
6. Netlify reads `netlify.toml` from the repo, so the build settings fill in
   automatically:

   | Setting | Value |
   |---|---|
   | Build command | `npm run build` |
   | Publish directory | `dist` |
   | Node version | 22.12.0 |

   Leave them as they are.
7. **Deploy**.

The first build takes two or three minutes. Netlify gives the site a random
name like `elegant-marzipan-a1b2c3.netlify.app`. That URL is the shadow site.
Rename it to something readable under **Site configuration → Change site name**,
for example `helens-place-preview`.

### Every push rebuilds

From now on, any push to `main` rebuilds and redeploys automatically. Pull
requests get their own preview URL.

### Turn on the contact form

The contact form uses Netlify Forms, which needs nothing in code. Netlify
detects the form in the built HTML on first deploy.

1. After the first successful deploy, go to **Forms** in the site menu.
2. You should see a form called `contact`. If the Forms tab says forms are not
   enabled, enable form detection under **Site configuration → Forms** and
   trigger a redeploy.
3. Set up **Form notifications** → **Email notification** so submissions go to
   `helen@helensplace.co.uk`. Without this, submissions sit in the dashboard
   and nobody gets told about them.
4. Send a test message through the live form and confirm it arrives.

The form posts to `/thank-you`, which is a real page on the site.

---

## 2. TinaCloud, so Helen can edit

Skip this until the site content is agreed. Local editing with
`npm run tina:dev` works without any of it.

1. Sign up at [app.tina.io](https://app.tina.io) and create a project pointing
   at the `Helens-Place/website` repo, branch `main`.
2. Copy the **Client ID** and generate a **read only token**.
3. In Netlify, go to **Site configuration → Environment variables** and add:

   | Key | Value |
   |---|---|
   | `TINA_CLIENT_ID` | the Client ID from Tina |
   | `TINA_TOKEN` | the read only token from Tina |

4. Change the Netlify build command to `npm run tina:build`. Either edit
   `netlify.toml` in the repo, or override it under **Build & deploy**.
5. Redeploy.
6. Helen edits at `https://<the site URL>/admin/index.html`, logging in with
   the Tina account she is invited to.

When Helen presses publish, Tina commits the change to the repo, which triggers
a Netlify rebuild. The change is live a couple of minutes later. Because every
edit is a commit, anything can be undone.

---

## 3. The custom domain, last

**Do not do this until the shadow site is reviewed and approved.** Pointing the
domain is the moment the new site replaces the old one for real visitors.

The domain is managed at Inios.

1. In Netlify: **Domain management** → **Add a domain** → `helensplace.co.uk`.
2. Netlify shows the DNS records it needs. Using Netlify's own nameservers is
   the simpler route, but it moves all DNS for the domain, **including email**.
   Before changing anything, write down the existing MX records and any TXT
   records such as SPF and DKIM, or Helen's email will stop working.
3. The lower risk option is to keep DNS at Inios and add records there:

   | Type | Name | Points to |
   |---|---|---|
   | A | `@` | `75.2.60.5` |
   | CNAME | `www` | the site's `.netlify.app` address |

   Netlify shows the exact values to use. Take them from the dashboard rather
   than from this table, in case they have changed.
4. Wait for DNS to propagate, which is usually minutes but can be up to 24 hours.
5. Netlify provisions a free Let's Encrypt certificate automatically. Confirm
   HTTPS works, then enable **Force HTTPS**.

### Before you point the domain

- [x] Real photos and the logo in place
- [x] Privacy, safeguarding and terms pages carry Helen's real wording
- [x] The course link points at Dr Sarah Moseley's platform
- [x] Redirects in place for the old WordPress URLs
- [ ] Every page reviewed and approved by Helen
- [ ] Safeguarding policy reviewed. It is dated 13 November 2019 and was due for
      review in November 2020, so it is overdue and references an old edition of
      Keeping Children Safe in Education
- [ ] Privacy policy checked against how the new site actually works
- [ ] Contact form tested end to end
- [ ] Existing MX and TXT records recorded, so email survives the DNS change

### Old URLs

Redirects for the previous WordPress site are already configured in
`netlify.toml`. They were taken from the live site's own navigation rather than
guessed:

| Old URL | Goes to |
|---|---|
| `/helen/` | `/about` |
| `/support/` and its children | `/assessments` |
| `/working-together/` | `/schools` |
| `/working-together/research/` | `/research-and-expert-witness` |
| `/working-together/speaker-and-corporate/` | `/speaking` |
| `/books-publications-and-blog/` | `/book` |
| `/literacy-learning-journeys/` | `/book` |
| `/publications-and-media/` | `/publications` |
| `/privacy-policy/` | `/privacy` |
| `/safeguarding-policy/` | `/safeguarding` |
| `/ts-and-cs/` | `/terms` |
| `/feed/` | `/blog` |

`/contact/`, `/courses/` and `/blog/` keep the same addresses, so they need no
redirect.

Redirects only take effect once the site is live on Netlify. They cannot be
tested with `npm run dev`.
