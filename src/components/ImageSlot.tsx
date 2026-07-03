import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { getBlob, setBlob, delBlob } from '../lib/mediaStore';

const PIXEL = "'Press Start 2P', monospace";

export interface ImageSlotProps {
  /** persistence key — a dropped image is stored under this id in IndexedDB */
  id: string;
  placeholder?: string;
  /** optional pre-set image URL (a committed asset); a drop overrides it */
  src?: string;
  style?: CSSProperties;
}

/**
 * Cover-image placeholder. Drop an image (or click to browse); it fills the
 * slot with object-fit: cover. The upload persists in IndexedDB keyed by `id`.
 * Replace / Remove appear on hover.
 */
export default function ImageSlot({ id, placeholder = 'Drop an image', src, style }: ImageSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);
  const [url, setUrl] = useState<string | null>(src ?? null);
  const [over, setOver] = useState(false);
  const [hover, setHover] = useState(false);
  const depth = useRef(0);

  useEffect(() => {
    let alive = true;
    getBlob(id).then((blob) => {
      if (!alive || !blob) return;
      const u = URL.createObjectURL(blob);
      urlRef.current = u;
      setUrl(u);
    });
    return () => {
      alive = false;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [id]);

  const ingest = async (file: File) => {
    if (!file || !/^image\//.test(file.type)) return;
    await setBlob(id, file);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const u = URL.createObjectURL(file);
    urlRef.current = u;
    setUrl(u);
  };

  const clear = async () => {
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    await delBlob(id);
    setUrl(src ?? null);
  };

  const filled = !!url;

  return (
    <div
      style={{ display: 'inline-block', position: 'relative', width: 240, height: 160, fontFamily: PIXEL, color: '#7a7060', ...style }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); depth.current++; setOver(true); }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); if (--depth.current <= 0) { depth.current = 0; setOver(false); } }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); depth.current = 0; setOver(false); const f = e.dataTransfer?.files?.[0]; if (f) void ingest(f); }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: over ? 'rgba(52,48,42,.08)' : 'rgba(52,48,42,.04)', outline: over ? '2px solid #34302a' : 'none', outlineOffset: -2 }}>
        {filled ? (
          <img src={url!} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center', padding: 10, cursor: 'pointer', background: 'none', border: 0, font: 'inherit', color: 'inherit' }}
          >
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            <span style={{ fontSize: 8, lineHeight: 1.6, transform: 'scaleY(1.35)' }}>{placeholder}</span>
            <span style={{ fontSize: 7, lineHeight: 1.6, color: '#a89c85', transform: 'scaleY(1.35)' }}>or <u>browse files</u></span>
          </button>
        )}
        {!filled && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', border: `1.5px dashed ${over ? '#34302a' : 'rgba(52,48,42,.28)'}` }} />
        )}
      </div>

      {filled && hover && (
        <div style={{ position: 'absolute', right: 6, top: 6, display: 'flex', gap: 6, zIndex: 2 }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} style={ctlBtn}>Replace</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); void clear(); }} style={ctlBtn}>Remove</button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void ingest(f); e.target.value = ''; }} />
    </div>
  );
}

const ctlBtn: CSSProperties = {
  border: '2px solid #34302a',
  background: '#e6dcc6',
  color: '#34302a',
  cursor: 'pointer',
  fontFamily: PIXEL,
  fontSize: 7,
  padding: '5px 7px',
  boxShadow: '2px 2px 0 rgba(52,48,42,.25)',
};
