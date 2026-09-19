/**
 * Local interaction log.
 *
 * Zat has no analytics backend, so nothing here leaves the browser. What it
 * does do is real: interactions are recorded, capped and rolled up, and the
 * Studio's analytics merge this live log over the seeded history. That keeps
 * the demo honest — the numbers you move by clicking around are genuinely
 * your own.
 */
import type { Interaction, InteractionType, NodeType } from '@/lib/schema';

const KEY = 'zat:v1:events';
/** Enough to show movement in the Studio without unbounded storage growth. */
const MAX_EVENTS = 500;

type TrackInput = {
  type: InteractionType;
  targetType: NodeType;
  targetId: string;
  source?: Interaction['source'];
};

function read(): Interaction[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Interaction[]) : [];
  } catch {
    return [];
  }
}

function write(events: Interaction[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    /* storage unavailable — the session still works, it just has no history */
  }
}

export function track(input: TrackInput): void {
  if (typeof window === 'undefined') return;
  const event: Interaction = {
    id: `ev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    type: input.type,
    targetType: input.targetType,
    targetId: input.targetId,
    ts: Date.now(),
    source: input.source ?? 'direct',
  };
  write([...read(), event]);
  notify();
}

export function allEvents(): Interaction[] {
  return read();
}

export function eventsToday(): Interaction[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return read().filter((e) => e.ts >= start.getTime());
}

export function countBy(type: InteractionType, targetId?: string): number {
  return read().filter((e) => e.type === type && (!targetId || e.targetId === targetId)).length;
}

export function clearEvents(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
  notify();
}

// --- subscription, so Studio views update as events land -------------------

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeToEvents(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
