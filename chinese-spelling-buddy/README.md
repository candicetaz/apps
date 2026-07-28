# Chinese Spelling Buddy

A study tool for Mandarin Chinese: paste (or photograph) a word, phrase, or
sentence to see pinyin and English meanings, hear it read aloud, save it to
a personal list, then practise writing it — either stroke-by-stroke per
character, or by ear as a listening/recall flashcard drill. Installable as
an offline-capable PWA.

## Views

- **Reader** — paste Chinese text, or tap **Scan a list** to photograph a
  worksheet/textbook page (OCR runs fully offline in the browser via
  PP-OCRv4 + ONNX Runtime Web — no server, no API key). Text is segmented
  into words with pinyin (context-aware, via `pinyin-pro`) and dictionary
  meanings (from CC-CEDICT). Tap a word for its full definition, hit "Read
  aloud" to hear the whole thing via the browser's speech synthesis, or
  save it (as one phrase, or split into individual words) to My List —
  optionally picking which custom list(s) to file it under right there in
  the save dialog, or leaving it unfiled.
- **My List** — saved phrases grouped by day. Tap a single saved word to
  preview its meaning right there; tap a multi-word phrase to open it in
  Reader instead. Organize words into any number of custom lists (a word
  can belong to several at once, e.g. both "HSK1" and "Animals") via the
  tag icon on each row, and filter the view down to one list with the chips
  at the top. **Select** switches into multi-select mode to mass-assign
  several words to a list (or lists) at once. Delete words or whole lists
  from the same places.
- **Practise** — stroke-order writing quiz per character, powered by
  `hanzi-writer` against a locally-bundled stroke-data set (no third-party
  CDN dependency). Mistakes are tracked; "Show me how" replays the correct
  stroke order.
- **Test** — audio flashcard recall: pick saved phrases, choose whether to
  drill them as individual words or as whole sentences, listen, write the
  answer by hand in the scratch pad, then reveal and mark whether you knew
  it. Missed cards resurface later in the same session.
- **Progress** — a level/XP system (7 levels from "Sprout" to "Grand
  Scholar"), a day streak counter, stats (words known, characters
  practiced, perfect characters), and 9 unlockable badges — all computed
  from local Test/Practise history.

Tapping a word (in Reader, or after revealing an answer in Test) also shows
"Creative ways to remember" — a per-character mnemonic built from
[Make Me a Hanzi](https://github.com/skishore/makemeahanzi) decomposition
data: a human-written etymology hint where one exists, otherwise a
generated "built from X + Y" breakdown using the components' own dictionary
meanings.

Everything is stored locally (`localStorage`) — no account, no backend.

## Fixed: writing area missing in "whole sentences" mode

In `Test` mode, the handwriting scratch pad (`FreehandCanvas`) used to only
render for single-word cards. Selecting **Whole sentences** built cards with
a `phrase:`-prefixed id, and the canvas was gated behind
`!current.id.startsWith('phrase:')` — so switching to whole-sentence mode
silently dropped the writing area with no fallback. `RecallMode.tsx` now
always renders the canvas for the current card, regardless of split mode.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks, then builds to dist/
npm run lint
```

`npm run dev` / `npm run build` first regenerate, from third-party sources
(see `THIRD_PARTY_NOTICES.md`), everything under `public/` that isn't
checked in: `dictionary.json`, `decomposition.json`, `hanzi-data/`, `ocr/`,
and `ort/`. All of it is gitignored — derived assets, not source.

`postinstall` runs `patch-package`, which fixes an invalid-UTF-8 byte
sequence in a transitive OCR dependency (`js-clipper`) that otherwise fails
the production build — see `THIRD_PARTY_NOTICES.md` for details.

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on pushes to
`main` that touch this folder.

## Known limitations / ideas for improvement

The CC-CEDICT dictionary won't have every proper noun or slang term.
Mnemonics only cover the ~9.5k characters Make Me a Hanzi has decomposition
data for, and only some of those have a human-written etymology hint — the
rest fall back to a generated "built from X + Y" breakdown. There's no
spaced-repetition scheduling across sessions (the retry queue in Test only
reshuffles within one sitting), and OCR accuracy on messy handwriting or
low-light photos will be well below print-quality text.
