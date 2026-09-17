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

## What to do next

1. ~~The 25 whose term already has a picture.~~ **DONE — and it was not the free win it looked like;
   see the batch above.** Note for anyone tempted to treat a term's picture as automatic: **933 of the
   2,881 cards that have a picture already share it with their own glossary term**, so that pairing is
   sanctioned practice and `check-image-free.js` will report it as TAKEN every time. The line that
   matters in its output is a **card id**, not a glossary slug.
2. **The 265 in batches of about fifty**, through the contact sheet. Rome and Greece are the biggest
   two and Rome's obvious pictures are already spent (see the duplicate-picture bullet in
   `CLAUDE.md`), so expect a lower hit rate there than the raw count suggests.
3. **Leave the 128 that have nothing**, and say so rather than letting the gap read as an oversight.
