/**
 * Route table.
 *
 * Ordering note: react-router ranks static segments above dynamic ones, so
 * `/:handle/media-kit` wins over `/:handle/:spaceSlug` without manual
 * ordering. Handles and Space slugs that would collide with a static segment
 * are refused by `RESERVED_SLUGS`.
 *
 * Everything except the profile world is lazily loaded, so a visitor landing
 * on a creator's link never downloads the Studio.
 */
import { lazy, type ComponentType } from 'react';
import type { RouteObject } from 'react-router';
import { RootLayout } from '@/app/RootLayout';
import { ProfileRoute } from '@/routes/profile/ProfileRoute';
import { SpacePanel } from '@/routes/profile/SpacePanel';
import { NotFoundRoute } from '@/routes/NotFound';
import { RequireAuth } from '@/routes/auth/AuthRoutes';

export { RESERVED_SLUGS, STATIC_ROUTES } from '@/app/static-routes';

/** Lazily load one named export from a module as a route component. */
const page = (loader: () => Promise<Record<string, unknown>>, key: string) =>
  lazy(async () => ({ default: (await loader())[key] as ComponentType }));

// Marketing
const Home = page(() => import('@/routes/marketing/Home'), 'HomeRoute');
const Product = page(() => import('@/routes/marketing/Pages'), 'ProductRoute');
const ForCreators = page(() => import('@/routes/marketing/Pages'), 'ForCreatorsRoute');
const Trust = page(() => import('@/routes/marketing/Pages'), 'TrustRoute');
const Sharing = page(() => import('@/routes/marketing/Pages'), 'SharingRoute');
const StudioOverviewPage = page(() => import('@/routes/marketing/Pages'), 'StudioOverviewRoute');
const AnalyticsOverviewPage = page(() => import('@/routes/marketing/Pages'), 'AnalyticsOverviewRoute');
const DiscoverExplained = page(() => import('@/routes/marketing/Pages'), 'DiscoverExplainedRoute');
const Pricing = page(() => import('@/routes/marketing/Pages'), 'PricingRoute');
const Examples = page(() => import('@/routes/marketing/Pages'), 'ExamplesRoute');

// Company and legal
const About = page(() => import('@/routes/company/CompanyPages'), 'AboutRoute');
const Contact = page(() => import('@/routes/company/CompanyPages'), 'ContactRoute');
const Help = page(() => import('@/routes/company/CompanyPages'), 'HelpRoute');
const Privacy = page(() => import('@/routes/company/CompanyPages'), 'PrivacyRoute');
const Terms = page(() => import('@/routes/company/CompanyPages'), 'TermsRoute');
const Disclosure = page(() => import('@/routes/company/CompanyPages'), 'DisclosureRoute');
const Cookies = page(() => import('@/routes/company/CompanyPages'), 'CookiesRoute');

// Product
const Discover = page(() => import('@/routes/discover/DiscoverRoutes'), 'DiscoverRoute');
const Saved = page(() => import('@/routes/discover/DiscoverRoutes'), 'SavedRoute');
const PublicMediaKit = page(() => import('@/routes/discover/DiscoverRoutes'), 'PublicMediaKitRoute');
const ItemRoute = page(() => import('@/routes/profile/ItemRoute'), 'ItemRoute');
const ContentIndex = page(() => import('@/routes/profile/ContentRoutes'), 'ContentIndexRoute');
const ContentDetail = page(() => import('@/routes/profile/ContentRoutes'), 'ContentDetailRoute');
const ProfileAbout = page(() => import('@/routes/profile/ContentRoutes'), 'AboutRoute');

// Auth and onboarding
const SignIn = page(() => import('@/routes/auth/AuthRoutes'), 'SignInRoute');
const SignUp = page(() => import('@/routes/auth/AuthRoutes'), 'SignUpRoute');
const Onboarding = page(() => import('@/routes/onboarding/OnboardingRoute'), 'OnboardingRoute');

// Studio
const StudioShell = page(() => import('@/routes/studio/StudioShell'), 'StudioShell');
const S = {
  Overview: page(() => import('@/routes/studio/StudioSections'), 'StudioOverview'),
  Identity: page(() => import('@/routes/studio/StudioSections'), 'StudioIdentity'),
  Spaces: page(() => import('@/routes/studio/StudioSections'), 'StudioSpaces'),
  SpaceEditor: page(() => import('@/routes/studio/StudioSections'), 'StudioSpaceEditor'),
  Items: page(() => import('@/routes/studio/StudioSections'), 'StudioItems'),
  ItemEditor: page(() => import('@/routes/studio/StudioSections'), 'StudioItemEditor'),
  Content: page(() => import('@/routes/studio/StudioSections'), 'StudioContent'),
  Appearance: page(() => import('@/routes/studio/StudioSections'), 'StudioAppearance'),
  Story: page(() => import('@/routes/studio/StudioSections'), 'StudioStory'),
  Analytics: page(() => import('@/routes/studio/StudioSections'), 'StudioAnalytics'),
  MediaKit: page(() => import('@/routes/studio/StudioSections'), 'StudioMediaKit'),
  Settings: page(() => import('@/routes/studio/StudioSections'), 'StudioSettings'),
};

export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      // --- marketing ---------------------------------------------------
      { path: '/', element: <Home /> },
      { path: '/product', element: <Product /> },
      { path: '/for-creators', element: <ForCreators /> },
      { path: '/trust', element: <Trust /> },
      { path: '/sharing', element: <Sharing /> },
      { path: '/studio-overview', element: <StudioOverviewPage /> },
      { path: '/analytics-overview', element: <AnalyticsOverviewPage /> },
      { path: '/discover-explained', element: <DiscoverExplained /> },
      { path: '/pricing', element: <Pricing /> },
      { path: '/examples', element: <Examples /> },

      // --- product -----------------------------------------------------
      { path: '/discover', element: <Discover /> },
      { path: '/saved', element: <Saved /> },

      // --- company and legal -------------------------------------------
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/help', element: <Help /> },
      { path: '/privacy', element: <Privacy /> },
      { path: '/terms', element: <Terms /> },
      { path: '/disclosure', element: <Disclosure /> },
      { path: '/cookies', element: <Cookies /> },

      // --- auth and onboarding -----------------------------------------
      { path: '/signin', element: <SignIn /> },
      { path: '/signup', element: <SignUp /> },
      {
        path: '/onboarding',
        element: (
          <RequireAuth>
            <Onboarding />
          </RequireAuth>
        ),
      },

      // --- studio ------------------------------------------------------
      {
        path: '/studio',
        element: (
          <RequireAuth>
            <StudioShell />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <S.Overview /> },
          { path: 'identity', element: <S.Identity /> },
          { path: 'spaces', element: <S.Spaces /> },
          { path: 'spaces/:spaceId', element: <S.SpaceEditor /> },
          { path: 'items', element: <S.Items /> },
          { path: 'items/:itemId', element: <S.ItemEditor /> },
          { path: 'content', element: <S.Content /> },
          { path: 'appearance', element: <S.Appearance /> },
          { path: 'story', element: <S.Story /> },
          { path: 'analytics', element: <S.Analytics /> },
          { path: 'media-kit', element: <S.MediaKit /> },
          { path: 'settings', element: <S.Settings /> },
        ],
      },

      // --- a creator's world -------------------------------------------
      { path: ':handle/about', element: <ProfileAbout /> },
      { path: ':handle/media-kit', element: <PublicMediaKit /> },
      { path: ':handle/content', element: <ContentIndex /> },
      { path: ':handle/content/:contentSlug', element: <ContentDetail /> },
      { path: ':handle/:spaceSlug/:itemSlug', element: <ItemRoute /> },
      {
        path: ':handle',
        element: <ProfileRoute />,
        children: [{ path: ':spaceSlug', element: <SpacePanel /> }],
      },

      { path: '*', element: <NotFoundRoute /> },
    ],
  },
];
