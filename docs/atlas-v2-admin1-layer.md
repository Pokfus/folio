# Atlas v2 — a lazy admin-1 layer (design, 2026-10-30; step 1 built the same day)

> **📖 READ BEFORE ADDING A COUNTRY'S STATES OR PROVINCES TO THE ATLAS, OR BUILDING ANY PART OF THIS.** The design for
> giving more countries their states and provinces — shaded in a map card's window and drawn on the Personal Atlas —
> **without rebuilding `topology.bin`**. India (`geo-india`, 📖 `docs/india-geography-card-plan.md`) is the first country.
> Step 1 (the file, India only) is built — §8 is its as-built note; the other steps in §6 are each their own PR.

## 1. The owner's requirements (2026-10-30)

1. More geography collections will come, each with the country's states or provinces as map cards.
2. **They must all show properly on the Personal Atlas** — a studied state outlined and named, exactly as a studied US
   state, Chinese province or Russian federal subject is today.
3. Adding a country later must be cheap: not a rebuild of the Atlas.

## 2. Why not the two obvious routes (measured)

**Admin-1 inside `topology.bin`** — what the US, China, Russia and the UK have (`ADMIN1` in `build-admin.js`, Q-A7 (a)).
Adding a country means `build-admin.js` and `pack.js` again, and every other generated file is pinned to the core's
`buildId` (`history.bin` and both war slices are refused by `atlas-worker.js` on a mismatch, `water.bin` names its land
build, the IndexedDB core cache is keyed by `CORE_CACHE_REV`). A trial on 2026-10-30, every country's admin-1 against a
baseline of today's four, both on the same OSM coast (the baseline came within 0.03 % of the committed files):

| | baseline (4 countries) | every country |
|---|---|---|
| admin-1 units | 173 | 4,273 |
| `build-admin.js` | ~15 min | ~43 min |
| `out/full.bin` | 18.10 MB | 20.35 MB |
| vertices at the three resident levels (what every visitor loads) | 2.22 M | 2.56 M |
| the core's header (the entity table, inside `topology.bin`) | 69.5 KB | 683 KB |

…and `pack.js` **failed**: two units (Kalkara, Malta; Duarte, Dominican Republic) left rings mixing resident and tile-only
arcs, and with those set aside, tiling Greenland's face failed. So "every country" costs every Atlas visitor about a
megabyte more at first load (estimated: the pack never finished) — and **CI caps the core at 3,145,728 bytes**
(`check-topology.js --max-bytes`, the fast job) against today's 3,018,212, so it would fail that gate outright — and pipeline repairs of unknown extent; "one country at
a time" costs a whole-Atlas rebuild per country. Neither meets requirement 3.

**An outline file the card window paints itself** (as a locator's authored `area` is painted, `paintMasked`) shades a
state in a window but **cannot meet requirement 2**: the Personal Atlas draws only engine entities.

## 3. The design: a second history-format file

**`history.bin` already is a lazy file of states laid onto the core**, and the engine already draws it on the Personal
Atlas and highlights it in card windows:

- `build-history.js` reads the committed `topology.bin` (never `out/`) and conflates each polygon onto the core's land
  partition: coast and present-day border arcs are SHARED by reference (`coreRef`), only the lines the core does not have
  are the file's own arcs. So its states meet the coast and the country borders exactly, at every level.
- `atlas-worker.js` `handleHistory` checks the core's `buildId`, then triangulates a face lazily per level into an LRU.
- `atlas.js` `aliveShown` filters the year's alive set to the reader's discovered entities in the Personal Atlas.
- Card windows already highlight history entities by id (a glossary window's state at its greatest extent, a members
  window's groups: `needHistory: "full"`, `highlights: [{ ids }]`).

**So: `atlas/data/admin1.bin`, a file in `history.bin`'s format, of present-day admin-1 units, conflated onto the
committed core by the same machinery.** Adding a country is a row in a spec and a rebuild of THIS file alone, against the
core as it stands. `topology.bin`, the tiles, water, relief, history, the slices and the core cache never change.

### 3.1 The file

- **Built by `.claude/atlas-build/build-admin1.js`** from **Natural Earth 10m admin-1** (`ne-10m-admin1`, already pinned,
  public domain), writing `history.bin`'s format (`coreRef` arcs into the core, own arcs for the rest) so the engine reads it with the
  code it has. **How it conflates — read 2026-10-30, and the recommendation:** `build-history.js`'s `conflate()` cannot
  simply be called. It is top-level code over globals (the arc, face and entity registries, the strip index, the snap
  log), takes Cliopatria rows (`prepareRow` reads GeoJSON features and `geometry-fixes.json`), and its tolerances are
  Cliopatria's (`TOLERANCE_M` 15 km, `D1`/`D2`/`D3`, the nesting and contest rules). Moving it into a shared `lib/` module
  would put `history.bin` at risk: the refactor has to be proved byte-identical by a `--no-cache` rebuild of the whole
  history. **Recommended instead: a smaller builder for a smaller problem.** Admin-1 units TILE their country, and the
  country's outline is already in the core from the same source (India: every admin-1 vertex within 1 km of Natural
  Earth's admin-0). So the job is not conflating free polygons onto a coast. It is SPLITTING one core face by the units'
  shared interior lines: (1) take each pair of neighbouring units' shared boundary from the source; (2) snap its two
  ends onto the core's boundary of the country face (a tolerance measured, of the order of the 1 km above); (3) walk the
  core face's rings plus those lines into faces; (4) label each face by the unit containing an interior point;
  (5) simplify the own arcs per level (`LOD_M`, as the history does). It reuses `lib/rings.js`, `lib/segindex.js`,
  `lib/geo.js` and the format writer, and copies nothing of `conflate()`. Islands (Lakshadweep, the Andamans) are the
  core's own island faces, labelled whole; enclaves (Puducherry's four) are the same step 4.
- **Rows from `.claude/atlas-build/admin1-spec.json`**, one per country: its ISO alpha-3, the units' DECLARED English names
  and kinds (Natural Earth's `type_en` is wrong on several Indian units, as its names were on Russian ones — the Russia
  plan's rule), and any recorded correction. A country's whole set of units must tile its admin-0 face, checked (India:
  every one of 32,884 vertices within 1 km of Natural Earth's admin-0 India, measured 2026-10-30).
- **Entity ids are the core's scheme**: `adm1:<a3>:<iso code>` (`adm1:ind:in-up`), kind `admin1`, `parent` the core's
  `adm0:` id, with `qid` and `iso`. One step each, `[PRESENT_YEAR, null]` (2022, the core's own present).
- **The header carries `sources`** (Natural Earth admin-1) **and `core.buildId`**; `build-credits.js --install` follows.
- **A `file://` twin** (`admin1.bin.js`) within the existing 12 MB total for twins.
- **A checker**, `check-admin1.js`, in `check-history.js`'s style: the core's build id, every core reference valid at
  every level, each country tiled by its units, no unit outside its parent, ids unique, the spec and the file in step.
  It joins the fast CI job, and so does `build-admin1.js --check`.
- **Size is measured in step 1, not guessed here.** India alone is 32,884 source vertices; conflated, most of its outer
  border is the core's own arcs, so only the inner lines are new.

### 3.2 The engine

- **A second slot in the worker.** Today `HIST` is ONE file: the page's history, or one of the two war slices, and a hub
  on the other slice is replaced. The new file needs its own slot (`ADM1`) held beside `HIST`, through the same code: the
  file reader, the `buildId` check, the lazy per-level triangulation and its LRU, the per-arc style table. The work is
  making those take a slot rather than reading the global, then sending the meshes and segments tagged by slot.
- **When it loads.** Never at boot. (a) The Personal Atlas, when the studied set holds an `adm1:` id that is not in the
  core's entity table (the light `card-places.js` index says so without loading the cards). (b) A card window whose
  card-faces row names an `admin1.bin` entity (`hubOptions.needAdmin1`, alongside `needHistory`). (c) Map, Personal and Full,
  through the legend's **Provinces** switch (§7, decided): when it is on, the year is the present and the view is zoomed in
  past `ADMIN1_KM_PER_PX` (4 km/px) over a country the file carries — the moment the core's own admin-1 lines appear today.
- **The present day.** At `time.present` the page draws only the core's faces today, and the Personal Atlas's present-day
  filter (`refreshPersonalPresent`) keeps core faces whose entity, or whose parent, is discovered. It gains the slot's
  faces and inner lines, by the same rule: a discovered state's face and its border, its name at the face's label point.
  The inner lines take the core's admin-1 line style, so an Indian state looks like a Russian one.
- **The card windows.** `build-card-faces.js` resolves a layer's keys against the core's entity table today; it gains
  `admin1.bin`'s table, and a window whose target is there asks for the slot and highlights by id, as today.

### 3.3 Places, the studied set and the registry

- **A card's `places` names the entity** (`adm1:ind:in-up`), exactly as `gru-` cards name `adm1:rus:ru-sve`, so studying
  it discovers it. `.claude/places-registry.js` (the gazetteer, `places.js` and the history entity table) gains
  `admin1.bin`'s table, so `add-places.js`, `check-places.js` and `build-card-places.js` accept the ids.
- **Search and names**: the history file's entities become synthetic rows (`G.byId`) when it loads; the slot does the
  same. Whether Map and Full also SEARCH Indian states before the file is in is part of Q1.

## 4. Budgets and gates

- **Every existing gate stays green unchanged**: the land files byte-identical (nothing in §3 touches them), the frame
  gate (`test-atlas-perf.js`) on the page as it is, the heap budget (`HEAP_BUDGET_MB`).
- **New**: the file's own size budget, set from step 1's measurement; the worker's mesh memory — the slot's LRU shares
  `HIST_LRU_BYTES` or has its own, decided and measured in step 2; the frame gate re-run with Indian states drawn in
  the Personal Atlas, and a new Personal case.

## 5. Risks, stated

- **Small units.** The trial's pack failures were tiny units (a Maltese local council, a Dominican province). India has
  small ones too: Chandigarh, Delhi, Puducherry's four enclaves, Lakshadweep's islands. The history conflation has its
  own sliver and chord rules; step 1 runs them on India and the checker says what survives.
- **The worker's single-file assumption may run deeper than `HIST`** (the main thread's `time.hist`, `time.ents`,
  `stepsOf`, the style texels are all one file's). Step 2 starts with an inventory of every place that assumes one file.
- **A country the core already carries** (the US, China, Russia, the UK) stays in the core: two sources for one state
  would be two entities with one id. Moving them would be a decision of its own, never a side effect.

## 6. Steps, each its own PR

1. **The file, India only**: `admin1-spec.json` with India's 36 units, `build-admin1.js`, `check-admin1.js`, the twin,
   the credits. Report: size, build time, what the conflation changed. Nothing in the site reads it yet.
2. **The engine slot and the card windows**: the worker's second slot, the window path, the India layer in
   `build-card-faces.js` (+ the capitals' dot table, coordinates FETCHED), `CARD_MAP_LAYERS`, `add-card.js`'s
   `MAP_LAYERS`, `test-map-cards.js` and a window test. **From here the India states and capitals decks can be written.**
3. **The Atlas page at the present day**: the file's states under the legend's Provinces switch in Map, Full and
   Personal (D1: every line in Map and Full, a discovered state's in Personal), the registry ids, a Personal suite case,
   the frame gate over India zoomed in.
4. **The next country** is a spec row and step 1's rebuild — the test of requirement 3.

## 7. The owner's decisions (2026-10-30)

- **D1 — the legend owns it, in all three views, on by default.** Map, Personal and Full draw the states as an option in
  the legend, switched on by default. That switch EXISTS: the legend's **Provinces** (`DEFAULT_LAYERS.provinces: true`,
  `view.admin1` in `atlas.js`), which draws the core's US, Chinese, Russian and UK lines at the present day below
  `ADMIN1_KM_PER_PX`. The file's states join it — **one switch for every country's states, whichever file they come
  from**, the saved `provinces` key unchanged so no reader's setting is lost. Map and Full draw every state line of the
  file's countries; Personal only a discovered state's (§3.2). Being on by default does not make the file load at boot:
  it loads the first time the switch is on, the year is the present and the view is zoomed in over one of its countries
  (or a Personal Atlas holds one of its ids, or a card window needs one). Whether the switch's label should become
  "States and provinces" now that it covers India's states and union territories is a wording call for step 3.
- **D2 — the first build is India alone.** `admin1-spec.json` starts with India's 36 units; step 4 adds the next country.

## 8. Step 1 — as built (2026-10-30)

**What exists.** `atlas/data/admin1.bin` (54,284 bytes) and its gzip `file://` twin `admin1.bin.js` (54,000 bytes; the five twins
now total 10.89 MB of the 12 MB rule), built by `.claude/atlas-build/build-admin1.js` from `admin1-spec.json` and the committed
Natural Earth cache `admin1-source.json` (232 KB: India's quantised rings, with the pin's sha256), checked by `check-admin1.js`.
Both `build-admin1.js --check` (offline: rebuild from the cache and the core, compare bytes and twin) and `check-admin1.js` run in
CI's fast job. `credits.js` was regenerated (the file is listed under the OSM ODbL statement: it references the OSM coast). The
build takes about 2 s, the checker 0.5 s. `topology.bin`, `tiles/`, `water*`, `relief/` and `history.bin` are byte-identical
(`sha256sum` before and after). **Nothing in the site reads the file yet** (step 2).

**The file.** 36 entities `adm1:ind:<iso>` (kind `admin1`, parent `adm0:ind`, `qid`, `iso`, `type` "State" / "Union territory"),
one face and one step `[2022, null]` each; 542 arcs: 433 coast and 38 border references into the core (the outline, so the states
meet the OSM coast and the country's borders exactly at every level) and 71 own `admin1` lines with 12,591 vertices (795 / 2,836 /
12,591 at the three levels). Header extras as the worker reads them for `history.bin`: `core.buildId`, `arcEmpty`, `faceKm2`,
`faceAnchor` (the sample point farthest inside the unit's largest piece).

**The ids use the CURRENT ISO 3166-2 codes**, which Natural Earth 5.1.1 predates: ISO changed four on 2023-11-23 (Wikidata P300,
preferred rank): Chhattisgarh `in-cg` (NE `IN-CT`), Odisha `in-od` (`IN-OR`), Telangana `in-ts` (`IN-TG`), Uttarakhand `in-uk`
(`IN-UT`). Step 2's card-faces layer and the cards' `places` must use these. Delhi's and Chandigarh's `qid` is the territory's
item (Q9357528, Q120971341), not the city Natural Earth names.

**How the split went (measured).** Natural Earth's interior segments chain into 71 lines (one closed loop: Yanam inside Andhra
Pradesh, a hole in it). Every line is clipped where it crosses the core's LOD 2 outline (14 tails in the sea or over a border, 2
cuts in mid-line at Diu's creek); 23 ends still inside the face are extended to the nearest outline point. 39 junctions, 18 on the
coast and 21 on borders; **the largest move 1,244 m** (Goa–Maharashtra at the Terekhol mouth), the median 25 m, all within
`SNAP_M` = 1,500 m. (Natural Earth's own outline is much farther from the OSM coast — median 229 m, 90th percentile 5.9 km in the
deltas and the Rann — but only the lines' ends are snapped, never the outline.) The walk gives 295 faces and one hole; 95 core
islands Natural Earth lacks (490 km² in all, the largest 47 km² in the Sundarbans) take the nearest unit, at most 32 km away (an
Andaman islet); no face was labelled with under 0.9 of its samples. One quantisation knot (Yanam's ring) undone; the planarity
repair re-added 2 vertices (the Punjab–Rajasthan line against the coarse Pakistan border); **0 crossings at every level.** The
units' area equals the core face's at LOD 2 (3,158,385 km², within 0.1 km²). The core's two zero-area two-arc rings at Sir
Creek (arcs 33006/34196, 33008/34197) are left out: they draw nothing.

**The small units.** Chandigarh (119 km²) and Delhi (1,485 km²) are wholly inland: Natural Earth's lines unchanged, both capitals
inside. Puducherry has three pieces — Puducherry (183 km²), Karaikal (196 km²) and Yanam (37 km², the hole in Andhra Pradesh) —
and **no Mahé** (below). Dadra and Nagar Haveli and Daman and Diu has four: Dadra and Nagar Haveli (517 km²), Daman (47 km²),
Diu Island (32 km²) and Ghoghla on the mainland. Lakshadweep is 11 islands (27 km²), Andaman and Nicobar 92 (7,422 km²), each the
core's own island ring labelled whole.

**Three source faults, corrected in the spec** (`corrections`, each verified by the build and the checker):
1. **Mahé is dropped.** Natural Earth's ring for Puducherry's Kerala enclave covers about 125 km² and lies, at its nearest, 40.8 km
   north-north-west of Mahé (Wikidata Q639279: 75.533°E, 11.700°N); the territory is about 9 km². The ground stays Kerala's until
   a sourced outline replaces it.
2. **Pulicat Lake is joined.** Natural Earth leaves the lagoon out of both states, so its Andhra Pradesh–Tamil Nadu line stops at
   the two shores; the core's OSM land counts the lagoon as land. The two ends are joined by a straight 5.2 km chord — Folio's
   approximation, said so in the spec.
3. **Diu Island is Diu's.** Natural Earth's coarse Diu ring left most of the island to Gujarat; Wikidata (Q5283744, P131 Diu
   district) puts the island in Diu, so the core's island ring is given to the territory whole.

**Point assertions.** 45 cities from the gazetteer (found by name and Wikidata item) inside their own unit at LOD 2: 26 capitals
(every one the gazetteer carries; it has no row for Itanagar, Dispur, Panaji, Gangtok, Kohima, Leh, Kavaratti or Daman) and 19
large cities.

**Budget.** `check-admin1.js` holds the file to 512 KB (India alone is 54 KB, so several countries fit before it is raised
deliberately) and every twin together to 12 MB. The worker's mesh memory and the frame gate are step 2's and step 3's (§4).
