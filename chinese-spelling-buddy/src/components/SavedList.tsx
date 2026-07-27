import { useMemo } from 'react';
import { ChevronDown, FileText, Trash2 } from 'lucide-react';
import { groupByDay } from '../lib/groupByDay';
import type { SavedPhrase } from '../types';

interface SavedListProps {
  phrases: SavedPhrase[];
  onOpen: (text: string) => void;
  onDelete: (id: string) => void;
}

export function SavedList({ phrases, onOpen, onDelete }: SavedListProps) {
  const dayGroups = useMemo(() => groupByDay(phrases), [phrases]);

  if (phrases.length === 0) {
    return <p className="empty-state">Nothing saved yet. Save a word or phrase from the Reader to see it here.</p>;
  }

  return (
    <div className="day-groups">
      {dayGroups.map((group, i) => (
        <details key={group.key} className="day-group" open={i === 0}>
          <summary className="day-group-summary">
            <span className="day-group-summary-left">
              {group.label} <span className="day-group-count">({group.items.length})</span>
            </span>
            <ChevronDown size={18} className="day-group-chevron" aria-hidden="true" />
          </summary>
          <div className="day-group-body">
            <ul className="saved-list">
              {group.items.map((p) => (
                <li key={p.id} className="saved-row">
                  <span className="saved-text">{p.text}</span>
                  <div className="saved-row-actions">
                    <button type="button" className="icon-btn" onClick={() => onOpen(p.text)} aria-label="Open in Reader">
                      <FileText size={18} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      onClick={() => onDelete(p.id)}
                      aria-label="Delete"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
    </div>
  );
}
