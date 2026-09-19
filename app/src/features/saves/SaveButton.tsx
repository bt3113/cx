/**
 * Save to a collection.
 *
 * One tap saves to the default collection; the chevron opens the full list so
 * a visitor can file something deliberately. Saved state is per-browser and
 * labelled as such in the dialog so nobody expects it to follow them.
 */
import { useState } from 'react';
import { Bookmark, BookmarkCheck, Check, Plus } from 'lucide-react';
import { Dialog } from '@/design/Dialog';
import { Button } from '@/design/primitives';
import { cn } from '@/design/cn';
import { useSaves, type SaveTargetKind } from '@/stores/saves';

export function SaveButton({
  targetId,
  kind,
  personHandle = 'alexden',
  label = 'Save',
  className,
  variant = 'glass',
}: {
  targetId: string;
  kind: SaveTargetKind;
  personHandle?: string;
  label?: string;
  className?: string;
  variant?: 'glass' | 'primary' | 'quiet';
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const collections = useSaves((s) => s.collections);
  const saves = useSaves((s) => s.saves);
  const toggleSave = useSaves((s) => s.toggleSave);
  const createCollection = useSaves((s) => s.createCollection);

  const saved = saves.some((s) => s.itemId === targetId);
  const savedIn = new Set(saves.filter((s) => s.itemId === targetId).map((s) => s.collectionId));

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const collection = createCollection(name);
    toggleSave({ targetId, kind, collectionId: collection.id, personHandle });
    setNewName('');
  };

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(saved && 'border-bronze-500/45 text-bronze-200', className)}
      >
        {saved ? (
          <BookmarkCheck className="size-4" strokeWidth={1.8} />
        ) : (
          <Bookmark className="size-4" strokeWidth={1.8} />
        )}
        {saved ? 'Saved' : label}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        variant="sheet"
        title="Save to my Zat"
        description="Collections live in this browser. Zat does not have visitor accounts yet, so nothing here is sent anywhere."
      >
        <ul className="space-y-1.5">
          {collections.map((collection) => {
            const isIn = savedIn.has(collection.id);
            return (
              <li key={collection.id}>
                <button
                  type="button"
                  onClick={() =>
                    toggleSave({ targetId, kind, collectionId: collection.id, personHandle })
                  }
                  aria-pressed={isIn}
                  className={cn(
                    'flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors',
                    isIn
                      ? 'border-bronze-500/45 bg-bronze-500/8 text-ink'
                      : 'border-line text-ink-2 hover:border-line-2 hover:bg-surface hover:text-ink',
                  )}
                >
                  <span className="text-[14px]">{collection.name}</span>
                  <span
                    className={cn(
                      'grid size-5 place-items-center rounded-full border',
                      isIn ? 'border-bronze-300 bg-bronze-300 text-void' : 'border-line-2',
                    )}
                  >
                    {isIn ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 border-t border-line pt-5">
          <label htmlFor="new-collection" className="kicker mb-2.5 block">
            New collection
          </label>
          <div className="flex gap-2">
            <input
              id="new-collection"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              maxLength={40}
              placeholder="Kitchen, Desk, Winter…"
              className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-4 focus:border-bronze-500/50 focus:outline-none"
            />
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={!newName.trim()}>
              <Plus className="size-4" strokeWidth={2} />
              Add
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
