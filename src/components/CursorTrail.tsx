import { useEffect, useRef } from 'react';
import { useThemeCtx } from '../lib/theme';
import { useTrailOn } from '../lib/trail';

/** chisel-tip edge length — the stroke's max width (horizontal sweeps) */
const EDGE = 26;
/** horizontal lean of the edge (sin of the tilt angle); a real marker is
    held slightly rotated, so vertical sweeps still leave a thin line */
const TILT = 0.24;
/** half-thickness of the physical tip, for stroke caps / minimum width */
const TIP_W = 3;
/** fresh ink sits at full strength this long before fading, ms */
const HOLD_MS = 200;
/** then fades out over this long, ms */
const FADE_MS = 500;
/** peak opacity of fresh ink */
const MAX_ALPHA = 0.5;
/** fade quantization levels — needed to batch quads into shared fills */
const STEPS = 8;
/** subdivide fast pointer jumps so the tail erodes evenly, px */
const SEG_LEN = 18;
/** cap the backing-store resolution; the sheet canvas can be pages tall */
const MAX_DPR = 2;

// edge half-vector: from stroke center to the tip's upper corner
const EX = (EDGE / 2) * TILT;
const EY = (EDGE / 2) * Math.sqrt(1 - TILT * TILT);

/** one swept quad of the ribbon (or a tip stamp), corners clockwise */
interface Seg {
  x1: number; y1: number;
  x2: number; y2: number;
  x3: number; y3: number;
  x4: number; y4: number;
  born: number;
}

/**
 * Chisel-tip highlighter trail. The tip is a fixed-angle edge; each pointer
 * sample connects the previous edge to the current one with a filled quad,
 * sweeping a continuous ribbon: wide on horizontal moves (full edge height),
 * thin on vertical moves (just the edge's lean) — like a real marker that
 * doesn't rotate in your hand.
 *
 * Renders as an absolute, z:-1 canvas filling its nearest positioned
 * ancestor: it paints above that surface's background but below all of its
 * in-flow content, so the stroke never breaks — it just disappears behind
 * text and cards. Ink is stored in surface-local coordinates, so it scrolls
 * with the page instead of sticking to the viewport; the stroke resets on
 * scroll so the pointer's coordinate jump doesn't smear a streak.
 */
export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode, theme } = useThemeCtx();
  const enabled = useTrailOn();
  // dark mode keeps the accent blue; light mode uses a paler ink so the
  // multiply wash stays soft on the light paper
  const ink = mode === 'dark' ? theme.accentBlue : '#8ec7f0';
  const colorRef = useRef(ink);
  colorRef.current = ink;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // no cursor on touch devices; honor reduced-motion
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!enabled) {
      // wipe any ink left from before the toggle; region overshoots under
      // the dpr transform carried over from the last enabled run — fine
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const segs: Seg[] = [];
    let raf = 0;
    let pen: { x: number; y: number } | null = null;
    let w = 0;
    let h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const now = performance.now();
      // one path per fade level: overlapping quads inside a single fill()
      // paint each pixel once, so strokes stay flat instead of blotchy
      const levels: (Path2D | undefined)[] = new Array(STEPS + 1);
      for (let i = segs.length - 1; i >= 0; i--) {
        const s = segs[i];
        const age = now - s.born;
        // ink sits at full strength, then evaporates
        const life = age < HOLD_MS ? 1 : 1 - (age - HOLD_MS) / FADE_MS;
        if (life <= 0) {
          segs.splice(i, 1);
          continue;
        }
        const lv = Math.ceil(life * STEPS);
        const p = (levels[lv] ??= new Path2D());
        p.moveTo(s.x1, s.y1);
        p.lineTo(s.x2, s.y2);
        p.lineTo(s.x3, s.y3);
        p.lineTo(s.x4, s.y4);
        p.closePath();
      }
      // strongest ink first, weaker levels painted only *behind* it — the
      // whole trail reads as one flat wash with no seams or dark patches
      // where levels overlap
      ctx.fillStyle = colorRef.current;
      ctx.globalCompositeOperation = 'destination-over';
      for (let lv = STEPS; lv >= 1; lv--) {
        const p = levels[lv];
        if (!p) continue;
        ctx.globalAlpha = MAX_ALPHA * (lv / STEPS);
        ctx.fill(p);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      raf = segs.length ? requestAnimationFrame(draw) : 0;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    /** push a quad normalized to clockwise winding — sweeps in opposite
        directions would otherwise alternate winding, and opposite-winding
        overlaps cancel under the nonzero fill rule, punching holes in the
        stroke wherever it doubles back over itself */
    const pushQuad = (
      x1: number, y1: number, x2: number, y2: number,
      x3: number, y3: number, x4: number, y4: number,
    ) => {
      const area =
        (x2 - x1) * (y2 + y1) + (x3 - x2) * (y3 + y2) +
        (x4 - x3) * (y4 + y3) + (x1 - x4) * (y1 + y4);
      segs.push(
        area >= 0
          ? { x1, y1, x2, y2, x3, y3, x4, y4, born: performance.now() }
          : { x1: x4, y1: y4, x2: x3, y2: y3, x3: x2, y3: y2, x4: x1, y4: y1, born: performance.now() },
      );
      wake();
    };

    /** chisel footprint at a point — also the stroke's start/end cap */
    const stampTip = (x: number, y: number) => {
      pushQuad(
        x + EX - TIP_W, y - EY,
        x + EX + TIP_W, y - EY,
        x - EX + TIP_W, y + EY,
        x - EX - TIP_W, y + EY,
      );
    };

    /** quad sweeping the edge from point a to point b */
    const sweep = (ax: number, ay: number, bx: number, by: number) => {
      pushQuad(
        ax + EX, ay - EY,
        bx + EX, by - EY,
        bx - EX, by + EY,
        ax - EX, ay + EY,
      );
    };

    const onMove = (e: PointerEvent) => {
      // the pixel name is the one place the marker lifts off the page
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      if (hit?.closest('[data-trail-block]')) {
        pen = null;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > w || y > h) {
        pen = null;
        return;
      }
      if (!pen) {
        // touch down: leave the chisel's footprint
        stampTip(x, y);
        pen = { x, y };
        return;
      }
      const dx = x - pen.x;
      const dy = y - pen.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) return;
      // subdivide long jumps so the tail fades in even slices
      const n = Math.max(1, Math.ceil(dist / SEG_LEN));
      let px = pen.x;
      let py = pen.y;
      for (let s = 1; s <= n; s++) {
        const nx = pen.x + (dx * s) / n;
        const ny = pen.y + (dy * s) / n;
        sweep(px, py, nx, ny);
        px = nx;
        py = ny;
      }
      pen = { x, y };
    };

    // scrolling shifts the pointer's surface-local position without a real
    // hand movement — break the stroke instead of smearing across the jump
    const onBreak = () => {
      pen = null;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onBreak, { passive: true, capture: true });
    window.addEventListener('blur', onBreak);
    document.addEventListener('pointerleave', onBreak);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onBreak, { capture: true } as EventListenerOptions);
      window.removeEventListener('blur', onBreak);
      document.removeEventListener('pointerleave', onBreak);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        // above the surface's own background, below its in-flow content
        zIndex: -1,
        pointerEvents: 'none',
        // multiply soaks into light paper; screen glows off the dark page
        mixBlendMode: mode === 'dark' ? 'screen' : 'multiply',
      }}
    />
  );
}
