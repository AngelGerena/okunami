/* =================================================================
   The Gold Ring Collection: 5 designs for photographers who shoot
   Nikon. Gold Ring, Red Grip, Tracking, My Menu and Heritage.
   Yellow (the accent) replaces the EOS red. No brand marks: the gold
   lens ring, top LCD, tracking box, menu screen and chrome film body
   do the talking. Save is a shutter release inside an ON/OFF collar.
   Keys, the booking sheet and the tail are shared with the EOS set.
   ================================================================= */
import { useState } from 'react';
import { Logo, Photo, el, useCard } from './blocks';
import { BookSheet, Keys, Tail, useEos, type Key } from './sig8';
import { formatPhone } from '../lib/links';

const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener' } : {});
const EXPO = { shutter: '1/250', aperture: '2.8', iso: '64' };

/** Shutter release in an ON/OFF power collar: the collar flips to ON, then the shutter fires and the contact saves. */
function Release({ onSave, sub }: { onSave: () => void; sub: string }) {
  const [fire, setFire] = useState(0);
  return (
    <div className="nk-save">
      <button type="button" key={fire} className={`nk-release${fire ? ' fire' : ''}`} aria-label="Save contact"
        onClick={() => { setFire((n) => n + 1); setTimeout(onSave, 240); }}>
        <span className="nk-collar" aria-hidden><span className="off">OFF</span><span className="on" {...el('accentDetail')}>ON</span></span>
        <span className="nk-btn" aria-hidden {...el('accentDetail')} />
      </button>
      <div className="nk-save__tx"><b {...el('body')}>Save Contact</b><span {...el('caption')}>{sub}</span></div>
    </div>
  );
}

function Id({ eyebrow }: { eyebrow?: string }) {
  const { data } = useCard();
  return (
    <div className="nk-id">
      {eyebrow && <p className="nk-eyebrow" {...el('caption')}>{eyebrow}</p>}
      <h1 className="nk-name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
      <p className="nk-role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p>
    </div>
  );
}

const place = (d: { address: { city: string; region: string } }) => [d.address.city, d.address.region].filter(Boolean).join(', ');

/* ================================================================ 1 GOLD RING */
export function GoldRing() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const front = `24-70mm 1:2.8 · ⌀82mm · ${(data.business || data.fullName || 'Studio').toUpperCase()} · NANO CRYSTAL COAT · `;
  return (
    <div className="tpl tpl-nk tpl-nkg">
      <div className="pad stack">
        <div className="nkg__stage">
          <div className="nkg__lens">
            <span className="nkg__zoom" aria-hidden />
            <svg className="nkg__scale" viewBox="0 0 100 100" aria-hidden>
              <defs><path id="nkTop" d="M7,50 A43,43 0 0 1 93,50" /><path id="nkBot" d="M9.5,50 A40.5,40.5 0 0 0 90.5,50" /></defs>
              <text textAnchor="middle"><textPath href="#nkTop" startOffset="50%"><tspan className="acc">∞&#xFE0E;</tspan>{'   10   5   3   2   1.5   1   .7   .5   m'}</textPath></text>
              <text textAnchor="middle"><textPath href="#nkBot" startOffset="50%">{'24     28     35     50     70   '}<tspan className="acc">mm</tspan></textPath></text>
            </svg>
            <span className="nkg__gold" aria-hidden />
            <span className="nkg__front" aria-hidden>
              <svg viewBox="0 0 100 100"><defs><path id="nkFront" d="M50,50 m-32.2,0 a32.2,32.2 0 1,1 64.4,0 a32.2,32.2 0 1,1 -64.4,0" /></defs><text><textPath href="#nkFront">{front}</textPath></text></svg>
            </span>
            <div className="nkg__glass"><Photo className="nkg__img" /></div>
          </div>
        </div>
        <div className="nkg__zoombar" aria-hidden><span>24</span><span className="nkg__track"><i {...el('accentDetail')} /></span><span>70</span><b {...el('accentDetail')}>50mm</b></div>
        <header className="nk-idrow"><Id eyebrow={place(data) || undefined} /><Logo className="nk-logo" /></header>
        <Release onSave={save} sub="Flip the switch. Fire the shutter. You're saved." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 2 RED GRIP */
export function RedGrip() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { play } = useCard();
  const [lit, setLit] = useState(false);
  return (
    <div className="tpl tpl-nk tpl-nkr">
      <div className="pad stack">
        <div className="nkr__body">
          <div className="nkr__top">
            <span className="nkr__dial" aria-hidden><span>M</span></span>
            <div className={`nkr__lcd${lit ? ' lit' : ''}`} aria-label={`Exposure ${EXPO.shutter}, f/${EXPO.aperture}, ISO ${EXPO.iso}`}>
              <div className="nkr__big"><span>{EXPO.shutter}</span><span>F{EXPO.aperture}</span><span>{EXPO.iso}</span></div>
              <div className="nkr__small"><span>ISO</span><span>AF-C</span><span>RAW</span><span>[ 1.2k ]</span></div>
            </div>
            <button type="button" className="nkr__lamp" aria-label="Light up the top screen" aria-pressed={lit} onClick={() => { setLit((v) => !v); play('tap'); }}>
              <svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></svg>
            </button>
          </div>
          <div className="nkr__photo">
            <Photo className="nkr__img" />
            <svg className="nkr__swoosh" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
              <path className="shade" d="M0,92 C120,40 260,46 400,18 L400,200 L0,200 Z" />
              <path className="line" d="M10,90 C130,38 262,44 392,18" {...el('accentDetail')} />
            </svg>
            <div className="nkr__id">
              <h1 className="nk-name nkr__name">{data.fullName || 'Your Name'}</h1>
              <p className="nk-role nkr__role"><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p>
            </div>
          </div>
        </div>
        <Release onSave={save} sub="Power on. Shutter down. I'm in your phone." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 3 TRACKING */
export function Tracking() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { still } = useCard();
  return (
    <div className={`tpl tpl-nk tpl-nkt${still ? ' is-still' : ''}`}>
      <div className="pad stack">
        <div className="nkt__frame">
          <Photo className="nkt__img" />
          <span className="nkt__shade" aria-hidden /><span className="nkt__grid" aria-hidden />
          <div className="nkt__top" aria-hidden><span>FX</span><span className="acc" {...el('accentDetail')}>AF-C · 3D</span><span>RAW L</span><span>BAT 87%</span></div>
          <div className="nkt__box" aria-hidden {...el('accentDetail')}><i /><i /><i /><i /><b>EYE</b></div>
          <div className="nkt__bar" aria-label="Exposure readout">
            <div className="nkt__row"><span>M</span><span>{EXPO.shutter}</span><span className="acc">F{EXPO.aperture}</span><span>ISO {EXPO.iso}</span><span>[1.2k]</span></div>
            <div className="nkt__meter" aria-hidden><span>+</span><span className="nkt__ticks" /><span>−</span></div>
          </div>
        </div>
        <header className="nk-idrow"><Id eyebrow={`Subject locked${data.address.city ? ` · ${data.address.city}` : ''}`} /><Logo className="nk-logo" /></header>
        <Release onSave={save} sub="Half-press locks focus. Full press saves me." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 4 MY MENU */
const TAB_PATHS = [
  'M4 8h3l2-3h6l2 3h3v11H4zM12 9.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7',
  'M3 6h13v12H3zM16 10l5-3v10l-5-3',
  'M4 20h4L19 9l-4-4L4 16z',
  'M14 6a4 4 0 0 0 5 5l-8 8a2 2 0 0 1-3-3l8-8a4 4 0 0 1-2-2z',
  'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
];
const SHORT: Record<string, string> = { call: 'Drive', wa: 'Chat', email: 'Mail', ig: 'Social', web: 'Site', soc: 'Social', book: 'Session' };

export function MyMenu() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { play } = useCard();
  const value = (k: Key) => k.key === 'call' ? formatPhone(data.phone) : k.key === 'email' ? data.email : k.key === 'book' ? '▶︎' : '';
  const row = (k: Key) => {
    const inner = <><span>{k.book ? 'Book a session' : k.label}</span><span className="nkm__v">{value(k) || '▶︎'}</span></>;
    return k.book && !k.href
      ? <li key={k.key}><button type="button" onClick={openBook}>{inner}</button></li>
      : <li key={k.key}><a href={k.href} onClick={() => play('tap')} {...ext(k.href ?? '')}>{inner}</a></li>;
  };
  const tile = (k: Key) => {
    const inner = <><small>{SHORT[k.key] ?? k.label}</small><b>{k.label}</b></>;
    const cls = k.book ? 'is-book' : '';
    return k.book && !k.href
      ? <button key={k.key} type="button" className={cls} onClick={openBook} {...el('accentDetail')}>{inner}</button>
      : <a key={k.key} className={cls} href={k.href} onClick={() => play('tap')} {...ext(k.href ?? '')}>{inner}</a>;
  };
  return (
    <div className="tpl tpl-nk tpl-nkm">
      <div className="pad stack">
        <div className="nkm__screen">
          <div className="nkm__head"><span><b {...el('accentDetail')}>★&#xFE0E;</b> MY MENU</span><span className="nkm__biz">{(data.business || '').toUpperCase()}</span></div>
          <div className="nkm__body">
            <div className="nkm__tabs" aria-hidden>{TAB_PATHS.map((d, i) => <span key={i} className={i === 4 ? 'on' : ''} {...(i === 4 ? el('accentDetail') : {})}><svg viewBox="0 0 24 24"><path d={d} /></svg></span>)}</div>
            <div className="nkm__main">
              <div className="nkm__hero">
                <span className="nkm__ph" {...el('accentDetail')}><Photo className="nkm__img" /></span>
                <div className="nk-id"><h1 className="nk-name nkm__name">{data.fullName || 'Your Name'}</h1><p className="nk-role nkm__role"><b>{data.jobTitle || 'Photographer'}</b>{place(data) && <><br />{place(data)}</>}</p></div>
              </div>
              <ul className="nkm__list">
                <li><button type="button" className="sel" onClick={save} {...el('accentDetail')}><span>Save contact</span><span className="nkm__v">OK ▶&#xFE0E;</span></button></li>
                {keys.map(row)}
              </ul>
            </div>
          </div>
          <div className="nkm__foot" aria-hidden><span><b>OK</b>Select</span><span><b>i</b>Quick menu</span><span><b>?</b>Help</span></div>
        </div>
        {keys.length > 0 && <nav className={`nkm__i n${keys.length}`} aria-label="Quick menu">{keys.map(tile)}</nav>}
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 5 HERITAGE */
const SPEEDS = ['B', '2', '8', '30', '60', '125', '500', '1000'];
export function Heritage() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  return (
    <div className="tpl tpl-nk tpl-nkh">
      <div className="pad stack">
        <div className="nkh__body">
          <div className="nkh__plate">
            <span className="nkh__dial" aria-hidden>
              <svg viewBox="0 0 56 56">{SPEEDS.map((s, i) => {
                const a = (i / SPEEDS.length) * 2 * Math.PI - Math.PI / 2;
                return <text key={s} x={28 + Math.cos(a) * 21} y={30.5 + Math.sin(a) * 21} textAnchor="middle" className={s === '125' ? 'set' : ''}>{s}</text>;
              })}</svg>
            </span>
            <div className="nkh__engr"><b>{data.business || data.fullName || 'Studio'}</b><span>FILM · DIGITAL</span></div>
            <span className="nkh__counter" aria-hidden><span>24<small {...el('accentDetail')}>EXP</small></span></span>
          </div>
          <div className="nkh__leather">
            <figure className="nkh__print"><Photo className="nkh__img" /><figcaption><span>No. 24</span><span>{data.address.city || data.business}</span></figcaption></figure>
          </div>
        </div>
        <header><Id eyebrow={place(data) || undefined} /></header>
        <Release onSave={save} sub="Advance the film. Press the release. Saved." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}
