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

export type ViewName = 'reader' | 'saved' | 'practise' | 'test' | 'progress';
