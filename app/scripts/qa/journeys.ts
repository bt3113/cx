/**
 * End-to-end journeys.
 *
 * Drives the built site the way a person would, and asserts the outcome each
 * flow is supposed to produce — not just that pages render.
 */
import { chromium, type Browser, type Page } from '@playwright/test';

const BASE = process.env.QA_BASE ?? 'http://localhost:4173/cx';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const results: Array<{ name: string; ok: boolean; detail?: string }> = [];

async function run(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  PASS  ${name}`);
  } catch (err) {
    results.push({ name, ok: false, detail: (err as Error).message });
    console.log(`  FAIL  ${name} — ${(err as Error).message}`);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function freshPage(browser: Browser): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => {
    throw new Error(`page error: ${e.message}`);
  });
  return page;
}

async function signInAsDemo(page: Page) {
  await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /enter as the demo creator/i }).click();
  await page.waitForURL(/\/studio/, { timeout: 20_000 });
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME });

  // --- visitor: profile → Space → Item → outbound ------------------------
  await run('visitor explores profile, Space and Item', async () => {
    const page = await freshPage(browser);
    await page.goto(`${BASE}/alexden`, { waitUntil: 'networkidle' });
    assert(await page.getByRole('heading', { name: 'Alex Den' }).count(), 'name missing');

    await page.goto(`${BASE}/alexden/photography`, { waitUntil: 'networkidle' });
    assert(await page.getByRole('region', { name: /Photography Space/i }).count(), 'Space panel did not open');

    await page.goto(`${BASE}/alexden/photography/sony-a7-iv`, { waitUntil: 'networkidle' });
    assert(await page.getByText('Purchased myself').first().count(), 'disclosure missing on Item');
    assert(await page.getByText('Used since').first().count(), 'duration missing on Item');
    assert(await page.getByRole('heading', { name: /Seen in/i }).count(), '"Seen in" missing');
    const outbound = page.getByRole('link', { name: /Where I got it/i });
    assert(await outbound.count(), 'outbound link missing');
    assert((await outbound.getAttribute('rel'))?.includes('nofollow'), 'outbound rel missing nofollow');
    await page.context().close();
  });

  // --- content relationship, both directions -----------------------------
  // --- the world is actually operable -----------------------------------
  //
  // Added after a report that nothing on the profile was clickable, which
  // was correct: the cards sit at a negative translateZ inside a preserve-3d
  // container, so the container itself won every hit test. Navigating by URL
  // — which is all the crawler did — could never have caught it. These
  // journeys click.
  await run('every Space card in the world opens its Space', async () => {
    const page = await freshPage(browser);
    await page.goto(`${BASE}/alexden`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);

    const cards = page.locator('main a[aria-label*="\u2014"][href*="/alexden/"]');
    const total = await cards.count();
    assert(total >= 12, `expected 12 Space cards in the world, found ${total}`);

    for (let i = 0; i < total; i += 1) {
      await page.goto(`${BASE}/alexden`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(700);
      const card = page.locator('main a[aria-label*="\u2014"][href*="/alexden/"]').nth(i);
      const href = await card.getAttribute('href');
      await card.click();
      await page.waitForTimeout(500);
      assert(
        page.url().endsWith(href ?? '\u0000'),
        `card ${i} (${href}) did not navigate — landed on ${page.url()}`,
      );
      assert(
        await page.getByRole('region', { name: /Space$/ }).count(),
        `card ${i} (${href}) navigated but no Space panel opened`,
      );
    }
  });

  await run('every Space holds five items', async () => {
    const page = await freshPage(browser);
    const slugs = [
      'wardrobe', 'music', 'travel', 'memories', 'books', 'work',
      'photography', 'fitness', 'gaming', 'movies', 'ideas', 'life',
    ];
    const short: string[] = [];
    for (const slug of slugs) {
      await page.goto(`${BASE}/alexden/${slug}`, { waitUntil: 'networkidle' });
      const n = await page.locator(`[role="region"] a[href*="/alexden/${slug}/"]`).count();
      if (n !== 5) short.push(`${slug}=${n}`);
    }
    assert(!short.length, `Spaces not holding five items: ${short.join(', ')}`);
  });

  await run('buy is one click from an opened Space', async () => {
    const page = await freshPage(browser);
    await page.goto(`${BASE}/alexden/books`, { waitUntil: 'networkidle' });

    const buys = page.locator('[role="region"] a[data-buy]');
    const n = await buys.count();
    assert(n >= 4, `expected a buy link on each purchasable book, found ${n}`);

    const first = buys.first();
    const href = await first.getAttribute('href');
    const rel = (await first.getAttribute('rel')) ?? '';
    assert(href?.startsWith('http'), `buy link is not absolute: ${href}`);
    assert(rel.includes('noopener') && rel.includes('nofollow'), `weak rel on buy link: ${rel}`);
    assert((await first.getAttribute('target')) === '_blank', 'buy link does not open a new tab');

    // The affiliate book must additionally be marked as a paid relationship.
    const affiliate = page.locator('[role="region"] a[data-buy="the-daily-stoic"]');
    const arel = (await affiliate.getAttribute('rel')) ?? '';
    assert(arel.includes('sponsored'), `affiliate buy link is not marked sponsored: ${arel}`);

    // And clicking it really does leave for the retailer rather than
    // navigating the Space panel out from under the visitor.
    //
    // The popup's own URL is not asserted: this environment has no egress,
    // so the new tab lands on chrome-error:// whatever it was pointed at.
    // What is under test is that a new tab is opened at all and that the
    // click does not also navigate the page behind it — the failure mode the
    // nested-anchor restructure introduced.
    const [popup] = await Promise.all([page.waitForEvent('popup'), first.click()]);
    assert(popup, 'buy click opened no new tab');
    assert(page.url().endsWith('/alexden/books'), `buy click also navigated the page to ${page.url()}`);
    await popup.close();
  });

  await run('mobile world opens a Space and can buy from it', async () => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => {
      throw new Error(`page error: ${e.message}`);
    });
    await page.goto(`${BASE}/alexden`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const card = page.locator('main a[href*="/alexden/"][aria-label*="\u2014"]').first();
    const href = await card.getAttribute('href');
    await card.click();
    await page.waitForTimeout(600);
    assert(page.url().endsWith(href ?? '\u0000'), `mobile card did not navigate — on ${page.url()}`);

    const buys = page.locator('[role="region"] a[data-buy]');
    assert(await buys.count(), 'no buy link inside the opened Space on mobile');
    await ctx.close();
  });

  await run('content lists its items, item lists its content', async () => {
    const page = await freshPage(browser);
    await page.goto(`${BASE}/alexden/content/whats-in-my-camera-bag-2026`, { waitUntil: 'networkidle' });
    assert(await page.getByRole('heading', { name: /Everything in this/i }).count(), 'reverse relationship missing');
    assert(await page.getByRole('link', { name: /Sony A7 IV/i }).count(), 'item not listed in content');
    await page.context().close();
  });

  // --- saving persists across a reload -----------------------------------
  await run('saving an item persists across reload', async () => {
    const page = await freshPage(browser);
    await page.goto(`${BASE}/alexden/photography/sony-a7-iv`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /^Save$/ }).click();
    await page.getByRole('button', { name: /^Want$/ }).click();
    await page.getByRole('button', { name: /^Close$/ }).click();
    assert(await page.getByRole('button', { name: /Saved/i }).count(), 'button did not switch to Saved');

    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.getByRole('button', { name: /Saved/i }).count(), 'save did not persist');

    await page.goto(`${BASE}/saved`, { waitUntil: 'networkidle' });
    assert(await page.getByRole('link', { name: /Sony A7 IV/i }).count(), 'item missing from /saved');
    await page.context().close();
  });

  // --- share generates a real image --------------------------------------
  await run('share generates a 1080x1920 Story image', async () => {
    const page = await freshPage(browser);
    await page.goto(`${BASE}/alexden/photography/sony-a7-iv`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /^Share$/ }).click();
    const preview = page.getByAltText('Story preview');
    await preview.waitFor({ state: 'visible', timeout: 25_000 });
    const size = await preview.evaluate((el) => {
      const img = el as HTMLImageElement;
      return { w: img.naturalWidth, h: img.naturalHeight };
    });
    assert(size.w === 1080 && size.h === 1920, `expected 1080x1920, got ${size.w}x${size.h}`);
    await page.context().close();
  });

  // --- discovery ----------------------------------------------------------
  await run('discovery search filters the catalogue', async () => {
    const page = await freshPage(browser);
    await page.goto(`${BASE}/discover`, { waitUntil: 'networkidle' });
    const before = await page.locator('main ul li a').count();
    await page.getByRole('searchbox', { name: /search items/i }).fill('camera');
    await page.waitForTimeout(600);
    const after = await page.locator('main ul li a').count();
    assert(after > 0, 'search returned nothing for "camera"');
    assert(after < before, 'search did not narrow the results');
    await page.context().close();
  });

  // --- studio: sign in, edit, publish, see it on the public profile -------
  await run('studio edit publishes through to the public profile', async () => {
    const page = await freshPage(browser);
    await signInAsDemo(page);

    await page.goto(`${BASE}/studio/identity`, { waitUntil: 'networkidle' });
    const statement = page.locator('#s-statement');
    await statement.fill('A world rebuilt during an end-to-end QA run.');

    await page.getByRole('button', { name: /^Publish/ }).first().click();
    await page.waitForTimeout(400);

    await page.goto(`${BASE}/alexden/about`, { waitUntil: 'networkidle' });
    assert(
      await page.getByText('A world rebuilt during an end-to-end QA run.').count(),
      'published edit did not reach the public profile',
    );
    await page.context().close();
  });

  // --- studio: every section renders --------------------------------------
  await run('every Studio section renders', async () => {
    const page = await freshPage(browser);
    await signInAsDemo(page);
    for (const section of [
      '', '/identity', '/spaces', '/items', '/content',
      '/appearance', '/story', '/analytics', '/media-kit', '/settings',
    ]) {
      await page.goto(`${BASE}/studio${section}`, { waitUntil: 'networkidle' });
      const heading = await page.locator('h1').first().textContent();
      assert(heading && heading.trim().length > 0, `no heading on /studio${section}`);
    }
    await page.context().close();
  });

  // --- character builder ---------------------------------------------------
  await run('character builder renders and responds', async () => {
    const page = await freshPage(browser);
    await signInAsDemo(page);
    await page.goto(`${BASE}/studio/identity`, { waitUntil: 'networkidle' });
    const preview = page.getByAltText('Your character');
    await preview.waitFor({ state: 'visible', timeout: 15_000 });
    const before = await preview.getAttribute('src');
    await page.getByRole('radio', { name: 'Avataaars' }).click();
    await page.waitForTimeout(400);
    const after = await preview.getAttribute('src');
    assert(before !== after, 'changing style did not change the character');
    assert((after ?? '').startsWith('data:image/svg+xml'), 'character is not an inline SVG');
    await page.context().close();
  });

  // --- auth guard ----------------------------------------------------------
  await run('studio is guarded when signed out', async () => {
    const page = await freshPage(browser);
    await page.goto(`${BASE}/studio/analytics`, { waitUntil: 'networkidle' });
    await page.waitForURL(/\/signin/, { timeout: 15_000 });
    await page.context().close();
  });

  // --- keyboard ------------------------------------------------------------
  await run('skip link and keyboard focus work', async () => {
    const page = await freshPage(browser);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.textContent ?? '');
    assert(/skip to content/i.test(focused), `first tab stop was "${focused}"`);
    await page.context().close();
  });

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} journeys passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
