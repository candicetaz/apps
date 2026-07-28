import { useState } from 'react';
import { Check, ListPlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { WordList } from '../types';

interface ListPickerPanelProps {
  title: string;
  subtitle?: string;
  lists: WordList[];
  selectedListIds: string[];
  onToggleList: (listId: string) => void;
  onCreateList: (name: string) => WordList;
  onRenameList: (id: string, name: string) => void;
  onDeleteList: (id: string) => void;
  onConfirm: () => void;
  confirmLabel: string;
  onClose: () => void;
}

/**
 * A "pick which lists apply, optionally create new ones, then confirm"
 * panel. Used both when saving from Reader (choose lists before the phrase
 * exists yet) and for bulk-assigning several already-saved words to a list
 * at once — in both cases nothing is written until the confirm button is
 * pressed, unlike ListManagerPanel's per-word immediate toggle.
 */
export function ListPickerPanel({
  title,
  subtitle,
  lists,
  selectedListIds,
  onToggleList,
  onCreateList,
  onRenameList,
  onDeleteList,
  onConfirm,
  confirmLabel,
  onClose,
}: ListPickerPanelProps) {
  const [newListName, setNewListName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    const list = onCreateList(name);
    onToggleList(list.id);
    setNewListName('');
  }

  function startRename(list: WordList) {
    setRenamingId(list.id);
    setRenameValue(list.name);
  }

  function commitRename(e: React.FormEvent) {
    e.preventDefault();
    if (!renamingId) return;
    onRenameList(renamingId, renameValue);
    setRenamingId(null);
  }

  return (
    <>
      <div className="detail-backdrop" onClick={onClose} />
      <div className="detail-panel">
        <div className="detail-header">
          <div className="detail-heading">
            <span className="icon-inline list-manager-title">
              <ListPlus size={18} aria-hidden="true" /> {title}
            </span>
            {subtitle && <span className="detail-pinyin">{subtitle}</span>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {lists.length === 0 && <p className="hint-text">No lists yet — create one below.</p>}

        <ul className="list-manager-items">
          {lists.map((list) => {
            const checked = selectedListIds.includes(list.id);
            return (
              <li key={list.id} className="list-manager-row">
                {renamingId === list.id ? (
                  <form className="list-manager-rename-form" onSubmit={commitRename}>
                    <input
                      className="list-manager-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      autoFocus
                      onBlur={commitRename}
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    className={`list-manager-toggle ${checked ? 'list-manager-toggle-checked' : ''}`}
                    onClick={() => onToggleList(list.id)}
                    aria-pressed={checked}
                  >
                    <span className="list-manager-checkbox">{checked && <Check size={14} aria-hidden="true" />}</span>
                    {list.name}
                  </button>
                )}
                <div className="list-manager-row-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => startRename(list)}
                    aria-label={`Rename "${list.name}"`}
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    onClick={() => onDeleteList(list.id)}
                    aria-label={`Delete list "${list.name}"`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <form className="list-manager-new-form" onSubmit={handleCreate}>
          <input
            className="list-manager-input"
            placeholder="New list name…"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <button type="submit" className="btn btn-ghost" disabled={!newListName.trim()}>
            <Plus size={16} aria-hidden="true" /> Create
          </button>
        </form>

        <button type="button" className="btn btn-primary list-picker-confirm" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </>
  );
}
