
import { useState } from 'react'
import SkillIcon from './SkillIcon'
import type { Category, Skill } from '../../data/grimoire-data'

interface GrimoireRingProps {
  items: Skill[]
  radius: number
  duration: number
  direction: 'cw' | 'ccw'
  category: Category
  tileSize?: number
  onCategoryHover?: (cat: Category | null) => void
  onItemHover?: (skill: Skill | null) => void
  onItemClick?: (skill: Skill) => void
}

export default function GrimoireRing({
  items,
  radius,
  duration,
  direction,
  category,
  tileSize = 52,
  onCategoryHover,
  onItemHover,
  onItemClick,
}: GrimoireRingProps) {
  const [paused, setPaused] = useState(false)
  const sign = direction === 'cw' ? 1 : -1
  const trackWidth = tileSize * 1.5
  const inkSeed = category === 'languages' ? 3 : category === 'frameworks' ? 7 : 11
  const pad = trackWidth / 2 + 2
  const boxRadius = radius + pad
  const boxSize = boxRadius * 2

  // Pause ring whenever any of its items is hovered.
  const handleItemHover = (skill: Skill | null) => {
    setPaused(skill !== null)
    onCategoryHover?.(skill !== null ? category : null)
    onItemHover?.(skill)
  }

  // Per-item self-contained keyframes. Each item orbits from its start angle
  // through ±360 while inner counter-rotation keeps the tile upright at every frame.
  // Include count in keyframe name so re-renders with different N invalidate stale keyframes.
  const N = items.length
  const keyframes = items.map((_, i) => {
    const start = (360 / N) * i
    const end = start + 360 * sign
    return `
      @keyframes grim-orbit-${category}-${N}-${i} {
        from { transform: rotate(${start}deg) translateY(-${radius}px) rotate(${-start}deg); }
        to   { transform: rotate(${end}deg)   translateY(-${radius}px) rotate(${-end}deg); }
      }
    `
  }).join('\n')

  return (
    <div
      className={`grim-ring grim-ring-${category} ${paused ? 'paused' : ''}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: boxSize,
        height: boxSize,
        marginLeft: -boxRadius,
        marginTop: -boxRadius,
        pointerEvents: 'none',
      }}
    >
      {/* Hand-drawn path track on parchment */}
      <svg
        viewBox={`0 0 ${boxSize} ${boxSize}`}
        width={boxSize}
        height={boxSize}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id={`ink-${category}`} x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="turbulence" baseFrequency="0.020 0.024"
                          numOctaves="4" seed={inkSeed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="7"
                               xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`ink2-${category}`} x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="turbulence" baseFrequency="0.026 0.018"
                          numOctaves="3" seed={inkSeed + 5} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5"
                               xChannelSelector="G" yChannelSelector="R" />
          </filter>
        </defs>

        {/* Outer edge — hand-drawn ink boundary, 1.2× icon width */}
        <circle cx={boxRadius} cy={boxRadius} r={radius + tileSize * 0.60}
                fill="none" stroke="rgba(38,20,4,0.82)" strokeWidth="2.8"
                strokeLinecap="round"
                filter={`url(#ink-${category})`} />

        {/* Outer edge highlight — parchment worn bright rim */}
        <circle cx={boxRadius} cy={boxRadius} r={radius + tileSize * 0.60}
                fill="none" stroke="rgba(205,178,118,0.38)" strokeWidth="1.1"
                filter={`url(#ink-${category})`} />

        {/* Inner edge — hand-drawn ink boundary, different warp */}
        <circle cx={boxRadius} cy={boxRadius} r={radius - tileSize * 0.60}
                fill="none" stroke="rgba(38,20,4,0.82)" strokeWidth="2.8"
                strokeLinecap="round"
                filter={`url(#ink2-${category})`} />

        {/* Inner edge highlight */}
        <circle cx={boxRadius} cy={boxRadius} r={radius - tileSize * 0.60}
                fill="none" stroke="rgba(205,178,118,0.38)" strokeWidth="1.1"
                filter={`url(#ink2-${category})`} />
      </svg>

      {/* Items — each in its own absolute slot at parent center, animated by per-item keyframe */}
      {items.map((item, i) => {
        const start = (360 / N) * i
        return (
          <div
            key={item.name}
            className="grim-orbit-item"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              transform: `rotate(${start}deg) translateY(-${radius}px) rotate(${-start}deg)`,
              animationName: `grim-orbit-${category}-${N}-${i}`,
              animationDuration: `${duration}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationPlayState: paused ? 'paused' : 'running',
              willChange: 'transform',
            }}
          >
            <div style={{
              position: 'absolute',
              left: -tileSize / 2,
              top: -tileSize / 2,
              width: tileSize,
              height: tileSize,
              pointerEvents: 'auto',
            }}>
              <SkillIcon skill={item} size={tileSize} onHover={handleItemHover} onClick={onItemClick} />
            </div>
          </div>
        )
      })}

      <style>{`
        ${keyframes}
        @media (prefers-reduced-motion: reduce) {
          .grim-orbit-item { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
