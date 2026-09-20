/**
 * Post-build: per-route HTML, OG images, sitemap and icons.
 *
 * GitHub Pages has no rewrite rules, so each route needs a real file on disk
 * for its deep link to resolve without bouncing through 404.html. This writes
 * one `index.html` per route, each carrying its own title, description,
 * canonical URL, Open Graph tags and JSON-LD.
 *
 * The body is not server-rendered. Doing that would mean a second SSR build of
 * a heavily interactive app for little gain: crawlers execute JavaScript, and
 * social scrapers read only the head — which is fully populated here. The
 * trade-off is deliberate and recorded rather than hidden.
 */
import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { people, spaces, items, contentPieces } from '../src/content/index.ts';
import { STATIC_ROUTES } from '../src/app/static-routes.ts';

const ROOT = resolve(import.meta.dirname, '../..');
const APP = resolve(import.meta.dirname, '..');
const ORIGIN = 'https://bt3113.github.io';
const BASE = '/cx/';

type RouteMeta = {
  path: string;
  title: string;
  description: string;
  ogImage: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
  /** Text rendered into the generated OG card. */
  og?: { kicker: string; heading: string; sub?: string; art?: string };
};

const abs = (p: string) => `${ORIGIN}${BASE}${p.replace(/^\//, '')}`;

// ---------------------------------------------------------------- route set

const STATIC_META: Record<string, { title: string; description: string; kicker: string }> = {
  '/': { title: 'Zat — Everything that makes you, you, in one place', description: 'A creator-owned personal world. One link that holds your identity, taste, tools, work and recommendations — with the context that makes them worth trusting.', kicker: 'Zat' },
  '/product': { title: 'Product — Zat', description: 'Spaces, Items and the trust layer: how a Zat world is put together.', kicker: 'Product' },
  '/for-creators': { title: 'For creators — Zat', description: 'Turn scattered recommendations into something permanent, measurable and yours.', kicker: 'For creators' },
  '/trust': { title: 'Trust — Zat', description: 'How Zat makes a recommendation worth believing: disclosure, duration, evidence.', kicker: 'Trust' },
  '/sharing': { title: 'Sharing — Zat', description: 'Every profile, Space and Item generates a 1080 × 1920 Story image, disclosure included.', kicker: 'Sharing' },
  '/studio-overview': { title: 'Zat Studio', description: 'Shape your world: Spaces, Items, disclosures, layout and publishing.', kicker: 'Studio' },
  '/analytics-overview': { title: 'Analytics — Zat', description: 'Per-Space exploration, saves, outbound clicks and attributed revenue.', kicker: 'Analytics' },
  '/discover-explained': { title: 'How discovery works — Zat', description: 'Searching for what people actually use, rather than what is being advertised.', kicker: 'Discovery' },
  '/pricing': { title: 'Pricing — Zat', description: 'Free to start. Creator at £12 a month, Pro at £32.', kicker: 'Pricing' },
  '/examples': { title: 'Example worlds — Zat', description: 'Four creators, four very different worlds.', kicker: 'Examples' },
  '/discover': { title: 'Discover — Zat', description: 'Search what people actually use, with the disclosure attached.', kicker: 'Discover' },
  '/saved': { title: 'Saved — Zat', description: 'Items you have saved.', kicker: 'Saved' },
  '/about': { title: 'About — Zat', description: 'Why Zat exists: a person’s world is the product.', kicker: 'About' },
  '/contact': { title: 'Contact — Zat', description: 'Get in touch about Zat.', kicker: 'Contact' },
  '/help': { title: 'Help — Zat', description: 'How Spaces, Items, disclosure, sharing and publishing work.', kicker: 'Help' },
  '/privacy': { title: 'Privacy — Zat', description: 'What Zat stores, which in this build is nothing on any server.', kicker: 'Privacy' },
  '/terms': { title: 'Terms — Zat', description: 'Terms of use for the Zat demonstration.', kicker: 'Terms' },
  '/disclosure': { title: 'Disclosure policy — Zat', description: 'How Zat labels commercial relationships on every recommendation.', kicker: 'Transparency' },
  '/cookies': { title: 'Cookies — Zat', description: 'Zat sets no cookies.', kicker: 'Cookies' },
  '/signin': { title: 'Sign in — Zat', description: 'Sign in to your Zat Studio.', kicker: 'Sign in' },
  '/signup': { title: 'Claim your Zat', description: 'Claim your handle and build a world for the things that make you, you.', kicker: 'Get started' },
};

function buildRoutes(): RouteMeta[] {
  const out: RouteMeta[] = [];

  for (const path of STATIC_ROUTES) {
    const meta = STATIC_META[path];
    if (!meta) continue;
    out.push({
      path,
      title: meta.title,
      description: meta.description,
      ogImage: `og${path === '/' ? '/home' : path}.jpg`,
      noIndex: path === '/saved',
      og: { kicker: 'Zat', heading: meta.title.replace(/ — Zat$/, ''), sub: meta.description },
    });
  }

  for (const person of people) {
    const personSpaces = spaces.filter((s) => s.personId === person.id);
    out.push({
      path: `/${person.handle}`,
      title: `${person.name} (@${person.handle}) — Zat`,
      description: person.statement,
      ogImage: `og/${person.handle}.jpg`,
      type: 'profile',
      og: { kicker: person.roles.join(' · '), heading: person.name, sub: person.statement, art: personSpaces[0]?.cover.key },
      jsonLd: {
        '@context': 'https://schema.org', '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person', name: person.name, alternateName: `@${person.handle}`,
          description: person.statement, jobTitle: person.roles.join(', '),
          url: abs(person.handle), sameAs: person.socials.map((s) => s.url),
        },
      },
    });
    out.push({
      path: `/${person.handle}/about`,
      title: `About ${person.name} — Zat`,
      description: person.statement,
      ogImage: `og/${person.handle}.jpg`,
      type: 'profile',
    });
    out.push({
      path: `/${person.handle}/content`,
      title: `Projects — ${person.name} on Zat`,
      description: `Work and content published by ${person.name}, with the Items that appear in each piece.`,
      ogImage: `og/${person.handle}.jpg`,
    });
    out.push({
      path: `/${person.handle}/media-kit`,
      title: `${person.name} — media kit`,
      description: `Audience, engagement and disclosure profile for ${person.name}.`,
      ogImage: `og/${person.handle}.jpg`,
    });

    for (const space of personSpaces) {
      out.push({
        path: `/${person.handle}/${space.slug}`,
        title: `${space.title} — ${person.name} on Zat`,
        description: space.intro,
        ogImage: `og/${person.handle}-${space.slug}.jpg`,
        og: { kicker: `${person.name} · Space ${String(space.index).padStart(2, '0')}`, heading: space.title, sub: space.intro, art: space.cover.key },
      });

      for (const item of items.filter((i) => i.spaceId === space.id)) {
        out.push({
          path: `/${person.handle}/${space.slug}/${item.slug}`,
          title: `${item.title} — ${space.title} by ${person.name} on Zat`,
          description: `${item.description || item.creatorNote}`.slice(0, 180),
          ogImage: `og/${person.handle}-${space.slug}-${item.slug}.jpg`,
          type: 'article',
          og: { kicker: `${person.name} · ${space.title}`, heading: item.title, sub: item.creatorNote, art: item.image.key },
        });
      }
    }

    for (const piece of contentPieces.filter((c) => c.personId === person.id)) {
      out.push({
        path: `/${person.handle}/content/${piece.slug}`,
        title: `${piece.title} — ${person.name} on Zat`,
        description: piece.summary,
        ogImage: `og/${person.handle}-c-${piece.slug}.jpg`,
        type: 'article',
        og: { kicker: `${person.name} · ${piece.type}`, heading: piece.title, sub: piece.summary, art: piece.thumb.key },
      });
    }
  }

  return out;
}

// ------------------------------------------------------------- OG rendering

type Font = { name: string; data: Buffer; weight: 400 | 500 | 600; style: 'normal' };

async function loadFonts(): Promise<Font[]> {
  const dir = resolve(APP, 'build-assets/og-fonts');
  return [
    { name: 'Inter', data: await readFile(resolve(dir, 'inter-400.ttf')), weight: 400, style: 'normal' },
    { name: 'Inter', data: await readFile(resolve(dir, 'inter-600.ttf')), weight: 600, style: 'normal' },
    { name: 'Playfair', data: await readFile(resolve(dir, 'playfair-500.ttf')), weight: 500, style: 'normal' },
  ];
}

/** satori accepts a React-like tree; plain objects avoid a JSX build step. */
const el = (type: string, props: Record<string, unknown>) => ({ type, props });

/** Trim to a word boundary rather than cutting mid-word. */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).replace(/[,.;:\s]+$/, '')}…`;
}

async function renderOg(route: RouteMeta, fonts: Font[]): Promise<Buffer | null> {
  if (!route.og) return null;
  const { kicker, heading, sub, art } = route.og;

  let artUri: string | undefined;
  if (art) {
    const file = resolve(APP, 'public/media', `${art}.webp`);
    if (existsSync(file)) {
      // satori cannot decode webp, so the artwork is transcoded in memory
      // rather than shipping a second copy of every image.
      const png = await sharp(file).resize(560, 630, { fit: 'cover' }).png().toBuffer();
      artUri = `data:image/png;base64,${png.toString('base64')}`;
    }
  }

  const children: unknown[] = [
    el('div', {
      style: {
        position: 'absolute', inset: 0,
        background: 'radial-gradient(1000px 500px at 50% -10%, #1d1a17 0%, #0a0a0b 70%)',
      },
    }),
  ];

  if (artUri) {
    children.push(
      el('img', { src: artUri, width: 520, height: 630, style: { position: 'absolute', right: 0, top: 0, objectFit: 'cover', opacity: 0.85 } }),
      el('div', { style: { position: 'absolute', right: 0, top: 0, width: 560, height: 630, background: 'linear-gradient(90deg, #0a0a0b 0%, rgba(10,10,11,0) 60%)' } }),
    );
  }

  children.push(
    el('div', {
      style: { position: 'relative', display: 'flex', flexDirection: 'column', padding: '64px 72px', height: '100%', width: artUri ? '700px' : '100%' },
      children: [
        el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'auto' }, children: [
          el('div', { style: { fontFamily: 'Playfair', fontSize: 40, color: '#faf8f5' }, children: 'Zat' }),
          el('div', { style: { width: 9, height: 9, borderRadius: 9, background: '#ef2b3a' } }),
        ] }),
        el('div', { style: { fontFamily: 'Inter', fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: '#d8a96a', marginBottom: 18 }, children: kicker }),
        el('div', { style: { fontFamily: 'Playfair', fontSize: heading.length > 42 ? 54 : 70, lineHeight: 1.06, color: '#faf8f5', marginBottom: 20 }, children: heading }),
        sub ? el('div', { style: { fontFamily: 'Inter', fontSize: 24, lineHeight: 1.45, color: 'rgba(250,248,245,0.62)' }, children: clamp(sub, 150) }) : null,
      ].filter(Boolean),
    }),
  );

  const svg = await satori(
    el('div', { style: { display: 'flex', width: 1200, height: 630, background: '#0a0a0b' }, children }) as never,
    { width: 1200, height: 630, fonts: fonts as never },
  );

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  // JPEG rather than PNG: these cards are photographic and have no alpha, so
  // PNG quadruples the published weight for no visible gain.
  return sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}

// ------------------------------------------------------------------- output

function headFor(route: RouteMeta): string {
  const url = abs(route.path === '/' ? '' : route.path);
  const image = abs(route.ogImage);
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  return [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<meta name="robots" content="${route.noIndex ? 'noindex,nofollow' : 'index,follow'}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${route.type ?? 'website'}" />`,
    `<meta property="og:site_name" content="Zat" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    route.jsonLd ? `<script type="application/ld+json">${JSON.stringify(route.jsonLd)}</script>` : '',
  ].filter(Boolean).join('\n    ');
}

async function main() {
  const shell = await readFile(resolve(ROOT, 'index.html'), 'utf8');
  const routes = buildRoutes();
  const fonts = await loadFonts();

  await mkdir(resolve(ROOT, 'og'), { recursive: true });

  let ogCount = 0;
  for (const route of routes) {
    // --- per-route HTML -------------------------------------------------
    const head = headFor(route);
    const html = shell
      .replace(/<title>[\s\S]*?<\/title>/, '')
      .replace(/<meta name="description"[\s\S]*?\/>/, '')
      .replace(/<link rel="canonical"[^>]*>/, '')
      .replace(/<meta property="og:[\s\S]*?\/>/g, '')
      .replace(/<meta name="twitter:[\s\S]*?\/>/g, '')
      .replace('</head>', `    ${head}\n  </head>`);

    const target = route.path === '/' ? resolve(ROOT, 'index.html') : resolve(ROOT, route.path.replace(/^\//, ''), 'index.html');
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html, 'utf8');

    // --- OG card --------------------------------------------------------
    const png = await renderOg(route, fonts);
    if (png) {
      const ogPath = resolve(ROOT, route.ogImage);
      await mkdir(dirname(ogPath), { recursive: true });
      await writeFile(ogPath, png);
      ogCount++;
    }
  }

  // --- sitemap ----------------------------------------------------------
  const urls = routes
    .filter((r) => !r.noIndex && !['/signin', '/signup'].includes(r.path))
    .map((r) => `  <url><loc>${abs(r.path === '/' ? '' : r.path)}</loc></url>`)
    .join('\n');
  await writeFile(
    resolve(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    'utf8',
  );

  // --- 404 fallback stays at the root -----------------------------------
  if (existsSync(resolve(APP, 'public/404.html'))) {
    await cp(resolve(APP, 'public/404.html'), resolve(ROOT, '404.html'));
  }

  await writeIcons();

  console.log(`${routes.length} routes written, ${ogCount} OG images, sitemap with ${routes.length} entries`);
}

/** Favicon, app icons and the web manifest — the Zat mark on the dark ground. */
async function writeIcons() {
  const dir = resolve(ROOT, 'icons');
  await mkdir(dir, { recursive: true });

  const mark = (size: number) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0a0a0b"/>
  <text x="30" y="44" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#faf8f5">Z</text>
  <circle cx="50" cy="40" r="4.5" fill="#ef2b3a"/>
</svg>`;

  await writeFile(resolve(dir, 'favicon.svg'), mark(64), 'utf8');
  for (const size of [180, 192, 512]) {
    const png = await sharp(Buffer.from(mark(size))).resize(size, size).png().toBuffer();
    await writeFile(resolve(dir, size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`), png);
  }

  await writeFile(
    resolve(ROOT, 'manifest.webmanifest'),
    JSON.stringify({
      name: 'Zat', short_name: 'Zat',
      description: 'Everything that makes you, you — in one place.',
      start_url: BASE, scope: BASE, display: 'standalone',
      background_color: '#0a0a0b', theme_color: '#0a0a0b',
      icons: [
        { src: `${BASE}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${BASE}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
      ],
    }, null, 2),
    'utf8',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
