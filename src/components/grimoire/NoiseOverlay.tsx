
export default function NoiseOverlay() {
  return (
    <>
      {/* Subtle light vignette — absolute, so it stays on the page sheet and
          off the footer revealed beneath it */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(60,100,130,0.18) 100%)',
        }}
      />

      {/* Frost grain overlay — pre-rasterized noise tile. This used to be a
          live SVG filter (filter: url(#grain)) over the full viewport, which
          recomposited every scroll frame and stuttered on mobile; a tiled
          background image rasterizes once and costs nothing after that. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 3,
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='g' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23g)'/></svg>")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '140px 140px',
        }}
      />
    </>
  )
}
