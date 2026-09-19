import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const OUT = process.env.SHOT_DIR ?? '/tmp/claude-0/-home-user-ms/95cd0512-5894-5540-a425-6b434e98f9ab/scratchpad/shots';
const BASE = 'http://localhost:4173/cx';

type Shot = { name: string; path: string; w: number; h: number; full?: boolean; wait?: number };

const shots: Shot[] = JSON.parse(process.env.SHOTS ?? '[]');

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errors: string[] = [];

  for (const s of shots) {
    const ctx = await browser.newContext({
      viewport: { width: s.w, height: s.h },
      deviceScaleFactor: 1,
      ...(s.w < 600 ? devices['iPhone 14 Pro Max'] : {}),
      viewport2: undefined as never,
    } as any);
    // re-assert viewport (device preset overrides it)
    const page = await ctx.newPage();
    await page.setViewportSize({ width: s.w, height: s.h });
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${s.name}] ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`[${s.name}] PAGEERROR ${e.message}`));
    await page.goto(BASE + s.path, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(s.wait ?? 1200);
    await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: Boolean(s.full) });
    await ctx.close();
  }

  await browser.close();
  if (errors.length) { console.log('CONSOLE ERRORS:'); errors.forEach((e) => console.log('  ' + e)); }
  else console.log('no console errors');
}
main().catch((e) => { console.error(e); process.exit(1); });
