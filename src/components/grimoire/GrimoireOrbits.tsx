
import { useEffect, useLayoutEffect, useState } from 'react'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
import GrimoireRing from './GrimoireRing'
import GrimoireSigil from './GrimoireSigil'
import SkillIcon from './SkillIcon'
import {
  byCategory,
  categoryMeta,
  type Category,
  type Skill,
} from '../../data/grimoire-data'
import { play, startRingHum, stopRingHum, useMuted } from '../../lib/sound'
import { REDUCED } from '../../lib/motion'

const FULL_SIZE = 720
const R_OUTER = 332
const R_MIDDLE = 232
const R_INNER = 140
const SIGIL_FULL = 110
const LEFT_PAGE_FRACTION = 0.38   // left-page inscribed disc as fraction of book width

// Outer (Tools) clockwise; middle (Frameworks) counter-clockwise; inner (Languages) clockwise.
const RINGS: Array<{
  category: Category
  radius: number
  duration: number
  direction: 'cw' | 'ccw'
  tile: number
}> = [
  { category: 'tools',      radius: R_OUTER,  duration: 90, direction: 'cw',  tile: 50 },
  { category: 'frameworks', radius: R_MIDDLE, duration: 65, direction: 'ccw', tile: 44 },
  { category: 'languages',  radius: R_INNER,  duration: 42, direction: 'cw',  tile: 38 },
]

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [breakpoint])
  return isMobile
}

function useContainerScale(targetSize: number) {
  const [scale, setScale] = useState<number | null>(null)
  useIsoLayoutEffect(() => {
    const update = () => {
      const bookWidth = Math.min(window.innerWidth * 0.98, window.innerHeight * 1.90, 1500)
      const available = bookWidth * LEFT_PAGE_FRACTION
      setScale(Math.max(0.35, Math.min(1.2, available / targetSize)))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [targetSize])
  return scale
}

interface MobileStripsProps {
  onItemHover: (s: Skill | null) => void
  onItemClick?: (s: Skill) => void
}

function MobileStrips({ onItemHover, onItemClick }: MobileStripsProps) {
  const rows: Array<{ category: Category; direction: 'left' | 'right'; duration: number }> = [
    { category: 'languages',  direction: 'left',  duration: 38 },
    { category: 'frameworks', direction: 'right', duration: 44 },
    { category: 'tools',      direction: 'left',  duration: 56 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {rows.map(({ category, direction, duration }) => {
        const items = byCategory(category)
        const doubled = [...items, ...items]
        const meta = categoryMeta[category]
        return (
          <div key={category} className="strip-wrap">
            <div className="strip-header">
              <span className="strip-rune">{meta.rune}</span>
              <span className="strip-label">{meta.label}</span>
              <span className="strip-line" />
            </div>
            <div
              className="strip-mask"
              onMouseEnter={(e) => e.currentTarget.classList.add('paused')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('paused')}
            >
              <div
                className="strip-track"
                style={{
                  animation: `${direction === 'left' ? 'scroll-left' : 'scroll-right'} ${duration}s linear infinite`,
                }}
              >
                {doubled.map((skill, i) => (
                  <div key={`${skill.name}-${i}`} className="strip-item">
                    <SkillIcon skill={skill} size={56} onHover={onItemHover} onClick={onItemClick} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      <style>{`
        .strip-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .strip-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0 0.25rem;
        }
        .strip-rune {
          font-family: var(--font-display);
          font-size: 1.4rem;
          color: #e8dfc8;
          line-height: 1;
          text-shadow: 0 0 10px rgba(217,176,121,0.55);
        }
        .strip-label {
          font-family: var(--font-display);
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          color: #e8dfc8;
          text-transform: uppercase;
        }
        .strip-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(176,137,79,0.55), rgba(176,137,79,0));
        }
        .strip-mask {
          overflow: hidden;
          padding: 1rem 0;
          mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
        }
        .strip-mask.paused .strip-track { animation-play-state: paused; }
        .strip-track {
          display: flex;
          gap: 1.25rem;
          width: max-content;
          will-change: transform;
        }
        .strip-item {
          flex: 0 0 auto;
        }
        @media (prefers-reduced-motion: reduce) {
          .strip-track { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

interface GrimoireOrbitsProps {
  onSkillClick?: (skill: Skill) => void
}

export default function GrimoireOrbits({ onSkillClick }: GrimoireOrbitsProps = {}) {
  const isMobile = useIsMobile()
  const scale = useContainerScale(FULL_SIZE)
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null)
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null)
  const muted = useMuted()

  // When a skill is hovered, infer category from it; falls back to ring-level hover.
  const activeCategory = hoveredSkill?.category ?? hoveredCategory

  // Rings hum while they turn; hovering pauses them, so the hum grinds to a
  // halt with it. Reduced motion means no spin, so no hum either.
  const spinning = !isMobile && scale !== null && activeCategory === null
  useEffect(() => {
    if (REDUCED()) return
    if (spinning && !muted) {
      startRingHum()
      return () => stopRingHum()
    }
  }, [spinning, muted])

  useEffect(() => {
    if (isMobile || REDUCED() || muted) return
    if (activeCategory !== null) play('ringHalt')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory !== null])

  if (isMobile) {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0 1rem' }}>
          <GrimoireSigil activeCategory={activeCategory} size={110} />
        </div>
        <MobileStrips onItemHover={setHoveredSkill} onItemClick={onSkillClick} />
      </div>
    )
  }

  if (scale === null) {
    // Reserve space (max possible size) but render invisibly until measured
    // to avoid the first-paint flash where rings exceed the page.
    return (
      <div
        aria-hidden="true"
        style={{ position: 'relative', width: FULL_SIZE, height: FULL_SIZE, margin: '0 auto', visibility: 'hidden' }}
      />
    )
  }

  const size = FULL_SIZE * scale

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        margin: '0 auto',
      }}
    >
      {/* Center sigil */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <GrimoireSigil activeCategory={activeCategory} size={SIGIL_FULL * scale} />
      </div>

      {RINGS.map((r) => (
        <div
          key={r.category}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          <GrimoireRing
            items={byCategory(r.category)}
            radius={r.radius * scale}
            duration={r.duration}
            direction={r.direction}
            category={r.category}
            tileSize={Math.max(28, Math.round(r.tile * scale))}
            onCategoryHover={setHoveredCategory}
            onItemHover={setHoveredSkill}
            onItemClick={onSkillClick}
          />
        </div>
      ))}
    </div>
  )
}
