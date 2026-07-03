
export default function NoiseOverlay() {
  return (
    <>
      {/* SVG noise filter definition */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          <filter
            id="grain"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" result="blend" mode="multiply" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* Subtle light vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(60,100,130,0.18) 100%)',
        }}
      />

      {/* Frost grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 3,
          opacity: 0.03,
          filter: 'url(#grain)',
          background: '#a8c8e0',
        }}
      />
    </>
  )
}
