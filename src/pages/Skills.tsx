import { useEffect, useRef } from 'react';
import { useTransitionNavigate } from '../components/PageTransition';
import GrimoireBookShell from '../components/grimoire/GrimoireBookShell';
import NoiseOverlay from '../components/grimoire/NoiseOverlay';
import SiteFooter, { FOOTER_H } from '../components/SiteFooter';
import SoundToggle from '../components/SoundToggle';
import { play } from '../lib/sound';

export default function Skills() {
  const navigate = useTransitionNavigate();

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
        '--font-display': "'Pixelify Sans', monospace",
        '--font-mono': "'VT323', monospace",
        '--accent-frost': '#7ed4a4',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        position: 'relative',
        zIndex: 1,
        // ride above the fixed footer; scrolling past the end uncovers it
        marginBottom: FOOTER_H,
        boxShadow: '0 18px 28px rgba(0,0,0,.45)',
        background: '#2b251f',
        // always a dark surface no matter the site theme, so hardcode the
        // light-ink pixel crosshair instead of inheriting the themed one
        cursor: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='23' height='23' shape-rendering='crispEdges'><g fill='%23f5f5f5'><rect x='11' y='1' width='1' height='21'/><rect x='1' y='11' width='21' height='1'/></g></svg>") 11 11, crosshair`,
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

      <button className="grimoire-back-btn" onClick={() => navigate('/', { warp: 'out' })}>
        ← Return
      </button>

      <div style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 50 }}>
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
        @keyframes scroll-left {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes scroll-right {
          from { transform: translate3d(-50%, 0, 0); }
          to   { transform: translate3d(0, 0, 0); }
        }
        /* bound like the grimoire itself: dark leather rim, antique gold
           fillet, then stacked parchment page-edge bands (the book's
           fore-edge palette: leather #33200E, gold #A88757, pages
           #B99C6D–#C8AF83), breathing a slow candle-gold aura */
        .grimoire-back-btn {
          position: fixed;
          top: 2rem;
          left: 2rem;
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 400;
          color: #f0e4c8;
          background:
            radial-gradient(ellipse at 50% -20%, rgba(200,175,131,0.25), transparent 65%),
            linear-gradient(180deg, #4a2f14 0%, #33200e 55%, #241505 100%);
          border: 3px solid #1c1006;
          cursor: pointer;
          letter-spacing: 0.12em;
          padding: 0.6rem 2.4rem;
          text-shadow: 0 0 8px rgba(200,175,131,0.5), 0 2px 0 rgba(0,0,0,0.65);
          box-shadow:
            inset 0 0 0 2px #a88757,
            inset 0 0 0 3px #241505,
            inset 0 0 0 5px #c5ab7f,
            inset 0 0 0 6px #b99c6d,
            inset 0 0 0 7px #9c7949,
            inset 0 0 16px rgba(200,175,131,0.16),
            3px 4px 0 #14100a,
            0 8px 18px rgba(0,0,0,0.45);
          animation: tome-breathe 3.6s ease-in-out infinite;
          transition:
            box-shadow 0.25s ease,
            color 0.2s ease,
            transform 0.15s ease,
            filter 0.25s ease;
          z-index: 50;
        }
        .grimoire-back-btn::before,
        .grimoire-back-btn::after {
          content: '✦';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.7rem;
          color: #c8af83;
          text-shadow: 0 0 6px rgba(200,175,131,0.9);
          animation: sigil-flicker 2.6s ease-in-out infinite;
          pointer-events: none;
        }
        .grimoire-back-btn::before { left: 0.85rem; }
        .grimoire-back-btn::after { right: 0.85rem; animation-delay: 1.3s; }
        .grimoire-back-btn:hover {
          color: #fff6dd;
          animation: none;
          filter: drop-shadow(0 0 14px rgba(217,186,131,0.45));
          box-shadow:
            inset 0 0 0 2px #c2a06a,
            inset 0 0 0 3px #241505,
            inset 0 0 0 5px #d2b98c,
            inset 0 0 0 6px #c5ab7f,
            inset 0 0 0 7px #a88757,
            inset 0 0 20px rgba(217,186,131,0.28),
            4px 5px 0 #14100a,
            0 8px 18px rgba(0,0,0,0.45);
          transform: translate(-1px, -1px);
        }
        .grimoire-back-btn:hover::before,
        .grimoire-back-btn:hover::after {
          color: #ffedc4;
          text-shadow: 0 0 10px rgba(255,230,170,1);
          animation: none;
        }
        .grimoire-back-btn:active {
          transform: translate(1px, 2px);
          box-shadow:
            inset 0 0 0 2px #a88757,
            inset 0 0 0 3px #241505,
            inset 0 0 0 5px #c5ab7f,
            inset 0 0 0 6px #b99c6d,
            inset 0 0 0 7px #9c7949,
            inset 0 0 16px rgba(200,175,131,0.2),
            1px 1px 0 #14100a,
            0 4px 10px rgba(0,0,0,0.4);
        }
        .grimoire-back-btn:focus-visible {
          outline: 2px solid #c8af83;
          outline-offset: 6px;
        }
        @keyframes tome-breathe {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(200,175,131,0.16)); }
          50%      { filter: drop-shadow(0 0 12px rgba(200,175,131,0.34)); }
        }
        @keyframes sigil-flicker {
          0%, 100% { opacity: 0.65; text-shadow: 0 0 4px rgba(200,175,131,0.6); }
          50%      { opacity: 1;    text-shadow: 0 0 9px rgba(200,175,131,1); }
        }
      `}</style>
    </div>

    <SiteFooter />
    </>
  );
}
