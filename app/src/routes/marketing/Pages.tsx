/**
 * Marketing pages.
 *
 * Each one demonstrates a capability rather than describing it, and each is
 * honest about what is built versus what needs credentials Zat does not have.
 */
import { Link } from 'react-router';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { MarketingShell } from '@/app/MarketingShell';
import { cn } from '@/design/cn';
import { ButtonLink, DisclosureChip, Section, Stat } from '@/design/primitives';
import { AreaChart, BarList, MetricTile } from '@/features/charts/Charts';
import { formatMoney, formatNumber, metricsForSpaces, seriesForSpace, totals } from '@/lib/analytics/series';
import { Picture } from '@/lib/media';
import { repo } from '@/lib/repo';
import { routes } from '@/lib/routing/base';
import { DISCLOSURE_META, type DisclosureKind } from '@/lib/schema';
import { Meta } from '@/seo/Meta';

function PageHero({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <Section className="pb-12 pt-16 sm:pt-20">
      <p className="kicker mb-5">{kicker}</p>
      <h1 className="font-display mb-5 max-w-[20ch] text-[clamp(34px,5.6vw,66px)] leading-[1.0] tracking-[-0.02em]">
        {title}
      </h1>
      <p className="max-w-[58ch] text-[clamp(16px,1.7vw,19px)] leading-relaxed text-ink-2">{lede}</p>
    </Section>
  );
}

function Feature({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border-t border-line pt-6">
      <p className="kicker mb-4">{n}</p>
      <h3 className="mb-3 text-[18px] font-medium leading-snug text-ink">{title}</h3>
      <p className="text-[14px] leading-relaxed text-ink-3">{body}</p>
    </div>
  );
}

function CTA({ title, body }: { title: string; body: string }) {
  return (
    <Section className="border-t border-line py-20 text-center sm:py-24">
      <h2 className="font-display mx-auto mb-4 max-w-[20ch] text-[clamp(28px,4.2vw,48px)] leading-[1.04]">{title}</h2>
      <p className="mx-auto mb-8 max-w-[46ch] text-[15.5px] leading-relaxed text-ink-2">{body}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink to={routes.signUp()} variant="primary" size="lg">Claim your Zat</ButtonLink>
        <ButtonLink to={routes.profile('alexden')} variant="glass" size="lg">Walk through a world</ButtonLink>
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------ product

export function ProductRoute() {
  const alex = repo.getPerson('alexden');
  const spaces = alex ? repo.listSpaces(alex.id).slice(0, 6) : [];

  return (
    <MarketingShell>
      <Meta title="Product — Zat" description="Spaces, Items and the trust layer: how a Zat world is put together." path={routes.product()} />
      <PageHero kicker="The product" title="A person, laid out as a place."
        lede="Zat has three objects and one rule. Spaces are the areas of a life. Items are the things inside them. Every Item carries the context that makes it worth trusting — and the rule is that commerce never leads." />

      <Section className="pb-16">
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
          <Feature n="01 / Space" title="A room, not a category" body="Wardrobe, Camera Bag, Current Rotation, Memories. A Space has a cover, an editorial introduction and a personal note, so it reads as somewhere a person actually lives rather than a filter on a catalogue." />
          <Feature n="02 / Item" title="A recommendation with evidence" body="Disclosure, how long it has been used, how often, what works, what does not, what to consider instead, and the content it appears in. All structured, all visible." />
          <Feature n="03 / Content" title="The proof" body="Connect a video or article to the Items inside it. The Item then shows where it has been used, and the content shows everything in it. Both directions, from one link." />
        </div>
      </Section>

      {alex ? (
        <Section className="border-t border-line py-16">
          <h2 className="font-display mb-3 text-[clamp(24px,3.2vw,38px)]">Six Spaces from one world</h2>
          <p className="mb-9 max-w-[54ch] text-[15px] leading-relaxed text-ink-2">Open any of them — they are real pages, not screenshots.</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <li key={space.id}>
                <Link to={routes.space(alex.handle, space.slug)} className="group/s block overflow-hidden rounded-[var(--radius-panel)] border border-line transition-colors hover:border-line-2">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Picture media={space.cover} sizes="(min-width:1024px) 30vw, 92vw" className="absolute inset-0 h-full w-full"
                      imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover/s:scale-105" />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="mb-1 text-[11px] tabular-nums text-ink-3">{String(space.index).padStart(2, '0')}</p>
                      <p className="text-[16px] font-medium text-ink">{space.title}</p>
                    </div>
                  </div>
                  <p className="p-4 text-[13px] leading-relaxed text-ink-3">{space.intro.slice(0, 110)}…</p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CTA title="Build the version of this that is yours." body="Start with one Space and three things you genuinely use." />
    </MarketingShell>
  );
}

// ------------------------------------------------------------- for creators

export function ForCreatorsRoute() {
  return (
    <MarketingShell>
      <Meta title="For creators — Zat" description="Turn scattered recommendations into something permanent, measurable and yours." path={routes.forCreators()} />
      <PageHero kicker="For creators" title="Your recommendations stop disappearing."
        lede="You answer the same question every week. What camera, what jacket, what chair. The answer lives in a story for 24 hours, or a comment nobody finds again. Zat turns it into an object that keeps working." />

      <Section className="pb-16">
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
          <Feature n="Permanence" title="Answer once" body="An Item you write today is still answering the question in two years, with your reasoning attached. Update it when your view changes; the link never breaks." />
          <Feature n="Ownership" title="Yours, not a platform's" body="Your world is not a feed position or an algorithm's opinion of you. One link, your structure, your ordering, your words." />
          <Feature n="Credibility" title="Disclosure as an asset" body="Publishing exactly how you got each thing is not a compliance burden. It is the reason people believe the rest of it, and brands can see your commercial profile before they ask." />
          <Feature n="Measurement" title="Know what actually lands" body="Which Spaces get explored, which Items get saved, what drives outbound clicks, and where the traffic came from — per Space, not one vanity number." />
        </div>
      </Section>

      <Section className="border-t border-line py-16">
        <h2 className="font-display mb-8 text-[clamp(24px,3.2vw,38px)]">What it takes to start</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            ['About ten minutes', 'Claim a handle, write one line about yourself, build a character.'],
            ['One Space', 'The area of your life you would talk about first, with a sentence of context.'],
            ['Three things', 'Things you genuinely use, with an honest note about each — including the flaws.'],
          ].map(([title, body], i) => (
            <li key={title} className="rounded-[var(--radius-panel)] border border-line p-6">
              <p className="kicker mb-4">Step {i + 1}</p>
              <h3 className="mb-2.5 text-[17px] font-medium text-ink">{title}</h3>
              <p className="text-[13.5px] leading-relaxed text-ink-3">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <CTA title="One link instead of the same answer, again." body="Free to start, and yours to keep." />
    </MarketingShell>
  );
}

// -------------------------------------------------------------------- trust

export function TrustRoute() {
  const item = repo.getItemById('i_interface');
  const space = item ? repo.getSpaceById(item.spaceId) : undefined;

  return (
    <MarketingShell>
      <Meta title="Trust — Zat" description="How Zat makes a recommendation worth believing: disclosure, duration, evidence." path={routes.trust()} />
      <PageHero kicker="The trust layer" title="Recommendation, context, evidence."
        lede="Anyone can post a product. What makes a recommendation useful is everything around it: how they got it, how long they have had it, how often they reach for it, and what they would tell you not to like about it." />

      <Section className="pb-16">
        <h2 className="font-display mb-3 text-[clamp(22px,2.8vw,32px)]">Five relationships, always declared</h2>
        <p className="mb-8 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
          Zat will not store an Item without one. It appears beside the Item, inside the Space, on the
          creator's About page, and on any Story image shared from it.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(DISCLOSURE_META) as DisclosureKind[]).map((kind) => (
            <li key={kind} className="rounded-2xl border border-line p-5">
              <DisclosureChip kind={kind} />
              <p className="mt-3.5 text-[13.5px] leading-relaxed text-ink-3">{DISCLOSURE_META[kind].explainer}</p>
            </li>
          ))}
        </ul>
      </Section>

      {item && space ? (
        <Section className="border-t border-line py-16">
          <h2 className="font-display mb-3 text-[clamp(22px,2.8vw,32px)]">A sponsored item, handled honestly</h2>
          <p className="mb-8 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
            Zat does not hide commercial relationships — it makes them legible, so a reader can weigh
            the opinion properly instead of guessing.
          </p>
          <div className="glass rounded-[var(--radius-panel)] p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <DisclosureChip kind={item.disclosure} />
              <span className="text-[12.5px] text-ink-3">Used since {item.usedSince}</span>
            </div>
            <h3 className="font-display mb-3 text-[24px]">{item.title}</h3>
            <p className="mb-6 max-w-[58ch] text-[14.5px] leading-relaxed text-ink-2">{item.creatorNote}</p>
            <dl className="grid grid-cols-2 gap-5 border-t border-line pt-6 sm:grid-cols-4">
              <Stat label="Would buy again" value={item.wouldBuyAgain ? 'Yes' : 'No'} />
              <Stat label="Dislikes listed" value={item.dislikes.length} />
              <Stat label="Alternatives" value={item.alternatives.length} />
              <Stat label="Last checked" value={new Date(item.updatedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} />
            </dl>
            <Link to={routes.item('alexden', space.slug, item.slug)} className="mt-6 inline-flex items-center gap-2 text-[13.5px] text-ink hover:text-bronze-200">
              See the full Item <ArrowRight className="size-4" strokeWidth={1.8} />
            </Link>
          </div>
        </Section>
      ) : null}

      <Section className="border-t border-line py-16">
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
          <Feature n="Duration" title="How long, how often" body="A thing owned for three years and used weekly is a different claim from one unboxed last Tuesday. Both are fine — Zat just makes which one you are reading obvious." />
          <Feature n="Dislikes" title="What is wrong with it" body="An Item with no listed flaws reads as an advert. Zat gives dislikes the same visual weight as likes, because that is where the credibility comes from." />
          <Feature n="Alternatives" title="What else to consider" body="Including the cheaper option that does most of the job. A recommendation that never says 'you might not need this' is not a recommendation." />
        </div>
      </Section>

      <CTA title="Build something people can actually believe." body="Start with one honest note about one thing you own." />
    </MarketingShell>
  );
}

// ------------------------------------------------------------------ sharing

export function SharingRoute() {
  return (
    <MarketingShell>
      <Meta title="Sharing — Zat" description="Every profile, Space and Item generates a 1080 × 1920 Story image, disclosure included." path={routes.sharing()} />
      <PageHero kicker="Sharing" title="A post disappears. The object stays."
        lede="Every profile, Space and Item generates a 1080 × 1920 image, rendered in your browser in under a second. It carries your identity, the artwork, a line of context, the disclosure and the deep link back." />

      <Section className="pb-16">
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
          <Feature n="Native" title="Straight to the share sheet" body="On phones that support it, the image is handed to the system share sheet as a file, so Instagram, Messages and WhatsApp are one tap away. Elsewhere, copy the link or download the image." />
          <Feature n="Honest" title="Disclosure travels with it" body="The commercial relationship is rendered into the image itself. A recommendation that loses its context on the way out is exactly the problem Zat exists to fix." />
          <Feature n="Local" title="Generated on your device" body="Composition happens on a canvas in the browser. No server renders your face, and no share is logged anywhere." />
        </div>
      </Section>

      <Section className="border-t border-line py-16">
        <h2 className="font-display mb-3 text-[clamp(22px,2.8vw,32px)]">Try it on a real world</h2>
        <p className="mb-8 max-w-[54ch] text-[15px] leading-relaxed text-ink-2">
          Open any Space or Item and press Share — the preview you see is the actual generated file.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to={routes.space('alexden', 'photography')} variant="glass">Open a Space</ButtonLink>
          <ButtonLink to={routes.item('alexden', 'photography', 'sony-a7-iv')} variant="glass">Open an Item</ButtonLink>
        </div>
      </Section>

      <CTA title="Make something worth sending." body="One link that survives the feed." />
    </MarketingShell>
  );
}

// ----------------------------------------------------- studio and analytics

export function StudioOverviewRoute() {
  return (
    <MarketingShell>
      <Meta title="Zat Studio" description="Shape your world: Spaces, Items, disclosures, layout and publishing." path={routes.studioOverview()} />
      <PageHero kicker="Zat Studio" title="Shape a world, not a settings page."
        lede="Notion's plainness with real craft in the output. Reorder Spaces by dragging, write each Item's context in one place, and see exactly what is published and what is not." />

      <Section className="pb-16">
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
          <Feature n="Draft and live" title="Publishing means something" body="The Studio edits a draft. The public profile reads what you published. The bar at the top always tells you which is which, and nothing goes out until you say so." />
          <Feature n="Reordering" title="Drag, or use the keyboard" body="Ordering is composition, so it is direct. Every drag handle is also operable with the keyboard — reordering should not require a mouse." />
          <Feature n="Constrained style" title="Choices, not a page builder" body="Accent, background, typography, motion intensity and card size. Enough to feel like yours; not enough to end up looking broken." />
          <Feature n="Character builder" title="An anchor without a photoshoot" body="Build a character from an open-source avatar system, or upload a cut-out figure if you have one. Either way your world has a person at the centre." />
        </div>
      </Section>

      <CTA title="Open the Studio." body="Sign in as the demo creator and change anything you like." />
    </MarketingShell>
  );
}

export function AnalyticsOverviewRoute() {
  const alex = repo.getPerson('alexden');
  const spaces = alex ? repo.listSpaces(alex.id) : [];
  const counts = Object.fromEntries(spaces.map((s) => [s.id, repo.listItems(s.id).length]));
  const metrics = metricsForSpaces(spaces, counts);
  const series = seriesForSpace('profile:alexden', 2.2);
  const t = totals(series);

  return (
    <MarketingShell>
      <Meta title="Analytics — Zat" description="Per-Space exploration, saves, outbound clicks and attributed revenue." path={routes.analyticsOverview()} />
      <PageHero kicker="Analytics" title="Views are the least interesting number."
        lede="Whether people explore past the first screen, which Spaces hold them, what gets saved, what drives a click out, and what that is worth. Per Space, not one total." />

      <Section className="pb-14">
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile label="Profile views" value={formatNumber(t.views)} points={series} metric="views" />
          <MetricTile label="Space opens" value={formatNumber(t.opens)} points={series} metric="opens" />
          <MetricTile label="Outbound clicks" value={formatNumber(t.outbound)} points={series} metric="outbound" />
          <MetricTile label="Attributed revenue" value={formatMoney(t.revenue)} hint="demo attribution" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="glass rounded-[var(--radius-panel)] p-6"><AreaChart points={series} metric="views" title="Views, last 90 days" /></div>
          <div className="glass rounded-[var(--radius-panel)] p-6">
            <BarList title="Most opened Spaces" rows={metrics.slice(0, 5).map((m) => ({ label: m.title, value: m.opens }))} />
          </div>
        </div>
        <p className="mt-5 text-[12.5px] leading-relaxed text-ink-3">
          Demonstration figures from a seeded history. Zat has no analytics backend and collects
          nothing from visitors.
        </p>
      </Section>

      <CTA title="See it against your own world." body="Every figure here is per Space, and so is every decision it informs." />
    </MarketingShell>
  );
}

export function DiscoverExplainedRoute() {
  return (
    <MarketingShell>
      <Meta title="How discovery works — Zat" description="Searching for what people actually use, rather than what is being advertised." path={routes.discoverExplained()} />
      <PageHero kicker="Discovery" title="Find what people actually use."
        lede="Once enough worlds exist, the interesting question is not what ranks. It is what the people you respect genuinely reach for — and Zat's structure already holds that answer." />

      <Section className="pb-16">
        <h2 className="font-display mb-6 text-[clamp(22px,2.8vw,32px)]">The kind of question this can answer</h2>
        <ul className="mb-10 grid gap-2.5 sm:grid-cols-2">
          {['cameras actually used by travel creators', 'chairs used by designers', 'running shoes used by marathon creators', 'books most saved from founder Zats'].map((q) => (
            <li key={q} className="rounded-2xl border border-line px-5 py-4 text-[14.5px] text-ink-2">“{q}”</li>
          ))}
        </ul>
        <div className="rounded-[var(--radius-panel)] border border-bronze-500/30 bg-bronze-500/5 p-6">
          <p className="mb-2 text-[14px] font-medium text-ink">What is actually built today</p>
          <p className="max-w-[62ch] text-[13.5px] leading-relaxed text-ink-2">
            Search runs over Zat's seeded launch catalogue — four creators, their Spaces and Items —
            with real faceting by category, disclosure and price. It is a working demonstration of the
            model, not a claim about platform-wide data that does not exist yet.
          </p>
        </div>
      </Section>

      <Section className="border-t border-line py-16">
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
          <Feature n="Structure" title="Typed, not scraped" body="Creator, Space, Item, brand, content and save are separate objects with typed edges between them. Nothing has to be inferred from a caption." />
          <Feature n="Weighting" title="Disclosure counts" body="A sponsored recommendation is weighted below one someone paid for themselves. The graph stores that weight on the edge, so ranking can respect it." />
          <Feature n="Direction" title="A taste graph, eventually" body="Person → Space → Item → Brand → Content → Audience. Not an AI feature today; a data-model commitment so it stays possible." />
        </div>
      </Section>

      <CTA title="Explore the catalogue." body="Four worlds, fully populated." />
    </MarketingShell>
  );
}

// ------------------------------------------------------------------ pricing

const PLANS = [
  { name: 'Free', price: '£0', cadence: 'forever', lede: 'Enough to have a real world.',
    features: ['Your zat.com handle', 'Up to 3 Spaces', 'Unlimited Items', 'Story sharing', 'Basic analytics', 'Zat badge on your profile'],
    missing: ['Custom domain', 'Advanced attribution', 'Media kit'], cta: 'Start free', to: routes.signUp() },
  { name: 'Creator', price: '£12', cadence: 'per month', lede: 'For people whose recommendations are part of their work.', featured: true,
    features: ['Unlimited Spaces', 'Full analytics per Space', 'Affiliate link tools', 'Advanced customisation', 'No Zat badge', 'Custom domain', 'Story templates'],
    missing: ['Team access', 'Brand partnership tools'], cta: 'Choose Creator', to: routes.signUp() },
  { name: 'Pro', price: '£32', cadence: 'per month', lede: 'For creators working with brands regularly.',
    features: ['Everything in Creator', 'Advanced attribution', 'Sendable media kit', 'Audience insights', 'Team access', 'Brand partnership tools', 'Priority support'],
    missing: [], cta: 'Choose Pro', to: routes.signUp() },
];

export function PricingRoute() {
  return (
    <MarketingShell>
      <Meta title="Pricing — Zat" description="Free to start. Creator at £12 a month, Pro at £32." path={routes.pricing()} />
      <PageHero kicker="Pricing" title="Start free. Pay when it earns."
        lede="A world you own should not need a subscription to exist. Paid plans are for people whose recommendations are doing real work." />

      <Section width="wide" className="pb-14">
        <ul className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <li key={plan.name}>
              <div className={cn('flex h-full flex-col rounded-[var(--radius-panel)] border p-7',
                plan.featured ? 'border-bronze-500/45 bg-bronze-500/5' : 'border-line')}>
                {plan.featured ? <p className="kicker mb-4 text-bronze-200">Most chosen</p> : <p className="kicker mb-4">Plan</p>}
                <h2 className="font-display mb-2 text-[26px] leading-none">{plan.name}</h2>
                <p className="mb-5 flex items-baseline gap-2">
                  <span className="font-display text-[40px] leading-none">{plan.price}</span>
                  <span className="text-[13px] text-ink-3">{plan.cadence}</span>
                </p>
                <p className="mb-7 text-[13.5px] leading-relaxed text-ink-3">{plan.lede}</p>
                <ul className="mb-7 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13.5px] text-ink-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-[color:var(--color-positive)]" strokeWidth={2} />{f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13.5px] text-ink-4">
                      <Minus className="mt-0.5 size-4 shrink-0" strokeWidth={2} />{f}
                    </li>
                  ))}
                </ul>
                <ButtonLink to={plan.to} variant={plan.featured ? 'primary' : 'glass'} className="w-full">{plan.cta}</ButtonLink>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-[var(--radius-panel)] border border-line bg-surface p-6">
          <p className="mb-2 text-[14px] font-medium text-ink">About billing in this build</p>
          <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-ink-3">
            Prices are indicative and no payment provider is connected, so nothing here can charge
            you. Choosing a plan creates an account and opens the Studio. Connecting Stripe is a
            deliberate future step, not a hidden one.
          </p>
        </div>
      </Section>

      <Section className="border-t border-line py-16">
        <h2 className="font-display mb-8 text-[clamp(22px,2.8vw,32px)]">Questions people ask first</h2>
        <dl className="grid gap-x-10 gap-y-7 md:grid-cols-2">
          {[
            ['Is the free plan a trial?', 'No. It does not expire and it is not feature-crippled to the point of being useless. Three Spaces is a genuine world.'],
            ['Do you take a cut of affiliate revenue?', 'No. Your affiliate relationships are yours, and Zat does not sit between you and them.'],
            ['What happens if I stop paying?', 'Your world stays online and your link keeps working. Paid features switch off; nothing is deleted.'],
            ['Can I export my data?', 'Yes — Studio → Settings exports everything as JSON.'],
          ].map(([q, a]) => (
            <div key={q}>
              <dt className="mb-2 text-[15px] font-medium text-ink">{q}</dt>
              <dd className="text-[14px] leading-relaxed text-ink-3">{a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <CTA title="Start with the free plan." body="Upgrade only when the thing is earning its keep." />
    </MarketingShell>
  );
}

// ----------------------------------------------------------------- examples

export function ExamplesRoute() {
  const people = repo.listPeople();
  return (
    <MarketingShell>
      <Meta title="Example worlds — Zat" description="Four creators, four very different worlds." path={routes.examples()} />
      <PageHero kicker="Examples" title="Four people, four very different worlds."
        lede="The same three objects produce completely different places depending on who is arranging them. These are fully populated — open anything." />

      <Section width="wide" className="pb-16">
        <ul className="grid gap-5 sm:grid-cols-2">
          {people.map((person) => {
            const spaces = repo.listSpaces(person.id);
            const items = repo.listItemsByPerson(person.id);
            return (
              <li key={person.id}>
                <Link to={routes.profile(person.handle)} className="group/w block h-full overflow-hidden rounded-[var(--radius-panel)] border border-line transition-colors hover:border-line-2">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {spaces[0] ? (
                      <Picture media={spaces[0].cover} sizes="(min-width:640px) 46vw, 92vw" className="absolute inset-0 h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover/w:scale-105" />
                    ) : null}
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent" />
                    <div className="absolute inset-x-5 bottom-5 flex items-center gap-3.5">
                      <Picture media={person.avatar} sizes="48px" className="size-11 overflow-hidden rounded-full border border-white/20" imgClassName="size-11 object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-[16px] text-ink">{person.name}</span>
                        <span className="block truncate text-[12.5px] text-ink-3">@{person.handle} · {person.location}</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="mb-4 text-[13.5px] leading-relaxed text-ink-3">{person.statement}</p>
                    <p className="text-[12px] text-ink-3">{spaces.length} Spaces · {items.length} Items · {person.roles.join(', ')}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <CTA title="Yours would look like none of these." body="That is rather the point." />
    </MarketingShell>
  );
}
