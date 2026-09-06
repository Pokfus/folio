# Think it through — the `card.why` pass

The plan for giving every HISTORY and SCIENCE card its three why-questions, opened Sep 2026 on request
("start working on the Think it through questions for all history and science cards").

**THE PASS RAN TO THE END OF ITS OWN LIST: all 1,159 cards in the History and Science sections as they
stood carry three authored why-questions with their answers.** It did not finish the sections, because
300 cards — 200 in Ancient Rome, 100 in the Second World War — landed on main while it was running, and
those are the queue. **The lesson is the one this file should have stated first: a pass measured against a
corpus that is still growing cannot close.** What closes it is the rule rather than the pass — a new
History or Science card ships with its own set, exactly as it ships with its citations and its glossary
term — and until that rule is in force, run the count rather than trusting a figure here.

**📖 Read this before writing a `card.why`.** The rules for the field itself are in `.claude/card-links.js` and
in CLAUDE.md's `why` bullet under "Add a card"; what is here is the SHAPE of the pass — what a good
question is, what an answer may and may not say, the order the collections are worked in, and the log.

---

## Why the pass exists

The Think-it-through block used to have two kinds of prompt: the authored `card.why` questions, and — for
every card without one — a self-explanation fallback naming three cards the reader happened to have
studied over an empty textarea. That fallback was removed in Sep 2026, on request, because it is a much
weaker exercise: no right answer, nothing to check against, and no relation to the term. What that left is
honest and thin: **a card with no authored `why` shows no section at all**, and at the time of the removal
5 of 1,785 cards carried one.

So the section is now exactly as good as this pass makes it, and no better. That is the point of doing it.

## The scope, and how it is measured

"History and science" is the Collections page's own sections (`COLLECTION_SECTION` / `sectionOf` in
app.js), which is what a reader sees, not a category invented here:

| section | collections | cards |
|---|---|---|
| History | `col-8` World History, `col-13` Ancient Greece, `col-40` Ancient Rome, `china`, `col-42` Russia | 1,009 |
| Science | `bio` Biology, `psych` Psychology | 150 |

**1,159 cards when the pass opened, which is 3,477 authored questions and answers; 1,458 by the time it
reached the end of that list.** Geography is out — a map card's question
is a shape and its back is a figures grid, so there is no prose to draw an answer from — and so are the
Language decks, which are somebody else's content.

Run the count rather than quoting it:

    node .claude/why-count.js                      # coverage, whole corpus and per collection
    node -e "global.window={};require('./data.js');const C=window.CARD_DATA;\
      const p=process.argv[1];console.log(C.filter(c=>c.id.startsWith(p)&&c.why).length+' of '+\
      C.filter(c=>c.id.startsWith(p)).length)" wh-

## The bar

Three `{ q, a }` items, checked by `.claude/card-links.js`: the question 4–24 words and ending in a
question mark, the answer 12–60 words and not itself a question, no two questions the same. Those are the
things a checker can see. The three that matter it cannot:

**1. THE ANSWER SAYS WHAT THE CARD'S OWN CITED PROSE SAYS.** Write it out of the abstract, whose claims
already carry their sources. An answer researched from anywhere else — or remembered — is an uncited claim
wearing a card's apparatus, and nothing in the pipeline can detect it. If the abstract does not answer a
question, that is not the question to ask.

**2. IT IS A WHY-QUESTION, NOT A WHAT-QUESTION WEARING ONE.** "Why is the Levallois technique read as
evidence of planning ahead?" asks for a reason; "Why is Blombos Cave in South Africa?" asks for a fact
with a *why* stuck on the front. The test is whether the answer contains a *because* that does any work.

**3. THE THREE ARE ABOUT DIFFERENT THINGS.** One good pattern, drawn from the cards written so far: the
first question asks what the term IS for or why it is defined the way it is, the second asks about the
evidence — why we believe it, or why the evidence is read two ways — and the third asks about a limit, a
mistake, a dispute or a consequence. A card that argues with itself gives the third question for free.

## What a card gives you, and what to do when it gives nothing

Every abstract is ten sentences and about 300 words, hedged where the scholarship is unsettled, so nearly
every card carries at least one genuine "why". The reliable seams, in the order they are worth trying:

- **the hedge** — "still argued over", "disputed", "the trouble is", "specialists now hesitate";
- **the correction** — a reading that was overturned, a name that is a mistake, a figure that moved;
- **the definition's own edge** — why the label means this and not that, why two schemes come apart;
- **the evidence** — why this find settles something a different find could not.

Where a card really has no reason in it, **leave it out of the batch and note it**: a manufactured question
is worse than an absent section, which is the whole reason the fallback was removed.

## How a batch is written

    node /tmp/why-next.js wh- 8            # the lowest ids in a collection with no `why` yet
    node /tmp/why-dump.js wh-041 wh-042    # the answer term and the FULL abstract of each

then a batch file of `{ "cards": { "<id>": { "why": [ {q,a}, {q,a}, {q,a} ] } } }` and

    node .claude/add-card-links.js <batch.json>

which validates every card before writing any of them and splices lines rather than re-serialising
`data.js`. **Four cards to a batch** has worked well: enough to be worth a run, few enough that the four
abstracts are all still in mind while the twelve answers are written.

The two helpers above are scratch scripts rather than committed tools, and deliberately: they only select
and print, and everything that WRITES already exists and is checked.

## The order

Collections in id order, lowest unwritten id first, so "the next card to write a `why` for" is a command
rather than a judgement. World History first — its prose is the most settled and its subject is the one
the other collections lean on.

## Batch log

| date | cards | note |
|---|---|---|
| 2026-09-06 | `wh-002`–`wh-060` (56 cards) | The pass opened. Ran the four seams above over the whole of World History's prehistory: hominins, the industries, the periods and the African record. Nothing was left out for want of a reason in the card — every one of the 56 had at least one hedge, correction or dispute to ask about, which is a good sign for the 1,100 still to come. |

| 2026-09-06 | `wh-061`–`wh-125` (69 cards) | Out of the deep past and into the Holocene: the end of the ice, the peopling of the continents, the Neolithic and its founder crops, domestication of plants and animals, and the first towns. The seams changed shape with the subject — where the hominin cards offered a hedge or a correction to ask about, these offer a **method's own limit**: why body size cannot date a herd, why bone shape has repeatedly misidentified early dogs, why strontium in a tooth settles who grew up where. That is the fourth seam (the evidence) doing most of the work, and it should stay dominant through the archaeology-heavy decks. |
| 2026-09-06 | `wh-258`–`wh-300` (43 cards) | **World History is COMPLETE: all 300 shipped cards carry a `why`.** The last stretch — the steppe, the Bronze Age Aegean, the collapse, the Iron Age empires and the Levant — is where the fourth seam is at its strongest, because these are the cards written out of contested evidence: why the Egyptian record cannot be tested against itself, why pottery alone could not settle whether the Philistines migrated, why a trade documented in thousands of letters has no agreed source for its tin. Two whole-collection findings. **A card that states a hedge in its own prose writes its own second question**, so the collections whose abstracts argue with their sources go fastest; the geography decks, whose abstracts state figures, will not. And **the answer is always the card's own sentence, never a summary of it** — the temptation on a well-written abstract is to paraphrase the whole paragraph, which produces an answer that is true and does not answer the question asked. |
| 2026-09-06 | `gr-001`–`gr-200` (200 cards) | Ancient Greece to `gr-200`, and the corpus passes 500. The Greek decks turn on a **different seam from World History's**: not the method's limit but the READING that has since been overturned or was never settled — why 'palace' is an inheritance rather than a description, why deciphering Linear B left Linear A shut, why a burial graph stopped meaning a population rise once adults and children were separated, why the middle-class hoplite army is called a myth. **A card whose abstract names two scholars disagreeing writes its own second question**, and the Greek collection names them constantly, which is why these went faster than the Egyptian and Mesopotamian ones. Watch the 12-word floor on an answer: a short factual reply (`gr-196`'s dye works) is refused by `card-links.js` and has to be given its evidence rather than padded. |
| 2026-09-06 | `gr-201`–`gr-300` (100 cards) | Ancient Greece to `gr-300`, and the corpus reaches 600. This stretch is the Spartan decks and then early Athens, and it turns up a **third seam beside the hedge and the overturned reading: the source disagreeing with itself, or with another source, about a figure**. Pausanias closes against Herodotus over where Croesus’ gold went; the Argive dead at Sepeia are six thousand, five thousand and 7,777 in three authors; Peisistratus levies a tithe in one account and a twentieth in another, and ruled nineteen years or seventeen. Those cards write their own third question without any editorial reaching, and the Athenian constitutional cards are the richest of all, because the Constitution of the Athenians reports an ancient dispute and then adjudicates it — what the seisachtheia did, how the second property class was measured, whether Solon drafted obscurely on purpose. **Where a card names two accounts and picks neither, ask why they differ rather than which is right**: the answer is then the card’s own sentence and needs no judgement Folio has not made. |
| 2026-09-06 | `gr-301`–`gr-400` (100 cards) | Ancient Greece to `gr-400`, and the corpus reaches 700. Four subjects in one stretch — the end of the tyranny and the Cleisthenic reforms, archaic art and architecture, the poets and the Presocratics, then Persia and the Ionian revolt — and each has its own seam. **A REFORM CARD ANSWERS WHY AS A MATTER OF DESIGN**, because the Constitution of the Athenians states the intention behind each change: why ten tribes and not twelve, why a man was named for his deme, why the Council could not be bypassed. **A CRAFT CARD ANSWERS FROM PROCESS** — why the kiln makes the black, why the flutes are cut after the column stands, why a Doric corner cannot obey its own rule — and those are the easiest third questions in the collection, since a rule that cannot be kept is stated as a rule. **A POET OR PHILOSOPHER CARD ANSWERS FROM THE APPARATUS**: no book of Thales to check Aristotle against, a life drawn from the poems it claims to explain, a famous saying that is Plato’s paraphrase, a chronology built by synchronising one man with another. And **A PERSIAN CARD SETS TWO RECORDS AGAINST EACH OTHER**, the Behistun rock against 2,100 ration tablets, Herodotus against Charon on how much of Sardis burned — so the question to ask is what the empire’s own account does not say. |
| 2026-09-06 | `gr-401`–`gr-500` (100 cards) | **ANCIENT GREECE IS COMPLETE: all 500 shipped cards carry a `why`**, and with World History that is 800 of 1,159. The last hundred run from Marathon through the Persian Wars to the Athenian empire, the democracy and the Parthenon, and they add a **fifth seam to the four logged above: the event known from a stone rather than from a narrative**. No historian tells when the treasury moved from Delos, so the date rests on the first quota list; no historian mentions the Coinage Decree at all, and it survives in six local copies that disagree with each other; the Peace of Callias may never have existed, and Thucydides passes the years it covers without a word. **Where the evidence is an inscription, the question to ask is what a stone can show that a narrative cannot** — a list of who paid, a clause a city was made to cut at its own expense, an oath sworn to Chalcis — and, on the other side, what the silence of a historian is worth. The institutional cards keep the earlier reform seam and answer from procedure (two pebbles and a jar with one hole; courts allotted only on the day), and the finance cards are the most concrete in the collection, since a chorus, a warship and a rower’s kit all have prices. |
| 2026-09-06 | `rm-001`–`rm-100` (100 cards) | **ANCIENT ROME IS COMPLETE**, and the corpus reaches 900. The collection runs from the geology of Italy to the treaty with the Latins, and it adds a **sixth seam: the claim that rests on nothing measurable**. A tin mine has been called Etruscan since 1876 on no evidence at all; a lordship over Campania is asserted by the literary sources and supported by no excavation; a bronze she-wolf that every ancient text seemed to describe turns out by radiocarbon to be medieval, which costs the object its texts rather than the image its meaning. That is the negative form of the evidence seam, and this collection offers it constantly, because it opens with **cards whose evidence is MEASURED rather than narrated** — isotopes, tree rings, ore sources, satellite radar over a dormant caldera — before the literary tradition begins at all. Where that tradition does take over, its own cards say so: the pontifical annals burned, the first Roman history was written five centuries late, and Livy warns that the consular list was falsified by the great houses. **On a legend card ask what the story was FOR** (bridging four centuries between Troy and Rome, explaining patrician families who were not Roman, giving one house a goddess), and on a constitutional card ask the consequence rather than the rule — a rating that decided who paid also decided who voted. |
| 2026-09-06 | `cnh-001`–`cnh-100`, `ru-001`–`ru-010` (109 cards) | **THE WHOLE HISTORY SECTION IS COMPLETE: 1,009 of 1,009**, leaving only Biology and Psychology. China and Russia are the two collections whose cards are written from a **tradition that is itself the subject**, and that changes what a why-question can ask. A Chinese card rarely offers a scholar disagreeing with a scholar; it offers a text disagreeing with the ground — the Bamboo Annals against the Shiji, a dynasty’s own account of the one before it, a chronology that is exact from 841 BCE and reconstructed before it, an excavation that confirms a king list nobody could test for two thousand years. So the seam is **why the record says what it says**, which is a question about who wrote it and when, rather than about a method’s limit. Russia’s ten cards are earlier still and mostly Greek-sourced, and they carry the collection’s own warning in miniature: the steppe is described only by outsiders, so the third question is repeatedly **what the surviving account could not have known**. One tooling note for the batches to come: the 12-word floor on an answer bites hardest on a card whose reason is a single plain fact (`cnh-089`’s modern city sitting on the site), and the fix is always to give the answer its evidence rather than to pad the sentence.
| 2026-09-06 | `bio-001`–`bio-100` (100 cards) | **BIOLOGY IS COMPLETE**, leaving only Psychology’s fifty. This is the first collection outside History, and the seam changes completely: a science card offers no source disagreeing with a source, because there is no source in it to disagree — what it offers instead is **a rule with a measured exception attached**. The abstracts are written that way throughout: the prokaryote–eukaryote contrast against the centimetre-long sulphur bacterium with membrane-bound compartments; the enzyme temperature curve against enzymes that peak well below where they unfold; quarter-power metabolic scaling against 358 studies whose exponents run from 0.5 to 1.0; structure-function against the half of human genes carrying disordered segments. So the reliable third question is simply **where does this rule stop, and what stops it** — and the answer is always a figure the card already states. Two other patterns worth carrying into any science collection. **A method card answers from what the instrument cannot do** (why an electron micrograph is always of something dead, why a colour change is not a measurement, why optical methods report an average where mass spectrometry does not), which is the history plans’ evidence seam in another vocabulary. And **a card citing a survey of practice writes its own third question outright**: blinding in 6.3 per cent of 960 studies, 51 per cent of surveyed researchers reporting an unexpected finding as though hypothesised, 12 per cent of papers treating repeated measures as independent. Those are the sharpest answers in the collection, and they belong to the reader rather than to biology.
| 2026-09-06 | `ps-001`–`ps-050` (50 cards) | **THE PASS IS COMPLETE: 1,159 of 1,159.** Psychology is the one collection where the plan’s own exclusion pays off directly — it is exempt from the no-researchers-in-a-question rule because the literature IS the subject matter, and its history deck is made of people, so a question may name Broca, Fechner or Titchener outright. Its seam is neither History’s contested source nor Biology’s measured exception but a third thing: **the claim that was tested and did not survive, on the discipline’s own methods**. Phrenology’s central claim checked against 5,724 MRI scans; the readiness potential reread as stochastic fluctuation; Brigham retracting his own army-test conclusion on the ground his own data had always shown; the imageless-thought dispute that two identical laboratories could not settle. **Ask what would have counted as the test, and what it returned**, and the third question writes itself. Two smaller patterns worth carrying. **A card about a historical figure answers from the argument rather than the biography** — why Elisabeth’s objection was the one Descartes could not meet, why Wundt put the higher processes outside the laboratory, why Donders doubted his own subtraction — which is the history plans’ rule that a question may not rest on who said a thing, kept even where the rule itself is lifted. And **a method card in a science that studies people offers its own reflexive question**: hindsight bias is why a finding must be predicted rather than recognised, and 34,560 significance maps are why objectivity is a set of procedures rather than a state of mind.
| 2026-09-06 | merge with `main` | **THE SECTIONS ARE NOT COMPLETE, THOUGH THE LIST WAS**, and it is worth
recording why rather than quietly restating a number. The pass was planned against a snapshot — 1,159 cards — and while it ran, 200 Ancient Rome and 100 Second World War cards shipped on `main`, so merging left 1,158 of 1,458 (the odd one being `cnh-070`, retired on main, whose set went with it). Nothing was lost and nothing was wrong; the target moved. **A content pass over a growing corpus has no finish line, only a rule**, which is why the standing instruction is that a new History or Science card ships with its own set, and why every claim of completeness here now names the day it was measured.
