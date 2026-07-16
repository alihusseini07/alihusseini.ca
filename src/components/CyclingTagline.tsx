import { useEffect, useState, type CSSProperties } from 'react';
import { REDUCED } from '../lib/motion';

/** how long the first (real) tagline sits before the cycle starts */
const FIRST_HOLD_MS = 5200;
/** how long each subsequent line sits fully typed */
const HOLD_MS = 3800;
/** per-character writing speed */
const TYPE_MS = 55;
/** full duration of one eraser sweep across the line */
const ERASE_MS = 1400;
/** width of the soft fade band at the erase frontier */
const FADE_PX = 12;
/** beat of blank line between erasing and writing the next line */
const SWAP_PAUSE_MS = 420;

type Phase = 'idle' | 'erasing' | 'writing';

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const shuffle = (items: number[]) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

interface Props {
  lines: string[];
  style?: CSSProperties;
}

/**
 * Cycles through `lines`: hold, sweep an eraser across the line (left to
 * right, text fading out behind a soft mask edge), pause, write the next
 * line out char-by-char. The sweep runs on requestAnimationFrame with an
 * eased position. Static (first line only) under prefers-reduced-motion.
 */
export default function CyclingTagline({ lines, style }: Props) {
  const [line, setLine] = useState(0);
  const [typed, setTyped] = useState(lines[0]?.length ?? 0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (lines.length < 2 || REDUCED()) return;
    let timer = 0;
    let raf = 0;
    let current = 0;
    let queue = shuffle(lines.map((_, index) => index).filter((index) => index !== current));

    const schedule = (fn: () => void, ms: number) => {
      timer = window.setTimeout(fn, ms);
    };

    const pickNextLine = (currentLine: number) => {
      if (queue.length === 0) {
        queue = shuffle(lines.map((_, index) => index).filter((index) => index !== currentLine));
      }
      return queue.shift() ?? currentLine;
    };

    const erase = () => {
      setProgress(0);
      setPhase('erasing');
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / ERASE_MS, 1);
        setProgress(t);
        if (t < 1) {
          raf = window.requestAnimationFrame(tick);
        } else {
          // line fully scrubbed: swap to a random new line and get ready to write
          current = pickNextLine(current);
          setLine(current);
          setTyped(0);
          setPhase('writing');
          schedule(() => write(1), SWAP_PAUSE_MS);
        }
      };
      raf = window.requestAnimationFrame(tick);
    };

    const write = (pos: number) => {
      setTyped(pos);
      if (pos < lines[current].length) {
        schedule(() => write(pos + 1), TYPE_MS);
      } else {
        setPhase('idle');
        schedule(erase, HOLD_MS);
      }
    };

    schedule(erase, FIRST_HOLD_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [lines]);

  const erasing = phase === 'erasing';
  /** eased sweep position 0..1 */
  const eased = erasing ? easeInOutSine(progress) : 0;
  /**
   * erase frontier: runs from FADE_PX before the left edge to FADE_PX past
   * the right edge so the fade band fully clears both ends of the line
   */
  const frontier = `${(eased * 100).toFixed(3)}% + ${((eased * 2 - 1) * FADE_PX).toFixed(2)}px`;
  const mask = `linear-gradient(to right, transparent calc(${frontier}), #000 calc(${frontier} + ${FADE_PX}px))`;
  /** slight up/down drift, 1.5 gentle waves stretched across the sweep */
  const drift = Math.sin(eased * Math.PI * 3) * 2.5;

  return (
    <span style={style}>
      {/* screen readers get the stable real tagline, not the churn */}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>
        {lines[0]}
      </span>
      <span aria-hidden="true" style={{ position: 'relative', display: 'inline-block' }}>
        <span style={erasing ? { WebkitMaskImage: mask, maskImage: mask } : undefined}>
          {erasing ? lines[line] : lines[line].slice(0, typed)}
        </span>
        {erasing && (
          <span
            className="tagline-eraser"
            style={{
              left: `calc(${frontier})`,
              transform: `translate(-30%, ${drift.toFixed(2)}px)`,
            }}
          />
        )}
      </span>
    </span>
  );
}
