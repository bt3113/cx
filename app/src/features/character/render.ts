/**
 * Rendering a character to SVG.
 *
 * Every DiceBear style exposes a different set of option keys — `personas`
 * takes `skinColor`, `openPeeps` takes `skin`, `micah` takes `baseColor`, and
 * clothing is variously `clothingColor`, `clothesColor` or `body`. Rather than
 * hardcoding a table per style (which silently rots when the library changes),
 * the mapping is resolved at runtime against each style's own published
 * schema, and any control the style does not support is simply dropped.
 */
import { createAvatar, type StyleOptions } from '@dicebear/core';
import * as collection from '@dicebear/collection';
import type { CharacterConfig, CharacterStyle } from './schema';

type AnyStyle = Parameters<typeof createAvatar>[0];

const STYLES = collection as unknown as Record<CharacterStyle, AnyStyle>;

/** DiceBear takes colours as bare hex, without the leading hash. */
const bare = (hex: string) => hex.replace(/^#/, '');

function supportedKeys(style: AnyStyle): Set<string> {
  const schema = (style as { schema?: { properties?: Record<string, unknown> } }).schema;
  return new Set(Object.keys(schema?.properties ?? {}));
}

/** First key the style actually accepts, or undefined. */
function pick(supported: Set<string>, candidates: string[]): string | undefined {
  return candidates.find((key) => supported.has(key));
}

export function characterOptions(config: CharacterConfig): Record<string, unknown> {
  const style = STYLES[config.style];
  if (!style) return { seed: config.seed };

  const supported = supportedKeys(style);
  const options: Record<string, unknown> = { seed: config.seed };

  const set = (candidates: string[], value: string) => {
    const key = pick(supported, candidates);
    if (key) options[key] = [bare(value)];
  };

  set(['skinColor', 'skin', 'baseColor'], config.skinTone);
  set(['hairColor'], config.hairColour);
  set(['clothingColor', 'clothesColor', 'body'], config.clothingColour);

  if (supported.has('backgroundColor')) {
    options.backgroundColor =
      config.background === 'transparent' ? ['transparent'] : [bare(config.background)];
  }

  return options;
}

/** Cache keyed on the config — rebuilding on every keystroke is wasteful. */
const cache = new Map<string, string>();
const MAX_CACHE = 60;

function cacheKey(config: CharacterConfig): string {
  return [
    config.style,
    config.seed,
    config.skinTone,
    config.hairColour,
    config.clothingColour,
    config.background,
  ].join('|');
}

/**
 * Returns an inline SVG string. Falls back to a seed-only render, then to an
 * empty string, so a bad option combination can never take a page down.
 */
export function renderCharacterSvg(config: CharacterConfig): string {
  const key = cacheKey(config);
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const style = STYLES[config.style];
  if (!style) return '';

  let svg = '';
  try {
    svg = createAvatar(style, characterOptions(config) as StyleOptions<never>).toString();
  } catch {
    try {
      svg = createAvatar(style, { seed: config.seed } as StyleOptions<never>).toString();
    } catch {
      svg = '';
    }
  }

  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
  cache.set(key, svg);
  return svg;
}

/** Data URI form, for `<img src>` and canvas compositing. */
export function renderCharacterDataUri(config: CharacterConfig): string {
  if (config.photo) return config.photo;
  const svg = renderCharacterSvg(config);
  if (!svg) return '';
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
