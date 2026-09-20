/**
 * Routes that exist at a fixed path.
 *
 * Kept free of JSX and React imports so build scripts can read it in plain
 * Node without pulling in the whole application.
 */
export const STATIC_ROUTES = [
  '/', '/product', '/for-creators', '/trust', '/sharing', '/studio-overview',
  '/analytics-overview', '/discover-explained', '/pricing', '/examples',
  '/discover', '/saved', '/about', '/contact', '/help', '/privacy', '/terms',
  '/disclosure', '/cookies', '/signin', '/signup',
] as const;

/** Reserved so a creator can never claim a URL the app already owns. */
export const RESERVED_SLUGS = new Set<string>([
  ...STATIC_ROUTES.map((r) => r.replace(/^\//, '')).filter(Boolean),
  'about', 'content', 'media-kit', 'onboarding', 'studio',
  'api', 'assets', 'media', 'fonts', 'og', 'icons',
]);
