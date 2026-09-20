/**
 * Not found.
 *
 * A 404 on Zat usually means a mistyped handle, so the page offers real
 * creators to visit rather than a dead end and an apology.
 */
import { Link } from 'react-router';
import { ButtonLink, Section, Wordmark } from '@/design/primitives';
import { Picture } from '@/lib/media';
import { repo } from '@/lib/repo';
import { routes } from '@/lib/routing/base';
import { Meta } from '@/seo/Meta';

const COPY = {
  profile: {
    title: 'No Zat at that address',
    body: 'That handle has not been claimed, or the creator has unpublished their world. It could also be yours.',
  },
  space: {
    title: 'That Space has moved on',
    body: 'Creators reshape their worlds. This Space may have been renamed, merged or retired.',
  },
  item: {
    title: 'That recommendation is gone',
    body: 'Items come and go as creators re-check what they actually still use. That is the point of them.',
  },
  page: {
    title: 'This page does not exist',
    body: 'The link may be out of date, or the address slightly off.',
  },
} as const;

export function NotFoundRoute({ kind = 'page' }: { kind?: keyof typeof COPY }) {
  const copy = COPY[kind];
  const suggestions = repo.listPeople().slice(0, 3);

  return (
    <>
      <Meta
        title={`${copy.title} — Zat`}
        description={copy.body}
        path="/404"
        noIndex
      />
      <main id="main" className="relative min-h-dvh overflow-hidden bg-void pb-24 pt-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_50%_0%,rgba(216,169,106,0.12),transparent_62%)]"
        />

        <Section className="relative">
          <Link to={routes.home()} className="inline-block" aria-label="Zat home">
            <Wordmark />
          </Link>

          <div className="mx-auto max-w-[640px] pb-14 pt-[14vh] text-center">
            <p className="kicker mb-5">Error 404</p>
            <h1 className="font-display mb-5 text-d2 leading-[1.02]">
              {copy.title}
            </h1>
            <p className="mx-auto mb-9 max-w-[460px] text-[16px] leading-relaxed text-ink-2">
              {copy.body}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink to={routes.home()} variant="primary">
                Back to Zat
              </ButtonLink>
              <ButtonLink to={routes.discover()} variant="glass">
                Explore creators
              </ButtonLink>
            </div>
          </div>

          <div className="mx-auto max-w-[760px]">
            <h2 className="kicker mb-5 text-center">Worlds worth a look</h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <Link
                    to={routes.profile(p.handle)}
                    className="group flex items-center gap-3.5 rounded-2xl border border-line p-3.5 transition-colors hover:border-line-2 hover:bg-surface"
                  >
                    <Picture
                      media={p.avatar}
                      sizes="48px"
                      className="size-11 shrink-0 overflow-hidden rounded-full"
                      imgClassName="size-11 object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] text-ink">{p.name}</span>
                      <span className="block truncate text-[12px] text-ink-3">@{p.handle}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </main>
    </>
  );
}
