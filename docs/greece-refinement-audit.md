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
| B1 | Crete and the Cyclades (`gr-crete`) | `gr-001`–`gr-010` | 10 | **done 2026-09-24** |
| B2 | Crete and the Cyclades (`gr-crete`) | `gr-011`–`gr-020` | 10 | **done 2026-09-24** |
| B3 | Crete and the Cyclades (`gr-crete`) | `gr-021`–`gr-030` | 10 | **done 2026-09-24** |
| B4 | Crete and the Cyclades (`gr-crete`) | `gr-031`–`gr-040` | 10 | **done 2026-09-25** |
| B5 | Crete and the Cyclades (`gr-crete`) | `gr-041`–`gr-050` | 10 | **done 2026-09-25** |
| B6 | Crete and the Cyclades (`gr-crete`) | `gr-051`–`gr-055` | 5 | **done 2026-10-01** |
| B7 | Mycenaean Greece (`gr-mycenae`) | `gr-056`–`gr-065` | 10 | **done 2026-10-01** |
| B8 | Mycenaean Greece (`gr-mycenae`) | `gr-066`–`gr-075` | 10 | **done 2026-10-01** |
| B9 | Mycenaean Greece (`gr-mycenae`) | `gr-076`–`gr-085` | 10 | **done 2026-10-01** |
| B10 | Mycenaean Greece (`gr-mycenae`) | `gr-086`–`gr-095` | 10 | **done 2026-10-01** |
| B11 | Mycenaean Greece (`gr-mycenae`) | `gr-096`–`gr-105` | 10 | **done 2026-10-02** |
| B12 | Mycenaean Greece (`gr-mycenae`) | `gr-106`–`gr-110` | 5 | **done 2026-10-02** |
| B13 | Early Iron Age (`gr-iron`) | `gr-111`–`gr-120` | 10 | **done 2026-10-02** |
| B14 | Early Iron Age (`gr-iron`) | `gr-121`–`gr-130` | 10 | **done 2026-10-02** |
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

### B1 — `gr-001`–`gr-010`, Crete and the Cyclades (2026-09-24)

All ten rewritten in the rule order and applied with `add-card.js --replace`. `greece-audit.js
--range=gr-001:gr-010` reads **10 of 10 clean**; `check-questions`, `card-length`, `check-citations
--card` (0 mismatched on every card) and `check-gloss-links --card` (no cross-region link) all pass;
`check-cards --prefix=gr-` reports nothing on these ten (its one violation is the `gr-598`/`gr-950`
picture, which is A1's). Every sort year was read back against `cardYears` and is the card's own start
(`gr-008` sorts at −6900, its first settlement).

**What changed, card by card.**

| card | bar (by difficulty) | sources | the main changes |
|---|---|---|---|
| `gr-001` Aegean Bronze Age | 7 | 8 → 8 | rewritten for the register; the Thera date now follows Graziadio 2025 (below); map with burned-in title replaced by a satellite view of the whole Aegean |
| `gr-002` Cycladic civilisation | 6 | 5 → 7 | question and picture no longer about the figurines, which are `gr-003`'s subject; picture now the hill of Skarkos |
| `gr-003` Cycladic figurines | 6 | 5 → 8 | caption lost its museum catalogue number; forgery question given its own source |
| `gr-004` Keros | 5 | 6 → 6 | third Renfrew citation dropped (author cap); "more than 7,000 tonnes" **removed** (below); ferry-rail picture replaced by Dhaskalio from the sea |
| `gr-005` Early Minoan Crete | 6 | 5 → 6 | Cherry's BMCR review added for the kiln revolution and the "rough equals" reading; a scholar's name taken out of the prose; sealstone (a later object) replaced by the Myrtos hamlet |
| `gr-006` Minoan civilisation | 8 | 5 → 9 | date line brought to the chronology (1720 → 1750, 1050 → 1075); earthquakes, DNA, the naming, and the Mycenaean-conquest debate each now cited |
| `gr-007` Arthur Evans | 7 | 6 → 7 | **"he named the culture Minoan" was wrong** (below); a year taken out of the question; date line reordered Born → Died |
| `gr-008` Knossos | 8 | 5 → 10 | coverage rebuilt: the old background was the palace's floor plan, which is `gr-009`'s; now Neolithic to Strabo's Greek city, with the Final Palatial and the 1375 destruction; fresco fragment replaced by the rebuilt North Entrance |
| `gr-009` Minoan palace | 7 | 5 → 7 | 1922 plan with printed labels replaced by an aerial of Malia; building method (timber frame, earthquakes) added |
| `gr-010` Throne Room | 6 | 6 → 7 | Manning 2022 (cited for 1470, which it does not carry) replaced by Graziadio; discovery date taken out of the caption |

Every Think-it-through set was rewritten from scratch as three questions the card itself does not
answer, each with a numbered marker into the card's own list; the old sets were the background's own
sentences with "Because" in front, which is what the 4-gram rule was written against.

**Refused or removed, and why.**
- **`gr-004`'s "more than 7,000 tonnes (7,700 tons) of marble".** No openable source carries it: the
  British School's own report says only that the marble "had to be brought by sea from … Naxos", Carter
  et al. 2025 say "imported in tonnes", and the Museum of Cycladic Art is silent on a figure. The
  Renfrew 2022 PDF could not be reached (the journal serves its landing page only). Cut rather than kept
  on a citation that may not carry it.
- **`gr-007`: "the culture … he called Minoan".** Momigliano's review of Gere (BMCR 2009.08.20) says the
  term "has been in use since the 1830s" and was not invented by Evans, citing Karadimas and Momigliano
  2004. The card, one of its questions, and `gr-006`'s why-answer now say he made an existing word the
  culture's name.
- **`gr-010`'s Manning citation** was on the 1470 BCE sentence; the paper is about Thera. Replaced.
- **A question naming Arthur Evans on `gr-008`** — he is a modern scholar, and only `gr-007` (his own
  card) is exempt.

**One source could not be re-verified: the Watrous excerpt** (`assets.cambridge.org`) closes the
connection from this sandbox (`ws_closed`, three tries). Its claims on `gr-001`, `gr-006`, `gr-008` and
`gr-009` are kept as the earlier pass wrote them — Crete never one kingdom, Mount Jouktas as Knossos's
peak shrine — and no new claim was hung on it. **Re-open it in B2 before citing it again.** The two 403s
(`doi.org/10.2307/506716` JSTOR, and the British Academy behind Cloudflare) are known walls, and the
first is labelled Paywalled.

**Two rules turned out to conflict, and the floor wins.** A 25-word mean over ten sentences is 250 words,
under the 270 floor, so no compliant card can meet both. `greece-audit.js` now caps the mean at 285 ÷ the
sentence count (28.5 for ten), which is the top of the 270–285 band these cards aim at; 25 still binds on
a longer abstract. All ten sit between 27.0 and 28.5.

**The chronology moved.** Graziadio 2025 (p. 56) reports that IntCal20 makes 1611 BCE unlikely for the
Thera eruption and 1561 BCE a reasonable hypothesis; `docs/greece-chronology.md` now says so, and
`gr-043`/`gr-044` are flagged there for B5. Keros (2750–2250), Knossos's first settlement and the
Early Minoan subphases gained rows, and pins were added for `gr-004`, `gr-005`, `gr-007` and `gr-010`.

**Read by eye.** *Article:* every phrasing read back with the term in the blank ("the Aegean Bronze
Age", "a Minoan palace", "the Throne Room"; "Knossos" and "Keros" bare). *Confusability:* each checked
against `gr-011`–`gr-069` — `gr-005`'s round-tomb clue cannot be `gr-035` Mesara tholos tombs because the
blank takes a period; `gr-008`'s concrete clue was moved off because `gr-007` uses it. *Image depicts the
whole term:* yes for all ten; for `gr-002` a settlement stands for the culture, since nothing else free
does, and the figurine was the one subject it must not show. *Coverage:* against each term's Wikipedia
article as a checklist — `gr-008` was the one real gap (nothing after the palace).

**Locators.** `gr-005`, `gr-006` and `gr-009` were labelled "Minoan civilisation" / "Minoan Crete",
which are not places; all three now read **Crete**, on one Crete-only ring (the old `gr-005`/`gr-006`
ring ran north to Thera). `gr-004`, `gr-008` and `gr-010` were re-fetched through `add-locators.js`.

### B2 — `gr-011`–`gr-020`, Crete and the Cyclades (2026-09-24)

All ten were rewritten in the rule order and applied with `add-card.js --replace`. The ten abstracts run
272–284 words.

Checks, all passing:
- `greece-audit.js --range=gr-011:gr-020` reads **10 of 10 clean**.
- `check-questions` and `card-length` pass.
- `check-citations --card` reports 0 mismatched on every card.
- `check-gloss-links --card` reports one link to read by eye: `gr-055`'s "Egyptian" goes to `Ancient_Egypt`, which is right.
- Every citation URL was curled and answers 200. Graziadio's DOI 302s to the publisher.
- `check-gloss-links --card` reports one proxy finding, on `gr-015`: "Egyptian" links to `Ancient_Egypt`. That is the right term.
- `check-cards --prefix=gr-` reports nothing new.

Sort years were read back and each is the card's own start: −1900 for the palaces and the scripts' sites, −1925 for `gr-015` (Rutter's earlier figure), −1750 for `gr-014` and `gr-016`, and −1800 for Linear A.

**What changed, card by card.** Each "sources" figure below is the count before the batch → after.

| card | bar | sources | the main changes |
|---|---|---|---|
| `gr-011` Phaistos | 6 | 7 → 7 | Question no longer echoes `gr-008`: it now asks about the Hellenistic town that Gortyn razed (Strabo). La Rosa's earthquake argument added. "Pillars" corrected to the one pillar. The picture is now a wide view of the palace. |
| `gr-012` Malia | 5 | 6 → 5 | The dates are now the École française d'Athènes' own (Old Palace to 1700, reoccupied 1375–1200). Lespez 2021 added for the tsunami deposit. The question echoed `gr-041` and was replaced by the Cyprus and Anatolia metal clue. The locator moved from the modern town to the palace, 2.5 km east. |
| `gr-013` Zakros | 5 | 6 → 5 | Rebuilt from the Greek ministry's description (the unrobbed treasury, the archive, the cistern hall) instead of Hogarth's dig. Hogarth is kept for the sealings. The house is now "home of a local chief or governor". The old picture was also on the glossary term `Late_Minoan_I`, so the card has a new one. |
| `gr-014` Gournia | 5 | 5 → 5 | Rebuilt from the Gournia Excavation Project's own pages. The date line now reads 1750–1490 (the project's figures). "A dam at the river mouth" corrected to "a dam by the river". |
| `gr-015` Protopalatial period | 5 | 5 → 7 | Both dating schemes shown, with a date line of two rows. Eggshell ware, the two scripts, peak sanctuaries and Quartier Mu each now cited. The picture is Quartier Mu, not a single cup. |
| `gr-016` Neopalatial period | 5 | 5 → 7 | Question no longer echoes `gr-006`: it now asks about the villas; Kastri and Trianda moved to an extra phrasing. Adlung 2020 (in German, carrying the language chip) added for the villas; Manning 2022 for the gap after the Thera eruption. A fresco picture replaced by the villa at Tylissos. |
| `gr-017` storerooms and pithoi | 5 | 6 → 6 | Evans's 1900 report, read in full, now carries the stone chests lined with lead and the corridor's length. Christakis 2011 carries the argument over who benefited. A Louvre pithos, which is not a storeroom, replaced by the Knossos magazines. |
| `gr-018` palace economy | 6 | 6 → 8 | **The ingot claim was wrong** (see below). Linear A accounts, roundels and the Quartier Mu craftsmen added. The picture is now Malia's granaries, not the Pillar Crypt. |
| `gr-019` Cretan hieroglyphic | 6 | 5 → 6 | Rebuilt on the 2024 Cambridge volume: the share of inscribed seals, the count of sound signs, and why it cannot be read. "Clay bars" corrected to tablets, medallions and cones. A 1921 plate replaced by a photograph of real inscriptions. |
| `gr-020` Linear A | 7 | 6 → 7 | SigLA carries the sign counts and the 168 tablets from Ayia Triada. Manning carries the mid-15th-century end. A PNG drawing replaced by a photograph of a tablet from Ayia Triada. |

The Think-it-through sets were written from scratch to the B1 rule: three questions the card does not
answer, each with explicit markers.

**Corrected, refused and not usable.**
- **`gr-018`: "the copper came from Cyprus" was wrong for Crete.** Rutter's Lesson 22 says most oxhide
  ingots around the eastern Mediterranean are of Cypriot copper, but the LM I ingots tested from Ayia
  Triada are incompatible with that and may be Anatolian. The card now says both.
- **Steele 2024 (OAPEN) and Pomadère 2021 (OpenEdition)** both sit behind the Anubis bot wall from this
  sandbox and were dropped rather than cited unseen. The Nepal 2024 MDPI paper answers "Access Denied" and
  was not used.
- **La Rosa 1995 is a scanned PDF with no text layer.** It is cited only for what its abstract states: the
  earthquake hypothesis and its political reading.
- **The Watrous excerpt still closes the connection** (`ws_closed`). No B2 card cites it; B1's four stand
  as they were.
- **The Rutter cap bound on six cards.** It was met by choosing which two of his pages each card needs.
  The chronology page stands in wherever a card needs only the 1900 or 1470 figure.
- **Three questions were confusable with siblings** and were rewritten after `Q.sibling` fired:
  - `gr-011` against `gr-008`
  - `gr-012` against `gr-041`
  - `gr-016` against `gr-006`

  `gr-011`'s first redraft opened on "Its", which `check-questions` refuses, and was recast.

**Read by eye.**
- *Article:* "the Protopalatial period", "the Neopalatial period", "the Minoan palace economy" and "the Cretan hieroglyphic script" take "the" before the blank. The site names and Linear A are bare. `gr-017`'s term carries no article and its questions supply "for" and "among the".
- *Confusability:* checked against `gr-001`–`gr-069`, with the three fixes above. `gr-019` and `gr-020` share a subject but each question names what only its own script has: the seals for the hieroglyphic script, and the cuttlefish-ink cup and the offering tables for Linear A.
- *Image depicts the whole term:* for a site, a wide view of the ruins. For a period, a building typical of it. `gr-018` shows the granaries, since storage is the one part of the economy a photograph can show. For each script, a real inscribed object.
- *Coverage:* against each Wikipedia article as a checklist. `gr-013` was the real gap (all about the dig, nothing about the palace); `gr-014` lacked the town's plan and the recent excavations.

**Locators.**
- `gr-011`, `gr-013`, `gr-014` and `gr-017` were fetched through `add-locators.js`. `gr-017` now points at Knossos, where its storerooms are.
- `gr-012` now points at the palace (Wikipedia's *Malia (archaeological site)*), not the modern town.
- `gr-015`, `gr-016` and `gr-018` take B1's Crete-only ring. `gr-018`'s old locator was named "Minoan civilisation", which is not a place, and its ring reached Thera.
- `gr-019` and `gr-020` take none: a script is not a place.

**Chronology.** Rows added for Malia, Phaistos, Zakros, Gournia, the two scripts and the LM IB horizon. Pins added for all ten cards. Malia is the one site whose own excavators break the Old and New Palace ages at 1700 rather than 1750; the card follows them and says so.

### B3 — `gr-021`–`gr-030`, Crete and the Cyclades (2026-09-24)

All ten were rewritten in the rule order and applied with `add-card.js --replace`.

Checks, all passing:
- `greece-audit.js --range=gr-021:gr-030` reads **10 of 10 clean**, and `gr-001`–`gr-030` read 30 of 30.
- `check-questions` passes.
- `check-citations --card` reports 0 mismatched on every card.
- `check-gloss-links --card` reports one link to read by eye: `gr-055`'s "Egyptian" goes to `Ancient_Egypt`, which is right.
- All 38 citation URLs answer 200.
- `check-gloss-links --card` reports no cross-region link on any card.
- `check-cards --prefix=gr-` reports nothing new.

The ten abstracts run 276–285 words. Every sort year was read back. `gr-030` now has an empty date line: a symbol used from the palaces into the Iron Age has no single date worth memorising, and the old line gave the date of one fresco and of one house.

**What changed, card by card.** Each "sources" figure below is the count before the batch → after.

| card | bar | sources | the main changes |
|---|---|---|---|
| `gr-021` Phaistos Disc | 7 | 5 → 7 | The Cambridge chapter by Meissner and Salgarella (pp. 142–44) now carries the date (MM IIIA), the signs shared with the Arkalochori axe and the refuted forgery claim. Pernier and Evans stand for the first argument, Cretan work against Anatolian import. The Catania site page was dropped: a second Italian source would break the one-per-language rule. A question carrying the sign count "241" was rewritten. |
| `gr-022` Minoan frescoes | 7 | 5 → 7 | Rebuilt around what the paintings show and how they were painted, not around the Cup-bearer's find-spot. Chapin's review adds the Ayia Triada workshop that kept painting after Knossos fell. **The Akrotiri antelopes picture was Theran**, and Rutter counts Thera as its own island school, so the card and its glossary term now show the Knossos monkey fresco. |
| `gr-023` Bull-leaping fresco | 7 | 5 → 7 | The museum's date (soon after 1550) replaces a bare "Neopalatial". The ivory leaper, and Crowley's stock moments of the sport on seals (from Weingarten's review), were added. |
| `gr-024` Snake Goddess figurines | 7 | 5 → 7 | **The picture was the Walters statuette, which is not from Knossos**; the card and its glossary term now show the Heraklion figure. Boze 2016 carries how much of both figures is restoration: the smaller was found headless. Karatzoglou's review of Lapatin carries the Boston forgery. A question carrying "1700" was rewritten. |
| `gr-025` Kamares ware | 5 | 5 → 5 | The date moved from 2000 to 1900 BCE (see "the chronology" below). The Heraklion bowl from Phaistos and the vases found at Kahun were added. Evans's Knossos jar, a find-spot detail, was dropped. |
| `gr-026` Marine Style pottery | 5 | 5 → 6 | The two museum rhyta, from Phaistos and Zakros, were added. The Phaistos rhyton is the one Mosso watched being dug (pp. 260–61, **not 261–63 as the old citation said**). Manning's gap between the eruption and the fires now qualifies the refugee-artist idea. |
| `gr-027` Minoan sealstones | 5 | 5 → 7 | Rebuilt on the Heidelberg page's three uses of a seal. Weingarten's review of Crowley, the Archanes fourteen-sided seal and the tree-worship ring were added. **The old picture showed a lentoid bead edge-on**, with no engraving visible; the card and its glossary term now show seals beside casts of their impressions. |
| `gr-028` Peak sanctuaries | 5 | 5 → 6 | The date line's 1750 and 1470 are now in the prose. Added: the Zakros sanctuary rhyton; Déderix and colleagues on shared tombs giving way to regional sanctuaries; the later Cretan tradition that Juktas held the tomb of Zeus. |
| `gr-029` Cretan cult caves | 5 | 5 → 5 | Rutter's chronology page replaces his Lesson 10, so a Rutter page can carry the 1075 end date. The inscribed offering table and the Zeus legend (*Scripta Minoa* 14–15) were added. |
| `gr-030` Horns of consecration | 6 | 6 → 7 | Rutter's Lesson 12 adds the West Court horns at Knossos, and the École française page adds Malia's Sanctuary of the Horns. Evans 1903 is now read for what it says: the limestone pair from the South-East House had no socket. Chapin's review moved to `gr-022`, which it actually concerns. |

The Think-it-through sets were written from scratch to the B1 rule.

**Corrected, refused and not usable.**
- **Mosso's pages.** Read off the scan, the Kamares passages are pp. 41–42 and 54, not 44 and 54, and the argonaut rhyton is pp. 260–61. Both citations are corrected.
- **Baldacci's chapter on the disc** (Oxford, 2024, open access) answers 403 at OUP and sits behind the Anubis wall at OAPEN. It is not cited unseen; Meissner and Salgarella cover the same ground and could be read.
- **Banou 2008 on horns of consecration** (*Mediterranean Archaeology and Archaeometry*): the journal site answers 403. OpenAlex's anonymous daily budget ran out mid-batch; that is a quota, not a refusal.
- **Picture credits.** Four of the old credits were bare Commons URLs naming no author, among them a CC BY and a CC BY-SA picture. All ten now name the author and the licence.
- **`glossary-extra.js`.** The serializer dropped two duplicate keys, `Huns` and `Attila`. The two copies were identical, and the effective table was compared before and after: only the three intended images changed.

**Read by eye.**
- *Article:* the Phaistos Disc, the bull-leaping fresco, the Snake Goddess figurines, the peak sanctuaries and the cult caves take "the". Kamares ware, Marine Style pottery and the frescoes are bare where the grammar allows. The sealstones read "one of the".
- *Confusability:* the three picture-subject cards (`gr-022`, `gr-023`, `gr-024`) each lean on a clue only they have, the skin colours having moved off `gr-023`'s questions. `gr-028` and `gr-029` are told apart by the bones.
- *Image depicts the whole term:* for a class of object, a set of examples: cups, seals. For a single object, the object. For a class of place, one real example: Petsofa, Psychro.
- *Coverage:* `gr-021` was missing the parallels and the forgery question; `gr-024` was missing the restoration problem and the Boston fake.

**Locators.**
- `gr-021` points at Phaistos. `add-locators.js` named it "Phaistos Disc" when no `name` was given, **so pass `name` for any object card**.
- `gr-023` and `gr-024` point at Knossos.
- The seven class cards take B1's Crete-only ring.


### B4 — `gr-031`–`gr-040`, Crete and the Cyclades (2026-09-25)

All ten were rewritten in the rule order and applied with `add-card.js --replace`.

Checks, all passing:
- `greece-audit.js --range=gr-031:gr-040` reads **10 of 10 clean**, the chronology pins included.
- `check-questions` passes.
- `check-citations --prefix=gr-03` reports 0 mismatched.
- Every citation URL answers 200. Three Commons files answered 429 on the check, which is a busy host; all three `src` strings were copied from the API.
- `check-gloss-links --card` reports no cross-region link on any card.
- `check-cards --prefix=gr-03` and `--prefix=gr-040` report nothing.

The ten abstracts run 273–285 words. Every sort year was read back.

**What changed, card by card.** Each "sources" figure below is the count before the batch → after.

| card | bar | sources | the main changes |
|---|---|---|---|
| `gr-031` Labrys | 6 | 5 → 6 | The Heraklion page for the Malia sceptre-head, a leopard at the front and a double axe at the back, carries the axe as an emblem of power. The Postpalatial end date is now in the prose. |
| `gr-032` Minoan religion | 6 | 5 → 7 | The Isopata ring, a bronze worshipper and the Gazi Poppy Goddess were added from the museum's pages. Karatzoglou's review now carries the forged snake goddesses. The North House bones, a finding revised down from eight or more children to four, were dropped as too much for one sentence. **The old picture's description named no object**; it is now the Isopata ring with its impression. |
| `gr-033` Ayia Triada sarcophagus | 5 | 5 → 5 | The museum page replaces *Tree and Pillar Cult*. The card gives the end chariot as "wild goats or a horse", because Rutter and the museum disagree. Nilsson, by name, is gone from the prose; Burke's argument is kept, from his abstract alone. |
| `gr-034` Larnax | 5 | 5 → 5 | Rebuilt around what the chests say about burial. Galanakis's review now carries the Mochlos cemetery: pithoi in 18 tombs, chest larnakes in 5 and tub larnakes in 4; only adolescents and adults in larnakes; the richest tombs holding one; and the east-central preference over the west and the rest of the Aegean. |
| `gr-035` Mesara tholos tombs | 5 | 5 → 5 | **Over the author cap** with three Rutter pages. The chronology page and Mosso were dropped. The Heraklion page for the clay shrine model from the Kamilari tholos was added. The start date moved to c. 3000 BCE, cited to Warren's table in Déderix and colleagues, the other half of the collection's 3100/3000. Rebuilt around who the tombs served: family groups, within 250 metres of a village, alike in wealth. A question carrying "decades" was rewritten. The card now has a picture and an authored Mesara ring. |
| `gr-036` Minoan roads | 5 | 5 → 5 | **The French BCH article carried no language chip**; it does now. The Knossos West Court test pit, an excavation detail, was dropped. The picture is now the Royal Road at Knossos, not Malia's processional way. |
| `gr-037` Minoan water management | 5 | 5 → 5 | **Two modern sources out of five**, below the half; Mosso out, the INSTAP Pseira page in, with its two dams. **Evans calls the Corridor of the Draught Board pipes drain-pipes** (1902, pp. 13–14), so the card no longer lets them read as a supply line. **The old picture was a diagram carrying a printed caption**; it is now a photograph of the Knossos drains. |
| `gr-038` Mochlos | 5 | 5 → 5 | Rebuilt as a history of the town on the INSTAP page: the early workshops, the Syrian cylinder seal, the house of the metal merchant, the destruction and the Limenaria cemetery. The Soles-and-Watrous debate on rank, which named two scholars, is gone. Questions carrying "180" and "150" were rewritten. |
| `gr-039` Pseira | 5 | 5 → 5 | The INSTAP page adds the MM IIB destruction, the rebuilt town of more than 60 houses, the Shrine's reliefs, the Plateia Building and the dams. A question carrying "240" was rewritten, and the Q.sibling overlap with `gr-038` is cleared. |
| `gr-040` Palaikastro Kouros | 5 | 5 → 5 | **Three French sources**, against one per language. Poursat stays, with a chip; Faure and Touchais are dropped. Sturgeon's BMCR review of Lapatin (piecing, and the young Zeus) and the British School's page (the town, the c. 1450 destruction and the 8th-century sanctuary of Diktaean Zeus) carry the rest. **"Several hundred fragments" was not what Poursat says**: the fragments lay scattered over more than ten metres. The date-of-discovery sentence went with the archaeology. |

The Think-it-through sets were written from scratch to the B1 rule.

**Corrected, refused and not usable.**
- **Plutarch's *Greek Questions*** is not on LacusCurtius, so the labrys etymology stays on Rutter's statement of it rather than on a translation that could not be opened.
- **No Heraklion exhibit page shows a double axe.** A scan of object ids 7860–7960 and 8955–8970 found none; the Malia sceptre-head is the nearest.
- **Picture credits.** All ten old credits were bare Commons URLs. All ten now name the author and the licence.

**Read by eye.**
- *Article:* the labrys, the larnax, the Ayia Triada sarcophagus, the Mesara tholos tombs, the Minoan roads and the Palaikastro Kouros take one; Minoan religion, Minoan water management, Mochlos and Pseira are bare.
- *Confusability:* `gr-038` leans on its gold and its merchant, `gr-039` on its reliefs and its cliffs. `gr-033` and `gr-034` share the idea of a burial chest, so each question names what only it has.
- *Image depicts the whole term:* for a class of object, one example (the gold axe, the Palaikastro-type larnax). For a class of tomb, one real tholos (Kamilari). For roads and drains, the best-known Knossos stretch.

**Locators.**
- `gr-033` points at Ayia Triada and `gr-040` at Palaikastro, each with `name` passed.
- `gr-035` takes an authored ring round the Mesara plain and the Asterousia foothills.
- `gr-038` and `gr-039` keep their points.
- The five class cards take B1's Crete-only ring.

### B5 — `gr-041`–`gr-050`, Crete and the Cyclades (2026-09-25)

All ten were rewritten in the rule order and applied with `add-card.js --replace`.

Checks, all passing:
- `greece-audit.js --range=gr-041:gr-050` reads **10 of 10 clean**, the chronology pins included.
- `check-questions` passes.
- `check-citations --prefix=gr-04` and `--card=gr-050` report 0 mismatched. The one name to check by eye, Paraskevi Nomikou against Crossref's "P.", is her published given name.
- Every citation URL answers 200.
- `check-gloss-links --card` reports no cross-region link on any card.
- `check-cards --prefix=gr-04` and `--prefix=gr-050` report nothing.

The ten abstracts run 273–283 words. Every sort year was read back.

**One tool change: `greece-audit.js` S.chip? had two false positives.** The proxy matched "des" in the journal title *Chronique des fouilles en ligne* and "der" in the surname van der Plicht. Both are now masked before the test, and nothing else changes. A Chronique notice in French still needs its chip, and still gets one: `gr-042`'s 1976 notice, which is Touchais's French text, carries `[in French]`.

**What changed, card by card.** Each "sources" figure below is the count before the batch → after.

| card | bar | sources | the main changes |
|---|---|---|---|
| `gr-041` Petras | 5 | 5 → 5 | The skull-count and trephination detail from the rock shelter was dropped. The card is rebuilt as the town's history. Caloi's review carries a multi-stage burial, fire in the rites, and Petras as the leading centre of its district before its palace. Smith's review carries House I.1 as a working building for wine, cloth and meals, its imports, and the reoccupation after the LM IB fire. Rupp's reading that the later buildings on the cemetery hill honour the ancestors is also Caloi's. A question carrying "000" was rewritten. |
| `gr-042` Akrotiri | 7 | 5 → 7 | Rebuilt around the town: storeys, workshops, a public building and Linear A (Odysseus); Cretan ways on a Cycladic base (Graziadio 80, 91–92). Manning and Pearson were added for the date. The beetle date, c. 1607 BCE, stays in the prose as one study's result, off the date line. The 1976 Chronique notice now carries its French chip. A question carrying "1607" was rewritten. The fisherman fresco, which is another card's subject, was replaced by a view over the town. |
| `gr-043` Thera eruption | 7 | 6 → 7 | The date-line row "Caldera filled: within 2 days", which states no date, is gone. The date line now gives the collection's `c. 1610 – 1540 BCE` range, as the chronology's Thera note requires, and `gr-042`, `gr-044` and `gr-045` give the same range. Graziadio pp. 56–57 carries the finding that the 1628 BCE ice spike is Alaska's Aniakchak. Bruins and van der Plicht carry the spread of the tephra and pumice and the pre-Ahmose date. The Global Volcanism Program was dropped; the Smithsonian host answered only with its outage page. The satellite picture was replaced by an aerial photograph of the caldera. |
| `gr-044` Flotilla fresco | 5 | 5 → 6 | Odysseus now carries the identification of the arriving town as Akrotiri and the eight stern cabins in the next room. Manning is kept for the date the prose now states. The Marinatos-dug-it sentence went with the archaeology. The picture is now the south wall's town-and-fleet stretch rather than one town detail. |
| `gr-045` Theran tephra | 5 | 5 → 6 | Bruins and van der Plicht carry the distribution, including the pumice reaching Egypt and Sinai and the tsunami layer at Palaikastro. Manning and Graziadio now carry the date and the Aniakchak correction. A question carrying "century" was rewritten. The date-line row "mid-16th century BCE", which yields no sort year, and the ice-core years that were not in the prose are gone. |
| `gr-046` Minoan trade with Egypt | 6 | 6 → 6 | **The old abstract carried no bold answer term**; it does now. **The Evans citation was wrong**: the Gurob and Nubia vessels are in *Palace of Minos* vol. 4, part 1 (1935), p. 267, not vol. 1, pp. 266–70. Cannata's review now also carries the Tod cups and the Tell el-Dab'a rhyta. A question carrying "century" was rewritten. |
| `gr-047` Keftiu | 5 | 5 → 5 | Hall's BSA article, now cited to pp. 163–66 and 182, carries the four quarters, the Great Ring, the Ptolemaic mistake and the Cup-Bearer match. Palaima's review carries the Mari record of the Caphtorian merchant, with its date in the prose. RCH is out; Palaima is in. The bull's-head rhyton, which is not the Keftiu, was replaced by the Rekhmire copy of Aegean gift-bearers. |
| `gr-048` Minoan thalassocracy | 6 | 5 → 7 | Herodotus 3.122 was added: Polycrates as the first Greek sea-ruler, with Minos set aside. Graziadio and Pullen were added. **"Rutter answers yes" named the scholar in the prose**; it now reads as the claim alone. The copper ingot, which shows no sea power, was replaced by the Chania clay ship model. |
| `gr-049` Minoan Kythera | 5 | 6 → 5 | **Evans's *Shaft Graves* sentence was historiography** and went with its source. **The Graziadio pages were wrong**: Kastri's Cretan look is p. 80, the Naram-Sin tablet p. 81, and the "friendly newcomers" and Chania exports pp. 91–92. R18 replaces R14 as the source that calls Kastri a colony. **The card had no picture**; it now has the Avlemonas–Palaiopoli coast, where Kastri stands. |
| `gr-050` Destruction of the Minoan palaces | 6 | 5 → 6 | Odysseus carries Zakros: the only unrobbed Minoan treasury, and the site farmed afterwards. Galanakis's review carries Mochlos rebuilt beside its ruins until c. 1250 BCE. The Q.sibling overlap with `gr-016` was cleared by rewriting the main question. The Knossos North Portico, a building that was not destroyed, was replaced by the Zakros central court. |

The Think-it-through sets were written from scratch to the B1 rule.

**Corrected, refused and not usable.**
- **The Global Volcanism Program host** answered with "site temporarily unavailable" on every try. It was dropped rather than cited unseen.
- **Kastri on Kythera** has no Wikipedia article and no Wikidata item a search could find. `gr-049`'s point stays on the island's own coordinate and is labelled Kythera.
- **Picture credits.** All ten old credits were bare Commons URLs. All ten now name the author and the licence.

**Read by eye.**
- *Article:* the Thera eruption, the Flotilla fresco, the Minoan thalassocracy and the destruction of the Minoan palaces take one; the other six are bare.
- *Confusability:* `gr-043` and `gr-045` share one event, so the eruption card asks about the explosion and its waves and the tephra card about where the layer lies. `gr-048` and `gr-049` share Kastri, so the thalassocracy card leans on Thucydides and Thera's warships, and the Kythera card on the shrine and the Laconian stone.
- *Image depicts the whole term:* for a town, a view over it. For an eruption, the caldera it left. For tephra, a pumice cliff. For trade and the Keftiu, the two Rekhmire copies. For sea power, a ship. For the destruction, a palace that was never rebuilt.

**Locators.**
- `gr-041` points at Petras.
- `gr-042` and `gr-044` point at Akrotiri.
- `gr-043` and `gr-045` point at the Santorini caldera, labelled Santorini.
- `gr-049` points at Kythera.
- `gr-047` and `gr-050` take B1's Crete-only ring.
- `gr-046` and `gr-048` take none. Each is a relation between places rather than a place.

### B6 — `gr-051`–`gr-055`, Crete and the Cyclades (2026-10-01)

The last five cards of the deck. All five were rewritten in the rule order and applied with `add-card.js
--replace`. The deck ends at `gr-055`, so B6 is five cards, not ten; B7 opens `gr-mycenae`.

Checks:
- `greece-audit.js --range=gr-051:gr-055` reads **3 of 5 clean**, the chronology pins included. The two
  findings are `S.chip?` proxies, read by eye and English: Judson's BMCR review of an Italian corpus
  (`gr-053`) and Mikrakis's English entry in the Italian-titled *Dizionario Enciclopedico della Civiltà
  Fenicia* (`gr-055`). See the tool change below for why neither is masked.
- `check-questions`, `check-style`, `check-cards --prefix=gr-05`, `check-docs` and `split-cards --check` pass.
- `check-citations --card` reports 0 mismatched on every card.
- `check-gloss-links --card` reports one link to read by eye: `gr-055`'s "Egyptian" goes to `Ancient_Egypt`, which is right.
- Every citation URL answers 200 except the three PA-I-TO pages on `gr-052`. Each answered 200 and was
  read in full while the card was written; later re-checks timed out with no body (the host is
  `webx.aruba.it`), so a later batch should curl them again.

The five abstracts run 274–285 words. Every sort year was read back.

**One tool change: `greece-audit.js` S.chip? masks a Greek phrase that opens an English title.** Whitley's
BSA article (`gr-054`) is titled "ΚΑΤΕΣΚΑΨΑΝ ΙΕΡΑΠΥΤΝΙΟΙ: The Destruction of …", and a Greek run followed by
a colon and an English subtitle is now masked. **Three wider masks were tried and refused on measurement.**
Masking a reviewed book's title cleared some fifty BMCR reviews of foreign books, and BMCR also publishes
reviews in Spanish, German and Italian. Masking a foreign-titled container hid a German article in *Mètis*,
and masking a publisher hid a German edition of Philo. So those stay flagged and are read by eye.

**What changed, card by card.** Each "sources" figure below is the count before the batch → after.

| card | bar | sources | the main changes |
|---|---|---|---|
| `gr-051` Mycenaean Knossos | 6 | 5 → 6 | Rebuilt as the history of who ruled Knossos: Linear B in Greek; Bennet's almost 100 place names, the reach over half to two-thirds of Crete, and no place in the far east; the Warrior Graves; and the 2024 BSA paper's strontium result, which shows the dead at Knossos and Sellopoulo grew up locally. **The old card said the chamber tombs' wooden coffins were a mainland idea**; Rutter and the BSA paper both say Cretan coffins go back to MM III. **Chania was not among Rutter's Warrior-Grave sites.** The date line moves from c. 1490 to the collection's c. 1470. Two named scholars are gone from the prose. |
| `gr-052` Knossos Linear B archive | 5 | 5 → 9 | Now opens on the size of the archive: the largest anywhere, about 3,400 records in over 10,000 fragments (PA-I-TO), about three times Pylos's. It covers the sheep tablets (about 990), the collectors, cloth, the Room of the Chariot Tablets (Evans: over 350 pieces) and Phaistos as the second commonest place name. **"Written c. 1400" was in no source**; the line now gives the Chariot Tablets c. 1390 – 1370 BCE (Driessen, via Lane) and the bulk at c. 1375 or c. 1250 BCE (Firth and Skelton, n. 38, for Hallager). **"Redated by twenty years" was not what Lane says.** **Hands 103 and 105** contradicts the review's own body text, so it is gone. |
| `gr-053` Postpalatial Crete | 5 | 5 → 9 | Now covers the whole period to c. 1075 BCE. It adds Building P's size (Scotton), Chania's inscribed stirrup jars (Judson), and the hilltop refuges from c. 1200 BCE: Karphi, the Kavousi Kastro at 713 metres, and Vronda's 26 goddesses (INSTAP; Antoniadis; Kotsonas). **"16 kilometres" to Kommos overstated Rutter's "less than ten miles"**; the distance is gone. **The claim that rock-cut chamber tombs were "the island's commonest" was in no source.** The date line's "c. 1385 – 1375" is now the collection's c. 1375. |
| `gr-054` Eteocretan | 5 | 5 → 9 | Homer is cited directly (Murray's "great-hearted native Cretans"). It adds the corpus of six texts and 422 letters from c. 650 BCE (Zitelli, after Duhoux), the Linear A hypothesis left open (Mnamon), the Dreros bilingual (PECS) and Praisos razed between 145 and 140 BCE (Whitley 2023). **"Staphylus gave the Dorians the east" made Strabo's source an allotter**; Strabo only reports where the peoples lived "according to Staphylus". **"Occupation from about 1200 to 500 BCE" misread Chaniotis**, who gives the survey's earliest phase. **The 1884 find was cited to Conway**; it is Bosanquet, p. 232. The date line's "c. 600 – 200" was in no source. |
| `gr-055` Idaean Cave | 5 | 7 → 7 | **The card's Kamares-ware date belonged to a different cave**: Kamares ware is named after the Kamares cave on Ida's south slope, and Evans's 1900 report does not date this one. The new dates come from Mikrakis (DECF 2016): shelter from the late 4th millennium BCE, cult from c. 1700 BCE, the greatest age 900 – 600 BCE, the 8th-century bronze shields, and a last initiation under Julian, 361 – 363 CE. **Four Strabo sources against a cap of two**: there is now one, which carries Minos's ninth-year visits with the story's own hedge (Strabo names only "the cave of Zeus", and Dionysius set it on Dicte, per Hogarth). Diodorus 5.70 and Porphyry's Pythagoras were added. **The Evans citation's title was wrong**; Evans is no longer cited. |

The Think-it-through sets were written from scratch to the B1 rule.

**Corrected, refused and not usable.**
- **"Idaean Cave" on English Wikipedia redirects to the Psychro (Dictaean) Cave.** `add-locators.js` followed the redirect and wrote the wrong cave's coordinate onto `gr-055`. It is now Wikidata Q935991's P625, read off the item that Greek Wikipedia's *Ιδαίο Άντρο* links to. **A Cretan cave card should check the `←` article name `add-locators.js` prints.**
- **The research subagents' Commons traffic tripped Wikimedia's rate limit for this container for over an hour.** Picture licences and authors were then read off the File pages' HTML rather than the API; every `src` is the upload URL those pages and the earlier API answers give.
- **Not usable:** the Kernos 1988 Sakellarakis article (behind an Anubis challenge); Nafplioti 2008 in *JAS* (closed, no abstract; its finding reaches `gr-051` through the 2024 BSA paper); and the Heraklion Museum's object pages (TLS errors, then 503).
- **Picture credits.** All five old credits were bare Commons URLs. All five now name the author and the licence.

**Read by eye.**
- *Article:* the Knossos Linear B archive and the Idaean Cave take one; Mycenaean Knossos, Postpalatial Crete and Eteocretan are bare.
- *Confusability:* `gr-051` and `gr-052` share the tablets, so the Knossos card asks about the graves, the place names as reach, and the bones, while the archive card asks about the deposits, the sheep and Phaistos as a count. `gr-053` asks about Building P and the refuges, which no sibling has. `gr-055` and `gr-029` Cretan cult caves share the caves of Zeus, so `gr-055` asks about Pythagoras, the shields and the Roman initiation, none of which is `gr-029`'s.
- *Image depicts the whole term:* for Mycenaean Knossos, the Throne Room; for the archive, one Knossos tablet; for the period, Karphi, its emblematic refuge; for the language, a Praisos inscription in it; for the cave, its mouth.

**Locators.**
- `gr-051` and `gr-052` point at Knossos.
- `gr-053` takes B1's Crete-only ring.
- `gr-054` points at Praisos.
- `gr-055` points at the Idaean Cave (Wikidata Q935991).


### B7 — `gr-056`–`gr-065`, Mycenaean Greece (2026-10-01)

The first ten cards of `gr-mycenae`. All ten were rewritten in the rule order and applied with `add-card.js
--replace`, the picture in a second `--replace`.

Checks:
- `greece-audit.js --range=gr-056:gr-065` reads **10 of 10 clean**, the chronology pins included.
- `check-questions`, `check-style`, `check-cards --prefix=gr-05` and `--prefix=gr-06`, `check-docs` and
  `split-cards --check` pass.
- `check-citations --card` reports 0 mismatched on every card.
- `check-gloss-links --card` reports no cross-region link on any card.
- All 49 citation URLs answer 200. The Galanakis chapter (`gr-064`) is a 5 MB PDF and times out under a
  60-second limit; it answers 200 given longer.
- **The three PA-I-TO pages on `gr-052`, re-curled as B6 asked:** `/en/class-d-2/` and
  `/en/the-pa-i-to-linear-b-epigraphic-project-2/` answer 200; `/en/knossos/` still times out with no
  body after three tries. It stays on the card, and a later batch should try it again.

The ten abstracts run 270–285 words. Every sort year was read back.

**`gr-058` needs `"undatable": false` in every patch.** `add-card.js` asks a difficulty-2 place card to say
whether it is datable, but the flag is not stored when false, so a picture-only patch is refused until it
carries the flag again.

**`cardYears` reads a range before a single year.** `gr-058`'s first draft opened `First rulers c. 1700 BCE`
and sorted at −1350, its second row's range. The line now opens `Bronze Age rule c. 1700 – 1100 BCE`.

**What changed, card by card.** Each "sources" figure below is the count before the batch → after.

| card | bar | sources | the main changes |
|---|---|---|---|
| `gr-056` Mycenaean civilisation | 8 | 10 → 9 | Rebuilt for the register around the palace states: shaft graves, palaces from c. 1400 BCE (Rutter L20), the wanax, Linear B as Greek, Cyclopean walls and their cost (Blackwell on Boswinkel), Ahhiyawa, the collapse (Middleton 2024) and what went on after (Mikrakis). **The old date line ended at 1050, which no source on the card gave**; it now ends c. 1100 BCE (the Athens museum). A question carrying "1200" was rewritten. The Gilliéron facsimile drawing was replaced by a photograph of the Warrior Krater. |
| `gr-057` Heinrich Schliemann | 8 | 6 → 10 | Calder 1972 carries the self-invention (the California citizenship, really New York, 1869); Gill on Traill carries the field notes disagreeing on Sophia's part and the date; Kennell carries the smuggling and the lawsuits; the Athens museum carries Stamatakis and the four-century gap. **"Demolishing the upper strata, by his own account" and "the Ottoman government was owed half" were in no source read**, and are gone. A question carrying "1876" was rewritten, and one opening on "His" was reworded. The 1892 almanac drawing was replaced by a Library of Congress photograph; its mount carries a small handwritten catalogue mark in the margin, outside the picture. |
| `gr-058` Mycenae | 8 | 8 → 8 | Now the citadel's whole history from the ministry's history tab: first rulers c. 1700 BCE, walls c. 1350, the Lion Gate c. 1250, abandonment c. 1100, the sack of 468 BCE, and the Hellenistic village Diodorus' "uninhabited down to our own times" leaves out. Thucydides went; Holoka on Gere and the Mukanu statue base came in. **The picture was a boar's-tusk helmet fresco, which is `gr-089`'s subject**; it is now the citadel under Profitis Ilias. A question carrying "468" was rewritten. |
| `gr-059` Lion Gate | 7 | 7 → 9 | **The old prose named Blackwell and Evans.** Tsountas and Manatt (1897) now carry the measurements, the separate heads and the seven-abreast approach; Blackwell's AJA abstract carries the heads turned back and the Anatolian sawing, cited at `ajaonline.org` because the DOI resolves to a 403. The two head readings are both given. The Underwood stereograph was replaced by a photograph. **The card had no locator**; it now has one. |
| `gr-060` Grave Circle A | 6 | 5 → 8 | **"The ring cuts a corner off two of the graves" was not found in Schuchhardt**, and is gone. Added: the 870 gold objects of Grave III and over 15 kg of gold (Tsountas; Rutter), the refurbishment for ancestor cult (Odysseus), and Frank et al. 2026 (PLOS One) on non-local burials. The Q.sibling overlap with `gr-062` was cleared. **The picture's description ended on the photographer's name**, and the credit was a bare URL. |
| `gr-061` Grave Circle B | 5 | 6 → 8 | **Bouwman et al. 2008, cited for "reported kinship", could not be read** (closed, 403); Brown et al. 2000, the first DNA report, replaces it on its free abstract. Spantidaki (CHS 2022) now carries Grave N's cloth as the oldest tapestry in Greece. The dates are given as Rutter's 1650 – 1550 BCE with the ministry's c. 1700 BCE as a second row. The sword from Grave Alpha was replaced by a view of the circle. A question carrying "1995" was rewritten. |
| `gr-062` Mask of Agamemnon | 7 | 5 → 9 | Rebuilt on Schliemann's own description (pp. 311–12) and the 1999 *Archaeology* dossier: Calder, Traill, Demakopoulou and Lapatin each cited on their own page. **The "gazed on the face of Agamemnon" telegram is now called a legend**, as Harrington and Lapatin both say. A question naming Schliemann (a modern scholar, outside his own card) and one carrying "centuries" were rewritten. **The picture's description and alt were the file name and the photographer.** |
| `gr-063` shaft grave | 6 | 5 → 7 | **The old sizes, "2.7 by 3 metres to 5 by 6.7", did not convert Tsountas's feet**, and his larger figure is an uncertain OCR fraction, so only the 24-foot length and the 16-foot depth are used. Boyd 2015 carries the roofed chamber as the innovation and the rise of the elite; Eder and Zavadil carry Plasi at Marathon. **The picture was shared with the glossary's `Shaft_grave`**; it is now two open shafts in Grave Circle B. |
| `gr-064` tholos tomb | 6 | 5 → 8 | Zavadil and Galanakis (2021, open access) carry the Messenian origin, about 300 known tholoi and the end of the great ones by c. 1250 BCE; Pausanias 9.38.2 carries the Orchomenos "keystone". Two questions carrying "1879" were rewritten. The German section drawing with printed labels was replaced by the passage of the Tomb of Aegisthus. **The tags now open on `practice`**, as `gr-063`'s do: the card is a building type with no place to point at, and a dot would be invented. |
| `gr-065` Treasury of Atreus | 6 | 5 → 7 | **The chamber was "15 metres across and as high"**; the ministry's page (Psychogiou) gives 14.20 × 13.20 m. **The date line "c. 1300 – 1275 BCE" is now the disputed c. 1350 – 1250 BCE**, saying whose each end is. Evans's Amarna comparison went. The ministry page calls the lintel "granite", which it is not, so the card gives its size only. **The card had no locator**; it now has one. |

The Think-it-through sets were written from scratch to the B1 rule.

**Corrected, refused and not usable.**
- **Not usable:** the Met's essays (429 bot checkpoint), Smarthistory, Britannica, UNESCO and the British
  Museum collection pages (403 challenges), the ASCSA Schliemann papers (TLS error), Wace's *Mycenae* and
  Mylonas's books on archive.org (borrow only), Dickinson's 2005 *Hesperia* article (verification wall),
  and Bouwman et al. 2008 (closed).
- **Skourtanioti et al. 2023 does not include Mycenae**, so it is not cited for Grave Circle B.
- **Picture credits.** All ten old credits were bare Commons URLs. All ten now name the author and the licence.

**Read by eye.**
- *Article:* the Mycenaean civilisation, the Lion Gate, the Mask of Agamemnon and the Treasury of Atreus
  take one; Mycenae, Heinrich Schliemann and the two grave circles are bare; shaft grave and tholos tomb
  take "a" or "the" as the sentence needs.
- *Confusability:* `gr-060` and `gr-061` share the shaft graves, so A asks about the Lion Gate, Pausanias
  and the ancestor cult, and B about the walls it stayed outside, Grave Gamma and the faces. `gr-063` asks
  about the type's roof and the twenty tombs, which neither circle card asks. `gr-064` asks about the
  vault, Messenia and Menidi; `gr-065` about its passage, its façade and its name.
- *Image depicts the whole term:* for the civilisation, its soldiers on the Warrior Krater; for the
  citadel, the whole hill; for each monument, the monument itself; for the two types, an open shaft and a
  tholos passage leading to its door.

**Locators.**
- `gr-058` was re-fetched at Mycenae.
- `gr-059` Lion Gate, `gr-060` Grave Circle A, `gr-061` Grave Circle B and `gr-065` Treasury of Atreus
  point at their own articles' coordinates, each `within` Mycenae.
- `gr-056` keeps its region ring.
- `gr-057`, `gr-062`, `gr-063` and `gr-064` take none: a person, an object and two types.

### B8–B10 and half of B11 — `gr-066`–`gr-100`, Mycenaean Greece (2026-10-01)

Thirty-five cards of `gr-mycenae`, done as one run on request ("the next 35 cards"): B8 (`gr-066`–`gr-075`),
B9 (`gr-076`–`gr-085`), B10 (`gr-086`–`gr-095`) and the first five of B11 (`gr-096`–`gr-100`). Each was
rewritten in the rule order and applied with `add-card.js --replace --no-image`, the picture in a second
`--replace`. Research went out to six agents (neutral User-Agent, spaced calls); every key quote was then
checked against the saved copy before it was written.

Checks:
- `greece-audit.js --range=gr-066:gr-100` reads clean on every card but one: `gr-091` keeps an
  `S.chip?` for Judson's English review of an Italian corpus (`delle` in the reviewed title), read by eye
  as English, as on `gr-053`.
- `check-questions`, `check-style`, `check-cards --prefix=gr-06`…`gr-10`, `check-docs` and
  `split-cards --check` pass; `check-citations --card` reports 0 mismatched on every card.
- `check-gloss-links --card`: four cards link a term from another region (*Egyptian* on `gr-073`,
  `gr-089` and `gr-093`, *Pharaoh* on `gr-093`, *Etruscan* on `gr-075`); each was read and means what it
  links to.
- All 167 citation URLs answer 200. **Graziadio's DOI (`gr-092`) answered 200 on one try in three**: the
  proxy drops the tunnel to edizionicafoscari.it mid-exchange. **Powell et al. 2022 (`gr-094`) is cited at
  its PMC copy**: the DOI goes to science.org, which answers 403 to scripts. The AJA articles are cited at
  `ajaonline.org`, as in B7.
- The abstracts run 270–285 words. Every sort year was read back with app.js's own `cardYears`;
  **`gr-092`'s "15th century BCE" was not read as a year** and sorted at 1889, so its line is now
  c. 1500 – 1400 BCE.

**What changed, card by card** (sources before → after).

| card | bar | sources | the main changes |
|---|---|---|---|
| `gr-066` Cyclopean masonry | 6 | 5 → 8 | **"The stones were held to be past the strength of men" is in neither Strabo 8.6.11 nor Pausanias 2.16.5**; Pausanias 2.25.8's mules now carry it. **The site list leaned on an Odysseus page that names only Mycenae**; Rutter 21 alone carries it. Added Boswinkel's labour figures (Blackwell's BMCR), the Tiryns circuit (Odysseus) and Midea's wall (Swedish Institute). The Lion Gate photograph (`gr-059`'s subject) was replaced by the walls of Tiryns. |
| `gr-067` Tiryns | 6 | 6 → 9 | **"The lower citadel was left undug" was Schuchhardt's 1891 position**; Kilian dug it in 1976–83. **The Homeric-house passage is Leaf's introduction, p. xxxi, not Schuchhardt pp. xxi–xxii**, and is no longer cited. Added the post-palatial Lower Citadel (Kramer-Hajos on Damm-Meinhardt), the lower town rebuilt at once (Bennet, *Chronique* 5591), Heracles (Apollodorus 2.4.12). The Dodwell engraving was replaced by a photograph. |
| `gr-068` Palace of Nestor | 6 | 6 → 10 | **"The worst depopulation of any part of Greece" drops Rutter's "southern"**; restored. **The why-answer's 1,107 tablets and 32 scribes came from a lesson not on the card** and disagreed with the abstract; Judson's c. 1,000 and 30–40 are used throughout. Added the 1939 discovery and war stoppage (the excavation project's site), *pu-ro* and Messenia (Petrakis), and the Griffin Warrior. |
| `gr-069` Mycenaean Thebes | 6 | 5 → 7 | **The two round towers of the Electran Gate are Kassander's (315 BCE)**, not Mycenaean, and are gone. The 1993–95 tablets are now 238 (Dickey's BMCR review), found in the Armoury in Pelopidou Street (the Thebes museum reconciles the two names). The destruction is "not long after 1225 BCE" (Aravantinos et al.) against "around 1200" (museum). |
| `gr-070` Midea | 5 | 6 → 6 | **"Two gates, east and west" was only implied by the old source**; the Swedish Institute's page now carries the East and West Gates and the sally port (Rutter 21 says one gate and a postern). Added the wheat sealing, the crushed skeletons, and Millek's warfare reading (Middleton 2024). |
| `gr-071` Gla | 5 | 5 → 7 | **The old "destroyed before 1200 BCE, earlier than the Argive citadels" is superseded**: the excavators (Lane and Kountouri, MYNEKO 2016) date it ca. 1300 – 1190 BCE, burnt, rebuilt, burnt again ca. 1190. **"A palace" softened** to Rutter's "a citadel but arguably not a palace". Added the 2,000 tonnes of grain (AROURA) and the Thebes–Orchomenos joint-venture reading (Knodell on Kramer-Hajos). The plan was replaced by a photograph of the slab walls. |
| `gr-072` megaron | 6 | 5 → 7 | **The Leaf quotation was cited to the wrong pages**; dropped. Added Homer's hall (*Od.* 6.303–9), Tsountas's measurements and Darcque's doubt about a cult role. The tags now open on `practice`: a building type with no place of its own. |
| `gr-073` Mycenaean fresco | 6 | 5 → 7 | **"Earliest c. 1500 BCE" is out of date**: Egan and Van de Moortel put the first mainland fragments at Pylos in MH III. **"Painted on wet plaster" is the disputed half of a debate** (Brecoulaki's secco against Brysbaert); both are given. The Gilliéron facsimile was replaced by a photograph of the Tiryns boar-hunt fragments. |
| `gr-074`–`gr-086`, `gr-096` | | | Rewritten before this ledger entry was drafted, on the Linear B and institutions sources (Palaima's PASP papers, Nakassis, Nikoloudis, Lupack, Judson, the AJA 2011 redistribution forum, the Cambridge Mycenaean Epigraphy Group). **Dropped as unsourced or wrong**: Linear A "unread", Linear B "forgotten after the collapse", "40–50 tusk plates", "~100,000 sheep" and the Pylos A-series head-counts. |
| `gr-087` Mycenaean chariot | 6 | 6 → 10 | **Rutter's "no chariots in northern Europe" was a point in a debate**, not a fact, and is gone. Added the Knossos force as 500 – 1,000 (Drews, via Gill) against 173 – 250 (Palaima 1999), the 151 wheels, Nestor's order of battle (*Il.* 4.297–309) and the Mycenae wheel ruts. |
| `gr-088` Dendra panoply | 5 | 5 → 6 | **"Buried c. 1500 BCE" is now c. 1400 BCE** (Swedish Institute: end of the 15th century). **Tomb 12 held a single man and was reached by a shaft**, so "among his relatives" and "a long passage" are gone. **Drews said cavalryman, not chariot rider.** "Hellenic Army marine brigade" is now "Greek marines"; the PLOS paper is 2024, not 2023. |
| `gr-089` boar's tusk helmet | 6 | 5 → 7 | **"40–50 tusk plates" is in no open scholarly source**; Tsountas's sixty tusks from Shaft Grave IV replace it. Added the Battle in the Glen seal (Lewartowski 2019), the Griffin Warrior's helmet and the 12th-century disappearance (Rutter 28). |
| `gr-090` figure-of-eight shield | 5 | 5 → 9 | **The chevron "decoration" was a sentence about shading**, and "named from its two lobes" was in no source. **The silver Battle Krater page says nothing about shields**; dropped. Periphetes is cited at 15.645–51. Added Weilhartner (Minoan cult symbol), Janko and van Wees (Bloedow) for and against Homeric memory. |
| `gr-091` stirrup jar | 5 | 5 → 9 | The Cretan origin and the Uluburun jars (Bachhuber 2006), the trade from Sardinia to the Levant (Capra), the WA fragment from Gla (Lane). |
| `gr-092` Vapheio cups | 5 | 5 → 7 | **Graziadio's pages and site were wrong** (pp. 125 and 128; the painted cup is from Ayia Irini, not Toumba tou Skourou). **The "xenia" reading is Wiener's, not Davis's.** "Buried c. 1500 BCE" was unsourced; the date line is the tomb's 15th century (the Athens museum's seal) and the 1889 dig. Riegl (via Blakolmer) added for the both-Minoan view. |
| `gr-093` Mycenaean trade | 6 | 5 → 8 | Kelder 2009 is cited at its open AJA abstract (the DOI is a 403). Added the Gelidonya excavation (INA), the Amenhotep III objects (Bachhuber) and Anatolia's little pottery (Kelder 2004–5). |
| `gr-094` Uluburun shipwreck | 6 | 5 → 7 | **Berger et al. 2019 was framed as an answer to Powell 2022**, three years later; dropped. **"Tin in far greater quantity than any earlier find" was in no source.** The date line keeps INA's c. 1320 BCE, and the prose gives the debate (Smith; Bachhuber on the superseded 1305 dendro date). |
| `gr-095` Ahhiyawa | 5 | 5 → 7 | **Melchert's "frontier outposts" was one possibility**, stated as fact; now a why-answer saying so. **"Hiyawa-men as mercenaries" overstated** and is gone. The spelling is Nagy's *a-ah-hi-ya-a*. *The Ahhiyawa Texts* (2011) was **not** cited: the only copy found is a third-party archive.org upload whose open status the publisher's page could not confirm. Tags now open on `concept`. |
| `gr-097` Mycenaean expansion | 5 | 5 → 6 | Kalamianos is "thought to have been" Mycenae's main harbour **on the Saronic Gulf**, as Earle has it. Added Kos, Naxos and Keos (Petrakis's AJA review) and Rhodes (Lewartowski). The map with printed labels was replaced by Phylakopi's Mycenaean wall. |
| `gr-098` Mycenaean Miletus | 5 | 5 → 7 | **The Bronze Age town is by the temple of Athena, not on Kalabaktepe** (the Hamburg excavation). The two Hittite conquests (end of the 14th century, c. 1200 BCE) and the Ionian refoundation come from the same site. |
| `gr-099` drainage of Lake Copais | 5 | 5 → 8 | **"Reflooded c. 1100 BCE" traces to Mamassis's misreading of Strabo**; the date line drops it. **"The greater part of the Kephisos"** is now "one branch". The dyke is mid-13th century (Kountouri et al.), and the modern drainage 1882 – 1931 (AROURA). |
| `gr-100` Mycenaean road network | 5 | 5 → 6 | **Karaś and Tuan 2017 dropped** (predatory publisher), and with it **the mixing of the Kazarma bridge with an abutment near Mycenae**. The Kazarma bridge is 22 × 5.6 × 4 m, "about 1300 BC" (Odysseus). Added the Iklaina paved road (Cosmopoulos) and Tsountas on pack animals. |

**Corrected, refused and not usable.**
- **Not usable:** the Hesperia pages at ascsa.edu.gr (TLS failure), Heidelberg journals and Arctos (Anubis
  challenge), Project MUSE (verification page), science.org (403), the Batagianis thesis (no body).
- **Picture credits.** All 35 credits now name the author and the licence (29 were bare URLs, six cards had
  no picture). The Commons API was rate-limited for most of the run, so licences were read from the file
  pages. **Replaced:** `gr-066` (the Lion Gate, `gr-059`'s subject), `gr-067` (Dodwell's engraving),
  `gr-071` (a plan), `gr-073` (a Gilliéron facsimile), `gr-082` (the Pylos hearth, not the economy),
  `gr-086` (an Archaic Artemis Orthia plaque), `gr-095` (the Lady of Mycenae; now a Hittite-court
  letter from Hattusa) and `gr-097` (a map with printed labels). **Added:** `gr-079`, `gr-080`, `gr-081`,
  `gr-096` (Pylos tablets), `gr-098` (the site of Miletus) and `gr-099` (Dodwell's drawing of a Kopais
  sinkhole). No free photograph of the Bronze Age levels at Miletus or of Pylos's storerooms was found.
  **`gr-076`'s old caption said the tablet was "Minoan"** and named its excavator; it is now a Linear B
  tablet recording oil for the gods. Every caption that carried a museum number, a photographer or a
  Commons wrapper ("Information Description:") was rewritten.

**Read by eye.** Tiryns, Midea, Gla and Thebes are bare; the megaron, the Palace of Nestor and the
Vapheio cups take "the". `gr-093` and `gr-094` both ask about ships; `gr-094`'s first question was
reworded off `gr-093`'s Gelidonya question (Q.sibling 44%).

**Locators.** `gr-099` points at Lake Copais and `gr-100` at the Kazarma (Arkadiko) bridge, neither
title a redirect. `gr-072` megaron and `gr-095` Ahhiyawa take none: a building type, and a land with no
agreed place.

### B11–B14 — `gr-101`–`gr-135`, Mycenaean Greece and the Early Iron Age (2026-10-02)

Thirty-five cards: the last ten of `gr-mycenae` (`gr-101`–`gr-110`) and the first twenty-five of `gr-iron`
(`gr-111`–`gr-135`). The text was rewritten in the four WIP commits on `claude/greece-refinement-b12`
(merged as #381): questions, date lines, backgrounds, sources and Think-it-through, quote-checked against
saved copies. This entry closes the batch with the pictures, the last two locators, one correction to
`gr-123`, the chronology and this record.

Checks:
- `greece-audit.js --range=gr-101:gr-135` reads clean on 31 of 35 cards. The other four:
  - `gr-115` depopulation and `gr-122` cist grave have no picture (see below).
  - `gr-121`, `gr-122` and `gr-123` keep `S.chip?` flags, read by eye and all English. Two are chapters in
    the Austrian Academy volume *Brandbestattungen von der mittleren Donau bis zur Ägäis* (Lagia et al.;
    Palaiologou). The third is Papadopoulos's BMCR review of *Kerameikos* 18.
- `check-citations --card` matches every checkable citation on all 35 cards. `check-questions`,
  `check-style`, `check-cards --prefix=gr-1`, `check-docs` and `split-cards --check` pass.
- All 144 distinct citation URLs were re-curled:
  - The eCampusOntario chapters answer 403 to a bare User-Agent and 200 to a browser one.
  - The Perseus passages answered 503 while seven research agents were also reading Perseus. They
    answered 200 on a later retry.

**Pictures.** Every one of the 35 old pictures carried its file name as caption and alt, and a bare
Commons URL as credit. All 33 cards with a picture now carry a description of what is shown, a visual
alt, and a credit naming the author and the licence.

Replaced:
- **`gr-101`**: a labelled German map → a satellite view of the Isthmus.
- **`gr-103`**: a plan → a 1937 photograph of the dig, with the storage jars sunk in a house floor. The
  Troy VII wall photograph stays on the glossary's `Troy_VII`.
- **`gr-105`**: a 1915 war map → the strait.
- **`gr-106`**: a plan → the clay tablet of the Alaksandu treaty.
- **`gr-107`**: a Medinet Habu drawing → the ruins of Ugarit.
- **`gr-108`**: Champollion's printed list → the Philistine captives relief.
- **`gr-109`**: a gold seal → the palace ruins.
- **`gr-110`**: a pair of terracotta boots → a 12th-century figurine from the Tiryns lower citadel.
- **`gr-111`**: Early Geometric jewellery → the Lefkandi centaur, released by `gr-116`, which now shows
  the Xeropolis promontory.
- **`gr-112`**: a Protogeometric lekythos labelled Submycenaean → a Submycenaean amphora.
- **`gr-113`**: BM A1123 (PD, catalogue-number caption) → BM A1124 with its concentric circles.
- **`gr-114`**: a pot → a Geometric bronze horse, so the period and `gr-125`'s pottery differ.
- **`gr-120`**: a French furnace diagram → a Kerameikos cremation burial of 950 – 900 BCE with its iron sword.
- **`gr-121`**: a Hungarian Vatya urn → a Protogeometric cremation amphora from Attica.
- **`gr-123`**: a 1915 dig photograph → the site today.
- **`gr-125`**: a skyphos → an Attic Late Geometric ekphora krater.
- **`gr-126`**: a relief from a later hero cult → the Menidi tholos passage.
- **`gr-127`**: an illustration of the *Odyssey* → the Protogeometric bronze lyre-player from Crete, chosen over the Pylos lyre
  fresco, which is a watercolour reconstruction.
- **`gr-128`**: the Townley Homer manuscript, which is not Homer, → the British Museum bust. The
  manuscript stays on the glossary's `Homer`.
- **`gr-129`**: a Rembrandt painting → a page of the Venetus A.
- **`gr-131`**: a crop of a 15th-century manuscript → the Penelope Painter's Odysseus drawing his bow on
  the suitors. The Sirens stamnos BM E440 was refused: it is already on `gr-960`.
- **`gr-132`**: a scansion diagram with printed text → P. Oxy. 551. The Hawara papyrus was refused: it is
  already on `wh-314`.
- **`gr-133`**: none → Murko's 1925 photograph of the Bosniak guslar Osman-beg Selmanović with his gusle.
- **`gr-134`**: a Tiepolo picture → the Kleophrades Painter's rhapsode.
- **`gr-135`**: none → the Met's Hirschfeld krater, with chariots and soldiers.

Kept with new captions and credits: `gr-102`, `gr-117`, `gr-118`, `gr-119`, `gr-124` and `gr-130`.

Pictures still missing:
- **`gr-115` depopulation has no picture**: an absence of people has no honest photograph.
- **`gr-122` cist grave has none either.** Three Commons searches found only northern European cists
  (Denmark, Scotland, Jersey). A Greek card should not show one, so the card waits for a Greek photograph.

**Locators.**
- `gr-106` Wilusa now points at Troy, labelled "Troy". The text says Troy is widely identified as its
  capital, and the dot is not the kingdom.
- `gr-119` was re-fetched from Wikidata `Q140345` ("archaeological site in Andros island"). English
  Wikipedia has no article. The dot moved from [24.9, 37.8333], a rounded figure, to [24.8656, 37.7742].

**`gr-117`'s second question opened on "Its"**, which `check-questions` refuses; it now opens "The owner of the land". **Corrected.** `gr-123` said the Submycenaean "began about 1100 BCE", against `gr-112`'s c. 1070. The
figure is the ministry's (Iliopoulos), and the card now says so ("dated by the ministry from about 1100
BCE"). Two words were trimmed elsewhere to hold the sentence mean.

**Chronology.** Rows added for every date the 35 cards print, and pins for all 35. The provisional Early
Iron Age rows are corrected:
- **Submycenaean** c. 1075 – 1050 → **c. 1070 – 1000 BCE**. The end is Toffolo et al.'s radiocarbon date;
  the start is another team's figure, which they take as likely.
- **Protogeometric** keeps the conventional c. 1050 – 900 BCE, with its radiocarbon start of c. 1020 –
  1000 BCE as a second row.

**Read by eye.** Each new picture was looked at on a contact sheet before it was chosen. The article,
sibling and coverage reading of the text was done when it was written, in the WIP commits.
