# World History — the chronology the collection commits to

The dates and conventions the World History collection (`col-8`, `wh-001`–`wh-1000`) uses, in ONE place, so
that no two cards disagree about when something happened. Written in Oct 2026 as Batch 0 of the refinement
audit (`docs/wh-refinement-audit.md`), on the model of `docs/greece-chronology.md`.

**Every date line and every date in a background must agree with this file.** Where a card needs a date
this file does not carry, add the row here in the same commit as the card, with the source it came from.
Where a card's own research shows a row here is wrong, correct the row and grep the collection for the old
figure on the day — a correction does not travel on its own. A row is only ever added from a source a batch
actually read; nothing here is carried over from the bulk-written cards unchecked.

`node .claude/wh-audit.js` reads the `chronology-pins` block at the foot of this file and reports any pinned
card whose date line does not carry its pinned figures.

## Conventions

| case | write | not | why |
|---|---|---|---|
| a year under 1000 | `301 CE`, `c. 668 – 631 BCE` | `301`, `668–631 BC` | `cardYears` reads a bare first-millennium number only through the era |
| an approximate range | `c. 1750 – 1470 BCE` | `c. 1750 – c. 1470 BCE` | a `c.` inside a range breaks the era's leftward carry |
| a century | `c. 700 – 600 BCE` | `7th century BCE` | a century alone yields no sort year |
| millions of years | `c. 3.2 Mya`, `c. 4.2 – 2 Mya` | `3,200,000 years ago` on the line | the compact notation `cardYears` parses; the unit is written once and carries left |
| thousands of years | `c. 300,000 years ago` or `c. 45,000 BP` (calibrated) | `45 ka`, `45 kyr` | one form per card; `BP` means before 1950 and is used only where the source gives it |
| a span across the BCE line | `c. 2.6 Mya – 9700 BCE` | | parsed, and reads as the period it is |
| a radiocarbon date | the calibrated figure the source gives, as BP or BCE | an uncalibrated figure as if calendar years | say "radiocarbon years" in prose if a source gives only uncalibrated |
| a disputed date | two rows (`Dated` / `Also dated`), or in prose "X puts it…; Y puts it…" | one figure chosen silently | the Greece rule |
| a discovery | a `Found` row only on a fossil, site or find card, after the dates of the thing itself | a discovery year as the card's only date | a discovery year sorts the card into the 20th century |
| no date a source gives | omit it | an estimate | never estimated |

Questions carry **no dates at all** — no year, century, millennium or decade, and no figure of years
("two million years ago"). Period names (Pleistocene, Upper Palaeolithic) are fine.

## Geological and archaeological periods

Filled batch by batch, from the source each row names.

| period | the collection says | source |
|---|---|---|
| hominin line splits from the chimpanzee line | c. 8 – 6 Mya | Williams et al. 2026 (`wh-005`); Smithsonian, "Introduction to Human Evolution" (`wh-004`) |
| oldest proposed hominins (Sahelanthropus) | c. 7.2 – 6.8 Mya (cosmogenic beryllium) | Lebatard et al. 2008 (`wh-006`) |
| Ardipithecus | c. 5.8 – 4.4 Mya | Smithsonian *A. kadabba* and *A. ramidus* pages (`wh-008`) |
| Australopithecus | c. 4.2 – 2 Mya | Tattersall; Australian Museum (`wh-009`) |
| Laetoli footprints | c. 3.6 Mya on the date lines of `wh-004`/`wh-007`; c. 3.66 Mya on `wh-011` | Raichlen et al. 2010; Masao et al. 2016 |
| Lucy | c. 3.2 Mya | Smithsonian, Institute of Human Origins (`wh-010`) |
| oldest knapped stone (Lomekwi) | c. 3.3 Mya | Harmand et al. 2015 abstract; Plummer et al. 2025 |
| Oldowan, and the usual start of prehistory and the Stone Age | c. 2.6 Mya | Smithsonian "at least 2.6 million years ago"; Braun et al. |
| *Homo sapiens* | c. 300,000 years ago | Smithsonian (`wh-004`) |
| first writing, Mesopotamia | c. 3200 BCE (conventional) | Woods, *Visible Language* (`wh-001`) |
| three-age system printed / in English | 1836 / 1848 | Nationalmuseet; Rowley-Conwy (`wh-002`) |
| Taung Child | c. 2.8 – 2.3 Mya (the estimates disagree) | Smithsonian; Australian Museum (`wh-012`) |
| Paranthropus | c. 2.7 – 1 Mya | Smithsonian; Australian Museum; Quinn and Lepre 2021 (`wh-013`) |
| Oldowan in use | c. 2.6 – 1.7 Mya, possibly from c. 2.9 Mya (Nyayanga) | Plummer et al. 2025; Braun et al. (`wh-016`) |
| Homo habilis | c. 2.4 – 1.4 Mya (Smithsonian); 2.3 – 1.5 Mya (Australian Museum) | `wh-018` gives both |
| Olduvai's oldest tools | c. 2.03 Mya | `wh-017` |
| Homo erectus | c. 2 Mya – 110,000 BP | Hammond et al. 2021 (Drimolen); Smithsonian; Rizal et al. 2020 (`wh-019`) |
| Homo ergaster fossils | c. 1.9 – 1.5 Mya | Australian Museum (`wh-020`) |
| Oldowan first described | 1934 (Leakey; 1936 also seen) | de la Torre 2011 (`wh-016`) |
| Out of Africa I: earliest trace beyond Africa / Dmanisi / Java | c. 1.95 Mya / c. 1.85 – 1.78 Mya / c. 1.5 Mya | `wh-022`, Ferring et al. 2011 (`wh-023`) |
| Turkana Boy | died c. 1.6 – 1.5 Mya (sources split) | Smithsonian; Australian Museum (`wh-021`) |
| Acheulean | c. 1.76 Mya – 125,000 years ago; the end varies by region | `wh-027` |
| control of fire: earliest traces / habitual | c. 1.5 Mya / c. 400,000 years ago | `wh-029` |
| Wonderwerk Cave: oldest tools / fire | c. 1.8 Mya / c. 1 Mya | `wh-030` |
| Java Man deposits | c. 830,000 – 380,000 BP | Pop et al. 2023 (`wh-024`) |
| Zhoukoudian Locality 1 / Upper Cave | c. 780,000 – 400,000 / c. 35,100 – 33,500 years ago | Smithsonian; Li et al. 2018 (`wh-025`, `wh-026`) |
| Homo antecessor (TD6 tooth, direct) | c. 949,000 – 772,000 years ago | `wh-032` |
| Homo heidelbergensis | c. 700,000 – 200,000 years ago | Smithsonian (`wh-034`) |
| Neanderthals | c. 400,000 – 40,000 years ago | `wh-035` |
| Levallois spread / Mousterian | c. 400,000 – 200,000 / c. 300,000 – 40,000 years ago | `wh-036`, `wh-037` |
| Mousterian's end at Le Moustier and across Europe | 41,030 – 39,260 cal BP | Higham et al. 2014 (`wh-037`) |
| Denisovans diverged / oldest remains | more than 390,000 / c. 200,000 years ago | `wh-038` |
| Homo floresiensis skeletons / tools | c. 100,000 – 60,000 / c. 190,000 – 50,000 years ago | Sutikna et al. 2016 (`wh-040`) |
| Homo naledi (Dinaledi fossils) | 335,000 – 236,000 years ago | `wh-041` |
| Homo sapiens, oldest fossils (Jebel Irhoud) | c. 315,000 years ago; the species "c. 300,000 years ago" | Hublin et al. 2017 (`wh-042`, `wh-043`) |
| Omo I | minimum c. 233,000 years ago (overlying ash) | Vidal et al. 2022 (`wh-044`) |
| Mitochondrial Eve | c. 200,000 – 100,000 years ago (studies range 99,000 – 197,000) | `wh-045` |
| Palaeolithic | c. 2.6 Mya – 11,500 BP (end of Europe's final Palaeolithic phase) | `wh-046` |
| Lower Palaeolithic ends | c. 400,000 – 250,000 years ago, by region | `wh-047` |
| Middle Palaeolithic | c. 300,000 – 40,000 years ago (nearer 50,000 in places) | Ruan et al. (`wh-048`) |
| Upper Palaeolithic begins (Eurasia) | c. 45,000 years ago | Hublin 2020 (`wh-049`) |
| Pleistocene | c. 2.58 Mya – 11,700 BP (base redefined 2009) | ICS (`wh-050`) |
| ice age: Antarctic ice / northern ice / Cryogenian | from c. 34 Mya / from c. 2.7 Mya / c. 720 – 635 Mya | Hansen; Batchelor; Hoffman (`wh-051`) |
| Last Glacial Period | c. 115,000 – 11,700 BP | NEEM 2013; Walker et al. 2009 (`wh-052`) |
| Last Glacial Maximum | c. 26,500 – 19,000 BP | Clark et al. 2009 (`wh-052`, `wh-053`) |
| Middle Stone Age | c. 300,000 – 30,000 years ago (c. 40,000 in southern Africa) | Scerri et al. 2021 (`wh-055`) |
| Later Stone Age | from c. 40,000 years ago | Villa et al. 2012 (`wh-056`) |
| ochre, earliest use | c. 300,000 years ago | `wh-057` |
| Blombos Cave MSA layers | c. 101,000 – 73,000 years ago | `wh-058` |
| Howiesons Poort | c. 64,800 – 59,500 BP | `wh-059` |
| Aterian | c. 145,000 – 30,000 BP | `wh-060` |
| behavioural modernity: gradual (Africa) / sudden (Europe) views | c. 300,000 / c. 50,000 – 40,000 years ago | `wh-061` |
| oldest shell beads (Bizmoune) | c. 142,000 years ago | `wh-062` |
| burials: Qafzeh / Panga ya Saidi / Sunghir | c. 100,000 / c. 78,300 / c. 34,000 years ago | `wh-063` |
| Toba eruption | c. 74,000 years ago | `wh-064` |
| Neanderthals disappear (Europe) | c. 41,000 – 39,000 BP | Higham et al. 2014 (`wh-065`; also `wh-037`, `wh-048`) |
| Châtelperronian / Aurignacian / Gravettian | c. 44,000 – 40,000 BP / c. 42,000 – 33,000 BP / c. 34,000 – 24,000 years ago | `wh-066`, `wh-067`, `wh-070` |
| Cro-Magnon burials | c. 32,000 – 31,000 years ago (early Gravettian) | `wh-068` |
| Lion-man carved | c. 40,000 – 35,000 years ago | Museum Ulm (`wh-069`) |
| Venus figurines | c. 38,000 – 14,000 BP | Johnson et al. (`wh-071`) |
| Venus of Willendorf | c. 30,000 years ago | `wh-072` |
| Solutrean / Magdalenian | c. 25,000 – 19,000 BP / c. 20,500 – 14,000 BP | `wh-073`, `wh-074` |
| oldest dated cave painting (Muna, Sulawesi) | before 67,800 BP (a minimum) | Nature, January 2026 (`wh-075`) |
| Chauvet Cave visits | c. 37,000 – 33,500 BP and c. 31,000 – 28,000 BP | `wh-076` |
| Lascaux occupation | c. 21,500 – 21,000 BP (the paintings' age still argued) | `wh-077` |
| Altamira painting | c. 35,550 – 15,200 BP (uranium-series minimums) | `wh-078` |
| Swabian flutes / Marsoulas shell horn | c. 43,000 – 35,000 / c. 18,000 years ago | `wh-080` |
| spear-thrower: earliest trace / oldest hooks | c. 31,000 / c. 20,000 years ago | `wh-081` |
| bow and arrow: earliest claim / oldest arrows (Stellmoor) | c. 64,000 years ago / 12,200 – 11,400 BP | `wh-082` |
| woolly mammoth: arose / gone on the mainland / last on Wrangel | c. 800,000 – 600,000 / c. 10,000 / c. 4,000 years ago | `wh-084` |
| Quaternary extinctions, main losses | c. 50,000 – 10,000 years ago | Koch and Barnosky (`wh-085`) |
| main dispersal out of Africa | c. 60,000 years ago | `wh-086` |
| Skhul and Qafzeh | c. 130,000 – 90,000 years ago | Groucutt 2019 (`wh-087`) |
| main Neanderthal mixing | c. 49,000 – 45,000 years ago | Sümer et al. 2025 (`wh-089`) |
| Y-chromosomal Adam | c. 300,000 – 200,000 years ago (estimates 208,300 – 338,000) | `wh-091` |
| Sahul first settled / broke apart | c. 65,000 – 47,000 / c. 9000 years ago | `wh-092` |
| Madjedbebe first occupied | c. 65,000 years ago (disputed) | `wh-093` |
| Lake Mungo burials | c. 40,000 years ago | `wh-094` |
| Europe: first arrivals / farmers / steppe migration | c. 45,000 / c. 8,000 / c. 4,500 years ago | `wh-095` |
| Mal'ta camps | c. 26,500 – 24,500 years ago | Shichi et al. 2023 (`wh-096`) |
| last Bering land bridge | c. 35,700 – 11,000 BP | Hoffecker (`wh-097`) |
| Americas: split from Asia / White Sands footprints / Clovis | c. 36,000 – 24,000 BP / c. 23,000 – 21,000 BP / 13,050 – 12,750 BP | `wh-098`, `wh-100` |
| Monte Verde main layer | c. 14,500 BP (challenged 2026) | `wh-099` |
| Paleo-Indian period ends | c. 9000 – 8000 BCE | New Georgia Encyclopedia (`wh-100`) |
| Clovis culture and points | 13,050 – 12,750 BP | Waters et al. 2020 (`wh-101`, `wh-102`; agrees with `wh-100`) |
| Folsom tradition | began 12,845 – 12,770 BP, ended 12,400 – 12,255 BP (modelled); type site dug 1926 | Buchanan et al.; Cordell (`wh-103`) |
| Younger Dryas | c. 12,870 – 11,700 BP; named 1912 | Cheng et al. 2020; Mangerud 2021 (`wh-104`) |
| Holocene | 11,700 BP – present (11,700 b2k at the NGRIP2 GSSP); Northgrippian c. 8,200 and Meghalayan c. 4,200 years ago, ratified 2018 | Walker et al. 2009, 2018 (`wh-105`) |
| Mesolithic, Britain | c. 9600 – 4000 BCE; named 1866 | Ashmolean; Westropp (`wh-106`) |
| Epipalaeolithic, southern Levant | c. 23,000 – 11,600 BP | Maher et al. 2011 (`wh-107`) |
| Doggerland | islands by c. 9000 BP; Storegga tsunami c. 8150 BP; last islands gone c. 7000 BP | Walker et al. 2020 (`wh-108`) |
| Star Carr | c. 9300 – 8500 BCE | Bates et al. 2024 (`wh-109`) |
| Bhimbetka first paintings | estimates c. 30,000 – 8000 years ago (disputed); last 6th – 7th century CE | Misra; Dubey-Pathak; Govt of MP (`wh-110`) |
| Neolithic: Southwest Asia / Britain; named | c. 12,000 – 8000 years ago / c. 4000 – 2300 BCE; 1865 | Watkins; English Heritage; Lubbock (`wh-111`) |
| domestication for food begins | c. 12,000 – 11,000 years ago | Larson et al. 2014 (`wh-111`, `wh-112`, `wh-117`) |
| farming begins in the Near East | 10,000 – 9000 BCE | Lazaridis et al. (`wh-115`) |
| "Neolithic Revolution" in Childe's *Man Makes Himself* | 1936 | Childe (`wh-112`) |
| Holocene climatic optimum; warmest 200 years | c. 10,000 – 5,000 BP; c. 6,500 BP | Cartapanis et al. 2022; Kaufman et al. 2020 (`wh-113`) |
| 8.2-kiloyear event | c. 8,200 BP | Parker and Harrison 2022 (`wh-114`) |
| Natufian culture; Shubayqa 1 bread | c. 15,000 – 11,700 BP (one study c. 14,600 start); c. 14,400 – 14,200 BP | Groman-Yaroslavski et al. 2026; Arranz-Otaegui et al. 2018 (`wh-116`) |
| oldest dog-shaped bones | c. 14,500 BP (older claims disputed) | Bergström et al. 2020 (`wh-117`) |
| founder crops: domestic-type cereals | c. 10,700 – 8300 BP, by region | Arranz-Otaegui et al. 2016 (`wh-118`) |
| cereals: wild cultivation / first tough ears | c. 13,000 / c. 10,000 BP | Levy and Feldman (`wh-119`) |
| livestock in Southwest Asia / pigs in China | c. 11,000 – 10,000 BP / by c. 8,000 BP | Zeder 2008; Wang et al. (`wh-120`) |

## Chronology pins

The figures each refined card's date line must carry. One line per card, `wh-NNN: figure; figure`.

```chronology-pins
wh-001: 2.6; 3.3; 3200
wh-002: 1836; 1848
wh-003: 3.3; 2.6
wh-004: 8; 6; 300,000
wh-005: 8; 7
wh-006: 7.2; 6.8
wh-007: 7; 6; 3.6; 1.9
wh-008: 5.8; 4.4; 1995; 2009
wh-009: 4.2; 2; 1925
wh-010: 3.2; 1974
wh-011: 3.66; 1978
wh-012: 2.8; 2.3; 1924
wh-013: 2.7; 1; 1938
wh-014: 3.3; 2011
wh-015: 3.3
wh-016: 2.6; 1.7; 2.9; 1934
wh-017: 2.03; 2; 1959
wh-018: 2.4; 1.4; 1964
wh-019: 2; 110,000; 1891
wh-020: 1.9; 1.5; 1975
wh-021: 1.6; 1.5; 1984
wh-022: 1.95; 1.85; 1.78; 1.5
wh-023: 1.85; 1.78; 1.77; 1991
wh-024: 830,000; 380,000; 1891; 1894
wh-025: 780,000; 400,000; 1927; 1941
wh-026: 780,000; 400,000; 35,100; 33,500
wh-027: 1.76; 125,000; 1872
wh-028: 1.76; 1800; 1859
wh-029: 1.5; 400,000
wh-030: 1.8; 1
wh-031: 1.9; 1.7; 1999
wh-032: 949,000; 772,000; 1997
wh-033: 1.4; 1.1; 1978; 2000
wh-034: 700,000; 200,000; 1907; 1908
wh-035: 400,000; 40,000; 1856; 1864
wh-036: 400,000; 200,000; 295,000; 50,000
wh-037: 300,000; 40,000; 1873
wh-038: 390,000; 200,000; 2010
wh-039: 300,000; 45,000; 2008
wh-040: 700,000; 100,000; 60,000; 2003
wh-041: 335,000; 236,000; 2015
wh-042: 300,000; 1758
wh-043: 315,000; 1961
wh-044: 233,000; 1967
wh-045: 200,000; 100,000; 1987
wh-046: 2.6; 11,500; 1865
wh-047: 2.6; 400,000; 250,000
wh-048: 300,000; 40,000; 41,000; 39,000
wh-049: 45,000; 19,000; 14,000
wh-050: 2.58; 11,700; 2009
wh-051: 34; 2.7; 720; 635
wh-052: 115,000; 11,700; 26,500; 19,000
wh-053: 26,500; 19,000
wh-055: 300,000; 30,000; 1928
wh-056: 40,000; 1929
wh-057: 300,000
wh-058: 101,000; 73,000; 1991
wh-059: 64,800; 59,500
wh-060: 145,000; 30,000
wh-061: 300,000; 50,000; 40,000
wh-062: 142,000
wh-063: 100,000; 78,300; 34,000
wh-064: 74,000; 1998
wh-065: 41,000; 39,000
wh-066: 44,000; 40,000; 1909
wh-067: 42,000; 33,000; 1906
wh-068: 32,000; 31,000; 1868
wh-069: 40,000; 35,000; 1939; 2012
wh-070: 34,000; 24,000
wh-071: 38,000; 14,000; 1864
wh-072: 30,000; 1908
wh-073: 25,000; 19,000; 1869
wh-074: 20,500; 14,000
wh-075: 67,800; 51,200; 40,800
wh-076: 37,000; 33,500; 31,000; 28,000; 1994
wh-077: 21,500; 21,000; 1940; 1963
wh-078: 35,550; 15,200; 1879
wh-080: 43,000; 35,000; 18,000
wh-081: 31,000; 20,000
wh-082: 64,000; 12,200; 11,400
wh-083: 71,000; 65,000; 59,000
wh-084: 800,000; 600,000; 10,000; 4,000
wh-085: 50,000; 10,000
wh-086: 300,000; 60,000; 1987
wh-087: 130,000; 90,000; 1933
wh-088: 75,000; 50,000; 65,000; 30,000
wh-089: 100,000; 49,000; 45,000; 2010
wh-090: 1984; 2010
wh-091: 300,000; 200,000
wh-092: 65,000; 47,000; 9000
wh-093: 65,000; 1973
wh-094: 40,000; 1968; 2022
wh-095: 45,000; 8,000; 4,500
wh-096: 26,500; 24,500; 24,000
wh-097: 35,700; 11,000; 1937
wh-098: 36,000; 24,000; 23,000; 13,050
wh-099: 14,500; 1997
wh-100: 14,000; 13,050; 9000; 8000
wh-101: 13,050; 12,750
wh-102: 13,050; 12,750
wh-103: 12,845; 12,770; 12,400; 12,255; 1926
wh-104: 12,870; 11,700; 1912
wh-105: 11,700
wh-106: 9600; 4000; 1866
wh-107: 23,000; 11,600
wh-108: 9000; 7000; 8150; 1998
wh-109: 9300; 8500
wh-110: 30,000; 8000
wh-111: 12,000; 8000; 4000; 2300; 1865
wh-112: 12,000; 11,000; 1936
wh-113: 10,000; 5,000; 6,500
wh-114: 8,200; 2018
wh-116: 15,000; 11,700; 14,400; 14,200
wh-117: 14,500; 12,000; 11,000
wh-118: 10,700; 8300
wh-119: 13,000; 10,000
wh-120: 11,000; 10,000; 8,000
```
