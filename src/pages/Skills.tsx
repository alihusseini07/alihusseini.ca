import { useEffect, useRef } from 'react';
import GrimoireBookShell from '../components/grimoire/GrimoireBookShell';
import MobileNav from '../components/MobileNav';
import NoiseOverlay from '../components/grimoire/NoiseOverlay';
import SiteFooter, { FOOTER_H } from '../components/SiteFooter';
import SoundToggle from '../components/SoundToggle';
import { play } from '../lib/sound';
import { useIsMobile } from '../lib/useIsMobile';

export default function Skills() {
  const isMobile = useIsMobile();

  // the grimoire heaves open as the page materializes (once — StrictMode
  // double-mounts effects in dev)
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    play('bookOpen');
  }, []);

  return (
    <>
    <div
      className="skills-dim"
      style={{
        // @ts-expect-error -- CSS custom properties
        '--font-display': "'Press Start 2P', monospace",
        '--font-mono': "'Press Start 2P', monospace",
        '--accent-frost': '#7ed4a4',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // clear the fixed back / sound buttons on phones where the grimoire
        // content starts near the top instead of centered in a wide spread
        padding: isMobile ? '4.5rem 0.75rem 2.5rem' : '0.5rem',
        position: 'relative',
        zIndex: 1,
        // ride above the fixed footer; scrolling past the end uncovers it
        // (svh matches SiteFooter's mobile height)
        marginBottom: isMobile ? '100svh' : FOOTER_H,
        boxShadow: '0 18px 28px rgba(0,0,0,.45)',
        background: '#2b251f',
        // always a dark surface no matter the site theme, so hardcode the
        // light-ink pixel crosshair instead of inheriting the themed one
        cursor: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='23' height='23' shape-rendering='crispEdges'><g fill='%23f5f5f5'><rect x='10' y='3' width='2' height='17'/><rect x='3' y='10' width='17' height='2'/></g></svg>") 11 11, crosshair`,
      }}
    >
      <NoiseOverlay />

      {/* Dark grit speckle — chunky pixel pits */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='dk' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -1.4'/></filter><rect width='100%25' height='100%25' filter='url(%23dk)'/></svg>")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '320px 320px',
          imageRendering: 'pixelated',
          opacity: 0.5,
        }}
      />
      {/* Bright mineral fleck — chunky pixel highlights */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='lt' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='2' stitchTiles='stitch' seed='3'/><feColorMatrix values='0 0 0 0 0.95  0 0 0 0 0.88  0 0 0 0 0.74  4 0 0 0 -2.6'/></filter><rect width='100%25' height='100%25' filter='url(%23lt)'/></svg>")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '320px 320px',
          imageRendering: 'pixelated',
          opacity: 0.26,
        }}
      />
      {/* Slow weathering — chunky pixel blotches */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><filter id='vn' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='0.08' numOctaves='3' stitchTiles='stitch' seed='7'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -0.4'/></filter><rect width='100%25' height='100%25' filter='url(%23vn)'/></svg>")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '900px 900px',
          imageRendering: 'pixelated',
          opacity: 0.55,
        }}
      />
      {/* Vignette — darken edges to focus center */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <MobileNav currentRoute="/skills" variant="grimoire" fixed />

      <div style={{ position: 'fixed', top: isMobile ? '1.25rem' : '2rem', right: isMobile ? '1.25rem' : '2rem', zIndex: 50 }}>
        <SoundToggle />
      </div>

      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <GrimoireBookShell />
      </div>

      <style>{`
        @keyframes frost-pulse {
          0%, 100% { text-shadow: 0 0 8px  rgba(126, 212, 164, 0.6); }
          50%       { text-shadow: 0 0 20px rgba(126, 212, 164, 1), 0 0 35px rgba(126, 212, 164, 0.4); }
        }
        @keyframes frost-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>

    <SiteFooter />
    </>
  );
}
