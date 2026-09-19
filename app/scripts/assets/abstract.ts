/**
 * Generated art for everything the references do not cover.
 *
 * The flagship creator (Alex Den) uses imagery extracted from the supplied
 * references. Secondary creators, content thumbnails and item fallbacks use
 * these generators so the library stays coherent without inventing photography
 * that does not exist.
 */
import { alpha, blur, grain, linear, mix, radial, rng, roundedRect, spline, svg } from './lib/svg.ts';

/** Soft caustic gradient field — used for content thumbnails. */
export function auraSvg(w: number, h: number, seed: number, tones: [string, string, string]): string {
  const r = rng(seed);
  const defs: string[] = [
    grain('au-grain', 0.07, 0.95),
    blur('au-b', Math.max(w, h) * 0.12),
    linear(
      'au-vig',
      [
        { offset: 0, color: '#000000', opacity: 0.1 },
        { offset: 0.62, color: '#000000', opacity: 0.2 },
        { offset: 1, color: '#000000', opacity: 0.78 },
      ],
      { x1: 0, y1: 0, x2: 0.2, y2: 1 },
    ),
  ];
  const body: string[] = [`<rect width="${w}" height="${h}" fill="#08080a"/>`];

  for (let i = 0; i < 5; i++) {
    const tone = tones[i % 3]!;
    const cx = w * (0.15 + r() * 0.7);
    const cy = h * (0.12 + r() * 0.7);
    const rad = Math.max(w, h) * (0.22 + r() * 0.4);
    defs.push(
      radial(
        `au-${i}`,
        [
          { offset: 0, color: tone, opacity: 0.55 - i * 0.06 },
          { offset: 1, color: tone, opacity: 0 },
        ],
        { cx: 0.5, cy: 0.5, r: 0.5 },
      ),
    );
    body.push(
      `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rad.toFixed(1)}" ry="${(rad * (0.6 + r() * 0.6)).toFixed(1)}" fill="url(#au-${i})"/>`,
    );
  }

  // A couple of drifting light filaments give the field some structure.
  for (let i = 0; i < 3; i++) {
    const pts: Array<[number, number]> = [];
    const y0 = h * (0.2 + r() * 0.6);
    for (let x = -20; x <= w + 20; x += w / 5) {
      pts.push([x, y0 + Math.sin(x / (w / 3) + i * 2) * h * 0.1 + (r() - 0.5) * h * 0.04]);
    }
    body.push(
      `<path d="${spline(pts)}" fill="none" stroke="${alpha(tones[2]!, 0.16)}" stroke-width="${1 + r() * 2}" filter="url(#au-b)"/>`,
    );
  }

  body.push(
    `<rect width="${w}" height="${h}" fill="url(#au-vig)"/>`,
    `<rect width="${w}" height="${h}" filter="url(#au-grain)" fill="transparent"/>`,
  );
  return svg(w, h, defs.join(''), body.join(''));
}

/**
 * Creator avatar: a lit disc with an initial. Deliberately not a fake face —
 * inventing a portrait for a fictional person reads worse than an emblem.
 */
export function avatarSvg(size: number, initials: string, tone: string, seed = 3): string {
  const r = rng(seed);
  const hi = mix(tone, '#ffffff', 0.4);
  const lo = mix(tone, '#000000', 0.72);
  const defs = [
    radial(
      'av-g',
      [
        { offset: 0, color: hi },
        { offset: 0.55, color: tone },
        { offset: 1, color: lo },
      ],
      { cx: 0.36, cy: 0.3, r: 0.8 },
    ),
    radial(
      'av-spec',
      [
        { offset: 0, color: '#ffffff', opacity: 0.4 },
        { offset: 1, color: '#ffffff', opacity: 0 },
      ],
      { cx: 0.32, cy: 0.24, r: 0.42 },
    ),
    grain('av-grain', 0.05, 1.2),
    blur('av-b', size * 0.06),
  ].join('');

  const body = [
    `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#av-g)"/>`,
    `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#av-spec)"/>`,
    // A faint orbit line echoes the dais in the profile scene.
    `<ellipse cx="${size / 2}" cy="${size * 0.62}" rx="${size * 0.42}" ry="${size * 0.14}" fill="none" stroke="${alpha('#ffffff', 0.12)}" stroke-width="${size * 0.008}" transform="rotate(${(r() * 20 - 10).toFixed(1)} ${size / 2} ${size / 2})"/>`,
    `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Playfair Display, Georgia, serif" font-size="${size * 0.4}" fill="${alpha('#fffaf2', 0.94)}">${initials}</text>`,
    `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="none" stroke="${alpha('#ffffff', 0.16)}" stroke-width="1.5"/>`,
    `<rect width="${size}" height="${size}" filter="url(#av-grain)" fill="transparent"/>`,
  ].join('');

  return svg(size, size, defs, body);
}

/** Dark studio plinth for an item that has no photograph of its own. */
export function itemPlinthSvg(w: number, h: number, label: string, tone: string): string {
  const defs = [
    radial(
      'ip-key',
      [
        { offset: 0, color: mix(tone, '#ffffff', 0.22), opacity: 0.5 },
        { offset: 1, color: tone, opacity: 0 },
      ],
      { cx: 0.5, cy: 0.34, r: 0.72 },
    ),
    linear(
      'ip-floor',
      [
        { offset: 0, color: alpha('#ffffff', 0.07) },
        { offset: 1, color: alpha('#ffffff', 0) },
      ],
      { x1: 0, y1: 0, x2: 0, y2: 1 },
    ),
    grain('ip-grain', 0.06, 1),
    blur('ip-b', h * 0.05),
  ].join('');

  const cx = w / 2;
  const cy = h * 0.52;
  const rw = Math.min(w, h) * 0.3;

  const body = [
    `<rect width="${w}" height="${h}" fill="#0b0b0d"/>`,
    `<rect width="${w}" height="${h}" fill="url(#ip-key)"/>`,
    `<ellipse cx="${cx}" cy="${h * 0.78}" rx="${w * 0.36}" ry="${h * 0.07}" fill="url(#ip-floor)"/>`,
    // An abstract solid standing in for the product.
    `<path d="${roundedRect(cx - rw, cy - rw * 0.78, rw * 2, rw * 1.56, rw * 0.28)}" fill="${mix(tone, '#000000', 0.35)}" stroke="${alpha('#ffffff', 0.1)}"/>`,
    `<path d="${roundedRect(cx - rw + 6, cy - rw * 0.78 + 6, rw * 2 - 12, rw * 0.7, rw * 0.22)}" fill="${alpha('#ffffff', 0.05)}"/>`,
    `<ellipse cx="${cx}" cy="${cy + rw * 0.95}" rx="${rw * 1.1}" ry="${rw * 0.16}" fill="${alpha('#000000', 0.7)}" filter="url(#ip-b)"/>`,
    `<text x="50%" y="${h * 0.9}" text-anchor="middle" font-family="Inter, sans-serif" font-size="${h * 0.055}" letter-spacing="${h * 0.012}" fill="${alpha('#faf8f5', 0.5)}">${label.toUpperCase()}</text>`,
    `<rect width="${w}" height="${h}" filter="url(#ip-grain)" fill="transparent"/>`,
  ].join('');

  return svg(w, h, defs, body);
}
