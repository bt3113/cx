/**
 * A Space as it appears inside a world.
 *
 * How much the card itself says depends on the composition around it, not on
 * the Space. In the desktop reference a meta column (number, title,
 * descriptor) sits beside the artwork and the card carries only its two-word
 * caption; in the vertical reference there is no meta column, so the card
 * carries the title and subtitle itself. One component, three overlays.
 */
import { Link } from 'react-router';
import { cn } from '@/design/cn';
import { ArrowBadge, SpaceNumber } from '@/design/primitives';
import { Picture } from '@/lib/media';
import { routes } from '@/lib/routing/base';
import type { Space } from '@/lib/schema';

/** Renders "Good Outfits\nBetter Days." as separate lines. */
function Lines({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <span key={i} className={cn('block', className)}>
          {line}
        </span>
      ))}
    </>
  );
}

export type CardOverlay =
  /** Caption and arrow only — a meta column sits beside the card. */
  | 'caption'
  /** Number, title, descriptor and arrow — the card stands alone. */
  | 'full'
  /** Title and arrow only, for the narrow cards in the vertical orbit. */
  | 'title'
  /** Mostly typographic, for the small tile grammar. */
  | 'tile';

export type SpaceCardProps = {
  space: Space;
  handle: string;
  itemCount: number;
  overlay?: CardOverlay;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Aspect override; the reference uses a squarer card on desktop. */
  ratio?: string;
};

export function SpaceCard({
  space,
  handle,
  itemCount,
  overlay = 'caption',
  sizes = '(min-width: 1280px) 14vw, 44vw',
  className,
  priority = false,
  ratio,
}: SpaceCardProps) {
  const to = routes.space(handle, space.slug);
  const isTile = overlay === 'tile';

  return (
    <Link
      to={to}
      className={cn('group/card block focus-visible:outline-none', className)}
      aria-label={`${space.title} — ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
    >
      <div
        className={cn(
          'relative isolate overflow-hidden rounded-[var(--radius-card)] border border-line bg-panel',
          'transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-out-soft)]',
          'group-hover/card:-translate-y-1 group-hover/card:border-line-2',
          'group-hover/card:shadow-[0_28px_70px_-32px_rgba(0,0,0,0.95)]',
          'group-focus-visible/card:ring-2 group-focus-visible/card:ring-bronze-300',
        )}
        style={{ aspectRatio: ratio ?? (isTile ? '4 / 5.6' : '4 / 3.4') }}
      >
        <Picture
          media={space.cover}
          sizes={sizes}
          priority={priority}
          className="absolute inset-0 -z-10 block h-full w-full"
          imgClassName={cn(
            'h-full w-full object-cover',
            'transition-transform duration-[900ms] ease-[var(--ease-out-soft)]',
            'group-hover/card:scale-[1.045]',
          )}
        />

        {/* Scrim: every reference card sets its caption over a dark base. */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/50 to-transparent',
            overlay === 'full' ? 'h-[72%]' : 'h-[58%]',
          )}
        />

        {overlay === 'full' || overlay === 'title' ? (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b from-black/70 to-transparent"
            />
            <SpaceNumber value={space.index} className="absolute left-3.5 top-3 z-10 text-ink-2" />
          </>
        ) : null}

        {isTile ? (
          <div className="absolute inset-x-3 top-3 z-10">
            <SpaceNumber value={space.index} className="mb-1.5" />
            <h3 className="text-[13px] font-medium leading-tight text-ink">{space.title}</h3>
          </div>
        ) : null}

        <div className="absolute inset-x-3.5 bottom-3 z-10 flex items-end justify-between gap-2.5">
          <div className="min-w-0">
            {overlay === 'full' || overlay === 'title' ? (
              <h3 className="mb-1 line-clamp-2 text-[13.5px] font-medium leading-tight text-ink">
                {space.title}
              </h3>
            ) : null}
            {overlay !== 'title' && overlay !== 'tile' ? (
              <p
                className={cn(
                  'leading-[1.3] text-ink drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]',
                  overlay === 'full'
                    ? 'text-[12px] font-normal text-ink-2'
                    : 'text-[clamp(10px,0.8vw,12.5px)] font-medium',
                )}
              >
                <Lines text={overlay === 'full' ? space.descriptor : space.caption} />
              </p>
            ) : null}
          </div>
          <ArrowBadge size={overlay === 'caption' ? 28 : 26} className="translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

/**
 * Meta column rendered beside a card — used by the desktop world, where the
 * text sits outside the card's 3D transform so it stays crisp.
 */
export function SpaceMeta({
  space,
  align = 'left',
  className,
}: {
  space: Space;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', align === 'right' && 'text-right', className)}>
      <SpaceNumber value={space.index} className={cn('mb-2', align === 'right' && 'text-right')} />
      <h3 className="mb-2 text-[clamp(15px,1.3vw,21px)] font-medium leading-tight text-ink">
        {space.title}
      </h3>
      <p className="text-[clamp(9.5px,0.76vw,12px)] leading-[1.45] text-ink-3">
        <Lines text={space.descriptor} />
      </p>
    </div>
  );
}
