import type { CSSProperties } from 'react';

/** duration of the page-exit animation before navigating */
export const EXIT_MS = 200;
/** duration of the glitch + dimension-warp transitions (skills grimoire) */
export const WARP_IN_MS = 950;
export const WARP_OUT_MS = 850;
/** duration of the modal-exit animation before unmounting */
export const MODAL_CLOSE_MS = 160;

export const REDUCED = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** true when the pointer can actually hover — touch devices fire a synthetic
    mouseenter on tap with no matching mouseleave, so JS hover effects must
    be skipped there or they stick until the next tap elsewhere */
export const CAN_HOVER = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover)').matches;

/** stagger helper: pair with an .enter-* class */
export function enter(i: number, step = 70): CSSProperties {
  return { animationDelay: `${i * step}ms` };
}
