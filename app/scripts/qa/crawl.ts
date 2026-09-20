/**
 * Route crawler.
 *
 * Visits every route, records console errors and page errors, follows every
 * internal link it finds, and reports anything that renders the not-found
 * page. Run against the built output so it tests what actually ships.
 */
import { chromium, type Page } from '@playwright/test';

const BASE = process.env.QA_BASE ?? 'http://localhost:4173/cx';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/** Seeds: everything else is discovered by following links. */
const SEEDS = [
  '/', '/product', '/for-creators', '/trust', '/sharing', '/studio-overview',
  '/analytics-overview', '/discover-explained', '/pricing', '/examples',
  '/discover', '/saved', '/about', '/contact', '/help', '/privacy', '/terms',
  '/disclosure', '/cookies', '/signin', '/signup',
  '/alexden', '/alexden/about', '/alexden/content', '/alexden/media-kit',
  '/alexden/photography', '/alexden/photography/sony-a7-iv',
  '/alexden/content/whats-in-my-camera-bag-2026',
  '/mara', '/jonas', '/priya',
  '/this-handle-does-not-exist',
];

type Problem = { route: string; kind: string; detail: string };

async function visit(page: Page, route: string, problems: Problem[]): Promise<string[]> {
  const errors: string[] = [];
  const onConsole = (m: { type: () => string; text: () => string }) => {
    if (m.type() === 'error') errors.push(m.text());
  };
  const onPageError = (e: Error) => errors.push(`PAGEERROR ${e.message}`);

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  let links: string[] = [];
  try {
    const res = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45_000 });
    if (res && res.status() >= 400) {
      problems.push({ route, kind: 'http', detail: String(res.status()) });
    }
    await page.waitForTimeout(350);

    // The 404 route is expected for the deliberately-bad seed only.
    const notFound = await page.locator('text=Error 404').count();
    if (notFound > 0 && route !== '/this-handle-does-not-exist') {
      problems.push({ route, kind: 'not-found', detail: 'rendered the 404 page' });
    }

    const title = await page.title();
    if (!title || title === 'Zat') {
      problems.push({ route, kind: 'meta', detail: `weak title: "${title}"` });
    }

    links = await page.evaluate(() => {
      const base = document.baseURI;
      return Array.from(document.querySelectorAll('a[href]'))
        .map((a) => new URL((a as HTMLAnchorElement).href, base))
        .filter((u) => u.origin === location.origin)
        .map((u) => u.pathname.replace(/^\/cx/, '') || '/');
    });
  } catch (err) {
    problems.push({ route, kind: 'navigation', detail: (err as Error).message });
  }

  page.off('console', onConsole);
  page.off('pageerror', onPageError);
  for (const e of errors) problems.push({ route, kind: 'console', detail: e });
  return links;
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const problems: Problem[] = [];
  const seen = new Set<string>();
  const queue = [...SEEDS];

  while (queue.length) {
    const route = queue.shift()!;
    if (seen.has(route)) continue;
    seen.add(route);
    const links = await visit(page, route, problems);
    for (const link of links) {
      if (!seen.has(link) && !link.startsWith('/studio')) queue.push(link);
    }
  }

  await browser.close();

  console.log(`visited ${seen.size} routes`);
  if (!problems.length) {
    console.log('PASS — no console errors, no broken links, every route has a title');
    return;
  }

  const byKind = problems.reduce<Record<string, Problem[]>>((acc, p) => {
    (acc[p.kind] ??= []).push(p);
    return acc;
  }, {});
  for (const [kind, list] of Object.entries(byKind)) {
    console.log(`\n${kind.toUpperCase()} (${list.length})`);
    for (const p of list.slice(0, 20)) console.log(`  ${p.route} — ${p.detail}`);
  }
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
