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
import { cn } from '@/design/cn';
import { useMediaQuery } from '@/lib/hooks';
import { ProfilePortrait } from '@/features/identity/ProfilePortrait';
import { repo } from '@/lib/repo';
import type { Item, Person, Space } from '@/lib/schema';
import { IdentityBlock } from './IdentityBlock';
import { SpaceCard } from './SpaceCard';
import { WallCell } from './WallCell';

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


  // The vertical reference is drawn on a tablet canvas. Below 640px the same
  // composition runs with two cards a side instead of four.
  const wide = useMediaQuery('(min-width: 640px)');
  // Four Spaces a side on a tablet, two on a phone — a phone has neither
  // the width for a legible card at a third of the screen nor the height
  // for eight of them.
  // Eight panels on a tablet, four a side; six stacked on a phone. The
  // rest continue in the list below the fold.
  const flanking = wide ? 8 : 6;
  const orbiting = spaces.slice(0, flanking);
  const rest = spaces.slice(flanking);
  const left = orbiting.filter((_s, i) => i % 2 === 0);
  const right = orbiting.filter((_s, i) => i % 2 === 1);

  return (
    <div>
      {/* --- opening screen ------------------------------------------- */}
      <section
        className="relative isolate overflow-hidden"
        aria-label={`${person.name}'s world`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_50%_at_50%_-6%,rgba(242,217,176,0.08),transparent_65%)]"
        />

        {wide ? (
          /*
            Tablet: the reference's own wall — two columns of seamed panels
            flanking the creator, on a shallow cylinder.
          */
          <div
            className="preserve-3d grid px-6 pt-28 pb-16"
            style={{
              gridTemplateColumns: '1fr 1.1fr 1fr',
              perspective: '1800px',
            }}
          >
            <div
              className="grid grid-rows-4 border-b border-l border-bronze-600/22"
              style={{ gridColumn: 1, transform: 'rotateY(5deg)' }}
            >
              {left.map((space, i) => (
                <WallCell
                  key={space.id}
                  space={space}
                  handle={person.handle}
                  itemCount={countFor(space.id)}
                  priority={i === 0}
                  className="h-full"
                />
              ))}
            </div>

            <div className="flex flex-col items-center justify-center px-4 text-center">
              <ProfilePortrait person={person} priority className="w-[80%] max-w-[230px]" />
              <IdentityBlock
                person={person}
                size="lg"
                layout="inline"
                className="mt-6 w-full [&>ul]:justify-center"
              />
            </div>

            <div
              className="grid grid-rows-4 border-r border-b border-bronze-600/22"
              style={{ gridColumn: 3, transform: 'rotateY(-5deg)' }}
            >
              {right.map((space, i) => (
                <WallCell
                  key={space.id}
                  space={space}
                  handle={person.handle}
                  itemCount={countFor(space.id)}
                  priority={i === 0}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        ) : (
          /*
            Phone: the same seamed panels, one column.

            A phone cannot hold the wall's five faces — three columns across
            390px gave the creator's name 120px and each panel 115px, which
            broke both. The model survives the narrowing though: a panel is
            still a cell with its number, title, descriptor and artwork
            inside, and the seams still run between them. Only the number of
            columns changes.
          */
          <div className="px-4 pt-16 pb-6">
            <div className="flex flex-col items-center text-center">
              <ProfilePortrait person={person} priority className="w-[58%] max-w-[220px]" />
              <IdentityBlock
                person={person}
                size="lg"
                layout="inline"
                className="mt-6 w-full [&>ul]:justify-center"
              />
            </div>

            <div className="mt-10 border-r border-b border-bronze-600/22">
              {orbiting.map((space, i) => (
                <WallCell
                  key={space.id}
                  space={space}
                  handle={person.handle}
                  itemCount={countFor(space.id)}
                  priority={i === 0}
                  className="h-[124px]"
                />
              ))}
            </div>
          </div>
        )}
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
