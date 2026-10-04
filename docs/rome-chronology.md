# Ancient Rome — the chronology the collection commits to

The dates, conventions and name spellings the Ancient Rome collection (`col-40`, `rm-001`–`rm-1000`) uses,
in ONE place, so that no two cards disagree about when something happened or how it is spelled. Written in
Oct 2026 as Batch 0 of the refinement audit (`docs/rome-refinement-audit.md`), on the model of
`docs/greece-chronology.md` and `docs/wh-chronology.md`.

**Every date line and every date in a background must agree with this file.** Where a card needs a date
this file does not carry, add the row here in the same commit as the card, with the source it came from.
Where a card's own research shows a row here is wrong, correct the row and grep the collection for the old
figure on the day — a correction does not travel on its own. A row is only ever added from a source a batch
actually read; nothing here is carried over from the bulk-written cards unchecked.

`node .claude/rm-audit.js` reads the `chronology-pins` block at the foot of this file and reports any pinned
card whose date line does not carry its pinned figures.

## Conventions

| case | write | not | why |
|---|---|---|---|
| a year under 1000 | `509 BCE`, `79 CE`, `476 CE` | `509`, `79 AD`, `AD 79` | `cardYears` reads a bare first-millennium number only through the era; the numeral leads |
| a year from 1000 on | `1453`, `1570` | `1453 CE` | no era needed; the house form |
| the era | `BCE` and `CE` | `BC`, `AD`, `B.C.`, `A.D.` | site-wide (`check-style.js` refuses "AD"); a Latin title or a quotation keeps its own form |
| a span across the era | `27 BCE – 14 CE` | `27 – 14 CE`, `27 BC – AD 14` | both halves carry their era, or the first is read as CE |
| an approximate range | `c. 625 – 575 BCE` | `c. 625 – c. 575 BCE` | a `c.` inside a range breaks the era's leftward carry |
| a century | `c. 700 – 600 BCE` | `7th century BCE` on the line | a century alone yields no sort year; in prose "the 7th century BCE" is fine |
| a year counted from the founding | the BCE/CE year on the line; in prose "the year 1000 from the founding, 248 CE" | `AUC 1000` on the line | AUC is the Roman count, not the card's; it is converted on Varro's epoch (`753 BCE` = year 1) and the prose says so where it matters |
| a consular year | the BCE year, with the consuls in prose if the card needs them | "the year of Caesar and Bibulus" as the only date | Rome named its years by the two consuls; the card's date line carries the number a reader can sort |
| a Varronian year in the early Republic | the conventional year, e.g. `509 BCE`, `390 BCE` | a "corrected" year chosen silently | the conventional (Varronian) years before the 3rd century BCE rest on an ancient reconstruction and differ from Livy's and the Greek historians' by a few years; where a source gives the other figure, the prose says whose each is |
| a legendary date | `Traditional` / `By tradition` as the label, e.g. `753 BCE` | `Founded 753 BCE`, `after 753 BCE` | the founding, the regal years and the first consuls are an ancient reckoning, not a record; the label says so, and the prose says whose reckoning (Varro, Livy, Dionysius) |
| an act of a legendary king | no date, or the king's traditional reign | `after 753 BCE` | "after 753 BCE" dates nothing; the sort year it yields puts every regal card at the founding |
| a reign | `Reigned 27 BCE – 14 CE` | `Ruled 41 years` | a count of years is not a date; give the first and last years the sources give |
| an emperor | Born, Reigned, Died (≤ 4 rows) | an accession and a death in prose only | the Greece rule for a historical person |
| a day | `15 March 44 BCE` | `the Ides of March, 44 BC` on the line | the Roman day may be named in prose; the line carries the modern form |
| a day before the Julian reform | the date as the sources give it, in the Roman calendar | a silent conversion to the season | the pre-Julian calendar ran out of step with the sun; the prose says so where the season matters |
| the end of the Republic / the West | the event the card is about (`27 BCE`, `476 CE`) with what it was | one date as if it were the whole process | the endings are conventions; a card says which convention it uses |
| a disputed date | two rows (`Dated` / `Also dated`), or in prose "X puts it…; Y puts it…" | one figure chosen silently | the Greece rule |
| an excavation | a `Found` row only on a site or find card, after the dates of the thing itself | a discovery year as the card's only date | a discovery year sorts the card into the modern period |
| no date a source gives | omit it | an estimate | never estimated |

Questions carry **no dates at all** — no year, century, millennium or decade, and no AUC year
(`rm-audit.js` reports "AUC" in a question as `Q.date`). Period names (the regal period, the Principate,
the Dominate) are fine; a consul's name is not a date and is fine.

## Spellings

Measured over the shipped collection in Oct 2026; the house form is the one the collection already uses
most, which is the familiar English form for the famous and the Latin form for everyone else.

| use | not |
|---|---|
| Mark Antony (Antony after the first mention) | Marcus Antonius, except inside a citation or a Latin phrase |
| Pompey | Pompeius, except as the family name of his sons and kin where the source uses it |
| Octavian (before 27 BCE), Augustus (from 27 BCE) | Octavianus |
| Caligula (first mention), Gaius | — both are used; the first mention says who is meant |
| Livy, Virgil, Horace, Ovid | Titus Livius, Vergil, Horatius (the poet) |
| Tarquinius Superbus, Servius Tullius, Numa | Tarquin the Proud; Numa Pompilius after the first mention |
| Sulla, Mithridates, Boudica | Sylla, Mithradates, Boudicca, Boadicea |
| Carthaginian (the people and state), Punic (the wars and the language) | |
| Etruscan | Tyrrhenian, except inside a quotation of a Greek source |
| plebeians (the order), the plebs (the people) | |

## Italy before Rome

Filled batch by batch, from the source each row names.

| event | the collection says | source |
|---|---|---|
| Ancient Italy, as a period | c. 1000 – 49 BCE (a handbook's convention: the Iron Age to the Lex Roscia) | Negrini, BMCR 2025, on the *Oxford Handbook of Pre-Roman Italy* (`rm-001`) |
| Bronze Age Italy | c. 2200 – 950 BCE (the usual Italian scheme: Early, Middle, Recent, Final) | Varalli et al. 2022 (`rm-006`) |
| Terramare culture | c. 1650 – 1150 BCE; one account starts it c. 1550 BCE | Cavazzuti et al. 2019; Cremaschi 2017 (`rm-006`, `rm-007`) |
| Sardinian nuraghi | c. 1700 – 1100 BCE | `rm-006` |
| Latin culture (Roma–Colli Albani I) | c. 1050 – 950 BCE | Alessandri 2026 (`rm-010`) |
| Italic peoples take shape | c. 1000 BCE (the Bronze–Iron Age turn) | Negrini, BMCR 2025 (`rm-009`) |
| Villanovan culture | c. 900 – 700 BCE (end of the 10th to the 8th century) | Esposito et al. (`rm-008`) |
| Social War | 91 – 88 BCE | Raggi, BMCR 2014; García González (`rm-001`, `rm-009`) |
| Lex Roscia (citizenship north of the Po) | 49 BCE | Negrini (`rm-001`) |
| Latin War | 340 – 338 BCE (Varro's reckoning) | Lendering, Livius.org (`rm-004`, `rm-010`) |
| Latin League: treaty with all the Latins / dissolved | 493 BCE (tradition: the *foedus Cassianum*) / 338 BCE | Livy 8.14 and a modern account (`rm-011`) |
| Sabines: Eretum a town / conquered | c. 650 – 550 BCE / 290 BCE (Manius Curius Dentatus) | Emiliozzi et al.; Loeb note to Velleius 1.14 (`rm-012`) |
| Samnite Wars | 343 – 290 BCE (the conventional years) | BMCR review (`rm-013`) |
| Oscan written | c. 600 BCE – 79 CE (graffiti at Pompeii) | Mnamon (`rm-014`) |
| Umbrians: Early Iron Age / final surrender | c. 900 – 700 BCE / 268 – 265 BCE | Modi et al.; Zapelloni Pavia (`rm-015`) |
| Iguvine Tables inscribed / reported found / deeded to Gubbio | c. 300 – 1 BCE / 1444 / 1456 | Gubbio Civic Museum; MeTU (`rm-016`) |
| Satricum taken by the Volsci / Antium's ships taken | 488 BCE (tradition) / 338 BCE | Satricum Project; Platner (`rm-017`) |
| Ligurians take shape / Apuani deported to Samnium / Polcevera ruling | c. 1600 – 900 BCE / 180 – 179 BCE / 117 BCE | MUDIF; Lehnig and Babucic; Piegdoń (`rm-018`) |
| Veneti: dated burials / inscriptions | c. 900 – 50 BCE / c. 550 BCE – 50 CE | Perego 2010 (`rm-019`) |
| Messapic inscriptions / triumph over the Sallentini | c. 550 – 100 BCE / 266 BCE | Mnamon; Leucci et al. (`rm-020`) |
| Cisalpine Gauls arrive / citizenship north of the Po | c. 400 BCE / 49 BCE (Lex Roscia) | Mnamon (Lepontic); Negrini (`rm-021`) |
| Etruscan civilisation takes shape / defeat off Cumae / Veii falls | c. 1000 BCE / 474 BCE / 396 BCE (Varronian) | Potts and Smith 2022 (`rm-022`) |
| Etruscan cities: move to plateaus / full cities | c. 1020 – 900 BCE / c. 750 – 480 BCE | Stoddart et al. 2020 (`rm-024`); note that the plateau row starts before the Villanovan row above |
| Fanum Voltumnae (Campo della Fiera) in use / Volsinii taken | c. 550 BCE – 400 CE / 264 BCE | Gillett; Stopponi via the Louvre; Stek (`rm-025`) |
| Etruscan inscriptions / Liber Linteus linen (radiocarbon) / its text (letter forms) | c. 800 – 1 BCE / c. 390 BCE / c. 200 – 150 BCE | Mnamon; Uranić; Turfa's BMCR review of van der Meer (`rm-026`) |
| Pyrgi Tablets inscribed / sanctuary monumentalised / found | c. 500 BCE / c. 510 BCE / 8 July 1964 | Museo Nazionale Etrusco; Baglione et al. (`rm-027`) |
| Etruscan votive texts / Portonaccio deposit at Veii / temple of Thesan at Pyrgi | from c. 750 BCE / c. 600 – 530 BCE / c. 470 – 460 BCE | `rm-028` |
| haruspicy first depicted / Piacenza liver / haruspices offered against Alaric | c. 430 – 400 BCE / c. 100 BCE / 409 CE | `rm-029`, `rm-030` |
| Cicero, *On Divination* | 45 – 44 BCE | `rm-030` |
| Etruscan tomb painting | c. 675 – 200 BCE | Steingräber, via a BMCR review (`rm-031`) |
| Tarquinia occupied / Roman colony at Gravisca | from c. 1000 – 900 BCE / 181 BCE | Livy 40.29 (`rm-032`) |
| Caere's oldest graves / the sea battle off Alalia | c. 900 – 800 BCE / c. 540 – 535 BCE | `rm-033` (the battle's own card is `rm-042`) |
| Banditaccia in use / Sarcophagus of the Spouses / World Heritage | c. 900 – 200 BCE / c. 530 – 520 BCE / 2004 | `rm-034` |
| Veii settled / taken by Rome / revival | c. 900 BCE / 396 BCE (tradition, Varronian) / 350 – 250 BCE | Potts and Smith 2022 (`rm-035`) |
| Vulci forms / Roman triumph / municipium | c. 900 – 750 BCE / 280 BCE / from 90 BCE | `rm-036` |
| bossed bronze basins / beaked jugs | c. 750 – 500 BCE / c. 525 – 400 BCE | `rm-037` |
| bucchero first made / thin-walled phase | c. 700 BCE / 680 – 630 BCE | Longoni 2023 (`rm-038`) |
| Apollo of Veii made / found | c. 510 – 500 BCE / 1916 | `rm-039` |
| Pontecagnano founded / Tabula Capuana / Capua taken by the Samnites | c. 900 BCE / c. 470 BCE / 423 BCE (one modern dating) | `rm-040` |

## The regal period and the early Republic

Filled batch by batch, from the source each row names. The legendary dates are given AS tradition.

| event | the collection says | source |
|---|---|---|

## The middle and late Republic

| event | the collection says | source |
|---|---|---|

## The Principate

| event | the collection says | source |
|---|---|---|

## Late Antiquity

| event | the collection says | source |
|---|---|---|

## Chronology pins

The figures each refined card's date line must carry. One line per card, `rm-NNN: figure; figure`. Only a
figure that is on the date line is pinned.

```chronology-pins
rm-001: 1000; 91; 88; 49
rm-006: 2200; 950; 1650; 1150; 1700; 1100
rm-007: 1650; 1150
rm-008: 900; 700
rm-009: 1000; 91
rm-010: 1050; 950; 340; 338
rm-011: 493; 338
rm-012: 650; 550; 290
rm-013: 343; 290
rm-014: 600; 79
rm-015: 900; 700; 268; 265
rm-016: 300; 1444; 1456
rm-017: 488; 338
rm-018: 1600; 900; 180; 179; 117
rm-019: 900; 50; 550
rm-020: 550; 100; 266
rm-021: 400; 49
rm-022: 1000; 474; 396
rm-023: 900; 800; 1000
rm-024: 1020; 900; 750; 480; 396
rm-025: 550; 400; 264
rm-026: 800; 390; 200; 150
rm-027: 500; 510; 1964
rm-028: 750; 600; 530; 470; 460
rm-029: 430; 400; 100; 409
rm-030: 100; 45; 44
rm-031: 675; 200
rm-032: 1000; 900; 181
rm-033: 900; 800; 540; 535
rm-034: 900; 200; 530; 520; 2004
rm-035: 900; 396; 350; 250
rm-036: 900; 750; 280; 90
rm-037: 750; 500; 525; 400
rm-038: 700; 680; 630
rm-039: 510; 500; 1916
rm-040: 900; 470; 423
```
