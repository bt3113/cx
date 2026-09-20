/**
 * Clears the hashed asset directory before a build.
 *
 * The build writes to the repository root, because that is what GitHub Pages
 * serves, so `emptyOutDir` has to stay off — it would delete `app/` and
 * `.git` along with the output. The consequence is that every rebuild leaves
 * the previous run's content-hashed files behind. This removes exactly the
 * one directory that is entirely build output, and nothing else.
 */
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const ASSETS = resolve(import.meta.dirname, '../../assets');

await rm(ASSETS, { recursive: true, force: true });
console.log('cleared assets/');
