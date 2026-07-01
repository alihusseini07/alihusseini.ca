import { useNavigate } from 'react-router-dom';
import { THEME } from '../tokens';

export default function Experiences() {
  const navigate = useNavigate();
  return (
    <div style={{ background: THEME.pageBg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
      <h1 style={{ font: "400 20px 'Press Start 2P', monospace", color: THEME.nameColor, textShadow: THEME.nameShadow }}>
        Experiences
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
