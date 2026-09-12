# The eager load path, and the two splits taken off it

**Read this before splitting anything off the eager path.** `CLAUDE.md`'s File map carries the rules —
what each split file holds, the queue-not-assignment rule, the single-IO-module rule and the `--check`
guards. This file carries the accounts behind them, moved out of CLAUDE.md verbatim.

## The artefact split (2026-09-12)

- `artefacts-extra.js` + `.claude/split-artefacts.js` + `.claude/artefact-io.js` — **the artefact pool
is TWO files**, and it is the glossary split below in miniature. `desc`, `sources` and `image` were
**237.5 KB of `artefacts.js`'s 251 — 94%** — on the EAGER path, and **not one of them is read until a
chest opens or the Reliquary is visited**; the only boot-adjacent reader of the pool is `progStats`,
which counts legendaries and so needs `rarity` alone. The eager file went **262.8 KB → 19.2 KB**.
· **IT MERGES BACK INTO `window.ARTEFACTS` AND THEN REBUILDS** (`artefactExtraIngest`), where the
glossary's hook re-seeds a separate PRISTINE snapshot. The reason is that the artefact pool has no
such snapshot: `window.ARTEFACTS` **IS** the revert baseline — `artefactIsShipped` and
`revertArtefact` read it directly and `artefactsMerged` re-applies `ADMIN_EDITS` over it on every
call — so merging into it and calling `refreshArtefacts()` is what puts the overlay back on top of
what just landed. Without it, Admin → Artefacts' **Revert would compare a real description against
nothing and DELETE it**. Guarded by a browser check in the split's own commit.
· **IT STAGES ONTO A QUEUE** (`window.ARTEFACTS_EXTRA_IN`), for the reason `glossary-extra.js` does,
and **an id the INDEX does not carry is not resurrected**: the index decides the pool, so a row left
behind by a retired artefact must not walk back in carrying only prose.
· **EVERY HELPER GOES THROUGH `.claude/artefact-io.js`** (`loadArtefacts` / `writeArtefacts`).
Requiring `artefacts.js` alone now yields entries with EMPTY prose: a READER then reports a fully
cited pool as uncited — **`test-artefacts.js` did exactly that on its first run after the split,
printing `0 of 100 cited` while 80 assertions passed over an empty list** — and a WRITER
re-serialises what it loaded and **deletes 240 KB without erroring**. Eleven scripts were repointed.
`writeArtefacts` writes **BOTH files or neither**: they are joined on `id`, and an index entry with
no row in the extra is an artefact with no prose anywhere.
· **THE SHARED SERIALIZER ALSO CLOSED A LIVE BUG.** `add-artefact-sources.js` carried a private copy
that emitted an image as `{ src, credit, alt }` — written before the fullscreen viewer's `title` and
`desc` were added — so **one run of the citation tool would have stripped the caption off all 100
pictures** while doing its own job perfectly. A copy of a serializer goes stale on a change made in
another file by someone with no reason to look here; `add-images.js` had the same trap recorded
against it and now shares the module too.
· **`check-style.js` reads `artefacts-extra.js`**, and that is not housekeeping: rule 4 (BCE/CE) sweeps
the text a PICTURE carries as well as the prose, and the split moved BOTH out of its reach.
· **`node .claude/split-artefacts.js --check` asserts the split is still intact, and CI runs it** —
both directions of the join, no heavy field back in the index, and a byte-for-byte round trip. The
split itself REFUSED to write until it had re-loaded its own output and compared it field by field
against what it started with, so the bytes that ship are the bytes that were checked.
