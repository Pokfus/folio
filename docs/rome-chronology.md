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
| the fight off Alalia / also dated / Alalia founded / Velia's Athena temple | c. 540 – 535 BCE / c. 545 BCE (Colonna, via a BMCR review) / c. 565 BCE / c. 540 – 530 BCE | `rm-033`, `rm-041`, `rm-042` |
| Giens wreck lost / defeat off Cumae | c. 500 – 475 BCE / 474 BCE | the excavators' report; a modern account, since Diodorus gives an archon year (`rm-041`) |
| Greek colonies in southern Italy / Tarentum falls to Rome | c. 750 – 443 BCE (Pithekoussai to Thurii) / 272 BCE | `rm-043` |
| Cumae founded / Etruscans routed / taken by the Campanians / citizens without the vote | c. 750 – 720 BCE / 524 BCE / 421 – 420 BCE / 338 BCE | `rm-044`; `gr-215` gives 421 BCE, this card Livy's 420 as well |
| Tarquinius Priscus king (Dionysius) / Etruscans made citizens | 614 BCE (tradition) / 90 – 88 BCE | `rm-045` |

## The regal period and the early Republic

Filled batch by batch, from the source each row names. The legendary dates are given AS tradition.

| event | the collection says | source |
|---|---|---|
| the regal period | 753 – 509 BCE by tradition (Varro); 751 – 507 BCE in Dionysius | `rm-046` |
| the Forum valley filled in | c. 650 – 600 BCE | `rm-046` |
| the Forum Boarium's first temple / temples burnt / rebuilt | c. 600 – 550 BCE / 213 BCE / 212 BCE | `rm-047` |
| Palatine wall (Carandini; disputed) / later wall remains | c. 775 – 750 BCE / c. 600 – 500 BCE | Lefkowitz's review (`rm-049`) |
| Capitoline settled / temple of Jupiter dedicated / Gallic siege / temple burnt | c. 1500 – 600 BCE / 509 BCE (tradition) / 390 BCE (Varronian) / 83 BCE | `rm-050` |
| Palatine hilltop villages / a hut of Romulus burnt / burnt again | c. 800 – 600 BCE / 38 BCE / 12 BCE | Cassius Dio (`rm-051`) |
| the founding | 21 April 753 BCE by tradition (Varro); 751 BCE (Cato) | `rm-052`, `rm-053`, `rm-057`, `rm-058`, `rm-060` |
| a single state at Rome | c. 700 – 600 BCE | `rm-052` |
| wolf and twins first attested (the Ogulnii's group) | 296 BCE | Livy 10.23 (`rm-053`) |
| the Capitoline Wolf | c. 500 – 400 BCE (the museum; Colonna) against c. 700 – 1400 CE (Carruba; Martini and Galli 2021) | `rm-054` |
| Aeneas in Etruscan images / on Caesar's coin | c. 600 – 400 BCE / 47 – 46 BCE | `rm-055` |
| Alba Longa: the Latin culture / its fall under Tullus (tradition) | c. 1050 – 950 BCE / c. 672 – 640 BCE | `rm-056` |
| Rome's 800th year (Claudius) / its 1000th | 47 CE / 248 CE | `rm-057` |
| Numa's reign / his books found | 715 – 672 BCE (tradition; Foster's Loeb Livy, Fulminante; Dionysius 713) / 181 BCE | `rm-061`, `rm-062` |
| the calendar of Antium / the Julian calendar from | 84 – 55 BCE / 1 January 45 BCE | `rm-062` |
| Tullus Hostilius's reign | 672 – 640 BCE (tradition; the Loeb Livy's margins) | `rm-063`, `rm-064`, `rm-056`, `rm-083` (B9 removed the unsourced 673 – 642 from `rm-083` and `rm-085`) |
| Ancus Marcius made king / Ostia founded | 638 BCE (Dionysius's reckoning) / 620 BCE (tradition) | `rm-065`; note that Varro's reckoning, used for the reigns either side, gives a different start, and the two rows say whose each is |
| Tarquinius Priscus's reign | 616 – 579 BCE (a common modern reckoning of the tradition); 614 BCE accession in Dionysius | `rm-066`, `rm-045` |
| Servius Tullius's reign | 578 – 534 BCE (tradition; Foster's Livy); 576 BCE accession in Dionysius | `rm-069`, `rm-070` |
| a reform of the centuriate order | perhaps 241 BCE | `rm-070` |
| Cloaca Maxima: oldest walls / vaulted / mouth arches / Agrippa's survey | c. 550 – 500 BCE / after 200 BCE / c. 100 BCE / 33 BCE | `rm-067` |
| Circus Maximus: starting gates / enlarged / great fire / reopened | 329 BCE / 46 BCE / 64 CE / 103 CE | `rm-068` |
| comitia centuriata: first consuls elected / centuriate reform | 509 BCE (tradition) / 241 – 218 BCE (Botsford's reading of Livy; an Augustan dating is another view) | `rm-071` |
| Servian Wall: earliest wall / rebuilt / repaired | c. 600 – 500 BCE / from 378 BCE (the Loeb margin at Livy 6.31; the old 377 was Platner's year for the tax) / 353 BCE | `rm-072` |
| censors take over the census / Augustus's first census / the last lustrum | 443 BCE / 28 BCE / 74 CE | `rm-073` |
| Tarquinius Superbus's reign / the monarchy's end | 532 – 507 BCE (Dionysius, as his translator converts it) / 509 BCE (the usual modern year) | `rm-074` |
| Capitoline temple built / dedicated / burnt | c. 550 – 500 BCE (pottery from the foundation trench) / 509 BCE (tradition) / 83 BCE, 69 CE, 80 CE | `rm-075`, `rm-050` |
| Sibylline keepers enlarged / books burnt / moved to the Palatine | c. 367 BCE / 83 BCE / 12 BCE | `rm-076` |
| Lucretia; the expulsion of the kings; Brutus's consulship; the rex sacrorum created | 509 BCE (tradition); 507 BCE in Dionysius | `rm-077`–`rm-080` |
| Brutus on Marcus Brutus's denarius / an inscription naming a rex sacrorum | 54 BCE / 43 – 70 CE | `rm-079`, `rm-080` |
| Romulus's reign | 753 – 717 BCE (tradition; the margins of Foster's Loeb Livy). `rm-060` prints only 753, since its agent found no page with an end year; the two agree | `rm-081`–`rm-084` |
| curiate assembly reduced to thirty lictors (Cicero) | 63 BCE | `rm-081` |
| senate refilled by Brutus | 509 BCE (tradition) | `rm-082` |
| consulship opened to plebeians / first secession / the Hortensian law | 367 BCE / 494 BCE / 287 BCE | `rm-083`, `rm-084` |
| Twelve Tables | 451 – 450 BCE (tradition) | `rm-085` |
| pomerium extended by Claudius / by Vespasian and Titus / re-marked by Hadrian | 49 CE / 75 CE / 121 CE (boundary stones, EDR105763, EDR032555) | `rm-087` |
| Forum basin filled / tribal assembly moves into the Forum / earthquake / cleared from | c. 650 – 600 BCE / 145 BCE / 847 CE / 1803 | `rm-088` |
| Lapis Niger inscription / also dated / found | c. 580 – 550 BCE (BMCR 2026.09.26) / c. 500 BCE / 1899 | `rm-089` |
| the annales maximi edited in 80 books | c. 130 – 120 BCE (Mommsen, Forsythe; Frier and Drews differ) | `rm-090` |

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
rm-041: 540; 535; 500; 475; 474
rm-042: 540; 535; 545; 565; 530
rm-043: 750; 443; 272
rm-044: 750; 720; 524; 421; 420; 338
rm-045: 614; 396; 90; 88
rm-046: 753; 509; 751; 507; 650; 600
rm-047: 600; 550; 213; 212
rm-049: 775; 750; 600; 500
rm-050: 1500; 600; 509; 390; 83
rm-051: 800; 600; 38; 12
rm-052: 753; 751; 700; 600
rm-053: 753; 296
rm-054: 500; 400; 700; 1400
rm-055: 600; 400; 47; 46
rm-056: 1050; 950; 672; 640
rm-057: 753; 47; 248
rm-058: 753
rm-060: 753
rm-061: 715; 672; 181
rm-062: 715; 672; 84; 55; 45
rm-063: 672; 640
rm-064: 672; 640
rm-065: 638; 620
rm-066: 616; 579; 614
rm-067: 550; 500; 200; 100; 33
rm-068: 329; 46; 64; 103
rm-069: 578; 534; 576
rm-070: 578; 534; 241
rm-071: 509; 241; 218
rm-072: 600; 500; 378; 353
rm-073: 443; 28; 74
rm-074: 532; 507; 509
rm-075: 550; 500; 509; 83; 69; 80
rm-076: 367; 83; 12
rm-077: 509
rm-078: 509; 507
rm-079: 509; 507; 54
rm-080: 509; 43; 70
rm-081: 753; 717; 63
rm-082: 753; 717; 509
rm-083: 753; 717; 672; 640; 367
rm-084: 753; 717; 494; 287
rm-085: 451; 450
rm-087: 753; 49; 75; 121
rm-088: 650; 600; 145; 847; 1803
rm-089: 580; 550; 500; 1899
rm-090: 130; 120
```
