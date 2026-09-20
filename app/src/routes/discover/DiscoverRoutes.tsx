/**
 * Discovery, saved items and the public media kit.
 *
 * Search runs entirely client-side over a small inverted index built from the
 * seeded catalogue. That is a genuine working search, and the copy says
 * plainly that the corpus is Zat's launch catalogue rather than implying
 * platform-wide data that does not exist.
 */
import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search, X } from 'lucide-react';
import { MarketingShell } from '@/app/MarketingShell';
import { cn } from '@/design/cn';
import { Button, ButtonLink, DisclosureChip, Section, Stat } from '@/design/primitives';
import { BarList } from '@/features/charts/Charts';
import { formatMoney, formatNumber, metricsForSpaces, seriesForSpace, totals } from '@/lib/analytics/series';
import { Picture } from '@/lib/media';
import { repo } from '@/lib/repo';
import { routes } from '@/lib/routing/base';
import { DISCLOSURE_META, type DisclosureKind, type Item } from '@/lib/schema';
import { useSaves } from '@/stores/saves';
import { Meta } from '@/seo/Meta';
import { NotFoundRoute } from '@/routes/NotFound';
import { useParams } from 'react-router';

// ----------------------------------------------------------------- search

type Doc = {
  item: Item;
  handle: string;
  personName: string;
  spaceTitle: string;
  spaceSlug: string;
  haystack: string;
};

/** Built once: the catalogue is static within a session. */
function buildIndex(): Doc[] {
  return repo.listPeople().flatMap((person) =>
    repo.listSpaces(person.id).flatMap((space) =>
      repo.listItems(space.id).map((item) => ({
        item,
        handle: person.handle,
        personName: person.name,
        spaceTitle: space.title,
        spaceSlug: space.slug,
        haystack: [
          item.title, item.brand ?? '', item.description, item.creatorNote,
          space.title, person.name, person.roles.join(' '),
          item.likes.join(' '), item.alternatives.join(' '),
        ].join(' ').toLowerCase(),
      })),
    ),
  );
}

const CURATED = [
  'cameras actually used by travel creators',
  'chairs used by designers',
  'running shoes',
  'books worth re-reading',
  'things bought second-hand',
];

const PRICE_BANDS = [
  { id: 'all', label: 'Any price', test: () => true },
  { id: 'under50', label: 'Under £50', test: (i: Item) => i.price !== null && i.price < 50 },
  { id: '50-250', label: '£50–£250', test: (i: Item) => i.price !== null && i.price >= 50 && i.price <= 250 },
  { id: 'over250', label: 'Over £250', test: (i: Item) => i.price !== null && i.price > 250 },
  { id: 'free', label: 'No price', test: (i: Item) => i.price === null || i.price === 0 },
];

export function DiscoverRoute() {
  const index = useMemo(buildIndex, []);
  const [query, setQuery] = useState('');
  const [disclosure, setDisclosure] = useState<DisclosureKind | 'all'>('all');
  const [band, setBand] = useState('all');
  const [space, setSpace] = useState('all');
  const deferred = useDeferredValue(query);

  const spaceTitles = useMemo(
    () => Array.from(new Set(index.map((d) => d.spaceTitle))).sort(),
    [index],
  );

  const results = useMemo(() => {
    const terms = deferred.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const priceTest = PRICE_BANDS.find((b) => b.id === band)?.test ?? (() => true);

    return index
      .filter((d) => disclosure === 'all' || d.item.disclosure === disclosure)
      .filter((d) => space === 'all' || d.spaceTitle === space)
      .filter((d) => priceTest(d.item))
      .map((d) => {
        if (!terms.length) return { doc: d, score: 1 };
        // Title matches count for far more than a mention in a long note.
        const score = terms.reduce((acc, term) => {
          if (d.item.title.toLowerCase().includes(term)) return acc + 6;
          if ((d.item.brand ?? '').toLowerCase().includes(term)) return acc + 4;
          if (d.spaceTitle.toLowerCase().includes(term)) return acc + 3;
          if (d.haystack.includes(term)) return acc + 1;
          return acc;
        }, 0);
        return { doc: d, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40);
  }, [index, deferred, disclosure, band, space]);

  const clear = () => { setQuery(''); setDisclosure('all'); setBand('all'); setSpace('all'); };
  const filtered = query || disclosure !== 'all' || band !== 'all' || space !== 'all';

  return (
    <MarketingShell>
      <Meta title="Discover — Zat" description="Search what people actually use, with the disclosure attached." path={routes.discover()} />

      <Section width="wide" className="pb-10 pt-16">
        <p className="kicker mb-5">Discover</p>
        <h1 className="font-display mb-5 max-w-[18ch] text-[clamp(32px,5vw,58px)] leading-[1.02]">
          What people actually use.
        </h1>
        <p className="mb-9 max-w-[56ch] text-[16px] leading-relaxed text-ink-2">
          Every result carries its commercial relationship, so you can weigh it before you read it.
        </p>

        <div className="mb-5 flex items-center rounded-full border border-line bg-surface focus-within:border-bronze-500/50">
          <Search className="ml-5 size-4 shrink-0 text-ink-3" strokeWidth={1.8} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “camera”, “chair”, “merino”…"
            aria-label="Search items"
            className="min-w-0 flex-1 bg-transparent px-4 py-4 text-[15px] text-ink placeholder:text-ink-4 focus:outline-none"
          />
          {filtered ? (
            <button type="button" onClick={clear} aria-label="Clear search" className="pr-5 text-ink-3 hover:text-ink">
              <X className="size-4" strokeWidth={1.8} />
            </button>
          ) : null}
        </div>

        <div className="mb-6 flex flex-wrap gap-1.5">
          {CURATED.map((q) => (
            <button key={q} type="button" onClick={() => setQuery(q)}
              className="rounded-full border border-line px-3.5 py-2 text-[12.5px] text-ink-3 transition-colors hover:border-line-2 hover:text-ink">
              {q}
            </button>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap gap-4 border-y border-line py-4">
          <Facet label="Disclosure" value={disclosure} onChange={(v) => setDisclosure(v as DisclosureKind | 'all')}
            options={[{ value: 'all', label: 'Any' }, ...(Object.keys(DISCLOSURE_META) as DisclosureKind[]).map((k) => ({ value: k, label: DISCLOSURE_META[k].label }))]} />
          <Facet label="Space" value={space} onChange={setSpace}
            options={[{ value: 'all', label: 'Any' }, ...spaceTitles.map((t) => ({ value: t, label: t }))]} />
          <Facet label="Price" value={band} onChange={setBand}
            options={PRICE_BANDS.map((b) => ({ value: b.id, label: b.label }))} />
          <p className="ml-auto self-end text-[12.5px] text-ink-3">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="rounded-[var(--radius-panel)] border border-dashed border-line px-6 py-20 text-center">
            <p className="mb-2 text-[16px] text-ink">Nothing matches that</p>
            <p className="mx-auto mb-6 max-w-[44ch] text-[13.5px] leading-relaxed text-ink-3">
              Zat's catalogue is four creators deep at launch. Try a broader term, or clear the
              filters.
            </p>
            <Button variant="glass" onClick={clear}>Clear filters</Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ doc }) => (
              <li key={doc.item.id}>
                <Link to={routes.item(doc.handle, doc.spaceSlug, doc.item.slug)}
                  className="group/r block h-full overflow-hidden rounded-[var(--radius-panel)] border border-line transition-colors hover:border-line-2">
                  <div className="aspect-[4/3] overflow-hidden">
                    <Picture media={doc.item.image} sizes="(min-width:1024px) 30vw, 92vw" className="h-full w-full"
                      imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover/r:scale-105" />
                  </div>
                  <div className="p-4">
                    <p className="mb-1.5 line-clamp-2 text-[14.5px] font-medium leading-snug text-ink">{doc.item.title}</p>
                    <p className="mb-3 truncate text-[12.5px] text-ink-3">
                      {doc.personName} · {doc.spaceTitle}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <DisclosureChip kind={doc.item.disclosure} compact />
                      {doc.item.price ? <span className="text-[12.5px] tabular-nums text-ink-2">£{doc.item.price}</span> : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-[12.5px] leading-relaxed text-ink-3">
          Search covers Zat's seeded launch catalogue — {index.length} Items across{' '}
          {repo.listPeople().length} creators.{' '}
          <Link to={routes.discoverExplained()} className="text-ink-2 underline underline-offset-4 hover:text-ink">
            How discovery will work
          </Link>
        </p>
      </Section>
    </MarketingShell>
  );
}

function Facet({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>;
}) {
  const id = `facet-${label.toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="kicker mb-1.5 block">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] text-ink focus:border-bronze-500/50 focus:outline-none">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ------------------------------------------------------------------ saved

export function SavedRoute() {
  const collections = useSaves((s) => s.collections);
  const saves = useSaves((s) => s.saves);
  const removeCollection = useSaves((s) => s.removeCollection);
  const [active, setActive] = useState<string>('all');

  const resolved = saves
    .map((save) => {
      const item = repo.getItemById(save.itemId);
      const space = item ? repo.getSpaceById(item.spaceId) : undefined;
      return item && space ? { save, item, space } : null;
    })
    .filter(Boolean) as Array<{ save: (typeof saves)[number]; item: Item; space: ReturnType<typeof repo.getSpaceById> }>;

  const visible = active === 'all' ? resolved : resolved.filter((r) => r.save.collectionId === active);

  return (
    <MarketingShell>
      <Meta title="Saved — Zat" description="Items you have saved." path={routes.saved()} noIndex />
      <Section width="wide" className="pb-20 pt-16">
        <p className="kicker mb-5">Saved</p>
        <h1 className="font-display mb-5 text-[clamp(30px,4.6vw,52px)] leading-[1.03]">Your collections</h1>
        <p className="mb-9 max-w-[54ch] text-[15.5px] leading-relaxed text-ink-2">
          Saved items live in this browser. Zat has no visitor accounts yet, so nothing here is sent
          anywhere or follows you to another device.
        </p>

        {resolved.length === 0 ? (
          <div className="rounded-[var(--radius-panel)] border border-dashed border-line px-6 py-20 text-center">
            <p className="mb-2 text-[16px] text-ink">Nothing saved yet</p>
            <p className="mx-auto mb-6 max-w-[44ch] text-[13.5px] leading-relaxed text-ink-3">
              Open any Item and press Save to file it into a collection.
            </p>
            <ButtonLink to={routes.discover()} variant="primary">Find something worth saving</ButtonLink>
          </div>
        ) : (
          <>
            <div className="mb-7 flex flex-wrap gap-2">
              <button type="button" onClick={() => setActive('all')} aria-pressed={active === 'all'}
                className={cn('rounded-full border px-3.5 py-2 text-[13px] transition-colors',
                  active === 'all' ? 'border-bronze-500/50 bg-bronze-500/10 text-ink' : 'border-line text-ink-3 hover:text-ink')}>
                All ({resolved.length})
              </button>
              {collections.map((c) => {
                const count = resolved.filter((r) => r.save.collectionId === c.id).length;
                if (!count) return null;
                return (
                  <span key={c.id} className="inline-flex items-center">
                    <button type="button" onClick={() => setActive(c.id)} aria-pressed={active === c.id}
                      className={cn('rounded-l-full border border-r-0 px-3.5 py-2 text-[13px] transition-colors',
                        active === c.id ? 'border-bronze-500/50 bg-bronze-500/10 text-ink' : 'border-line text-ink-3 hover:text-ink')}>
                      {c.name} ({count})
                    </button>
                    <button type="button" onClick={() => removeCollection(c.id)} aria-label={`Delete ${c.name} collection`}
                      className={cn('rounded-r-full border px-2.5 py-2 text-ink-3 transition-colors hover:text-[#ff9aa1]',
                        active === c.id ? 'border-bronze-500/50 bg-bronze-500/10' : 'border-line')}>
                      <X className="size-3.5" strokeWidth={1.8} />
                    </button>
                  </span>
                );
              })}
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map(({ save, item, space }) => (
                <li key={save.id}>
                  <Link to={routes.item(save.personHandle, space!.slug, item.slug)}
                    className="group/s block h-full overflow-hidden rounded-[var(--radius-panel)] border border-line transition-colors hover:border-line-2">
                    <div className="aspect-[4/3] overflow-hidden">
                      <Picture media={item.image} sizes="(min-width:1024px) 30vw, 92vw" className="h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover/s:scale-105" />
                    </div>
                    <div className="p-4">
                      <p className="mb-1.5 line-clamp-2 text-[14.5px] font-medium leading-snug text-ink">{item.title}</p>
                      <p className="mb-3 truncate text-[12.5px] text-ink-3">@{save.personHandle} · {space!.title}</p>
                      <DisclosureChip kind={item.disclosure} compact />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </MarketingShell>
  );
}

// -------------------------------------------------------------- media kit

export function PublicMediaKitRoute() {
  const { handle } = useParams();
  const person = handle ? repo.getPerson(handle) : undefined;
  if (!person) return <NotFoundRoute kind="profile" />;

  const spaces = repo.listSpaces(person.id);
  const items = repo.listItemsByPerson(person.id);
  const counts = Object.fromEntries(spaces.map((s) => [s.id, repo.listItems(s.id).length]));
  const metrics = metricsForSpaces(spaces, counts);
  const series = seriesForSpace(`profile:${person.handle}`, 2.2);
  const t = totals(series);
  const disclosures = items.reduce<Record<string, number>>((acc, i) => { acc[i.disclosure] = (acc[i.disclosure] ?? 0) + 1; return acc; }, {});

  return (
    <MarketingShell>
      <Meta title={`${person.name} — media kit`} description={`Audience, engagement and disclosure profile for ${person.name}.`} path={routes.mediaKit(person.handle)} />
      <Section className="pb-20 pt-16">
        <div className="mb-10 flex flex-wrap items-center gap-5">
          <Picture media={person.avatar} priority sizes="88px" className="size-20 overflow-hidden rounded-full border border-line" imgClassName="size-20 object-cover" />
          <div className="min-w-0">
            <p className="kicker mb-2">Media kit</p>
            <h1 className="font-display text-[clamp(28px,4vw,46px)] leading-tight">{person.name}</h1>
            <p className="mt-1.5 text-[13.5px] text-ink-3">@{person.handle} · {person.location} · {person.roles.join(' · ')}</p>
          </div>
        </div>

        <p className="mb-12 max-w-[60ch] text-[16px] leading-relaxed text-ink-2">{person.statement}</p>

        <dl className="mb-14 grid grid-cols-2 gap-6 border-y border-line py-8 sm:grid-cols-4">
          <Stat label="90-day views" value={formatNumber(t.views)} />
          <Stat label="Space opens" value={formatNumber(t.opens)} />
          <Stat label="Outbound clicks" value={formatNumber(t.outbound)} />
          <Stat label="Attributed revenue" value={formatMoney(t.revenue)} hint="demo data" />
        </dl>

        <div className="mb-14 grid gap-10 sm:grid-cols-2">
          <BarList title="Top Spaces by engagement" rows={metrics.slice(0, 5).map((m) => ({ label: m.title, value: m.opens }))} />
          <div>
            <p className="kicker mb-4">Disclosure profile</p>
            <ul className="flex flex-wrap gap-2">
              {Object.entries(disclosures).map(([kind, count]) => (
                <li key={kind} className="flex items-center gap-2">
                  <DisclosureChip kind={kind as DisclosureKind} compact />
                  <span className="text-[12.5px] tabular-nums text-ink-3">{count}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-[42ch] text-[12.5px] leading-relaxed text-ink-3">
              Published openly, so a brand can see how commercial this world is before they ask.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <p className="kicker mb-4">Channels</p>
          <ul className="flex flex-wrap gap-x-7 gap-y-2.5 text-[14px] text-ink-2">
            {person.socials.map((s) => (
              <li key={s.network + s.handle}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                  {s.network}: {s.handle} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <ButtonLink to={routes.profile(person.handle)} variant="primary">View the full world</ButtonLink>
          <Button variant="glass" onClick={() => window.print()}>Print / save as PDF</Button>
        </div>

        <p className="mt-8 text-[12px] leading-relaxed text-ink-3">
          Figures are demonstration data from a seeded series. Zat has no analytics backend.
        </p>
      </Section>
    </MarketingShell>
  );
}
