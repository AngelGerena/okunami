/* okunami.pro/studio/brief/:token
   The brand brief a client fills after paying for a custom design. Saves as they go, so they can stop and come back.
   Everything goes through the studio-brief edge function; the token in the link is the only key. */
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Check, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT, rich } from '../lib/i18n';
import { extractPalette } from '../lib/color';
import { MAIN_KINDS, VIBES, emptyAnswers, type BriefAnswers, type BriefFile, type BriefSlot, type VibeId } from '../lib/studio';
import Brand from '../components/Brand';
import LangToggle from '../components/LangToggle';

interface PublicBrief { id: string; kind: 'card' | 'team'; status: string; name: string | null; email: string | null; phone: string | null; business: string | null; lang: 'en' | 'es'; answers: Partial<BriefAnswers>; files: BriefFile[]; locked: boolean; }

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('studio-brief', { body });
  if (error) {
    let msg = error.message;
    try { const j = await (error as { context?: Response }).context?.json(); if (j?.error) msg = j.error; } catch { /* keep the generic message */ }
    throw new Error(msg);
  }
  return data as T;
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="sb-step">
      <header><span className="sb-n" aria-hidden>{n}</span><div><h2>{title}</h2>{hint && <p>{hint}</p>}</div></header>
      <div className="sb-step__b">{children}</div>
    </section>
  );
}

function Text({ label, value, onChange, hint, multiline, placeholder, inputMode, type = 'text', id }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; multiline?: boolean; placeholder?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'url'; type?: string; id: string;
}) {
  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      {multiline
        ? <textarea id={id} value={value} placeholder={placeholder} rows={4} onChange={(e) => onChange(e.target.value)} />
        : <input id={id} type={type} value={value} placeholder={placeholder} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} />}
      {hint && <small>{hint}</small>}
    </div>
  );
}

export default function StudioBrief() {
  const { token = '' } = useParams();
  const { t, lang, setLang } = useT();
  const [brief, setBrief] = useState<PublicBrief | null>(null);
  const [a, setA] = useState<BriefAnswers>(emptyAnswers());
  const [files, setFiles] = useState<BriefFile[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<BriefSlot | null>(null);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [palette, setPalette] = useState<string[]>([]);
  const dirty = useRef(false);

  useEffect(() => {
    call<{ brief: PublicBrief }>({ action: 'get', token }).then(({ brief: b }) => {
      setBrief(b);
      const base = emptyAnswers();
      setA({ ...base, fullName: b.name ?? '', business: b.business ?? '', phone: b.phone ?? '', email: b.email ?? '', ...b.answers, socials: { ...base.socials, ...(b.answers?.socials ?? {}) } });
      setFiles(b.files ?? []);
      if (b.status !== 'waiting') setSent(true);
      if (b.lang && b.lang !== lang && !new URLSearchParams(location.search).get('lang')) setLang(b.lang);
    }).catch((e) => setLoadErr(e instanceof Error ? e.message : String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Draft autosave, so nothing is lost if they close the page.
  useEffect(() => {
    if (!brief || brief.locked || !dirty.current) return;
    setSaved('saving');
    const h = window.setTimeout(() => {
      call({ action: 'save', token, answers: a, files }).then(() => setSaved('saved')).catch(() => setSaved('idle'));
    }, 1200);
    return () => window.clearTimeout(h);
  }, [a, files, brief, token]);

  const up = useCallback(<K extends keyof BriefAnswers>(k: K, v: BriefAnswers[K]) => { dirty.current = true; setA((x) => ({ ...x, [k]: v })); }, []);
  const social = (k: keyof BriefAnswers['socials'], v: string) => { dirty.current = true; setA((x) => ({ ...x, socials: { ...x.socials, [k]: v } })); };

  async function upload(slot: BriefSlot, list: FileList | null, max: number) {
    if (!list?.length) return;
    setErr(null); setBusy(slot);
    try {
      const room = Math.max(0, max - files.filter((f) => f.slot === slot).length);
      const picked = Array.from(list).slice(0, slot === 'logo' || slot === 'photo' ? 1 : room);
      const added: BriefFile[] = [];
      for (const file of picked) {
        const r = await call<{ path: string; signedToken: string; publicUrl: string }>({ action: 'upload', token, slot, name: file.name, type: file.type, size: file.size });
        const { error } = await supabase.storage.from('fc-card-media').uploadToSignedUrl(r.path, r.signedToken, file, { contentType: file.type });
        if (error) throw new Error(t("That file did not upload. Try again."));
        added.push({ slot, path: r.path, url: r.publicUrl, name: file.name });
        if (slot === 'logo') {
          const local = URL.createObjectURL(file);
          extractPalette(local, 5).then((p) => { setPalette(p); if (p.length) { dirty.current = true; setA((x) => (x.colors.length ? x : { ...x, colors: p.slice(0, 2), colorsHow: 'logo' })); } }).catch(() => { /* no colors found */ }).finally(() => URL.revokeObjectURL(local));
        }
      }
      dirty.current = true;
      setFiles((cur) => (slot === 'logo' || slot === 'photo' ? [...cur.filter((f) => f.slot !== slot), ...added] : [...cur, ...added]));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setBusy(null); }
  }
  const remove = (path: string) => { dirty.current = true; setFiles((cur) => cur.filter((f) => f.path !== path)); };

  const of = (slot: BriefSlot) => files.filter((f) => f.slot === slot);
  const missing: string[] = [];
  if (!a.fullName.trim()) missing.push(t("your name"));
  if (!a.phone.trim() && !a.email.trim()) missing.push(t("a phone or email for the card"));
  if (!a.noLogo && !of('logo').length) missing.push(t("your logo (or check that you don't have one)"));
  if (!of('photo').length) missing.push(t("a photo of you"));
  if (!a.vibes.length) missing.push(t("a style"));
  if (MAIN_KINDS.find((m) => m.id === a.mainKind)?.needsUrl && !a.mainUrl.trim()) missing.push(t("the link for your main button"));

  async function submit() {
    if (missing.length) { setErr(t("Almost there. Still needed: {list}.", { list: missing.join(', ') })); return; }
    setSending(true); setErr(null);
    try { await call({ action: 'submit', token, answers: a, files }); setSent(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setSending(false); }
  }

  const head = (
    <header className="sb-top"><Brand /><LangToggle /></header>
  );
  if (loadErr) return <main className="sb">{head}<div className="sb-card"><h1>{t("We could not open this brief")}</h1><p>{loadErr}</p></div></main>;
  if (!brief) return <main className="sb">{head}<div className="sb-card sb-load"><Loader2 className="spin" size={22} /> {t("Loading your brief")}</div></main>;

  if (sent) return (
    <main className="sb">{head}
      <div className="sb-card sb-done">
        <span className="sb-done__ic"><Check size={28} /></span>
        <h1>{t("Got it. Thank you!")}</h1>
        <p>{t("Angel will design your card from what you sent and email you a preview to approve. One round of changes is included.")}</p>
        {!brief.locked && <button type="button" className="btn btn--ghost" onClick={() => setSent(false)}>{t("Change something I sent")}</button>}
      </div>
    </main>
  );

  const upl = (slot: BriefSlot, label: string, hint: string, max: number, multiple = false) => (
    <div className="sb-upl">
      <div className="sb-upl__row">
        {of(slot).map((f) => (
          <figure key={f.path} className="sb-thumb">
            <img src={f.url} alt={f.name} />
            <button type="button" className="sb-thumb__x" aria-label={t("Remove {name}", { name: f.name })} onClick={() => remove(f.path)}><Trash2 size={15} /></button>
          </figure>
        ))}
        {of(slot).length < max && (
          <label className="sb-add">
            {busy === slot ? <Loader2 className="spin" size={22} /> : <ImagePlus size={22} />}
            <span>{busy === slot ? t("Uploading") : label}</span>
            <input type="file" accept="image/*" multiple={multiple} disabled={busy !== null} onChange={(e: ChangeEvent<HTMLInputElement>) => { void upload(slot, e.target.files, max); e.target.value = ''; }} />
          </label>
        )}
      </div>
      <small>{hint}</small>
    </div>
  );

  let n = 0;
  return (
    <main className="sb">
      {head}
      <div className="sb-intro">
        <p className="sb-eyebrow">{t("OKUNAMI Studio")}</p>
        <h1>{a.fullName ? t("Let's design your card, {name}", { name: a.fullName.split(' ')[0] }) : t("Let's design your card")}</h1>
        <p>{t("Send your logo, photos and style. It takes about 5 minutes, and it saves as you go, so you can come back to finish.")}</p>
        <p className="sb-saved" aria-live="polite">{saved === 'saving' ? t("Saving") : saved === 'saved' ? t("Saved") : ''}</p>
      </div>

      <Step n={++n} title={t("Your logo")} hint={t("PNG with a clear background works best.")}>
        {!a.noLogo && upl('logo', t("Add your logo"), t("JPG, PNG or WEBP, up to 15 MB."), 1)}
        <label className="sb-check"><input type="checkbox" checked={a.noLogo} onChange={(e) => up('noLogo', e.target.checked)} /> {t("I don't have a logo. Use my business name.")}</label>
      </Step>

      <Step n={++n} title={t("Photos")} hint={t("A clear, well-lit photo of you, plus up to 8 photos of your work, space or products.")}>
        {upl('photo', t("Add your photo"), t("Face the camera, good light, no sunglasses."), 1)}
        {upl('work', t("Add work photos"), t("Optional. These go in the photo section of your card."), 8, true)}
        {brief.kind === 'team' && upl('team', t("Add team photos"), t("One photo per person. Name the files with their names if you can."), 12, true)}
      </Step>

      <Step n={++n} title={t("Your colors")}>
        <div className="chips" role="radiogroup" aria-label={t("Your colors")}>
          {([['logo', t("Use my logo colors")], ['mine', t("I have brand colors")], ['pick', t("Pick for me")]] as const).map(([v, l]) => (
            <button key={v} type="button" role="radio" aria-checked={a.colorsHow === v} className={a.colorsHow === v ? 'on' : ''} onClick={() => up('colorsHow', v)}>{l}</button>
          ))}
        </div>
        {a.colorsHow !== 'pick' && (
          <div className="sb-colors">
            {[0, 1, 2].map((i) => (
              <label key={i} className="sb-color">
                <input type="color" value={a.colors[i] ?? '#cccccc'} aria-label={t("Color {n}", { n: i + 1 })}
                  onChange={(e) => { const c = [...a.colors]; c[Math.min(i, c.length)] = e.target.value.toUpperCase(); up('colors', c.slice(0, 3)); }} />
                <span>{a.colors[i] ?? (i === 0 ? t("Main color") : i === 1 ? t("Accent") : t("Optional"))}</span>
              </label>
            ))}
          </div>
        )}
        {palette.length > 0 && a.colorsHow === 'logo' && (
          <div className="sb-pal">
            <small>{t("From your logo. Tap to use as the main color:")}</small>
            <div className="sb-pal__row">{palette.map((c) => <button key={c} type="button" style={{ background: c }} aria-label={c} onClick={() => up('colors', [c, ...a.colors.filter((x) => x !== c)].slice(0, 3))} />)}</div>
          </div>
        )}
      </Step>

      <Step n={++n} title={t("Your style")} hint={t("Pick 1 or 2.")}>
        <div className="sb-vibes">
          {VIBES.map((v) => {
            const on = a.vibes.includes(v.id);
            return (
              <button key={v.id} type="button" className={`sb-vibe ${on ? 'on' : ''}`} aria-pressed={on}
                onClick={() => up('vibes', on ? a.vibes.filter((x) => x !== v.id) : ([...a.vibes, v.id].slice(-2) as VibeId[]))}>
                <span className="sb-vibe__sw" style={{ background: `linear-gradient(135deg, ${v.seeds.brand} 0 60%, ${v.seeds.accent} 60%)` }} aria-hidden />
                <b>{t(v.name)}</b><small>{t(v.hint)}</small>
              </button>
            );
          })}
        </div>
        <Text id="sb-likes" label={t("Cards, websites or accounts you like (optional)")} value={a.likes} onChange={(v) => up('likes', v)} multiline placeholder={t("Paste links or Instagram handles")} />
      </Step>

      <Step n={++n} title={t("Your main button")} hint={t("The one thing you most want people to do from your card.")}>
        <div className="chips" role="radiogroup" aria-label={t("Your main button")}>
          {MAIN_KINDS.map((m) => <button key={m.id} type="button" role="radio" aria-checked={a.mainKind === m.id} className={a.mainKind === m.id ? 'on' : ''} onClick={() => up('mainKind', m.id)}>{t(m.label)}</button>)}
        </div>
        {MAIN_KINDS.find((m) => m.id === a.mainKind)?.needsUrl && (
          <Text id="sb-main" label={t("Link for this button")} value={a.mainUrl} onChange={(v) => up('mainUrl', v)} inputMode="url" placeholder="https://" />
        )}
      </Step>

      <Step n={++n} title={t("What goes on your card")}>
        <div className="sb-two">
          <Text id="sb-name" label={t("Full name")} value={a.fullName} onChange={(v) => up('fullName', v)} />
          <Text id="sb-biz" label={t("Business name")} value={a.business} onChange={(v) => up('business', v)} />
          <Text id="sb-title" label={t("Your title")} value={a.jobTitle} onChange={(v) => up('jobTitle', v)} placeholder={t("Owner, Barber, REALTOR...")} />
          <Text id="sb-phone" label={t("Phone")} value={a.phone} onChange={(v) => up('phone', v)} inputMode="tel" type="tel" />
          <Text id="sb-wa" label={t("WhatsApp (if different)")} value={a.whatsapp} onChange={(v) => up('whatsapp', v)} inputMode="tel" type="tel" />
          <Text id="sb-email" label={t("Email")} value={a.email} onChange={(v) => up('email', v)} inputMode="email" type="email" />
          <Text id="sb-web" label={t("Website")} value={a.website} onChange={(v) => up('website', v)} inputMode="url" />
          <Text id="sb-book" label={t("Booking link")} value={a.booking} onChange={(v) => up('booking', v)} inputMode="url" />
        </div>
        <Text id="sb-tag" label={t("One line about you")} value={a.tagline} onChange={(v) => up('tagline', v)} placeholder={t("Fresh fades and clean lineups in Deltona")} />
        <Text id="sb-addr" label={t("Address (leave empty if you don't have a location)")} value={a.address} onChange={(v) => up('address', v)} />
        <Text id="sb-hours" label={t("Hours")} value={a.hours} onChange={(v) => up('hours', v)} placeholder={t("Tue to Sat, 10:00 AM to 7:00 PM")} />
        <Text id="sb-svc" label={t("Services (one per line)")} value={a.services} onChange={(v) => up('services', v)} multiline placeholder={t("Haircut - $30\nBeard trim - $15")} />
        <div className="sb-two">
          {(['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'x'] as const).map((k) => (
            <Text key={k} id={`sb-${k}`} label={{ instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube', linkedin: 'LinkedIn', x: 'X' }[k]} value={a.socials[k]} onChange={(v) => social(k, v)} placeholder={k === 'linkedin' || k === 'facebook' ? t("Link") : '@'} />
          ))}
        </div>
        {brief.kind === 'team' && (
          <Text id="sb-team" label={t("Your team (one person per line)")} value={a.team} onChange={(v) => up('team', v)} multiline placeholder={t("Name, title, phone, email")} />
        )}
      </Step>

      <Step n={++n} title={t("Anything else")}>
        <Text id="sb-must" label={t("Must have on my card")} value={a.mustHave} onChange={(v) => up('mustHave', v)} multiline />
        <Text id="sb-avoid" label={t("Please avoid")} value={a.avoid} onChange={(v) => up('avoid', v)} multiline placeholder={t("Colors, styles or words you don't want")} />
      </Step>

      <div className="sb-send">
        {err && <p className="sb-err" role="alert">{err}</p>}
        <button type="button" className="btn btn--ink btn--lg" disabled={sending || busy !== null} onClick={() => { void submit(); }}>
          {sending ? <Loader2 className="spin" size={18} /> : <Check size={18} />}{t("Send my brief")}
        </button>
        <p className="note">{rich(t("Questions? Reply to the email we sent you, or message Angel at <b>(407) 960-9004</b>."), { b: (c) => <b>{c}</b> })}</p>
      </div>
    </main>
  );
}
