/**
 * The desktop world: a creator standing inside their own Spaces.
 *
 * The composition is not a grid. Cards sit on a virtual cylinder — each one
 * rotated and pushed back according to how far it is from the centre — with
 * the figure as the anchor. A pointer-driven spring turns the whole stage a
 * few degrees, which is what makes it feel like a place rather than a page.
 *
 * All movement is transform-only and collapses entirely under
 * `prefers-reduced-motion` or a creator's "still" motion setting.
 */
import { Fragment, useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { cn } from '@/design/cn';
import { repo } from '@/lib/repo';
import type { Person, Space } from '@/lib/schema';
import { ProfileCharacter } from '@/features/character/ProfileCharacter';
import { CurvedGrid, Dais } from './CurvedGrid';
import { SpaceCard, SpaceMeta } from './SpaceCard';
import { IdentityBlock } from './IdentityBlock';
import { cylinder, DESKTOP_SLOTS, FIGURE, IDENTITY } from './slots';

const MOTION_STRENGTH: Record<Person['theme']['motion'], number> = {
  still: 0,
  subtle: 0.45,
  full: 1,
};

export function SpatialWorld({
  person,
  spaces,
  dimmed = false,
}: {
  person: Person;
  spaces: Space[];
  /** True while a Space panel is open above the world. */
  dimmed?: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const strength = prefersReduced ? 0 : MOTION_STRENGTH[person.theme.motion];

  // Pointer position normalised to -1..1 across the stage.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 42, damping: 18, mass: 0.7 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateY = useTransform(sx, [-1, 1], [3.6 * strength, -3.6 * strength]);
  const rotateX = useTransform(sy, [-1, 1], [-2 * strength, 2 * strength]);
  const shiftX = useTransform(sx, [-1, 1], [22 * strength, -22 * strength]);
  const bgX = useTransform(sx, [-1, 1], [12 * strength, -12 * strength]);
  const figureX = useTransform(sx, [-1, 1], [-8 * strength, 8 * strength]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!strength) return;
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      px.set(((e.clientX - r.left) / r.width) * 2 - 1);
      py.set(((e.clientY - r.top) / r.height) * 2 - 1);
    },
    [px, py, strength],
  );

  const onPointerLeave = useCallback(() => {
    px.set(0);
    py.set(0);
  }, [px, py]);

  useEffect(() => {
    const reset = () => {
      px.set(0);
      py.set(0);
    };
    window.addEventListener('blur', reset);
    return () => window.removeEventListener('blur', reset);
  }, [px, py]);

  const slots = DESKTOP_SLOTS;

  return (
    <div
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        'world-stage relative h-[min(100dvh,1040px)] min-h-[700px] w-full overflow-hidden',
        'transition-[opacity,filter] duration-500 ease-[var(--ease-out-soft)]',
        dimmed && 'pointer-events-none opacity-35 blur-[2px]',
      )}
    >
      <motion.div className="absolute inset-[-6%]" style={{ x: bgX }}>
        <CurvedGrid />
      </motion.div>

      <motion.div className="preserve-3d absolute inset-0" style={{ rotateY, rotateX, x: shiftX }}>
        <Dais className="bottom-[2%] left-1/2 w-[72%] -translate-x-1/2" />

        {/* The figure is now driven by structured character data. Creators
            without a character config continue to use the existing portrait. */}
        <motion.div
          className="absolute z-20"
          style={{
            left: `${FIGURE.l}%`,
            top: `${FIGURE.t}%`,
            width: `${FIGURE.w}%`,
            height: '72%',
            x: figureX,
            z: 60,
          }}
        >
          <ProfileCharacter person={person} sizes="16vw" className="h-full w-full" />
        </motion.div>

        <div
          className="absolute z-30"
          style={{ left: `${IDENTITY.l}%`, top: `${IDENTITY.t}%`, width: `${IDENTITY.w}%` }}
        >
          <IdentityBlock person={person} />
        </div>

        {spaces.slice(0, slots.length).map((space, i) => {
          const slot = slots[i]!;
          const geo = cylinder(slot.card, 1);
          const count = repo.listItems(space.id).length;

          return (
            <Fragment key={space.id}>
              {slot.meta ? (
                <div
                  className="absolute z-10"
                  style={{
                    left: `${slot.meta.l}%`,
                    top: `${slot.meta.t}%`,
                    width: `${slot.meta.w}%`,
                    transform: `perspective(1400px) rotateY(${geo.rotateY * 0.6}deg) translateZ(${geo.depth * 0.3}px)`,
                  }}
                >
                  <SpaceMeta space={space} align={slot.meta.align} />
                </div>
              ) : null}

              <motion.div
                className="absolute z-10"
                initial={strength ? { opacity: 0, y: 18 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  left: `${slot.card.l}%`,
                  top: `${slot.card.t}%`,
                  width: `${slot.card.w}%`,
                  transformPerspective: 1400,
                  rotateY: geo.rotateY,
                  z: geo.depth,
                }}
              >
                <SpaceCard
                  space={space}
                  handle={person.handle}
                  itemCount={count}
                  overlay={space.layout === 'tile' ? 'tile' : 'caption'}
                  priority={i < 4}
                  sizes="14vw"
                />
              </motion.div>
            </Fragment>
          );
        })}
      </motion.div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[14%] bg-gradient-to-r from-void to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[14%] bg-gradient-to-l from-void to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-t from-void to-transparent" />
    </div>
  );
}
