/**
 * Creator onboarding.
 *
 * Nine steps, one decision per screen. The alternative — a single settings
 * form — is how most profile products lose people, and it also produces worse
 * worlds, because nobody writes a good Space description inside a wall of
 * inputs. Progress is saved to the draft as you go, so leaving and coming back
 * loses nothing.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Plus, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/design/cn';
import { Button, DisclosureChip, Section, Wordmark } from '@/design/primitives';
import { CharacterBuilder, CharacterPreview } from '@/features/character/CharacterBuilder';
import { defaultCharacter, type CharacterConfig } from '@/features/character/schema';
import { routes } from '@/lib/routing/base';
import { DISCLOSURE_META, type DisclosureKind, type Item, type Space } from '@/lib/schema';
import { useSession } from '@/stores/session';
import { useStudio } from '@/stores/studio';
import { CurvedGrid } from '@/world/CurvedGrid';
import { Meta } from '@/seo/Meta';
import { Field } from '@/routes/auth/AuthRoutes';

const STEPS = [
  'Handle',
  'Identity',
  'Character',
  'Interests',
  'Spaces',
  'First items',
  'Trust',
  'Preview',
  'Publish',
] as const;

/** Starting points, not a taxonomy — creators rename and add freely. */
const CATEGORY_PRESETS = [
  'Wardrobe', 'Music', 'Travel', 'Photography', 'Books', 'Work',
  'Fitness', 'Gaming', 'Movies', 'Memories', 'Ideas', 'Life',
  'Camera Bag', 'Desk', 'Beauty Routine', 'Current Rotation', 'Home', 'Food',
];

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'space';

export function OnboardingRoute() {
  const navigate = useNavigate();
  const session = useSession((s) => s.session);
  const ready = useSession((s) => s.ready);
  const hydrate = useSession((s) => s.hydrate);

  const ensureDraft = useStudio((s) => s.ensureDraft);
  const updatePerson = useStudio((s) => s.updatePerson);
  const upsertSpace = useStudio((s) => s.upsertSpace);
  const upsertItem = useStudio((s) => s.upsertItem);
  const removeSpace = useStudio((s) => s.removeSpace);
  const publish = useStudio((s) => s.publish);

  const handle = session?.handle ?? '';
  const draft = useStudio((s) => (handle ? s.drafts[handle] : undefined));

  const [step, setStep] = useState(0);
  const [roles, setRoles] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [character, setCharacter] = useState<CharacterConfig>(() => defaultCharacter(handle || 'zat'));

  useEffect(() => {
    if (!ready) void hydrate();
  }, [ready, hydrate]);

  useEffect(() => {
    if (handle) ensureDraft(handle);
  }, [handle, ensureDraft]);

  useEffect(() => {
    if (draft?.person.character) setCharacter(draft.person.character as CharacterConfig);
    if (draft?.person.roles.length) setRoles(draft.person.roles.join(', '));
  }, [draft?.person.character, draft?.person.roles]);

  const spaces = draft?.spaces ?? [];
  const items = draft?.items ?? [];

  const next = useCallback(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), []);
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const createSpacesFromCategories = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    categories.forEach((title, i) => {
      const slug = slugify(title);
      if (spaces.some((s) => s.slug === slug)) return;
      const space: Space = {
        id: `s_${handle}_${slug}`,
        personId: `p_${handle}`,
        slug,
        index: spaces.length + i + 1,
        title,
        descriptor: '',
        caption: title,
        intro: '',
        note: null,
        cover: { key: 'aura/slate', alt: `${title} cover`, retina: false },
        layout: 'text-left',
        size: 'md',
        featured: i < 3,
        order: spaces.length + i + 1,
        updatedAt: today,
      };
      upsertSpace(handle, space);
    });
  }, [categories, handle, spaces, upsertSpace]);

  const canAdvance = useMemo(() => {
    if (!draft) return false;
    switch (step) {
      case 1:
        return draft.person.name.trim().length > 0;
      case 3:
        return categories.length > 0 || spaces.length > 0;
      case 4:
        return spaces.length > 0;
      default:
        return true;
    }
  }, [step, draft, categories, spaces.length]);

  if (ready && !session) return <Navigate />;
  if (!draft) {
    return (
      <div className="grid min-h-dvh place-items-center bg-void" role="status">
        <span className="kicker">Preparing your world</span>
      </div>
    );
  }

  return (
    <>
      <Meta title="Set up your Zat" description="Build your world in nine short steps." path={routes.onboarding()} noIndex />
      <main id="main" className="relative min-h-dvh overflow-hidden bg-void pb-24">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[70vh] opacity-50">
          <CurvedGrid />
        </div>

        <Section className="relative pt-8">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link to={routes.home()} aria-label="Zat home">
              <Wordmark size="sm" />
            </Link>
            <p className="text-[12.5px] text-ink-3">
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-12">
            <div
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={STEPS.length}
              aria-label="Onboarding progress"
              className="flex gap-1.5"
            >
              {STEPS.map((label, i) => (
                <span
                  key={label}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors duration-400',
                    i <= step ? 'bg-bronze-400' : 'bg-white/10',
                  )}
                />
              ))}
            </div>
          </div>

          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {step === 0 ? (
              <StepShell title="Your address on the internet" lede="This is the link you will send. It does not change, so pick something you will still like in three years.">
                <div className="rounded-[var(--radius-panel)] border border-line bg-surface p-6">
                  <p className="kicker mb-3">Your Zat</p>
                  <p className="font-display break-all text-[clamp(22px,3.6vw,34px)] leading-tight">
                    zat.com/<span className="text-bronze-200">{handle}</span>
                  </p>
                  <p className="mt-4 text-[13px] leading-relaxed text-ink-3">
                    Claimed when you signed up. Handles are permanent while your world is published.
                  </p>
                </div>
              </StepShell>
            ) : null}

            {step === 1 ? (
              <StepShell title="Who are you?" lede="Identity comes first on Zat. Everything else hangs off this.">
                <div className="max-w-[520px] space-y-5">
                  <Field label="Name" name="ob-name" value={draft.person.name} onChange={(v) => updatePerson(handle, { name: v })} placeholder="Alex Den" maxLength={60} />
                  <Field label="Roles" name="ob-roles" value={roles} onChange={(v) => { setRoles(v); updatePerson(handle, { roles: v.split(',').map((r) => r.trim()).filter(Boolean).slice(0, 5) }); }} placeholder="Designer, Creator, Explorer" hint="Up to five, comma separated." />
                  <Field label="Location" name="ob-location" value={draft.person.location} onChange={(v) => updatePerson(handle, { location: v })} placeholder="Seoul, KR" maxLength={60} />
                  <div>
                    <label htmlFor="ob-statement" className="kicker mb-2 block">One line about you</label>
                    <textarea id="ob-statement" value={draft.person.statement} onChange={(e) => updatePerson(handle, { statement: e.target.value })} maxLength={280} rows={3}
                      placeholder="I keep one place for the things that actually shape how I work and live."
                      className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-4 focus:border-bronze-500/50 focus:outline-none" />
                    <p className="mt-2 text-[12px] text-ink-3">{draft.person.statement.length}/280</p>
                  </div>
                </div>
              </StepShell>
            ) : null}

            {step === 2 ? (
              <StepShell title="Build your character" lede="Your world needs an anchor. Build one here, or upload a cut-out photograph if you have one.">
                <CharacterBuilder value={character} onChange={(c) => { setCharacter(c); updatePerson(handle, { character: c }); }} />
              </StepShell>
            ) : null}

            {step === 3 ? (
              <StepShell title="What does your world contain?" lede="Pick the areas of your life worth showing. These become your Spaces — you can rename them later.">
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_PRESETS.map((category) => {
                    const on = categories.includes(category);
                    return (
                      <button key={category} type="button" aria-pressed={on}
                        onClick={() => setCategories((c) => (on ? c.filter((x) => x !== category) : [...c, category]))}
                        className={cn('rounded-full border px-4 py-2.5 text-[13.5px] transition-colors',
                          on ? 'border-bronze-500/50 bg-bronze-500/10 text-ink' : 'border-line text-ink-3 hover:border-line-2 hover:text-ink')}>
                        {on ? <Check className="mr-1.5 inline size-3.5" strokeWidth={2.4} /> : null}
                        {category}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-5 text-[13px] text-ink-3">{categories.length} selected · three or four is a good start</p>
              </StepShell>
            ) : null}

            {step === 4 ? (
              <StepShell title="Your Spaces" lede="Give each one a line of context. A Space with a reason reads as a room; without one it reads as a folder."
                onEnter={createSpacesFromCategories}>
                {spaces.length === 0 ? (
                  <EmptyState title="No Spaces yet" body="Go back a step and pick a few areas, or add one by hand." />
                ) : (
                  <ul className="max-w-[640px] space-y-3">
                    {spaces.map((space) => (
                      <li key={space.id} className="rounded-2xl border border-line bg-surface p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <input value={space.title} onChange={(e) => upsertSpace(handle, { ...space, title: e.target.value, slug: slugify(e.target.value) })}
                            aria-label={`${space.title} title`}
                            className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-ink focus:outline-none" />
                          <button type="button" onClick={() => removeSpace(handle, space.id)} aria-label={`Remove ${space.title}`}
                            className="text-ink-3 transition-colors hover:text-[#ff9aa1]">
                            <Trash2 className="size-4" strokeWidth={1.8} />
                          </button>
                        </div>
                        <input value={space.descriptor.replace(/\n/g, ' ')} onChange={(e) => upsertSpace(handle, { ...space, descriptor: e.target.value })}
                          aria-label={`${space.title} description`} placeholder="Two short lines of context"
                          className="w-full bg-transparent text-[13.5px] text-ink-2 placeholder:text-ink-4 focus:outline-none" />
                      </li>
                    ))}
                  </ul>
                )}
              </StepShell>
            ) : null}

            {step === 5 ? (
              <StepShell title="Add your first things" lede="One genuine item per Space beats ten filler ones. You can add the rest in the Studio.">
                <FirstItems handle={handle} spaces={spaces} items={items} onAdd={upsertItem} />
              </StepShell>
            ) : null}

            {step === 6 ? (
              <StepShell title="How you disclose" lede="This is the part that makes a Zat worth trusting. Every item carries its commercial relationship, and visitors can see the whole picture at a glance.">
                <ul className="grid max-w-[720px] gap-3 sm:grid-cols-2">
                  {(Object.keys(DISCLOSURE_META) as DisclosureKind[]).map((kind) => (
                    <li key={kind} className="rounded-2xl border border-line p-4">
                      <DisclosureChip kind={kind} />
                      <p className="mt-3 text-[13px] leading-relaxed text-ink-3">{DISCLOSURE_META[kind].explainer}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 max-w-[56ch] text-[13.5px] leading-relaxed text-ink-2">
                  Zat does not let an item exist without one of these. You set it per item in the Studio.
                </p>
              </StepShell>
            ) : null}

            {step === 7 ? (
              <StepShell title="Here is your world" lede="This is what a visitor will see. Nothing is public until you publish.">
                <div className="flex flex-wrap items-start gap-8">
                  <div className="w-[200px] shrink-0">
                    <CharacterPreview config={character} alt={`${draft.person.name}'s character`} className="w-full rounded-[var(--radius-panel)] border border-line bg-surface" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display mb-2 text-[clamp(24px,3.4vw,38px)] leading-tight">{draft.person.name || 'Unnamed'}</h3>
                    <p className="mb-1 text-[13px] text-ink-3">@{handle} · {draft.person.roles.join(' · ') || 'No roles yet'}</p>
                    <p className="mb-6 max-w-[52ch] text-[14.5px] leading-relaxed text-ink-2">{draft.person.statement || 'No statement yet.'}</p>
                    <dl className="flex flex-wrap gap-8">
                      <div><dt className="kicker mb-1.5">Spaces</dt><dd className="font-display text-[26px] leading-none">{spaces.length}</dd></div>
                      <div><dt className="kicker mb-1.5">Items</dt><dd className="font-display text-[26px] leading-none">{items.length}</dd></div>
                    </dl>
                  </div>
                </div>
              </StepShell>
            ) : null}

            {step === 8 ? (
              <StepShell title="Publish your Zat" lede="Your world goes live at your handle. You can unpublish at any time from the Studio.">
                <div className="max-w-[520px] rounded-[var(--radius-panel)] border border-line bg-surface p-6">
                  <p className="kicker mb-3">Your link</p>
                  <p className="font-display mb-6 break-all text-[22px]">zat.com/{handle}</p>
                  <Button variant="primary" size="lg" className="w-full"
                    onClick={() => { publish(handle); navigate(routes.profile(handle)); }}>
                    <Sparkles className="size-4" strokeWidth={1.8} />
                    Publish and view my world
                  </Button>
                  <Link to={routes.studio()} className="mt-4 block text-center text-[13px] text-ink-3 underline-offset-4 hover:text-ink hover:underline">
                    Skip — take me to the Studio
                  </Link>
                </div>
              </StepShell>
            ) : null}
          </motion.div>

          {/* Navigation */}
          {step < STEPS.length - 1 ? (
            <div className="mt-12 flex items-center gap-3 border-t border-line pt-7">
              <Button variant="quiet" onClick={back} disabled={step === 0}>
                <ArrowLeft className="size-4" strokeWidth={1.8} /> Back
              </Button>
              <Button variant="primary" className="ml-auto" onClick={() => { if (step === 3) createSpacesFromCategories(); next(); }} disabled={!canAdvance}>
                Continue <ArrowRight className="size-4" strokeWidth={2} />
              </Button>
            </div>
          ) : null}
        </Section>
      </main>
    </>
  );
}

function Navigate() {
  useEffect(() => {
    window.location.replace(`${import.meta.env.BASE_URL}signin`);
  }, []);
  return null;
}

function StepShell({ title, lede, children, onEnter }: { title: string; lede: string; children: React.ReactNode; onEnter?: () => void }) {
  useEffect(() => { onEnter?.(); /* run once on entry */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <h2 className="font-display mb-3 text-[clamp(26px,4vw,44px)] leading-[1.05]">{title}</h2>
      <p className="mb-9 max-w-[58ch] text-[15px] leading-relaxed text-ink-2">{lede}</p>
      {children}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-dashed border-line px-6 py-14 text-center">
      <p className="mb-2 text-[16px] text-ink">{title}</p>
      <p className="mx-auto max-w-[42ch] text-[13.5px] leading-relaxed text-ink-3">{body}</p>
    </div>
  );
}

function FirstItems({ handle, spaces, items, onAdd }: { handle: string; spaces: Space[]; items: Item[]; onAdd: (handle: string, item: Item) => void }) {
  const [spaceId, setSpaceId] = useState(spaces[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [disclosure, setDisclosure] = useState<DisclosureKind>('purchased');

  if (!spaces.length) return <EmptyState title="Add a Space first" body="Items live inside Spaces, so there needs to be somewhere to put them." />;

  const add = () => {
    if (!title.trim() || !spaceId) return;
    const today = new Date().toISOString().slice(0, 10);
    const slug = slugify(title);
    onAdd(handle, {
      id: `i_${handle}_${slug}_${Date.now().toString(36)}`,
      spaceId, personId: `p_${handle}`, slug, title: title.trim(), brand: null,
      image: { key: 'aura/dune', alt: title.trim(), retina: false },
      description: '', creatorNote: note.trim(), price: null, currency: 'GBP',
      retailer: null, productUrl: null, disclosure, usedSince: null, frequency: null,
      wouldBuyAgain: null, likes: [], dislikes: [], alternatives: [],
      featured: false, order: items.length + 1, updatedAt: today,
    });
    setTitle(''); setNote('');
  };

  return (
    <div className="max-w-[620px]">
      <div className="space-y-5 rounded-[var(--radius-panel)] border border-line bg-surface p-5">
        <div>
          <label htmlFor="ob-space" className="kicker mb-2 block">Space</label>
          <select id="ob-space" value={spaceId} onChange={(e) => setSpaceId(e.target.value)}
            className="w-full rounded-2xl border border-line bg-bg-lift px-4 py-3.5 text-[15px] text-ink focus:border-bronze-500/50 focus:outline-none">
            {spaces.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
        <Field label="What is it?" name="ob-item" value={title} onChange={setTitle} placeholder="Sony A7 IV" maxLength={80} />
        <div>
          <label htmlFor="ob-note" className="kicker mb-2 block">Why is it here?</label>
          <textarea id="ob-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={600}
            placeholder="Main camera since 2023. The autofocus is the reason."
            className="w-full resize-none rounded-2xl border border-line bg-bg-lift px-4 py-3.5 text-[14.5px] leading-relaxed text-ink placeholder:text-ink-4 focus:border-bronze-500/50 focus:outline-none" />
        </div>
        <div>
          <p className="kicker mb-2.5">How did you get it?</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DISCLOSURE_META) as DisclosureKind[]).map((kind) => (
              <button key={kind} type="button" aria-pressed={disclosure === kind} onClick={() => setDisclosure(kind)}
                className={cn('rounded-full border px-3 py-1.5 text-[12.5px] transition-colors',
                  disclosure === kind ? 'border-bronze-500/50 bg-bronze-500/10 text-ink' : 'border-line text-ink-3 hover:text-ink')}>
                {DISCLOSURE_META[kind].label}
              </button>
            ))}
          </div>
        </div>
        <Button variant="glass" onClick={add} disabled={!title.trim()} className="w-full">
          <Plus className="size-4" strokeWidth={2} /> Add item
        </Button>
      </div>

      {items.length ? (
        <ul className="mt-5 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
              <span className="min-w-0 truncate text-[14px] text-ink">{item.title}</span>
              <DisclosureChip kind={item.disclosure} compact />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
