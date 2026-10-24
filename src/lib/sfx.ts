/* Interface sounds, synthesized live (no audio files). Tuned to feel like a
   premium phone app: short, quiet and soft, never musical jingles.
   calm   soft ticks and warm glass chimes                (wellness, pros, default)
   tech   crisp, slightly brighter digital ticks           (tech niche)
   bright soft wood knocks with a glass top note           (food, retail, creators)
   camera a real DSLR: mode-dial clicks, a full shutter frame (mirror up, two
          curtains, mirror slap) and a studio strobe that pops, recharges
          and beeps ready                                   (photo and video designs)
   Every sound passes through one gentle low-pass, a short room ambience and a
   limiter, so nothing pokes out. The same sound will not stack if it fires twice
   within a few milliseconds (a tap that both the card and a design report).
   Muted when the OS asks for reduced motion or the card sets sound to off. */
import type { SoundProfile } from './types';

let ctx: AudioContext | null = null;
let dry: GainNode | null = null;
let wet: GainNode | null = null;
let cam: GainNode | null = null;   // camera sounds skip the soft low-pass so the clicks stay crisp
let enabled = true;
const last = new Map<string, number>();

export const setSound = (on: boolean) => { enabled = on; };
export const soundOn = () => enabled;

export type SfxName = 'tap' | 'primary' | 'success' | 'open' | 'close' | 'dice' | 'hover' | 'boot';

/** A short, soft room so chimes have air instead of sounding like raw beeps. */
function room(c: AudioContext) {
  const len = Math.floor(c.sampleRate * 0.45), ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  const conv = c.createConvolver(); conv.buffer = ir; return conv;
}

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6500; lp.Q.value = 0.5;
  const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -18; lim.knee.value = 12; lim.ratio.value = 6; lim.attack.value = 0.002; lim.release.value = 0.12;
  const master = ctx.createGain(); master.gain.value = 0.9;
  dry = ctx.createGain(); dry.gain.value = 1;
  wet = ctx.createGain(); wet.gain.value = 0.16;
  const verb = room(ctx);
  dry.connect(lp); wet.connect(verb); verb.connect(lp);
  lp.connect(lim); lim.connect(master); master.connect(ctx.destination);
  cam = ctx.createGain(); cam.gain.value = 1;
  const camWet = ctx.createGain(); camWet.gain.value = 0.12;
  cam.connect(lim); cam.connect(camWet); camWet.connect(verb);
  return ctx;
}

/** Route a voice: always dry, optionally into the room. */
function route(node: AudioNode, air = 0) {
  node.connect(dry!);
  if (air > 0 && wet) { const s = ctx!.createGain(); s.gain.value = air; node.connect(s); s.connect(wet); }
}

/** A soft click: a tiny filtered noise transient plus a short sine body. */
function tick(freq: number, vol: number, delay = 0, len = 0.028) {
  const c = ensure(); if (!c) return;
  const t = c.currentTime + delay;
  const n = Math.floor(c.sampleRate * 0.008), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const ns = c.createBufferSource(), hp = c.createBiquadFilter(), ng = c.createGain();
  ns.buffer = buf; hp.type = 'highpass'; hp.frequency.value = 2400; ng.gain.value = vol * 0.35;
  ns.connect(hp); hp.connect(ng); route(ng);
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.82, t + len);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g); route(g, 0.2);
  ns.start(t); o.start(t); o.stop(t + len + 0.02);
}

/** A glass chime: a pure tone with a faint octave and twelfth, quick attack, natural decay. */
function glass(freq: number, vol: number, delay = 0, dur = 0.55) {
  const c = ensure(); if (!c) return;
  const t = c.currentTime + delay;
  [[1, 1], [2, 0.14], [3, 0.04]].forEach(([m, v]) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq * m;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur / m);
    o.connect(g); route(g, 0.9); o.start(t); o.stop(t + dur + 0.05);
  });
}

/** A soft wood knock: a warm, very short tone. */
function wood(freq: number, vol: number, delay = 0) {
  const c = ensure(); if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
  o.type = 'sine'; o.frequency.value = freq; o2.type = 'sine'; o2.frequency.value = freq * 3.9;
  const g2 = c.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(f); o.connect(f);
  f.type = 'lowpass'; f.frequency.value = freq * 5;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  f.connect(g); route(g, 0.35); o.start(t); o2.start(t); o.stop(t + 0.14); o2.stop(t + 0.14);
}

/** A soft air swish for sheets opening and closing. */
function swish(f0: number, f1: number, vol: number, dur = 0.16) {
  const c = ensure(); if (!c) return;
  const t = c.currentTime;
  const n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
  s.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(bp); bp.connect(g); route(g, 0.3); s.start(t);
}

function calm(name: SfxName) {
  switch (name) {
    case 'tap': tick(1250, 0.07); break;
    case 'primary': glass(880, 0.09); glass(1318.5, 0.06, 0.07); break;
    case 'success': glass(1046.5, 0.075); glass(1568, 0.055, 0.09, 0.7); break;
    case 'open': swish(500, 1700, 0.05); break;
    case 'close': swish(1700, 500, 0.04); break;
    case 'dice': [0, 0.05, 0.1].forEach((dl, i) => tick(1100 + i * 180, 0.05, dl)); break;
    default: break;   // hover and boot stay silent
  }
}
function tech(name: SfxName) {
  switch (name) {
    case 'tap': tick(2300, 0.06, 0, 0.018); break;
    case 'primary': tick(1760, 0.06, 0, 0.02); glass(1760, 0.06, 0.05, 0.35); break;
    case 'success': [0, 0.06].forEach((dl, i) => tick(1760 + i * 590, 0.05, dl, 0.02)); glass(2349.3, 0.05, 0.12, 0.45); break;
    case 'open': swish(800, 2600, 0.045, 0.13); break;
    case 'close': swish(2600, 800, 0.035, 0.12); break;
    case 'dice': [0, 0.04, 0.08, 0.12].forEach((dl) => tick(1800 + Math.random() * 900, 0.04, dl, 0.016)); break;
    case 'boot': glass(880, 0.035, 0, 0.6); glass(1318.5, 0.03, 0.12, 0.6); break;
    default: break;   // hover stays silent
  }
}
function bright(name: SfxName) {
  switch (name) {
    case 'tap': wood(1046.5, 0.08); break;
    case 'primary': wood(784, 0.08); glass(1568, 0.05, 0.06); break;
    case 'success': wood(1046.5, 0.07); wood(1318.5, 0.06, 0.07); glass(2093, 0.04, 0.14); break;
    case 'open': swish(600, 1900, 0.045); break;
    case 'close': swish(1900, 600, 0.035); break;
    case 'dice': [0, 0.05, 0.1].forEach((dl, i) => wood(880 + i * 220, 0.06, dl)); break;
    default: break;   // hover and boot stay silent
  }
}

/* ---------------------------------------------------------------- camera */
const noiseBuf = (c: AudioContext, dur: number) => {
  const n = Math.max(1, Math.floor(c.sampleRate * dur)), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
};
/** A filtered noise hit; type, freq and q shape the color, decay sets the length. */
function hit(t: number, o: { type?: BiquadFilterType; freq?: number; q?: number; gain?: number; decay?: number; attack?: number }) {
  const c = ctx!, { type = 'bandpass', freq = 2000, q = 1, gain = 0.5, decay = 0.02, attack = 0.0008 } = o;
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = noiseBuf(c, decay + 0.03); f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  s.connect(f); f.connect(g); g.connect(cam!); s.start(t); s.stop(t + decay + 0.04);
}
/** A short pitched body: a low thump or a metal ring. */
function thump(t: number, freq: number, gain: number, decay: number, to = 0) {
  const c = ctx!, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + decay);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.001); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o.connect(g); g.connect(cam!); o.start(t); o.stop(t + decay + 0.03);
}
/** One DSLR frame: mirror up, first and second curtain, mirror slap and a little rattle. */
function frame(delay = 0, w = 1) {
  const t = ctx!.currentTime + 0.01 + delay;
  hit(t, { freq: 1100, q: 0.8, gain: 0.32 * w, decay: 0.022 }); thump(t, 170, 0.28 * w, 0.035, 95);
  hit(t + 0.014, { type: 'highpass', freq: 3800, q: 0.7, gain: 0.42 * w, decay: 0.006 }); hit(t + 0.014, { freq: 3300, q: 9, gain: 0.5 * w, decay: 0.022 });
  hit(t + 0.036, { type: 'highpass', freq: 3400, q: 0.7, gain: 0.36 * w, decay: 0.006 }); hit(t + 0.036, { freq: 2650, q: 8, gain: 0.42 * w, decay: 0.02 });
  hit(t + 0.078, { freq: 1500, q: 0.9, gain: 0.62 * w, decay: 0.045 }); hit(t + 0.078, { type: 'highpass', freq: 4200, q: 0.6, gain: 0.28 * w, decay: 0.008 }); thump(t + 0.078, 130, 0.42 * w, 0.06, 70);
  [0.088, 0.096, 0.105].forEach((d, i) => hit(t + d, { freq: 2200 - i * 250, q: 4, gain: (0.12 - i * 0.03) * w, decay: 0.01 }));
}
/** A studio strobe: a hard pop, then the capacitor whine rising to the ready beep. */
function strobe(delay = 0) {
  const c = ctx!, t = c.currentTime + 0.01 + delay;
  hit(t, { type: 'highpass', freq: 1500, q: 0.5, gain: 1.4, decay: 0.014, attack: 0.0004 }); hit(t, { freq: 2400, q: 6, gain: 0.8, decay: 0.05 });
  thump(t, 6200, 0.05, 0.03); thump(t, 95, 0.38, 0.07, 55);
  const s0 = t + 0.12, dur = 1.5, o = c.createOscillator(), o2 = c.createOscillator(), o2g = c.createGain(), f = c.createBiquadFilter(), g = c.createGain(), trem = c.createOscillator(), tg = c.createGain();
  o.type = 'sine'; o2.type = 'triangle'; o2g.gain.value = 0.25;
  o.frequency.setValueAtTime(2300, s0); o.frequency.exponentialRampToValueAtTime(7800, s0 + dur);
  o2.frequency.setValueAtTime(4600, s0); o2.frequency.exponentialRampToValueAtTime(15600, s0 + dur);
  f.type = 'lowpass'; f.frequency.value = 9000; o.connect(f); o2.connect(o2g); o2g.connect(f);
  trem.frequency.value = 23; tg.gain.value = 0.004; trem.connect(tg); tg.connect(g.gain);
  g.gain.setValueAtTime(0.0001, s0); g.gain.exponentialRampToValueAtTime(0.018, s0 + 0.25); g.gain.setValueAtTime(0.018, s0 + dur - 0.1); g.gain.exponentialRampToValueAtTime(0.0001, s0 + dur);
  f.connect(g); g.connect(cam!); [o, o2, trem].forEach((x) => { x.start(s0); x.stop(s0 + dur + 0.05); });
  const b = c.createOscillator(), bg = c.createGain(), bt = s0 + dur + 0.08;
  b.type = 'sine'; b.frequency.value = 2960;
  bg.gain.setValueAtTime(0.0001, bt); bg.gain.exponentialRampToValueAtTime(0.06, bt + 0.004); bg.gain.setValueAtTime(0.06, bt + 0.09); bg.gain.exponentialRampToValueAtTime(0.0001, bt + 0.11);
  b.connect(bg); bg.connect(cam!); b.start(bt); b.stop(bt + 0.13);
}
/** A quiet mode-dial click. */
function dial(pitch = 3000, gain = 0.5) {
  const t = ctx!.currentTime + 0.005;
  hit(t, { freq: pitch, q: 5, gain, decay: 0.012 }); hit(t + 0.004, { type: 'highpass', freq: 5000, q: 0.7, gain: gain * 0.36, decay: 0.004 });
}
function camera(name: SfxName) {
  switch (name) {
    case 'tap': dial(); break;
    case 'primary': frame(); strobe(0.002); break;        // save contact: shutter and strobe together, then the recharge
    case 'success': frame(); break;
    case 'open': dial(2600, 0.42); break;
    case 'close': dial(2200, 0.36); break;
    case 'dice': [0, 1, 2].forEach((i) => frame(i / 6, i ? 0.92 : 1)); break;   // a 6 fps burst
    default: break;   // hover and boot stay silent
  }
}

export function sfx(name: SfxName, profile: SoundProfile = 'calm') {
  if (!enabled || profile === 'off' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const now = performance.now(), key = `${profile}:${name}`;
  if (now - (last.get(key) ?? -1e9) < 70) return;   // don't stack the same sound
  last.set(key, now);
  if (!ensure()) return;
  if (ctx?.state === 'suspended') void ctx.resume();
  if (profile === 'camera') camera(name); else if (profile === 'tech') tech(name); else if (profile === 'bright') bright(name); else calm(name);
}

/** The worship designs' two signature moments, kept soft and under the sound setting. */
export function chime(kind: 'sparkle' | 'orb') {
  if (!enabled || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  if (!ensure()) return;
  if (ctx?.state === 'suspended') void ctx.resume();
  if (kind === 'sparkle') { [1318.5, 1568, 2093].forEach((f, i) => glass(f, 0.05 - i * 0.01, i * 0.07, 0.8)); }
  else { glass(523.3, 0.07, 0, 0.9); glass(784, 0.045, 0.05, 0.9); }
}
