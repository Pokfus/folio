# Atlas v2 — historical coastlines: what is built, what the data supports, what it would cost (2026-10-18)

> **📖 READ BEFORE TOUCHING `land-changes.json`, `build-land-changes.js`, THE LAND-CHANGE DRAW IN `atlas-gl.js` / `atlas-canvas.js`, OR PROPOSING ANY
> OTHER CHANGE TO A COAST BY YEAR.** §1 is the dated land-change layer as built (the Zuiderzee polders); §2–§5 are the research the owner
> asked for: can historical coastlines be applied across the Atlas's whole range, 10,000 BCE to today, with accuracy — every candidate source
> with its licence read and quoted, its accuracy per era, its cost, and what it would get wrong; §6 is the recommendation and §7 what will
> NOT be drawn because no open data supports it.

The Atlas draws **one present-day coast** (OpenStreetMap land polygons, ODbL; `docs/atlas-v2-design.md` §2.3) at every year, and the
historical borders are conflated onto it. The owner's phone of 2026-10-18 showed Flevoland "as a thin outline with no fill". The fault was
not in the coast: it was in the WATER file (§1.1). Fixing it left the polders drawn as land in 1500 CE, which the single-coast design has
always done for every reclamation on earth — this file is the reckoning with that.

## 1. The dated land-change layer, as built

### 1.1 The fault: every lake island was filled as lake

`build-water.js` reads HydroLAKES as a shapefile, where outer rings are wound clockwise and holes counter-clockwise, and the Atlas wants the
water on the left of every ring (outer counter-clockwise, holes clockwise). Until 2026-10-18 it reversed only the outer ring, so every hole
kept the source's counter-clockwise turn — and the worker, which classes a ring by its signed area (`triangulateFace`), took all 16,699 of
them for outer rings and filled them as lake. Measured on the committed `water.bin`: 3,980 multi-ring faces, 16,699 later rings, **zero
negative**. The Flevopolder is the hole of HydroLAKES polygon 117 (the IJsselmeer, the Markermeer and the randmeren as one 1,963 km² body),
so it drew as IJsselmeer water with its own shore round it: the owner's thin outline. Manitoulin Island (2,766 km², Lake Huron), Olkhon in
Baikal, every island of the Caspian were the same fault, smaller on a phone. The fix is one line (both rings reversed), the water files were
rebuilt with the pipeline (`build-water.js`, `pack-water.js --install --min-km2 6` — the tile floor the committed build used; the land files
stayed byte-identical) and the file now carries 16,700 negative later rings and none positive.

### 1.2 The layer: a dated patch over the present-day coast

`atlas/data/land-changes.js` (`window.ATLAS_LAND_CHANGES`, 29 KB, loaded with the land, on `file://` too) is a table of areas that were
**water until a sourced year**, each a set of quantised rings like the topology's. The page posts the rows to the worker once; each becomes a
one-face topology of its own and goes through the lake's own code (`unitVectors`, `triangulateFace`, `buildSegments`, the buckets), so the
renderers draw it with the lake's calls: in every year from `from` (null = the Atlas's first year) to `to` inclusive the row is drawn in the
lake colour over the land and the lakes, whatever the lakes switch says (a polder that was still the Zuiderzee is water, not a layer a reader
turns off). The year is the page's `time.year`, so the card windows and Find it (the headless hub) get it too. Not in the ID pass: a tap there
names the land under it.

**The shore of the day.** `build-land-changes.js` classes every edge of every ring by a point 120 m outside it: inside another row → that
row's index; inside a drawn lake of `water/16-12.bin` or inside a CBS WATER unit → the lake (no line is ever drawn there: in a year the
polder is water there is no coast there); else old land — the Zuiderzee's coast of the day, stroked. An edge against another row is stroked
only in a year that row is dry (the Knardijk is a shore from 1957 to 1967 and nothing before). Because HydroLAKES draws the IJsselmeer's
shore 0.3–1.1 km inside the dykes (measured against the CBS lines), every lake-side edge is pushed out to just past the drawn shore at fetch
time, or a rim of present-day land would show round a water-year patch (six pixels at the cap). The renderer first paints the row's whole
boundary in the lake colour a little wider than a shore — erasing the present-day shore lines along it (the fill erases the ones inside) —
then strokes the shore of the day.

**The rows and their sources** (`.claude/atlas-build/land-changes.json`; every year is quoted from its source on the row, none from memory):

| row | water until | fell dry | the date's source | geometry |
|---|---|---|---|---|
| Wieringermeer | 1929 | 1930 | Rijkswaterstaat, "100 jaar Zuiderzeewerken": "Met de aanleg van Wieringermeer (1930), Noordoostpolder (1942), oostelijk Flevoland (1957) en zuidelijk Flevoland (1968) ontstond er 165.000 hectare nieuw land." | the four CBS 2024 districts of Hollands Kroon that were the municipality of Wieringermeer until 2012 (208 km²) |
| Noordoostpolder | 1941 | 1942 | the same sentence (Wikidata Q69262's 1962 is the municipality's inception) | the municipality's eleven land districts; Schokland's district and Urk stay land (464 km²) |
| Oostelijk Flevoland | 1956 | 1957 | the same sentence | Dronten's land districts and Lelystad's land neighbourhoods but the Oostvaardersplassen and the Marker Wadden (529 km²) |
| Zuidelijk Flevoland | 1967 | 1968 | the same sentence; nl.wikipedia "Zuidelijk Flevoland": "Op 23 mei 1968 viel Zuidelijk Flevoland droog." | Almere's and Zeewolde's land districts and the Oostvaardersplassen (461 km²) |
| Marker Wadden | 2015 | 2016 | NOS (March 2017) and BNNVARA Vroege Vogels: "Op 11 mei 2016 kwam het eerste eiland boven water." | the islands as CBS draws Lelystad's land there (2.2 km²) |

Wikidata (CC0) dates the Afsluitdijk (Q240960, 1932), the IJsselmeer (Q4121, 1932) and the province of Flevoland (Q707, 1986-01-01) but none
of the polders' drainage, which is why the dates are Rijkswaterstaat's. The geometry is **CBS Wijken en Buurten 2024** through PDOK's WFS —
its GetCapabilities says `<ows:AccessConstraints>https://creativecommons.org/publicdomain/zero/1.0/deed.nl</ows:AccessConstraints>` (CC0) —
chosen because the polders are municipalities, former municipalities or sets of neighbourhoods and every unit carries a `water` flag; Natural
Earth has only provinces, OSM's boundaries would need the Overpass API (not reachable from the build) and Wikidata has no polygons. The
fetched geometry — unioned, filtered, simplified and pushed out to the drawn shore, every step that needs polygon-clipping — is cached as
finished rings in `land-changes-source.json` (committed, 120 KB), so the offline build only classes edges and writes the file, and
`build-land-changes.js --check` (CI's fast job, no node_modules) is exact.

**Accuracy, honestly.** The polder dykes are the CBS units' land outlines (the Wieringermeer's 208 km² against the "about 200 km²" the
literature gives; the Noordoostpolder's 464 against 460; Oostelijk 529 against 540; Zuidelijk 461 against 430 — the CBS land excludes the
polders' inner waters, the rows do not). The boundary between the two Flevoland polders is the Knardijk (nl.wikipedia: "Aan de noordoostkant
wordt het begrensd door de Knardijk"; the Oostvaardersplassen lie in Zuidelijk Flevoland by the same article): the Lelystad–Zeewolde line
through Wikidata's Knardijk point (Q2547295) IS the dyke (2 m rms over 1.5 km, 65 m over 4.5 km), and away from it the CBS lines depart from
the dyke by up to about 3 km (the Oostvaardersplassen' north-eastern corner, Zeewolde's Knardijkgebied) — the rows inherit that. The
Werkeiland Lelystad-Haven (built 1950) is in the Oostelijk row, so it is water until 1956 (25 ha). Before 1932 the IJsselmeer was the
Zuiderzee, a sea: the Atlas draws it in the lake colour at every year, which is the same water colour in every theme; the Afsluitdijk (32 km
by 90 m) and the Houtribdijk (Enkhuizen–Lelystad, 1975) are present-day land at every year — under a pixel wide at the cap, and the
Houtribdijk shows as a hairline across the water before 1975. The province of Flevoland has no face and no name in the Atlas (the Netherlands
carries no admin-1 units in `topology.bin`), so there is nothing to date; when provinces are added it starts in 1986. The Markerwaard was never
built. Lake Flevo and the Almere before the Zuiderzee formed (the 12th–13th centuries): §4.

**Adding a reclamation** is a row: the years from a cited source, a geometry recipe (`units` of a municipality's CBS units, or `from` another
row with `polygonsWithin` / `polygonsOutside`), an `accuracy` sentence; `--fetch --install`; the row's `edges` are classed by the build. A row
of a country outside the Netherlands needs a geometry source of its own under §2.10a and a sea-side edge test (`lib/landindex.js`, not yet
wired in — no row of the spec borders the sea). What the layer cannot do yet: draw **land over the sea** (a lost coast, a land bridge) — the
renderer has only the `water` state; §6 says what the other state would take.

**Guards.** `.claude/test-land-changes.js` (WebGL2 and Canvas 2D, a 390 × 844 phone): the file loads and every row's mesh arrives; at 1900,
1950 and today the pixel at the middle of each polder is the lake's or the land's as the sources say; the Flevopolder's middle is land today
(the fault); Manitoulin is land; the alive set follows the year; the lakes switch does not remove a patch. `build-land-changes.js --check`
in CI's fast job; `check-water.js` holds the 12 MB; `check-core-cache.js --install` after the worker edit.

### 1.3 The strays of 2026-10-18 (the owner's phone: "stray lines and double outlines in the sea", the IJsselmeer at 1660 CE)

The strips of §1.2 are unioned into each row at `--fetch`, and the union left specks: of 34 rings, 20 were under 0.05 km² (three single triangles — present-day land inside a water patch, drawn as a dot with an outline), one hole was the 99 m wide strip of the Noordoostpolder's Ketelmeer dyke (the horizontal line), and 29 stroked edges sat in runs under 1.5 km. `build-land-changes.js` now applies three rules to the cached rings (`cleanRings`, `trimShoreRuns`; also at `--fetch`): every ring at least `MIN_RING_KM2` (0.05 km²); every hole at least `MIN_ISLAND_WIDTH_M` (150 m) wide on average (2 × area ÷ perimeter) — the dykes of the works are under it (the Afsluitdijk 90 m), Schokland (394 m) is over it; a thin OUTER ring is kept, it is the Houtribdijk made water; no stroked run under `MIN_SHORE_RUN_M` (1.5 km). 34 rings became 13. `test-land-change-rings.js` holds the arithmetic for 1660 and every interval between reclamations, `test-land-changes.js` the pixels. **Still land at every year: the Afsluitdijk (in no row) and, from 1957, the Houtribdijk** — making either a row needs a geometry cut (the Houtribdijk joins the Oostelijk polygon by a neck the 75 m simplification severs; CBS has no unit for the Afsluitdijk). The water's NAME is dated by `place-names.json` (the Zuiderzee to 1931, the IJsselmeer from 1932).

## 2. The question: can historical coastlines be applied systematically, 10,000 BCE to today?

Three different things change a coast, and they need three different kinds of data:

1. **Sea level** — the glacial lowstand (about −120 m at 20,000 BCE) rose to within a few metres of today by about 5,000 BCE. It exposed the
   continental shelves: Doggerland and the whole southern North Sea, the Sunda shelf joining Sumatra, Java and Borneo to Asia, Sahul joining
   Australia to New Guinea, Beringia, the Persian Gulf (dry to the Strait of Hormuz at the lowstand), the northern Adriatic, the Yellow Sea.
   Drawable from **bathymetry plus a sea-level curve**, with the corrections in §3.
2. **The land itself** — deltas that grew (the Nile's, the Mesopotamian head of the Gulf, the Rhône's, the Yellow River's), coasts that
   eroded, the glacial-isostatic rebound that lifted Scandinavia and Hudson Bay out of the sea and is still lifting them. Not in bathymetry at
   all (the present seabed and land carry the sediment deposited since); drawable only from **regional paleogeographic reconstructions**.
3. **People** — reclamations (the Zuiderzee, the Haarlemmermeer, the Fens, Kolkhoz lands), drained or shrunk lakes and seas (the Aral Sea, Lake
   Chad, Lake Urmia, the Salton Sea in reverse), dammed reservoirs. Drawable from **dated outlines**: the land-change layer of §1, fed by
   satellite water records for 1972 onward and by sourced polygons before.

## 3. The candidate sources, each licence read

§2.10a's rule: PD, CC0, CC BY; ODbL / CC BY-SA only as a file of its own; **nothing NC, academic, unstated or conflicting, not even to check a
line against**. Each licence below was read on 2026-10-18 and is quoted; a source whose page could not be reached is marked so.

| source | what | resolution | licence, as read | verdict |
|---|---|---|---|---|
| **GEBCO_2026 Grid** (gebco.net) | global bathymetry and land elevation | 15″ (about 460 m); 4 GB netCDF compressed, 7 GB raw | "The GEBCO Grid is placed in the public domain and may be used free of charge." Attribution asked: "GEBCO Bathymetric Compilation Group 2026 (2026)." | **accepted (PD)**; four times the data of ETOPO at 60″ for a shelf edge the sea-level curve cannot place better than ±10 km anyway |
| **ETOPO 2022, 60″** (NCEI) | global relief | 60″ (1.8 km); already pinned in `sources.json` (the relief pyramid) | CC0 1.0 ("NOAA waives any potential copyright … through the Creative Commons Zero 1.0 Universal") | **accepted (CC0)**, already fetched and hashed — the cheapest input |
| **Spratt & Lisiecki 2016**, "A Late Pleistocene sea level stack", *Climate of the Past* 12 | a global (eustatic) sea-level curve 0–800 ka with bootstrap error bounds; the NOAA/WDS Paleoclimatology record is study 19982 (ASCII) | one value per 1,000 years; ±5–10 m (the stack's own bounds) | the article: "© Author(s) 2016. This work is distributed under the Creative Commons Attribution 3.0 License." The NOAA record states no licence of its own (a US federal archive; data.gov lists the entry's access level as "non-public", which conflicts with it being downloadable) | **accepted as the article's supplement (CC BY 3.0)**; the NOAA copy only after its terms are confirmed |
| **Lambeck et al. 2014**, PNAS 111, the ice-volume and sea-level curve since the LGM | the standard post-glacial curve | 1,000-year steps | the article is behind PNAS's licence; the data are in its SI with no licence statement found | **refused** (unstated) — Spratt & Lisiecki covers the same range openly |
| **ICE-6G_C (VM5a)**, Peltier, Argus & Drummond 2015 | glacial-isostatic adjustment: paleotopography and relative sea level per region, 0–26 ka at 500-year steps, 10′ grid (PMIP4 distributes 48 netCDF files) | 10′ (18 km) | the PMIP4 pages ask for citations of three papers and state **no licence**; the Toronto data page answered 503 on 2026-10-18 | **refused** (unstated), which matters: it is the one source that would correct the eustatic curve for rebound and forebulge (§4) |
| **PALEOMAP PaleoDEMs**, Scotese & Wright 2018 (Zenodo 5460860) | paleo-elevation models of the Phanerozoic | 1° (0.1° netCDF), one model every 5 million years; 415 MB | "Creative Commons Attribution 4.0 International" | **accepted but useless here**: the youngest step is 0 Ma, the next 5 Ma — nothing between 10,000 BCE and today |
| **Deltares / P. Vos, Paleogeografische kaarten van Nederland** (the "Atlas van Nederland in het Holoceen" series) on data.overheid.nl, published by the municipality of The Hague's open-data portal | the Netherlands at 9000 BCE, 3850 BCE, 2750 BCE, 1500 BCE, 500 BCE, 800 CE, 1500 CE, 1850 CE and 2000 — land, water, peat, dunes, tidal flats, as polygons (shapefile, GeoJSON, KML; RD New) | the maps' own scale, about 1:500,000 (the series' stated use: "geschikt voor het inzichtelijk maken van de locatie op de kaart"; "niet geschikt voor juridische of landmeetkundige doeleinden") | dataset level "CC-0 (1.0)", every download labelled "CC-BY (4.0)" — two open labels that conflict with each other; the source line is "Bron: Deltares/P.vos", the publisher a third party | **usable under the stricter label, CC BY 4.0, once the owner has Deltares' word** that the portal's republication is theirs (§2.10a refuses "conflicting"; both labels are accepted ones, but the provenance question is real) |
| **JRC Global Surface Water** v1.5 (Pekel et al. 2016, *Nature* 540) | where water stood, month by month, from Landsat | 30 m, 1984–2024 (occurrence, change, seasonality, recurrence, transitions, maximum extent) | "All data here is produced under the Copernicus Programme and is provided free of charge, without restriction of use."; attribution "Source: EC JRC/Google" and the paper | **accepted** — the one source for the Aral Sea, Lake Chad, Lake Urmia, the Salton Sea and every reservoir since 1984, as dated outlines |
| **USGS Landsat MSS, 1972–1983** | the same, earlier | 60 m | US government work, public domain (USGS's standing statement) | **accepted** for the Aral Sea's and Lake Chad's 1970s outlines, traced by a build step from the imagery — a few sessions of work per lake |
| **OpenStreetMap** (the present coast, in use) | — | metre-scale | ODbL 1.0 | the baseline; stays |
| **HydroLAKES**, **Natural Earth**, **CBS Wijken en Buurten**, **Wikidata** | in use | — | CC BY 4.0, PD, CC0, CC0 | stay |
| Europe's Lost Frontiers (Gaffney et al.), the Doggerland maps of Coles 1998, Stanley & Warne 1993 (the Nile delta), Larsen 1975 / Aqrawi 2001 (the head of the Gulf), the Fens drainage maps, the Venice lagoon's historic cartography | the regional reconstructions a reader would most want | figures in publications | copyrighted figures; no open dataset found on 2026-10-18 | **refused** (no open data) — §7 |

## 4. Accuracy per era, and what each method gets wrong

**Bathymetry plus a eustatic curve** (ETOPO or GEBCO contoured at the sea level of the year):

| era | sea level (Spratt & Lisiecki, ± the stack's bounds) | what the contour gets right | what it gets wrong |
|---|---|---|---|
| 10,000–8,000 BCE | about −60 m rising to −30 m (±8 m) | the great shelves as land: Doggerland and the Dogger Bank, the Sunda shelf, Sahul, the Persian Gulf as a river valley, the Yellow Sea's western half; the Bering land bridge is closing (flooded by about 9,000 BCE) | the shoreline's position on a flat shelf: a ±8 m curve moves it by tens of km on the Sunda shelf and the southern North Sea; **isostasy**: Scandinavia, Hudson Bay, the Baltic and Scotland were under the sea or ice where the contour shows land (rebound since: up to 300 m in the Gulf of Bothnia), and the forebulge regions (the southern North Sea, the Channel) were higher than the eustatic curve says — this is what ICE-6G_C would correct and it is refused (§3); the ice sheets themselves (the Laurentide, the Fennoscandian) are not drawn at all |
| 8,000–5,000 BCE | −30 m rising to about −3 m | the shelves flooding (Doggerland reduced to the Dogger Bank island by about 6,500 BCE, gone by 5,000) | the same isostasy; the Black Sea (a lake below the Bosporus sill until about 7,000 BCE — a contour of today's seabed cannot know the sill's history); the deltas (the Nile's and the Mesopotamian coast lay far inland of today's: the contour shows today's delta as land) |
| 5,000 BCE – today | within ±3 m of today | nothing: the contour is today's coast to within the data's noise | everything that moved since is land, not sea — delta growth (the head of the Gulf retreated 200 km since 4,000 BCE; the Nile delta's lagoons), the Wadden coast, the Zuiderzee's formation (a lake in Roman times, a sea after the storms of the 12th–13th centuries), every reclamation; and the polders, which lie BELOW sea level, would be flooded in every era (Flevoland at −4 m) — the land-change layer would have to mask them |

**Regional paleogeographic maps** (the Deltares series as the worked example): the maps' own resolution (about 1:500,000 — a 500 m line) and
the authors' own uncertainty (the series marks it; its stated use is orientation, not survey); nine steps over 11,000 years, so a year
between two maps shows the earlier one (the Atlas's rule: steps, never interpolation, §2.4). Right where the bathymetric method is wrong —
the Zuiderzee's formation, the peat lands, the dunes, the estuaries — because it is drawn from cores and dated sediments. No other country
has an equivalent open series that this research found (Belgium's and Germany's coasts are in the literature, not in open GIS).

**Dated outlines** (the land-change layer): as accurate as the outline's source — the CBS line to within its own precision for a polder, a
30 m Landsat pixel for a lake since 1984, 60 m since 1972; the year to the source's day. Nothing before the first source: the Aral Sea of 1960
is a map, not data.

## 5. The cost

| approach | bytes shipped | build time | code |
|---|---|---|---|
| **the land-change layer (built)** | 29 KB for five rows; a row is 2–6 KB; the Aral Sea in ten dated steps about 60 KB | seconds (the fetch once) | done; the `land` state (a patch of land over the sea) would be about 60 lines in each renderer plus the worker's edge classes |
| **bathymetry + curve, as soft "exposed shelf" washes** at 12 steps (10,000 → 5,000 BCE, 500-year steps, 8 regions) | ETOPO 60″ contoured, simplified at the LOD 1 interval (2.5 km) and stored as polygons of the EXPOSED area only (not whole coasts): about 40–80 KB a step, 0.5–1 MB in all; at GEBCO 15″ and the LOD 2 interval, 3–5 MB | minutes per step from the pinned ETOPO file (the relief pipeline already reads it); GEBCO adds a 4 GB fetch | a `build-shelves.js` step; drawn through the presence path (`drawHistoryPresence`'s stipple, the uncertainty class `approximate`), so a frame costs what a people's presence costs — the frame gate holds |
| **bathymetry + curve as a hard coast** (replacing the OSM coast per era) | the whole topology per era: 2.9 MB × steps | a conflation per step | **not recommended**: it would put every historical border on a coast whose error is tens of km, and the conflation's d1 snap (15 km) would move borders onto it |
| **the Deltares series** as dated patches of both states | nine maps, the land/water classes only, simplified at the LOD 2 interval (500 m): about 150–400 KB a map, 2–3 MB in all; or the differences between consecutive maps, under 1 MB | an afternoon for the reprojection (RD New → WGS84) and the classing | the `land` state above; a `--check` on a committed cache as §1 does |
| **GSW-derived lakes and seas** (the Aral, Chad, Urmia, the Dead Sea, the Salton Sea, the great reservoirs) | 5–10 KB a step; the Aral Sea 1984–2024 in yearly steps about 150 KB, in ten steps 50 KB | an Earth Engine or a tile export per lake per step; the licence allows it | the layer as built, rows with `from`/`to` |

## 6. Recommendation

1. **Keep the land-change layer as the one mechanism for 1500 CE onward** and add rows as the cards ask for them: the Haarlemmermeer (1852),
   the Beemster (1612), the Fens only if an open outline is found (§7), the Aral Sea in dated steps from GSW (1984–) and Landsat MSS (1972–)
   and a 1960 outline only if a PD source is found, Lake Chad the same, the Dead Sea and Lake Urmia since 1984. Add the `land` state so a row
   can also be land that later drowned — the Zuiderzee's own formation needs it (the peat lands of 800 CE that were water by 1500).
2. **The Netherlands 9000 BCE – 1850 CE from the Deltares series**, as dated patches of both states, after the owner confirms the licence
   with Deltares (the portal's two labels conflict; CC BY 4.0 is the stricter and the one to carry). It is the only open regional
   reconstruction found, it is exactly where the single coast is most wrong (the whole western Netherlands was tidal flats and peat in 3850
   BCE), and it is cheap.
3. **The glacial shelves, 10,000–5,000 BCE, as soft washes, never as a coast**: ETOPO 2022 (pinned, CC0) contoured at Spratt & Lisiecki's
   (CC BY) level in 500-year steps, only the exposed area of eight named shelves (the southern North Sea and the Channel, the Sunda shelf,
   Sahul, Beringia, the Persian Gulf, the northern Adriatic, the Yellow and East China Seas, the Siberian shelf), drawn with the presence
   stipple and the `approximate` class, with a legend line and a card sentence that says the method ("the sea floor at today's depth, at the
   sea level of the year; the rebound of the north is not corrected"). The honest accuracy statement is the §4 table: the shelves are right,
   the shoreline's position is ±tens of km, the north is wrong and is left plain. If ICE-6G_C ever states a licence, the same build takes it
   as a correction and the north becomes drawable.
4. **Nothing from bathymetry after 5,000 BCE**, and no era replaces the OSM coast: the borders stay conflated onto one line.

## 7. What will NOT be drawn, and why

* **River deltas' ancient shorelines** (the Nile, the Tigris–Euphrates head of the Gulf, the Rhône, the Po, the Yellow River): the
  reconstructions exist only as figures in copyrighted papers; bathymetry cannot see them. The cards' text can say "the coast lay here";
  the map cannot show it.
* **The Fens, the Venice lagoon's historic extent, the Haarlemmermeer before 1852, the Amstelmeer**: no open polygon found; the Dutch cases are
  in the Deltares series at its nine dates (1500 CE and 1850 CE for the lakes), not at the year of each work.
* **The Aral Sea and Lake Chad before 1972**: no open outline; the 1960 Aral Sea is a published map.
* **Scandinavia, the Baltic, Hudson Bay, Scotland and the Channel before 5,000 BCE**: the isostatic correction (ICE-6G_C) has no stated
  licence; the eustatic contour there is wrong by tens to hundreds of metres and would be worse than a plain coast.
* **The ice sheets**: not a coast; a presence layer of its own if ever wanted, from the same refused source.
* **Lake Flevo and the Almere** (the Zuiderzee before the 12th century): in the Deltares series (800 CE), nowhere else open.
* **The Black Sea's flooding** (about 7,000 BCE): the sill's history is not in bathymetry; the literature is contested.
* **Any coast at a year between two steps**: a step holds until the next, as every layer of the Atlas does.

### Sources read for this file (2026-10-18)

GEBCO "Gridded bathymetry data" (gebco.net); Zenodo 5460860 (PALEOMAP PaleoDEMs); the PMIP4 ICE-6G-C data page (pmip4.lsce.ipsl.fr) and the
Toronto data page (503); *Climate of the Past* 12, 1079 (Spratt & Lisiecki 2016) and NOAA/WDS Paleoclimatology study 19982; data.overheid.nl,
"Paleogeografische kaart van 9000 voor Christus" and "… 1500 na Christus" (the series' nine entries); global-surface-water.appspot.com/download;
the PDOK CBS Wijken en Buurten 2024 WFS GetCapabilities; Rijkswaterstaat, "100 jaar Zuiderzeewerken"; nl.wikipedia "Zuidelijk Flevoland" and
"Knardijk"; Wikidata Q428517, Q69262, Q2482369, Q2199768, Q3073667, Q240960, Q4121, Q707, Q2547295, Q12015812 (SPARQL, 2026-10-18); NOS
2161878; BNNVARA Vroege Vogels, "Eerste land Marker Wadden boven water".
