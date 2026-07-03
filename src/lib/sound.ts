import { useSyncExternalStore } from 'react';

export type SoundName =
  | 'click' | 'tick' | 'whooshOpen' | 'whooshClose'
  | 'pickup' | 'drop' | 'tab' | 'toggleOn' | 'toggleOff' | 'navigate'
  | 'paperIn' | 'paperOut';

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
    }
  } catch { /* no-op */ }
}
