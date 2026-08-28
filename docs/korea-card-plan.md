# Korea — a 1000-card running order

The plan for `korea`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the sixteenth of these and the eleventh history collection. Read `docs/greece-card-plan.md` first
if this is the first plan you have met; the mechanics are identical and are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `ko-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='ko-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: the ids are `ko-001` … `ko-999`, then `ko-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`ko-421 King Sejong` is already an answer term; `ko-280 Whether Balhae was a Korean state` is an argument
to describe, and the card's actual answer — the word that gets blanked — is chosen while writing it, from
what the sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** When that happens,
change the line here in the same commit as the card, and say so — this file is only useful while it is
true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never invent
a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and its `COLLECTION_ICON` row all ship with the file.

**The id is `korea` and the card prefix is `ko-`**, free of every existing prefix and no prefix of any of
them. **It goes in the History section**, which is `sectionOf`'s default, so no table entry is needed.

**The hue is `#A2726C`, a muted clay**, MEASURED in CIELAB against all twenty-two hues on the shelf
inside the band they occupy (L\* 28–55, chroma 7–62), as every hue above it was. It stands **23.3 from
World History's sepia, 23.6 from Psychology's plum and 24.0 from the Mandarin decks' red**, at L\* 53 and
chroma 21, and 4.1:1 against white — clear of the shelf's **median nearest-neighbour distance of 22.7**
and nearly double its **tightest existing pair of 12.9**. It is one step off its own family's optimum
(`#a87872`, 23.9, at the very top of the lightness band), given up for contrast, which is the trade
Psychology's comment records.

**The whole-wheel optimum is the magenta again, at 32.4, and it is rejected for the fifth time** on the
grounds the Dinosaurs comment states as a standing note: at chroma 62 it is the loudest thing that could
go on a shelf whose register is muted throughout. That note said the next collection should expect to
argue for a distance nearer the median than the maximum, and this one does not have to — but only
because the family it lands in is the one nobody had swept.

**The aptness is real, and two families that would have been MORE apt were measured and refused.** This
is roughly the colour of *hwangto*, the red-ochre loess of Korean soil, of Joseon earthenware and of the
oiled pillars of a hanok; it is also the muted end of the taegeuk's own red, and the sweep of that whole
hue band (15°–40°) returns this candidate as its best, so aptness and measurement agree here rather than
being traded off. What does not survive is **Goryeo celadon**, whose best in-band candidate at a real
chroma of 18–30 scores **19.4 — and its nearest neighbour is Biology's dark forest green, not Egypt's
malachite**, which is the collision nobody would have predicted; and **indigo *jjok***, whose best muted
candidate scores **22.4** against a French language deck. Both are below the median. A grey-green at
chroma 7 scores 27.4 and a periwinkle at chroma 62 scores 24.0, and neither is the colour it is named
after. **The wheel is nearly full**, and what is left of it is narrow.

**It gets a `COLLECTION_ICON` row and a new symbol, `taegeuk`** — the circle divided by an S, which is
the device at the centre of the Korean flag. Two other marks were considered and neither survives the
size a deck row draws at: a **hanok roof** with upswept eaves is, at 28px, China's pagoda, which sits
directly beside it on this shelf, and a **moon jar** is a circle.

**Two things make the drawn mark Korean rather than generally East Asian, and one of them is the part to
keep.** It carries **no dots** — those belong to the Taoist *taijitu* — and its dividing S runs on an
axis **tilted 33° off the horizontal**, which is roughly how the device sits on the flag, red above the
curve and blue below it. Four orientations were
rendered at 24, 28, 34 and 64px beside the pagoda, the globe, the torii, the coin and the compass, and
the vertical-axis version reads most crisply at the smallest size **and is the Chinese arrangement**,
which on a shelf carrying a pagoda is the one reading to avoid. The tilt costs a little legibility at
24px and buys the whole point of the mark.

## What this collection is about, and the five scope decisions

**It is the history of the Korean peninsula from the Palaeolithic to the present, and after 1948 that
means both states.** Five thousand years of one country and eighty of two is an awkward shape for a
collection and it is the true one; the plan's job is to stop the last eighty crowding out the rest, and
to stop the rest being written as a prologue to them.

**First: North Korea gets thirty-five cards and is not a curiosity.** `ko-dprk` is the same size as
`ko-rok`, because the DPRK is a state of twenty-six million people with seventy-five years of history,
and because the alternative — a handful of cards about nuclear weapons and a dynasty — is the caricature
rather than the history. **The evidence problem is carded rather than worked around**: `ko-813`,
`ko-814` and `ko-815` are about what can be known, how defector testimony is used and what information
control does to the record, so a reader meets the epistemics before the claims.

**Second: NO STATE'S ACCOUNT OF ITS OWN ACTIONS IS REPEATED AS ESTABLISHED FACT, and this collection has
four states doing it.** The rule is the Russia plan's and it works harder here than anywhere on the
shelf. The DPRK's official history — the Baekdu bloodline, the guerrilla record, the origins of the war
— is a state's account and is carded as one (`ko-698` on the record of Kim Il-sung's guerrilla activity,
`ko-819` on North Korean historiography, `ko-820` on reading North Korean sources). So is the ROK's older
anti-communist historiography, and so is the **Japanese colonial scholarship** that shaped how Korean
history was written for a generation (`ko-726`, `ko-727`, with `ko-728` on the postcolonial revision).
And so are the **Chinese state's claims about Goguryeo** through the Northeast Project (`ko-133`).
**Carding a dispute is not adjudicating it** —
but where the scholarship outside the disputing states has reached a conclusion, the card says what that
is, and where it has not, it says that instead.

**Third: the colonial period is carded from inside Korea, and the two hardest subjects are carded
directly.** Forced labour (`ko-677`) and the **comfort women system** (`ko-681`, with `ko-682` on the
historical record specifically) are not footnotes and not left out. They are live diplomacy between Seoul
and Tokyo, which is exactly why the card gives the documented record, the range of estimates with whose
they are, and the shape of the argument — and does not settle the present-day dispute. **The colonial
modernity debate** (`ko-684`) is carded as the historiographical argument it is: growth figures and
brutality are not alternatives, and a card that uses one to answer the other has taken a side by
changing the subject.

**Fourth: the Korean War's contested facts are given as contested.** Origins, casualty figures and
atrocities are all argued about, and the atrocities were committed on both sides — `ko-752` the war's
origins, `ko-777` No Gun Ri, `ko-778` the Bodo League massacre, `ko-779` the killings in the north. The
standing rule: **give the
range, name whose it is, and never state the highest or lowest figure flat.** Civilian deaths in this war
are estimated across a very wide band and the band is the fact.

**Fifth: the culture deck is 120 cards and is not decoration.** `ko-culture` carries the language and
Hangul, religion, art, literature, music, food and daily life — including the contemporary Korean Wave,
which is the reason a large share of this collection's readers will have arrived. **It sits last and it
is carded as culture rather than as export**: `ko-1000` is the Korean diaspora, not a chart position.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Early Korea | The land and its people | 20 | ko-001–020 |
|  | Prehistoric Korea | 25 | ko-021–045 |
|  | Gojoseon | 25 | ko-046–070 |
|  | The commanderies and the proto-Three Kingdoms | 20 | ko-071–090 |
| The Three Kingdoms | The Three Kingdoms period | 15 | ko-091–105 |
|  | Goguryeo | 30 | ko-106–135 |
|  | Baekje | 25 | ko-136–160 |
|  | Silla | 25 | ko-161–185 |
|  | Gaya | 15 | ko-186–200 |
|  | Religion, art and society | 15 | ko-201–215 |
| Unified Silla and Balhae | The unification wars | 20 | ko-216–235 |
|  | Unified Silla | 30 | ko-236–265 |
|  | Balhae | 15 | ko-266–280 |
|  | The fall of Silla and the Later Three Kingdoms | 10 | ko-281–290 |
| Goryeo | The founding of Goryeo | 20 | ko-291–310 |
|  | Goryeo government and society | 25 | ko-311–335 |
|  | Goryeo Buddhism and culture | 30 | ko-336–365 |
|  | The military regimes and the Mongol invasions | 20 | ko-366–385 |
|  | Late Goryeo | 15 | ko-386–400 |
| Early Joseon | The founding of Joseon | 20 | ko-401–420 |
|  | Sejong and the fifteenth century | 30 | ko-421–450 |
|  | The Confucian state | 25 | ko-451–475 |
|  | Science, technology and learning | 20 | ko-476–495 |
|  | The Imjin War | 25 | ko-496–520 |
| Later Joseon | Recovery and the Manchu invasions | 20 | ko-521–540 |
|  | Factional politics and the late Joseon court | 25 | ko-541–565 |
|  | Silhak and new learning | 20 | ko-566–585 |
|  | Society and economy in later Joseon | 25 | ko-586–610 |
|  | Crisis and opening | 20 | ko-611–630 |
| Empire, Colony and Division | The Korean Empire and annexation | 25 | ko-631–655 |
|  | Colonial rule | 30 | ko-656–685 |
|  | Resistance and the independence movement | 25 | ko-686–710 |
|  | Colonial society and its legacies | 20 | ko-711–730 |
|  | Liberation and division | 20 | ko-731–750 |
| The Korean War and the Two Koreas | The Korean War | 35 | ko-751–785 |
|  | North Korea | 35 | ko-786–820 |
|  | South Korea | 35 | ko-821–855 |
|  | Division, diplomacy and reunification | 25 | ko-856–880 |
| Korean Culture and Society | The Korean language and Hangul | 25 | ko-881–905 |
|  | Religion and belief | 20 | ko-906–925 |
|  | Art, architecture and craft | 25 | ko-926–950 |
|  | Literature, music and performance | 25 | ko-951–975 |
|  | Food, family and daily life | 25 | ko-976–1000 |

Deck totals: Early Korea 90 · The Three Kingdoms 125 · Unified Silla and Balhae 75 · Goryeo 110 · Early Joseon 120 · Later Joseon 110 · Empire, Colony and Division 120 · The Korean War and the Two Koreas 130 · Korean Culture and Society 120. **1000.**

## What the weighting is arguing

Six decks take the peninsula from the Palaeolithic to the Sino-Japanese War and hold **630 cards**; the
next two take it from the Gabo Reforms of 1894 to the present and hold **250**; the culture deck holds
**120** and belongs to no century. So a third of the chronological running order is spent on a hundred
and thirty of the five thousand years, and it is worth saying out loud why rather than letting the
numbers imply it.

**The record is not flat and a plan that pretends it is teaches a shape the sources cannot support.**
For the fourth century there are a handful of stelae, a Chinese annal and an archaeology; for the
twentieth there are two states' archives, a war fought by twenty countries, and a scholarship still
being argued. A collection that gave Goguryeo and the Park Chung-hee era the same thirty cards would
either invent detail about the one or throw it away about the other.

**And a modern deck is not the same as a modern bias.** What this plan refuses is not the weighting but
the direction of reading: the earlier decks are not a run-up. `ko-291 Goryeo` is not there to explain
`ko-887 Hangul`, and Silla's bone-rank system is not carded because it prefigures anything. Each period
is written as a place people lived in.

The one deck whose size is arithmetic rather than judgement is **The Three Kingdoms at 125**, the
largest pre-modern deck on the shelf. It is four polities, not one: Goguryeo, Baekje, Silla and Gaya
each get their own subdeck, and twenty-five to thirty cards apiece is thinner than it looks.

## Six decisions this plan forced on the tree

**One: Gaya is a subdeck, not a paragraph inside Silla.** Fifteen cards, beside Goguryeo's thirty and
twenty-five each for Baekje and Silla. The period's own name comes from the *Samguk sagi* — *samguk* is *three
kingdoms* — so filing Gaya under the kingdom that absorbed it would let a twelfth-century title decide a
fourth-century tree. It is small because the evidence is small, not because it is an appendix.

**Two: Balhae shares a deck with Unified Silla and the deck is named for both.** The alternative names
are the argument: calling the period *Northern and Southern States* asserts that Balhae was Korean, and
calling it *Unified Silla* asserts that the unification was complete. `ko-279` cards how Korean, Chinese
and Russian historiography each place Balhae, and `ko-280` cards the question itself — **whether Balhae
was a Korean state is a line in the list, not an assumption in the deck names.**

**Three: Joseon is split at the Imjin War, not at a reign.** Five centuries is too long for one deck and
the obvious cut is dynastic; the cut this plan takes is the one the society experienced. Early Joseon
runs to 1598 and Later Joseon opens on the recovery and the Manchu invasions, so the seven years that
emptied the countryside and burned the registers sit at the seam rather than in the middle of a deck.

**Four: culture is a deck at the end, and period-specific culture stays in its period.** `ko-culture`
carries what runs across the whole history — the language, the food, the family, the religions, the
diaspora. What belongs to one century stays there: the Three Kingdoms' Buddhism and tomb art are
`ko-201`–`ko-215`, Goryeo's celadon and the Tripitaka are in `ko-goryeo-culture`, Sejong's instruments
are in his own subdeck. **The test is whether a card would read the same in any century.** If it would,
it is culture; if it would not, it is history and stays put.

**Five: North and South get thirty-five cards each, and the relation between them gets twenty-five of
its own.** Inter-Korean relations filed under either state becomes that state's account of them, which
is exactly what the second scope rule forbids; `ko-reunification` is where the division, the summits,
the Kaesong complex and the family reunions live, and it is a subdeck rather than a tail on `ko-rok`.

**Six: the collection opens on the land and not on a founding myth.** `ko-land` is twenty cards of
geography, seas, mountains and where the people came from. Dangun is at `ko-047`, in Gojoseon, where he
belongs — and he is carded three times, as **the myth** (`ko-047`), as **a historical claim**
(`ko-048`) and as **a modern national symbol** (`ko-061`), because those are three different subjects
and running them together is how a foundation myth gets taught as a date.

## History, not commemoration — and the pulls

The standing rules apply and one of them does more work here than anywhere on the shelf: **no state's
account of its own actions is repeated as established fact, in any direction.** Four states are making
such accounts about this peninsula and all four are carded as accounts. **A contested figure is given as
a range with whose it is**, never the highest or lowest stated flat — the Korean War's civilian dead and
the number of women taken into the comfort stations are both estimated across very wide bands, and in
both cases the band is the fact. **Modern scholars are capped at two per collection**, and this
collection spends **one**: `ko-703 Sin Chaeho and nationalist history`, because his account became a
political programme. The second is deliberately unspent — the other historiographical cards name
schools, states and projects rather than people, which is the right level for them.

Five pulls will bend a card if nobody is watching for them.

**The national pull.** Korean history is conventionally written as the history of a single *minjok*, one
people continuous from Dangun to the present, and that framing is itself a product of the colonial
period it was forged against. It is a subject here (`ko-060`, `ko-061`, `ko-701`, `ko-703`), not a
voice. **Write about the peninsula's states, not about a nation that outlives them all.**

**The colonial pull, which runs both ways.** Japanese colonial scholarship argued that Korea was
stagnant, factional and dependent, and needed Japan to modernise it; the postcolonial answer inverted
each claim. Both are carded (`ko-726`–`ko-728`), and **the answer to a colonial thesis is the evidence,
not the mirror image.** `ko-684` on colonial modernity is the sharpest case: growth figures and
brutality are not alternatives, and a card that answers one with the other has changed the subject.

**The two states' pull.** Both Koreas write the twentieth century as their own legitimacy, and each has
a whole apparatus for it. `ko-857` cards the two claims side by side; `ko-819` and `ko-820` card DPRK
historiography and how to read a North Korean source; the ROK's older anti-communist historiography is
in `ko-726`'s neighbourhood and in `ko-725` on the reckoning with collaborators that did not happen.

**The Korean Wave pull.** A great many readers will arrive from `ko-974` and `ko-975`, and the
temptation is to write the previous nine hundred cards as their prologue. Refuse it. `ko-971`–`ko-975`
are five cards in a deck of a hundred and twenty, and the culture deck ends on `ko-1000 The Korean
diaspora` rather than on a chart position.

**The bridge pull.** Korea is routinely described as a bridge between China and Japan — a formula that
makes a country's history a fact about its neighbours'. Transmission is real and is carded where it
happened (Baekje and the Japanese court, the Tripitaka, printing, Neo-Confucianism), **but a card whose
subject is what Korea passed on has to be a card about Korea passing it on**, not about the recipient.

## Names, romanisation and dates

**Revised Romanization is the default** — Joseon, Goryeo, Silla, Gaya, Gyeongju, Jeju, Hangul — because
it is what South Korean institutions, museums and signage now use and what a reader will meet if they
look anything up. **McCune–Reischauer is what most of the scholarship is written in** (Chosŏn, Koryŏ,
Kyŏngju), so a card citing an older work will meet the other spelling in its own citation; that is
fine and is not to be silently normalised inside a quoted title.

**The exception is a name overwhelmingly established in English, which keeps its English form**: Seoul,
Pyongyang, Syngman Rhee, Park Chung-hee, Kim Il-sung, Yi Sun-sin, Chun Doo-hwan. **The rule is what a
reader will recognise, not what a table says**, and where the two spellings are both current the card
gives the other one once and moves on.

**Korean names are family name first** — Kim Il-sung is Kim; Yi Sun-sin is Yi — and the card should not
invert them to suit English word order. The surname **Yi** is romanised *Lee* by most of the people who
carry it and *Rhee* by one of them; use the form the person used.

**Dates before 1896 are lunar-calendar dates converted, and the conversion is not always clean.** Joseon
used the Chinese lunisolar calendar until the Gregorian calendar was adopted on 1 January 1896, so a
day-precise date from before then may be a lunar date presented as if it were Gregorian. **Where a
source gives a lunar date, say so or give the year alone**; a spuriously precise day is the same fault
as an invented one. Reign years are given as reign years where that is how the source counts.

**A period name is a convention and several of these are contested.** *Three Kingdoms* undercounts,
*Unified Silla* overstates, *Later Three Kingdoms* is a window of barely forty years, and the *Korean
Empire* of 1897–1910 is a thirteen-year state that most narratives fold into the annexation. Use them —
they are what the reader will meet — and card the convention where it does work (`ko-091`, `ko-280`).

## Sourcing

**Measured from this sandbox on 2026-08-28** — hosts move, so re-measure rather than trusting this list,
exactly as `docs/citation-plan.md`'s survey says.

**What answers with real content.** The Office of the Historian's recognition guide has
`history.state.gov/countries/korea` — which carries 1882 for the Treaty of Amity and Commerce and
**1905 for the end of diplomatic relations, with the date the American legation closed** — and
`countries/korea-south`; its Korean War milestone at `/milestones/1945-1952/korean-war` is real prose.
**There is no page for North Korea, and that absence is itself the fact the guide records**: the United
States has never recognised the DPRK, so a state whose whole history is in the modern decks is invisible
to Phase 3's most reliable source, exactly as `Taiwan` was. The **National Museum of Korea** serves
English pages under `www.museum.go.kr/site/eng/`; **38 North** answers for DPRK analysis; `archive.org`
answers and is searchable through `advancedsearch.php`.

**Two more 200-status error documents, which is the trap this survey exists for.** `www.jstor.org`
returns **200 with a 3 KB "Client Challenge"** page, and `muse.jhu.edu` returns **200 with "Verification
required!"** — so a script checking status codes will record both as reachable and every citation
written from them will be a citation nobody can open. **Grep the body for a word the article must
contain**, as the artefact plan's archive.org rule already says.

**What is shut.** `db.history.go.kr` (the National Institute of Korean History's database) answers
**400**; `english.cha.go.kr` and `www.khs.go.kr/eng` refuse the connection though the Korea Heritage
Service's root answers; `www.ohchr.org` is **403**, which closes the UN Commission of Inquiry report on
the DPRK; `www.tandfonline.com` is 403; `www.loc.gov` item paths are 403; `whc.unesco.org` is 403, as
already recorded. `folkency.nfm.go.kr` and `www.nl.go.kr` answer 200 and serve a JavaScript shell with
no prose in the HTML.

**The loss that matters most is `digitalarchive.wilsoncenter.org`, which refuses the connection.** The
Wilson Center's digital archive is the standard open collection of translated Soviet, Chinese and
North Korean documents on the war and on the DPRK, and without it the modern decks lose their best
primary source. **Say so on the card rather than reaching for a weaker claim**: where the document
cannot be opened, the card describes what the scholarship says about it and cites the scholarship.

**Two cautions specific to this collection.** A paywalled article is usually open at its **Europe PMC**
copy or in a university repository — the route `docs/glossary-citation-plan.md` records — and an
archive.org identifier must be **curled before it is cited**, never written from memory. And the
out-of-copyright Western books on Korea (Hulbert, Griffis, Gale and their contemporaries) are on
archive.org in full and are **evidence about their authors at least as much as about Korea**: they were
written by missionaries and by men in the employ of one government or another during the years the
peninsula was being taken, and a card that cites one is citing a colonial-era source. Use them for what
they witnessed, name what they were, and do not let them carry a judgement.

## Living beside the other collections

**Six card titles are shared with collections already planned, and every one of them is deliberate.**
Three with Japan — `ko-646`/`jp-648` *The Japanese protectorate over Korea*, `ko-664`/`jp-716`
*Industrialisation in colonial Korea*, `ko-686`/`jp-721` *The Korean independence movement* — one with
the Second World War (`ko-856`/`ww2-957` *The division of Korea*), and two with World History
(`ko-291`/`wh-540` *Goryeo*, `ko-887`/`wh-725` *Hangul*).

**Write the pair deliberately, from the side the collection is about.** Japan's `jp-716` is a card about
what the Japanese empire built and why; Korea's `ko-664` is a card about what it did to the country it
was built in, and the two are not the same card with the nouns moved. The World History pair is
different again: `wh-540` and `wh-725` are one card each on a subject Korea gives twenty and
twenty-five, so the Korean versions are narrower and the World History ones are the survey.

**The glossary is nearly empty for this subject and that is the useful finding.** Checked against the
live `glossary.js`: **not one of the thousand topics matches an existing key.** What exists nearby is
`North_Korea`, `South_Korea`, `Japan`, `China`, `Mongolia`, `Longshan_culture` and `Rice_domestication`
— five of them country terms from Phase 3 of the citation pass — and **there is no `Korea`**, which is
the first thing `ko-001` will need. Every other term this collection uses is written from nothing, at
the bar, in the same commit as its card. Expect the glossary to grow faster here than anywhere since
Greece.

**Two surface collisions to watch when writing those terms.** `Han` is the Chinese dynasty, the Han
commanderies, the Han River through Seoul and the *han* of Korean aesthetics; `Jin` is already two
different Chinese states in the tree. **Give the narrower thing its own key and let the broader one take
the short alias**, and use `GLOSSARY_CASESENSITIVE` where a one-word Korean term is also an everyday
English word.

**The Library already holds the Joseon curriculum.** The *Analects*, the *Book of Rites*, the *Book of
Documents* and the *Classic of Poetry* are all on Folio's shelf, and they are exactly the texts a Joseon
examination candidate spent his life on. **`card.quote` is worth reaching for in `ko-confucian` and
`ko-sejong`** — a card about the examination curriculum can quote the curriculum. There is no Korean
text in the Library; if one is ever added, the front matter rule applies and `docs/library-books.md` is
where its findings go.

---
# The list

## Early Korea

### The land and its people — `ko-land`

    ko-001  Korea
    ko-002  The Korean peninsula
    ko-003  The geography of Korea
    ko-004  Korea's mountains and rivers
    ko-005  The Korean climate
    ko-006  Korea's position between China and Japan
    ko-007  The seas around Korea
    ko-008  Korea's natural resources
    ko-009  The regions of Korea
    ko-010  Seoul and its setting
    ko-011  Pyongyang and its setting
    ko-012  The origins of the name Korea
    ko-013  The Korean people
    ko-014  The origins of the Korean population
    ko-015  The Korean language and its relatives
    ko-016  Korea's historical borders
    ko-017  The Amnok and Duman rivers
    ko-018  Jeju Island
    ko-019  Dokdo and the islands question
    ko-020  How Korean history is periodised

### Prehistoric Korea — `ko-prehistory`

    ko-021  The Palaeolithic in Korea
    ko-022  Jeongok-ri and the Korean hand axe
    ko-023  The Korean Neolithic
    ko-024  Jeulmun pottery
    ko-025  Neolithic settlement in Korea
    ko-026  Amsa-dong
    ko-027  Early agriculture in Korea
    ko-028  The arrival of rice in Korea
    ko-029  The Korean Bronze Age
    ko-030  Mumun pottery
    ko-031  Bronze Age society in Korea
    ko-032  Korean bronze daggers
    ko-033  Dolmens
    ko-034  The Korean dolmen sites
    ko-035  Bronze Age burial in Korea
    ko-036  The Songgungni culture
    ko-037  The introduction of iron to Korea
    ko-038  Iron Age Korea
    ko-039  Shell middens and coastal life
    ko-040  Rock art in Korea
    ko-041  Bangudae petroglyphs
    ko-042  Prehistoric Korea and its neighbours
    ko-043  Contacts with the Liaodong region
    ko-044  Contacts with the Japanese archipelago
    ko-045  What archaeology can and cannot say about early Korea

### Gojoseon — `ko-gojoseon`

    ko-046  Gojoseon
    ko-047  The Dangun foundation myth
    ko-048  The Dangun myth as history
    ko-049  Gojoseon in the Chinese sources
    ko-050  The location of Gojoseon
    ko-051  Gojoseon society
    ko-052  The eight prohibitions
    ko-053  Gija Joseon and the Gija tradition
    ko-054  Wiman Joseon
    ko-055  Wiman's seizure of power
    ko-056  Gojoseon and the Yan state
    ko-057  Gojoseon's trade
    ko-058  The Han conquest of Gojoseon
    ko-059  The fall of Wanggeom-seong
    ko-060  Gojoseon in Korean national memory
    ko-061  Dangun in modern Korea
    ko-062  The Gojoseon debate in North and South
    ko-063  Bronze culture and the Gojoseon question
    ko-064  Buyeo
    ko-065  Buyeo society and kingship
    ko-066  Okjeo and Dongye
    ko-067  The Samhan
    ko-068  Mahan, Jinhan and Byeonhan
    ko-069  Samhan society
    ko-070  The early Korean states compared

### The commanderies and the proto-Three Kingdoms — `ko-commanderies`

    ko-071  The Han commanderies
    ko-072  Lelang
    ko-073  Lelang's archaeology
    ko-074  Chinese influence through the commanderies
    ko-075  The commanderies in Korean historiography
    ko-076  The fall of the commanderies
    ko-077  The proto-Three Kingdoms period
    ko-078  State formation in early Korea
    ko-079  Chiefdoms to kingdoms
    ko-080  Early Korean kingship
    ko-081  Walled-town states
    ko-082  The horse-riding peoples of the north
    ko-083  Early Korean warfare
    ko-084  Early Korean metalworking
    ko-085  Early Korean burial mounds
    ko-086  Shamanism in early Korea
    ko-087  The Samguk sagi as a source
    ko-088  The Samguk yusa as a source
    ko-089  Chinese records of early Korea
    ko-090  The problems of the early Korean sources

## The Three Kingdoms

### The Three Kingdoms period — `ko-tk`

    ko-091  The Three Kingdoms of Korea
    ko-092  The rise of the three kingdoms
    ko-093  The Three Kingdoms in Chinese sources
    ko-094  Warfare between the three kingdoms
    ko-095  Diplomacy with China
    ko-096  The tributary system
    ko-097  The three kingdoms and Japan
    ko-098  Aristocratic society in the Three Kingdoms
    ko-099  Kingship in the Three Kingdoms
    ko-100  Law codes and administration in the Three Kingdoms
    ko-101  The introduction of Buddhism to Korea
    ko-102  The introduction of Confucian learning to Korea
    ko-103  Writing and Chinese characters in Korea
    ko-104  The Three Kingdoms economy
    ko-105  Why there were three kingdoms

### Goguryeo — `ko-goguryeo`

    ko-106  Goguryeo
    ko-107  The founding of Goguryeo
    ko-108  Jumong and the Goguryeo foundation myth
    ko-109  Early Goguryeo expansion
    ko-110  Goguryeo and the Han commanderies
    ko-111  King Gwanggaeto
    ko-112  The Gwanggaeto Stele
    ko-113  King Jangsu
    ko-114  The move to Pyongyang
    ko-115  Goguryeo at its height
    ko-116  Goguryeo's northern frontier
    ko-117  Goguryeo government
    ko-118  Goguryeo society
    ko-119  Goguryeo's military
    ko-120  Goguryeo fortresses
    ko-121  Goguryeo tomb murals
    ko-122  What the tomb murals show
    ko-123  Goguryeo Buddhism
    ko-124  Goguryeo and the Sui invasions
    ko-125  The Battle of Salsu
    ko-126  Eulji Mundeok
    ko-127  The Tang invasions of Goguryeo
    ko-128  Yeon Gaesomun
    ko-129  The siege of Ansi Fortress
    ko-130  The fall of Goguryeo
    ko-131  Goguryeo refugees and successor movements
    ko-132  Goguryeo's legacy in Korea
    ko-133  The Northeast Project and the Goguryeo dispute
    ko-134  Goguryeo archaeology today
    ko-135  Goguryeo's place in Korean identity

### Baekje — `ko-baekje`

    ko-136  Baekje
    ko-137  The founding of Baekje
    ko-138  Onjo and the Baekje foundation myth
    ko-139  Hanseong Baekje
    ko-140  Baekje's fourth-century expansion
    ko-141  King Geunchogo
    ko-142  Baekje and the Chinese southern dynasties
    ko-143  Baekje's loss of the Han River
    ko-144  The move to Ungjin
    ko-145  The move to Sabi
    ko-146  King Muryeong
    ko-147  The Tomb of King Muryeong
    ko-148  Baekje government
    ko-149  Baekje society
    ko-150  Baekje Buddhism
    ko-151  Baekje art
    ko-152  The Baekje Gilt-bronze Incense Burner
    ko-153  Baekje architecture
    ko-154  Baekje and Japan
    ko-155  Baekje's transmission of Buddhism to Japan
    ko-156  Wani and the transmission of writing to Japan
    ko-157  Baekje's alliance politics
    ko-158  The fall of Baekje
    ko-159  The Baekje restoration movement
    ko-160  The Battle of Baekgang

### Silla — `ko-silla`

    ko-161  Silla
    ko-162  The founding of Silla
    ko-163  Bak Hyeokgeose and the Silla foundation myth
    ko-164  Early Silla kingship
    ko-165  The Silla royal houses
    ko-166  The bone-rank system
    ko-167  King Beopheung
    ko-168  The adoption of Buddhism in Silla
    ko-169  Ichadon's martyrdom
    ko-170  King Jinheung
    ko-171  Silla's expansion into the Han River basin
    ko-172  The Jinheung stelae
    ko-173  The hwarang
    ko-174  Silla government
    ko-175  Silla society
    ko-176  Queen Seondeok
    ko-177  Cheomseongdae
    ko-178  Silla gold crowns
    ko-179  Silla tombs
    ko-180  Silla Buddhism
    ko-181  Hwangnyongsa
    ko-182  Silla and the Tang alliance
    ko-183  Kim Chunchu
    ko-184  Kim Yusin
    ko-185  Why Silla unified the peninsula

### Gaya — `ko-gaya`

    ko-186  Gaya
    ko-187  The Gaya confederacy
    ko-188  Geumgwan Gaya
    ko-189  Daegaya
    ko-190  Gaya iron
    ko-191  Gaya's trade networks
    ko-192  Gaya pottery
    ko-193  Gaya tombs
    ko-194  Gaya and Japan
    ko-195  The Mimana controversy
    ko-196  Gaya's absorption by Silla
    ko-197  Gaya in the sources
    ko-198  Gaya archaeology
    ko-199  Why Gaya did not become a kingdom
    ko-200  Gaya's legacy

### Religion, art and society — `ko-tk-culture`

    ko-201  Buddhism in the Three Kingdoms
    ko-202  Buddhist art of the Three Kingdoms
    ko-203  The Pensive Bodhisattva
    ko-204  Temple building in the Three Kingdoms
    ko-205  Shamanism and folk belief in early Korea
    ko-206  Ancestor worship in early Korea
    ko-207  Confucian learning in the Three Kingdoms
    ko-208  The Taehak
    ko-209  Music and dance in the Three Kingdoms
    ko-210  The gayageum
    ko-211  Costume and ornament in the Three Kingdoms
    ko-212  Three Kingdoms metalwork
    ko-213  Three Kingdoms ceramics
    ko-214  Everyday life in the Three Kingdoms
    ko-215  Women in Three Kingdoms society

## Unified Silla and Balhae

### The unification wars — `ko-unification`

    ko-216  The unification of the peninsula
    ko-217  The Silla-Tang alliance
    ko-218  The conquest of Baekje
    ko-219  The conquest of Goguryeo
    ko-220  The Tang plan for Korea
    ko-221  The Silla-Tang War
    ko-222  The Battle of Maeso Fortress
    ko-223  The Battle of Gibeolpo
    ko-224  Silla's expulsion of the Tang
    ko-225  The limits of unification
    ko-226  What unification did not include
    ko-227  The northern territories after unification
    ko-228  The unification in Korean memory
    ko-229  Unification and Korean identity
    ko-230  Was it a unification or a conquest
    ko-231  Refugees and resettlement after the wars
    ko-232  The absorption of Baekje and Goguryeo elites
    ko-233  The new Silla state
    ko-234  Rebuilding after the unification wars
    ko-235  Unification as a turning point

### Unified Silla — `ko-unifiedsilla`

    ko-236  Unified Silla
    ko-237  King Munmu
    ko-238  The underwater tomb of King Munmu
    ko-239  King Sinmun
    ko-240  Unified Silla government
    ko-241  The nine provinces
    ko-242  The five secondary capitals
    ko-243  Silla's land system
    ko-244  The Silla village register documents
    ko-245  Gyeongju
    ko-246  The Silla capital's plan
    ko-247  Unified Silla society
    ko-248  The bone-rank system in decline
    ko-249  The head-rank six
    ko-250  Choe Chiwon
    ko-251  Silla scholars in Tang China
    ko-252  The state examination in Silla
    ko-253  Unified Silla Buddhism
    ko-254  Wonhyo
    ko-255  Uisang
    ko-256  Hwaeom Buddhism in Korea
    ko-257  Bulguksa
    ko-258  Seokguram
    ko-259  The Dabotap and Seokgatap
    ko-260  The Pure Land movement in Silla
    ko-261  Seon Buddhism enters Korea
    ko-262  The Nine Mountain Schools
    ko-263  Silla trade and the sea
    ko-264  Jang Bogo
    ko-265  Silla's decline

### Balhae — `ko-balhae`

    ko-266  Balhae
    ko-267  The founding of Balhae
    ko-268  Dae Joyeong
    ko-269  Balhae and Goguryeo
    ko-270  Balhae government
    ko-271  Balhae society
    ko-272  Balhae's five capitals
    ko-273  Balhae and the Tang
    ko-274  Balhae and Japan
    ko-275  Balhae culture
    ko-276  Balhae archaeology
    ko-277  The fall of Balhae
    ko-278  Balhae refugees in Goryeo
    ko-279  Balhae in Korean, Chinese and Russian historiography
    ko-280  Whether Balhae was a Korean state

### The fall of Silla and the Later Three Kingdoms — `ko-latertk`

    ko-281  The decline of Unified Silla
    ko-282  Peasant rebellions in late Silla
    ko-283  The rise of local strongmen
    ko-284  The Later Three Kingdoms
    ko-285  Later Baekje and Gyeon Hwon
    ko-286  Taebong and Gung Ye
    ko-287  Wang Geon's rise
    ko-288  The reunification of the peninsula
    ko-289  The surrender of Silla
    ko-290  The end of the Silla dynasty

## Goryeo

### The founding of Goryeo — `ko-goryeo-found`

    ko-291  Goryeo
    ko-292  Wang Geon
    ko-293  The founding of Goryeo
    ko-294  The Ten Injunctions
    ko-295  Goryeo's marriage politics
    ko-296  The absorption of Silla and Later Baekje
    ko-297  Goryeo's northern expansion
    ko-298  The naming of Goryeo and the word Korea
    ko-299  King Gwangjong
    ko-300  The slave review act
    ko-301  The introduction of the civil service examination
    ko-302  King Seongjong of Goryeo
    ko-303  Choe Seungno's memorial
    ko-304  The Confucian reorganisation of the Goryeo state
    ko-305  Goryeo's early institutions
    ko-306  The capital at Gaegyeong
    ko-307  Goryeo and the Khitan
    ko-308  The Khitan invasions
    ko-309  Seo Hui's diplomacy
    ko-310  The Battle of Gwiju

### Goryeo government and society — `ko-goryeo-state`

    ko-311  Goryeo government
    ko-312  The Goryeo bureaucracy
    ko-313  The Goryeo aristocracy
    ko-314  The examination system in Goryeo
    ko-315  Hereditary privilege and the protection appointment
    ko-316  The Goryeo land system
    ko-317  The Jeonsigwa
    ko-318  Goryeo taxation
    ko-319  Goryeo local administration
    ko-320  Goryeo's special administrative districts
    ko-321  Goryeo society and status
    ko-322  Slavery in Goryeo
    ko-323  Women and property in Goryeo
    ko-324  Marriage and family in Goryeo
    ko-325  Goryeo law
    ko-326  The Goryeo military
    ko-327  The Goryeo economy
    ko-328  Goryeo trade
    ko-329  Foreign merchants at Byeongnando
    ko-330  Goryeo currency
    ko-331  Goryeo agriculture
    ko-332  Goryeo cities
    ko-333  Goryeo and the Song
    ko-334  Goryeo and the Jurchen
    ko-335  Yun Gwan's northern campaign

### Goryeo Buddhism and culture — `ko-goryeo-culture`

    ko-336  Buddhism in Goryeo
    ko-337  The state and the Buddhist church in Goryeo
    ko-338  Buddhist monasteries and their wealth
    ko-339  Uicheon
    ko-340  The Cheontae school
    ko-341  Jinul
    ko-342  Korean Seon Buddhism
    ko-343  The Tripitaka Koreana
    ko-344  The first Tripitaka and its destruction
    ko-345  The carving of the second Tripitaka
    ko-346  Haeinsa
    ko-347  Goryeo woodblock printing
    ko-348  Movable metal type in Goryeo
    ko-349  The Jikji
    ko-350  Goryeo celadon
    ko-351  The invention of inlaid celadon
    ko-352  Goryeo Buddhist painting
    ko-353  Goryeo metalwork
    ko-354  Goryeo lacquer and inlay
    ko-355  Goryeo architecture
    ko-356  Goryeo literature
    ko-357  Chinese-language poetry in Goryeo
    ko-358  Goryeo vernacular song
    ko-359  The Samguk sagi and Kim Busik
    ko-360  The Samguk yusa and Iryeon
    ko-361  Historical writing in Goryeo
    ko-362  Confucian academies in Goryeo
    ko-363  Geomancy and prophecy in Goryeo
    ko-364  Folk religion in Goryeo
    ko-365  The Palgwanhoe and Yeondeunghoe

### The military regimes and the Mongol invasions — `ko-goryeo-mongol`

    ko-366  The Goryeo military coup of 1170
    ko-367  The Goryeo military regimes
    ko-368  The Choe house
    ko-369  Choe Chungheon
    ko-370  Government under the military rulers
    ko-371  Popular rebellions under the military regimes
    ko-372  Manjeok's slave rebellion
    ko-373  The Mongol invasions of Korea
    ko-374  The first Mongol invasion of Korea
    ko-375  The move to Ganghwa Island
    ko-376  Resistance on Ganghwa
    ko-377  The devastation of the Mongol invasions
    ko-378  The Sambyeolcho rebellion
    ko-379  Goryeo's submission to the Mongols
    ko-380  Goryeo under Mongol overlordship
    ko-381  Royal marriages with the Yuan
    ko-382  The Mongol expeditions against Japan
    ko-383  Korean participation in the Japan expeditions
    ko-384  Mongol influence on Goryeo culture
    ko-385  The cost of the Mongol period

### Late Goryeo — `ko-goryeo-late`

    ko-386  King Gongmin
    ko-387  Gongmin's reforms
    ko-388  The anti-Yuan turn
    ko-389  Sin Don
    ko-390  The Red Turban invasions of Korea
    ko-391  Japanese pirate raids on Korea
    ko-392  Choe Museon and Korean gunpowder
    ko-393  The rise of the Neo-Confucian scholars
    ko-394  Neo-Confucianism enters Korea
    ko-395  An Hyang
    ko-396  Jeong Mongju
    ko-397  Yi Seong-gye's rise
    ko-398  The Wihwado retreat
    ko-399  The fall of Goryeo
    ko-400  Why Goryeo fell

## Early Joseon

### The founding of Joseon — `ko-joseon-found`

    ko-401  Joseon
    ko-402  The founding of Joseon
    ko-403  Yi Seong-gye
    ko-404  Jeong Dojeon
    ko-405  The Neo-Confucian design of the Joseon state
    ko-406  The naming of Joseon
    ko-407  The move to Hanyang
    ko-408  The building of Seoul
    ko-409  Gyeongbokgung
    ko-410  The Strife of Princes
    ko-411  King Taejong
    ko-412  Taejong's centralisation
    ko-413  The abolition of private armies
    ko-414  The household tally system
    ko-415  Joseon's relations with Ming China
    ko-416  Sadae diplomacy
    ko-417  Joseon and the Jurchen
    ko-418  The northern frontier and the six garrisons
    ko-419  Joseon and Japan in the fifteenth century
    ko-420  The three ports

### Sejong and the fifteenth century — `ko-sejong`

    ko-421  King Sejong
    ko-422  Sejong's reign
    ko-423  The Hall of Worthies
    ko-424  The invention of Hangul
    ko-425  The Hunminjeongeum
    ko-426  Why Hangul was created
    ko-427  Opposition to Hangul
    ko-428  The early use of Hangul
    ko-429  Hangul's design
    ko-430  Sejong's astronomical instruments
    ko-431  The rain gauge
    ko-432  The self-striking water clock
    ko-433  Joseon calendar reform
    ko-434  Sejong's agricultural manual
    ko-435  Sejong's music reform
    ko-436  Bak Yeon
    ko-437  Joseon printing under Sejong
    ko-438  Sejong's northern campaigns
    ko-439  The Tsushima expedition
    ko-440  Sejong's law reforms
    ko-441  Jang Yeongsil
    ko-442  Sejong's legacy
    ko-443  King Sejo
    ko-444  Sejo's usurpation
    ko-445  The six martyred ministers
    ko-446  The Gyeongguk daejeon
    ko-447  King Seongjong of Joseon
    ko-448  The completion of the Joseon state
    ko-449  Fifteenth-century Joseon culture
    ko-450  Joseon's golden age and its limits

### The Confucian state — `ko-confucian`

    ko-451  Neo-Confucianism in Joseon
    ko-452  The Confucian remaking of Korean society
    ko-453  The yangban
    ko-454  The yangban's privileges
    ko-455  The Joseon status system
    ko-456  The jungin
    ko-457  Commoners in Joseon
    ko-458  Slavery in Joseon
    ko-459  The civil service examination in Joseon
    ko-460  The Joseon examination curriculum
    ko-461  The Sungkyunkwan
    ko-462  Local Confucian academies
    ko-463  The hyanggyo
    ko-464  Ancestral rites in Joseon
    ko-465  Confucian funerals and mourning
    ko-466  The change in women's status in Joseon
    ko-467  Inheritance and lineage in Joseon
    ko-468  Lineage organisation
    ko-469  The Joseon household register
    ko-470  Confucian law and punishment
    ko-471  The Joseon bureaucracy
    ko-472  The Joseon censorate
    ko-473  Royal lectures
    ko-474  The Veritable Records of the Joseon Dynasty
    ko-475  Historians and the record in Joseon

### Science, technology and learning — `ko-joseon-science`

    ko-476  Joseon science
    ko-477  Joseon astronomy
    ko-478  Korean star charts
    ko-479  Joseon cartography
    ko-480  The Gangnido map
    ko-481  Joseon medicine
    ko-482  The Donguibogam
    ko-483  Heo Jun
    ko-484  Joseon agriculture and its manuals
    ko-485  Joseon metallurgy
    ko-486  Joseon shipbuilding
    ko-487  Joseon firearms
    ko-488  Movable type in Joseon
    ko-489  Joseon book culture
    ko-490  Joseon mathematics
    ko-491  Joseon music theory
    ko-492  Joseon painting of the fifteenth century
    ko-493  An Gyeon
    ko-494  Joseon ceramics in the fifteenth century
    ko-495  The royal kilns

### The Imjin War — `ko-imjin`

    ko-496  The Imjin War
    ko-497  Japan's invasion of Korea in 1592
    ko-498  Toyotomi Hideyoshi's aims in Korea
    ko-499  Joseon's unpreparedness
    ko-500  The fall of Seoul and Pyongyang
    ko-501  Yi Sun-sin
    ko-502  The turtle ship
    ko-503  The naval campaign of 1592
    ko-504  The Battle of Hansan Island
    ko-505  The righteous armies
    ko-506  Monk-soldiers in the Imjin War
    ko-507  The Ming intervention
    ko-508  The Battle of Pyongyang
    ko-509  The siege of Jinju
    ko-510  The Imjin War peace negotiations
    ko-511  The second invasion of 1597
    ko-512  Yi Sun-sin's dismissal and return
    ko-513  The Battle of Myeongnyang
    ko-514  The Battle of Noryang
    ko-515  The end of the Imjin War
    ko-516  The Imjin War's cost to Korea
    ko-517  Korean captives taken to Japan
    ko-518  Korean potters in Japan
    ko-519  The Imjin War's effect on Japan and Ming China
    ko-520  The Imjin War in Korean memory

## Later Joseon

### Recovery and the Manchu invasions — `ko-manchu`

    ko-521  Joseon after the Imjin War
    ko-522  Rebuilding the country
    ko-523  Gwanghaegun
    ko-524  Gwanghaegun's foreign policy
    ko-525  The deposition of Gwanghaegun
    ko-526  King Injo
    ko-527  The first Manchu invasion
    ko-528  The second Manchu invasion
    ko-529  The siege of Namhansanseong
    ko-530  Joseon's surrender to the Qing
    ko-531  The hostage princes
    ko-532  Joseon and the Qing after 1637
    ko-533  The northern expedition plan
    ko-534  Loyalty to the fallen Ming
    ko-535  Joseon's sense of itself after the invasions
    ko-536  Population and economy after the wars
    ko-537  The land survey and tax reform
    ko-538  The Daedongbeop
    ko-539  Military reorganisation in later Joseon
    ko-540  Seventeenth-century Joseon society

### Factional politics and the late Joseon court — `ko-factions`

    ko-541  Factionalism in Joseon
    ko-542  The origins of the Joseon factions
    ko-543  The Easterners and Westerners
    ko-544  The Southerners and Northerners
    ko-545  The Noron and Soron
    ko-546  The rites controversies
    ko-547  Factional purges
    ko-548  The literati purges of the sixteenth century
    ko-549  Jo Gwang-jo
    ko-550  King Sukjong
    ko-551  Sukjong's court and its reversals
    ko-552  Jang Huibin
    ko-553  King Yeongjo
    ko-554  The policy of impartiality
    ko-555  Prince Sado
    ko-556  The death of Prince Sado
    ko-557  King Jeongjo
    ko-558  Jeongjo's reforms
    ko-559  Hwaseong Fortress
    ko-560  The Kyujanggak
    ko-561  Jeongjo's death and its aftermath
    ko-562  In-law politics
    ko-563  The Andong Kim clan
    ko-564  The weakening of the monarchy
    ko-565  Court politics and the Joseon state's capacity

### Silhak and new learning — `ko-silhak`

    ko-566  Silhak
    ko-567  The origins of practical learning
    ko-568  Yu Hyeongwon
    ko-569  Yi Ik
    ko-570  Land reform proposals in later Joseon
    ko-571  The Northern Learning school
    ko-572  Bak Jiwon
    ko-573  Bak Jega
    ko-574  Hong Daeyong
    ko-575  Jeong Yagyong
    ko-576  Jeong Yagyong's exile and writings
    ko-577  Mongmin simseo
    ko-578  Silhak and statecraft
    ko-579  Silhak geography and history
    ko-580  Kim Jeongho and the Daedongyeojido
    ko-581  Western learning in Joseon
    ko-582  Catholicism enters Korea
    ko-583  The Korean Catholic community
    ko-584  The persecution of Catholics in Joseon
    ko-585  Silhak's limits and legacy

### Society and economy in later Joseon — `ko-lateeconomy`

    ko-586  The later Joseon economy
    ko-587  Commercial agriculture in Joseon
    ko-588  New crops in Joseon
    ko-589  Rural markets
    ko-590  Joseon merchants
    ko-591  The gongin
    ko-592  Mining in later Joseon
    ko-593  Handicraft production in Joseon
    ko-594  Money in later Joseon
    ko-595  The decline of slavery in Joseon
    ko-596  The abolition of public slavery
    ko-597  Social mobility in later Joseon
    ko-598  The purchase of yangban status
    ko-599  Population growth in later Joseon
    ko-600  Village society in Joseon
    ko-601  Popular culture in later Joseon
    ko-602  Pansori
    ko-603  Talchum and mask dance
    ko-604  Genre painting
    ko-605  Kim Hongdo
    ko-606  Sin Yunbok
    ko-607  Vernacular fiction in Joseon
    ko-608  The Tale of Chunhyang
    ko-609  Women's writing in Joseon
    ko-610  Joseon's shifting social order

### Crisis and opening — `ko-opening`

    ko-611  The nineteenth-century crisis in Joseon
    ko-612  Peasant unrest in nineteenth-century Korea
    ko-613  The Hong Gyeongnae rebellion
    ko-614  The 1862 peasant uprisings
    ko-615  Donghak
    ko-616  Choe Jeu
    ko-617  The Daewongun
    ko-618  The Daewongun's reforms
    ko-619  The persecution of 1866
    ko-620  The French and American expeditions to Korea
    ko-621  Joseon's isolation policy
    ko-622  Queen Min
    ko-623  The Treaty of Ganghwa
    ko-624  The opening of Korea
    ko-625  The Imo Incident
    ko-626  The Gapsin Coup
    ko-627  Kim Ok-gyun and the enlightenment party
    ko-628  Chinese and Japanese rivalry in Korea
    ko-629  The Donghak Peasant Revolution
    ko-630  The First Sino-Japanese War and Korea

## Empire, Colony and Division

### The Korean Empire and annexation — `ko-empire`

    ko-631  The Gabo Reforms
    ko-632  The assassination of Queen Min
    ko-633  The king's flight to the Russian legation
    ko-634  The Korean Empire
    ko-635  Emperor Gojong
    ko-636  The Gwangmu Reforms
    ko-637  Modernisation under the Korean Empire
    ko-638  The Independence Club
    ko-639  Seo Jaepil
    ko-640  The Independent newspaper
    ko-641  Korea between Russia and Japan
    ko-642  The Russo-Japanese War and Korea
    ko-643  The 1904 protocol
    ko-644  The Taft-Katsura memorandum
    ko-645  The Eulsa Treaty of 1905
    ko-646  The Japanese protectorate over Korea
    ko-647  Ito Hirobumi as resident-general
    ko-648  The Hague Secret Emissary Affair
    ko-649  The abdication of Gojong
    ko-650  The disbanding of the Korean army
    ko-651  The Righteous Army movement
    ko-652  An Junggeun
    ko-653  The assassination of Ito Hirobumi
    ko-654  The annexation of 1910
    ko-655  How the annexation was justified and contested

### Colonial rule — `ko-colonialrule`

    ko-656  Japanese colonial rule in Korea
    ko-657  The Government-General of Korea
    ko-658  The military police period
    ko-659  The land survey of 1910 to 1918
    ko-660  Colonial land ownership
    ko-661  The Oriental Development Company
    ko-662  Colonial economic policy in Korea
    ko-663  The rice export policy
    ko-664  Industrialisation in colonial Korea
    ko-665  Colonial infrastructure in Korea
    ko-666  Colonial education policy
    ko-667  The Japanese language in Korean schools
    ko-668  Colonial law and policing
    ko-669  The colonial press in Korea
    ko-670  The cultural rule period
    ko-671  Korean business under colonial rule
    ko-672  Korean labour under colonial rule
    ko-673  Migration out of colonial Korea
    ko-674  Koreans in Japan
    ko-675  Koreans in Manchuria
    ko-676  The wartime mobilisation of Korea
    ko-677  Forced labour
    ko-678  The name-change policy
    ko-679  Shinto shrine worship in Korea
    ko-680  Conscription of Koreans
    ko-681  The comfort women system
    ko-682  The historical record of the comfort women
    ko-683  Colonial collaboration
    ko-684  The debate over colonial modernity
    ko-685  What the colonial period did to Korea

### Resistance and the independence movement — `ko-resistance`

    ko-686  The Korean independence movement
    ko-687  The March First Movement
    ko-688  The Declaration of Independence of 1919
    ko-689  The suppression of the March First Movement
    ko-690  The Provisional Government in Shanghai
    ko-691  Syngman Rhee and the Provisional Government
    ko-692  Kim Ku
    ko-693  Armed resistance in Manchuria
    ko-694  The Battle of Cheongsanri
    ko-695  The Korean Liberation Army
    ko-696  Communist resistance in Korea
    ko-697  Kim Il-sung's guerrilla activity
    ko-698  The historical record of Kim Il-sung's activity
    ko-699  Student movements in colonial Korea
    ko-700  The Gwangju Student Movement of 1929
    ko-701  Cultural nationalism
    ko-702  The Korean Language Society
    ko-703  Sin Chaeho and nationalist history
    ko-704  Religion and resistance in colonial Korea
    ko-705  Christianity in colonial Korea
    ko-706  Women in the independence movement
    ko-707  Yu Gwan-sun
    ko-708  Diaspora activism
    ko-709  The independence movement's divisions
    ko-710  What the independence movement achieved

### Colonial society and its legacies — `ko-colonialsociety`

    ko-711  Colonial cities in Korea
    ko-712  Colonial Seoul
    ko-713  Everyday life under colonial rule
    ko-714  Modern culture in colonial Korea
    ko-715  Cinema and popular culture in colonial Korea
    ko-716  Modern Korean literature
    ko-717  Yi Kwang-su
    ko-718  The new woman in Korea
    ko-719  Education and the colonial elite
    ko-720  Health and population under colonial rule
    ko-721  Famine and hardship in colonial Korea
    ko-722  Korean identity under colonial rule
    ko-723  The colonial legacy in South Korea
    ko-724  The colonial legacy in North Korea
    ko-725  Collaborators and the reckoning that did not happen
    ko-726  Colonial-era historiography
    ko-727  The Japanese colonial view of Korean history
    ko-728  Postcolonial revision of that history
    ko-729  Japan-Korea disputes over the colonial period
    ko-730  Apologies, treaties and unfinished business

### Liberation and division — `ko-division`

    ko-731  The liberation of Korea in 1945
    ko-732  The Japanese surrender in Korea
    ko-733  The 38th parallel
    ko-734  Who drew the 38th parallel
    ko-735  The Soviet occupation of the north
    ko-736  The American occupation of the south
    ko-737  The People's Republic of Korea and its suppression
    ko-738  The Moscow agreement and trusteeship
    ko-739  The trusteeship controversy
    ko-740  The US-Soviet Joint Commission
    ko-741  Political violence in the south before 1950
    ko-742  The Jeju Uprising
    ko-743  The Yeosu-Suncheon rebellion
    ko-744  The rise of Syngman Rhee
    ko-745  The rise of Kim Il-sung
    ko-746  The 1948 elections in the south
    ko-747  The founding of the Republic of Korea
    ko-748  The founding of the Democratic People's Republic of Korea
    ko-749  Land reform north and south
    ko-750  How Korea came to be divided

## The Korean War and the Two Koreas

### The Korean War — `ko-war`

    ko-751  The Korean War
    ko-752  The origins of the Korean War
    ko-753  Border clashes before June 1950
    ko-754  The decision to invade
    ko-755  The Soviet and Chinese role in the decision
    ko-756  The invasion of 25 June 1950
    ko-757  The fall of Seoul in 1950
    ko-758  The United Nations response
    ko-759  The Pusan Perimeter
    ko-760  The Incheon landing
    ko-761  The recapture of Seoul
    ko-762  The advance to the Yalu
    ko-763  The Chinese intervention
    ko-764  The retreat from the north
    ko-765  The Chosin Reservoir
    ko-766  The second fall of Seoul
    ko-767  The war of attrition
    ko-768  The air war over Korea
    ko-769  The bombing of North Korea
    ko-770  Prisoners of war in Korea
    ko-771  The POW repatriation dispute
    ko-772  The armistice negotiations
    ko-773  The Korean Armistice Agreement
    ko-774  Why there was no peace treaty
    ko-775  The Demilitarized Zone
    ko-776  Civilian casualties in the Korean War
    ko-777  The No Gun Ri killings
    ko-778  The Bodo League massacre
    ko-779  Atrocities in the north
    ko-780  Refugees and displacement in the Korean War
    ko-781  The Korean War's cost to Korea
    ko-782  Foreign forces in the Korean War
    ko-783  The Korean War and the Cold War
    ko-784  The Korean War in Korean memory
    ko-785  The Korean War as the forgotten war

### North Korea — `ko-dprk`

    ko-786  The Democratic People's Republic of Korea
    ko-787  Kim Il-sung's consolidation of power
    ko-788  The purges of the 1950s
    ko-789  The August Faction Incident
    ko-790  North Korea between Moscow and Beijing
    ko-791  Juche
    ko-792  What Juche means in practice
    ko-793  The North Korean state
    ko-794  The Workers' Party of Korea
    ko-795  The songbun system
    ko-796  The North Korean economy
    ko-797  The Chollima movement
    ko-798  North Korea's early industrial growth
    ko-799  The economic divergence between north and south
    ko-800  Agriculture and collectivisation in North Korea
    ko-801  The cult of personality
    ko-802  The Kim family succession
    ko-803  Kim Jong-il
    ko-804  The Arduous March famine
    ko-805  The scale of the famine
    ko-806  The rise of markets in North Korea
    ko-807  Kim Jong-un
    ko-808  North Korea's military
    ko-809  The North Korean nuclear programme
    ko-810  The nuclear crises and negotiations
    ko-811  North Korea's foreign relations
    ko-812  Human rights in North Korea
    ko-813  The evidence about North Korea
    ko-814  Defectors as sources
    ko-815  Information control in North Korea
    ko-816  North Korean society
    ko-817  Daily life in North Korea
    ko-818  North Korean culture and art
    ko-819  North Korean historiography
    ko-820  Reading North Korean sources

### South Korea — `ko-rok`

    ko-821  The Republic of Korea
    ko-822  Syngman Rhee's presidency
    ko-823  Authoritarian rule under Rhee
    ko-824  The April Revolution of 1960
    ko-825  The Second Republic
    ko-826  Park Chung-hee's coup
    ko-827  The Park Chung-hee era
    ko-828  Export-led industrialisation
    ko-829  The five-year plans
    ko-830  The chaebol
    ko-831  The Saemaul Undong
    ko-832  Normalisation with Japan in 1965
    ko-833  Korean troops in Vietnam
    ko-834  The Yushin Constitution
    ko-835  Repression under Yushin
    ko-836  The assassination of Park Chung-hee
    ko-837  Chun Doo-hwan's coup
    ko-838  The Gwangju Uprising
    ko-839  The suppression of Gwangju
    ko-840  The democracy movement in South Korea
    ko-841  The June Struggle of 1987
    ko-842  Democratisation
    ko-843  The 1988 Seoul Olympics
    ko-844  The South Korean labour movement
    ko-845  Kim Young-sam and civilian government
    ko-846  The 1997 financial crisis
    ko-847  Kim Dae-jung
    ko-848  The Sunshine Policy
    ko-849  South Korean politics since 2000
    ko-850  Presidential impeachments
    ko-851  South Korea's economy today
    ko-852  Inequality and social change in South Korea
    ko-853  Demographic change and the birth rate
    ko-854  South Korea's global position
    ko-855  South Korean civil society

### Division, diplomacy and reunification — `ko-reunification`

    ko-856  The division of Korea
    ko-857  The two states' claims to legitimacy
    ko-858  Inter-Korean relations
    ko-859  Incidents at the DMZ
    ko-860  The 1972 joint communique
    ko-861  The 1991 Basic Agreement
    ko-862  The 2000 inter-Korean summit
    ko-863  Later inter-Korean summits
    ko-864  The Kaesong Industrial Complex
    ko-865  Family reunions
    ko-866  The six-party talks
    ko-867  North Korea and the United States
    ko-868  North Korea and China
    ko-869  North Korea and Russia
    ko-870  South Korea and the United States
    ko-871  South Korea and Japan
    ko-872  Korea and China today
    ko-873  Separated families
    ko-874  North Korean defectors in the south
    ko-875  Reunification policy in the south
    ko-876  Reunification in North Korean policy
    ko-877  The German comparison
    ko-878  The costs of reunification
    ko-879  Public opinion on reunification
    ko-880  Korea's unfinished division

## Korean Culture and Society

### The Korean language and Hangul — `ko-language`

    ko-881  The Korean language
    ko-882  Korean's linguistic classification
    ko-883  Korean grammar
    ko-884  Korean honorifics
    ko-885  Korean dialects
    ko-886  North and South Korean language difference
    ko-887  Hangul
    ko-888  The Hangul alphabet's structure
    ko-889  Hangul syllable blocks
    ko-890  Hangul and literacy
    ko-891  The spread of Hangul
    ko-892  Hangul's official adoption
    ko-893  Hangul Day
    ko-894  Hanja
    ko-895  The role of Chinese characters in Korean
    ko-896  Idu and early Korean writing
    ko-897  Sino-Korean vocabulary
    ko-898  Loanwords in Korean
    ko-899  Romanisation of Korean
    ko-900  Revised Romanization and McCune-Reischauer
    ko-901  Korean names
    ko-902  Korean surnames and clans
    ko-903  Korean personal names
    ko-904  Korean typography and calligraphy
    ko-905  Korean language policy today

### Religion and belief — `ko-religion`

    ko-906  Religion in Korea
    ko-907  Korean shamanism
    ko-908  The mudang
    ko-909  Gut rituals
    ko-910  Buddhism in Korea today
    ko-911  The Jogye Order
    ko-912  Korean temple life
    ko-913  Confucianism as a living tradition
    ko-914  Ancestral rites today
    ko-915  Christianity in Korea
    ko-916  The growth of Korean Protestantism
    ko-917  Korean Catholicism
    ko-918  Korean new religions
    ko-919  Cheondogyo
    ko-920  Won Buddhism
    ko-921  Religion in North Korea
    ko-922  Religion and politics in South Korea
    ko-923  Korean funerals
    ko-924  Geomancy and pungsu
    ko-925  Belief and everyday life in Korea

### Art, architecture and craft — `ko-art`

    ko-926  Korean art
    ko-927  Korean ceramics
    ko-928  Celadon and its technique
    ko-929  Buncheong ware
    ko-930  Joseon white porcelain
    ko-931  The moon jar
    ko-932  Korean painting
    ko-933  Korean landscape painting
    ko-934  Jeong Seon and true-view landscape
    ko-935  Korean folk painting
    ko-936  Korean calligraphy
    ko-937  Korean Buddhist art
    ko-938  Korean sculpture
    ko-939  Korean metalwork
    ko-940  Korean textiles and embroidery
    ko-941  Hanbok
    ko-942  Korean furniture
    ko-943  Korean architecture
    ko-944  The hanok
    ko-945  Ondol heating
    ko-946  Korean palaces
    ko-947  Korean fortresses
    ko-948  Korean gardens
    ko-949  Korea's UNESCO World Heritage sites
    ko-950  Korean art in the twentieth century

### Literature, music and performance — `ko-literature`

    ko-951  Korean literature
    ko-952  Hyangga
    ko-953  Goryeo songs
    ko-954  Sijo
    ko-955  Gasa
    ko-956  Classical Korean prose
    ko-957  The Nine Cloud Dream
    ko-958  Korean vernacular novels
    ko-959  Modern Korean literature after 1945
    ko-960  Korean poetry in the twentieth century
    ko-961  Korean literature since division
    ko-962  North Korean literature
    ko-963  Korean traditional music
    ko-964  Korean court music
    ko-965  Folk music and minyo
    ko-966  Samulnori
    ko-967  Korean traditional instruments
    ko-968  Pansori as performance
    ko-969  Korean dance
    ko-970  Korean theatre
    ko-971  Korean cinema
    ko-972  Korean cinema's international rise
    ko-973  Korean television drama
    ko-974  K-pop
    ko-975  The Korean Wave

### Food, family and daily life — `ko-daily`

    ko-976  Korean food
    ko-977  Rice in Korean life
    ko-978  Kimchi
    ko-979  Kimjang
    ko-980  Korean fermentation
    ko-981  Jang and Korean sauces
    ko-982  Korean soups and stews
    ko-983  Korean barbecue
    ko-984  Korean street food
    ko-985  Korean temple food
    ko-986  Royal court cuisine
    ko-987  Korean drinks
    ko-988  Korean tea culture
    ko-989  The Korean family
    ko-990  Kinship and lineage today
    ko-991  Marriage in Korea
    ko-992  Education and the exam in South Korea
    ko-993  Hagwon and private education
    ko-994  Work and company life in Korea
    ko-995  Korean cities today
    ko-996  Housing in Korea
    ko-997  Korean sport
    ko-998  Korean festivals
    ko-999  Seollal and Chuseok
    ko-1000  The Korean diaspora
