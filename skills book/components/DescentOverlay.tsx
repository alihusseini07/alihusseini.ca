'use client'

import { motion, type Variants } from 'framer-motion'
import { useMemo } from 'react'

export type DescentPhase = 'idle' | 'fade_to_black' | 'navigate' | 'fade_from_black'
export type Direction = 'descend' | 'ascend' | 'fade'

const COVER_MS = 380
const REVEAL_MS = 370

interface Props {
  phase: DescentPhase
  direction: Direction
  reduceMotion: boolean | null
}

export default function DescentOverlay({ phase, direction, reduceMotion }: Props) {
  const stripVariants = useMemo<Variants>(() => {
    if (direction === 'fade') {
      return { idle: {}, fade_to_black: {}, navigate: {}, fade_from_black: {} }
    }

    const isDescend = direction === 'descend'
    const cover = reduceMotion ? 0.01 : COVER_MS / 1000
    const reveal = reduceMotion ? 0.01 : REVEAL_MS / 1000

    // Strip is 300vh tall, 5 strata × 60vh each (top→bottom: grass | topsoil | dirt | rock | cave).
    // Descend: camera goes down, strata flow up → strip translates from y=0% (grass in view)
    //          through y=-33% (dirt midway) to y=-66.6% (cave in view).
    // Ascend: reverse — start with cave (y=-66.6%), end with grass (y=0%).
    const startY = isDescend ? '0%' : '-66.6%'
    const midY = '-33%'
    const endY = isDescend ? '-66.6%' : '0%'

    return {
      idle: {
        y: startY,
        opacity: 0,
        transition: { duration: 0.001 },
      },
      fade_to_black: {
        y: [startY, midY],
        opacity: [0, 1, 1],
        transition: {
          duration: cover,
          ease: 'linear',
          y: { duration: cover, ease: [0.4, 0, 0.7, 0.4] },
          opacity: { duration: cover, ease: [0, 0, 0.2, 1], times: [0, 0.3, 1] },
        },
      },
      navigate: {
        y: midY,
        opacity: 1,
        transition: { duration: 0.001 },
      },
      fade_from_black: {
        y: [midY, endY],
        opacity: [1, 1, 0],
        transition: {
          duration: reveal,
          ease: 'linear',
          y: { duration: reveal, ease: [0.3, 0.6, 0.4, 1] },
          opacity: { duration: reveal, ease: [0.4, 0, 1, 1], times: [0, 0.55, 1] },
        },
      },
    }
  }, [direction, reduceMotion])

  if (direction === 'fade') return null

  return (
    <motion.div
      variants={stripVariants}
      animate={phase}
      initial={false}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        height: '300vh',
        zIndex: 9998,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    >
      <div className="descent-strip">
        <div className="stratum stratum-grass" />
        <div className="stratum stratum-topsoil" />
        <div className="stratum stratum-dirt" />
        <div className="stratum stratum-rock" />
        <div className="stratum stratum-cave" />
      </div>

      <style>{`
        .descent-strip {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
        }
        .stratum {
          flex: 0 0 60vh;
          width: 100%;
          position: relative;
        }
        /* Stratum 0 — turf and grass roots fading to topsoil */
        .stratum-grass {
          background:
            linear-gradient(to bottom,
              #2d5a1f 0%,
              #2a4a18 18%,
              #3d2818 70%,
              #2a1a0d 100%);
        }
        .stratum-grass::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 10%, rgba(80,140,45,0.45), transparent 40%),
            radial-gradient(ellipse at 70% 5%, rgba(60,120,35,0.35), transparent 35%),
            radial-gradient(circle at 35% 60%, rgba(20,15,8,0.5) 1px, transparent 3px),
            radial-gradient(circle at 65% 75%, rgba(20,15,8,0.5) 1px, transparent 3px);
          background-size: 100% 100%, 100% 100%, 14vh 14vh, 18vh 18vh;
        }
        /* Stratum 1 — dirt with embedded pebbles */
        .stratum-topsoil {
          background:
            linear-gradient(to bottom,
              #2a1a0d 0%,
              #1f140a 50%,
              #1a1008 100%);
        }
        .stratum-topsoil::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 15% 30%, rgba(60,40,25,0.6) 2px, transparent 5px),
            radial-gradient(circle at 50% 20%, rgba(70,45,28,0.5) 3px, transparent 6px),
            radial-gradient(circle at 80% 60%, rgba(55,35,22,0.55) 2px, transparent 5px),
            radial-gradient(circle at 30% 75%, rgba(65,42,26,0.5) 2.5px, transparent 5px),
            radial-gradient(circle at 70% 85%, rgba(50,32,20,0.6) 2px, transparent 4px);
          background-size: 12vh 12vh, 18vh 18vh, 16vh 16vh, 14vh 14vh, 20vh 20vh;
        }
        /* Stratum 2 — denser rock layer */
        .stratum-dirt {
          background:
            linear-gradient(to bottom,
              #1a1008 0%,
              #14100c 50%,
              #100c10 100%);
        }
        .stratum-dirt::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 25% 40%, rgba(45,40,45,0.5) 4px, transparent 10px),
            radial-gradient(ellipse at 60% 25%, rgba(50,45,50,0.45) 5px, transparent 12px),
            radial-gradient(ellipse at 85% 65%, rgba(40,38,42,0.55) 4px, transparent 9px),
            radial-gradient(ellipse at 40% 80%, rgba(48,42,48,0.5) 5px, transparent 11px);
          background-size: 22vh 22vh, 28vh 28vh, 24vh 24vh, 26vh 26vh;
        }
        /* Stratum 3 — deep rock, near-black with cool tint */
        .stratum-rock {
          background:
            linear-gradient(to bottom,
              #100c10 0%,
              #0a0a14 50%,
              #06080f 100%);
        }
        .stratum-rock::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(30,35,50,0.4) 6px, transparent 14px),
            radial-gradient(ellipse at 75% 55%, rgba(25,32,48,0.45) 7px, transparent 16px),
            radial-gradient(ellipse at 50% 90%, rgba(20,28,45,0.5) 5px, transparent 12px);
          background-size: 30vh 30vh, 35vh 35vh, 28vh 28vh;
        }
        /* Stratum 4 — cave-mouth glow, blends into adventure palette */
        .stratum-cave {
          background:
            radial-gradient(ellipse at 50% 80%, rgba(80,180,220,0.35) 0%, rgba(40,90,130,0.18) 30%, rgba(5,8,15,0.95) 65%),
            linear-gradient(to bottom,
              #06080f 0%,
              #060914 30%,
              #050a18 60%,
              #04081a 100%);
        }
      `}</style>
    </motion.div>
  )
}
