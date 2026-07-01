import { type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelFolder from './PixelFolder';
import ContactBar from './ContactBar';
import { FOLDER_COLORS, FOLDERS, PROFILE, THEME } from '../tokens';

export default function PortfolioPage() {
  const navigate = useNavigate();

  const page: CSSProperties = {
    background: THEME.pageBg,
    display: 'flex',
    flexDirection: 'column',
    padding: '64px 72px',
    width: '100%',
    minHeight: '100vh',
    overflow: 'hidden',
  };

  const name: CSSProperties = {
    margin: 0,
    font: "400 26px 'Press Start 2P', monospace",
    color: THEME.nameColor,
    textShadow: THEME.nameShadow,
  };

  return (
    <div style={page}>
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <h1 style={name}>{PROFILE.name}</h1>
        <ContactBar links={PROFILE.links} color={THEME.iconColor} hoverColor={THEME.iconHoverColor} />
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 64 }}>
        {FOLDERS.map((f) => (
          <PixelFolder
            key={f.label}
            label={f.label}
            palette={FOLDER_COLORS[f.color]}
            labelColor={THEME.labelColor}
            onClick={() => navigate(f.route)}
          />
        ))}
      </div>
    </div>
  );
}
