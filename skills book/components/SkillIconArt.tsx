import type { Skill } from '@/lib/grimoire-data'

interface SkillIconArtProps {
  skill: Skill
  size: number
  glow?: 'idle' | 'hover' | 'big'
}

export default function SkillIconArt({ skill, size, glow = 'idle' }: SkillIconArtProps) {
  if (skill.icon.kind === 'simple') {
    const color = skill.icon.color
    const filter =
      glow === 'big'
        ? `drop-shadow(0 0 10px ${color}cc) drop-shadow(0 0 24px ${color}77) drop-shadow(0 0 40px ${color}33)`
        : glow === 'hover'
        ? `drop-shadow(0 0 8px ${color}cc) drop-shadow(0 0 18px ${color}66)`
        : `drop-shadow(0 0 4px rgba(0,0,0,0.7)) drop-shadow(0 0 10px ${color}33)`
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={color}
        aria-hidden="true"
        style={{ filter, transition: 'filter 0.2s ease' }}
      >
        <path d={skill.icon.path} />
      </svg>
    )
  }

  const filter =
    glow === 'big'
      ? 'drop-shadow(0 0 10px rgba(184,240,208,0.8)) drop-shadow(0 0 24px rgba(126,212,164,0.5)) drop-shadow(0 0 40px rgba(126,212,164,0.25))'
      : glow === 'hover'
      ? 'drop-shadow(0 0 8px rgba(184,240,208,0.7)) drop-shadow(0 0 18px rgba(126,212,164,0.4))'
      : 'drop-shadow(0 0 4px rgba(0,0,0,0.7)) drop-shadow(0 0 10px rgba(126,212,164,0.15))'

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={skill.icon.src}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      style={{
        objectFit: 'contain',
        filter,
        transition: 'filter 0.2s ease',
        pointerEvents: 'none',
      }}
      draggable={false}
    />
  )
}
