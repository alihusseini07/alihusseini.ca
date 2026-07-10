import { useState } from 'react'
import PixelFolder from '../PixelFolder'
import { useTransitionNavigate } from '../PageTransition'
import { FOLDERS, FOLDER_COLORS } from '../../tokens'
import { play } from '../../lib/sound'

/**
 * Mobile nav for the grimoire page: a leather-and-gold burger (in place of
 * the desktop "← Return" tome button) opening the site's slide-in folder
 * drawer, re-bound in the book's own hide and gilt.
 */
export default function GrimoireNav() {
  const navigate = useTransitionNavigate()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        className="grimoire-burger"
        onClick={() => { play('click'); setOpen(true); }}
      >
        {[0, 1, 2].map((n) => (
          <span key={n} className="grimoire-burger-bar" />
        ))}
      </button>

      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,.6)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .2s ease',
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 'min(78vw, 300px)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            background:
              'radial-gradient(ellipse at 50% -10%, rgba(200,175,131,0.18), transparent 60%), linear-gradient(180deg, #3a2712 0%, #2b1c0c 55%, #201305 100%)',
            borderRight: '3px solid #1c1006',
            boxShadow:
              'inset -2px 0 0 #a88757, inset -4px 0 0 #241505, inset 0 0 40px rgba(0,0,0,0.5), 6px 0 24px rgba(0,0,0,.5)',
            transform: open ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform .24s cubic-bezier(.2,.85,.3,1)',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 10,
                letterSpacing: 1,
                color: '#c8af83',
                textTransform: 'uppercase',
                textShadow: '0 0 8px rgba(200,175,131,0.5)',
              }}
            >
              ✦ navigate
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => { play('click'); setOpen(false); }}
              style={{
                width: 30,
                height: 30,
                flex: 'none',
                background: 'radial-gradient(circle at 50% 30%, #4a3820, #241a0e)',
                border: '2px solid #14100a',
                boxShadow: 'inset 0 0 0 1px #6b4f2a, 2px 2px 0 rgba(20,12,4,0.5)',
                color: '#e8c88a',
                textShadow: '0 0 6px rgba(217,176,121,0.7)',
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          <button
            type="button"
            className="grimoire-home-btn"
            onClick={() => {
              setOpen(false)
              navigate('/', { warp: 'out' })
            }}
          >
            ⌂ Home
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            {FOLDERS.map((f) => (
              <PixelFolder
                key={f.label}
                label={f.label}
                palette={FOLDER_COLORS[f.color]}
                labelColor="#e8dfc8"
                onClick={(rect) => {
                  setOpen(false)
                  if (f.route === '/skills') return
                  navigate(f.route, {
                    zoom: 'in',
                    origin: rect
                      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
                      : undefined,
                  })
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .grimoire-burger {
          position: fixed;
          top: 1.25rem;
          left: 1.25rem;
          z-index: 50;
          width: 42px;
          height: 38px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
          gap: 5px;
          padding: 0 9px;
          background:
            radial-gradient(ellipse at 50% -20%, rgba(200,175,131,0.25), transparent 65%),
            linear-gradient(180deg, #4a2f14 0%, #33200e 55%, #241505 100%);
          border: 3px solid #1c1006;
          cursor: pointer;
          box-shadow:
            inset 0 0 0 2px #a88757,
            inset 0 0 0 3px #241505,
            inset 0 0 10px rgba(200,175,131,0.16),
            3px 4px 0 #14100a,
            0 8px 18px rgba(0,0,0,0.45);
          animation: tome-breathe 3.6s ease-in-out infinite;
          transition: box-shadow 0.25s ease, transform 0.15s ease, filter 0.25s ease;
        }
        .grimoire-burger-bar {
          display: block;
          height: 3px;
          background: #c8af83;
          box-shadow: 0 0 6px rgba(200,175,131,0.7);
        }
        .grimoire-burger:active {
          transform: translate(1px, 2px);
          box-shadow:
            inset 0 0 0 2px #a88757,
            inset 0 0 0 3px #241505,
            inset 0 0 10px rgba(200,175,131,0.2),
            1px 1px 0 #14100a,
            0 4px 10px rgba(0,0,0,0.4);
        }
        .grimoire-burger:focus-visible {
          outline: 2px solid #c8af83;
          outline-offset: 4px;
        }
        /* self-contained copy of the tome's breathing glow so the burger
           doesn't depend on the page's style block */
        @keyframes tome-breathe {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(200,175,131,0.16)); }
          50%      { filter: drop-shadow(0 0 12px rgba(200,175,131,0.34)); }
        }
        .grimoire-home-btn {
          font-family: var(--font-display);
          font-size: 0.55rem;
          color: #f0e4c8;
          background:
            radial-gradient(ellipse at 50% -20%, rgba(200,175,131,0.25), transparent 65%),
            linear-gradient(180deg, #4a2f14 0%, #33200e 55%, #241505 100%);
          border: 3px solid #1c1006;
          cursor: pointer;
          letter-spacing: 0.12em;
          padding: 0.7rem 1rem;
          text-shadow: 0 0 8px rgba(200,175,131,0.5), 0 2px 0 rgba(0,0,0,0.65);
          box-shadow:
            inset 0 0 0 2px #a88757,
            inset 0 0 0 3px #241505,
            inset 0 0 12px rgba(200,175,131,0.16),
            3px 4px 0 #14100a;
          transition: transform 0.15s ease, filter 0.2s ease;
        }
        .grimoire-home-btn:active {
          transform: translate(1px, 2px);
          filter: brightness(1.1);
        }
        .grimoire-home-btn:focus-visible {
          outline: 2px solid #c8af83;
          outline-offset: 4px;
        }
      `}</style>
    </>
  )
}
