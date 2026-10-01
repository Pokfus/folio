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
