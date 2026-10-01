# The Atlas borders audit — every state, people and war, and how far each can be improved

**READ BEFORE CHANGING HOW A STATE, A PEOPLE OR A WAR IS DRAWN ON THE ATLAS, OR BEFORE STARTING ANY
BATCH BELOW.** Requested Oct 2026: "I want to do a full audit of all states and wars that appear on the
Atlas. Currently their borders are rough and borders do not change as the user slides the timeline
slider … The goal now is more accurate borders which reflect real year by year changes. First determine
every relevant location … Then start planning batches of work. I want first a full sweep to find sources
that might improve each location, and then in a doc file categorise them in ones that can be easily
improved, down to ones that may be very difficult or impossible to improve. Then we will start improving
them one by one."

This file is that sweep and that plan. **Nothing in it has been built yet.** Its order is: what is drawn
today and why it does not move (§1), the full inventory (§2), the sources and their licences (§3), every
entity in five tiers from easy to impossible (§4), the one piece of plumbing every tier needs first (§5),
and the batches (§6). A ledger at the foot (§7) records what each batch did.

📖 The evidence for every rating is in three research notes — `docs/atlas-borders-cliopatria.md`,
`docs/atlas-borders-states-wars.md`, `docs/atlas-borders-cultures.md` — READ THE ONE A BATCH NEEDS, BY
GREPPING FOR THE ENTITY, BEFORE STARTING IT. The research behind it was done on 2026-10-01 by matching every entity against two datasets downloaded
whole (Cliopatria and every historical-basemaps snapshot) and by a source-by-source survey of everything
else. Every URL in §3 was opened that day. A rating here is a judgement about SOURCES, not about history:
a tier-1 entity has an open, dated, machine-readable border series; it does not mean that border is
uncontested.

---

## 1. What is drawn today, and why it does not move

The personal atlas (both tabs — see `docs/atlas.md`) draws four kinds of political shape:

| kind | where its shape comes from | does it change with the year? |
|---|---|---|
| **A. a modern or early-modern country** (unlocked by a geography card's `map.key`) | the era map for the year — `window.TIMELINE`, 13 snapshots (1500, 1600, 1700, 1800, 1900, 1920, 1938, 1960, 1994, 2000, 2010 from historical-basemaps; 2015 and 2020 present-day `world.js`) | **in steps**: a snapshot holds until the next one, so 1500→1599 is one map |
| **B. a historical state** (a locator `area` on a card tagged `state`, `dynasty` or `empire`) | one hand-authored polygon on the card, typically 6–40 points | **no** — one shape from the first year of the card's date line to the last |
| **C. a people or a culture** (a locator `area` on a card tagged `culture`, `people` or `civilisation`) | the same | **no** |
| **D. the two sides of a war** (`card.war`) | either `keys` resolved against the era map (WW2-era cards), or one authored polygon per side | authored sides **no**; keyed sides in the era map's steps |

So the two complaints have one cause each. *Rough*: an authored area is a dozen points where a coast is a
thousand (it is clipped to the land, which hides the worst of it at sea and none of it inland). *Does not
change*: an authored area has no time dimension at all, and the era maps have thirteen.

**The same polity is drawn many different ways.** Rome is a side in 26 war cards and has seven different
hand-drawn shapes among them; Carthage has five; the Achaemenid Empire is a state on two cards and a side
on three, in four shapes. The fix is not 26 better polygons but ONE dated series that every card naming
Rome resolves against — which is what §5 proposes.

---

## 2. The inventory (measured 2026-10-01)

Generated from the cards through `.claude/card-io.js`, not written by hand: every locator with an `area`
whose card's first tag is a polity kind (`MINE_POLITY` in app.js), and every card with a `war` block.

- **A. Era maps**: 13 snapshots, resolving the names of 235 `world.js` countries carried by geography
  cards (plus 50 US states, 31 Chinese provinces and 83 Russian subjects, which are drawn only on the
  present-day map and are out of scope here).
- **B. Historical states**: 19 entities on 21 cards.
- **C. Peoples and cultures**: 41 entities on 45 cards.
- **D. Wars**: 55 cards, 55 distinct side names (rolled up below).

### B. Historical states drawn from an authored area (19 entities, 21 cards)

| # | state | cards | tag | polygon points | the card's dates |
|---|---|---|---|---|---|
| B1 | Lacedaemon | gr-233 | state | 14 | The state c. 700 – 195 BCE |
| B2 | Shang dynasty | wh-245 | dynasty | 31 | Ruled c. 1600 – 1046 BCE Late Shang c. 1300 – 1046 BCE |
| B3 | Achaemenid Empire | gr-381, wh-301 | state | 48+19 / 48+19 | Empire c. 550 – 330 BCE from Ionia to Gandara Lands claim… |
| B4 | Carthaginian empire | rm-182 | state | 8+4+4 | Invaded 310 BCE by Agathocles of Syracuse Libyan revolt 2… |
| B5 | Bosporan Kingdom | ru-010 | state | 11+23 | Kingdom c. 480 BCE – c. 342 CE Archaeanactids c. 480 – 43… |
| B6 | Empire of Japan | ww2-081 | state | 39+14+6+27+8 | Constitution 11 February 1889 Diet opened 1890 Dissolved … |
| B7 | Gojoseon | ko-046 | state | 11 | Attested c. 300 – 108 BCE Yan campaign c. 300 BCE Wiman C… |
| B8 | Zhou dynasty | cnh-111 | dynasty | 23 | Span c. 1046 – 256 BCE Western Zhou c. 1046 – 771 BCE Eas… |
| B9 | Nanyue | cnh-232 | state | 13 | Han vassal 196 BCE on the mission of Lu Jia Annexed 111 BCE |
| B10 | Egypt | gr-767 | state | 13 | Ruled 305 – 30 BCE from Alexandria, on the Mediterranean … |
| B11 | Macedonia | gr-770 | state | 10 | Ruled 294 – 168 BCE Secured 277 BCE, by Antigonus Gonatas… |
| B12 | Bactria | gr-783 | state | 6 | Independent c. 250 BCE, under Diodotus I Treaty with Syri… |
| B13 | Gandhara | gr-784 | state | 10 | Founded c. 190 – 180 BCE Height under Menander I, c. 155 … |
| B14 | Mongol Empire | wh-594, ru-091 | state | 101 / 102 | Founded 1206 CE Widest extent c. 1279 CE Divided after 12… |
| B15 | Aztec Empire | wh-605 | state | 12 | Alliance c. 1430 CE Guiengola siege 1497 CE Empire ends 1… |
| B16 | Inca Empire | wh-612 | state | 27 | Expansion 1438 – 1533 CE Spanish conquest 1533 CE |
| B17 | Northern and central Italy | wh-622 | state | 14 | Communes c. 1100 – c. 1200 Five powers 1454 – 1494 |
| B18 | Volga Bulgaria | ru-015 | state | 7 | On the Volga c. 900 – 1236 CE King a Muslim c. 922 CE Tak… |
| B19 | Kievan Rus' | ru-036 | state | 34+6 | Founded c. 880 CE Rurikid polity 911 – 987 CE Kyiv chroni… |

### C. Peoples and cultures drawn from an authored area (41 entities, 45 cards)

| # | people / culture | cards | tag | polygon points | the card's dates |
|---|---|---|---|---|---|
| C1 | Mal'ta-Buret' culture | wh-096 | culture | 7 | Mal'ta burial c. 24,000 BP Excavated from 1928, by Mikhai… |
| C2 | Clovis culture | wh-101 | culture | 12 | In use 13,050 – 12,750 BP Type site found 1930s |
| C3 | Cyclades | gr-002 | culture | 8 | Early Cycladic c. 3100 – 2000 BCE Keros-Syros c. 2650 – 2… |
| C4 | Crete | gr-006, gr-047 | culture | 16 / 16 | Prepalatial c. 3100 – 1900 BCE Protopalatial c. 1900 – 17… |
| C5 | Mycenaean civilisation | gr-056 | culture | 17 | Shaft graves c. 1650 – 1500 BCE Palaces c. 1400 – 1200 BC… |
| C6 | Natufian culture | wh-116 | culture | 11 | Culture c. 14,500 – 11,600 BP Ain Mallaha c. 15,000 – 12,… |
| C7 | Terramare culture | rm-007 | culture | 9 | Era c. 1650 – 1150 BCE Collapse c. 1150 BCE |
| C8 | Villanovan culture | rm-008 | culture | 15 | Era c. 900 – 700 BCE |
| C9 | Sabine country | rm-012 | people | 9 | Attested c. 900 – 290 BCE |
| C10 | Samnium | rm-013 | people | 8 | Hillforts 6th – 3rd century BCE Samnite Wars c. 343 – 290… |
| C11 | Umbria | rm-015 | people | 9 | Identity formed c. 900 – 700 BCE Under Rome by c. 260 BCE |
| C12 | Liguria | rm-018 | people | 10 | Formed c. 1600 – 900 BCE Deported 180 – 179 BCE |
| C13 | Venetia | rm-019 | people | 9 | Inscribed c. 550 BCE – 50 CE Annexed 1st century BCE |
| C14 | Messapia | rm-020 | people | 8 | Inscribed c. 550 – 100 BCE Writing ends Hannibalic war, c… |
| C15 | Etruscan civilisation | rm-022 | culture | 13+9+9 | Nucleation c. 1000 BCE Inscribed c. 800 – 1 BCE |
| C16 | Linear Pottery culture | wh-137 | culture | 15 | Span c. 5500–5000 BCE Second wave several centuries after… |
| C17 | Yangshao culture | wh-147, cnh-045 | culture | 9 / 9 | Flourished c. 5000 – 3000 BCE Late Yangshao 3500 – 3000 BCE |
| C18 | Longshan culture | wh-148, cnh-050 | culture | 12 / 12 | Flourished c. 3000 – 2000 BCE Cattle arrive c. 2250 – 195… |
| C19 | Sumer | wh-172 | culture | 13 | City-states from c. 3000 BCE Third Dynasty of Ur 2112 – 2… |
| C20 | Naqada culture | wh-203 | culture | 10 | Naqada I c. 4000 – 3500 BCE Naqada II c. 3500 – 3200 BCE … |
| C21 | Erlitou culture | wh-243, cnh-062 | culture | 8 / 8 | Era c. 1900 – 1500 BCE Yiluo river basin, Henan |
| C22 | Hongshan culture | cnh-047 | culture | 9 | Flourished c. 4500 – 3000 BCE Ritual peak c. 3850 – 3350 BCE |
| C23 | Liangzhu culture | cnh-048 | culture | 10 | Flourished c. 3300 – 2300 BCE Dams built c. 3250 – 2850 B… |
| C24 | Yamnaya culture | wh-258 | culture | 14 | Complex c. 3300 – 2600 BCE Ancestors formed c. 4000 BCE M… |
| C25 | Minoan civilisation | wh-262 | culture | 10 | Era c. 3100 – 1050 BCE New palaces c. 1750 – 1470 BCE Kno… |
| C26 | Bell Beaker culture | wh-273 | culture | 24 | Spread from c. 2750 BCE Disappeared 2200 – 1800 BCE |
| C27 | Únětice culture | wh-274 | culture | 11 | Flourished c. 2200 – 1550 BCE Leubingen tomb 1942 BCE, gi… |
| C28 | Cimmerians | ru-004 | people | 9 | In the record c. 1000 – 600 BCE Succeeded by the Scythian… |
| C29 | Scythians | ru-005 | people | 17 | Dominant c. 700 – 300 BCE Displaced by the Sarmatians, fr… |
| C30 | Sarmatia | ru-008 | people | 13 | Dominant c. 300 BCE – 400 CE Ended with the Goths and the… |
| C31 | Mumun culture | jp-033 | culture | 13 | Crossing from c. 900 BCE Yayoi span c. 800 BCE – 200 CE |
| C32 | Galatia | gr-788 | people | 6 | Crossed to Asia 278 BCE Beaten by Pergamon c. 237 BCE Rom… |
| C33 | Gothia | ru-011 | people | 8+6 | On the steppe c. 230 – 376 CE Broken by the Huns, c. 375 CE |
| C34 | Huns | ru-012 | people | 11 | On the steppe c. 370 – 469 CE Alans overrun c. 370 CE, on… |
| C35 | Avars | ru-013 | people | 8 | In Pannonia 567 – 796 CE Ring destroyed 796 CE, by Pippin |
| C36 | Old Great Bulgaria | ru-014 | people | 8 | On the steppe c. 450 – 800 CE Three branches Danube, Volg… |
| C37 | Khazaria | ru-016 | people | 12 | Khaganate c. 650 – 965 CE Broken by Rus' 965 CE, under Sv… |
| C38 | Etelköz | ru-019 | people | 8 | In Atelkuzu c. 860 – 895 CE Árpád elected c. 860 CE, on a… |
| C39 | Patzinakia | ru-020 | people | 11 | On the Don from c. 830 CE First in Rus' 915 CE, per the c… |
| C40 | Upper Oka | ru-024 | people | 11 | Khazar tribute recorded 859 CE Subdued 966, 981 and 982 C… |
| C41 | Desht-i Qipchaq | ru-074 | people | 13 | First contact 1055 CE First attack 2 February 1061 CE Rus… |

### D. Wars (55 cards)

All 55 are listed with their sides in §4.D. Rolled up by side name: **Rome ×26 (seven different
shapes)**; Carthage ×5 (five shapes); Sparta ×4; Messenia ×4; Macedon ×4 (two shapes); Athens and its
empire ×4; Samnium ×4; Sparta and its allies ×3; Achaemenid Empire ×2; Greek allies ×2; Gallic tribes ×2;
Celtiberians ×2; Japan ×2; Qin ×2; United States ×2; Pontus ×2; England ×2; and one each for Persia,
Lydia, Macedon and the Greek leagues, Arabia, Byzantium and Sasanian Persia, Etruria, Umbria and Picenum,
Cisalpine Gauls, the Ardiaean kingdom, the Seleucid empire, the Achaean League, the Celtiberians and
Lusitanians, Lusitanians, Numidia, the Sicilian Greeks, the Allied powers, the Axis powers, Italy,
Ethiopia, China, the Soviet Union and Mongolia, Zhou, Shang, the six Warring States, the Seneca and
Cayuga, the Western Confederacy, Syracuse, the Social War's allies, Athens, the Yue peoples, the Han
empire, the Xiongnu, Normandy, France, the Soviet Union, Finland, Jin and Wu. Four WW2-era cards resolve
their sides through era-map `keys`; the other 51 are authored polygons.

---

## 3. The sources

**THE RULE: OPEN AND FREE SOURCES ONLY** (Oct 2026, on request: "Ensure we only use open source/free info
sources so we never have commercial rights problems"). A source is an input to ANY batch — built from,
traced from or used to check — only if its licence lets anyone reuse it commercially:

- **allowed, no conditions**: public domain, CC0;
- **allowed, with credit**: CC BY (the credit, a licence link and a note of changes go in the generated
  file's header and in the Atlas's help card — `build-polities.js` does both for Cliopatria);
- **allowed, with share-alike**: CC BY-SA, ODbL, GPL — the DERIVED DATA FILE must carry the same licence
  and credit (not the site); such a source goes into a file of its own so its obligation stays contained.

**EXCLUDED, for everything — not even as a cross-check**: non-commercial (NC) licences, "academic" or
"educational use", "no redistribution", all rights reserved, paid, proprietary, and any source whose
licence is unstated or conflicting. Those rows are struck through below and no batch names them. A source
whose licence is unclear is EXCLUDED until its own published terms say otherwise.

### The two that do most of the work

- **Cliopatria** (Seshat Global History Databank), https://github.com/Seshat-Global-History-Databank/cliopatria —
  **CC BY 4.0** (`LICENSE.md`; Zenodo records 13363121 and 20274630, v0.2.0 of 2026-05-16). One GeoJSON,
  13,765 rows, 1,633 polities from 3400 BCE to 2024 CE, each row a shape with `FromYear`/`ToYear` — so
  "the shape in year *y*" is a lookup. Median 93 vertices per row (Folio's authored areas: about 10). It is
  a POLITY dataset: no archaeological cultures, almost no peoples, and the Greek poleis are one blob
  ("Greek City-States"). Credit, a link to the licence and a note of changes are required.
- **OpenHistoricalMap (OHM)**, https://www.openhistoricalmap.org — **CC0**. 4,132 country-level
  (`admin_level=2`) boundary relations, each version with `start_date`/`end_date`, often to the day:
  about 190–220 countries alive in any year from 1700 to 2010, and dated series for, among others, the
  Roman Republic (20 steps, 509–27 BCE), Carthage (7), the Mongol Empire (11, 1162–1271), the Empire of
  Japan (16), the Aztec Empire (3), the Italian states (dozens), England, France, Normandy, the Eastern
  Roman Empire (~35) and the WW2 German Reich (20). Quality varies — many ancient outlines are traced from
  Wikipedia maps, and France 1384–1513 has broken geometry.

### Supporting sources

| source | coverage | resolution | licence | use |
|---|---|---|---|---|
| **historical-basemaps** (A. Ourednik) — https://github.com/aourednik/historical-basemaps | world, 54 snapshots from 123,000 BCE to 2010 (Folio uses 11) | static snapshot | **GPL-3.0 per the repo's `LICENSE` file** — see the warning below | the only open source with some CULTURES (Yamnaya, Beaker, Únětice, Cycladic, Minoan …), and 43 unused snapshots |
| **AWMC geodata** (Ancient World Mapping Center) | Persian Empire, Alexander's empire, Roman Republic 60 BCE, Roman provinces 117/200 CE | one snapshot each, 2.4k–4.6k vertices | **ODbL** (SA) | the best open Achaemenid and Alexander envelopes |
| **USFS "Indian Land Cessions"** (Royce 1899, digitised) | 752 cession polygons 1784–1894, each tied to a treaty date | per treaty | US federal, **public domain** | the Native-held interior for the Northwest Indian War |
| ~~**Newberry AHCB** US states and territories~~ | 1783–2000, day-dated | day | **conflicting** (its own metadata says NC-SA; OHM's import page reports CC0 by email) | **EXCLUDED** until Newberry's own published terms say CC0 — and with it OHM's US features imported from it |
| **Shepherd, *Historical Atlas*** (1923/1926), UT Austin PCL | plates: Persian Empire c. 500 BCE, Athenian Empire c. 450, Greece 431 and 362 BCE, Rome in Italy, Rome and Carthage 218 BCE, France 1328/1453, Europe 1000/1097/1190/1360, Italy 1494, Kievan Rus' | plate per date | **public domain** | tracing base for tier 3 |
| **Atlas of the World Battle Fronts in Semimonthly Phases** (US Army, 1945) | WW2 fronts, Europe and Pacific incl. China | fortnightly, Jul 1943 – Aug 1945 | **public domain** | fronts, traced |
| **Pleiades** gazetteer | ~40k ancient places | attestation periods | CC BY 3.0 | points to build coalitions from member lists |
| ~~CShapes 2.0 (ETH Zürich)~~ | states 1886–2019, day-dated | day | NC-SA | **EXCLUDED** |
| ~~CHGIS (Harvard/Fudan)~~ | China, 221 BCE–1911 | yearly | no redistribution | **EXCLUDED** |
| ~~Euratlas, GeaCron~~ | Europe / world | 100 years / yearly | paid / proprietary | **EXCLUDED** |
| ~~Stanford "Building the New Order"~~ | Europe 1938–44 | monthly | all rights reserved | **EXCLUDED** |
| ~~HGIS de las Indias~~ | Spanish America 1701–1808 | 7 snapshots | NC-SA | **EXCLUDED** |
| ~~POLIS dataset (Stanford)~~ | Greek poleis | attributes | "academic use", no licence | **EXCLUDED** |

**A LICENCE QUESTION FOR THE OWNER, FOUND BY THIS AUDIT.** `docs/atlas.md` describes historical-basemaps
as CC BY-SA 4.0. The repository's `LICENSE` file, fetched 2026-10-01, is the GNU GPL-3.0, and its README
states no other licence. Folio already ships eleven era maps derived from it. This audit does not change
anything about that; it records the discrepancy so it can be checked (not legal advice). Until it is, no
batch below adds a NEW historical-basemaps-derived shape where Cliopatria or OHM can supply one.

---

## 4. Every entity, in five tiers

**Tier 1 — easy.** An open, dated, machine-readable border series with several steps inside the card's
span (Cliopatria rows and/or an OHM series). Work: import, simplify, check against one cited map.
**Tier 2 — good.** Open data, but only one or two steps, or a series that has to be assembled (several
polities into one side, a shape split along a known line, an envelope clipped at dated conquests).
**Tier 3 — moderate.** No usable open polygon: traced per phase from a public-domain plate or a cited
scholarly map, or derived from a dated site list.
**Tier 4 — hard.** Sparse or conflicting scholarship; one soft outline at most, stated as such on the card.
**Tier 5 — very hard or impossible.** No defensible extent exists. Keep a soft labelled zone, or draw
nothing.

"Cl" = Cliopatria rows overlapping the card's span (and the share of the span they cover); "OHM" = an
OpenHistoricalMap series.

### 4.A Era maps (the modern and early-modern countries)

| span | tier | source | note |
|---|---|---|---|
| 1886 – 2010 | **2** | OHM yearly (CC0); Cliopatria (CC BY) to fill and check | a pipeline rather than a polygon: cut OHM's `admin_level=2` set at 1 January of each year; fall back to the current snapshot where OHM has a hole (USSR 1922–48 was not found by name) |
| 1700 – 1886 | **2** | OHM (≈190 countries alive in any year) | Europe from 1648 and East Asia are dense; colonial Africa and the Americas are partial |
| 1500 – 1700 | **3** | OHM and Cliopatria where present; otherwise the existing snapshots | no open yearly world set exists |
| 1783 – 2000, United States | **3** | OHM's US features NOT imported from Newberry, Cliopatria's United States rows, the Royce cessions (PD) | the convenient day-dated source (Newberry AHCB) is excluded for its conflicting licence |

### 4.B Historical states

| # | state | tier | best source | approach |
|---|---|---|---|---|
| B4 | Carthaginian empire (rm-182) | **1** | Cl 21 rows, 100%; OHM 7 steps + Sicily/Sardinia/Iberia | import; check Iberia's start (OHM −218; the Barcid holdings date from 237) |
| B3 | Achaemenid Empire (gr-381, wh-301) | **1** | Cl 13 rows, 100%; AWMC envelope (ODbL) as a check | import Cl; one series shared by both cards and three wars |
| B10 | Ptolemaic Egypt (gr-767) | **1** | Cl 24 rows, 100% | import |
| B11 | Antigonid Macedonia (gr-770) | **1** | Cl 23 rows, 100% | import; shared with the Macedon war side |
| B12 | Graeco-Bactria (gr-783) | **1** | Cl 7 rows, 97% | import |
| B14 | Mongol Empire (wh-594, ru-091) | **1** | Cl 11 rows; OHM 11 steps 1162–1271 | import; ru-091's Jochid phase after 1260 from Cl |
| B6 | Empire of Japan (ww2-081) | **1** | Cl 24 rows; OHM 16 day-dated versions | import (de jure; occupied China is a war matter, D-ww2-096) |
| B15 | Aztec Empire (wh-605) | **1** | Cl 12 rows, 99%; OHM 3 steps | import |
| B16 | Inca Empire (wh-612) | **1** | Cl 5 rows, 98% | import |
| B19 | Kievan Rus' (ru-036) | **1** | Cl 16 rows, 100% | import |
| B5 | Bosporan Kingdom (ru-010) | **1** | Cl 6 rows, 86% ("Cimmerian Bosporus") | import; the last centuries before 342 CE uncovered |
| B18 | Volga Bulgaria (ru-015) | **1** | Cl 3 rows, 99.7% | import |
| B9 | Nanyue (cnh-232) | **1** | Cl 3 rows, 100% | import |
| B2 | Shang (wh-245) | **1** | Cl 3 rows, 100%; OHM 1 | import; expect the extent to be contested — say so |
| B17 | Northern and central Italy (wh-622) | **2** | Cl 101 rows (Venice, Genoa, Milan, Florence, Papal States …); OHM dozens | assemble several polities into one shape per year; the c. 1100–1200 communes phase has no data (tier 3 for that phase) |
| B8 | Zhou (cnh-111) | **2** | Cl 7 rows from 1000 BCE; OHM Western Zhou | the 1046–1000 BCE gap and the shrinking Eastern Zhou domain need a cited map |
| B13 | Indo-Greek Gandhara (gr-784) | **2** | Cl 8 rows, 55% | import what exists; the rest is soft |
| B1 | Lacedaemon (gr-233) | **2** | OHM Sparta (1 polygon, Laconia + Messenia); Cl has Sparta only inside "Greek City-States" | split at Taygetos: Messenia in until 370/369 BCE; later losses from a cited map |
| B7 | Gojoseon (ko-046) | **4** | Cl 2 rows, 47% | the scholarship disagrees on where it was (Liaodong-centred vs Pyongyang-centred): one soft outline from one cited mainstream map, the disagreement stated on the card |

### 4.C Peoples and cultures

Cliopatria is a polity dataset, so it holds the steppe khaganates and a few civilisations and no
archaeological culture. For those the open material is DATED SITE DATA, from which a hull per phase can
be drawn: **Hosner et al. 2016** (51,074 Chinese Neolithic and Bronze Age sites with culture labels,
PANGAEA, CC BY 3.0), **AADR** (dated, located ancient-DNA individuals with group labels, CC0 — a genetics
sample, so a hull around it is biased toward where people were sampled), **Rado.NB** (the Kiel European
radiocarbon database with culture and phase, CC BY 3.0; no working CSV export was found) and **Bourgeois
et al. 2025** (*Science Advances*, CC BY 4.0: dated Bell Beaker burials and an arrival-date surface).
Pleiades and AWMC hold only the Barrington Atlas's LABEL LINES for the Italic peoples, not areas — enough
to centre a soft zone, not to draw a border. Four works named below as references (Sedov 1982, Moshkova
1989, Salmon 1967, *Monumenta Linguae Messapicae*) were NOT opened and must be checked before use.

| # | people / culture | tier | best source | approach |
|---|---|---|---|---|
| C19 | Sumer (wh-172) | **1** | Cl 8 rows ("Sumerian City-States", Akkadian), 100% | the row nearest each date; Ur III (2112–2004) as its own step |
| C5 | Mycenaean civilisation (gr-056) | **1** | Cl 7 rows ("Mycenaean Greece"), 67% | shaft graves → the −1500 row, palaces → −1300, collapse → −1150 |
| C15 | Etruscan civilisation (rm-022) | **1** | Cl 13 rows ("Etruscans"), 49% | Etruria, Po-valley Etruria and Campania at the c. −530 maximum; the c. 1000 BCE nucleation predates Cl (take it from C8) |
| C3 | Cyclades (gr-002) | **1** | island coastlines | a multipolygon of the islands instead of a blob — no tracing; Keros–Syros traits reaching Attica and Euboea are said in text, not drawn |
| C4, C25 | Crete / Minoan civilisation (gr-006, gr-047, wh-262) | **1** | Crete's coastline; Cl "Minoan civilization" 2 rows | the island itself; Thera, Kythera and Rhodes as soft Neopalatial satellites if wanted |
| C29 | Scythians (ru-005) | **1** | Cl 5 rows ("Scythia"), 88% | the −550…−451 row for "dominant c. 700–300"; the 7th-century row is maximalist (it includes the Near-Eastern raids) |
| C32 | Galatia (gr-788) | **1** | Cl 7 rows | the −279…−128 rows for the settlement, the −27 row for the province — high confidence |
| C33 | Gothia (ru-011) | **1** | Cl 10 rows | the 270…372 rows, steppe era only |
| C34 | Huns (ru-012) | **1** | Cl 18 rows | the 371–469 rows — moderate confidence: they are maximal hegemony, not settlement |
| C35 | Avars (ru-013) | **1** | Cl 20 rows ("Avar Khaganate") | the Carpathian Basin core rows — high confidence |
| C36 | Old Great Bulgaria (ru-014) | **1** (partial) | Cl 3 rows, 14% of the span | the 633–655 core row; the Volga and Danube branches as later rows |
| C37 | Khazaria (ru-016) | **1** | Cl 21 rows | the khaganate at its height; its archaeological correlate (Saltovo–Mayaki) is narrower |
| C38 | Etelköz (ru-019) | **1** data / contested | Cl 6 rows ("Magyars"), 860–895 | the row exists; where Etelköz WAS is disputed — a soft edge, and the dispute said on the card |
| C26 | Bell Beaker culture (wh-273) | **2** | Bourgeois et al. 2025 (CC BY 4.0) | **the best moving shape among the cultures**: contour the arrival surface at c. 2750, 2500 and 2300 BCE |
| C16 | Linear Pottery (wh-137) | **2** | Rado.NB / EUROEVOL dated sites | hull the dated sites in two bins, which is the card's own "second wave" |
| C24 | Yamnaya (wh-258) | **2** | AADR (CC0); one cited maximal-extent figure | early Volga–Don core (c. 3300–3000) and a westward Danube–Tisza phase (c. 3000–2600) |
| C27 | Únětice (wh-274) | **2** | Rado.NB phases | early vs classical hull, clipped to Bohemia, Moravia, central Germany, Silesia, Lower Austria |
| C17 | Yangshao (wh-147, cnh-045) | **2** | Hosner 2016 | a concave hull per phase (early / middle / late), checked against a cited distribution map |
| C18 | Longshan (wh-148, cnh-050) | **2** | Hosner 2016 | hull, Early–Middle vs Late where the phase field allows; Shaanxi and Hebei by hand |
| C6 | Natufian (wh-116) | **2** | NERD radiocarbon (CC BY 4.0) — no culture field, so sites are filtered by hand | Early vs Late hull |
| C2 | Clovis (wh-101) | **2** | PIDBA point densities; Waters 2020 dated sites | a hull of the point-density counties, clipped to the Late Glacial coast |
| C22 | Hongshan (cnh-047) | **3** | Hosner has no Hongshan label | trace western Liaoning / SE Inner Mongolia / N Hebei from a cited regional map |
| C23 | Liangzhu (cnh-048) | **3** | Hosner covers Zhejiang only | the Taihu basin core, traced from a cited figure; one phase |
| C21 | Erlitou (wh-243, cnh-062) | **3** | cited figures; Hosner for checking | Yiluo basin core plus the western Henan / southern Shanxi periphery; the four phases are not mappable from open data |
| C20 | Naqada (wh-203) | **3** | cited phase maps | Naqada I / II / III along the Nile valley, I in Upper Egypt, III the whole valley |
| C7 | Terramare (rm-007) | **3** | cited maps | the central Po plain; the c. 1150 collapse is one cut-off |
| C8 | Villanovan (rm-008) | **3** | one cited open figure | Etruria + the Bologna area + outliers, one phase |
| C9 | Sabines (rm-012) | **3** | Barrington label + rivers | Tiber–Anio–Nar–Apennine crest; clipped at 290 BCE by Rome's series |
| C10 | Samnium (rm-013 and the Samnite Wars) | **3** | Barrington positions of the Pentri, Caudini, Hirpini, Caraceni | one block; steps by subtracting Rome's series at 343, 304, 290 |
| C13 | Venetia (rm-019) | **3** | inscription findspots | Po to the Alps and the Isonzo, one phase |
| C14 | Messapia (rm-020) | **3** | coastline + one land boundary | one phase |
| C30 | Sarmatia (ru-008) | **3** | **Cl has no Sarmatians**, so the steppe is empty between Scythia (to 224 BCE) and Gothia (from 207 CE) | phase shapes by hand from cited maps |
| C31 | Mumun (jp-033) | **3** | a cited figure for Songguk-ri | the southern Korean peninsula; a soft zone on northern Kyushu for the "crossing" |
| C40 | Upper Oka / Vyatichi (ru-024) | **3** | temple-ring and kurgan distribution (Sedov 1982 — not opened) | upper Oka, Moskva, Ugra, Zhizdra, Pronya |
| C41 | Desht-i Qipchaq / Cumans (ru-074) | **3** | Cl's Kipchak polygon stops at 37.8° E; its "Cuman-Kipchak Confederation" row is a 315 km² sliver (a data fault) | Cl's polygon extended west to the Dnieper and lower Danube from a cited map |
| C11 | Umbria (rm-015) | **4** | the earlier, larger range is text-only | a modest static shape, labelled softly |
| C12 | Liguria (rm-018) | **4** | none beyond texts | a soft zone along the Ligurian Apennines and coast, uncertainty stated |
| C39 | Patzinakia / Pechenegs (ru-020) | **4** | **Cl has no Pechenegs**; historical-basemaps only | a soft text-based shape for c. 950 (Don → Siret); very little archaeology |
| C1 | Mal'ta–Buret' (wh-096) | **5** | two sites | a soft ~50 km zone round the two sites — not a territory |
| C28 | Cimmerians (ru-004) | **5** | texts only | a soft labelled zone over the north-Pontic steppe |

### 4.D Wars

**EIGHT WAR CARDS ARE NOT DRAWN ON THE ATLAS AT ALL** (Oct 2026, on request: "Wars cards which group
several other cards should not be included on the personal or full atlas"): the Messenian Wars (gr-235),
the Samnite Wars (rm-151), the Punic Wars (wh-345), the Roman conquest of Greece (wh-349), the Roman
conquest of Spain (rm-261), the Peloponnesian War (wh-330, gr-521) and the Second World War (ww2-001) each
GROUP other war cards, and carry `war.group: true` (see `card-war.js`). They need no series of their own;
their rows below are kept for the record. The Second World War is drawn instead as its FRONT LINES (§6).

A war is as easy as its harder side. Where both sides are tier 1 the war draws year by year as soon as
those series exist; the war block then names polities rather than carrying polygons (see §5).

| card | war | victors | defeated | tier | note |
|---|---|---|---|---|---|
| wh-345, rm-186, rm-209, rm-234 | Punic Wars, First, Second, Third | Rome — Cl 34 rows, OHM 20 steps | Carthage — Cl 21, OHM 7 | **1** | both series already step at −264, −241, −238, −218, −206, −146 |
| wh-310 | Fall of the Achaemenid Empire | Macedon — Cl | Achaemenid — Cl 13 | **1** | yearly 334–330 |
| gr-383 | Persian conquest of Lydia | Persia — Cl | Lydia — Cl 1 | **1** | |
| rm-245 | Roman–Seleucid War | Rome | Seleucid — Cl 2 | **1** | |
| rm-310, rm-333 | First / Third Mithridatic War | Rome | Pontus — Cl 3 | **1** | |
| rm-292 | Jugurthine War | Rome | Numidia — Cl 2 | **1** | |
| rm-255 | Achaean War | Rome | Achaean League — Cl 1, OHM | **1** | |
| rm-240, rm-249 | Second / Third Macedonian War | Rome | Macedon — Cl 23 | **1** | |
| wh-349 | Roman conquest of Greece | Rome | Antigonid Macedon + Achaean + Aetolian Leagues — Cl 7 | **1** | assemble three polities into one side |
| cnh-188 | Qin conquest of the six states | Qin — Cl 4 | Han, Zhao, Wei, Chu, Yan, Qi — Cl 10 | **1** | yearly by annexation 230–221 |
| cnh-224 | Han–Xiongnu wars | Han — Cl 2 | Xiongnu — Cl 2 | **1** | the Xiongnu border is a steppe zone whatever the source says |
| cnh-295 | Conquest of Wu by Jin | Western Jin — Cl 1 | Eastern Wu — Cl 1 | **1** | |
| cnh-205 | Qin conquest of the south | Qin | the Yue peoples — Cl "Minyue" 1 | **2** | Minyue is one of several Yue polities; the three commanderies of 214 BCE need a cited map |
| wh-463 | Early Muslim conquests | Rashidun — Cl 6 | Byzantium + Sasanians — Cl 11, OHM ~35 | **1** | |
| wh-504 | Norman Conquest | Normandy — Cl 1 | England — Cl 13 | **1** | |
| wh-518 | Hundred Years' War | France — Cl 16 | England — Cl 13 | **1** | check English holdings in France against Shepherd 1328/1360/1453 (PD); OHM's France 1384–1513 is broken |
| ww2-001 | Second World War | Allies — Cl 70 rows | Axis — Cl 31 rows | **1** sides / **3** fronts | sides need each member's entry and exit dates; fronts only from the PD fortnightly atlas, Jul 1943 on |
| ww2-042 | Second Italo-Ethiopian War | Italy — Cl 4 | Ethiopia — Cl 1, OHM to 1936-05-09 | **1** | the 1935–36 advance would need tracing (tier 3) |
| ww2-100 | Soviet–Japanese border conflicts | USSR + Mongolia — Cl 4 | Japan — Cl 24 | **1** | |
| ww2-159 | Winter War | USSR | Finland — Cl 2, OHM 1940-03-12 | **1** | |
| ww2-096 | Second Sino-Japanese War | China — Cl 10 | Japan | **1** sides / **3** occupation | occupied China 1937–43 from cited maps; 1943–45 from the PD fronts atlas |
| us-072 | Northwest Indian War | United States — Cl 5 | Western Confederacy — none | **2** | the Confederacy's lands = the Ohio country minus the Royce cessions (PD), by treaty date |
| us-071 | Sullivan Expedition | United States — Cl | Seneca and Cayuga — Cl "Haudenosaunee" 1 | **2** | split the Haudenosaunee shape to the two nations from an openly licensed or public-domain map |
| gr-448 | Carthaginian invasion of Sicily | Sicilian Greeks — Cl "Greek City-States"; OHM Syracuse | Carthage | **2** | Syracuse + Akragas from OHM |
| gr-552 | Sicilian Expedition | Syracuse — OHM 1 | Athens and its empire | **3** | Athens' side as below |
| gr-676 | Social War (357–355) | the allies — Chios, Rhodes, Cos, Byzantium | Athens — Cl "Second Athenian League" 1 | **2** | the allies are four islands/cities: coastlines, no tracing |
| wh-330, gr-521, gr-561 | Peloponnesian War, Decelean War | Sparta and its allies — Cl "Peloponnesian League" 2 | Athens and its empire — none | **3** | trace the Athenian empire from Shepherd's 431 and c. 450 plates (PD) and the tribute lists; phases 431, 421, 413–404 |
| wh-319 | Greco-Persian Wars | Greek allies — Cl "Greek City-States" | Achaemenid | **3** | build the Hellenic League from the Serpent Column's member poleis (Pleiades points → regions) |
| gr-755 | Lamian War | Macedon | Greek allies | **3** | coalition traced from Shepherd (PD) |
| rm-151, 152, 153, 156 | Samnite Wars | Rome | Samnium — historical-basemaps "Samnites" only | **2** | Rome's steps from OHM/Cl; Samnium one region (see C10) |
| rm-158 | Roman conquest of Etruria | Rome | Etruria — Cl "Etruscans" 13 rows, 49% | **2** | shrinking city by city (Veii 396 …) |
| rm-159 | Roman conquest of Umbria and Picenum | Rome | Umbria + Picenum — none (OHM has only the Augustan regiones) | **3** | |
| rm-162 | Roman conquest of Cisalpine Gaul | Rome | Cisalpine Gauls — historical-basemaps "Boii" | **3** | the Po valley minus Roman holdings |
| rm-237 | Illyrian Wars | Rome | Ardiaean kingdom — Cl "Illyrian Kingdom" to 226 BCE | **2** | the second war (219) falls outside Cl's rows |
| rm-261 | Roman conquest of Spain | Rome — OHM steps to −19 | Celtiberians and Lusitanians — none | **2** | losers = the unconquered remainder of Iberia, i.e. the complement of Roman holdings |
| rm-262, rm-265 | Celtiberian / Numantine War | Rome | Celtiberians — historical-basemaps only | **3** | tribal territory from a cited map |
| rm-263 | Lusitanian War | Rome | Lusitanians — none | **3** | |
| wh-354, rm-350 | Gallic Wars | Rome | Gallic tribes — none | **3** | tribal blocks from a cited map; campaign steps 58–51 |
| cnh-103 | Fall of the Shang | Zhou — Cl rows start 1000 BCE | Shang — Cl 3 | **3** | the pre-conquest Zhou homeland in the Wei valley needs a cited map |
| gr-235, 236, 237, 461 | Messenian Wars, First, Second, Third | Sparta | Messenia | **2** | OHM Sparta split at Taygetos; static — the course of the wars is recorded nowhere, so do not invent it |

**Counts.** States (19): tier 1 — 14, tier 2 — 4, tier 4 — 1. Peoples and cultures (41): tier 1 — 14,
tier 2 — 8, tier 3 — 14, tier 4 — 3, tier 5 — 2. War cards (55): tier 1 — 30, tier 2 — 13, tier 3 — 12
(fronts and occupations, where wanted, are tier 3 on top). Era maps: tier 2 from 1700, tier 3 before.

---

## 5. The plumbing every tier needs (batch 0 — BUILT 2026-10-01)

A locator `area` and a war side's `area` were one polygon with no time dimension. What was built makes
every tier possible and leaves every card that is never upgraded exactly as it was:

- **A lazy dated-polity bundle, `polities.js`** (`DATA_BUNDLES.polities`; never on the eager path —
  📖 `docs/eager-path.md`), warmed at idle by the Atlas and never awaited:
  `window.POLITIES = { "<slug>": { n: label, s: [[from, to, rings], …] } }`.
- **It is GENERATED** by `.claude/build-polities.js` from `.claude/polity-spec.json` — which Cliopatria
  names make up each series, its years, and which card draws it. Per-ring Douglas–Peucker (0.03°) is
  ACCEPTED here, unlike in `build-era.js`: each series is drawn on its own, so two series that meet differ
  by a hair at most; the era maps' shared borders must stay bit-identical and that rule still holds there.
- **THE LINK IS IN THE SPEC, NOT ON THE CARD** (`window.POLITY_LINKS = { "<card id>": { area | v | l:
  [slugs] } }`), which is a change from the plan: putting `polity` on the card would have meant a new field
  through `add-locators.js` and `card-war.js` and a `data.js` rewrite for every batch, where one table in
  the generated bundle is rebuilt in a second and checked by the builder against the cards.
- **The draw path resolves the step for the year on the rail** (`polityLink`, `polityStep`, `polityRings`,
  `mineAreaOf` in app.js): `drawMineAreas`, `mineWarShapes` and the hit-test all read the same rings, and
  `mineWarShapes` caches on the STEP, not the year. A year no step covers, or a bundle not yet loaded, falls
  back to the authored polygon — nothing ever draws less than it did.
- **An authored side facing a dated one is drawn OUTSIDE it** (even-odd clip): Rome's series grows across
  Italy while Samnium's polygon stays put, and the shared ground would otherwise be both colours.
- **One series per polity, shared**: every Roman war card resolves against one `rome` series.
- **Credit**: the bundle's header carries Cliopatria's credit, licence link and note of changes; the
  Atlas help card carries the credit a reader sees.
- **The guard**: `node .claude/test-polities.js` (no browser; in CI's fast job) — every series sorted and
  well-formed, every link to a real card, side and slug, no link to a grouping war, a step inside every
  linked card's years, and the border really MOVING across a war that spans a step.

To add a polity: add it to `polity-spec.json` (`cliopatria` names, `years`), link the cards, run
`node .claude/build-polities.js <cliopatria_polities_only.geojson>` (its header says where to fetch it),
then `node .claude/test-polities.js`.

---

## 6. The batches

In the order that buys the most per batch. Each batch: build, check two years per entity in a screenshot
against the cited source, run `test-personal-atlas.js` and `test-war-cards.js`, record in §7.

| batch | what | entities | cards touched |
|---|---|---|---|
| **0** ✓ | the plumbing in §5, piloted on **Rome and Carthage** | 2 series | 24 links (the grouping wars excluded) |
| **1** ✓ | tier-1 states | B2, B3, B5, B6, B9–B12, B14–B16, B18, B19 | 15 |
| **2** ✓ | tier-1 war sides not already built | Macedon, Seleucid, Pontus, Numidia, Achaean/Aetolian Leagues, Lydia, the seven Warring States, Han, Xiongnu, Jin, Wu, Rashidun, Byzantium, Sasanians, Normandy, England, France | ~20 war cards |
| **3** ✓ | WW2-era sides by date | Allies/Axis membership by entry/exit date over yearly OHM/Cl borders; Italy, Ethiopia, Finland, USSR, Mongolia, China | ww2-001, 042, 096, 100, 159 |
| **4** ½ | tier-1 peoples (Cliopatria rows ✓, coastlines ✓), then tier-2 site hulls (Yangshao and Longshan ✓; the European cultures wait for a usable open site list — the AADR was tried and rejected) | C3–C5, C15, C19, C25, C29, C32–C38; then C2, C6, C16–C18, C24, C26, C27 | 22 |
| **5** ½ | tier-2 assembly (Zhou, Indo-Greeks, the Italian states ✓; Lacedaemon and the Messenian, Samnite and Spanish wars still need a Laconia/Messenia split and Italic and Iberian peoples, which no open dataset has) | B1, B8, B13, B17; the Messenian, Samnite, Etruscan, Illyrian, Spanish and US wars | ~20 |
| **6** | tier-3 tracing from public-domain plates and cited maps | Athens' empire, the Hellenic League, the Lamian coalition, Italic and Gallic and Iberian peoples, Zhou homeland, Hundred Years' War check | ~15 |
| **7** ✓ | the era maps by year (built from Cliopatria, 1700–2014, as per-country steps between the era maps) | the OHM pipeline in §4.A, 1886→2010 first, then 1700→1886 | every geography card |
| **8** | tier 4–5: soft outlines and honest silence | B7, C1, C11, C12, C28, C39 | 6 |

**Decisions taken before batch 0** (Oct 2026, by the owner):

1. **Open and free sources only** — see §3's rule. The historical-basemaps licence (§3) stays an open
   question for the eleven era maps already shipped; no new shape is derived from it while Cliopatria or
   OHM can supply one, and anything that is goes into a file of its own under its licence.
2. **The khaganates and confederations stay PEOPLES** ("The people's you mentioned (Avars, Magyar etc.)
   should indeed be people's and not states"). Avars, Khazars, Huns, Goths, the Magyars in Etelköz and the
   Cumans keep their `people` tag and are drawn as a blue wash; batch 4 may still take their EXTENT from
   Cliopatria's rows — the series decides where the wash lies in a year, the tag decides how it is drawn.
3. **The Second World War gets FRONT LINES** ("Add front line border maps for World War 2 if that's the
   only one you can find"). Its card groups other wars and is not shaded as two sides (§4.D); its fronts
   are a layer of their own, from an open source only.

---

## 6b. Batches 6 and 8: what stands in the way, area by area (Oct 2026 — LISTED, NOT CHANGED)

On request: "For batch 6 and 8, dont make any changes but make a list of the relevant areas with the
constraints/issues preventing easy accurate borders." Every area below still draws its AUTHORED polygon
(a dozen hand-placed points, one shape for its whole span). Nothing here was altered. Each row names what
an accurate, open-source border would need and why it is not simply available — read with §3's rule, which
excludes any source that is not free for commercial reuse. "Cl" is Cliopatria; "HB" historical-basemaps.

### Batch 6 — tier 3: no open polygon; a border would have to be traced or derived

| area | cards | the constraint |
|---|---|---|
| **Athens and its empire** | gr-552 (l), gr-561 (l) | No open polygon: Cl and OHM have none; Cl folds the poleis into one "Greek City-States" blob. The empire is a scatter of tribute-paying islands and coastal cities whose membership changed year by year (431, 421, 413–404). An accurate shape means a member list (Athenian Tribute Lists) placed through Pleiades (CC BY) — a research task per phase, and the lists are themselves fragmentary. The public-domain Shepherd plates (c. 450 and 431 BCE) are images that would have to be traced by eye. |
| **Greek allies / the Hellenic League** | wh-319 (v), gr-755 (l) | Same problem: a coalition of poleis, not a territory. The Serpent Column names the 31 states of 479 BCE; the Lamian coalition of 323 BCE has no such list. Building either from Pleiades points needs each member located and a rule for how much land a polis "holds". |
| **Syracuse / the Sicilian Greeks** | gr-448 (v), gr-552 (v) | OHM has a "Tyranny of Syracuse" (CC0) but not Akragas or Gela; Cl only the Greek blob. The Sicilian Greeks of 480 BCE are a coalition again. |
| **Sparta and Messenia** | gr-233, gr-236, gr-237, gr-461 | OHM's one Sparta polygon (CC0) already INCLUDES Messenia, so it cannot serve a war between the two: Messenia needs its own line (the Taygetos watershed), which no open dataset draws. Folio's shape would have to be split along a traced ridge. |
| **Samnium** | rm-013, rm-152, rm-153, rm-156 (l) | Not in Cl. HB has "Samnites" (GPL, a static snapshot, and HB's licence question is still open). Pleiades/AWMC give only Barrington label LINES for the Pentri, Caudini, Hirpini and Caraceni — positions, not borders. |
| **Umbria and Picenum** | rm-159 (l) | Not in Cl; OHM has only the AUGUSTAN regiones V and VI (7 CE), drawn three centuries after the war — a later administrative border, not the peoples'. |
| **Cisalpine Gauls** | rm-162 (l) | HB has the Boii only; no open tribal map of the Insubres, Boii and Cenomani. The defeated side is the Po valley minus Rome, which needs Rome's series (built) plus a northern limit no dataset draws. |
| **Celtiberians, Lusitanians** | rm-262, rm-263, rm-265 (l) | No open tribal polygons. OHM's Lusitania is the Augustan province of 27 BCE. HB's "Celtiberians" is GPL and static. |
| **Gallic tribes** | wh-354, rm-350 (l) | No open polygons for the Gallic civitates. The war moved campaign by campaign (58–51 BCE) — the shape that matters changes every year and is recorded only in Caesar's text. |
| **The Zhou homeland before the conquest** | cnh-103 (v) | Cl's Zhou rows begin at 1000 BCE, after the 1046 BCE conquest; CHGIS starts in 221 BCE and is excluded anyway (no redistribution). The Wei-valley homeland would have to be traced from a cited map. |
| **The Yue peoples** | cnh-205 (l) | Cl's "Minyue" is in Fujian; the 214 BCE conquest was in Lingnan (Guangdong, Guangxi). The three commanderies of 214 BCE have no open polygon. |
| **The Seneca and Cayuga** | us-071 (l) | Cl's "Haudenosaunee" is the whole Six Nations — an over-claim for two of them. Splitting it needs a cited map of each nation's homeland; the Royce cessions (PD) start in 1784, after the 1779 expedition. |
| **The Western Confederacy** | us-072 (l) | DERIVABLE but not yet derived: the Ohio country minus the Royce cession polygons (USFS, public domain) by treaty date. It needs the USFS layer fetched and a northern/western limit for "the Ohio country", which is an editorial line. |
| **The Ardiaean kingdom, 219 BCE** | rm-237 (l) | Cl's "Illyrian Kingdom" ends at 226 BCE, so the second Illyrian War (219) has no row; one cited map would cover it. |
| **The Hundred Years' War, English holdings** | wh-518 | BUILT from Cl, but unchecked: Gascony and Calais are thin in Cl's England rows. A check against the public-domain Shepherd plates (France 1328, 1360, 1453) is still owed. |
| **Hongshan** | cnh-047 | Hosner has no Hongshan label (its Liaoning and Inner Mongolia sites are "undistinguished"); the open surveys cover two small windows. Needs a cited regional map. |
| **Liangzhu** | cnh-048 | Hosner's 180 Liangzhu sites are Zhejiang only; the Taihu-basin core straddles Jiangsu and Shanghai, so an outline from them would cut the culture in half. |
| **Erlitou** | wh-243, cnh-062 | No Hosner label; the Yiluo-basin core and western-Henan periphery are in published figures only; its four phases are not mappable from open data. |
| **Naqada** | wh-203 | Not in Cl (its "Early Dynastic Egypt" starts at 3000 BCE); the literature gives territory sizes, not polygons. Phases I–III along the Nile would be traced from a cited map. |
| **Terramare, Villanovan** | rm-007, rm-008 | Open site data covers only one slice of Emilia (Terramare); the Villanovan has one cited open figure, single-phase. Both are tracing jobs. |
| **Sabines, Venetia, Messapia** | rm-012, rm-019, rm-020 | Not in Cl; Pleiades/AWMC hold Barrington label lines only; the Messapic inscription corpus that would place Messapia is not open. Defensible shapes are drawable from rivers, coasts and the Apennine crest, but they are editorial lines. |
| **Sarmatia** | ru-008 | Cl has no Sarmatians — the steppe is empty between Scythia (to 224 BCE) and the Goths (from 207 CE). Phases would be hand-drawn from cited maps. |
| **Mumun** | jp-033 | The Korean radiocarbon set (17,000+ dates) has no open download found; one cited figure exists for Songguk-ri. |
| **Upper Oka (the Vyatichi)** | ru-024 | Known from temple-ring and kurgan distributions in Sedov 1982 (not open; not opened). |
| **Desht-i Qipchaq (the Cumans)** | ru-074 | Cl's "Cuman-Kipchak Confederation" is a one-row 315 km² sliver — a data fault — and its Kimek–Kipchak shape stops at 37.8° E, short of the Dnieper; extending it is hand-drawing. |
| **The European site cultures** — Linear Pottery, Únětice, Bell Beaker, Yamnaya, Natufian, Clovis | wh-137, wh-274, wh-273, wh-258, wh-116, wh-101 | The method exists and works (Yangshao, Longshan), but the INPUT does not: Rado.NB and EUROEVOL (both CC BY) have no working export found; the AADR (CC0) was tried and rejected as a genetics sample, not a distribution; NERD has no culture field (Natufian sites would be hand-filtered); PIDBA (Clovis) has no open licence. Bourgeois et al. 2025 (CC BY 4.0) has Bell Beaker's arrival surface, still to be processed. |

### Batch 8 — tiers 4 and 5: sparse, conflicting or no evidence

| area | card | the constraint |
|---|---|---|
| **Gojoseon** | ko-046 | The scholarship disagrees on WHERE it was — a Liaodong-centred and a Pyongyang-centred school — and Cl's two rows cover under half the card's span. Any single border takes a side in a live dispute; the honest form is a soft outline with the disagreement on the card. |
| **Mal'ta–Buret'** | wh-096 | Known from essentially two sites on the upper Angara. There is no extent to draw, only a point; a polygon of any size claims a territory nobody has evidence for. |
| **Umbria** | rm-015 | Ancient writers give an early, larger Umbria reaching the Adriatic, then the coast lost to the Senones about 390 BCE; the Augustan region differs again. No open phased map. |
| **Liguria** | rm-018 | Known from texts and later Roman administration; the Ligurian range moved over a thousand years and the sources do not fix it. |
| **The Cimmerians** | ru-004 | Known only from Greek and Assyrian texts; their north-Pontic homeland has no agreed archaeology (the attribution of the Chernogorovka–Novocherkassk horizon is disputed). No location is defensible beyond "the north-Pontic steppe". |
| **The Pechenegs (Patzinakia)** | ru-020 | Not in Cl (only the Oghuz, further east); HB's shape is GPL and static; very little archaeology. A text-based zone from the Don to the Siret around 950 is all the evidence supports. |

## 7. Ledger

| date | batch | what was done |
|---|---|---|
| 2026-10-01 | 7 | **A country's border year by year BETWEEN the era maps** (`country-series.js`, `DATA_BUNDLES.countrysteps`, `.claude/build-country-series.js`, `.claude/geo-util.js`; `countryStep` in app.js). Built from Cliopatria rather than OHM: it was already downloaded, it is one consistent dataset from 1700 to 2024, and it is CC BY 4.0 — OHM stays the alternative if Cliopatria's modern shapes ever prove wrong. **WHEN a country is on the globe is unchanged** (the era maps and `mineFounded` decide what counts as "Germany" in 1900); only its SHAPE between two maps moves: each country in each era from 1700 is matched to the Cliopatria polity overlapping its era shape best, and that polity's rows are used for the years to the next map **only where they differ** — measured on LAND and on 0.5° cells so a source's different coast or islands is not a "change", used only if the rows MOVE within the stretch or the era map over-claims (the row lies inside the era shape, as West Germany inside the 1960 map's unified Germany), and cut to the rings near the country so a colonial power's far-away colonies are never drawn under a colony's name (Cliopatria's "United States of America" holds the Philippines AND Hawaii). Where the matched state ENDED before the next map and that map drops the name, the country is hidden from the year after (the USSR in 1992–1993, the Empire of Japan 1946–1959). A step's shape is filled CLIPPED TO THE LAND and stroked along its INTERIOR LINES only (edges with land on both sides), so Cliopatria's coarser coast is never drawn beside world.js's. Result: 55 countries, 203 steps, 12 endings, 1.0 MB raw / 104 KB gzipped — the First World War's occupations (France 1915–18), the Balkan Wars (Greece, Serbia, Bulgaria 1912–13), the Second World War (Romania, Finland, Italy, Japan, the USSR), West Germany 1960–90, Pakistan after 1971. 983 Cliopatria rows that agree with the era maps were left out by design. Screenshots at 1916, 1941 and 1975 checked. **Generated border bundles now have their rings closed on load** (`closeRings`), which also fixes a missing last edge on every batch 0–5 outline |
| 2026-10-01 | WW2 fronts | **The Second World War's fronts, Europe, monthly, Aug 1939 – Dec 1942** (`fronts.js`, `DATA_BUNDLES.fronts`, `.claude/build-fronts.js`; `frontKey`, `frontStep`, `drawFronts`, `frontAt`, `#atlasMonth` in app.js). Source: the Wikimedia Commons series "Second World War Europe MM YYYY de.svg" by San Jose — PD-self, checked on the file page — as vectorised by ww2-atlas, whose data/LICENSE lists those files as public domain. Axis and Axis-occupied ground in the war cards' red, Allied and Allied-occupied in their green, occupied fainter; a click opens the Second World War card; a month control appears for the years that have fronts, and the cartouche names the month. Shown on the full atlas, and on the reader's own once ww2-001 is studied. **Its limits, as the source has them**: the end-of-month situation, not a daily front; Europe only, so North Africa is mostly absent and the Soviet side stops at the source maps' eastern frame (about 60° E, a straight edge on the globe); nothing after December 1942. **Next**: July 1943 – August 1945 from the public-domain US Army *Atlas of the World Battle Fronts in Semimonthly Phases* (98 plates, fortnightly, Europe and the Pacific) — a georeferencing job: fit each base map's stated projection, extract the Allied colours, mask the sea, trace, and check every plate by eye. January – June 1943 has no open source found |
| 2026-10-01 | 4 (site hulls, first) | **A culture outlined from its dated sites** — `.claude/build-site-hulls.js` grids a culture's sites (0.2°), closes gaps of two cells, drops components holding under 3% of a phase's sites, traces and rounds the outline, and writes `.claude/site-hulls.json`, which `build-polities.js` ships (`sites` in the spec). Source: Hosner et al. 2016 (PANGAEA, CC BY 3.0; credited in the bundle header and the help card). **Yangshao** (wh-147, cnh-045) MOVES in three phases from Hosner's own phase labels — early (217 sites), middle (760), late (316, two areas in Shanxi and the Wei valley) — and **Longshan** (wh-148, cnh-050) is one outline from 3,730 sites. **Not done from Hosner**: Liangzhu (its sites are Zhejiang only — the Taihu core straddles Jiangsu, so a hull would cut it in half), Hongshan and Erlitou (no label). **TRIED AND NOT SHIPPED — the AADR (ancient DNA, CC0) as a site list** for the Yamnaya, Bell Beaker, LBK and Únětice: 200, 235, 233 and 172 dated, located individuals, outlined the same way. The result was a scatter of strips round the places geneticists have sampled — Bell Beaker as Britain, the Rhine and Bohemia with no Iberia and no France, the Yamnaya as a dozen patches — which says less about where those cultures were than the authored polygons do. A genetics sample is not a distribution map; those four keep their authored shapes until a site or radiocarbon list (Rado.NB, EUROEVOL — both CC BY, neither with a working export found yet) or Bourgeois et al. 2025's arrival surface (CC BY 4.0) can be processed |
| 2026-10-01 | 4 (coastlines) and 5 (Cliopatria part) | **Coastline series** built (`coast` in the spec; world.js's Natural Earth rings, public domain): the Cyclades (gr-002, 14 islands) and Crete (gr-006, gr-047, wh-262 — replacing the Minoan Cliopatria link, which covered only 1600–1401 BCE of their spans). **Batch 5, the parts Cliopatria can supply**: the Zhou (cnh-111; "Zhou Dynasty" then "Later Zhou", whose pre-256 BCE rows are the Eastern Zhou, clipped to the card), the Indo-Greeks (gr-784, 126 BCE–13 CE of the card's span), and northern and central Italy (wh-622) ASSEMBLED from seven series — Venice, Genoa, Pisa, Florence, Milan, the Papal States and Savoy — each with its own border; the Holy Roman Empire is deliberately left out. Screenshots at 2500 BCE (the Aegean) and 1460 (Italy) checked. **Still to do in batch 5**: Lacedaemon split at Taygetos (OHM, CC0) and the tier-2 war assemblies. 70 series, 77 links |
| 2026-10-01 | 4 (first half) | the **tier-1 peoples** whose extent Cliopatria carries, still drawn as a people's blue wash (the owner's decision): Sumer ("Sumerian City-States"; not the Akkadian Empire, a conqueror of Sumer rather than Sumer), Mycenaean Greece, Minoan Crete (gr-006, gr-047, wh-262; Cliopatria has only 1600–1401 BCE, so the cards' other centuries fall back), the Etruscans (rm-022), Scythia, Galatia, Gothia, the Huns ("Huns" → "Hunnic Empire"), the Avar Khaganate, Old Great Bulgaria, Khazaria and the Magyars in Etelköz. **Not linked**: the Cumans (Cliopatria's "Cuman-Kipchak Confederation" is a one-row 315 km² sliver and its Kimek–Kipchak shape stops short of the Dnieper), the Cyclades and Crete as COASTLINES (a different mechanism — the island rings of world.js — still to build), and every tier-2 site-hull culture (Bell Beaker first), which needs dated-site processing. Screenshots at 650 CE and 1300 BCE checked. 60 series, 73 links |
| 2026-10-01 | 2 and 3 | the **war sides**: Seleucids (rm-245), Pontus (rm-310, rm-333), Numidia (rm-292), the Achaean League (rm-255), Lydia (gr-383), the Etruscans (rm-158), the Illyrian kingdom (rm-237; Cliopatria ends at 226 BCE, so the second war falls back), the Peloponnesian League (gr-561), the Second Athenian League (gr-676), Qin ("Qin" → "Qin Dynasty") and the five states left standing in cnh-188 — Han, annexed first in 230 BCE, has no row inside the war and the builder drops it with a warning — Qin in cnh-205, Han dynasty and Xiongnu (cnh-224), Western Jin and Eastern Wu (cnh-295), the Rashidun against Byzantium ("Eastern Roman Empire" → "Byzantine Empire") and the Sasanians (wh-463), Normandy and England (wh-504), France and England (wh-518), the United States (us-071, us-072); and the **WW2-era** sides (batch 3): Italy and Italian Africa against Ethiopia (ww2-042), the Republic of China and the Communist base areas against Japan (ww2-096), the USSR and the Mongolian People's Republic against Japan (ww2-100), the USSR against Finland (ww2-159). **Not linked, deliberately**: the Seneca and Cayuga (Cliopatria's Haudenosaunee is the whole confederacy — an over-claim), the Yue in cnh-205 (Cliopatria's Minyue is in Fujian; the 214 BCE conquest was in Lingnan), the Zhou in cnh-103 (rows start in 1000 BCE), Syracuse and the "Sicilian Greeks" (Cliopatria has only one "Greek City-States" blob), and Manchukuo, which Cliopatria lacks (so Japan's side in the 1930s wars is the Empire of Japan de jure). THE BUILDER NOW KEEPS ONLY THE STEPS A LINKED CARD CAN SHOW, which took the bundle from 5.2 MB to 1.5 MB. Screenshots at 225 BCE (Qin), 1360 (the Hundred Years' War) and 1940 (the Winter War) checked |
| 2026-10-01 | 1 | the **tier-1 states**, each from Cliopatria: Shang (3 steps), Achaemenid Empire (13; gr-381, wh-301), Bosporan Kingdom ("Cimmerian Bosporus", 7), Empire of Japan (27, 1868–1945), Nanyue (4), Ptolemaic Egypt (26), Macedon (the Argead "Macedonian Empire" → "Antigonid Dynasty" → "Antigonid Macedonia", 39 steps, 675–165 BCE; gr-770), Graeco-Bactria (7), Mongol Empire (12, 1206–1293; wh-594, ru-091), Aztec (12), Inca (8), Volga Bulgaria (4), Kievan Rus' ("Rus'" → "Kievan Rus'", 16). Where one of them is also a war side the side was linked in the same pass: the Achaemenids in wh-310, wh-319 and gr-383, the Shang in cnh-103, Macedon in wh-310, gr-755, rm-240 and rm-249. 15 series, 44 links; consecutive rows identical after simplification are now joined by the builder. Screenshots at 500 BCE (the Achaemenids, Egypt included) and 1250 (the Mongols) checked by eye. ru-091's card runs past 1293, where Cliopatria's "Mongol Empire" ends; its later years fall back to the authored polygon (the Golden Horde is a series of its own, 1294–1695, not yet linked). `test-polities.js` 239/0 |
| 2026-10-01 | 0 | the plumbing in §5 built and piloted on **Rome** (Cliopatria's Roman Republic, Roman Empire and Western Roman Empire, 123 steps, 500 BCE–475 CE) and **Carthage** (29 steps, 650–146 BCE): 24 card links — rm-182's extent and both sides of every Roman and Carthaginian war that is not a grouping war. Screenshots at 260, 215 and 140 BCE checked by eye: Rome holds the peninsula in 260 and the islands by 215, Carthage holds Spain in 215, and nothing is drawn in 140, the last Punic war having ended in 146. `test-polities.js` 134/0 |
| 2026-10-01 | — | audit and plan written; nothing built. The evidence behind §3–§4 is kept as three research notes: 📖 `docs/atlas-borders-cliopatria.md` (every entity matched row by row), `docs/atlas-borders-states-wars.md` (the source catalogue and OHM's holdings), `docs/atlas-borders-cultures.md` (the cultures' sources) — read the one a batch needs, by grepping for the entity |
