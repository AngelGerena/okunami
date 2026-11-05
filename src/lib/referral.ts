import { supabase, IS_DEMO } from './supabase';

/* Reseller referrals. A reseller shares okunami.pro/?ref=hiram (or the person types the code HIRAM when signing up).
   This browser remembers the code for 90 days. Once the person has an account, the code is sent to the server once
   (fc_claim_referral), and to checkout as a backup. The server decides whether it counts. */

const KEY = 'okunami.ref';
const DAYS = 90;
const MS = DAYS * 864e5;
const valid = (c: string) => /^[A-Za-z0-9-]{2,40}$/.test(c);

function readCookie(): string | null {
  try { const m = document.cookie.match(/(?:^|;\s*)okunami_ref=([^;]+)/); return m ? decodeURIComponent(m[1]) : null; } catch { return null; }
}

/** Saves a code (from a link or the signup form). Last one wins until the account is tagged. */
export function rememberRef(code: string): void {
  const c = code.trim().toUpperCase();
  if (!valid(c)) return;
  const rec = JSON.stringify({ code: c, at: Date.now() });
  try { localStorage.setItem(KEY, rec); } catch { /* storage blocked */ }
  try { document.cookie = `okunami_ref=${encodeURIComponent(rec)}; max-age=${DAYS * 86400}; path=/; samesite=lax`; } catch { /* cookies blocked */ }
}

/** The remembered code, if it is less than 90 days old. */
export function getRef(): string | null {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch { /* storage blocked */ }
  raw = raw ?? readCookie();
  if (!raw) return null;
  try {
    const { code, at } = JSON.parse(raw) as { code?: string; at?: number };
    if (!code || !valid(code) || !at || Date.now() - at > MS) return null;
    return code;
  } catch { return null; }
}

export function forgetRef(): void {
  try { localStorage.removeItem(KEY); } catch { /* storage blocked */ }
  try { document.cookie = 'okunami_ref=; max-age=0; path=/'; } catch { /* cookies blocked */ }
}

/** Runs on every page load: picks up ?ref= from the address. */
export function captureRef(): void {
  try {
    const q = new URLSearchParams(window.location.search).get('ref');
    if (q) rememberRef(q);
  } catch { /* no window */ }
}

let claiming = false;
/** Signed in with a remembered code: tag the account once. Any answer but a network error clears the code. */
export async function claimRef(): Promise<void> {
  if (IS_DEMO || claiming) return;
  const code = getRef();
  if (!code) return;
  claiming = true;
  try {
    const { data, error } = await supabase.rpc('fc_claim_referral', { p_code: code });
    if (!error && typeof data === 'string') forgetRef();   // ok, already, invalid or too_late: nothing more to do
  } catch { /* try again next visit */ } finally { claiming = false; }
}
