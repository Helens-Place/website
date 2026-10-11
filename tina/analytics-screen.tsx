/**
 * The Analytics screen in the TinaCMS admin sidebar.
 *
 * It asks /api/analytics (worker/analytics.js) for the figures, sending the
 * TinaCMS sign-in the admin already holds. The Worker confirms that sign-in
 * with TinaCloud before answering, so being signed in to the editor is the
 * whole of the lock. Nothing extra for Helen to remember.
 *
 * Styling is inline, in the site's own colours, because the admin's styles are
 * TinaCMS's and nothing from the site's stylesheet reaches this screen.
 */
import React, { useEffect, useState } from 'react';
import { useCMS } from 'tinacms';

type Row = { key: string | null; views: number; visits: number };
type Data = {
  days: number;
  who: 'people' | 'bots' | 'all';
  botsAvailable: boolean;
  botsError?: string | null;
  range: { since: string; until: string };
  sampleInterval?: number;
  split: { people: { views: number; visits: number }; bots: { views: number; visits: number } } | null;
  totals: { views: number; visits: number };
  daily: Row[];
  pages: Row[];
  referrers: Row[];
  countries: Row[];
  devices: Row[];
  places?: Place[];
  errors: Record<string, string>;
  aiReferrals?: { visits: number; views: number; assistants: Row[] };
};
type Place = { city: string; region: string; country: string; views: number };
type Crawler = { name: string; company: string; why: string; requests: number };
type AiData = {
  days: number;
  total: number;
  crawlers: Crawler[];
  pages: { key: string; requests: number }[];
  errors: Record<string, string>;
};

const C = {
  purple: '#7030A0',
  deep: '#4E1F72',
  tint: '#EEE1F2',
  ink: '#2A1B3D',
  soft: '#5B4B6E',
  line: '#E4D8EC',
  paper: '#FFFFFF',
  pink: '#972B73',
};
const fmt = (n: number) => n.toLocaleString('en-GB');
/* Trowbridge, England for the UK; Lyon, France elsewhere. */
const countryName = (code: string) => {
  try {
    return new Intl.DisplayNames(['en-GB'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
};
const placeName = (p: Place) => {
  const town = p.city || 'Town not known';
  if (!p.country) return town;
  return p.country === 'GB' ? [town, p.region].filter(Boolean).join(', ') : `${town}, ${countryName(p.country)}`;
};
const DEVICE: Record<string, string> = { desktop: 'Computer', mobile: 'Phone', tablet: 'Tablet' };
/* 2026-10-03 as 3 Oct. Anything that is not a plain date is shown as it is. */
const day = (k: string | null) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(k || '');
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : k || '';
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: '18px 20px' }}>
      <h2 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 700, color: C.deep }}>{title}</h2>
      {children}
    </section>
  );
}

/* A ranked list with a bar behind each row, scaled to the largest. */
function Ranked({ rows, label, link, empty, error }: { rows: Row[]; label?: (k: string) => string; link?: boolean; empty: string; error?: string }) {
  // For page rows the key is a path: link to it, but show the home page by name.
  if (error) return <p style={{ color: C.pink, margin: 0 }}>Could not load this: {error}</p>;
  if (!rows.length) return <p style={{ color: C.soft, margin: 0 }}>{empty}</p>;
  const max = Math.max(...rows.map((r) => r.views), 1);
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
      {rows.map((r, i) => {
        const text = label ? label(r.key ?? '') : r.key ?? '';
        const shown = link && text === '/' ? 'Home page' : text;
        return (
          <li key={i} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, width: `${(r.views / max) * 100}%`, background: C.tint }} />
            <span style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 10px', fontSize: 14 }}>
              <span style={{ overflowWrap: 'anywhere', color: C.ink }}>
                {link ? (
                  <a href={text} target="_blank" rel="noopener" style={{ color: C.deep }}>{shown}</a>
                ) : (
                  text
                )}
              </span>
              <span style={{ color: C.soft, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{fmt(r.views)}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* Every day in the period, with the days nobody came shown as nothing rather
   than left out, so the bars line up with the calendar. */
function everyDay(rows: Row[], range: { since: string; until: string }): Row[] {
  const byDay = new Map(rows.map((r) => [(r.key || '').slice(0, 10), r]));
  const out: Row[] = [];
  const end = range.until.slice(0, 10);
  for (let d = new Date(range.since.slice(0, 10) + 'T00:00:00Z'); ; d = new Date(d.getTime() + 86400000)) {
    const key = d.toISOString().slice(0, 10);
    out.push(byDay.get(key) ?? { key, views: 0, visits: 0 });
    if (key >= end || out.length > 120) break;
  }
  return out;
}

/* Visits or page views per day as simple bars. */
function Daily({ rows, error, metric, colour }: { rows: Row[]; error?: string; metric: 'visits' | 'views'; colour: string }) {
  const noun = metric === 'visits' ? 'visits' : 'page views';
  if (error) return <p style={{ color: C.pink, margin: 0 }}>Could not load this: {error}</p>;
  if (!rows.some((r) => r[metric] > 0)) return <p style={{ color: C.soft, margin: 0 }}>No {noun} recorded in this period yet.</p>;
  const max = Math.max(...rows.map((r) => r[metric]), 1);
  const w = 100 / rows.length;
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={`${noun} per day`} style={{ width: '100%', height: 140, display: 'block' }}>
        {rows.map((r, i) => {
          const h = (r[metric] / max) * 38;
          return (
            <rect key={i} x={i * w + w * 0.15} y={40 - h} width={w * 0.7} height={h} fill={colour}>
              <title>{`${day(r.key)}: ${fmt(r[metric])} ${noun}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption style={{ display: 'flex', justifyContent: 'space-between', color: C.soft, fontSize: 12, marginTop: 4 }}>
        <span>{day(rows[0].key)}</span>
        <span>busiest day: {fmt(max)} {noun}</span>
        <span>{day(rows[rows.length - 1].key)}</span>
      </figcaption>
    </figure>
  );
}

export function AnalyticsScreen() {
  const cms = useCMS() as any;
  const [days, setDays] = useState(30);
  // Real people by default: bots and crawlers are rarely what Helen wants to
  // know about, but she can switch to them, or to everyone.
  const [who, setWho] = useState<'people' | 'bots' | 'all'>('people');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const auth = cms?.api?.tina?.authProvider;
        const token = auth?.getAccessToken ? await auth.getAccessToken() : null;
        if (!token) {
          throw new Error('The analytics only show on the live site, when you are signed in to the editor there.');
        }
        const res = await fetch(`/api/analytics?days=${days}&who=${who}`, { headers: { Authorization: `Bearer ${token}` } });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `The analytics could not be loaded (${res.status}).`);
        if (!cancelled) setData(body);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days, who]);

  /* AI services reading the site come from a separate request, so a problem
     there (such as a missing permission) never blanks the rest. */
  const [ai, setAi] = useState<AiData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAiError(null);
      try {
        const auth = cms?.api?.tina?.authProvider;
        const token = auth?.getAccessToken ? await auth.getAccessToken() : null;
        if (!token) throw new Error('Only on the live site.');
        const res = await fetch(`/api/analytics/ai?days=${days}`, { headers: { Authorization: `Bearer ${token}` } });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `Could not be loaded (${res.status}).`);
        if (!cancelled) setAi(body);
      } catch (err: any) {
        if (!cancelled) setAiError(err?.message || String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const pill = (active: boolean) => ({
    padding: '7px 14px',
    borderRadius: 999,
    border: `2px solid ${C.purple}`,
    background: active ? C.purple : C.paper,
    color: active ? C.paper : C.deep,
    fontWeight: 600,
    cursor: 'pointer',
  });
  const button = (n: number) => (
    <button key={n} type="button" onClick={() => setDays(n)} aria-pressed={days === n} style={pill(days === n)}>
      Last {n} days
    </button>
  );
  const WHO = { people: 'Real people', bots: 'Bots', all: 'Everyone' } as const;
  const whoButton = (w: 'people' | 'bots' | 'all') => (
    <button key={w} type="button" onClick={() => setWho(w)} aria-pressed={who === w} style={pill(who === w)}>
      {WHO[w]}
    </button>
  );

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, color: C.ink, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: C.deep }}>Website analytics</h1>
      <p style={{ margin: '0 0 18px', color: C.soft, maxWidth: '70ch' }}>
        How many people visited helensplace.co.uk, which pages they read, and how they found it.
      </p>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
        <div role="group" aria-label="Period" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[7, 30, 90].map(button)}
        </div>
        <div role="group" aria-label="Who to count" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['people', 'bots', 'all'] as const).map(whoButton)}
        </div>
      </div>

      {loading && <p style={{ color: C.soft }}>Loading the figures...</p>}
      {error && !loading && (
        <p role="alert" style={{ background: '#FBEAF3', border: `1px solid ${C.pink}`, color: C.ink, padding: '12px 14px', borderRadius: 8 }}>
          {error}
        </p>
      )}

      {data && !loading && !error && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              ['Visits', data.totals.visits, data.who === 'bots' ? 'Each time a bot came to the site' : 'Each time someone comes to the site'],
              ['Page views', data.totals.views, 'Every page opened, across all visits'],
            ].map(([label, n, note]) => (
              <section key={label as string} style={{ background: C.tint, borderRadius: 12, padding: '16px 20px' }}>
                <p style={{ margin: 0, fontWeight: 600, color: C.deep }}>{label}</p>
                <p style={{ margin: '4px 0', fontSize: 34, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmt(n as number)}</p>
                <p style={{ margin: 0, fontSize: 13, color: C.soft }}>{note}</p>
              </section>
            ))}
          </div>

          {data.split && (
            <Card title="Real people and bots">
              <p style={{ margin: '0 0 10px', color: C.soft, fontSize: 14 }}>
                Bots are automated visitors, such as search engines reading the site and other programs. This shows
                both. The rest of the page shows whichever you pick with the buttons above.
              </p>
              {(() => {
                const total = data.split!.people.views + data.split!.bots.views || 1;
                const share = Math.round((data.split!.people.views / total) * 100);
                return (
                  <>
                    <div aria-hidden="true" style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', background: C.line }}>
                      <span style={{ width: `${share}%`, background: C.purple }} />
                    </div>
                    <p style={{ margin: '10px 0 0', fontSize: 15 }}>
                      <strong>Real people:</strong> {fmt(data.split!.people.visits)} visits, {fmt(data.split!.people.views)} page views
                      <span style={{ color: C.soft }}> ({share}%)</span>
                      <br />
                      <strong>Bots:</strong> {fmt(data.split!.bots.views)} page views
                      <span style={{ color: C.soft }}> ({100 - share}%)</span>
                    </p>
                  </>
                );
              })()}
            </Card>
          )}
          {!data.botsAvailable && (
            <p style={{ margin: 0, color: C.soft, fontSize: 13 }}>
              Cloudflare is not saying which visits are bots at the moment, so these figures include everyone.
              {data.botsError ? ` (Cloudflare said: ${data.botsError})` : ''}
            </p>
          )}
          {(data.sampleInterval ?? 1) > 1.5 && (
            <p style={{ margin: 0, color: C.soft, fontSize: 13, maxWidth: '75ch' }}>
              These are estimates, which is why they are round numbers. Cloudflare keeps every page load for a week,
              then about one in {Math.round(data.sampleInterval!)}, and multiplies back up. The last 7 days are the
              most exact.
            </p>
          )}

          {(() => {
            const days = everyDay(data.daily, data.range);
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                <Card title="Visits per day">
                  <Daily rows={days} metric="visits" colour={C.pink} error={data.errors.daily} />
                </Card>
                <Card title="Page views per day">
                  <Daily rows={days} metric="views" colour={C.purple} error={data.errors.daily} />
                </Card>
              </div>
            );
          })()}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <Card title="Most read pages">
              <Ranked rows={data.pages} link empty="No pages read in this period yet." error={data.errors.pages} />
            </Card>
            <Card title="Where visitors came from">
              <Ranked rows={data.referrers} empty="No outside visits recorded in this period yet." error={data.errors.referrers} />
            </Card>
            <Card title="Countries">
              <Ranked rows={data.countries} empty="Nothing recorded yet." error={data.errors.countries} />
            </Card>
            <Card title="Towns">
              <p style={{ margin: '0 0 10px', color: C.soft, fontSize: 14 }}>
                Pages read from each town, as Cloudflare estimates it from the connection. Real people only, counted from
                11 October 2026. Phones often show up at the network's nearest hub, such as Bristol or London.
              </p>
              <Ranked
                rows={(data.places ?? []).map((p) => ({ key: placeName(p), views: p.views, visits: 0 }))}
                empty="Nothing counted yet. It fills up as people read the site."
                error={data.errors.places}
              />
            </Card>
            <Card title="Devices">
              <Ranked rows={data.devices} label={(k) => DEVICE[k] || k || 'Unknown'} empty="Nothing recorded yet." error={data.errors.devices} />
            </Card>
          </div>

          <h2 style={{ margin: '10px 0 0', fontSize: 22, fontWeight: 800, color: C.deep }}>AI assistants</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <Card title="Visitors sent by AI answers">
              <p style={{ margin: '0 0 10px', color: C.soft, fontSize: 14 }}>
                People who clicked a link to the site in an answer from ChatGPT, Perplexity, Gemini, Copilot or similar.
                Google's own AI Overviews are counted with Google, because they cannot be told apart.
              </p>
              {data.aiReferrals && data.aiReferrals.visits > 0 ? (
                <>
                  <p style={{ margin: '0 0 10px', fontSize: 15 }}>
                    <strong style={{ fontSize: 26, fontVariantNumeric: 'tabular-nums' }}>{fmt(data.aiReferrals.visits)}</strong> visits,{' '}
                    {fmt(data.aiReferrals.views)} pages read
                  </p>
                  <Ranked rows={data.aiReferrals.assistants.map((a) => ({ ...a, views: a.visits }))} empty="" />
                </>
              ) : (
                <p style={{ margin: 0, color: C.soft }}>No visits from AI answers in this period yet.</p>
              )}
            </Card>

            <Card title="AI services reading the site">
              <p style={{ margin: '0 0 10px', color: C.soft, fontSize: 14 }}>
                AI services fetching pages, to answer someone's question, to build their search, or to learn from.
                They do not run the counting script, so they appear only here.
                {ai && ai.days < days ? ` Showing the last ${ai.days} days, the most Cloudflare keeps.` : ''}
              </p>
              {aiError ? (
                <p style={{ margin: 0, color: C.pink }}>Could not load this: {aiError}</p>
              ) : !ai ? (
                <p style={{ margin: 0, color: C.soft }}>Loading...</p>
              ) : ai.errors.crawlers ? (
                <p style={{ margin: 0, color: C.pink }}>Could not load this: {ai.errors.crawlers}</p>
              ) : ai.crawlers.length === 0 ? (
                <p style={{ margin: 0, color: C.soft }}>No AI services recorded in this period.</p>
              ) : (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: C.soft }}>
                        <th style={{ padding: '4px 6px', fontWeight: 600 }}>Service</th>
                        <th style={{ padding: '4px 6px', fontWeight: 600 }}>Doing what</th>
                        <th style={{ padding: '4px 6px', fontWeight: 600, textAlign: 'right' }}>Pages fetched</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ai.crawlers.map((c) => (
                        <tr key={`${c.name}|${c.why}`} style={{ borderTop: `1px solid ${C.line}` }}>
                          <td style={{ padding: '6px' }}>
                            <strong style={{ color: C.deep }}>{c.name}</strong>
                            <span style={{ display: 'block', fontSize: 12, color: C.soft }}>{c.company}</span>
                          </td>
                          <td style={{ padding: '6px' }}>{c.why}</td>
                          <td style={{ padding: '6px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(c.requests)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ai.pages.length > 0 && (
                    <>
                      <h3 style={{ margin: '16px 0 8px', fontSize: 15, color: C.deep }}>The pages they read most</h3>
                      <Ranked rows={ai.pages.map((p) => ({ key: p.key, views: p.requests, visits: 0 }))} link empty="" />
                    </>
                  )}
                </>
              )}
            </Card>
          </div>

          <p style={{ color: C.soft, fontSize: 13, maxWidth: '75ch', margin: '4px 0 0' }}>
            Counted by Cloudflare Web Analytics, which uses no cookies and does not track anyone between sites.
            Visitors who block it, including some school networks, are not counted, so treat these as a guide
            rather than an exact tally.
          </p>
        </div>
      )}
    </div>
  );
}

function ChartIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
    </svg>
  );
}

/* Registered in tina/config.ts through cmsCallback. */
export const analyticsScreen = {
  __type: 'screen' as const,
  name: 'Analytics',
  Component: AnalyticsScreen,
  Icon: ChartIcon,
  layout: 'fullscreen' as const,
  navCategory: 'Site' as const,
};
