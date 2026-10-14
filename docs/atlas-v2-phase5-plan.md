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
| c | **Data the remaining code needs from a retired file is frozen, not kept**: the layer names, label points, bounding boxes, dots and neighbour lists of `world.js`, `us-states.js`, `china-provinces.js`, `russia-subjects.js`, the capitals and cities tables go to one small committed JSON (`.claude/atlas-build/frozen/layers.json`) that `build-card-faces.js` reads instead of the shape files; the 104 area rounds' rings go to `atlas/data/findit-areas.js`; `state-capitals.js` becomes `frozen/state-capitals.json` (an input of `build-history.js`). | `build-card-faces.js`, `build-history.js`, `add-card.js` and others read these files; deleting them without a replacement breaks the pipeline and card authoring. |
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
| `polities.js` | 7,844,924 | 510,337 | `POLITIES`, `POLITY_LINKS` (Cliopatria steps) | v1 page; Find it's area rounds (`fi2PolityRings`); `build-site-hulls.js`, `check-coast-fit.js`, `test-polities.js` | **delete**; the 104 area rounds' rings → `findit-areas.js` (§4.2) |
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
from `ATLAS_CARD_FACES.layers.world` (already there) and its **largest-ring area** is added as a 8th element of each world row; the 104 area stacks (90 dated) that
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

## 8. The test mapping (filled in as the suites change; the table is complete at the end)

See the table at the end of this file once built.

## 9. As built

*(filled in at the end of the phase)*
