# Glossary length plan — every description at 100 words (±10%)

**Opened Aug 2026, on request:** *"Although all glosses are currently three sentences, they vary widely in
length. I want each to be 100 words with a 10% margin. Plan batches to convert the current glosses to that
length."*

Not part of the site. This is the plan; the rule it establishes belongs in CLAUDE.md once the first batch
ships.

---

## The bar

**90–110 words**, counted on the rendered prose of the ENGLISH description: tags stripped, footnote markers
stripped, entities resolved, and — as on a card — **an imperial conversion not counted**. That last is the
house rule already written down in CLAUDE.md, and it matters here more than anywhere: a country term states
an area, and often a height and a length too, at three words of conversion each, so counting them would hold
the glossary to a tighter PROSE budget than the cards for no reason but its subject matter.
`.claude/gloss-length.js` is the measure, and it is the only measure — do not count by eye, and do not count
the HTML.

Three things the bar does **not** change, and they are what keeps this a length pass rather than a rewrite:

- **Still exactly three sentences.** The three-sentence rule is what makes a gloss popup a glance instead of
  a page, and 100 words across three sentences is ~33 words each — the same average a card's abstract runs
  at, which is a rhythm the corpus already reads well in.
- **Still impartial, deck-agnostic and self-contained.** Every rule in CLAUDE.md's "Add a glossary term"
  section stands. A term padded to length with a comparison to a sibling term has been made worse, not
  longer.
- **Still cited, and still at `GLOSS_SRC_TARGET`.** All 477 terms are at the bar today. A sentence that
  grows past what its marked source states needs a new source or a smaller claim — **the length is not a
  licence to assert more than the citations carry.** This is the single most likely way for the pass to do
  damage, and it is the thing to check on every term.

## Where it stands (measured 2026-08-04, `node .claude/gloss-length.js`)

| | |
|---|---|
| terms | **477** |
| already 90–110 | **64** |
| under 90 | **10** |
| over 110 | **403** |
| mean | 129.5 words |
| range | 43 (`Archaeology`) – 195 (`Spear-thrower`) |

```
  40– 59    1
  60– 79    4
  80– 99   33
 100–119   92
 120–139  216     <- the bulk
 140–159   88
 160–179   39
 180–199    4
```

So **413 terms need work and 64 are already there**, and the work is overwhelmingly *trimming*: 403 over
against 10 under. That asymmetry decides the shape of the pass — cutting a sentence back to what its source
states is quick and safe, where growing one is where fabrication gets in.

## The two kinds of edit, and why they are not the same job

**TRIM (403 terms).** A description at 135 words has about 30 words that are doing no work: a second example
where one served, a subordinate clause restating the main one, a date already on the term's own date line.
Cut those first, before touching a claim. If the term is still over after the padding is gone, drop the
*weakest* claim entire rather than shaving every sentence — three full sentences beat three clipped ones.

**GROW (10 terms).** These are the definitional ones (`Archaeology` 43, `Paleolithic` 68,
`Australopithecus` 68, `Iron_Age` 75, `Bronze_Age` 78) and they are short because their subjects are
*definitions*, which is exactly the class G8 found the literature does not pay for. **Do not pad them from
memory.** What a definitional term can honestly gain is the material the pass already has sources for: a
date range, a type site, the scheme it belongs to, the discipline's own statement of scope. If a term
cannot reach 90 words on what its sources bear out, **leave it short, record it here, and say so** — an
under-length term is a known gap; an invented sentence is a lie in a study tool.

## Batches

Cut by KIND, not by alphabet: terms of one kind share a shape, so the same trim works down a batch and the
sibling-consistency check that has caught so much in the citation passes (a date on one term contradicting
its neighbour) actually has neighbours to compare against. The first tag in `GLOSSARY_TAGS` is the kind.

| batch | scope | terms | over/under | notes |
|---|---|---|---|---|
| **L0** | tooling | — | — | **SHIPPED 2026-08-04.** `.claude/gloss-length.js` — the measure, plus `--over` / `--under` / `--tag=<kind>` / `--list`, and the per-kind table the batches below are cut from. |
| **L1** | `place`, A–E (countries) | 56 | 54 over | **SHIPPED 2026-08-04.** All 56 now 102–110 words, mean 107.3. See the log below. |
| **L2** | `place`, F–L (countries) | 44 | 44 over | **SHIPPED 2026-08-04.** All 44 now 103–110 words, mean 108.0. See the log below. |
| **L3** | `place`, M–R (countries) | 43 | 43 over | **SHIPPED 2026-08-04.** All 43 now 100–110 words, mean 107.5. See the log below. |
| **L4** | `place`, S–Z (countries) | 54 | 54 over | **SHIPPED 2026-08-04.** All 54 now 102–110 words, mean 107.2. **Completes every country term in the glossary — 197 of them.** See the log below. |
| **L5** | `place`, sites, regions and continents | 55 | 55 over | **SHIPPED 2026-08-04.** All 55 now 103–110 words, mean 107.9. **Completes every `place` term — 266 of them, 0 outside the bar.** See the log below. |
| **L6** | `person` | 54 | 26 over, 2 under | **SHIPPED 2026-08-04.** All 28 now 97–110 words, mean 103. **Completes every `person` term — 54, 0 outside the bar.** The pass's first two GROW cases. See the log below. |
| **L7** | `era` + `industry` | 44 | 31 over, 5 under | **SHIPPED 2026-08-04.** All 36 now 96–110 words, `era` mean 106 and `industry` 106. **Completes both kinds — 44 terms, 0 outside the bar.** Five grows, the most of any batch. See the log below. |
| **L8** | `hominin` + `fossil` + `animal` | 40 | 33 over, 2 under | **SHIPPED 2026-08-04.** All 35 now 105–110 words; `hominin` mean 108, `fossil` 107, `animal` 104. **Completes all three kinds — 40 terms, 0 outside the bar.** Fixed a `split-abstract.js` gap on abbreviated binomials. See the log below. |
| **L9** | `object` + `culture` + `people` + `building` + `event` + `practice` | 45 | 40 | The tail, and the longest terms in the glossary (`Spear-thrower` at 195, `Dolní Věstonice` at 184). |
| **L10** | `concept` + the 10 short definitional terms | ~34 | 21 over, 10 under | **Last on purpose.** These are the GROW cases and the hardest; by L10 the register holds everything the other nine batches read, which is where the honest extra sentences will come from. |
| **L-audit** | the whole glossary | 477 | — | Re-measure. Report what is still outside 90–110 and why, term by term. |

Roughly 35–70 terms a batch; L1–L4 are the big formulaic ones and can go faster than the tail.

## The per-term workflow

1. `node .claude/gloss-length.js --over` (or `--under`) for the batch's list and current counts.
2. Read the term **with its sources open**. The trim is against what the cited works state, not against what
   the sentence sounds like it could lose.
3. Rewrite in place, keeping three sentences and every footnote marker on the claim it belongs to. **A marker
   whose sentence was cut has to move or go** — a marker pointing at a claim that is no longer there is the
   `wh-098` failure, and the audit cannot see it.
4. Re-measure. 90–110 or it does not ship.
5. `node .claude/add-sources.js` for the prose (it writes the English description), then
   `node .claude/gloss-source-audit.js` to confirm the citation standing did not move.
6. **English only, while `MULTILANG` is false.** The nine translations keep their current text; when
   translations resume they will need this pass run over them in their own idiom, which is a second pass of
   the same size and should be planned separately rather than smuggled into this one.

## Things to check before each batch closes

- **Sentence count is still three, in every term touched.** `node .claude/split-abstract.js` is the check;
  a trim that merges two sentences is the commonest way to end up at two.
- **No marker orphaned and no source unreferenced** (`add-sources.js` refuses both).
- **The date line was not absorbed into the prose.** A term with a `GLOSSARY_DATES` entry should not spend
  words restating it — that is free length to reclaim, and it is the first place to look on a term at 130.
- **Siblings still agree.** Trimming is where a hedge gets dropped: "scholars disagree about" costs four
  words and is the first thing a careless trim removes, which turns a contested claim into a flat one.

## The batch log

### L1 — 56 country terms, A–E (2026-08-04)

**56 terms, 54 of them over the bar; all 56 now sit at 102–110 words, mean 107.3.** The glossary as a whole
moved from 64 to 117 terms inside the bar and its mean from 129.5 to 127.2 words. Two terms — `Belarus`
(103) and `Denmark` (102) — were already inside it and were passed through untouched, which is the right
outcome and worth saying: this pass edits what is out of band, not everything it looks at.

**The measure was wrong before any prose was touched, and fixing it first is the reusable lesson.**
`gloss-length.js` counted imperial conversions; `add-card.js` has exempted them since the units pass, and a
country term carries two or three of them at three words each. Counting them held the glossary to a tighter
PROSE budget than the cards for no reason but its subject matter. Corrected, the baseline moved from 62 to 64
terms in band — small, but it is the difference between trimming prose and trimming parentheses.

**What a country term is made of, and where the 30 words come from.** Every one has the same three
sentences: FIGURES (area, region, population, borders, capital, marked to UNdata), GEOGRAPHY (landscape,
usually unmarked), HISTORY (colonial rule, independence, the modern state, marked to the recognition guide).
The padding is in two predictable places, and taking both is almost exactly the 30 words a 135-word term
needs to lose:
- **the border list, worth 9–13 words**, and the first thing to go. "Bordered by Mali, Niger, Benin, Togo,
  Ghana and Côte d'Ivoire" tells a reader less than "in West Africa" already did, and it is the most
  formulaic clause in the corpus. Keep it only where the borders ARE the fact (Bhutan wedged between China
  and India; Bangladesh almost surrounded by India).
- **the second and third clauses of the geography sentence.** These run on semicolons and are where a term
  lists a third landscape, a second river or a climate note after the point is made.
Tightening the remaining prose finds the last ten. **Cutting a whole clause beats shaving every sentence** —
three full sentences read better than three clipped ones, which is what the plan said and what the batch bore out.

**No figure was added or altered, and that is checked mechanically rather than trusted.** Diffing every
number in all 56 terms before and after: **zero added**, 23 dropped, each with the clause it sat in. Most are
asides (a causeway length, a strait width, the distance to the Galápagos), but three are substantive and are
recorded here rather than glossed over — `Afghanistan` lost "resisted British campaigns in the 19th and early
20th centuries", `Eritrea` lost the 1998–2000 border war with Ethiopia, and `Bulgaria`'s Cyrillic clause lost
its 9th- and 10th-century dating. **A trim to length removes real facts; the honest thing is to name which.**

**Two incidental finds.** `Bhutan` carried a typo — "a index it calls gross national happiness" — fixed in
passing. And `Costa_Rica`'s markers were both parked at the end of its third sentence, where the register
records that the 1821 clause is carried by the guide's **El Salvador** page and the 1848 by Costa Rica's own;
they now sit on their own claims. **A length pass reads every term slowly, which is when marker sloppiness
shows** — expect one or two of these a batch.

**Verified before shipping:** all 56 split into exactly three sentences and round-trip through
`split-abstract.js`; `gloss-source-audit.js` still reports 477/477 at the 2-source bar; `check-style.js` is
clean on glossary.js; `test-sources.js` passes 74/74; and a table-by-table diff confirms only descriptions
changed — sources, dates, tags, aliases, places and the Atlas map-country table are byte-identical.

### L2 — 44 country terms, F–L (2026-08-04)

**All 44 were over the bar; all 44 now sit at 103–110 words, mean 108.0.** The glossary moved from 117 to
**161 terms inside the bar** and its mean from 127.2 to 125.1 words; within the `place` kind it is now 114 of
266. **L1's recipe held without modification** — drop the border list, take the geography sentence's tail,
tighten — and the batch went about twice as fast as L1 for that reason. One exception to the border rule
worth adding to L1's two: **`Luxembourg` keeps "wedged between Belgium, Germany and France"**, because a
microstate's neighbours are the fact about it, which is the same test that kept Bhutan's and Bangladesh's.

**L2's finding is a failure mode L1 did not produce: a trim can STRAND A MARKER, and reading the term will
not show it.** `Ireland`'s second source is the EU country page, and the only thing that page carried in its
third sentence was "joined what is now the European Union in 1973" — which the trim cut, leaving marker [2]
sitting on a sentence about Christianisation, English rule, the famine and 1922, none of which the EU states.
Nothing catches this: `add-sources.js` checks that every source is referenced and no marker runs past the end
of the list, and both were still true. **The check is a diff of every MARKED sentence's years, before against
after** — six of the 44 lost a dated claim from a marked sentence, and reading each of the six against its
own source showed five were fine (the guide still carries Iraq's 1932 and 1958 after its wars went; NATO
still carries Finland's 2023) and one was not. The fix was to **restore the accession clause rather than move
the marker**, since that clause is the datable act the recipe's second source exists to carry. Run the diff on
every batch from here.

**Second finding: a trim eats HEDGES silently, exactly as this plan warned it would.** Six terms lost a hedge
word. Two went out with the clause they sat in and are honest losses; **four were on claims that survived the
trim and were restored** — `India`'s "roughly 1.4 billion", `Guinea`'s "sometimes called the water tower",
`Grenada`'s "often called the Isle of Spice", `Ireland`'s "about five-sixths". The Grenada one is the
instructive one: trimming "which is why it is often called the Isle of Spice" to "hence its name, the Isle of
Spice" saved four words and turned a nickname into the country's name. **Grep the hedge vocabulary before and
after** — it costs one word to put back and it is the difference between a rounded figure and a false exact one.

**No figure was added and 17 were dropped**, each with its clause, checked mechanically as in L1. Six are
substantive and are named rather than glossed over: `Iraq` lost the wars of 1980, 1991 and 2003; `Finland`
lost the wars of 1939 to 1944; `Kiribati` lost the fighting at Tarawa in 1943; `Liberia` lost the 2014 Ebola
epidemic; `Kazakhstan` lost Baikonur's crewed launches since 1961; and `Guyana` lost Venezuela's standing
claim to the Essequibo region, which is before the International Court of Justice. The rest are asides — a
dune barrier's length, a basin's altitude range, a river's name.

**Verified before shipping:** all 44 split into exactly three sentences and round-trip through
`split-abstract.js`; `gloss-source-audit.js` still reports 477/477 at the 2-source bar; `check-style.js` is
clean on glossary.js; `test-sources.js` passes 74/74; and a table-by-table diff confirms only the 44
descriptions changed — sources, dates, tags, aliases, case-sensitivity, places and the Atlas map-country
table are byte-identical.

### L3 — 43 country terms, M–R (2026-08-04)

**All 43 were over the bar; all 43 now sit at 100–110 words, mean 107.5.** The glossary moved from 161 to
**204 terms inside the bar** and its mean from 125.1 to 122.8 words; within the `place` kind it is now 157 of
266, the first batch to leave that kind majority-done. The scope is the 43 COUNTRIES between M and R — the
twelve non-country places in that stretch (`Madjedbebe`, `Meadowcroft_Rockshelter`, `Mesopotamia`,
`Monte_Verde`, `Near_East`, `North_America`, `Oceania`, `Olduvai_Gorge`, `Pacific_Northwest_Coast`,
`Pacific_Ocean`, `Pinnacle_Point`, `Qafzeh_Cave`) belong to L5, as they did in L1 and L2.

**L3's finding is the ISLAND term's equivalent of the border list, and it is worth naming because L4 is full
of islands.** L1 established that the first thing to cut on a country term is the list of neighbours; an
island has no neighbours to list, and what it carries instead is a **distance-to-the-mainland locator** —
"about 400 km (250 miles) off the southeast coast of Africa", "about 640 km (400 miles) apart", "about 900 km
(560 miles) east of the Philippines". It is the same clause in a different coat: formulaic, worth 8–11 words
with its conversion, and telling a reader nothing that "in the Indian Ocean off the southeast coast of Africa"
has not already said. Six of L3's terms carried one and all six lost it. Measured across the whole glossary
the pattern is real and it is front-loaded into the batch after this one: **`São_Tomé_and_Príncipe`,
`Seychelles`, `Solomon_Islands` and `Tuvalu` are waiting in L4**, with `Sungir` and `Dmanisi` in L5. (Three
terms keep theirs because they are already inside the bar — `Cape_Verde`, `Chile`,
`Federated_States_of_Micronesia` — which is the right outcome: this pass edits what is out of band.)

**Second finding: the border-list exception is not an exception.** L1 named Bhutan and Bangladesh, L2 added
Luxembourg, and all three read as odd cases. In L3 **nine of 43 kept their neighbours** — `Moldova` (between
Romania and Ukraine), `Mongolia` (wedged between Russia and China), `Nepal` (between China and India on the
southern flank of the Himalaya), `Netherlands` (between Belgium and Germany), `North_Korea` (China, Russia,
and South Korea across a fortified line), `Panama` (Costa Rica and Colombia), `Portugal` and `Qatar` (one land
neighbour each), `Monaco` (surrounded by France). That is a fifth of the batch, and the reason is arithmetic
rather than luck: **a list of two is not a list.** Better stated as a test to run on every term than as an
exception to remember — *does naming the neighbours say more than the region already did?* — which is true
whenever there are one or two of them, or where one of them is the fact (North Korea's fortified line).

**Third: the recipe's 30 words are not always there to find, and this batch names more substantive losses than
L1 or L2 for that reason.** Seven terms are not three-part country terms in the standard shape — `Monaco` has
no border list and no landscape sentence, `Russia` opens on a superlative rather than a figures list,
`Marshall_Islands` and `Nauru` are single-island states whose "geography" sentence IS their existential
problem, and `Malta`, `Norway` and `Oman` carry their character in the geography rather than the figures. On
those the formulaic cut yields little and the words have to come out of real claims.

**No figure was added and 15 were dropped**, checked mechanically as in L1 and L2. Ten went with a locating
clause or an aside (six of them the island distances above, plus Mozambique's 2,500 km coast). **Four are
substantive and are named rather than glossed over**: `Nepal` lost the Tarai's 60 m elevation, which framed
the rise to Everest; `New_Zealand` lost the Southern Alps' 3,700 m; `Portugal` lost "with borders little
changed since the 13th century"; and `Russia` lost "some 11 percent of all the land on Earth". The
substantive PROSE losses, likewise named: `Marshall_Islands`' stick-and-shell navigation charts and its
ocean-sized territorial waters, `Mauritius`' modern economy, `Monaco`'s reclaimed land, `Morocco`'s "never
part of the Ottoman Empire", `Netherlands`' Rhine–Meuse–Scheldt delta, `New_Zealand`'s plate boundary and
earthquakes, `Norway`'s shoreline measured in tens of thousands of kilometres, `Oman`'s Dhofar monsoon,
`Pakistan`'s Thar desert and Balochistan plateau, `Peru`'s Lake Titicaca, `Philippines`' coral reefs,
`Poland`'s borders moved west after 1945, and `Rwanda`'s coffee, tea and gorilla tourism.

**The two checks L2 made standing both ran, and one of them caught something.** The marked-sentence year diff
came back clean — no marker was stranded, which is what the nine kept accession and independence dates were
watched for. **The hedge grep caught one, and it is L2's Grenada in a new coat**: `Myanmar`'s "teak forests,
jade and gemstones have long been **among** its exports" had been trimmed to "are long-standing exports",
which reads the same and says something stronger — the claim survived the trim and the hedge did not. Two
words put it back. One in 43 is the same rate L2 found, and it is not a rate that will fall.

### L4 — 54 country terms, S–Z (2026-08-04)

**All 54 were over the bar; all 54 now sit at 102–110 words, mean 107.2.** The glossary moved from 204 to
**258 terms inside the bar** and its mean from 122.8 to 119.7 words; `place` is now **211 of 266**. Scope is
the 54 COUNTRIES from S to Z, the sixteen non-country places in that stretch (`Sahara`, `Sicily`, `Siberia`,
`Scandinavia`, `South_America`, `Western_Europe`, `Swabia`, `Swabian_Jura`, `Sulawesi` and the seven caves
and type sites) belonging to L5.

**L4 finishes the countries. Every one of the 197 country terms in the glossary is now inside the bar** — the
55 `place` terms still over it are, without exception, L5's caves, gorges, type sites, regions, continents
and oceans. That is the formulaic half of the pass done and the judgement half beginning.

**L3's prediction was exact, and its one gap is the finding.** L3 measured the island distance-locator across
the whole glossary and named four terms waiting in L4 — `São_Tomé_and_Príncipe`, `Seychelles`,
`Solomon_Islands`, `Tuvalu`. All four carried it and all four lost it. **But the clause has a PROSE form the
regex cannot see**, and two more terms carried that: `Tonga`'s "spread over a long north-south stretch of
ocean" and `Vanuatu`'s "lying east of Australia and north of New Caledonia" — the same locating work, doing
the same nothing, with no figure for a numeric grep to find. So the measure found four of six. **When
measuring a clause for the next batch, grep the SHAPE and then read the batch's own first sentences** — the
numeric form is the one that indexes, not the one that exhausts.

**Second finding: the hedge grep caught THREE, up from one in L3, and all three are one shape** — a
quantifier attached to a superlative or a fraction, which reads as pure filler to someone cutting words.
`Solomon_Islands`' "**some of the** fiercest fighting of the Pacific war" had become "fierce fighting",
`Syria`'s "**some of the** earliest farming settlements" had become "early farming settlements", and
`Somalia`'s "the way of life for **much of** the population" had become "for most people". The first two are
weakenings — they cost information without asserting anything false — but **the third is L2's Grenada
failure exactly**: *much of* a population is a large fraction, *most* is over half, and the trim quietly
turned one into the other. All three were restored. The rule to carry: **a quantifier in front of a
superlative is not filler, it is the whole claim** ("some of the fiercest" says *among the worst*, "fiercest"
says *the worst*), and a fraction word is never safe to swap for a shorter one.

**Third: S–Z is the heaviest stretch of the country terms** — mean 135.3 before the pass against L3's 133.2,
and it holds the longest country term in the glossary (`Spain`, 172, which had to lose 67 words) along with
`The_Gambia` at 151, `Tuvalu` at 150 and `Yemen` at 149. Every chunk took three passes rather than L3's two,
and the reason is worth stating: on a 150-word term the formulaic cuts (border list, distance locator,
geography tail) come to about 30 words and the other 15 have to come out of claims. Budget for it.

**An error the units pass left behind, found by reading slowly.** `Vatican_City` gave its area as
"about 0.44 km² **(0 sq mi)**" — a conversion rounded to nothing, which tells a reader strictly less than no
conversion would, and which the units sweep could not see because it was looking for figures that were
MISSING rather than figures that were useless. Corrected to **0.17 sq mi**, and the whole glossary swept: it
is the only one. **A metric figure below one imperial unit needs two significant figures in its bracket.**

**No figure was added except that correction, and 24 were dropped**, checked mechanically as in L1–L3. Most
went with a locating clause or an aside (the six island distances above, `Somalia`'s 3,300 km coast,
`Vietnam`'s 3,000 km coast, `Tunisia`'s 1,300 km coast, `Togo`'s 56 km one). **Six are substantive and are
named rather than glossed over**: `Singapore` lost its 164 m high point, `Slovenia` its 47 km of Adriatic
coast, `Uganda` the Rwenzori's 5,110 m, `Vietnam` the 50 km narrows of its waist, `Sri_Lanka` the 19th-century
dating of its tea, and `State_of_Palestine` the self-government that followed the accords of the 1990s. The
substantive PROSE losses: `Seychelles`' highest income per head in Africa, `Suriname`'s standing among the
world's most forested countries, `Serbia`'s Morava corridor, `South_Africa`'s climate range, `Spain`'s Roman
and Visigothic rule and its two African cities, `Taiwan`'s typhoons and plate boundary, `Trinidad_and_Tobago`'s
continental biota and its calypso and steelpan, `Turkmenistan`'s Karakum canal, `Tuvalu`'s climate diplomacy,
`Ukraine`'s Carpathians and Crimea, `United_Arab_Emirates`' humidity, `United_Kingdom`'s Welsh uplands and
Pennines, `Uzbekistan`'s Fergana valley, `Yemen`'s Socotra and Rub' al Khali, and `Zambia`'s Kariba dam.

### L5 — 55 non-country `place` terms: sites, regions, continents and oceans (2026-08-04)

**All 55 were over the bar; all 55 now sit at 103–110 words, mean 107.9.** The glossary moved from 258 to
**313 terms inside the bar** and its mean from 119.7 to 115.9 words. **`place` is now 266 of 266, 0 outside
the bar** — the whole kind is finished, and with it the largest tag in the glossary. Scope was the 23 caves
and type sites, the 11 gorges, lakes, rivers, hills and cities, the 10 continents and oceans, and the 12
regions.

**L5's finding is the one that explains why these terms had spare words at all: THE DATE LINE WAS IN THE
PROSE TWICE.** 29 of the 55 carry a `GLOSSARY_DATES` entry, which the popup prints directly above the
description — `Dmanisi` "c. 1.85 – 1.77 Mya", `Jebel_Irhoud` "c. 315,000 BP", `Lascaux` "occupation
c. 21,500 – 21,000 BP", `Skhul_Cave` "main occupation c. 130,000 – 100,000 BP", `Zhoukoudian`
"c. 750,000 – 33,500 BP" — and the description then stated the same span again in words. **Where the date
line carries the figure, cutting it from the prose loses the reader nothing**, and this was worth ten to
fifteen words on a type-site term. The check that found it was running the figure diff and the date table
side by side: eight headline dates had been trimmed out and were queued for restoration before the table
showed every one of them already on screen. **Read `GLOSSARY_DATES` before deciding a dropped date is a
loss** — it is the first thing to do on any batch of dated terms, and L7 (`era` + `industry`) and L8 (the
taxa) are the next two where it will pay.

**Second: the site term's equivalent of the border list is EXCAVATION ADMINISTRATION.** L1 named the border
list, L3 the island distance locator; here it is who dug, when they started, how many seasons and how deep,
and it is worth 15–25 words a term. `Skhul_Cave` gave 43 words to McCown's two seasons and Garrod's seven;
`Klasies_River_Caves` opened on "dug by successive teams since 1967"; `Madjedbebe` on "dug four times since
1973"; `Pinnacle_Point` on "dug since 2000". **This is also the one padding class the house rules already
told us to cut** — `docs/history-focus-plan.md` says Folio is a history site and not an archaeology site,
and at most two of ten sentences may be discovery history. On a three-sentence term the budget is
proportionally tighter still. Cutting it is not a trim against the rules but the rules being applied. The
micro-locator is the third class and behaves exactly like the island distance ("about 85 km south-west of
Tbilisi", "about 100 kilometres west of Marrakesh", "about 50 kilometres from the centre" of Beijing,
"about 197 km east of Moscow"): eleven terms carried one, all eleven lost it.

**The marked-sentence diff fired four times and every one proved benign** — the first batch where that is
true, and worth saying, because L2's `Ireland` failure has made it the check that stops a batch. All four
were an excavation date leaving a sentence that still carried location and subject, and in each the marker's
work still stood: `Klasies_River_Caves` [1,2] lost 1967, `Madjedbebe` [1] lost 1973, `Pinnacle_Point` [1]
lost 2000 while keeping the 1997 discovery its citation is actually for, and `Antarctica` [5] lost "in force
since 1961" while keeping the 1959 signing. **The rule is not that a marked sentence must keep every year;
it is that the marker must still point at something the source carries** — check the citation, not the
count. Three OTHER stranded markers were caught mid-draft and restored (`Liang_Bua`'s 2025 study,
`Lake_Turkana`'s 1997 World Heritage listing, `Greenland`'s 1985 EEC exit), so the check earned its place
three times over before these four false alarms.

**A limitation of the checker, found by losing a claim it could not see.** `check.js`'s marked-sentence year
diff matches `\b1\d{3}\b|\b20\d{2}\b`, so it reads calendar years and is **blind to BP, kya and Mya dates** —
which on a batch of prehistoric sites is most of the dates there are. `Fertile_Crescent` lost "between about
12,000 and 11,000 years ago" out of a marked sentence and the checker said nothing; it was caught by eye.
**On a deep-time batch, diff the deep dates by hand**, or extend the pattern before starting.

**Fourth: the hedge grep caught eight, up from three in L4, and they split into two kinds.** Six were the
hedge leaving with the clause it hedged (an "about" on a dropped locator) and are not losses at all. **Two
were L2's Grenada failure**: `Madjedbebe`'s occupation "**5,000 to 15,000 years** earlier than the oldest
dates from any other Australian site" had become "thousands of years earlier", which understates a
quantified claim as badly as L4's *much of* → *most* overstated one; and `Africa`'s "regained independence
across **almost all** of its territory" had become "independent again", asserting a completeness the source
hedges. Both restored, along with four smaller weakenings — `Monte_Verde`'s 2026 paper arguing the deposit
"thousands of years younger" (which had become simply "younger"), `Americas`' "spread **widely** through both
continents", `Arctic`'s Arctic Ocean "**largely** ringed" by three continents (it opens to the Atlantic), and
`Near_East`/`Fennoscandia`'s "**generally** calls" and "now **generally** called".

**No figure was added and 102 distinct figures were dropped**, checked mechanically as in L1–L4 — much the
largest count of the pass, and almost all of it the three padding classes above plus their imperial
conversions. **Nine are substantive and are named rather than glossed over**: `Dolní_Věstonice` lost the
500–800 °C firing temperature of its ceramics and the ages of the three in the triple burial,
`Denisova_Cave` the 250,000–170,000-year span of its Denisovan layers, `Antarctica` the 0.2% of rock left
exposed and the under-50 mm of annual precipitation behind its desert status, `Arctic` the 10 °C July
isotherm as an alternative definition, `Asia` the 60% of humanity, `Border_Cave` the 74,000-year date of its
infant burial, `Sungir` the ages of the two children and the lengths of the ivory spears, and
`Klasies_River_Caves` the 21 m depth of its deposit and the "almost 70,000 years" its record covers. The
substantive PROSE losses: `Cosquer_Cave`'s 150 m entry tunnel, `Skhul_Cave`'s Garrod seasons and the
alternative name Nahal Me'arot, `Arctic`'s "most of the world's permafrost lies here", `South_America`'s
Atacama weather stations that have never recorded rain, `Wonderwerk_Cave`'s Kuruman Hills, `Zhoukoudian`'s
1930s excavation of the Upper Cave, and `Monte_Verde`'s excavators answering the 2026 paper within weeks.

### L6 — 54 `person` terms: the 45 US presidents and nine others (2026-08-04)

**28 were outside the bar — 26 over and 2 under — and all 28 now sit at 97–110 words, mean 103.** The
glossary moved from 313 to **341 terms inside the bar** and its mean from 115.9 to 115.0 words. **`person`
is now 54 of 54, 0 outside the bar.** The other 26 were already at the bar and were left alone, as in
every batch since L1.

**L5's date-line finding transferred exactly, and it is the whole recipe here.** Every president carries a
`GLOSSARY_DATES` line of the form `1872–1933; president 1923–1929`, and every presidential description
opened by restating the term dates in words — "in office from 1923 to 1929", "from 1909 to 1913", "from
2021 to 2025". Cutting that clause is worth 4 to 9 words and costs the reader nothing, since the popup, the
home tile and the admin list all print the date line directly above the description. **But it must NOT
become a template change, and that is the finding.** Applying it to all 45 presidents would push nine of
the in-band ones below 90 — `George_Washington` (95), `James_Monroe` and `Martin_Van_Buren` (94),
`John_Adams` (93), `James_Madison`, `Franklin_Pierce` and `Zachary_Taylor` (91), `James_A._Garfield` and
`John_Tyler` (90) — so it is a clause available to a term that NEEDS words, exactly like L1's border list,
not an edict applied across the kind. The resulting variation between a trimmed president and an untouched
one is deliberate: the date line says the same thing either way.

**Second: the plan's prediction about the office list was half right, and the wrong half matters.** L5
predicted the `person` equivalent of the border list would be the office list. On a president it is NOT
padding — the prior career is how they got there and is different for each, and `George_H._W._Bush`'s
congressman → UN → CIA → vice president is the single most distinctive thing about him. Where it IS
padding is a term whose whole middle sentence is an enumeration of posts with dates: `Jens_Jacob_Worsaae`
gave 48 words to four offices across 1841–1877. **The test is L3's border test in another coat — does
naming the offices say more than a summary of the career would?** — and it comes out differently for those
two.

**Third: the real padding class on a modern president is the ENUMERATION**, the third sentence written as a
run-on list of achievements joined by "and … and … and". `George_W._Bush`'s ran to 88 words and nine items,
`Jimmy_Carter`'s to 76 and nine, `Barack_Obama`'s to 72 and nine. That is where the words are, and it is
the one class where cutting costs real claims rather than repetition. It also explains the batch's shape:
**the presidents are ordered by length almost exactly chronologically** — Washington 95 and Madison 91 at
one end, Obama 140 and Trump 150 at the other — because a recent presidency has more documented, citable
events. Every president before 1900 was already at the bar; the trimming fell almost entirely on the
modern half.

**Fourth, and this one is a HARD CONSTRAINT the earlier batches never met: a term whose citations are
one-per-claim cannot lose that claim.** `Barack_Obama`'s source [6] is the Nobel Foundation's *Barack H.
Obama — Facts* and its only job in the term is the Nobel Prize; `Donald_Trump`'s [4] is the Miller Center's
*Foreign Affairs* essay and its only job is the accords between Israel and several Arab states. Cutting
either clause — and the first draft cut both — **orphans the source, and `add-sources.js` refuses a source
nothing points at**, so the batch would not have shipped. This did not arise in L1–L5 because a country
term's two or three sources are general profiles carrying several claims each, where a president's six or
seven are one essay per topic. **Read the source list before choosing what to cut.** `check.js` now reports
`ORPHANED SOURCE` so it fails at draft time rather than at the writer. The softer version is the one no
tool can see: the Obama draft dropped the Nobel while KEEPING marker [6], leaving a marker pointing at a
claim that was gone — L5's rule exactly, caught by the marked-sentence year diff.

**The two GROW cases are the pass's first, and both grew from a source rather than from padding.**
`Sima_Qian` (84) said the *Records of the Grand Historian* "laid down the arrangement that the official
histories of the later dynasties kept" — a promissory note the description never cashed. The cited Inalco
encyclopedia entry states the arrangement outright ("Les *Mémoires historiques* sont structurés en cinq
parties"), so the term now names it: 130 chapters in five parts, annals, chronological tables, treatises,
hereditary houses and biographies. `Benjamin_Harrison` (84) had no foreign policy at all and never said how
his presidency ended; the cited *Life in Brief* carries the first Pan-American Conference of 1889 and the
1892 defeat by the predecessor he had beaten in 1888. **A term under the bar is usually under it because it
left something out, not because it is terse — look for the claim the prose gestures at without making**,
and take it from a work already in the term's own list. That is what keeps a grow from being padding, which
is the one way this pass can do real damage.

**Two figures were added, both verified against the term's own sources, and 41 were dropped.** Thirty-two
of the 41 are the term dates the date line already carries. **Six substantive losses are named rather than
glossed over**: `Arthur_Evans` lost the Ashmolean Keepership dates (1884–1908), the end date of the Knossos
excavation (1931) and "argued over still"; `Raymond_Dart` the Witwatersrand tenure (1922–1958);
`Jens_Jacob_Worsaae` his joining the antiquities commission in 1841 and the dates of his ministry, which
survives undated; `Christian_Jürgensen_Thomsen` the detail that he arranged the museum so visitors walked
through the sequence; `Barack_Obama` the winding down of the war in Iraq and the tightening of bank
regulation; and `Hesiod` his father's migration from Cyme in Asia Minor. **`Hesiod` is the one term in the
batch with NO date line** (it has no `GLOSSARY_DATES` entry), so every one of its 41 cut words came out of
real content — and it needed the most, 150 down to 109. It is the shape L7 and L8 should expect wherever a
term is undated.

**The hedge grep caught only two, down from eight in L5**, which is what a batch of institutional prose
produces — a presidential essay hedges very little. One was restored: `Christian_Jürgensen_Thomsen`'s
"several antiquaries had put forward before him" had become "others had published before him", and
*several antiquaries* is the specificity G4's finding earned (Vedel Simonsen published the theory ten years
before Thomsen). The other, `Arthur_Evans`'s "and that is argued over still", went with its clause while
"extensive and controversial" survived, and is recorded rather than restored.

**Two tooling repairs, both paying off L5's own log.** `check.js`'s marked-sentence year diff now sees
**BP, cal BP, kya, Mya and BCE dates** as well as calendar years — the blind spot L5 recorded after
`Fertile_Crescent` lost "between about 12,000 and 11,000 years ago" in silence — and it was verified to
fire on exactly that loss before being used here. And the checker now splits with `split-abstract.js`'s
`pieces()` rather than its own regex, because the naive splitter broke on initials and reported
`John F. Kennedy`, `Harry S. Truman`, `Warren G. Harding` and `Dwight D. Eisenhower` as four-sentence
terms. Batch 24 had already taught `split-abstract.js` about runs of initials; the check script had not
learned it.

### L7 — 33 `era` and 11 `industry` terms (2026-08-04)

**36 were outside the bar — 31 over and 5 under — and all 36 now sit at 96–110 words**, `era` at a mean of
106 and `industry` at 106. The glossary moved from 341 to **377 terms inside the bar** (79%) and its mean
from 115.0 to 113.3 words. **Both kinds are now 0 outside the bar.** The under count across the whole
glossary fell from 8 to 3.

**The date-line finding transferred a third time and paid best of all here**, because a period's span is
the one thing its date line is certain to carry: `Mousterian` opened "current in Europe, western Asia and
North Africa from roughly 300,000 to 40,000 years ago" above a line reading `c. 300,000 – 40,000 BP`, and
twenty-two terms did the same. **But it is NOT applied where the prose qualifies the span in a way the
terse line cannot** — `Last_Glacial_Maximum`'s "a lowstand plateau some 7,500 years long rather than a
single peak", `Aterian`'s "though both ends are debated", `Oldowan`'s "recent finds in Kenya suggesting an
origin closer to 2.9 million", `Middle_Stone_Age`'s gradual regional boundaries. **The rule to carry: cut
the span, keep the caveat.**

**The batch's own padding class is HISTORIOGRAPHY — who named it, when, and after what.** It is the
`era`/`industry` equivalent of L1's border list and L5's excavation administration, it appears on nearly
every industry term, and it is worth 10–20 words: "where such tools were recovered in the 1850s"
(`Acheulean`), "where Louis Leakey identified such tools in the 1930s" (`Oldowan`), "dug in 1927 and 1928"
(`Howiesons_Poort`), "Henri Breuil defined it in 1909 … and the name in use is Dorothy Garrod's, from
1938" (`Châtelperronian`). **Keep the type site and cut the dig history** — the type site is part of what
defines an industry, the excavation date is not. The exception is where the naming IS the correction:
`Middle_Stone_Age` keeps Goodwin's 1928 paper and the 1929 joint volume separate, because card batch 20
established that distinction against the literature and flattening it would undo the finding.

**FIVE GROW CASES, the most of any batch, and all five grew from a work the term already cited.**
`Paleolithic` (68), `Iron_Age` (75), `Bronze_Age` (78), `Middle_Paleolithic` (80) and `Gravettian` (82).
The route that made it safe was **the register**: `.claude/sources-register.md` records Thomsen's own
definitions verbatim from the 1848 Ellesmere translation — the Bronze Age as the age in which "weapons and
cutting implements were made of copper or bronze", the Iron Age as that "in which iron was used for those
articles to which that metal is eminently suited" — and both terms already cite it as [1]. So the growth
was reading the register, not searching. **Cooper & Grebnev's recorded support did the same second job**,
adding to both terms the fact that the Bronze Age "is therefore not justifiably applicable to much of the
southern half of the African continent", where iron production precedes bronze — a genuinely interesting
claim both terms had room for and neither made. `Paleolithic` gained Lubbock's 1865 coinage from the Greek
for 'old stone' (its source [1] is Lubbock's *Pre-historic Times*, pages 2–3, which is exactly where he
defines the word) plus its start and end dates; `Gravettian` gained its personal-ornament finding from the
d'Errico paper its [1] already was; `Middle_Paleolithic` gained the compound adhesives from Wadley and the
Mousterian by name from Gennai.

**An access finding to record: `brill.com` is 403 here**, so Cooper & Grebnev cannot be re-read, and G6's
rule bars extending it to new claims — which is why the register mattered rather than being a convenience.
`isac.uchicago.edu`'s ISAC volume is reachable but **the PDF is over 10 MB and defeats the fetcher**, and
the `archive.org` `_djvu.txt` of the 1848 Thomsen volume is truncated before the pages that matter. Three
works cited by this batch are open, correctly labelled, and not re-readable from here today.

**One claim is flagged for a citation top-up rather than silently rewritten.** `Iron_Age`'s second
sentence — iron replacing bronze "once techniques for removing impurities and controlling carbon content
were mastered" — is marked to Güder et al. 2025 "under 'Introduction'", and a read of that Introduction
suggests it discusses Archaic Aegean iron technology without stating the general replacement mechanism
(the article's own words are that "our knowledge of Archaic iron technology is still elusive"). The claim
is standard and uncontroversial; the question is only whether that section carries it. **A length batch is
the wrong place to re-cut a citation on one summariser's reading**, so the sentence and its marker are
untouched and the doubt is written down here.

**The sibling-consistency check was run FIRST**, as the plan requires, over all 44 date lines and every
date in the prose. The chains hold: Lower → Middle → Upper Palaeolithic (2.6 Mya → 300,000 → 50,000 →
11,700 BP) is exact; Stone Age → Bronze Age → Iron Age hands over cleanly at 3300 and 1200 BCE;
Quaternary/Pleistocene/Holocene agree; the Blytt–Sernander chronozones run Preboreal → Boreal → Atlantic
without a gap; and the industries nest inside their periods. **One apparent contradiction was found and
deliberately NOT "fixed": `Paleolithic` ends at 9700 BCE and `Neolithic` begins at 10,000 BCE**, which
looks like a 300-year overlap and is in fact two regional schemes side by side — the Neolithic's own third
sentence says it "begins around 10,000 BCE in the Middle East and only in the 3rd millennium BCE
elsewhere", where the Palaeolithic's close is the Holocene GSSP. Recorded rather than resolved; re-dating
the corpus is a citation batch's job, not a length batch's.

**A clause that looks like a stray figure may be a correction being made explicit.** `Boreal`'s prose
contains "does not reach down to 8,000 years ago as loose usage suggests" — which reads like a loose
figure to cut and is in fact card batch 22's finding written into the term, the uncalibrated-radiocarbon
error stated so a reader meets it. It was identified before drafting and kept. **Read a sentence that
argues with itself before trimming it.**

**Two markers were left pointing at claims the trim had removed, and both were caught by the year diff
rather than by any tool that can see it.** `Châtelperronian` kept marker [3] — Gravina et al., "No
Reliable Evidence for a Neanderthal–Châtelperronian [association]" — after the 2018 challenge that paper
IS had been cut; and `Howiesons_Poort` kept [4] — Ziegler et al. on Middle Stone Age innovation and rapid
climate change — after the clause about why the backed segments drop out. Both restored, paid for
elsewhere. This is L6's one-claim-citation constraint in its subtler form: `add-sources.js` sees the
source is still *referenced* and passes it, because the marker is still on the page. **Only reading the
citation against the surviving sentence catches it.**

**Four figures were added, all sourced, and 49 dropped**, of which about forty are the spans the date line
carries. **Seven substantive losses are named**: `Last_Glacial_Maximum`'s deglaciation beginning
19,000–20,000 years ago, `Weichselian_glaciation`'s correlation table covering "the last 2.7 million
years", `Châtelperronian`'s Breuil definition of 1909 and the Grotte des Fées as type site,
`Early_Minoan_Crete`'s tholos diameters, `Atlantic_period`'s overlap with the Holocene climatic optimum
(cut on the house rule against comparative framing with a sibling term as much as for length),
`Epipaleolithic`'s whole second sentence contrasting it with the Mesolithic (same rule — and the rule and
the word budget pointed the same way, which is worth knowing), and `Nordic_Stone_Age` being "one of the
last Stone Ages in Europe to end". **The hedge grep caught the usual four on surviving claims**:
`Middle_Stone_Age`'s "**some of** the earliest directly dated examples" flattened to "the earliest"
(L4's quantifier-before-superlative shape, third batch running), `Lomekwian`'s "**mostly** by bringing the
block down" (turning a predominant method into the only one), and `Ice_Age`'s and `Würm`'s "generally".
All restored.

**A second blind spot in the check script, recorded not fixed**: its year regex requires the number to
sit immediately before "years ago", so it cannot see "8,000 **calendar** years ago" and reported `Boreal`
as having lost the very clause that survived. An intervening word defeats it. Worth knowing before
trusting a clean run on a batch full of calibrated dates.

### L8 — 19 `hominin`, 11 `fossil` and 10 `animal` terms (2026-08-04)

**35 were outside the bar — 33 over and 2 under — and all 35 now sit at 105–110 words**: `hominin` at a
mean of 108, `fossil` 107, `animal` 104. The glossary moved from 377 to **412 terms inside the bar** (86%)
and its mean from 113.3 to 111.2 words. **All three kinds are 0 outside the bar**, and the under count
across the whole glossary is down to 1.

**The batch opened by finding a structural fault, and it is the most reusable thing in it: `Smilodon` was
not three sentences but SIX.** `split-abstract.js` breaks on an abbreviated binomial — `S. fatalis`,
`S. populator` — because the two guards it already had cannot see that shape: the run rule needs a second
initial, and the lone-initial rule (added in G5 for "V. Gordon Childe") requires a CAPITALISED word to
follow, where a species epithet is always lowercase. The fix is exact and safe: **a single capital letter,
a full stop and a LOWERCASE word can only ever be an abbreviated genus**, because a real sentence boundary
is always followed by a capital. It also needed `>` in the lookbehind, since the text is `<i>S. fatalis</i>`
and the letter is preceded by a tag close, not a space — which is why the first attempt silently did
nothing. **Verified over the whole corpus as card batch 24 verified its own splitter change**: 1,377 texts
(477 glossary terms plus 99 card abstracts in ten languages), exactly one split changed — the one being
fixed — zero round-trip failures, and the glossary now splits 3/3 everywhere and the cards 10/10. This is
C7's Chinese-semicolon finding in another coat: **a splitter gap sits unnoticed until a batch walks into
it, and it is worth running the whole-corpus split audit at the START of a batch rather than the end.**

**The plan predicted the taxon's padding class would be the naming history, and that is half right in a
way worth stating.** On a taxon the describer and year are part of the formal identity — a species IS its
type specimen and its authority — so "named in 1908 by Otto Schoetensack", "established in 1964 by Louis
Leakey, Phillip Tobias and John Napier", "Meave Leakey and her colleagues named it in 2001" all stay.
What goes is the **discovery narrative around it**: the excavation years (`Java_Man` "in 1891 and 1892"),
the finder's affiliation, the catalogue-number exegesis (`KNM-WT_40000` explained that its number "records
the Kenya National Museums and the West Turkana collecting area"), and the micro-locator (`Peking_Man`'s
"about 50 kilometres (31 miles) southwest of Beijing", which `Zhoukoudian` carries anyway). That is L5's
excavation-administration class applied to a taxon, and it is where the words are.

**A second lever this batch has and the earlier ones did not: the SIBLING PAIR.** Six of its terms come in
pairs describing the same find from two angles — `Taung_Child` and `Australopithecus_africanus`, `Lucy` and
`Australopithecus_afarensis`, `KNM-WT_40000` and `Kenyanthropus_platyops`. Each pair could be given a clean
division of labour rather than trimmed twice: the specimen term keeps the discovery (who found it, when),
the taxon term keeps the nomenclature and the diagnosis. So `Kenyanthropus_platyops` lost "found in 1999"
and `KNM-WT_40000` kept it, deliberately. **Look for the sibling before cutting a shared fact — one of the
two usually owns it.**

**The sibling-consistency check was run first and came back clean, which is itself the result.** Every
species nests inside its genus (`Homo` from 2.8 Mya over habilis 2.4–1.4, ergaster 1.9–1.5, erectus 2
Mya–110 ka, heidelbergensis 700–300 ka, naledi 335–236 ka, floresiensis 100–60 ka, luzonensis 67–50 ka,
sapiens from 300 ka; `Australopithecus` 4.2–2 Mya over afarensis 3.9–2.9 and africanus 3.3–2.1); every
fossil falls inside its species (`Turkana_Boy` 1.6 Mya, `Java_Man` 830–380 ka, `Peking_Man` 750–230 ka,
`Omo_remains` over 233 ka, `Homo_sapiens_idaltu` 160–154 ka); and **no two brain volumes disagree**, the
nine stated figures each belonging to a different taxon or specimen. L7 found a real cross-scheme
contradiction; L8 found none, and the difference is that a taxonomic hierarchy is checkable in a way a
regional chronostratigraphy is not.

**Two grow cases, and both grew by naming what the term had left out.** `Australopithecus` (68) never
named its own species, while citing the Smithsonian records for three of them — so it now names
*A. anamensis*, *A. afarensis* and *A. africanus*, with the diet and the climbing anatomy the same records
carry. `Homo_sapiens` (86) never named Jebel Irhoud while citing Hublin's paper on it — added as "the
earliest" fossils **assigned to** the species, the phrasing the register specifically preserves, since
Meneganzin flags that calling them "the oldest *Homo sapiens* fossils" is too hasty. **The register's
cautions are as reusable as its support statements**; read both before growing.

**Zero figures added and 57 dropped**, about forty of them the date-line spans. **Seven substantive losses
are named**: `Omo_remains` lost what Omo I physically consists of (a skull vault with parts of the face and
jaw and much of the skeleton), `Skhul_and_Qafzeh_hominins` the per-cave dating that showed Skhul older than
Qafzeh — the anatomical version of that claim survives — and the adolescent's age, `Homo_naledi` the body
height of 1.44 m, `Smilodon` the canine eruption finishing at 34–41 months and the finding that declining
prey does not explain its extinction, `Woolly_mammoth` the ear size, `Rhinoceros` the five specific
epithets (the genera survive because the third sentence's phylogeny names them), and `Lake_Mungo_remains`
the "beside a long-dry lake bed" that gives the place its name.

**One marker was left stranded and the year diff caught it**: `Homo_floresiensis` kept marker [3] — Sutikna
et al., "Revised Stratigraphy and Chronology for *Homo floresiensis* at Liang Bua" — after the dating
clause it carries had gone, leaving a stratigraphy paper attached to a sentence about brain size and stone
tools. Restored as "a 2016 restudy fixed the layers' age", paid for elsewhere. Third batch running that
this failure appears, and third batch running that only the year diff finds it.

**The hedge grep caught five on surviving claims, the most since L5**, and the first is the one that
matters: `Homo_sapiens`'s "these features **seem** to have emerged piecemeal" had become "the features
emerged piecemeal", turning the contested pan-African reading into a settled one on the very term whose
register entry warns against exactly that. Also restored: `Ardipithecus_kadabba`'s "the human and
chimpanzee lineages are **thought** to have separated" (which had become a flat assertion of the split),
`Homo_luzonensis`'s "on **what seems to have been** a very small body", `Homo_habilis`'s "**comparatively**
long arms", and `Homo_floresiensis`'s "known to **almost** everyone as the hobbit".

### Status

**L0 and L1–L8 have shipped** (2026-08-04). The glossary stands at **412 of 477 terms inside the bar**
(86%), mean 111.2 words, and **seven whole kinds are done — `place` (266), `person` (54), `era` (33),
`hominin` (19), `industry` (11), `fossil` (11) and `animal` (10), 404 terms between them, 0 outside the
bar**. What remains is 64 over and 1 under. **L9 is next** — `object` + `culture` + `people` + `building` +
`event` + `practice` together, 45 terms of which 40 are over, and it holds the longest terms left in the
glossary (`Spear-thrower` at 195, which is the corpus maximum). Three things L8 leaves it: **run the
whole-corpus split audit BEFORE drafting, not after** (L8 found a six-sentence term that way and fixed the
splitter gap behind it); **look for the sibling term before cutting a shared fact**, since on a pair like
`Taung_Child`/`Australopithecus_africanus` one of the two owns it and the other can let it go; and **read
each surviving marked sentence against the work it points at**, which is now three batches running the
only way a stranded marker has been found. Re-run `gloss-length.js` before and after every batch and
record the movement here. Re-run `gloss-length.js` before and after every batch and record the movement here.
