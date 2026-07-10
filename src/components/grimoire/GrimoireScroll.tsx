import { useEffect, useRef, useState } from 'react'
import SkillIconArt from './SkillIconArt'
import { byCategory, categoryMeta, type Category } from '../../data/grimoire-data'
import { REDUCED } from '../../lib/motion'

// ink palette lifted from the detail panel so the scroll reads as a page
// torn from the same book
const HEADING_COLOR = '#2a1c10'
const SUBTITLE_COLOR = '#7a5a30'
const RULE_COLOR = 'rgba(58,42,24,0.35)'

const SECTIONS: Category[] = ['languages', 'frameworks', 'tools']

/**
 * Mobile-only skills view: a wooden-rollered parchment scroll that unrolls
 * on mount. Categories are rune-divided sections; each skill inks itself
 * onto the page as it scrolls into view.
 */
export default function GrimoireScroll() {
  // grid-template-rows 0fr -> 1fr animates real height, so the bottom
  // roller physically rides down as the parchment unrolls
  const [unrolled, setUnrolled] = useState(() => REDUCED())
  useEffect(() => {
    if (unrolled) return
    const id = requestAnimationFrame(() => setUnrolled(true))
    return () => cancelAnimationFrame(id)
  }, [unrolled])

  return (
    <div className="gscroll" style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
      <Roller side="top" />

      <div
        style={{
          display: 'grid',
          gridTemplateRows: unrolled ? '1fr' : '0fr',
          transition: 'grid-template-rows 1.1s cubic-bezier(.25,.9,.3,1)',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div
            style={{
              position: 'relative',
              // parchment narrower than the rollers so the rod ends peek out
              margin: '0 14px',
              padding: '1.6rem 1.1rem 2rem',
              background: 'linear-gradient(180deg, #efdcb4 0%, #e8d2a8 50%, #e2caa0 100%)',
              borderLeft: '2px solid #3a2a18',
              borderRight: '2px solid #3a2a18',
              boxShadow:
                'inset 0 0 0 1px rgba(176,137,79,0.6), inset 0 0 28px rgba(176,137,79,0.18), 0 10px 24px rgba(0,0,0,0.45)',
            }}
          >
            {/* curl shadows where the page meets each roller */}
            <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22, background: 'linear-gradient(180deg, rgba(20,12,4,0.35), transparent)', pointerEvents: 'none' }} />
            <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 22, background: 'linear-gradient(0deg, rgba(20,12,4,0.35), transparent)', pointerEvents: 'none' }} />

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: HEADING_COLOR,
                margin: '0 0 1.4rem',
                textAlign: 'center',
                textTransform: 'lowercase',
                letterSpacing: '0.02em',
              }}
            >
              the grimoire
            </h2>

            {SECTIONS.map((category) => (
              <ScrollSection key={category} category={category} />
            ))}
          </div>
        </div>
      </div>

      <Roller side="bottom" />

      <style>{`
        .gscroll-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.1rem;
        }
        .gscroll-item .gscroll-art,
        .gscroll-item .gscroll-name {
          opacity: 0;
          transform: translateY(7px);
          filter: sepia(1) saturate(0.3) brightness(0.7);
          transition:
            opacity 0.45s steps(4, end),
            transform 0.45s steps(4, end),
            filter 0.6s steps(5, end);
          transition-delay: var(--ink-delay, 0ms);
        }
        .gscroll-item.inked .gscroll-art,
        .gscroll-item.inked .gscroll-name {
          opacity: 1;
          transform: translateY(0);
          filter: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .gscroll-item .gscroll-art,
          .gscroll-item .gscroll-name {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}

/** Wooden roller rod capping the scroll, end knobs poking past the page. */
function Roller({ side }: { side: 'top' | 'bottom' }) {
  const knob = (
    <div
      style={{
        flex: '0 0 14px',
        alignSelf: 'stretch',
        background: 'linear-gradient(180deg, #2e1c0c 0%, #1c1006 100%)',
        border: '2px solid #14100a',
        boxShadow: 'inset 0 0 0 1px #a88757',
      }}
    />
  )
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        height: 26,
        filter: `drop-shadow(0 ${side === 'top' ? 3 : -2}px 0 rgba(20,12,4,0.5))`,
      }}
    >
      {knob}
      <div
        style={{
          flex: 1,
          alignSelf: 'stretch',
          background:
            'linear-gradient(180deg, #7a5228 0%, #5a3a1c 35%, #4a2f14 60%, #2e1c0c 100%)',
          border: '2px solid #1c1006',
          boxShadow: 'inset 0 3px 0 rgba(200,175,131,0.35), inset 0 -3px 0 rgba(0,0,0,0.5)',
        }}
      />
      {knob}
    </div>
  )
}

function ScrollSection({ category }: { category: Category }) {
  const meta = categoryMeta[category]
  const items = byCategory(category)

  return (
    <section style={{ marginBottom: '1.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${RULE_COLOR})` }} />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.8rem',
            lineHeight: 1,
            color: SUBTITLE_COLOR,
            textShadow: '0 0 8px rgba(176,137,79,0.5)',
          }}
        >
          {meta.rune}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.5rem',
            letterSpacing: '0.1em',
            color: HEADING_COLOR,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {meta.label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.8rem',
            lineHeight: 1,
            color: SUBTITLE_COLOR,
            textShadow: '0 0 8px rgba(176,137,79,0.5)',
          }}
        >
          {meta.rune}
        </span>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${RULE_COLOR}, transparent)` }} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.9rem 0.4rem',
        }}
      >
        {items.map((skill, i) => (
          <InkedSkill key={skill.name} name={skill.name} column={i % 3}>
            <SkillIconArt skill={skill} size={38} glow="none" />
          </InkedSkill>
        ))}
      </div>
    </section>
  )
}

function InkedSkill({ name, column, children }: { name: string; column: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [inked, setInked] = useState(() => REDUCED())

  useEffect(() => {
    if (inked) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInked(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInked(true)
          obs.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [inked])

  return (
    <div
      ref={ref}
      className={`gscroll-item${inked ? ' inked' : ''}`}
      // stagger left-to-right across the row so each rank inks in sequence
      style={{ '--ink-delay': `${column * 90}ms` } as React.CSSProperties}
    >
      <div className="gscroll-art" style={{ height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
      <div
        className="gscroll-name"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.42rem',
          lineHeight: 1.4,
          color: HEADING_COLOR,
          textAlign: 'center',
          letterSpacing: '0.04em',
          wordBreak: 'break-word',
        }}
      >
        {name}
      </div>
    </div>
  )
}
