# The World History refinement audit (Oct 2026)

The World History collection (`col-8`, `wh-001`–`wh-1000`, plan in `docs/world-history-card-plan.md`) is
complete, and was written quickly in bulk. This is the pass that audits and refines ALL of it, in batches of
ten in plan order, to one set of rules — so expect unsourced claims, wrong dates and shaky citations, and
record each one found.

**The model is the Ancient Greece audit, `docs/greece-refinement-audit.md`, and its settled rules apply here
unchanged** — read its "The rules" section; they are not restated. What is mechanical is measured by
`node .claude/wh-audit.js` (report-only; `--range=wh-001:wh-010`, `--card=`, `--summary`, `--worst`), which is
`greece-audit.js` run with a World History config; what only a reader can judge is read by eye and recorded
in the ledger at the foot of this file, batch by batch.

## The rules

### The Greece rules, as applied here

- **Questions**: 3 phrasings, one sentence each, 20–34 words, blank mid-sentence; **no year, century,
  millennium, decade — and, here, no figure of years either** ("3.2 million years ago", "40,000 years",
  "kya", "BP"): in a prehistory deck a span of years is a date. Siblings are told apart by who, where and
  what. No modern scholar named, except on the cards the plan's named-person budget gives one
  (`wh-090 Ancient DNA`, `wh-822 Charles Darwin`) and on a card whose subject IS that person.
- **Background**: 10 sentences, 5 + 5, **270–285 words** (the top of the 270–330 bar, where the mean of
  28.5 words a sentence holds); written for a 15-year-old new to the topic; complete against the term's own
  Wikipedia article as a checklist (never cited); at most 2 sentences on modern discovery and 3 on debate.
- **Sources**: the tiered bar by difficulty (1 → 9, 2 → 8, 3 → 7, 4 → 6, 5 → 5); a modern author in at most
  2 sources; at least half modern scholarship; at most one source per non-English language, each with its
  chip; every URL curled; every key quote read on the page fetched; every source pointed at by a marker.
- **Think it through**: exactly 3 FAQs, written apart from the background (4-gram overlap aims under 25%,
  a fault at 50%), each answer 12–60 words with explicit numbered markers into the card's own list.
- **Date line**: ≤ 4 rows, labels ≤ 16 characters, era on every year under 1000, `c.` in front of a range,
  start and end as completely as the sources allow; deep time in the compact notation (`c. 3.2 Mya`,
  `c. 4.2 – 2 Mya`, `115,000 – 11,700 BP`); agrees with `docs/wh-chronology.md` and its pins.
- **Picture**: depicts the whole term; PD, CC0, CC BY or CC BY-SA; a credit naming author and licence; a
  description that names no source, licence or file; on no other card.
- **Locator**: through `add-locators.js`, never typed; a place, site, city, building, battle, state or
  fossil find with somewhere to stand gets one.
- **Glossary**: each card's answer term has an entry, and the entry and the card agree (date, figures,
  claims). An entry is corrected in the same commit as its card.

### What World History adds

- **The three faults to look for first**, which the Greece audit found again and again and a broad survey
  makes easier: a **modern scholar's idea presented as an ancient (or prehistoric) fact**; a **date that
  belongs to a different event** (a discovery year for an occupation year, a description year for a
  fossil's age, one site's date given to a whole culture); and **a figure no source gives**.
- **Deep time is contested and the card says so.** A date for a fossil, a dispersal or a cave painting is
  a measurement with a method and an error bar; give the range the sources give, and where two methods
  disagree, give both and say whose each is.
- **History, not archaeology** (`docs/world-history-card-plan.md`, "History, not archaeology"): the
  prehistory decks are known almost entirely through excavation, which is exactly why the prose must stay
  on what the past was rather than on who dug it.

## Working a card

Per card, in this order: questions → date line → background → sources → Think it through → image →
locator → glossary. Write with `node .claude/add-card.js <patch.json> --replace --no-image`, then a second
`--replace` for the picture; locators with `node .claude/add-locators.js`.

After each batch: `wh-audit.js --range=`, `check-questions.js`, `check-style.js`, `check-cards.js
--prefix=wh-`, `check-docs.js`, `split-cards.js --check` and `test-card-plans.js`; then the ledger entry,
chronology rows and pins, glossary candidates and one changelog line (count and collection only) with a
version bump, all in one commit.

## The tools (Batch 0)

| tool | what it does |
|---|---|
| `.claude/wh-audit.js` | report-only per-card check of every mechanical rule — `greece-audit.js` under a World History config, plus deep-time question dates, fossil and state locators, and the card–glossary pairing (`G.none`, `G.date`) |
| `.claude/greece-audit.js` | now takes `global.AUDIT_CFG` (prefix, chronology file, extra checks); run directly it is the Greece audit, output byte-identical |
| `docs/wh-chronology.md` | the conventions and the dates the collection commits to, with the `chronology-pins` block `wh-audit.js` checks |

**The baseline, measured before any batch** (`node .claude/wh-audit.js --summary`, 2026-10-01):

```
wh-audit: 1000 card(s), 0 with no finding
  B.sentence-length 888 card(s)
  D.c-in-range      4 card(s)
  D.era             47 card(s)
  D.label           37 card(s)
  D.not-a-date      128 card(s)
  D.not-in-prose    364 card(s)
  G.date            24 card(s)
  G.none            6 card(s)
  I.caption-source  6 card(s)
  I.duplicate       22 card(s)
  I.none            197 card(s)
  L.missing         69 card(s)
  Q.date            841 card(s)
  Q.sibling         68 card(s)
  S.ancient-cap     40 card(s)
  S.bar             736 card(s)
  S.chip?           38 card(s)
  S.lang-cap        44 card(s)
  S.modern-cap      21 card(s)
  S.modern-half     68 card(s)
  W.no-marker       1000 card(s)
  W.not-why         4 card(s)
  W.overlap         543 card(s)
  W.overlap-high    534 card(s)
```

As in Greece, three of these are the rules arriving rather than faults found: `W.no-marker` (no answer
was marked before the rule), `S.bar` (the bar rose from a flat 5) and `B.sentence-length` (the house
register ran ~30 words a sentence). `Q.date` is the large real finding: 841 cards carry a date or a span of
years in a question. `S.lang-cap` (44 cards with two sources in one non-English language) and
`I.duplicate` (22) are worth a collection-wide sweep of their own.

## The batches

Ten cards each, in plan order. "Findings" is the baseline count from `wh-audit.js --worst` (findings
summed over the ten cards), the measure for picking the worst batches first; batches are nonetheless done
in plan order unless the user says otherwise.

| batch | deck | cards | n | findings | state |
|---|---|---|---|---|---|
| B1 | Human origins (`wh-evolution`) | `wh-001`–`wh-010` | 10 | 96 | **done 2026-10-02** |
| B2 | Human origins (`wh-evolution`) | `wh-011`–`wh-020` | 10 | 100 | **done 2026-10-02** |
| B3 | Human origins (`wh-evolution`) | `wh-021`–`wh-030` | 10 | 104 | **done 2026-10-02** |
| B4 | Human origins (`wh-evolution`) | `wh-031`–`wh-040` | 10 | 101 | **done 2026-10-02** |
| B5 | Human origins (`wh-evolution`) / The Palaeolithic (`wh-paleolithic`) | `wh-041`–`wh-050` | 10 | 90 | **done 2026-10-02** |
| B6 | The Palaeolithic (`wh-paleolithic`) | `wh-051`–`wh-060` | 10 | 96 | **done 2026-10-02** |
| B7 | The Palaeolithic (`wh-paleolithic`) | `wh-061`–`wh-070` | 10 | 97 | **done 2026-10-02** |
| B8 | The Palaeolithic (`wh-paleolithic`) | `wh-071`–`wh-080` | 10 | 98 | **done 2026-10-02** |
| B9 | The Palaeolithic (`wh-paleolithic`) / Peopling the planet (`wh-peopling`) | `wh-081`–`wh-090` | 10 | 94 | **done 2026-10-02** |
| B10 | Peopling the planet (`wh-peopling`) | `wh-091`–`wh-100` | 10 | 101 | **done 2026-10-02** |
| B11 | Peopling the planet (`wh-peopling`) | `wh-101`–`wh-110` | 10 | 96 | **done 2026-10-02** |
| B12 | The Neolithic transition (`wh-neolithic`) | `wh-111`–`wh-120` | 10 | 95 | **done 2026-10-02** |
| B13 | The Neolithic transition (`wh-neolithic`) | `wh-121`–`wh-130` | 10 | 93 | **done 2026-10-02** |
| B14 | The Neolithic transition (`wh-neolithic`) | `wh-131`–`wh-140` | 10 | 101 | **done 2026-10-02** |
| B15 | Neolithic worlds (`wh-early-villages`) | `wh-141`–`wh-150` | 10 | 94 | **done 2026-10-02** |
| B16 | Neolithic worlds (`wh-early-villages`) | `wh-151`–`wh-160` | 10 | 99 | **done 2026-10-02** |
| B17 | Neolithic worlds (`wh-early-villages`) | `wh-161`–`wh-170` | 10 | 95 | **done 2026-10-02** |
| B18 | Mesopotamia (`wh-mesopotamia`) | `wh-171`–`wh-180` | 10 | 104 | **done 2026-10-02** |
| B19 | Mesopotamia (`wh-mesopotamia`) | `wh-181`–`wh-190` | 10 | 117 | **done 2026-10-02** |
| B20 | Mesopotamia (`wh-mesopotamia`) | `wh-191`–`wh-200` | 10 | 105 | **done 2026-10-02** |
| B21 | Ancient Egypt (`wh-egypt`) | `wh-201`–`wh-210` | 10 | 105 | **done 2026-10-03** |
| B22 | Ancient Egypt (`wh-egypt`) | `wh-211`–`wh-220` | 10 | 125 | **done 2026-10-03** |
| B23 | Ancient Egypt (`wh-egypt`) | `wh-221`–`wh-230` | 10 | 125 | **done 2026-10-03** |
| B24 | The Indus and early China (`wh-indus-china`) | `wh-231`–`wh-240` | 10 | 93 | **done 2026-10-03** |
| B25 | The Indus and early China (`wh-indus-china`) | `wh-241`–`wh-250` | 10 | 101 | **done 2026-10-03** |
| B26 | The Indus and early China (`wh-indus-china`) / The Bronze Age world (`wh-bronze-age`) | `wh-251`–`wh-260` | 10 | 99 | **done 2026-10-03** |
| B27 | The Bronze Age world (`wh-bronze-age`) | `wh-261`–`wh-270` | 10 | 117 | **done 2026-10-03** |
| B28 | The Bronze Age world (`wh-bronze-age`) | `wh-271`–`wh-280` | 10 | 98 | **done 2026-10-03** |
| B29 | Iron Age Near East and Persia (`wh-near-east`) | `wh-281`–`wh-290` | 10 | 108 | **done 2026-10-03** |
| B30 | Iron Age Near East and Persia (`wh-near-east`) | `wh-291`–`wh-300` | 10 | 97 | **done 2026-10-03** |
| B31 | Iron Age Near East and Persia (`wh-near-east`) | `wh-301`–`wh-310` | 10 | 100 | open |
| B32 | Greece and the Hellenistic world (`wh-greece`) | `wh-311`–`wh-320` | 10 | 121 | open |
| B33 | Greece and the Hellenistic world (`wh-greece`) | `wh-321`–`wh-330` | 10 | 123 | open |
| B34 | Greece and the Hellenistic world (`wh-greece`) / Rome (`wh-rome`) | `wh-331`–`wh-340` | 10 | 126 | open |
| B35 | Rome (`wh-rome`) | `wh-341`–`wh-350` | 10 | 126 | open |
| B36 | Rome (`wh-rome`) | `wh-351`–`wh-360` | 10 | 104 | open |
| B37 | Rome (`wh-rome`) | `wh-361`–`wh-370` | 10 | 106 | open |
| B38 | Rome (`wh-rome`) / Ancient India (`wh-ancient-india`) | `wh-371`–`wh-380` | 10 | 97 | open |
| B39 | Ancient India (`wh-ancient-india`) | `wh-381`–`wh-390` | 10 | 91 | open |
| B40 | Ancient India (`wh-ancient-india`) / Ancient China (`wh-ancient-china`) | `wh-391`–`wh-400` | 10 | 88 | open |
| B41 | Ancient China (`wh-ancient-china`) | `wh-401`–`wh-410` | 10 | 98 | open |
| B42 | Ancient China (`wh-ancient-china`) / Africa and the Americas in antiquity (`wh-antiquity-beyond`) | `wh-411`–`wh-420` | 10 | 114 | open |
| B43 | Africa and the Americas in antiquity (`wh-antiquity-beyond`) | `wh-421`–`wh-430` | 10 | 112 | open |
| B44 | Africa and the Americas in antiquity (`wh-antiquity-beyond`) / Byzantium and the Christian East (`wh-byzantium`) | `wh-431`–`wh-440` | 10 | 101 | open |
| B45 | Byzantium and the Christian East (`wh-byzantium`) | `wh-441`–`wh-450` | 10 | 99 | open |
| B46 | Byzantium and the Christian East (`wh-byzantium`) / The Islamic world (`wh-islam`) | `wh-451`–`wh-460` | 10 | 108 | open |
| B47 | The Islamic world (`wh-islam`) | `wh-461`–`wh-470` | 10 | 97 | open |
| B48 | The Islamic world (`wh-islam`) | `wh-471`–`wh-480` | 10 | 98 | open |
| B49 | The Islamic world (`wh-islam`) / Medieval Europe (`wh-medieval-europe`) | `wh-481`–`wh-490` | 10 | 99 | open |
| B50 | Medieval Europe (`wh-medieval-europe`) | `wh-491`–`wh-500` | 10 | 99 | open |
| B51 | Medieval Europe (`wh-medieval-europe`) | `wh-501`–`wh-510` | 10 | 65 | open |
| B52 | Medieval Europe (`wh-medieval-europe`) | `wh-511`–`wh-520` | 10 | 89 | open |
| B53 | East Asia (`wh-east-asia`) | `wh-521`–`wh-530` | 10 | 106 | open |
| B54 | East Asia (`wh-east-asia`) | `wh-531`–`wh-540` | 10 | 75 | open |
| B55 | East Asia (`wh-east-asia`) / South and Southeast Asia (`wh-south-asia`) | `wh-541`–`wh-550` | 10 | 89 | open |
| B56 | South and Southeast Asia (`wh-south-asia`) | `wh-551`–`wh-560` | 10 | 76 | open |
| B57 | South and Southeast Asia (`wh-south-asia`) / Africa (`wh-africa`) | `wh-561`–`wh-570` | 10 | 93 | open |
| B58 | Africa (`wh-africa`) | `wh-571`–`wh-580` | 10 | 74 | open |
| B59 | Africa (`wh-africa`) / Steppe empires and the Mongols (`wh-steppe`) | `wh-581`–`wh-590` | 10 | 79 | open |
| B60 | Steppe empires and the Mongols (`wh-steppe`) | `wh-591`–`wh-600` | 10 | 81 | open |
| B61 | The Americas before Columbus (`wh-americas`) | `wh-601`–`wh-610` | 10 | 69 | open |
| B62 | The Americas before Columbus (`wh-americas`) | `wh-611`–`wh-620` | 10 | 68 | open |
| B63 | Renaissance, Reformation and the new science (`wh-renaissance`) | `wh-621`–`wh-630` | 10 | 81 | open |
| B64 | Renaissance, Reformation and the new science (`wh-renaissance`) | `wh-631`–`wh-640` | 10 | 73 | open |
| B65 | Renaissance, Reformation and the new science (`wh-renaissance`) | `wh-641`–`wh-650` | 10 | 81 | open |
| B66 | Renaissance, Reformation and the new science (`wh-renaissance`) / Voyages, conquest and exchange (`wh-voyages`) | `wh-651`–`wh-660` | 10 | 81 | open |
| B67 | Voyages, conquest and exchange (`wh-voyages`) | `wh-661`–`wh-670` | 10 | 76 | open |
| B68 | Voyages, conquest and exchange (`wh-voyages`) | `wh-671`–`wh-680` | 10 | 73 | open |
| B69 | Voyages, conquest and exchange (`wh-voyages`) / The gunpowder empires (`wh-gunpowder`) | `wh-681`–`wh-690` | 10 | 80 | open |
| B70 | The gunpowder empires (`wh-gunpowder`) | `wh-691`–`wh-700` | 10 | 78 | open |
| B71 | The gunpowder empires (`wh-gunpowder`) | `wh-701`–`wh-710` | 10 | 72 | open |
| B72 | Ming and Qing China, Tokugawa Japan (`wh-ming-qing`) | `wh-711`–`wh-720` | 10 | 80 | open |
| B73 | Ming and Qing China, Tokugawa Japan (`wh-ming-qing`) / Slavery and the Atlantic world (`wh-slavery`) | `wh-721`–`wh-730` | 10 | 78 | open |
| B74 | Slavery and the Atlantic world (`wh-slavery`) | `wh-731`–`wh-740` | 10 | 75 | open |
| B75 | Slavery and the Atlantic world (`wh-slavery`) / The age of revolutions (`wh-age-of-revolutions`) | `wh-741`–`wh-750` | 10 | 76 | open |
| B76 | The age of revolutions (`wh-age-of-revolutions`) | `wh-751`–`wh-760` | 10 | 65 | open |
| B77 | The age of revolutions (`wh-age-of-revolutions`) | `wh-761`–`wh-770` | 10 | 72 | open |
| B78 | The age of revolutions (`wh-age-of-revolutions`) / The Industrial Revolution (`wh-industrial`) | `wh-771`–`wh-780` | 10 | 79 | open |
| B79 | The Industrial Revolution (`wh-industrial`) | `wh-781`–`wh-790` | 10 | 82 | open |
| B80 | The Industrial Revolution (`wh-industrial`) | `wh-791`–`wh-800` | 10 | 77 | open |
| B81 | Nations, ideologies and reform (`wh-nations`) | `wh-801`–`wh-810` | 10 | 76 | open |
| B82 | Nations, ideologies and reform (`wh-nations`) | `wh-811`–`wh-820` | 10 | 103 | open |
| B83 | Nations, ideologies and reform (`wh-nations`) / Empire and the colonised world (`wh-imperialism`) | `wh-821`–`wh-830` | 10 | 94 | open |
| B84 | Empire and the colonised world (`wh-imperialism`) | `wh-831`–`wh-840` | 10 | 98 | open |
| B85 | Empire and the colonised world (`wh-imperialism`) | `wh-841`–`wh-850` | 10 | 91 | open |
| B86 | Empire and the colonised world (`wh-imperialism`) / A connected world, 1850–1914 (`wh-global-1900`) | `wh-851`–`wh-860` | 10 | 99 | open |
| B87 | A connected world, 1850–1914 (`wh-global-1900`) | `wh-861`–`wh-870` | 10 | 105 | open |
| B88 | The First World War (`wh-ww1`) | `wh-871`–`wh-880` | 10 | 94 | open |
| B89 | The First World War (`wh-ww1`) | `wh-881`–`wh-890` | 10 | 108 | open |
| B90 | The First World War (`wh-ww1`) / Between the wars (`wh-interwar`) | `wh-891`–`wh-900` | 10 | 101 | open |
| B91 | Between the wars (`wh-interwar`) | `wh-901`–`wh-910` | 10 | 100 | open |
| B92 | Between the wars (`wh-interwar`) / The Second World War (`wh-ww2`) | `wh-911`–`wh-920` | 10 | 103 | open |
| B93 | The Second World War (`wh-ww2`) | `wh-921`–`wh-930` | 10 | 103 | open |
| B94 | The Second World War (`wh-ww2`) | `wh-931`–`wh-940` | 10 | 104 | open |
| B95 | The Second World War (`wh-ww2`) / The Cold War (`wh-cold-war`) | `wh-941`–`wh-950` | 10 | 98 | open |
| B96 | The Cold War (`wh-cold-war`) | `wh-951`–`wh-960` | 10 | 101 | open |
| B97 | The Cold War (`wh-cold-war`) | `wh-961`–`wh-970` | 10 | 103 | open |
| B98 | Decolonisation and the new nations (`wh-decolonisation`) | `wh-971`–`wh-980` | 10 | 102 | open |
| B99 | Decolonisation and the new nations (`wh-decolonisation`) / The contemporary world (`wh-contemporary`) | `wh-981`–`wh-990` | 10 | 99 | open |
| B100 | The contemporary world (`wh-contemporary`) | `wh-991`–`wh-1000` | 10 | 96 | open |

## Running a batch (the harness, `.claude/wh-refine/`)

The first hundred were run with a small harness that is now in the repo, so a later session does not
rebuild it. It keeps its working files in a scratch directory **outside the repo** (`WH_S`).

1. `WH_S=/path/to/scratch node .claude/wh-refine/prep.js 101 200` writes `cur/<id>.json` (the card and its
   glossary entry as they stand), `index.tsv` (every card's answer and question, for sibling checks) and
   empty `out/` and `pages/`.
2. One research agent per **two** cards, ten at a time, each told to read `.claude/wh-refine/BRIEF.md` and
   to follow it exactly. An agent saves every cited page to `pages/<id>-s<N>.txt`, writes
   `out/<id>.json` (a patch, a locator request, a glossary draft, and for each source the passages that
   carry its claims) and runs `WH_S=… node .claude/wh-refine/precheck.js <id>` until it says OK. Precheck
   runs the real `add-card.js --replace --dry-run` and `wh-audit.js` on the merged card, matches every
   quoted passage against the saved page, and checks the glossary draft.
3. **Read every draft yourself before applying** (questions, date line, the change notes): agents get
   things wrong, and the ledger's "what changed" column is the record of what they found wrong on the old
   card.
4. `WH_S=… .claude/wh-refine/batch.sh 101 110` curls every citation URL, applies the ten drafts
   (`apply.js`: text, then picture, then glossary, then one `add-locators.js` batch), and runs the audit,
   `check-questions`, `check-cards` and `check-citations`. Then the ledger, chronology rows and pins,
   changelog and version, `check-docs`, `split-cards --check`, `test-card-plans`; commit and push.

**Lessons from the first hundred.**
- Wikimedia rate-limits this sandbox hard once ten agents share its IP, and it did not recover. Give each
  agent at most ~10 Commons calls with 10-second gaps and a single retry (it is in the brief), and expect
  to defer pictures to a pass of their own (the "Pictures to redo" table below).
- `check-questions.js` refuses a phrasing that opens on a pronoun (`Its`, `His`…), and the audit's sibling
  check catches near-identical phrasings across a deck's definitional cards; both showed up only at apply
  time, so precheck now runs the first.
- `add-locators.js` needs a Wikipedia article with a primary coordinate: "Qafzeh" had none, "Qafzeh Cave"
  did. A card whose locator has none is listed in the ledger rather than given a typed one.
- Style rules the checker enforces on the *merged* tree (`check-style.js`): no spelled-out ordinal
  millennia, no "AD".
- A card that sits in a deck of definitional cards (the Palaeolithic divisions) needs its three phrasings
  moved off the shared "division of the Old Stone Age" clue, or the sibling check fires.

## Glossary candidates

Terms the batches meet that have no entry, ranked by how many cards use them. Grep the keys AND the aliases
before adding one — `add-glossary.js` overwrites in silence.

| term | cards that use it | found in |
|---|---|---|

## Ledger

Newest last. Each entry says what changed, what was refused and why, and which of the rules no checker can
see were read by eye: the article, confusability with siblings, whether the image depicts the whole term,
and coverage against the term's own article.

### Batch 0 — tooling (2026-10-01)

Shipped `wh-audit.js`, the `AUDIT_CFG` hook in `greece-audit.js` (its own output unchanged, diffed), this
file and `docs/wh-chronology.md`. Nothing on any card changed.

### B1 — `wh-001`–`wh-010`, Human origins (2026-10-02)

All ten re-researched from scratch and rewritten in the rule order, applied with `add-card.js --replace
--no-image` and the picture in a second `--replace`. Research went to five agents working two cards each;
each saved every cited page as text and listed, per source, the passages carrying its claims. A
script then checked every listed passage against its saved page (substring match), ran the draft
through `add-card.js --dry-run` and the audit, and curled every URL. The drafts were then read by eye.

Checks:
- `wh-audit.js --range=wh-001:wh-010` reads clean on nine cards; `wh-010` keeps a `W.not-why` note (two of
  its FAQs open "How" and "Where").
- `check-questions`, `check-style`, `check-cards --prefix=wh-00`, `check-docs`, `split-cards --check` and
  `test-card-plans` pass; `check-citations --card` reports 0 mismatched on every card.
- Every citation URL answers 200.

**What changed, card by card** (sources before → after).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-001` Prehistory | 9 | 5 → 9 | **"Writing reached some regions only within the last few centuries" had no source**, and is gone; writing's four independent inventions and their dates now come from Woods, *Visible Language*. The start is the Smithsonian's "at least 2.6 million years ago", with Lomekwi's 3.3 Mya as an "Also dated" row (Braun et al. 2019 could not be opened). Added how prehistory is dated, the 1806 "thick fog", Wilson's 1851 coinage and the decolonising critique of the word. |
| `wh-002` Three-age system | 7 | 6 → 8 | **"Thomsen worked the scheme out from the objects" was wrong**: the Nationalmuseet says Vedel Simonsen proposed the three ages a decade before Thomsen's 1825 letter, which already called it "the old idea"; Thomsen's achievement was testing it on the collection. **The date line "1810s–1820s" had no source**; it is now Published 1836 / In English 1848. Hesiod and Lucretius added as forerunners. A question naming Thomsen and carrying 1836 rewritten. The picture was the Thomsen glossary term's portrait; now iron, bronze and stone axes. |
| `wh-003` Stone Age | 9 | 5 → 10 | **"Devised in the 1820s", "c. 3300 BCE" as the end, "99 per cent of human history" and "Lubbock named the Mesolithic" were all in no source**, and are gone. The start is now c. 3.3 Mya (Lomekwi) with the Oldowan c. 2.6 Mya as a second row. The African Early, Middle and Later Stone Age added. The single dolmen (one Neolithic tomb) replaced by flaked stone tools. |
| `wh-004` human evolution | 9 | 8 → 9 | **Five of eight sources were Smithsonian pages** (cap 2); now two. **"Under 500 cc" for Australopithecus** is gone with its source; walking upright is now dated by Laetoli (Raichlen et al. 2010). Added Darwin 1871 on Africa, the limit of ancient DNA, Reich et al. 2010 on Neanderthal and Denisovan admixture. A question carrying "millions of years ago" rewritten. |
| `wh-005` hominin | 7 | 6 → 7 | Three Smithsonian pages cut to two; Wood and Richmond 2000 (the tribe Hominini) and Pontzer 2012 added. **The glossary's "only Homo sapiens survives" was cited to sources that do not say it.** The Huxley frontispiece showed great apes, i.e. hominids, not hominins; replaced by a museum display of hominin skulls (it includes a chimpanzee and an orangutan skull for comparison and small exhibit labels; the one label-free alternative is `wh-004`'s own). The Australian Museum citation's date and author corrected. |
| `wh-006` Sahelanthropus | 6 | 5 → 7 | Date line now Lebatard et al.'s cosmogenic c. 7.2 – 6.8 Mya; a question carrying "7 million years" rewritten. **The case was one-sided**: Wolpoff et al. 2006 ("an ape") now sits against Williams et al. 2026. **The glossary tied the small canines to upright walking**, which no source does. The map was replaced by a cast of the Toumaï skull. |
| `wh-007` bipedalism | 8 | 5 → 8 | **"The oldest of the traits" is "one of the earliest"** (Smithsonian); **the lower-back curve "found in no other animal" had no source**. **Sockol et al.'s "75 per cent less energy" could not be read** (PNAS and PMC walled) and is gone. Laetoli cut to one sentence (it is `wh-011`'s). Added the disputed Sahelanthropus/Orrorin evidence, the c. 30 hypotheses (Niemitz 2010) and the arboreal-origin view. Questions carried "3.6 million years" and "75 per cent". |
| `wh-008` Ardipithecus | 6 | 5 → 6 | **"Well over 100 further individuals" had no source** (the museums give over 100 specimens). "Greek for ape" is "Latinised Greek". **The glossary's "straddle the human–chimp split" contradicts the split date** the collection now uses (8–6 Mya). Added the 1994/1995 naming and the dissenting foot and ankle studies (Prang 2019, 2025). Finger bones replaced by the whole Ardi skeleton. |
| `wh-009` Australopithecus | 8 | 7 → 8 | The 4.2 – 2 Mya range is now sourced end to end. Raymond Dart's name and 1925 out of the questions. Sentences that were `wh-010`–`wh-014`'s subjects cut; added the tooth-chemistry diets, the twenty-year wait for acceptance, and whether the genus is a natural group. |
| `wh-010` Lucy | 8 | 6 → 8 | **"Several hundred fragments" was cited to Wiseman 2023, which does not say it**; now the Institute of Human Origins, which also carries the 40 per cent, her age at death and the dating. **The brain figure was the species average (446 cc)**, now her own 388 ml (Gunz et al. 2020). Cause of death is now an open question (Kappelman 2016 against "no cause determined"). **The glossary cited a Smithsonian page for "kept at the National Museum of Ethiopia"**, which it does not say. "1974" out of a question; a Hadar locator added. |

The Think-it-through sets were all written fresh, with markers; the old sets were the background's own
sentences.

**Not usable from here:** PNAS (Cloudflare), PMC article pages (reCAPTCHA; Europe PMC full text used
where it exists, HTTP 500 on several), hal.science (Anubis), science.org, Springer (`wh-015`'s Li et al.).
Two paywalled papers (Dart 1925, Kappelman et al. 2016) were read at abstract or first paragraph only and
are cited for nothing beyond what that page says. **Wikimedia rate-limited the batch hard**, so the
picture work ran slow; every picture still has its licence and author from the Commons API.

**Read by eye.**
- *Article:* "the three-age system", "the Stone Age"; prehistory, human evolution, bipedalism, Lucy and
  the four genera bare; "a hominin".
- *Confusability:* `wh-002` and `wh-003` both used the no-Bronze-Age Africa clue, and the audit's sibling
  check caught it; `wh-003`'s now asks about its regional end. `wh-007` keeps Laetoli to one clause and no
  question, since `wh-011` owns it. `wh-005` and `wh-004` are told apart by classification against process.
- *Image depicts the whole term:* yes, except `wh-005` (a display, with two non-hominin skulls for
  comparison) and `wh-001`, where a museum's prehistory gallery stands for a period nothing can show whole.
- *Coverage:* against each term's Wikipedia article as a checklist; the gaps filled were dating (`wh-001`,
  `wh-010`), the forerunners and the non-European misfit (`wh-002`), and Africa's own Stone Age terms
  (`wh-003`).

**Locators.** `wh-006` (Djurab Desert; Toros-Menalla has no article, and the article's centroid is about
100 km from the site), `wh-008` (Middle Awash) and `wh-010` (Hadar) added through `add-locators.js`. The
other seven are periods, concepts or genera, with no place to stand.

**Glossary.** Every term for `wh-001`–`wh-010` but *Australopithecus* was rewritten to agree with its card
and to drop claims its sources did not carry (named above). No new candidate terms.

### B2 — `wh-011`–`wh-020`, Human origins (2026-10-02)

Run as B1 was: five agents, two cards each, every quote checked against its saved page by script, every
URL curled (all 200), every draft through `add-card.js --dry-run` and then read by eye.

Checks: `wh-audit.js --range=wh-011:wh-020` clean but for `W.not-why` notes on `wh-017` ("Can people
visit…") and `wh-018` (two FAQs open "Was" and "Did"). `check-questions` caught two phrasings opening on a
pronoun (`wh-018`, `wh-019`), reworded. `check-style`, `check-cards --prefix=wh-01`, `check-docs`,
`split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched on every card.
**`precheck` now also refuses a pronoun opening**, since that rule is `check-questions.js`'s and not the
audit's.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-011` Laetoli footprints | 7 | 5 → 8 | **"The smallest walker stepped in the largest one's prints" was wrong**: Masao et al. 2016 say the middle-sized one did, the smallest walking beside. The gait is now a debate (Raichlen 2010 straight-legged against Hatala 2016 more flexed). Site S's tall walker and the Site A second-hominin reading added; reburial and conservation in a FAQ. The diagram replaced by a trackway cast. |
| `wh-012` Taung Child | 7 | 5 → 7 | **"Three or four, from milk teeth" is now about 3.3 years** from tooth growth (Smithsonian). **"Blasted out of the quarry" is Dart's phrase for a monkey skull**, and "limestone filled the braincase" is now a natural stone cast. Falk 2012's cranial capacity dropped (unreadable). The skull's age is a range, c. 2.8 – 2.3 Mya, because sources disagree. The new picture has no printed scale. |
| `wh-013` Paranthropus | 6 | 6 → 6 | **End date c. 1.2 Mya is c. 1 Mya** (Australian Museum; Quinn and Lepre 2021). Added the 1938 naming, "robust" meaning the face and teeth, the carbon-isotope grass diet, and the 2025 *P. boisei* hand bones. |
| `wh-014` Lomekwi | 5 | 5 → 5 | **The artefact counts had no source**; now Harmand et al.'s 149 pieces by type. Dating is argon plus magnetostratigraphy. **The "natural fracture" critique was not in the paper cited for it**; the card now gives what Domínguez-Rodrigo and Alcalá argue (stratigraphic position) and the team's reply. Picture kept; **not re-viewed** (Wikimedia refused). |
| `wh-015` Knapping | 7 | 5 → 7 | Start moved from c. 2.6 to c. 3.3 Mya (Lomekwi). **"Edge-ground hatchets 65,000 years ago" was cited to a paper about grinding stones**, and is gone, with the unsourced granite and "purely subtractive" lines. Added indirect percussion, Sibudu pressure flaking over 77,000 years ago, heat treatment, Langda apprenticeships and the Brandon gunflint trade. |
| `wh-016` Oldowan | 7 | 5 → 7 | **"Named 1936" is "Described 1934"**: de la Torre 2011 quotes Leakey's 1934 "Oldowan culture" (1931 the first finds). Grahame Clark's Mode 1 out of a question. Added Ain Boucherit, plant and wood working, persistence beside the Acheulean (Semaw 2020), Nyayanga's possible 2.9 Mya and the Paranthropus question. Picture (one chopper) kept; alternatives could not be checked. |
| `wh-017` Olduvai Gorge | 7 | 6 → 7 | **Everything resting on Gentry et al. 1995 is gone** (its PDF is behind a bot wall): Kattwinkel 1911, Reck 1913, the 1892 spelling and the Maasai "sisal" name. **"15,000 BP" as the top of the deposits had no source.** Length and depth are the conservation authority's 55 km and 100 m (the glossary's 46 km had no source). Added FLK West's hand-axes (c. 1.7 Mya) and the c. 1.5 Mya bone tools. The draft's "from the 1930s" date row was cut (a decade is not a date line value). |
| `wh-018` Homo habilis | 8 | 5 → 8 | Questions carried 1964, a brain figure and a modern discoverer. **"Homo erectus lies alongside it at Olduvai" had no source**; the overlap is now Ileret's. The lifespan gives both museums' ranges. The 729–824 ml and "40 per cent" figures dropped for the sourced 610 cc average. The PD-Art licence on a 3-D replica was invalid; now a CC0 photo of the OH 7 casts. |
| `wh-019` Homo erectus | 8 | 5 → 8 | **The brain range "600 to 1,000 cc" was in no cited source**; Antón et al.'s 546 – 1,251 cc. **"The Caucasus by 1.8 Mya" was cited to a paper on cut-marked bones in Romania**; now Ferring et al. 2011 on Dmanisi. The trunk-shape claim (Bastir 2020, walled) dropped. **"Named 1894"**: the authority is "Dubois, 1892", so the row is now Found 1891. The cross-section drawing replaced by a photo of the Hexian braincase cast. |
| `wh-020` Homo ergaster | 6 | 5 → 6 | **"The body plan Homo erectus shows wherever it is found" was cited to a page that does not say it**; now one side of a debate. Questions carried 1975 and leaned on the Turkana Boy (`wh-021`). **The glossary's "eastern and southern Africa"** was cited to sources that do not say so. |

**Read by eye.** *Article:* "the Laetoli footprints", "the Taung Child", "the Oldowan"; the rest bare.
*Confusability:* `wh-013` and `wh-017` both mention Nutcracker Man, but one blanks a genus and the other a
place; `wh-016` and `wh-015` are told apart by industry against craft, and `wh-014` by place. `wh-019`
and `wh-020` were the risk pair: ergaster's clues are its name, its type jaw and the lumping debate.
*Image:* each shows its term; `wh-016`'s single chopper stands for the whole kit (re-check in a later
batch). *Coverage:* the gaps filled were the later record at Olduvai, the gait debate at Laetoli and the
toolmaker question on the Oldowan.

**Locators:** `wh-011` (Laetoli), `wh-012` (Taung), `wh-014` (Lomekwi, re-fetched), `wh-017` (Olduvai Gorge,
re-fetched).

**Glossary.** Nine of the ten terms rewritten to agree with their cards (the *Oldowan* entry already did).

### B3 — `wh-021`–`wh-030`, Human origins (2026-10-02)

Run as B1. **Wikimedia began refusing this sandbox outright during the batch** ("too many requests" on
every call, retries included), so from here picture work is paused: a draft keeps the card's current
picture, notes whether it looks wrong, and pictures get a pass of their own (see "Pictures to redo"
below). The pictures that did change in B3 were chosen and licence-checked before the block.

Checks: `wh-audit.js --range=wh-021:wh-030` clean but for `I.none` on `wh-029` and `wh-030` (neither had a
picture before; both are on the redo list) and `W.not-why` notes. `check-questions`, `check-style`,
`check-cards --prefix=wh-02`, `check-docs`, `split-cards --check`, `test-card-plans` pass;
`check-citations --card` 0 mismatched on every card; all 65 distinct citation URLs answer 200.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-021` Turkana Boy | 7 | 6 → 9 | **Age at death "about 12" was the 1985 reading**; tooth growth lines revised it to eight or nine. The adult height (163 cm against about 180) is a dispute, not a fact, and the "diseased spine" now rests on the reanalysis (an injured disc). The date is c. 1.6 – 1.5 Mya because sources split. A Czech-labelled skull photo replaced by a cast of the whole skeleton. |
| `wh-022` Out of Africa I | 7 | 6 → 9 | **"Java by 1.5 Mya" was cited to a paper about the LAST Homo erectus**; now cited to papers that carry it, and softened to "may have". Dmanisi corrected to 1.85 – 1.78 Mya. Added the traces before 2 Mya (Romania, China), the Sinai route, and several dispersals rather than one. An Italian-labelled arrow map replaced by an orbital photograph of the Africa–Asia junction. |
| `wh-023` Dmanisi | 6 | 5 → 8 | **One date, 1.8 Mya, was given to everything**; occupation is c. 1.85 – 1.78 Mya and the fossils c. 1.77 Mya (Ferring et al. 2011). Dropped "tools found 1983", the soft-food reading of the toothless skull and the claim that Skull 5's authors named three species as one lineage, none sourced. |
| `wh-024` Java Man | 7 | 7 → 8 | **"The first Homo erectus fossils ever found" is in no source read**; the card now says the Trinil skullcap defines the species. **Two Dutch sources** broke the one-per-language rule; the government news item, the 2025 handover and "Java's hell" went with it. Dated c. 830,000 – 380,000 BP (Pop et al. 2023). |
| `wh-025` Peking Man | 7 | 6 → 8 | **The deposit date 750,000 – 230,000 BP had no source**; now c. 780,000 – 400,000 years ago (Smithsonian, with a dating paper for c. 770,000 at the base). "More than 40 individuals" is "about 40"; "Canadian", "reckless" and "December 1941" had no source. Davidson Black out of the questions. A drawing replaced by a photograph of the replica skull. |
| `wh-026` Zhoukoudian | 6 | 6 → 8 | **The Upper Cave's 38,300 – 33,500 came from a paper that could not be opened**; now "at least 35,100 – 33,500 years ago" (Li et al. 2018, abstract). Dropped the World Heritage row (UNESCO unreachable), the fauna list, "at least eight" people and "three ochre-coated skulls". The fire debate gives both sides. |
| `wh-027` Acheulean | 7 | 5 → 8 | The end now varies by region (350,000 – 200,000 years ago in western Europe and South Asia, later in East Asia, 125,000 in one review), and the line reads c. 1.76 Mya – 125,000 years ago. **"Credited to Homo heidelbergensis" dropped**: a 2026 review calls the species strongly debated. "Pushed back 300,000 years" had no source. A captioned engraving replaced by a Saint-Acheul hand axe. |
| `wh-028` Hand axe | 8 | 5 → 8 | **The thunderstone opening was cited to a paper about Neolithic axes**, and is gone. "12–20 cm typical", "pocket knife" and Lyell's part in the 1859 visit had no source. **The giant hand axe article had the wrong title and authors**; read off the article's own "Cite this as" (Crossref's record differs). Frere 1800 and Prestwich 1860 added as primary sources. |
| `wh-029` control of fire | 8 | 5 → 8 | The cooking-hypothesis angle (that is `wh-031`) taken out. "Three feats, each harder than the last" was an unsourced framing; Gesher Benot Ya'aqov is c. 780,000, not 790,000. Earliest traces c. 1.5 Mya against habitual use c. 400,000 years ago. `undatable` now false. |
| `wh-030` Wonderwerk Cave | 5 | 5 → 6 | **"The oldest cave occupation anywhere" softened** to a candidate, and **"the earliest solid evidence of fire"** hedged with the sceptical view. Dropped the 4-metre depth, the art dates and "Homo erectus brought fire in from outside". |

**Read by eye.** *Article:* "the Turkana Boy", "the Acheulean", "the hand axe", "the control of fire";
Dmanisi, Java Man, Peking Man, Zhoukoudian, Wonderwerk Cave and Out of Africa I bare. *Confusability:*
`wh-025` and `wh-026` share Locality 1, so Peking Man is asked through the lost fossils and the casts, and
Zhoukoudian through its hyenas, Upper Cave and fire debate. `wh-027`/`wh-028` are tradition against object;
`wh-029`/`wh-030`/`wh-031` share fire, told apart by practice, place and hypothesis. *Coverage:* the gaps
filled were the later reanalyses (`wh-021`), several dispersals (`wh-022`) and the end of the Acheulean.

**Locators.** `wh-021` (Lake Turkana, labelled Nariokotome; the article has no findspot of its own),
`wh-023` (Dmanisi), `wh-024` (Trinil), `wh-025`/`wh-026` (Zhoukoudian), `wh-030` (Wonderwerk Cave).

**Glossary.** Nine of the ten terms rewritten to agree with their cards (*Hand axe* already did).

### B4 — `wh-031`–`wh-040`, Human origins (2026-10-02)

Run as B1; the pictures that changed were chosen before the Wikimedia block.

Checks: `wh-audit.js --range=wh-031:wh-040` clean but for a `W.not-why` note on `wh-031`. `check-questions`,
`check-style`, `check-cards --prefix=wh-03`/`wh-040`, `check-docs`, `split-cards --check`, `test-card-plans`
pass; `check-citations --card` 0 mismatched; all 74 distinct citation URLs answer 200.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-031` cooking hypothesis | 6 | 6 → 8 | **The date was the later accounts' c. 1.7 Mya**; the founding paper (1999) put the shift at c. 1.9 Mya, so the line is c. 1.9 – 1.7 Mya. An unclear "1,200 calories an hour" figure (the paper writes "ca/h") and an over-read bite-force argument dropped. Added the feeding-time evidence, the food-theft side of the idea, the stone-tool alternative and the critique of the brain argument. A picture added (it had none). |
| `wh-032` Homo antecessor | 6 | 5 → 8 | **860,000 – 780,000 had no source**; now the direct date of a TD6 tooth, 949,000 – 772,000 years ago. **"Boy" is "child"**: no source gives the sex. "The oldest cannibalism" softened to arguably the earliest firm evidence of systematic cannibalism; an unsupported claim about skull growth dropped. |
| `wh-033` Atapuerca | 6 | 5 → 7 | "Limestone", the "Pink" nickname, a 2022 find year and "about 4,000 specimens in 2004" had no source. Two questions carried figures of years. Added the El Portalón farmers and their genetic closeness to today's Basques. |
| `wh-034` Homo heidelbergensis | 7 | 5 → 7 | **700,000 – 300,000 is in no source**; the Smithsonian gives c. 700,000 – 200,000. **The Mauer jaw's "almost modern teeth"** were smaller than earlier species' but larger than ours. "Most workers use the term narrowly" had no source; the *Homo bodoensis* proposal and its critics (Delson and Stringer 2022) replace it. A radiograph replaced by the jaw itself. |
| `wh-035` Neanderthal | 9 | 6 → 10 | **"Neander" as a Greek form of Neumann** and **extinction by "absorption into newcomers"** were in no source read. The 1856 find now follows Schmitz et al. 2002; the 1 – 4 per cent DNA figure is Green et al.'s, unnamed. Questions carried years and figures. Boule's monograph (unchecked) dropped. |
| `wh-036` Levallois technique | 6 | 6 → 7 | **"c. 300,000 – 40,000 BP" had no source at either end**; three sourced rows now (spread, early Italy, East Asia). Dropped gravel quarries, Nor Geghi's date, the end at 40,000 when blades "took over", and Umm el Tlel. "Invented more than once" is one view set against rapid spread. The picture had a printed centimetre scale; now a core in the Louvre. |
| `wh-037` Mousterian | 6 | 9 → 8 | **"Published by Lartet and Christy"** is wrong: de Mortillet defined it in 1873. The 63 types, five facies, North Africa and birch-tar shafts had no source; the Levant softened. Le Moustier's bitumen-ochre grips added; the end is Higham et al.'s 41,030 – 39,260 cal BP. |
| `wh-038` Denisovans | 7 | 6 → 9 | **"Denny is 90,000 years old"** is not in Slon et al.; dropped with the hermit story. The c. 400,000 split is "more than 390,000 years ago"; **4 – 6 per cent is Melanesians, not Australians**. Added the c. 200,000-year-old remains and the Taiwan jaw. The glossary entry gains the alias "Denisovans", which closes the collection's one `G.none` in these hundred. Picture (a chart) on the redo list. |
| `wh-039` Denisova Cave | 6 | 6 → 8 | **"Its cool, steady temperature explains the DNA" is in no source**: Reich 2010 calls the finger bone's 70 per cent endogenous DNA exceptional, notes a tooth from the same cave at 0.17 per cent, and leaves the reason open. Dropped the hermit, "1977, dug from 1982", the needle and the bracelet. Jacobs 2019 (abstract only) replaced by Jacobs 2025 (open). Russian description and alt rewritten in English. |
| `wh-040` Homo floresiensis | 7 | 5 → 8 | **The tools are c. 190,000 – 50,000 years old, not "around 50,000"** (Sutikna 2016), and **extinction on modern humans' arrival** is an open question there, not a fact. The Wallace-line and giant-rat sentence and the chimpanzee brain comparison dropped; the 700,000-year jaw now cites the paper reporting it. |

**Read by eye.** *Article:* "the cooking hypothesis", "the Levallois technique", "the Mousterian", "the
Neanderthal" where the sentence needs one, "the Denisovans"; the rest bare. *Confusability:* `wh-038`/
`wh-039` are people against place (the cave clues are its chambers and its dirt DNA); `wh-036`/`wh-037`
technique against industry; `wh-032`/`wh-033` share Atapuerca and are species against hills.
*Coverage:* the gaps were the later reanalyses (`wh-034`'s *bodoensis*, `wh-040`'s dates) and the people
after the fossils (`wh-033`'s farmers).

**Locators.** `wh-033` (Sierra de Atapuerca) and `wh-039` (Denisova Cave).

**Glossary.** All but *Mousterian* rewritten to agree with their cards; *Denisovan* gains its alias.

### B5 — `wh-041`–`wh-050`, Human origins and The Palaeolithic (2026-10-02)

Run as B1, with picture work paused (see B3): only `wh-046`'s picture changed, a Met Museum Open Access
photograph confirmed CC0 through the Met's own collection API, credited to the museum with its licence.

Checks: `wh-audit.js --range=wh-041:wh-050` clean but for `W.not-why` notes on `wh-045`/`wh-046`. The
audit's sibling check caught three near-identical "division of the Old Stone Age" phrasings on `wh-046`,
`wh-047` and `wh-048`; `wh-047`'s and `wh-048`'s were rewritten to Dmanisi, Qafzeh, the Mousterian
tools and the Neanderthal/Denisovan makers. `check-questions`, `check-style`, `check-cards`, `check-docs`,
`split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched; all 74 distinct URLs 200.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-041` Homo naledi | 7 | 6 → 8 | **The chute was "18 cm wide"**; the cave paper gives squeezes of about 20 cm. Dropped the excavators recruited on Facebook and all women, "September 2013" and the Netflix launch. Added the Lesedi Chamber (source of the 610 cc figure) and a critics' paper, so the burial claim is a dispute. **No locator**: `add-locators.js` reads Wikipedia, which refuses this sandbox. |
| `wh-042` Homo sapiens | 9 | 10 → 11 | **The Linnaeus citation pointed at volume 2 (plants)**; now volume 1. **"Linnaeus is the type specimen" is wrong**: the Smithsonian says the species has no true type. **315,000 belonged to Jebel Irhoud alone**; the species is c. 300,000. Dropped "the only human left for ~40,000 years" and the disputed 65,000-year Australia date. |
| `wh-043` Jebel Irhoud | 6 | 6 → 8 | **"22 more fossils in 2004" misread the release**: the total rose from six to 22. "100 km west of Marrakesh" had no source. Added the early "Neanderthal, c. 40,000" reading, the gazelles and the child's modern tooth development. The find year is 1961 (Stringer 2016; Meneganzin et al. 2022 say 1960). |
| `wh-044` Omo remains | 6 | 5 → 7 | **"Kamoya's Hominid Site is named after Kamoya Kimeu"** is in no source read; dropped, with Omo II as "thicker-walled". The date line is a *minimum* age, c. 233,000 years ago, from the overlying ash (Vidal et al. 2022). |
| `wh-045` Mitochondrial Eve | 7 | 5 → 7 | **"c. 200,000 – 150,000 BP" narrowed the studies' 99,000 – 197,000**; now c. 200,000 – 100,000 years ago. Dropped the Newsweek cover, "the name was never in the paper", the date "sliding forward" and "a method applied badly" (now "several analytical limitations"). **Ragsdale 2023 was cited for something it does not say.** A question used "147 people" and a year. |
| `wh-046` Palaeolithic | 8 | 10 → 10 | **The end "11,700 years ago / 9700 BCE" is the start of the Holocene**, not a date any source gives for the Palaeolithic; the end is now 11,500 BP. "99 per cent of human history", the Greek etymology, flutes, figurines and language had no source. |
| `wh-047` Lower Palaeolithic | 7 | 7 → 9 | **A single "ends 300,000 BP"** is now the region-dependent c. 400,000 – 250,000 years ago. Dmanisi as "the oldest fossils beyond Africa", a hunter-gatherer sentence and Lubbock's naming had no source. Lomekwi hedged. The picture (museum labels in shot) replaced by one flaked tool. |
| `wh-048` Middle Palaeolithic | 7 | 11 → 8 | Blombos, cooking and large game, tar hafting and cave art were cited to papers that would not open or do not say it, and are gone. Added Skhul and Qafzeh and the Qafzeh burials; the Mousterian's end is c. 41,000 – 39,000 BP. |
| `wh-049` Upper Palaeolithic | 7 | 8 → 9 | **"c. 50,000 – 11,700 BP" had no source**; the line gives the start (c. 45,000 years ago, Hublin 2020) and the Magdalenian (Posth 2023). Harpoons, the spear-thrower, the Swabian finds, named caves and blade efficiency had no source; the "revolution" is contested. |
| `wh-050` Pleistocene | 8 | 6 → 8 | **The sea-level fall was 130 m in the background and 120 m in a question**; both now about 130 m (Spratt and Lisiecki). The 2009 redefinition and both boundary sites rest on the ICS table. "Dozens" of swings is "many". |

**Read by eye.** *Article:* the Palaeolithic and its divisions, the Pleistocene and the Omo remains take
"the"; Homo naledi, Homo sapiens, Jebel Irhoud and Mitochondrial Eve bare. *Confusability:* the three
Palaeolithic divisions are now told apart by sites and makers, not by their position in the sequence;
`wh-042`/`wh-043`/`wh-044` are species against two find-sites; `wh-045` stays off `wh-086`'s ground (no
"out of Africa" clue). *Coverage:* the gaps were the second chamber at Rising Star, the end of the
Middle Palaeolithic and how deep time is dated (`wh-046`).

**Locators.** `wh-043` (Jebel Irhoud) and `wh-044` (Omo Kibish); `wh-041` waits for Wikipedia.

**Glossary.** All ten terms rewritten to agree with their cards.

### B6 — `wh-051`–`wh-060`, The Palaeolithic (2026-10-02)

Run as B1 with picture work paused; no picture changed. Checks: `wh-audit.js --range=wh-051:wh-060` clean
but for `W.not-why` notes on three cards. `check-questions`, `check-style`, `check-cards`, `check-docs`,
`split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched; all 71 distinct URLs 200.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-051` Ice age | 9 | 5 → 9 | **"Milankovitch cycles far too weak to start an ice age" is in no source**; the card now says carbon dioxide and drifting continents set the long trend and orbital cycles time the advances. **"Ice ages since at least 2.4 billion years ago" as their start** dropped. The date line was one definition's 2.6 Mya; now Antarctic ice c. 34 Mya, northern ice c. 2.7 Mya, the Cryogenian c. 720 – 635 Mya. **The glossary dated "the current ice age" to 2.58 Mya**, the Quaternary's base. |
| `wh-052` Last Glacial Period | 7 | 5 → 9 | Five of ten sentences carried no marker. The Würm name, "a third of the land", the land bridges and the Chauvet and Lascaux dates were uncited. Now every sentence is sourced: c. 115,000 years ago (the Eemian's end) to 11,700, the regional names, the coldest phase, the 130 m fall, the 25 Dansgaard–Oeschger swings. |
| `wh-053` Last Glacial Maximum | 7 | 5 → 8 | **The sea fall of 125 m is about 134 m** (Lambeck 2014); dates are Clark et al.'s 26,500 – 19,000. **"Almost 4 km thick"** is not in the paper cited for it. **CO2 was 190 ppm in the background and 180 in a question**; both dropped. Doggerland, the Cantabrian coast, needles and the ice-core "dirty band" dropped; dust, Beringia and Europe's population low added. |
| `wh-054` Hunter-gatherer | 9 | 5 → 9 | **Larson 2014 was cited for "everyone foraged until farming"** and does not say it. Bands "of a few dozen", the Tlingit and Haida details and "land nobody else wanted" had no source (the last is now a disputed view). Added demand sharing, the women-hunters debate and the Ju/'hoansi today. **The date line is removed**: a practice found in every age. |
| `wh-055` Middle Stone Age | 7 | 7 → 7 | **300,000 – 40,000 was the southern African range** given to the whole continent; now c. 300,000 – 30,000 (Scerri et al. 2021), with Senegal's to c. 11,000. **Malan was cited for "corresponds to the Middle Palaeolithic" and argues against it**; now Scerri et al. 2018's "broadly similar". Added Olorgesailie. |
| `wh-056` Late Stone Age | 7 | 5 → 7 | **Malan was cited for why the 1929 names were chosen and for "ends when metal or writing arrived"**; neither is there. Added Border Cave's start (Villa et al. 2012, d'Errico et al. 2012), the links to the San, and coastal Kenya. |
| `wh-057` Ochre | 8 | 6 → 9 | Two questions carried figures of years and one took the Blombos workshop (`wh-058`'s). The old dates and claims rested on a Springer review that will not open, and are gone; replaced by sourced earliest use, Olorgesailie, Neanderthal haematite at Maastricht-Belvédère, glue, sunscreen and graves. |
| `wh-058` Blombos Cave | 6 | 6 → 6 | **The Still Bay date came from Jacobs et al. 2008, whose sites do not include Blombos**; the card now says dating teams disagree. The tooth and point counts and "41 shells" were not in the source cited. The excavator's name out of the prose. |
| `wh-059` Howiesons Poort | 5 | 5 → 7 | **The naming story had no source** (Hewitt and Stapleton, the misspelled Mr Howison, Makhanda, the 1927 – 28 digs), nor "fingernail-sized". Added plant poison on backed pieces at Umhlatuzana, heat-treated silcrete, more than 20 sites, and the long Diepkloof chronology as a minority view. |
| `wh-060` Aterian | 5 | 5 → 8 | **Hearths and "built structures" were cited to a paper on bone tools**, which does not say it. "Skulls and jaws" is three jaws from named caves. "The oldest arrowheads" became the debate over tanged weapon tips against hafted knives and scrapers (Iovita 2011; Sisk and Shea 2011). The Bir el Ater naming rests on the cited title of Morel's report on the "station éponyme". |

**Read by eye.** *Article:* "an ice age", "the Last Glacial Period", "the Middle/Late Stone Age", "the
Aterian"; ochre and Blombos Cave bare. *Confusability:* `wh-052`/`wh-053` are the period against its peak
(the LGM clues are the ice sheets at their furthest and the refuges); `wh-057`/`wh-058` keep the ochre
workshop on Blombos alone; `wh-055`/`wh-059`/`wh-060` are the stage against two industries within it.
*Coverage:* the gaps were the drivers of glaciation (`wh-051`), Africa's own terms (`wh-055`, `wh-056`).

**Locators.** `wh-058` (Blombos Cave).

**Glossary.** Eight terms rewritten (*Late Stone Age* and *Ochre* already agreed).

### B7 — `wh-061`–`wh-070`, The Palaeolithic (2026-10-02)

Run as B1 with picture work paused; no picture changed. Checks: `wh-audit.js --range=wh-061:wh-070` clean
but for one `W.not-why` note. `check-questions`, `check-style`, `check-cards`, `check-docs`, `split-cards
--check`, `test-card-plans` pass; `check-citations --card` 0 mismatched; all 73 distinct URLs 200.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-061` Behavioural modernity | 6 | 7 → 7 | The figures are now the sourced African range (300,000 – 70,000 years) and the European start (c. 45,000). Klein's unfetchable paper, a duplicate Zilhão paper and the unsourced "checklist set aside" dropped; questions carrying a year rewritten. Glossary "nearly every item" → "many". |
| `wh-062` shell beads | 7 | 5 → 7 | **The Qafzeh shells were called "pierced"**, and the card said a deliberate hole marks a bead; the source says they were holed by nature. **Bizmoune (at least 142,000 years) was missing** and is now the oldest. An unsourced superlative and an off-topic Zhoukoudian sentence dropped. |
| `wh-063` Palaeolithic burial | 7 | 5 → 8 | **The card was a tour of three sites leaning on Mal'ta (`wh-096`)**; it now says what counts as a burial and how one is recognised, then Qafzeh, Panga ya Saidi (the oldest in Africa), the Neanderthal debate, Sunghir and Dolní Věstonice. **Border Cave's 74,000 dates the layers, not the burial.** "2,500 hours" and the Sikora DNA claim could not be re-verified and went. |
| `wh-064` Toba catastrophe theory | 6 | 6 → 6 | The proposer's name and years out of the questions. **"A few thousand breeding individuals" is not in Ambrose's abstract**; "thick ash beds" at Dhaba are glass shards; Pinnacle Point's "busier, new tools" could not be read (403). Lake Toba locator kept. |
| `wh-065` Neanderthal extinction | 8 | 5 → 10 | **"Extinct within 10,000 years" was only how long the 2019 model's runs lasted.** **"A band of a couple of dozen" was a modelling assumption, not a finding**; now the sourced father–daughter pair. The eruption's effects and "demography strongest" had no source; a "Redating 2014" date row cut. |
| `wh-066` Châtelperronian | 5 | 9 → 5 | Questions named Breuil and **gave 1906; the year is 1909**. **"Named 1938, by Dorothy Garrod", the Aurignacian filing and hafting** had no fetchable source. Gicqueau 2023 swapped for Djakovic 2024 for the modern-human hip fragment. |
| `wh-067` Aurignacian | 6 | 12 → 8 | **The 42,000-year flute date and the figurine's "nearer 40,000" were in no source that opened**; both now "at least 35,000". "Named 1906" goes to Cartailhac (the Monaco congress). The Chauvet attribution dropped; the 1852 road-mender story rests on Lyell. Added the spread to Portugal, a population of about 1,500, few burials and the Kulturpumpe debate. |
| `wh-068` Cro-Magnon | 8 | 6 → 8 | **Railway against road**: Lartet's own account has workmen taking rubble for a road beside the railway. **At least eight people (three newborns), not five.** The tumour reading of a skull lesion and a genetics sentence dropped; the burials are c. 32,000 – 31,000 years ago, early Gravettian. |
| `wh-069` Lion-man | 6 | 5 → 8 | **"Lay unstudied thirty years" is wrong**: the Museum Ulm record says the team knew in 1939 the splinters were an ivory figure. The Hahn credit, "hundreds of hours" for a flint replica and "no older sculpture of an imagined creature" had no source. Dated 40,000 – 35,000 (the museum); the 2012 – 13 rebuild replaces a 1969 row. Added the recess at the back of the cave and the Hohle Fels figure. |
| `wh-070` Gravettian | 6 | 11 → 8 | **Garrod naming it in 1938** and **the Kostenki mammoth-bone houses** had no open source. **"The great painted caves are not Gravettian" is wrong**: Cussac and Gargas are. "First woven cloth" softened to textile prints in clay. Two glossary author names had been wrongly expanded from initials, and are corrected. The La Gravette naming rests on a French popular page, the only open source found. |

**Read by eye.** *Article:* "the Châtelperronian", "the Aurignacian", "the Gravettian", "the Lion-man",
"the Toba catastrophe theory", "the Neanderthal extinction", "a Palaeolithic burial"; Cro-Magnon and
behavioural modernity bare. *Confusability:* `wh-066`/`wh-067`/`wh-070` are told apart by their tools and
sites; `wh-065` stays off `wh-035`'s ground (no anatomy); `wh-063` dropped Mal'ta for `wh-096`.
*Coverage:* the gaps were what a burial is (`wh-063`) and the painted caves of the Gravettian.

**Locators.** `wh-068` (Abri de Cro-Magnon, labelled Les Eyzies) and `wh-069` (Hohlenstein-Stadel).

**Glossary.** All ten terms rewritten to agree with their cards.

### B8 — `wh-071`–`wh-080`, The Palaeolithic (2026-10-02)

Run as B1 with picture work paused; no picture changed. Checks: `wh-audit.js --range=wh-071:wh-080` clean
but for `W.not-why` notes on three cards. `check-questions`, `check-style`, `check-cards`, `check-docs`,
`split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched; all 71 distinct URLs 200.
One phrasing on `wh-073` asserted that the Volgu points are too thin to use, which the background gives as
one view; it now says "may have been".

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-071` Venus figurines | 7 | 5 → 7 | **"From the Pyrenees to Lake Baikal, 6,000 km" and "mostly 30,000 – 23,000 BP" had no source**; the line is now c. 38,000 – 14,000 BP (Johnson et al.) and Named 1864. Mal'ta's figures are no longer "slender", and now show clothing, hoods and children. |
| `wh-072` Venus of Willendorf | 7 | 5 → 7 | **The height is 110 mm, not 11.1 cm.** **"Braided hair or a netted snood" had no source**; now "a headdress or hairstyle". **The 730 km is a possible route through the Alps, not the distance to the outcrop.** "Legs taper to no feet" dropped. Two OpenEdition sources dropped (bot wall). |
| `wh-073` Solutrean | 6 | 8 → 8 | **The Volgu points were "35 cm" in a question and "over 30 cm" in the background**; now the measured 23.4 – 34.3 cm by 0.6 – 1.2 cm. **"Named by Mortillet in 1869" had no source**; the Solutré museum gives 1869 and 1872 and names no one. A question carried "22,000 – 17,000 years ago" against a 25,000 – 19,000 line. The horse-drive legend is traced to the excavator's illustrated novel. Added the refuge, Malalmuerzo's DNA and Peña Capón's stone carried 600 – 700 km. |
| `wh-074` Magdalenian | 6 | 9 → 7 | **21,000 – 14,000 had no source**; c. 20,500 – 14,000 BP. "The age of the reindeer", Mortillet as namer, the harpoon sequence, Altamira, Montastruc and El Mirón were unsourced or miscited. Added La Madeleine, whale-bone weapons, Gough's Cave (c. 14,950 – 14,750 cal BP) and its ritual cannibalism, and a disputed Maszycka study. |
| `wh-075` cave painting | 9 | 7 → 11 | **"The oldest painting" (Leang Tedongnge's pig, 45,500) is out of date**: a January 2026 Nature paper dates a Muna Island hand stencil to at least 67,800 years ago. Moss and fur pads, blowpipes of bone or reed, stencils "to Argentina" and "people rare" had no source; the Altamira and Lascaux material is `wh-077`/`wh-078`'s. Ages are minimums, said so. |
| `wh-076` Chauvet Cave | 7 | 5 → 7 | **Both phases were marked "Painted"**; nearly all dated drawings fall in the first, so the rows are first and later visits. The child footprints, bear skulls, Herzog's film and the replica's opening had no source. World Heritage 22 June 2014 added. |
| `wh-077` Lascaux | 8 | 9 → 8 | **Eight sources were one ministry's pages**; now two of them, lascaux.fr and five papers. **"Painted c. 21,500 – 21,000 BP" is "Occupied"**: the reindeer-bone dates are the occupation, and a Solutrean age for the paintings is still argued. The "Sistine Chapel" nickname, 19 m depth, scaffolding and "reindeer not on the walls" had no source. Added the 1,800 visitors a day, Malraux's 1963 closure, UNESCO 1979, the juniper wick, the stain sequence and the 1983 and 2016 replicas. |
| `wh-078` Cave of Altamira | 7 | 5 → 7 | The line uses the 2013 uranium-series minimums, 35,550 – 15,200 BP, for "from 36,000". The closure is 1978 – 1982 (a 2024 paper; the museum page says 1979). Sautuola's 1888 death, a suspect painter, the hind, a 2001 replica date and visitors picked by lot had no source. |
| `wh-079` petroglyph | 7 | 5 → 9 | **The date line gave the Côa Valley's span to the whole form**; petroglyphs run from prehistory to now, so the line is empty. **The dam was abandoned in 1996, not 1995.** "Petroglyphs cannot swim", "a change of government" and "decades of campaigning" dropped; the dating difficulty now cites a paper that says it. |
| `wh-080` Palaeolithic music | 6 | 6 → 8 | **The museum record says "griffon vulture bone"**, not wing bone. **Divje Babe's bone has four holes and is 11.4 cm long**, not "two holes, about 11 cm" (the Ljubljana museum). The line covers all eight Swabian flutes, 43,000 – 35,000 years ago, and the Marsoulas shell horn, c. 18,000. Turk 2020 (403) dropped. |

**Read by eye.** *Article:* "the Venus figurines", "the Venus of Willendorf", "the Solutrean", "the
Magdalenian", "the Cave of Altamira", "a petroglyph", "a cave painting"; Chauvet Cave and Lascaux bare.
*Confusability:* `wh-071`/`wh-072` are the type against one figure (Willendorf's clues are its stone and
its find); `wh-075`–`wh-078` are the practice against three caves, each asked through its own story;
`wh-079` keeps to rock engraving. *Coverage:* the gaps were Sulawesi (`wh-075`) and conservation (`wh-077`).

**Locators.** `wh-072` (Willendorf), `wh-076` (Chauvet Cave), `wh-077` (Lascaux), `wh-078` (Altamira).

**Glossary.** Eight terms rewritten (*Lascaux* and *Cave of Altamira* already agreed).

### B9 — `wh-081`–`wh-090`, The Palaeolithic and Peopling the planet (2026-10-02)

Run as B1 with picture work paused; no picture changed. Checks: `wh-audit.js --range=wh-081:wh-090` clean
but for `I.none` on `wh-088` (it never had one) and `W.not-why` notes on eight cards (several FAQs open
"How" or "What"; the rule reports, it does not refuse). `check-questions`, `check-style`, `check-cards`,
`check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched. 77 of
78 distinct URLs answer 200; **the Australian National Maritime Museum's woomera record (`wh-081` and its
glossary term) answered when the agent saved it and timed out twice afterwards** — kept, to re-curl in
the next batch. The `wh-087` locator needed the article title "Qafzeh Cave" ("Qafzeh" has no coordinate).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-081` spear-thrower | 7 | 6 → 7 | **"The extra force drives a point through hide"**: Bebber et al. report a hand-thrown javelin still carries more energy than a dart; dropped, and the trade-off is now a FAQ. "Two-thirds faster" is the 108-person test's 65 per cent. **Combe-Saunière as "the oldest securely dated hook" is wrong**: Coppe et al. call its dating uncertain. Added Maisières-Canal's c. 31,000-year use evidence, hedged. |
| `wh-082` bow and arrow | 9 | 10 → 11 | "Kneeling" and "a dozen arrows" had no source; the Holmegaard dates' only source is behind a bot wall. **Stellmoor is 12,200 – 11,400 BP, not "about 11,500".** Sibudu hedged; "oldest bows c. 9,000 BP" replaced. |
| `wh-083` microlith | 6 | 8 → 7 | **"Rarely more than 3 cm" and "25 – 50 mm" had no source**; one study's 40 mm limit, and no agreed definition. The Greek word origin and the microburin method had no openable source. **"The oldest are at Pinnacle Point" is "among the oldest"**: Sibudu has backed pieces by 77,000 years ago. |
| `wh-084` woolly mammoth | 9 | 5 → 11 | Tusk, hair and fat measurements, the hump, the cave paintings and the pyramids comparison had no source. **The old sizes did not match the size study** (Larramendi's figures now). **"1.2-million-year woolly mammoth DNA" is wrong**: those specimens are older mammoth lineages. The mainland end is c. 10,000 years ago, sourced. |
| `wh-085` Quaternary extinction event | 6 | 8 → 8 | **Per-continent dates in no source** replaced by Koch and Barnosky's c. 50,000 – 10,000 years ago. **"Selected almost entirely by body size"**: slow breeders were hit whatever their size. A question carried 2025 and "360 papers". The spore and nutrient claims dropped (Doughty would not open). A PLoS ONE issue number corrected. |
| `wh-086` recent African origin of modern humans | 7 | 5 → 7 | All three questions and the FAQs used `wh-045`'s and `wh-089`'s angles; rewritten. The date line now gives the species (c. 300,000), the main dispersal (c. 60,000) and the 1987 study. |
| `wh-087` Skhul and Qafzeh hominins | 5 | 7 → 7 | **120,000 – 90,000** is now **130,000 – 90,000** (Groucutt 2019; Coqueugniot). "27 people", a 1965 excavation start, flint-dating details and shells "at both caves" had no source. **"Ended without issue" hedged**: Pagani 2016 finds at least 2 per cent of Papuan genomes from an early, extinct dispersal. |
| `wh-088` southern dispersal route | 5 | 5 → 6 | **The genetic dates credited to Shipton are not in that paper.** The Skhul and Qafzeh paragraph (`wh-087`'s) removed. Both sides added: mtDNA studies for the southern route, Egyptian genomes and Neanderthal ancestry for the northern, with the strait's width and the coastal caveats. |
| `wh-089` archaic human admixture | 6 | 5 → 8 | **Denisova 11 "c. 90,000 BP" is not in Slon 2018**, which gives "over 50,000" by radiocarbon. **The Neanderthal share is 1 – 4 per cent, not "a per cent or two".** Rows: earliest trace c. 100,000 (one study), main mixing c. 49,000 – 45,000 (Sümer et al. 2025), first shown 2010. |
| `wh-090` ancient DNA | 8 | 5 → 8 | **The card rested on one 2026 review**; now primary papers and the Nobel pages. Added the quagga (1984). **The petrous bone's "up to 100 times more"** softened to "far more". `undatable` now false (it has a first date). |

**Read by eye.** *Article:* "the spear-thrower", "the bow and arrow", "the microlith", "the woolly
mammoth", "the Quaternary extinction event", "the recent African origin…", "the Skhul and Qafzeh
hominins", "the southern dispersal route"; archaic human admixture and ancient DNA bare. *Confusability:*
`wh-086`/`wh-088`/`wh-089` are the model, one route and one consequence, each kept to its own evidence;
`wh-081`/`wh-082`/`wh-083` are three weapon technologies with no shared clue. *Coverage:* the gaps were
the northern route (`wh-088`) and the quagga (`wh-090`).

**Locators.** `wh-087` (Qafzeh Cave).

**Glossary.** All ten terms rewritten to agree with their cards.

### B10 — `wh-091`–`wh-100`, Peopling the planet (2026-10-02)

Run as B1 with picture work paused; only `wh-092`'s picture block changed (its old description named a
file, so the description and alt were rewritten from the file's title; the map itself is on the redo
list). Checks: `wh-audit.js --range=wh-091:wh-100` clean but for `I.none` on `wh-093` (it never had one)
and `W.not-why` notes. `check-questions`, `check-style`, `check-cards`, `check-docs`, `split-cards --check`,
`test-card-plans` pass; `check-citations --card` 0 mismatched; all 67 distinct URLs 200. The *Sahul*
glossary date had picked up a parenthetical; it now reads c. 65,000 – 47,000 years ago.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-091` Y-chromosomal Adam | 7 | 5 → 8 | **The 2013 find "pushed the date back by roughly two hundred thousand years"** is in no source; the press release says almost 70 per cent, and the papers give 338,000, a critique's 208,300 and later 254,000 and 275,000. Three old citations did not carry their claims; the family sending the sample and a "2015 estimate" row had no source. |
| `wh-092` Sahul | 6 | 5 → 7 | **"25,000 – 40,000 years ago" for the Papuan–Aboriginal split was the error range of one c. 37,000 estimate.** Added the Bass Strait flooding and the deep channels that always kept Sahul apart. Questions carried figures of years. A Torres Strait locator added, since the audit asks a place card for one; a former landmass is a point only by convention. |
| `wh-093` Madjedbebe | 5 | 5 → 6 | **The Jabiluka lease and "an agreement giving the Mirarr control"** had no source; now Mirarr and Gundjeihmi permission and a keeping place. **"Yams" are roots and tubers, fruits, pandanus kernels and palm stems.** "5,000 – 15,000 years earlier" had no source; the genetic c. 50,000 against c. 60,000 debate replaces a 2016 sentence. Modern scholars out of the prose. |
| `wh-094` Lake Mungo remains | 6 | 9 → 8 | "Crushed bones", "red" ochre, a contaminant "matching the 2001 author" and "dry for more than 10,000 years" had no source (the lake began drying about 19,000 years ago). **"Hands folded" are "crossed".** The 1981 listing and 2022 reburial now sourced. |
| `wh-095` peopling of Europe | 7 | 5 → 7 | Questions carried figures of years. Added Grotte Mandrin's earlier visit (hedged, 56,800 – 51,700), the Ice Age refuge and replacement from c. 14,000 years ago (Posth 2023), and the Ranis group with no living descendants (Sümer 2025). |
| `wh-096` Mal'ta–Buret' culture | 5 | 5 → 6 | **"Slender, hooded, unlike western Venus figures" was cited to a Willendorf paper** that says only that Mal'ta's are a regional type. "Ritual corners" and the excavator's name dropped. Added the camps' dates (c. 26,500 – 24,500, Shichi 2023), the 14 – 38 per cent Native American ancestry and the boy's genome. |
| `wh-097` Beringia | 7 | 8 → 8 | **"Hultén, a Swedish botanist" and "Bering sailed through in 1728"** are not in the source cited; cut to what Hoffecker carries (the name proposed in 1937). **The mammoth-steppe sentence cited an unrelated saiga paper**; now Hoffecker's dry Arctic steppe against the wetter southern bridge. Added the strait's depth, the standstill counter-view and St Paul Island's mammoths. |
| `wh-098` Settlement of the Americas | 7 | 10 → 9 | **The split-from-Asia range was cited to one paper**; 36,000 – 24,000 from two, and the prose says estimates vary. Cooper's Ferry's date and source corrected; the ice-free corridor 12,600 → 13,000. **The glossary's "no human had set foot"** conflicted with the card. |
| `wh-099` Monte Verde | 6 | 7 → 7 | **The discovery years 1975 and 1977 are in no source that opened**; dropped. The 2026 challenge follows Surovell et al.'s abstract and Waters et al.'s reply. The gomphotheres sit in the wishbone-shaped structure. |
| `wh-100` Paleo-Indians | 7 | 7 → 8 | **"Roberts never defined the term" and "everyone before 8000 BCE"** had no source; the period's end, c. 9000 – 8000 BCE, comes from the New Georgia Encyclopedia. Bison size and "stone from hundreds of km" dropped. The diet debate (Chatters 2024, Potter 2026) added; angles that belong to `wh-101`–`wh-103` cut. |

**Read by eye.** *Article:* "the peopling of Europe", "the Mal'ta–Buret' culture", "the settlement of the
Americas", "the Lake Mungo remains", "the Paleo-Indians"; Sahul, Beringia, Madjedbebe, Monte Verde and
Y-chromosomal Adam bare. *Confusability:* `wh-091` against `wh-045` (Y against mitochondria);
`wh-092`/`wh-093`/`wh-094` a continent, a shelter and a burial; `wh-097`/`wh-098`/`wh-099`/`wh-100` the
bridge, the process, one site and the people. *Sensitivity:* `wh-094`'s picture may show the remains of
Aboriginal ancestors, which communities ask people not to display; it is first on the redo list.

**Locators.** `wh-092` (Torres Strait), `wh-093` (Madjedbebe), `wh-094` (Lake Mungo), `wh-096` (Mal'ta–Buret'
culture), `wh-099` (Monte Verde). **`wh-041` still has none**: "Rising Star Cave" and "Cradle of Humankind"
both lack a primary coordinate on Wikipedia.

**Glossary.** Nine terms rewritten (*Beringia* already agreed).

### The first hundred, in sum

`wh-audit.js --range=wh-001:wh-100` after B10, against the baseline:

| rule | before | after |
|---|---|---|
| `Q.date` (a date or span of years in a question) | 94 | 0 |
| `B.sentence-length` | 90 | 0 |
| `S.bar` (under the difficulty's source bar) | 60 | 0 |
| `W.no-marker` / `W.overlap` / `W.overlap-high` | 100 / 100 / 59 | 0 / 0 / 0 |
| `S.modern-cap` | 10 | 0 |
| `D.not-a-date` / `D.not-in-prose` / `D.era` | 18 / 16 / 1 | 0 / 0 / 0 |
| `Q.sibling` | 12 | 0 |
| `S.chip?` | 5 | 0 |
| `G.none` / `G.date` | 1 / 3 | 0 / 0 |
| `L.missing` | 7 | 0 |
| `I.caption-source` / `I.duplicate` | 4 / 1 | 0 / 0 |
| `I.none` | 6 | 4 (`wh-029`, `wh-030`, `wh-088`, `wh-093`; picture pass) |

`W.not-why` (29 cards with an FAQ opening "How", "What" or "Did") is a note the rule reports and does not refuse.
What remains open from these hundred is the **picture pass** (the table below) and `wh-041`'s locator.

### B11 — `wh-101`–`wh-110`, Peopling the planet (2026-10-02)

Run as B1 with picture work paused (Commons still refused this sandbox on the day); no picture changed.
Checks: `wh-audit.js --range=wh-101:wh-110` clean on all ten. `check-questions`, `check-style` (no new
finding), `check-cards`, `check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations
--card` 0 mismatched; all 68 distinct URLs 200. Two locators were rewritten by `add-locators.js`
(`wh-109` Star Carr, `wh-110` Bhimbetka); `wh-103`'s request ("Folsom site") found no coordinate, so its
old Folsom point stands.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-101` Clovis culture | 7 | 6 → 7 | **"More than 10,000 points at some 1,500 places", "about a dozen" mammoth sites and a range "into Central America"** had no source. The card was mostly about the point (`wh-102`'s), with four sources by one author; now the people: mobility, caches, kill sites against the Gault base camp, the Anzick child. A "1930s" row dropped. |
| `wh-102` Clovis point | 7 | 5 → 9 | The 900 km toolstone distance and a sentence on fakes had no source. **The East Wenatchee giant is 24.5 cm, but no source calls it agate.** Size range now the North Carolina sample (58.1 mm mean, 22 – 142 mm). Added the hafting, thrusting-spear and braced-pike readings and a 2026 study finding no spear-thrower as old as Clovis. |
| `wh-103` Folsom tradition | 6 | 8 → 6 | **"Up to three in four ruined by fluting" is the paper's 10.5 – 22.2 per cent, and for Clovis**; dropped. "32 bison" is Cordell's 19 points and 23 bison. **The type find is 1926**, not 1927 (the in-place point). The Cooper skull is "the first Paleoindian art outside a burial", not "the oldest painted object in North America". Dates now the modelled start and end. |
| `wh-104` Younger Dryas | 7 | 5 → 8 | **Named after *Dryas octopetala* leaves in lake clays, not its pollen** (named 1912, before pollen analysis). Onset 12,870 BP (Cheng 2020). Greenland swings of 9 – 14 °C and a 40 – 50-year exit had no openable source. The impact idea is a minority view with its critics; "it coincided with the end of Clovis" dropped. |
| `wh-105` Holocene | 8 | 5 → 8 | Questions carried Gervais, the 1860s, 2018, 2024 and the ice-core depth. **The depth is 1,492 m (4,895 ft), not 1,493 m.** "A few million to eight billion people" had no source; the climate-and-farming link is now one view. The Anthropocene's details left to `wh-1000`; its 2024 rejection kept. |
| `wh-106` Mesolithic | 7 | 15 → 7 | **"9700 – 4000 BCE in Europe" was the Holocene's start, not a Mesolithic date**; no source gives a Europe-wide span, so the line is Britain's 9600 – 4000 BCE. Greek etymology, Clark 1932, "broad spectrum revolution" and the Pesse canoe had no openable source. Westropp's 1866 coinage now read from his own text; a Robson DOI and issue corrected. |
| `wh-107` Epipalaeolithic | 5 | 10 → 7 | **Why the term is preferred to "Mesolithic", the Taforalt link and "kept the dog"** had no source (the dog is disputed). 'Ain Mallaha figures moved to `wh-116`. Questions had used `wh-116`'s clues and a figure of years. Added Ohalo II, Kharaneh IV and the 'Uyun al-Hammam fox burial. |
| `wh-108` Doggerland | 7 | 5 → 7 | **"Dry land 16,000 – 8,000 BP" had no source**; now Walker 2020's islands by c. 9000 BP, gone c. 7000 BP. The "doggers" etymology, four rivers and the mammoth and lion bones had no source. The 2020 view restated as what it says (the wave's harm varied; islands survived). Its namer no longer named in prose. |
| `wh-109` Star Carr | 6 | 5 → 6 | **The lake-edge timber platform was called "the earliest post-built structures in Britain"**: those are three separate structures on dry ground. "33 headdresses, nine pierced" rest on a chapter that will not open; now "about 90 per cent of Europe's". Headdress purpose stated as interpretation; "oldest house" hedged. |
| `wh-110` Bhimbetka rock shelters | 7 | 5 → 7 | **"Occupied from c. 100,000 years ago" was the ASI's date for the Auditorium cupules**, given to the whole site. The first paintings now a dispute with whose each figure is (8000 years, Upper Palaeolithic, over 30,000); a journal title for Misra 1981 that no page confirms dropped from the citation. UNESCO is 403. |

**Read by eye.** *Article:* "the Clovis culture", "the Younger Dryas", "the Holocene", "the Mesolithic",
"the Epipalaeolithic", "the Bhimbetka rock shelters"; Clovis point ("a"), Doggerland, Star Carr bare.
*Confusability:* `wh-101`/`wh-102` split people from artefact; `wh-106`/`wh-107` are kept apart by region
(Europe against the Levant), and `wh-107` off `wh-116`'s Natufian clues; `wh-104`/`wh-105`/`wh-113`/`wh-114`
are a cold snap, an epoch, a warm phase and a second cold snap, each by its own evidence. One question on
`wh-101` read "the makers of the Clovis culture" and was reworded.

**Glossary.** All ten terms rewritten to agree with their cards.

### B12 — `wh-111`–`wh-120`, The Neolithic transition (2026-10-02)

Run as B11. Checks: `wh-audit.js --range=wh-111:wh-120` clean but for `W.not-why` on `wh-112` (two FAQs
are yes-or-no questions about Childe and about farming's cost). `check-questions`, `check-style` (no new
finding), `check-cards`, `check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations
--card` 0 mismatched. **Four DOIs (`wh-113`, `wh-114`) answered 403 to curl from the publishers' bot walls**;
each was swapped for its open PMC copy, and all URLs now answer 200.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-111` Neolithic | 8 | 5 → 8 | **Lubbock defined it by polished stone and no metal, not by farming**, and was cited from a later edition (now 1865). "Land tenure and elites" belonged to urbanisation in its source. **"c. 10,000 – 3300 BCE" had no source**; now c. 12,000 – 8000 years ago in Southwest Asia and c. 4000 – 2300 BCE in Britain. |
| `wh-112` Neolithic Revolution | 8 | 5 → 8 | **The card now says Childe pictured a rapid, deliberate change, and that it was gradual.** Its elites claim was misattributed; the eleven-centres and brucellosis clues belong to `wh-132` and `wh-134`. A question on Shubayqa bread (`wh-116`'s clue) replaced by Childe's burial count. "Term popularised", not "coined", since the first use was not checked. |
| `wh-113` Holocene climatic optimum | 6 | 5 → 6 | **"c. 9,000 – 5,000 BP" had no source**; Cartapanis 2022 gives 10,000 – 5,000. "11,000 – 4,000 at sites" is the source's seas-first, land-later split. Precession, the molluscs and the Green Sahara (`wh-151`'s) dropped; the warmest 200 years, 0.7 °C above the 19th century at c. 6,500 BP, checked on the page. |
| `wh-114` 8.2-kiloyear event | 5 | 6 → 6 | **"3 °C over the ice" and "1 to 3 °C" across the north** are Parker and Harrison's more than 2 °C in Greenland and 1 – 1.5 °C in Europe. **"6,200 BCE" is in no source.** The collapse of Pre-Pottery Neolithic B villages was stated as fact; now an older proposal against later evidence of continuity, with Çatalhöyük's local signal. |
| `wh-115` Fertile Crescent | 8 | 5 → 8 | **Its date line "Farming begins c. 12,000 – 11,000 BP" was the world's figure (Larson), not the region's**; a region takes no line, so `undatable` and the Near East's 10,000 – 9000 BCE in prose. Breasted coined the term in 1914 and capitalised it in 1916 (both read on archive.org). Locator (a drawn region) kept. |
| `wh-116` Natufian culture | 6 | 5 → 6 | **The lead question misread 'Ain Mallaha: "50 to 100 lived for 3,000 years"** is a population at one time and a site occupied over 3,000 years. Dates now c. 15,000 – 11,700 BP, with one study's 14,600 start in prose. **"Began domesticating animals" dropped**; cultivation hedged as one study's argument. Shubayqa bread added. |
| `wh-117` domestication | 9 | 5 → 9 | A date-line row was a species count. **"Natufians reaped for 4,500 years before domestication" is the paper's 4.5 to 1 millennia.** The text no longer implies "domestication syndrome" is Darwin's phrase. Added the dog first (c. 14,500 BP), the three pathways, the rarity of the full syndrome, the slow-or-fast debate. A question that duplicated `wh-120`'s pathways clue replaced. |
| `wh-118` Neolithic founder crops | 6 | 5 → 7 | **Bread wheat was listed as a founder wheat**; it is a later emmer–goatgrass hybrid. The card now names the eight and says the grouping is a scholarly label of the 1990s. "c. 10,000 BP" is now c. 10,700 – 8300 BP by region; core-area and protracted views both given. |
| `wh-119` cereal domestication | 7 | 5 → 8 | **The Karaca Dağ and Iranian-barley origins were cited to a South Asia paper that does not carry them**; replaced by barley's mosaic ancestry (Guo 2025). The same 4,500-year overstatement corrected to a range. "The most critical event" is the source's "perhaps". |
| `wh-120` animal domestication | 8 | 5 → 8 | **"A fifth of Ganj Dareh's goats lived past four" is not in the source** (the near-70 per cent figure is another site's). The pathways are named as a modern framework. Line now c. 11,000 – 10,000 BP and pigs in China by c. 8,000 BP; llama and horse rows dropped. |

**Read by eye.** *Article:* "the Neolithic", "the Neolithic Revolution", "the Holocene climatic optimum",
"the 8.2-kiloyear event", "the Fertile Crescent", "the Natufian culture", "the Neolithic founder crops";
domestication, cereal and animal domestication bare. *Confusability:* `wh-111`/`wh-112` a period and a
model of it; `wh-117`/`wh-119`/`wh-120` the concept, the plants, the animals, each with its own evidence
(`wh-117`'s routes question moved to the dog, since `wh-120` owns the pathways). *Undatable:* `wh-115`
true (a region); `wh-111`, `wh-117`, `wh-120` false (each has a dated first instance).

**Glossary.** All ten terms rewritten to agree with their cards.

### B13 — `wh-121`–`wh-130`, The Neolithic transition (2026-10-02)

Run as B11; six of the ten drafts were cut off by a usage limit and finished by fresh agents, which
re-checked the saved pages before reusing them. Checks: `wh-audit.js --range=wh-121:wh-130` clean but for
`W.not-why` on `wh-129`/`wh-130` and **`I.duplicate` on `wh-122`**, whose old picture URL ends in a generic
`1920px-thumbnail.jpg` that 21 other cards share by name (a picture-pass item, not a shared file).
`check-questions`, `check-style` (no new finding), `check-cards`, `check-docs`, `split-cards --check`,
`test-card-plans` pass; `check-citations --card` 0 mismatched. Three publisher DOIs (`wh-127`, `wh-128`)
answered 403 and were swapped for their PMC copies; all URLs then 200. **`wh-117` was re-applied**: its
"oldest dog-like bones about 14,500 years old" is now "conservatively dated to about 14,500", to agree with
`wh-121`'s probable dog bones of c. 17,000 – 14,000 years ago. Locators: `wh-124` moved from the modern town
to Tell es-Sultan, about 2 km away; `wh-123`, `wh-125` re-fetched.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-121` dog domestication | 8 | 6 → 8 | **Kesslerloch (14,200) was "the oldest dog DNA" only within one study's sample**; Pınarbaşı's nuclear DNA is c. 15,800 years old. The Siberian c. 23,000 origin and "64 per cent wolf ancestry" rested on papers that would not open. Goyet and Razboinichya now named as extinct wolves; Bonn-Oberkassel's nursed puppy added. |
| `wh-122` Pre-Pottery Neolithic | 6 | 5 → 8 | PPNA and PPNB dates kept from Shipton 2026; PPNC added in prose. Jericho's mobility figure is `wh-124`'s; naviform cores, mega-sites and obsidian had no openable source. No source states outright that the period had no pottery, so the card says only that pottery came after it. |
| `wh-123` Göbekli Tepe | 7 | 5 → 8 | **"In use c. 9600 – 8800 BCE" is only the oldest layer**; the site c. 9600 – 8000 BCE. **The "sanctuary nobody lived in" is the excavator's view, now set against later houses, 7,000 grinding tools and possible cisterns.** A 153 m³ cistern figure had no source; a question carried a millennium. |
| `wh-124` Jericho | 9 | 5 → 9 | **"With no clear break" is wrong**: the site was deserted for centuries after the Bronze Age destruction. The tower's "8300 BCE" is off the line (two sources disagree); the fall c. 1550 BCE, not "1600 – 1520", and "rules out 1400" is in no source. Joshua is a text, not a finding. |
| `wh-125` Çatalhöyük | 8 | 5 → 8 | **The end is 5950 BCE, not 6000.** The kinship study sampled only children, so the card no longer says everyone under a house was unrelated. **"Several hundred to a few thousand people" had no source**; now the project's own 3,500 – 8,000, attributed. Equality and the mother goddess are both interpretations. |
| `wh-126` 'Ain Ghazal | 6 | 5 → 6 | **"8000 – 6600 BCE" had no source**; now the calibrated phases (c. 10,200 – 9,500 and 8,900 – 8,600 BP). The 12 – 13 ha sizes and a soil-erosion explanation sat on unreadable pages; decline now a hedged drying-climate reading. Statue details from Tubb 2001. |
| `wh-127` sedentism | 7 | 5 → 8 | The card now says plainly that **the first settlers of Southwest Asia were hunter-gatherers**, and that how settled they were is argued; the reasons people settled are three competing hypotheses, not fact. Added the house mice of c. 14,500 BP and Kharaneh IV. |
| `wh-128` pottery | 9 | 5 → 9 | The oldest pots' 20,000 – 17,000 BP is hedged as contested. **Added the distinction the old card lacked: Moravia's fired-clay figurines are c. 30,000 years old, yet Ice Age Europe made no vessels.** Pottery reached Southwest Asia only c. 7000 – 6800 BCE. |
| `wh-129` rice domestication | 8 | 5 → 8 | **"12 per cent non-shattering at Shangshan" was a second-hand micro-CT figure**; the Huxi 8.7 per cent kept. A "reached Europe c. 2,000 years ago" row was a rounding with no year. Added the indica-from-japonica account (hedged) and African rice. |
| `wh-130` millet domestication | 7 | 5 → 7 | **Dadiwan's c. 7,900 BP was "the oldest secure millet" only for Dadiwan and the East Silk Road.** Cishan's pits now shown as disputed (c. 10,300 – 8700 against 8000 – 7500 cal BP). Pearl millet added; an Iberia row dropped. |

**Read by eye.** *Article:* "the Pre-Pottery Neolithic"; dog domestication, Göbekli Tepe, Jericho,
Çatalhöyük, 'Ain Ghazal, sedentism, pottery, rice and millet domestication bare. *Confusability:*
`wh-122`/`wh-123`/`wh-124`/`wh-126` a period and three of its sites, each by its own finds; `wh-127`/`wh-128`
kept off `wh-116`'s Natufian clues; `wh-122` took one question off a redundant "as well as cereals …
alongside cereals". `wh-123`'s pillar height gained its imperial conversion.

**Glossary.** Six terms rewritten (*Göbekli Tepe*, *Jericho*, *Çatalhöyük*, *'Ain Ghazal*, rice and
millet domestication); dog domestication, Pre-Pottery Neolithic, sedentism and pottery already agreed.

### B14 — `wh-131`–`wh-140`, The Neolithic transition (2026-10-02)

Run as B11. Checks: `wh-audit.js --range=wh-131:wh-140` clean but for `W.not-why` on `wh-139` (one FAQ
opens "How"). `check-questions`, `check-style` (no new finding), `check-cards`, `check-docs`,
`split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched; all 74 distinct
URLs 200. **`wh-140`'s locator**: neither "Ötzi" nor "Tisenjoch" has a Wikipedia coordinate, so the pin
is the Similaun, the peak beside the findspot, labelled as such. `wh-139`'s request was dropped (it named
the region, Salisbury Plain); the old Stonehenge pin stands.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-131` maize domestication | 8 | 5 → 9 | Half the card was one selection study and site detail from Brazil and Belize; now Balsas teosinte and its stony fruitcase, one domestication c. 9,000 years ago, Xihuatoxtla by 8,700, **the Guilá Naquitz cobs "the earliest found in Mexico", not "the oldest in the Americas"**, the spread south half-domesticated, a staple by c. 4,300. |
| `wh-132` independent origins of agriculture | 7 | 5 → 7 | **"At least eleven centres" was one review's count, stated as the finding**; now the range with whose: Vavilov's eight plus three, more than 20, perhaps 24 – 28. Its second half was `wh-155`'s and `wh-158`'s subjects. No source giving "7" or "10" centres was found, so neither is stated. |
| `wh-133` Neolithic demographic transition | 6 | 5 → 6 | **Stated as fact; now a model** read from the share of 5 – 19-year-olds in cemeteries, with its proposed cause, the mortality that must follow, the Agta trade-off and its critics. **"From c. 9,000 BP in Europe" had no source and predates farming there**; now from c. 8,500 years ago. "Boom" and "bust" rows were not dates. |
| `wh-134` zoonotic disease | 8 | 5 → 8 | The card never stated the idea it tested. Now the livestock-and-crowd-disease hypothesis, the ancient-DNA test (1,313 genomes; Salmonella) and the counter-evidence: **tuberculosis older than farming, measles splitting from rinderpest only in the 6th century BCE, plague among Baikal hunter-gatherers**. `undatable` false (it carries a dated line). |
| `wh-135` lactase persistence | 7 | 5 → 7 | **"Selection began c. 7,500 BP" was one model's estimate stated as fact**; now labelled as modelled, then the earliest carrier (5,960 BP, Ukraine) and the rise after 3,000 BP. **"Only about 12 per cent" of Central Asian herders is the source's 12 – 30.** |
| `wh-136` secondary products revolution | 6 | 5 → 6 | **Sherratt put the uses in the 4th millennium in the Near East and the 3rd in Europe**, not one 4th-millennium horizon. "The Arbon yoke on Lake Constance" is not in the source; yoke, furrow and wheel claims left to `wh-165`/`wh-166`. Added dairying by the 7th millennium BCE and early draught, hedged. |
| `wh-137` Linear Pottery culture | 6 | 5 → 7 | Hung on one 2025 paper, with a "second wave" row carrying no year and **a cheese finding the source only offers as possible**. Now c. 5500 – 5000 BCE, fading c. 5000 – 4900; Transdanubian origin, Anatolian ancestry, loess, oak-lined wells (5099 BCE). Massacres hedged; Herxheim "perhaps ritual". |
| `wh-138` megalith | 8 | 5 → 8 | **"Where they begin was settled" by a 2019 model**: the model puts the first graves in France, the Mediterranean and Iberia within two or three centuries and only infers a French origin; now one view among three. **"50 tonnes (55 tons)"** is a conversion the source does not give. `undatable` true, no line (a type found in many ages). |
| `wh-139` Stonehenge | 9 | 5 → 9 | **The glossary's "c. 3100 – 2400 BCE" shared no figure with the card**; both now English Heritage's phases (ditch c. 3000, sarsens c. 2500, last pits c. 1800 – 1500 BCE). The card said nothing of what it was for; added the solstice axis, the bluestone quarries and pig feasts drawn from across Britain. Altar Stone "probably", not "almost certainly", by sea. |
| `wh-140` Ötzi | 8 | 5 → 8 | Questions carried "some 5,300 years ago"; a row "the early Copper Age" had no year. Added who he was (age, height, 61 tattoos, kit, last meal, route) and the copper's Tuscan source; the arrow's downward path is "suggests". The glossary's "best-recorded" had no source. |

**Read by eye.** *Article:* "the Neolithic demographic transition", "the secondary products revolution",
"the Linear Pottery culture", "the megalith"; maize domestication, the independent origins (the question
supplies "the"), zoonotic disease, lactase persistence, Stonehenge, Ötzi bare. *Confusability:*
`wh-131`/`wh-132` one crop and the comparison; `wh-135`/`wh-136` a gene and a model of animal use, kept off
each other's milk-residue clues; `wh-138`/`wh-139` a type and its most famous member. *Sensitivity:*
`wh-140` is written about a man, not an exhibit.

**Glossary.** Eight terms rewritten; *Linear Pottery culture* already agreed.

### B15 — `wh-141`–`wh-150`, Neolithic worlds (2026-10-02)

Run as B11; all ten drafts were cut off by a usage limit and finished by fresh agents. Checks:
`wh-audit.js --range=wh-141:wh-150` clean on all ten. `check-questions`, `check-style` (no new finding),
`check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched; all 72
distinct URLs 200. **`check-cards` refused one phrasing of `wh-143`**: its scholar-in-question rule read
"River Boyne" as a person's name; reworded to "the Boyne valley". (Precheck does not run `check-cards`;
it is the one guard that still shows up only at apply time.) Locators re-fetched for Skara Brae,
Newgrange, Varna and Mehrgarh.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-141` Neolithic Europe | 8 | 5 → 8 | **Modelled figures stated as fact** (50 against 70 km a generation, 3.6 per cent intermarriage, five-to-one numbers) dropped. The 6600, 4000 and 3000 BCE dates now each rest on a source; the sea route's Impressa and Cardial pottery named; booms and busts, and farmers living beside foragers for 3,000 years, added. |
| `wh-142` Skara Brae | 7 | 5 → 7 | **"Abandoned in the 24th century BCE" was a date for Orkney villages generally**; Historic Environment Scotland gives c. 2500 BCE. Two ideas HES now calls outdated (midden-buried houses, drains "not for sewage") dropped. |
| `wh-143` Newgrange | 7 | 5 → 7 | Genetics padding (`wh-138`'s) out; **"200,000 tonnes" is the source's figure for "the largest cairns"**, not this one. A row dating one bone replaced by the pig feasts, 2600 – 2450 BCE. The "dynastic elite" is one study's reading, followed by its critics. |
| `wh-144` Varna necropolis | 6 | 5 → 7 | **"Some 270 burials" is the museum's 301 graves, 47 symbolic.** **"The oldest gold in the world" is "the earliest large collection of gold objects known".** Grave 43 is a man over 60; "no newcomers" softened. |
| `wh-145` Chalcolithic | 7 | 5 → 7 | **"c. 6200 – 3700 BCE" began with the first use of copper minerals in the Neolithic**; the period runs c. 5000 – 3700 BCE in the Balkans. Smelting moved to `wh-146`; the Greek roots, "Eneolithic", the Ghassulian and the Hungarian Copper Age added. |
| `wh-146` early metallurgy | 7 | 5 → 7 | Rebuilt around native copper at Çayönü, smelting at Belovode c. 5000 BCE, **the Tal-i Iblis claim dated only relatively, the Çatalhöyük "slag" not slag**, and the Old Copper tradition. Andean gold dropped (source would not open). A "9th millennium BCE" row written as c. 9000 – 8000 BCE so the card sorts. |
| `wh-147` Yangshao culture | 7 | 5 → 9 | **"Largest sites 10 – 12 ha before 5000 BCE" belonged to the earlier Laoguantai and Houli cultures**; now c. 15 – 70 ha around 4000 BCE. Manuring limited to the Baishui valley where it was measured. Dancers, fermentation moulds and "twelve burials" dropped. |
| `wh-148` Longshan culture | 7 | 5 → 9 | **Cattle's arrival was one site's date (4200 – 3900 BP)**; now 4300 – 3900 BP for the Central Plains. "Heated until cracked" and "before the Shang" had no source. Now a family of regional cultures and a "Longshan era"; eggshell pottery added. No source reached calls Taosi walled. |
| `wh-149` Jōmon period | 7 | 5 → 8 | **Its start came from a paper whose same sentence calls Jōmon pottery "the earliest in the world"**, which it is not (South China's is older). Span c. 16,500 – 2,400 years ago; rice in Kyushu c. 1251 – 872 BCE. The glossary cited a DOI that answers 403. |
| `wh-150` Mehrgarh | 6 | 5 → 6 | **The 2024 redating to 5200 – 4900 BCE was stated as settled**; the line now gives the excavators' c. 8000 BCE beside it. No source read gives "7000 BCE". Drilled molars and cotton thread added, undated. |

**Read by eye.** *Article:* "Neolithic Europe" bare (a place-like name), "the Chalcolithic", "the
Yangshao culture", "the Longshan culture", "the Jōmon period", "the Varna necropolis"; Skara Brae,
Newgrange, Mehrgarh, early metallurgy bare. *Confusability:* `wh-145`/`wh-146` a period and a craft, the
smelting evidence on one card only; `wh-147`/`wh-148` kept apart by phase and by finds. *Other
collections:* `wh-149` gives the Jōmon start as c. 16,500 years ago and rice in Kyushu as c. 1251 – 872 BCE;
the `jp-` cards use c. 13,000 BCE and `jp-023` 1176 – 845 BCE — the two disagree and are left for a `jp-`
pass to reconcile.

**Glossary.** Nine terms rewritten; *Yangshao culture* already agreed.

### B16 — `wh-151`–`wh-160`, Neolithic worlds (2026-10-02)

Run as B15 (eight of the ten drafts finished after the usage limit). Checks: `wh-audit.js
--range=wh-151:wh-160` clean but for `W.not-why` on `wh-160`. `check-questions`, `check-style` (no new
finding), `check-cards`, `check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations
--card` 0 mismatched; all 65 distinct URLs 200. New locators: `wh-154` Nabta Playa, `wh-155` Kuk,
`wh-159` Poverty Point. One agent ran `add-glossary.js` while testing (it has no dry run), then restored
both entries; the diff was checked and the later prompts forbid it.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-151` African humid period | 6 | 9 → 7 | **"15,000 – 5,500 BP" is c. 14,500 – 5,000** (peak 11,000 – 5,000). **An "arid pause 8,200 – 7,200" row was the 8.2-ka event's date put on Gobero.** The Megachad 361,000 km² figure (paper would not open) and "ten times today's rain" (no source) dropped. |
| `wh-152` Saharan rock art | 7 | 7 → 7 | **The period dates had no source**; now one common chronology, and the card says the sequence is a modern construct with disputed dates. 707 Acacus sites, failed pigment dating and Messak platform dates rested on papers that would not open. Cave of Swimmers added. |
| `wh-153` African cattle pastoralism | 7 | 7 → 7 | **"First livestock 7,000 BP" was one Libyan site's date**; now c. 8,000 BP for north-eastern Africa. **"Whole cattle buried at Messak" were disarticulated remains.** Local taming of the aurochs is an older view weighed against genetics; Lothagam North and the spread south added. |
| `wh-154` Nabta Playa | 5 | 5 → 6 | Dates now the excavators' calibrated phases (c. 8600 – 3300 BCE; cow tumulus c. 5400 BCE). **The astronomy is the excavators' modern interpretation**, and the oldest-domestic-cattle claim is set against critics who measured the bones as wild. A tumulus count and the standing stones' spacing had no source. |
| `wh-155` Kuk Swamp | 6 | 5 → 6 | **The 10,220 – 9,910 BP first phase came from a paywalled paper that could not be checked**; now "c. 10,000 BP", and whether that phase is farming is argued. The mounds of 6950 – 6440 BP are the first undisputed farming. A Vanuatu taro sentence was off topic. |
| `wh-156` Austronesian expansion | 7 | 5 → 7 | **"4,800 BP" for the move into Taiwan had no source**; the handbook gives 5,500 – 5,000. Remote Oceania starts c. 3,500 BP with the Marianas; Madagascar hedged to 1,450 – 1,350 BP; the "Out of Sundaland" rival view added. |
| `wh-157` Lapita culture | 6 | 5 → 8 | **The start "c. 3,450 BP" is c. 3,350 – 3,150 BP** (the 2025 synthesis; Posth 2018). Added Teouma (skulls removed from every adult, almost no Papuan ancestry, the giant tortoise hunted out), Tonga by c. 2,850 and plain wares by c. 2,700. |
| `wh-158` Eastern Agricultural Complex | 6 | 5 → 7 | **Goosefoot's "3,700 BP" is the Riverton complex at 3,800.** "Domesticated marshelder is extinct" is in no source. The crop list now said to vary by author; population growth as the cause is one view. |
| `wh-159` Poverty Point | 6 | 5 → 6 | **Mound A's 90-day build was stated as fact**; now one study's argument. Figures no source gave dropped; a "90 days" row removed. A recent redating of most earthworks to 3,300 – 3,200 BP added, hedged. |
| `wh-160` Andean domestication | 7 | 6 → 8 | **Its camelid row (9,000 – 8,000 BP) and guinea-pig row (c. 4,000 BP) came from a one-line editorial summary**; now the Ñanchoc farming system by c. 8,600 BP, alpaca 7,000 – 6,000 BP, guinea pig 6000 – 2000 BCE, potato 3400 – 1600 BCE. |

**Read by eye.** *Article:* "the African humid period", "the Austronesian expansion", "the Lapita
culture", "the Eastern Agricultural Complex"; Saharan rock art, African cattle pastoralism, Nabta Playa,
Kuk Swamp, Poverty Point, Andean domestication bare. *Confusability:* `wh-151`/`wh-152`/`wh-153`/`wh-154`
a climate, an art, a way of life and a site of the same green Sahara, each with its own clues;
`wh-156`/`wh-157` a migration and one culture of it. *Consistency:* `wh-156`'s Remote Oceania c. 3,000 –
2,800 agrees with `wh-157`'s.

**Glossary.** Nine terms rewritten; *Poverty Point* already agreed.

### B17 and B18, in part — ten of `wh-161`–`wh-180` (2026-10-02)

**The run stopped here.** The research agents hit the account's weekly usage limit (it resets on 8 October),
so B17 and B18 are each partly done and B19 – B20 are not started. What is applied below was finished,
read by eye and checked like every earlier batch; nothing half-researched was written. **Still open:**
`wh-165` plough, `wh-166` wheel (which still has no glossary entry, `G.none`), `wh-171`–`wh-174`,
`wh-177`–`wh-200`. The scratch harness had partial drafts for some of these; a later session should start
them again from `prep.js`, not from those drafts.

Checks on the ten: `wh-audit.js --card` clean but for `W.not-why` notes on three; `check-questions`,
`check-cards`, `check-style` (no new finding), `check-docs`, `split-cards --check`, `test-card-plans` pass;
`check-citations --card` 0 mismatched; all 76 distinct URLs 200. `wh-167` cites a 1968 report that is a
scanned PDF with no text layer: its saved page is an agent's transcription, and the quoted passages were
checked by eye against the rendered scan. New locator: `wh-161` (Arica).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-161` Chinchorro mummies | 7 | 5 → 7 | **"Culture 10,000 – 4,000 BP" and "mummification 8,000 – 4,400 BP" are in no source read**; three give c. 7,000 BP to an end c. 3,700 – 3,500 BP. A 200 µg/L arsenic figure dropped with the review that carried it (which also calls the Chinchorro "an Incan colony"); arsenic is now one of two hypotheses for why the practice began. |
| `wh-162` prehistoric warfare | 8 | 5 → 8 | **Jebel Sahaba was "raids and ambushes"; it is now read as recurring clashes over years.** Nataruk added with the challenge to it, and the "peaceful foragers" debate without naming scholars. Potočani's "from two years old" had no source. `undatable` true. |
| `wh-163` origins of social inequality | 8 | 5 → 9 | The card retold one 2025 house-size study as if it were the history; rebuilt around foragers against early states, the Sunghir children, granaries before farming, inheritance, and the lag of inequality behind farming. Graeber and Wengrow's challenge named as their view. The glossary now describes inequality generally. |
| `wh-164` fibre technology | 7 | 5 → 7 | **A citation expanded an author's initials to "Bruce"**, which the paper does not print. A Shizitan title corrected; its dye counts and colours are not in the source. Dzudzuana flax added as debated; looms added. |
| `wh-167` irrigation | 9 | 5 → 9 | **Five recent case studies with no history of irrigation**; now Choga Mami's Samarran ditches (no year: no source fetched dates them), Sumer's dated canals from c. 4,500 years ago, Nile basin irrigation and the Scorpion mace head, and the hydraulic hypothesis as a criticised modern theory. |
| `wh-168` prehistoric trade | 8 | 5 → 9 | **The down-the-line and "longest journey" claims were cited to a paper that says neither.** Refocused on Anatolian obsidian in the Levant and Zagros, *Spondylus* and Badakhshan lapis lazuli; the date line emptied (`undatable`). |
| `wh-169` Ubaid period | 7 | 5 → 9 | **Tell Zeidan's 5300 – 3850 BCE was one site's date**, given to the period; a Levantine copper awl dropped. No source gives "6500 – 3800 BCE", so the line keeps c. 6000 – 4000 BCE. Pottery, tripartite houses and the debate over the label added. |
| `wh-170` urban revolution | 7 | 6 → 8 | **The term is from 1936**, a chapter title in Childe's *Man Makes Himself*; 1950 is the article with the ten criteria. The card opens by calling it a modern model; its first date is the Uruk period, not Trypillia. The ten criteria rest on a 2021 preprint — the one non-peer-reviewed source. |
| `wh-175` writing system | 8 | 5 → 8 | **Rongorongo "before any outside influence" overclaimed** (its source warns the wood may be older than the carving). Off-topic counts dropped; the four independent inventions, the rebus principle and the token theory (one view, with critics) added. |
| `wh-176` cylinder seal | 7 | 5 → 7 | **"Cut without metal" was the authors' own guess**, and their own paper reports bronze seal-cutting tools of the Akkadian period. The 2,000-seal figure and the Ninishkun seal dropped. In use c. 3500 – 330 BCE, with the middle-chronology clause. |

**Read by eye.** *Article:* "the Chinchorro mummies", "the origins of social inequality", "the Ubaid
period", "the urban revolution"; the rest bare or "a" (writing system, cylinder seal). *Confusability:*
`wh-162`/`wh-163` violence and rank, each with its own sites; `wh-167`/`wh-168` water and exchange, kept off
`wh-170`'s and `wh-197`'s clues.

**Glossary.** Nine terms rewritten; *urban revolution* already agreed.

### B17 and B18, completed — the other twelve of `wh-161`–`wh-180` (2026-10-02)

Run as B16 from fresh `prep.js` drafts, with Commons calls forbidden to the research agents. Mesopotamian
dates before c. 1500 BCE now follow the **middle chronology** (Hammurabi 1792 – 1750 BCE), and each card
giving such a date says so once in its prose. Checks: `wh-audit.js --card` clean on all ten but a `W.not-why`
note on `wh-166`; `check-questions`, `check-cards --prefix` per card, `check-style` (no new finding),
`check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched; all 61
distinct URLs 2xx. PMC served a CAPTCHA all run, so PMC articles are cited at their Europe PMC full-text URL.
New locators: `wh-178` (Eridu, labelled Abu Shahrayn), `wh-180` (Ur, labelled Tell el-Muqayyar), `wh-177`
(the Ur ziggurat, labelled Ur: a building card needs one, and Ur's is the best-preserved). New glossary
term: **Wheel** (`G.none` closed).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-165` plough | 9 | 5 → 9 | **"From c. 3600 BCE" was the South Street marks; the oldest European ard marks, at Sion, are c. 5100 – 4700 BCE.** An arm-bone paper about metallurgy, not ploughing, dropped. Added the Arbon yoke, the Sumerian seeder plough and *Farmer's Instructions*, the mouldboard, and the inequality and gender-roles views, each as a view. |
| `wh-166` wheel | 9 | 5 → 10 | **"3 to 16 kilometres an hour" was in no source**, and the copper-miners theory of the wheel's invention was the card's own claim; now "one recent theory". The wagon mugs are dated by their culture (formed by 3600 BCE), not as made by then. Ljubljana, Mesoamerica's wheeled toys and Ireland's late wheel added. |
| `wh-171` Mesopotamia | 9 | 5 → 9 | A run of single-site findings (Khani Masi millet, zinc isotopes, a Neolithic "focaccia") that never said who lived there or when; now the land, its peoples, c. 3200 – 331 BCE, canals against an ill-timed flood, and cuneiform. A "cuneiform until 100 CE" row dropped for `wh-174`'s 75 CE. |
| `wh-172` Sumer | 8 | 5 → 8 | Shekel weights, brick stamps and cattle fodder dropped; the Sumerian language, writing, the earliest readable poetry and the end of Sumerian primacy added. Ur III 2112 – 2004 BCE. |
| `wh-173` Uruk | 7 | 5 → 8 | **An "expansion c. 3550 BCE" row was a conversion of one paper's 5,500 BP.** Half the old background was Susa, Arslantepe and Tell Brak; now the city: growth from 15 villages, 250 hectares and 25,000 people, its dispersed plan, Eanna, writing. Uruk period ends 3200, not 3250. |
| `wh-174` cuneiform | 8 | 5 → 9 | **A corpus-size comparison was cited to a Neo-Assyrian emotion study that does not make it**; an "Akkadian c. 2700 BCE" row dated a language, not the script. Glossary's end "c. 100 CE" is 75 CE. Rebuilt around how the script worked: stylus, rebus, about 80 sound-signs, 600,000 tablets. |
| `wh-177` ziggurat | 8 | 5 → 8 | The old card described only Ur's tower; now the type, with Eridu's terrace, Chogha Zanbil, Herodotus and Babel. A magnetic-brick sentence (true of any fired brick) dropped, and a figurine whose page is gone. |
| `wh-178` Eridu | 7 | 5 → 7 | **The first-season Ubaid temple was called "the earliest shrine"**, which its report does not say. The level count is "18 or 19", the two reports differing; a non-date row dropped. |
| `wh-179` Sumerian city-state | 7 | 5 → 7 | **"A city upstream held its rival's water" was in no source.** Eridu and Ur housing moved off to their own cards; now dynasty, patron god, the king list and war, with Lagash as the worked example. |
| `wh-180` Ur | 8 | 5 → 8 | Three sentences and every FAQ rested on a zinc-isotope study of Abu Tbeirah, another site; 5500 BCE was cited to the wrong source; the glossary garbled Shulgi. Now the city's whole life to its last tablets c. 500 – 400 BCE, the river shift hedged as the excavators'. |

**Read by eye.** *Article:* "a ziggurat", "a Sumerian city-state"; the rest bare. *Confusability:*
`wh-171`/`wh-172`/`wh-179` the land, its southern culture and its political unit; `wh-173`/`wh-178`/`wh-180`
three cities, each on its own god and story; `wh-180` kept off `wh-181`'s cemetery and `wh-186`'s dynasty.
*Consistency:* cuneiform c. 3300 BCE – 75 CE across `wh-171`/`wh-174`; Uruk period c. 4000 – 3200 BCE as in
`wh-170`.

**Glossary.** Eight terms rewritten and *Wheel* added; *Ziggurat* and *Sumerian city-state* already agreed.

**Pictures.** Commons answered one call at the start of the run and then refused the sandbox again, so the
picture pass deferred all but six cards whose pictures were sound and whose text was not: `wh-060`,
`wh-085`, `wh-098`, `wh-102`, `wh-111` and `wh-169` keep their files with a new description and alt.
`wh-041`'s locator is still open: "Rising Star Cave" has no primary coordinate.

### B19 — `wh-181`–`wh-190`, Mesopotamia (2026-10-02)

Run as B18, middle chronology throughout. Checks: `wh-audit.js --range=wh-181:wh-190` clean on all ten;
`check-questions`, `check-cards --prefix` per card, `check-style` (no new finding), `check-docs`,
`split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched; all 67 distinct URLs 2xx.
New locators: `wh-181` and `wh-186` (both at Ur, labelled Tell el-Muqayyar). `add-card.js --replace` refused
`wh-185`'s existing two-ring region (Akkad and Magan), which `add-locators.js` had written; it now validates
each ring of a multi-ring `area`, and the region stands.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-181` Royal Cemetery at Ur | 7 | 5 → 7 | A phrasing carried a year. The royal tombs are c. 2600 – 2500 BCE with Puabi put near 2450 by one account, and the line says c. 2600 – 2450. **The servants "drank poison" was the excavator's reading**; CT scans of two skulls point to blows, heating and mercury. Kungas on the Standard added. |
| `wh-182` Gilgamesh | 9 | 5 → 9 | **"The fifth king of Uruk" was in no source.** Now a probable reign c. 2600 BCE from later writings, the Nippur temple record, worship by c. 2500, and the Sumerian poems (Aga of Kish, the death poem); the king-list reign as legend. |
| `wh-183` Epic of Gilgamesh | 9 | 5 → 9 | Two phrasings carried centuries or 1872. The old card leaned on one review and misdated the Penn tablet; now oldest copies c. 1800 – 1500 BCE, the Standard version c. 800 – 100 BCE, the Sumerian poems behind it, the flood tablet and the missing third. |
| `wh-184` Sargon of Akkad | 8 | 6 → 8 | **The card said the Louvre dates the reign "on the conventional chronology"**; its page gives only the years. A phrasing carried the 56-year reign; the reign is now doubted as the king list gives Naram-Sin the same. An omen was misread ("the Persian Gulf" for "the Sea in the East"). |
| `wh-185` Akkadian Empire | 8 | 5 → 10 | The card gave no date for the empire; now c. 2350 – 2150 BCE, Old Akkadian administration, reach to Susa, the Gutian overthrow, and drought against continuity as a debate. The *Curse of Agade* is set against the king list. |
| `wh-186` Third Dynasty of Ur | 7 | 5 → 8 | No date for the dynasty and three phrasings on its siblings' ziggurat, stela and Nabonidus; now 2112 – 2004 BCE, Shulgi 2094 – 2047 with one excavation report's lower dates as the debate, merchants, Drehem and Susa. |
| `wh-187` Code of Ur-Nammu | 7 | 5 → 8 | **"Ur-Nammu killed Namhani of Lagash"**: the composite has him make Namhani governor. The "ten shekels for a foot" reading rested on a 1952 restoration; the questions now use the half-mina eye law. Later copies and the Schøyen cylinder added. |
| `wh-188` Old Babylonian period | 7 | 5 → 7 | **Amorites seizing power at Ur's fall is one view**, a later and gradual takeover another. "Kings who lived in tents", Akkadian as the spoken tongue and a count of 172 graves had no source. A phrasing on Ur's housing moved off `wh-180`'s clue. |
| `wh-189` Hammurabi | 8 | 7 → 9 | **"His people spoke Akkadian"** (card and glossary) had no source. His wars, his letters to Larsa and the fate of his realm added. |
| `wh-190` Code of Hammurabi | 8 | 5 → 9 | The 34-paragraph gap is hedged; a prologue-tablet claim dropped with the second French page. Taken to Susa c. 1150 BCE; found 1901 – 1902. |

**Read by eye.** *Article:* "the Royal Cemetery at Ur", "the Epic of Gilgamesh", "the Akkadian Empire", "the
Third Dynasty of Ur", "the Code of Ur-Nammu", "the Old Babylonian period", "the Code of Hammurabi"; the three
kings bare. *Confusability:* `wh-182`/`wh-183` the king and the poem, kept apart (Sumerian poems and cult
against the Babylonian epic); `wh-184`/`wh-185` the founder and his state; `wh-189`/`wh-190` the king and
his laws; `wh-180`/`wh-181`/`wh-186` the city, its cemetery and its dynasty. *Consistency:* Sargon 2334 BCE
ends `wh-179`'s Early Dynastic; Ur III 2112 – 2004 as in `wh-172`.

**Glossary.** Seven terms rewritten; *Epic of Gilgamesh*, *Third Dynasty of Ur* and *Code of Hammurabi*
already agreed. The *Hammurabi* and *Code of Hammurabi* entries carry malformed picture fields (licence in
the description, a bare URL as credit): picture pass.

### B20 — `wh-191`–`wh-200`, Mesopotamia (2026-10-02)

Run as B19. Checks: `wh-audit.js --range=wh-191:wh-200` clean but for `W.not-why` notes on five; the rest as
B19; all citation URLs 2xx and `check-citations --card` 0 mismatched. New locators: `wh-191` (Babylon) and
`wh-198` (Dur-Kurigalzu); `wh-199` and `wh-200` keep their drawn regions. **The Mesopotamia deck is now done.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-191` Babylon | 9 | 5 → 9 | **Two citations did not carry their claims**: one never mentions Esagila, another does not say Cyrus took the city. Rebuilt over the city's whole life, Hammurabi to Alexander; the Hanging Gardens as unlocated; Nebuchadnezzar II 605 – 562 BCE, some sources starting at 604. |
| `wh-192` Mesopotamian religion | 7 | 5 → 7 | **"The high priestess was usually the king's daughter"** had no source; a second French Louvre page dropped. Cult statues, Marduk's rise, divination and the underworld added. Its date line had two arbitrary anchors (a votive statue, Shulgi's reign); now empty and `undatable`. |
| `wh-193` Enuma Elish | 6 | 5 → 6 | **The poem was dated by its Nineveh copies (c. 670 BCE)** and given 994 lines; the 2024 edition gives 1,095, composition by 1082 BCE, the Nebuchadnezzar I link as a hypothesis, and a last dated copy of 495 BCE. New Year recital and the Assyrian Ashur version added. |
| `wh-194` Babylonian mathematics | 7 | 5 → 7 | Four of five sources were one exhibition's pages. Place value c. 2100 BCE in the Ur III state; the Old Babylonian bounds differ by source and both are given; Plimpton 322's purpose as a debate. |
| `wh-195` Babylonian astronomy | 7 | 5 → 7 | **"Diaries 750 BCE – 75 CE" was the span of observing; the surviving diaries run 652 – 61 BCE**, now two rows. A zodiac-tablet row and a planet-name list dropped; temple funding, water-clock eclipse timings, Halley's Comet in 164 BCE and the Venus cycle added. |
| `wh-196` edubba | 6 | 5 → 6 | **"c. 1730 BCE" had no source**, and the "mother of orators" hymn is from a copy of c. 650 BCE. A century-only row dropped. |
| `wh-197` Mesopotamian trade | 7 | 6 → 7 | **"c. 3100 BCE" was in no source.** Gulf trade c. 2900 – 1700 BCE, Ur III exports to Magan, Assur's tin and cloth at Kanesh, silver weighed as money. The glossary's Anatolian route had no support in its source. A Sargon row (another event's date) dropped from the line. |
| `wh-198` Kassites | 6 | 6 → 6 | Mostly a 1915 book; now five of six modern. "Curses" and a French-expedition claim had no source. First attested 1770 BCE; the dynasty's end c. 1155 – 1150 BCE, sources differing. |
| `wh-199` Elam | 7 | 5 → 8 | **Proto-Elamite "2900 – 2600 BCE" came from a 1968 note**; now c. 3050 – 2900. Susa's sack is 646 BCE, not "c. 640"; "the largest ziggurat" and an outdated succession sentence dropped. |
| `wh-200` Mitanni | 6 | 5 → 8 | **"A vassal treaty" and "gold the commonest complaint" had no source**; filler on Tell al-Rimah frit dropped. Empire c. 1550 – 1350 BCE; a century-only Hittite-defeat row dropped. |

**Read by eye.** *Article:* "the Kassites"; the rest bare or "the edubba". *Confusability:* `wh-191`/`wh-188`/
`wh-189` the city, the period and the king; `wh-192`/`wh-193` the religion and its creation poem;
`wh-194`/`wh-195`/`wh-196` the numbers, the sky and the school. *Consistency:* the dynasty's fall c. 1155 BCE
and the stele taken to Susa c. 1150 agree across `wh-190`/`wh-193`/`wh-198`; the Hittite sack of Babylon 1595
BCE (`wh-191`, `wh-198`); Nippur destroyed 1722 BCE (`wh-196`) is on its source's own chronology, which it
does not name. *Coverage:* `wh-200` gives no year for Mitanni's defeat, its sources differing.

**Glossary.** Nine terms rewritten; *Edubba* already agreed.

### B21 — `wh-201`–`wh-210`, Ancient Egypt (2026-10-03)

Run as B20, with Commons and Wikipedia refusing this sandbox (429 on the one test call), so no picture changed.
Egyptian dates are the conventional ones of Egypt's Ministry of Tourism and Antiquities and the Australian
Museum; where a source gives another chronology the prose gives both. **UCL's Digital Egypt pages, which the
old Egypt cards leaned on, now sit behind a Cloudflare challenge** and could not be re-read, so every claim
resting only on them was re-sourced or dropped. Checks: `wh-audit.js --range=wh-201:wh-210` clean but for
`wh-205`'s `I.duplicate` (its picture is also `eg-077`'s: picture pass); `check-questions`, `check-cards
--prefix` per card, `check-style` (no new finding), `check-docs`, `split-cards --check`, `test-card-plans`
pass; `check-citations --card` 0 mismatched; all 71 distinct URLs 2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-201` Ancient Egypt | 9 | 6 → 9 | Six date-line years were in no sentence of the background; now one dynastic-era row and the two Kingdoms, all in the prose. "A divine king whose office kept chaos out" was not in its source; now the famine-as-chaos ideal, cited. The flood angle moved to `wh-202`. |
| `wh-202` ancient Egyptian agriculture | 7 | 6 → 9 | **The card had drifted from the plan's "The Nile and Egyptian agriculture" to "emmer wheat"**, with an emmer-genome date line (9700 BCE; 1130 – 1000 BCE). Realigned: the flood's timing, basin farming, emmer, barley and flax, the three seasons, nilometers and the harvest tax. New answer and glossary term. |
| `wh-203` Naqada culture | 7 | 8 → 8 | **"Nearly three thousand graves in a single season of 1895"**: the source gives over 2,000 in just over three months, and the year differs by source (1894, 1895/96), so none is given. A Naqada III row the Ministry dates differently dropped; "first writing" claim dropped. |
| `wh-204` Narmer Palette | 7 | 6 → 8 | **"Greywacke, 63 cm" is siltstone, 63.5 cm; "two long-necked leopards" are serpopards; the "Hathor heads" are only cow-eared heads**, the goddess disputed. An Early Dynastic row (another event's date) became "Dedicated c. 3150 – 3000 BCE"; the Menes identification dropped. |
| `wh-205` unification of Egypt | 8 | 6 → 8 | **Aha's radiocarbon accession (3111 – 3045 BCE) and a comparison with southwest Asia rested on a paper no host would serve**, so they dropped. The line is now the process, c. 3350 – 3050 BCE, and the usual c. 3100; the Narmer Palette's war read as one view. |
| `wh-206` Egyptian hieroglyphs | 9 | 7 → 9 | **All seven old sources were unreachable**; re-sourced from *Visible Language* and the UCLA encyclopedia. A non-date "by the 3rd Dynasty" row dropped; in use c. 3320 BCE – 394 CE (Tomb U-j to Philae), another account's c. 3200 in the prose; deciphered 1822. |
| `wh-207` Rosetta Stone | 9 | 5 → 9 | Three French sources became one. **"News reached the Institut d’Égypte on 29 July" and demotic at Philae "into the 5th century" had no source.** A phrasing carried 196 BCE. Granodiorite, the revolt from 207 BCE and the Damanhur and Philae copies added. |
| `wh-208` papyrus | 9 | 8 → 9 | UCL-only claims (sheet sizes, exports, the codex, a 1087 CE end) dropped. The Hemaka roll is c. 3200 BCE in one study and "3rd millennium" in another; both given. Merer's logbook (c. 2600 BCE) added as the oldest written papyrus. |
| `wh-209` pharaoh | 9 | 7 → 9 | **"c. 3000 BCE – 300 CE" had an end no source gave**; now c. 3100 – 30 BCE. Claims on Ra-texts, the five names "by the Middle Kingdom" and Sobekneferu as "daughter of Ra" rested only on UCL and dropped. |
| `wh-210` Old Kingdom | 8 | 10 → 9 | **"20,000 – 30,000 workers" had no source.** Two dynasty rows dropped for the period, c. 2686 – 2181 BCE, with ends of 2160 and 2125 in the prose. The Khufu branch of the Nile, Merer's papyri, the Pyramid Texts and the famine-or-trade debate added. |

**Read by eye.** *Article:* "the Narmer Palette", "the Rosetta Stone", "the unification of Egypt", "the Naqada
culture", "the Old Kingdom", "a pharaoh"; the rest bare. *Confusability:* `wh-201`/`wh-202` the civilisation
and its farming, the flood moved to `wh-202`; `wh-203`/`wh-204`/`wh-205` the culture, the palette and the
process, `wh-205` naming Narmer only beside Ka; `wh-206`/`wh-207`/`wh-208` the script, the key and the
material; `wh-209`/`wh-210` the office and the age, `wh-210`'s Giza clue kept off `wh-212`'s. *Consistency:*
hieroglyphs' last inscription 394 CE and the decipherment of 1822 agree across `wh-206`/`wh-207`; the dynastic
era c. 3100 – 30 BCE across `wh-201`/`wh-205`/`wh-209`. `wh-201` gives the 1st and 2nd Dynasties from c. 3050,
its Abydos source's figure, beside the conventional c. 3100. *Against the eg- cards:* `eg-026` dates the Naqada
phases by radiocarbon (c. 3800 – 3085 BCE) where `wh-203` keeps the conventional dates; `eg-050` dates the
palette from c. 3100, `wh-204` from c. 3150. *Not done:* `wh-202`'s "Learn more" link still points at
*Emmer*, since `find-wiki-links.js` needs Wikipedia, which refused the sandbox.

**Glossary.** Eight terms rewritten and *Ancient Egyptian agriculture* added; *Rosetta Stone* already agreed.
The old *Emmer* entry stands.

### B22 — `wh-211`–`wh-220`, Ancient Egypt (2026-10-03)

Run as B21. Checks: `wh-audit.js --range=wh-211:wh-220` clean but for a `W.not-why` note on `wh-213` and
`wh-217`'s `I.duplicate`, a false positive (its URL ends in the generic `1920px-thumbnail.jpg`, as `wh-122`'s
does); the rest as B21; all 72 distinct URLs 2xx and `check-citations --card` 0 mismatched. New locators:
`wh-211` (Saqqara), `wh-212` (Giza) and `wh-213` (Giza plateau). An agent's glossary draft for `wh-220` made a
second key, "New Kingdom", beside the existing `New_Kingdom_of_Egypt`; it was removed and the existing entry
rewritten with "New Kingdom" as its alias.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-211` Step Pyramid of Djoser | 8 | 6 → 8 | **"His standing as architect appears only in Late Period sources"**: a few short inscriptions about Imhotep survive from near his lifetime, and he was a god by the New Kingdom. A 277 by 544 m enclosure had no source; now about 16 hectares. The 1992 earthquake added; a Second Dynasty row dropped. |
| `wh-212` Great Pyramid of Giza | 9 | 6 → 9 | **"Twenty to thirty thousand workers" had no source**; now "tens of thousands" with the workers' town. Phrasings carried "twenty years" and "3,800 years". The Khufu branch of the Nile, Merer's papyri and the 2023 corridor added; a Fourth Dynasty row dropped. |
| `wh-213` Great Sphinx of Giza | 9 | 5 → 9 | **The Dream Stela as "a much later copy" was a 1906 view.** "Paws dug clear in 1818" dropped, sources splitting 1817 and 1818. The line dated the carving by Khafre's reign; since the card gives the Khufu view too, it now gives the Fourth Dynasty, c. 2613 – 2494 BCE. Size and groundwater added. |
| `wh-214` mummification | 9 | 5 → 9 | **A c. 4300 BCE row had no source**; the prehistoric balms are c. 4500 – 3350 BCE. Budge's canopic-jar account dropped; **the Saqqara workshop's "myrrh" alone proved conifer-based**, which the card had overstated. |
| `wh-215` Book of the Dead | 9 | 5 → 9 | "More than 190 spells" is "about 190". **"Flourished c. 1580 – 1069 BCE" stopped with the New Kingdom, but the spells were used to the end of the Ptolemaic Period**; now c. 1580 – 30 BCE, and a century-only row dropped. |
| `wh-216` ancient Egyptian religion | 9 | 7 → 10 | The date line held three other events; now empty and `undatable`. "No founder, creed or scripture", "three thousand years" and Amun-Re as state god had no source. Maat, temple and household cult, Akhenaten and animal offerings rebuilt from fetched sources. |
| `wh-217` First Intermediate Period | 7 | 7 → 7 | **"Seventy kings in seventy days" was given to Manetho; it is now a later tradition.** The Ipuwer dating, the ninth and tenth dynasties as "one list in two columns" and a Theban start of c. 2160 rested only on UCL and dropped. Two datings on the line, a third and the drought debate in prose. |
| `wh-218` Middle Kingdom | 8 | 6 → 9 | **The Nubian forts "built in 32 years" contradicts its own source's reign dates**, and dropped. A reign row became the 12th Dynasty; the 2025 radiocarbon start, the Fayum and Abydos added. |
| `wh-219` Hyksos | 7 | 6 → 7 | An "Expelled c. 1550" row was in no source read; one row, c. 1638 – 1530 BCE. Manetho's invasion story is set against the strontium evidence of an elite that rose inside Egypt; the severed hands at Avaris and Seqenenre's wounds added. |
| `wh-220` New Kingdom | 8 | 7 → 8 | Five UCL sources were over the institution cap and gone; their vizier and viceroy claims dropped. **A kohl citation carried the wrong article number.** Two reign rows (another event's dates) became the three dynasties; Ahmose's start, 1580 – 1524 BCE by estimate, in prose. |

**Read by eye.** *Article:* "the Step Pyramid of Djoser", "the Great Pyramid of Giza", "the Great Sphinx of
Giza", "the Book of the Dead", "the First Intermediate Period", "the Middle Kingdom", "the Hyksos", "the New
Kingdom"; mummification and the religion bare. *Confusability:* `wh-210`/`wh-211`/`wh-212` the age and its two
pyramids, the Herodotus clue only on `wh-212`; `wh-214`/`wh-215`/`wh-216` the body, the spells and the
religion, the weighing of the heart only on `wh-215`; `wh-217`/`wh-218` both name Mentuhotep II, one as the
end and one as the start; `wh-219`/`wh-220` Avaris taken by Ahmose on both, the Hyksos' own story only on
`wh-219`. *Consistency:* Khufu c. 2589 – 2566 BCE on `wh-212` and in `wh-213`'s prose; the First Intermediate
Period ends and the Middle Kingdom begins at 2055 BCE. *Against the eg- cards:* `eg-175` dates the 12th
Dynasty c. 1981 – 1800 BCE, against the Ministry's c. 1985 – 1795 used on `wh-218`.

**Glossary.** Eight terms rewritten (*Pyramid of Djoser*, *Great Sphinx of Giza*, *Mummification*, *Book of
the Dead*, *Ancient Egyptian religion*, *First Intermediate Period*, *Hyksos*, *New Kingdom of Egypt*);
*Great Pyramid of Giza* and *Middle Kingdom of Egypt* already agreed. The *Great Pyramid of Giza* and *Great
Sphinx of Giza* entries carry malformed or licence-bearing picture fields: picture pass.

### B23 — `wh-221`–`wh-230`, Ancient Egypt (2026-10-03)

Run as B22. Checks: `wh-audit.js --range=wh-221:wh-230` clean but for `W.not-why` notes on two and `wh-229`'s
`L.missing` (below); the rest as B22; all 63 distinct URLs 2xx. `check-citations --card` reports one mismatch,
on `wh-224`: Crossref runs Seshadri's initial into his given name ("KrishnaG"), while the article itself prints
"Krishna G. Seshadri", which the citation follows. New locators: `wh-226` (Kadesh, labelled Tell Nebi Mend),
`wh-227` and `wh-228`. `wh-229` Nubia asked for "Nubia", which has no primary coordinate; a region is not drawn
by hand, so the card stays without one. **The Ancient Egypt deck is now done.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-221` Hatshepsut | 8 | 5 → 8 | **"The Hyksos expelled a century before" and "left out of the king lists" had no source**; the throne name dropped, no fetched source spelling it as the card did. A Thutmose III row (another person's dates) became her crowned reign, c. 1473 – 1458 BCE. Punt's baboons and the Speos Artemidos boast added from their texts. |
| `wh-222` Thutmose III | 7 | 5 → 8 | **The Annals' figures (7,942 foreigners, 340 captives) rested on a paper behind a bot wall** and dropped. A campaigns row (not a date) dropped; he ruled alone from c. 1458 BCE; the 1504 and 1468 – 1415 datings in prose. Henket-ankh and KV34 added. |
| `wh-223` Akhenaten | 8 | 7 → 8 | **Akhetaten was chosen in his fifth year, not his sixth.** "Nearly 400 tablets" and a Late Egyptian claim had no source. Reign c. 1352 – 1336 BCE, another dating in prose; an Akhetaten row dropped. The colossi's bodies as illness against imagery, and the lost Levant, added. |
| `wh-224` Tutankhamun | 9 | 5 → 11 | **"Restoration stelae" is one stela**, and the throne name had no source. "Died in his teens" is "died young". Reign c. 1336 – 1327 BCE with other reckonings in prose; Tutankhaten, the KV55 parentage view and the tomb's contents added. |
| `wh-225` Ramesses II | 9 | 5 → 9 | KV7, Piramesse at Qantir and "a bigger mark than any other king" rested only on UCL and dropped. Reign c. 1279 – 1213 BCE with one recent view's accession of 1290 BCE. The phrasings moved off the battle to Abu Simbel, Ozymandias and the treaty. |
| `wh-226` Battle of Kadesh | 7 | 5 → 7 | **The "Papyrus of Pentaur" and a Shemu-season date could not be verified** and dropped. 1274 BCE, c. 1286 on the higher chronology. The two Bedouin, the god-named divisions and 2,000 chariots or more a side added; both sides' claims of victory hedged. |
| `wh-227` Valley of the Kings | 9 | 5 → 9 | A four-row line, three of them not dates (dynasties, "over 60 tombs", a king), became one: in use c. 1504 – 1069 BCE. Thebes "never the administrative capital" dropped. The Ramesses IX robbery trials, the reburials and the KV62 radar scans added. |
| `wh-228` Karnak | 8 | 5 → 8 | **"In use c. 2112 BCE – 306 CE": 306 CE is the end of the Ministry's Roman Period, not of Karnak.** Three non-date rows dropped; the line is the first temple and the Hypostyle Hall. **"Begun perhaps by Amenhotep III"** is contested, and dropped. The Opet procession and the cachette added. |
| `wh-229` Nubia | 8 | 7 → 9 | A Snefru year and a place "Miam" had no source; **"Kerma destroyed"** is "subdued". **A kohl citation carried the wrong article number** (as on `wh-220`). Date line empty and `undatable`; two phrasings no longer name Senusret III and Thutmose I. |
| `wh-230` Third Intermediate Period | 7 | 5 → 7 | **"Kushite rule from about 725 BCE" clashed with Piye's c. 747 – 716**, and dropped. The line gives c. 1069 – 664 BCE and the Ministry's end of 747 BCE, the prose saying why they differ. |

**Read by eye.** *Article:* "the Valley of the Kings", "the Battle of Kadesh", "the Third Intermediate Period";
the kings, Karnak and Nubia bare. *Confusability:* `wh-221`/`wh-222` each names the other as co-ruler, told
apart by Punt and the divine birth against the Annals and Henket-ankh; `wh-223`/`wh-224` both touch Akhetaten,
one founding and one leaving it; `wh-225`/`wh-226` the king kept off the battle; `wh-227`/`wh-228` the west-bank
tombs and the east-bank temple; `wh-229` kept off `wh-416` Kush and `wh-417` Meroë. *Consistency:* Akhenaten's
end and Tutankhamun's start at 1336 BCE; Kadesh in Ramesses II's fifth year and the treaty in his 21st on both
`wh-225` and `wh-226`; the New Kingdom's end at 1069 BCE on `wh-220`, `wh-227` and `wh-230`.

**Glossary.** All ten terms rewritten.

### B24 — `wh-231`–`wh-240`, The Indus and early China (2026-10-03)

Run as B23. The India collection (`in-`) is still empty, so there was no sibling card to compare. Checks:
`wh-audit.js --range=wh-231:wh-240` clean but for `W.not-why` notes on three; the rest as B23; all 53 distinct
URLs 2xx and `check-citations --card` 0 mismatched. New locators: `wh-232` Harappa, `wh-233` Mohenjo-daro,
`wh-236` Dholavira and `wh-237` Lothal.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-231` Indus Valley Civilisation | 8 | 5 → 8 | **The old list gave a single-authored 2018 paper four co-authors and dropped four of another's seven.** Covered drains, "from the Himalaya to the Arabian Sea", aridity "from 2100 BCE" and a fish-bone detail had no fetched source. The line is the urban phase alone; the phrasings kept off planning and decline. |
| `wh-232` Harappa | 8 | 6 → 8 | The same miscounted authors, and a missing one on Robbins Schug 2013. Occupied c. 3700 – 1300 BCE through the Ravi, Kot Diji and urban phases (James et al. 2025); brick-robbing under colonial rule, the walled neighbourhoods and the incomers' tooth isotopes added. |
| `wh-233` Mohenjo-daro | 8 | 5 → 8 | **Four of five sources were one author**; two global surveys dropped with an unsourced Pillared Hall size, a "cosmic order" line and a "largest houses c. 2500 BCE" row. The Mound of the Dead, the Great Bath, the missing cemetery, the floods and **the "massacre" as a discredited story** added. |
| `wh-234` Indus script | 7 | 5 → 7 | **"3,000 – 3,800 texts" and "14 signs a line" rested on a paper that would not open**; now under 6,000 objects and 17 signs at most. "Eighty years of decipherments" had no source, and a West Asia claim was not in the paper cited. The non-writing view and the administrative-tag view each as a view. |
| `wh-235` Indus urban planning | 7 | 5 → 7 | **Drains ran in the wide streets, not under the lanes**; weights go from under 1 gram. One author in three sources cut to two; a gateway-tax claim dropped. The Indus weight unit and Harappa's late disorder added; public goods as one view. |
| `wh-236` Dholavira | 6 | 6 → 7 | **"The Indus weights descend from one shared unit": the source says the opposite.** A BP line and an earthquake row became c. 3000 – 1500 BCE and the 1989 – 2005 excavation; two phrasings carried figures of years; a Khirsara aside dropped. |
| `wh-237` Lothal | 6 | 6 → 7 | **The line gave the whole civilisation's 2600 – 1900 BCE to one town**; now the excavator's two periods from the 1963 radiocarbon report. The dock is one view, set against the 1968 irrigation-tank reading and a 2024 river study. |
| `wh-238` decline of the Indus civilisation | 7 | 6 → 7 | A drought row (another event's date) became the Late Harappan phase, c. 1900 – 1300 BCE. Every cause is now a view, and **the river view meets a 2017 dating showing Kalibangan's river had gone long before the city**. |
| `wh-239` Indo-Aryan migrations | 7 | 5 → 8 | Claims cited to an unverifiable 2026 paper dropped. The genetic evidence (steppe ancestry c. 2100 – 1700 BCE in Central Asia, c. 2000 – 1500 BCE in South Asia, carried mainly by men) and the linguistic evidence (the Mitanni gods, Finno-Ugric loans) added, with the Hindu nationalist and the 2012 dissenting views each named as whose. |
| `wh-240` Vedic period | 8 | 5 → 8 | An irrelevant citation dropped; **two rows dated another event and the `wh-241` Rigveda's composition**. Now c. 1500 – 500 BCE, every date an estimate from the texts; oral transmission, the Kuru realm, iron and the Upanishads added. |

**Read by eye.** *Article:* "the Indus Valley Civilisation", "the Indus script", "the decline of the Indus
civilisation", "the Indo-Aryan migrations", "the Vedic period"; the sites and planning bare. *Confusability:*
`wh-231`/`wh-235`/`wh-238` the civilisation, its planning and its end, each phrasing kept off the others'
clues; the four sites each by its own feature (Ravi and walled wards; Great Bath and stupa; reservoirs on
Khadir; the basin and Gulf seal); `wh-239`/`wh-240` the arrival and the age, the Rigveda kept for `wh-241`.
*Consistency:* the urban phase c. 2600 – 1900 BCE on all six Indus cards; the five great cities named alike on
`wh-231`, `wh-232`, `wh-233` and `wh-236`. *Contested:* `wh-239` gives the migration as the genetic and
linguistic consensus and names the dissenting views; its phrasings name no scholar.

**Glossary.** Nine terms rewritten; *decline of the Indus civilisation* already agreed.

### B25 — `wh-241`–`wh-250`, The Indus and early China (2026-10-03)

Run as B24. Checks: `wh-audit.js --range=wh-241:wh-250` clean on all ten; `check-questions`, `check-cards
--prefix` per card, `check-style` (no new finding), `check-docs`, `split-cards --check`, `test-card-plans` pass;
`check-citations --card` 0 mismatched; all 52 distinct URLs 2xx. New locators: `wh-247` (Yinxu, labelled Anyang) and `wh-250`
(Sanxingdui, labelled Guanghan). **Harness lesson:** two glossary drafts (`wh-241`, `wh-242`) numbered their
markers by the card's source list, not the entry's own shorter one; `precheck.js` does not catch it and
`add-glossary.js` refused at apply time. Both were renumbered by hand against the entry's list.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-241` Rigveda | 8 | 5 → 8 | **The Song of Creation (10.129) was cited to a Griffith volume that stops before book 10.** A Niya Prakrit paper and a Thar Desert study dropped, and "the oldest book of the subcontinent" with them. The 1500 – 1000 BCE dating is credited as Macdonell's early estimate beside a modern c. 1200 BCE. |
| `wh-242` Sanskrit | 9 | 5 → 9 | **A "Vedic Sanskrit" row carried the Rigveda's dates**; now Old Indo-Aryan c. 1750 – 250 BCE and Panini c. 400 BCE. Steppe-ancestry claims (`wh-239`'s subject) dropped; the name, the Prakrits, the Mitanni loanwords and Panini added. |
| `wh-243` Erlitou culture | 6 | 5 → 6 | The culture is c. 1800 – 1530 BCE on new radiocarbon, the older c. 1900 – 1500 in prose. **"No fortifications" is wrong for the culture**, and with other claims cited to off-subject papers dropped. The Luoyang basin, the four-tier settlements and the walled bronze workshop added. |
| `wh-244` Xia dynasty | 7 | 6 → 7 | **The Erlitou–Xia link was stated as fact; now a modern, unproven claim.** Each date says whose: later imperial annals 2205 – 1767 BCE, the Bamboo Annals from 1989 BCE, the chronology project c. 2070 – 1600 BCE. A "Xinzhai capital" claim and an unread flood paper dropped. |
| `wh-245` Shang dynasty | 7 | 5 → 8 | The old card was three narrow studies (a skull ditch, a cemetery's genomes, typhoons); now the whole dynasty, c. 1600 – 1046 BCE as the chronology project's dates. **A "Late Shang c. 1300" row had no source.** |
| `wh-246` oracle bone script | 7 | 5 → 8 | **The end was 1045 BCE; the standard date is 1046**, as on `wh-245`. Dataset details given as general facts dropped; divination, the 1899 discovery and the eclipses of 1201 – 1181 BCE added. |
| `wh-247` Yinxu | 6 | 5 → 6 | Water-buffalo, typhoon and oracle-bone dataset claims dropped, and a row dating one tomb. Occupied c. 1250 – 1045 BCE as its source gives it; the four-ramp tombs, lineage cemeteries and the captives' origins (hedged) added. "500 km" now carries its miles. |
| `wh-248` Chinese ritual bronzes | 7 | 5 → 7 | A row giving the dynasty's own dates dropped for c. 1600 – 221 BCE, the span of the vessels; **the mould-location claim cut back to what its source says**. Two sources are Art Institute of Chicago API records, its pages answering 403. |
| `wh-249` Fu Hao | 6 | 5 → 6 | Three off-subject sources dropped. **The line gave Yinxu's span, not hers**; no source gives her birth or death, so it gives Wu Ding's reign, c. 1250 – 1192 BCE, as debated. Tomb M5, the Hou Mu Xin cauldrons and her role as a warrior consort added. |
| `wh-250` Sanxingdui | 6 | 5 → 6 | **A row dated one pit (K4) in BP**; now the centre c. 1700 – 1000 BCE, the pits c. 1200 – 1000 BCE and the find of 1929. **"Ivory over the bronzes" in every pit had no source.** |

**Read by eye.** *Article:* "the Rigveda", "the Erlitou culture", "the Xia dynasty", "the Shang dynasty", "the
oracle bone script"; Sanskrit, Yinxu, Fu Hao and Sanxingdui bare; "Chinese ritual bronzes" plural. 
*Confusability:* `wh-243`/`wh-244` the excavated culture and the dynasty of the texts, each naming the other only
as a claim; `wh-245`/`wh-246`/`wh-247`/`wh-249` the dynasty, its writing, its capital and its queen, the
sacrifice clue only on `wh-245`, the tombs on `wh-247` and `wh-249` told apart by Xibeigang and M5;
`wh-248`/`wh-249` both mention pure copper, on the vessels as a class and on her own. *Consistency:* the Zhou
conquest is 1046 BCE on `wh-245` and `wh-246`; `wh-247` keeps its source's occupation end of 1045 BCE and gives
1046 for the conquest in its prose. `wh-249`'s line is her consort's reign, the only date a source fixes her by.
*Against the cnh- cards:* `cnh-062` dates Erlitou c. 2000 – 1600 BCE; `cnh-066` ends Late Shang at 1050 BCE;
`cnh-069` ends Yinxu at 1046; `cnh-081` dates the bronzes 1600 – 771 BCE.

**Glossary.** Seven terms rewritten; *Shang dynasty*, *Yinxu* and *Chinese ritual bronzes* already agreed.

### B26 — `wh-251`–`wh-260`, The Indus and early China and The Bronze Age world (2026-10-03)

Run as B25. Checks: `wh-audit.js --range=wh-251:wh-260` clean but for `W.not-why` notes on two and `wh-252`'s
`I.duplicate` (its rubbing is also `cnh-105`'s: picture pass); `check-questions`, `check-cards --prefix` per
card, `check-style` (no new finding), `check-docs`, `split-cards --check`, `test-card-plans` pass;
`check-citations --card` 0 mismatched; all 76 distinct URLs 2xx. No new locators: none of the ten is a place. **The Indus and early China deck is now done.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-251` Western Zhou | 7 | 5 → 7 | **An "877 – 771 BCE" row was one kiln study's date.** The line is c. 1046 – 771 BCE with the firm dates from 841; the project's own alternatives (1044, 1027) and others' starts (1045, 1047) in prose. The fall in 771 and the hoards buried as the court fled added. |
| `wh-252` Mandate of Heaven | 8 | 5 → 8 | **"Xunzi rejected the idea outright"**: its own source says he denied its premise. Heaven's command is attested on Western Zhou bronzes and in the Documents chapters dated to the period; Mencius and Dong Zhongshu's fuller theory added as later. |
| `wh-253` Chinese characters | 9 | 5 → 9 | **"One of only three scripts invented from scratch"**: the source also names Mesoamerica. Late Shang ends 1046, as on `wh-246`. A background of metaphor theory and the simplification debate became the script's whole story: stages, the Qin standard of 221 BCE, meaning-and-sound pairs, the 1956 reform. |
| `wh-254` silk | 9 | 5 → 9 | **"The Palmyra silk was Indian tasar"**: some of it was Chinese, so "some". A Sanxingdui row dropped; the Jiahu proteins, the Uzbek cocoons of 1940 – 1765 BCE, degumming and pebrine added; `undatable` false. |
| `wh-255` jade | 9 | 5 → 9 | **Xinglongwa as "the earliest" jade was one survey's view, stated as fact**; now credited. The heaven-and-earth reading of the cong and bi marked as possibly later, the bi-from-spindle-whorl idea as one view. Runs to the Shang and Western Zhou; `undatable` false. |
| `wh-256` Bronze Age | 9 | 5 → 9 | **The glossary's "3300 BCE" was cited to a source that does not give it.** An Israeli tin study and a 291-million-year ore age dropped; the line gives three regional spans, each read off a source; the collapse cut to one sentence for `wh-279`. |
| `wh-257` bronze | 9 | 5 → 9 | Balkan lead pollution, a "3600 BCE" row and two phrasings on Anyang and Serbia dropped. Earliest known c. 4650 BCE (the Pločnik foil), widespread by 1500 BCE. **A citation's issue number (6 for 7) and another's page range corrected.** |
| `wh-258` Yamnaya culture | 7 | 5 → 7 | **"435 individuals": the paper gives 428**, so no count is given. Riding on DOM2 horses (contested) and off-topic Ukrainian genomes dropped. c. 3300 – 2500 BCE, widest by 3000; dairying, wagon graves and the riding evidence (hedged) added. |
| `wh-259` Indo-European languages | 8 | 5 → 8 | **"25,731 lexemes": the paper gives 25,781**, and the card recited dataset statistics; now the family itself. The homeland a modern reconstruction, each view named: steppe, Anatolian farmers, Caucasus–Lower Volga, and a hybrid. |
| `wh-260` domestication of the horse | 8 | 5 → 8 | **Botai's horse-keeping was stated as fact**; now hedged with the Przewalski's-line finding and the wild-harvest view. The c. 2200 BCE modern line and its critics' reply both given; figures of years out of the phrasings. |

**Read by eye.** *Article:* "the Western Zhou", "the Mandate of Heaven", "the Bronze Age", "the Yamnaya culture",
"the Indo-European languages", "the domestication of the horse"; characters, silk, jade and bronze bare.
*Confusability:* `wh-253`/`wh-246` the script against its oldest form, the five stages only on `wh-253`;
`wh-256`/`wh-257` the period and the alloy, regions against recipe; `wh-258`/`wh-259`/`wh-260` the culture, the
languages and the horse, the steppe spread kept on `wh-259`, riding on `wh-258` only as one study's reading.
*Consistency:* the Zhou conquest c. 1046 BCE across `wh-245`, `wh-251` and `wh-252`; Yamnaya from c. 3300 BCE on
`wh-258` and `wh-259`. *Against the cnh- cards:* `cnh-112` agrees on 1046 – 771 and 841; `cnh-049` dates Liangzhu
3300 – 2300 BCE against Liu's 3200 – 2000 on `wh-255`.

**Glossary.** Eight terms rewritten; *Silk* and *Jade* already agreed. The *Bronze* and *Indo-European* entries'
picture fields carry licence text or an edit summary: picture pass.

### B27 — `wh-261`–`wh-270`, The Bronze Age world (2026-10-03)

Run as B26. Checks: `wh-audit.js --range=wh-261:wh-270` clean but for `W.not-why` notes on three and `wh-268`'s
`L.missing`: neither "Ugarit" nor "Ras Shamra" has a primary coordinate, so it stays without one. The rest as
B26; all 66 distinct URLs 2xx and `check-citations --card` 0 mismatched. New locators: `wh-264` (Santorini,
labelled Thera), `wh-266` and `wh-267` (both Hattusa).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-261` chariot | 9 | 5 → 9 | **The old card was about riding and the Yamnaya debate, `wh-260`'s ground.** Now the vehicle itself: Sintashta c. 2000 – 1800 BCE, the steppe-or-Near-East argument, the Kikkuli text, Mycenae's grave markers and *Iliad* 23, Shang China from c. 1200 BCE, Caesar's Britons and Rome's races. |
| `wh-262` Minoan civilisation | 8 | 5 → 9 | **A "Knossos burnt c. 1375" row had no source**, and a phrasing put the Kommos imports in the wrong period. Now the name, the palace ages, Knossos, Linear A, the sea network as trade or empire, the genomes and the palaces' fall c. 1490 – 1470 BCE. |
| `wh-263` Mycenaean Greece | 8 | 5 → 8 | The old card was trade (ingots, Gelidonya, amber), and **its era and palace rows had no source**. Now the whole culture: the shaft graves c. 1650 – 1500 BCE, rule over Crete, the ancestry, the collapse c. 1250 – 1050 BCE; Linear B one clause, for `wh-265`. |
| `wh-264` Minoan eruption | 7 | 5 → 7 | One author in three sources cut to two; **a Therasia-shrub row had no source**. The two camps given apart: radiocarbon c. 1627 – 1600 BCE, archaeology after c. 1540 and traditionally c. 1500, with the regional offset and the newer tree-ring results. |
| `wh-265` Linear B | 7 | 5 → 8 | **"Archives c. 1250 – 1200 BCE" was one scholar's view as fact; "writing returns c. 800 BCE" another event's date.** In use from c. 1450 BCE with the Knossos dispute (c. 1385 or the 13th century) in prose; deciphered 1952. The glossary misread a "more than 3,000 years" claim. |
| `wh-266` Hittites | 8 | 5 → 8 | Capital and collapse rows became the kingdom, c. 1650 – 1200 BCE, and the decipherment of 1915. Genetics that belong to `wh-258`/`wh-259` cut to one sentence; the 1730 BCE conquest and the burned-or-abandoned debate added. |
| `wh-267` Hattusa | 7 | 5 → 7 | **A drought study that never mentions Hattusa** dropped; a phrasing carried a year. Drought and Yazılıkaya rows (other events) dropped; Hattic Hattush, the 1906 tablets, the grain supply and the city emptied before it burned added. |
| `wh-268` Ugarit | 6 | 5 → 8 | **A Ramesses III row and an unsourced "zenith 1300 – 1200"** dropped. The phrasings moved off the alphabet; the four harbours, olive-oil wages, the 1928 find, the last king's letter and the eclipse-anchored end c. 1192 – 1190 BCE added. The glossary cited a CAPTCHA page and said "script" where its source says "dialect". |
| `wh-269` Proto-Sinaitic script | 6 | 5 → 6 | **Two book reviews never mention the script.** The line opened on Wadi el-Hol; now the Sinai texts c. 1900 – 1800 BCE first, Wadi el-Hol second and the late dating as a minority view. |
| `wh-270` Amarna letters | 7 | 5 → 7 | **"A woman found nearly 400" and a Mycenaean pottery claim had no source**, nor a 1352 – 1338 BCE city row. Rib-Hadda's bias is one study's sample, and **a phrasing that made Byblos dominate the whole archive was rewritten** to that study. |

**Read by eye.** *Article:* "the Minoan civilisation", "the Minoan eruption", "the Hittites", "the Proto-Sinaitic
script", "the Amarna letters"; the rest bare or "a chariot". *Confusability:* `wh-262`/`wh-263`/`wh-264`/`wh-265`
the island, the mainland, the eruption and the script, Linear A only on `wh-262`; `wh-266`/`wh-267` the people
and their capital, the archive's language on `wh-266`, the gates and the emptying on `wh-267`; `wh-268`/`wh-269`
the port and the first alphabet, the alphabetic cuneiform kept to one sentence on `wh-268`. *Consistency:* the
Hittite kingdom c. 1650 – 1200 BCE and the 1730 BCE conquest agree across `wh-266`/`wh-267`; the Amarna
letters' kings match `wh-223`. *Against the gr- cards:* `gr-043` gives the eruption one range, c. 1610 – 1540
BCE, where `wh-264` gives the two camps apart; `gr-074` starts Linear B c. 1400 BCE against c. 1450 here; `gr-056`
ends the Mycenaean world c. 1100 against c. 1050.

**Glossary.** Six terms rewritten; *Hittites*, *Hattusa*, *Proto-Sinaitic script* and *Amarna letters* already
agreed.

### B28 — `wh-271`–`wh-280`, The Bronze Age world (2026-10-03)

Run as B27. Checks: `wh-audit.js --range=wh-271:wh-280` clean but for `W.not-why` notes on three, `wh-272`'s
`I.duplicate` (the generic `1920px-thumbnail.jpg` false positive) and a `Q.sibling` on `wh-280` against `wh-281`'s old phrasings, which cleared when B29 rewrote them; the rest as B27; all 67 distinct
URLs 2xx and `check-citations --card` 0 mismatched. New locators: `wh-271` (Uluburun, near Kaş) and `wh-275`
(the Mittelberg near Nebra). **The Bronze Age world deck is now done.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-271` Uluburun shipwreck | 6 | 5 → 7 | **"360 copper and 160 tin ingots, 12 tons" was one older count the other sources contradict**; dropped with an ingot weight, a Sicily and Sardinia spread and a *mekku*-stone link. Sank c. 1320 BCE ± 15, other accounts nearer 1310 or 1300; the find, the dig and the tin-source dispute added. The glossary called a scholar "the excavator". |
| `wh-272` tin | 9 | 5 → 9 | **"Seven wars, 1895 – 1835 BCE" rested on an article whose page shows only its abstract.** `undatable` true; stream tin, the Assur caravans c. 1950 – 1750 BCE, Gudea's Meluhha and the unresolved sources added. |
| `wh-273` Bell Beaker culture | 7 | 5 → 7 | **"Little outside influence" on Iberia** is reversed by the genomes: about 40 per cent of its ancestry and nearly all its Y-chromosomes replaced by c. 2000 BCE. "Flint, barbed" arrowheads are only arrowheads in the source. Britain's turnover and the idea-or-people debate added. |
| `wh-274` Únětice culture | 6 | 5 → 6 | **Łęki Małe began c. 2150 BCE, not 2130**, and "fourteen generations" had no source. "Sons inherited the farmstead" was earlier research the paper cites, not its finding; an etymology and "first ranked society" dropped. The line is the culture's span. |
| `wh-275` Nebra sky disc | 7 | 5 → 7 | **A paper on Leubingen that never mentions Nebra** dropped. Made c. 1800 – 1700, buried c. 1600 BCE, found 1999, replacing a non-date row and an antler-pick row; the 2020 Iron Age dating and its rebuttal each named. |
| `wh-276` Nordic Bronze Age | 7 | 6 → 7 | **"The richest culture with no metal of its own" and "the Egtved grave reopened"** had no source. In use c. 1700 – 500 BCE; imported metal, rock-carved boats, oak-coffin burials and the amber-for-metal view added. |
| `wh-277` Oxus civilisation | 6 | 5 → 6 | **A main phase c. 2300 – 1950 BCE and a "mid-2nd millennium" row had no source**; **the bronze "from Mushiston" was overstated.** Gonur North c. 2200 – 1950 and the final phase c. 1800 – 1500 BCE; a phrasing that repeated `wh-254`'s Sapalli silk clue moved to grapes. |
| `wh-278` Sea Peoples | 7 | 5 → 7 | **A "14th – 11th century" span had no source**; an Ashkelon burial row and the 1192 – 1190 BCE destruction (`wh-279`'s and `wh-268`'s) dropped. The line is Merneptah's war and Ramesses III's battle; Medinet Habu's text and the Ashkelon genomes added. |
| `wh-279` Late Bronze Age collapse | 7 | 5 → 8 | The old card was a drought and one jar, **with years in a phrasing**. Now the whole collapse, c. 1250 – 1150 BCE, the survivors, and each cause as a view, with the review that found 94 of 153 claimed destructions unproven. |
| `wh-280` ironworking | 8 | 5 → 9 | **The tin-scarcity argument for iron is in no source read**, and Africa's figures came from a page that would not open. The bloomery, meteoritic iron doubted, first iron before 2100 BCE, the Levant c. 1000 – 800 BCE, Han cast iron and Africa without a Bronze Age added. |

**Read by eye.** *Article:* "the Uluburun shipwreck", "the Bell Beaker culture", "the Únětice culture", "the Nebra sky
disc", "the Nordic Bronze Age", "the Oxus civilisation", "the Sea Peoples", "the Late Bronze Age collapse"; tin and
ironworking bare. *Confusability:* `wh-271`/`wh-272`/`wh-257` the wreck, the metal and the alloy, the tin-source
dispute on the first two told apart by ingots and caravans; `wh-273`/`wh-274`/`wh-275`/`wh-276` four Europeans,
the Leubingen mound only on `wh-274`; `wh-278`/`wh-279` the raiders and the crisis, the 1192 – 1190 BCE date kept
on `wh-268`. *Consistency:* the Sapalli cocoons 1940 – 1765 BCE agree on `wh-254` and `wh-277`; Merneptah c. 1213
– 1203 BCE; Hattusa abandoned on `wh-267` and `wh-279`.

**Glossary.** Seven terms rewritten; *Uluburun shipwreck*, *Late Bronze Age collapse* and *Ironworking* already
agreed.

### B29 — `wh-281`–`wh-290`, Iron Age Near East and Persia (2026-10-03)

Run as B28, and applied with B30 in one commit. Checks: `wh-audit.js --range=wh-281:wh-290` clean but for a
`W.not-why` note on one; `check-questions`, `check-cards --prefix` per card, `check-style` (no new finding),
`check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched; all 66
distinct URLs 2xx (one KASKAL PDF reset the connection twice and answered 200 on the third try). New locators:
`wh-283` Nineveh and `wh-288` (Babylon, where the ancient writers put the gardens).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-281` Iron Age | 9 | 5 → 10 | **"c. 1200 BCE, Near East" had no source**, nor "over 3,000 years" of African iron. An Aegean steel sentence with a century-only row and a Finnish pottery sentence dropped. Now four sourced regional spans, the three-age scheme and Hesiod's age of iron. |
| `wh-282` Neo-Assyrian Empire | 8 | 5 → 8 | **All three phrasings carried a century, a year or figures.** **"Held out at Harran until 610"**: the chronicle has Harran lost in 610 and a bid to retake it in 609. Roads and irrigation had no source; the 763 BCE eclipse is now cited to the eponym list. |
| `wh-283` Nineveh | 8 | 5 → 8 | **The capital moved in 705 BCE, not 704.** Impaling over a doorway, "the largest city in two millennia" and "Mount Tas on the Urartian border" had no source; an Arabic paper whose text extracts garbled dropped. Canals per Jacobsen and Lloyd; walls, Nebi Yunus and the 2014 – 2016 destruction added. |
| `wh-284` Ashurbanipal | 7 | 5 → 7 | **"The largest empire" and "30,000 tablets" rested on sources that would not open.** Reign 668 – 631 BCE from the standard edition, the older 626 in prose; the civil war of 652 – 648 and the library's make-up added. No birth or death row: no source gives them. |
| `wh-285` mass deportation | 9 | 6 → 9 | The old card was Sennacherib's violence and relief art; **its Ekron and captive-burning claims rested on pages behind a bot wall.** Now the policy c. 850 – 612 BCE, the army that ran it, families moved together, the kings' totals with a 1916 warning that they are inflated, and the 4.4 million estimate. |
| `wh-286` Neo-Babylonian Empire | 8 | 5 → 8 | The old card dwelt on one glazed lion; now the state, 626 – 539 BCE, from the two open royal-inscription volumes: Nabopolassar, Nineveh, Nabonidus at Tema, Belshazzar, Opis and the Nippur archives. A Nebuchadnezzar row dropped. |
| `wh-287` Nebuchadnezzar II | 8 | 5 → 9 | **A phrasing carried a year and "43 years"**; **a 1923 chronicle covering 616 – 609 BCE was cited for Carchemish**, now ABC 5. Reign 605 – 562 BCE as on `wh-191`, with the 604 count in prose. Half the old card was the Ishtar Gate; now the whole reign. |
| `wh-288` Hanging Gardens of Babylon | 9 | 6 → 9 | **The line gave Nebuchadnezzar's reign**, another person's date; now empty and `undatable`. Berossus, Diodorus, Strabo and Koldewey's caveat added, and the debate named: never built, exaggerated, Dalley's Nineveh, and Stronach's objection. |
| `wh-289` Babylonian captivity | 8 | 5 → 9 | **The Bible's counts were misstated**: Kings gives 10,000 and 8,000, Jeremiah 3,023, 832 and 745. An Ishtar Gate source dropped. The chronicle's 16 March 597 BCE, Jehoiachin's ration tablets and the Al-Yahudu tablets (572 – 477 BCE) added; Jerusalem's fall 587 or 586. |
| `wh-290` Israel and Judah | 8 | 7 → 9 | **"Samaria taken in the 720s"** is 722 or 720 BCE. The United Monarchy debate added with whose view is whose; **the first outside record of the kingdom is the Kurkh Monolith of 853 BCE**, before the Mesha and Tel Dan stones, also added. |

**Read by eye.** *Article:* "the Iron Age", "the Neo-Assyrian Empire", "the Neo-Babylonian Empire", "the Hanging
Gardens of Babylon", "the Babylonian captivity"; the cities, kings and "Israel and Judah" bare. *Confusability:*
`wh-282`/`wh-283`/`wh-284`/`wh-285` the empire, its capital, its king and its practice, the eclipse only on
`wh-282`, Sennacherib's walls on `wh-283`, the library on `wh-284`; `wh-286`/`wh-287`/`wh-288` the state, the king and
the gardens, Nebuchadnezzar named on `wh-288` only as the builder Berossus gives; `wh-289`/`wh-290` the exile and the
kingdoms. *Consistency:* Nineveh 612 BCE on `wh-282`, `wh-283`, `wh-286` and `wh-299`; Jerusalem burned 586 BCE on
`wh-286`, `wh-287` and `wh-290`, with `wh-289` giving "587 or 586" from its source; the Hebrew Bible handled as a
source for its writers' beliefs.

**Glossary.** Six terms rewritten; *Mass deportation*, *Neo-Babylonian Empire*, *Babylonian captivity* and *Israel and
Judah* already agreed.

### B30 — `wh-291`–`wh-300`, Iron Age Near East and Persia (2026-10-03)

Run and checked with B29: `wh-audit.js --range=wh-291:wh-300` clean but for `W.not-why` notes on four; all 71
distinct URLs 2xx; `check-citations --card` 0 mismatched. New locators: `wh-293` (Tyre) and `wh-299` (Ecbatana).
`wh-295` asked for "Carthage", which has no primary coordinate; an event card, it is not flagged.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-291` Hebrew Bible | 8 | 5 → 8 | **A "c. 630 – 600 BCE" layers row was in no source.** Composition is now scholars' reconstructions, each named: the Jacob story c. 800 – 700 BCE, Deuteronomy's core in the late 7th century, the Priestly writings in or after the exile, Daniel's end in the 160s BCE. Ketef Hinnom and the Dead Sea Scrolls added. |
| `wh-292` Judaism | 9 | 7 → 9 | Rewritten neutrally from the living religion; **its growth from Iron Age religion is a modern reconstruction, so said**. The line held three other events and is empty (`undatable`); Elephantine re-sourced to the papyri; the glossary's third sentence had no source. |
| `wh-293` Phoenicia | 8 | 6 → 9 | **The 2025 genome study was overstated**: it covers western Punic sites of the 6th – 2nd centuries BCE and leaves the first settlers' origin open. Two single-site rows became c. 1200 – 1150 BCE to Tyre's fall in 332 BCE. |
| `wh-294` Phoenician alphabet | 8 | 6 → 8 | The lead phrasing (Herodotus and Cadmus) is `wh-315`'s. **Ahiram's epitaph was dated by its first excavator's 13th century**; now c. 1000 BCE, the old view as his. A Greek-adoption row dropped. |
| `wh-295` founding of Carthage | 8 | 5 → 9 | A century-only row and **an Utica-rent and Gadir claim** had no source. Timaeus's 814/813 BCE and the radiocarbon c. 895 – 795 BCE (with the critics' objection) on the line; Menander's king-list reckoning and Elissa as legend added. The shared *Carthage* glossary entry kept its key and gained the alias. |
| `wh-296` Urartu | 7 | 5 → 8 | **"Height c. 800 – 600 BCE" was one site's dates (Artaxata) given to the kingdom**; now c. 800 – 550 BCE. A 13th-century row dropped to the prose; Sargon's eighth campaign of 714 BCE and the disputed end added. |
| `wh-297` Lydia | 8 | 5 → 8 | Claims resting on a page with no text dropped; **a wall's 65 ft is 66**. Sardis's fall both ways: 547 BCE (Nabonidus Chronicle, if the broken name is Lydia) and 546 (Eusebius). Gyges in Assyrian records and Bin Tepe added. |
| `wh-298` coinage | 8 | 5 → 8 | **An Ashoka debasement claim and a misread Samaria hoard** dropped; "independent invention" softened, no source stating it. The Artemision deposit's date as a debate (late 7th century against before c. 640 – 620 BCE); China and India each with a sourced row. |
| `wh-299` Medes | 7 | 5 → 8 | **"28 city lords" and "65,000" had no modern source.** The Median-empire debate from 1988 named; Assyrian records c. 858 – 656 BCE, Nineveh 612 and Astyages' fall 550 BCE on the line. |
| `wh-300` Cyrus the Great | 8 | 5 → 8 | **The "first charter of human rights" label is now a modern claim an Assyriologist rejects**; the cylinder's silence on Judah and Jerusalem and the doubt over Lydia's date added. No birth row: no source gives one. |

**Read by eye.** *Article:* "the Hebrew Bible", "the Phoenician alphabet", "the founding of Carthage", "the Medes";
the rest bare. *Confusability:* `wh-291`/`wh-292` the book and the religion, the Dead Sea Scrolls on both but as
manuscripts on one and a library on the other; `wh-293`/`wh-294`/`wh-295` the land, its script and its colony;
`wh-297`/`wh-298` the kingdom and the invention, the Artemision only on `wh-298`; `wh-299`/`wh-300` the Medes and
their conqueror, the chronicle's handover on both, each naming the other. *Consistency:* Astyages' fall 550 BCE on
`wh-299` and `wh-300`; Sardis 547 or 546 on `wh-297` and `wh-300`.

**Glossary.** Six terms rewritten (*Judaism*, *Phoenicia*, *Carthage*, *Urartu*, *Lydia*, *Medes*); the rest already
agreed. **The Iron Age Near East and Persia deck is two-thirds done; B31 (`wh-301`–`wh-310`) finishes it.**

### Pictures to redo

Kept as they stand while Wikimedia refuses this sandbox; each to be replaced or confirmed in a picture
pass once it answers. Filled batch by batch.

| card | why |
|---|---|
| `wh-005` | display with two non-hominin skulls and small exhibit labels |
| `wh-014` | not re-viewed |
| `wh-016` | one chopper stands for the whole kit |
| `wh-029`, `wh-030` | no picture |
| `wh-038` | a chart, not a photograph |
| `wh-045` | a labelled tree diagram |
| `wh-050` | a 1921 drawing |
| `wh-041` | **locator** not written (Wikipedia refused) |
| `wh-051` | White Sands footprints, not an ice age |
| `wh-052`, `wh-053` | regional or labelled maps |
| `wh-054` | an 18th-century engraving; alt is the file name |
| `wh-055` | one Blombos point (a sibling's site); caption gives "71,000 BCE" |
| `wh-056` | a leaf point that looks Middle Stone Age |
| `wh-057` | fine, but description and alt need writing in English |
| `wh-058` | a stratigraphy diagram with printed, outdated ages |
| `wh-059` | a 1929 plate of line drawings |
| `wh-061`, `wh-062` | weak fits |
| `wh-064`, `wh-065` | maps |
| `wh-066` | description and alt are the file name |
| `wh-067` | to replace |
| `wh-075` | credit and licence look doubtful |
| `wh-076`, `wh-077` | replicas, not the caves |
| `wh-078` | a modern drawing |
| `wh-080` | the disputed Divje Babe bone, not a secure flute |
| `wh-081`, `wh-083` | fine, but description and alt need writing |
| `wh-082` | a postcard captioned "Indian with bow & arrow" |
| `wh-084` | an old drawing |
| `wh-086` | a labelled map |
| `wh-088` | no picture |
| `wh-089` | a Neanderthal skull, not admixture |
| `wh-091` | a crowded labelled map |
| `wh-092` | a labelled map; description written from its title, unseen |
| `wh-093` | no picture |
| `wh-094` | **first**: may show human remains; replace with the lunette |
| `wh-097` | a map with burned-in labels |
| `wh-099`, `wh-100` | description and alt are raw captions |
| `wh-101` | fine subject, but description and alt are copied captions naming a museum and giving dates the cards no longer carry |
| `wh-103` | a landscape of another Folsom site, no artefacts |
| `wh-104`, `wh-105`, `wh-113`, `wh-114` | labelled charts (`wh-114`'s title gives a BC date) |
| `wh-106` | a Kebaran mortar from Israel: Epipalaeolithic, not Mesolithic |
| `wh-107` | one Natufian figurine; weak description and alt |
| `wh-108` | probably a map of the Dogger Bank; description "Doggerbank" only |
| `wh-109`, `wh-116` | fine, but description and alt carry museum or promotional text or a file name |
| `wh-112` | an Egyptian dynastic milking scene, not the Neolithic |
| `wh-115` | a 1486 Ptolemy map of part of the region |
| `wh-117` | a labelled wheat display; plants only |
| `wh-118` | a 19th-century plate of einkorn, one of the eight |
| `wh-120` | a 1937 encyclopedia plate, probably captioned |
| `wh-132` | a world map with burned-in labels |
| `wh-134` | a flea, plague's vector only |
| `wh-136` | the Bronocice pot: one strand of the model |
| `wh-138`, `wh-139` | fine, but description (and `wh-139`'s glossary credit) need rewriting |
| `wh-140` | an Ötztal landscape, not the man, his kit or the findspot |
| `wh-122` | fine subject, but its URL ends in a generic `1920px-thumbnail.jpg` (audit `I.duplicate`) and its description is a museum caption |
| `wh-128` | a late wheel-made Liangzhu pot, not early pottery |
| `wh-141` | a labelled map |
| `wh-145` | description shows mortars, not the copper hoard |
| `wh-149` | description and alt describe different pots |
| `wh-154` | a museum reconstruction titled "calendar" |
| `wh-156` | a map with burned-in labels and dates |
| `wh-157` | description is a caption |
| `wh-163` | Varna grave 43, which is `wh-144`'s |
| `wh-170` | one Trypillia site only |
| `wh-175` | a Rongorongo tablet, one undeciphered script |
| `wh-171` | NASA view of the two rivers: fine, but description is a file caption |
| `wh-172` | Standard of Ur: credit names no author, description carries licence text |
| `wh-173` | a cone-mosaic detail; a view of the site would show the city |
| `wh-178` | description names the photographer and an unverified brick stamp |
| `wh-180` | the Ram in a Thicket, a Royal Cemetery object (`wh-181`'s), not the city |
| `wh-182` | the king-list prism, not Gilgamesh |
| `wh-183`, `wh-185`, `wh-186` | fine, but description names the photographer |
| `wh-189`, `wh-190` | glossary picture fields malformed; `wh-190` shows a museum panel at one edge |
| `wh-194` | a labelled derivative of YBC 7289; prefer the unlabelled photograph |
| `wh-197`, `wh-198` | fine, but description names a museum number or excavator |
| `wh-201` | a labelled map of the Nile valley; a photograph may serve better |
| `wh-202` | fits (Nakht's tomb scenes), but its title still names emmer |
| `wh-203` | fine, but description names a museum and a museum number |
| `wh-205` | the Palermo Stone (the annals, not the union), and the same file as `eg-077`; the glossary's *sema-tawy* relief fits better |
| `wh-212` | shows one corner only; description names the photographer; glossary picture fields malformed |
| `wh-213` | a 19th-century half-buried view, not re-checked (title and description rewritten from the old fields) |
| `wh-214` | fine, but description names a museum |
| `wh-215` | apt, but a Met-hosted file, not Commons; description carries an accession number |
| `wh-216` | an ear stela, one practice only; description carries an accession number |
| `wh-217` | one provincial stela; generic `1920px-thumbnail.jpg` URL (audit `I.duplicate`) |
| `wh-226` | a 1927 line drawing of the Ramesseum reliefs; description names the publication |
| `wh-227` | yellow arrows and tomb numbers drawn onto the photograph |
| `wh-229` | the Western Deffufa, Kerma only; a cataract landscape would show the region (and **locator**: "Nubia" has no coordinate) |
| `wh-238` | a labelled plate of finds from Khirsara |
| `wh-239` | a drawn map with burned-in dates and arrows |
| `wh-241`, `wh-242` | fit, but credits lack the author, licence and Commons URL form |
| `wh-244` | a 1903 map sheet with pencilled notes and a library stamp |
| `wh-247` | one chariot pit; a wider view of the site would serve better |
| `wh-252` | the Da Yu ding rubbing, also `cnh-105`'s |
| `wh-253` | a labelled chart of one character through the scripts |
| `wh-257` | a hoard photographed against a ruler with handwritten labels |
| `wh-260` | a multi-panel research figure |
| `wh-261` | a distribution map with numbered symbols |
| `wh-262` | the Akrotiri ship fresco, from Thera not Crete |
| `wh-263` | one stirrup jar; description refers to the old card's trade |
| `wh-268` | **locator**: neither "Ugarit" nor "Ras Shamra" has a coordinate |
| `wh-269` | a 1916 line drawing where photographs exist |
| `wh-270` | a 1915 printed hand copy with line numbers |
| `wh-272` | fits, but description names a museum; generic `1920px-thumbnail.jpg` URL (audit `I.duplicate`) |
| `wh-276` | the Egtved clothing, one grave; description names a museum |
| `wh-281` | a lump of casting waste of uncertain age |
| `wh-288` | a 1679 Kircher engraving |
| `wh-295` | the Byrsa panorama, also used by the glossary's *Peace of 201 BCE*; **locator**: "Carthage" has no coordinate |
| `wh-298` | Chinese spade coins only; an early electrum coin would show the western strand |
