'use client'

import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import DescentOverlay, { type Direction } from './DescentOverlay'

const Ctx = createContext<{ navigate: (href: string) => void }>({ navigate: () => {} })
export const useNavigate = () => useContext(Ctx).navigate

type Phase = 'idle' | 'fade_to_black' | 'navigate' | 'fade_from_black'

const FADE_TO_BLACK_MS = 440
const FADE_FROM_BLACK_MS = 360
const DESCENT_COVER_MS = 380
const DESCENT_REVEAL_MS = 370
const ROUTE_SETTLE_MS = 80
const PATHNAME_WAIT_TIMEOUT_MS = 1400
const PHASE_TIMEOUT_PAD_MS = 220

const normalizePath = (path: string) => {
  const cleaned = path.replace(/\/+$/, '')
  return cleaned === '' ? '/' : cleaned
}

const deriveDirection = (from: string, to: string): Direction => {
  const f = normalizePath(from)
  const t = normalizePath(to)
  if (f === '/' && t === '/adventure') return 'descend'
  if (f === '/adventure' && t === '/') return 'ascend'
  return 'fade'
}

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('idle')
  const [direction, setDirection] = useState<Direction>('fade')
  const [targetHref, setTargetHref] = useState<string | null>(null)
  const pushIssuedRef = useRef(false)

  const coverMs = direction === 'fade' ? FADE_TO_BLACK_MS : DESCENT_COVER_MS
  const revealMs = direction === 'fade' ? FADE_FROM_BLACK_MS : DESCENT_REVEAL_MS

  const overlayVariants = useMemo<Variants>(() => {
    if (direction !== 'fade') {
      // Black overlay disabled when descent overlay is active
      return {
        idle: { opacity: 0, transition: { duration: 0.001 } },
        fade_to_black: { opacity: 0, transition: { duration: 0.001 } },
        navigate: { opacity: 0, transition: { duration: 0.001 } },
        fade_from_black: { opacity: 0, transition: { duration: 0.001 } },
      }
    }
    return {
      idle: {
        opacity: 0,
        filter: 'blur(0px)',
        transition: { duration: reduceMotion ? 0.01 : 0.2, ease: [0.4, 0, 0.2, 1] },
      },
      fade_to_black: {
        opacity: 1,
        filter: 'blur(2px)',
        transition: { duration: reduceMotion ? 0.01 : FADE_TO_BLACK_MS / 1000, ease: [0.22, 1, 0.36, 1] },
      },
      navigate: {
        opacity: 1,
        filter: 'blur(2px)',
        transition: { duration: 0.01, ease: 'linear' },
      },
      fade_from_black: {
        opacity: 0,
        filter: 'blur(0px)',
        transition: { duration: reduceMotion ? 0.01 : FADE_FROM_BLACK_MS / 1000, ease: [0, 0, 0.2, 1] },
      },
    }
  }, [direction, reduceMotion])

  const contentVariants = useMemo<Variants>(() => {
    const isDescent = direction !== 'fade'
    // Outgoing direction: descend → page slides up; ascend → page slides down
    const outY = isDescent
      ? (direction === 'descend' ? '-30vh' : '30vh')
      : 0

    return {
      idle: {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0.01 : 0.24, ease: [0, 0, 0.2, 1] },
      },
      fade_to_black: {
        opacity: 0,
        filter: isDescent ? 'blur(4px)' : 'blur(6px)',
        scale: isDescent ? 1 : 1.01,
        y: reduceMotion ? 0 : outY,
        transition: {
          duration: reduceMotion ? 0.01 : (coverMs - 70) / 1000,
          ease: [0.4, 0, 1, 1],
        },
      },
      navigate: {
        // Snap back to neutral while screen is fully covered by strata —
        // route has switched and incoming page should not inherit the outgoing translate.
        opacity: 0,
        filter: 'blur(0px)',
        scale: 1,
        y: 0,
        transition: { duration: 0.001, ease: 'linear' },
      },
      fade_from_black: {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        y: 0,
        transition: {
          duration: reduceMotion ? 0.01 : revealMs / 1000,
          ease: [0.2, 0.7, 0.3, 1],
        },
      },
    }
  }, [direction, reduceMotion, coverMs, revealMs])

  const beginNavigate = useCallback((href: string) => {
    if (!href) return

    try {
      router.push(href)
      pushIssuedRef.current = true
    } catch {
      setPhase('fade_from_black')
    }
  }, [router])

  const navigate = useCallback((href: string) => {
    if (phase !== 'idle') return

    const target = normalizePath(href)
    if (normalizePath(pathname) === target) {
      router.push(href)
      return
    }

    const dir = deriveDirection(pathname ?? '/', href)
    setDirection(dir)
    setTargetHref(href)
    router.push(href)
    pushIssuedRef.current = true
    setPhase('fade_to_black')
  }, [phase, pathname, router])

  useEffect(() => {
    if (phase !== 'fade_to_black') return

    const timeout = window.setTimeout(() => {
      setPhase((current) => (current === 'fade_to_black' ? 'navigate' : current))
    }, (reduceMotion ? 10 : coverMs) + PHASE_TIMEOUT_PAD_MS)

    return () => window.clearTimeout(timeout)
  }, [phase, reduceMotion, coverMs])

  useEffect(() => {
    if (phase !== 'navigate' || !targetHref || pushIssuedRef.current) return
    beginNavigate(targetHref)
  }, [beginNavigate, phase, targetHref])

  useEffect(() => {
    if (phase !== 'navigate' || !targetHref) return
    if (normalizePath(pathname) !== normalizePath(targetHref)) return

    const timer = window.setTimeout(() => {
      setPhase('fade_from_black')
    }, reduceMotion ? 0 : ROUTE_SETTLE_MS)

    return () => window.clearTimeout(timer)
  }, [pathname, phase, reduceMotion, targetHref])

  useEffect(() => {
    if (phase !== 'navigate') return

    const timeout = window.setTimeout(() => {
      setPhase((current) => (current === 'navigate' ? 'fade_from_black' : current))
    }, reduceMotion ? 10 : PATHNAME_WAIT_TIMEOUT_MS)

    return () => window.clearTimeout(timeout)
  }, [phase, reduceMotion])

  useEffect(() => {
    if (phase !== 'fade_from_black') return

    const timeout = window.setTimeout(() => {
      setTargetHref(null)
      pushIssuedRef.current = false
      setPhase((current) => (current === 'fade_from_black' ? 'idle' : current))
      setDirection('fade')
    }, (reduceMotion ? 10 : revealMs) + PHASE_TIMEOUT_PAD_MS)

    return () => window.clearTimeout(timeout)
  }, [phase, reduceMotion, revealMs])

  const onOverlayAnimationComplete = useCallback(() => {
    if (direction !== 'fade') return // descent overlay handles its own completion timing
    if (phase === 'fade_to_black') {
      setPhase('navigate')
      return
    }

    if (phase === 'fade_from_black') {
      setTargetHref(null)
      pushIssuedRef.current = false
      setPhase('idle')
      return
    }
  }, [phase, direction])

  return (
    <Ctx.Provider value={{ navigate }}>
      <motion.div
        variants={contentVariants}
        animate={phase}
        initial={false}
        style={{
          position: 'fixed',
          inset: 0,
          overflowY: 'auto',
          zIndex: 10,
          willChange: 'opacity, filter, transform',
        }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={overlayVariants}
        animate={phase}
        initial={false}
        onAnimationComplete={onOverlayAnimationComplete}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#000',
          pointerEvents: 'none',
          willChange: 'opacity, filter',
        }}
      />
      <DescentOverlay phase={phase} direction={direction} reduceMotion={reduceMotion} />
    </Ctx.Provider>
  )
}
