import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { THEMES, dimAccent, folderPalettes, type FolderColors, type Theme, type ThemeMode } from '../tokens';

const STORAGE_KEY = 'theme';

/** duration + easing of the theme reveal circle — must match the
    `theme-reveal` animation in index.css */
export const THEME_REVEAL_MS = 500;
const bez = (a: number, b: number, u: number) =>
  3 * a * (1 - u) * (1 - u) * u + 3 * b * (1 - u) * u * u + u * u * u;
/** cubic-bezier(.3,.6,.35,1) — progress of the reveal at time fraction x */
export function themeRevealEase(x: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (bez(0.3, 0.35, mid) < x) lo = mid;
    else hi = mid;
  }
  return bez(0.6, 1, (lo + hi) / 2);
}

interface ThemeCtx {
  mode: ThemeMode;
  theme: Theme;
  /** toggle the theme; x/y (viewport px) anchor the reveal animation */
  toggle: (x?: number, y?: number) => void;
  /** darken a flat accent hue when in dark mode */
  accent: (hex: string) => string;
  /** folder sprite palettes for the current mode */
  folders: Record<string, FolderColors>;
}

const Ctx = createContext<ThemeCtx | null>(null);

function initialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  // mirror the mode onto <html> so the base bg (index.css) matches before paint;
  // layout effect so it lands inside the view-transition snapshot
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggle = (x?: number, y?: number) => {
    const next = mode === 'light' ? 'dark' : 'light';
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode(next);
      return;
    }
    // anchor the circular reveal at the toggle (default: top-right corner)
    const root = document.documentElement;
    root.style.setProperty('--theme-x', `${x ?? window.innerWidth}px`);
    root.style.setProperty('--theme-y', `${y ?? 0}px`);
    const vt = doc.startViewTransition(() => {
      flushSync(() => setMode(next));
    }) as { ready?: Promise<void> };
    // announce when the reveal circle actually starts animating so canvases
    // (PixelName) can sync their own effects to its front
    vt.ready
      ?.then(() => {
        window.dispatchEvent(
          new CustomEvent('theme-reveal', {
            detail: { x: x ?? window.innerWidth, y: y ?? 0 },
          }),
        );
      })
      .catch(() => {});
  };

  const value: ThemeCtx = {
    mode,
    theme: THEMES[mode],
    toggle,
    accent: (hex) => dimAccent(hex, mode),
    folders: folderPalettes(mode),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): Theme {
  return useThemeCtx().theme;
}

export function useThemeCtx(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
