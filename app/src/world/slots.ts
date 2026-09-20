/**
 * Slot geometry for the desktop world.
 *
 * Positions are percentages of the stage, measured off the supplied desktop
 * reference (1672 x 941) so the built composition lands where the reference
 * puts it. `rotateY` and `depth` are derived from horizontal distance to the
 * centre, which is what turns a set of absolutely positioned cards into the
 * inside of a cylinder.
 *
 * The reference's grammar is consistent: a meta column (number, title, two or
 * three descriptor lines) sits to the LEFT of its artwork, in four vertical
 * bands — far left, inner left, inner right, far right. Travel is the one
 * exception and carries no meta at all.
 */

export type Box = { l: number; t: number; w: number };

export type Slot = {
  card: Box;
  /** Meta column beside the card, when the grammar calls for one. */
  meta?: Box & { align: 'left' | 'right' };
};

/** Twelve slots in the reference's own order. */
export const DESKTOP_SLOTS: Slot[] = [
  // 01 Wardrobe — far left, high
  { card: { l: 10.2, t: 13.5, w: 11.2 }, meta: { l: 3.3, t: 11, w: 6.3, align: 'left' } },
  // 02 Music — inner left
  { card: { l: 30.6, t: 19.5, w: 9.4 }, meta: { l: 24.2, t: 19, w: 6, align: 'left' } },
  // 03 Travel — inner right, high. No meta in the reference.
  { card: { l: 66.3, t: 19.5, w: 9.5 } },
  // 04 Memories — far right, highest
  { card: { l: 85.3, t: 14.5, w: 11.5 }, meta: { l: 78.6, t: 16, w: 6.3, align: 'left' } },
  // 05 Books — far left, middle band
  { card: { l: 3.3, t: 37, w: 11.2 } },
  // 06 Work — inner right, middle
  { card: { l: 66.3, t: 39, w: 9.5 }, meta: { l: 59.3, t: 39, w: 6.5, align: 'left' } },
  // 07 Photography — inner left, middle
  { card: { l: 30.6, t: 40.5, w: 9.4 }, meta: { l: 24.2, t: 40, w: 6, align: 'left' } },
  // 08 Fitness — far right, middle
  { card: { l: 85.3, t: 39, w: 11.5 }, meta: { l: 79, t: 38, w: 6, align: 'left' } },
  // 09 Gaming — far left, low
  { card: { l: 10.2, t: 67, w: 11.2 }, meta: { l: 3.3, t: 63, w: 6.3, align: 'left' } },
  // 10 Movies — inner left, low
  { card: { l: 30.6, t: 66.5, w: 9.4 }, meta: { l: 24.2, t: 61, w: 6, align: 'left' } },
  // 11 Ideas — inner right, low (small tile)
  { card: { l: 70.5, t: 60, w: 7 }, meta: { l: 59.3, t: 57, w: 7, align: 'left' } },
  // 12 Life — far right, low
  { card: { l: 85.3, t: 60, w: 11.5 }, meta: { l: 79, t: 58, w: 6, align: 'left' } },
];

/**
 * The figure and identity block.
 *
 * The name sits clear of the head: in the reference the head occupies roughly
 * 44–49% and the name begins just past it.
 */
export const FIGURE = { l: 39.5, t: 12, w: 13.5 };
export const IDENTITY = { l: 53.4, t: 14.2, w: 15 };

/**
 * Cylinder placement for a slot. Cards nearer the edge turn further towards
 * the viewer and sit further back.
 */
export function cylinder(box: Box, strength = 1) {
  const centre = (box.l + box.w / 2) / 100 - 0.5; // -0.5 (left) .. 0.5 (right)
  const rotateY = -centre * 30 * strength;
  const depth = -Math.abs(centre) * 300 * strength;
  return { rotateY, depth, centre };
}
