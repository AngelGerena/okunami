// Resellers (partners), shared by okunami-partner, okunami-checkout and okunami-stripe-webhook.
// Each partner's codes also live in the fc_partner_codes table (migration 0025): keep the two in step.

export const PARTNERS: Record<string, { name: string; email: string; card: string; code: string; link: string }> = {
  'hiram-diaz': {
    name: 'Hiram Diaz', email: 'hiramdiazm@gmail.com', card: 'https://hiram-okunami.netlify.app/',
    code: 'HIRAM', link: 'https://okunami.pro/?ref=hiram',
  },
};

/** How long a free signup has to start paying for the sale to count for the reseller. */
export const UPGRADE_WINDOW_DAYS = 92;   // 3 months

/** A code from a link or a form ('hiram', 'HIRAM', 'hiram-diaz') -> the reseller slug, or null. */
export function partnerFor(code: unknown): string | null {
  const c = String(code ?? '').trim().toUpperCase();
  if (!c) return null;
  for (const [slug, p] of Object.entries(PARTNERS)) if (p.code === c || slug.toUpperCase() === c) return slug;
  return null;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Plain email through Resend. Never throws. */
export async function partnerEmail(to: string[], subject: string, lines: string[]) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key || !to.length) return;
  const from = Deno.env.get('OKUNAMI_ALERT_FROM') ?? Deno.env.get('OKUNAMI_WELCOME_FROM') ?? 'OKUNAMI <hello@okunami.pro>';
  await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, reply_to: 'angel@finessemedia.pro', subject, text: lines.join('\n'),
      html: `<div style="max-width:560px;margin:0 auto;padding:24px 18px;font:15px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0B0E2A">${lines.map((l) => `<p style="margin:0 0 10px">${esc(l)}</p>`).join('')}</div>` }),
  }).catch((e) => console.error('partner email failed', e));
}
