import { useEffect, useState } from 'react';
import { Check, Clock, ImagePlus, Loader2, PencilRuler, Send, X } from 'lucide-react';
import { editsApi, type EditRequest, type EditsStatus } from '../lib/edits';
import { store } from '../lib/store';
import type { Card } from '../lib/types';
import { rich, useT } from '../lib/i18n';
import { useBackToClose } from '../lib/useBackToClose';

/** Pro Plus: "Up to 2 small edits a month, done for you." A counter on the dashboard plus a short request form. */
export default function EditRequests({ cards, plan }: { cards: Card[] | null; plan: string }) {
  const { t, lang } = useT();
  const [st, setSt] = useState<EditsStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const load = () => editsApi.status(plan).then(setSt).catch(() => setSt(null));
  useEffect(() => { void load(); }, [plan]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!st || !st.allowed) return null;
  const left = Math.max(0, st.limit - st.used);
  const resets = new Date(`${st.resets_on}T12:00:00Z`).toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  return (
    <section className="edits" aria-labelledby="edits-h">
      <div className="edits__top">
        <span className="edits__ic" aria-hidden="true"><PencilRuler size={20} /></span>
        <div className="edits__txt">
          <h2 id="edits-h">{t("Done-for-you edits")}</h2>
          <p>{t("Up to {n} small edits a month, made for you by Finesse Media. Usually done within 2 business days.", { n: st.limit })}</p>
        </div>
        <div className="edits__count" role="status">
          <span className="edits__dots" aria-hidden="true">{Array.from({ length: st.limit }, (_, i) => <i key={i} className={i < st.used ? 'on' : ''} />)}</span>
          <b>{t("{used} of {limit} used this month", { used: st.used, limit: st.limit })}</b>
          <small>{left > 0 ? t("Resets {date}. Unused edits do not roll over.", { date: resets }) : t("You have used both. They reset {date}.", { date: resets })}</small>
        </div>
        <button type="button" className="btn btn--gold btn--sm edits__go" onClick={() => { setSent(null); setOpen(true); }} disabled={left === 0}><Send size={15} /> {t("Request an edit")}</button>
      </div>
      {sent && <p className="edits__ok" role="status"><Check size={15} /> {sent}</p>}
      {st.recent.length > 0 && (
        <ul className="edits__list">
          {st.recent.slice(0, 4).map((r) => <EditItem key={r.id} r={r} />)}
        </ul>
      )}
      {open && <EditDialog cards={cards ?? []} plan={plan} left={left} limit={st.limit} onClose={() => setOpen(false)}
        onSent={(used) => { setOpen(false); setSent(t("Request sent. This is edit {used} of {limit} this month. We will email you when it is done.", { used, limit: st.limit })); void load(); }} />}
    </section>
  );
}

function EditItem({ r }: { r: EditRequest }) {
  const { t, lang } = useT();
  const when = new Date(r.created_at).toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { month: 'short', day: 'numeric' });
  const pill = r.status === 'done' ? <span className="edits__pill is-ok"><Check size={12} /> {t("Done")}</span>
    : r.status === 'declined' ? <span className="edits__pill is-muted">{t("Quoted separately")}</span>
    : <span className="edits__pill is-wait"><Clock size={12} /> {t("In progress")}</span>;
  return (
    <li>
      <span className="edits__when">{when}</span>
      <span className="edits__what">{r.details}{r.status === 'declined' && <small>{t("Bigger than a small edit, so it did not use one of your edits.")}</small>}</span>
      {pill}
    </li>
  );
}

function EditDialog({ cards, plan, left, limit, onClose, onSent }: { cards: Card[]; plan: string; left: number; limit: number; onClose: () => void; onSent: (used: number) => void }) {
  const { t, lang } = useT();
  const [cardId, setCardId] = useState<string>(cards[0]?.id ?? '');
  const [details, setDetails] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useBackToClose(() => { if (!busy) onClose(); });

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose, busy]);

  const pick = async (f: File | undefined) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) { setErr(t("Please choose a photo (JPG, PNG or HEIC).")); return; }
    setErr(''); setUploading(true);
    try { setPhoto(await store.uploadImage(f, 'photo')); } catch (e) { setErr(e instanceof Error ? e.message : t("Upload failed. Please try again.")); }
    setUploading(false);
  };
  const send = async () => {
    if (details.trim().length < 3) { setErr(t("Tell us what you want changed.")); return; }
    setBusy(true); setErr('');
    try { const r = await editsApi.request({ cardId: cardId || null, details, photoUrl: photo, lang }, plan); onSent(r.used); }
    catch (e) { setErr(e instanceof Error ? e.message : t("Could not send your request.")); setBusy(false); }
  };

  return (
    <div className="td" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="td__box" role="dialog" aria-modal="true" aria-labelledby="ed-req-h">
        <header><h2 id="ed-req-h">{t("Request an edit")}</h2><button type="button" className="icon-btn" aria-label={t("Close")} onClick={onClose} disabled={busy}><X size={18} /></button></header>
        <p className="td__lead">{rich(t("You have <b>{left} of {limit}</b> edits left this month. One request is one small change.", { left, limit }), { b: (c) => <b>{c}</b> })}</p>

        <div className="edits__rules">
          <div><b>{t("Counts as an edit")}</b>
            <ul><li>{t("Swap a photo or logo")}</li><li>{t("Update hours, prices, services or menu")}</li><li>{t("Change or add a link or button")}</li><li>{t("Fix wording or add a promo or event line")}</li></ul>
          </div>
          <div><b>{t("Quoted separately")}</b>
            <ul><li>{t("A new design or look")}</li><li>{t("A brand-new section")}</li><li>{t("Anything that takes more than about 15 minutes")}</li></ul>
          </div>
        </div>

        {cards.length > 1 && (
          <label className="fld"><span>{t("Which card?")}</span>
            <select value={cardId} onChange={(e) => setCardId(e.target.value)}>
              {cards.map((c) => <option key={c.id} value={c.id}>{c.data.fullName || c.data.business || t('Untitled card')}</option>)}
            </select>
          </label>
        )}
        <label className="fld"><span>{t("What should we change?")}</span>
          <textarea rows={4} maxLength={1500} value={details} onChange={(e) => setDetails(e.target.value)} autoFocus
            placeholder={t("Example: Change my Saturday hours to 9:00 AM - 3:00 PM.")} />
          <small>{t("{n} characters left", { n: 1500 - details.length })}</small>
        </label>

        <div className="edits__photo">
          {photo ? (
            <span className="edits__thumb"><img src={photo} alt={t("Photo to use")} /><button type="button" className="icon-btn" aria-label={t("Remove photo")} onClick={() => setPhoto(null)}><X size={14} /></button></span>
          ) : (
            <label className="btn btn--ghost btn--sm">{uploading ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />} {t("Add a photo (optional)")}
              <input type="file" accept="image/*" className="sr" onChange={(e) => void pick(e.target.files?.[0])} disabled={uploading || busy} />
            </label>
          )}
        </div>

        {err && <p className="err" role="alert">{err}</p>}
        <footer className="edits__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>{t("Cancel")}</button>
          <button type="button" className="btn btn--gold" onClick={send} disabled={busy || uploading || left === 0}>{busy ? <Loader2 size={16} className="spin" /> : <Send size={16} />} {t("Send request")}</button>
        </footer>
      </div>
    </div>
  );
}
