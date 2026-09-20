/**
 * Zat Studio frame.
 *
 * Notion's plainness with the product's own materials: a quiet sidebar, one
 * content column, and a persistent publish bar so a creator always knows
 * whether what they are looking at is live. Shaping a world, not filling in a
 * settings form.
 */
import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import {
  BarChart3, Boxes, Eye, FileText, Image, LayoutGrid, LogOut,
  Palette, Send, Settings, Sparkles, User,
} from 'lucide-react';
import { cn } from '@/design/cn';
import { Button, Wordmark } from '@/design/primitives';
import { routes } from '@/lib/routing/base';
import { useSession } from '@/stores/session';
import { useStudio } from '@/stores/studio';

const NAV: Array<{ label: string; to: string; icon: typeof User; end?: boolean }> = [
  { label: 'Overview', to: routes.studio(), icon: LayoutGrid, end: true },
  { label: 'Identity', to: routes.studioIdentity(), icon: User },
  { label: 'Spaces', to: routes.studioSpaces(), icon: Boxes },
  { label: 'Items', to: routes.studioItems(), icon: Sparkles },
  { label: 'Content', to: routes.studioContent(), icon: FileText },
  { label: 'Appearance', to: routes.studioAppearance(), icon: Palette },
  { label: 'Story', to: routes.studioStory(), icon: Image },
  { label: 'Analytics', to: routes.studioAnalytics(), icon: BarChart3 },
  { label: 'Media kit', to: routes.studioMediaKit(), icon: Send },
  { label: 'Settings', to: routes.studioSettings(), icon: Settings },
];

export function useStudioWorld() {
  const session = useSession((s) => s.session);
  const handle = session?.handle ?? '';
  const ensureDraft = useStudio((s) => s.ensureDraft);
  const draft = useStudio((s) => (handle ? s.drafts[handle] : undefined));

  useEffect(() => {
    if (handle && !draft) ensureDraft(handle);
  }, [handle, draft, ensureDraft]);

  return { handle, world: draft ?? null };
}

export function StudioShell() {
  const navigate = useNavigate();
  const session = useSession((s) => s.session);
  const signOut = useSession((s) => s.signOut);
  const { handle } = useStudioWorld();

  const published = useStudio((s) => (handle ? Boolean(s.published[handle]) : false));
  const dirty = useStudio((s) => (handle ? s.hasUnpublishedChanges(handle) : false));
  const publish = useStudio((s) => s.publish);

  return (
    <div className="min-h-dvh bg-void lg:grid lg:grid-cols-[236px_1fr]">
      {/* --- sidebar ------------------------------------------------- */}
      <aside className="border-b border-line lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <Link to={routes.home()} aria-label="Zat home">
            <Wordmark size="sm" />
          </Link>
          <span className="kicker">Studio</span>
        </div>

        <nav aria-label="Studio" className="px-3 pb-4">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {NAV.map(({ label, to, icon: Icon, end }) => (
              <li key={label} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-[13.5px] transition-colors',
                      isActive ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:bg-surface hover:text-ink',
                    )
                  }
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.7} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden border-t border-line p-3 lg:block">
          <Link
            to={routes.profile(handle)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] text-ink-2 transition-colors hover:bg-surface hover:text-ink"
          >
            <Eye className="size-4" strokeWidth={1.7} />
            View my world
          </Link>
          <button
            type="button"
            onClick={() => {
              signOut();
              navigate(routes.home());
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] text-ink-2 transition-colors hover:bg-surface hover:text-ink"
          >
            <LogOut className="size-4" strokeWidth={1.7} />
            Sign out
          </button>
          {session ? (
            <p className="px-3 pt-3 text-[11.5px] text-ink-4">
              Signed in as {session.email} · demo session
            </p>
          ) : null}
        </div>
      </aside>

      {/* --- content -------------------------------------------------- */}
      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-line bg-void/85 px-5 py-3.5 backdrop-blur-xl sm:px-8">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px]',
              published
                ? dirty
                  ? 'border-bronze-500/45 text-bronze-200'
                  : 'border-[color:var(--color-positive)]/40 text-[color:var(--color-positive)]'
                : 'border-line text-ink-3',
            )}
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {published ? (dirty ? 'Unpublished changes' : 'Published and up to date') : 'Not published'}
          </span>

          <span className="hidden text-[12.5px] text-ink-3 sm:inline">zat.com/{handle}</span>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="glass" size="sm" onClick={() => navigate(routes.profile(handle))}>
              <Eye className="size-4" strokeWidth={1.8} />
              Preview
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => publish(handle)}
              disabled={published && !dirty}
            >
              {published ? 'Publish changes' : 'Publish'}
            </Button>
          </div>
        </div>

        <main id="main" className="px-5 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Consistent section heading for every Studio page. */
export function StudioHeader({
  title,
  lede,
  actions,
}: {
  title: string;
  lede: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display mb-2 text-d4 leading-tight">{title}</h1>
        <p className="max-w-[62ch] text-[14px] leading-relaxed text-ink-2">{lede}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function StudioCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-[var(--radius-panel)] border border-line bg-surface p-5 sm:p-6', className)}>
      {children}
    </section>
  );
}

export function StudioEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-dashed border-line px-6 py-16 text-center">
      <p className="mb-2 text-[16px] text-ink">{title}</p>
      <p className="mx-auto mb-6 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-3">{body}</p>
      {action}
    </div>
  );
}

/** Shared labelled input, used across every Studio form. */
export function StudioField({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="kicker mb-2 block">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-2 text-[12px] leading-relaxed text-ink-3">{hint}</p> : null}
    </div>
  );
}

export const inputClass =
  'w-full rounded-2xl border border-line bg-bg-lift px-4 py-3 text-[14.5px] text-ink placeholder:text-ink-4 focus:border-bronze-500/50 focus:outline-none';
export const textareaClass = `${inputClass} resize-none leading-relaxed`;
