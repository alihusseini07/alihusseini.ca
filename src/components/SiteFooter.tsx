import { Link, useLocation } from 'react-router-dom';
import ContactBar from './ContactBar';
// import CursorTrail from './CursorTrail'; // disabled for now
import FooterSea from './FooterSea';
import { useTransitionNavigate } from './PageTransition';
import PixelName from './PixelName';
import SoundToggle from './SoundToggle';
import ThemeToggle from './ThemeToggle';
// import TrailToggle from './TrailToggle'; // disabled for now
import { CAN_HOVER } from '../lib/motion';
import { play } from '../lib/sound';
import { useThemeCtx } from '../lib/theme';
import { useIsMobile } from '../lib/useIsMobile';
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
  const { theme: THEME, mode } = useThemeCtx();
  const location = useLocation();
  const goWarp = useTransitionNavigate();
  const isMobile = useIsMobile();
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
        // footer, so neither ever covers the name. On phones the two clusters
        // stack and center instead of sitting on opposite edges.
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        justifyContent: isMobile ? 'flex-start' : 'space-between',
        gap: isMobile ? 64 : 0,
        // on mobile the footer takes the full viewport so the name, links and
        // sea all get room without overlapping (see matching 100svh page
        // margins). svh, not dvh: dvh re-resolves every time the browser UI
        // collapses mid-scroll, which resized the sea canvas each frame
        // (flashing ship) and let the reveal scroll run past the waterline.
        height: isMobile ? '100svh' : FOOTER_H,
        minHeight: isMobile ? '100svh' : FOOTER_H,
        // extra top padding: the pixel-name canvas bleeds ~48px above its
        // layout box (warp + hover room) — without it the page sheet's edge
        // slices the top of the letters
        padding: isMobile ? '40px 20px 24px' : '48px 44px 24px',
        background: THEME.headerBg,
        borderTop: `2px solid ${THEME.headerBorder}`,
        overflow: 'hidden',
      }}
    >
      {/* <CursorTrail /> disabled for now */}
      {/* nudge visitors toward the sea: sits just above the waterline, inked
          in the sea's backdrop blue (FooterSea SEA_PAL.back). Rendered before
          the canvas so the ship sails in front of it and covers it */}
      <span style={{ position: 'absolute', left: isMobile ? 20 : 44, bottom: 112, fontSize: 9, color: mode === 'dark' ? '#25578a' : '#2f6ba8' }}>
        {isMobile ? 'tap or drag the ship :)' : 'click or drag the ship :)'}
      </span>
      {/* the One Piece sea: interactive pixel ocean behind the content */}
      <FooterSea />
      {/* data-trail-block: the marker lifts off while hovering the name;
          zIndex 1 keeps the name above the sea canvas */}
      <span data-trail-block style={{ position: 'relative', zIndex: 1 }}>
        <PixelName lines={PROFILE.name.split(' ')} width={230} color={THEME.nameColor} squash={[0.62, 0.8]} radius={38} interactive={!isMobile} />
      </span>
      {/* page links on top, social/controls row tucked under (reverse of
          source order); the small downward nudge lines the pair up with the
          name's cap height */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column-reverse', alignItems: isMobile ? 'center' : 'flex-end', gap: 18, transform: isMobile ? 'none' : 'translateY(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ContactBar links={PROFILE.links} />
          {/* <TrailToggle /> disabled for now */}
          <ThemeToggle />
          <SoundToggle />
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
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
                if (!CAN_HOVER()) return; // tap fires mouseenter but never mouseleave
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
