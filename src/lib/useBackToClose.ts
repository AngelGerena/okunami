import { useEffect, useRef } from 'react';

const FLAG = '__okOverlay';

/** While a pop-up is open, the phone's Back button (or the browser's) closes the pop-up instead of leaving the page.
    Opening adds one history entry with the same address; closing any other way (X, Escape, tapping outside)
    removes that entry again, so history never fills up with closed pop-ups.
    Pass `active` for pop-ups that stay mounted and toggle; leave it out for ones that mount only while open. */
export function useBackToClose(onClose: () => void, active = true) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!active) return;
    const id = Math.random().toString(36).slice(2);
    let pushed = false;
    let popped = false;
    const onPop = () => {
      if ((window.history.state as Record<string, unknown> | null)?.[FLAG] === id) return;
      popped = true;
      close.current();
    };
    // Deferred one tick so React's development double-mount does not stack two entries.
    const t = window.setTimeout(() => {
      try {
        window.history.pushState({ ...((window.history.state as object | null) ?? {}), [FLAG]: id }, '');
        pushed = true;
        window.addEventListener('popstate', onPop);
      } catch { /* history unavailable (sandboxed frame): Back simply leaves, as before */ }
    }, 0);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('popstate', onPop);
      // Closed by X, Escape or a tap outside: take our entry back off so Back keeps its normal meaning.
      if (pushed && !popped && (window.history.state as Record<string, unknown> | null)?.[FLAG] === id) window.history.back();
    };
  }, [active]);
}

/** True when the current history entry is a pop-up's entry (used to replace it when a pop-up leads to a new page). */
export const onOverlayEntry = () => !!(window.history.state as Record<string, unknown> | null)?.[FLAG];
