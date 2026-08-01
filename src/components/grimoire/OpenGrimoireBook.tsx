import type { ReactNode } from 'react';

interface OpenGrimoireBookProps {
  leftPage?: ReactNode;
  rightPage?: ReactNode;
}

const ASPECT = 1774 / 887; // new 2:1 SVG

export default function OpenGrimoireBook({ leftPage, rightPage }: OpenGrimoireBookProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: 'min(98vw, 190vh, 1500px)',
        aspectRatio: `${ASPECT}`,
        margin: '0 auto',
      }}
    >
      <img
        src="/open-grimoire.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
          filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.65))',
        }}
      />

      {/* Left page slot — center of left parchment at ~26% x, 50% y on 1774x887 SVG */}
      <div
        style={{
          position: 'absolute',
          left: `${(532 / 1774) * 100}%`,
          top: `${(443 / 887) * 100}%`,
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {leftPage}
        </div>
      </div>

      {/* Right page slot — center mirrors left page on 1774x887 SVG (1774 - 532 = 1242, y=443) */}
      <div
        style={{
          position: 'absolute',
          left: `${(1242 / 1774) * 100}%`,
          top: `${(443 / 887) * 100}%`,
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto',
          }}
        >
          {rightPage}
        </div>
      </div>
    </div>
  );
}
