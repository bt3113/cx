/**
 * Route table.
 *
 * Ordering note: react-router ranks static segments above dynamic ones, so
 * `/:handle/media-kit` wins over `/:handle/:spaceSlug` without manual
 * ordering. Handles and Space slugs that would collide with those static
 * segments are reserved in `RESERVED_SLUGS`.
 */
import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { RootLayout } from '@/app/RootLayout';
import { ProfileRoute } from '@/routes/profile/ProfileRoute';
import { SpacePanel } from '@/routes/profile/SpacePanel';
import { NotFoundRoute } from '@/routes/NotFound';

/** Reserved so a creator can never claim a URL the app already owns. */
export const RESERVED_SLUGS = new Set([
  'about', 'content', 'media-kit', 'discover', 'saved', 'signin', 'signup',
  'onboarding', 'studio', 'pricing', 'examples', 'product', 'for-creators',
  'trust', 'sharing', 'help', 'privacy', 'terms', 'disclosure', 'cookies',
  'contact', 'studio-overview', 'analytics-overview', 'discover-explained',
  'api', 'assets', 'media', 'fonts', 'og', 'icons',
]);

const Home = lazy(() => import('@/routes/marketing/Home').then((m) => ({ default: m.HomeRoute })));

export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },

      // --- a creator's world ------------------------------------------
      {
        path: ':handle',
        element: <ProfileRoute />,
        children: [{ path: ':spaceSlug', element: <SpacePanel /> }],
      },

      { path: '*', element: <NotFoundRoute /> },
    ],
  },
];
