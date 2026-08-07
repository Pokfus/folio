# Folio is a history site, not an archaeology site — the rewrite plan

> **Card ids here are the PRE-2026-08-04 numbering.** The World History collection was replanned from
> scratch on that date and its cards renumbered into the new running order, with twenty retired;
> `docs/world-history-card-plan.md` holds the old→new table and the retirement list. This file was
> deliberately **not** rewritten — it is a record of work done under the old ids, and a rewritten log is
> a worse log. Read a `wh-NNN` here through that table.

*Opened 2026-08-03, on request: "we are a history website, not an archaeology website. Some cards (like
Knossos) seem to be more focused on the excavations than the actual history of the site."*

Not part of the site.

## The rule (now in CLAUDE.md, binding on every future card and glossary term)

**A card is about the PAST it names, not about the people who dug it up.** The excavation is how we know;
it is not what the reader is here to learn. So:

- **The question must be answerable from the past, not from the dig.** A clue built on who excavated a
  site, in what year, and after which rival failed to get permission, teaches a reader the history of
  archaeology. `gr-008`'s opening question was *"Schliemann tried to arrange a dig at ___ and never came
  to terms with the owners…"* — a reader could answer that knowing nothing whatever about Bronze Age
  Crete.
- **At most about two of an abstract's ten sentences may be discovery history**, and they earn their place
  only when the discovery is itself the fact worth knowing (the first *H. erectus* ever found; the fossil
  that founded a genus) or when the dating is contested and the reader needs to know why.
- **The date line carries the dates of the THING, not of the dig.** `Found`, `Excavated`, `First dug`,
  `Named` and `Published` are labels about modern scholarship. They belong on a card whose subject IS a
  modern act — `wh-006` (the three-age system), `gr-007` (Arthur Evans) — and nowhere else. Prefer
  `Built`, `In use`, `Occupied`, `Lived`, `Era`, `Destroyed`, `Abandoned`.
- **Where a modern name is unavoidable, keep it to a subordinate clause.** "Dated to about 430,000 years
  ago" beats "excavated from 1978 by the Atapuerca Project and dated to about 430,000 years ago".
- **Restoration and display are history too, but of a different subject.** Evans's concrete at Knossos is a
  fact about the 20th century. It belongs on the card about Evans.

**What does NOT change:** citations, hedging and the sourcing bar. Saying less about the dig is not saying
less about how we know — the apparatus at the foot of the card is where that lives, and it is already at
the 5-source bar on all 119 cards.

## How the flagged cards were found

`node` over `data.js`, counting for each card (a) how many of its ten abstract sentences carry a year
between 1800 and 2029, (b) whether its *question* carries one, and (c) whether its date line uses a
discovery label. A card is flagged at 4+ modern sentences, or 3+ with a modern question or a dig date
label. That is a proxy, not a verdict — **read the card before rewriting it**, because on a handful of
these the modern years are the subject (`gr-007` Arthur Evans is a biography and is *supposed* to be full
of them, and `wh-106` Blytt–Sernander is a card about a 19th-century idea).

**24 of 119 cards were flagged when this was written; 23 are now** — `gr-008` came off it with H1. The
measure is repeatable; re-run it after each batch. The table below is the original reading, kept as the
baseline rather than edited card by card; run the measure for the current state.

| card | answer | modern sentences | modern question | dig date labels |
|---|---|---|---|---|
| `wh-029` | Atapuerca Mountains | 7/10 | — | Excavated |
| `gr-007` | Arthur Evans | 6/10 | yes | Excavated |
| `wh-025` | Java Man | 6/10 | yes | Found, Named |
| `wh-060` | Lake Mungo remains | 6/10 | — | Found |
| `wh-085` | Cave of Altamira | 6/10 | yes | — |
| `wh-017` | Olduvai Gorge | 5/10 | — | Excavated |
| `wh-037` | Homo naledi | 5/10 | — | Found, Named |
| `gr-008` | Knossos | 4/10 | yes | First dug |
| `wh-034` | Neanderthal | 4/10 | yes | Named |
| `wh-035` | Denisovans | 4/10 | — | — |
| `wh-036` | Denisova Cave | 4/10 | — | Found |
| `wh-039` | Liang Bua | 4/12 | yes | Excavated |
| `wh-065` | Châtelperronian | 4/10 | — | Named |
| `wh-067` | Lion-man | 4/10 | — | Found |
| `wh-018` | Homo erectus | 3/10 | — | Named |
| `wh-024` | Dmanisi | 3/10 | — | Found |
| `wh-026` | Peking Man | 3/10 | yes | Named |
| `wh-030` | Homo heidelbergensis | 3/10 | yes | Named |
| `wh-038` | Homo floresiensis | 3/10 | yes | Found, Named |
| `wh-051` | Blombos Cave | 3/10 | — | Excavated |
| `wh-066` | Aurignacian | 3/10 | — | Named |
| `wh-068` | Hohle Fels | 3/10 | — | Excavated |
| `wh-094` | Monte Verde | 3/10 | — | Found |
| `wh-096` | Doggerland | 3/10 | — | Named |

## The batches

Grouped so that each batch shares a body of reading, which is what makes the research economical — the
same lesson the citation pass learned. **Every rewrite keeps the card's existing sources and markers, or
replaces them properly**: a sentence that goes must take its marker with it, and `add-sources.js` refuses a
card whose sources are no longer all referenced.

| batch | cards | shared spine |
|---|---|---|
| **H1 — DONE** | `gr-008`, `gr-010` | Minoan Knossos as a place: what the palace was for, who lived in it, what it controlled. `gr-007` already exists to carry Evans, so `gr-008` handed him over wholesale rather than trimming him. Shipped 2026-08-03 along with the other eight Bronze Age Aegean cards — see below. |
| **H2** | `wh-029`, `wh-024`, `wh-051`, `wh-068` | Sites whose interest is what people DID there: Atapuerca's Sima de los Huesos as a mortuary deposit, Dmanisi as the first hominins out of Africa, Blombos and Hohle Fels as the earliest art. Each currently opens on the dig. |
| **H3** | `wh-025`, `wh-026`, `wh-018`, `wh-030` | *Homo erectus* and its named finds. Java Man and Peking Man are genuinely discovery stories, so these keep the most modern history of any batch — but the ratio should invert: the species' range, dates and way of life first, the finding second. |
| **H4** | `wh-034`, `wh-035`, `wh-036`, `wh-037`, `wh-038`, `wh-039` | Neanderthals, Denisovans and the island species. Here the modern years are largely GENETIC results rather than digs, which is a different thing — the reader needs the interbreeding percentages, not the lab that ran them. |
| **H5** | `wh-060`, `wh-067`, `wh-085`, `wh-094` | Objects and painted caves. Altamira's card is about a 19th-century controversy over authenticity; that is a fine card, but it is a card about archaeology, and the cave's own 22,000 years are barely in it. |
| **H6** | `wh-017`, `wh-065`, `wh-066`, `wh-096` | Named places and industries whose names are 19th- and 20th-century acts. These are the hardest, because the naming genuinely is part of the subject; the target is to keep one sentence of it, not four. |

## What H1 actually shipped, and what it added to the rule

H1 was done as part of a wider pass over **all ten** Ancient Greece cards, not just the two flagged
ones, because the whole deck was written from dig reports and the unflagged eight were the same fault
below the threshold — `gr-004 Keros` was a finds inventory, `gr-003` was carving hours and lost
findspots. Excavation vocabulary across the ten went from 27 mentions to 12, and from 22 to 6 leaving
out `gr-007`, where the dig IS the subject.

Three things came out of it that the rest of the batches should carry:

- **The date line is where a correction goes to die.** `gr-008`'s abstract was rewritten and its
  `First dug 1878, by Minos Kalokairinos` / `Evans dug 1900–1931` rows sat there afterwards; the same
  had happened to `gr-004` and `gr-010`. This is the third time the pass has found a correction that
  travelled through prose and stopped at `answerDate`. **Strip the dig rows in the same commit**, with
  `set-date-line.js`, and check the sort year afterwards — three Greek cards were yielding modern years
  to `cardYears` purely from those rows.
- **The question pool goes with the prose.** Eleven of the thirty Greek phrasings rested on material
  the rewrite removed — Schliemann's failed negotiation, Kalokairinos's twelve store jars, the 1963
  looting. A rewritten card with an unrewritten question pool asks about a background it no longer has.
- **Two corrections and a withdrawal.** `gr-006` said the armed graves near Knossos are "usually read as
  an intrusive Mycenaean military caste" and stopped; the cited page says the newest study argues for
  Minoans of three ranks. `gr-007` claimed Evans proposed "Minoan" to the British Association at
  Cambridge in 1904, which is in none of the works the card cites, and it was withdrawn rather than left
  standing on a source that does not say it. **Re-reading the sources to cut the dig finds errors in
  what stays** — the same thing the citation top-ups found.

A fourth rule came out of the same reading and is now in CLAUDE.md under `abstract`: **a background
covers its whole answer term.** `gr-001` was rewritten history-first and came back seven-tenths about
Crete, because Crete is where the palaces, the writing and the best open sources are; *Aegean Bronze
Age* is three traditions by definition. It was reported by a reader and rebalanced the same day. Expect
this to bite in H3 and H4, where one species or one site is far better published than its siblings.

## Two things the pass must not do

- **Do not delete a hedge to make room.** "Scholars still disagree about…" is not archaeology-talk; it is
  accuracy, and the golden rules require it.
- **Do not invent history to replace excavation history.** If a site's Bronze Age occupation genuinely is
  not documented in anything openable, the card says less rather than more, and the gap is recorded in
  `.claude/sources-register.md` — the same rule the citation pass runs on.

---

# Part two: and not a historiography site either

*Opened 2026-08-06, on request: "ensure that in all current and future cards, the card's main focus is on
the answer term's history, and not its historiography or archaeology. Briefly touching on them in the
background section is fine, but they should never be the primary focus (unless the answer term is
specifically a modern historiographic theory or debate). The questions in all cards should never name any
specific researchers or scholars (although mentioning theories is fine)."*

Part one was written about the people who DUG the past up. It binds equally on the people who ARGUE about
it, and the two fail in exactly the same way: the reader is taught the state of a modern literature
instead of the past that literature is about. The rule is now in CLAUDE.md; what follows is the measure,
the verified list and the batches.

## The two rules

**1. A question may never name a researcher or scholar.** Absolute. Not *"Hans van Wees calls…"*, not
*"Lambert argues that…"*, not *"Evans noted in a footnote…"*. A clue built on who said a thing can be
answered by someone who knows the modern bibliography and nothing whatever about Greece — the exact
inversion of what a study card is for.

Naming the **theory** is fine and usually better. The fix is nearly always to keep the claim and drop the
name, which costs the card nothing and buys back two or three words:

| before | after |
|---|---|
| *Oliver Grote argues that each `___` began as a band of settlers…* | *One account has each `___` beginning as a band of settlers…* |
| *Hans van Wees calls the middle-class army of the `___` a myth…* | *The middle-class army of the `___` is now called a myth…* |
| *Evans noted in a footnote that the left forearm of the larger of the `___` was restored…* | *The left forearm of the larger of the `___` is a modern restoration, and so is the head of its snake…* |

**An ancient author is not a researcher.** Herodotus, Pausanias, Strabo, Plutarch and Thucydides are
sources *for* the past; a question naming one is teaching history and should stay. The line is the modern
arguer, not the ancient witness — and the measure knows the difference (`ANCIENT` in the script).

**2. Historiography may not be the primary focus of an abstract.** At most **3 of 10 sentences**. Briefly
touching on it is not merely allowed but often required — a contested date, a term whose meaning was
overturned, a dissent the hedging rules demand — but a background running *A argues, B answers, A's
reviewer is unpersuaded* for six sentences is a literature review with a Greek word on top.

**The exemption:** a card whose ANSWER TERM is itself a modern theory, debate, method or scholar. `gr-007`
Arthur Evans, `gr-075` the decipherment of Linear B, `wh-006` the three-age system, `wh-064` the Toba
catastrophe theory, `wh-106` the Blytt–Sernander scheme. There the modern argument IS the subject. The
list lives in the measure and every entry carries its reason; keep it short.

## The measure

    node .claude/card-focus.js [--prefix=gr-] [--all] [--card=gr-176]

A researcher is detected from **the card's own source list**, parsing each citation's author positions —
the reviewer before `, review of`, the authors after `, by ` / `, ed. ` — with titles stripped first. The
first cut swept every capitalised word out of the citations instead and flagged **187 of 269** cards,
because place names, period names and ancient authors all leak out of a title: *Morocco*, *Oldowan* and
*Homer* were being read as scholars. Two further leaks were found by reading flagged questions and finding
no scholar in them (`Hohle` from Hohle Fels, `Agora` from a monograph series); those live in
`NOT_A_SURNAME`. A second, weaker pass catches attribution with the name filed off — *his reviewer*,
*modern scholarship*, *scholars divide* — which is historiography in disguise.

**3 of 10 is not a taste; it is where the corpus breaks.** Over the 269 shipped cards the historiography
count is 0 or 1 for 206, 2 for 37 and 3 for 12, and then jumps to a tail of twelve cards at 4 and above.

**It is a proxy, not a verdict. Read the card before rewriting it.**

## What it found — 45 cards

**44 break the question rule; 12 are majority-historiography; 11 do both.**

The twelve worst are the ones to note, because six of them were written *in the session that produced this
rule* and nothing complained at the time:

| card | answer | historiography | question names |
|---|---|---|---|
| `gr-177` | phratry | 7/10 | Lambert, Jones |
| `gr-179` | archaic aristocracy | 7/10 | Fisher, Duplouy, Wecowski |
| `gr-174` | agora | 6/10 | Murray |
| `gr-176` | phyle | 6/10 | Grote, Crowley |
| `gr-178` | genos | 6/10 | Lambert |
| `gr-180` | hoplite | 5/10 | van Wees, Schwartz |
| `gr-023` | Bull-leaping fresco | 4/10 | Evans ×2 |
| `gr-024` | Snake Goddess figurines | 4/10 | Evans ×2 |
| `gr-167` | votive dedication | 4/10 | Day, Whitley |
| `gr-168` | bronze tripod cauldrons | 4/10 | — |
| `gr-173` | acropolis | 4/10 | Maher |
| `wh-061` | Behavioural modernity | 4/10 | Brooks, Klein |

**Question-rule only** (the abstract is fine; only the clue names somebody):
`gr-010` `gr-017` `gr-019` `gr-020` `gr-021` `gr-022` `gr-025` `gr-031` `gr-054` `gr-088` `gr-112`
`gr-139` `gr-141` `gr-145` `gr-153` `gr-154` `gr-156` `gr-158` `gr-161` `gr-162` `gr-175`
`wh-014` `wh-025` `wh-035` `wh-037` `wh-041` `wh-042` `wh-043` `wh-046` `wh-059` `wh-093` `wh-094` `wh-100`

Two patterns in that list are worth naming. The **Evans cluster** — eight Minoan cards whose questions lean
on Arthur Evans — is part one's problem showing up in part two's measure, since Evans is both excavator and
arguer. And the **eponym cases** (`wh-042` Linnaeus, `wh-046` Lubbock, `wh-100` Frank Roberts) are the
softest: the naming of the term genuinely is a fact about the term. They are still fixed, because *"coined
in 1865 from the Greek for 'old stone'"* teaches the same fact without the name.

## The batches

Each batch: re-run the measure first, rewrite, re-run, then the standard checks. **A rewritten question
must still be 20–34 words with a mid-sentence blank and must still be answerable from that card's own
abstract** — the commonest way to break a question here is to cut the scholar and leave a claim the
background no longer supports. Patch extras with `add-questions.js` and the main `question` with
`fix-field.js`; an abstract rewrite goes through `add-sources.js` so the markers are re-checked.

| batch | cards | work |
|---|---|---|
| **F1** | `gr-174` `gr-176` `gr-177` `gr-178` `gr-179` | The five worst, and the ones this session wrote. Both rules: the second block of each abstract is largely *A argues / B answers* and needs replacing with what the term meant and did. Keep one dissent apiece — the hedging rules require it — and drop the rest. |
| **F2** | `gr-167` `gr-168` `gr-173` `gr-175` `gr-180` | The remaining 4–5/10 cards plus two question-only strays from the same run. Lighter: usually two sentences to re-point and one or two questions to rename. |
| **F3** | `gr-010` `gr-017` `gr-019` `gr-020` `gr-022` `gr-023` `gr-024` `gr-031` | The Evans cluster. Questions only, except `gr-023` and `gr-024`, which are also 4/10. Watch the date lines while here — part one's rule applies to the same eight cards. |
| **F4** | `gr-021` `gr-025` `gr-054` `gr-088` `gr-112` `gr-139` `gr-141` `gr-145` `gr-153` `gr-154` `gr-156` `gr-158` `gr-161` `gr-162` | Greek Bronze/Iron Age, questions only. Fourteen cards, one or two clues each; the fastest batch per card. |
| **F5** | `wh-014` `wh-025` `wh-035` `wh-037` `wh-041` `wh-042` `wh-043` `wh-046` `wh-059` `wh-061` `wh-093` `wh-094` `wh-100` | World History, questions only except `wh-061` (4/10). Holds the three eponym cases, which need the most care to keep the fact while losing the name. |

## Two things this pass must not do

- **Do not cut a hedge to lose a name.** *"which is not universally accepted"* survives losing the scholar
  who is not accepted; *"probably"* and *"scholars still disagree"* stay. Accuracy is a golden rule and
  outranks this one.
- **Do not strand a footnote marker.** A marked sentence rewritten to drop a name must still carry a claim
  the work behind that marker supports, and `add-sources.js` cannot see the difference — it checks that
  every source is referenced, not that the reference is apt. This is the L7 lesson from the glossary
  length pass, and it is the likeliest way F1 does damage.

## Batch log

### F1 — `gr-174` `gr-176` `gr-177` `gr-178` `gr-179` (2026-08-06) — SHIPPED

All five off both lists: the corpus goes from **45 cards needing revision to 40**, and from twelve cards
over the historiography bar to seven. Fifteen questions rewritten, five abstracts rebuilt, **no source
dropped and no marker stranded**.

**The material was there all along, which is the finding.** These cards were built from BMCR reviews and
had come out as reviews-of-reviews, but the reviews are full of the past — the number of phylai at Kyrene,
Korinth and Argos; Megara Hyblaia's reserved ground and its 61 hectares; the Athenian agora's wells full of
workshop waste; the six ways an archaic elite made itself recognised. Almost every historiographical
sentence had a factual one hiding inside it. `gr-179` lost three named scholars from its questions and
gained nothing but clarity; `gr-178` was rebuilt around what a genos DID — transmit a priestly office —
with the modern revision moved to the second block where it belongs.

**Two sentences got longer, not shorter.** `gr-177` and `gr-178` came in at 244 and 257 words once the
attribution was stripped, under the 270 floor, because *"Lambert argues that…"* is four words of nothing.
They were filled with more of what the same sources say — deme groups absorbing phratry cults, the Dekeleis
question, priestly office passing down among members — rather than padded.

**What the rewrite deliberately kept.** One hedge or live disagreement per card, as the golden rules
require: the phyle's origin is still "disputed", the phratry's universality still "unsettled", whether a
unified nobility existed at all still "doubted". Losing the arguer is not losing the argument.

**Tooling note:** `add-questions.js` refuses a batch without all nine translations; under the `MULTILANG`
gate these cards are English-only, so `--partial` is the correct flag and not a shortcut.

### F2 — `gr-167` `gr-168` `gr-173` `gr-175` `gr-180` (2026-08-06) — SHIPPED

All five off both lists. The corpus goes from **40 cards needing revision to 35**, and — the number worth
watching — from seven cards over the historiography bar to **three**, all of which are F3/F5 work. Seven
questions rewritten, five abstracts rebuilt, no source dropped and no marker stranded.

**F1's finding held, and one card shows why the bar is 3 rather than 5.** `gr-175` scored 3/10 and was
inside the bar, but read as *Blok makes it X, Duplouy a Y, Giangiulio a Z* — the measure undercounts here
because Blok, Duplouy and Giangiulio are contributors to an edited volume and never appear in the citation
itself, so no name reaches the list. It was rewritten anyway. **The measure sees the citation's authors, not
everyone the prose can name**, and a card that is obviously a literature review should be fixed whatever its
score says.

**`gr-168` needed no question work at all** — its three clues were already about tripods rather than about
the people who write on tripods — and only its abstract's first block had to move. Worth noting because it
is the first card in this pass where the rule bit on one half only.

**Two cards got longer again.** `gr-180` fell to 262 words with the attribution gone and was filled from the
same sources — the muscle cuirass exaggerating chest and stomach, the Chalcidaean win at Megara in 458 BCE
alongside Spartolus — rather than padded.

**Kept:** the tripod's symbolic reading with the warning against theoretical overreach still attached;
`gr-167`'s doubt about whether the feel of hand-making is recoverable from patchy evidence; `gr-175`'s
dispute over what citizenship rested on. The arguer goes, the argument stays.


### F3 — `gr-010` `gr-017` `gr-019` `gr-020` `gr-022` `gr-023` `gr-024` `gr-031` (2026-08-06) — SHIPPED

The Evans cluster, all eight off Rule 1, and with them **Rule 2 is now clear across every Ancient Greece
card** — the only card left over the historiography bar anywhere in the corpus is `wh-061`, which is F5's.
Nine questions rewritten, two abstracts rebuilt, two date lines cut.

**A cluster is cheaper than its size suggests.** Six of the eight needed nothing but the name lifting out of
one clue — "Evans found them all empty" becomes "every one was found empty", "Evans set out a signary of 135
signs" becomes "the signary runs to 135 signs" — because the sentence was already about the thing and only
its subject was wrong. Only `gr-023` and `gr-024` were *about* Evans, and they were the two the measure had
already flagged on both rules.

**The freed sentences came out of works already in each card's own list.** Rutter's lessons 14 and 15 were
re-read for this batch and carried the replacements: for the bull-leaping fresco, that bull-leaping and
bull-catching were painted flat and modelled in stucco relief at several sizes and that the Ayia Triada
boxer rhyton shows the jumper gored; for the figurines, what else the Temple Repositories held and how the
four cists were stacked. **No new source was needed and none was dropped** — which is the argument for
re-reading a card's own citations before going looking.

**Part one's date-line rule bit on the same two cards.** `Found 1901, at Knossos` and `Found 1903, at
Knossos` are the dates of the dig, not of the fresco or the figurines, and both rows are gone. The sort year
was checked before and after and does not move — the deep date wins in `cardYears` either way — but the dig
year was in the parsed list, and now it is not.

**THE BATCH FOUND A FAULT NOBODY WAS LOOKING FOR, and it is worth a measure of its own.** Reading the two
rewritten cards on the rendered page showed a clue restating a background sentence almost word for word.
Counting the longest run of words a question shares with its own abstract put `gr-023`'s shipped first
phrasing at **14 words** and one of this batch's own new clues at 11, against 6–9 for every honest one — so
a card was offering three phrasings of which one was the background quoted back, which teaches nothing the
other two don't. The line goes at **10**: a clue is *drawn* from the background by design, and some shared
phrasing is healthy; a whole sentence lifted is not. All eight of the batch's cards now measure 10 or under.
**Run the overlap count on any card whose questions are rewritten** — it is three lines of code and no other
check in the workflow can see it.

### F4 — `gr-021` `gr-025` `gr-054` `gr-088` `gr-112` `gr-139` `gr-141` `gr-145` `gr-153` `gr-154` `gr-156` `gr-158` `gr-161` `gr-162` (2026-08-06) — SHIPPED

**Rule 1 and Rule 2 are now BOTH at zero across every Ancient Greece card.** Nineteen clues rewritten, four
abstracts rebuilt, one date line cut. The corpus goes from 27 cards needing revision to 13, all of them F5's.

**The plan called this batch "questions only" and it was wrong, in two different directions.**

**Three of its abstracts are literature reviews the measure cannot see** — F2's `gr-175` finding at scale.
`gr-158` ran *Iacovou finds, Petit argues, on his reading, Kassianidou reads, Kearns takes*; `gr-161` named
Hansen, Snodgrass, Morris and Hall over six of its ten sentences; `gr-162` named Mackil, Beck, Mili and
Blome. The measure scored them 1, 2 and 3, because **a scholar named in the prose whose work is not in the
card's own source list is invisible to it** — these cards cite BMCR reviews, so the reviewer and the
reviewed author reach the name list and everyone they discuss does not. A one-line scan for *a capitalised
name before a verb of assertion* found all three in seconds and is the thing to run before planning any
batch: `gr-161` scored 7/10 on it against the measure's 2.

**And `gr-021` is a PART ONE case that part one's own measure could not see.** Four of its ten sentences
were findspot — the room, the depth, the tablet a few centimetres away, the 1900 trial trench — and its
date line read `Found 3 July 1908, at Phaistos`. Part one scores a sentence on whether it **carries a
modern year**, and a findspot description carries none, so a card whose background is a quarter excavation
report sat under the bar. Its three findspot sentences are now one, the freed slots filled from works
already in its own list (Rutter's Middle Minoan lesson for how the signs are grouped and read, the Catania
Phaistos page for the palace's two lives and its 50-hectare settlement), and the dig year is off the date
line. **Both measures score PROSE SHAPE, and a card can break the rule in a shape neither was written to
see; read a batch's abstracts before trusting either.**

**The eleven remaining cards were as cheap as the plan promised** — one clue each, the name lifted out and
the claim kept. *Ruppenstein sorted the Attic pottery into four stages* becomes *the Attic pottery sorts
into four stages*; *Barry Powell would rather call it a consonantal syllabary* becomes *it has been proposed
that it is better called one*. Nothing was lost but the attribution.

**F3's overlap count earned its keep and needs one qualification.** It caught two more prose lifts —
`gr-054`'s first clue was its own ninth sentence with the front clipped, and `gr-088`'s third was half of
sentences 8 and 9 run together — and both were rewritten. It also fired on two clues that are **fine**:
`gr-156`'s fourfold sorting of the dialects is a list of proper nouns, and `gr-088`'s "one of the oldest
complete suits of armour from the European Bronze Age" is the term's own defining clause. **A clue may
legitimately restate a name list or a definition**, so the count is enforced on a rewritten clue and
reported on a shipped one — a proxy to read, not a rule to obey.

**One fault was found only by reading the rendered page**, which is where F3 found its own. With `gr-021`'s
findspot compressed, two clauses ended up side by side saying the inscription "coils outward from the
centre" and is "read from the outside inward" — geometry and reading direction, two different facts, and
nothing on the page saying so. Reworded to spiral "between rim and centre". Neither the word count, the
marker check, the split nor the style pass can see a sentence that contradicts its neighbour.

### F5 — `wh-014` `wh-025` `wh-035` `wh-037` `wh-041` `wh-042` `wh-043` `wh-046` `wh-059` `wh-061` `wh-093` `wh-094` `wh-100` (2026-08-06) — SHIPPED

**THE PASS IS COMPLETE. `node .claude/card-focus.js` reports 0 of 269 cards needing revision** — no question
anywhere names a modern scholar, and no abstract is more than three-tenths historiography. Fifteen clues
rewritten, one abstract rebuilt, six date lines cut.

**`wh-061` is the card that could have been exempted and was not.** Its answer term is a modern construct —
its own date line names two MODELS rather than two dates — so it sits close to `wh-064` and `wh-106`, and
adding it to `EXEMPT` would have closed the batch in one line. That would have moved the bar rather than met
it. Rewritten instead, so that each block now leads with evidence and the models follow: the trait list and
what a proxy is, then the African record from 300,000 to 70,000 years ago, then Cueva de los Aviones, with
the revolution and demographic cases stated without their authors. It went from 4/10 to 0 and reads better,
because a reader now learns what the traits ARE before learning that their timing is argued.

**A TAXON'S NAMING AUTHORITY IS NOT A DIG DATE, and that line had to be drawn here.** Part one's rule is
that `Found`, `Excavated`, `Named` and `Published` belong only on a card whose subject is a modern act — and
applied literally it would strip `Named 1758, by Carl Linnaeus` off *Homo sapiens*, which is not the story of
a discovery but the species' formal name, the thing every reference work prints beside it. So the dig and
publication rows went from the SITES and the period (`wh-014`, `wh-043`, `wh-059`, `wh-093`, and the coining
of "Paleo-Indian" on `wh-100`), `wh-041` lost its `Found 2013–2014` and kept its `Named 2015`, and `wh-042`
was left alone. **The glossary pass reached the same conclusion from the other side** — L8's finding that on
a taxon the describer and year are the formal identity and stay.

**Four F5 cards were deliberately NOT touched on the date line** — `wh-025`, `wh-035`, `wh-037`, `wh-094` —
because they belong to part one's own pending H-batches, and doing them piecemeal here would leave those
batches with a record that no longer matches what they find. They still carry `Type fossil 1856`,
`Published 1860s–1870s`, `Found Mungo Lady 1968` and the rest.

**F5 IS THE FIRST BATCH TO TOUCH A CARD THAT HAS TRANSLATIONS, and the finding is worth carrying.** F1–F4
were all Ancient Greece cards, written since the `MULTILANG` gate and English-only; every F5 card carries all
nine. `add-sources.js` caught it at once — `wh-061`'s Japanese abstract has 14 markers against the new
English 13 — and the check that matters was run before deciding anything: **the highest `data-fn` in all nine
translations is 7, which is exactly the length of the source list, so not one marker is dead.** What ships is
stale prose with a stale marker arrangement, which is the accepted state of every translation under the gate,
and not the dangerous kind of stale, which is a marker pointing past the end of a list or at a work that no
longer says what the sentence claims. Left as it is, deliberately, and recorded. **The check to run after
rewriting a translated card's abstract is the MAXIMUM `data-fn` per language against the source count** — the
marker COUNT differing is expected and harmless; a marker running past the end is not.

**One clue lost a claim rather than a name.** `wh-094`'s second phrasing called the Lake Mungo woman "the
oldest known cremation anywhere" while the card's own seventh sentence says the burning is incomplete, no
pyre survives, and specialists now hedge that word. It now says "the earliest burnt human remains on record",
which is what the background states plainly. **A clue must not assert what its own background withholds** —
the mirror of F1's guardrail about not cutting a hedge to lose a name.
