import { play } from '../lib/sound';
import { useThemeCtx } from '../lib/theme';

export default function ThemeToggle() {
  const { mode, theme, toggle } = useThemeCtx();
  const dark = mode === 'dark';
  return (
    <button
      onClick={() => { play('tick'); toggle(); }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.headerBg,
        border: `2px solid ${theme.headerBorder}`,
        boxShadow: `2px 2px 0 ${dark ? 'rgba(0,0,0,.4)' : 'rgba(52,48,42,.25)'}`,
        cursor: 'pointer',
        color: theme.iconHoverColor,
        padding: 0,
      }}
    >
      {dark ? (
        // moon
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        // sun
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
        </svg>
      )}
    </button>
  );
}
