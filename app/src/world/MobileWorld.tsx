/**
 * The vertical world.
 *
 * Deliberately not a scaled-down desktop scene. The vertical reference is more
 * editorial and more intimate: the figure and identity own the first screen
 * with a few Spaces orbiting them, and exploration then becomes a considered
 * vertical sequence rather than a grid.
 *
 * Card count in the opening screen is lower than the reference's because that
 * render is ~940px wide; at 390px the same count would leave each card
 * illegible.
 */
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/design/cn';
import { useMediaQuery } from '@/lib/hooks';
import { ProfilePortrait } from '@/features/identity/ProfilePortrait';
import { repo } from '@/lib/repo';
import type { Item, Person, Space } from '@/lib/schema';
import { CurvedGrid } from './CurvedGrid';
import { IdentityBlock } from './IdentityBlock';
import { SpaceCard } from './SpaceCard';

/**
 * The vertical composition, on the same grid discipline as the desktop
 * world: two columns of Spaces flanking a centre that holds the creator.
 *
 * The earlier version placed each card at a hand-authored percentage and
 * drifted for the same reason the desktop wall did. Here the cards are grid
 * cells, the centre column spans every row, and nothing can land out of
 * line. Four Spaces a side on a tablet, two on a phone; the rest continue
 * in the list below the fold.
 */
/** Rotation per flanking column, so the pair reads as a shallow curve. */
/**
 * Kept shallow. A rotated card projects wider than its grid track, so a
 * steep tilt pushes it past the padding and off the edge of the screen.
 */
const TILT = 5;

export function MobileWorld({
  person,
  spaces,
  items,
}: {
  person: Person;
  spaces: Space[];
  /** The published world's items, when the creator has edited their own. */
  items?: Item[];
}) {
  const countFor = (spaceId: string) =>
    items ? items.filter((it) => it.spaceId === spaceId).length : repo.listItems(spaceId).length;

  const prefersReduced = useReducedMotion();
  const animate = !prefersReduced && person.theme.motion !== 'still';

  // The vertical reference is drawn on a tablet canvas. Below 640px the same
  // composition runs with two cards a side instead of four.
  const wide = useMediaQuery('(min-width: 640px)');
  // Four Spaces a side on a tablet, two on a phone — a phone has neither
  // the width for a legible card at a third of the screen nor the height
  // for eight of them.
  const flanking = wide ? 8 : 4;
  const rowCount = flanking / 2;

  const orbiting = spaces.slice(0, flanking);
  const rest = spaces.slice(flanking);

  return (
    <div>
      {/* --- opening screen ------------------------------------------- */}
      <section
        className="relative isolate overflow-hidden pb-10"
        style={{ minHeight: wide ? '100dvh' : 'auto' }}
        aria-label={`${person.name}'s world`}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-[-10%]">
          <CurvedGrid />
        </div>

        {wide ? (
          /*
            Tablet: the reference's own composition — two columns of Spaces
            flanking the creator, on grid tracks so nothing can drift.
          */
          <div
            /*
              No `h-full`/`content-center` here. A percentage height resolves
              to auto when the parent only has a min-height, so `h-full` was
              collapsing to the content height and `content-center` did
              nothing — which is why the first row was sitting under the
              header. Natural flow with real padding is predictable.
            */
            className="grid w-full gap-x-[6%] gap-y-[3.5%] px-8 pt-32 pb-28"
            style={{ gridTemplateColumns: '1fr 1.15fr 1fr', perspective: '1300px' }}
          >
            <div
              className="flex flex-col items-center self-center px-1 text-center"
              style={{ gridColumn: 2, gridRow: `1 / span ${rowCount}` }}
            >
              <ProfilePortrait person={person} priority className="w-[80%] max-w-[230px]" />
              <IdentityBlock
                person={person}
                size="lg"
                layout="inline"
                className="mt-6 w-full [&>ul]:justify-center"
              />
            </div>

            {orbiting.map((space, i) => {
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={space.id}
                  className="self-center"
                  style={{
                    gridColumn: left ? 1 : 3,
                    gridRow: Math.floor(i / 2) + 1,
                    rotateY: left ? TILT : -TILT,
                  }}
                  initial={animate ? { opacity: 0, y: 18 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SpaceCard
                    space={space}
                    handle={person.handle}
                    itemCount={countFor(space.id)}
                    overlay="full"
                    ratio="4 / 3"
                    priority={i < 2}
                    sizes="30vw"
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          /*
            Phone: stacked, not the desktop composition squeezed.

            Three columns across 390px gives the creator's name about 120px,
            which wraps "Alex Den" onto two lines, and gives a card about
            115px, which breaks "Wardrobe" mid-word. A phone reads top to
            bottom, so the creator comes first at full width and the Spaces
            follow in an even two-column grid.
          */
          <div className="relative px-5 pt-16 pb-6">
            <div className="flex flex-col items-center text-center">
              <ProfilePortrait person={person} priority className="w-[62%] max-w-[240px]" />
              <IdentityBlock
                person={person}
                size="lg"
                layout="inline"
                className="mt-6 w-full [&>ul]:justify-center"
              />
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-3.5">
              {orbiting.map((space, i) => (
                <motion.li
                  key={space.id}
                  initial={animate ? { opacity: 0, y: 16 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SpaceCard
                    space={space}
                    handle={person.handle}
                    itemCount={countFor(space.id)}
                    overlay="title"
                    ratio="4 / 3"
                    priority={i < 2}
                    sizes="44vw"
                  />
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {wide ? (
          <p className="pointer-events-none absolute bottom-5 left-5 z-30 flex items-center gap-2.5 text-[10px] tracking-[0.22em] text-ink-3 uppercase">
            <span aria-hidden="true" className="inline-block h-3 w-px bg-bronze-400" />
            Scroll to explore
          </p>
        ) : null}
      </section>

      {/* --- the rest of the world ------------------------------------ */}
      {rest.length ? (
        <section className="px-5 pb-32 pt-4" aria-label="More Spaces">
          <h2 className="kicker mb-5">The rest of the world</h2>
          <ul className="space-y-6">
            {rest.map((space, i) => (
              <li
                key={space.id}
                className={cn(
                  // Staggered rather than a plain stack — the vertical
                  // reference offsets alternating cards.
                  i % 2 === 0 ? 'mr-8' : 'ml-8',
                )}
              >
                <SpaceCard
                  space={space}
                  handle={person.handle}
                  itemCount={countFor(space.id)}
                  overlay="full"
                  ratio="4 / 3"
                  sizes="86vw"
                />
                <p className="mt-2.5 text-[11px] text-ink-3">
                  {countFor(space.id)} items
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
