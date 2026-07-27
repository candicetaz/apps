import type { RecallAttemptRecord, SavedPhrase, TestAttemptRecord } from '../types';

// Everything lives in localStorage — no accounts, no backend, no sync.
// Data stays on this one device/browser.

const PHRASES_KEY = 'csb.savedPhrases.v1';
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
  return safeParse<SavedPhrase[]>(localStorage.getItem(PHRASES_KEY), []);
}

export function savePhrase(text: string): SavedPhrase {
  const trimmed = text.trim();
  const phrases = getSavedPhrases();

  // Re-saving the same text bumps it to the top instead of duplicating it.
  const existing = phrases.find((p) => p.text === trimmed);
  if (existing) {
    const rest = phrases.filter((p) => p.id !== existing.id);
    const bumped = { ...existing, createdAt: Date.now() };
    localStorage.setItem(PHRASES_KEY, JSON.stringify([bumped, ...rest]));
    return bumped;
  }

  const phrase: SavedPhrase = { id: newId(), text: trimmed, createdAt: Date.now() };
  localStorage.setItem(PHRASES_KEY, JSON.stringify([phrase, ...phrases]));
  return phrase;
}

export function deleteSavedPhrase(id: string): void {
  localStorage.setItem(PHRASES_KEY, JSON.stringify(getSavedPhrases().filter((p) => p.id !== id)));
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

export interface CharacterStat {
  char: string;
  attempts: number;
  correct: number;
}

export function getCharacterStats(): CharacterStat[] {
  const byChar = new Map<string, CharacterStat>();
  for (const a of getTestAttempts()) {
    const stat = byChar.get(a.char) ?? { char: a.char, attempts: 0, correct: 0 };
    stat.attempts += 1;
    if (a.correct) stat.correct += 1;
    byChar.set(a.char, stat);
  }
  return Array.from(byChar.values()).sort((a, b) => a.correct / a.attempts - b.correct / b.attempts);
}
