/**
 * Zat's primitive vocabulary.
 *
 * Shapes, weights and materials here are read directly off the supplied
 * reference compositions: a serif wordmark with a red dot, a solid white pill
 * for the single primary action, hairline glass for everything else, and a
 * small circular arrow as the universal "open this" affordance.
 */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from './cn';
import { DISCLOSURE_META, type DisclosureKind } from '@/lib/schema';

// --- wordmark --------------------------------------------------------------

export function Wordmark({
  className,
  size = 'md',
  as: As = 'span',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  as?: 'span' | 'h1';
}) {
  const scale = { sm: 'text-[26px]', md: 'text-[33px]', lg: 'text-[44px]' }[size];
  return (
    <As className={cn('font-display inline-flex items-baseline leading-none', scale, className)}>
      <span className="tracking-[0.005em] text-ink">Zat</span>
      <span
        aria-hidden="true"
        className="ml-[0.12em] inline-block rounded-full bg-dot"
        style={{ width: '0.17em', height: '0.17em' }}
      />
      <span className="sr-only">Zat</span>
    </As>
  );
}

// --- buttons ---------------------------------------------------------------

type ButtonVariant = 'primary' | 'glass' | 'quiet' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-void font-semibold hover:bg-white focus-visible:bg-white shadow-[0_10px_30px_-12px_rgba(255,255,255,0.35)]',
  glass:
    'glass text-ink hover:bg-surface-2 hover:border-line-2 hover:-translate-y-px active:translate-y-0',
  quiet: 'text-ink-2 hover:text-ink hover:bg-surface',
  danger: 'border border-dot/40 text-[color:var(--color-dot)] hover:bg-dot/10',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[13px] gap-1.5',
  md: 'h-11 px-6 text-[14px] gap-2',
  lg: 'h-13 px-8 text-[15px] gap-2.5',
};

const BUTTON_BASE =
  'inline-flex items-center justify-center rounded-full whitespace-nowrap transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-[var(--ease-out-soft)] disabled:opacity-45 disabled:pointer-events-none select-none';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'glass', size = 'md', className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(BUTTON_BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
});

export function ButtonLink({
  to,
  variant = 'glass',
  size = 'md',
  className,
  children,
  external = false,
  ...rest
}: {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  external?: boolean;
} & Record<string, unknown>) {
  const classes = cn(BUTTON_BASE, VARIANTS[variant], SIZES[size], className);
  if (external) {
    return (
      <a href={to} className={classes} rel="noopener noreferrer" target="_blank" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={classes} {...rest}>
      {children}
    </Link>
  );
}

/**
 * The circular arrow control that appears on every card in the references.
 * Rendered as a span by default because cards are usually already links —
 * nesting interactive elements would break keyboard semantics.
 */
export function ArrowBadge({
  className,
  size = 34,
  direction = 'out',
  as = 'span',
  label,
}: {
  className?: string;
  size?: number;
  direction?: 'out' | 'right' | 'down';
  as?: 'span' | 'div';
  label?: string;
}) {
  const As = as;
  const glyph = direction === 'out' ? '↗' : direction === 'down' ? '⌄' : '→';
  return (
    <As
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      className={cn(
        'grid shrink-0 place-items-center rounded-full border border-white/20 bg-white/8 text-ink backdrop-blur-md',
        'transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-out-soft)]',
        'group-hover:border-white/40 group-hover:bg-white/16',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      <span className="-translate-y-[0.03em] leading-none">{glyph}</span>
    </As>
  );
}

// --- surfaces --------------------------------------------------------------

export function GlassPanel({
  children,
  className,
  lit = false,
}: {
  children: ReactNode;
  className?: string;
  lit?: boolean;
}) {
  return (
    <div className={cn('glass rounded-[var(--radius-panel)]', lit && 'glass-lit', className)}>
      {children}
    </div>
  );
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('kicker', className)}>{children}</p>;
}

/** The 01–12 numeral set beside a Space title in the references. */
export function SpaceNumber({ value, className }: { value: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block text-[12px] font-normal tabular-nums text-ink-3', className)}
    >
      {String(value).padStart(2, '0')}
    </span>
  );
}

// --- trust -----------------------------------------------------------------

const DISCLOSURE_TONE: Record<'neutral' | 'warm' | 'caution', string> = {
  neutral: 'border-white/14 text-ink-2',
  warm: 'border-bronze-500/45 text-bronze-200',
  caution: 'border-dot/45 text-[#ff8a92]',
};

/**
 * Disclosure is always visible next to the thing it describes. It is the
 * product's core promise, so it is styled to be read rather than skipped —
 * but kept quiet enough that it never competes with the recommendation.
 */
export function DisclosureChip({
  kind,
  className,
  compact = false,
}: {
  kind: DisclosureKind;
  className?: string;
  compact?: boolean;
}) {
  const meta = DISCLOSURE_META[kind];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] leading-none tracking-[0.04em]',
        DISCLOSURE_TONE[meta.tone],
        className,
      )}
      title={meta.explainer}
    >
      <span
        aria-hidden="true"
        className="inline-block size-1.5 rounded-full bg-current opacity-80"
      />
      {compact ? meta.short : meta.label}
    </span>
  );
}

// --- layout helpers --------------------------------------------------------

export function Section({
  children,
  className,
  width = 'default',
}: {
  children: ReactNode;
  className?: string;
  width?: 'default' | 'wide' | 'narrow';
}) {
  const w = {
    narrow: 'max-w-[720px]',
    default: 'max-w-[1160px]',
    wide: 'max-w-[1440px]',
  }[width];
  return <section className={cn('mx-auto w-full px-5 sm:px-8', w, className)}>{children}</section>;
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-line', className)} />;
}

/** Small labelled statistic used across Studio, media kit and item pages. */
export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="kicker mb-2">{label}</dt>
      <dd className="font-display tnum text-d6 leading-none text-ink">{value}</dd>
      {hint ? <p className="mt-1.5 text-[12px] text-ink-3">{hint}</p> : null}
    </div>
  );
}
