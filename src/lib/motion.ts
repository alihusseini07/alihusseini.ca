import type { CSSProperties } from 'react';

/** duration of the page-exit animation before navigating */
export const EXIT_MS = 200;
/** duration of the folder dive/back-out page transitions */
export const ZOOM_MS = 360;
/** duration of the modal-exit animation before unmounting */
export const MODAL_CLOSE_MS = 160;

export const REDUCED = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** stagger helper: pair with an .enter-* class */
export function enter(i: number, step = 70): CSSProperties {
  return { animationDelay: `${i * step}ms` };
}
