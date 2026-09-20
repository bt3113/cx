/**
 * Vendors shadcn/ui component source into `src/components/ui`.
 *
 * shadcn is not a dependency — it is source you own and edit. The normal
 * route is its CLI, which reaches ui.shadcn.com; that host is not reachable
 * from this environment, but raw.githubusercontent.com is, so this reads the
 * same registry manifest the CLI reads and pulls the same files.
 *
 * Keeping it as a script rather than a one-off copy means the provenance of
 * every file in `components/ui` is recorded and the set can be re-pulled or
 * extended without hand-editing. Re-run with `npm run vendor:ui`.
 *
 * Local edits are deliberate and are re-applied on every run by `PATCHES`:
 * the upstream files assume Next.js and a light-first theme, and this is a
 * Vite SPA with a fixed dark ground.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const REPO = 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4';
const OUT = resolve(import.meta.dirname, '../../src/components/ui');
const HOOKS = resolve(import.meta.dirname, '../../src/hooks');

/** What the product actually uses. Dependencies are resolved from these. */
const WANTED = [
  'accordion', 'alert', 'alert-dialog', 'avatar', 'badge', 'breadcrumb',
  'button', 'button-group', 'card', 'chart', 'checkbox', 'collapsible',
  'command', 'dialog', 'drawer', 'dropdown-menu', 'empty', 'field',
  'hover-card', 'input', 'input-group', 'item', 'kbd', 'label',
  'navigation-menu', 'pagination', 'popover', 'progress', 'radio-group',
  'scroll-area', 'select', 'separator', 'sheet', 'sidebar', 'skeleton',
  'slider', 'sonner', 'spinner', 'switch', 'table', 'tabs', 'textarea',
  'toggle', 'toggle-group', 'tooltip',
];

type RegistryItem = {
  name: string;
  type: string;
  files?: Array<{ path: string; type: string; target?: string }>;
  registryDependencies?: string[];
};

/**
 * Edits applied to upstream source on every pull, so a re-run never
 * reintroduces them. Each is a plain string replacement plus the reason.
 */
const PATCHES: Array<{ file: string; from: string; to: string; why: string }> = [
  {
    file: 'sonner.tsx',
    from: `import { useTheme } from "next-themes"`,
    to: `// next-themes removed: this product has one fixed dark ground.`,
    why: 'no theme switcher; next-themes would be a dependency for nothing',
  },
  {
    file: 'sonner.tsx',
    from: `const { theme = "system" } = useTheme()`,
    to: `const theme = "dark"`,
    why: 'same',
  },
];

async function text(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/** Upstream imports from its own registry path; ours live under components/ui. */
function rewrite(source: string): string {
  return source
    .replaceAll('@/registry/new-york-v4/ui/', '@/components/ui/')
    .replaceAll('@/registry/new-york-v4/hooks/', '@/hooks/')
    .replaceAll('@/registry/new-york-v4/lib/', '@/lib/')
    .replaceAll('@/lib/utils', '@/design/cn')
    // The registry stores the class helper as a bare `cn` specifier; the
    // upstream CLI rewrites it on install and so do we.
    .replaceAll('from "cn"', "from '@/design/cn'");
}

async function main() {
  const registry = JSON.parse(await text(`${REPO}/registry.json`)) as { items: RegistryItem[] };
  const byName = new Map(registry.items.map((i) => [i.name, i]));

  // Resolve registryDependencies transitively.
  const needed = new Set<string>();
  const walk = (name: string) => {
    if (needed.has(name)) return;
    const item = byName.get(name);
    if (!item || item.type !== 'registry:ui') return;
    needed.add(name);
    for (const dep of item.registryDependencies ?? []) walk(dep);
  };
  for (const name of WANTED) walk(name);

  await mkdir(OUT, { recursive: true });
  await mkdir(HOOKS, { recursive: true });

  const written: string[] = [];
  for (const name of [...needed].sort()) {
    for (const file of byName.get(name)!.files ?? []) {
      const source = rewrite(await text(`${REPO}/${file.path}`));
      const base = file.path.split('/').pop()!;
      const dir = file.path.includes('/hooks/') ? HOOKS : OUT;
      await writeFile(resolve(dir, base), source, 'utf8');
      written.push(base);
    }
  }

  // The sidebar block pulls a hook that is not itself a registry:ui item.
  const useMobile = rewrite(await text(`${REPO}/registry/new-york-v4/hooks/use-mobile.ts`));
  await writeFile(resolve(HOOKS, 'use-mobile.ts'), useMobile, 'utf8');
  written.push('use-mobile.ts');

  // Re-apply local edits.
  for (const patch of PATCHES) {
    const path = resolve(OUT, patch.file);
    const current = await import('node:fs/promises').then((fs) => fs.readFile(path, 'utf8'));
    if (!current.includes(patch.from)) {
      console.warn(`  ! patch no longer applies to ${patch.file}: ${patch.why}`);
      continue;
    }
    await writeFile(path, current.replace(patch.from, patch.to), 'utf8');
  }

  console.log(`${written.length} files vendored from shadcn/ui into src/components/ui`);
  console.log(`  ${[...needed].sort().join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
