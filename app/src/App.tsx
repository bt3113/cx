import { Suspense } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { ROUTER_BASENAME } from '@/lib/routing/base';
import { appRoutes } from '@/app/routes';

const router = createBrowserRouter(appRoutes, { basename: ROUTER_BASENAME });

export function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

/** Shown only while a lazily-loaded route chunk is in flight. */
export function RouteFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-void" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="block size-8 animate-spin rounded-full border-2 border-white/10 border-t-bronze-300"
        />
        <span className="kicker">Loading</span>
      </div>
    </div>
  );
}
