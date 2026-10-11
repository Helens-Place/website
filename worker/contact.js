/**
 * The contact form's backend, served at /api/contact by the Worker in
 * worker/index.js. It replaced Netlify Forms when the site moved to Cloudflare.
 *
 * What it does, in order:
 *  1. A filled-in honeypot means a bot. Pretend it worked and send nothing.
 *  2. Check the required fields.
 *  3. Check the Cloudflare Turnstile token, if Turnstile is configured.
 *  4. Email the enquiry to Helen through Resend, with Reply-To set to the
 *     person who wrote, so pressing Reply answers them.
 *  5. Send the visitor to /thank-you.
 *
 * Whatever goes wrong after step 1, the visitor gets a page that says so, shows
 * them their own message to copy, and gives Helen's email and phone. A form
 * that silently drops an enquiry is the worst thing this site could do, so it
 * never claims success it did not have.
 *
 * Settings:
 *   RESEND_API_KEY        secret, set in the dashboard (Variables and secrets)
 *   TURNSTILE_SECRET_KEY  secret, likewise
 *   CONTACT_FROM          in wrangler.jsonc
 *   CONTACT_TO            optional, in wrangler.jsonc, defaults to Helen below
 */

/* These mirror Site settings. The function cannot read the site's content
   files, so if Helen's email or phone ever changes, change them here too. */
const HELEN_EMAIL = 'helen@helensplace.co.uk';
const HELEN_PHONE = '07541 557827';

const LIMITS = { name: 200, email: 254, phone: 50, organisation: 200, enquiry: 100, message: 10000 };
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const seeOther = (location) => new Response(null, { status: 303, headers: { Location: location } });

function problemPage(reason, fields, status = 400) {
  const message = fields.message ? escapeHtml(fields.message) : '';
  const body = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Your message has not been sent | Helen's Place</title>
<style>
  body { font-family: system-ui, sans-serif; line-height: 1.6; color: #2a1b3d; background: #fbf8fc; margin: 0; padding: 2rem 1rem; }
  main { max-width: 40rem; margin: 0 auto; }
  h1 { font-size: 1.6rem; line-height: 1.25; }
  .box { background: #fff; border: 2px solid #e4d8ec; border-radius: 12px; padding: 1rem 1.2rem; }
  textarea { width: 100%; min-height: 10rem; font: inherit; padding: .7rem; border: 2px solid #e4d8ec; border-radius: 8px; box-sizing: border-box; }
  a { color: #5b2a86; }
</style>
</head>
<body>
<main>
  <h1>Sorry, your message has not been sent</h1>
  <p>${escapeHtml(reason)}</p>
  <div class="box">
    <p><strong>Please email me directly at <a href="mailto:${HELEN_EMAIL}">${HELEN_EMAIL}</a>, or ring ${HELEN_PHONE}.</strong> I reply within 48 hours.</p>
    ${message ? `<p>Here is what you wrote, so you can copy it into an email:</p><textarea readonly>${message}</textarea>` : ''}
  </div>
  <p><a href="/contact">Back to the contact page</a></p>
</main>
</body>
</html>`;
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function turnstilePasses(token, secret, ip) {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  if (!res.ok) return false;
  const data = await res.json();
  return data.success === true;
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.formData();
  } catch {
    return problemPage('The form did not arrive in a form I could read.', {});
  }
  const get = (k) => String(data.get(k) ?? '').trim();

  // 1. Honeypot. Bots fill every field; people never see this one.
  if (get('bot-field')) return seeOther('/thank-you');

  const fields = {
    name: get('name'),
    email: get('email'),
    phone: get('phone'),
    organisation: get('organisation'),
    enquiry: get('enquiry'),
    message: get('message'),
  };

  // 2. Required fields and sensible lengths.
  if (!fields.name || !fields.email || !fields.enquiry || !fields.message) {
    return problemPage('Some of the required fields were empty.', fields);
  }
  if (!EMAIL_SHAPE.test(fields.email)) {
    return problemPage('The email address does not look quite right, so I would not be able to reply.', fields);
  }
  for (const [k, max] of Object.entries(LIMITS)) {
    if (fields[k].length > max) return problemPage('One of the fields was longer than the form allows.', fields);
  }

  // 3. Turnstile, when configured.
  if (env.TURNSTILE_SECRET_KEY) {
    let ok = false;
    try {
      ok = await turnstilePasses(get('cf-turnstile-response'), env.TURNSTILE_SECRET_KEY, request.headers.get('CF-Connecting-IP'));
    } catch {
      ok = false;
    }
    if (!ok) {
      return problemPage(
        'The website could not confirm the message came from a person. This sometimes happens on school or work networks that block the check.',
        fields,
        403,
      );
    }
  }

  // 4. Send it.
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM) {
    console.error('contact: RESEND_API_KEY or CONTACT_FROM is not set');
    return problemPage('The contact form is not set up properly at the moment.', fields, 500);
  }

  const lines = [`Name: ${fields.name}`, `Email: ${fields.email}`];
  if (fields.phone) lines.push(`Phone: ${fields.phone}`);
  if (fields.organisation) lines.push(`School or organisation: ${fields.organisation}`);
  lines.push(`About: ${fields.enquiry}`, '', fields.message);

  const html = `<table cellpadding="4" style="font-family:sans-serif;font-size:15px">
${[['Name', fields.name], ['Email', fields.email], ['Phone', fields.phone], ['School or organisation', fields.organisation], ['About', fields.enquiry]]
  .filter(([, v]) => v)
  .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top">${k}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`)
  .join('\n')}
</table>
<p style="font-family:sans-serif;font-size:15px;white-space:pre-wrap">${escapeHtml(fields.message)}</p>
<p style="font-family:sans-serif;font-size:13px;color:#666">Sent from the contact form on helensplace.co.uk. Reply to this email to answer ${escapeHtml(fields.name)} directly.</p>`;

  let sent = false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO || HELEN_EMAIL],
        reply_to: fields.email,
        subject: `Website enquiry: ${fields.enquiry}, from ${fields.name}`,
        text: lines.join('\n'),
        html,
      }),
    });
    sent = res.ok;
    if (!res.ok) console.error('contact: Resend returned', res.status, await res.text());
  } catch (err) {
    console.error('contact: Resend request failed', err);
  }

  if (!sent) {
    return problemPage('Something went wrong sending your message on my side.', fields, 502);
  }

  // 5. Done.
  return seeOther('/thank-you');
}

// Anyone opening /api/contact directly is sent to the contact page.
export function onRequestGet() {
  return seeOther('/contact');
}
