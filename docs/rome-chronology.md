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
| the Republic | 509 BCE (tradition) – 27 BCE (a convention: the senate names Octavian Augustus) | `rm-091` |
| consuls take office on 1 January | from 153 BCE | `rm-092`. **"Named consuls from 305 BCE"** was AUC 305 (= 449 BCE) in Zonaras 7.19 misread as a BCE year; gone |
| Fasti Capitolini: last entry / found | 13 CE / 1547 | `rm-093` |
| fasces: the Vetulonia tomb / a state emblem | c. 700 – 600 BCE / 1926 | `rm-095` |
| Horatius at the bridge; the war with Porsena | 508 BCE; 508 – 507 BCE (tradition; the Loeb Livy's margin and Livius) | `rm-097`, `rm-098` |
| Lake Regillus / the Castor temple dedicated | 499 BCE (Livy) or 496 BCE (Dionysius), tradition / 484 BCE | `rm-099` |
| Foedus Cassianum | 493 BCE (tradition), to the Latin War, 340 – 338 BCE | `rm-100`, `rm-011` |
| the Conflict of the Orders / the plebeian breakthrough | 494 – 287 BCE (tradition) / 367 BCE (the laws; the first plebeian consul is 366 BCE, `rm-106`, `rm-128`) | `rm-101` |
| the first secession | 494 BCE (tradition; Livy's Sacred Mount, Piso's Aventine) | `rm-102` |
| tribunes: first / raised to ten / Octavius deposed | 494 BCE (tradition) / 457 BCE (tradition, Livy 3.30) / 133 BCE | `rm-103` |
| sacrosanctity: the oath / the Valerio-Horatian law | 494 BCE / 449 BCE (tradition) | `rm-104` |
| concilium plebis: Volero's law / binding on all | 471 BCE (tradition, Livy) / 287 BCE | `rm-105` |
| aediles: plebeian / senate decrees lodged / curule pair | 494 BCE, 449 BCE (tradition) / 366 BCE (Abbott; Smith prints 365; 367 is the year of the Licinio-Sextian laws, not of the office) | `rm-106` |
| Coriolanus | 493 BCE (tradition) | `rm-107` |
| Cincinnatus: first / second dictatorship | 458 BCE / 439 BCE (tradition) | `rm-108` |
| the dictatorship: first / last named for a war / last of the old kind / Sulla | 501 BCE (Livy's tradition; Dionysius three years later) / 216 BCE / 202 BCE / 82 BCE | `rm-109` |
| the Twelve Tables: the two boards / ratified | 451 – 450 BCE / 449 BCE (tradition) | `rm-110`, `rm-111`, `rm-112`, `rm-085` |
| Verginia | 449 BCE (tradition; Varronian) | `rm-113` |
| the Valerio-Horatian laws / said repeated | 449 BCE (tradition) / 339 BCE and 287 BCE | `rm-114` |
| Lex Canuleia | 445 BCE (tradition) | `rm-115` |
| consular tribunes | 444 – 367 BCE (tradition); Livy's plebeian tribune is in a year the list gives as 400 BCE, which Greenidge reports as disputed | `rm-116` |
| the censorship: created / term limited / first plebeian / last censors | 443 BCE (tradition; 435 BCE is a rival view) / 434 BCE (Greenidge, Ramsay; Smith prints 433) / 351 BCE / 22 BCE | `rm-117`, `rm-073` |
| the quaestorship: elected / opened to the plebs / first plebeians | 447 BCE (Tacitus's 63rd year after the kings, as modern books convert it) / 421 BCE / 409 BCE | `rm-118` |
| the legion: change from phalanx to maniples / Livy's setting | c. 396 – 264 BCE (one modern summary) / 340 BCE (the Latin War) | `rm-119` |
| the siege of Veii / winter quarters | 406 – 396 BCE (tradition) / 403 BCE | `rm-120` |
| the Veii spoils; Camillus's exile; the sack | 396 BCE / 391 BCE / 390 BCE (tradition; Lendering puts Veii's fall nearer 393) | `rm-121` |
| the first pay for soldiers / the knights paid | 406 BCE (Forsythe and Smith's 1890 edition; the 1875 edition prints 405) / 403 BCE; Livy gives no BCE year | `rm-122` |
| the Allia; the Gallic sack | 390 BCE (Varro) / 387 – 386 BCE (Polybius's Greek year, the Peace of Antalcidas) | `rm-123`, `rm-124`, `rm-125`, `rm-126` |
| Aius Locutius: the voice / the altar ordered | 391 BCE / 390 BCE (tradition) | `rm-127` |
| the Licinio-Sextian laws / the first plebeian consul | 367 BCE / 366 BCE (tradition; `wh-343` says the law "opened the consulship in 367", the year of the law) | `rm-128`, `rm-101`, `rm-106`, `rm-132` |
| the measures called the Lex Genucia / the first pair of plebeian consuls | 342 BCE (Varro's reckoning) / 172 BCE | `rm-129` |
| the two plebiscites on repeating an office / the lex Villia annalis / Sulla's law | 342 BCE (Varro's reckoning) / 180 BCE (Livy 40.44; Abbott, Smith) / 81 BCE | `rm-131`, `rm-129` |
| the praetorship: created / first plebeian / second praetor / Sicily and Sardinia | 366 BCE (Greenidge; Abbott prints 367) / 337 BCE / 242 BCE / 227 BCE; two more for Spain in 197 BCE (Smith) | `rm-132` |
| the Lex Ovinia | no date in any source; older handbooks place it after 339 BCE and before 312 BCE, an inference the card keeps in prose and off the line | `rm-133` |
| the Lex Poetelia | 326 BCE (Livy) / 313 BCE (Varro, with Poetelius as dictator); Cicero names none | `rm-134` |
| the Lex Hortensia | 287 BCE (the modern convention) | `rm-135`, `rm-101` |
| the Lex Ogulnia | 300 BCE (Livy 10.6-9) | `rm-136` |
| Appius Claudius Caecus: censor / consul | 312 BCE (Diodorus's count 311 BCE) / 307 BCE and 296 BCE | `rm-137` |
| the Via Appia: begun / stone laid by aediles / extended to Venusia, Tarentum, Brundisium | 312 BCE (Diodorus's count 311) / 296 BCE and 293 BCE (Livy) / 291, 281 and 264 BCE (Platner and Ashby only) | `rm-138` |
| the Aqua Appia: built / repaired / Augustan repairs | 312 BCE (the date modern books give for the censorship) / 144 – 140 BCE / 11 – 4 BCE | `rm-139` |
| aes grave: cast from / Pliny's first silver / the as cut to two ounces / bronze and silver one system | c. 300 BCE (Mattingly) / 269 BCE (Forsythe; Mattingly 269 or 268) / c. 245 BCE (Mattingly) / 218 – 201 BCE | `rm-140` |
| the conquest of Italy: Polybius's start / the Pyrrhic War / Italy held | 387 – 386 BCE (Polybius's Greek year, the Peace of Antalcidas; Varro's is 390) / 280 – 275 BCE / 264 BCE | `rm-141` |
| the Latin War | 340 – 338 BCE (tradition: the Varronian scheme; Forsythe and Lendering find Varro's years before 300 BCE several years out) | `rm-142` |
| the Feriae Latinae: Tarquin's law / the list of dates begins / the leagues ended | 534 – 509 BCE (Tarquin's reign as the card's source prints it; `rm-074` prints Dionysius's 532 – 507 BCE) / 451 BCE / 338 BCE | `rm-143` |
| prefects sent to Capua / Capua stripped of its council / the Lex Julia | 318 BCE (Livy 9.20, by the usual list) / 211 BCE / 90 BCE | `rm-144` |
| Latin rights: the migration quarrel / Latin rights for the Gauls beyond the Po / Spain | 177 BCE (Livy 41.8) / 89 BCE / c. 74 CE (Pliny; Abbott) | `rm-145` |
| municipium: Tusculum / Livy's grants / the citizenship law / the Salpensa law | 381 BCE (conventional) / 338 BCE / 90 BCE / 81 – 84 CE | `rm-146` |
| citizenship without the vote: Caere / Livy's grants / the vote granted to Formiae, Fundi, Arpinum / the full franchise | c. 353 BCE (the 1890 Smith dictionary's reckoning; Gellius gives no year) / 338 BCE / 188 BCE / 90 BCE onward | `rm-147` |
| citizen colonies: Antium / Terracina / the larger colonies / Sulla's veterans at Pompeii | 338 BCE / 329 BCE / from 184 BCE / 80 BCE | `rm-148` |
| Latin colonies: Cales / Aquileia | 334 BCE (the usual list) / 181 BCE | `rm-149` |
| ager publicus: the 500-iugera limit / the Latin War land / the Gracchan law / the land law | 367 BCE (tradition) / 338 BCE / 133 BCE / 111 BCE | `rm-150`, `rm-128` |
| the Samnite Wars: first / second / third | 343 – 341 BCE / 326 – 304 BCE / 298 – 290 BCE (tradition: the numbering is modern, Stek; Varro's years before 300 BCE may run several years out) | `rm-151`, `rm-152`, `rm-153`, `rm-156` |
| the earlier treaty with the Samnites | 354 BCE (tradition) | `rm-152` |
| the Second Samnite War / the Caudine Forks | 326 – 304 BCE / 321 BCE (conventional) | `rm-153`, `rm-154` |
| the maniple: in use / Livy's setting | c. 350 – 100 BCE (Taylor, 2020) / 340 BCE (the Latin War) | `rm-155` |
| the Battle of Sentinum | 295 BCE (conventional) | `rm-157`, `rm-156` |
| the conquest of Etruria: Veii / the Ciminian forest / Volsinii | 396 BCE (tradition) / 310 BCE / 264 BCE | `rm-158` |
| Umbria and Picenum: Mevania / the Picene treaty / the Picene war / Firmum | 308 BCE (tradition) / 299 BCE (one modern account) / 268 BCE / 264 BCE | `rm-159` |
| the Senones: Arretium / final defeat / the land shared | 284 BCE / 283 BCE (one recent study) / 232 BCE; Sena Gallica between 290 and 284 BCE in the sources | `rm-160` |
| the Battle of Telamon / Aemilius's triumph | 225 BCE / 224 BCE (firm: Polybius names both consuls; the lists of consuls and triumphs agree) | `rm-161` |
| the conquest of Cisalpine Gaul: the war / the colonies Placentia and Cremona / the Boii beaten | 225 – 222 BCE / 218 BCE / 191 BCE; Marcellus's triumph 221 BCE (Smith) | `rm-162` |
| Tarentum: the founding / the war began / surrendered | 706 BCE (Eusebius, via Dunbabin; Jerome has 708 BCE) / 282 – 281 BCE / 272 BCE | `rm-163`, `rm-169` |
| Pyrrhus: lived / in Italy | c. 319 – 272 BCE / 280 – 275 BCE | `rm-164` |
| the Battle of Heraclea / Asculum | 280 BCE / 279 BCE (modern histories; the sources conflict on who won at Asculum) | `rm-165`, `rm-166` |
| the "one more such victory" remark | 279 BCE after Asculum (Plutarch) / 280 BCE after Heraclea (Diodorus, Dio) | `rm-167` |
| the Battle of Beneventum / the Latin colony | 275 BCE (Smith prints 274) / 268 BCE | `rm-168` |
| the socii: burdens felt / status ended | 173 BCE (Livy 42.1, as Schmitz and Long give it) / 90 BCE | `rm-171` |
| the formula togatorum: twelve colonies refuse / the senate's penalty / named in the land law | 209 BCE / 204 BCE / 111 BCE (Livy; the Lex Agraria) | `rm-172` |
| the Via Flaminia / the Augustan work | 220 BCE (the modern date; a passage of Festus seems to give 223 BCE; the Periochae give no year) / 27 BCE (the arch at Ariminum) | `rm-173` |
| the Via Aemilia / the colonies on it | 187 BCE (modern accounts of Livy) / Bononia 189 BCE, Parma and Mutina 183 BCE | `rm-174` |
| Roman roads: the Appian Way begun / oldest milestone | 312 BCE (gravel; footpath 296 BCE, paving to Bovillae 293 BCE) / c. 250 BCE | `rm-175`, `rm-138` |
| the triumph: Romulus's (tradition) / Paullus's | 753 BCE / 167 BCE (November, per Plutarch's editor) | `rm-176` |
| evocatio: Juno vowed at Veii / her temple dedicated / Carthage / Isaura | 396 BCE / 392 BCE (both tradition; Platner and Ashby print both) / 146 BCE / 75 BCE | `rm-177` |
| the Romanisation of Italy: Livy's settlement / Haverfield's essay | 338 BCE / 1905 | `rm-178` |
| Rhegium retaken | 271 BCE (the marginal date in Shuckburgh's Polybius) / 270 BCE (Smith) | `rm-180` |
| Carthage: traditional founding / oldest excavated levels / destroyed | 814 – 813 BCE (Timaeus' count, as later authors report it; Velleius' "65 years before Rome") / c. 800 – 750 BCE / 146 BCE | `rm-181` |
| the Carthaginian empire: dominant / Sicily lost / ended | c. 550 BCE / 241 BCE / 146 BCE | `rm-182` |
| the Carthaginian constitution: Aristotle's Politics (Gsell) / Hannibal's reform | c. 335 BCE / 196 BCE (a modern summary of Livy) | `rm-183` |
| the Carthaginian navy: the First Punic War / the fleet limited | 264 – 241 BCE / 201 BCE | `rm-184` |
| the Roman–Carthaginian treaties: the first / Diodorus's and Livy's / renewals | 509 BCE (Varro's reckoning of Polybius's "first consuls") / 348 BCE / 306 BCE and 279 BCE (Livy) | `rm-185` |
| the First Punic War | 264 – 241 BCE | `rm-186`, `wh-345` |
| the Mamertines: Agathocles died / Rhegium retaken / the consul crosses | 289 BCE / 271 or 270 BCE (the marginal date in Shuckburgh; Smith) / 264 BCE; the Longanus 268 BCE (Frank) or 265 BCE (Giannelli; Livius.org) | `rm-187`, `rm-189` |
| Messana: the Samians / Anaxilas died / the consul crosses | c. 493 BCE (not before) / 476 BCE / 264 BCE (`gr-237` says about 490 BCE for the rename, inside this window) | `rm-188` |
| Hiero II: reigned / peace with Rome | c. 269 – 215 BCE (Polybius's 54 years counted back from 215; the kingship 270 – 264 by other scholars) / 263 BCE | `rm-189` |
| the siege of Agrigentum | 262 BCE | `rm-190` |
| the first Roman fleet: decided / the squadron lost at Lipara | 261 BCE / 260 BCE (the usual chronology, Livius.org) | `rm-191` |
| the corvus: first used / last named | 260 BCE (Mylae) / 256 BCE (Ecnomus), both in Polybius's narrative | `rm-192` |
| the Battle of Mylae / Cape Ecnomus | 260 BCE / 256 BCE | `rm-193`, `rm-194` |
| the African expedition: landed / the army defeated / the fleet wrecked | 256 BCE / 255 BCE / 255 BCE | `rm-195` |
| Regulus: consul / consul again / captured | 267 BCE / 256 BCE / 255 BCE | `rm-196` |
| the siege of Lilybaeum / Drepana | 250 – 241 BCE / 249 BCE | `rm-197` |
| Hamilcar Barca: at Hercte / at Eryx / landed in Iberia / died | c. 247 – 244 BCE (Scullard, Frank; Polybius gives only durations) / c. 244 – 241 BCE / 237 BCE (Schulten) / 229 – 228 BCE (disputed: Schulten 229/8; Frank 229) | `rm-198` |
| the Battle of the Aegates Islands | 10 March 241 BCE (the day from Eutropius, accepted by Walbank and Morgan; the Egadi survey prints it) | `rm-199` |
| the Treaty of Lutatius | 241 BCE (the first draft; the commissioners' revision the same year) | `rm-200` |
| the annexation of Sicily: the peace / the first resident praetor | 241 BCE / 227 BCE (Frank, the only source read that prints it; no ancient source gives a year for the first province) | `rm-201`, `rm-202` |
| the Mercenary War | 241 – 237 BCE (Mulligan and Hoyos's title; Polybius gives only 3 years 4 months) | `rm-203` |
| the seizure of Sardinia and Corsica / its own praetor | 237 BCE (Hoyos, via Drogula's review) or 238 BCE (Enciclopedia Italiana; Bouchier) / 227 BCE (Frank, Bouchier; the Enciclopedia Italiana says 226) | `rm-204` |
| the Barcid conquest of Spain: landed / Hamilcar died / Hasdrubal in command | 237 BCE / 229 BCE (Lendering) / 228 – 221 BCE | `rm-205` |
| New Carthage: founded / Hasdrubal killed / taken by Rome | c. 229 – 227 BCE (the spread of modern dates) / 221 BCE / 209 BCE | `rm-206` |
| the Ebro treaty / the Roman embassy at Carthage | c. 226 BCE (Schulten; Hallward 226 or 225; Polybius gives no year) / 218 BCE | `rm-207` |
| Saguntum: besieged / retaken by Rome | 219 BCE (Polybius's eight months; Livy gives it only as "some writers") / 212 BCE (Hallward) | `rm-208` |
| the Second Punic War | 218 – 201 BCE (the siege of Saguntum 219 BCE) | `rm-209` |
| Hannibal: born / to Spain / exiled / died | c. 247 BCE / 237 BCE / 195 BCE / 183 – 181 BCE (Atticus 183, Polybius 182, Sulpicius Blitho 181, in Nepos 13) | `rm-210` |
| Hannibal's crossing of the Alps | 218 BCE (Polybius prints no year; Berti and Vollrath, Hunt and Bainbridge and Cracolici do) | `rm-211` |
| war elephants: first met by Rome at Heraclea / Raphia / Zama / Thapsus | 280 BCE / 217 BCE / 202 BCE / 46 BCE | `rm-212` |
| the Battle of the Ticinus / the Trebia | 218 BCE (Dodge: mid-November) / 218 BCE (Dodge: December; Polybius gives the winter solstice) | `rm-213`, `rm-214` |
| the Battle of Lake Trasimene | 217 BCE (no ancient source gives the day) | `rm-215` |
| Quintus Fabius Maximus: first consul / dictator / died | 233 BCE / 217 BCE / 203 BCE (Feig Vishnia) | `rm-216` |
| the Fabian strategy / the Fabian Society founded | 217 BCE (the dictatorship) / 1884 | `rm-217` |
| the Battle of Cannae / Rome's response | 216 BCE (Polybius prints no day; a calendar day is a modern deduction and not printed) | `rm-218`, `rm-220` |
| the defection of Capua / its recapture | 216 BCE / 211 BCE (Lendering) | `rm-221` |
| the siege of Syracuse / Hieronymus died | 213 – 212 BCE (Rorres, Hallward; Polybius's eight months, Hallward's two and a half years) / 214 BCE (`rm-271` printed 211 BCE for the capture; it now prints no year) | `rm-222` |
| the Spanish campaigns of the Scipios / the Ebro battle | 218 – 211 BCE / 215 BCE (each year from a modern source) | `rm-223` |
| Scipio Africanus: elected aedile / in command | 213 BCE / 210 – 201 BCE (Hallward) | `rm-224` |
| the capture of New Carthage | 209 BCE (Richardson, Hallward, Goldsworthy, Hornblower; Polybius prints no year) | `rm-225` |
| the Battle of Ilipa | 206 BCE (Scullard, Goldsworthy, Hornblower) or 207 BCE (Hallward) | `rm-226` |
| Hasdrubal's march: Baecula / the Alps | 208 BCE / 207 BCE | `rm-227` |
| the Battle of the Metaurus | 207 BCE | `rm-228` |
| Scipio's African campaign: landed / the camps burnt / the Great Plains | 204 BCE / 203 BCE / 203 BCE | `rm-229` |
| Masinissa: joined Scipio / Syphax taken / died | 204 BCE / 203 BCE / 148 BCE ("ninety" is Polybius's word, not a printed birth year) | `rm-230` |
| the Battle of Zama | 202 BCE (Dodge, Hallward, Lendering; the season is disputed: spring, early autumn, or 19 October from a reported eclipse that Dodge rejects) | `rm-231` |
| the peace of 201 BCE | 201 BCE (Hallward dates the earlier draft of 5,000 talents to autumn 203 BCE) | `rm-232` |
| Italy after Hannibal: Capua taken / Toynbee's *Hannibal's Legacy* | 211 BCE / 1965 | `rm-233` |
| the Third Punic War | 149 – 146 BCE | `rm-234` |
| the destruction of Carthage / the Gracchan colony attempted | 146 BCE / 122 BCE (Lendering) | `rm-235` |
| the Conference of Naupactus / the Social War | 217 BCE / 220 – 217 BCE | `rm-236` |
| the Illyrian Wars: first / second | 229 – 228 BCE / 219 BCE (Holleaux; Polybius prints none) | `rm-237` |
| the First Macedonian War: Hannibal's pact / the Aetolian pact / peace of Phoenice | 214 – 205 BCE / 215 BCE / 212 or 211 BCE / 205 BCE | `rm-238` |
| Philip V: reigned / Hannibal pact / the Second Macedonian War | 221 – 179 BCE / 215 BCE / 200 – 197 BCE | `rm-239`, `rm-240` |
| the Aous battle | 198 BCE | `rm-240` |
| the Battle of Cynoscephalae | 197 BCE (modern reckoning; Polybius prints none) | `rm-241` |
| Flamininus: consul / beat Philip / the gold stater | 198 BCE / 197 BCE / 196 BCE (the British Museum caption) | `rm-242` |
| the freedom of the Greeks: proclaimed / the last garrisons out | 196 BCE / 194 BCE (Polybius, Eckstein and Holleaux have Roman troops in the Acrocorinth, Demetrias and Chalcis until then; Plutarch says otherwise) | `rm-243` |
| Antiochus III: reigned / Raphia / the eastern march / landed in Greece | 223 – 187 BCE (Livius.org says 222) / 217 BCE / 212 – 205 BCE / 192 BCE | `rm-244` |
| the Roman–Seleucid War: fought / driven out of Greece / peace | 192 – 188 BCE / 191 BCE / 188 BCE | `rm-245`, `rm-246`, `rm-248` |
| the Battle of Magnesia | 190 BCE (Shuckburgh) or 189 BCE (Holleaux: probably January) | `rm-247` |
| the Third Macedonian War | 171 – 168 BCE | `rm-249` |
| Perseus of Macedon: reigned | 179 – 168 BCE | `rm-250` |
| the Battle of Pydna | 22 June 168 BCE (a modern conversion via the eclipse the night before; Livy gives the Roman date) | `rm-251` |
| Aemilius Paullus: consul / triumph / censor / died | 182 BCE and 168 BCE / 167 BCE / 164 BCE / 160 BCE (the last two from the Loeb translator's footnotes, said so on the card) | `rm-252` |
| the settlement of Macedonia / the mines reopened | 167 BCE (the modern year; no ancient source prints one) / 158 BCE | `rm-253` |
| the Day of Eleusis | 168 BCE (Benecke, Bevan; no ancient author prints it) | `rm-254` |
| the Achaean War / the sack of Corinth | 146 BCE (no year given for Caesar's colony: sources give 46 and 44 BCE) | `rm-255`, `rm-256` |
| the province of Macedonia: organised / the Andriscus rising | 148 BCE (the Macedonian era; Mommsen puts the organisation two years after the victory) / 149 BCE | `rm-257` |
| the province of Asia: organised / the tax law / Phrygia added | c. 129 – 126 BCE / 123 BCE (some argue the companies reached Asia only about 100 BCE) / 116 BCE | `rm-258` |
| the bequest of Attalus III: died / reigned / envoys sent to Rome | 133 BCE / 138 – 133 BCE / 132 BCE | `rm-259` |
| the revolt of Aristonicus: began / Crassus killed / Aquillius / his triumph | 133 or 132 BCE / 130 BCE (not 131, the year he was consul) / 129 BCE / 126 BCE | `rm-260` |
| the Roman conquest of Spain: the Scipios land / the two provinces / Numantia falls / the Cantabrian wars | 218 BCE / 197 BCE (Schulten prints it for the boundary, not for the provinces' origin) / 133 BCE / 29 – 19 BCE | `rm-261` |
| the Celtiberian Wars: first / second / Nobilior beaten | 181 – 179 BCE / 153 – 151 BCE (a modern numbering) / 23 August 153 BCE (Schulten) | `rm-262` |
| the Lusitanian War / Galba's massacre | c. 155 – 139 BCE / 150 BCE | `rm-263` |
| Viriathus: his leadership | c. 146 – 138 BCE (Schulten; the ancient authors give eight, eleven and fourteen years) | `rm-264` |
| the Numantine War: fought / Mancinus yields / Scipio arrives | 143 – 133 BCE / 137 BCE / 134 BCE (Schulten) | `rm-265` |
| Scipio Aemilianus: consul / took Carthage / took Numantia / died | 147 BCE / 146 BCE / 133 BCE / 129 BCE | `rm-266` |
| the provincial system: the island praetors / the Sempronian law | 227 BCE / c. 123 BCE | `rm-267` |
| the publicani: Traditional / the army contract | 493 BCE (Dionysius's date, as Malmendier reports it) / 216 BCE | `rm-268` |
| provincial taxation: Spain's ruling / Macedonia's tribute halved / Gaius Gracchus tribune | 171 BCE / 167 BCE / 123 – 122 BCE | `rm-269` |
| the wealth of empire: the taxes repaid / the war tax ended / the mines reopened | 187 BCE / 167 BCE / 158 BCE | `rm-270` |
| Greek influence on Roman culture: the alphabet arrives / the philosophers' envoys at Rome | c. 800 – 750 BCE (a 'first half of the 8th century' converted to the house range) / 155 BCE (Forsythe's review; no ancient year is printed) | `rm-271` |
| Cato the Elder: lived / consul / censor | 234 – 149 BCE / 195 BCE / 184 BCE | `rm-273` |
| the Bacchanalian affair: the affair / the Senate's decree / the Tiriolo tablet found | 186 BCE / 7 October 186 BCE (read off the tablet's own date) / 1640 | `rm-274` |
| sumptuary laws: passed / the Oppian law / the Fannian law | 215 – 18 BCE / 215 – 195 BCE / 161 BCE | `rm-275` |
| the crisis of the Roman Republic: usual start / usual end / a shorter span | 133 BCE / 31 or 27 BCE / 133 – 49 BCE (a modern convention; each end is a convention, said so) | `rm-276` |
| the decline of the Italian smallholder: the census fall / the Gracchan reform | 163 – 135 BCE (Brunt's figures; his table lost its year column in the scan and the years were matched by his own sentence) / 133 BCE | `rm-278` |
| the First Servile War: fought / Rupilius wins | c. 135 – 132 BCE (one review has roughly 141 – 131) / 132 BCE | `rm-280` |

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
rm-091: 509; 27
rm-092: 509; 153
rm-093: 509; 13; 1547
rm-095: 700; 600; 1926
rm-096: 509
rm-097: 508
rm-098: 508; 507
rm-099: 499; 496; 484
rm-100: 493; 340; 338
rm-101: 494; 287; 367
rm-102: 494
rm-103: 494; 457; 133
rm-104: 494; 449
rm-105: 471; 287
rm-106: 494; 449; 366
rm-107: 493
rm-108: 458; 439
rm-109: 501; 216; 202; 82
rm-110: 451; 450; 449
rm-111: 451; 450; 449
rm-112: 451; 450; 449
rm-113: 449
rm-114: 449; 339; 287
rm-115: 445
rm-116: 444; 367
rm-117: 443; 434; 351; 22
rm-118: 447; 421; 409
rm-119: 396; 264; 340
rm-120: 406; 396; 403
rm-121: 396; 391; 390
rm-122: 406; 403
rm-123: 390; 387; 386
rm-124: 390; 387; 386
rm-125: 390; 387; 386
rm-126: 390; 387; 386
rm-127: 391; 390
rm-128: 367; 366
rm-129: 342; 172
rm-131: 342; 180; 81
rm-132: 366; 337; 242; 227
rm-134: 326; 313
rm-135: 287
rm-136: 300
rm-137: 312; 311; 307; 296; 280
rm-138: 312; 311; 296; 293; 291; 264
rm-139: 312; 144; 140; 11; 4
rm-140: 300; 269; 245; 218; 201
rm-141: 387; 386; 280; 275; 264
rm-142: 340; 338
rm-143: 534; 509; 451; 338
rm-144: 318; 211; 90
rm-145: 338; 177; 89; 74
rm-146: 381; 338; 90; 81; 84
rm-147: 353; 338; 188; 90
rm-148: 338; 329; 184; 80
rm-149: 334; 181
rm-150: 367; 338; 133; 111
rm-151: 343; 341; 326; 304; 298; 290
rm-152: 343; 341; 354
rm-153: 326; 304; 321
rm-154: 321
rm-155: 350; 100; 340
rm-156: 298; 290
rm-157: 295
rm-158: 396; 310; 264
rm-159: 308; 299; 268; 264
rm-160: 284; 283; 232
rm-161: 225; 224
rm-162: 225; 222; 218; 191
rm-163: 706; 282; 281; 272
rm-164: 319; 272; 280; 275
rm-165: 280
rm-166: 279
rm-167: 279; 280
rm-168: 275; 268
rm-169: 272
rm-171: 173; 90
rm-172: 209; 204; 111
rm-173: 220; 27
rm-174: 187; 189; 183
rm-175: 312; 250
rm-176: 753; 167
rm-177: 396; 392; 146; 75
rm-178: 338; 1905
rm-180: 271; 270; 264
rm-181: 814; 813; 800; 750; 146
rm-182: 550; 241; 146
rm-183: 335; 196
rm-184: 264; 241; 201
rm-185: 509; 348; 306; 279
rm-186: 264; 241
rm-187: 289; 271; 270; 264
rm-188: 493; 476; 264
rm-189: 269; 215; 263
rm-190: 262
rm-191: 261; 260
rm-192: 260; 256
rm-193: 260
rm-194: 256
rm-195: 256; 255
rm-196: 267; 256; 255
rm-197: 250; 241; 249
rm-198: 247; 244; 241; 237; 229; 228
rm-199: 241; 264
rm-200: 241
rm-201: 241
rm-202: 227
rm-203: 241; 237
rm-204: 237; 238; 227
rm-205: 237; 229; 228; 221
rm-206: 229; 227; 221; 209
rm-207: 226; 218
rm-208: 219; 212
rm-209: 218; 201; 219
rm-210: 247; 237; 195; 183; 181
rm-211: 218
rm-212: 280; 217; 202; 46
rm-213: 218
rm-214: 218
rm-215: 217
rm-216: 233; 217; 203
rm-217: 217; 1884
rm-218: 216
rm-220: 216
rm-221: 216; 211
rm-222: 213; 212; 214
rm-223: 218; 211; 215
rm-224: 213; 210; 201
rm-225: 209
rm-226: 206; 207
rm-227: 208; 207
rm-228: 207
rm-229: 204; 203
rm-230: 204; 203; 148
rm-231: 202
rm-232: 201
rm-233: 211; 1965
rm-234: 149; 146
rm-235: 146; 122
rm-236: 217; 220
rm-237: 229; 228; 219
rm-238: 214; 205; 215; 212; 211
rm-239: 221; 179; 215; 200; 197
rm-240: 200; 197; 198
rm-241: 197
rm-242: 198; 197; 196
rm-243: 196; 194
rm-244: 223; 187; 217; 212; 205; 192
rm-245: 192; 188; 191
rm-246: 191
rm-247: 190; 189
rm-248: 188
rm-249: 171; 168
rm-250: 179; 168
rm-251: 168
rm-252: 182; 168; 167; 164; 160
rm-253: 167; 158
rm-254: 168
rm-255: 146
rm-256: 146
rm-257: 148; 149
rm-258: 129; 126; 123; 116
rm-259: 133; 138; 132
rm-260: 133; 132; 130; 129; 126
rm-261: 218; 197; 133; 29; 19
rm-262: 181; 179; 153; 151; 23
rm-263: 155; 139; 150
rm-264: 146; 138
rm-265: 143; 133; 137; 134
rm-266: 147; 146; 133; 129
rm-267: 227; 123
rm-268: 493; 216
rm-269: 171; 167; 123; 122
rm-270: 187; 167; 158
rm-271: 800; 750; 155
rm-273: 234; 149; 195; 184
rm-274: 186; 7; 1640
rm-275: 215; 18; 195; 161
rm-276: 133; 31; 27; 49
rm-278: 163; 135; 133
rm-280: 135; 132
```
