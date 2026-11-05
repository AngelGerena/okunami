/* =================================================================
   The Handyman Collection: 5 designs for handymen and contractors,
   each built on a real job-site object.
   Tape (a tape measure with the photo in the case; the blade pulls
   out), Level (a crooked photo above a spirit level; tap or tilt the
   phone to level it), Work Order (a carbon-copy ticket that checks
   itself off and signs itself), Site Badge (a hi-vis vest with an ID
   badge that flips to a QR code) and Paint Fan (a paint fan deck whose
   swatches are the contact buttons).
   Keys, booking sheet and tail (Share and QR code) come from the EOS
   set (sig8). Every class uses a prefix nothing else in the app uses:
   hm-, htp__, hlv__, hwo__, hsb__, hfd__.
   ================================================================= */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Logo, Photo, el, useCard } from './blocks';
import { BookSheet, Keys, Tail, useEos, type Key } from './sig8';
import { cardUrl } from '../lib/links';

const place = (d: { address: { city: string; region: string } }) => [d.address.city, d.address.region].filter(Boolean).join(', ');
const splitName = (full: string) => { const [first, ...rest] = (full || 'Your Name').split(' '); return { first, last: rest.join(' ') }; };
const digits = (s: string) => (s || '').replace(/\D/g, '');
const smsHref = (phone: string) => { const d = digits(phone); return d ? `sms:+${d.length === 10 ? '1' + d : d}` : ''; };

function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => { ids.current.forEach((i) => window.clearTimeout(i)); }, []);
  return {
    later: (fn: () => void, ms: number) => { ids.current.push(window.setTimeout(fn, ms)); },
    clear: () => { ids.current.forEach((i) => window.clearTimeout(i)); ids.current = []; },
  };
}

function Shell({ cls, children, booking, closeBook }: { cls: string; children: ReactNode; booking: boolean; closeBook: () => void }) {
  const { still } = useCard();
  return (
    <div className={`tpl tpl-hm ${cls}${still ? ' is-still' : ''}`}>
      <div className="pad stack">{children}</div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

function IdRow({ eyebrow }: { eyebrow?: string }) {
  const { data } = useCard();
  const { first, last } = splitName(data.fullName);
  const badges = [data.credentials, data.hours].filter(Boolean);
  return (
    <header className="hm-id">
      {eyebrow && <p className="hm-eyebrow" {...el('caption')}>{eyebrow}</p>}
      <h1 className="hm-name" {...el('name')}>{first}{last && <> <span {...el('accentDetail')}>{last}</span></>}</h1>
      <p className="hm-role" {...el('title')}><b>{data.jobTitle || 'Handyman'}</b>{data.business && <> · {data.business}</>}</p>
      {badges.length > 0 && <div className="hm-badges">{badges.map((b) => <span key={b}><svg viewBox="0 0 24 24" aria-hidden {...el('accentDetail')}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>{b}</span>)}</div>}
    </header>
  );
}

function SaveBtn({ label = 'Save my number', onClick }: { label?: string; onClick?: () => void }) {
  const { actions } = useCard();
  return (
    <button type="button" className="hm-act" onClick={onClick ?? actions.save} {...el('btnPrimaryBg')}>
      <svg viewBox="0 0 24 24" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>{label}
    </button>
  );
}

/** Free estimate strip: text a photo of the job when there is a phone number. */
function Estimate() {
  const { data } = useCard();
  const sms = smsHref(data.phone || data.whatsapp);
  return (
    <div className="hm-est" {...el('dividers')}>
      <div><b {...el('body')}>Free estimates</b><span {...el('caption')}>Send a photo of the job and get a quote.</span></div>
      {sms && <a href={`${sms}${/iP(hone|ad)/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent('Hi, can I get a quote on this job?')}`}>Text a photo</a>}
    </div>
  );
}

function End({ keys, openBook, save }: { keys: Key[]; openBook: () => void; save?: () => void }) {
  return <><SaveBtn onClick={save} /><Estimate /><Keys keys={keys} onBook={openBook} /><Tail /></>;
}

/* ================================================================ 1 TAPE */
export function TapeMeasure() {
  const { data, keys, booking, openBook, closeBook } = useEos();
  const { play, still } = useCard();
  const [out, setOut] = useState(still);
  useEffect(() => { if (still) return; const id = window.setTimeout(() => setOut(true), 500); return () => window.clearTimeout(id); }, [still]);
  const tiles = data.highlights.filter((h) => h.title).slice(0, 3);
  const { last } = splitName(data.fullName);
  return (
    <Shell cls="tpl-htp" booking={booking} closeBook={closeBook}>
      <div className={`htp__tape${out ? ' is-out' : ''}`}>
        <div className="htp__case" {...el('accentDetail')}>
          <span className="htp__lock" aria-hidden />
          <div className="htp__win"><Photo className="htp__img" /></div>
          <span className="htp__tag" aria-hidden>25 FT · {(last || data.business || 'PRO').toUpperCase().slice(0, 14)}</span>
        </div>
        <div className="htp__blade" aria-hidden {...el('accentDetail')}><i />{Array.from({ length: 14 }, (_, i) => <b key={i} className={(i + 1) % 4 === 0 ? 'red' : ''} style={{ left: 8 + i * 24 }}>{i + 1}</b>)}<span className="htp__hook" /></div>
        <button type="button" className="htp__pull" onClick={() => { setOut((o) => !o); play(out ? 'close' : 'open'); }}>
          <svg viewBox="0 0 24 24" aria-hidden {...el('accentDetail')}><path d="M5 12h14M13 6l6 6-6 6" /></svg>{out ? 'Snap it back' : 'Pull it out'}
        </button>
      </div>
      {tiles.length > 0 && <div className="htp__ruler">{tiles.map((h) => <div key={h.title} {...el('accentDetail')}><b>{h.title}</b><span>{h.subtitle}</span></div>)}</div>}
      <IdRow eyebrow={data.tagline || 'Measure twice, cut once'} />
      <End keys={keys} openBook={openBook} />
    </Shell>
  );
}

/* ================================================================ 2 LEVEL */
export function SpiritLevel() {
  const { data, keys, booking, openBook, closeBook } = useEos();
  const { play, still } = useCard();
  const [deg, setDeg] = useState(still ? 0 : -7);
  const [tilt, setTilt] = useState(false);
  const t = useTimers();
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!tilt) return;
    const on = (e: DeviceOrientationEvent) => { if (e.gamma != null) setDeg(Math.max(-10, Math.min(10, e.gamma))); };
    window.addEventListener('deviceorientation', on);
    return () => window.removeEventListener('deviceorientation', on);
  }, [tilt]);
  const levelIt = () => {
    setTilt(false); t.clear(); play('tap');
    [deg * 0.6, -deg * 0.3, deg * 0.12, 0].forEach((v, i) => t.later(() => setDeg(v), i * 260));
    t.later(() => play('success'), 1100);
  };
  const useTilt = async () => {
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    try { if (D?.requestPermission && (await D.requestPermission()) !== 'granted') { setMsg('Tilt permission was declined'); return; } } catch { /* not supported */ }
    if (!('ondeviceorientation' in window)) { setMsg('Try it on your phone'); return; }
    setMsg('Tilt your phone to level the photo'); setTilt(true); play('open');
  };
  const ok = Math.abs(deg) < 0.6;
  return (
    <Shell cls="tpl-hlv" booking={booking} closeBook={closeBook}>
      <div className={`hlv__wall${ok ? ' is-ok' : ''}`}>
        <span className="hlv__nail" aria-hidden />
        <div className="hlv__frame" style={{ transform: `rotate(${ok ? 0 : deg}deg)` }}><Photo className="hlv__img" /></div>
        <div className="hlv__bar" aria-hidden>
          <small>{(splitName(data.fullName).last || 'PRO').toUpperCase().slice(0, 10)} · 24 IN</small>
          <span className="hlv__vial"><span className="hlv__bubble" style={{ left: `${50 + deg * 3.6}%` }} /></span>
          <small>PRO SERIES</small>
        </div>
        <div className="hlv__read" aria-live="polite"><span>{ok ? 'Dead level' : 'Off by'}</span><b {...el('accentDetail')}>{Math.abs(deg).toFixed(1)}°</b></div>
      </div>
      <div className="hm-two">
        <button type="button" className="hm-btn is-pri" onClick={levelIt} {...el('btnPrimaryBg')}>Level it</button>
        <button type="button" className="hm-btn" onClick={useTilt}>Use my phone's tilt</button>
      </div>
      {msg && <p className="hm-hint" {...el('caption')}>{msg}</p>}
      <IdRow eyebrow={data.tagline || 'Square, plumb and level'} />
      <End keys={keys} openBook={openBook} />
    </Shell>
  );
}

/* ================================================================ 3 WORK ORDER */
export function WorkOrder() {
  const { data, keys, booking, openBook, closeBook } = useEos();
  const { play, still, actions } = useCard();
  const jobs = (data.highlights.length ? data.highlights : [{ title: 'Repairs', subtitle: '' }, { title: 'Installs', subtitle: '' }, { title: 'Painting', subtitle: '' }]).filter((h) => h.title).slice(0, 4);
  const [done, setDone] = useState(still ? jobs.length : 0);
  const [signed, setSigned] = useState(still);
  const [run, setRun] = useState(0);
  const t = useTimers();
  const no = useMemo(() => String(1000 + ([...(data.fullName || 'x')].reduce((a, c) => a + c.charCodeAt(0) * 7, 0) % 9000)).padStart(4, '0'), [data.fullName]);
  const today = useMemo(() => new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }), []);
  const start = () => {
    t.clear(); setDone(0); setSigned(false); setRun((r) => r + 1);
    jobs.forEach((_, i) => t.later(() => { setDone(i + 1); play('tap'); }, 500 + i * 380));
    t.later(() => setSigned(true), 500 + jobs.length * 380);
    t.later(() => play('success'), 500 + jobs.length * 380 + 1600);
  };
  useEffect(() => { if (!still) start(); }, [still]);   // eslint-disable-line react-hooks/exhaustive-deps
  const stamp = data.credentials || 'Approved';
  return (
    <Shell cls="tpl-hwo" booking={booking} closeBook={closeBook}>
      <div className={`hwo__wo${signed ? ' is-signed' : ''}`}>
        <span className="hwo__s2" aria-hidden /><span className="hwo__s3" aria-hidden />
        <div className="hwo__paper">
          <div className="hwo__head"><b>WORK<br />ORDER</b><span>No. {no}<br />{today}</span></div>
          <div className="hwo__snap"><Photo className="hwo__img" /></div>
          <div className="hwo__f"><small>TECH</small><span className="hand" {...el('accentDetail')}>{data.fullName || 'Your Name'}</span></div>
          {data.business && <div className="hwo__f"><small>COMPANY</small><span>{data.business}</span></div>}
          {place(data) && <div className="hwo__f"><small>AREA</small><span>{place(data)}</span></div>}
          <ul className="hwo__list">{jobs.map((j, i) => <li key={j.title} className={i < done ? 'is-done' : ''}><i aria-hidden {...el('accentDetail')} />{j.title}{j.subtitle && <em>{j.subtitle}</em>}</li>)}</ul>
          <div className="hwo__total"><small>ESTIMATE</small><b>FREE</b></div>
          <div className="hwo__sign"><svg key={run} viewBox="0 0 300 52" aria-label={`Signed ${data.fullName}`}><text x="4" y="42" {...el('accentDetail')}>{data.fullName || 'Your Name'}</text></svg><small>TECH SIGNATURE</small></div>
          <div className="hwo__stamp" aria-hidden>{stamp.toUpperCase().slice(0, 28)}</div>
        </div>
      </div>
      <IdRow eyebrow={`Job ticket #${no}`} />
      <End keys={keys} openBook={openBook} save={() => { start(); actions.save(); }} />
    </Shell>
  );
}

/* ================================================================ 4 SITE BADGE */
export function SiteBadge() {
  const { data, keys, booking, openBook, closeBook } = useEos();
  const { play } = useCard();
  const [flip, setFlip] = useState(false);
  const [qr, setQr] = useState('');
  const url = cardUrl(data);
  useEffect(() => {
    let dead = false;   // loaded on demand so the QR library stays out of the first paint
    import('qrcode').then((m) => m.default.toDataURL(url, { margin: 1, width: 420, color: { dark: '#111111', light: '#FFFFFF' } })).then((p) => { if (!dead) setQr(p); }).catch(() => {});
    return () => { dead = true; };
  }, [url]);
  const toggle = () => { setFlip((f) => !f); play('open'); };
  return (
    <Shell cls="tpl-hsb" booking={booking} closeBook={closeBook}>
      <div className="hsb__vest">
        <span className="hsb__lanyard" aria-hidden /><span className="hsb__clip" aria-hidden />
        <div className={`hsb__badge${flip ? ' is-flip' : ''}`} role="button" tabIndex={0} aria-pressed={flip} aria-label={flip ? 'Badge showing the QR code. Press to flip back.' : 'ID badge. Press to flip to the QR code.'}
          onClick={toggle} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}>
          <div className="hsb__in">
            <div className="hsb__side">
              <span className="hsb__slot" aria-hidden />
              <div className="hsb__top" {...el('accentDetail')}>AUTHORIZED · ON SITE</div>
              <Photo className="hsb__img" />
              {data.logoUrl && <Logo className="hsb__logo" />}
              <div className="hsb__nm">{data.fullName || 'Your Name'}</div>
              <div className="hsb__rl">{data.jobTitle || 'Handyman'}</div>
              <div className="hsb__row"><div>COMPANY<b>{data.business || 'Independent'}</b></div><div>STATUS<b>{data.credentials || 'On call'}</b></div></div>
              <div className="hsb__stripe" aria-hidden />
            </div>
            <div className="hsb__side hsb__back">
              {qr ? <img src={qr} alt="QR code to save this card" /> : <div className="hsb__qrph" />}
              <b>Scan to save</b><span>{url.replace(/^https?:\/\//, '')}</span>
            </div>
          </div>
        </div>
        <p className="hsb__hint">PRESS THE BADGE TO FLIP IT</p>
      </div>
      <IdRow eyebrow={data.tagline || 'Safety first · on site'} />
      <End keys={keys} openBook={openBook} />
    </Shell>
  );
}

/* ================================================================ 5 PAINT FAN */
const SWATCH: Record<string, [string, string]> = {
  call: ['Call Me Coral', '#E8644A'], wa: ['WhatsApp Willow', '#3FA36B'], email: ['Email Evergreen', '#3F8F6B'], book: ['Book It Blue', '#2E5AA8'],
};
const FALLBACK = ['#7B4BB8', '#F2B134', '#2E8C9A', '#6B3A6E'];
export function PaintFan() {
  const { data, keys, booking, openBook, closeBook } = useEos();
  const { play, still, actions } = useCard();
  const [open, setOpen] = useState(still);
  const chips = useMemo(() => {
    const k = keys.map((key, i) => ({ id: key.key, name: SWATCH[key.key]?.[0] ?? `${key.label} ${['Violet', 'Topaz', 'Teal', 'Plum'][i % 4]}`, c: SWATCH[key.key]?.[1] ?? FALLBACK[i % 4], key }));
    return [...k, { id: 'share', name: 'Share Sangria', c: '#B23A48', key: null as Key | null }].slice(0, 6);
  }, [keys]);
  const n = chips.length, span = Math.min(90, 18 * (n - 1));
  const tap = (c: (typeof chips)[number]) => {
    play('tap');
    if (!c.key) { actions.share(); return; }
    if (c.key.book && !c.key.href) { openBook(); return; }
    if (c.key.href) { if (/^https?:/.test(c.key.href)) window.open(c.key.href, '_blank', 'noopener'); else window.location.href = c.key.href; }
  };
  return (
    <Shell cls="tpl-hfd" booking={booking} closeBook={closeBook}>
      <div className={`hfd__fan${open ? ' is-open' : ''}`} onClick={(e) => { if (!open && !(e.target as HTMLElement).closest('.hfd__chip')) { setOpen(true); play('open'); } }}>
        <div className="hfd__photo"><Photo className="hfd__img" /></div>
        {chips.map((c, i) => (
          <button key={c.id} type="button" className="hfd__chip" style={{ zIndex: i + 1, transform: `rotate(${open ? -span / 2 + (n > 1 ? (i * span) / (n - 1) : 0) : (i - (n - 1) / 2) * 2}deg)`, ['--sw' as string]: c.c }}
            onClick={() => { if (!open) { setOpen(true); play('open'); return; } tap(c); }} aria-label={c.key ? c.key.label : 'Share card'}>
            <span className="hfd__lbl"><b>{c.name}</b><small>{c.key ? c.key.label.toUpperCase() : 'SHARE'}</small></span><i /><i /><i />
          </button>
        ))}
        <span className="hfd__pivot" aria-hidden />
        <span className="hfd__tip" aria-hidden>{open ? 'PICK A COLOR' : 'OPEN THE FAN'}</span>
      </div>
      <IdRow eyebrow={data.tagline || 'Fresh paint · fair price'} />
      <End keys={keys} openBook={openBook} />
    </Shell>
  );
}
