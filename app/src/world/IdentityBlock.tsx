/**
 * The creator's identity, set beside the figure.
 *
 * Identity comes first in Zat's hierarchy, so this is the largest type in the
 * world and the only place the display serif appears at size. The reference
 * pairs the name with a short icon list mixing social handles and roles.
 */
import { AtSign, Brush, Briefcase, Compass, Globe, Music2, Package, Play } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/design/cn';
import type { Person } from '@/lib/schema';

/**
 * Generic glyphs rather than brand marks. lucide dropped its brand icon set,
 * and a neutral glyph avoids reproducing a third-party logo for what is only
 * a link label.
 */
const NETWORK_ICON: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  instagram: AtSign,
  x: AtSign,
  tiktok: Music2,
  youtube: Play,
  linkedin: Briefcase,
  dribbble: Brush,
  website: Globe,
};

const ROLE_ICON: ComponentType<{ className?: string; strokeWidth?: number }>[] = [
  Briefcase,
  Package,
  Compass,
];

export function IdentityBlock({
  person,
  size = 'md',
  showRoles = false,
  className,
}: {
  person: Person;
  size?: 'md' | 'lg';
  /** The vertical composition lists roles beneath the handles. */
  showRoles?: boolean;
  className?: string;
}) {
  const nameSize =
    size === 'lg'
      ? 'text-[clamp(38px,6.4vw,58px)]'
      : 'text-[clamp(22px,2.6vw,40px)]';

  const rows = person.socials.slice(0, showRoles ? 2 : 3);

  return (
    <div className={cn('min-w-0', className)}>
      <h1
        className={cn(
          'font-display mb-4 leading-[0.98] tracking-[-0.02em] text-ink',
          nameSize,
        )}
      >
        {person.name}
      </h1>

      <ul className="space-y-2.5">
        {rows.map((social) => {
          const Icon = NETWORK_ICON[social.network] ?? Globe;
          return (
            <li key={social.network + social.handle}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 text-[clamp(11px,0.95vw,14px)] text-ink-2 transition-colors hover:text-ink"
              >
                <Icon className="size-[1.15em] shrink-0 opacity-70" strokeWidth={1.6} />
                <span className="truncate">{social.handle}</span>
              </a>
            </li>
          );
        })}

        {showRoles
          ? person.roles.slice(0, 3).map((role, i) => {
              const Icon = ROLE_ICON[i % ROLE_ICON.length]!;
              return (
                <li
                  key={role}
                  className="flex items-center gap-2.5 text-[clamp(11px,0.95vw,14px)] text-ink-2"
                >
                  <Icon className="size-[1.15em] shrink-0 opacity-70" strokeWidth={1.6} />
                  <span>{role}</span>
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
}
