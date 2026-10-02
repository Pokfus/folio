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
| Orientalising | c. 720 – 620 BCE |
| Archaic period | c. 800 – 480 BCE (from 776 BCE where a card counts from the first Olympiad) |
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
| Return of the Heracleidae in Spartan genealogy | perhaps as early as c. 700 BCE (an earliest date, not "by") | Larson's review of Kõiv (`gr-155`); **`gr-234` may carry the same misreading as "by" and should be checked in B25** |
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
```
