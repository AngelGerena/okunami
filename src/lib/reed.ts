/* A breathy saxophone-like reed for the Saxophone designs (sig18), synthesized
   live (no audio files): two detuned oscillators through a moving low-pass
   filter, gentle vibrato and a little breath noise. It only starts from a
   press, and stays silent when the card's sound is off or the OS asks for
   reduced motion. */
import { soundOn } from './sfx';

let ctx: AudioContext | null = null;
let out: GainNode | null = null;

const quiet = () => !soundOn() || (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

function ensure() {
  if (quiet()) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** One reed note. Returns false when sound is off. */
export function reed(freq: number, dur = 0.5, when = 0, gain = 0.16): boolean {
  const a = ensure(); if (!a || !out) return false;
  const t = a.currentTime + when;
  const o = a.createOscillator(), o2 = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(), v = a.createOscillator(), vg = a.createGain(), mix = a.createGain();
  o.type = 'sawtooth'; o2.type = 'square'; o.frequency.value = freq; o2.frequency.value = freq * 1.003;
  v.frequency.value = 5.2; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(freq * 0.008, t + Math.min(0.3, dur * 0.6));
  v.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
  f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(freq * 2, t); f.frequency.linearRampToValueAtTime(freq * 6, t + 0.08); f.frequency.linearRampToValueAtTime(freq * 3.5, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.05); g.gain.setValueAtTime(gain * 0.85, t + Math.max(0.06, dur - 0.1)); g.gain.linearRampToValueAtTime(0, t + dur);
  mix.gain.value = 0.5; o.connect(mix); o2.connect(mix); mix.connect(f); f.connect(g); g.connect(out);
  const n = Math.max(1, Math.floor(a.sampleRate * dur)), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
  const ns = a.createBufferSource(), nf = a.createBiquadFilter(), ng = a.createGain();
  ns.buffer = buf; nf.type = 'bandpass'; nf.frequency.value = freq * 4; nf.Q.value = 1;
  ng.gain.setValueAtTime(0, t); ng.gain.linearRampToValueAtTime(0.025, t + 0.04); ng.gain.linearRampToValueAtTime(0, t + dur);
  ns.connect(nf); nf.connect(ng); ng.connect(out);
  [o, o2, v].forEach((x) => { x.start(t); x.stop(t + dur + 0.05); }); ns.start(t);
  return true;
}

/** An original late-night phrase in B flat: [hz, beats]. */
export const PHRASE: [number, number][] = [[349.2, 0.5], [415.3, 0.5], [466.2, 1], [554.4, 0.75], [523.3, 0.25], [466.2, 0.5], [415.3, 0.5], [349.2, 1.5], [311.1, 0.5], [349.2, 2]];
export const PHRASE_BEAT = 0.32;

/** Play the phrase; returns when (in seconds) each note starts. */
export function playPhrase(): number[] {
  let t = 0; const at: number[] = [];
  PHRASE.forEach(([f, b]) => { reed(f, b * PHRASE_BEAT * 1.05, t); at.push(t); t += b * PHRASE_BEAT; });
  return at;
}
