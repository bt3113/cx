export type CharacterConfig = {
  version: 1;
  body: 'slim' | 'regular' | 'athletic' | 'curvy';
  face: 'oval' | 'angular' | 'soft' | 'heart' | 'round';
  skinTone: 'porcelain' | 'ivory' | 'sand' | 'honey' | 'caramel' | 'amber' | 'bronze' | 'umber' | 'espresso' | 'ebony';
  eyeColor: 'brown' | 'hazel' | 'green' | 'blue' | 'gray';
  brow: 'natural' | 'soft' | 'defined';
  hair: 'crop' | 'sidepart' | 'waves' | 'bob' | 'bun';
  hairColor: 'black' | 'espresso' | 'brown' | 'auburn' | 'blonde' | 'silver';
  facialHair: 'none' | 'stubble' | 'short-beard';
  top: 'fitted-tee' | 'relaxed-tee' | 'shirt' | 'knit' | 'hoodie';
  topColor: string;
  bottom: 'tailored' | 'casual' | 'skirt';
  bottomColor: string;
  shoes: 'sneaker' | 'loafer' | 'boot';
  shoeColor: string;
  accessory: 'none' | 'glasses' | 'watch' | 'necklace';
  pose: 'neutral' | 'editorial' | 'relaxed';
};

export const BODY_PRESETS = [
  { id: 'slim', label: 'Slim' },
  { id: 'regular', label: 'Regular' },
  { id: 'athletic', label: 'Athletic' },
  { id: 'curvy', label: 'Curvy' },
] as const;

export const FACE_PRESETS = [
  { id: 'oval', label: 'Oval' },
  { id: 'angular', label: 'Angular' },
  { id: 'soft', label: 'Soft' },
  { id: 'heart', label: 'Heart' },
  { id: 'round', label: 'Round' },
] as const;

export const SKIN_TONES = [
  ['porcelain', '#f2d7c4'], ['ivory', '#e9c8ae'], ['sand', '#d8ad8b'], ['honey', '#c9936e'],
  ['caramel', '#ae7656'], ['amber', '#925c43'], ['bronze', '#744733'], ['umber', '#573526'],
  ['espresso', '#3b241b'], ['ebony', '#261712'],
] as const;

export const EYE_COLOURS = [
  ['brown', '#3a251d'], ['hazel', '#6d5b35'], ['green', '#45644e'], ['blue', '#47647a'], ['gray', '#697075'],
] as const;

export const HAIR_STYLES = [
  { id: 'crop', label: 'Crop' },
  { id: 'sidepart', label: 'Side part' },
  { id: 'waves', label: 'Waves' },
  { id: 'bob', label: 'Bob' },
  { id: 'bun', label: 'Bun' },
] as const;

export const HAIR_COLOURS = [
  ['black', '#151313'], ['espresso', '#2a1b17'], ['brown', '#4b3026'], ['auburn', '#66372b'], ['blonde', '#b99663'], ['silver', '#8d8d8b'],
] as const;

export const TOPS = [
  { id: 'fitted-tee', label: 'Fitted tee' },
  { id: 'relaxed-tee', label: 'Relaxed tee' },
  { id: 'shirt', label: 'Shirt' },
  { id: 'knit', label: 'Knit sweater' },
  { id: 'hoodie', label: 'Hoodie' },
] as const;

export const BOTTOMS = [
  { id: 'tailored', label: 'Tailored' },
  { id: 'casual', label: 'Casual' },
  { id: 'skirt', label: 'Skirt' },
] as const;

export const SHOES = [
  { id: 'sneaker', label: 'Sneakers' },
  { id: 'loafer', label: 'Loafers' },
  { id: 'boot', label: 'Boots' },
] as const;

export const ACCESSORIES = [
  { id: 'none', label: 'None' },
  { id: 'glasses', label: 'Glasses' },
  { id: 'watch', label: 'Watch' },
  { id: 'necklace', label: 'Necklace' },
] as const;

export const POSES = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'relaxed', label: 'Relaxed' },
] as const;

export const ALEX_CHARACTER: CharacterConfig = {
  version: 1,
  body: 'regular',
  face: 'angular',
  skinTone: 'honey',
  eyeColor: 'brown',
  brow: 'defined',
  hair: 'sidepart',
  hairColor: 'espresso',
  facialHair: 'none',
  top: 'knit',
  topColor: '#792438',
  bottom: 'tailored',
  bottomColor: '#202126',
  shoes: 'sneaker',
  shoeColor: '#f1ede6',
  accessory: 'watch',
  pose: 'editorial',
};

export const DEFAULT_CHARACTER: CharacterConfig = {
  ...ALEX_CHARACTER,
  body: 'regular',
  face: 'oval',
  top: 'fitted-tee',
  topColor: '#34383d',
  accessory: 'none',
  pose: 'neutral',
};

/**
 * Asset manifest deliberately starts with procedural parts only. This keeps V1
 * commercially usable without importing unverified marketplace/community files.
 * Future GLB/VRM parts must be added here only after docs/ASSET_LICENSES.md is
 * updated with an exact, checked licence entry.
 */
export const CHARACTER_MANIFEST = {
  schemaVersion: 1,
  engine: 'procedural-three',
  runtime: 'Three.js via pinned jsDelivr ESM, MIT',
  bodyPresets: BODY_PRESETS.map((x) => x.id),
  facePresets: FACE_PRESETS.map((x) => x.id),
  hair: HAIR_STYLES.map((x) => x.id),
  tops: TOPS.map((x) => x.id),
  bottoms: BOTTOMS.map((x) => x.id),
  shoes: SHOES.map((x) => x.id),
  accessories: ACCESSORIES.map((x) => x.id),
  poses: POSES.map((x) => x.id),
  externalAssets: [] as Array<{
    id: string;
    url: string;
    format: 'glb' | 'vrm';
    license: string;
    licenseDocEntry: string;
  }>,
} as const;

export const CHARACTER_BY_HANDLE: Record<string, CharacterConfig> = {
  alexden: ALEX_CHARACTER,
};

export function characterFor(handle: string): CharacterConfig | null {
  return CHARACTER_BY_HANDLE[handle] ?? null;
}

export const CHARACTER_STORAGE_PREFIX = 'zat:character:';
