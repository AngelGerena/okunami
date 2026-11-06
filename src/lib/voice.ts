/* A small singing voice for the Vocalist designs (sig17), synthesized live
   (no audio files): a sawtooth with gentle vibrato through three vowel
   formant filters. It only ever starts from a tap, stays silent when the
   card's sound is off or the OS asks for reduced motion, and exposes an
   analyser so a design can draw the waveform while it sings. */
import { soundOn } from './sfx';

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let an: AnalyserNode | null = null;
let live: AudioScheduledSourceNode[] = [];

const VOWELS: Record<string, [number, number, number]> = { a: [800, 1150, 2900], o: [450, 800, 2830], e: [400, 1700, 2600], u: [325, 700, 2530], i: [300, 2200, 3000] };
export type Vowel = keyof typeof VOWELS;

const quiet = () => !soundOn() || (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

function ensure() {
  if (quiet()) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    out = ctx.createGain(); out.gain.value = 0.55;
    an = ctx.createAnalyser(); an.fftSize = 1024;
    out.connect(an); an.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export const noteHz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const noteName = (midi: number) => NAMES[midi % 12] + (Math.floor(midi / 12) - 1);
export const analyser = () => an;

/** Sing one note. Returns false when sound is off. */
export function sing(midi: number, dur = 0.6, vowel: Vowel = 'a', when = 0, gain = 0.22): boolean {
  const c = ensure(); if (!c || !out) return false;
  const t = c.currentTime + when, f = noteHz(midi);
  const src = c.createOscillator(), vib = c.createOscillator(), vg = c.createGain(), env = c.createGain();
  src.type = 'sawtooth'; src.frequency.value = f; vib.frequency.value = 5.4;
  vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(0.35, dur * 0.6));
  vib.connect(vg); vg.connect(src.frequency);
  env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(gain, t + 0.07);
  env.gain.setValueAtTime(gain, t + Math.max(0.08, dur - 0.12)); env.gain.linearRampToValueAtTime(0, t + dur);
  VOWELS[vowel].forEach((fr, i) => {
    const bp = c.createBiquadFilter(), g = c.createGain();
    bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = 9 + i * 3; g.gain.value = [1, 0.55, 0.25][i] * 3;
    src.connect(bp); bp.connect(g); g.connect(env);
  });
  env.connect(out);
  src.start(t); vib.start(t); src.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  live.push(src, vib);
  return true;
}

export function hush() { live.forEach((o) => { try { o.stop(); } catch { /* already stopped */ } }); live = []; }

/** An original melody in A major; words are sung one note each, cycling through it. */
const MELODY: [number, number, Vowel][] = [[69, 1, 'a'], [71, 0.5, 'i'], [73, 1, 'i'], [76, 1.5, 'a'], [74, 1, 'a'], [73, 1, 'i'], [71, 0.5, 'i'], [73, 1, 'i'], [71, 0.5, 'i'], [69, 2, 'u'],
  [69, 0.5, 'e'], [71, 0.5, 'u'], [73, 1, 'a'], [76, 1, 'o'], [78, 1.5, 'i'], [76, 1, 'a'], [74, 0.5, 'a'], [73, 1, 'i'], [71, 1, 'o'], [73, 0.5, 'a'], [69, 2.5, 'u']];
export const BEAT = 0.36;

/** Timing for singing a list of words: when each word starts and how long the phrase runs. */
export function phrase(words: number) {
  let t = 0; const at: number[] = [];
  for (let i = 0; i < words; i++) { at.push(t); const isLast = i === words - 1; t += (isLast ? 2 : MELODY[i % MELODY.length][1]) * BEAT; }
  return { at, total: t };
}

/** Sing the phrase; returns the start time of each word in seconds, or null when sound is off. */
export function singWords(words: number): number[] | null {
  if (!ensure()) return null;
  const { at } = phrase(words);
  at.forEach((t, i) => { const [m, b, v] = MELODY[i % MELODY.length]; const isLast = i === words - 1; sing(isLast ? 69 : m, (isLast ? 2 : b) * BEAT * 0.95, isLast ? 'u' : v, t); });
  return at;
}
