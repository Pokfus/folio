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

## What to do next

1. **The 25 whose term already has a picture.** No research, no review — the term's own illustration
   is already chosen and credited. Check each against `check-image-free.js` first, since a term's
   picture appearing on its card as well is a duplicate by the rule's own test.
2. **The 265 in batches of about fifty**, through the contact sheet. Rome and Greece are the biggest
   two and Rome's obvious pictures are already spent (see the duplicate-picture bullet in
   `CLAUDE.md`), so expect a lower hit rate there than the raw count suggests.
3. **Leave the 128 that have nothing**, and say so rather than letting the gap read as an oversight.
