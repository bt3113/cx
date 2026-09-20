/**
 * Chrome for a creator's world.
 *
 * Matches the reference exactly: wordmark top-left, the creator's location and
 * local time top-right beside a single solid white action, and a floating
 * rounded navigation pill at the bottom whose active item is a filled white
 * pill. The four destinations are the reference's own labels, each wired to a
 * real route.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Grid2x2, Home, Send, User } from 'lucide-react';
import { cn } from '@/design/cn';
import { networkIcon, networkLabel } from '@/design/network-icons';
import { Wordmark } from '@/design/primitives';
import { routes } from '@/lib/routing/base';
import type { Person } from '@/lib/schema';

/** The creator's local time, ticking. It is what makes the world feel live. */
function useLocalTime(timeZone: string) {
  const [time, setTime] = useState(() => formatTime(timeZone));
  useEffect(() => {
    // Align the first tick to the next minute rather than polling every second.
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(
      () => {
        setTime(formatTime(timeZone));
        interval = setInterval(() => setTime(formatTime(timeZone)), 60_000);
      },
      (60 - new Date().getSeconds()) * 1000,
    );
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [timeZone]);
  return time;
}

function formatTime(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone,
    }).format(new Date());
  } catch {
    // An unknown IANA zone should not take the page down.
    return '';
  }
}

export function ProfileTopBar({ person, onConnect }: { person: Person; onConnect: () => void }) {
  const time = useLocalTime(person.timezone);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6">
      <Link
        to={routes.home()}
        className="pointer-events-auto rounded-lg transition-opacity hover:opacity-80"
        aria-label="Zat home"
      >
        <Wordmark size="md" />
      </Link>

      <div className="pointer-events-auto flex items-center gap-4 sm:gap-6">
        <p className="hidden items-center gap-2.5 text-[12px] text-ink-3 sm:flex">
          <span aria-hidden="true" className="size-1 rounded-full bg-ink-3" />
          <span>{person.location}</span>
          {time ? (
            <>
              <span aria-hidden="true" className="size-1 rounded-full bg-ink-3" />
              <time>{time}</time>
            </>
          ) : null}
        </p>

        <button
          type="button"
          onClick={onConnect}
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-semibold text-void',
            'transition-[background-color,transform] duration-200 hover:bg-white hover:-translate-y-px',
            'sm:h-11 sm:px-6 sm:text-[14px]',
          )}
        >
          Let&rsquo;s Connect
          <span aria-hidden="true" className="text-[1.1em] leading-none">
            ↗
          </span>
        </button>
      </div>
    </header>
  );
}

const NAV_ITEMS = [
  { label: 'Home', icon: Home, to: (h: string) => routes.profile(h), end: true },
  { label: 'About', icon: User, to: (h: string) => `/${h}/about`, end: false },
  { label: 'Projects', icon: Grid2x2, to: (h: string) => `/${h}/content`, end: false },
] as const;

export function ProfileBottomNav({
  person,
  onConnect,
}: {
  person: Person;
  onConnect: () => void;
}) {
  const location = useLocation();

  return (
    <nav
      aria-label="Profile sections"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(16px,env(safe-area-inset-bottom))]"
    >
      <ul
        className={cn(
          'glass pointer-events-auto flex items-center gap-1 rounded-full p-1.5',
          'shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]',
        )}
      >
        {NAV_ITEMS.map(({ label, icon: Icon, to, end }) => (
          <li key={label}>
            <NavLink
              to={to(person.handle)}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] transition-colors duration-200 sm:px-5',
                  isActive
                    ? 'bg-ink font-semibold text-void'
                    : 'text-ink-2 hover:bg-white/8 hover:text-ink',
                )
              }
            >
              <Icon className="size-[17px]" strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={onConnect}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] text-ink-2 transition-colors duration-200 sm:px-5',
              'hover:bg-white/8 hover:text-ink',
              location.hash === '#connect' && 'bg-white/10 text-ink',
            )}
          >
            <Send className="size-[17px]" strokeWidth={1.8} />
            <span>Contact</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

/** Bottom-left hint and bottom-right social row from the desktop reference. */
export function WorldFooterRail({ person }: { person: Person }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 hidden items-end justify-between px-8 xl:flex">
      <p className="flex items-center gap-2.5 text-[12px] text-ink-3">
        <span aria-hidden="true" className="size-1 rounded-full bg-bronze-400" />
        Scroll to explore
      </p>
      <div className="pointer-events-auto flex items-center gap-4">
        <span aria-hidden="true" className="h-px w-8 bg-line-2" />
        {person.socials.slice(0, 3).map((s) => {
          const Icon = networkIcon(s.network);
          return (
            <a
              key={s.network + s.handle}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${networkLabel(s.network)} — ${s.handle}`}
              className="grid size-8 place-items-center rounded-full text-ink-3 transition-colors hover:bg-white/8 hover:text-ink"
            >
              <Icon className="size-[16px]" strokeWidth={1.7} />
              <span className="sr-only">{`${networkLabel(s.network)}: ${s.handle}`}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function ProfileShell({
  person,
  children,
  onConnect,
}: {
  person: Person;
  children: ReactNode;
  onConnect: () => void;
}) {
  return (
    <div className="relative min-h-dvh bg-void">
      <ProfileTopBar person={person} onConnect={onConnect} />
      {/* Clearance for the floating navigation, which is fixed over the
          bottom of every profile page. */}
      <main id="main" className="pb-28">
        {children}
      </main>
      <ProfileBottomNav person={person} onConnect={onConnect} />
    </div>
  );
}
