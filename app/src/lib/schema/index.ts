/**
 * Zat's domain schema — the single source of truth for every type in the app.
 *
 * Two commitments shape this file:
 *
 *  1. **Trust is structural.** A recommendation is not a product with a buy
 *     button; it is `recommendation + context + evidence`. Disclosure, duration
 *     of use, frequency, likes, dislikes and alternatives are first-class
 *     fields, not optional metadata.
 *
 *  2. **The Taste Graph stays open.** Connections live in a generic
 *     `Relationship` edge rather than being embedded as joins, so a future
 *     Person → Space → Item → Brand → Content → Audience graph is a query
 *     rather than a migration.
 */
import { z } from 'zod';

export const idSchema = z.string().min(1);
export const slugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens');

export const handleSchema = z
  .string()
  .min(2)
  .max(30)
  .regex(/^[a-z0-9_]+$/, 'Letters, numbers and underscores only');

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

// ---------------------------------------------------------------------------
// Disclosure — the heart of the trust layer.
// ---------------------------------------------------------------------------

export const disclosureKindSchema = z.enum([
  'purchased',
  'gifted',
  'sponsored',
  'affiliate',
  'editorial',
]);
export type DisclosureKind = z.infer<typeof disclosureKindSchema>;

/** Copy and tone for each disclosure state, kept with the data it labels. */
export const DISCLOSURE_META: Record<
  DisclosureKind,
  { label: string; short: string; explainer: string; tone: 'neutral' | 'warm' | 'caution' }
> = {
  purchased: {
    label: 'Purchased myself',
    short: 'Bought it',
    explainer: 'Paid for with their own money. No brand relationship of any kind.',
    tone: 'neutral',
  },
  gifted: {
    label: 'Gifted',
    short: 'Gifted',
    explainer: 'Received free of charge. No payment was made for coverage.',
    tone: 'warm',
  },
  sponsored: {
    label: 'Sponsored',
    short: 'Sponsored',
    explainer: 'A brand paid for this placement. Treat the opinion accordingly.',
    tone: 'caution',
  },
  affiliate: {
    label: 'Affiliate link',
    short: 'Affiliate',
    explainer: 'Bought independently, but this link may earn a commission.',
    tone: 'warm',
  },
  editorial: {
    label: 'Editorial',
    short: 'Editorial',
    explainer: 'Included purely as a recommendation. Nothing commercial attached.',
    tone: 'neutral',
  },
};

export const frequencySchema = z.enum(['daily', 'weekly', 'monthly', 'occasionally', 'seasonally']);
export type Frequency = z.infer<typeof frequencySchema>;

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: 'Every day',
  weekly: 'Most weeks',
  monthly: 'A few times a month',
  occasionally: 'Now and then',
  seasonally: 'Seasonally',
};

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

/** A media reference resolved against the generated manifest at render time. */
export const mediaSchema = z.object({
  /** Path within public/media, without extension, e.g. `spaces/wardrobe`. */
  key: z.string().min(1),
  alt: z.string().min(1),
  /** Present when a 2x variant was emitted. */
  retina: z.boolean().default(false),
});
export type Media = z.infer<typeof mediaSchema>;

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------

export const socialSchema = z.object({
  network: z.enum(['instagram', 'x', 'youtube', 'tiktok', 'linkedin', 'dribbble', 'website']),
  handle: z.string().min(1),
  url: z.string().url(),
});

export const planSchema = z.enum(['free', 'creator', 'pro']);
export type Plan = z.infer<typeof planSchema>;

/** Constrained personalisation. Zat enforces good design; this is the dial. */
export const themeSchema = z.object({
  accent: z.enum(['bronze', 'ash', 'sage', 'rose', 'ice']).default('bronze'),
  background: z.enum(['void', 'graphite', 'umber']).default('void'),
  typeset: z.enum(['editorial', 'modern']).default('editorial'),
  motion: z.enum(['still', 'subtle', 'full']).default('full'),
  cardScale: z.enum(['compact', 'balanced', 'generous']).default('balanced'),
});
export type Theme = z.infer<typeof themeSchema>;

export const personSchema = z.object({
  id: idSchema,
  handle: handleSchema,
  name: z.string().min(1).max(60),
  roles: z.array(z.string().min(1)).max(5),
  statement: z.string().max(280),
  location: z.string().max(60),
  timezone: z.string().max(40),
  avatar: mediaSchema,
  portrait: mediaSchema.nullable(),
  socials: z.array(socialSchema),
  theme: themeSchema,
  plan: planSchema,
  published: z.boolean(),
  joinedAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type Person = z.infer<typeof personSchema>;

// ---------------------------------------------------------------------------
// Space
// ---------------------------------------------------------------------------

/**
 * Card grammars observed in the references. The world composes all three
 * rather than repeating one card shape.
 */
export const spaceLayoutSchema = z.enum(['text-left', 'image-only', 'tile']);
export type SpaceLayout = z.infer<typeof spaceLayoutSchema>;

export const spaceSizeSchema = z.enum(['sm', 'md', 'lg', 'xl']);

export const spaceSchema = z.object({
  id: idSchema,
  personId: idSchema,
  slug: slugSchema,
  /** The 01–12 numeral shown beside the title. */
  index: z.number().int().min(1).max(99),
  title: z.string().min(1).max(40),
  /** Two or three short lines beside the card. */
  descriptor: z.string().max(80),
  /** Two or three words set over the artwork. */
  caption: z.string().max(40),
  /** Long-form editorial introduction shown on the Space page. */
  intro: z.string().max(600),
  note: z.string().max(400).nullable(),
  cover: mediaSchema,
  layout: spaceLayoutSchema,
  size: spaceSizeSchema,
  featured: z.boolean(),
  order: z.number().int(),
  updatedAt: isoDateSchema,
});
export type Space = z.infer<typeof spaceSchema>;

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export const itemSchema = z.object({
  id: idSchema,
  spaceId: idSchema,
  personId: idSchema,
  slug: slugSchema,
  title: z.string().min(1).max(80),
  brand: z.string().max(60).nullable(),
  image: mediaSchema,
  /** Neutral description of the thing itself. */
  description: z.string().max(400),
  /** The creator's own voice — why it is here. */
  creatorNote: z.string().max(600),

  // Commerce — present, deliberately subordinate.
  price: z.number().nonnegative().nullable(),
  currency: z.enum(['GBP', 'USD', 'EUR']).default('GBP'),
  retailer: z.string().max(60).nullable(),
  productUrl: z.string().url().nullable(),

  // Trust layer.
  disclosure: disclosureKindSchema,
  usedSince: z.string().max(40).nullable(),
  frequency: frequencySchema.nullable(),
  wouldBuyAgain: z.boolean().nullable(),
  likes: z.array(z.string().max(120)).max(6),
  dislikes: z.array(z.string().max(120)).max(6),
  alternatives: z.array(z.string().max(120)).max(4),

  featured: z.boolean(),
  order: z.number().int(),
  updatedAt: isoDateSchema,
});
export type Item = z.infer<typeof itemSchema>;

// ---------------------------------------------------------------------------
// Content — the evidence behind a recommendation.
// ---------------------------------------------------------------------------

export const contentTypeSchema = z.enum([
  'reel',
  'tiktok',
  'youtube',
  'photo',
  'article',
  'project',
]);
export type ContentType = z.infer<typeof contentTypeSchema>;

export const CONTENT_LABEL: Record<ContentType, string> = {
  reel: 'Reel',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  photo: 'Photo',
  article: 'Article',
  project: 'Project',
};

export const contentSchema = z.object({
  id: idSchema,
  personId: idSchema,
  slug: slugSchema,
  type: contentTypeSchema,
  title: z.string().min(1).max(120),
  summary: z.string().max(300),
  thumb: mediaSchema,
  url: z.string().url().nullable(),
  publishedAt: isoDateSchema,
  /** Items appearing in this piece — drives "Everything in this video". */
  itemIds: z.array(idSchema),
  views: z.number().int().nonnegative(),
});
export type Content = z.infer<typeof contentSchema>;

// ---------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------

export const nodeTypeSchema = z.enum(['person', 'space', 'item', 'brand', 'content', 'collection']);
export type NodeType = z.infer<typeof nodeTypeSchema>;

export const relationshipKindSchema = z.enum([
  'owns',
  'contains',
  'made-by',
  'appears-in',
  'recommends',
  'alternative-to',
  'saved-into',
]);

/**
 * A generic typed edge. Everything relational in Zat is expressed here so the
 * graph can grow without reshaping the entities it connects.
 */
export const relationshipSchema = z.object({
  id: idSchema,
  fromType: nodeTypeSchema,
  fromId: idSchema,
  toType: nodeTypeSchema,
  toId: idSchema,
  kind: relationshipKindSchema,
  weight: z.number().min(0).max(1).default(1),
});
export type Relationship = z.infer<typeof relationshipSchema>;

export const brandSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(60),
  slug: slugSchema,
  category: z.string().max(40),
});
export type Brand = z.infer<typeof brandSchema>;

// ---------------------------------------------------------------------------
// Interaction and analytics
// ---------------------------------------------------------------------------

export const interactionTypeSchema = z.enum([
  'view',
  'open',
  'save',
  'share',
  'click',
  'outbound',
]);
export type InteractionType = z.infer<typeof interactionTypeSchema>;

export const interactionSchema = z.object({
  id: idSchema,
  type: interactionTypeSchema,
  targetType: nodeTypeSchema,
  targetId: idSchema,
  /** Epoch milliseconds. */
  ts: z.number().int().nonnegative(),
  source: z.enum(['direct', 'share', 'search', 'profile', 'discover']).default('direct'),
});
export type Interaction = z.infer<typeof interactionSchema>;

export const analyticsPointSchema = z.object({
  date: isoDateSchema,
  views: z.number().int().nonnegative(),
  opens: z.number().int().nonnegative(),
  saves: z.number().int().nonnegative(),
  outbound: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
});
export type AnalyticsPoint = z.infer<typeof analyticsPointSchema>;

export const trafficSourceSchema = z.object({
  source: z.string().max(40),
  visits: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Visitor-side saving
// ---------------------------------------------------------------------------

export const COLLECTION_PRESETS = [
  'Want',
  'Bought',
  'Considering',
  'Gift ideas',
  'Travel',
  'Books',
  'Home',
] as const;

export const collectionSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(40),
  createdAt: z.number().int(),
});
export type Collection = z.infer<typeof collectionSchema>;

export const saveSchema = z.object({
  id: idSchema,
  collectionId: idSchema,
  itemId: idSchema,
  personHandle: handleSchema,
  note: z.string().max(240).nullable(),
  savedAt: z.number().int(),
});
export type Save = z.infer<typeof saveSchema>;

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export const storySubjectSchema = z.enum(['profile', 'space', 'item']);
export type StorySubject = z.infer<typeof storySubjectSchema>;

export const storyTemplateSchema = z.enum(['editorial', 'stack', 'minimal']);
export type StoryTemplate = z.infer<typeof storyTemplateSchema>;

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

export const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'At least 8 characters'),
});

export const signUpSchema = credentialsSchema.extend({
  handle: handleSchema,
  name: z.string().min(1, 'Tell us what to call you').max(60),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Your name helps us reply properly').max(80),
  email: z.string().email('Enter a valid email address'),
  topic: z.enum(['general', 'creator', 'brand', 'press', 'support']),
  message: z.string().min(20, 'A little more detail helps').max(2000),
});

export const claimHandleSchema = z.object({ handle: handleSchema });
