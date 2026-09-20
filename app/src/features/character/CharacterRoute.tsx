import { Link } from 'react-router';
import { repo } from '@/lib/repo';
import { routes } from '@/lib/routing/base';
import { CharacterCreator } from './CharacterCreator';
import { ALEX_CHARACTER, DEFAULT_CHARACTER } from './manifest';

export function CharacterRoute() {
  const person = repo.getPerson('alexden');
  const handle = person?.handle ?? 'alexden';
  const initial = handle === 'alexden' ? ALEX_CHARACTER : DEFAULT_CHARACTER;

  return (
    <main id="main" className="min-h-dvh bg-void text-ink">
      <header className="flex items-center justify-between border-b border-line px-5 py-4 lg:px-10">
        <Link to={routes.home()} className="font-display text-[31px] leading-none tracking-[0.005em] text-ink">Zat.</Link>
        <div className="flex items-center gap-2">
          <Link to={routes.profile(handle)} className="rounded-full border border-line px-3.5 py-2 text-xs text-ink-2 hover:border-line-2 hover:text-ink">View profile</Link>
          <span className="rounded-full border border-bronze-400/40 bg-bronze-400/10 px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] text-bronze-300">£0 asset cost</span>
        </div>
      </header>
      <CharacterCreator handle={handle} initial={initial} />
    </main>
  );
}
