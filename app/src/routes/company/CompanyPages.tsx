/**
 * Company, help and policy pages.
 *
 * Policy pages are honest drafts: they describe what this build actually does
 * — which is store everything in the visitor's own browser — and they say
 * plainly that they have not been through legal review. Claiming compliance
 * that has not been established would be worse than saying nothing.
 */
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Check } from 'lucide-react';
import { MarketingShell } from '@/app/MarketingShell';
import { Button, DisclosureChip, Section } from '@/design/primitives';
import { routes } from '@/lib/routing/base';
import { contactSchema, DISCLOSURE_META, type DisclosureKind } from '@/lib/schema';
import { Meta } from '@/seo/Meta';
import { Field } from '@/routes/auth/AuthRoutes';
import { inputClass, textareaClass } from '@/routes/studio/StudioShell';

const REVIEWED = '20 September 2026';

function Prose({
  kicker,
  title,
  lede,
  children,
  draft = false,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
  draft?: boolean;
}) {
  return (
    <>
      <Section width="narrow" className="pb-10 pt-16">
        <p className="kicker mb-5">{kicker}</p>
        <h1 className="font-display mb-5 text-[clamp(32px,5vw,54px)] leading-[1.03]">{title}</h1>
        <p className="text-[clamp(15px,1.6vw,18px)] leading-relaxed text-ink-2">{lede}</p>
        {draft ? (
          <p className="mt-7 rounded-2xl border border-bronze-500/30 bg-bronze-500/5 px-5 py-4 text-[13px] leading-relaxed text-ink-2">
            <strong className="font-medium text-ink">Draft.</strong> Written to describe what this
            build genuinely does. It has not been reviewed by a lawyer and should be before Zat
            operates commercially. Last updated {REVIEWED}.
          </p>
        ) : null}
      </Section>
      <Section width="narrow" className="pb-24">
        <div className="space-y-8">{children}</div>
      </Section>
    </>
  );
}

function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[17px] font-medium text-ink">{title}</h2>
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

// -------------------------------------------------------------------- about

export function AboutRoute() {
  return (
    <MarketingShell>
      <Meta title="About — Zat" description="Why Zat exists: a person's world is the product." path={routes.about()} />
      <Prose
        kicker="About"
        title="A person's world is the product."
        lede="Instagram shows what someone posted. LinkedIn shows what they do for work. Linktree shows where they exist. Storefronts show what someone wants you to buy. None of them show the person."
      >
        <Clause title="What we are building">
          <p>
            Zat is a creator-owned personal world: one link holding someone's identity, taste, tools,
            work, interests and recommendations, arranged the way they would arrange it.
          </p>
          <p>
            The order matters more than the features. Identity first, exploration second, trust third,
            commerce fourth. Products that invert that end up as storefronts wearing a profile, and
            people can tell.
          </p>
        </Clause>

        <Clause title="Why the trust layer is the whole thing">
          <p>
            Recommendations are the most useful thing people share and the easiest thing to corrupt.
            A recommendation without context is indistinguishable from an advert, which is why most
            of them are now ignored.
          </p>
          <p>
            So Zat makes context structural. Every Item carries how it was obtained, how long it has
            been used, how often, what is wrong with it and what to consider instead. A creator who
            lists flaws is more believable, not less, and the format rewards that.
          </p>
        </Clause>

        <Clause title="Where this goes">
          <p>
            Structured relationships between people, Spaces, Items, brands and content become a taste
            graph — a way to ask what the people you respect genuinely use, rather than what is being
            advertised hardest this week. That is the long version. The short version is one link
            that is worth clicking.
          </p>
        </Clause>

        <Clause title="Honest status">
          <p>
            This is a working product demonstration. Everything you can click genuinely works, the
            creators shown are fictional, and features needing third-party credentials — payments,
            affiliate networks, social imports — are architected but not connected. Nothing here
            pretends otherwise.
          </p>
        </Clause>
      </Prose>
    </MarketingShell>
  );
}

// ------------------------------------------------------------------ contact

export function ContactRoute() {
  const [values, setValues] = useState({ name: '', email: '', topic: 'general', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setSent(true);
  };

  return (
    <MarketingShell>
      <Meta title="Contact — Zat" description="Get in touch about Zat." path={routes.contact()} />
      <Prose kicker="Contact" title="Get in touch" lede="Creators, brands, press or anything else. Tell us which and we will point it at the right place.">
        {sent ? (
          <div role="status" className="rounded-[var(--radius-panel)] border border-[color:var(--color-positive)]/40 bg-[color:var(--color-positive)]/5 p-7 text-center">
            <Check className="mx-auto mb-4 size-6 text-[color:var(--color-positive)]" strokeWidth={2} />
            <h2 className="font-display mb-2 text-[22px]">Message ready to send</h2>
            <p className="mx-auto max-w-[46ch] text-[14px] leading-relaxed text-ink-2">
              Your message validated correctly and is held in this page. There is no mail service
              connected to this build, so nothing has actually been transmitted — that would need a
              backend and an email provider.
            </p>
            <Button variant="glass" size="sm" className="mt-5" onClick={() => { setSent(false); setValues({ name: '', email: '', topic: 'general', message: '' }); }}>
              Write another
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <Field label="Name" name="c-name" value={values.name} onChange={(v) => setValues((s) => ({ ...s, name: v }))} error={errors.name} autoComplete="name" />
            <Field label="Email" name="c-email" type="email" value={values.email} onChange={(v) => setValues((s) => ({ ...s, email: v }))} error={errors.email} autoComplete="email" />
            <div>
              <label htmlFor="c-topic" className="kicker mb-2 block">Topic</label>
              <select id="c-topic" className={inputClass} value={values.topic} onChange={(e) => setValues((s) => ({ ...s, topic: e.target.value }))}>
                <option value="general">General</option>
                <option value="creator">I am a creator</option>
                <option value="brand">Brand partnership</option>
                <option value="press">Press</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div>
              <label htmlFor="c-message" className="kicker mb-2 block">Message</label>
              <textarea id="c-message" rows={6} maxLength={2000} className={textareaClass} value={values.message}
                onChange={(e) => setValues((s) => ({ ...s, message: e.target.value }))}
                aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'c-message-error' : undefined} />
              {errors.message ? <p id="c-message-error" role="alert" className="mt-2 text-[12px] text-[#ff9aa1]">{errors.message}</p> : null}
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full">Send message</Button>
            <p className="text-[12px] leading-relaxed text-ink-3">
              No mail service is connected to this build, so this form validates and confirms but
              does not transmit.
            </p>
          </form>
        )}
      </Prose>
    </MarketingShell>
  );
}

// --------------------------------------------------------------------- help

const HELP = [
  { q: 'What is a Space?', a: 'An area of your life — Wardrobe, Camera Bag, Books, Memories. It holds Items and carries its own cover, introduction and note. Think of it as a room rather than a category.' },
  { q: 'What is an Item?', a: 'Something inside a Space, with the context that makes it worth trusting: how you got it, how long you have had it, how often you use it, what works, what does not, and what else to consider.' },
  { q: 'Do I have to declare affiliate links?', a: 'Yes. Zat will not store an Item without a disclosure, and the label travels with the Item everywhere — including onto any Story image shared from it.' },
  { q: 'How do I share a Space?', a: 'Open it and press Share. Zat generates a 1080 × 1920 image in your browser. On phones that support it, the file goes straight to the system share sheet; elsewhere you can copy the link or download the image.' },
  { q: 'Where is my data stored?', a: 'In this browser. Zat has no backend in this build, so your world, saved items and session live in local storage on this device. Studio → Settings exports everything as JSON.' },
  { q: 'Can I use my own photo instead of a character?', a: 'Yes. In the character builder, upload a cut-out figure. A transparent PNG works best against the dark background.' },
  { q: 'What happens when I publish?', a: 'Your draft is copied to the published version that visitors see. Until then, edits are yours alone. You can unpublish at any time from Settings.' },
  { q: 'Is the analytics data real?', a: 'Partly, and it says so everywhere it appears. The 90-day history is a deterministic demo series; your own clicks in this browser are genuinely recorded and merged into today.' },
];

export function HelpRoute() {
  return (
    <MarketingShell>
      <Meta title="Help — Zat" description="How Spaces, Items, disclosure, sharing and publishing work." path={routes.help()} />
      <Prose kicker="Help" title="How Zat works" lede="The questions that come up first. If yours is not here, the contact form goes to a person.">
        <dl className="space-y-7">
          {HELP.map(({ q, a }) => (
            <div key={q} className="border-t border-line pt-6">
              <dt className="mb-2.5 text-[16px] font-medium text-ink">{q}</dt>
              <dd className="text-[14.5px] leading-relaxed text-ink-2">{a}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-line pt-7 text-[14px] text-ink-2">
          Still stuck? <Link to={routes.contact()} className="text-ink underline underline-offset-4">Get in touch</Link>.
        </p>
      </Prose>
    </MarketingShell>
  );
}

// ------------------------------------------------------------------- legal

export function PrivacyRoute() {
  return (
    <MarketingShell>
      <Meta title="Privacy — Zat" description="What Zat stores, which in this build is nothing on any server." path={routes.privacy()} />
      <Prose kicker="Privacy" title="Privacy" draft lede="The short version: this build has no backend, so there is nowhere for us to keep anything about you.">
        <Clause title="What is stored, and where">
          <p>Everything Zat holds about you lives in your own browser's local storage on this device:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>your account record and signed session token</li>
            <li>your draft and published world — identity, Spaces, Items, character</li>
            <li>items you save and the collections you file them in</li>
            <li>a capped log of your own interactions, used for the Studio's figures</li>
          </ul>
          <p>None of it is transmitted. There is no server to transmit it to.</p>
        </Clause>
        <Clause title="What we collect about visitors">
          <p>
            Nothing. There is no analytics provider, no tracking pixel and no third-party script. The
            figures in the Studio come from a seeded demo series combined with your own activity in
            this browser.
          </p>
        </Clause>
        <Clause title="Third parties">
          <p>
            Fonts and images are served from the same domain as the site, so no third-party requests
            are made while you browse. Outbound product links go wherever the creator pointed them,
            and those destinations have their own policies.
          </p>
        </Clause>
        <Clause title="Deleting your data">
          <p>
            Studio → Settings → Reset everything clears it immediately. Clearing site data in your
            browser does the same. Neither requires asking us, because we do not have a copy.
          </p>
        </Clause>
        <Clause title="If Zat operated as a service">
          <p>
            A hosted Zat would need accounts, a database and payment processing, and this page would
            need to be rewritten and reviewed properly to cover lawful basis, retention, processors
            and data-subject rights. It has not been written to cover that, because this build does
            not do it.
          </p>
        </Clause>
      </Prose>
    </MarketingShell>
  );
}

export function TermsRoute() {
  return (
    <MarketingShell>
      <Meta title="Terms — Zat" description="Terms of use for the Zat demonstration." path={routes.terms()} />
      <Prose kicker="Terms" title="Terms of use" draft lede="Plain terms for a product demonstration. They are deliberately short, because this build does not take payments or host anything on your behalf.">
        <Clause title="What this is">
          <p>
            Zat is a demonstration of a creator profile product. Creator profiles shown are fictional.
            Using it does not create an account on any server, because there is not one.
          </p>
        </Clause>
        <Clause title="Your content">
          <p>
            Anything you create stays yours and stays on your device. We claim no licence over it, and
            we could not exercise one — we never receive it.
          </p>
        </Clause>
        <Clause title="Acceptable use">
          <p>
            Do not use Zat to impersonate someone, to publish recommendations you know to be false, or
            to disguise a commercial relationship. The disclosure system exists precisely so that last
            one is unnecessary.
          </p>
        </Clause>
        <Clause title="Availability and liability">
          <p>
            This build is provided as is, with no warranty and no uptime commitment. Because your data
            lives only in your browser, clearing site data will delete it and it cannot be recovered.
            Export from Settings if it matters to you.
          </p>
        </Clause>
        <Clause title="Changes">
          <p>
            These terms would need replacing, and reviewing by a lawyer, before Zat operated as a
            commercial service.
          </p>
        </Clause>
      </Prose>
    </MarketingShell>
  );
}

export function DisclosureRoute() {
  return (
    <MarketingShell>
      <Meta title="Disclosure policy — Zat" description="How Zat labels commercial relationships on every recommendation." path={routes.disclosure()} />
      <Prose kicker="Transparency" title="Disclosure policy" draft lede="Zat's position is simple: a recommendation should state its commercial relationship, every time, in a place you cannot miss.">
        <Clause title="The five states">
          <ul className="space-y-3 pt-1">
            {(Object.keys(DISCLOSURE_META) as DisclosureKind[]).map((kind) => (
              <li key={kind} className="flex flex-wrap items-baseline gap-3">
                <DisclosureChip kind={kind} />
                <span className="text-[14px] leading-relaxed text-ink-3">{DISCLOSURE_META[kind].explainer}</span>
              </li>
            ))}
          </ul>
        </Clause>
        <Clause title="Where the label appears">
          <p>
            Beside the Item, in the Space that contains it, in search results, on the creator's About
            page as an aggregate profile, and rendered into any Story image shared from it. An Item
            cannot be saved without one.
          </p>
        </Clause>
        <Clause title="Outbound links">
          <p>
            Affiliate and sponsored links carry <code className="text-ink-2">rel="sponsored nofollow"</code>{' '}
            so search engines are told as clearly as readers are.
          </p>
        </Clause>
        <Clause title="Your legal obligations">
          <p>
            Zat's labels help, but they do not discharge your duties. Advertising rules differ by
            country — the ASA in the UK, the FTC in the US, and others elsewhere — and complying with
            the ones that apply to you remains yours to do.
          </p>
        </Clause>
        <Clause title="Where Zat makes money">
          <p>
            From subscriptions, not from your affiliate revenue. Zat takes no cut of creator earnings
            and does not sit between a creator and their affiliate relationships.
          </p>
        </Clause>
      </Prose>
    </MarketingShell>
  );
}

export function CookiesRoute() {
  return (
    <MarketingShell>
      <Meta title="Cookies — Zat" description="Zat sets no cookies." path={routes.cookies()} />
      <Prose kicker="Cookies" title="Cookies" draft lede="Zat does not set any cookies. There is no consent banner because there is nothing to consent to.">
        <Clause title="What is used instead">
          <p>
            Browser local storage, which behaves differently from a cookie in the way that matters
            here: it is never sent to a server with a request. It holds your session, your world,
            your saved items and your interaction log, all on this device.
          </p>
        </Clause>
        <Clause title="No third-party storage">
          <p>
            No analytics, advertising or embedded third-party scripts run on this site, so nothing
            else can store anything either. Fonts and images are served from the same domain.
          </p>
        </Clause>
        <Clause title="Clearing it">
          <p>
            Clear site data for this domain in your browser, or use Studio → Settings → Reset
            everything.
          </p>
        </Clause>
      </Prose>
    </MarketingShell>
  );
}
