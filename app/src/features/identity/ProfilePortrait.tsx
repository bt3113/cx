/**
 * The creator's portrait: the centrepiece of their world.
 *
 * This replaces the standing figure the earlier build used. That figure was
 * extracted from the design reference, so it could only ever be one person —
 * every creator's world showed the same stranger. A framed portrait the
 * creator uploads is the thing the composition was always standing in for.
 *
 * Three states, in order of precedence: the photograph they uploaded, the
 * portrait shipped with a seeded profile, and an empty frame. The empty
 * state is designed rather than broken — initials set in the display serif
 * on lit glass — because a new creator sees it before they see anything else.
 */
import { Link } from 'react-router';
import { ImagePlus } from 'lucide-react';
import { cn } from '@/design/cn';
import { Picture } from '@/lib/media';
import { routes } from '@/lib/routing/base';
import type { Person } from '@/lib/schema';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export function ProfilePortrait({
  person,
  /** Shown only on the creator's own world, where the frame is actionable. */
  editable = false,
  className,
  priority = false,
}: {
  person: Person;
  editable?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const alt = `${person.name}`;

  const inner = person.photoUrl ? (
    <img src={person.photoUrl} alt={alt} className="h-full w-full object-cover" />
  ) : person.portrait ? (
    <Picture
      media={person.portrait}
      priority={priority}
      sizes="(min-width: 1280px) 16vw, 55vw"
      className="h-full w-full"
      imgClassName="h-full w-full object-cover object-top"
    />
  ) : (
    <span className="grid h-full w-full place-items-center">
      <span className="font-display text-ink/55 text-[clamp(38px,5vw,64px)] leading-none tracking-[0.04em]">
        {initials(person.name)}
      </span>
    </span>
  );

  const frame = (
    <span
      className={cn(
        'relative block aspect-[4/5] w-full overflow-hidden rounded-[22px]',
        // The frame is lit from above like everything else on the wall: a
        // bronze rim, a dark well, and a cast shadow onto the dais.
        'bg-panel border border-bronze-600/45',
        'shadow-[0_0_0_1px_rgba(216,169,106,0.08),0_0_70px_-18px_rgba(184,129,63,0.45),0_50px_90px_-30px_rgba(0,0,0,0.95)]',
        className,
      )}
    >
      {inner}

      {/* Top key light, so an uploaded snapshot still sits in the room. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(255,255,255,0.16),transparent_60%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent"
      />

      {editable ? (
        <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full border border-white/18 bg-black/55 px-3 py-2 text-[12px] font-medium text-ink backdrop-blur-md">
          <ImagePlus className="size-3.5" strokeWidth={1.8} />
          {person.photoUrl ? 'Change photo' : 'Add your photo'}
        </span>
      ) : null}
    </span>
  );

  if (!editable) return frame;

  return (
    <Link
      to={routes.studioIdentity()}
      className="group/frame block rounded-[22px] focus-visible:ring-2 focus-visible:ring-bronze-300 focus-visible:outline-none"
      aria-label={person.photoUrl ? 'Change your profile photograph' : 'Add your profile photograph'}
    >
      {frame}
    </Link>
  );
}
