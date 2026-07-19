
import { useEffect, useLayoutEffect, useState } from 'react'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
import GrimoireRing from './GrimoireRing'
import GrimoireSigil from './GrimoireSigil'
import {
  byCategory,
  type Category,
  type Skill,
} from '../../data/grimoire-data'
import { play, useMuted } from '../../lib/sound'
import { REDUCED } from '../../lib/motion'
import { useIsMobile } from '../../lib/useIsMobile'

// re-exported for callers that historically imported it from here
export { useIsMobile }

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

  useEffect(() => {
    if (isMobile || REDUCED() || muted) return
    if (activeCategory !== null) play('ringHalt')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory !== null])

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
