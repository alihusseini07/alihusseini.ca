# Grimoire Skills Book — Recreation Guide

Standalone copy of the portfolio's Grimoire page: open-book SVG, 3-ring orbiting skill icons, detail panel, page-transition system.

## 1. Scaffold project

```bash
npx create-next-app@latest grimoire-recreate --typescript --tailwind --app --no-src-dir
cd grimoire-recreate
```

## 2. Install deps

```bash
npm install framer-motion@^12.0.0 devicon@^2.17.0 simple-icons@^16.18.1
```

Full `package.json` in this folder — copy `dependencies`/`devDependencies` over, or just `npm install` in this folder directly (already has script `dev`).

## 3. Copy files into place

From this folder into project root, preserving paths:

```
app/layout.tsx           → root layout, wraps children in <TransitionProvider>, loads fonts
app/globals.css          → global styles (font vars, base resets)
app/grimoire/page.tsx    → the page itself

components/GrimoireBookShell.tsx    → top-level state machine (mobile/desktop, open/closed panel)
components/OpenGrimoireBook.tsx     → renders public/open-grimoire.svg as book frame
components/GrimoireOrbits.tsx       → 3-ring orbit rig, positions rings around sigil
components/GrimoireRing.tsx         → single ring: ink-rail SVG + orbiting skill icons
components/GrimoireSigil.tsx        → center seal / category label
components/GrimoireDetailPanel.tsx  → slide-in panel when a skill is clicked
components/SkillIcon.tsx            → icon button wrapper (hover/click/glow states, portal for tooltip)
components/SkillIconArt.tsx         → renders simple-icons SVG path OR <img> for custom icons
components/TransitionLink.tsx       → <Link> replacement that triggers page-transition overlay
components/TransitionProvider.tsx   → context + framer-motion page transition orchestration
components/DescentOverlay.tsx       → the "descent" wipe animation shown between routes
components/NoiseOverlay.tsx         → fixed film-grain overlay, sits above <body>

lib/grimoire-data.ts     → skill list, categories, related-skill graph, icon sources

public/open-grimoire.svg → book artwork
public/icons/*.svg       → custom icons not in simple-icons/devicon (AWS, CAD tools, etc.)

tailwind.config.ts, postcss.config.mjs, next.config.ts, tsconfig.json → drop-in configs
```

## 4. Wire root layout

`app/layout.tsx` must load two Next fonts and expose them as CSS vars, then wrap `children` in `<NoiseOverlay />` + `<TransitionProvider>`:

```tsx
const pixelifySans = Pixelify_Sans({ subsets: ['latin'], weight: ['400','700'], variable: '--font-display' })
const vt323 = VT323({ subsets: ['latin'], weight: ['400'], variable: '--font-mono' })
```

`globals.css` references `var(--font-display)` — keep the variable names matching.

## 5. Icon system — how it resolves

`lib/grimoire-data.ts` defines each skill's icon as one of:

- `fromSi(siXxx)` — pulls `path` + `hex` straight from the `simple-icons` npm package (no files needed, tree-shaken import).
- `img('/icons/whatever.svg')` — points at a static file in `public/icons/`, used when no simple-icons entry exists (Java, SQL, AWS services, SwiftUI, CAD tools, Playwright, Excel, NetSuite/SuiteCloud/SuiteScript).

`SkillIconArt.tsx` branches on `skill.icon.kind`: renders an inline `<svg><path/></svg>` colored by hex for `'simple'`, or an `<img>` tag for `'image'`. All 18 custom SVGs are already copied to `public/icons/` in this folder — no further sourcing needed.

## 6. Run it

```bash
npm run dev
# http://localhost:3000/grimoire
```

## Notes / gotchas

- `reactStrictMode: false` in `next.config.ts` — double-invoke breaks a canvas loop elsewhere in the original site; harmless to keep here.
- `GrimoireBookShell` exports `useIsMobile` — used to switch orbit layout at narrow viewports.
- Skill `related` arrays drive the hover-highlight lines between icons; unresolved names are silently skipped, so keep names in sync if you edit the list.
- Page transitions (`TransitionLink` + `TransitionProvider` + `DescentOverlay`) are optional — if you just want the book/orbit animation without route-transition FX, drop those three files and use a plain `next/link` in `page.tsx` instead.
