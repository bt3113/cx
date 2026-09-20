/**
 * Creator characters.
 *
 * A Zat world is anchored by its person, so a creator without a photograph
 * still needs a figure. Rather than inventing a character system, this wraps
 * **DiceBear** (MIT, 31 styles, deterministic SVG, runs entirely offline from
 * npm with no HTTP requests) — the established open-source library for this.
 *
 * Version note: pinned to the 9.4.3 LTS pair. `@dicebear/core` has a 10.x
 * line, but `@dicebear/collection` still peers on `^9.0.0`, so mixing them
 * breaks.
 *
 * No mainstream SVG avatar library renders a full-body standing figure, so a
 * generated character appears as a large bust on the dais rather than a poor
 * imitation of a full-length photograph. Creators who want a full figure can
 * upload one instead — see `photo` below.
 */
import { z } from 'zod';

/**
 * Styles offered in the builder, chosen from the 31 available for having
 * human faces and supporting the colour controls below.
 */
export const CHARACTER_STYLES = [
  'personas',
  'openPeeps',
  'avataaars',
  'adventurer',
  'bigSmile',
  'notionists',
  'micah',
  'lorelei',
] as const;

export type CharacterStyle = (typeof CHARACTER_STYLES)[number];

export const STYLE_LABEL: Record<CharacterStyle, string> = {
  personas: 'Personas',
  openPeeps: 'Open Peeps',
  avataaars: 'Avataaars',
  adventurer: 'Adventurer',
  bigSmile: 'Big Smile',
  notionists: 'Notionists',
  micah: 'Micah',
  lorelei: 'Lorelei',
};

/** Tones drawn from the Zat palette so characters sit in the art direction. */
export const SKIN_TONES = [
  '#f2d3b6',
  '#e5b990',
  '#c99a77',
  '#a3714f',
  '#78502f',
  '#513320',
] as const;

export const HAIR_COLOURS = [
  '#141214',
  '#3b2a21',
  '#6e4a21',
  '#b8813f',
  '#d8a96a',
  '#c9c5bf',
] as const;

export const CLOTHING_COLOURS = [
  '#71222f',
  '#3b3a3c',
  '#2b3a4a',
  '#3f5c46',
  '#6e4a21',
  '#8a8f98',
] as const;

export const BACKGROUNDS = ['transparent', '#141416', '#1b1512', '#101418'] as const;

export const characterSchema = z.object({
  style: z.enum(CHARACTER_STYLES).default('personas'),
  /** Drives every randomised feature the style exposes. */
  seed: z.string().min(1).max(64).default('zat'),
  skinTone: z.string().default(SKIN_TONES[2]),
  hairColour: z.string().default(HAIR_COLOURS[0]),
  clothingColour: z.string().default(CLOTHING_COLOURS[0]),
  background: z.string().default('transparent'),
  /**
   * A creator-supplied image, held as a data URL in browser storage. This is
   * the path for anyone who wants a real full-length figure, which no avatar
   * library provides. When set, it wins over the generated character.
   */
  photo: z.string().nullable().default(null),
});

export type CharacterConfig = z.infer<typeof characterSchema>;

export const defaultCharacter = (seed: string): CharacterConfig =>
  characterSchema.parse({ seed });
