// studio-brief: the client side of OKUNAMI Studio brand briefs. Public (verify_jwt off); every call except
// `sweep` needs the brief's secret token, which only the client's email link carries.
//
// POST { action: 'get', token }                                  -> { brief }
// POST { action: 'upload', token, slot, name, type, size }        -> { path, signedToken, publicUrl }   (then upload with uploadToSignedUrl)
// POST { action: 'save', token, answers, files }                  -> { ok }      (draft, any time before submit)
// POST { action: 'submit', token, answers, files }                -> { ok }      (emails Angel that the brief is ready)
// POST { action: 'sweep' }                                        -> { sent }    (emails the link to clients who have not had it yet)
//
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY. Optional: OKUNAMI_SITE_URL, OKUNAMI_WELCOME_FROM,
// OKUNAMI_REPLY_TO, OKUNAMI_STUDIO_TO (who hears about finished briefs; default angel@finessemedia.pro).
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const SITE = (Deno.env.get('OKUNAMI_SITE_URL') ?? 'https://okunami.pro').replace(/\/+$/, '');
const FROM = Deno.env.get('OKUNAMI_WELCOME_FROM') ?? 'OKUNAMI <hello@okunami.pro>';
const REPLY_TO = Deno.env.get('OKUNAMI_REPLY_TO') ?? 'angel@finessemedia.pro';
const STUDIO_TO = Deno.env.get('OKUNAMI_STUDIO_TO') ?? 'angel@finessemedia.pro';
const BUCKET = 'fc-card-media';
const SLOTS = new Set(['logo', 'photo', 'work', 'team', 'font']);
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/gif': 'gif', 'image/avif': 'avif',
  'font/woff2': 'woff2', 'font/woff': 'woff', 'font/ttf': 'ttf', 'font/otf': 'otf', 'application/x-font-ttf': 'ttf', 'application/font-woff': 'woff',
};
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_FILES = 24;

const db = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const briefUrl = (token: string) => `${SITE}/studio/brief/${token}`;

async function byToken(token: unknown) {
  const t = String(token ?? '');
  if (!/^[a-f0-9]{36}$/.test(t)) return null;
  const { data } = await db().from('fc_studio_briefs').select('*').eq('token', t).maybeSingle();
  return data;
}

async function sendMail(to: string, subject: string, text: string, html: string): Promise<boolean> {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) { console.error('RESEND_API_KEY is not set'); return false; }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, text, html }),
  });
  if (!r.ok) console.error('resend', r.status, await r.text());
  return r.ok;
}

function linkEmail(lang: string, first: string, token: string) {
  const es = lang === 'es';
  const url = briefUrl(token);
  const hi = first ? (es ? `Hola ${first},` : `Hi ${first},`) : (es ? 'Hola,' : 'Hi there,');
  const lines = es ? [
    'Gracias por tu compra. Ya podemos empezar a diseñar tu tarjeta.',
    'Para hacerla a tu medida, necesito tu logo, una buena foto tuya, tus colores y el estilo que te gusta. Toma unos 5 minutos y puedes volver cuando quieras.',
    '__LINK__',
    'Cuando lo envíes, empiezo tu diseño y te mando una vista previa para aprobar. Incluye una ronda de cambios.',
    'Cualquier pregunta, responde a este correo.',
    'Angel\nOKUNAMI Studio',
  ] : [
    'Thank you for your order. We are ready to design your card.',
    'To make it truly yours, I need your logo, a good photo of you, your colors and the style you like. It takes about 5 minutes, and you can come back to it any time.',
    '__LINK__',
    'Once you send it, I start your design and send you a preview to approve. One round of changes is included.',
    'Any questions, just reply to this email.',
    'Angel\nOKUNAMI Studio',
  ];
  const cta = es ? 'Enviar mi logo y fotos' : 'Send my logo and photos';
  const subject = es ? 'Empecemos tu tarjeta OKUNAMI' : "Let's start your OKUNAMI card";
  const text = [hi, ...lines].join('\n\n').replace('__LINK__', `${cta}: ${url}`);
  const p = (s: string) => `<p style="margin:0 0 16px;font:16px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1C2640">${esc(s).replace(/\n/g, '<br>')}</p>`;
  const btn = `<p style="margin:0 0 20px"><a href="${esc(url)}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#1C2640;color:#fff;text-decoration:none;font:700 15px -apple-system,Segoe UI,Helvetica,Arial,sans-serif">${esc(cta)}</a></p>`;
  const html = `<div style="max-width:520px;margin:0 auto;padding:28px 20px">${[hi, ...lines].map((l) => (l === '__LINK__' ? btn : p(l))).join('')}</div>`;
  return { subject, text, html };
}

function clean(v: unknown, max: number): string { return String(v ?? '').slice(0, max); }

/** Keeps only the answer fields the brief has, at sane sizes. */
function sanitizeAnswers(a: Record<string, unknown> | null | undefined) {
  const s = (a ?? {}) as Record<string, unknown>;
  const str = (k: string, max = 300) => clean(s[k], max);
  const so = (s.socials ?? {}) as Record<string, unknown>;
  return {
    fullName: str('fullName', 80), business: str('business', 100), jobTitle: str('jobTitle', 100), tagline: str('tagline', 160),
    phone: str('phone', 40), whatsapp: str('whatsapp', 40), email: str('email', 120), website: str('website', 200), booking: str('booking', 300),
    address: str('address', 200), hours: str('hours', 300), services: str('services', 1500),
    socials: Object.fromEntries(['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'x'].map((k) => [k, clean(so[k], 200)])),
    noLogo: !!s.noLogo,
    colorsHow: ['logo', 'mine', 'pick'].includes(String(s.colorsHow)) ? s.colorsHow : 'logo',
    colors: Array.isArray(s.colors) ? s.colors.filter((c) => /^#[0-9a-f]{6}$/i.test(String(c))).slice(0, 3) : [],
    vibes: Array.isArray(s.vibes) ? s.vibes.map(String).filter((v) => /^[a-z]{3,10}$/.test(v)).slice(0, 2) : [],
    mainKind: ['book', 'call', 'whatsapp', 'order', 'quote', 'website', 'directions', 'give'].includes(String(s.mainKind)) ? s.mainKind : 'call',
    mainUrl: str('mainUrl', 300), likes: str('likes', 1000), mustHave: str('mustHave', 1000), avoid: str('avoid', 1000), team: str('team', 3000),
  };
}

function sanitizeFiles(files: unknown, briefId: string) {
  if (!Array.isArray(files)) return [];
  const prefix = `studio/${briefId}/`;
  return files.slice(0, MAX_FILES).filter((f) => f && SLOTS.has(String(f.slot)) && String(f.path).startsWith(prefix)).map((f) => ({
    slot: String(f.slot), path: String(f.path), url: db().storage.from(BUCKET).getPublicUrl(String(f.path)).data.publicUrl, name: clean(f.name, 120),
  }));
}

async function sweep(): Promise<number> {
  const c = db();
  const { data } = await c.from('fc_studio_briefs').select('id, token, name, email, lang').is('emailed_at', null).eq('status', 'waiting').not('email', 'is', null).limit(25);
  let sent = 0;
  for (const b of data ?? []) {
    // claim first so two sweeps never send twice
    const { data: won } = await c.from('fc_studio_briefs').update({ emailed_at: new Date().toISOString() }).eq('id', b.id).is('emailed_at', null).select('id');
    if (!won?.length) continue;
    const first = String(b.name ?? '').trim().split(/\s+/)[0] ?? '';
    const m = linkEmail(b.lang, first, b.token);
    if (await sendMail(b.email, m.subject, m.text, m.html)) sent++;
    else await c.from('fc_studio_briefs').update({ emailed_at: null }).eq('id', b.id);   // try again next sweep
  }
  return sent;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const b = await req.json().catch(() => ({}));
    if (b.action === 'sweep') return json({ sent: await sweep() });

    const brief = await byToken(b.token);
    if (!brief) return json({ error: 'This link is not valid. Check the email we sent you, or reply to it for help.' }, 404);
    const locked = brief.status !== 'waiting' && brief.status !== 'submitted';

    switch (b.action) {
      case 'get': {
        const { token: _t, note: _n, card_id: _c, ...pub } = brief;
        return json({ brief: { ...pub, locked } });
      }
      case 'upload': {
        if (locked) return json({ error: 'Your design is already in progress. Reply to the email to send more files.' }, 409);
        const slot = String(b.slot), type = String(b.type), size = Number(b.size);
        if (!SLOTS.has(slot)) return json({ error: 'Unknown upload' }, 400);
        const ext = TYPES[type];
        if (!ext) return json({ error: 'Use a JPG, PNG, WEBP or HEIC image (or a font file).' }, 400);
        if (!(size > 0) || size > MAX_BYTES) return json({ error: 'Each file can be up to 15 MB.' }, 400);
        if ((brief.files ?? []).length >= MAX_FILES) return json({ error: 'That is the most files one brief can hold.' }, 400);
        const path = `studio/${brief.id}/${slot}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(path);
        if (error || !data) return json({ error: 'Could not start the upload. Try again.' }, 500);
        return json({ path, signedToken: data.token, publicUrl: db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl });
      }
      case 'save':
      case 'submit': {
        if (locked) return json({ error: 'Your design is already in progress. Reply to the email to change anything.' }, 409);
        const answers = sanitizeAnswers(b.answers);
        const files = sanitizeFiles(b.files, brief.id);
        const submit = b.action === 'submit';
        const now = new Date().toISOString();
        await db().from('fc_studio_briefs').update({
          answers, files, updated_at: now,
          ...(submit ? { status: 'submitted', submitted_at: now } : {}),
          ...(answers.fullName && !brief.name ? { name: answers.fullName } : {}),
          ...(answers.business && !brief.business ? { business: answers.business } : {}),
        }).eq('id', brief.id);
        if (submit && brief.status !== 'submitted') {
          const who = answers.fullName || brief.name || 'A client';
          const lines = [
            `${who}${answers.business ? ` (${answers.business})` : ''} sent their brand brief${brief.reseller ? ` (sold by ${brief.reseller})` : ''}.`,
            `Kind: ${brief.kind === 'team' ? 'custom team design' : 'custom card'}. Vibe: ${answers.vibes.join(', ') || 'not picked'}. Files: ${files.length}.`,
            `Open Admin > Studio to build the first draft: ${SITE}/app/admin?tab=studio`,
          ];
          await sendMail(STUDIO_TO, `Brand brief ready: ${who}`, lines.join('\n\n'), `<div style="font:15px/1.55 -apple-system,Segoe UI,Arial,sans-serif;color:#1C2640">${lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`);
        }
        return json({ ok: true });
      }
      default: return json({ error: 'Unknown action' }, 400);
    }
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong. Try again in a minute.' }, 500);
  }
});
