/**
 * The QA gate: `npm run qa`.
 *
 * Runs the unit suite, then the route crawler, then the end-to-end journeys,
 * against a preview server it starts and stops itself. Each stage runs even
 * if an earlier one failed, so one run reports every problem rather than the
 * first; the exit code is non-zero if any stage failed.
 *
 * The build is not run here. QA tests what is on disk, which is what Pages
 * serves — run `npm run build` first.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const BASE = 'http://localhost:4173/cx/';

function run(command: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', cwd: process.cwd() });
    child.on('close', (code) => resolve(code ?? 1));
  });
}

async function waitForServer(attempts = 40): Promise<void> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      // Not listening yet.
    }
    await delay(250);
  }
  throw new Error(`preview server never answered on ${BASE}`);
}

async function main() {
  const stages: Array<{ name: string; code: number }> = [];

  stages.push({ name: 'unit', code: await run('npx', ['vitest', 'run']) });

  let preview: ChildProcess | undefined;
  try {
    preview = spawn(
      'npx',
      ['vite', 'preview', '--port', '4173', '--strictPort', '--outDir', '..', '--base', '/cx/'],
      { stdio: 'ignore' },
    );
    await waitForServer();

    stages.push({ name: 'crawl', code: await run('npx', ['tsx', 'scripts/qa/crawl.ts']) });
    stages.push({ name: 'journeys', code: await run('npx', ['tsx', 'scripts/qa/journeys.ts']) });
  } finally {
    preview?.kill();
  }

  console.log('\n--- qa ---');
  for (const s of stages) console.log(`  ${s.code === 0 ? 'PASS' : 'FAIL'}  ${s.name}`);
  process.exit(stages.some((s) => s.code !== 0) ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
