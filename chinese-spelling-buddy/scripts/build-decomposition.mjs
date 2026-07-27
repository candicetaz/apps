// Generates public/decomposition.json from the vendored Make Me a Hanzi
// dictionary.txt (see third_party/README.md) — trims each line down to just
// the fields src/lib/mnemonics.ts actually uses: decomposition (which
// components a character is built from) and, where the source has one, a
// human-written etymology hint. Dropping the rest (definitions, pinyin,
// stroke-matching data) shrinks ~2.5MB of source down to well under 1MB.
import { createReadStream, writeFileSync, mkdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceFile = join(__dirname, '..', 'third_party', 'makemeahanzi-dictionary.txt');
const outDir = join(__dirname, '..', 'public');
const outFile = join(outDir, 'decomposition.json');

const decomposition = {};

const rl = createInterface({ input: createReadStream(sourceFile), crlfDelay: Infinity });
for await (const line of rl) {
  if (!line.trim()) continue;
  const entry = JSON.parse(line);
  const d = entry.decomposition;
  const h = entry.etymology?.hint;
  const t = entry.etymology?.type;
  if (!d && !h) continue;

  const trimmed = {};
  if (d) trimmed.d = d;
  if (h) trimmed.h = h;
  if (t) trimmed.t = t;
  decomposition[entry.character] = trimmed;
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(decomposition));

const charCount = Object.keys(decomposition).length;
const bytes = Buffer.byteLength(JSON.stringify(decomposition));
console.log(`Wrote ${charCount} characters (${(bytes / 1024).toFixed(0)} KB) to ${outFile}`);
