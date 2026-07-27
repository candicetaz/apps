import type { Dictionary } from '../types';

// Built by scripts/build-dictionary.mjs from CC-CEDICT (see that script for
// the filtering rules) and served as a static asset so it's fetched once and
// then cached by the browser like any other file.
export async function loadDictionary(): Promise<Dictionary> {
  const res = await fetch(`${import.meta.env.BASE_URL}dictionary.json`);
  if (!res.ok) throw new Error(`dictionary.json request failed (${res.status})`);
  return (await res.json()) as Dictionary;
}
