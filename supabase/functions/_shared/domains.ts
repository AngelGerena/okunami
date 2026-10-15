// Custom domains for OKUNAMI cards: input cleanup, the DNS + https check, and (optionally) adding the
// domain to the Netlify site automatically.
//
// Optional secrets:
//   NETLIFY_AUTH_TOKEN   a Netlify personal access token. With it, new domains are added to the site for you.
//                        Without it, Angel adds each domain in Netlify > Domain management (the alert says so).
//   NETLIFY_SITE_ID      the okunami site (default below)

/** Where client domains point. Keep in step with DOMAIN_TARGET in src/lib/plans.ts. */
export const DOMAIN_TARGET = 'okunami.netlify.app';
const NETLIFY_LB = '75.2.60.5';   // Netlify's load balancer, for root domains that use an A record
const SITE_ID = () => Deno.env.get('NETLIFY_SITE_ID') ?? 'cf84e6f5-ec1d-4da9-83b7-9932b6883bbc';

/** "https://Vcard.MariaSalon.com/" -> "vcard.mariasalon.com". Returns null when it is not a usable domain. */
export function cleanDomain(input: unknown): string | null {
  const d = String(input ?? '').trim().toLowerCase()
    .replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '').replace(/\.$/, '');
  if (d.length > 200) return null;
  if (!/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(d)) return null;
  if (/(^|\.)(okunami\.pro|finessemedia\.pro|netlify\.app)$/.test(d)) return null;
  return d;
}

async function doh(name: string, type: 'CNAME' | 'A'): Promise<string[]> {
  const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, { headers: { accept: 'application/dns-json' } });
  if (!r.ok) return [];
  const j = await r.json().catch(() => null) as { Answer?: { type: number; data: string }[] } | null;
  return (j?.Answer ?? []).map((a) => String(a.data).toLowerCase().replace(/\.$/, ''));
}

export interface DomainCheck { record: boolean; https: boolean; found: string[]; at: string }

/** Is the client's record in place, and does the domain already serve the card over https? */
export async function checkDomain(domain: string): Promise<DomainCheck> {
  const [cname, a] = await Promise.all([doh(domain, 'CNAME'), doh(domain, 'A')]);
  const record = cname.includes(DOMAIN_TARGET) || a.includes(NETLIFY_LB);
  let https = false;
  if (record) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 8000);
      const r = await fetch(`https://${domain}/`, { method: 'GET', redirect: 'manual', signal: ctl.signal });
      clearTimeout(t);
      https = r.status < 500;   // any real answer over TLS means the certificate works
      await r.body?.cancel();
    } catch { https = false; }   // TLS not ready yet (or Netlify has not been told about the domain)
  }
  return { record, https, found: [...cname, ...a].slice(0, 6), at: new Date().toISOString() };
}

/** Add the domain to the Netlify site so it gets a certificate. Returns false (no harm done) without a token. */
export async function addToNetlify(domain: string): Promise<'added' | 'already' | 'skipped' | 'failed'> {
  const token = Deno.env.get('NETLIFY_AUTH_TOKEN');
  if (!token) return 'skipped';
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const url = `https://api.netlify.com/api/v1/sites/${SITE_ID()}`;
  const g = await fetch(url, { headers: h });
  if (!g.ok) return 'failed';
  const site = await g.json() as { custom_domain?: string; domain_aliases?: string[] };
  const aliases = site.domain_aliases ?? [];
  if (site.custom_domain === domain || aliases.includes(domain)) return 'already';
  // Send the whole list back plus the new one, so no existing domain is ever dropped.
  const p = await fetch(url, { method: 'PATCH', headers: h, body: JSON.stringify({ domain_aliases: [...aliases, domain] }) });
  return p.ok ? 'added' : 'failed';
}

const PROVIDER_NAMES: Record<string, string> = { godaddy: 'GoDaddy', spaceship: 'Spaceship', namecheap: 'Namecheap', squarespace: 'Squarespace', wix: 'Wix', cloudflare: 'Cloudflare', google: 'Google', other: 'Other', unknown: 'Not sure' };
export const providerName = (id: string | null | undefined) => PROVIDER_NAMES[id ?? 'unknown'] ?? 'Not sure';
