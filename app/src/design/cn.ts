/**
 * Class-name joiner with Tailwind conflict resolution.
 *
 * `tailwind-merge` is not optional here. Every vendored component composes a
 * `cva` base with a caller's `className`, and without conflict resolution a
 * caller passing `px-6` to a button whose base sets `px-4` gets both classes
 * and whichever the stylesheet happens to order last — so overrides appear
 * to work at random. This is the same helper shadcn's own components assume.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type { ClassValue };

export function cn(...parts: ClassValue[]): string {
  return twMerge(clsx(parts));
}
