import { useEffect, useRef, useState } from 'react';
import type { AboutMedia } from '../data/about';

const AUTO_ADVANCE_MS = 4000;
/** Drag distance (px) that commits a slide change instead of snapping back. */
const DRAG_THRESHOLD = 60;

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

export default function FashionCarousel({ frames, label }: { frames: AboutMedia[]; label?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  // Interaction state in refs so the auto-advance timer reads live values.
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const onscreenRef = useRef(true);

  const count = frames.length;
  const goTo = (i: number) => setActive(((i % count) + count) % count);

  // Auto-advance, paused while hovered, dragging, offscreen, or tabbed away.
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      if (pausedRef.current || draggingRef.current || !onscreenRef.current || document.hidden) return;
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

    const onMove = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) >= 6) moved = true;
      stage.style.setProperty('--fc-drag', `${ev.clientX - startX}px`);
    };
    const onUp = (ev: PointerEvent) => {
      draggingRef.current = false;
      stage.classList.remove('is-dragging');
      stage.style.setProperty('--fc-drag', '0px');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const dx = ev.clientX - startX;
      if (moved) {
        if (dx <= -DRAG_THRESHOLD) setActive((a) => (a + 1) % count);
        else if (dx >= DRAG_THRESHOLD) setActive((a) => (a - 1 + count) % count);
      } else {
        const idx = downTarget.closest<HTMLElement>('[data-idx]')?.dataset.idx;
        if (idx !== undefined) goTo(Number(idx));
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const current = frames[active];

  return (
    <div className="fashion-carousel" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={stageRef}
        className="fashion-carousel__stage"
        onPointerDown={onPointerDown}
        onPointerEnter={() => (pausedRef.current = true)}
        onPointerLeave={() => (pausedRef.current = false)}
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
      <div className="fashion-carousel__dots">
        {frames.map((media, i) => (
          <button
            key={media.id}
            type="button"
            className={`fashion-carousel__dot${i === active ? ' is-active' : ''}`}
            aria-label={`Show ${media.title ?? media.alt}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
