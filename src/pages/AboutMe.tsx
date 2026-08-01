import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ContactBar from '../components/ContactBar';
import FashionCarousel from '../components/FashionCarousel';
import MobileNav from '../components/MobileNav';
import SiteFooter, { FOOTER_H } from '../components/SiteFooter';
import SoundToggle from '../components/SoundToggle';
import ThemeToggle from '../components/ThemeToggle';
import { ABOUT_GALLERY, ABOUT_HERO, ABOUT_INTERESTS, type AboutMedia } from '../data/about';
import { play } from '../lib/sound';
import { useIsMobile } from '../lib/useIsMobile';
import { PROFILE } from '../tokens';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

function Placeholder({ media }: { media: AboutMedia }) {
  return (
    <span className="about-placeholder" aria-label={`${media.placeholder} placeholder`}>
      <span className="about-placeholder__corners" aria-hidden />
      <span className="about-placeholder__cross" aria-hidden>+</span>
      <span className="about-placeholder__label">{media.placeholder}</span>
      <span className="about-placeholder__path">/assets/about/</span>
    </span>
  );
}

function HoverVideo({ src, label, reduced, onActivate }: { src: string; label: string; reduced: boolean; onActivate: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);

  // Muted looping preview on hover + tap-to-open (the reel fires 'tileactivate'
  // because it owns the pointer gesture — see FilmReel). The full-screen player
  // itself lives at page level (VideoLightbox) so it can page through clips.
  useEffect(() => {
    const video = ref.current;
    const tile = video?.parentElement;
    if (!video || !tile) return;

    const activate = () => onActivate();
    tile.addEventListener('tileactivate', activate);

    const enter = reduced ? null : () => void video.play().catch(() => {});
    const leave = reduced ? null : () => {
      video.pause();
      video.currentTime = 0;
    };
    if (enter) tile.addEventListener('pointerenter', enter);
    if (leave) tile.addEventListener('pointerleave', leave);
    return () => {
      tile.removeEventListener('tileactivate', activate);
      if (enter) tile.removeEventListener('pointerenter', enter);
      if (leave) tile.removeEventListener('pointerleave', leave);
    };
  }, [src, reduced, onActivate]);

  return (
    <video
      ref={ref}
      className="about-media__hover"
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  );
}

interface Clip { src: string; label: string; }

function VideoLightbox({ playlist, index, onIndex, onClose }: {
  playlist: Clip[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const open = index !== null;

  useEffect(() => {
    if (!open || index === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onIndex((index + 1) % playlist.length);
      else if (e.key === 'ArrowLeft') onIndex((index - 1 + playlist.length) % playlist.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, index, playlist.length, onIndex, onClose]);

  if (!open || index === null) return null;
  const clip = playlist[index];
  const many = playlist.length > 1;

  return createPortal(
    <div className="about-lightbox video-overlay" onClick={onClose}>
      <button type="button" className="about-lightbox__close" aria-label="Close" onClick={onClose}>×</button>
      {many && (
        <button
          type="button"
          className="about-lightbox__nav about-lightbox__nav--prev"
          aria-label="Previous video"
          onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + playlist.length) % playlist.length); }}
        >‹</button>
      )}
      <video
        key={clip.src}
        src={clip.src}
        controls
        autoPlay
        playsInline
        aria-label={clip.label}
        onClick={(e) => e.stopPropagation()}
      />
      {many && (
        <button
          type="button"
          className="about-lightbox__nav about-lightbox__nav--next"
          aria-label="Next video"
          onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % playlist.length); }}
        >›</button>
      )}
    </div>,
    document.body,
  );
}

function DiaryMedia({
  media,
  gallery = false,
  priority = false,
  onOpenClip,
}: {
  media: AboutMedia;
  gallery?: boolean;
  priority?: boolean;
  onOpenClip?: (src: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) {
      video?.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.2 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduced, media.src]);

  const content = media.src ? (
    media.type === 'video' ? (
      <video
        ref={videoRef}
        src={media.src}
        poster={media.poster}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={media.alt}
      />
    ) : (
      <>
        <img src={media.src} alt={media.alt} loading={priority ? 'eager' : 'lazy'} draggable={false} />
        {media.hoverVideo && (
          <HoverVideo
            src={media.hoverVideo}
            label={media.alt}
            reduced={reduced}
            onActivate={() => onOpenClip?.(media.hoverVideo!)}
          />
        )}
      </>
    )
  ) : (
    <Placeholder media={media} />
  );

  const className = `about-media about-media--${media.shape}${gallery ? ' about-media--gallery' : ''}${media.src ? ' is-filled' : ' is-empty'}${media.hoverVideo ? ' has-hover-video' : ''}`;
  const style = gallery && media.aspect ? { aspectRatio: String(media.aspect) } : undefined;
  return <div className={className} style={style}>{content}</div>;
}

// Anime strip caption sits above its two rows; the lead phrase ("my favorite
// animes") is darkened for emphasis.
function AnimeCaption({ text }: { text: string }) {
  const LEAD_WORDS = 3;
  // Explicit **phrase** markup overrides the lead-words emphasis: the marked
  // phrase renders in the dark lead colour, everything else stays muted.
  if (text.includes('**')) {
    const parts = text.split('**'); // odd indices sit between the ** markers
    return (
      <p className="about-strip__caption about-strip__caption--top">
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <span key={i} className="about-strip__caption-lead">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>
    );
  }
  const words = text.split(' ');
  const lead = words.slice(0, LEAD_WORDS).join(' ');
  const rest = words.slice(LEAD_WORDS).join(' ');
  // Any trailing parenthetical (e.g. "(watch out for spoilers)") renders in the
  // dark lead colour instead of the muted body colour.
  const parenIdx = rest.indexOf('(');
  const restBody = parenIdx === -1 ? rest : rest.slice(0, parenIdx).trimEnd();
  const paren = parenIdx === -1 ? '' : rest.slice(parenIdx);
  // Render explicit line breaks (\n in the caption) as <br/>.
  const restLines = restBody.split('\n');
  return (
    <p className="about-strip__caption about-strip__caption--top">
      <span className="about-strip__caption-lead">{lead}</span>
      {restBody &&
        restLines.map((line, i) => (
          <span key={i}>
            {i === 0 ? ` ${line}` : line}
            {i < restLines.length - 1 && <br />}
          </span>
        ))}
      {paren && (
        <>
          {' '}
          <span className="about-strip__caption-lead about-spoiler">
            {paren}
            <svg
              className="about-spoiler__underline"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 7 C 26 3, 52 9, 78 6 S 130 3, 156 7 S 190 8, 198 5"
                pathLength={1}
                stroke="#c9352c"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </>
      )}
    </p>
  );
}

// How long the idle drift stays parked after the user scrolls a reel themself.
const DRIFT_RESUME_DELAY_MS = 2500;

function FilmReel({
  frames,
  direction,
  label,
  onOpenClip,
  showTitles,
}: {
  frames: AboutMedia[];
  /** Idle auto-scroll direction (content drift). */
  direction: 'left' | 'right';
  label?: string;
  onOpenClip?: (src: string) => void;
  /** Show a small hover caption naming each frame (anime / shows strips). */
  showTitles?: boolean;
}) {
  const reelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // Hover caption lives in a body portal (fixed to the viewport) so the reel's
  // overflow:hidden, edge mask, and sibling tiles can never clip or cover it.
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  // Interaction state kept in refs so the rAF loop reads live values without re-subscribing.
  const draggingRef = useRef(false);
  // Sub-pixel position tracked as a float; scrollLeft rounds to int, so stepping
  // it directly loses fractional advances (e.g. -0.5/frame rounds back to the
  // same integer and never moves). We own the float and write rounded values.
  const posRef = useRef(0);
  // After the user scrolls the strip themself (mouse drag or native touch
  // pan/fling), the drift stays parked until this timestamp — writes during a
  // fling would also kill its momentum. Refreshed per user scroll event.
  const coastUntilRef = useRef(0);

  // Keep pos inside [0, half); the track holds two copies so this is seamless.
  const wrap = (half: number) => {
    if (half <= 0) return;
    if (posRef.current >= half) posRef.current -= half;
    else if (posRef.current < 0) posRef.current += half;
  };

  useEffect(() => {
    const el = reelRef.current;
    if (!el || reduced) return;

    const speed = direction === 'left' ? 0.5 : -0.5; // px per frame
    let raf = 0;
    const tick = () => {
      if (!draggingRef.current && Date.now() >= coastUntilRef.current) {
        posRef.current += speed;
        wrap(el.scrollWidth / 2);
        el.scrollLeft = Math.round(posRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction, reduced]);

  // Park the hover caption on the cursor (viewport coords → fixed tooltip).
  const showTip = (text: string) => (e: React.PointerEvent<HTMLDivElement>) =>
    setTip({ text, x: e.clientX, y: e.clientY });
  const hideTip = () => setTip(null);

  // Any scroll we didn't write ourselves is the browser's native touch pan /
  // fling: adopt it into the float position and wrap it onto the seamless loop.
  const onScroll = () => {
    const el = reelRef.current;
    if (!el) return;
    if (draggingRef.current) return; // drag handler already owns posRef
    // scrollLeft reads back quantized to device pixels, so on fractional
    // display scaling (e.g. Windows 125%) our own integer writes echo back
    // slightly off (write 5, read 4.8). Exact equality would misread every
    // drift write as a native fling and coast forever — use a tolerance.
    if (Math.abs(el.scrollLeft - posRef.current) < 1.5) return; // our own write
    coastUntilRef.current = Date.now() + DRIFT_RESUME_DELAY_MS;
    posRef.current = el.scrollLeft;
    const half = el.scrollWidth / 2;
    if (half <= 0) return;
    if (el.scrollLeft >= half) {
      posRef.current -= half;
      el.scrollLeft = Math.round(posRef.current);
    } else if (el.scrollLeft < 1) {
      // Parked at the hard left edge: jump to the identical frame in copy two
      // so the user can keep swiping backwards.
      posRef.current += half;
      el.scrollLeft = Math.round(posRef.current);
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = reelRef.current;
    if (!el) return;

    // Touch pans natively (touch-action: pan-x). Capturing the pointer here
    // would fight the native scroll and iOS would pointercancel the gesture —
    // so on touch, JS only watches for a tap to open a clip.
    if (e.pointerType !== 'mouse') {
      const startX = e.clientX;
      const startY = e.clientY;
      const downTarget = e.target as HTMLElement;
      const onUp = (ev: PointerEvent) => {
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) {
          downTarget.closest('.about-media.has-hover-video')
            ?.dispatchEvent(new CustomEvent('tileactivate'));
        }
      };
      const onCancel = () => {
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
      };
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
      return;
    }

    e.preventDefault(); // stop text/image selection from starting the drag
    draggingRef.current = true;
    el.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = posRef.current;
    // Remember where the gesture began so a tap (no real drag) can open the tile.
    const downTarget = e.target as HTMLElement;
    let moved = false;

    const onMove = (ev: PointerEvent) => {
      if (!draggingRef.current) return;
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) >= 6) moved = true;
      posRef.current = startPos - (ev.clientX - startX);
      wrap(el.scrollWidth / 2);
      el.scrollLeft = Math.round(posRef.current);
    };
    const onUp = () => {
      draggingRef.current = false;
      coastUntilRef.current = Date.now() + DRIFT_RESUME_DELAY_MS;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (!moved) {
        downTarget.closest('.about-media.has-hover-video')
          ?.dispatchEvent(new CustomEvent('tileactivate'));
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="about-strip__reel">
      <div
        ref={reelRef}
        className="about-strip__viewport"
        aria-label={label}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
      >
        <div className="about-strip__track">
          {[0, 1].map((pass) =>
            frames.map((media) => {
              const caption = media.title ?? media.alt;
              return (
                <div
                  key={`${media.id}-${pass}`}
                  className="about-strip__frame"
                  aria-hidden={pass === 1}
                  onPointerEnter={showTitles ? showTip(caption) : undefined}
                  onPointerMove={showTitles ? showTip(caption) : undefined}
                  onPointerLeave={showTitles ? hideTip : undefined}
                >
                  <DiaryMedia media={media} onOpenClip={onOpenClip} />
                </div>
              );
            }),
          )}
        </div>
      </div>
      {tip &&
        createPortal(
          <span
            className="about-strip__frame-title"
            style={{ left: tip.x, top: tip.y }}
          >
            {tip.text}
          </span>,
          document.body,
        )}
    </div>
  );
}

export default function AboutMe() {
  const isMobile = useIsMobile();
  const pageRef = useRef<HTMLDivElement>(null);

  // Every strip clip, in display order — the lightbox pages through this list.
  const clips = useMemo<Clip[]>(() => {
    const out: Clip[] = [];
    for (const interest of ABOUT_INTERESTS) {
      for (const media of [...(interest.mediaTop ?? []), ...interest.media]) {
        if (media.hoverVideo) out.push({ src: media.hoverVideo, label: media.alt });
      }
    }
    return out;
  }, []);
  const [clipIndex, setClipIndex] = useState<number | null>(null);
  const openClip = (src: string) => {
    const i = clips.findIndex((c) => c.src === src);
    if (i !== -1) {
      play('shutter');
      setClipIndex(i);
    }
  };
  const closeClip = () => {
    play('whooshClose');
    setClipIndex(null);
  };

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>('.about-reveal'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-root">
      <div
        ref={pageRef}
        className="about-sheet"
        style={{ marginBottom: isMobile ? '100svh' : FOOTER_H }}
      >
        <MobileNav currentRoute="/about" variant="board" fixed burgerClassName="enter-drop" />
        <div className="about-controls enter-drop">
          <ThemeToggle />
          <SoundToggle />
        </div>

        <main>
          <section className="about-hero" aria-labelledby="about-title">
            <div className="about-hero__copy">
              <h1 id="about-title">about me</h1>
              <p>i'm ali, a mechatronics engineering student at the university of waterloo. my goal is to build things that make people's lives easier, and software and robotics are the perfect means to do just that.</p>
              <p>off the clock i'm at the gym, defending my anime tier lists, or putting together another outfit. this page is the personal, non-resume stuff.</p>
              <div className="about-hero__contact">
                <span className="about-hero__contact-label">reach me:</span>
                <ContactBar links={PROFILE.links} variant="about" />
              </div>
            </div>
            <div
              className="about-hero__visual"
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') play('frameWhoosh'); // hover only; taps stay silent
              }}
            >
              <div className="about-hero__tape" aria-hidden />
              <DiaryMedia media={ABOUT_HERO} priority />
              <span className="about-hero__scribble" aria-hidden>Beirut, Lebanon | 27-07-2025</span>
            </div>
          </section>

          <header className="about-section-head about-reveal">
            <div>
              <h2>my favorite things</h2>
            </div>
          </header>

          <section className="about-interests" aria-label="Things I keep coming back to">
            {ABOUT_INTERESTS.map((interest) => (
              <article
                key={interest.id}
                className={`about-strip about-strip--${interest.scroll} about-reveal`}
              >
                <AnimeCaption text={interest.caption} />
                {interest.id === 'fashion' ? (
                  <FashionCarousel frames={interest.media} label={interest.caption} />
                ) : (
                  <>
                    {interest.mediaTop && (
                      <FilmReel
                        frames={interest.mediaTop}
                        direction={interest.scroll === 'left' ? 'right' : 'left'}
                        onOpenClip={openClip}
                        showTitles
                      />
                    )}
                    <FilmReel frames={interest.media} direction={interest.scroll} label={interest.caption} onOpenClip={openClip} showTitles />
                  </>
                )}
              </article>
            ))}
          </section>

          <section className="about-archive" aria-labelledby="archive-title">
            <header className="about-archive__header about-reveal">
              <div>
                <h2 id="archive-title">the archive</h2>
              </div>
            </header>
            <div className="about-gallery">
              {ABOUT_GALLERY.map((media) => (
                <div key={media.id} className={`about-gallery__item about-gallery__item--${media.shape} about-reveal`}>
                  <DiaryMedia media={media} gallery />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <SiteFooter />

      <VideoLightbox playlist={clips} index={clipIndex} onIndex={setClipIndex} onClose={closeClip} />
    </div>
  );
}
