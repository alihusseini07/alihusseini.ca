import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { play } from '../lib/sound';
import { EXIT_MS, WARP_IN_MS, WARP_OUT_MS, REDUCED } from '../lib/motion';

export interface GoOptions {
  /** 'in' = glitch + twist into the grimoire dimension, 'out' = warp back home */
  warp?: 'in' | 'out';
  /** viewport point to warp toward (the clicked folder's center) */
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
    } else {
      play('whooshClose');
    }
    busy.current = true;
    enterRef.current = { cls: enterCls, origin: enterOrigin };
    setExit({ cls: exitCls, origin });
    // sliding/warping pages overflow the document; hide scrollbars until enter settles
    document.documentElement.style.overflow = 'hidden';
    // warp shakes translate the page wrapper, exposing the body at the
    // edges — ink it grimoire-dark for the ride so the slivers don't flash
    // the light page background
    if (opts?.warp) document.body.style.background = '#241505';
    setTimeout(() => {
      busy.current = false;
      setExit(null);
      navigate(to);
      // warp enters keep shaking for ~.8s after navigate — hold the dark
      // backdrop until they settle
      setTimeout(() => {
        document.documentElement.style.overflow = '';
        document.body.style.background = '';
      }, opts?.warp ? 900 : 400);
    }, ms);
  }, [navigate]);

  // restore the pre-reload scroll position before first paint — native
  // restoration is disabled in main.tsx because it fires after the SPA's
  // empty first paint and flashes the top of the page
  useLayoutEffect(() => {
    const raw = sessionStorage.getItem('reload-scroll');
    if (!raw) return;
    sessionStorage.removeItem('reload-scroll');
    try {
      const { path, y } = JSON.parse(raw) as { path: string; y: number };
      if (path !== window.location.pathname || !y) return;
      window.scrollTo(0, y);
      // late-loading images can leave the document too short right now,
      // clamping the scroll — retry once everything has loaded, but only if
      // the user hasn't scrolled away from the clamped position themselves
      const clamped = window.scrollY;
      if (clamped < y) {
        const retry = () => {
          if (window.scrollY === clamped) window.scrollTo(0, y);
        };
        window.addEventListener('load', retry, { once: true });
      }
    } catch {
      // corrupt saved state — nothing to restore
    }
  }, []);

  // consume the enter style once; back/forward navigations get the default
  const enter = enterRef.current;
  const prevPath = useRef(location.pathname);
  useEffect(() => {
    enterRef.current = { cls: 'page-enter' };
    // land at the top only when the path actually changes — never on the
    // initial load, where it would stomp the restored reload position (a
    // first-run flag won't do: StrictMode replays mount effects, and the
    // replay would see the flag already consumed and scroll anyway)
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <TransitionCtx.Provider value={go}>
      <PageFrame
        key={location.pathname}
        exit={exit}
        enterCls={enter.cls}
        enterOrigin={enter.origin}
      >
        {children}
      </PageFrame>
    </TransitionCtx.Provider>
  );
}

/**
 * Wraps a page and plays its enter animation, then strips the animation class
 * once it finishes. Keyed by pathname, so the `settled` state resets on every
 * navigation. Dropping the class matters: a finished-but-filling
 * transform/filter animation keeps the wrapper as a containing block for
 * position:fixed descendants (Chrome holds the compositing layer while the
 * animation stays applied), which would trap the fixed footer against the
 * wrapper instead of the viewport. Removing the class reverts it to a plain
 * div so the footer anchors to the viewport and reveals correctly on scroll.
 */
function PageFrame({
  exit,
  enterCls,
  enterOrigin,
  children,
}: {
  exit: { cls: string; origin?: string } | null;
  enterCls: string;
  enterOrigin?: string;
  children: ReactNode;
}) {
  const [settled, setSettled] = useState(false);
  const exiting = !!exit;
  const className = exiting ? exit!.cls : settled ? '' : enterCls;
  return (
    <div
      className={className}
      style={{ transformOrigin: exiting ? exit!.origin : enterOrigin }}
      onAnimationEnd={(e) => {
        // ignore animations bubbling up from children — only this wrapper's
        // own enter animation should settle it
        if (!exiting && e.target === e.currentTarget) setSettled(true);
      }}
    >
      {children}
    </div>
  );
}
