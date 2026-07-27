# third_party/makemeahanzi-dictionary.txt

Vendored from the [Make Me a Hanzi](https://github.com/skishore/makemeahanzi)
project's `dictionary.txt` (fetched from the `master` branch). Used by
`scripts/build-decomposition.mjs` to generate `public/decomposition.json`,
which powers the "creative ways to remember" character mnemonics (see
`src/lib/mnemonics.ts`) — character decomposition (which components a
character is built from) plus, for some characters, a human-written
etymology hint.

Per that project's `COPYING` file, `dictionary.txt` is derived from Unihan
and CJKlib, and is licensed under the GNU Lesser General Public License v3
(or later) — see https://www.gnu.org/licenses/lgpl-3.0.html. This is a
straight copy (not modified), vendored here so builds don't depend on
network access to GitHub at build time.
