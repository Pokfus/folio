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

The research behind it was done on 2026-10-01 by matching every entity against two datasets downloaded
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

Licence key, for a public site that ships its data files: **OK** = CC0, public domain, CC BY (credit
required). **SA** = CC BY-SA or ODbL: usable, but the derived DATA FILE must carry the same licence and
credit (not the site). **NC** = non-commercial: do not ship. **closed** = all rights reserved, paid or "no
redistribution": a cited reference for independent tracing at most.

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
| **Newberry AHCB** US states and territories | 1783–2000, day-dated | day | conflicting (metadata NC-SA; OHM import says CC0) | take it through OHM's import |
| **Shepherd, *Historical Atlas*** (1923/1926), UT Austin PCL | plates: Persian Empire c. 500 BCE, Athenian Empire c. 450, Greece 431 and 362 BCE, Rome in Italy, Rome and Carthage 218 BCE, France 1328/1453, Europe 1000/1097/1190/1360, Italy 1494, Kievan Rus' | plate per date | **public domain** | tracing base for tier 3 |
| **Atlas of the World Battle Fronts in Semimonthly Phases** (US Army, 1945) | WW2 fronts, Europe and Pacific incl. China | fortnightly, Jul 1943 – Aug 1945 | **public domain** | fronts, traced |
| **Pleiades** gazetteer | ~40k ancient places | attestation periods | CC BY 3.0 | points to build coalitions from member lists |
| CShapes 2.0 (ETH Zürich) | states 1886–2019, day-dated | day | **NC-SA — do not ship** | cross-check OHM's change dates only |
| CHGIS (Harvard/Fudan) | China, 221 BCE–1911 | yearly | **no redistribution** | reference only; nothing before 221 BCE |
| Euratlas, GeaCron | Europe / world | 100 years / yearly | **paid / proprietary** | not recommended; GeaCron is the only annual world set and would need a negotiated licence |
| Stanford "Building the New Order" | Europe 1938–44 | monthly | all rights reserved; download dead | none |

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
| 1886 – 2010 | **2** | OHM yearly (CC0), cross-checked against CShapes' change dates | a pipeline rather than a polygon: cut OHM's `admin_level=2` set at 1 January of each year; fall back to the current snapshot where OHM has a hole (USSR 1922–48 was not found by name) |
| 1700 – 1886 | **2** | OHM (≈190 countries alive in any year) | Europe from 1648 and East Asia are dense; colonial Africa and the Americas are partial |
| 1500 – 1700 | **3** | OHM where present; otherwise the existing snapshots | no open yearly world set; GeaCron would need a licence |
| 1783 – 2000, United States | **1** | Newberry AHCB through OHM | day-dated states and territories |

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

*(Filled in from the cultures survey below.)*

### 4.D Wars

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
| us-072 | Northwest Indian War | United States — Cl 5, AHCB | Western Confederacy — none | **2** | the Confederacy's lands = the Ohio country minus the Royce cessions (PD), by treaty date |
| us-071 | Sullivan Expedition | United States | Seneca and Cayuga — Cl "Haudenosaunee" 1 | **2** | split the Haudenosaunee shape to the two nations from a cited map |
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

**Counts.** States: tier 1 — 14, tier 2 — 4, tier 4 — 1. War cards: tier 1 — 30, tier 2 — 13, tier 3 —
12 (fronts and occupations, where wanted, are tier 3 on top). Cultures: see §4.C.

---

## 5. The plumbing every tier needs first (batch 0)

None of the tiers can be delivered with today's data format: a locator `area` and a war side's `area`
are one polygon with no time dimension. One addition makes every tier possible and leaves every card
that is never upgraded exactly as it is:

- **A lazy dated-polity bundle**, e.g. `polities.js` registered in `DATA_BUNDLES` (never on the eager
  path — 📖 `docs/eager-path.md`): `window.POLITIES = { "<slug>": { name, src, steps: [{ from, to, p:
  [rings] }] } }`, generated by a `.claude/build-polities.js` from Cliopatria / OHM extracts, simplified
  topology-preservingly (`build-era.js`'s rule — never per-ring Douglas–Peucker), with each step's source
  recorded.
- **A card names a polity instead of carrying a polygon**: `locator.polity: "<slug>"` and, on a war side,
  `polity: ["<slug>", …]` (a side is a LIST — Rome plus its allies, the six Warring States). The authored
  `area` stays as the fallback for a year no step covers and for any reader whose bundle has not loaded.
- **The draw path resolves the step for the year on the rail**: `drawMineAreas` and `mineWarShapes` look
  the slug up, pick the step with `from ≤ year ≤ to`, and cache on the step, not the year (the
  `mineWarShapes` rule). That is the whole of "borders that change as the slider moves".
- **One series per polity, shared**: Rome's 26 war cards resolve against one `rome` series; the seven
  shapes they carry today go.
- **Credit**: Cliopatria is CC BY 4.0, so the Atlas needs a visible credit line and a licence link
  (the help card or a sources fold), and the bundle's header must say what was changed (simplified,
  clipped). OHM is CC0 but its `source:url` is kept in the build notes.
- **A guard**: a test that every `polity` slug a card names exists in the bundle, and that a stepped
  shape actually changes between two years of one card (the failure that looks like success).

---

## 6. The batches

In the order that buys the most per batch. Each batch: build, check two years per entity in a screenshot
against the cited source, run `test-personal-atlas.js` and `test-war-cards.js`, record in §7.

| batch | what | entities | cards touched |
|---|---|---|---|
| **0** | the plumbing in §5, piloted on **Rome and Carthage** | 2 series | 32 (26 Roman wars, 5 Carthaginian, rm-182) |
| **1** | tier-1 states | B2, B3, B5, B6, B9–B12, B14–B16, B18, B19 | 15 |
| **2** | tier-1 war sides not already built | Macedon, Seleucid, Pontus, Numidia, Achaean/Aetolian Leagues, Lydia, the seven Warring States, Han, Xiongnu, Jin, Wu, Rashidun, Byzantium, Sasanians, Normandy, England, France | ~20 war cards |
| **3** | WW2-era sides by date | Allies/Axis membership by entry/exit date over yearly OHM/Cl borders; Italy, Ethiopia, Finland, USSR, Mongolia, China | ww2-001, 042, 096, 100, 159 |
| **4** | tier-1 and tier-2 peoples and cultures | see §4.C | — |
| **5** | tier-2 assembly | B1, B8, B13, B17; the Messenian, Samnite, Etruscan, Illyrian, Spanish and US wars | ~20 |
| **6** | tier-3 tracing from public-domain plates and cited maps | Athens' empire, the Hellenic League, the Lamian coalition, Italic and Gallic and Iberian peoples, Zhou homeland, Hundred Years' War check | ~15 |
| **7** | the era maps by year | the OHM pipeline in §4.A, 1886→2010 first, then 1700→1886 | every geography card |
| **8** | tier 4–5: soft outlines and honest silence | B7 and the cultures so rated | — |

**Open questions for the owner before batch 0** (each changes what gets built):

1. **The historical-basemaps licence** (§3). Ask before shipping anything new derived from it.
2. **Polity, or people?** Cliopatria treats the Avar, Khazar and Hunnic khaganates, Gothia, the Magyars
   in Etelköz and the Cuman–Kipchak confederation as polities with borders, and Folio's cards tag them
   `people` — so they are drawn as a blue wash. Importing a bordered series for them argues for retagging
   them `state` (drawn as a country). That is an editorial call per card.
3. **Wars drawn as fronts, or as the two sides' territory?** Every source above gives territory. Front
   lines exist openly only for 1943–45 (traced). The default here is territory.

---

## 7. Ledger

| date | batch | what was done |
|---|---|---|
| 2026-10-01 | — | audit and plan written; nothing built |
