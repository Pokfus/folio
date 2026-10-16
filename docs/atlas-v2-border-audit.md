# Atlas v2 border audit — is every polity's seat inside its faces? (2026-10-16)

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
**remedy that needs the owner's decision** is in §4.

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

**259 seats** (117 capital statements, 142 card-place years) over the card-linked polities; **121 (polity, seat, step) rows fail**, which is **50 entries over 39 polities** once steps are merged into year intervals.

| cause | entries | rows |
|---|---|---|
| source | 49 | 117 |
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
| ptolemaic | Alexandria (capital, gr-767) | 171 BCE–166 BCE | 14.9 | 14.0 | source | the raw row leaves it 14.0 km outside; the point lies in seleucid |
| qin | Xianyang (capital, cnh-191) | 751 BCE–352 BCE | 11.8–51.5 | 11.4 | other | the Xianyang row of the Qin-dynasty card (cnh-191) has no start or end qualifier and is read across the whole series (750 BCE on), while the dated Wikidata statement for the Qin state (cnh-155) reads 350–221 BCE: before 350 BCE the registry itself does not say Xianyang was Qin's seat |
| qin | Xianyang (capital, cnh-191) | 351 BCE–317 BCE | 51.5 | 51.5 | source | the raw row leaves it 51.5 km outside |
| qing | Beijing (capital, wh-716) | 1644 CE | 99.5 | 99.5 | source | the raw row leaves it 99.5 km outside; the point lies in ming |
| qing | Mukden (capital, wh-716) | 1625 CE, 1900 CE–1904 CE | 39.0–155.5 | 39.1 | source | the raw row leaves it 39.1 km outside; the point lies in ming |
| roman_kingdom | Rome (capital, rm-046) | 751 BCE–482 BCE | 2.8–6.9 | 2.8 | source | the raw row leaves it 2.8 km outside; the point lies in etruscans; **the build adds 4.1 km** |
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

**The fix, in `build-history.js` (`RING_SNAP_FRAC = 0.2`).** A vertex may travel to the coast (D1), a present-day border (D3) or a
neighbour's line (D2) no farther than **one fifth of the scale of the smallest ring it belongs to** (the square root of the ring's
area). A vertex over the cap stays where the source put it; the land clip and the sea-chord rule treat it as they treat any vertex
farther than D1 from the coast. For a polygon over about 75 km across the cap is above D1 and changes nothing.

| | before | after |
|---|---|---|
| D1 snaps (vertex → coast) | 1,008,668 | 965,506 (**51,264** vertex visits refused by the cap, which is 43,162 fewer snaps) |
| D2 / D3 snaps | 3,961 / 21,678 | 3,896 / 21,680 (3,005 / 58 refused) |
| `history.bin` | 9,096,400 bytes | 9,128,436 bytes (§3.1) |
| seat failures: entries (rows) | 50 (118) | 50 (121) |
| Carthage 650–631 BCE | 4.5 km, ring gone | holds |
| Roman Kingdom 550–481 BCE | 6.48 km | 2.76 km (= the source) |
| Rome, Roman Republic 480–338 BCE | 5.8 km | 2.8 km (= the source) |

**What the cap costs, said plainly.** Three coastal seats were inside 2 km only because the old 15 km snap pulled a coarse polygon onto
the coast: Byzantium's Constantinople in 674–681 CE (now 2.6 km; the raw row is 6.2 km out), Ptolemaic Egypt's Alexandria in 170–165
BCE (now 14.9 km; the raw row is 14.0 km out) and the Golden Horde's card place in 1332/34/41 CE (now 5.1 km = the raw row). They are
*source* faults the old snap had been hiding; they are now listed as such. I judged an honest raw edge better than a seat rescued by a
12 km move of a corner, but it is a trade, and the cap is one constant if the owner weighs it differently.

### 3.1 Size and files

`history.bin` is **9,096,400 → 9,128,436 bytes** (+32,036, +0.35 %); the entity table gains three contested overlap entities
(233 → 236: Pergamon with Rome 164–127 BCE, Byzantium with the Ottomans and Venice 1463–67, Italy with Japan and the Republic of China
1930–31) and the steps go 3,159 → 3,181, because a polygon that keeps its corners overlaps its neighbours slightly differently and
three overlaps now clear the 120 km² sliver bar. The cap is not applied to the presence layer (peoples, cultures: no seat, and
`test-peoples.js` pins their meshes) or to the Second World War fronts; those faces are as before.
Everything derived was regenerated with the repo's scripts (`build-war-slice.js`, `build-wars.js`, `build-polity-index.js`, `build-credits.js`, the
`file://` twins); the land, water and relief files are byte-identical.

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
