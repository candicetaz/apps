import { lazy, Suspense, useEffect, useState } from 'react';
import { BookOpen, Bookmark, Headphones, Languages, PenLine, Trophy } from 'lucide-react';
import { loadDictionary } from './lib/dictionary';
import { filterToChineseAndPunctuation } from './lib/segment';
import { primeVoices } from './lib/speech';
import {
  createList,
  deleteList,
  deleteSavedPhrase,
  getLists,
  getSavedPhrases,
  renameList,
  savePhrase,
  setPhraseListIds,
} from './lib/storage';
import { ReaderView } from './components/ReaderView';
import { SavedList } from './components/SavedList';
import { InstallButton } from './components/InstallButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { Dictionary, SavedPhrase, ViewName, WordList } from './types';
import './App.css';

// A tab left open across a new deploy still holds an index.html that
// references hashed chunk filenames no longer on the server, so the first
// navigation to a code-split tab 404s. That isn't recoverable in place — the
// fix is a one-time automatic reload to pick up the current build.
// `chunk-reload-attempted` guards against a genuine repeatable load failure
// (e.g. offline) turning this into a refresh loop.
function withChunkReload<T>(modulePromise: Promise<T>): Promise<T> {
  return modulePromise
    .then((mod) => {
      sessionStorage.removeItem('chunk-reload-attempted');
      return mod;
    })
    .catch((err) => {
      if (!sessionStorage.getItem('chunk-reload-attempted')) {
        sessionStorage.setItem('chunk-reload-attempted', '1');
        window.location.reload();
        return new Promise<T>(() => {});
      }
      throw err;
    });
}

// hanzi-writer (stroke rendering + quiz grading) is only needed once the
// user opens Practise, so it's split into its own chunk instead of bloating
// the bundle every visitor downloads.
const TestMode = lazy(() => withChunkReload(import('./components/TestMode').then((m) => ({ default: m.TestMode }))));
const RecallMode = lazy(() =>
  withChunkReload(import('./components/RecallMode').then((m) => ({ default: m.RecallMode }))),
);
const ProgressView = lazy(() =>
  withChunkReload(import('./components/ProgressView').then((m) => ({ default: m.ProgressView }))),
);

function App() {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [dictError, setDictError] = useState<string | null>(null);
  const [view, setView] = useState<ViewName>('reader');
  const [readerText, setReaderText] = useState('');
  const [practisePhrase, setPractisePhrase] = useState<SavedPhrase | null>(null);
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>(() => getSavedPhrases());
  const [lists, setLists] = useState<WordList[]>(() => getLists());

  useEffect(() => {
    primeVoices();
    loadDictionary()
      .then(setDict)
      .catch((err: Error) => setDictError(err.message));
  }, []);

  function refreshSaved() {
    setSavedPhrases(getSavedPhrases());
  }

  function handleReaderTextChange(text: string) {
    setReaderText(filterToChineseAndPunctuation(text));
  }

  function handleSave(text: string) {
    savePhrase(text);
    refreshSaved();
  }

  function handleOpenInReader(text: string) {
    handleReaderTextChange(text);
    setView('reader');
  }

  function handlePractisePhrase(phrase: SavedPhrase | null) {
    setPractisePhrase(phrase);
    setView('practise');
  }

  function handleDelete(id: string) {
    deleteSavedPhrase(id);
    refreshSaved();
    if (practisePhrase?.id === id) setPractisePhrase(null);
  }

  function handleSetPhraseListIds(phraseId: string, listIds: string[]) {
    setPhraseListIds(phraseId, listIds);
    refreshSaved();
  }

  function handleCreateList(name: string): WordList {
    const list = createList(name);
    setLists(getLists());
    return list;
  }

  function handleRenameList(id: string, name: string) {
    renameList(id, name);
    setLists(getLists());
  }

  function handleDeleteList(id: string) {
    deleteList(id);
    setLists(getLists());
    refreshSaved();
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">
          <Languages aria-hidden="true" size={24} /> Chinese Spelling Buddy
        </h1>
        <nav className="app-nav">
          <button
            type="button"
            className={`nav-btn ${view === 'reader' ? 'nav-btn-active' : ''}`}
            onClick={() => setView('reader')}
          >
            <BookOpen size={19} aria-hidden="true" />
            <span className="nav-label">Reader</span>
          </button>
          <button
            type="button"
            className={`nav-btn ${view === 'saved' ? 'nav-btn-active' : ''}`}
            onClick={() => setView('saved')}
          >
            <Bookmark size={19} aria-hidden="true" />
            <span className="nav-label">My List</span>
          </button>
          <button
            type="button"
            className={`nav-btn ${view === 'practise' ? 'nav-btn-active' : ''}`}
            onClick={() => setView('practise')}
          >
            <PenLine size={19} aria-hidden="true" />
            <span className="nav-label">Practise</span>
          </button>
          <button
            type="button"
            className={`nav-btn ${view === 'test' ? 'nav-btn-active' : ''}`}
            onClick={() => setView('test')}
          >
            <Headphones size={19} aria-hidden="true" />
            <span className="nav-label">Test</span>
          </button>
          <button
            type="button"
            className={`nav-btn ${view === 'progress' ? 'nav-btn-active' : ''}`}
            onClick={() => setView('progress')}
          >
            <Trophy size={19} aria-hidden="true" />
            <span className="nav-label">Progress</span>
          </button>
        </nav>
        <InstallButton />
      </header>

      <main className="app-main">
        {dictError && (
          <p className="error-state">
            Couldn't load the dictionary ({dictError}). Check your connection and reload the page.
          </p>
        )}

        {!dict && !dictError && <p className="loading-state">Loading dictionary…</p>}

        <ErrorBoundary key={view}>
          {dict && view === 'reader' && (
            <ReaderView dict={dict} text={readerText} onTextChange={handleReaderTextChange} onSave={handleSave} />
          )}

          {dict && view === 'saved' && (
            <SavedList
              phrases={savedPhrases}
              dict={dict}
              lists={lists}
              onOpen={handleOpenInReader}
              onDelete={handleDelete}
              onSetPhraseListIds={handleSetPhraseListIds}
              onCreateList={handleCreateList}
              onRenameList={handleRenameList}
              onDeleteList={handleDeleteList}
            />
          )}

          {view === 'practise' && (
            <Suspense fallback={<p className="loading-state">Loading Practise…</p>}>
              <TestMode
                savedPhrases={savedPhrases}
                phrase={practisePhrase}
                onPickPhrase={handlePractisePhrase}
                onGoToReader={() => setView('reader')}
              />
            </Suspense>
          )}

          {dict && view === 'test' && (
            <Suspense fallback={<p className="loading-state">Loading Test…</p>}>
              <RecallMode savedPhrases={savedPhrases} dict={dict} onGoToReader={() => setView('reader')} />
            </Suspense>
          )}

          {view === 'progress' && (
            <Suspense fallback={<p className="loading-state">Loading progress…</p>}>
              <ProgressView />
            </Suspense>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
