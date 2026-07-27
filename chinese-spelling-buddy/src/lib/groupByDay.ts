import type { SavedPhrase } from '../types';

interface DayGroup {
  key: string;
  label: string;
  items: SavedPhrase[];
}

function dayLabel(date: Date, today: Date): string {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(date)) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Groups saved phrases (newest first) into "Today" / "Yesterday" / ... buckets. */
export function groupByDay(phrases: SavedPhrase[]): DayGroup[] {
  const today = new Date();
  const groups = new Map<string, DayGroup>();

  for (const phrase of phrases) {
    const date = new Date(phrase.createdAt);
    const key = date.toDateString();
    if (!groups.has(key)) {
      groups.set(key, { key, label: dayLabel(date, today), items: [] });
    }
    groups.get(key)!.items.push(phrase);
  }

  return Array.from(groups.values());
}
