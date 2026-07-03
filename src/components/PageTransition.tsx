import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { play } from '../lib/sound';
import { EXIT_MS, ZOOM_MS, WARP_IN_MS, WARP_OUT_MS, REDUCED } from '../lib/motion';

export interface GoOptions {
  /** 'in' = dive into a folder, 'out' = pull back out of it */
  zoom?: 'in' | 'out';
  /** 'in' = glitch + twist into the grimoire dimension, 'out' = warp back home */
  warp?: 'in' | 'out';
  /** viewport point to zoom toward (the clicked folder's center) */
  origin?: { x: number; y: number };
}

type Go = (to: string, opts?: GoOptions) => void;

const TransitionCtx = createContext<Go>(() => {});

/** navigate with a page transition + sound; use instead of useNavigate */
export const useTransitionNavigate = () => useContext(TransitionCtx);

/** remembered dive point so the return trip zooms back out of the same folder */
let lastOrigin: { x: number; y: number } | null = null;

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [exit, setExit] = useState<{ cls: string; origin?: string } | null>(null);
  const enterRef = useRef<{ cls: string; origin?: string }>({ cls: 'page-enter' });
  const busy = useRef(false);

  const go = useCallback<Go>((to, opts) => {
    if (busy.current) return;
    if (REDUCED()) {
      navigate(to);
      return;
    }
    let exitCls = 'page-exit';
    let enterCls = 'page-enter';
    let origin: string | undefined;
    let enterOrigin: string | undefined;
    let ms = EXIT_MS;
    if (opts?.warp === 'in') {
      if (opts.origin) lastOrigin = opts.origin;
      origin = opts.origin ? `${opts.origin.x}px ${opts.origin.y}px` : '50% 50%';
      exitCls = 'page-exit-glitchwarp';
      enterCls = 'page-enter-warped';
      ms = WARP_IN_MS;
      play('warpIn');
    } else if (opts?.warp === 'out') {
      origin = lastOrigin ? `${lastOrigin.x}px ${lastOrigin.y}px` : '50% 45%';
      enterOrigin = origin;
      exitCls = 'page-exit-unwarp';
      enterCls = 'page-enter-unwarped';
      ms = WARP_OUT_MS;
      play('warpOut');
    } else if (opts?.zoom === 'in') {
      if (opts.origin) lastOrigin = opts.origin;
      origin = opts.origin ? `${opts.origin.x}px ${opts.origin.y}px` : '50% 50%';
      exitCls = 'page-exit-dive';
      enterCls = 'page-enter-inside';
      ms = ZOOM_MS;
      play('paperIn');
    } else if (opts?.zoom === 'out') {
      origin = lastOrigin ? `${lastOrigin.x}px ${lastOrigin.y}px` : '50% 45%';
      enterOrigin = origin;
      exitCls = 'page-exit-back';
      enterCls = 'page-enter-outside';
      ms = ZOOM_MS;
      play('paperOut');
    } else {
      play('whooshClose');
    }
    busy.current = true;
    enterRef.current = { cls: enterCls, origin: enterOrigin };
    setExit({ cls: exitCls, origin });
    // scaled pages overflow the document; hide scrollbars until enter settles
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => {
      busy.current = false;
      setExit(null);
      navigate(to);
      setTimeout(() => { document.documentElement.style.overflow = ''; }, 400);
    }, ms);
  }, [navigate]);

  // consume the enter style once; back/forward navigations get the default
  const enter = enterRef.current;
  useEffect(() => {
    enterRef.current = { cls: 'page-enter' };
  }, [location.pathname]);

  return (
    <TransitionCtx.Provider value={go}>
      <div
        key={location.pathname}
        className={exit ? exit.cls : enter.cls}
        style={{ transformOrigin: exit ? exit.origin : enter.origin }}
      >
        {children}
      </div>
    </TransitionCtx.Provider>
  );
}
