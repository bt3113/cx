/**
 * Chrome for the public site.
 *
 * Distinct from a creator's world: this is Zat speaking as a product, so it
 * takes a conventional top navigation and a full footer, while keeping the
 * same materials, type and restraint.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { cn } from '@/design/cn';
import { ButtonLink, Wordmark } from '@/design/primitives';
import { routes } from '@/lib/routing/base';
import { useSession } from '@/stores/session';

const PRIMARY_NAV = [
  { label: 'Product', to: routes.product() },
  { label: 'For creators', to: routes.forCreators() },
  { label: 'Trust', to: routes.trust() },
  { label: 'Discover', to: routes.discover() },
  { label: 'Pricing', to: routes.pricing() },
];

const FOOTER_NAV: Array<{ heading: string; links: Array<{ label: string; to: string }> }> = [
  {
    heading: 'Product',
    links: [
      { label: 'Overview', to: routes.product() },
      { label: 'Spaces and Items', to: routes.product() },
      { label: 'Trust layer', to: routes.trust() },
      { label: 'Sharing', to: routes.sharing() },
      { label: 'Zat Studio', to: routes.studioOverview() },
      { label: 'Analytics', to: routes.analyticsOverview() },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { label: 'Discover', to: routes.discover() },
      { label: 'How discovery works', to: routes.discoverExplained() },
      { label: 'Example worlds', to: routes.examples() },
      { label: 'Saved items', to: routes.saved() },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: routes.about() },
      { label: 'Contact', to: routes.contact() },
      { label: 'Help', to: routes.help() },
      { label: 'Pricing', to: routes.pricing() },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms', to: routes.terms() },
      { label: 'Privacy', to: routes.privacy() },
      { label: 'Disclosure policy', to: routes.disclosure() },
      { label: 'Cookies', to: routes.cookies() },
    ],
  },
];

export function MarketingShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const signedIn = useSession((s) => Boolean(s.session));

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-void">
      <header className="sticky top-0 z-50 border-b border-line bg-void/82 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-6 px-5 sm:px-8">
          <Link to={routes.home()} aria-label="Zat home" className="shrink-0">
            <Wordmark size="sm" />
          </Link>

          <nav aria-label="Main" className="hidden flex-1 items-center gap-7 lg:flex">
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'text-[13.5px] transition-colors',
                    isActive ? 'text-ink' : 'text-ink-2 hover:text-ink',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            {signedIn ? (
              <ButtonLink to={routes.studio()} variant="primary" size="sm">
                Open Studio
              </ButtonLink>
            ) : (
              <>
                <ButtonLink to={routes.signIn()} variant="quiet" size="sm" className="hidden sm:inline-flex">
                  Sign in
                </ButtonLink>
                <ButtonLink to={routes.signUp()} variant="primary" size="sm">
                  Claim your Zat
                </ButtonLink>
              </>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="grid size-10 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:text-ink lg:hidden"
            >
              {menuOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav
            id="mobile-nav"
            aria-label="Main"
            className="border-t border-line bg-void px-5 py-3 lg:hidden"
          >
            <ul>
              {PRIMARY_NAV.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    className="block border-b border-line/60 py-3.5 text-[15px] text-ink-2 last:border-0 hover:text-ink"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div className="max-w-[300px]">
              <Wordmark size="sm" className="mb-4" />
              <p className="text-[13px] leading-relaxed text-ink-3">
                Everything that makes you, you — in one place. A creator-owned world for your
                identity, taste, work and recommendations.
              </p>
            </div>

            {FOOTER_NAV.map((group) => (
              <div key={group.heading}>
                <h2 className="kicker mb-4">{group.heading}</h2>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-[13px] text-ink-2 transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[12px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Zat. A product demonstration.</p>
            <p>
              Creator profiles shown are fictional. Policy pages are drafts pending legal review.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
