/* =================================================================
   The Saxophone Collection: 3 luxury designs for saxophonists, each
   built over a photo of hands on a saxophone.
   Midnight Set (the photo fills the card behind a thin gold frame;
   mother-of-pearl sax keys are the contact buttons), Velvet Room (the
   photo crowns an oxblood velvet card with a gold curve and a portrait
   medallion) and Black Tie (an engraved invitation on black card stock
   with the photo in an arched window and an RSVP row of contacts).
   Each key plays a reed note and "Hear a phrase" plays a short original
   melody (src/lib/reed.ts, silent when sound is off). Keys, booking
   sheet and tail (Share and QR code) come from the EOS set (sig8).
   Prefixes: sx-, sms__, svr__, sbt__.
   ================================================================= */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Photo, el, useCard } from './blocks';
import { BookSheet, Tail, useEos, type Key } from './sig8';
import { playPhrase, reed } from '../lib/reed';

const IMG = { ms: '/images/tpl/sax-ms.jpg', vr: '/images/tpl/sax-vr.jpg', bt: '/images/tpl/sax-bt.jpg' };
const NOTES = [466.2, 554.4, 622.3, 698.5];
const splitName = (full: string) => { const [first, ...rest] = (full || 'Your Name').split(' '); return { first, last: rest.join(' ') }; };
const go = (href: string) => { if (!href) return; if (/^https?:/.test(href)) window.open(href, '_blank', 'noopener'); else window.location.href = href; };

function useSx() {
  const eos = useEos();
  const { first, last } = splitName(eos.data.fullName);
  const [lit, setLit] = useState(-1);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((i) => window.clearTimeout(i)); }, []);
  const fire = (k: Key, i: number) => {
    reed(NOTES[i % NOTES.length], 0.45);
    if (k.book && !k.href) eos.openBook(); else go(k.href ?? '');
  };
  const phrase = () => {
    timers.current.forEach((i) => window.clearTimeout(i)); timers.current = [];
    const n = Math.max(1, eos.keys.length);
    playPhrase().forEach((t, i) => { timers.current.push(window.setTimeout(() => setLit(i % n), t * 1000)); });
    timers.current.push(window.setTimeout(() => setLit(-1), 3200));
  };
  const city = [eos.data.address.city, eos.data.address.region].filter(Boolean).join(', ');
  return { ...eos, first, last, lit, fire, phrase, city };
}

function Shell({ cls, children, booking, closeBook }: { cls: string; children: ReactNode; booking: boolean; closeBook: () => void }) {
  const { still } = useCard();
  return (
    <div className={`tpl tpl-sx ${cls}${still ? ' is-still' : ''}`}>
      <div className="pad stack">{children}</div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}
function Bg({ src, pos, label = 'Hands playing a saxophone' }: { src: string; pos: string; label?: string }) {
  return <div className="sx-photo" style={{ backgroundImage: `url(${src})`, backgroundPosition: pos }} role="img" aria-label={label} />;
}
function Name() {
  const { data } = useCard();
  const { first, last } = splitName(data.fullName);
  return <h1 className="sx-name" {...el('name')}>{first}{last && <> <i className="sx-foil">{last}</i></>}</h1>;
}
function Pearls({ keys, fire, lit }: { keys: Key[]; fire: (k: Key, i: number) => void; lit: number }) {
  if (!keys.length) return null;
  return (
    <nav className={`sx-pearls n${keys.length}`} aria-label="Contact">
      {keys.map((k, i) => (
        <button key={k.key} type="button" className={`sx-pk${lit === i ? ' is-on' : ''}`} onClick={() => fire(k, i)} aria-label={k.label}>
          <i aria-hidden>{k.icon}</i><span>{k.label}</span>
        </button>
      ))}
    </nav>
  );
}
function PhraseBtn({ onClick, label = 'Hear a phrase' }: { onClick: () => void; label?: string }) {
  return <button type="button" className="sx-ghost" onClick={onClick}><svg viewBox="0 0 24 24" aria-hidden><path d="M7 4v16l13-8z" /></svg>{label}</button>;
}
function SaveBtn({ onSave }: { onSave: () => void }) {
  return (
    <button type="button" className="sx-act" onClick={() => { [466.2, 587.3, 698.5].forEach((f, i) => reed(f, 0.35, i * 0.14, 0.12)); onSave(); }} {...el('btnPrimaryBg')}>
      <svg viewBox="0 0 24 24" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>Save my contact
    </button>
  );
}

/* ================================================================ 1 MIDNIGHT SET */
export function MidnightSet() {
  const { data, keys, save, booking, closeBook, first, last, lit, fire, phrase, city } = useSx();
  return (
    <Shell cls="tpl-sms" booking={booking} closeBook={closeBook}>
      <div className="sms__card">
        <Bg src={IMG.ms} pos="50% 30%" />
        <span className="sms__smoke" aria-hidden />
        <div className="sms__top">
          <span className="sms__mono">{data.photoUrl ? <Photo className="sms__img" /> : <b className="sx-foil">{first[0]}{last[0] ?? ''}</b>}</span>
          <p className="sx-eyebrow" {...el('caption')}>{data.jobTitle || 'Saxophonist'}{city && ` · ${city}`}</p>
        </div>
        <div className="sms__body">
          <div><Name /><p className="sx-sig">{data.tagline || 'Live, soulful, unforgettable'}</p></div>
          <Pearls keys={keys} fire={fire} lit={lit} />
          <PhraseBtn onClick={phrase} />
        </div>
      </div>
      <SaveBtn onSave={save} />
      <Tail />
    </Shell>
  );
}

/* ================================================================ 2 VELVET ROOM */
export function VelvetRoom() {
  const { data, keys, save, booking, closeBook, first, last, lit, fire, phrase, city } = useSx();
  const gid = useId().replace(/:/g, '');
  return (
    <Shell cls="tpl-svr" booking={booking} closeBook={closeBook}>
      <div className="svr__card">
        <div className="svr__photo"><Bg src={IMG.vr} pos="50% 52%" /></div>
        <span className="svr__ribbon"><i aria-hidden />NOW BOOKING</span>
        <div className="svr__curve" aria-hidden>
          <svg viewBox="0 0 400 140" preserveAspectRatio="none"><defs><linearGradient id={gid} x1="0" x2="1"><stop offset="0" stopColor="#8A6A2C" /><stop offset=".35" stopColor="#F6E2A8" /><stop offset=".6" stopColor="#C79A4A" /><stop offset="1" stopColor="#8A6A2C" /></linearGradient></defs>
            <path d="M0 60 Q200 -20 400 60 L400 140 L0 140Z" fill="#22070b" /><path d="M0 60 Q200 -20 400 60" fill="none" stroke={`url(#${gid})`} strokeWidth="3" /><path d="M0 70 Q200 -10 400 70" fill="none" stroke={`url(#${gid})`} strokeWidth="1" opacity=".6" /></svg>
        </div>
        <div className="svr__medal"><Photo className="svr__img" /></div>
        <div className="svr__body">
          <div><p className="sx-eyebrow" {...el('caption')}>The {last || first} sound</p><Name /><p className="sx-role" {...el('title')}>{data.jobTitle || 'Saxophonist'}{city && ` · ${city}`}</p></div>
          <div className="svr__rule" aria-hidden><svg viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" /></svg></div>
          <Pearls keys={keys} fire={fire} lit={lit} />
          <PhraseBtn onClick={phrase} />
        </div>
      </div>
      <SaveBtn onSave={save} />
      <Tail />
    </Shell>
  );
}

/* ================================================================ 3 BLACK TIE */
export function BlackTie() {
  const { data, keys, save, booking, closeBook, first, fire, phrase, city } = useSx();
  const tags = data.highlights.map((h) => h.title).filter(Boolean).slice(0, 2);
  return (
    <Shell cls="tpl-sbt" booking={booking} closeBook={closeBook}>
      <div className="sbt__card">
        {data.photoUrl && <div className="sbt__cameo"><Photo className="sbt__img" /></div>}
        <p className="sx-eyebrow sbt__eyebrow" {...el('caption')}>An evening with {first}</p>
        <p className="sbt__req">the pleasure of your company is requested with</p>
        <Name />
        <p className="sbt__role" {...el('title')}>{data.jobTitle || 'Saxophonist'}</p>
        <div className="sbt__arch"><Bg src={IMG.bt} pos="50% 40%" /><span>live music</span></div>
        {tags.length > 0 && <div className="sbt__tags"><span>{tags[0]}</span>{tags[1] && <><i aria-hidden /><span>{tags[1]}</span></>}</div>}
        {keys.length > 0 && (
          <nav className={`sbt__rsvp n${keys.length}`} aria-label="Contact">
            {keys.map((k, i) => <button key={k.key} type="button" onClick={() => fire(k, i)}><span aria-hidden>{k.icon}</span>{k.label}</button>)}
          </nav>
        )}
        <p className="sbt__req sbt__end">kindly RSVP{city && ` · ${city}`}</p>
      </div>
      <PhraseBtn onClick={phrase} />
      <SaveBtn onSave={save} />
      <Tail />
    </Shell>
  );
}
