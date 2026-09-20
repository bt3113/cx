/**
 * Base-path handling.
 *
 * Zat is published to GitHub Pages as a project site, so every URL is served
 * under `/cx/`. Vite's `base`, the router's `basename` and asset URLs must all
 * agree, and they all derive from this one value.
 */

/** Trailing slash included, e.g. `/cx/`. */
/**
 * Build scripts import this module in plain Node, where `import.meta.env`
 * does not exist, so the Vite value is read defensively.
 */
export const BASE_URL: string =
  (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/cx/';

/** No trailing slash, for react-router's `basename`, e.g. `/cx`. */
export const ROUTER_BASENAME: string = BASE_URL.replace(/\/$/, '');

/** Absolute origin used for canonical URLs, share links and OG tags. */
export const SITE_ORIGIN = 'https://bt3113.github.io';

/** Resolve a path inside `public/` to a served URL. */
export function asset(path: string): string {
  return `${BASE_URL}${path.replace(/^\//, '')}`;
}

/** Absolute, shareable URL for an in-app route such as `/alexden/wardrobe`. */
export function absoluteUrl(routePath: string): string {
  const clean = routePath.replace(/^\//, '');
  return `${SITE_ORIGIN}${BASE_URL}${clean}`;
}

// --- canonical route builders ---------------------------------------------
// Centralised so a URL shape can change in one place.

export const routes = {
  home: () => '/',
  product: () => '/product',
  forCreators: () => '/for-creators',
  trust: () => '/trust',
  sharing: () => '/sharing',
  studioOverview: () => '/studio-overview',
  analyticsOverview: () => '/analytics-overview',
  discoverExplained: () => '/discover-explained',
  pricing: () => '/pricing',
  examples: () => '/examples',
  discover: () => '/discover',
  saved: () => '/saved',
  signIn: () => '/signin',
  signUp: () => '/signup',
  onboarding: () => '/onboarding',
  about: () => '/about',
  contact: () => '/contact',
  help: () => '/help',
  privacy: () => '/privacy',
  terms: () => '/terms',
  disclosure: () => '/disclosure',
  cookies: () => '/cookies',

  profile: (handle: string) => `/${handle}`,
  space: (handle: string, slug: string) => `/${handle}/${slug}`,
  item: (handle: string, spaceSlug: string, itemSlug: string) =>
    `/${handle}/${spaceSlug}/${itemSlug}`,
  content: (handle: string, slug: string) => `/${handle}/content/${slug}`,
  mediaKit: (handle: string) => `/${handle}/media-kit`,

  studio: () => '/studio',
  studioIdentity: () => '/studio/identity',
  studioSpaces: () => '/studio/spaces',
  studioSpace: (id: string) => `/studio/spaces/${id}`,
  studioItems: () => '/studio/items',
  studioItem: (id: string) => `/studio/items/${id}`,
  studioContent: () => '/studio/content',
  studioAppearance: () => '/studio/appearance',
  studioStory: () => '/studio/story',
  studioAnalytics: () => '/studio/analytics',
  studioMediaKit: () => '/studio/media-kit',
  studioSettings: () => '/studio/settings',
  studioPublish: () => '/studio/publish',
} as const;
