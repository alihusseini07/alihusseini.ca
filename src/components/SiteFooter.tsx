import { Link, useLocation } from 'react-router-dom';
import ContactBar from './ContactBar';
// import CursorTrail from './CursorTrail'; // disabled for now
import FooterSea from './FooterSea';
import { useTransitionNavigate } from './PageTransition';
import PixelName from './PixelName';
import SoundToggle from './SoundToggle';
import ThemeToggle from './ThemeToggle';
// import TrailToggle from './TrailToggle'; // disabled for now
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
    end slides the content sheet up and uncovers the footer beneath it.
    Kept a multiple of the sea's 3px pixel unit so the canvas maps 1:1. */
export const FOOTER_H = 342;

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
        // content hugs the top band; the sea + ship own the bottom of the
        // footer, so neither ever covers the name
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        minHeight: FOOTER_H,
        // extra top padding: the pixel-name canvas bleeds ~48px above its
        // layout box (warp + hover room) — without it the page sheet's edge
        // slices the top of the letters
        padding: '48px 44px 24px',
        background: THEME.headerBg,
        borderTop: `2px solid ${THEME.headerBorder}`,
        overflow: 'hidden',
      }}
    >
      {/* <CursorTrail /> disabled for now */}
      {/* the One Piece sea: interactive pixel ocean behind the content */}
      <FooterSea />
      {/* data-trail-block: the marker lifts off while hovering the name;
          zIndex 1 keeps the name above the sea canvas */}
      <span data-trail-block style={{ position: 'relative', zIndex: 1 }}>
        <PixelName lines={PROFILE.name.split(' ')} width={230} color={THEME.nameColor} squash={[0.62, 0.8]} radius={38} />
      </span>
      {/* page links on top, social/controls row tucked under (reverse of
          source order); the small downward nudge lines the pair up with the
          name's cap height */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end', gap: 18, transform: 'translateY(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ContactBar links={PROFILE.links} />
          {/* <TrailToggle /> disabled for now */}
          <ThemeToggle />
          <SoundToggle />
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {links.map((l, i) => (
          <span key={l.path} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {i > 0 && <span style={{ width: 4, height: 4, background: THEME.iconColor, opacity: 0.5 }} />}
            <Link
              to={l.path}
              onClick={(e) => {
                play('click');
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
      </div>
    </footer>
  );
}
