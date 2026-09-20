/**
 * The vertical world.
 *
 * Deliberately not a scaled-down desktop scene. The vertical reference is more
 * editorial and more intimate: the figure and identity own the first screen
 * with a few Spaces orbiting them, and exploration then becomes a considered
 * vertical sequence rather than a grid.
 */
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/design/cn';
import { repo } from '@/lib/repo';
import type { Person, Space } from '@/lib/schema';
import { ProfileCharacter } from '@/features/character/ProfileCharacter';
import { CurvedGrid, Dais } from './CurvedGrid';
import { IdentityBlock } from './IdentityBlock';
import { SpaceCard } from './SpaceCard';

const ORBIT = [
  { l: -2, t: 8, w: 40, rot: 11 },
  { l: 62, t: 14, w: 40, rot: -11 },
  { l: -4, t: 40, w: 38, rot: 9 },
  { l: 64, t: 46, w: 38, rot: -9 },
] as const;

export function MobileWorld({ person, spaces }: { person: Person; spaces: Space[] }) {
  const prefersReduced = useReducedMotion();
  const animate = !prefersReduced && person.theme.motion !== 'still';

  const orbiting = spaces.slice(0, ORBIT.length);
  const rest = spaces.slice(ORBIT.length);

  return (
    <div>
      <section
        className="relative isolate overflow-hidden pb-10"
        style={{ minHeight: 'min(104dvh, 860px)' }}
        aria-label={`${person.name}'s world`}
      >
        <div className="absolute inset-[-10%]">
          <CurvedGrid />
        </div>

        <Dais className="bottom-[8%] left-1/2 w-[130%] -translate-x-1/2" />

        <div className="relative z-30 px-6 pt-10 text-center">
          <IdentityBlock person={person} size="lg" showRoles className="mx-auto inline-block text-left" />
        </div>

        <motion.div
          initial={animate ? { opacity: 0, y: 24 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 bottom-[5%] z-20 mx-auto h-[58%] w-[62%] max-w-[310px]"
        >
          <ProfileCharacter person={person} sizes="62vw" className="h-full w-full" />
        </motion.div>

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
                  overlay="full"
                  priority={i < 2}
                  sizes="40vw"
                />
              </motion.div>
            );
          })}
        </div>

        <p className="absolute bottom-3 left-6 z-30 flex items-center gap-2.5 text-[10px] uppercase tracking-[0.22em] text-ink-3">
          <span aria-hidden="true" className="inline-block h-3 w-px bg-bronze-400" />
          Scroll to explore
        </p>
      </section>

      {rest.length ? (
        <section className="px-5 pb-8" aria-label="More Spaces">
          <h2 className="kicker mb-5">The rest of the world</h2>
          <ul className="space-y-6">
            {rest.map((space, i) => (
              <li key={space.id} className={cn(i % 2 === 0 ? 'mr-8' : 'ml-8')}>
                <SpaceCard
                  space={space}
                  handle={person.handle}
                  itemCount={repo.listItems(space.id).length}
                  overlay="full"
                  ratio="4 / 3"
                  sizes="86vw"
                />
                <p className="mt-2.5 text-[11px] text-ink-3">{repo.listItems(space.id).length} items</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
