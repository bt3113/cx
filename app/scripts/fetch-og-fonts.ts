/**
 * Downloads TTF faces for build-time OG image generation.
 *
 * satori needs TTF/OTF/WOFF and cannot read WOFF2, which is what the site
 * itself ships. Requesting the Google Fonts CSS with a plain user agent (no
 * woff2 support advertised) returns TTF URLs. These are build inputs only and
 * are never served.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT = resolve(import.meta.dirname, '../build-assets/og-fonts');
const UA = 'Mozilla/5.0';

const FACES = [
  { file: 'inter-400.ttf', spec: 'Inter:wght@400' },
  { file: 'inter-600.ttf', spec: 'Inter:wght@600' },
  { file: 'playfair-500.ttf', spec: 'Playfair+Display:wght@500' },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const face of FACES) {
    const cssRes = await fetch(`https://fonts.googleapis.com/css2?family=${face.spec}`, {
      headers: { 'User-Agent': UA },
    });
    const css = await cssRes.text();
    const url = /src:\s*url\(([^)]+)\)/.exec(css)?.[1];
    if (!url) throw new Error(`No font URL for ${face.spec}`);
    const bin = await fetch(url, { headers: { 'User-Agent': UA } });
    const buf = Buffer.from(await bin.arrayBuffer());
    await writeFile(resolve(OUT, face.file), buf);
    console.log(`  ${face.file}  ${(buf.length / 1024).toFixed(0)}kb`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
