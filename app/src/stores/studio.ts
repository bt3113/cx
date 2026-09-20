/**
 * Creator-side state.
 *
 * Zat has no backend, so a creator's edits live in their own browser. The
 * store keeps a **draft** and a **published** copy of a world, which is what
 * makes "Publish" a real action rather than a decorative button: the public
 * profile reads the published copy, the Studio edits the draft, and the two
 * differ until you publish.
 *
 * Shapes match what a server would return, so replacing this with an API
 * client is a change to this file alone.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { repo } from '@/lib/repo';
import type { Item, Person, Space, Theme } from '@/lib/schema';

export type World = { person: Person; spaces: Space[]; items: Item[] };

type StudioState = {
  /** Worlds edited in this browser, keyed by handle. */
  drafts: Record<string, World>;
  published: Record<string, World>;
  /** Handle whose world is currently open in the Studio. */
  active: string | null;

  openWorld: (handle: string) => World | null;
  /** Seeds a draft from the seeded catalogue, or creates an empty one. */
  ensureDraft: (handle: string, seedFrom?: string) => World;
  updatePerson: (handle: string, patch: Partial<Person>) => void;
  updateTheme: (handle: string, patch: Partial<Theme>) => void;

  upsertSpace: (handle: string, space: Space) => void;
  removeSpace: (handle: string, spaceId: string) => void;
  reorderSpaces: (handle: string, orderedIds: string[]) => void;

  upsertItem: (handle: string, item: Item) => void;
  removeItem: (handle: string, itemId: string) => void;
  reorderItems: (handle: string, spaceId: string, orderedIds: string[]) => void;

  publish: (handle: string) => void;
  unpublish: (handle: string) => void;
  revertDraft: (handle: string) => void;
  hasUnpublishedChanges: (handle: string) => boolean;
  reset: () => void;
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function worldFromCatalogue(handle: string): World | null {
  const person = repo.getPerson(handle);
  if (!person) return null;
  const spaces = repo.listSpaces(person.id);
  return {
    person: clone(person),
    spaces: clone(spaces),
    items: clone(spaces.flatMap((s) => repo.listItems(s.id))),
  };
}

function emptyWorld(handle: string): World {
  const today = new Date().toISOString().slice(0, 10);
  return {
    person: {
      id: `p_${handle}`,
      handle,
      name: '',
      roles: [],
      statement: '',
      location: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
      avatar: { key: 'avatars/alex-den', alt: 'Avatar', retina: false },
      portrait: null,
      photoUrl: null,
      character: null,
      socials: [],
      theme: {
        accent: 'bronze',
        background: 'void',
        typeset: 'editorial',
        motion: 'full',
        cardScale: 'balanced',
      },
      plan: 'free',
      published: false,
      joinedAt: today,
      updatedAt: today,
    },
    spaces: [],
    items: [],
  };
}

const touch = (world: World): World => ({
  ...world,
  person: { ...world.person, updatedAt: new Date().toISOString().slice(0, 10) },
});

const safeStorage = {
  getItem: (name: string) => {
    try {
      const raw = localStorage.getItem(name);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: unknown) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      /* quota or blocked storage — edits stay in memory for this session */
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* nothing to remove */
    }
  },
};

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => {
      /** Apply a change to one draft world. */
      const edit = (handle: string, fn: (world: World) => World) =>
        set((state) => {
          const current = state.drafts[handle];
          if (!current) return state;
          return { drafts: { ...state.drafts, [handle]: touch(fn(clone(current))) } };
        });

      return {
        drafts: {},
        published: {},
        active: null,

        openWorld(handle) {
          set({ active: handle });
          return get().drafts[handle] ?? null;
        },

        ensureDraft(handle, seedFrom) {
          const existing = get().drafts[handle];
          if (existing) return existing;
          const seeded =
            (seedFrom ? worldFromCatalogue(seedFrom) : worldFromCatalogue(handle)) ??
            emptyWorld(handle);
          const world: World = { ...seeded, person: { ...seeded.person, handle } };
          set((state) => ({ drafts: { ...state.drafts, [handle]: world }, active: handle }));
          return world;
        },

        updatePerson(handle, patch) {
          edit(handle, (w) => ({ ...w, person: { ...w.person, ...patch } }));
        },

        updateTheme(handle, patch) {
          edit(handle, (w) => ({
            ...w,
            person: { ...w.person, theme: { ...w.person.theme, ...patch } },
          }));
        },

        upsertSpace(handle, space) {
          edit(handle, (w) => {
            const i = w.spaces.findIndex((s) => s.id === space.id);
            const spaces = [...w.spaces];
            if (i >= 0) spaces[i] = space;
            else spaces.push({ ...space, order: spaces.length + 1 });
            return { ...w, spaces };
          });
        },

        removeSpace(handle, spaceId) {
          edit(handle, (w) => ({
            ...w,
            spaces: w.spaces.filter((s) => s.id !== spaceId),
            // Orphaned Items would otherwise linger invisibly.
            items: w.items.filter((i) => i.spaceId !== spaceId),
          }));
        },

        reorderSpaces(handle, orderedIds) {
          edit(handle, (w) => ({
            ...w,
            spaces: w.spaces
              .map((s) => {
                const next = orderedIds.indexOf(s.id);
                return next === -1 ? s : { ...s, order: next + 1, index: next + 1 };
              })
              .sort((a, b) => a.order - b.order),
          }));
        },

        upsertItem(handle, item) {
          edit(handle, (w) => {
            const i = w.items.findIndex((x) => x.id === item.id);
            const items = [...w.items];
            if (i >= 0) items[i] = item;
            else items.push({ ...item, order: items.filter((x) => x.spaceId === item.spaceId).length + 1 });
            return { ...w, items };
          });
        },

        removeItem(handle, itemId) {
          edit(handle, (w) => ({ ...w, items: w.items.filter((i) => i.id !== itemId) }));
        },

        reorderItems(handle, spaceId, orderedIds) {
          edit(handle, (w) => ({
            ...w,
            items: w.items.map((i) => {
              if (i.spaceId !== spaceId) return i;
              const next = orderedIds.indexOf(i.id);
              return next === -1 ? i : { ...i, order: next + 1 };
            }),
          }));
        },

        publish(handle) {
          const draft = get().drafts[handle];
          if (!draft) return;
          const live: World = {
            ...clone(draft),
            person: { ...clone(draft.person), published: true },
          };
          set((state) => ({
            published: { ...state.published, [handle]: live },
            drafts: { ...state.drafts, [handle]: { ...draft, person: { ...draft.person, published: true } } },
          }));
        },

        unpublish(handle) {
          set((state) => {
            const next = { ...state.published };
            delete next[handle];
            const draft = state.drafts[handle];
            return {
              published: next,
              drafts: draft
                ? { ...state.drafts, [handle]: { ...draft, person: { ...draft.person, published: false } } }
                : state.drafts,
            };
          });
        },

        revertDraft(handle) {
          const live = get().published[handle];
          if (!live) return;
          set((state) => ({ drafts: { ...state.drafts, [handle]: clone(live) } }));
        },

        hasUnpublishedChanges(handle) {
          const draft = get().drafts[handle];
          const live = get().published[handle];
          if (!draft) return false;
          if (!live) return true;
          return JSON.stringify(draft) !== JSON.stringify(live);
        },

        reset: () => set({ drafts: {}, published: {}, active: null }),
      };
    },
    { name: 'zat:v1:studio', version: 1, storage: safeStorage },
  ),
);

/**
 * The world a visitor sees.
 *
 * A locally published world wins over the seeded catalogue, so a creator can
 * edit in the Studio, publish, and open their public profile to see it.
 */
export function usePublicWorld(handle: string | undefined): World | null {
  const published = useStudio((s) => (handle ? s.published[handle] : undefined));
  if (!handle) return null;
  if (published) return published;
  return worldFromCatalogue(handle);
}
