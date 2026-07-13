import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ContactBar from '../components/ContactBar';
import MobileNav from '../components/MobileNav';
import SiteFooter, { FOOTER_H } from '../components/SiteFooter';
import SoundToggle from '../components/SoundToggle';
import ThemeToggle from '../components/ThemeToggle';
import { ABOUT_GALLERY, ABOUT_HERO, ABOUT_INTERESTS, type AboutMedia } from '../data/about';
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
  const words = text.split(' ');
  const lead = words.slice(0, LEAD_WORDS).join(' ');
  const rest = words.slice(LEAD_WORDS).join(' ');
  return (
    <p className="about-strip__caption about-strip__caption--top">
      <span className="about-strip__caption-lead">{lead}</span>
      {rest && ` ${rest}`}
    </p>
  );
}

function FilmReel({
  frames,
  direction,
  label,
  onOpenClip,
}: {
  frames: AboutMedia[];
  /** Idle auto-scroll direction (content drift). */
  direction: 'left' | 'right';
  label?: string;
  onOpenClip?: (src: string) => void;
}) {
  const reelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // Interaction state kept in refs so the rAF loop reads live values without re-subscribing.
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  // Sub-pixel position tracked as a float; scrollLeft rounds to int, so stepping
  // it directly loses fractional advances (e.g. -0.5/frame rounds back to the
  // same integer and never moves). We own the float and write rounded values.
  const posRef = useRef(0);

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
      if (!pausedRef.current && !draggingRef.current) {
        posRef.current += speed;
        wrap(el.scrollWidth / 2);
        el.scrollLeft = Math.round(posRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction, reduced]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = reelRef.current;
    if (!el) return;
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
        onPointerDown={onPointerDown}
        onPointerEnter={() => (pausedRef.current = true)}
        onPointerLeave={() => (pausedRef.current = false)}
      >
        <div className="about-strip__track">
          {[0, 1].map((pass) =>
            frames.map((media) => (
              <div key={`${media.id}-${pass}`} className="about-strip__frame" aria-hidden={pass === 1}>
                <DiaryMedia media={media} onOpenClip={onOpenClip} />
              </div>
            )),
          )}
        </div>
      </div>
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
    if (i !== -1) setClipIndex(i);
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
              <h1 id="about-title">hey, i'm ali —</h1>
              <p>mechatronics engineering student @ uwaterloo, incoming @ axl labs. i like building things that make people's lives easier: software, robots, and everything in between.</p>
              <p>off the clock i'm at the gym hitting pads, defending my anime tier lists, or putting together an outfit i'll overthink anyway. this page is the non-resume stuff.</p>
              <div className="about-hero__contact">
                <span className="about-hero__contact-label">reach me:</span>
                <ContactBar links={PROFILE.links} variant="about" />
              </div>
            </div>
            <div className="about-hero__visual">
              <div className="about-hero__tape" aria-hidden />
              <DiaryMedia media={ABOUT_HERO} priority />
              <span className="about-hero__scribble" aria-hidden>that's me ↗</span>
            </div>
          </section>

          <header className="about-section-head about-reveal">
            <div>
              <span className="about-archive__eyebrow">off the clock</span>
              <h2>my favorite things</h2>
            </div>
          </header>

          <section className="about-interests" aria-label="Things I keep coming back to">
            {ABOUT_INTERESTS.map((interest) => (
              <article
                key={interest.id}
                className={`about-strip about-strip--${interest.scroll} about-reveal`}
              >
                {interest.id === 'anime' && <AnimeCaption text={interest.caption} />}
                {interest.mediaTop && (
                  <FilmReel
                    frames={interest.mediaTop}
                    direction={interest.scroll === 'left' ? 'right' : 'left'}
                    onOpenClip={openClip}
                  />
                )}
                <FilmReel frames={interest.media} direction={interest.scroll} label={interest.caption} onOpenClip={openClip} />
                {interest.id !== 'anime' && (
                  <p className="about-strip__caption">{interest.caption}</p>
                )}
              </article>
            ))}
          </section>

          <section className="about-archive" aria-labelledby="archive-title">
            <header className="about-archive__header about-reveal">
              <div>
                <span className="about-archive__eyebrow">camera roll</span>
                <h2 id="archive-title">the archive</h2>
              </div>
              <p>no captions. no chronology. just things worth keeping.</p>
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

      <VideoLightbox playlist={clips} index={clipIndex} onIndex={setClipIndex} onClose={() => setClipIndex(null)} />
    </div>
  );
}
