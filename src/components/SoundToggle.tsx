import { toggleMute, useMuted } from '../lib/sound';
import { useThemeCtx } from '../lib/theme';

export default function SoundToggle() {
  const muted = useMuted();
  const { mode, theme } = useThemeCtx();
  const dark = mode === 'dark';
  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      title={muted ? 'Unmute sounds' : 'Mute sounds'}
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
      {muted ? (
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
          <path d="M22 9l-6 6M16 9l6 6" />
        </svg>
      ) : (
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.4 5.6a9 9 0 0 1 0 12.8" />
        </svg>
      )}
    </button>
  );
}
