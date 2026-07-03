import TransitionLink from '@/components/TransitionLink'
import GrimoireBookShell from '@/components/GrimoireBookShell'

export default function GrimoirePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        position: 'relative',
        zIndex: 1,
        background: '#2b251f',
      }}
    >
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

      <TransitionLink href="/adventure" style={{ textDecoration: 'none' }}>
        <button className="back-btn">← Return</button>
      </TransitionLink>

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
        body { background: #2b251f; }
        .back-btn {
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
        .back-btn:hover {
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
        .back-btn:active { transform: translateX(-1px) scale(0.97); }
        .back-btn:focus-visible {
          outline: 2px solid var(--accent-frost);
          outline-offset: 6px;
        }
      `}</style>
    </main>
  )
}
