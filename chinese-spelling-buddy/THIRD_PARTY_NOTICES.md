# Third-party notices

This app bundles/fetches data and models from a few third-party projects at
build time. None of it is modified except where noted.

## CC-CEDICT (via `cedict-json`)

`scripts/build-dictionary.mjs` generates `public/dictionary.json` from the
[`cedict-json`](https://www.npmjs.com/package/cedict-json) npm package, a
JSON-ified copy of [CC-CEDICT](https://cc-cedict.org/) — CC BY-SA 4.0.

## Make Me a Hanzi

`scripts/build-decomposition.mjs` generates `public/decomposition.json` from
the vendored `third_party/makemeahanzi-dictionary.txt` — see
`third_party/README.md`. LGPL-3.0-or-later.

## hanzi-writer-data

`scripts/build-hanzi-data.mjs` copies per-character stroke data (also
originally derived from Make Me a Hanzi) from the
[`hanzi-writer-data`](https://www.npmjs.com/package/hanzi-writer-data) npm
package into `public/hanzi-data/`. Licensed under the Arphic Public License
(see that package's `ARPHICPL.TXT`).

## PP-OCRv4 models (via `@gutenye/ocr-models`)

`scripts/build-ocr-assets.mjs` copies the PaddleOCR PP-OCRv4 detection and
recognition ONNX models, plus the character dictionary, from
[`@gutenye/ocr-models`](https://www.npmjs.com/package/@gutenye/ocr-models)
into `public/ocr/`, and copies the ONNX Runtime Web WASM backend from
[`onnxruntime-web`](https://www.npmjs.com/package/onnxruntime-web) into
`public/ort/`. Both MIT licensed.

## `js-clipper` patch

`patches/js-clipper+1.0.1.patch` (applied automatically via `patch-package`
on `npm install`) fixes a handful of comment-only bytes in
`node_modules/js-clipper/clipper.js` (a transitive dependency of
`@gutenye/ocr-common`) that are invalid UTF-8 — Latin-1-encoded superscript
digits (¹ ² ³) inside a math comment, left over from however that file was
originally saved. They break newer bundlers that validate UTF-8 strictly.
The patch just replaces those bytes with plain ASCII digits; no logic is
touched.
