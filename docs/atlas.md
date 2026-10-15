# The Atlas — the interactive globe (`#map`), as built

The Atlas is **one page, one engine**: a WebGL2 globe with a Canvas 2D fallback, the borders of the past from 3400 BCE, the reader's own cards drawn on it, and the same engine
drawing the small map windows inside cards and Find it. It was the "Atlas v2" until Phase 5 (Oct 2026); v1 — the old `#map` page, its eras, its heightmaps — is gone, and what it did is
archived in `docs/atlas-v1-archive.md` (read it only to learn why something was once written the way it was; nothing in it is a rule for the code that ships).

This file is the *as-built* description: where things are, what reads what, what fails silently, what to re-run. The *why* of every decision is `docs/atlas-v2-design.md` (the
design, §7's as-built note per phase, the owner's gate rules); `docs/atlas-v2-build.md` runs the data pipeline; `docs/atlas-v2-card-windows.md` is the card windows and Find it;
`docs/atlas-v2-phase5-plan.md` is the swap itself — what was deleted, what was frozen, and which test replaced which.

## 1. Addresses

| address | does |
|---|---|
| `#map` | the Atlas at its default view (the Settings "Atlas home" country, else the opening view) |
| `#map/<lon>/<lat>/<zoom>[/<place id>][?y=<year>[&perf]]` | a view; `place` is a registry id (`adm0:fra`, `pol:…`, `cap:…`); `y` the rail's year. The page rewrites its own address on every settle (`replaceState`; a selection pushes) |
| `#map/<year>` and `#map/<year>/<name-slug>` | **v1's address**, still accepted for ever (readers shared them): the year is set and the name is looked up in the whole registry by the search's folded spelling (`openLegacy` in `atlas.js`, decoded by `atlasLegacyLink` in `app.js`; the new form has three numbers after `map/`, which is how the two are told apart). A name that matches nothing still lands on the Atlas at that year |
| `#map2…` | the preview's address; rewritten at boot and on `hashchange` to the same thing at `#map` with `replaceState` (no history step) |
| `#credits` | Sources and credits, generated from the data files' own headers (§6) |
| `#findit` | the game, drawn on the engine (`atlas-windows.js`) |

There is **no per-viewer preview switch** any more: `localStorage["folio.atlas2.preview"]` is read by nothing, and `#map2?preview=0` simply opens the Atlas.

## 2. The render path

`atlas/` is the lazy `atlas2` bundle (`DATA_BUNDLES` in `app.js`): `atlas-format.js` (the `.bin` reader, shared with the checkers) → `study.js` → `atlas-gl.js` → `atlas-canvas.js` → `atlas.js`.

* `atlas.js` — the controller and the page: view, gestures, the rail and year, the registry and search, the place card, the legend, the About sheet, the study panel, the address bar.
  `opts.embed` makes the same controller a **headless hub** (no address bar, no saved layers, no gazetteer, no frame loop) for the windows.
* `atlas-gl.js` — WebGL2: faces, borders, the ID pass that names what is under a finger, relief, water, the history faces and the soft presence of peoples.
* `atlas-canvas.js` — the **still 2D view** a browser without WebGL2 gets (the Atlas page's own fallback, Q-R3 a; since Phase 5 also the card windows' and Find it's). It draws land, the
  borders it can, names and the selected face's tint; it does not draw history.
* `atlas-worker.js` — geometry (earcut triangulation, simplification, label placement); on `file://` a main-thread shim. `CORE_CACHE_REV` in `atlas.js` keys the IndexedDB first-frame cache: **run
  `node .claude/atlas-build/check-core-cache.js --install` after ANY edit to `atlas-worker.js`, `atlas-format.js`, `vendor/earcut.js` or `topology.bin`** (CI fails when it lags).
* **The names follow Text size** (Oct 2026). `labelScaleNow()` (`atlas.js`) reads `--fs` off `<body>` (Settings → Text size, `body[data-fs]` in `styles.css`) and divides by what Medium is on the device (1; 0.9 under 641 px), so the default is exactly what it was and the five stops give 0.8 · 0.9 · 1 · 1.14 · 1.32 (phone 0.78 · 0.89 · 1 · 1.11 · 1.27). The factor multiplies the style sizes, tracking and glyph advances (`measureMetrics`), the halo widths, the fan's labels and the study marks; sent as `fs` with each layout it scales the worker's collision padding, frame margin, city/capital dots and study marks (a name that grows takes its box with it). `data-fs` on `<body>` and a viewport crossing the 640 px breakpoint re-measure and re-lay out. The card windows' own names (`atlas-windows.js`) do not follow it. Guard: `test-atlas-labels.js` §12; `controller.labelScale()` is the factor.
* **The cold load, in the order a reader waits for it** (Oct 2026): the coarse globe first, then everything else. (1) The idle pre-loading of the glossary's citations, the artefacts and the studied collections' card extras (about 11.6 MB) is `whenIdleAfterGlobe` in `app.js`: on a page booted on `#map` it waits for the Atlas's first painted frame (`host.firstDraw`), or the reader leaving the Atlas, or two minutes; every saveData / light-mode / cellular rule stays inside the held function. (2) The water file (`startWater`) starts once `topology.bin` has arrived (`topologyIn`), not beside it. (3) A return visit paints the coarse level from IndexedDB (`core0`, keyed by `CORE_CACHE_REV` — the same first-frame cache the hubs use, now the page's too) while the file is still on its way; messages the page sends before its worker exists (a stored past year's history request, the gazetteer) are kept in `preWorker` and sent right after `load`. `measure-atlas-cold.js` prints two figures: `firstGlobeMs` (the first frame with the coarse land on the canvas) and the old "ready" (every level in, names laid out). Guard: `test-atlas-first-globe.js`.
* `atlas-embed.js` + `atlas-windows.js` (bundle `atlas2embed`, lazy) — the card windows and Find it. `docs/atlas-v2-card-windows.md` is the contract; `app.js` keeps only the dispatcher
  `startCardGlobe`, `atlas2Ctx()` and `atlas2OpenFromWindow`.
* **The frame gate** (`test-atlas-perf.js`, its own CI job) must be green on every head. On a slow GPU the view degrades in two sticky stages during a gesture (half resolution, then one coarser
  level — `gestureFrame` in `atlas.js`; design §7 Phase 1d). Since Phase 5 the gate no longer runs v1 beside v2: its "at most 40 % of v1's p90" bounds are against `V1_REF`, v1's last measured numbers kept as constants in the suite; the drag's frames over 100 ms are at most 0.5 % of the sample and none over 200 ms.
  **The heap rule is an absolute budget read off CI** (`HEAP_BUDGET_MB` = 38: the frame-gate job of run 3567 printed 30 MB after the gestures and after the rail scrub, + 25 %; `FOLIO_HEAP_BUDGET_MB` overrides it on a machine whose Chromium reads differently). The sandbox's older Chromium reads 87 MB for the same page: 38 MB of that is memory V8 holds for the idle-loaded prose (glossary citations, artefacts, card extras — compiled and run as data scripts) for the seconds after a burst of gestures and gives back when the page is quiet (45 MB twenty seconds later; 46–49 MB with the three prose files refused). It is a peak, not retained data, and the same file against the Phase 4c tree reads the same 84–88 MB, so it is not a code change. Re-read the budget from CI's log when a deliberate change moves it.

## 3. Data (everything under `atlas/data/` is GENERATED)

Each file carries a `sources` header and is built by a script in `.claude/atlas-build/` (`docs/atlas-v2-build.md` has the order, every checker and every CI job). **Never hand-edit one**;
never touch `topology.bin`, `tiles/`, `water*` or `relief/` without the land files staying byte-identical (`sha256sum`).

| file | what | built / checked by |
|---|---|---|
| `topology.bin`, `tiles/` | land, coast and admin-0/1 faces at four detail levels | `build-land.js`, `check-topology.js` |
| `water.bin`, `water/`, `relief/` | lakes, rivers, the relief pyramid | `build-water.js` / `pack-water.js`, `build-relief.js`; `check-water.js`, `check-relief.js` |
| `history.bin` (9.1 MB) | the borders of the past: Cliopatria series conflated onto the coast, peoples and cultures as soft presences, authored extents, the Second World War front | `build-history.js` (`--no-cache`), `check-history.js` |
| `history-wars.bin` + `.bin.js` | the war windows' slice of it (1.8 MB) | `build-war-slice.js` (`--install` after any rebuild of `history.bin` or `wars.js`; `--check` in CI) |
| `gazetteer.js`, `places.js`, `polity-index.js`, `polity-names.js` | the places registry, the places the cards need beyond it, the polities by name, the dated display names | `build-gazetteer.js`, `build-places.js`, `build-polity-index.js`, `build-polity-names.js` |
| `card-places.js`, `glossary-places.js` | card → places, glossary term → place | `build-card-places.js`, `build-glossary-places.js` (inputs: the cards' heavy `places`, `.claude/atlas-build/glossary-places-input.json`) |
| `wars.js` | every `card.war` side resolved to entities | `build-wars.js --check` |
| `card-faces.js`, `card-neighbours.js` | a map card's key joined to an engine entity; the "describe the map" sentence's neighbours | `build-card-faces.js --check` |
| `country-names.js` | the 257 present-day countries with a label point, and the 55 v1 spellings → v2 names | `build-country-names.js --check` |
| `findit-areas.js` | Find it's dated area rings (frozen from the retired `polities.js`) | frozen once; no builder (`.claude/atlas-build/frozen/README.md`) |
| `credits.js` | the credits page's table | `build-credits.js`, `check-credits.js` |

`.claude/atlas-build/frozen/` holds what the remaining code needed from the deleted v1 files, extracted once and committed (§7). `rivers.js`, `rivers/` and `countries.js`, `country-stats.js`,
`country-spans.js`, `country-sources.js` are **not** Atlas v2 files and stay: the first draw a river locator's own river, the others are the place card's prose (bundle `atlas2prose`).

Rules that fail silently: names are English, one row per Wikidata item per kind (`build-gazetteer.js`, `check-gazetteer.js`); a polity's Wikidata item and Wikipedia title are Cliopatria's own
pair corrected by `polity-qids.json` (`docs/atlas-v2-polity-qids.md`); rebuild `history.bin` with `--no-cache`; the `.bin.js` twins for `file://` total at most 12 MB (§7).

## 4. What the Atlas shows of the reader

* **Study layer** (Phase 3b): the Map / Personal / Full switch is COMPUTED from the host's `studiedCards()` — the keys of `S.cards`, a card with a record — and the lazy `card-places.js` +
  `places.js`; never stored, never in the progress blob (only the view and the collections switched off sit in `localStorage`, `folio.atlas2.studyOff`; v1's `S.settings.atlasHidden` is copied there once).
  **Every flagged place and polity is its own mark** at its own position at any zoom — no clusters, no count badge, no setting to bring them back (design §7 "Stacks removed"); a tap on marks that
  overlap fans them out. `study.js` is pure and also `require`d by `.claude/test-study.js`.
* **Discovery**: a place card's "New discovery" chip and the account page's meters read and write the existing `placesSeen` register (`markSeen`). Its keys are the *names* of present-day countries
  (and open-ended others); for 55 countries v1 spelled the name differently from the gazetteer, and `atlasPlacesSeenMigrate()` adds the new key with the old key's time at boot (§8).
* **The glossary pin** ("show on the Atlas") asks `glossary-places.js` and opens `#map/…/<place>`.
* **Sources on a polity's or people's card.** v1's per-year sources on a country (`COUNTRY_YEAR_SOURCES`) are not shown; a provenance view is a later phase. What the card does say, for every one of the 233 history entities (`test-atlas-card.js` §3b opens each and checks): the source it was drawn from, by name, with its version and licence (Cliopatria v0.2.0, CC BY 4.0 for the 157 polities, 31 contested and 11 nested entities and the 8 peoples; Hosner et al. (2016) and the OpenStreetMap land polygons for the 4 cultures; "Folio’s own authored extent" and its note — which names OpenHistoricalMap or the Royce Schedule where an extent is derived — for the 18 extents; the Wikimedia Commons maps and the US Army’s atlas for the 4 front entities), plus the Wikipedia link where the source gives one (4 cultures have none). It is a sentence, not a linked citation list: the full citation, DOI and URL are on `#credits`.
* **Settings**: "Atlas home" (the country the Atlas opens on; the picker is filled from `country-names.js`), "Describe geography maps" (`mapAlt`, the sentence under a map window).

## 5. Card windows and Find it

`docs/atlas-v2-card-windows.md` is the whole contract. In short: a map card, a locator and a war card each draw into a 2D canvas the **hub** (one WebGL2 context for the page, disposed after the idle
time) paints; a card's key is joined to an engine entity by `card-faces.js`; a war window is drawn at the war's middle year on the history; Find it deals the SAME five rounds a day it always did
(a copy of the pool builder moved into `atlas-windows.js`, its deal proven equal on 60 dates by `.claude/compare-findit-deal.js`) and scores a country or a state by the ID pass. Nothing a reader does
to a window's map opens the Atlas; only the window's globe button does (a map card has none).

**The fallback (Phase 5, owner decision 3).** v1's window is gone, so a browser that cannot run the WebGL2 engine, or whose bundle is refused, gets the engine's Canvas 2D path
(`atlas-canvas.js` through the same hub, `canvas2d` mode, zoom capped at 8): map cards and locators work without the outline glow; **war windows draw no tint** (the still renderer draws no history) and
show their key and a sentence; Find it plays (country and point rounds are scored by the CPU pick, area rounds from the frozen rings). When even that cannot start, the window prints one plain sentence
(`.mc-plain-note`, `data-map-engine="none"`). `test-window-fallbacks.js` runs all of it in a no-WebGL2 context and with the bundle refused.

## 6. Sources and credits

`#credits` lists only the sources of files that ship, generated from their headers: every file under `atlas/data/` and the two river files carry `/* sources: […] */` and `build-credits.js` merges them
(`check-credits.js` in CI fails when the page lags; `test-atlas-credits.js` proves the page against the files, never against a list typed in the test). **Adding a data file means giving it a `sources` header.**

## 7. What v1 left behind, and where it went

| it was | now |
|---|---|
| `world.js` (country polygons, names, label points), `us-states.js`, `china-provinces.js`, `russia-subjects.js`, the capitals and cities tables | deleted. The names, codes, label points, near-ring boxes, dots and neighbour lists the remaining code needs: `.claude/atlas-build/frozen/layers.json` → `card-faces.js`, `card-neighbours.js`, `country-names.js` |
| `timeline.js` (13 era maps) and the map editor, `ADMIN_EDITS.timeline` | deleted (Q-A1 a); a stored or published timeline delta is ignored on read and never written back (`normalizeAdminEdits`) |
| `polities.js`, `country-series.js`, `fronts.js`, `country-years.js`, `admin1.js`, `ranges.js`, `forests.js`, `uk.js`, `water.js`, `cities.js`, `lakes.js`, `coast/` | deleted. Find it's dated rings → `findit-areas.js` |
| `heightmap.js`, `heightmap-ultra.js` (12 MB of data-URI PNGs) | deleted. `img-src data:` stays in `_headers` (avatars) |
| `state-capitals.js` | `frozen/state-capitals.json`, an input of `build-history.js` |
| the Personal-Atlas register (`atlasRegister*`) | deleted, except Find it's pool builder (moved into `atlas-windows.js`, same deal) |
| `startCardGlobeV1`, v1's Find it | the Canvas 2D path (§5) |

`.claude/atlas-build/freeze-*.js` were run once and deleted with the files they read; `frozen/README.md` names the commit that last held the sources. The cards' old `locator`, `war` and `map` fields **stay**: they are the card windows' drawing spec (`CARD_MAP_LAYERS`, the `card-faces.js` join), not leftovers of v1. **No migration removes them** — `migrate-places.js --finish` is not run, and nothing is to run it without a new decision; removing them is a later phase that has to teach the windows to read `places` first.

## 8. Reader data

`placesSeen` and `glossSeen` are progress fields (`PROGRESS_FIELDS` is unchanged by the swap; `docs/accounts-sync.md`). The one change to a key: `atlasPlacesSeenMigrate()` (`app.js`, run when
`country-names.js` lands — the idle warm, the account page, the Atlas, Find it) copies each of the 55 old country spellings to its new name with the SAME first-seen time; **additive, one-way, idempotent**,
the old key stays (an older tab or device still reads it), nothing is removed, an existing key is not touched, and the register is never pushed over `SEEN_CAP`. `test-progress-registers.js` seeds a reader with
every old spelling and proves it.

## 9. Tests, and "Re-run after touching"

| you touched | re-run |
|---|---|
| `atlas.js`, `atlas-gl.js`, `atlas-canvas.js` (render, labels, picking) | `test-atlas-render.js`, `test-atlas-labels.js`, then `test-atlas-perf.js` (the frame gate) |
| the rail, the year, the history | `test-atlas-time.js`, `test-atlas-stages.js`, `test-peoples.js`, `test-war-sides.js` |
| the place card, the search, the address | `test-atlas-card.js`, `test-atlas-search.js`, `test-atlas-redirects.js`, `test-layout.js` (the deep-link smoke) |
| the keyboard and screen-reader path | `test-atlas-a11y.js` |
| phones | `test-atlas-phone.js`, `test-card-windows-fixes.js` |
| the study layer | `test-study.js` (no browser), `test-atlas-study.js`, `test-places.js`, `test-discovery.js` |
| the fallbacks (no WebGL2, context loss, `file://`) | `test-atlas-fallbacks.js`, `test-window-fallbacks.js` |
| a card window or Find it | `test-atlas-embed.js`, `test-atlas-windows.js`, `test-map-cards.js`, `test-card-locator.js`, `test-war-cards.js`, `test-findit-learn.js`, `test-panels.js` |
| the worker, the format reader, earcut, `topology.bin` | `check-core-cache.js --install`, then the render suites |
| a data file | its builder's `--check` / its checker (the table in §3), then `check-credits.js` |
| progress or `placesSeen` | `test-progress-registers.js`, `test-discovery.js` |
| the credits page | `test-atlas-credits.js` |
| a long session (memory, caches) | `test-atlas-session.js` (five minutes) |
| the cold-load order (`whenIdleAfterGlobe`, `topologyIn`, the cached first frame, `preWorker`) | `test-atlas-first-globe.js`, `test-atlas-embed.js`, `test-atlas-fallbacks.js` |
| the names' size (`labelScaleNow`, `fs` in the layout message, the worker's literals) | `test-atlas-labels.js` §12 (then `check-core-cache.js --install` if the worker moved) |
| the cold-load cost | `node .claude/measure-atlas-cold.js --route=map --profile=desktop|phone` (a tool, not a gate; prints `firstGlobeMs` and "ready") |

`test-atlas-review.js` holds the regressions of the Phase 2a review; `test-atlas-relief.js` the relief's land/sea rule. CI runs every browser suite in the `browser` job except `test-atlas-perf.js` and
`test-card-windows-fixes.js`, each of which has a job of its own.

## 10. The in-app help

The "?" button opens the **About this map** sheet (`atlas.js`): what the colours mean, how to move (drag, pinch, wheel, arrow keys, `Home`), what the rail does, the study view, the Sources and credits link,
and — in `.atlas2-about-use` — a short paragraph on how to use it. A first visit shows no coach-mark card over the globe (v1's strip went with v1). Update the sheet in the same commit as any control it names.
