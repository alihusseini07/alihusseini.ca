import { Link, useLocation } from 'react-router-dom';
import ContactBar from './ContactBar';
import CursorTrail from './CursorTrail';
import { useTransitionNavigate } from './PageTransition';
import PixelName from './PixelName';
import SoundToggle from './SoundToggle';
import ThemeToggle from './ThemeToggle';
import TrailToggle from './TrailToggle';
import { play } from '../lib/sound';
import { useThemeCtx } from '../lib/theme';
import { PROFILE } from '../tokens';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About Me' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/skills', label: 'Skills' },
];

/** footer height; pages leave this much bottom margin so scrolling to the
    end slides the content sheet up and uncovers the footer beneath it */
export const FOOTER_H = 240;

/**
 * Site-wide footer, fixed behind the page (z 0). The page content sits above
 * it (z 1) with a matching bottom margin, so the footer stays hidden until
 * the visitor scrolls past the end — a curtain-reveal.
 */
export default function SiteFooter() {
  const { theme: THEME } = useThemeCtx();
  const location = useLocation();
  const goWarp = useTransitionNavigate();
  const links = NAV_LINKS.filter((l) => l.path !== location.pathname);
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: FOOTER_H,
        padding: '24px 44px',
        background: THEME.headerBg,
        borderTop: `2px solid ${THEME.headerBorder}`,
        overflow: 'hidden',
      }}
    >
      <CursorTrail />
      {/* data-trail-block: the marker lifts off while hovering the name */}
      <span data-trail-block style={{ display: 'contents' }}>
        <PixelName lines={PROFILE.name.split(' ')} width={230} color={THEME.nameColor} squash={[0.62, 0.8]} radius={38} />
      </span>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {links.map((l, i) => (
          <span key={l.path} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {i > 0 && <span style={{ width: 4, height: 4, background: THEME.iconColor, opacity: 0.5 }} />}
            <Link
              to={l.path}
              onClick={(e) => {
                if (l.path === '/skills') {
                  e.preventDefault();
                  const r = e.currentTarget.getBoundingClientRect();
                  goWarp('/skills', { warp: 'in', origin: { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
                  return;
                }
                play('navigate');
              }}
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: THEME.labelColor,
                textDecoration: 'none',
                paddingBottom: 3,
                borderBottom: '2px solid transparent',
                display: 'inline-block',
                transition: 'color .16s steps(2, end), border-color .16s steps(2, end), transform .16s steps(2, end)',
              }}
              onMouseEnter={(e) => {
                play('tick');
                e.currentTarget.style.color = THEME.nameColor;
                e.currentTarget.style.borderBottomColor = THEME.nameColor;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = THEME.labelColor;
                e.currentTarget.style.borderBottomColor = 'transparent';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {l.label}
            </Link>
          </span>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <ContactBar links={PROFILE.links} />
        <TrailToggle />
        <ThemeToggle />
        <SoundToggle />
      </div>
    </footer>
  );
}
