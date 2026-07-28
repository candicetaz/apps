import { useMemo, useState } from 'react';
import { Bookmark, CheckCircle2, Grid2x2, Pause, Play, Volume2, X } from 'lucide-react';
import { segmentAndAnnotate } from '../lib/segment';
import { isSpeechSupported } from '../lib/speech';
import { useSpeechPlayback } from '../lib/useSpeechPlayback';
import { CameraScan } from './CameraScan';
import { WordDetailPanel } from './WordDetailPanel';
import { ListPickerPanel } from './ListPickerPanel';
import type { Dictionary, WordList } from '../types';

const READ_ALOUD_RATE = 0.85;

interface ReaderViewProps {
  dict: Dictionary;
  text: string;
  onTextChange: (text: string) => void;
  onSave: (text: string, listIds: string[]) => void;
  lists: WordList[];
  onCreateList: (name: string) => WordList;
  onRenameList: (id: string, name: string) => void;
  onDeleteList: (id: string) => void;
}

export function ReaderView({
  dict,
  text,
  onTextChange,
  onSave,
  lists,
  onCreateList,
  onRenameList,
  onDeleteList,
}: ReaderViewProps) {
  const segments = useMemo(() => segmentAndAnnotate(text, dict), [text, dict]);
  const { isSpeaking, isPaused, highlightIndex, play, togglePause } = useSpeechPlayback();

  // Running start-offset (character index into `text`) of each segment, so
  // whichever word is currently being read aloud can be highlighted.
  const segmentOffsets = useMemo(() => {
    let offset = 0;
    return segments.map((seg) => {
      const start = offset;
      offset += seg.text.length;
      return start;
    });
  }, [segments]);

  const readingIndex = useMemo(() => {
    if (!isSpeaking || highlightIndex < 0) return -1;
    for (let i = segments.length - 1; i >= 0; i--) {
      if (segmentOffsets[i] <= highlightIndex) return i;
    }
    return -1;
  }, [isSpeaking, highlightIndex, segments, segmentOffsets]);

  const [selected, setSelected] = useState<number | null>(null);
  const [savedFlash, setSavedFlash] = useState<{ count: number } | null>(null);
  const [splitFlash, setSplitFlash] = useState<{ count: number } | null>(null);
  // Which save action is pending confirmation in the list picker — null
  // when the picker is closed.
  const [pendingSaveKind, setPendingSaveKind] = useState<'phrase' | 'words' | null>(null);
  const [pickerListIds, setPickerListIds] = useState<string[]>([]);

  const hasText = text.trim().length > 0;
  const speechSupported = isSpeechSupported();

  function confirmSave() {
    if (pendingSaveKind === 'phrase') {
      // Each line break is a separate sentence/phrase, so pasting a list of
      // words saves them individually instead of as one blob.
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.length > 0) {
        lines.forEach((line) => onSave(line, pickerListIds));
        setSavedFlash({ count: lines.length });
        setTimeout(() => setSavedFlash(null), 1600);
      }
    } else if (pendingSaveKind === 'words') {
      const uniqueWords: string[] = [];
      const seen = new Set<string>();
      for (const seg of segments) {
        if (seg.isChinese && !seen.has(seg.text)) {
          seen.add(seg.text);
          uniqueWords.push(seg.text);
        }
      }
      if (uniqueWords.length > 0) {
        // Each save prepends to the top of My List, so saving in reverse
        // order leaves the first word on top, matching reading order.
        [...uniqueWords].reverse().forEach((word) => onSave(word, pickerListIds));
        setSplitFlash({ count: uniqueWords.length });
        setTimeout(() => setSplitFlash(null), 1600);
      }
    }
    setPendingSaveKind(null);
  }

  function togglePickerList(listId: string) {
    setPickerListIds((prev) => (prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]));
  }

  return (
    <div className="reader">
      <div className="reader-input-wrap">
        <textarea
          className="reader-input"
          placeholder="粘贴中文短语或句子…&#10;(Paste a Chinese phrase or sentence here)"
          value={text}
          onChange={(e) => {
            onTextChange(e.target.value);
            setSelected(null);
          }}
          rows={4}
        />
        {hasText && (
          <button
            type="button"
            className="reader-clear-btn"
            onClick={() => {
              onTextChange('');
              setSelected(null);
            }}
            aria-label="Clear text"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="reader-toolbar">
        <CameraScan
          onConfirm={(lines) => {
            onTextChange(lines.join('\n'));
            setSelected(null);
          }}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => (isSpeaking ? togglePause() : play(text, READ_ALOUD_RATE))}
          disabled={!hasText || !speechSupported}
        >
          {!isSpeaking ? <Volume2 size={18} aria-hidden="true" /> : isPaused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
          Read aloud
        </button>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => {
            setPickerListIds([]);
            setPendingSaveKind('phrase');
          }}
          disabled={!hasText}
        >
          {savedFlash ? (
            <>
              <CheckCircle2 size={18} aria-hidden="true" />
              {savedFlash.count > 1 ? `Saved ${savedFlash.count} phrases!` : 'Saved!'}
            </>
          ) : (
            <>
              <Bookmark size={18} aria-hidden="true" />
              Save to my list
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => {
            setPickerListIds([]);
            setPendingSaveKind('words');
          }}
          disabled={!hasText}
        >
          {splitFlash ? (
            <>
              <CheckCircle2 size={18} aria-hidden="true" />
              {splitFlash.count > 1 ? `Saved ${splitFlash.count} words!` : 'Saved!'}
            </>
          ) : (
            <>
              <Grid2x2 size={18} aria-hidden="true" />
              Split into words
            </>
          )}
        </button>
      </div>

      {!speechSupported && (
        <p className="hint-text">Your browser doesn't support reading text aloud — try Chrome, Edge, or Safari.</p>
      )}

      {hasText && (
        <div className="segments" role="list">
          {segments.map((seg, idx) =>
            seg.isChinese ? (
              <button
                type="button"
                key={idx}
                role="listitem"
                className={`chip ${selected === idx ? 'chip-selected' : ''} ${idx === readingIndex ? 'chip-reading' : ''}`}
                onClick={() => setSelected(selected === idx ? null : idx)}
              >
                <span className="chip-pinyin">{seg.pinyin}</span>
                <span className="chip-hanzi">{seg.text}</span>
              </button>
            ) : (
              <span key={idx} className="plain-text">
                {seg.text}
              </span>
            ),
          )}
        </div>
      )}

      {!hasText && (
        <p className="empty-state">
          Paste a Chinese word, phrase, or sentence above to see pinyin, tap a word for its meaning, and hear it read aloud.
        </p>
      )}

      {selected !== null && segments[selected] && (
        <WordDetailPanel
          text={segments[selected].text}
          pinyin={segments[selected].pinyin}
          meanings={segments[selected].meanings}
          dict={dict}
          onClose={() => setSelected(null)}
        />
      )}

      {pendingSaveKind && (
        <ListPickerPanel
          title={pendingSaveKind === 'phrase' ? 'Save to lists' : 'Save words to lists'}
          subtitle="Optional — leave none picked to save unfiled"
          lists={lists}
          selectedListIds={pickerListIds}
          onToggleList={togglePickerList}
          onCreateList={onCreateList}
          onRenameList={onRenameList}
          onDeleteList={onDeleteList}
          onConfirm={confirmSave}
          confirmLabel="Save"
          onClose={() => setPendingSaveKind(null)}
        />
      )}
    </div>
  );
}
