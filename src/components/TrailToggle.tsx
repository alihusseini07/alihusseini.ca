import { play } from '../lib/sound';
import { useThemeCtx } from '../lib/theme';
import { toggleTrail, useTrailOn } from '../lib/trail';

export default function TrailToggle() {
  const { mode, theme } = useThemeCtx();
  const on = useTrailOn();
  const dark = mode === 'dark';
  return (
    <button
      onClick={() => {
        play(on ? 'toggleOff' : 'toggleOn');
        toggleTrail();
      }}
      aria-label={on ? 'Disable cursor trail' : 'Enable cursor trail'}
      title={on ? 'Disable cursor trail' : 'Enable cursor trail'}
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
      {/* highlighter marker; slashed when the trail is off */}
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 11-6 6v3h9l3-3" />
        <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
        {!on && <path d="M2 2l20 20" />}
      </svg>
    </button>
  );
}
