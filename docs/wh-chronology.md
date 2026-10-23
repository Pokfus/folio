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
| dogs: probable dog bones (Europe) / oldest nuclear dog DNA (Pınarbaşı) / Bonn-Oberkassel | c. 17,000 – 14,000 / c. 15,800 / c. 14,300 years ago | Bergström 2026; Marsh 2026 (`wh-121`; `wh-117` says "conservatively c. 14,500") |
| Pre-Pottery Neolithic: PPNA / PPNB / PPNC | c. 11,700 – 10,500 / c. 10,500 – 8,250 years ago / c. 7100 – 6400 BCE | Shipton 2026; Bocquentin 2020 (`wh-122`) |
| Göbekli Tepe: in use / oldest layer | c. 9600 – 8000 / c. 9600 – 8800 BCE | Dietrich and Wagner; Caletti (`wh-123`) |
| Jericho: first use / Bronze Age city destroyed | from c. 10,500 BCE / c. 1550 BCE | Sapienza expedition (`wh-124`) |
| Çatalhöyük East Mound | c. 7100 – 5950 BCE | Schotsmans 2022; Yaka 2021 (`wh-125`) |
| 'Ain Ghazal: MPPNB / PPNC decline | c. 10,200 – 9,500 / c. 8,900 – 8,600 BP | Zielhofer et al. 2012 (`wh-126`) |
| sedentism: Kharaneh IV / house mice in the Levant / north-east China | c. 20,000 / c. 14,500 / c. 7,900 BP | `wh-127` |
| pottery: oldest (South China, contested) / Sahara / European foragers | c. 20,000 – 17,000 BP / c. 11,000 – 10,000 BP / from c. 5900 BCE | `wh-128` |
| rice domestication, Lower Yangtze | c. 10,000 – 4400 BP | Wang et al. 2022 (`wh-129`) |
| millet domestication, northern China | c. 8300 – 4300 BCE (Cishan pits disputed) | Stevens et al. 2024 (`wh-130`) |
| Neolithic Europe: farming spreads / decline | c. 6600 – 4000 BCE / c. 3000 BCE | `wh-141` |
| Skara Brae houses | c. 2900 – 2500 BCE | Historic Environment Scotland (`wh-142`) |
| Newgrange built / pig feasts | c. 3200 BCE / c. 2600 – 2450 BCE | `wh-143` |
| Varna necropolis in use / region abandoned | c. 4590 – 4340 BCE / c. 4250 – 4200 BCE | `wh-144` |
| Chalcolithic: Balkans / southern Levant | c. 5000 – 3700 BCE / c. 4500 – 3800 BCE | `wh-145` |
| metallurgy: native copper worked / earliest secure smelting | c. 9000 – 8000 BCE / c. 5000 BCE (Belovode) | `wh-146` |
| Yangshao / Longshan | c. 5000 – 3000 BCE / c. 3000 – 2000 BCE (main phase c. 2500 – 1800) | `wh-147`, `wh-148` |
| Jōmon period / rice in Kyushu | c. 16,500 – 2,400 years ago / c. 1251 – 872 BCE (the `jp-` cards differ) | `wh-149` |
| Mehrgarh: excavators' date / redated | c. 8000 BCE / c. 5200 – 4900 BCE | `wh-150` |
| African humid period / peak | c. 14,500 – 5,000 BP / c. 11,000 – 5,000 BP | `wh-151` |
| Saharan rock art: earliest / Round Heads / Pastoral / Camel | c. 12,000 / 9,500 – 7,000 / 7,200 – 3,000 / from 2,000 BP (disputed) | `wh-152` |
| African cattle: first livestock / Lake Turkana / southern Africa | c. 8,000 / c. 5,000 / c. 2,000 BP | `wh-153` |
| Nabta Playa occupied / cow tumulus | c. 8600 – 3300 BCE / c. 5400 BCE | `wh-154` |
| Kuk: first phase / mounds / ditches | c. 10,000 BP / c. 6950 – 6440 BP / c. 4350 – 3980 BP | `wh-155` |
| Austronesian: into Taiwan / out of Taiwan / Remote Oceania / East Polynesia | c. 5,500 – 5,000 / 4,200 – 4,000 / 3,500 – 2,800 BP / c. 1025 – 1290 CE | `wh-156` |
| Lapita: Bismarcks / Remote Oceania / Tonga | c. 3,350 – 3,150 / 3,000 – 2,800 / 2,850 – 2,700 BP | `wh-157` |
| Eastern Agricultural Complex: first crop / complex / maize | c. 5,025 / by 3,800 / from 1,100 BP | `wh-158` |
| Poverty Point built | c. 3,700 – 3,100 BP | `wh-159` |
| Andes: farming system / alpaca / guinea pig / potato | by c. 8,600 BP / 7,000 – 6,000 BP / 6000 – 2000 BCE / 3400 – 1600 BCE | `wh-160` |
| Chinchorro mummification | c. 7,000 – 3,500 BP | `wh-161` |
| oldest cord (Abri du Maras) / Shizitan fibres | c. 52,000 – 41,000 / c. 28,000 – 18,000 BP | `wh-164` |
| Ubaid period / wide spread | c. 6000 – 4000 BCE / from c. 4500 BCE | `wh-169` |
| urban revolution: Uruk period / named / ten criteria | c. 4000 – 3200 BCE / 1936 / 1950 | Childe (`wh-170`) |
| first writing, Mesopotamia / China | c. 3300 – 3200 BCE (c. 3200 conventional) / c. 1200 BCE | `wh-175`; agrees with `wh-001` |
| cylinder seals in use | c. 3500 – 330 BCE | `wh-176` |
| Mesopotamian absolute dates before c. 1500 BCE | the middle chronology (Hammurabi 1792 – 1750 BCE) | Manning et al. 2016 (`wh-171`, `wh-173`) |
| ard marks: oldest in Europe (Sion) / Arbon yoke | c. 5100 – 4700 BCE / 3384 – 3370 BCE | van Willigen et al. 2024; Pigière and Smyth 2023 (`wh-165`) |
| wagon-mug culture (Boleráz) formed / Ljubljana wheel / spoked wheels | by 3600 BCE / 3350 – 3100 BCE / c. 2000 BCE | `wh-166` |
| Mesopotamian civilisation, first cities to Alexander | c. 3200 – 331 BCE | Getty (`wh-171`) |
| Third Dynasty of Ur | 2112 – 2004 BCE | `wh-172` |
| Uruk period / Uruk writing | c. 4000 – 3200 BCE / from c. 3300 BCE | `wh-173`; agrees with `wh-170` |
| cuneiform in use / proto-cuneiform | c. 3300 BCE – 75 CE / c. 3300 – 2900 BCE | Ottaviano et al. 2026; Gutherz et al. 2023 (`wh-174`) |
| Ur ziggurat begun / Chogha Zanbil / Ur ziggurat rebuilt | c. 2100 BCE / c. 1250 BCE / 556 – 539 BCE | `wh-177` |
| Eridu occupied | c. 6000 – 1000 BCE | Quenet et al. 2025 (`wh-178`) |
| Early Dynastic period | c. 2900 – 2334 BCE | `wh-179` |
| Ur: first village / last dated tablets | c. 5500 BCE / c. 500 – 400 BCE | `wh-180` |
| Royal Cemetery at Ur, royal tombs | c. 2600 – 2450 BCE (c. 2600 – 2500; Puabi c. 2450) | `wh-181` |
| Gilgamesh: probable reign / deified by | c. 2600 BCE / c. 2500 BCE | Kramer 1963 (`wh-182`) |
| Epic of Gilgamesh: oldest copies / Standard version current | c. 1800 – 1500 BCE / c. 800 – 100 BCE | Robson (`wh-183`) |
| Sargon of Akkad / Akkadian period | c. 2334 – 2279 BCE / c. 2350 – 2150 BCE | Louvre; Williams et al. 2026 (`wh-184`, `wh-185`) |
| Shulgi | c. 2094 – 2047 BCE | `wh-186` |
| Old Babylonian period / Hammurabi | c. 2000 – 1500 BCE / 1792 – 1750 BCE | `wh-188`, `wh-189` |
| Hammurabi stele taken to Susa / found | c. 1150 BCE / 1901 – 1902 | `wh-190` |
| Babylon: sacked by the Hittites / razed by Sennacherib / Nebuchadnezzar II / taken by Cyrus | 1595 / 689 / 605 – 562 / 539 BCE | `wh-191` |
| Enuma Elish composed by / last dated copy | 1082 BCE / 495 BCE | `wh-193` |
| Babylonian place value / mathematics, Old Babylonian | c. 2100 BCE / c. 2000 – 1600 BCE (c. 1900 – 1700 in one museum) | `wh-194` |
| astronomy observed / diaries extant / Halley's Comet | c. 750 BCE – 75 CE / 652 – 61 BCE / 164 BCE | `wh-195` |
| Nippur destroyed | 1722 BCE (chronology unnamed by its source) | `wh-196` |
| Gulf trade / Kanesh tablets | c. 2900 – 1700 BCE / 1930 – 1775 BCE | `wh-197` |
| Kassites: first attested / Nippur archive / dynasty ends | 1770 / c. 1360 – 1220 / c. 1155 – 1150 BCE | `wh-198` |
| Elam: Proto-Elamite / first named / Middle Elamite / Susa sacked | c. 3050 – 2900 / c. 2650 / c. 1500 – 1100 / 646 BCE | `wh-199` |
| Mitanni empire | c. 1550 – 1350 BCE | `wh-200` |
| maize: domesticated / in South America / Guilá Naquitz cobs | c. 9,000 / by c. 7,000 / c. 6,250 years ago | Matsuoka 2002; Kistler 2020; Piperno and Flannery (`wh-131`) |
| Neolithic demographic transition, south-eastern Europe | from c. 8,500 years ago | Shennan et al. 2013 (`wh-133`) |
| zoonotic pathogens in Eurasian remains / Baikal plague / flea-borne plague | from c. 6,500 / c. 5,500 / by c. 3,800 years ago | Sikora et al. 2025; Macleod et al. 2026 (`wh-134`) |
| lactase persistence: modelled start / earliest carrier / rise in Europe | c. 7,500 BP / 5,960 BP / after 3,000 BP | Itan 2009; Ségurel 2020 (`wh-135`) |
| secondary products revolution proposed | 1981 | Sherratt (`wh-136`) |
| Linear Pottery culture / fades | c. 5500 – 5000 BCE / c. 5000 – 4900 BCE | Gelabert et al. (`wh-137`) |
| Stonehenge: ditch / sarsens / last pits | c. 3000 / c. 2500 / c. 1800 – 1500 BCE | English Heritage (`wh-139`) |
| Ötzi died | c. 3350 – 3120 BCE; found 1991 | Wang et al. 2023 (`wh-140`) |
| Egypt: dynastic era / Old Kingdom / New Kingdom | c. 3100 – 30 BCE / c. 2686 – 2181 BCE (some end it 2160 or 2125) / c. 1550 – 1069 BCE | Australian Museum; Egyptian Ministry of Tourism and Antiquities (`wh-201`, `wh-210`) |
| Near Eastern crops in Egypt | from c. 5000 BCE (5th millennium; none in the 6th) | Linseele et al. (`wh-202`) |
| Naqada culture / Naqada I / Naqada II | c. 4000 – 3100 / c. 4000 – 3500 / c. 3500 – 3200 BCE (eg- cards give a radiocarbon c. 3800 – 3085) | Egyptian Ministry (`wh-203`) |
| Narmer Palette dedicated / found | c. 3150 – 3000 BCE (two scholars' figures) / 1898 | Anđelković; O'Connor (`wh-204`) |
| unification of Egypt: the process / the usual date | c. 3350 – 3050 BCE / c. 3100 BCE | Campagno; Egyptian Ministry (`wh-205`) |
| hieroglyphs: Tomb U-j / last inscription / deciphered | c. 3320 BCE (c. 3200 in another account) / 394 CE / 1822 | Visible Language (`wh-206`) |
| Rosetta Stone: decree / found | 27 March 196 BCE / July 1799 | Bevan 1927; Leclant 1999 (`wh-207`) |
| papyrus: Hemaka roll / Merer's logbook | c. 3200 BCE (one study; another "3rd millennium") / c. 2600 BCE | Autran et al.; Łojewska et al. (`wh-208`) |
| Step Pyramid of Djoser built | c. 2686 – 2667 BCE (Djoser's reign) | Egyptian Ministry (`wh-211`) |
| Great Pyramid built | c. 2589 – 2566 BCE (Khufu's reign; other starts 2554 and later) | Egyptian Ministry (`wh-212`) |
| Great Sphinx carved / Dream Stela | c. 2613 – 2494 BCE (Fourth Dynasty; usually given to Khafre, c. 2558 – 2532) / c. 1400 – 1390 BCE | Egyptian Ministry (`wh-213`) |
| earliest embalming balms (Mostagedda) | c. 4500 – 3350 BCE | Jones et al. (`wh-214`) |
| Book of the Dead: first spells / main use | c. 1773 – 1650 BCE (13th Dynasty) / c. 1580 – 30 BCE | Scalf (`wh-215`) |
| First Intermediate Period | c. 2181 – 2055 BCE; also c. 2160 – 2050 and 2250 – 2045 | Egyptian Ministry; Moreno García; Weiss (`wh-217`) |
| Middle Kingdom / 12th Dynasty | c. 2055 – 1650 / c. 1985 – 1795 BCE (`eg-175`: c. 1981 – 1800); radiocarbon start c. 2070 – 2037 | Egyptian Ministry; Erdil et al. 2025 (`wh-218`) |
| Hyksos rule (15th Dynasty) | c. 1638 – 1530 BCE | Stantis et al. (`wh-219`) |
| New Kingdom / 18th / 19th / 20th Dynasty | c. 1550 – 1069 / 1550 – 1295 / 1295 – 1186 / 1186 – 1069 BCE; Ahmose's accession estimated 1580 – 1524 | Egyptian Ministry; Bruins and van der Plicht (`wh-220`) |
| Hatshepsut: ruled / as crowned king | c. 1479 – 1458 / c. 1473 – 1458 BCE | Saleem and Hawass; Egyptian Ministry (`wh-221`) |
| Thutmose III: reign / alone | c. 1479 – 1425 BCE (others 1504 – or 1468 – 1415) / from c. 1458 BCE | Saleem and Hawass; Manning; Bruins and van der Plicht (`wh-222`) |
| Akhenaten's reign | c. 1352 – 1336 BCE (another dating c. 1340 – 1323); Akhetaten chosen in year 5 | Digital Karnak; Amarna Project (`wh-223`) |
| Tutankhamun's reign / tomb found | c. 1336 – 1327 BCE (others c. 1328 – 1319) / 1922 | Egyptian Ministry; Getty Conservation Institute (`wh-224`) |
| Ramesses II's reign | c. 1279 – 1213 BCE; accession 1290 BCE on one recent view | Manning 2023 (`wh-225`) |
| Battle of Kadesh | 1274 BCE (c. 1286 on a higher chronology) | Al-Harbi; Servajean (`wh-226`) |
| Valley of the Kings in use | c. 1504 – 1069 BCE (Thutmose I to the end of the 20th Dynasty) | Egyptian Ministry (`wh-227`) |
| Karnak: first firm temple / Hypostyle Hall | c. 2112 – 2063 BCE (Intef II) / c. 1294 – 1213 BCE (Sety I, Ramesses II) | Egyptian Ministry (`wh-228`) |
| Third Intermediate Period | c. 1069 – 664 BCE; the Ministry ends it c. 747 BCE | Australian Museum; Egyptian Ministry (`wh-230`) |
| Indus civilisation, urban (Mature Harappan) phase | c. 2600 – 1900 BCE | Green 2022; Parikh and Petrie (`wh-231`, `wh-233`–`wh-235`) |
| Harappa occupied / Kot Diji phase | c. 3700 – 1300 / c. 2800 – 2600 BCE | James et al. 2025 (`wh-232`) |
| Mohenjo-daro excavated | 1922 – 1931 | Marshall 1931 (`wh-233`) |
| Indus script, first seal found | 1872 – 1873 | Farmer, Sproat and Witzel (`wh-234`) |
| Dholavira occupied / excavated | c. 3000 – 1500 BCE (one account ends it c. 1700) / 1989 – 2005 | Prasad and Prabhakar (`wh-236`) |
| Lothal, Rao's Periods I / II | c. 2500 – 1500 / c. 1500 – 1000 BCE (early radiocarbon put the later levels older) | Kusumgar, Lal and Sarna 1963 (`wh-237`) |
| Late Harappan phase | c. 1900 – 1300 BCE | Robbins Schug et al. (`wh-238`) |
| steppe ancestry: in Central Asia / in South Asia | c. 2100 – 1700 / c. 2000 – 1500 BCE | Narasimhan et al. 2019 (`wh-239`) |
| Vedic period | c. 1500 – 500 BCE (every date an estimate from the texts); oldest Upanishads c. 700 – 500 BCE | Macdonell; Black (`wh-240`) |
| Rigveda composed | c. 1500 – 1000 BCE (a 1900 estimate); the middle books c. 1200 BCE (a modern study) | Macdonell 1900; Kolipakam et al. (`wh-241`) |
| Old Indo-Aryan / Panini's grammar | c. 1750 – 250 BCE / c. 400 BCE | Kolipakam et al.; Deshpande (`wh-242`) |
| Erlitou culture / the site at its height / found | c. 1800 – 1530 BCE (older accounts c. 1900 – 1500) / c. 1750 – 1530 BCE / 1959 | Xie et al. 2020 (`wh-243`) |
| Xia dynasty, three reckonings | 2205 – 1767 BCE (later imperial annals) / from 1989 BCE (Bamboo Annals) / c. 2070 – 1600 BCE (chronology project) | Chavannes; Chen (`wh-244`) |
| Shang dynasty / at Anyang | c. 1600 – 1046 BCE (chronology project) / c. 1250 – 1046 BCE | Tang et al.; Zhang et al. (`wh-245`) |
| oracle bone script / found | c. 1250 – 1046 BCE / 1899; eclipses fix c. 1201 – 1181 BCE | Ottaviano et al. (`wh-246`) |
| Yinxu occupied | c. 1250 – 1045 BCE (the Zhou conquest 1046 on the standard chronology) | Liu et al. (`wh-247`) |
| Chinese ritual bronzes | c. 1600 – 221 BCE (Shang and Zhou) | Liu et al. (`wh-248`) |
| Wu Ding's reign (Fu Hao) | c. 1250 – 1192 BCE | Lee 2002 (`wh-249`) |
| Sanxingdui centre / pits / found | c. 1700 – 1000 BCE / c. 1200 – 1000 BCE (Pit 4 1199 – 1017) / 1929 | Yan et al. (`wh-250`) |
| Western Zhou / firm year-by-year dates | c. 1046 – 771 BCE (the project also gave 1044 and 1027; others 1045 or 1047) / from 841 BCE | Lee 2002 (`wh-251`) |
| Mandate of Heaven, earliest texts | c. 1046 – 771 BCE (Western Zhou bronzes and Documents chapters) | Kosec; Schaberg; Poo (`wh-252`) |
| Chinese characters: first attested / Qin standard / simplified | c. 1250 BCE / 221 BCE / 1956 | Ottaviano et al.; Han et al.; Wang et al. (`wh-253`) |
| silk: earliest trace (Jiahu) / first cloth / cocoons in Uzbekistan | c. 8500 BP / c. 5000 BP / 1940 – 1765 BCE | Gong et al.; Zhou et al. (`wh-254`) |
| jade in China: first worked (Xinglongwa) / Hongshan peak / Liangzhu | c. 6200 – 5400 / c. 3500 – 3000 / c. 3200 – 2000 BCE (`cnh-049`: 3300 – 2300) | Liu (`wh-255`) |
| Bronze Age by region: Anatolia / Low Countries / East Asia | c. 3300 – 1200 / c. 2200 – 800 / c. 1700 – 300 BCE | Aşınmaz et al.; Merkel et al.; Cooper and Grebnev (`wh-256`) |
| bronze: earliest known (Pločnik) / widespread | c. 4650 BCE / by 1500 BCE | Radivojević et al.; Powell et al. (`wh-257`) |
| Yamnaya culture / widest extent | c. 3300 – 2500 BCE / by 3000 BCE | Wilkin et al.; Lazaridis et al. 2025 (`wh-258`) |
| Indo-European: proposed origins / first written (Anatolian) / steppe spread | c. 9500 – 6000 years ago (the theories differ) / c. 2000 BCE / c. 3300 – 1500 BCE | Tassi et al.; Lazaridis et al. 2025 (`wh-259`) |
| horses: Botai / modern domestic line | c. 3500 – 3100 BCE / c. 2200 BCE | Anthony et al.; Librado et al. (`wh-260`) |
| chariot: earliest (Sintashta) / in China | c. 2000 – 1800 BCE / from c. 1200 BCE (late Shang) | Librado et al.; Anthony et al. (`wh-261`) |
| Minoan civilisation / first palaces / palaces fall | c. 3100 – 1050 BCE / c. 1900 BCE / c. 1490 – 1470 BCE | Rutter (`wh-262`) |
| Mycenaean shaft graves / collapse | c. 1650 – 1500 BCE / c. 1250 – 1050 BCE (`gr-056` ends c. 1100) | Rutter (`wh-263`) |
| Minoan eruption | c. 1627 – 1600 BCE (radiocarbon) against c. 1540 – 1500 BCE (archaeology); `gr-043` gives one range, c. 1610 – 1540 | Karátson et al.; Pearson et al. (`wh-264`) |
| Linear B in use / deciphered | c. 1450 – 1200 BCE (`gr-074` from c. 1400) / 1952 | Clemente et al.; Mycenaean Epigraphy Group (`wh-265`) |
| Hittite kingdom / Hattusa conquered / tablets found / language deciphered | c. 1650 – 1200 BCE / c. 1730 BCE (one genetic study) / 1906 / 1915 | Manning et al.; Lazaridis et al. 2025; Muhly (`wh-266`, `wh-267`) |
| Ugarit at its height / destroyed / found | c. 1600 – 1200 BCE / c. 1192 – 1190 BCE / 1928 | Fuller et al.; Kaniewski et al.; Gordon (`wh-268`) |
| Proto-Sinaitic: Sinai texts / Wadi el-Hol / minority date | c. 1900 – 1800 / c. 1850 – 1700 / c. 1400 – 1300 BCE | Höflmayer et al.; Lam (`wh-269`) |
| Amarna letters written / found | c. 1365 – 1330 BCE / 1887 | Aissaoui; Scoville (`wh-270`) |
| Uluburun ship sank / found / excavated | c. 1320 BCE (± 15; others c. 1310 or 1300) / 1982 / 1984 – 1994 | Institute of Nautical Archaeology (`wh-271`) |
| tin: Assur caravans to Anatolia | c. 1950 – 1750 BCE (`wh-272` is `undatable`; prose only) | (`wh-272`) |
| Bell Beaker: spread / fades | c. 2750 – 2500 BCE / 2200 – 1800 BCE; Britain from c. 2450 | Olalde et al. 2018 (`wh-273`) |
| Únětice culture (central Germany) | c. 2200 – 1550 BCE; Leubingen oak 1942 ± 10 BCE | Penske et al. (`wh-274`) |
| Nebra sky disc made / buried / found | c. 1800 – 1700 / c. 1600 BCE / 1999 (an Iron Age date proposed in 2020, rebutted) | Dieck et al. (`wh-275`) |
| Nordic Bronze Age / Period I | c. 1700 – 500 / c. 1700 – 1500 BCE | Díaz-Guardamino et al.; Frei et al. (`wh-276`) |
| Oxus civilisation: Gonur North / final phase | c. 2200 – 1950 / c. 1800 – 1500 BCE | Berger et al.; Guarino-Vignon et al. (`wh-277`) |
| Sea Peoples under Merneptah / Ramesses III's Delta battle | c. 1213 – 1203 BCE / c. 1188 – 1176 BCE (datings differ) | Kaniewski et al. (`wh-278`) |
| Late Bronze Age collapse / Hittite drought | c. 1250 – 1150 BCE / c. 1198 – 1196 BCE | Knapp and Manning; Manning et al. (`wh-279`) |
| iron: first used / main metal in the southern Levant | before 2100 BCE / c. 1000 – 800 BCE | Mokrišová and Verčík; Yahalom-Mack and Eliyahu-Behar (`wh-280`) |
| Iron Age by region: southern Levant / early Aegean / England and Wales / southern Africa (Early Iron Age) | c. 1200 – 586 BCE / c. 1050 – 700 BCE / c. 800 BCE – 50 CE / c. 200 – 900 CE | Regev et al.; Mokrišová and Verčík; Cassidy et al.; Mathoho et al. (`wh-281`) |
| Neo-Assyrian Empire / Nineveh falls / Harran lost / last bid | c. 912 – 609 BCE / 612 / 610 / 609 BCE; eponym eclipse 15 June 763 BCE | Sinha et al.; Gadd 1923 (`wh-282`) |
| Nineveh capital | c. 705 – 612 BCE (first attack 614) | Luckenbill; Ur (`wh-283`) |
| Ashurbanipal's reign | 668 – 631 BCE (older works 626); civil war 652 – 648 | Bach (RINAP 5); Zaia (`wh-284`) |
| Assyrian mass deportation / Judah | c. 850 – 612 BCE (systematic from Tiglath-pileser III, 745 – 727) / 701 BCE | Sazonov; Tsakanyan; Vaknin et al. (`wh-285`) |
| Neo-Babylonian Empire | 626 – 539 BCE | Novotny and Weiershäuser (`wh-286`) |
| Nebuchadnezzar II / Carchemish / Jerusalem burned | 605 – 562 BCE (604 counting the first full year) / 605 / 586 BCE (`wh-289`: 587 or 586) | Regev et al.; ABC 5 (`wh-287`) |
| Babylonian captivity: deportations / conventional end / Al-Yahudu tablets | 597 – 582 / 539 BCE / 572 – 477 BCE | Makuwa; Alstola (`wh-289`) |
| Israel and Judah / Samaria falls / Jerusalem falls | c. 950 – 586 BCE / 722 or 720 BCE / 586 BCE; Qarqar 853 BCE | Vishne et al.; Nissinen; Vaknin et al. (`wh-290`) |
| Hebrew Bible: composition / Ketef Hinnom amulets / in Greek | c. 800 – 160 BCE (scholars' reconstructions) / c. 600 BCE (most; one later) / by 132 BCE | Faigenbaum-Golovin et al.; Popović et al.; Waaler; Swete (`wh-291`) |
| Judaism: Elephantine temple destroyed / Second Temple destroyed | 411 BCE / 70 CE (`wh-292` is `undatable`) | Cowley (`wh-292`) |
| Phoenicia takes shape / Tyre falls to Alexander | c. 1200 – 1150 BCE / 332 BCE | Clark; MacDonald (`wh-293`) |
| Phoenician alphabet fixed / Ahiram epitaph | c. 1000 BCE | Lam (`wh-294`) |
| Carthage founded | 814/813 BCE (Timaeus) against radiocarbon c. 895 – 795 BCE (disputed); destroyed 146 BCE | van der Plicht et al.; Fantalkin et al. (`wh-295`) |
| Urartu at its height / Sargon's eighth campaign | c. 800 – 550 BCE / 714 BCE | Matthews et al. 2025 (`wh-296`) |
| Lydia: Mermnad kings / Sardis taken | c. 680 – 547 BCE / 547 BCE (Nabonidus Chronicle, if read as Lydia) or 546 (Eusebius) | Greenewalt; Cahill (`wh-297`) |
| first coins (Lydia and Ionia) / China (Guanzhuang) / India (punch-marked) | c. 660 – 630 BCE (Artemision deposit before c. 640 – 620) / c. 640 – 550 / c. 600 – 400 BCE | Meadows; Zhao et al.; Upadhyay (`wh-298`) |
| Medes in Assyrian records / Nineveh falls / Astyages falls | c. 858 – 656 BCE / 612 / 550 BCE | Lendering; Radner; Gadd; Nabonidus Chronicle (`wh-299`) |
| Cyrus the Great: reign / Ecbatana / Babylon | 559 – 530 BCE / 550 / 539 BCE | Lendering; Nabonidus Chronicle (`wh-300`) |
| Achaemenid Empire | c. 550 – 330 BCE | Matthews and Fazeli Nashli (`wh-301`) |
| Persepolis founded / fortification tablets / treasury tablets / burned | c. 520 – 515 BCE / 509 – 493 / 492 – 457 / 330 BCE | Shahbazi; Matthews et al.; Dandamayev (`wh-302`) |
| Darius I's reign / Marathon | 522 – 486 BCE / 490 BCE | Lendering; Altaweel and Squitieri (`wh-303`) |
| Royal Road: travel-ration tablets | 509 – 493 BCE (Hallock gives 509 – 494) | Matthews and Fazeli Nashli; Hallock (`wh-304`) |
| Satraps' Revolt (Diodorus) / Parthia and Bactria break away | 362 – 361 BCE / around 250 BCE (`wh-305` is `undatable`; prose only) | Diodorus; Canali De Rossi (`wh-305`) |
| Zoroaster's date / Sasanian state religion / Parsis reach Gujarat | c. 1200 BCE (most) to the 7th – 6th century BCE, disputed / 224 – 651 CE / 785 – 936 CE (estimates from a legend) (`wh-306` is `undatable`) | López et al.; Hall (`wh-306`) |
| Behistun Inscription carved / copied | c. 520 – 518 BCE (`gr-386`: 521 – 519) / 1835 – 1847 | Schmitt (`wh-307`) |
| Xerxes I's reign / invasion of Greece | 486 – 465 BCE / 480 – 479 BCE | Iliakis (`wh-308`) |
| Aramaic: first inscriptions / Egyptian papyri / Neo-Aramaic | c. 900 – 800 BCE / c. 500 – 400 BCE / from c. 1200 CE | Aioanei et al.; Cowley; Endangered Language Alliance (`wh-309`) |
| fall of the Achaemenid Empire / Gaugamela / Darius III killed | 334 – 330 BCE / 1 October 331 BCE / 330 BCE | Lendering (`wh-310`) |
| Ancient Greece: Archaic / Classical / Hellenistic | c. 800 – 479 / 479 – 323 / 323 – 30 BCE (`docs/greece-chronology.md`: Classical from 480, Hellenistic to 31) | Rönnberg; Vlassopoulos on Hall; Gaukroger on Hornblower; Worthington on Shipley (`wh-311`) |
| polis, rise (one view) | c. 800 – 700 BCE | Vlassopoulos on Hall (`wh-312`) |
| Greek colonisation, main phase / Syracuse founded | c. 800 – 500 BCE / c. 733 BCE (both on Thucydides' count) | Delp; Evans (`wh-313`) |
| Homeric poems composed / West's Iliad / pre-eminent | c. 700 BCE / c. 680 – 640 BCE (one view) / by c. 500 BCE | Pisano; Ford; Holmberg (`wh-314`) |
| Greek alphabet adopted / oldest finds | c. 800 BCE (one case for the 11th century) / c. 750 – 700 BCE | Lang; Waal (`wh-315`) |
| Spartan state formed / dominant | c. 800 – 700 BCE / 404 – 371 BCE | Larson on Kõiv; Kulesza (`wh-316`) |
| Classical Athens: sacked / falls / period ends | 480 / 404 / 323 BCE | Lendering; National Archaeological Museum (`wh-317`) |
| Athenian democracy: Cleisthenes / Areopagus curbed / restored / abolished | 508/507 / 462/461 / 403 / 322 BCE | Rhodes; Attic Inscriptions Online (`wh-318`) |
| Greco-Persian Wars / invasions / Peace of Callias | 499 – 479 BCE / 490; 480 – 479 BCE / probably 449 BCE | Branscome; Jung (`wh-319`) |
| Battle of Marathon | 490 BCE (the day, mid-August or mid-September, a modern reckoning) | Rhodes (`wh-320`) |
| Battles of Thermopylae and Salamis | 480 BCE (the days modern reckonings: Thermopylae 12 – 14 August or mid-September; Salamis late September) | Lendering; Kulesza; Tuplin (`wh-321`, `wh-322`) |
| Delian League: founded / treasury to Athens / broke up | 478/477 BCE / 454 BCE (from the tribute lists) / 404 BCE | Lendering; Attic Inscriptions Online (`wh-323`) |
| Pericles: born / funeral speech / died | c. 495 BCE (another estimate 494) / 431 / 429 BCE | Lendering; Cromey (`wh-324`) |
| Parthenon: built / blown up | 447 – 432 BCE / 1687 CE | Acropolis Restoration Service; St Clair (`wh-325`) |
| Thespis (Parian Marble) / stone theatres | c. 534 BCE (`gr-590`: c. 560) / c. 350 – 300 BCE | the Suda; Poli Palladini; Xanthaki-Karamanou (`wh-326`) |
| Socrates: born / tried and died | c. 469 BCE (`gr-627`: c. 470) / 399 BCE | Nails and Monoson; Ambury (`wh-327`) |
| Plato: born / Academy / died | c. 428 BCE (424/423 on one biography) / after 387 BCE / 348/347 BCE | Brickhouse and Smith; Kraut (`wh-328`) |
| Aristotle: born / Lyceum / died | 384 / 335 / 322 BCE | Shields (`wh-329`) |
| Peloponnesian War / Sicily / Aegospotami | 431 – 404 BCE / 415 – 413 BCE / 405 BCE | Lendering; Hughes (`wh-330`) |
| Herodotus: born / still writing / died | c. 484 BCE (Gellius) / 429 BCE / before 413 BCE | Godley; Lendering (`wh-331`) |
| Philip II: born / reigned / Chaeronea / killed | c. 382 BCE / 359 – 336 BCE / 338 / 336 BCE | Lendering; Bury (`wh-332`) |
| Alexander the Great: born / king / died | 356 BCE / 336 – 323 BCE / June 323 BCE | Lendering (`wh-333`) |
| Hellenistic period / also dated | 323 – 30 BCE / 334 – 31 BCE (Green) | Kosmetatou; Bauschatz (`wh-334`) |
| Library of Alexandria: founded / Caesar's fire / palace quarter wrecked / Serapeum razed | c. 304 – 282 BCE (disputed) / 48 BCE / 273 CE / 391 CE | Berti and Costa; Bagnall; Encyclopaedia Romana (`wh-335`) |
| Ancient Rome: founded / emperors / west ends / east ends | 753 BCE (Varro's reckoning) / from 27 BCE / 476 CE (a convention) / 1453 CE | Lendering; Keegan; O'Donnell; Neville (`wh-336`) |
| Etruscan civilisation: emerges / Veii falls / Roman conquest | c. 900 BCE (`rm-022`: c. 1000) / 396 BCE (the ancient date) / c. 300 – 100 BCE | Posth et al.; Potts and Smith (`wh-337`) |
| founding of Rome: traditional / other ancient dates / one state / Palatine wall | 753 BCE (Varro) / 813 – 728 BCE (Timaeus to Cincius) / c. 700 – 600 BCE / c. 730 – 720 BCE (excavators' dating) | Velleius; Dionysius; Forsythe; Walt (`wh-338`) |
| Roman Kingdom (traditional) / Dionysius's own count | 753 – 509 BCE / 751 – 507 BCE | Diodato et al.; Bailey on Flower; Dionysius (`wh-339`) |
| Roman Republic (traditional) / Caesar dictator | 509 – 27 BCE / from 49 BCE | Ravasini et al.; Bailey on Flower (`wh-340`) |
| Twelve Tables: drafted / ratified | 451 – 450 BCE / 449 BCE (by tradition) | Johnson, Coleman-Norton and Bourne (`wh-342`) |
| Conflict of the Orders (the tradition) / Licinian–Sextian law / last secession | 494 – 287 BCE / 367 BCE / 287 BCE | Koptev; Livy, *Periochae* (`wh-343`) |
| Punic Wars: all / first / second / third | 264 – 146 / 264 – 241 / 218 – 201 / 149 – 146 BCE | Ringbauer et al.; Drogula (`wh-345`) |
| Hannibal: born / invades Italy / exiled / died | c. 247 BCE / 218 / 195 / 183, 182 or 181 BCE (Nepos's sources disagree) | Mulligan; Berti and Vollrath; Burton (`wh-346`) |
| Battle of Cannae | 216 BCE (2 August by the Roman calendar, from Quintus Claudius) | Mulligan; Strauss (`wh-347`) |
| destruction of Carthage | spring 146 BCE (Third Punic War from 149) | Appian; Jacobs (`wh-348`) |
| Roman conquest of Greece / Isthmian proclamation / Corinth sacked / province of Achaea | 229 – 146 BCE / 196 BCE / 146 BCE / 27 BCE | Burton; Bloy; Palamidis (`wh-349`) |
| Gracchi: Tiberius tribune and killed / Gaius tribune / Gaius dies | 133 BCE / 123 BCE (re-elected for 122) / 121 BCE | Probst; Livy, *Periochae* (`wh-350`) |
| Marius's consulships / Sulla's march on Rome / Sulla dies | 107 – 86 BCE / 88 BCE / 78 BCE | Plutarch, *Marius* and *Sulla* (`wh-351`) |
| Third Servile War | 73 – 71 BCE | Plutarch, *Crassus* (`wh-352`) |
| Julius Caesar: born / consul / killed | c. 100 BCE (Mommsen 102) / 59 BCE / 15 March 44 BCE | Suetonius; Wickham; Lendering (`wh-353`, `wh-356`) |
| Gallic Wars / Alesia | 58 – 50 BCE / 52 BCE | Westall; Lendering (`wh-354`) |
| Caesar's civil war / Pharsalus / Thapsus | 49 – 45 BCE (the Rubicon 10/11 January 49 on one reckoning) / 48 BCE / 46 BCE | Lendering (`wh-355`) |
| Augustus: born / sole ruler / named Augustus / died | 23 September 63 BCE / 31 BCE / 16 January 27 BCE / 19 August 14 CE | Fagan; Lendering (`wh-357`) |
| Roman Empire: emperors / west ends / east ends | from 27 BCE / 476 CE (by convention) / 1453 CE | Lendering; Mathisen; Neville (`wh-358`) |
| Pax Romana (a convention) | 27 BCE – 180 CE (another reading c. 150 BCE – 235 CE) | Drake (`wh-359`) |
| Roman roads: the Appian Way begun | 312 BCE | Livy (`wh-360`) |
| aqueducts at Rome: first / last | 312 BCE (Aqua Appia) / 226 CE (Aqua Alexandrina) | Deming (`wh-361`) |
| Colosseum: begun / opened / last hunts | c. 70 CE / 80 CE / 523 CE | Podestà et al.; Platner and Ashby (`wh-362`) |
| Pompeii: first walls / Roman colony / buried | c. 600 – 500 BCE / 80 BCE / 79 CE (24 August in Pliny; 24 October argued from a 2018 find) | Anguissola; Lendering (`wh-365`) |
| Nero: born / emperor / died | 15 December 37 CE / 54 – 68 CE / 9 June 68 CE | Lendering (`wh-366`) |
| Trajan: born / emperor / died | 18 September 53 CE / 98 – 117 CE / August 117 CE (7 or 9 August) | Benario (`wh-367`) |
| Hadrian's Wall: begun / latest coins | c. 122 CE / 403 – 406 CE | Breeze (`wh-368`) |
| Marcus Aurelius: born / reigned / died | 26 April 121 CE / 161 – 180 CE / 17 March 180 CE | Benario (`wh-369`) |
| Crisis of the Third Century (a convention) / crisis proper / Plague of Cyprian | 235 – 284 CE / 249 – 268 CE (de Blois) / c. 251 – 266 CE | Marussi et al.; Sancinito on de Blois; Zonneveld et al. (`wh-370`) |
| Diocletian: born / reigned / died | c. 236 – 245 CE / 284 – 305 CE / 313 or 316 CE | Mathisen; Lendering (`wh-371`) |
| Constantine: born / reigned / died | c. 271 – 273 CE / 306 – 337 CE / 22 May 337 CE | Pohlsander (`wh-372`) |
| Christianity in the empire: Pilate's prefecture / Great Persecution / Nicene law / pagan cults banned | 26 – 36 CE / 303 – 313 / 380 / 391 – 392 CE | Lendering; DeVore (`wh-373`) |
| First Council of Nicaea opens | 20 May 325 CE | Pohlsander (`wh-374`) |
| fall of the Western Roman Empire | 476 CE (a convention; Nepos lived to 480) | Mathisen and Nathan; O'Donnell (`wh-375`) |
| mahajanapadas (one estimate) | c. 550 – 322 BCE (the source's 2500 – 2272 BP) | Kathayat et al. (`wh-376`) |
| Upanishads: older group / later group | c. 700 – 500 BCE / c. 300 – 100 BCE (Olivelle; Macdonell 1900: earliest by c. 600) | Black; Macdonell (`wh-377`) |
| Gautama Buddha: older dating / newer death | c. 563 – 483 BCE / c. 405 BCE (Gombrich c. 404) | Rapson; Siderits (`wh-380`) |
| Buddhism emerges / Mahayana doctrines | c. 600 – 400 BCE / roughly the 1st century BCE | Velez; Siderits; Ronkin (`wh-381`) |
| Mahavira: traditional dates / scholars' death | 599 – 527 BCE / c. 468 BCE (`wh-382` is `undatable`) | Gorisse; Charpentier (`wh-382`) |
| Maurya Empire | c. 321 – 184 BCE (both ends reconstructed) | Hopkins; Rapson (`wh-383`) |
| Chandragupta Maurya: reign / meets Seleucus | c. 321 – 297 BCE / c. 305 – 303 BCE | Thomas; Jansari (`wh-384`) |
| Arthashastra: composed / expanded / rediscovered | c. 50 BCE – 125 CE / c. 175 – 300 CE (Olivelle) / 1905 | Davis on Olivelle; Fleet (`wh-385`) |
| Ashoka: born / reigned / Kalinga / died | c. 304 BCE / c. 268 – 232 BCE / c. 260 BCE / c. 232 BCE | Dhammika; Singh; Trautmann (`wh-386`) |
| Edicts of Ashoka: issued / deciphered / Maski find | c. 259 – 242 BCE (Thomas; Hultzsch puts the coronation 264) / 1837 / 1915 | Thomas; Prinsep (`wh-387`) |
| Buddhism reaches Sri Lanka / China / Korea / Japan | c. 246 BCE / by c. 65 CE / 372 CE / 538 or 552 CE | Barnett; Hill; Muller (`wh-388`) |
| Indo-Greek kingdoms / Menander | c. 200 BCE – c. 10 CE / c. 165 – 130 BCE (`gr-785`: c. 155 – 130) | Rapson; Bopearachchi (`wh-390`) |
| Kushan Empire: Kujula in dated texts / Kanishka's year one / Sasanian vassals | c. 75 – 89 CE / 127 CE (most; 78 CE also held) / c. 224 – 270 CE | Falk; Rienjang and Stewart; Cribb (`wh-391`) |
| Gandharan (Greco-Buddhist) art | c. 50 – 500 CE | Rienjang and Stewart (`wh-392`) |
| Gupta Empire / Gupta era begins | c. 320 – 550 CE / 319 – 320 CE | Smith; Fleet (`wh-393`) |
| Hindu–Arabic numerals: full system / Gwalior zero / Liber Abaci | c. 550 CE / 876 CE / 1202 | Plofker et al.; Casselman; Smith and Karpinski (`wh-394`) |
| Classical Sanskrit court poetry (Macdonell) / poets named in an inscription | c. 200 BCE – 1100 CE / 634 CE | Macdonell (`wh-395`) |
| Eastern Zhou / its halves divided / remnant annexed | 770 – 256 BCE / 481, 475, 453 or 403 BCE / 249 BCE | Wu et al.; Chavannes; Miller et al.; Pines; Hirth (`wh-396`) |
| Spring and Autumn period / the Annals | c. 770 – 475 BCE (`cnh-142`: c. 476) / 722 – 481 BCE | Asia for Educators; Chavannes (`wh-397`) |
| Warring States period / other starts | c. 475 – 221 BCE / 453 or 403 BCE (`cnh-163`: 480, 403 or 376) | Asia for Educators; Pines (`wh-398`) |
| Confucius: born / died | 551 (Sima Qian) or 552 BCE (the commentaries) / 479 BCE | Kononchuk; Sima Qian (`wh-399`) |
| Taoism: Guodian slips / *daojia* coined (Sima Tan died) / Celestial Masters (traditional) | c. 300 BCE / 110 BCE / 142 CE (`wh-401` is `undatable`) | Chan; Littlejohn; Pregadio (`wh-401`) |
| Legalism: Shang Yang in office / Han Fei died / Sima Tan died | 359 – 338 BCE (`cnh-169`: from 356) / 233 BCE / 110 BCE (`wh-402` is `undatable`) | Pines; Duyvendak (`wh-402`) |
| The Art of War: made / Yinqueshan tombs / slips found / first French version | c. 475 – 221 BCE / c. 140 – 118 BCE / 1972 / 1772 | Mair; Theobald (`wh-403`) |
| Qin Shi Huang: born / King of Qin / First Emperor / died | 259 / 247 / 221 / 210 BCE | Sima Qian (Chavannes) (`wh-404`) |
| Qin dynasty / lordship (tradition) / revolts began | 221 – 207 BCE (206 also counted; `cnh-191`: 206) / 770 BCE / 209 BCE | Pines; Chavannes; Bevan et al. (`wh-405`) |
| Terracotta Army / mausoleum begun / found | by 210 BCE / 247 or 246 BCE / 1974 | Quinn et al.; Ma et al. (`wh-406`) |
| Great Wall: earliest walls / Qin river wall / Ming building / 2012 survey | c. 475 – 221 BCE / 214 BCE / 1465 – 1620 CE / 21,196 km | Li et al.; Chavannes; Yang et al.; Xinhua (`wh-407`) |
| Han dynasty: Western / Xin / Eastern / Emperor Wu | 206 BCE – 9 CE / 9 – 23 CE / 25 – 220 CE / 141 – 87 BCE (140 or 86 also given) | Asia for Educators; van Ess; Alfani et al. (`wh-408`) |
| Silk Road: name coined / Zhang Qian returned / Xuanquanzhi relay station (`wh-409` is `undatable`) | 1877 / 126 BCE / 111 BCE – 109 CE | Waugh; Hirth; Yeh et al. (`wh-409`) |
| Scholar-officials: Classics academicians / examinations ended | 136 BCE / 1905 | Liu; Theobald (`wh-410`) |
| Sima Qian: born / castrated / letter to Ren An / died | c. 145 – 135 BCE / 98 BCE / 91 BCE / c. 86 – 74 BCE | Chavannes; Yang; Utah (`wh-411`) |
| Papermaking: earliest finds / Cai Lun's report | c. 140 – 87 BCE / 105 CE | Drège; Hamburg CSMC; *Hou Han shu* via Carter (`wh-412`) |
| Fall of the Han: Yellow Turbans / Dong Zhuo takes the capital / abdication | 184 / 189 / 220 CE | de Crespigny; Theobald (`wh-413`) |
| Three Kingdoms: span / Wu's emperor / Shu fell / Wei ended | 220 – 280 CE / 229 / 263 / 266 CE (Theobald ends Wei in 265) | de Crespigny; Theobald (`wh-414`) |
| Buddhism in China: first evidence / An Shigao / Yungang / persecution | by 65 CE / c. 148 – 170 CE / 460 – 524 CE / 845 CE | Theobald; Zacchetti (`wh-415`) |
| Kush: Napatan / Meroitic / 25th Dynasty | c. 1070 – 300 BCE (one study; a late 9th century BCE start also given) / c. 300 BCE – 350 CE / c. 742 – 656 BCE | Peeters et al.; Adams; EBSCO (`wh-416`) |
| Meroë: settled / capital / Roman war | c. 800 – 600 BCE / c. 300 BCE – 300 CE / c. 25 BCE | Humphris and Scheibner; Carey et al. (`wh-417`) |
| Aksum: common frame / coinage / Ezana converts | c. 150 BCE – 700 CE (Hagos's frame) / c. 270 CE / c. 340 CE | Hagos; Phillipson (`wh-418`) |
| Nok culture: began / figures made / first found | c. 1500 BCE / c. 900 – 400 BCE / 1928 | Breunig; Dunne et al.; Atwood (`wh-419`) |
| Bantu expansion: began / forest crossing (one model) / Great Lakes | c. 6,000 – 4,000 / c. 4,420 / c. 2,600 years ago | Fortes-Lima et al.; Koile et al.; Semo et al. (`wh-420`) |
| Garamantes: phase frame / Balbus's campaign / Maternus | c. 1000 BCE – 700 CE (Fezzan Project) / c. 20 BCE / c. 88 – 92 CE | Mattingly et al. (`wh-421`) |
| Trade with Punt (first mention in Sahure's annal to Ramesses III) | c. 2500 – 1170 BCE | Dominy et al.; Breasted (`wh-422`; `wh-423` is `undatable`) |
| Olmec era / San Lorenzo peak / La Venta | c. 1500 – 400 BCE (one source 1500 – 600) / c. 1400 – 1000 BCE / c. 900 – 400 BCE | Stark and Stoner; Blomster and Salazar; Šprajc et al. (`wh-424`; `wh-425` is `undatable`) |
| Ballgame: earliest court (Paso de la Amada) / rubber balls (El Manatí) / highland court (Etlatongo) | c. 1650 / c. 1600 / c. 1374 BCE (midpoint) | Blomster and Salazar (`wh-426`) |
| Monte Albán: founded / Monte Albán I / Monte Albán II / fragmentation | c. 500 BCE / 500 – 100 BCE / 100 BCE – 200 CE / c. 700 – 800 CE | Nicholas and Feinman; Pacheco-Forés et al.; Hoyer et al. (`wh-427`) |
| Maya: first cities / Classic / Terminal Classic / Postclassic | c. 700 BCE – 250 CE / 250 – 1000 CE / 800 – 1000 CE / 1000 – 1500 CE (Chase gives other limits) | McCool et al.; Sánchez-Morales et al. (`wh-428`) |
| Maya script: first attested (San Bartolo) / Classic texts | c. 300 – 200 BCE / c. 250 – 900 CE | Stuart et al.; Jobbová et al. (`wh-429`) |
| Long Count: earliest firm date (Chiapa de Corzo; Tres Zapotes 32 BCE) / day zero (GMT, 584,283 or 584,285) | 36 BCE / 11 – 13 August 3114 BCE | Kennett et al.; Kettunen and Helmke; Stuart et al. (`wh-430`) |
| Teotihuacan: rapid growth / apogee / collapse | c. 100 CE / c. 250 – 550 CE / c. 550 CE | Froese et al.; Sugiyama et al.; Manzanilla (`wh-431`) |
| Chavín de Huántar: site in use / Janabarriu / temple ends / Gallery 3 | c. 950 – 400 BCE / c. 700 – 400 BCE / c. 500 BCE / c. 800 – 350 BCE | Burger; Rick et al. (`wh-432`) |
| Nasca period / two Palpa sites / Paracas lines | c. 100 BCE – 650 CE / c. 400 – 650 CE / from c. 750 BCE | Sakai et al.; Rink and Bartoll; García Soto (`wh-433`) |
| Moche: usual / radiocarbon / later estimate | c. 100 – 800 CE / c. 200 – 900 CE / c. 300 – 950 CE | Dumbarton Oaks; Koons and Alex; Quilter et al. (`wh-434`) |
| Norte Chico (Late Archaic) / earliest Caral | c. 3000 – 1800 BCE / 2627 BCE | Haas, Creamer and Ruiz; Mesoweb (`wh-435`) |
| Byzantine Empire: often dated / capital lost | 330 – 1453 CE (395 and the 280s also given) / 1204 – 1261 CE | Kaldellis via Neville; Pohlsander; Woods (`wh-436`) |
| Constantinople: inaugurated / land walls / Latin rule / Ottoman assault | 11 May 330 CE / 413 CE / 1204 – 1261 CE / 29 May 1453 CE | Berger; Van Millingen (`wh-437`) |
| Justinian I: born / reigned / Vandal War / Gothic War | c. 482 CE / 527 – 565 CE / 533 – 534 CE / 535 – 552 CE | Evans (`wh-438`) |
| Corpus Juris Civilis: compiled / Code (revised) / Digest | 528 – 534 CE / 529 CE (534) / 533 CE | Wallinga; Weber (`wh-439`) |
| Hagia Sophia: built / dome fell / reconsecrated / mosque | 532 – 537 CE / 558 CE / 562 CE / 1453 CE | Diker et al.; Garnczarska (`wh-440`) |
| Theodora: empress / died (marriage 521 or 522 on one biography) | 527 – 548 CE / 548 CE | Holum; Evans (`wh-441`) |
| Plague of Justinian: first outbreak / Constantinople / First Pandemic / DNA confirmed | 541 – 544 CE / 542 CE / 541 – 750 CE / 2013 | Keller et al.; Harbeck et al. (`wh-442`) |
| Greek fire: first use (Theophanes's Kallinikos entry; long siege doubted) / second siege / gone by | c. 672 – 678 CE / 717 – 718 CE / 1204 CE | Theophanes; Haldon; Theotokis (`wh-443`) |
| Byzantine Iconoclasm: first phase / Hieria / second phase / images restored | c. 730 – 787 CE (726 doubted) / 754 CE / 815 – 843 CE / 843 CE | Barber; McMichael (`wh-444`) |
| East–West Schism: Photian rift / legates' bull / failed unions / bans lifted | 858 – 880 CE / 16 July 1054 CE / 1274 and 1439 CE / 7 December 1965 | Carcione; Whalen; Holy See (`wh-445`; `wh-446` is `undatable`) |
| Cyril and Methodius: mission begins / Cyril died / Methodius died | 863 CE / 14 February 869 CE / 885 CE | Jakobson; Dostal (`wh-447`) |
| Kievan Rus': Kyiv the seat / Yaroslav ruled / Mongol sack | c. 880 CE / 1036 – 1054 CE / 1240 CE | Zhdan; Hillerdal (`wh-448`) |
| First Bulgarian Empire: founded / Boris baptised / Symeon reigned / ends | 681 CE / 864 – 865 CE / 893 – 927 CE / 1018 CE | Antonov; Bury; Marinow (`wh-449`) |
| Battle of Manzikert | 26 August 1071 CE | Shliakhtin; Lau (`wh-450`) |
| Sack of Constantinople: first entered / stormed / Latin Empire | July 1203 / 12 April 1204 / 1204 – 1261 CE | Villehardouin; Bell; Barabanov (`wh-451`) |
| Fall of Constantinople: siege began / city taken | early April (4 or 5) 1453 / 29 May 1453 CE | Sphrantzes; Barbaro (`wh-452`) |
| Christianisation of Armenia: conversion (tradition 301; Toumanoff and Young 314) / alphabet | c. 301 – 314 CE / c. 405 CE | Young; Thomson; Toumanoff (`wh-453`) |
| Kingdom of Georgia: united / at its height / divided / eastern kingdom annexed | 1008 / 1089 – 1213 / 1490 / 1801 CE | Toumanoff; Rayfield; Morkva (`wh-454`) |
| Ethiopian Orthodox Church: Ezana reigns / own patriarch | c. 330 – 360 CE / 1959 | Butts; Ghali (`wh-455`) |
| Pre-Islamic Arabia: Saba attested / Himyar leads / Abraha's raid | c. 800 BCE – 275 CE / c. 350 – 570 CE / 552 CE | Schiettecatte; Robin; Hatke (`wh-456`) |
| Muhammad: lived (birth by later reckoning) / revelation begins / Hijra | c. 570 – 632 CE / from c. 610 CE / 622 CE | Watt; Lindstedt; Donner (`wh-457`) |
| Hijra: emigration / era begins (calendar introduced AH 16, 17 or 18) | 622 CE / 16 July 622 CE | Watt; Donner; al-Tabari (`wh-458`) |
| Quran: revealed (tradition) / standard text (Uthman) | c. 610 – 632 CE / c. 650 CE | Wheeler; van Putten; Albayrak (`wh-459`) |
| Islam: revelations / early expansion | c. 610 – 632 CE / 632 – 751 CE | Wheeler; Calder; Pew 2009 (`wh-460`) |
| Rashidun Caliphate: span / Uthman | 632 – 661 CE / 644 – 656 CE | Dale; Hawting (`wh-462`) |
| Early Muslim conquests: counted / Yarmuk / Egypt | 632 – 711 CE / 636 CE / 639 – 642 CE (December 639 entry, April 641 Babylon, September 642 Alexandria on one reconstruction) | Cory; Ehrlich; Butler (`wh-463`) |
| Sunni–Shia split: succession / Ali caliph / Karbala | 632 CE / 656 – 661 CE / 680 CE | Amir-Moezzi; Cory; Ayoub (`wh-464`) |
| Umayyad Caliphate / Abd al-Malik / coin reform | 661 – 750 CE (one book counts from 644) / 685 – 705 CE / 696 – 697 CE | Wellhausen; Marsham; Erkoçoğlu (`wh-465`) |
| Battle of Tours | October 732 CE (10 or 25 October; one source 733) | Watson; Brill; Hailon (`wh-467`) |
| al-Andalus: conquest / emirate / caliphate / Granada falls | 711 / 756 / 929 CE / 2 January 1492 | Al-Tamimi (Chronicle of 754); Calvo Capilla; Drayson (`wh-468`) |
| Abbasid Caliphate / Samarra the seat | 750 – 1258 CE / 836 – 892 CE | Marín-Guzmán; Muir; Brown (`wh-469`) |
| Baghdad: founded / Mongol sack / Ottoman capture | 762 CE / 1258 CE / 1534 CE | Le Strange; Petersen; Neggaz (`wh-470`; `wh-461` and `wh-466` are `undatable`) |
| Islamic Golden Age: usual / narrow (a 1921 book) | c. 750 – 1258 CE / 750 – 850 CE (a modern label) | Qidwai; Browne (`wh-472`; `wh-471` is `undatable`) |
| al-Khwarizmi lived | c. 780 – 850 CE | MacTutor; Karpinski (`wh-473`) |
| Avicenna: born / Canon finished / died | c. 970 – 980 / c. 1025 / 1037 CE | Gutas; Chamsi-Pasha (`wh-474`) |
| Islamic medicine: began / first hospital in Cairo / Mansuri finished | from c. 750 / 872 / 1284 CE | Savage-Smith; Browne (`wh-475`; `wh-476` is `undatable`) |
| Great Mosque of Córdoba: begun / mihrab wing / cathedral built | 785 or 786 CE / 961 – 971 CE / from 1523 CE | González-Gutiérrez; Utrero Agudo; Arnold (`wh-477`) |
| Fatimid Caliphate: founded / Egypt conquered / moved to Cairo / ended | 909 (proclaimed 910) / 969 / 973 / 1171 CE | Jiwa; Ashmolean (`wh-478`) |
| al-Azhar: built / school / revived / reformed | 970 – 972 CE (972 on the Ashmolean's reckoning) / 988 CE / 1266 CE / 1961 | Qantara; Eccel and Reid (`wh-479`; `wh-480` is `undatable`) |
| Ibn Battuta: born / travelled / Rihla finished / died | 1304 / 1325 – 1354 / December 1355 / 1368 or 1369 CE | Gibb; Dunn (`wh-481`) |
| Ibn Khaldun: born / Muqaddima draft / met Timur / died | 1332 / 1377 / 1401 / 1406 CE | Irwin; Alatas; Mahdi (`wh-482`) |
| Seljuk Empire: Dandanqan / Baghdad / Malik-Shah / Sanjar died | 1040 / December 1055 / 1072 – 1092 / 1157 CE | Brett; Humphreys; Bosworth (`wh-483`) |
| Saladin: lived / vizier / Hattin / Jerusalem | 1137 or 1138 – 1193 / 1169 / 4 July 1187 / 2 October 1187 CE | Humphreys; Brett; Ibn Shaddad (`wh-484`) |
| Mamluk Sultanate / Bahri / Burji | 1250 – 1517 / 1250 – 1382 / 1382 – 1517 CE | Lane-Poole; Troadec; Pradines (`wh-485`) |
| Middle Ages: convention / Cellarius | c. 500 – 1500 CE / 1688 | Hallam; Shank and Lindberg (`wh-486`) |
| Migration Period: usual span / Danube crossed / Vandals landed in Africa | c. 375 – 568 / 376 / 429 CE | Pohl; Teeter; Kasperski (`wh-487`) |
| Ostrogoths and Visigoths: Danube / Rome sacked / Italy / Visigothic Spain | 376 / 410 / 489 – 526 / 507 – 711 CE | Ammianus; Jordanes; Cecconi (`wh-488`) |
| Clovis I: lived / reigned / Syagrius beaten / Vouillé | c. 466 – 511 / 481 – 511 / 486 / 507 CE (baptism 496 or 508, disputed) | Gregory; Wood; Hen (`wh-489`) |
| Anglo-Saxon England: traditional span / mission to Kent / Bede's last year / York taken | c. 449 – 1066 / 597 / 731 / 927 CE | Naismith; Bede; Gretzinger (`wh-490`) |
| Sutton Hoo: latest coins / Rædwald died / excavated | c. 610 – 635 CE / 624 or 625 CE / 1939 | Grierson; Sutton Hoo Society (`wh-491`) |
| Christian monasticism: Antony in the desert / Pachomius / Life of Antony | c. 285 – 356 / c. 292 – 346 / 356 – 362 CE | Robertson; Gould (`wh-492`) |
| Rule of Saint Benedict: written / made standard | c. 530 CE / 816 – 819 CE | Hagan; Gregory (`wh-493`; `wh-494` is `undatable`) |
| Charlemagne: reigned / Saxon wars / took Lombardy / crowned emperor | 768 – 814 / 772 – 804 / 774 / 800 CE (born 742 or 748) | Einhard; Royal Frankish Annals (`wh-495`) |
| Carolingian Renaissance: schools decree / Alcuin at Tours / Mars letters | 789 / 796 – 804 / 798 CE | Admonitio generalis; Alcuin (`wh-496`) |
| Holy Roman Empire: Otto crowned / Charles crowned / dissolved | 2 February 962 / 800 / 6 August 1806 CE | Sulovsky; Lück (`wh-497`) |
| Vikings: Viking Age / also dated | 793 – 1066 CE / c. 750 – 1050 CE | Ashby; Heen-Pettersen (`wh-498`) |
| Lindisfarne raid | 793 CE (Chronicle's 8 January is a miscount; 8 June by Simeon of Durham and modern accounts) | Anglo-Saxon Chronicle; Simeon; English Heritage (`wh-499`) |
| Alfred the Great: born (Asser) / reigned / Edington | 849 / 871 – 899 / 878 CE | Asser; Anglo-Saxon Chronicle (`wh-500`) |
| Vinland: wood felled / sagas date it / bishop's voyage | 1021 / c. 1000 / 1121 CE | Kuitems et al.; Wallace (`wh-501`; `wh-502` and `wh-503` are `undatable`) |
| Norman Conquest: landed / Hastings / crowned | 28 September / 14 October / 25 December 1066 CE | Coad; Bayeux Museum (`wh-504`) |
| Domesday Book: ordered / surveyed | Christmas 1085 / 1086 CE | The National Archives (`wh-505`) |
| Crusades: usual span | 1095 – 1291 CE | Encyclopedia of Religion (`wh-506`) |
| First Crusade: Clermont / Antioch / Jerusalem | 18 – 28 November 1095 / 3 June 1098 / 15 July 1099 CE | Fordham Sourcebook; Riley-Smith (`wh-507`) |
| Knights Templar: founded / rule / arrests / suppressed | 1118 – 1119 / January 1129 / 13 October 1307 / 22 March 1312 CE | William of Tyre; Barber (`wh-508`; `wh-509` is `undatable`) |
| Gothic architecture: St-Denis choir / Canterbury fire | 11 June 1144 / 1174 CE | Suger; Canterbury Cathedral (`wh-510`) |
| medieval university: Bologna by custom / Paris statutes / Gregory IX | 1088 / 1215 / 13 April 1231 CE | University of Bologna; Courçon; Gregory IX (`wh-511`) |
| Thomas Aquinas: born / Summa / died / canonised | c. 1224 – 1225 / c. 1265 – 1273 / 7 March 1274 / 18 July 1323 CE | Torrell (Marquette); Pasnau (`wh-512`) |
| Magna Carta: sealed / annulled / confirmed | 15 June 1215 / 24 August 1215 / 1297 CE | Phillips; British Library (`wh-513`; `wh-514` is `undatable`) |
| Hanseatic League: first diet / Stralsund / last diet | c. 1356 – 1358 / 1370 / 1669 CE | Landesmuseum MV; Ewert and Selzer (`wh-515`) |
| Black Death: pandemic / Chüy tombstones | 1346 – 1353 / 1338 – 1339 CE | Spyrou et al. (`wh-516`) |
| peasant revolt: ordinance / Jacquerie / English rising | 1349 / 1358 / 1381 CE | McGlynn; London Museum (`wh-517`) |
| Hundred Years' War: usual dating / Brétigny / Troyes | 1337 – 1453 / 1360 / 1420 CE | Runyan; IHR (`wh-518`) |
| Joan of Arc: lived / Orléans / captured / annulled | c. 1412 – 30 May 1431 / 8 May 1429 / 23 May 1430 / 7 July 1456 CE (the 14 July 1430 summons was not the handover) | Murray; Barrett (`wh-519`) |
| Reconquista: conquest to Granada / Las Navas / dictionary sense | 711 – 2 January 1492 / 16 July 1212 / 1936 CE | Drayson; García Sanjuán (`wh-520`) |
| Sui dynasty: ruled / reunified / Daxing / Goguryeo wars | 581 – 618 / 589 / 582 – 583 / 612 – 614 CE | Theobald; Xiong (`wh-521`) |
| Grand Canal: Sui works / oldest section / Yuan works / World Heritage | 587 – 610 CE / 486 BCE / 1276 – 1291 CE / 2014 | Theobald; Dong (`wh-522`) |
| Tang dynasty: ruled / Zhou interregnum / revolt / dated print | 618 – 907 / 690 – 705 / 755 / 868 CE | Theobald; Linda Hall Library (`wh-523`) |
| Chang'an: Daxing / capital / rebels / Tibetan sack | 582 / 583 – 904 / 756 / 763 CE | Hsueh; Theobald; Kempf et al. (`wh-524`) |
| imperial examination: often dated / Ming form / abolished | c. 605 CE / 1384 CE / 2 September 1905 | Bai and Jia; Theobald; Nylan (`wh-525`) |
| woodblock printing: Japanese dharani / dated book / classics cut | 764 – 770 / 868 / 932 – 953 CE | Kornicki; Wolfson-Ford (`wh-526`) |
| An Lushan Rebellion: fought / began / Chang'an lost / retaken | 755 – 763 / December 755 / 756 / 757 CE | Larson; Theobald; Deng (`wh-527`) |
| Song dynasty: ruled / Northern Song / Southern Song | 960 – 1279 / 960 – 1127 (or 1126) / 1127 – 1279 CE | Lorge; Theobald (`wh-528`) |
| paper money: private notes / state office / huizi / Yuan notes | c. 990 – 1023 / 1023 / 1161 / 1260 CE | von Glahn; Theobald (`wh-529`) |
| gunpowder: earliest recipes / fire lance / Kaifeng bombs | 1044 / 1132 / 1232 CE | Lorge; Andrade (`wh-530`) |
| compass: needle / sea use written / Europe | c. 1087 / c. 1119 / c. 1187 | Di Domenico et al.; Price (`wh-531`) |
| movable type: reported made / wooden type | 1041 – 1048 / c. 1297 | Di Domenico et al.; Asia for Educators (`wh-532`) |
| Neo-Confucianism: masters lived / ban / exam text | 1011 – 1200 / 1196 / 1313 | Berthrong; Gordley (`wh-533`) |
| porcelain: Tang white ware / Meissen / Jesuit letters | 618 – 907 CE / 1710 / 1712 and 1722 | Krahl; Finlay (`wh-534`) |
| Yuan dynasty: dynasty / all China / Dadu begun | 1271 – 1368 / 1279 – 1368 / 1267 | Theobald (`wh-535`) |
| Marco Polo: born / in Asia / book dictated / will | c. 1254 / c. 1271 – 1295 / 1298 / 1324 | Yule; Andreose (`wh-536`) |
| Mongol invasions of Japan: letter dated / reached / fleets | 1266 / 1268 / 1274 and 1281 | Chase; Delgado; Ikeda (`wh-537`) |
| Muromachi period: period / courts reunited / Ōnin War | 1338 – 1573 / 1392 / 1467 – 1477 | Conlan; Segal (`wh-538`; `wh-539` is `undatable`) |
| Goryeo: kingdom / Gaegyeong / peninsula united | 918 – 1392 / 919 / 936 CE | Heo; Shin; Song (`wh-540`) |
| metal movable type: earliest record / oldest surviving / Joseon foundry / Gabin fount | 1234 / 1377 / 1403 / 1434 | Lee Jae-jeong; BnF; Chon (`wh-541`) |
| Heian period: capital moved / period / Genpei War | 794 / 794 – 1185 / 1180 – 1185 CE | Princeton University Art Museum; Asia for Educators (`wh-542`) |
| Genji Monogatari: diary covers / copy received | 1008 / 1020 CE | Tyler; McCormick (`wh-543`) |
| samurai: levies ended / Gempei War / swords banned | 792 / 1180 – 1185 / 1876 CE | Friday; Culeddu; Yamada (`wh-544`) |
| Kamakura shogunate: founded (by whose count) / Jōkyū / Jōei Code / ended | 1180 – 1192 / 1221 / 1232 / 1333 CE | Kamakura Citizen Net; Brinkley (`wh-545`) |
| Harsha: reigned / Kanauj assembly | 606 – 647 / 643 CE | Lee (`wh-546`) |
| Chola dynasty: Rajaraja I / Kadaram raid / Tanjore record | 985 / c. 1025 / 1030 – 1031 CE | Venkayya; Tran and Nguyen (`wh-547`) |
| Delhi Sultanate: sultanate / Iltutmish / Alauddin Khalji / Timur | 1206 – 1526 / 1211 – 1236 / 1296 – 1316 / 1398 – 1399 CE | Hambly (`wh-548`) |
| Vijayanagara Empire: founded (traditional) / Talikota | c. 1336 / 1565 CE | Sewell; Piotter (`wh-549`; `wh-550` is `undatable`) |
| Islam in India: Sind / second Tarain | 711 – 713 / 1192 CE | Lapidus; Datta (`wh-551`) |
| Indo-Islamic architecture: mosque dated / Alai Darwaza | 1191 – 1196 / 1310 – 1311 CE (sources differ) | Khan and Bila (`wh-552`; `wh-553` is `undatable`) |
| Srivijaya: earliest stones / Chola raid | 682 – 686 / 1025 CE | Alnoza; Kulke (`wh-554`) |
| Majapahit: founded / once read as end | c. 1293 / 1478 CE | Hall; Tjahjono (`wh-555`) |
| Khmer Empire: reported start / Jayavarman VII / conventional end | 802 / 1181 – 1218 / 1431 CE | Carter (`wh-556`) |
| Angkor Wat: built / pilgrim texts | c. 1113 – 1150 / 1541 – 1747 CE | Univ. of Chicago DSAL; Carter (`wh-557`) |
| Pagan Kingdom: usual dates / Thaton / king flees | 1044 – 1287 / 1057 / 1284 CE | Mezzino; Quaritch Wales (`wh-558`) |
| Đại Việt: Đại Cồ Việt / named (annals) / Ming rule | 968 / 1054 / 1407 – 1428 CE (Bạch Đằng 938, kingship 939) | Ku; Đinh (`wh-559`; `wh-560` is `undatable`) |
| Borobudur: built / cleared / van Erp / UNESCO project | c. 780 – 850 / 1814 / 1907 – 1911 / 1973 – 1983 CE | Iwamoto; Krom (`wh-561`) |
| Anuradhapura: village / Chola conquest | c. 800 – 700 BCE / 993 – 1017 CE | Coningham et al.; Sastri; Geiger (`wh-562`; `wh-563` and `wh-564` are `undatable`) |
| Malacca Sultanate: first recorded / ruler made king / Portuguese took | 1403 / 1405 / 1511 CE | Wade (Ming Shilu); Pires (`wh-565`) |
| Ghana Empire: Awdaghust / al-Bakri wrote / conquest claim | 1054 / c. 1067 / 1076 (disputed) CE | Masonen and Fisher; Conrad and Fisher (`wh-566`) |
| Sijilmasa: founded (tradition) / Ibn Battuta leaves / revolt / Leo sees ruins | c. 757 – 758 / 14 February 1352 / c. 1393 / c. 1510 CE | Villar; Gibb and Beckingham (`wh-567`) |
| Mali Empire: Kirina (one reckoning) / Ibn Battuta at Mali / Timbuktu lost / Gambia held | c. 1235 / 1352 – 1353 / c. 1433 / 1594 CE | Niane; Gibb and Beckingham; Ly-Tall (`wh-568`; `wh-569` is `""`) |
| Mansa Musa: reigned / pilgrimage | c. 1312 – 1337 / 1324 – 1325 CE | British Library; Northwestern University (`wh-570`) |
| Timbuktu: said founded (al-Sa'di) / Musa's visit / Songhai takes / Moroccans take | c. 1100 / c. 1325 / 1468 / 1591 CE | al-Sa'di; Cissoko (`wh-571`) |
| Songhai Empire: Sonni Ali / Askia Muhammad / Tondibi | 1464 – 1492 / 1493 – 1528 / March 1591 CE (12 April in the *Tarikh es-Soudan*) | Cissoko; Kaba (`wh-572`) |
| Kanem–Bornu: first Muslim mai / letter to Cairo / court to Bornu | c. 1086 – 1097 / 1391 – 1392 / c. 1400 CE (Barth, Palmer; al-Qalqashandi) | Barth; Palmer; Fisher (`wh-573`) |
| Hausa Kingdoms: Yaji / Rumfa / Askia's raid | c. 1349 – 1385 / c. 1463 – 1499 / c. 1513 CE (Palmer's reckoning; Brown's note) | Palmer (`wh-574`) |
| Kingdom of Benin: independent / Portuguese reach / Nyendael | c. 1200 – 1897 / c. 1486 / 1702 CE | Bondarenko and Roese; Roth (`wh-575`) |
| Benin Bronzes: plaques made / looted / returns began | c. 1500 – 1700 / 1897 / 2022 CE | Cleveland Museum of Art; Staatliche Museen zu Berlin (`wh-576`) |
| Swahili coast: culture begins / stone towns / autonomy wanes | c. 600 – 700 / c. 1000 – 1100 / c. 1500 – 1600 CE | Brielle et al. (`wh-577`) |
| Kilwa Kisiwani: first settled / first coins / Ibn Battuta / Portuguese fort | c. 800 – 900 / c. 980 – 1000 / 1331 / 1505 – 1507 CE | Horton et al.; Barbosa (`wh-578`) |
| Great Zimbabwe: occupied / walls begun / older peak view | c. 1000 – 1800 / c. 1200 / 1300 – 1450 CE | Chirikure (`wh-579`) |
| Kingdom of Kongo: founding story / Portuguese come / king baptised / Afonso | c. 1350 / 1482 – 1483 / 1491 / 1506 – 1543 CE | Thornton (`wh-580`) |
| Zagwe dynasty: ruled (Piovanelli) | c. 1137 – 1270 CE (Derat: from the 11th century; Muehlbauer: 12th) | Piovanelli; Derat; Muehlbauer (`wh-581`) |
| Lalibela: occupied from / UNESCO listing | c. 900 – 1000 CE / 1978 | Bosc-Tiessé et al.; UNESCO (`wh-582`; `wh-583`, `wh-584` are `undatable`) |
| Makuria: royal tombs / baqt / throne hall a mosque | c. 450 – 550 / 651 – 652 / 29 May 1317 CE | Then-Obłuska; Khan (`wh-585`; `wh-586` and `wh-587` are `undatable`) |
| Yuezhi: first defeat / king killed / Zhang Qian left / returned | c. 176 / c. 165 / c. 138 / 126 BCE | Hirth (`wh-588`; `wh-409` also gives 126) |
| Huns: reached Europe / Nedao | c. 370 – 376 / 454 CE | Gnecchi-Ruscone et al.; Maenchen-Helfen (`wh-589`) |
| Attila: joint rule began / Bleda killed / Gaul / died | c. 434 – 439 / 445 / 451 / 453 CE | Maenchen-Helfen (`wh-590`) |
| Göktürks: founded / divided / second khaganate / Orkhon stones | 552 / 583 / c. 682 – 745 / 732 and 735 CE | Erkoç; Chen; Ross (`wh-591`) |
| Khazars: khaganate / Sarkel / letters printed | c. 660 – 965 / c. 833 / 1577 CE | Howard-Johnston; Bury; Dunlop (`wh-592`) |
| Genghis Khan: born (tradition) / proclaimed khan / died | c. 1162 / 1206 / 1227 CE | Asia for Educators; Cleaves (`wh-593`) |
| Mongol Empire: founded / civil war | 1206 / 1260 – 1264 CE | Rashid al-Din; Cambridge History of the Mongol Empire (`wh-594`) |
| Mongol conquests: frame / Jin war / Kalka / Rus' | 1206 – 1279 / 1211 – 1234 / 31 May 1223 / 1237 – 1240 CE | Büntgen and Di Cosmo; Theobald (`wh-595`; `wh-596` is `undatable`) |
| Siege of Baghdad: siege began / caliph killed / Cairo caliphs | January 1258 / 20 February 1258 / from 1261 CE | Le Strange; Rashid al-Din via Yule (`wh-597`) |
| Golden Horde: state / Özbeg Khan / breakup | c. 1260 – 1502 / 1313 – 1341 / 1359 CE (`ru-100` has 1242) | Favereau and Pochekaev; Hautala; Schamiloglu (`wh-598`) |
| Timur: born / ruled / Clavijo's visit | 1336 / 1370 – 1405 / 1404 CE | Clavijo; Milwright and Baboula (`wh-599`) |
| Chinggisids: enthroned / Time of Troubles / Crimean Khanate / Kazakh charter | 1206 / 1359 – 1380 / 1441 – 1783 / 1822 CE | Munkh-Erdene; Landa; Başer (`wh-600`) |
| Tikal: Classic era (one team's) / recorded arrival / last monument | 250 – 900 / 378 / 869 CE | Lentz et al. 2021; Houston et al.; Lentz et al. 2014 (`wh-601`) |
| Classic Maya collapse: decline begins / fastest decline / Terminal Classic / stelae end | c. 750 / 750 – 850 / 800 – 1000 / by 998 CE | McCool et al.; Braun et al.; James et al. (`wh-602`) |
| Chichen Itza: prominent / end (estimate) | c. 600 – 1000 / c. 1025 – 1050 CE | Barquera et al. 2024; James et al. 2025 (`wh-603`) |
| Toltecs (Tula): Tollan phase | c. 900 – 1150 CE | Healan, Cobean and Bowsher 2021 (`wh-604`) |
| Aztec Empire: imperial years (formation 1428 in prose) | c. 1430 – 1521 CE | Nielsen; De Rojas; Morehart et al. (`wh-605`) |
| Tenochtitlan: founded (tradition) | c. 1325 CE | De Rojas (`wh-606`; `wh-607`, `wh-608`, `wh-609` are `undatable`) |
| Wari: Middle Horizon | c. 600 – 1000 CE | Conlee et al. 2021 (`wh-610`) |
| Tiwanaku: modelled start / peak influence / residents left | c. 180 / c. 500 – 1000 / c. 1010 CE | Marsh et al. 2023; Popovic et al. 2021 (`wh-611`) |
| Inca Empire: traditional span / Cajamarca / Vilcabamba | 1438 – 1533 / 1532 / 1572 CE | Rowe 1945 via Ziółkowski et al.; Covey (`wh-612`; `wh-613`, `wh-615`, `wh-616` are `undatable`) |
| Machu Picchu: occupied | c. 1420 – 1532 CE | Burger et al. 2021 (`wh-614`) |
| Mississippian culture: flourished (one climate study's) | c. 1000 – 1450 CE (`us-017` has 1000 – 1600) | Bird et al.; Pompeani et al. (`wh-617`) |
| Cahokia: emerged / abandoned | c. 1050 / c. 1350 – 1400 CE | Kessler et al.; Pompeani et al. (`wh-618`) |
| Ancestral Puebloans: Four Corners / Mesa Verde empty | 500 – 1300 / by c. 1280 CE | National Park Service; Kemp (`wh-619`) |
| Chaco Canyon: great houses / regional centre / crypt burials | c. 850 – 1150 / by 1050 / 800 – 1130 CE | National Park Service; Pinotti; Kennett et al. 2017 (`wh-620`) |
| Italian city-states: communes began | c. 1100 CE | Wickham (`wh-622`; `wh-621`, `wh-625` are `undatable`) |
| Florence: florin / priors / republic ended (1530 is the siege) | from 1252 / from 1282 / 1532 CE | Einaudi; Machiavelli; Byatt (`wh-623`) |
| House of Medici: rule / bank / Pazzi plot / dukes | 1434 – 1737 / from 1397 / 26 April 1478 / from 1532 CE | Historisches Lexikon der Schweiz; EBSCO; Byatt (`wh-624`) |
| Petrarch: lived / crowned / Ventoux letter | 1304 – 1374 / 8 April 1341 / dated 26 April, read as 1336 CE | Università di Bologna; Nicholl; Mann (`wh-626`) |
| Leonardo: lived / Mona Lisa | 15 April 1452 – 2 May 1519 / 1503 – 1519 CE | Louvre (`wh-627`) |
| Michelangelo: lived (1474 in his father's notebook) / ceiling / Last Judgement | 6 March 1475 – 18 February 1564 / 1508 – 1512 / 1536 – 1541 CE | Condivi; Symonds; Vatican (`wh-628`) |
| Linear perspective: reported start / Alberti's treatise | c. 1413 / 1435 – 1436 CE | Hertzmann citing Kemp; Sinisgalli; Horton (`wh-629`) |
| Printing press: press at Mainz / 42-line Bible / Subiaco book | c. 1450 / c. 1454 – 1455 / 1465 CE | Mainz city site; Library of Congress (`wh-630`) |
| Gutenberg: born (Mainz / another summary) / Strasbourg suit / 42-line Bible / died | c. 1397 – 1406 (1394 – 1399) / 1439 / c. 1455 / early February 1468 CE | Mainz city site; Gould (`wh-631`; `wh-632` is `undatable`) |
| Erasmus: born (disputed) / ordained / Greek New Testament / died | c. 1466 – 1469 / 1492 / 1516 / 11 or 12 July 1536 CE | Stanford Encyclopedia; Historisches Lexikon der Schweiz (`wh-633`) |
| Machiavelli: born / Chancery / *The Prince* drafted (printed 1532) / died | 3 May 1469 / 1498 – 1512 / 1513 / 21 June 1527 CE | Black; Stanford Encyclopedia; the letter of 10 December 1513 (`wh-634`) |
| Reformation: usual start / Zwingli at Zurich / Augsburg peace / usual end | 1517 / 1519 / 25 September 1555 / 1648 CE | Schaff (`wh-635`) |
| Luther: born / entered the Erfurt friary / Worms / died | 10 November 1483 / 1505 / 1521 / 18 February 1546 CE | Melanchthon via the Stanford Encyclopedia (`wh-636`) |
| Ninety-five Theses: letter to Albrecht dated | 31 October 1517 CE (the door story is Melanchthon's of 1546) | Jacobs; Leppin and Wengert (`wh-637`) |
| Protestantism: name arose (Protestation at Speyer) | 19 – 25 April 1529 CE | Pollard; Helmer (`wh-638`) |
| Calvin: born / *Institutes* / returned to Geneva / died | 10 July 1509 / 1536 / 1541 / 27 May 1564 CE | Walker; Calvin's own preface (`wh-639`) |
| English Reformation: Appeals Act / Supremacy Act / first Prayer Book / settlement | 1533 / 1534 / 1549 / 1559 CE | Gee and Hardy; Maitland (`wh-640`) |
| Henry VIII: born / reigned / died | 28 June 1491 / 1509 – 1547 / 28 January 1547 CE | royal.uk; British Library (`wh-641`) |
| Jesuits: Montmartre vow / papal approval / suppressed / restored | 15 August 1534 / 27 September 1540 / 1773 / 1814 CE | Jesuits Global; Formula of the Institute (`wh-643`; `wh-642` is `undatable`) |
| Wars of religion: Germany / France / Netherlands (conventions) | 1546 – 1555 / 1562 – 1598 / 1568 – 1648 CE | Benedict; Leiden (`wh-644`) |
| St Bartholomew's Day massacre: Coligny shot / massacre | 22 / 24 August 1572 CE | Thompson; EBSCO (`wh-645`) |
| Thirty Years' War: began / White Mountain / treaties signed | 23 May 1618 / 8 November 1620 / 24 October 1648 CE | GHDI; Wilson (`wh-646`) |
| Peace of Westphalia: signed | 24 October 1648 CE | GHDI; Gardiner (`wh-647`) |
| Witch trials: whole period (one historian's) / Great Hunt | c. 1450 – 1750 / 1560 – 1630 CE | Leeson and Russ (`wh-648`) |
| Scientific Revolution: conventional frame | 1543 – 1687 CE | Harvard Library (`wh-649`) |
| Copernicus: born / died / book printed / on the Index | 19 February 1473 / 24 May 1543 / 1543 / 1616 – 1835 CE | Stanford Encyclopedia (`wh-650`; 1835 rests on that article alone) |
| Galileo: lived / *Sidereus Nuncius* / admonished / condemned | 15 February 1564 – 8 January 1642 / March 1610 / 26 February 1616 / 22 June 1633 CE | Stanford Encyclopedia; Museo Galileo (`wh-651`) |
| Kepler: lived (Julian birth) / *Astronomia nova* / *Harmonice mundi* / Rudolphine Tables | 27 December 1571 – 15 November 1630 / 1609 / 1619 / 1627 CE | MacTutor; Kepler Commission (`wh-652`) |
| Newton: born / Lucasian chair / *Principia* / died (Old Style / New Style) | 25 December 1642 / 4 January 1643; October 1669; 1687; 20 March / 31 March 1727 CE | Smith (Stanford Encyclopedia); the Newton Project; Stukeley's memoir; Westfall (`wh-653`; `wh-654`, `wh-656`, `wh-658` are `undatable`) |
| Royal Society: first meeting / first charter / second charter | 28 November 1660 / 15 July 1662 / 1663 CE | Royal Society; St Andrews Transactions project (`wh-655`) |
| Henry the Navigator: lived / Ceuta / Bojador passed / Lagos captives | 1394 – 1460 / 1415 / 1434 / 1444 CE | Zurara; Polónia; Donovan (`wh-657`) |
| Cape Route: Dias at Mossel Bay / Gama at the Cape / off Calicut | 3 February 1488 / 22 November 1497 (Castanheda and Barros: the 20th) / 20 May 1498 CE | Journal of the first voyage; Arbel (`wh-659`) |
| Vasco da Gama: born / sailed / off Calicut / died | c. 1460 or c. 1469 / 8 July 1497 / 20 May 1498 / 24 December 1524 CE | Ravenstein (`wh-660`) |
| Columbus: born / contract / first landfall / died | 1451 / 17 April 1492 / 12 October 1492 / May 1506 CE | Dizionario biografico degli Italiani; Young (`wh-661`) |
| Treaty of Tordesillas: signed / ratified by Castile / ratified by Portugal | 7 June 1494 / 2 July 1494 / 5 September 1494 CE | the treaty text; Payne (`wh-662`) |
| Magellan expedition: left Seville / left Sanlúcar / Magellan killed / back at Sanlúcar | 10 August 1519 / 20 September 1519 / 27 April 1521 / 6 September 1522 CE | Pigafetta; Carballo (`wh-663`; `wh-664` is `undatable`) |
| Cortés: born / city taken / died | c. 1485 / 13 August 1521 / 2 December 1547 CE | MacNutt (`wh-665`) |
| Fall of Tenochtitlan: siege began (Cortés's count) / city taken | 30 May / 13 August 1521 CE | Cortés's third letter; Sahagún (`wh-666`) |
| Pizarro: capitulation / Atahualpa seized (Spaniards entered on the 15th) / killed (Atahualpa's execution: 26 July 1533 Kolata, 29 August Prescott) | 26 July 1529 / 16 November 1532 / 26 June 1541 CE | Xerez; Prescott; Kolata (`wh-667`) |
| Spanish conquest of the Inca Empire: convention / Manco's rising / Pizarro killed / Vilcabamba fell | 1532 – 1572 / 1536 / 26 June 1541 / June 1572 CE | Bauer et al.; Kolata (`wh-668`) |
| Columbian exchange: began | 1492 CE | Hamilton et al.; Crosby 1972 as reported (`wh-669`) |
| Cocoliztli: first wave / second wave | 1545 – 1548 / 1576 – 1578 CE (one study: 1580) | Acuña-Soto's group as reported; Vågene et al. (`wh-670`) |
| Potosí: silver found / mercury trial / mita begun | 1545 / 1571 / 1572 – 1573 CE (1545 or 1546; 1570 – 1572; 1572 or 1573) | Bakewell; Cieza; Salazar-Soler (`wh-671`; `wh-672` is `undatable`) |
| Encomienda: royal order / Laws of Burgos / New Laws / clause revoked | December 1503 / 27 December 1512 / 1542 / 20 October 1545 CE (Roldán grants: 1497 Bourne, 1499 an encyclopedia) | Bourne (`wh-673`) |
| Spanish Empire: in the Americas / mainland ended | 1492 – 1898 / 1824 CE | one encyclopedia's convention (`wh-674`) |
| Portuguese Empire: counted as / Estado da Índia | 1415 – 1999 / 1505 – 1961 CE | the card's own reckoning (`wh-675`) |
| Dutch East India Company: chartered / directors out / charter revoked | 20 March 1602 / 1 March 1796 / 1 January 1800 CE | Dutch National Archives; Gaastra (`wh-676`) |
| East India Company: chartered (Old Style) / first voyage / Crown took over / dissolved | 31 December 1600 / 1601 / 1858 / 1874 CE | Smith; a 19th-century history of India (`wh-677`) |
| Manila galleon: return route / Manila founded / Cortes decree / last to Manila | 1565 / 1571 / 14 September 1813 / 1815 CE | Library of Congress (`wh-678`) |
| Jamestown: chartered / landed / first assembly / first Africans | 10 April 1606 / 13 – 14 May 1607 / 30 July 1619 / August 1619 CE | Jamestown Rediscovery Foundation; Percy (`wh-679`) |
| New England: named / colonised | 1616 / from 1620 CE | Smith 1616 (`wh-680`) |
| New France: Quebec begun / crown took over / Montreal fell / ceded | 3 July 1608 / 1663 / 8 September 1760 / 10 February 1763 CE (Acadia 1713) | Dictionary of Canadian Biography; Vachon (`wh-681`) |
| Russian conquest of Siberia: Kuchum beaten / Tobolsk / Pacific reached / Nerchinsk | 1582 / 1587 / 1639 / 1689 CE (Yermak's march 1581 or 1582) | Perrie; Richards; Trekhsviatskyi (`wh-682`) |
| James Cook: lived / Endeavour sails / transit observed | 27 October 1728 – 14 February 1779 / 26 August 1768 / 3 June 1769 CE | Royal Museums Greenwich (`wh-683`; `wh-684` is `undatable`) |
| Mercator projection: map published / Wright's tables | 1569 / 1599 CE | Snyder (USGS) (`wh-685`; `wh-686` is `undatable`) |
| Ottoman Empire: reckoned from (tradition) / sultanate ended | 1299 / 1 November 1922 CE | İnalcık (`wh-687`) |
| Mehmed II: lived / reigns / took the city | 30 March 1432 – 3 May 1481 / 1444 – 1446 and 1451 – 1481 / 29 May 1453 CE | İnalcık (`wh-688`) |
| Janissaries: founded / abolished | c. 1350 – 1400 / 17 June 1826 CE (18 June for the shelling) | Veinstein; Gül (`wh-689`) |
| Suleiman: lived / reigned | 1494 – 1566 / 1520 – 1566 CE (1496 in another source) | Emecen (`wh-690`) |

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
wh-121: 17,000; 14,000; 15,800; 14,300
wh-122: 11,700; 10,500; 8,250
wh-123: 9600; 8000; 8800
wh-124: 10,500; 1550
wh-125: 7100; 5950
wh-126: 10,200; 9,500; 8,900; 8,600
wh-127: 20,000; 14,500; 7,900
wh-128: 20,000; 17,000; 11,000; 10,000; 5900
wh-129: 10,000; 4400
wh-130: 8300; 4300
wh-131: 9,000; 7,000; 6,250
wh-132: 12,000; 11,000
wh-133: 8,500; 1100; 1300
wh-134: 6,500; 5,500; 3,800
wh-135: 7,500; 5,960; 3,000
wh-136: 1981
wh-137: 5500; 5000; 4900
wh-139: 3000; 2500; 1800; 1500
wh-140: 3350; 3120; 1991
wh-141: 6600; 4000; 3000
wh-142: 2900; 2500; 1850
wh-143: 3200; 2600; 2450
wh-144: 4590; 4340; 4250; 4200
wh-145: 5000; 3700; 4500; 3800
wh-146: 9000; 8000; 5000
wh-147: 5000; 3000; 3500
wh-148: 3000; 2000; 2500; 1800
wh-149: 16,500; 2,400; 1251; 872
wh-150: 8000; 5200; 4900
wh-151: 14,500; 5,000; 11,000
wh-152: 12,000; 9,500; 7,000; 7,200; 3,000; 2,000
wh-153: 8,000; 5,000; 2,000
wh-154: 8600; 3300; 5400
wh-155: 10,000; 1900; 6950; 6440; 4350; 3980
wh-156: 5,500; 5,000; 4,200; 4,000; 3,500; 2,800; 1025; 1290
wh-157: 3,350; 3,150; 3,000; 2,800; 2,850; 2,700
wh-158: 5,025; 3,800; 1,100
wh-159: 3,700; 3,100; 2014
wh-160: 8,600; 7,000; 6,000; 6000; 2000; 3400; 1600
wh-161: 7,000; 3,500
wh-164: 52,000; 41,000; 28,000; 18,000
wh-169: 6000; 4000; 4500
wh-170: 4000; 3200; 1936; 1950
wh-175: 3300; 3200; 1200
wh-176: 3500; 330
wh-165: 5100; 4700; 3384; 3370
wh-166: 3600; 3350; 3100; 2000
wh-171: 3200; 331
wh-172: 3200; 2112; 2004
wh-173: 4000; 3200; 3300
wh-174: 3300; 75; 2900
wh-177: 2100; 1250; 556; 539
wh-178: 6000; 1000; 1946; 1949
wh-179: 2900; 2334
wh-180: 5500; 500; 400; 1922; 1934
wh-181: 2600; 2450; 1922; 1926
wh-182: 2600; 2500
wh-183: 1800; 1500; 800; 100; 1872
wh-184: 2334; 2279
wh-185: 2350; 2150; 2334
wh-186: 2112; 2004; 2094; 2047
wh-187: 2112; 2100; 1600
wh-188: 2000; 1500; 1792; 1750
wh-189: 1792; 1750
wh-190: 1792; 1750; 1150; 1901; 1902
wh-191: 1792; 1750; 605; 562; 539
wh-193: 1082; 495
wh-194: 2100; 2000; 1600; 1900; 1700
wh-195: 750; 75; 652; 61; 164
wh-196: 2000; 1500; 1722
wh-197: 2900; 1700; 1930; 1775
wh-198: 1770; 1360; 1220; 1155; 1150
wh-199: 2650; 1500; 1100; 646; 539
wh-200: 1550; 1350
wh-201: 3100; 30; 2686; 2181; 1550; 1069
wh-202: 5000
wh-203: 4000; 3500; 3200; 3100
wh-204: 3150; 3000; 1898
wh-205: 3350; 3050; 3100
wh-206: 3320; 394; 1822
wh-207: 196; 1799; 1822
wh-208: 3200; 2600
wh-209: 3100; 30
wh-210: 2686; 2181
wh-211: 2686; 2667
wh-212: 2589; 2566
wh-213: 2613; 2494; 1400; 1390
wh-214: 4500; 3350
wh-215: 1773; 1650; 1580; 30
wh-217: 2181; 2055; 2160; 2050
wh-218: 2055; 1650; 1985; 1795
wh-219: 1638; 1530
wh-220: 1550; 1069; 1295; 1186
wh-221: 1479; 1458; 1473
wh-222: 1479; 1425; 1458
wh-223: 1352; 1336
wh-224: 1336; 1327; 1922
wh-225: 1279; 1213; 1290
wh-226: 1274; 1286
wh-227: 1504; 1069
wh-228: 2112; 2063; 1294; 1213
wh-230: 1069; 664; 747
wh-231: 2600; 1900
wh-232: 3700; 1300; 2800; 2600; 1900
wh-233: 2600; 1900; 1922; 1931
wh-234: 2600; 1900; 1872; 1873
wh-235: 2600; 1900
wh-236: 3000; 1500; 1989; 2005
wh-237: 2500; 1500; 1000
wh-238: 1900; 1300
wh-239: 2100; 1700; 2000; 1500
wh-240: 1500; 500
wh-241: 1500; 1000
wh-242: 1750; 250; 400
wh-243: 1800; 1530; 1750; 1959
wh-244: 2205; 1767; 1989; 2070; 1600
wh-245: 1600; 1046; 1250
wh-246: 1250; 1046; 1899
wh-247: 1250; 1045
wh-248: 1600; 221
wh-249: 1250; 1192
wh-250: 1700; 1000; 1200; 1929
wh-251: 1046; 771; 841
wh-252: 1046; 771
wh-253: 1250; 221; 1956
wh-254: 8500; 5000; 1940; 1765
wh-255: 6200; 5400; 3500; 3000; 3200; 2000
wh-256: 3300; 1200; 2200; 800; 1700; 300
wh-257: 4650; 1500
wh-258: 3300; 2500; 3000
wh-259: 9500; 6000; 2000; 3300; 1500
wh-260: 3500; 3100; 2200
wh-261: 2000; 1800; 1200
wh-262: 3100; 1050; 1900; 1490; 1470
wh-263: 1650; 1500; 1250; 1050
wh-264: 1627; 1600; 1540; 1500
wh-265: 1450; 1200; 1952
wh-266: 1650; 1200; 1915
wh-267: 1730; 1650; 1200; 1906
wh-268: 1600; 1200; 1192; 1190; 1928
wh-269: 1900; 1800; 1850; 1700; 1400; 1300
wh-270: 1365; 1330; 1887
wh-271: 1320; 1982; 1984; 1994
wh-273: 2750; 2500; 2200; 1800
wh-274: 2200; 1550
wh-275: 1800; 1700; 1600; 1999
wh-276: 1700; 500; 1500
wh-277: 2200; 1950; 1800; 1500
wh-278: 1213; 1203; 1188; 1176
wh-279: 1250; 1150; 1198; 1196
wh-280: 2100; 1000; 800
wh-281: 1200; 586; 1050; 700; 800; 50; 200; 900
wh-282: 912; 609; 612
wh-283: 705; 612
wh-284: 668; 631
wh-285: 850; 612; 701
wh-286: 626; 539
wh-287: 605; 562; 586
wh-289: 597; 582; 539
wh-290: 950; 586; 722; 720
wh-291: 800; 160; 600; 132
wh-293: 1200; 1150; 332
wh-294: 1000
wh-295: 814; 813; 895; 795
wh-296: 800; 550
wh-297: 680; 547; 546
wh-298: 660; 630; 640; 550; 600; 400
wh-299: 858; 656; 612; 550
wh-300: 559; 530; 550; 539
wh-301: 550; 330
wh-302: 520; 515; 509; 457; 330
wh-303: 522; 486
wh-304: 509; 493
wh-307: 520; 518; 1835; 1847
wh-308: 486; 465; 480; 479
wh-309: 900; 800; 500; 400; 1200
wh-310: 334; 331; 330
wh-311: 800; 479; 323; 30
wh-312: 800; 700
wh-313: 800; 500; 733
wh-314: 700; 680; 640; 500
wh-315: 800; 750; 700
wh-316: 800; 700; 404; 371
wh-317: 480; 404; 323
wh-318: 508; 507; 462; 461; 403; 322
wh-319: 499; 479; 490; 480
wh-320: 490
wh-321: 480
wh-322: 480
wh-323: 478; 477; 454; 404
wh-324: 495; 431; 429
wh-325: 447; 432; 1687
wh-326: 534; 350; 300
wh-327: 469; 399
wh-328: 428; 387; 348; 347
wh-329: 384; 335; 322
wh-330: 431; 404; 415; 413; 405
wh-331: 484; 429; 413
wh-332: 382; 359; 336; 338
wh-333: 356; 336; 323
wh-334: 323; 30; 334; 31
wh-335: 304; 282; 48; 273; 391
wh-336: 753; 27; 476; 1453
wh-337: 900; 396; 300; 100
wh-338: 753; 813; 728; 700; 600
wh-339: 753; 509
wh-340: 509; 27
wh-342: 451; 450; 449
wh-343: 494; 287; 367
wh-345: 264; 241; 218; 201; 149; 146
wh-346: 247; 218; 195; 183; 181
wh-347: 216
wh-348: 146
wh-349: 229; 146; 196
wh-350: 133; 123; 121
wh-351: 107; 86; 88; 78
wh-352: 73; 71
wh-353: 100; 59; 44
wh-354: 58; 50; 52
wh-355: 49; 45; 48; 46
wh-356: 44
wh-357: 63; 31; 27; 14
wh-358: 27; 476; 1453
wh-359: 27; 180
wh-360: 312
wh-361: 312; 226
wh-362: 70; 80; 523
wh-365: 600; 500; 80; 79
wh-366: 37; 54; 68
wh-367: 53; 98; 117
wh-368: 122; 403; 406
wh-369: 121; 161; 180
wh-370: 235; 284; 249; 268
wh-371: 236; 245; 284; 305; 313; 316
wh-372: 271; 273; 306; 337
wh-373: 26; 36; 303; 313; 380; 391; 392
wh-374: 325
wh-375: 476
wh-376: 550; 322
wh-377: 700; 500; 300; 100
wh-380: 563; 483; 405
wh-381: 600; 400
wh-383: 321; 184
wh-384: 321; 297; 305; 303
wh-385: 50; 125; 175; 300; 1905
wh-386: 304; 268; 232; 260
wh-387: 259; 242; 1837; 1915
wh-388: 246; 65; 372; 538; 552
wh-390: 200; 10
wh-391: 75; 89; 127; 78; 224; 270
wh-392: 50; 500
wh-393: 320; 550; 319
wh-394: 550; 876; 1202
wh-395: 200; 1100; 634
wh-396: 770; 256; 481; 475; 453; 403; 249
wh-397: 770; 475; 722; 481
wh-398: 475; 221; 453; 403
wh-399: 551; 552; 479
wh-403: 475; 221; 140; 118; 1972; 1772
wh-404: 259; 247; 221; 210
wh-405: 221; 207; 770; 209
wh-406: 210; 1974
wh-407: 475; 221; 214; 1465; 1620
wh-408: 206; 9; 23; 25; 220
wh-410: 136; 1905
wh-411: 145; 135; 98; 91; 86; 74
wh-412: 140; 87; 105
wh-413: 184; 189; 220
wh-414: 220; 280; 229; 263; 266
wh-415: 65; 148; 170; 460; 524; 845
wh-416: 1070; 300; 350; 742; 656
wh-417: 800; 600; 300; 25
wh-418: 150; 700; 270; 340
wh-419: 1500; 900; 400; 1928
wh-420: 6,000; 4,000; 4,420; 2,600
wh-421: 1000; 700; 20
wh-422: 2500; 1170
wh-424: 1500; 400; 1400; 1000; 900
wh-426: 1650; 1600; 1374
wh-427: 500; 100; 200; 700; 800
wh-428: 700; 250; 1000; 800; 1500
wh-429: 300; 200; 250; 900
wh-430: 36; 3114
wh-431: 100; 250; 550
wh-432: 950; 400; 700; 500; 800; 350
wh-433: 100; 650; 400; 750
wh-434: 100; 800; 200; 900; 300; 950
wh-435: 3000; 1800
wh-436: 330; 1453; 1204; 1261
wh-437: 330; 413; 1204; 1261; 1453
wh-438: 482; 527; 565; 533; 534; 535; 552
wh-439: 528; 534; 529; 533
wh-440: 532; 537; 558; 562; 1453
wh-441: 527; 548
wh-442: 541; 544; 542; 750; 2013
wh-443: 672; 678; 717; 718; 1204
wh-444: 730; 787; 754; 815; 843
wh-445: 858; 880; 1054; 1274; 1439; 1965
wh-447: 863; 869; 885
wh-448: 880; 1036; 1054; 1240
wh-449: 681; 864; 865; 893; 927; 1018
wh-450: 1071
wh-451: 1204; 1261; 1203
wh-452: 1453
wh-453: 301; 314; 405
wh-454: 1008; 1089; 1213; 1490; 1801
wh-455: 330; 360; 1959
wh-456: 800; 275; 350; 570; 552
wh-457: 570; 632; 610; 622
wh-458: 622
wh-459: 610; 632; 650
wh-460: 610; 632; 751
wh-462: 632; 661; 644; 656
wh-463: 632; 711; 636; 639; 642
wh-464: 632; 656; 661; 680
wh-465: 661; 750; 685; 705; 696; 697
wh-467: 732
wh-468: 711; 756; 929; 1492
wh-469: 750; 1258; 836; 892
wh-470: 762; 1258; 1534
wh-472: 750; 1258; 850
wh-473: 780; 850
wh-474: 970; 980; 1025; 1037
wh-475: 750; 872; 1284
wh-477: 785; 786; 961; 971; 1523
wh-478: 909; 910; 973; 969; 1171
wh-479: 970; 972; 988; 1266; 1961
wh-481: 1304; 1325; 1354; 1355; 1368; 1369
wh-482: 1332; 1377; 1401; 1406
wh-483: 1040; 1055; 1072; 1092; 1157
wh-484: 1137; 1138; 1193; 1169; 1187
wh-485: 1250; 1517; 1382
wh-486: 500; 1500; 1688
wh-487: 375; 568; 376; 429
wh-488: 376; 410; 489; 526; 507; 711
wh-489: 466; 511; 481; 486; 507
wh-490: 449; 1066; 597; 731; 927
wh-491: 610; 635; 624; 625; 1939
wh-492: 285; 356; 292; 346; 362
wh-493: 530; 816; 819
wh-495: 768; 814; 772; 804; 774; 800
wh-496: 789; 796; 804; 798
wh-497: 962; 800; 1806
wh-498: 793; 1066; 750; 1050
wh-499: 793
wh-500: 849; 871; 899; 878
wh-501: 1021; 1000; 1121
wh-504: 28; 1066; 14; 25
wh-505: 1085; 1086
wh-506: 1095; 1291
wh-507: 18; 28; 1095; 3; 1098; 15; 1099
wh-508: 1118; 1119; 1129; 13; 1307; 22; 1312
wh-510: 1144; 1174
wh-511: 1088; 1215; 13 April 1231
wh-512: 1224; 1225; 1265; 1273; 1274; 1323
wh-513: 15 June 1215; 24 August 1215; 1297
wh-515: 1356; 1358; 1370; 1669
wh-516: 1346; 1353; 1338; 1339
wh-517: 1349; 1358; 1381
wh-518: 1337; 1453; 1360; 1420
wh-519: 1412; 30; 1431; 8; 1429; 23; 1430; 7; 1456
wh-520: 711; 2; 1492; 16; 1212; 1482; 1936
wh-521: 581; 618; 589; 582; 583; 612; 614
wh-522: 587; 610; 486; 1276; 1291; 2014
wh-523: 618; 907; 690; 705; 755; 868
wh-524: 582; 583; 904; 756; 763
wh-525: 605; 1384; 2 September 1905
wh-526: 764; 770; 868; 932; 953
wh-527: 755; 763; 756; 757
wh-528: 960; 1279; 1127
wh-529: 990; 1023; 1161; 1260
wh-530: 1044; 1132; 1232
wh-531: 1087; 1119; 1187
wh-532: 1041; 1048; 1297
wh-533: 1011; 1200; 1196; 1313
wh-534: 618; 907; 1710; 1712; 1722
wh-535: 1271; 1368; 1279; 1267
wh-536: 1254; 1271; 1295; 1298; 1324
wh-537: 1266; 1268; 1274; 1281
wh-538: 1338; 1573; 1392; 1467; 1477
wh-540: 918; 1392; 919; 936
wh-541: 1234; 1377; 1403; 1434
wh-542: 794; 1185; 1180
wh-543: 1008; 1020
wh-544: 792; 1180; 1185; 1876
wh-545: 1180; 1192; 1221; 1232; 1333
wh-546: 606; 647; 643
wh-547: 985; 1025; 1030; 1031
wh-548: 1206; 1526; 1211; 1236; 1296; 1316; 1398; 1399
wh-549: 1336; 1565
wh-551: 711; 713; 1192
wh-552: 1191; 1196; 1310; 1311
wh-554: 682; 686; 1025
wh-555: 1293; 1478
wh-556: 802; 1181 – 1218; 1431
wh-557: 1113; 1150; 1541; 1747
wh-558: 1044; 1287; 1057; 1284
wh-559: 968; 1054; 1407; 1428
wh-561: 780; 850; 1814; 1907; 1911; 1973; 1983
wh-562: 800; 700; 993; 1017
wh-565: 1403; 1405; 1511
wh-566: 1054; 1067; 1076
wh-567: 757; 758; 1352; 1393; 1510
wh-568: 1235; 1352; 1353; 1433; 1594
wh-570: 1312; 1337; 1324; 1325
wh-571: 1100; 1325; 1468; 1591
wh-572: 1464; 1492; 1493; 1528; 1591
wh-573: 1086; 1097; 1391; 1392; 1400
wh-574: 1349; 1385; 1463; 1499; 1513
wh-575: 1200; 1897; 1486; 1702
wh-576: 1500; 1700; 1897; 2022
wh-577: 600; 700; 1000; 1100; 1500; 1600
wh-578: 800; 900; 980; 1000; 1331; 1505; 1507
wh-579: 1000; 1800; 1200; 1300; 1450
wh-580: 1350; 1482; 1483; 1491; 1506; 1543
wh-581: 1137; 1270
wh-582: 900; 1000; 1978
wh-585: 450; 550; 651; 652; 1317
wh-588: 176; 165; 138; 126
wh-589: 370; 376; 454
wh-590: 434; 439; 445; 451; 453
wh-591: 552; 583; 682; 745; 732; 735
wh-592: 660; 965; 833; 1577
wh-593: 1162; 1206; 1227
wh-594: 1206; 1260; 1264
wh-595: 1206; 1279; 1211; 1234; 31 May 1223; 1237; 1240
wh-597: 1258; 20; 1261
wh-598: 1260; 1502; 1313; 1341; 1359
wh-599: 1336; 1370; 1405; 1404
wh-600: 1206; 1359; 1380; 1441; 1783; 1822
wh-601: 250; 900; 378; 869
wh-602: 750; 850; 800; 1000; 998
wh-603: 600; 1000; 1025; 1050
wh-604: 900; 1150
wh-605: 1430; 1521
wh-606: 1325
wh-610: 600; 1000
wh-611: 180; 500; 1000; 1010
wh-612: 1438; 1533; 1532
wh-614: 1420; 1532
wh-617: 1000; 1450
wh-618: 1050; 1350; 1400
wh-619: 500; 1300; 1280
wh-620: 850; 1150; 1050; 800; 1130
wh-622: 1100
wh-623: 1252; 1282; 1532
wh-624: 1434; 1737; 1397; 26; 1478; 1532
wh-626: 1304; 1374; 1341; 1336
wh-627: 1452; 1519; 1503
wh-628: 1475; 1564; 1508; 1512; 1536; 1541
wh-629: 1413; 1435; 1436
wh-630: 1450; 1454; 1455; 1465
wh-631: 1397; 1406; 1439; 1455; 1468
wh-633: 1466; 1469; 1492; 1516; 1536
wh-634: 3; 1469; 1498; 1512; 1513; 21; 1527
wh-635: 1517; 1519; 25 September 1555; 1648
wh-636: 10 November 1483; 1505; 1521; 18 February 1546
wh-637: 31; 1517
wh-638: 19; 25; 1529
wh-639: 10; 1509; 1536; 1541; 27; 1564
wh-640: 1533; 1534; 1549; 1559
wh-641: 1491; 1509; 1547
wh-643: 1540; 1534; 1773; 1814
wh-644: 1546; 1555; 1562; 1598; 1568; 1648
wh-645: 24; 1572; 22
wh-646: 23; 1618; 8; 1620; 24; 1648
wh-647: 24; 1648
wh-648: 1450; 1750; 1560; 1630
wh-649: 1543; 1687
wh-650: 1473; 1543; 1616; 1835
wh-651: 15; 1564; 8; 1642; 1610; 26; 1616; 22; 1633
wh-652: 27; 1571; 15; 1630; 1609; 1619; 1627
wh-653: 1642; 1643; 1669; 1687; 1727
wh-655: 28 November 1660; 15 July 1662; 1663
wh-657: 1394; 1460; 1415; 1434; 1444
wh-659: 3 February 1488; 22 November 1497; 20 May 1498
wh-660: 1460; 1469; 8 July 1497; 20 May 1498; 24 December 1524
wh-661: 1451; 17; 1492; 12; 1492; 1506
wh-662: 7; 1494; 2
wh-663: 10; 1519; 20; 27; 1521; 6; 1522
wh-665: 1485; 1521; 1547
wh-666: 30 May 1521; 13 August 1521
wh-667: 1529; 1532; 1541
wh-668: 1532; 1572; 1536; 1541
wh-669: 1492
wh-670: 1545; 1548; 1576; 1578
wh-671: 1545; 1571; 1572; 1573
wh-673: 1503; 27; 1512; 1542; 20; 1545
wh-674: 1492; 1898; 1824
wh-675: 1415; 1999; 1505; 1961
wh-676: 20; 1602; 1; 1796; 1800
wh-677: 31; 1600; 1601; 1858; 1874
wh-678: 1565; 1571; 14; 1813; 1815
wh-679: 10 April 1606; 13 – 14 May 1607; 30 July 1619; August 1619
wh-680: 1616; 1620
wh-681: 3 July 1608; 1663; 8 September 1760; 10 February 1763
wh-682: 1582; 1587; 1639; 1689
wh-683: 1728; 1779; 1768; 1769
wh-685: 1569; 1599
wh-687: 1299; 1 November 1922
wh-688: 30 March 1432; 3 May 1481; 1444; 1446; 1451; 29 May 1453
wh-689: 1350; 1400; 1826
wh-690: 1494; 1566; 1520
```
