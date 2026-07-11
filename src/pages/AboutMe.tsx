import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import MobileNav from '../components/MobileNav';
import SiteFooter, { FOOTER_H } from '../components/SiteFooter';
import SoundToggle from '../components/SoundToggle';
import ThemeToggle from '../components/ThemeToggle';
import { ABOUT_GALLERY, ABOUT_HERO, ABOUT_INTERESTS, type AboutMedia } from '../data/about';
import { useIsMobile } from '../lib/useIsMobile';

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

function DiaryMedia({
  media,
  gallery = false,
  priority = false,
  onOpen,
}: {
  media: AboutMedia;
  gallery?: boolean;
  priority?: boolean;
  onOpen?: (media: AboutMedia, trigger: HTMLElement) => void;
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
      <img src={media.src} alt={media.alt} loading={priority ? 'eager' : 'lazy'} draggable={false} />
    )
  ) : (
    <Placeholder media={media} />
  );

  const className = `about-media about-media--${media.shape}${gallery ? ' about-media--gallery' : ''}${media.src ? ' is-filled' : ' is-empty'}`;

  if (media.src && onOpen) {
    return (
      <button
        type="button"
        className={className}
        aria-label={`Open ${media.alt}`}
        onClick={(event) => onOpen(media, event.currentTarget)}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

function MediaLightbox({
  items,
  activeId,
  onChange,
  onClose,
  returnFocus,
}: {
  items: AboutMedia[];
  activeId: string;
  onChange: (id: string) => void;
  onClose: () => void;
  returnFocus: MutableRefObject<HTMLElement | null>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const active = items[activeIndex];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocus.current?.focus();
    };
  }, [onClose, returnFocus]);

  useEffect(() => {
    const move = (delta: number) => {
      const next = (activeIndex + delta + items.length) % items.length;
      onChange(items[next].id);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, items, onChange, onClose]);

  if (!active) return null;

  const move = (delta: number) => {
    const next = (activeIndex + delta + items.length) % items.length;
    onChange(items[next].id);
  };

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, video[controls]'));
    if (focusable.length < 2) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="about-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      onClick={onClose}
      onKeyDown={trapFocus}
    >
      <div className="about-lightbox__count" aria-live="polite">
        {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
      </div>
      <button ref={closeRef} type="button" className="about-lightbox__close" aria-label="Close media viewer" onClick={onClose}>×</button>
      {items.length > 1 && (
        <>
          <button type="button" className="about-lightbox__arrow about-lightbox__arrow--prev" aria-label="Previous media" onClick={(event) => { event.stopPropagation(); move(-1); }}>←</button>
          <button type="button" className="about-lightbox__arrow about-lightbox__arrow--next" aria-label="Next media" onClick={(event) => { event.stopPropagation(); move(1); }}>→</button>
        </>
      )}
      <div className={`about-lightbox__media about-lightbox__media--${active.shape}`} onClick={(event) => event.stopPropagation()}>
        {active.type === 'video' ? (
          <video src={active.src} poster={active.poster} controls autoPlay muted loop playsInline aria-label={active.alt} />
        ) : (
          <img src={active.src} alt={active.alt} />
        )}
      </div>
    </div>
  );
}

export default function AboutMe() {
  const isMobile = useIsMobile();
  const pageRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const viewableMedia = useMemo(
    () => [ABOUT_HERO, ...ABOUT_INTERESTS.flatMap((interest) => interest.media), ...ABOUT_GALLERY].filter((media) => !!media.src),
    [],
  );

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

  const openMedia = (media: AboutMedia, trigger: HTMLElement) => {
    if (!media.src) return;
    returnFocusRef.current = trigger;
    setActiveId(media.id);
  };
  const closeMedia = useCallback(() => setActiveId(null), []);

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
              <div className="about-kicker">personal archive / 01</div>
              <h1 id="about-title">hey, i'm ali —</h1>
              <p>mechatronics engineering student @ uwaterloo, incoming @ axl labs. i like building things that make people's lives easier: software, robots, and everything in between.</p>
              <p>off the clock i'm at the gym hitting pads, defending my anime tier lists, or putting together an outfit i'll overthink anyway. this page is the non-resume stuff.</p>
              <div className="about-hero__stamp" aria-hidden>off duty<br />since 2007</div>
            </div>
            <div className="about-hero__visual">
              <div className="about-hero__tape" aria-hidden />
              <DiaryMedia media={ABOUT_HERO} priority onOpen={openMedia} />
              <span className="about-hero__scribble" aria-hidden>that's me ↗</span>
              <span className="about-hero__frame-no" aria-hidden>001 / portrait</span>
            </div>
          </section>

          <div className="about-index" aria-hidden>
            <span>things i keep coming back to</span>
            <span>02 — 04</span>
          </div>

          <section className="about-interests" aria-label="Favourite interests">
            {ABOUT_INTERESTS.map((interest, index) => (
              <article key={interest.id} className={`about-interest about-interest--${interest.id} about-reveal`}>
                <header className="about-interest__copy">
                  <span className="about-interest__number">0{index + 2}</span>
                  <h2>{interest.title}</h2>
                  <p>{interest.blurb}</p>
                </header>
                <div className="about-interest__media">
                  {interest.media.map((media, mediaIndex) => (
                    <div key={media.id} className={`about-interest__frame about-interest__frame--${mediaIndex + 1}`}>
                      <DiaryMedia media={media} onOpen={openMedia} />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section className="about-archive" aria-labelledby="archive-title">
            <header className="about-archive__header about-reveal">
              <div>
                <span className="about-archive__eyebrow">05 / camera roll</span>
                <h2 id="archive-title">the archive</h2>
              </div>
              <p>no captions. no chronology. just things worth keeping.</p>
            </header>
            <div className="about-gallery">
              {ABOUT_GALLERY.map((media, index) => (
                <div key={media.id} className={`about-gallery__item about-gallery__item--${media.shape} about-reveal`}>
                  <span className="about-gallery__index" aria-hidden>{String(index + 1).padStart(2, '0')}</span>
                  <DiaryMedia media={media} gallery onOpen={openMedia} />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <SiteFooter />

      {activeId && viewableMedia.length > 0 && createPortal(
        <MediaLightbox
          items={viewableMedia}
          activeId={activeId}
          onChange={setActiveId}
          onClose={closeMedia}
          returnFocus={returnFocusRef}
        />,
        document.body,
      )}
    </div>
  );
}
