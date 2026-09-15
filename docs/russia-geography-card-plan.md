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

**Until a recipe exists, a capital card cannot be written to the bar, and none should be written below
it.** The subjects deck is unaffected and can be worked straight down the order.

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
