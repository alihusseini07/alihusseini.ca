import { useEffect, useRef } from 'react';
import { THEME_REVEAL_MS, themeRevealEase } from '../lib/theme';

/** theme-change ripple: the reveal circle's front triggers each dot as it
    crosses it; the dot then swells and settles over RIPPLE_MS — a single wave
    through the pixels, the block itself stays put. The front itself crosses
    the name in a couple frames, so the per-dot pulse is what you see. */
const RIPPLE_MS = 110;
const RIPPLE_PULSE = 1.8;

const FONT = "'Anton', 'Arial Black', sans-serif";

/** bleed around the glyphs so particles can wander without clipping */
const PAD = 48;
/** sampling step over the rasterized text, in logical px — smaller = more dots */
const GAP = 4;
/** dot radius before local warp magnification */
const DOT = 1.35;
/** italic lean baked into the rasterized glyphs (x shift per y) */
const SKEW = 0.16;
/** fisheye bulge: how much the block center is magnified (ends pinch in) */
const BULGE = 0.34;
/** anisotropy: how much y-distance counts toward the bulge falloff — low value
    keeps the warp cylindrical (pinched left/right ends) instead of ball-shaped */
const BULGE_Y = 0.35;
/** S-wave amplitude (px): the whole block rides one hump-then-dip curve —
    concave-down on the left, concave-up on the right, top and bottom alike */
const WAVE = 24;
/** a short line may grow at most this much past the smallest line's font size;
    the rest of the width is filled with letter-spacing */
const MAX_LINE_RATIO = 1.8;

/** default cursor influence radius (overridable via the `radius` prop) */
const RADIUS = 65;
/** compression: every dot inside RADIUS moves toward the cursor; dots outside
    never move. Displacement is graded — dots near the center compress as hard
    as CLUSTER·u^COMPRESS, while an extra EDGE-weighted u⁴ term lets dots near
    the rim keep most of their distance, so density falls off from the middle */
const COMPRESS = 1.2;
const CLUSTER = 0.5;
const EDGE = 0.76;
/** spring stiffness toward the current target */
const SPRING = 0.08;
const DAMPING = 0.78;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number;
  hy: number;
  r: number;
  /** performance.now() when the reveal front crossed this dot; 0 = untouched */
  ws: number;
}

interface Props {
  lines: string[];
  /** target width of every line's glyphs, logical px — each line is sized to fill it */
  width?: number;
  color?: string;
  /** vertical gap between lines, logical px (negative tucks them together) */
  lineGap?: number;
  /** per-line vertical squash factor (1 = natural height) */
  squash?: number[];
  /** round the layout footprint height up to a multiple of this (px), so the
      block spans a whole number of ruled-paper lines; 0 = off */
  snap?: number;
  /** cursor influence radius, px (smaller = tighter compression) */
  radius?: number;
}

/**
 * The name as a grid of dots: heavy caps sized so every line fills the same
 * width, the whole block warped by a fisheye bulge (big in the middle, pinched
 * at the corners). On hover the dots pinch and swirl into the cursor, and
 * spring back when it leaves.
 */
export default function PixelName({ lines, width = 440, color = '#3f8fd6', lineGap = 6, squash = [], snap = 0, radius = RADIUS }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const text = lines.join('\n');
  const squashKey = squash.join(',');

  // color lives in a ref so a theme change doesn't rebuild the particles
  // (which would replay the assemble-in scatter); it repaints in place
  const colorRef = useRef(color);
  // reveal-circle state while a theme transition runs: start time, circle
  // origin in canvas coords, and the circle's final radius
  const rippleRef = useRef<{ start: number; ox: number; oy: number; maxR: number } | null>(null);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let disposed = false;
    const particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    const caps = lines.map((l) => l.toUpperCase());

    const build = () => {
      if (disposed) return;

      const probe = document.createElement('canvas');
      const pctx = probe.getContext('2d');
      if (!pctx) return;

      // size each line so its glyphs span the same target width; short lines
      // cap their font size and make up the difference with letter-spacing
      const PROBE_SIZE = 100;
      pctx.font = `${PROBE_SIZE}px ${FONT}`;
      const fitSizes = caps.map((l) => (PROBE_SIZE * width) / pctx.measureText(l).width);
      const maxSize = Math.min(...fitSizes) * MAX_LINE_RATIO;
      const sizes = fitSizes.map((s) => Math.min(s, maxSize));
      const spacings = caps.map((l, i) => {
        pctx.font = `${sizes[i]}px ${FONT}`;
        return Math.max(0, (width - pctx.measureText(l).width) / l.length);
      });
      const lineHs = sizes.map((s, i) => {
        pctx.font = `${s}px ${FONT}`;
        const m = pctx.measureText(caps[i]);
        return {
          asc: Math.ceil(m.actualBoundingBoxAscent),
          desc: Math.ceil(m.actualBoundingBoxDescent),
        };
      });

      const skewPad = Math.ceil(SKEW * Math.max(...lineHs.map((l) => l.asc)));
      const tw = Math.ceil(width) + skewPad;
      const th =
        lineHs.reduce((a, l, i) => a + Math.ceil((l.asc + l.desc) * (squash[i] ?? 1)), 0) +
        lineGap * (lines.length - 1);

      probe.width = tw;
      probe.height = th;
      pctx.fillStyle = '#000';
      let lineTop = 0;
      caps.forEach((l, i) => {
        const { asc, desc } = lineHs[i];
        const sy = squash[i] ?? 1;
        // squash the line vertically around its own box, skew in glyph space
        pctx.setTransform(1, 0, -SKEW * sy, sy, SKEW * sy * asc, lineTop);
        pctx.font = `${sizes[i]}px ${FONT}`;
        // letterSpacing needs Chromium 99+/recent browsers; harmless no-op elsewhere
        (pctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${spacings[i]}px`;
        pctx.fillText(l, 0, asc);
        lineTop += Math.ceil((asc + desc) * sy) + lineGap;
      });
      pctx.setTransform(1, 0, 0, 1, 0, 0);

      // sample the flat text, then push every home point through the bulge:
      // p' = c + d·(1 + BULGE·(1 − r²)) with r normalized to the block's
      // half-extents — the middle magnifies, the corners (r > 1) pull inward
      const cx = tw / 2;
      const cy = th / 2;
      const data = pctx.getImageData(0, 0, tw, th).data;
      for (let y = 0; y < th; y += GAP) {
        for (let x = 0; x < tw; x += GAP) {
          if (data[(y * tw + x) * 4 + 3] > 128) {
            const nx = (x - cx) / cx;
            const ny = (y - cy) / cy;
            const mag = 1 + BULGE * (1 - (nx * nx + ny * ny * BULGE_Y));
            // S-wave: one sine period across the block, same phase at every
            // height — both edges go concave-down then concave-up
            const wave = -WAVE * Math.sin((2 * Math.PI * x) / tw);
            // ALT: multiply by `* Math.cos((2 * Math.PI * y) / th)` to flip the
            // seam between the two names to concave-up then concave-down while
            // keeping the top and bottom edges concave-down then concave-up.
            const hx = cx + (x - cx) * mag + PAD;
            const hy = cy + (y - cy) * mag + wave + PAD;
            particles.push({
              // assemble-in: start scattered around home, springs pull together
              x: hx + (Math.random() - 0.5) * 340,
              y: hy + (Math.random() - 0.5) * 220,
              vx: 0,
              vy: 0,
              hx,
              hy,
              // dots grow with the local magnification, like the reference
              r: DOT * Math.max(0.7, Math.min(mag, 1.25)),
              ws: 0,
            });
          }
        }
      }

      const w = tw + PAD * 2;
      const h = th + PAD * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // negative margins cancel the bleed so the glyphs occupy the text's own
      // footprint; extra top margin pads the footprint up to a whole number of
      // ruled lines, keeping everything below on the paper grid
      const snapped = snap > 0 ? Math.ceil(th / snap) * snap : th;
      canvas.style.margin = `${snapped - th - PAD}px -${PAD}px -${PAD}px`;
      ctx.scale(dpr, dpr);

      const tick = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = colorRef.current;
        ctx.beginPath();

        // radius of the reveal circle right now, mirroring the CSS animation;
        // dots get their pulse start stamped the frame the front reaches them
        const now = performance.now();
        const ripple = rippleRef.current;
        let frontR = -1;
        if (ripple) {
          const t = (now - ripple.start) / THEME_REVEAL_MS;
          if (t >= 1) rippleRef.current = null;
          else frontR = ripple.maxR * themeRevealEase(t);
        }

        for (const p of particles) {
          // target = home, remapped through a radial compression field around
          // the cursor: distance r becomes R·(r/R)^COMPRESS, angle unchanged.
          // Deterministic, so dots never tangle and always spring back exactly.
          let tx = p.hx;
          let ty = p.hy;
          if (mouse.active) {
            const dx = p.hx - mouse.x;
            const dy = p.hy - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < radius && d > 0.001) {
              const u = d / radius;
              const nd = radius * (CLUSTER * Math.pow(u, COMPRESS) + (EDGE - CLUSTER) * Math.pow(u, 4));
              tx = mouse.x + (dx / d) * nd;
              ty = mouse.y + (dy / d) * nd;
            }
          }
          p.vx += (tx - p.x) * SPRING;
          p.vy += (ty - p.y) * SPRING;
          p.vx *= DAMPING;
          p.vy *= DAMPING;
          p.x += p.vx;
          p.y += p.vy;

          // front reached this dot: start its pulse
          if (ripple && !p.ws && Math.hypot(p.hx - ripple.ox, p.hy - ripple.oy) <= frontR) {
            p.ws = now;
          }
          // swell-and-settle after the front passes — the wave travels
          // through the pixels without moving them
          let r = p.r;
          if (p.ws) {
            const a = (now - p.ws) / RIPPLE_MS;
            if (a < 1) r += p.r * RIPPLE_PULSE * Math.sin(Math.PI * a);
          }
          ctx.moveTo(p.x + r, p.y);
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        }
        ctx.fill();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    // theme reveal started: capture the circle origin in canvas coords and its
    // end radius (150% of the viewport diagonal ref, mirroring index.css)
    const onReveal = (e: Event) => {
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail;
      const rect = canvas.getBoundingClientRect();
      for (const p of particles) p.ws = 0;
      rippleRef.current = {
        start: performance.now(),
        ox: x - rect.left,
        oy: y - rect.top,
        maxR: (1.5 * Math.hypot(window.innerWidth, window.innerHeight)) / Math.SQRT2,
      };
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    window.addEventListener('theme-reveal', onReveal);

    // rasterizing before the display font arrives would sample a fallback font
    document.fonts.load(`80px ${FONT}`).then(build);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('theme-reveal', onReveal);
    };
  }, [text, width, lineGap, squashKey, snap, radius]);

  return <canvas ref={canvasRef} role="img" aria-label={lines.join(' ')} style={{ display: 'block' }} />;
}
