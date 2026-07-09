
import { categoryMeta, type Category } from '../../data/grimoire-data'

interface GrimoireSigilProps {
  activeCategory: Category | null
  size?: number
}

export default function GrimoireSigil({ activeCategory, size = 140 }: GrimoireSigilProps) {
  const meta = activeCategory ? categoryMeta[activeCategory] : null
  const primary = meta ? meta.label.toUpperCase() : 'GRIMOIRE'
  const isMultiline = primary.includes(' & ')
  const lines = isMultiline ? primary.split(' & ') : [primary]

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* Blue outer halo — wide diffuse glow beyond the ring bounds */}
      <div
        style={{
          position: 'absolute',
          inset: `-${size * 0.45}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(70,130,255,0.38) 0%, rgba(40,90,220,0.14) 50%, transparent 72%)',
          filter: 'blur(10px)',
          animation: 'frost-pulse 2.6s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Blue inner core glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(140,190,255,0.55) 0%, rgba(80,150,255,0.28) 40%, transparent 68%)',
          filter: 'blur(4px)',
          pointerEvents: 'none',
        }}
      />

      {/* Outer ink ring — glowing blue edge */}
      <div
        style={{
          position: 'absolute',
          width: size * 0.86,
          height: size * 0.86,
          borderRadius: '50%',
          border: '1.5px solid rgba(58,42,24,0.65)',
          boxShadow: '0 0 6px rgba(80,140,255,0.45), inset 0 0 6px rgba(80,140,255,0.25)',
        }}
      />

      {/* Inner dashed ink ring */}
      <div
        style={{
          position: 'absolute',
          width: size * 0.78,
          height: size * 0.78,
          borderRadius: '50%',
          border: '1px dashed rgba(58,42,24,0.40)',
          boxShadow: '0 0 4px rgba(80,140,255,0.30)',
        }}
      />

      {/* Cardinal rune flourishes */}
      {[
        { rune: 'ᛟ', deg: 0 },
        { rune: 'ᛚ', deg: 90 },
        { rune: 'ᚱ', deg: 180 },
        { rune: 'ᛞ', deg: 270 },
      ].map(({ rune, deg }) => (
        <div
          key={deg}
          style={{
            position: 'absolute',
            width: size * 0.82,
            height: size * 0.82,
            transform: `rotate(${deg}deg)`,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              transform: `translate(-50%, -50%) rotate(${-deg}deg)`,
              fontFamily: 'var(--font-display)',
              fontSize: size * 0.075,
              color: '#2a1c10',
              opacity: 0.7,
              lineHeight: 1,
              textShadow: '0 0 6px rgba(80,140,255,0.5)',
            }}
          >
            {rune}
          </span>
        </div>
      ))}

      {/* Text content (label) — keyed remount triggers CSS fade-in */}
      <div
        key={activeCategory ?? 'default'}
        className="sigil-label"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          padding: `0 ${size * 0.12}px`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMultiline ? size * 0.085 : size * 0.105,
            fontWeight: 700,
            lineHeight: 1.05,
            color: '#1af',
            letterSpacing: '0.08em',
            textShadow: '0 0 1px #001, 1px 0 1px #001, -1px 0 1px #001, 0 1px 1px #001, 0 -1px 1px #001, 0 0 8px #2af, 0 0 18px #07f, 0 0 32px #05d',
          }}
        >
          {lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      <style>{`
        .sigil-label {
          animation: sigil-fade-in 0.22s ease both;
        }
        @keyframes sigil-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sigil-label { animation: none; }
        }
      `}</style>
    </div>
  )
}
