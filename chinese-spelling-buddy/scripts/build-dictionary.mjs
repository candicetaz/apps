// Generates public/dictionary.json from the CC-CEDICT dataset (via the
// `cedict-json` package) at build/dev time. Keeps only entries whose
// simplified form is pure Chinese text (skips "%", "110", "CD", etc.) and
// merges English glosses across pinyin-variant entries for the same word,
// since the reader shows one meanings list per word regardless of which
// reading applies in a given sentence (pinyin itself is resolved separately,
// with sentence context, by pinyin-pro at read time).
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import cedict from 'cedict-json';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public');
const outFile = join(outDir, 'dictionary.json');

const MAX_MEANINGS_PER_WORD = 6;
const CROSS_REF_RE = /^(old |Japanese )?variant of /i;

function isChineseChar(char) {
  const cp = char.codePointAt(0);
  if (cp === undefined) return false;
  return (
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x20000 && cp <= 0x2a6df) ||
    (cp >= 0xf900 && cp <= 0xfaff)
  );
}

function isAllChinese(word) {
  return word.length > 0 && Array.from(word).every(isChineseChar);
}

const merged = new Map();

for (const entry of cedict) {
  const word = entry.simplified;
  if (!isAllChinese(word)) continue;

  const existing = merged.get(word) ?? [];
  for (const gloss of entry.english) {
    const clean = gloss.trim();
    if (!clean || existing.includes(clean)) continue;
    existing.push(clean);
  }
  merged.set(word, existing);
}

const dictionary = {};
for (const [word, glosses] of merged) {
  // Cross-reference-only glosses ("variant of X") are worse than no gloss at
  // all (the UI falls back to showing pinyin instead) — but keep them if
  // that's genuinely the only thing CC-CEDICT has for this word.
  const real = glosses.filter((g) => !CROSS_REF_RE.test(g));
  const chosen = real.length > 0 ? real : glosses;
  dictionary[word] = chosen.slice(0, MAX_MEANINGS_PER_WORD);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(dictionary));

const wordCount = Object.keys(dictionary).length;
const bytes = Buffer.byteLength(JSON.stringify(dictionary));
console.log(`Wrote ${wordCount} words (${(bytes / 1024 / 1024).toFixed(2)} MB) to ${outFile}`);
