/**
 * Analytics data.
 *
 * Two sources, combined honestly:
 *
 *  - a **deterministic seeded history** for the 90 days before today, so the
 *    Studio has something meaningful to show. It is generated from a fixed
 *    PRNG keyed on the Space id, so it is stable across reloads and builds —
 *    numbers that jitter on refresh are worse than no numbers.
 *  - the **real local interaction log**, merged over the top. Clicking around
 *    the product genuinely moves today's figures.
 *
 * This is labelled as demo data everywhere it surfaces. Nothing here comes
 * from a server, because there isn't one.
 */
import { allEvents } from './events';
import type { AnalyticsPoint, Interaction, Space } from '@/lib/schema';

/** Same xorshift used by the art pipeline — deterministic across runs. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0x100000000;
  };
}

const hash = (value: string) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const DAYS = 90;

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export type SpaceMetrics = {
  spaceId: string;
  title: string;
  views: number;
  opens: number;
  interactions: number;
  saves: number;
  outbound: number;
  revenue: number;
  /** opens ÷ views */
  explorationRate: number;
  /** outbound ÷ opens */
  clickThrough: number;
};

/** Daily series for one Space, stable for a given id. */
export function seriesForSpace(spaceId: string, popularity = 1): AnalyticsPoint[] {
  const r = rng(hash(spaceId));
  const base = 40 + r() * 120 * popularity;
  const points: AnalyticsPoint[] = [];

  for (let i = DAYS - 1; i >= 0; i--) {
    const date = isoDaysAgo(i);
    const day = new Date(date).getDay();
    // Weekends run lighter, and there is a slow upward drift over the window.
    const weekend = day === 0 || day === 6 ? 0.72 : 1;
    const drift = 1 + ((DAYS - i) / DAYS) * 0.45;
    const noise = 0.75 + r() * 0.5;

    const views = Math.round(base * weekend * drift * noise);
    const opens = Math.round(views * (0.2 + r() * 0.14));
    const saves = Math.round(opens * (0.1 + r() * 0.1));
    const outbound = Math.round(opens * (0.08 + r() * 0.1));
    const revenue = +(outbound * (1.6 + r() * 3.4)).toFixed(2);

    points.push({ date, views, opens, saves, outbound, revenue });
  }
  return points;
}

/** Local events recorded today, bucketed by type. */
function liveToday(targetId?: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const events: Interaction[] = allEvents().filter(
    (e) => e.ts >= start.getTime() && (!targetId || e.targetId === targetId),
  );
  const count = (type: Interaction['type']) => events.filter((e) => e.type === type).length;
  return {
    views: count('view'),
    opens: count('open'),
    saves: count('save'),
    outbound: count('outbound'),
    shares: count('share'),
  };
}

/**
 * Seeded history with the visitor's own activity merged into today, so the
 * figures respond to real use of the product.
 */
export function seriesWithLive(spaceId: string, popularity = 1): AnalyticsPoint[] {
  const series = seriesForSpace(spaceId, popularity);
  const live = liveToday(spaceId);
  const last = series[series.length - 1];
  if (!last) return series;
  series[series.length - 1] = {
    ...last,
    views: last.views + live.views,
    opens: last.opens + live.opens,
    saves: last.saves + live.saves,
    outbound: last.outbound + live.outbound,
  };
  return series;
}

export function totals(points: AnalyticsPoint[]) {
  return points.reduce(
    (acc, p) => ({
      views: acc.views + p.views,
      opens: acc.opens + p.opens,
      saves: acc.saves + p.saves,
      outbound: acc.outbound + p.outbound,
      revenue: +(acc.revenue + p.revenue).toFixed(2),
    }),
    { views: 0, opens: 0, saves: 0, outbound: 0, revenue: 0 },
  );
}

export function metricsForSpaces(spaces: Space[], itemCounts: Record<string, number>): SpaceMetrics[] {
  return spaces
    .map((space, i) => {
      const popularity = space.featured ? 1.5 : 1 - i * 0.04;
      const t = totals(seriesWithLive(space.id, Math.max(0.35, popularity)));
      const items = itemCounts[space.id] ?? 0;
      return {
        spaceId: space.id,
        title: space.title,
        views: t.views,
        opens: t.opens,
        interactions: Math.round(t.opens * (0.35 + items * 0.04)),
        saves: t.saves,
        outbound: t.outbound,
        revenue: t.revenue,
        explorationRate: t.views ? t.opens / t.views : 0,
        clickThrough: t.opens ? t.outbound / t.opens : 0,
      };
    })
    .sort((a, b) => b.views - a.views);
}

/** Where visits come from. Deterministic per handle. */
export function trafficSources(handle: string) {
  const r = rng(hash(`traffic:${handle}`));
  const raw = [
    { source: 'Shared Story', weight: 3.4 + r() },
    { source: 'Direct link', weight: 2.8 + r() },
    { source: 'Instagram bio', weight: 2.2 + r() },
    { source: 'Search', weight: 1.4 + r() },
    { source: 'Zat discovery', weight: 0.9 + r() },
    { source: 'Other', weight: 0.5 + r() },
  ];
  const sum = raw.reduce((a, b) => a + b.weight, 0);
  return raw.map((s) => ({ source: s.source, share: s.weight / sum }));
}

export function returningRate(handle: string): number {
  const r = rng(hash(`returning:${handle}`));
  return 0.24 + r() * 0.16;
}

/** Compares the last 30 days with the 30 before, for a trend indicator. */
export function trend(points: AnalyticsPoint[], key: keyof Omit<AnalyticsPoint, 'date'>): number {
  const recent = points.slice(-30).reduce((a, p) => a + (p[key] as number), 0);
  const prior = points.slice(-60, -30).reduce((a, p) => a + (p[key] as number), 0);
  if (!prior) return 0;
  return (recent - prior) / prior;
}

export const formatNumber = (n: number) => n.toLocaleString('en-GB');
export const formatMoney = (n: number) =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
export const formatPercent = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;
