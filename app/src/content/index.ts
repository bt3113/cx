/**
 * The seeded dataset, validated at module load.
 *
 * Validation runs in development only — a schema violation is a authoring bug
 * that should surface immediately, but parsing several hundred records on
 * every production page load is waste. The types are identical either way.
 */
import {
  contentSchema,
  itemSchema,
  personSchema,
  spaceSchema,
  type Brand,
  type Content,
  type Item,
  type Person,
  type Relationship,
  type Space,
} from '@/lib/schema';
import { alex, alexSpaces } from './alex/profile';
import { alexItems } from './alex/items';
import { alexContent } from './alex/content';
import { otherContent, otherItems, otherPeople, otherSpaces } from './others';

export const people: Person[] = [alex, ...otherPeople];
export const spaces: Space[] = [...alexSpaces, ...otherSpaces];
export const items: Item[] = [...alexItems, ...otherItems];
export const contentPieces: Content[] = [...alexContent, ...otherContent];

/** Brands are derived rather than authored — one less thing to keep in sync. */
export const brands: Brand[] = Array.from(
  new Map(
    items
      .filter((i): i is Item & { brand: string } => Boolean(i.brand))
      .map((i) => {
        const slug = i.brand
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const space = spaces.find((s) => s.id === i.spaceId);
        return [slug, { id: `b_${slug}`, name: i.brand, slug, category: space?.title ?? 'General' }];
      }),
  ).values(),
);

/**
 * The Taste Graph edge list, derived from the authored records.
 *
 * Deriving rather than hand-writing keeps the graph honest: an edge can only
 * exist if the underlying records do.
 */
export const relationships: Relationship[] = (() => {
  const out: Relationship[] = [];
  const push = (r: Omit<Relationship, 'id' | 'weight'> & { weight?: number }) =>
    out.push({ id: `r_${out.length + 1}`, weight: r.weight ?? 1, ...r });

  for (const s of spaces) {
    push({ fromType: 'person', fromId: s.personId, toType: 'space', toId: s.id, kind: 'owns' });
  }
  for (const i of items) {
    push({ fromType: 'space', fromId: i.spaceId, toType: 'item', toId: i.id, kind: 'contains' });
    push({
      fromType: 'person',
      fromId: i.personId,
      toType: 'item',
      toId: i.id,
      kind: 'recommends',
      // Disclosure changes how much a recommendation should count for.
      weight: i.disclosure === 'sponsored' ? 0.4 : i.disclosure === 'gifted' ? 0.7 : 1,
    });
    if (i.brand) {
      const slug = i.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      push({ fromType: 'item', fromId: i.id, toType: 'brand', toId: `b_${slug}`, kind: 'made-by' });
    }
  }
  for (const c of contentPieces) {
    for (const itemId of c.itemIds) {
      push({ fromType: 'item', fromId: itemId, toType: 'content', toId: c.id, kind: 'appears-in' });
    }
  }
  return out;
})();

if (import.meta.env?.DEV) {
  const problems: string[] = [];
  const check = (label: string, list: unknown[], schema: { safeParse: (v: unknown) => { success: boolean; error?: unknown } }) => {
    list.forEach((record, i) => {
      const res = schema.safeParse(record);
      if (!res.success) problems.push(`${label}[${i}]: ${JSON.stringify(res.error)}`);
    });
  };
  check('person', people, personSchema);
  check('space', spaces, spaceSchema);
  check('item', items, itemSchema);
  check('content', contentPieces, contentSchema);

  // Referential integrity the schemas cannot express on their own.
  const spaceIds = new Set(spaces.map((s) => s.id));
  const itemIds = new Set(items.map((i) => i.id));
  const personIds = new Set(people.map((p) => p.id));
  for (const s of spaces) if (!personIds.has(s.personId)) problems.push(`space ${s.id} → missing person`);
  for (const i of items) {
    if (!spaceIds.has(i.spaceId)) problems.push(`item ${i.id} → missing space ${i.spaceId}`);
    if (!personIds.has(i.personId)) problems.push(`item ${i.id} → missing person`);
  }
  for (const c of contentPieces) {
    for (const id of c.itemIds) if (!itemIds.has(id)) problems.push(`content ${c.id} → missing item ${id}`);
  }

  if (problems.length) {
    console.error(`[zat] ${problems.length} seed data problem(s):\n` + problems.join('\n'));
  }
}
