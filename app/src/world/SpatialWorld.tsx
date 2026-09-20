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
import { Picture } from '@/lib/media';
import { LazyCharacterPreview } from '@/features/character/LazyCharacterPreview';
import type { CharacterConfig } from '@/features/character/schema';
import { repo } from '@/lib/repo';
import type { Item, Person, Space } from '@/lib/schema';
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
  items,
  dimmed = false,
}: {
  person: Person;
  spaces: Space[];
  /**
   * The published world's items, when the creator has edited their own
   * profile in the Studio. Omitted for a seeded creator, where the counts
   * come from the repository instead.
   */
  items?: Item[];
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
  // The backdrop drifts less than the cards, which reads as depth.
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

  // A pointer leaving the window entirely never fires pointerleave on the
  // stage, which would strand the world off-centre.
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
      {/* Backdrop: curved architecture + ambient key light. */}
      <motion.div className="absolute inset-[-6%]" style={{ x: bgX }}>
        <CurvedGrid />
      </motion.div>

      {/*
        `pointer-events-none` is load-bearing, not tidying. Cards sit at a
        negative translateZ inside this preserve-3d container, which places
        them behind the container's own z=0 plane — so the container wins
        every hit test and nothing inside it is clickable. Each interactive
        child re-enables pointer events for itself.
      */}
      <motion.div
        className="preserve-3d pointer-events-none absolute inset-0"
        style={{ rotateY, rotateX, x: shiftX }}
      >
        {/* Floor. */}
        <Dais className="bottom-[2%] left-1/2 w-[72%] -translate-x-1/2" />

        {/* The figure — the anchor of the whole composition. A creator without
            a photograph gets their built character, framed as a bust on the
            dais rather than a stretched imitation of a full-length figure. */}
        {person.portrait || person.character ? (
          <motion.div
            className="pointer-events-none absolute z-20"
            style={{
              left: person.portrait ? `${FIGURE.l}%` : `${FIGURE.l - 1}%`,
              top: person.portrait ? `${FIGURE.t}%` : `${FIGURE.t + 14}%`,
              width: person.portrait ? `${FIGURE.w}%` : `${FIGURE.w + 2}%`,
              x: figureX,
              z: 60,
            }}
          >
            {person.portrait ? (
              <Picture
                media={person.portrait}
                priority
                sizes="16vw"
                className="block w-full"
                imgClassName="w-full h-auto [mix-blend-mode:screen]"
              />
            ) : (
              <LazyCharacterPreview
                config={person.character as CharacterConfig}
                alt={`${person.name}'s character`}
                className="w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.85)]"
              />
            )}
          </motion.div>
        ) : null}

        {/* Identity. */}
        <div
          className="pointer-events-auto absolute z-30"
          style={{ left: `${IDENTITY.l}%`, top: `${IDENTITY.t}%`, width: `${IDENTITY.w}%` }}
        >
          <IdentityBlock person={person} />
        </div>

        {/* Spaces. */}
        {spaces.slice(0, slots.length).map((space, i) => {
          const slot = slots[i]!;
          const geo = cylinder(slot.card, 1);
          const count = items
            ? items.filter((it) => it.spaceId === space.id).length
            : repo.listItems(space.id).length;

          return (
            // A wrapper element here must not carry `preserve-3d`: that
            // establishes a containing block, and a zero-height static wrapper
            // would then collapse every percentage offset inside it to 0.
            <Fragment key={space.id}>
              {slot.meta ? (
                <div
                  className="pointer-events-auto absolute z-10"
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
                className="pointer-events-auto absolute z-10"
                initial={strength ? { opacity: 0, y: 18 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                // Rotation and depth go through motion's own transform props —
                // a `transform` string in `style` is overwritten by the
                // animation and silently lost.
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
                  overlay="caption"
                  priority={i < 4}
                  sizes="14vw"
                />
              </motion.div>
            </Fragment>
          );
        })}
      </motion.div>

      {/*
        Edge vignettes keep the eye in the middle of the world, but the first
        and last meta columns sit at 3.3% — an opaque wash here was covering
        the Wardrobe and Gaming titles, which the reference keeps fully
        legible. Narrower, and to two thirds rather than solid.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-void/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[7%] bg-gradient-to-l from-void/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-t from-void to-transparent"
      />
    </div>
  );
}
