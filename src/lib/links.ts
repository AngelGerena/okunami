import type { Address, CardData } from './types';

export const digits = (s: string) => s.replace(/\D/g, '');
export const telHref = (phone: string) => (phone ? `tel:+${digits(phone).length === 10 ? '1' + digits(phone) : digits(phone)}` : '');
export const waHref = (num: string, msg = '') => (num ? `https://wa.me/${digits(num).length === 10 ? '1' + digits(num) : digits(num)}${msg ? `?text=${encodeURIComponent(msg)}` : ''}` : '');
export const addressLine = (a: Address) => [a.street, a.city, [a.region, a.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
export const mapsHref = (a: Address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine(a))}`;
export const webHref = (u: string) => (!u ? '' : /^https?:\/\//i.test(u) ? u : `https://${u}`);
export const prettyUrl = (u: string) => u.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');

export function formatPhone(p: string): string {
  const d = digits(p).replace(/^1(?=\d{10}$)/, '');
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p;
}

export function publicOrigin(): string {
  return (import.meta.env.VITE_PUBLIC_ORIGIN as string | undefined) ?? window.location.origin;
}

/* Cards connected to their owner's own domain (vcard.theirsite.com). Filled in when a card or its domain
   is loaded, so the QR code, Share button and copy-link use that domain. The okunami.pro link keeps working too. */
const connected = new Map<string, string>();
export function setCardDomain(slug: string, domain: string | null | undefined) {
  if (!slug) return;
  if (domain) connected.set(slug, domain); else connected.delete(slug);
}
export const cardDomain = (slug: string): string | undefined => connected.get(slug);

export function cardUrl(data: CardData): string {
  const own = connected.get(data.slug);
  return own ? `https://${own}` : `${publicOrigin()}/${data.slug}`;
}

/** True when the page is being served on a client's own domain rather than on OKUNAMI itself. */
export function isClientHost(host = window.location.hostname): boolean {
  const h = host.toLowerCase();
  if (!h || h === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(h) || h === '[::1]') return false;
  if (h.endsWith('.netlify.app') || h === 'okunami.pro' || h.endsWith('.okunami.pro')) return false;
  const set = import.meta.env.VITE_PUBLIC_ORIGIN as string | undefined;   // only the configured origin, never the current page
  try { if (set && h === new URL(set).hostname) return false; } catch { /* bad origin setting */ }
  return true;
}
