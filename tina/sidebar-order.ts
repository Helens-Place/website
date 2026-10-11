/**
 * Shows the sidebar's Site section (Analytics, Site settings) above the list of
 * pages. TinaCMS draws Collections first and Site second and has no setting to
 * change that, so this reorders them on screen with CSS `order`, which the
 * sidebar's flex column honours. Nothing in the page is moved or removed, so
 * React's own rendering is untouched.
 *
 * It finds the section by its heading text, "Site". If a TinaCMS update
 * renames or restructures the sidebar, this simply stops matching and the
 * sidebar falls back to TinaCMS's own order. Nothing breaks.
 */
export function putSiteSectionFirst() {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;

  const apply = () => {
    document.querySelectorAll('h4').forEach((heading) => {
      if (heading.textContent?.trim() !== 'Site') return;
      const column = heading.parentElement;
      if (!column || getComputedStyle(column).display !== 'flex') return;
      const list = heading.nextElementSibling as HTMLElement | null;
      // Anything TinaCMS puts above the sections, such as its announcements
      // banner, stays above them.
      const first = column.firstElementChild as HTMLElement | null;
      if (first && first !== heading && first.tagName !== 'H4' && first.style.order !== '-2') first.style.order = '-2';
      if (heading.style.order !== '-1') heading.style.order = '-1';
      if (list && list.style.order !== '-1') list.style.order = '-1';
    });
  };

  apply();
  // The sidebar is drawn after the CMS loads, and again when it is reopened.
  new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
}
