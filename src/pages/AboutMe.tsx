import { useEffect, useRef, useState } from 'react';
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

function DiaryMedia({
  media,
  gallery = false,
  priority = false,
}: {
  media: AboutMedia;
  gallery?: boolean;
  priority?: boolean;
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
  return <div className={className}>{content}</div>;
}

export default function AboutMe() {
  const isMobile = useIsMobile();
  const pageRef = useRef<HTMLDivElement>(null);

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

          <div className="about-index" aria-hidden>
            <span>things i keep coming back to</span>
          </div>

          <section className="about-interests" aria-label="Favourite interests">
            {ABOUT_INTERESTS.map((interest) => (
              <article key={interest.id} className={`about-interest about-interest--${interest.id} about-reveal`}>
                <header className="about-interest__copy">
                  <h2>{interest.title}</h2>
                  <p>{interest.blurb}</p>
                </header>
                <div className="about-interest__media">
                  {interest.media.map((media, mediaIndex) => (
                    <div key={media.id} className={`about-interest__frame about-interest__frame--${mediaIndex + 1}`}>
                      <DiaryMedia media={media} />
                    </div>
                  ))}
                </div>
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
    </div>
  );
}
