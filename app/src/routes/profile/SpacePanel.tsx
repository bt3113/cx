/**
 * An opened Space.
 *
 * The references open a Space *inside* the world rather than navigating away
 * — a wide bronze-lit glass panel on desktop, a cascading vertical stack on
 * mobile. This component is also a real route (`/:handle/:spaceSlug`), so the
 * in-place expansion is deep-linkable, prerendered and shareable.
 */
import { useEffect } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/design/cn';
import { ArrowBadge, DisclosureChip, SpaceNumber } from '@/design/primitives';
import { useIsDesktopWorld, useScrollLock } from '@/lib/hooks';
import { Picture } from '@/lib/media';
import { repo } from '@/lib/repo';
import { routes } from '@/lib/routing/base';
import type { Item, Person, Space } from '@/lib/schema';
import { Meta } from '@/seo/Meta';
import { spaceJsonLd } from '@/seo/jsonld';
import { NotFoundRoute } from '@/routes/NotFound';
import { SaveButton } from '@/features/saves/SaveButton';
import { ShareButton } from '@/features/share/ShareButton';

export function SpacePanel() {
  const { spaceSlug } = useParams();
  const { person } = useOutletContext<{ person: Person }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktopWorld();

  const space = spaceSlug ? repo.getSpace(person.id, spaceSlug) : undefined;
  useScrollLock(Boolean(space) && !isDesktop);

  // Escape closes the Space and returns to the world.
  useEffect(() => {
    if (!space) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(routes.profile(person.handle));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [space, navigate, person.handle]);

  if (!space) return <NotFoundRoute kind="space" />;

  const items = repo.listItems(space.id);
  const close = routes.profile(person.handle);

  return (
    <>
      <Meta
        title={`${space.title} — ${person.name} on Zat`}
        description={space.intro}
        path={routes.space(person.handle, space.slug)}
        image={`media/${space.cover.key}.webp`}
        jsonLd={spaceJsonLd(person, space, items)}
      />
      {isDesktop ? (
        <DesktopPanel person={person} space={space} items={items} close={close} />
      ) : (
        <MobileSheet person={person} space={space} items={items} close={close} />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------

function PanelHeader({
  space,
  items,
  close,
}: {
  space: Space;
  items: Item[];
  close: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <SpaceNumber value={space.index} className="mb-2" />
        <h2 className="font-display text-[clamp(26px,3vw,38px)] leading-none text-ink">
          {space.title}
        </h2>
        <p className="mt-3 max-w-[54ch] text-[14px] leading-relaxed text-ink-2">{space.intro}</p>
        <p className="mt-3 text-[12px] text-ink-3">
          {items.length} {items.length === 1 ? 'item' : 'items'} · Updated{' '}
          {new Date(space.updatedAt).toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
      <Link
        to={close}
        aria-label={`Close ${space.title}`}
        className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-line-2 hover:bg-white/8 hover:text-ink"
      >
        <X className="size-4.5" strokeWidth={1.6} />
      </Link>
    </div>
  );
}

/** One item as it appears inside an opened Space. */
function ItemTile({
  item,
  handle,
  spaceSlug,
  className,
}: {
  item: Item;
  handle: string;
  spaceSlug: string;
  className?: string;
}) {
  return (
    <Link
      to={routes.item(handle, spaceSlug, item.slug)}
      className={cn('group/tile block w-[150px] shrink-0 focus-visible:outline-none', className)}
    >
      <div
        className={cn(
          'relative mb-3 aspect-[3/4] overflow-hidden rounded-xl border border-line bg-panel',
          'transition-[transform,border-color] duration-400 ease-[var(--ease-out-soft)]',
          'group-hover/tile:-translate-y-1 group-hover/tile:border-line-2',
          'group-focus-visible/tile:ring-2 group-focus-visible/tile:ring-bronze-300',
        )}
      >
        <Picture
          media={item.image}
          sizes="150px"
          className="h-full w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover/tile:scale-105"
        />
      </div>
      <p className="mb-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-ink">
        {item.title}
      </p>
      {item.brand ? <p className="mb-2 text-[11.5px] text-ink-3">{item.brand}</p> : null}
      <div className="flex items-center justify-between gap-2">
        <DisclosureChip kind={item.disclosure} compact />
        <ArrowBadge size={26} />
      </div>
    </Link>
  );
}

function PanelActions({
  person,
  space,
}: {
  person: Person;
  space: Space;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <ShareButton
        subject="space"
        person={person}
        space={space}
        url={routes.space(person.handle, space.slug)}
      />
      <SaveButton targetId={space.id} kind="space" label={`Save ${space.title}`} />
      <Link
        to={routes.space(person.handle, space.slug)}
        className="ml-auto hidden text-[12.5px] text-ink-3 underline-offset-4 hover:text-ink hover:underline sm:block"
      >
        Permalink
      </Link>
    </div>
  );
}

function DesktopPanel({
  person,
  space,
  items,
  close,
}: {
  person: Person;
  space: Space;
  items: Item[];
  close: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'glass glass-lit pointer-events-auto flex max-h-full w-full max-w-[1080px] flex-col',
          'overflow-hidden rounded-[var(--radius-panel)]',
        )}
        role="region"
        aria-label={`${space.title} Space`}
      >
        <div className="px-8 pt-7">
          <PanelHeader space={space} items={items} close={close} />
        </div>

        <div className="no-scrollbar mt-6 flex gap-5 overflow-x-auto px-8 pb-2">
          {items.map((item) => (
            <ItemTile
              key={item.id}
              item={item}
              handle={person.handle}
              spaceSlug={space.slug}
            />
          ))}
        </div>

        {space.note ? (
          <p className="mx-8 mt-5 rounded-2xl border border-line bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-2">
            {space.note}
          </p>
        ) : null}

        <div className="mt-6 border-t border-line px-8 py-5">
          <PanelActions person={person} space={space} />
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Vertical composition: the cascading staircase from the reference, where each
 * row steps further right than the one above it.
 */
function MobileSheet({
  person,
  space,
  items,
  close,
}: {
  person: Person;
  space: Space;
  items: Item[];
  close: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-40 overflow-y-auto bg-void/96 backdrop-blur-xl"
      role="region"
      aria-label={`${space.title} Space`}
    >
      <div className="min-h-full px-5 pb-32 pt-7">
        <PanelHeader space={space} items={items} close={close} />

        <ul className="mt-7 space-y-3">
          {items.map((item, i) => (
            <li
              key={item.id}
              style={{ marginLeft: `${Math.min(i, 4) * 9}px` }}
              className="transition-[margin] duration-300"
            >
              <Link
                to={routes.item(person.handle, space.slug, item.slug)}
                className="group/row flex items-center gap-3.5 rounded-2xl border border-line bg-panel/80 p-3 transition-colors hover:border-line-2 hover:bg-surface"
              >
                <span className="min-w-0 flex-1">
                  <span className="mb-1 block truncate text-[14px] font-medium text-ink">
                    {item.title}
                  </span>
                  {item.brand ? (
                    <span className="mb-2 block truncate text-[12px] text-ink-3">{item.brand}</span>
                  ) : null}
                  <DisclosureChip kind={item.disclosure} compact />
                </span>
                <Picture
                  media={item.image}
                  sizes="72px"
                  className="size-[68px] shrink-0 overflow-hidden rounded-xl border border-line"
                  imgClassName="size-[68px] object-cover"
                />
              </Link>
            </li>
          ))}
        </ul>

        {space.note ? (
          <p className="mt-6 rounded-2xl border border-line bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-2">
            {space.note}
          </p>
        ) : null}

        <div className="mt-7">
          <PanelActions person={person} space={space} />
        </div>
      </div>
    </motion.div>
  );
}
