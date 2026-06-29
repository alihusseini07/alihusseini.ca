import { useNavigate } from 'react-router-dom';
import { THEMES } from '../tokens';
import type { ThemeId } from '../App';

interface Props { themeId: ThemeId }

export default function AboutMe({ themeId }: Props) {
  const theme = THEMES[themeId];
  const navigate = useNavigate();
  return (
    <div style={{ background: theme.pageBg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
      <h1 style={{ font: "400 20px 'Press Start 2P', monospace", color: theme.nameColor, textShadow: theme.nameShadow }}>
        About Me
      </h1>
      <p style={{ fontFamily: "'Silkscreen', monospace", fontSize: 13, color: theme.labelColor }}>
        // Coming soon
      </p>
      <button
        onClick={() => navigate('/')}
        style={{ fontFamily: "'Silkscreen', monospace", fontSize: 11, color: theme.iconColor, background: 'none', border: `1px solid ${theme.iconColor}`, padding: '8px 14px', cursor: 'pointer', textTransform: 'uppercase' }}
      >
        ← Back
      </button>
    </div>
  );
}
