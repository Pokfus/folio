# Dated border sources for the Atlas's states and wars (excluding Cliopatria and historical-basemaps)

> **A RESEARCH NOTE BEHIND `docs/atlas-borders-audit.md`** — read that file first; this is the evidence for
> its source catalogue and the states and wars ratings (§3, §4.B, §4.D). Written 2026-10-01 by a research pass that downloaded or opened every source it names. The
> licences of Cliopatria and historical-basemaps were re-checked by hand the same day; every other claim
> is the pass's own and is to be re-checked against the source before a batch relies on it. Any work this
> note marks "not opened" has not been seen at all. Paths it mentions (`research/…`, `inventory.txt`) were
> scratch files of that session and no longer exist.


Researched 2026-10-01. Scope: the 21 `state`/`dynasty` lines and 55 `W` lines in `inventory.txt`.
Cliopatria/Seshat and aourednik/historical-basemaps are left out on purpose, because another agent is
matching against them. Where those two would probably fill a gap (Sasanian, Seleucid, Golden Horde), the row says so.

Every URL below was opened in this session. Some facts come from a live query and not from a page.
Those are marked **[query]**. The raw OHM query results and query texts are in `research/states-wars-ohm/`.

Licence key for Folio, a public site that ships its data files:
- **OK**: CC0, public domain, CC BY.
- **SA**: ODbL or CC BY-SA. Usable, but the derived data file must be released under the same licence
  and credited. This applies to that file only, not to the site.
- **NC**: non-commercial. Avoid shipping it. NC-SA also forces the file under NC-SA, so treat it as reference only.
- **closed**: all rights reserved, paid, or "no redistribution". Use only as a cited reference for
  independent tracing, if at all.

---

## 1. Source catalogue

| # | Source | URL opened | Coverage | Time resolution | Format | Licence | Verdict |
|---|---|---|---|---|---|---|---|
| S1 | **OpenHistoricalMap (OHM)** | https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Reuse ; Overpass `https://overpass-api.openhistoricalmap.org/api/interpreter` | Worldwide and crowd-sourced. **[query]** 4,132 `admin_level=2` boundary relations. About 13 alive at 500 BCE, 62 at 1000, 138 at 1500, 191 at 1700, 189 at 1900, 206 at 1938 and 216 at 2010 | Each polygon version has `start_date`/`end_date`, often to the day | OSM relations, available as planet file, Overpass, vector tiles or API | **CC0** ("in the public domain under a CC0 dedication"). Some imported features carry attribution requests | **Best fit for Folio's licence.** Coverage is patchy and quality varies: many ancient polygons are traced from Wikimedia Commons maps and say so in `source:url`. Check each series before use. Direct API calls get a Cloudflare 403 from here, but Overpass works |
| S2 | **CShapes 2.0** (ETH Zürich ICR) | https://icr.ethz.ch/data/cshapes/ (CSV downloaded and inspected) | Independent states and dependent territories, 1886–2019 | **[query]** 710 polygon versions with day-exact `gwsdate`/`gwedate`, for example Finland changes on 1940-03-12 and Korea becomes a Japanese dependency 1910-08-23→1945-08-14 | CSV with WKT, GeoJSON, Shapefile, SQL, R | **CC BY-NC-SA 4.0** | **NC: do not ship it.** Very good as a cross-check of OHM. Models de jure borders only: Ethiopia is unchanged 1907–1952 and there is no Manchukuo |
| S3 | **Newberry Atlas of Historical County Boundaries**, US states and territories | https://publications.newberry.org/ahcb/documents/US_HistStateTerr_Metadata2.htm ; https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Projects/Newberry_Atlas_of_Historical_County_Boundaries_Import | US states and territories from 1783-09-03 to 2000-12-31. The per-state files also cover colonial-era changes | "All changes are dated to the day" (START_N/END_N) | Shapefile | **Conflict.** The metadata says CC BY-NC-SA. The OHM wiki quotes the Library of Congress as saying CC0 and adds that "email communication… with contacts at Newberry have clarified that CC0 is the governing license" | Use it **through the OHM import (CC0)**, or get written confirmation from Newberry before shipping a derivative. It does not show Native nations' lands |
| S4 | **USFS "Indian Land Cessions in the United States"**, Royce 1899 digitised | https://data.fs.usda.gov/geodata/edw/edw_resources/meta/S_USA.TRIBALCEDEDLANDS.xml ; https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_TribalCessionLands_01/MapServer/1 | 752 cession polygons, 1784–1894, digitised from Royce's 67 maps | Each cession links via `cessnum` to Royce's schedule (treaty date) in table layer 2 | GDB, Shapefile, GeoJSON, KML | US federal work, so public domain in the US. The metadata has only a no-warranty disclaimer | **OK.** The key source for US-versus-Native frontiers from 1784 |
| S5 | **CHGIS V6** (Harvard and Fudan) | https://chgis.fas.harvard.edu/data/chgis/v6/ ; Dataverse API for doi:10.7910/DVN/I0Q7SM | Time-series prefecture polygons, county and prefecture points. "Mostly complete… 1350–1911 CE. Prefectures from earlier periods, 221 BCE to 1350 CE, still have gaps" | Yearly begin/end per unit | Shapefile | "**Free for academic research, no commercial use, resale, or redistribution permitted.**" Dataverse lists no licence and says to contact the authors | **Closed: cannot ship.** Nothing before 221 BCE, so no Shang, Zhou or Warring States. Reference only |
| S6 | **AWMC geodata** (Ancient World Mapping Center) | https://raw.githubusercontent.com/AWMC/geodata/master/README.md and `LICENSE.txt`; tree listed via git | `political_shading/` has: Persian Empire extent, Alexander's empire, Roman Republic 60 BCE, Roman Empire 117 and 200 (extent and provinces), post-Diocletian provinces, senatorial provinces, Hasmonean, Herod. Also coast, rivers and roads | One snapshot per layer | GeoJSON, Shapefile | **ODbL** ("derived from the Barrington Atlas") | **SA.** High-quality single snapshots (2.4k–4.6k vertices). Best open Achaemenid and Alexander outlines; an ODbL notice is needed on the derived file |
| S7 | **DARE**, Digital Atlas of the Roman Empire (Åhlfeldt) | http://imperium.ahlfeldt.se/print.php?doc=info_api ; https://dh.gu.se/dare/ | About 27k ancient places; provinces only in rendered tiles, c. CE 200 | Single period | GeoJSON API (points), tiles | **CC BY-SA 3.0** | **SA.** Places only, so it adds little for borders beyond AWMC |
| S8 | **Pleiades** gazetteer | https://pleiades.stoa.org/downloads | About 40k ancient places, mostly points with some regions | Attestation periods | CSV, JSON, KML dumps | **CC BY 3.0** | **OK.** Supplies coordinates for building coalitions from member lists (Delian League, Hellenic League, perioikic towns). Not polities |
| S9 | **POLIS dataset** (Stanford, from Hansen and Nielsen's *Inventory of Archaic and Classical Poleis*) | https://polis.stanford.edu/ ; https://www.electrummagazine.com/2021/12/an-interactive-mapping-app-for-an-inventory-of-archaic-and-classical-poleis/ | 1,035 poleis with region, Delian and/or koinon membership, and more | Archaic and Classical, c. 650–325 BCE (attributes, not yearly) | GeoJSON (via app "About") | **Unclear**: "freely available… for academic use and general interest". No licence found | Reference only. Rebuild membership from Pleiades (CC BY) and the primary lists |
| S10 | **Shepherd, *Historical Atlas*** (Henry Holt, 1923 and 1926 eds.) at UT Austin PCL | https://maps.lib.utexas.edu/maps/historical/history_shepherd_1923.html | Relevant plates: Persian Empire c. 500 BCE; Athenian Empire c. 450; Greece 500–479, 431 and 362 BCE; Macedonian Empire 336–323; Growth of Roman Power in Italy and in Asia Minor; Rome and Carthage 218 BCE; France 1035, 1154–84, 1328 and 1453; Europe 1360; Italy c. 1494; Mongol Dominions 1300–1405; Conquest of Mexico and of Peru; Growth of Russia 1300–1796; Europe c. 1000/1097/1190 | Plate per date | Raster scans | Published 1923/1926, so **public domain in the US** (95-year rule) | **OK as a tracing base**, cited per plate. Scholarship is a century old, so cross-check against modern work |
| S11 | **Guerber, *The Story of Old France* (1910)**, map of English possessions in France | https://commons.wikimedia.org/wiki/File:English_Possessions_in_France,_1180-1429.png | English holdings in 1180, 1280, 1360 and 1429 | 4 phases | Raster | **Public domain** (pre-1931) | OK tracing base for the Hundred Years' War, alongside Shepherd's France 1328/1453 |
| S12 | ***Atlas of the World Battle Fronts in Semimonthly Phases to August 15 1945*** (US Army Chief of Staff, 1945) | https://en.wikisource.org/wiki/Atlas_of_the_World_Battle_Fronts_in_Semimonthly_Phases_to_August_15_1945 | Front lines in Europe and the Pacific (including China) | **Every two weeks, 1 Jul 1943 – 15 Aug 1945** | Raster | **Public domain** (US federal work) | **OK.** The only fortnightly front-line source found for WW2. It must be traced; no vector version found |
| S13 | **Stanford Spatial History Lab, "Building the New Order: 1938–1945"** (De Groot, 2010) | https://web.stanford.edu/group/spatialhistory/static/publications/pub51.html | European borders and occupation zones | **Monthly, Feb 1938 – Nov 1944** | Shapefile zip linked from the page, but **the download now returns HTTP 403** | "Copyright ©2010 Stanford University. All rights reserved. This work may be copied for non-profit educational uses…" | **Closed/NC**, and the file is unreachable. Reference only |
| S14 | **Euratlas Periodis** (Nüssli) | https://www.euratlas.net/history/europe/gis.html | Europe (15°W–50°E, 20–60°N) | **Centennial only**: 1200, 1300 … 2000 (GIS) | Shapefile, paid | Commercial: the simple licence allows "website with less than 500,000 visitors per month". Extended licence €600+ | **Closed/paid**, and too coarse (100-year steps). Not recommended |
| S15 | **GeaCron** | https://geacron.com/the-geacron-project/ | World, 3000 BCE to the present | "the historical situation… at the beginning of every year" | Proprietary vector database | No public licence; "Commercial Offer" on request | **Closed.** The only annual world dataset found, but a negotiated licence is needed |
| S16 | **HGIS de las Indias** (Graz) | Harvard Dataverse API, `subtree=hgis-indias` (e.g. doi:10.7910/DVN/KJPNFJ) | Spanish America: provinces, audiencias and bishoprics in 1701, 1725, 1750, 1775, 1787, 1800, 1808; treaty lines 1494–1808 | 7 snapshots | Shapefile | **CC BY-NC-SA 4.0** | NC. Not needed by the inventory (it starts after Aztec and Inca) |
| S17 | **CODH 歴史的行政区域データセットβ** (Japan) | https://geoshape.ex.nii.ac.jp/city/ (via search result) | Japanese municipalities 1920–2023 | Municipal, yearly | GeoJSON | CC BY 4.0 (CODH credit) | OK but irrelevant at empire scale. No Korean equivalent was found for the ancient period |
| S18 | **Wikidata geoshapes** (P3896, Commons `Data:*.map`) | SPARQL at https://query.wikidata.org/sparql **[query]** | About 20 historical states have one shape each (e.g. Roman Empire 117, Qing 1790) | Single snapshot | GeoJSON | Per-file Commons licence, often unclear provenance | Negligible |
| S19 | Commons map of the Kievan Rus' principalities 1054–1132 | https://commons.wikimedia.org/wiki/File:Principalities_of_Kievan_Rus%27_(1054-1132)_en.svg | Rus' principalities after 1054 | 1 phase | SVG | CC BY-SA 3.0. **Cites no sources** | Weak. Prefer Shepherd (PD) plus a cited modern atlas |
| S20 | Lugo & Alatriste-Contreras 2019, *PLOS ONE* (Aztec routes) | https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0218593 | Uses INAH tributary-province vectors "based on Barlow's study" | 1 phase | Shapefile (INAH, not redistributed) | Paper CC BY; **the INAH province data's terms are not stated** | Pointer only. Shows that a Barlow/INAH province layer exists, obtainable from INAH |

Not used:
- The ArcGIS Online "Mongol Empire" layers (personal upload, no licence).
- GEO GPS Perú's Qhapaq Ñan shapefile (roads, not borders; terms not checked).
- HGIS Germany (1820–1914; not in the inventory's span; licence not verified).
- The Copenhagen Polis Centre book itself (OUP, copyright).

### What OHM actually has for the inventory **[query]**

All rows below are `boundary=administrative`, admin_level 2 unless noted. Dates are `start → end`.

**Present:**
- **Empire of Japan**: 16 versions, from 1868-01-03 through 1877, 1879, 1895-05-08, 1898, 1905-09-05, 1910-08-27, 1919-06-28, 1920, 1925, 1931 and 1939-04-09 to 1945-09-02, then 1945-10-25 and 1947-05-03. De jure only: the 1931–39 bbox spans Taiwan to the South Seas Mandate, and Manchukuo is separate (1932→1945-08-17).
- **Mongol Empire**: 11 versions, 1162–1200, 1201–04, 1205–07, 1208–09, 1210–14, 1215–18, 1218–19, 1219–31, 1231–39, 1239–59 and 1259–71. Sourced to the Georgian Soviet Encyclopedia vol. 7 via a Commons scan. Also the Il-khanate 1259–1357. **No Golden Horde, Chagatai or Yuan.**
- **Aztec Empire**: 3 versions (1428–65, 1465–86, 1486–1521), `source` = Wikipedia.
- **Inca Empire**: 1 version (1438–1533).
- **Carthaginian Empire**: −814/−600, −600/−264, −500/−400, −400/−241, −241/−218, −218/−206, −206/−146. Plus Carthaginian Sicily (−500/−400 and −400/−241), Sardinia (−500/−238) and Iberia (−218/−201). Sourced to Commons `Carthaginianempire.PNG`.
- **Roman Republic**: 20 versions from −509 to −27. The step boundaries are −338, −298, −290, −272, −264, −241, −238, −218, −212, −206, −154, −146, −121, −96, −66, −64, −58, −42 and −30. Sourced to Commons `Roman_conquest_of_Italy.PNG` and others.
- Augustan *regiones* IV Samnium, V Picenum and VI Umbria (CE 7–292, admin level 4).
- Gallia Narbonensis from −121; Lusitania from −28.
- Sparta (−900→−371, 1 polygon covering Laconia and Messenia).
- Achaean League (−192→−146). Boeotia (−700→−200). Tyranny of Syracuse (−500→−212). Kingdom of Numidia (−201→−146).
- Shang (−1600→−1046, 1). Western Zhou (−1095→−771, 1). Western Han (−107/−75, −74/8).
- Rashidun Caliphate (632–661, 1). Eastern Roman Empire: about 35 versions from 395 to 1453, including 624, 635, 637, 641, 643 and 647.
- Duchy of Normandy (911, 933, 1195, 1204). Kingdom of England (1066-10-14→1283, 1283→1513 and later). The England bbox stops at 1.8°E, so **no Gascony or Calais**.
- Kingdom of France: about 30 versions from 987. The 1384→1513 version has a degenerate bbox, i.e. broken geometry.
- **Italy**: Venice about 20 versions (697–1797); Milan about 15; Florence (1115–1405, 1406–1555); Papal States about 25; Naples 6; Sicily 11; Genoa about 20; plus Ferrara, Modena, Mantua, Lucca, Pisa and Saluzzo.
- **WW2 Europe**: German Reich 20 versions 1918–1945, including 1938-03-13, 1938-11-21, 1939-03-16, 1939-10-26, 1940-05-18, 1940-06-01, 1940-08-02, 1941-04-14 and 1941-08-01. Italy 12 versions 1920–1954. Hungary 7 versions 1921–1944. Finland 1920-10-14→1940-03-12→1944-09-19. Ethiopian Empire →1936-05-09. Italian East Africa 1936-06-01→1941-11-27. Mongolian People's Republic 1924→1992.

**Absent** (searched by English and native names):
- Achaemenid, Ptolemaic, Seleucid, Antigonid Macedon, Bactria, Indo-Greek, Athens and its empire, Lydia, Messenia (as its own polity), Pontus, the Illyrians, Gauls, Celtiberians and Etruria.
- Bosporan Kingdom, Volga Bulgaria, Kievan Rus', Golden Horde, Sasanian.
- Nanyue, Gojoseon, Qin and the six Warring States, Jin and Wu, Xiongnu.
- The Haudenosaunee and the Western Confederacy.
- The Soviet Union 1922–1948 (not found under "Soviet/USSR" names; might exist under another name).

---

## 2. Ratings: states (21 inventory lines)

Rating scale: 1 easy, 2 good, 3 moderate (trace per phase from a cited map), 4 hard, 5 very hard.

| id | State (inventory span) | Rating | Best source(s) | Approach |
|---|---|---|---|---|
| gr-233 | Lacedaemon (c. 700–195 BCE) | **2** | OHM Sparta (CC0, 1 polygon, Laconia + Messenia); Shepherd 1926 "Greece under Theban Headship 362 BC" (PD); Pleiades perioikic towns (CC BY) | Split OHM's polygon at Taygetos. Messenia is included until 370/369, then Laconia only. Mark later losses to the Achaean League (192) and the free Laconians (195) as phases traced from a cited map. Three or four steps |
| wh-245 | Shang (c. 1600–1046) | **3** | OHM Shang (CC0, 1 polygon, unsourced); CHGIS has nothing before 221 BCE | Two phases (Erligang horizon; Late Shang at Anyang), traced from a cited archaeological map. Expect the extent to be disputed, so keep a soft outline |
| gr-381 | Achaemenid Empire (c. 550–330) | **2** | AWMC `extent_of_the_persian_empire` (ODbL, Barrington-derived); Shepherd "Persian Empire about 500 B.C." (PD) | Treat the AWMC maximum extent as the envelope. Build phases by clipping to dated conquests: Media 550, Lydia 546, Babylon 539, Egypt 525, Indus and Thrace c. 518–513, Egypt lost 404–343, Alexander 334–330. Ship the result under ODbL |
| wh-301 | Achaemenid Empire (same) | **2** | as gr-381 | Share the geometry with gr-381 |
| rm-182 | Carthaginian empire | **1** | OHM Carthage (7 versions plus Sicily, Sardinia and Iberia sub-polygons, CC0) | Import as is. Check Iberia's start date: OHM has −218, but the Barcid holdings date from 237 BCE |
| ru-010 | Bosporan Kingdom (c. 480 BCE–342 CE) | **3** | No open polygon. Shepherd "Reference Map of Asia Minor…" (PD) is marginal; use a cited modern map | Phases: Archaeanactid core on the Kerch strait; Spartocid gains (Nymphaeum, Theodosia, Sindike) in the 4th century; Mithridatic; Roman client. The hinterland edge is vague |
| ww2-081 | Empire of Japan (1889–1947) | **1** | OHM Empire of Japan, 16 day-dated versions (CC0); CShapes for checking only (NC-SA) | Import the OHM series. De jure only, so occupied China and South-East Asia need a separate "occupied" layer (see ww2-096) |
| ko-046 | Gojoseon (c. 300–108 BCE) | **4** | No open data; scholarship conflicts (Liaodong-centred versus Pyongyang-centred) | Draw a deliberately soft outline from one cited mainstream map. State the uncertainty on the card |
| cnh-111 | Zhou (c. 1046–256) | **3** | OHM Western Zhou (1 polygon, CC0); CHGIS has nothing | Western Zhou from OHM, checked against a cited map. Eastern Zhou is the shrinking royal domain around Luoyang, traced in about 3 steps |
| cnh-232 | Nanyue (c. 204–111) | **3** | No open polygon | One or two phases from a cited map; the core is Guangdong, Guangxi and northern Vietnam |
| gr-767 | Ptolemaic Egypt (305–30) | **3** | No open polygon; AWMC Alexander layer for coastlines | Phases: Coele-Syria held until Panium (200), Cyrenaica, Cyprus, Aegean holdings; trace from a cited map |
| gr-770 | Antigonid Macedonia (294–168) | **3** | No open polygon; Shepherd 1926 maps (PD) | Phases 277, 229/222 (Doson), 197 (after Cynoscephalae) and 168 |
| gr-783 | Graeco-Bactria (c. 250–c. 130) | **4** | No open data; the sources are sparse and coin-based | One soft outline plus perhaps one expansion phase, from a cited map |
| gr-784 | Indo-Greek Gandhara (c. 190–) | **4** | No open data; extent is inferred from coin finds and conflicts | Soft outline at Menander's height, plus contraction, from a cited map |
| wh-594 | Mongol Empire (1206–) | **1** | OHM 11 versions 1162–1271 (CC0) plus Il-khanate | Import. Check the shapes against a modern atlas, since the source is a Soviet encyclopedia scan |
| ru-091 | Mongol Empire (1206–1260, then Jochid west) | **1** | as wh-594 | The united phase comes from OHM. The Jochid ulus (Golden Horde) after 1260 is missing in OHM, so take it from Cliopatria or historical-basemaps (other agent) |
| wh-605 | Aztec Empire (c. 1430–1521) | **1** | OHM 3 versions 1428/1465/1486–1521 (CC0, source = Wikipedia); Berdan et al. 1996 provinces (INAH/Barlow, terms unknown) as a check | Import, then refine reign-by-reign (Itzcoatl through Moctezuma II) against a cited provinces map |
| wh-612 | Inca Empire (1438–1533) | **2** | OHM 1 polygon (CC0); Shepherd "Conquest of Peru" (PD) | Use OHM as the envelope. Add Pachacuti, Topa Inca and Huayna Capac phases traced from a cited map (Rowe-based chronology) |
| wh-622 | Northern and central Italy (c. 1100–1494) | **1** | OHM Venice, Milan, Florence, Papal States, Naples, Genoa and others, dozens of dated versions (CC0); Shepherd "Italy about 1494" (PD) | Import for 1250–1494. The c. 1100–1200 communes phase is not in OHM; trace from a cited map (rating 3 for that phase alone) |
| ru-015 | Volga Bulgaria (c. 900–1236) | **4** | No open data; Shepherd "Europe about 1000/1097" (PD) is coarse | One soft outline from a cited map; the borders are sparse and conflicting |
| ru-036 | Kievan Rus' (c. 880–1240) | **3** | No open polygon; Shepherd Europe c. 1000/1097/1190 (PD); Commons 1054–1132 SVG (CC BY-SA, uncited) | Phases c. 900, c. 1000, 1054 (principalities) and c. 1132, traced from PD and cited maps |

---

## 3. Ratings: wars (55 inventory lines)

Rule used: the **harder side** sets the rating. Where a side needs only static regions, it is not penalised.

| id | War | Rating | Best source(s) | Approach |
|---|---|---|---|---|
| gr-235 | Messenian Wars | **2** | OHM Sparta, split at Taygetos; Pleiades | Static Laconia versus Messenia. Progress within the war is not recorded anywhere, so do not invent it |
| gr-236 | First Messenian War | **2** | as gr-235 | same |
| gr-237 | Second Messenian War | **2** | as gr-235 | same |
| gr-461 | Third Messenian War | **2** | as gr-235 | Rebels hold Messenia and Ithome; static |
| gr-383 | Persian conquest of Lydia | **2** | AWMC Persian extent (ODbL); Shepherd PD | Lydia is Anatolia west of the Halys, clipped from AWMC. Persia is the ex-Median empire |
| wh-310 | Fall of the Achaemenid Empire | **2** | AWMC Persian extent and Alexander's empire (ODbL) | Yearly: clip Persia by the regions taken in 334, 333, 332, 331 and 330 (Granicus, Issus, Tyre/Egypt, Gaugamela, Persepolis) |
| wh-319 | Greco-Persian Wars | **3** | AWMC Persia; Shepherd "Greece 500–479" (PD); Pleiades and the Serpent Column list for the Greek allies | Build the Greek coalition from member poleis (points to regions) per phase: 499 Ionian revolt, 490, 480/479 |
| wh-330 | Peloponnesian War | **3** | Shepherd "Greece at the Beginning of the Peloponnesian War 431" and "Athenian Empire c. 450" (PD); Pleiades; tribute-list membership | Trace both alliance maps for 431. Add phases for 421 and 413–404 (defections) |
| gr-521 | Peloponnesian War | **3** | as wh-330 | share |
| gr-552 | Sicilian Expedition | **3** | OHM Syracuse (CC0); Athens' side as wh-330 | Syracuse is static; Athens' empire is traced |
| gr-561 | Decelean War | **3** | as wh-330 | 413–404: shrink the Athenian empire on dated revolts |
| gr-676 | Social War (357–355) | **2** | Island coastlines (AWMC ODbL or Natural Earth) for Chios, Rhodes, Cos and Byzantium; Pleiades | The allies are four islands or cities and need no tracing. Athens is Attica plus loyal members |
| gr-755 | Lamian War | **3** | Shepherd 1926 maps (PD) | Trace Macedon (Antipater) and the Greek coalition (Athens, Aetolia, Thessaly…) |
| wh-345 | Punic Wars | **1** | OHM Roman Republic (20 steps) and Carthage (7 steps plus sub-polygons), CC0 | Import both series; they already step at −264, −241, −238, −218, −206 and −146 |
| rm-186 | First Punic War | **1** | as wh-345 | same |
| rm-209 | Second Punic War | **1** | as wh-345; Shepherd "Rome and Carthage 218 B.C." (PD) as a check | same |
| rm-234 | Third Punic War | **1** | as wh-345 | same |
| rm-151 | Samnite Wars | **2** | OHM Roman Republic −338/−298/−290; Samnium from OHM Regio IV (an Augustan unit, so adjust) or Shepherd "Growth of Roman Power in Italy" (PD) | Rome steps from OHM; Samnium as one region |
| rm-152 | First Samnite War | **2** | as rm-151 | same |
| rm-153 | Second Samnite War | **2** | as rm-151 | same |
| rm-156 | Third Samnite War | **2** | as rm-151 | same |
| rm-158 | Roman conquest of Etruria | **2** | OHM Rome steps; Shepherd "Reference Map of Ancient Italy, Northern Part" (PD) | Etruria as one region, shrinking city by city (Veii 396 …) |
| rm-159 | Roman conquest of Umbria and Picenum | **2** | OHM Rome steps; OHM Regio V and VI (CE 7) as region outlines | same |
| rm-162 | Roman conquest of Cisalpine Gaul | **2** | OHM Rome −238/−218/−212…; Shepherd PD | The Gauls' region is the Po valley minus Roman holdings |
| rm-237 | Illyrian Wars | **3** | No open polygon for the Ardiaean kingdom | Trace from a cited map |
| rm-240 | Second Macedonian War | **3** | Rome from OHM; Macedon has no open polygon | Trace Antigonid Macedon (shared with gr-770) |
| rm-249 | Third Macedonian War | **3** | as rm-240 | same |
| wh-349 | Roman conquest of Greece | **3** | Rome from OHM; Achaean League from OHM (−192/−146, CC0); Macedon and Aetolia traced | Mixed |
| rm-245 | Roman–Seleucid War | **3** | Rome from OHM; Seleucid has no open polygon here (probably in Cliopatria or historical-basemaps); Shepherd "Growth of Roman Power in Asia Minor" (PD) | Seleucid c. 192 and after Apamea 188 |
| rm-255 | Achaean War | **2** | OHM Achaean League (CC0) and Rome | Import |
| rm-261 | Roman conquest of Spain (218–19) | **2** | OHM Rome steps through −19 (covers Hispania progress) | The losers are the remaining unconquered Iberia, i.e. the complement of Roman holdings |
| rm-262 | Celtiberian Wars | **3** | No open tribal polygons | Trace Celtiberian territory from a cited map |
| rm-263 | Lusitanian War | **3** | OHM Lusitania (−28, an Augustan province, a poor proxy) | Trace from a cited map |
| rm-265 | Numantine War | **3** | as rm-262 | same |
| rm-292 | Jugurthine War | **2** | OHM Numidia (−201/−146, 1 polygon); OHM Rome −121/−96 | The 116 BCE division and the war phases are traced |
| gr-448 | Carthaginian invasion of Sicily (480) | **2** | OHM Carthaginian Sicily (−500/−400) and Syracuse (−500/−212), CC0 | Import. The "Sicilian Greeks" are Syracuse plus Akragas |
| rm-310 | First Mithridatic War | **3** | Rome from OHM; Pontus has no open polygon; Shepherd "Growth of Roman Power in Asia Minor" (PD) | Pontus at its 88 BCE height, then the 85 treaty |
| rm-333 | Third Mithridatic War | **3** | as rm-310 | same |
| wh-354 | Gallic Wars | **3** | Rome from OHM (−58/−42), Gallia Narbonensis from OHM; no open tribal map | Trace tribal or regional blocks and add yearly campaign steps 58–51 |
| rm-350 | Gallic Wars | **3** | as wh-354 | share |
| wh-463 | Early Muslim conquests (632–651) | **3** | OHM Rashidun (1) and Eastern Roman Empire (versions 624, 635, 637, 641, 643, 647; CC0) | Byzantium is yearly from OHM. The Sasanian collapse 636–651 is not in OHM; take it from Cliopatria or historical-basemaps (other agent) or trace |
| wh-504 | Norman Conquest | **2** | OHM Duchy of Normandy (933/1195) and Kingdom of England (1066-10-14) | Both static; import. Pre-1066 England may need the 1066 outline reused |
| wh-518 | Hundred Years' War | **3** | Shepherd "France in 1328", "Europe in 1360" and "France in 1453" (PD); Guerber 1180/1280/1360/1429 (PD); OHM France has broken 1384–1513 geometry | Trace English holdings at 1337, 1360, 1380, 1429 and 1453 from the PD plates |
| cnh-103 | Fall of the Shang | **3** | OHM Shang and Western Zhou (1 each) | The pre-conquest Zhou homeland in the Wei valley is traced |
| cnh-188 | Qin conquest of the six states (230–221) | **3** | No open Warring States polygons; CHGIS starts 221 and cannot be shipped | Trace the seven states c. 230 once from a cited map. Then step yearly by annexation date (Han 230, Zhao 228, Wei 225, Chu 223, Yan 222, Qi 221) |
| cnh-205 | Qin conquest of the south | **3** | none open | Trace the three commanderies of 214 (Guilin, Xiang, Nanhai) from a cited map |
| cnh-224 | Han–Xiongnu wars | **4** | OHM Western Han only from −107; Xiongnu has no stable border | Han steps 133–119 traced (Hexi corridor 121); give the Xiongnu side a soft steppe zone |
| cnh-295 | Conquest of Wu by Jin | **3** | none open (CHGIS gaps, no redistribution) | Trace Jin and Wu as of 279 from a cited map; Wu then collapses by 280 |
| us-071 | Sullivan Expedition (1779) | **3** | AHCB per-state colonial files (CC0 via OHM); the Royce cessions start in 1784 | The US side comes from the state files. The Seneca and Cayuga homeland is traced, from the 1768 Fort Stanwix line and a cited map |
| us-072 | Northwest Indian War (1785–95) | **2** | AHCB/OHM (states and territories, day-dated); USFS Royce cessions (PD), e.g. Fort McIntosh 1785 and Greenville 1795 | The Confederacy's lands are the Ohio country minus ceded polygons, by treaty date |
| ww2-001 | Second World War | **2** (sides) / 3 (fronts) | OHM country series (CC0; Reich, Italy, Hungary, Finland, Japan, Manchukuo…); CShapes for checks; S12 fortnightly fronts 1943–45 (PD) | Date-aware membership of each side (entry and exit dates) over the yearly OHM borders. Front lines are optional, traced from S12 |
| ww2-042 | Second Italo-Ethiopian War | **2** | OHM Ethiopian Empire →1936-05-09, Italian East Africa from 1936-06-01, Italy (CC0) | Import. The advance from Oct 1935 to May 1936 needs tracing (3) if wanted |
| ww2-096 | Second Sino-Japanese War | **3** | OHM Japan and Manchukuo (de jure); S12 fronts in China from Jul 1943 (PD) | Japanese-occupied China for 1937–43 must be traced from cited maps; 1943–45 from S12 |
| ww2-100 | Soviet–Japanese border conflicts | **2** | OHM Manchukuo, Mongolia and Japan (CC0); the USSR series was not found in OHM under the names searched | Static sides; the USSR from the existing 1938 era map |
| ww2-159 | Winter War | **1** | OHM Finland 1920-10-14→1940-03-12→1944-09-19 (CC0); CShapes agrees (1940-03-12) | Import |

**Counts.**

| Rating | States (21) | Wars (55) |
|---|---|---|
| 1 | 6 | 5 |
| 2 | 4 | 23 |
| 3 | 7 | 26 |
| 4 | 4 | 1 |
| 5 | 0 | 0 |

---

## 4. Making the 13 era maps change by year

The era maps are snapshots for 1500, 1600, 1700, 1800, 1900, 1920, 1938, 1960, 1994, 2000 and 2010 (historical-basemaps), plus Natural Earth for 2015/2020.

1. **OpenHistoricalMap is the realistic yearly source (CC0).**
   - About 190–220 country-level polygons are alive at any year from 1700 to 2010, and versions are mostly day-dated.
   - Europe from 1648 is dense: France, the Holy Roman Empire and the Reich have dozens of versions, as does Italy.
   - East Asia is good: Qing has 15 versions 1636–1912, Japan 16, and Joseon is present.
   - Colonial Africa and the Americas are partial (New France, Massachusetts and the Rhodesias are present).
   - Pipeline: pull all `admin_level=2` relations through Overpass (or the planet file), and cut a polygon set at each year's 1 January. Fall back to the nearest historical-basemaps snapshot where OHM has no polygon covering an area. Hold that fallback until the next snapshot, as now.
   - Expect geometry checks (the France 1384–1513 example is broken) and gaps (USSR 1922–48 not found by name).
2. **For 1886–2019, use CShapes 2.0 only as a cross-check** (710 day-dated versions). It is CC BY-NC-SA, so Folio should not ship polygons derived from it without permission from ETH ICR. Its change dates are a ready-made list of "years when something changed", which can be used to audit OHM. A list of dates is a fact, not the licensed geometry.
3. **United States 1783–2000**: the Newberry AHCB states and territories, through the OHM import (CC0), give day-dated changes. Add the USFS/Royce cessions (PD, 1784–1894) for the Native-held interior that both datasets otherwise leave blank or as "unorganised".
4. **1938–1945**: OHM already has 20 Reich versions and several for Italy and Hungary, so the 1938 and 1960 snapshots can become a yearly or monthly series for Europe. Occupation and front lines are not "borders" in any of these sets. The only open source found is the PD fortnightly *Atlas of the World Battle Fronts* (Jul 1943–Aug 1945), which must be traced. Stanford's monthly 1938–44 set is all-rights-reserved and its download is dead (403).
5. **1500–1886 outside OHM coverage**: no open yearly dataset was found.
   - Euratlas is centennial and paid.
   - GeaCron is annual but proprietary; its "Commercial Offer" is on request.
   - HGIS de las Indias (7 snapshots of Spanish America 1701–1808) is CC BY-NC-SA.
   - So in those regions the era maps stay snapshot-based unless GeaCron is licensed.

Licence warnings to carry into the pipeline:
- **ODbL** (AWMC) and **CC BY-SA** (DARE, Commons SVGs): the derived data file must carry the same licence and credit.
- **NC** (CShapes, HGIS de las Indias, AHCB as distributed): do not ship.
- **Closed** (CHGIS "no redistribution", Stanford, Euratlas, GeaCron): reference only.
- OHM polygons traced from CC BY-SA Commons images are published as CC0 by OHM. Folio can rely on OHM's CC0, but should keep the `source:url` in its own provenance notes.
