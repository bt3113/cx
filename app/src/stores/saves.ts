/**
 * Visitor-side saving — "Save to my Zat".
 *
 * Persisted to this browser only. That is a real, working feature rather than
 * a mock, but it is deliberately local: Zat has no account system behind it
 * yet, and pretending otherwise would be dishonest. The store shape matches
 * what a server-backed version would return, so moving it is a swap of the
 * persistence layer rather than a rewrite.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COLLECTION_PRESETS, type Collection, type Save } from '@/lib/schema';

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export type SaveTargetKind = 'item' | 'space';

type SavesState = {
  collections: Collection[];
  saves: Save[];
  createCollection: (name: string) => Collection;
  removeCollection: (id: string) => void;
  toggleSave: (input: {
    targetId: string;
    kind: SaveTargetKind;
    collectionId: string;
    personHandle: string;
  }) => boolean;
  isSaved: (targetId: string) => boolean;
  collectionsFor: (targetId: string) => string[];
  savesIn: (collectionId: string) => Save[];
  clearAll: () => void;
};

const initialCollections = (): Collection[] =>
  COLLECTION_PRESETS.map((name, i) => ({
    id: `col_${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    createdAt: Date.now() - (COLLECTION_PRESETS.length - i) * 1000,
  }));

export const useSaves = create<SavesState>()(
  persist(
    (set, get) => ({
      collections: initialCollections(),
      saves: [],

      createCollection(name) {
        const trimmed = name.trim().slice(0, 40);
        const existing = get().collections.find(
          (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (existing) return existing;
        const collection: Collection = { id: `col_${uid()}`, name: trimmed, createdAt: Date.now() };
        set((s) => ({ collections: [...s.collections, collection] }));
        return collection;
      },

      removeCollection(id) {
        set((s) => ({
          collections: s.collections.filter((c) => c.id !== id),
          saves: s.saves.filter((v) => v.collectionId !== id),
        }));
      },

      /** Returns true when the target ended up saved. */
      toggleSave({ targetId, collectionId, personHandle }) {
        const existing = get().saves.find(
          (s) => s.itemId === targetId && s.collectionId === collectionId,
        );
        if (existing) {
          set((s) => ({ saves: s.saves.filter((v) => v.id !== existing.id) }));
          return false;
        }
        set((s) => ({
          saves: [
            ...s.saves,
            {
              id: `sv_${uid()}`,
              collectionId,
              itemId: targetId,
              personHandle,
              note: null,
              savedAt: Date.now(),
            },
          ],
        }));
        return true;
      },

      isSaved: (targetId) => get().saves.some((s) => s.itemId === targetId),
      collectionsFor: (targetId) =>
        get()
          .saves.filter((s) => s.itemId === targetId)
          .map((s) => s.collectionId),
      savesIn: (collectionId) => get().saves.filter((s) => s.collectionId === collectionId),

      clearAll: () => set({ collections: initialCollections(), saves: [] }),
    }),
    {
      name: 'zat:v1:saves',
      version: 1,
      // Browser storage can be unavailable (private mode, blocked site data);
      // the app must still render, just without persistence.
      storage: {
        getItem: (name) => {
          try {
            const raw = localStorage.getItem(name);
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch {
            /* storage unavailable — saves stay in memory for this session */
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {
            /* nothing to do */
          }
        },
      },
    },
  ),
);
