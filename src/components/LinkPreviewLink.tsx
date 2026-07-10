import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { play } from '../lib/sound';

type Props = {
  href: string;
  preview: string;
  caption?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** extra hover handlers, e.g. a card lift; run alongside the preview logic */
  onEnter?: (e: MouseEvent<HTMLAnchorElement>) => void;
  onLeave?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

const CARD_W = 190;

/**
 * Inline link that pops a polaroid-framed screenshot of the destination above
 * the cursor on hover, matching the pinned prints on the portfolio page. Plays
 * the same lens whir the portfolio polaroids use on first entry.
 */
export default function LinkPreviewLink({ href, preview, caption, className, style, children, onEnter, onLeave }: Props) {
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  // Decode the screenshot ahead of hover so the card renders at full height on
  // its first paint — otherwise height=0 places it below the cursor, then it
  // jumps up once the image loads.
  useEffect(() => {
    let live = true;
    const img = new Image();
    img.src = preview;
    img.decode?.().then(() => { if (live) setReady(true); }).catch(() => { if (live) setReady(true); });
    if (img.complete) setReady(true);
    return () => { live = false; };
  }, [preview]);

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={{ ...style, cursor: 'pointer' }}
        onMouseEnter={(e) => {
          // touch devices have no hover — skip the polaroid so a stray
          // synthetic mouseenter doesn't leave a floating card behind; the tap
          // just follows the link
          if (window.matchMedia('(hover: none)').matches) { onEnter?.(e); return; }
          play('lensWhir'); setPos({ x: e.clientX, y: e.clientY }); setHover(true); onEnter?.(e);
        }}
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={(e) => { setHover(false); onLeave?.(e); }}
      >
        {children}
      </a>

      {hover && ready && createPortal(
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            width: CARD_W,
            zIndex: 9999,
            pointerEvents: 'none',
            // polaroid print — same look as the portfolio media frames
            background: '#fffdf6',
            padding: '8px 8px 0',
            border: '2px solid #34302a',
            borderRadius: 3,
            boxShadow: '0 10px 20px rgba(0,0,0,.28), 3px 3px 0 rgba(0,0,0,.12)',
            transform: 'translate(-50%, calc(-100% - 20px)) rotate(-1.4deg)',
            animation: 'linkPreviewPop .16s steps(3, end)',
          }}
        >
          {/* pushpin holding the print */}
          <div
            style={{
              position: 'absolute', top: -8, left: '50%', marginLeft: -7, width: 14, height: 14,
              borderRadius: '50%', background: '#e8a72e', border: '2px solid #34302a',
              boxShadow: 'inset 3px 3px 0 rgba(255,255,255,.4), inset -3px -3px 0 rgba(0,0,0,.25), 0 3px 3px rgba(52,48,42,.3)',
            }}
          />
          {/* photo window — sizes to the screenshot's own aspect ratio */}
          <div style={{ position: 'relative', width: '100%', background: '#241f19', overflow: 'hidden' }}>
            <img src={preview} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
            {/* film gloss streak */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(115deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.16) 9%, transparent 9%, transparent 13%, rgba(255,255,255,.08) 13%, rgba(255,255,255,.08) 16%, transparent 16%)' }} />
          </div>
          {/* polaroid chin caption */}
          <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', transform: 'scaleY(1.4) rotate(-1deg)', fontFamily: "'Press Start 2P', monospace", fontSize: 7, letterSpacing: 1.2, color: '#57503f' }}>
              {caption ?? href}
            </span>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
