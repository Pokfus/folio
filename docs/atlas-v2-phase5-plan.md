# Atlas v2, Phase 5 — the swap: what goes, what stays, what replaces it

Phase 5 of `docs/atlas-v2-design.md` §7: `#map` becomes the v2 Atlas, v1's page, its data and its helpers are deleted in one release (Q-A5 a),
nobody loses a bookmark, a mark of progress or an edit, and the site is smaller and faster than before. This file is the inventory and the plan
written before any deletion (Task 1 of the brief); the **as-built** numbers are in the last section and in `docs/atlas-v2-design.md` §7 "Phase 5 — as built".

Contents: 1 · the owner's four decisions and what this plan decided beyond them · 2 · what is removed, with sizes and who still reads it ·
3 · what stays · 4 · the hidden dependencies the grep found, and how each is met · 5 · reader data (the STOP test) · 6 · the order of commits ·
7 · the `file://` twins · 8 · the test mapping · 9 · as built.

## 1. The decisions

The owner's four (made, implemented, not reopened):

1. **The cards' old `locator`, `war` and `map` fields stay.** The card windows still read them (through `CARD_MAP_LAYERS`, `cardLocator`, `cardWar` and the
   card-faces join); `migrate-places.js --finish` is **not** run. Removing them needs the windows to read `places` — a separate later phase.
2. **The `file://` twins total at most 12 MB**: the 2b pilot twin (`atlas/data/history.bin.js`, 1,064,707 B) goes and so does every retired v1 data twin
   (there is none besides it). §7 has the arithmetic: deleting it alone leaves 12.19 MB, so the war slice's twin is also shipped gzip-compressed.
3. **The windows' no-WebGL2 / refused-bundle fallback survives v1's deletion**: `startCardGlobeV1` and v1's Find it are replaced by the engine's Canvas 2D
   renderer (`atlas/atlas-canvas.js`, which the Atlas page already uses without WebGL2) driven through the same hub — §4.5.
4. **Readers' progress is sacred.** `placesSeen` and `glossSeen` keep working; if deleting `atlasRegister*` changes a key, an additive one-way migration
   at boot, with a test. §5 finds the one such key (`placesSeen`'s country names) and says what the migration does.

What this plan decided beyond them (each with its reason; the owner can overrule any):

| # | decision | why |
|---|---|---|
| a | **Find it's pool builder is moved, not deleted.** `atlasRegister` / `atlasRegisterAll` / `atlasStackKey` / `atlasStackOrder` are what deals Find it's day (`atlas-windows.js` `fi2Pools` reads them through the context). They move into `atlas/atlas-windows.js` as Find it's own `finditRegister` (lazy, off the eager path) and read the same old card fields, so **the daily deal is identical** — pinned by a golden record of the rounds for 60 dates, taken before the change and asserted after it. | A rebuilt pool would change every reader's daily five places; the design says nothing of it. |
| b | **The "Discovered!" chip on a card's window** (`atlasPlaceIsNew`, "this card earns a place you did not have") is re-based on v2's own definition — a card's `places` ids against the studied set — instead of v1's register. | The chip must say what the new Atlas will show; v1's rules (a name that fits the answer, no regions, no ranges) were rules of v1's globe. |
| c | **Data the remaining code needs from a retired file is frozen, not kept**: the layer names, label points, bounding boxes, dots and neighbour lists of `world.js`, `us-states.js`, `china-provinces.js`, `russia-subjects.js`, the capitals and cities tables go to one small committed JSON (`.claude/atlas-build/frozen/layers.json`) that `build-card-faces.js` reads instead of the shape files; the 103 dated area rounds' rings go to `atlas/data/findit-areas.js`; `state-capitals.js` becomes `frozen/state-capitals.json` (an input of `build-history.js`). | `build-card-faces.js`, `build-history.js`, `add-card.js` and others read these files; deleting them without a replacement breaks the pipeline and card authoring. |
| d | **`mapAlt` ("Describe geography maps", the accessibility setting) keeps working**: the neighbours sentence is computed at build time (the same proximity-on-a-grid rule, `mapNeighbours`) into `card-faces.js`, and the engine's window prints it. | Today the engine's window hands a `mapAlt` reader to **v1's window** (`atlas-windows.js` line 46) because only v1 loaded the shapes. Deleting v1 would silently remove an accessibility feature. |
| e | **`S.settings.home` ("Atlas home")** keeps working: the Settings picker is filled from a 257-name table (`atlas/data/country-names.js`, generated) and the Atlas opens on the home point when nothing else sets the view. | The setting exists and was honoured by v1 only; v2 ignores it today. |
| f | **`S.settings.atlasHidden`** (v1's collections switched off) is copied once into v2's per-viewer key. | A reader's switches should survive; it is a view preference, so the copy is additive and never written back. |

## 2. What is removed

### 2.1 `app.js` (3,932,874 B, 53,903 lines before)

| what | where (before) | size | who else reads it |
|---|---|---|---|
| `PAGES.map = function (root, params)` — the whole v1 Atlas page, its Find-it game mode, the editor, the limb DOM, the heightmap loader, `atlasNameFits`' caller, every drawing pass | 41085–46661 | **440,997 B, 5,577 lines** | the router (`route("map")`), `PAGES.findit` (game mode — replaced by `findit2`), `startCardGlobeV1`'s last resort (`PAGES.map(root, {game:true})`), nothing else |
| `startCardGlobeV1(host)` — v1's card/locator/war window | 34645–35804 | **83,815 B, 1,160 lines** | `startCardGlobe` (the no-WebGL2 fallback), `atlas-windows.js` (`v1()` for `mapAlt`), `atlas2Ctx` |
| v1-only helpers it leaves behind: `mapNeighbourCells`, `mapNeighbours`, `subdivInner`, `andList`, `hiresCoastIngest`, `hiresRiverIngest` (the coast splice), `CMAP_SKIP`, `NBR_MIN_CELLS`, `closeRings`, `placeSources`, `ATLAS_YEAR_PROSE`, `mapFs` | 33554–35490 | ≈ 9 KB (measured by the reachability pass, `/tmp` tool kept out of the repo) | — |
| the Personal-Atlas register: `atlasRegister`, `atlasRegisterAll`, `atlasUnlocks`, `atlasCollections`, `atlasCollHidden`, `atlasCollOff`, `setAtlasColl`, `atlasNameFold`, `atlasNameFits`, `MINE_POLITY`, `MINE_STATE`, `_atlas*Cache` | 37116–37470 | ≈ 17 KB | **Find it** (`atlasRegisterAll`, `atlasStackKey`, `atlasStackOrder` through `atlas2Ctx`) and the chip (`atlasPlaceIsNew`) — moved, §1 a and b; the rest is deleted |
| the map editor and `ADMIN_EDITS.timeline` (Q-A1 a): `persistTimeline`, `serializeTimeline`, the Timeline admin tab (`adminRenderTimeline`, `adminState.tab === "timeline"`), `traceMapToGeo`, `traceColorContours`, `dpSimplify`, `simplifyClosed`, `parseEraYear`, `eraYearLabel`, `newEraId`, `eraPointCount`, `atlasEditEraId`, `tlObjUrl`, the `timeline.js` entries of `autoSaveFiles` / "Save to project" | 755, 10986, 50514–50619, 51882–52070, 52098, 52591–52640, 53213–53223 | ≈ 30 KB | the admin editor only |
| `DATA_BUNDLES` entries `world`, `usstates`, `chinaprov`, `russubj`, `worldcaps`, `statecaps`, `polities`, `fronts`, `countrysteps`, `coast_*`, `atlas`; `CARD_MAP_LAYERS`' `bundle`/`global`/`cell`/`pointsBundle` fields; `CMAP_SUBDIV`'s shape; the `world`/`atlas` loading states | 10835–10990, 34270–34340 | ≈ 14 KB of comments and tables | the card windows read only `what`, `plural`, `points`, `dotWhat` |
| the glossary pin's v1 branch (`GLOSSARY_PLACES` coordinates, `GLOSSARY_MAP_COUNTRY`, `route("map", {focus})`) | 1371–1400, 4468, 45404, 45468 | ≈ 3 KB | the pin now always asks `atlas/data/glossary-places.js` |
| the preview switch: `atlas2Preview()`, `atlas2Engine()`'s `"0"` way back, `atlas2ApplyPreviewHash()`, the `#map2?preview=` handling | 1385–1400, 53635, 53873 | ≈ 3 KB | — |
| dead after the above (found by a second reachability pass, listed in §9 once built) | | not yet measured | |

**Expected `app.js` after: ≈ 3.30 MB (−0.63 MB, −16 %).** Measured figure in §9.

### 2.2 Data files (every one lazy; none on the eager path)

| file | bytes | gzip | families / globals | still read by | verdict |
|---|---:|---:|---|---|---|
| `timeline.js` | 3,607,124 | 1,125,314 | `TIMELINE` (13 era maps, historical-basemaps) | v1 page; `card-war.js`, `add-era*.js`, `add-place-info.js`, `atlas-audit.js`, `check-overlay.js`, `patch-lake-holes.js` (tools); `test-discovery.js`, `test-polities.js`, `test-atlas-card.js` | **delete**; `card-war.js` reads `frozen/v1-names.json` instead |
| `world.js` | 1,729,097 | 497,212 | `WORLD_GEO` (258 countries, polygons) | v1 page; Settings home picker; the countries meter and the *Circumnavigator* badge; Find it (`atlas-windows.js` 448, 585); `build-card-faces.js`; `add-card.js`, `add-glossary.js`, `add-sources.js`, `add-card-wars.js`, `card-war.js`, `fetch-place-coords.js`, `geo-util.js`; many tests | **delete**; names/points/areas → `country-names.js`, `card-faces.js`, `frozen/layers.json` |
| `polities.js` | 7,844,924 | 510,337 | `POLITIES`, `POLITY_LINKS` (Cliopatria steps) | v1 page; Find it's area rounds (`fi2PolityRings`); `build-site-hulls.js`, `check-coast-fit.js`, `test-polities.js` | **delete**; the 103 dated area rounds' rings → `findit-areas.js` (§4.2) |
| `country-series.js` | 733,598 | 96,012 | `COUNTRY_STEPS` | v1 page; `check-coast-fit.js`, `test-polities.js` | **delete** |
| `fronts.js` | 608,511 | 128,662 | `WW2_FRONTS` | v1 page; `test-polities.js` | **delete** (the engine has the front as `front` entities, Phase 2d) |
| `country-years.js` | 929,249 | 295,817 | `COUNTRY_YEARS` (gated off since Aug; Q-A2 drops it) | `add-country-sources.js`, `test-spelling.js` | **delete** |
| `admin1.js` | 1,718,147 | 515,601 | `ADMIN1` (removed layer, "not loaded at all") | nothing | **delete** |
| `ranges.js` | 31,395 | 12,352 | `RANGES` (removed layer) | nothing | **delete** |
| `forests.js` | 50,819 | 18,770 | `FORESTS` | v1 page | **delete** |
| `uk.js` | 48,569 | 14,315 | `UK_SUBUNITS` | v1 page | **delete** |
| `water.js` | 16,164 | 5,560 | `WATER` | v1 page | **delete** |
| `cities.js` | 109,749 | 34,629 | `CITIES` | v1 page; `test-atlas-card.js` | **delete** |
| `lakes.js` | 172,307 | 50,554 | `LAKES` | v1 page; v1 window; `build-forests.js`, `build-china-provinces.js` | **delete** (the engine draws lakes from `water.bin`) |
| `heightmap.js`, `heightmap-ultra.js` | 3,578,493 + 8,867,709 | 2,696,369 + 6,668,043 | `HEIGHTMAP*` (data-URI PNGs, injected by script) | v1 page only; `_headers` lists `data:` for them | **delete**; `img-src data:` stays for avatars |
| `us-states.js` | 644,900 | 185,242 | `US_STATES`, `US_CAPITALS` | v1 window; `build-card-faces.js`; `add-card.js`; `measure-atlas-holes.js`, `test-map-cards.js`, `test-panels.js`, `test-atlas-windows.js` | **delete**; names/dots/neighbours → `frozen/layers.json` and `card-faces.js` |
| `china-provinces.js` | 546,646 | 160,426 | `CHINA_PROVINCES`, `CHINA_CAPITALS` | as above | **delete** (same) |
| `russia-subjects.js` | 1,365,376 | 414,332 | `RUSSIA_SUBJECTS`, `RUSSIA_CENTRES` | as above | **delete** (same) |
| `world-capitals.js` | 13,926 | 5,831 | `WORLD_CAPITALS` | `build-card-faces.js`, `add-card.js` | **delete** (dots → `card-faces.js`) |
| `us-cities.js` | 2,429 | 1,265 | `US_CITIES` | same | **delete** (same) |
| `state-capitals.js` | 8,905 | 3,296 | `STATE_CAPITALS` | `build-history.js`, `check-history.js` (inputs of `history.bin`) | **delete**; becomes `frozen/state-capitals.json` |
| `coast/*.js` (5 files) | 1,367,513 | — | `HIRES_COAST` splice | v1 window only (`hiresCoastIngest`) | **delete** |
| **total retired** | **≈ 36.5 MB raw** (of which heightmaps 12.4 MB) | | | | |

Not on the list, and why they stay: §3.

### 2.3 Builders, checkers and tools in `.claude/`

Deleted with their output (the build script of a deleted file has nothing to write): `build-admin1.js`, `build-china-provinces.js`, `build-cities.js`,
`build-country-series.js`, `build-era.js`, `build-forests.js`, `build-fronts.js`, `build-heightmap.js`, `build-hires-coasts.js`, `build-lakes.js`,
`build-polities.js`, `build-ranges.js`, `build-russia-subjects.js`, `build-site-hulls.js` (its output `site-hulls.json` stays, committed, and is read by `build-history.js`),
`build-state-capitals.js`, `build-uk.js`, `build-us-cities.js`, `build-us-states.js`, `build-water.js`, `build-world-capitals.js`, `gen-world.js`, `check-coast-fit.js`,
`add-era.js`, `add-era-cities.js`, `add-place-info.js`, `atlas-audit.js`, `check-overlay.js`, `patch-lake-holes.js`, `audit-geography.js` (if it only reads them).
Kept and re-pointed at the frozen tables: `build-card-faces.js`, `build-history.js`, `check-history.js`, `add-card.js`, `add-card-wars.js`, `add-glossary.js`,
`add-sources.js`, `card-war.js`, `geo-util.js`, `fetch-place-coords.js`, `measure-atlas-embed.js`.
Kept as they are: `build-rivers.js` and `build-hires-rivers.js` (rivers.js and `rivers/` stay, §3).
Also deleted at the end of the phase: `measure-atlas-holes.js` (it compared the engine's tinted state with v1's `US_STATES` / `RUSSIA_SUBJECTS` polygons, which are gone; `measure-atlas-embed.js` keeps its engine mode, its v1 mode can no longer run).

### 2.4 Styles, markup, worker, headers

* `styles.css` (898 KB): v1's Atlas rules (the `#globe`/`.globe-stage`, `.atlas-*`, `.cp-*` place panel, `.mine-*`, era rail, limb, tour and help rules, from the
  "Atlas: globe + timeline" block at ≈ line 4753 on, with their phone and tablet media rules) are removed by a **reachability pass over class and id tokens**:
  a rule goes only when every selector names a token that no remaining `.js` or the HTML mentions. The shared rules (`.disc-chip`, the data-loading state) stay. Size: §9.
* `index.html`: the header comment about bundles `world` and `atlas`, and `ranges.js + admin1.js … not loaded at all`, are rewritten.
* `sw.js`: `VERSION` `"v6"` → `"v7"` (a cache generation: the old files leave readers' caches on activate); the comment that names `world.js`, `timeline.js`,
  the heightmaps is rewritten. `SHELL` lists none of the retired files.
* `_headers`: `img-src data:` stays (avatars); only the comment's "heightmap PNG data-URIs" goes.

### 2.5 Tests and CI

See §8: the suites that test v1 (`test-personal-atlas.js`, `test-atlas-places.js`, `test-polities.js`) are deleted with a mapping table; the three v1 window suites lose
their `FOLIO_ENGINE=v1` pass; `test-engine-switch.js`, `test-minigames.js` (v1's board), `test-atlas-embed.js` §1 and `test-card-windows-fixes.js`' v1 twins
are rewritten for the fallback of decision 3.

## 3. What stays

| kept | because |
|---|---|
| `rivers.js` (346,680 B) and `rivers/italy.js`, `rivers/greece.js` (138,967 B) | `atlas-windows.js` line 85 draws a river locator's **own river** from `RIVERS` / `HIRES_RIVER` (`wantsOwnRiver`); the engine's water file carries no per-name highlightable line for it. Checked: nothing else in the windows reads rivers. Replacing it needs a new engine primitive — a later phase. `build-rivers.js` and `build-hires-rivers.js` stay. |
| `countries.js`, `country-stats.js`, `country-spans.js`, `country-sources.js` (`atlas2prose`) | the place card's prose for a present-day country (Q-A2 a) and Find it's learn panel |
| the card fields `locator`, `war`, `map` and `places` | decision 1 |
| `atlas/data/*` and `atlas/*` | the new Atlas |
| `site-hulls.json`, `polity-spec.json`, `war-*.json`, `polity-qids.json` | inputs of `history.bin` |

## 4. The hidden dependencies, and how each is met

### 4.1 Find it's pool (`atlasRegisterAll`, `atlasStackKey`, `atlasStackOrder`, `layerPoint`, `WORLD_GEO`, `POLITIES`)
`atlas-windows.js` `fi2Pools` deals the day from the full register (every card's old `map` / `war` / `locator`), from the capitals tables (`layerPoint`), from
`WORLD_GEO` (a country's label point and the largest ring's bounding-box area, `> 30`) and from dated polity rings (`fi2PolityRings`, the area rounds' answer
geometry and the `> 20` size filter). Plan: the register moves into `atlas-windows.js` unchanged (§1 a); `layerPoint` reads `ATLAS_CARD_FACES.dots`; a country's point comes
from `ATLAS_CARD_FACES.layers.world` (already there) and its **largest-ring area** is added as a 8th element of each world row; the 123 area stacks looked up (103 with a Cliopatria series, every lookup recorded before the size filter) that
Find it can ask — measured in a browser on this head: 22,584 ring points in all — are written to `atlas/data/findit-areas.js` by `freeze-findit.js` (one run, from the
v1 data, header `sources` Natural Earth PD + Cliopatria CC BY 4.0). A new area card linked to a polity after this phase has no frozen rings and Find it uses its authored
extent (`first.area`), as the code already does for the 14 undated ones. **The golden record** (§8) pins the day's five rounds for 60 dates before and after.

### 4.2 The Personal-Atlas "Discovered!" chip (`atlasPlaceIsNew`)
Rewritten on the v2 definition (§1 b): the card is a first sighting (`!S.cards[id]`), its `places` ids (`ATLAS_CARD_PLACES`, 62 KB, lazy) are not carried by any studied card.
The check needs the index; it is asked after the bundle lands (the first-sighting test is taken synchronously, before the grade writes the record).

### 4.3 `mapAlt`
See §1 d. `card-faces.js` gains `neighbours` (layer → key → names; ≈ 8 KB). The engine's window prints the same sentence under the map; `startCardGlobeV1`'s `v1()` hand-off is deleted.

### 4.4 Countries meter, achievements, Settings home picker
`countryNameSet()` (the 258 `WORLD_GEO` names) feeds the account page's meter, `countrySeenCount`, the *Cartographer* (50) and *Circumnavigator* (all) badges, and the Settings
home picker. Replaced by `atlas/data/country-names.js` (generated from the gazetteer: the 257 admin-0 names, each with its label point, and the v1 → v2 spelling map), loaded lazily
(`atlas2countries`; the same "0 until it lands, never wrong-but-confident" rule as `world.js` had) and warmed at idle. See §5.

### 4.5 The fallback (decision 3)
`atlas-embed.js` `ensure()` gives up when the controller reports `!embed.webgl`. The controller already runs on `atlas-canvas.js` without WebGL2 (the Atlas page's Q-R3 a path;
`outline()` and `landMask()` already return when `R.gl` is absent). Plan: the hub accepts the Canvas 2D controller (`embed.webgl === false && embed.canvas2d`); `atlas-canvas.js` gains
`highlight(Map face → colour)` (fills each face path once, the page's `select` machinery generalised); a 2D hub caps a window's zoom at 8 (the page caps the still view at 5 km/px) and redraws on
release. Consequences, stated: map cards and locators work (tint, drag, zoom, reveal) without the outline glow; **war windows draw no tint** (history is not drawn by the still renderer) and show their key and a sentence; **Find it plays**: country and point rounds are scored by the CPU pick, area rounds are
drawn and scored from the frozen rings (§4.1). A browser whose bundle is refused (offline, blocked) gets the same sentence and the key. Tested in a no-WebGL2 context (§8).

### 4.6 Build inputs
`build-card-faces.js` reads `frozen/layers.json` (names, `a` codes, label points, near-ring boxes, dots, neighbours); `build-history.js` / `check-history.js` read
`frozen/state-capitals.json`; `card-war.js` and `add-card.js` read `frozen/layers.json` and `frozen/v1-names.json` (the era territory names the old `war` field was checked against).
`frozen/` carries a `README` naming the commit that last held the shape files (`git show <sha>:world.js`): the freezing script is run once and then deleted.

## 5. Reader data — the STOP test

The brief says to stop and report **only if** a deletion touches reader data in a way decision 4 does not already cover. Audit:

| datum | where | touched by Phase 5? | handling |
|---|---|---|---|
| `placesSeen` (name → first-seen time) | progress blob, `PROGRESS_FIELDS` | **its keys are v1's place names**: 258 `WORLD_GEO` names, of which 202 equal the gazetteer's and **56 differ** ("S. Sudan", "Czechia", "eSwatini", "Dem. Rep. Congo", "Côte d'Ivoire", …: 53 are aliases of a v2 country, 3 are not) | **decision 4**: an additive, one-way boot migration copies each differing key to its v2 name with the same timestamp and **keeps the old key** (an old client still reads it; nothing is deleted). Tested with a seeded reader. Era-territory names ("Ottoman Empire") stay as keys: the register is open-ended and counts only the present-day set. `SEEN_CAP` unchanged; the migration cannot push a register past it by more than 56 and does not run when the blob is at the cap. |
| `glossSeen` | progress blob | no | untouched, tested |
| `S.cards`, every other `PROGRESS_FIELDS` entry, the sync | blob | no | untouched; `PROGRESS_FIELDS` unchanged |
| `S.settings.home` | settings | picker source changes | name mapped through the same table at display; stored value untouched |
| `S.settings.atlasHidden` | settings | v1-only | copied once into `folio.atlas2.studyOff` if that key is absent |
| `S.settings.mapAlt` | settings | window path changes | preserved (§4.3) |
| `ADMIN_EDITS.timeline`, `content_overrides` | local storage; Supabase row | **removed (Q-A1 a)** | `normalizeAdminEdits` rebuilds the overlay field by field, so a `timeline` key in a stored or published blob is dropped on read and never written back; an admin's next publish writes a blob without it. **The owner should reset the row to `{}` if it carries a timeline** (`docs/admin-editor.md`). Not reader data: only an admin ever had one. |
| v1's own per-viewer keys (`folio_atlas_tour_v1`, layer choices …) | localStorage | orphaned | harmless; not migrated (the UI they steered is gone) |

**Conclusion: nothing beyond decision 4. No STOP.**

## 6. The order of commits (the tree green at each)

1. This plan + `measure-atlas-cold.js` + the golden record of Find it's rounds (taken on the untouched head).
2. Frozen inputs: `frozen/*.json`, `freeze-findit.js` → `findit-areas.js`, `country-names.js`, the card-faces additions; builders re-pointed. Nothing deleted yet.
3. Windows without v1: the moved register, the chip, the 2D hub, `mapAlt`, the fallback; `startCardGlobeV1` still present but unreachable.
4. The routes (Task 2): `#map` = the Atlas, `#map2` redirects, deep links, the pin, Find it; the preview switch goes; the progress migrations.
5. Delete the page (`PAGES.map`, `startCardGlobeV1`, the register remnants, the map editor, dead helpers) and its CSS.
6. Delete each data family with its builder and checker (several commits); `sw.js` `VERSION`.
7. Credits, docs, help, tests, changelog, version; merge `origin/main`.

## 7. The `file://` twins

`atlas/data/*.bin.js` (before): `topology.bin.js` 4,026,775 · `water.bin.js` 5,809,419 · `history-wars.bin.js` 2,350,691 · `history.bin.js` 1,064,707 = **13,251,592 B**.
Decision 2 removes `history.bin.js` (the 2b pilot twin; no v1 data twin exists): 12,186,885 B — still 0.19 MB over 12 MB (decimal). The war slice's twin is the one with the
most air in it (`history-wars.bin` is 1,755,600 B, gzip −9 628,167 B): it is written gzip-compressed (`enc: "gzip"`, decoded with `DecompressionStream`, which every browser that runs the
engine has), about −1.5 MB, so the total lands near **10.7 MB**. Final figure in §9.

## 8. The test mapping — every deleted assertion and its successor

A row says where an assertion of a deleted suite (or of a deleted section of a kept one) is now held. "**gone**" means the thing it guarded no longer exists *by a decision recorded in the design*
(the third column says which), not that it was dropped; the suites are named so each can be opened and the assertion found by its topic. The numbers in the first column are the assertion's order in the old file at `f7aca62`.

### 8.1 `test-personal-atlas.js` (78 assertions; the personal atlas, v1's second tab)

| old assertions | successor |
|---|---|
| 1–2, 21–23, 28 (two tabs, opens on the reader's own, no world tab, tab kept) | **gone**: v2 has one page and a Map / Personal / Full *switch*. Its default (Personal when the reader has cards, Map when none), its persistence per viewer and its keyboard are held by `test-atlas-study.js` ("a reader with cards opens on their Personal Atlas", "a reader with no cards opens on the plain Map", "the choice is remembered per viewer", "the radios follow the arrow keys") |
| 3–4, 22, 24 (no legend, no search on the personal tab; the full tab's search) | **gone** (v2's legend and search are on every view: Q-A3); `test-atlas-search.js` and `test-atlas-card.js` ("the legend is a chip on a phone …") hold the v2 controls |
| 5, 25, 46–49 (the rail from 4000 BCE, personal rail marks, narrowing, five starts) | `test-atlas-time.js` (the knee, the scale inverts exactly, the pin, fine mode, arrows, `]`/`[`, the ticks are the change years); the rail starts at 3400 BCE — Cliopatria's limit — by design (design §2.4) |
| 6–9 (an empty register says so, nothing marked over a drawn earth, the note gone once there is a card) | `test-atlas-study.js` ("a reader with no cards …", "one card with no place is told so in the singular", "with every collection of theirs switched off the globe is empty and says why") |
| 10–11, 30–32 (the reader's countries in the earned shade, bordered, no name; a Shang place marked today) | `test-atlas-study.js` ("the places drawn are exactly the union of their cards' own places", "everything else is muted", "every mark on the Personal globe is the reader's"); `test-study.js` (the studied set, no browser, 101 assertions) |
| 12–17, 42–43, 55–56 (a click opens the panel headed with the card's answer; its footnotes live; sources collapsed) | `test-atlas-card.js` (the card opens, official name, footnote markers numbered and pointing at listed sources, Wikipedia link, deep link) and `test-atlas-study.js` ("Enter on a button opens that place's card", "a tap 9 px from a lone mark picks it"). The v2 card lists the reader's cards for the place (`appendStudyCards`) instead of one card's answer side |
| 18–20, 44–45 (any year; a modern state absent before its founding, present from it) | `test-atlas-time.js` ("at 100 BCE no present-day country", "a tap on Rome at 100 BCE names Rome (the polity) and no present-day country", "no two adjacent alive polities share a colour"); the founding-year rule is Cliopatria's steps |
| 26–27 (the full tab draws places not studied) | `test-atlas-study.js` ("the Full globe draws the reader's marks and the others' together") |
| 29 (the unearned-land factor is still in app.js) | **gone**: the dim-land shade was a v1 drawing pass |
| 33 (one click the country, a second the province) | `test-atlas-card.js` ("a tap on Lake Victoria stacks the lake and a country", "a second tap at the same spot cycles to the next of the stack") |
| 34–38 (a culture inside its span, in blue; a state in the earned shade; not a people's wash) | `test-peoples.js` (the presence arithmetic and mesh) and `test-atlas-render.js`/`test-atlas-time.js` (colours per palette slot and theme, the label ink) |
| 39 (a river card puts no dot) | `test-atlas-study.js` ("PROPERTY: at nine views every flagged place on screen … one mark each … every mark one of three shapes") + `test-places.js` (a river's mark is a line place) |
| 40 (a chevron press moves the year by one) | `test-atlas-time.js` ("arrows ±1") |
| 41 (the Atlas zooms deeper) | `test-atlas-render.js` / `test-atlas-stages.js` (levels of detail down to the finest tiles) |
| 50–54 (the world view thins the reader's marks; names arrive with marks; no stray border) | **gone by decision**: stacks and clustering were removed on 2026-10-14 (every flagged place is its own mark); `test-atlas-study.js` ("a mark is a dot 4 px across", "the keyboard list is one button per drawn mark and placed name", "no name is placed under the panel") and `test-atlas-labels.js` hold the successor |
| 57–62 (a glossary term in the panel; the phone sheet opens shut; armed by the chevron) | `test-atlas-card.js` ("at 390 px the card is a bottom sheet with a grip", "the grip expands it"); the glossary term inside a card is `test-glossary-page.js` / `test-panels.js`' domain |
| 63–70 (three Rome cards as one place; arrows and swipe between them; no stack bar for one; a capital beats an easier place) | **gone by decision** (stack bar removed with stacks); the v2 card lists a place's cards together (`test-atlas-study.js` "the cards on a place card") |
| 71–77 (the fronts are one map a year, 1939–45, no months; 1941 too; none in a year with none) | `test-atlas-time.js` (the front stepper, "a year with no plate shows no front" in `test-atlas-render.js`) and `test-war-sides.js`; the v2 fronts are 138 dated plates (Phase 2d), so "no month control" is replaced by a stepper |
| 78 (no console or page errors) | every v2 suite ends with "no page errors" |

### 8.2 `test-atlas-places.js` (20 assertions)

| old | successor |
|---|---|
| 1–3 (glossary point-locations ship, are plausible, the country join ships) | `check-places.js` (`glossary-places.js` is what `glossary-places-input.json` and the registry build) + `test-places.js` |
| 4–5 (city labels thin out with zoom) | `test-atlas-labels.js` (the placed-name count is capped at about 40 at the globe and 120 at country scale, no two overlap, curved labels stay upright) |
| 6–8 (the heightmap strength slider) | **gone**: the heightmap layer is deleted; relief is `test-atlas-relief.js` |
| 9–10 (a glossary point is findable in the search and listed as a Place) | `test-atlas-search.js` (the search covers the whole registry, every result carries a kind chip) |
| 11–17 (the marker in the popup; it flies to the Atlas, closes the popup, opens no panel) | `test-atlas-study.js` §7c ("the glossary popup's button opens #map at the term's registry place"; every id in the glossary table resolves in the registry; 181 country terms and 30 of 31 point terms have a place) |
| 18–20 (the reader's text size reaches the canvas) | **NOT HELD, AND NOT TRUE OF v2**: the new Atlas's *chrome* scales with Text size (`calc(px × --fs)`, design §2.9) but its canvas labels do not — a reader on "Very large" gets the same label size as on "Medium". This was already so on `#map2`; the swap makes it the only Atlas, so it is reported to the owner as a regression of v1 behaviour (see §9 "Decisions needed"). No test was written for a behaviour that does not exist |

### 8.3 `test-polities.js` (29 assertions; the dated-border bundle files)

| old | successor |
|---|---|
| 1–11 (every series sorted, non-overlapping, valid rings; every link resolves to a card, a side and a slug) | `check-history.js` (the step topology, per-epoch partition, every entity's steps), `test-war-sides.js` (every `card.war` side resolves to an entity with a step inside the card's years) and `build-wars.js --check` |
| 12–14, 22–23, 29 (the header credits Cliopatria under CC BY 4.0; the help card credits it) | `check-credits.js` + `test-atlas-credits.js` (every source of every file on the page with its licence; the page is generated from the headers) and the About sheet's credits link (`test-atlas-phone.js` "About open") |
| 15–21, 22 (the fronts file: its card, one map a year, four sets, the Pacific from 1943, Berlin) | `fronts-plates.json` + `check-history.js` (138 plates, the uncertainty on every plate) and `test-war-sides.js`; the retired `fronts.js` is not shipped |
| 24–28 (country steps resolve through the era maps; Germany 1960–94; the USSR gone in 1992) | `check-history.js` (Cliopatria's own steps, e.g. West Germany, the USSR's end) and `test-atlas-time.js` |

### 8.4 `test-engine-switch.js` and the `FOLIO_ENGINE=v1` passes

The switch existed to run the three v1 window suites (`test-map-cards.js`, `test-card-locator.js`, `test-war-cards.js`) on v1's windows too. v1's windows are deleted, so CI no longer runs the second pass; the suites run
once, on the engine, and `test-window-fallbacks.js` (new) runs the fallback v1's windows used to be: no WebGL2 (Canvas 2D), the bundle refused (the plain sentence). `test-window-env.js` keeps the three exports
(`launch`, `serve`, `v2()`) the suites imported from the switch. `test-card-windows-fixes.js` lost its `FOLIO_ENGINE=v1` pass (the CI step is gone).

### 8.5 `test-layout.js`

| old section | successor |
|---|---|
| 2 (the globe stage, timebar and tab bar stack by arithmetic) | section 2 (the Atlas block ends clear of the tab bar at three widths) + `test-atlas-phone.js` ("no control under the bottom tab bar") |
| 3 (the rail's year labels never overlap) | `test-atlas-time.js` ("the ticks are the change years on screen") + `test-atlas-phone.js` |
| 4 (the Atlas chrome; the world tab's search; legend on neither tab; Copy link gone; `#map/1938/france`) | **gone** (tabs); the chrome is `test-atlas-phone.js` / `test-atlas-card.js`; the deep links are section 3 (a smoke of the two old forms) and `test-atlas-redirects.js` (all of them) |
| 7c (the discovery chip shares the popup title's row; the × keeps the corner) | `test-discovery.js` (the chip's rule, the register) and `test-atlas-card.js` (the card's head); v2's card has no separate chip row |
| 7e (the Atlas sheet's height: floor, ceiling, remembered) | **gone** (v1's `#countryPop` sheet); v2's sheet is `test-atlas-card.js` ("at 390 px the card is a bottom sheet with a grip", "the grip expands it") and `test-atlas-phone.js` ("card open / card expanded — no overlap, nothing under the bar") |
| the swipe test ("a swipe on the Atlas turns the globe rather than leaving it") | kept, on the v2 page (the helper `atlas()` waits for `.atlas2[data-ready]`) |

### 8.6 Other suites edited for the swap

`test-sources.js` §4 (the place panel's Sources → the v2 card's `.atlas2-srcnote`; the per-year list is gone), `test-tour.js` §6 (the Atlas coach strip is gone: the page opens without a card over the globe),
`test-csp.js` (routes `map` and `map2`), `test-discovery.js` (country names from `country-names.js`, places from `card-places.js`), `test-panels.js` §2 (the frozen neighbour table),
`test-study.js` (two assertions), `test-date-line.js` (its last assertion compared the test's polity kinds with v1's `MINE_POLITY` in app.js; the set is deleted, so the assertion is too — **gone**, nothing replaces it), `test-atlas-perf.js` (v1 reference as constants). The subagent-migrated suites (`test-atlas-*.js`, the window suites, `test-minigames.js`) are listed in §9.

## 9. As built (2026-10-14)

**Totals** (`f7aca62` → this branch): 65 files deleted (35.5 MB, 7,894 lines: 22 root data and tool files, `coast/` ×5, `atlas/data/history.bin.js`, 36 scripts and suites in `.claude/`), `app.js` 3,932,874 → 3,337,406 B and 53,903 → 46,269 lines (−7,634), `styles.css` 926,577 → 873,494 B (−53 KB, 361 rule groups by a class/id reachability pass), `glossary.js` −5.7 KB, the whole diff 156 files, +5,199 / −19,742 lines (the long-lined data files count as few lines).
The cold-load tables are below; the retired lazy data is **36.5 MB raw** none of which was eager.

**Eager path** (`node .claude/check-sizes.js`, level-9 gzip): **2,720 KB → 2,528 KB gzipped (−192 KB, −7 %)**, 11.34 MB → 10.74 MB raw. Only `app.js` (−195 KB gz) and `glossary.js` (−2.5 KB gz) changed; nothing was added to the path. The CI ceiling (3,400 KB) is unchanged.

**Cold load of `#map`** (`.claude/measure-atlas-cold.js`, a fresh browser context, nothing cached, on a quiet 4-core container with the software GL of a headless runner — the time is that machine's, not a phone's GPU):

| | v1 `#map` (before) | v2 `#map2` (before) | `#map` now |
|---|---:|---:|---:|
| desktop 1280×800: a drawn globe | 2,923 ms | 5,135 ms | **4,201 ms** |
| desktop: files / bytes as served / gzip -9 | 50 / 43.27 MB / 11.51 MB | 37 / 31.88 MB / 11.63 MB | **39 / 31.27 MB / 11.44 MB** |
| phone 390×844 @3×, CPU ×4, slow 4G: a drawn globe | 146,498 ms | 118,347 ms | **114,745 ms** |

So against what the route was before the swap, the page asks for **28 % fewer bytes as served (43.3 → 31.3 MB)** and a slow-4G phone draws the globe **22 % sooner**; a desktop with a fast link draws it **1.3 s later than v1 did (4.2 s against 2.9 s)**, because v1 drew a flat canvas from one file while the engine fetches the worker, the topology and the first tiles before its first frame. That is an honest cost of the swap and it is reported to the owner (§9 "Decisions"). Of the bytes, 11.6 MB are the idle-warmed prose (glossary, artefacts, card extras), unchanged by this phase, which compete with the globe on a slow link.

**The `file://` twins**: topology 4,026,775 + water 5,809,419 + history-wars (gzip) 872,332 = **10,708,526 B** (was 13,251,592; the rule is ≤ 12 MB). `build-war-slice.js` fails above 12e6.

**Find it's deal**: `compare-findit-deal.js` recorded 60 consecutive dates' five rounds on the untouched head and checked them on the head that reads the frozen tables: **all 60 days identical** (first attempt failed for every day — the freeze had dropped areas whose dated rings fell under the size filter; the freeze now records every lookup).

**Reader data**: `test-progress-registers.js` (18 checks) — a seeded reader with all 55 old spellings, 40 other countries, two historical territories, glossary terms and other progress keeps every key and time; the 55 new names are added with the old times (an existing new-name key keeps its own); nothing else changes; a second boot changes nothing; a register at `SEEN_CAP` gains nothing, one below it gains exactly one; `PROGRESS_FIELDS` is the pinned list; the meter counts a reader who had every country under the old spellings as having every country.

**Found by the tests, fixed**: leaving the Atlas made a ghost copy of its live canvases (the opt-out in `makePageGhost` was keyed on v1's `.atlas` class; `test-glossary-page.js` caught it).

**Not done / not true of v2, stated plainly**
* The reader's **Text size** reaches the Atlas's chrome but not its canvas labels (§8.2 rows 18–20). v1 scaled them. Not changed in this phase (it needs the label layer and bumps `CORE_CACHE_REV`).
* v1's **year in the place panel's sources** (`COUNTRY_YEAR_SOURCES`) is not shown by the v2 card (general sources only; `country-years.js` was already gated off).
* War windows without WebGL2 draw no tint (stated; tested).
* The rails start at 3400 BCE (Cliopatria), not 4000 BCE.
* Find it's area rounds linked to a Cliopatria series AFTER this phase have no frozen rings and play on the card's authored extent.
* Not verified on a real GPU, a real phone, Safari or Firefox.
