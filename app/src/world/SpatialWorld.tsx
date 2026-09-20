/**
 * The desktop world: a creator standing inside their own Spaces.
 *
 * The wall is a faceted cylinder. Five vertical faces are placed with the
 * standard CSS construction — the container is pushed back by the radius
 * and each face is rotated by its share of the arc and pushed forward by
 * the same radius — so the faces meet edge to edge and their borders form
 * one continuous lattice. `perspective` lives on the stage, shared by
 * every face; per-element perspective gives each one its own vanishing
 * point and reads as unrelated skew rather than a room.
 *
 * Crucially the lattice is not a drawing behind the content. Each cell of
 * it IS a Space — number, title, descriptor and artwork inside the panel,
 * exactly as the reference shows, with the centre face holding the
 * creator. Nothing floats on top of anything, so nothing can fall out of
 * alignment.
 *
 * All movement is transform-only and collapses entirely under
 * `prefers-reduced-motion` or a creator's "still" motion setting.
 */
import { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { cn } from '@/design/cn';
import { ProfilePortrait } from '@/features/identity/ProfilePortrait';
import { repo } from '@/lib/repo';
import type { Item, Person, Space } from '@/lib/schema';
import { IdentityBlock } from './IdentityBlock';
import { WallCell } from './WallCell';

const MOTION_STRENGTH: Record<Person['theme']['motion'], number> = {
  still: 0,
  subtle: 0.45,
  full: 1,
};

/**
 * Cylinder geometry.
 *
 * Five faces, each a fifth of the stage wide. The arc between faces is
 * kept shallow: at a steeper angle the outer faces foreshorten so hard
 * that their text becomes unreadable, which is the opposite of what the
 * curve is for. The radius follows from the face width and the angle —
 * r = (w / 2) / tan(theta / 2) — so the faces are edge to edge with no gap.
 */
const FACE_COUNT = 5;
const FACE_W = 20; // vw
const THETA = 10; // degrees between faces
const RADIUS = FACE_W / 2 / Math.tan((THETA * Math.PI) / 360); // vw

/** Which Space sits in which face and row. Centre face holds the creator. */
const CENTRE_FACE = 2;
const FACE_ORDER = [0, 1, 3, 4] as const;

export function SpatialWorld({
  person,
  spaces,
  items,
  dimmed = false,
}: {
  person: Person;
  spaces: Space[];
  /** The published world's items, when the creator has edited their own. */
  items?: Item[];
  /** True while a Space panel is open above the world. */
  dimmed?: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const strength = prefersReduced ? 0 : MOTION_STRENGTH[person.theme.motion];

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 42, damping: 18, mass: 0.7 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateY = useTransform(sx, [-1, 1], [2.6 * strength, -2.6 * strength]);
  const rotateX = useTransform(sy, [-1, 1], [-1.6 * strength, 1.6 * strength]);

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

  const countFor = (spaceId: string) =>
    items ? items.filter((i) => i.spaceId === spaceId).length : repo.listItems(spaceId).length;

  /** Three Spaces per flanking face, in the reference's numbered order. */
  const facesContent: Space[][] = FACE_ORDER.map((_face, column) =>
    [0, 1, 2]
      .map((row) => spaces[row * 4 + column])
      .filter((space): space is Space => Boolean(space)),
  );

  return (
    <div
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        'relative h-[min(100dvh,1040px)] min-h-[700px] w-full overflow-hidden',
        'transition-[opacity,filter] duration-500 ease-[var(--ease-out-soft)]',
        dimmed && 'pointer-events-none opacity-35 blur-[2px]',
      )}
      style={{ perspective: '2200px', perspectiveOrigin: '50% 45%' }}
    >
      {/* Ambient key light from above the frame, and the pool under the
          creator. Both are light, not structure — the structure is the
          lattice itself. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_-8%,rgba(242,217,176,0.09),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[6%] left-1/2 h-[26%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(216,169,106,0.13),transparent)]"
      />

      {/*
        Two elements, deliberately. Motion writes the `transform` property
        itself, so a `transform` string handed to it in `style` is silently
        dropped — the container's pull-back vanished and every face flew at
        the camera. The spring lives on the outer element; the cylinder's
        own translation lives on an inner one that motion never touches.
      */}
      <motion.div className="preserve-3d absolute inset-0" style={{ rotateY, rotateX }}>
        <div
          className="preserve-3d absolute inset-0"
          style={{ transform: `translateZ(-${RADIUS}vw)` }}
        >
        {Array.from({ length: FACE_COUNT }, (_, face) => {
          const angle = (face - (FACE_COUNT - 1) / 2) * THETA;
          const isCentre = face === CENTRE_FACE;
          const column = FACE_ORDER.indexOf(face as (typeof FACE_ORDER)[number]);

          return (
            <div
              key={face}
              className={cn(
                'preserve-3d absolute top-[11%] bottom-[12%] left-1/2',
                // The last face closes the lattice on the right.
                face === FACE_COUNT - 1 && 'border-r border-bronze-600/22',
              )}
              style={{
                width: `${FACE_W}vw`,
                marginLeft: `-${FACE_W / 2}vw`,
                transform: `rotateY(${angle}deg) translateZ(${RADIUS}vw)`,
              }}
            >
              {isCentre ? (
                <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                  <ProfilePortrait person={person} priority className="w-[78%]" />
                  <IdentityBlock
                    person={person}
                    layout="inline"
                    className="mt-6 w-full [&>ul]:justify-center"
                  />
                </div>
              ) : (
                <div className="grid h-full grid-rows-3 border-b border-bronze-600/22">
                  {facesContent[column]!.map((space, row) => (
                    <motion.div
                      key={space.id}
                      className="min-h-0"
                      initial={strength ? { opacity: 0, y: 14 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.65,
                        delay: 0.06 * (row * 4 + column),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <WallCell
                        space={space}
                        handle={person.handle}
                        itemCount={countFor(space.id)}
                        priority={row === 0}
                        className="h-full"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </motion.div>
    </div>
  );
}
