import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { getBlob, setBlob, delBlob } from '../lib/mediaStore';

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
 * with NO native controls — autoplay on loop, muted by default, with a single
 * mute/unmute button that only appears on hover. Click the video to pause /
 * resume. The uploaded file persists in IndexedDB, keyed by `id`.
 */
export default function VideoSlot({ id, placeholder = 'Drop a video', src, style }: VideoSlotProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);
  const [url, setUrl] = useState<string | null>(src ?? null);
  const [filled, setFilled] = useState(!!src);
  const [muted, setMuted] = useState(true);
  const [over, setOver] = useState(false);
  const [hover, setHover] = useState(false);
  const depth = useRef(0);

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

  // React can't reliably set `muted` via prop — drive it on the element.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted, url]);

  const ingest = async (file: File) => {
    if (!file || !/^video\//.test(file.type)) return;
    await setBlob(id, file);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const u = URL.createObjectURL(file);
    urlRef.current = u;
    setMuted(true);
    setUrl(u);
    setFilled(true);
  };

  const clear = async () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    await delBlob(id);
    setUrl(src ?? null);
    setFilled(!!src);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
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
            playsInline
            draggable={false}
            onClick={togglePlay}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#1c1a17', cursor: 'pointer' }}
          />
        ) : (
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

      {/* controls (hover, when filled) */}
      {filled && hover && (
        <div style={{ position: 'absolute', right: 6, top: 6, display: 'flex', gap: 6, zIndex: 2 }}>
          <button type="button" onClick={() => inputRef.current?.click()} style={ctlBtn}>Replace</button>
          <button type="button" onClick={() => void clear()} style={ctlBtn}>Remove</button>
        </div>
      )}

      {/* mute / unmute — hover only */}
      {filled && hover && (
        <button
          type="button"
          aria-label="Toggle sound"
          title="Toggle sound"
          onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted); void v.play().catch(() => {}); } }}
          style={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: '2px solid #34302a', background: 'rgba(52,48,42,.82)', color: '#fffdf6', cursor: 'pointer', boxShadow: '2px 2px 0 rgba(52,48,42,.35)', zIndex: 3, padding: 0 }}
        >
          {muted ? (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></svg>
          ) : (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>
          )}
        </button>
      )}

      <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void ingest(f); e.target.value = ''; }} />
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
