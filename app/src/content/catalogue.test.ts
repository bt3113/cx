/**
 * The seeded catalogue has to be valid before anything renders it.
 *
 * These assertions exist because of real defects: a mistyped `retina` key
 * that typechecked and shipped a silently non-retina image, and Spaces that
 * held one item where the composition assumes five. A schema parse and a
 * count are cheaper than finding either in a screenshot.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contentPieces, items, people, spaces } from '@/content';
import { contentSchema, itemSchema, personSchema, spaceSchema } from '@/lib/schema';

/** Where the extracted imagery lands, relative to this file. */
const MEDIA = resolve(import.meta.dirname, '../../../media');

describe('seeded catalogue', () => {
  it('parses every record against its schema', () => {
    for (const p of people) expect(() => personSchema.parse(p)).not.toThrow();
    for (const s of spaces) expect(() => spaceSchema.parse(s)).not.toThrow();
    for (const i of items) expect(() => itemSchema.parse(i)).not.toThrow();
    for (const c of contentPieces) expect(() => contentSchema.parse(c)).not.toThrow();
  });

  it('gives every Space exactly five items', () => {
    const short = spaces
      .map((s) => [s.id, items.filter((i) => i.spaceId === s.id).length] as const)
      .filter(([, n]) => n !== 5);
    expect(short).toEqual([]);
  });

  it('keeps ids and per-person slugs unique', () => {
    const ids = [...people, ...spaces, ...items, ...contentPieces].map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const person of people) {
      const spaceSlugs = spaces.filter((s) => s.personId === person.id).map((s) => s.slug);
      expect(new Set(spaceSlugs).size).toBe(spaceSlugs.length);

      for (const space of spaces.filter((s) => s.personId === person.id)) {
        const slugs = items.filter((i) => i.spaceId === space.id).map((i) => i.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
      }
    }
  });

  it('points every item at a Space that exists, owned by the same person', () => {
    const byId = new Map(spaces.map((s) => [s.id, s]));
    for (const item of items) {
      const space = byId.get(item.spaceId);
      expect(space, `${item.id} references missing Space ${item.spaceId}`).toBeDefined();
      expect(space!.personId).toBe(item.personId);
    }
  });

  it('references only imagery that exists on disk', () => {
    const missing = new Set<string>();
    const check = (key: string, retina: boolean) => {
      if (!existsSync(resolve(MEDIA, `${key}.webp`))) missing.add(`${key}.webp`);
      if (retina && !existsSync(resolve(MEDIA, `${key}@2x.webp`))) missing.add(`${key}@2x.webp`);
    };
    for (const p of people) {
      check(p.avatar.key, p.avatar.retina);
      if (p.portrait) check(p.portrait.key, p.portrait.retina);
    }
    for (const s of spaces) check(s.cover.key, s.cover.retina);
    for (const i of items) check(i.image.key, i.image.retina);
    for (const c of contentPieces) check(c.thumb.key, c.thumb.retina);
    expect([...missing]).toEqual([]);
  });

  it('marks a paid relationship on every item that has one', () => {
    for (const item of items) {
      if (item.disclosure === 'affiliate' || item.disclosure === 'sponsored') {
        expect(item.productUrl, `${item.id} is paid but has nowhere to send a visitor`).toBeTruthy();
      }
    }
  });
});
