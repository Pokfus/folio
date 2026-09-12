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

---

## The lazy bundles and the load bar (2026-09-12)

**Read this before changing `ensureData`'s counting or a bundle's `after` hook.** CLAUDE.md keeps the
rules; this is the bullet as it stood there, verbatim, with the request and the measured figures.

- **Lazy data bundles:** `DATA_BUNDLES` + `ensureData(name)` / `dataReady(name)` / `whenIdle(fn)` (defined
just above the ROUTER block). See the table in the File map for what's in each bundle. `ensureData`
resolves `true`/`false` and **never rejects**, so a fire-and-forget caller can't raise an unhandled
rejection; a failed bundle is retried on the next call. Consumers:
· **`PAGES.map`** holds a `.data-loading` placard until `world` + `atlas` land, then re-renders (`render()`
re-invokes the *current* page, so this covers `PAGES.findit` too). **It is the one placard with a
PROGRESS BAR** — see the next paragraph.
· ~~**`startMiniGlobe`** (home)~~ — **deleted with the home page's discovery row** (see `PAGES.home`),
so nothing on the home page fetches `world` any more. Its shape is still the one to copy for an
ornament that must not delay first paint: fetch at IDLE, skip entirely under
`navigator.connection.saveData`, and stop on `root.isConnected`.
· **Settings' home-location picker** holds just the current home until `world` arrives, then fills.
· **`loadLangData`** pulls `uiI18n` + `glossI18n` whenever the language isn't English.
**THE LOAD BAR COUNTS FILES, NOT BYTES** (`dlBarHTML(names)` / `wireDlBar(host, names)` / `_bundleWatch`
/ `bundleFileCount` / `bundleDoneCount` / `watchBundles`, beside `ensureData`; `.dl-bar` in styles.css.
Aug 2026, on request: "when there are loadscreens, can we add a load bar"). `ensureData` counts each
file as it settles — **whichever way it settles**, so a bar cannot stall on a failed bundle whose caller
is about to paint a failure state — and notifies whatever is watching that bundle. Three decisions.
**Bytes are impossible here and that is a CSP fact rather than an omission**: reading a download's
progress means `fetch()` plus running the text yourself, i.e. an inline script, and `script-src 'self'`
holds only because there are no inline scripts (see `_headers`). Per-file is what can be counted
honestly, so per-file is what is shown. **A bar is DETERMINATE or it is nothing**: `dlBarHTML` returns
`""` below two files, so a single-file bundle (a book, `usstates`) keeps its spinner rather than showing
a bar that jumps 0 → 100 and has told the reader nothing. The Atlas — the load anybody actually waits
for — is twelve files, and measured in a browser it steps 8, 17, 25, 33, 42, 50, 67, 75, 83, 92.
**And the fill TRANSITIONS its width**, so the global reduced-motion killswitch already lands it on its
true value with no rule of its own; `wireDlBar` takes itself off the watch list when its bar leaves the
document, the self-stopping shape `startMiniGlobe` uses.
**NO COMMITTED SUITE GUARDS IT, and that is worth knowing before trusting it**: the bar lives on the
Atlas's own load screen, which is gone within a second or two of the page opening, so a browser test
would be racing the thing it measures. The figures above were read off a live run with the bundles
instrumented, and that is the check to repeat by hand after touching `ensureData`'s counting.
**A bundle's `after` hook re-establishes what boot would have done had the file been present** — this is
the part that bites. `timeline.js` assigns `window.TIMELINE` over the empty array `applyAdminEdits()` left
at boot, so the atlas hook re-applies `ADMIN_EDITS.timeline` on top or **the admin's working era set is
silently lost**; a gloss language file arrives after `PRISTINE_GLOSS_I18N` was snapshotted empty, so its hook
(`glossI18nIngest`) re-seeds that baseline (revert/undo compare against it) and re-applies the `glossaryI18n`
deltas. Because those files are **per language** the hook runs once per language and the baseline accumulates —
and it drains a QUEUE (`window.GLOSSARY_I18N_IN`), not a single slot, so two languages whose scripts land before
either hook both get seeded. Any new lazy file whose global is read at boot needs the same treatment.
