# Card pictures — what is left, measured

The rule is under "Generating cards & glossary entries" in `CLAUDE.md`: **a new card, glossary term or
artefact ships with a picture, or with a stated reason why not.** That rule is what keeps the corpus
from regrowing a backlog. This file is about the backlog that predates it.

**Run the measurements; do not quote the numbers below.** They were taken on 2026-09-17 and every one
of them moves as cards ship.

    # cards with no picture, by collection
    node -e 'global.window={};const{loadCards}=require("./.claude/card-io.js");
      const c=loadCards().cards, no=c.filter(x=>!x.image&&!x.video&&!x.map);
      const by={};no.forEach(x=>{const p=x.id.replace(/[-_]?\d+$/,"");by[p]=(by[p]||0)+1});
      console.log(c.length+" cards, "+no.length+" with no picture");
      Object.entries(by).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log("  "+k,v))'

## The pipeline, and which step is the expensive one

Four tools, in this order. The first is the only slow one and its cache is the thing worth keeping.

1. **`node .claude/fetch-images.js`** — reads every glossary article on Wikipedia, then every file on
   those articles from Commons, and caches the licence, size, author and description of each into
   `.claude/image-cache/` (gitignored). **Resumable, and safe to re-run.**
2. **`node .claude/pick-images.js --review`** — ranks the candidates per term and prints them to be
   READ. This is the irreducible step; see below.
3. **`node .claude/check-image-free.js`** — refuses a file already on another card, term or artefact.
   **Run it BEFORE fetching a candidate, never after.**
4. **`node .claude/add-images.js <batch.json>`** — writes.

· **THE CACHE IS WRITTEN AT THE END OF EACH PASS, NOT INCREMENTALLY.** `pages.json` lands when the
  article pass finishes and `files.json` when the file pass does. A run killed part way through the
  file pass loses that half and has to redo it; the article half survives. Measured on the full
  corpus: the article pass took about 25 minutes and the file pass about 40, for **58,432 distinct
  files across 3,838 terms**.
· **IT COMPETES WITH YOUR OWN WIKIPEDIA CALLS.** While the crawl runs, `en.wikipedia.org/w/api.php`
  answers **429** to everything else in the session. Do not run source discovery and the crawl
  together.

## What the crawl found, and what is actually left

Over the whole glossary: **3,326 of 3,838 terms have a usable candidate**, 256 have files but none
that clear the licence and size bar, 246 have no image on their article at all, and 10 resolve to no
article.

Broken down over the cards that have no picture, through `pick-images.js`'s own matcher:

| | cards |
|---|---|
| term already has a picture — copy it across | 25 |
| **term has a usable candidate — ready to review** | **265** |
| term has files but none usable | 62 |
| term's article has no image | 60 |
| term resolves to no article | 6 |
| **answer names no glossary term at all** | **116** |

So **290 are actionable** and the rest are a genuine absence, which under the rule is recorded rather
than treated as an oversight.

## The review step is the work, and it cannot be skipped

`fetch-images.js`'s scorer is a name match, and the standing example in its own header is the
congressman who shares a palaeoanthropologist's name. The crawl produced a fresh one immediately:
**`Abolition_of_the_fengjian_order` resolves to the Wikipedia article *Feudalism*, so its three top
candidates are a French manuscript knight, the Bayeux Tapestry and a Slovak castle.** Nothing
downstream can catch that.

So the batch shape is the geography pass's: choose by judgement, then **look at them** through
`.claude/contact-sheet.py`, which tiles a fetched batch into one image. That pass rejected roughly one
in eight and almost none was a near miss.

## THE 116 CARDS WITH NO GLOSSARY TERM ARE A PAIRING-RULE FINDING, NOT A PICTURE ONE

A card's picture comes through its answer term, so a card with no term gets no picture — and the
reason it has no term is that it broke the rule that **a new card ships with a glossary entry for its
own answer term, in the same commit**. The picture pass is where that shows up first, which is what
`pick-images.js`'s own report was written for.

Measured 2026-09-17, by collection: **`pea` 99**, `gr` 10, `ps` 3, `rm` 2, `bio` 2.

**Ninety-nine of them are one collection, and it is the newest.** `pea`, the Politics: East Asia
course collection, shipped 100 cards in which **exactly one answer matches a glossary key and none of
the hundred carries a picture**. Its plan, `docs/politics-east-asia-card-plan.md`, does not mention
either rule. This is recorded rather than repaired: 99 glossary terms written and cited at the
`GLOSS_SRC_TARGET` bar is a content pass of its own, and it is the collection author's to plan.

The other 17 are the ordinary long tail and are worth doing with the pictures.

## The first batch: 25 candidates, 10 shipped

The 25 whose term already carried a picture looked like the free ones — no research, no fetching, the
illustration already chosen and credited. **Fifteen of the twenty-five were wrong**, for two separate
reasons, and both are reasons to review this category as carefully as any other.

**Ten were wrong about the SUBJECT**, because a term's picture illustrates a CONCEPT and a card asks
about a particular thing:

· **`gr-556` is the worst of them and the one to remember.** The card is the **Athenian** siege of
  Syracuse, 415–413 BCE; the term's picture is *The Death of Archimedes*, which is the **Roman** siege
  of 212. Same city, same word, wrong war by two centuries — and a reader would take the picture as
  the card's subject.
· **`gr-139` basileus** — the card's whole point is that the word means a minor figure in the Bronze
  Age tablets and only *later* means king. The picture is a Byzantine icon of crowned emperors: it
  illustrates the sense the card exists to say it did not have.
· **`gr-225` Lydian electrum coinage** — the card says the commonest coins are "stamped with a lion's
  head in profile"; the picture is two gold coins showing a head and a horse.
· **`gr-035` Mesara tholos tombs** — the card is circular stone burial chambers 4 to 13 m across; the
  picture is figurines found in one.
· And `gr-096` (drawings of objects for a card about a LANGUAGE), `gr-158` (a 16th-century decorative
  map for ancient city-kingdoms), `gr-244` (a modern infographic of Spartan society for the Great
  Rhetra), `gr-267` (Hecataeus's world map for a card about Cleomenes), `gr-383` (a stele from a
  century after the conquest it is meant to show), and `gr-311`, which is the SAME Attica map as
  `gr-176` and would have been a within-collection duplicate.

**Five more were right about the subject and already on ANOTHER CARD**, which `check-image-free.js`
caught and nothing else would have: `gr-364`'s tyrannicides are on `gr-303` and `bio-091`'s dividing
*E. coli* is on `bio-004` — both **within** their own collection, which is the duplicate fault the
rule says to repair first rather than create. `gr-417`, `rm-328` and `rm-360` would each have made a
new cross-collection pair.

**READING THE CARD IS WHAT DECIDES IT, NOT THE SHEET ALONE.** Two of the ten I first rejected off the
contact sheet turned out to be right once the card was read: `gr-486`'s jurors' tickets look like a
card about democracy rather than empire, and the card's own abstract says the empire's "daily working
was as much legal as military". **The sheet finds the wrong picture; the card decides the borderline
one.**

So: **10 shipped** — `gr-122`, `gr-138`, `gr-169`, `gr-176`, `gr-227`, `gr-486`, `ko-035`, `ko-079`,
`rm-362`, `pea-075`. The 15 rejected keep their empty frame, which is the honest state.

## The second batch was not applied at all, and that is the more useful result

Thirty Rome cards, taken the sanctioned way: `pick-images.js --build` over a `chosen-*.json` naming
each term's own top-ranked candidate, then the contact sheet. **Of the 27 that built, roughly half
were wrong, and the wrong ones were not near-misses.**

· **`rm-288` extortion court** — an American political cartoon captioned *HOW THEY DO IT IN SEATTLE*.
· **`rm-278` decline of the Italian smallholder** — a map of the modern **Kingdom of Italy**.
· **`rm-282` lex Sempronia agraria** — a 19th-century cartoon of skeletons in top hats.
· **`rm-167` Pyrrhic victory** — a modern satirical cartoon with flags and top hats.
· **`rm-272` philhellenism** — Delacroix's massacre at Chios. That is **19th-century** philhellenism,
  the Greek War of Independence, on a card about Rome in the 2nd century BCE. Exactly the `gr-139`
  fault: the right word, the wrong century.
· **`rm-180` Roman Italy** and **`rm-267` Roman provincial system** — maps of the praetorian
  prefectures and dioceses of **AD 380–395**, four centuries after the Republic these cards are in.
· **`rm-203` Mercenary War** and **`rm-268` publicani** — Christian iconography (three crosses at
  Golgotha; the calling of Matthew the publican) for a Carthaginian revolt and a Roman tax-farming
  company.
· **`rm-172` formula togatorum** — the Capitoline Wolf, which is not a register of allied levies and
  is already on `rm-054`.
· **`rm-010` Latins** — the article *Latins* is about the **Crusader** Latins, so the top candidate is
  a 12th-century painting of crusaders.

**THE LESSON IS ABOUT THE KIND OF TERM, NOT THE TOOL.** The first batch was concrete things — a cist
grave, a stone cist, a map of Attica — and two thirds were usable. This one is Roman INSTITUTIONS: a
law, a court, a levy register, a fiscal company, a constitutional crisis. **Nothing depicts an
institution**, so the scorer falls back on whatever the article carries, and a Wikipedia article about
an abstraction carries whatever anyone has uploaded near it. **Sort a batch by how picturable its
answer terms are before fetching anything**, and expect the abstract end to need a hand-chosen file
or an empty frame.

The batch was discarded rather than half-applied. Nothing from it shipped.

## Batch 3 — the concrete end, 47 of 90

**Sorted by how picturable the answer term is, which is what batch 2 asked for — and the card already
carries that judgement in `tags[0]`, its KIND.** Over the 265 with a ready candidate the split is
stark: 73 `concept`, 56 `event`, 22 `institution`, 7 `practice`, 5 `title` and 3 `theory` against 41
`person`, 16 `text`, 12 `place`, 8 `battle`, 7 `object`, 6 `people`, 2 `building` and 2 `ruler`. So
two thirds of the remaining backlog is the abstract end batch 2 failed on, and it was knowable
without fetching a single file.

Ninety-six concrete terms built, ninety reviewed on three sheets, **forty-seven usable** — against
about half on batch 2's institutions. **The rule holds and is cheap to apply: filter on `tags[0]`
before fetching.**

**The forty-three rejections fall into four kinds, and none is a near miss.**

· **THE WRONG SENSE OF AN ENGLISH WORD.** `gr-626` **Antiphon** the Athenian orator got a page of
  **Gregorian chant**; `gr-631` **Memorabilia**, Xenophon's, got a **souvenir stall in Namibia**;
  `gr-558` **Battle of the Great Harbour** got **Battle Harbour, Newfoundland**, a fishing village in
  Labrador; `ko-084` **iron ingot** got a modern **aluminium billet stamped AFFIMET**. No scorer can
  see any of these, because in each case the name matches perfectly.
· **THE WRONG BEARER OF A SHARED NAME.** `gr-300`'s term is `Hippias_(tyrant)` and the candidate was a
  plate from a 1919 arithmetic textbook about **Hippias of Elis**, the sophist of the quadratrix.
  `gr-220` **Olbia** got an aerial view of **Olbia in Sardinia**, a modern port, where the card is the
  Milesian city on the Bug.
· **RIGHT PLACE, WRONG CENTURY — the `gr-139` fault again.** `gr-524` **Epidamnus** got the **Roman**
  amphitheatre at Durrës, 2nd century AD, for a card about the stasis of 435 BCE; `gr-611` **Birds**
  got a Lakonian kylix of about 550 BCE, 140 years older than Aristophanes' play.
· **A LOCATOR MAP IS NOT AN ILLUSTRATION.** `wh-093` **Madjedbebe** got a relief map of Australia,
  `rm-298` **Arausio** one of France, `cnh-218` **Gaixia** one of China, `gr-543` **Amphipolis** one of
  Greece. **The card already draws its own Atlas window**, so a second map tells the reader less than
  the one they have; and `gr-759` **Triparadisus** got a map of *Greece* for a place in Syria.

Two more worth naming because they are judgements rather than errors. `gr-582` **Critias** got a
**genealogy chart** of Plato's relatives — on subject, honest, and unreadable at the size a card frame
draws. `ww2-120` **Guilty Men** got a **1981 photograph of Michael Foot**, one of the three
pseudonymous authors, forty years after the pamphlet; a portrait of a co-author is not the book.

### Two pipeline faults the batch exposed, both fixed in the tool

**`check-image-free.js` passed a re-crop of the very file its own header cites.** It folded the
`\d+px-` prefix and underscores and nothing else, so `Eugene Guillaume - the Gracchi (cropped).jpg`
reported free while `Eugene Guillaume - the Gracchi.jpg` is already on `wh-350` and on the
`Gracchi_brothers` term — which is the exact pair the tool was written to prevent, and the exact pair
its header names. `DERIV_RX` now folds Commons' derivation suffixes. **The list is DECLARED and short
— cropped, crop, retouched, restored, edited — and `detail` is deliberately NOT in it**, because a
detail of one figure out of a sculpture group is a different picture on the page; so
`… the Gracchi (cropped) Gaius.jpg` still reports free and stays a judgement rather than a refusal.
**Measured over the shipped corpus the fold changes exactly one group**, and that group is a card and
its own glossary term, which is the sanctioned pairing — so this half is prophylactic rather than a
repair, and the fault it caught was a candidate, not something already live.

**`pick-images.js` was re-creating the fault a whole hand pass had cleared.** It wrote the bare
Commons page URL as `credit` and appended the attribution to the caption, so every picture it produced
tripped `check-cards.js`'s `source-in-caption` rule: **47 cards in, 47 findings out**, against a check
`CLAUDE.md` records as reporting **zero** since the Sep 2026 pass. **A pass clears a backlog; only a
rule in the tool keeps it cleared**, and nobody had put one there. The attribution now goes in
`credit`, which is the house form — **2,173 of the corpus's 2,938 card credits already carry an
author-and-licence prose line before the URL** — and the field `mediaCreditHTML` renders under the
frame. **The licence is not weakened by the move**: CC BY and CC BY-SA want the creator named, the
licence identified and the source reachable, and all three now sit together rather than being split
across two fields. What must never happen is the reverse order — cutting the clause out of the caption
while the credit is still a bare URL would leave a CC BY picture with no attribution at all, which is
the refusal `strip-credit-captions.js` is built around. The five cards batch 1 shipped this morning
were repaired the same way, credit first and caption second.

### And half the alts had to be written by hand

What the tool emits for `alt` is the cleaned file NAME, and for this batch that was Italian, Dutch and
Slovenian, two museum accession numbers, and four that simply repeated the card's own title — the
useless kind `CLAUDE.md` names, since a title NAMES a picture for someone who can see it and alt
DESCRIBES it to someone who cannot. Twenty-two were rewritten from the picture after looking at it.
**Budget for this: on a batch of concrete subjects it is about half of them**, because a file named
after its subject produces an alt that is the subject's name.

## What to do next

1. ~~The 25 whose term already has a picture.~~ **DONE — and it was not the free win it looked like;
   see the batch above.** Note for anyone tempted to treat a term's picture as automatic: **933 of the
   2,881 cards that have a picture already share it with their own glossary term**, so that pairing is
   sanctioned practice and `check-image-free.js` will report it as TAKEN every time. The line that
   matters in its output is a **card id**, not a glossary slug.
2. **The rest of the 265 in batches of about fifty**, through the contact sheet, **filtered on
   `tags[0]` and concrete kinds first** — see batch 3. Ninety-six of the concrete ones are spent, so
   what is left is the 166 abstract terms, where batch 2 measured about half wrong and wrong badly.
   Expect a much lower yield there, and expect several to need a hand-chosen file or an empty frame.
   Rome and Greece are the biggest two and Rome's obvious pictures are already spent (see the
   duplicate-picture bullet in `CLAUDE.md`), so expect a lower hit rate there than the raw count
   suggests. **Run `node .claude/check-image-free.js --batch=…` before the contact sheet, not after**:
   it is cheaper to drop a taken file than to review one.
3. **Leave the 128 that have nothing**, and say so rather than letting the gap read as an oversight.
