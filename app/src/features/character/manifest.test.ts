import { describe, expect, it } from 'vitest';
import {
  ACCESSORIES,
  ALEX_CHARACTER,
  BODY_PRESETS,
  BOTTOMS,
  CHARACTER_MANIFEST,
  FACE_PRESETS,
  HAIR_STYLES,
  POSES,
  SHOES,
  SKIN_TONES,
  TOPS,
} from './manifest';

describe('zero-budget character manifest', () => {
  it('keeps the V1 library intentionally small and curated', () => {
    expect(BODY_PRESETS.length).toBeGreaterThanOrEqual(3);
    expect(BODY_PRESETS.length).toBeLessThanOrEqual(4);
    expect(FACE_PRESETS.length).toBeGreaterThanOrEqual(4);
    expect(FACE_PRESETS.length).toBeLessThanOrEqual(6);
    expect(SKIN_TONES.length).toBeGreaterThanOrEqual(10);
    expect(HAIR_STYLES.length).toBeGreaterThanOrEqual(4);
    expect(HAIR_STYLES.length).toBeLessThanOrEqual(8);
    expect(TOPS.length).toBeLessThanOrEqual(6);
    expect(BOTTOMS.length).toBeLessThanOrEqual(4);
    expect(SHOES.length).toBeLessThanOrEqual(4);
    expect(ACCESSORIES.length).toBeLessThanOrEqual(4);
    expect(POSES).toHaveLength(3);
  });

  it('ships no unverified third-party character assets', () => {
    expect(CHARACTER_MANIFEST.externalAssets).toHaveLength(0);
  });

  it('recreates the Alex reference as structured data rather than a static special case', () => {
    expect(ALEX_CHARACTER.top).toBe('knit');
    expect(ALEX_CHARACTER.bottom).toBe('tailored');
    expect(ALEX_CHARACTER.shoes).toBe('sneaker');
    expect(ALEX_CHARACTER.hair).toBe('sidepart');
    expect(ALEX_CHARACTER.pose).toBe('editorial');
  });
});
