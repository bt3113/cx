/**
 * Content — the other half of the relationship an Item carries.
 *
 * An Item lists the content it appears in ("Seen in"); a piece of content
 * lists the Items inside it ("Everything in this video"). Both directions are
 * derived from one authored field, so they can never drift apart.
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ProfileShell } from '@/app/ProfileChrome';
import { ButtonLink, DisclosureChip, Section } from '@/design/primitives';
import { Picture } from '@/lib/media';
import { repo } from '@/lib/repo';
import { usePublicWorld } from '@/stores/studio';
import { routes } from '@/lib/routing/base';
import { CONTENT_LABEL } from '@/lib/schema';
import { Meta } from '@/seo/Meta';
import { NotFoundRoute } from '@/routes/NotFound';
import { ConnectSheet } from '@/routes/profile/ConnectSheet';

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export function ContentIndexRoute() {
  const { handle } = useParams();
  const [connectOpen, setConnectOpen] = useState(false);
  const world = usePublicWorld(handle);
  const person = world?.person;
  if (!person) return <NotFoundRoute kind="profile" />;

  const pieces = repo.listContent(person.id);

  return (
    <>
      <Meta
        title={`Projects — ${person.name} on Zat`}
        description={`Work and content published by ${person.name}, with the Items that appear in each piece.`}
        path={`/${person.handle}/content`}
      />
      <ProfileShell person={person} onConnect={() => setConnectOpen(true)}>
        <div className="pb-32 pt-24">
          <Section width="wide">
            <p className="kicker mb-4">Projects</p>
            <h1 className="font-display mb-4 text-[clamp(30px,4.4vw,52px)] leading-[1.02]">
              What {person.name.split(' ')[0]} has published
            </h1>
            <p className="mb-12 max-w-[58ch] text-[15px] leading-relaxed text-ink-2">
              Every piece lists the Items that appear in it, so a recommendation can always be
              traced back to the moment it was actually used.
            </p>

            {pieces.length ? (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pieces.map((content) => {
                  const items = repo.itemsForContent(content.id);
                  return (
                    <li key={content.id}>
                      <Link
                        to={routes.content(person.handle, content.slug)}
                        className="group/c block h-full overflow-hidden rounded-[var(--radius-panel)] border border-line transition-colors hover:border-line-2"
                      >
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <Picture
                            media={content.thumb}
                            sizes="(min-width: 1024px) 30vw, 92vw"
                            className="absolute inset-0 h-full w-full"
                            imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover/c:scale-105"
                          />
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent"
                          />
                          <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] backdrop-blur-sm">
                            {CONTENT_LABEL[content.type]}
                          </span>
                        </div>
                        <div className="p-5">
                          <h2 className="mb-2 line-clamp-2 text-[16px] font-medium leading-snug text-ink">
                            {content.title}
                          </h2>
                          <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-ink-3">
                            {content.summary}
                          </p>
                          <p className="text-[11.5px] text-ink-3">
                            {dateLabel(content.publishedAt)} ·{' '}
                            {content.views.toLocaleString('en-GB')} views · {items.length} Items
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-[var(--radius-panel)] border border-dashed border-line px-6 py-16 text-center">
                <p className="mb-2 text-[16px] text-ink">Nothing published here yet</p>
                <p className="mx-auto max-w-[40ch] text-[13.5px] leading-relaxed text-ink-3">
                  When {person.name.split(' ')[0]} connects a piece of content, the Items inside it
                  will appear here automatically.
                </p>
              </div>
            )}
          </Section>
        </div>
      </ProfileShell>
      <ConnectSheet person={person} open={connectOpen} onClose={() => setConnectOpen(false)} />
    </>
  );
}

export function ContentDetailRoute() {
  const { handle, contentSlug } = useParams();
  const [connectOpen, setConnectOpen] = useState(false);
  const world = usePublicWorld(handle);
  const person = world?.person;
  if (!person) return <NotFoundRoute kind="profile" />;

  const content = contentSlug ? repo.getContent(person.id, contentSlug) : undefined;
  if (!content) return <NotFoundRoute kind="page" />;

  const items = repo.itemsForContent(content.id);

  return (
    <>
      <Meta
        title={`${content.title} — ${person.name} on Zat`}
        description={content.summary}
        path={routes.content(person.handle, content.slug)}
        image={`media/${content.thumb.key}.webp`}
        type="article"
      />
      <ProfileShell person={person} onConnect={() => setConnectOpen(true)}>
        <div className="pb-32 pt-24">
          <Section>
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
                <li>
                  <Link to={routes.profile(person.handle)} className="hover:text-ink">
                    {person.name}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link to={`/${person.handle}/content`} className="hover:text-ink">
                    Projects
                  </Link>
                </li>
              </ol>
            </nav>

            <p className="kicker mb-4">
              {CONTENT_LABEL[content.type]} · {dateLabel(content.publishedAt)}
            </p>
            <h1 className="font-display mb-5 text-[clamp(28px,4.2vw,50px)] leading-[1.03]">
              {content.title}
            </h1>
            <p className="mb-8 max-w-[58ch] text-[15.5px] leading-relaxed text-ink-2">
              {content.summary}
            </p>

            <div className="mb-10 overflow-hidden rounded-[var(--radius-panel)] border border-line">
              <Picture
                media={content.thumb}
                priority
                sizes="100vw"
                className="aspect-[16/9] w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>

            {content.url ? (
              <div className="mb-14 flex flex-wrap items-center gap-4">
                <ButtonLink to={content.url} external variant="glass">
                  Watch on {CONTENT_LABEL[content.type]}
                  <span aria-hidden="true">↗</span>
                </ButtonLink>
                <span className="text-[12.5px] text-ink-3">
                  {content.views.toLocaleString('en-GB')} views
                </span>
              </div>
            ) : null}

            <section className="border-t border-line pt-12">
              <h2 className="font-display mb-2 text-[clamp(22px,2.6vw,30px)]">
                Everything in this {CONTENT_LABEL[content.type].toLowerCase()}
              </h2>
              <p className="mb-8 max-w-[54ch] text-[14px] leading-relaxed text-ink-3">
                Each one carries its own disclosure and the context behind it, rather than a bare
                affiliate list under a video.
              </p>

              <ul className="space-y-3">
                {items.map((item) => {
                  const space = repo.getSpaceById(item.spaceId);
                  if (!space) return null;
                  return (
                    <li key={item.id}>
                      <Link
                        to={routes.item(person.handle, space.slug, item.slug)}
                        className="group/i flex items-center gap-4 rounded-2xl border border-line p-3.5 transition-colors hover:border-line-2 hover:bg-surface"
                      >
                        <Picture
                          media={item.image}
                          sizes="88px"
                          className="size-[76px] shrink-0 overflow-hidden rounded-xl"
                          imgClassName="size-[76px] object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="mb-1 block truncate text-[15px] font-medium text-ink">
                            {item.title}
                          </span>
                          <span className="mb-2 block truncate text-[12.5px] text-ink-3">
                            {item.brand ?? space.title}
                          </span>
                          <DisclosureChip kind={item.disclosure} compact />
                        </span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-ink-3 transition-transform group-hover/i:translate-x-0.5 group-hover/i:text-ink"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Section>
        </div>
      </ProfileShell>
      <ConnectSheet person={person} open={connectOpen} onClose={() => setConnectOpen(false)} />
    </>
  );
}

export function AboutRoute() {
  const { handle } = useParams();
  const [connectOpen, setConnectOpen] = useState(false);
  const world = usePublicWorld(handle);
  const person = world?.person;
  if (!person) return <NotFoundRoute kind="profile" />;

  const spaces = world.spaces;
  const items = world.items;
  const disclosureCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.disclosure] = (acc[item.disclosure] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Meta
        title={`About ${person.name} — Zat`}
        description={person.statement}
        path={`/${person.handle}/about`}
        type="profile"
      />
      <ProfileShell person={person} onConnect={() => setConnectOpen(true)}>
        <div className="pb-32 pt-24">
          <Section>
            <div className="mb-10 flex flex-wrap items-center gap-5">
              <Picture
                media={person.avatar}
                priority
                sizes="88px"
                className="size-20 overflow-hidden rounded-full border border-line"
                imgClassName="size-20 object-cover"
              />
              <div className="min-w-0">
                <h1 className="font-display text-[clamp(28px,4vw,46px)] leading-tight">
                  {person.name}
                </h1>
                <p className="mt-1.5 text-[13.5px] text-ink-3">
                  @{person.handle} · {person.location} · {person.roles.join(' · ')}
                </p>
              </div>
            </div>

            <p className="mb-12 max-w-[60ch] text-[clamp(16px,1.8vw,20px)] leading-relaxed text-ink-2">
              {person.statement}
            </p>

            <dl className="mb-14 grid grid-cols-2 gap-6 border-y border-line py-8 sm:grid-cols-4">
              <div>
                <dt className="kicker mb-2">Spaces</dt>
                <dd className="font-display text-[30px] leading-none">{spaces.length}</dd>
              </div>
              <div>
                <dt className="kicker mb-2">Items</dt>
                <dd className="font-display text-[30px] leading-none">{items.length}</dd>
              </div>
              <div>
                <dt className="kicker mb-2">On Zat since</dt>
                <dd className="font-display text-[30px] leading-none">
                  {new Date(person.joinedAt).getFullYear()}
                </dd>
              </div>
              <div>
                <dt className="kicker mb-2">Last updated</dt>
                <dd className="font-display text-[30px] leading-none">
                  {new Date(person.updatedAt).toLocaleDateString('en-GB', { month: 'short' })}
                </dd>
              </div>
            </dl>

            <section className="mb-14">
              <h2 className="font-display mb-3 text-[clamp(20px,2.4vw,28px)]">
                How {person.name.split(' ')[0]} discloses
              </h2>
              <p className="mb-6 max-w-[56ch] text-[14px] leading-relaxed text-ink-3">
                Every Item on this profile carries its commercial relationship. Here is the whole
                picture at a glance, so you can weigh the rest of it fairly.
              </p>
              <ul className="flex flex-wrap gap-2.5">
                {Object.entries(disclosureCounts).map(([kind, count]) => (
                  <li key={kind} className="flex items-center gap-2">
                    <DisclosureChip kind={kind as never} />
                    <span className="text-[13px] tabular-nums text-ink-3">{count}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display mb-6 text-[clamp(20px,2.4vw,28px)]">Where to find them</h2>
              <ul className="grid gap-2.5 sm:grid-cols-2">
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
                        <span className="mt-1 block truncate text-[14px]">{social.handle}</span>
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
            </section>
          </Section>
        </div>
      </ProfileShell>
      <ConnectSheet person={person} open={connectOpen} onClose={() => setConnectOpen(false)} />
    </>
  );
}
