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
    photoUrl: null,
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
    photoUrl: null,
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
    photoUrl: null,
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
  ['i_m_tripod', 's_m_field', 'p_mara', 'wind-stable-tripod', 'Aluminium tripod', 'Manfrotto', 'plinth/field', 'A three-section aluminium tripod with a levelling base.', 'Heavier than the carbon one and that is exactly why I carry it. On an exposed ridge the extra kilo is the difference between a sharp frame and a wasted morning.', 320, 'purchased', 'February 2021', 'weekly', true, ['Stays put in wind that moves a carbon leg', 'Levelling base saves rebuilding the shot'], ['Genuinely heavy after five miles', 'Leg locks ice up below freezing'], ['Carbon, if every walk is under an hour']],
  ['i_m_flask', 's_m_field', 'p_mara', 'vacuum-flask', 'Vacuum flask, one litre', 'Stanley', 'plinth/studio', 'A steel vacuum flask rated for most of a day.', 'Unglamorous and on every list I would write. Still hot at three in the afternoon after a four in the morning start, which is the only specification that matters.', 45, 'purchased', '2019', 'weekly', true, ['Still hot eleven hours later', 'Survived being dropped down a scree slope'], ['The cup never quite dries'], ['Any flask with a proper stopper rather than a pour lid']],

  ['i_m_tank', 's_m_darkroom', 'p_mara', 'developing-tank', 'Developing tank', 'Paterson', 'plinth/optics', 'A light-tight tank with adjustable reels for 35mm and 120 film.', 'The same design for fifty years because it works. The reels are the fiddly part and there is no way round it — you learn them in the dark by feel, over about ten rolls.', 32, 'purchased', '2018', 'monthly', true, ['Handles both formats on one reel', 'Spares cost almost nothing'], ['Loading the reel is genuinely difficult at first'], ['A steel tank, if you already know how to load steel reels']],
  ['i_m_enlarger', 's_m_darkroom', 'p_mara', 'second-hand-enlarger', 'Second-hand enlarger', 'Durst', 'plinth/studio', 'A condenser enlarger for negatives up to 6x6.', 'Eighty pounds from someone clearing a loft, and the single reason I still print. These are being thrown away all over the country. Check the lens and the bellows and ignore the cosmetics.', 80, 'editorial', '2020', 'monthly', true, ['A quarter of the price of new, and better built', 'Alignment has not drifted in six years'], ['Heavy enough to need two people', 'Spare bulbs take hunting'], ['Any Durst or LPL of the same era from a house clearance']],
  ['i_m_timer', 's_m_darkroom', 'p_mara', 'darkroom-timer', 'Enlarger timer', null, 'plinth/optics', 'A mechanical timer that switches the enlarger directly.', 'I tried counting and I tried a phone. Both produce inconsistent prints. A dedicated timer makes a test strip repeatable, which is the whole point of a test strip.', 65, 'purchased', '2020', 'monthly', true, ['Repeatable to the half second', 'No screen light to fog paper'], ['Ticks loudly enough to hear in the next room'], ['A metronome and discipline, if you are more patient than me']],
  ['i_m_trays', 's_m_darkroom', 'p_mara', 'print-trays', 'Print trays, 10x8', null, 'detail/pad', 'Three ribbed developing trays with pour spouts.', 'Buy four, not three. The fourth is for water and you will want it within one session. Mine live under the bath, which tells you how much space a darkroom actually needs.', 28, 'purchased', '2019', 'monthly', true, ['Ribbed base makes lifting a print easy', 'Stack flat when stored'], ['Stain permanently within a year'], ['Any food-safe tray of the right size']],
  ['i_m_safelight', 's_m_darkroom', 'p_mara', 'led-safelight', 'LED safelight', null, 'aura/ember', 'A dimmable amber LED safelight for black-and-white paper.', 'The old filtered bulbs run hot and fog paper as they age. This does not, and it dims, which matters more than it sounds when you are trying to judge a print wet.', 55, 'affiliate', '2022', 'monthly', true, ['Runs cold', 'Dimmable, so you can judge a wet print'], ['No use at all for colour work'], ['A red bicycle light, for the first few months']],

  ['i_m_dartmoor', 's_m_places', 'p_mara', 'dartmoor-north', 'North Dartmoor', null, 'scenes/fog-ridge', 'High moorland with military access restrictions on some days.', 'Check the firing timetable before you go; I have driven ninety minutes to a red flag twice. Park at Meldon and walk in. The fog is the subject, not the obstacle.', null, 'editorial', '2019', 'monthly', true, ['Fog most mornings between October and March', 'Free parking at the reservoir'], ['Live firing closes large areas without much notice'], []],
  ['i_m_quantocks', 's_m_places', 'p_mara', 'quantock-hills', 'The Quantocks', null, 'scenes/forest', 'Low wooded hills with a short walk to open ground.', 'The one I recommend to people who say they have no time. Twenty minutes from the car park to the ridge, and beech woodland the whole way up. Best in the last fortnight of October.', null, 'editorial', '2020', 'monthly', true, ['Twenty minutes from car to ridge', 'Works in flat light, which most places do not'], ['The main car park fills by eight on a weekend'], []],
  ['i_m_severn', 's_m_places', 'p_mara', 'severn-estuary', 'Severn Estuary', null, 'scenes/ocean', 'Tidal mudflats with the second largest tidal range in the world.', 'Read the tide table as carefully as you would read a weather forecast. The water comes in faster than you can walk. It is the most interesting light I have anywhere within an hour of home.', null, 'editorial', '2018', 'monthly', true, ['Enormous tidal range changes the frame hourly', 'Almost nobody else there'], ['The tide is genuinely dangerous if you are careless'], []],
  ['i_m_exmoor', 's_m_places', 'p_mara', 'exmoor-dark-sky', 'Exmoor, after dark', null, 'scenes/night-glass', 'An International Dark Sky Reserve with roadside access.', 'You can photograph the Milky Way about forty metres from a parked car, which removes every excuse. Take more layers than you think and something hot. Nothing else here needs saying.', null, 'editorial', '2021', 'seasonally', true, ['Genuinely dark within metres of the road', 'No permit or booking required'], ['Cold in a way that ends the night early'], []],
  ['i_m_coast', 's_m_places', 'p_mara', 'north-cornwall-coast', 'North Cornwall coast path', null, 'scenes/cold-summit', 'Exposed clifftop path with long stretches between access points.', 'Beautiful and unforgiving. The wind is the reason I carry the heavy tripod. Plan around the access points rather than the distance — there are stretches with no way down for six miles.', null, 'editorial', '2019', 'seasonally', true, ['Weather changes fast enough to give you three shoots in one'], ['Few escape routes once you are committed to a section'], []],

  ['i_m_ways', 's_m_reading', 'p_mara', 'ways-of-seeing', 'Ways of Seeing', 'John Berger', 'aura/slate', 'Four essays on how images are made and read.', 'Fifty years old and it still catches me out. Short enough to reread in an evening, which I do most winters.', 9.99, 'editorial', '2019', 'occasionally', true, ['Short, and every page earns its place'], ['The reproductions are poor in most editions'], []],
  ['i_m_landmarks', 's_m_reading', 'p_mara', 'landmarks', 'Landmarks', 'Robert Macfarlane', 'aura/moss', 'A book collecting the vanishing vocabulary of British landscape.', 'It gave me words for weather I had been photographing for years without being able to name. Naming a thing changes how carefully you look at it.', 10.99, 'editorial', '2021', 'occasionally', true, ['The glossaries alone are worth it'], ['The prose is rich enough to need rationing'], []],
  ['i_m_camera', 's_m_reading', 'p_mara', 'camera-lucida', 'Camera Lucida', 'Roland Barthes', 'aura/ink', 'A short book on photography written after the death of the author’s mother.', 'Difficult, and I have never got through it without stopping. It is also the only thing I have read that describes why one photograph out of a thousand does something to you.', 12.99, 'editorial', '2022', 'occasionally', true, ['Says the thing nothing else says'], ['Deliberately hard going in the middle third'], ['On Photography by Susan Sontag, for the argument from the other side']]
,
  ['i_m_englishjourney', 's_m_reading', 'p_mara', 'the-old-ways', 'The Old Ways', 'Robert Macfarlane', 'aura/dune', 'A walking book following ancient paths across Britain and beyond.', 'I read a chapter before most trips. It is the closest thing I have to a working method: go slowly, on foot, and keep going after it stops being pleasant.', 10.99, 'purchased', '2020', 'occasionally', true, ['Reads like planning a route'], ['Loses its shape in the overseas chapters'], []],

  ['i_j_monitorarm', 's_j_desk', 'p_jonas', 'monitor-arm', 'Clamp monitor arm', 'Ergotron', 'plinth/studio', 'A gas-spring monitor arm with a desk clamp.', 'Twelve years old, bought used, and it still holds position. Gave me back the whole footprint of a monitor stand, which on a small desk is most of the usable surface.', 160, 'purchased', '2014', 'daily', true, ['Holds position indefinitely', 'Returns the desk surface under the screen'], ['Needs a desk edge it can actually clamp to'], ['The unbranded copies are fine for a light screen']],
  ['i_j_pencil', 's_j_desk', 'p_jonas', 'clutch-pencil', 'Clutch pencil, 2mm', 'Staedtler', 'plinth/optics', 'A 2mm lead holder with a rotary sharpener in the cap.', 'Four pounds. I have used the same one since university and replaced nothing but lead. It draws a line you can vary by rolling it, which no mechanical pencil does.', 4, 'purchased', '2011', 'daily', true, ['Line weight varies with how you hold it', 'Nothing on it can break'], ['Needs sharpening, which some people will not tolerate'], ['Any 2mm lead holder — they are all much the same']],
  ['i_j_tape', 's_j_desk', 'p_jonas', 'steel-rule', 'Steel rule, 300mm', null, 'detail/ridge', 'A stainless rule with etched rather than printed graduations.', 'Etched markings do not wear off. I have thrown away three printed rules that became guesswork after a year. This one is from 2016 and reads the same as it did new.', 12, 'purchased', '2016', 'daily', true, ['Etched graduations outlast printed ones', 'Doubles as a cutting edge'], ['Cold to hold in an unheated workshop'], []],
  ['i_j_lightmeter', 's_j_desk', 'p_jonas', 'desk-light-meter', 'Pocket light meter', null, 'plinth/optics', 'A handheld lux meter for checking working light levels.', 'I bought it to settle an argument about whether the studio was dark, and it settled it. Now I check any room I am going to work in for a full day. Most offices are worse than people think.', 35, 'purchased', '2022', 'occasionally', true, ['Turns a vague complaint into a number'], ['You will start measuring rooms you cannot change'], ['Most phone apps get within twenty percent']],

  ['i_j_plane', 's_j_tools', 'p_jonas', 'block-plane', 'Low-angle block plane', 'Lie-Nielsen', 'plinth/studio', 'A bronze low-angle block plane with a replaceable blade.', 'Expensive and the last one I will buy. Every part is available as a spare, which is the criterion this whole Space is built on. Sharp out of the box, which almost nothing is.', 195, 'purchased', '2019', 'weekly', true, ['Every component available as a spare', 'Usable straight from the box'], ['Three times the price of a serviceable alternative'], ['A restored Stanley 60 1/2 for a fifth of the cost']],
  ['i_j_chisels', 's_j_tools', 'p_jonas', 'bevel-edge-chisels', 'Bevel-edge chisels, set of four', 'Narex', 'detail/weight-end', 'Four Czech-made bevel-edge chisels in common sizes.', 'A quarter of the price of the premium sets and they hold an edge nearly as long. Spend the difference on a decent sharpening setup, which matters more than the steel does.', 68, 'affiliate', '2018', 'weekly', true, ['Excellent value for the steel', 'Handles take a knock without splitting'], ['Need flattening on the back before first use'], ['Any set, plus the sharpening kit you were going to skip']],
  ['i_j_stones', 's_j_tools', 'p_jonas', 'diamond-stones', 'Diamond sharpening plates', 'DMT', 'detail/ridge', 'Two double-sided diamond plates covering four grits.', 'They stay flat, which water stones do not. Flatness is the whole job. Eight years of daily use and the coarse side has barely changed.', 145, 'purchased', '2018', 'weekly', true, ['Stay flat indefinitely', 'No soaking or flattening ritual'], ['The coarse plate feels harsh for a few months'], ['Water stones, if you enjoy the maintenance']],
  ['i_j_mallet', 's_j_tools', 'p_jonas', 'joiners-mallet', 'Joiner’s mallet', null, 'plinth/field', 'A traditional beech mallet with a tapered head.', 'I made this one in a week in 2017 and it is the tool I would replace first. Making it teaches the joint it is made from, which is the point of the exercise.', 0, 'editorial', '2017', 'weekly', true, ['Making one teaches the joint'], ['A bought one is honestly fine'], ['Any beech mallet for about twenty pounds']],

  ['i_j_eames', 's_j_chairs', 'p_jonas', 'moulded-plywood-chair', 'Moulded plywood side chair', null, 'aura/dune', 'A bent plywood chair on steel legs, 1946 design.', 'The one that made me care about chairs. Mine is a licensed second-hand example with a repaired shock mount, which is the failure point on every one of these. Ask about the mounts before you buy.', 430, 'purchased', '2018', 'daily', true, ['Comfortable without any padding at all', 'Shock mounts are a known, fixable failure'], ['Original mounts perish after about thirty years'], ['A well-made licensed reissue, rather than an unlicensed copy']],
  ['i_j_windsor', 's_j_chairs', 'p_jonas', 'windsor-chair', 'Stick-back Windsor chair', null, 'plinth/field', 'A green-wood Windsor chair with an elm seat.', 'Three hundred years of iteration and nothing has improved on it for sitting upright at a table. Mine came from a junk shop with a loose leg, which took an evening and some hide glue.', 120, 'purchased', '2019', 'daily', true, ['Repairable with glue and patience', 'Holds you upright without trying'], ['Hard on the body for a long dinner'], ['Any honest country chair with a solid seat']],
  ['i_j_stool', 's_j_chairs', 'p_jonas', 'three-legged-stool', 'Three-legged workshop stool', null, 'detail/deck', 'A shop-made stool on three splayed legs.', 'Three legs never rock, on any floor. That is the entire argument, and it is the reason every workshop stool made before about 1950 has three of them.', 0, 'editorial', '2020', 'daily', true, ['Cannot rock on an uneven floor'], ['Tips sideways if you lean too far'], ['Any three-legged stool; the number is the feature']],
  ['i_j_office', 's_j_chairs', 'p_jonas', 'refurbished-task-chair', 'Refurbished task chair', null, 'plinth/studio', 'A mesh task chair bought through a refurbisher.', 'I have strong opinions about wooden chairs and I still do not design on one. Eight hours needs adjustment, and adjustment is the one thing a beautiful chair cannot give you.', 380, 'purchased', '2021', 'daily', true, ['Adjustment is what eight hours needs', 'Refurbished costs half and works the same'], ['None of them are nice to look at'], ['Any refurbished chair from a reputable seller']],

  ['i_j_shellac', 's_j_materials', 'p_jonas', 'shellac-flakes', 'Shellac flakes', null, 'aura/ember', 'Dewaxed shellac flakes dissolved in alcohol as needed.', 'Mixed fresh, it does things no modern finish does, and it is reversible. Everything in this Space is chosen for whether it can be undone, and shellac is the clearest example.', 24, 'purchased', '2019', 'seasonally', true, ['Completely reversible with alcohol', 'Mixes to whatever strength the job needs'], ['Short shelf life once mixed', 'Water marks easily'], ['A wiping varnish, if the surface will get wet']],
  ['i_j_hideglue', 's_j_materials', 'p_jonas', 'hide-glue', 'Hot hide glue', null, 'aura/dune', 'Granular animal glue, heated in a water bath.', 'It fails before the wood does, which sounds like a fault and is the point. A hide-glued joint can be taken apart in a century and remade. A PVA one cannot.', 18, 'purchased', '2019', 'seasonally', true, ['Reversible with heat and water', 'Repairable over itself without stripping'], ['Needs a glue pot and a warm room', 'Short open time'], ['Liquid hide glue in a bottle, for a longer working time']],
  ['i_j_linseed', 's_j_materials', 'p_jonas', 'boiled-linseed-oil', 'Boiled linseed oil', null, 'detail/knit-weave', 'A traditional drying oil for tool handles and rough timber.', 'Five pounds a tin and it is on every handle in the workshop. Slow to cure and the rags will genuinely catch fire on their own, which is not a figure of speech. Spread them flat outside.', 6, 'purchased', '2018', 'seasonally', true, ['Cheap and endlessly reapplicable'], ['Cures slowly', 'Rags self-ignite — this is a real fire risk'], ['Tung oil, for a harder final surface']],
  ['i_j_wax', 's_j_materials', 'p_jonas', 'beeswax-paste', 'Beeswax and turpentine paste', null, 'aura/moss', 'A soft paste wax made from beeswax cut with turpentine.', 'I make it in a jar in about ten minutes. It is the last step on nearly everything and the only finish my hands can tell apart with their eyes shut.', 0, 'editorial', '2018', 'seasonally', true, ['Made at home for almost nothing', 'Feels better than anything commercial'], ['Offers no real protection on its own'], ['Any commercial paste wax, which is much the same thing']],

  ['i_p_foamroller', 's_p_running', 'p_priya', 'foam-roller', 'Foam roller', null, 'detail/pad', 'A dense closed-cell foam roller.', 'Fifteen pounds and it is the only reason the second year of running happened. Ten minutes after a long run, every time. The evidence for why it works is thin and it still works for me.', 15, 'purchased', 'March 2023', 'weekly', true, ['Cheap enough that there is no excuse'], ['Unpleasant for the first fortnight'], ['A tennis ball, for most of the same effect']],
  ['i_p_belt', 's_p_running', 'p_priya', 'running-belt', 'Running waist belt', null, 'plinth/field', 'A stretch waist belt that holds a phone and a key without bouncing.', 'I tried an armband and a pocket first. Both bounce. This does not, and that is the whole specification. Eighteen pounds, two years, no complaints.', 18, 'affiliate', 'June 2023', 'weekly', true, ['Does not bounce, which nothing else managed'], ['The zip is the part that will fail'], ['A pair of shorts with a proper zip pocket']],
  ['i_p_socks', 's_p_running', 'p_priya', 'merino-running-socks', 'Merino running socks', null, 'detail/knit-weave', 'Thin merino-blend socks with a reinforced heel.', 'Twelve pounds a pair, which felt absurd until I did a half marathon with no blisters for the first time. I own five pairs and wash them constantly.', 12, 'purchased', 'August 2023', 'weekly', true, ['No blisters, including in the rain', 'Do not smell after a long run'], ['Wear through at the heel within a year'], ['Any thin merino sock; the fibre is doing the work']],

  ['i_p_ruin', 's_p_reading', 'p_priya', 'the-mom-test', 'The Mom Test', 'Rob Fitzpatrick', 'aura/slate', 'A short book on how to ask customers questions that produce real answers.', 'A hundred pages and it saved us a year of building the wrong thing. We still use its questions verbatim in customer calls.', 8.99, 'purchased', '2022', 'occasionally', true, ['Short, practical, immediately usable'], ['Reads as repetitive by the end'], []],
  ['i_p_thinking', 's_p_reading', 'p_priya', 'the-art-of-gathering', 'The Art of Gathering', 'Priya Parker', 'aura/ember', 'A book about why most meetings and events fail on purpose.', 'It changed how we run every internal meeting, which for a four-person company is a measurable amount of everybody’s week. Not a business book in the usual sense.', 10.99, 'purchased', '2023', 'occasionally', true, ['Applies to anything with more than two people in a room'], ['The event-planning examples need translating'], []],
  ['i_p_shape', 's_p_reading', 'p_priya', 'the-design-of-everyday-things', 'The Design of Everyday Things', 'Don Norman', 'aura/moss', 'The standard text on affordances and why doors confuse people.', 'I give a copy to every person who joins. It is the shared vocabulary that lets a four-person team argue about an interface without arguing about taste.', 12.99, 'affiliate', '2021', 'occasionally', true, ['Gives a team shared language'], ['The examples are showing their age'], []],
  ['i_p_hard', 's_p_reading', 'p_priya', 'working-in-public', 'Working in Public', 'Nadia Eghbal', 'aura/ink', 'A study of how open source maintenance actually works.', 'The clearest thing I have read on the cost of being available to everyone. We changed our support policy the week I finished it.', 14.99, 'purchased', '2022', 'occasionally', true, ['Honest about maintainer burnout'], ['Narrow if you are not near open source'], []],

  ['i_p_ci', 's_p_building', 'p_priya', 'boring-ci', 'The CI we already had', null, 'aura/slate', 'The build service bundled with our code host.', 'We evaluated three dedicated CI products and kept the one that came free with the repository. It is slower. Nobody has ever been blocked by the difference, and it is one fewer account to lose.', 0, 'editorial', '2023', 'daily', true, ['One fewer service to administer', 'No additional access to audit'], ['Genuinely slower on a big test suite'], []],
  ['i_p_uptime', 's_p_building', 'p_priya', 'external-uptime-check', 'External uptime check', null, 'aura/ember', 'A third-party service that pings the product from outside our infrastructure.', 'Nine pounds a month. Monitoring that runs inside your own infrastructure cannot tell you when your infrastructure is gone. That lesson cost us four hours on a Sunday.', 9, 'purchased', '2023', 'daily', true, ['Catches the failure your own monitoring cannot'], ['Alerts on your own network blips too'], []],
  ['i_p_docs', 's_p_building', 'p_priya', 'markdown-in-the-repo', 'Documentation in the repository', null, 'aura/dune', 'Plain markdown files versioned with the code.', 'We paid for a wiki for a year and nobody opened it. Documentation that sits beside the code gets updated in the same pull request, because not updating it is visible in review.', 0, 'editorial', '2024', 'daily', true, ['Updated in the same review as the code', 'Searchable with the tools we already use'], ['Poor for anything non-technical people need'], []],
  ['i_p_oncall', 's_p_building', 'p_priya', 'a-shared-phone-number', 'One shared support number', null, 'aura/plum', 'A single rotating on-call phone shared by four people.', 'No paging product, no escalation policy, no tiers. A phone that moves between four people on a rota. At our size, every layer we added made it slower to reach a person who could actually fix it.', 0, 'editorial', '2023', 'daily', true, ['Reaches someone who can fix it, first time'], ['Does not survive the company growing'], []],

  ['i_p_rack', 's_p_home', 'p_priya', 'wall-drying-rack', 'Wall-mounted drying rack', null, 'detail/deck', 'A folding timber rack that sits flat against the wall.', 'A flat is small mostly in the places you do not think about. This one gave back the corner that a freestanding airer had occupied for three years.', 45, 'purchased', '2022', 'weekly', true, ['Folds to four centimetres', 'Holds a full load without sagging'], ['Needs a wall you can drill into'], []],
  ['i_p_stackchairs', 's_p_home', 'p_priya', 'stacking-chairs', 'Stacking chairs, set of four', null, 'plinth/field', 'Four light stacking chairs that store as one footprint.', 'We have people over about twice a month and four chairs out permanently for that is a bad trade. These live stacked behind a door and come out in ten seconds.', 160, 'purchased', '2021', 'monthly', true, ['Four chairs in one chair of floor space'], ['Not comfortable enough for a long dinner'], []],
  ['i_p_lamps', 's_p_home', 'p_priya', 'three-small-lamps', 'Three small lamps', null, 'aura/ember', 'Three low-wattage lamps replacing one ceiling light.', 'The single cheapest change we made. One overhead light makes a small room feel like a corridor. Three low lamps at different heights make the same room feel like somewhere you would sit.', 90, 'editorial', '2021', 'daily', true, ['Changes how large a room feels, for very little'], ['Three plugs and three switches'], []],
  ['i_p_doorhooks', 's_p_home', 'p_priya', 'over-door-hooks', 'Over-door hooks', null, 'detail/ridge', 'Steel hooks that hang over a standard interior door.', 'Four pounds. The back of every door in a small flat is storage you are not using, and there is nothing to install or undo when you move.', 4, 'purchased', '2020', 'daily', true, ['Nothing to install, nothing to make good'], ['Stops some doors closing flush'], []],
  ['i_p_mirror', 's_p_home', 'p_priya', 'large-leaning-mirror', 'Large leaning mirror', null, 'aura/slate', 'A full-height mirror that leans rather than hangs.', 'Opposite the window, not next to it. That detail is the whole trick and it took me two flats to work out. It roughly doubles the light in the room it is in.', 130, 'purchased', '2022', 'daily', true, ['Doubles the apparent light when placed opposite a window'], ['Must be secured to a wall if a child lives there'], []],
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
