import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { THEMES, dimAccent, folderPalettes, type FolderColors, type Theme, type ThemeMode } from '../tokens';

const STORAGE_KEY = 'theme';

interface ThemeCtx {
  mode: ThemeMode;
  theme: Theme;
  toggle: () => void;
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

  // mirror the mode onto <html> so the base bg (index.css) matches before paint
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value: ThemeCtx = {
    mode,
    theme: THEMES[mode],
    toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
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
