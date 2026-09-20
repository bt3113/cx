/**
 * The creator's identity, set beside the figure.
 *
 * Identity comes first in Zat's hierarchy, so this is the largest type in the
 * world and the only place the display serif appears at size. The reference
 * pairs the name with a short icon list mixing social handles and roles.
 */
import { Briefcase, Compass, Package } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/design/cn';
import { networkIcon } from '@/design/network-icons';
import type { Person } from '@/lib/schema';

/** Roles cycle through these in the order the creator listed them. */
const ROLE_ICON: ComponentType<{ className?: string; strokeWidth?: number }>[] = [
  Briefcase,
  Package,
  Compass,
];

export function IdentityBlock({
  person,
  size = 'md',
  showRoles = false,
  layout = 'stack',
  className,
}: {
  person: Person;
  size?: 'md' | 'lg';
  /** The vertical composition lists roles beneath the handles. */
  showRoles?: boolean;
  /**
   * `stack` is the reference's desktop grammar: one link per line beside the
   * name. `inline` collapses the same links into a single centred row, which
   * is what the narrow composition needs — three stacked rows ran straight
   * into the orbiting cards beside them.
   */
  layout?: 'stack' | 'inline';
  className?: string;
}) {
  const nameSize =
    size === 'lg'
      ? 'text-[clamp(46px,7.6vw,74px)]'
      : 'text-[clamp(28px,3.2vw,50px)]';

  const rows = person.socials.slice(0, showRoles ? 2 : 3);
  const inline = layout === 'inline';

  return (
    <div className={cn('min-w-0', className)}>
      <h1
        className={cn(
          'font-display mb-4 leading-[1.02] tracking-[0] text-ink',
          nameSize,
        )}
      >
        {person.name}
      </h1>

      <ul className={cn(inline ? 'flex flex-wrap items-center gap-x-4 gap-y-2' : 'space-y-2')}>
        {rows.map((social) => {
          const Icon = networkIcon(social.network);
          return (
            <li key={social.network + social.handle}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group inline-flex items-center gap-2 text-ink-2 transition-colors hover:text-ink',
                  inline ? 'text-[13px]' : 'gap-2.5 text-[clamp(12px,0.95vw,14px)]',
                )}
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
                  className={cn(
                    'flex items-center gap-2.5 text-ink-2',
                    inline ? 'text-[13px]' : 'text-[clamp(12px,0.95vw,14px)]',
                  )}
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
