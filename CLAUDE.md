# Folio — project guide for Claude Code

Folio is a study companion: an Anki-style flashcard site with spaced repetition, daily games, a
glossary, a library of whole books, an admin editor and an interactive globe. It is a plain static
website — open `index.html` and it runs. Hosted on Cloudflare Pages at https://folio.study; merging to `main` deploys.

**This file is deliberately short.** It used to be 930 KB and every session paid for all of it on every
step. Everything it used to say is in **`docs/reference.md`** — the archive of why every rule exists.
**📖 `docs/reference.md` — READ BEFORE TOUCHING ANYTHING IT NAMES, BY GREPPING FOR THAT NAME — NEVER
WHOLE.** Read only the paragraph around the hit. **📖 `docs/README.md` — READ BEFORE LOOKING FOR A DOC**: the index of
`docs/`, one line per file. Rules live here; reasoning lives in `docs/`.

## Working cheaply (read first — this is why the file is short)

- **Never read a large file whole.** `app.js` is ~3.5 MB, `data.js` and the `data-extra/` files are
  megabytes, `docs/reference.md` is 930 KB, the card plans are thousands of lines. Use `grep -n` and
  `sed -n 'A,Bp'`. `node .claude/app-map.js --find <name>` locates anything in `app.js`.
- **Read a doc only when a pointer below says to**, and only the section you need.
- **Before changing a function, grep `docs/reference.md` for its name** — that finds the rule, the
  fault it was written for, and the test that guards it, for the cost of a few lines.
- **Do the task asked, then stop.** No unrequested audits, refactors or sweeps. Report findings you
  trip over in one line rather than fixing them.
- **Prefer the helper scripts in `.claude/`** over hand edits of data files: they validate, splice one
  line, and are far cheaper than reading and rewriting a file.
- **Keep the final reply short**: what changed, what was verified, what was not.

## Which checks to run (and which to skip)

Every push runs CI (`.github/workflows/checks.yml`): the fast Node checks as a gate, and **every
Playwright browser suite** as a second opinion. So a session does not need to re-run what CI will run.

| the change | run locally | skip |
|---|---|---|
| Cards, glossary terms, date lines, sources (content only) | the add/fix helper's own validation, then `node .claude/check-style.js`, `node .claude/check-questions.js`, `node .claude/test-card-plans.js` | all browser suites |
| Docs, plans, `CLAUDE.md` | `node .claude/check-docs.js`, `node .claude/test-card-plans.js` | everything else |
| JS logic with no visible change | `node --check app.js` + the ONE suite that guards it (grep `docs/reference.md` for the function's name to find its "Re-run after touching" line) | the other suites |
| Anything a reader SEES (layout, CSS, a new control) | `node --check app.js` + the one relevant browser suite + one screenshot | the rest |
| Before merging a big thread | nothing extra — read CI's result on the PR | — |

The user can override in a prompt: **"skip tests"** means syntax check only; **"full tests"** means run
every relevant suite. Playwright and Chromium are preinstalled in cloud sessions
(`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; never `playwright install`).

## Golden rules

- **No remote dependencies, vanilla JS, no build step.** No frameworks, bundlers, npm packages,
  `node_modules` or CDN scripts in the site. It must work from `index.html` directly. No inline
  `<script>`, no `eval` / `new Function` in the site (the CSP in `_headers` depends on it; never relax it).
  **The one exception is a vendored library** (Oct 2026): a small library under a permissive licence
  (MIT, BSD, ISC or Apache-2.0 — never GPL/LGPL/AGPL, non-commercial or share-alike) MAY be copied into
  `vendor/` as a plain, unminified or source-mapped JS file and loaded like any other script, when the
  task's PR says why. Each file has a `vendor/<name>.LICENSE` beside it and a row in `vendor/README.md`
  (name, version, upstream URL, licence, why). Vendored files are lazy (`DATA_BUNDLES` / `ensureData`)
  unless a reader needs them at boot. The offline generators in `.claude/` may use ANY Node library:
  their output is data files and the library never ships — install it outside the repo and reach it
  through `NODE_PATH`, exactly as Playwright is. 📖 `docs/reference.md` "Vendored libraries" has the reasoning.
- **Touch only what the task needs.** Small, surgical diffs. Don't reformat or rename unrelated code.
- **Never fabricate content.** No invented dates, names, figures, citations, authors, DOIs or page
  numbers. If a claim cannot be sourced, soften it or drop it, and say so.
- **Be honest about scope and tradeoffs.** Flag limitations plainly.
- **Changelog + version, on every user-requested change that reaches readers.** Append ONE
  plain-English line to TODAY's entry in `changelog.js` (newest day first; create the day if missing)
  and bump `window.FOLIO_VERSION = { v, released }` at the top of the same file in the same commit.
  `v` is MAJOR.MINOR (minor +1 per release). **`released` is captured, never typed**:
  `date -u "+%Y-%m-%dT%H:%MZ"`. One sentence per item (~120 chars, max 200); one line per KIND of
  change per day (raise an existing "N new cards" line's count instead of adding a second); a day
  title is ≤72 characters (`check-style.js` rule 5). Card/glossary changes are described by count and
  deck only, never naming a card. Items render as HTML (`<b>`, `<i>` allowed). English only.
  **A community deck in `decks/` is not a change to Folio** — no line. **Docs/CLAUDE.md/tooling-only
  changes are not reader-facing** — no line, no bump. `sw.js`'s `VERSION` is a cache generation and is
  NOT bumped for a release. 📖 `docs/changelog-and-version.md` — READ BEFORE CHANGING HOW THE CHANGELOG OR VERSION WORKS.
- **English only** (`MULTILANG = false` in `app.js`). New content needs no translations; the content
  tools drop a supplied `i18n` block. Never put translations into an eager-path file.
- **Commit as you go; push to the branch you were given.** Never push to `main`.

## File map (the essentials)

- `index.html` — shell. **Eager scripts, in order:** `data.js → truefalse.js → quotes.js → whatyear.js →
  crossword.js → changelog.js → mission.js → glossary.js → artefacts.js →
  lang-decks.js → app.js` (read the real list from `index.html`). Sizes: `node .claude/check-sizes.js`
  — never quote a size.
- `app.js` — all logic, one IIFE, hash routing via `PAGES`. Navigate it with `.claude/app-map.js`.
- `styles.css` — design system; themes are CSS custom properties, **hex only** (the canvas globe parses
  them). A new theme adds no webfont and must override `.collection-deco`.
- `data.js` + `data-extra/<collection>.js` — the cards, **split in two**: `data.js` holds the light
  half (question, answer, date line, tags, difficulty, locator, war…), `data-extra/` the heavy half
  (abstract, sources, why, quote, image, the `questions` phrasing pool, and the Atlas v2 `places` ids). **Every helper goes through `.claude/card-io.js`**
  (`loadCards`/`writeCards`); a helper that evaluates `data.js` alone sees empty abstracts and does not
  fail. `writeCards` ignores tree edits — edit `COLLECTION_TREE` as text.
- `glossary.js` + `glossary-extra.js` — the glossary, split the same way: `glossary.js` holds every KEY (with
  an empty text) plus dates, aliases, tags; `glossary-extra.js` the definitions, citations and pictures. Ask
  `k in window.GLOSSARY`, never whether its text is truthy. Go through `.claude/gloss-io.js`.
- `artefacts.js` + `artefacts-extra.js` — the Reliquary pool; go through `.claude/artefact-io.js`.
- `countries.js`, `country-stats.js`, `country-spans.js`, `country-sources.js` (the place card's prose, bundle `atlas2prose`), `rivers.js`, `rivers/` (a river locator's own river) — map data,
  **lazy**; the rivers are generated by `.claude/build-rivers.js` / `build-hires-rivers.js` (never hand-edit generated files). **v1's data files are gone** (Phase 5: `world.js`, `timeline.js`, `polities.js`,
  the heightmaps, `us-states.js` … — `docs/atlas.md` §7 lists them, `git show f7aca62:<path>` has them); what the remaining scripts needed from them is frozen in `.claude/atlas-build/frozen/`.
- `books/<id>.js`, `books/<id>.<lang>.js` — Library texts, lazy, generated by `.claude/fetch-book.js`.
  📖 `docs/library-importer.md` — READ BEFORE ADDING A BOOK OR TOUCHING ANY EXTRACTOR.
- `decks/*.folio-deck.json` + `lang-decks.js` — language decks (re-run `.claude/build-lang-decks.js`
  after changing a deck). 📖 `docs/lang-decks.md` — READ BEFORE TOUCHING ANY DECK OR GENERATOR.
- `docs/*-card-plan.md` — the fixed running orders for every collection (table below).
- `.claude/` — helper scripts and tests. Not part of the site.
- `atlas/` — Atlas v2 (Oct 2026): `atlas.js` (the page; `opts.embed` is the headless hub), `atlas-embed.js` + `atlas-windows.js` (Phase 4: the card windows and Find it, lazy), `study.js` (Phase 3b: the pure study arithmetic — the studied set, the Map / Personal / Full flags, the sentences, the place card's list, the marks' size, shape and fan; also `require`d by `.claude/test-study.js`), `atlas-gl.js` (WebGL2), `atlas-canvas.js` (the still 2D view without
  WebGL2), `atlas-worker.js` (geometry; also the main-thread shim on `file://`), `atlas-format.js` (the `.bin` reader shared with
  the checkers), `vendor/earcut.js`; `atlas/data/` — generated: `topology.bin` + `tiles/`, `water.bin` + `water/`, `relief/`,
  `gazetteer.js`, `places.js` (the places the cards need beyond the gazetteer, Phase 3a), `card-places.js` (the LIGHT card → places index, Phase 3b, built by `build-card-places.js`, 200 KB budget), `glossary-places.js` (term → registry id for the glossary popup's pin on the Atlas, Phase 3c, `build-glossary-places.js`), `polity-index.js` (polity names and the year ranges each is mapped, for the search, Phase 3c, `build-polity-index.js`), `history-wars.bin` + `.bin.js` (Phase 4c: the war windows' slice of `history.bin`, 1.8 of its 9.1 MB, with its own small `file://` twin; `build-war-slice.js --check` in CI fails when it lags — run `build-war-slice.js --install` after any rebuild of `history.bin` or `wars.js`), `country-names.js` (the 257 countries and the 55 v1 spellings), `card-faces.js` + `card-neighbours.js` (a map card's key → engine entity; the "describe the map" sentence), `findit-areas.js` (Find it's frozen area rings), `credits.js`, and the `.bin.js` twins for `file://` (at most 12 MB in all). `.claude/atlas-build/` — the pipeline (`npm ci` there;
  nothing ships; `frozen/` holds what v1's deleted files still gave it). Routes: `#map` (the Atlas; `#map2` redirects to it and `#map/<year>/<name>` still opens), `#credits` (Sources and credits, linked from Settings, the home footer,
  About and the map's `?`).
- `_headers` — CSP. `manifest.json`, `icon*.svg`, `sw.js` — PWA (never registered on a dev origin).

## Invariants that fail silently (one line each — grep `docs/reference.md` before touching)

- **Lazy data**: `DATA_BUNDLES` / `ensureData(name)`. A lazy file whose global is read at boot needs an
  `after` hook re-applying `ADMIN_EDITS`. 📖 `docs/eager-path.md` — READ BEFORE SPLITTING ANYTHING OFF THE EAGER PATH.
- **Admin edits are deltas** (`ADMIN_EDITS`, applied at boot); the shipped data files are never
  rewritten by the app. Live edits publish through the `content_overrides` Supabase row — after baking
  them into data files, remind the user to reset that row to `{}`. Dev origins never publish or adopt.
  📖 `docs/admin-editor.md` — READ BEFORE TOUCHING THE ADMIN AREA.
- **Accounts/sync**: offline-first, `progressBlob()` PATCHed whole; anything that grows per review gets
  its own table, never `PROGRESS_FIELDS`. 📖 `docs/accounts-sync.md` — READ BEFORE TOUCHING SIGN-IN OR SYNC.
- **Scheduler** (`sched*`, FSRS) is pure and arithmetic-tested. 📖 `docs/scheduler.md` — READ BEFORE TOUCHING THE SCHEDULE.
- **Daily study / deck limits**: 📖 `docs/daily-study.md` — READ BEFORE TOUCHING THE REVIEW OR A DECK'S OPTIONS.
- **Minigames** draw cards only through `gameCardIdSet()`; daily draws only through `dayPick()`.
  📖 `docs/minigames.md` — READ BEFORE ADDING A GAME OR CHANGING A POOL.
- **Atlas (`#map`, Atlas v2 since Phase 5, Oct 2026; v1 is deleted)**: 📖 `docs/atlas.md` — READ BEFORE TOUCHING THE ATLAS, ITS DATA OR ITS ROUTES (addresses, render path, data, fallbacks, reader data, and the "re-run after touching" table). `atlas/` is the lazy `atlas2` bundle; every file under
  `atlas/data/` is GENERATED by `.claude/atlas-build/` and carries a `sources` header — never hand-edit one, and never
  touch `topology.bin`, `tiles/`, `water*` or `relief/` without the land files staying byte-identical (`sha256sum`). A new data file gets a `sources` header.
  The `#credits` page is generated from those headers (`build-credits.js`; `check-credits.js` in CI fails when it lags) and lists only sources of files that ship.
  The frame gate (`test-atlas-perf.js`, its own CI job) must be green on every head (at most 0.5 % of the frames DURING a gesture over 100 ms, none over 200 ms; the release frames after a drag or pinch are measured apart: the first full frame ≤ 300 ms, none over 300); on a slow GPU the view degrades
  in two sticky stages during a gesture (half resolution, then one coarser level — `gestureFrame` in `atlas.js`, design
  §7 Phase 1d). Names are English, one row per Wikidata item per kind (`build-gazetteer.js`, `check-gazetteer.js`).
  **Phone (Oct 2026)**: up to 640 px the frame is full-bleed; on a phone the controls are one search button, one menu button (its sheet holds Map/Personal/Full, the layers and legend, the help), one zoom pill and a one-row year rail with "more"; **no name is placed farther from its anchor than its half-height + 28 px** (worker `nearAnchor`; `test-atlas-phone.js` measures it in every draw) — `docs/atlas-v2-design.md` §7 "The phone, decluttered".
  **Addresses**: `#map2…` is rewritten to `#map…` (view, year and place intact) at boot and on `hashchange`; v1's `#map/<year>[/<name-slug>]` is decoded by `atlasLegacyLink` and opened by `openLegacy` — **both must keep working for ever**; the per-viewer preview switch (`folio.atlas2.preview`) is gone and nothing reads it. `test-atlas-redirects.js` guards every form.
  **Study layer (Phase 3b; proximity stacks removed 2026-10-14; city stacks, the tap rules, glyphs and label text 2026-10-17)**: a flagged place is its own mark at its own position — never clustered by screen proximity; the ONE grouping is a CITY's: the places of one city (the registry's parent, else the largest settlement within 3 km) that chain within 28 px are one ring with a count, whose popup pages through them (`study.js` `cityMembership`, `stackGroups`; `docs/atlas-v2-design.md` §7 "Popups and stacks"); a tap on marks that overlap fans them out. **A tap opens a popup only for what has a card** (`tappableSet`: Personal the reader's own, Full any of a collection that is on, Map any) — no hit area, highlight or popup otherwise, the name still drawn; no nearest-sea fallback. **A tap on empty land inside a state, a people or a culture that has a card selects the WHOLE of it** (2026-10-18): the card windows' gold (`SEL_GOLD` — the land blended with gold at 0.24 in `entColour`, the outline and glow stroked by `drawSelection` from the worker's `face-rings`), kept through a drag, a zoom and a year it is alive in; marks and names keep priority; the hidden keys list is the keyboard route; `test-atlas-popups.js` §12. **The popup is one design** (2026-10-18): a bottom sheet on a phone (peek / half / full, `reflectSheet`, `setSnap`), a 360 px panel elsewhere; rows first, "Also here", key facts, sources folded; §11. **The Personal Atlas names, marks and colours only the reader's polities.** Seven glyph classes by SHAPE (`markClass`; a capital — the gazetteer's kind, or a period capital of `polity-index.js` joined by `capitalIds` — is a square and a building a house, 2026-10-17 b; areas have no mark, a name only; **a state, a people or a culture has NO mark since 2026-10-18** — named, tappable by its face or name where it has a card, no star; the Legend lists the seven). **Every glyph but the capital's square is drawn at half its half-extent** (`markScale`, 2026-10-18 a; the outline never under 1.25 px, `markLine`; the hit area stays 32 px; the city ring is 9.5 px half so a 9 px two-digit count fits, `ringHalf`). **The year rail draws no ticks** (2026-10-18 c): a plain CSS line and the pin; the change years stay as data for `[` / `]` and the "no states" note. A label never shows a parenthetical or a trailing ", <country / region>" qualifier (`labelText`, `bareName`; the worker keeps the qualifier for two names of one layout that share a bare name), wraps past 22 characters, uses the short name past 28; the popup and the search keep the full name. In a dark theme every name is light text on a dark halo 3.2 px wide (`labelColours`: the own/selected ochre is lightened to ≥ 7:1 against the halo; `test-atlas-dark-labels.js`). Rivers and relief are drawn at every zoom to the cap, 0.15 km/px — no river floor, no relief fade (`test-atlas-zoom-layers.js`). **Names never overlap (2026-10-17)**: every mark drawn clear is hard ground for every name of every pass (no soft marks, no fallback over a lesser dot), a name with no clear box is not drawn, a city ring's name is laid before every other name (a pixel from a dot and on two lines as its last resorts, never over a mark), a nudged ring's name is anchored where the ring is drawn, a name may lie over its OWN mark only, and a polity's or country's name that no card links comes after the study names (a card-linked one is laid by the study pass at its flag's turn, `layCand`); `test-atlas-overlaps.js` (phone and desktop, light and dark, Rome, Naples, Athens, Jerusalem, Kyoto) asserts it and prints the names dropped per view. The Map / Personal / Full switch is COMPUTED from the host's `studiedCards()` — "studied"
  (the keys of `S.cards`, a card with a record) — and the lazy `card-places.js` + `places.js`; never stored, never in the progress
  blob (only the view and the collections switched off sit in localStorage). A place is ONE place per physical site (period names
  are aliases; `migrate-places.js` merges, ambiguous only across kinds or beyond 25 km); `card-places.js` is a pure function of the
  cards' heavy `places` and `check-places.js` fails when it lags — run `build-card-places.js --install` after any hand edit.
  **Reader data (Phase 5)**: a place card's "New discovery" chip and the meters read and write the EXISTING `placesSeen` register (`markSeen`), no new field; its country keys were v1's spellings for 55 countries, and `atlasPlacesSeenMigrate()` (when `country-names.js` lands) adds the new key with the old key's time — additive, one-way, idempotent, never over `SEEN_CAP`, the old key kept; `PROGRESS_FIELDS` and the sync are unchanged. `test-progress-registers.js` guards it. The glossary pin opens `#map/…/<place>` from `glossary-places.js`; `glossary-places.js` and `polity-index.js` are generated (`migrate-places.js` and `build-polity-index.js`), and `check-places.js` fails when either lags. `ADMIN_EDITS.timeline` and the map editor are gone (Q-A1 a): a stored or published `timeline` delta is ignored on read and never written back.
  **Peoples and cultures (Phase 2c)** are a PRESENCE, not a territory: `history.bin` entities of kind `people` (the eight Cliopatria series the audit keeps as peoples) and
  `culture` (the Cyclades and Crete as their islands, the Yangshao and Longshan as outlines of the pinned Hosner 2016 sites) are each conflated ALONE onto the coast
  (own arcs `KIND.SOFT`, face class soft), so they overlap states and one another by design and the state partition, `check-history.js`'s per-epoch checks and the
  state colouring never see them; `study.js` `layerOf` is the one classification, the legend's `layers.peoples` (`off` | `linked` | `all`) the one switch
  (`peoplesShown`), the worker's `presenceMesh` the soft face (edge alpha), `atlas-gl.js` `drawHistoryPresence` the stipple (multiply on a light theme, screen on a dark
  one), the label style `people-*` the spaced italic. `test-peoples.js` (Node) guards the arithmetic and the mesh. A culture's years are not bounded by Cliopatria's 3400 BCE.
  **Wars and the front (Phase 2d)**: every `card.war` side resolves (`lib/war-resolve.js`, `war-sides.json`, `war-series.json`) to entities of `history.bin` — a series, or an authored/derived `extent` — and `atlas/data/wars.js` is the generated table (`build-wars.js --check`; never hand-edit); the card's `war` field is untouched (the windows read it) and `test-war-sides.js` pins its hash. An extent is drawn as a labelled soft wash, never traced from a source that is not clearly open; three are derived from pinned open sources (`build-war-extents.js`). The Second World War front is four `front` entities of dated steps (`fronts-plates.json`, 138 plates, nothing for January–June 1943); every plate carries its uncertainty. `history.bin` is 9.1 MB against a 12 MB stop rule; the `file://` twins total at most 12 MB (`build-war-slice.js` enforces it; the war slice's twin is gzip, decoded by `DecompressionStream`).
  **Card windows and Find it on the engine (Phase 4; the only path since Phase 5)**: `atlas/atlas-embed.js` mounts the controller ONCE as a headless hub
  (`opts.embed`: no saved layers, year or address bar, no gazetteer, no frame loop) and every window is a 2D canvas the hub draws into — one WebGL2 context for the page, disposed after the idle time and recreated by the next window.
  `atlas/atlas-windows.js` (lazy, bundle `atlas2embed`) is the map-card / locator / war window and Find it; `app.js` keeps only the dispatcher `startCardGlobe`, `atlas2Ctx()` and
  `atlas2OpenFromWindow`. **Without WebGL2, or with the bundle refused, a window runs on the engine's Canvas 2D path** (`atlas-canvas.js` through the same hub: no outline glow, no war tint, Find it plays), and when even that cannot start it prints one plain sentence — v1's window is gone; `test-window-fallbacks.js` guards all of it. A map card's key is joined to an engine entity by `atlas/data/card-faces.js` (generated from `.claude/atlas-build/frozen/layers.json`; `build-card-faces.js --check` in CI fails when it lags, and when a map card does not resolve). A war window is drawn at the
  war's middle year on the history (other states plain), a year outside the war tints nothing. Find it deals the SAME five rounds as before the swap (its pool builder `finditRegister` moved into `atlas-windows.js`; `compare-findit-deal.js` proved 60 dates equal) and scores a country or a state by the
  ID pass. The display-name overrides (`polity-names.json`, Wikidata-dated, audited by `audit-polity-names.js`) change what the Atlas shows for a polity in a year, never `history.bin`.
  **The cards' old `locator`, `war` and `map` fields STAY** (the windows read them through `CARD_MAP_LAYERS` and the card-faces join; `migrate-places.js --finish` is not run): removing them is a later phase.
  **A polity's Wikidata item and Wikipedia title are Cliopatria's own pair, corrected by `.claude/atlas-build/polity-qids.json`** (`fixes`, applied in `build-history.js` at the row; the QID audit of 2026-10-13 found 26 polities on the wrong item). `audit-polity-names.js --check` (CI) fails when an entity's item has dates that reach no year of its span or is not a polity, unless `allow`ed with a reason. Rebuild `history.bin` with `--no-cache` (a cache replay is not byte-identical); a polity that gains a QID makes a `places-spec.json` row with the same QID a duplicate. 📖 `docs/atlas-v2-polity-qids.md` — READ BEFORE TOUCHING A POLITY'S QID.
  **A row's GEOMETRY is corrected only through `.claude/atlas-build/geometry-fixes.json`** (one fix, 2026-10-18: the Roman Kingdom's polygon, which left Rome 2.8 km outside; the build verifies the fix's `check` and refuses a stale one, the overlap precedence is the fix's `over`, and history.bin's header names it as Folio's adaptation of CC BY data so the `#credits` page does) — never bend a border anywhere else, and never move a seat to fit one. 📖 `docs/atlas-v2-border-audit.md` §7 — READ BEFORE ADDING OR CHANGING A GEOMETRY FIX.
  📖 `docs/atlas-v2-card-windows.md` — READ BEFORE TOUCHING `startCardGlobe`, A CARD WINDOW OR FIND IT (the inventory, the contract, what has no engine primitive). Re-run `node .claude/test-atlas-embed.js` and `node .claude/test-window-fallbacks.js` after touching either path. **Phone fixes (Oct 2026)**: nothing a reader does to a window's map (tap, click, drag, pinch, wheel) opens the Atlas — only the window's globe button does, and a map card has none; a war window has one legend (the key under it); a gesture frame keeps the shaded place's outline from the rim the last full frame kept (never a mask pass); a war side's name stands on a point inside its own face (the worker's `face-anchors`); a locator's names never cover a mark. `node .claude/test-card-windows-fixes.js` guards all five; read `docs/atlas-v2-card-windows.md` "Phone fixes" first.
  **Phase 4b**: a hub is ready at LOD 0 and its windows redraw as the finer levels arrive; its first level comes from IndexedDB (`CORE_CACHE_REV` in `atlas.js` — run `node .claude/atlas-build/check-core-cache.js --install` after ANY edit to `atlas-worker.js`, `atlas-format.js`, `vendor/earcut.js` or `topology.bin`, CI fails when it lags); the page's idle warm-up creates the hub; a country's face and its admin-1 children are two draw lists (`bucketFaces` / `drawFaces`), never a second face pass; a war window names its sides and draws a legend, and falls back to the plain sentence where the loaded history has none of its faces (`file://` carries only the war slice of the history); the idle warm-up skips cellular, save-data and light mode; the locators that get the finer water level are `ATLAS_CARD_FACES.water`, from the registry kind of the locator's place (`build-card-faces.js`); `test-atlas-windows.js` is the engine-only suite; `docs/atlas-v2-card-windows.md` maps every V1 window assertion to its engine counterpart and `docs/atlas-v2-phase5-plan.md` §8 every v1 page assertion to its successor.
  **One neutral fill (2026-10-18)**: every historical state is the LAND colour in Map, Personal and Full (no per-state hue; `entColour`), a people's stipple is the border ink (`presInk`), the selected state is `palette.selected`; the land no state or people covers in a past year is half as bright (`HIST_DIM`, `drawHistoryDim`, the Atlas page only — never a window, never Find it); a card window draws relief when the Atlas's Legend has it on, at its strength (`AtlasEmbed.reliefSetting`, the `atlas2:layers` event), never Find it, never Canvas 2D. `test-atlas-neutral.js` guards all three; `docs/atlas.md` §2 has the rules.
  **Post-swap (Oct 2026)**: the names follow Text size (`labelScaleNow`), the cold load is ordered globe → prose, land → water, cached first frame (`whenIdleAfterGlobe`, `topologyIn`; `test-atlas-first-globe.js`), the heap gate is an absolute CI-read budget, and every polity/people card names its source (`test-atlas-card.js` §3b) — all in `docs/atlas.md` §2/§4.
  📖 `docs/atlas-v2-design.md` — READ BEFORE BUILDING ANY PART OF ATLAS V2 (the design, §7's as-built notes per phase, the owner's gate rules).
  📖 `docs/atlas-v2-build.md` — READ BEFORE RUNNING OR CHANGING ANY SCRIPT IN `.claude/atlas-build/` (pipeline order, every checker, every CI job).
- **Map cards / locators / war cards**: 📖 `docs/map-cards.md` and 📖 `docs/war-cards.md` — READ BEFORE CHANGING EITHER FORMAT.
- **Footnotes**: markers are written EMPTY (`<sup class="fn" data-fn="N"></sup>`); `wireFootnotes`
  numbers them. 📖 `docs/source-footnotes.md` — READ BEFORE TOUCHING THE APPARATUS.
- **Community decks** never enter `CARDS` / the tree / `window.GLOSSARY`; `uDeckNormalize` is the one
  ingest choke point; bump `SANITIZE_REV` when a sanitizer changes.
  📖 `docs/community-decks.md` — READ BEFORE TOUCHING ANY OF IT.
- **Never name a CSS class `ad-…`** (ad blockers hide it; `adBaitCheck` in `test-layout.js`).
- **Units and spelling** are rendering passes over text nodes (`unitizeTree`, `spellTree`); content is
  authored metric-first with imperial in brackets, and in British spelling.
  📖 `docs/reader-settings.md` — READ BEFORE CHANGING EITHER.
- **Library**: 📖 `docs/library-feature.md` — READ BEFORE TOUCHING THE LIBRARY.
- Other areas each have a doc — find it in `docs/README.md`.

## Generating cards & glossary entries

**📖 `docs/card-authoring.md` — READ BEFORE WRITING A CARD OR A GLOSSARY TERM.** It is the complete,
self-contained spec (every field, every length, every style rule, a worked example) — the same file
the user pastes into ChatGPT, so the two always agree. Then read **only the section of the
collection's plan** covering the cards you are writing, plus the plan's short scope sections if you
have not this session.

- **The next cards**: `node .claude/next-cards.js <prefix> [n]` prints the next `n` unwritten plan
  lines with their deck ids — no need to open the plan file to find them.
- **Write one card**: `node .claude/add-card.js <card.json> <deckId>` (**always pass the deck id**, or
  it files into China). **It also resolves the card's Wikipedia article** and writes it as `wiki` (see
  "Wikipedia links" below) — read its output: a link marked CHECK wants a glance, "no dedicated article"
  is a normal answer, and "NOT RESOLVED" prints the command that finishes it. **Write one term**: `node .claude/add-glossary.js <entry.json>` — it
  **overwrites an existing term in silence**, so grep `glossary.js` for the slug first.
- **Import a batch** (from ChatGPT or written in bulk): `node .claude/import-batch.js <batch.json>` —
  adds the glossary terms (refusing existing slugs), then each card, and writes anything refused to a
  `.rejected.json` beside the input for fixing. **Verify every citation before committing** (curl each
  URL; `node .claude/check-citations.js --card=<id>`): a ChatGPT citation is a claim, not a fact.
- **The plan is the authority**: the next card is the lowest unwritten number; don't create decks;
  a plan line is a subject to research, not a fact — retitle a line in the same commit when research
  says so.
- Other writers: `add-sources.js` (citations onto existing content), `set-date-line.js`,
  `fix-field.js`, `add-questions.js`, `add-card-links.js` (why / leadsTo), `add-locators.js`,
  `add-card-wars.js`, `add-card-difficulty.js`, `add-card-tags.js`, `mark-undatable.js`,
  `set-facts.js`, `add-images.js`, `add-places.js` (the Atlas v2 `places` ids on one card; `migrate-places.js` derives
  them from `locator` / `war` / `map`, `atlas-build/add-place.js` adds a place to the registry) — each documents itself in its header.
- After a batch: `check-style.js`, `check-questions.js`, `node .claude/check-cards.js --prefix=<p>`
  (report only), `test-card-plans.js`.
- **Wikipedia links** (the "Learn more" tile at the foot of a card, `learnMoreHTML`): `.claude/wiki-links.json` maps
  each card to its dedicated article and `node .claude/apply-wiki-links.js` writes it onto the cards as the heavy
  field `wiki` — the only writer of that field; never set it by hand. **A new card gets its link automatically**:
  `add-card.js` and `import-batch.js` run `find-wiki-links.js` + the applier for the cards they write (needs the
  network; `--no-wiki` skips it; a `--replace` re-resolves only if the answer changed). A card whose answer is a
  descriptive phrase has no article and shows no tile — that is an answer, not a fault. If Wikipedia could not be
  reached the output prints the command to run later, and CI's `node .claude/apply-wiki-links.js --check` (offline)
  fails until it is. To correct a link, edit its entry in `wiki-links.json`, add `"manual": true` (a re-run then never
  overwrites it) and run the applier. 📖 `docs/wikipedia-links-audit.md` — READ BEFORE CHANGING A CARD'S LINK OR THE RESOLVER (the cards still needing a human decision).

### The planned collections

| collection or deck | id | prefix | plan | decks / leaves | state |
|---|---|---|---|---|---|
| World History | `col-8` | `wh-` | `docs/world-history-card-plan.md` | 8 / 39 | complete |

📖 `docs/wh-refinement-audit.md` — READ BEFORE TOUCHING ANY `wh-` CARD (the Oct 2026 refinement: Greece's rules plus deep time, batches, ledger; `node .claude/wh-audit.js`). 📖 `docs/wh-chronology.md` — READ BEFORE WRITING A DATE ON A `wh-` CARD.

| Ancient Greece | `col-13` | `gr-` | `docs/greece-card-plan.md` | 6 / 19 | complete |

📖 `docs/greece-refinement-audit.md` — READ BEFORE TOUCHING ANY `gr-` CARD (the Sep 2026 refinement: rules, batches, ledger; `node .claude/greece-audit.js`, and `add-card.js --replace`). 📖 `docs/greece-chronology.md` — READ BEFORE WRITING A DATE ON A `gr-` CARD. A card's source bar is tiered by difficulty (`srcTargetFor`: 1 → 9 … 5 → 5). `node .claude/test-why-markers.js` guards Think-it-through markers.

| Ancient Rome | `col-40` | `rm-` | `docs/rome-card-plan.md` | 7 / 25 | complete |

📖 `docs/rome-refinement-audit.md` — READ BEFORE TOUCHING ANY `rm-` CARD (the Oct 2026 refinement: Greece's rules plus tradition against fact, batches, ledger; `node .claude/rm-audit.js`; the harness is `.claude/wh-refine/` with `REFINE_PREFIX=rm-`). 📖 `docs/rome-chronology.md` — READ BEFORE WRITING A DATE ON AN `rm-` CARD.

| United States | `col-41` | `us-` | `docs/us-card-plan.md` | 9 / 33 | live |
| Russia | `col-42` | `ru-` | `docs/russia-card-plan.md` | 9 / 29 | live |
| India | `col-43` | `in-` | `docs/india-card-plan.md` | 9 / 31 | empty |
| China | `china` | `cnh-` | `docs/china-card-plan.md` | 7 / 39 | complete: 1000 plan lines, 999 cards (`cnh-070` retired, never reuse) |
| Ancient Egypt | `egypt` | `eg-` | `docs/egypt-card-plan.md` | 9 / 26 | live |
| The Second World War | `ww2` | `ww2-` | `docs/ww2-card-plan.md` | 8 / 30 | live |
| The First World War | `ww1` | `ww1-` | `docs/ww1-card-plan.md` | 9 / 37 | empty |
| Architecture | `arch` | `arch-` | `docs/architecture-card-plan.md` | 9 / 39 | empty |
| Middle-earth | `middleearth` | `mid-` | `docs/middleearth-card-plan.md` | 9 / 40 | empty |
| Westeros | `westeros` | `wes-` | `docs/westeros-card-plan.md` | 9 / 41 | empty |
| The Cold War | `coldwar` | `cw-` | `docs/coldwar-card-plan.md` | 9 / 36 | empty |
| The Viking Age | `vikingage` | `vk-` | `docs/vikingage-card-plan.md` | 9 / 39 | empty |
| Japan | `japan` | `jp-` | `docs/japan-card-plan.md` | 9 / 34 | live |
| Psychology | `psych` | `ps-` | `docs/psychology-card-plan.md` | 9 / 38 | live |
| Philosophy | `phil` | `ph-` | `docs/philosophy-card-plan.md` | 9 / 38 | empty |
| Biology | `bio` | `bio-` | `docs/biology-card-plan.md` | 9 / 46 | live |
| Dinosaurs | `dino` | `dino-` | `docs/dinosaurs-card-plan.md` | 9 / 43 | empty |
| Astronomy | `astro` | `astro-` | `docs/astronomy-card-plan.md` | 9 / 45 | empty |
| Economics | `econ` | `ec-` | `docs/economics-card-plan.md` | 9 / 40 | empty |
| Korea | `korea` | `ko-` | `docs/korea-card-plan.md` | 9 / 43 | live |
| France | `france` | `fr-` | `docs/france-card-plan.md` | 9 / 43 | empty |
| Ancient Mesopotamia | `mesopotamia` | `me-` | `docs/mesopotamia-card-plan.md` | 9 / 40 | empty |
| Visual Art | `art` | `art-` | `docs/art-card-plan.md` | 9 / 39 | 30 cards, contiguous — next is `art-031`; not a history collection (artwork-card format) |
| Geography | `geo-us` | `geo-` | `docs/geography-card-plan.md` | 3 / 3 | complete (map cards) |
| World Geography | `geo-world` | `gw-` | `docs/world-geography-card-plan.md` | 2 / 2 | complete but 3 deferred |
| Flags | `flags` | `fl-` | `docs/flags-card-plan.md` | 2 / 2 | complete (4 deferred) |
| Draw the flags | `flags` | `fd-` | `docs/flags-draw-card-plan.md` | 2 / 2 | complete (4 deferred) |
| China (Geography) | `geo-china` | `gc-` | `docs/china-geography-card-plan.md` | 2 / 2 | complete |
| Russia (Geography) | `geo-russia` | `gru-` | `docs/russia-geography-card-plan.md` | 2 / 2 | complete (`gru-502` deferred) |
| Politics: East Asia | `pea` | `pea-` | `docs/politics-east-asia-card-plan.md` | 24 / 24 | live, planned a lecture at a time |
| The EU as an External Power | `eep` | `eep-` | `docs/eu-external-power-card-plan.md` | 14 / 14 | live, a course in the Special section: 292 of 300 planned cards written; Reading 3 (8 cards) waits for its PDF |
| Gateway to Global Affairs | `gga` | `gga-` | `docs/gateway-to-global-affairs-card-plan.md` | 21 / 21 | a COURSE (Leiden), 297 of 300 cards written over Lectures 1–6 and 14 readings (from `gga-057` on, from the course texts only); Lecture 7 awaits slides |

The lowest unused id for a prefix (substitute it); `next-cards.js` does this and also prints the topic:

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='jp-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

`node .claude/test-card-plans.js` checks this table against the tree and the plans — re-run it after
editing a plan, the tree, or this table.

## Testing (mechanics)

- `node --check app.js` before anything else. Data files load under Node after `global.window = {}`.
- Browser suites are `.claude/test-*.js` (Playwright, headless Chromium). Find the one guarding a
  function by grepping `docs/reference.md` for the function name near "Re-run after touching".
- Install Playwright **outside the repo** (nothing but `vendor/` ships a library) and reach it through `NODE_PATH`:
  `mkdir -p "$SCRATCH/pw" && cd "$SCRATCH/pw" && npm init -y && npm i playwright`, then run a suite
  with `NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-<name>.js` — exactly as CI does.
- `page.goto()` to a URL differing only in `#fragment` does not reload; use `page.reload()`.
- Put Unicode test strings in a file, not inline `node -e`.

## Environment

- Cloud sessions clone from GitHub, push to a feature branch, and the user merges the PR from their
  phone (merge = deploy). This file is the only memory a cloud session has.
- Outbound HTTPS goes through a proxy; Node's `fetch` needs `NODE_USE_ENV_PROXY=1` (curl does not).
  `node .claude/check-reach.js` says which scholarly hosts answer — never assume a host is shut.
- Supabase: schema in `.claude/supabase-schema.sql`; the live project has every block. Every feature
  must degrade to a sentence on a database missing a later block.
- Never rewrite git history; the repo is ~0.5 GB and that is expected.
