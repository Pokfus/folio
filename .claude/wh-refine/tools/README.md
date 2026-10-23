# Batch tools (added after wh-701–800)

All read `WH_S` (the scratch directory outside the repo) and run from the repo root. None writes a card; the
repo is only written by `apply.js`/`batch.sh`, `splice.js` and the doc edits.

- `skim.js <id>…` — the old card's date line and the head of its abstract, to brief an agent.
- `review.js <id>…` — read the drafts: per card the three questions with word counts and flags (numerals,
  ending on the blank, a leading pronoun, a compound number-word, the answer's own word in the clue — a
  hit on a substring such as "slave" in "enslaved" or on a year is a false alarm), the date rows, the
  abstract's head, its word count and mean sentence length, stray full stops around markers, the three
  Think-it-through answers' tails, the glossary head, notes.
- `full.js <id>…` — the whole abstract, the why answers, sources and glossary of a draft, markers as `[N]`.
- `ed.js <id> <path> <old> <new>` — replace text in a draft that occurs exactly once (`patch.question`,
  `patch.questions.0`, `patch.questions.1`, `patch.abstract`, `patch.why.1.a`, `patch.sources.1`,
  `glossary.description`). Index the two extra phrasings as `questions.0` and `questions.1`, never `question`.
- `fixpunct.js [id…]` — repair `.<sup>…</sup>.` and `x<sup>…</sup>.` (a full stop after the markers as well as
  before them) in every draft; run it before `batch.sh`. Precheck does not catch it.
- `rows.js <notes.tsv>` — the ledger table from `wh-NNN<TAB>the main changes` lines (bar and sources
  old → new are read from the drafts).
- `splice.js <sections> <Bnn> <first> <last>` — insert a `@@LEDGER`, `@@CHRON`, `@@PICS` file into
  `docs/wh-refinement-audit.md` and `docs/wh-chronology.md`, take the pins from `$WH_S/out/*.json`, mark the
  batch done. It inserts the ledger before "### The six unwritten locators"; batches applied out of order
  need the entries moved into order by hand.
