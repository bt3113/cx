/**
 * Studio sections.
 *
 * Every control here writes to the draft world in `stores/studio`, and the
 * publish action in the shell copies the draft to the published copy that the
 * public profile reads. That is what makes editing here visible there.
 */
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowRight, Download, GripVertical, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/design/cn';
import { Button, DisclosureChip, Divider } from '@/design/primitives';
import { CharacterBuilder } from '@/features/character/CharacterBuilder';
import { defaultCharacter, type CharacterConfig } from '@/features/character/schema';
import { AreaChart, BarList, MetricTile } from '@/features/charts/Charts';
import { ShareButton } from '@/features/share/ShareButton';
import {
  formatMoney, formatNumber, formatPercent, metricsForSpaces,
  returningRate, seriesWithLive, totals, trafficSources, trend,
} from '@/lib/analytics/series';
import { repo } from '@/lib/repo';
import { routes } from '@/lib/routing/base';
import {
  DISCLOSURE_META, FREQUENCY_LABEL, frequencySchema,
  type DisclosureKind, type Frequency, type Item, type Space, type Theme,
} from '@/lib/schema';
import { useStudio } from '@/stores/studio';
import { Meta } from '@/seo/Meta';
import {
  StudioCard, StudioEmpty, StudioField, StudioHeader, inputClass, textareaClass, useStudioWorld,
} from './StudioShell';

const today = () => new Date().toISOString().slice(0, 10);
const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled';

function Loading() {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status">
      <span className="kicker">Loading your world</span>
    </div>
  );
}

// ---------------------------------------------------------------- overview

export function StudioOverview() {
  const { handle, world } = useStudioWorld();
  if (!world) return <Loading />;

  const itemCounts = Object.fromEntries(
    world.spaces.map((s) => [s.id, world.items.filter((i) => i.spaceId === s.id).length]),
  );
  const metrics = metricsForSpaces(world.spaces, itemCounts);
  const profileSeries = seriesWithLive(`profile:${handle}`, 2.2);
  const t = totals(profileSeries);

  const missing = [
    !world.person.name && 'a name',
    !world.person.statement && 'a one-line statement',
    world.spaces.length === 0 && 'at least one Space',
    world.items.length === 0 && 'at least one Item',
    !world.person.character && !world.person.portrait && 'a character or portrait',
  ].filter(Boolean) as string[];

  return (
    <>
      <Meta title="Studio — Zat" description="Shape your world." path={routes.studio()} noIndex />
      <StudioHeader
        title={world.person.name ? `Welcome back, ${world.person.name.split(' ')[0]}` : 'Your Studio'}
        lede="Everything about your world, in one place. Changes save as you make them and go live when you publish."
      />

      {missing.length ? (
        <StudioCard className="mb-6 border-bronze-500/30">
          <p className="mb-2 text-[14px] font-medium text-ink">Your world still needs {missing.length === 1 ? 'one thing' : `${missing.length} things`}</p>
          <p className="mb-4 text-[13.5px] leading-relaxed text-ink-3">Add {missing.join(', ')}.</p>
          <Button variant="glass" size="sm" onClick={() => { window.location.hash = ''; }}>
            <Link to={routes.studioIdentity()}>Start with identity</Link>
          </Button>
        </StudioCard>
      ) : null}

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Profile views" value={formatNumber(t.views)} delta={trend(profileSeries, 'views')} points={profileSeries} metric="views" />
        <MetricTile label="Space opens" value={formatNumber(t.opens)} delta={trend(profileSeries, 'opens')} points={profileSeries} metric="opens" />
        <MetricTile label="Saves" value={formatNumber(t.saves)} delta={trend(profileSeries, 'saves')} points={profileSeries} metric="saves" />
        <MetricTile label="Attributed revenue" value={formatMoney(t.revenue)} delta={trend(profileSeries, 'revenue')} hint="demo data" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <StudioCard>
          <AreaChart points={profileSeries} metric="views" title="Profile views, last 90 days" />
        </StudioCard>
        <StudioCard>
          <BarList
            title="Most opened Spaces"
            rows={metrics.slice(0, 5).map((m) => ({ label: m.title, value: m.opens }))}
          />
        </StudioCard>
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-ink-3">
        Figures combine a seeded demo history with your own activity in this browser. Zat has no
        analytics backend — nothing here is collected from anyone.
      </p>
    </>
  );
}

// ---------------------------------------------------------------- identity

export function StudioIdentity() {
  const { handle, world } = useStudioWorld();
  const updatePerson = useStudio((s) => s.updatePerson);
  const [roles, setRoles] = useState<string | null>(null);
  if (!world) return <Loading />;

  const person = world.person;
  const character: CharacterConfig =
    (person.character as CharacterConfig | null) ?? defaultCharacter(handle);

  return (
    <>
      <Meta title="Identity — Zat Studio" description="Who you are." path={routes.studioIdentity()} noIndex />
      <StudioHeader title="Identity" lede="Identity comes first on Zat. This is the part a visitor reads before anything else." />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudioCard className="space-y-5">
          <StudioField label="Name" htmlFor="s-name">
            <input id="s-name" className={inputClass} value={person.name} maxLength={60}
              onChange={(e) => updatePerson(handle, { name: e.target.value })} placeholder="Your name" />
          </StudioField>

          <StudioField label="Handle" htmlFor="s-handle" hint="Your permanent address. Changing it breaks existing links.">
            <div className="flex items-center rounded-2xl border border-line bg-bg-lift">
              <span className="pl-4 text-[14px] text-ink-3">zat.com/</span>
              <input id="s-handle" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-[14.5px] text-ink focus:outline-none"
                value={person.handle} readOnly aria-readonly="true" />
            </div>
          </StudioField>

          <StudioField label="Roles" htmlFor="s-roles" hint="Up to five, comma separated.">
            <input id="s-roles" className={inputClass} value={roles ?? person.roles.join(', ')}
              onChange={(e) => {
                setRoles(e.target.value);
                updatePerson(handle, { roles: e.target.value.split(',').map((r) => r.trim()).filter(Boolean).slice(0, 5) });
              }} placeholder="Designer, Creator, Explorer" />
          </StudioField>

          <StudioField label="Location" htmlFor="s-location">
            <input id="s-location" className={inputClass} value={person.location} maxLength={60}
              onChange={(e) => updatePerson(handle, { location: e.target.value })} placeholder="Seoul, KR" />
          </StudioField>

          <StudioField label="Statement" htmlFor="s-statement" hint={`${person.statement.length}/280`}>
            <textarea id="s-statement" className={textareaClass} rows={4} maxLength={280} value={person.statement}
              onChange={(e) => updatePerson(handle, { statement: e.target.value })}
              placeholder="One honest line about what this world is for." />
          </StudioField>
        </StudioCard>

        <StudioCard>
          <p className="kicker mb-4">Your character</p>
          <CharacterBuilder value={character} onChange={(c) => updatePerson(handle, { character: c })} className="lg:grid-cols-1" />
        </StudioCard>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ spaces

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5',
        isDragging && 'z-10 border-bronze-500/45 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Reorder"
        className="grid size-8 shrink-0 cursor-grab place-items-center rounded-lg text-ink-3 transition-colors hover:bg-white/8 hover:text-ink active:cursor-grabbing"
      >
        <GripVertical className="size-4" strokeWidth={1.8} />
      </button>
      {children}
    </li>
  );
}

export function StudioSpaces() {
  const { handle, world } = useStudioWorld();
  const reorderSpaces = useStudio((s) => s.reorderSpaces);
  const upsertSpace = useStudio((s) => s.upsertSpace);
  const removeSpace = useStudio((s) => s.removeSpace);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    // Keyboard reordering is why @dnd-kit was chosen over a lighter library.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!world) return <Loading />;
  const spaces = [...world.spaces].sort((a, b) => a.order - b.order);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = spaces.map((s) => s.id);
    const next = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    reorderSpaces(handle, next);
  };

  const addSpace = () => {
    const n = spaces.length + 1;
    const id = `s_${handle}_${Date.now().toString(36)}`;
    upsertSpace(handle, {
      id, personId: `p_${handle}`, slug: `space-${n}`, index: n,
      title: `Space ${n}`, descriptor: '', caption: '', intro: '', note: null,
      cover: { key: 'aura/slate', alt: 'Space cover', retina: false },
      layout: 'text-left', size: 'md', featured: false, order: n, updatedAt: today(),
    });
    navigate(routes.studioSpace(id));
  };

  return (
    <>
      <Meta title="Spaces — Zat Studio" description="The rooms of your world." path={routes.studioSpaces()} noIndex />
      <StudioHeader
        title="Spaces"
        lede="Areas of your life, in the order visitors meet them. Drag to reorder, or focus a row and use the arrow keys."
        actions={<Button variant="primary" size="sm" onClick={addSpace}><Plus className="size-4" strokeWidth={2} /> New Space</Button>}
      />

      {spaces.length === 0 ? (
        <StudioEmpty title="No Spaces yet" body="A Space is a room in your world — Wardrobe, Camera Bag, Current Rotation. Start with the one you would talk about first."
          action={<Button variant="primary" onClick={addSpace}><Plus className="size-4" strokeWidth={2} /> Create a Space</Button>} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext items={spaces.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2.5">
              {spaces.map((space) => {
                const count = world.items.filter((i) => i.spaceId === space.id).length;
                return (
                  <SortableRow key={space.id} id={space.id}>
                    <Link to={routes.studioSpace(space.id)} className="min-w-0 flex-1">
                      <span className="mb-0.5 block truncate text-[14.5px] font-medium text-ink">{space.title}</span>
                      <span className="block truncate text-[12.5px] text-ink-3">
                        /{space.slug} · {count} {count === 1 ? 'item' : 'items'}
                        {space.featured ? ' · featured' : ''}
                      </span>
                    </Link>
                    <button type="button" onClick={() => removeSpace(handle, space.id)} aria-label={`Delete ${space.title}`}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-white/8 hover:text-[#ff9aa1]">
                      <Trash2 className="size-4" strokeWidth={1.8} />
                    </button>
                  </SortableRow>
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </>
  );
}

const COVER_KEYS = [
  'aura/slate', 'aura/ember', 'aura/moss', 'aura/plum', 'aura/dune', 'aura/ink',
  'scenes/dawn-peaks', 'scenes/fog-ridge', 'scenes/ocean', 'scenes/forest',
  'scenes/night-glass', 'scenes/desert-dusk', 'scenes/cold-summit', 'scenes/amber-range',
];

export function StudioSpaceEditor() {
  const { spaceId } = useParams();
  const { handle, world } = useStudioWorld();
  const upsertSpace = useStudio((s) => s.upsertSpace);
  if (!world) return <Loading />;

  const space = world.spaces.find((s) => s.id === spaceId);
  if (!space) {
    return <StudioEmpty title="That Space is gone" body="It may have been deleted." action={<Button variant="glass"><Link to={routes.studioSpaces()}>Back to Spaces</Link></Button>} />;
  }

  const patch = (next: Partial<Space>) => upsertSpace(handle, { ...space, ...next, updatedAt: today() });
  const items = world.items.filter((i) => i.spaceId === space.id);

  return (
    <>
      <Meta title={`${space.title} — Zat Studio`} description="Edit this Space." path={routes.studioSpace(space.id)} noIndex />
      <StudioHeader title={space.title || 'Untitled Space'} lede="A Space with a reason reads as a room. Without one it reads as a folder."
        actions={<Button variant="glass" size="sm"><Link to={routes.studioSpaces()}>All Spaces</Link></Button>} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudioCard className="space-y-5">
          <StudioField label="Title" htmlFor="sp-title">
            <input id="sp-title" className={inputClass} value={space.title} maxLength={40}
              onChange={(e) => patch({ title: e.target.value, slug: slugify(e.target.value) })} />
          </StudioField>
          <StudioField label="Descriptor" htmlFor="sp-desc" hint="Two short lines shown beside the card. Use a line break between them.">
            <textarea id="sp-desc" className={textareaClass} rows={2} maxLength={80} value={space.descriptor}
              onChange={(e) => patch({ descriptor: e.target.value })} placeholder={'Good Outfits\nBetter Days.'} />
          </StudioField>
          <StudioField label="Caption" htmlFor="sp-cap" hint="Two or three words set over the artwork.">
            <textarea id="sp-cap" className={textareaClass} rows={2} maxLength={40} value={space.caption}
              onChange={(e) => patch({ caption: e.target.value })} placeholder={'Style\nMy Way.'} />
          </StudioField>
          <StudioField label="Introduction" htmlFor="sp-intro" hint="Shown when the Space opens.">
            <textarea id="sp-intro" className={textareaClass} rows={5} maxLength={600} value={space.intro}
              onChange={(e) => patch({ intro: e.target.value })} />
          </StudioField>
          <StudioField label="Personal note" htmlFor="sp-note" hint="Optional. Sits under the items.">
            <textarea id="sp-note" className={textareaClass} rows={3} maxLength={400} value={space.note ?? ''}
              onChange={(e) => patch({ note: e.target.value || null })} />
          </StudioField>
        </StudioCard>

        <div className="space-y-6">
          <StudioCard>
            <StudioField label="Cover artwork">
              <ul className="grid grid-cols-4 gap-2">
                {COVER_KEYS.map((key) => (
                  <li key={key}>
                    <button type="button" aria-label={key} aria-pressed={space.cover.key === key}
                      onClick={() => patch({ cover: { ...space.cover, key, retina: key.startsWith('scenes/') } })}
                      className={cn('aspect-square w-full overflow-hidden rounded-xl border transition-colors',
                        space.cover.key === key ? 'border-bronze-300' : 'border-line hover:border-line-2')}>
                      <img src={`${import.meta.env.BASE_URL}media/${key}.webp`} alt="" className="size-full object-cover" loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            </StudioField>
          </StudioCard>

          <StudioCard className="space-y-5">
            <StudioField label="Prominence">
              <label className="flex items-center gap-3 text-[14px] text-ink-2">
                <input type="checkbox" checked={space.featured} onChange={(e) => patch({ featured: e.target.checked })}
                  className="size-4 accent-[color:var(--color-bronze-300)]" />
                Feature this Space
              </label>
            </StudioField>
            <StudioField label="Card grammar" htmlFor="sp-layout" hint="How the card is composed in the world.">
              <select id="sp-layout" className={inputClass} value={space.layout}
                onChange={(e) => patch({ layout: e.target.value as Space['layout'] })}>
                <option value="text-left">Meta beside artwork</option>
                <option value="image-only">Artwork only</option>
                <option value="tile">Small tile</option>
              </select>
            </StudioField>
          </StudioCard>

          <StudioCard>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="kicker">Items in this Space</p>
              <Link to={routes.studioItems()} className="text-[12.5px] text-ink-2 hover:text-ink">Manage</Link>
            </div>
            {items.length ? (
              <ul className="space-y-1.5">
                {items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 text-[13.5px]">
                    <Link to={routes.studioItem(i.id)} className="min-w-0 truncate text-ink-2 hover:text-ink">{i.title}</Link>
                    <DisclosureChip kind={i.disclosure} compact />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-ink-3">No items yet.</p>
            )}
          </StudioCard>
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------------- items

export function StudioItems() {
  const { handle, world } = useStudioWorld();
  const upsertItem = useStudio((s) => s.upsertItem);
  const removeItem = useStudio((s) => s.removeItem);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  if (!world) return <Loading />;

  const visible = filter === 'all' ? world.items : world.items.filter((i) => i.spaceId === filter);

  const addItem = () => {
    const spaceId = filter !== 'all' ? filter : world.spaces[0]?.id;
    if (!spaceId) return;
    const id = `i_${handle}_${Date.now().toString(36)}`;
    upsertItem(handle, {
      id, spaceId, personId: `p_${handle}`, slug: `item-${world.items.length + 1}`,
      title: 'New item', brand: null, image: { key: 'aura/dune', alt: 'Item', retina: false },
      description: '', creatorNote: '', price: null, currency: 'GBP', retailer: null, productUrl: null,
      disclosure: 'purchased', usedSince: null, frequency: null, wouldBuyAgain: null,
      likes: [], dislikes: [], alternatives: [], featured: false,
      order: world.items.length + 1, updatedAt: today(),
    });
    navigate(routes.studioItem(id));
  };

  return (
    <>
      <Meta title="Items — Zat Studio" description="Your recommendations." path={routes.studioItems()} noIndex />
      <StudioHeader title="Items" lede="Each one carries its disclosure and the context behind it. That context is the product."
        actions={<Button variant="primary" size="sm" onClick={addItem} disabled={!world.spaces.length}><Plus className="size-4" strokeWidth={2} /> New item</Button>} />

      {world.spaces.length === 0 ? (
        <StudioEmpty title="Create a Space first" body="Items live inside Spaces, so there needs to be somewhere to put them."
          action={<Button variant="primary"><Link to={routes.studioSpaces()}>Go to Spaces</Link></Button>} />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {[{ id: 'all', title: `All (${world.items.length})` }, ...world.spaces].map((s) => (
              <button key={s.id} type="button" aria-pressed={filter === s.id} onClick={() => setFilter(s.id)}
                className={cn('rounded-full border px-3.5 py-2 text-[13px] transition-colors',
                  filter === s.id ? 'border-bronze-500/50 bg-bronze-500/10 text-ink' : 'border-line text-ink-3 hover:text-ink')}>
                {s.title}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <StudioEmpty title="Nothing here yet" body="Add the first thing you would actually recommend from this Space."
              action={<Button variant="primary" onClick={addItem}><Plus className="size-4" strokeWidth={2} /> Add an item</Button>} />
          ) : (
            <ul className="space-y-2.5">
              {visible.map((item) => {
                const space = world.spaces.find((s) => s.id === item.spaceId);
                return (
                  <li key={item.id} className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3.5">
                    <img src={`${import.meta.env.BASE_URL}media/${item.image.key}.webp`} alt=""
                      className="size-12 shrink-0 rounded-xl object-cover" loading="lazy" />
                    <Link to={routes.studioItem(item.id)} className="min-w-0 flex-1">
                      <span className="mb-0.5 block truncate text-[14.5px] font-medium text-ink">{item.title}</span>
                      <span className="block truncate text-[12.5px] text-ink-3">{space?.title ?? 'No Space'}{item.brand ? ` · ${item.brand}` : ''}</span>
                    </Link>
                    <DisclosureChip kind={item.disclosure} compact />
                    <button type="button" onClick={() => removeItem(handle, item.id)} aria-label={`Delete ${item.title}`}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-white/8 hover:text-[#ff9aa1]">
                      <Trash2 className="size-4" strokeWidth={1.8} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}

/** Editable list of short strings — likes, dislikes, alternatives. */
function StringList({ label, values, onChange, placeholder, max = 6 }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string; max?: number;
}) {
  const [draft, setDraft] = useState('');
  return (
    <StudioField label={label}>
      <ul className="mb-2 space-y-1.5">
        {values.map((v, i) => (
          <li key={`${v}-${i}`} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
            <span className="min-w-0 flex-1 text-[13.5px] text-ink-2">{v}</span>
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="text-ink-3 transition-colors hover:text-[#ff9aa1]"><Trash2 className="size-3.5" strokeWidth={1.8} /></button>
          </li>
        ))}
      </ul>
      {values.length < max ? (
        <div className="flex gap-2">
          <input className={inputClass} value={draft} placeholder={placeholder} maxLength={120}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (draft.trim()) { onChange([...values, draft.trim()]); setDraft(''); } } }} />
          <Button variant="glass" size="sm" onClick={() => { if (draft.trim()) { onChange([...values, draft.trim()]); setDraft(''); } }} disabled={!draft.trim()}>Add</Button>
        </div>
      ) : null}
    </StudioField>
  );
}

export function StudioItemEditor() {
  const { itemId } = useParams();
  const { handle, world } = useStudioWorld();
  const upsertItem = useStudio((s) => s.upsertItem);
  if (!world) return <Loading />;

  const item = world.items.find((i) => i.id === itemId);
  if (!item) {
    return <StudioEmpty title="That item is gone" body="It may have been deleted." action={<Button variant="glass"><Link to={routes.studioItems()}>Back to Items</Link></Button>} />;
  }
  const patch = (next: Partial<Item>) => upsertItem(handle, { ...item, ...next, updatedAt: today() });

  return (
    <>
      <Meta title={`${item.title} — Zat Studio`} description="Edit this item." path={routes.studioItem(item.id)} noIndex />
      <StudioHeader title={item.title || 'Untitled item'} lede="Recommendation, context, evidence. The last two are what make the first one worth anything."
        actions={<Button variant="glass" size="sm"><Link to={routes.studioItems()}>All items</Link></Button>} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudioCard className="space-y-5">
          <p className="kicker">The thing</p>
          <StudioField label="Title" htmlFor="it-title">
            <input id="it-title" className={inputClass} value={item.title} maxLength={80}
              onChange={(e) => patch({ title: e.target.value, slug: slugify(e.target.value) })} />
          </StudioField>
          <StudioField label="Brand or author" htmlFor="it-brand">
            <input id="it-brand" className={inputClass} value={item.brand ?? ''} maxLength={60}
              onChange={(e) => patch({ brand: e.target.value || null })} />
          </StudioField>
          <StudioField label="Space" htmlFor="it-space">
            <select id="it-space" className={inputClass} value={item.spaceId} onChange={(e) => patch({ spaceId: e.target.value })}>
              {world.spaces.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </StudioField>
          <StudioField label="Description" htmlFor="it-desc" hint="Neutral. What the thing actually is.">
            <textarea id="it-desc" className={textareaClass} rows={3} maxLength={400} value={item.description}
              onChange={(e) => patch({ description: e.target.value })} />
          </StudioField>
          <StudioField label="Your note" htmlFor="it-note" hint="Your voice. Why it is here, and what is wrong with it.">
            <textarea id="it-note" className={textareaClass} rows={5} maxLength={600} value={item.creatorNote}
              onChange={(e) => patch({ creatorNote: e.target.value })} />
          </StudioField>
        </StudioCard>

        <div className="space-y-6">
          <StudioCard className="space-y-5">
            <p className="kicker">Trust</p>
            <StudioField label="How you got it">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(DISCLOSURE_META) as DisclosureKind[]).map((kind) => (
                  <button key={kind} type="button" aria-pressed={item.disclosure === kind} onClick={() => patch({ disclosure: kind })}
                    className={cn('rounded-full border px-3 py-1.5 text-[12.5px] transition-colors',
                      item.disclosure === kind ? 'border-bronze-500/50 bg-bronze-500/10 text-ink' : 'border-line text-ink-3 hover:text-ink')}>
                    {DISCLOSURE_META[kind].label}
                  </button>
                ))}
              </div>
            </StudioField>
            <div className="grid gap-4 sm:grid-cols-2">
              <StudioField label="Used since" htmlFor="it-since">
                <input id="it-since" className={inputClass} value={item.usedSince ?? ''} maxLength={40}
                  onChange={(e) => patch({ usedSince: e.target.value || null })} placeholder="March 2023" />
              </StudioField>
              <StudioField label="How often" htmlFor="it-freq">
                <select id="it-freq" className={inputClass} value={item.frequency ?? ''}
                  onChange={(e) => patch({ frequency: (e.target.value || null) as Frequency | null })}>
                  <option value="">Not set</option>
                  {frequencySchema.options.map((f) => <option key={f} value={f}>{FREQUENCY_LABEL[f]}</option>)}
                </select>
              </StudioField>
            </div>
            <StudioField label="Would you buy it again?">
              <div className="flex gap-2">
                {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }, { v: null, l: 'Not sure' }].map((o) => (
                  <button key={o.l} type="button" aria-pressed={item.wouldBuyAgain === o.v} onClick={() => patch({ wouldBuyAgain: o.v })}
                    className={cn('rounded-full border px-4 py-2 text-[13px] transition-colors',
                      item.wouldBuyAgain === o.v ? 'border-bronze-500/50 bg-bronze-500/10 text-ink' : 'border-line text-ink-3 hover:text-ink')}>
                    {o.l}
                  </button>
                ))}
              </div>
            </StudioField>
            <StringList label="What works" values={item.likes} onChange={(likes) => patch({ likes })} placeholder="Autofocus never misses" />
            <StringList label="What does not" values={item.dislikes} onChange={(dislikes) => patch({ dislikes })} placeholder="Heavier than expected" />
            <StringList label="Alternatives" values={item.alternatives} onChange={(alternatives) => patch({ alternatives })} placeholder="Cheaper option that does most of it" max={4} />
          </StudioCard>

          <StudioCard className="space-y-5">
            <p className="kicker">Commerce</p>
            <p className="text-[12.5px] leading-relaxed text-ink-3">Optional, and deliberately last. A Zat works perfectly well with nothing here.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <StudioField label="Price" htmlFor="it-price">
                <input id="it-price" type="number" min="0" step="0.01" className={inputClass} value={item.price ?? ''}
                  onChange={(e) => patch({ price: e.target.value === '' ? null : Number(e.target.value) })} />
              </StudioField>
              <StudioField label="Retailer" htmlFor="it-retailer">
                <input id="it-retailer" className={inputClass} value={item.retailer ?? ''} maxLength={60}
                  onChange={(e) => patch({ retailer: e.target.value || null })} />
              </StudioField>
            </div>
            <StudioField label="Link" htmlFor="it-url" hint="Affiliate links are fine — set the disclosure above and Zat labels it everywhere.">
              <input id="it-url" type="url" className={inputClass} value={item.productUrl ?? ''}
                onChange={(e) => patch({ productUrl: e.target.value || null })} placeholder="https://" />
            </StudioField>
          </StudioCard>
        </div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------- content

export function StudioContent() {
  const { world } = useStudioWorld();
  if (!world) return <Loading />;
  const pieces = repo.listContent(world.person.id);

  return (
    <>
      <Meta title="Content — Zat Studio" description="Connect your work to your items." path={routes.studioContent()} noIndex />
      <StudioHeader title="Content" lede="Connecting a video or article to the Items inside it is what turns a recommendation into evidence." />

      {pieces.length === 0 ? (
        <StudioEmpty title="No content connected" body="Importing from Instagram, TikTok and YouTube needs platform API credentials, which this build does not have. Content connected to the seeded catalogue appears here." />
      ) : (
        <ul className="space-y-2.5">
          {pieces.map((c) => {
            const items = repo.itemsForContent(c.id);
            return (
              <li key={c.id} className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3.5">
                <img src={`${import.meta.env.BASE_URL}media/${c.thumb.key}.webp`} alt="" className="h-12 w-20 shrink-0 rounded-lg object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 truncate text-[14.5px] font-medium text-ink">{c.title}</p>
                  <p className="truncate text-[12.5px] text-ink-3">{items.length} items · {formatNumber(c.views)} views</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-6 text-[12.5px] leading-relaxed text-ink-3">
        Social imports are architected but not connected — they need OAuth credentials per platform.
        See <code className="text-ink-2">.env.example</code>.
      </p>
    </>
  );
}

// -------------------------------------------------------------- appearance

const THEME_CONTROLS: Array<{ key: keyof Theme; label: string; hint: string; options: Array<{ value: string; label: string }> }> = [
  { key: 'accent', label: 'Accent', hint: 'Used for structure and highlights, never as a fill.', options: [
    { value: 'bronze', label: 'Bronze' }, { value: 'ash', label: 'Ash' }, { value: 'sage', label: 'Sage' },
    { value: 'rose', label: 'Rose' }, { value: 'ice', label: 'Ice' }] },
  { key: 'background', label: 'Background', hint: 'All three stay dark. Zat worlds are cinematic by design.', options: [
    { value: 'void', label: 'Void' }, { value: 'graphite', label: 'Graphite' }, { value: 'umber', label: 'Umber' }] },
  { key: 'typeset', label: 'Typography', hint: 'Editorial pairs a serif display with Inter; Modern is Inter throughout.', options: [
    { value: 'editorial', label: 'Editorial' }, { value: 'modern', label: 'Modern' }] },
  { key: 'motion', label: 'Motion', hint: 'A visitor’s reduced-motion setting always overrides this.', options: [
    { value: 'full', label: 'Full' }, { value: 'subtle', label: 'Subtle' }, { value: 'still', label: 'Still' }] },
  { key: 'cardScale', label: 'Card size', hint: 'How much room each Space takes in the world.', options: [
    { value: 'compact', label: 'Compact' }, { value: 'balanced', label: 'Balanced' }, { value: 'generous', label: 'Generous' }] },
];

export function StudioAppearance() {
  const { handle, world } = useStudioWorld();
  const updateTheme = useStudio((s) => s.updateTheme);
  if (!world) return <Loading />;
  const theme = world.person.theme;

  return (
    <>
      <Meta title="Appearance — Zat Studio" description="Personalise your world." path={routes.studioAppearance()} noIndex />
      <StudioHeader title="Appearance" lede="Constrained on purpose. Zat gives you real choices within a system that keeps every world looking considered — there is no free-form page builder here." />

      <div className="grid gap-4 sm:grid-cols-2">
        {THEME_CONTROLS.map((control) => (
          <StudioCard key={control.key}>
            <p className="kicker mb-3">{control.label}</p>
            <div className="mb-3 flex flex-wrap gap-2" role="radiogroup" aria-label={control.label}>
              {control.options.map((option) => (
                <button key={option.value} type="button" role="radio" aria-checked={theme[control.key] === option.value}
                  onClick={() => updateTheme(handle, { [control.key]: option.value } as Partial<Theme>)}
                  className={cn('rounded-full border px-3.5 py-2 text-[13px] transition-colors',
                    theme[control.key] === option.value ? 'border-bronze-500/50 bg-bronze-500/10 text-ink' : 'border-line text-ink-3 hover:text-ink')}>
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-[12px] leading-relaxed text-ink-3">{control.hint}</p>
          </StudioCard>
        ))}
      </div>
    </>
  );
}

// ------------------------------------------------------------------- story

export function StudioStory() {
  const { handle, world } = useStudioWorld();
  if (!world) return <Loading />;
  const person = { ...world.person, handle };

  return (
    <>
      <Meta title="Story Studio — Zat" description="Generate share assets." path={routes.studioStory()} noIndex />
      <StudioHeader title="Story Studio" lede="Every profile, Space and Item generates a 1080 × 1920 image, rendered in your browser. The disclosure travels with it — a recommendation that loses its context on the way out is the problem Zat exists to fix." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StudioCard>
          <p className="mb-2 text-[15px] font-medium text-ink">Your whole world</p>
          <p className="mb-5 text-[13px] leading-relaxed text-ink-3">Your character, name and three Spaces.</p>
          <ShareButton subject="profile" person={person} spaces={world.spaces} url={routes.profile(handle)} label="Generate" variant="primary" />
        </StudioCard>

        {world.spaces.slice(0, 5).map((space) => (
          <StudioCard key={space.id}>
            <p className="mb-2 text-[15px] font-medium text-ink">{space.title}</p>
            <p className="mb-5 line-clamp-2 text-[13px] leading-relaxed text-ink-3">{space.intro || 'No introduction yet.'}</p>
            <ShareButton subject="space" person={person} space={space} url={routes.space(handle, space.slug)} label="Generate" />
          </StudioCard>
        ))}
      </div>
    </>
  );
}

// --------------------------------------------------------------- analytics

export function StudioAnalytics() {
  const { handle, world } = useStudioWorld();
  if (!world) return <Loading />;

  const itemCounts = Object.fromEntries(world.spaces.map((s) => [s.id, world.items.filter((i) => i.spaceId === s.id).length]));
  const metrics = metricsForSpaces(world.spaces, itemCounts);
  const series = seriesWithLive(`profile:${handle}`, 2.2);
  const t = totals(series);
  const sources = trafficSources(handle);
  const returning = returningRate(handle);

  const savedItems = [...world.items]
    .map((i) => ({ item: i, score: (metrics.find((m) => m.spaceId === i.spaceId)?.saves ?? 0) / Math.max(1, itemCounts[i.spaceId] ?? 1) }))
    .sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <>
      <Meta title="Analytics — Zat Studio" description="How your world is being explored." path={routes.studioAnalytics()} noIndex />
      <StudioHeader title="Analytics" lede="Not just views. Whether people explore, what they save, what they open, and what that is worth." />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Profile views" value={formatNumber(t.views)} delta={trend(series, 'views')} points={series} metric="views" />
        <MetricTile label="Returning visitors" value={formatPercent(returning)} hint="of all visitors" />
        <MetricTile label="Outbound clicks" value={formatNumber(t.outbound)} delta={trend(series, 'outbound')} points={series} metric="outbound" />
        <MetricTile label="Attributed revenue" value={formatMoney(t.revenue)} delta={trend(series, 'revenue')} hint="demo attribution" />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <StudioCard><AreaChart points={series} metric="views" title="Views, last 90 days" /></StudioCard>
        <StudioCard>
          <BarList title="Where visits come from" rows={sources.map((s) => ({ label: s.source, value: Math.round(s.share * t.views) }))} />
        </StudioCard>
      </div>

      <StudioCard className="mb-6 overflow-x-auto">
        <p className="kicker mb-4">By Space</p>
        <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
          <caption className="sr-only">Per-Space performance over the last 90 days</caption>
          <thead>
            <tr className="border-b border-line text-left">
              {['Space', 'Views', 'Opens', 'Exploration', 'Interactions', 'Saves', 'Outbound', 'CTR', 'Revenue'].map((h) => (
                <th key={h} scope="col" className="kicker whitespace-nowrap py-2.5 pr-4 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.spaceId} className="border-b border-line/60 last:border-0">
                <th scope="row" className="whitespace-nowrap py-3 pr-4 text-left font-medium text-ink">{m.title}</th>
                <td className="py-3 pr-4 tabular-nums text-ink-2">{formatNumber(m.views)}</td>
                <td className="py-3 pr-4 tabular-nums text-ink-2">{formatNumber(m.opens)}</td>
                <td className="py-3 pr-4 tabular-nums text-ink-2">{formatPercent(m.explorationRate)}</td>
                <td className="py-3 pr-4 tabular-nums text-ink-2">{formatNumber(m.interactions)}</td>
                <td className="py-3 pr-4 tabular-nums text-ink-2">{formatNumber(m.saves)}</td>
                <td className="py-3 pr-4 tabular-nums text-ink-2">{formatNumber(m.outbound)}</td>
                <td className="py-3 pr-4 tabular-nums text-ink-2">{formatPercent(m.clickThrough)}</td>
                <td className="py-3 tabular-nums text-ink">{formatMoney(m.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StudioCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudioCard>
          <BarList title="Most saved items" rows={savedItems.map((s) => ({ label: s.item.title, value: Math.round(s.score) }))} />
        </StudioCard>
        <StudioCard>
          <p className="kicker mb-4">Content to product</p>
          <p className="mb-4 text-[13.5px] leading-relaxed text-ink-2">
            {formatPercent(0.31, 0)} of Item views arrive from a connected piece of content. Items that
            appear in something you made convert roughly twice as well as ones that do not.
          </p>
          <p className="text-[12px] leading-relaxed text-ink-3">Demo figure. Real attribution needs outbound tracking infrastructure.</p>
        </StudioCard>
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-ink-3">
        All figures combine a deterministic demo history with your own activity in this browser.
        There is no analytics backend and no data is collected from visitors.
      </p>
    </>
  );
}

// --------------------------------------------------------------- media kit

export function StudioMediaKit() {
  const { handle, world } = useStudioWorld();
  if (!world) return <Loading />;

  const itemCounts = Object.fromEntries(world.spaces.map((s) => [s.id, world.items.filter((i) => i.spaceId === s.id).length]));
  const metrics = metricsForSpaces(world.spaces, itemCounts);
  const series = seriesWithLive(`profile:${handle}`, 2.2);
  const t = totals(series);
  const disclosures = world.items.reduce<Record<string, number>>((acc, i) => { acc[i.disclosure] = (acc[i.disclosure] ?? 0) + 1; return acc; }, {});

  return (
    <>
      <Meta title="Media kit — Zat Studio" description="A summary you can send to a brand." path={routes.studioMediaKit()} noIndex />
      <StudioHeader title="Media kit" lede="A summary a brand can read in a minute. Print it to PDF, or send the public link."
        actions={<>
          <Button variant="glass" size="sm" onClick={() => window.print()}><Download className="size-4" strokeWidth={1.8} /> Print / PDF</Button>
          <Button variant="primary" size="sm"><Link to={routes.mediaKit(handle)}>Public version <ArrowRight className="ml-1 inline size-3.5" /></Link></Button>
        </>} />

      <StudioCard className="space-y-8">
        <div>
          <h2 className="font-display mb-1.5 text-d5 leading-tight">{world.person.name || handle}</h2>
          <p className="text-[13.5px] text-ink-3">@{handle} · {world.person.location} · {world.person.roles.join(' · ')}</p>
          <p className="mt-4 max-w-[60ch] text-[14.5px] leading-relaxed text-ink-2">{world.person.statement}</p>
        </div>

        <Divider />

        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div><dt className="kicker mb-2">90-day views</dt><dd className="font-display text-d6 leading-none">{formatNumber(t.views)}</dd></div>
          <div><dt className="kicker mb-2">Space opens</dt><dd className="font-display text-d6 leading-none">{formatNumber(t.opens)}</dd></div>
          <div><dt className="kicker mb-2">Outbound clicks</dt><dd className="font-display text-d6 leading-none">{formatNumber(t.outbound)}</dd></div>
          <div><dt className="kicker mb-2">Saves</dt><dd className="font-display text-d6 leading-none">{formatNumber(t.saves)}</dd></div>
        </dl>

        <Divider />

        <div className="grid gap-8 sm:grid-cols-2">
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
            <p className="mt-4 max-w-[40ch] text-[12.5px] leading-relaxed text-ink-3">
              Published openly. A brand can see exactly how much of this world is commercial before
              they ask.
            </p>
          </div>
        </div>

        <Divider />

        <div>
          <p className="kicker mb-3">Channels</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-ink-2">
            {world.person.socials.map((s) => <li key={s.network + s.handle}>{s.network}: {s.handle}</li>)}
            {world.person.socials.length === 0 ? <li className="text-ink-3">No channels added yet.</li> : null}
          </ul>
        </div>
      </StudioCard>
    </>
  );
}

// ---------------------------------------------------------------- settings

export function StudioSettings() {
  const { handle, world } = useStudioWorld();
  const publish = useStudio((s) => s.publish);
  const unpublish = useStudio((s) => s.unpublish);
  const revert = useStudio((s) => s.revertDraft);
  const published = useStudio((s) => Boolean(s.published[handle]));
  const dirty = useStudio((s) => s.hasUnpublishedChanges(handle));
  const [confirming, setConfirming] = useState(false);
  if (!world) return <Loading />;

  return (
    <>
      <Meta title="Settings — Zat Studio" description="Account and publishing." path={routes.studioSettings()} noIndex />
      <StudioHeader title="Settings" lede="Publishing, plan and account." />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudioCard className="space-y-4">
          <p className="kicker">Publishing</p>
          <p className="text-[14px] leading-relaxed text-ink-2">
            {published ? (dirty ? 'Your world is live, with changes not yet published.' : 'Your world is live and up to date.') : 'Your world is private. Nobody can see it yet.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm" onClick={() => publish(handle)} disabled={published && !dirty}>
              {published ? 'Publish changes' : 'Publish world'}
            </Button>
            {dirty && published ? <Button variant="glass" size="sm" onClick={() => revert(handle)}>Discard changes</Button> : null}
            {published ? <Button variant="danger" size="sm" onClick={() => unpublish(handle)}>Unpublish</Button> : null}
          </div>
        </StudioCard>

        <StudioCard className="space-y-4">
          <p className="kicker">Plan</p>
          <p className="font-display text-d6 capitalize leading-none">{world.person.plan}</p>
          <p className="text-[13.5px] leading-relaxed text-ink-3">
            Billing needs a payment provider, which this build does not have connected. Plans are
            shown for demonstration.
          </p>
          <Button variant="glass" size="sm"><Link to={routes.pricing()}>Compare plans</Link></Button>
        </StudioCard>

        <StudioCard className="space-y-4">
          <p className="kicker">Your data</p>
          <p className="text-[13.5px] leading-relaxed text-ink-3">
            Everything you have created lives in this browser. Clearing site data removes it, and it
            does not follow you to another device.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="glass" size="sm"
              onClick={() => {
                const blob = new Blob([JSON.stringify(world, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `zat-${handle}.json`; a.click();
                URL.revokeObjectURL(url);
              }}>
              <Download className="size-4" strokeWidth={1.8} /> Export as JSON
            </Button>
            {confirming ? (
              <>
                <Button variant="danger" size="sm" onClick={() => { useStudio.getState().reset(); setConfirming(false); }}>Confirm reset</Button>
                <Button variant="quiet" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
              </>
            ) : (
              <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>Reset everything</Button>
            )}
          </div>
        </StudioCard>

        <StudioCard className="space-y-3">
          <p className="kicker">Custom domain</p>
          <p className="text-[13.5px] leading-relaxed text-ink-3">
            Available on Creator and Pro. Connecting one needs DNS and certificate infrastructure,
            which is out of scope for this build.
          </p>
        </StudioCard>
      </div>
    </>
  );
}
