/**
 * Small SVG authoring helpers shared by every Zat art generator.
 *
 * All Zat imagery is generated rather than sourced: no external image host is
 * reachable from the build environment, and generating means the whole library
 * is licence-clean and re-renderable at any size.
 */

export type RGB = [number, number, number];

export const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

/** Deterministic PRNG so every build produces byte-identical art. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0x100000000;
  };
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export const rgbToHex = ([r, g, b]: RGB) =>
  '#' +
  [r, g, b]
    .map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0'))
    .join('');

export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const k = clamp(t);
  return rgbToHex([r1 + (r2 - r1) * k, g1 + (g2 - g1) * k, b1 + (b2 - b1) * k]);
}

export const shade = (hex: string, t: number) => mix(hex, '#000000', t);
export const tint = (hex: string, t: number) => mix(hex, '#ffffff', t);

/** `rgba()` from a hex plus alpha, for inline SVG fills. */
export function alpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${clamp(a).toFixed(3)})`;
}

// --- gradient builders -----------------------------------------------------

export type Stop = { offset: number; color: string; opacity?: number };

const stops = (list: Stop[]) =>
  list
    .map(
      (s) =>
        `<stop offset="${(s.offset * 100).toFixed(2)}%" stop-color="${s.color}"${
          s.opacity === undefined ? '' : ` stop-opacity="${s.opacity}"`
        }/>`,
    )
    .join('');

export function linear(
  id: string,
  list: Stop[],
  opts: { x1?: number; y1?: number; x2?: number; y2?: number } = {},
): string {
  const { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = opts;
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(list)}</linearGradient>`;
}

export function radial(
  id: string,
  list: Stop[],
  opts: { cx?: number; cy?: number; r?: number; fx?: number; fy?: number } = {},
): string {
  const { cx = 0.5, cy = 0.5, r = 0.5, fx, fy } = opts;
  const f = fx !== undefined && fy !== undefined ? ` fx="${fx}" fy="${fy}"` : '';
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${f}>${stops(list)}</radialGradient>`;
}

/** Gaussian blur filter with generous bounds so glows are not clipped. */
export function blur(id: string, std: number): string {
  return `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${std}"/></filter>`;
}

/**
 * Fine monochrome grain. Flat digital gradients on a near-black ground band
 * badly; a little noise is what makes them read as photographic.
 */
export function grain(id: string, opacity = 0.055, freq = 0.85): string {
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="7" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0" result="m"/>
    <feComponentTransfer in="m" result="g"><feFuncA type="linear" slope="${opacity}"/></feComponentTransfer>
    <feComposite in="g" in2="SourceGraphic" operator="over"/>
  </filter>`;
}

/**
 * Root SVG wrapper.
 *
 * Body content is clipped to the canvas: blur filters declare generous regions
 * so glows are not cut off, but without this clip librsvg grows the output
 * surface past the declared width/height.
 */
export function svg(w: number, h: number, defs: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none"><defs>${defs}<clipPath id="canvas-clip"><rect width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#canvas-clip)">${body}</g></svg>`;
}

/** Rounded-rect path helper for clipping card art. */
export function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h / 2);
  return `M${x + rr},${y}H${x + w - rr}A${rr},${rr} 0 0 1 ${x + w},${y + rr}V${y + h - rr}A${rr},${rr} 0 0 1 ${x + w - rr},${y + h}H${x + rr}A${rr},${rr} 0 0 1 ${x},${y + h - rr}V${y + rr}A${rr},${rr} 0 0 1 ${x + rr},${y}Z`;
}

/** Smooth closed/open path through points using a Catmull-Rom → bezier pass. */
export function spline(points: Array<[number, number]>, closed = false): string {
  if (points.length < 2) return '';
  const p = points;
  const n = p.length;
  const at = (i: number) => p[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))]!;
  let d = `M${at(0)[0]},${at(0)[1]}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return closed ? d + 'Z' : d;
}

/** The dark studio ground every product and scene card sits on. */
export function studioBackdrop(
  w: number,
  h: number,
  opts: { key?: string; base?: string; cx?: number; cy?: number; spread?: number } = {},
): { defs: string; body: string } {
  const { key = '#2a2622', base = '#0a0a0b', cx = 0.5, cy = 0.3, spread = 0.78 } = opts;
  return {
    defs:
      radial(
        'bd-key',
        [
          { offset: 0, color: key, opacity: 1 },
          { offset: 0.55, color: mix(key, base, 0.72), opacity: 1 },
          { offset: 1, color: base, opacity: 1 },
        ],
        { cx, cy, r: spread },
      ) + grain('bd-grain', 0.05),
    body: `<rect width="${w}" height="${h}" fill="${base}"/><rect width="${w}" height="${h}" fill="url(#bd-key)" filter="url(#bd-grain)"/>`,
  };
}
