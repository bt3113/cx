/**
 * Sign in and sign up.
 *
 * Demo-tier authentication, built properly: credentials are validated with the
 * same Zod schemas the rest of the product uses, the session is a real
 * HMAC-SHA256 token with an expiry, and route guards verify it. What it is not
 * is protection against the person holding the browser — a static bundle
 * cannot hold a secret. That is stated in the UI rather than glossed over.
 */
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowRight, Eye, EyeOff, Info } from 'lucide-react';
import { cn } from '@/design/cn';
import { Button, Section, Wordmark } from '@/design/primitives';
import { routes } from '@/lib/routing/base';
import { credentialsSchema, signUpSchema } from '@/lib/schema';
import { DEMO_ACCOUNT, useSession } from '@/stores/session';
import { useStudio } from '@/stores/studio';
import { CurvedGrid } from '@/world/CurvedGrid';
import { Meta } from '@/seo/Meta';

type Errors = Record<string, string>;

export function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  autoComplete,
  placeholder,
  prefix,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  placeholder?: string;
  prefix?: string;
  maxLength?: number;
}) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [error ? `${name}-error` : null, hint ? `${name}-hint` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <label htmlFor={name} className="kicker mb-2 block">
        {label}
      </label>
      <div
        className={cn(
          'flex items-center rounded-2xl border bg-surface transition-colors',
          error ? 'border-dot/60' : 'border-line focus-within:border-bronze-500/50',
        )}
      >
        {prefix ? (
          <span className="pl-4 text-[14px] text-ink-3" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={name}
          name={name}
          type={isPassword && reveal ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-4 focus:outline-none"
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="px-4 text-ink-3 transition-colors hover:text-ink"
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={`${name}-hint`} className="mt-2 text-[12px] text-ink-3">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-2 text-[12px] text-[#ff9aa1]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main id="main" className="relative min-h-dvh overflow-hidden bg-void py-10">
      <div aria-hidden="true" className="absolute inset-0 opacity-60">
        <CurvedGrid />
      </div>
      <Section width="narrow" className="relative">
        <Link to={routes.home()} aria-label="Zat home" className="inline-block">
          <Wordmark />
        </Link>
        <div className="mx-auto max-w-[440px] pt-[8vh]">
          <h1 className="font-display mb-3 text-[clamp(28px,4.4vw,42px)] leading-tight">{title}</h1>
          <p className="mb-9 text-[15px] leading-relaxed text-ink-2">{subtitle}</p>
          {children}
          <div className="mt-8 border-t border-line pt-6 text-[13.5px] text-ink-3">{footer}</div>
        </div>
      </Section>
    </main>
  );
}

/** Shown on both screens so nobody mistakes this for production auth. */
function DemoNotice({ onUseDemo }: { onUseDemo: () => void }) {
  return (
    <div className="mb-7 rounded-2xl border border-line bg-surface p-4">
      <p className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink">
        <Info className="size-4 text-bronze-300" strokeWidth={1.8} />
        Demo mode
      </p>
      <p className="mb-3.5 text-[12.5px] leading-relaxed text-ink-3">
        Zat runs without a backend. Accounts are signed and stored in this browser only — real
        enough to demonstrate, not to trust with anything.
      </p>
      <Button variant="glass" size="sm" onClick={onUseDemo} className="w-full">
        Enter as the demo creator
      </Button>
      <p className="mt-2.5 text-[11.5px] text-ink-4">
        {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
      </p>
    </div>
  );
}

export function SignInRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, ready, signIn, signInAsDemo, hydrate } = useSession();
  const ensureDraft = useStudio((s) => s.ensureDraft);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) void hydrate();
  }, [ready, hydrate]);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? routes.studio();
  if (ready && session) return <Navigate to={redirectTo} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const result = await signIn(email, password);
    setBusy(false);
    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    ensureDraft(email.trim().toLowerCase() === DEMO_ACCOUNT.email ? DEMO_ACCOUNT.handle : '', undefined);
    navigate(redirectTo, { replace: true });
  };

  const useDemo = async () => {
    setBusy(true);
    await signInAsDemo();
    ensureDraft(DEMO_ACCOUNT.handle);
    setBusy(false);
    navigate(routes.studio(), { replace: true });
  };

  return (
    <>
      <Meta
        title="Sign in — Zat"
        description="Sign in to your Zat Studio."
        path={routes.signIn()}
        noIndex
      />
      <AuthShell
        title="Welcome back"
        subtitle="Open your Studio and keep shaping your world."
        footer={
          <>
            No Zat yet?{' '}
            <Link to={routes.signUp()} className="text-ink underline underline-offset-4">
              Claim your handle
            </Link>
          </>
        }
      >
        <DemoNotice onUseDemo={() => void useDemo()} />

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {errors.form ? (
            <p role="alert" className="rounded-xl border border-dot/40 bg-dot/8 px-4 py-3 text-[13px] text-[#ff9aa1]">
              {errors.form}
            </p>
          ) : null}
          <Field
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
            {!busy ? <ArrowRight className="size-4" strokeWidth={2} /> : null}
          </Button>
        </form>
      </AuthShell>
    </>
  );
}

export function SignUpRoute() {
  const navigate = useNavigate();
  const { session, ready, signUp, signInAsDemo, hydrate } = useSession();
  const ensureDraft = useStudio((s) => s.ensureDraft);

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) void hydrate();
  }, [ready, hydrate]);

  if (ready && session) return <Navigate to={routes.onboarding()} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ name, handle: handle.toLowerCase(), email, password });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const result = await signUp(parsed.data);
    setBusy(false);
    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    ensureDraft(parsed.data.handle);
    navigate(routes.onboarding(), { replace: true });
  };

  return (
    <>
      <Meta
        title="Claim your Zat"
        description="Claim your handle and build a world for the things that make you, you."
        path={routes.signUp()}
      />
      <AuthShell
        title="Claim your Zat"
        subtitle="One link for your identity, taste, work and recommendations. Start with a handle."
        footer={
          <>
            Already have one?{' '}
            <Link to={routes.signIn()} className="text-ink underline underline-offset-4">
              Sign in
            </Link>
          </>
        }
      >
        <DemoNotice
          onUseDemo={() => {
            void signInAsDemo().then(() => {
              ensureDraft(DEMO_ACCOUNT.handle);
              navigate(routes.studio(), { replace: true });
            });
          }}
        />

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {errors.form ? (
            <p role="alert" className="rounded-xl border border-dot/40 bg-dot/8 px-4 py-3 text-[13px] text-[#ff9aa1]">
              {errors.form}
            </p>
          ) : null}
          <Field
            label="Your handle"
            name="handle"
            value={handle}
            onChange={(v) => setHandle(v.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            error={errors.handle}
            prefix="zat.com/"
            placeholder="yourname"
            maxLength={30}
            hint="Letters, numbers and underscores. This is your permanent address."
          />
          <Field
            label="Name"
            name="name"
            value={name}
            onChange={setName}
            error={errors.name}
            autoComplete="name"
            placeholder="How you want to be known"
            maxLength={60}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="new-password"
            hint="At least 8 characters."
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
            {busy ? 'Creating…' : 'Claim handle'}
            {!busy ? <ArrowRight className="size-4" strokeWidth={2} /> : null}
          </Button>
        </form>
      </AuthShell>
    </>
  );
}

/** Route guard. Verifies a real signed session rather than a boolean. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { session, ready, hydrate } = useSession();

  useEffect(() => {
    if (!ready) void hydrate();
  }, [ready, hydrate]);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-void" role="status" aria-live="polite">
        <span className="kicker">Checking your session</span>
      </div>
    );
  }
  if (!session) {
    return <Navigate to={routes.signIn()} state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
