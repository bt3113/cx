/**
 * Three further creators, so discovery, examples and the Taste Graph have real
 * shape rather than a single populated profile. Their imagery is generated
 * rather than extracted — the reference compositions only cover Alex.
 */
import type { Content, Item, Person, Space } from '@/lib/schema';

const theme = (accent: 'ash' | 'sage' | 'rose') =>
  ({
    accent,
    background: 'void',
    typeset: 'editorial',
    motion: 'subtle',
    cardScale: 'balanced',
  }) as const;

export const otherPeople: Person[] = [
  {
    id: 'p_mara',
    handle: 'mara',
    name: 'Mara Ellison',
    roles: ['Photographer', 'Writer'],
    statement:
      'Landscape and reportage work, mostly in bad weather. I keep a public record of what survives the field so nobody else wastes the money I did.',
    location: 'Bristol, UK',
    timezone: 'Europe/London',
    avatar: { key: 'avatars/mara-ellison', alt: 'Mara Ellison', retina: false },
    portrait: null,
    character: null,
    socials: [
      { network: 'instagram', handle: '@mara.ellison', url: 'https://example.com/social/mara' },
      { network: 'website', handle: 'maraellison.co', url: 'https://example.com/mara' },
    ],
    theme: theme('ash'),
    plan: 'creator',
    published: true,
    joinedAt: '2025-01-22',
    updatedAt: '2026-09-10',
  },
  {
    id: 'p_jonas',
    handle: 'jonas',
    name: 'Jonas Reeve',
    roles: ['Industrial designer'],
    statement:
      'I design objects for a living, so I am unbearable about the ones I own. Everything here has been taken apart at least once.',
    location: 'Copenhagen, DK',
    timezone: 'Europe/Copenhagen',
    avatar: { key: 'avatars/jonas-reeve', alt: 'Jonas Reeve', retina: false },
    portrait: null,
    character: null,
    socials: [
      { network: 'dribbble', handle: 'jonasreeve', url: 'https://example.com/social/jonas' },
      { network: 'linkedin', handle: 'jonasreeve', url: 'https://example.com/social/in-jonas' },
    ],
    theme: theme('sage'),
    plan: 'creator',
    published: true,
    joinedAt: '2025-06-04',
    updatedAt: '2026-09-07',
  },
  {
    id: 'p_priya',
    handle: 'priya',
    name: 'Priya Raman',
    roles: ['Founder', 'Runner'],
    statement:
      'Building a small software company, running slowly, reading constantly. This is the shortlist of things that survived a very busy few years.',
    location: 'Bengaluru, IN',
    timezone: 'Asia/Kolkata',
    avatar: { key: 'avatars/priya-raman', alt: 'Priya Raman', retina: false },
    portrait: null,
    character: null,
    socials: [
      { network: 'x', handle: '@priyabuilds', url: 'https://example.com/social/priya' },
      { network: 'website', handle: 'priyaraman.dev', url: 'https://example.com/priya' },
    ],
    theme: theme('rose'),
    plan: 'free',
    published: true,
    joinedAt: '2026-02-16',
    updatedAt: '2026-09-15',
  },
];

type SpaceSeed = [
  id: string,
  personId: string,
  slug: string,
  index: number,
  title: string,
  descriptor: string,
  caption: string,
  intro: string,
  coverKey: string,
  layout: Space['layout'],
  size: Space['size'],
];

const spaceSeeds: SpaceSeed[] = [
  ['s_m_field', 'p_mara', 'field-kit', 1, 'Field Kit', 'What survives\nthe weather.', 'Rain\nWind\nRepeat.', 'Six years of shooting outdoors in the west of England. Everything here has been rained on repeatedly and still works.', 'scenes/fog-ridge', 'text-left', 'lg'],
  ['s_m_darkroom', 'p_mara', 'darkroom', 2, 'Darkroom', 'Slow work,\nby hand.', 'Develop\nWait\nSee.', 'I still print by hand once a month. It is inefficient and it makes me a better photographer.', 'scenes/night-glass', 'image-only', 'md'],
  ['s_m_places', 'p_mara', 'places', 3, 'Places', 'Worth the\nearly start.', 'Go\nEarly.', 'Locations I would return to, with honest notes on access, parking and whether the walk is worth it in the dark.', 'scenes/cold-summit', 'image-only', 'md'],
  ['s_m_reading', 'p_mara', 'reading', 4, 'Reading', 'Words about\nlooking.', 'Read\nSlowly.', 'Books on photography that are not really about photography.', 'aura/slate', 'tile', 'sm'],

  ['s_j_desk', 'p_jonas', 'desk', 1, 'Desk', 'Fewer things,\nbetter made.', 'Use\nDaily.', 'Nine objects on a desk I have not changed in two years. Each one has been opened up and looked at.', 'scenes/forest', 'text-left', 'lg'],
  ['s_j_tools', 'p_jonas', 'tools', 2, 'Tools', 'Made to be\nrepaired.', 'Fix\nKeep.', 'Hand tools chosen on one criterion: can I get spare parts in ten years.', 'plinth/studio', 'text-left', 'md'],
  ['s_j_chairs', 'p_jonas', 'chairs', 3, 'Chairs', 'A professional\nobsession.', 'Sit\nProperly.', 'I have opinions about seating that nobody asked for. Here they are anyway.', 'aura/moss', 'image-only', 'md'],
  ['s_j_materials', 'p_jonas', 'materials', 4, 'Materials', 'How things\nage.', 'Patina\nOver Polish.', 'Samples I keep on the shelf to remind me what five years does to a finish.', 'aura/dune', 'tile', 'sm'],

  ['s_p_running', 'p_priya', 'running', 1, 'Running', 'Slow miles,\nlong years.', 'Start\nAgain.', 'Four years from nothing to a half marathon, at a pace that keeps being sustainable.', 'scenes/desert-dusk', 'text-left', 'lg'],
  ['s_p_reading', 'p_priya', 'reading', 2, 'Reading', 'Sixty books,\nfive kept.', 'Read\nDiscard.', 'I read a lot and keep very little. These are the ones that survived the cull.', 'aura/plum', 'tile', 'md'],
  ['s_p_building', 'p_priya', 'building', 3, 'Building', 'Small company,\nfew tools.', 'Ship\nSmall.', 'The stack behind a four-person software company, and what we stopped paying for.', 'aura/ink', 'text-left', 'md'],
  ['s_p_home', 'p_priya', 'home', 4, 'Home', 'A flat that\nworks hard.', 'Live\nWell.', 'Things that make a small flat feel bigger, chosen over three moves.', 'scenes/dawn-peaks', 'image-only', 'md'],
];

export const otherSpaces: Space[] = spaceSeeds.map(
  ([id, personId, slug, index, title, descriptor, caption, intro, coverKey, layout, size]) => ({
    id,
    personId,
    slug,
    index,
    title,
    descriptor,
    caption,
    intro,
    note: null,
    cover: { key: coverKey, alt: `${title} cover artwork`, retina: coverKey.startsWith('scenes/') },
    layout,
    size,
    featured: index <= 2,
    order: index,
    updatedAt: '2026-09-10',
  }),
);

type ItemSeed = [
  id: string,
  spaceId: string,
  personId: string,
  slug: string,
  title: string,
  brand: string | null,
  imageKey: string,
  description: string,
  note: string,
  price: number | null,
  disclosure: Item['disclosure'],
  usedSince: string | null,
  frequency: Item['frequency'],
  again: boolean | null,
  likes: string[],
  dislikes: string[],
  alts: string[],
];

const itemSeeds: ItemSeed[] = [
  ['i_m_body', 's_m_field', 'p_mara', 'weather-sealed-body', 'Weather-sealed camera body', 'Olympus', 'plinth/optics', 'A weather-sealed micro four-thirds body.', 'Photographed in horizontal rain on Dartmoor for three hours and it did not blink. The sensor is smaller than I would like and I have stopped caring.', 1299, 'purchased', 'November 2021', 'weekly', true, ['Genuinely sealed, not just marketed as sealed', 'Light enough to carry all day'], ['Low light is the obvious compromise'], ['Any full-frame body if you never shoot in rain']],
  ['i_m_boots', 's_m_field', 'p_mara', 'walking-boots', 'Leather walking boots', 'Meindl', 'plinth/field', 'Full-grain leather boots, resoleable.', 'On their second sole and fourth year. Resoling costs a fifth of replacing them, which is the entire argument.', 240, 'purchased', 'March 2022', 'weekly', true, ['Resoleable, so effectively permanent', 'Waterproof after four years'], ['Three weeks of blisters to break in'], ['Hanwag Tatra if your foot is narrower']],
  ['i_m_filter', 's_m_field', 'p_mara', 'nd-filter-set', 'ND filter set', 'NiSi', 'plinth/optics', 'A set of neutral density filters with a magnetic holder.', 'The magnetic holder is the part worth paying for. I lost twenty minutes per shot to threaded filters before this.', 310, 'affiliate', 'June 2023', 'monthly', true, ['Magnetic mount saves real time'], ['Expensive for what is essentially dark glass'], ['Single variable ND if you shoot one focal length']],
  ['i_m_onlooking', 's_m_reading', 'p_mara', 'on-looking', 'On Looking', 'Alexandra Horowitz', 'aura/slate', 'Eleven walks around one city block with eleven different experts.', 'Changed what I notice more than any photography book has. Not a photography book.', 10.99, 'editorial', '2023', 'occasionally', true, ['Teaches attention rather than technique'], [], []],

  ['i_j_lamp', 's_j_desk', 'p_jonas', 'task-lamp', 'Articulated task lamp', 'Anglepoise', 'plinth/studio', 'A counterbalanced articulated desk lamp.', 'Designed in 1935 and still correct. Mine is second-hand and older than I am. Every part is replaceable.', 195, 'purchased', '2019', 'daily', true, ['Every component is still available', 'Counterbalance holds position indefinitely'], ['Shade gets hot with the wrong bulb'], ['Jieldé Loft if you want something heavier']],
  ['i_j_scale', 's_j_tools', 'p_jonas', 'digital-calipers', 'Digital calipers', 'Mitutoyo', 'plinth/optics', 'Precision digital calipers, 150mm.', 'The cheap ones drift. These have not moved in six years. If you measure anything for a living, this is where to spend.', 140, 'purchased', '2020', 'daily', true, ['Repeatable to the hundredth', 'Battery lasts over a year'], ['Four times the price of a usable alternative'], ['Any hardened stainless caliper for occasional use']],
  ['i_j_chair', 's_j_chairs', 'p_jonas', 'wooden-chair', 'Bentwood side chair', 'Thonet', 'aura/moss', 'A steam-bent beech side chair.', 'A hundred and fifty year old design that still outperforms most of what gets shown at furniture fairs. Mine were forty euros each at a market.', 40, 'purchased', '2021', 'daily', true, ['Light enough to move with one hand', 'Repairable with hide glue'], ['Uncomfortable past about an hour'], ['Any honest copy — the patent expired long ago']],
  ['i_j_oil', 's_j_materials', 'p_jonas', 'hardwax-oil', 'Hardwax oil', 'Osmo', 'aura/dune', 'A penetrating oil-wax finish for timber.', 'Repairable in place, which polyurethane is not. I refinish one surface a year rather than everything at once.', 38, 'purchased', '2020', 'seasonally', true, ['Spot-repairable without stripping'], ['Long cure time', 'Rags are a genuine fire risk'], []],

  ['i_p_shoes', 's_p_running', 'p_priya', 'first-running-shoes', 'Neutral daily trainers', 'New Balance', 'plinth/field', 'A cushioned neutral trainer for easy mileage.', 'I bought expensive carbon-plated shoes first and they made running harder, not easier. These are the ones that got me to a half marathon.', 120, 'purchased', 'January 2023', 'weekly', true, ['Forgiving on the days you feel slow'], ['Not fast, and not trying to be'], ['Get fitted in person; this is very foot-dependent']],
  ['i_p_watch', 's_p_running', 'p_priya', 'gps-watch', 'GPS running watch', 'Garmin', 'plinth/optics', 'A mid-range GPS watch with a multi-week battery.', 'I turned off every notification and it became useful. Tracking the run is all I need it to do.', 249, 'affiliate', 'May 2023', 'daily', true, ['Battery measured in weeks, not hours', 'Accurate under tree cover'], ['The companion app pushes engagement I did not ask for'], ['Coros Pace for a cheaper equivalent']],
  ['i_p_4000', 's_p_reading', 'p_priya', 'four-thousand-weeks', 'Four Thousand Weeks', 'Oliver Burkeman', 'aura/plum', 'A book about accepting finitude rather than optimising it.', 'The only productivity book I have recommended more than once, largely because it argues against productivity books.', 10.99, 'purchased', '2024', 'occasionally', true, ['Honest about what cannot be fixed'], ['Will frustrate anyone wanting a system'], ['Deep Work, if you want the opposite argument']],
  ['i_p_stack', 's_p_building', 'p_priya', 'plain-postgres', 'Plain Postgres', null, 'aura/ink', 'A single managed Postgres instance.', 'We replaced four specialised data services with one Postgres and cut the bill by eighty percent. It does queues and search well enough at our size.', 0, 'editorial', '2024', 'daily', true, ['One thing to operate instead of four', 'Nobody needs to learn a new query language'], ['There is a scale at which this stops being true'], []],
];

export const otherItems: Item[] = itemSeeds.map(
  (
    [id, spaceId, personId, slug, title, brand, imageKey, description, note, price, disclosure, usedSince, frequency, again, likes, dislikes, alts],
    i,
  ) => ({
    id,
    spaceId,
    personId,
    slug,
    title,
    brand,
    image: { key: imageKey, alt: title, retina: false },
    description,
    creatorNote: note,
    price,
    currency: 'GBP' as const,
    retailer: price ? 'Independent retailer' : null,
    productUrl: price ? `https://example.com/shop/${slug}` : null,
    disclosure,
    usedSince,
    frequency,
    wouldBuyAgain: again,
    likes,
    dislikes,
    alternatives: alts,
    featured: i % 4 === 0,
    order: i + 1,
    updatedAt: '2026-09-10',
  }),
);

export const otherContent: Content[] = [
  {
    id: 'c_m_rain',
    personId: 'p_mara',
    slug: 'shooting-in-bad-weather',
    type: 'article',
    title: 'Shooting in genuinely bad weather',
    summary: 'What actually fails when it rains for six hours, and what does not.',
    thumb: { key: 'scenes/fog-ridge', alt: 'Fog over a ridgeline', retina: true },
    url: 'https://example.com/read/bad-weather',
    publishedAt: '2026-03-18',
    itemIds: ['i_m_body', 'i_m_boots', 'i_m_filter'],
    views: 41_200,
  },
  {
    id: 'c_j_desk',
    personId: 'p_jonas',
    slug: 'nine-objects',
    type: 'project',
    title: 'Nine objects, two years unchanged',
    summary: 'A designer takes apart his own desk and justifies each item.',
    thumb: { key: 'scenes/forest', alt: 'Dark green abstract field', retina: true },
    url: 'https://example.com/read/nine-objects',
    publishedAt: '2026-05-02',
    itemIds: ['i_j_lamp', 'i_j_scale', 'i_j_chair'],
    views: 27_800,
  },
  {
    id: 'c_p_half',
    personId: 'p_priya',
    slug: 'four-years-to-a-half',
    type: 'article',
    title: 'Four years to a half marathon',
    summary: 'Starting slowly, staying injured-free, and the gear that did not help.',
    thumb: { key: 'scenes/desert-dusk', alt: 'Warm dusk landscape', retina: true },
    url: 'https://example.com/read/four-years',
    publishedAt: '2026-06-25',
    itemIds: ['i_p_shoes', 'i_p_watch'],
    views: 63_500,
  },
];
