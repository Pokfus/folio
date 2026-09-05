# Learning science — what the evidence says, and twelve ways to put it into Folio

**READ BEFORE changing the scheduler, the study page's reveal path, a minigame's feedback, or
anything that decides HOW a reader meets a card.** Folio is a study tool, so the question "does this
help somebody remember?" is not a matter of taste — it has a literature, and most of that literature
disagrees with what feels effective. This file holds the findings, what Folio already does about
them, and twelve concrete proposals with the code they would touch.

Researched September 2026. Nothing here has been built; this is a plan, not a record.

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

Stated so the twelve below do not propose things that exist.

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

## 3. Twelve ways to implement this

Ordered by evidence-per-unit-of-work. Each names what it would touch.

### 1. Make "learned" mean *three correct recalls on three different days* (successive relearning)

**The finding:** the strongest flashcard-shaped result in the literature; gains come from the second
and third *separated* success, and flatten after three.

**Folio today:** `SCHED.learnSteps` is `[1, 10]` minutes — a new card graduates inside one session,
after which the interval arithmetic takes over. A card can therefore be "studied" forever having
never once been recalled on a second day.

**Build:** a per-card counter of first-attempt correct recalls on *distinct days* (the day key already
exists; `c.first` already records the day a card was introduced). A per-deck `criterion` policy
(default 3) that cascades like the other policies through `deckOpt`. Nothing about the intervals
changes — this is a *label and a statistic*, not a second scheduler: Card info gains a "relearned 2 of
3 days" line, the deck's studied/total bar counts cards at criterion, and the daily review prefers a
below-criterion card to an above-criterion one when both are due.

**Cost:** moderate. `schedAnswer` is pure and stays pure; the counter belongs on the card record beside
`lapses`. `test-scheduler.js` and `test-review-decks.js` both have to learn it.

### 2. Attempt-before-reveal, as a per-deck policy

**The finding:** retrieval effort is the mechanism. A reader who presses Space and reads the answer has
performed a *recognition* trial at best and a rereading trial at worst.

**Folio today:** the cloze box exists and is optional; Space reveals regardless. Autofocus is
deliberately off on touch devices (summoning the keyboard on every card was reported as hostile) —
this proposal must not undo that.

**Build:** a policy (`deckOpt`, so it cascades) — "attempt before revealing". The reveal button is
disabled until either something is typed in the blank or **"I don't know"** is pressed. The escape
hatch is not optional: an unskippable prompt is how a study session becomes a chore. It never focuses
the field itself; the reader taps the blank when they want the keyboard.

**Cost:** small. `showAnswer` gains a guard; the grade bar gains one button.

### 3. A "Why?" prompt on the answer side (elaborative interrogation)

**The finding:** answering *why a stated fact is true* is rated moderate-utility by Dunlosky and is
reported with large effect sizes in the primary studies; the mechanism is integration with prior
knowledge, and chained "why → and why that → so what does that tell you" goes deeper than a single
turn. Honest caveat: the moderate rating exists because durability and transfer evidence are thinner
than for testing and spacing.

**Folio today:** nothing on the site ever asks the reader to produce an explanation. The ten-sentence
background is the model answer sitting right there, unearned.

**Build:** an authored `card.why` — one question whose answer is genuinely in the card's own
background ("Why did the palaces need a script at all?"). Shown after the reveal, above the fold, with
a "show me" that opens the background scrolled to the sentences that answer it. **Not machine
generated**: a generated why-question is a guess about which sentence matters, and this site's whole
posture is that the editorial judgement is the product. It joins the content pipeline
(`add-card.js`, `serializeCardData`, `revertCard`, the editor's card surface) exactly as `quote` did.

**Cost:** small in code, large in content — it is a field on a thousand cards. Ship it optional, write
it for new cards, backfill by collection.

### 4. Free recall — a "what do you remember?" sheet per deck

**The finding:** free recall beats recognition and beats cued recall, because it forces relational
processing — reconstructing how a deck's items hang together, which nothing card-shaped ever asks.

**Build:** a page per deck: *"Name everything you can remember from Bronze Age Crete."* A textarea, no
hints, a timer. On submit, match what was typed against the deck's answer terms and aliases (the
normaliser in `gradeCloze` and the glossary alias index already do the fuzzy part), and show three
columns: recalled, missed, and *not in the deck at all* — the last being the interesting one. It
grades nothing and schedules nothing; it reports.

**Cost:** moderate, self-contained, and it needs no content. Probably the best evidence-to-effort ratio
on this list after #12.

### 5. Prequestions on the Library and the Atlas — the site's two pure-reading surfaces

**The finding:** being asked before reading improves learning of what was asked, even when every answer
is wrong, provided the answer follows.

**Folio today:** a card is already a prequestion followed by an answer followed by prose — the format
is right by accident. The **Library**, the **Atlas place panel** and the **glossary popup** are pure
reading, which is the low-utility half of the table.

**Build:** at a book chapter's head, two or three questions the chapter answers, shown before the text
with the text folded; answer or skip, then read. **The join already exists** — `card.quote` links cards
to book sections by number, so a chapter that a card quotes already has a question attached to it that
somebody wrote by hand.

**Cost:** small where a card already quotes the chapter; content work otherwise.

### 6. Elaborated feedback in Multiple Choice — say why the wrong one was wrong

**The finding:** the cleanest ranking in the file. Explanation **d = 0.49**, correct answer **0.32**,
bare right/wrong **0.05**. A game that says "✗" is buying almost nothing.

**Folio today:** `cardKinship` picks the three distractors by shared tags, so the site already knows
*in what respect* each wrong option is near the right one — and then throws that away and prints a
cross.

**Build:** one line per distractor at the reveal, built from what the site holds: the distractor's own
answer term, its date line, and the tags it shares and does not share with the answer. "Mousterian —
also a stone industry, but Middle Palaeolithic and Neanderthal, ~160,000 years earlier." No new
content: the date line and the tags are already on every card.

**Cost:** small. It is the highest-value change to the games on this list.

### 7. Blocked first, interleaved after — a fourth deck order

**The finding:** interleaving beats blocking at long delay; hybrid may beat both, because a novice
needs to see what a category has in common before discriminating between categories is meaningful.

**Folio today:** `DECK_ORDERS` is `ordered | random | difficulty`, and `studyOrder` round-robins
subdecks unconditionally — so a reader's very first ten cards in a new collection are already scattered
across its subdecks.

**Build:** a fourth order, `hybrid`: while a subdeck has fewer than N cards with a record in `S.cards`,
deal that subdeck blocked; past N, fold it into the round-robin. It is a condition inside `studyOrder`,
not a second ordering path.

**Cost:** small. Guarded by `test-review-decks.js`.

### 8. A confidence tap before the reveal, and a calibration meter

**The finding:** overconfidence is the mechanism by which readers make bad study decisions, and
calibration is measurable and movable. Judgments of learning made *after a delay* are far better
calibrated than immediate ones — which, on a spaced-repetition site, is exactly what every review is.

**Build:** two small buttons beside the reveal — *"I've got this" / "not sure"* — then compare against
what the grade turns out to be. Aggregate into one honest figure in "Beyond the cards": *"When you said
you had it, you were right 71% of the time."* The per-review log (`S.revlog`) already stores the card,
the grade, the intervals and the duration; this is one more element on a row whose shape lives in
exactly two places.

**Cost:** small, and it is the measurement that tells you whether #2, #4 and #7 are working.

### 9. Break the fluency loop — the background is read *after* the attempt, and can be tested

**The finding:** rereading is low-utility and produces the fluency illusion; the background is Folio's
rereading surface, and it is the most beautiful part of the card.

**Build:** two halves. (a) `S.settings.bgCollapsed` already exists — make the *review*-card default
collapsed-until-graded, so the ten sentences are a reward for an attempt rather than a substitute for
one. Access is never removed, only ordered. (b) A "test me on this" control on the background that
clozes one of its own sentences on the spot — a single ungraded retrieval trial on the prose the reader
was about to reread.

**Cost:** (a) trivial; (b) small, and it reuses the cloze machinery whole.

### 10. Causal chains — the second-order concept layer history needs

**The finding:** chronology is the scaffold, and *causation, change and significance* are what
distinguish understanding history from listing it. Folio's Timeline game tests **when**; nothing on the
site tests **what followed from what**.

**Build:** an optional authored `card.leadsTo` — the ids of cards this one is a cause or precondition
of, forming a shallow DAG inside a collection. Two uses: a "what came of this" strip on the answer
side, each item a link, so a reader meets the consequences of the thing they just recalled; and a tenth
minigame — three events, put them in order *and* pick which caused which. The ordering half is free
(`cardStartYear`); the causal half is the authored edge.

**Cost:** content-heavy, and the most editorially demanding item here — a causal claim is a historical
claim and has to meet the same sourcing bar as the prose. Start with one collection.

### 11. Tell the reader why it is built this way (refutation + metacognitive prompts)

**The finding:** learners under-use interleaving, spacing and retrieval **because those feel worse**,
and explaining the strategy — including explicitly refuting the intuition — measurably increases
adoption. This is the item that makes #2, #7 and #9 land as design rather than as friction.

**Build:** a short "How Folio studies you" page, reached from the walkthrough and from Settings →
Study, that states four things plainly: rereading feels the most effective and is close to the least;
being tested is not assessment, it is the studying; the day the card feels hardest is the day the
review is worth most; and mixing decks up hurts today's score and helps next month's. Plus one-line
notes at the controls those claims justify — the site already writes rows this way.

**Cost:** trivial, and it is the cheapest thing on this list. It should probably ship first.

### 12. Surface the cards that never got a second day

**The finding:** the successive-relearning gains come from the second and third *separated* success,
and the reader cannot see which cards never got one — the heatmap says they studied, the retention
figure says they are doing fine.

**Build:** read `S.revlog`, which has held one row per answer since Aug 2026 and is exactly the archive
for this. Two readouts in "Beyond the cards": a **per-deck forgetting curve** (accuracy against elapsed
interval, drawn from the reader's own history rather than a textbook), and a **"seen once" list** —
cards introduced and never successfully recalled again — with a button that studies exactly those. The
data is already being collected; nothing reads it this way yet.

**Cost:** small-to-moderate, no new state, no content.

---

## 4. What NOT to build

- **Anything that adds highlighting, summarising, or "review these notes" as a study mode.** Three of
  the four low-utility techniques, and the two the reader will *ask* for, because they feel effective.
- **A learning-styles switch** ("visual learner / verbal learner"). It has no support and would be a
  claim the site cannot stand behind.
- **Effort spent on feedback TIMING.** Genuinely contested — delayed wins in the lab, immediate often
  wins in classrooms. Feedback *type* is where the effect is (#6); timing is not.
- **Machine-generated why-questions or causal edges** (#3, #10). A guessed explanation is exactly the
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
