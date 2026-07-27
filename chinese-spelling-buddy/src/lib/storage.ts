import type { RecallAttemptRecord, SavedPhrase, TestAttemptRecord, WordList } from '../types';

// Everything lives in localStorage — no accounts, no backend, no sync.
// Data stays on this one device/browser.

const PHRASES_KEY = 'csb.savedPhrases.v1';
const LISTS_KEY = 'csb.lists.v1';
const TEST_ATTEMPTS_KEY = 'csb.testAttempts.v1';
const RECALL_ATTEMPTS_KEY = 'csb.recallAttempts.v1';
const RECALL_SPEED_KEY = 'csb.recallSpeed.v1';
const DEFAULT_RECALL_SPEED = 0.8;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getSavedPhrases(): SavedPhrase[] {
  const phrases = safeParse<SavedPhrase[]>(localStorage.getItem(PHRASES_KEY), []);
  // Backfill listIds for phrases saved before multi-list support existed.
  return phrases.map((p) => (p.listIds ? p : { ...p, listIds: [] }));
}

export function savePhrase(text: string, listIds: string[] = []): SavedPhrase {
  const trimmed = text.trim();
  const phrases = getSavedPhrases();

  // Re-saving the same text bumps it to the top instead of duplicating it,
  // and adds any newly-requested lists without dropping ones it was
  // already in.
  const existing = phrases.find((p) => p.text === trimmed);
  if (existing) {
    const rest = phrases.filter((p) => p.id !== existing.id);
    const mergedListIds = Array.from(new Set([...existing.listIds, ...listIds]));
    const bumped = { ...existing, createdAt: Date.now(), listIds: mergedListIds };
    localStorage.setItem(PHRASES_KEY, JSON.stringify([bumped, ...rest]));
    return bumped;
  }

  const phrase: SavedPhrase = { id: newId(), text: trimmed, createdAt: Date.now(), listIds };
  localStorage.setItem(PHRASES_KEY, JSON.stringify([phrase, ...phrases]));
  return phrase;
}

export function deleteSavedPhrase(id: string): void {
  localStorage.setItem(PHRASES_KEY, JSON.stringify(getSavedPhrases().filter((p) => p.id !== id)));
}

export function setPhraseListIds(phraseId: string, listIds: string[]): void {
  const phrases = getSavedPhrases().map((p) => (p.id === phraseId ? { ...p, listIds } : p));
  localStorage.setItem(PHRASES_KEY, JSON.stringify(phrases));
}

export function getLists(): WordList[] {
  return safeParse<WordList[]>(localStorage.getItem(LISTS_KEY), []);
}

export function createList(name: string): WordList {
  const trimmed = name.trim();
  const existing = getLists().find((l) => l.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;

  const list: WordList = { id: newId(), name: trimmed, createdAt: Date.now() };
  localStorage.setItem(LISTS_KEY, JSON.stringify([...getLists(), list]));
  return list;
}

export function renameList(id: string, name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const lists = getLists().map((l) => (l.id === id ? { ...l, name: trimmed } : l));
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
}

export function deleteList(id: string): void {
  localStorage.setItem(LISTS_KEY, JSON.stringify(getLists().filter((l) => l.id !== id)));
  // A deleted list shouldn't leave phrases referencing an id that no
  // longer exists.
  const phrases = getSavedPhrases().map((p) =>
    p.listIds.includes(id) ? { ...p, listIds: p.listIds.filter((lid) => lid !== id) } : p,
  );
  localStorage.setItem(PHRASES_KEY, JSON.stringify(phrases));
}

export function getTestAttempts(): TestAttemptRecord[] {
  return safeParse<TestAttemptRecord[]>(localStorage.getItem(TEST_ATTEMPTS_KEY), []);
}

export function recordTestAttempt(record: TestAttemptRecord): void {
  const trimmed = [record, ...getTestAttempts()].slice(0, 2000);
  localStorage.setItem(TEST_ATTEMPTS_KEY, JSON.stringify(trimmed));
}

export function getRecallAttempts(): RecallAttemptRecord[] {
  return safeParse<RecallAttemptRecord[]>(localStorage.getItem(RECALL_ATTEMPTS_KEY), []);
}

export function recordRecallAttempt(record: RecallAttemptRecord): void {
  const trimmed = [record, ...getRecallAttempts()].slice(0, 2000);
  localStorage.setItem(RECALL_ATTEMPTS_KEY, JSON.stringify(trimmed));
}

export function getRecallSpeed(): number {
  const raw = Number(localStorage.getItem(RECALL_SPEED_KEY));
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_RECALL_SPEED;
}

export function setRecallSpeed(rate: number): void {
  localStorage.setItem(RECALL_SPEED_KEY, String(rate));
}
