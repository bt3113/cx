/**
 * Charts.
 *
 * Hand-built SVG rather than a charting library: the shapes needed here are
 * simple, a library would cost more than the whole rest of the page, and the
 * art direction wants restraint — one accent colour, no gridlines, no legends
 * where a label will do.
 *
 * Each chart is exposed to assistive technology as a figure with a text
 * summary, so the data is never locked inside the picture.
 */
import { useId, useMemo } from 'react';
import { cn } from '@/design/cn';
import type { AnalyticsPoint } from '@/lib/schema';
import { formatNumber } from '@/lib/analytics/series';

const ACCENT = '#d8a96a';

type Metric = keyof Omit<AnalyticsPoint, 'date'>;

function buildPath(values: number[], w: number, h: number, pad = 2) {
  if (!values.length) return { line: '', area: '' };
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = values.length > 1 ? w / (values.length - 1) : w;

  const pts = values.map((v, i) => {
    const x = i * step;
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });

  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('');
  const area = `${line}L${w},${h}L0,${h}Z`;
  return { line, area };
}

/** Compact trend line, for stat tiles. */
export function Sparkline({
  points,
  metric,
  className,
  label,
}: {
  points: AnalyticsPoint[];
  metric: Metric;
  className?: string;
  label: string;
}) {
  const id = useId().replace(/:/g, '');
  const values = points.map((p) => p[metric] as number);
  const { line, area } = useMemo(() => buildPath(values, 100, 28), [values.join(',')]);

  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className={cn('h-7 w-full', className)}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.28" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id}-f)`} />
      <path d={line} fill="none" stroke={ACCENT} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Full-width area chart with a light axis. */
export function AreaChart({
  points,
  metric,
  title,
  height = 220,
  className,
}: {
  points: AnalyticsPoint[];
  metric: Metric;
  title: string;
  height?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const values = points.map((p) => p[metric] as number);
  const { line, area } = useMemo(() => buildPath(values, 600, height - 28), [values.join(','), height]);
  const max = Math.max(...values, 1);
  const total = values.reduce((a, b) => a + b, 0);

  const first = points[0]?.date;
  const last = points[points.length - 1]?.date;
  const monthLabel = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

  return (
    <figure className={cn('min-w-0', className)}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <figcaption className="kicker">{title}</figcaption>
        <span className="text-[12px] tabular-nums text-ink-3">peak {formatNumber(max)}</span>
      </div>
      <svg
        viewBox={`0 0 600 ${height - 28}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: height - 28 }}
        role="img"
        aria-label={`${title}. ${formatNumber(total)} in total over ${points.length} days, peaking at ${formatNumber(max)}.`}
      >
        <defs>
          <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.3" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id}-f)`} />
        <path d={line} fill="none" stroke={ACCENT} strokeWidth="1.75" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-ink-3">
        <span>{monthLabel(first)}</span>
        <span>{monthLabel(last)}</span>
      </div>
    </figure>
  );
}

/** Horizontal bars — better than a pie for ranked shares. */
export function BarList({
  rows,
  title,
  format = formatNumber,
  className,
}: {
  rows: Array<{ label: string; value: number; hint?: string }>;
  title: string;
  format?: (n: number) => string;
  className?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <figure className={cn('min-w-0', className)}>
      <figcaption className="kicker mb-4">{title}</figcaption>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-[13.5px] text-ink">{row.label}</span>
              <span className="shrink-0 text-[12.5px] tabular-nums text-ink-2">
                {format(row.value)}
                {row.hint ? <span className="ml-2 text-ink-3">{row.hint}</span> : null}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-bronze-400 transition-[width] duration-700 ease-[var(--ease-out-soft)]"
                style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** A single figure with its trend, used across Studio and the media kit. */
export function MetricTile({
  label,
  value,
  delta,
  points,
  metric,
  hint,
}: {
  label: string;
  value: string;
  delta?: number;
  points?: AnalyticsPoint[];
  metric?: Metric;
  hint?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface p-4">
      <p className="kicker mb-2.5">{label}</p>
      <p className="font-display mb-1 text-[clamp(22px,2.4vw,30px)] leading-none tabular-nums">
        {value}
      </p>
      {delta !== undefined ? (
        <p
          className={cn(
            'text-[12px] tabular-nums',
            up ? 'text-[color:var(--color-positive)]' : 'text-[#ff8a92]',
          )}
        >
          {up ? '↑' : '↓'} {Math.abs(delta * 100).toFixed(1)}% vs previous 30 days
        </p>
      ) : hint ? (
        <p className="text-[12px] text-ink-3">{hint}</p>
      ) : null}
      {points && metric ? (
        <div className="mt-3">
          <Sparkline points={points} metric={metric} label={`${label} trend`} />
        </div>
      ) : null}
    </div>
  );
}
