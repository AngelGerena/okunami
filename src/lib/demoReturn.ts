/* Demo pages open from the landing page. Closing a demo goes back in history (it never stacks a new landing entry),
   so the phone's back button walks the visitor out of the site instead of replaying old demos.
   The landing page remembers where the visitor was and puts them back on the same design tile. */
const KEY = 'okunami:landing-scroll';

/** State attached to every landing -> demo link, so the demo knows a back step lands on the landing page. */
export const FROM_LANDING = { from: 'landing' } as const;

export function rememberLandingScroll() {
  try { sessionStorage.setItem(KEY, String(Math.round(window.scrollY))); } catch { /* private mode: nothing to restore */ }
}

/** Read and clear the saved position (null when the visitor did not come back from a demo). */
export function takeLandingScroll(): number | null {
  try {
    const v = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return v === null ? null : Number(v) || 0;
  } catch { return null; }
}
