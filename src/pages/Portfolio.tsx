import { useEffect, useRef, useState, type CSSProperties } from 'react';
import ContactBar from '../components/ContactBar';
import SoundToggle from '../components/SoundToggle';
import VideoSlot from '../components/VideoSlot';
import ImageSlot from '../components/ImageSlot';
import { useTransitionNavigate } from '../components/PageTransition';
import { play } from '../lib/sound';
import { enter } from '../lib/motion';
import { PROFILE, THEME } from '../tokens';
import { PROJECTS } from '../data/portfolio';

const PIXEL = "'Press Start 2P', monospace";
const ACCENTS = ['#e8a72e', '#3f8fd6', '#5db84a'];
const stretch: CSSProperties = { display: 'inline-block', transform: 'scaleY(1.4)', transformOrigin: 'bottom' };
const RULES = 'repeating-linear-gradient(#ece4d3 0px,#ece4d3 39px,#cdb994 39px,#cdb994 40px)';

/** film rail geometry: the sprocketed strip that runs down the left margin */
const RAIL_LEFT = 44;
const RAIL_W = 28;
const CONTENT_PAD_LEFT = 132;
const MEDIA_H = 300;

/** ref callback: reserve the extra height a scaleY-stretched block needs so
    the content below it doesn't get overlapped */
function fit(k: number) {
  return (el: HTMLElement | null) => {
    if (!el) return;
    el.style.marginBottom = Math.ceil(el.offsetHeight * (k - 1)) + 'px';
  };
}

const tape = (side: 'left' | 'right', rot: number): CSSProperties => ({
  position: 'absolute',
  top: -11,
  [side]: 30,
  width: 74,
  height: 22,
  background: 'rgba(255,224,138,.72)',
  border: '1px solid rgba(201,180,143,.5)',
  transform: `rotate(${rot}deg)`,
  zIndex: 2,
});

export default function Portfolio() {
  const navigate = useTransitionNavigate();
  const frameRefs = useRef<(HTMLElement | null)[]>([]);
  const [shown, setShown] = useState<boolean[]>(() => PROJECTS.map(() => false));

  // scroll-triggered reveal: each frame rises in as the reel scrolls past it
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const i = Number((en.target as HTMLElement).dataset.frame);
          setShown((s) => (s[i] ? s : s.map((v, j) => (j === i ? true : v))));
          io.unobserve(en.target);
        }
      },
      { threshold: 0.18 },
    );
    frameRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goHome = () => { play('click'); navigate('/', { zoom: 'out' }); };

  const page: CSSProperties = { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ece4d3', fontFamily: PIXEL, WebkitFontSmoothing: 'none' };
  const header: CSSProperties = { position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', height: 58, background: '#e6dcc6', borderBottom: '2px solid #34302a', boxShadow: '0 2px 0 rgba(52,48,42,.12)' };
  const crumbMuted: CSSProperties = { ...stretch, fontSize: 11, letterSpacing: 1, color: '#857c6b', textTransform: 'uppercase', cursor: 'pointer' };
  const slash: CSSProperties = { ...stretch, fontSize: 11, color: '#c3b393' };
  const crumbActive: CSSProperties = { ...stretch, fontSize: 11, letterSpacing: 1, color: '#34302a', textTransform: 'uppercase', background: 'linear-gradient(#ffe08a,#ffe08a)', boxShadow: '0 0 0 2px #ffe08a' };

  const eyebrow: CSSProperties = { ...stretch, fontSize: 9, letterSpacing: 1, color: '#857c6b', textTransform: 'uppercase' };
  const yearTag: CSSProperties = { ...stretch, fontSize: 10, color: '#7a7060', padding: '6px 9px', border: '2px solid #cdb994', background: '#fffdf6' };
  const chip: CSSProperties = { display: 'inline-flex', alignItems: 'flex-end', padding: '8px 10px 7px', background: '#fffdf6', border: '2px solid #34302a', boxShadow: '2px 2px 0 rgba(52,48,42,.18)' };
  const btn = (bg: string, fg: string): CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '13px 17px', background: bg, border: '2px solid #34302a', color: fg, textDecoration: 'none', boxShadow: '3px 3px 0 rgba(52,48,42,.22)' });

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

      {/* SHEET */}
      <div style={{ flex: 1, position: 'relative', backgroundColor: '#ece4d3', backgroundImage: RULES }}>
        {/* film rail: dark strip with sprocket holes punched out of it */}
        <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, left: RAIL_LEFT, width: RAIL_W, background: '#34302a', display: 'flex', justifyContent: 'center', boxShadow: '2px 0 0 rgba(52,48,42,.15)' }}>
          <div style={{ width: 12, height: '100%', backgroundImage: 'repeating-linear-gradient(#ece4d3 0px,#ece4d3 12px,transparent 12px,transparent 32px)', backgroundPosition: '0 10px' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, padding: `0 72px 0 ${CONTENT_PAD_LEFT}px`, maxWidth: 1300 }}>
          {/* TITLE */}
          <div className="enter-rise" style={{ ...enter(1), paddingTop: 74, display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, ...stretch, transformOrigin: 'bottom left', fontSize: 26, color: '#34302a' }}>
              <span className="hl-anim" style={{ backgroundImage: 'linear-gradient(#ffe08a,#ffe08a)', padding: 2, margin: -2, animationDelay: '380ms' }}>projects</span>
            </h1>
          </div>

          {/* FRAMES */}
          <div style={{ paddingTop: 84, paddingBottom: 40 }}>
            {PROJECTS.map((d, i) => {
              const accent = ACCENTS[i % 3];
              const flip = i % 2 === 1;
              const demoOk = d.demo && d.demo !== '#';
              const ghOk = d.github && d.github !== '#';
              return (
                <article
                  key={d.title}
                  data-frame={i}
                  ref={(el) => { frameRefs.current[i] = el; }}
                  className={`reveal${shown[i] ? ' on' : ''}`}
                  style={{ position: 'relative', display: 'flex', flexDirection: flip ? 'row-reverse' : 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: '44px 60px', marginBottom: 110 }}
                >
                  {/* frame number, pinned to the rail */}
                  <div aria-hidden style={{ position: 'absolute', top: 4, left: RAIL_LEFT + RAIL_W / 2 - CONTENT_PAD_LEFT - 19, width: 38, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: accent, border: '2px solid #34302a', boxShadow: '2px 2px 0 rgba(52,48,42,.3)' }}>
                    <span style={{ ...stretch, fontSize: 10, color: '#fffdf6' }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>

                  {/* MEDIA: taped photo mat */}
                  <div style={{ flex: '1 1 460px', maxWidth: 560, position: 'relative', background: '#fffdf6', padding: '12px 12px 14px', border: '1px solid #e4d9bf', boxShadow: '0 13px 26px rgba(52,48,42,.2)', transform: `rotate(${flip ? 0.8 : -0.8}deg)` }}>
                    <div style={tape('left', -3)} />
                    <div style={tape('right', 2)} />
                    <div style={{ position: 'relative', width: '100%', height: MEDIA_H, background: '#ece4d3', overflow: 'hidden' }}>
                      {d.video ? (
                        <VideoSlot id={`proj-${i}-media`} src={d.video} placeholder="drop demo video" style={{ display: 'block', width: '100%', height: MEDIA_H }} />
                      ) : (
                        <ImageSlot id={`proj-${i}-media`} src={d.image} placeholder="drop cover" style={{ display: 'block', width: '100%', height: MEDIA_H }} />
                      )}
                    </div>
                  </div>

                  {/* TEXT */}
                  <div style={{ flex: '1 1 340px', minWidth: 300, paddingTop: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ width: 8, height: 8, background: accent }} />
                      <span style={eyebrow}>frame {String(i + 1).padStart(2, '0')}</span>
                      <span style={yearTag}>{d.year}</span>
                    </div>
                    <h2 style={{ margin: '24px 0 0', ...stretch, transformOrigin: 'bottom left', fontSize: 19, color: '#34302a' }}>{d.title}</h2>
                    <p ref={fit(1.32)} style={{ margin: '26px 0 0', maxWidth: '58ch', display: 'inline-block', transform: 'scaleY(1.32)', transformOrigin: 'top left', fontSize: 11, lineHeight: 2.36, color: '#4a443a' }}>
                      {d.description}
                    </p>
                    <div style={{ marginTop: 30, display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                      {d.stack.map((tech) => (
                        <span key={tech} style={chip}>
                          <span style={{ ...stretch, fontSize: 9, color: '#34302a' }}>{tech}</span>
                        </span>
                      ))}
                    </div>
                    {(demoOk || ghOk) && (
                      <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                        {demoOk && (
                          <a href={d.demo} target="_blank" rel="noopener" draggable={false} style={btn('#3f8fd6', '#fffdf6')} onMouseEnter={() => play('tick')}>
                            <div style={{ width: 0, height: 0, borderLeft: '10px solid #fffdf6', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' }} />
                            <span style={{ ...stretch, fontSize: 10 }}>live demo</span>
                          </a>
                        )}
                        {ghOk && (
                          <a href={d.github} target="_blank" rel="noopener" draggable={false} style={btn('#e6dcc6', '#34302a')} onMouseEnter={() => play('tick')}>
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.72-4.04-1.59-4.04-1.59-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.22 1.84 1.22 1.07 1.81 2.81 1.29 3.49.99.11-.77.42-1.29.76-1.59-2.67-.3-5.47-1.32-5.47-5.86 0-1.29.47-2.35 1.23-3.18-.12-.3-.53-1.51.12-3.15 0 0 1.01-.32 3.3 1.21.96-.26 1.98-.39 3-.4 1.02.01 2.04.14 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.65 1.64.24 2.85.12 3.15.77.83 1.23 1.89 1.23 3.18 0 4.55-2.81 5.56-5.49 5.85.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" /></svg>
                            <span style={{ ...stretch, fontSize: 10 }}>github</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

            {/* END OF REEL */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 26, paddingBottom: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, background: '#34302a' }} />
                <span style={eyebrow}>end of reel</span>
              </div>
              <button onClick={goHome} onMouseEnter={() => play('tick')} style={{ ...btn('#ffe08a', '#34302a'), cursor: 'pointer', fontFamily: PIXEL }}>
                <span style={{ ...stretch, fontSize: 10 }}>← back to the desk</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
