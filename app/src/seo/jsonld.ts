/**
 * Structured data.
 *
 * Emitted where it genuinely describes the page: a creator is a Person, a
 * Space is an ItemList, an Item is a Product. Disclosure is surfaced as a
 * disambiguating description rather than hidden, because a recommendation's
 * commercial relationship is material information.
 */
import { DISCLOSURE_META, type Item, type Person, type Space } from '@/lib/schema';
import { absoluteUrl, routes } from '@/lib/routing/base';

export function personJsonLd(person: Person, spaces: Space[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: person.name,
      alternateName: `@${person.handle}`,
      description: person.statement,
      jobTitle: person.roles.join(', '),
      url: absoluteUrl(routes.profile(person.handle)),
      sameAs: person.socials.map((s) => s.url),
    },
    hasPart: spaces.slice(0, 12).map((s) => ({
      '@type': 'CollectionPage',
      name: s.title,
      url: absoluteUrl(routes.space(person.handle, s.slug)),
    })),
  };
}

export function spaceJsonLd(
  person: Person,
  space: Space,
  items: Item[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${space.title} — ${person.name}`,
    description: space.intro,
    url: absoluteUrl(routes.space(person.handle, space.slug)),
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.title,
      url: absoluteUrl(routes.item(person.handle, space.slug, item.slug)),
    })),
  };
}

export function itemJsonLd(
  person: Person,
  space: Space,
  item: Item,
): Record<string, unknown> {
  const disclosure = DISCLOSURE_META[item.disclosure];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    description: item.description,
    ...(item.brand ? { brand: { '@type': 'Brand', name: item.brand } } : {}),
    url: absoluteUrl(routes.item(person.handle, space.slug, item.slug)),
    disambiguatingDescription: `${disclosure.label}. ${disclosure.explainer}`,
    ...(item.price
      ? {
          offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: item.currency,
            availability: 'https://schema.org/InStock',
            ...(item.retailer ? { seller: { '@type': 'Organization', name: item.retailer } } : {}),
          },
        }
      : {}),
    ...(item.creatorNote
      ? {
          review: {
            '@type': 'Review',
            author: { '@type': 'Person', name: person.name },
            reviewBody: item.creatorNote,
          },
        }
      : {}),
  };
}

export const organisationJsonLd = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Zat',
  description:
    'A creator-owned personal world. One link that holds your identity, taste, tools, work and recommendations.',
  url: absoluteUrl('/'),
});
