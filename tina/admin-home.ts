/**
 * Sends the editor's dashboard address (#/) to the Welcome screen
 * (welcome-screen.tsx), because TinaCMS's own dashboard is fixed text with no
 * setting to replace it. Uses location.replace, so the Back button does not
 * bounce between the two. If TinaCMS changes its addresses, this stops
 * matching and the default dashboard shows instead. Nothing breaks.
 */
export function useWelcomeAsHome() {
  if (typeof window === 'undefined') return;
  const go = () => {
    const h = window.location.hash;
    if (h === '' || h === '#' || h === '#/') {
      window.location.replace(`${window.location.pathname}${window.location.search}#/screens/welcome`);
    }
  };
  go();
  window.addEventListener('hashchange', go);
}
