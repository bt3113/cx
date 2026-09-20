/**
 * Grid geometry for the desktop world.
 *
 * Rewritten twice. The first version positioned every Space's meta column
 * and its card as two independent absolute boxes with separately authored
 * tops — 11% and 13.5% on one slot, 63% and 67% on another — so nothing
 * shared an edge and the whole wall drifted. Hand-tuning those percentages
 * a second time did not fix it either, because the problem was the
 * technique, not the numbers.
 *
 * So the wall is a CSS Grid. Five columns and three rows; a Space occupies
 * one cell and cannot land anywhere else. Alignment is a property of the
 * track definition rather than something maintained by hand, which means a
 * row is a row by construction.
 *
 * The cylinder is layered on top: `perspective` belongs to the grid
 * container, NOT to each card. One shared viewpoint is what makes the left
 * column tilt away and the right column tilt toward the eye, reading as a
 * curved room. Per-card perspective — what this used to do — gives every
 * card its own vanishing point, which reads as unrelated skew.
 */

/** Column tracks, left to right. The centre column holds the creator. */
/**
 * Outer tracks are wider than inner ones. On a cylinder the columns nearest
 * the eye are the largest, and that size difference is most of what sells
 * the curve — equal tracks read as a flat wall however much they rotate.
 */
export const COLUMNS = '1.16fr 0.97fr 1.2fr 0.97fr 1.16fr';
/**
 * Real gutters between tracks. Without them a card sits flush against the
 * next column's meta text, and because each card is rotated its projected
 * box is wider than its layout box, so it covers the text beside it.
 */
export const GAP = '4.5% 4%';
/**
 * Rows size to their content rather than splitting the stage into equal
 * thirds. Fixed thirds left roughly 75px of dead space under every card,
 * because a card is shorter than a third of the frame — the block is
 * centred vertically instead.
 */
export const ROWS = 'repeat(3, auto)';

/** 1-based grid column for each of the five tracks. */
const COL = { farLeft: 1, innerLeft: 2, centre: 3, innerRight: 4, farRight: 5 } as const;

export type Slot = {
  /** 1-based grid position. */
  col: number;
  row: number;
  /** Meta column width, as a percentage of the cell. */
  metaPct: number;
  /** Gap between meta and card, as a percentage of the cell. */
  gapPct: number;
  /** Whether this Space shows a meta column. The card keeps its position
   *  either way, so an empty meta slot does not pull the card left. */
  meta: boolean;
  /** Card aspect. Outer columns are nearer the eye, so their cards are
   *  larger and square; inner columns sit further back and go landscape. */
  ratio: string;
  /** Degrees of Y rotation and depth, from the column's place on the
   *  cylinder. Symmetric about the centre by construction. */
  rotateY: number;
  depth: number;
  /** Extra top offset, following the cylinder's rim as it falls inward. */
  drop: number;
};

type ColumnShape = Omit<Slot, 'col' | 'row' | 'meta'>;

const SHAPE: Record<number, ColumnShape> = {
  [COL.farLeft]: { metaPct: 40, gapPct: 5, ratio: '1 / 1', rotateY: 9, depth: -150, drop: 0 },
  [COL.innerLeft]: { metaPct: 46, gapPct: 5, ratio: '5 / 4', rotateY: 4.5, depth: -62, drop: 4 },
  [COL.innerRight]: { metaPct: 46, gapPct: 5, ratio: '5 / 4', rotateY: -4.5, depth: -62, drop: 4 },
  [COL.farRight]: { metaPct: 40, gapPct: 5, ratio: '1 / 1', rotateY: -9, depth: -150, drop: 0 },
};

const at = (col: number, row: number, meta = true): Slot => ({
  col,
  row,
  meta,
  ...SHAPE[col]!,
});

/**
 * Twelve Spaces in their numbered order.
 *
 * Row two runs 05, 07, 06, 08 from left to right, which is why its entries
 * look transposed — that is the order the reference numbers them in.
 * Travel is the one Space the reference leaves without a meta column.
 */
export const DESKTOP_SLOTS: Slot[] = [
  at(COL.farLeft, 1), // 01 Wardrobe
  at(COL.innerLeft, 1), // 02 Music
  at(COL.innerRight, 1, false), // 03 Travel
  at(COL.farRight, 1), // 04 Memories
  at(COL.farLeft, 2), // 05 Books
  at(COL.innerRight, 2), // 06 Work
  at(COL.innerLeft, 2), // 07 Photography
  at(COL.farRight, 2), // 08 Fitness
  at(COL.farLeft, 3), // 09 Gaming
  at(COL.innerLeft, 3), // 10 Movies
  at(COL.innerRight, 3), // 11 Ideas
  at(COL.farRight, 3), // 12 Life
];

/** The creator's column: portrait above name and links, spanning all rows. */
export const CENTRE_COL = COL.centre;
