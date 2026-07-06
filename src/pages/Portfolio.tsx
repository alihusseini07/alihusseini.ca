import { useEffect, useRef, useState, type CSSProperties } from 'react';
import ContactBar from '../components/ContactBar';
import SoundToggle from '../components/SoundToggle';
import ThemeToggle from '../components/ThemeToggle';
import PixelName from '../components/PixelName';
import VideoSlot from '../components/VideoSlot';
import ImageSlot from '../components/ImageSlot';
import { useTransitionNavigate } from '../components/PageTransition';
import { play } from '../lib/sound';
import { enter } from '../lib/motion';
import { useThemeCtx } from '../lib/theme';
import { PROFILE, softHl } from '../tokens';
import { PROJECTS } from '../data/portfolio';
import { TECH_ICONS } from '../data/tech-icons';

const PIXEL = "'Press Start 2P', monospace";
const stretch: CSSProperties = { display: 'inline-block', transform: 'scaleY(1.4)', transformOrigin: 'bottom' };

const MEDIA_H = 300;

/* ---- design board background: faint pixel dot grid over the page bg ---- */
const svgUrl = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const dotSvg = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><rect x="0" y="0" width="3" height="3" fill="${fill}"/></svg>`;

/* pinned-polaroid pushpin heads, one per frame */
const PINS = ['#d9564a', '#3f8fd6', '#5db84a', '#e8a72e'];

/* highlighter sweep behind each project title — cycles the 3 accent colors */
const TITLE_HL = ['#e8a72e', '#3f8fd6', '#5db84a'];

/* washi-tape tints for the stack chips */
const TAPES = ['rgba(255,224,138,.55)', 'rgba(143,199,240,.42)', 'rgba(166,224,122,.42)'];

/* ---- side doodles: big pen sketches in the board's outer margins --------
   each is a set of stroke paths; pathLength=1 + the .doodle-side CSS traces
   them on like a pen once the frame reveals */
const DOODLE_INK = '#9d8c6b';

const DOODLE_PATHS: Record<string, string[]> = {
  /* long arc curving up the margin, arrowhead aimed at the polaroid */
  pointArrow: [
    'M14 90 C 8 48, 28 20, 80 16',
    'M64 6 L80 16 L66 30',
  ],
  /* three 4-point sparkles, big to small — "this one's good" */
  sparkTrio: [
    'M32 12 L38 32 L58 38 L38 44 L32 64 L26 44 L6 38 L26 32 Z',
    'M72 26 L75 36 L85 39 L75 42 L72 52 L69 42 L59 39 L69 36 Z',
    'M62 66 L64 74 L72 76 L64 78 L62 86 L60 78 L52 76 L60 74 Z',
  ],
  /* hand-drawn exclamation mark — emphasis beside the title */
  bang: [
    'M50 10 C 45 32, 46 46, 50 60',
    'M50 74 a5 5 0 1 1 -0.1 0',
  ],
};

function SideDoodle({
  kind, style, size = 110, delay = 450,
  color = kind === 'sparkTrio' ? '#dcaa3a' : kind === 'bang' ? '#c9685c' : DOODLE_INK,
}: {
  kind: keyof typeof DOODLE_PATHS;
  style?: CSSProperties;
  size?: number;
  delay?: number;
  color?: string;
}) {
  return (
    <span className="doodle-wrap" aria-hidden style={{ position: 'absolute', pointerEvents: 'none', zIndex: 1, ...style }}>
      <svg className="doodle-side" width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ display: 'block' }}>
        {DOODLE_PATHS[kind].map((d, pi) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animationDelay: `${delay + pi * 220}ms` }}
          />
        ))}
      </svg>
    </span>
  );
}

/** ref callback: reserve the extra height a scaleY-stretched block needs so
    the content below it doesn't get overlapped */
function fit(k: number) {
  return (el: HTMLElement | null) => {
    if (!el) return;
    el.style.marginBottom = Math.ceil(el.offsetHeight * (k - 1)) + 'px';
  };
}

/** brand colors too pale to read on the light chip get darkened */
function legible(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum > 200) return `rgb(${Math.round(r * 0.62)}, ${Math.round(g * 0.62)}, ${Math.round(b * 0.62)})`;
  return hex;
}

function TechGlyph({ name }: { name: string }) {
  const ic = TECH_ICONS[name];
  if (!ic) return null;
  if (ic.kind === 'image') {
    return <img src={ic.src} alt="" draggable={false} style={{ width: 15, height: 15, objectFit: 'contain', flex: 'none' }} />;
  }
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill={legible(ic.color)} style={{ flex: 'none' }} aria-hidden>
      <path d={ic.path} />
    </svg>
  );
}

export default function Portfolio() {
  const navigate = useTransitionNavigate();
  const { theme: THEME, accent } = useThemeCtx();
  const frameRefs = useRef<(HTMLElement | null)[]>([]);
  const [shown, setShown] = useState<boolean[]>(() => PROJECTS.map(() => false));

  // scroll-triggered reveal: each frame slides in as it scrolls into view
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const i = Number((en.target as HTMLElement).dataset.frame);
          play('frameWhoosh'); // unobserved right after, so this fires once per frame
          setShown((s) => (s[i] ? s : s.map((v, j) => (j === i ? true : v))));
          io.unobserve(en.target);
        }
      },
      { threshold: 0.18 },
    );
    frameRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goHome = () => { play('shutter'); navigate('/', { zoom: 'out' }); };

  const page: CSSProperties = { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: THEME.pageBg, fontFamily: PIXEL, WebkitFontSmoothing: 'none' };
  const returnBtn: CSSProperties = { position: 'fixed', top: 20, left: 28, zIndex: 40, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 17px', background: THEME.highlight, color: THEME.highlightText, cursor: 'pointer', fontFamily: PIXEL, textDecoration: 'none' };
  const footer: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 240, padding: '24px 44px', background: THEME.headerBg, borderTop: `2px solid ${THEME.headerBorder}`, boxShadow: '0 -2px 0 rgba(0,0,0,.12)', overflow: 'hidden' };

  const eyebrow: CSSProperties = { ...stretch, fontSize: 9, letterSpacing: 1, color: THEME.iconColor, textTransform: 'uppercase' };
  const sticker = (bg: string, fg: string): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '13px 17px',
    background: bg,
    color: fg,
    textDecoration: 'none',
  });

  const polaroidRest = (i: number) => `rotate(${i % 2 ? 1.1 : -1.1}deg)`;

  return (
    <div style={page}>
      <button className="btn-sticker enter-drop" style={returnBtn} onClick={goHome} onMouseEnter={() => play('focusBeep')}>
        <span style={{ ...stretch, fontSize: 10 }}>← return</span>
      </button>

      <div className="enter-drop" style={{ position: 'fixed', top: 20, right: 28, zIndex: 40, display: 'flex', alignItems: 'center', gap: 22 }}>
        <ThemeToggle />
        <SoundToggle />
      </div>

      {/* DESIGN BOARD */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: THEME.pageBg, backgroundImage: svgUrl(dotSvg(THEME.dotGrid)) }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1240, margin: '0 auto', padding: '0 72px' }}>
          {/* TITLE */}
          <div className="enter-rise" style={{ ...enter(1), paddingTop: 128, display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, ...stretch, transformOrigin: 'bottom left', fontSize: 26, color: THEME.nameColor }}>
              <span className="hl-anim" style={{ backgroundImage: `linear-gradient(${softHl(THEME.highlight)},${softHl(THEME.highlight)})`, color: THEME.highlightText, padding: 2, margin: -2, animationDelay: '380ms' }}>featured projects</span>
            </h1>
          </div>

          {/* FRAMES */}
          <div style={{ paddingTop: 84, paddingBottom: 40 }}>
            {PROJECTS.map((d, i) => {
              const flip = i % 2 === 1;
              const demoOk = d.demo && d.demo !== '#';
              const ghOk = d.github && d.github !== '#';
              const hl = accent(TITLE_HL[i % TITLE_HL.length]);
              return (
                <article
                  key={d.title}
                  data-frame={i}
                  ref={(el) => { frameRefs.current[i] = el; }}
                  className={`reveal${shown[i] ? ' on' : ''}`}
                  style={{ position: 'relative', display: 'flex', flexDirection: flip ? 'row-reverse' : 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: '44px 60px', marginBottom: 120 }}
                >
                  {/* margin pen doodles, placed with intent: an arrow in the
                      media-side margin aims at the polaroid; emphasis marks sit
                      in the text-side margin at title height */}
                  <SideDoodle
                    kind="pointArrow"
                    size={118}
                    delay={520}
                    style={{ top: '6%', ...(flip ? { right: -106, transform: 'scaleX(-1) rotate(-6deg)' } : { left: -106, transform: 'rotate(-6deg)' }) }}
                  />
                  <SideDoodle
                    kind={i % 2 ? 'bang' : 'sparkTrio'}
                    size={92}
                    delay={880}
                    style={{ top: -10, ...(flip ? { left: -94, transform: 'rotate(-8deg)' } : { right: -94, transform: 'rotate(8deg)' }) }}
                  />

                  {/* MEDIA: pinned polaroid print */}
                  <div className={flip ? 'from-right' : 'from-left'} style={{ flex: '1 1 460px', maxWidth: 560 }}>
                    <div
                      style={{
                        position: 'relative',
                        // polaroid print stays its default white in every theme
                        background: '#fffdf6',
                        padding: '16px 16px 0',
                        border: '2px solid #34302a',
                        borderRadius: 3,
                        boxShadow: '0 12px 24px rgba(0,0,0,.22), 5px 5px 0 rgba(0,0,0,.12)',
                        transform: polaroidRest(i),
                        transition: 'transform .16s steps(3, end)',
                      }}
                      onMouseEnter={(ev) => { play('lensWhir'); ev.currentTarget.style.transform = 'translateY(-6px) rotate(0deg)'; }}
                      onMouseLeave={(ev) => { play('lensBack'); ev.currentTarget.style.transform = polaroidRest(i); }}
                    >
                      {/* pushpin holding the print to the board */}
                      <div aria-hidden style={{ position: 'absolute', top: -9, left: '50%', marginLeft: -8, width: 16, height: 16, borderRadius: '50%', background: accent(PINS[i % PINS.length]), border: '2px solid #34302a', boxShadow: 'inset 3px 3px 0 rgba(255,255,255,.4), inset -3px -3px 0 rgba(0,0,0,.25), 0 3px 3px rgba(52,48,42,.3)', zIndex: 3 }} />
                      {/* photo window: dark like undeveloped film until the media loads */}
                      <div style={{ position: 'relative', width: '100%', height: MEDIA_H, background: '#241f19', overflow: 'hidden' }}>
                        {d.video ? (
                          <VideoSlot id={`proj-${i}-media`} src={d.video} placeholder="drop demo video" style={{ display: 'block', width: '100%', height: MEDIA_H }} />
                        ) : (
                          <ImageSlot id={`proj-${i}-media`} src={d.image} placeholder="drop cover" style={{ display: 'block', width: '100%', height: MEDIA_H }} />
                        )}
                        {/* film gloss streak */}
                        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(115deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.16) 9%, transparent 9%, transparent 13%, rgba(255,255,255,.08) 13%, rgba(255,255,255,.08) 16%, transparent 16%)' }} />
                      </div>
                      {/* deep polaroid chin with a marker caption */}
                      <div style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ ...stretch, fontSize: 9, letterSpacing: 2, color: '#57503f', transform: 'scaleY(1.4) rotate(-1deg)' }}>{d.title.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* TEXT */}
                  <div className={flip ? 'from-left' : 'from-right'} style={{ flex: '1 1 340px', minWidth: 300, paddingTop: 6, animationDelay: '100ms' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, ...stretch, transformOrigin: 'bottom left', fontSize: 19, color: THEME.nameColor }}>
                        <span
                          className={shown[i] ? 'hl-anim' : undefined}
                          style={{
                            backgroundImage: `linear-gradient(${softHl(hl)},${softHl(hl)})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: shown[i] ? undefined : '0% 100%',
                            color: THEME.nameColor,
                            padding: 2,
                            margin: -2,
                            animationDelay: '240ms',
                          }}
                        >
                          {d.title}
                        </span>
                      </h2>
                    </div>
                    <p ref={fit(1.32)} style={{ margin: '26px 0 0', maxWidth: '58ch', display: 'inline-block', transform: 'scaleY(1.32)', transformOrigin: 'top left', fontSize: 11, lineHeight: 2.36, color: THEME.bodyColor }}>
                      {d.description}
                    </p>
                    {/* stack: washi-tape strips torn onto the board */}
                    <div style={{ marginTop: 30, display: 'flex', flexWrap: 'wrap', gap: '10px 8px' }}>
                      {d.stack.map((tech, ti) => (
                        <span
                          key={tech}
                          className="from-up chip-tape"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '9px 14px',
                            background: TAPES[ti % TAPES.length],
                            ['--tilt' as string]: `${ti % 2 ? 0.9 : -0.9}deg`,
                            animationDelay: `${200 + ti * 35}ms`,
                          }}
                        >
                          <TechGlyph name={tech} />
                          <span style={{ ...stretch, fontSize: 9, color: THEME.bodyColor }}>{tech}</span>
                        </span>
                      ))}
                    </div>
                    {(demoOk || ghOk) && (
                      <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                        {demoOk && (
                          <a href={d.demo} target="_blank" rel="noopener" draggable={false} className="btn-sticker" style={sticker(accent('#3f8fd6'), '#fffdf6')} onMouseEnter={() => play('focusBeep')} onClick={() => play('shutter')}>
                            <div style={{ width: 0, height: 0, borderLeft: '10px solid #fffdf6', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' }} />
                            <span style={{ ...stretch, fontSize: 10 }}>live demo</span>
                          </a>
                        )}
                        {ghOk && (
                          <a href={d.github} target="_blank" rel="noopener" draggable={false} className="btn-sticker" style={sticker(THEME.nameColor, THEME.pageBg)} onMouseEnter={() => play('focusBeep')} onClick={() => play('shutter')}>
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

            {/* END OF THE BOARD */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 26, paddingBottom: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, background: THEME.nameColor }} />
                <span style={eyebrow}>the end</span>
              </div>
              <button onClick={goHome} onMouseEnter={() => play('focusBeep')} className="btn-sticker" style={{ ...sticker(THEME.highlight, THEME.highlightText), cursor: 'pointer', fontFamily: PIXEL }}>
                <span style={{ ...stretch, fontSize: 10 }}>← return</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer style={footer}>
        <PixelName lines={PROFILE.name.split(' ')} width={230} color={THEME.nameColor} squash={[0.62, 0.8]} radius={38} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <ContactBar links={PROFILE.links} />
          <ThemeToggle />
          <SoundToggle />
        </div>
      </footer>
    </div>
  );
}
