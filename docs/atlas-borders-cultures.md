# Cultures & peoples on the globe — what sources could replace the hand-drawn shapes

> **A RESEARCH NOTE BEHIND `docs/atlas-borders-audit.md`** — read that file first; this is the evidence for
> its peoples-and-cultures ratings (§4.C). Written 2026-10-01 by a research pass that downloaded or opened every source it names. The
> licences of Cliopatria and historical-basemaps were re-checked by hand the same day; every other claim
> is the pass's own and is to be re-checked against the source before a batch relies on it. Any work this
> note marks "not opened" has not been seen at all. Paths it mentions (`research/…`, `inventory.txt`) were
> scratch files of that session and no longer exist.


Research date: 2026-10-01. Input: the 44 `A |` lines tagged `culture` or `people` in `inventory.txt`. Several cards share an entity, so there are **40 unique entities** below.

## Methods (short)

- **Datasets were downloaded and queried, not just named**:
  - **Cliopatria** v0.2.0 (Seshat; `cliopatria_polities_only.geojson`, 1,633 entities, CC BY 4.0). I searched every name in it and computed the year rows and bounding boxes for each match (`clio-bbox.txt` in this folder).
  - **Hosner et al. 2016 PANGAEA** Chinese site table (51,074 sites, CC BY 3.0). I counted sites per culture label.
  - **AADR v66** `.anno` (Allen Ancient DNA Resource, CC0). I counted dated individuals and localities per group label.
  - **NERD**, Near East radiocarbon dates (CC BY 4.0). I cloned it and filtered it to the Natufian time window.
  - **Rado.NB**, the merged RADON/RADON-B (CC BY 3.0). I scraped its culture list and date counts.
  - **AWMC** `regional_names_linework.geojson` (ODbL) and **Pleiades** JSON (CC BY 3.0). I read the record for each Italic and steppe name.
- **Open-access papers**: I read figure captions and licences from the Europe PMC full-text XML. Several Science/Nature pages return 403 or redirect to curl, so the DOI is given and the text was read through Europe PMC (PMC id given).
- **How each URL was checked**: "opened" means I fetched it this session. "metadata only" means I resolved only Crossref or index metadata. "not opened" means I am citing it from knowledge and it must be verified before use. I have not invented any URL.
- **Ratings use the brief's scale**: 1 easy, 2 good (open dated site data), 3 moderate (trace by hand from a phased scholarly figure), 4 hard (static or conflicting), 5 very hard or impossible (soft labelled zone).
  - For a few entities the rating says only that the data exists. The extent itself may be contested, and a **confidence** note says so.
- **Cliopatria caveats** (apply to every "1" that relies on it):
  - Its polygons are atlas-style interpretations: maximalist for steppe confederations, and with no stated uncertainty.
  - Rings run 15 to 400 points, so they need simplifying to Folio's budget.
  - CC BY 4.0 requires attribution ("Cliopatria, Seshat Global History Databank").
  - It is a **polity** dataset. It holds no prehistoric archaeological cultures except Sumer, Minoan, Mycenaean and Etruscan.
- **Large files kept in this folder**:
  - `cliopatria_polities_only.geojson` (165 MB)
  - `hosner.tab`
  - `aadr.anno`
  - `nerd/nerd.csv`
  - `awmc-regions.geojson`
  - `clio-names.json`, `clio-bbox.txt`

### Cross-cutting sources (cited by number below)

| # | Source | URL (opened) | Gives | Time-varying | Licence |
|---|---|---|---|---|---|
| C | Cliopatria v0.2.0 (Zenodo 2026-05-16) | https://zenodo.org/records/20274630 ; raw file https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/main/cliopatria.geojson.zip | polity polygons, FromYear–ToYear rows | **yes** | CC BY 4.0 |
| H | Hosner, Wagner, Tarasov, Chen, Leipe 2016, *Archaeological sites in China during the Neolithic and Bronze Age* | https://doi.pangaea.de/10.1594/PANGAEA.860072 | 51,074 site points digitised from the *Atlas of Chinese Cultural Relics*, culture label + age span | per culture phase (coarse); coverage uneven by province | CC BY 3.0 |
| A | AADR v66 (Reich lab, Harvard Dataverse) | https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/FFIDCW | dated individuals with lat/long + group label | yes (dates per individual) | CC0 |
| R | Rado.NB (Kiel; RADON + RADON-B merged) | https://radonb.ufg.uni-kiel.de/ | European 14C dates per site, culture + phase | yes | CC BY 3.0 (site footer) |
| E | EUROEVOL Dataset 1 (Manning et al. 2016, JOAD) | https://openarchaeologydata.metajnl.com/articles/10.5334/joad.40 | 4,757 sites, phases, 14C, C & NW Europe, 8000–4000 BP | yes | CC BY 3.0 (data host http://discovery.ucl.ac.uk/1469811/ returned 403 to curl) |
| P | Pleiades gazetteer | e.g. https://pleiades.stoa.org/places/442765 | Barrington Atlas **label lines** (not areas) + coarse period attestations | coarse periods only | CC BY 3.0 |
| W | AWMC geodata, `Cultural-Data/regional_name_linework` | https://raw.githubusercontent.com/AWMC/geodata/master/Cultural-Data/regional_name_linework/regional_names_linework.geojson | the same Barrington label lines as GeoJSON (Sabini, Samnites, Umbria, Liguria, Venetia, Messapii, Galatia, Scythia, Sarmatae…) | no | ODbL |

Pleiades and AWMC hold **no area polygons** for these regions or peoples. The one Pleiades "polygon" found, Sarmatia 825371, is just the Barrington grid square [39,45,40,46]. They are useful only to anchor a label or the centre of a soft zone.

---

## Prehistoric cultures

### Mal'ta–Buret' culture — wh-096 — **Rating 5**
- **Wikipedia, Mal'ta–Buret' culture** — https://en.wikipedia.org/wiki/Mal%27ta%E2%80%93Buret%27_culture (opened).
  - Known from essentially two sites on the upper Angara, about 90 km northwest of Irkutsk. It has no areal extent.
  - Licence: CC BY-SA text.
- **AADR [A]** gives coordinates for both sites (opened):
  - Russia_Malta_UP at 52.9, 103.5, dated 22621–22171 calBCE
  - Buret' at 52.98, 103.52
- **Approach**: replace the 7-point polygon with a small soft zone, about 50 km, around the two sites. Don't present it as a cultural territory.

### Clovis culture — wh-101 — **Rating 2**
- **PIDBA**, Paleoindian Database of the Americas — https://pidba.utk.edu/ (opened).
  - Gives fluted-point counts by state or county and Paleoindian site-date tables. It is static: Clovis lasts only about 300 years, so there are no phases.
  - Its terms are a citation request and a disclaimer; I found no open licence.
- **Waters, Stafford & Carlson 2020**, *The age of Clovis — 13,050 to 12,750 cal yr B.P.*, Sci. Adv. — DOI 10.1126/sciadv.aaz0455.
  - Read via Europe PMC, PMC7577710.
  - Fig. 1 and Table 1 list 10 credibly dated plus 3 equivocal Clovis sites.
  - Licence: CC BY-NC 4.0.
- **Approach**: hull the county or state point-count density from PIDBA, clipped to the Late Glacial coast. Pin the dated sites from Waters 2020.

### Natufian culture — wh-116 — **Rating 2**
- **NERD**, Palmisano, Bevan, Lawrence & Shennan 2022 (JOAD) — https://openarchaeologydata.metajnl.com/articles/10.5334/joad.90 (opened); data in https://github.com/apalmisano82/NERD (cloned).
  - 11,027 dates with coordinates.
  - The window 12,800–9,900 14C BP gives 586 dates from 106 sites across the whole Near East.
  - There is **no culture field**: you have to filter to the Levant and check attribution by hand.
  - Licence: CC BY 4.0.
- **Richter et al. 2017**, Shubayqa 1 AMS dates, Sci. Rep. — DOI 10.1038/s41598-017-17096-5, PMC5717003 (opened).
  - Gives the Early vs Late Natufian chronology, not a distribution map.
  - Licence: CC BY 4.0.
- **Approach**:
  - Early Natufian = hull of Levantine "core zone" sites (Carmel, Galilee, Jordan Valley).
  - Late Natufian = a wider hull including the Negev, the Euphrates sites and Shubayqa.
  - Two phases are feasible.

### Linear Pottery culture (LBK) — wh-137 — **Rating 2**
- **Rado.NB [R]** (opened culture list).
  - "Linear Pottery culture / Linearbandkeramik" has **599 dates** with phase labels (Flomborn, Alföld-LBK, regional phases).
  - Licence: CC BY 3.0.
- **EUROEVOL [E]** gives sites and phases west of 24° E. Licence: CC BY 3.0.
- **AADR [A]**: 268 LBK individuals from 37 localities.
- **Approach**: hull the dated sites in two bins to show the card's "second wave":
  - Ältestbandkeramik, about 5500–5300 BCE
  - later LBK, about 5300–5000 BCE
- The **Rado.NB export route is untested**: I found no CSV link, and the `c14bazAAR` R package reads RADON.

### Yangshao culture — wh-147, cnh-045 — **Rating 2**
- **Hosner [H]** (opened, counted). Sites labelled Yangshao:
  - 2,773 "Yangshao culture", plus 185 early, 728 middle and 316 late Yangshao
  - Provinces: Shaanxi, Shanxi, Henan and Gansu
  - Hebei, Inner Mongolia, Hubei and Qinghai sites are filed as "undistinguished Neolithic", so the hull will **under-reach** there.
  - Licence: CC BY 3.0.
- **Sun et al. 2025**, *The demic expansion of Yangshao culture…*, BMC Biol. — DOI 10.1186/s12915-025-02286-9 (opened via Europe PMC, PMC12218936).
  - Fig. 1 shades the Yangshao geographic range.
  - Licence: CC BY-NC-ND 4.0, so trace it and don't copy.
- **Approach**: concave hull of the Hosner Yangshao points per phase (early / middle / late), then check the hull against the shaded range in Sun 2025.

### Longshan culture — wh-148, cnh-050 — **Rating 2**
- **Hosner [H]**: 3,730 "Longshan culture" sites (Henan 1,248, Shandong 1,409, Shanxi 1,073).
  - There is no Shaanxi or Hebei Longshan label, so those sites are missing.
  - Licence: CC BY 3.0.
- **Pitt Comparative Archaeology Database**, *Liangcheng Settlement Dataset* (Indrisano), for the Shandong Longshan survey — https://www.cadb.pitt.edu/indrisano/index.html (opened).
  - Licence: CC BY-SA, as shown on the site index.
- **AADR [A]**: Longshan-labelled individuals at 4 localities, including Chengziya and Baligang.
- **Approach**: hull the Hosner points, with Early–Middle and Late split by the culture-phase field where present. Add Shaanxi and Hebei extensions by hand from a published map.

### Hongshan culture — cnh-047 — **Rating 3**
- **Pitt Comparative Archaeology Database**: *Chifeng Settlement Dataset* and *Upper Daling Region Settlement Dataset* — https://www.cadb.pitt.edu/chifeng/index.html (opened).
  - Period-by-period GIS: Xinglongwa, Zhaobaogou, Hongshan, Xiaoheyan…
  - But only for two survey windows of about 1,234 km² and about 200 km².
  - Licence: CC BY-SA, per the site.
- **Hosner [H]** has **no Hongshan label**; Liaoning and Inner Mongolia sites are "undistinguished".
- **Peterson, Lu, Drennan & Zhu 2010**, *Hongshan chiefly communities in Neolithic northeastern China*, PNAS 107 — DOI 10.1073/pnas.1000949107.
  - Metadata only: free to read on PMC2851873 but not under an open licence; full text not opened.
- **Approach**: trace the culture area (western Liaoning, southeast Inner Mongolia, northern Hebei) from a cited regional map. The surveys can only confirm density.

### Liangzhu culture — cnh-048 — **Rating 3**
- **Hosner [H]**: 180 "Liangzhu culture" sites, **Zhejiang only**. The Jiangsu and Shanghai core is missing from the labels.
- **Renfrew & Liu 2018**, *The emergence of complex society in China: the case of Liangzhu*, Antiquity 92 — DOI 10.15184/aqy.2018.60.
  - Metadata only: Cambridge terms, not open access.
- **Approach**: the Taihu basin core is a well-agreed area. Trace it from a cited Liangzhu distribution figure and use the Zhejiang points to check it. A single phase is enough.

### Erlitou culture — wh-243, cnh-062 — **Rating 3**
- **Liu, Chen & Li 2007**, *Non-state crafts in the early Chinese state: an archaeological view from the Erlitou hinterland*, Bulletin of the Indo-Pacific Prehistory Association 27 — https://journals.lib.washington.edu/index.php/BIPPA/article/view/11980/10605 (opened, PDF).
  - Fig. 3 shows Erlitou sites in the Yiluo region; Fig. 4 shows Erlitou sites around the Yiluo region.
  - Licence not stated in the PDF.
- **Hosner [H]**: 383 "Xia dynasty period" sites, almost all in **Shanxi** (Dongxiafeng-type). Henan's Erlitou sites are not separately labelled.
- **Approach**: core = Yiluo basin, traced from Fig. 3; periphery = western Henan and southern Shanxi from Fig. 4 and Hosner. The four Erlitou phases are not mappable from open data.

### Naqada culture — wh-203 — **Rating 3**
- **Wikipedia, Naqada I** — https://en.wikipedia.org/wiki/Naqada_I (opened).
  - Naqada I sites run "from Matmar in the north, to Kubaniya and Khor Bahan in the south", citing Shaw (ed.) 2003, *Oxford History of Ancient Egypt*, pp. 44–45.
- **Seshat polity page, Naqada II** — https://seshat-db.com/core/polity/512 (opened).
  - Gives only a territory range of 5,000–20,000 km², with no polygon.
- **Cliopatria [C]** has no Naqada entry. "Early Dynastic Period of Egypt" begins at −3000, which covers late Naqada III.
- **Approach**: phase shapes along the Nile valley:
  - Naqada I: Matmar → Kubaniya
  - Naqada II: spreading north to the Delta in Naqada IIC–D
  - Naqada III: the whole valley + Delta; Cliopatria's Early Dynastic polygon can be used for the end state
  - Valley-following shapes are easy to draw once the limits are agreed.

### Sumer — wh-172 — **Rating 1**
- **Cliopatria [C]** "Sumerian City-States", 9 rows from −3400 to −1761.
  - The polygon shrinks at the Akkadian conquest (−2300) and reappears through Ur III and Isin-Larsa.
  - bbox about 44–48.9° E, 30.3–34.8° N.
  - Licence: CC BY 4.0.
- **Approach**: use the row nearest the card's dates, e.g. −3000..−2701 for "city-states from c. 3000 BCE". Add the −2100..−2001 row for Ur III if Folio ever supports phases.
- **Caveat**: the ancient Gulf shoreline lay further north; Cliopatria does not model it.

### Cyclades / Early Cycladic — gr-002 — **Rating 1**
- **The extent is the island group**, so any open coastline works. Folio already has its own coast data. Natural Earth is public domain (not re-checked this session).
- **AADR [A]**: an Early Cycladic individual at Epano Koufonisi, 2600–2000 BCE, confirms the core.
- **Approach**: a multipolygon of the Cycladic island coastlines instead of a hand-drawn blob. Keros-Syros traits also reach Attica, Euboea and north Crete; note that in text and don't stretch the shape.

### Crete / Minoan civilisation — gr-006, gr-047 (Crete "people"), wh-262 (Minoan) — **Rating 1**
- **The extent is the island of Crete**.
- **Cliopatria [C]** "Minoan civilization": two rows, −1600..−1401, covering Crete only (bbox 23.6–26.2° E).
- **Approach**: use Crete's coastline for all three cards. For wh-262 optionally add Thera, Kythera and Rhodes as Neopalatial "Minoanised" satellites, labelled softly.
- **Confidence**: very high for the core.

### Mycenaean civilisation — gr-056 — **Rating 1**
- **Cliopatria [C]** "Mycenaean Greece": **7 rows, −1500..−1101**.
  - Growth from mainland Greece to the Aegean islands and Crete by −1400.
  - Maximum −1240..−1151; shrink at −1150.
  - Licence: CC BY 4.0.
- **Mycenaean Atlas Project** — https://helladic.info/ (opened).
  - 5,193 Bronze Age sites with coordinates and EH/MH/LH occupation.
  - A MySQL dump is available on request; no open licence is stated.
- **Approach**: use the Cliopatria rows, e.g. shaft graves → −1500 row, palaces → −1300 row, collapse → −1150 row. The site atlas is there for checking.

### Terramare culture — rm-007 — **Rating 3**
- **Brandolini 2020**, *Late-Holocene Human Resilience in a Fluvial Environment: A Geoarchaeological Dataset for the Central Po Plain*, JOAD — https://openarchaeologydata.metajnl.com/articles/10.5334/joad.62 (opened); data DOI 10.7910/DVN/JSYZ3H.
  - 761 sites by period, including Bronze Age, as shapefiles.
  - Only the Enza–Secchia slice of Emilia.
  - Licence: CC0.
- **Rado.NB [R]** lists "Terramare culture", but with **0 dates**.
- **Approach**: trace the central Po plain extent (Emilia + the Lombard and Veronese plain north of the Po) from a cited map. Middle Bronze Age vs Recent Bronze Age phases appear in the literature only as text; the collapse c. 1150 BCE is a single cut-off.

### Villanovan culture — rm-008 — **Rating 3**
- **Esposito et al. 2023**, *Intense community dynamics in the pre-Roman frontier site of Fermo*, Sci. Rep. — DOI 10.1038/s41598-023-29466-3 (opened via Europe PMC, PMC9984403).
  - Fig. 1: "Italy during the Early Iron Age (tenth–eighth century BCE)", with **green Villanovan areas** and Villanovan sites inside and outside Etruria (Bologna, Verucchio, Fermo, Pontecagnano, Capua).
  - Licence: CC BY 4.0.
- **Approach**: trace Fig. 1 as a multipolygon (Etruria + Bologna area + outliers). It is a single-phase map, but it is cited and open.

### Etruscan civilisation — rm-022 — **Rating 1**
- **Cliopatria [C]** "Etruscans": **13 rows, −750..−265**.
  - Expansion into the Po valley and Campania (bbox to 45.8° N from −550).
  - Retreat after −383.
  - Licence: CC BY 4.0.
- **AADR [A]**: 78 individuals at 14 localities (Tarquinia, Veii, Vetulonia, Volterra…), with dates.
- **Approach**: take Cliopatria rows matching the card's three rings: Etruria, Po-valley Etruria and Campania at the −530..−481 maximum. "Nucleation c. 1000 BCE" predates Cliopatria, so use the Villanovan figure above for it.

### Linear-band and later Bronze Age Europe

#### Yamnaya culture — wh-258 — **Rating 2**
- **AADR [A]**: 318 Yamnaya-labelled individuals at **105 localities** from the Danube to the Urals, each dated. This is the best open, dated point set, but it is a genetics sample, so the hull is biased.
- **Trautmann et al. 2023**, *First bioanthropological evidence for Yamnaya horsemanship*, Sci. Adv. — DOI 10.1126/sciadv.ade2451 (read via Europe PMC, PMC10954216).
  - Fig. 1 is a "Map of the Yamnaya and Afanasievo overall distribution".
  - Licence: CC BY 4.0.
- **Rado.NB [R]**: only about 31 Yamnaya-labelled dates, in the European part.
- **Approach**: take the overall extent from Trautmann Fig. 1, as the card's "maximal extent". Make an early core (about 3300–3000 BCE, Volga–Don) vs a westward Danube/Tisza phase (about 3000–2600 BCE) from the dated AADR localities.

#### Bell Beaker culture — wh-273 — **Rating 2**
- **Bourgeois et al. 2025**, *Spatiotemporal reconstruction of Corded Ware and Bell Beaker burial rituals…*, Sci. Adv. — DOI 10.1126/sciadv.adx2262 (read via Europe PMC, PMC13155569).
  - Data S2: radiocarbon-dated BB burials with find locations.
  - Fig. 3B: an IDW surface of earliest BB dates, effectively an arrival-time map.
  - Licence: CC BY 4.0.
- **Rado.NB [R]**: "Bell Beaker", **613 dates** with type and phase labels. Licence: CC BY 3.0.
- **AADR [A]**: 285 individuals at 79 localities.
- **Approach**: phase hulls by contouring Bourgeois' arrival surface at about 2750, 2500 and 2300 BCE. This is the most promising time-varying case among the cultures.
- Note that Bell Beaker is a patchy network; a single filled polygon overstates it.

#### Únětice culture — wh-274 — **Rating 2**
- **Rado.NB [R]**: "Únětice", **205 dates** with Zich phases 1–4 + Proto-Únětice. Licence: CC BY 3.0.
- **AADR [A]**: 181 individuals at 26 localities.
- **Approach**: hull per Zich phase grouping (early vs classical), clipped to Bohemia, Moravia, central Germany, Silesia and Lower Austria.
- Leubingen (1942 BCE) is a fixed point.

## Italic peoples (Rome collection)

None of these is in Cliopatria; I searched for Sabine, Samnite, Umbrian, Ligurian, Venetic and Messapian names. Pleiades and AWMC hold only Barrington label lines.

The time dimension available for all of them is the **outside** one: Cliopatria's "Roman Republic" (50 rows) shows when each area is absorbed. That gives an end-date clip but not the people's own extent.

### Sabines (Sabine country) — rm-012 — **Rating 3**
- **Pleiades "Sabini"** 383763 (opened) and **AWMC label** "Sabina" / "Sabini" [W].
  - Barrington label positions; periods hellenistic-republican to roman.
  - Licences: CC BY 3.0 / ODbL.
- **Approach**: a small, well-agreed static area between the Tiber, Anio, Nar and the Apennine crest, drawn from the Barrington label and the river courses. Clip at 290 BCE using Cliopatria's Roman Republic.

### Samnium — rm-013 — **Rating 3**
- **Pleiades "Samnites"** 442765 (archaic to roman) and "Samnium" 433078 (opened); **AWMC "Samnium" / "Samnites"** [W].
- **Cliopatria [C] Roman Republic** rows: the colonies and conquests that encircle Samnium 343–290 BCE give a phase sequence from outside.
- **Not opened**: E. T. Salmon 1967, *Samnium and the Samnites* (CUP), the standard phase maps.
- **Approach**: draw the Pentri / Caudini / Hirpini / Caraceni block from the Barrington positions. Optionally add phases by subtracting Cliopatria's Roman area at 343, 304 and 290.

### Umbria — rm-015 — **Rating 4**
- **Pleiades "Umbria (region)"** 413360 (opened): periods archaic to late antique, **no location**. **AWMC "Umbria" label** [W].
- **Conflicting extents**: ancient writers give an early, larger Umbria reaching the Adriatic, then a loss of the coast to the Senones around 390 BCE. The Augustan Regio VI differs again. I found no open phased map.
- **Approach**: keep a modest static shape (upper Tiber east bank to the Apennines), labelled softly. Note the earlier, larger range in text only.

### Liguria — rm-018 — **Rating 4**
- **Pleiades "Liguria (region)"** 383698 (opened): periods archaic to late antique, no location. **AWMC "Liguria" label** [W].
- **Conflicting extents**: from the Bronze Age "formation" onward, sources disagree widely. Pre-Roman Ligures are placed from the Rhône to the Arno. The Augustan Regio IX is much smaller.
- **Approach**: use a soft zone along the Ligurian Apennines and the coast, and state the uncertainty. The 180–179 BCE deportation (Apuani to Samnium) can be a note.

### Venetia — rm-019 — **Rating 3**
- **Pleiades "Venetia"** 393511 (opened, label only); **AWMC "Venetia" label** [W].
- **Vicari & Perono Cacciafoco 2024**, *Cultural Contacts among Pre-Roman Peoples in Iron Age Italy: The Case of Venetic Inscriptions*, Histories 4(2) — DOI 10.3390/histories4020011.
  - Metadata only: the mdpi.com page returned 403.
  - Licence: CC BY 4.0, per Crossref.
- Venetic inscriptions (about 300, 5th–1st century BCE) come from Este, Padua, Vicenza, Làgole and Adria. That defines the area well, but there is no open findspot dataset.
- **Approach**: trace the area from the Po to the Alps and the Isonzo, using the main inscription findspots as anchors. A single phase is enough.

### Messapia — rm-020 — **Rating 3**
- **Pleiades "Messapii"** 442657 and AWMC "Messapii" / "Iapyges" / "Calabria" labels [W].
- The **extent is the Salento peninsula**, bounded by the sea, with an agreed northern edge roughly on the Taranto–Brindisi line.
- **Not opened**: de Simone & Marchesini 2002, *Monumenta Linguae Messapicae*, the inscription corpus. I know of no open findspot dataset.
- **Approach**: use the coastline + one land boundary. That is easy to draw and defensible. A single phase is enough.

## Steppe and migration-period peoples (Russia collection)

### Cimmerians — ru-004 — **Rating 5**
- **Pleiades "Kimmerioi"** 135663336 (opened).
  - The description covers Urartu c. 714 BCE, Phrygia 696–695 and Sardis 652.
  - **No location.**
- The **north-Pontic homeland is known only from Greek texts**. Assigning the Chernogorovka–Novocherkassk "pre-Scythian" horizon to the Cimmerians is disputed.
- **AADR [A]** has a "Moldova_Cimmerian" label at 2 sites (Hlinaia-Sad, Mokra; 10th–9th century BCE). That is a genetic paper's label, not a territory.
- **Approach**: a soft labelled zone over the north-Pontic steppe. If the card stresses Anatolia, add a second soft zone there.

### Scythians — ru-005 — **Rating 1**
- **Cliopatria [C]** "Scythia": **6 rows, −650..−224**.
  - −650..−551 is a huge extent (24–60° E); later rows are 26–46° E and contract to the Crimea / lower Dnieper by −350..−224.
  - Licence: CC BY 4.0.
- **AADR [A]**: 98 Scythian-labelled individuals, 32 localities.
- **Approach**: use the −550..−451 row for "dominant c. 700–300 BCE", or several rows if phases are supported. The 7th-century row is maximalist, because it includes the Near-Eastern raids.

### Sarmatia — ru-008 — **Rating 3**
- **Cliopatria has no Sarmatians.** It has a **gap** on the Pontic steppe between "Scythia" ending at −224 and "Goths" / "Gothia" from 30 / 207 CE.
- **Pleiades "Sarmatae"** 226752 (label line) and "Sarmatia" 825371 (just a 1° grid-square polygon) (both opened).
- **AADR [A]**: 65 Sarmatian individuals at 29 dated localities from the Urals to the Carpathian Basin.
- **Not opened**: Moshkova (ed.) 1989, *Stepi evropeiskoi chasti SSSR v skifo-sarmatskoe vremya* (Arkheologiya SSSR), with Sauromatian / Early / Middle / Late Sarmatian distribution maps.
- **Approach**: phase shapes by hand:
  - Early (4th–2nd century BCE): Volga–Ural
  - Middle (1st century BCE – 2nd century CE): Don–Dnieper
  - Late (2nd–4th century CE): into the Danube plain and Pannonia
  - Check the shapes against the AADR dated points.

### Gothia — ru-011 — **Rating 1**
- **Cliopatria [C]** "Gothia": **11 rows, 207..382**, growing to the Dniester–Don by 270–372 and collapsing in 373–382. "Goths": 4 rows, 30..206, on the Vistula and Baltic.
- **AADR [A]**: Wielbark culture, 96 individuals, 5 localities. Chernyakhov: 1.
- **Approach**: use the 270..372 row; the card's two rings could map to the Greuthungi and Tervingi parts of it. For Gothia use only the steppe-era rows, not the earlier "Goths" rows.

### Huns — ru-012 — **Rating 1**
- **Cliopatria [C]**:
  - "Huns": 11 rows, 106..425 (106–370 between the Volga and Ural, 46.6–54.6° E; then westward year by year).
  - "Hunnic Empire": 10 rows, 426..673 (peak 451; tiny remnant rows after 469).
- **Approach**: use the 371–469 rows, which match the card. The **confidence is moderate**: the rows are maximalist hegemony shapes, not settlement areas.

### Avars — ru-013 — **Rating 1**
- **Cliopatria [C]** "Avar Khaganate": **22 rows, 561..805**, shrinking from the steppe-wide extent to the Carpathian Basin (from 656) and to the 793–805 remnant.
- **Approach**: for "In Pannonia 567–796" use the 682..740 row, or the 656+ rows. This one is high-confidence for the Carpathian Basin core.

### Old Great Bulgaria — ru-014 — **Rating 1** (partial)
- **Cliopatria [C]** "Old Great Bulgaria": **3 rows, 633..681** (Kuban to the Dnieper; 674–681 shifts west towards the Danube). "Volga Bulgaria" runs 674..1235, and "First Bulgarian Empire" from 682.
- **Gap**: the card's c. 450–630 steppe phase (Onogurs, Kutrigurs, Utigurs) is not in Cliopatria. It would need a soft zone.
- **Approach**: the 633..655 row for the core; Volga and Danube rows can show the "three branches".

### Khazaria — ru-016 — **Rating 1**
- **Cliopatria [C]** "Khazaria": **25 rows, 630..979**, peaking about 674–969 (31.8–54.6° E) and shrinking in 970–979.
- **Approach**: use the 750..762-type row for the khaganate's height. The archaeological correlate is the Saltovo–Mayaki culture, which is narrower, and AADR has only 2 Saltovo sites.

### Etelköz — ru-019 — **Rating 1** (data) / **contested** (confidence)
- **Cliopatria [C]** "Magyars": **10 rows, 840..910**. 840–895 spans 22.6–37.9° E; it moves into the Carpathian Basin from 896.
- **Wikipedia, Etelköz** — https://en.wikipedia.org/wiki/Etelk%C3%B6z (opened).
  - The rivers in *De Administrando Imperio* are only partly identified (Spinei disputes Barouch = Dnieper).
  - Kristó places it on the Don.
  - The Subotcy horizon on the Dniester gives late-9th-century archaeology.
- **Approach**: use the Cliopatria 860..895 row, but expect expert disagreement. Consider a softer edge.

### Patzinakia (Pechenegs) — ru-020 — **Rating 4**
- **Not in Cliopatria.** It has only "Oghuz Turks" (750–1055, further east).
- **Wikipedia, Pechenegs** — https://en.wikipedia.org/wiki/Pechenegs (opened).
  - *De Administrando Imperio* (c. 950) gives eight provinces on both sides of the Dnieper, reaching west to the Siret / eastern Carpathians.
  - Earlier (9th century) between the Volga and the Ural, per Pritsak 1975.
- **Approach**: a text-based static shape for c. 950 (Don → Siret), with a soft edge. A second soft zone could show the pre-890 Volga–Ural homeland. There is very little archaeology.

### Upper Oka (Vyatichi) — ru-024 — **Rating 3**
- **Wikipedia, Vyatichi** — https://en.wikipedia.org/wiki/Vyatichi (opened): the Oka, Moskva and upper Don basins. The cited sources are weak.
- **Not opened**: Sedov 1982, *Vostochnye slavyane v VI–XIII vv.* (Arkheologiya SSSR series). Its distribution maps of Vyatichi kurgans with seven-lobed temple rings are the standard, datable 11th–12th century basis.
- **Approach**: trace the temple-ring and kurgan distribution (upper Oka, Moskva, Ugra, Zhizdra, Pronya). Optionally add a 12th-century northeastward extension into the Moskva basin.

### Desht-i Qipchaq (Cumans / Kipchaks) — ru-074 — **Rating 3**
- **Cliopatria [C]** "Kimek-Kipchak confederation": 20 rows, 750..1235. From 1056 it reaches west to **37.8° E** (2.2–3.0 M km²).
- **Cliopatria's west edge is too short**: it misses the Dnieper–Danube Cumania of the 1060s–1230s. Its separate "Cuman-Kipchak Confederation" row (1056–1065) is a **315 km² sliver**, which looks like a data fault.
- **AADR [A]**: "Kazakhstan_KipchakPeriod" at 2 localities (1000–1200 CE).
- **Approach**: take Cliopatria's Kipchak polygon and extend it west to the Dnieper and lower Danube by hand from a cited map. Pletnyova's distribution of Polovtsian stone statues is the usual reference; not opened.

### Galatia — gr-788 — **Rating 1**
- **Cliopatria [C]** "Galatia": **7 rows, −279..−26**. The core is about 31–35° E around Ancyra and Pessinus; it widens from −77.
- **AWMC / Pleiades "Galatia"** 619161 label [W][P].
- **Approach**: the −279..−128 rows for the Celtic settlement; the −27 row for the province. This one is high-confidence.

### Mumun culture — jp-033 — **Rating 3**
- **Kim & Park 2020**, *Millet vs rice: an evaluation of the farming/language dispersal hypothesis in the Korean context*, Evol. Hum. Sci. — DOI 10.1017/ehs.2020.13 (opened via Europe PMC, PMC10427441).
  - Fig. 2 shows "The distribution of the Songgukri Culture and non-Songgukri cultures", i.e. Middle Mumun.
  - Licence: CC BY 4.0.
- **Kim, Conte & Oh 2025**, *Community Formation in the Chulmun (Neolithic) and Mumun (Bronze Age) Periods of Korea*, J. Archaeol. Res. — DOI 10.1007/s10814-024-09204-7.
  - Metadata only; the Springer page redirected.
  - Licence: CC BY 4.0, per Crossref.
  - It analyses Korea's radiocarbon set of more than 17,000 dates, but I found **no open download**.
- **Approach**: the southern Korean peninsula, with Songguk-ri traced from Kim & Park Fig. 2. For the card's "crossing" theme, add a soft zone on northern Kyushu (Yayoi from c. 800 BCE).

---

## Summary table

| Rating | Count | Entities |
|---|---|---|
| 1 easy | 13 | Sumer, Cyclades, Crete/Minoan (3 cards), Mycenaean, Etruscan, Scythians, Galatia, Gothia, Huns, Avars, Old Great Bulgaria (partial), Khazaria, Etelköz (contested) |
| 2 good | 8 | Clovis, Natufian, LBK, Yangshao, Longshan, Yamnaya, Bell Beaker, Únětice |
| 3 moderate | 14 | Hongshan, Liangzhu, Erlitou, Naqada, Terramare, Villanovan, Sabines, Samnium, Venetia, Messapia, Sarmatia, Mumun, Vyatichi (Upper Oka), Cumans (Desht-i Qipchaq) |
| 4 hard | 3 | Umbria, Liguria, Pechenegs |
| 5 very hard | 2 | Mal'ta–Buret', Cimmerians |

These 40 entities cover all 44 card lines. The duplicates are Yangshao, Longshan and Erlitou (two cards each) and Crete/Minoan (three cards).

**Things worth flagging to the main thread:**
1. **Cliopatria already gives dated polygons for 12 of the 13 "1" entities**; the exception is Cyclades, which just needs coastlines (Minoan Crete has a Cliopatria row too, but its coastline is the better shape). Simplifying the Cliopatria rows is the cheapest big win.
2. **Bell Beaker has a published open arrival-time surface** (Bourgeois et al. 2025, CC BY 4.0). It is the best candidate for a genuinely time-varying culture shape.
3. **Cliopatria has faults to avoid copying**:
   - The "Cuman-Kipchak Confederation" sliver.
   - No Sarmatians, which leaves a Pontic-steppe gap from −224 to 206 CE.
   - No Pechenegs.
