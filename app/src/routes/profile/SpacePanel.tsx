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
import { repo } from '@/lib/repo';
import { usePublicWorld } from '@/stores/studio';
import { routes } from '@/lib/routing/base';
import type { Item, Person, Space } from '@/lib/schema';
import { Meta } from '@/seo/Meta';
import { spaceJsonLd } from '@/seo/jsonld';
import { NotFoundRoute } from '@/routes/NotFound';
import { BuyLink, itemPrice } from '@/features/commerce/BuyLink';
import { ItemThumb } from '@/features/catalogue/ItemThumb';
import { SaveButton } from '@/features/saves/SaveButton';
import { ShareButton } from '@/features/share/ShareButton';

export function SpacePanel() {
  const { spaceSlug } = useParams();
  const { person } = useOutletContext<{ person: Person }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktopWorld();

  const world = usePublicWorld(person.handle);
  const space = world
    ? world.spaces.find((s) => s.slug === spaceSlug)
    : spaceSlug
      ? repo.getSpace(person.id, spaceSlug)
      : undefined;
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

  const items = world ? world.items.filter((i) => i.spaceId === space.id) : repo.listItems(space.id);
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
        <h2 className="font-display text-d4 leading-none text-ink">
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

/**
 * One item as it appears inside an opened Space.
 *
 * Two separate destinations, deliberately: the tile itself opens the Item
 * page — the context, the drawbacks, the alternatives — and the buy chip
 * leaves for the retailer. An anchor cannot nest inside an anchor, so the
 * card is a container with two siblings rather than one wrapping link, and
 * the tile link is stretched over the artwork to keep the large hit area.
 */
function ItemTile({
  item,
  handle,
  space,
  className,
}: {
  item: Item;
  handle: string;
  space: Space;
  className?: string;
}) {
  const spaceSlug = space.slug;
  const price = itemPrice(item);

  return (
    <article className={cn('group/tile relative flex w-[164px] shrink-0 flex-col', className)}>
      <div
        className={cn(
          'relative mb-3.5 aspect-[3/4] overflow-hidden rounded-xl border border-line bg-panel',
          'transition-[transform,border-color] duration-400 ease-[var(--ease-out-soft)]',
          'group-hover/tile:-translate-y-1 group-hover/tile:border-line-2',
          'group-focus-within/tile:border-bronze-500',
        )}
      >
        <ItemThumb
          item={item}
          space={space}
          sizes="164px"
          imgClassName="transition-transform duration-700 group-hover/tile:scale-105"
        />
      </div>

      <h3 className="mb-1 text-[13.5px] leading-snug font-medium text-balance text-ink">
        <Link
          to={routes.item(handle, spaceSlug, item.slug)}
          className="line-clamp-2 rounded-sm before:absolute before:inset-x-0 before:top-0 before:bottom-14 before:content-[''] focus-visible:ring-2 focus-visible:ring-bronze-300 focus-visible:outline-none"
        >
          {item.title}
        </Link>
      </h3>

      <p className="mb-2.5 truncate text-[11.5px] text-ink-3">
        {item.brand ?? item.retailer ?? 'Personal note'}
        {price ? <span className="text-ink-2"> · {price}</span> : null}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-0.5">
        <DisclosureChip kind={item.disclosure} compact />
        {item.productUrl ? (
          <BuyLink item={item} className="relative z-1 ml-auto" />
        ) : (
          <ArrowBadge size={26} className="ml-auto" />
        )}
      </div>
    </article>
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
          'glass-solid glass-lit pointer-events-auto flex max-h-full w-full max-w-[1120px] flex-col',
          'overflow-hidden rounded-[var(--radius-panel)]',
        )}
        role="region"
        aria-label={`${space.title} Space`}
      >
        <div className="px-8 pt-7">
          <PanelHeader space={space} items={items} close={close} />
        </div>

        <div className="no-scrollbar mt-6 flex items-stretch gap-5 overflow-x-auto px-8 pb-2">
          {items.map((item) => (
            <ItemTile key={item.id} item={item} handle={person.handle} space={space} />
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
          {items.map((item, i) => {
            const price = itemPrice(item);
            return (
              <li
                key={item.id}
                style={{ marginLeft: `${Math.min(i, 4) * 9}px` }}
                className="transition-[margin] duration-300"
              >
                {/*
                  The row is a container rather than a link so the buy chip
                  can sit inside it: an anchor cannot nest in an anchor. The
                  title link is stretched over the row with a pseudo-element,
                  which keeps the whole row tappable without swallowing the
                  chip that sits above it on the z axis.
                */}
                <div className="group/row relative flex items-center gap-3.5 rounded-2xl border border-line bg-panel/80 p-3 transition-colors hover:border-line-2 hover:bg-surface focus-within:border-bronze-500">
                  <span className="min-w-0 flex-1">
                    <h3 className="mb-1 truncate text-[14.5px] leading-snug font-medium text-ink">
                      <Link
                        to={routes.item(person.handle, space.slug, item.slug)}
                        className="rounded-sm before:absolute before:inset-0 before:content-[''] focus-visible:ring-2 focus-visible:ring-bronze-300 focus-visible:outline-none"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <span className="mb-2 block truncate text-[12px] text-ink-3">
                      {item.brand ?? item.retailer ?? 'Personal note'}
                      {price ? <span className="text-ink-2"> · {price}</span> : null}
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <DisclosureChip kind={item.disclosure} compact />
                      <BuyLink item={item} className="relative z-1" />
                    </span>
                  </span>
                  <span className="border-line size-[68px] shrink-0 overflow-hidden rounded-xl border">
                    <ItemThumb item={item} space={space} sizes="72px" />
                  </span>
                </div>
              </li>
            );
          })}
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
