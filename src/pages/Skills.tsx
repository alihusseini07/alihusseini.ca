import { useTransitionNavigate } from '../components/PageTransition';
import GrimoireBookShell from '../components/grimoire/GrimoireBookShell';
import NoiseOverlay from '../components/grimoire/NoiseOverlay';

export default function Skills() {
  const navigate = useTransitionNavigate();

  return (
    <div
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
        background: '#2b251f',
        cursor: 'crosshair',
      }}
    >
      <NoiseOverlay />

      {/* Dark grit speckle — chunky pixel pits */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
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
          position: 'fixed',
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
          position: 'fixed',
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
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <button className="grimoire-back-btn" onClick={() => navigate('/', { warp: 'out' })}>
        ← Return
      </button>

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
        .grimoire-back-btn {
          position: fixed;
          top: 2rem;
          left: 2rem;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 400;
          color: #9ab8cc;
          background: linear-gradient(135deg, #2a3040, #1e2535);
          border: none;
          cursor: pointer;
          letter-spacing: 0.1em;
          padding: 0.45rem 1.1rem;
          box-shadow:
            inset 0 0 0 1px rgba(180,200,220,0.12),
            0 0 0 3px #3a4050,
            0 0 0 5px #1a1e28,
            0 0 0 8px #3a4050,
            0 0 0 10px #1a1e28,
            0 4px 12px rgba(0,0,0,0.5);
          transition:
            box-shadow 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
          z-index: 50;
        }
        .grimoire-back-btn:hover {
          color: #c8e0f0;
          box-shadow:
            inset 0 0 0 1px rgba(180,200,220,0.12),
            0 0 0 3px #3a4050,
            0 0 0 5px #1a1e28,
            0 0 0 8px #3a4050,
            0 0 0 10px #1a1e28,
            0 0 0 16px rgba(126,212,164,0.35),
            0 6px 18px rgba(0,0,0,0.6);
          transform: translateX(-2px);
        }
        .grimoire-back-btn:active { transform: translateX(-1px) scale(0.97); }
        .grimoire-back-btn:focus-visible {
          outline: 2px solid var(--accent-frost);
          outline-offset: 6px;
        }
      `}</style>
    </div>
  );
}
