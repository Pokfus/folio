# Learning science — what the evidence says, and twenty ways to put it into Folio

**READ BEFORE changing the scheduler, the study page's reveal path, a minigame's feedback, or
anything that decides HOW a reader meets a card.** Folio is a study tool, so the question "does this
help somebody remember?" is not a matter of taste — it has a literature, and most of that literature
disagrees with what feels effective. This file holds the findings, what Folio already does about
them, and twenty concrete proposals — what each would look like to a reader, and what it would
actually touch.

Researched September 2026. **Thirteen of the twenty were built the same month** — 1, 2, 3, 4, 9, 10, 11,
12, 17, 18, 19 and 20, plus a first-session order picker that was not in the original list. Each of those
now carries a **SHIPPED** note saying what was actually built and where it differs from the proposal; the
remaining seven are still proposals. `CLAUDE.md`'s "HOW A READER MEETS A CARD" bullet is the operational
record — this file is the argument behind it.
---

## 1. What actually works

The anchor is Dunlosky, Rawson, Marsh, Nathan & Willingham (2013), *Improving Students' Learning With
Effective Learning Techniques*, which reviewed ten techniques and rated each for **utility** — not
raw effect size, but whether the benefit survives different learners, materials, ages and criterion
tasks. The ratings are worth stating in full, because half the list is stuff people actually do.

| technique | utility | one line |
|---|---|---|
| **Practice testing** | **HIGH** | Retrieving from memory, not recognising. |
| **Distributed practice** | **HIGH** | The same total minutes, spread over days. |
| Interleaved practice | moderate | Mixing topics rather than blocking them. |
| Elaborative interrogation | moderate | Answering "why is this true?" about a stated fact. |
| Self-explanation | moderate | Saying how a new fact relates to what you knew. |
| Summarization | low | Only works after considerable training. |
| Highlighting / underlining | low | On its own, close to worthless. |
| Rereading | low | Feels the most effective. Is not. |
| Keyword mnemonic | low | Narrow, fragile, needs generating a keyword per item. |
| Imagery for text | low | Doesn't survive real materials. |

The two HIGH-utility techniques are the two Folio is built out of, which is the good news. The rest
of this section is the detail that decides how well it does them.

### Retrieval practice (the testing effect)

Enormous and settled. 1,215 peer-reviewed articles on it were published between 1999 and 2022. Two
meta-analyses put the pooled effect at **g = .50** (Rowland 2014) and **g = .61** (Adesope, Trevisan
& Sundararajan 2017); it holds at **g ≈ .50 in actual classrooms** and **d ≈ .40 for transfer** to
material that was studied but not itself practised. The benefit grows with the retention interval —
at short delays restudy can win, and at weeks-to-months retrieval wins by a distance.

**Format matters, and the direction is retrieval EFFORT.** Free and cued recall generally beat
recognition, and the mechanism proposed is *relational processing* — free recall forces you to
reconstruct how items relate, which recognition never asks for. The qualifier worth carrying: a
recent meta-analysis finds well-built multiple-choice at least as good as recall, when the
distractors are close enough that the reader has to think about why each wrong one is wrong. So a
multiple-choice round is not automatically the weak option; a multiple-choice round with three
obviously-absurd distractors is.

### Distributed practice (spacing)

Also settled. Students recall roughly **10% more** after spaced than massed study of the same total
duration, and the gap widens over weeks and months. Directly measured on this subject: a classroom
study of **eighth-grade history** found spaced retrieval practice still paying at **nine months**.

### Successive relearning — the one Folio is closest to and does not quite do

Rawson & Dunlosky's line of work, and the most directly actionable finding in the whole literature
for a flashcard site. Successive relearning = **retrieval practice to a criterion of correct recall,
repeated across separate days**. Not "see it again in ten minutes"; *get it right, on three separate
occasions, days apart*.

Findings: in a real Introductory Psychology course, students who relearned each concept to three
correct recalls spread across the semester did markedly better on course exams and at long delay;
**under two minutes of practice per concept** was needed in the first relearning session and less in
later ones; and the incremental gain **flattens after about three sessions** — four or five
relearning sessions retained no better than three. That last part is a budget: the target is a small
number of *separated* successes, not endless drilling.

### Prequestions and the pretesting effect

Counter-intuitive and robust: being tested on material **before** you study it improves learning of
it, *even though nearly every answer is wrong*, provided the correct answer is supplied afterwards.
It works with text, video and lecture; pretesting sometimes beats posttesting outright. The benefit
is largely **specific to what was pre-asked** — it directs attention — so the prequestions have to be
about the things you want remembered.

### Feedback: elaborated beats correct-answer beats right/wrong

A meta-analysis of feedback in computer-based learning is unusually clean about the ranking:
**elaborated feedback (an explanation) d = 0.49**, **correct-answer feedback d = 0.32**,
**knowledge-of-result — the bare right/wrong — d = 0.05**. Telling a reader they were wrong is worth
almost nothing on its own. Timing is genuinely contested (delayed wins in the lab, immediate often
wins in classrooms), so it is not somewhere to spend effort; **type** is where the effect is.

### Interleaving — real, moderate, and disliked

Interleaving beats blocking for long-term retention and for telling confusable things apart, and is
a textbook *desirable difficulty*: it makes practice feel worse while making it work better.
Two qualifications the recent work insists on. **Hybrid may beat either**: blocked practice first,
while a novice is still learning what a category has in common, then interleaved once there is
something to discriminate. And **learners will not choose it** — they block, because blocking feels
fluent — unless the strategy is explained to them, at which point adoption rises measurably.

### Metacognition: the thing that makes readers pick badly

Overconfident learners study fewer items, skip what they have not mastered, spend time on what they
already know and choose worse strategies. The gap between "how well I think I know this" and "how
well I know this" is **calibration**, and interventions that narrow it change study behaviour. The
related trap on the ineffective side is the **fluency illusion**: rereading and highlighting increase
processing ease, learners read ease as knowledge, and confidence rises while learning does not.

### Dual coding — true, with conditions

Pictures plus words beat words alone; a picture creates a second retrieval route. The conditions in
the literature are not optional: the image must be **meaningful, distinctive, relevant and integrated
with the text**. A decorative picture beside a definition buys nothing and costs attention.

### History in particular

Two things recur in the history-education literature. **Chronology is load-bearing**: without a sense
of when things happened and in what order, a reader cannot examine relationships between events or
explain causation at all — the timeline is the scaffold everything else hangs on. And **second-order
concepts** — causation, change, significance — are what separate understanding from recall; a reader
who can only list facts has not learned history. Narrative form measurably helps retention of exactly
this material.

---

## 2. What Folio already gets right

Stated so the twenty below do not propose things that exist.

- **Distributed practice** is the whole scheduler: SM-2 and FSRS-6, per-deck, with load balancing,
  easy days and a reader-set day boundary. This is the strongest thing on the site.
- **Retrieval practice, in a recall format.** The card front is a cloze with a typed blank
  (`gradeCloze`), not a recognition prompt. That is the better half of the format question.
- **Varied retrieval cues.** Every card carries three phrasings; the reader meets one at random and
  can step through them. Varying the cue is what stops a reader learning the sentence instead of the
  fact.
- **Interleaving, partly.** `mixPiles` interleaves due and new in every branch; `studyOrder` deals a
  multi-subdeck entry round-robin; the pooled review mixes decks; `DECK_ORDERS` offers random.
- **Dual coding, with the conditions met.** Nearly every card and glossary term carries a picture
  chosen for its subject and read by eye before shipping, and the map cards make the image *the
  question*.
- **Spaced exposure outside the deck** — nine daily minigames, the card of the day, the glossary
  popups.
- **Honest retention reporting** — the 90-day true-retention figure, the heatmap, the per-review log.

Two gaps are visible from that list alone: **nothing on the site asks the reader to explain anything**,
and **the criterion for "learned" is one good session**, not several separated ones.

---

## 3. Twenty ways to implement this

Each entry says what the reader would SEE and what would actually be BUILT — the fields, the state
keys, the functions, the guards to re-run. Grouped by what they change. Nothing here is built.

Throughout: **a policy cascades and a quantity does not** (`DECK_OPT_INHERIT`), a new progress field
goes in `PROGRESS_FIELDS` and usually in `RESET_KEEPS`, and a change to the study page repaints with
`renderInPlace` rather than `render()` so the reader is not scrolled to the top mid-card.

---

## A. What counts as "learned"

### 1. Three correct recalls, on three different days

> **SHIPPED (Sep 2026), as described, with one deliberate difference.** The deck's studied/total bar was NOT changed to count cards at criterion — that would make every existing reader's progress appear to collapse overnight, which is a true statement told in the most alarming possible way. "Learned" is a SECOND figure, a tile in the deck statistics panel beside "studied", plus the three pips and a Card info row. **The pips moved to the study card's HEADER ROW in Sep 2026, on request** — between the "Question" label and the difficulty stars, where they are on screen from the moment the card opens rather than below the fold and only after the reveal; on a phone the words go and the three dots stay, the whole sentence riding as the row's `aria-label` and tooltip. `CRIT_DAYS` is a constant rather than a per-deck option, since the evidence names three and a quantity does not cascade. The due-order preference is `byDue`, the one comparator every session builder's due sort now goes through.

**Finding.** Successive relearning: the gains come from separated successes, and flatten after about
three. Under two minutes per concept per session.

**What the reader sees.** The grade buttons and intervals are unchanged — this is not a second
scheduler. What changes is the *bookkeeping*. On the answer side, under the term, a row of three small
pips: `● ● ○` with the caption "recalled on 2 of 3 separate days". Card info gains a matching line.
The deck's studied/total bar counts cards **at criterion**, so a deck reads "18 / 400 learned" rather
than "18 / 400 seen" — and a reader who has raced through fifty cards in one sitting sees a bar that
has barely moved, which is the honest picture. In the daily review, when two cards are due at the same
minute, the below-criterion one is dealt first.

**How it's built.**
- `S.cards[id].crit` — an array of day keys (`dayKey()`), pushed to when a card is answered **Good or
  Easy on the first attempt of that day** and the day is not already in it. Capped at the criterion, so
  it never grows: three strings per card, worst case.
- `deckOpt`-backed `criterion` (default 3), added to `DECK_OPT_INHERIT` — it is a policy, so it
  cascades from a collection down to its subdecks and directions.
- `schedAnswer` **stays pure and untouched.** The push happens in `grade()`, beside `logReviewEntry`,
  where the day boundary and the pre-grade status are already in hand.
- `deckProgMarkup(studied, total)` gains a third argument, or a sibling `deckLearnedMarkup`; the
  callers are the collection banner, the deck rows and the account page's "Collection progress", which
  already share one builder so the three cannot disagree.
- Undo: `undoSnapshot` already snapshots `S.cards[id]` whole, so the pip un-fills for free.

**Cost / risk.** Moderate. Re-run `test-scheduler.js`, `test-review-decks.js`, `test-cards.js`. The
risk is the bar moving backwards for existing readers on the day it ships — so ship it as a *second*
figure beside the existing one for a release, not as a replacement.

### 2. Two warm-up retrievals before the first new card

> **SHIPPED (Sep 2026), exactly as described.** `warmUpFirst`, a tail pass in `buildSession` modelled on `spreadNoteSiblings`, running BEFORE it.

### The first-session order picker (not in the original twenty)

**SHIPPED (Sep 2026), on request:** *"when a collection/deck is studied for the first time, they should be
taken to a page that asks which order type they want to study the deck in, with each option extensively
explained and also how they can change it later."*

**What the reader sees.** The first time they press Study on a deck — not the pooled review — they get a
page headed *"How would you like to study this?"* with four cards: **Ordered**, **Random**, **By
difficulty** and **Eased in**. Each has a one-line summary, two paragraphs of real explanation including
what the evidence says, and a line naming who it suits. The current default is tagged. Under them, in
prose: *"press and hold the deck's row in Daily study — or the Daily study banner, for your pooled review
— and the sheet that opens has a Review order row that steps through these four."* Beside it, **Not now —
use the default (Ordered)** and **Why does this matter?**, which opens #18.

**How it is built.** Intercepted in `route()` rather than in `PAGES.study`, so the home rows, the banner,
the Collections page and a pasted `#study` link are one line; `params.resume` is exempt.
`S.orderPicked[entryId]` records that the question was PUT — `""` for "asked and left at the default" —
because choosing the default writes no option and `deckOpts` therefore cannot say it was asked. A reader
with any card record in the deck is never asked, which is what stops it interrupting every existing reader
on their next session.

**Two exclusions.** The pooled review (not a deck; asking there walls a new reader off from their first
card) and community/language decks — the second is a stated gap, not a decision: it works, and it fires
inside three suites' fixtures, so it wants its own pass.

**Finding.** The forward effect of testing: retrieving earlier material improves learning of new
material studied afterwards. Free — it uses cards that were going to be dealt anyway.

**What the reader sees.** Nothing announced. The first two or three cards of a session are always ones
you have met before, and the first new card of the day arrives third or fourth. The study bar's counts
are unchanged. That is the whole of it: a reader should not be able to tell, except that the session
opens on something they can actually answer.

**How it's built.** A tail pass in `buildSession`, modelled exactly on `spreadNoteSiblings` — which is
the precedent for "reorder the finished queue without breaking the promises the branches made". It
**defers rather than shuffles**: walk the queue, and if any of the first `WARMUP_N` (2) entries is
unseen while a due card exists further down, swap the nearest due card forward. Skips a session with
no due cards at all (a first-ever session is all new, and manufacturing a warm-up there is impossible).

**Cost / risk.** Small, self-contained, no new state. Re-run `test-review-decks.js`. The one risk is
fighting `mixPiles`'s interleave — it must only touch the head of the queue, never the body.

### 3. Blocked first, interleaved after — a fourth deck order

> **SHIPPED (Sep 2026) as `hybrid`, labelled "Eased in".** `HYBRID_N` is 12. The round robin was lifted out of `studyOrder` into `robinOrder` so the hybrid can run it on a subset, and the pooled review needed a case of its own — its Ordered branch re-sorts the whole queue into the tree's global sequence and would have undone the per-deck order.

**Finding.** Interleaving wins at long delay; hybrid may beat both, because a novice needs to see what
a category has in common before discriminating between categories means anything.

**What the reader sees.** In a deck's hold-menu, the order cycler gains a fourth stop:
**Ordered → Random → By difficulty → Eased in**. Its note reads *"New subdecks come one at a time;
once you know a subdeck, it mixes in with the rest."* A reader starting Ancient Greece meets ten cards
from Bronze Age Crete rather than ten cards scattered across six subdecks — and once they have seen
about a dozen there, Crete starts arriving mixed with Mycenae and Sparta.

**How it's built.** `DECK_ORDERS` gains `"hybrid"`; `DECK_ORDER_LABEL` and `DECK_ORDER_NOTE` gain a
row each. The logic is one condition inside `studyOrder`, not a second ordering path: before the
round-robin, partition the entry's subdecks into *green* (≥ `HYBRID_N` of its cards have a record in
`S.cards`) and *fresh*; deal one fresh subdeck blocked until it goes green, and round-robin the greens
as today. `HYBRID_N` = 12 is a starting figure and should be a constant, not a magic number.

**Cost / risk.** Small. Re-run `test-review-decks.js`. Risk: a reader who never finishes a subdeck sees
the rest of the collection late — so it must not be the default; offer it, explain it (see #18).

---

## B. Making the retrieval act harder in the right way

### 4. Attempt before reveal

> **SHIPPED (Sep 2026), as described.** `deckAttempt`, a policy in `DECK_OPT_INHERIT` with a global default in Settings → Study, off by default. One guard in `showAnswer` keyed on `fromReader`, so the button, Enter and Space are all covered and the reload-restore path is never refused. `syncAttempt` had to be declared above the phrasing cycler, which replaces every `.blank-input` on the card.

**Finding.** Retrieval *effort* is the mechanism. Pressing Space and reading the answer is a rereading
trial wearing a flashcard's clothes.

**What the reader sees.** A per-deck switch, off by default: **"Answer before revealing"**. With it on,
the Reveal button is dimmed and captioned *"type your answer, or tap I don't know"*, and a second
button, **I don't know**, sits beside it. Typing anything into the blank enables Reveal; pressing
*I don't know* reveals and pre-selects **Again**. The blank is never focused automatically — on a phone
the reader taps it when they want the keyboard, exactly as today.

**How it's built.**
- `deckOpt` key `attempt`, in `DECK_OPT_INHERIT` (a policy).
- One guard at the head of `showAnswer(fromReader)`: if the policy is on, `fromReader` is true, no
  `.blank-input` holds a non-empty value and the "don't know" flag is unset, return without revealing.
  The Space shortcut goes through the same function, so it is covered by the one guard.
- The **I don't know** button sets a module-level flag and calls `showAnswer`, then the grade bar
  pre-highlights Again — it does not *submit* Again, since a reader who then recognises the answer
  should still be able to say Hard.
- `qIdx` and the phrasing chevrons are untouched.

**Cost / risk.** Small. Re-run `test-layout.js` (the grade bar's cell grid gains a button and the
≤430px row is already tight) and `test-cards.js`. Risk: an unskippable prompt turns study into a chore
— the escape hatch is not optional, and the default must stay off until #18 explains why it exists.

### 5. Retype the answer after a lapse

**Finding.** Corrective feedback works when the reader *re-retrieves*, not when they merely read the
right answer. Copying the correct answer once after a failed attempt is the cheapest form of this.

**What the reader sees.** Only after pressing **Again**, and only on a card that was actually attempted
and missed: the answer term appears with an empty box beneath it and the caption *"type it once"*. Type
it, and the session moves on. Get it wrong and it just accepts the second try — this is practice, not a
gate. Skippable with Escape.

**How it's built.** A step in `doGrade` between the grade and the queue advance, drawn into the card's
own answer area rather than as an overlay (an overlay would own the keyboard — see `OVERLAY_SEL`). The
comparison reuses `gradeCloze`'s per-character marking, and the same `spellText(answer, en-US)`
transform, so an American reader typing what is on their screen is not marked wrong. It writes nothing
to the schedule and nothing to `S.revlog`: the grade already happened.

**Cost / risk.** Small. Risk: it lands on the card the reader least wants to linger on, so it must be
one keystroke to escape and must never appear twice for the same card in one session.

### 6. Picture cues and reverse cues — two more ways to ask the same card

**Finding.** Dual coding gives a second retrieval route, and varying the cue is what stops a reader
learning the *sentence* rather than the fact. Folio already varies the wording three ways; it never
varies the *kind* of cue.

**What the reader sees.** Occasionally — perhaps one card in six, and only on cards past their first
review — the front is not a sentence. Either **the card's own photograph**, full frame, with one line
under it: *"Name what this shows"* and the usual blank; or the **date line and facts alone** ("c. 1900
– 1450 BCE · Crete · destroyed by fire") with *"Which term does this describe?"*. The reveal is the
normal answer side. The picture's title, description and credit stay hidden until after the reveal.

**How it's built.**
- No new content field. `card.image` is on nearly every card and `answerDate` on most; the two cue
  types are rendered from what is already there by `cardFrontHTML`.
- **The metadata must be held back**, and there is a precedent to reuse rather than reinvent: the
  picture round already suppresses title/desc/credit until the reveal, because a Commons file name
  routinely contains the answer. Same treatment here, same reason.
- Eligibility is checkable rather than authored: a picture cue needs `card.image`, a facts cue needs an
  `answerDate` of at least two rows. A card with neither simply never gets one.
- Gated on the existing `questionVariety` policy, or a sibling `cueVariety` beside it, and excluded
  from a card's *first* sighting — a reader who has never met a term cannot name it from a photograph.
- **Map cards are excluded outright**: their picture already *is* the question.

**Cost / risk.** Moderate, and it is the one that most needs looking at on a real page — a photograph
that gives the answer away in its caption is a silent failure. Re-run `test-map-cards.js` and
`test-difficulty.js`.

### 7. A free-recall sheet per deck

**Finding.** Free recall beats cued recall beats recognition, because it forces *relational* processing
— reconstructing how a body of material hangs together, which no card-shaped prompt ever asks for.

**What the reader sees.** A **Recall sheet** button on a deck's row and in the deck's own stats panel.
It opens a page with the deck's name, a two-minute timer, one large textarea and the instruction
*"Write down everything you can remember from this deck. One thing per line. Don't look anything up."*
Pressing Done splits the lines and shows three columns:

- **You remembered (14)** — each item linking to its card.
- **You didn't (26)** — each linking to its card, with a **Study these** button above the column.
- **Not in this deck (3)** — the ones that came from somewhere else, listed without comment.

Nothing is graded and nothing is scheduled. A line at the foot records the date and count, so the sheet
can be done again next month and compared.

**How it's built.**
- A route `PAGES.recall` at `#recall/<entryId>`, its `valid` entry and its `PAGE_META` row.
- Matching: normalise each typed line (lowercase, strip diacritics and punctuation, `spellText`) and
  test it against each card's `answerText` **and the glossary aliases of its paired term** — the pairing
  rule guarantees every card's answer has a glossary entry, and `GLOSSARY_ALIASES` is where "Great
  Britain" reaches "United Kingdom". A small Levenshtein tolerance (≤2 for words over 6 characters)
  handles typing; `gradeCloze`'s per-character comparison is *not* the right tool here, being exact.
- **Study these** routes to `study` with a scope of an explicit id list — a shape `buildSession` does
  not have today and would need (`{type:"ids", ids:[…]}`), which is worth adding anyway.
- Results in `S.recall[entryId] = [[dayKey, got, total], …]`, capped at a dozen rows, in
  `PROGRESS_FIELDS` and `RESET_KEEPS` (it is a record of reading, not a schedule).

**Cost / risk.** Moderate, self-contained, needs no content. Probably the best evidence-to-effort ratio
on the list. Risk: the matcher's false negatives feel like being marked wrong — hence "nothing is
graded", stated on the page.

### 8. Draw it — the marker as a retrieval act

**Finding.** The drawing effect: producing a drawing of a to-be-remembered item reliably beats writing
it out, and the mechanism proposed is the same elaboration-plus-motor-plus-visual combination dual
coding trades on. Folio already ships a marker and nobody has a reason to use it on a card.

**What the reader sees.** On cards where an author has asked for it, the question is followed by
*"Sketch it before you look"* and a bordered box. The marker's tools come up already open. Draw
anything — a plan of a palace, the shape of a trade route, three boxes and two arrows — then reveal.
The answer side shows **your sketch beside the card's photograph**. The sketch is kept, so meeting the
card again next month shows what you drew last time.

**How it's built.**
- The blocker is real and worth stating: **a card's marker ink is a raster canvas that is not saved**,
  where a Library book's ink is vector (`inkRecord` / `inkReplay`, `BOOK_INK_KEY`) precisely so it can
  be. This proposal is "give a card the Library's ink path", and most of the work is that, not the
  prompt.
- Points stored as fractions of the sketch box, as a book's are of its chapter panel, so the drawing
  survives a rotation, a text-size change and a different screen.
- `S.sketch[cardId] = strokes`, device-local in its own `localStorage` key rather than in the synced
  blob — ink is bulky, it is the one thing on the site with no bound, and the sync blob is PATCHed
  whole. Say so on the page: *"kept on this device"*.
- Opt-in per card via a lightweight `card.sketch: true`, because the prompt only makes sense where
  there is something to draw.

**Cost / risk.** The largest build here after #20. Re-run `test-whiteboard.js`. Risk: storage growth —
cap the strokes per card and prune oldest-first.

---

## C. Asking the reader to explain

### 9. The "Why?" prompt

> **SHIPPED (Sep 2026), and REDESIGNED the same month, on request.** It is now THREE why-questions about the answer term, each with its own brief answer behind a **Show answer** button — `card.why = [{ q, a }, { q, a }, { q, a }]`, validated by `.claude/card-links.js` and written onto existing cards by `.claude/add-card-links.js`. The single `{ q, at }` shape it replaces pointed at a block of the abstract, which asked the reader to think and then sent them off to read three hundred words to find out whether they were right; three questions with a short answer apiece is the same exercise with the checking made cheap. **The answers are written out of the card's own cited abstract** — an answer researched from anywhere else is an uncited claim wearing a card's apparatus, and no checker can see it. app.js still renders a legacy `{ q, at }` item, because `card.why` is a field the live cloud overlay can carry; the tools refuse to write one. It shares ONE per-session budget with #10, injected by `showAnswer` rather than built into `buildBack`. Five cards carry one so far; the rest is a content pass.

**Finding.** Elaborative interrogation — answering *why a stated fact is true* — is rated moderate
utility by Dunlosky and reported with large effects in the primary studies; the mechanism is
integration with what the reader already knows. Chained "why → and why that" goes deeper than one turn.

**What the reader sees.** After the reveal, above the Background fold, one question in the card's own
voice: *"Why did the palaces need writing at all?"* — with a text box, and a **Show me** button. Answer
it or don't; pressing Show me opens the Background scrolled to the sentences that answer it, with those
sentences briefly marked. Their own answer stays on screen beside the card's, unmarked and ungraded, so
the comparison is theirs to make.

**How it's built.**
- An authored field `card.why = { q, at }` — the question, and which of the abstract's two blocks
  answers it (`buildBack` already splits on ` <br><br> `, so `at` is 1 or 2; a sentence index is more
  precision than the field can honestly carry).
- **Never machine-generated.** A generated why-question is a guess about which sentence matters, and
  the site's whole posture is that this judgement is the product. It joins the content pipeline exactly
  as `quote` did: `add-card.js` validates it (a question, not a statement; the answer must actually be
  in the named block), `serializeCardData` carries it, `revertCard` restores it, and the editor's card
  surface gets a field.
- The reader's own text goes nowhere — not to the schedule, not to the log, not to the server. A
  session-scoped variable, cleared with the card. Saying so on screen is what makes people write
  honestly.

**Cost / risk.** Small in code, large in content — a field on a thousand cards. Ship optional, write it
for new cards, backfill a collection at a time, exactly as the citation passes ran.

### 10. "Connect it" — self-explanation against something already studied

> **SHIPPED (Sep 2026), as the other half of #9's budget.** `connectKin` ranks by `cardKinship` over cards the reader has a record for, and needs at least two before it will draw.

**Finding.** Self-explanation is separately rated moderate utility, and its distinguishing move is
relating the new thing to prior knowledge rather than explaining the new thing on its own terms.

**What the reader sees.** Occasionally, after a card is graded: *"You've also studied **Linear B** and
**Knossos**. How does today's card connect to one of them?"* — three chips, a one-line box, and a
**Skip** that is as prominent as the box. No grading, no model answer, nothing stored beyond the fact
that the prompt was shown.

**How it's built.** `cardKinship(a, b)` already scores two cards by shared tags and is what picks the
Multiple Choice distractors; here the same function picks *near but different* cards restricted to ones
the reader has a record for in `S.cards`. Show it on perhaps one card in ten, never twice in a session,
never on a card graded Again (a reader who just missed it has nothing to connect).

**Cost / risk.** Small. Risk: prompt fatigue is the real danger with #9 and #10 together — they must
share one budget ("at most one elaboration prompt per session"), not have one each.

---

## D. Feedback that says something

### 11. Elaborated feedback — an explanation instead of a verdict

> **SHIPPED (Sep 2026), on both surfaces.** A missed study card gets `cardFirstSentence` — the background's own opening definition, with its footnote markers stripped — inline under the answer. Multiple Choice explains the option the reader actually CHOSE, from that card's own defining sentence, rather than all three wrong options.

**Finding.** The cleanest ranking in this file: explanation **d = 0.49**, correct answer **0.32**, bare
right-or-wrong **0.05**. A cross is worth almost nothing.

**What the reader sees.** Two places.

*In Multiple Choice*, the reveal keeps the tick and the cross and adds one line under each wrong
option: *"Mousterian — also a stone industry, but Middle Palaeolithic and Neanderthal, roughly 160,000
years earlier."* *"Gravettian — Upper Palaeolithic like the answer, but 10,000 years later and known
for the burials rather than the blades."*

*On a failed study card*, instead of the answer alone, the answer plus the background's **first
sentence** — which by house rule opens with the bolded answer term and defines it — as an inline strip:
enough to know *what it was*, without opening the fold and rereading three hundred words.

**How it's built.**
- The Multiple Choice line is assembled from what the site already holds: the distractor's `answerText`,
  its `answerDate` (rendered flat, not as the two-column grid), and the tags it *shares* and *does not
  share* with the answer — which `cardKinship`/`tagKinship` already compute in order to pick it. No new
  content field.
- The study-card strip: `buildBack` splits the abstract into two blocks; take block 1's first sentence.
  Strip footnote markers before showing it (`sup.fn:empty::before` prints the marker's own digit, so a
  lifted sentence would carry a stray numeral pointing at a list that is not there — the picture round
  hit exactly this and answered it with `picNoteBare`, which is the function to reuse).
- **Timing is deliberately not touched.** Immediate-vs-delayed is contested; type is where the effect
  is.

**Cost / risk.** Small, and the highest-value change to the games on this list. Re-run
`test-minigames.js` and `test-sources.js` (the marker strip).

### 12. Confusion pairs, mined from what the reader actually types

> **SHIPPED (Sep 2026), as described.** `gradeCloze` now returns what was typed; `noteConfusion` records a guess that is another card's answer in the same collection. The drill needed a new `{type:"ids"}` session scope, which `buildSession` did not have.

**Finding.** Interleaving's best-supported use is telling *confusable* things apart — and the site is
currently throwing away the only evidence it has about which things a given reader confuses.

**What the reader sees.** Nothing, until it has something to say. Then, on the home page, a small row
under the review banner: *"You've mixed up **Gravettian** and **Solutrean** three times. 6 cards →"*.
It deals those two cards alternately, four or six cards, with the elaborated feedback of #11 pointing
at exactly what separates them. In "Beyond the cards", a short list of the pairs.

**How it's built.**
- **The hook already exists and is discarded.** `gradeCloze(qEl, answer)` reads `input.value` — the
  reader's actual typed guess — marks it per character and throws it away. Capture it there (or pass it
  out to `doGrade`), normalise it, and test it against the `answerText` of the other cards in the same
  collection. A hit is a confusion, not a typo.
- `S.confused["<idA>|<idB>"] = count`, ids sorted so the key is stable, pruned below a threshold and
  capped at a few dozen pairs — it is bounded by pairs actually confused, so it is safe in the synced
  blob, unlike anything that grows per review.
- The drill is #7's `{type:"ids"}` scope with `deckOrder` forced to alternate.

**Cost / risk.** Small-to-moderate, no content, and it is the only thing on this list that is
*personal* — nothing else here differs reader to reader. Risk: a near-miss spelling that happens to
match another term; require the guess to match the other term to within one character and to differ
from the right answer by more than that.

---

## E. Turning the reading surfaces into practice

### 13. Prequestions on the Library and the Atlas

**Finding.** Being asked *before* reading improves learning of what was asked, even though nearly every
answer is wrong — provided the answer follows. The benefit is specific to what was pre-asked.

**What the reader sees.** Opening a Library chapter, before the text: two questions on a quiet card —
*"What does Seneca say a crowd does to a person?"* — each with a one-line box and a **Skip to the text**
link. Answer or skip; the chapter opens, and when the reader reaches the passage that answers one, it
is briefly marked. The Atlas place panel gets the same treatment as an option: one question above the
description.

**How it's built.**
- **The join already exists for free on part of the shelf.** `card.quote = { book, n, text, cite }`
  links a card to a book section by number, so any chapter a card quotes already has a
  hand-written question attached to it — use the card's `question` with its blank restored to a gap.
- Elsewhere it is an authored `chapters[].pre` on the generated book file, which means it belongs in
  `.claude/fetch-book.js`'s per-book options rather than being hand-edited into the generated file.
- Shown once per chapter per reader (`S.reading[bookId]` already exists and syncs; a `pre` set of
  chapter numbers rides there).

**Cost / risk.** Small where a quote exists, content work otherwise. Risk: a wall between a reader and
a book is a good way to stop them reading — two questions, skippable in one tap, never on re-entry.

### 14. Make the glossary testable — a tenth minigame

**Finding.** Practice testing is HIGH utility; reading is not. The glossary is the largest body of
prose on the site — around two thousand terms, three cited sentences each — and **not one of them is
ever a question.** `glossSeen` records that a reader opened a term and nothing ever asks whether they
remember it.

**What the reader sees.** A new daily tile, **Define it**. Five rounds. Each shows a term's three
sentences with the term itself and its aliases blanked, and asks for the word:

> "A fine-grained sedimentary rock, formed from silica, that fractures conchoidally — which is what
> makes ▇▇▇▇▇ workable. ▇▇▇▇▇ nodules occur in chalk…"

Type the term. The reveal is the popup the reader would have got by tapping it, with the sources fold
and everything else intact.

**How it's built.**
- A game is **six places** (`PAGES.defineit`, the `valid` list, `PAGE_META`, `DAILY_GAMES`,
  `GAME_NAMES` + `GAME_SET_WORD`, and the home tile plus its click handler) — five of which fail
  silently; `test-minigames.js` asserts all six against the tiles the home page actually paints.
- The draw **must** be `dayPick(key, arr, n)`, not `Math.random`, so every reader gets the same five —
  scores are compared against a site-wide average and against friends.
- The pool is terms in `glossSeen` (things this reader has actually met) topped up from terms whose
  answer term is also a card answer, so it is never empty for a new reader.
- The blanking pass masks the term, its `GLOSSARY_ALIASES` entries, and their automatic plurals —
  the same surfaces `buildGlossIndex` already computes, so there is one list rather than two.
- `GLOSSARY_DATES` must be suppressed on the front: a date line saying "c. 145–86 BCE" answers a
  question about Sima Qian outright.

**Cost / risk.** Moderate, no content at all — 2,000 terms already written and cited. The blanking pass
is the fiddly part and a leak there gives the answer away.

### 15. Break the fluency loop — background after the attempt, and testable

**Finding.** Rereading is low-utility and produces the fluency illusion; the background is Folio's
rereading surface, and it is the most beautiful part of the card.

**What the reader sees.** Two halves.

*(a)* On a **review** card (never a new one), the Background arrives folded, with the fold head reading
*"Background — 10 sentences"*. It opens in one tap. Nothing is taken away; the order is changed, so the
prose is a reward for an attempt rather than a substitute for one.

*(b)* At the foot of the Background, a small **Test me on this** button. Pressing it picks one sentence,
blanks its most informative term, and asks for it inline — one ungraded retrieval trial on the prose the
reader was about to reread. Answer, see it marked, done. It never schedules anything.

**How it's built.** (a) `S.settings.bgCollapsed` already exists and is already honoured — this is a
change to its *default* conditioned on the card's status, which is `preStatus` in `grade()`'s hands and
`c.status` on the record. (b) reuses `setupCloze`/`gradeCloze` whole; the term to blank is chosen as the
sentence's longest glossary surface (`buildGlossIndex` already found them all, which is how the
auto-linking works), falling back to the card's own answer term.

**Cost / risk.** (a) trivial; (b) small. Risk: readers who like reading the background will experience
(a) as the site hiding things — hence it lands with #18 or not at all.

---

## F. Metacognition — the part that decides everything else

### 16. A confidence tap, and a calibration figure

**Finding.** Overconfidence is the mechanism by which readers make bad study decisions — they skip what
they have not mastered and drill what they have. Calibration is measurable and movable, and judgments
made *after a delay* are much better calibrated than immediate ones, which on a spaced-repetition site
is every single review.

**What the reader sees.** Two small buttons beside Reveal: **Got it** / **Not sure**. One tap, optional,
never blocking. Then, in "Beyond the cards", one line that is worth more than any number on the page:

> **Calibration.** When you said you had it, you were right **71%** of the time. When you said you
> weren't sure, you were right 44%. *Most people are more confident than they are correct — this is the
> only figure on the site that tells you whether you are.*

**How it's built.**
- The per-review log is the right home and this is the one place the file's own rule bites: a
  `S.revlog` row's shape lives in **exactly two places** (`logReviewEntry` writes it, `revRead` unpacks
  it), and it syncs to the `review_log` table with named columns — so a ninth element means a schema
  addition (a block 16), and **a later schema block is never a prerequisite**: with no column, the
  confidence is simply dropped on push and the figure reads from local rows only.
- Compute over the last 90 days, alongside the existing true-retention figure, and print `—` rather
  than a made-up percentage below a minimum sample.

**Cost / risk.** Small, and it is the *instrument*: it is how you find out whether #4, #7 and #15
actually did anything.

### 17. A deck pretest that decides where to start

> **SHIPPED (Sep 2026), gated on the difficulty order (on request).** The XP trap this entry names was avoided exactly as written — `S.pretest` rather than `S.cards` — and that is the assertion `test-learning.js` marks with three stars. The matcher forgives one slip INCLUDING a transposition, which plain edit distance counts as two.

**Finding.** Pretesting works even on material not yet studied, and separately, overconfident readers
waste time on what they already know. One screen does both.

**What the reader sees.** Adding a collection offers, once: *"Twelve quick questions to find where to
start?"* Twelve cards spread across the collection, question only, type or skip, no feedback until the
end. Then a summary: *"You already knew 5. We'll start you at the Bronze Age and bring the five you
knew back later than usual."* Skippable, and repeatable from the deck's menu.

**How it's built, and the trap that has to be avoided.**
- **XP is `Object.keys(S.cards).length` — the number of distinct cards with a record.** A pretest that
  naively writes card records for twelve cards would hand a new reader several levels and several
  artefact chests for answering twelve questions, silently. So the pretest **must not create `S.cards`
  entries.** It writes its result to its own field, `S.pretest[entryId] = { day, known: [ids] }`, and
  `buildSession` reads it as a *deal-order preference*: a known id sorts to the back of the new pile
  rather than being marked studied.
- The twelve are chosen by `dayPick` seeded on the entry id (so a repeat is comparable), spread across
  subdecks, and biased toward difficulty 1–2, where a reader plausibly does already know the answer.
- In `PROGRESS_FIELDS`; **not** in `RESET_KEEPS` (it is about study history).

**Cost / risk.** Moderate. The XP trap above is the entire risk and it is invisible until somebody
notices they levelled up for nothing.

### 18. "How Folio studies you" — say why it is hard on purpose

> **SHIPPED (Sep 2026) as `PAGES.how`,** reached from Settings → Study and from the first-session order picker.

**Finding.** Readers under-use spacing, interleaving and retrieval **because those feel worse**, and
explaining the strategy — including explicitly *refuting* the intuition — measurably increases
adoption. This is the item that makes #4, #3 and #15 land as design rather than as friction.

**What the reader sees.** A short page reached from Settings → Study, from the last step of the
walkthrough, and from a line under the review banner. Four claims, each two sentences, each with the
control it justifies linked beside it:

> **Rereading feels the most effective. It is close to the least.** Familiarity is not knowledge, and
> the feeling of fluency is the thing that misleads. *→ Background after the attempt*
>
> **Being tested is not the exam. It is the studying.** Retrieving a fact changes the memory; reading
> it again mostly does not. *→ Answer before revealing*
>
> **The day a card feels hardest is the day the review is worth most.** That is why Folio waits until
> you have nearly forgotten. *→ Scheduling*
>
> **Mixing decks up hurts today's score and helps next month's.** *→ Deck order*

Plus one-line notes at each of those controls, which is how the site already writes rows.

**How it's built.** `PAGES.how` at `#how`, a `valid` entry and a `PAGE_META` row; the About page's
`msn-*` sections are the layout model and the walkthrough's `TOUR_STEPS` gains a final step pointing at
it. `setActiveTab` maps it to `settings`.

**Cost / risk.** Trivial — the cheapest item here. **It should ship first**, because half the other
nineteen are desirable difficulties, and a desirable difficulty nobody has explained is just a worse
website.

### 19. The cards that never got a second day

> **SHIPPED (Sep 2026), both halves,** in the account page's statistics grid. A curve bucket with fewer than `CURVE_MIN_ROWS` reviews behind it prints nothing rather than a percentage drawn from four answers.

**Finding.** The relearning gains come from the second and third separated success, and the reader
cannot currently see which cards never got one: the heatmap says they studied, the retention figure
says they are fine.

**What the reader sees.** Two things in "Beyond the cards".

*A forgetting curve* — the reader's own, not a textbook's: accuracy plotted against how long the card
had been waiting, drawn from their own history. *"At 1 day you get 94%. At 30 days, 71%."*

*A "seen once" list* — **"41 cards you met once and never recalled again"** — with a **Study these**
button.

**How it's built.** `S.revlog` has held one row per answer since Aug 2026 and is exactly this archive;
nothing reads it this way yet. The curve buckets rows by `prevMin` (already logged, already in minutes)
and takes the proportion whose grade was not Again. The list is cards with a record in `S.cards`, one
successful recall, and none since — which is #1's `crit` array read from the other end, so the two
should ship together. The button is #7's `{type:"ids"}` scope again.

**Cost / risk.** Small-to-moderate, no new state, no content. Re-run `test-revlog.js`.

---

## G. The one that is specific to history

### 20. Causal chains — the second-order layer, and an eleventh game

> **SHIPPED (Sep 2026) WITHOUT the minigame (on request).** `card.leadsTo` and the "What came of this" strip, validated by `.claude/card-links.js`. A link opens a peek sheet rather than routing: a click meant as a glance must not end the session and spend that card's schedule. One card carries edges so far.

**Finding.** Chronology is the scaffold: without knowing when things happened and in what order, a
reader cannot examine relationships between events or explain causation at all. But chronology is the
*scaffold*, not the building — causation, change and significance are what separate understanding
history from listing it. **Folio's Timeline game tests when. Nothing on the site tests why.**

**What the reader sees.** Two things.

*On the answer side of a card*, a quiet strip: **What came of this →** followed by two or three linked
terms. Tapping one opens that card. A reader who has just recalled the Bronze Age collapse is shown,
in one line, that it leads to the Greek Dark Ages and to the alphabet's spread — which is the
connective tissue a deck of independent cards structurally cannot express.

*A new daily game*, **Cause and effect**: three events from one collection, out of order. Drag them
into chronological order — then pick, from three sentences, the one that states how the first led to
the third. Scoring is two marks: the order, and the link.

**How it's built.**
- An authored `card.leadsTo: [ids]` — a shallow DAG *within* a collection. The ordering half of the
  game is free (`cardStartYear`); the causal half is the authored edge and the authored sentence
  (`{ id, how }`).
- **A causal claim is a historical claim** and has to clear the same bar as the prose: `add-card.js`
  validates that the target exists, is in the same collection, and is *later* by `cardStartYear` —
  which catches the commonest authoring error outright — and the `how` sentence needs a citation like
  any other claim, so it rides in `sources` with a marker.
- The game's distractor sentences come from the *same card's other* `leadsTo` edges where it has them,
  which makes them plausible rather than absurd — the Multiple Choice lesson.
- `undatable` cards are excluded from the ordering half exactly as they are from Timeline.

**Cost / risk.** The most editorially demanding item on the list, and the most distinctive: it is the
one that makes Folio a history tool rather than a flashcard app with history in it. Start with one
collection — Ancient Greece is the largest and most connected — and only where the causal claim is
uncontroversial enough to cite.

---

## Where to start

If only three ever get built: **#18** (explain it — it is a day's work and it is the licence for
everything else), **#11** (elaborated feedback — the largest measured effect for the smallest change),
and **#19** (the seen-once list — the data has been sitting in the log for a year). Then **#1**, because
it is the finding this site is closest to already and furthest from actually doing.

## 4. What NOT to build

- **Anything that adds highlighting, summarising, or "review these notes" as a study mode.** Three of
  the four low-utility techniques, and the two the reader will *ask* for, because they feel effective.
- **A learning-styles switch** ("visual learner / verbal learner"). It has no support and would be a
  claim the site cannot stand behind.
- **Effort spent on feedback TIMING.** Genuinely contested — delayed wins in the lab, immediate often
  wins in classrooms. Feedback *type* is where the effect is (#11); timing is not.
- **Machine-generated why-questions or causal edges** (#9, #20). A guessed explanation is exactly the
  kind of plausible-and-wrong this project refuses everywhere else.
- **Longer drilling.** The relearning evidence caps out around three separated successes; a fourth and
  fifth session retained no better. More reps is the intuitive answer and the wrong one — the lever is
  *separation*, which Folio already pulls.

---

## Sources

Practice testing, distributed practice and the utility ratings — Dunlosky, Rawson, Marsh, Nathan &
Willingham, *Improving Students' Learning With Effective Learning Techniques*, Psychological Science
in the Public Interest 14, no. 1 (2013): 4–58, https://doi.org/10.1177/1529100612453266, and Dunlosky's
own summary, "Strengthening the Student Toolbox," American Educator (Fall 2013),
https://www.aft.org/ae/fall2013/dunlosky.

Testing-effect meta-analyses and the state of the field — "The Use of Retrieval Practice in the Health
Professions: A State-of-the-Art Review," https://pmc.ncbi.nlm.nih.gov/articles/PMC12292765/.

Retrieval effort, free recall vs recognition, relational processing — "Why is free recall practice more
effective than recognition practice for enhancing memory? Evaluating the relational processing
hypothesis," Journal of Memory and Language,
https://www.sciencedirect.com/science/article/abs/pii/S0749596X19300026; and "Retrieval Practice in
Classroom Settings: A Review of Applied Research," Frontiers in Education,
https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2019.00005/full.

Successive relearning — Rawson & Dunlosky, "Successive Relearning: An Underexplored but Potent
Technique for Obtaining and Maintaining Knowledge," Current Directions in Psychological Science 31,
no. 4 (2022), https://doi.org/10.1177/09637214221100484; and Rawson, Dunlosky & Sciartelli, "The Power
of Successive Relearning," Educational Psychology Review 25 (2013),
https://link.springer.com/article/10.1007/s10648-013-9240-4.

Prequestions and pretesting — Pan & Carpenter, "Prequestioning and Pretesting Effects," Educational
Psychology Review 35 (2023), https://link.springer.com/article/10.1007/s10648-023-09814-5; and "The
Effect of Prequestions on Learning: A Multilevel Meta-Analysis,"
https://link.springer.com/article/10.1007/s10648-025-10075-7.

Feedback type and timing — van der Kleij et al., "Effects of Feedback in a Computer-Based Learning
Environment on Students' Learning Outcomes: A Meta-Analysis," Review of Educational Research (2015),
https://eric.ed.gov/?id=EJ1081708; Butler, Karpicke & Roediger, "The effect of type and timing of
feedback on learning from multiple-choice tests,"
https://learninglab.psych.purdue.edu/downloads/2007/2007_Butler_Karpicke_Roediger_JEPA.pdf.

Interleaving, the hybrid finding and strategy adoption — Firth et al., "A systematic review of
interleaving as a concept learning strategy," Review of Education (2021),
https://bera-journals.onlinelibrary.wiley.com/doi/10.1002/rev3.3266; "Optimizing self-organized study
orders: combining refutations and metacognitive prompts improves the use of interleaved practice," npj
Science of Learning (2024), https://www.nature.com/articles/s41539-024-00245-7; Hwang et al.,
"Undesirable Difficulty of Interleaved Practice," Language Learning (2025),
https://onlinelibrary.wiley.com/doi/10.1111/lang.12659.

Calibration, judgments of learning and the fluency illusion — "Calibration Discrepancy Predicts
Students' Subsequent Metacognitive Strategy Use in Computer-based Learning Environments," IJAIED
(2025), https://link.springer.com/article/10.1007/s40593-025-00514-5; "The Forward Effect of Delayed
Judgments of Learning," https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10299460/.

Elaborative interrogation — https://www.visiblelearningmetax.com/influences/view/elaborative_interrogation
and the UW–La Crosse teaching guide, https://www.uwlax.edu/catl/guides/teaching-improvement-guide/how-can-i-improve/elaborative-interrogation/.

History-specific — UCLA Public History Initiative, "Chronological Thinking" (National Standards for
History), https://phi.history.ucla.edu/nchs/historical-thinking-standards/1-chronological-thinking/;
"Teaching History: Evidence-Based Strategies,"
https://www.structural-learning.com/post/teaching-history-strategies-guide.
