/* =================================================================
   The Cinema Collection: 5 designs for cinematographers.
   Cine Screen (touchscreen monitor with live histogram, audio meters,
   REC timecode and false color computed from the owner's photo),
   Cine Brain (modular black body, red monitor, histogram, clipping
   posts and frame guides), Focus Guide (dual pixel guide racking into
   focus), 8K Punch (full frame with a 5x punch-in) and Slate (a
   clapperboard with a take counter and running timecode).
   Save is a record button. A YouTube or Vimeo link in the owner's
   socials becomes a "Watch my reel" button. Keys, booking sheet and
   tail (Share and QR code) are shared with the EOS set (sig8).
   No brand marks. Every class uses a prefix nothing else in the app
   uses: cin-, ccs__, cbr__, cfg__, cpi__, csl__.
   ================================================================= */
import { useEffect, useRef, useState } from 'react';
import { Logo, Photo, el, useCard } from './blocks';
import { BookSheet, Keys, Tail, useEos } from './sig8';
import { socialUrl } from '../lib/socials';

const place = (d: { address: { city: string; region: string } }) => [d.address.city, d.address.region].filter(Boolean).join(', ');
const withPlace = (lead: string, p: string) => (p ? `${lead} · ${p}` : lead);
const splitName = (full: string) => { const [first, ...rest] = (full || 'Your Name').split(' '); return { first, last: rest.join(' ') }; };
const pad2 = (n: number) => String(n).padStart(2, '0');
const tcStr = (f: number, fps = 24) => { const s = Math.floor(f / fps); return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}:${pad2(f % fps)}`; };

/* ---------- shared pieces */
function RecSave({ onSave, sub }: { onSave: () => void; sub: string }) {
  const [on, setOn] = useState(false);
  const t = useRef<number>();
  useEffect(() => () => window.clearTimeout(t.current), []);
  const press = () => { setOn(true); onSave(); window.clearTimeout(t.current); t.current = window.setTimeout(() => setOn(false), 1200); };
  return (
    <div className="cin-save">
      <button type="button" className={`cin-rec${on ? ' is-on' : ''}`} onClick={press} aria-label="Save contact" />
      <div className="cin-save__tx"><b {...el('body')}>Save Contact <i className={on ? 'is-on' : ''} aria-hidden>REC</i></b><span {...el('caption')}>{sub}</span></div>
    </div>
  );
}

function IdRow({ eyebrow }: { eyebrow?: string }) {
  const { data } = useCard();
  const { first, last } = splitName(data.fullName);
  return (
    <header className="cin-idrow">
      <div className="cin-id">
        {eyebrow && <p className="cin-eyebrow" {...el('caption')}>{eyebrow}</p>}
        <h1 className="cin-name" {...el('name')}>{first}{last && <> <span {...el('accentDetail')}>{last}</span></>}</h1>
        <p className="cin-role" {...el('title')}><b>{data.jobTitle || 'Cinematographer'}</b>{data.business && <> · {data.business}</>}</p>
      </div>
      <Logo className="cin-logo" />
    </header>
  );
}

/** "Watch my reel" from a YouTube or Vimeo link in the owner's socials. Hidden when there is none. */
function Reel() {
  const { data, play } = useCard();
  const s = data.socials.find((x) => x.network === 'vimeo' && x.value) ?? data.socials.find((x) => x.network === 'youtube' && x.value);
  const url = s ? socialUrl(s.network, s.value) : '';
  if (!url) return null;
  return (
    <a className="cin-reel" href={url} target="_blank" rel="noopener" onClick={() => play('open')}>
      <span className="cin-reel__thumb" aria-hidden>{data.photoUrl && <img src={data.photoUrl} alt="" />}<i {...el('accentDetail')} /></span>
      <span className="cin-reel__tx"><b {...el('body')}>Watch my reel</b><span {...el('caption')}>{s!.network === 'vimeo' ? 'On Vimeo' : 'On YouTube'}</span></span>
    </a>
  );
}

function Seg<T extends string>({ value, set, opts, label }: { value: T; set: (v: T) => void; opts: [T, string][]; label: string }) {
  const { play } = useCard();
  return (
    <span className="cin-seg" role="group" aria-label={label}>
      {opts.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => { play('tap'); set(v); }}>{l}</button>)}
    </span>
  );
}

function Bottom({ save, sub, keys, openBook }: { save: () => void; sub: string; keys: ReturnType<typeof useEos>['keys']; openBook: () => void }) {
  return (
    <>
      <RecSave onSave={save} sub={sub} />
      <Keys keys={keys} onBook={openBook} />
      <Reel />
      <Tail />
    </>
  );
}

/* ---------- pixel analysis of the owner's photo (false color, histograms, clipping) */
type Lum = { w: number; h: number; lum: Float32Array };
function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, posY = 0.16) {
  const ir = img.naturalWidth / img.naturalHeight, cr = w / h;
  let sw: number, sh: number, sx: number, sy: number;
  if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) / 2; sy = 0; }
  else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) * posY; }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}
function useLum(url: string): Lum | null {
  const [lum, setLum] = useState<Lum | null>(null);
  useEffect(() => {
    setLum(null);
    if (!url) return;
    let dead = false;
    const img = new Image();
    if (!url.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (dead) return;
      const w = 320, h = 400, c = document.createElement('canvas'); c.width = w; c.height = h;
      const o = c.getContext('2d'); if (!o) return;
      coverDraw(o, img, w, h);
      let d: Uint8ClampedArray;
      try { d = o.getImageData(0, 0, w, h).data; } catch { return; }   // a photo host without CORS: the tools stay off
      const l = new Float32Array(w * h);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) l[p] = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
      setLum({ w, h, lum: l });
    };
    img.src = url;
    return () => { dead = true; };
  }, [url]);
  return lum;
}
function Hist({ lum, color, bg, className }: { lum: Lum | null; color: string; bg: string; className: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = (cv.width = Math.max(1, cv.clientWidth * 2)), H = (cv.height = Math.max(1, cv.clientHeight * 2));
    const ctx = cv.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    if (!lum) return;
    const bins = new Float32Array(64);
    for (const v of lum.lum) bins[Math.min(63, (v * 64) | 0)]++;
    const max = Math.max(...bins);
    ctx.fillStyle = color;
    bins.forEach((b, i) => { const bh = Math.max(1, (b / max) * (H - 4)); ctx.fillRect((i * W) / 64, H - bh, W / 64 - 1, bh); });
  }, [lum, color, bg]);
  return <canvas ref={ref} className={className} aria-hidden />;
}
function FalseColor({ lum, on }: { lum: Lum | null; on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv || !lum) return;
    const { w, h } = lum; cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const out = ctx.createImageData(w, h), d = out.data;
    for (let p = 0; p < lum.lum.length; p++) {
      const v = lum.lum[p] * 100, k = p * 4;
      let c: [number, number, number];
      if (v < 2.5) c = [110, 40, 190]; else if (v < 10) c = [30, 90, 215]; else if (v >= 38 && v < 44) c = [60, 190, 75];
      else if (v >= 52 && v < 58) c = [240, 120, 175]; else if (v >= 97) c = [235, 40, 35]; else if (v >= 90) c = [240, 210, 40];
      else { const g = (v * 2.55) | 0; c = [g, g, g]; }
      d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }, [lum]);
  return <canvas ref={ref} className="cin-fx" style={{ opacity: on && lum ? 1 : 0 }} aria-hidden />;
}
/** Timecode that runs while `run` is true (never on a still card). */
function useTimecode(run: boolean) {
  const { still } = useCard();
  const [f, setF] = useState(still ? 61 : 0);
  useEffect(() => {
    if (!run || still) return;
    const id = window.setInterval(() => setF((n) => n + 1), 1000 / 24);
    return () => window.clearInterval(id);
  }, [run, still]);
  return tcStr(f);
}

/* ================================================================ 1 CINE SCREEN */
export function CineScreen() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { play } = useCard();
  const lum = useLum(data.photoUrl);
  const [rec, setRec] = useState(false);
  const [fc, setFc] = useState<'off' | 'on'>('off');
  const tc = useTimecode(rec);
  return (
    <div className="tpl tpl-cin tpl-ccs">
      <div className="pad stack">
        <div className="ccs__dev"><div className="ccs__ui">
          <div className="ccs__top" aria-hidden>
            {[['FPS', '24'], ['SHUTTER', '180°'], ['IRIS', 'f2.8'], ['ISO', '800'], ['WB', '5600K'], ['TINT', '0']].map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}
          </div>
          <div className="ccs__tc"><span>RAW 5:1 · 6K</span><b className={rec ? 'is-live' : ''}>{tc}</b><span>CARD 1:42</span></div>
          <div className={`cin-mon ccs__mon${rec ? ' is-rec' : ''}`}>
            <Photo className="cin-mon__img" />
            <FalseColor lum={lum} on={fc === 'on'} />
            <span className="ccs__tag" aria-hidden>LUT · REC709</span>
            <div className={`ccs__legend${fc === 'on' && lum ? ' is-on' : ''}`} aria-hidden>
              {[['#e82822', 'CLIP'], ['#f0d228', 'NEAR'], ['#f078af', 'SKIN+1'], ['#3cbe4b', '18%'], ['#1e5ad7', 'DARK'], ['#6e28be', 'CRUSH']].map(([c, l]) => <span key={l}><i style={{ background: c }} />{l}</span>)}
            </div>
          </div>
          <div className="ccs__bot">
            <Hist lum={lum} color="#e9e9e4" bg="#1b1c1e" className="ccs__hist" />
            <button type="button" className={`ccs__recbtn${rec ? ' is-on' : ''}`} aria-pressed={rec} aria-label="Record" onClick={() => { play('tap'); setRec((r) => !r); }} />
            <div className="ccs__meters" aria-hidden><i /><i /><i /><i /></div>
          </div>
          <div className="ccs__tools"><span>FALSE COLOR</span><Seg value={fc} set={setFc} opts={[['off', 'OFF'], ['on', 'ON']]} label="False color" /></div>
        </div></div>
        <IdRow eyebrow={withPlace('Director of photography', place(data))} />
        <Bottom save={save} sub="Hit record. You're in my contacts." keys={keys} openBook={openBook} />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 2 CINE BRAIN */
const GUIDES: Record<string, number> = { '2.39': 2.39, '1.85': 1.85, '16:9': 16 / 9, '9:16': 9 / 16 };
type GuideKey = '2.39' | '1.85' | '16:9' | '9:16';
export function CineBrain() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const lum = useLum(data.photoUrl);
  const [guide, setGuide] = useState<GuideKey>('2.39');
  const r = GUIDES[guide], frame = 16 / 10;
  const tb = r > frame ? ((1 - frame / r) / 2) * 100 : 0, lr = r < frame ? ((1 - r / frame) / 2) * 100 : 0;
  let lo = 0, hi = 0;
  if (lum) for (const v of lum.lum) { if (v < 0.03) lo++; else if (v > 0.97) hi++; }
  const n = lum?.lum.length || 1;
  return (
    <div className="tpl tpl-cin tpl-cbr">
      <div className="pad stack">
        <div className="cbr__body">
          <div className="cbr__handle" aria-hidden><span className="cbr__screw" /><span>CINEMA BRAIN</span><span className="cbr__screw" /></div>
          <div className="cin-mon cbr__screen">
            <Photo className="cbr__img" />
            <span className="cbr__guide t" style={{ height: `${tb}%` }} aria-hidden /><span className="cbr__guide b" style={{ height: `${tb}%` }} aria-hidden />
            <span className="cbr__side l" style={{ width: `${lr}%` }} aria-hidden /><span className="cbr__side r" style={{ width: `${lr}%` }} aria-hidden />
            <div className="cbr__read" aria-hidden><span><b {...el('accentDetail')}>● REC</b> 6K 17:9</span><span>23.98</span><span>ISO 800</span><span>5600K</span><span>180°</span></div>
          </div>
          <div className="cbr__meters" aria-hidden>
            <span className="cbr__post"><i {...el('accentDetail')} style={{ height: `${Math.min(100, (lo / n) * 900 + 6)}%` }} /></span>
            <Hist lum={lum} color="#D7141A" bg="#0c0c0c" className="cbr__hist" />
            <span className="cbr__post"><i {...el('accentDetail')} style={{ height: `${Math.min(100, (hi / n) * 900 + 6)}%` }} /></span>
          </div>
          <div className="cbr__ctrl"><small>Frame guide</small><Seg value={guide} set={setGuide} opts={(Object.keys(GUIDES) as GuideKey[]).map((k) => [k, k])} label="Frame guide" /></div>
        </div>
        <IdRow eyebrow={withPlace('Cinematographer', place(data))} />
        <Bottom save={save} sub="Rolling. Press once to save me." keys={keys} openBook={openBook} />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 3 FOCUS GUIDE */
export function FocusGuide() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { still, play } = useCard();
  const [sharp, setSharp] = useState(still);
  const t = useRef<number>();
  const rack = () => { window.clearTimeout(t.current); setSharp(false); t.current = window.setTimeout(() => setSharp(true), 500); };
  useEffect(() => { if (!still) rack(); return () => window.clearTimeout(t.current); }, [still]);
  return (
    <div className="tpl tpl-cin tpl-cfg">
      <div className="pad stack">
        <div className={`cin-mon cfg__mon${sharp ? '' : ' is-soft'}`}>
          <Photo className="cin-mon__img cfg__img" />
          <div className="cfg__top" aria-hidden><span><b {...el('accentDetail')}>STBY</b> 4K 59.94P</span><span>C-LOG 3</span><span>XF-AVC</span><span>CFE 82M</span></div>
          <div className="cfg__guide" aria-hidden><span className="cfg__tri l" /><span className="cfg__tri a" /><span className="cfg__tri r" /><span className="cfg__box" /></div>
          <div className="cfg__side" aria-hidden><span>DPAF</span><span>EYE</span><span>ND 2</span></div>
          <div className="cfg__bot" aria-hidden><span>1/120</span><span>F1.4</span><span>ISO 800</span><span>{sharp ? '1.4 m' : '∞'}</span></div>
        </div>
        <div className="cfg__rack">
          <small {...el('caption')}>Dual pixel focus guide</small>
          <button type="button" onClick={() => { play('tap'); rack(); }}>
            <svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>Rack focus
          </button>
        </div>
        <IdRow eyebrow={withPlace('In focus', place(data))} />
        <Bottom save={save} sub="Locked in. Press to save me." keys={keys} openBook={openBook} />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 4 8K PUNCH */
export function PunchIn() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { play } = useCard();
  const [zoom, setZoom] = useState(false);
  return (
    <div className="tpl tpl-cin tpl-cpi">
      <div className="pad stack">
        <div className={`cin-mon cpi__mon${zoom ? ' is-zoom' : ''}`}>
          <Photo className="cin-mon__img cpi__img" />
          <span className="cpi__grid" aria-hidden /><span className="cpi__loupe" aria-hidden {...el('accentDetail')} />
          <div className="cpi__badge" aria-hidden><span {...el('accentDetail')}>8K</span><span>RAW</span><span>IPB</span></div>
          <span className="cpi__lbl" aria-hidden>{zoom ? '5x' : '1x'}</span>
          <div className="cpi__res" aria-hidden><b {...el('accentDetail')}>8192 × 4320</b><span>23.98P</span><span>F1.2</span><span>ISO 400</span></div>
        </div>
        <button type="button" className="cpi__btn" aria-pressed={zoom} onClick={() => { play('tap'); setZoom((z) => !z); }}>
          <svg viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M8 11h6M11 8v6" /></svg>{zoom ? 'Pull back out' : 'Punch in 5x'}
        </button>
        <IdRow eyebrow={withPlace('Every pixel', place(data))} />
        <Bottom save={save} sub="Every detail of you, saved." keys={keys} openBook={openBook} />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}

/* ================================================================ 5 SLATE */
export function Slate() {
  const { data, keys, save, booking, openBook, closeBook } = useEos();
  const { still, play } = useCard();
  const [take, setTake] = useState(1);
  const [open, setOpen] = useState(false);
  const tc = useTimecode(true);
  const timers = useRef<number[]>([]);
  const clap = (count: boolean) => {
    timers.current.forEach((id) => window.clearTimeout(id));
    setOpen(true);
    timers.current = [window.setTimeout(() => { setOpen(false); play('primary'); if (count) setTake((n) => n + 1); }, 420)];
  };
  useEffect(() => {
    if (!still) timers.current.push(window.setTimeout(() => clap(false), 600));
    return () => timers.current.forEach((id) => window.clearTimeout(id));
  }, [still]);   // eslint-disable-line react-hooks/exhaustive-deps
  const day = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const prod = data.business || data.fullName || 'Your Name';
  return (
    <div className="tpl tpl-cin tpl-csl">
      <div className="pad stack">
        <div className="csl__board" role="button" tabIndex={0} aria-label="Clapperboard. Tap to clap."
          onClick={() => clap(true)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clap(true); } }}>
          <span className={`csl__stick${open ? ' is-open' : ''}`} aria-hidden /><span className="csl__hinge" aria-hidden /><div className="csl__top" aria-hidden />
          <div className="csl__body">
            <div className="csl__prod"><small>PRODUCTION</small><b {...el('name')}>{prod}</b></div>
            <div className="csl__grid"><div className="csl__cell"><small>ROLL</small><b>A001</b></div><div className="csl__cell"><small>SCENE</small><b>1</b></div><div className="csl__cell"><small>TAKE</small><b>{take}</b></div></div>
            <div className="csl__row2"><div className="csl__cell"><small>DIRECTOR OF PHOTOGRAPHY</small><b>{data.fullName || 'Your Name'}</b></div><div className="csl__cell"><small>CAMERA · DATE</small><b>A · {day}</b></div></div>
            <div className="csl__tc"><span className="csl__led">{tc}</span><small>FPS 23.98<br />SYNC</small></div>
          </div>
        </div>
        <p className="csl__tip" {...el('caption')}>Tap the slate to clap. Every clap is a new take.</p>
        <div className="csl__daily"><Photo className="csl__img" /><span aria-hidden>DAILIES · A001C001</span></div>
        <IdRow eyebrow={place(data) || undefined} />
        <Bottom save={save} sub="That's a wrap. Press to save me." keys={keys} openBook={openBook} />
      </div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}
