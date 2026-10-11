/**
 * The page Helen lands on after signing in to the editor, in place of
 * TinaCMS's "Welcome to Tina!". TinaCMS has no setting for its dashboard, so
 * this is a screen of our own, and admin-home.ts sends the dashboard address
 * here. If a TinaCMS update ever stops that working, Helen sees the default
 * page again and nothing else changes.
 *
 * Shortcuts use the same addresses as the sidebar (#/collections/<name>/~),
 * which open a single page's editor directly.
 */
import React, { useEffect, useState } from 'react';
import { useCMS } from 'tinacms';

const C = {
  purple: '#7030A0',
  deep: '#4E1F72',
  tint: '#EEE1F2',
  ink: '#2A1B3D',
  soft: '#5B4B6E',
  line: '#E4D8EC',
  paper: '#FFFFFF',
};
const fmt = (n: number) => n.toLocaleString('en-GB');

const SHORTCUTS: { label: string; note: string; href: string; external?: boolean }[] = [
  { label: 'Home page', note: 'The first page most people see', href: '#/collections/home/~' },
  { label: 'Assessments', note: 'Services, how it works, prices shown', href: '#/collections/assessments/~' },
  { label: 'Questions and answers', note: 'The FAQ page', href: '#/collections/faq/~' },
  { label: 'Prices and contact details', note: 'Site settings: every price is set here', href: '#/collections/settings/~' },
  { label: 'Articles', note: 'Edit an article or add a new one', href: '#/collections/articles/~' },
  { label: 'About me', note: 'Your story and credentials', href: '#/collections/about/~' },
  { label: 'Analytics', note: 'Who has been visiting', href: '#/screens/analytics' },
  { label: 'View the website', note: 'helensplace.co.uk, in a new tab', href: 'https://helensplace.co.uk', external: true },
];

function ThisWeek() {
  const cms = useCMS() as any;
  const [figures, setFigures] = useState<{ visits: number; views: number } | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'unavailable'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const auth = cms?.api?.tina?.authProvider;
        const token = auth?.getAccessToken ? await auth.getAccessToken() : null;
        if (!token) throw new Error('no sign-in');
        const res = await fetch('/api/analytics?days=7&who=people', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(String(res.status));
        const body = await res.json();
        if (!cancelled) {
          setFigures(body.totals);
          setState('ok');
        }
      } catch {
        if (!cancelled) setState('unavailable');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section style={{ background: C.tint, borderRadius: 14, padding: '18px 22px', display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center' }}>
      <div style={{ flex: '1 1 220px' }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.deep }}>The last 7 days</h2>
        <p style={{ margin: '4px 0 0', color: C.soft, fontSize: 14 }}>Real people visiting helensplace.co.uk</p>
      </div>
      {state === 'ok' && figures ? (
        <>
          <p style={{ margin: 0 }}>
            <span style={{ display: 'block', fontSize: 32, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmt(figures.visits)}</span>
            <span style={{ color: C.soft, fontSize: 13 }}>visits</span>
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ display: 'block', fontSize: 32, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmt(figures.views)}</span>
            <span style={{ color: C.soft, fontSize: 13 }}>pages read</span>
          </p>
        </>
      ) : (
        <p style={{ margin: 0, color: C.soft }}>{state === 'loading' ? 'Loading...' : 'The figures are not available just now.'}</p>
      )}
      <a href="#/screens/analytics" style={{ color: C.deep, fontWeight: 700 }}>
        See all the analytics
      </a>
    </section>
  );
}

export function WelcomeScreen() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, color: C.ink, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <p style={{ margin: 0, color: C.soft, fontWeight: 600 }}>{today}</p>
      <h1 style={{ margin: '4px 0 6px', fontSize: 32, fontWeight: 800, color: C.deep }}>{greeting}, Helen</h1>
      <p style={{ margin: '0 0 24px', color: C.soft, maxWidth: '65ch' }}>
        This is where you edit helensplace.co.uk. Choose something below, or pick any page from the menu on the left.
      </p>

      <div style={{ display: 'grid', gap: 22 }}>
        <ThisWeek />

        <section>
          <h2 style={{ margin: '0 0 12px', fontSize: 19, fontWeight: 700, color: C.deep }}>Shortcuts</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
            {SHORTCUTS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  {...(s.external ? { target: '_blank', rel: 'noopener' } : {})}
                  style={{
                    display: 'block',
                    height: '100%',
                    boxSizing: 'border-box',
                    padding: '14px 16px',
                    background: C.paper,
                    border: `1px solid ${C.line}`,
                    borderLeft: `5px solid ${C.purple}`,
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: C.ink,
                  }}
                >
                  <span style={{ display: 'block', fontWeight: 700, color: C.deep }}>{s.label}</span>
                  <span style={{ display: 'block', fontSize: 13, color: C.soft, marginTop: 2 }}>{s.note}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: '18px 22px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 19, fontWeight: 700, color: C.deep }}>Good to know</h2>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8, lineHeight: 1.55 }}>
            <li>
              <strong>Saving publishes.</strong> A change is live on the website about three minutes after you press
              Save. Refresh the page to see it.
            </li>
            <li>
              <strong>Prices live in one place.</strong> Change them under <a href="#/collections/settings/~" style={{ color: C.deep }}>Site settings</a>, Prices,
              and every page follows. Elsewhere you will see markers like [price: Booking deposit]. Leave those as they are.
            </li>
            <li>
              <strong>Nothing is lost.</strong> Every save is recorded, so an earlier version of any page can always be
              put back. Ask Andrew.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function HomeIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" {...props}>
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" strokeLinejoin="round" />
    </svg>
  );
}

/* Registered in tina/config.ts through cmsCallback. */
export const welcomeScreen = {
  __type: 'screen' as const,
  name: 'Welcome',
  Component: WelcomeScreen,
  Icon: HomeIcon,
  layout: 'fullscreen' as const,
  navCategory: 'Site' as const,
};
