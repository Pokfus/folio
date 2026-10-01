# Ancient Greece — the chronology the collection commits to

The dates and name spellings the Ancient Greece collection (`col-13`, `gr-001`–`gr-1000`) uses, in ONE
place, so that no two cards disagree about when something happened or how it is spelled. Written in Sep
2026 as Batch 0 of the refinement audit (`docs/greece-refinement-audit.md`).

**Every date line and every date in a background must agree with this file.** Where a card needs a date
this file does not carry, add the row here in the same commit as the card, with the source it came from.
Where a card's own research shows a row here is wrong, correct the row and grep the collection for the
old figure on the day — a correction does not travel on its own.

`node .claude/greece-audit.js` reads the `chronology-pins` block at the foot of this file and reports any
pinned card whose date line does not carry its pinned years.

## Conventions

- **Eras are BCE and CE.** Every year under 1000 carries its era, on the date line and in prose
  (`cardYears` reads a bare first-millennium number only through the era rule).
- **`c.` goes in front of a range, never inside it**: `c. 1750 – 1470 BCE`, not `c. 1750 – c. 1470 BCE`
  — a `c.` inside a range breaks the era's leftward carry and the card sorts by its second year.
- **A disputed date is a RANGE, and says whose it is**: in a date line as two rows (`Erupted` / `Also
  dated`), in prose as "radiocarbon dates put it … ; the archaeological sequence puts it …".
- **A date no source gives is omitted, never estimated.** A mythical or Homeric figure takes no life dates;
  the card's line dates the text or cult that attests them.
- **Questions carry no dates at all** (no year, century, millennium or decade). Period names are fine.

## Spellings

Measured over the shipped collection in Sep 2026; the house form is the one the collection already uses
most, which is the Latinised form for people and most places and the transliterated form where that is
now the standard name of an excavated site.

| use | not |
|---|---|
| Knossos | Cnossus |
| Malia | Mallia (Rutter's older form; keep only inside a cited title) |
| Phaistos | Phaestos, Phaestus |
| Zakros | Kato Zakros (except for the site's lower town, named as such) |
| Ayia Triada | Hagia Triada, Agia Triada |
| Kythera | Cythera |
| Akrotiri, Thera | Santorini only for the modern island group |
| Peisistratus | Pisistratus, Peisistratos |
| Cleisthenes, Cleomenes, Pericles, Themistocles, Alcibiades | the K- forms |
| Croesus, Lycurgus, Miletus, Artemisium | Kroisos, Lykourgos, Miletos, Artemision |
| Harmodius, Polycrates, Periander, Cypselus, Archilochus, Alcaeus | the -os forms |
| Achaemenid | Achaemenian |
| Mycenaean | Mycenean |
| Orientalising | Orientalizing (the site's spelling switch converts for an American reader) |

## The Aegean Bronze Age

The relative sequence is the standard one (Early, Middle and Late Minoan on Crete; Cycladic on the
islands; Helladic on the mainland). The ABSOLUTE dates follow the palatial framework as tabulated on
J. B. Rutter's *Aegean Prehistoric Archaeology* chronology page (Dartmouth), which the collection
already cites, taking the earlier of each of its paired figures where it gives two:

| period | the collection says | Rutter gives |
|---|---|---|
| Aegean Bronze Age (whole) | c. 3100 – 1050 BCE | EM I begins 3100/3000; LM IIIC ends 1075/1050 |
| Prepalatial Crete (EM I – MM IA) | c. 3100 – 1900 BCE | 3100/3000 – 1925/1900 |
| Protopalatial / Old Palace (MM IB – MM IIB) | c. 1900 – 1750 BCE | 1925/1900 – 1750/1720 |
| Neopalatial / New Palace (MM IIIA – LM IB) | c. 1750 – 1470 BCE | 1750/1720 – 1490/1470 |
| Postpalatial (LM IIIA – C) | c. 1470 – 1075 BCE | 1490/1470 – 1075/1050 |
| Early Minoan I / II / III | c. 3100 – 2650 / 2650 – 2200 / 2200 – 2050 BCE | Manning's phases as tabulated by Graziadio 2025, Table 2.1, pp. 57–58 |
| Early Cycladic I (Grotta-Pelos) | c. 3100 – 2650 BCE | |
| Early Cycladic II (Keros-Syros) | c. 2650 – 2400 BCE | |
| Keros and Dhaskalio in use | c. 2750 – 2250 BCE | the British School gives 2750 – 2240; Carter et al. 2025 end Phase C at 2250 |
| Knossos first settled | c. 6900 – 6600 BCE | Douka et al. 2017, modelled radiocarbon |
| Mycenaean palaces | c. 1400 – 1200 BCE | Rutter, Lesson 20: Mycenae, Tiryns and Thebes no earlier than LH IIIA2 (ca. 1400 – 1340), Pylos and Gla LH IIIB; all destroyed at the end of LH IIIB, and no LH IIIC palace is known (`gr-056`) |
| Malia: Old / New palace; reoccupied | c. 1900 – 1700 / 1700 – 1450; c. 1375 – 1200 BCE | the École française d'Athènes' own periodisation, which puts Malia's break at 1700 rather than 1750 |
| Phaistos: Old / New palace | c. 1900 – 1750 / 1750 – 1470 BCE | Rutter's pair; the Hellenistic town was razed by Gortyn in the mid-2nd century BCE (Strabo 10.4.14) |
| Zakros: older building; palace | c. 1900 BCE; c. 1750 – 1470 BCE | Odysseus (Greek ministry) for the older building; the palace is MM IIIA – LM IB |
| Gournia town | c. 1750 – 1490 BCE | Gournia Excavation Project |
| Cretan hieroglyphic in use | c. 1900 – 1700 BCE | MM IB – MM III (Meissner and Salgarella 2024); MM III ends 1700/1675 (Graziadio 2025) |
| Linear A in use | c. 1800 – 1450 BCE | SigLA |
| LM IB destructions | mid-15th century BCE | Manning 2022; the collection's figure stays `c. 1470 BCE`, and a card may say "the mid-15th century" |
| Kamares ware | c. 1900 – 1750 BCE | MM IB – MM IIB on Rutter's chronology page; his Lesson 10 still dates MM IB 2000/1950 – 1900/1850, the older scheme, and the collection follows the chronology page |
| Phaistos Disc made | c. 1700 BCE | MM IIIA as the likeliest date (Meissner and Salgarella 2024); the Heraklion museum says the 17th century; the find context gives only a latest date |
| Temple Repositories filled | c. 1700 BCE | MM III (Rutter); the museum dates the smaller snake goddess to about 1600 BCE, and `gr-024` gives both |
| Bull-leaping (Taureador) fresco | soon after 1550 BCE | the Heraklion museum's date; inside the Neopalatial figured-fresco horizon, which is c. 1750 – 1470 |
| Marine Style | c. 1500 BCE, ending c. 1470 BCE | LM IB; the museum dates the Phaistos and Zakros rhyta to about 1500 |
| Peak sanctuaries | worship from c. 1900 BCE; buildings c. 1750 BCE; decline after c. 1470 BCE | Rutter, Lesson 15 |
| Cult caves | worship from c. 1900 BCE; still visited to c. 1075 BCE | Rutter, Lesson 15, with the chronology page for the end of LM IIIC |
| Mesara tholos tombs | built from c. 3000 BCE; fewer in use after c. 1900 BCE | Déderix, Schmitt and Caloi 2025 give EM I as 3000 – 2650 after Warren, the other half of the collection's 3100/3000; Rutter has one tomb (Lebena A) in use in the Final Neolithic and a few, such as Kamilari, into LM I or later |
| Ayia Triada sarcophagus | c. 1400 BCE | LM IIIA1, the early 14th century (Rutter); the Heraklion museum says about 1400 |
| Palaikastro LM IB destruction | c. 1450 BCE | the British School's own figure, which `gr-040` gives; Poursat's review puts the kouros's context at about 1475 |
| Mochlos | settled c. 3100 – 1200 BCE; town burnt c. 1470 BCE | INSTAP Study Center; the LM III cemetery at Limenaria runs c. 1400 – 1250 BCE (Galanakis's review), which `gr-034` uses |
| Pseira | early town destroyed c. 1750 BCE; rebuilt town destroyed c. 1470 BCE | INSTAP Study Center: destroyed in MM IIB, rebuilt in LM IA, burnt at the end of LM IB |
| Shaft graves at Mycenae | c. 1650 – 1500 BCE | Rutter, Lesson 16: Grave Circle B ca. 1650 – 1550, Grave Circle A ca. 1600 – 1500 (Dickinson shortens both to 1600 – 1500) |
| Mycenaean civilisation | c. 1650 – 1100 BCE | the Dickinson College Mycenae Excavations page dates LH I from ca. 1650; the Athens museum gives 1600 – 1100 and puts the end in the 11th century BCE (`gr-056`) |
| Grave Circle B | c. 1650 – 1550 BCE; the ministry dates its first rulers c. 1700 BCE | Rutter's range, and Odysseus ("approximately 1700 BC"); `gr-061` gives both, and `gr-058` dates Mycenae's first rulers to the ministry's c. 1700 BCE |
| Grave Circle A | burials c. 1600 – 1500 BCE; refurbished c. 1250 BCE | Rutter, Lesson 16; Odysseus: taken inside the new wall of LH IIIB1 with the Lion Gate and "refurbished and used for ancestral cults" (`gr-060`) |
| Mycenae | Bronze Age rule c. 1700 – 1100 BCE; palace and walls c. 1350 – 1200 BCE; Lion Gate c. 1250 BCE; razed by Argos 468 BCE | Odysseus (history tab): walls from c. 1350, the Lion Gate about a century later, abandonment c. 1100; Mycenae Excavations: Lion Gate 1250 BC; Diodorus 11.65 with the Loeb date for the sack (`gr-058`, `gr-059`) |
| Tholos tombs at Mycenae | c. 1525 – 1275 BCE; great new tholoi end by c. 1250 BCE | Rutter, Lesson 19 ("ca. 1525 to 1300/1275"); Galanakis 2021, p. 599 (`gr-064`) |
| Treasury of Atreus | c. 1350 – 1250 BCE (disputed) | the ministry (Psychogiou) says ca. 1250 BC; the Athens museum dates a façade epistyle ca. 1350 BC; Rutter puts the group in LH IIIB. `gr-065` gives the range and says whose each end is |
| Heinrich Schliemann | born 6 January 1822; Hisarlik from April 1870; Mycenae 1876; died 26 December 1890 | Calder 1972 and *Ilios* for the birth; *Ilios* p. 20 for Hisarlik; Schuchhardt p. 16 n. for the death at Naples (`gr-057`) |
| Cyclopean walls of the Argolid | c. 1350 – 1200 BCE; last great circuits c. 1250 BCE | Odysseus (Mycenae, history tab): first Cyclopean wall c. 1350 BC; Rutter, Lesson 21: earliest systems later LH IIIA, the final ones "ca. 1250 B.C."; Odysseus (Tiryns): begun in the 14th century, finished at the end of the 13th (`gr-066`, `gr-067`) |
| Fall of the mainland palaces | c. 1200 BCE; Pylos c. 1200 – 1180 BCE | Tiryns and Midea "around 1200 BC" (Odysseus; Swedish Institute); Thebes "not long after 1225 BC" (Aravantinos et al., via Dickey's BMCR review) or c. 1200 (Thebes museum); Pylos c. 1200 – 1180 BCE, early LH IIIC (Judson 2023) and LH IIIC Early (Middleton 2024) (`gr-067` – `gr-070`) |
| Gla | in use c. 1300 – 1190 BCE | the excavators (Lane and Kountouri, MYNEKO 2016): LH IIIB fortress ca. 1300 – 1190 BCE, burnt once, rebuilt, burnt again ca. 1190; the Thebes museum "close to 1200 BC". Rutter's early-LH IIIB destruction is superseded (`gr-071`) |
| Kopais dyke | c. 1250 BCE (mid-13th century); modern drainage 1882 – 1931 | Kountouri et al. 2013: pottery from the dyke is LH IIIB, "the middle of the 13th century BC"; AROURA for the French (1882) and British (1887 – 1931) companies. The old card's "reflooded c. 1100 BCE" traces to Mamassis's misreading of Strabo and is dropped; the card gives "perhaps between 1200 and 1100 BCE" after Lauffer (via AROURA) in prose only (`gr-099`) |
| Linear B tablets on the mainland | c. 1400 – 1200 BCE | the convention of the B8 cards on Linear B and Mycenaean institutions (`gr-074` – `gr-087`, `gr-095`, `gr-096`); Palaima 1999 gives "end of LM II (ca. 1400 B.C.) to the end of LH IIIB (ca. 1200 B.C.)" |
| Decipherment of Linear B | announced 1 July 1952; first paper 1953; *Documents* 1956 | the Cambridge Mycenaean Epigraphy Group and the British Academy memoir of Chadwick (`gr-075`) |
| Dendra cuirass tomb (chamber tomb 12) | c. 1400 BCE; found 1960 | the Swedish Institute at Athens: "end of the 15th century BC"; the old "c. 1500 BCE" is dropped (`gr-088`) |
| Vapheio tholos | 15th century BCE (c. 1500 – 1400 BCE); found 1889 | the Athens museum's date for the Vapheio amethyst seal; Tsountas and Manatt, p. 7, for the 1889 dig. No open source dates the cups themselves (`gr-092`) |
| Uluburun ship | sank c. 1320 BCE (c. 1335 – 1300 debated); excavated 1984 – 1994 | INA: ca. 1320 ± 15 BC; Smith 2023: ca. 1335 – 1305; Rutter ca. 1310; Bachhuber 2006: the 1305 dendro date was too early, the Nefertiti scarab sets the earliest limit (`gr-094`) |
| Cape Gelidonya ship | c. 1200 BCE | INA ("late 13th c."; "about 1200 B.C."); Rutter "around 1200 B.C. or a little later" (`gr-093`) |
| Mycenaean Miletus | Minoan from c. 1700 BCE; Mycenaean from c. 1400 BCE; Hittite conquests end of the 14th century and c. 1200 BCE | Gorman (via Smith's BMCR review) for 1700; Kelder 2010 for 1400; the Hamburg excavation's history page for the two conquests (`gr-098`) |
| Petras | settled before 3000 BCE; palatial town c. 1900 – 1470 BCE | Late Neolithic on the eastern slope (Chronique 1793); the leading centre of its district by MM IB – IIA (Caloi's review); burnt in LM IB and reoccupied |
| Kastri, Kythera | Cretan in character c. 1900 – 1470 BCE | Graziadio 2025, p. 80, for the Protopalatial; the end is the collection's LM IB figure |
| Keftiu in Theban tombs | c. 1479 – 1425 BCE | the Metropolitan Museum's date for the Rekhmire copy, Thutmose III to early Amenhotep II |
| Mari records of the Caphtorians | c. 1780 – 1760 BCE | the palace of Zimri-Lim, as Palaima and Wilson-Wright's review gives it |
| Cretan pottery at Kahun and Harageh | c. 1900 – 1850 BCE | Rutter's "early 19th century", MM IB – IIA; Petrie puts the Kahun heaps under Senusret II |
| Final Palatial (Mycenaean) Knossos | c. 1470 – 1375 BCE | LM II – IIIA2 early; Rutter's pair is 1490/1470 – 1385/1375, and the collection takes the later of the first and the conventional fire date for the second (`gr-051`) |
| Knossos Linear B tablets | Chariot Tablets c. 1390 – 1370 BCE; the bulk c. 1375 BCE or c. 1250 BCE | the Room of the Chariot Tablets is LM IIIA1 (Driessen, as Lane's BMCR review gives it; Firth and Skelton 2016); the bulk is early LM IIIA2 on the conventional view and c. 1250 BCE, LM IIIB1/2, on Hallager's (Firth and Skelton, n. 38); `gr-052` gives both |
| Hilltop refuge settlements | from c. 1200 BCE; Karphi c. 1200 – 1000 BCE | the Kavousi Kastro founded at the start of LM IIIC and Vronda's settlement LM IIIC, c. 1200 – 1100 (INSTAP Study Center); Karphi after Wallace, as Antoniadis's BMCR review gives it; `gr-053` |
| Eteocretan inscriptions | c. 650 BCE to the 3rd century BCE | the Dreros text mid-7th century, the five from Praisos 6th – 3rd century (Zitelli 2024, after Duhoux 1982); Mnamon gives 7th – 3rd century |
| Praisos destroyed by Hierapytna | 145 – 140 BCE | Whitley 2023, between the death of Ptolemy Philometor and the consulship of C. Laelius (Strabo 10.4.12 for the event) |
| Idaean Cave | sheltering from the late 4th millennium BCE; cult from c. 1700 BCE; greatest age 900 – 600 BCE; last known rite 361 – 363 CE | Mikrakis (DECF 2016): cult from the early Late Bronze Age, "c. 1700 – 1450 BC"; the bronze shields 8th century BCE; an initiation under Julian. **Kamares ware is named after the Kamares cave, a different cave on Ida**, and is no evidence for this one (`gr-055` carried that error before B6) |

**Three standing notes.** (1) "Neopalatial" and "Postpalatial" do not describe KNOSSOS, which went on
functioning as an administrative centre after the other palaces fell (Rutter says so in terms); a Knossos
card says "the other palaces" rather than "the palaces". (2) The Minoan palaces were first built at the
start of MM IB and all but Knossos were destroyed in LM IB — `c. 1470 BCE` is the collection's figure for
that destruction horizon (`gr-050` may keep its `c. 1490 – 1470 BCE` span, which is Rutter's pair).
(3) **The final destruction of the Knossos palace is disputed**: the conventional date is early LM IIIA2,
`c. 1375 BCE`, and Rutter records a further destruction in LM IIIB; a card gives `c. 1375 BCE` and, where
the question matters, says that some scholars put the end later.

### The Thera eruption

**Disputed, and given as a range with whose it is.** Radiocarbon — above all the olive branch buried
alive on Thera — long put it at `c. 1627 – 1600 BCE`; the archaeological synchronisms with Egypt put it in
the 16th century. **The newer radiocarbon calibration has moved the science towards the second**:
Graziadio (2025, p. 56) reports that IntCal20 and the Pearson et al. tree-ring work make 1611 BCE
"unlikely" and 1561 BCE "a reasonable hypothesis", while calling the date still unsettled, and Manning
(2022) argues for the Second Intermediate Period. So a card now writes **"recent studies favour the
16th century BCE, and others allow about 1610 BCE"** (that is `gr-001`'s wording), and a date line gives
the range `c. 1610 – 1540 BCE` rather than either figure alone. It fell late in LM IA. A card never gives
one of the two as settled. **B5 brought `gr-042`–`gr-045` into line**: each date line reads `c. 1610 – 1540 BCE`,
and each card's prose gives both ends, with the 1540 BCE end resting on Rutter's `ca. 1550/1540`.

## The Early Iron Age and the Archaic period (to be confirmed as each deck's batch reaches it)

| | |
|---|---|
| Postpalatial / Submycenaean end | c. 1075 – 1050 BCE |
| Protogeometric | c. 1050 – 900 BCE |
| Geometric | c. 900 – 700 BCE |
| Orientalising | c. 720 – 620 BCE |
| Archaic period | c. 800 – 480 BCE (from 776 BCE where a card counts from the first Olympiad) |
| First Olympic Games (traditional) | 776 BCE |
| Classical period | 480 – 323 BCE |
| Hellenistic period | 323 – 31 BCE |

## Events and reigns (to be confirmed as each deck's batch reaches it)

The standard dates, as the collection already carries them; each will be checked against the card's own
sources when its batch comes round, and a disputed one given as a range.

| event or person | date |
|---|---|
| Draco's laws | c. 621 BCE |
| Solon's archonship | 594 BCE |
| Peisistratus tyrant | 561 – 528 BCE (with two exiles) |
| Hipparchus killed by Harmodius and Aristogeiton | 514 BCE |
| Hippias expelled | 510 BCE |
| Cleisthenes' reforms | 508 – 507 BCE |
| Croesus king of Lydia | c. 560 – 546 BCE (the fall of Sardis is conventionally 546 BCE; disputed) |
| Cyrus II | c. 559 – 530 BCE |
| Darius I | 522 – 486 BCE |
| Xerxes I | 486 – 465 BCE |
| Ionian Revolt | 499 – 494 BCE (Lade 494 BCE) |
| Marathon | 490 BCE |
| Thermopylae, Artemisium, Salamis | 480 BCE |
| Plataea, Mycale | 479 BCE |
| Delian League founded | 478 – 477 BCE |
| Eurymedon | c. 466 BCE (469 – 466 BCE) |
| Peloponnesian War | 431 – 404 BCE |
| Peace of Nicias | 421 BCE |
| Sicilian Expedition | 415 – 413 BCE |
| Aegospotami | 405 BCE |
| Socrates executed | 399 BCE |
| Leuctra | 371 BCE |
| Philip II | 359 – 336 BCE |
| Chaeronea | 338 BCE |
| Alexander III | born 356 BCE; reigned 336 – 323 BCE |
| Ipsus | 301 BCE |
| Sack of Corinth | 146 BCE |
| Actium | 31 BCE |

```chronology-pins
gr-001: 3100; 1050
gr-004: 2750; 2250
gr-005: 3100; 2050
gr-006: 3100; 1900; 1750; 1470; 1075
gr-007: 8 July 1851; 11 July 1941
gr-008: 1900; 1375
gr-009: 1900; 1750; 1470
gr-010: 1470; 1375
gr-011: 1900; 1750; 1470
gr-012: 1900; 1700; 1450; 1375; 1200
gr-013: 1900; 1750; 1470
gr-014: 1750; 1490
gr-015: 1900; 1750; 1925; 1700
gr-016: 1750; 1470; 1720; 1490
gr-017: 1900; 1470
gr-018: 1900
gr-019: 1900; 1700
gr-020: 1800; 1450
gr-021: 1700
gr-022: 1750; 1470
gr-023: 1550
gr-024: 1700; 1600
gr-025: 1900; 1750
gr-026: 1500; 1470
gr-027: 1900; 1750
gr-028: 1900; 1750; 1470
gr-029: 1900; 1075
gr-031: 1900; 1470; 1075
gr-032: 1900; 1075
gr-033: 1400
gr-034: 1470; 1400; 1250
gr-035: 3000; 1900
gr-036: 1750; 1470
gr-037: 1750; 1470
gr-038: 3100; 1200; 1470
gr-039: 1750; 1470
gr-040: 1450
gr-041: 3000; 1900; 1470
gr-042: 1610; 1540
gr-043: 1610; 1540
gr-044: 1610; 1540
gr-045: 1610; 1540
gr-046: 1900; 1850
gr-047: 1479; 1425; 1780; 1760
gr-048: 1750; 1490
gr-049: 1900; 1470
gr-050: 1490; 1470
gr-051: 1470; 1375
gr-052: 1390; 1370; 1375; 1250
gr-053: 1375; 1200; 1075
gr-054: 650; 145; 140
gr-055: 1700; 900; 600; 361; 363
gr-056: 1650; 1500; 1400; 1200; 1100
gr-057: 6 January 1822; 26 December 1890
gr-058: 1700; 1100; 1350; 1200; 468
gr-059: 1250
gr-060: 1600; 1500; 1250
gr-061: 1650; 1550; 1700
gr-062: 1600; 1500
gr-063: 1650; 1500
gr-064: 1525; 1275; 1250
gr-065: 1350; 1250
gr-066: 1350; 1200; 1250
gr-067: 1200; 1884; 1885
gr-068: 1200; 1180; 1939
gr-069: 1200; 1993; 1995
gr-070: 1200; 1983
gr-071: 1300; 1190
gr-072: 1350; 1200
gr-073: 1250; 1200
gr-074: 1400; 1200
gr-075: 1952; 1953; 1956
gr-076: 1400; 1200
gr-077: 1939; 1200
gr-078: 1400; 1200
gr-079: 1400; 1200
gr-080: 1400; 1200
gr-081: 1400; 1200
gr-082: 1400; 1200
gr-083: 1400; 1200
gr-084: 1400; 1200
gr-085: 1400; 1200
gr-086: 1400; 1200
gr-087: 1400; 1200
gr-088: 1400; 1960
gr-089: 1600; 1500
gr-090: 1600; 1500
gr-091: 1300; 1200
gr-092: 1500; 1400; 1889
gr-093: 1725; 1675; 1200
gr-094: 1320; 1984; 1994
gr-095: 1400; 1200
gr-096: 1400; 1200
gr-097: 1375
gr-098: 1700; 1400
gr-099: 1250; 1882; 1931
gr-100: 1300
```
