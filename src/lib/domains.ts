import { IS_DEMO, supabase } from './supabase';
import { setCardDomain } from './links';
import { friendlyPaymentError } from './payErrors';

/* Your own domain for a card (Pro Plus and Business). The browser only reads its row and asks the
   okunami-domain edge function to act: prices, plan checks and status changes all happen on the server. */

export type DomainMethod = 'diy' | 'hookup' | 'register';
export type DomainStatus = 'pending_payment' | 'requested' | 'waiting_dns' | 'checking_ssl' | 'connected';
export interface CardDomain {
  id: string;
  domain: string;
  method: DomainMethod;
  provider: string | null;
  status: DomainStatus;
  last_checked_at: string | null;
  connected_at: string | null;
}
export interface DomainRequest { cardId: string; domain: string; method: DomainMethod; provider: string; phone?: string }

/** The domain companies the walkthrough has steps for. */
export const PROVIDERS = [
  { id: 'godaddy', name: 'GoDaddy' },
  { id: 'spaceship', name: 'Spaceship' },
  { id: 'namecheap', name: 'Namecheap' },
  { id: 'squarespace', name: 'Squarespace' },
  { id: 'wix', name: 'Wix' },
  { id: 'cloudflare', name: 'Cloudflare' },
  { id: 'other', name: 'Other' },
] as const;
export type ProviderId = typeof PROVIDERS[number]['id'];

/** "https://Vcard.MariaSalon.com/" -> "vcard.mariasalon.com". Same rules as the server. */
export function cleanDomain(input: string): string | null {
  const d = input.trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '').replace(/\.$/, '');
  if (!/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(d)) return null;
  if (/(^|\.)(okunami\.pro|finessemedia\.pro|netlify\.app)$/.test(d)) return null;
  return d;
}
/** The part before the root domain: "vcard" for vcard.mariasalon.com, "@" for a root domain. */
export const hostLabel = (domain: string) => { const parts = domain.split('.'); return parts.length > 2 ? parts.slice(0, -2).join('.') : '@'; };
export const rootOf = (domain: string) => domain.split('.').slice(-2).join('.');

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('okunami-domain', { body });
  if (error) {
    let reason = '';
    try { const ctx = (error as { context?: Response }).context; const j = ctx ? await ctx.json() : null; reason = j?.error ?? ''; } catch { /* no body */ }
    throw new Error(reason || friendlyPaymentError(error.message));
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

/* ------------------------------------------------------------ demo (lives in this browser only) */
const DEMO_KEY = 'fc.demo.domains';
const demoAll = (): Record<string, CardDomain & { checks: number }> => { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || '{}'); } catch { return {}; } };
const demoSave = (v: Record<string, CardDomain & { checks: number }>) => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(v)); } catch { /* blocked */ } };

export const domainApi = {
  /** This card's domain, if it has one (canceled ones are hidden). */
  async mine(cardId: string, slug?: string): Promise<CardDomain | null> {
    if (IS_DEMO) {
      const d = demoAll()[cardId] ?? null;
      if (slug) setCardDomain(slug, d?.status === 'connected' ? d.domain : null);
      return d;
    }
    const { data, error } = await supabase.rpc('fc_domain_for_card', { p_card: cardId });
    if (error) throw new Error(error.message);
    const row = (Array.isArray(data) ? data[0] : data) as CardDomain | null;
    const d = row?.id ? row : null;
    if (slug) setCardDomain(slug, d?.status === 'connected' ? d.domain : null);
    return d;
  },

  /** Save a request. Paid choices return a Stripe Checkout link to open. */
  async request(r: DomainRequest): Promise<{ url?: string; status?: DomainStatus }> {
    if (IS_DEMO) {
      const all = demoAll();
      const status: DomainStatus = r.method === 'diy' ? 'waiting_dns' : 'requested';
      all[r.cardId] = { id: 'demo', domain: r.domain, method: r.method, provider: r.provider, status, last_checked_at: null, connected_at: null, checks: 0 };
      demoSave(all);
      return { status };
    }
    return call({ action: 'request', ...r });
  },

  /** Look up the record and the https lock now. */
  async check(cardId: string, slug?: string): Promise<DomainStatus | 'none'> {
    if (IS_DEMO) {
      const all = demoAll(); const d = all[cardId];
      if (!d) return 'none';
      d.checks += 1; d.last_checked_at = new Date().toISOString();
      d.status = d.checks >= 2 ? 'connected' : 'checking_ssl';
      if (d.status === 'connected') d.connected_at = d.last_checked_at;
      demoSave(all);
      if (slug) setCardDomain(slug, d.status === 'connected' ? d.domain : null);
      return d.status;
    }
    const res = await call<{ status: DomainStatus | 'none'; domain?: string }>({ action: 'check', cardId });
    if (slug) setCardDomain(slug, res.status === 'connected' ? res.domain : null);
    return res.status;
  },

  /** Stop using the domain. The okunami.pro link keeps working. */
  async cancel(cardId: string, slug?: string): Promise<void> {
    if (IS_DEMO) { const all = demoAll(); delete all[cardId]; demoSave(all); }
    else { const { error } = await supabase.rpc('fc_domain_cancel', { p_card: cardId }); if (error) throw new Error(error.message); }
    if (slug) setCardDomain(slug, null);
  },
};
