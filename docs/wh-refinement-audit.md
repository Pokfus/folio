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
| B11 | Peopling the planet (`wh-peopling`) | `wh-101`–`wh-110` | 10 | 96 | open |
| B12 | The Neolithic transition (`wh-neolithic`) | `wh-111`–`wh-120` | 10 | 95 | open |
| B13 | The Neolithic transition (`wh-neolithic`) | `wh-121`–`wh-130` | 10 | 93 | open |
| B14 | The Neolithic transition (`wh-neolithic`) | `wh-131`–`wh-140` | 10 | 101 | open |
| B15 | Neolithic worlds (`wh-early-villages`) | `wh-141`–`wh-150` | 10 | 94 | open |
| B16 | Neolithic worlds (`wh-early-villages`) | `wh-151`–`wh-160` | 10 | 99 | open |
| B17 | Neolithic worlds (`wh-early-villages`) | `wh-161`–`wh-170` | 10 | 95 | open |
| B18 | Mesopotamia (`wh-mesopotamia`) | `wh-171`–`wh-180` | 10 | 104 | open |
| B19 | Mesopotamia (`wh-mesopotamia`) | `wh-181`–`wh-190` | 10 | 117 | open |
| B20 | Mesopotamia (`wh-mesopotamia`) | `wh-191`–`wh-200` | 10 | 105 | open |
| B21 | Ancient Egypt (`wh-egypt`) | `wh-201`–`wh-210` | 10 | 105 | open |
| B22 | Ancient Egypt (`wh-egypt`) | `wh-211`–`wh-220` | 10 | 125 | open |
| B23 | Ancient Egypt (`wh-egypt`) | `wh-221`–`wh-230` | 10 | 125 | open |
| B24 | The Indus and early China (`wh-indus-china`) | `wh-231`–`wh-240` | 10 | 93 | open |
| B25 | The Indus and early China (`wh-indus-china`) | `wh-241`–`wh-250` | 10 | 101 | open |
| B26 | The Indus and early China (`wh-indus-china`) / The Bronze Age world (`wh-bronze-age`) | `wh-251`–`wh-260` | 10 | 99 | open |
| B27 | The Bronze Age world (`wh-bronze-age`) | `wh-261`–`wh-270` | 10 | 117 | open |
| B28 | The Bronze Age world (`wh-bronze-age`) | `wh-271`–`wh-280` | 10 | 98 | open |
| B29 | Iron Age Near East and Persia (`wh-near-east`) | `wh-281`–`wh-290` | 10 | 108 | open |
| B30 | Iron Age Near East and Persia (`wh-near-east`) | `wh-291`–`wh-300` | 10 | 97 | open |
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
| `wh-057`, `wh-060` | fine, but description and alt need writing in English |
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
| `wh-081`, `wh-083`, `wh-085` | fine, but description and alt need writing |
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
| `wh-098`, `wh-099`, `wh-100` | description and alt are raw captions |
