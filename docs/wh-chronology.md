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
```
