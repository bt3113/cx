/**
 * The curved architecture behind a Zat world.
 *
 * In the references the background is not a flat grid — it reads as the inside
 * of a wide cylinder: vertical ribs bow outward at mid-height, horizontal
 * bands sag towards the edges, and faint bronze nodes sit where they cross.
 * It is drawn once as a static SVG and only ever moved by transform, so it
 * costs a single paint no matter how much the world parallaxes.
 */
import { useId } from 'react';
import { cn } from '@/design/cn';

const W = 1600;
const H = 900;

/** Rib x-positions as a fraction of width, mirrored around the centre. */
const RIB_OFFSETS = [0.06, 0.155, 0.255, 0.36, 0.46];
/** Horizontal band positions as a fraction of height. */
const BAND_Y = [0.1, 0.27, 0.45, 0.63, 0.82, 0.96];

export function CurvedGrid({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const id = (s: string) => `${uid}-${s}`;
  const cx = W / 2;

  const ribs: Array<{ d: string; x: number }> = [];
  for (const offset of RIB_OFFSETS) {
    for (const dir of [-1, 1] as const) {
      const mid = cx + dir * offset * W;
      // Ends pull towards the centre; the middle stays out. That difference
      // is what reads as curvature rather than perspective.
      const pull = offset * 168 * dir;
      ribs.push({
        d: `M${mid - pull},-20 C${mid - pull * 0.25},${H * 0.3} ${mid - pull * 0.25},${H * 0.7} ${mid - pull},${H + 20}`,
        x: mid,
      });
    }
  }

  const bands = BAND_Y.map((t) => {
    const y = t * H;
    // Bands sag at the edges above the horizon and lift below it.
    const sag = (t - 0.52) * 150;
    return { d: `M-20,${y + sag} Q${cx},${y - sag * 0.35} ${W + 20},${y + sag}`, y };
  });

  // Nodes sit on a sparse subset of crossings — every intersection would read
  // as a graph, not architecture.
  const nodes: Array<{ x: number; y: number; r: number }> = [];
  ribs.forEach((rib, ri) => {
    bands.forEach((band, bi) => {
      if ((ri + bi) % 3 !== 0) return;
      const t = band.y / H;
      const sag = (t - 0.52) * 150;
      const dx = (rib.x - cx) / (W / 2);
      const y = band.y + sag * dx * dx;
      nodes.push({ x: rib.x, y, r: 1.6 + (1 - Math.abs(dx)) * 1.4 });
    });
  });

  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id('rib')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8813f" stopOpacity="0" />
          <stop offset="22%" stopColor="#d8a96a" stopOpacity="0.34" />
          <stop offset="55%" stopColor="#c6944f" stopOpacity="0.2" />
          <stop offset="88%" stopColor="#8e632f" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#6e4a21" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('band')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b8813f" stopOpacity="0" />
          <stop offset="18%" stopColor="#c6944f" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#f2d9b0" stopOpacity="0.1" />
          <stop offset="82%" stopColor="#c6944f" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#b8813f" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('key')} cx="50%" cy="2%" r="62%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="45%" stopColor="#f2d9b0" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('node')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9c4" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#d8a96a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#b8813f" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Key light from just above the frame. */}
      <rect width={W} height={H} fill={`url(#${id('key')})`} />

      <g stroke={`url(#${id('rib')})`} strokeWidth="1" fill="none">
        {ribs.map((rib, i) => (
          <path key={`r${i}`} d={rib.d} />
        ))}
      </g>

      <g stroke={`url(#${id('band')})`} strokeWidth="1" fill="none">
        {bands.map((band, i) => (
          <path key={`b${i}`} d={band.d} />
        ))}
      </g>

      <g>
        {nodes.map((n, i) => (
          <circle key={`n${i}`} cx={n.x} cy={n.y} r={n.r * 5} fill={`url(#${id('node')})`} />
        ))}
        {nodes.map((n, i) => (
          <circle key={`c${i}`} cx={n.x} cy={n.y} r={n.r * 0.5} fill="#ffeed2" opacity="0.7" />
        ))}
      </g>
    </svg>
  );
}

/**
 * The lit floor the figure stands on: concentric ellipses with one bronze ring,
 * matching the dais in both reference compositions.
 */
export function Dais({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      className={cn('pointer-events-none absolute w-full', className)}
      viewBox="0 0 1200 260"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${uid}-floor`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="60%" stopColor="#d8a96a" stopOpacity="0.035" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b8813f" stopOpacity="0" />
          <stop offset="30%" stopColor="#d8a96a" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#d8a96a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#b8813f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="600" cy="130" rx="580" ry="120" fill={`url(#${uid}-floor)`} />
      <ellipse
        cx="600"
        cy="132"
        rx="330"
        ry="66"
        fill="none"
        stroke={`url(#${uid}-ring)`}
        strokeWidth="1.25"
      />
      <ellipse
        cx="600"
        cy="132"
        rx="452"
        ry="92"
        fill="none"
        stroke={`url(#${uid}-ring)`}
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}
