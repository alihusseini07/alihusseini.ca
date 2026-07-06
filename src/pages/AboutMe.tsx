import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import SoundToggle from '../components/SoundToggle';
import { useTheme } from '../lib/theme';

export default function AboutMe() {
  const navigate = useNavigate();
  const THEME = useTheme();
  return (
    <div style={{ background: THEME.pageBg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
      <div style={{ position: 'fixed', top: 20, right: 28, zIndex: 40, display: 'flex', alignItems: 'center', gap: 22 }}>
        <ThemeToggle />
        <SoundToggle />
      </div>
      <h1 style={{ font: "400 20px 'Press Start 2P', monospace", color: THEME.nameColor, textShadow: THEME.nameShadow }}>
        About Me
      </h1>
      <p style={{ fontSize: 13, color: THEME.labelColor }}>
        // Coming soon
      </p>
      <button
        onClick={() => navigate('/')}
        style={{ fontSize: 11, color: THEME.iconColor, background: 'none', border: `1px solid ${THEME.iconColor}`, padding: '8px 14px', cursor: 'pointer', textTransform: 'uppercase' }}
      >
        ← Back
      </button>
    </div>
  );
}
