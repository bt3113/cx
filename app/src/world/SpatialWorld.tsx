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
import { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { cn } from '@/design/cn';
import { ProfilePortrait } from '@/features/identity/ProfilePortrait';
import { repo } from '@/lib/repo';
import type { Item, Person, Space } from '@/lib/schema';
import { CurvedGrid, Dais } from './CurvedGrid';
import { SpaceCard, SpaceMeta } from './SpaceCard';
import { IdentityBlock } from './IdentityBlock';
import { CENTRE_COL, COLUMNS, DESKTOP_SLOTS, GAP, ROWS } from './slots';

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
        The wall.

        A CSS Grid, not a field of absolutely positioned boxes. Every Space
        occupies one cell of a five-by-three track definition, so a row is a
        row by construction and alignment cannot drift — which is exactly
        what went wrong when these were hand-placed percentages.

        `perspective` lives on the stage above, shared by everything in
        here. That single viewpoint is what makes the outer columns turn
        toward the eye and read as a curved room; per-card perspective gives
        each card its own vanishing point and reads as unrelated skew.

        `pointer-events-none` is load-bearing: cards sit at a negative
        translateZ inside this preserve-3d container, so the container wins
        every hit test unless its children opt back in.
      */}
      <motion.div
        className="preserve-3d pointer-events-none absolute inset-0 grid content-center px-[3%] pt-[6%] pb-[7%]"
        style={{
          gridTemplateColumns: COLUMNS,
          gridTemplateRows: ROWS,
          gap: GAP,
          rotateY,
          rotateX,
          x: shiftX,
        }}
      >
        {/* Floor. */}
        <Dais rings={false} className="bottom-[14%] left-1/2 w-[46%] -translate-x-1/2" />

        {/*
          The creator's column: portrait, name, links — stacked and centred,
          spanning all three rows.

          It replaces the standing figure, which came from the design
          reference and so showed the same stranger on every creator's
          world. The centre track is 22% of the stage, which is not enough
          to set a display name beside a portrait without one crowding the
          other, so the two stack — which is what a profile photograph
          wants anyway.
        */}
        <motion.div
          className="pointer-events-auto z-30 flex flex-col items-center self-start text-center"
          style={{ gridColumn: CENTRE_COL, gridRow: '1 / -1', x: figureX }}
          initial={strength ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProfilePortrait person={person} priority className="w-[58%]" />
          <IdentityBlock
            person={person}
            layout="inline"
            className="mt-5 w-full [&>ul]:justify-center"
          />
        </motion.div>

        {/* Spaces. */}
        {spaces.slice(0, slots.length).map((space, i) => {
          const slot = slots[i]!;
          const count = items
            ? items.filter((it) => it.spaceId === space.id).length
            : repo.listItems(space.id).length;

          return (
            <motion.div
              key={space.id}
              className="preserve-3d z-10 flex items-start"
              style={{
                gridColumn: slot.col,
                gridRow: slot.row,
                marginTop: `${slot.drop}%`,
                rotateY: slot.rotateY,
                z: slot.depth,
              }}
              initial={strength ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* The meta column keeps its width whether or not it has text,
                  so an empty one never pulls its card out of line. */}
              <div className="pointer-events-auto shrink-0" style={{ width: `${slot.metaPct}%` }}>
                {slot.meta ? <SpaceMeta space={space} align="left" /> : null}
              </div>
              <div aria-hidden="true" className="shrink-0" style={{ width: `${slot.gapPct}%` }} />
              <div className="pointer-events-auto min-w-0 flex-1">
                <SpaceCard
                  space={space}
                  handle={person.handle}
                  itemCount={count}
                  overlay="caption"
                  ratio={slot.ratio}
                  priority={i < 4}
                  sizes="13vw"
                />
              </div>
            </motion.div>
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
