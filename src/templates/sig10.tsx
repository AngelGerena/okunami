/* =================================================================
   The Square Format Collection: 6 designs for medium-format shooters
   (Hasselblad users). Modern digital: Medium Format, Digital Back,
   Color Target. Classic film: Waist Level, Film Back, Lunar.
   No brand marks. Modern designs save with an orange shutter, classic
   ones with a chrome winding knob. Keys, booking sheet and tail are
   shared with the EOS set (sig8).
   ================================================================= */
import { useState, type ReactNode } from 'react';
import { Logo, Photo, el, useCard } from './blocks';
import { BookSheet, Keys, Tail, useEos } from './sig8';

const place = (d: { address: { city: string; region: string } }) => [d.address.city, d.address.region].filter(Boolean).join(', ');

/** Orange shutter (modern designs). */
function Shutter({ onSave, sub }: { onSave: () => void; sub: string }) {
  return (
    <div className="sqf-save">
      <button type="button" className="sqf-shutter" onClick={onSave} aria-label="Save contact"><span {...el('accentDetail')} /></button>
      <div className="sqf-save__tx"><b {...el('body')}>Save Contact</b><span {...el('caption')}>{sub}</span></div>
    </div>
  );
}
/** Chrome winding knob (classic designs): one full turn, then the shutter fires and the contact saves. */
function Knob({ onSave, sub }: { onSave: () => void; sub: string }) {
  const [n, setN] = useState(0);
  return (
    <div className="sqf-save">
      <button type="button" className="sqf-knob" style={{ transform: `rotate(${n * 360}deg)` }} aria-label="Save contact"
        onClick={() => { setN((v) => v + 1); setTimeout(onSave, 620); }}>
        <span className="sqf-knob__mark" {...el('accentDetail')} />
      </button>
      <div className="sqf-save__tx"><b {...el('body')}>Save Contact</b><span {...el('caption')}>{sub}</span></div>
    </div>
  );
}

function IdRow({ eyebrow, name, logo = true }: { eyebrow?: string; name?: ReactNode; logo?: boolean }) {
  const { data } = useCard();
  return (
    <header className="sqf-idrow">
      <div className="sqf-id">
        {eyebrow && <p className="sqf-eyebrow" {...el('caption')}>{eyebrow}</p>}
        <h1 className="sqf-name" {...el('name')}>{name ?? (data.fullName || 'Your Name')}</h1>
        <p className="sqf-role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p>
      </div>
      {logo && <Logo className="sqf-logo" />}
    </header>
  );
}
const splitName = (full: string) => { const [first, ...rest] = (full || 'Your Name').split(' '); return { first, last: rest.join(' ') }; };

/* ================================================================ 1 MEDIUM FORMAT (modern, light) */
export function MediumFormat() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { first, last } = splitName(data.fullName);
  return (
    <div className="tpl tpl-sqf tpl-hmf sqf-alu">
      <div className="pad stack">
        <div className="hmf__cam">
          <div className="hmf__top">
            <div className="hmf__lcd" aria-label="Top display"><span><b {...el('accentDetail')}>100</b>MP</span><span>ISO 64</span><span>1/125</span><span>f/2.5</span></div>
            <span className="hmf__wheel" aria-hidden /><span className="hmf__dot" aria-hidden {...el('accentDetail')} />
          </div>
          <div className="hmf__shot"><Photo className="hmf__img" /><div className="hmf__tag" aria-hidden><span>55V · <b>4:3</b></span><span>16-BIT RAW</span></div></div>
        </div>
        <IdRow eyebrow={place(data) || undefined} name={<>{first}{last && <> <em {...el('accentDetail')}>{last}</em></>}</>} />
        <Shutter onSave={save} sub="One press of the orange button and I'm saved." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 2 DIGITAL BACK (modern, dark) */
export function DigitalBack() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  return (
    <div className="tpl tpl-sqf tpl-hdb">
      <div className="pad stack">
        <div className="hdb__mod">
          <span className="hdb__mount" aria-hidden />
          <div className="hdb__screen">
            <Photo className="hdb__img" />
            <span className="hdb__guide" aria-hidden />
            <div className="hdb__ui top" aria-hidden><span>● LIVE</span><span><b {...el('accentDetail')}>1:1</b> · 16-BIT</span><span>BAT 92%</span></div>
            <div className="hdb__ui bot" aria-label="Exposure readout"><span>1/250</span><span>f/2.8</span><span>ISO 100</span><span><b {...el('accentDetail')}>6</b> left</span></div>
          </div>
          <div className="hdb__hinge" aria-hidden><span>TILT</span><i /><span>90°</span></div>
        </div>
        <IdRow eyebrow={`Square format${data.address.city ? ` · ${data.address.city}` : ''}`} name={<>{data.fullName || 'Your Name'}<span className="hdb__dotmark" {...el('accentDetail')}>.</span></>} />
        <Shutter onSave={save} sub="Tap the orange shutter to add me to your phone." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 3 COLOR TARGET (modern, light) */
const PATCHES = ['#735244', '#c29682', '#627a9d', '#576c43', '#8580b1', '#67bdaa', '#d67e2c', '#505ba6', '#c15a63', '#5e3c6c', '#9dbc40', '#e0a32e', '#383d96', '#469449', '#af363c', '#e7c71f', '#bb5695', '#0885a1', '#f3f3f2', '#c8c8c8', '#a0a0a0', '#7a7a79', '#555555', '#343434'];
export function ColorTarget() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  return (
    <div className="tpl tpl-sqf tpl-hct sqf-alu">
      <div className="pad stack">
        <div className="hct__wrap">
          <div className="hct__photo"><Photo className="hct__img" /></div>
          <span className="hct__badge" aria-hidden><i {...el('accentDetail')} />CALIBRATED</span>
          <div className="hct__card" aria-hidden>
            <div className="hct__grid">{PATCHES.map((c) => <i key={c} style={{ background: c }} />)}</div>
            <p><span>COLOR TARGET</span><span>D50 · 16-BIT</span></p>
          </div>
        </div>
        <IdRow eyebrow={place(data) || undefined} />
        <Shutter onSave={save} sub="Press the orange button. True to life, saved." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 4 WAIST LEVEL (classic, dark) */
export function WaistLevel() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  return (
    <div className="tpl tpl-sqf tpl-hwl sqf-chrome">
      <div className="pad stack">
        <div className="hwl__leather">
          <div className="hwl__hood">
            <span className="hwl__flap t" aria-hidden /><span className="hwl__flap b" aria-hidden /><span className="hwl__flap l" aria-hidden /><span className="hwl__flap r" aria-hidden />
            <div className="hwl__frame"><div className="hwl__glass"><Photo className="hwl__img" /></div></div>
          </div>
          <div className="hwl__plate" aria-hidden><span>6×6</span><span><b {...el('accentDetail')}>f/2.8</b></span><span>80mm</span><span>1/125</span></div>
        </div>
        <IdRow eyebrow={place(data) || undefined} />
        <Knob onSave={save} sub="Wind the knob. The shutter cocks, you're saved." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 5 FILM BACK (classic, dark) */
export function FilmBack() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { still } = useCard();
  const side = (i: number) => data.gallery[i]
    ? <img className="hfb__side" src={data.gallery[i]} alt="" />
    : <span className="hfb__side hfb__neg">{data.photoUrl && <img src={data.photoUrl} alt="" />}</span>;
  return (
    <div className={`tpl tpl-sqf tpl-hfb sqf-chrome${still ? ' is-still' : ''}`}>
      <div className="pad stack">
        <div className="hfb__mag">
          <div className="hfb__slide">
            <span className="hfb__handle" aria-hidden />
            <h1 className="sqf-name hfb__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
            <p className="sqf-role hfb__role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p>
          </div>
          <div className="hfb__strip">
            <div className="hfb__frames">{side(0)}<span className="hfb__main" {...el('accentDetail')}><Photo className="hfb__img" /></span>{side(1)}</div>
            <div className="hfb__edge" aria-hidden><span>120 · 6×6</span><span>▶&#xFE0E; 7</span><span>12 EXP</span></div>
          </div>
          <div className="hfb__counter" aria-hidden><span>FILM MAGAZINE</span><span>FRAME <b>07</b></span></div>
        </div>
        {place(data) && <p className="sqf-eyebrow" {...el('caption')}>{place(data)}</p>}
        <Knob onSave={save} sub="Advance the film. Fire. You're on the roll." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 6 LUNAR (classic, black) */
const RESEAU = (() => { let p = ''; for (let r = 1; r < 5; r++) for (let c = 1; c < 5; c++) { const x = c * 20, y = r * 20; p += `M${x - 2.2},${y}H${x + 2.2}M${x},${y - 2.2}V${y + 2.2}`; } return p; })();
const CRATERS: [number, number, number][] = [[12, 30, 14], [34, 18, 8], [60, 34, 18], [82, 22, 10], [47, 48, 6]];
export function Lunar() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { first, last } = splitName(data.fullName);
  return (
    <div className="tpl tpl-sqf tpl-hlu sqf-chrome">
      <div className="pad stack">
        <div className="hlu__space">
          <span className="hlu__stars" aria-hidden /><span className="hlu__earth" aria-hidden />
          <div className="hlu__data" aria-hidden><span>EVA <b {...el('accentDetail')}>1</b></span><span>70MM</span><span>f/5.6 · 1/250</span></div>
          <div className="hlu__frame">
            <Photo className="hlu__img" />
            <svg className="hlu__reseau" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden><path d={RESEAU} /></svg>
          </div>
          <div className="hlu__moon" aria-hidden>{CRATERS.map(([l, t, s]) => <i key={l} style={{ left: `${l}%`, top: t, width: s, height: s * 0.5 }} />)}</div>
        </div>
        <IdRow eyebrow="Mission photographer" name={<>{first}{last && <><br />{last}</>}</>} />
        <Knob onSave={save} sub="Wind on. One small press. Saved." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}
