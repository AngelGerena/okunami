/* =================================================================
   The X-Series Collection: 6 designs for photographers on retro-styled
   mirrorless bodies (Fuji-style). Film Sim (live film simulation
   regrade), Dials (working ISO, shutter and exposure dials with a
   meter), Viewfinder (hybrid optical/electronic finder), Recipe (the
   owner's film recipe as a trading card), Instant (an instant print
   that ejects and develops) and Mono (grainy black and white on a film
   strip with color filters). No brand marks, no trademarked film names.
   Save is a threaded silver shutter release. Keys, booking sheet and
   tail (Share and QR code) are shared with the EOS set (sig8).
   Every class uses a prefix nothing else in the app uses:
   xsr-, xfs__, xdl__, xvf__, xrc__, xin__, xmn__.
   ================================================================= */
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Logo, Photo, el, useCard } from './blocks';
import { BookSheet, Keys, Tail, useEos } from './sig8';

const place = (d: { address: { city: string; region: string } }) => [d.address.city, d.address.region].filter(Boolean).join(', ');
const withPlace = (lead: string, p: string) => (p ? `${lead} · ${p}` : lead);
const splitName = (full: string) => { const [first, ...rest] = (full || 'Your Name').split(' '); return { first, last: rest.join(' ') }; };

/** Threaded silver shutter release with an accent ring. */
function Shutter({ onSave, sub }: { onSave: () => void; sub: string }) {
  return (
    <div className="xsr-save">
      <button type="button" className="xsr-shutter" onClick={onSave} aria-label="Save contact"><i {...el('accentDetail')} aria-hidden /></button>
      <div className="xsr-save__tx"><b {...el('body')}>Save Contact</b><span {...el('caption')}>{sub}</span></div>
    </div>
  );
}

function IdRow({ eyebrow, name }: { eyebrow?: string; name?: ReactNode }) {
  const { data } = useCard();
  return (
    <header className="xsr-idrow">
      <div className="xsr-id">
        {eyebrow && <p className="xsr-eyebrow" {...el('caption')}>{eyebrow}</p>}
        <h1 className="xsr-name" {...el('name')}>{name ?? (data.fullName || 'Your Name')}</h1>
        <p className="xsr-role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p>
      </div>
      <Logo className="xsr-logo" />
    </header>
  );
}

function Toggle<T extends string>({ value, set, opts, label, className = '' }: { value: T; set: (v: T) => void; opts: [T, string][]; label: string; className?: string }) {
  const { play } = useCard();
  return (
    <div className={`xsr-seg ${className}`} role="group" aria-label={label}>
      {opts.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => { play('tap'); set(v); }}>{l}</button>)}
    </div>
  );
}

/* ================================================================ 1 FILM SIM */
const SIMS = [
  { id: 'std', name: 'Standard', f: 'none', t: '' },
  { id: 'viv', name: 'Vivid', f: 'saturate(1.45) contrast(1.12)', t: '' },
  { id: 'chr', name: 'Chrome', f: 'saturate(.7) contrast(1.14) sepia(.1) brightness(.97)', t: 'linear-gradient(180deg,rgba(40,90,100,.55),rgba(170,120,60,.35))' },
  { id: 'neg', name: 'Neg', f: 'saturate(.88) contrast(1.16) sepia(.14) hue-rotate(-8deg)', t: 'linear-gradient(180deg,rgba(30,110,90,.45),rgba(210,110,80,.35))' },
  { id: 'cin', name: 'Cine', f: 'saturate(.58) contrast(.9) brightness(1.04)', t: 'linear-gradient(180deg,rgba(40,70,90,.4),rgba(60,60,40,.2))' },
  { id: 'mon', name: 'Mono', f: 'grayscale(1) contrast(1.22)', t: '' },
] as const;
type SimId = typeof SIMS[number]['id'];
export function FilmSim() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { play } = useCard();
  const [sim, setSim] = useState<SimId>('chr');
  const s = SIMS.find((x) => x.id === sim) ?? SIMS[2];
  return (
    <div className="tpl tpl-xsr tpl-xfs">
      <div className="pad stack">
        <div className="xfs__screen" style={{ '--xfs-f': s.f } as CSSProperties}>
          <Photo className="xfs__img" />
          <span className="xfs__tint" aria-hidden style={{ background: s.t || 'none', opacity: s.t ? 0.55 : 0 }} />
          <span className="xfs__label" aria-hidden>
            <svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M9 3v18M15 3v18M6 7h3M6 11h3M6 15h3M15 7h3M15 11h3M15 15h3" /></svg>{s.name.toUpperCase()}
          </span>
          <div className="xsr-hud" aria-hidden><span>1/250</span><b {...el('accentDetail')}>F1.4</b><span>ISO 160</span><span>DR400</span></div>
        </div>
        <div className="xfs__sims" role="group" aria-label="Film simulation">
          {SIMS.map((x) => (
            <button key={x.id} type="button" className="xfs__sim" aria-pressed={sim === x.id} onClick={() => { play('tap'); setSim(x.id); }}>
              {data.photoUrl ? <img src={data.photoUrl} alt="" style={{ filter: x.f }} /> : <i style={{ filter: x.f }} />}<span>{x.name}</span>
            </button>
          ))}
        </div>
        <IdRow eyebrow={withPlace('Film simulation', place(data))} />
        <Shutter onSave={save} sub="One press, and you're developed into my contacts." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 2 DIALS */
type DialKey = 'iso' | 'ss' | 'ev';
const DIALS: Record<DialKey, { label: string; vals: string[]; base: number; size: number }> = {
  iso: { label: 'ISO', vals: ['L', '200', '400', '800', '1600', '3200', '6400', 'H'], base: 2, size: 86 },
  ss: { label: 'SHUTTER', vals: ['B', '1', '2', '4', '8', '15', '30', '60', '125', '250', '500', '1000', '4000'], base: 9, size: 114 },
  ev: { label: 'EXP ±', vals: ['-3', '-2', '-1', '0', '+1', '+2', '+3'], base: 3, size: 86 },
};
function Dial({ k, i, onTurn }: { k: DialKey; i: number; onTurn: () => void }) {
  const D = DIALS[k], step = 330 / D.vals.length, r = D.size / 2 - 17;
  return (
    <button type="button" className={`xdl__dial is-${k}`} onClick={onTurn} aria-label={`${D.label} dial, set to ${D.vals[i]}. Tap to turn`}>
      <span className="xdl__face">
        <span className="xdl__mark" aria-hidden {...el('accentDetail')} />
        <span className="xdl__ring" aria-hidden style={{ transform: `rotate(${-i * step}deg)` }}>
          {D.vals.map((v, j) => {
            const a = ((j * step - 90) * Math.PI) / 180;
            return <span key={v} className={j === i ? 'on' : ''} style={{ transform: `translate(${(Math.cos(a) * r).toFixed(1)}px,${(Math.sin(a) * r).toFixed(1)}px) rotate(${(j * step).toFixed(1)}deg) translate(-50%,-50%)` }}>{v}</span>;
          })}
        </span>
      </span>
      <small>{D.label}</small>
    </button>
  );
}
export function XDials() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { play } = useCard();
  const [pos, setPos] = useState<Record<DialKey, number>>({ iso: DIALS.iso.base, ss: DIALS.ss.base, ev: DIALS.ev.base });
  const turn = (k: DialKey) => { play('tap'); setPos((p) => ({ ...p, [k]: (p[k] + 1) % DIALS[k].vals.length })); };
  const ssv = DIALS.ss.vals[pos.ss];
  const total = ssv === 'B' ? 4 : (pos.iso - DIALS.iso.base) + (DIALS.ss.base - pos.ss) + (pos.ev - DIALS.ev.base);
  const shown = ssv === 'B' ? 'BULB' : (+ssv >= 2 ? `1/${ssv}` : `${ssv}s`);
  const bright = Math.max(0.3, Math.min(2.2, Math.pow(2, total * 0.45))).toFixed(2);
  return (
    <div className="tpl tpl-xsr tpl-xdl">
      <div className="pad stack">
        <div className="xdl__plate">
          <div className="xdl__row">
            <Dial k="iso" i={pos.iso} onTurn={() => turn('iso')} />
            <Dial k="ss" i={pos.ss} onTurn={() => turn('ss')} />
            <Dial k="ev" i={pos.ev} onTurn={() => turn('ev')} />
          </div>
          <div className="xdl__read" aria-live="polite">
            <span>{shown} · F2 · ISO {DIALS.iso.vals[pos.iso]}</span>
            <span className="xdl__meter" aria-hidden><i {...el('accentDetail')} style={{ left: `${50 + Math.max(-3, Math.min(3, total)) * 12.5}%` }} /></span>
          </div>
        </div>
        <div className="xdl__lcd" style={{ '--xdl-b': bright } as CSSProperties}><Photo className="xdl__img" /></div>
        <p className="xdl__hint" {...el('caption')}>Tap a dial to turn it. The meter and the photo follow.</p>
        <IdRow eyebrow={withPlace('Manual everything', place(data))} />
        <Shutter onSave={save} sub="Dialed in. Press to save me." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 3 VIEWFINDER */
export function HybridVF() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const [mode, setMode] = useState<'ovf' | 'evf'>('ovf');
  const { first, last } = splitName(data.fullName);
  return (
    <div className="tpl tpl-xsr tpl-xvf">
      <div className="pad stack">
        <div className="xvf__eye">
          <div className={`xvf__win${mode === 'ovf' ? ' is-ovf' : ''}`}>
            <Photo className="xvf__img" />
            <span className="xvf__frame" aria-hidden />
            <span className="xvf__af" aria-hidden />
            <div className="xvf__info t" aria-hidden><span>{mode.toUpperCase()}</span><span>35mm</span><span>BAT 92%</span></div>
            <span className="xvf__dist" aria-hidden><i /></span>
            <div className="xvf__info b" aria-hidden><span>1/500</span><span>F1.4</span><span>ISO 200</span><span>±0</span></div>
          </div>
          <div className="xvf__lever">
            <small>Viewfinder lever</small>
            <Toggle value={mode} set={setMode} opts={[['ovf', 'OVF'], ['evf', 'EVF']]} label="Viewfinder mode" className="xvf__switch" />
          </div>
        </div>
        <IdRow eyebrow={withPlace('Frame lines on', place(data))} name={<>{first}{last && <> <em>{last}</em></>}</>} />
        <Shutter onSave={save} sub="Framed, focused, saved." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 4 RECIPE */
const DEFAULT_RECIPE: [string, string][] = [
  ['Film sim', 'Chrome'], ['Grain', 'Weak · Small'], ['Color chrome', 'Strong'], ['White balance', 'Auto · R+2 B-4'],
  ['Dynamic range', 'DR400'], ['Tone curve', 'H -1 · S +1'], ['Sharpness', '-2'],
];
export function FilmRecipe() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const rows = DEFAULT_RECIPE;   // a house recipe; Sessions and other highlights stay in the tail
  return (
    <div className="tpl tpl-xsr tpl-xrc">
      <div className="pad stack">
        <div className="xrc__hero"><Photo className="xrc__img" /><span className="xrc__tag" aria-hidden>MY RECIPE</span></div>
        <IdRow eyebrow={withPlace('My recipe', place(data))} />
        <section className="xrc__card" aria-label="Signature film recipe">
          <span className="xrc__stamp" aria-hidden {...el('accentDetail')}>SIGNATURE<br />RECIPE</span>
          <div className="xrc__head"><h2>Golden Chrome</h2><span>Film recipe</span></div>
          <dl className="xrc__list">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>
        <Shutter onSave={save} sub="Save my card and I'll send you the recipe." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 5 INSTANT */
export function InstaPrint() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { play, still } = useCard();
  const [shake, setShake] = useState(0);
  const day = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  return (
    <div className={`tpl tpl-xsr tpl-xin${still ? ' is-still' : ''}`}>
      <div className="pad stack">
        <div className="xin__cam">
          <div className="xin__slot" aria-hidden><span>INSTANT</span><b {...el('accentDetail')} /></div>
          <div className="xin__track">
            <button key={shake} type="button" className="xin__print" onClick={() => { play('tap'); setShake((n) => n + 1); }} aria-label="Instant print. Tap to shake it.">
              <span className="xin__photo"><Photo className="xin__img" /></span>
              <span className="xin__cap"><span className="xin__hand">{data.fullName || 'Your Name'}</span><small>{day}</small></span>
            </button>
          </div>
          <p className="xin__tip" {...el('caption')}>Tap the print to shake it</p>
        </div>
        <IdRow eyebrow={place(data) || undefined} />
        <Shutter onSave={save} sub="Printed, signed, saved to your phone." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 6 MONO */
export function MonoStrip() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const [filter, setFilter] = useState<'y' | 'r' | 'g'>('r');
  const { first, last } = splitName(data.fullName);
  return (
    <div className="tpl tpl-xsr tpl-xmn">
      <div className="pad stack">
        <div className="xmn__frame">
          <div className="xmn__edge" aria-hidden><span>MONO 100</span><span>▸&#xFE0E; 24</span><span>24A</span></div>
          <div className={`xmn__photo is-${filter}`}><Photo className="xmn__img" /><span className="xmn__grain" aria-hidden /></div>
          <div className="xmn__edge b" aria-hidden><span>25</span><span>▸&#xFE0E; 25A</span><span>MONO 100</span></div>
        </div>
        <Toggle value={filter} set={setFilter} opts={[['y', 'Ye'], ['r', 'R'], ['g', 'G']]} label="Color filter" className="xmn__filters" />
        <div className="xmn__id">
          {place(data) && <p className="xsr-eyebrow" {...el('caption')}>{place(data)}</p>}
          <h1 className="xsr-name xmn__name" {...el('name')}>{first}{last && <> <b>{last}</b></>}</h1>
          <p className="xsr-role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p>
          <Logo className="xsr-logo xmn__logo" />
        </div>
        <Shutter onSave={save} sub="Black, white and saved in one press." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}
