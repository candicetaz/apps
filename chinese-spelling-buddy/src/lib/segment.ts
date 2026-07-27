import { pinyin } from 'pinyin-pro';
import type { AnnotatedSegment, Dictionary } from '../types';

// Longest dictionary entry (in characters) segmentation will try to match.
// CC-CEDICT has a handful of much longer idiom/name entries, but capping
// this keeps forward-maximum-matching fast without losing common vocabulary.
const MAX_WORD_LEN = 8;

export function isChineseChar(char: string): boolean {
  const cp = char.codePointAt(0);
  if (cp === undefined) return false;
  return (
    (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified Ideographs
    (cp >= 0x3400 && cp <= 0x4dbf) || // Extension A
    (cp >= 0x20000 && cp <= 0x2a6df) || // Extension B (surrogate pair)
    (cp >= 0xf900 && cp <= 0xfaff) // Compatibility ideographs
  );
}

const EXTRA_CJK_PUNCTUATION = new Set([
  '，', '。', '、', '；', '：', '？', '！',
  '“', '”', '‘', '’',
  '（', '）', '《', '》', '【', '】', '〈', '〉', '「', '」', '『', '』',
  '—', '～', '·', '／', '＼', '　',
]);

function isPunctuationOrSpace(char: string): boolean {
  const cp = char.codePointAt(0);
  if (cp === undefined) return false;
  if (/\s/.test(char)) return true; // spaces, tabs, line breaks
  if (cp >= 0x3000 && cp <= 0x303f) return true; // CJK Symbols and Punctuation
  if (cp >= 0x2000 && cp <= 0x206f) return true; // General Punctuation (em dash, ellipsis, curly quotes...)
  if (EXTRA_CJK_PUNCTUATION.has(char)) return true;
  if (cp <= 0x7e && /[!-/:-@[-`{-~]/.test(char)) return true; // ASCII punctuation
  return false;
}

/**
 * Strips anything that isn't Chinese text, punctuation, or whitespace —
 * e.g. stray English words mixed into pasted text — while keeping line
 * breaks so multi-line pastes still save as separate phrases.
 */
export function filterToChineseAndPunctuation(text: string): string {
  return Array.from(text)
    .filter((char) => isChineseChar(char) || isPunctuationOrSpace(char))
    .join('');
}

/**
 * Splits text into Chinese words (forward maximum matching against the
 * dictionary's own keys) and runs of non-Chinese text (shown as-is, with no
 * pinyin or meaning). Pinyin is generated once for the whole input so
 * pinyin-pro can use sentence context to pick the right reading for
 * polyphonic characters (e.g. 银行 -> háng, not xíng), then re-grouped to
 * match each segment.
 */
export function segmentAndAnnotate(text: string, dict: Dictionary): AnnotatedSegment[] {
  const chars = Array.from(text);
  if (chars.length === 0) return [];

  const charPinyin = pinyin(text, { toneType: 'symbol', type: 'array' }) as string[];

  const segments: AnnotatedSegment[] = [];
  let i = 0;

  while (i < chars.length) {
    if (!isChineseChar(chars[i])) {
      let j = i + 1;
      while (j < chars.length && !isChineseChar(chars[j])) j++;
      segments.push({ text: chars.slice(i, j).join(''), isChinese: false, pinyin: null, meanings: null });
      i = j;
      continue;
    }

    let matchedLen = 1;
    const maxLen = Math.min(MAX_WORD_LEN, chars.length - i);
    for (let len = maxLen; len >= 1; len--) {
      const candidate = chars.slice(i, i + len).join('');
      if (dict[candidate]) {
        matchedLen = len;
        break;
      }
    }

    const word = chars.slice(i, i + matchedLen).join('');
    segments.push({
      text: word,
      isChinese: true,
      pinyin: charPinyin.slice(i, i + matchedLen).join(' '),
      meanings: dict[word] ?? null,
    });
    i += matchedLen;
  }

  return segments;
}

/**
 * Falls back to showing pinyin (already resolved with sentence context)
 * instead of a dead end, for words with no dictionary entry or no useful
 * gloss left after build-time filtering.
 */
export function resolveDisplayMeanings(meanings: string[] | null, pinyin: string | null): string[] {
  if (meanings && meanings.length > 0) return meanings;
  return pinyin ? [pinyin] : ['No dictionary entry found for this word.'];
}
