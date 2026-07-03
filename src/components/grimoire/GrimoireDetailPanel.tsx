
import { useEffect, useRef } from 'react'
import { categoryMeta, getSkillByName, type Category, type Skill } from '../../data/grimoire-data'
import SkillIconArt from './SkillIconArt'

interface GrimoireDetailPanelProps {
  skill: Skill | null
  onSelect: (s: Skill) => void
  onClose: () => void
}

const SUBTITLE: Record<Category, string> = {
  languages: 'Language',
  frameworks: 'Framework / Library',
  tools: 'Tool',
}

const PANEL_WIDTH = 'clamp(280px, 32vw, 520px)'
const PANEL_MAX_HEIGHT = 'min(76vh, calc(min(98vw, 1500px) / 1774 * 887 * 0.78))'

const HEADING_COLOR = '#2a1c10'
const BODY_COLOR = '#5a4022'
const SUBTITLE_COLOR = '#7a5a30'
const RULE_COLOR = 'rgba(58,42,24,0.35)'

export default function GrimoireDetailPanel({ skill, onSelect, onClose }: GrimoireDetailPanelProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const prevSkillRef = useRef<Skill | null>(null)

  useEffect(() => {
    if (!skill) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [skill, onClose])

  useEffect(() => {
    const wasNull = prevSkillRef.current === null
    const nowSet = skill !== null
    if (wasNull && nowSet) {
      closeBtnRef.current?.focus()
    } else if (!nowSet && prevSkillRef.current !== null) {
      const active = document.activeElement as HTMLElement | null
      active?.blur?.()
    }
    prevSkillRef.current = skill
  }, [skill])

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label={skill ? skill.name : 'Grimoire info'}
      style={{
        width: PANEL_WIDTH,
        maxHeight: PANEL_MAX_HEIGHT,
        overflowY: 'auto',
        padding: '1.25rem 1.4rem',
        position: 'relative',
        fontFamily: 'var(--font-mono)',
        color: BODY_COLOR,
      }}
    >
      {skill === null ? (
        <EmptyState />
      ) : (
        <DetailState skill={skill} onSelect={onSelect} onClose={onClose} closeBtnRef={closeBtnRef} />
      )}
    </div>
  )
}

function EmptyState() {
  const legend: Array<{ category: Category; position: string }> = [
    { category: 'languages',  position: 'inner ring' },
    { category: 'frameworks', position: 'middle ring' },
    { category: 'tools',      position: 'outer ring' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.9rem',
        fontWeight: 600,
        color: HEADING_COLOR,
        margin: 0,
        letterSpacing: '0.02em',
        textTransform: 'lowercase',
      }}>
        the grimoire
      </h2>
      <div style={{ height: 1, background: RULE_COLOR }} />
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {legend.map(({ category, position }) => (
          <li key={category} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: BODY_COLOR }}>
            <span aria-hidden="true" style={{
              width: 7, height: 7, borderRadius: '50%',
              background: HEADING_COLOR,
              boxShadow: '0 0 4px rgba(58,42,24,0.4)',
              flex: '0 0 auto',
            }} />
            <span style={{ color: HEADING_COLOR, fontWeight: 600 }}>{categoryMeta[category].label}</span>
            <span style={{ color: SUBTITLE_COLOR }}>— {position}</span>
          </li>
        ))}
      </ul>
      <div style={{ height: 1, background: RULE_COLOR, opacity: 0.6 }} />
      <p style={{
        margin: 0,
        fontSize: '0.78rem',
        color: BODY_COLOR,
        fontStyle: 'italic',
        letterSpacing: '0.03em',
      }}>
        tap a sigil to inscribe its lore here
      </p>
    </div>
  )
}

interface DetailStateProps {
  skill: Skill
  onSelect: (s: Skill) => void
  onClose: () => void
  closeBtnRef: React.RefObject<HTMLButtonElement | null>
}

function DetailState({ skill, onSelect, onClose, closeBtnRef }: DetailStateProps) {
  const relatedSkills = (skill.related ?? [])
    .map(getSkillByName)
    .filter((s): s is Skill => s !== undefined)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <button
        ref={closeBtnRef}
        type="button"
        aria-label="Dismiss selection"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.65rem',
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'rgba(241,222,186,0.55)',
          border: '1px solid rgba(58,42,24,0.45)',
          color: HEADING_COLOR,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.95rem',
          lineHeight: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        ×
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: '0 0 auto', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SkillIconArt skill={skill} size={120} glow="big" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 600,
            color: HEADING_COLOR,
            margin: 0,
            letterSpacing: '0.02em',
            lineHeight: 1.1,
          }}>
            {skill.name}
          </h3>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: SUBTITLE_COLOR,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}>
            {SUBTITLE[skill.category]}
          </span>
        </div>
      </div>

      <p style={{
        margin: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.88rem',
        lineHeight: 1.55,
        color: BODY_COLOR,
      }}>
        {skill.blurb}
      </p>

      {relatedSkills.length > 0 && (
        <>
          <div style={{ height: 1, background: RULE_COLOR }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: SUBTITLE_COLOR,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              Related Arts
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {relatedSkills.map((rel) => (
                <button
                  key={rel.name}
                  type="button"
                  className="grim-related-chip"
                  onClick={() => onSelect(rel)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.6rem',
                    background: 'rgba(241,222,186,0.45)',
                    border: '1px solid rgba(58,42,24,0.4)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: HEADING_COLOR,
                    letterSpacing: '0.02em',
                    transition: 'background 0.15s ease, transform 0.15s ease',
                  }}
                >
                  <SkillIconArt skill={rel} size={22} />
                  <span>{rel.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        .grim-related-chip:hover {
          background: rgba(241,222,186,0.75) !important;
          transform: translateY(-1px);
        }
        .grim-related-chip:focus-visible {
          outline: 2px solid var(--accent-frost);
          outline-offset: 3px;
        }
      `}</style>
    </div>
  )
}
