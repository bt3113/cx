/**
 * Extracts production imagery from the two supplied Zat reference renders.
 *
 * Why extraction rather than generation: the references are the canonical art
 * direction, and no image host is reachable from this build environment. The
 * source PNGs live in the repo root and are not shipped; only the derived,
 * optimised crops under public/media are.
 *
 * Run with `npm run assets`.
 */
import sharp, { type OverlayOptions } from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BOOK_COVERS, CARDS, DETAIL_CROPS, PORTRAIT } from './regions.ts';
import { SCENES, sceneSvg, type SceneKind } from '../scenes.ts';
import { auraSvg, avatarSvg } from '../abstract.ts';

const ROOT = resolve(import.meta.dirname, '../../..');
const REFERENCE = resolve(ROOT, 'reference');
const MEDIA = resolve(ROOT, 'public/media');

const CARD_WIDTHS = [480, 900] as const;
const BOOK_WIDTH = 320;
const PORTRAIT_WIDTH = 760;

type Manifest = Record<string, { w: number; h: number; formats: string[] }>;
const manifest: Manifest = {};

async function emit(buf: Buffer, dir: string, name: string, width: number) {
  await mkdir(resolve(MEDIA, dir), { recursive: true });
  const base = sharp(buf).resize({ width, withoutEnlargement: false });
  const meta = await base.clone().metadata();

  await base.clone().avif({ quality: 58, effort: 4 }).toFile(resolve(MEDIA, dir, `${name}.avif`));
  await base.clone().webp({ quality: 82 }).toFile(resolve(MEDIA, dir, `${name}.webp`));

  manifest[`${dir}/${name}`] = {
    w: meta.width ?? width,
    h: meta.height ?? width,
    formats: ['avif', 'webp'],
  };
}

/**
 * Soft edge falloff for the portrait crop.
 *
 * Automatic cutout was attempted and abandoned: no threshold separates this
 * figure from its backdrop (its hair is darker than the background, and the
 * lit gap between its legs is brighter than its trousers), and every
 * heuristic that came close was fragile enough to break on a re-run. Since
 * the crop's backdrop and the app's ground are both near-black, a feathered
 * rectangle composites cleanly and — unlike the heuristics — does so every
 * time.
 *
 * Creator-built characters take the other route entirely: they are SVG, so
 * they are transparent by construction. See src/features/character.
 */
function portraitMask(w: number, h: number): Buffer {
  const fx = Math.round(w * 0.1);
  const fyTop = Math.round(h * 0.04);
  const fyBottom = Math.round(h * 0.05);
  const mask = Buffer.alloc(w * h * 4);
  const ramp = (v: number, span: number) => Math.min(1, Math.max(0, v / span));

  for (let y = 0; y < h; y++) {
    const vy = Math.min(ramp(y, fyTop), ramp(h - 1 - y, fyBottom));
    for (let x = 0; x < w; x++) {
      const vx = Math.min(ramp(x, fx), ramp(w - 1 - x, fx));
      const i = (y * w + x) * 4;
      mask[i] = 255;
      mask[i + 1] = 255;
      mask[i + 2] = 255;
      // `dest-in` reads alpha, not luminance.
      mask[i + 3] = Math.round(255 * vx * vy);
    }
  }
  return mask;
}

async function buildPortrait() {
  const { region, guards } = PORTRAIT;
  const { width: w, height: h } = region;

  // Drop the reference's own identity text, which sits beside the head.
  // `dest-out` subtracts the SOURCE's alpha from the destination, so the
  // cover has to be opaque. A transparent one erases nothing at all — which
  // is exactly the bug that let the reference's own text ghost through.
  const covers = guards.map((g) => ({
    input: {
      create: {
        width: Math.round(w * g.xFrom),
        height: Math.round(h * g.yTo),
        channels: 4 as const,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    },
    left: 0,
    top: 0,
    blend: 'dest-out' as const,
  }));

  const feathered = await sharp(resolve(REFERENCE, 'MBV.png'))
    .extract(region)
    .ensureAlpha()
    .composite([
      { input: portraitMask(w, h), raw: { width: w, height: h, channels: 4 }, blend: 'dest-in' },
      ...covers,
    ])
    .png()
    .toBuffer();

  await emit(feathered, 'portrait', 'alex-den', PORTRAIT_WIDTH);
  // A PNG is kept for canvas Story composition, which needs alpha.
  await sharp(feathered)
    .resize({ width: PORTRAIT_WIDTH })
    .png({ compressionLevel: 9 })
    .toFile(resolve(MEDIA, 'portrait', 'alex-den.png'));
}

async function buildCards() {
  for (const card of CARDS) {
    const { region, bakedCaption = 0, blurPatches = [] } = card;
    const keep = Math.max(24, Math.round(region.height * (1 - bakedCaption)));
    let buf = await sharp(resolve(REFERENCE, `${card.src}.png`))
      .extract({ ...region, height: keep })
      .png()
      .toBuffer();

    // Blur out any manufacturer mark before the image is published. The patch
    // is feathered — a hard-edged rectangle of blur is more conspicuous than
    // the mark it removes.
    for (const patch of blurPatches) {
      const px = Math.round(region.width * patch.x);
      const py = Math.round(keep * patch.y);
      const pw = Math.max(6, Math.round(region.width * patch.w));
      const ph = Math.max(6, Math.round(keep * patch.h));
      if (px + pw > region.width || py + ph > keep) continue;

      const blurred = await sharp(buf)
        .extract({ left: px, top: py, width: pw, height: ph })
        .blur(Math.max(3, Math.min(pw, ph) / 3))
        .png()
        .toBuffer();

      const feather = await sharp(
        Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><defs><radialGradient id="f" cx="0.5" cy="0.5" r="0.5"><stop offset="0.45" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient></defs><rect width="${pw}" height="${ph}" fill="url(#f)"/></svg>`,
        ),
      )
        .greyscale()
        .png()
        .toBuffer();

      const softPatch = await sharp(blurred)
        .ensureAlpha()
        .composite([{ input: feather, blend: 'dest-in' }])
        .png()
        .toBuffer();

      buf = await sharp(buf)
        .composite([{ input: softPatch, left: px, top: py }])
        .png()
        .toBuffer();
    }

    for (const w of CARD_WIDTHS) {
      await emit(buf, 'spaces', w === CARD_WIDTHS[0] ? card.id : `${card.id}@2x`, w);
    }
  }
}

/** Close crops of the reference photography, used as Item artwork. */
async function buildDetails() {
  for (const d of DETAIL_CROPS) {
    const buf = await sharp(resolve(REFERENCE, `${d.src}.png`)).extract(d.region).png().toBuffer();
    await emit(buf, 'detail', d.id, 420);
  }
}

async function buildBooks() {
  for (const b of BOOK_COVERS) {
    const buf = await sharp(resolve(REFERENCE, 'DKV.png')).extract(b.region).png().toBuffer();
    await emit(buf, 'books', b.id, BOOK_WIDTH);
  }
  await buildBooksCover();
}

/**
 * Cover art for the Books Space.
 *
 * A single book cover would put a second set of typography inside a card that
 * already carries its own, so the five covers are fanned into one image on the
 * same dark studio ground as the rest of the Space art.
 */
async function buildBooksCover() {
  const W = 900;
  const H = 765;
  const cardH = 420;

  const ground = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <radialGradient id="k" cx="50%" cy="28%" r="74%">
          <stop offset="0%" stop-color="#2c2622"/>
          <stop offset="55%" stop-color="#141211"/>
          <stop offset="100%" stop-color="#0a0a0b"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#k)"/>
      <ellipse cx="${W / 2}" cy="${H * 0.76}" rx="${W * 0.36}" ry="30" fill="rgba(0,0,0,0.6)"/>
    </svg>`,
  );

  const angles = [-11, -5.5, 0, 5.5, 11];
  const layers: OverlayOptions[] = [];

  for (const [i, book] of BOOK_COVERS.entries()) {
    const cover = await sharp(resolve(REFERENCE, 'DKV.png'))
      .extract(book.region)
      .resize({ height: cardH })
      .rotate(angles[i]!, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const meta = await sharp(cover).metadata();
    const spread = 132;
    layers.push({
      input: cover,
      left: Math.round(W / 2 + (i - 2) * spread - (meta.width ?? 0) / 2),
      top: Math.round(H * 0.4 - (meta.height ?? 0) / 2 + Math.abs(i - 2) * 14),
    });
  }

  const composed = await sharp(ground).composite(layers).png().toBuffer();
  await emit(composed, 'spaces', 'books', 480);
  await emit(composed, 'spaces', 'books@2x', 900);
}

/**
 * Art for everything the references do not cover: secondary creators, content
 * thumbnails and item fallbacks. The flagship profile stays 100% reference
 * imagery; these keep the rest of the product coherent.
 */
async function buildGenerated() {
  for (const [i, kind] of (Object.keys(SCENES) as SceneKind[]).entries()) {
    const buf = Buffer.from(sceneSvg(kind, 900, 700, 101 + i * 37));
    await emit(buf, 'scenes', kind, 480);
    await emit(buf, 'scenes', `${kind}@2x`, 900);
  }

  // Alex's avatar is his own face from the reference; the rest are emblems.
  const alexHead = await sharp(resolve(REFERENCE, 'MBV.png'))
    .extract({ left: 420, top: 388, width: 92, height: 100 })
    .resize(220, 220, { fit: 'cover', position: 'top' })
    .composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><circle cx="110" cy="110" r="110" fill="#fff"/></svg>`,
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();
  await emit(alexHead, 'avatars', 'alex-den', 220);

  const emblems: Array<[string, string, string]> = [
    ['mara-ellison', 'ME', '#7c5a3a'],
    ['jonas-reeve', 'JR', '#3c5668'],
    ['priya-raman', 'PR', '#6a3a4c'],
  ];
  for (const [id, initials, tone] of emblems) {
    await emit(Buffer.from(avatarSvg(220, initials, tone)), 'avatars', id, 220);
  }

  const auraTones: Array<[string, [string, string, string]]> = [
    ['ember', ['#8c3d1f', '#c2632a', '#f0a25c']],
    ['slate', ['#26333f', '#48606f', '#8fa7b6']],
    ['moss', ['#24382c', '#3f5c46', '#8fae93']],
    ['plum', ['#3a2438', '#5d3a55', '#a07fa8']],
    ['dune', ['#4a3a24', '#7a5c35', '#c8a672']],
    ['ink', ['#16202e', '#27384f', '#6b85a8']],
  ];
  for (const [i, [id, tones]] of auraTones.entries()) {
    await emit(Buffer.from(auraSvg(900, 560, 31 + i * 17, tones)), 'aura', id, 480);
  }

}

async function main() {
  await mkdir(MEDIA, { recursive: true });
  await buildPortrait();
  await buildCards();
  await buildBooks();
  await buildDetails();
  await buildGenerated();
  await writeFile(
    resolve(ROOT, 'src/content/media-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8',
  );
  console.log(`${Object.keys(manifest).length} media entries written to public/media`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
