/* Admin > Studio: every custom design from paid order to delivered card.
   Briefs appear here on their own when a custom design is paid. Angel can also start one by hand
   (a WhatsApp or in-person sale), copy the client's link, and turn a finished brief into a first draft. */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Copy, Loader2, Plus, Wand2, ExternalLink, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { store, slugify } from '../../lib/store';
import { BUILD_STEPS, VIBE_BY_ID, briefToCard, emptyAnswers, type Brief } from '../../lib/studio';
import { waHref } from '../../lib/links';

const STATUS: Record<Brief['status'], { label: string; tone: string }> = {
  waiting: { label: 'Waiting on client', tone: 'muted' },
  submitted: { label: 'Brief ready', tone: 'warn' },
  building: { label: 'Building', tone: 'warn' },
  preview: { label: 'Preview sent', tone: 'ok' },
  delivered: { label: 'Delivered', tone: 'ok' },
};
const link = (b: Pick<Brief, 'token'>) => `${window.location.origin}/studio/brief/${b.token}`;
const when = (s?: string | null) => (s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '');
const errText = (e: unknown) => (e instanceof Error ? e.message : e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Something went wrong.');

function useChecklist(id: string) {
  const key = `okunami.studio.check.${id}`;
  const [done, setDone] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; } });
  const toggle = (i: number) => setDone((d) => {
    const next = d.includes(i) ? d.filter((x) => x !== i) : [...d, i];
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage blocked */ }
    return next;
  });
  return { done, toggle };
}

function BriefRow({ b, onChange, flash }: { b: Brief; onChange: () => void; flash: (t: string, bad?: boolean) => void }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(b.status === 'submitted');
  const [busy, setBusy] = useState(false);
  const { done, toggle } = useChecklist(b.id);
  const a = { ...emptyAnswers(), ...b.answers };
  const s = STATUS[b.status];
  const who = a.fullName || b.name || b.email || 'New client';

  const copy = async () => { try { await navigator.clipboard.writeText(link(b)); flash('Brief link copied.'); } catch { flash(link(b)); } };
  const setStatus = async (status: Brief['status']) => {
    const { error } = await supabase.rpc('fc_admin_studio_brief_set', { p_id: b.id, p_status: status, p_card: null, p_note: null });
    if (error) flash(errText(error), true); else onChange();
  };
  const build = async () => {
    setBusy(true);
    try {
      const base = await store.create();
      let card = briefToCard(base, b);
      const nice = slugify(a.business || who);
      if (nice) card = { ...card, data: { ...card.data, slug: nice } };
      try { await store.saveContent(card); }
      catch { card = { ...card, data: { ...card.data, slug: base.data.slug } }; await store.saveContent(card); }   // that address is taken; Angel picks one on Publish
      await supabase.rpc('fc_admin_studio_brief_set', { p_id: b.id, p_status: 'building', p_card: card.id, p_note: null });
      nav(`/app/cards/${card.id}?step=studio`);
    } catch (e) { flash(errText(e), true); setBusy(false); }
  };

  return (
    <li className="adm-row stb">
      <div className="stb__top">
        <div className="stb__who">
          <b>{who}</b>
          <small>{[a.business || b.business, b.kind === 'team' ? 'Team design' : 'Custom card', b.reseller && `via ${b.reseller}`, `ordered ${when(b.created_at)}`].filter(Boolean).join(' · ')}</small>
        </div>
        <span className={`stb__pill is-${s.tone}`}>{s.label}{b.submitted_at && b.status === 'submitted' ? ` ${when(b.submitted_at)}` : ''}</span>
        <button type="button" className="icon-btn" aria-expanded={open} aria-label={open ? 'Hide details' : 'Show details'} onClick={() => setOpen(!open)}>{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
      </div>
      <div className="stb__acts">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => { void copy(); }}><Copy size={15} /> Copy brief link</button>
        {(a.phone || b.phone) && <a className="btn btn--ghost btn--sm" href={waHref(a.whatsapp || a.phone || b.phone || '', `Hi ${who.split(' ')[0]}, this is Angel from OKUNAMI. Here is the link to send your logo, photos and style for your card: ${link(b)}`)} target="_blank" rel="noopener"><MessageCircle size={15} /> Send on WhatsApp</a>}
        {b.card_id
          ? <button type="button" className="btn btn--ink btn--sm" onClick={() => nav(`/app/cards/${b.card_id}?step=studio`)}><ExternalLink size={15} /> Open the draft</button>
          : b.status !== 'waiting' && <button type="button" className="btn btn--ink btn--sm" disabled={busy} onClick={() => { void build(); }}>{busy ? <Loader2 className="spin" size={15} /> : <Wand2 size={15} />} Build the first draft</button>}
        <label className="stb__status">
          <span className="sr-only">Status</span>
          <select value={b.status} onChange={(e) => { void setStatus(e.target.value as Brief['status']); }}>
            {(Object.keys(STATUS) as Brief['status'][]).map((k) => <option key={k} value={k}>{STATUS[k].label}</option>)}
          </select>
        </label>
      </div>
      {open && (
        <div className="stb__body">
          <div className="stb__cols">
            <dl className="stb__facts">
              <dt>Style</dt><dd>{a.vibes.length ? a.vibes.map((v) => VIBE_BY_ID[v]?.name ?? v).join(' + ') : 'Not picked yet'}</dd>
              <dt>Colors</dt><dd className="stb__sw">{a.colorsHow === 'pick' ? 'Pick for me' : a.colors.length ? a.colors.map((c) => <i key={c} style={{ background: c }} title={c} />) : 'From the logo'}</dd>
              <dt>Main button</dt><dd>{a.mainKind}{a.mainUrl ? ` · ${a.mainUrl}` : ''}</dd>
              <dt>Phone / email</dt><dd>{[a.phone || b.phone, a.email || b.email].filter(Boolean).join(' · ') || '-'}</dd>
              {a.tagline && <><dt>Tagline</dt><dd>{a.tagline}</dd></>}
              {a.services && <><dt>Services</dt><dd className="pre">{a.services}</dd></>}
              {a.likes && <><dt>Likes</dt><dd className="pre">{a.likes}</dd></>}
              {a.mustHave && <><dt>Must have</dt><dd className="pre">{a.mustHave}</dd></>}
              {a.avoid && <><dt>Avoid</dt><dd className="pre">{a.avoid}</dd></>}
              {a.team && <><dt>Team</dt><dd className="pre">{a.team}</dd></>}
            </dl>
            <div>
              <div className="stb__files">
                {b.files.length ? b.files.map((f) => <a key={f.path} href={f.url} target="_blank" rel="noopener" title={`${f.slot}: ${f.name}`}><img src={f.url} alt={`${f.slot} ${f.name}`} /><span>{f.slot}</span></a>) : <p className="adm-note">No files yet.</p>}
              </div>
              <h4 className="stb__h">Build checklist</h4>
              <ul className="stb__check">
                {BUILD_STEPS.map((step, i) => (
                  <li key={step}><button type="button" aria-pressed={done.includes(i)} onClick={() => toggle(i)}><span>{done.includes(i) && <Check size={14} />}</span>{step}</button></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function NewBrief({ onMade, flash }: { onMade: () => void; flash: (t: string, bad?: boolean) => void }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', business: '', lang: 'en', kind: 'card' });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  const make = async () => {
    if (!f.name.trim()) { flash('Add the client name first.', true); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc('fc_admin_studio_brief_new', { p_name: f.name, p_email: f.email, p_phone: f.phone, p_business: f.business, p_lang: f.lang, p_kind: f.kind });
    setBusy(false);
    if (error || !data) { flash(errText(error), true); return; }
    if (f.email.trim()) supabase.functions.invoke('studio-brief', { body: { action: 'sweep' } }).catch(() => { /* the list still shows the link */ });
    try { await navigator.clipboard.writeText(link(data as Brief)); } catch { /* copy from the list instead */ }
    flash(f.email.trim() ? 'Brief created. The link is emailed to the client and copied for you.' : 'Brief created and the link is copied. Send it to the client.');
    setF({ name: '', email: '', phone: '', business: '', lang: 'en', kind: 'card' });
    onMade();
  };
  return (
    <section className="adm-panel stb-new">
      <h3>Start a brief by hand <span>For a sale made by WhatsApp or in person</span></h3>
      <div className="stb-new__grid">
        <div className="fld"><label htmlFor="sbn-name">Client name</label><input id="sbn-name" value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div className="fld"><label htmlFor="sbn-biz">Business</label><input id="sbn-biz" value={f.business} onChange={(e) => set('business', e.target.value)} /></div>
        <div className="fld"><label htmlFor="sbn-email">Email (we email the link)</label><input id="sbn-email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div className="fld"><label htmlFor="sbn-phone">Phone</label><input id="sbn-phone" type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
        <div className="fld"><label htmlFor="sbn-lang">Language</label><select id="sbn-lang" value={f.lang} onChange={(e) => set('lang', e.target.value)}><option value="en">English</option><option value="es">Spanish</option></select></div>
        <div className="fld"><label htmlFor="sbn-kind">Design</label><select id="sbn-kind" value={f.kind} onChange={(e) => set('kind', e.target.value)}><option value="card">Custom card</option><option value="team">Custom team design</option></select></div>
      </div>
      <button type="button" className="btn btn--ink" disabled={busy} onClick={() => { void make(); }}>{busy ? <Loader2 className="spin" size={16} /> : <Plus size={16} />} Create the brief</button>
    </section>
  );
}

export default function StudioTab({ flash, rev }: { flash: (t: string, bad?: boolean) => void; rev: number }) {
  const [list, setList] = useState<Brief[] | null>(null);
  const [n, setN] = useState(0);
  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('fc_admin_studio_briefs');
    if (error) { flash(errText(error), true); setList([]); return; }
    setList((data ?? []) as Brief[]);
  }, [flash]);
  useEffect(() => {
    // catch up on any link emails a payment path did not send yet, then list
    supabase.functions.invoke('studio-brief', { body: { action: 'sweep' } }).catch(() => undefined).finally(() => { void load(); });
  }, [load, rev, n]);

  const open = list?.filter((b) => b.status !== 'delivered') ?? [];
  const delivered = list?.filter((b) => b.status === 'delivered') ?? [];
  return (
    <div className="stb-tab">
      <NewBrief onMade={() => setN((x) => x + 1)} flash={flash} />
      {list === null ? <p className="adm-empty"><Loader2 className="spin" size={16} /> Loading briefs</p> : (
        <>
          <p className="adm-count">{open.length} in progress{delivered.length ? ` · ${delivered.length} delivered` : ''}</p>
          {!list.length && <p className="adm-empty">No custom designs yet. Briefs show up here on their own when a client pays for one.</p>}
          <ul className="adm-list">{[...open, ...delivered].map((b) => <BriefRow key={b.id} b={b} flash={flash} onChange={() => setN((x) => x + 1)} />)}</ul>
        </>
      )}
    </div>
  );
}
