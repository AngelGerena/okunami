/* =================================================================
   The Hacker Collection: 9 Hollywood-style designs for developers and
   tech pros. IDE (profile as code, Run saves), Bio-Scan (red targeting
   HUD), Access (password brute force to ACCESS GRANTED), Trace (globe
   trace that ends on the owner's state), Dossier (classified file with
   redactions), War Room (wall of monitors), Code Rain (portrait built
   from falling code, computed from the owner's photo), Enhance (CCTV
   zoom and sharpen) and Vault (fingerprint opens a vault door).
   The Book key reads "Hire me". Keys, booking sheet and tail (Share and
   QR code) are shared with the EOS set (sig8). Every class uses a
   prefix nothing else in the app uses: hk-, hid__, hbs__, hac__, htr__,
   hds__, hwr__, hrn__, hen__, hvt__.
   ================================================================= */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Logo, Photo, el, useCard } from './blocks';
import { BookSheet, Keys, Tail, useEos } from './sig8';

const place = (d: { address: { city: string; region: string } }) => [d.address.city, d.address.region].filter(Boolean).join(', ');
const withPlace = (lead: string, p: string) => (p ? `${lead} · ${p}` : lead);
const splitName = (full: string) => { const [first, ...rest] = (full || 'Your Name').split(' '); return { first, last: rest.join(' ') }; };
const clock = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

function useHk() {
  const eos = useEos();
  const keys = useMemo(() => eos.keys.map((k) => (k.book ? { ...k, label: 'Hire me' } : k)), [eos.keys]);
  const gh = eos.data.socials.find((s) => s.network === 'github' && s.value);
  const handle = (gh?.value.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/.*$/, '').replace(/^@/, '')
    || (eos.data.fullName || 'you').toLowerCase().replace(/[^a-z0-9]/g, '')) || 'you';
  const stack = eos.data.highlights.map((h) => h.title).filter(Boolean).slice(0, 3);
  return { ...eos, keys, handle, stack, ...splitName(eos.data.fullName) };
}
function useClock(on = true) {
  const { still } = useCard();
  const [t, setT] = useState(clock);
  useEffect(() => { if (!on || still) return; const id = window.setInterval(() => setT(clock()), 1000); return () => window.clearInterval(id); }, [on, still]);
  return t;
}
/** Timers that are cleared when the component unmounts. */
function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => { ids.current.forEach((i) => { window.clearTimeout(i); window.clearInterval(i); }); }, []);
  return {
    later: (fn: () => void, ms: number) => { ids.current.push(window.setTimeout(fn, ms)); },
    every: (fn: () => void, ms: number) => { const i = window.setInterval(fn, ms); ids.current.push(i); return i; },
    clear: () => { ids.current.forEach((i) => { window.clearTimeout(i); window.clearInterval(i); }); ids.current = []; },
  };
}

function IdRow({ eyebrow, avatar = true }: { eyebrow?: string; avatar?: boolean }) {
  const { data } = useCard();
  const { first, last } = splitName(data.fullName);
  return (
    <header className="hk-idrow">
      <div className="hk-id">
        {eyebrow && <p className="hk-eyebrow" {...el('caption')}>{eyebrow}</p>}
        <h1 className="hk-name" {...el('name')}>{first}{last && <> <span {...el('accentDetail')}>{last}</span></>}</h1>
        <p className="hk-role" {...el('title')}><b>{data.jobTitle || 'Developer'}</b>{data.business && <> · {data.business}</>}</p>
      </div>
      {avatar && (data.photoUrl ? <img className="hk-avatar" src={data.photoUrl} alt="" /> : <Logo className="hk-avatar" />)}
    </header>
  );
}
const ICONS: Record<string, ReactNode> = {
  play: <path d="M7 4v16l13-8z" />,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  scan: <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" />,
  pin: <><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  zoom: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M8 11h6M11 8v6" /></>,
};
function Act({ icon, children, onClick }: { icon: keyof typeof ICONS; children: ReactNode; onClick: () => void }) {
  return <button type="button" className="hk-act" onClick={onClick} {...el('accentDetail')}><svg viewBox="0 0 24 24" aria-hidden>{ICONS[icon]}</svg>{children}</button>;
}
function Ghost({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" className="hk-ghost" onClick={onClick}>{children}</button>;
}
function Shell({ cls, children, booking, closeBook }: { cls: string; children: ReactNode; booking: boolean; closeBook: () => void }) {
  const { still } = useCard();
  return (
    <div className={`tpl tpl-hk ${cls}${still ? ' is-still' : ''}`}>
      <div className="pad stack">{children}</div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}
function loadImg(url: string, cors: boolean, cb: (img: HTMLImageElement) => void) {
  if (!url) return () => {};
  let dead = false;
  const img = new Image();
  if (cors && !url.startsWith('data:')) img.crossOrigin = 'anonymous';
  img.onload = () => { if (!dead) cb(img); };
  img.src = url;
  return () => { dead = true; };
}
function cover(img: HTMLImageElement, w: number, h: number, posY = 0.16) {
  const ir = img.naturalWidth / img.naturalHeight, cr = w / h;
  if (ir > cr) { const sh = img.naturalHeight, sw = sh * cr; return { sx: (img.naturalWidth - sw) / 2, sy: 0, sw, sh }; }
  const sw = img.naturalWidth, sh = sw / cr; return { sx: 0, sy: (img.naturalHeight - sh) * posY, sw, sh };
}

/* ================================================================ 1 IDE */
export function HackIDE() {
  const { data, keys, save, booking, openBook, closeBook, handle, stack, first, last } = useHk();
  const [out, setOut] = useState<ReactNode>(<><span className="dim">$</span> ready. press Run to save the contact.</>);
  const t = useTimers();
  const v = first.toLowerCase().replace(/[^a-z0-9]/g, '') || 'me';
  const q = (s: string) => <span className="s">"{s}"</span>;
  const lines: ReactNode[] = [
    <span className="c">// {handle}.ts</span>,
    <><span className="k">import</span> {'{'} <span className="f">hire</span> {'}'} <span className="k">from</span> {q('@okunami/card')};</>,
    '',
    <><span className="k">export const</span> <span className="f">{v}</span> = {'{'}</>,
    <>  <span className="p">name</span>: {q(data.fullName || 'Your Name')},</>,
    <>  <span className="p">role</span>: {q(data.jobTitle || 'Developer')},</>,
    ...(data.business ? [<>  <span className="p">team</span>: {q(data.business)},</>] : []),
    ...(stack.length ? [<>  <span className="p">stack</span>: [{stack.map((s, i) => <span key={s}>{i > 0 && ', '}{q(s)}</span>)}],</>] : []),
    ...(place(data) ? [<>  <span className="p">based</span>: {q(place(data))},</>] : []),
    <>  <span className="p">available</span>: <span className="b">true</span>,</>,
    '};', '',
    <><span className="f">hire</span>(<span className="f">{v}</span>);<span className="cur" /></>,
  ];
  const run = () => {
    save(); t.clear();
    setOut(<><span className="dim">$</span> npm run save-contact<br /><span className="dim">› compiling {handle}.ts…</span></>);
    t.later(() => setOut(<><span className="dim">$</span> npm run save-contact<br /><span className="dim">› compiling {handle}.ts…</span><br /><span className="ok">✓&#xFE0E; contact saved to your phone</span> <span className="dim">(312ms)</span></>), 650);
  };
  return (
    <Shell cls="tpl-hid" booking={booking} closeBook={closeBook}>
      <div className="hid__hero">
        <Photo className="hid__avatar" />
        <div className="hk-id">
          <p className="hk-eyebrow" {...el('caption')}>~/{handle}{place(data) && ` · ${place(data)}`}</p>
          <h1 className="hk-name hid__name" {...el('name')}>{first}{last && <> <span {...el('accentDetail')}>{last}</span></>}</h1>
          <p className="hk-role" {...el('title')}><b>{data.jobTitle || 'Developer'}</b>{data.business && <> · {data.business}</>}</p>
        </div>
      </div>
      <div className="hid__ide">
        <div className="hid__top" aria-hidden><i /><i /><i /><span>{handle} · okunami</span></div>
        <div className="hid__tabs" aria-hidden><span className="on"><b>TS</b>{handle}.ts</span><span>README.md</span><span>.env</span></div>
        <div className="hid__body" aria-label="Profile as code">
          {lines.map((l, i) => <div key={i} className="hid__row"><span className="hid__ln" aria-hidden>{i + 1}</span><span className="hid__code">{l || '\u00a0'}</span></div>)}
        </div>
        <div className="hid__term" aria-live="polite"><div className="t">TERMINAL</div><div>{out}</div></div>
        <div className="hid__status" aria-hidden {...el('accentDetail')}><span>⎇&#xFE0E; main</span><span>✓&#xFE0E; 0 errors</span><span>Ln {lines.length}, Col 18</span><span>TypeScript</span></div>
      </div>
      <Act icon="play" onClick={run}>Run <small>save-contact.ts</small></Act>
      <Keys keys={keys} onBook={openBook} />
      <Tail />
    </Shell>
  );
}

/* ================================================================ 2 BIO-SCAN */
const MESH: [number, number][] = [[50, 9], [40, 12], [60, 12], [34, 19], [66, 19], [32, 27], [68, 27], [38, 24], [45, 23], [55, 23], [62, 24], [50, 29], [47, 33], [53, 33], [42, 37], [50, 38], [58, 37], [36, 36], [64, 36], [40, 43], [50, 45], [60, 43]];
const EDGES: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [7, 8], [9, 10], [8, 11], [9, 11], [11, 12], [11, 13], [12, 15], [13, 15], [14, 15], [15, 16], [5, 17], [6, 18], [17, 19], [18, 21], [19, 20], [20, 21], [14, 17], [16, 18], [7, 3], [10, 4], [12, 14], [13, 16]];
export function BioScan() {
  const { data, keys, save, booking, openBook, closeBook, first, last } = useHk();
  const { still, play } = useCard();
  const [pct, setPct] = useState(still ? 99 : 0);
  const t = useTimers();
  useEffect(() => {
    if (still) return;
    let p = 0;
    const id = t.every(() => { p += 3; setPct(Math.min(99, p)); if (p >= 99) { window.clearInterval(id); play('success'); } }, 45);
  }, [still]);   // eslint-disable-line react-hooks/exhaustive-deps
  const done = pct >= 99;
  return (
    <Shell cls="tpl-hbs" booking={booking} closeBook={closeBook}>
      <div className="hbs__mon">
        <Photo className="hbs__img" />
        <span className="hbs__tint" aria-hidden /><span className="hk-lines" aria-hidden />
        <svg className="hbs__mesh" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden>
          {EDGES.map(([a, b], i) => <line key={i} className="ln" x1={MESH[a][0]} y1={MESH[a][1] * 1.25} x2={MESH[b][0]} y2={MESH[b][1] * 1.25} style={{ animationDelay: `${1.2 + i * 0.03}s` }} />)}
          {MESH.map(([x, y], i) => <circle key={i} className="pt" cx={x} cy={y * 1.25} r=".7" style={{ animationDelay: `${0.6 + i * 0.05}s` }} />)}
        </svg>
        <span className="hbs__box" aria-hidden><i /><i /><i /><i /></span><span className="hbs__scan" aria-hidden />
        <div className="hbs__data" aria-hidden>SUBJECT <b>{(last || first).toUpperCase()}{last && `, ${first.toUpperCase()}`}</b><br />CLASS <b>{(data.jobTitle || 'Developer').toUpperCase().slice(0, 22)}</b><br />THREAT <b>NONE</b></div>
        <div className="hbs__ring" aria-hidden><svg viewBox="0 0 70 70"><circle cx="35" cy="35" r="31" strokeWidth="1.5" fill="none" strokeDasharray="6 4" /><circle cx="35" cy="35" r="25" strokeWidth="3" fill="none" strokeDasharray="110 200" opacity=".7" /></svg><b>{pct}%</b></div>
        <div className={`hbs__ok${done ? ' is-on' : ''}`} aria-hidden>IDENTITY VERIFIED</div>
      </div>
      <div className="hk-stats" aria-hidden><div><small>MATCH</small><b {...el('accentDetail')}>{done ? '99.7%' : '--'}</b></div><div><small>STATUS</small><b {...el('accentDetail')}>OPEN</b></div><div><small>CLEARANCE</small><b {...el('accentDetail')}>LVL 5</b></div></div>
      <IdRow eyebrow={withPlace('Subject located', place(data))} avatar={false} />
      <Act icon="scan" onClick={save}>VERIFY + SAVE CONTACT</Act>
      <Keys keys={keys} onBook={openBook} />
      <Tail />
    </Shell>
  );
}

/* ================================================================ 3 ACCESS */
const PASS = 'L0CK3D-0UT';
const POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#@$%';
export function AccessGranted() {
  const { data, keys, save, booking, openBook, closeBook, handle } = useHk();
  const { still, play } = useCard();
  const tm = useClock();
  const t = useTimers();
  const [phase, setPhase] = useState<'deny' | 'crack' | 'ok'>(still ? 'ok' : 'deny');
  const [locked, setLocked] = useState(still ? PASS.length : 0);
  const [, tick] = useState(0);
  const run = () => {
    t.clear(); setPhase('deny'); setLocked(0); play('close');
    t.later(() => {
      setPhase('crack');
      let n = 0;
      t.every(() => tick((x) => x + 1), 45);
      const id = t.every(() => {
        n++; setLocked(n); play('tap');
        if (n >= PASS.length) { window.clearInterval(id); t.later(() => { setPhase('ok'); play('success'); }, 250); }
      }, 230);
    }, 1500);
  };
  useEffect(() => { if (!still) run(); }, [still]);   // eslint-disable-line react-hooks/exhaustive-deps
  const ok = phase === 'ok';
  const log = phase === 'deny' ? ['> auth failed (3 attempts)', '> launching brute force…']
    : ok ? [`> welcome, ${handle}`, '> profile decrypted'] : [`> cracking… ${Math.round((locked / PASS.length) * 100)}%`, `> key fragment ${locked}/${PASS.length} found`];
  return (
    <Shell cls="tpl-hac" booking={booking} closeBook={closeBook}>
      <div className={`hac__term${ok ? ' is-ok' : ''}`}>
        <div className="hac__top" aria-hidden><span>SECURE MAINFRAME · NODE 7</span><span>{tm}</span></div>
        <div className="hac__photo"><Photo className="hac__img" /><span className="hk-lines" aria-hidden />
          <div className={`hac__stamp${phase === 'deny' ? ' is-deny' : phase === 'crack' ? ' is-hide' : ' is-ok'}`} aria-hidden>{ok ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</div></div>
        <div className="hac__form">
          <div className="hac__f"><small>USER</small><b>{handle}</b></div>
          <div className="hac__f"><small>PASS</small><span className="hac__pw" aria-hidden>{PASS.split('').map((c, i) => <i key={i} className={i < locked ? 'is-lock' : ''}>{i < locked ? c : phase === 'crack' ? POOL[(Math.random() * POOL.length) | 0] : '*'}</i>)}</span></div>
          <div className="hac__bar" aria-hidden><i style={{ width: `${(locked / PASS.length) * 100}%` }} /></div>
          <div className="hac__log" aria-live="polite">{log.map((l) => <div key={l}>{l}</div>)}</div>
        </div>
      </div>
      <div className="hk-between"><small {...el('caption')}>Brute force · 2048-bit</small><Ghost onClick={run}>RUN AGAIN</Ghost></div>
      <IdRow eyebrow={withPlace('Root access', place(data))} />
      <Act icon="lock" onClick={save}>LOG IN · SAVE CONTACT</Act>
      <Keys keys={keys} onBook={openBook} />
      <Tail />
    </Shell>
  );
}

/* ================================================================ 4 TRACE */
const HOPS: [string, number, number][] = [['REYKJAVIK', 64.1, -21.9], ['FRANKFURT', 50.1, 8.7], ['MOSCOW', 55.8, 37.6], ['SINGAPORE', 1.35, 103.8], ['SYDNEY', -33.9, 151.2], ['SAO PAULO', -23.5, -46.6], ['MEXICO CITY', 19.4, -99.1]];
const NODES: [number, number][] = [[40.7, -74], [34, -118], [51.5, -0.1], [48.9, 2.3], [35.7, 139.7], [37.6, 127], [19.1, 72.9], [-26.2, 28], [30, 31.2], [-34.6, -58.4], [43.7, -79.4], [25.2, 55.3], [52.5, 13.4], [41, 29], [13.8, 100.5], [-1.3, 36.8], [6.5, 3.4], [61.2, -149.9], [47.6, -122.3], [39.9, 116.4], [22.3, 114.2], [-37.8, 145], [4.7, -74.1], [-12, -77]];
/** US state centers (abbreviation and name). Anything else ends the trace at the middle of the US. */
const STATES: Record<string, [number, number]> = {
  AL: [32.8, -86.8], AK: [64.7, -152.3], AZ: [34.3, -111.7], AR: [34.9, -92.4], CA: [37.2, -119.5], CO: [39, -105.5], CT: [41.6, -72.7], DE: [39, -75.5], DC: [38.9, -77],
  FL: [28.6, -81.5], GA: [32.7, -83.4], HI: [20.3, -156.4], ID: [44.4, -114.6], IL: [40, -89.2], IN: [39.9, -86.3], IA: [42.1, -93.5], KS: [38.5, -98.4], KY: [37.5, -85.3],
  LA: [31, -92], ME: [45.4, -69.2], MD: [39, -76.8], MA: [42.3, -71.8], MI: [44.3, -85.4], MN: [46.3, -94.3], MS: [32.7, -89.7], MO: [38.4, -92.5], MT: [47, -109.6],
  NE: [41.5, -99.8], NV: [39.3, -116.6], NH: [43.7, -71.6], NJ: [40.2, -74.7], NM: [34.4, -106.1], NY: [42.9, -75.5], NC: [35.6, -79.4], ND: [47.5, -100.5], OH: [40.3, -82.8],
  OK: [35.6, -97.5], OR: [43.9, -120.6], PA: [40.9, -77.8], RI: [41.7, -71.5], SC: [33.9, -80.9], SD: [44.4, -100.2], TN: [35.9, -86.4], TX: [31.5, -99.3], UT: [39.3, -111.7],
  VT: [44.1, -72.7], VA: [37.5, -78.9], WA: [47.4, -120.5], WV: [38.6, -80.6], WI: [44.6, -89.9], WY: [43, -107.6], PR: [18.2, -66.5],
};
const STATE_NAMES: Record<string, string> = { alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE', 'district of columbia': 'DC', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY', 'puerto rico': 'PR' };
const v3 = (lat: number, lon: number): [number, number, number] => { const a = (lat * Math.PI) / 180, b = (lon * Math.PI) / 180; return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)]; };
function slerp(p: number[], q: number[], t: number) { const d = Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]))); if (d < 1e-6) return p; const s = Math.sin(d), a = Math.sin((1 - t) * d) / s, b = Math.sin(t * d) / s; return [p[0] * a + q[0] * b, p[1] * a + q[1] * b, p[2] * a + q[2] * b]; }
export function GlobeTrace() {
  const { data, keys, save, booking, openBook, closeBook } = useHk();
  const { still, play } = useCard();
  const tm = useClock();
  const ref = useRef<HTMLCanvasElement>(null);
  const [run, setRun] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState(still);
  const region = (data.address.region || '').trim();
  const code = region.length === 2 ? region.toUpperCase() : STATE_NAMES[region.toLowerCase()] || '';
  const target = STATES[code] || [39.8, -98.6];
  const label = (data.address.city || code || 'Home base').toUpperCase();
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = (cv.width = cv.clientWidth * 2), H = (cv.height = cv.clientWidth * 2), ctx = cv.getContext('2d'); if (!ctx) return;
    const hops: [string, number, number][] = [...HOPS, [label, target[0], target[1]]];
    const R = W * 0.4, cx = W / 2, cy = H * 0.47, lat0 = (22 * Math.PI) / 180, T = 6000, start = performance.now();
    const proj = (v: number[], lon0: number) => {
      const c = Math.cos(-lon0), s = Math.sin(-lon0), x = v[0] * c - v[1] * s, y = v[0] * s + v[1] * c, z = v[2];
      return [cx + R * y, cy - R * (z * Math.cos(lat0) - x * Math.sin(lat0)), z * Math.sin(lat0) + x * Math.cos(lat0)];
    };
    let shown = 0, raf = 0, finished = false;
    const lines: string[] = [];
    const ip = () => `${((Math.random() * 223) | 0) + 10}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}`;
    setDone(still); setLog([]);
    const frame = (now: number) => {
      const t = still ? 1 : Math.min(1, (now - start) / T), e = 1 - Math.pow(1 - t, 3), lon0 = ((target[1] + 300 * (1 - e)) * Math.PI) / 180;
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); g.addColorStop(0, 'rgba(255,110,60,.14)'); g.addColorStop(1, 'rgba(40,10,4,.5)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,120,70,.22)';
      const line = (pts: number[][]) => { ctx.beginPath(); let pen = false; pts.forEach(([x, y, z]) => { if (z > 0) { if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y); pen = true; } else pen = false; }); ctx.stroke(); };
      for (let la = -60; la <= 60; la += 20) line(Array.from({ length: 91 }, (_, k) => proj(v3(la, -180 + k * 4), lon0)));
      for (let lo = -180; lo < 180; lo += 20) line(Array.from({ length: 46 }, (_, k) => proj(v3(-90 + k * 4, lo), lon0)));
      ctx.strokeStyle = 'rgba(255,90,44,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      NODES.forEach(([la, lo]) => { const [x, y, z] = proj(v3(la, lo), lon0); if (z > 0) { ctx.fillStyle = `rgba(255,170,120,${0.35 + z * 0.5})`; ctx.fillRect(x - 2, y - 2, 4, 4); } });
      const hd = t * hops.length;
      for (let i = 0; i < hops.length && i <= hd; i++) {
        const a = v3(hops[i][1], hops[i][2]), [x, y, z] = proj(a, lon0), last = i === hops.length - 1;
        if (i > 0) {
          const b = v3(hops[i - 1][1], hops[i - 1][2]), seg = Math.min(1, hd - i + 1);
          ctx.strokeStyle = '#FF5A2C'; ctx.lineWidth = 3; ctx.shadowColor = '#FF5A2C'; ctx.shadowBlur = 12;
          line(Array.from({ length: Math.floor(40 * seg) + 1 }, (_, k) => { const s = slerp(b, a, k / 40), l = 1 + 0.12 * Math.sin((Math.PI * k) / 40); return proj([s[0] * l, s[1] * l, s[2] * l], lon0); }).map(([px, py, pz]) => [px, py, pz + 0.05]));
          ctx.shadowBlur = 0;
        }
        if (z > 0) { ctx.fillStyle = last ? '#fff' : '#FF5A2C'; ctx.beginPath(); ctx.arc(x, y, last ? 7 : 5, 0, 7); ctx.fill(); }
        if (!still && i >= shown) { shown = i + 1; lines.push(`› HOP ${i + 1} · ${hops[i][0]} · ${ip()}`); setLog(lines.slice(-4)); play('hover'); }
      }
      if (t >= 1) {
        const [x, y] = proj(v3(target[0], target[1]), lon0), pulse = (now / 600) % 1;
        ctx.strokeStyle = `rgba(255,90,44,${1 - pulse})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10 + pulse * 40, 0, 7); ctx.stroke();
        if (!finished) { finished = true; setLog([...lines.slice(-3), `✓ TRACE COMPLETE · ${label}`]); setDone(true); if (!still) play('success'); }
      }
      if (!still) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [run, still, label, target[0], target[1]]);   // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Shell cls="tpl-htr" booking={booking} closeBook={closeBook}>
      <div className="htr__globe">
        <canvas ref={ref} aria-label={`Globe tracing a signal to ${label.toLowerCase()}`} />
        <div className="htr__hud" aria-hidden><span>TRACE · <b>{done ? 'LOCKED' : 'ACTIVE'}</b></span><span>{tm}</span></div>
        <div className={`htr__target${done ? ' is-on' : ''}`} aria-hidden>{data.photoUrl && <img src={data.photoUrl} alt="" />}<span><b>TARGET</b>{(data.fullName || 'Your Name').toUpperCase()}<br />{label}</span></div>
        <div className="htr__log" aria-live="polite">{(still ? [`✓ TRACE COMPLETE · ${label}`] : log).map((l, i) => <div key={i}>{l}</div>)}</div>
      </div>
      <div className="hk-between"><small {...el('caption')}>Signal trace · 8 hops</small><Ghost onClick={() => { play('tap'); setRun((r) => r + 1); }}>TRACE AGAIN</Ghost></div>
      <IdRow eyebrow={withPlace('Located', place(data))} />
      <Act icon="pin" onClick={save}>SAVE CONTACT</Act>
      <Keys keys={keys} onBook={openBook} />
      <Tail />
    </Shell>
  );
}

/* ================================================================ 5 DOSSIER */
export function Dossier() {
  const { data, keys, save, booking, openBook, closeBook, handle, stack } = useHk();
  const { play } = useCard();
  const [open, setOpen] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const R = ({ children }: { children: ReactNode }) => <span className="hds__red">{children}</span>;
  return (
    <Shell cls="tpl-hds" booking={booking} closeBook={closeBook}>
      <div className={`hds__file${open ? ' is-open' : ''}`}>
        <span className="hds__tab" aria-hidden>FILE 0427-{(data.fullName || 'X')[0].toUpperCase()}</span>
        <div className="hds__head"><b>PERSONNEL DOSSIER</b><span>CLEARANCE: OMEGA<br />{today}</span></div>
        <div className="hds__body">
          <div className="hds__photo"><span className="hds__clip" aria-hidden /><Photo className="hds__img" /></div>
          <div>
            <p className="hds__f"><small>SUBJECT</small><b {...el('name')}>{(data.fullName || 'Your Name').toUpperCase()}</b></p>
            <p className="hds__f"><small>ALIAS</small><R>"{handle}"</R></p>
            <p className="hds__f"><small>SPECIALTY</small>{data.jobTitle || 'Developer'}</p>
            {place(data) && <p className="hds__f"><small>LAST SEEN</small><R>{place(data)}</R></p>}
          </div>
        </div>
        <div className="hds__notes">
          <p>{data.tagline ? <>{data.tagline}. </> : null}Subject ships production work{data.business && <> at <R>{data.business}</R></>}.{stack.length > 0 && <> Known skills: <R>{stack.join(', ')}</R>.</>} Considered <R>extremely hireable</R>. Approach with a project brief.</p>
          <div className="hds__sign"><span>Filed by: AGENT K.</span><span>Page 1 of 1</span></div>
        </div>
        <div className="hds__stamp" aria-hidden {...el('accentDetail')}>TOP SECRET</div>
      </div>
      <div className="hk-between"><small {...el('caption')}>Redacted file</small><Ghost onClick={() => { play('tap'); setOpen((o) => !o); }}>{open ? 'REDACT' : 'DECLASSIFY'}</Ghost></div>
      <IdRow eyebrow={withPlace('Case file', place(data))} />
      <Act icon="file" onClick={save}>FILE THIS CONTACT</Act>
      <Keys keys={keys} onBook={openBook} />
      <Tail />
    </Shell>
  );
}

/* ================================================================ 6 WAR ROOM */
export function WarRoom() {
  const { data, keys, save, booking, openBook, closeBook } = useHk();
  const { still } = useCard();
  const wave = useRef<HTMLCanvasElement>(null);
  const hex = useMemo(() => Array.from({ length: 120 }, () => ((Math.random() * 256) | 0).toString(16).toUpperCase().padStart(2, '0')).join(' '), []);
  useEffect(() => {
    const cv = wave.current; if (!cv) return;
    const W = (cv.width = cv.clientWidth * 2), H = (cv.height = cv.clientHeight * 2), ctx = cv.getContext('2d'); if (!ctx) return;
    let raf = 0;
    const frame = (now: number) => {
      ctx.clearRect(0, 0, W, H); ctx.strokeStyle = '#FF6A00'; ctx.lineWidth = 2.5; ctx.shadowColor = '#FF6A00'; ctx.shadowBlur = 8; ctx.beginPath();
      for (let x = 0; x <= W; x += 3) { const t = now / 400, y = H * 0.58 + Math.sin(x / 18 + t) * H * 0.12 * Math.sin(x / 70 + t / 3) + Math.sin(x / 7 + t * 3) * H * 0.05 * (Math.sin(t) + 1); if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke(); ctx.shadowBlur = 0; if (!still) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [still]);
  const name = (data.fullName || 'Your Name').toUpperCase();
  return (
    <Shell cls="tpl-hwr" booking={booking} closeBook={closeBook}>
      <div className="hwr__tick" aria-hidden><span>BREAKING · TARGET IDENTIFIED · {name} · {(data.jobTitle || 'Developer').toUpperCase()} · AVAILABLE FOR HIRE{place(data) && ` · ${place(data).toUpperCase()}`} · ALL UNITS STAND BY ·</span></div>
      <div className="hwr__wall" aria-label="Command center monitors">
        <div className="hwr__mon is-big"><h4>CAM 01 · FACIAL RECOG</h4><Photo className="hwr__img" /><span className="hk-lines" aria-hidden />
          <span className="hwr__face" aria-hidden><b>MATCH 99.2%</b></span><div className="hwr__id" aria-hidden><b>{name}</b><br />{data.jobTitle || 'Developer'}</div></div>
        <div className="hwr__mon"><h4>INTERCEPT</h4><canvas ref={wave} aria-hidden /></div>
        <div className="hwr__mon"><h4>NETWORK</h4><span className="hwr__radar" aria-hidden /></div>
        <div className="hwr__mon"><h4>DECRYPT</h4><div className="hwr__hex" aria-hidden><div>{hex}<br />{hex}</div></div></div>
        <div className="hwr__mon"><h4>SIGNAL</h4><div className="hwr__bars" aria-hidden>{Array.from({ length: 10 }, (_, i) => <i key={i} style={{ animationDelay: `-${(i * 0.37) % 1.2}s` }} />)}</div></div>
      </div>
      <IdRow eyebrow={withPlace('All screens on you', place(data))} />
      <Act icon="scan" onClick={save}>SAVE CONTACT</Act>
      <Keys keys={keys} onBook={openBook} />
      <Tail />
    </Shell>
  );
}

/* ================================================================ 7 CODE RAIN */
const GLYPH = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF:=+*<>'.split('');
export function CodeRain() {
  const { data, keys, save, booking, openBook, closeBook, first, handle } = useHk();
  const { still } = useCard();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    let raf = 0;
    const stop = loadImg(data.photoUrl, true, (img) => {
      const W = (cv.width = cv.clientWidth * 2), H = (cv.height = Math.round(cv.clientWidth * 2 * 1.25)), ctx = cv.getContext('2d'); if (!ctx) return;
      const cell = 12, cols = Math.floor(W / cell), rows = Math.floor(H / cell);
      const off = document.createElement('canvas'); off.width = cols; off.height = rows; const o = off.getContext('2d'); if (!o) return;
      const c = cover(img, cols, rows); o.drawImage(img, c.sx, c.sy, c.sw, c.sh, 0, 0, cols, rows);
      let d: Uint8ClampedArray; try { d = o.getImageData(0, 0, cols, rows).data; } catch { return; }   // photo host without CORS: the rain plays without a face
      const lum = new Float32Array(cols * rows); let mn = 1, mx = 0;
      for (let i = 0; i < lum.length; i++) { const v = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255; lum[i] = v; mn = Math.min(mn, v); mx = Math.max(mx, v); }
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {   // spotlight the face, let the room fall off
        const i = y * cols + x, dx = x / cols - 0.5, dy = (y / rows - 0.32) * 1.25, v = Math.max(0.12, Math.min(1, 1.25 - Math.hypot(dx, dy) / 0.5));
        lum[i] = Math.pow((lum[i] - mn) / (mx - mn || 1), 0.85) * v;
      }
      const chars = Array.from({ length: cols * rows }, () => GLYPH[(Math.random() * GLYPH.length) | 0]);
      const head = Array.from({ length: cols }, () => (still ? rows * 2 : -Math.random() * rows * 1.2)), speed = Array.from({ length: cols }, () => 0.35 + Math.random() * 0.45);
      ctx.font = `700 ${cell * 0.95}px "JetBrains Mono", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const frame = () => {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        for (let x = 0; x < cols; x++) {
          head[x] += still ? 0 : speed[x];
          for (let y = 0; y < rows; y++) {
            const i = y * cols + x, dist = head[x] - y; if (dist < 0) continue;
            if (!still && Math.random() < 0.015) chars[i] = GLYPH[(Math.random() * GLYPH.length) | 0];
            const trail = Math.max(0, 1 - dist / 10), L = lum[i], a = Math.min(1, 0.05 + L * 1.9 + trail * 0.35);
            ctx.fillStyle = dist < 1 ? '#eaffef' : `rgba(${(30 + trail * 110 + L * 170) | 0},${(150 + L * 105) | 0},${(60 + trail * 50 + L * 110) | 0},${a})`;
            ctx.fillText(chars[i], x * cell + cell / 2, y * cell + cell / 2);
          }
          if (head[x] > rows * 3) head[x] = rows + 14;
        }
        if (!still) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    });
    return () => { stop(); cancelAnimationFrame(raf); };
  }, [data.photoUrl, still]);
  return (
    <Shell cls="tpl-hrn" booking={booking} closeBook={closeBook}>
      <div className="hrn__screen"><canvas ref={ref} aria-label={`Portrait of ${data.fullName || 'the owner'} drawn in falling code`} />
        <div className="hrn__hud" aria-hidden><span>WAKE UP, {first.toUpperCase()}</span><span>{handle}@matrix</span></div></div>
      <IdRow eyebrow={withPlace('Follow the code', place(data))} />
      <Act icon="lock" onClick={save}>TAKE THE CONTACT</Act>
      <Keys keys={keys} onBook={openBook} />
      <Tail />
    </Shell>
  );
}

/* ================================================================ 8 ENHANCE */
const ENH = [{ z: 1, b: 16 }, { z: 1.35, b: 9 }, { z: 1.65, b: 4 }, { z: 1.95, b: 1 }];
export function Enhance() {
  const { data, keys, save, booking, openBook, closeBook } = useHk();
  const { still, play } = useCard();
  const tm = useClock();
  const ref = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const cur = useRef({ ...ENH[still ? 3 : 0] });
  const raf = useRef(0);
  const t = useTimers();
  const [step, setStep] = useState(still ? 3 : 0);
  const [busy, setBusy] = useState(false);
  const draw = () => {
    const cv = ref.current, im = img.current; if (!cv || !im) return;
    const W = (cv.width = cv.clientWidth), H = (cv.height = Math.round(cv.clientWidth * 0.75)), ctx = cv.getContext('2d'); if (!ctx) return;
    const base = cover(im, W, H, 0.1), fx = base.sx + base.sw * 0.5, fy = base.sy + base.sh * 0.47, z = cur.current.z;
    const sw = base.sw / z, sh = base.sh / z, sx = Math.max(0, Math.min(im.naturalWidth - sw, fx - sw / 2)), sy = Math.max(0, Math.min(im.naturalHeight - sh, fy - sh / 2));
    const b = Math.max(1, cur.current.b), sW = Math.max(4, Math.round(W / b)), sH = Math.max(3, Math.round(H / b));
    const off = document.createElement('canvas'); off.width = sW; off.height = sH; off.getContext('2d')?.drawImage(im, sx, sy, sw, sh, 0, 0, sW, sH);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(off, 0, 0, sW, sH, 0, 0, W, H);
  };
  const go = (to: number) => {
    cancelAnimationFrame(raf.current);
    const from = { ...cur.current }, target = ENH[to], t0 = performance.now();
    setBusy(true); play('tap');
    const anim = (now: number) => {
      const k = Math.min(1, (now - t0) / 900), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      cur.current = { z: from.z + (target.z - from.z) * e, b: from.b + (target.b - from.b) * e }; draw();
      if (k < 1) raf.current = requestAnimationFrame(anim); else { setStep(to); setBusy(false); if (to === ENH.length - 1) play('success'); }
    };
    raf.current = requestAnimationFrame(anim);
  };
  useEffect(() => {
    const stop = loadImg(data.photoUrl, false, (im) => { img.current = im; draw(); if (!still) { t.later(() => go(1), 900); t.later(() => go(2), 2100); t.later(() => go(3), 3300); } });
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => { stop(); cancelAnimationFrame(raf.current); window.removeEventListener('resize', onResize); };
  }, [data.photoUrl, still]);   // eslint-disable-line react-hooks/exhaustive-deps
  const final = step === ENH.length - 1 && !busy;
  return (
    <Shell cls="tpl-hen" booking={booking} closeBook={closeBook}>
      <div className="hen__cam">
        {data.photoUrl ? <canvas ref={ref} aria-label={`Security camera footage of ${data.fullName || 'the owner'}`} /> : <Photo className="hen__img" />}
        <span className="hk-lines" aria-hidden />
        <div className="hen__hud" aria-hidden>
          <div className="tl"><b>● REC</b> CAM 04 · LOBBY<br />{tm}</div>
          <div className="tr">ZOOM {cur.current.z.toFixed(1)}x<br />RES {['LOW', 'MED', 'HIGH', '8K'][step]}</div>
          <span className="hen__cross" /><div className={`hen__box${final ? ' is-on' : ''}`} {...el('accentDetail')}><b>MATCH FOUND · {(data.fullName || 'Your Name').toUpperCase()}</b></div>
          <div className="bl" {...el('accentDetail')}>{busy ? 'ENHANCING…' : final ? 'POSITIVE ID' : 'ENHANCE?'}</div><div className="br">PLAYBACK 1x</div>
        </div>
      </div>
      <div className="hk-between"><span className="hen__steps" aria-hidden>{ENH.slice(1).map((_, i) => <i key={i} className={i < step ? 'is-on' : ''} {...el('accentDetail')} />)}</span>
        <Ghost onClick={() => { t.clear(); go(step >= ENH.length - 1 ? 0 : step + 1); }}>ENHANCE</Ghost></div>
      <IdRow eyebrow={withPlace('Positive ID', place(data))} />
      <Act icon="scan" onClick={save}>SAVE CONTACT</Act>
      <Keys keys={keys} onBook={openBook} />
      <Tail />
    </Shell>
  );
}

/* ================================================================ 9 VAULT */
export function Vault() {
  const { data, keys, save, booking, openBook, closeBook, handle } = useHk();
  const { play } = useCard();
  const t = useTimers();
  const [open, setOpen] = useState(false);
  const [scan, setScan] = useState(false);
  const press = () => {
    if (open) { setOpen(false); play('close'); return; }
    setScan(true); play('tap');
    t.later(() => { setScan(false); setOpen(true); play('success'); }, 1850);
  };
  return (
    <Shell cls="tpl-hvt" booking={booking} closeBook={closeBook}>
      <div className={`hvt__vault${open ? ' is-open' : ''}`}>
        <div className="hvt__frame">
          <div className="hvt__inside"><Photo className="hvt__img" /></div>
          <div className="hvt__door" aria-hidden>
            {Array.from({ length: 8 }, (_, i) => <span key={i} className="hvt__bolt" style={{ transform: `rotate(${i * 45}deg) translateX(560%)` }} />)}
            <div className="hvt__wheel"><i /><i /><i /><b {...el('accentDetail')} /></div>
          </div>
        </div>
        <div className="hvt__status"><span>VAULT 07 · {handle.toUpperCase()}</span><b>{open ? 'OPEN' : 'LOCKED'}</b></div>
      </div>
      <button type="button" className={`hvt__fp${scan ? ' is-scan' : ''}`} onClick={press} aria-pressed={open}>
        <svg viewBox="0 0 52 52" aria-hidden {...el('accentDetail')}><path d="M14 40c-3-4-4-9-3-14 2-9 10-14 18-13 7 1 12 7 12 14" /><path d="M19 44c-3-5-4-10-3-16 1-6 6-10 11-9 5 1 8 5 8 10 0 4-1 8-2 11" /><path d="M25 46c-2-4-3-9-3-14 0-3 2-6 5-6s5 3 5 6c0 5-1 10-3 14" /><path d="M27 32c0 5-1 10-3 14" /><path d="M10 18c4-7 11-11 19-10 6 1 11 4 14 10" /><path d="M16 9c6-3 14-3 20 1" /></svg>
        <span className="hvt__sweep" aria-hidden {...el('accentDetail')} />
        <span><b>{open ? 'Lock the vault' : 'Touch to authenticate'}</b><span>{scan ? 'Scanning…' : open ? 'Match. Welcome back.' : 'Fingerprint required to open the vault'}</span></span>
      </button>
      <IdRow eyebrow={withPlace('Clearance granted', place(data))} />
      <Act icon="lock" onClick={save}>SAVE CONTACT</Act>
      <Keys keys={keys} onBook={openBook} />
      <Tail />
    </Shell>
  );
}
