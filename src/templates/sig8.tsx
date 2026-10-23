/* =================================================================
   The EOS Collection: 4 photographer designs built around a pro DSLR
   (first made for photographer Gio Lopez on a Canon 5D Mark III).
   Top Plate, Focus Lock, Seamless and Playback.
   Each has a shutter Save button, high-gloss action keys and a
   booking sheet (shoot type, calendar, AM/PM times, message) that
   sends the request by email or text when there is no booking link.
   ================================================================= */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Phone, Mail, CalendarDays, Globe, UserPlus, X } from 'lucide-react';
import { BrandGlyph, Gallery, Highlights, Logo, Photo, QrBtn, ShareBtn, SocialLinks, el, useCard } from './blocks';
import { NETWORK_BY_ID, socialUrl } from '../lib/socials';
import { formatPhone, telHref, waHref, webHref } from '../lib/links';

const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener' } : {});
const EXPO = { shutter: '1/200', aperture: '2.8', iso: '100', focal: '85mm' };

export type Key = { key: string; label: string; href?: string; icon: ReactNode; book?: boolean };

/** Everything the EOS designs share: up to four keys (contact first, Book last) and the booking state. */
export function useEos() {
  const { data, actions, play } = useCard();
  const [booking, setBooking] = useState(false);
  const ig = data.socials.find((s) => s.network === 'instagram');
  const igUrl = ig ? socialUrl(ig.network, ig.value) : '';
  const firstSocial = data.socials.map((s) => ({ s, url: socialUrl(s.network, s.value) })).find((x) => x.url && x.s.network !== 'instagram');
  const canBook = !!(data.bookingUrl || data.email || data.phone);

  const keys = useMemo(() => {
    const k: Key[] = [];
    if (data.phone) k.push({ key: 'call', label: 'Call', href: telHref(data.phone), icon: <Phone size={22} strokeWidth={1.8} /> });
    else if (data.whatsapp) k.push({ key: 'wa', label: 'WhatsApp', href: waHref(data.whatsapp, 'Hi, I found your card and have a question.'), icon: <BrandGlyph network="whatsapp" size={22} /> });
    if (data.email) k.push({ key: 'email', label: 'Email', href: `mailto:${data.email}`, icon: <Mail size={22} strokeWidth={1.8} /> });
    if (igUrl) k.push({ key: 'ig', label: 'Instagram', href: igUrl, icon: <BrandGlyph network="instagram" size={22} /> });
    if (data.phone && data.whatsapp && k.length < 3) k.push({ key: 'wa', label: 'WhatsApp', href: waHref(data.whatsapp, 'Hi, I found your card and have a question.'), icon: <BrandGlyph network="whatsapp" size={22} /> });
    if (k.length < 3 && data.website) k.push({ key: 'web', label: 'Website', href: webHref(data.website), icon: <Globe size={22} strokeWidth={1.8} /> });
    if (k.length < 3 && firstSocial) k.push({ key: 'soc', label: NETWORK_BY_ID[firstSocial.s.network]?.label ?? 'Social', href: firstSocial.url, icon: <BrandGlyph network={firstSocial.s.network} size={22} /> });
    const out = k.slice(0, 3);
    if (canBook) out.push({ key: 'book', label: 'Book', icon: <CalendarDays size={22} strokeWidth={1.8} />, book: true, href: data.bookingUrl ? webHref(data.bookingUrl) : undefined });
    return out;
  }, [data.phone, data.whatsapp, data.email, data.website, data.bookingUrl, igUrl, firstSocial, canBook]);

  const save = () => { play('primary'); actions.save(); };
  const openBook = () => { play('open'); setBooking(true); };
  return { data, keys, save, booking, openBook, closeBook: () => { play('close'); setBooking(false); } };
}

/** One high-gloss key. Book opens the booking link, or the booking sheet when there is none. */
export function GlossKey({ k, onBook, className = 'eos-key' }: { k: Key; onBook: () => void; className?: string }) {
  const { play } = useCard();
  const cls = `${className}${k.book ? ' is-book' : ''}`;
  const inner = <><span className="eos-key__ic">{k.icon}</span><span className="eos-key__l">{k.label}</span></>;
  if (k.book && !k.href) return <button type="button" className={cls} onClick={onBook} {...el('btnPrimaryBg')}>{inner}</button>;
  return <a className={cls} href={k.href} onClick={() => play('tap')} {...ext(k.href ?? '')} {...el(k.book ? 'btnPrimaryBg' : 'btnSecondaryBg')}>{inner}</a>;
}
export function Keys({ keys, onBook }: { keys: Key[]; onBook: () => void }) {
  if (!keys.length) return null;
  return <nav className={`eos-keys n${keys.length}`} aria-label="Contact">{keys.map((k) => <GlossKey key={k.key} k={k} onBook={onBook} />)}</nav>;
}

/** The camera shutter that saves the contact. */
function Shutter({ onSave, sub }: { onSave: () => void; sub: string }) {
  return (
    <div className="eos-shutter-row">
      <button type="button" className="eos-shutter" onClick={onSave} aria-label="Save contact" {...el('btnPrimaryBg')} />
      <div className="eos-shutter__tx"><b {...el('body')}>Save Contact</b><span {...el('caption')}>{sub}</span></div>
    </div>
  );
}

/** Portfolio, sessions, socials, share and QR. */
export function Tail() {
  const { data } = useCard();
  return (
    <div className="eos-tail">
      {data.kicker && <p className="eos-gearline" {...el('caption')}><span {...el('accentDetail')} />{data.kicker}</p>}
      <div id="portfolio"><Gallery variant="grid" title="Portfolio" max={9} /></div>
      <Highlights variant="chips" />
      <SocialLinks variant="pills" title="" />
      <div className="row eos-row"><ShareBtn /><QrBtn /></div>
    </div>
  );
}

/* ================================================================ BOOKING SHEET */
const DEFAULT_SHOOTS = ['Portraits', 'Headshots', 'Events', 'Brand Session', 'Couples'];
const SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

export function BookSheet({ onClose }: { onClose: () => void }) {
  const { data, play } = useCard();
  const first = (data.fullName || 'me').split(' ')[0];
  const shoots = [...(data.highlights.length ? data.highlights.map((h) => h.title).filter(Boolean) : DEFAULT_SHOOTS), 'Something else'];
  const today = useMemo(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }, []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [f, setF] = useState({ type: '', date: null as Date | null, time: '', name: '', phone: '', email: '', msg: '' });
  const [err, setErr] = useState('');
  const [sent, setSent] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  const set = (p: Partial<typeof f>) => { setF((o) => ({ ...o, ...p })); setErr(''); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    panel.current?.querySelector<HTMLElement>('select')?.focus({ preventScroll: true });
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const y = view.getFullYear(), m = view.getMonth();
  const lead = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  const atStart = y === today.getFullYear() && m === today.getMonth();

  const check = () => {
    const miss: string[] = [];
    if (!f.type) miss.push('shoot type');
    if (!f.date) miss.push('date');
    if (!f.time) miss.push('time');
    if (!f.name.trim()) miss.push('your name');
    if (!f.phone.trim() && !f.email.trim()) miss.push(`a phone or email so ${first} can reach you`);
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) miss.push('a valid email');
    return miss;
  };
  const send = (via: 'mail' | 'sms') => {
    const miss = check();
    if (miss.length) { setErr(`Please add ${miss.join(', ')}.`); play('tap'); return; }
    const when = `${fmtDate(f.date!)} at ${f.time}`;
    const body = `Hi ${first}, I'd like to book a session.\n\nShoot: ${f.type}\nDate: ${when}\nName: ${f.name.trim()}${f.phone.trim() ? `\nPhone: ${f.phone.trim()}` : ''}${f.email.trim() ? `\nEmail: ${f.email.trim()}` : ''}${f.msg.trim() ? `\n\nDetails:\n${f.msg.trim()}` : ''}\n\nSent from your OKUNAMI card`;
    const href = via === 'mail'
      ? `mailto:${data.email}?subject=${encodeURIComponent(`Booking request: ${f.type}, ${when}`)}&body=${encodeURIComponent(body)}`
      : `sms:${telHref(data.phone).replace(/^tel:/, '')}?&body=${encodeURIComponent(body)}`;
    play('success');
    setSent(`${f.type} · ${when}`);
    window.location.href = href;
  };

  return (
    <div className="fc-sheet eos-book" role="dialog" aria-modal="true" aria-label={`Book a session with ${first}`} onClick={onClose}>
      <div className="eos-book__panel" ref={panel} onClick={(e) => e.stopPropagation()}>
        <span className="eos-book__grab" aria-hidden />
        <header className="eos-book__head">
          <div><small>Book a session</small><h2>Shoot with {first}</h2></div>
          <button type="button" className="eos-book__x" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <label className="eos-f"><span>Type of shoot</span>
          <span className="eos-sel"><select value={f.type} onChange={(e) => set({ type: e.target.value })}>
            <option value="" disabled>Choose a shoot</option>
            {shoots.map((s) => <option key={s}>{s}</option>)}
          </select></span>
        </label>
        <div className="eos-f"><span>Pick a date</span>
          <div className="eos-cal">
            <div className="eos-cal__head">
              <button type="button" disabled={atStart} onClick={() => { setView(new Date(y, m - 1, 1)); play('tap'); }} aria-label="Previous month">‹</button>
              <b>{MONTHS[m]} {y}</b>
              <button type="button" onClick={() => { setView(new Date(y, m + 1, 1)); play('tap'); }} aria-label="Next month">›</button>
            </div>
            <div className="eos-cal__grid dow" aria-hidden>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
            <div className="eos-cal__grid">
              {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
              {Array.from({ length: days }, (_, i) => {
                const dt = new Date(y, m, i + 1);
                const sel = f.date?.getTime() === dt.getTime();
                return <button type="button" key={i} disabled={dt < today} aria-pressed={sel} aria-label={fmtDate(dt)}
                  className={`${sel ? 'sel' : ''}${dt.getTime() === today.getTime() ? ' today' : ''}`} onClick={() => { set({ date: dt }); play('tap'); }}>{i + 1}</button>;
              })}
            </div>
          </div>
        </div>
        <div className="eos-f"><span>Pick a time</span>
          <div className="eos-slots" role="radiogroup" aria-label="Start time">
            {SLOTS.map((s) => <button type="button" key={s} role="radio" aria-checked={f.time === s} onClick={() => { set({ time: s }); play('tap'); }}>{s}</button>)}
          </div>
        </div>
        <div className="eos-two">
          <label className="eos-f"><span>Your name</span><input value={f.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" placeholder="Full name" /></label>
          <label className="eos-f"><span>Phone</span><input value={f.phone} onChange={(e) => set({ phone: e.target.value })} type="tel" autoComplete="tel" placeholder="(000) 000-0000" /></label>
        </div>
        <label className="eos-f"><span>Email</span><input value={f.email} onChange={(e) => set({ email: e.target.value })} type="email" autoComplete="email" placeholder="you@email.com" /></label>
        <label className="eos-f"><span>Message for {first}</span><textarea rows={4} value={f.msg} onChange={(e) => set({ msg: e.target.value })} placeholder={`Location, number of people, outfits, the vibe you're going for, anything ${first} should know.`} /></label>
        {err && <p className="eos-book__err" role="alert">{err}</p>}
        {sent && <p className="eos-book__sent" role="status"><b>Request ready</b><span>{sent}</span><span>Your app should open now. If it didn't, reach {first} at {data.phone ? formatPhone(data.phone) : data.email}.</span></p>}
        {data.email && <button type="button" className="eos-book__send" onClick={() => send('mail')}><Mail size={19} />Send request by email</button>}
        {data.phone && (data.email
          ? <button type="button" className="eos-book__alt" onClick={() => send('sms')}>Or send it by text</button>
          : <button type="button" className="eos-book__send" onClick={() => send('sms')}><Phone size={19} />Send request by text</button>)}
        <p className="eos-book__note">This opens your {data.email ? 'email' : 'messages'} app with everything filled in. Tap send there and {first} will confirm your date.</p>
      </div>
    </div>
  );
}

/* ================================================================ 1 TOP PLATE */
export function TopPlate() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { still } = useCard();
  const rim = `${(data.business || data.fullName || 'Studio').toUpperCase()} · ULTRASONIC · 1:2.8 · Ø77mm · `;
  const pop = data.popoutUrl;
  return (
    <div className={`tpl tpl-eos tpl-etp${still ? ' is-still' : ''}`}>
      <div className="pad stack">
        <div className="etp__body">
          <div className="etp__top">
            {data.logoUrl ? <Logo className="etp__logo" /> : <span className="etp__mono" {...el('accentDetail')}>{(data.business || data.fullName || 'S').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>}
            <span className="etp__model">Full Frame · Mark III</span>
            <span className="etp__dial" aria-hidden><span>M</span></span>
          </div>
          <div className={`etp__lens${pop ? ' has-pop' : ''}`}>
            <span className="etp__barrel" aria-hidden />
            <svg className="etp__rim" viewBox="0 0 100 100" aria-hidden><defs><path id="eosRim" d="M50,50 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs><text><textPath href="#eosRim">{rim}</textPath></text></svg>
            <span className="etp__red" aria-hidden {...el('accentDetail')} /><span className="etp__well" aria-hidden />
            <div className="etp__glass">{!pop && <Photo className="etp__img" />}<div className="etp__iris" aria-hidden>{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ transform: `rotate(${i * 45}deg)` }} />)}</div></div>
            {pop && <><span className="etp__shade" aria-hidden /><div className="etp__pop"><div className="etp__popin"><img src={pop} alt={data.fullName} /></div></div></>}
          </div>
          <div className="etp__lcd" aria-label={`Exposure ${EXPO.shutter}, f/${EXPO.aperture}, ISO ${EXPO.iso}`}>
            <div className="etp__big"><span>{EXPO.shutter}</span><span>F{EXPO.aperture}</span><span>{EXPO.iso}</span></div>
            <div className="etp__bar">{Array.from({ length: 13 }, (_, i) => <i key={i} className={i === 6 ? 'on' : ''} />)}</div>
            <div className="etp__row"><span>M</span><span>AWB</span><span>ONE SHOT</span><span>RAW</span><span>[9999]</span></div>
          </div>
        </div>
        <header className="eos-id">
          {(data.address.city || data.business) && <p className="eos-eyebrow" {...el('caption')}>{data.address.city ? [data.address.city, data.address.region].filter(Boolean).join(', ') : data.business}</p>}
          <h1 className="eos-name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <p className="eos-role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p>
        </header>
        <Shutter onSave={save} sub="Tap the shutter to add me to your phone" />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 2 FOCUS LOCK */
const AF_ROWS = [5, 9, 11, 11, 11, 9, 5];
const AF_LIT: Record<number, number[]> = { 1: [3, 4, 5], 2: [4, 5, 6] };
export function FocusLock() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { still } = useCard();
  return (
    <div className={`tpl tpl-eos tpl-efl${still ? ' is-still' : ''}`}>
      <div className="pad stack">
        <div className="efl__frame">
          <Photo className="efl__img" />
          <span className="efl__shade" aria-hidden /><span className="efl__corners" aria-hidden />
          <div className="efl__af" aria-hidden>{AF_ROWS.map((n, r) => <div key={r}>{Array.from({ length: n }, (_, c) => <i key={c} className={(AF_LIT[r] ?? []).includes(c) ? 'lit' : ''} {...((AF_LIT[r] ?? []).includes(c) ? el('accentDetail') : {})} />)}</div>)}</div>
          <div className="efl__data" aria-label="Viewfinder readout"><span>M</span><span>{EXPO.shutter}</span><span>F{EXPO.aperture}</span><span className="efl__scale">-2..1..<b>0</b>..1..+2</span><span>ISO{EXPO.iso}</span><i /></div>
        </div>
        <div className="efl__id">
          <header className="eos-id">
            <p className="eos-eyebrow" {...el('caption')}>In focus{data.address.city ? ` · ${data.address.city}` : ''}</p>
            <h1 className="eos-name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
            <p className="eos-role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p>
          </header>
          <Logo className="efl__logo" />
        </div>
        <Shutter onSave={save} sub="Half-press to focus. Full press to save." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 3 SEAMLESS */
export function Seamless() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  return (
    <div className="tpl tpl-eos tpl-sm">
      <div className="pad stack">
        <div className="sm__hero" {...el('pageBg')}>
          <Photo className="sm__img" />
          <span className="sm__fade" aria-hidden />
          <Logo className="sm__logo" />
          <span className="sm__tag" {...el('caption')}><i {...el('accentDetail')} />Full Frame</span>
          <div className="sm__id">
            <h1 className="sm__name" {...el('name')}>{first}{rest.length > 0 && <><br />{rest.join(' ')}</>}</h1>
            <p className="eos-role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{(data.address.city || data.business) && <> · {data.address.city || data.business}</>}</p>
          </div>
        </div>
        <Shutter onSave={save} sub={`${EXPO.focal} · f/${EXPO.aperture} · ${EXPO.shutter} · ISO ${EXPO.iso}`} />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 4 PLAYBACK */
function Histogram({ src }: { src: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const g = cv.getContext('2d'); if (!g) return;
    const paint = (bins: number[][]) => {
      const max = Math.max(1, ...bins.flat().slice(1, -1));
      g.clearRect(0, 0, cv.width, cv.height);
      g.globalCompositeOperation = 'lighter';
      ['#ff4040', '#40ff60', '#4080ff'].forEach((col, k) => {
        g.fillStyle = col; g.globalAlpha = .55; g.beginPath(); g.moveTo(0, cv.height);
        bins[k].forEach((v, i) => g.lineTo(i * (cv.width / 63), cv.height - Math.min(1, v / max) * (cv.height - 6)));
        g.lineTo(cv.width, cv.height); g.closePath(); g.fill();
      });
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = .3; g.strokeStyle = '#fff';
      for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * cv.width / 4, 0); g.lineTo(i * cv.width / 4, cv.height); g.stroke(); }
    };
    // a pleasant default curve, replaced by the real histogram when the photo allows it
    const bell = (c: number, w: number) => Array.from({ length: 64 }, (_, i) => Math.exp(-((i - c) ** 2) / (2 * w * w)) * 100 + 4);
    paint([bell(40, 9), bell(36, 10), bell(32, 11)]);
    if (!src) return;
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = 120, h = Math.max(1, Math.round(120 * img.naturalHeight / img.naturalWidth));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d'); if (!x) return;
        x.drawImage(img, 0, 0, w, h);
        const d = x.getImageData(0, 0, w, h).data;
        const bins = [new Array(64).fill(0), new Array(64).fill(0), new Array(64).fill(0)];
        for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) bins[k][d[i + k] >> 2]++;
        paint(bins);
      } catch { /* the photo host blocks reading pixels: keep the default curve */ }
    };
    img.src = src;
  }, [src]);
  return <canvas ref={ref} className="pb__hist" width={192} height={112} aria-hidden />;
}

export function Playback() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { play } = useCard();
  const Q: Record<string, string> = { call: 'Drive', wa: 'Chat', email: 'Mail', ig: 'Social', web: 'Gallery', soc: 'Social', book: 'Session' };
  return (
    <div className="tpl tpl-eos tpl-pbk">
      <div className="pad stack">
        <div className="pbk__body">
          <div className="pbk__screen">
            <Photo className="pbk__img" />
            <div className="pbk__top" aria-hidden><span>100-0001</span><span className="pbk__stars" {...el('accentDetail')}>★★★★★</span></div>
            <Histogram src={data.photoUrl} />
            <div className="pbk__bottom" aria-hidden>
              <div><span>{EXPO.shutter}</span><span>F{EXPO.aperture}</span><span>ISO {EXPO.iso}</span><span>{EXPO.focal}</span></div>
              <div className="pbk__file"><span>IMG_0001.CR2</span><span>22M 5760x3840</span></div>
            </div>
          </div>
          <div className="pbk__id">
            <Logo className="pbk__logo" />
            <div><h1 className="eos-name pbk__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><p className="eos-role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p></div>
          </div>
          <div className="pbk__q" role="navigation" aria-label="Contact">
            <button type="button" className="pbk__qi wide" onClick={save} {...el('btnPrimaryBg')}>
              <span><small>Q · Save</small><b><UserPlus size={17} />Save Contact</b></span><b aria-hidden>▶&#xFE0E;</b>
            </button>
            {keys.map((k, i) => {
              const inner = <><small>{Q[k.key] ?? k.label}</small><b>{k.icon}{k.label}</b></>;
              const cls = `pbk__qi${i === 0 ? ' sel' : ''}${k.book ? ' is-book' : ''}`;
              return k.book && !k.href
                ? <button key={k.key} type="button" className={cls} onClick={openBook}>{inner}</button>
                : <a key={k.key} className={cls} href={k.href} onClick={() => play('tap')} {...ext(k.href ?? '')}>{inner}</a>;
            })}
          </div>
          <div className="pbk__keys" aria-hidden><span>MENU</span><span>INFO</span><span>Q</span><span>PLAY</span><span>ZOOM</span></div>
        </div>
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}
