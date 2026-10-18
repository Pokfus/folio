# Atlas v2 border audit — is every polity's seat inside its faces? (2026-10-16; the Roman Kingdom corrected 2026-10-18, §7)

Owner feedback: *the earliest borders of the Roman Kingdom do not include Rome.* This page answers it (§1), audits every
card-linked polity the same way (§2), says what the build itself got wrong and what was fixed in the pipeline (§3), lists the
faults that are the SOURCE's and need the owner's decision (§4), and describes the rule that now holds the line (§5).

Tools: `.claude/atlas-build/lib/seats.js` (the seats and the test), `audit-seats.js` (the audit and its cause classes; needs
Cliopatria), `seats-known.json` (the list `check-history.js` reads). Re-run the audit after any rebuild of `history.bin`:

    node .claude/atlas-build/audit-seats.js --write-known --write-doc

## 1. The Roman Kingdom: Cliopatria's own geometry first, then the build made it worse

**The source.** Cliopatria v0.2.0 has one polygon for the Roman Kingdom, `Name = "Roman Kingdom"`, Wikidata Q201038, rows 750–701,
700–501 and 500–481 BCE, all the **same five-vertex polygon, 859 km²**: (12.131, 41.911) (12.448, 41.782) (12.452, 42.106)
(11.973, 42.106) (12.131, 41.976). Its east edge runs along 12.45° E; Wikidata's Rome (12.4828, 41.8931, the point `state-capitals`
carries for card `rm-046`) lies **2.77 km east of that edge — outside the source polygon**. The raw Etruscans polygon of 750 BCE
(a 34-vertex ring that shares the Kingdom's corner at 12.452, 42.106) **contains Rome** (inside, 6.3 km from its own edge). So in
the source the city is not the Kingdom's and, for the first century, is the Etruscans'.

**The build.** The committed `history.bin` made it worse, by two rules of `build-history.js`:

| | Rome's distance from the Roman Kingdom's face | |
|---|---|---|
| Cliopatria's raw polygon (any year 750–481 BCE) | **2.77 km outside** | the source fault |
| committed `history.bin`, 750–551 BCE (face 52) | **6.86 km** | D1 coast snap |
| committed `history.bin`, 550–481 BCE (faces 92, 105) | **6.48 km** | D1 coast snap |
| rebuilt, 750–551 BCE | 6.86 km | overlap with the Etruscans (below) |
| rebuilt, 550–481 BCE | **2.76 km** | = the source |

*D1 (vertex → OSM coast, up to 15 km) took two corners of a polygon 29 km across by 12.4 km (the south-east corner, 12.448/41.782 →
12.350/41.698) and 8.8 km (the north-west one) onto the coast.* The east edge, which stood at 12.45° E, became a diagonal from (12.452,
42.106) to (12.350, 41.698); at Rome's latitude it is 4.1 km farther west. The 750–551 BCE step keeps 6.86 km after the fix because a
second thing happens to it: the Kingdom's east wedge lies inside Cliopatria's Etruscan polygon too, the overlap is under the 120 km²
`SLIVER_KM2`, and the sliver rule gives an overlap that small to the neighbour with the longest shared edge — the Etruscans. That is
by design (an overlap is drawn once) and Cliopatria's overlap is the cause; nothing in the pipeline is wrong there.

**Verdict.** The root cause is **Cliopatria's geometry** (class *source*): even drawn exactly as Cliopatria draws it, Rome is 2.77 km
outside, beyond the 2 km the rule allows. The build added 4.1 km of its own (class *snap*, fixed in §3 for 550–481 BCE). The
**remedy that needs the owner's decision** is in §4 — **decided 2026-10-18: a narrow, documented correction of the row in the build, §7.**
The table above is the state before it; the Kingdom's row in §2's generated table is gone since.

## 2. The audit

**A seat** is where a state sat, by two named sources and nothing else (a seat is never moved to fit a border):

* its **capital in the registry** — the Wikidata P36 statements of `frozen/state-capitals.json`, carried in `history.bin`'s header as
  `cities`, true for their dated range (117 statements over 77 polities); else
* **the card's own place** — the `at` of a map card whose polity-spec link names exactly one series, at each year the card dates
  itself, and only for a polity the registry holds no capital for (142 card-year facts over 37 polities). A locator's `at` is the
  place the card is *about*, so these are advisory evidence of a poorer kind than a capital; they are audited and listed like the
  rest, and the cause column says which source the seat came from.

**The test**, at every step of a polity (the face is constant across a step): the seat lies inside the step's face — or inside a
contested or nested face the polity is a partner of in those years — or within **2 km** of its edge (finest level). Peoples,
cultures, authored extents and fronts are presences, not territories, and have no seat; only `polity` entities that have a card are
audited. **Coverage, stated plainly: 114 of the 157 card-linked polities have a seat and are audited; 43 have none** — they are polities
that appear on the cards only as war sides, with no Wikidata capital statement and no single-polity map card to take a place from
(israel, judah, peloponnesian_league, han_state, wei, zhao, athenian_league, athenian_coalition, aetolian_league, pontus, achaean_league,
illyria, xiongnu, numidia, venice, papal_states, normandy, england, france, genoa, pisa, florence, savoy, milan, usa, italy, italian_africa,
ethiopia, roc, finland, austria_1918, czechoslovakia, estonia_1918, hungary_1918, lithuania_1918, poland_1918, latvia_1918, ussr,
mongolia_pr, ccp, british_raj, south_africa, yugoslavia). I did not invent seats for them; giving them capital statements (Wikidata P36,
CC0, through `state-capitals-spec.json`) is the way to bring them under the rule.


**The causes**, decided against the raw Cliopatria row of the series (its polygon before any conflation):

| class | meaning |
|---|---|
| **source** | the raw row itself leaves the seat more than 2 km outside (Cliopatria's geometry or dating). Not drawn by hand, not bent here: listed in §4. |
| **clip** | the raw row holds the seat but the seat is on the sea side of the present OSM coast, so a land-only face cannot. |
| **snap** | the raw row holds the seat, the seat is on land, and the built face does not: a D1/D2/D3 snap carried the edge across it, or collapsed the ring. |
| **other** | none of those: here, a seat *statement* read outside its own dates (one argued override in `audit-seats.js`). |

`build adds` in the table is how many km farther the built edge is than the raw one: a source fault that the build also aggravated.

<!-- generated:begin (audit-seats.js --write-doc; do not edit by hand) -->

**259 seats** (117 capital statements, 142 card-place years) over the card-linked polities; **118 (polity, seat, step) rows fail**, which is **49 entries over 38 polities** once steps are merged into year intervals.

| cause | entries | rows |
|---|---|---|
| source | 48 | 114 |
| clip | 0 | 0 |
| snap | 0 | 0 |
| other | 1 | 4 |

| polity | seat (source, card) | years | built km from the face | raw km from the row | cause | note |
|---|---|---|---|---|---|---|
| abbasid | Baghdad (capital, wh-469) | 947 CE–969 CE | 186.1 | 186.1 | source | the raw row leaves it 186.1 km outside |
| aztec | Tenochtitlan (capital, wh-605) | 1429 CE–1439 CE | 6.4 | 6.4 | source | the raw row leaves it 6.4 km outside |
| baekje | Wiryeseong (capital, jp-054) | 476 CE–660 CE | 63.4 | 63.5 | source | the raw row leaves it 63.5 km outside |
| byzantium | Constantinople (capital, wh-436) | 674 CE–681 CE, 1206 CE–1226 CE | 2.6–435.7 | 6.2 | source | the raw row leaves it 6.2 km outside; **the build adds 7.1 km** |
| chola | Puhar (capital, wh-547) | 850 CE–897 CE, 1241 CE–1259 CE | 15.2–291.7 | 2.8 | source | the raw row leaves it 79.7 km outside; **the build adds 12.4 km** |
| fatimid | Cairo (capital, wh-478) | 1169 CE–1171 CE | 856.5 | 857.6 | source | the raw row leaves it 857.6 km outside |
| georgia | Kutaisi (capital, wh-454) | 1085 CE–1098 CE | 27.2 | 27.1 | source | the raw row leaves it 27.1 km outside; the point lies in seljuk |
| georgia | Tbilisi (capital, wh-454) | 1122 CE–1125 CE, 1236 CE–1240 CE, 1395 CE–1414 CE | 4.0–58.4 | 4.0 | source | the raw row leaves it 4.0 km outside; the point lies in seljuk, mongol |
| golden_horde | Golden Horde (card, wh-598) | 1332 CE, 1334 CE, 1341 CE | 5.1 | 5.1 | source | the raw row leaves it 5.1 km outside; the point lies in genoa |
| han | Chang'an (capital, cnh-213) | 6 CE–9 CE | 763.8 | 763.8 | source | the raw row leaves it 763.8 km outside; the point lies in xin |
| han | Xuchang (capital, cnh-213) | 197 CE–220 CE | 58.4–260.1 | 58.5 | source | the raw row leaves it 58.5 km outside |
| inca | Cusco (capital, wh-612) | 1440 CE–1449 CE, 1540 CE–1571 CE | 7.2–121.8 | 7.2 | source | the raw row leaves it 7.2 km outside; the point lies in spanish_empire |
| indo_greeks | Alexandria on the Caucasus (capital, gr-784) | 111 BCE–79 BCE, 51 BCE–13 CE | 166.0–443.4 | 166.0 | source | the raw row leaves it 166.0 km outside |
| jin_state | Jin (card, cnh-153) | 679 BCE | 40.0 | 40.1 | source | the raw row leaves it 40.1 km outside |
| kanem_bornu | Kanem-Bornu (card, wh-573) | 1242 CE, 1252 CE | 312.5 | 312.5 | source | the raw row leaves it 312.5 km outside |
| makuria | Old Dongola (capital, wh-585) | 347 CE–1278 CE, 1294 CE–1414 CE | 38.0 | 38.0 | source | the raw row leaves it 38.0 km outside |
| malacca | Malacca (capital, wh-565) | 1459 CE–1511 CE | 108.0 | 102.2 | source | the raw row leaves it 102.2 km outside; **the build adds 5.8 km** |
| mamluk_egypt | Cairo (capital, wh-485) | 1241 CE–1249 CE | 345.9 | 348.7 | source | the raw row leaves it 348.7 km outside |
| maratha | Maratha Empire (card, wh-707) | 1719 CE | 66.3 | 66.3 | source | the raw row leaves it 66.3 km outside; the point lies in mughal |
| mughal | Agra (capital, wh-699) | 1540 CE | 440.8 | 440.8 | source | the raw row leaves it 440.8 km outside |
| mughal | Old Delhi (capital, wh-699) | 1741 CE–1743 CE | 30.0 | 29.9 | source | the raw row leaves it 29.9 km outside |
| northern_wei | Pingcheng (capital, cnh-330) | 402 CE–533 CE | 48.7 | 48.7 | source | the raw row leaves it 48.7 km outside |
| ottoman | Constantinople (capital, wh-687) | 1919 CE–1922 CE | 27.6–40.8 | 27.4 | source | the raw row leaves it 27.4 km outside |
| ottoman | Didymoteicho (capital, wh-687) | 1361 CE–1363 CE | 67.6–107.4 | 67.6 | source | the raw row leaves it 111.5 km outside; the point lies in byzantium |
| ottoman | Edirne (capital, wh-687) | 1365 CE–1374 CE | 98.8 | 98.8 | source | the raw row leaves it 98.8 km outside; the point lies in byzantium |
| pagan | Bagan (capital, wh-558) | 850 CE–859 CE | 6.1 | 6.1 | source | the raw row leaves it 6.1 km outside |
| portuguese_empire | Lisbon (capital, wh-675) | 1582 CE–1639 CE | 5529.0–7410.8 | 5526.5 | source | the raw row leaves it 7403.8 km outside; the point lies in spanish_empire; **the build adds 2.5 km** |
| ptolemaic | Alexandria (capital, gr-767) | 171 BCE–166 BCE | 6.3 | 14.0 | source | the raw row leaves it 14.0 km outside; the point lies in seleucid |
| qin | Xianyang (capital, cnh-191) | 751 BCE–352 BCE | 11.8–51.5 | 11.4 | other | the Xianyang row of the Qin-dynasty card (cnh-191) has no start or end qualifier and is read across the whole series (750 BCE on), while the dated Wikidata statement for the Qin state (cnh-155) reads 350–221 BCE: before 350 BCE the registry itself does not say Xianyang was Qin's seat |
| qin | Xianyang (capital, cnh-191) | 351 BCE–317 BCE | 51.5 | 51.5 | source | the raw row leaves it 51.5 km outside |
| qing | Beijing (capital, wh-716) | 1644 CE | 99.5 | 99.5 | source | the raw row leaves it 99.5 km outside; the point lies in ming |
| qing | Mukden (capital, wh-716) | 1625 CE, 1900 CE–1904 CE | 39.0–155.5 | 39.1 | source | the raw row leaves it 39.1 km outside; the point lies in ming |
| rome | Milan (capital, wh-358) | 402 CE | 18.1 | 17.9 | source | the raw row leaves it 17.9 km outside |
| rome | Rome (capital, rm-091) | 481 BCE–339 BCE, 407 CE–413 CE, 455 CE–457 CE | 2.8–23.6 | 2.8 | source | the raw row leaves it 2.8 km outside |
| rus | Kyiv (capital, ru-036) | 1236 CE–1240 CE | 711.8 | 711.1 | source | the raw row leaves it 711.1 km outside |
| sasanian | Sasanian Empire (card, rm-553) | 224 CE | 347.8 | 347.7 | source | the raw row leaves it 347.7 km outside |
| seleucid | Antioch (capital, gr-769) | 240 BCE–220 BCE | 25.2 | 25.2 | source | the raw row leaves it 25.2 km outside; the point lies in ptolemaic |
| song_state | Song (card, cnh-157) | 639 BCE–638 BCE | 4.0 | 4.0 | source | the raw row leaves it 4.0 km outside; the point lies in chu |
| songhai | Gao (capital, wh-572) | 1595 CE–1608 CE | 387.8–388.7 | 387.8 | source | the raw row leaves it 388.7 km outside |
| spanish_empire | Madrid (capital, wh-674) | 1809 CE–1811 CE | 78.6–83.2 | 78.6 | source | the raw row leaves it 83.2 km outside |
| sui | Chang'an (capital, wh-521) | 623 CE–627 CE | 176.6–392.2 | 176.6 | source | the raw row leaves it 176.6 km outside; the point lies in tang |
| sumer | Sumer (card, wh-172) | 2005 BCE | 109.9 | 110.0 | source | the raw row leaves it 110.0 km outside |
| vladimir_suzdal | Vladimir-Suzdal (card, ru-079) | 1108 CE, 1157 CE, 1238 CE | 10.3 | 10.3 | source | the raw row leaves it 10.3 km outside; the point lies in rus |
| western_jin | Eastern Jin (card, cnh-313) | 317 CE–318 CE | 130.6 | 131.0 | source | the raw row leaves it 131.0 km outside; the point lies in han_zhao |
| western_jin | Jin dynasty (card, cnh-293) | 316 CE–317 CE | 125.5 | 125.9 | source | the raw row leaves it 125.9 km outside; the point lies in han_zhao |
| yan | Yan (card, ko-056) | 301 BCE | 46.4 | 46.4 | source | the raw row leaves it 46.4 km outside |
| zhou | Eastern Zhou (card, wh-396) | 404 BCE | 31.0 | 30.9 | source | the raw row leaves it 30.9 km outside; the point lies in han_state |
| zhou | Western Zhou (card, wh-251) | 842 BCE, 772 BCE | 45.5 | 45.0 | source | the raw row leaves it 45.0 km outside |
| zhou | Zhou dynasty (card, cnh-111) | 772 BCE–771 BCE | 45.5 | 45.0 | source | the raw row leaves it 45.0 km outside |

<!-- generated:end -->

## 3. What the pipeline got wrong, and the fix

The audit found **one** conflation fault where the raw row holds the seat and the build loses it — and one family behind it:

* **Carthage, 650–631 BCE.** Cliopatria's Carthage row has a second ring, a 7 km square (10.228–10.306 E, 36.868–36.933 N) 1.4 km from
  the seat (Wikidata's Carthage, 10.3129, 36.847). **All four corners were within D1 of the coast (2.9, 8.0, 2.2 and 1.2 km) and
  snapped onto it, so the ring collapsed to a line and the city vanished from the Kingdom of its own name**; the seat sat 4.5 km from
  what was left. (Found by `DEBUG_POINT` on the square's centre: the row's second line is `4v/4coast`.)
* **The family:** D1 reaches 15 km, D2 8 km, which fits a polygon hundreds of km across and ruins one 30 km across. The Roman Kingdom
  lost 4.1 km to it (§1); Chola's Puhar (1241–59 CE) 12.4 km, Byzantium's Constantinople 7.1 km, Malacca 5.8 km, Lisbon 4.2 km — all
  of those were already outside the source, so the audit still files them as *source*, but the build made each worse.

**The fix, in `build-history.js` (`RING_SNAP_FRAC = 0.2`, `SMALL_RING_M = 40000`).** A vertex of a **small ring** — scale (√area) under
40 km, a polygon of under 1,600 km² — may travel to the coast (D1), a present-day border (D3) or a neighbour's line (D2) no farther than
**one fifth of that scale**; a hole takes its parent's scale. A vertex over the cap stays where the source put it; the land clip and the
sea-chord rule treat it as they treat any vertex farther than D1 from the coast. Rings of 40 km and over, the presence layer (peoples,
cultures) and the Second World War fronts are untouched. (Two wider versions were built and measured: a cap on every ring refused
51,000 snaps and a 60 km cutoff changed the same overlaps; neither improved the audit, and the wider one recoloured nothing less.)

| | before | after |
|---|---|---|
| D1 snaps (vertex → coast) | 1,008,668 | 970,274 (**45,388** vertex visits refused by the cap) |
| D2 / D3 snaps | 3,961 / 21,678 | 3,879 / 21,691 (3,005 / 46 refused) |
| `history.bin` | 9,096,400 bytes | 9,125,408 bytes (§3.1) |
| seat failures: entries (rows) | 50 (118) | 50 (121) |
| Carthage 650–631 BCE | 4.5 km, ring gone | holds (1.3 km from the edge) |
| Roman Kingdom 550–481 BCE | 6.48 km | 2.76 km (= the source) |
| Rome, Roman Republic 480–338 BCE | 5.8 km | 2.8 km (= the source) |

**What the cap costs, said plainly.** Two coastal seats were inside 2 km only because the old 15 km snap pulled a coarse polygon onto the
coast: Byzantium's Constantinople in 674–681 CE (now 2.6 km; the raw row is 6.2 km out) and the Golden Horde's card place in 1332/34/41 CE
(now 5.1 km = the raw row). They are *source* faults the old snap had been hiding; they are now listed as such. I judged an honest raw edge
better than a seat rescued by a 12 km move of a corner, but it is a trade, and the cap is one constant if the owner weighs it differently.

**What else it changed, and why a test moved.** The cap also restores Cliopatria's other small city squares the snap had dropped — three
4-vertex squares 7 km across in the Mongol Empire of 1245 (two side by side at 53.0–53.2° E 45.9–46.0° N, one at 29.6° E 45.4° N).
`test-atlas-review.js` counts "pixels in runs beyond the fill's tone" at that view; each square is a pixel or two of border ink at 6 km/px
(15 pixels in all), so its ceiling went from 8 to 24 with the reason written beside it. A fold is hundreds of pixels long.

### 3.1 Size, entities, colours and files

`history.bin` is **9,096,400 → 9,125,408 bytes** (+29,008, +0.32 %). The entity table gains three contested overlap entities
(233 → 236: Pergamon with Rome 164–127 BCE, Byzantium with the Ottomans and Venice 1463–67, Italy with Japan and the Republic of China
1930–31) and the steps go 3,159 → 3,181: a small polygon that keeps its corners overlaps its neighbours, and three overlaps now clear the
120 km² sliver bar. **Consequence a reader can see: the Atlas gives each polity a colour slot from its index in the entity table
(`assignSlots`, `atlas.js`), and the contested entities are interleaved in that table, so 182 of 233 indices shifted and most polities
changed hue** (the Mongol Empire of 1245 went from teal to olive, the USSR of 1942 from a hue that left Moscow green under the front tint to one
that left it grey). The map is as correct as before — a polity's colour has no meaning — but `test-atlas-render.js` pinned that Moscow
pixel's hue and now judges the front tint against the same ground with the front off. Any rebuild that adds or removes a contested entity does this;
making the slot independent of the table order would stop it for good and is not done here.
Everything derived was regenerated with the repo's scripts (`build-war-slice.js`, `build-wars.js` (unchanged), `build-polity-index.js`
(unchanged), the `file://` twins); the land, water and relief files are byte-identical.

## 4. Source faults that need the owner's decision

I drew nothing by hand. Every *source* row above is Cliopatria's: its row leaves a Wikidata capital (or a card's own place) more than 2 km
outside, or gives the seat to another polity's overlapping row. Two kinds, with the smallest sourced remedy for each:

1. **The Roman Kingdom (the owner's report; 270 years).** Cliopatria v0.2.0 has no other polygon for it. Options, smallest first:
   * **(a) upstream correction.** Report the five-vertex polygon and Rome's coordinates to Cliopatria
     (github.com/Seshat-Global-History-Databank/cliopatria; CC BY 4.0, which also allows adapting the row with attribution). I could
     not check whether an issue already exists: that repository is outside this session's scope.
   * **(b) a dated override from a licence-checked source.** OpenHistoricalMap has a relation for it — **`relation/2849407`, "Regnum
     Romanum", Wikidata Q201038, 630–509 BCE, CC0** (OHM's data licence; the repo already pins another OHM relation as `ohm-lacedaemon`).
     Its outline (bbox 12.18–12.54 E, 41.69–41.91 N) **contains Rome, 1.9 km inside its edge**. But OHM's own relation carries
     `fixme:s = needs source for boundary lines`, so it would replace one unsourced outline with another; it starts in 630 BCE, not
     Cliopatria's 750; and the Etruscan row would still overlap it. I would not adopt it without a citation for the outline.
   * **(c) change nothing and state the limit** on the page (the two Roman Kingdom cards `rm-046` and `wh-339` would then have a map whose
     city lies 2.8 km outside the kingdom's outline).

   Recommendation: **(a) now, (c) meanwhile**; take (b) only if the owner accepts an unsourced-outline relation with its `fixme` shown.
   **Decision (2026-10-18): (a), in a narrow form — the row is corrected in the build by a dated, verified geometry fix labelled as Folio's
   adaptation of CC BY data, and the upstream issue is written (§7.1). §7 has the fix, its evidence and its numbers.** The other 48 entries
   below are untouched by it.
2. **The other 48 source entries** (table above). They fall into two groups: a seat that lies in *another polity's* row where Cliopatria
   overlaps or hands over territory (Tbilisi under the Seljuks, Didymoteicho and Edirne under Byzantium, Lisbon during the Iberian Union,
   Beijing in 1644 under the Ming …: 20 entries), and a seat that no polity's row holds (29 entries; 2.6 km (Byzantium, 674–81) to 856 km
   (Cairo, Fatimids, 1169–71)). In some of them the disagreement may be the capital statement's dates against Cliopatria's span for the polity rather than a border drawn
   wrongly (the Qin dynasty's Xianyang before 350 BCE is the one I could argue from the registry's own data, and is classed *other*); I
   have not judged the rest one by one, and say so. Smallest remedy: an upstream issue per polity with the row, the year and the seat; where a polity's Wikidata statement is the doubtful
   half, correct `state-capitals-spec.json`'s `drop`/`label` or the card, not the border. None of these is mine to settle without the
   owner, and moving a seat to fit a border is exactly what the brief forbids.

## 5. The rule that holds the line

`check-history.js` now has a **seats** rule: every card-linked polity's seat is inside its faces or within 2 km of their edge at every step,
except the (polity, seat, years) listed in `seats-known.json` with their cause. It fails on a seat/year that is not listed (a regression)
and on a listed entry that no longer fails (stale — remove it with `audit-seats.js --write-known`). It needs no raw source in CI; the
cause is decided when the list is written, by `audit-seats.js`, which does.

The older capital check (`KNOWN_CAPITAL_FAULTS`) reads a capital's first, middle and last year; this one reads every step and every
polity, and adds the card's own place.

## 6. Limits

* A seat is a point; a capital that moved within a year is read at the statement's own dates.
* The card's own place is the card's subject, not always a seat (a locator `at` for a polity with no capital); the table says which.
* The audit tests the polity's face, not its border to the sea: a seat in a lagoon or on a one-vertex island is judged by the face the
  build draws, which is land only.
* Cliopatria's span of a series and a capital statement's dates are independent; where they disagree the failure is the *source* class by
  the audit's definition, not necessarily Cliopatria's fault (§4).

## 7. The correction of 2026-10-18: the Roman Kingdom's polygon, adapted

**The decision.** The owner took option (a) of §4 in a narrow form: Cliopatria's row is corrected in the build, for the Roman Kingdom
ONLY, by a dated, documented geometry fix that the build verifies on every run — and the upstream issue is written (below) rather than
the row left as it was. Nothing else of §4 is touched: the other 48 *source* entries stand in `seats-known.json` as before, and no seat
was moved to fit a border.

**The override.** `.claude/atlas-build/geometry-fixes.json` (read by `build-history.js` in `prepareRow`, where the row is read, exactly
where `polity-qids.json`'s QID fixes are applied) replaces the polygon of every Cliopatria row named `Roman Kingdom` (750–701, 700–501 and
500–481 BCE, the same five-vertex ring) with the same ring **opened east around Rome by a notch 5.8 km wide and 6.0 km tall**: the east
edge, which ran along 12.45° E, now runs (12.4482, 41.7816) → (12.4491, 41.866) → (12.519, 41.866) → (12.519, 41.92) → (12.4497, 41.92) →
(12.4517, 42.1063). Every source vertex is kept; four are added; the three new sides are each 3.0 km from Rome's point. It is the
smallest edit that meets the brief (the seat at least 2 km inside at every step, the area within 15 % of the source's): moving the whole
east edge past the city adds 24 % of area, moving the south-east corner alone 15–19 % for 2–3 km inside.

| | the source's ring | the corrected ring |
|---|---|---|
| vertices | 5 | 9 |
| area (planar, at the ring's mean latitude) | 857.7 km² | 892.6 km² (**+4.1 %**) |
| Rome (12.4828, 41.8931) | 2.77 km **outside** | 2.99 km **inside** (east, north and south sides 3.0 km) |

**Where the build enforces it.** The fix carries the source's ring as `from`: if a later Cliopatria version changes the row, the
ring no longer matches and the build stops (a stale fix is a silent fault, as a stale QID fix is). Before the corrected ring is used the
build checks it — the point `check.point` at least `minInsideM` (2 km) inside and the area within `maxAreaChange` (15 %) of the source's —
and fails otherwise; a fix that matches no row fails the build too. `out/history-report.json` `geometryFixes` records the rows it
touched, the areas, the inside distance and how often it prevailed (next paragraph).

**The 750–551 BCE step, handled explicitly.** Cliopatria's Etruscans ring of those years contains Rome (§1), so the corrected polygon
overlaps it around the city. Before the fix the overlap — the Kingdom's east wedge, 91.6 km² on the raw rings — was under `SLIVER_KM2`
(120 km²) and the sliver rule gave it to the claimant with the longest shared edge, the Etruscans (and the D2 snap had laid the
Kingdom's east edge on the Etruscan line, so nothing of the wedge was left to argue about). With the notch the raw overlap is 126.2 km²,
over the sliver bar, which would have made Rome's surroundings a *contested* face of the two. The fix's `over: ["etruscans"]` settles
it in the labelling, before the sliver and the contested rules: **a piece claimed by the Kingdom's corrected row and by the Etruscan row
is the Kingdom's** (as built, one piece of 140 km² in each epoch: the whole overlap, between the Etruscan line and the Kingdom's east boundary). And a corrected ring's own vertices are exempt from the D2 neighbour snap (D1 and D3 apply as to any
ring): the first build of the fix let D2 carry the notch's south-west corner 4.1 km west onto the Etruscan line, which tilted the notch's
south side (Rome 2.75 km inside instead of 2.99) and left a spike of the wedge below it; the correction is the authority where the two
rows meet, and `over` decides the overlap. The land that changes hands is land Cliopatria itself draws as the
Kingdom's, plus the notch; the Etruscan row is the one whose overlap the correction exists to undo. The rule is the fix's own, not a
general one: no other pair of rows is affected (7 pieces over the whole build, one in each of the seven epochs of 750–551 BCE, every one the Kingdom's against the Etruscans, 978 km² in all; and 118 D2 snaps of the corrected ring's own vertices refused, none elsewhere — `out/history-report.json` `geometryFixes`).

**Built, measured** (`history.bin` after `build-history.js --no-cache --install`; the face at the finest level, `lib/seats.js`'s test;
the faces' areas are larger than the ring's because the coast run and the D2 snaps are the face's, not the source's):

| step | before: Rome from the face | before: face km² | after: Rome from the face | after: face km² | Rome held by |
|---|---|---|---|---|---|
| 750–551 BCE (face 52) | 6.86 km **outside** | 886.9 | **2.99 km inside** | 1026.7 | the Roman Kingdom alone (was the Etruscans) |
| 550–501 BCE (face 92) | 2.76 km outside | 991.9 | **2.99 km inside** | 1026.6 | the Roman Kingdom alone (was nobody: unmapped land) |
| 500–481 BCE (face 105) | 2.76 km outside | 991.8 | **2.99 km inside** | 1026.5 | the Roman Kingdom alone (was nobody) |

The face is now the same shape at every step (the three areas differ by a coast vertex or two), and Rome's 2.99 km is the ring's own:
no snap moves the notch.

`check-history.js`'s **seats** rule passes for the Roman Kingdom with no listed exception: its entry is gone from `seats-known.json`
(`audit-seats.js --write-known`: 49 entries over 38 polities, 48 *source* and 1 *other*, against 50 over 39 before; nothing else in the list moved), and the three `Rome … in pol:roman_kingdom` lines of `KNOWN_CAPITAL_FAULTS` are
removed. The Roman Republic's Rome of 480–338 BCE (`pol:rome`, 2.8 km, the source's own row) is a different series and is NOT corrected
here: it stays listed as *source*, for the owner.

**The licence, said where it counts.** Cliopatria is CC BY 4.0, which permits adaptation with attribution. The adaptation is named in three
places that cannot drift apart: the fix file itself (`what`, `why`, `evidence`, `licence`); `history.bin`'s header, whose Cliopatria
source entry carries `adaptations: [{ series, date, what, doc }]` (and the war slice, its twin, `polity-index.js` copy the same header);
and the **Sources and credits** page, which `build-credits.js` generates from the files' headers alone — it merges the adaptations per
source variant and the page prints them under the attribution as "Adapted by Folio (the licence allows it, with this attribution): …".

**What this is not.** It is not a claim about where the Kingdom's border ran in 600 BCE: a rectangle 3 km from a modern coordinate is a
correction to a drawing, made so that the city a kingdom is named after is inside it. The honest fix is upstream, and §7.1 is the issue
for it. It is also not applied to the Etruscan row (whose ring still contains Rome; only the overlap with the Kingdom is decided), nor to
any of the 48 other *source* entries of §2, which wait for the owner as §4 says.

### 7.1 The upstream issue (written, not posted)

> **Title:** Roman Kingdom (Q201038), 750–481 BCE: the polygon leaves Rome 2.8 km outside it, inside the Etruscans polygon
>
> **Version:** cliopatria v0.2.0 (`cliopatria.geojson.zip`, sha256 d01ae3a2…), rows `Name = "Roman Kingdom"`, Wikidata Q201038, FromYear/ToYear
> −750/−701, −700/−501 and −500/−481.
>
> **What I see.** All three rows carry the same five-vertex polygon, about 859 km²: (12.1305, 41.9114) (12.4482, 41.7816) (12.4517, 42.1063)
> (11.9725, 42.1063) (12.1311, 41.9764). Its east edge runs along 12.45° E. Rome — Wikidata Q220, P625 12.4828 E 41.8931 N; the capital the
> item Q201038 itself names (P36) — lies 2.77 km east of that edge, outside the polygon. The `Etruscans` rows of −750/−651, −650/−601 and
> −600/−551 contain Rome's coordinate (6.3 km inside their own edge); the Etruscans ring shares the Kingdom's north-east corner (12.4517, 42.1063).
> So, as drawn, the city is not in the kingdom named after it and, for 750–551 BCE, is Etruscan.
>
> **How I checked.** Point-in-polygon and point-to-edge distance on the raw rings in the GeoJSON (planar at the ring's latitude), independently
> of any rendering; the figures above are from the raw rows.
>
> **What I would suggest.** Move the east edge (or add vertices) so that the polygon contains Rome's site with some margin — the city on the
> left bank of the Tiber, the hills, and the river's mouth at Ostia if the row means to include it — and, if the Etruscan rows are meant to
> stop at the Tiber in these years, trim their south-west tip to the river so the two do not overlap at the city. I have no source of my own
> for where the Kingdom's border ran, and do not propose one; I am reporting that the polygon excludes its own capital.
>
> **What I did meanwhile.** Folio (folio.study), which draws Cliopatria's borders, opens the east edge around Rome by a 5.8 × 6.0 km notch
> (+4 % of area) and treats that overlap as the Kingdom's, labelled as Folio's adaptation of your CC BY 4.0 data on its credits page. I will
> drop the adaptation when a corrected row ships.
