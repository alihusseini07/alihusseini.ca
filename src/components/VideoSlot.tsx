import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { getBlob, setBlob } from '../lib/mediaStore';

const PIXEL = "'Press Start 2P', monospace";

export interface VideoSlotProps {
  /** persistence key — a dropped video is stored under this id in IndexedDB */
  id: string;
  placeholder?: string;
  /** optional pre-set video URL (a committed asset); a drop overrides it */
  src?: string;
  style?: CSSProperties;
}

/**
 * Demo-video placeholder. Drop a video (or click to browse); it plays inline
 * as a silent looping preview with no controls. Click it to open a full-screen
 * pop-up with native controls (mute, pause, rewind, etc). The uploaded file
 * persists in IndexedDB, keyed by `id`.
 */
export default function VideoSlot({ id, placeholder = 'Drop a video', src, style }: VideoSlotProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);
  const [url, setUrl] = useState<string | null>(src ?? null);
  const [filled, setFilled] = useState(!!src);
  const [over, setOver] = useState(false);
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const depth = useRef(0);

  // lock the page while the pop-up is open — no scrolling or interacting behind it
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Restore a previously dropped video.
  useEffect(() => {
    let alive = true;
    getBlob(id).then((blob) => {
      if (!alive || !blob) return;
      const u = URL.createObjectURL(blob);
      urlRef.current = u;
      setUrl(u);
      setFilled(true);
    });
    return () => {
      alive = false;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [id]);

  const ingest = async (file: File) => {
    if (!file || !/^video\//.test(file.type)) return;
    await setBlob(id, file);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const u = URL.createObjectURL(file);
    urlRef.current = u;
    setUrl(u);
    setFilled(true);
  };

  const frame: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    background: '#ece4d3',
    outline: over ? '2px solid #34302a' : 'none',
    outlineOffset: -2,
  };

  return (
    <div
      style={{ display: 'inline-block', position: 'relative', width: 320, height: 200, fontFamily: PIXEL, color: '#7a7060', ...style }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); depth.current++; setOver(true); }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); if (--depth.current <= 0) { depth.current = 0; setOver(false); } }}
      onDrop={(e) => {
        e.preventDefault(); e.stopPropagation(); depth.current = 0; setOver(false);
        const f = e.dataTransfer?.files?.[0];
        if (f) void ingest(f);
      }}
    >
      <div style={frame}>
        {url ? (
          <video
            ref={videoRef}
            src={url}
            autoPlay
            loop
            muted
            playsInline
            draggable={false}
            onClick={() => setOpen(true)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#1c1a17', cursor: 'pointer' }}
          />
        ) : null}

        {/* expand icon — hover cue that clicking opens the pop-up */}
        {filled && hover && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(20,18,15,.28)', pointerEvents: 'none' }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(52,48,42,.75)', border: '2px solid #fffdf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fffdf6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </span>
          </div>
        )}

        {!url && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', padding: 12, cursor: 'pointer', background: 'none', border: 0, font: 'inherit', color: 'inherit' }}
          >
            <span style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(52,48,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 0, height: 0, borderLeft: '18px solid #fffdf6', borderTop: '12px solid transparent', borderBottom: '12px solid transparent', marginLeft: 5 }} />
            </span>
            <span style={{ fontSize: 9, lineHeight: 1.6, color: '#7a7060', transform: 'scaleY(1.35)' }}>{placeholder}</span>
            <span style={{ fontSize: 8, lineHeight: 1.6, color: '#a89c85', transform: 'scaleY(1.35)' }}>or <u>browse files</u></span>
          </button>
        )}

        {/* dashed ring + demo.mp4 tag only in the empty state */}
        {!filled && (
          <>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', border: `1.5px dashed ${over ? '#34302a' : 'rgba(52,48,42,.3)'}` }} />
            <div style={{ position: 'absolute', left: 8, bottom: 8, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,48,42,.82)', color: '#fffdf6', padding: '6px 9px', pointerEvents: 'none' }}>
              <span style={{ width: 0, height: 0, borderLeft: '7px solid #ffe08a', borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />
              <span style={{ fontSize: 7, letterSpacing: 0.5, transform: 'scaleY(1.35)', display: 'inline-block' }}>demo.mp4</span>
            </div>
          </>
        )}
      </div>

      <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void ingest(f); e.target.value = ''; }} />

      {open && url && createPortal(
        <div
          className="video-overlay"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(20,18,15,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}
        >
          <video
            src={url}
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 14, background: '#000', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}
          />
        </div>,
        document.body,
      )}
    </div>
  );
}
