# The Ancient Greece refinement audit (Sep 2026)

The whole Ancient Greece collection (`col-13`, `gr-001`–`gr-1000`) is complete, and this is the pass that
audits and refines ALL of it, in small batches, to one set of rules. It follows the 500-card audit in
`docs/greece-audit-2026-09.md`, which fixed the collection's formatting and pictures and cleared the
Rutter concentration; this pass goes card by card through every field.

**The rules below are settled decisions, on request, and are applied rather than re-argued.** What is
mechanical is measured by `node .claude/greece-audit.js` (report-only; `--range=gr-001:gr-010`,
`--card=`, `--summary`); what only a reader can judge is read by eye and recorded in the ledger at the
foot of this file, batch by batch, so a later session can tell a card that was read from one that merely
passed a checker.

## The rules

### Decisions

- **A Think-it-through answer may go beyond the background**, but every factual claim in it carries a
  citation marker into the card's OWN source list.
- **Register: a 15-year-old new to the topic.** (This will eventually apply to the whole site.)
- **The source bar is tiered by difficulty**: level 1 → 9 sources, 2 → 8, 3 → 7, 4 → 6, 5 → 5. This is
  site-wide — `SRC_TARGET_BY_DIFFICULTY` in app.js, sliced by `.claude/src-target.js`, so the Edit page's
  chip, `add-card.js` (which refuses a new card under its bar), `add-sources.js`, `source-audit.js`,
  `drop-candidates.js` and `mark-sources-blocked.js` all measure the same bar.
- **Author cap**: a modern author appears in at most 2 sources on a card; an ancient author in at most 2,
  or 3 where the card's subject IS that author or work. **At least half of each card's sources are modern
  scholarship.**
- **No dates in a question.** Siblings are told apart by who, where and what.
- **The existing Greece rules stand**: no modern scholar named in a question, historiography ≤ 3 of 10
  sentences, history not archaeology.

### Consistency

- `docs/greece-chronology.md` holds the dates and spellings the collection commits to. Every date line and
  every date in prose agrees with it; a genuinely disputed date is a range, saying whose it is.
- No card contradicts another on any fact.

### Think it through (every card)

- Exactly three questions: the FAQ a newcomer would actually ask, usually opening "Why".
- Written separately from the background, not paraphrased: answer-vs-abstract 4-gram overlap aims under
  25% and is a fault at 50% or more.
- The three ask about different things, and none asks what the card's own question already answers.
- Each answer 12–60 words.
- Factual claims carry markers with an EXPLICIT number, `<sup class="fn" data-fn="N"></sup>` — never a bare
  marker, which `wireFootnotes` would number ahead of the abstract's (the block sits above the Background).
  A source added for an answer goes in the card's list like any other. `card-links.js` refuses a bare or
  out-of-range marker; `.claude/test-why-markers.js` proves the numbering survives in a real DOM.
- Glossary links are automatic; hand-write `data-k` only where the surface differs from every key and alias.

### Questions (all three phrasings)

- Broad enough to target the whole concept, concrete enough never to fit another card — each checked
  against its siblings.
- Articles: read every phrasing back with the answer in place of the blank; where the term needs "the"
  (periods, states, cultures, wars) the question supplies it. The answer term itself never carries one.
- No year, century, millennium or decade. Period names are allowed.
- One sentence, 20–34 words, blank mid-sentence (`check-questions.js`).

### Date line

- Start and end as completely as the sources allow; an open end is stated as open.
- A historical person: Born, Died, and one or two rows between for what they are known for.
- A mythical or Homeric figure takes no life dates; the line dates the text or cult that attests them.
- A date no source gives is omitted, never estimated. ≤ 4 rows, labels ≤ 16 characters (`date-line.js`).
- Line and background agree. The sort year is read back against `cardYears`; every date under 1000 carries
  its era, and no `c.` sits inside a range.

### Images

- The picture depicts the answer term as a whole; landscape for places, sites and events; objects keep
  their natural shape; never crop — choose another file.
- A real photograph beats a drawing, plan or map unless the thing no longer exists or the drawing is itself
  the evidence.
- PD, CC0, CC BY or CC BY-SA only; no watermark or burned-in text; every candidate looked at on a contact
  sheet (`.claude/contact-sheet.py`).
- The description says exactly what is shown and never names the source, photographer, licence, museum
  number or file name — those belong in the credit.
- No picture on two cards (`check-image-free.js` before fetching). `src` copied from the Commons API.

### Background

- 10 sentences, 5 + 5; 270–330 words (imperial conversions and punctuation do not count).
- Understandable by a 15-year-old new to the topic; mean ≤ 25 words a sentence.
- Complete: the term's Wikipedia article is a CHECKLIST of what a general account covers (what, where,
  when, who, why it mattered, what became of it, how we know). A significant missing fact is added from
  real scholarship, with its marker — never citing Wikipedia — by cutting the weakest sentence.

### Atlas

- Coordinates fetched with `add-locators.js`, never typed. Regions: better inland and sea edges; a
  two-block region is two rings; a gap rather than an overlap where a frontier is uncertain.
- Place, building, city and battle cards with no locator get one where there is somewhere to stand.

### Citations

- Every citation is real, its URL opens (curled), and the page or section it names carries the claim its
  marker points at. DOIs real; author names and titles read off the work's own metadata
  (`check-citations.js --card=<id>`).
- English first; at most one source per non-English language per card, each ending in its chip.
- The tiered bar is met, and every source is pointed at by at least one marker.

### Glossary

- The "Terms worth adding" list in `docs/greece-audit-2026-09.md` is extended as batches go, ranked by
  how many cards use each term. Before adding a term, grep the existing keys AND aliases —
  `add-glossary.js` overwrites in silence.

## The tools (Batch 0)

| tool | what it does |
|---|---|
| `.claude/greece-audit.js` | report-only per-card check of every mechanical rule above |
| `.claude/src-target.js` | the tiered bar, sliced out of app.js for every helper |
| `.claude/card-links.js` `checkWhyMarkers` | an answer's markers are explicit and have an entry behind them; enforced by `add-card-links.js`, `add-card.js` and `add-sources.js` |
| `.claude/add-sources.js` | counts a Think-it-through answer's markers as references, and takes the new `why` in the same batch as the list its markers point into |
| `.claude/add-card.js --replace` | a PATCH over a shipped card, the merged card then held to every rule a new card is — the one writer for a card refined end to end |
| `.claude/test-why-markers.js` | answer markers survive `wireFootnotes` without shifting the abstract's (Playwright) |
| `docs/greece-chronology.md` | the dates and spellings, with a `chronology-pins` block `greece-audit.js` checks |

**The baseline, measured before any batch** (`node .claude/greece-audit.js --summary`, 2026-09-24):

```
greece-audit: 1000 card(s), 0 with no finding
  B.sentence-length 1000 card(s)
  D.c-in-range      5 card(s)
  D.era             70 card(s)
  D.label           33 card(s)
  D.not-a-date      387 card(s)
  D.not-in-prose    703 card(s)
  D.pin             3 card(s)
  I.caption-source  3 card(s)
  I.duplicate       7 card(s)
  I.none            208 card(s)
  L.missing         74 card(s)
  Q.date            397 card(s)
  Q.sibling         102 card(s)
  S.ancient-cap     236 card(s)
  S.bar             737 card(s)
  S.chip?           100 card(s)
  S.modern-cap      3 card(s)
  S.modern-half     579 card(s)
  W.no-marker       1000 card(s)
  W.overlap         597 card(s)
  W.overlap-high    491 card(s)
```

Three of those figures are the new rules arriving rather than faults found: `W.no-marker` (no answer was
marked before the rule existed), `S.bar` (the bar rose from a flat 5), and `B.sentence-length` (the house
register was ~30 words a sentence). `D.not-a-date` is a real finding and a sizeable one — 387 date lines
carry a row stating a fact ("1 god, Heracles", "eight years after Salamis") rather than a date.

## The batches

### Phase A — collection-wide sweeps

| batch | what | state |
|---|---|---|
| A1 | language chips on non-English sources; the duplicate picture `gr-598`/`gr-950`; captions naming their source | open |
| A2 | glossary backlog, starting with *Constitution of the Athenians* | open |
| A3 | date lines reconciled against `docs/greece-chronology.md` | open |
| A4 | missing locators | open |

### Phase B — card by card, up to 10 per batch, deck by deck in plan order

Per card, in this order: questions → date line → background → sources → Think it through → image →
locator. After each batch: `greece-audit.js`, `check-cards.js --prefix=gr-`, `check-questions.js`,
`card-length.js`, `check-style.js`, `check-citations.js` and `check-gloss-links.js --card`; the ledger;
one changelog line and a version bump; commit and push.

| batch | deck | cards | n | state |
|---|---|---|---|---|
| B1 | Crete and the Cyclades (`gr-crete`) | `gr-001`–`gr-010` | 10 | open |
| B2 | Crete and the Cyclades (`gr-crete`) | `gr-011`–`gr-020` | 10 | open |
| B3 | Crete and the Cyclades (`gr-crete`) | `gr-021`–`gr-030` | 10 | open |
| B4 | Crete and the Cyclades (`gr-crete`) | `gr-031`–`gr-040` | 10 | open |
| B5 | Crete and the Cyclades (`gr-crete`) | `gr-041`–`gr-050` | 10 | open |
| B6 | Crete and the Cyclades (`gr-crete`) | `gr-051`–`gr-055` | 5 | open |
| B7 | Mycenaean Greece (`gr-mycenae`) | `gr-056`–`gr-065` | 10 | open |
| B8 | Mycenaean Greece (`gr-mycenae`) | `gr-066`–`gr-075` | 10 | open |
| B9 | Mycenaean Greece (`gr-mycenae`) | `gr-076`–`gr-085` | 10 | open |
| B10 | Mycenaean Greece (`gr-mycenae`) | `gr-086`–`gr-095` | 10 | open |
| B11 | Mycenaean Greece (`gr-mycenae`) | `gr-096`–`gr-105` | 10 | open |
| B12 | Mycenaean Greece (`gr-mycenae`) | `gr-106`–`gr-110` | 5 | open |
| B13 | Early Iron Age (`gr-iron`) | `gr-111`–`gr-120` | 10 | open |
| B14 | Early Iron Age (`gr-iron`) | `gr-121`–`gr-130` | 10 | open |
| B15 | Early Iron Age (`gr-iron`) | `gr-131`–`gr-140` | 10 | open |
| B16 | Early Iron Age (`gr-iron`) | `gr-141`–`gr-150` | 10 | open |
| B17 | Early Iron Age (`gr-iron`) | `gr-151`–`gr-160` | 10 | open |
| B18 | Early Iron Age (`gr-iron`) | `gr-161`–`gr-170` | 10 | open |
| B19 | Polis and colonisation (`gr-polis`) | `gr-171`–`gr-180` | 10 | open |
| B20 | Polis and colonisation (`gr-polis`) | `gr-181`–`gr-190` | 10 | open |
| B21 | Polis and colonisation (`gr-polis`) | `gr-191`–`gr-200` | 10 | open |
| B22 | Polis and colonisation (`gr-polis`) | `gr-201`–`gr-210` | 10 | open |
| B23 | Polis and colonisation (`gr-polis`) | `gr-211`–`gr-220` | 10 | open |
| B24 | Polis and colonisation (`gr-polis`) | `gr-221`–`gr-230` | 10 | open |
| B25 | Sparta (`gr-sparta`) | `gr-231`–`gr-240` | 10 | open |
| B26 | Sparta (`gr-sparta`) | `gr-241`–`gr-250` | 10 | open |
| B27 | Sparta (`gr-sparta`) | `gr-251`–`gr-260` | 10 | open |
| B28 | Sparta (`gr-sparta`) | `gr-261`–`gr-270` | 10 | open |
| B29 | Sparta (`gr-sparta`) | `gr-271`–`gr-275` | 5 | open |
| B30 | Athens (`gr-athens`) | `gr-276`–`gr-285` | 10 | open |
| B31 | Athens (`gr-athens`) | `gr-286`–`gr-295` | 10 | open |
| B32 | Athens (`gr-athens`) | `gr-296`–`gr-305` | 10 | open |
| B33 | Athens (`gr-athens`) | `gr-306`–`gr-315` | 10 | open |
| B34 | Athens (`gr-athens`) | `gr-316`–`gr-320` | 5 | open |
| B35 | Archaic art, verse and thought (`gr-archaic-culture`) | `gr-321`–`gr-330` | 10 | open |
| B36 | Archaic art, verse and thought (`gr-archaic-culture`) | `gr-331`–`gr-340` | 10 | open |
| B37 | Archaic art, verse and thought (`gr-archaic-culture`) | `gr-341`–`gr-350` | 10 | open |
| B38 | Archaic art, verse and thought (`gr-archaic-culture`) | `gr-351`–`gr-360` | 10 | open |
| B39 | Archaic art, verse and thought (`gr-archaic-culture`) | `gr-361`–`gr-370` | 10 | open |
| B40 | Archaic art, verse and thought (`gr-archaic-culture`) | `gr-371`–`gr-380` | 10 | open |
| B41 | Persian Wars (`gr-persian-wars`) | `gr-381`–`gr-390` | 10 | open |
| B42 | Persian Wars (`gr-persian-wars`) | `gr-391`–`gr-400` | 10 | open |
| B43 | Persian Wars (`gr-persian-wars`) | `gr-401`–`gr-410` | 10 | open |
| B44 | Persian Wars (`gr-persian-wars`) | `gr-411`–`gr-420` | 10 | open |
| B45 | Persian Wars (`gr-persian-wars`) | `gr-421`–`gr-430` | 10 | open |
| B46 | Persian Wars (`gr-persian-wars`) | `gr-431`–`gr-440` | 10 | open |
| B47 | Persian Wars (`gr-persian-wars`) | `gr-441`–`gr-450` | 10 | open |
| B48 | Athenian Empire (`gr-athenian-empire`) | `gr-451`–`gr-460` | 10 | open |
| B49 | Athenian Empire (`gr-athenian-empire`) | `gr-461`–`gr-470` | 10 | open |
| B50 | Athenian Empire (`gr-athenian-empire`) | `gr-471`–`gr-480` | 10 | open |
| B51 | Athenian Empire (`gr-athenian-empire`) | `gr-481`–`gr-490` | 10 | open |
| B52 | Athenian Empire (`gr-athenian-empire`) | `gr-491`–`gr-500` | 10 | open |
| B53 | Athenian Empire (`gr-athenian-empire`) | `gr-501`–`gr-510` | 10 | open |
| B54 | Athenian Empire (`gr-athenian-empire`) | `gr-511`–`gr-520` | 10 | open |
| B55 | Peloponnesian War (`gr-peloponnesian-war`) | `gr-521`–`gr-530` | 10 | open |
| B56 | Peloponnesian War (`gr-peloponnesian-war`) | `gr-531`–`gr-540` | 10 | open |
| B57 | Peloponnesian War (`gr-peloponnesian-war`) | `gr-541`–`gr-550` | 10 | open |
| B58 | Peloponnesian War (`gr-peloponnesian-war`) | `gr-551`–`gr-560` | 10 | open |
| B59 | Peloponnesian War (`gr-peloponnesian-war`) | `gr-561`–`gr-570` | 10 | open |
| B60 | Peloponnesian War (`gr-peloponnesian-war`) | `gr-571`–`gr-580` | 10 | open |
| B61 | Peloponnesian War (`gr-peloponnesian-war`) | `gr-581`–`gr-585` | 5 | open |
| B62 | Classical arts and thought (`gr-classical-culture`) | `gr-586`–`gr-595` | 10 | open |
| B63 | Classical arts and thought (`gr-classical-culture`) | `gr-596`–`gr-605` | 10 | open |
| B64 | Classical arts and thought (`gr-classical-culture`) | `gr-606`–`gr-615` | 10 | open |
| B65 | Classical arts and thought (`gr-classical-culture`) | `gr-616`–`gr-625` | 10 | open |
| B66 | Classical arts and thought (`gr-classical-culture`) | `gr-626`–`gr-635` | 10 | open |
| B67 | Classical arts and thought (`gr-classical-culture`) | `gr-636`–`gr-645` | 10 | open |
| B68 | Classical arts and thought (`gr-classical-culture`) | `gr-646`–`gr-655` | 10 | open |
| B69 | Fourth century and the rise of Macedon (`gr-fourth-century`) | `gr-656`–`gr-665` | 10 | open |
| B70 | Fourth century and the rise of Macedon (`gr-fourth-century`) | `gr-666`–`gr-675` | 10 | open |
| B71 | Fourth century and the rise of Macedon (`gr-fourth-century`) | `gr-676`–`gr-685` | 10 | open |
| B72 | Fourth century and the rise of Macedon (`gr-fourth-century`) | `gr-686`–`gr-695` | 10 | open |
| B73 | Fourth century and the rise of Macedon (`gr-fourth-century`) | `gr-696`–`gr-700` | 5 | open |
| B74 | Alexander the Great (`gr-alexander`) | `gr-701`–`gr-710` | 10 | open |
| B75 | Alexander the Great (`gr-alexander`) | `gr-711`–`gr-720` | 10 | open |
| B76 | Alexander the Great (`gr-alexander`) | `gr-721`–`gr-730` | 10 | open |
| B77 | Alexander the Great (`gr-alexander`) | `gr-731`–`gr-740` | 10 | open |
| B78 | Alexander the Great (`gr-alexander`) | `gr-741`–`gr-750` | 10 | open |
| B79 | Successor kingdoms (`gr-successors`) | `gr-751`–`gr-760` | 10 | open |
| B80 | Successor kingdoms (`gr-successors`) | `gr-761`–`gr-770` | 10 | open |
| B81 | Successor kingdoms (`gr-successors`) | `gr-771`–`gr-780` | 10 | open |
| B82 | Successor kingdoms (`gr-successors`) | `gr-781`–`gr-790` | 10 | open |
| B83 | Successor kingdoms (`gr-successors`) | `gr-791`–`gr-800` | 10 | open |
| B84 | Alexandria and Hellenistic science (`gr-alexandria`) | `gr-801`–`gr-810` | 10 | open |
| B85 | Alexandria and Hellenistic science (`gr-alexandria`) | `gr-811`–`gr-820` | 10 | open |
| B86 | Alexandria and Hellenistic science (`gr-alexandria`) | `gr-821`–`gr-830` | 10 | open |
| B87 | Alexandria and Hellenistic science (`gr-alexandria`) | `gr-831`–`gr-840` | 10 | open |
| B88 | Alexandria and Hellenistic science (`gr-alexandria`) | `gr-841`–`gr-845` | 5 | open |
| B89 | Greece under Rome (`gr-under-rome`) | `gr-846`–`gr-855` | 10 | open |
| B90 | Greece under Rome (`gr-under-rome`) | `gr-856`–`gr-865` | 10 | open |
| B91 | Greece under Rome (`gr-under-rome`) | `gr-866`–`gr-875` | 10 | open |
| B92 | Greece under Rome (`gr-under-rome`) | `gr-876`–`gr-880` | 5 | open |
| B93 | Olympians and cosmogony (`gr-olympians`) | `gr-881`–`gr-890` | 10 | open |
| B94 | Olympians and cosmogony (`gr-olympians`) | `gr-891`–`gr-900` | 10 | open |
| B95 | Olympians and cosmogony (`gr-olympians`) | `gr-901`–`gr-910` | 10 | open |
| B96 | Olympians and cosmogony (`gr-olympians`) | `gr-911`–`gr-920` | 10 | open |
| B97 | Heroes and the epic cycle (`gr-heroes`) | `gr-921`–`gr-930` | 10 | open |
| B98 | Heroes and the epic cycle (`gr-heroes`) | `gr-931`–`gr-940` | 10 | open |
| B99 | Heroes and the epic cycle (`gr-heroes`) | `gr-941`–`gr-950` | 10 | open |
| B100 | Heroes and the epic cycle (`gr-heroes`) | `gr-951`–`gr-960` | 10 | open |
| B101 | Heroes and the epic cycle (`gr-heroes`) | `gr-961`–`gr-965` | 5 | open |
| B102 | Cult, oracles and festivals (`gr-cult`) | `gr-966`–`gr-975` | 10 | open |
| B103 | Cult, oracles and festivals (`gr-cult`) | `gr-976`–`gr-985` | 10 | open |
| B104 | Cult, oracles and festivals (`gr-cult`) | `gr-986`–`gr-995` | 10 | open |
| B105 | Cult, oracles and festivals (`gr-cult`) | `gr-996`–`gr-1000` | 5 | open |

## Ledger

Newest last. Each entry says what changed, what was refused and why, and which of the rules no checker
can see were read by eye: the article, confusability with siblings, whether the image depicts the whole
term, and coverage against the term's own article.

### Batch 0 — tooling (2026-09-24)

Shipped the tools in the table above and the chronology. The tiered bar is site-wide from this batch, so
the Edit page's source chip now reads e.g. `5/8` on a difficulty-2 card that read clean before; that is
the rule arriving, not a regression. Nothing on any card changed.
