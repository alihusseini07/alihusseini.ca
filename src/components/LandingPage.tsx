import { type CSSProperties } from 'react';
import PixelFolder from './PixelFolder';
import PixelName from './PixelName';
import ContactBar from './ContactBar';
// import CursorTrail from './CursorTrail'; // disabled for now
import CyclingTagline from './CyclingTagline';
import LinkPreviewLink from './LinkPreviewLink';
import SoundToggle from './SoundToggle';
import ThemeToggle from './ThemeToggle';
// import TrailToggle from './TrailToggle'; // disabled for now
import SiteFooter, { FOOTER_H } from './SiteFooter';
import { useTransitionNavigate } from './PageTransition';
import { play } from '../lib/sound';
import { enter } from '../lib/motion';
import { useThemeCtx } from '../lib/theme';
import { EXPERIENCE, FOLDERS, PROFILE, softHl } from '../tokens';

/** ruled-paper line spacing, in px */
const RULE = 40;

/** vertically stretched pixel-font glyphs */
const stretch: CSSProperties = {
  display: 'inline-block',
  transform: 'scaleY(1.4)',
  transformOrigin: 'bottom',
};

const PIXEL = "'Press Start 2P', monospace";

export default function LandingPage() {
  const navigate = useTransitionNavigate();
  const { theme: THEME, accent, folders, mode } = useThemeCtx();

  /** yellow highlighter marker; pair with .hl-anim to sweep it in */
  const highlight: CSSProperties = {
    backgroundImage: `linear-gradient(${softHl(THEME.highlight)}, ${softHl(THEME.highlight)})`,
    color: THEME.highlightText,
    padding: 2,
    margin: -2,
  };

  const page: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: THEME.pageBg,
    fontFamily: PIXEL,
    WebkitFontSmoothing: 'none',
  };

  // pinned to the page's top-right corner, scrolls away with the content
  const floatCluster: CSSProperties = {
    position: 'absolute',
    top: 20,
    right: 28,
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  // sheet rides above the fixed footer (z 1 vs 0) and leaves its height in
  // bottom margin, so scrolling past the end uncovers the footer
  const sheet: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    minHeight: '100vh',
    marginBottom: FOOTER_H,
    boxShadow: '0 18px 28px rgba(0,0,0,.3)',
    backgroundColor: THEME.pageBg,
    backgroundImage: `repeating-linear-gradient(${THEME.pageBg} 0px, ${THEME.pageBg} ${RULE - 1}px, ${THEME.ruleColor} ${RULE - 1}px, ${THEME.ruleColor} ${RULE}px)`,
  };

  const marginRule: CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 104,
    width: 2,
    background: THEME.marginColor,
  };

  const content: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    padding: '0 72px 0 140px',
    display: 'flex',
    flexDirection: 'column',
  };

  const blank: CSSProperties = { height: RULE };

  const row = (extra: CSSProperties = {}): CSSProperties => ({
    margin: 0,
    height: RULE,
    display: 'flex',
    alignItems: 'flex-end',
    lineHeight: 1,
    fontFamily: PIXEL,
    whiteSpace: 'nowrap',
    ...extra,
  });

  const name: CSSProperties = {
    ...row(),
    height: 'auto',
    color: THEME.nameColor,
  };

  const affiliation: CSSProperties = {
    ...row(),
    paddingBottom: 10,
    fontSize: 13,
    color: THEME.subTextColor,
  };

  const tagline: CSSProperties = {
    ...row(),
    paddingBottom: 10,
    fontSize: 12,
    color: THEME.bodyColor,
  };

  const bullet: CSSProperties = {
    ...row({ gap: 14, paddingBottom: 9 }),
    fontSize: 12,
    color: THEME.bodyColor,
  };

  const marker = (color: string): CSSProperties => ({
    width: 9,
    height: 9,
    background: color,
    flex: 'none',
    marginBottom: 5,
  });

  /** translucent tape strip pinning a card's top corners */
  const tape = (side: 'left' | 'right', rot: number): CSSProperties => ({
    position: 'absolute',
    top: -11,
    [side]: 26,
    width: 68,
    height: 22,
    background: 'rgba(255,224,138,.72)',
    border: '1px solid rgba(201,180,143,.5)',
    transform: `rotate(${rot}deg)`,
    zIndex: 2,
  });

  const cardRest = (i: number) => `rotate(${i % 2 ? 1 : -1.2}deg)`;

  return (
    <div style={page}>
      <div className="enter-drop" style={floatCluster}>
        <ContactBar links={PROFILE.links} />
        {/* <TrailToggle /> disabled for now */}
        <ThemeToggle />
        <SoundToggle />
      </div>

      <div style={sheet}>
        {/* highlighter ink: z:-1 keeps it above the ruled paper but under
            everything in-flow, and it scrolls with the sheet */}
        {/* <CursorTrail /> disabled for now */}
        <div style={marginRule} />

        <div style={content}>
          <div style={blank} />

          <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', columnGap: 72, rowGap: 40 }}>
            <div style={{ flex: '1 1 480px', minWidth: 320 }}>
              <h1 className="enter-rise" style={{ ...name, ...enter(1) }}>
                {/* data-trail-block: the marker lifts off while hovering the name */}
                <span data-trail-block style={{ display: 'contents' }}>
                  <PixelName lines={PROFILE.name.split(' ')} width={350} color={THEME.nameColor} squash={[0.62, 0.8]} snap={RULE} />
                </span>
              </h1>

              <div style={blank} />
              <div style={blank} />

              <p className="enter-rise" style={{ ...affiliation, ...enter(2) }}>
                <span style={stretch}>
                  <LinkPreviewLink
                    href={PROFILE.affiliation.link}
                    preview={PROFILE.affiliation.preview}
                    caption={PROFILE.affiliation.previewCaption}
                    className="hl-anim"
                    style={{ ...highlight, animationDelay: '420ms', textDecoration: 'none' }}
                  >
                    {PROFILE.affiliation.label}
                  </LinkPreviewLink>{' '}
                  <span style={{ color: THEME.accentBlue, marginLeft: 10 }}>{PROFILE.affiliation.school}</span>
                </span>
              </p>

              <p className="enter-rise" style={{ ...tagline, ...enter(3) }}>
                <CyclingTagline lines={PROFILE.taglines} style={stretch} />
              </p>

              <div style={blank} />

              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {PROFILE.bullets.map((b, i) => {
                  const parts = b.highlightPart ? b.text.split(b.highlightPart) : null;
                  // custom-color bullets: soften in light mode, keep full strength in dark
                  const hlInk = b.highlightColor
                    ? (mode === 'light'
                        ? `color-mix(in srgb, ${b.highlightColor} 52%, transparent)`
                        : softHl(b.highlightColor))
                    : null;
                  const hlStyle = hlInk
                    ? { ...highlight, backgroundImage: `linear-gradient(${hlInk}, ${hlInk})` }
                    : highlight;
                  return (
                    <li key={b.text} className="enter-rise" style={{ ...bullet, ...enter(4 + i) }}>
                      <span style={marker(b.color === '#34302a' ? THEME.nameColor : accent(b.color))} />
                      {parts ? (
                        <span style={stretch}>
                          {parts[0]}
                          {b.link && b.preview ? (
                            <LinkPreviewLink
                              href={b.link}
                              preview={b.preview}
                              caption={b.previewCaption}
                              className="hl-anim"
                              style={{ ...highlight, animationDelay: `${(4 + i) * 70 + 320}ms`, textDecoration: 'none' }}
                            >
                              {b.highlightPart}
                            </LinkPreviewLink>
                          ) : (
                            <span className="hl-anim" style={{ ...hlStyle, animationDelay: `${(4 + i) * 70 + 320}ms` }}>
                              {b.highlightPart}
                            </span>
                          )}
                          {parts[1]}
                        </span>
                      ) : (
                        <span
                          className={b.highlight ? 'hl-anim' : undefined}
                          style={b.highlight ? { ...highlight, ...stretch, animationDelay: `${(4 + i) * 70 + 320}ms` } : stretch}
                        >
                          {b.text}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 80 }}>
              {FOLDERS.map((f, i) => (
                <div key={f.label} className="enter-pop" style={enter(8 + i)}>
                  <PixelFolder
                    label={f.label}
                    palette={folders[f.color]}
                    labelColor={THEME.labelColor}
                    onClick={(rect) => navigate(f.route, {
                      // skills folder tears open a new dimension; the rest zoom in
                      ...(f.route === '/skills' ? { warp: 'in' as const } : { zoom: 'in' as const }),
                      origin: rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined,
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* EXPERIENCE: index cards side by side, right above the folders */}
          <div style={{ paddingTop: 8, paddingBottom: 72, marginTop: -40 + RULE }}>
            <div className="enter-rise" style={{ ...enter(5), display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
              <span style={{ width: 8, height: 8, background: THEME.nameColor, flex: 'none' }} />
              <span style={{ ...stretch, fontSize: 9, letterSpacing: 1, color: THEME.subTextColor, textTransform: 'uppercase' }}>my experience</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40 }}>
              {EXPERIENCE.map((e, i) => {
                const cardStyle: CSSProperties = {
                  ...enter(6 + i),
                  display: 'block',
                  position: 'relative',
                  width: 320,
                  maxWidth: '100%',
                  background: THEME.cardBg,
                  border: `1px solid ${THEME.cardBorder}`,
                  boxShadow: '0 10px 20px rgba(0,0,0,.18)',
                  padding: '22px 20px 18px',
                  transform: cardRest(i),
                  transition: 'transform .16s steps(3, end), box-shadow .16s steps(3, end)',
                  color: 'inherit',
                  textDecoration: 'none',
                };
                const lift = (el: HTMLElement) => {
                  el.style.transform = 'translateY(-8px) scale(1.03) rotate(0deg)';
                  el.style.boxShadow = '0 18px 28px rgba(0,0,0,.28)';
                };
                const rest = (el: HTMLElement) => {
                  el.style.transform = cardRest(i);
                  el.style.boxShadow = '0 10px 20px rgba(0,0,0,.18)';
                };
                const inner = (
                  <>
                    <div style={tape('left', -3)} />
                    <div style={tape('right', 2)} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ flex: 'none', width: 48, height: 48, background: THEME.cardBg, border: `2px solid ${THEME.headerBorder}`, boxShadow: '2px 2px 0 rgba(52,48,42,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={e.logo} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3, boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ ...stretch, transformOrigin: 'bottom left', fontSize: 11, lineHeight: 1.7, color: THEME.nameColor }}>{e.company}</div>
                        <div style={{ marginTop: 8, ...stretch, transformOrigin: 'top left', fontSize: 9, lineHeight: 1.6, color: THEME.subTextColor }}>{e.role}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 7, height: 7, background: accent(e.accent), flex: 'none' }} />
                      <span style={{ ...stretch, fontSize: 9, color: THEME.bodyColor }}>{e.dates}</span>
                    </div>
                  </>
                );

                return e.link && e.preview ? (
                  <LinkPreviewLink
                    key={e.company}
                    href={e.link}
                    preview={e.preview}
                    caption={e.previewCaption}
                    className="enter-pop"
                    style={cardStyle}
                    onEnter={(ev) => lift(ev.currentTarget)}
                    onLeave={(ev) => rest(ev.currentTarget)}
                  >
                    {inner}
                  </LinkPreviewLink>
                ) : (
                  <div
                    key={e.company}
                    className="enter-pop"
                    style={cardStyle}
                    onMouseEnter={(ev) => lift(ev.currentTarget)}
                    onMouseLeave={(ev) => rest(ev.currentTarget)}
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
