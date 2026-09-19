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
import { BOOK_COVERS, CARDS, PORTRAIT } from './regions.ts';
import { SCENES, sceneSvg, type SceneKind } from '../scenes.ts';
import { auraSvg, avatarSvg, itemPlinthSvg } from '../abstract.ts';

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
 * Alpha mask for the figure, by row-wise edge detection.
 *
 * Measured from the source, no global threshold can separate figure from
 * backdrop: the hair (luma ~7) is darker than the backdrop (~12), and the gap
 * between the legs (~31) is brighter than the trousers around it (~21). A
 * flood fill fails for the same reason.
 *
 * What does hold is that each row's backdrop is smooth and its own value is
 * known — the row's outermost pixels are always background. So for every row
 * we estimate that value and walk inwards until the signal departs from it by
 * more than a small delta for a sustained run. Everything outside those two
 * boundaries is background; everything between them is kept, including the
 * lit gap between the legs, which is what the reference shows anyway.
 */
async function figureMask(cropped: Buffer, w: number, h: number): Promise<Buffer> {
  const { data } = await sharp(cropped).raw().toBuffer({ resolveWithObject: true });
  const channels = data.length / (w * h);

  const lumaAt = (x: number, y: number) => {
    const o = (y * w + x) * channels;
    return 0.2126 * data[o]! + 0.7152 * data[o + 1]! + 0.0722 * data[o + 2]!;
  };

  const DELTA = 6.5; // departure from the row's background value
  const RUN = 5; // consecutive pixels required, to reject noise and grid lines
  const EDGE_SAMPLE = 8; // pixels averaged at each end to estimate background

  const starts = new Int32Array(h).fill(-1);
  const ends = new Int32Array(h).fill(-1);

  for (let y = 0; y < h; y++) {
    let left = 0;
    let right = 0;
    for (let i = 0; i < EDGE_SAMPLE; i++) {
      left += lumaAt(i, y);
      right += lumaAt(w - 1 - i, y);
    }
    const bgL = left / EDGE_SAMPLE;
    const bgR = right / EDGE_SAMPLE;

    for (let x = 0; x < w - RUN; x++) {
      let run = 0;
      for (let k = 0; k < RUN; k++) if (Math.abs(lumaAt(x + k, y) - bgL) > DELTA) run++;
      if (run === RUN) {
        starts[y] = x;
        break;
      }
    }
    for (let x = w - 1; x > RUN; x--) {
      let run = 0;
      for (let k = 0; k < RUN; k++) if (Math.abs(lumaAt(x - k, y) - bgR) > DELTA) run++;
      if (run === RUN) {
        ends[y] = x;
        break;
      }
    }

    // Rows above the head still produce a span, because the backdrop is
    // brighter in the centre than at the frame edge. Require the span to
    // actually contain something lit — the figure always does, empty
    // backdrop never does.
    if (starts[y]! >= 0 && ends[y]! > starts[y]!) {
      let peak = 0;
      for (let x = starts[y]!; x <= ends[y]!; x++) peak = Math.max(peak, lumaAt(x, y));
      if (peak - Math.min(bgL, bgR) < 16) {
        starts[y] = -1;
        ends[y] = -1;
      }
    }
  }

  /**
   * A silhouette boundary moves smoothly down the frame, so a row that
   * disagrees sharply with its neighbours is a background artefact — a grid
   * line or a glow — rather than the figure. A median filter removes those
   * without softening the real shoulder and hip transitions.
   */
  const smooth = (src: Int32Array, fallback: number): Int32Array => {
    const win = 7;
    const half = win >> 1;
    const out = new Int32Array(h);
    const buf: number[] = [];
    for (let y = 0; y < h; y++) {
      buf.length = 0;
      for (let k = -half; k <= half; k++) {
        const v = src[Math.min(h - 1, Math.max(0, y + k))]!;
        if (v >= 0) buf.push(v);
      }
      if (!buf.length) {
        out[y] = fallback;
        continue;
      }
      buf.sort((a, b) => a - b);
      out[y] = buf[buf.length >> 1]!;
    }
    return out;
  };

  const s2 = smooth(starts, 0);
  const e2 = smooth(ends, w - 1);

  const alpha = Buffer.alloc(w * h, 0);
  for (let y = 0; y < h; y++) {
    if (starts[y]! < 0) continue; // row held no figure at all
    const a = s2[y]!;
    const b = e2[y]!;
    if (b > a) alpha.fill(255, y * w + a, y * w + b + 1);
  }

  return alpha;
}

/**
 * Edge falloff as raw coverage, combined with the figure mask arithmetically.
 * Compositing two single-channel masks through sharp's blend modes is fragile
 * — multiplying the bytes is unambiguous.
 */
function combineMasks(figure: Buffer, w: number, h: number, guards: typeof PORTRAIT.guards): Buffer {
  const fx = Math.max(1, Math.round(w * 0.05));
  const fyTop = Math.max(1, Math.round(h * 0.02));
  const fyBottom = Math.max(1, Math.round(h * 0.03));
  const out = Buffer.alloc(w * h);

  const ramp = (v: number, span: number) => Math.min(1, Math.max(0, v / span));

  for (let y = 0; y < h; y++) {
    const vy = Math.min(ramp(y, fyTop), ramp(h - 1 - y, fyBottom));
    for (let x = 0; x < w; x++) {
      const vx = Math.min(ramp(x, fx), ramp(w - 1 - x, fx));
      out[y * w + x] = Math.round(figure[y * w + x]! * vx * vy);
    }
  }

  // Drop the reference's own identity text, which shares rows with the head.
  for (const g of guards) {
    const yTo = Math.round(h * g.yTo);
    const xFrom = Math.round(w * g.xFrom);
    for (let y = 0; y < yTo; y++) out.fill(0, y * w, y * w + xFrom);
  }

  return out;
}

async function buildPortrait() {
  const { region, guards } = PORTRAIT;
  const { width: w, height: h } = region;
  const cropped = await sharp(resolve(REFERENCE, 'MBV.png')).extract(region).ensureAlpha().png().toBuffer();

  const figure = await figureMask(cropped, w, h);
  const combined = combineMasks(figure, w, h, guards);

  // Blur then re-contrast: closes single-row dropouts and leaves a soft
  // one-to-two pixel edge rather than a cut-out look.
  const soft = await sharp(combined, { raw: { width: w, height: h, channels: 1 } })
    .blur(1.8)
    .linear(1.6, -60)
    .raw()
    .toBuffer({ resolveWithObject: true });
  // sharp does not guarantee it hands back a single channel here, so the
  // stride is read from the result rather than assumed.
  const stride = soft.data.length / (w * h);

  // `dest-in` reads the composite's ALPHA channel, not its luminance — a
  // greyscale mask with no alpha is silently a no-op. The coverage therefore
  // has to be written into alpha.
  const maskRgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    maskRgba[i * 4] = 255;
    maskRgba[i * 4 + 1] = 255;
    maskRgba[i * 4 + 2] = 255;
    maskRgba[i * 4 + 3] = soft.data[i * stride]!;
  }

  const feathered = await sharp(cropped)
    .composite([
      { input: maskRgba, raw: { width: w, height: h, channels: 4 }, blend: 'dest-in' },
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

  for (const [label, tone] of [
    ['Optics', '#3a4650'],
    ['Audio', '#2f3238'],
    ['Studio', '#453a30'],
    ['Field', '#34433c'],
  ] as Array<[string, string]>) {
    await emit(Buffer.from(itemPlinthSvg(760, 760, label, tone)), "plinth", label.toLowerCase(), 480);
  }
}

async function main() {
  await mkdir(MEDIA, { recursive: true });
  await buildPortrait();
  await buildCards();
  await buildBooks();
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
