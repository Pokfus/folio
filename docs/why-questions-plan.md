# Think it through — the `card.why` pass

The plan for giving every HISTORY and SCIENCE card its three why-questions, opened Sep 2026 on request
("start working on the Think it through questions for all history and science cards").

**📖 Read this before writing a batch.** The rules for the field itself are in `.claude/card-links.js` and
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

**1,159 cards, which is 3,477 authored questions and answers.** Geography is out — a map card's question
is a shape and its back is a figures grid, so there is no prose to draw an answer from — and so are the
Language decks, which are somebody else's content.

Run the count rather than quoting it:

    node .claude/add-card-links.js --check          # corpus-wide coverage
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
