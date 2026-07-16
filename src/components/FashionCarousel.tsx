import { useEffect, useRef, useState } from 'react';
import type { AboutMedia } from '../data/about';
import { play } from '../lib/sound';

const AUTO_ADVANCE_MS = 2500;
/** Remaining drag distance (px) on release that commits one more slide instead of snapping back. */
const DRAG_THRESHOLD = 60;
/**
 * Fraction of the slide spacing a drag must cross to commit a slide mid-drag.
 * Slightly past halfway so a pointer hovering at the midpoint doesn't flip
 * back and forth between neighbours.
 */
const STEP_COMMIT_RATIO = 0.55;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Signed shortest distance from the active slide to slide i on the loop. */
function loopOffset(i: number, active: number, count: number) {
  const half = Math.floor(count / 2);
  return ((i - active) % count + count + half) % count - half;
}

/**
 * Resting values per |offset| step — must mirror the data-off rules in
 * index.css. x is in units of --fc-step.
 */
const KEYFRAMES = [
  { x: 0, s: 1, o: 1 },
  { x: 1, s: 0.58, o: 0.45 },
  { x: 1.7, s: 0.45, o: 0.14 },
  { x: 2.1, s: 0.4, o: 0 },
];

/** Interpolated slide style at a fractional loop offset (drag in progress). */
function slideStyle(pos: number) {
  const a = Math.min(Math.abs(pos), 3);
  const seg = Math.min(Math.floor(a), 2);
  const t = a - seg;
  const from = KEYFRAMES[seg];
  const to = KEYFRAMES[seg + 1];
  const lerp = (p: number, q: number) => p + (q - p) * t;
  return {
    x: Math.sign(pos) * lerp(from.x, to.x),
    s: lerp(from.s, to.s),
    o: lerp(from.o, to.o),
    // Finer-grained than the resting 0–3 z scale so stacking order hands over
    // cleanly as two slides cross.
    z: Math.round(30 - a * 10),
  };
}

export default function FashionCarousel({ frames, label }: { frames: AboutMedia[]; label?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  // Interaction state in refs so the auto-advance timer reads live values.
  const draggingRef = useRef(false);
  const onscreenRef = useRef(true);
  // Auto-advance holds off for a full interval after any user interaction —
  // otherwise a drag landing just before a timer tick advances again instantly.
  const lastUserRef = useRef(0);

  const count = frames.length;
  // User-initiated moves make sound; the auto-advance timer stays silent.
  const goTo = (i: number) => {
    lastUserRef.current = Date.now();
    const next = ((i % count) + count) % count;
    if (next !== active) play('hangerSlide');
    setActive(next);
  };

  // Auto-advance, paused while dragging, offscreen, or tabbed away.
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      if (draggingRef.current || !onscreenRef.current || document.hidden) return;
      if (Date.now() - lastUserRef.current < AUTO_ADVANCE_MS) return;
      setActive((a) => (a + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [count, reduced]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(([entry]) => {
      onscreenRef.current = entry.isIntersecting;
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Drag to advance; a tap (no real movement) on a side slide centers it instead.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    e.preventDefault();
    draggingRef.current = true;
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('is-dragging');
    const startX = e.clientX;
    const startY = e.clientY;
    const downTarget = e.target as HTMLElement;
    let moved = false;

    // Spacing between adjacent slide centres, measured from the DOM because
    // --fc-step is a responsive clamp() the JS can't resolve.
    const center = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    };
    const s0 = stage.querySelector('[data-off="0"]');
    const s1 = stage.querySelector('[data-off="1"]');
    const stepPx = s0 && s1 ? Math.abs(center(s1) - center(s0)) : 240;

    // Rebased each time a slide commits mid-drag so dx stays continuous.
    let baseX = startX;
    let stepped = false;
    // Mirrors the React state during the drag so per-move math never has to
    // wait on a render.
    let localActive = active;
    const slides = Array.from(stage.querySelectorAll<HTMLElement>('.fashion-carousel__slide'));

    // While dragging, every slide is styled continuously from the fractional
    // drag progress (inline vars override the discrete data-off CSS), so
    // in-between slides grow and fade smoothly instead of popping states.
    const applyDragStyles = (dx: number) => {
      for (const el of slides) {
        const pos = loopOffset(Number(el.dataset.idx), localActive, count) + dx / stepPx;
        const st = slideStyle(pos);
        el.style.setProperty('--fc-x', `${st.x * stepPx}px`);
        el.style.setProperty('--fc-s', String(st.s));
        el.style.setProperty('--fc-o', String(st.o));
        el.style.setProperty('--fc-z', String(st.z));
      }
    };

    const onMove = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) >= 6) moved = true;
      let dx = ev.clientX - baseX;
      // A long drag scrubs through as many slides as it covers: each crossing
      // commits one slide (dots, sound, auto-advance base) and rebases; the
      // visuals stay continuous through applyDragStyles regardless.
      while (count > 1 && Math.abs(dx) > stepPx * STEP_COMMIT_RATIO) {
        const dir = dx < 0 ? 1 : -1; // drag left → next slide
        stepped = true;
        localActive = (localActive + dir + count) % count;
        play('hangerSlide');
        setActive(localActive);
        baseX -= dir * stepPx;
        dx = ev.clientX - baseX;
      }
      applyDragStyles(dx);
    };
    const finish = () => {
      draggingRef.current = false;
      lastUserRef.current = Date.now(); // snap-backs count too, not just commits
      // Drop the inline overrides and re-enable transitions in one pass so the
      // slides animate from their exact drag positions to their resting spots.
      for (const el of slides) {
        el.style.removeProperty('--fc-x');
        el.style.removeProperty('--fc-s');
        el.style.removeProperty('--fc-o');
        el.style.removeProperty('--fc-z');
      }
      stage.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
    const onUp = (ev: PointerEvent) => {
      // Remainder past the last mid-drag commit, not the full drag distance.
      const dx = ev.clientX - baseX;
      finish();
      if (moved) {
        // Once mid-drag commits have happened, active is already the nearest
        // slide — only a remainder past halfway should commit one more. The
        // small flick threshold applies only to drags that never stepped.
        const commitPx = stepped ? stepPx / 2 : DRAG_THRESHOLD;
        if (dx <= -commitPx) {
          if (count > 1) play('hangerSlide');
          setActive((a) => (a + 1) % count);
        } else if (dx >= commitPx) {
          if (count > 1) play('hangerSlide');
          setActive((a) => (a - 1 + count) % count);
        }
      } else {
        const idx = downTarget.closest<HTMLElement>('[data-idx]')?.dataset.idx;
        if (idx !== undefined) goTo(Number(idx));
      }
    };
    // Vertical swipes hand the gesture to native scroll (touch-action: pan-y)
    // and fire pointercancel instead of pointerup — without this, draggingRef
    // stays true and the auto-advance never resumes.
    const onCancel = () => finish();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  };

  const current = frames[active];

  return (
    <div className="fashion-carousel" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={stageRef}
        className="fashion-carousel__stage"
        onPointerDown={onPointerDown}
      >
        {frames.map((media, i) => {
          const off = loopOffset(i, active, count);
          // Slides beyond ±3 park (hidden) at the edges so a wrap-around
          // still slides in from the correct side.
          const clamped = Math.max(-3, Math.min(3, off));
          return (
            <div
              key={media.id}
              className="fashion-carousel__slide"
              data-off={clamped}
              data-idx={i}
              aria-hidden={off !== 0}
            >
              <img src={media.src} alt={media.alt} loading="lazy" draggable={false} />
            </div>
          );
        })}
      </div>
      <p className="fashion-carousel__caption" aria-live="polite">
        <span aria-hidden>[ </span>
        {current.title ?? current.alt}
        <span aria-hidden> ]</span>
      </p>
    </div>
  );
}
