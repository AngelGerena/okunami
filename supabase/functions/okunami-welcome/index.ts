// okunami-welcome: sends a one-time welcome email the first time a member publishes a card.
// Called fire-and-forget from the editor. Safe to call many times: only the first published card triggers a send.
// Needs the RESEND_API_KEY secret. Without it the function does nothing and says so (it never breaks publishing).
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const SITE = (Deno.env.get('OKUNAMI_SITE_URL') ?? 'https://okunami.pro').replace(/\/+$/, '');
const FROM = Deno.env.get('OKUNAMI_WELCOME_FROM') ?? 'OKUNAMI <hello@okunami.pro>';
const REPLY_TO = Deno.env.get('OKUNAMI_REPLY_TO') ?? 'angel@finessemedia.pro';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function message(lang: 'en' | 'es', first: string, cardUrl: string) {
  const login = `${SITE}/login`;
  const es = lang === 'es';
  const hi = first ? (es ? `Hola ${first},` : `Hi ${first},`) : (es ? 'Hola,' : 'Hi there,');
  const lines = es ? [
    'Tu tarjeta ya está en vivo. Felicidades.',
    'Este es tu enlace. Ponlo en tu bio, en tu firma de correo o en tus tarjetas impresas:',
    '__LINK__',
    `Para hacer cambios, entra en ${login} con este mismo correo. También, cuando abras tu tarjeta en un teléfono donde ya iniciaste sesión, verás un pequeño lápiz junto a "Made with OKUNAMI" al final. Solo tú lo ves.`,
    'Si necesitas algo, responde a este correo. Lo leo yo.',
    'Angel\nFundador, OKUNAMI',
  ] : [
    'Your card is live. Congrats.',
    'Here is your link. Put it in your bio, your email signature or on your printed cards:',
    '__LINK__',
    `To make changes, sign in at ${login} with this same email. And when you open your card on a phone where you're signed in, you'll see a small pencil next to "Made with OKUNAMI" at the bottom. Only you can see it.`,
    'If you need anything, just reply to this email. It comes straight to me.',
    'Angel\nFounder, OKUNAMI',
  ];
  const subject = es ? 'Tu tarjeta OKUNAMI está en vivo' : 'Your OKUNAMI card is live';
  const text = [hi, ...lines].join('\n\n').replace('__LINK__', cardUrl);
  const p = (s: string) => `<p style="margin:0 0 16px;font:16px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1C2640">${esc(s).replace(/\n/g, '<br>')}</p>`;
  const link = `<p style="margin:0 0 20px"><a href="${esc(cardUrl)}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#1C2640;color:#fff;text-decoration:none;font:700 15px -apple-system,Segoe UI,Helvetica,Arial,sans-serif">${esc(cardUrl.replace(/^https?:\/\//, ''))}</a></p>`;
  const html = `<div style="max-width:520px;margin:0 auto;padding:28px 20px">${[hi, ...lines].map((l) => (l === '__LINK__' ? link : p(l))).join('')}</div>`;
  return { subject, text, html };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!, key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const db = createClient(url, key, { auth: { persistSession: false } });
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: auth } = token ? await db.auth.getUser(token) : { data: { user: null } };
    const user = auth.user;
    if (!user?.email) return json({ error: 'Not signed in' }, 401);

    const body = await req.json().catch(() => ({}));
    const lang: 'en' | 'es' = body?.lang === 'es' ? 'es' : 'en';
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) return json({ sent: false, reason: 'RESEND_API_KEY is not set' });

    // The card must be theirs and published.
    const { data: card } = await db.from('fc_cards').select('id, slug, data').eq('id', String(body?.cardId ?? '')).eq('owner_id', user.id).eq('published', true).maybeSingle();
    if (!card?.slug) return json({ sent: false, reason: 'No published card' });

    // Atomic claim: only one request ever wins, so the email goes out once.
    const { data: claimed } = await db.from('fc_profiles').update({ welcome_sent_at: new Date().toISOString() }).eq('id', user.id).is('welcome_sent_at', null).select('id, full_name');
    if (!claimed?.length) return json({ sent: false, reason: 'Already welcomed' });

    const name = String((card.data as Record<string, unknown>)?.fullName || claimed[0].full_name || '').trim();
    const first = name.split(/\s+/)[0] ?? '';
    const { subject, text, html } = message(lang, first, `${SITE}/${card.slug}`);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [user.email], reply_to: REPLY_TO, subject, text, html }),
    });
    if (!res.ok) {
      // Give it back so the next publish can try again.
      await db.from('fc_profiles').update({ welcome_sent_at: null }).eq('id', user.id);
      return json({ sent: false, reason: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` }, 502);
    }
    return json({ sent: true });
  } catch (e) {
    return json({ sent: false, reason: String((e as Error)?.message ?? e) }, 500);
  }
});
