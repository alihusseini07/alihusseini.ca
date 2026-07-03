import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import ContactBar from '../components/ContactBar';
import PixelFolder from '../components/PixelFolder';
import SoundToggle from '../components/SoundToggle';
import VideoSlot from '../components/VideoSlot';
import ImageSlot from '../components/ImageSlot';
import { useTransitionNavigate } from '../components/PageTransition';
import { play } from '../lib/sound';
import { enter, MODAL_CLOSE_MS, REDUCED } from '../lib/motion';
import { FOLDER_COLORS, PROFILE, THEME } from '../tokens';
import { PORTFOLIO, CATEGORY_META, type Category } from '../data/portfolio';

const PIXEL = "'Press Start 2P', monospace";
const ACCENTS = ['#e8a72e', '#3f8fd6', '#5db84a'];
const stretch: CSSProperties = { display: 'inline-block', transform: 'scaleY(1.4)', transformOrigin: 'bottom' };
const RULES = 'repeating-linear-gradient(#ece4d3 0px,#ece4d3 39px,#cdb994 39px,#cdb994 40px)';

type CardKey = 'media' | 'info' | 'desc' | 'links';
interface Pos { x: number; y: number; }

const START_POS: Record<CardKey, Pos> = {
  media: { x: 28, y: 30 },
  info: { x: 86, y: 378 },
  desc: { x: 560, y: 56 },
  links: { x: 250, y: 760 },
};
const START_Z: Record<CardKey, number> = { media: 1, desc: 2, info: 3, links: 4 };

/** ref callback: reserve the extra height a scaleY-stretched block needs so the note wraps it */
function fit(k: number, origin: 'top' | 'bottom') {
  return (el: HTMLElement | null) => {
    if (!el) return;
    const extra = Math.ceil(el.offsetHeight * (k - 1));
    el.style[origin === 'bottom' ? 'marginTop' : 'marginBottom'] = extra + 'px';
  };
}

export default function Portfolio() {
  const navigate = useTransitionNavigate();
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ key: CardKey; dx: number; dy: number } | null>(null);

  const [view, setView] = useState<'folder' | 'board'>('folder');
  const [popupFolder, setPopupFolder] = useState<Category>('projects');
  const [activeFolder, setActiveFolder] = useState<Category>('projects');
  const [selected, setSelected] = useState(0);
  const [zc, setZc] = useState(4);
  const [z, setZ] = useState<Record<CardKey, number>>(START_Z);
  const [pos, setPos] = useState<Record<CardKey, Pos>>(START_POS);
  const [dragKey, setDragKey] = useState<CardKey | null>(null);
  const [modalClosing, setModalClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMove = useCallback((e: MouseEvent) => {
    if (!drag.current || !boardRef.current) return;
    const b = boardRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - b.left - drag.current.dx);
    const y = Math.max(0, e.clientY - b.top - drag.current.dy);
    setPos((p) => ({ ...p, [drag.current!.key]: { x, y } }));
  }, []);

  useEffect(() => {
    // block browser default drop navigation (e.g. a stray native drag of an
    // unguarded media element would otherwise blank the whole tab)
    const block = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);

  const onUp = useCallback(() => {
    drag.current = null;
    setDragKey(null);
    play('drop');
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('blur', onUp);
  }, [onMove]);

  const startDrag = (key: CardKey) => (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest && t.closest('video,a,button,input')) return;
    e.preventDefault();
    if (!boardRef.current) return;
    const b = boardRef.current.getBoundingClientRect();
    const p = pos[key];
    drag.current = { key, dx: e.clientX - (b.left + p.x), dy: e.clientY - (b.top + p.y) };
    setDragKey(key);
    play('pickup');
    const nz = zc + 1;
    setZc(nz);
    setZ((prev) => ({ ...prev, [key]: nz }));
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    // if the button is released outside the window (e.g. a fast drag toward
    // a screen edge), no mouseup ever reaches us — end the drag on blur too
    window.addEventListener('blur', onUp);
  };

  const openModal = (folder: Category) => {
    play('whooshOpen');
    setPopupFolder(folder);
    setModalClosing(false);
    setView('folder');
  };

  const closeModal = (then?: () => void) => {
    if (modalClosing) return;
    play('whooshClose');
    if (REDUCED()) {
      setView('board');
      then?.();
      return;
    }
    setModalClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setModalClosing(false);
      setView('board');
      then?.();
    }, MODAL_CLOSE_MS);
  };

  const cardStyle = (key: CardKey, w: number | 'auto', rot: number): CSSProperties => {
    const lifted = dragKey === key;
    return {
      position: 'absolute',
      left: pos[key].x,
      top: pos[key].y,
      width: w,
      zIndex: z[key],
      transform: `rotate(${rot}deg) scale(${lifted ? 1.03 : 1})`,
      cursor: lifted ? 'grabbing' : 'grab',
      userSelect: 'none',
      filter: lifted ? 'drop-shadow(0 16px 18px rgba(52,48,42,.3))' : 'none',
      // positions (left/top) must never transition — drag stays instant
      transition: 'transform .12s steps(3, end), filter .15s ease',
    };
  };

  const popupOpen = view === 'folder';
  const pf = popupFolder;
  const plist = PORTFOLIO[pf];

  const af = activeFolder;
  const items = PORTFOLIO[af];
  const sel = Math.min(selected, items.length - 1);
  const d = items[sel];
  const isExp = af === 'experiences';
  const accent = ACCENTS[sel % 3];

  const goHome = () => { play('click'); navigate('/', { zoom: 'out' }); };

  const page: CSSProperties = { height: '100vh', display: 'flex', flexDirection: 'column', background: '#ece4d3', fontFamily: PIXEL, WebkitFontSmoothing: 'none', overflow: 'hidden' };
  const header: CSSProperties = { flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', height: 58, background: '#e6dcc6', borderBottom: '2px solid #34302a', boxShadow: '0 2px 0 rgba(52,48,42,.12)', zIndex: 30 };
  const crumbMuted: CSSProperties = { ...stretch, fontSize: 11, letterSpacing: 1, color: '#857c6b', textTransform: 'uppercase', cursor: 'pointer' };
  const slash: CSSProperties = { ...stretch, fontSize: 11, color: '#c3b393' };
  const crumbActive: CSSProperties = { ...stretch, fontSize: 11, letterSpacing: 1, color: '#34302a', textTransform: 'uppercase', background: 'linear-gradient(#ffe08a,#ffe08a)', boxShadow: '0 0 0 2px #ffe08a' };

  const tabBase: CSSProperties = { ...stretch, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' };
  const activeTab: CSSProperties = { ...tabBase, color: '#34302a', background: 'linear-gradient(#ffe08a,#ffe08a)', boxShadow: '0 0 0 2px #ffe08a' };
  const idleTab: CSSProperties = { ...tabBase, color: '#b0a488' };

  const yearTag: CSSProperties = { ...stretch, fontSize: 10, color: '#7a7060', padding: '6px 9px', border: '2px solid #cdb994', background: '#fffdf6' };

  const floaters = useMemo(() => ([
    { key: 'projects' as Category },
    { key: 'experiences' as Category },
  ]), []);

  return (
    <div style={page}>
      <header className="enter-drop" style={header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={crumbMuted} onClick={goHome}>{PROFILE.name}</span>
          <span style={slash}>/</span>
          <span style={crumbActive}>portfolio</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <ContactBar links={PROFILE.links} color={THEME.iconColor} hoverColor={THEME.iconHoverColor} />
          <SoundToggle />
        </div>
      </header>

      {/* BOARD */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'auto' }}>
        <div ref={boardRef} style={{ position: 'relative', minWidth: 760, minHeight: 960, height: '100%', backgroundColor: '#ece4d3', backgroundImage: RULES }}>
          <div style={{ position: 'absolute', top: 16, right: 20, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5, pointerEvents: 'none' }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#857c6b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></svg>
            <span style={{ ...stretch, fontSize: 8, letterSpacing: 0.5, color: '#857c6b', textTransform: 'uppercase' }}>drag to rearrange</span>
          </div>

          {/* MEDIA */}
          <div key={`media-${af}-${sel}`} onMouseDown={startDrag('media')} style={cardStyle('media', 500, -0.8)}>
            <div className="enter-pop" style={{ ...enter(0, 60), background: '#fffdf6', padding: '12px 12px 14px', border: '1px solid #e4d9bf', boxShadow: '0 13px 26px rgba(52,48,42,.2)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -11, left: 34, width: 78, height: 22, background: 'rgba(255,224,138,.72)', border: '1px solid rgba(201,180,143,.5)', transform: 'rotate(-3deg)' }} />
              <div style={{ position: 'absolute', top: -11, right: 34, width: 78, height: 22, background: 'rgba(255,224,138,.72)', border: '1px solid rgba(201,180,143,.5)', transform: 'rotate(2deg)' }} />
              <div style={{ position: 'relative', width: '100%', height: 300, background: '#ece4d3', overflow: 'hidden' }}>
                {d.video ? (
                  <VideoSlot id={`${af}-${sel}-main`} src={d.video} placeholder="drop demo video" style={{ display: 'block', width: '100%', height: 300 }} />
                ) : d.image ? (
                  <ImageSlot id={`${af}-${sel}-main-img`} src={d.image} style={{ display: 'block', width: '100%', height: 300 }} />
                ) : (
                  <VideoSlot id={`${af}-${sel}-main`} placeholder="drop demo video" style={{ display: 'block', width: '100%', height: 300 }} />
                )}
              </div>
            </div>
          </div>

          {/* INFO: title + stack */}
          <div key={`info-${af}-${sel}`} onMouseDown={startDrag('info')} style={cardStyle('info', 340, 1.4)}>
            <div className="enter-pop" style={{ ...enter(1, 60), background: '#fdf1b0', padding: '20px 22px 22px', boxShadow: '0 11px 22px rgba(52,48,42,.2)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: '50%', marginLeft: -42, width: 84, height: 22, background: 'rgba(255,253,246,.66)', border: '1px solid rgba(201,180,143,.5)', transform: 'rotate(-2deg)' }} />
              <h1 ref={fit(1.4, 'bottom')} style={{ margin: 0, ...stretch, transformOrigin: 'bottom left', fontSize: 19, color: '#34302a' }}>{d.title}</h1>
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' }}>
                <span style={yearTag}>{d.year}</span>
              </div>
              <div style={{ marginTop: 22, marginBottom: 12, display: 'flex', alignItems: 'flex-end', gap: 9 }}>
                <div style={{ width: 8, height: 8, background: '#34302a' }} />
                <span style={{ ...stretch, fontSize: 9, letterSpacing: 1, color: '#9a8c5a', textTransform: 'uppercase' }}>{isExp ? 'tools' : 'stack'}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                {d.stack.map((tech) => (
                  <span key={tech} style={{ display: 'inline-flex', alignItems: 'flex-end', padding: '8px 10px 7px', background: '#fffdf6', border: '2px solid #34302a', boxShadow: '2px 2px 0 rgba(52,48,42,.18)' }}>
                    <span style={{ ...stretch, fontSize: 9, color: '#34302a' }}>{tech}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div key={`desc-${af}-${sel}`} onMouseDown={startDrag('desc')} style={cardStyle('desc', 348, -1.1)}>
            <div className="enter-pop" style={{ ...enter(2, 60), background: '#fffdf6', backgroundImage: 'repeating-linear-gradient(#fffdf6 0px,#fffdf6 25px,#eee2c6 25px,#eee2c6 26px)', padding: '22px 24px 24px', border: '1px solid #e4d9bf', boxShadow: '0 11px 22px rgba(52,48,42,.2)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, right: 26, width: 82, height: 22, background: 'rgba(255,224,138,.72)', border: '1px solid rgba(201,180,143,.5)', transform: 'rotate(3deg)' }} />
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, background: accent }} />
                <span style={{ ...stretch, fontSize: 9, letterSpacing: 1, color: '#857c6b', textTransform: 'uppercase' }}>about</span>
              </div>
              <p ref={fit(1.32, 'top')} style={{ margin: 0, display: 'inline-block', transform: 'scaleY(1.32)', transformOrigin: 'top left', fontSize: 11, lineHeight: 2.36, color: '#4a443a' }}>{d.description}</p>
            </div>
          </div>

          {/* LINKS */}
          <div key={`links-${af}-${sel}`} onMouseDown={startDrag('links')} style={cardStyle('links', 'auto', 0.6)}>
            <div className="enter-pop" style={{ ...enter(3, 60), display: 'flex', flexWrap: 'wrap', gap: 14, padding: 8 }}>
              <a href={d.demo} target="_blank" rel="noopener" draggable={false} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '14px 18px', background: '#3f8fd6', border: '2px solid #34302a', color: '#fffdf6', textDecoration: 'none', boxShadow: '3px 3px 0 rgba(52,48,42,.25)' }}>
                <div style={{ width: 0, height: 0, borderLeft: '10px solid #fffdf6', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' }} />
                <span style={{ ...stretch, fontSize: 10 }}>{isExp ? 'read more' : 'live demo'}</span>
              </a>
              <a href={d.github} target="_blank" rel="noopener" draggable={false} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '14px 18px', background: '#e6dcc6', border: '2px solid #34302a', color: '#34302a', textDecoration: 'none', boxShadow: '3px 3px 0 rgba(52,48,42,.2)' }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.72-4.04-1.59-4.04-1.59-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.22 1.84 1.22 1.07 1.81 2.81 1.29 3.49.99.11-.77.42-1.29.76-1.59-2.67-.3-5.47-1.32-5.47-5.86 0-1.29.47-2.35 1.23-3.18-.12-.3-.53-1.51.12-3.15 0 0 1.01-.32 3.3 1.21.96-.26 1.98-.39 3-.4 1.02.01 2.04.14 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.65 1.64.24 2.85.12 3.15.77.83 1.23 1.89 1.23 3.18 0 4.55-2.81 5.56-5.49 5.85.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" /></svg>
                <span style={{ ...stretch, fontSize: 10 }}>github</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING FOLDERS */}
      <div className="enter-rise" style={{ animationDelay: '300ms', position: 'fixed', right: 30, bottom: 26, zIndex: 40, display: 'flex', alignItems: 'flex-end', gap: 26, padding: '18px 26px 14px', background: 'rgba(230,220,198,.86)', border: '2px solid #34302a', boxShadow: '0 10px 26px rgba(52,48,42,.28)' }}>
        <div style={{ position: 'absolute', top: -9, left: '50%', marginLeft: -30, width: 60, height: 18, background: 'rgba(255,224,138,.8)', border: '1px solid rgba(201,180,143,.6)', transform: 'rotate(-2deg)' }} />
        {floaters.map((f) => (
          <PixelFolder
            key={f.key}
            label={CATEGORY_META[f.key].label}
            palette={FOLDER_COLORS[CATEGORY_META[f.key].color]}
            labelColor={THEME.labelColor}
            width={108}
            onClick={() => openModal(f.key)}
          />
        ))}
      </div>

      {/* COVER POPUP */}
      {popupOpen && (
        <div onClick={() => closeModal()} className={modalClosing ? 'overlay-exit' : 'overlay-enter'} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(52,48,42,.44)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, pointerEvents: modalClosing ? 'none' : undefined }}>
          <div onClick={(e) => e.stopPropagation()} className={modalClosing ? 'modal-exit' : 'modal-enter'} style={{ width: 'min(920px,94vw)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', background: '#ece4d3', border: '2px solid #34302a', boxShadow: '0 22px 44px rgba(52,48,42,.4)' }}>
            <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 0 20px', height: 52, background: '#e6dcc6', borderBottom: '2px solid #34302a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={crumbMuted} onClick={goHome}>{PROFILE.name}</span>
                <span style={slash}>/</span>
                <span style={{ ...stretch, fontSize: 11, letterSpacing: 1, color: '#857c6b', textTransform: 'uppercase' }}>portfolio</span>
                <span style={slash}>/</span>
                <span onClick={() => { play('tab'); setPopupFolder('projects'); }} style={pf === 'projects' ? activeTab : idleTab}>projects</span>
                <span onClick={() => { play('tab'); setPopupFolder('experiences'); }} style={pf === 'experiences' ? activeTab : idleTab}>experiences</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ ...stretch, fontSize: 9, color: '#9a9080' }}>{String(plist.length).padStart(2, '0')}</span>
                <button onClick={() => closeModal()} aria-label="Close" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d99b96', border: '2px solid #34302a', boxShadow: '2px 2px 0 rgba(52,48,42,.25)', cursor: 'pointer', color: '#34302a', padding: 0 }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>
            </div>

            <div style={{ overflowY: 'auto', padding: 26, backgroundColor: '#ece4d3', backgroundImage: RULES }}>
              <div key={pf} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 26 }}>
                {plist.map((c, i) => (
                  <div
                    key={c.title}
                    onClick={() => { play('click'); closeModal(() => { setActiveFolder(pf); setSelected(i); }); }}
                    style={{ position: 'relative', cursor: 'pointer', transform: `rotate(${(i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.4)}deg)`, transition: 'transform .16s steps(3, end)' }}
                    onMouseEnter={(e) => { play('tick'); e.currentTarget.style.transform = 'translateY(-6px) rotate(0deg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${(i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.4)}deg)`; }}
                  >
                    <div style={{ position: 'absolute', top: -9, left: '50%', marginLeft: -26, width: 52, height: 17, background: 'rgba(255,224,138,.82)', border: '1px solid rgba(201,180,143,.6)', transform: 'rotate(-3deg)', zIndex: 2 }} />
                    <div className="enter-pop" style={{ ...enter(i, 40), background: '#fffdf6', padding: '9px 9px 12px', border: '1px solid #e4d9bf', boxShadow: '0 10px 20px rgba(52,48,42,.2)' }}>
                      <div style={{ position: 'relative', width: '100%', height: 132, background: '#ece4d3', overflow: 'hidden' }}>
                        <ImageSlot id={`cover-${pf}-${i}`} src={c.image} placeholder="drop cover" style={{ display: 'block', width: '100%', height: 132 }} />
                        <span style={{ position: 'absolute', top: 8, left: 8, ...stretch, transformOrigin: 'top left', fontSize: 9, color: '#fffdf6', background: ACCENTS[i % 3], padding: '4px 6px' }}>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <div style={{ marginTop: 11, padding: '0 2px' }}>
                        <span style={{ ...stretch, transformOrigin: 'bottom left', fontSize: 10, lineHeight: 1.5, color: '#34302a' }}>{c.title}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
