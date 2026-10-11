/**
 * Marks this browser as Helen's (or Andrew's), so their own visits to the
 * public site are left out of the analytics. Opening the editor sets the mark;
 * src/components/Analytics.astro checks it before loading either counting
 * script. It lives in this browser only: a different browser or device is
 * counted until the editor has been opened there once.
 */
export const DONT_COUNT_KEY = 'hp-dont-count';

export function dontCountThisBrowser() {
  try {
    window.localStorage.setItem(DONT_COUNT_KEY, '1');
  } catch {
    /* Storage refused (private browsing): visits are counted, which is fine. */
  }
}
