# Russia — the card plan

The collection is **Russia** (`geo-russia`), the fourth of the Geography SECTION on the Collections page,
beside **World** (`geo-world`), **United States** (`geo-us`) and **China** (`geo-china`). It is **163
cards in two decks**: **The federal subjects** (`geo-russia-subjects`, `gru-001`–`gru-083`) and **The
administrative centres** (`geo-russia-capitals`, `gru-501`–`gru-583` with three numbers deliberately
unused). Its cards use the **map card** format — a shape on a globe, and the question is what it is.

📖 **`docs/geography-card-plan.md` describes the map card itself** — `map`, `facts`, the globe, the fit,
the four-row facts grid, the accessibility limitation — and everything it says applies here unchanged.
**Read it before writing a card.** 📖 **`docs/world-geography-card-plan.md`** carries the rules the two
non-US geography decks share: what a background may and may not say, the four `gw-audit.js` rules, and
the date-line rule. This file is the running order and the decisions particular to Russia: which subjects
are in the list, which of them can have a capital card at all, what each is called, and where the figures
come from.

The next card to write is the lowest `gru-NNN` not yet in `data.js`:

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='gru-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

**Shipped so far: `gru-001` Moscow and `gru-002` Moscow Oblast.** The first was written so that the new
map layer, the fit and the shading were proved on a real card rather than on a test — which is how the China collection opened and
for the same reason, and the card was rendered and looked at before it was called done. **The capital
card that was to have gone with it did NOT ship, and why is the most useful thing this batch found** —
see "The capital half needs a sourcing recipe" below. The rest follow one subject at a time, in the
population order below.

---

## What is in the list, and what is not

**This is the one decision in the collection that had to be got right before anything else**, because the
territory of the Russian Federation is actively disputed and a deck of shapes makes a claim about every
one of them simply by drawing it. The set is therefore not a judgement made subject by subject. It is
**one checkable rule**, and it is *The world*'s own first rule applied one level down:

> **A subject is in the deck if it carries an ISO 3166-2:RU code of its own.**

That standard is a list of a country's subdivisions maintained by a body with no stake in any of the
disputes, which is exactly the question this deck asks, and it is the same instrument *The world* uses at
the country level with ISO 3166-1. **Two independent sources were asked and both answer 83:**

- **Natural Earth** files 86 features under Russia. Two of them it codes **UA-43** (Crimea) and **UA-40**
  (Sevastopol) — *Ukrainian* codes, assigned by Natural Earth rather than by Folio. One, `RU-X01~`, is a
  0.3° sliver on the Yamal coast with a null name, a null type and null everything else: the source's own
  placeholder for an unresolved piece rather than a subject. 86 − 2 − 1 = **83**.
- **Wikidata** returns 89 entities typed *federal subject of Russia*. Six carry no ISO 3166-2:RU code:
  Crimea, Sevastopol (UA-40), Donetsk, Luhansk, Zaporizhzhia and Kherson. 89 − 6 = **83**.

The two 83s are the same 83, matched code by code in `.claude/build-russia-subjects.js`.

**Russia's own constitution as amended lists 89.** That is the Russian Federation's account of its own
territory, and the standing rule for every collection on this site is that no state's account of its own
actions is repeated as established fact. The deck does not repeat it and does not argue with it: it
applies a rule set by neither party, records the arithmetic, and says so here. The General Assembly has
twice addressed the question directly — **resolution 68/262** (27 March 2014) affirmed Ukraine's
territorial integrity and called on states not to recognise any alteration of the status of Crimea or
Sevastopol, and **resolution ES-11/4** (12 October 2022) did the same for Donetsk, Luhansk, Zaporizhzhia
and Kherson — and a card whose subject touches any of it says so in its own background, at the bar, with
the dispute described and no government's account taken as settled.

**The deck is called *The federal subjects*** and every question asks for **"the federal subject shaded
on the map"**, which is true of all 83 and asserts nothing about the sovereignty of any.

### Why the question says "federal subject" and never "province" or "region"

The 83 are **six different kinds of thing**, and the constitution (Article 5) treats all six as equal
constituent entities: **46 oblasts, 21 republics, 9 krais, 4 autonomous okrugs, 2 cities of federal
significance and 1 autonomous oblast**. "The province shaded on the map" would be false of 37 of them, and
"the region" is worse, since *oblast* is conventionally translated *region* and would quietly give the
answer away on 46 cards. `CARD_MAP_LAYERS`'s `what` for this layer is therefore `"federal subject"`, which
is the term that covers all six and the term the constitution itself uses. **Every card states its own
kind in a `Kind` row**, and the question is careful not to assume it — the same rule the China deck follows
for its provinces, autonomous regions and municipalities.

## Three capital numbers are never written, and they are not the same refusal

A capital card shades a subject and puts a gold dot on a city inside it. Three of the 83 cannot take one.

- **`gru-501` Moscow** and **`gru-504` Saint Petersburg** — each is a **city that is itself a federal
  subject**, so the shape being shaded IS the city being asked for and the question answers itself. This
  is exactly what *The world* does for its city-states and what the China deck does for its four
  municipalities.
- **`gru-570` Khakassia** is a **DATA refusal**, and it is worth reading before anyone tries to write it.
  Abakan is the capital of Khakassia and **Natural Earth draws it outside Khakassia.** The republic's
  easternmost vertex near the city's latitude is 91.4135; Abakan stands at about 91.43, between the Abakan
  river and the Yenisei and so west of the boundary the two actually share. Three independent coordinates
  were tested against the source's **raw** geometry — Natural Earth's own populated place
  (91.4450, 53.7037), Wikidata's Q875 (91.4167, 53.7167) and the city centre (91.4292, 53.7156) — and all
  three fall four to five kilometres inside **Krasnoyarsk Krai**. The fault is the polygon, not the
  point's precision, so no choice of coordinate reaches a shape that contains the city. **The dot is not
  moved and the point is not snapped to the boundary** — `build-world-capitals.js` states that rule for
  the fifteen capitals that fall just outside their own simplified coastline, and a gold dot sitting
  outside the shaded shape is worse than an absent card, because the card would render perfectly while
  contradicting itself. If Natural Earth corrects the boundary, or a finer shape source is taken, move the
  row out of `DEFERRED` in the builder and write the card.

**All three decisions are enforced by the data rather than by this paragraph.** `window.RUSSIA_CENTRES`
holds 80 rows and none of them is Moscow, Saint Petersburg or Abakan, so `add-card.js` refuses such a card
outright. A plan can be forgotten; a refusal cannot.

## The names

**They are declared in the builder, and so are the kind and the ISO code** — only the geometry and the
label point come from Natural Earth. That differs from the China builder, which takes the name from the
source and renames two, and the reason is that all three of Natural Earth's own fields are unusable here:

- **`name`** is a stale or garbled transliteration on a dozen rows — *Maga Buryatdan* for Magadan, *Chita*
  for Zabaykalsky Krai (Chita Oblast was merged into it in 2008), *Yevrey*, *Gorno-Altay*, *Mariy-El*,
  *Ingush*. `name_en` is better but gives "Moscow" for **both** the city and the oblast, so neither field
  can name the 83 on its own.
- **`type_en`** is wrong on seventeen: all nine krais are "Territory", Zabaykalsky and Kamchatka are
  "Region" when both are krais, Sakha is "Autonomous Province" when it is a republic, and the four
  autonomous okrugs are "Autonomous Province" too.
- **`region`** is wrong outright — Chechnya, Dagestan, Krasnodar and Rostov are all filed "Volga". It is
  not read at all.

The names below are the form English reference works use, with the type spelled out **only where it is
needed to tell two subjects apart**: *Altai Krai* and *Altai Republic* are neighbours and both carry it,
while Komi and Karelia carry none because nothing else is called either. Each card gives the Russian name
in its own prose; the transliteration follows the conventional English spelling rather than a system, so
it is *Yekaterinburg* and *Nizhny Novgorod* rather than BGN/PCGN forms nobody writes.

### ⚠ Natural Earth has the two Moscow codes the wrong way round

It gives **`RU-MOS`** to a one-degree shape named "Moskva" typed Federal City, and **`RU-MOW`** to a
five-degree shape named "Moskovskaya" typed Region. **ISO 3166-2:RU assigns them the other way** —
`RU-MOW` is *Moskva*, the federal city, and `RU-MOS` is *Moskovskaya oblast'* — and Wikidata's own P300
agrees with ISO. So the geometry is right and the code attached to it is wrong, which is the worst shape a
fault can have: every card renders perfectly, and a reader checking the code against the standard finds
the city filed under the oblast's code.

The builder swaps them, and **the swap is asserted from the geometry rather than trusted**: it refuses to
write unless the shape it labels `RU-MOW` is the smaller of the two and lies inside the other's bounding
box (measured: 2,833 km² inside 43,855 km²). A hand-written correction can go stale when the source is
fixed; a measurement cannot.

## How the running order was chosen

**By population, largest first** — the same principle *The world* and *China* follow, so a reader moving
between the four Geography collections meets one rule rather than three. It is also a good order for this
subject: a learner opens on Moscow, Moscow Oblast and Krasnodar Krai, works down through the industrial
Urals and the Volga republics, and reaches Chukotka and the Nenets Autonomous Okrug at the end — which is
where a shape deck earns its keep.

**THE ORDER IS FIXED AT PLANNING TIME AND IS NOT RE-SORTED.** A card id is a permanent address: it is what
`data.js` files the card under, what a deck's `cardIds` lists, what a reader's schedule is keyed by and
what a shared study link points at. Populations move every year, so re-sorting would move cards between
ids and silently repoint every one of those. The snapshot is:

- **Wikidata's `P1082` (population), retrieved 2026-09-14**, joined to the shapes on ISO 3166-2:RU. This
  is the same route `fetch-stats.js` already takes for the Atlas's own country figures, so the Geography
  section's orders rest on one source rather than four.

Three consequences worth knowing rather than discovering. **A card's own population figure is researched
and cited when the card is written**; it is not this snapshot. The snapshot decides the ORDER and nothing
else, and the two will drift apart — that is expected and is not a fault to correct. **The figures are of
mixed date**, being whatever each entity's most recent P1082 statement is, so the order is approximate at
the margins; two subjects a place apart are not meaningfully different in size. And **Tyumen Oblast sits
at `gru-009` on a figure that includes its two okrugs** — see the next section, which is the same
divergence seen from the other side.

## ⚠ Population and area are written to THREE DIGITS, with a suffix

**Given on request, Sep 2026.** The facts box is a two-column grid on a card that is mostly map, and a
nine-character number is a number nobody reads. Both figures are written to **three significant digits at
most**, with `k`, `M` or `B` doing the rest of the work:

    11.3M      8.89M      5.42M      234k      24.9k      1.73k

So Moscow's 11,918,057 is **11.9M**, not `11,918,057`; an area of 2,561 km² is **2.56k km²**. A figure
that is already three digits or fewer is written plainly — a population of 234 is `234`. **The date the
figure belongs to is still given**, as `11.9M (2012)`, because these figures go stale at different rates
and a reader comparing two cards needs to know which year each is.

**The imperial conversion stays** and takes the same treatment: `2.56k km² (989 sq mi)`. And **`?` is
still the right answer** for a figure that was looked for and not found — rounding is about how a figure
is written, never about inventing one.

**The other three Geography collections do NOT follow this yet.** `geo-us`, `geo-world` and `geo-china`
were written before the rule and carry figures like `179,800 km² (69,400 sq mi)` and `1.46B (2025)` — the
populations are mostly already three digits, the areas mostly are not. Bringing them over is a pass of its
own across some six hundred cards and has not been done; until it is, the section is inconsistent between
Russia and its three siblings, which is recorded here rather than left to be discovered.

## ⚠ The okrugs do not nest on the map, and the official figures do

Nenets is constitutionally part of Arkhangelsk Oblast, and Khanty-Mansi and Yamalo-Nenets part of Tyumen
Oblast. The obvious fear is that shading Tyumen would shade two other cards' answers as well, and
**it does not**: Natural Earth's polygons are mutually exclusive and tile. Measured, its Tyumen is
160,185 km², which is the oblast **proper** (160,122 km²) and not the 1,464,173 km² an official table
quotes with the okrugs in; Arkhangelsk is 403,078 against 413,103 proper and 589,913 with Nenets. The map
therefore draws six subjects rather than three, which is what this deck wants.

**The consequence for a CARD runs the other way and is the thing to watch.** An Area or Population row
taken from an official table is usually the **with-okrugs** figure, and on Tyumen Oblast and Arkhangelsk
Oblast that figure does not describe the shape being shaded. Those four cards — `gru-009` Tyumen,
`gru-054` Arkhangelsk and the two okrug cards that sit inside them — must **state which figure they are
giving**, and the honest form is the one the card's own source uses with the scope named in the row label.
**No checker can see this**: a with-okrugs area is a well-formed number correctly cited to a real table.

## ⚠ The two paragraphs have fixed jobs: the place, then its whole history

**Given on request, Sep 2026, and it supersedes what this section said before.** Every abstract on this
site is ten sentences in two blocks of five, and in this collection the two blocks are not
interchangeable:

- **Block 1 is the PLACE — its geography, its climate and its demographics.** The relief and what made
  it, the rivers and the seas, the climate type and what the winters and summers actually do, and who
  lives there: how many roughly, how they are distributed, which peoples, which languages.
- **Block 2 is the WHOLE of its history**, from whatever the earliest thing worth saying is down to the
  present — compressed into five sentences, so it is the broad arc and not an episode.

The earlier rule made the whole background a history and it is withdrawn. `gru-001` was written under it
and has been rewritten to this shape; every card from `gru-002` on is written to it directly.

**BLOCK 2 IS THE HARDER HALF AND THE ONE THAT GOES WRONG.** Five sentences for a thousand years means
choosing the turns rather than narrating: for Tatarstan that is Volga Bulgaria, the Khanate of Kazan and
its fall in 1552, the Tatar national movement, the oil and the 1994 power-sharing treaty — five things,
not five sentences about one of them. **A card that spends three of its five on one century has not
summarised the history, it has picked a period**, and nothing on the page will say so.

### How this squares with "never repeat the boxes", which still stands

The two rules look as though they collide and they do not, because they are about different things. The
facts box carries **figures**; block 1 carries the **shape of the place**. So:

- **The population NUMBER stays in the box** and is not restated in prose. What block 1 says instead is
  how those people are arranged — concentrated along one river, thin across the north, four fifths in
  towns — which is demography and is not a number the box already gives.
- **The area NUMBER likewise stays in the box.** Block 1 may say a subject is mostly tundra, or that its
  ground was enlarged in 2012, without quoting the figure beside it.
- **The capital's NAME stays in the box.** Block 1 names cities only where the sentence is about where
  people live rather than about which city is the seat.
- **A date the date line carries is not repeated** in block 2 either.

**No checker can see any of this.** A duplicated figure is well formed, correctly cited and counts the
right number of words; so is a history that covers one century out of ten.

**And rule 4 of `gw-audit.js` binds here too: a background may not list the subjects that border it.** The
card draws the subject on a globe with every neighbour around it, so the neighbours are the one thing on
it a reader can already see. Replace each neighbour with the sea, the river, the range or the region it
stands in — a SEA is not a subject and stays, and a historical mention of a frontier is the subject's own
history and stays.

**No checker can see any of this.** The duplicated sentences are well formed, correctly cited and count
the right number of words.

## History, not commemoration — and not the present war

The collection's subject is **the geography of the Russian Federation's constituent entities**. Three
things follow, and the first two are the standing rules for every collection here said in this subject's
own terms.

- **No state's account of its own actions is repeated as established fact**, in any direction. That binds
  on the Russian Federation's account of Chechnya, on the Soviet account of the deportations, and equally
  on any other government's account of Russia.
- **A contested figure is given as a RANGE with whose it is named.** The deportation of the Chechens and
  Ingush in 1944, the Kalmyks in 1943 and the Volga Germans in 1941 all have contested death tolls, and
  several of these cards cannot be written without them.
- **The events of 2014 and after are carded where a subject's own card requires it and nowhere else.**
  This is a geography deck; a card about Rostov Oblast is about Rostov Oblast. Where the war is genuinely
  part of a subject's story — Belgorod, Kursk, Bryansk and Rostov all border Ukraine — the card says what
  is documented, dates it, attributes it, and does not narrate a conflict still in progress.

**Several of these subjects are the homelands of peoples the collection must describe in their own
terms**, not as minorities inside somebody else's story: the 21 republics are constitutionally the
homelands of titular nationalities, and a card on Tuva, Sakha, Buryatia or Bashkortostan whose ten
sentences are all about Russian administration has missed its subject.

## Sourcing

**Measured on 2026-09-14 from this sandbox, not assumed.** `rosstat.gov.ru` and `eng.rosstat.gov.ru`
**refuse the connection outright**, and so does `en.kremlin.ru`; `britannica.com` is **403**. That rules
out the obvious spine — the Russian statistical service's own tables — and it is the same finding *The
world*'s own Moscow card recorded, so do not spend the afternoon re-testing it.

What answers:

- **`data.un.org` and `unstats.un.org` — 200.** The UN Statistics Division's Demographic Yearbook carries
  city and administrative-division populations for Russia.
- **Wikidata's query service — 200 when spaced out**, and **429 when probed fast**, which is a BUSY host
  rather than a shut one (`check-reach.js`'s own finding). It is the join between the shapes and the
  order, and it is where the builder takes the three coordinates Natural Earth cannot supply.
- **Natural Earth** for every shape and nearly every point.
- **UNESCO** answers (`whc.unesco.org` was 403 for the China deck; re-measure per batch) and matters here:
  a number of these subjects hold World Heritage sites that are the natural subject of a background's
  later sentences.

**Run `node .claude/check-reach.js` before opening a batch rather than reading this paragraph back** — a
claim about the environment goes stale silently and stops work that would have succeeded, which is the
scar `docs/citation-plan.md` carries.

**The citation bar is the site's own**: at least 5 works per card, each with an openable URL and a marker
pointing at it, and a paired glossary term at the glossary bar in the same commit. **A Russian-language
source qualifies** where it carries detail no English one does — that is the standing rule, and on this
subject it will come up often.

## The glossary

**Almost none of this collection's 163 answer terms is an existing glossary key.** `Moscow` and
`Saint Petersburg` already exist; `Russia` exists; beyond that the republics, krais, oblasts and their
cities are new ground, so expect the glossary to grow at roughly one term per card. **Check before running
`add-glossary.js`, which overwrites in silence** — the scar `wh-294` left.

Two collisions are already visible and both want a decision before the card is written:

- **`Georgia`** is a country term and also a US state; Russia adds no third sense, but **`Ossetia`** does —
  North Ossetia–Alania is a federal subject and South Ossetia is not, so a bare `Ossetia` key would claim
  a surface that belongs to two different things. Key the subject `North_Ossetia-Alania` and give it no
  bare alias.
- **`Kalmykia`, `Buryatia` and `Tuva`** are each also the name of a people and a language. Key the
  subject, and where a card elsewhere on the site means the people, write the link by hand.

---

# The list

## The federal subjects — `geo-russia-subjects`

Eighty-three cards, in descending order of population. Each shades one federal subject on the globe
and asks which it is; the facts box carries the administrative centre, the population, the largest city
and the area, and the date line the subject's own dates. **A card states its KIND in its prose** — the
83 are six different kinds of thing and the question is careful not to assume which.

  gru-001  Moscow
  gru-002  Moscow Oblast
  gru-003  Krasnodar Krai
  gru-004  Saint Petersburg
  gru-005  Sverdlovsk Oblast
  gru-006  Rostov Oblast
  gru-007  Bashkortostan
  gru-008  Tatarstan
  gru-009  Tyumen Oblast
  gru-010  Chelyabinsk Oblast
  gru-011  Dagestan
  gru-012  Samara Oblast
  gru-013  Nizhny Novgorod Oblast
  gru-014  Stavropol Krai
  gru-015  Krasnoyarsk Krai
  gru-016  Novosibirsk Oblast
  gru-017  Kemerovo Oblast
  gru-018  Perm Krai
  gru-019  Volgograd Oblast
  gru-020  Saratov Oblast
  gru-021  Irkutsk Oblast
  gru-022  Voronezh Oblast
  gru-023  Altai Krai
  gru-024  Leningrad Oblast
  gru-025  Orenburg Oblast
  gru-026  Omsk Oblast
  gru-027  Primorsky Krai
  gru-028  Khanty-Mansi Autonomous Okrug
  gru-029  Udmurtia
  gru-030  Chechnya
  gru-031  Belgorod Oblast
  gru-032  Tula Oblast
  gru-033  Vladimir Oblast
  gru-034  Khabarovsk Krai
  gru-035  Penza Oblast
  gru-036  Tver Oblast
  gru-037  Yaroslavl Oblast
  gru-038  Ulyanovsk Oblast
  gru-039  Chuvashia
  gru-040  Vologda Oblast
  gru-041  Bryansk Oblast
  gru-042  Kirov Oblast
  gru-043  Lipetsk Oblast
  gru-044  Kursk Oblast
  gru-045  Ryazan Oblast
  gru-046  Tomsk Oblast
  gru-047  Sakha (Yakutia)
  gru-048  Kaluga Oblast
  gru-049  Kaliningrad Oblast
  gru-050  Arkhangelsk Oblast
  gru-051  Zabaykalsky Krai
  gru-052  Buryatia
  gru-053  Tambov Oblast
  gru-054  Astrakhan Oblast
  gru-055  Ivanovo Oblast
  gru-056  Kabardino-Balkaria
  gru-057  Smolensk Oblast
  gru-058  Mordovia
  gru-059  Amur Oblast
  gru-060  Kurgan Oblast
  gru-061  Komi
  gru-062  Oryol Oblast
  gru-063  North Ossetia–Alania
  gru-064  Mari El
  gru-065  Murmansk Oblast
  gru-066  Pskov Oblast
  gru-067  Novgorod Oblast
  gru-068  Kostroma Oblast
  gru-069  Ingushetia
  gru-070  Khakassia
  gru-071  Karelia
  gru-072  Yamalo-Nenets Autonomous Okrug
  gru-073  Adygea
  gru-074  Karachay-Cherkessia
  gru-075  Sakhalin Oblast
  gru-076  Tuva
  gru-077  Kamchatka Krai
  gru-078  Kalmykia
  gru-079  Altai Republic
  gru-080  Jewish Autonomous Oblast
  gru-081  Magadan Oblast
  gru-082  Chukotka Autonomous Okrug
  gru-083  Nenets Autonomous Okrug

## The administrative centres — `geo-russia-capitals`

Eighty cards. A centre is numbered 500 higher than its own subject, so the two decks pair by number
and `gru-501`, `gru-504` and `gru-570` are unused — Moscow and Saint Petersburg are cities that are
themselves federal subjects, so the shape would be the answer, and Khakassia is a DATA refusal: this
layer draws Abakan outside the republic. See "Three capital numbers are never written" above.

  gru-502  Krasnogorsk
  gru-503  Krasnodar
  gru-505  Yekaterinburg
  gru-506  Rostov-on-Don
  gru-507  Ufa
  gru-508  Kazan
  gru-509  Tyumen
  gru-510  Chelyabinsk
  gru-511  Makhachkala
  gru-512  Samara
  gru-513  Nizhny Novgorod
  gru-514  Stavropol
  gru-515  Krasnoyarsk
  gru-516  Novosibirsk
  gru-517  Kemerovo
  gru-518  Perm
  gru-519  Volgograd
  gru-520  Saratov
  gru-521  Irkutsk
  gru-522  Voronezh
  gru-523  Barnaul
  gru-524  Gatchina
  gru-525  Orenburg
  gru-526  Omsk
  gru-527  Vladivostok
  gru-528  Khanty-Mansiysk
  gru-529  Izhevsk
  gru-530  Grozny
  gru-531  Belgorod
  gru-532  Tula
  gru-533  Vladimir
  gru-534  Khabarovsk
  gru-535  Penza
  gru-536  Tver
  gru-537  Yaroslavl
  gru-538  Ulyanovsk
  gru-539  Cheboksary
  gru-540  Vologda
  gru-541  Bryansk
  gru-542  Kirov
  gru-543  Lipetsk
  gru-544  Kursk
  gru-545  Ryazan
  gru-546  Tomsk
  gru-547  Yakutsk
  gru-548  Kaluga
  gru-549  Kaliningrad
  gru-550  Arkhangelsk
  gru-551  Chita
  gru-552  Ulan-Ude
  gru-553  Tambov
  gru-554  Astrakhan
  gru-555  Ivanovo
  gru-556  Nalchik
  gru-557  Smolensk
  gru-558  Saransk
  gru-559  Blagoveshchensk
  gru-560  Kurgan
  gru-561  Syktyvkar
  gru-562  Oryol
  gru-563  Vladikavkaz
  gru-564  Yoshkar-Ola
  gru-565  Murmansk
  gru-566  Pskov
  gru-567  Veliky Novgorod
  gru-568  Kostroma
  gru-569  Magas
  gru-571  Petrozavodsk
  gru-572  Salekhard
  gru-573  Maykop
  gru-574  Cherkessk
  gru-575  Yuzhno-Sakhalinsk
  gru-576  Kyzyl
  gru-577  Petropavlovsk-Kamchatsky
  gru-578  Elista
  gru-579  Gorno-Altaysk
  gru-580  Birobidzhan
  gru-581  Magadan
  gru-582  Anadyr
  gru-583  Naryan-Mar

## ⚠⚠ THE FACTS GRID CANNOT BE FILLED FOR A NON-CITY SUBJECT, AND THAT BLOCKS 81 CARDS

**Measured 2026-09-14, and it is the biggest open question in the collection.** Every geography card
carries the same four rows — Capital, Population, Largest city, Area — and for a subject that is not
itself a city **none of the four can be sourced to the bar**. `gru-001` Moscow is fine because Moscow is a
CITY and the UN publishes city figures; `gru-002` onward are not.

**What was tried, so that nobody spends the afternoon again:**

- **Every Russian and CIS statistics host refuses the connection or blocks it.** `rosstat.gov.ru`,
  `eng.rosstat.gov.ru` and `gks.ru` return nothing at all (connection refused); `fedstat.ru` and
  `cisstat.com` answer **403**. Rosstat is the only body that publishes federal-subject populations and
  areas, and it is unreachable from here.
- **The UN publishes nothing sub-national.** The Demographic Yearbook's table list was read end to end:
  every population table is by COUNTRY (tables 1–7) or by CITY (table 8). There is no table of provinces,
  regions or administrative divisions, so the route that supplied `gru-001` stops at the city boundary.
  The World Bank answers and is country-level only.
- **An academic study area does not carry it either.** DOAJ was swept for a paper stating Moscow
  Oblast's area or population; the hits are medical and agronomic papers that mention the region without
  sizing it.
- **Wikidata has all of it and is not citable.** `P1082` and `P2046` cover all 83, which is why the
  running order could be sorted at all — but a database is not an academic, museum, government or IGO
  publication, and its own references point back at Rosstat, which cannot be opened to check. **It is
  sound for building a points table, where the polygon test proves each row, and unsound for asserting a
  figure in prose.** That distinction is the same one the capital half turns on, one section down.

**So a `gru-002` written today would carry `?` in all four rows**, which is honest and is also a box worth
nothing to a reader. **The card was therefore NOT written**, rather than shipped empty.

**`gru-002` shipped with `Capital: Krasnogorsk` and three question marks**, which is the worst case; from
`gru-003` on the *Largest city* row is filled wherever the join below settles it, so most cards carry two
real rows and two `?`.

**THE OWNER HAS DECIDED: OPTION 3.** The grid keeps its four rows on every card, and a figure that
cannot be sourced is written `?`. So this section is now a record of what was measured rather than an open
question — **do not re-run the search per card**; the hosts are shut and the UN has no sub-national table,
and a card's research time goes into the prose and the two rows that CAN be filled.

**What that means per card, in practice.** *Capital* and *Largest city* are usually fillable — the first
from the subject's own name or its well-attested seat, the second from the UN's city table joined to the
shapes — and *Population* and *Area* usually are not. **Fill every row you honestly can and write `?` for
the rest**; a grid of four question marks is a poor card, and one with two real rows is a useful one.

**The three ways out were:**

1. **Change the grid for this collection.** The four rows are a site-wide rule set on request, so they are
   not Folio's to change unilaterally; but a Russia grid of *Kind · Federal district · Administrative
   centre · Time zones* would be fillable from sources that ARE reachable, and would tell a reader more
   about a federal subject than a population would.
2. **Accept a named non-IGO compiler** for these two figures only, cited as what it is. This widens the
   citation bar, which is why it is the owner's call and not a helper's.
3. **Leave the figures as `?` and ship anyway**, on the plan's own convention that `?` is the honest state
   for a figure looked for and not found.

**A fourth was considered and rejected: measuring the area off the shipped polygons.** Natural Earth is
simplified at 0.002°, and a check against Moscow gives about 2,833 km² where the official figure is 2,561
— some 10% out. A derived number presented as *the* area is a number a reader can catch us being wrong
about, and it is not what the row claims.

**One row IS solvable and the method is written down.** *Largest city* can be derived rather than
authored: the UN's table 8 gives 165 Russian cities with populations, Natural Earth gives each a
coordinate, and a point-in-polygon test against this collection's own shapes says which subject each
stands in. Tried: it places 128 of 165 and gets **Krasnodar Krai** right (Krasnodar 774k, then Sochi,
Novorossiysk) while getting **Moscow Oblast** wrong, because Podolsk and Balashikha sit near the New
Moscow boundary and the rest fall in the 37 it cannot place by name. **It wants a builder of its own with
the same inside-test discipline `build-russia-subjects.js` uses**, not a hand-run script.

## ⚠ The capital half needs a sourcing recipe, and does not have one yet

**`gru-001` shipped and no capital card did.** The plan was to write the first subject card and the first
capital card together, as China's did; the capital card was abandoned after the research, and the reason
generalises to all eighty.

**THE POINTS TABLE AND THE CARD NEED DIFFERENT KINDS OF SOURCE, AND ONLY THE FIRST IS SOLVED.**
`RUSSIA_CENTRES` is built from Wikidata's `P36`, and for a POINTS TABLE that is sound: the value is a
coordinate, and the builder proves it by testing the point against the subject's own polygon, so a wrong
row cannot survive. A CARD is a different question. It asserts in prose that *X is the administrative
centre of Y*, and that assertion needs a citation at the bar — and **Wikidata is not a citable source
under this site's rules**, being a database rather than academic, museum, government or IGO publication.
So the table can be trusted to place a dot and cannot be quoted to justify one.

**The obvious sources are shut.** `rosstat.gov.ru`, `eng.rosstat.gov.ru` and `en.kremlin.ru` all refuse
the connection, so no subject's own charter or statistical office is reachable; `britannica.com` is 403.
The three recipes the world deck's capital half runs on were each tried on Moscow Oblast's seat and none
answered: there is no WMO normals page for Krasnogorsk, the constitution names the capital of the
federation and no subject's centre, and a DOAJ and Crossref sweep for a paper whose Study Area states the
fact returned nothing usable.

**And Moscow Oblast is the worst possible case to have tried first**, which is worth knowing before the
next attempt. Its seat is genuinely contested rather than merely unsourced: the oblast is governed from
Krasnogorsk, where the House of Government has stood since 2007, while much of the reference literature
still gives Moscow — a city that is a different federal subject. **Try an unambiguous centre next**
(`gru-503` Krasnodar, `gru-505` Yekaterinburg, `gru-508` Kazan), establish the recipe there, and come
back to `gru-502` with it.

**⚠ THIS SECTION IS NOW HISTORY: THE RECIPE EXISTS, AND IT SHIPPED WITH `gru-508` IN BATCH 19.** What
follows is kept as the record of what was tried and why the obvious routes fail; the recipe itself is
the section directly below. **Do not re-run the searches recorded here.**

**Until a recipe existed, a capital card could not be written to the bar, and none was.** The subjects
deck is unaffected and was worked straight down the order — and as of batch 18 it is FINISHED, so the
eighty centres are all that is left of this collection.

**Batch 18 took the question three steps further and did not close it.** Rosstat's own table 2.1 is
titled *"Capitals, centers and largest cities of constituent entities of the Russian Federation"*, so the
fact does sit in a citable government table — but the table never says which listed name is which, and
position is not the rule (Moscow Region lists Krasnogorsk seventh). `pravo.gov.ru` and
`publication.pravo.gov.ru` answer 200 from here, alone among Russian government hosts, and their document
types include *Устав (Основной Закон)* — a subject's own charter, which is the document that names its
centre — but the portal's `?q=` is inert, so no route to a particular charter has been found yet. And
DOAJ and Crossref index metadata only, so the Study Area recipe costs one paper read per card rather than
one query. **The charter route is the lead to try next**, on an unambiguous centre, per the paragraph
above.

## ✅ THE CAPITAL HALF'S RECIPE — found in batch 19, and the grid comes from ONE Rosstat table

**The blocker above is cleared.** A capital card needs two things the subject cards did not: a citation
for *X is the administrative centre of Y*, and a facts grid whose rows are the CITY's rather than the
subject's. Both are now solved, and the second is solved for all eighty at once.

### The grid: Rosstat's table 4.9, and it is the whole capital half in one table

**`Russian Statistical Yearbook 2023`, table 4.9, *Cities with Population of 100 000 and Over*, in
thousands, columns 2002 · 2010 · 2020 · 2021 · 2022 · 2023.** It lists **172 cities**, which is 65 of the
80 administrative centres outright and, once the OCR's spellings are read through, all but the eight that
are genuinely under 100,000 (Magas, Anadyr, Naryan-Mar, Salekhard, Gorno-Altaysk, Birobidzhan, Magadan,
Gatchina — those need a figure of their own or a `?`).

- **READ THE FOOTNOTE BEFORE READING THE COLUMNS, because three of the six are not comparable.** It says:
  2002, 2010 and 2021 are **census** counts; the other years are **estimates as of 1 January**; and *"data
  for 2020, 2022 are presented without using the All-Russian Population Census of 2020 results"*. So the
  2020 and 2022 columns are PRE-census estimates that the census then corrected, sometimes by a seventh —
  Astrakhan reads 530 (2020 estimate), 476 (2021 census), 519 (2022 estimate), 469 (2023). **A row read as
  a time series looks like a city that lost and regained 50,000 people twice.** It is two series
  interleaved.
- **So the card takes the 2023 column for Population and the 2010 → 2021 CENSUS pair for growth**, which
  is the same census-to-census comparison the China and world capital cards make.
- **Rank in Russia is computed inside the table**, which is the United States cards' own discipline — the
  rank is read out of the very table the card cites, never out of the grid's rounded figures.
- **THE EXTRACTED FIGURES ARRIVE SPLIT AND MUST BE RE-JOINED BY ARITHMETIC, NOT BY EYE.** `pdf-text.js`
  emits a thousands separator as a space AND breaks a three-digit number at a kerning stop, so a row comes
  out as `165 165 18 7 185 187 185` — seven tokens for six values. A greedy merge is wrong on any row
  crossing 1,000 (it made Krasnodar `646 745 9331 99 974 1121`). What works is a **dynamic-programming
  split of the digit string into exactly six numbers, scored by closeness to the row's own median** — a
  city's population is stable across twenty years, so the right split is the flat one. Verified against
  Kazan, Yekaterinburg, Ufa, Tyumen, Volgograd, Perm, Voronezh, Belgorod, Astrakhan and Arkhangelsk.
- **A ROW WITH `…` IN IT HAS FEWER THAN SIX VALUES** (a city under 100,000 in 2002), and a naive row regex
  RESYNCS ON THE NEXT ROW AND EATS IT — which is how Yekaterinburg, Russia's fourth city, went missing from
  the ranking entirely and shifted every rank below it by one. Count the rows against the cities.

### The answer: a LADDER, because no single source names all 83 centres

**There is no such source and the search for one is over.** Rosstat's own table 2.1 column is titled, in
Rosstat's English, *"Capitals, centers and largest cities of constituent entities of the Russian
Federation"* — so the centre is in there, and the list is **ordered by size**, so it cannot say which name
is the centre: Moscow Region lists Krasnogorsk **seventh**, behind Balashikha, Podolsk, Khimki, Korolev,
Mytishchi and Lyubertsy. Use the ladder instead, in this order:

1. **The subject's own government portal, read through the Wayback Machine.** This is the best rung where
   it works: `tatarstan.ru/eng/about.html` prints *"Capital : Kazan (797 km east of Moscow …)"* beside the
   area and the administrative division, so one page carries the answer AND three background sentences.
   **It works only where the host is not excluded from the archive**, and several are: `mosreg.ru`,
   `admkrai.krasnodar.ru`, `donland.ru` and `samregion.ru` all answer **403 inside the Wayback Machine**,
   while `midural.ru`, `bashkortostan.ru` and `admtyumen.ru` are archived and open.
2. **An IGO page about the city.** UNESCO's Creative Cities Network entry for Kazan opens with *"The
   capital of the Republic of Tatarstan"* and adds the city's cultural figures. `www.unesco.org` answers
   200; **`whc.unesco.org` is 403 and the World Heritage route is shut.**
3. **An open-access article whose abstract states it**, found through DOAJ's own API — `bibjson.abstract:("capital of the Republic of Bashkortostan" OR "administrative center of …")`.
   **DOAJ DOES index abstracts, which this plan previously recorded the opposite of**, and the phrase is
   in an abstract often enough to be worth one query. It is not universal: Tatarstan and Bashkortostan
   return hits, Krasnodar Krai and Tyumen Region return none.

### Two host findings that cost an afternoon each

- **`pravo.gov.ru` AND `publication.pravo.gov.ru` ANSWER 200 — OVER `http://` AND WITH A BROWSER
  USER-AGENT.** Over `https://` with curl's default agent both reset the connection, which is what an
  earlier probe recorded as "shut". **The repo's own rule applies here: retest with `-L` and a browser
  user-agent before trusting a refusal.** What they are still not good for is finding a particular
  charter: the portal's `?q=` is inert, returning all 1,700,615 documents whatever is asked, and its
  `/api/Documents` validates parameters this session did not work out.
- **The regional portals themselves are shut over both schemes**: `http://` redirects to `https://`, where
  the certificate chains to a Russian national CA nothing here carries (`admkrai.krasnodar.ru`,
  `rosstat.gov.ru`), or a WAF answers 403 or 503 (`mosreg.ru`, `donland.ru`, `midural.ru`,
  `bashkortostan.ru`). **The Wayback Machine is the only way in, and it is the rung-1 route above.**

### The climate leg is solved for the whole deck

**The WMO's World Weather Information Service lists 94 Russian cities**, which covers essentially every
administrative centre — `Kazan'` 986, `Ekaterinburg` 916, `Ufa` 659, `Tjumen'` 1001, and so on down to
`Anadyr'` 975 and `Nar'jan-Mar` 970. `https://worldweather.wmo.int/en/json/Country_en.xml` is the index.
**Take a figure the subject card did not already use** — a capital card and its own subject card otherwise
print the same January mean, because the subject card's climate sentence was read off the capital's
station.

### What a capital card looks like

`map: { layer: "russia-subjects", key: "<subject>", dot: "<city>" }`, the question *"The dot on the map
marks ___, the administrative centre of the federal subject shaded around it."*, and a grid of **Federal
subject · Population · Rank in Russia · Population growth**. **The background MAY name its own federal
subject**, unlike the world deck's rule about countries: a capital card's history is the history of the
subject's capital, and forbidding the name would forbid the card. `facts-echo` reports a name and fails
only on a figure, which is the right line here.

## Two sourcing findings that outlast this batch

**`data.un.org` IS GONE, AND CARDS ACROSS THE SITE STILL CITE IT.** Every `data.un.org/en/iso/<cc>.html`
country profile now 404s; the host has been replaced by the "UN System Data Commons", a JavaScript
application whose ROOT also returns the same 3,769-byte shell with a 200 — the 200-status error document
this repo already records five varieties of, so a status check alone reports it healthy. **This is not a
Russia problem**: `gw-001` India, `gw-009` Russia and `gw-509` Moscow all carry that URL as a live
citation, and the world deck used it as a standing recipe. It wants a pass of its own.

**THE UN'S CITY FIGURES FOR RUSSIA ARE FROM 2012 AND CARRY NO AREAS.** The Demographic Yearbook's table 8
is reachable and usable (`.xls`, and the 2024 edition as SpreadsheetML), and it is where `gru-001`'s
population comes from — but Russia's block is dated **1 VII 2012** in the 2022, 2023 **and** 2024
editions alike, so that is the most recent figure the UN publishes and it is fourteen years old. And of
its **175 Russian city rows, not one carries a surface area**: the column exists and is empty throughout.
That is why `gru-001`'s Area row is `?` rather than a number, which is the plan's own convention for a
figure looked for and not found. **Do not fill it from the open literature without reading what the
figure describes**: the obvious candidate, the 1,000 km² an open urban-climate paper gives, is the
PRE-2012 city and would contradict the shape the card shades.

## The batch log

### Batch 1 — the format proved (`gru-001`)

`gru-001` Moscow was written, rendered and looked at, which proved the layer, the fit, the shading and
the breadcrumb on a real card. What that batch established, beyond the card:

- **The layer is 404 KB gzipped**, against China's 157 and the states' 181 — Russia's Arctic coastline and
  its thousands of islands rather than a looser tolerance, all three being traced at the same 0.002°/3dp.
  It is lazy, so no reader who never opens the deck pays any of it. Run `node .claude/check-sizes.js`
  rather than quoting that figure back.
- **`lakes.js` is load-bearing in this bundle in a way it is not in China's.** Natural Earth clips a lake
  lying BETWEEN divisions out of both of them. China has no such lake and its builder measured that the
  file changed nothing there; here **Baikal sits between Irkutsk Oblast and Buryatia and Ladoga between
  Karelia and Leningrad Oblast**, so both are holes in this layer, and under a hole is `world.js`, which
  has no lake holes at all. Without `lakes.js` the two largest lakes in Europe and Asia would draw as grey
  land inside a shaded subject. Onega, which lies wholly inside Karelia, is not clipped and is land.
- **Five administrative centres do not resolve by name against Natural Earth**, and the reasons are four
  different ones: the source calls Arkhangelsk **Archangel** and Oryol **Orel**; it calls Rostov-on-Don
  plain **Rostov** and so does a different town of 33,000 in Yaroslavl Oblast, which only the inside-test
  tells apart; it carries exactly one **Krasnogorsk**, a village of 3,304 on **Sakhalin, 7,559 km** from
  the Moscow Oblast town of 175,000 the oblast is governed from; and it has no **Magas** at all.
- **Nine centres sit within 3 km of their own boundary** and the builder now reports them on every run, on
  the principle that the near miss is the signal: Anadyr 0.26 km, Magas 0.86, Arkhangelsk 0.88,
  Vladivostok 1.42, Petropavlovsk-Kamchatsky 2.07, Magadan 2.49, Murmansk 2.52, Krasnodar 2.82,
  Krasnogorsk 2.87. These are correct today on a simplified polygon and are the first to re-read after any
  rebuild.
- **A published coordinate rounded to the arcminute is about 1.4 km wide, and that is enough to cross a
  border.** The English Wikipedia article's primary coordinate for Magas (44.8000, 43.1667) falls on the
  wrong side of the Ingushetia–North Ossetia boundary and the builder **refused it**; Wikidata's Q5222
  (44.8167, 43.1667) falls inside. Nothing about the city is in doubt — the disagreement is about the
  precision of a published figure, not about where Magas is.
- **A Wikidata id is looked up, never composed.** Two were guessed while writing the builder's table and
  both were wrong: `Q140380` is an asteroid and `Q171131` a village in Botswana. `wbsearchentities`
  returns the id beside the entity's own one-line description, which is what makes such a row checkable at
  a glance.

### Batch 2 — the two-paragraph format, and the first four cards (`gru-002`–`gru-004`)

`gru-002` Moscow Oblast, `gru-003` Krasnodar Krai and `gru-004` Saint Petersburg, each written to the
owner's two-paragraph rule and each with its paired glossary term in the same commit. What the batch
established, beyond the cards:

- **AN EDITED HANDBOOK IS WORTH MORE HERE THAN A PAPER, AND ONE OF THEM CARRIES THE WHOLE SOUTH.** The
  *Handbook on the History and Culture of the Black Sea Region* (De Gruyter, 2024, open access,
  `10.1515/9783110723175`) has a chapter apiece on the region's physical geography, its antiquity, its
  nationalisms, its monuments and its modern migrations, each by a named author with its own DOI — so a
  single volume gave `gru-003` four of its seven sources, on four different subjects, all checkable in
  Crossref. **It will carry Rostov, Crimea-adjacent subjects and the whole Azov coast too**; find it
  through OAPEN, which is where the open BOOKS are, rather than through DOAJ, which finds articles.
- **`whc.unesco.org` IS WALLED FROM THIS SANDBOX AS OF SEP 2026, and spacing the probes does not open
  it.** Six attempts two minutes apart all returned the same 5,651-byte Cloudflare managed challenge.
  `gru-001` and `gru-002` cite it and were verified when written; `gru-003` wanted it for the Western
  Caucasus World Heritage site and had to do without. **Re-measure with `node .claude/check-reach.js`
  rather than assuming either way** — it answered on 2026-09-12 and does not now.
- **THE UN'S CITY TABLE IS PARSEABLE AS SPREADSHEETML AND NOT AS PDF.** `table08.pdf` embeds its fonts
  with a non-standard encoding, so the usual text extraction returns noise; `table08.xls` from the same
  directory is XML (`<ss:Row>` / `<ss:Cell>`) and parses in a dozen lines. Russia's block runs 175 rows
  from line ~4102 of the 2024 edition. It is what gives `gru-003` its *Largest city* figure and `gru-004`
  its population.
- **THE WMO HAS A CITY LIST, AND THE ID IS READ FROM IT RATHER THAN GUESSED.**
  `worldweather.wmo.int/en/json/full_city_list.txt` is a 118 KB `"country";"city";"id"` table — Krasnodar
  is 1027 and St Petersburg 203, and neither is anywhere near the other. A guessed id resolves to a real
  city somewhere else (1023 is Azov), which is the worst shape a wrong citation can have.
- **THE DECK SAMPLER DREW EVERY GEOGRAPHY CARD AS A GREY BOX, and this batch is what found it.**
  `PAGES.sample` rendered `cardFrontHTML` and never called `mountCardMaps` — the same fault `PAGES.card`
  had and fixed. Fixed here, with the reveal in `show()` rather than at draw, since on that page the
  answer is behind a button. **Look at a new card through more than one surface**: `#card/<id>` was
  right the whole time.
- **`test-map-cards.js` HAD NO ENTRY FOR THE `russia-subjects` LAYER**, so all three `gru-` cards failed
  its "names a known layer" check from the day the collection shipped. Its table now carries the layer
  and asserts the three deliberately absent centres. **A new map layer is added in app.js, in
  `add-card.js` AND in that suite.**
- **THE FACTS GRID IS NOT ALL-OR-NOTHING, which is what makes option 3 worth having.** `gru-002` carries
  three question marks and is the worst case; `gru-003` fills *Capital* and *Largest city* from the UN's
  city table joined to the shapes, and `gru-004`, being a city that is itself a subject, fills three of
  the four. **Fill every row you honestly can.**

### Batch 3 — the Volga, the Urals, Siberia and the Caucasus (`gru-005`–`gru-012`)

Eight more subject cards, each with the two-paragraph background and its paired glossary term in the same
commit: `gru-005` Sverdlovsk Oblast, `gru-006` Rostov Oblast, `gru-007` Bashkortostan, `gru-008`
Tatarstan, `gru-009` Tyumen Oblast, `gru-010` Chelyabinsk Oblast, `gru-011` Dagestan and `gru-012` Samara
Oblast. What the batch established, beyond the cards:

- **A HANDFUL OF WORKS CARRY THE WHOLE COLLECTION, AND THEY ARE WORTH KNOWING BEFORE OPENING A BATCH.**
  Four of them turned up on almost every card. **The WMO's per-city normals**
  (`worldweather.wmo.int/en/json/<id>_en.xml`, the id read off `full_city_list.txt`, which transliterates
  — Chelyabinsk is `Cheljabinsk`, Tyumen `Tjumen'`, Makhachkala `Mahackala`) give the climate sentence for
  every capital that has a station. **The UN's `table08.xls`** gives the population rows; its Russian
  block is stamped `1 VII 2012` and its first four columns are the CITY PROPER against the last four for
  the URBAN AGGLOMERATION, which are different numbers and must be labelled as such (Tyumen is 622k
  against 645k). **Morfill 1902** (`cu31924028567711`) reaches Peter's Caspian campaign at p. 87, Pugachev
  at pp. 211–13, Shamyl at pp. 392–93 and the Trans-Siberian at p. 462. And **Howorth 1880**, in its two
  divisions, is the standing English source for everything Tatar: division 1
  (`historymongolss00howogoog`) has the khans of Kazan from p. 363 and the storming of the city at
  pp. 422–25, division 2 (`p2historyofmongo02howouoft`) has Kuchum at pp. 982–83, Yermak at pp. 985–86,
  the founding of Tyumen at pp. 996–97 and Bell of Antermony on the fort at Samara at p. 1057.
- **A SUBJECT'S SINGLE BEST MODERN SOURCE IS USUALLY AN OPEN-ACCESS PAPER ABOUT SOMETHING ELSE.** The
  geography sentences came out of papers whose own subject is limnology, archaeology or sociolinguistics:
  Nicu et al. 2019 on the Kuibyshev Reservoir (`10.3390/w11030591`) carries the Volga–Kama cascade, the
  reservoir's size and the four regions it reaches, and so served `gru-008` AND `gru-012`; Veisberg 2015
  (`10.15560/11.2.1617`) opens by placing Chelyabinsk Oblast in its three natural zones; Kolesnichenko et
  al. 2021 (`10.3390/w13223189`) gives the Irtysh's basin area for Tyumen; and Wier's
  `10.36253/asiac-3760` gives Dagestan both its language families and its measured highland-to-lowland
  shift. **Search for the region, not for the topic you want.**
- **A PDF WHOSE DIGITS COME OUT MISSING IS A FONT-SUBSET PROBLEM, AND THE FIX IS TO STOP QUOTING THE
  NUMBER.** Three of the papers read this batch (Veisberg's lake counts, Epimakhov's radiocarbon tables,
  the *Ethnobotany of Dagestan*) extract with their figures silently dropped or their whole text
  scrambled, because the file embeds a custom encoding. **A sentence built on the qualitative claim is
  still fully sourced**; a figure guessed back into the gap is not.
- **`mdpi.com` IS 403 FROM HERE AND `mdpi-res.com` SERVES THE SAME PDF**, at
  `mdpi-res.com/d_attachment/<journal>/<journal-vol-art>/article_deploy/<journal-vol-art>.pdf`. So is
  `iopscience.iop.org` (a Radware bot wall on the PDF path) and `escholarship.org`; for a walled
  publisher, Europe PMC's `fullTextXML` is the route that keeps working — it is what gave `gru-010` the
  Techa River cohort. **A DOI that 403s from this sandbox is not a dead citation**: `10.3390/w11030591`
  resolves to a wall here and opens in a reader's browser, so it ships as [Open access].
- **AN EXPANDED GIVEN NAME IS STILL THE EASIEST WAY TO SHIP A WRONG CITATION.** `gru-010` was drafted with
  "Peter G. Brown et al." for the Chelyabinsk airburst paper; Crossref's record says "P. G. Brown", the
  article's own byline says "P.G. Brown", and the expansion — almost certainly right — was replaced with
  the initials on both the card and its glossary term. **`check-citations.js --card=<id>` reports this as
  "to check by eye", which is the tier to actually read.**
- **THE OKRUG RULE BIT FOR THE FIRST TIME ON `gru-009`, AND THE ANSWER WAS TO GIVE NO AREA AT ALL.** The
  card states the constitutional relation — Khanty-Mansi and Yamalo-Nenets are constituent entities in
  their own right and at the same time stand within the oblast, which art. 66 leaves to federal law or
  treaty — and puts `?` in both figure rows, so there is no figure whose scope could be wrong.
- **A PICTURE SEARCH THAT NAMES A LANDMARK BEATS ONE THAT NAMES THE REGION, AND THE CONTACT SHEET RULE
  STILL PAYS.** Every card in this batch took its picture from a named natural or built landmark (the
  Kapova cave, the Bolgar site, the Tobolsk Kremlin, Lake Turgoyak, the Sulak canyon, the Zhiguli bluff),
  and three candidates were rejected on sight: a "Samara Bend" search returned a **satellite scene**,
  which the fetcher's `SPACEBORNE` list did not catch because the file name says neither Landsat nor
  Sentinel; a Taganay picture came back as an unreadable **snowfield**; and a Derbent view carried a
  **watermark**. **Look at every one.**
- **AND `upload.wikimedia.org` RATE-LIMITS WHERE `commons.wikimedia.org/w/thumb.php?f=<FILE>&width=N`
  DOES NOT.** That is the documented fallback and it carried this batch through several 429s. The `src`
  written onto the card is still the ordinary upload URL, and its two-character shard is copied from
  `imageinfo`, never composed.

### Batch 4 — the Volga-Oka, the Caucasus Line and three Siberian subjects (`gru-013`–`gru-017`)

Nizhny Novgorod Oblast, Stavropol Krai, Krasnoyarsk Krai, Novosibirsk Oblast and Kemerovo Oblast,
each with its paired glossary term at the bar and a picture that was looked at. What this batch adds
to the collection's own working knowledge.

- **A SIXTH WORK NOW CARRIES THE COLLECTION, AND IT CARRIES SIBERIA.** `Guide to the Great Siberian
  Railway` (1900, ed. Dmitriev-Mamonov and Zdziarski; `archive.org/details/guidetogreatsibe00russuoft`)
  is the source that made three of these five cards writable. It describes each region the line crosses
  BEFORE describing the stations: the Baraba at pp. 160–61, the founding of Novo-Nikolaevsk at pp.
  264–65 (Gusevka's 24 houses and 104 people, the 1893 Ob–Krasnoyarsk section, the Cabinet's allotment
  on the Kamenka, the 2,682 building plots), the 17th-century stockaded posts at p. 32 and the Kuznetsk
  coal basin at pp. 8–9. **It is an official publication of the Ministry of Ways of Communication and is
  cited title-first**, as an anonymous work is. **George Kennan's `Siberia and the Exile System`** (1891,
  `siberiaexilesyst01kenn`) is the other Siberian spine — the six exile bureaux at p. 78, Krasnoyarsk at
  p. 357 — and **Baddeley's `The Russian Conquest of the Caucasus`** (1908, `cu31924028754616`) is the
  Caucasus one: Yakobi's fortresses at p. 39, Potemkin's viceroyalty at pp. 45–46 and Lermontov's duel,
  in a footnote, at p. 331. **Rambaud's `History of Russia`** vol. 1 (1879, `historyofrussia01ramb`)
  carries the pre-Petrine centuries Morfill does not reach, and gave `gru-013` Minin and Pozharsky at
  pp. 341–43.
- **A GUESSED AUTHOR LIST IS THE FAULT THIS COLLECTION KEEPS PRODUCING, AND IT WAS CAUGHT AGAIN.** The
  Hydrology 2021 North Caucasus paper behind `gru-014` was drafted as "Sergey Kovalev, Artyom Gusarov
  and Valentin Golosov"; Crossref says **Artyom V. Gusarov, Aidar G. Sharifullin and Mikhail A.
  Komissarov**. It was caught by asking Crossref BEFORE writing the card rather than after — which is
  what CLAUDE.md says to do and is the difference between a correction and a shipped error.
- **SOMETIMES THE AREA AND THE POPULATION ARE IN THE PAPER, IN A PARENTHESIS.** `gru-014` is the first
  card in this collection whose facts grid carries both figures, and they come from one clause of the
  Hydrology paper's study-area section: "the Stavropol Upland is located in the Stavropol Krai (66,160
  km2; more than 2.8 million people)". **Read the study-area section of every geography paper for the
  administrative figures**; this is where they hide, and they are cited rather than asserted.
- **A FIGURE THE SOURCE HEDGES IS WRITTEN HEDGED IN THE GRID.** The krai's population goes in as
  "over 2.8M" because "more than 2.8 million" is what the paper says. A bare "2.8M" would be a
  precision the source does not claim.
- **THREE MDPI PAPERS AND ONE EUROPE PMC FULL TEXT CARRIED THE GEOGRAPHY HALF**, on the routes batch 3
  measured: `mdpi-res.com` for Hydrology 8/28, Water 15/901 and Minerals 15/643, and
  `ebi.ac.uk/europepmc/.../fullTextXML` for the Scientific Reports reservoir paper and the Natural
  Hazards review that gave `gru-015` its Tunguska sentences. **`bio-conferences.org` and
  `www.bio-conferences.org` are 403 from here**, which rules out the BIO Web of Conferences Kuzbass
  papers; `hist-geo.ru` and `vestnik.kemsu.ru` both answer 200 and serve their abstracts in English
  as well as Russian.
- **A BILINGUAL RECORD IS A REASON TO CITE THE TITLE CROSSREF REGISTERS.** `gru-017`'s Russian-language
  Ural-Kuzbass article was first cited under its transliterated Russian title, which `check-citations.js`
  reported as "to check by eye". The journal registers and prints an English title, so that is what the
  citation carries now — and the note went away. **A by-eye note on a bilingual record is a prompt to
  pick the registered form, not a finding to wave through.**
- **THE TUNGUSKA EVENT COULD NOT BE CITED WHERE IT IS BEST DESCRIBED.** `Airbursts and Cratering
  Impacts` (10.14293/aci.2025.0006) serves a Cloudflare challenge; the route that worked was a REVIEW
  in another field entirely — Titus et al.'s survey of natural-disaster analogues for asteroid impacts,
  open at Europe PMC — which states the ten-megaton estimate, the 500 km² of burnt taiga and the week
  of white nights over Europe. **The day is not in it, so the card does not give one.**
- **THE BARABA'S MODERN LITERATURE IS NOT OPENLY REACHABLE FROM HERE** (the Springer *Contemporary
  Problems of Ecology* survey is paywalled and elibrary.ru is 403), so `gru-016` describes it out of the
  1900 guide, whose account of reed and sedge over miry ground, birch and aspen copses on low ridges,
  small lakes and salt marsh is still what the place is. **An old description of a landform is not the
  same kind of claim as an old description of a town.**
- **THE LARGEST CITY IS NOT ALWAYS THE CAPITAL, AND THE UN TABLE IS WHAT SAYS SO.** Kemerovo is 538,000
  and Novokuznetsk 549,000, so `gru-017`'s grid names Novokuznetsk. **Read both columns of the Russian
  block before filling the row.**
- **A PICTURE SEARCH NAMING A LANDMARK KEEPS WINNING, AND THREE MORE CANDIDATES WERE REJECTED ON
  SIGHT**: a Novosibirsk Reservoir beach photographed from a car through a phone, a Sheregesh street of
  parked cars and snow heaps, and a Barabinsk steppe frame shot through a moving train window with the
  telegraph wires across it. The five that shipped are the Nizhny Novgorod Kremlin from the air, Mount
  Beshtau at sunset, Lake Dyupkun on the Putorana Plateau, the open water of the Ob Sea and the Kuznetsk
  Alatau under snow. **`fetch-geo-images.js` returns nothing at all for several Russian landmarks**
  (Ob Reservoir, Lake Chany, Tomskaya Pisanitsa), so the Commons `categorymembers` and `generator=search`
  calls are the fallback and the file's own `imageinfo` is what the `src`, the artist and the licence are
  read off.

### Batch 5 — the Urals, the lower Volga, Baikal and the black earth (`gru-018`–`gru-022`)

Perm Krai, Volgograd Oblast, Saratov Oblast, Irkutsk Oblast and Voronezh Oblast, each with its paired
glossary term at the bar and a picture that was looked at. What this batch adds.

- **THE COLLECTION'S OPEN SHELF IS NOW EIGHT WORKS AND THEY COVER THE WHOLE COUNTRY.** To the six of
  batches 3 and 4 this adds **Rambaud's `History of Russia` vol. 1** used properly — pp. 27 (the Volga's
  traffic), 41 (the peoples of the middle Volga), 277 (the Stroganov grant of 1558 and Yermak), 341–43
  (Minin and Pozharsky), 388 (Razin takes Saratov and Samara) — and **Murchison, de Verneuil and
  Keyserling's `The Geology of Russia in Europe and the Ural Mountains`** (1845,
  `geologyrussiaeu1murc`), where the Permian is proposed at p. 204 and explained at pp. 138–39.
  **Howorth's `History of the Mongols` part 1** (1876, `historymongolsm01howogoog`) carries Catherine's
  Volga colonies and Sarepta at p. 678 — a different volume from the part 2 used for Samara, so check
  which one a page belongs to before citing. **Morfill** now carries three separate Voronezh and lower
  Volga passages (pp. 47, 145, 213).
- **A NAMED PERIOD IS A CARDABLE FACT AND ITS PRIMARY SOURCE IS OPEN.** `gru-018` states in the
  surveyors' own terms why the Permian is called the Permian — they would use neither the German nor the
  English name and preferred a geographical one — which is far better than asserting it. **Look for the
  work that COINED a term before summarising the coinage.**
- **THE SAME SOURCE OFTEN CARRIES BOTH HALVES OF A CARD.** The Plants 2024 oak study behind `gru-022`
  gives the chernozem profile (humus horizon 50–75 cm, 5.1–5.9 per cent humus) for block one AND Peter
  the Great declaring the Shipov Forest the sovereign's ship timber in 1709 for block two — which then
  joins Morfill's account of the flotilla Peter gathered at Voronezh that same year. **Read a science
  paper's introduction as well as its study area.**
- **THREE SOURCES BY ONE AUTHOR IS A `check-cards.js` FAILURE, AND THE FIX IS ONE ENTRY WITH THE PAGES
  TOGETHER.** `gru-020` first carried Rambaud three times over for three different pages, which rule 1
  counts as one author in three of the card's sources. Merged to `27, 41, 388`. **Chicago wants that
  anyway; the checker is what makes it non-negotiable.**
- **A BILINGUAL RUSSIAN JOURNAL RECORD: CITE THE TITLE CROSSREF REGISTERS.** Same finding as batch 4's
  Ural-Kuzbass article, met again.
- **A PARENTHESISED DOI HAS TO BE PERCENT-ENCODED TO RESOLVE FROM HERE, AND THE ARTICLE PAGE IS THE
  BETTER ADDRESS ANYWAY.** `10.21847/1728-9343.2019.2(160).164799` 403s raw and resolves encoded; the
  citation carries `skhid.kubg.edu.ua/article/view/164799`, which has no brackets at all. **The same
  applies to a Commons credit** — `gru-020`'s picture is `Khvalynsky_national_park_(2020)_1.jpg`, and
  both its `src` and its credit URL carry `%28`/`%29`.
- **AND THE HOSTS MEASURED THIS BATCH.** OPEN: `ojs.zrc-sazu.si` (Acta Carsologica), `hist-geo.ru`,
  `vestnik.kemsu.ru`, `bulletin.esoil.ru`, `nasa.gov`, `ntrs.nasa.gov`, `rsis.ramsar.org`,
  `earthobservatory.nasa.gov`, `piahs.copernicus.org`, `mdpi-res.com`, Europe PMC's `fullTextXML`.
  SHUT: `history.army.mil` and `history.state.gov` (403), `skhid.kubg.edu.ua` (403),
  `bio-conferences.org` and `e3s-conferences.org` (403, so all of EDP Sciences' conference series),
  `elibrary.ru` (403), `degruyterbrill.com` (202 and no body), `www.mdpi.com` (403).
- **A RUSSIAN JOURNAL'S OWN PDF OFTEN WILL NOT EXTRACT.** `jvolsu.com` and `rucont.ru` PDFs came out at
  10 and 13 bytes — the custom-font fault batch 3 recorded — so for those journals the DOAJ record's own
  abstract is what can actually be read. **Cite only what that abstract states.**
- **`fetch-geo-images.js --out` IS OVERWRITTEN BY EVERY `--force` RUN, WHICH IS HOW A CAPTION GETS
  ATTACHED TO THE WRONG PICTURE.** Trying three subjects in a shell loop leaves the file holding the
  LAST one; `gru-018`'s glossary term was briefly given a Vishera caption over a Prokudin-Gorsky
  photograph of the Kama bridge, caught by printing the credit before writing. **Print the `src` and the
  credit of what you are about to install, every time** — the looking rule covers the picture, and this
  covers the pairing.
- **AND THE HELPER RETURNS NOTHING FOR A GREAT MANY RUSSIAN SUBJECTS** (Shipov Forest, Kostenki,
  Khopyorsky reserve, Kostomarovo, Voronezh Reservoir, Lake Chany, Ob Reservoir, Usva Pillars), so the
  Commons `generator=categorymembers` and `generator=search` calls are the fallback — and they
  rate-limit hard, answering `You are making too many requests` for minutes at a time. **Pace them, and
  read the file's own `imageinfo` for the shard: computing the MD5 by hand produced a 404 here.**

### Batch 6 — the Altai steppe, Ladoga, the Ural frontier, the Irtysh and the Pacific (`gru-023`–`gru-027`)

Shipped Sep 2026: **Altai Krai, Leningrad Oblast, Orenburg Oblast, Omsk Oblast, Primorsky Krai**, each
with its paired glossary term at the bar and a picture that was looked at. What this batch found.

- **THE 1900 `Guide to the Great Siberian Railway` CARRIES A WHOLE CARD PER TOWN ON THE LINE, AND IT IS
  THE BEST SINGLE SOURCE THIS COLLECTION HAS FOR SIBERIA.** Omsk gets three pages of it — the junction
  of the Om and the Irtysh, the sandy and partly saline soil, the dry air and the winds that raise
  blizzards in winter and dust in summer, Buchholz's 1714 expedition, Springer's five-bastion Vauban
  fortress of 1763, the Omsk territory of 1822 and the Governor-General's move from Tobolsk in 1839 —
  and Vladivostok gets two, from the *Capricieuse* in 1852 to the Tsesarevich's wheelbarrow in 1891.
  **Its geographical review (pp. 21–22) is a separate seam** and is what gave Primorsky Krai its
  minerals, its black earth and the highest mean annual temperature on the Siberian continent.
- **A GARBLED OCR DIGIT IS NOT A DATE, AND THE PAGE SEQUENCE IS.** The guide's Omsk page prints the
  fortress's founding year as `171!)` and Springer's rebuild as `ITtif)`; neither was used. The page
  NUMBER for the stone-laying was equally garbled (`68` between a clean 60 and a clean 64), and there
  the run settles it at 63 — **a number derived from an unbroken sequence is not a number invented.**
  Take the dates the OCR renders cleanly and leave the rest.
- **RAMBAUD'S PAGE HEADERS OCR AS DIGITS THAT LOOK LIKE OTHER DIGITS.** `,'>00 HISTORY OF RUSSIA` was
  read as page 300 and is page 200, settled by the facing header `CATHERINE II.: EARLY YEARS. 201`.
  **Read the header on the OTHER side of the spread before writing a page range.**
- **A CITATION'S ARTICLE NUMBER IS NOT GUESSABLE EITHER.** `gru-027`'s *Scientific Reports* paper was
  drafted as `29807` and is `29985`; Crossref's `article-number` field is what says so. Ask it before
  writing the card, not after.
- **A PICTURE SEARCH ON A FAMOUS NAME RETURNS THE TOWN THAT BEARS IT.** "Sol-Iletsk" gave a street
  corner with a municipal noticeboard, and the pinned salt-lake file gave a crowded holiday beach in
  which the lake is barely visible. The Burtinskaya Steppe — one of the Orenburg reserve's own plots —
  is the picture the card wanted, and it was reached through `Category:Landscapes of Orenburg Oblast`
  rather than through any search. **When a subject search fails twice, browse the oblast's landscape
  category.**
- **AND A RIVER'S OWN CATEGORY IS FULL OF THE WRONG COUNTRY.** `File:Ural river.jpg` is a beautiful
  aerial of meanders and oxbows and its own description says *between Uralsk and Atyrau, Kazakhstan*;
  it was one click from being installed on an Orenburg Oblast term. **Read the file's categories and
  `ImageDescription` before believing a river photograph is in the subject** — the Ural, the Irtysh and
  the Sikhote-Alin all cross a border or a neighbouring subject. The Sikhote-Alin candidate passed the
  same test, `Category:Livadiysky Range` putting it in Primorsky Krai.
- **A 4:1 PANORAMA IS THE WRONG SHAPE FOR THE CARD FRAME.** `.card-img` is a fixed 16:9 box filled
  `contain`, so a panorama of the Irtysh shows as a strip across the middle with paper above and below.
  An ordinary 4:3 view of the same river was the better picture for the same reason.
- **THE SALT AT ILLETZKAYA-ZASTCHITA IS MURCHISON'S BEST ORENBURG SEAM** (1845, pp. 184–185): the
  Kirghis using the outcrops long before the Russians occupied the spot, the caravans of Bukharians and
  Khivans to and from the city as *the great Russian entrepôt*, and a quarry cut about 21 metres into a
  mass so pure the salt is pounded for use without cleansing. Page 147 gives the undulating steppe and
  the red sandstone cliffs on the right bank of the Ural at the city.
- **HOSTS MEASURED THIS BATCH.** OPEN: `ncr-journal.bear-land.org` (Nature Conservation Research),
  Europe PMC's `fullTextXML` for `PMC11611917`, `api.crossref.org`, archive.org's `_djvu.txt` **with
  `-L`** — without following the redirect it writes a zero-byte file and looks like a dead identifier.
  RATE-LIMITED HARD: `upload.wikimedia.org` and the Commons API both, answering a Wikimedia error page
  for minutes at a time; every download in this batch needed an until-loop with a 25-second sleep.

### Batch 7 — the Ob oilfield, the Vyatka, the Sunzha, the chalk and the upper Don (`gru-028`–`gru-032`)

Khanty-Mansi Autonomous Okrug, Udmurtia, Chechnya, Belgorod Oblast and Tula Oblast, each with its
paired glossary term at the bar and a picture. Nine findings, of which the first is the one that
unblocks every remaining card in the deck.

- **THE UN DEMOGRAPHIC YEARBOOK'S TABLE 8 CAN BE EXTRACTED, AND THE RECIPE IS A CID MAP.** The PDF
  resisted every ordinary attempt: its content streams are Type0 text (`/C2_0`) whose strings are
  hex-encoded CIDs, so a `(...)`-string scrape returns binary noise and a raw inflate returns nothing
  readable. `table08.xlsx` is a 404 and no PDF tooling is installed here. What works is 60 lines of
  Node: index the objects, find each font's `/ToUnicode` CMap, parse its `beginbfchar` and
  `beginbfrange` blocks into a CID → Unicode map, resolve each page's `/Resources /Font` names to
  those objects, then walk the content stream taking `/Name … Tf` to switch maps and `<hhhh>` strings
  to decode. It yields the whole table cleanly. **That is `node .claude/pdf-text.js <file.pdf>`**, which
  carries both branches and its own reasoning in its header — reach for it before looking for a tool. **A second, simpler extractor handles a scanned USGS
  report** — single-byte fonts, `(...)` strings — and the two together cover every PDF this deck has
  met. Both are a few dozen lines and neither needs a dependency.
- **EVERY CITY FIGURE IN THIS DECK IS 1 JULY 2012, and the table says so on the country's own row.**
  Surgut 321,062, Nizhnevartovsk 261,011, Izhevsk 631,182, Groznyi 276,524, Belgorod 369,815,
  Stary Oskol 220,719, Tula 496,656, Novomoskovsk 129,555. **The capital is not always the largest
  city**: Khanty-Mansiysk is under 100,000 and so is not in the table at all, which is why that card
  names Surgut.
- **TWO AREAS IN THIS BATCH ARE REAL FIGURES RATHER THAN `?`, AND BOTH COME OUT OF AN ORDINARY
  RESEARCH PAPER'S STUDY-AREA PARAGRAPH.** Belgorod Oblast's 2,713.4 thousand hectares is stated by a
  RUDN agronomy paper on the region's soil erosion, and Tula Oblast's 25,700 km² by a Biodiversity
  Data Journal herbarium paper's *Geographic coverage* section. **Look for the study-area paragraph
  before writing `?`** — a flora or soils paper about one federal subject almost always opens by
  saying how big it is, where it is and what its climate does. Rosstat itself is unreachable from here
  (its TLS chain does not verify against this container's CA bundle, and that is not a thing to work
  around).
- **PENSOFT ARTICLE PAGES RENDER THROUGH JAVASCRIPT AND THE XML DOWNLOAD DOES NOT.** `bdj.pensoft.net/article/<id>/` hands
  back a shell; `…/article/<id>/download/xml/` hands back the whole paper. The same trick is worth
  trying on any journal whose HTML looks empty.
- **THE WMO LEG FAILS FOR AN OKRUG WITH NO STATION, AND A FIELD STATION'S OWN DATASET PAPER REPLACES
  IT.** There is no Khanty-Mansiysk entry in the WMO city list and Surgut's returns nulls for every
  month. The Mukhrino field station, 30 km south-west of the capital, publishes a ten-year
  hydrometeorological record in *Earth System Science Data* with the mean annual, January and July
  temperatures and the snow-cover duration — better than a normal, because it is dated and cited.
- **A NINETEENTH-CENTURY GEOGRAPHY COVERS EVERY SUBJECT IN THIS DECK AND IS THE BEST SINGLE FIND SO
  FAR.** Reclus's *The Earth and Its Inhabitants*, vol. 5 (*Russia in Europe*) and vol. 6 (*Asiatic
  Russia*), on archive.org as `universalgeograp05recl` and `universalgeograp06recl`, has a topography
  section for each government with populations, industries and the odd exact figure: Tula's government
  small-arms factory of 1712 and its 200,000 samovars, Izhevsk's arms works, the Votyaks of the Vyatka,
  Belgorod the 'White Town' of the chalk pits, Grozny's naphtha wells of 'no great commercial value',
  and Surgut as one of two towns in 960 miles of the Ob. **Its title pages carry no date**, so cite it
  `n.d. [1876–94]`, which is what the catalogue gives.
- **THE SOVIET DEPORTATIONS ARE CITABLE FROM KHRUSHCHEV'S OWN SPEECH.** Nothing openly published and
  scholarly on the 1944 deportation of the Chechens and Ingush could be reached from here, and a
  geography card only needs a sentence. The Secret Speech names it — *in March 1944 all the Chechen
  and Ingush peoples were deported and the Chechen-Ingush Autonomous Republic was liquidated* — and
  the Columbia Russian Institute's document collection carrying it is on archive.org at
  `dli.ernet.507401`. **Attribute it to Khrushchev rather than stating it flat**, which is what the
  rule about a state's account of its own actions asks for in both directions.
- **AND THE POST-SOVIET WARS FROM THE EUROPEAN COURT OF HUMAN RIGHTS.** HUDOC's viewer is a JS shell,
  but `hudoc.echr.coe.int/app/conversion/docx/html/body?library=ECHR&id=001-<n>` returns the whole
  judgment as HTML. *Isayeva v. Russia* (no. 57950/00, 24 February 2005) opens its facts with the
  autumn 1999 operations and the December fighting in Grozny — a court's finding of fact, open and
  permanent.
- **FRUS IS OPEN AND IS THE WAY TO DATE AN EASTERN FRONT EVENT.** `history.state.gov` answers, and
  Stalin's telegram to Roosevelt of 8 August 1943 records the recapture of Orel and Belgorod in his own
  words. `history.army.mil` and `apps.dtic.mil` are both shut here, so the American military histories
  are not an option.
- **A PICTURE SEARCH ON A RIVER'S GORGE RETURNS THE OTHER SIDE OF THE WATERSHED.** `Argun Gorge`
  returned `File:Argun River Valley, Georgia.jpg` — the right river, the wrong country, and a
  fine photograph. Lake Kezenoyam, reached through `Category:Quality images of Chechnya`, is the
  picture that card wanted. **`Category:Quality images of <subject>` is the fastest way into a
  federal subject's own photographs**, and it is where three of this batch's ten came from.

### Batch 8 — the Klyazma, the Amur, the Sura, the head of the Volga and the Rybinsk sea (`gru-033`–`gru-037`)

Vladimir Oblast, Khabarovsk Krai, Penza Oblast, Tver Oblast and Yaroslavl Oblast, with their five
paired glossary terms. Seven findings.

- **RECLUS'S *UNIVERSAL GEOGRAPHY* CARRIED FOUR OF THE FIVE, AND VOLUME 6 CARRIES THE FIFTH.** Volume 5
  has a topography section for every European Russian government — Tver, Yaroslavl and Kostroma at
  pp. 388–90, the Oka basin with Vladimir at 398–99, the Sura and Penza at 409 — and volume 6 does the
  same for Asiatic Russia, with the Ussuri and Lake Khanka at 427–28, the Ussuri tigers at 435–36 and
  Khabarovka at 443–47. **It is the single highest-yield source this deck has**; read it before
  searching anything.
- **A RUNNING HEAD IS BETTER EVIDENCE THAN AN INDEX, AND WHERE THEY DISAGREE CITE A RANGE.** Reclus
  vol. 6's own index files Nikolayevsk at 474 where the running head above the passage reads 417, and
  the text sits two pages after the head that reads 445 — three OCR readings of what is almost
  certainly 447. **Do not pick one**: the material genuinely spans 443–47 and that is what the citation
  says.
- **A DOI CAN RESOLVE TO A DIFFERENT PAPER, AND ONLY CROSSREF SEES IT.** DOAJ gives the Lobelia
  dortmanna paper on the oligotrophic lakes of Tver Oblast the DOI `10.15421/021754`; Crossref has a
  maize-genetics paper at that DOI, on the pages immediately before it in the same issue. The URL
  resolves, the article is real and openly readable, and the DOI is wrong — so the citation carries the
  journal's own article URL instead. **Run `check-citations.js` before writing the card's JSON, not
  after**: nothing else in the pipeline can see this.
- **A BILINGUAL RUSSIAN JOURNAL IS CITED IN RUSSIAN, WHICH IS ALSO WHAT KEEPS THE CHECKER QUIET.**
  *Трансформация экосистем* publishes an English title and abstract on its own English site, and
  Crossref registers only the Russian. Citing the English form would have the checker compare
  `Novikova` against `Новикова` and report a surname mismatch — a bilingual record, not an error, but
  reported as one. CLAUDE.md's own rule settles it: cite a foreign-language work under its own title.
- **THE UN DEMOGRAPHIC YEARBOOK'S TABLE 8 DUPLICATED A ROW, AND THE DUPLICATE LOOKS LIKE DATA.** Kovrov
  extracts as four dots followed by Vladimir's own three figures. Vladimir's line is right and Kovrov's
  is not there at all; the city was simply left out of the card rather than given a figure that belongs
  to somewhere else. **Read a row against a second city you already know before trusting it.**
- **AREAS: ONE OF FIVE.** Seregin's *Flora of Vladimir Oblast* grid dataset states the oblast at
  29,084 km² in its Study area description, with the altitude range, the climate means, the snow-cover
  length and the forest ecotone — the best single paragraph of physical geography this deck has found
  for any subject. Nothing comparable exists for the other four, so their Area cells are `?`.
- **A RIVER'S OWN ARTICLE RETURNS A PHOTOGRAPH OF ITS SOURCE, WHICH CAN BE A THOUSAND KILOMETRES AWAY.**
  The Amur's lead image is captioned as the confluence of the Shilka and the Argun — the right river and
  the wrong end of it, nowhere near Khabarovsk Krai. The Khabarovsk Bridge replaced it. **Read the
  Commons file description, not just the file name**; and `Category:Quality images of <subject>` again
  supplied two of the ten (the chapel over the source of the Volga at Volgoverkhovye, and the Strelka
  at Yaroslavl, after the Yaroslavl article's own lead image turned out to be a banknote).

### Batch 9 — the Sviyaga, the Sura, the Dvina, the Desna and the Vyatka (`gru-038`–`gru-042`)

`gru-038` Ulyanovsk Oblast, `gru-039` Chuvashia, `gru-040` Vologda Oblast, `gru-041` Bryansk Oblast and
`gru-042` Kirov Oblast, each with a paired glossary term at the bar and a picture of its own. Six
findings, of which the first is the one to carry into batch 10.

- **RECLUS VOLUME 5 CARRIES ALL FIVE, AND SO DOES RAMBAUD VOLUME 1.** Batch 8 established that the
  *Universal Geography* has a topography section for every European Russian government; this batch found
  that the *History of Russia* is its match on the other half of the card. Every one of the five took its
  second paragraph from Rambaud vol. 1 — Razin beaten outside Simbirsk (pp. 388–89), Ivan planting
  Sviyazhsk on the Sviyaga and founding Cheboksary among the posts that followed (253–54), the English
  merchant venturers' letters patent for Kholmogory and Vologda and Osip Nepei's wreck off Inverness
  (273–74), the Bryansk contingents and the monk Oslyabya at Kulikovo (201–02) with the Severian
  principality at p. 98, and the Novgorodian republic on the Vyatka (141–42). **Two open volumes now carry
  the whole card**, which is what makes five cards a session possible at all.
- **CROSSREF REGISTERS THE ENGLISH TITLE FOR SOME RUSSIAN-LANGUAGE JOURNALS AND THE RUSSIAN FOR OTHERS,
  AND ONLY A LOOKUP TELLS YOU WHICH.** Batch 8's rule — a bilingual Russian journal is cited in Russian —
  is right about *Трансформация экосистем* and wrong about all four Russian-language papers here:
  *Nauchnyy dialog*, *Povolzhskaya Arkheologiya*, *Radiatsionnaya Gygiena* and the *RUDN Journal of
  Russian History* each register a Latin-script author list and an English title, so all four are cited in
  English and `check-citations.js` reports zero mismatches. **The rule is to ask Crossref, not to guess
  from the language of the article.**
- **A TWENTY-FIVE-AUTHOR PAPER IS CITED `et al.` AND STILL CHECKS.** The Bryansk radiation survey carries
  twenty-five names; the checker takes the author from the slot before the first comma, so
  `I. K. Romanovich et al.` compares initials against initials and passes.
- **ADDING BOTH A CARD AND ITS GLOSSARY TERM MEANS FINDING TWO DISTINCT PICTURES, AND THE SECOND IS THE
  HARDER ONE.** The fetcher's `subject` branch missed three of five here (`Presidential Bridge
  (Ulyanovsk)`, `Monument to Mother Patroness` and `Trifonov Monastery` are not article titles), so the
  route that worked was `Category:<subject>` on Commons followed by `imageinfo` on the named file. **A
  category whose files are numbered rather than named is useless** — `Category:Cheboksary` is 123 files
  called `20220626 Cheboksary NNN.jpg` — where `Category:Bodies of water in Chuvashia` gave
  `File:Sura near Alatyr.jpg` on sight.
- **A LANDMARK'S LEAD IMAGE CAN BE WATER AND SKY.** The Kuybyshev Reservoir returned a picture that is
  horizon, cloud and ripples and says nothing whatever about Ulyanovsk Oblast; it was dropped for a view
  of the city across the Sviyaga, which is the river the card is about. The same happened to the Vyatka:
  its category's obvious file is a railway bridge with a leafless bush filling a third of the frame, and
  `File:Вид на Вятку с Сокольей горы.jpg` — the river from Sokolya Hill in Kotelnichsky District — is the
  picture. **Look at the candidate before believing the caption.**
- **AREAS AND OBLAST POPULATIONS: NONE OF FIVE.** Every one of the five research papers was grepped for a
  km² figure and none states one, so all five Area cells and all five Population cells are `?`. What the
  UN table did give is the batch's one grid surprise: **Vologda Oblast's largest city is Cherepovets at
  315,000, against the capital Vologda's 305,000**, so the Largest city row names a town that is not the
  seat of government — the first time in this deck that the two have differed.

### Batch 10 — the Don, the Seym, the Oka, the Tom and the Lena (`gru-043`–`gru-047`)

Lipetsk, Kursk, Ryazan, Tomsk and Sakha (Yakutia). Six findings.

- **A DOI COMPOSED FROM THE SHAPE OF ITS SIBLINGS RESOLVES TO A REAL PAPER THAT IS NOT YOURS.** The
  Lebedev Devonian-fishes article was drafted with `10.3176/earth.2018.06`, built by counting articles in
  the issue; Crossref hands that DOI back as *A new species of cyathaspid … Prince of Wales Island,
  Nunavut* by Elliott et al. at pp. 88–95. The real one is **`10.3176/earth.2018.04`**, found by a
  Crossref bibliographic query on the title. **Nothing downstream could have caught it** — the URL
  resolves, the article is real, the marker rules pass — and it is exactly the fault CLAUDE.md's citation
  bullet warns about. **Ask Crossref for the DOI; never derive one.**
- **RAMBAUD'S "BATTLE OF LIPETSK" IS A DIFFERENT LIPETSK.** His 1216 battle is placed "near
  Pereiaslavl-Zalieski", in Vladimir–Suzdal country, and has nothing to do with the Don one. What the
  volume does carry for this oblast is Tamerlane's Tatars reaching **Yelets** on the Don in the campaign
  that destroyed Astrakhan and Sarai in 1395 (p. 207). **A place name in a nineteenth-century index is
  not a place.**
- **AN AUTHOR CAP OF TWO DECIDES WHICH PASSAGES A CARD CAN USE.** Kursk has three good Rambaud pages —
  the Severian principality (98), Oleg of Kursk on the Kalka (152) and the baskak revolts (167–68) — and
  `check-cards.js` refuses a third citation by one author, so the Kalka was dropped and the card carries
  98 and 167–68. That is also what gives it its only date: **the rising against the tax-gatherers in
  1284**, the year two Olgovichi reigned there and one killed the other in the khan's name.
- **MDPI IS WALLED FROM THIS SANDBOX AND COPERNICUS IS NOT.** `mdpi.com` and
  `e3s-conferences.org` both answer 403; `bg.copernicus.org`, `intercarto.msu.ru`, `mir-nayka.com`,
  `kirj.ee`, `goldhorde.ru`, `geology-mgri.ru` and `elib.sfu-kras.ru` all answer 200. A DOAJ search for
  Yakutia returns mostly MDPI, so **read the host before reading the abstract**.
- **A REPOSITORY HANDLE IS A CITABLE ADDRESS WHERE THERE IS NO DOI.** The Nikolaev and Skachkov
  tree-ring paper has none; `elib.sfu-kras.ru/handle/2311/3009` resolves, carries the Dublin Core
  metadata and serves the PDF, from which the English title and the page range 43–51 were read. It is
  UNCHECKED by `check-citations.js` rather than wrong, which is the honest state.
- **COMMONS RATE-LIMITS HARD ENOUGH TO DECIDE THE PICTURE PASS.** Category listings and `Special:FilePath`
  both returned *Wikimedia Error* pages within a few calls, so the route that worked was the English
  Wikipedia's own `prop=images` on a named article (a different host) followed by a paced
  `Special:FilePath` fetch with retries. Two candidates were rejected on sight: the Ryazan Kremlin's lead
  image is a **night shot, mostly black and watermarked**, and the Zheleznogorsk one would not download at
  all. **The Streletskaya steppe in flower is the right picture for a black-earth card** — the Central
  Black Earth Reserve is unploughed chernozem, which is the thing the prose is about.

## Filling the grid — the population and area pass (Sep 2026)

On request: *"within this deck, you're allowed to use Russian sources like the Federal State Statistics
Service or others. The majority of sources on each card should be English but the Russian sources might
help us access data on population and area numbers."* Every shipped `gru-` card carried `?` in the
Population and Area cells; all 47 are now filled, and every card written from here on carries both from
the start. Seven findings, of which the first three are about reaching the data at all.

- **ROSSTAT'S OWN HOSTS CANNOT BE REACHED FROM THIS SANDBOX, AND IT IS NOT AN EGRESS POLICY.**
  `rosstat.gov.ru`, `eng.rosstat.gov.ru`, `gks.ru` and `showdata.gks.ru` all fail TLS verification —
  their certificates chain to a Russian national CA that no standard trust store carries — and
  `www.fedstat.ru` answers and returns 403. The proxy's own status endpoint records no relay failure,
  because the refusal is the client's. **There is no flag for this and there must not be one**: the
  environment's rule is never to disable TLS verification.
- **THE WAYBACK MACHINE SERVES THEM OVER ITS OWN CERTIFICATE, AND THAT IS THE ROUTE.**
  `web.archive.org/web/<ts>id_/<rosstat url>` returns the real bytes. It is also how the publication
  catalogue was read, the archived folder pages listing the files the live site links.
- **THE SOURCE IS ONE BILINGUAL TABLE AND IT ANSWERS BOTH COLUMNS AT ONCE.** *Российский статистический
  ежегодник 2023 / Russian Statistical Yearbook 2023* (Rosstat), «Территория и население субъектов
  Российской Федерации на 1 января 2023 г. / Territory and urban settlements of constituent entities of
  the Russian Federation as of January 1, 2023». Its own footnotes say what the figures are: territory
  **according to Rosreestr**, the land-registry, and population **estimated in light of the 2021 census**.
  Because the table prints an English column beside the Russian one, it is an ENGLISH source and does not
  spend a card's Russian-source allowance at all.
  Archived at `https://web.archive.org/web/2024id_/https://eng.rosstat.gov.ru/storage/mediabank/Yearbook%202023%281%29.pdf`
  — **percent-encode the parentheses**, or `SRC_URL_RX` truncates the address at the first `(`.
- **THE PDF READ AS NOTHING AT ALL, TWICE OVER, AND BOTH FAULTS ARE NOW FIXED IN `pdf-text.js`.** Every
  dictionary in it lives inside a compressed `/Type /ObjStm`, so the object scan found no page and the
  tool exited 0 with an empty file — the worst shape a failure can have. Unpacking those streams then
  yielded the words and **12,343 digits in 2.2 MB**, because the CID-or-simple choice is made PER PAGE and
  the yearbook sets its prose in a Type0 font and its FIGURES in a simple one, so every `(...)` run was
  dropped. Reading both gives **359,507**. The unpack is a FALLBACK used only where the scan finds no page
  and the literal decoding is `--literals`, both because neither is inert on a hybrid file: turning them
  on unconditionally cost `rus17e.pdf` 67 KB of its own front matter. All ten PDFs this repo has read are
  byte-identical under the default.
- **THE NAME COLUMN AND THE NUMBER COLUMNS ARE SEPARATE RUNS, SO THE NAME IS TAKEN AFTER THE LAST
  CYRILLIC CHARACTER** — not after the last `/`, which the PREVIOUS row's city list also carries, and not
  by longest-suffix match against a name table, under which *Томская область / Tomsk Region* matches
  `omsk region` and files Tomsk's figures under Omsk. **Leningrad Oblast is the one row no parser gets**:
  its figures are split character by character (`8` `3` `,` `9`), so they were read by eye.
- **THE SECOND WITNESS IS WHAT SAYS NO ROW WAS SWAPPED.** Every figure was diffed against
  citypopulation.de, which compiles the same Rosstat series: **not one population differs by more than
  2.9%**. The areas that do differ are the two sources genuinely disagreeing, and Rosstat's are the
  official ones — Chechnya 16,200 km² against 12,300, Astrakhan 49,000 against 44,100, Ivanovo 21,400
  against 23,900, Chukotka 721,500 against 737,700. The three autonomous okrugs have no row there at all,
  citypopulation nesting them under their parent.
- **THE OKRUG NESTING IS ANSWERED BY THE SOURCE ITSELF.** The table publishes both forms — «Тюменская
  область без автономных округов» at 160.1 thousand km² and 1,608.5 thousand people, and «Архангельская
  область без автономного округа» at 413.1 and 964.3 — so the four cards the plan flagged need no
  judgement. Natural Earth's polygons tile, so the map shades the parent WITHOUT its okrugs: `gru-009`
  Tyumen therefore gives the drawn figure and its cells say **“less okrugs”** outright. Arkhangelsk has
  not been written yet and takes “less Nenets” when it is.

**The grid is not footnoted, and that is the collection's own practice rather than an omission.** The 58
China geography cards carry no census citation either; the figures are researched when the card is
written and the source is recorded here. Folding a cited clause into the 47 shipped abstracts is a prose
pass rather than a data fill — they run 274–325 words against a 330 ceiling, so thirty of them would have
to be trimmed to make room, and CLAUDE.md's own warning about shortening cited prose applies.

**The format is three significant figures, as asked for**: population as `1.13M (2023)` / `498k (2023)` /
`47.8k (2023)`, matching the Largest city cell the deck already used; area in the site's own unit form,
`24,000 km² (9,270 sq mi)`, rounded to the same precision, so the reader's metric/imperial switch can
still find it.

### Batch 11 — the Oka, the spit, the Dvina, the Ingoda and the Selenga (`gru-048`–`gru-052`)

Kaluga, Kaliningrad, Arkhangelsk, Zabaykalsky Krai and Buryatia — the first five written with the
Population and Area cells filled from the start, and the first that CITE the Rosstat yearbook on the
card. Seven findings.

- **KALININGRAD IS THE ONE CARD IN THIS DECK WHOSE GROUND WAS NOT RUSSIAN BEFORE 1945, AND THE WHOLE
  SPINE HAS TO BE REPLACED FOR IT.** Reclus wrote about *Russia in Europe* and this was East Prussia, so
  the geography leg is an open Kaliningrad journal — Anokhin and others on the Curonian Spit, which gives
  the Valdai moraine plain, the Baltic Ice Lake to Litorina Sea sequence and the spit thrown up six
  thousand years ago. The history leg is still Rambaud, who has the Teutonic Order building Königsberg
  about 1225 and Fermor taking it in January 1758 — and then **a primary document for the transfer**: the
  Potsdam protocol's own section VI, at the State Department's *Foreign Relations of the United States*.
  **A transfer of territory is cited from the instrument, not from a history of it.**
- **THE TWO-SOURCES-PER-AUTHOR CAP DECIDED ARKHANGELSK, AND A PAGE RANGE IS THE ANSWER RATHER THAN A
  DROPPED CLAIM.** Reclus has three passages the card wants — p. 341 for the size and the density, p. 347
  for the Dvina's width, depth and delta, p. 356 for the port and Peter the Great's throttling of it —
  and `check-cards.js` allows two citations by one author. Citing **“347, 356” as one note** keeps all
  three claims and one citation.
- **A READ-BACK CAUGHT TWO CLAIMS THE SOURCE DOES NOT MAKE, both of them plausible and both written
  down before the page was re-read.** Reclus's “one-fourth of European Russia … one-sixtieth of the
  empire's population” is about **Archangel AND Vologda together**, not Archangel alone; the sentence was
  rewritten to say so. And the Selenga delta paper says the delta stores sediment and says nothing about
  where that sediment comes from, so “coming down from Mongolia” came out. **Neither would have failed
  any checker.**
- **RAMBAUD HAS A THIRD VOLUME AND IT WAS NOT IN THE TOOLKIT.** *A Popular History of Russia, from the
  Earliest Times to 1882*, vol. 3, trans. L. B. Lang, ed. Nathan Haskell Dole (Boston: Estes and Lauriat,
  1882), `archive.org/details/historyofrussia03ramb`, carries the Nerchinsk treaty's date of 27 August
  1689, the hundred and fifty years of exclusion from the Pacific, and the treaty of Burinsk of 1727 —
  the spine of both Transbaikal cards. Volume 2 has the same treaty from the other side, at p. 22.
- **A LEAD IMAGE OF THE CURONIAN SPIT IS AS LIKELY TO BE LITHUANIAN AS RUSSIAN.** `fetch-geo-images.js`
  returned *Mirties slėnis nuo Parnidžio kopos* — the Valley of Death from the Parnidis dune, which is at
  Nida, in Lithuania. It is a fine photograph of the wrong country for a card about Kaliningrad Oblast,
  and nothing about the file says so. **Pin the replacement out of
  `Category:Curonian Spit National Park (Russia)`**, and expect to read licences there: two of its best
  aerial views are under the **Free Art License**, which the pipeline rightly refuses.
- **COMMONS RATE-LIMITS THE GLOSSARY PICTURES HARDER THAN THE CARDS', AND THE ANSWER IS PACING PLUS
  WRITING AFTER EVERY FILE.** `fetchmeta2.js` waits 45 seconds between files, backs off 75 on a 429 and
  saves as it goes, so a run that is cut short still leaves what it managed. Three of the first five
  candidates failed the bar and the reasons are worth knowing: one **FAL**, and two under 900 px —
  **both of the undersized ones came from the English Wikipedia's own `pageimages` field, which is not
  size-filtered**, so a lead image is a candidate and never a choice.
- **THE ROSSTAT CITATION'S URL IS PERCENT-ENCODED AND RENDERS WHOLE.** `Yearbook%202023%281%29.pdf`
  carries no bare `(` or `)`, so `SRC_URL_RX` matches the whole address and the reader gets a live link
  to the archived yearbook; the raw form would truncate at the first bracket. Verified on the rendered
  card rather than assumed.

### Batch 12 — the Tsna, the delta, the Shokhonka, Elbrus and the Okov forest (`gru-053`–`gru-057`)

Tambov Oblast, Astrakhan Oblast, Ivanovo Oblast, Kabardino-Balkaria and Smolensk Oblast, each with a
paired glossary term at the bar and a picture. Findings worth keeping.

- **BADDELEY IS THE CAUCASUS SPINE AND IT WAS NOT IN THE TOOLKIT.** John F. Baddeley, *The Russian
  Conquest of the Caucasus* (London: Longmans, Green, 1908),
  `archive.org/details/cu31924028754616`, carries the Kabardan princes as Adyghe (p. 8), Tsar Feodor's
  title of lord "of Kabarda, of the Tcherkess and Mountain princes" (p. 9), the Mozdok quarrel and the
  open hostility of 1765–79 (pp. 33–34), and Shamil's April 1846 crossing with Nalchik as "the key of
  the position" and the Balkar chiefs refusing to join him (pp. 422–23). **The two-sources-per-author
  cap bites here**: four passages, two citations, so they are cited as "8–9, 33" and "422–23".
- **RECLUS'S PAGE NUMBERS CANNOT BE READ OFF THE OCR HEADER AND MUST BE BRACKETED.** The running heads
  come through as `898 RUSSIA IN EUROrE` for page 398 and `3G8` for 368, and the statistical appendix has
  none at all. **Find the nearest CLEAN head either side and interpolate**: the appendix's towns table
  sits between the "Principal Towns" caption and the `APPENDIX. 485` head, so it is p. 484 — which is
  the page earlier batches had already cited. Pinned this batch: p. 273 (the Dnieper's source), 286
  (Smolensk and the 1812 burning), 367–69 (the Volga delta, the bugry, the 98 days of ice), 398–99
  (the Tsna, Morshansk and the Skoptsy; Ivanovo and Shuya; Suzdalia) and 484 (the town populations).
- **A RUSSIAN JOURNAL'S ENGLISH TITLE IS THE ONE TO CITE, AND ONE PER CARD IS THE LIMIT.** The Antonov
  aftermath (Nikolashin, *Herald of an Archivist*), the Ivanovo-Voznesensk strike (Platonov, *Proceedings
  of the Komi Science Centre*) and the Tsna (Bukovskiy et al., *Bulletin of Irkutsk State University*)
  all publish an English title and abstract over a Russian article. Each card takes **one** of them
  beside the Rosstat yearbook, which keeps the majority English on every card.
- **THE ANTONOV PAPER'S PDF IS CID-ENCODED AND ONLY ITS ENGLISH ABSTRACT COMES OUT.** `pdf-text.js`,
  with `--literals` or without, returns the English half readable and the Russian half as letter soup —
  so the card rests on what the abstract states and no more: the rising of 1920–21 in the Tambov
  gubernia, and the socio-economic, ideological, cultural and educational campaign that followed it.
- **A SATELLITE VIEW GETS THROUGH THE SKIP LIST WHEN ITS FILE NAME IS AN INSTRUMENT ACRONYM.**
  `fetch-geo-images.js` offered `File:VolgaDelta AMO 2005jun11.jpg` for Astrakhan — an Aqua MODIS scene,
  refused here on the standing rule that orbital imagery is a picture of a place and not a view of it —
  and, on an earlier pass, a **1968 postage stamp** of a purple swamphen. Both were rejected by eye.
  **The contact sheet is what catches this**, and it caught a third: the first Plyos candidate was a
  moored pontoon under a birch rather than the town.
- **THE CONTACT SHEET NEEDS THE FILES ON DISK.** Headless Chromium could not load
  `upload.wikimedia.org` at all, so the sheet rendered five empty frames and read as five bad pictures.
  Fetch each candidate through `commons.wikimedia.org/wiki/Special:FilePath/<FILE>?width=700` first —
  **a `/NNNpx-` thumbnail URL rewritten by hand 400s**, since the width has to be one Commons actually
  offers — then point the sheet at the local copies.
- **A PINNED FILE CARRIES NO CAPTION, AND THE FETCHER WILL NOT INVENT ONE.** `subject` mode fills
  `title`, `desc` and `alt` from the subject's own name; `file` mode leaves all three empty, and an
  empty `desc` ships as a bare full stop. Write them by hand for every pinned picture.

### Batch 13 — the Mordvin enclaves, the Zeya mouth, the kurgan, the tundra and the Oka (`gru-058`–`gru-062`)

Mordovia, Amur Oblast, Kurgan Oblast, Komi and Oryol Oblast. The first batch written entirely under
the facts-echo rule, so every card's fifth opening sentence is a DENSITY and a capital SHARE rather
than the area and population the grid prints. Findings.

- **A NEW TOOLKIT SOURCE: THE `GUIDE TO THE GREAT SIBERIAN RAILWAY` (1900).** The Ministry of Ways of
  Communication's own English guide (`archive.org/details/guidetogreatsibe00russuoft`) walks the line
  station by station and is the richest open account of the West Siberian districts there is. It
  carried **the whole of `gru-060`** — the Tobol's course, the fir and birch, the mound the capital is
  named for, the Pugachov revolt, the nine Decembrists and the seven thousand emigrants forwarded in
  the summer of 1894 (pp. 129–32, 136, 175–77) — and Blagoveshchensk's founding and its trade with
  Aigun for `gru-059` (pp. 379–80).
- **TWO PAGE RANGES OF ONE WORK ARE ONE CITATION EACH, AND THAT IS THE CAP TALKING.**
  `check-cards.js` fails a card citing one author more than twice, so a book supplying four separate
  passages has to be merged down to two ranges. Kurgan's guide citations are `129–32, 136` and
  `175–77`; the same merge was made on Reclus for `gru-058`, `gru-061` and `gru-062`.
- **A REPUBLIC NAMED FOR A PEOPLE IS A CARD ABOUT THE PEOPLE.** Mordovia's ground is unremarkable and
  its interest is the Mordvins — Ptolemy's possible Aorzes, the Byzantines' numerous people, the
  baptised mythology in which Saint Nicholas is smeared with butter for a good harvest and stood in
  the corner for a bad one. The modern half comes from Ivlieva and Manukhov's census mapping, which
  is what lets the card say the enclaves are not one block and that many Mordvins live outside them —
  a claim about the republic's name that no gazetteer supplies.
- **`Komi` IS THE ANSWER TERM AND `Komi_Republic` IS THE KEY.** `russia-subjects.js` and the plan
  both name the subject *Komi*, so that is what the card answers; the glossary term takes the real
  Wikipedia slug and claims the bare surface as an ALIAS. Measured first: the bare word occurs in
  exactly one shipped abstract, its own, so the alias buys the card's pairing and costs nothing.
- **A CHERNOBYL CARD IS A RAINFALL CARD.** `gru-062`'s closing sentence rests on Simonova and
  Bublikova's retrospective in *Radiation Hygiene*: twenty-two of the oblast's twenty-four districts
  contaminated, the fallout extremely patchy because it fell with the rain, and of the 1,243 people
  sent to the clean-up 43 per cent later registered disabled. The date line therefore carries 1986
  beside the capital's 1564 and the fire of 1679.
- **A WIKIPEDIA ARTICLE'S OWN LEAD PICTURE CAN BE A PICTURE OF SOMETHING ELSE.** `fetch-geo-images.js`
  answered the subject *Zeya (river)* with `File:Meanders of Kamchatka river.jpg` — a perfectly good
  photograph of the wrong river, used on that article to illustrate meanders. **The fetcher reports
  the licence and the size, never the subject**; the contact sheet is what caught it.

### Batch 14 — the Alans, the Cheremis, the Kola ore, the Krom and the Volkhov (`gru-063`–`gru-067`)

North Ossetia–Alania, Mari El, Murmansk Oblast, Pskov Oblast and Novgorod Oblast. Three new toolkit
sources, and the batch that finally made the point about what a picture search can and cannot
establish. Findings.

- **THREE NEW TOOLKIT SOURCES, ALL OPEN.** Baddeley's <i>The Russian Conquest of the Caucasus</i>
  (1908, `archive.org/details/cu31924028754616`) is the standard English narrative of the Caucasian
  wars and carries the Ossetian passes for `gru-063`. **Dzitstsoity 2019** in <i>Voprosy onomastiki</i>
  settles what nothing else reachable does — that <i>Alan</i> and the Ossetians' own <i>allon</i> are
  the same word — which is the whole of why the republic carries a double name. And **Fedorov 2022**
  in <i>Arktika i Sever</i> is the open account of how the Kola peninsula was industrialised, which
  the nineteenth-century geographers by definition cannot supply.
- **A GRAMMAR IS A DATE LINE.** `gru-064` had no datable modern event that was not also a claim about
  Soviet nationality policy, and the honest fixed point turned out to be a book: Veniamin Puzew's
  1775 <i>Works Belonging to the Grammar of the Cheremis Language</i>, the first grammar of Mari,
  described by Mikhailov and Lastochkina. A card about a people whose name changed twice is anchored
  by the year somebody first wrote their language down.
- **A BARE CENTURY IS NOT A DATE `cardYears` CAN READ, AGAIN.** `gru-064`'s first draft dated the
  Mari's appearance in the sources to the "13th century" and the card fell to a sort year of 0. It is
  written `c. 1200 – 1300` — the span the century MEANS, asserting no precision the sources have not
  got — and reads back correctly. The same check caught nothing on the other four, which is what
  makes reading the sort year back a per-batch step rather than a per-card one.
- **NEITHER `Mari` NOR `Novgorod` MAY BE CLAIMED AS A BARE ALIAS, AND BOTH WERE MEASURED.** *Mari*
  occurs in `rm-029` as Mari on the Euphrates, a Bronze Age city in Syria; *Novgorod* occurs in four
  shipped abstracts and means the MEDIEVAL CITY in every one of them, not the modern oblast. Both
  terms are therefore reached by their full keys alone. **Ask the corpus before claiming a short
  surface** — the republic's own name being a common word is exactly the shape that gets through.
- **EIGHT SUBJECTS FAILED BEFORE MARI EL GOT A PICTURE.** `Mari Chodra National Park`, `Sheremetev
  Castle`, `Yurino`, `Mari Chodra`, `Bolshaya Kokshaga Nature Reserve`, the city `Yoshkar-Ola` and
  `Kozmodemyansk` all returned MISS from `fetch-geo-images.js`; `Volga River` returned a photograph
  taken at Yaroslavl and `Mari people` returned Dmitriev's monks of the Michael-Archangel monastery,
  both rejected on subject. What worked was a **paced category search** — and the category is not
  guessable: `incategory:"Mari El Republic"` returns 0 and `incategory:"Mari El"` returns 22.
  **A zero from a category query is a wrong category name far more often than it is an empty
  category.**
- **…AND THEN `subject: "Yoshkar-Ola"` WORKED WHERE `city: "Yoshkar-Ola"` HAD NOT.** The two modes ask
  different endpoints, so a MISS from one says nothing about the other. The glossary term carries the
  Brugge Embankment from it; the card carries Lake Yalchik out of the category search.
- **THE COMMONS `list=search` ENDPOINT IS HARD-THROTTLED FROM THIS SANDBOX** and answers 429 to a
  second query fired within a minute or two of the first. The subject, city and file modes of
  `fetch-geo-images.js` use other endpoints and keep working throughout. **Pace the category queries
  in a background task**; do not read a 429 as a shut host.
- **A DOWNLOAD CAN SAVE AN HTML ERROR PAGE UNDER A `.jpg` NAME.** The Teriberka file's DISPLAYED title
  and its URL's percent-encoded name differ by one Cyrillic character, and retyping the title by eye
  produced a 404 body written straight into the file. The fix is to unquote the `File:` segment out
  of the credit URL rather than to retype the name, and to `file -b` the result before looking at it.
- **THE VICTORIAN SOURCES' JUDGEMENTS ARE NOT REPEATED.** Reclus and Baddeley both editorialise about
  the peoples they describe, in terms this site will not print. What is taken is the durable factual
  content — the passes, the forest, the ore, the fisheries — and nothing else.

### Batch 15 — Kostroma, the Ingush towers, the Abakan kurgans, Onega and the Yamal (`gru-068`–`gru-072`)

Kostroma Oblast, Ingushetia, Khakassia, Karelia and the Yamalo-Nenets Autonomous Okrug. One finding in
this batch is about the SOURCE TABLE rather than about any card, and it is the one to read first.

- **ROSSTAT'S TERRITORY COLUMN AND ITS DENSITY COLUMN DISAGREE FOR EXACTLY TWO SUBJECTS, AND THE
  DISAGREEMENT IS THE 2018 CHECHNYA–INGUSHETIA LAND SWAP.** Table 2.1 gives Ingushetia 3.1 thousand km²
  beside a density of 143.1, which implies 3.63; and Chechnya 16.2 beside 98.0, which implies 15.65.
  Every other row in the table is self-consistent to within rounding — that was checked by computing
  population ÷ area against the printed density for all the rows the extraction resolves, and the only
  other flag is Sakha, whose area is `3 083,5` split by its thousands space. **The 2022 edition prints
  the same two pairs**, so it is not a glyph slip in one extraction. The pre-2018 areas were 3,628 km²
  for Ingushetia and 15,647 km² for Chechnya, which reproduce both densities exactly, so the AREA column
  carries the post-swap figures and the DENSITY column was computed on the old ones.
  · **So `gru-069` takes 3,100 km² and states NO density** — the capital share carries its fifth
    sentence instead. **A Chechnya card must do the same**, and that is the only other row affected.
  · **The check that found it is arithmetic over the whole column, not a reading of one row.** A single
    inconsistent figure in a cited table looks exactly like a correct one; what makes it visible is that
    every other row agrees.
- **A WMO STATION IS NOT ALWAYS IN THE CAPITAL, AND TWO OF THESE FIVE HAD NO CAPITAL RECORD AT ALL.**
  `Nazran'` (1109) and `Abakan` (1108) are listed and carry no climate months. The answer is the
  station the service DOES hold inside the same subject — `Ordzhonikedzevskaja` (1036), which is Sunzha
  in Ingushetia, and `Hakasskaja` (1010) in Khakassia — and **the card names that place rather than
  saying "the capital"**, since the sentence would otherwise be false. Salekhard is in the list under
  the spelling `Salehard`, so a name that misses is worth trying again transliterated.
- **THE PICTURE RULE COST FIVE REJECTIONS IN TEN.** A rock festival for Petrozavodsk and a zoo gate for
  Abakan say nothing about Karelia or Khakassia; a winter aerial captioned *Ob river* is the middle Ob
  at a forested town rather than the okrug's tundra; a street scene in Muravlenko is an ordinary street.
  **And two otherwise excellent photographs carry a WATERMARK** — the Kizhi Pogost close-up ("Peer Gynt
  2014") and a wide view of Nazran ("SAG") — which the licence bar excludes however good the picture is,
  and which only looking at the file reveals.
- **AN ARCHIVAL PHOTOGRAPH CAN BE THE BEST PICTURE OF A LANDSCAPE.** The great Salbyk kurgan was
  photographed ringed with its upright slabs before excavation, with a horseman on the summit for scale,
  which is precisely what `gru-070`'s prose describes and what no modern view of the site can show; and
  the Yamal card carries Nenets herders before their tents in 1975, the okrug having no single famous
  natural landmark to photograph. **Both captions say when the photograph was taken**, which is what
  keeps a dated picture honest.
- **THREE CROSSREF ROWS WERE DECLARED FOR THIS BATCH, ALL OF THEM RECORD FORMATTING RATHER THAN WRONG
  NAMES.** Kavkazologiya deposits its byline surname-first; Kemerovo deposits a middle initial as a
  CYRILLIC Е, which defeats the checker's initials comparison and reports as a differing given name;
  and Arkheologiya Evraziyskikh Stepey publishes English bylines and deposits the Russian ones. Each was
  settled by reading the article's own byline — the Dzarakhov PDF, the Kemerovo author page, the
  journal's own English metadata — before the row was written.
- **COMMONS' `api.php` IS HARD-THROTTLED FROM THIS SANDBOX AND ITS CATEGORY PAGES ARE NOT.** Every
  `list=search` and `prop=imageinfo` call in this batch came back 429 or empty within seconds of the
  first, which reads as *Commons has nothing* and is really *Commons will not answer*. **The HTML
  category page answers every time** — `commons.wikimedia.org/wiki/Category:<name>`, scraped for
  `/wiki/File:` links — and so does the file description page, which carries the author, the date, the
  original pixel size and the licence short name. **And `Special:FilePath/<file>?width=1920` resolves
  to the canonical `/thumb/<shard>/…/1920px-…` address**, so the two-character shard is READ rather
  than guessed, which is the rule a hand-built `src` breaks. A 404 from a category page is a wrong
  category name, not an empty category, exactly as a zero from a search is.
- **THREE MORE PICTURES WERE REJECTED BY LOOKING AT THEM, AND ONE OF THEM IS THE THIRD WATERMARK OF
  THE BATCH.** `Vadimrazumov copter - Erzi.jpg` is the best aerial view of the Erzi towers on Commons
  and carries a photographer's URL burnt across the bottom right; `Kizhi, Kizhi Pogost - panoramio.jpg`
  is a **museum information board** photographed at the landing stage, which is the text-panel fault
  the contact sheet was written for; and `Кижский погост. Остров Кижи 2.jpg` is the jetty, with no
  pogost in it at all. **Not one of the three could be told from its file name.**

- **AND NEITHER `Karelia` NOR A BARE `Kostroma` WAS CLAIMED WITHOUT MEASURING.** *Karelia* occurs in one
  shipped abstract outside this deck, `ww2-159`, where it means Soviet Karelia — the same territory the
  term describes — so the alias is claimed; *Kostroma* occurs in `gru-018` meaning the governorate and
  the city, so the term is keyed `Kostroma_Oblast` and claims no bare name.

### Batch 16 — `gru-073` to `gru-077` (Adygea, Karachay-Cherkessia, Sakhalin Oblast, Tuva, Kamchatka Krai)

- **A FIFTH WAY THE WMO LEG FAILS: THE STATION IS LISTED AND ITS NORMALS ARE EMPTY.** Cherkessk has a
  World Weather Information Service page, it answers 200, and every monthly cell on it is blank — which
  reads, on a quick look, exactly like a page that has not loaded. The four failures already recorded
  are a missing city, a city under another spelling, a page that is a bot wall, and a station that is
  not the capital; this one is none of them. **Read a normals table before citing it**, since a
  citation to a page with no figures on it is a citation a reader cannot use and no checker can see.
- **A DOI THAT RESOLVES TO `elibrary.ru` IS A LOGIN WALL, AND THAT IS A REAL ACCESS FAILURE RATHER
  THAN A BOT ONE.** The obvious source for the Teberda fir forests, in *Lesnoy Zhurnal*, resolves
  there and asks for an account, so it was dropped rather than cited — the bar is a URL a reader can
  open, and a 200 carrying a sign-in form is not one. **It was replaced by a BETTER source**, Kerefov,
  Kostin and Gubanov on the ichthyofauna of the Kuban basin in Karachay-Cherkessia, which is open at
  `scienceit.elpub.ru`, counts the republic's 419 rivers and 130-odd lakes, and names the Kuban's own
  first-order tributaries — so the geography half and the Zelenchuk church in the history half now
  stand on the same river.
- **THREE HOSTS MOVED AGAINST US SINCE THE LAST BATCH, AND ONE MOVED FOR US.** OpenEdition now serves
  an Anubis proof-of-work wall; OpenAlex now answers `429 Insufficient budget` to an anonymous query;
  `www.mdpi.com` 403s where `res.mdpi.com` serves the same PDF. Against that, **Commons' `api.php`
  answered normally throughout this batch**, where batch 15 had to scrape category pages for every
  candidate — so the reachability note above is a measurement of a day rather than a standing fact.
  **Re-measure rather than reading either back.**
- **`c. 900 – 1200` YIELDS ONLY ONE YEAR, AND THE CARD SORTS BY THE WRONG END.** `cardYears`'s plain-year
  rule matches 1000–2099, so a date line whose earlier figure is three digits loses it silently and
  `cardStartYear` takes the later one. Writing the era explicitly — `c. 900 – 1200 CE` — makes the era
  marker carry leftwards and both years parse. `gru-074`'s Alanian capital line was written the first
  way and sorted at 1200; **read the sort year back through `cardYears` after writing any date line
  whose earliest figure is under 1000 CE.**
- **ON THE KARACHAY DEPORTATION THE OPEN LITERATURE REACHABLE FROM HERE IS MEMORY STUDIES, NOT ARCHIVAL
  HISTORY.** What answers is Aibazova on the Karachay-Balkar documentary and feature films about the
  deportation, in *Gumanitarnye i Yuridicheskie Issledovaniya*. That is a source for what the exile
  still means to the people it fell on, and it is cited for that; it is not a source for the operation
  itself, and the card does not make it carry one. **Name what a source is evidence of.**
- **THREE MORE CROSSREF ROWS, ALL THE SAME TWO FAULTS.** Kavkazologiya deposits surname-first
  (`Yakhutl Yuri A.` against the journal's own English `Yuri A. Yakhutl`); *The New Research of Tuva*
  publishes English bylines and deposits the Russian ones (`Иванна Витальевна Отрощенко`); and
  `Antichnaya Drevnost i Srednie Veka` deposited a given name with its first letter missing
  (`nga Alexandrovna Druzhinina`). Each was checked against the journal's own article page before the
  row was declared.
- **TWO PICTURES WERE REJECTED BY LOOKING AT THEM, AND NEITHER COULD BE TOLD FROM ITS FILE NAME.**
  The lead image for Dombay-Ulgen is filed `2016 Dombay-Ulgen Mountain, Greater Caucasus, Abkhazia (7)`
  — the peak straddles the frontier and the photograph is taken from the far side of it, so a card
  about Karachay-Cherkessia would have carried a picture captioned as another country; it was replaced
  by Mount Chotcha in the Teberda reserve, which is the reserve the card's own background now cites.
  And the best wide view of Kyzyl carries **Фото Иргит В.** burnt into the corner — the fourth watermark
  the pass has caught — so the Tuva term took the aerial view of the Biy-Khem and Kaa-Khem meeting
  instead. **A landmark on a border is the shape to check for: the name is right and the country is
  not.**
- **AND ONE FILE WOULD NOT COME DOWN AT ALL WHILE ITS NEIGHBOURS DID.** `Fisht in Winter.jpg` answered
  429 to five requests over four minutes, by direct upload URL, by thumb path and by `Special:FilePath`,
  while every other candidate in the same run fetched first time. **A per-file throttle is not a reason
  to install a picture unseen**; the Adygea term took the Belaya at Rufabgo, which fetched at once.

### Batch 17 — `gru-078` to `gru-082` (Kalmykia, Altai Republic, Jewish Autonomous Oblast, Magadan Oblast, Chukotka Autonomous Okrug)

Five of the emptiest subjects in the federation, and the batch where the grid's question marks earn
their keep: three of the five capitals are too small for the UN's 100,000-inhabitant table and nothing
openable from here gives a figure for any of them.

- **THREE LARGEST-CITY CELLS ARE `"?"` AND THAT IS THE HONEST STATE.** Gorno-Altaysk, Birobidzhan and
  Anadyr all fall below the UN Demographic Yearbook's threshold, and Rosstat's bilingual territory table
  gives the subject's population without breaking it down by settlement — so the cell says the figure was
  looked for and not found, exactly as `gru-002` and `gru-024` already do. **The two cards that DO have
  the figure spend it**: Elista and Magadan are both in the UN table, and both are their subject's only
  town of any size, so each card's background could say what share of the subject lives there.
- **DENISOVA CAVE IS IN ALTAI *KRAI*, NOT THE ALTAI REPUBLIC, AND SO IS CHINETA II.** The obvious
  archaeology for `gru-079` is the wrong federal subject — the two are different entities with almost the
  same name, and nothing about a paper on "the Altai" says which. The card rests on Molodin's Ukok
  Plateau review instead, which states in its own words that the plateau is in the "southwestern part of
  the Altai Republic". **Check which Altai a site is in before citing it**; the deck has both.
- **A FIRST DRAFT CAME IN AT 222 WORDS BECAUSE THE SUBJECT IS EMPTY.** There is very little published in
  English about the Altai Republic that is not about Denisova, so the first `gru-079` ran short of the
  270-word floor and had to be rewritten longer off the Ukok material. The draft also carried an
  unsupported "almost a third live in the capital" — which is the one figure the card cannot have, since
  Gorno-Altaysk's population is exactly the cell that is `"?"`. **An empty subject pulls a background
  towards the figures it has not got.**
- **A CITATION CAN NAME A CLAIM ITS AUTHOR DOES NOT MAKE.** The `gru-080` draft hung an Amur-floodplain
  sentence on Lonkina, whose paper is about the standing stock and age structure of the Bastak reserve's
  woods and says nothing about the floodplain. Caught before writing; replaced with a Vitale-supported
  sentence about the Chinese border. **Re-read the source for the sentence, not for the subject.**
- **THE USHAKOV RECORD REVERSES THE NAME FIELDS, AND THE DOI IS NOT OPEN.** Crossref carries given
  "Ushakov", family "M.V." with the institute filed as a first author beside it, so `check-citations`
  reported the correct Chicago form as a mismatch; the row is declared in `CROSSREF_WRONG` with the
  landing page's own byline (Ушаков, М.В.) as the ground. **And the DOI resolves to Rucont, which sells
  the article for 90 roubles** — the abstract is free and carries every claim the card makes, but the
  citation is `[Paywalled]`, not `[Open access]`. The journal's own host, `vestnik.narfu.ru`, answers
  502. **An open-access label is a claim about the URL, and it has to be re-tested when the DOI is the
  only route.**
- **A PICTURE OF A NATURE RESERVE IS OFTEN A PICTURE OF AN ANIMAL.** Both Bastak and Chyornye Zemli lead
  with wildlife — a tiger and a saiga — because that is what a reserve photographs. The saiga picture is
  kept for the Kalmykia term: the herd is small in a wide frame and the picture is really of the flat dry
  steppe the term describes. The tiger is not, so `gru-080` went looking elsewhere.
- **AND `Bastak Nature.jpg` IS IN IRAN.** Pinned by hand off a Commons search for "Бастак", it shows arid
  mountains, a minaret and a mosque — Bastak in Hormozgan, not the reserve in the Jewish Autonomous
  Oblast. **A file name in the right script is not a file in the right country**, and only looking at it
  said so. The card took the Bira embankment at Birobidzhan instead, which shows the river and the
  oblast's wooded hills; the term took the Bira itself.
- **HOSTS MEASURED SHUT THIS BATCH**, none of them worth retrying without a reason: `kigiran.elpub.ru`
  (Oriental Studies) 503 on every path; the `10.31250/*` prefix fails TLS certificate verification;
  `whc.unesco.org` 403; `www.mdpi.com` 403; IOP 403 behind a Radware captcha; SCIRP 403; the `10.37102/*`
  and `10.22250/*` prefixes resolve to elibrary.ru login walls; and `10.17223/19988591/42/4` answers 200
  with a 38-byte empty body. **A 200 is not a document.**
- **A PARENTHESISED DOI IS PERCENT-ENCODED, NOT AVOIDED.** Grebenyuk's Ural Historical Journal article is
  issue `2 (63)` and its DOI carries the brackets, which `SRC_URL_RX` stops at; written `2%2863%29` it
  resolves and matches the pattern whole.
- **THE COMMONS API RATE-LIMITS A SEARCH SWEEP HARD.** Three or four searches in a minute come back with
  a plain-text "You are making too many requests" in place of JSON — which parses as a crash rather than
  as a refusal. `fetch-geo-images.js` paces itself and did not trip it once; hand-rolled `curl` loops did,
  repeatedly. **Go through the helper.**
- **`gru-081` IS THE ALLOWED NAME ECHO.** `facts-echo --names` reports Magadan twice on that card, as
  Capital and as Largest city, and neither can be written out: the oblast is named after the city and the
  background's bolded answer term is "Magadan Oblast". Figure echoes are 0 across the batch.

### Batch 18 — `gru-083` (Nenets Autonomous Okrug), and the subjects deck closes at 83 of 83

**THE FEDERAL SUBJECTS ARE FINISHED.** `gru-001`–`gru-083` are written, each with its paired glossary
term at the bar and a picture. What remains of this collection is the eighty administrative centres, and
they are still blocked — see the section above, which this batch's research extends rather than clears.

- **A NESTED OKRUG STATES BOTH SIDES OF ITS OWN ARITHMETIC.** Nenets is counted inside Arkhangelsk Oblast,
  so the oblast's figures are published both with it and without, exactly as Tyumen's are for Khanty-Mansi
  and Yamalo-Nenets. The card says so rather than leaving a reader to reconcile two numbers that are both
  correct; it is the fourth card to have to, and the rule is in the okrugs section above.
- **THE LARGEST-CITY CELL IS `?` FOR THE SIXTH TIME.** Naryan-Mar is the only settlement of any size in the
  okrug, and nothing openable ranks its towns, so the honest state is the question mark rather than a
  restatement of the capital.
- **RECLUS VOLUME 5 IS ON `/stream/`, NOT ON `/download/`.** `archive.org/download/universalgeograp05recl/
  universalgeograp05recl_djvu.txt` answers with zero bytes and "No hOCR or Abbyy file present"; the same
  text is served whole at `archive.org/stream/…_djvu.txt`. **Try the `/stream/` route before recording an
  archive.org item as having no text layer.**
- **THE WRONG PECHORA.** A picture search for the Pechora returned `Берега Печоры. Якша.jpg`, a good
  photograph of the river at Yaksha — which is in the **Komi Republic**, on the upper river, several
  hundred kilometres outside the okrug. A river that crosses three federal subjects is a subject-matching
  trap the way an ambiguous city name is, and no metadata catches it: the file is correctly named and
  correctly categorised. The card took the Bolshezemelskaya tundra and the term took Kolguyev Island.
- **DO NOT SUPPLY A GIVEN NAME A SOURCE DOES NOT STATE.** Reclus writes only "Burrough" of the 1556
  expedition to Vaygach; the draft said "the English captain Stephen Burrough", which is very probably the
  right man and is not what the citation carries. It reads as researched detail and is invented, which is
  the one failure this apparatus exists to prevent.

**Three measured findings on the capital half, none of which is yet a recipe.**

- **ROSSTAT'S TABLE 2.1 DOES NAME EVERY CENTRE, AND CANNOT BE USED TO IDENTIFY ONE.** The column is titled,
  in Rosstat's own English, *"Capitals, centers and largest cities of constituent entities of the Russian
  Federation"* — so the fact is in a citable government table. What the table does not do is say which of
  the listed names is which, and **position is not the rule**: Khanty-Mansi lists Khanty-Mansiysk (the
  centre, not the largest city) first, while **Moscow Region lists Krasnogorsk SEVENTH**, behind Balashikha,
  Podolsk, Khimki, Korolev, Mytishchi and Lyubertsy. A first-name-wins reading would be right most of the
  time and wrong without warning, which is worse than no recipe.
- **`pravo.gov.ru` AND `publication.pravo.gov.ru` ANSWER 200 FROM THIS SANDBOX.** The Russian Federation's
  official legal publication portal is the one Russian government host that does not fail TLS against the
  national CA — unlike `rosstat.gov.ru`, `eng.rosstat.gov.ru`, `gks.ru` and `en.kremlin.ru` — and its
  document-type list includes *Устав (Основной Закон)*, a subject's own charter, which is exactly the
  document that names its administrative centre. **Its `?q=` parameter is inert**: the search is a
  JavaScript form, and the bare URL returns all 1,700,615 documents. So the host is reachable and the
  route to a particular charter is not yet found. **This is the most promising surviving lead.**
- **DOAJ AND CROSSREF INDEX METADATA ONLY**, so the world deck's "an open paper's Study Area states the
  fact" recipe cannot be located by phrase search: a sweep for `"capital of the Republic of Tatarstan"`
  returns three metadata hits and nothing usable. The recipe still works; it costs one paper read per card
  rather than one query, which is a different kind of cost and should be measured before eighty cards are
  planned around it.

### Batch 19 — `gru-508` (Kazan), and the capital half is unblocked

**The first administrative-centre card.** Written out of running order on this plan's own instruction —
*try an unambiguous centre, establish the recipe there, and come back to `gru-502` with it* — so the
capitals deck opens at 508 and the numbers below it are still to write. The recipe it proves is the
section above; what follows is what the batch itself turned up.

- **THE RECIPE IS A LADDER AND A TABLE, not a single source.** The grid comes from Rosstat's table 4.9 for
  all eighty at once; the *X is the administrative centre of Y* sentence comes from whichever of three
  rungs answers for that subject. Kazan happened to answer on two of them — the Tatarstan portal through
  the Wayback Machine and UNESCO's Creative Cities entry — which is why it was the right card to prove it
  on.
- **A CAPITAL CARD AND ITS OWN SUBJECT CARD WILL PRINT THE SAME CLIMATE UNLESS YOU MAKE THEM NOT.**
  `gru-008` Tatarstan reads its January and July means off the WMO station **in Kazan**, because that is
  the republic's only station — so `gru-508` deliberately takes the precipitation seasonality and the
  February-to-April thaw instead. **Read the subject card before writing its capital.**
- **`upload.wikimedia.org` 429s FOR MINUTES AT A TIME, AND THAT IS WHEN A HAND-BUILT `src` SHIPS.** The
  glossary picture's URL was composed as `…/commons/9/9c/…` from the shard pattern and would have been a
  404: the real shard is `8/83`. The API's own string says so, and the API answers through
  `suggest-image.js`'s pacing when a bare `curl` does not. **CLAUDE.md's rule — copy the `src` from the
  API, never build it — is the one that saved this card**, and the check is to compare against the API
  string when the file itself cannot be fetched to confirm it.
- **A GLOSSARY TERM CANNOT GO THROUGH `fetch-geo-images.js`**, which refuses anything that is not a card
  in `data.js`. `suggest-image.js` is the paced route for a term.

## The background against the grid — the facts-echo pass (Sep 2026)

On request: *the background sections should never mention data that is already in the answer box data
section.* The grid prints Capital / Population / Largest city / Area two inches above the prose, and
55 of the 57 Russia cards gave at least one of those figures again. The pass ran over the whole
Geography section and is recorded here because Russia was the worst of it. Findings.

- **THE FIRST JOB WAS A CHECKER, BECAUSE "DONE" HAD TO BE MEASURABLE.** `.claude/facts-echo.js`
  compares each background against its own grid and reports **264 figure echoes in 124 cards** across
  the four map collections: 182 in the United States, 65 in Russia, 17 in the world, **0 in China**,
  which had been written clean without anyone noticing it was a rule.
- **DELETING THE FIGURE STRANDS THE CITATION, AND THAT IS THE WHOLE DIFFICULTY.** Every echoed
  figure carried a source — Rosstat for the area and population, the United Nations for the city —
  and `add-sources.js` rightly refuses a source nothing points at. **The replacement is therefore a
  DERIVED figure the same source supports and the grid does not show**: Rosstat publishes a density
  column of its own (verified against the yearbook: Tambov's printed 28.0 is exactly 966.3 / 34.5),
  and the capital's SHARE of the subject's people needs the UN's city figure to state at all. So
  every citation stayed where it was and **not one marker had to be renumbered.**
- **WHERE THE CARD ALREADY NAMED A SECOND CITY, THAT IS THE CHEAPER FIX.** Thirty of the forty-three
  Russia cards said "the United Nations put the capital at N and Xsk at M" — dropping the first
  clause leaves the sentence sourced, shorter and about something the grid cannot show. Only the
  eight cards whose UN sentence named the capital alone needed the share.
- **AND A FIGURE CAN HIDE IN A SENTENCE THAT IS NOT ABOUT FIGURES.** `gru-014` opened its
  demographic sentence with "More than 2.8 million people live in the krai" against a grid reading
  2.89M — under the checker's rounding rules that is not an echo, and to a reader it plainly is.
  **Read the sentence, not just the checker's list.**
- **THE OKRUG TRAP IS STILL LIVE ONE LEVEL DOWN.** `rif23.json` holds Arkhangelsk's WITH-okrug row
  (589.9 / 1,005.7) while the card and the grid use the less-Nenets figures (413.0 / 964.3), so a
  density computed straight from the table would have been wrong by a third. **Compute a derived
  figure from the numbers the CARD uses, never from the source row.**

### Batch 20 — `gru-505` (Yekaterinburg) and `gru-507` (Ufa), and a fourth rung for the ladder

The recipe found in batch 19 held: the grid came straight out of Rosstat's table 4.9 for both cities,
the climate leg out of the WMO's own station files, and both cards shipped with a paired glossary term,
a picture looked at before installing, and every citation URL curled. **The batch's real finding is
about the ANSWER rung, which is where every capital card's cost sits.**

- **RUNG 3 (DOAJ) CARRIED UFA AND IS WORTH TRYING FIRST FOR A REPUBLIC.**
  `bibjson.abstract:"capital of the Republic of Bashkortostan"` returns five papers, and the best of
  them is an ARCHAEOZOOLOGY article whose first line locates its dig "in the historical center of the
  capital of the Republic of Bashkortostan" — so one query bought the answer statement AND the card's
  oldest fact, the early-medieval Ufa-II settlement under the modern centre. A toponymy paper in
  *Voprosy Onomastiki* states it a second time and carries the post-Soviet street-naming policy with it.
- **THERE IS A FOURTH RUNG AND IT IS THE ONE THAT CARRIED YEKATERINBURG: EUROPE PMC's FULL-TEXT PHRASE
  SEARCH.** DOAJ indexes ABSTRACTS; Europe PMC indexes the full text of its open-access subset, so a
  sentence buried in a Study Area or a Methods section is reachable there and nowhere else.
  `"Yekaterinburg, the administrative center"` returns exactly one paper — a tuberculosis genotyping
  study in *Frontiers in Tuberculosis* — whose Methods open "Yekaterinburg, the administrative center
  of the Ural Federal District and Sverdlovsk Oblast." **Its coverage is biomedical-leaning, so it
  answers for a city that has a hospital or a health survey and returns nothing for an urban-planning
  subject.** Add it to the ladder between rungs 2 and 3.
- **THREE CITIES WERE TRIED AND LEFT, AND THE REASON IS THE SAME FOR ALL THREE: NOTHING OPENABLE STATES
  THE SENTENCE.** `gru-502` Krasnogorsk, `gru-503` Krasnodar and `gru-506` Rostov-on-Don each survived
  every rung. Measured today, so that the next session does not re-run it: DOAJ returns 0 for every
  phrasing of *administrative center/centre of the {Rostov,Krasnodar} {region,territory,krai,oblast}*
  and for *capital of Krasnodar Krai*; Europe PMC returns 0 for the same set; the Wayback Machine has
  no capture of `krd.ru/o-gorode*` and its `rostov-gorod.ru` and `krd.ru` home captures are news feeds;
  `donland.ru` is behind DDoS-Guard inside the archive. **Krasnogorsk is the hardest of the three and
  for a different reason**: the 2016 capture of `mosreg.ru` shows the oblast government giving its own
  postal address in Krasnogorsk, which is evidence of where the government SITS and not a statement
  that the city is the administrative centre — and much reference literature still gives Moscow.
- **THE HOSTS MEASURED TODAY, none of which the earlier surveys covered.** `government.ru` answers
  **200** over `http://` with a browser agent, and `mosreg.ru` IS archived (2016 captures, 200), both
  contradicting notes made from later probes. Shut or useless: **`bigenc.ru` 401** (the Great Russian
  Encyclopedia, at every path including `old.bigenc.ru`), **MDPI 403** on both its search and a DOI
  resolution, **E3S Web of Conferences 403** on its PDFs and on `full_html`, **Semantic Scholar 429**
  without a key, and **OpenAlex refuses outright with "Insufficient budget … Resets at midnight UTC"**,
  which is a quota rather than a block and is worth retrying on another day. **The World Bank's document
  API and OAPEN both answer 200 and both return zero hits** for these phrases — reachable, and not the
  right instrument.
- **THE INTERNET ARCHIVE FLAPS, AND A ONE-SHOT PROBE READS THAT AS A DEAD HOST.** Several CDX queries
  came back as an HTML page titled *Internet Archive: Temporarily Offline* while archive.org's own item
  pages answered 200 in the same minute, and the same query succeeded minutes later. **Retry with
  backoff and test the response for that title rather than for a status code** — a 200 carrying it is
  the `check-reach.js` wall case one host over. Rung 1 and the Rosstat citation both depend on the
  archive, so a batch that reads it as shut stops for no reason.
- **A CAPITAL CARD MUST NOT REPEAT ITS SUBJECT CARD'S CLIMATE FIGURES, and the check is to read the
  subject card first.** `gru-005` had already spent Yekaterinburg's January maximum and minimum, its
  July maximum and its annual total, and `gru-007` the same four for Ufa — because a subject card's
  climate sentence is read off its capital's station. The capital cards took what was left: the first
  month whose afternoons reach freezing, the wettest-against-driest pair and the rain-day counts.
- **A PUBLISHER'S OWN LATIN CITATION CAN CARRY A CYRILLIC LETTER, AND `check-citations.js` IS WHAT
  FINDS IT.** The Ufa archaeozoology paper's second author is printed **M. Р. Maslitsyna** — U+0420,
  Cyrillic Er — in Crossref's record AND in the journal's own *For citation* line. The mismatch report
  named it; the citation now reproduces the publisher's string exactly, which is what a citation is for.
  **A name that looks right and compares wrong is this checker's whole reason to exist.**

### Batch 21 — `gru-509` (Tyumen) and `gru-511` (Makhachkala), and a PRIMARY-SOURCE rung above all four

The batch's finding is the answer rung again, and this time it displaces the ladder's top:
**`constitution.garant.ru` answers 200, is free, and hosts every federal subject's constitution or
charter — which is the primary source for the sentence the four rungs were proxies for.**

- **THE HOST, AND HOW TO READ IT.** `https://constitution.garant.ru/region/<slug>/` is a charter's own
  index and `…/region/<slug>/chapter/<32 hex>/` is one article. **It serves windows-1251, not UTF-8** —
  a naive read gives mojibake, so decode with `new TextDecoder('windows-1251')`. The article page's
  plain text is mostly site navigation, so search it for the SENTENCE rather than reading the top of it.
  `.claude/` carries no tool for this; `scratchpad/garscan.js` was written and thrown away with the
  session, and rewriting it is ten minutes.
- **THE SLUG IS READ OFF `/region/`'s OWN INDEX, NEVER COMPOSED.** `ustav_tumen`, `ustav_chelyab`,
  `ustav_samar`, `ustav_nijegor`, `ustav_rostov`, `ustav_mosobl` and `cons_dagest` are real;
  **`ustav_krasnodar` is a guess and 404s.** This is `add-locators.js`'s own rule one host over: look a
  key up, do not derive it.
- **TWO ANSWERS CAME OUT OF IT.** Tyumen Oblast's charter (*Устав Тюменской области от 30 июня 1995 г.
  N 6*) gives article 11 the heading *Административный центр области* and one sentence under it:
  «Административным центром области является город Тюмень». Dagestan's constitution (adopted by the
  Constitutional Assembly on 10 July 2003) puts the capital in chapter 9 with the state symbols, at
  article 101: «Столицей Республики Дагестан является город Махачкала. Статус столицы определяется
  законом Республики Дагестан».
- **⚠ THE "NOT UNIVERSAL" PARAGRAPH THAT STOOD HERE WAS WRONG, AND THE FAULT WAS A DEAD REGEX.** It
  reported that a scan of the first 120 articles found NOTHING in the charters of Chelyabinsk, Samara,
  Nizhny Novgorod, Rostov or Moscow Oblast. The scanner matched `административн\w+`, and **JS's `\w` is
  ASCII-only, so it never matches Cyrillic at all**: the sweep could not have hit anything, and it
  reported "none" for Dagestan too — whose article 101 had already been read by hand on this very
  page. **What caught it was a LIVENESS TEST on the two known hits**, not the count: a scanner that
  finds nothing and a scanner that cannot find anything read identically from the output. Written
  `[\p{L}]*` with the `giu` flags, Samara's charter hits at once (article 53) and so does Nizhny
  Novgorod's (article 5). **Any scanner over Russian text must be proved to fire on a hit you already
  hold.**
- **A TOC-TITLE FILTER IS THE WRONG INSTRUMENT AND MISSES A HIT IT HAS ALREADY FETCHED.** The first
  scanner matched only TOC links whose text began *Статья …*, and Dagestan's index writes its capital
  article's CHAPTER heading (*Глава 9. Государственные символы. Столица Республики Дагестан (ст. 101)*)
  where the article's own link text is the bare `Статья 101`. **Match the sentence in the body, and
  walk the whole index rather than its first N entries.**
- **A PAGE-NUMBER MAP FROM `_page_numbers.json` IS WRONG WHERE THE BOOK CARRIES PLATES, AND THE PAGE'S
  OWN RUNNING HEAD IS RIGHT.** Pinning the *Guide to the Great Siberian Railway*'s Tyumen pages needed
  a printed folio, and three routes disagreed: archive.org's `fulltext/inside.php` returns a LEAF index,
  `_page_numbers.json` maps leaf → printed number and was **three out** across the Tyumen plates (it
  read 131 for the leaf whose own header prints 124), and the bare numbers standing alone in the
  `_djvu.txt` are as often a plate number as a folio. **Split `_djvu.xml` on `<OBJECT` and read the
  running head off the page itself** — leaves 151–153 print 122, 123, 124, and leaves 235 and 249 print
  204 and 218, which is what the citations carry. The same method pinned Baddeley's pages 25, 27, 373
  and 459 off `badd.txt`'s own running headers.
- **THE TWO CARDS' OTHER SOURCES, for reuse.** Tyumen: Kennan pp. 70 and 72 (the approach through the
  swampy forest; the skyline of pyramidal board roofs and the marble column marking the citizens' leave
  of the Grand Duke Vladimir in 1868) — pp. 74 and 80 are spent on `gru-009`; the *Guide* pp. 122–24 (Chingi
  Tura and the khan Taibugu, the voyevodas to 1782, the 1616 monastery, the 1897 census of 29,588) and
  pp. 204 and 218 (the Tura–Tobol–Ob transit water-way to Tomsk, Barnaul and Biysk, and steam navigation
  from 1884). Makhachkala: Baddeley pp. 25 and 27 (Peter's cairn of August 1722 and the name given to the
  town founded on the spot more than a century later; the coastal strip as the isthmus's only level
  north–south route), p. 373 (the fort built three versts along the shore the year after the 1843
  fighting, called Andji Kala, the *Flour Fort*) and p. 459 (Bariatinsky reaching Petrovsk in October
  1856); Reclus vol. 6 p. 87 (the harbour, and Petrovsk supplanting Tarki).
- **A SIBLING SUBJECT CARD'S CLIMATE SENTENCE IS THE ONE TO CHECK BEFORE WRITING A CAPITAL'S.**
  `gru-009` and `gru-011` both read their climate off the very station these two cards use, so the
  January and July means and the annual total were already spent; what was left is the WETTEST and
  DRIEST months, the rain-day counts, and the months whose nightly minimum sits below freezing.

### Batch 22 — `gru-512` (Samara), `gru-513` (Nizhny Novgorod), and the whole charter shelf swept at once

**THE BOTTLENECK IS BROKEN OPEN: 54 OF THE 85 CHARTERS STATE THEIR OWN CENTRE.** Batch 21 found the
Garant rung one subject at a time; this batch swept all 85 at once
(`scratchpad/garsweep2.js`, output `garall.txt`) and the answer sentence — the *X is the administrative
centre of Y* / *столицей … является город …* sentence that every capital card needs and that no other
rung reliably supplies — is in a primary source for 54 of them. **This is the single largest unlock the
capital half has had**, and it is why the remaining centre cards should be planned against this list
rather than researched blind one at a time.

- **THE 54 THAT ANSWER**, by Garant slug: `cons_adig` `cons_altai` `cons_bashkor` `cons_buryat`
  `cons_dagest` `cons_ingush` `cons_kabardin` `cons_karach` `cons_karel` `cons_mordov` `cons_tatar`
  `cons_tiva`; `ustav_altai` `ustav_zabaikal` `ustav_kamchat` `ustav_perm` `ustav_primor` `ustav_habar`;
  `ustav_arhangel` `ustav_astrah` `ustav_belgorod` `ustav_bryans` `ustav_vladim` `ustav_volgograd`
  `ustav_vologod` `ustav_voroneg` `ustav_ivanov` `ustav_irkut` `ustav_kalug` `ustav_kemer` `ustav_kirov`
  `ustav_kostrom` `ustav_kursk` `ustav_murman` `ustav_nijegor` `ustav_novgor` `ustav_novosib`
  `ustav_penz` `ustav_ryazan` `ustav_samar` `ustav_sarat` `ustav_sahalin` `ustav_smolensk` `ustav_tambov`
  `ustav_tver` `ustav_tulsk` `ustav_tumen` `ustav_ulyan` `ustav_yaroslav`; `ustav_evreis` `ustav_nenetsk`
  `ustav_ugri` `ustav_chukot` `ustav_yamal`.
- **THE 31 THAT DO NOT**: `cons_kalmik` `cons_komi` `cons_krim` `cons_mariy` `cons_saha` `cons_osetiya`
  `cons_udmurt` `cons_hakas` `cons_chech` `cons_chuvash`; `ustav_krasnod` `ustav_krasnoyar`
  `ustav_stavrop` `ustav_amur` `ustav_kalin` `ustav_kurgan` `ustav_leningrad` `ustav_lipetsk`
  `ustav_magadan` `ustav_mosobl` `ustav_omsk` `ustav_orenburg` `ustav_orlov` `ustav_pskov` `ustav_rostov`
  `ustav_sverdl` `ustav_tomsk` `ustav_chelyab` `ustav_moskv` `ustav_spb` `ustav_sevastopol`. Three of
  those last are the two federal cities and Sevastopol, which need no centre card at all. **For the rest
  the ladder's lower rungs still apply**, so a "none" here is a card that costs more research, never a
  card that cannot be written — `gru-505` Yekaterinburg (`ustav_sverdl`) was written off Europe PMC's
  full-text search before this sweep existed.
- **A SWEEP OVER RUSSIAN TEXT MUST BE PROVED TO FIRE, AND THE FIRST ONE COULD NOT.** See the ⚠
  paragraph in batch 21: `\w` is ASCII-only in JS, so `административн\w+` matched nothing anywhere and
  the scanner reported "none" for all 85 — including Dagestan and Tyumen, whose articles had already
  been read by hand. The rule that came out of it: **plant a hit you already hold and watch the scanner
  find it** before believing a single "none".
- **THE INDEX CARRIES CHAPTER HEADINGS AS WELL AS ARTICLES, and the chapter headings carry the article
  RANGES** (`Глава 9. Государственные символы. Столица … (ст. 101)`). The sweep therefore targets a
  chapter page whose heading matches `центр|столиц|символ|Основные положения|Общие положения`, plus any
  article titled for it, plus any article whose number falls inside such a chapter's `ст. N` /
  `ст.ст. N-M` range, plus every article numbered 12 or below. That targeting is what keeps a sweep of
  85 charters to a few hundred requests instead of ten thousand.
- **The two cards written on it.** `gru-512` **Samara** rests on `ustav_samar` article 53 plus the
  *Guide to the Great Siberian Railway* (the 1586 stockaded post, the Samara Bend, the Zhiguli and Sokol
  hills, the wheat-flour trade) and Reclus vol. 5 (the half-finished wooden town of the eighteen-eighties
  and the Orenburg railway up the Samara valley). `gru-513` **Nizhny Novgorod** rests on `ustav_nijegor`
  article 5, Rambaud vol. 1 pp. 121–22 (Yuri II founds the town in 1220 on a hill by the Oka's mouth,
  with the Mordvan tradition beside it) and Reclus vol. 5 pp. 399–402 (the kremlin eminence 320 feet
  above the Volga, the fair's migration from the Bulgar capital to Kazan to St Macarius and then here
  after the fire of 1816, and its trade).
- **THE SIBLING SUBJECT CARD IS THE CONSTRAINT ON A CENTRE CARD'S PROSE, and `gru-513` is the sharpest
  case of it yet.** `gru-013` Nizhny Novgorod Oblast already spends its climate sentence on the WMO
  station's January and July means and its annual total — the obvious figures — **and its whole second
  paragraph on Minin and Pozharsky in 1612 and on the Great Fair as a visitor saw it in 1875**. So the
  capital card had to take the same station's *wettest and driest months and its rain-day counts*, and
  the same fair's *pre-history and its trade figures*, with 1612 left alone entirely. **Read the sibling
  card before choosing which fact to use, not after**: on a Volga city the two cards' natural material
  is very nearly the same material.
- **A FOUNDING YEAR WITH ONE WITNESS IS STATED AS THAT WITNESS GIVES IT.** Rambaud dates the foundation
  to **1220**, in his chapter heading and again in his text; Reclus gives no year, and Munro-Butler-
  Johnstone's account of the fair gives none either. The card and its date line therefore say 1220 and
  cite Rambaud. The conventional modern date is 1221, so **expect this one to look a year out beside
  other reference works** — the alternative is a year Folio cannot cite, which is worse.
- **Pictures.** Samara took a daylight view from a pleasure steamer across the Volga (CC BY-SA 4.0) for
  the card and the pre-1917 timber **grain barns on the Samara river** (public domain) for the glossary
  term, which is the wheat-flour trade the term's third sentence describes. Nizhny Novgorod took
  Vmenkov's 2007 view across the Oka to the kremlin bluff (CC BY-SA 3.0) and, for the term, the 1870
  Shishkin/Karelin print *Кремль, Нижний базаръ и ярмарка* (public domain), which shows the kremlin
  eminence, the Lower Bazaar and the fair ground in one frame. **Three candidates were rejected by
  looking at them**: the fetcher's own first pick for Nizhny Novgorod is a photograph **from a cruising
  airliner**, half cloud, with the city a smudge on the horizon; `Город Самара - panoramio.jpg` is a
  cosmonaut statue on a pavement; and `Панорама Самары.jpg` is shot through a balcony railing that fills
  the bottom third. **The fetcher's `MISS`/`ok` verdict says nothing about what is in the frame.**

### Batch 23 — `gru-518` (Perm), `gru-521` (Irkutsk), `gru-523` (Barnaul), and the sibling-card constraint

**Three cards written straight off the swept charter shelf.** Batch 22's sweep is now doing exactly
what it was built for: each of these three opens on its own subject's own charter, read off
`constitution.garant.ru` at a slug taken from the `/region/` index rather than composed —
`ustav_perm` art. 1, `ustav_irkut` art. 14, `ustav_altai` art. 6 (which names the centre beside the
arms and the flag, in the chapter on the state symbols). None of the three needed a rung below the
first.

**`gru-516` NOVOSIBIRSK AND `gru-517` KEMEROVO WERE SKIPPED, AND THE REASON IS A CONSTRAINT THIS HALF
OF THE DECK WILL MEET AGAIN.** Both cities' founding stories are already told, with the same
19th-century sources, on their own SIBLING SUBJECT CARDS — `gru-016` Novosibirsk Oblast and `gru-017`
Kemerovo Oblast — because a young Siberian city IS its oblast's history in a way an old European
Russian one is not. Writing the capital card out of the same Reclus and Kennan pages would have made
two cards in one collection that say the same thing about the same place, which the reader meets one
after the other. They need **modern open sources of their own**, so they cost more research than a
charter lookup and were left for a batch that can pay for it. **Ask what the subject card already
says before opening a centre whose city is younger than its oblast.**

**A SOURCE DISAGREEMENT IS LEFT UNASSERTED RATHER THAN SETTLED BY PICKING A SIDE.** The *Guide to the
Great Siberian Railway* dates the opening of the Perm–Yekaterinburg mining line to **1878** and
Reclus to **1879**. The card states 1878 and cites the Guide alone for that sentence — so the claim
rests on one witness that says it, rather than on two that disagree averaged into a year neither
prints. The same rule the batch-22 Nizhny Novgorod founding year (1220 against the conventional 1221)
was written under.

**THE GUIDE IS PAGE-PINNED.** `guidetogreatsibe00russuoft` is an OCR'd volume whose own pagination
runs ahead of the scan's leaf numbers; the Perm passage is **p. 55** of the printed book, and the
citation gives that rather than the leaf the reader's browser lands on.

**FIVE PICTURES WERE REJECTED BY LOOKING AT THEM**, and two of those rejections are the no-watermark
bar doing real work: `Irkutsk North view.jpg` carries a URL printed along the bottom edge and
`IrkutskDowntownEvening.jpg` a black border with "OscarR" set into it — both otherwise good wide views
of the city, both unusable. A third Irkutsk candidate is a dark evening frame inside a printed border,
a Perm candidate a murky rooftop, and a Barnaul candidate a grey ultra-wide with nothing in it. What
shipped: `Irkutsk, Irkutsk, Russia.jpg`, a riverside view whose `desc` says what it is rather than
claiming a skyline "seen from a distance"; `Barnaul Skyline 2007.jpg`; and for Perm the Kama
waterfront panorama. **The three glossary pictures are period prints and photographs** — Yakunin's
pre-1917 *Общий вид Перми с Камы*, the pre-revolutionary `074 Иркутск. Ангара. Ж-д вокзал и мост.jpg`,
and the Library of Congress's 1885 `View of the Siberian city of Barnaul`.

**One fetch note that will recur**: `upload.wikimedia.org` rate-limits (429) under a batch's own
volume, and a 429 is not a dead link. Pace the check — or read the file through
`Special:FilePath/<FILE>?width=N`, which keeps answering while the API is refusing.

### Batch 24 — `gru-519` (Volgograd), `gru-520` (Saratov), `gru-522` (Voronezh)

**Three more off the swept charter shelf**, and the first batch in which the charter article was found by
grep rather than by reading: `ustav_volgograd` art. 12 (in the chapter on the region's symbols AND its
centre — it adds that a regional law fixes the city's status), `ustav_sarat` art. 10 and
`ustav_voroneg` art. 5, both in their charters' articles on the administrative and territorial
arrangement. The Voronezh charter is the one whose TITLE the sweep did not capture, so it was read off
`/region/ustav_voroneg/`'s own page: *Устав Воронежской области от 7 июня 2006 г.*

**THE SIBLING-CARD CONSTRAINT DECIDED WHAT EACH OF THESE CARDS IS ABOUT, which is batch 23's lesson
applied rather than met.** All three subject cards were read first, and each had already spent the
obvious material: `gru-019` Volgograd Oblast carries Sarepta, Pugachev below Tsaritsyn and the closing
of the Stalingrad pocket; `gru-020` Saratov Oblast carries Razin taking Saratov and Pugachev burning
it; `gru-022` Voronezh Oblast carries Peter's 1709 flotilla and the Shipov Forest. So the three city
cards take what is about the CITY and not the campaign — the Volga–Don portage and the railway terminus
that made Tsaritsyn, Saratov's first site and its function on the frontier, and the 1695–96 shipyard
that Peter built here after the first siege of Azov failed. **Read the sibling before researching the
centre; the second card's subject is what the first one left.**

**THREE STATIONS IN THIS BATCH CARRY RAINFALL NORMALS AND ONE READING OF THE JSON SAYS THEY DO NOT.**
`climateMonth` rows expose `rainfall` and `raindays`, and a first pass read `raintext`/`raindaystext` —
fields that do not exist on these records — and returned `undefined` for all twelve months of all three
cities, which reads exactly like a station that reports temperature only. **Ask the row for its own
keys before concluding a station is missing a series.**

**MURCHISON IS THE THIRD LEG NOW, AND HIS PAGE NUMBERS ARE FOUND BY WALKING BACK TO THE RUNNING HEAD.**
*The Geology of Russia in Europe and the Ural Mountains* (1845) carries the physical geography these
three cards needed and the two Reclus volumes do not: the Volga's right bank as an outright cliff from
the Oka's mouth down to the hilly ground at Tsaritsyn (Appendix M, p. 650), the absence of true black
earth south of the city (p. 558), the Jurassic in the Saratov cliffs at 300 to 400 feet — a greater
development than his party saw anywhere else in Russia (p. 246) — and the Finnish and Lapland erratics
carried 700 to 800 miles down the Don valley to Voronezh (p. 524). The OCR prints each page number on
its own line above a running head, so the citable page is the nearest preceding one, and it must be
CHECKED against that head: a bare three-digit line is also how the volume sets a figure's scale.

**THE VOLGOGRAD CARD SAYS NOTHING ABOUT STALINGRAD, DELIBERATELY, AND THAT IS WORTH STATING.** The
battle is the single most famous thing about the city and it is already carded, with its own sources, on
`gru-019`. What the city card explains instead is why there is a city there at all, which is the
question a map card asks. A reader who wants the battle meets it on the subject card one number lower.

**⚠ COMMONS NO LONGER SERVES AN ARBITRARY THUMBNAIL WIDTH, AND THE PIPELINE'S OWN DEFAULT IS ONE.**
Measured in this batch: `upload.wikimedia.org/.../thumb/<shard>/<file>/900px-<file>` and `1200px-` both
answer **400, "Use thumbnail sizes listed on https://w.wiki/GHai"**, and
`commons.wikimedia.org/wiki/Special:FilePath/<file>?width=900` answers with an **EMPTY BODY** — which is
the worse shape, since `curl` exits 0 and writes a zero-byte file that reads as a failed download rather
than as a refused width. **1280px works**, as do the other listed sizes, and every batch-23 URL that
resolved happened to be a 1920px one. Two consequences worth carrying:
· **A LISTED WIDTH IS ONLY SERVED WHERE THE ORIGINAL IS WIDER.** For a file whose original is 1280px or
  smaller, every `NNNpx-` thumb answers the same 400, so the only route is the ORIGINAL — and the
  original is what Wikimedia rate-limits, answering *"Too many requests … or instead use thumbnail images
  in sizes listed on…"*. A 1280×779 candidate could not be fetched at all while a 1644×1020 one at the
  same moment came down first try. **Prefer a candidate wider than 1280**, which also happens to be the
  size bar the picture rules already ask for.
· **A 429 HERE IS A 200-STATUS HTML DOCUMENT**, so `curl -o file.jpg` writes a Wikimedia error page under
  a `.jpg` name. `file -b` is what tells them apart, and the error's own text names which of the two
  faults it is — **read it rather than assuming the host is busy**, since one of the two is a bad URL that
  no amount of waiting will fix.

### Batch 25 — ten centres: `gru-527`, `gru-528`, `gru-531`–`gru-538`

Vladivostok, Khanty-Mansiysk, Belgorod, Tula, Vladimir, Khabarovsk, Penza, Tver, Yaroslavl and
Ulyanovsk, each with a paired glossary term at the bar and a picture. **The capital half now stands at
23 of 80 and the collection at 106 of 163.**

**THE SIBLING-CARD CONSTRAINT BOUND ON ALL TEN, AND IT IS WHAT DECIDED WHAT EACH CARD IS ABOUT.** All
ten subject cards were read before any research began, and every one had already spent the obvious
material: `gru-027` has Vladivostok's founding, its free-port status and its climate; `gru-034` has
Khabarov, Albazin and the naming of Khabarovka; `gru-032` has Kulikovo, the Demidovs and the 1712 arms
factory; `gru-033` has Bogolyubsky, the 1238 siege and the decay of Suzdal; `gru-036` has the Tvertsa
junction, the Volochyok canal and the 1327 rising; `gru-037` has the founding by a son of Vladimir the
Great and the 1612 army; `gru-038` has Razin, Karamzin and the Sviyaga; `gru-035` has the founding and
Razin again; `gru-028` has the Khanty and the Mansi, the Mukhrino bog and the oil. **Read the sibling
before researching the centre; the second card's subject is what the first one left.**

**FOUR NEW SOURCES CAME OUT OF THAT, and three of them are worth knowing about before the next batch.**
· **`cu31924071203685` — George Frederick Wright, *Asiatic Russia*, vol. 2 (1902)** — the shelf had no
  general book on the Russian Far East besides Reclus and the Guide. Wright gives Vladivostok's 1897
  census with its sex disparity and its tonnages, Khabarovsk on its promontory with 14,933 people, and
  a table of when each Siberian river closes and opens. **It is a GEOLOGIST's book and its climate and
  navigation chapters are the strongest part of it.**
· **`cu31924028567711` — W. R. Morfill, *A History of Russia from the Birth of Peter the Great to the
  Death of Alexander II* (1902)** — Reclus and Rambaud between them leave the eighteenth century thin,
  and Morfill carries it: Pugachev's retreat through Penza and Saratov, his surrender at Simbirsk and
  the iron cage, and Biron's removal from Pelim to Yaroslavl. **Two cards took adjacent facts from one
  pair of pages (213–14) without overlapping**, which is the right way to spend a passage that covers
  several towns at once.
· **A DOAJ-INDEXED RUSSIAN JOURNAL WITH AN ENGLISH ABSTRACT IS WHAT MADE BELGOROD WRITABLE AT ALL.**
  Belgorod is the hardest centre so far: `gru-031` had already spent the chalk, the name, the 1845
  section, the Kursk Magnetic Anomaly and the 1943 recapture, and the nineteenth-century shelf holds
  nothing else — Reclus gives it one clause (p. 437), Murchison's three mentions are the section
  `gru-031` used, and every `Bielgorod` in Rambaud is the town near Kiev while the one in volume 2 is
  **Belgrade**. Lyapin's *The Defense System of the South of Russia on the Eve of the Construction of
  the Belgorod Line* (Vestnik VolGU ser. 4, no. 2, 2023) has a long structured English abstract that
  carries five citable sentences: the line's dates, the Oka regiments that preceded it, why farming was
  impossible, the 1630 weakening and the Crimean response, and what closing the frontier bought.
  **Search DOAJ before concluding a Russian city cannot be sourced**, and prefer a journal whose
  abstract is in English — a second Russian-language source on one card also trips rule 6 of
  `check-cards.js`, the charter already being one.
· **Europe PMC carried Khanty-Mansiysk's geography** (Pesnya and Bolotov, *Data in Brief* 41, 2022):
  the Lower Irtysh valley is trapezoidal and 18 km wide, the study reach sits 13 km above the Ob
  confluence, and the Ob–Irtysh interfluve holds the largest floodplain in the northern hemisphere.
  **Its history block is the RIVER's rather than the town's**, deliberately: Khanty-Mansiysk is a
  1930s foundation, nothing openable from here narrates it, and the Guide's *settlement of Samarovo*
  (p. 204) cannot be asserted to BE the city without a source that says so. So the card tells the lower
  Irtysh — the four directions of water communication from Tobolsk, the ice-free days, the transit
  waterway to Biysk and Tyumen, steam from 1884, and the Ob basin's shared fleet.

**`gru-528`'s GROWTH CELL IS A QUESTION MARK, AND IT IS THE FIRST ONE IN THIS DECK.** Rosstat's table
4.9 carries the city only from 2020, since it was under 100,000 before that, so there is no 2010 census
figure to measure the 2021 census against. The grid says `?` rather than a figure computed from a
pre-census estimate, which is the convention the request set: the card saying the number was looked for
and not found is the honest state.

**TWO GLOSSARY KEYS ARE DELIBERATELY NOT THE BARE CITY NAME.**
· **`Vladimir,_Russia` claims NO bare `Vladimir` alias**, because the wrong side of that surface is
  growing faster than the right one. Measured over the shipped corpus: eleven bare occurrences, nine
  the city, principality or province and two a person (`gru-037`'s *Vladimir the Great*, `gru-509`'s
  *the Grand Duke Vladimir*) — and a Russia collection will meet Monomakh, Lenin and Putin many times
  more. Its aliases are `Vladimir-na-Klyazme`, `Vladimir-Zalesskiy` and `city of Vladimir`, all
  unambiguous. **The pairing rule is satisfied by the entry existing**; the auto-link on the bare word
  is refused on purpose.
· **`Tula,_Russia` DOES claim the bare alias, and that is a trade with a known expiry.** All six bare
  occurrences in the corpus today are the Russian city, so the alias is right six times out of six —
  but `art-222` in the Visual Art plan is *The Toltec Atlantean figures of Tula*, so the Mesoamerican
  Tula will arrive. **The KEY is the stable part and the ALIAS is the removable claim**: when that card
  ships, drop the `Tula` alias here and key the Mexican site separately. Keying the city bare would
  have made the fix a renumbering instead of a deletion.

**`check-citations.js` CAUGHT A FABRICATED GIVEN NAME AGAIN, FROM THE SAME ROUTE AS EVER.** The Vezelka
paper's author list was expanded out of Europe PMC's initials — `Senchenkov VY` became *Vasiliy Y.*
where Crossref has **Vladislav Yu.**, and `Pribylov DA` became *Denis A.* where Crossref has **Daniil
A.** Four other names differed too. **Europe PMC abbreviates and Crossref does not; take the full names
from Crossref and never expand an initial.**

**AND THE PAPER'S OWN DOI IS WALLED HERE.** `doi.org/10.3390/microorganisms9010102` resolves to
mdpi.com, which answers 403 to curl, so the citation ends at
`ncbi.nlm.nih.gov/pmc/articles/PMC7824796/` instead, which answers 200. **A 403 from a publisher is not
a paywall and is not a reason to drop an openly licensed paper** — cite the PMC copy, which also keeps
the record `check-citations.js` needs.

**THE PICTURE PASS REJECTED THREE OF THIRTEEN CANDIDATES, AND TWO OF THE THREE WERE TAKEN AT NIGHT.**
`fetch-geo-images.js` found only 2 of 10 by itself, so eight were pinned by hand out of Commons'
`Views of <city>` categories. What the contact sheet caught: **`Night Tula city aerial view.jpg` is a
near-black frame** — the automatic pass had scored it top for Tula on the strength of `aerial` in its
name; **`Khanty-Mansiysk … panoramio.jpg` is a lit car park at night**; and the first Khabarovsk aerial
was **already on the `Khabarovsk_Krai` glossary term**, which `check-image-free.js` said before the
picture was installed rather than after. **Run that check before fetching, not after.** The two
leftovers worth recording: Vladimir has no city panorama on Commons at all, so its card takes the
Dormition Cathedral on its escarpment above the Klyazma plain, and Tver has none either, so its card
takes the 4,200 × 600 Volga embankment panorama — **a sharp daylight picture of the city on its river
beats a hazy 10,970-metre aerial that shows the whole of it.**

**A GLOSSARY TERM'S PERIOD PRINT IS FINDABLE FOR AN OLD CITY AND NOT FOR A NEW ONE.** Seven of the ten
took one: Vladivostok in 1898, Tula engraved in 1807, Meyerberg's drawing of Tver, Blasius's 1844
engraving of Yaroslavl from the Volga, Simbirsk photographed in 1865, Khabarovsk in the 1900s, and
Prokudin-Gorsky's 1911 colour plate of Vladimir over the Klyazma. **Belgorod's is its own 1911 survey
plan** — a map is refused for a CARD and is the right answer for a term about a city's site, since it
shows the Vezelka running through the town. Penza and Khanty-Mansiysk have no reachable period picture,
so both take a second modern one. **`Unknown authorUnknown author` came back on four of the seven** —
the Commons doubling CLAUDE.md records — and was halved before the credits were written.

### Batch 26 — ten centres: `gru-516`, `gru-517`, `gru-540`–`gru-542`, `gru-544`, `gru-545`, `gru-548`, `gru-550`, `gru-551`

Novosibirsk, Kemerovo, Vologda, Bryansk, Kirov, Kursk, Ryazan, Kaluga, Arkhangelsk and Chita — the
ten remaining centres whose charter states its own centre in so many words. **All ten came off
`constitution.garant.ru`**, and the headings vary enough to be worth writing down: Vologda's is an
article of its own naming the centre as the seat of the region's organs of state power (art. 11),
Novosibirsk's and Kemerovo's sit inside the article on administrative and territorial arrangement
(arts. 5 and 2), Bryansk's inside the article on the region's *territory* (art. 2), Kursk's calls it
simply "the administrative centre of the region" without naming Kursk Oblast twice (art. 8), Kaluga's
states it and then leaves the centre's own status to a regional law (art. 4), Chita's calls it the
capital as well and the seat of the legislative and highest executive organs (art. 7), and
**Arkhangelsk's runs the other way round** — "the city of Arkhangelsk has the status of the
administrative centre of Arkhangelsk Oblast" (art. 5) — so that card's first sentence had to be
written to match what the article actually says rather than to the batch's usual shape.
**Zabaykalsky's charter is dated 11 February 2009, not the 17th**, which is why every title is read
off the chapter page rather than carried over.

**THE SIBLING-CARD CONSTRAINT DECIDED EVERY ONE OF THE TEN, AND ON THIS BATCH IT BIT HARDEST.** These
are the oldest and best-documented cities left, so the obvious material was already spent on the
subject cards: `gru-040` had Vologda's Chancellor and Nepei, `gru-041` had Bryansk's Novgorod-Severski
and Kulikovo, `gru-042` had Khlynov's founding, `gru-044` had Kursk's baskaki rising of 1284,
`gru-045` had Ryazan's sack of 1237, `gru-048` had the stand on the Ugra in 1480, `gru-050` had
Willoughby and Chancellor at the White Sea, and `gru-051` had Nerchinsk and Kiakhta. What each centre
card is about is therefore *what its subject card left*:
Vologda takes the Ilyinsky monastery cemetery and the 1897 railway to Archangel; Bryansk takes
Olgerd's conquest, the defections of 1500 and Vedrosha, and Peter's ditch-and-rampart line from Pskov
in 1708; Kirov takes the reduction of the Vyatka republic under Vasili the First, its tribute under
Vasili the Blind, the retaking of 1489 and the 1499 push to the Pechora on dog sledges; Kursk takes
Samokvasov's fifty earth enclosures in the government and Oleg of Kursk on the Kalka; Ryazan takes
the 1521 annexation and the cannonade that took the humiliating treaty off Mehmed Girey; Kaluga takes
1812 — Napoleon leaving Moscow by its gate meaning to march south for supplies, Kutuzov at Tarutino,
the night messenger of 22 October and Maloyaroslavets; Arkhangelsk takes Kholmogory's ruin, the
English traders and Peter's arsenal; and Chita takes the exile system whose march ended there.
**Read the sibling before researching the centre; the second card's subject is what the first one
left.**

**THE 19TH-CENTURY SHELF CARRIED EIGHT OF THE TEN AND COULD NOT TOUCH THE OTHER TWO.** Novosibirsk
and Kemerovo did not exist as towns when Reclus, Rambaud, Murchison and Morfill wrote, so those two
rest entirely on open-access modern work, and the searches that found it are worth recording:
`"Autonomous Industrial Colony Kuzbass"` on DOAJ returns exactly two articles and **both are
usable** — Uskov on healthcare in Verkhotomsk volost and Shcheglovsk, which is where the card's
names and dates come from (Ust-Iskitimskoye until 1918, Shcheglovsk 1918–1932), and Rabkina's review,
which carries Ruth Epperson Kennell's years at the colony. `"Shcheglovsk"` alone returns the same two
plus **Meerovich on the socialist-city planning of Shcheglovsk, Stalinsk and Novonikolaevsk**, which
serves both Siberian cards at once. `"Novonikolaevsk"` gives **Papkov on the 1921 transfer of
Siberia's governing bodies out of Omsk** and **Emelyanova and Goroshko on the Ob pine forest**, which
is the only city-specific physical material either Siberian card has. **Ask DOAJ for the city's OLD
name**: `"Kemerovo" AND history` returns 3,235 results of which none is about the city, because the
regional university's journal is called after it.

**FOUR PHYSICAL SENTENCES CAME OUT OF MURCHISON AND THEY ARE BETTER THAN ANY MODERN PAPER FOUND.**
He went where these cities are: at Vologda the substratum is buried under a spread of detritus that
defeated a circuit west to Cherepovets, Vesyegonsk and Mologa, and the marls upstream on the Sukhona
are so empty of fossils that Meyendorf called them the mute limestones (p. 178); the lower
carboniferous limestone of Kaluga is grey, whitish and bluish in beds two to four feet thick and
divides near the town into courses with seams of shale and poor coal (pp. 79–80); Kursk stands on
high ground above the Sem and the Tuskar where chalk marls overlie seven feet of pure white chalk
without flints (p. 269), on a dome-like swell that turns the Oka north and holds the Don to a
northward course (p. 20); and **towards the Vyatka the cupriferous conglomerate dies out and the
party never went north to the town, having been told the beds around it were precisely like the ones
they had just described** (p. 160) — which is a fact about the city's geology and about how it was
recorded. For the three cities he does not reach, DOAJ supplied a city-specific physical pair each:
the Desna's bottom sediments inside Bryansk, the Oka's near-channel alluvium below Ryazan, and
**Landsat thermal imagery showing Chita lifting the Ingoda's surface temperature by six to eight
degrees in January and by nothing at all in summer.**

**RULE 1 OF `check-cards.js` FIRED TWICE AND THE FIX IS A PAGE RANGE, NOT A DROPPED CLAIM.** Kirov's
five history sentences came off four Rambaud pages and Kaluga's off four Morfill pages, which reads
to that checker as one modern scholar cited four times over. Consolidating to `ramb1('209, 214')` +
`ramb1('221–22')` and `MORFILL('314–15')` + `MORFILL('317–21')` keeps every claim and every marker
and takes both cards to two citations per author. **Run it before the batch is committed rather than
after**: the first run of these ten reported the two violations and nothing else, and the repair cost
a `git checkout` of the two data files and a re-add.

**THE CROSSREF PASS FOUND ONE WRONG INITIAL AND ONE DOI CROSSREF DOES NOT HOLD.** DOAJ gives Uskov as
`I. Y. Uskov` and Crossref as **`I. Yu. Uskov`**, which is the journal's own transliteration and is
what shipped. **`10.7480/projectbaikal.42.795` returns "Resource not found" from Crossref because
Project Baikal registers with DataCite**, whose record confirms Mark Meerovich, 2014 and issue 42 —
and shows no volume, so the citation carries `no. 42` alone. A DOI that Crossref has never heard of
is not a bad DOI; ask DataCite before rewriting one.

**THE PICTURE PASS REJECTED SEVEN OF TEN FIRST CHOICES, the worst rate any batch has had**, and the
rejections are the record worth keeping. A file whose Commons description names the OBLAST rather
than the city is the warning sign: `Вид на Рязань.jpg` is captioned "Ryazanskaya oblast" and is a
low-rise suburb under cloud. `Vologda 333.jpg` is a park with an obelisk. `Vyatka.jpg` is captioned
"River Vyatka in surroundings of city Kirov" and shows the city as a smudge on the horizon; the
bridge picture offered instead shows the floodplain and no city at all. `Aerial view of Kaluga from
North-East.jpg` is a night shot of street lights **and carries the photographer's signature**.
`Arkhangelsk, Russia.jpg`, the English article's lead, is a promenade monument, and `Геометрия
большого города` is a bridge silhouette with a lens flare. Two Arkhangelsk waterfront views by one
photographer both carry a **burned-in camera date stamp**, which is why the card ended on
`Arkhangelsk. Northern Dvina River P7151348 2200.jpg` — the same subject, clean, in evening light.
**`Views of Arkhangelsk` had to be read to the end to find it**; the panoramics subcategory holds
only banner crops 87 to 286 pixels tall.

**KIROV HAS NO SKYLINE ON COMMONS AND THE HONEST ANSWER IS ITS MONASTERY.** Every route was tried —
the city category, `Views of Kirov, Kirov Oblast` (which does not exist), the aerial category (empty),
both Wikipedia articles, and the one substantial photo series of the city, which is **FAL-licensed**
and outside Folio's bar in any case. What the shelf does carry is the Trifonov Monastery ensemble
photographed wide across the Ezhovskoye pond, so that is the card's picture with a caption saying so.
**A city of 472,000 can still have no wide view, and a landmark photographed wide is better than a
skyline that is not there.**

**AND THE KEMEROVO PAIR SPLIT THE OTHER WAY ROUND.** `Кемерово.jpg` is CC0, 4,752 pixels wide and a
fine wide view — of the chemical works across the Tom, which its own description says. That is the
right picture for the glossary term, whose first sentence puts the city in the Kuzbass coalfield, and
the wrong one for a card that has to show the city, so the card took `Kemerovo1.jpg` and the term took
the works. The embankment picture that looked like the better term photograph **carries a signature
watermark and a crowd of identifiable faces** and was dropped.

**FIVE OF THE TWENTY SHIPPED `src` VALUES ARE ORIGINAL-FILE URLS AND ANSWER 429 TO THIS CONTAINER.**
Where a file's original is 1,800 pixels or less on the long side the API returns the original as its
own `thumburl` at every width asked for, so there is no `/thumb/` form to take — and
`upload.wikimedia.org` rate-limits an original for our user agent while serving it to a browser.
Each of the five was fetched successfully through `thumb.php` or a smaller API thumb before it was
installed, so the files are real and the URLs are the API's own. **A 429 on an original is this
sandbox's limit, not a dead link; confirm the file another way rather than composing a URL.**

### Batch 27 — ten centres: `gru-552`–`gru-558`, `gru-565`, `gru-567`, `gru-568`

Ulan-Ude, Tambov, Astrakhan, Ivanovo, Nalchik, Smolensk, Saransk, Murmansk, Veliky Novgorod and
Kostroma. Ten cards, ten paired glossary terms, twenty pictures.

**THE BATCH OPENED BY DISPROVING ITS OWN PREDECESSOR'S CLOSING CLAIM.** Batch 26's report said that
none of the remaining centres had a charter stating its own seat, and that the next batch would have
to fall to the Wayback Machine, UNESCO and Europe PMC. That was wrong: the 85-charter sweep's own
file carries **54 `HIT` lines**, and cross-referencing them against the 33 centres already written
and the three numbers that are never written left **22 charter hits unspent**. Ten of them are this
batch. **Count the sweep against what is written before believing a claim about what is left**; the
check is one `grep -c HIT` and a set difference, and it was never done.

**THE CHARTER ARTICLE IS NOT ALWAYS AN "ADMINISTRATIVE CENTRE" ARTICLE.** Five of the ten are
REPUBLICS, whose basic law is a constitution and whose wording is *Столицей … является город X* —
capital, not administrative centre — at articles 108 (Buryatia), 136 (Kabardino-Balkaria) and 109
(Mordovia). The card's first sentence says "is the capital of the republic around it" for those and
"is the administrative centre of the oblast around it" for the five oblasts, which is the subject's
own term for itself rather than a house formula applied to all ten.

**AND THE CHAPTER URL FORM IS `/region/<slug>/chapter/<hash>/`, NOT `/region/<slug>/<hash>/`.** The
short form returns a stub page with the site chrome and no article text, which reads as a dead
charter rather than as a wrong address; the titles for Buryatia, Tambov, Mordovia, Murmansk and
Kabardino-Balkaria were all read off the long form after the short one had appeared to fail.

**THE SIBLING-CARD CONSTRAINT DECIDED EVERY CARD IN THIS BATCH, AND ON THREE OF THEM IT TOOK THE
OBVIOUS ANSWER AWAY.** `gru-057` Smolensk Oblast had already spent 1514, 1611, 1654, the Krivichi
capital and the burning of 1812 — which is most of what an English shelf says about Smolensk — so
the centre card took the 10th-century burial ground downstream of the city and the 15th-century
Lithuanian land grants instead, the gap the subject card jumps straight over. `gru-068` Kostroma
Oblast had spent the Merya, the Finnic god, the 1613 election and the Ipatiev Monastery, so the
centre card took the dynastic war of the 1430s, when the town was handed to Vasili II as an appanage
and the Muscovites abandoned their own city and crowded into it. `gru-067` Novgorod Oblast had spent
the veche, Yaroslav's charter and the Muscovite conquest, so the centre card took the two banks, the
bridge, Gilbert de Lannoy's description of about 1413, and Lukin's account of where the epithet
*the Great* actually comes from.

**FOUR SOURCES WERE CHOSEN, VERIFIED AND THEN THROWN AWAY BECAUSE THEIR DOI DID NOT RESOLVE TO
ANYTHING A READER COULD OPEN.** `vestnik.mstu.edu.ru` does not answer at all from here, which killed
Tolstobrov's Holocene shorelines of the Kola Bay and Chechurina's paper on the port of Murmansk;
`journals.krc.karelia.ru` returns 503, which killed Leostrin's protected plants of the Kostroma
region; and EDP Sciences (`e3s-conferences.org`, and `doi.org` redirecting to it) returns 403, which
killed Kantarzhi's Kola Bay wave model after it had been picked as the replacement for the first.
Mizis's Tambov paper resolves to `elibrary.ru`, which 403s, so it is cited at its own journal's open
address instead of by DOI. **A DOI that Crossref answers for is not a source a reader can read**, and
the curl pass over every URL is what separates the two — it is worth running BEFORE the prose is
written, not after, since each swap cost a rewrite of two sentences.

**AND A CYRILLIC-ONLY CROSSREF RECORD IS A MISMATCH WAITING TO HAPPEN.** Pigarev's Astrakhan
fortifications paper, Vikhlyaev's Trans-Kama and Penza lines and Suprun's Murmansk uprising were all
dropped at selection time because their Crossref deposits carry the authors' names in Cyrillic only,
which the checker reads as a differing surname rather than as the same person in another script.
**Ask Crossref for the byline before writing the citation**, not after: the three replacements
(Reclus and Morfill for Astrakhan, Rabinovich and Rambaud for Saransk, Gerasimov for Murmansk) were
free to find at that point and would have been a third rewrite later.

**ONE FINDING SURVIVED TO THE CHECKER AND IS NOW DECLARED.** Kavkazologiya deposits its bylines
surname-first with no family/given split, so Crossref carries "Zhansitov Osman A." where the
journal's own English article page prints "Osman A. Zhansitov". That is the third row of its kind in
`CROSSREF_WRONG` (after Yakhutl and Dzarakhov) and the pattern is now the journal's rather than the
article's — **expect every Kavkazologiya citation to need one.**

**THE PICTURE PASS REJECTED SEVEN OF SEVENTEEN FIRST CHOICES**, and the rejects are the same
families batch 26 recorded: a hot-air balloon photographed against empty sky filed under a city's
category; a night view that is a field of street lights; woodland with the city out of frame; a
rusty standpipe filed under a city district; a park of frosted trees; an aerial of one suburban
microdistrict; and a wide panorama at 10.6:1, which is a legitimate photograph and unusable in a
16:9 frame. **Aspect ratio is a rejection criterion and is visible in the metadata**, so it costs
nothing to apply before downloading.

**`check-image-free.js` CAUGHT TWO CLASHES THAT THE EYE WOULD NOT HAVE.** The aerial of the
Astrakhan kremlin — the best picture found for `gru-554` — is already the `Astrakhan_Oblast`
glossary term's, and `Saint Sophia Cathedral in Novgorod.jpg` is already `Novgorod_Oblast`'s. Both
are pictures of the city rather than of the region, so the clash is with the SUBJECT card's term
rather than with another centre, which is the shape to expect for the rest of this half: **run the
check against the whole corpus before fetching, not against the pair in hand.**

**NALCHIK AND IVANOVO HAVE NO WIDE CITY VIEW ON COMMONS**, which is batch 26's Kirov finding twice
over. Nalchik was answered in the end by a dusk aerial down Lenin Prospect towards the Caucasus
foothills, which is a wide view of the city even though nothing is catalogued as one; Ivanovo had no
such file at any search, so its card carries Revolution Square — the central square, captioned as
that rather than as a distant view — and its glossary term carries the Ship House of 1930, the
constructivist block built for the mill workers, which is the thing the term is about.

### Batch 28 — ten centres: `gru-569`, `gru-571`–`gru-577`, `gru-579`, `gru-580`

Magas, Petrozavodsk, Salekhard, Maykop, Cherkessk, Yuzhno-Sakhalinsk, Kyzyl,
Petropavlovsk-Kamchatsky, Gorno-Altaysk and Birobidzhan. Ten cards, ten paired glossary terms,
twenty pictures. Ten of the twelve charter hits batch 27 left unspent; the two still unused are
`gru-582` Anadyr (`ustav_chukot`) and `gru-583` Naryan-Mar (`ustav_nenetsk`).

**FOUR OF THE TEN ARE SMALLER THAN A HUNDRED THOUSAND PEOPLE, AND THAT IS WHERE THE GRID STOPS.**
Rosstat's table 4.9 is *Cities with Population of 100 000 and Over*, so Magas, Salekhard,
Gorno-Altaysk and Birobidzhan are not in it, and **nothing else reachable from this sandbox states
their populations**: the Yearbook's own territory table (2.1) counts settlements rather than
sizing them, the UN Demographic Yearbook's table 8 carries the same 100,000 threshold, the Wayback
CDX endpoint is refused by the egress policy over both schemes, and Europe PMC's full-text search
returns nothing for any of the four. So their Population, Rank in Russia and Population growth rows
are all `?`, which is what the reader asked for where a figure cannot be found — **and the card's
fifth sentence says WHY**, naming the table's own threshold and, where the subject has one, the
largest town of theirs that the table does carry (Nazran at 124,000 and 140th; Novy Urengoy at
107,000 and Noyabrsk at 101,000). Two of the four subjects have no city in the table at all, and
those cards say so and add that the table runs to 172 entries, so the capital is smaller than any
of them. **A grid of three question marks is honest and nearly empty; the sentence is what makes it
informative.** Before the next sub-100,000 centre (`gru-582` Anadyr, `gru-583` Naryan-Mar and the
two others still to come), re-test the four routes above rather than assuming this finding still
holds — it is a fact about reachability, which is the shape of claim that goes stale silently.

**THREE OF THE TEN HAVE NO PUBLISHED CLIMATE NORMALS, AND THE WMO STATION EXISTS.** `wmo.txt` lists
Nazran' (1109), Cherkessk (1111) and Gorno-Altaisk (1112) among the 94 Russian cities, and all
three return a `climateMonth` array of twelve empty rows — no temperature, no rainfall, no
raindays. **A station in the list is not a station with normals**, so check the array before
building a sentence around it. Those three cards take a fourth physical sentence instead, which is
what the subject cards `gru-069`, `gru-074` and `gru-079` had already done for the same reason.
Magas would in any case have had to borrow Nazran's readings, which are another town's.

**SEVEN OF THE TEN NEEDED THEIR PICTURE PINNED BY HAND.** `fetch-geo-images.js` found a wide view
for two — Petrozavodsk and Petropavlovsk-Kamchatsky — and missed the other eight, which is the
`SKYLINE_RX` test doing its job on cities whose Commons holdings are streets, monuments and
airports. Of the candidates then read by eye, six were rejected: Maykop's "OVERVIEW AT MORNING" is
cloud over treetops, its "VIEW" is power lines, the Cherkessk panoramio series is shot through a
car windscreen, two Salekhard streets are dominated by a traffic light and by the sun, and the Kyzyl
files a name search returns are museum exhibits of Scythian gold. **Commons' holdings for a small
Russian capital are one photographer's afternoon**: Maykop's category is 200-odd sky studies by a
single panoramio user, and Cherkessk's is one visitor's drive through town.
· **SALEKHARD AND CHERKESSK HAVE NO WIDE VIEW AT ALL**, so they take the honest alternative the
  United States pass settled on — a civic space rather than a skyline: the Centre of National
  Cultures and the government block across a snowbound square, and the avenue through Victory Park
  with the war memorial and a church dome beyond. Both `desc` lines say that is what they are.
· **BIROBIDZHAN'S BEST-KNOWN PICTURE IS ITS ENTRANCE SIGN**, which names the town in Cyrillic and
  in Yiddish and is the one image that says what the place is. It is a monument, so it goes to the
  GLOSSARY TERM, and the card takes the Bira embankment, which shows the town along its river.
· **`Биробиджан-набережная-река-Бира-2024.jpg` WAS ALREADY ON `gru-080`**, the subject card, which
  `check-image-free.js` caught before the fetch. Run it on the whole shortlist, not on the card in
  hand.
· **KYZYL'S ONLY WIDE VIEW CARRIES THE PHOTOGRAPHER'S SIGNATURE** in the corner. It is taken
  anyway: it is the city from the hill at the confluence of the two head-streams of the Yenisei —
  the exact geography the card's second sentence describes — and the alternative is a bronze
  monument, which the city-card rule refuses. A small credit in the corner is not a stock watermark,
  and the credit line names the photographer in any case.
· **ONE LICENCE WAS REFUSED**: the best Petrozavodsk embankment photograph is under the **Free Art
  License**, which is not PD, CC0, CC BY or CC BY-SA and so is outside the pipeline's bar. The term
  takes a CC BY-SA 2.0 view of the same quay instead. **Read the licence field even on Commons.**

**FOUR SOURCES WERE DROPPED FOR BEING UNREACHABLE AND ONE FOR ITS DOI.** MDPI is walled from here —
`10.3390/land11071102` (Salekhard's frozen-soil modelling) and `10.3390/atmos11040404` (growing
degree days in the Russian Far East) both 403 — as are EDP Sciences (`10.1051/e3sconf/202016302006`,
the Susuya debris flows) and `kigiran.elpub.ru` (503, the cultural life of Kyzyl under the
autonomous oblast). `10.17853/1994-5639-2021-2-170-198`, on Soviet schooling among the peoples of
southern Siberia, resolves to nothing at all. Each had a live substitute: the same Salekhard team's
2021 paper in *Geography, Environment, Sustainability*, the InterCarto fire-danger system for the
Middle Amur, and Tadina on the Altai's memorial stones.

**THE MAGAS CARD IS THE COLLECTION'S FIRST PURPOSE-BUILT CAPITAL, AND ONE ARTICLE CARRIES IT.**
Akopyan's study of Mikoyan-Shakhar — the town raised from nothing in 1926 for the Karachay
Autonomous Region, which had no settlement fit to be a centre — closes on exactly this case: "at
the present stage, the same situation has developed with the Ingush Republic. Thanks to the support
of the federal center, the construction of a new capital, the city of Magas, has begun." That
sentence is why the article sits on the Magas card rather than on Cherkessk's, where its subject
lives. The medieval half of the card is Latham-Sprinkle in *BSOAS*, who reviews Mas'udi, Juvayni,
Rashid al-Din and the Yuan Shi and sets four tests for the site of the Alan capital the modern town
is named after. **The card does not date the modern town's founding**, because nothing openable
from here does.

**THREE MORE `CROSSREF_WRONG` ROWS, IN TWO SHAPES BOTH ALREADY IN THE TABLE.** Kavkazologiya
deposits surname-first (Akopyan), and *The New Research of Tuva* and *Vestnik KRAUNC* publish Latin
bylines and deposit the Russian ones (Samdan; Shitov, Dolgov and Barsukov, who need a row each
because the check compares author by author). All three were verified against the journals' own
pages: caucasology.ru prints "Zaven V. Akopyan" twice over, the KRAUNC PDF prints "A.V. Shitov D.P.
Dolgov A. A. Barsukov" above the abstract and again in its "For citation" line, and Samdan's Latin
form is what DOAJ takes from the journal — and is already what `gru-076` cites her under. **Note
that `10.25178/nit.2019.1.10`, the same journal two years later, deposits the LATIN name and needs
no row: a journal's deposit habit changes from year to year.**

**GARANT'S CHAPTER URL FORM BIT AGAIN AND THE FIX IS THE SAME ONE.** The address is
`/region/<slug>/chapter/<hash>/`; the short `/region/<slug>/<hash>/` returns site chrome with no
article text and reads exactly like a charter that does not state its centre. `constitution.garant.ru`
also refuses about one request in ten with a connection error, which a single-shot probe reads as a
dead page — Karachay-Cherkessia's constitution failed once and answered on the retry.

### The charter sweep was a SAMPLE, not a reading — batch 29's opening finding

Batch 27 established that the 85-charter sweep's own file carries 54 `HIT` lines and that they must
be counted against what is written rather than assumed spent. **Batch 29 found the other half of
that lesson: the sweep never read most of any charter.** `garsweep2.js` fetches only the articles
whose own title matches its `KEY` regex, plus those inside a chapter whose heading does, plus
everything numbered **≤ 12** — so its own report lines read `tried 12/157` for Moscow Oblast,
`tried 12/187` for Krasnoyarsk Krai and `tried 0/1` for Kurgan. **`none` in that file means "not in
the dozen articles we looked at", not "not in the charter".**

The `KEY` regex is the reason: `центр|столиц|символ|Основные положения|Общие положения`. It does
not contain **территориальн** or **устройств**, and the commonest place a Russian charter names its
centre is an article called *Административно-территориальное устройство* — which is exactly how
Kamchatka Krai's hit was found, and only because that article happens to be numbered 12.

Widening the key to `центр|столиц|символ|территориальн|устройств|наименовани|статус|Общие
положения|Основные положения`, reading each subject's INDEX and then fetching the articles inside
the administrative-territorial chapter turned up two hits in the first five subjects tried:

  · **Chelyabinsk Oblast**, article 18 — *Административным центром области является город Челябинск.*
    (`ustav_chelyab`, chapter `a573badcfa856325a7f6c5597efaaedf`, inside *Глава III.
    Административно-территориальное устройство области (ст.ст. 18-20)*.)
  · **Omsk Oblast**, article 22 — *Административным центром Омской области является город Омск.*
    (`ustav_omsk`, chapter `74d7c78a3a1e33cef2750a2b7b35d2ed`, the article of that very name.)

**Read the INDEX first and fetch by chapter heading**; it costs one request per subject and it is
what the sweep should have done. The remaining non-HIT subjects have not all been re-tested this
way, so the primary-source rung is **not** spent for them either.

**AND A CHARTER ON GARANT IS NOT ALWAYS CURRENT, WHICH IS WORSE THAN ITS BEING SILENT.** Leningrad
Oblast's administrative centre moved to Gatchina in 2021; the charter's article 12
(*Административно-территориальное устройство*) names no city at all, and its article 13 (*Место
нахождения высших органов государственной власти*) still reads *…является город Санкт-Петербург*.
A sweep keyed on "which city does the charter name" would have returned **Saint Petersburg** for
`gru-524`, which renders perfectly and is wrong. **Where the charter and `RUSSIA_CENTRES` disagree,
the charter is the thing to doubt.**

**TWO OF THE RUNNING ORDER ARE NOT WRITEABLE FROM HERE YET**, and they are recorded so the next
batch does not re-derive it: **`gru-502` Krasnogorsk** and **`gru-524` Gatchina**. Neither appears
anywhere on the archive.org shelf (Reclus, Rambaud, Morfill, Kennan, the Siberian railway guide,
Baddeley), neither has a WMO station with published normals, Gatchina is below Rosstat's table 4.9
threshold, and DOAJ and Europe PMC return nothing about either city — the Europe PMC hits for
"Gatchina" are all CERN author lists carrying the Petersburg Nuclear Physics Institute's address.
They wait on the Wayback/portal rung.

**AND A SUBJECT CARD CAN SPEND ITS CENTRE'S MATERIAL.** `gru-047` Sakha already quotes Reclus on
Yakutsk being, after Verkhoyansk, the coldest town in the world, and on its fair; `gru-063` North
Ossetia already carries the Vladikavkaz WMO normals. Both centres are therefore **more expensive**
to write than their place in the running order suggests, not less. **Read the sibling before
choosing a batch, not before writing the card.**

### Batch 29 — six centres: `gru-506`, `gru-510`, `gru-514`, `gru-515`, `gru-525`, `gru-526`

**It is six rather than ten, and the reason is worth keeping.** The finding above unlocked two
charters, so Chelyabinsk and Omsk became writeable; the rest of the batch was assembled by reading
each candidate's SIBLING SUBJECT CARD first, which is what the last section's closing rule asks for,
and four candidates fell out on that reading rather than on sourcing:

| candidate | why not |
|---|---|
| `gru-507` Izhevsk | the only Reclus material is the p. 484 population appendix, and `gru-029` Udmurtia has already spent it |
| `gru-509` Yakutsk | `gru-047` Sakha quotes Reclus on the town's cold and its fair — the centre's whole Reclus entry |
| `gru-512` Vladikavkaz | `gru-063` North Ossetia already carries its WMO normals and its Terek situation |
| `gru-513` Krasnodar | the history block cannot reach five sentences inside the two-citations-per-author cap: Reclus gives Yekaterinodar two sentences and nothing else openable adds a third source |

**A centre is cheap or dear according to what its SUBJECT card has already said**, and the running
order cannot see that. `gru-511` Tomsk failed a different way — the Siberian railway guide's Tomsk
material is about the government rather than the town.

**Two sources carried the batch and both are new to the deck.**
· **`Scientific Reports` 10:1668 (2020), Seleznev, Yarmoshenko and Malinovsky** — urban surface
  sediment in **seven Russian cities**, of which **Rostov-on-Don and Chelyabinsk are two**. Its
  Table 1 is the useful half and is not in the article HTML: fetch
  `https://www.nature.com/articles/s41598-020-58434-4/tables/1` and read the `<table>`. It gives each
  city's geographic and climate zone, its **geological setting by name** (the Rostov ledge; the East
  Urals uplift against the West Siberian plate), its industries and its **cars per thousand
  residents** — that last figure being the one that is safely quotable, since the table's population
  column would echo the facts grid.
· **Rambaud volume 3** (`historyofrussia03ramb`, *A Popular History of Russia, from the Earliest
  Times to 1882*, ed. Nathan Haskell Dole, Estes and Lauriat, 1882). The deck had only volumes 1 and
  2. Volume 3 carries Perovski's Khiva expedition out of Orenburg (pp. 44–45) and much else on the
  Asian frontier.

**THE CHARTER ARTICLE HASH IS A HASH OF THE ARTICLE'S HEADING, NOT OF THE DOCUMENT** — so an
untitled `Статья 18` has the SAME hash in every charter that numbers an article that way, and the
region slug in the path is the only thing that decides which document you get. That is convenient
(a known article-number hash can be tried under another slug) and it is also why **a chapter
listing scraped with a loose regex is not a number-to-hash table**: an `<a href>` must be paired
with ITS OWN text, or the listing reports article 23's hash under article 22's label. **Verify a
citation by fetching it and reading the `<title>`, never by composing it.**

**AND A GARANT ARTICLE PAGE PUTS THE NAVIGATION BEFORE THE TEXT.** The article's own words sit
between the FIRST `(с изменениями и дополнениями)` and the following `Содержание`; a scanner that
cuts at `Конституция РФ` or takes the last `Статья N` reads chrome and reports *no hit* for every
subject. The first form of batch 29's scanner did exactly that and was only caught by running it
against Chelyabinsk's article 18, a hit already in hand. **Prove any Garant scanner fires on a hit
you already hold.**

**Three further reachability findings.**
· **Rostov Oblast's charter cannot be read from Garant at all**: `/region/ustav_rostov/` answers 200
  with the document's title and **no table of contents and no chapter links** — page furniture only,
  on repeated tries. It is not the one-in-ten refusal.
· **Garant's Stavropol charter is the repealed 1994 law**, marked *документ утратил силу*. A hit
  there could not be cited as current law, so `gru-514` rests on Reclus and Baddeley instead. **Read
  the page for that marker before citing any charter.**
· **Orenburg's charter names no centre** — articles 2–11 of *Глава II. Статус Оренбургской области*
  were fetched one at a time and none of them does. Krasnoyarsk's *Раздел III. Территориальное
  устройство края* articles 29–31 likewise: article 31 speaks of establishing the administrative
  centre of a *municipal* formation, which is not the krai's own.

**What each card rests on.** `gru-506` Rostov-on-Don: Reclus vol. 5 pp. 438–39 (Nakhichevan and the
fortress of St Dimitry, the mixed population, the £5,000,000 export trade, the harvest men and the
typhoid), Morfill p. 227 (Azov reduced to insignificance by its neighbour) and the railway guide
p. 112 (its firms buying Chelyabinsk wheat). `gru-510` Chelyabinsk: the charter, and the guide
pp. 110–12 and 136–37 — the town's fortress origin and the Bashkir Cheliaba, the corn trade, the
Nikolsk settlement of 1896, and the emigration station's barracks for fifteen hundred. `gru-514`
Stavropol: Reclus vol. 6 pp. 39 and 64 (Elbrus visible a hundred and twenty miles off; the fort of
1776; the Yegorlik selos) and Baddeley pp. 75, 201 and 459 (the raids reaching the town; Paskievich
on the month's march to Tiflis; the left flank commanded from it until Bariatinsky). `gru-515`
Krasnoyarsk: Reclus vol. 6 pp. 362–63 and the guide pp. 278–80 (the Afontova the town is named
from, Dubensky's fort, Stepanov the first governor, the station's fifteen hundred workmen).
`gru-525` Orenburg: Reclus vol. 5 pp. 378 and 420–21 (the unnavigable Ural; 1742 and the 1735 fort;
the citadel moved twice), Rambaud vol. 3 pp. 44–45 and the guide p. 60 (the Orenburg route rejected
for the Siberian railway). `gru-526` Omsk: the charter, Reclus vol. 6 p. 350 (capital of West
Siberia, the military gymnasium, the Geographical Society branch of 1877) and the guide pp. 33 and
194–95 (the fortress line; the penal prison and Dostoevsky's four years).

**`gru-506` ships with an EMPTY date line, and that is the right answer.** Nothing in its six
sources dates the city itself — Reclus dates its export figure to 1877 and Morfill the cession of
Azov to 1774, neither of which is a date of Rostov-on-Don — so a labelled row would have to be
invented. `test-date-line.js` is what makes an empty line safe: a non-empty line yielding no sort
year is the fault, an absent one is not.

**Pictures: six of thirteen candidates were rejected after being looked at**, which is the pass's
usual rate. The Rostov panorama was a hazy wash with power lines across it; the Stavropol
`Krepostnaya mountain — north view` is an empty paved square over treetops with the city a smudge on
the horizon; `Kazan's stairs — south view` is a fir avenue with no city in it; **the best Orenburg
aerial carries a 500px WATERMARK**, which the pipeline's bar excludes and which no metadata field
reports; and two Omsk streets were power lines and a drab suburban road. **Stavropol and Orenburg
have no wide viewpoint on Commons at all** — both ship their central pedestrian street with a `desc`
that says so, which is the geography plan's own fallback. Omsk's card takes a 5.4:1 quay panorama;
`.card-imgslot` sets `aspect-ratio:auto` with `max-height:280px`, so a panorama is shown whole
rather than letterboxed there.

### Batch 30 — four centres: `gru-529`, `gru-547`, `gru-559`, `gru-566`

Izhevsk, Yakutsk, Blagoveshchensk and Pskov. **Four rather than ten, and this is the batch where the
tail begins to bite**: the cheap centres are spent, and of the seventeen numbers left, six were read up
and put back. What follows is what each of them needs, so the next batch does not re-derive it.

**THE GARANT SWEEP'S REAL YIELD IS ELEVEN MORE ARTICLES, AND BATCH 29's WIDENING IS WHAT FOUND THEM.**
Reading each subject's INDEX, taking the chapter whose heading matches the widened key
(`центр|столиц|символ|территориальн|устройств|наименовани|статус|Общие положения|Основные положения`),
then listing that chapter's own articles and fetching them one at a time turned up a stating article in
eleven of the thirteen subjects tried:

| subject | slug | article | wording |
|---|---|---|---|
| Udmurtia | `cons_udmurt` | 28 ¶2 | *Столицей Удмуртской Республики является город Ижевск.* |
| Chuvashia | `cons_chuvash` | 67 ¶2 | *Столицей Чувашской Республики является город Чебоксары.* |
| Sakha (Yakutia) | `cons_saha` | 48 | *Столицей Республики Саха (Якутия) является город Якутск.* |
| Komi | `cons_komi` | 69 | *Столицей Республики Коми является город Сыктывкар.* |
| Amur Oblast | `ustav_amur` | 118 | *Административно-политическим центром…* — political as well as administrative |
| Lipetsk Oblast | `ustav_lipetsk` | 13 ¶3 | *Административным центром области является город Липецк.* |
| Oryol Oblast | `ustav_orlov` | 14 ¶1 | *Областным центром области является город Орел* — the OBLAST centre, a third form |
| Pskov Oblast | `ustav_pskov` | 14 | *Административный центр (столица) области - город Псков.* |
| Magadan Oblast | `ustav_magadan` | 38 | *Административным центром Магаданской области является город Магадан.* |

Chechnya's `cons_chech` art. 59 and Mari El's chapter VII state no city: the first delegates the status
of the capital to republican law, the second the placing of district and city centres. **Four of the nine
hits are unspent after this batch** — Cheboksary, Lipetsk, Oryol and Magadan — so the primary-source rung
is NOT the thing holding those four back.

**AND THREE CHARTERS ARE NOT ON GARANT AT ALL, WHICH IS A DIFFERENT FACT FROM A SILENT ONE.**
`/region/ustav_tomsk/`, `/region/ustav_kurgan/` and `/region/ustav_kalin/` all answer 200 at about 11.5 KB
— the Rostov shape, page furniture only. Tomsk lists **no** chapter links; Kurgan lists exactly one, a
section marked *исключен*; and the Kaliningrad slug serves not the charter but the 1996 **law bringing it
into force**, whose two articles are about commencement. So Tomsk, Kurgan and Kaliningrad need another
rung for their first sentence, and that is settled rather than untried.

**A 300-CHARACTER PREVIEW OF AN ARTICLE IS NOT THE ARTICLE.** The scanner reported Udmurtia art. 28 as a
hit and the verification print showed only the flag-and-arms paragraph, which read as a false positive;
the centre is in **¶2**, past the cut. Lipetsk (¶3) and Oryol (¶1 of two) are the same shape. **Print the
whole article body when verifying a hit**, and expect the sentence to be a numbered part rather than the
article's opening.

**WHAT FELL OUT, AND WHY — the sibling rule and the shelf, measured rather than guessed.**

| candidate | why not |
|---|---|
| `gru-539` Cheboksary | **Reclus vol. 5 never names the town** (checked under Cheboksar/Tcheboksar/Cheboksari), Rambaud's one mention is the 1551–52 founding, which `gru-039` has already spent, and DOAJ yields only the toponymy and regiolect papers — two history sentences where five are needed |
| `gru-543` Lipetsk | the shelf has the p. 435 population appendix and nothing else; **Rambaud's "Battle of Lipetsk (1216)" is a DIFFERENT Lipetsk**, near Pereyaslavl-Zalessky, and must not be used; DOAJ returns beetles and rolling mills |
| `gru-562` Oryol | `gru-062` has spent Reclus's whole Orol town entry (founded 1564, the fire of 1679, the four railways, the corn and hemp, the 44,280); what is left is province-level — Rostopchin born in the government, Yermolov retiring there, the nobles' 1858 committee, the guberniya's church revolution of 1917 — so three of five history sentences would be about the oblast, which is `gru-062`'s own card |
| `gru-561` Syktyvkar | Reclus's three Ust-Sisolsk pages are all spent by `gru-061`, and the only city-specific paper reachable is Gagieva on 19th-century public charity; **`journals.bsu.by` does not answer from here**, which killed Zherebtsov and Lejman on the 1921 Komi autonomy, the one source that would have carried the 20th century |
| `gru-560` Kurgan, `gru-549` Kaliningrad | no charter (above), and their first sentence is the cheapest part of the card |

**Two new sources, both of which will serve more than one card.**
· **`Науковый диалог`'s 1844 senatorial revision of Yakutsk Region** (Arkhipova and Petrov, no. 4 (2020):
  271–90) — the only senatorial revision the region ever received, auditing the regional administration
  AND the town's own **ratusha**, its findings read as the groundwork for prising the region loose from
  Irkutsk province. Russian abstract only, and the abstract carries the claims.
· **Bogatova's work on the capitals of the ethnic republics** (`Историческая этнология` 9, no. 3 (2024):
  397–412, on Izhevsk and Saransk; and `Финно-угорский мир` 17, no. 2 (2025), on the same pair) — the
  "centres for the implementation of other people's initiatives" framing, the capital measured against
  other regions' industrial cities, and the turn from locomotive of modernisation into donor of people.
  **It will serve Saransk, and any republic capital after it.**

**RECLUS VOL. 6 HAS FOUR UNSPENT YAKUTSK PASSAGES AND `gru-047` TOOK ONLY p. 398.** p. 308 is the boring
driven 385 feet through the sandstone that could not pass the frozen strata; pp. 394–97 the Yakut
artisans — every carpenter, joiner, painter and carver in the town — making samovars and rifles with
primitive tools, and Yakut spoken in Russian officials' drawing rooms; pp. 442–44 the thirteen thousand
horses a year carrying the Pacific fleet's supplies over the Aldan before 1807. **Check the volume's own
index before writing a centre off as spent**: a subject card cites one page and the town may be on five.

**THE SIBERIAN GUIDE'S BLAGOVESHCHENSK ENTRY IS pp. 408–10 AND `gru-059` TOOK 379–80.** It gives the
Ust-Zeysk post of 1856, the village of 1857 and the township of 1858, Muravyov-Amursky reporting the
treaty of Aigun from it on 21 May 1858 with Archbishop Innocent laying the Annunciation church's first
stone the same day and the renaming *in commemoration of the good news*, the growth from 1880 on gold and
emigration, and the 1862 printing office fitted with Russian **and Manchu** type. The Amur coal is p. 384
and Poyarkov's 1643 expedition out of Yakutsk p. 391.

**`gru-547` SHIPS WITH AN EMPTY DATE LINE, AND THE REASON IS THE CONSTITUTION.** Garant states **no
adoption date** for the Sakha constitution — the document's own title page carries none — so the card
cites it undated, and nothing else in its sources dates the city itself. An empty line is the honest
answer; a `Constitution` row with a date composed from elsewhere is not.

**PICTURES: three of seven candidates were rejected after being looked at, including the one whose file
name was the most promising in the batch.** `Blagoveshchensk, Russia, and Heihe, China (12757409723).jpg`
is a hazy shot of a river cargo wharf with three tower cranes and no city in it; the "Панорама (дорога от
Моховой Пади)" series is a green hillside with Blagoveshchensk an invisible smudge on the horizon, which
is the Stavropol *Krepostnaya mountain* failure exactly; and `Aerial photographs of Izhevsk-10.jpg`,
which the fetcher's own `SKYLINE_RX` returned as the city's wide view, is a close drone shot of a single
monument. **PIL is not installed in this sandbox, so `contact-sheet.py` will not run** — at four cards the
answer is to fetch each candidate through `Special:FilePath?width=1100` and read it one at a time, and
that is what was done.
· **A COMMONS "PANORAMA" IS A CLAIM ABOUT THE LENS, NOT ABOUT THE SUBJECT.** Both rejected panoramas are
  genuinely panoramic and neither is a view of its city.
· The four installed are a ferris-wheel view over the Izhevsk Pond, a 3.5:1 winter panorama of Yakutsk
  from Chochur Muran, the Amur embankment at Blagoveshchensk in January with Heihe across the ice, and
  the Pskov kreml from the Velikaya. The glossary's four are deliberately a second view of each: the
  derelict works on the Izhevsk Pond, the Tuymaada valley in summer, the Blagoveshchensk waterfront at
  night from a boat, and a 5.4:1 panorama taken **inside** the Pskov kreml.

**`check-style.js` CANNOT SEE A CARD'S BACKGROUND, AND THIS BATCH IS WHERE THAT SHOWED.** Rule 3 (a
century or millennium is numbered) fired on the two century-words in the new **Pskov glossary entry** and
was silent about the two in the **Pskov card**, because the checker reads `data.js` and the abstract now
lives in `data-extra/`. Measured while fixing it: the collection's lazy half carries **37 century-words**
against 25 numbered forms, a standing backlog nothing reports. **Write the numbered form by hand in a
card abstract; the checker will not catch you.**

**AND ONE MORE CROSSREF ROW, of the kind that is a fact about the publisher.** Science & Technique
deposits — and prints in its own preferred citation line — *Grakhov V.P., Kislyakov M.A., Kislyakov А.А.*,
with the third author's initials in **Cyrillic** beside a Latin surname while the first two are Latin. The
citation writes all three in Latin and the row is declared in `CROSSREF_WRONG`: a Cyrillic homoglyph
inside a Latin name breaks search and reads as corruption, which is the one thing a citation must not
ship.

### Batch 31 — two centres: `gru-562`, `gru-563`

Oryol and Vladikavkaz. **Two, and the honest report is that the reachable shelf is now the binding
constraint rather than the charter route.** Every one of the fifteen numbers left was read up; thirteen
were put back with a reason, and the reasons are below so that nobody re-derives them.

**TWO MORE CHARTER HITS, AND MOSCOW OBLAST'S IS A REAL ABSENCE.** The batch-29 method (index →
administrative-territorial chapter → each article in turn) was run against the five subjects never
tested:

| subject | slug | result |
|---|---|---|
| North Ossetia–Alania | `cons_osetiya` | **art. 64 ¶4** — *Столицей … является город Владикавказ (Дзауджикау)*, which gives the **Ossetian form beside the Russian** and is worth quoting for it |
| Moscow Oblast | `ustav_mosobl` | **none** in either the status chapter (arts. 22–26) or the administrative-territorial one (arts. 38–39); Krasnogorsk became the seat in 2007 and the charter does not name it |
| Kalmykia | `cons_kalmik` | index carries 49 links and **no chapter heading matches the widened key** |
| Mari El | `cons_mariy` | chapter VII states the placing of district and city centres, not the capital |
| Krasnodar Krai | `ustav_krasnod` | the only matching heading is *Глава 2. Финансы* — the key's `устройств` catching *бюджетное устройство* |

So the nine unspent charter hits are now seven: Cheboksary, Lipetsk, Syktyvkar, Magadan, Anadyr,
Naryan-Mar and Yoshkar-Ola's absence. **The charter is no longer what is holding any card back.**

**WHAT IS HOLDING THEM BACK, CITY BY CITY, MEASURED.**

| candidate | the refusal |
|---|---|
| `gru-539` Cheboksary | **its geology is now solved and its history is not.** Murchison gives the town a full ascending section (p. 180) and puts the black earth's northern limit on the Volga's left bank west of it (p. 557) — but Reclus vol. 5 **never names the town** under any spelling, Rambaud's one mention is the 1551–52 founding `gru-039` has spent, and Morfill, Howorth, Kennan and Rambaud vol. 3 have nothing. DOAJ yields the toponymy and regiolect papers and the reservoir's invasive fish: two history sentences where five are wanted |
| `gru-543` Lipetsk | the shelf has the p. 435 population appendix and **nothing else**; Morfill has no mention of Peter's ironworks here, and Europe PMC's four full-text hits are hantavirus and leafrollers |
| `gru-561` Syktyvkar | Reclus's three Ust-Sisolsk pages are all spent by `gru-061`, Gagieva's 19th-century public charity is the only city paper, and **`journals.bsu.by` does not answer from here**, which killed Zherebtsov and Lejman on the 1921 Komi autonomy — the one source that would have carried the 20th century |
| `gru-581` Magadan, `gru-582` Anadyr, `gru-583` Naryan-Mar | all three have a charter, a WMO station with real normals and a `?` grid, and **no city history reachable at all**. DOAJ returns nothing for *Магадан история*, *Анадырь город*, *Пустозерск* or *Нарьян-Мар* as a town; Europe PMC's *"city of Magadan"* hits are all trace-element and drinking-water studies; Grebenyuk's new paper is the oblast's agriculture. Reclus has the **Anadyr basin** in quantity (pp. 399–410: the fort of Anadirsk burnt by the Chukchis, the salmon driving the water before them like a moving wall, Mount Makachinga) but that is the river and not the town, and Anadyr was founded as Novo-Mariinsk in 1889, which nothing openable states |
| `gru-560` Kurgan, `gru-546` Tomsk, `gru-549` Kaliningrad | no charter on Garant (batch 30) and no city history either |
| `gru-503` Krasnodar, `gru-530` Grozny, `gru-564` Yoshkar-Ola, `gru-578` Elista | no charter sentence and the sibling has spent the reachable history |
| `gru-502` Krasnogorsk, `gru-524` Gatchina | unchanged from batch 29, and Moscow Oblast's charter is now known not to help |

**THE MUNICIPAL PORTALS ARE REACHABLE THROUGH THE WAYBACK MACHINE, AND THAT IS THE NEXT RUNG.** Tested:
`web.archive.org/web/2023/http://www.anadyr.org/` answers 200 with 84 KB and `…/https://adm-nmar.ru/`
with 114 KB, while `magadangorod.ru` fails even through the archive. **But `anadyr.org` is a news site
rather than the city administration**, which is the trap to expect: the okrug and city administrations
sit on other hosts, and finding the right one per town is a piece of work in itself. **That is what the
last fifteen are waiting on, and it is a session of its own rather than a card-writing batch.**

**MURCHISON IS THE GEOLOGY SOURCE THIS COLLECTION HAD BEEN MISSING FOR THE CENTRAL GOVERNMENTS.** The
*Geology of Russia in Europe* was already in the deck for Orenburg's salt, and it carries Oryol at
length: the **geological axis of European Russia**, a dome of Devonian rock about 800 feet above the
sea "duly exposed in the gorges of the Oka above and below Orel" and running 200 miles in the parallel
of Voronezh and Orel (p. 53), a plate of the **quarries of Devonian rocks at Orel on the banks of the
Oka** (p. 56), and the high ground near Kursk and Orel that deflects the Oka north to the Volga and
sets the Don running north before it escapes south (p. 20). **Search it by 19th-century spelling** —
`Tcheboksar`, `Orel` — and note its 79 Orel hits are mostly the government rather than the town.

**A SUBJECT CARD CITES ONE PAGE AND THE TOWN MAY BE ON FIVE — BUT THE CONVERSE ALSO BITES, AND
VLADIKAVKAZ IS THE CASE.** `gru-063` cites Baddeley only at pp. 20–21, which sounds narrow; those two
pages are **the whole founding of the city** — Potemkin's fort of 1783 where the Terek issues from the
mountains, the road, the drive to Tiflis in October 1783, the destruction and the rebuilding of 1799,
Tsitsianov's postal service. So the centre card takes the **1832–46 material instead**: Kazi Mulla
threatening the town and besieging Nazran, Tornau's account of every ear in the place turned towards the
beleaguered fort, Nicholas the First arriving by the Georgian road in October 1837 on the tour that cost
Baron Rosen his post (Baddeley pp. 261, 311), and the railway question — the Vladikavkaz–Tiflis stretch
as the one land gap between the Black Sea and the Caspian, and the tunnelling reckoned too dear
(Reclus vol. 6 pp. 75–76 with Morfill p. 472, which is a second and independent witness to it).
**And Reclus glosses the name in the VLADIVOSTOK entry** (p. 447), not in the Vladikavkaz one: *Ruler of
the Caucasus*, named on the same principle at the other end of Asia. Grep the volume for the name
rather than reading only the town's own pages.

**THE COMMONS API RATE-LIMITS THIS SANDBOX HARD, AND `fetch-geo-images.js` REPORTS THAT AS A MISSING
FILE.** Both of this batch's pinned files came back as `no file info for File:…` — which its own header
warns "reads as a file that does not exist and is nothing of the kind" — while the same two files
downloaded and displayed perfectly through `Special:FilePath`. **Poll rather than retry in a burst**:
an `until … do sleep 25; done` loop round one search gets an answer where six searches in a minute get
429 on all of them, and `upload.wikimedia.org` was still answering 503 on the finished `src` strings
after the API had recovered. The strings are the API's own `thumburl`, cleaned the way the fetcher
cleans them, so a 503 there is this sandbox's limit and not a dead link.
· **FOUR OF FOUR NUMBERED-SET CANDIDATES WERE REJECTED**, which is worth knowing before spending
  requests on one: `Vladikavkaz-007` is a gilded lion, `-020` a family of swans, `Oryol (36333216394)`
  a flower bed and a car park, and `Oryol (32761130431)` **the inscription on a monument's plinth** —
  the museum-text-panel family again. A file named `<City>-NN.jpg` carries no information about its
  subject at all.
· **COMMONS' ORYOL COVERAGE IS GENUINELY POOR**, and the card ships the honest best: a 2,592px view
  across the Oka to the boat landing and the wooded right bank. The alternative found was a photograph
  taken through a dirty window at dusk with the frame in shot.

## Batch 32 — `gru-530` Grozny, `gru-546` Tomsk, `gru-549` Kaliningrad

**THE `FULL_TEXT:` FIELD PREFIX IS DEAD AND RETURNS 0 FOR EVERYTHING, AND IT HAS BEEN COSTING THIS
COLLECTION UNLOCKS FOR TEN BATCHES.** Europe PMC's full-text search is the fifth rung of the capital
half's ladder and it was being asked in the form `FULL_TEXT:"city of Tomsk"`, which answers **0 hits**
— for that phrase and for every other. The same phrase as a **bare quoted string** answers **54**.
Nothing about the failure says *bad query*: a zero-hit response is well formed and reads exactly like a
phrase no paper contains, so the rung was being tested and reported shut on every city it was tried on.
**Prove a search engine's field syntax on a phrase you already know is in it before believing a zero.**

**IT UNLOCKED FIVE CITIES AT A STROKE**, and three of them ship here. The seat sentence — *X is the
administrative centre of Y*, the one claim no rung was answering — was found in the Study Area or
Methods paragraph of an open-access paper for Grozny (Shanks et al., *BMC Medical Ethics* 2015,
`10.1186/s12910-015-0032-x`, "Grozny, the capital of the Chechen Republic"), Tomsk (Zvonareva et al.,
*PLOS ONE* 2021, `10.1371/journal.pone.0257379`, "Tomsk is the administrative center of Tomsk Oblast"),
Kaliningrad (Skrypnik et al., *Plants* 2020), **Cheboksary (PMC10331122)** and **Yoshkar-Ola
(PMC11668746)**. The last two are carried for a later batch on their history rather than their seat:
`gru-539` and `gru-564` now need only the five history sentences, which is a different refusal from the
one batch 31's table records against them. **Batch 31's "no charter, no seat sentence" verdict on
Grozny, Tomsk and Kaliningrad was an artefact of the dead field, not a fact about the literature.**

**SO THE BINDING CONSTRAINT ON MOST OF THE FIFTEEN WAS THE SEAT SENTENCE RATHER THAN THE HISTORY** —
the opposite of what batch 31's table assumed. All three of this batch's cities had five history
sentences available on the out-of-copyright shelf the whole time; what was missing was one modern
sentence saying the city is the seat. Re-ask the seat question on a candidate the plan has written off
before concluding its history is what is wanting.

**THE SIBLING SUBJECT CARD WAS READ FIRST IN ALL THREE CASES, WHICH IS WHAT DECIDED THE HISTORY.**
`gru-030` Chechnya had spent the 1818 founding, the name's meaning, Gunib 1859, the oilfields, the 1944
deportation and 1999 — so Grozny takes Baddeley's Grebentsi Cossacks (p. 7), Grekov's six years
(p. 147), Yermolov's preserved *zemlianka* (p. 108), Freitag's 160-verst ride to the relief (pp. 409–11)
and the bombardment of 24 July 1846 (p. 426). `gru-046` had spent Toyanov Gorodok, 1604 and the
university's founding — so Tomsk takes Kennan's exile-system material entire (vol. 1 pp. 111–12,
285–86, 312). `gru-049` had spent the Teutonic Order, 1237, 1758 and Potsdam — so Kaliningrad takes
Morfill's three Königsberg passages (pp. 19, 81, 335) with the Stanford Encyclopedia's Kant.
**Fold the page numbers into ONE citation per author**: `check-cards.js`'s rule 1 caps an author at two
citations per card, and five separate Baddeley pages is five citations of one scholar.

**FOUR TRAPS FROM THE FETCHING, EACH OF WHICH READS AS SOMETHING ELSE.**
· **`Special:FilePath` 302s, so curl WITHOUT `-L` writes Wikimedia's error page into the output file.**
  `file` then reports "HTML document" and the whole thing reads exactly like the hard rate-limiting
  batch 31 recorded. With `-L` every download worked first time. **Check for the redirect before
  concluding the host is throttling.**
· **curl returns EMPTY BODIES against `commons.wikimedia.org/w/api.php` where node's `https` module
  against the same URL works.** All API calls here go through a small node helper instead.
· **The djvu OCR of the out-of-copyright volumes uses DOUBLE SPACES between words**, so a single-space
  regex matches nothing: `"City of Tomsk"` returned 0 hits in a file containing it 21 times. Normalise
  `\s+` → `" "` before searching, in both the finder and the page-number resolver.
· **MDPI's DOI 403s from here, and so does `europepmc.org`** — cite the PMC canonical
  (`https://pmc.ncbi.nlm.nih.gov/articles/PMC7154876/`), which `check-citations.js` still verifies.

**THE MORFILL TITLE WAS WRONG ON THIRTEEN CARDS AND THE SCAN'S OWN TITLE PAGE SETTLED IT.** Every
citation of it read *A History of Russia from the Birth of Peter the Great to Nicholas II*; the title
page reads **TO THE DEATH OF ALEXANDER II**. Corrected on `gru-001`, `002`, `004`, `005`, `007`, `008`,
`010`, `011`, `019`, `020`, `022`, `024` and `508` through `add-sources.js`. **Nothing in the pipeline
can see this** — the URL resolves, the author is right, the pages are right — so read the title page of
an out-of-copyright work the first time it enters the deck rather than carrying a remembered title.

**PICTURES: FOUR REJECTED AFTER LOOKING, AND ONE LICENCE REFUSED.**
· `Вид с горы 2011 3.jpg` (Grozny) — portrait, slushy foreground, the city only in the top third.
· `Grozny panorama.jpg` — a person leaning on a railing in the right foreground, a construction site
  at the left.
· `Tomsk Sunset Overview - panoramio.jpg` — two-thirds sky. **Its Commons author field is also
  truncated at the source** (`Vladimir Zhdanov (WT…`, a Panoramio bot import), which is a second reason
  not to reach for it: the credit cannot be written in full from what Commons holds.
· `Tomsk from jet.jpg` — its own Commons description says *South of Tomsk … Кировский район*, so
  captioning it as the city would over-claim.
· `Kaliningrad 05-2017 img10 aerial view.jpg` is **FAL**, which is not on Folio's PD / CC BY / CC BY-SA
  bar, and was refused on the licence rather than on the picture.
· **`Kaliningrad Russia.jpg` is not Kaliningrad.** It is the red-brick Cranz church and the *Домик
  Ангелов* museum at **Zelenogradsk**, 30 km up the coast — the right name in the wrong place, which is
  the one family the contact sheet exists to catch and which no metadata reports.
So the three CARD pictures are pinned files, and of the three new glossary terms only **`Grozny`** ships
with one (`City of Grozny in 2011.jpg`, CC BY-SA 3.0, Adam Smit — a wide daylight view across the
rebuilt civic quarter to the Grozny-City towers). `Tomsk` and `Kaliningrad` ship without, for the
reasons above; a term with no free, correctly-identified wide view is recorded rather than given a
picture of somewhere else.

**TWELVE CENTRES LEFT** — `gru-502`, `503`, `524`, `539`, `543`, `560`, `561`, `564`, `578`, `581`,
`582`, `583` — of which **`gru-539` Cheboksary and `gru-564` Yoshkar-Ola now have their seat sentence**
and want only history, and the other ten stand as batch 31's table records them.

## Batch 33 — `gru-564` Yoshkar-Ola

**ONE CARD, AND THE REASON IS WORTH MORE THAN THE CARD.** Batch 32's corrected Europe PMC search had found
the seat sentence for five cities; this batch went after the two it carried forward, Cheboksary and
Yoshkar-Ola, and only one of them could be written. What made the difference was not the seat sentence
but **a single open journal**.

**`Поволжская археология` HAS FIVE PAPERS ON TSAREVOKOKSHAYSK, AND THAT IS THE WHOLE OF WHY YOSHKAR-OLA
SHIPS.** Searching DOAJ on the town's OLD name rather than its modern one — `bibjson.title:"Tsarevokokshaysk"`
— returns four papers where `bibjson.title:"Yoshkar-Ola"` returns eight, nearly all of them linguistics
and ecology. Between them the four carry a whole city history: the four excavated necropolises and the
span they cover (Danilov and Zeleneev 2021), the town as a typical Russian fortress settlement and what
the fall in its military importance did to its plan (Vysotskaya and Eparova 2025), the 1795 town plan and
the written descriptions of 1728, 1795 and 1837 with the kremlin, the prison and the Zaostrozhnaya quarter
(Danilov 2023), and the Entry into Jerusalem church of 1759 with the sloboda and monastery around it
(Vysotskaya, Danilov and Sokolov 2021). **The journal was already in the deck** — `gru-039` cites its
Chuvash Sura Region paper — so the one thing needed was to search it under the right name.
**SEARCH A RUSSIAN TOWN UNDER ITS PRE-REVOLUTIONARY NAME**; three of these five are invisible under the
modern one. Its ENGLISH abstracts are on `archaeologie.pro` and are detailed enough to write from, and
Crossref carries full given names for every author, so the citations check clean without opening a PDF.

**THE AUTHOR CAP DECIDES WHICH FOUR OF THE FIVE ARE CITED.** Danilov leads three of them and Vysotskaya
two, so the fifth (the Cathedral of the Resurrection paper, `10.24852/pa2022.4.42.230.239`) is left out
rather than putting a third Danilov-led citation on one card. It is the obvious source for a future
revision.

**CHEBOKSARY IS DEFERRED AGAIN, AND THE REFUSAL HAS MOVED.** Batch 31 recorded it as having no seat
sentence and no history; the seat sentence is now found (Baranova, *Journal of Eurasian Studies* 2023,
`10.1177/18793665231185792`, which collected signs in "Yadrinskiy district and Cheboksary, the capital"),
and **a paper that is exactly the card's history exists and is open**: Nikolay S. Myasnikov, "Archeology
of Cheboksary: Problems of Study, Protection and Museumification," *Ufa Archaeological Herald* 24, no. 3
(2024): 461–78, `10.31833/uav/2024.24.3.029`. **What blocks it is the PDF.** Its text is stored with NUL
separators and a **fixed +29 offset** on the Latin block — which decodes cleanly, and gives the English
abstract, the author's affiliations and the whole reference list — while the **Cyrillic body is a second,
non-uniform substitution** that does not fall to a constant shift. The Latin fragments alone are readable
enough to tempt (`1555±1704`, `1469`), and **that is exactly the shape of thing not to write a card from**:
a half-decoded cipher yields sentences that look researched. So the paper is recorded here with its full
citation, for a batch that solves the substitution or finds another route to the same facts.
· **HOW TO DECODE THAT FAMILY, since half an hour went on it.** The separator is `\x00`, which a terminal
  renders as a space and which therefore looks like UTF-16 spacing — `repr()` the line rather than reading
  it. Strip the NULs, then add 29 to every byte. **The crib that pins the offset is a word you can already
  see**: `& K H E R N V D U \` is *Cheboksary* at +29 on every letter.
· **Murchison's geology is ready for that card** — the ascending section at Tcheboksar (p. 180), the
  cavernous limestones in the ravines west of it, the black earth's northern limit on the Volga's left
  bank west of the town (p. 557), and the speculation that the Aralo-Caspian ramified in a bay north of
  it, which he hedges himself. **Search him as `Tcheboksar`**; there are nine hits.

**THE OTHER TEN WERE RE-TESTED AND STAND.** Krasnodar has no seat sentence anywhere in Europe PMC (the
one hit for `"capital of Krasnodar Krai"` is an indexing artefact — Nefedova, Treivish and Sheludkov 2022
never says it), and **`journals.bsu.by` still resets the connection**, which is what killed Syktyvkar's
20th century in batch 31 and kills it again. Measured, not read back.

**AND ONE DEFECT FROM BATCH 32, FOUND BY RUNNING THE RIGHT COMMAND.** `Tomsk` shipped at **115 words**,
over the 110 ceiling. The closing check had read `gloss-length.js | tail -3`, which prints the **per-kind
summary** and happened to end on a kind with nothing outside the bar — a line that reads exactly like a
verdict and is not one. **Run `gloss-length.js --over` and `--under`; the tail is not the answer.** Trimmed
to 110 in this batch.

## Batch 34 — `gru-539` Cheboksary, and the PDF cipher solved

**THE `Уфимский археологический вестник` CIPHER IS SOLVED, AND IT IS A LINEAR GLYPH MAP.** Batch 33
recorded Myasnikov's Cheboksary paper as open but unreadable — the Latin block decoding on a fixed +29
offset while the Cyrillic body "did not fall to a constant shift". It does; the shift is simply into a
different block, and the reason it looked non-uniform is that **the separator byte differs per font run**.
The whole recipe, which should work on any PDF of this family:
· A Latin run is `\x00`-separated and each glyph is its character **minus 29**.
· A Cyrillic run is **`\x02`-separated**, with **`\x03` for a space**, and the glyph codes are a straight
  alphabet: **`0x3A`–`0x59` = А–Я, `0x5A`–`0x79` = а–я**. No substitution table, no frequency analysis.
· **`repr()` the line before reasoning about it.** A terminal prints `\x00` and `\x02` as spaces, which is
  what made the runs look like UTF-16 spacing and sent the first two attempts after the wrong structure.
· **The crib that pins each block is a word already visible.** `& K H E R N V D U \` is *Cheboksary* at
  +29 on every letter, and the twelve-letter word `0x62 0x6b 0x6c 0x68 0x6a 0x62 0x71 0x5f 0x6b 0x64 0x62
  0x6f` is *исторических*, which fixes и at `0x62` and so the whole alphabet by arithmetic.
· **A per-line brute force over shifts finds nothing** and was the wasted half of the batch: the score was
  computed against a Cyrillic word list while the text was still being mapped into the wrong block.

**WHAT THAT UNLOCKED, AND IT IS A WHOLE CARD.** Myasnikov gives Cheboksary's own history in quantity:
**Russian chronicles first name the place in May 1469**, in the account of the voivode Ivan Dmitrievich
Runo's march on Kazan, and that entry is taken for the founding (after Dimitriev 2012); the excavations of
**1969–72 and 1979–80**, run before the hydroelectric station and the reservoir that drowned much of the old
centre in **1981**, showed an urban-type settlement on the site **already in the 13th–14th centuries**
(Krasnov and Kakhovsky 1978); the name was **singular until the 20th century**, most linguists taking it
from a Tatar word for a willow-bed, while the Chuvash **Shupashkar** is traced to a Mari compound of *tub*
and *river*; the first settlers by toponymic evidence were **Mari**; a **wooden kremlin and ostrog in 1555**
after the fall of Kazan; a district centre with a garrison and a voivode's administration in the 16th–17th
centuries and a small merchant town of Kazan Governorate thereafter; and **about 5,000 people in some 600
hectares by 1917**, the growth coming with the capital status of the Chuvash Autonomous Oblast (1920) and
ASSR (1925). It also records **56 archaeological sites inside the city limits**, 14 of them stray finds.
**The 1551 founding `gru-039` carries from Rambaud is the FORTRESS, not the town**, and the card is worded
so the two do not contradict each other.

**MURCHISON CARRIED THE CARD'S PHYSICAL HALF, as batch 31 predicted** — the ascending section at
Tcheboksar and the cavernous limestones in the ravines west of it (p. 180–81), and the black earth's
northern limit on the Volga's left bank west of the town (p. 557 *et seq*, which is the book's own index
entry rather than a header read off the scan). Search him as **`Tcheboksar`**.

**GATCHINA IS BLOCKED, AND ON A DIFFERENT THING FROM WHAT THE TABLE SAYS.** `gru-524`'s history is now
richly available — DOAJ under the modern name returns six papers, of which **Alison K. Smith, "New Town,
New Townspeople: Transforming Gatchina in the 1790s," *Vivliofika* 7 (2019), `10.21900/j.vivliofika.v7.537`,
is a full English article under CC BY** on Paul's decree of 11 November 1796 making his villages of
Pavlovsk and Gatchina towns, and on the merchant and *meshchanin* corporations and the *ratusha* that
followed. What cannot be sourced is the **seat sentence**. Europe PMC has nothing, and **the charter on
Garant is stale in the one way that matters: article 13 of the Leningrad Oblast charter, fetched and read
in full, still names Saint Petersburg as the seat of the oblast's supreme bodies.** Citing the primary rung
here would print the wrong city on the card. **A stale charter that merely omits the sentence costs a
batch; one that states the OLD answer would have shipped a false claim** — so read the article, do not
just test whether the rung answers.
· **ROSSTAT TABLE 4.9 CARRIES NO LENINGRAD OBLAST CITY AT ALL**, Saint Petersburg being a federal subject
  of its own. So `gru-524` will take `?` in three grid rows whenever it is written, and its fifth sentence
  has no sibling town to name — which is a case batch 28's rule did not anticipate.

**ONE CENTRE WRITTEN, TEN LEFT.**

## Batch 35 — `gru-561` Syktyvkar, and CyberLeninka

**`cyberleninka.ru` ANSWERS FROM HERE, AND IT IS THE LARGEST UNLOCK THIS HALF OF THE COLLECTION HAS
HAD.** It is Russia's big open-access aggregator, it holds the regional-history journals these ten cards
need, and **its full-text search is one POST away**:

    POST https://cyberleninka.ru/api/search   {"mode":"articles","q":"<Russian query>","size":8,"from":0}

The response carries `name`, `annotation`, `authors`, `year`, `journal`, `link` and `ocr` — OCR snippets
around the match. Four things about it:
· **The SEARCH PAGE is useless and the API is not.** `/search?q=` returns only the help text, its results
  being drawn by JavaScript; the API returns them as JSON.
· **The ARTICLE pages are captcha-walled** (`/article/n/<slug>` answers 200 with *Вы точно человек?*), so
  CyberLeninka is a FINDING tool, not a reading one.
· **THE READING IS DONE AT THE PUBLISHER, THROUGH THE DOI.** The `ocr` field gives enough to identify the
  paper; resolving its DOI landed on `komisc.editorum.ru` with an English abstract **and the whole Russian
  body inline**. That is the pattern: find on CyberLeninka, read at the publisher.
· **Query in RUSSIAN and under the PRE-REVOLUTIONARY NAME**, batch 33's rule again — *Усть-Сысольск*
  returns the town's own social history where *Сыктывкар* returns Komi-language books that merely name it
  as their place of publication.
**`elibrary.ru` is 403 and `naukaru.ru` answers**; both measured this batch.

**SO SYKTYVKAR SHIPS, AND IT WAS NEVER THE SEAT THAT BLOCKED IT.** The Komi constitution's article 69 has
been a recorded `HIT` since the charter sweep — *Столицей Республики Коми является город Сыктывкар* — and
it was re-fetched and read in full here. What was missing was the city's own history, which batch 31 put
down to `journals.bsu.by` being dead (it still is, re-tested). CyberLeninka answers it instead: the
Matsuk and Leyman paper on the townsmen of Ust-Sysolsk at the end of the 18th century carries the town's
creation in Catherine's local-government reform of 1780, the state peasants passing automatically into
the estate of townsmen, the 1782 and 1795 revisions (811 and 833 against 799 and 899), the 327 men lost
to death and conscription between them, and the families moving in and out of the merchantry — five
history sentences from one paper. Gagieva's public-charity paper, already known from DOAJ, carries the
later 19th century, and Glushakova's urban-soils paper supplies both a second statement of the seat and
the modern city's own character.

**A CROSSREF MISMATCH THAT WAS THE CHECKER WORKING, NOT A FAULT.** The citation was written
*M. A. Matsuk* from the Russian *Мацук Михаил Александрович*; Crossref and the publisher both spell it
**Macuk**, with the initials **M. M.** `check-citations.js` caught it on the first run. **A romanisation
derived from the Russian is an expansion by another name** — take the publisher's own.

**THE PICTURE RULES BIT TWICE, AND BOTH ARE WORTH KNOWING.**
· **A 429 FROM `upload.wikimedia.org` CAN MEAN YOU ASKED FOR THE ORIGINAL, AND THE ERROR BODY SAYS SO** —
  *"please … instead use thumbnail images in sizes listed on https://w.wiki/GHai"*. The API's own
  `thumburl` is sometimes the ORIGINAL URL (it was here, for a 1200 px file asked for at 1100), and
  fetching it failed eight times running while a sibling file downloaded first try. **Asking the API for
  a width that resolves to a LISTED size — 960 px — succeeded immediately.** Read the error body before
  concluding the host is throttling the sandbox.
· **THE ONE HISTORICAL GENERAL VIEW OF UST-SYSOLSK ON COMMONS CARRIES A SITE WATERMARK**
  (`OldSyktyvkar.ru`, bottom right of an otherwise perfect pre-revolutionary postcard), which fails the
  no-watermark bar. So the glossary term ships **without a picture**, the card holding the one good modern
  wide view; the street-level alternative was rejected as a street corner rather than a view of the city.

**NINE CENTRES LEFT**, and the four with a recorded charter hit — Lipetsk, Magadan, Anadyr, Naryan-Mar —
are now the ones to take to CyberLeninka first. Lipetsk already has two leads: Ruban's archival paper on
the mineral waters (2022) and Belova's on the same subject as an urban-planning factor (2025, whose
publisher is behind DDoS-Guard from here, though **DOAJ's own API returns its abstract**).

## Batch 36 — Lipetsk, Magadan, Anadyr, Naryan-Mar (2026-09-24)

Four centres, and the batch's real product is a **reading** route rather than a finding one.

**CYBERLENINKA'S `/pdf` ADDRESS IS NOT CAPTCHA-WALLED.** `https://cyberleninka.ru/article/n/<slug>/pdf`
returned the publisher's own PDF for two of the five articles tried, Belova's *Липецкие минеральные
воды* among them — which is the whole Lipetsk history, read in full from a publisher that answers only
behind DDoS-Guard. **It answers 200 either way**: where no PDF was deposited the same address serves
the captcha page under a `.pdf` name at about 5.8 KB, and `pdf-text.js` run over that reports nothing
and exits clean. `file` the download before reasoning about it. Batch 35 recorded CyberLeninka as a
finding tool only; it is both.

**AND `marhi.ru/AMIT/` IS THE OTHER HALF OF THE SAME LESSON.** *Architecture and Modern Information
Technologies* is not in Crossref at all — a title search there returns three unrelated papers — and it
publishes every article as a free PDF on the institute's own site. Recent issues link
`/<slug>/abstract.php`, whose page links `/<slug>/<slug>.pdf`; 2024's issues file them as
`PDF/NN_<author>.pdf` under `/AMIT/<year>/<n>kvart<yy>/`, and the index pages are windows-1251. It
carried **Dolinskaia on Magadan's general plans** and **Chaika on Chukotka's settlement**, neither of
which any English source has.

**READ THE PRINTED CITATION, DO NOT COMPOSE THE PAGINATION.** Both of these journals print their own
preferred citation in the running head — *2025. № 3. С. 18–25* for Belova, *2024. №3(68). С. 236–262*
for Dolinskaia — and a guess at Belova's from the DOI tail gave 16–25. The Dolinskaia article was
additionally identified by its LAST page: CyberLeninka's OCR opened on the fragment `6-262`, which
matched 236–262 in the third quarter and not the first, where the same author has another paper.

**WHAT EACH CARD RESTS ON.**
· **`gru-543` Lipetsk.** Charter article 13 ¶3 for the seat. Belova for four history sentences: the
  provincial reform of 1708 under Peter I with the district first under Yelets; town standing in 1779
  within Tambov Governorate; the district the most densely settled in the governorate with Kozlov's by
  1851; the minister of internal affairs' report of 25 April 1805 on the spring having won the public's
  confidence, with the doctor and apothecary's journal, the chemical testing and the Medical Council's
  verdict. Anichkina's paper on the Lower Park for the park's 120 hectares, its protected standing, its
  exotics, its work as a filtration field for the high part of the city — and for the cast-iron cannon
  and the bath building of 1805 and the People's Will conferring there in 1879. Reclus's own table of
  the chief towns of Tambov Governorate gives 14,213, fourth among them, which is the historical
  population `facts-echo.js` explicitly allows beside a modern grid.
· **`gru-581` Magadan.** Charter article 38 ¶4. Kurovskaia and others on the Magadanka's 48.5 km²
  catchment and the 2014 flood reconstructed by model for want of a weather station inside the basin.
  Dolinskaia for the origin — the East Even culture base of 1929 on Nagayevo Bay and the grubbed
  clearing inland, the order of 3 July 1935 to survey "the town of Magadan-Nagayevo", the
  general-perspective plan of 10 April 1936, and the 80,000 m² of taiga opened as a park on 6 July 1935
  four years before the settlement was made a town. Galtseva, Favstritskaya and Sharypova for the
  planned-against-market contrast; Breslavsky for the okrug's urban network, 15 of 34 urban-type
  settlements abandoned or abolished by the early 2020s.
· **`gru-582` Anadyr.** Charter article 16. Tregubov and Uyagansky's ground-radar survey for the taliks
  — 2.34 km² at six metres or deeper, 67% of the built-up area. Chaika for the linear coastal
  settlement model and for Dezhnev and Popov's 1647 departure, the Anadyr river reached in 1648, the
  winter camp that became the ostrog and stood to 1771 near later Markovo. Pelyasov and others for the
  transfer model; Vashchuk and Kovalenko for the separation from Magadan Oblast settled in the
  Constitutional Court.
· **`gru-583` Naryan-Mar.** Charter article 3 ¶2. Popova and others for the two proposed Arkhangelsk
  roads, 887 km through empty country against 940 km through ten settlements, the longer judged better.
  Pelyasov for the Arctic "island" and the rental model. Klepikov for the town as one of the Soviet
  Arctic's planned socialist settlements and its general plan as a case of the programme's faults —
  standard buildings raised without allowance for permafrost. Korotaev, who works from the town's own
  museum association, for the Pustozersk earthwork: six tiers of frozen layers in a 64 m² trench in
  2015 and more than 500 objects, 152 of them leather and footwear.

**A DATE LINE MAY NOT SAY `1930s`.** `gru-583` shipped with *Soviet town plan / 1930s* and
`test-date-line.js` failed it: `cardYears` yields no sort year from a decade, and the card renders
perfectly meanwhile. Klepikov dates the programme no more closely than the decade, so the line is
**empty** and the prose carries the decade — which is what the rule about an empty date line is for.

**MAGADAN, ANADYR AND NARYAN-MAR ALL TAKE `?` IN THREE ROWS.** None is in Rosstat's table 4.9, which
is *Cities with Population of 100 000 and Over*; nor is any other town of their three subjects, so the
fifth sentence of each says exactly that rather than naming a sibling town as batch 28's rule allows.

**`Kurgan` IS ALREADY A GLOSSARY TERM AND IT IS THE BARROW.** Before `gru-560` is written, the city
needs a key of its own — the pairing rule cannot be satisfied by the existing entry, and
`add-glossary.js` would overwrite it in silence.

**FIVE CENTRES LEFT**: `gru-502` Krasnogorsk, `gru-503` Krasnodar, `gru-524` Gatchina, `gru-560`
Kurgan, `gru-578` Elista. Gatchina stays refused on the charter's stale seat (batch 34). Krasnodar's
own subject card `gru-003` has already spent Ekaterinodar's founding, the WMO temperature normals and
the UN population, so the centre card needs the city's 19th and 20th centuries and the WMO
wettest/driest leg.

## Batch 37 — Krasnodar and Elista, and two centres refused on the seat sentence (2026-09-24)

Two cards, and two of the three remaining centres established as sourcing refusals rather than left
looking like oversights.

**THE CHARTER SLUG IS READ OFF `/region/`'s OWN INDEX, AND `ustav_mosobl` IS WHY.** A grep of that
index for `mosk` returns `ustav_moskv`, which is the charter of the CITY of Moscow; Moscow Oblast's is
filed under `mosobl` and was missed at the first pass. Listing all 86 slugs and reading them found it —
the same rule batch 21 wrote for `ustav_krasnodar` being a guess that 404s, one step earlier in the
process.

**AND GARANT'S MOSCOW OBLAST CHARTER IS REPEALED.** Its chapter on administrative-territorial structure
carries *(документ утратил силу)* in the header and refers the reader to a separate 2001 law; all 127
of its articles were scanned and **none names an administrative centre at all**. That is the Stavropol
shape of batch 29 met a second time, and it is the reason `gru-502` Krasnogorsk is not written: the
Wayback Machine's *content* endpoint is refused by this sandbox's egress policy for both `mosreg.ru`
and `kurganobl.ru` — its availability API answers and reports snapshots for both, so the refusal is the
proxy's rather than the archive's — and Europe PMC has no phrase for it.

**`gru-560` KURGAN IS THE SAME REFUSAL FROM A DIFFERENT DIRECTION.** `ustav_kurgan` is one of the three
charters batch 30 established are not on Garant at all, `city of Kurgan` returns a single Europe PMC
hit about diatom imaging, and DOAJ's 22 Kurgan Oblast papers are weevils, bark beetles, bird migration
and radiation epidemiology. **Its material is otherwise ready**: the Ilizarov apparatus was devised
there in June 1952 and the outcomes in 43 patients treated between 1951 and 1953 were published in the
collected works of the Kurgan regional scientific medical society in 1954, all of it in Sutyagin and
Malkova's open review. **The blocker is one sentence, not the history** — which is the opposite of what
the plan's refusal table assumed for most of this half, and the same correction batch 32 made.
**And its own subject card `gru-060` has already spent Tsaryovo Gorodishche, the fortress, the Pugachov
revolt, the district town of 1782, the Decembrists and the railway of 1894**, so the centre card was
always going to rest on the 20th century.

**EUROPE PMC'S PHRASE SEARCH IS DOUBLE-QUOTED BY THE HELPER.** `epmc.js` wraps its argument in quotes,
so `'"administrative centre of the Kurgan"'` was sent as a doubled string and returned 48 hits of
ancient DNA and plant datasets — which reads exactly like a phrase that is merely common. Re-running
`city of Tomsk` bare returned 54, the figure batch 32 recorded, and the doubled form returned 1,330.
**Prove the quoting on a phrase whose true count is already written down before believing any zero or
any flood.**

**WHAT THE TWO CARDS REST ON.**
· **`gru-503` Krasnodar.** Charter article 13 for the seat, which leaves the standing of the centre to
  a law of the krai. Litvinskaya and six co-authors for the Krasnodarsky Forest Park — natural and
  planted woodland raised in the Kuban valley inside the city in the 1970s and 1980s, willow and poplar
  over about a fifth of it on alluvial soils, more than thirty invasive species among the planted
  Canadian poplar, black locust and black walnut. Baranov and Kasyanov for four history sentences on
  1921–1941: the overcrowding under the New Economic Policy and then industrialisation, the sound plans
  that went unbuilt for want of resources, the qualified schemes of Mironov, Junger and Kalitaev, and
  the replanning that was carried through putting industry first. Chen and others for the city as it is
  now. **Its date line is empty**: nothing in these sources dates the city itself, and the sibling
  `gru-003` holds Ekaterinodar's founding.
· **`gru-578` Elista.** The Steppe Code's article 19 for the seat, which settles the flag, the arms,
  the anthem and the capital in one article. Belousov for the construction of the town as the capital
  of the Kalmyk autonomy between 1927 and 1932, the Soviet state moving the agencies in and paying for
  most of the building, and the finding that the make-up of its people was settled by unorganised
  migration off the steppe rather than by those transfers. Lidzhieva for the Druzhba park. Muzafarova
  and Mushaev for the Buddhist street furniture — khuruls, stupas, gates and fountains — catalogued one
  by one.

**A BILINGUAL JOURNAL THAT DEPOSITS ITS RUSSIAN BYLINE NEEDS SEVEN DECLARED ROWS, NOT A REWRITTEN
CITATION.** *Ecosystem Transformation* prints `S.A. Litvinskaya, S.N. Gorbov, S.S. Tagiverdiev…` on the
article's own first page and again beside each ORCID, and deposits `С.А. Литвинская` and the rest to
Crossref. That is the New Research of Tuva and Arkheologiya Evraziyskikh Stepey shape already in
`CROSSREF_WRONG`, so it took a row per author with the article's own byline as the evidence — **read
the PDF's first page rather than DOAJ alone**, which is what the rule about reading the byline means.

**`Kurgan` IS STILL THE BARROW.** Before `gru-560` is written the city needs a key of its own;
`add-glossary.js` would overwrite the existing term in silence.

**THREE CENTRES LEFT**: `gru-502` Krasnogorsk and `gru-560` Kurgan, both waiting on a seat sentence
alone, and `gru-524` Gatchina, refused since batch 34 on its charter's stale seat. All three are
one openable document away from being written.

## Batch 38 — Gatchina and Kurgan, and a correction to batch 37 (2026-09-24)

Two of the three centres batch 37 recorded as refused are written, because the reason recorded for
them was wrong.

**THE WAYBACK MACHINE'S CONTENT ENDPOINT WORKS FROM HERE. ONLY ITS CDX INDEX IS BLOCKED.** Batch 37
read a `403 Blocked by egress policy` on `web.archive.org/web/…/mosreg.ru` and
`…/kurganobl.ru` and concluded the proxy refuses archived pages of those hosts. It does not:
`web.archive.org/web/20240419093918/…/Ejegodnik_2023.pdf` returned 29.5 MB of Rosstat on the first
try, and `kurganobl.ru` itself came back 200 on the second attempt of the same session. What the
earlier 403s and the `ws_closed_mid_exchange` failures around them are is the proxy dropping tunnels
under load — three or four failures in a row, then a clean 200. **`web.archive.org/cdx/search/cdx` IS
genuinely refused**, flatly and repeatably, over both schemes, which is what batch 28 recorded and
what stops any enumeration of a host's captures. **Retry four or five times with a pause before
recording an archive host as shut**; this is `check-reach.js`'s BUSY-is-not-SHUT rule one layer down,
and it cost two cards a batch.

**SO THE LADDER'S SECOND RUNG IS REAL, AND IT IS THE SUBJECT'S OWN «О РЕГИОНЕ» PAGE.**
· **`gru-524` Gatchina.** The Leningrad Oblast charter on Garant names no administrative centre in any
  of its 59 chapters and articles — which also corrects batch 34, that recorded it as stating the old
  seat of Saint Petersburg; it states neither. The government's own portal does:
  `lenobl.ru/ru/o-regione/` reads *Столицей Ленинградской области является город Гатчина*.
· **`gru-560` Kurgan.** `ustav_kurgan` is one of the three charters batch 30 established are not on
  Garant, and batch 37 stopped there. The charter is published as a PDF on the oblast government's own
  site, and its **article 13** reads *Административным центром области является город Курган*, in the
  same article that bounds the oblast against Chelyabinsk, Sverdlovsk, Tyumen and Kazakhstan; article
  10 fixes those bounds as the ones a decree of the Presidium of the USSR Supreme Soviet set on
  6 February 1943. **A charter absent from Garant is not a charter that cannot be read.**

**WHAT THE TWO CARDS REST ON.**
· **Gatchina.** Kokotkina's study of the palace towns for four history sentences: the myza given to
  Tsarevna Natalya Alekseyevna, the decree of Paul I that made it a town in 1796 and the second stage
  of building under Nicholas I, the standing of the three palace towns outside ordinary municipal
  government under the Ministry of the Imperial Court, and the water main of 1850 that served the
  palace, the menagerie and the parks before a town network reached 268 homesteads by 1912. Polyakova
  on the palace park's botanical gardens; Veselov and Dorofeeva on the park's restoration between 1944
  and 1951. **No town of Leningrad Oblast is in Rosstat's table 4.9 at all**, so the card takes `?` in
  three rows and says so.
· **Kurgan.** The charter for the seat and the 1943 boundaries. Gordeeva and Ermakova on the city's
  ecological framework. Sutyagin and Malkova for the Ilizarov apparatus — the first version built in
  1952, the results in 43 patients treated 1951–1953 published in the town in 1954, and the institute
  that grew from it. **Its own subject card `gru-060` had already spent Tsaryovo Gorodishche, the
  fortress, Pugachov, the district town of 1782, the Decembrists and the railway of 1894**, so the
  centre card is a 20th-century card by necessity.

**`Kurgan` IS THE BARROW, SO THE CITY IS `Kurgan,_Kurgan_Oblast`.** Comma keys are already in use
(`Gona,_Ethiopia`), the term takes the alias *Kurgan, Russia* and deliberately **no bare alias**, since
that surface belongs to the burial mound and two keys competing for one surface is what
`check-gloss-links.js` reports. The pairing rule is satisfied by the entry existing.

**A WATERMARK COST GATCHINA ITS BEST PICTURE.** The one Commons view that shows the town, the palace
and the lakes of the park together is an aerial carrying the photographer's own watermark across the
bottom corner, which fails the picture bar exactly as batch 35's Ust-Sysolsk postcard did. The term
ships with the palace's south front instead — a building rather than a wide view of the city, against
the geography rule's own preference, and the honest choice when no unwatermarked wide view exists.

**AND A DOI READ OFF AN XML ID IS A COMPOSED DOI.** The World Journal of Orthopedics article's PMC XML
carries `501932` beside the volume and issue, and the real article number is `110465`; the DOI was
looked up rather than assembled, which is the only reason the citation is right.

**A BILINGUAL JOURNAL MAY SUPPLY AN ENGLISH TITLE AND NO ENGLISH BYLINE.** Forestry Bulletin registers
*BOTANICAL GARDENS IN GATCHINA PALACE PARK* with the author as **А. Ю. Полякова**, and nothing
reachable prints a Latin form of her name, so the citation carries the journal's own English title
beside the Cyrillic byline rather than a transliteration nobody has published. That is the opposite of
batch 37's *Ecosystem Transformation* row, where the article's own first page did print the Latin
byline — **the difference is evidence, not style.**

**ONE CENTRE LEFT**: `gru-502` Krasnogorsk. Moscow Oblast's charter on Garant is the repealed 1996 one
and names no centre; `mosreg.ru`'s own about-the-region pages returned 403 from the archive across
several attempts, and the Duma's site is a stub in the capture available. It is the same shape as the
two solved here and should be retried when the proxy is quieter.
