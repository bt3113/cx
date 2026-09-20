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
import { Picture } from '@/lib/media';
import { LazyCharacterPreview } from '@/features/character/LazyCharacterPreview';
import type { CharacterConfig } from '@/features/character/schema';
import { repo } from '@/lib/repo';
import type { Item, Person, Space } from '@/lib/schema';
import { CurvedGrid, Dais } from './CurvedGrid';
import { IdentityBlock } from './IdentityBlock';
import { SpaceCard } from './SpaceCard';

/**
 * Opening-screen card positions, following the vertical reference.
 *
 * The reference runs two columns of cards down either side of the figure,
 * with the identity stacked between them at the top. It is drawn on a tablet
 * canvas, where each column is 22% wide and carries four cards; a phone has
 * neither the width for a 22% card to stay legible nor the height for eight
 * of them, so the same grammar is kept with wider columns and two cards a
 * side. The remaining Spaces continue in the list below the fold.
 */
/**
 * The vertical reference itself, measured off a 941x1672 canvas: two columns
 * of four flanking the figure, the left column starting slightly higher than
 * the right. Used from 640px up, where a 22%-wide card is still legible.
 */
const ORBIT_WIDE = [
  { l: 4.3, t: 10.8, w: 22, rot: 9 },
  { l: 73.3, t: 13.9, w: 22, rot: -9 },
  { l: 4.3, t: 28.4, w: 22, rot: 8 },
  { l: 73.3, t: 28.7, w: 22, rot: -8 },
  { l: 4.3, t: 43.7, w: 22, rot: 7 },
  { l: 73.3, t: 45.2, w: 22, rot: -7 },
  { l: 4.3, t: 60.2, w: 22, rot: 6 },
  { l: 73.3, t: 62.4, w: 22, rot: -6 },
] as const;

/**
 * A phone has neither the width for a 22% card to stay legible nor the
 * height for eight of them, so the same two-column grammar runs with wider
 * columns and two cards a side. The rest continue in the list below.
 */
const ORBIT_NARROW = [
  { l: 1, t: 40, w: 36, rot: 9 },
  { l: 63, t: 45, w: 36, rot: -9 },
  { l: 1, t: 61, w: 36, rot: 7 },
  { l: 63, t: 66, w: 36, rot: -7 },
] as const;

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
  const orbit = wide ? ORBIT_WIDE : ORBIT_NARROW;

  const orbiting = spaces.slice(0, orbit.length);
  const rest = spaces.slice(orbit.length);

  return (
    <div>
      {/* --- opening screen ------------------------------------------- */}
      <section
        className="relative isolate overflow-hidden pb-10"
        // Capped on a phone so the opening screen cannot grow taller than a
        // hand can hold; a tablet gets the full viewport the reference uses.
        style={{ minHeight: wide ? '100dvh' : 'min(100dvh, 820px)' }}
        aria-label={`${person.name}'s world`}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-[-10%]">
          <CurvedGrid />
        </div>

        <Dais
          className={cn(
            'left-1/2 w-[130%] -translate-x-1/2',
            wide ? 'bottom-[18%]' : 'bottom-[8%]',
          )}
        />

        {/*
          Identity owns the top band; the figure occupies the lower half, so
          the name is never sitting on top of a face.

          `pointer-events-none` on the wrapper is load-bearing. This block is
          in normal flow, so its box spans the full width and runs well past
          the text — over the absolutely positioned orbit beneath it, which
          made the first two Space cards untappable. The block re-enables
          pointer events for its own content.
        */}
        <div
          className={cn(
            'pointer-events-none z-30 px-6',
            wide ? 'absolute left-[30.5%] top-[8%] w-[42%]' : 'relative pt-16',
          )}
        >
          <IdentityBlock
            person={person}
            size="lg"
            showRoles
            className={cn(
              'pointer-events-auto block text-left',
              wide ? 'max-w-none' : 'mx-auto max-w-[16rem]',
            )}
          />
        </div>

        {person.portrait || person.character ? (
          <motion.div
            initial={animate ? { opacity: 0, y: 24 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute left-1/2 z-20 flex -translate-x-1/2 justify-center',
              wide ? 'bottom-[17%] h-[54%] max-h-[660px]' : 'bottom-[7%] h-[52%] max-h-[440px]',
            )}
          >
            {person.portrait ? (
              <Picture
                media={person.portrait}
                priority
                sizes="40vw"
                className="block h-full"
                imgClassName="h-full w-auto [mix-blend-mode:screen]"
              />
            ) : (
              <LazyCharacterPreview
                config={person.character as CharacterConfig}
                alt={`${person.name}'s character`}
                className="h-full w-auto drop-shadow-[0_24px_40px_rgba(0,0,0,0.85)]"
              />
            )}
          </motion.div>
        ) : null}

        {/* Orbiting Spaces. */}
        <div className="pointer-events-none absolute inset-0 z-10" style={{ perspective: '900px' }}>
          {orbiting.map((space, i) => {
            const slot = orbit[i]!;
            return (
              <motion.div
                key={space.id}
                initial={animate ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto absolute"
                style={{
                  left: `${slot.l}%`,
                  top: `${slot.t}%`,
                  width: `${slot.w}%`,
                  transform: `rotateY(${slot.rot}deg)`,
                }}
              >
                <SpaceCard
                  space={space}
                  handle={person.handle}
                  itemCount={countFor(space.id)}
                  // The reference's tablet cards carry the descriptor as
                  // well as the title; a phone card has no room for it.
                  overlay={wide ? 'full' : 'title'}
                  ratio="4 / 3"
                  priority={i < 2}
                  sizes="38vw"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom left, below the dais, exactly where the reference puts it. */}
        <p
          className={cn(
            'pointer-events-none absolute left-6 z-30 hidden items-center gap-2.5 text-[10px] tracking-[0.22em] uppercase text-ink-3',
            // Below 420px the floating navigation reaches this corner, so the
            // hint is dropped rather than stacked underneath it.
            wide ? 'bottom-[13%] flex' : 'bottom-[104px] min-[420px]:flex',
          )}
        >
          <span aria-hidden="true" className="inline-block h-3 w-px bg-bronze-400" />
          Scroll to explore
        </p>
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
