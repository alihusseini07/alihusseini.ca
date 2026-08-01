import { useState } from 'react';
import type { CSSProperties } from 'react';

const PIXEL = "'Press Start 2P', monospace";

export interface ImageSlotProps {
  id: string;
  placeholder?: string;
  /** image URL, committed as a repo asset */
  src?: string;
  style?: CSSProperties;
  /** reports the image's intrinsic aspect ratio (w/h) once it loads */
  onAspect?: (ratio: number) => void;
}

/** Static cover image. Set `src` in the data file to change it — no in-browser editing. */
export default function ImageSlot({ placeholder = 'No image set', src, style, onAspect }: ImageSlotProps) {
  const report = (el: HTMLImageElement | null) => {
    if (el?.naturalWidth && el.naturalHeight) onAspect?.(el.naturalWidth / el.naturalHeight);
  };
  // A cached image can finish before onLoad binds, so the ref callback also
  // checks .complete; until loaded we show a pixel spinner and fade the cover in.
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ display: 'inline-block', position: 'relative', width: 240, height: 160, fontFamily: PIXEL, color: '#7a7060', ...style }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'rgba(52,48,42,.04)' }}>
        {src ? (
          <>
            <img
              src={src}
              alt=""
              draggable={false}
              ref={(el) => { if (el?.complete) { setLoaded(true); report(el); } }}
              onLoad={(e) => { setLoaded(true); report(e.currentTarget); }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity .4s ease' }}
            />
            {!loaded && <span className="media-spin" aria-hidden />}
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center', padding: 10 }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            <span style={{ fontSize: 8, lineHeight: 1.6, transform: 'scaleY(1.35)' }}>{placeholder}</span>
          </div>
        )}
      </div>
    </div>
  );
}
