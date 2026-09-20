import type { Person } from '@/lib/schema';
import { Picture } from '@/lib/media';
import { CharacterStage } from './CharacterStage';
import { characterFor } from './manifest';

export function ProfileCharacter({
  person,
  className = '',
  sizes = '20vw',
}: {
  person: Person;
  className?: string;
  sizes?: string;
}) {
  const character = characterFor(person.handle);
  if (character) {
    return <CharacterStage config={character} handle={person.handle} className={className} />;
  }
  if (!person.portrait) return null;
  return (
    <Picture
      media={person.portrait}
      priority
      sizes={sizes}
      className={className}
      imgClassName="h-full w-full object-contain [mix-blend-mode:screen]"
    />
  );
}
