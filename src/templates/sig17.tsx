/* =================================================================
   The Vocalist Collection: 5 designs for singers, with no microphone
   graphic anywhere; each is built on the voice itself.
   Voiceprint (a live waveform across a black-and-white portrait),
   Lyric Book (a songwriting notebook whose lines, written from the
   owner's own details, light up word by word as they are sung),
   Range (a piano-roll chart; press a note to hear it sung), Spotlight
   (a follow-spot finds the singer; the setlist taped to the floor is
   the contact buttons) and Now Playing (a music player where the photo
   is the cover art). The singing comes from src/lib/voice.ts and is
   silent when sound is off. Keys, booking sheet and tail come from the
   EOS set (sig8). Prefixes: vx-, vvp__, vlb__, vrg__, vsp__, vnp__.
   ================================================================= */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Photo, el, useCard } from './blocks';
import { BookSheet, Keys, Tail, useEos, type Key } from './sig8';
import { socialUrl } from '../lib/socials';
import { analyser, hush, noteName, phrase, sing, singWords } from '../lib/voice';

const splitName = (full: string) => { const [first, ...rest] = (full || 'Your Name').split(' '); return { first, last: rest.join(' ') }; };
const STREAMS = ['spotify', 'applemusic', 'youtube', 'soundcloud'];

function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => { ids.current.forEach((i) => window.clearTimeout(i)); hush(); }, []);
  return {
    later: (fn: () => void, ms: number) => { ids.current.push(window.setTimeout(fn, ms)); },
    clear: () => { ids.current.forEach((i) => window.clearTimeout(i)); ids.current = []; hush(); },
  };
}

/** Everything the vocalist designs share: the EOS keys plus a stream link and the lyric lines. */
function useVx() {
  const eos = useEos();
  const { data } = eos;
  const { first, last } = splitName(data.fullName);
  const stream = useMemo(() => {
    for (const n of STREAMS) { const s = data.socials.find((x) => x.network === n && x.value); if (s) return socialUrl(s.network, s.value); }
    return '';
  }, [data.socials]);
  const lines = useMemo(() => {
    const role = (data.jobTitle || 'Vocalist').toLowerCase();
    const city = data.address.city;
    const h = data.highlights.map((x) => x.title).filter(Boolean).slice(0, 2).map((x) => x.toLowerCase());
    return [`Hi, I'm ${first},`, `${role}${city ? ` from ${city}` : ''}.`, h.length ? `Book me for ${h.join(' and ')},` : 'Book me for your next event,', `save my number and let's make music.`];
  }, [first, data.jobTitle, data.address.city, data.highlights]);
  return { ...eos, first, last, stream, lines };
}

function Shell({ cls, children, booking, closeBook }: { cls: string; children: ReactNode; booking: boolean; closeBook: () => void }) {
  const { still } = useCard();
  return (
    <div className={`tpl tpl-vx ${cls}${still ? ' is-still' : ''}`}>
      <div className="pad stack">{children}</div>
      {booking && <BookSheet onClose={closeBook} />}
    </div>
  );
}
function IdRow({ eyebrow, serif }: { eyebrow?: string; serif?: boolean }) {
  const { data } = useCard();
  const { first, last } = splitName(data.fullName);
  return (
    <header className="vx-id">
      {eyebrow && <p className="vx-eyebrow" {...el('caption')}>{eyebrow}</p>}
      <h1 className={`vx-name${serif ? ' is-serif' : ''}`} {...el('name')}>{first}{last && <> <span {...el('accentDetail')}>{last}</span></>}</h1>
      <p className="vx-role" {...el('title')}><b>{data.jobTitle || 'Vocalist'}</b>{data.address.city && <> · {data.address.city}</>}</p>
    </header>
  );
}
function SaveBtn({ label = 'Save my contact', onClick }: { label?: string; onClick?: () => void }) {
  const { actions } = useCard();
  return (
    <button type="button" className="vx-act" onClick={() => { sing(69, 0.3, 'a'); sing(76, 0.5, 'a', 0.25); (onClick ?? actions.save)(); }} {...el('btnPrimaryBg')}>
      <svg viewBox="0 0 24 24" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>{label}
    </button>
  );
}
function End({ keys, openBook }: { keys: Key[]; openBook: () => void }) {
  return <><SaveBtn /><Keys keys={keys} onBook={openBook} /><Tail /></>;
}
const go = (href: string) => { if (!href) return; if (/^https?:/.test(href)) window.open(href, '_blank', 'noopener'); else window.location.href = href; };
const PLAY = <svg viewBox="0 0 24 24" aria-hidden><path d="M7 4v16l13-8z" /></svg>;
const PAUSE = <svg viewBox="0 0 24 24" aria-hidden><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>;

/* ================================================================ 1 VOICEPRINT */
export function Voiceprint() {
  const { data, keys, booking, openBook, closeBook, lines } = useVx();
  const { still } = useCard();
  const [live, setLive] = useState(false);
  const cv = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef(false);
  const t = useTimers();
  const words = useMemo(() => lines.join(' ').split(' '), [lines]);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const c = cv.current; if (!c) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1), w = c.clientWidth, h = c.clientHeight;
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      const x = c.getContext('2d'); if (!x) return;
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
      const an = liveRef.current ? analyser() : null;
      let d: Uint8Array<ArrayBuffer> | null = null; if (an) { d = new Uint8Array(new ArrayBuffer(an.fftSize)); an.getByteTimeDomainData(d); }
      const bars = 64, bw = w / bars, tm = performance.now() / 1000;
      const acc = getComputedStyle(c).color || '#FF4D6D';
      for (let i = 0; i < bars; i++) {
        let v: number;
        if (d) { let m = 0; const step = Math.floor(d.length / bars); for (let k = 0; k < step; k++) m = Math.max(m, Math.abs(d[i * step + k] - 128)); v = Math.min(1, m / 70 + 0.05); }
        else { const e = Math.sin((i / bars) * Math.PI); v = (0.25 + 0.55 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43))) * e * (still ? 1 : 0.85 + 0.15 * Math.sin(tm * 2 + i * 0.3)); }
        const bh = Math.max(2, v * h * 0.9), rx = i * bw + bw * 0.2, rw = bw * 0.6;
        x.fillStyle = acc; x.beginPath();
        if (x.roundRect) x.roundRect(rx, h / 2 - bh / 2, rw, bh, rw / 2); else x.rect(rx, h / 2 - bh / 2, rw, bh);
        x.fill();
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    draw();
    const onR = () => draw(); window.addEventListener('resize', onR);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onR); };
  }, [still]);
  const toggle = () => {
    t.clear();
    if (live) { setLive(false); liveRef.current = false; return; }
    setLive(true); liveRef.current = true; singWords(words.length);
    t.later(() => { setLive(false); liveRef.current = false; }, phrase(words.length).total * 1000 + 200);
  };
  const tiles = data.highlights.filter((h) => h.title).slice(0, 3);
  return (
    <Shell cls="tpl-vvp" booking={booking} closeBook={closeBook}>
      <div className={`vvp__vp${live ? ' is-live' : ''}`}>
        <Photo className="vvp__img" />
        <canvas ref={cv} aria-hidden {...el('accentDetail')} />
        <div className="vvp__top" aria-hidden><span><i {...el('accentDetail')} />VOICEPRINT</span><span>48 kHz · 24-BIT</span></div>
        <div className="vvp__nm"><b>{data.fullName || 'Your Name'}</b><span>{(data.jobTitle || 'Vocalist').toUpperCase()}{data.address.city && ` · ${data.address.city.toUpperCase()}`}</span></div>
        <button type="button" className="vvp__play" onClick={toggle} aria-label={live ? 'Stop' : 'Play a vocal sample'} {...el('btnPrimaryBg')}>{live ? PAUSE : PLAY}</button>
      </div>
      {tiles.length > 0 && <div className="vx-tiles">{tiles.map((h) => <div key={h.title}><b {...el('accentDetail')}>{h.title}</b><span>{h.subtitle}</span></div>)}</div>}
      <IdRow eyebrow={data.tagline || 'Voice first'} />
      <End keys={keys} openBook={openBook} />
    </Shell>
  );
}

/* ================================================================ 2 LYRIC BOOK */
export function LyricBook() {
  const { data, keys, booking, openBook, closeBook, lines, stream, first } = useVx();
  const [on, setOn] = useState(-1);
  const t = useTimers();
  let k = 0;
  const rows = lines.map((l) => l.split(' ').map((w) => ({ w, i: k++ })));
  const singIt = () => {
    t.clear(); setOn(-1);
    singWords(k);
    const { at, total } = phrase(k);
    at.forEach((s, i) => t.later(() => setOn(i), s * 1000));
    t.later(() => setOn(-1), total * 1000 + 300);
  };
  return (
    <Shell cls="tpl-vlb" booking={booking} closeBook={closeBook}>
      <div className="vlb__page">
        <div className="vlb__pol"><Photo className="vlb__img" /><span>me, {new Date().getFullYear()}</span></div>
        <span className="vlb__ring" aria-hidden />
        <div className="vlb__head">SONGBOOK · P. 14</div>
        <h2 className="vlb__title" {...el('accentDetail')}>{data.tagline || 'My song'}</h2>
        <ul className="vlb__lyr">
          <li className="vlb__note">verse one</li>
          {rows.map((r, j) => <li key={j}>{r.map(({ w, i }) => <span key={i} className={`vlb__w${on === i ? ' is-on' : ''}`}>{w} </span>)}</li>)}
          <li className="vlb__note">written + sung by {first}</li>
        </ul>
      </div>
      <div className="vx-two">
        <button type="button" className="vx-btn is-pri" onClick={singIt} {...el('btnPrimaryBg')}>Sing it</button>
        {stream ? <button type="button" className="vx-btn" onClick={() => go(stream)}>Hear my music</button> : <button type="button" className="vx-btn" onClick={openBook}>Book me</button>}
      </div>
      <IdRow eyebrow="Songwriter · vocalist" serif />
      <End keys={keys} openBook={openBook} />
    </Shell>
  );
}

/* ================================================================ 3 RANGE */
const RANGE = [55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81];
export function VocalRange() {
  const { data, keys, booking, openBook, closeBook } = useVx();
  const [on, setOn] = useState(-1);
  const t = useTimers();
  const H = 220, lo = 48, hi = 84;
  const y = (n: number) => H - 14 - ((n - lo) / (hi - lo)) * (H - 34);
  const press = (n: number, i: number) => { t.clear(); setOn(i); sing(n, 0.8, n > 72 ? 'u' : 'a'); t.later(() => setOn(-1), 800); };
  const scale = () => {
    t.clear(); const seq = [...RANGE.map((_, i) => i), ...RANGE.map((_, i) => i).slice(0, -1).reverse()];
    seq.forEach((i, s) => { sing(RANGE[i], 0.26, 'a', s * 0.2, 0.18); t.later(() => setOn(i), s * 200); });
    t.later(() => setOn(-1), seq.length * 200);
  };
  const tiles = data.highlights.filter((h) => h.title).slice(0, 3);
  return (
    <Shell cls="tpl-vrg" booking={booking} closeBook={closeBook}>
      <div className="vrg__card">
        <div className="vrg__top"><Photo className="vrg__img" /><div><b>{data.fullName || 'Your Name'}</b><span {...el('accentDetail')}>{(data.credentials || data.jobTitle || 'Vocalist').toUpperCase()}</span></div></div>
        <div className="vrg__roll" aria-label="Vocal range chart">
          <div className="vrg__band" style={{ top: y(81) - 12, height: y(55) - y(81) + 24 }} />
          {[84, 72, 60, 48].map((n) => <span key={n} className="vrg__lbl" style={{ top: y(n) - (n === 48 ? 10 : n === 84 ? 2 : 6) }}>{noteName(n)}</span>)}
          {RANGE.map((n, i) => (
            <button key={n} type="button" className={`vrg__n${on === i ? ' is-on' : ''}`} style={{ left: `${7 + i * (86 / (RANGE.length - 1))}%`, top: y(n) - 8 }} onClick={() => press(n, i)} aria-label={`Sing ${noteName(n)}`} {...el('accentDetail')}>
              {(i === 0 || i === RANGE.length - 1 || n === 69) && <span>{noteName(n)}</span>}
            </button>
          ))}
        </div>
        {tiles.length > 0 && <div className="vrg__meta">{tiles.map((h) => <div key={h.title}><b>{h.title}</b><span>{h.subtitle}</span></div>)}</div>}
      </div>
      <button type="button" className="vx-btn" onClick={scale}>Run the scale</button>
      <IdRow eyebrow={data.tagline || 'Range · tone · control'} />
      <End keys={keys} openBook={openBook} />
    </Shell>
  );
}

/* ================================================================ 4 SPOTLIGHT */
const PATH: [number, number][] = [[12, 70], [80, 55], [30, 40], [62, 30], [50, 30]];
export function Spotlight() {
  const { data, keys, booking, openBook, closeBook, stream, last } = useVx();
  const { still, actions, play } = useCard();
  const stage = useRef<HTMLDivElement>(null);
  const pos = useRef<[number, number]>(still ? [50, 30] : [12, 70]);
  const [found, setFound] = useState(still);
  const [house, setHouse] = useState(false);
  const t = useTimers();
  const set = ([x, yy]: [number, number]) => {
    const s = stage.current; if (!s) return; pos.current = [x, yy];
    s.style.setProperty('--x', `${x}%`); s.style.setProperty('--y', `${yy}%`); s.style.setProperty('--yp', `${(yy / 100) * s.clientHeight}px`);
  };
  const anim = (to: [number, number], ms: number) => {
    const from = pos.current, t0 = performance.now();
    const step = (now: number) => { const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; set([from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e]); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const run = () => {
    t.clear(); setFound(false); setHouse(false);
    PATH.forEach((p, i) => t.later(() => anim(p, i === PATH.length - 1 ? 700 : 520), i * 540));
    t.later(() => { setFound(true); sing(69, 0.9, 'a'); sing(76, 0.9, 'a', 0, 0.12); }, PATH.length * 540 + 200);
  };
  useEffect(() => { set(pos.current); if (!still) t.later(run, 300); }, [still]);   // eslint-disable-line react-hooks/exhaustive-deps
  const set6 = useMemo(() => {
    const lab: Record<string, string> = { call: 'Call me', wa: 'WhatsApp', email: 'Email', book: 'Book a date' };
    const out: { label: string; on: () => void }[] = keys.map((k) => ({ label: lab[k.key] ?? k.label, on: () => (k.book && !k.href ? openBook() : go(k.href ?? '')) }));
    if (stream) out.push({ label: 'Listen', on: () => go(stream) });
    out.push({ label: 'Encore: share', on: actions.share });
    return out.slice(0, 6);
  }, [keys, stream, openBook, actions.share]);
  return (
    <Shell cls="tpl-vsp" booking={booking} closeBook={closeBook}>
      <div ref={stage} className={`vsp__stage${found ? ' is-found' : ''}${house ? ' is-house' : ''}`}>
        <Photo className="vsp__img" />
        <div className="vsp__dark" /><div className="vsp__haze" /><div className="vsp__beam" /><div className="vsp__floor" />
        <span className="vsp__tag">TONIGHT · LIVE</span>
        <div className="vsp__nm">{data.fullName || 'Your Name'}</div>
        <div className="vsp__set"><h3>SETLIST · {(last || data.fullName || 'LIVE').toUpperCase().slice(0, 16)}</h3>
          <ol>{set6.map((s, i) => <li key={i}><button type="button" onClick={() => { play('tap'); sing(73, 0.35, 'a'); s.on(); }}>{s.label}</button></li>)}</ol></div>
      </div>
      <div className="vx-two">
        <button type="button" className="vx-btn is-pri" onClick={run} {...el('btnPrimaryBg')}>Find the singer</button>
        <button type="button" className="vx-btn" onClick={() => setHouse((h) => !h)} aria-pressed={house}>House lights</button>
      </div>
      <IdRow eyebrow={data.tagline || 'Stage · studio · events'} serif />
      <End keys={keys} openBook={openBook} />
    </Shell>
  );
}

/* ================================================================ 5 NOW PLAYING */
export function NowPlaying() {
  const { data, keys, booking, openBook, closeBook, lines, stream, first } = useVx();
  const { actions } = useCard();
  const words = useMemo(() => lines.join(' ').split(' '), [lines]);
  const starts = useMemo(() => { let n = 0; return lines.map((l) => { const s = n; n += l.split(' ').length; return s; }); }, [lines]);
  const { at, total } = useMemo(() => phrase(words.length), [words.length]);
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(-1);
  const [pct, setPct] = useState(0);
  const [liked, setLiked] = useState(false);
  const raf = useRef(0);
  const t = useTimers();
  const stop = () => { t.clear(); cancelAnimationFrame(raf.current); setPlaying(false); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const start = () => {
    stop(); setPlaying(true); setLine(-1); setPct(0);
    singWords(words.length);
    starts.forEach((s, i) => t.later(() => setLine(i), at[s] * 1000));
    const t0 = performance.now();
    const tick = (now: number) => { const s = (now - t0) / 1000; setPct(Math.min(1, s / total)); if (s < total) raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    t.later(() => setPlaying(false), total * 1000 + 200);
  };
  const book = keys.find((k) => k.book);
  const sec = Math.round(total), now = Math.floor(pct * total);
  return (
    <Shell cls="tpl-vnp" booking={booking} closeBook={closeBook}>
      <div className={`vnp__np${playing ? '' : ' is-paused'}`}>
        {data.photoUrl && <div className="vnp__bg" style={{ backgroundImage: `url(${JSON.stringify(data.photoUrl)})` }} aria-hidden />}
        <div className="vnp__head"><span>Playing from</span><b>{data.fullName || 'Your Name'} · Live</b><span aria-hidden>•••</span></div>
        <div className="vnp__art"><Photo className="vnp__img" alt={`${data.fullName}, cover art`} /></div>
        <div className="vnp__meta"><div><b>{data.tagline || 'Live session'}</b><span>{data.fullName || 'Your Name'}</span></div>
          <button type="button" className={`vnp__like${liked ? ' is-on' : ''}`} onClick={() => { setLiked((l) => !l); if (!liked) actions.save(); }} aria-label="Save to contacts" aria-pressed={liked}>
            <svg viewBox="0 0 24 24" aria-hidden><path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z" /></svg></button></div>
        <div className="vnp__bar"><i style={{ width: `${pct * 100}%` }} {...el('accentDetail')} /></div>
        <div className="vnp__time"><span>0:{String(now).padStart(2, '0')}</span><span>-0:{String(Math.max(0, sec - now)).padStart(2, '0')}</span></div>
        <p className="vnp__lyric" aria-live="polite">{line >= 0 ? lines[line] : `Press play to hear ${first}`}</p>
        <div className="vnp__ctl">
          <button type="button" onClick={start} aria-label="Previous"><svg viewBox="0 0 24 24" aria-hidden><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg></button>
          <button type="button" className="vnp__pp" onClick={() => (playing ? stop() : start())} aria-label={playing ? 'Pause' : 'Play'}>{playing ? PAUSE : PLAY}</button>
          <button type="button" onClick={start} aria-label="Next"><svg viewBox="0 0 24 24" aria-hidden><path d="M16 5h2v14h-2zM4 5v14l11-7z" /></svg></button>
        </div>
        <div className="vnp__tabs">
          {book && <button type="button" onClick={() => (book.href ? go(book.href) : openBook())}>Book</button>}
          {stream && <button type="button" onClick={() => go(stream)}>Stream</button>}
          <button type="button" onClick={actions.share}>Share</button>
        </div>
      </div>
      <IdRow eyebrow="Now playing" />
      <End keys={keys} openBook={openBook} />
    </Shell>
  );
}
