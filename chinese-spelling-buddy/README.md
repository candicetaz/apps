# Chinese Spelling Buddy

A study tool for Mandarin Chinese: paste a word, phrase, or sentence to see
pinyin and English meanings, hear it read aloud, save it to a personal list,
then practise writing it — either stroke-by-stroke per character, or by ear
as a listening/recall flashcard drill.

## Views

- **Reader** — paste Chinese text. It's segmented into words with pinyin
  (context-aware, via `pinyin-pro`) and dictionary meanings (from
  CC-CEDICT). Tap a word for its full definition, hit "Read aloud" to hear
  the whole thing via the browser's speech synthesis, or save it (as one
  phrase, or split into individual words) to My List.
- **My List** — saved phrases grouped by day, reopen in Reader or delete.
- **Practise** — stroke-order writing quiz per character, powered by
  `hanzi-writer`. Mistakes are tracked; "Show me how" replays the correct
  stroke order.
- **Test** — audio flashcard recall: pick saved phrases, choose whether to
  drill them as individual words or as whole sentences, listen, write the
  answer by hand in the scratch pad, then reveal and mark whether you knew
  it. Missed cards resurface later in the same session.
- **Progress** — aggregate stats pulled from local practice history.

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

`npm run dev` / `npm run build` first regenerate `public/dictionary.json`
(from the `cedict-json` package, see `scripts/build-dictionary.mjs`) and
`public/decomposition.json` (from the vendored
`third_party/makemeahanzi-dictionary.txt`, see
`scripts/build-decomposition.mjs`) — both are gitignored since they're
derived assets, not source.

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on pushes to
`main` that touch this folder.

## Known limitations / ideas for improvement

Short version: stroke data for Practise loads from a CDN at runtime (no
bundled offline stroke set), there's no OCR/camera-scan input, no
spaced-repetition scheduling, and the CC-CEDICT dictionary won't have every
proper noun or slang term. Mnemonics only cover the ~9.5k characters Make Me
a Hanzi has decomposition data for, and only some of those have a
human-written etymology hint — the rest fall back to a generated
"built from X + Y" breakdown.
