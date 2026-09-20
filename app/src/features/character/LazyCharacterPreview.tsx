/**
 * The character preview, loaded on demand.
 *
 * DiceBear's collection is ~2MB of style modules. A visitor arriving at a
 * creator's public link should never download it: it is needed only when a
 * creator has generated a character instead of uploading a photograph, and
 * only ever for one image on the page. Importing it statically from the
 * world put the whole collection in the entry chunk.
 *
 * The fallback is a plain circle rather than a spinner, so the composition
 * does not reflow when the real image lands.
 */
import { Suspense, lazy } from 'react';
import { cn } from '@/design/cn';
import type { CharacterConfig } from '@/features/character/schema';

const CharacterPreview = lazy(async () => ({
  default: (await import('@/features/character/CharacterBuilder')).CharacterPreview,
}));

export function LazyCharacterPreview({
  config,
  className,
  alt,
}: {
  config: CharacterConfig;
  className?: string;
  alt: string;
}) {
  return (
    <Suspense
      fallback={<div aria-hidden="true" className={cn('rounded-full bg-surface', className)} />}
    >
      <CharacterPreview config={config} className={className} alt={alt} />
    </Suspense>
  );
}
