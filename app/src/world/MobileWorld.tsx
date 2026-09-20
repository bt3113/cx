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
import { Picture } from '@/lib/media';
import { CharacterPreview } from '@/features/character/CharacterBuilder';
import type { CharacterConfig } from '@/features/character/schema';
import { repo } from '@/lib/repo';
import type { Person, Space } from '@/lib/schema';
import { CurvedGrid, Dais } from './CurvedGrid';
import { IdentityBlock } from './IdentityBlock';
import { SpaceCard } from './SpaceCard';

/** Opening-screen orbit positions, mirroring the vertical reference. */
const ORBIT = [
  { l: 0, t: 19, w: 37, rot: 10 },
  { l: 63, t: 24, w: 37, rot: -10 },
  { l: 0, t: 46, w: 35, rot: 8 },
  { l: 65, t: 51, w: 35, rot: -8 },
] as const;

export function MobileWorld({ person, spaces }: { person: Person; spaces: Space[] }) {
  const prefersReduced = useReducedMotion();
  const animate = !prefersReduced && person.theme.motion !== 'still';

  const orbiting = spaces.slice(0, ORBIT.length);
  const rest = spaces.slice(ORBIT.length);

  return (
    <div>
      {/* --- opening screen ------------------------------------------- */}
      <section
        className="relative isolate overflow-hidden pb-10"
        style={{ minHeight: 'min(100dvh, 820px)' }}
        aria-label={`${person.name}'s world`}
      >
        <div className="absolute inset-[-10%]">
          <CurvedGrid />
        </div>

        <Dais className="bottom-[8%] left-1/2 w-[130%] -translate-x-1/2" />

        {/* Identity owns the top band; the figure occupies the lower half, so
            the name is never sitting on top of a face. */}
        <div className="relative z-30 px-6 pt-24 text-center">
          <IdentityBlock person={person} size="lg" className="mx-auto inline-block text-left" />
        </div>

        {person.portrait || person.character ? (
          <motion.div
            initial={animate ? { opacity: 0, y: 24 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[7%] left-1/2 z-20 flex h-[52%] max-h-[440px] -translate-x-1/2 justify-center"
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
              <CharacterPreview
                config={person.character as CharacterConfig}
                alt={`${person.name}'s character`}
                className="h-full w-auto drop-shadow-[0_24px_40px_rgba(0,0,0,0.85)]"
              />
            )}
          </motion.div>
        ) : null}

        {/* Orbiting Spaces. */}
        <div className="absolute inset-0 z-10" style={{ perspective: '900px' }}>
          {orbiting.map((space, i) => {
            const slot = ORBIT[i]!;
            return (
              <motion.div
                key={space.id}
                initial={animate ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="absolute"
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
                  itemCount={repo.listItems(space.id).length}
                  overlay="title"
                  ratio="4 / 3"
                  priority={i < 2}
                  sizes="38vw"
                />
              </motion.div>
            );
          })}
        </div>

        <p className="absolute bottom-24 left-6 z-30 flex items-center gap-2.5 text-[10px] uppercase tracking-[0.22em] text-ink-3">
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
                  itemCount={repo.listItems(space.id).length}
                  overlay="full"
                  ratio="4 / 3"
                  sizes="86vw"
                />
                <p className="mt-2.5 text-[11px] text-ink-3">
                  {repo.listItems(space.id).length} items
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
