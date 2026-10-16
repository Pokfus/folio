# The course-collections refinement audit (Oct 2026)

Three collections in the **Special** section are university courses, not subject shelves: **Politics: East
Asia** (`pea-`, 220 cards), **The EU as an External Power** (`eep-`, 292) and **Gateway to Global Affairs**
(`gga-`, 297). This is the pass that audits and refines all 809 cards, in batches of ten in plan order, to the
settled rules of the Ancient Greece audit (`docs/greece-refinement-audit.md`, "The rules"), which apply here
unchanged **except where this file says otherwise**. The World History and Rome audits supplied the harness
(`.claude/wh-refine/`, run with `REFINE_PREFIX=<prefix>`); the mechanical checks are `greece-audit.js` run with
a course config. About 100 cards a session.

What is mechanical is measured; what only a reader can judge (a claim against its source, a picture against
its subject, a question against its siblings) is read by eye and recorded in the **ledger** at the foot of this
file, batch by batch, so a later session can tell a card that was read from one that merely passed a checker.

## What differs from Greece

1. **The cards come from a course, not from the subject.** Each deck is a lecture or a set reading; the
   answer terms and the load-bearing facts come from the supplied slides and readings. The slides are **not in
   the repository**, so a card's current text is the only trace of what the lecture said. The audit therefore:
   keeps every answer term and every deck's focus; re-researches every claim from outside sources; and
   **where the record differs from what the card (so the lecture) says, gives both and says whose claim is
   whose.** A claim that only the lecture or reading makes is attributed to it ("according to the lecture…",
   "on one influential reading…") or dropped, and the ledger says which. Every such place is listed under
   `SLIDE-VS-RECORD` in the batch's ledger entry and in the PR, for the owner to decide.
2. **The source bar is not blindly Greece's.** Greece: tiered by difficulty (1 → 9 … 5 → 5), at least half
   modern scholarship. Here:

   | collection | bar | cited as |
   |---|---|---|
   | `pea-` | **the site-wide tiered bar** (`srcTargetFor`: difficulty 1 → 9 … 5 → 5), at least half modern scholarship. *Reading:* the plan names no bar of its own beyond "five citations a card, mostly open access", which predates the tiered bar; `add-card.js` has no exemption for `pea-`, so a `--replace` is held to the tiered bar, and the audit applies it. No slides can be cited (they are not public and not in the repository), so every source is an outside, openable URL. | outside scholarship, official texts, think tanks |
   | `eep-` | the tiered bar holds. A `[Course material]` entry counts as one source; at least four outside sources, mostly open access. | scholarship + the course |
   | `gga-001`–`gga-056` | outside scholarship, the tiered bar (the plan's first mode). | outside scholarship |
   | `gga-057` onward | **course texts only**, bar of 2 (`SRC_TARGET_BY_PREFIX`), each cited at a distinct slide or page and ending ` [Course material]`. **Never replaced with outside scholarship.** Audited for faithfulness to the slides and readings and for the ten-sentence background where the plan requires it. | the course |

   Where a bar is unclear, the ledger records the reading taken and the card keeps its current bar.
3. **Chronology** is `docs/course-chronology.md`, created for the dates the cards print: treaties, summits,
   votes, laws and dated events, with a `chronology-pins` block that `greece-audit.js` reads. There is no
   subject chronology (no BCE); the 2026 events (the Iran war, the closure of the Strait of Hormuz, the 2026
   NATO summit) are cited as the supplied text reports them, with a dated primary or news source.
4. **No answer term appears twice in a collection**, and **a guest speaker is never carded as a person** (the
   slides are carded for what they say).
5. **Generic government terms are the date trap.** A Cabinet, a Premier, a Presidency, a Supreme Court, an
   Emperor has no start worth a date line: the line is empty and the card is `"undatable": true`, wherever the
   term has no pinned start. A body with a documented start (a law, a congress, a founding) is dated.
6. **Plan lines are subjects to research, not facts.** If research says a line is wrong, the line is retitled in
   the same commit.

## The rules, as applied to the courses

The Greece rules for decisions, consistency, Think-it-through, questions, date lines, images, citations and
the glossary stand. Settled for this run (apply, do not re-argue):

- **Background**: 10 sentences in 2 groups of 5, **270–285 words**, mean sentence length ≤ 28.5, a
  15-year-old's register, no modern scholar named in the prose, figures as numerals, **centuries as numerals**
  ("20th century", not "twentieth"), the answer in `<b>` in sentence 1, an explicit marker on every sentence.
- **Questions**: 20–34 words, no year or figure that reads as a date, blank mid-sentence, never opening on a
  pronoun, each fitting only its own card — checked against the collection's index **and the sibling cards of
  the other two courses**.
- **Think-it-through**: 3 FAQs, 12–60 words, an explicit marker on every claim, not opening "Because", not
  restating the background.
- **Date line**: ≤ 4 rows, dates only, label ≤ 16 characters, never an estimated span.
- **Citations**: every URL curled (200), `check-citations.js --card` clean, names read off the work's own page,
  one source per non-English language with its chip.
- **Pictures**: a standard thumbnail only (the largest of 1920, 1280 or 960 px that does not exceed the file's
  width; host `thumb.wikimedia.org`; no `?utm_`), a visual alt, a description of exactly what is shown, a credit
  "Author, LICENCE, via Wikimedia Commons. <file page URL>". `check-image-free.js` first; every candidate looked
  at; labels, signs, captions and crops refused. **A politics card often has no honest picture: "no picture" is
  a fine answer, and a wrong one is not.**
- **Auto-links**: a bare name that opens the wrong glossary key is wrapped in `<span class="ans-term">…</span>`
  or hand-keyed; every card is checked with a link lister (it prints each surface and the key it opens).
- **Writing**: `node .claude/add-card.js <patch.json> --replace --no-image --no-wiki`, then a second
  `--replace` with the picture. Wikipedia links are corrected by hand in `.claude/wiki-links.json`
  (`"manual": true`) and `apply-wiki-links.js` run.

## Method (what worked, what did not)

- The harness is `.claude/wh-refine/` (BRIEF, STEPS, `prep.js`, `precheck.js`, `apply.js`); this audit's
  scratch copies and wrappers live outside the repo (nothing here ships). A drafting agent takes five cards,
  saves every source page as text, writes verbatim quotes, and runs `precheck.js` until it prints OK; the
  session reads every draft with its links before applying.
- The picture pass is the bottleneck and starts as soon as the first batches are drafted. **Wikimedia's
  action API rate-limits the shared address within minutes**, so pictures are found through the Commons WEB
  pages (`index.php?search=…&ns6=1&fulltext=1`, the `File:` page) through ONE shared queue at ≥ 6 s a
  request; nothing else talks to Wikimedia. `add-locators.js` and `find-wiki-links.js` give up when it is
  busy; retry later, and if a coordinate cannot be fetched read `wgCoordinates` from the article page and
  write it through `add-card.js`.
- After about 30 cards: the range audit, `check-questions`, `check-style` (diffed against main's output),
  `check-cards --prefix`, `check-docs`, `split-cards --check`, `test-card-plans`, `check-gloss-links --card`,
  `check-citations --card`, and every thumbnail answering 200.

## Ledger

Each entry: the range, what was read, what was corrected, the `SLIDE-VS-RECORD` places, the open items.

