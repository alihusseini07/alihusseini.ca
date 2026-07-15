import { useSyncExternalStore } from 'react';

export type SoundName =
  | 'click' | 'tick' | 'whooshOpen' | 'whooshClose'
  | 'pickup' | 'drop' | 'waterDropDark' | 'waterDropLight' | 'tab' | 'toggleOn' | 'toggleOff' | 'navigate'
  | 'paperIn' | 'paperOut'
  | 'warpIn' | 'warpOut'
  | 'bell' | 'chime' | 'pageTurn' | 'chantHover'
  | 'bookOpen' | 'ringHalt'
  | 'focusBeep' | 'shutter' | 'frameWhoosh' | 'lensWhir' | 'lensBack'
  | 'cannon' | 'seagull' | 'splash' | 'luffyStretch'
  | 'hangerSlide';

const MUTE_KEY = 'ah:sound-muted';

let muted = (() => {
  try {
    const stored = localStorage.getItem(MUTE_KEY);
    if (stored === '1') return true;
    if (stored === '0') return false;
    // No saved choice yet. The OS silent/ring switch isn't exposed to the web,
    // so we can't read it directly — default to muted on touch devices (phones/
    // tablets) so the site never blasts audio unprompted. Desktop stays on.
    // A stored preference (set by the toggle) always overrides this.
    return window.matchMedia?.('(pointer: coarse)').matches ?? false;
  } catch { return false; }
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
    stopRingHum(); // kill any running loop; owners restart it on unmute
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
    master.gain.value = 1.4;
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

/* ---- sampled sounds: mp3 files in /sounds, decoded once, cached ---- */

const SAMPLE_SRCS = {
  splash: [1, 2, 3].map((n) => `${import.meta.env.BASE_URL}sounds/splash${n}.mp3`),
  luffyStretch: [`${import.meta.env.BASE_URL}sounds/luffy-arm-stretch.mp3`],
};
type SampleName = keyof typeof SAMPLE_SRCS;

const sampleBufs: Record<SampleName, (AudioBuffer | null)[]> = {
  splash: SAMPLE_SRCS.splash.map(() => null),
  luffyStretch: SAMPLE_SRCS.luffyStretch.map(() => null),
};
const sampleLoadStarted: Record<SampleName, boolean> = { splash: false, luffyStretch: false };

/** per-file playback rates, indexed like SAMPLE_SRCS; missing = 1 */
const SAMPLE_RATES: Partial<Record<SampleName, number[]>> = {
  splash: [1.5, 1, 1], // splash1 runs long: speed it up
};

function loadSamples(a: AudioContext, name: SampleName): void {
  if (sampleLoadStarted[name]) return;
  sampleLoadStarted[name] = true;
  SAMPLE_SRCS[name].forEach((src, i) => {
    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((data) => a.decodeAudioData(data))
      .then((buf) => { sampleBufs[name][i] = buf; })
      .catch(() => { /* no-op: callers fall back to synth or silence */ });
  });
}

/** kick off sample decoding ahead of the first play */
export function preloadSamples(): void {
  try {
    const c = ctx();
    if (!c) return;
    (Object.keys(SAMPLE_SRCS) as SampleName[]).forEach((n) => loadSamples(c.ac, n));
  } catch { /* no-op */ }
}

/** last-played index per sample set, so picks never repeat back to back */
const lastPlayed: Partial<Record<SampleName, number>> = {};

/** play one of a sample set at random (never the same twice in a row);
    false while still decoding */
function playSample(a: AudioContext, m: GainNode, name: SampleName, gain: number): boolean {
  loadSamples(a, name);
  const bufs = sampleBufs[name];
  let readyIdx = bufs.map((b, i) => (b ? i : -1)).filter((i) => i >= 0);
  if (!readyIdx.length) return false;
  if (readyIdx.length > 1) readyIdx = readyIdx.filter((i) => i !== lastPlayed[name]);
  const idx = readyIdx[(Math.random() * readyIdx.length) | 0];
  lastPlayed[name] = idx;
  const src = a.createBufferSource();
  src.buffer = bufs[idx]!;
  src.playbackRate.value = SAMPLE_RATES[name]?.[idx] ?? 1;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(g).connect(m);
  src.start(a.currentTime);
  return true;
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

/* ---- grimoire ring hum: continuous loop while the three rings turn ---- */

let hum: { gate: GainNode; sources: AudioScheduledSourceNode[] } | null = null;

/** brooding war-drone: dark detuned strings on an open fifth (D2+A2) under a
    deep sub root, breathing in slow ominous swells; call stopRingHum to end */
export function startRingHum(): void {
  if (muted || hum) return;
  try {
    const c = ctx();
    if (!c) return;
    const { ac: a, master: m } = c;
    const now = a.currentTime;

    const gate = a.createGain();
    gate.gain.setValueAtTime(0.0001, now);
    gate.gain.exponentialRampToValueAtTime(1, now + 1.2);
    gate.connect(m);

    // slow swell breathes the whole drone (~12s cycle)
    const swell = a.createGain();
    swell.gain.value = 0.75;
    swell.connect(gate);

    const sources: AudioScheduledSourceNode[] = [];

    const swellLfo = a.createOscillator();
    swellLfo.type = 'sine';
    swellLfo.frequency.value = 0.08;
    const swellAmt = a.createGain();
    swellAmt.gain.value = 0.22;
    swellLfo.connect(swellAmt).connect(swell.gain);
    swellLfo.start(now);
    sources.push(swellLfo);

    // dark string section: detuned saw pairs, muffled behind a low ceiling
    const lp = a.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;
    lp.Q.value = 0.7;
    lp.connect(swell);
    for (const [f, amp] of [
      [73.42, 0.02], [73.95, 0.018],   // D2 pair, slow beat = menace
      [110, 0.011], [110.65, 0.01],    // A2 pair
      [146.83, 0.005],                 // D3 whisper on top
    ] as const) {
      const o = a.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      const g = a.createGain();
      g.gain.value = amp;
      o.connect(g).connect(lp);
      o.start(now);
      sources.push(o);
    }

    // sub root D1: felt more than heard
    const sub = a.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = 36.71;
    const subG = a.createGain();
    subG.gain.value = 0.03;
    sub.connect(subG).connect(swell);
    sub.start(now);
    sources.push(sub);

    // cavern breath: dark looped noise drifting with its own slow cycle
    const src = a.createBufferSource();
    src.buffer = noise(a);
    src.loop = true;
    const bf = a.createBiquadFilter();
    bf.type = 'bandpass';
    bf.frequency.value = 240;
    bf.Q.value = 1.4;
    const ng = a.createGain();
    ng.gain.value = 0.012;
    const breathLfo = a.createOscillator();
    breathLfo.type = 'sine';
    breathLfo.frequency.value = 0.12;
    const breathAmt = a.createGain();
    breathAmt.gain.value = 120;
    breathLfo.connect(breathAmt).connect(bf.frequency);
    src.connect(bf).connect(ng).connect(swell);
    src.start(now);
    breathLfo.start(now);
    sources.push(src, breathLfo);

    hum = { gate, sources };
  } catch { /* no-op */ }
}

export function stopRingHum(): void {
  if (!hum) return;
  const { gate, sources } = hum;
  hum = null;
  try {
    if (!ac) return;
    const t = ac.currentTime;
    gate.gain.cancelScheduledValues(t);
    gate.gain.setValueAtTime(Math.max(gate.gain.value, 0.0001), t);
    gate.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    sources.forEach((s) => s.stop(t + 0.3));
    setTimeout(() => { try { gate.disconnect(); } catch { /* no-op */ } }, 350);
  } catch { /* no-op */ }
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
        tone(a, m, 'triangle', 1800, now, 0.015, 0.055, undefined, 0.003);
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
      case 'waterDropDark': { // droplet hits water, low: deeper pluck + heavier plop body
        swish(a, m, 'highpass', 4000, 1800, now, 0.015, 0.02, 0.001);
        tone(a, m, 'sine', 1300, now, 0.06, 0.055, 400, 0.001);
        tone(a, m, 'sine', 320, now + 0.018, 0.22, 0.065, 95, 0.004);
        break;
      }
      case 'waterDropLight': { // droplet hits water, high: bright pluck + lighter plop body
        swish(a, m, 'highpass', 5600, 2600, now, 0.015, 0.02, 0.001);
        tone(a, m, 'sine', 2500, now, 0.06, 0.05, 800, 0.001);
        tone(a, m, 'sine', 640, now + 0.018, 0.18, 0.055, 190, 0.004);
        break;
      }
      case 'tab':
        tone(a, m, 'square', 880, now, 0.03, 0.035);
        break;
      case 'toggleOn':
        tone(a, m, 'sine', 520, now, 0.045, 0.05, 780);
        break;
      case 'toggleOff':
        tone(a, m, 'sine', 780, now, 0.045, 0.05, 520);
        break;
      case 'navigate': // page flip: paper riffle sweep + soft settle tap
        swish(a, m, 'bandpass', 700, 2600, now, 0.14, 0.05, 0.015);
        swish(a, m, 'highpass', 3200, 6500, now + 0.01, 0.07, 0.05, 0.004);
        swish(a, m, 'highpass', 4200, 4200, now + 0.06, 0.02, 0.03, 0.003);
        tone(a, m, 'triangle', 150, now + 0.12, 0.05, 0.03);
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
      case 'bell': // sigil inscribed: quill scratch, then dark monastery bell
        swish(a, m, 'highpass', 2600, 4200, now, 0.06, 0.028, 0.004);
        bellTone(a, m, 311.13, now + 0.04, 0.85, 0.08);
        tone(a, m, 'sine', 155.56, now + 0.07, 0.5, 0.02, undefined, 0.01);
        break;
      case 'chime': // plucked lute, open fifth D4 + A4 with pick transient
        swish(a, m, 'highpass', 3000, 3000, now, 0.012, 0.022, 0.002);
        tone(a, m, 'triangle', 293.66, now, 0.3, 0.06, undefined, 0.003);
        tone(a, m, 'triangle', 440, now + 0.07, 0.35, 0.05, undefined, 0.003);
        tone(a, m, 'sine', 587.33, now + 0.07, 0.25, 0.018, undefined, 0.005);
        break;
      case 'pageTurn': // heavy tome page: leather flex, parchment sweep, settle
        tone(a, m, 'sine', 75, now, 0.09, 0.035, undefined, 0.008);
        swish(a, m, 'bandpass', 1400, 380, now + 0.02, 0.3, 0.05, 0.05);
        swish(a, m, 'highpass', 3400, 3400, now + 0.08, 0.02, 0.02, 0.003);
        swish(a, m, 'highpass', 3900, 3900, now + 0.16, 0.016, 0.016, 0.003);
        tone(a, m, 'triangle', 523.25, now + 0.24, 0.15, 0.018, undefined, 0.004);
        break;
      case 'chantHover': // parallel organum touch: G3 + D4, whisper quiet
        tone(a, m, 'sine', 196, now, 0.1, 0.018, undefined, 0.012);
        tone(a, m, 'sine', 293.66, now, 0.09, 0.01, undefined, 0.015);
        break;
      case 'bookOpen': // heavy cover swings, parchment flutters, arcane bells bloom
        tone(a, m, 'sawtooth', 52, now, 0.35, 0.028, 38);
        swish(a, m, 'lowpass', 300, 900, now, 0.3, 0.04, 0.08);
        tone(a, m, 'sine', 60, now + 0.32, 0.18, 0.09, undefined, 0.006);
        swish(a, m, 'highpass', 3800, 3800, now + 0.38, 0.02, 0.02, 0.003);
        swish(a, m, 'highpass', 4400, 4400, now + 0.45, 0.018, 0.018, 0.003);
        swish(a, m, 'highpass', 3500, 3500, now + 0.53, 0.02, 0.02, 0.003);
        bellTone(a, m, 196, now + 0.5, 1.1, 0.05);
        bellTone(a, m, 293.66, now + 0.62, 0.9, 0.035);
        break;
      case 'ringHalt': // rings grind to a stop: drag, heavy settle, faint tick
        swish(a, m, 'lowpass', 900, 140, now, 0.16, 0.05, 0.01);
        tone(a, m, 'sine', 58, now + 0.05, 0.12, 0.06, undefined, 0.006);
        tone(a, m, 'triangle', 1568, now + 0.1, 0.03, 0.016, undefined, 0.002);
        break;
      case 'focusBeep': // camera AF confirm: two tiny high beeps on hover
        tone(a, m, 'sine', 1245, now, 0.025, 0.022, undefined, 0.002);
        tone(a, m, 'sine', 1245, now + 0.045, 0.025, 0.018, undefined, 0.002);
        break;
      case 'shutter': // SLR snapshot: mirror clack, body thump, curtain re-click
        swish(a, m, 'highpass', 4500, 4500, now, 0.012, 0.05, 0.001);
        tone(a, m, 'triangle', 170, now + 0.004, 0.05, 0.05, 120, 0.002);
        swish(a, m, 'bandpass', 1800, 900, now + 0.02, 0.04, 0.03, 0.004);
        swish(a, m, 'highpass', 5000, 5000, now + 0.075, 0.012, 0.04, 0.001);
        tone(a, m, 'triangle', 140, now + 0.08, 0.04, 0.03, 100, 0.002);
        break;
      case 'frameWhoosh': // project frame sweeps in from the side: layered air whoosh
        swish(a, m, 'bandpass', 250, 1800, now, 0.32, 0.045, 0.09);
        swish(a, m, 'bandpass', 120, 600, now + 0.02, 0.3, 0.03, 0.1);
        tone(a, m, 'triangle', 120, now + 0.3, 0.05, 0.03, 95, 0.004);
        break;
      case 'lensWhir': // zoom motor spins up as the print lifts off the board
        swish(a, m, 'bandpass', 700, 1500, now, 0.11, 0.035, 0.02);
        tone(a, m, 'sawtooth', 92, now, 0.11, 0.014, 120, 0.01);
        swish(a, m, 'highpass', 4500, 4500, now + 0.11, 0.01, 0.02, 0.002);
        break;
      case 'lensBack': // motor eases back down as the print settles
        swish(a, m, 'bandpass', 1400, 650, now, 0.09, 0.028, 0.015);
        tone(a, m, 'sawtooth', 115, now, 0.09, 0.01, 88, 0.01);
        break;
      case 'cannon': // deck cannon: powder crack, deep rolling boom, rumble tail
        swish(a, m, 'highpass', 2400, 900, now, 0.05, 0.075, 0.002);
        tone(a, m, 'sine', 110, now + 0.005, 0.55, 0.21, 30, 0.005);
        tone(a, m, 'triangle', 75, now + 0.02, 0.4, 0.09, 36, 0.008);
        swish(a, m, 'lowpass', 600, 90, now + 0.02, 0.6, 0.075, 0.02);
        break;
      case 'seagull': // two falling gull cries, distant
        tone(a, m, 'sawtooth', 1800, now, 0.1, 0.011, 1150, 0.012);
        tone(a, m, 'sawtooth', 1950, now + 0.13, 0.12, 0.009, 1200, 0.014);
        break;
      case 'splash': // sampled water splash, one of three picked at random
        if (!playSample(a, m, 'splash', 0.38)) { // still decoding: synth plop stand-in
          swish(a, m, 'highpass', 4000, 1800, now, 0.015, 0.02, 0.001);
          tone(a, m, 'sine', 320, now + 0.018, 0.22, 0.065, 95, 0.004);
        }
        break;
      case 'luffyStretch': // Gomu Gomu no Pistol, sampled
        playSample(a, m, 'luffyStretch', 0.45);
        break;
      case 'hangerSlide': // clothes rack: hanger zips along the rail, cloth sways, end-stop tink
        swish(a, m, 'bandpass', 2000, 3400, now, 0.09, 0.038, 0.008);
        swish(a, m, 'lowpass', 900, 480, now + 0.02, 0.16, 0.028, 0.03);
        tone(a, m, 'triangle', 2960, now + 0.08, 0.03, 0.022, undefined, 0.002);
        break;
    }
  } catch { /* no-op */ }
}
