import { type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelFolder from './PixelFolder';
import ContactBar from './ContactBar';
import { FOLDER_COLORS, FOLDERS, PROFILE, THEMES, type Theme } from '../tokens';

export interface PortfolioPageProps {
  themeId?: keyof typeof THEMES;
}

export default function PortfolioPage({ themeId = 'light' }: PortfolioPageProps) {
  const theme: Theme = THEMES[themeId];
  const navigate = useNavigate();

  const page: CSSProperties = {
    background: theme.pageBg,
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
    color: theme.nameColor,
    textShadow: theme.nameShadow,
  };

  return (
    <div style={page}>
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <h1 style={name}>{PROFILE.name}</h1>
        <ContactBar links={PROFILE.links} color={theme.iconColor} hoverColor={theme.iconHoverColor} />
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 64 }}>
        {FOLDERS.map((f) => {
          const base = FOLDER_COLORS[f.color];
          const palette = theme.outlineOverride
            ? { ...base, outline: theme.outlineOverride[f.color] }
            : base;
          return (
            <PixelFolder
              key={f.label}
              label={f.label}
              palette={palette}
              labelColor={theme.labelColor}
              onClick={() => navigate(f.route)}
            />
          );
        })}
      </div>
    </div>
  );
}
