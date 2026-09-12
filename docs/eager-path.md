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

---

## The glossary split (2026-09-12)

**Read this before splitting anything off the eager path.** CLAUDE.md keeps the rules; this is the bullet
as it stood there, verbatim.

- `glossary-extra.js` + `.claude/split-glossary.js` + `.claude/gloss-io.js` — **the glossary is TWO
files.** `GLOSSARY_SOURCES` (786 KB) and `GLOSSARY_IMAGES` (523 KB) were 54% of `glossary.js`, which is
on the EAGER path, and **nothing reads either until a popup opens** — so they moved to
`glossary-extra.js`, fetched by the `glossExtra` bundle. It took **1.29 MB off the eager path** on the
day it shipped; **for what that path weighs NOW, run `node .claude/check-sizes.js`** — the two figures
once written here (8.80 → 7.51 MB raw, 2.45 → 2.16 gzipped) were four splits and a font migration out
of date within the month, which is the drift that script exists to end. What is worth stating is the
SAVING, which is a fact about this change and does not move.
· **IT STAGES ONTO A QUEUE (`window.GLOSSARY_EXTRA_IN`) RATHER THAN ASSIGNING**, exactly as
`i18n/gloss-<lang>.js` does, and `glossExtraIngest` drains it. app.js snapshots
`PRISTINE_GLOSS_SOURCES` / `PRISTINE_GLOSS_IMAGES` at boot, which is BEFORE this file lands — so a
plain assignment would leave the editor's revert baseline EMPTY and **"Revert" would delete a
shipped citation list instead of restoring it**. The hook re-seeds both baselines and then
**re-applies `ADMIN_EDITS` on top**, the same rule the `atlas` bundle follows for `window.TIMELINE`.
· **IT IS WARMED AT IDLE, NOT FETCHED ON THE FIRST POPUP** — popups are common and a reader should not
wait for a definition; the point is only to keep it off the path that blocks first paint.
`openGlossWin` re-fills its picture and Sources slots (and re-runs `wireFootnotes`) if the file lands
after a popup is already open, so the reader who beats the warm still gets both. It re-fills the
SLOTS rather than re-opening the popup, which would take away a scroll position and any nested term.
· **EVERY HELPER GOES THROUGH `.claude/gloss-io.js`** (`loadGlossary` / `writeGlossary`). Requiring
`glossary.js` alone now yields EMPTY tables: a READER then reports a fully-cited glossary as
uncited — `gloss-source-audit.js` did, on its first run after the split — and a WRITER
re-serialises what it loaded and **deletes 1.29 MB without erroring**. `writeGlossary` also STRIPS
either block from `glossary.js` if one creeps back in.
**AND THE QUEUE'S KEYS ARE THE GLOBALS' OWN NAMES.** A one-off inspection that reaches past
`gloss-io.js` has to read `window.GLOSSARY_EXTRA_IN[0].GLOSSARY_IMAGES` — not `.images`, and not
`window.GLOSSARY_IMAGES`, which the file never assigns. Both wrong forms return `undefined`, which
reads as *this term has no picture*: on that answer an existing illustration was overwritten in
Aug 2026 and had to be reverted. **A check that cannot tell an absent table from an absent entry is
worse than no check**, so confirm a table's SIZE before trusting what it says about one key.
· **`check-style.js` reads `glossary-extra.js` too**, and that is not housekeeping: rule 4 (BCE/CE)
sweeps the text a PICTURE carries, which is where most of the site's remaining "BC"s were, and the
whole images table moved out of its reach. Its citations mask now matches **both** block shapes —
`window.X = Object.assign(…)` and the new `var X = {…}` — since matching only the old one left every
citation exposed to `--fix`, the exact fault that mask exists for.
· **`node .claude/split-glossary.js --check` asserts the split is still intact, and CI runs it.** The
split itself was a LINE-RANGE MOVE rather than a re-serialisation, verified key-by-key before
anything was written, so the bytes that ship are the bytes that were reviewed.
· **A test that seeds `window.GLOSSARY_SOURCES` must wait for the bundle first** — `test-sources.js`
seeded before the warm landed and had its fixture Object.assign'd away, which fails as "the popup
lists 5 citations" and reads like a rendering bug rather than a race.
