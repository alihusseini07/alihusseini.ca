import { useState } from 'react';
import PixelFolder from './PixelFolder';
import { useTransitionNavigate } from './PageTransition';
import { FOLDERS, FOLDER_COLORS } from '../tokens';
import { useThemeCtx } from '../lib/theme';
import { play } from '../lib/sound';

interface MobileNavProps {
  /** route of the page hosting the nav — its folder is hidden in the drawer */
  currentRoute: string;
  /** 'grimoire' = leather-and-gold tome skin; 'board' = themed notebook skin */
  variant: 'grimoire' | 'board';
  /** true = burger fixed to the viewport's top-left; false = in-flow */
  fixed?: boolean;
  /**
   * entrance-animation class for the burger button only. Never wrap MobileNav
   * itself in an animated element: a filling transform animation turns the
   * wrapper into the containing block for the drawer's position:fixed overlay,
   * trapping it inside the header (see PageFrame in PageTransition.tsx).
   */
  burgerClassName?: string;
}

/**
 * Mobile burger + slide-in folder drawer shared by the inner pages. The
 * drawer lists a purple Home folder plus every site folder except the page
 * you're already on.
 */
export default function MobileNav({ currentRoute, variant, fixed = false, burgerClassName }: MobileNavProps) {
  const navigate = useTransitionNavigate();
  const { theme: THEME, folders, mode } = useThemeCtx();
  const [open, setOpen] = useState(false);

  const grim = variant === 'grimoire';
  const palettes = grim ? FOLDER_COLORS : folders;
  const labelColor = grim ? '#e8dfc8' : THEME.labelColor;
  const destinations = FOLDERS.filter((f) => f.route !== currentRoute);

  const goHome = () => {
    setOpen(false);
    // skills lives in the warp dimension; everything else slides across the desk
    navigate('/', currentRoute === '/skills' ? { warp: 'out' } : undefined);
  };

  const burger = grim ? (
    <button
      type="button"
      aria-label="Open menu"
      aria-expanded={open}
      className={burgerClassName ? `grimoire-burger ${burgerClassName}` : 'grimoire-burger'}
      style={fixed ? undefined : { position: 'static' }}
      onClick={() => { play('click'); setOpen(true); }}
    >
      {[0, 1, 2].map((n) => (
        <span key={n} className="grimoire-burger-bar" />
      ))}
    </button>
  ) : (
    <button
      type="button"
      aria-label="Open menu"
      aria-expanded={open}
      className={burgerClassName}
      onClick={() => { play('click'); setOpen(true); }}
      style={{
        flex: 'none',
        width: 34,
        height: 30,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 5,
        padding: '0 6px',
        background: THEME.headerBg,
        border: `2px solid ${THEME.headerBorder}`,
        boxShadow: `2px 2px 0 ${mode === 'dark' ? 'rgba(0,0,0,.4)' : 'rgba(52,48,42,.25)'}`,
        cursor: 'pointer',
        ...(fixed ? { position: 'fixed' as const, top: '1.25rem', left: '1.25rem', zIndex: 50 } : null),
      }}
    >
      {[0, 1, 2].map((n) => (
        <span key={n} style={{ display: 'block', height: 3, background: THEME.nameColor }} />
      ))}
    </button>
  );

  return (
    <>
      {burger}

      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: grim ? 'rgba(0,0,0,.6)' : 'rgba(0,0,0,.5)',
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
            transform: open ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform .24s cubic-bezier(.2,.85,.3,1)',
            overflowY: 'auto',
            ...(grim
              ? {
                  background:
                    'radial-gradient(ellipse at 50% -10%, rgba(200,175,131,0.18), transparent 60%), linear-gradient(180deg, #3a2712 0%, #2b1c0c 55%, #201305 100%)',
                  borderRight: '3px solid #1c1006',
                  boxShadow:
                    'inset -2px 0 0 #a88757, inset -4px 0 0 #241505, inset 0 0 40px rgba(0,0,0,0.5), 6px 0 24px rgba(0,0,0,.5)',
                }
              : {
                  background: THEME.pageBg,
                  borderRight: `2px solid ${THEME.headerBorder}`,
                  boxShadow: '6px 0 24px rgba(0,0,0,.35)',
                }),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={
                grim
                  ? {
                      fontFamily: 'var(--font-display)',
                      fontSize: 10,
                      letterSpacing: 1,
                      color: '#c8af83',
                      textTransform: 'uppercase',
                      textShadow: '0 0 8px rgba(200,175,131,0.5)',
                    }
                  : {
                      display: 'inline-block',
                      transform: 'scaleY(1.4)',
                      transformOrigin: 'bottom',
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 10,
                      letterSpacing: 1,
                      color: THEME.subTextColor,
                      textTransform: 'uppercase',
                    }
              }
            >
              {grim ? '✦ navigate' : 'navigate'}
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => { play('click'); setOpen(false); }}
              style={
                grim
                  ? {
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
                    }
                  : {
                      width: 30,
                      height: 30,
                      flex: 'none',
                      background: THEME.headerBg,
                      border: `2px solid ${THEME.headerBorder}`,
                      color: THEME.nameColor,
                      fontSize: 14,
                      lineHeight: 1,
                      cursor: 'pointer',
                    }
              }
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <PixelFolder
              label="Home"
              palette={palettes.purple}
              labelColor={labelColor}
              onClick={goHome}
            />
            {destinations.map((f) => (
              <PixelFolder
                key={f.label}
                label={f.label}
                palette={palettes[f.color]}
                labelColor={labelColor}
                onClick={(rect) => {
                  setOpen(false);
                  // skills folder tears open a new dimension; the rest slide across the desk
                  navigate(f.route, f.route === '/skills'
                    ? {
                        warp: 'in',
                        origin: rect
                          ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
                          : undefined,
                      }
                    : undefined);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {grim && (
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
        `}</style>
      )}
    </>
  );
}
