/**
 * "Let's Connect" — the single primary action on a creator's world.
 *
 * Deliberately not a contact form: the useful outcome is reaching the person
 * where they already are, or taking the link away with you.
 */
import { Check, Copy, Link2 } from 'lucide-react';
import { Dialog } from '@/design/Dialog';
import { Button } from '@/design/primitives';
import { useCopy } from '@/lib/hooks';
import { absoluteUrl, routes } from '@/lib/routing/base';
import type { Person } from '@/lib/schema';

export function ConnectSheet({
  person,
  open,
  onClose,
}: {
  person: Person;
  open: boolean;
  onClose: () => void;
}) {
  const { copied, copy } = useCopy();
  const url = absoluteUrl(routes.profile(person.handle));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      variant="sheet"
      title={`Connect with ${person.name.split(' ')[0]}`}
      description={`${person.location} · ${person.roles.join(' · ')}`}
    >
      <ul className="mb-6 space-y-2">
        {person.socials.map((social) => (
          <li key={social.network + social.handle}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-line px-4 py-3.5 transition-colors hover:border-line-2 hover:bg-surface"
            >
              <span className="min-w-0">
                <span className="kicker block">{social.network}</span>
                <span className="mt-1 block truncate text-[14px] text-ink">{social.handle}</span>
              </span>
              <span
                aria-hidden="true"
                className="text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
              >
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="kicker mb-2.5 flex items-center gap-2">
          <Link2 className="size-3.5" strokeWidth={1.8} />
          Their Zat
        </p>
        <p className="mb-3.5 truncate font-mono text-[12.5px] text-ink-2">{url}</p>
        <Button
          variant={copied ? 'glass' : 'primary'}
          size="sm"
          onClick={() => void copy(url)}
          className="w-full"
        >
          {copied ? (
            <>
              <Check className="size-4" strokeWidth={2} /> Link copied
            </>
          ) : (
            <>
              <Copy className="size-4" strokeWidth={1.8} /> Copy link
            </>
          )}
        </Button>
      </div>
    </Dialog>
  );
}
