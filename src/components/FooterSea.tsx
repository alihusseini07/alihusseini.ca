import { useEffect, useRef } from 'react';
import { REDUCED } from '../lib/motion';
import { play, preloadSamples } from '../lib/sound';
import { useThemeCtx } from '../lib/theme';
import type { ThemeMode } from '../tokens';

/** logical pixel size: 1 canvas px = UNIT css px, upscaled with
    image-rendering pixelated so everything stays chunky and crisp */
const UNIT = 3;
/** water column width in canvas px — one sim column per 2 px */
const COLW = 2;
/** rows of water below the resting surface (canvas px) */
const SEA_DEPTH = 26;

/* ---------------------------------------------------------------- sprites */

// the Going Merry, bow pointing left; drawn once per theme into an
// offscreen canvas and stamped with drawImage. Legend: K outline,
// B/L/D hull base/light/dark, T cabin+gunwale trim, M mast, W sail/sheep
// white, S sail shade, Y amber (horn, straw hat), R hat band red,
// E stern bush green, G cabin window (lit lantern in dark mode), F flag.
const MERRY = [
  '...................MMFFFFFFFF...........',
  '...................MMFWWFFF.............',
  '...................MMFFF................',
  '...................MM...................',
  '..........KKKKKKKKKKKKKKKKKKKKK.........',
  '...........KWWWWWWWWWWWWWWWSSK..........',
  '...........KWWWWWYYYYYWWWWWSSK..........',
  '...........KWWWWYYYYYYYWWWWSSK..........',
  '...........KWWWWRRRRRRRWWWWSSK..........',
  '...........KWWYYYYYYYYYYYWWSSK..........',
  '...........KWWWWKWWWWWKWWWWSSK..........',
  '...KKKK....KWWWWKWKWKWKWWWWSSK..........',
  '..KWWWYYK..KWWWWKWWWWWKWWWWSSK..........',
  '.KWWWYWYK..KWWWWWKWKWKWWWWWSSK..EEE.....',
  'KWKWWYYWK..KWWWWWWWWWWWWWWWSSK.EEEEE....',
  'KWWWWWWWK..KSSSSSSSSSSSSSSSSSKKKKKKKKK..',
  '.KKWWWWK....KKKKKKKKKKKKKKKKK.KTTTTGGK..',
  '..KWWWWK...........MM.........KTTTTGGK..',
  '...KWWWWK..........MM.........KTTTTTTK..',
  '....KWWWWK.........MM.........KTTTTTTK..',
  '.....KTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTK...',
  '......KLLLLLLLLLLLLLLLLLLLLLLLLLLLLLK...',
  '......KBBBBBBBBBBBBBBBBBBBBBBBBBBBBDK...',
  '.......KBBBBBBKKBBBBBBBBKKBBBBBBBBDK....',
  '.......KBBBBBBBBBBBBBBBBBBBBBBBBBBDK....',
  '........KBBBBBBBBBBBBBBBBBBBBBBDDDK.....',
  '.........KDDDDDDDDDDDDDDDDDDDDDDDK......',
  '..........KKKKKKKKKKKKKKKKKKKKKKK.......',
];
const SHIP_W = 40;
/** sprite row that sits at the waterline (rows below it ride submerged) */
const SHIP_WATERLINE = 24;

const SUN = [
  '..YYYY..',
  '.YHHHHY.',
  'YHHHHHHY',
  'YHHHHHHY',
  'YHHHHHHY',
  'YHHHHHHY',
  '.YHHHHY.',
  '..YYYY..',
];

const MOON = [
  '..CCCC..',
  '.CCCC...',
  'CCCC....',
  'CCC.....',
  'CCC.....',
  'CCCC....',
  '.CCCC...',
  '..CCCC..',
];

const CLOUD = [
  '....WWWW....',
  '..WWWWWWWWW.',
  'WWWWWWWWWWWW',
];

// two-frame gull silhouette, wings up / wings down
const GULL: string[][] = [
  ['K...K', '.K.K.', '..K..'],
  ['.....', 'KK.KK', '..K..'],
];

const SHIP_PAL: Record<ThemeMode, Record<string, string>> = {
  light: {
    K: '#3a2413', B: '#c2914f', L: '#e0b877', D: '#8f6430', T: '#a04b2b',
    M: '#6b4a26', W: '#fffdf6', S: '#d9cdb6', Y: '#e8a72e', R: '#c9342a', E: '#5a9a3f', G: '#e8a72e', F: '#33302a',
  },
  dark: {
    K: '#1c1006', B: '#8a6534', L: '#a8874f', D: '#5e421e', T: '#7c3a20',
    M: '#4a3116', W: '#cfcabe', S: '#a49c8c', Y: '#b8811f', R: '#9c2f24', E: '#46702f', G: '#ffd76b', F: '#565656',
  },
};

// sea tones are the folder blues from tokens.ts, so the water reads as the
// same material as the rest of the site
const SEA_PAL: Record<ThemeMode, { crest: string; mid: string; deep: string; deepest: string; back: string; sparkle: string }> = {
  light: { crest: '#8ec7f0', mid: '#3f8fd6', deep: '#225f9e', deepest: '#143a5c', back: '#2f6ba8', sparkle: '#fffdf6' },
  dark:  { crest: '#5f9bcf', mid: '#2f6ba8', deep: '#194a7a', deepest: '#0f2b45', back: '#16334f', sparkle: '#8ec7f0' },
};

const SKY_PAL: Record<ThemeMode, { celestial: Record<string, string>; cloud: string; star: string; gull: string }> = {
  light: { celestial: { Y: '#e8a72e', H: '#ffd76b' }, cloud: '#fbf7ea', star: '', gull: '#4a443a' },
  dark:  { celestial: { C: '#e0dcd2' }, cloud: '', star: '#cfcabe', gull: '#b9b4a8' },
};

// Luffy's rubber arm: skin + the red shirt sleeve
const LUFFY_PAL: Record<ThemeMode, { skin: string; sleeve: string }> = {
  light: { skin: '#eab68c', sleeve: '#c9342a' },
  dark:  { skin: '#c8926a', sleeve: '#9c2f24' },
};

function buildSprite(rows: string[], pal: Record<string, string>): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  const g = c.getContext('2d')!;
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (col) {
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    }
  });
  return c;
}

/* -------------------------------------------------------------- component */

/**
 * The footer sea: an 8-bit ocean with the Going Merry sailing on it.
 * The water is a live 1D spring simulation quantized to pixel columns —
 * drag the ship to sail her (she leaves a wake), click the water for a
 * splash, click the ship to fire the cannon, and mind the seagull.
 * Fills the footer behind its content (zIndex 0).
 */
export default function FooterSea() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useThemeCtx();
  const modeRef = useRef(mode);
  // reduced-motion path re-renders its single static frame on theme change
  const staticRedraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    modeRef.current = mode;
    staticRedraw.current?.();
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // start decoding samples so the first splash/stretch plays the real thing
    preloadSamples();

    const ships = {
      light: buildSprite(MERRY, SHIP_PAL.light),
      dark: buildSprite(MERRY, SHIP_PAL.dark),
    };
    const suns = { light: buildSprite(SUN, SKY_PAL.light.celestial), dark: buildSprite(MOON, SKY_PAL.dark.celestial) };
    const cloud = buildSprite(CLOUD, { W: SKY_PAL.light.cloud });
    const gulls = {
      light: GULL.map((f) => buildSprite(f, { K: SKY_PAL.light.gull })),
      dark: GULL.map((f) => buildSprite(f, { K: SKY_PAL.dark.gull })),
    };

    // world state (canvas units)
    let W = 0;
    let H = 0;
    let seaLevel = 0;
    let cols = 0;
    let hgt = new Float32Array(0); // column height deviation
    let vel = new Float32Array(0); // column velocity
    const ship = {
      x: 120, vx: 0, sy: 0, angle: 0, dir: -1 as 1 | -1,
      dragging: false, dragMoved: false, targetX: 120, nextWander: 0,
    };
    const droplets: { x: number; y: number; vx: number; vy: number; bright: boolean }[] = [];
    const balls: { x: number; y: number; vx: number; vy: number }[] = [];
    const flashes: { x: number; y: number; life: number }[] = [];
    const sparkles: { x: number; y: number; life: number }[] = [];
    // sky dressing hugs the horizon: y here is an offset applied below
    // `seaLevel` at draw time, so everything sits right above the water
    const clouds = [
      { fx: 0.16, y: 0, v: 0.010 },
      { fx: 0.62, y: 9, v: 0.006 },
    ];
    const stars = [0.08, 0.2, 0.33, 0.47, 0.58, 0.72, 0.88].map((fx, i) => ({
      fx, y: (i * 7) % 26, phase: i * 1.7,
    }));
    const gull = { active: false, x: 0, y: 0, vx: 0, vy: 0, frame: 0, t: 0, next: 0, squawked: false };
    // Luffy's rubber arm: fires from the bow on a lucky ship-click
    const luffy = { active: false, t: 0, dir: -1 as 1 | -1, len: 0, maxLen: 0, sag: 0 };
    const mouse = { x: -1, y: -1, over: false };

    const reduced = REDUCED();
    let raf = 0;
    let disposed = false;

    const ambient = (i: number, t: number) =>
      1.8 * Math.sin(i * 0.5 + t * 0.0012) + 1.1 * Math.sin(i * 0.21 - t * 0.0007);

    const surfaceAt = (x: number, t: number) => {
      const i = Math.max(0, Math.min(cols - 1, Math.round(x / COLW)));
      return seaLevel + ambient(i, t) + hgt[i];
    };

    /** shove a water column (negative = dip) with falloff on neighbors */
    const disturb = (x: number, amount: number) => {
      const i = Math.round(x / COLW);
      for (let d = -2; d <= 2; d++) {
        const j = i + d;
        if (j >= 0 && j < cols) vel[j] += amount * (1 - Math.abs(d) * 0.35);
      }
    };

    const spawnDroplets = (x: number, y: number, n: number, force: number) => {
      for (let k = 0; k < n; k++) {
        droplets.push({
          x, y,
          vx: (Math.random() - 0.5) * 1.6 * force,
          vy: -(0.8 + Math.random() * 1.2) * force,
          bright: Math.random() < 0.4,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      const fx = W > 0 ? ship.x / W : 0.3;
      W = Math.ceil(rect.width / UNIT);
      H = Math.ceil(rect.height / UNIT);
      canvas.width = W;
      canvas.height = H;
      seaLevel = H - SEA_DEPTH;
      cols = Math.ceil(W / COLW) + 1;
      hgt = new Float32Array(cols);
      vel = new Float32Array(cols);
      ship.x = Math.max(24, Math.min(W - 24, fx * W));
      ship.targetX = ship.x;
      ship.sy = seaLevel;
      ctx.imageSmoothingEnabled = false;
    };

    const drawScene = (t: number) => {
      const m = modeRef.current;
      const sea = SEA_PAL[m];
      const sky = SKY_PAL[m];
      ctx.clearRect(0, 0, W, H);

      // --- sky ---
      if (m === 'dark') {
        for (const s of stars) {
          const tw = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.0011 + s.phase));
          ctx.globalAlpha = tw;
          ctx.fillStyle = sky.star;
          ctx.fillRect(Math.round(s.fx * W), seaLevel - 58 + s.y, 1, 1);
        }
        ctx.globalAlpha = 1;
      }
      // sun/moon riding above the calm waterline
      ctx.drawImage(suns[m], Math.round(W * 0.44), seaLevel - 44, 16, 16);
      if (m === 'light') {
        ctx.globalAlpha = 0.55;
        for (const c of clouds) {
          const cx = Math.round(((c.fx + 1) % 1) * (W + 30)) - 24;
          ctx.drawImage(cloud, cx, seaLevel - 50 + c.y, 24, 6);
        }
        ctx.globalAlpha = 1;
      }
      if (gull.active) {
        const f = gulls[m][gull.frame];
        ctx.drawImage(f, Math.round(gull.x) - 2, Math.round(gull.y) - 1, 5, 3);
      }

      // --- distant swell behind the ship ---
      ctx.fillStyle = sea.back;
      // solid backdrop all the way down: deep wave troughs and the gap under
      // a fast-moving hull expose this instead of the footer background
      ctx.fillRect(0, seaLevel - 2, W, H - seaLevel + 2);
      for (let i = 0; i < cols; i++) {
        const y = Math.round(seaLevel - 5 + 1.5 * Math.sin(i * 0.3 + t * 0.0005) + 1.1 * Math.sin(i * 0.12 - t * 0.0004));
        ctx.fillRect(i * COLW, y, COLW, seaLevel - 2 - y);
      }

      // --- the Merry ---
      ctx.save();
      ctx.translate(Math.round(ship.x), Math.round(ship.sy));
      ctx.rotate(ship.angle);
      ctx.scale(ship.dir === 1 ? -1 : 1, 1);
      ctx.drawImage(ships[m], -SHIP_W / 2, -SHIP_WATERLINE);
      ctx.restore();

      // --- Luffy's rubber arm, punching out over the bow ---
      if (luffy.active && luffy.len > 0.5) {
        const lp = LUFFY_PAL[m];
        const ld = luffy.dir;
        const shX = Math.round(ship.x + ld * 11);
        const shY = Math.round(ship.sy - 10);
        const n = Math.round(luffy.len);
        ctx.fillStyle = lp.skin;
        for (let i = 0; i < n; i++) {
          const sag = Math.round(Math.sin((i / Math.max(1, n)) * Math.PI) * luffy.sag);
          ctx.fillRect(shX + ld * i, shY + sag, 1, 2);
        }
        // fist at the tip
        const fx = shX + ld * n;
        ctx.fillRect(ld === 1 ? fx : fx - 2, shY - 1, 3, 4);
        // red sleeve anchors the arm to the deck
        ctx.fillStyle = lp.sleeve;
        ctx.fillRect(ld === 1 ? shX - 1 : shX - 2, shY - 1, 4, 4);
      }

      // muzzle flashes + cannonballs (in front of the ship, behind the water)
      for (const fl of flashes) {
        ctx.fillStyle = fl.life > 3 ? '#ffd76b' : '#e8a72e';
        ctx.fillRect(Math.round(fl.x) - 1, Math.round(fl.y) - 1, 3, 3);
      }
      // dark hull-outline ink vanishes against the night sea: lighten there
      ctx.fillStyle = m === 'dark' ? '#948e80' : SHIP_PAL[m].K;
      for (const b of balls) ctx.fillRect(Math.round(b.x) - 1, Math.round(b.y) - 1, 2, 2);

      // --- interactive water, column by column ---
      for (let i = 0; i < cols; i++) {
        const sx = i * COLW;
        const y = Math.round(seaLevel + ambient(i, t) + hgt[i]);
        ctx.fillStyle = sea.crest;
        ctx.fillRect(sx, y, COLW, 1);
        ctx.fillStyle = sea.mid;
        ctx.fillRect(sx, y + 1, COLW, 5);
        // dithered handoff into the deep
        ctx.fillStyle = i % 2 === 0 ? sea.mid : sea.deep;
        ctx.fillRect(sx, y + 6, COLW, 1);
        ctx.fillStyle = sea.deep;
        ctx.fillRect(sx, y + 7, COLW, Math.max(0, H - y - 7));
      }
      // deepest band along the bottom, with its own dither seam
      const yD = seaLevel + 15;
      ctx.fillStyle = sea.deepest;
      ctx.fillRect(0, yD, W, H - yD);
      for (let x = 0; x < W; x += COLW * 2) ctx.fillRect(x, yD - 1, COLW, 1);

      // sparkles + droplets ride on top of the water
      for (const s of sparkles) {
        ctx.globalAlpha = Math.min(1, s.life / 14);
        ctx.fillStyle = sea.sparkle;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
      }
      ctx.globalAlpha = 1;
      for (const d of droplets) {
        ctx.fillStyle = d.bright ? sea.sparkle : sea.crest;
        ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, 1);
      }
    };

    const step = (t: number) => {
      // water: neighbor springs + pull back to rest
      for (let i = 0; i < cols; i++) {
        const l = i > 0 ? hgt[i - 1] : hgt[i];
        const r = i < cols - 1 ? hgt[i + 1] : hgt[i];
        vel[i] += ((l + r) / 2 - hgt[i]) * 0.24 - hgt[i] * 0.015;
        vel[i] *= 0.982;
      }
      for (let i = 0; i < cols; i++) {
        hgt[i] = Math.max(-11, Math.min(11, hgt[i] + vel[i]));
      }

      // ship: dragged, or slowly wandering the horizon on her own
      if (ship.dragging) {
        ship.vx = Math.max(-2.4, Math.min(2.4, (ship.targetX - ship.x) * 0.22));
      } else {
        if (t > ship.nextWander) {
          ship.targetX = 30 + Math.random() * (W - 60);
          ship.nextWander = t + 7000 + Math.random() * 11000;
        }
        const dx = ship.targetX - ship.x;
        if (Math.abs(dx) > 8) ship.vx += Math.sign(dx) * 0.006;
        ship.vx *= 0.985;
        ship.vx = Math.max(-0.28, Math.min(0.28, ship.vx));
      }
      ship.x = Math.max(24, Math.min(W - 24, ship.x + ship.vx));
      if (ship.vx > 0.06) ship.dir = 1;
      else if (ship.vx < -0.06) ship.dir = -1;

      // ride the surface: average around the hull, lean into the slope
      const s1 = surfaceAt(ship.x - 9, t);
      const s2 = surfaceAt(ship.x + 9, t);
      const surf = (s1 + s2) / 2 + 0.6 * Math.sin(t * 0.0016);
      ship.sy += (surf - ship.sy) * 0.15;
      const targetA = Math.max(-0.16, Math.min(0.16, (s2 - s1) / 18 * 0.9 + ship.vx * 0.05));
      ship.angle += (targetA - ship.angle) * 0.12;

      // wake: a moving hull churns the water at bow and stern
      if (Math.abs(ship.vx) > 0.35) {
        disturb(ship.x - ship.dir * 15, -Math.abs(ship.vx) * 0.35);
        disturb(ship.x + ship.dir * 15, -Math.abs(ship.vx) * 0.2);
      }

      // Luffy's arm: snap out, hang rubbery for a beat, snap back
      if (luffy.active) {
        luffy.t += 1;
        const EXT = 14, HOLD = 22, RET = 14;
        if (luffy.t <= EXT) {
          const p = luffy.t / EXT;
          luffy.len = luffy.maxLen * (1 - (1 - p) ** 3); // cubic ease-out: the snap
          luffy.sag = 0;
        } else if (luffy.t <= EXT + HOLD) {
          luffy.len = luffy.maxLen;
          luffy.sag = 2 * Math.sin(((luffy.t - EXT) / HOLD) * Math.PI); // rubbery droop
        } else if (luffy.t <= EXT + HOLD + RET) {
          const p = (luffy.t - EXT - HOLD) / RET;
          luffy.len = luffy.maxLen * (1 - p * p); // accelerating snap back
          luffy.sag = 0;
        } else {
          luffy.active = false;
          luffy.len = 0;
        }
        // keep the fist on canvas if the ship drifts toward an edge mid-stretch
        const shoulderX = ship.x + luffy.dir * 11;
        const avail = luffy.dir === 1 ? W - 4 - shoulderX : shoulderX - 4;
        luffy.len = Math.min(luffy.len, Math.max(8, avail));
      }

      // cannonballs: fly, then splash down
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.07;
        if (b.x < -4 || b.x > W + 4) { balls.splice(i, 1); continue; }
        if (b.y >= surfaceAt(b.x, t)) {
          disturb(b.x, -5.5);
          spawnDroplets(b.x, surfaceAt(b.x, t), 12, 1.2);
          play('splash');
          balls.splice(i, 1);
        }
      }
      for (let i = flashes.length - 1; i >= 0; i--) {
        if (--flashes[i].life <= 0) flashes.splice(i, 1);
      }

      // droplets: ballistic, die when they fall back in
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.1;
        if (d.vy > 0 && d.y > surfaceAt(d.x, t) + 1) droplets.splice(i, 1);
      }

      // glints of light on the water
      if (Math.random() < 0.14 && sparkles.length < 24) {
        const x = Math.random() * W;
        sparkles.push({ x, y: surfaceAt(x, t) + 2 + Math.random() * 9, life: 14 + Math.random() * 20 });
      }
      for (let i = sparkles.length - 1; i >= 0; i--) {
        if (--sparkles[i].life <= 0) sparkles.splice(i, 1);
      }

      // clouds drift, wrap around
      for (const c of clouds) c.fx = (c.fx + c.v / Math.max(1, W)) % 1;

      // the seagull: crosses now and then, dodges the cursor
      if (!gull.active && t > gull.next && gull.next > 0) {
        const fromLeft = Math.random() < 0.5;
        gull.active = true;
        gull.x = fromLeft ? -5 : W + 5;
        gull.y = 10 + Math.random() * 22;
        gull.vx = (fromLeft ? 1 : -1) * (0.35 + Math.random() * 0.2);
        gull.vy = 0;
        gull.t = Math.random() * 100;
        gull.squawked = false;
      }
      if (gull.next === 0) gull.next = t + 6000 + Math.random() * 14000;
      if (gull.active) {
        gull.t += 1;
        const near = mouse.over && Math.hypot(mouse.x - gull.x, mouse.y - gull.y) < 22;
        if (near) {
          gull.vy = Math.max(-0.9, gull.vy - 0.12); // flap away upward
          if (!gull.squawked) {
            play('seagull');
            gull.squawked = true;
          }
        } else {
          gull.vy += (Math.sin(gull.t * 0.06) * 0.25 - gull.vy) * 0.05;
          gull.squawked = false;
        }
        gull.x += gull.vx * (near ? 1.8 : 1);
        gull.y = Math.max(3, gull.y + gull.vy);
        gull.frame = Math.floor(gull.t / (near ? 4 : 9)) % 2;
        if (gull.x < -8 || gull.x > W + 8) {
          gull.active = false;
          gull.next = t + 12000 + Math.random() * 20000;
        }
      }
    };

    const tick = () => {
      if (disposed) return;
      const t = performance.now();
      step(t);
      drawScene(t);
      raf = requestAnimationFrame(tick);
    };

    /* ---- pointer interactions ---- */

    const toLocal = (e: PointerEvent | MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / UNIT, y: (e.clientY - r.top) / UNIT };
    };

    const overShip = (p: { x: number; y: number }) =>
      Math.abs(p.x - ship.x) < 21 && p.y > ship.sy - SHIP_WATERLINE - 2 && p.y < ship.sy + 5;

    const fireCannon = () => {
      const bx = ship.x - ship.dir * 6;
      const by = ship.sy - 7;
      balls.push({ x: bx, y: by, vx: -ship.dir * 1.5 + ship.vx * 0.4, vy: -1.5 });
      flashes.push({ x: bx - ship.dir * 2, y: by, life: 6 });
      play('cannon');
    };

    const startLuffyArm = () => {
      luffy.active = true;
      luffy.t = 0;
      luffy.dir = ship.dir;
      const shoulderX = ship.x + ship.dir * 11;
      const avail = ship.dir === 1 ? W - 4 - shoulderX : shoulderX - 4;
      luffy.maxLen = Math.max(18, Math.min(75, avail));
      luffy.len = 0;
      luffy.sag = 0;
      play('luffyStretch');
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      if (ship.dragging) {
        if (Math.abs(p.x - ship.targetX) > 0.01 && Math.abs(p.x - ship.x) > 4 && !ship.dragMoved) {
          ship.dragMoved = true;
          play('pickup');
        }
        ship.targetX = p.x;
        canvas.style.cursor = 'grabbing';
      } else {
        // swiping through the water stirs it
        if (mouse.over && p.y > seaLevel - 6) {
          const d = Math.min(3, Math.hypot(p.x - mouse.x, p.y - mouse.y));
          disturb(p.x, -d * 0.12);
        }
        canvas.style.cursor = overShip(p) ? 'grab' : p.y > seaLevel - 6 ? 'pointer' : 'default';
      }
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.over = true;
    };

    const onLeave = () => {
      mouse.over = false;
      mouse.x = -1;
      mouse.y = -1;
    };

    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      if (overShip(p)) {
        ship.dragging = true;
        ship.dragMoved = false;
        ship.targetX = ship.x;
        ship.nextWander = performance.now() + 5000;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
      } else if (p.y > seaLevel - 6) {
        disturb(p.x, -4.2);
        spawnDroplets(p.x, surfaceAt(p.x, performance.now()), 7, 0.9);
        play('splash');
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!ship.dragging) return;
      ship.dragging = false;
      ship.targetX = ship.x + ship.vx * 20; // keep the momentum as a heading
      ship.nextWander = performance.now() + 6000;
      // press without a drag: usually the cannon, sometimes Luffy lends a hand
      if (!ship.dragMoved) {
        if (Math.random() < 0.2 && !luffy.active) startLuffyArm();
        else fireCannon();
      }
      canvas.style.cursor = 'grab';
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* no-op */ }
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) drawScene(0);
    });
    ro.observe(canvas);
    resize();

    if (reduced) {
      // no animation: one calm frame, ship at anchor
      ship.x = W * 0.3;
      ship.sy = seaLevel;
      drawScene(0);
      staticRedraw.current = () => drawScene(0);
    } else {
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      raf = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      staticRedraw.current = null;
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="A pixel-art sea with the Going Merry sailing on it. Drag the ship to sail, click her to fire the cannon, click the water to splash."
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
        touchAction: 'none',
        zIndex: 0,
      }}
    />
  );
}
