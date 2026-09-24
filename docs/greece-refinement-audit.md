# The Ancient Greece refinement audit — the brief, refined

The Ancient Greece collection (`col-13`) closed at 1,000 cards in Sep 2026. This file is the brief for
auditing and refining all of it, written BEFORE the work starts: the request as given, tightened into
rules that can be checked, the measured state of the collection against each rule, the places where
the request collides with a house rule already in `CLAUDE.md`, and the batch plan.

It supersedes nothing in `docs/greece-audit-2026-09.md`, which audited the first 500 cards and holds
the re-sourcing log and the host reachability survey. **Read that file's "What is still open" and
"Coverage" sections too — its open items 2–7 are folded into this brief below, not repeated.**

**The figures below were measured on 2026-09-24 and are a BASELINE, not a standing.** Re-run the
commands rather than quoting them once work has started.

---

## 1. The baseline, measured

| rule | measured | how |
|---|---|---|
| Cards | 1,000 (`gr-001`–`gr-1000`) | |
| Think-it-through set of three | 1,000 of 1,000 | `node .claude/why-count.js` |
| …answers that copy the background | 397 answers ≥75% of their 4-grams from the abstract, 691 more at 50–75%; **371 cards have two or more answers at ≥50%** | 4-gram overlap, answer against abstract |
| …answers carrying a citation marker | **0 of 3,000** | grep `data-fn` in `why[].a` |
| …answers carrying glossary links | automatic — `processAbstract` runs a second `autoLinkGlossary` pass over `.elab-a` | see §3.D1 |
| Questions naming a date or century | **342 phrasings on 296 cards** | regex over `question` + `questions` |
| Question house rules (length, one sentence, mid blank) | all pass | `node .claude/check-questions.js` |
| Missing-article candidates before the blank (era / state / culture / people / event kinds) | 45 phrasings — **mostly false positives** (Lacedaemon, helots, Keftiu take no article); a READING list, not a count of faults | preposition directly before `_____` |
| Backgrounds 10 sentences, 5 + 5, 270–330 words | all pass | `node .claude/card-length.js` |
| Date line empty | 18 | |
| Person cards (tag 1 = `person`) | 197, **none** carrying Born + Died + a flourishing row together; many are mythical or Homeric (`In Homer`) and must be excluded | label histogram of `answerDate` |
| Pictures | 792 cards (208 with none — `check-cards.js` note) | |
| …shape | of 744 resolved on Commons: 230 portrait, 77 square, 205 ≈4:3, 195 ≈16:9, 37 wider | Commons `imageinfo` size |
| …licence | all 744 PD / CC0 / CC BY / CC BY-SA — nothing NC or ND | Commons `extmetadata` |
| …one picture on two cards | 1 pair: `gr-598` / `gr-950` | `node .claude/check-cards.js --prefix=gr-` |
| …caption still naming its source | 4 (`gr-327`, `gr-328`, `gr-342`, `gr-915`) plus raw-metadata captions the regex cannot see (`gr-001` is "Illustration from page 95 of *The outline of history*…") | |
| Sources per card | 742 at 5, 179 at 6, 56 at 7, 17 at 8, 5 at 9, 1 at 10 | |
| …against the new tiered bar (§2.8) | **737 cards under, 1,403 citations short** | difficulty → target |
| …difficulty spread | 1: 86 · 2: 145 · 3: 306 · 4: 303 · 5: 160 | |
| Modern author in >2 sources | 0 (`check-cards.js` rule 1) | |
| Ancient author in >2 sources | ~35 cards (Homer on the epic cards, Diodorus, Polybius, Hesiod…) plus 235 `one-witness` notes | `check-cards.js --report` |
| Non-English citations with a `[in <Language>]` chip | **0** — against ~168 citations whose title is plainly French, German, Italian or Greek | grep `\[in ` |
| Question names a researcher / historiography over 3 of 10 | 0 / 0 | `node .claude/card-focus.js --prefix=gr-` |
| Locators | 290 (246 point, 21 region, 21 battle, 1 river, 1 sea); war blocks 11 | |
| …place-kind cards with no locator | 74 (28 place, 32 building, 9 city, 5 battle) | tag 1 against `locator` |

---

## 2. The refined rules

Each rule is written so a batch can be checked against it. Where a checker exists it is named; where
the rule needs reading, it says so.

### 2.1 Consistency across the collection

- **One chronology.** Before the first card batch, write the dates the collection COMMITS to —
  period brackets, destructions, reigns, battles, the Thera eruption — into a table (§5, batch 0).
  Every date line and every date in prose is then checked against the table, and a card that must
  differ says why in its own prose (a genuinely disputed date is given as a range with whose it is).
  The known collision: the Cretan palatial brackets (Rutter's scheme against Warren's), recorded in
  `docs/greece-audit-2026-09.md`'s R1 finding.
- **One spelling of each name**, the house form being the collection's own majority form (Knossos not
  Cnossus, Pisistratus or Peisistratos — pick and record). Record the choices in the same table.
- **No card contradicts another.** A fact stated on two cards (a battle's year, a death, a count) is
  stated the same way on both; the chronology table is how this is found rather than remembered.

### 2.2 Think it through

- **Three questions, as FAQ** — the first things a reader new to the term would ask ("What did a
  helot actually do all day?", "Did the Spartans really throw weak babies off a cliff?"), not the
  seams of the background. **They need not begin with Why**; `card-links.js` requires only a question
  mark and 4–24 words.
- **The answer is written separately, not lifted.** Measured as 4-gram overlap with the abstract:
  **aim under 25%, refuse at 50%.** An answer may repeat one fact the background states where the
  question needs it; it may not restate the background's sentence.
- **Every factual claim in an answer carries a marker** into the card's own source list, written
  with an explicit number — `<sup class="fn" data-fn="3"></sup>` — never bare: a bare marker takes the
  next number in reading order, and the block sits ABOVE the background, so it would steal the
  background's numbering. A source added for an answer is added to the card's list like any other.
- **Glossary links are automatic** and need no markup; a hand-written `data-k` only where the surface
  differs from the term's key or alias.
- **Stay inside 12–60 words per answer** (`card-links.js`), footnote markers not counting.
- **The three ask about three different things**, and none asks something the card's QUESTION side
  already answers.

### 2.3 Questions

- **The concept whole, not one aspect.** Each of the three phrasings identifies the term by what it
  essentially IS, from a different angle; a phrasing built on one curiosity (a find-spot, a single
  object) is replaced. `docs/greece-audit-2026-09.md` open item 7 lists the ones already found.
- **Never confusable with another card.** Read each phrasing against the siblings the plan puts
  nearby (the three Messenian Wars, the two Peloponnesian Wars, Laconia/Lacedaemon, the palaces); if
  another card's answer would fit the blank, the phrasing is rewritten.
- **The article.** Read every phrasing back with the answer term in place of the blank. Where the
  term needs one, the question supplies it in front of the blank ("in the _____" for a period, a
  state or a culture). The answer term itself never carries it (`add-card.js` enforces that half).
  **No checker can see this**; §1's 45 candidates are a starting list, not the set.
- **No dates in a question.** Defined as: no year, no century, no millennium and no numbered decade
  in any of the three phrasings. **Period names are not dates** ("the Neopalatial period", "the
  Archaic age" stay). The date goes to the date line, and the phrasing finds another identifying
  fact. Still 20–34 words (`check-questions.js`).

### 2.4 Date line

- **Start and end, as complete as the sources allow.** A state, period, war, building or practice
  gets both ends (`Built`/`Destroyed`, `In use`, `Ruled`); `from c. 1900 BCE` with no end is a gap to
  fill or to state as open ("in use to the Roman period").
- **A historical person gets Born, Died and one row for what they are known for** (`Flourished`,
  `Archon`, `Reigned`, `Strategos`), within `date-line.js`'s limits (4 rows, labels ≤ 16 characters).
  A date no source gives is **omitted, never estimated**; "c." is used only where a source uses it.
  **A mythical or Homeric figure takes no life dates** — its line dates the TEXT or the CULT that
  attests it, as the `In Homer` rows already do.
- **The line and the prose agree.** Any date on the line that the background also states is the same
  date; checked mechanically (years extracted from both) and read where they differ.
- **Read the sort year back** against `cardYears` after writing a line — the Russia plan's rule, and
  the CE-under-1000 and `c.`-inside-a-range traps in `CLAUDE.md` apply here too.

### 2.5 Pictures

- **The picture depicts the answer term as a whole** — a site card shows the site, not one fresco from
  it (`gr-008` Knossos currently shows the throne-room fresco, which is `gr-010`'s subject); an island
  card shows the island (`gr-004` Keros shows a figurine). Where the term is abstract, a picture of a
  thing that embodies it, captioned as such; where nothing honest exists, no picture, recorded.
- **Shape: landscape preferred for places, sites, battles and events; an object in its own natural
  shape.** The card frame is NOT 16:9 — `.card-imgslot` shows the whole picture at up to 280px tall
  with `object-fit:contain` — so a portrait statue is shown whole and narrow, never cropped. Cropping a
  file to force 16:9 is not allowed; choose another file instead.
- **A photograph beats a drawing, a plan or a map** unless the thing no longer exists to be
  photographed or the drawing is the evidence (a reconstruction captioned as one).
- **Licence: PD, CC0, CC BY, CC BY-SA only**; no watermark, no burned-in caption. Watermarks cannot be
  detected mechanically — every candidate goes through `.claude/contact-sheet.py` and is looked at.
- **The description says exactly what the picture shows** — object, material, place, date where known
  — and **never its source, photographer, licence, museum number or file name**; those are the
  credit's.
- **No picture on two cards** (`check-cards.js`), and check a candidate with
  `node .claude/check-image-free.js` BEFORE fetching.

### 2.6 Background

- **5 + 5 sentences, 270–330 words** (`add-card.js`, `card-length.js`).
- **Register (see §3.D2):** understandable by a 15-year-old new to the topic. Every specialist word
  is explained on first use, in the sentence, not in brackets; no sentence depends on a term the card
  has not explained or linked.
- **Complete, not one-sided.** Compare the card against the Wikipedia article on the term as a
  CHECKLIST of what a general account covers — what it was, where, when, who, why it mattered, what
  became of it, and how we know. A significant fact missing from the card is researched from real
  scholarship and added with its marker. **Wikipedia is never cited.** Because the word band is fixed,
  adding coverage means cutting the card's least essential sentence — usually a second example or a
  detail of excavation history (`card-focus.js` rule 2 still binds).
- **Consistent with other cards** (§2.1).

### 2.7 Atlas

- **The point is right**: the coordinate is FETCHED through `add-locators.js` from a named article or
  Wikidata item, never typed; re-fetch any point that looks off.
- **A region's edge.** The sea-side edge of a `region` wash is already clipped to the land
  (`landMask`), and the Greece frame splices in a hi-res coast (`coast/greece.js`), so coastline
  accuracy comes free; what can be improved is the INLAND boundary and vertex density. Split a
  region that is really two blocks into two rings (`;`), and leave a gap rather than an overlap where
  a frontier is uncertain.
- **A card with no locator:** ask "is there somewhere a reader could stand?" (the `locator` bullet in
  `CLAUDE.md`). §1 lists 74 place-kind cards without one; battles take `kind: "battle"`.
- **A war takes a `war` block only if it was decided** — `docs/war-cards.md` lists the Greek wars
  already refused (Lelantine, Archidamian, Corinthian, Third Sacred) and why; do not undo a refusal.

### 2.8 Citations

- **Real, and really saying it.** Every citation opens (curl, 200 or a DOI 302); every author and
  year agrees with Crossref (`node .claude/check-citations.js --card=<id>`); the locator (page,
  section, book.chapter) is one that exists in the work; **the claim its marker carries is on that
  page**. Author names are read off the work's own metadata page, never expanded from initials.
- **Author cap: two sources per card for a modern author** (`check-cards.js` rule 1). For ancient
  authors see §3.D4.
- **Language.** English first; at most ONE source per non-English language per card; **every
  non-English source carries its chip**: `… URL. [in French]` — the marker must come from
  `SRC_LANG_NAMES` (`add-sources.js` refuses anything else).
- **The tiered bar** — difficulty 1: 9 sources · 2: 8 · 3: 7 · 4: 6 · 5: 5. Every source is pointed at
  by at least one marker. See §3.D3 for what this costs.

---

## 3. Where the request collides with a house rule — decide these first

These are the decisions that must be settled before batch 1, because each changes how every card is
written. The recommendation is given; the call is the owner's.

**D1. Think-it-through answers may now go beyond the card's prose.** `CLAUDE.md` and
`docs/why-questions-plan.md` say an answer "says what the card's own cited prose says". The request
asks for FAQ answered separately. *Recommend:* allow it, on the condition in §2.2 — every claim
marked into the card's source list. **Two tool changes are then needed**, or the tools will refuse
the work or pass a broken marker: `add-card-links.js` must check each answer's markers point inside
the card's `sources`; and `add-sources.js`'s "every source is referenced" rule must count markers in
`why[].a`, not only the abstract, or a source added for an answer is refused.

**D2. Reading level.** `CLAUDE.md` sets "a bright 17-year-old", upper-secondary vocabulary, with
*sedentary*, *hierarchy*, *reciprocity* used without apology. The request says "a 15-year-old new to
the topic". *Recommend:* adopt it for this collection as "explain every specialist term on first use,
average sentence ≤ 25 words", keep the 270–330 band, and decide separately whether it becomes the
site-wide rule (then `CLAUDE.md`'s style section changes).

**D3. The tiered source bar costs 1,403 citations.** 737 of 1,000 cards are under it; a level-1 card
needs 9 sources inside ten sentences and three answers. That is the single largest cost in this
audit — larger than the FAQ rewrite. *Recommend:* keep it, encode it as `GREECE_SRC_TIERS` in the
audit script (§4), and do not change the site-wide `SRC_TARGET` (5), which the coverage chips and
other collections read. Alternative if the cost is too high: 7 / 7 / 6 / 6 / 5.

**D4. Ancient authors and the two-source cap.** The request caps every author at two. A card on the
*Iliad* citing three passages of the *Iliad* is the primary-source case the cap was never meant for
(`check-cards.js` counts ancient authors separately for this reason); ~35 cards are over. *Recommend:*
modern authors hard cap 2; an ancient author is capped at 2 **unless the card's subject is that author
or that work**, where 3 is allowed; and every card carries at least half its sources from modern
scholarship.

**D5. "No dates in questions" and the confusability rule pull against each other.** A date is often
the one fact that separates two siblings (the Messenian Wars). *Recommend:* keep the ban — separate
siblings by who, where and what instead — and define "date" as §2.3 does, so period names survive.

**D6. The existing Greece rules stay.** No modern scholar in a question; historiography ≤ 3 of 10;
history, not archaeology (`docs/history-focus-plan.md`). The coverage rule (§2.6) must not become a
licence to add excavation history.

---

## 4. Batch 0 — tooling, before any card is touched

1. **`node .claude/greece-audit.js [--card=<id>] [--range=gr-001:gr-010] [--summary]`** — one report
   per card against every mechanical rule above: dates in phrasings, article candidates, date-line
   completeness (both ends; Born/Died/role on a historical person), line-vs-prose year agreement, FAQ
   overlap with the abstract and markers per answer, source-tier deficit, author cap (sliced out of
   `check-cards.js` by text, stopping if the slice fails), missing language chip (a DECLARED list of
   foreign journal and series titles, not a guess), caption-names-its-source, picture shape (from a
   cached Commons size table), place-kind card with no locator, and disagreement with the chronology
   table. Report-only, exits 0; `--summary` prints the whole-collection standing, which is how
   progress is tracked instead of quoted.
2. **The two tool changes in D1**, with a test that a marker inside `.elab-a` is numbered against the
   card's source list and survives `wireFootnotes`.
3. **`docs/greece-chronology.md`** — the collection's committed dates and name spellings (§2.1),
   extracted from the date lines first and then settled by reading where cards disagree.
4. **A batch ledger** at the foot of this file: batch, cards, date, what changed, what was refused.

---

## 5. The batches

**Two phases, because some fixes are cheaper collection-wide and most are not.**

### Phase A — collection-wide sweeps (4 batches, mechanical, each checkable in one run)

| batch | what | size |
|---|---|---|
| A1 | Language chips on every non-English citation; the one duplicate picture (`gr-598`/`gr-950`); the four captions naming their source | ~168 citations, 5 cards |
| A2 | Glossary backlog — the terms listed in `docs/greece-audit-2026-09.md` ("Terms worth adding"), starting with *Constitution of the Athenians* (38 cards), *terracotta*, *libation*, *mina*, *stoa*, *drachma*, *obol*; cited at `GLOSS_SRC_TARGET`, grep keys and aliases first | ~15 terms per batch; A2 may repeat |
| A3 | The chronology table (§4.3) reconciled: every date line in the collection checked against it; conflicting lines fixed | 1,000 lines, reading only the conflicts |
| A4 | Locators for the place-kind cards that have none (74) | fetched, not typed |

### Phase B — the card-by-card pass (about 103 batches of up to 10)

Everything that needs the card READ: the FAQ rewrite, the question review, dates out of questions,
articles, the date line, the picture, the background's coverage and register, and the source
top-up. **Ten cards is the right size**: at ~1.4 new citations, three new cited answers and a
coverage check per card, a batch is 15–20 new citations to find, open and verify.

Run in the plan's own order, deck by deck, so sibling cards are compared inside one batch and the
chronology table is extended as each deck opens:

| batches | deck | cards |
|---|---|---|
| B1–B6 | Crete and the Cyclades | gr-001–055 |
| B7–B12 | Mycenaean Greece | gr-056–110 |
| B13–B18 | Early Iron Age | gr-111–170 |
| B19–B24 | Polis and colonisation | gr-171–230 |
| B25–B29 | Sparta | gr-231–275 |
| B30–B34 | Athens | gr-276–320 (the deck that paraphrases Aristotle — open item 3) |
| B35–B40 | Archaic art, verse and thought | gr-321–380 |
| B41–B47 | Persian Wars | gr-381–450 |
| B48–B52 | Athenian Empire | gr-451–500 |
| B53–~B103 | the second 500, deck by deck per `docs/greece-card-plan.md` | gr-501–1000 |

A deck's last batch may be short rather than spill into the next deck, which is why the count is
about 103 rather than 100.

**Batch 1 is `gr-001`–`gr-010`**: the Aegean Bronze Age, the Cyclades, Keros, Early Minoan Crete, the
Minoan civilisation, Evans, Knossos, the palace and the Throne Room. What a first read already shows:
`gr-001`'s picture is an H. G. Wells book illustration captioned with its bibliographic record;
`gr-004` Keros shows a figurine rather than the island; `gr-008` Knossos shows the throne-room fresco,
which is `gr-010`'s subject; `gr-009`'s picture is a printed plan whose caption is the scan's metadata;
seven of the ten carry a date in a question; `gr-008`'s date line has no end; `gr-001`'s second answer
contains a modern scholar's name and date range but no marker.

### The procedure for each Phase B batch

1. `node .claude/greece-audit.js --range=<first>:<last>` — the mechanical findings.
2. Read the ten cards side by side with their siblings and the chronology table.
3. Per card, in this order (each step has its own writer — `fix-field.js` / `add-questions.js` for
   questions, `set-date-line.js`, `add-images.js`, `add-sources.js`, `add-card-links.js`,
   `add-locators.js`): questions → date line → background coverage and register → sources to the
   tier → FAQ → picture → locator.
4. `check-citations.js --card=<id>`, `check-cards.js --prefix=gr-`, `check-questions.js`,
   `card-length.js`, `check-style.js`, `check-gloss-links.js --card=<id>`, and
   `node .claude/greece-audit.js --range=…` again — the batch is done when it reads clean or every
   remaining finding is DECLARED with its reason in the ledger.
5. Glossary terms the batch surfaced go to the A2 list, not into the batch.
6. One changelog line for the day (count + deck, never card names), the version bumped with it.

---

## 6. What cannot be checked, and must be read

A checker's zero is a statement about what it reads. These have no checker: whether an answer is the
question a newcomer actually asks; whether a picture depicts the whole term; whether a phrasing could
be answered by another card; the article before the blank; whether a background leaves out something
important; whether a source's page carries the claim. Each batch's ledger entry says which of these
were read, card by card.

---

## Batch ledger

*(empty — batch 0 not started)*
