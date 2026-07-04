import { useEffect, useState, type CSSProperties } from 'react';
import { REDUCED } from '../lib/motion';

/** how long the first (real) tagline sits before the cycle starts */
const FIRST_HOLD_MS = 5200;
/** how long each subsequent line sits fully typed */
const HOLD_MS = 3800;
/** per-character writing speed */
const TYPE_MS = 55;
/** eraser sweep: number of scrub steps and time per step */
const ERASE_STEPS = 30;
const ERASE_STEP_MS = 55;
/** beat of blank line between erasing and writing the next line */
const SWAP_PAUSE_MS = 420;

type Phase = 'idle' | 'erasing' | 'writing';

interface Props {
  lines: string[];
  style?: CSSProperties;
}

/**
 * Cycles through `lines`: hold, scrub the line away with a pixel eraser
 * (left to right, text wiped behind it), pause, write the next line out
 * char-by-char. Static (first line only) under prefers-reduced-motion.
 */
export default function CyclingTagline({ lines, style }: Props) {
  const [line, setLine] = useState(0);
  const [typed, setTyped] = useState(lines[0]?.length ?? 0);
  const [eraseStep, setEraseStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (lines.length < 2 || REDUCED()) return;
    let timer = 0;
    let current = 0;

    const schedule = (fn: () => void, ms: number) => {
      timer = window.setTimeout(fn, ms);
    };

    const erase = (step: number) => {
      setEraseStep(step);
      if (step < ERASE_STEPS) {
        setPhase('erasing');
        schedule(() => erase(step + 1), ERASE_STEP_MS);
      } else {
        // line fully scrubbed: swap to the next one and get ready to write
        current = (current + 1) % lines.length;
        setLine(current);
        setTyped(0);
        setPhase('writing');
        schedule(() => write(1), SWAP_PAUSE_MS);
      }
    };

    const write = (pos: number) => {
      setTyped(pos);
      if (pos < lines[current].length) {
        schedule(() => write(pos + 1), TYPE_MS);
      } else {
        setPhase('idle');
        schedule(() => erase(1), HOLD_MS);
      }
    };

    schedule(() => erase(1), FIRST_HOLD_MS);
    return () => clearTimeout(timer);
  }, [lines]);

  const erasing = phase === 'erasing';
  /** erase progress 0..1: how far the eraser has swept across the line */
  const progress = erasing ? eraseStep / ERASE_STEPS : 0;

  return (
    <span style={style}>
      {/* screen readers get the stable real tagline, not the churn */}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>
        {lines[0]}
      </span>
      <span aria-hidden="true" style={{ position: 'relative', display: 'inline-block' }}>
        <span
          style={erasing ? {
            clipPath: `inset(-4px 0 -4px ${progress * 100}%)`,
            transition: `clip-path ${ERASE_STEP_MS}ms linear`,
          } : undefined}
        >
          {erasing ? lines[line] : lines[line].slice(0, typed)}
        </span>
        {erasing && (
          <span
            className="tagline-eraser"
            style={{
              left: `${progress * 100}%`,
              // scrubbing wobble: bob up/down and tilt every couple of steps
              transform: `translate(-50%, ${Math.floor(eraseStep / 2) % 2 ? -3 : 1}px) rotate(${Math.floor(eraseStep / 2) % 2 ? -6 : 5}deg)`,
              transition: `left ${ERASE_STEP_MS}ms linear, transform ${ERASE_STEP_MS * 2}ms ease-in-out`,
            }}
          />
        )}
      </span>
      {!erasing && (
        <span aria-hidden="true" className={phase === 'idle' ? 'tw-cursor tw-cursor-blink' : 'tw-cursor'} />
      )}
    </span>
  );
}
