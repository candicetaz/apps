// A word/phrase -> list of short English glosses.
export type Dictionary = Record<string, string[]>;

// One chunk of pasted text after segmentation: either a Chinese word
// (annotated with pinyin + meaning) or a run of non-Chinese text
// (punctuation, spaces, digits, latin letters) shown as-is.
export interface AnnotatedSegment {
  text: string;
  isChinese: boolean;
  pinyin: string | null;
  meanings: string[] | null;
}

export interface SavedPhrase {
  id: string;
  text: string;
  createdAt: number;
  // Ids of the WordLists this phrase belongs to. A phrase can be in any
  // number of lists (including none — "unfiled", still shown in My List).
  listIds: string[];
}

export interface WordList {
  id: string;
  name: string;
  createdAt: number;
}

export interface TestAttemptRecord {
  phraseId: string;
  char: string;
  correct: boolean;
  mistakes: number;
  attemptedAt: number;
}

export interface RecallAttemptRecord {
  cardId: string;
  text: string;
  know: boolean;
  attemptedAt: number;
}

// Character decomposition + etymology data (from the Make Me a Hanzi
// project) used to generate "creative way to remember" mnemonics.
// d = decomposition (IDS string), h = human-written etymology hint,
// t = etymology type (pictographic/ideographic/pictophonetic).
export type DecompositionData = Record<string, { d?: string; h?: string; t?: string }>;

export type ViewName = 'reader' | 'saved' | 'practise' | 'test' | 'progress';
