/**
 * Cinematic landscape art for Space covers and story backgrounds.
 *
 * Layered ridgelines with atmospheric perspective — each layer further back is
 * hazier and lower in contrast — plus a light source, fog bands and grain.
 * That combination is what makes a flat gradient read as photographic depth.
 */
import { alpha, blur, grain, linear, mix, radial, rng, spline, svg } from './lib/svg.ts';

export type ScenePalette = {
  skyTop: string;
  skyHorizon: string;
  sun: string;
  ridge: string;
  haze: string;
  /** Present for water scenes. */
  water?: string;
  sunY?: number;
};

export const SCENES = {
  'dawn-peaks': {
    skyTop: '#160f14',
    skyHorizon: '#c2632a',
    sun: '#ffb765',
    ridge: '#1a1620',
    haze: '#8d5a3c',
    sunY: 0.62,
  },
  'amber-range': {
    skyTop: '#1b0f0a',
    skyHorizon: '#d4712c',
    sun: '#ffc27a',
    ridge: '#2a1410',
    haze: '#b0603a',
    sunY: 0.55,
  },
  'fog-ridge': {
    skyTop: '#0d1014',
    skyHorizon: '#5c6b78',
    sun: '#b9c8d4',
    ridge: '#151a20',
    haze: '#68788a',
    sunY: 0.5,
  },
  'cold-summit': {
    skyTop: '#0a0f16',
    skyHorizon: '#46596e',
    sun: '#cddcea',
    ridge: '#121821',
    haze: '#5d7288',
    sunY: 0.46,
  },
  ocean: {
    skyTop: '#0b1116',
    skyHorizon: '#6e8794',
    sun: '#cfe0e6',
    ridge: '#10181e',
    haze: '#7b949f',
    water: '#16323c',
    sunY: 0.42,
  },
  'desert-dusk': {
    skyTop: '#180f14',
    skyHorizon: '#b96b45',
    sun: '#ffc999',
    ridge: '#241519',
    haze: '#9c6047',
    sunY: 0.58,
  },
  'night-glass': {
    skyTop: '#07090e',
    skyHorizon: '#243347',
    sun: '#93b2d6',
    ridge: '#0c1118',
    haze: '#35506e',
    sunY: 0.4,
  },
  forest: {
    skyTop: '#0a1010',
    skyHorizon: '#4a6354',
    sun: '#bcd2be',
    ridge: '#101a16',
    haze: '#54705e',
    sunY: 0.48,
  },
} satisfies Record<string, ScenePalette>;

export type SceneKind = keyof typeof SCENES;

/**
 * Mountain silhouette by midpoint displacement.
 *
 * Splining a handful of random points gives rolling hills; recursive
 * displacement with a decaying roughness gives the self-similar jaggedness
 * that actually reads as a mountain range.
 */
function ridgeLine(
  w: number,
  baseY: number,
  amp: number,
  seed: number,
  roughness: number,
  depth = 6,
): Array<[number, number]> {
  const r = rng(seed);
  let pts: Array<[number, number]> = [
    [-60, baseY + amp * 0.35],
    [w * 0.46, baseY - amp],
    [w + 60, baseY + amp * 0.2],
  ];

  for (let d = 0; d < depth; d++) {
    const next: Array<[number, number]> = [pts[0]!];
    const scale = amp * roughness * Math.pow(0.56, d);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]!;
      const b = pts[i + 1]!;
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2 + (r() - 0.5) * 2 * scale;
      next.push([mx, my], b);
    }
    pts = next;
  }
  return pts;
}

/** Straight-segment path — sharp corners are the point. */
function polyline(pts: Array<[number, number]>): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
}

export function sceneSvg(kind: SceneKind, w: number, h: number, seed = 11): string {
  const p: ScenePalette = SCENES[kind];
  const horizon = h * (p.sunY ?? 0.5);
  const isWater = Boolean(p.water);

  const defs: string[] = [
    linear(
      'sky',
      [
        { offset: 0, color: p.skyTop },
        { offset: 0.55, color: mix(p.skyTop, p.skyHorizon, 0.45) },
        { offset: 1, color: p.skyHorizon },
      ],
      { x1: 0, y1: 0, x2: 0.15, y2: 1 },
    ),
    radial(
      'sunglow',
      [
        { offset: 0, color: p.sun, opacity: 0.85 },
        { offset: 0.35, color: p.sun, opacity: 0.25 },
        { offset: 1, color: p.sun, opacity: 0 },
      ],
      { cx: 0.52, cy: (p.sunY ?? 0.5) - 0.02, r: 0.55 },
    ),
    grain('sc-grain', 0.06, 0.9),
    blur('sc-b', 26),
    blur('sc-b2', 9),
    linear(
      'vig',
      [
        { offset: 0, color: '#000000', opacity: 0 },
        { offset: 0.55, color: '#000000', opacity: 0.12 },
        { offset: 1, color: '#000000', opacity: 0.82 },
      ],
      { x1: 0, y1: 0, x2: 0, y2: 1 },
    ),
  ];

  const body: string[] = [
    `<rect width="${w}" height="${h}" fill="url(#sky)"/>`,
    `<rect width="${w}" height="${h}" fill="url(#sunglow)"/>`,
    // The light source itself, just above the horizon.
    `<ellipse cx="${w * 0.52}" cy="${horizon - h * 0.015}" rx="${w * 0.1}" ry="${h * 0.05}" fill="${alpha(p.sun, 0.55)}" filter="url(#sc-b)"/>`,
  ];

  // Ridge layers, far → near. Each nearer layer is darker and higher contrast;
  // each further layer washes towards the haze colour (aerial perspective).
  const layers = isWater ? 3 : 5;
  for (let i = 0; i < layers; i++) {
    const depth = 1 - i / layers; // 1 = furthest
    const baseY = horizon + h * (isWater ? 0.01 : 0.055) * i + h * 0.015;
    const amp = h * (isWater ? 0.07 : 0.3) * (0.42 + depth * 0.85);
    const colour = mix(p.ridge, p.haze, depth * 0.78);
    const pts = ridgeLine(w, baseY, amp, seed + i * 131, isWater ? 0.35 : 0.62);
    const d = polyline(pts) + `L${w + 60},${h + 60} L-60,${h + 60} Z`;

    body.push(`<path d="${d}" fill="${colour}" opacity="${(0.72 + i * 0.07).toFixed(2)}"/>`);

    // Lit edge along the ridge crest — the detail that sells it as a mountain
    // rather than a silhouette. Strongest on the near layers.
    if (!isWater) {
      body.push(
        `<path d="${polyline(pts)}" fill="none" stroke="${alpha(
          mix(p.sun, p.haze, 0.35),
          0.16 + (1 - depth) * 0.3,
        )}" stroke-width="${(1 + (1 - depth) * 1.6).toFixed(1)}" stroke-linejoin="round"/>`,
      );
    }

    // Fog settling into the base of each ridge.
    body.push(
      `<rect x="0" y="${baseY - amp * 0.08}" width="${w}" height="${h * 0.16}" fill="${alpha(p.haze, 0.13 * depth + 0.04)}" filter="url(#sc-b)"/>`,
    );
  }

  if (isWater) {
    const waterY = horizon + h * 0.06;
    defs.push(
      linear(
        'water',
        [
          { offset: 0, color: mix(p.water!, p.haze, 0.45) },
          { offset: 0.35, color: p.water! },
          { offset: 1, color: mix(p.water!, '#000000', 0.62) },
        ],
        { x1: 0, y1: 0, x2: 0, y2: 1 },
      ),
    );
    body.push(
      `<rect x="0" y="${waterY}" width="${w}" height="${h - waterY}" fill="url(#water)"/>`,
      // Sun reflection column.
      `<ellipse cx="${w * 0.52}" cy="${waterY + h * 0.06}" rx="${w * 0.07}" ry="${h * 0.09}" fill="${alpha(p.sun, 0.22)}" filter="url(#sc-b)"/>`,
    );
    // Foam lines, wider and brighter as they approach the viewer.
    const r = rng(seed + 7);
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const y = waterY + (h - waterY) * (0.18 + t * 0.78);
      const pts: Array<[number, number]> = [];
      for (let x = -20; x <= w + 20; x += w / 7) {
        pts.push([x, y + Math.sin((x / w) * 6 + i) * h * 0.008 * (0.4 + t) + (r() - 0.5) * 4]);
      }
      body.push(
        `<path d="${spline(pts)}" fill="none" stroke="${alpha('#eaf4f6', 0.1 + t * 0.4)}" stroke-width="${1 + t * 4}" stroke-linecap="round" filter="url(#sc-b2)"/>`,
      );
    }
  }

  body.push(
    `<rect width="${w}" height="${h}" fill="url(#vig)"/>`,
    `<rect width="${w}" height="${h}" fill="transparent" filter="url(#sc-grain)"/>`,
  );

  return svg(w, h, defs.join(''), body.join(''));
}
