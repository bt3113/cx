/**
 * Homepage.
 *
 * The concept has to land in seconds, and the fastest way to explain a world
 * is to show one. The hero carries a live, interactive fragment of a real
 * profile rather than a screenshot, and every section afterwards demonstrates
 * a capability instead of describing it.
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, BadgeCheck, Layers, Share2, Sparkles } from 'lucide-react';
import { MarketingShell } from '@/app/MarketingShell';
import { cn } from '@/design/cn';
import { ArrowBadge, ButtonLink, DisclosureChip, Section, Stat } from '@/design/primitives';
import { Picture } from '@/lib/media';
import { repo } from '@/lib/repo';
import { routes } from '@/lib/routing/base';
import { CurvedGrid } from '@/world/CurvedGrid';
import { Meta } from '@/seo/Meta';
import { organisationJsonLd } from '@/seo/jsonld';

const COMPARISON = [
  { name: 'Instagram', shows: 'what you posted' },
  { name: 'LinkedIn', shows: 'what you do professionally' },
  { name: 'Linktree', shows: 'where you exist online' },
  { name: 'Storefronts', shows: 'what someone wants you to buy' },
];

export function HomeRoute() {
  const alex = repo.getPerson('alexden');
  const spaces = alex ? repo.listSpaces(alex.id) : [];
  const featured = spaces.filter((s) => s.featured).slice(0, 6);
  const [activeSpace, setActiveSpace] = useState(featured[0]?.id ?? '');
  const active = featured.find((s) => s.id === activeSpace) ?? featured[0];
  const activeItems = active ? repo.listItems(active.id).slice(0, 4) : [];

  const trustItem = repo.getItemById('i_a7iv');
  const trustSpace = trustItem ? repo.getSpaceById(trustItem.spaceId) : undefined;
  const seenIn = trustItem ? repo.contentForItem(trustItem.id) : [];

  return (
    <MarketingShell>
      <Meta
        title="Zat — Everything that makes you, you, in one place"
        description="A creator-owned personal world. One link that holds your identity, taste, tools, work and recommendations — with the context that makes them worth trusting."
        path="/"
        jsonLd={organisationJsonLd()}
      />

      {/* --- hero ------------------------------------------------------ */}
      <div className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-70">
          <CurvedGrid />
        </div>

        <Section width="wide" className="pb-16 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="kicker mb-6"
              >
                Your world deserves more than a list of links
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.06 }}
                className="font-display mb-6 text-d1 leading-[1.02] tracking-[0]"
              >
                Everything that makes you, you&nbsp;&mdash;
                <span className="block text-ink-2">in one place.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="lede mb-9"
              >
                Zat is a personal world you own. Your identity, your taste, the tools you actually
                use and the things you genuinely recommend — with enough context that a stranger
                can tell the difference between a favourite and an advert.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="flex flex-wrap items-center gap-3"
              >
                <ButtonLink to={routes.signUp()} variant="primary" size="lg">
                  Claim your Zat
                  <ArrowRight className="size-4" strokeWidth={2} />
                </ButtonLink>
                {alex ? (
                  <ButtonLink to={routes.profile(alex.handle)} variant="glass" size="lg">
                    Walk through a world
                  </ButtonLink>
                ) : null}
              </motion.div>

              <p className="mt-5 text-[12.5px] text-ink-3">
                zat.com/yourname · Free to start · No card required
              </p>
            </div>

            {/* Live fragment of a real world. */}
            {alex ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
                style={{ perspective: '1400px' }}
              >
                <div className="glass relative overflow-hidden rounded-[var(--radius-panel)] p-5 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)] sm:p-7">
                  <div className="mb-5 flex items-center gap-3.5">
                    <Picture
                      media={alex.avatar}
                      sizes="52px"
                      className="size-12 overflow-hidden rounded-full"
                      imgClassName="size-12 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-display text-d6 leading-tight">{alex.name}</p>
                      <p className="text-[12.5px] text-ink-3">
                        @{alex.handle} · {alex.roles.join(' · ')}
                      </p>
                    </div>
                    <Link
                      to={routes.profile(alex.handle)}
                      className="ml-auto text-[12.5px] text-ink-3 underline-offset-4 hover:text-ink hover:underline"
                    >
                      Open
                    </Link>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {featured.map((space) => (
                      <button
                        key={space.id}
                        type="button"
                        onClick={() => setActiveSpace(space.id)}
                        aria-pressed={space.id === active?.id}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-[12px] transition-colors',
                          space.id === active?.id
                            ? 'border-bronze-500/50 bg-bronze-500/10 text-ink'
                            : 'border-line text-ink-3 hover:border-line-2 hover:text-ink',
                        )}
                      >
                        {space.title}
                      </button>
                    ))}
                  </div>

                  {active ? (
                    <Link
                      to={routes.space(alex.handle, active.slug)}
                      className="group/preview block overflow-hidden rounded-2xl border border-line"
                    >
                      <div className="relative aspect-[16/9]">
                        <Picture
                          media={active.cover}
                          sizes="(min-width: 1024px) 40vw, 90vw"
                          className="absolute inset-0 h-full w-full"
                          imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover/preview:scale-[1.04]"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
                        />
                        <div className="absolute inset-x-4 bottom-3.5 flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="mb-1 text-[11px] tabular-nums text-ink-3">
                              {String(active.index).padStart(2, '0')}
                            </p>
                            <p className="text-[17px] font-medium text-ink">{active.title}</p>
                          </div>
                          <ArrowBadge size={30} />
                        </div>
                      </div>
                    </Link>
                  ) : null}

                  <ul className="mt-3.5 grid grid-cols-2 gap-2">
                    {activeItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2.5 rounded-xl border border-line px-2.5 py-2"
                      >
                        <Picture
                          media={item.image}
                          sizes="40px"
                          className="size-9 shrink-0 overflow-hidden rounded-lg"
                          imgClassName="size-9 object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] text-ink">
                            {item.title}
                          </span>
                          <span className="block truncate text-[11px] text-ink-3">
                            {item.brand ?? 'Editorial'}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : null}
          </div>
        </Section>
      </div>

      {/* --- positioning ----------------------------------------------- */}
      <Section className="border-t border-line py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="font-display mb-4 text-d3 leading-[1.05]">
              Other profiles show a slice. Zat shows the person.
            </h2>
            <p className="max-w-[44ch] text-[15.5px] leading-relaxed text-ink-2">
              A visitor should finish exploring your Zat understanding you better than when they
              arrived. That is the whole measure.
            </p>
          </div>

          <ul className="divide-y divide-[color:var(--color-line)] border-y border-line">
            {COMPARISON.map((row) => (
              <li key={row.name} className="flex items-baseline gap-5 py-4">
                <span className="w-[108px] shrink-0 text-[14px] text-ink">{row.name}</span>
                <span className="text-[14px] text-ink-3">shows {row.shows}</span>
              </li>
            ))}
            <li className="flex items-baseline gap-5 py-4">
              <span className="w-[108px] shrink-0 text-[14px] text-bronze-200">Zat</span>
              <span className="text-[14px] text-ink">
                shows the person — identity, taste, tools, work and the reasoning behind each
                recommendation
              </span>
            </li>
          </ul>
        </div>
      </Section>

      {/* --- trust ------------------------------------------------------ */}
      {trustItem && trustSpace && alex ? (
        <Section className="border-t border-line py-16 sm:py-24">
          <div className="mb-10 max-w-[62ch]">
            <p className="kicker mb-4">The trust layer</p>
            <h2 className="font-display mb-4 text-d3 leading-[1.05]">
              A recommendation is worth nothing without its context.
            </h2>
            <p className="text-[15.5px] leading-relaxed text-ink-2">
              Every Item on Zat carries how it was obtained, how long it has been used, how often,
              what is wrong with it, and what the creator would suggest instead. Disclosure is
              structural, not a footnote.
            </p>
          </div>

          <div className="glass overflow-hidden rounded-[var(--radius-panel)]">
            <div className="grid gap-0 md:grid-cols-[300px_1fr]">
              <div className="relative aspect-[4/3] md:aspect-auto">
                <Picture
                  media={trustItem.image}
                  sizes="(min-width: 768px) 300px, 100vw"
                  className="absolute inset-0 h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-2.5">
                  <DisclosureChip kind={trustItem.disclosure} />
                  <span className="text-[12px] text-ink-3">
                    Used since {trustItem.usedSince} · {seenIn.length} pieces of content
                  </span>
                </div>

                <h3 className="font-display mb-3 text-d6 leading-tight">{trustItem.title}</h3>
                <p className="mb-6 max-w-[56ch] text-[14.5px] leading-relaxed text-ink-2">
                  {trustItem.creatorNote}
                </p>

                <dl className="grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-4">
                  <Stat label="Would buy again" value={trustItem.wouldBuyAgain ? 'Yes' : 'No'} />
                  <Stat label="Frequency" value="Weekly" />
                  <Stat label="Seen in" value={seenIn.length} hint="pieces of content" />
                  <Stat label="Alternatives" value={trustItem.alternatives.length} hint="suggested" />
                </dl>

                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-6">
                  <div className="min-w-[180px] flex-1">
                    <p className="kicker mb-2.5">What works</p>
                    <ul className="space-y-1.5">
                      {trustItem.likes.slice(0, 3).map((like) => (
                        <li key={like} className="text-[13px] leading-snug text-ink-2">
                          {like}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <p className="kicker mb-2.5">What does not</p>
                    <ul className="space-y-1.5">
                      {trustItem.dislikes.slice(0, 3).map((d) => (
                        <li key={d} className="text-[13px] leading-snug text-ink-2">
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  to={routes.item(alex.handle, trustSpace.slug, trustItem.slug)}
                  className="mt-7 inline-flex items-center gap-2 text-[13.5px] text-ink transition-colors hover:text-bronze-200"
                >
                  See the full Item
                  <ArrowRight className="size-4" strokeWidth={1.8} />
                </Link>
              </div>
            </div>
          </div>
        </Section>
      ) : null}

      {/* --- capabilities ---------------------------------------------- */}
      <Section className="border-t border-line py-16 sm:py-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Layers,
              title: 'Spaces, not categories',
              body: 'Wardrobe, Camera Bag, Current Rotation, Memories. Areas of a life, laid out as editorial rooms rather than a product grid.',
              to: routes.product(),
              cta: 'How Spaces work',
            },
            {
              icon: Share2,
              title: 'Sharing that survives the feed',
              body: 'Every profile, Space and Item generates a 1080 × 1920 Story image carrying the disclosure with it. A post disappears; the object stays.',
              to: routes.sharing(),
              cta: 'See sharing',
            },
            {
              icon: BadgeCheck,
              title: 'Evidence, not endorsements',
              body: 'Duration of use, frequency, likes, dislikes, alternatives and the content an Item actually appears in — all structured.',
              to: routes.trust(),
              cta: 'Read the trust model',
            },
          ].map((card) => (
            <article
              key={card.title}
              className="glass flex flex-col rounded-[var(--radius-panel)] p-7"
            >
              <card.icon className="mb-5 size-5 text-bronze-300" strokeWidth={1.5} />
              <h3 className="mb-3 text-[18px] font-medium leading-snug">{card.title}</h3>
              <p className="mb-6 flex-1 text-[14px] leading-relaxed text-ink-3">{card.body}</p>
              <Link
                to={card.to}
                className="inline-flex items-center gap-2 text-[13px] text-ink transition-colors hover:text-bronze-200"
              >
                {card.cta}
                <ArrowRight className="size-3.5" strokeWidth={1.8} />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* --- example worlds --------------------------------------------- */}
      <Section className="border-t border-line py-16 sm:py-24">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker mb-4">Worlds on Zat</p>
            <h2 className="font-display text-d4 leading-[1.05]">
              Four people, four very different worlds.
            </h2>
          </div>
          <Link
            to={routes.examples()}
            className="inline-flex items-center gap-2 text-[13.5px] text-ink-2 hover:text-ink"
          >
            All examples
            <ArrowRight className="size-4" strokeWidth={1.8} />
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {repo.listPeople().map((person) => {
            const personSpaces = repo.listSpaces(person.id);
            return (
              <li key={person.id}>
                <Link
                  to={routes.profile(person.handle)}
                  className="group/world block h-full overflow-hidden rounded-[var(--radius-panel)] border border-line transition-colors hover:border-line-2"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {personSpaces[0] ? (
                      <Picture
                        media={personSpaces[0].cover}
                        sizes="(min-width: 1024px) 24vw, 90vw"
                        className="absolute inset-0 h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover/world:scale-105"
                      />
                    ) : null}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent"
                    />
                    <div className="absolute inset-x-4 bottom-4 flex items-center gap-3">
                      <Picture
                        media={person.avatar}
                        sizes="40px"
                        className="size-9 overflow-hidden rounded-full border border-white/20"
                        imgClassName="size-9 object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] text-ink">{person.name}</span>
                        <span className="block truncate text-[11.5px] text-ink-3">
                          @{person.handle}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-ink-3">
                      {person.statement}
                    </p>
                    <p className="text-[11.5px] text-ink-3">
                      {personSpaces.length} Spaces ·{' '}
                      {repo.listItemsByPerson(person.id).length} Items
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* --- close ------------------------------------------------------ */}
      <Section className="border-t border-line py-20 text-center sm:py-28">
        <Sparkles className="mx-auto mb-6 size-5 text-bronze-300" strokeWidth={1.5} />
        <h2 className="font-display mx-auto mb-5 max-w-[18ch] text-d2 leading-[1.02]">
          One link. Your entire world.
        </h2>
        <p className="mx-auto mb-9 max-w-[46ch] text-[15.5px] leading-relaxed text-ink-2">
          Start with one Space and three things you genuinely use. It takes about ten minutes, and
          it is yours to keep.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink to={routes.signUp()} variant="primary" size="lg">
            Claim your Zat
          </ButtonLink>
          <ButtonLink to={routes.pricing()} variant="glass" size="lg">
            See pricing
          </ButtonLink>
        </div>
      </Section>
    </MarketingShell>
  );
}
