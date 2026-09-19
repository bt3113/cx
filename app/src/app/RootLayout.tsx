import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';

/**
 * Application frame.
 *
 * Keeps two things right across client navigation that a single-page app
 * otherwise gets wrong: scroll position, and where keyboard focus lands.
 */
export function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Move focus to the document so the next Tab starts from the top of the
    // new page rather than wherever the previous link happened to be.
    const main = document.getElementById('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.removeAttribute('tabindex');
    }
  }, [pathname]);

  return (
    <>
      <ScrollRestoration
        getKey={(location) => {
          // Opening or closing a Space panel should not reset the world's
          // scroll position — it is the same page.
          const segments = location.pathname.split('/').filter(Boolean);
          if (segments.length === 2) return segments[0]!;
          return location.key;
        }}
      />
      <Outlet />
    </>
  );
}
