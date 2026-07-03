import { useSyncExternalStore } from 'react';

export type SoundName =
  | 'click' | 'tick' | 'whooshOpen' | 'whooshClose'
  | 'pickup' | 'drop' | 'tab' | 'toggleOn' | 'toggleOff' | 'navigate'
  | 'paperIn' | 'paperOut'
  | 'warpIn' | 'warpOut'
  | 'bell' | 'chime' | 'pageTurn' | 'chantHover';

const MUTE_KEY = 'ah:sound-muted';

let muted = (() => {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
})();

const listeners = new Set<() => void>();

export function isMuted() { return muted; }

export function toggleMute() {
  if (muted) {
    muted = false;
    play('toggleOn');
  } else {
    play('toggleOff'); // audible feedback before mute takes effect
    muted = true;
  }
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* no-op */ }
  listeners.forEach((fn) => fn());
}

export function useMuted(): boolean {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    () => muted,
  );
}

let ac: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function ctx(): { ac: AudioContext; master: GainNode } | null {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return null;
  if (!ac) {
    ac = new Ctx();
    master = ac.createGain();
    master.gain.value = 0.5;
    master.connect(ac.destination);
  }
  if (ac.state === 'suspended') void ac.resume();
  return { ac, master: master! };
}

function noise(a: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, Math.ceil(a.sampleRate * 0.4), a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

/** oscillator through its own envelope gain into master */
function tone(
  a: AudioContext, out: GainNode,
  type: OscillatorType, freq: number, at: number, dur: number, peak: number,
  freqTo?: number, attack = 0.004,
) {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (freqTo !== undefined) o.frequency.linearRampToValueAtTime(freqTo, at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + dur + 0.01);
}

/** noise burst through a filter + envelope into master */
function swish(
  a: AudioContext, out: GainNode,
  filterType: BiquadFilterType, freq: number, freqTo: number,
  at: number, dur: number, peak: number, attack: number,
) {
  const src = a.createBufferSource();
  src.buffer = noise(a);
  const f = a.createBiquadFilter();
  f.type = filterType;
  f.Q.value = 1;
  f.frequency.setValueAtTime(freq, at);
  f.frequency.linearRampToValueAtTime(freqTo, at + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(f).connect(g).connect(out);
  src.start(at);
  src.stop(at + dur + 0.01);
}

/** struck bell: inharmonic sine partials with long decay (medieval church bell) */
function bellTone(
  a: AudioContext, out: GainNode,
  base: number, at: number, dur: number, peak: number,
) {
  const partials: Array<[number, number]> = [
    [1, 1], [2.0, 0.55], [2.92, 0.38], [4.16, 0.22], [5.4, 0.12],
  ];
  for (const [ratio, amp] of partials) {
    tone(a, out, 'sine', base * ratio, at, dur * (1 - ratio * 0.07), peak * amp, undefined, 0.002);
  }
}

export function play(name: SoundName): void {
  if (muted) return;
  try {
    const c = ctx();
    if (!c) return;
    const { ac: a, master: m } = c;
    const now = a.currentTime;
    switch (name) {
      case 'click':
        tone(a, m, 'square', 2200, now, 0.025, 0.05, undefined, 0.003);
        tone(a, m, 'triangle', 320, now, 0.045, 0.05);
        break;
      case 'tick':
        tone(a, m, 'triangle', 1800, now, 0.015, 0.02, undefined, 0.003);
        break;
      case 'whooshOpen':
        swish(a, m, 'bandpass', 400, 1600, now, 0.3, 0.05, 0.06);
        break;
      case 'whooshClose':
        swish(a, m, 'bandpass', 1600, 350, now, 0.22, 0.05, 0.05);
        break;
      case 'pickup':
        tone(a, m, 'sine', 280, now, 0.06, 0.05, 400);
        break;
      case 'drop':
        tone(a, m, 'triangle', 170, now, 0.07, 0.07);
        swish(a, m, 'highpass', 3000, 3000, now, 0.008, 0.03, 0.002);
        break;
      case 'tab':
        tone(a, m, 'square', 880, now, 0.03, 0.035);
        break;
      case 'toggleOn':
        tone(a, m, 'sine', 520, now, 0.045, 0.05, 780);
        break;
      case 'toggleOff':
        tone(a, m, 'sine', 780, now, 0.045, 0.05, 520);
        break;
      case 'navigate':
        tone(a, m, 'square', 620, now, 0.07, 0.06, undefined, 0.005);
        tone(a, m, 'square', 930, now + 0.075, 0.07, 0.06, undefined, 0.005);
        break;
      case 'paperIn': // rising whoosh + paper rustle taps
        swish(a, m, 'bandpass', 500, 1900, now, 0.35, 0.055, 0.07);
        swish(a, m, 'highpass', 4000, 4000, now + 0.02, 0.02, 0.025, 0.003);
        swish(a, m, 'highpass', 4500, 4500, now + 0.07, 0.015, 0.02, 0.003);
        swish(a, m, 'highpass', 3800, 3800, now + 0.13, 0.02, 0.022, 0.003);
        break;
      case 'paperOut': // falling whoosh + paper rustle taps
        swish(a, m, 'bandpass', 1900, 450, now, 0.32, 0.055, 0.06);
        swish(a, m, 'highpass', 4200, 4200, now + 0.03, 0.02, 0.025, 0.003);
        swish(a, m, 'highpass', 3600, 3600, now + 0.09, 0.015, 0.02, 0.003);
        swish(a, m, 'highpass', 4600, 4600, now + 0.16, 0.02, 0.022, 0.003);
        break;
      case 'warpIn': { // glitch stutter -> dimensional suck -> deep arrival bell
        const blips = [1200, 400, 2400, 700, 1800];
        blips.forEach((f, i) =>
          tone(a, m, 'square', f, now + i * 0.055, 0.03, 0.045, f * 0.5, 0.002));
        tone(a, m, 'sawtooth', 220, now + 0.3, 0.55, 0.055, 28);
        swish(a, m, 'bandpass', 300, 2600, now + 0.3, 0.5, 0.05, 0.12);
        bellTone(a, m, 98, now + 0.72, 0.9, 0.1);
        break;
      }
      case 'warpOut': { // glitch stutter -> rising return rift -> resolving bell
        const blips = [800, 2000, 500, 1600];
        blips.forEach((f, i) =>
          tone(a, m, 'square', f, now + i * 0.05, 0.028, 0.04, f * 1.6, 0.002));
        tone(a, m, 'sawtooth', 42, now + 0.26, 0.5, 0.05, 240);
        swish(a, m, 'bandpass', 2400, 350, now + 0.26, 0.45, 0.05, 0.1);
        bellTone(a, m, 147, now + 0.62, 0.7, 0.07);
        break;
      }
      case 'bell': // grimoire sigil strike
        bellTone(a, m, 392, now, 0.65, 0.075);
        break;
      case 'chime': // plucked open fifth, D5 + A5
        tone(a, m, 'triangle', 587.33, now, 0.22, 0.06, undefined, 0.003);
        tone(a, m, 'triangle', 880, now + 0.06, 0.28, 0.05, undefined, 0.003);
        break;
      case 'pageTurn': // soft parchment sweep + rustle
        swish(a, m, 'bandpass', 1200, 480, now, 0.25, 0.045, 0.05);
        swish(a, m, 'highpass', 3400, 3400, now + 0.05, 0.018, 0.018, 0.003);
        swish(a, m, 'highpass', 3900, 3900, now + 0.12, 0.015, 0.015, 0.003);
        break;
      case 'chantHover': // low quiet drone touch, G3
        tone(a, m, 'sine', 196, now, 0.08, 0.02, undefined, 0.01);
        break;
    }
  } catch { /* no-op */ }
}
