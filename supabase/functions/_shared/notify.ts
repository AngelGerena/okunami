// Alerts to Angel: an email (Resend) and a WhatsApp message from Paloma's Twilio number.
// Every channel is optional. A missing secret skips that channel and never throws, so an alert
// can never break a checkout or a webhook.
//
// Secrets (Supabase > Edge Functions > Secrets):
//   RESEND_API_KEY            already used by okunami-welcome
//   OKUNAMI_ALERT_EMAIL       where alerts go (default angel@finessemedia.pro)
//   OKUNAMI_ALERT_FROM        sender (default "OKUNAMI <hello@okunami.pro>")
//   TWILIO_ACCOUNT_SID        Twilio Console home page
//   TWILIO_AUTH_TOKEN         Twilio Console home page (keep secret)
//   TWILIO_WA_TEMPLATE_SID    the approved "domain hookup" WhatsApp template (starts with HX)
//   TWILIO_WA_FROM            default whatsapp:+13214555380 (Paloma's number)
//   OKUNAMI_ALERT_WHATSAPP    default whatsapp:+14079609004 (Angel)

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export interface AlertResult { email: string; whatsapp: string }

async function email(subject: string, lines: string[], link?: { href: string; label: string }): Promise<string> {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return 'skipped (no RESEND_API_KEY)';
  const to = Deno.env.get('OKUNAMI_ALERT_EMAIL') ?? 'angel@finessemedia.pro';
  const from = Deno.env.get('OKUNAMI_ALERT_FROM') ?? Deno.env.get('OKUNAMI_WELCOME_FROM') ?? 'OKUNAMI <hello@okunami.pro>';
  const p = (s: string) => `<p style="margin:0 0 12px;font:15px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1C2640">${esc(s)}</p>`;
  const btn = link ? `<p style="margin:18px 0 0"><a href="${esc(link.href)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#1C2640;color:#fff;text-decoration:none;font:700 14px -apple-system,Segoe UI,Helvetica,Arial,sans-serif">${esc(link.label)}</a></p>` : '';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text: [...lines, link ? `${link.label}: ${link.href}` : ''].join('\n'), html: `<div style="max-width:520px;margin:0 auto;padding:24px 18px">${lines.map(p).join('')}${btn}</div>` }),
  });
  return res.ok ? 'sent' : `failed (Resend ${res.status})`;
}

async function whatsapp(vars: Record<string, string>): Promise<string> {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const token = Deno.env.get('TWILIO_AUTH_TOKEN');
  const template = Deno.env.get('TWILIO_WA_TEMPLATE_SID');
  if (!sid || !token || !template) return 'skipped (Twilio secrets not set)';
  const from = Deno.env.get('TWILIO_WA_FROM') ?? 'whatsapp:+13214555380';
  const to = Deno.env.get('OKUNAMI_ALERT_WHATSAPP') ?? 'whatsapp:+14079609004';
  // Template variables cannot be empty, and WhatsApp rejects new lines inside them.
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) clean[k] = (v || '-').replace(/\s+/g, ' ').trim().slice(0, 200);
  const body = new URLSearchParams({ From: from, To: to, ContentSid: template, ContentVariables: JSON.stringify(clean) });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${sid}:${token}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  return res.ok ? 'sent' : `failed (Twilio ${res.status}: ${(await res.text()).slice(0, 160)})`;
}

/** Tell Angel a client needs him. Never throws. */
export async function alertAngel(a: { subject: string; lines: string[]; link?: { href: string; label: string }; wa?: Record<string, string> }): Promise<AlertResult> {
  const [e, w] = await Promise.all([
    email(a.subject, a.lines, a.link).catch((err) => `failed (${String(err?.message ?? err)})`),
    (a.wa ? whatsapp(a.wa) : Promise.resolve('not used')).catch((err) => `failed (${String(err?.message ?? err)})`),
  ]);
  console.log('alertAngel', a.subject, { email: e, whatsapp: w });
  return { email: e, whatsapp: w };
}
