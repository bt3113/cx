/**
 * Source regions inside the two supplied Zat reference renders.
 *
 * Coordinates are in the references' own pixel space:
 *   DKV.png — 1672 x 941 (desktop composition)
 *   MBV.png —  941 x 1672 (vertical composition)
 *
 * Card crops take the artwork only. The references have caption text and an
 * arrow control baked into the lower band of each card; the app renders those
 * as live DOM, so `bakedCaption` tells the extractor how much of the bottom to
 * drop rather than shipping duplicated text.
 */

export type Region = { left: number; top: number; width: number; height: number };

export type CardExtract = {
  id: string;
  src: 'DKV' | 'MBV';
  region: Region;
  /** Fraction of the crop's height at the bottom holding baked caption text. */
  bakedCaption?: number;
  /**
   * Regions (relative to the crop, 0..1) to blur out — used to remove a
   * manufacturer's logo so the build does not ship a third-party trademark.
   */
  blurPatches?: Array<{ x: number; y: number; w: number; h: number }>;
};

/**
 * The figure, tightly framed, cut out by the extractor.
 *
 * `guards` remove the reference's own identity text, which sits to the left of
 * the head and overlaps the crop vertically. A plain rectangle cannot be used:
 * the text and the head share rows. Instead, above `yTo` everything left of
 * `xFrom` is dropped — the head begins at ~0.39 of the crop width, so this
 * clears the text without touching it.
 */
export const PORTRAIT = {
  region: { left: 352, top: 382, width: 244, height: 918 } satisfies Region,
  guards: [{ yTo: 0.2, xFrom: 0.37 }],
};

export const CARDS: CardExtract[] = [
  { id: 'wardrobe', src: 'DKV', region: { left: 171, top: 138, width: 186, height: 183 }, bakedCaption: 0.42 },
  { id: 'music', src: 'DKV', region: { left: 511, top: 192, width: 158, height: 142 }, bakedCaption: 0.36 },
  { id: 'travel', src: 'DKV', region: { left: 1109, top: 192, width: 158, height: 131 }, bakedCaption: 0.3 },
  { id: 'memories', src: 'DKV', region: { left: 1427, top: 145, width: 192, height: 156 }, bakedCaption: 0.34 },
  {
    id: 'work',
    src: 'DKV',
    region: { left: 1106, top: 377, width: 161, height: 145 },
    bakedCaption: 0.34,
    // Removes the laptop manufacturer's mark from the lid.
    blurPatches: [{ x: 0.28, y: 0.47, w: 0.24, h: 0.38 }],
  },
  { id: 'fitness', src: 'DKV', region: { left: 1429, top: 368, width: 190, height: 154 }, bakedCaption: 0.32 },
  { id: 'ideas', src: 'DKV', region: { left: 1191, top: 566, width: 80, height: 153 }, bakedCaption: 0.26 },
  { id: 'life', src: 'DKV', region: { left: 1429, top: 566, width: 190, height: 214 }, bakedCaption: 0.28 },
  { id: 'gaming', src: 'DKV', region: { left: 173, top: 635, width: 184, height: 156 }, bakedCaption: 0.32 },
  { id: 'movies', src: 'DKV', region: { left: 507, top: 630, width: 164, height: 119 }, bakedCaption: 0.34 },
  // Photography only appears in the vertical composition.
  { id: 'photography', src: 'MBV', region: { left: 700, top: 772, width: 192, height: 160 }, bakedCaption: 0.22 },
];

/** Book cover artwork from the opened Books panel, kept at its natural ratio. */
export const BOOK_COVERS: Array<{ id: string; region: Region }> = [
  { id: 'daily-stoic', region: { left: 69, top: 370, width: 109, height: 165 } },
  { id: 'atomic-habits', region: { left: 198, top: 373, width: 105, height: 161 } },
  { id: 'deep-work', region: { left: 321, top: 373, width: 105, height: 161 } },
  { id: 'almanack', region: { left: 440, top: 373, width: 103, height: 161 } },
  { id: 'thinking-fast-slow', region: { left: 557, top: 373, width: 103, height: 161 } },
];
