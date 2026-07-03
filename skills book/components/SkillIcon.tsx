'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Skill } from '@/lib/grimoire-data'
import SkillIconArt from './SkillIconArt'

interface SkillIconProps {
  skill: Skill
  size?: number
  onHover?: (skill: Skill | null) => void
  onClick?: (skill: Skill) => void
}

interface TooltipPos { left: number; top: number }

export default function SkillIcon({ skill, size = 52, onHover, onClick }: SkillIconProps) {
  const [hovered, setHovered] = useState(false)
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null)
  const [portalReady, setPortalReady] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setPortalReady(typeof document !== 'undefined')
  }, [])

  const updateTooltipPos = () => {
    const el = btnRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setTooltipPos({
      left: rect.left + rect.width / 2,
      top: rect.bottom + 14,
    })
  }

  const enter = () => {
    setHovered(true)
    updateTooltipPos()
    onHover?.(skill)
  }
  const leave = () => {
    setHovered(false)
    setTooltipPos(null)
    onHover?.(null)
  }

  useEffect(() => {
    if (!hovered) return
    const tick = () => updateTooltipPos()
    window.addEventListener('scroll', tick, true)
    window.addEventListener('resize', tick)
    return () => {
      window.removeEventListener('scroll', tick, true)
      window.removeEventListener('resize', tick)
    }
  }, [hovered])

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        pointerEvents: 'auto',
      }}
    >
      <button
        ref={btnRef}
        type="button"
        className="skill-tile"
        aria-label={skill.name}
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={enter}
        onBlur={leave}
        onClick={() => onClick?.(skill)}
        style={{
          width: size,
          height: size,
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: hovered ? 'scale(1.25)' : 'scale(1)',
          transition: 'transform 0.2s ease',
          position: 'relative',
        }}
      >
        <SkillIconArt skill={skill} size={size} glow={hovered ? 'hover' : 'idle'} />
      </button>

      {portalReady && hovered && tooltipPos && createPortal(
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: tooltipPos.left,
            top: tooltipPos.top,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #f1deba 0%, #e3cda5 100%)',
            border: '1px solid rgba(58,42,24,0.55)',
            boxShadow: '0 0 0 2px #2b251f, 0 0 0 3px rgba(176,137,79,0.45), 0 8px 22px rgba(0,0,0,0.6)',
            padding: '0.55rem 0.85rem',
            minWidth: 170,
            maxWidth: 240,
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 9999,
            animation: 'frost-in 0.15s ease-out',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#2a1c10',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            marginBottom: 4,
            textShadow: '0 0 1px rgba(58,42,24,0.3)',
          }}>
            {skill.name}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: '#5a4022',
            lineHeight: 1.4,
            letterSpacing: '0.03em',
          }}>
            {skill.blurb}
          </div>
        </div>,
        document.body,
      )}

      <style>{`
        .skill-tile:focus-visible {
          outline: 2px solid var(--accent-frost);
          outline-offset: 6px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
