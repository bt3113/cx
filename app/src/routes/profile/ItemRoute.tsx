/**
 * An Item — a single trusted recommendation.
 *
 * This is where Zat's promise is either kept or broken, so the page is built
 * around `recommendation + context + evidence` rather than product + buy
 * button. Disclosure sits beside the title, not in a footer. Duration of use,
 * frequency, what the creator dislikes and what they would suggest instead are
 * given the same weight as the thing itself. Commerce is present, quiet, and
 * last.
 */
import { Link, useParams } from 'react-router';
import { ArrowLeft, Check, Minus, X } from 'lucide-react';
import { ProfileShell } from '@/app/ProfileChrome';
import { cn } from '@/design/cn';
import { ButtonLink, DisclosureChip, Section } from '@/design/primitives';
import { useState } from 'react';
import { Picture } from '@/lib/media';
import { repo, resolvePath } from '@/lib/repo';
import { usePublicWorld } from '@/stores/studio';
import { routes } from '@/lib/routing/base';
import {
  CONTENT_LABEL,
  DISCLOSURE_META,
  FREQUENCY_LABEL,
  type Item,
} from '@/lib/schema';
import { Meta } from '@/seo/Meta';
import { itemJsonLd } from '@/seo/jsonld';
import { NotFoundRoute } from '@/routes/NotFound';
import { ConnectSheet } from '@/routes/profile/ConnectSheet';
import { SaveButton } from '@/features/saves/SaveButton';
import { ShareButton } from '@/features/share/ShareButton';
import { track } from '@/lib/analytics/events';

const CURRENCY: Record<Item['currency'], string> = { GBP: '£', USD: '$', EUR: '€' };

function formatPrice(item: Item): string | null {
  if (item.price === null) return null;
  if (item.price === 0) return 'Free';
  return `${CURRENCY[item.currency]}${item.price.toLocaleString('en-GB', {
    minimumFractionDigits: item.price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ItemRoute() {
  const { handle, spaceSlug, itemSlug } = useParams();
  const [connectOpen, setConnectOpen] = useState(false);
  const world = usePublicWorld(handle);
  const fallback = resolvePath(handle, spaceSlug, itemSlug);

  // Prefer a world published from the Studio in this browser.
  const person = world?.person ?? fallback.person;
  const space = world
    ? world.spaces.find((s) => s.slug === spaceSlug)
    : fallback.space;
  const item = world && space
    ? world.items.find((i) => i.spaceId === space.id && i.slug === itemSlug)
    : fallback.item;

  if (!person) return <NotFoundRoute kind="profile" />;
  if (!space) return <NotFoundRoute kind="space" />;
  if (!item) return <NotFoundRoute kind="item" />;

  const disclosure = DISCLOSURE_META[item.disclosure];
  const seenIn = repo.contentForItem(item.id);
  const siblings = (world ? world.items.filter((i) => i.spaceId === space.id) : repo.listItems(space.id)).filter((i) => i.id !== item.id);
  const price = formatPrice(item);

  return (
    <>
      <Meta
        title={`${item.title} — ${space.title} by ${person.name} on Zat`}
        description={`${disclosure.label}. ${item.creatorNote.slice(0, 150)}`}
        path={routes.item(person.handle, space.slug, item.slug)}
        image={`media/${item.image.key}.webp`}
        type="article"
        jsonLd={itemJsonLd(person, space, item)}
      />

      <ProfileShell person={person} onConnect={() => setConnectOpen(true)}>
        <div className="pb-32 pt-24">
          <Section width="wide">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
                <li>
                  <Link to={routes.profile(person.handle)} className="hover:text-ink">
                    {person.name}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    to={routes.space(person.handle, space.slug)}
                    className="hover:text-ink"
                  >
                    {space.title}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-ink-2">{item.title}</li>
              </ol>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
              {/* --- artwork ------------------------------------------- */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="overflow-hidden rounded-[var(--radius-panel)] border border-line bg-panel">
                  <Picture
                    media={item.image}
                    priority
                    sizes="(min-width: 1024px) 46vw, 92vw"
                    className="aspect-[4/3] w-full"
                    imgClassName="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <ShareButton
                    subject="item"
                    person={person}
                    space={space}
                    item={item}
                    url={routes.item(person.handle, space.slug, item.slug)}
                  />
                  <SaveButton
                    targetId={item.id}
                    kind="item"
                    personHandle={person.handle}
                    label="Save"
                  />
                </div>
              </div>

              {/* --- the recommendation --------------------------------- */}
              <div className="min-w-0">
                {item.brand ? <p className="kicker mb-3">{item.brand}</p> : null}
                <h1 className="font-display mb-5 text-[clamp(30px,4.4vw,52px)] leading-[1.02]">
                  {item.title}
                </h1>

                <div className="mb-6 flex flex-wrap items-center gap-2.5">
                  <DisclosureChip kind={item.disclosure} />
                  {item.usedSince ? (
                    <span className="text-[12.5px] text-ink-3">Used since {item.usedSince}</span>
                  ) : null}
                </div>

                <p className="mb-7 max-w-[60ch] text-[15px] leading-relaxed text-ink-2">
                  {item.description}
                </p>

                {/* The creator's own voice, given prominence. */}
                <figure className="mb-8 border-l-2 border-bronze-500/45 pl-5">
                  <blockquote className="text-[clamp(16px,1.7vw,19px)] leading-relaxed text-ink">
                    {item.creatorNote}
                  </blockquote>
                  <figcaption className="mt-3.5 flex items-center gap-2.5 text-[12.5px] text-ink-3">
                    <Picture
                      media={person.avatar}
                      sizes="28px"
                      className="size-7 overflow-hidden rounded-full"
                      imgClassName="size-7 object-cover"
                    />
                    {person.name}
                  </figcaption>
                </figure>

                {/* --- evidence ---------------------------------------- */}
                <dl className="mb-8 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-line py-7 sm:grid-cols-4">
                  <div>
                    <dt className="kicker mb-2">Used since</dt>
                    <dd className="text-[15px] text-ink">{item.usedSince ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="kicker mb-2">How often</dt>
                    <dd className="text-[15px] text-ink">
                      {item.frequency ? FREQUENCY_LABEL[item.frequency] : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="kicker mb-2">Buy again</dt>
                    <dd
                      className={cn(
                        'flex items-center gap-1.5 text-[15px]',
                        item.wouldBuyAgain === true && 'text-[color:var(--color-positive)]',
                        item.wouldBuyAgain === false && 'text-[#ff8a92]',
                        item.wouldBuyAgain === null && 'text-ink-3',
                      )}
                    >
                      {item.wouldBuyAgain === true ? (
                        <>
                          <Check className="size-4" strokeWidth={2.2} /> Yes
                        </>
                      ) : item.wouldBuyAgain === false ? (
                        <>
                          <X className="size-4" strokeWidth={2.2} /> No
                        </>
                      ) : (
                        <>
                          <Minus className="size-4" strokeWidth={2.2} /> N/A
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="kicker mb-2">Last checked</dt>
                    <dd className="text-[15px] text-ink">
                      {new Date(item.updatedAt).toLocaleDateString('en-GB', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </dd>
                  </div>
                </dl>

                {/* --- likes and dislikes ------------------------------- */}
                {item.likes.length || item.dislikes.length ? (
                  <div className="mb-8 grid gap-7 sm:grid-cols-2">
                    {item.likes.length ? (
                      <div>
                        <h2 className="kicker mb-3.5">What works</h2>
                        <ul className="space-y-2.5">
                          {item.likes.map((like) => (
                            <li key={like} className="flex gap-2.5 text-[14px] leading-snug text-ink-2">
                              <Check
                                className="mt-0.5 size-4 shrink-0 text-[color:var(--color-positive)]"
                                strokeWidth={2}
                              />
                              {like}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {item.dislikes.length ? (
                      <div>
                        <h2 className="kicker mb-3.5">What does not</h2>
                        <ul className="space-y-2.5">
                          {item.dislikes.map((dislike) => (
                            <li
                              key={dislike}
                              className="flex gap-2.5 text-[14px] leading-snug text-ink-2"
                            >
                              <X className="mt-0.5 size-4 shrink-0 text-[#ff8a92]" strokeWidth={2} />
                              {dislike}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {item.alternatives.length ? (
                  <div className="mb-8">
                    <h2 className="kicker mb-3.5">What else to consider</h2>
                    <ul className="space-y-2">
                      {item.alternatives.map((alt) => (
                        <li
                          key={alt}
                          className="rounded-xl border border-line px-4 py-3 text-[14px] leading-snug text-ink-2"
                        >
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* --- disclosure in full ------------------------------- */}
                <div className="mb-8 rounded-2xl border border-line bg-surface p-5">
                  <h2 className="mb-2 text-[14px] font-medium text-ink">{disclosure.label}</h2>
                  <p className="text-[13.5px] leading-relaxed text-ink-3">
                    {disclosure.explainer}{' '}
                    <Link
                      to={routes.disclosure()}
                      className="text-ink-2 underline underline-offset-4 hover:text-ink"
                    >
                      How Zat handles disclosure
                    </Link>
                  </p>
                </div>

                {/* --- commerce, deliberately last and quiet ------------ */}
                {item.productUrl ? (
                  <div className="flex flex-wrap items-center gap-4 border-t border-line pt-7">
                    <ButtonLink
                      to={item.productUrl}
                      external
                      variant="glass"
                      onClick={() =>
                        track({ type: 'outbound', targetType: 'item', targetId: item.id })
                      }
                      rel={
                        item.disclosure === 'affiliate' || item.disclosure === 'sponsored'
                          ? 'noopener noreferrer nofollow sponsored'
                          : 'noopener noreferrer nofollow'
                      }
                    >
                      Where I got it
                      <span aria-hidden="true">↗</span>
                    </ButtonLink>
                    <div className="text-[12.5px] text-ink-3">
                      {price ? <span className="text-ink-2">{price}</span> : null}
                      {price && item.retailer ? ' · ' : null}
                      {item.retailer}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* --- seen in ------------------------------------------- */}
            {seenIn.length ? (
              <section className="mt-20 border-t border-line pt-12">
                <h2 className="font-display mb-2 text-[clamp(22px,2.6vw,30px)]">Seen in</h2>
                <p className="mb-7 max-w-[54ch] text-[14px] leading-relaxed text-ink-3">
                  Where this actually appears in {person.name.split(' ')[0]}&rsquo;s work. A
                  recommendation you can watch being used is a different kind of evidence.
                </p>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {seenIn.map((content) => (
                    <li key={content.id}>
                      <Link
                        to={routes.content(person.handle, content.slug)}
                        className="group/c block overflow-hidden rounded-2xl border border-line transition-colors hover:border-line-2"
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
                          <span className="absolute left-3.5 top-3.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] text-ink backdrop-blur-sm">
                            {CONTENT_LABEL[content.type]}
                          </span>
                        </div>
                        <div className="p-4">
                          <p className="mb-1.5 line-clamp-2 text-[14px] font-medium leading-snug text-ink">
                            {content.title}
                          </p>
                          <p className="text-[12px] text-ink-3">
                            {new Date(content.publishedAt).toLocaleDateString('en-GB', {
                              month: 'long',
                              year: 'numeric',
                            })}{' '}
                            · {content.views.toLocaleString('en-GB')} views
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* --- rest of the Space --------------------------------- */}
            {siblings.length ? (
              <section className="mt-16 border-t border-line pt-12">
                <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-display text-[clamp(22px,2.6vw,30px)]">
                    Also in {space.title}
                  </h2>
                  <Link
                    to={routes.space(person.handle, space.slug)}
                    className="inline-flex items-center gap-2 text-[13px] text-ink-2 hover:text-ink"
                  >
                    <ArrowLeft className="size-4" strokeWidth={1.8} />
                    Back to the Space
                  </Link>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {siblings.map((sibling) => (
                    <li key={sibling.id}>
                      <Link
                        to={routes.item(person.handle, space.slug, sibling.slug)}
                        className="group/s block"
                      >
                        <div className="mb-3 aspect-[4/3] overflow-hidden rounded-2xl border border-line transition-colors group-hover/s:border-line-2">
                          <Picture
                            media={sibling.image}
                            sizes="(min-width: 1024px) 22vw, 46vw"
                            className="h-full w-full"
                            imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover/s:scale-105"
                          />
                        </div>
                        <p className="mb-1.5 line-clamp-2 text-[13.5px] font-medium leading-snug text-ink">
                          {sibling.title}
                        </p>
                        <DisclosureChip kind={sibling.disclosure} compact />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </Section>
        </div>
      </ProfileShell>

      <ConnectSheet person={person} open={connectOpen} onClose={() => setConnectOpen(false)} />
    </>
  );
}
