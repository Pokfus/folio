# China — the card plan

The collection is **China** (`geo-china`), the third of the Geography SECTION on the Collections page,
beside **The world** (`geo-world`) and **United States** (`geo-us`). It is **58 cards in two decks**:
**The provinces and regions** (`geo-china-provinces`, `gc-001`–`gc-031`) and **The provincial capitals**
(`geo-china-capitals`, `gc-501`–`gc-531` with four numbers deliberately unused). Its cards use the **map
card** format — a shape on a globe, and the question is what it is.

📖 **`docs/geography-card-plan.md` describes the map card itself** — `map`, `facts`, `answerFlag`, the
globe, the fit, the accessibility limitation — and everything it says applies here unchanged. **Read it
before writing a card.** This file is the running order and the decisions particular to China: which
divisions are in the list, which of them can have a capital card at all, what each is called, and where
the figures come from.

The next card to write is the lowest `gc-NNN` not yet in `data.js`:

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='gc-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

**Shipped so far — `gc-001` Guangdong, `gc-002` Shandong, `gc-003` Henan, `gc-004` Jiangsu,
`gc-005` Sichuan, `gc-006` Hebei, `gc-007` Hunan, `gc-008` Zhejiang, `gc-009` Anhui, `gc-010` Hubei,
`gc-011` Guangxi, `gc-012` Yunnan, `gc-013` Jiangxi, `gc-014` Liaoning, `gc-015` Fujian,
`gc-016` Shaanxi and `gc-017` Guizhou, with `gc-501` Guangzhou, `gc-502` Jinan, `gc-503` Zhengzhou,
`gc-504` Nanjing, `gc-505` Chengdu, `gc-506` Shijiazhuang, `gc-507` Changsha, `gc-508` Hangzhou,
`gc-509` Hefei, `gc-510` Wuhan, `gc-511` Nanning, `gc-512` Kunming, `gc-513` Nanchang and
`gc-514` Shenyang.**
The first province card and the first capital card were written together, so that the new map layer, its
point table, the fit and the gold dot were all proved on a real card rather than on a test. The next
province is `gc-018` Shanxi and the next capital is `gc-515` Fuzhou.

---

## What is in the list, and what is not

The set is not a judgement made division by division, and on this subject it had better not be. It is
**the set one source reports**: the National Bureau of Statistics' *Communiqué of the Seventh National
Population Census (No. 3) — Population by Region*, which gives "the data of permanent residents in 31
provinces, autonomous regions and municipalities directly under the central government of the Chinese
mainland". That is the same work the running order is sorted by, so the list and the order come out of
one document and both can be checked against it in a minute.

Those 31 are 22 provinces, 5 autonomous regions and 4 municipalities. **Natural Earth carries a
thirty-second China admin-1 feature and it is dropped**: the Paracel Islands, which are not a
provincial-level division, have no settled resident population and are disputed between three
governments. The drop happens in `.claude/build-china-provinces.js`, with its reason beside it, so the
layer a card is drawn on carries exactly the 31 and a card for the thirty-second cannot be written by
accident.

**Hong Kong, Macau and Taiwan are not in this deck, and the reason is a fact about Folio rather than a
claim about any of them.** Each has an ISO 3166-1 code of its own, each is drawn by `world.js` as its own
shape, and each already has a number in *The world*'s running order — `gw-104` Hong Kong, `gw-167` Macau
and `gw-060` Taiwan, the last of them written already. Carding them again here would ask one shape twice
on one site, which is the only thing this deck has to avoid. Where the standing of one of them bears on a card in this collection, that card says so in its own
background, at the bar, with the dispute described and no government's account of its own actions
repeated as established fact — the standing rule for every collection here.

## Four divisions can have no capital card, and the numbers are left unused

A capital card shades a division and puts a gold dot on a city inside it, and the reader names the city.
For **Beijing, Shanghai, Tianjin and Chongqing** that question answers itself: each is a city that is
itself a provincial-level division, so the shape being shaded IS the city being asked for. Their four
capital numbers — `gc-519`, `gc-523`, `gc-526`, `gc-527` — are therefore never written, exactly as *The
world* leaves seven numbers unused for its city-states.

**The decision is enforced by the data rather than by this paragraph.** `window.CHINA_CAPITALS` has 27
rows and none of them is a municipality, so `add-card.js` refuses such a card outright: "Beijing is not a
provincial capital in china-provinces.js". A plan can be forgotten; a refusal cannot.

## The names

**They follow the census communiqué's own English**, which is the same rule the running order follows and
means the name on a card, the name in the sort and the name in the source are one name. It agrees with
Natural Earth on 29 of the 31 and differs on two, both renamed in the builder: NE's *Inner Mongol* is the
census's **Inner Mongolia**, and NE's *Xizang* — the official romanisation of the Chinese name — is the
census's **Tibet**. Both cards carry the other form in their own prose and in the facts box, since a
reader who has met one and not the other should not be stranded.

**`a` is the ISO 3166-2 suffix** (Guangdong is `GD`, Tibet is `XZ`), which is a published code rather than
an abbreviation somebody chose, and `add-card.js` will match a `map.key` against it as well as against
the name. **`t` is the division's KIND** — Province, Autonomous Region or Municipality — carried in the
layer rather than remembered, because every card in this deck states it in a `Kind` row and it is the one
fact the deck's own question is careful not to assume. It is ISO 3166-2's category as Natural Earth
records it; the builder prints the tally on every run, and it is 22, 5 and 4.

## How the running order was chosen

**By population, largest first** — as asked. It is also a good order for this subject: a learner meets
Guangdong, Shandong and Henan, then works down through the coastal provinces to Qinghai and Tibet, which
is where a shape deck earns its keep. Alphabetical would open on Anhui, Beijing and Chongqing, which is
one province, one city and one city.

**THE ORDER IS FIXED AT PLANNING TIME AND IS NOT RE-SORTED**, for the reason *The world* states at
greater length: a card id is a permanent address — what `data.js` files the card under, what a deck's
`cardIds` lists, what a reader's schedule is keyed by and what a shared study link points at — so
re-sorting would move cards between ids and silently repoint every one of those. The snapshot is:

- **The Seventh National Population Census, 1 November 2020**, Communiqué No. 3, Table 3-1, for all 31.

Two consequences worth knowing rather than discovering. **The 2020 census is five years old** and several
of these figures have moved since; a card's own population figure is researched and cited when the card is
written and is not this snapshot. The snapshot decides the ORDER and nothing else, and the two will drift
apart — that is expected and is not a fault to correct. And **the census's national total is 2,000,000
larger than these 31 added together**, because servicemen are counted in a row of their own rather than
against a province. A card must not present a province's figure as a share of a total that includes them.

## The background is the province's HISTORY, and it never repeats the boxes

The rule *The world* was given in Aug 2026, and it holds here unchanged because the format is shared. A
card carries three things that already say what the place IS — the map, the facts box and the date line —
so a background reciting the same capital, population, area and dates says everything twice. **The
background's job is the place's history**; the boxes carry the figures. Ten sentences on Guangdong should
be Canton and the maritime trade, the Pearl River delta, the treaty port, the emigration, the Special
Economic Zones — not a paragraph restating "Capital: Guangzhou" in prose.

**No checker can see this.** The duplicated sentences are well formed, correctly cited and count the right
number of words.

## Dates, names and spellings

- **Pinyin without tone marks**, which is what the census, the government's own English and the
  scholarship all use: Guangzhou, Xi'an, Ürümqi, Hohhot. The umlaut in Ürümqi and the apostrophe in Xi'an
  are part of the names and are kept. **Check a Commons file URL for `'` before choosing an
  illustration** — `SRC_URL_RX` stops at an apostrophe, so a credit line built on one ships truncated.
- **Where the older romanisation is what a reader has met, the card gives both once**: Canton for
  Guangzhou, Peking for Beijing, Amoy for Xiamen. Once, in the background, and never in the answer —
  **and never as a glossary ALIAS**, which is the trap this collection walks into first. `Guangzhou`
  shipped with `Canton` as an alias for about an hour, and the glossary's auto-linker would then have
  turned every Swiss *canton* on the site into a link to a Chinese city: the word appears nine times in
  `countries.js` and four in `data.js`, in the Swiss and the heraldic senses, and one of them is
  capitalised — "the Confederation of the Thirteen Cantons" — so even `caseSensitive` would not have
  saved it. The alias was dropped and the term keeps the name in its own prose, where it teaches the same
  thing and links nothing. **Before giving a Chinese city its older English name as an alias, grep the
  corpus for that name.** Amoy and Tientsin are safe; Canton, Nanking and Chungking each want the check.
- **BCE and CE**, as everywhere on the site, and **a dynasty or period is dated on first mention where
  the card's own sources carry the date** — a reader of the Geography section has not necessarily read the
  China history collection. Where they do not, name the period and leave it undated rather than reaching
  for a figure from memory: an abstract may carry no parenthetical asides, so a date there is a clause of
  its own and has to be as well sourced as any other. `gc-501` is the standing example — its source dates
  the Han, Tang, Ming and Qing material it describes to no year, so the card says "since the Warring
  States period" and stops.
- **A province's own Chinese name is not carried in the card fields.** `hanzi`/`pinyin`/`traditional`
  exist and render, and the four cards shipped so far leave them empty: a map card's answer is typed into
  a blank, and a reader typing Chinese characters into it is not what this deck is testing.

## Sourcing

Measured from this sandbox on 2026-08-29 rather than assumed, and the shape of it decides what a card can
say. **The bar is the site's: five works per card, each with an openable URL and a marker pointing at
it.**

**What answers.** `stats.gov.cn` — the whole point of it, and the English section carries the census
communiqués, the yearbooks and the annual statistical bulletins with real server-rendered tables.
`cambridge.org/core` answers, which puts *The China Quarterly* and *Modern Asian Studies* within reach and
is the single most useful thing on this list. `europepmc.org`, `persee.fr`, `archive.org`, `nature.com`,
`data.un.org`, `ourworldindata.org` and `history.state.gov` all answer; the recognition guide's China page
is 38 KB of real prose.

**What does not, so that nobody spends the afternoon again.** **Every Chinese government host outside
`stats.gov.cn` refuses the connection** — `gov.cn`, `english.www.gov.cn`, `mnr.gov.cn` and the provincial
portals `gd.gov.cn` and `shandong.gov.cn` all return nothing at all, which is a different fact from a 403
and is recorded as such. `whc.unesco.org` is **403**, so a World Heritage claim needs another work;
`britannica.com` is 403 and is barred by the glossary plan's rule anyway; `sciencedirect.com`,
`tandfonline.com`, `science.org` and `mdpi.com` are 403, and `doi.org` resolving to one of them is a 403
too — **Europe PMC is the way in** where a PMCID exists.

**FOR ANTIQUITY, READ FOLIO'S OWN CORPUS BEFORE SEARCHING THE WEB.** This was written after `gc-002`
as a warning that the reachable set is strong on the treaty century and silent on the Chinese past —
Qufu, Mount Tai and the states of Qi and Lu were all looked for and none could be cited, `whc.unesco.org`
being 403, Persée's search rendering through JavaScript, and Legge's *Chinese Classics* sitting on
archive.org with its Chinese characters so mangled by OCR that the volume cannot be quoted. **`gc-003`
Henan disproved it in an hour, and the route is worth more than the warning was.** The World History
collection's cards on Erlitou, the Xia, the Shang and Longshan already carry cited, open sources on
exactly this ground, and the glossary's `Zhengzhou_Shang_City` carries three more. Reading those source
lists out supplied three of Henan's five: a PLOS ONE study of the province's traditional villages, the
*Genes* paper on the human skull ditch at Zhengzhou Shang City, and Zhang Zhongpei in the *Comptes rendus
de l'Académie des Inscriptions* for Yinxu in 1928 and Erlitou in 1960. **`Asian Perspectives` on
`hdl.handle.net/10125/…` and the French sinology on Persée are both open and both reachable**, which is
the standing answer to "there is no open sinology here".
  Two cautions come with the route. **A source reused from another card is reused for the claim that card
RECORDS; a new claim needs a re-read** — the glossary pass's G6 finding, and every one of Henan's was
re-read. And **a reused paper's loose phrasing must not be inherited**: the villages paper calls Anyang
"the capital of the Shang Dynasty (1600–1046 BCE)", which is the span of the whole dynasty rather than of
Anyang's time as its seat, so `gc-003` says what Anyang preserves and takes its dates from the paper that
excavated them. `gc-002` Shandong still says nothing about Confucius; it was written before this was
known, and its own antiquity is a gap to fill rather than a limit of the sources.

**AN `Asian Perspectives` HANDLE SERVES ONLY THE ABSTRACT — THE PDF IS ONE PATH AWAY.** The route above
named `hdl.handle.net/10125/…` as open, and it is, but the page it resolves to on ScholarSpace shows the
record and the abstract and no text, which reads exactly like a paywall and cost `gc-007` Hunan a
deferral for a round. The full text is fetchable at the legacy DSpace bitstream path
`https://scholarspace.manoa.hawaii.edu/bitstream/10125/<id>/1/<FILENAME>.pdf`, where FILENAME is printed
on the handle page itself and encodes the volume, issue and pages — `AP-v47n2-299-329.pdf` for Zhang and
Hung's survey of the southern Chinese Neolithic, which carried four of Hunan's ten sentences. **The
citation still points at the handle**, which is the stable address a reader should be given; the
bitstream path is how to READ the thing before citing it. That one journal covers the archaeology of
southern China, the Yangtze and the southeast coast, which is most of the ground the remaining province
cards stand on.

**AND AN `Asian Perspectives` PDF MAY STILL DEFEAT EXTRACTION — TEST THE FILE, NOT THE HOST.** The two
papers on the Chengdu Plain sit on the same shelf and behave differently: Lin's 2019 study of the Jinsha
site cluster extracts cleanly and carried five of `gc-505`'s ten sentences, while Flad et al.'s 2013
Songjiaheba report is set in subset fonts with no ToUnicode map and comes out as raw byte codes. That is
the glossary pass's N10 finding in a new place, and it is a property of the FILE rather than of the
journal, so a paper that will not open is not evidence that its neighbour will not.

**A CONSULAR SURVEY IS A PERIOD WITNESS, AND SOMETIMES THE ONLY OPEN ONE.** Nothing openable here
describes the Dujiangyan waterworks: the World Heritage Centre is 403, the modern hydraulic literature is
Elsevier and Springer, and the ICID heritage pages 404. What answered was Alexander Hosie's *Szechwan: Its
Products, Industries and Resources* (Shanghai, 1922) on archive.org — a British consular survey that
states plainly why the Chengdu Plain's water never fails, the Min being divided into a network of streams
and cross-channels where it leaves the mountains at Guanxian. **Cite it for what it describes and not for
what it does not**: Hosie gives no date for the works and none was asserted, so `gc-505` says how they
function and leaves their antiquity to a later card that can source it. This is the ancient-China route
in another coat — where the modern synthesis is closed, the standard older survey is often open.

**AMERICAN DIPLOMATIC HISTORY IS NOT CHINESE HISTORY, AND IT IS OUT OF THIS COLLECTION** (Aug 2026,
on request: "none of the Background sections should contain references to American consulate or
relations, they are not relevant to a collection about China"). Eight shipped cards had leaned on the
Office of the Historian's *Guide to the United States' History of Recognition, Diplomatic, and Consular
Relations* — it is open, it is reachable when almost nothing else is, and it dates a great many things
— and the result was a collection whose backgrounds kept drifting into consulates, legations and
embassies. **That work is now cited by no card in the collection**, and the passages went with it.
**The two Milestones pages stay** where they carry a China-side fact (the Opium Wars, the Washington
Conference), but nothing sourced to them may now mention the United States. The replacement material
came one open-access paper per card, and the lesson for the rest of the deck is the one the sourcing
survey should have drawn earlier: **the easiest open source for a Chinese place is often a source about
somebody else's dealings with it, and that is exactly what this collection must not be made of.** Look
for the modern Chinese-geography literature first; it is thin in places but it is about the place.

**AND SOME PLACES SIMPLY HAVE NO OPEN LITERATURE HERE — SAY SO RATHER THAN STRETCHING.** `gc-506`
Shijiazhuang is the first capital where that bit. Its own history is barely represented in anything
openable: the Zhaozhou Bridge, the Sui-dynasty open-spandrel arch in Zhao County, is described in one
reachable abstract (SciOpen, `10.26599/HTRD.2026.9480097`) that gives the span, the builder and the
date and **never states where the bridge is**, so the card leaves it out rather than asserting the
county. The railway that made the city is the same shape: Kent's 1907 *Railway Enterprise in China* on
archive.org has the Taiyuanfu line joining the Peking-Hankow line at Chengtingfu, which is the reason
the city is where it is, and **no openable source says that Chengtingfu is now part of Shijiazhuang**,
so the card says the two lines meet on that plain and stops. A card that says less and is right beats
one that closes the gap itself.

**`chinadaily.com.cn` answers and is a state newspaper.** It may be cited for what it is — an account the
state gives of itself — and never as an independent one, and a card resting a contested claim on it has
broken the standing rule rather than found a source.

---

# The list

## The provinces and regions — `geo-china-provinces`

Thirty-one cards, in descending order of their 2020 census population. Each shades one division on the
globe and asks which it is; the facts box carries the capital, the population, the area and the division's
own kind (province, autonomous region or municipality).

  gc-001  Guangdong
  gc-002  Shandong
  gc-003  Henan
  gc-004  Jiangsu
  gc-005  Sichuan
  gc-006  Hebei
  gc-007  Hunan
  gc-008  Zhejiang
  gc-009  Anhui
  gc-010  Hubei
  gc-011  Guangxi
  gc-012  Yunnan
  gc-013  Jiangxi
  gc-014  Liaoning
  gc-015  Fujian
  gc-016  Shaanxi
  gc-017  Guizhou
  gc-018  Shanxi
  gc-019  Chongqing
  gc-020  Heilongjiang
  gc-021  Xinjiang
  gc-022  Gansu
  gc-023  Shanghai
  gc-024  Jilin
  gc-025  Inner Mongolia
  gc-026  Beijing
  gc-027  Tianjin
  gc-028  Hainan
  gc-029  Ningxia
  gc-030  Qinghai
  gc-031  Tibet

## The provincial capitals — `geo-china-capitals`

Twenty-seven cards. A capital is numbered 500 higher than its own division, so the two decks pair by
number and `gc-519`, `gc-523`, `gc-526` and `gc-527` are unused — Chongqing, Shanghai, Beijing and
Tianjin are cities that are themselves divisions, and the shape would be the answer.

  gc-501  Guangzhou
  gc-502  Jinan
  gc-503  Zhengzhou
  gc-504  Nanjing
  gc-505  Chengdu
  gc-506  Shijiazhuang
  gc-507  Changsha
  gc-508  Hangzhou
  gc-509  Hefei
  gc-510  Wuhan
  gc-511  Nanning
  gc-512  Kunming
  gc-513  Nanchang
  gc-514  Shenyang
  gc-515  Fuzhou
  gc-516  Xi'an
  gc-517  Guiyang
  gc-518  Taiyuan
  gc-520  Harbin
  gc-521  Ürümqi
  gc-522  Lanzhou
  gc-524  Changchun
  gc-525  Hohhot
  gc-528  Haikou
  gc-529  Yinchuan
  gc-530  Xining
  gc-531  Lhasa
