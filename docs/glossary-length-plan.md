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
| **L5** | `place`, sites, regions and continents | ~40 | ~38 | Everything under `place` that is not a country: caves, gorges and type sites, the continents and oceans, and the odd river (`Awash_River`, which L1's filter turned up). Less formulaic; expect real judgement per term. |
| **L6** | `person` | 54 | 28 | Half are already close — the 45 US presidents were written to one template. Cheapest batch per term. |
| **L7** | `era` + `industry` | 44 | 36 | Do these two together: they share dates, and the sibling check across them is the one that caught the Palaeolithic end-date twice before. |
| **L8** | `hominin` + `fossil` + `animal` | 40 | 35 | Taxa. Watch the citations: a trimmed sentence must still be the one the marker points at. |
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

### Status

**L0, L1, L2, L3 and L4 have shipped** (2026-08-04). The glossary stands at **258 of 477 terms inside the
bar**, mean 119.7 words, and **every country term is done**. **L5 is next** — the 55 non-country `place`
terms: caves, gorges and type sites, the continents and oceans, the regions and the odd river. It is the
first batch with no recipe: there is no border list and no distance locator to cut, the terms are the
longest left in the glossary (`Dolní_Věstonice` 184, `Madjedbebe` 179, `Africa` 172), and several are the
type sites whose citations the card pass fought hardest for, so **the marked-sentence diff matters more here
than anywhere**. Re-run `gloss-length.js` before and after every batch and record the movement here.
