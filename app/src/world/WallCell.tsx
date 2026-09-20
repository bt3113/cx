/**
 * One cell of the wall.
 *
 * This is the correction to the whole composition. The references do not
 * show cards floating over a decorative grid — the grid IS the cards. Each
 * bronze-seamed cell of the curved lattice is a Space, and the number,
 * title, descriptor and artwork all live inside it. The "Books" panel in
 * the desktop reference is the same cell, opened in place.
 *
 * So the seams here are the cells' own borders rather than a drawing
 * behind them, which is why they always line up: there is nothing to keep
 * in sync. Hovering lights the cell, because the cell is the target.
 */
import { Link } from 'react-router';
import { cn } from '@/design/cn';
import { ArrowBadge } from '@/design/primitives';
import { Picture } from '@/lib/media';
import { routes } from '@/lib/routing/base';
import type { Space } from '@/lib/schema';

/** Renders "Good Outfits\nBetter Days." on its own lines. */
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

export function WallCell({
  space,
  handle,
  itemCount,
  priority = false,
  className,
}: {
  space: Space;
  handle: string;
  itemCount: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={routes.space(handle, space.slug)}
      aria-label={`${space.title} — ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      className={cn(
        'group/cell relative block min-h-0',
        // The seam. Only two edges per cell, so neighbouring cells do not
        // draw a doubled line where they meet.
        'border-t border-l border-bronze-600/22',
        'transition-colors duration-400 ease-[var(--ease-out-soft)]',
        'hover:border-bronze-400/55 focus-visible:outline-none',
        className,
      )}
    >
      {/* The lit state of the panel itself, not of something sitting on it. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400',
          'bg-[radial-gradient(120%_100%_at_50%_0%,rgba(216,169,106,0.10),transparent_70%)]',
          'group-hover/cell:opacity-100 group-focus-visible/cell:opacity-100',
        )}
      />

      {/* Text left, artwork right — in every cell on both halves of the
          wall. The reference does not mirror the right-hand side. */}
      <span className="relative flex h-full items-center gap-[6%] px-[7%] py-[8%]">
        <span className="min-w-0 flex-1">
          <span
            aria-hidden="true"
            className="tnum mb-1.5 block text-[11px] font-normal text-ink-4"
          >
            {String(space.index).padStart(2, '0')}
          </span>
          <span className="mb-2 block text-[clamp(13px,1.02vw,17px)] leading-tight font-medium text-ink">
            {space.title}
          </span>
          <span className="block text-[clamp(9.5px,0.72vw,11.5px)] leading-[1.45] text-ink-3">
            <Lines text={space.descriptor} />
          </span>
        </span>

        {/* The artwork fills the cell's height rather than holding a fixed
            aspect: a fixed ratio left most of the panel empty, and in the
            reference the image is the body of the cell. */}
        <span className="border-line relative block h-full w-[55%] shrink-0 overflow-hidden rounded-[14px] border">
          <Picture
            media={space.cover}
            sizes="14vw"
            priority={priority}
            className="h-full w-full"
            imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover/cell:scale-[1.06]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
          />
          <span className="absolute inset-x-2.5 bottom-2 flex items-end justify-between gap-2">
            <span className="text-[clamp(9px,0.7vw,11px)] leading-[1.25] font-medium text-ink drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              <Lines text={space.caption} />
            </span>
            <ArrowBadge size={22} className="shrink-0" />
          </span>
        </span>
      </span>
    </Link>
  );
}
