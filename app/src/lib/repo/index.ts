/**
 * Data access.
 *
 * Every route and component reads through this interface rather than importing
 * seed data directly. Swapping the static adapter for a Postgres or D1 adapter
 * is therefore one file and no UI changes — which is the whole point of
 * keeping it here.
 */
import {
  brands,
  contentPieces,
  items,
  people,
  relationships,
  spaces,
} from '@/content';
import type { Brand, Content, Item, Person, Relationship, Space } from '@/lib/schema';

export interface ContentRepository {
  listPeople(): Person[];
  getPerson(handle: string): Person | undefined;
  getPersonById(id: string): Person | undefined;

  listSpaces(personId: string): Space[];
  getSpace(personId: string, slug: string): Space | undefined;
  getSpaceById(id: string): Space | undefined;

  listItems(spaceId: string): Item[];
  listItemsByPerson(personId: string): Item[];
  getItem(spaceId: string, slug: string): Item | undefined;
  getItemById(id: string): Item | undefined;

  listContent(personId: string): Content[];
  getContent(personId: string, slug: string): Content | undefined;
  /** Content a given Item appears in — powers "Seen in". */
  contentForItem(itemId: string): Content[];
  /** Items appearing in a piece — powers "Everything in this video". */
  itemsForContent(contentId: string): Item[];

  listBrands(): Brand[];
  edgesFrom(type: Relationship['fromType'], id: string): Relationship[];
  edgesTo(type: Relationship['toType'], id: string): Relationship[];
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/**
 * Static adapter over the seeded dataset. Indexes are built once at module
 * load so lookups stay O(1) as the catalogue grows.
 */
class StaticRepository implements ContentRepository {
  #peopleByHandle = new Map(people.map((p) => [p.handle, p]));
  #peopleById = new Map(people.map((p) => [p.id, p]));
  #spacesById = new Map(spaces.map((s) => [s.id, s]));
  #itemsById = new Map(items.map((i) => [i.id, i]));
  #contentById = new Map(contentPieces.map((c) => [c.id, c]));

  #spacesByPerson = groupBy(spaces, (s) => s.personId);
  #itemsBySpace = groupBy(items, (i) => i.spaceId);
  #itemsByPerson = groupBy(items, (i) => i.personId);
  #contentByPerson = groupBy(contentPieces, (c) => c.personId);

  listPeople() {
    return people;
  }
  getPerson(handle: string) {
    return this.#peopleByHandle.get(handle);
  }
  getPersonById(id: string) {
    return this.#peopleById.get(id);
  }

  listSpaces(personId: string) {
    return [...(this.#spacesByPerson.get(personId) ?? [])].sort(byOrder);
  }
  getSpace(personId: string, slug: string) {
    return this.listSpaces(personId).find((s) => s.slug === slug);
  }
  getSpaceById(id: string) {
    return this.#spacesById.get(id);
  }

  listItems(spaceId: string) {
    return [...(this.#itemsBySpace.get(spaceId) ?? [])].sort(byOrder);
  }
  listItemsByPerson(personId: string) {
    return [...(this.#itemsByPerson.get(personId) ?? [])].sort(byOrder);
  }
  getItem(spaceId: string, slug: string) {
    return this.listItems(spaceId).find((i) => i.slug === slug);
  }
  getItemById(id: string) {
    return this.#itemsById.get(id);
  }

  listContent(personId: string) {
    return [...(this.#contentByPerson.get(personId) ?? [])].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
  }
  getContent(personId: string, slug: string) {
    return this.listContent(personId).find((c) => c.slug === slug);
  }
  contentForItem(itemId: string) {
    return contentPieces
      .filter((c) => c.itemIds.includes(itemId))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
  itemsForContent(contentId: string) {
    const c = this.#contentById.get(contentId);
    if (!c) return [];
    return c.itemIds
      .map((id) => this.#itemsById.get(id))
      .filter((i): i is Item => Boolean(i));
  }

  listBrands() {
    return brands;
  }
  edgesFrom(type: Relationship['fromType'], id: string) {
    return relationships.filter((r) => r.fromType === type && r.fromId === id);
  }
  edgesTo(type: Relationship['toType'], id: string) {
    return relationships.filter((r) => r.toType === type && r.toId === id);
  }
}

function groupBy<T, K>(list: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of list) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}

export const repo: ContentRepository = new StaticRepository();

// --- convenience helpers used across routes --------------------------------

/** Resolve a `/:handle/:space/:item` style path to its records. */
export function resolvePath(handle?: string, spaceSlug?: string, itemSlug?: string) {
  const person = handle ? repo.getPerson(handle) : undefined;
  const space = person && spaceSlug ? repo.getSpace(person.id, spaceSlug) : undefined;
  const item = space && itemSlug ? repo.getItem(space.id, itemSlug) : undefined;
  return { person, space, item };
}

export function itemCountFor(spaceId: string) {
  return repo.listItems(spaceId).length;
}
