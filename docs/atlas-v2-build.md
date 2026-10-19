# Atlas v2 — running the build pipeline

> **📖 READ BEFORE RUNNING OR CHANGING ANY SCRIPT IN `.claude/atlas-build/`.** The design is in
> `docs/atlas-v2-design.md` (§2.3 for the topology, §2.10a for the source rule, §7 for what each phase
> built); this file is only *how to run it*, where its caches live, and how a source is added.

The pipeline is Node, lives in `.claude/atlas-build/`, and **nothing in it ships**: its outputs are
`atlas/data/topology.bin`, `atlas/data/tiles/<z>/<x>-<y>.bin`, `atlas/data/water.bin`,
`atlas/data/water/<x>-<y>.bin`, `atlas/data/relief/`, `atlas/data/gazetteer.js`, `atlas/data/credits.js` and the two
`file://` twins `atlas/data/topology.bin.js` and `water.bin.js`, which the site serves as plain files. **Every one of them
carries a `sources` header** (the JSON header of a `.bin`, the first line of a `.js`, the `sources` key of `relief.json`), and
the Sources and credits page is generated from exactly those headers — so a new generated file needs a header, nothing else.
Its libraries (`npm ci` in that directory) never enter the site — the one shared file is
`atlas/atlas-format.js`, the `.bin` reader/writer the browser, the worker, the checker and the
Playwright suites all load, so there is exactly one definition of every byte.

## The steps, in order

| step | command (from `.claude/atlas-build/`) | reads | writes | time (4 cores, Oct 2026) |
|---|---|---|---|---|
| 0 | `node fetch-sources.js [id…]` | `sources.json` | `src/<id>/` (the archive, unpacked) | minutes (OSM is 923 MB) |
| 1 | `node --max-old-space-size=12000 build-land.js` | OSM land polygons | `out/coast.bin`, `out/land-log.json` | ~90 s |
| 2 | `node --max-old-space-size=12000 build-admin.js` | `out/coast.bin`, NE admin-0, NE admin-1 | `out/full.bin`, `out/admin-log.json`, `out/admin-report.json` | ~20 min (the LOD 4 crossing repair is most of it) |
| 3 | `node --max-old-space-size=12000 build-history.js [--measure] [--dry] [--install] [--force] [--years A,B] [--no-cache]` | the committed `atlas/data/topology.bin` (the LOD 2 land partition: coast rings and present-day borders, read through `lib/format.js` — never `out/`), Cliopatria v0.2.0 (`src/cliopatria/`, `fetch-sources.js cliopatria` first), `.claude/polity-spec.json` (EVERY card-linked series with Cliopatria rows since Phase 2b as STATES; and, since Phase 2c, the PRESENCE layer conflated after the states and alone — the eight `PEOPLES` from Cliopatria (kind `people`), the coastline series `cyclades` and `crete` (the closed OSM coast rings their spec points name, over the years of their linked cards) and the site-hull series `yangshao` and `longshan` (kind `culture`; `.claude/site-hulls.json`, which records the sha256 of the pinned `hosner-2016` source it was built from — `node .claude/build-site-hulls.js --hosner=src/hosner-2016/PANGAEA.860072 --check` rebuilds it); the presence rows have their own epoch cache `out/history-cache/presence-<hash>/` and a rebuild of the presence layer alone takes ~15 s on top of a warm state cache), `.claude/state-capitals-spec.json` + `state-capitals.js` (the period capitals) | `out/history.bin`, `out/history-report.json` (the distributions, the counts, the forecast), `out/history-log.json` (the 2,000 largest snaps and every count; the build fails on a snap over the source tolerance), `out/history-cache/<hash>/` (one JSON per finished epoch — a rerun replays them and conflates only the rest, so a crash costs the minutes since; the hash covers the core, Cliopatria, the spec and every constant, so a changed rule starts afresh; `--no-cache` ignores it); `--measure` prints the d1/d2/d3 distributions and the d2 pair table to `out/history-measure.json` and writes nothing else; `--years A,B` builds that band only (the measurement the stop rule reads); `--install` copies the file to `atlas/data/history.bin`, writes the `file://` twin `history.bin.js` FROM THE PILOT SLICE (the Mediterranean and Near East, 550 BCE – 650 CE: the full file's twin would pass the 12 MB the three twins share), regenerates `credits.js` and writes `docs/atlas-v2-coverage.md`; the STOP RULE: `--install` refuses when the forecast for every series passes 12 MB (`--force` overrides) | ~15 min fresh (494 epochs over 3400 BCE – 2021 CE; the 1500s–1800s are the heavy third); ~2 min replaying the cache (the level repair is most of it); Cliopatria reads in 3 s
| 5 | `node --max-old-space-size=12000 build-water.js [--measure]` | the committed `atlas/data/` (the land partition, read through `lib/landindex.js`), Natural Earth 10m rivers, HydroLAKES | `out/water-full.bin`, `out/water-report.json`, `out/water-log.json` | ~12 min (the overlap pre-pass over 18 M lake vertices and the per-level planarity are most of it) |
| 5b | `node .claude/atlas-build/build-land-changes.js [--fetch] [--install] [--dry] [--check]` (from the repo root; 2026-10-18) | `land-changes.json` (the dated land-change rows: each an area that was WATER until a sourced year — the Zuiderzee polders — with its geometry recipe over CBS Wijken en Buurten 2024, CC0), `land-changes-source.json` (the committed cache `--fetch` writes from PDOK's WFS: each row's finished rings — unioned, filtered, simplified and pushed out to the drawn lake shore, every step that needs polygon-clipping — the CBS water units, the page hashes), the committed `water/16-12.bin` (the drawn lake shore each edge is classed against) | `atlas/data/land-changes.js` (`window.ATLAS_LAND_CHANGES`: the rows' years, sources, quantised rings and per-edge shore classes); `--install` copies it and regenerates `credits.js`; `--check` (CI's fast job) rebuilds from the cache and compares. 📖 `docs/atlas-v2-historical-coastlines.md` §1 | ~2 s offline; `--fetch` ~1 min |
| 6 | `node --max-old-space-size=8000 build-gazetteer.js [--install] [--dry] [--no-wiki] [--refetch] [--tier N] [--town-min N] [--river-rank N]` | the committed `atlas/data/` (faces, lakes, rivers; the z=4 tiles through `lib/landindex.js` for `within` and the anchor checks), NE 10m populated places, marine polygons, regions polygons and points, NE admin-0 (name variants, label points), `countries.js` (the v1 prose keys), Wikidata's query service (enwiki sitelinks, cached in `wiki-sitelinks.json`) | `out/gazetteer.js`, `out/gazetteer-report.json` (size per kind, the v1 key mapping and the countries without prose, the anchors the partition could not place); `--install` copies the file into `atlas/data/gazetteer.js` | ~30 s of geometry; the first Wikidata fetch ~25 min (the query service rate-limits a shared address, the build backs off), later runs read the cache |
| 6b | `node .claude/atlas-build/build-places.js [--install] [--dry] [--check]` (from the repo root) | `places-spec.json` (the rows `migrate-places.js` derived from the cards' locators, `by: migration`, and the owner's `manual: true` rows from `add-place.js`), `places-wikidata.json` (the Wikidata cache: titles, searches around a coordinate, classes, and `items` — every accepted item's coordinate and classes) | `out/places.js`; `--install` copies it to `atlas/data/places.js` (`window.ATLAS_PLACES`, the gazetteer's shape, one row per Wikidata item, id `pl:q<number>`) and regenerates `credits.js` | ~1 s |
| 6c | `node .claude/migrate-places.js [--fetch] [--check] [--dry]` (from the repo root; Phase 3a) | the cards (through `card-io.js`), the registry (`.claude/places-registry.js`: gazetteer + places + the history entity table), `polity-spec.json`, the Wikidata cache; `--fetch` asks query.wikidata.org for the toponyms the cache lacks (titles, then a search around each open coordinate, then the classes met; 429s are backed off; every answer is cached at once) | `places-spec.json`, `atlas/data/places.js` (through 6b), the cards' `places` (data-extra/, additive — the old fields untouched), `docs/atlas-places-report.md` | ~10 s offline; `--fetch` ~1–2 h on the shared address |
| 6e | `node .claude/atlas-build/build-card-places.js [--install] [--dry] [--check]` (from the repo root; Phase 3b) | the cards' heavy `places` field (through `card-io.js`) | `out/card-places.js`; `--install` copies it to `atlas/data/card-places.js` (`window.ATLAS_CARD_PLACES`: `ids` the registry ids any card carries, `cards` card id → indices into `ids`, places and polities alike; a first install regenerates `credits.js`). The LIGHT index the Personal Atlas reads so it never loads the heavy collection files; a pure function of the cards (`digest` is a hash, not a clock); 61.8 KB at 2,476 cards and the build FAILS over 200 KB (propose a split by collection). `migrate-places.js` and `add-places.js` run it after they write `places`, so it cannot lag. |
| 6d | `node .claude/atlas-build/add-place.js --qid Q… --kind … --reason "…" [--name] [--sub] [--within] [--alias]` | Wikidata (one item: coordinate, classes, label, title) | a `manual: true` row in `places-spec.json`, the item in the cache, `atlas/data/places.js` rebuilt; refuses an item with no coordinate, a kind its classes contradict, or an item the registry already carries | seconds |
| 7 | `node --max-old-space-size=14000 build-relief.js [--install] [--levels 0,1,2]` | ETOPO 2022 60 arc-second GeoTIFF | `out/relief/` (L0 and L1 as three greyscale PNGs per tile, `relief.json`); `--install` copies them into `atlas/data/relief/` | ~45 s (L2 adds 20 s and 119 MB; not shipped) |
| 8 | `node pack.js [--install]` (`--twin` alone: only the file:// twin of the committed core) | `out/full.bin` | `out/dist/` (the core, the tiles, `tiles-report.json`); `--install` copies them into `atlas/data/`, writes `atlas/data/topology.bin.js` (the base64 twin, lib/twin.js) and regenerates `credits.js` | ~1 min |
| 8b | `node pack-water.js [--install] [--dry]` (`--twin` alone: only the water twin) | `out/water-full.bin` | `out/dist-water/` (`water.bin`, `water/<x>-<y>.bin`, `water-report.json`); `--install` copies them into `atlas/data/` — the land files are untouched —, writes `atlas/data/water.bin.js` while both twins fit 12 MB (decimal), and regenerates `credits.js` | ~10 s |
| 8c | `node build-credits.js [--install] [--dry] [--check]` | the `sources` header of EVERY file under `atlas/data/` | `out/credits.js`; `--install` copies it to `atlas/data/credits.js` (every other `--install` above runs this for you) | ~3 s |
| 9 | `node check-topology.js --tiles` (from the repo root: `node --max-old-space-size=8000 .claude/atlas-build/check-topology.js --tiles`) | `atlas/data/` | nothing; exit 1 on any failure | ~4 min |
| 9a | `node --max-old-space-size=4000 .claude/atlas-build/check-history.js [file] [--determinism] [--verbose]` (from the repo root) | `atlas/data/history.bin`, the core beside it, `history.bin.js` (the slice twin), `test-war-cards.js` (the extent assertions), `polity-spec.json`, the cards | nothing; exit 1 on any failure (§2.11: the core buildId, every core reference and — since 2b — its drawn path at every level against the line it replaces and the distance of every drawn segment from the real line (the chord rules); the slice twin on the same core with its sentence and the three twins under 12 MB; the sources, the spans, per epoch the shared borders and the coast invariant and planarity at the finest level with the coarse-level crossings under a stated ceiling; the point assertions and, since 2b, Wikidata's capital statements inside their states counted per millennium — a failing one must be listed in `KNOWN_FAULTS` / `KNOWN_CAPITAL_FAULTS` with its reason, never forced; the run under its 600 s budget). `--determinism` builds twice without writing (afresh, then replaying the cache) and compares the two sha256s with the committed file's | ~150 s on the 2b file; `--determinism` ~16 min (Phase 2c: 199 s; it also checks the PRESENCE layer on its own — every presence face class soft, its arcs the coast, walked forward, and its own soft edge, never a border, each face planar by itself at every level, every entity carrying its span, source, cards and the audit's note, and `site-hulls.json` built from the pinned Hosner file)
| 9a2 | `node --max-old-space-size=6000 .claude/atlas-build/audit-seats.js [--write-known] [--write-doc] [--file F] [--json F]` (from the repo root; needs `fetch-sources.js cliopatria`) | `atlas/data/history.bin` (or `--file`), the core, the cards, `polity-spec.json`, `war-series.json`, the raw Cliopatria rows | `seats-known.json` (`--write-known`) and the generated table of `docs/atlas-v2-border-audit.md` (`--write-doc`) | the border audit of 2026-10-16: every card-linked polity's seat (its Wikidata capital, else the card's own place) against its faces at every step, each failure classed source / clip / snap / other against the raw row. **Run it after every rebuild of `history.bin`**: `check-history.js`'s `seats` rule fails on a seat/year that is not in `seats-known.json` and on an entry that no longer fails. ~1 min |
| 3b | `node .claude/atlas-build/build-war-extents.js [--check]` (from the repo root; Phase 2d) | the cards (through `card-io.js`), the pinned `ohm-lacedaemon`, `usfs-royce-cessions` and `usfs-royce-schedule` (`fetch-sources.js` verifies each sha256 before a byte is read) | `war-extents.json` (rows of the three war extents derived from open sources: the Western Confederacy by Royce's treaty dates, and Sparta and Messenia split at the card's Taygetos line); `build-history.js` reads it in place of the card's authored ring and refuses it when it was not built from the pinned bytes | ~10 s |
| 3c | `node .claude/atlas-build/build-fronts-plates.js [--fortnight=<fortnight.py output>] [--check]` (from the repo root; Phase 2d) | the pinned `ww2-atlas-control` (41 monthly plates) and `us-army-battlefront-atlas`; `.claude/ww2-plates/fortnight.py` (Python, run by hand outside the repo) reads the 97 fortnightly pages | `fronts-plates.json` (138 plates, their four sets as rings, the uncertainty each carries); `--check` proves it is what the pinned sources build | ~20 s (the Python reading, ~35 min) |
| 3d | `node .claude/atlas-build/build-wars.js [--install] [--dry] [--check]` (from the repo root; Phase 2d) | the cards, `polity-spec.json`, `war-series.json`, `war-sides.json`, `lib/war-resolve.js` and `history.bin`'s entity table | `atlas/data/wars.js` (`window.ATLAS_WARS`: every war card's sides as entities with their dated member windows; 40 KB budget); `migrate-places.js` runs it; a pure function of its inputs, so `--check` is exact | ~2 s |
| 3e | `node --max-old-space-size=4000 .claude/atlas-build/build-war-slice.js [--install] [--dry] [--check] [--roundtrip]` (from the repo root; Phase 4c) | the committed `history.bin`, `wars.js`, `topology.bin` (the build id) and `lib/history-model.js` (the reader's output turned back into the writer's model; `--roundtrip` proves the committed file survives it byte for byte) | `atlas/data/history-wars.bin` (the WAR-WINDOW SLICE: every state alive in each war's display year — the middle of its years, as `atlas-windows.js` computes it — except the presence layer and the front, plus every step of each side's entities over the war's years, their faces and arcs, and the arcs that give a kept own arc's endpoint its junction; 1.76 MB of the 9.10 MB, budget 2.5 MB) and its twin `history-wars.bin.js` (2.35 MB). `--check` rebuilds it from the committed file, compares every war's states and sides with the full file at all three levels (856 state faces and 432 side steps), and verifies the twin; the four twins together are 13.25 MB against the owner's Phase 1d rule of 12 MB for the first three (his decision, held at 13.5 MB here). The credits page lists it (`build-credits.js` reads its header). **Run it after ANY rebuild of `history.bin` or `wars.js`**; CI's fast job fails when it lags | ~4 s |
| 3f | `node --max-old-space-size=4000 .claude/atlas-build/build-ww2-slice.js [--install] [--dry] [--check]` (from the repo root; 2026-10-19) | the committed `history.bin`, `wars.js`, `topology.bin` (the build id), `app.js` / `styles.css` / `atlas-embed.js` (the window's closest zoom, read and checked) and `lib/history-cut.js` (the cut shared with 3e) | `atlas/data/history-ww2.bin` (the SECOND WORLD WAR WINDOW'S SLICE: every plate of the front, the states of the plates' years, the war's sides; the front's soft arcs simplified to half a pixel, 51 m, at the window's closest zoom; 5.2 MB budget) and its gzip twin `history-ww2.bin.js`; `--check` rebuilds it, proves every plate, front face and coast piece equal to the full file and every soft arc within the tolerance at all three levels, and keeps the four twins under 12 MB | ~13 s |
| 9b | `node check-water.js` and `node check-relief.js [--source] [--coast N]` (from the repo root, with `--max-old-space-size=8000`) | `atlas/data/` (+ the ETOPO source for `--source`) | nothing; exit 1 on any failure; `--coast N` writes `out/relief-coast.json` | ~2 min; `--source` ~1 min more |
| 9c | `node --max-old-space-size=8000 .claude/atlas-build/check-gazetteer.js` (from the repo root) | `atlas/data/gazetteer.js`, the core and water headers, the z=4 tiles, `wiki-sitelinks.json`, `countries.js` | nothing; exit 1 on any failure (the header, the table, every country's anchor and path in its own land, the ten named countries, seas off the land, every Wikipedia title the cached sitelink of its item, the 0.6 MB decimal budget; since 1d: no two rows of a kind share a QID, every QID row's name in Latin script with its diacritics following the English title, one Rhine / Danube / Tagus / Yangtze with their other names as aliases, Copenhagen not København, no two admin-1 units of a country with one name) | ~30 s |
| 9e | `node .claude/atlas-build/check-places.js` (from the repo root) | `atlas/data/places.js`, the gazetteer, `history.bin`'s header, `places-spec.json`, `places-wikidata.json` | nothing; exit 1 on any failure (the header, in step with the spec, ids and QIDs, kinds, no row duplicating a gazetteer row or an entity, every `within`, every row's item in the cache with its coordinate within 1 km and its classes, the 0.3 MB budget) | ~2 s |
| 9f | `node .claude/atlas-build/check-places.js` (the same script, its second half) and `node .claude/test-study.js` | `atlas/data/card-places.js`, the cards, `atlas/study.js` | nothing; exit 1 on a lagging index, an id the registry lacks, a malformed entry, a size over budget; the Node suite over the studied set, flags, sentences, the place card's list and the marks (sizes, shapes, the tap, the fan; no stacks since 2026-10-14) |
| 9d | `node .claude/atlas-build/check-credits.js` (from the repo root) | every header under `atlas/data/`, `atlas/data/credits.js` | nothing; exit 1 when the committed credits lag the data, a licence is not an accepted identifier, a link is not https, or a share-alike (ODbL) file is missing from the statement | ~3 s |

The twins: `check-topology.js` and `check-water.js` decode `topology.bin.js` / `water.bin.js` and fail unless the bytes' sha256 is the `.bin`'s.
Step 3 is the step topology of every card-linked polity series (Phase 2b; the 2a pilot was the Mediterranean and Near East, 550 BCE – 650 CE, and is still what the `file://` twin carries); step 4 (peoples) does not exist yet (Phase 2c); step 6 is the Phase 1c gazetteer v0 (countries, admin-1 units, cities, seas, lakes, rivers, islands, ranges, regions — the places the present-day map names; the cards' places are Phase 3).
Each step is deterministic given `sources.json`; the only non-determinism in the outputs is the
`generated` timestamp in each header. The `buildId` in every header is the sha256 of `out/full.bin`
(`out/water-full.bin` for the water files), so a tile can always be matched to the core it was cut
from — the checkers refuse a mismatch; the water header also names the LAND build it was snapped to,
and `check-water.js` fails if the committed land is a different build.

**Water and relief are files of their own** (Phase 1b, 2026-10-08): `atlas/data/water.bin` (rivers and
lakes at LOD 0–2, every river whole), `atlas/data/water/<x>-<y>.bin` (lakes at 250 m on the z=4 grid)
and `atlas/data/relief/` (L0 one tile, L1 eight, three greyscale PNGs each: `.hi`, `.lo`, `.sh`). None of
them touches `topology.bin` or `tiles/`, so the land tiles stay byte-identical across a water or relief
rebuild — verify with `sha256sum atlas/data/topology.bin atlas/data/tiles/*/*.bin | sha256sum` before
and after. Budgets the checkers hold: water 12 MB, relief 45 MB. **HydroRIVERS is not an input**: its
licence (the WWF HydroSHEDS v1 License Agreement) failed §2.10a on 2026-10-08; the entry is kept under
`blocked` in `sources.json` with the finding, and rivers come from Natural Earth 10m (PD) instead. After
`pack-water.js --install` and `build-relief.js --install`, run step 9b, then `.claude/test-atlas-perf.js`,
`.claude/test-atlas-relief.js` and `.claude/atlas-shots.js` (all need Playwright on `NODE_PATH`).

**The gazetteer is a `.js` file, not a `.bin`** (Phase 1c, 2026-10-09): `atlas/data/gazetteer.js` assigns
`window.ATLAS_GAZETTEER` — a table of rows under a `cols` header, with the `sources` block §2.10a asks for as
its first line — so a `<script>` loads it on `file://` as well as `fetch()` does over http, and a reader of the
file sees names, not varints; at 0.6 MB a binary would have saved a third of that and cost a reader every
one of them. `build-gazetteer.js` reads the LAND and the WATER from the committed `atlas/data/` (never from
`out/`), so any cloud session can rebuild it. The Wikipedia titles come from Wikidata's enwiki sitelinks,
fetched through `query.wikidata.org/sparql` in batches of 50 (the `wbgetentities` API answers 429 from the
sandbox's shared address — `check-reach.js` has the row) and cached in `.claude/atlas-build/wiki-sitelinks.json`,
which IS committed: a rebuild is reproducible offline, a title is never written from memory, and
`check-gazetteer.js` fails on any title the cache does not hold for that item. `--refetch` asks again for every
item; a new item (a new row with a QID) is fetched on the next build without it. **Since Phase 1d the cache also holds the
items' English labels** (`labels`, the same batches of 50 through `lib/wikidata.js`), which the builder's naming rule reads
(the header of `build-gazetteer.js` states the rule and what the broad reading of it got wrong); the service answers 429 to a
shared address after a few batches, and the first pass over 4,528 items took about an hour of back-offs. **Names are
English and there is one row per Wikidata item per kind** (the Rhine's three Natural Earth stretches are one row with `alt`
naming the other water entities and `aliases` the other names; the Atlantic's two polygons are one shape). The defaults are
the shipped file's: `--tier 1000000` (no further city tier) and `--river-rank 7` (Phase 1d's budget lever: the 288 rivers
of scale rank 8, 28 KB, are drawn but carry no name — the English names and the aliases had cost 20 KB). After `--install`, run step 9c,
then `.claude/test-atlas-render.js`, `test-atlas-labels.js`, `test-atlas-card.js`, `test-atlas-search.js` and
`test-atlas-a11y.js` (all need Playwright on `NODE_PATH`). The `--tier`, `--town-min` and `--river-rank` flags
are the budget's levers; `out/gazetteer-report.json` records the size each kind costs, so a change to one of
them is a measured choice, not a guess.

`build-land.js --census` prints the vertex census per candidate tolerance without writing anything;
it is how the LOD tolerances were chosen (§2.3 "as measured"). `pack.js --dry` builds everything in
memory and prints the size report without writing. After `--install`, run step 9, then
`.claude/test-atlas-perf.js` and `.claude/atlas-shots.js` (both need Playwright on `NODE_PATH`; in a
cloud session also `FOLIO_CHROMIUM=/opt/pw-browsers/<chromium>/chrome-linux/chrome`) — the gate's
figures and the screenshot series are what §7's as-built note quotes.

## Every checker and every CI job

`.github/workflows/checks.yml` runs, on every push:

| job | what of the Atlas it runs | gate? |
|---|---|---|
| `no-browser suites and checkers` (fast) | `node --check` over `atlas/*.js`, `atlas/vendor/*.js` and the pipeline; `check-topology.js --tiles --max-bytes 3145728` (the core, every tile, the twin's hash); `check-water.js` (the water, its tiles, the water twin and the 12 MB twin budget); `check-relief.js`; `check-gazetteer.js`; `check-credits.js`; `build-war-slice.js --check` (the war-window slice of the history file is the full file's, Phase 4c); `check-history.js` (the step topology against the core, Phase 2a; at full scale since 2b, with the chord rules, the slice twin, Wikidata's capital facts and the 600 s budget); Phase 3a's `check-places.js`, `migrate-places.js --check` (every card's `places` id resolves, every derived id is on its card, every polity's linked cards carry it, the spec in step) and `test-places.js` (the registry, the migration's resolver on fixtures, the tooling's refusals, the old fields byte-identical to the base); the eager-path size (no `atlas/` file may appear in it) | yes — red here fails the run |
| `Playwright suites (shard N of 4)` (browser) | FOUR SHARDS since 2026-10-19 (three from the first split of Oct 2026), planned by `.claude/ci-shards.js` from each suite's measured duration (about 26.7 minutes of suites each, at most 28 with the install; `ci-shards.js --check` in the fast job fails when a suite is in no shard or the heaviest is predicted over 28 minutes); a red suite fails its shard and the run and is named in an `::error` annotation and the job summary. Every `.claude/test-*.js` that says "playwright" except the frame gate and `test-card-windows-fixes.js` (a job of its own): for the Atlas `test-atlas-render.js`, `-labels`, `-card`, `-search`, `-a11y`, `-relief`, `-places`, and Phase 1d's `-credits`, `-fallbacks` (file://, no WebGL2, context loss, a failed worker), `-phone` (five viewports, three themes) and `-session` (five minutes of use, memory sampled), and Phase 2a's `-stages` (the gesture stages recover and ignore stalls; ?perf and the About switch) and `-time` (the year query, gaps, the crossfade, the rail, playback, deep links, the labels and the stack at three years, the card, the seam at the cap), and Phase 2b's `-review` (the 2a review's artefact views, the fills drawn once — no fold or crack in a mesh at two views with lake holes — the rail at 360/390/430 px with and without the phone flag, the era on every year) and `-time`'s 2b section (the year query at the largest alive sets, the colouring over every epoch, the contrast in every theme, the largest face on screen named, the captions and the card) | no — a second opinion (`continue-on-error`), read per suite in the job's log; `test-tour.js`, `test-draw-cards.js`, `test-review-decks.js` and `test-war-cards.js` are red on main for reasons of their own |
| `Atlas v2 frame gate` | `test-atlas-perf.js` alone — the owner's rules (§7 "Phase 1d — as built"; the worst-frame rule as restated in Phase 3a: at most 0.5 % of a gesture's frames over 100 ms and none over 200 ms) | yes, and must be green on every head |

**Phase 4b additions.** The fast job also runs `.claude/atlas-build/check-core-cache.js` (offline): `CORE_CACHE_REV` in `atlas/atlas.js` is `<ten hex digits of the sha1 of atlas-worker.js + atlas-format.js + vendor/earcut.js>:<topology.bin's build id>` — the key of the first level a card window's hub keeps in IndexedDB — and the check fails when it lags; **after any edit to those three files or a rebuilt `topology.bin`, run `node .claude/atlas-build/check-core-cache.js --install`.** The Playwright job gains `test-atlas-windows.js` (the engine's windows: placeholder, taps and Back, holes, war legend, rivers, the fit sweep, the fine frames, sibling reds), and, after the loop, runs `test-map-cards.js`, `test-card-locator.js` and `test-war-cards.js` again with `FOLIO_ENGINE=v2` (`.claude/test-engine-switch.js`): the same assertions V1's windows were held to, on the engine's. Measurement tools (not gates): `measure-atlas-embed.js` (first window, V1 or the engine, desktop or phone profile, cold and warm), `profile-atlas-worker.js` (where the worker's time goes), `measure-atlas-holes.js` (primitive budgets with a state selected, and whether it is whole), `compare-window-rivers.js` (V1's rivers against the engine's in the same view).

Each of the three browser shards takes about half an hour (run 3558's single job took 75 minutes before the split) and every push to a branch cancels the run before it: batch commits and push once per CI cycle.
Locally: `NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-<name>.js`, with `FOLIO_CHROMIUM=/opt/pw-browsers/<chromium>/chrome-linux/chrome`
in a cloud session; `.claude/atlas-shots.js` takes the screenshot series the as-built notes review; `test-atlas-phone.js [dir]`
writes its screenshots too, and `FOLIO_VIEWPORTS=360x640,844x390` narrows it.
`.claude/measure-study-marks.js` (report-only, Playwright) prints, for six fixed views with the Full Atlas on and the plain Map beside it, the names placed, the marks drawn and the per-frame cost of the label canvas's pass and of the marks' own pass — the figures §7 "Stacks removed" quotes before and after; `test-atlas-perf.js` carries the Full Atlas's worst-frame gate and a mark budget per fixed view.

## Where things live

- **`src/`** — the source cache, git-ignored. `fetch-sources.js` fills it and verifies every archive
  against its sha256 pin before any step reads it; a build script calls `ensureSource(id)` rather
  than trusting a path. Delete it freely; a re-fetch costs minutes. The OSM zip (923 MB) unpacks to a
  1.3 GB shapefile; keep an eye on the session's disk allowance (`df -h`) and delete `src/` when done.
- **`out/`** — scratch outputs between steps, git-ignored. `coast.bin` (~540 MB: every OSM vertex
  with its Visvalingam area) and `full.bin` (~25 MB: the whole topology at five levels) are what the
  next step reads; the `*-log.json` files are the snap logs and the `admin-report.json` holds the
  measurements quoted in the design doc. `out/dist/` is the packed result before `--install`.
  Phase 1b adds `water-full.bin` (~10 MB, four levels), `water-report.json` and `water-log.json` (every
  river-end snap and every lake dropped, with why), `dist-water/`, `relief/` and `relief-coast.json`.
- **A session without `out/full.bin`** (every cloud session: `out/` is not committed) can still build the
  water and the relief, because `build-water.js` reads the LAND from the committed `atlas/data/` through
  `lib/landindex.js` (the z=4 tiles' coast, 6.2 M segments, loads in ~5 s) — the owner's rule for 1b, so
  OSM is never re-downloaded for water. It cannot re-run `pack.js`; a change to the land tiles still
  needs steps 1, 2 and 8.
- **`node_modules/`** — `npm ci` here once per session; git-ignored.
- **`wiki-sitelinks.json`** — the Wikidata cache (Phase 1c, labels added in 1d), committed beside the builder: `{ retrieved,
  titles: { Q…: "Title" | null }, labels: { Q…: "Label" | null } }`, null meaning the item has no enwiki sitelink (and the
  row no link) or no English label.
- **`atlas/data/`** — the committed artefact: `topology.bin` and `tiles/`, `water.bin` and `water/`, `relief/`,
  `gazetteer.js`, `credits.js`, `topology.bin.js` and `water.bin.js`, and since Phase 2a `history.bin` (the step topology, a file of
  its own so the land, water and relief files stay byte-identical across a history rebuild — `sha256sum` before and after) and its
  twin `history.bin.js`, and since Phase 4c `history-wars.bin` and its twin `history-wars.bin.js` (the war-window slice, `build-war-slice.js`) and, since 2026-10-19, `history-ww2.bin` and its twin (the Second World War window's slice, `build-ww2-slice.js`; the water twin is gzip too, to keep the four twins under 12 MB). **Never hand-edit a generated file**; fix the script or
  the pin and rebuild. Commit a rebuilt `tiles/` once per meaningful build, not per iteration — every committed tile stays in
  the repository's history. The land, water and relief files were byte-identical across Phase 1d (`sha256sum` before and after).

## Iterating without re-running everything

- `build-land.js` only depends on the OSM pin: re-run it when the pin changes or the quantum does.
- `build-admin.js` is where almost every rule lives (the far-vertex threshold `D_FAR`, the sliver
  rules, the tolerances, the LOD intervals `LOD_M`). Set `DEBUG_PIECE_AT="lon,lat;lon,lat"` to print,
  for every land piece whose bounding box holds a point, its size, its interior sample points and the
  Natural Earth polygons that contain them — it is how the enclave-labelling fault was found.
  `DEBUG_NODE="lon,lat,radius;…"` prints, at face-walk time, every half-arc at every node within the
  radius with its kind, flags, length and angle, and the full half-arc list of every mixed cycle (a
  cycle that walks coast on both sides) — how the Fenwick Island and Smith Island leaks were found.
  `DEBUG_STOP=walk` exits right after the face walk (about four minutes in) with the snap log written
  to `out/admin-log-walk.json`, so a walk fault iterates at a fifth of the full run's cost.
- `pack.js` is fast; re-run it alone after a change to the tile grid, the resident level count or
  the clipping. So is `pack-water.js`.
- `build-history.js --measure` prints the distributions behind D1 (vertex → OSM coast), D2 (vertex → a neighbour's line in the
  same epoch, with a per-pair table) and D3 (vertex → a present-day border) and exits — how the thresholds and the RUN RULE
  (a vertex snaps only when it is surely on the line or when it and a neighbouring vertex of its own line both reach the same
  line as a run) were fixed; the build prints the gap and overlap piece distributions by area, which fixed `SLIVER_KM2`. The
  pilot (`PILOT` at the top: the core polities, the years, the region) and every threshold are constants in the script;
  `history.bin` is deterministic — no clock in the header — and `check-history.js --determinism` rebuilds twice and compares.
- **The Wikidata item and Wikipedia title of each polity** (QID audit, 2026-10-13; `docs/atlas-v2-polity-qids.md`) are Cliopatria's own `Wikidata` / `Wikipedia` pair for the rows covering the most years, corrected by `.claude/atlas-build/polity-qids.json` `fixes` at the point `build-history.js` reads the row (`prepareRow`); a fix that matches no row stops the build. After editing that file: `audit-polity-names.js --fetch-qids` (network; only for an item the cache lacks), then `build-history.js --no-cache --install` (**fresh, ~20 min**: replaying `out/history-cache/` does NOT reproduce the committed file byte for byte — 97 of the 102,443 `arcFlags` bytes and the `faces` section differ, found with the unmodified script — while a fresh build does, and changes only the JSON header), then `build-polity-index.js --install`, `migrate-places.js` (a polity entity that now carries a QID makes a `places-spec.json` row with the same QID a duplicate: `check-places.js` names the rows; delete them and run the migration again), `audit-polity-names.js --qid-table`, and `audit-polity-names.js --check`. `build-credits.js` writes a new timestamp on every run: revert `credits.js` when only its `generated` line changed.
- **Dated names (2026-10-18; `docs/atlas-v2-design.md` §7 "Data faults of 2026-10-18").** `build-polity-names.js --rows` (needs `src/cliopatria`) derives `polity-row-names.json` (every series whose rows carry several names, years from the rows); the plain run / `--check` builds `atlas/data/polity-names.js` from it, `polity-names.json` (Wikidata overrides) and `place-names.json` (dated names of registry rows, e.g. the Zuiderzee), offline. `check-places.js` also runs the area-anchor check (`lib/place-anchors.js`, `place-anchors.json`); `migrate-places.js --refetch-classes` re-asks which TOPS every class of the registry's items reaches after a row is added to `TOPS`; `check-history.js` tests every one-sided arc's far side (`KNOWN_ONE_SIDED`).
- **`RING_SNAP_FRAC` (border audit, 2026-10-16; `docs/atlas-v2-border-audit.md` §3).** D1, D2 and D3 may move a vertex no farther than one fifth of the scale (√area) of the smallest ring it belongs to; above ~75 km across the cap is over D1 and nothing changes. It stopped D1 carrying two corners of the Roman Kingdom's 859 km² polygon 9–12 km onto the coast and collapsing Carthage's 7 km square; `stat.d1Capped` / `d2Capped` / `d3Capped` count the refusals. Changing it changes `history.bin`; run `audit-seats.js` after.
- **`geometry-fixes.json` (border audit, 2026-10-18; `docs/atlas-v2-border-audit.md` §7).** The ONE place a Cliopatria row's polygon is corrected: `build-history.js` replaces the ring of every row of `series` named `name` with `ring` in `prepareRow`, only while the source's ring is still `from` (a changed source stops the build, as a stale `polity-qids.json` fix does), verifies `check` (the point at least `minInsideM` inside, the area within `maxAreaChange` of the source's) before using it, lets the fixed row prevail over the series in `over` where their rows overlap (labelling, before the sliver rule), and keeps the corrected ring's own vertices off a neighbour's line (no D2 snap; D1 and D3 as usual). The fix is named in `history.bin`'s header as `sources[0].adaptations`, which `build-credits.js` merges per variant and the `#credits` page prints ("Adapted by Folio"); `out/history-report.json` `geometryFixes` has the counts. One fix so far: the Roman Kingdom (857.7 → 892.6 km², Rome 3.0 km inside the raw ring). After editing the file: `build-history.js --no-cache --install`, `build-war-slice.js --install`, `audit-seats.js --write-known --write-doc`, then `check-history.js`.
- `build-history.js` debugging hooks: `DEBUG_POINT="lon,lat,year"` prints, for the epoch holding that year, the piece under
  the point, its owners and interior samples, every alive row's containment and ring, the face walk round the arc an eastward
  ray from the point hits first, the dead-end arcs of the row holding the point, and where the epoch's mixed (land-and-sea)
  cycle flips side — the way the sea chords, the collinear twins and the T-junctions of §2.3 were found; `DEBUG_LAND="lon,lat;…"`
  prints the land/sea parity at those points and exits. `out/history-log.json` carries every snap and the events (`sea-chord`,
  `leak`, `piece-without-sample`, `hole-without-outer`) with coordinates, so a fault is located without a rebuild.
- `check-history.js --verbose` prints every failing assertion (the default shows twelve) and every coarse-level crossing with
  the kinds of the two arcs; `$TMPDIR`-style scratch scripts that classify a failing assertion against the raw Cliopatria
  polygon of the year (does the source itself hold the place?) were how `KNOWN_FAULTS` was filled — a source fault is listed
  with its reason, a conflation fault is fixed.
- `build-water.js --measure` prints the distance distributions (free river ends to the nearest other
  river, coast and lake shore) and exits — how `D_JOIN`, `D_MOUTH` and `D_LAKE` were fixed. The area
  filter per level is `LAKE_AREA_KM2`; the planarity repair restores whole source stretches at a
  crossing (one vertex at a time oscillated in dense lake districts) and the log names every lake or
  island that left a level.
- `build-relief.js` measures what it writes: the PNG sizes it prints are the figures §2.3 and §2.7
  quote; the `--levels` flag is how L2 was measured and left out.
- The snap log fails the build when a snap exceeds its source's tolerance (`TOLERANCE_M`); read
  `out/admin-log.json` for the offending snap rather than raising the tolerance.

## How the credits page is generated

`atlas/data/credits.js` is never written by hand. `build-credits.js` walks `atlas/data/`, reads the `sources` header of every
`.bin` (header-only), every `.json` with a `sources` key and the first line of every `.js`, merges them by source id — one entry
per id, a variant per distinct (version, retrieved, sha256), each with the Folio files derived from it, grouped per directory
with a count — and writes the table with a header of its own. `PAGES.credits` in `app.js` renders it: name, version, licence
(linked), the attribution string exactly as the files carry it, the retrieval date, the derived files, then the caution
sentence about borders and the ODbL statement listing every file that carries the OSM source. Every `--install` of
`pack.js`, `pack-water.js`, `build-relief.js` and `build-gazetteer.js` runs the generator afterwards, and `check-credits.js`
(CI's fast job) regenerates it in memory and fails when the committed file differs — so the page cannot lag the data. A
source's strings come from `sources.json` through the files; to correct one, fix `sources.json`, rebuild the files that carry
it (or, for a wording-only correction, accept that the files' headers are what they are until the next rebuild) and re-run the
generator. The page's two sentences of its own live in `app.js` and were flagged for counsel's review (2026-10-09).

## Adding a source

1. Add an entry to `sources.json`: `id` (a slug), `name`, `version`, `url`, `sha256` (hash the file
   yourself — `curl … | sha256sum` — never copy a hash from a web page), `bytes`, `licence` (one of
   the accepted identifiers; anything else is refused by `fetch-sources.js` and cannot enter the
   pipeline even for a cross-check — §2.10a), `licenceUrl`, `attribution` (the exact credit line the
   licence asks for), `retrieved`, `files` (what the build reads inside the archive), `usedBy`.
2. A share-alike source (ODbL, CC BY-SA) must stay a data file of its own: `pack.js` copies every
   source an output drew on into that output's header, and `check-topology.js` fails if an arc or
   face names a source index the header does not carry. If the new source's geometry would be merged
   into a file whose other sources are PD or CC BY, it needs a file of its own.
3. Read it through `lib/shp.js` (streaming, for anything large) or mapshaper (for small files), in a
   new `build-*.js` step that writes into `out/` and is listed in the table above.
4. `node .claude/check-reach.js` gains the host, so a session can tell "the host is down" from "the
   pin is stale".

## When the OSM pin goes stale

osmdata.openstreetmap.de regenerates the land polygons daily at the same URL; the README inside the
zip names the planet date (`Date of the data used is …`), which `build-land.js` copies into every
header. There is no dated, citable archive of these files (searched 2026-10-08), so a re-fetch on
another day yields a different file and `fetch-sources.js` will refuse it against the pin. That is
deliberate: re-pin it in a commit that says so, re-run steps 1, 2, 8 and 9, and expect the outputs
to differ (new coastline edits, new islets). The committed `atlas/data/` is the reproducible
artefact; the pipeline reproduces it from a re-fetch, not bit-identically.
