import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { buildSprites, type FolderPalette } from '../sprites';

export interface PixelFolderProps {
  label: string;
  palette: FolderPalette;
  labelColor?: string;
  onClick?: () => void;
}

function useBlip() {
  const acRef = useRef<AudioContext | null>(null);
  return () => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      if (!acRef.current) acRef.current = new Ctx();
      const ac = acRef.current;
      if (ac.state === 'suspended') void ac.resume();
      const now = ac.currentTime;
      [620, 930].forEach((f, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = 'square';
        o.frequency.value = f;
        const t = now + i * 0.075;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.1, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        o.connect(g).connect(ac.destination);
        o.start(t);
        o.stop(t + 0.08);
      });
    } catch { /* no-op */ }
  };
}

const PIXELATED: CSSProperties = { imageRendering: 'pixelated' };

export default function PixelFolder({ label, palette, labelColor = '#3b362d', onClick }: PixelFolderProps) {
  const [open, setOpen] = useState(false);
  const [pop, setPop] = useState(false);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blip = useBlip();

  const sprites = useMemo(
    () => buildSprites(palette),
    [palette.base, palette.light, palette.dark, palette.outline],
  );

  const handleClick = () => {
    blip();
    setPop(true);
    if (popTimer.current) clearTimeout(popTimer.current);
    popTimer.current = setTimeout(() => {
      setPop(false);
      onClick?.();
    }, 170);
  };

  const art: CSSProperties = {
    width: 182,
    height: 134,
    position: 'relative',
    cursor: 'pointer',
    perspective: 780,
    transform: `translateY(${open ? -16 : 0}px) scale(${pop ? 1.05 : 1})`,
    transition: 'transform .24s cubic-bezier(.2,.85,.3,1), filter .24s ease',
    filter: open
      ? 'drop-shadow(0 18px 14px rgba(0,0,0,.22))'
      : 'drop-shadow(0 7px 6px rgba(0,0,0,.15))',
  };

  const backStyle: CSSProperties = {
    ...PIXELATED, position: 'absolute', left: 0, top: 0, width: 182, height: 133, zIndex: 0,
  };

  const papersStyle: CSSProperties = {
    ...PIXELATED,
    position: 'absolute',
    left: 7,
    top: 28,
    width: 168,
    height: 105,
    zIndex: 1,
    transform: `translateY(${open ? -34 : 0}px)`,
    transition: 'transform .24s cubic-bezier(.2,.85,.3,1)',
  };

  const frontStyle: CSSProperties = {
    ...PIXELATED,
    position: 'absolute',
    left: 0,
    top: 28,
    width: 182,
    height: 105,
    zIndex: 2,
    transformOrigin: 'bottom center',
    transform: `rotateX(${open ? -42 : 0}deg)`,
    transition: 'transform .26s cubic-bezier(.2,.85,.3,1)',
  };

  const labelStyle: CSSProperties = {
    display: 'inline-block',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 13,
    letterSpacing: 0.5,
    color: labelColor,
    textAlign: 'center',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    transform: 'scaleY(1.4)',
    transformOrigin: 'bottom',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, userSelect: 'none' }}>
      <div
        style={art}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={handleClick}
      >
        <img src={sprites.back}   draggable={false} alt="" style={backStyle} />
        <img src={sprites.papers} draggable={false} alt="" style={papersStyle} />
        <img src={sprites.front}  draggable={false} alt="" style={frontStyle} />
      </div>
      <div style={labelStyle}>{label}</div>
    </div>
  );
}
