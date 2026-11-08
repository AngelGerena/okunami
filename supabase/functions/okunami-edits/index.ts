// okunami-edits: Pro Plus done-for-you edits (up to 2 small edits a month, Eastern time, no rollover).
//
// Member (signed in):
//   POST { action: 'request', cardId?, details, photoUrl?, lang }  -> { ok, used, limit }
//        Saves the request (fc_edit_submit enforces Pro Plus and the monthly limit), emails Angel,
//        and emails the member a confirmation.
// Admin:
//   POST { action: 'admin_done', id }                  -> { ok }   marks it done, emails the member
//   POST { action: 'admin_decline', id, note }          -> { ok }   not a small edit: refunds the edit, emails the member
//
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY (already set).
// Optional: OKUNAMI_ALERT_EMAIL, OKUNAMI_ALERT_FROM, OKUNAMI_REPLY_TO, OKUNAMI_SITE_URL.
import { admin, cors, currentUser, json, siteUrl } from '../_shared/okunami.ts';
import { alertAngel } from '../_shared/notify.ts';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

/** Email to the member. Never throws. */
async function mailMember(to: string | null | undefined, subject: string, lines: string[], link?: { href: string; label: string }) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key || !to) return;
  const from = Deno.env.get('OKUNAMI_ALERT_FROM') ?? Deno.env.get('OKUNAMI_WELCOME_FROM') ?? 'OKUNAMI <hello@okunami.pro>';
  const replyTo = Deno.env.get('OKUNAMI_REPLY_TO') ?? 'angel@finessemedia.pro';
  const p = (s: string) => `<p style="margin:0 0 14px;font:16px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1C2640">${esc(s).replace(/\n/g, '<br>')}</p>`;
  const btn = link ? `<p style="margin:6px 0 18px"><a href="${esc(link.href)}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#1C2640;color:#fff;text-decoration:none;font:700 15px -apple-system,Segoe UI,Helvetica,Arial,sans-serif">${esc(link.label)}</a></p>` : '';
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text: [...lines, link ? `${link.label}: ${link.href}` : ''].join('\n\n'), html: `<div style="max-width:520px;margin:0 auto;padding:26px 20px">${lines.map(p).join('')}${btn}</div>` }),
  }).catch((e) => console.error('member mail failed', e));
}

const first = (name: string | null | undefined) => String(name ?? '').trim().split(/\s+/)[0] ?? '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  try {
    const user = await currentUser(req);
    if (!user) return json({ error: 'Please sign in first.' }, 401);
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const db = admin();
    const es = body.lang === 'es';

    /* ------------------------------------------------------------ member: request an edit */
    if (body.action === 'request') {
      const details = clip(body.details, 1500);
      if (details.length < 3) return json({ error: es ? 'Cuéntanos qué quieres cambiar.' : 'Tell us what you want changed.' }, 400);
      // A photo must be one the member uploaded to their own folder in the card media bucket.
      const photo = clip(body.photoUrl, 600);
      const mine = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/fc-card-media/${user.id}/`;
      if (photo && !photo.startsWith(mine)) return json({ error: es ? 'Vuelve a subir la foto.' : 'Please upload the photo again.' }, 400);
      const cardId = clip(body.cardId, 60) || null;

      const { data: res, error } = await db.rpc('fc_edit_submit', { p_user: user.id, p_card: cardId, p_details: details, p_photo: photo || null, p_lang: es ? 'es' : 'en' });
      if (error) throw error;
      if (res?.error === 'not_plus') return json({ error: es ? 'Las ediciones hechas por nosotros vienen con Pro Plus.' : 'Done-for-you edits come with Pro Plus.' }, 403);
      if (res?.error === 'not_your_card') return json({ error: es ? 'No encontramos esa tarjeta.' : 'We could not find that card.' }, 404);
      if (res?.error === 'limit') return json({ error: es ? 'Ya usaste tus 2 ediciones de este mes. Se renuevan el día 1.' : 'You have used both edits this month. They reset on the 1st.', used: res.used }, 409);

      const { data: profile } = await db.from('fc_profiles').select('full_name, email').eq('id', user.id).maybeSingle();
      const { data: card } = cardId ? await db.from('fc_cards').select('slug, data').eq('id', cardId).maybeSingle() : { data: null };
      const who = (card?.data as Record<string, string> | undefined)?.business || (card?.data as Record<string, string> | undefined)?.fullName || profile?.full_name || user.email || 'A Pro Plus member';
      const cardLink = card?.slug ? `${siteUrl()}/${card.slug}` : null;

      await alertAngel({
        subject: `Pro Plus edit: ${who} (${res.used} of ${res.limit} this month)`,
        lines: [
          `${who} asked for a done-for-you edit. This is edit ${res.used} of ${res.limit} for this month. Aim to finish within 2 business days.`,
          `What they want: ${details}`,
          ...(photo ? [`Photo they sent: ${photo}`] : []),
          ...(cardLink ? [`Their card: ${cardLink}`] : []),
          `Member: ${profile?.email ?? user.email ?? '-'}`,
          'Bigger than a small edit (new design, new section)? Tap "Not a small edit" in the admin portal. It gives the edit back and lets them know you will quote it.',
        ],
        link: { href: `${siteUrl()}/app/admin?tab=edits`, label: 'Open edit requests' },
      });

      const name = first(profile?.full_name);
      await mailMember(profile?.email ?? user.email,
        es ? 'Recibimos tu solicitud de edición' : 'We got your edit request',
        es ? [name ? `Hola ${name},` : 'Hola,', `Recibimos tu solicitud. Es tu edición ${res.used} de ${res.limit} de este mes.`, `Lo que pediste: ${details}`, 'Te avisamos por correo cuando esté lista, normalmente en 2 días laborables.', 'Angel\nOKUNAMI by Finesse Media']
           : [name ? `Hi ${name},` : 'Hi there,', `We got your request. This is edit ${res.used} of ${res.limit} for this month.`, `What you asked for: ${details}`, 'We will email you when it is done, usually within 2 business days.', 'Angel\nOKUNAMI by Finesse Media']);

      return json({ ok: true, used: res.used, limit: res.limit });
    }

    /* ------------------------------------------------------------ admin: done or declined */
    if (body.action === 'admin_done' || body.action === 'admin_decline') {
      const { data: isAdmin } = await db.from('fc_admins').select('user_id').eq('user_id', user.id).maybeSingle();
      if (!isAdmin) return json({ error: 'Admins only.' }, 403);
      const id = clip(body.id, 60);
      const { data: row } = await db.from('fc_edit_requests').select('*').eq('id', id).maybeSingle();
      if (!row) return json({ error: 'Not found.' }, 404);
      if (row.status !== 'open') return json({ error: 'This request is already closed.' }, 409);
      const { data: profile } = await db.from('fc_profiles').select('full_name, email').eq('id', row.owner_id).maybeSingle();
      const { data: card } = row.card_id ? await db.from('fc_cards').select('slug').eq('id', row.card_id).maybeSingle() : { data: null };
      const name = first(profile?.full_name);
      const memberEs = row.lang === 'es';

      if (body.action === 'admin_done') {
        await db.from('fc_edit_requests').update({ status: 'done', done_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id);
        const link = card?.slug ? { href: `${siteUrl()}/${card.slug}`, label: memberEs ? 'Ver mi tarjeta' : 'See my card' } : undefined;
        await mailMember(profile?.email,
          memberEs ? 'Tu edición está lista' : 'Your edit is done',
          memberEs ? [name ? `Hola ${name},` : 'Hola,', 'Tu edición ya está en tu tarjeta.', `Lo que pediste: ${row.details}`, 'Si algo no se ve bien, responde a este correo.', 'Angel\nOKUNAMI by Finesse Media']
                   : [name ? `Hi ${name},` : 'Hi there,', 'Your edit is live on your card.', `What you asked for: ${row.details}`, 'If anything looks off, just reply to this email.', 'Angel\nOKUNAMI by Finesse Media'],
          link);
        return json({ ok: true });
      }

      const note = clip(body.note, 500);
      await db.from('fc_edit_requests').update({ status: 'declined', admin_note: note || row.admin_note, updated_at: new Date().toISOString() }).eq('id', id);
      await mailMember(profile?.email,
        memberEs ? 'Sobre tu solicitud de edición' : 'About your edit request',
        memberEs ? [name ? `Hola ${name},` : 'Hola,', 'Lo que pediste es más grande que una edición pequeña, así que no cuenta para tus 2 ediciones del mes.', `Lo que pediste: ${row.details}`, ...(note ? [note] : []), 'Te escribo con una cotización para hacerlo. Si prefieres, responde a este correo.', 'Angel\nOKUNAMI by Finesse Media']
                 : [name ? `Hi ${name},` : 'Hi there,', 'What you asked for is bigger than a small edit, so it does not count toward your 2 edits this month.', `What you asked for: ${row.details}`, ...(note ? [note] : []), 'I will reach out with a quote to get it done. You can also just reply to this email.', 'Angel\nOKUNAMI by Finesse Media']);
      return json({ ok: true });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (e) {
    console.error('okunami-edits', e);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
