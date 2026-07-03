import { type CSSProperties } from 'react';
import PixelFolder from './PixelFolder';
import ContactBar from './ContactBar';
import SoundToggle from './SoundToggle';
import { useTransitionNavigate } from './PageTransition';
import { enter } from '../lib/motion';
import { FOLDER_COLORS, FOLDERS, PROFILE, THEME } from '../tokens';

/** ruled-paper line spacing, in px */
const RULE = 40;

/** vertically stretched pixel-font glyphs */
const stretch: CSSProperties = {
  display: 'inline-block',
  transform: 'scaleY(1.4)',
  transformOrigin: 'bottom',
};

/** yellow highlighter marker */
const highlight: CSSProperties = {
  background: `linear-gradient(${THEME.highlight}, ${THEME.highlight})`,
  boxShadow: `0 0 0 2px ${THEME.highlight}`,
};

const PIXEL = "'Press Start 2P', monospace";

export default function PortfolioPage() {
  const navigate = useTransitionNavigate();

  const page: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: THEME.pageBg,
    fontFamily: PIXEL,
    WebkitFontSmoothing: 'none',
  };

  const header: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 34px',
    height: 58,
    background: THEME.headerBg,
    borderBottom: `2px solid ${THEME.headerBorder}`,
    boxShadow: '0 2px 0 rgba(52,48,42,.12)',
  };

  const headerName: CSSProperties = {
    ...stretch,
    fontFamily: PIXEL,
    fontSize: 11,
    letterSpacing: 1,
    color: THEME.iconColor,
    textTransform: 'uppercase',
  };

  const sheet: CSSProperties = {
    position: 'relative',
    flex: 1,
    backgroundColor: THEME.pageBg,
    backgroundImage: `repeating-linear-gradient(${THEME.pageBg} 0px, ${THEME.pageBg} ${RULE - 1}px, ${THEME.ruleColor} ${RULE - 1}px, ${THEME.ruleColor} ${RULE}px)`,
  };

  const marginRule: CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 104,
    width: 2,
    background: THEME.marginColor,
  };

  const content: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    padding: '0 72px 0 140px',
    display: 'flex',
    flexDirection: 'column',
  };

  const blank: CSSProperties = { height: RULE };

  const row = (extra: CSSProperties = {}): CSSProperties => ({
    margin: 0,
    height: RULE,
    display: 'flex',
    alignItems: 'flex-end',
    lineHeight: 1,
    fontFamily: PIXEL,
    whiteSpace: 'nowrap',
    ...extra,
  });

  const name: CSSProperties = {
    ...row(),
    height: RULE * 2,
    paddingBottom: 13,
    fontSize: 30,
    color: THEME.nameColor,
  };

  const affiliation: CSSProperties = {
    ...row(),
    paddingBottom: 10,
    fontSize: 13,
    color: THEME.subTextColor,
  };

  const tagline: CSSProperties = {
    ...row(),
    paddingBottom: 10,
    fontSize: 12,
    color: THEME.bodyColor,
  };

  const bullet: CSSProperties = {
    ...row({ gap: 14, paddingBottom: 9 }),
    fontSize: 12,
    color: THEME.bodyColor,
  };

  const marker = (color: string): CSSProperties => ({
    width: 9,
    height: 9,
    background: color,
    flex: 'none',
    marginBottom: 5,
  });

  const foldersRow: CSSProperties = {
    paddingTop: 56,
    paddingBottom: 72,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 64,
  };

  return (
    <div style={page}>
      <header className="enter-drop" style={header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={headerName}>{PROFILE.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <ContactBar links={PROFILE.links} color={THEME.iconColor} hoverColor={THEME.iconHoverColor} />
          <SoundToggle />
        </div>
      </header>

      <div style={sheet}>
        <div style={marginRule} />

        <div style={content}>
          <div style={blank} />

          <h1 className="enter-rise" style={{ ...name, ...enter(1) }}>
            <span style={stretch}>{PROFILE.name}</span>
          </h1>

          <div style={blank} />

          <p className="enter-rise" style={{ ...affiliation, ...enter(2) }}>
            <span style={stretch}>
              <span style={highlight}>{PROFILE.affiliation.label}</span>{' '}
              <span style={{ color: THEME.accentBlue, marginLeft: 10 }}>{PROFILE.affiliation.school}</span>
            </span>
          </p>

          <p className="enter-rise" style={{ ...tagline, ...enter(3) }}>
            <span style={stretch}>{PROFILE.tagline}</span>
          </p>

          <div style={blank} />

          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {PROFILE.bullets.map((b, i) => (
              <li key={b.text} className="enter-rise" style={{ ...bullet, ...enter(4 + i) }}>
                <span style={marker(b.color)} />
                <span style={b.highlight ? { ...highlight, ...stretch } : stretch}>{b.text}</span>
              </li>
            ))}
          </ul>

          <div style={foldersRow}>
            {FOLDERS.map((f, i) => (
              <div key={f.label} className="enter-pop" style={enter(8 + i)}>
                <PixelFolder
                  label={f.label}
                  palette={FOLDER_COLORS[f.color]}
                  labelColor={THEME.labelColor}
                  onClick={(rect) => navigate(f.route, {
                    zoom: 'in',
                    origin: rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined,
                  })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
