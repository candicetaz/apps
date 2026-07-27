// Copies per-character stroke data from the hanzi-writer-data package into
// public/hanzi-data/ so Practise's stroke-order quiz can fetch it from our
// own origin instead of hanzi-writer's default third-party CDN — see
// src/lib/hanziData.ts, the custom charDataLoader that reads from here.
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(__dirname, '..', 'node_modules', 'hanzi-writer-data');
const outDir = join(__dirname, '..', 'public', 'hanzi-data');

mkdirSync(outDir, { recursive: true });

let count = 0;
for (const name of readdirSync(sourceDir)) {
  if (!name.endsWith('.json') || name === 'package.json') continue;
  copyFileSync(join(sourceDir, name), join(outDir, name));
  count += 1;
}

console.log(`Copied ${count} character stroke-data files to ${outDir}`);
