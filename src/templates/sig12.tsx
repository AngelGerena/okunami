/* =================================================================
   The Mirrorless Collection: 6 designs for mirrorless shooters
   (Sony-style bodies). Each look is built on something the camera
   actually shows: Eye AF tracking, exposure zebras and focus peaking
   (both computed from the owner's own photo), an S-Log cinema rig,
   the bare full-frame sensor, and bokeh. No brand marks.
   Save is a half-press shutter: a green focus lock and two beeps,
   then it fires. Keys, booking sheet and tail are shared with the
   EOS set (sig8). Every class uses a prefix nothing else in the app
   uses: mrl-, mea__, mzb__, mpk__, msl__, mse__, mbk__.
   ================================================================= */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Logo, Photo, el, useCard } from './blocks';
import { BookSheet, Keys, Tail, useEos } from './sig8';

const place = (d: { address: { city: string; region: string } }) => [d.address.city, d.address.region].filter(Boolean).join(', ');
const withPlace = (lead: string, p: string) => (p ? `${lead} · ${p}` : lead);

/** Half-press shutter: green focus lock with two beeps, then the full press saves. */
function Shutter({ onSave, sub, rec = false }: { onSave: () => void; sub: string; rec?: boolean }) {
  const { play } = useCard();
  const [lock, setLock] = useState(false);
  const busy = useRef(false);
  const press = () => {
    if (busy.current) return;
    busy.current = true; setLock(true); play('tap');
    setTimeout(() => play('tap'), 90);
    setTimeout(onSave, 380);
    setTimeout(() => { setLock(false); busy.current = false; }, 1400);
  };
  return (
    <div className="mrl-save">
      <button type="button" className={`mrl-shutter${rec ? ' is-rec' : ''}${lock ? ' is-lock' : ''}`} onClick={press} aria-label="Save contact">
        <span className="mrl-shutter__ring" {...el('accentDetail')} /><i aria-hidden />
      </button>
      <div className="mrl-save__tx"><b {...el('body')}>Save Contact</b><span {...el('caption')}>{sub}</span></div>
    </div>
  );
}

function IdRow({ eyebrow, name }: { eyebrow?: string; name?: ReactNode }) {
  const { data } = useCard();
  return (
    <header className="mrl-idrow">
      <div className="mrl-id">
        {eyebrow && <p className="mrl-eyebrow" {...el('caption')}>{eyebrow}</p>}
        <h1 className="mrl-name" {...el('name')}>{name ?? (data.fullName || 'Your Name')}</h1>
        <p className="mrl-role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p>
      </div>
      <Logo className="mrl-logo" />
    </header>
  );
}

function Exposure({ extra }: { extra?: ReactNode }) {
  return (
    <div className="mrl-hud bot" aria-hidden>
      <span>1/250</span><span className="o" {...el('accentDetail')}>F1.8</span><span>ISO 100</span><span>±0.0</span>{extra}
    </div>
  );
}

/* ---------- real zebras and focus peaking, computed from the owner's photo */
function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, posY = 0.16) {
  const ir = img.naturalWidth / img.naturalHeight, cr = w / h;
  let sw: number, sh: number, sx: number, sy: number;
  if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) / 2; sy = 0; }
  else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) * posY; }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

/** Draws zebras or peaking over the photo. Peaking animates in like a focus ring settling unless the card is still. */
function useFx(kind: 'zebra' | 'peak', onDist?: (v: string) => void) {
  const { data, still } = useCard();
  const ref = useRef<HTMLCanvasElement>(null);
  const distRef = useRef(onDist);
  distRef.current = onDist;
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !data.photoUrl) return;
    let timer: number | undefined;
    let dead = false;
    const img = new Image();
    if (!data.photoUrl.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (dead) return;
      const w = 400, h = 500;
      cv.width = w; cv.height = h;
      const off = document.createElement('canvas'); off.width = w; off.height = h;
      const o = off.getContext('2d'); const ctx = cv.getContext('2d');
      if (!o || !ctx) return;
      coverDraw(o, img, w, h);
      let src: Uint8ClampedArray;
      try { src = o.getImageData(0, 0, w, h).data; } catch { return; }   // a photo host without CORS: the effect stays off
      const out = ctx.createImageData(w, h), d = out.data;
      const lum = new Float32Array(w * h);
      for (let i = 0, p = 0; i < src.length; i += 4, p++) lum[p] = (0.2126 * src[i] + 0.7152 * src[i + 1] + 0.0722 * src[i + 2]) / 255;
      if (kind === 'zebra') {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const p = y * w + x; if (lum[p] < 0.86) continue;
          const k = p * 4, on = ((x + y) % 10) < 5;
          d[k] = d[k + 1] = d[k + 2] = on ? 255 : 20; d[k + 3] = 200;
        }
        ctx.putImageData(out, 0, 0);
        return;
      }
      const mag = new Float32Array(w * h);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const p = y * w + x;
        const gx = -lum[p - w - 1] - 2 * lum[p - 1] - lum[p + w - 1] + lum[p - w + 1] + 2 * lum[p + 1] + lum[p + w + 1];
        const gy = -lum[p - w - 1] - 2 * lum[p - w] - lum[p - w + 1] + lum[p + w - 1] + 2 * lum[p + w] + lum[p + w + 1];
        mag[p] = Math.hypot(gx, gy) * (y < h * 0.62 && x > w * 0.2 && x < w * 0.8 ? 1.25 : 0.55);   // the subject is sharp, the room falls off
      }
      const draw = (t: number) => {
        const thr = 1.9 - t * 1.25;
        d.fill(0);
        for (let p = 0; p < mag.length; p++) if (mag[p] > thr) { const k = p * 4; d[k] = 255; d[k + 1] = 40; d[k + 2] = 40; d[k + 3] = 235; }
        ctx.putImageData(out, 0, 0);
        distRef.current?.(t < 1 ? (8 - t * 6.8).toFixed(1) : '1.2');
      };
      if (still) { draw(1); return; }
      let step = 0;
      timer = window.setInterval(() => {
        step++; const t = Math.min(1, step / 18); draw(t);
        if (t >= 1) window.clearInterval(timer);
      }, 55);
    };
    img.src = data.photoUrl;
    return () => { dead = true; if (timer) window.clearInterval(timer); };
  }, [data.photoUrl, kind, still]);
  return ref;
}

function FxToggle({ on, set, labels, label }: { on: boolean; set: (v: boolean) => void; labels: [string, string]; label: string }) {
  const { play } = useCard();
  return (
    <div className="mrl-toggle" role="group" aria-label={label}>
      <button type="button" aria-pressed={on} onClick={() => { play('tap'); set(true); }}>{labels[0]}</button>
      <button type="button" aria-pressed={!on} onClick={() => { play('tap'); set(false); }}>{labels[1]}</button>
    </div>
  );
}

/* ================================================================ 1 EYE AF */
export function EyeAF() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { still } = useCard();
  return (
    <div className={`tpl tpl-mrl tpl-mea${still ? ' is-still' : ''}`}>
      <div className="pad stack">
        <div className="mrl-evf">
          <Photo className="mrl-evf__img" />
          <div className="mrl-hud top" aria-hidden><span>AF-C</span><span className="mrl-badge">EYE · HUMAN</span><span>RAW</span><span>BAT 84%</span></div>
          <span className="mea__track" aria-hidden><span className="mea__tag">EYE</span></span>
          <Exposure extra={<span className="mea__dot" aria-hidden />} />
        </div>
        <IdRow eyebrow={withPlace('Eye locked', place(data))} />
        <Shutter onSave={save} sub="Half-press: green box, two beeps. Full press: saved." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 2 ZEBRAS */
export function Zebras() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const [on, setOn] = useState(true);
  const ref = useFx('zebra');
  return (
    <div className="tpl tpl-mrl tpl-mzb">
      <div className="pad stack">
        <div className="mrl-evf">
          <Photo className="mrl-evf__img" />
          <canvas ref={ref} className="mrl-fx" style={{ opacity: on ? 1 : 0 }} aria-hidden />
          <div className="mrl-hud top" aria-hidden><span>M</span><span className="mrl-badge">ZEBRA 95+</span><span>RAW</span><span>BAT 84%</span></div>
          <div className="mzb__legend" aria-hidden><span><i />Highlights</span></div>
          <FxToggle on={on} set={setOn} labels={['ON', 'OFF']} label="Zebras" />
          <Exposure />
        </div>
        <IdRow eyebrow={withPlace('Exposed right', place(data))} />
        <Shutter onSave={save} sub="Perfectly exposed. One press to save." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 3 PEAKING */
export function Peaking() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const [on, setOn] = useState(true);
  const [dist, setDist] = useState('∞');
  const ref = useFx('peak', setDist);
  return (
    <div className="tpl tpl-mrl tpl-mpk">
      <div className="pad stack">
        <div className="mrl-evf">
          <Photo className="mrl-evf__img" />
          <canvas ref={ref} className="mrl-fx" style={{ opacity: on ? 1 : 0 }} aria-hidden />
          <div className="mrl-hud top" aria-hidden><span>MF</span><span className="mrl-badge">PEAKING · RED · HIGH</span><span>BAT 84%</span></div>
          <div className="mpk__ring" aria-hidden><span><b>{dist}</b>meters</span></div>
          <FxToggle on={on} set={setOn} labels={['PEAK', 'OFF']} label="Peaking" />
          <Exposure />
        </div>
        <IdRow eyebrow={withPlace('In focus', place(data))} />
        <Shutter onSave={save} sub="Sharp from here to the eyelashes. Save me." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 4 S-LOG */
const pad2 = (n: number) => String(n).padStart(2, '0');
export function SLog() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { still, play } = useCard();
  const [graded, setGraded] = useState(still);
  const [frame, setFrame] = useState(still ? 172 : 0);
  useEffect(() => {
    if (still) return;
    const tc = window.setInterval(() => setFrame((f) => f + 1), 1000 / 30);
    const g = window.setTimeout(() => setGraded(true), 900);
    return () => { window.clearInterval(tc); window.clearTimeout(g); };
  }, [still]);
  const s = Math.floor(frame / 30);
  const tc = `00:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)};${pad2(frame % 30)}`;
  const pick = (v: boolean) => { play('tap'); setGraded(v); };
  return (
    <div className="tpl tpl-mrl tpl-msl">
      <div className="pad stack">
        <div className="msl__rig">
          <div className="msl__handle" aria-hidden><span className="msl__tally" /><span>CINEMA RIG</span><span>XLR</span></div>
          <div className={`msl__screen${graded ? '' : ' is-flat'}`}>
            <Photo className="msl__img" />
            <span className="msl__bars t" aria-hidden /><span className="msl__bars b" aria-hidden />
            <div className="mrl-hud top" aria-hidden><span className="r">● REC</span><span>{tc}</span><span className="mrl-badge">{graded ? 'LUT · 709' : 'S-LOG3'}</span></div>
            <div className="mrl-hud bot" aria-hidden><span>4K 60p</span><span>1/120</span><span className="o" {...el('accentDetail')}>T1.8</span><span>ISO 800</span></div>
            <div className="mrl-toggle msl__lut" role="group" aria-label="Color">
              <button type="button" aria-pressed={!graded} onClick={() => pick(false)}>LOG</button>
              <button type="button" aria-pressed={graded} onClick={() => pick(true)}>LUT</button>
            </div>
          </div>
        </div>
        <IdRow eyebrow={withPlace('Photo + video', place(data))} />
        <Shutter onSave={save} sub="Hit record. You're in my contacts." rec />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 5 SENSOR */
const TABS: [number, number, number][] = [[50, 3.5, 0], [96.5, 50, 90], [50, 96.5, 180], [3.5, 50, 270]];
export function Sensor() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  return (
    <div className="tpl tpl-mrl tpl-mse">
      <div className="pad stack">
        <div className="mse__body">
          <div className="mse__mount" {...el('accentDetail')}>
            {TABS.map(([x, y, r]) => <span key={r} className="mse__tab" aria-hidden style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) rotate(${r}deg)` }} />)}
            <div className="mse__sensor"><Photo className="mse__img" /></div>
          </div>
          <div className="mse__spec" aria-hidden><span>35.9 × 23.9 mm</span><b {...el('accentDetail')}>Full frame</b><span>BSI</span></div>
        </div>
        <IdRow eyebrow={withPlace('Full frame', place(data))} />
        <Shutter onSave={save} sub="Every pixel says save this contact." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 6 BOKEH */
const ORBS: [number, number, number, number][] = [[8, 12, 70, 0], [70, 6, 90, 1], [82, 40, 60, 0], [4, 52, 54, 1], [62, 58, 40, 0], [20, 30, 34, 1], [88, 74, 80, 0], [40, 6, 46, 1], [-6, 78, 90, 0]];
export function Bokeh() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  const last = rest.join(' ');
  return (
    <div className="tpl tpl-mrl tpl-mbk">
      <div className="pad stack">
        <div className="mbk__photo">
          <Photo className="mbk__img" />
          <span className="mbk__orbs" aria-hidden>
            {ORBS.map(([x, y, s, c], i) => <i key={i} className={c ? 'c' : ''} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `-${i * 1.3}s` }} />)}
          </span>
          <span className="mbk__fade" aria-hidden />
          <span className="mbk__lens" aria-hidden>85mm · f/1.2</span>
          <div className="mbk__id">
            {place(data) && <p className="mrl-eyebrow" {...el('caption')}>{place(data)}</p>}
            <h1 className="mrl-name mbk__name" {...el('name')}>{first}{last && <> <b>{last}</b></>}</h1>
            <p className="mrl-role" {...el('title')}><b>{data.jobTitle || 'Photographer'}</b>{data.business && <> · {data.business}</>}</p>
          </div>
        </div>
        <Shutter onSave={save} sub="Shot wide open. Saved in one tap." />
        <Keys keys={keys} onBook={openBook} />
        <Tail />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}
