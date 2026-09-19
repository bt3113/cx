/**
 * Story asset generation.
 *
 * Produces a real 1080 x 1920 PNG in the browser — no server, no external
 * service. Everything it composites is same-origin, so the canvas is never
 * tainted and `toBlob` always succeeds.
 *
 * The output carries the creator's identity, the subject artwork, a line of
 * context, the disclosure where one applies, and the deep link back. The
 * disclosure travels with the share deliberately: a recommendation that loses
 * its commercial context on the way out is exactly the problem Zat exists to
 * fix.
 */
import { DISCLOSURE_META, type Item, type Person, type Space } from '@/lib/schema';
import { absoluteUrl, asset, routes } from '@/lib/routing/base';

export const STORY_W = 1080;
export const STORY_H = 1920;

export type StoryInput =
  | { subject: 'profile'; person: Person; spaces: Space[] }
  | { subject: 'space'; person: Person; space: Space }
  | { subject: 'item'; person: Person; space: Space; item: Item };

const INK = '#faf8f5';
const INK_2 = 'rgba(250,248,245,0.62)';
const INK_3 = 'rgba(250,248,245,0.4)';
const BRONZE = '#d8a96a';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Canvas has no text wrapping; this measures and breaks manually. */
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 4,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && line && lines[maxLines - 1] !== line) {
    let last = lines[maxLines - 1]!;
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws an image cropped to fill a box, like CSS `object-fit: cover`. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/** The near-black ground and bronze architecture, matching the product. */
function paintBackdrop(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#08080a';
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  const key = ctx.createRadialGradient(STORY_W / 2, -160, 60, STORY_W / 2, 520, 1180);
  key.addColorStop(0, 'rgba(255,255,255,0.13)');
  key.addColorStop(0.45, 'rgba(242,217,176,0.045)');
  key.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  // Curved ribs.
  ctx.save();
  ctx.strokeStyle = 'rgba(216,169,106,0.16)';
  ctx.lineWidth = 1.5;
  for (const offset of [0.12, 0.26, 0.4]) {
    for (const dir of [-1, 1]) {
      const mid = STORY_W / 2 + dir * offset * STORY_W;
      const pull = offset * 150 * dir;
      ctx.beginPath();
      ctx.moveTo(mid - pull, -40);
      ctx.bezierCurveTo(mid, STORY_H * 0.35, mid, STORY_H * 0.65, mid - pull, STORY_H + 40);
      ctx.stroke();
    }
  }
  // Horizontal bands.
  for (const t of [0.18, 0.4, 0.62, 0.84]) {
    const y = t * STORY_H;
    const sag = (t - 0.5) * 120;
    ctx.beginPath();
    ctx.moveTo(-40, y + sag);
    ctx.quadraticCurveTo(STORY_W / 2, y - sag * 0.4, STORY_W + 40, y + sag);
    ctx.stroke();
  }
  ctx.restore();
}

function paintWordmark(ctx: CanvasRenderingContext2D, y: number) {
  ctx.save();
  ctx.font = '500 52px "Playfair Display", Georgia, serif';
  ctx.fillStyle = INK;
  ctx.textBaseline = 'alphabetic';
  const text = 'Zat';
  ctx.fillText(text, 80, y);
  const w = ctx.measureText(text).width;
  ctx.beginPath();
  ctx.fillStyle = '#ef2b3a';
  ctx.arc(80 + w + 14, y - 5, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function paintChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  tone: 'neutral' | 'warm' | 'caution',
) {
  ctx.save();
  ctx.font = '500 26px Inter, sans-serif';
  const padX = 24;
  const w = ctx.measureText(label).width + padX * 2 + 26;
  const h = 52;
  const colour =
    tone === 'caution' ? '#ff8a92' : tone === 'warm' ? BRONZE : 'rgba(250,248,245,0.7)';
  ctx.strokeStyle = colour;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x + padX - 4, y + h / 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + padX + 12, y + h / 2 + 1);
  ctx.restore();
  return w;
}

function paintFooter(ctx: CanvasRenderingContext2D, url: string) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.moveTo(80, STORY_H - 190);
  ctx.lineTo(STORY_W - 80, STORY_H - 190);
  ctx.stroke();

  ctx.font = '400 30px Inter, sans-serif';
  ctx.fillStyle = INK_3;
  ctx.textBaseline = 'middle';
  ctx.fillText(url.replace(/^https?:\/\//, ''), 80, STORY_H - 128);

  ctx.textAlign = 'right';
  ctx.fillStyle = INK_2;
  ctx.fillText('Open on Zat ↗', STORY_W - 80, STORY_H - 128);
  ctx.restore();
}

export async function renderStory(input: StoryInput): Promise<Blob> {
  // Text is measured against the real faces, so they must be ready first.
  try {
    await document.fonts.ready;
  } catch {
    /* font loading API unavailable — fall through with system metrics */
  }

  const canvas = document.createElement('canvas');
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser');

  paintBackdrop(ctx);
  ctx.textAlign = 'left';

  const person = input.person;
  const avatarSrc = asset(`media/${person.avatar.key}.webp`);

  if (input.subject === 'profile') {
    await paintProfile(ctx, input, avatarSrc);
  } else if (input.subject === 'space') {
    await paintSpace(ctx, input, avatarSrc);
  } else {
    await paintItem(ctx, input, avatarSrc);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the Story image'))),
      'image/png',
    );
  });
}

async function paintHeader(
  ctx: CanvasRenderingContext2D,
  person: Person,
  avatarSrc: string,
  kicker: string,
) {
  paintWordmark(ctx, 130);

  const avatar = await loadImage(avatarSrc);
  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(STORY_W - 128, 108, 44, 0, Math.PI * 2);
    ctx.clip();
    drawCover(ctx, avatar, STORY_W - 172, 64, 88, 88);
    ctx.restore();
  }
  ctx.save();
  ctx.font = '400 28px Inter, sans-serif';
  ctx.fillStyle = INK_2;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`@${person.handle}`, STORY_W - 192, 108);
  ctx.restore();

  ctx.save();
  ctx.font = '500 26px Inter, sans-serif';
  ctx.fillStyle = INK_3;
  ctx.letterSpacing = '4px';
  ctx.fillText(kicker.toUpperCase(), 80, 250);
  ctx.restore();
}

async function paintProfile(
  ctx: CanvasRenderingContext2D,
  input: Extract<StoryInput, { subject: 'profile' }>,
  avatarSrc: string,
) {
  const { person, spaces } = input;
  await paintHeader(ctx, person, avatarSrc, 'A world on Zat');

  ctx.font = '500 106px "Playfair Display", Georgia, serif';
  ctx.fillStyle = INK;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(person.name, 80, 380);

  ctx.font = '400 32px Inter, sans-serif';
  ctx.fillStyle = INK_2;
  ctx.fillText(person.roles.join('  ·  '), 80, 436);

  // The portrait, if the creator has one, anchors the composition.
  const portrait = person.portrait
    ? await loadImage(asset(`media/${person.portrait.key}.png`))
    : null;
  if (portrait) {
    const h = 900;
    const w = (portrait.width / portrait.height) * h;
    ctx.drawImage(portrait, STORY_W / 2 - w / 2, 500, w, h);
  }

  // Space covers as a strip along the lower third.
  const picks = spaces.slice(0, 3);
  const tileW = 280;
  const tileH = 340;
  const gap = 30;
  const totalW = picks.length * tileW + (picks.length - 1) * gap;
  let x = (STORY_W - totalW) / 2;
  const y = 1420;

  for (const space of picks) {
    const img = await loadImage(asset(`media/${space.cover.key}.webp`));
    ctx.save();
    roundRect(ctx, x, y, tileW, tileH, 26);
    ctx.clip();
    if (img) drawCover(ctx, img, x, y, tileW, tileH);
    else {
      ctx.fillStyle = '#141416';
      ctx.fillRect(x, y, tileW, tileH);
    }
    const scrim = ctx.createLinearGradient(0, y + tileH * 0.4, 0, y + tileH);
    scrim.addColorStop(0, 'rgba(0,0,0,0)');
    scrim.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = scrim;
    ctx.fillRect(x, y, tileW, tileH);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    roundRect(ctx, x, y, tileW, tileH, 26);
    ctx.stroke();
    ctx.font = '500 30px Inter, sans-serif';
    ctx.fillStyle = INK;
    ctx.fillText(space.title, x + 24, y + tileH - 34);
    ctx.restore();

    x += tileW + gap;
  }

  paintFooter(ctx, absoluteUrl(routes.profile(person.handle)));
}

async function paintSpace(
  ctx: CanvasRenderingContext2D,
  input: Extract<StoryInput, { subject: 'space' }>,
  avatarSrc: string,
) {
  const { person, space } = input;
  await paintHeader(ctx, person, avatarSrc, `${person.name} · Space ${String(space.index).padStart(2, '0')}`);

  const img = await loadImage(asset(`media/${space.cover.key}.webp`));
  const boxY = 320;
  const boxH = 880;
  ctx.save();
  roundRect(ctx, 80, boxY, STORY_W - 160, boxH, 40);
  ctx.clip();
  if (img) drawCover(ctx, img, 80, boxY, STORY_W - 160, boxH);
  else {
    ctx.fillStyle = '#141416';
    ctx.fillRect(80, boxY, STORY_W - 160, boxH);
  }
  const scrim = ctx.createLinearGradient(0, boxY + boxH * 0.45, 0, boxY + boxH);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(80, boxY, STORY_W - 160, boxH);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(216,169,106,0.3)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 80, boxY, STORY_W - 160, boxH, 40);
  ctx.stroke();
  ctx.restore();

  ctx.font = '500 92px "Playfair Display", Georgia, serif';
  ctx.fillStyle = INK;
  ctx.fillText(space.title, 128, boxY + boxH - 96);

  ctx.font = '400 34px Inter, sans-serif';
  ctx.fillStyle = INK_2;
  const lines = wrap(ctx, space.intro, STORY_W - 200, 4);
  lines.forEach((line, i) => ctx.fillText(line, 80, 1320 + i * 52));

  paintFooter(ctx, absoluteUrl(routes.space(person.handle, space.slug)));
}

async function paintItem(
  ctx: CanvasRenderingContext2D,
  input: Extract<StoryInput, { subject: 'item' }>,
  avatarSrc: string,
) {
  const { person, space, item } = input;
  await paintHeader(ctx, person, avatarSrc, `${person.name} · ${space.title}`);

  const img = await loadImage(asset(`media/${item.image.key}.webp`));
  const boxY = 320;
  const boxH = 760;
  ctx.save();
  roundRect(ctx, 80, boxY, STORY_W - 160, boxH, 40);
  ctx.clip();
  if (img) drawCover(ctx, img, 80, boxY, STORY_W - 160, boxH);
  else {
    ctx.fillStyle = '#141416';
    ctx.fillRect(80, boxY, STORY_W - 160, boxH);
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, 80, boxY, STORY_W - 160, boxH, 40);
  ctx.stroke();
  ctx.restore();

  let y = boxY + boxH + 84;

  if (item.brand) {
    ctx.font = '500 30px Inter, sans-serif';
    ctx.fillStyle = INK_3;
    ctx.fillText(item.brand.toUpperCase(), 80, y);
    y += 56;
  }

  ctx.font = '500 78px "Playfair Display", Georgia, serif';
  ctx.fillStyle = INK;
  const titleLines = wrap(ctx, item.title, STORY_W - 160, 2);
  titleLines.forEach((line, i) => ctx.fillText(line, 80, y + i * 88));
  y += titleLines.length * 88 + 22;

  ctx.font = '400 34px Inter, sans-serif';
  ctx.fillStyle = INK_2;
  const noteLines = wrap(ctx, item.creatorNote, STORY_W - 160, 3);
  noteLines.forEach((line, i) => ctx.fillText(line, 80, y + i * 52));
  y += noteLines.length * 52 + 40;

  // Disclosure always travels with the share.
  const meta = DISCLOSURE_META[item.disclosure];
  const chipW = paintChip(ctx, 80, y, meta.label, meta.tone);

  if (item.usedSince) {
    ctx.save();
    ctx.font = '400 28px Inter, sans-serif';
    ctx.fillStyle = INK_3;
    ctx.textBaseline = 'middle';
    ctx.fillText(`Used since ${item.usedSince}`, 80 + chipW + 26, y + 26);
    ctx.restore();
  }

  paintFooter(ctx, absoluteUrl(routes.item(person.handle, space.slug, item.slug)));
}

/** Filename used for downloads and the native share sheet. */
export function storyFileName(input: StoryInput): string {
  const base =
    input.subject === 'profile'
      ? input.person.handle
      : input.subject === 'space'
        ? `${input.person.handle}-${input.space.slug}`
        : `${input.person.handle}-${input.item.slug}`;
  return `zat-${base}.png`;
}
