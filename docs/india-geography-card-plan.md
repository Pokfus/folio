# India — the geography card plan

The collection is **India** (`geo-india`), the fifth country of the Geography SECTION on the Collections page,
beside **World** (`geo-world`), **United States** (`geo-us`), **China** (`geo-china`) and **Russia**
(`geo-russia`). It is **not** the India HISTORY collection (`col-43`, prefix `in-`), and its prefix is **`gin-`**
so the two can never share an id. It was planned on 2026-10-30, on request ("an entirely new geography
collection about India, for studying its states, state capitals, other largest cities, rivers, mountains, etc.
— similar to the other geography collections"), **with no cards written**: the owner chose "structure only".

It is **190 numbers in five decks**:

| deck | id | numbers | format | can be written today? |
|---|---|---|---|---|
| The states and union territories | `geo-india-states` | `gin-001`–`gin-036` | map card (a shaded shape) | **no — waits for India's admin-1 in the Atlas** |
| The capitals | `geo-india-capitals` | `gin-501`–`gin-536`, less 519 and 531 | map card with a dot | **no — same wait** |
| Other great cities | `geo-india-cities` | `gin-701`–`gin-740` | map question on a locator | yes |
| Rivers, lakes and seas | `geo-india-water` | `gin-801`–`gin-840` | map question on a locator | yes |
| Mountains, deserts and caves | `geo-india-mountains` | `gin-901`–`gin-940` | map question on a locator | yes |

📖 **`docs/geography-card-plan.md`** describes the map card and the physical decks' locator format, 📖
**`docs/world-geography-card-plan.md`** the rules every non-US geography deck shares (what a background may
say, `gw-audit.js`'s four rules, the date line), and 📖 **`docs/russia-geography-card-plan.md`** is the most
recent collection built on both and the closest model — **read the sections each deck below points at before
writing a card**. This file records only the running orders and the decisions particular to India.

The next card to write is the lowest `gin-NNN` not in `data.js` **that is in a deck which can be written** —
`next-cards.js` does not know about the wait below, so **start at `gin-701`, not `gin-001`**:

    node .claude/next-cards.js gin- 5

---

## ⚠ The two shape decks wait for the Atlas, and why

A map card shades a shape that the Atlas engine already holds: `atlas/data/card-faces.js` joins a layer's key
to an **admin-1 entity of `topology.bin`** (`.claude/atlas-build/build-card-faces.js`). **`topology.bin` carries
admin-1 units for four countries only — the United States, China, Russia and the UK's nations** (`ADMIN1` in
`.claude/atlas-build/build-admin.js`; design decision Q-A7 (a) in `docs/atlas-v2-design.md`). India has none, so
there is no shape for a state card to shade and no layer for a capital's dot to sit in. Measured 2026-10-30:
the header's entity table holds 0 entities with an `IN-` code and 0 children of `adm0:ind`.

**The route is decided (2026-10-30): a lazy admin-1 layer, not a rebuild.** 📖 **`docs/atlas-v2-admin1-layer.md`** —
India's 36 units go into `atlas/data/admin1.bin`, a file in `history.bin`'s format conflated onto the committed core, so
`topology.bin` and everything pinned to it stay untouched, the states are shaded in card windows AND drawn on the Personal
Atlas, and a later country is a spec row and a rebuild of that one file. The decks become writable at **step 2** of that
plan (the engine slot and the card windows); until then no `gin-0NN` or `gin-5NN` card is written, and `add-card.js`
would refuse the unknown layer anyway.

Two routes were measured and set aside, and the design note records both: India's admin-1 inside `topology.bin` (a
whole-Atlas rebuild per country; the every-country trial grew the first download by about a megabyte and did not pack),
and an outline file the card window paints itself (it cannot reach the Personal Atlas). **What the outline-file
investigation measured still holds for the new layer's input:** Natural Earth admin-1 5.1.1, already pinned, has exactly
the 36 current units with their codes (Ladakh, the merged Dadra and Nagar Haveli and Daman and Diu, Telangana as `IN-TG`);
its `type_en` is wrong on some (Himachal Pradesh "Union Territory", Gujarat blank), so names and kinds are declared; and
none of its 32,884 vertices lies more than 1 km outside Natural Earth's admin-0 India, so the units tile the country the
engine draws, Jammu and Kashmir and Ladakh as the area India administers.

The other three decks are locator questions (a point or a river line on the existing engine) and **can be
written now**.

## What is in the states deck, and what is not

**One checkable rule, the Russia deck's own: a unit is in the deck if it carries an ISO 3166-2:IN code of its
own.** That is **36: 28 states and 8 union territories** — the Government of India's own count since
26 January 2020, when Dadra and Nagar Haveli and Daman and Diu were merged into one union territory (Ladakh and
Jammu and Kashmir became union territories on 31 October 2019). Wikidata's query service, asked on 2026-10-30
for every item with an `IN-` ISO 3166-2 code, returned the 36 plus the superseded codes of the units before
those two reorganisations (Daman and Diu, Dadra and Nagar Haveli), which are not in the deck.

**The deck is called *The states and union territories***, and every question asks for **"the state or union
territory shaded on the map"** — true of all 36, and it does not give away which of the two a unit is. Each
card says its kind in its own prose, and the facts box carries it in a `Kind` row.

### ⚠ The disputed frontiers: what the shape draws and what the card says

Three of the 36 have borders another state disputes, and a deck of shapes makes a claim simply by drawing one.

- **Jammu and Kashmir and Ladakh.** India claims the whole of the former princely state of Jammu and Kashmir;
  part is administered by Pakistan (Azad Kashmir and Gilgit-Baltistan) and part by China (Aksai Chin, and the
  Shaksgam valley ceded by Pakistan in 1963). **The shape is the area India administers**, which is what
  Natural Earth's default admin-0 and admin-1 draw and what the engine's India already is. The card's facts box
  gives the administered area, and **the background names the claims plainly, once, with whose each is** —
  India's, Pakistan's and China's — and takes none as settled.
- **Arunachal Pradesh.** Administered by India; China claims most of it (as "Zangnan", part of its Tibet
  Autonomous Region). The same treatment: the shape India administers, the claim named once.

**No government's account is repeated as established fact**, in any direction — the standing rule. Features
whose subject IS the dispute are out of the physical decks (below).

## The names

The **English name Wikipedia's article uses**, with its current official form: *Odisha* (renamed from Orissa in
2011), *Puducherry*, *Uttarakhand*, *Telangana*. The old name is given once in the card's prose where there is
one. Natural Earth's own names are not trusted — its admin-1 `name` field is known to be stale elsewhere
(Russia's "Chita", "Yevrey"), so when the layer is built **the names are declared in the builder** and only the
geometry and label point come from the source (the Russia builder's arrangement).

## How the running order was chosen

**By population, largest first** — the rule all four sibling collections follow. **THE ORDER IS FIXED AT
PLANNING TIME AND IS NOT RE-SORTED**; a card id is a permanent address. The snapshot is **the 2011 Census of
India**, the last census taken (the next is scheduled for 2027), as tabulated by Wikipedia's *List of states
and union territories of India by population* (2011 column), **retrieved 2026-10-30**, on current boundaries
(Andhra Pradesh and Telangana separately, Jammu and Kashmir without Ladakh). Lakshadweep, absent from that
table's 2011 column, is the smallest by every figure and is last. A card's own population figure is researched
and cited when the card is written; the snapshot decides the ORDER and nothing else.

## The capitals: two numbers unused, two shared, and the seats that need care

A capital is numbered **500 above its own unit**, so the two decks pair by arithmetic.

- **`gin-519` Delhi and `gin-531` Chandigarh are never written.** Each is a union territory that is
  essentially its city, so the shaded shape would be the answer — the rule *The world* follows for its
  city-states and China and Russia for their municipalities and federal cities.
- **`gin-516` Punjab and `gin-518` Haryana both answer Chandigarh, and the dot is OUTSIDE the shaded shape —
  truly.** Chandigarh is a union territory of its own and the capital of both states. Unlike Russia's Abakan
  (a DATA fault, refused), this is the fact, and a card that says so teaches it: the card's question and
  background must state that the capital lies in the union territory beside the state. **If the owner would
  rather not ask it, the two numbers are deferred, never renumbered.**
- **Seats to settle at writing, from the state's own government and statute, never from a list:**
  Jammu and Kashmir (Srinagar in summer, Jammu in winter — the plan's answer is **Srinagar**, the card names
  both); Andhra Pradesh (Amaravati — capital status was disputed between 2019 and 2024; the card says so in
  one sentence, with dates); Assam (Dispur is a locality within Guwahati, so the dot and the city are the same
  point — Guwahati is therefore NOT in the cities deck); Maharashtra (Nagpur hosts the winter session and is in
  the cities deck as a city, not as a capital); Himachal Pradesh (Dharamshala named a second capital in 2017);
  Uttarakhand (Gairsain named the summer capital in 2020); Ladakh (Leh; Kargil hosts the other hill council);
  Andaman and Nicobar Islands (**Sri Vijaya Puram**, renamed from Port Blair in 2024 — the old name in the
  prose); Puducherry (the city, whose article is titled *Pondicherry*). **A second seat is told in the
  background, never as a second capital card.**

## Other great cities — `geo-india-cities` (a LOCATOR deck)

"Other largest cities" taken literally — the US deck's "largest city of each state where it is not the
capital" — gives about a dozen cards in India, because most capitals are their state's largest city. The deck
is therefore **India's 40 most populous cities that are not a state or union territory capital**, by the
**2011 Census city populations** of Wikipedia's *List of cities in India by population*, retrieved 2026-10-30,
with one rule against the satellite towns:

> **A city within 40 km of a larger city, or of a capital, is left out** — it would be a dot beside a dot.

That drops Thane, Navi Mumbai, Kalyan-Dombivli, Vasai-Virar, Mira-Bhayandar and Bhiwandi (Mumbai),
Pimpri-Chinchwad (Pune), Ghaziabad, Faridabad, Gurgaon, Noida and Loni (Delhi), Howrah and the other Kolkata
municipalities, Cuttack (Bhubaneswar), Bhilai (Raipur), Bokaro (Dhanbad), Firozabad (Agra), Rampur
(Moradabad), Guwahati (Dispur, above) and Ambattur and Avadi (Chennai).

**The format is the physical decks'**: a map question on a point locator, **"The city marked on the map is
___."**, the coordinate FETCHED by `add-card.js`, `undatable` unless the city's founding is the card's own
date line (it usually is not), two blocks of five sentences — the city as a place, then its history — and
the facts grid **Population | Area / State | Known for** (write `?` for a cell no opened source gives). Because
it is a point, **it does not wait on the Atlas** and the cards can be written now. Tag 1 `place`, then
`geography`, `india`, `city`.

Names are the current official ones with Wikipedia's titles: *Prayagraj* (Allahabad until 2018),
*Chhatrapati Sambhajinagar* (Aurangabad until 2023), *Mysore* (officially Mysuru), *Hubli–Dharwad*,
*Tiruchirappalli*. **Amravati (Maharashtra) is not Amaravati (Andhra Pradesh's capital)**: the card says so.

## The physical decks — water, and mountains, deserts and caves

**The US, China and Russia physical decks are the rulebook**: 📖 `docs/geography-card-plan.md` "The physical
decks", 📖 `docs/china-geography-card-plan.md` "The physical decks" and 📖
`docs/russia-geography-card-plan.md` "The physical decks". Every card is a **map question**
(`locator.ask: true`); the question is the short prompt only (**"The river traced on the map is ___."**, else
"The <lake / sea / gulf / strait / reservoir / waterfall / wetland / mountain / volcano / mountain range /
plateau / plain / desert / salt marsh / hills / cave / rock shelter / crater / valley> marked on the map is
___."), no extra `questions`; ten sentences in two blocks of five — what the feature is and how it was made,
then what people did with it; `undatable: true` unless a date is the feature's own; `difficulty` by how well
the NAME is known; the source bar by difficulty (`srcTargetFor`); three `why` items; a glossary term per
answer. Tag 1 `place`, then `geography`, `india`, and the subject. The facts grid is Russia's with **States**
for *Federal subjects* (the 36 by this collection's names; a neighbouring country named where a feature is
shared). **A range with no honest spine of fetched summit coordinates gets no locator** and is deferred, as
Russia deferred seven.

### Rivers: the `rivers.js` names, read on 2026-10-30

A river card traces its line only if `locator.rivers` names its EXACT `rivers.js` entries. Read out of the file:

    Ganges        Ganges                 (to 90.4° E — check whether the drawing runs on as the Padma)
    Brahmaputra   Brahmaputra            (Assam and Bangladesh; Dihang is the Siang in Arunachal, Yarlung the
                                          Tibetan course, Luhit the Lohit — add only what the sources make the
                                          Brahmaputra's own course)
    Indus         Indus                  Yamuna       Yamuna          Godavari    Godävari (sic)
    Narmada       Narmada                Krishna      Krishna         Kaveri      Cauvery, Kolidam (its lower branch)
    Sutlej        Sutlej                 Mahanadi     Mahäna Nadï (sic)          Chambal     Chambal
    Tapti         Tapti                  Jhelum       Jhelum          Chenab      Chenab
    Beas          Beas                   Ravi         Ravi            Kosi        Sapt (the Sapt Koshi — check)
    Son           Son                    Ghaghara     Ghäghara (sic)  Gandak      Gandak
    Teesta        Tista                  Tungabhadra  Tungabhadra

**The Hooghly is not in `rivers.js`**, so `gin-818` is a dot and says "marked". The diacritics in three
entries are the source's, and the name must be copied exactly.

### What is in, what is out, and why

**In**: features in or on the 36 units, a shared one carded whole with its neighbours named plainly — the
Ganges and Brahmaputra (Bangladesh, and China for the Brahmaputra), the Indus and its Punjab tributaries
(Pakistan), the Sundarbans (Bangladesh), Kangchenjunga (Nepal), the Patkai and Saramati (Myanmar), the Palk
Strait and Gulf of Mannar (Sri Lanka). **The Ganges, Indus, Himalayas, Thar Desert and Deccan Plateau** are
already carded in *The world* (`gw-812`, `gw-838`, `gw-905`, `gw-929`, `gw-930`) and **the Himalayas** in China
(`gc-902`); they are in here too, on the Russia plan's rule ("a reader who only studies this collection should
get the most important places"), each told from India's side in its own words and sources, never copied, with
the glossary term SHARED (`Ganges`, `Indus_River`, `Himalayas`, `Thar_Desert`, `Deccan_Plateau` exist).

**Out, and why:**

- **Features whose subject is a territorial dispute**: the Karakoram and K2, the Siachen Glacier, Pangong Tso
  (the Line of Actual Control crosses it), Aksai Chin and Sir Creek. A card would be about the standing, not the
  ground (the China plan's Taiwan Strait reasoning, Russia's Sea of Azov). The Jammu and Kashmir and Ladakh
  cards name the disputes.
- **Mount Everest**: not in India.
- **The Indian Ocean** and the oceans generally (the sibling decks' rule); the Arabian Sea, Bay of Bengal and
  Andaman Sea are in.
- **Glaciers, springs, national parks as parks, dams as dams and rock-cut monuments** (Ajanta, Ellora and
  Elephanta are artworks and history, not geography). Gobind Sagar is in as a reservoir; Bhimbetka is in as
  natural rock shelters.
- **Islands as islands** (Majuli, the Andamans): their units' map cards draw them. Barren Island and Narcondam
  are in as volcanoes.

### How the running orders were chosen

**By how well the name is known**, the sibling decks' axis and `difficulty`'s: 1–10 household names, 11–22
familiar from school, 23–32 known to the interested, 33–40 the hard ones.

## Sourcing

**Not measured at planning.** Run `node .claude/check-reach.js` before the first batch and record what answers
here. Likely spines, to be checked rather than assumed: the Census of India (`censusindia.gov.in`), the
Survey of India, the state governments' own sites (`*.gov.in`, `*.nic.in`), UNESCO's World Heritage pages (the
Western Ghats, the Sundarbans, Nanda Devi and the Valley of Flowers, Bhimbetka, Kangchenjunga National Park),
the Central Water Commission and India-WRIS for river figures, and Wikidata for coordinates. **The citation
bar is the site's own**, and a Hindi or other Indian-language source qualifies where it carries detail no
English one does.

## The glossary

**Most answers are new keys** (measured 2026-10-30: `Ganges`, `Indus_River`, `Himalayas`, `Thar_Desert`,
`Deccan_Plateau`, `India` and `Punjab` exist; no state but Punjab, no capital and none of the other rivers do).
**`Punjab` is ambiguous** — the region, the Indian state and the Pakistani province — so read the existing term
before keying the state (`Punjab,_India` is Wikipedia's title for it). Grep before every `add-glossary.js`,
which overwrites in silence. *Bengal*, *Kashmir* and *Hyderabad* (the city against the princely state) want
the same care.

---

# The list

## The states and union territories — `geo-india-states`

Thirty-six cards, by 2011 census population. **Waits for India's admin-1 in the Atlas** (above).

  gin-001  Uttar Pradesh
  gin-002  Maharashtra
  gin-003  Bihar
  gin-004  West Bengal
  gin-005  Madhya Pradesh
  gin-006  Tamil Nadu
  gin-007  Rajasthan
  gin-008  Karnataka
  gin-009  Gujarat
  gin-010  Andhra Pradesh
  gin-011  Odisha
  gin-012  Telangana
  gin-013  Kerala
  gin-014  Jharkhand
  gin-015  Assam
  gin-016  Punjab
  gin-017  Chhattisgarh
  gin-018  Haryana
  gin-019  Delhi
  gin-020  Jammu and Kashmir
  gin-021  Uttarakhand
  gin-022  Himachal Pradesh
  gin-023  Tripura
  gin-024  Meghalaya
  gin-025  Manipur
  gin-026  Nagaland
  gin-027  Goa
  gin-028  Arunachal Pradesh
  gin-029  Puducherry
  gin-030  Mizoram
  gin-031  Chandigarh
  gin-032  Sikkim
  gin-033  Dadra and Nagar Haveli and Daman and Diu
  gin-034  Andaman and Nicobar Islands
  gin-035  Ladakh
  gin-036  Lakshadweep

## The capitals — `geo-india-capitals`

Thirty-four cards, each 500 above its unit; `gin-519` (Delhi) and `gin-531` (Chandigarh) are unused. **Waits
for India's admin-1 in the Atlas** (above).

  gin-501  Lucknow  [Uttar Pradesh]
  gin-502  Mumbai  [Maharashtra]
  gin-503  Patna  [Bihar]
  gin-504  Kolkata  [West Bengal]
  gin-505  Bhopal  [Madhya Pradesh]
  gin-506  Chennai  [Tamil Nadu]
  gin-507  Jaipur  [Rajasthan]
  gin-508  Bengaluru  [Karnataka]
  gin-509  Gandhinagar  [Gujarat]
  gin-510  Amaravati  [Andhra Pradesh]
  gin-511  Bhubaneswar  [Odisha]
  gin-512  Hyderabad  [Telangana]
  gin-513  Thiruvananthapuram  [Kerala]
  gin-514  Ranchi  [Jharkhand]
  gin-515  Dispur  [Assam]
  gin-516  Chandigarh  [Punjab]
  gin-517  Raipur  [Chhattisgarh]
  gin-518  Chandigarh  [Haryana]
  gin-520  Srinagar  [Jammu and Kashmir]
  gin-521  Dehradun  [Uttarakhand]
  gin-522  Shimla  [Himachal Pradesh]
  gin-523  Agartala  [Tripura]
  gin-524  Shillong  [Meghalaya]
  gin-525  Imphal  [Manipur]
  gin-526  Kohima  [Nagaland]
  gin-527  Panaji  [Goa]
  gin-528  Itanagar  [Arunachal Pradesh]
  gin-529  Puducherry  [Puducherry]
  gin-530  Aizawl  [Mizoram]
  gin-532  Gangtok  [Sikkim]
  gin-533  Daman  [Dadra and Nagar Haveli and Daman and Diu]
  gin-534  Sri Vijaya Puram  [Andaman and Nicobar Islands]
  gin-535  Leh  [Ladakh]
  gin-536  Kavaratti  [Lakshadweep]

## Other great cities — `geo-india-cities`

Forty cards, by 2011 census city population; locator map questions, writable now.

  gin-701  Ahmedabad  [Gujarat]
  gin-702  Surat  [Gujarat]
  gin-703  Pune  [Maharashtra]
  gin-704  Kanpur  [Uttar Pradesh]
  gin-705  Nagpur  [Maharashtra]
  gin-706  Indore  [Madhya Pradesh]
  gin-707  Visakhapatnam  [Andhra Pradesh]
  gin-708  Vadodara  [Gujarat]
  gin-709  Ludhiana  [Punjab]
  gin-710  Agra  [Uttar Pradesh]
  gin-711  Nashik  [Maharashtra]
  gin-712  Meerut  [Uttar Pradesh]
  gin-713  Rajkot  [Gujarat]
  gin-714  Varanasi  [Uttar Pradesh]
  gin-715  Chhatrapati Sambhajinagar  [Maharashtra]
  gin-716  Dhanbad  [Jharkhand]
  gin-717  Amritsar  [Punjab]
  gin-718  Prayagraj  [Uttar Pradesh]
  gin-719  Jabalpur  [Madhya Pradesh]
  gin-720  Gwalior  [Madhya Pradesh]
  gin-721  Coimbatore  [Tamil Nadu]
  gin-722  Vijayawada  [Andhra Pradesh]
  gin-723  Jodhpur  [Rajasthan]
  gin-724  Madurai  [Tamil Nadu]
  gin-725  Kota  [Rajasthan]
  gin-726  Solapur  [Maharashtra]
  gin-727  Hubli–Dharwad  [Karnataka]
  gin-728  Bareilly  [Uttar Pradesh]
  gin-729  Mysore  [Karnataka]
  gin-730  Moradabad  [Uttar Pradesh]
  gin-731  Aligarh  [Uttar Pradesh]
  gin-732  Jalandhar  [Punjab]
  gin-733  Tiruchirappalli  [Tamil Nadu]
  gin-734  Salem  [Tamil Nadu]
  gin-735  Saharanpur  [Uttar Pradesh]
  gin-736  Gorakhpur  [Uttar Pradesh]
  gin-737  Guntur  [Andhra Pradesh]
  gin-738  Amravati  [Maharashtra]
  gin-739  Bikaner  [Rajasthan]
  gin-740  Jamshedpur  [Jharkhand]

## Rivers, lakes and seas — `geo-india-water`

Forty cards: rivers, seas, gulfs, a strait, lakes, a wetland, a reservoir and a waterfall.

  gin-801  Ganges
  gin-802  Brahmaputra
  gin-803  Indus
  gin-804  Yamuna
  gin-805  Bay of Bengal
  gin-806  Arabian Sea
  gin-807  Godavari
  gin-808  Narmada
  gin-809  Krishna
  gin-810  Kaveri
  gin-811  Sundarbans
  gin-812  Sutlej
  gin-813  Mahanadi
  gin-814  Chambal
  gin-815  Tapti
  gin-816  Dal Lake
  gin-817  Chilika Lake
  gin-818  Hooghly River
  gin-819  Palk Strait
  gin-820  Gulf of Mannar
  gin-821  Jhelum
  gin-822  Chenab
  gin-823  Beas
  gin-824  Ravi
  gin-825  Kosi
  gin-826  Son
  gin-827  Ghaghara
  gin-828  Gandak
  gin-829  Teesta
  gin-830  Tungabhadra
  gin-831  Loktak Lake
  gin-832  Vembanad
  gin-833  Gulf of Khambhat
  gin-834  Gulf of Kutch
  gin-835  Andaman Sea
  gin-836  Wular Lake
  gin-837  Pulicat Lake
  gin-838  Sambhar Salt Lake
  gin-839  Gobind Sagar
  gin-840  Jog Falls

## Mountains, deserts and caves — `geo-india-mountains`

Forty cards: ranges, peaks, plateaus, a plain, a desert, a salt marsh, volcanoes, caves, a crater and valleys.

  gin-901  Himalayas
  gin-902  Thar Desert
  gin-903  Western Ghats
  gin-904  Deccan Plateau
  gin-905  Kangchenjunga
  gin-906  Eastern Ghats
  gin-907  Indo-Gangetic Plain
  gin-908  Nilgiri Mountains
  gin-909  Aravalli Range
  gin-910  Nanda Devi
  gin-911  Vindhya Range
  gin-912  Satpura Range
  gin-913  Rann of Kutch
  gin-914  Chota Nagpur Plateau
  gin-915  Shillong Plateau
  gin-916  Anamudi
  gin-917  Sivalik Hills
  gin-918  Pir Panjal Range
  gin-919  Zanskar Range
  gin-920  Malwa Plateau
  gin-921  Valley of Flowers
  gin-922  Barren Island
  gin-923  Kamet
  gin-924  Ladakh Range
  gin-925  Dhauladhar
  gin-926  Cardamom Hills
  gin-927  Doddabetta
  gin-928  Guru Shikhar
  gin-929  Lonar crater
  gin-930  Belum Caves
  gin-931  Borra Caves
  gin-932  Bhimbetka rock shelters
  gin-933  Krem Liat Prah
  gin-934  Patkai
  gin-935  Saramati
  gin-936  Kudremukh
  gin-937  Saddle Peak
  gin-938  Narcondam
  gin-939  Spiti Valley
  gin-940  Khasi Hills
