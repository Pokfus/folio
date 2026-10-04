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
| Isthmian wall | c. 1250 – 1200 BCE | Rutter, Lessons 21 and 28: of the age of the last Argolid circuits, c. 1250 BCE, and apparently unfinished when the palaces fell c. 1200 BCE (`gr-101`) |
| Troy VI; Troy VIIa | Troy VI from c. 1750 BCE, wrecked c. 1300 BCE; Troy VIIa destroyed c. 1230 – 1180 BCE (the general figure c. 1200 BCE) | Easton and Weninger and Rutter, Lesson 23, for the start; Hope Simpson for the earthquake c. 1300 and the sack c. 1200; Rutter, Lesson 27, for 1230 – 1180, adding that Blegen came to put it a generation earlier (`gr-102`, `gr-103`) |
| Troy made a city | 334 BCE | Strabo 13.1.26: Alexander's visit (`gr-102`) |
| Lower city of Troy: the ditches | inner ditch c. 1500 – 1400 BCE; outer ditch c. 1250 – 1175 BCE (Troy VIIa) | Jablonka and Rose 2004 (`gr-104`) |
| Beşik Bay graves | c. 1360 – 1320 BCE | Rutter, Lesson 23, and Kolb 2004 (`gr-105`) |
| Wilusa in Hittite texts | c. 1400 – 1209 BCE; the Alaksandu treaty c. 1280 BCE | Hope Simpson: from Tudhaliya I/II, c. 1400, to the end of Tudhaliya IV, c. 1209; Rose and Kolb for Muwatalli II's treaty (`gr-106`) |
| Late Bronze Age collapse | c. 1250 – 1150 BCE; Ugarit burned c. 1200 – 1175 BCE | Knapp and Manning 2016 (`gr-107`) |
| Ramesses III's war with the Sea Peoples | his 8th year, 1177 BCE, or 1188 BCE on a revised chronology | Breasted's *Ancient Records* for the year; Knapp and Manning for the two chronologies. A date line gives the range c. 1188 – 1177 BCE (`gr-108`) |
| Destruction of the Palace of Nestor | c. 1200 – 1180 BCE | early LH IIIC: Van Damme's review of Jung and Kardamaki, and Judson 2023 (`gr-109`; agrees with the "Fall of the mainland palaces" row) |
| Postpalatial Greece (LH IIIC) | c. 1200 – 1050 BCE; Mycenae burnt again c. 1150 – 1125 BCE | Rutter, Lesson 29; Mikrakis's review of Middleton for the regional patchwork (`gr-110`) |
| Depopulation of southern Greece | steepest c. 1200 – 1100 BCE | Rutter, Lesson 28 (`gr-115`) |

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
| Submycenaean | c. 1070 – 1000 BCE (corrected in B11–B14; see the next section) |
| Protogeometric | c. 1050 – 900 BCE; start c. 1020 – 1000 BCE by radiocarbon |
| Geometric | c. 900 – 700 BCE |
| Orientalising | the end of the 8th century BCE through the 7th (corrected by B35, `gr-322`: no reachable source gives the old c. 720 – 620 BCE, so the card's line is empty and its prose says the centuries) |
| Archaic period | c. 800 – 479 BCE; the older start 700 BCE (corrected by B35, `gr-321`: its histories end at 479 BCE, the year of Plataea and Mycale; from 776 BCE where a card counts from the first Olympiad) |
| First Olympic Games (traditional) | 776 BCE |
| Classical period | 480 – 323 BCE |
| Hellenistic period | 323 – 31 BCE |

## The Early Iron Age (confirmed by B11–B18, `gr-111` – `gr-170`)

**The periods are pottery phases, and their absolute dates are moving.** The conventional figures are kept
as each card's first row; the radiocarbon figures, where a card gives them, are a second row saying so.

| period or event | the collection says | source |
|---|---|---|
| Greek Dark Ages (the old name) | c. 1050 – 700 BCE | Rutter, Lesson 29; the Protogeometric stage after Papadopoulos's review of Lemos and Scotton's of Dickinson (`gr-111`) |
| Submycenaean | c. 1070 – 1000 BCE | **corrected in B11–B14** from the provisional "c. 1075 – 1050". Toffolo et al. 2013 end it c. 1020 – 1000 BCE by radiocarbon from Lefkandi, Kalapodi and Corinth; the start, c. 1070 BCE, is another team's figure, which they take as likely (`gr-112`). The ministry's Kerameikos page starts it c. 1100 BCE, and `gr-123` says whose that is |
| Protogeometric | c. 1050 – 900 BCE; start c. 1020 – 1000 BCE by radiocarbon | **corrected in B11–B14**: the conventional 1050 is kept, and Toffolo et al. 2013 put the start at c. 1020 – 1000 BCE, "probably too high" being their verdict on 1050 (`gr-111`, `gr-113`) |
| Geometric | c. 900 – 700 BCE; Late Geometric from c. 760 BCE | Kotsonas 2016 and Gimatzidis and Weninger 2020; radiocarbon from Zagora and Sindos would start Late Geometric more than a century earlier (Alagich et al. 2024), which `gr-114` gives as a debate |
| Lefkandi | first settled c. 2100 BCE; cemeteries c. 1050 – 825 BCE | the Lefkandi Excavation Project (`gr-116`) |
| Toumba building at Lefkandi | built c. 950 BCE; found 1981 | the Lefkandi Excavation Project and the British School (`gr-117`) |
| Nichoria | Mycenaean town c. 1600 – 1200 BCE; Dark Age village c. 1075 – 750 BCE | the Messenian ephorate for the first; the excavators' Dark Age I – III, as Kotsonas gives them, for the second (`gr-118`) |
| Zagora on Andros | settled c. 900 – 700 BCE; first settlement c. 1015 – 925 BCE by radiocarbon | the Zagora Archaeological Project; Alagich et al. 2024 for the radiocarbon (`gr-119`, `gr-114`) |
| Iron in Greece | in graves from c. 1200 BCE; commonplace in the western Aegean by c. 900 BCE | Nerantzis et al.; Mokrišová and Verčík (`gr-120`) |
| Cremation and cist graves on the mainland | c. 1150 – 1100 BCE; the Kavousi cist pyres c. 750 – 700 BCE | Rutter, Lesson 29, for the second half of the 12th century; Lagia et al. for Kavousi (`gr-121`, `gr-122`) |
| Kerameikos cemetery | grows from the Submycenaean (c. 1100 BCE on the ministry's page) to c. 700 BCE; excavated from 1870 | Iliopoulos (Odysseus); see the Submycenaean row (`gr-123`) |
| Dipylon Amphora | c. 760 – 750 BCE; the ministry's catalogue c. 755 – 750 BCE | the National Archaeological Museum and Odysseus (`gr-124`) |
| Geometric pottery | c. 900 – 700 BCE | as the Geometric row (`gr-125`) |
| Hero cult at Bronze Age tombs | mainly c. 900 – 700 BCE; at Menidi into c. 500 – 400 BCE | the Geometric row; the West Attica ephorate for Menidi (`gr-126`) |
| The Homeric poems composed | c. 700 BCE ("not much before 700") | Pisano's review of Graziosi; the convention of every card that dates the poems (`gr-127`, `gr-128`, `gr-130` – `gr-133`, `gr-135`). Pre-eminent over the rest of epic by c. 500 BCE (Holmberg, `gr-128`) |
| Nestor's Cup buried | c. 750 – 700 BCE | Gigante et al. 2021 (`gr-132`) |
| Homeric Question, modern | Wolf's *Prolegomena* 1795; Parry's fieldwork 1933 – 1935; *The Singer of Tales* 1960; Parry's thesis 1928 | the reviews on `gr-129`; the Milman Parry Collection's own page (`gr-129`, `gr-133`) |
| Rhapsodes at Athens and Syracuse | the Panathenaic rule c. 560 – 510 BCE; Cynaethus at Syracuse 504 – 501 BCE; Lycurgus's speech 330 BCE | Lycurgus, *Against Leocrates* 102, and Nagy for the rule; Collins for Cynaethus (`gr-134`) |
| Homeric society: the Dark Age reading | c. 1100 – 800 BCE | one reading among several, as Elmer's and Papadopoulos's reviews give it (`gr-135`) |
| basileus rises from palace headman to leading man | c. 1200 – 1000 BCE | Rutter, Lesson 25 (`gr-139`) |
| Hesiod; *Theogony*; *Works and Days* | c. 700 BCE | Howe's review of Edwards and Scodel's of Koning for the poet; Cook's review of Latacz for the poems (`gr-140` – `gr-143`). Flores (via `gr-143`'s source 5) puts *Works and Days* in the 7th century; the collection keeps c. 700 |
| Greek alphabet | adopted c. 800 BCE (the usual date); oldest finds c. 750 – 700 BCE | Lang's review of Powell; Waal 2018, who argues for an arrival by the 11th century BCE, which `gr-144` gives in prose only |
| Phoenician alphabet | its own script on the Phoenician coast by c. 1000 BCE; Ugarit's cuneiform alphabet from c. 1400 BCE | Waal 2018 (`gr-145`) |
| Dipylon inscription | the jug c. 740 BCE; found 1871 | Cardin 2017; Galanakis for the 1871 dig (`gr-146`) |
| Nestor's Cup | made c. 730 BCE; buried c. 720 BCE | Gigante et al. 2021 (`gr-147`); `gr-132`'s "c. 750 – 700 BCE" is the same tomb's broader bracket |
| Pithekoussai | Greek goods in Campania by c. 780 BCE; large settlement by c. 750 BCE | Turfa's review of Ridgway (`gr-148`, `gr-150`) |
| Al Mina | earliest Greek pots c. 800 BCE; founded a little before 750 BCE; Unqi made an Assyrian province 738 BCE | Vacek 2012 (`gr-149`) |
| Phoenicians at Kommos | from c. 900 BCE; over before c. 600 BCE | Haggis's review of *Kommos IV*; Lamaze's review of Muñoz Sogas (`gr-151`) |
| Ionian migration | Miletus settled c. 1050 BCE; Ephesus founded in the mid-11th century BCE | Smith's review of Gorman; Rzepka's review, reporting Kerschner (`gr-152`) |
| Aeolian migration | no BCE date: Strabo dates it only as four generations before the Ionian migration | `gr-153` keeps an empty date line |
| Return of the Heracleidae in Spartan genealogy | perhaps as early as c. 700 BCE (an earliest date, not "by") | Larson's review of Kõiv (`gr-155`); `gr-234` carried the same misreading as "by" and was corrected in B25 ("Earliest claim c. 700 BCE") |
| Koine spreads | c. 400 – 300 BCE | Buck 1910 (`gr-156`) |
| Opheltas spit | c. 1050 – 950 BCE; Megalopolis decree in Arcadian c. 200 BCE | Petrakis's review of Steele; Buck (`gr-157`) |
| Cypriot city-kingdoms | first recorded c. 707 BCE (Sargon II); Kition's last king killed 312 BCE | Körner's and Gill's reviews (`gr-158`) |
| Cypriot syllabary | c. 800 – 300 BCE; gone by the 1st century BCE | Willi's and Körner's reviews (`gr-159`) |
| Synoecisms | Elis c. 471 BCE; Rhodes 408/7 BCE; Megalopolis 371 BCE | the reviews on `gr-160` (prose only; the card is undatable) |
| Rise of the polis | c. 800 – 700 BCE on one view; the Copenhagen inventory covers c. 650 – 323 BCE | Vlassopoulos's review of Hall; the reviews of Hansen and Nielsen (`gr-161`) |
| Olympia | cult from c. 900 BCE; first games 776 BCE by tradition; Elis in charge from at least 550 BCE; temple of Zeus 470 – 456 BCE | Giaccone's and Kennell's reviews; Odysseus (Vikatou) (`gr-163`) |
| Delphi | first offerings just before 800 BCE, cult c. 800 – 700 BCE; first stone temple c. 600 BCE; burnt 548 BCE | Childs's and Kennell's reviews; Odysseus (Partida), whose "394 BC" for the precinct's destruction is a misprint and is not used (`gr-164`) |
| Heraion of Samos | Rhoikos temple c. 570 – 560 BCE; great altar c. 560 BCE; Polycrates' temple 538 – 522 BCE | Viglaki-Sofianou (Odysseus) and Herodotus 3.60 (`gr-165`) |
| Perachora | Corinth takes it c. 750 – 725 BCE; Limenia precinct c. 750 BCE; declines after 146 BCE | Stroud, *Princeton Encyclopedia*; Tomlinson (`gr-166`) |
| Wealth moves from graves to sanctuaries | c. 750 BCE (the Corinthia) | Owen's review (`gr-167`, `gr-170`) |
| Mantiklos "Apollo" | c. 700 – 675 BCE | the Museum of Fine Arts, Boston (`gr-167`) |
| Tripod dedications | grow from c. 900 BCE, fast after 800; fade at Olympia c. 700 – 600 BCE | Jones's, Hochscheid's and Hamilton's reviews (`gr-168`) |
| Warrior burials | bent swords at Athens c. 950 – 850 BCE; the Eretria West Gate plot c. 710 – 680 BCE | Lloyd 2014 (`gr-169`) |
| Eighth-century revival | turning point c. 750 BCE | Owen's review (`gr-170`) |

## The polis, colonisation and Sparta (confirmed by B19–B29, `gr-171` – `gr-275`)

**Where a source gives only a century, the card says the century**, on the date line and in prose, and never
turns it into a year range (`gr-190`, `gr-195`, `gr-197`, `gr-203`, `gr-214`, `gr-219`, `gr-231`, `gr-235`,
`gr-239`, `gr-250`). A line holding only centuries yields no sort year, so such a card's line is left empty and
the century stays in prose (`gr-220`, `gr-251`, `gr-254`, `gr-259`).

| period or event | the collection says | source |
|---|---|---|
| Dreros law | inscribed c. 650 BCE | Youni; Papakonstantinou's review of Gagarin (`gr-171`) |
| Hoplite panoply | common by the mid-7th century BCE; bronze panoply worn from c. 725 BCE; Corinthian helmet most worn c. 580 – 500 BCE, going out c. 500 – 475 BCE | Howe's review of Snodgrass (`gr-180`); Lanphier 2025 (`gr-183`) |
| Massed phalanx | by 700 BCE | Lanphier 2025 (`gr-181`) |
| Double-grip shield | emerged c. 720 – 700 BCE | Daly's review of van Wees (`gr-182`) |
| Hoplite reform | arms visible c. 700 BCE; decisive change c. 650 – 640 BCE on one view; the orthodox account from 1947 | Lloyd 2014; Sears's review (`gr-184`) |
| Chigi vase | painted c. 650 – 640 BCE; excavated 1882 | Powell's review of Giuliani; Rasmussen 2013 (`gr-185`) |
| Orthagorids of Sicyon; Cypselids of Corinth | from c. 670 BCE; from c. 655 BCE | Rackham's notes to Aristotle, *Politics* 1315b (`gr-186`, `gr-187`) |
| Periander | ruled c. 626 – 585 BCE; a lower chronology ends the dynasty c. 550 – 540 BCE | Rackham's note to *Politics* 1284a; Mosshammer's review of Lapini (`gr-188`) |
| Corinth | Neolithic c. 6500 – 3250 BCE; temple of Apollo c. 560 BCE; razed 146 BCE; refounded 44 BCE | Koursoumis (Odysseus) (`gr-189`) |
| Diolkos | built in the 6th century BCE; Roman fleet hauled 102 BCE; Nero's canal 66 – 68 CE | the ministry's Diolkos page; Slane's review of Pettegrew (`gr-190`) |
| Cleisthenes of Sicyon | ruled c. 600 – 569 BCE; Agariste married c. 575 BCE; the dynasty ended c. 520 – 505 BCE | Parker, *Tyche* 1992 (`gr-191`) |
| Polycrates | tyrant of Samos 538 – 522 BCE | Viglaki-Sofianou (Odysseus), as `gr-165` (`gr-192`) |
| Tunnel of Eupalinos | cut c. 550 – 540 BCE; rediscovered 1853 | Chatzidakis (Odysseus); Viglaki-Sofianou (`gr-193`) |
| Pheidon of Argos | usually c. 675 BCE; Pausanias's eighth Olympiad, 748 BCE (`gr-244` gives Fragkaki's c. 670 BCE in an answer) | Lavelle's review of de Libero; Pausanias 6.22.2 (`gr-194`) |
| Archaic Argos | dominant in the north-east Argolid in the late 8th century BCE; Sepeia often dated 494 BCE; a fourth tribe from c. 460 BCE | Larson's review of Kõiv; Franchi; Kierstead's review of Grote (`gr-195`) |
| Aegina | independent c. 618 – 613 BCE; Salamis 480 BCE; walls and fleet taken c. 456 BCE; people expelled 431 BCE | Loomis's and Crane's reviews of Figueira (`gr-196`) |
| Chalcis and Eretria | Chalcis founded in the 11th century BCE, Eretria in the 9th; Chalcis beaten by Athens 507 – 506 BCE; Eretria sacked 490 BCE | Domínguez's review of Parker; Munn's review (`gr-197`) |
| Lelantine War | proposed dates c. 750 – 550 BCE; one reconstruction c. 710 – 650 BCE; Lefkandi burnt c. 700 BCE; Chalcis taken by Athens 506 BCE | Domínguez's review of Parker; Bershadsky (`gr-198`) |
| Archaic Miletus | Ionians settle c. 1050 BCE (as `gr-152`); Ionian Revolt 499 – 494 BCE | Smith's review of Gorman (`gr-199`, `gr-200`) |
| Ionia | classical Ionia 480 – 294 BCE | Mac Sweeney's review of Nudell (`gr-200`) |
| Panionion | the League perhaps founded c. 600 BCE, if the site near Melia is right | Demetriou's review (`gr-201`) |
| Artemision at Ephesus | archaic temple c. 560 – 550 BCE; burnt 356 BCE; Goths 262 CE; found 1870 | Townsend's and Naerebout's reviews; Wendt (`gr-202`) |
| Greek colonisation | began in the 8th century BCE; Corcyra 733 BCE; most Black Sea cities in the 7th – 6th centuries BCE | Hodos's review; Thucydides 6.3–4; Baebler's review (`gr-203`, `gr-218`) |
| Cyrene | founded c. 630 BCE; Demonax c. 550 BCE; Jewish revolt 116 – 117 CE | Larson's review of Brock and Hodkinson; Barron's review of Capponi (`gr-206`, `gr-207`) |
| Syracuse | founded c. 733 BCE by tradition, c. 680 – 675 BCE on one low dating; taken by Rome 212 BCE | Evans's review; Muccioli's review of Evans (`gr-208`) |
| Megara Hyblaea | founded c. 728 BCE; taken by Gelon 483 or 482 BCE | Tréziny 2016; Smith's review of De Angelis (`gr-209`) |
| Gela and Acragas | Gela 688 BCE; Acragas taken 406 BCE; Gela destroyed 405 BCE | Evans's review; McConnell's review (`gr-210`) |
| Selinus | Diodorus 651 – 650 BCE, Thucydides 628 – 627 BCE; temples c. 600 – 460 BCE; sacked 409 BCE | Smith's and Barletta's reviews; Diodorus 13.57 (`gr-211`) |
| Sybaris; Croton | Sybaris c. 720 BCE and Croton c. 709 or 703 BCE (the translators' notes to Strabo, after Eusebius); Sybaris taken 510 BCE; Thurii 444 – 443 BCE; Croton's Olympic century 588 – 488 BCE | Strabo 6.1.12–13 (Hamilton and Falconer); Nielsen's review of Mann (`gr-212`, `gr-213`) |
| Taras | founded in the 8th century BCE; beaten by the Iapygians 473 BCE; war with Rome 282 – 281 BCE; lost its freedom 209 BCE | Larson's review; Diodorus 11.52; Strabo 6.3.4 (`gr-214`) |
| Cumae | founded no later than c. 730 – 720 BCE, perhaps c. 750 BCE; Etruscans routed 524 BCE; Hieron's sea victory 474 BCE; Campanians 421 BCE | Evans's review; Dionysius of Halicarnassus 7.3–7; Diodorus 11.51 (`gr-215`, `gr-223`) |
| Massalia | founded c. 600 BCE; sided with Pompey 49 BCE | Davidson's review; Krotscheck (`gr-216`) |
| Emporion | settled c. 575 – 550 BCE; Roman landing 218 BCE | Miró and Santos (`gr-217`) |
| Berezan | 647 BCE in Eusebius; c. 625 – 600 BCE by its finds | Baebler's review of Solovyov (`gr-218`) |
| Byzantium | founded from Megara in the 7th century BCE; left Athens 411 BCE; war with Rhodes 220 BCE; Constantine's new bounds 11 May 330 CE | Kimball's review of Russell; Polybius 4.38; Feeney's review (`gr-219`) |
| Olbia | founded in the second quarter of the 6th century BCE; sacked by the Getae in the mid-1st century BCE (prose only) | Rusjaeva (`gr-220`) |
| Naucratis | occupied from c. 615 – 610 BCE; Amasis 570 – 526 BCE | Bozkuş 2023 (`gr-221`) |
| Greek mercenaries in Egypt | Psammetichus I 664 – 610 BCE; Abu Simbel 593 – 592 BCE | Nadig's review; Struffolino (`gr-222`) |
| Coinage | invented c. 660 – 630 BCE; Athens minting c. 525 – 500 BCE; the Ephesus deposit c. 640 – 620 BCE | Meadows 2021; Monson's review of van Wees (`gr-224`, `gr-225`) |
| Olympic Games and truce | first games 776 BCE by tradition; Hippias's list c. 400 BCE; Sparta barred 420 BCE; still held 385 CE; ended c. 408 – 450 CE, not 393 | Brunet's review of Christesen; Thucydides 5.49–50; Kennell's review of Remijsen (`gr-229`, `gr-230`) |
| Pythian games | founded 586 or 582 BCE | Childs's review (`gr-228`) |
| Sparta | state formed in the 8th century BCE; empire 404 – 371 BCE; independence ended 192 BCE; taken by Alaric 396 CE | Larson's review; Smith's review of Matyszak; Humble's review (`gr-231`) |
| Messenia | conquered in the 8th – 7th centuries BCE; freed 370 – 369 BCE | Lafond's and Roy's reviews of Luraghi (`gr-233`, `gr-235`, `gr-239`, `gr-240`) |
| First and Second Messenian Wars | traditionally 743 – 724 and 685 – 668 BCE (Pausanias, by the Loeb notes); lowered to c. 690 – 670 and c. 640 – 600 BCE on one reconstruction | Pausanias 4.5, 4.13, 4.15, 4.23; van Wees's review of Meier (`gr-236`, `gr-237`) |
| Tyrtaeus | prime 640 – 637 BCE (the Suda's 35th Olympiad) | Edmonds, *Elegy and Iambus* (`gr-238`) |
| Perioikic towns | defected 370 – 369 BCE; freed from Sparta c. 195 BCE | Hawkins; Shipley's review (`gr-240`) |
| Great earthquake; Kinadon | 464 BCE; 399 BCE | Doran's review of Thommen; Xenophon, *Hellenica* 3.3 (`gr-241`) |
| Krypteia | first named in the 4th century BCE; a unit at Sellasia c. 222 BCE | Newman 2021 (`gr-242`) |
| Great Rhetra | 7th century BCE; c. 650 BCE on one reading | Fragkaki 2015 (`gr-244`, `gr-245`, `gr-247`, `gr-249`) |
| Spartan kingship | abolished under Nabis, 207 – 192 BCE; Agis IV 245 – 241 BCE; Cleomenes III 235 – 222 BCE | Pedersen's review of Michalopoulos (`gr-245`, `gr-246`, `gr-252`) |
| Ephorate | in place by c. 700 BCE on one view, from the 6th century BCE on another; abolished 227 BCE | Figueira's review of Richer; Domínguez's review of Thommen (`gr-248`) |
| Spartan war vote | 432 BCE | Thucydides 1.87; Fragkaki (`gr-249`) |
| Agoge | basics by the 7th century BCE; the word not before the mid-3rd century BCE; lapsed 188 – 146 BCE | Larson's review; Keen's review of Kennell (`gr-250`) |
| Cynisca's Olympic wins | possibly 396 and 392 BCE; Laconia invaded 369 BCE | Kulesza 2022; Aristotle, *Politics* 2.1269b (`gr-253`) |
| Plataea; Leuctra | 479 BCE; 371 BCE | Kulesza 2022 (`gr-255`, `gr-241`, `gr-256`, `gr-265`) |
| Mantinea; Lechaeum | 418 BCE; 390 BCE (Hawkins gives 391; the collection keeps 390 with Xenophon's Perseus edition and `gr-180`) | Thucydides 5.68–72; Xenophon, *Hellenica* 4.5 (`gr-181`, `gr-256`, `gr-257`) |
| Menelaion | mansion c. 1450 – 1400 BCE; final ruin c. 1200 BCE; cult from c. 700 BCE | Rutter, Lesson 20; Kulesza 2022 (`gr-260`) |
| Artemis Orthia | first temple c. 700 BCE at the earliest; rebuilt in the 6th century BCE; amphitheatre 3rd century CE | Kulesza 2022 (`gr-261`) |
| Laconian black-figure | c. 580 – 530 BCE; peak c. 575 – 550 BCE | Pavlides's review; Bergeron (`gr-262`) |
| Alcman | born 672 – 669 BCE in the Suda, a disputed date; active in the 7th century BCE | Suda On Line (`gr-263`) |
| Spartan mirage | the term from 1933 | Doran's review of Thommen; Kulesza 2022 (`gr-264`) |
| Peloponnesian League | took shape in the 6th century BCE; against Samos c. 525 BCE; decayed after Leuctra | Kulesza 2022 (`gr-265`) |
| Chilon | c. 560 BCE | Hicks's Diogenes Laertius (`gr-266`) |
| Cleomenes I | reigned c. 520 – 489 BCE; to Aegina 491 BCE | Papalas's review; Pausanias 3.4 (`gr-267`) |
| Demaratus | Eleusis 506 BCE; with Xerxes 480 BCE | Domínguez's review; Herodotus (`gr-268`) |
| Socles' speech | c. 504 BCE | DeVore's review (`gr-270`) |
| Battle of the Fetters | c. 575 – 560 BCE (the reigns of Leon and Agasicles, in which Herodotus sets it) | Kulesza 2022 (`gr-271`) |
| Battle of the Champions | c. 546 BCE (Herodotus's tie to Croesus's appeal); the replay clause 420 BCE | Bershadsky 2012; Thucydides 5.41, Franchi 2025 (`gr-272`). Kulesza gives 545 BCE, not used |
| Battle of Sepeia | usually 494 BCE; c. 520 BCE by Pausanias's placing at the start of Cleomenes' reign | Kulesza 2022, Kierstead's review; Franchi 2025 (`gr-273`), confirming the Archaic Argos row above |

## Athens to the fall of the tyrants (confirmed by B30–B32, `gr-276` – `gr-300`)

**An Athenian archon year straddles two of ours**, so the cards write Solon's year as 594/593 BCE, as their
sources do ("probably 594/3", de Ste. Croix via Whitehead's review). A source writing a bare "594" or "621"
means the same year, and the cards that cite such a source keep its form (`gr-283`'s 621 BCE beside
`gr-284`'s 621/620 BCE).

| period or event | the collection says | source |
|---|---|---|
| Synoecism of Attica | no date: an 8th-century BCE union on one reading, Cleisthenes' reforms of 508/507 BCE on another; both in prose, the line empty | Rönnberg's review of Osborne; Pritchard's review of Anderson (`gr-277`) |
| Archons chosen by lot | from 487 BCE | Ambrose's review of Braun (`gr-279`) |
| Areopagus | powers cut by Ephialtes 462/461 BCE; last inscription early 390s CE; perhaps stopped meeting after 396 CE | Carawan 1985; Rohmann 2023 (`gr-280`) |
| Cylon | Olympic victor 640 BCE; coup attempt 636 BCE | Rhodes's review of Sève; Papakonstantinou's review of Gagarin (`gr-282`). The old "c. 632" rested on a translator's note to Pausanias and is not used |
| Draco's laws | 621 BCE (621/620 BCE as an archon year) | Joyce's review of Schmitz (`gr-283`); Attic Inscriptions Online, IG I³ 104 (`gr-284`) |
| Draco's homicide law republished | 409/408 BCE | IG I³ 104 (`gr-284`) |
| Solon's archonship and laws | 594/593 BCE; a minority dates the reforms to the 570s BCE | Whitehead's review of de Ste. Croix; Joyce's review of Schmitz; Domínguez's review of Almeida (`gr-281` – `gr-296`) |
| Zeugitai | on the council from 508/507 BCE; archonship from 457 BCE (not 457/456); Brea colonists 445 BCE | Schmitz's review of Campa; Valdés Guía 2022 and Valdés Guía and Gallego 2010 (`gr-290`) |
| Top two classes exempt from a fleet levy | 428 BCE | Valdés Guía and Gallego 2010 (`gr-289`) |
| Councillors' oath | 501/500 BCE (prose only) | Bartzoka 2012, after the *Constitution of the Athenians* (`gr-292`) |
| Croesus | came to the throne c. 560 BCE | Bremer's review (`gr-295`), confirming the Croesus row below. Branscome gives Amasis c. 569 – 525 BCE against the 570 – 526 BCE of `gr-221`; `gr-295` prints no year for him |
| Peisistratus | first seized power 561/560 BCE; final return after Pallene 546/545 BCE, or c. 534/533 BCE on one reconstruction; died 528/527 BCE | Anderson's and Loomis's reviews of Lavelle; Ruebel 1973 (`gr-296` – `gr-299`) |
| Peisistratid Athens | c. 560 – 510 BCE | Lavelle's book, as Loomis's review gives it (`gr-299`) |
| Hippias | tyrant 528/527 – 510 BCE; archon 526/525 BCE; at Marathon 490 BCE | Ruebel 1973; Forrest 1969; Pritchard's review of Anderson (`gr-300`) |

## Athens from the tyrant-slayers to Aegina (confirmed by B32–B34, `gr-301` – `gr-320`)

| period or event | the collection says | source |
|---|---|---|
| Hipparchus killed by Harmodius and Aristogeiton | 514 BCE, at the Panathenaia | Lateiner's review of Azoulay; AIO, IG I³ 1023 (`gr-301`, `gr-302`) |
| The Hipparchan herm from Koropi | c. 525 – 514 BCE | AIO, IG I³ 1023 (`gr-301`) |
| Tyrant-slayer statues | Antenor's pair soon after 510 BCE on the usual view, after Marathon on one; carried off by Xerxes 480 BCE; Critius and Nesiotes' pair 477/476 BCE | AIO, IG I³ 502; Keesling's review of Azoulay (`gr-303`) |
| Cleisthenes archon under the tyrants | 525/524 BCE | Loomis's review of Lavelle; Lavelle 2014 (`gr-304`) |
| Cylon's coup | the 7th century BCE (prose; `gr-282` keeps 636 BCE from its own sources) | Nakassis 2011 (`gr-304`) |
| Fall of the Peisistratids | 510 BCE; the archon year of Harpactides 511/510 BCE | Forrest 1969; Ruebel 1973 (`gr-305`) |
| Cleomenes and Isagoras besieged on the Acropolis | 508/507 BCE | Kulesza 2022 (`gr-306`, `gr-307`) |
| Peloponnesian army at Eleusis | spring 506 BCE | Kulesza 2022 (`gr-306`, `gr-307`) |
| Cleisthenes' reforms: tribes, demes, trittyes, Council of 500 | 508/507 BCE | Pritchard's review of Anderson; Rhodes's review of Raaflaub, Ober and Wallace (`gr-308` – `gr-312`) |
| Councillors' oath first imposed | 501/500 BCE (now on `gr-312`'s line as well as in `gr-292`'s prose) | AIO, IG I³ 105; *Constitution of the Athenians* 22 (`gr-312`) |
| Ostracism | law 508/507 BCE or soon after; first used 488/487 BCE (Hipparchus son of Charmus); Xanthippus 484 BCE; the Kerameikos vote against Megacles spring 471 BCE; last used c. 416 BCE (Hyperbolus) | Hooper's review of Węcowski; Hunt's review of Forsdyke; Sickinger's review of Brenne (`gr-314`, `gr-315`) |
| Olympieion | begun 515 BCE on one account; abandoned 510 BCE; resumed 174 BCE; finished 124/125 CE | Kyriakou (Odysseus); Wycherley 1964 (`gr-316`) |
| Old Temple of Athena | built c. 525 – 500 BCE (the last quarter of the 6th century BCE); burned 480 BCE; the "old temple" burned again 406 BCE | Acropolis Museum; D'Ooge 1908; Xenophon, *Hellenica* 1.6.1 (`gr-317`) |
| Laurion | mined from the 4th millennium BCE (silver only from the mid-1st millennium BCE on one study); the third-contact strike 483/482 BCE; mines reopened 1870 CE | Vaxevanopoulos et al. 2023; Wood, Hsu and Bell 2021; Lohmann 2023 (`gr-318`) |
| Athenian owls | usually c. 520 – 515 BCE; after 510 BCE on one study | Davis et al. 2025 (`gr-319`) |
| Athens and Aegina | first war c. 595 – 590 BCE on one study; undeclared war c. 506 – 481 BCE; walls and fleet surrendered after c. 456 BCE; the islanders expelled 431 BCE | Loomis's and Crane's reviews of Figueira; Herodotus; Thucydides (`gr-320`) |

## Archaic art, verse and thought (confirmed by B35–B40, `gr-321` – `gr-380`)

| period or work | the collection says | source |
|---|---|---|
| Archaic period | c. 800 – 479 BCE; the traditional start 700 BCE | Rönnberg's review of Osborne; King's review of Osborne (`gr-321`) |
| Orientalising period | the end of the 8th century BCE through the 7th (no year) | López-Ruiz's review of Brisart (`gr-322`) |
| Corinthian pottery | c. 720 – 550 BCE; Early and Middle Corinthian to c. 590/580 BCE | Belfiore et al. 2022; Moore's reviews (`gr-323`) |
| Black-figure | invented at Corinth early in the 7th century BCE; early Attic c. 630 – 570 BCE; overtaken by c. 500 BCE | Beazley 1986; Stissi's review of Alexandridou (`gr-324`) |
| Exekias | the third quarter of the 6th century BCE; the Vatican amphora c. 540 BCE, the Munich cup c. 530 BCE | Beazley 1986; Perseus (`gr-325`) |
| François Vase | made c. 570 BCE; found 1844 – 1845 CE; smashed 1900 CE | Moore's review; Bianco 2018 (`gr-326`, `gr-327`) |
| Gordion cup by Kleitias and Ergotimos | c. 565 – 560 BCE | Perseus, Berlin V.I. 4604 (`gr-327`) |
| Amasis Painter | the mid-6th century BCE; the Agora alabastron c. 560 BCE, the Boston amphora c. 525 – 515 BCE | Whitley 2018; Moore's review; Perseus (`gr-328`) |
| Attic pottery trade | Athenian ware ousts Corinthian c. 550 BCE; the Vulci tombs yield 3,000 vases in 1829 CE | Moore's review of Boardman; Walters 1905 (`gr-329`) |
| Red-figure | invented at Athens c. 530 BCE; declines c. 330 BCE | Neils's review of Robertson; Moore's review of Boardman (`gr-330`) |
| Andokides Painter | the first regular red-figure painter; his Louvre amphora c. 530 – 520 BCE, Munich bilingual c. 530 – 510 BCE, Berlin amphora c. 525 BCE; the potters' Acropolis dedication about 525 BCE | Perseus; AIO, IG I³ 620 (`gr-331`) |
| Kouros | earliest examples c. 610 – 600 BCE (the New York kouros); late c. 500 – 490 BCE (the Aristodikos); Kleobis and Biton c. 580 BCE | Perseus; Ridgway's review of Niemeier (`gr-332`) |
| Kore | Nikandre's c. 640 – 630 BCE; Euthydikos Kore c. 490 – 480 BCE; Phrasikleia found 1972 CE | Perseus; Ridgway's reviews (`gr-333`) |
| Archaic smile | Acropolis 654 c. 560 BCE; faded by c. 490 – 480 BCE | Perseus (`gr-334`) |
| Peplos Kore | c. 530 – 525 BCE; found February 1886 CE | Perseus; Dickins 1912 (`gr-335`) |
| Anavysos Kouros | c. 530 – 520 BCE; smuggled out 1932 CE; returned 1937 CE | Perseus; Thompson's review essay; Philadelpheus 1936 (`gr-336`) |
| Moschophoros | c. 570 – 560 BCE; statue found 1864 CE, base 1887 CE | Acropolis Museum; Dickins 1912 (`gr-337`) |
| Archaic temple | earliest known the 8th century BCE (Dreros, Samos, Thermos); first monumental c. 700 BCE (Isthmia) | Princeton Encyclopedia; Townsend's review of Barletta (`gr-338`) |
| Doric and Ionic orders | first Doric features late in the 7th century BCE; both orders settled c. 580 – 570 BCE (the Ionic temple at Yria on Naxos) | Townsend's review of Barletta; Barletta's review of Gruben (`gr-339`, `gr-340`) |
| Temple of Zeus at Olympia, Parthenon | 470 – 456 BCE; 447 – 432 BCE (prose on `gr-341`; the Classical cards own them) | Perseus building records (`gr-341`) |
| Heraion of Olympia | c. 600 BCE, built in one campaign (an older view c. 650 BCE, in prose) | Yalouris, Princeton Encyclopedia (`gr-342`) |
| Temple of Artemis at Corfu | c. 580 BCE | Perseus; Cambridge cast gallery (`gr-343`) |
| Siphnian Treasury | c. 530 – 525 BCE; the Samian raid 525 BCE | Delphi site; Odysseus; Herodotus 3.57–58 (`gr-344`) |
| Treasuries at Delphi | the earliest (Corinth's) at the end of the 7th century BCE; the Athenian after 490 BCE (or the late 6th century BCE, disputed); the Theban after 371 BCE | Roux, Princeton Encyclopedia; Pausanias 10.11; Odysseus (`gr-345`) |
| Pediment sculpture | the Hekatompedon gable c. 570 BCE; the Aegina gables c. 500 – 480 BCE | Acropolis Museum; Perseus (`gr-346`) |
| Selinus metopes | small metopes c. 550 – 540 BCE; Temple C's c. 540 – 530 BCE | Barletta's review of Marconi (`gr-347`) |
| Aeolic capital | the Old Smyrna temple of Athena c. 610 – 600 BCE; most of the group the second half of the 6th century BCE | Miles's review; des Courtils 2011 (`gr-348`) |
| Lost-wax casting | no year: large hollow bronzes by the 6th century BCE | Gardner 1915; Grossman's review (`gr-349`) |
| Lyric poetry | Terpander's Carneia victory 676 BCE; the Bacchylides papyrus reaches London 1896 CE | Smyth 1900; Kowerski's review (`gr-350`, `gr-356`) |
| Elegy | first poets early in the 7th century BCE; Echembrotus at the first Pythian music contest 586 BCE | Hardie 1920; Nobili 2011 (`gr-351`) |
| Iambus | the trimeter appears in the mid-7th century BCE; abuse its main sense from the mid-6th; Hipponax in the 60th Olympiad, 540 – 537 BCE | Hardie 1920; Lomiento's review; Pliny 36.4 (`gr-352`) |
| Archilochus | the eclipse usually dated 648 BCE (647 and 660 also proposed); Mnesiepes inscription 3rd century BCE; Cologne epode published 1974 CE | Edmonds 1931; MacPhail's review; Marcovich 1975 (`gr-353`) |
| Sappho and Alcaeus | the Suda's 42nd Olympiad, 612 – 609 BCE (Sappho's date; the fall of Melanchrus); Sappho's exile in Sicily 598 BCE (Parian Chronicle); Pittacus rules 587 – 579 BCE | Suda; Edmonds 1922; Rackham's note to Aristotle, *Politics* (`gr-354`, `gr-355`) |
| Mimnermus | the Suda's floruit, 37th Olympiad, 632 – 629 BCE; one edition prefers the mid-7th century BCE | Suda; Brown's review of Allen (`gr-357`) |
| Theognis | the Suda's date 544 – 541 BCE; poems reaching back to the later 7th century BCE and forward to the Persian invasion | Suda; De Martin 2022 (`gr-358`) |
| Anacreon | left Teos with its people for Abdera when Harpagus took it; no year, since Smyth's 545 BCE disagrees with the c. 540 BCE that `gr-384` gives the conquest | Smyth 1900; Dandamayev, "Harpagos" (`gr-359`, `gr-384`) |
| Ibycus | the Suda's 54th Olympiad, 564 – 561 BCE; Eusebius's 536 – 533 BCE | Suda On Line (`gr-360`) |
| Stesichorus | the Suda's birth 632 – 629 BCE and death 556 – 553 BCE; his career in the first half of the 6th century BCE | Suda; D'Alessio's review of Davies and Finglass (`gr-361`) |
| Simonides | the Suda's birth 556 – 553 BCE (or 532 – 529 BCE) and death 468 – 465 BCE; an elegy papyrus published 1992 CE | Suda; Nobili 2011 (`gr-362`) |
| Symposium | no year: reclining at a feast known to Alcman in the 7th century BCE; the line is empty | Hamilton's review of Murray (`gr-363`) |
| Skolion | the Harmodius song c. 500 BCE; the Attic collection shortly before 450 BCE | Smyth 1900 (`gr-364`) |
| Aesop | no year: a semi-legendary figure; the *Life of Aesop* written between the 1st century BCE and the 2nd century CE. Konstantakos cites ancient dates (a prime of 572 – 569 BCE, death 564 BCE) that the card leaves out | Herodotus 2.134; Konstantakos 2013 (`gr-365`) |
| Presocratics | the 6th and 5th centuries BCE; no year | Curd, SEP (`gr-366`) |
| Thales | the eclipse 585 BCE (28 May); named first of the Sages in the archonship of Damasias, 582/581 BCE | O'Grady, IEP; Herodotus 1.74 (`gr-367`) |
| Anaximander | 64 in 547/546 BCE and died soon after (Apollodorus); one study redates him | Diogenes Laertius 2.2, with Hicks's note; Moore's review (`gr-368`) |
| Anaximenes | died in the 63rd Olympiad, 528 – 525 BCE (Apollodorus); one study puts him half a century later | Diogenes Laertius 2.3; Moore's review (`gr-369`, `gr-370`) |
| Pythagoras | prime in the 60th Olympiad (Diogenes), 540 – 536 BCE in Hicks's note; 532 – 528 BCE (Clement) | Diogenes Laertius 8.45, with Hicks's notes (`gr-371`). Hicks converts the same Olympiad as 540 – 537 BCE for Xenophanes (`gr-373`); each card prints its own source's figure |
| Pythagoreanism | the clubs attacked c. 450 BCE; the communities died out in the mid-4th century BCE | Huffman, SEP (`gr-372`) |
| Xenophanes | prime 540 – 537 BCE (Diogenes) | Diogenes Laertius 9.20, with Hicks's note (`gr-373`) |
| Heraclitus, Parmenides | prime 504 – 500 BCE (Diogenes, 69th Olympiad); Parmenides active in the early 5th century BCE on the modern view | Diogenes Laertius 9.1, 9.23; Palmer, SEP (`gr-374`, `gr-375`, `gr-377`) |
| Zeno of Elea | prime 464 – 460 BCE (Diogenes, 79th Olympiad) | Diogenes Laertius 9.29 (`gr-376`) |
| Melissus, Empedocles | the 84th Olympiad: 444 – 440 BCE in Hicks's note for Melissus, 444 – 441 BCE in his note for Empedocles; each card prints its own note's figure | Diogenes Laertius 9.24, 8.74 (`gr-377`, `gr-378`) |
| Hecataeus | the Suda's 65th Olympiad, 520 – 516 BCE | Suda (`gr-379`) |
| Alcmaeon | his book between 500 and 450 BCE | Huffman, SEP (`gr-380`) |

## The Persian Wars (confirmed by B41–B42, `gr-381` – `gr-400`)

| event or person | the collection says | source |
|---|---|---|
| Achaemenid Empire | c. 550 – 330 BCE; Astyages defeated 550 BCE | Draycott's review of Waters; Dandamayev, Iranica (`gr-381`, `gr-382`) |
| Cyrus II | born c. 600 BCE; king c. 559 BCE; took Babylon 539 BCE; died 530 BCE | Dandamayev, Iranica; Babylonian chronicles (`gr-382`) |
| Sardis taken | 547 BCE (Nabonidus Chronicle) or 546 BCE (later chronographers), two rows | Cahill 2010; Shahbazi, Iranica; Grayson (`gr-383`) |
| Harpagus subdues Ionia | c. 540 BCE | Dandamayev, "Harpagos" (`gr-384`) |
| Cambyses II | king 530 – 522 BCE; took Egypt 525 BCE | Jacobs, Iranica; Papalas's review of Ruzicka (`gr-385`) |
| Darius I | king 522 – 486 BCE; Behistun carved 521 – 519 BCE; Persepolis begun 520 – 515 BCE | Lendering, Livius; Altaweel and Squitieri 2018; Matthews and Fazeli 2022 (`gr-386` – `gr-388`) |
| Persepolis Fortification travel texts | 509 – 493 BCE | Hallock 1969; Matthews and Fazeli 2022 (`gr-388`) |
| Persian army, Immortals | no year: the cards describe institutions (Herodotus's 1,700,000 only as his claim) | (`gr-389`, `gr-390`) |
| Scythian campaign | most likely 513 BCE; dates from 520 to 507 BCE proposed | Ivantchik and Shahbazi, Iranica; Lendering (`gr-391`, `gr-393`) |
| Ionian Revolt | broke out 499 BCE; Sardis burned 498 BCE (499 BCE in the Sardis Expedition essays); Aristagoras killed 497 BCE (497/496 BCE in Badian); Histiaeus sent west 497 BCE; Lade 494 BCE (495 BCE in Badian); Miletus taken 494 BCE; last resistance crushed and the settlement of Artaphernes 493 BCE | Badian, Iranica; Tozzi; Cahill and Greenewalt (`gr-392` – `gr-397`) |
| Phrynichus | first victory 511 – 508 BCE; *Capture of Miletus* produced after 494 BCE (soon after 480 BCE on one view); last victory 476 BCE | Suda On Line; Badian; Plutarch (`gr-398`) |
| Mardonius' expedition | 492 BCE | Herodotus 6.43 – 45 (`gr-399`) |
| Earth and water | the Athenian embassy at Sardis c. 507 BCE; Darius' heralds 491 BCE, or 493/492 BCE on one view | Herodotus; Schmitt, Iranica; Rhodes on Marathon (`gr-400`) |

## The Persian Wars, Marathon to Salamis (confirmed by B43–B45, `gr-401` – `gr-430`)

| event or person | the collection says | source |
|---|---|---|
| Datis and Artaphernes | Datis carries a sealed document from Sardis early in 494 BCE; the expedition 490 BCE; Artaphernes and Datis' sons in Xerxes' army 480 BCE | Schmitt, "Datis", Iranica; Rhodes 2013; Lendering, Livius (`gr-401`) |
| Sack of Eretria | 490 BCE, after a 6-day siege; the captives settled at Ardericca afterwards | Schmitt, "Arderikka", Iranica; Lendering, Livius (`gr-402`) |
| Marathon | late summer 490 BCE; the day is disputed (mid-August or mid-September), so the line gives the year only | Rhodes 2013; Lendering, Livius (`gr-403`, `gr-405` – `gr-408`) |
| Miltiades | archon 524/523 BCE; tried for tyranny 493/492 BCE; condemned after Paros and died 489 BCE | Lendering, Livius; Loomis's review of Lavelle (`gr-404`) |
| Callimachus | polemarch and killed at Marathon, 490 BCE | Herodotus; Acropolis Museum; Harrison 1971 (`gr-405`) |
| The Soros | raised 490 BCE; dug 1890 – 1891 CE | Petrovic 2013; Frazer 1898 (`gr-407`) |
| Themistocles | born about 525 BCE (prose only, an estimate); archon 493/492 BCE; ostracised 471 BCE (Perrin's note to Plutarch: about 472 BCE); died at Magnesia 459 BCE | Lendering, Livius; Steinbock's review of Blösel (`gr-409`) |
| Laurion strike and naval bill | 483/482 BCE, the archonship of Nicodemus | *Constitution of the Athenians* 22; Vaxevanopoulos et al. 2023; Lendering, Livius (`gr-410`, `gr-411`) |
| Aristides | ostracised 483/482 BCE; recalled 480 BCE; at Plataea 479 BCE; died 467 BCE | Lendering, "Ostracism"; Perrin's notes to Plutarch; Nudell 2023 (`gr-412`, `gr-413`) |
| Xerxes I | king 486 BCE; Babylonia revolts 484 BCE; invades Greece 480 BCE; murdered August 465 BCE | Lendering, Livius; Waerzeggers 2018; Ossendrijver 2018 (`gr-414`) |
| Preparations for 480 | from 483 BCE (the Athos canal begun, the Hellespont bridged); the army crosses in spring 480 BCE; the invasion ends 479 BCE | Schmitt, "Greece i", Iranica; Herodotus 7.22, 7.37 (`gr-415` – `gr-417`) |
| Hellenic League | formed 481 BCE; Athens breaks off the alliance 463 – 461 BCE | Schmitt; Loomis (`gr-418`) |
| Congress at the Isthmus | autumn 481 BCE; meeting again in spring 480 BCE | Kulesza 2022; Smith (`gr-419`) |
| Wooden wall oracle | 481 BCE, or spring 480 BCE (two rows) | Evans, by Giangiulio's review (`gr-420`) |
| Tempe expedition | 480 BCE (May, in Kulesza) | Kulesza 2022; Herodotus (`gr-421`) |
| Thermopylae and Artemisium | 480 BCE; the days are disputed (12 – 14 August, or September), so the lines give the year only | Kulesza 2022; Lendering, Livius; Schmitt (`gr-422`, `gr-424` – `gr-426`) |
| Leonidas I | king c. 490 – 480 BCE (the Suda On Line's editors; Livius gives 488 – 480 BCE); killed 480 BCE | Suda On Line; Herodotus (`gr-423`) |
| Thespians | at the pass 480 BCE; survivors at Plataea 479 BCE | Herodotus; Lendering, Livius (`gr-425`) |
| Evacuation of Athens; sack of the Acropolis | 480 BCE; the Acropolis stormed in September 480 BCE | Herodotus; Rous's review of Garland (`gr-427`, `gr-429`) |
| Troezen decree | claims to be of 480 BCE (autumn 481 BCE, if genuine); the stone c. 300 BCE, or the 3rd century BCE | Lendering, Livius; Cristofani (`gr-428`) |
| Salamis | late September 480 BCE | Tuplin, "Salamis", Iranica (`gr-430`) |

## The Persian Wars, Salamis to the aftermath (confirmed by B46–B47, `gr-431` – `gr-450`)

| event or person | the collection says | source |
|---|---|---|
| Eurybiades | admiral 480 BCE; replaced by Leotychidas in spring 479 BCE | Kulesza 2022 (`gr-431`) |
| Artemisia I | at Salamis 480 BCE; her later years unknown | Schmitt, Iranica (`gr-432`) |
| Persian retreat | 480 BCE, a few days after Salamis | Herodotus 8.113; Schmitt (`gr-433`) |
| Mardonius in Greece | wintered in Thessaly 480/479 BCE; Athens retaken 479 BCE, 10 months after Xerxes took it | Schmitt, "Mardonius", Iranica; Kulesza 2022; Herodotus 9.3 (`gr-434`) |
| Plataea | summer 479 BCE; the Oath of Plataea stele about 350 – 325 BCE | Maher's review of Cartledge; Kulesza 2022 (`gr-435`) |
| Pausanias the regent | regent from 480 BCE; recalled 477 BCE; died probably about 471 BCE (dates from 474 to 466 BCE also proposed) | Lendering, Livius; Kulesza 2022 (`gr-436`) |
| Mycale | 479 BCE; whether on the same day as Plataea is doubted | Herodotus; Lendering, Livius (`gr-437`) |
| Serpent Column | dedicated 479 BCE; its gold taken by the Phocians 356 BCE; moved to Constantinople in the 4th century CE; heads lost 1700 CE | Herodotus 9.81; Bassett's review of Stephenson (`gr-438`) |
| Herodotus | born 484 BCE (Gellius); went to Thurii 444 – 443 BCE; still writing 430/429 BCE; died before 413 BCE; the *Histories* published in the 420s BCE | Godley; Lendering, Livius; Rollinger, Iranica (`gr-439`, `gr-440`) |
| Aeschylus' *Persians* | produced 472 BCE, with Pericles as choregos | the play's ancient summary, via Hammond 1988 (`gr-441`) |
| Medism | Darius' heralds 491 BCE; Thebes besieged and punished 479 BCE | Schmitt, Iranica; Herodotus (`gr-442`) |
| War epigrams | no line: a genre; the Agora fragments found 1932 CE, the Corinthian stone on Salamis 1895 CE | West 1970; Boegehold 1965 (`gr-443`) |
| Themistoclean Wall | built 479/478 BCE | Thucydides 1.89 – 93; Ridgway's and Bäbler's reviews (`gr-444`) |
| Piraeus wall | begun 493/492 BCE (Themistocles' archonship); 477 BCE in Diodorus; pulled down 404 BCE; razed by Sulla 87 – 86 BCE | Thucydides 1.93; Frazer; Buckler (`gr-445`) |
| Himera; the Carthaginian invasion | 480 BCE | Lendering, Livius; Sorg; Barletta (`gr-446`, `gr-448`) |
| Gelon | tyrant of Gela 491 BCE; Olympic victory 488 BCE; took Syracuse 485 BCE; Himera 480 BCE; died 478 BCE | Castiglioni; Fialho 2022 (`gr-447`) |
| Marathon trophy | 490 BCE | Rhodes 2013 (`gr-449`) |
| Barbarian | no line: an idea | (`gr-450`) |

## The Athenian Empire (confirmed by B48–B54, `gr-451` – `gr-520`)

| event or person | the collection says | source |
|---|---|---|
| Delian League | founded 478/477 BCE; treasury moved to Athens 454 BCE; ended with Athens' fall in 404 BCE | Attic Inscriptions Online, IG I³ 259; Schmitt, Iranica; Nudell 2023 (`gr-451`) |
| Hellenotamiai | created 478/477 BCE; at Athens from 454 BCE; outlived the tribute after 413 BCE | Thucydides 1.96; AIO, IG I³ 375 and 259 (`gr-452`) |
| Phoros | first fixed 478/477 BCE; reassessed 425/424 BCE; replaced by a harbour tax 413 BCE | AIO, IG I³ 259 and 71; Nudell 2023; Thucydides 7.28 (`gr-453`) |
| Assessment of Aristides | 478/477 BCE, the archonship of Timosthenes | *Constitution of the Athenians* 23; Blackman 1969; AIO, IG I³ 71 (`gr-454`) |
| Cimon | first general 478 BCE; ostracised 461 BCE; died besieging Citium about 450 BCE | Girella's review of Di Cesare; Blackman 1969 (`gr-455`) |
| Eion and Scyros | taken 476/475 BCE (477/476 BCE by Di Cesare); Scyros still Athenian under the grain-tax law of 374/373 BCE | Lendering, Livius; Girella's review; Rhodes's review of Stroud (`gr-456`, `gr-457`) |
| Eurymedon | 466 BCE (Schmitt); 470/469 BCE (Di Cesare); about 468 BCE (Lendering) | Schmitt, Iranica; Girella's review; Lendering, Livius (`gr-458`) |
| Revolt of Naxos | put down 470 BCE | Lendering, Livius (`gr-459`) |
| Revolt of Thasos | 465 BCE, or 464 BCE in Oldfather's note to Diodorus; surrendered in the third year | Blackman 1969; Diodorus 11.70 (`gr-460`) |
| Spartan earthquake; Third Messenian War | earthquake 464 BCE (469 BCE in Diodorus); the revolt from 464 BCE (469/468 BCE in Diodorus); surrender 455 BCE, or 458/457 BCE on another reckoning | Kulesza 2022; Cole 1974; Lang 1967 (`gr-461`, `gr-462`) |
| Dismissal from Ithome; ostracism of Cimon | dismissed 462 BCE; Cimon ostracised 461 BCE; his trial over Thasos 463 BCE; recalled after Tanagra (no year) | Cole 1974; Goušchin 2019; Plutarch (`gr-463`, `gr-464`) |
| Ephialtes and the Areopagus | the reform 462/461 BCE, the archonship of Conon; the *Eumenides* 458 BCE | *Constitution of the Athenians* 25; Wallace 1974; Ambrose's review (`gr-465`, `gr-466`) |
| Pericles | born about 495 BCE (prose only, an estimate); choregos 472 BCE; general 448/447 – 429/428 BCE; deposed and fined 430 BCE; died 429 BCE | Lendering, Livius; Payen's review of Azoulay; Thucydides 2.65 (`gr-467`) |
| Radical democracy | from 462/461 BCE; restored 403 BCE | Rhodes's review; Correa 2022 (`gr-468`) |
| Pnyx; Tholos | the Pnyx auditorium c. 500 BCE, or c. 460 BCE on a later dating; the Tholos 470 BCE; the last prytany decrees c. 120 – 130 CE | Hansen 1982; Odysseus; Attic Inscriptions Online (`gr-469`, `gr-470`) |
| Courts and pay | jury pay from the 450s BCE; 3 obols from 425 BCE; allotment machines soon after 388 BCE; assembly pay soon after 403 BCE | Pritchard 2014; Gkikaki 2023; Kierstead 2023; Kroll 2023 (`gr-471`, `gr-472`) |
| Board of generals | 501/500 BCE | *Constitution of the Athenians* 22, with Attic Inscriptions Online's dating (`gr-473`) |
| Citizenship law | 451/450 BCE; the grain scrutiny 445 BCE; Pericles' son enrolled about 429 BCE | LaForse's and Phelan's reviews; Tritle's review; Cromey 1982 (`gr-474`) |
| First Peloponnesian War | c. 460 – 445 BCE, or 458 – 446 BCE in one study; Coronea 446 BCE | Lendering, Livius; Joyce's review of van Wijk (`gr-475`, `gr-477`) |
| Tanagra; Oenophyta | 457 BCE (August 457 BCE for Oenophyta, 62 days after Tanagra), or 458 BCE | Kulesza 2022; Attic Inscriptions Online; Joyce's review (`gr-476`, `gr-477`) |
| Egyptian expedition | c. 460 – 454 BCE, or 465 – 457 BCE on Kahn's dating | Bresciani, Iranica; Nudell 2023 (`gr-478`) |
| Treasury moved to Athens | 454 BCE; the first quota list 454/453 BCE | Nudell 2023; Attic Inscriptions Online, IG I³ 259 (`gr-479`) |
| Peace of Callias | 449 BCE; an earlier peace about 465 BCE on one view | Schmitt, Iranica; Badian, Iranica (`gr-480`) |
| Thirty Years' Peace | sworn 446/445 BCE; voted broken at Sparta 432 BCE; ended 431 BCE | Pausanias 5.23 with Jones's note; Thucydides; Lendon 1994 (`gr-481`) |
| Cleruchies | the first known, at Chalcis, 507 – 506 BCE; the Chersonese 447 BCE; renounced 378/377 BCE; Samos settled 365 BCE | Munn's review; Perrin's note to Plutarch; Attic Inscriptions Online (`gr-482`) |
| Tribute lists | first stone 454/453 – 440/439 BCE; regional headings from 443/442 BCE; second stone 439/438 – 432/431 BCE | Attic Inscriptions Online, IG I³ 259 and 270 (`gr-483`) |
| Coinage Decree | the mid-440s BCE (the older view), the 420s BCE, or c. 415 – 414 BCE (now favoured); three rows | Nudell 2023; Figueira's review; Attic Inscriptions Online (`gr-484`) |
| Revolt of Samos | 440 – 439 BCE, or 441 – 439 BCE; surrender 439 BCE | Perrin's notes; Eddy 1968; Nudell 2023; Attic Inscriptions Online (`gr-485`) |
| Athenian empire | took shape 454 – 449 BCE; the Chalcis decree 446/445 BCE (or 424/423 BCE); ended 404 BCE | Nudell 2023; Attic Inscriptions Online (`gr-486`) |
| Piraeus | port begun 493/492 BCE; 372 ship-sheds counted 330/329 BCE; taken by Sulla 86 BCE (the siege 87 – 86 BCE) | Princeton Encyclopedia; Frazer; Di Nicuolo's review (`gr-487`) |
| Long Walls | begun c. 460 BCE; pulled down 404 BCE; rebuilt 394/393 – 392/391 BCE | Frazer; Matijašić 2026 (`gr-488`) |
| Hippodamus | Miletus rebuilt from 479 BCE; Thurii founded 443 BCE (inside the 444 – 443 BCE of `gr-440`); Rhodes founded 408 BCE | Princeton Encyclopedia; Coulson (`gr-489`) |
| Trireme | the first great war fleets 525 BCE | Potter's review of Wallinga (`gr-490`) |
| Trierarchy | law on handing over gear 410 – 404 BCE; joint trierarchs by 405 BCE; Periander's law 357 BCE; Demosthenes' law 340 BCE | Attic Inscriptions Online; Cecchet 2023 (`gr-491`) |
| Liturgies | the Anagyrous choregic base after c. 440 BCE; Lysias' speaker's choruses 411/410 BCE | Attic Inscriptions Online, IG I³ 969; Lysias 21 (`gr-492`) |
| Navy and the thetes | no line: an idea | (`gr-493`) |
| Periclean building programme; Parthenon | accounts from c. 450 BCE; the Parthenon 447 – 438 BCE, its gables finished 432 BCE; the Propylaea 437 – 432 BCE; the Parthenon blown up 1687 CE, Elgin's removals from 1801 CE, restored 1896 – 1902 and 1923 – 1933 CE | Attic Inscriptions Online; Acropolis Museum; YSMA; St Clair 2022 (`gr-494`, `gr-495`) |
| Phidias | overseer of the works from 447 BCE; to Olympia 438 BCE; the Zeus set up 430 BCE; no birth or death year | Acropolis Museum; Bauer 2024; Princeton Encyclopedia (`gr-496`) |
| Athena Parthenos | installed 438/437 BCE | Attic Inscriptions Online, IG I³ 460 (`gr-497`) |
| Parthenon frieze | set in place 443 – 438 BCE; Elgin's removal 1802; the west end taken indoors 1993 | YSMA (`gr-498`) |
| Parthenon metopes | carved 445 – 440 BCE; bombarded 1687; the east side taken down 1987 – 1989 | Acropolis Museum (`gr-499`) |
| Ictinus and Callicrates | the Parthenon built 447 – 438 BCE (its gables finished 432 BCE, `gr-495`); the Nike decree c. 450 BCE or c. 438 BCE | YSMA; Attic Inscriptions Online (`gr-500`) |
| Propylaea | built 437 – 432 BCE; an older gateway in place by 485 BCE; blown up 1645 CE; restored 1909 – 1917 CE | YSMA; Travlos, Princeton Encyclopedia (`gr-501`) |
| Erechtheion | begun 421 BCE (425/424 BCE on Shear's dating); work resumed 409/408 BCE; finished 406 BCE, accounts to 405/404 BCE; restored 1902 – 1909 CE | YSMA; Acropolis Museum; Attic Inscriptions Online, IG I³ 474; Closterman's review (`gr-502`) |
| Caryatids | in place by 409/408 BCE (the survey's "maidens"); one taken by Elgin 1804 CE; the rest indoors 1979 CE, in the new museum 2009 CE | Attic Inscriptions Online, IG I³ 474; Acropolis Museum (`gr-503`) |
| Temple of Athena Nike | built 427 – 424 BCE; pulled down 1686 CE (1687 in the Acropolis Museum's pages); rebuilt 1835 – 1845 CE; restored 2000 – 2010 CE | YSMA; Acropolis Museum (`gr-504`) |
| Hephaisteion | built 449 – 444 BCE (Travlos), or 460 – 420 BCE (Odysseus); the cult statues 421 – 415 BCE; a church from the 7th century CE | Princeton Encyclopedia; Odysseus; Attic Inscriptions Online, IG I³ 82 (`gr-505`) |
| Odeon of Pericles | the mid-5th century BCE (prose only); burned 86 BCE in Sulla's siege, then rebuilt by Ariobarzanes | Odysseus; Rogers's review of Parigi; Vitruvius 5.9.1 (`gr-506`) |
| Telesterion | the Peisistratid hall 550 – 510 BCE; sacked by the Persians 480 – 479 BCE; the Periclean hall undated; destroyed by Alaric 395 CE | Mylonas, Princeton Encyclopedia (`gr-507`) |
| Pericles' funeral oration | 431 BCE, the winter of the war's first year | Thucydides 2.34; Baebler's review (`gr-508`) |
| Aspasia | with Lysicles 429 – 428/427 BCE (he was killed in Caria in 428/427 BCE); mocked in the *Acharnians* 425 BCE; no life dates | Lendering, Livius (`gr-509`) |
| Metics; slavery | no line: institutions (the auction of 414 BCE, Nikophon's coin law 375/374 BCE and the manumission lists of about 336 – 322 BCE in prose) | Attic Inscriptions Online (`gr-510`, `gr-511`) |
| Poletai | the Attic Stelai 414 BCE; the Agora account with the first mine leases 367/366 BCE | Attic Inscriptions Online, IG I³ 421 and Agora XIX P5 (`gr-512`) |
| Grain trade | Demosthenes' *Against Leptines* 355/354 BCE; the grain-tax law 374/373 BCE (`gr-457`) | Faraguna's review of Harris (`gr-513`) |
| Athenian Agora | public from the early 6th century BCE (prose); remodelled 508/507 – 490 BCE on one view; damaged by the Persians 480/479 BCE; excavated from 1931 CE | Odysseus; van Wijk's review of Paga (`gr-514`) |
| Stoa Poikile | no building year; shields from Sphacteria 425 BCE and Scione 421 BCE hung there | Jones's notes to Pausanias 1.15.4 (`gr-515`) |
| Polygnotus | the Delphi Lesche before 467 BCE (the usual view), or 458 – 447 BCE (Robert); no life dates | Frazer 1898 (`gr-516`) |
| Thucydides son of Melesias | ostracised 444/443 BCE, or 442 BCE; back by 433 BCE on one view | Lendering, Livius; Perrin's note; Loomis's review of Figueira (`gr-517`) |
| Old Oligarch | written 425 – 424 BCE (Marr and Rhodes), or 431 – 413 BCE (the Bearzot volume); proposals run from the 440s BCE into the 4th century BCE | Leão's and Rhodes's reviews (`gr-518`) |
| Treasury of the Other Gods | the Callias decrees 434/433 BCE (probably); loans recorded 433/432 – 423/422 BCE | Attic Inscriptions Online, IG I³ 52 and 369 (`gr-519`) |
| Kleinias decree | 425/424 BCE or a little later (formerly the early 440s or 430s BCE) | Attic Inscriptions Online; Lambert, AIUK 4.2 (`gr-520`) |

## The Peloponnesian War (confirmed by B55–B61, `gr-521` – `gr-585`)

| event or person | the collection says | source |
|---|---|---|
| Peloponnesian War | 431 – 404 BCE; the Corcyra alliance 433 BCE; the Peace of Nicias 421 BCE; the Sicilian expedition sailed 415 BCE; Sparta renewed the war 413 BCE; Aegospotami 405 BCE; Athens surrendered in the spring of 404 BCE | Lendering, Livius (`gr-521`) |
| Thucydides | no life dates; general in Thrace when Amphipolis fell 424 BCE; banished for 20 years (423 BCE on one reckoning); the history breaks off in 411 BCE | Thucydides 4.104–106, 5.26; Lendering, Livius; Stronk's review (`gr-522`) |
| Prophasis | no line: a word | (`gr-523`) |
| Epidamnus | founded 627 BCE; the war with Corcyra 435 BCE (436 BCE on Lendering's dating, used on no card) | Sestieri, Princeton Encyclopedia; Oldfather's note to Diodorus 12.30 (`gr-524`) |
| Battle of Sybota | 433 BCE | Lendering, Livius; Sferruzza's review (`gr-525`) |
| Potidaea | founded about 600 BCE; revolted 432 BCE; surrendered in the winter of 430/429 BCE; taken by Philip II 356 BCE (Diodorus files the revolt under 435/434 BCE) | Alexander, Princeton Encyclopedia; Attic Inscriptions Online, IG I³ 1179; Hoffmann 1975 (`gr-526`) |
| Megarian Decree | passed before the summer of 432 BCE, perhaps as early as 439 BCE; repeal refused 432/431 BCE; Megara's revolt 446 BCE | Thucydides 1.67, 1.114, 1.139; Stadter 1984 (`gr-527`) |
| Spartan ultimatum | the embassies 432 – 431 BCE, after the allies' vote in the autumn of 432 BCE; the first invasion 431 BCE | Thucydides 1.125–139; Kulesza 2022 (`gr-528`) |
| Archidamian War | 431 – 421 BCE; plague 430 BCE; Pylos 425 BCE; Brasidas north 424 BCE; the year's truce 423 BCE (423/422 BCE); the peace in the spring of 421 BCE | Foster's review of Geske; Kulesza 2022; Thucydides 5.20 (`gr-529`) |
| Archidamus II | reigned 469 – 427 BCE (perhaps from 475 BCE; death 426 BCE in Oldfather's note to Diodorus); the earthquake 464 BCE; invasions 431, 430 and 428 BCE; Plataea 429 BCE | Kulesza 2022; Lendering, Livius; Oldfather's note (`gr-530`) |
| Periclean strategy | no line: a plan (the first invasion 431 BCE in prose) | Lendering, Livius (`gr-531`) |
| Acharnae | the first invasion camped there in midsummer 431 BCE; the Thirty's army camped near it 404 – 403 BCE | Thucydides 2.19–20; Trevett's review; Eliot, Princeton Encyclopedia (`gr-532`) |
| Plague of Athens | broke out 430 BCE; returned 427/426 BCE | Thucydides 2.47, 3.87; Lendering, Livius; Kulesza 2022 (`gr-533`) |
| Pericles' last year | deposed and fined 430 BCE; died 429 BCE, 2 years and 6 months into the war | Thucydides 2.65; Lendering, Livius (`gr-534`) |
| Cleon | the Mytilene decree 427 BCE; Sphacteria 425 BCE; the *Knights* 424 BCE; killed at Amphipolis 422 BCE | Lendering, Livius; Thucydides (`gr-535`) |
| Revolt of Mytilene; the debate | revolt 428 BCE; surrender and the debate 427 BCE (the spear butt from Lesbos 428/427 BCE) | Thucydides 3.2–50; Princeton Encyclopedia; Ostwald 1979; Attic Inscriptions Online (`gr-536`, `gr-537`) |
| Siege of Plataea | 429 – 427 BCE; the breakout in the second winter | Thucydides 2.71 – 3.68; Kulesza 2022 (`gr-538`) |
| Pylos; Sphacteria | 425 BCE; Pylos held by Athens until 409/408 BCE | Thucydides 4.2–41; McAllister, Princeton Encyclopedia (`gr-539`, `gr-540`) |
| Brasidas | saved Methone 431 BCE; marched north 424 BCE; killed at Amphipolis 422 BCE | Thucydides; Lendering, Livius (`gr-541`) |
| Amphipolis; Eion | the Nine Ways disaster 465 BCE; Amphipolis founded 437/436 BCE (437 BCE in the Princeton Encyclopedia, 438/437 BCE on Odysseus); taken by Brasidas 424 BCE; by Philip II 357 BCE; Eion taken by Cimon 476/475 BCE (`gr-456`), held by Thucydides 424 BCE, Cleon's base 422 BCE | Lendering, Livius; Princeton Encyclopedia; Thucydides (`gr-542`, `gr-544`) |
| Battle of Amphipolis | the end of summer 422 BCE | Thucydides 5.6–11; Kulesza 2022 (`gr-543`) |
| Peace of Nicias | sworn in the spring of 421 BCE, for 50 years | Thucydides 5.18–20; Kulesza 2022 (`gr-545`) |
| Nicias | born about 470 BCE (prose only); took Minoa 427 BCE; Kythera 424 BCE; in Sicily 415 – 413 BCE; the eclipse 27 August 413 BCE; put to death 413 BCE | Lendering, Livius; Foster's review of Geske; Thucydides 7.50, 7.86 (`gr-546`) |
| Alcibiades | born about 450 BCE (prose only); the Argive alliance 420 BCE; Olympia 416 BCE; recalled 415 BCE; back with the fleet 411 BCE; home 407 BCE; Notium 406 BCE; killed 404 BCE | Lendering, Livius; Plutarch; Thucydides (`gr-547`) |
| Battle of Mantinea | 418 BCE | Thucydides 5.64–74 (`gr-548`) |
| Argive alliance | sworn 420 BCE, for 100 years; Argos withdrew in the winter of 418/417 BCE | Thucydides 5.47; Attic Inscriptions Online, IG I³ 83 (`gr-549`) |
| Melos | the dialogue and the siege 416 BCE; surrender in the winter of 416/415 BCE; the Melians restored 405 BCE | Thucydides 5.84–116; Attic Inscriptions Online, OR 170; Xenophon (`gr-550`, `gr-551`) |
| Sicilian Expedition | sailed 415 BCE; destroyed 413 BCE | Thucydides 6–7; Lendering, Livius (`gr-552`) |
| Egesta | the treaty with Athens 418/417 BCE (now favoured) or 458 BCE; the appeal 415 BCE; Carthage's invasion 409 BCE; sacked by Agathocles 307 BCE | Attic Inscriptions Online, IG I³ 11; Figueira's review; Princeton Encyclopedia (`gr-553`) |
| Herms; Salaminia | the herms mutilated in the spring of 415 BCE; the Salaminia sent to Sicily 415 BCE; Andocides' defence about 400/399 BCE | Thucydides 6.27–61; Andocides 1 (`gr-554`, `gr-555`) |
| Siege of Syracuse | 414 – 413 BCE; the night attack on Epipolae 413 BCE; Dionysius' walls 402 – 397 BCE | Thucydides 6–7; Diodorus 13; Princeton Encyclopedia (`gr-556`) |

## Events and reigns (to be confirmed as each deck's batch reaches it)

The standard dates, as the collection already carries them; each will be checked against the card's own
sources when its batch comes round, and a disputed one given as a range.

| event or person | date |
|---|---|
| Draco's laws | 621 BCE (621/620 BCE as an archon year; confirmed by B30–B32, `gr-283`, `gr-284`) |
| Solon's archonship | 594/593 BCE (confirmed by B30–B32, `gr-281` – `gr-296`) |
| Peisistratus tyrant | 561/560 – 528/527 BCE, with two exiles (confirmed by B30–B32, `gr-297`) |
| Hipparchus killed by Harmodius and Aristogeiton | 514 BCE (confirmed for `gr-300` by Forrest 1969) |
| Hippias expelled | 510 BCE (confirmed by `gr-300` and `gr-305`; Ruebel gives the archon year of Harpactides as 511/510 BCE) |
| Cleisthenes' reforms | 508/507 BCE (confirmed by B32–B34, `gr-306` – `gr-314`) |
| Croesus king of Lydia | from c. 560 BCE; Sardis taken 547 BCE by the Nabonidus Chronicle, 546 BCE in Eusebius (confirmed by B24: Cahill, `gr-226`; `gr-269` gives his reign as c. 560 – 546 BCE after Jones's note to Pausanias) |
| Cyrus II | c. 559 – 530 BCE (confirmed by B41, `gr-382`) |
| Darius I | 522 – 486 BCE (confirmed by B41, `gr-386`) |
| Xerxes I | 486 – 465 BCE (confirmed by B44, `gr-414`) |
| Ionian Revolt | 499 – 494 BCE (Lade 494 BCE); the last resistance crushed 493 BCE (confirmed by B42, `gr-394`, `gr-396`; Badian dates Lade 495 BCE) |
| Marathon | 490 BCE (confirmed by B43, `gr-403`) |
| Thermopylae, Artemisium, Salamis | 480 BCE (confirmed by B45, `gr-422`, `gr-426`, `gr-430`) |
| Plataea, Mycale | 479 BCE (confirmed by B46, `gr-435`, `gr-437`) |
| Delian League founded | 478 – 477 BCE, written 478/477 BCE as an archon year (confirmed by B48, `gr-451`) |
| Eurymedon | c. 466 BCE (470/469 – 466 BCE; confirmed by B49, `gr-458`, which gives 466 and 470/469 BCE as two rows) |
| Peloponnesian War | 431 – 404 BCE (confirmed by B55, `gr-521`) |
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
gr-101: 1250; 1200
gr-102: 1750; 1200; 334
gr-103: 1300; 1230; 1180
gr-104: 1500; 1400; 1250; 1175
gr-105: 1360; 1320
gr-106: 1400; 1209; 1280
gr-107: 1250; 1150; 1200; 1175
gr-108: 1188; 1177
gr-109: 1200; 1180
gr-110: 1200; 1050; 1150; 1125
gr-111: 1050; 700; 900
gr-112: 1070; 1000
gr-113: 1050; 900; 1020; 1000
gr-114: 900; 700; 760
gr-115: 1200; 1100
gr-116: 2100; 1050; 825
gr-117: 950; 1981
gr-118: 1600; 1200; 1075; 750
gr-119: 900; 700; 1015; 925
gr-120: 1200; 900
gr-121: 1150; 1100
gr-122: 1150; 1100; 750; 700
gr-123: 1100; 700; 1870
gr-124: 760; 750; 755
gr-125: 900; 700
gr-126: 900; 700; 500; 400
gr-127: 700
gr-128: 700; 500
gr-129: 1795; 1933; 1935; 1960
gr-130: 700
gr-131: 700
gr-132: 750; 700
gr-133: 700; 1928; 1933; 1935
gr-134: 560; 510; 504; 501; 330
gr-135: 1100; 800; 700
gr-139: 1200; 1000
gr-140: 700
gr-141: 700
gr-142: 700
gr-143: 700
gr-144: 800; 750; 700
gr-145: 1000
gr-146: 740; 1871
gr-147: 730; 720
gr-148: 780; 750
gr-149: 800; 738; 539; 301
gr-150: 950; 780
gr-151: 900; 600
gr-152: 1050
gr-154: 1200
gr-155: 700
gr-156: 400; 300
gr-157: 1050; 950; 200
gr-158: 707; 312
gr-159: 800; 300
gr-161: 800; 700; 650; 323
gr-163: 900; 776; 470; 456
gr-164: 800; 700; 600; 548
gr-165: 570; 560; 538; 522
gr-166: 750; 725; 146
gr-167: 750; 700; 675
gr-168: 900; 700; 600
gr-169: 950; 850; 710; 680
gr-170: 750
gr-171: 650
gr-180: 390
gr-181: 700; 418; 371
gr-182: 720; 700; 425
gr-183: 725; 580; 500; 475
gr-184: 700; 650; 640; 1947
gr-185: 650; 640; 1882
gr-186: 670; 655
gr-187: 655
gr-188: 626; 585
gr-189: 6500; 3250; 560; 146; 44
gr-190: 102; 66; 68
gr-191: 600; 569; 575; 520; 505
gr-192: 538; 522
gr-193: 550; 540; 1853
gr-194: 675; 748
gr-195: 494
gr-196: 618; 613; 480; 431
gr-197: 507; 506; 490
gr-198: 750; 550; 710; 650; 700
gr-199: 1050; 499; 494
gr-200: 499; 494; 480; 294
gr-201: 600
gr-202: 560; 550; 356; 1870
gr-203: 733
gr-206: 630; 550; 116; 117
gr-207: 630
gr-208: 733; 680; 675; 212
gr-209: 728; 483; 482
gr-210: 688; 406; 405
gr-211: 651; 650; 628; 627; 600; 460; 409
gr-212: 720; 510; 444; 443
gr-213: 709; 703; 588; 488; 510
gr-214: 473; 282; 281; 209
gr-215: 750; 720; 524; 474; 421
gr-216: 600; 49
gr-217: 575; 550; 218
gr-218: 647; 625; 600
gr-219: 411; 220; 330
gr-221: 615; 610; 570; 526
gr-222: 664; 610; 593; 592
gr-223: 730; 720; 444; 443
gr-224: 660; 630; 525; 500
gr-225: 660; 630; 640; 620
gr-226: 560; 547; 546
gr-228: 776; 586; 582
gr-229: 776; 400; 385; 408; 450
gr-230: 776; 420
gr-231: 404; 371; 192; 396
gr-233: 370; 369
gr-234: 700
gr-235: 370; 369
gr-236: 743; 724; 690; 670
gr-237: 685; 668; 640; 600
gr-238: 640; 637
gr-239: 370; 369
gr-240: 370; 369; 195
gr-241: 464; 399; 371
gr-242: 222
gr-244: 650
gr-245: 650; 207; 192
gr-246: 207; 192
gr-247: 650
gr-248: 700; 227
gr-249: 650; 432
gr-250: 188; 146
gr-252: 244; 241
gr-253: 396; 392; 369
gr-255: 479; 371
gr-256: 418; 390; 371
gr-257: 418
gr-258: 404
gr-260: 1450; 1400; 1200; 700
gr-261: 700
gr-262: 580; 530; 575; 550
gr-263: 672; 669
gr-264: 1933
gr-265: 525; 371
gr-266: 560
gr-267: 520; 489; 491
gr-268: 506; 480
gr-269: 560; 546
gr-270: 504
gr-271: 575; 560
gr-272: 546; 420
gr-273: 494; 520
gr-279: 594; 593; 487
gr-280: 462; 461
gr-281: 594; 593
gr-282: 640; 636
gr-283: 621; 594; 593
gr-284: 621; 620; 409; 408
gr-285: 594; 593
gr-286: 594; 593
gr-287: 594; 593
gr-288: 594; 593
gr-289: 594; 593; 428
gr-290: 594; 593; 508; 507; 457; 445
gr-291: 594; 593
gr-292: 594; 593
gr-293: 594; 593
gr-295: 594; 593; 560
gr-296: 594; 593; 561; 560
gr-297: 561; 560; 546; 545; 528; 527
gr-298: 561; 560; 546; 545; 534; 533
gr-299: 560; 510; 546; 545
gr-300: 528; 527; 510; 526; 525; 490
gr-301: 525; 514
gr-302: 514
gr-303: 480; 477; 476
gr-304: 525; 524; 510
gr-305: 510; 511
gr-306: 508; 507; 506
gr-307: 508; 507
gr-308: 508; 507
gr-309: 508; 507
gr-310: 508; 507
gr-311: 508; 507
gr-312: 508; 507; 501; 500
gr-314: 508; 507; 488; 487; 416
gr-316: 515; 510
gr-317: 525; 500; 480; 406
gr-318: 483; 482; 1870
gr-319: 520; 515; 510
gr-320: 506; 481; 431
gr-321: 800; 479; 700
gr-323: 720; 550
gr-324: 630; 570; 500
gr-325: 540; 530
gr-326: 570; 1844; 1845; 1900
gr-327: 570; 565; 560
gr-328: 560; 525; 515
gr-329: 550; 1829
gr-330: 530; 330
gr-331: 530; 520; 510; 525
gr-332: 610; 600; 500; 490
gr-333: 640; 630; 490; 480
gr-334: 560; 490; 480
gr-335: 530; 525; 1886
gr-336: 530; 520; 1932; 1937
gr-337: 570; 560; 1864; 1887
gr-338: 700
gr-339: 580; 570
gr-340: 580; 570
gr-342: 600
gr-343: 580
gr-344: 530; 525
gr-345: 490; 371
gr-346: 570; 500; 480
gr-347: 550; 540; 530
gr-348: 610; 600
gr-350: 676; 1896
gr-351: 586
gr-352: 540; 537
gr-353: 648; 1974
gr-354: 612; 609; 598
gr-355: 612; 609; 587; 579
gr-356: 676
gr-357: 632; 629
gr-358: 544; 541
gr-360: 564; 561; 536; 533
gr-361: 632; 629; 556; 553
gr-362: 556; 553; 468; 465
gr-364: 500
gr-367: 585; 582; 581
gr-368: 547; 546
gr-369: 528; 525
gr-370: 585; 528; 525
gr-371: 540; 536; 532; 528
gr-372: 450
gr-373: 540; 537
gr-374: 504; 500
gr-375: 504; 500
gr-376: 464; 460
gr-377: 504; 500; 444; 440
gr-378: 444; 441
gr-379: 520; 516
gr-380: 500; 450
gr-381: 550; 330
gr-382: 600; 559; 539; 530
gr-383: 547; 546
gr-384: 540
gr-385: 530; 525; 522
gr-386: 522; 486; 521; 519; 520; 515
gr-387: 550; 330; 522; 486
gr-388: 522; 486; 509; 493
gr-391: 513
gr-392: 499; 497
gr-393: 513; 497
gr-394: 499; 494; 493
gr-395: 498; 499
gr-396: 494; 495
gr-397: 494
gr-398: 511; 508; 476
gr-399: 492
gr-400: 507; 491; 493; 492
gr-401: 490; 480
gr-402: 490
gr-403: 490
gr-404: 524; 493; 490; 489
gr-405: 490
gr-406: 490
gr-407: 490; 1890; 1891
gr-408: 490
gr-409: 493; 480; 471; 459
gr-410: 483
gr-411: 483
gr-412: 483; 479; 467
gr-413: 483; 480
gr-414: 486; 484; 480; 465
gr-415: 480
gr-416: 483; 480
gr-417: 483; 480; 479
gr-418: 481; 479; 463; 461
gr-419: 481; 480
gr-420: 481; 480
gr-421: 480
gr-422: 480
gr-423: 490; 480
gr-424: 480
gr-425: 480; 479
gr-426: 480
gr-427: 480
gr-428: 480; 300
gr-429: 480
gr-430: 480
gr-431: 480; 479
gr-432: 480
gr-433: 480
gr-434: 480; 479
gr-435: 479
gr-436: 480; 479; 477; 471
gr-437: 479
gr-438: 479; 356; 1700
gr-439: 479
gr-440: 484; 444; 443; 430; 413
gr-441: 472
gr-442: 491; 479
gr-444: 479
gr-445: 493; 477; 404; 87; 86
gr-446: 480
gr-447: 491; 485; 480; 478
gr-448: 480
gr-449: 490
gr-451: 478; 454; 404
gr-452: 478; 454; 413
gr-453: 478; 425; 413
gr-454: 478
gr-455: 478; 461; 450
gr-456: 476; 477
gr-457: 476; 374
gr-458: 466; 470
gr-459: 470
gr-460: 465; 464
gr-461: 464; 469; 455; 458
gr-462: 464; 469
gr-463: 462; 461
gr-464: 461
gr-465: 462
gr-466: 462; 458
gr-467: 472; 448; 429
gr-468: 462; 403
gr-469: 500; 460
gr-470: 470; 120; 130
gr-471: 388
gr-472: 425; 403
gr-473: 501
gr-474: 451; 445; 429
gr-475: 460; 445; 458; 446
gr-476: 457; 458
gr-477: 457; 458; 446
gr-478: 460; 454; 465; 457
gr-479: 454
gr-480: 449; 465
gr-481: 446; 432; 431
gr-482: 507; 506; 447; 378; 365
gr-483: 454; 440; 443; 439; 432
gr-484: 415; 414
gr-485: 440; 439; 441
gr-486: 454; 449; 446; 404
gr-487: 493; 330; 86
gr-488: 460; 404; 394; 392
gr-489: 479; 443; 408
gr-490: 525
gr-491: 410; 404; 405; 357; 340
gr-492: 440; 411
gr-494: 450; 447; 432; 437
gr-495: 447; 432; 1687; 1801; 1896; 1933
gr-496: 447; 438; 430
gr-497: 438
gr-498: 443; 438; 1802; 1993
gr-499: 445; 440; 1687; 1987; 1989
gr-500: 447; 438; 450
gr-501: 437; 432; 1645; 1909; 1917
gr-502: 421; 425; 409; 406
gr-503: 409; 1804; 1979
gr-504: 427; 424; 1686; 1835; 1845; 2000; 2010
gr-505: 449; 444; 460; 420; 421; 415
gr-506: 86
gr-507: 550; 510; 480; 479; 395
gr-508: 431
gr-509: 429; 428; 425
gr-512: 414; 367
gr-513: 355
gr-514: 508; 490; 480; 1931
gr-515: 425; 421
gr-516: 467; 458; 447
gr-517: 444; 442; 433
gr-518: 425; 424; 431; 413
gr-519: 434; 433; 423
gr-520: 425
gr-521: 431; 404; 421; 405
gr-522: 424; 411
gr-524: 627; 435
gr-525: 433
gr-526: 600; 432; 430
gr-527: 432
gr-528: 432; 431
gr-529: 431; 421; 423
gr-530: 469; 427; 426
gr-532: 431; 404; 403
gr-533: 430; 427
gr-534: 430; 429
gr-535: 427; 425; 422
gr-536: 428; 427
gr-537: 427
gr-538: 429; 427
gr-539: 425
gr-540: 425
gr-541: 431; 424; 422
gr-542: 437; 424; 357
gr-543: 422
gr-544: 476; 424; 422
gr-545: 421
gr-546: 427; 415; 413
gr-547: 415; 407; 404
gr-548: 418
gr-549: 420; 418
gr-550: 416
gr-551: 416
gr-552: 415; 413
gr-553: 418; 458; 415; 307
gr-554: 415
gr-555: 415
gr-556: 414; 413
```
