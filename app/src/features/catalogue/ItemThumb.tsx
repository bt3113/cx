/**
 * The visual for one item.
 *
 * 89 of the 120 seeded items have no photograph. The earlier build papered
 * over that with a generated gradient — the same one reused up to seventeen
 * times — which is precisely why the product read as unfinished: a grey
 * rectangle where a product shot belongs looks like a broken image, not a
 * design.
 *
 * So this does not pretend. An item with real photography gets it. An item
 * without gets a deliberate typographic plate: the brand set in the display
 * serif over a material tint drawn from its Space, with the category glyph
 * held quiet behind it. That is the pattern a catalogue uses when it has no
 * imagery rights, and it reads as a decision rather than a gap.
 *
 * `hasPhotography` is the single place that judgement lives. When a real
 * asset library is dropped into `media/`, items move to the photographic
 * branch by changing their `image.key` and nothing here needs touching.
 */
import {
  BookOpen, Camera, Clapperboard, Dumbbell, Gamepad2, Headphones, Home,
  Laptop, Lightbulb, Mountain, Plane, Shirt, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/design/cn';
import { Picture } from '@/lib/media';
import type { Item, Space } from '@/lib/schema';

/**
 * Asset families that hold genuine extracted photography. Everything else in
 * `media/` is generated material — usable as a tint, never as a product shot.
 */
const PHOTOGRAPHIC = /^(spaces|portrait|books|avatars|detail)\//;

export function hasPhotography(item: Item): boolean {
  return PHOTOGRAPHIC.test(item.image.key);
}

/** One glyph per Space, keyed off the slug so a new Space degrades quietly. */
const SPACE_GLYPH: Record<string, LucideIcon> = {
  wardrobe: Shirt,
  music: Headphones,
  travel: Plane,
  memories: Mountain,
  books: BookOpen,
  work: Laptop,
  photography: Camera,
  fitness: Dumbbell,
  gaming: Gamepad2,
  movies: Clapperboard,
  ideas: Lightbulb,
  life: Home,
  'field-kit': Camera,
  darkroom: Camera,
  places: Mountain,
  reading: BookOpen,
  desk: Laptop,
  tools: Laptop,
  chairs: Home,
  materials: Home,
  running: Dumbbell,
  building: Laptop,
  home: Home,
};

/**
 * A quiet tint per Space so a wall of plates does not read as one grey
 * block. These are material washes, not brand colours — they sit at a few
 * percent over the panel and never compete with a real photograph beside
 * them.
 */
const SPACE_TINT: Record<string, string> = {
  wardrobe: '#6e2b33',
  music: '#2f3a4a',
  travel: '#3d5570',
  memories: '#7a4630',
  books: '#6b5a35',
  work: '#35414a',
  photography: '#4a4038',
  fitness: '#3a3a40',
  gaming: '#402f4d',
  movies: '#5a3a30',
  ideas: '#3d4440',
  life: '#31505a',
};

export function ItemThumb({
  item,
  space,
  sizes,
  className,
  imgClassName,
  priority,
}: {
  item: Item;
  /** Used for the glyph and tint on the non-photographic plate. */
  space?: Space;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  if (hasPhotography(item)) {
    return (
      <Picture
        media={item.image}
        sizes={sizes}
        priority={priority}
        className={cn('h-full w-full', className)}
        imgClassName={cn('h-full w-full object-cover', imgClassName)}
      />
    );
  }

  const slug = space?.slug ?? '';
  const Glyph = SPACE_GLYPH[slug] ?? Lightbulb;
  const tint = SPACE_TINT[slug] ?? '#3a3a40';
  const label = item.brand ?? item.retailer ?? space?.title ?? 'Zat';

  return (
    <div
      role="img"
      aria-label={item.image.alt || `${item.title}, no photograph`}
      className={cn(
        'bg-card relative grid h-full w-full place-items-center overflow-hidden',
        className,
      )}
    >
      {/* Material wash. Two stops so the plate has a light source, matching
          the way the photographed items are lit from above. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 50% 0%, ${tint}38 0%, ${tint}14 45%, transparent 100%)`,
        }}
      />
      <Glyph
        aria-hidden="true"
        className="absolute -right-[12%] -bottom-[14%] size-[72%] text-white/[0.045]"
        strokeWidth={1}
      />
      <span className="text-ink/80 font-display relative z-10 max-w-[80%] text-center text-[clamp(13px,1.6vw,19px)] leading-tight text-balance">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
      />
    </div>
  );
}
