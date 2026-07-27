import { useMemo, useState } from 'react';
import { Bookmark, ChevronDown, Tag, Trash2 } from 'lucide-react';
import { segmentAndAnnotate } from '../lib/segment';
import { groupByDay } from '../lib/groupByDay';
import { WordDetailPanel } from './WordDetailPanel';
import { ListManagerPanel } from './ListManagerPanel';
import type { Dictionary, SavedPhrase, WordList } from '../types';

interface SavedListProps {
  phrases: SavedPhrase[];
  dict: Dictionary;
  lists: WordList[];
  onOpen: (text: string) => void;
  onDelete: (id: string) => void;
  onSetPhraseListIds: (phraseId: string, listIds: string[]) => void;
  onCreateList: (name: string) => WordList;
  onRenameList: (id: string, name: string) => void;
  onDeleteList: (id: string) => void;
}

interface InlineDetail {
  text: string;
  pinyin: string | null;
  meanings: string[] | null;
}

export function SavedList({
  phrases,
  dict,
  lists,
  onOpen,
  onDelete,
  onSetPhraseListIds,
  onCreateList,
  onRenameList,
  onDeleteList,
}: SavedListProps) {
  const [inlineDetail, setInlineDetail] = useState<InlineDetail | null>(null);
  const [managingPhraseId, setManagingPhraseId] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const managingPhrase = phrases.find((p) => p.id === managingPhraseId) ?? null;

  const visiblePhrases = useMemo(
    () => (activeListId ? phrases.filter((p) => p.listIds.includes(activeListId)) : phrases),
    [phrases, activeListId],
  );
  const dayGroups = useMemo(() => groupByDay(visiblePhrases), [visiblePhrases]);

  if (phrases.length === 0) {
    return (
      <p className="empty-state">
        No saved phrases yet. Go to <strong>Reader</strong>, paste a phrase, and tap{' '}
        <span className="icon-inline">
          <Bookmark size={14} aria-hidden="true" /> Save to my list
        </span>
        .
      </p>
    );
  }

  function handleTap(text: string) {
    // A single word/phrase has exactly one meaning to show, so it's shown
    // right here without leaving the list; a multi-word sentence has no one
    // obvious meaning, so that still opens the full breakdown in Reader.
    const chineseSegments = segmentAndAnnotate(text, dict).filter((s) => s.isChinese);
    if (chineseSegments.length === 1) {
      const seg = chineseSegments[0];
      setInlineDetail({ text: seg.text, pinyin: seg.pinyin, meanings: seg.meanings });
    } else {
      onOpen(text);
    }
  }

  function toggleListOnManagingPhrase(listId: string) {
    if (!managingPhrase) return;
    const has = managingPhrase.listIds.includes(listId);
    const next = has ? managingPhrase.listIds.filter((id) => id !== listId) : [...managingPhrase.listIds, listId];
    onSetPhraseListIds(managingPhrase.id, next);
  }

  function handleDeleteList(id: string) {
    onDeleteList(id);
    if (activeListId === id) setActiveListId(null);
  }

  return (
    <>
      {lists.length > 0 && (
        <div className="list-filter-row" role="tablist" aria-label="Filter by list">
          <button
            type="button"
            className={`list-filter-chip ${activeListId === null ? 'list-filter-chip-active' : ''}`}
            onClick={() => setActiveListId(null)}
          >
            All
          </button>
          {lists.map((list) => (
            <button
              type="button"
              key={list.id}
              className={`list-filter-chip ${activeListId === list.id ? 'list-filter-chip-active' : ''}`}
              onClick={() => setActiveListId(list.id)}
            >
              {list.name}
            </button>
          ))}
        </div>
      )}

      {visiblePhrases.length === 0 ? (
        <p className="empty-state">No words in this list yet. Tap the tag icon on a saved word to add it here.</p>
      ) : (
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
                      <button type="button" className="saved-text saved-text-btn" onClick={() => handleTap(p.text)}>
                        {p.text}
                      </button>
                      <div className="saved-row-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setManagingPhraseId(p.id)}
                          aria-label={`Manage lists for "${p.text}"`}
                        >
                          <Tag size={18} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          onClick={() => onDelete(p.id)}
                          aria-label={`Delete "${p.text}"`}
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
      )}

      {inlineDetail && (
        <WordDetailPanel
          text={inlineDetail.text}
          pinyin={inlineDetail.pinyin}
          meanings={inlineDetail.meanings}
          dict={dict}
          onClose={() => setInlineDetail(null)}
        />
      )}

      {managingPhrase && (
        <ListManagerPanel
          phrase={managingPhrase}
          lists={lists}
          onToggleList={toggleListOnManagingPhrase}
          onCreateList={onCreateList}
          onRenameList={onRenameList}
          onDeleteList={handleDeleteList}
          onClose={() => setManagingPhraseId(null)}
        />
      )}
    </>
  );
}
