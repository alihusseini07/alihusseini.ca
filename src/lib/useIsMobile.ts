import { useEffect, useState } from 'react';

/**
 * True while the viewport is at or below `breakpoint` px. Drives the
 * mobile layout branches across the site (phones + portrait tablets).
 * Starts `false` on first paint, then corrects in an effect — matches the
 * SPA's client-only render, so the desktop layout never ships to a phone
 * for more than a frame.
 */
export function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [breakpoint]);
  return isMobile;
}
