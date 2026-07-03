import type { CSSProperties } from 'react';

const PIXEL = "'Press Start 2P', monospace";

export interface ImageSlotProps {
  id: string;
  placeholder?: string;
  /** image URL, committed as a repo asset */
  src?: string;
  style?: CSSProperties;
}

/** Static cover image. Set `src` in the data file to change it — no in-browser editing. */
export default function ImageSlot({ placeholder = 'No image set', src, style }: ImageSlotProps) {
  return (
    <div style={{ display: 'inline-block', position: 'relative', width: 240, height: 160, fontFamily: PIXEL, color: '#7a7060', ...style }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'rgba(52,48,42,.04)' }}>
        {src ? (
          <img src={src} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
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
