import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { buildSprites, type FolderPalette } from '../sprites';
import { play } from '../lib/sound';

export interface PixelFolderProps {
  label: string;
  palette: FolderPalette;
  labelColor?: string;
  /** base art width in px (everything scales from 182) */
  width?: number;
  /** rect = folder art position at click time (for zoom-into-folder transitions) */
  onClick?: (rect?: DOMRect) => void;
}

const PIXELATED: CSSProperties = { imageRendering: 'pixelated' };

export default function PixelFolder({ label, palette, labelColor = '#3b362d', width = 182, onClick }: PixelFolderProps) {
  const [open, setOpen] = useState(false);
  const [pop, setPop] = useState(false);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const artRef = useRef<HTMLDivElement>(null);

  const sprites = useMemo(
    () => buildSprites(palette),
    [palette.base, palette.light, palette.dark, palette.outline],
  );

  const s = width / 182;
  const r = (n: number) => Math.round(n * s);

  const handleClick = () => {
    play('navigate');
    const rect = artRef.current?.getBoundingClientRect();
    setOpen(true);
    setPop(true);
    if (popTimer.current) clearTimeout(popTimer.current);
    popTimer.current = setTimeout(() => {
      setPop(false);
      onClick?.(rect);
    }, 170);
  };

  const art: CSSProperties = {
    width,
    height: r(134),
    position: 'relative',
    cursor: 'pointer',
    perspective: 780 * s,
    transform: `translateY(${open ? r(-16) : 0}px) scale(${pop ? 1.05 : 1})`,
    transition: 'transform .24s cubic-bezier(.2,.85,.3,1), filter .24s ease',
    filter: open
      ? `drop-shadow(0 ${r(18)}px ${r(14)}px rgba(0,0,0,.22))`
      : `drop-shadow(0 ${r(7)}px ${r(6)}px rgba(0,0,0,.15))`,
  };

  const backStyle: CSSProperties = { ...PIXELATED, position: 'absolute', left: 0, top: 0, width, height: r(133), zIndex: 0 };

  const papersStyle: CSSProperties = {
    ...PIXELATED, position: 'absolute', left: r(7), top: r(28), width: r(168), height: r(105), zIndex: 1,
    transform: `translateY(${open ? r(-34) : 0}px)`,
    clipPath: open ? 'inset(0 0 0 0)' : `inset(${r(16)}px 0 0 0)`,
    transition: 'transform .24s cubic-bezier(.2,.85,.3,1), clip-path .24s cubic-bezier(.2,.85,.3,1)',
  };

  const frontStyle: CSSProperties = {
    ...PIXELATED, position: 'absolute', left: 0, top: r(28), width, height: r(105), zIndex: 2,
    transformOrigin: 'bottom center', transform: `rotateX(${open ? -42 : 0}deg)`,
    transition: 'transform .26s cubic-bezier(.2,.85,.3,1)',
  };

  const labelStyle: CSSProperties = {
    display: 'inline-block',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: Math.max(9, r(13)),
    letterSpacing: 0.5,
    color: labelColor,
    textAlign: 'center',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    transform: 'scaleY(1.4)',
    transformOrigin: 'bottom',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Math.max(12, r(20)), userSelect: 'none' }}>
      <div ref={artRef} style={art} onMouseEnter={() => { play('tick'); setOpen(true); }} onMouseLeave={() => setOpen(false)} onClick={handleClick}>
        <img src={sprites.back} draggable={false} alt="" style={backStyle} />
        <img src={sprites.papers} draggable={false} alt="" style={papersStyle} />
        <img src={sprites.front} draggable={false} alt="" style={frontStyle} />
      </div>
      <div style={labelStyle}>{label}</div>
    </div>
  );
}
