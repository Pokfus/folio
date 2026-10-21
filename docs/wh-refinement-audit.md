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
| B31 | Iron Age Near East and Persia (`wh-near-east`) | `wh-301`–`wh-310` | 10 | 100 | **done 2026-10-04** |
| B32 | Greece and the Hellenistic world (`wh-greece`) | `wh-311`–`wh-320` | 10 | 121 | **done 2026-10-04** |
| B33 | Greece and the Hellenistic world (`wh-greece`) | `wh-321`–`wh-330` | 10 | 123 | **done 2026-10-04** |
| B34 | Greece and the Hellenistic world (`wh-greece`) / Rome (`wh-rome`) | `wh-331`–`wh-340` | 10 | 126 | **done 2026-10-04** |
| B35 | Rome (`wh-rome`) | `wh-341`–`wh-350` | 10 | 126 | **done 2026-10-04** |
| B36 | Rome (`wh-rome`) | `wh-351`–`wh-360` | 10 | 104 | **done 2026-10-04** |
| B37 | Rome (`wh-rome`) | `wh-361`–`wh-370` | 10 | 106 | **done 2026-10-04** |
| B38 | Rome (`wh-rome`) / Ancient India (`wh-ancient-india`) | `wh-371`–`wh-380` | 10 | 97 | **done 2026-10-04** |
| B39 | Ancient India (`wh-ancient-india`) | `wh-381`–`wh-390` | 10 | 91 | **done 2026-10-04** |
| B40 | Ancient India (`wh-ancient-india`) / Ancient China (`wh-ancient-china`) | `wh-391`–`wh-400` | 10 | 88 | **done 2026-10-04** |
| B41 | Ancient China (`wh-ancient-china`) | `wh-401`–`wh-410` | 10 | 98 | **done 2026-10-15** |
| B42 | Ancient China (`wh-ancient-china`) / Africa and the Americas in antiquity (`wh-antiquity-beyond`) | `wh-411`–`wh-420` | 10 | 114 | **done 2026-10-15** |
| B43 | Africa and the Americas in antiquity (`wh-antiquity-beyond`) | `wh-421`–`wh-430` | 10 | 112 | **done 2026-10-15** |
| B44 | Africa and the Americas in antiquity (`wh-antiquity-beyond`) / Byzantium and the Christian East (`wh-byzantium`) | `wh-431`–`wh-440` | 10 | 101 | **done 2026-10-15** |
| B45 | Byzantium and the Christian East (`wh-byzantium`) | `wh-441`–`wh-450` | 10 | 99 | **done 2026-10-15** |
| B46 | Byzantium and the Christian East (`wh-byzantium`) / The Islamic world (`wh-islam`) | `wh-451`–`wh-460` | 10 | 108 | **done 2026-10-15** |
| B47 | The Islamic world (`wh-islam`) | `wh-461`–`wh-470` | 10 | 97 | **done 2026-10-15** |
| B48 | The Islamic world (`wh-islam`) | `wh-471`–`wh-480` | 10 | 98 | **done 2026-10-15** |
| B49 | The Islamic world (`wh-islam`) / Medieval Europe (`wh-medieval-europe`) | `wh-481`–`wh-490` | 10 | 99 | **done 2026-10-15** |
| B50 | Medieval Europe (`wh-medieval-europe`) | `wh-491`–`wh-500` | 10 | 99 | **done 2026-10-15** |
| B51 | Medieval Europe (`wh-medieval-europe`) | `wh-501`–`wh-510` | 10 | 65 | **done 2026-10-21** |
| B52 | Medieval Europe (`wh-medieval-europe`) | `wh-511`–`wh-520` | 10 | 89 | **done 2026-10-21** |
| B53 | East Asia (`wh-east-asia`) | `wh-521`–`wh-530` | 10 | 106 | **done 2026-10-21** |
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

**The agent files are in the repo too** (added with B40): `.claude/wh-refine/ADDENDUM.md` (the rules every agent
reads after `BRIEF.md`; where they differ it wins), `STEPS.md` (the per-agent steps, for a pair of cards),
`related.js` (the gr-/rm-/cnh-/in- cards beside a subject: `node .claude/wh-refine/related.js "<regex>"` or
`--card <id>`), and `commons.py` / `commons-write.py` (a rate-limit-aware Commons helper for the picture pass).

**Lessons from `wh-301`–`wh-400`.**
- **Commit and push after every batch.** A usage limit killed nine agents mid-batch once; the relaunch told each to reuse
  a saved page only after re-checking it, and nothing but the unfinished drafts was lost.
- **Commons throttles by call count, downloads included.** One card was done before it refused three times, even at 45 s
  gaps; Wikipedia answered in bursts, so a locator run is worth repeating later in the day.
- **`check-citations` quirks:** it wants an author's initials as Crossref prints them ("AG", not "A. G."), and a journal
  issue labelled one year but dated another by Crossref wants "(2025, published 2026)".
- **A glossary draft may not alias another entry's own key** (*Pharsalus*, *Rubicon*, *Vercingetorix*), and a draft that
  rewrites a general term around one collection (*Christianity* around Rome) is dropped: keep the old entry.
- **Two cards of one deck can trip the audit's sibling check** on their lead phrasings (`wh-396` and `wh-397`); reword the
  later one.
- **Merging main:** glossary files conflict on end-of-object appends (keep both sides; give the last line of ours a
  comma); take main's `changelog.js` day and re-add this branch's line; take main's `wiki-links.json`,
  `wiki-title-cache.json` and `wikipedia-links-audit.md` and re-resolve any card of ours with `find-wiki-links.js`.

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

### B31 — `wh-301`–`wh-310`, Iron Age Near East and Persia (2026-10-04)

Run as B30, five agents of two cards each, with the agent addendum of `docs/wh-refinement-audit.md` B21–B30 written
out as a file (no Wikimedia calls, precheck the only repo tool, Europe PMC for PMC). Commons answered one test call
and then refused the picture agent on its second (429 twice), so no picture changed; Wikipedia refused at first, and
the locators of `wh-302` (Persepolis) and `wh-307` (Behistun) were written later in the run, when it answered. Checks:
`wh-audit.js --range=wh-301:wh-310` clean; `check-questions`, `check-cards --prefix`
per card, `check-style` (no new finding), `check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations
--card` 0 mismatched; all 65 distinct URLs 2xx. New locator: `wh-304` (Sardis, where the road began). **Tooling:**
`wh-audit.js` and `prep.js` let a qualified glossary key shadow its bare namesake (`Battle_of_Thermopylae_(191_BCE)`
over `Battle_of_Thermopylae`), so a card could be checked against the wrong entry; a bare key now wins.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-301` Achaemenid Empire | 7 | 5 → 7 | "Took over conquered places rather than remaking them" was a modern reading stated as fact. A Babylon row (Cyrus's, `wh-300`) and a second Darius III row dropped; now c. 550 – 330 BCE. **"29 lands" was the drafting agent's own count of the Naqsh-i Rustam list**, softened to "the many lands". |
| `wh-302` Persepolis | 8 | 5 → 8 | **"Founded before c. 513 BCE" had no source**; now c. 520 – 515 BCE, as `gr-386`. The fortification (509 – 493) and treasury (492 – 457) archives told apart; the burning as Diodorus's story, the fire possibly planned. |
| `wh-303` Darius the Great | 8 | 5 → 8 | **Herodotus has Necho begin the Red Sea canal and Darius finish it**, not Necho instead of Darius. A "36 years" row dropped. The accession, Gaumata or Bardiya as the winner's account, the nine rebel kings (Gaumata among them) and Marathon added. |
| `wh-304` Royal Road | 7 | 5 → 8 | **The card had Herodotus measure the road himself; he reports its stages.** "About three hundred tablets" had no source; Strabo's 4,200 stadia and an unsourced c. 500 BCE row dropped. The line is now the Persepolis travel texts, 509 – 493 BCE. |
| `wh-305` satrap | 7 | 6 → 8 | **The Satraps' Revolt of 362 BCE was Diodorus's account stated as fact**; now his, with the modern doubt that it was one rising. "In use c. 550 – 330 BCE" ended the office with the dynasty though Alexander and the Seleucids kept it: `""`, `undatable`. |
| `wh-306` Zoroastrianism | 8 | 5 → 9 | **The line held three other events** (royal inscriptions, Greek accounts, the Parsi landing) and is empty, `undatable`. Zoroaster's date is a range of views, each whose; the 716 CE landing became 785 – 936 CE, estimates from a legendary account. |
| `wh-307` Behistun Inscription | 7 | 5 → 7 | **The lead phrasing's "tenth figure" was wrong**: Skunkha is the ninth captive, added later. **The 150 m height was a 1907 estimate from the plain**; now 66 m above the springs. Carved c. 520 – 518 BCE (Schmitt); Herodotus's horseman story, about another monument, dropped. |
| `wh-308` Xerxes I | 8 | 5 → 9 | **Diodorus's Artabanus murder was stated as fact**; now beside the Babylonian report that his son killed him. Herodotus's 1.7 million is his, beside a modern c. 100,000. Babylon's temples "wrecked" is now an older view the cuneiform evidence does not bear out. |
| `wh-309` Aramaic | 7 | 5 → 7 | **"Before 727 BCE, at Zenjirli" came from a 1903 book**; first inscribed c. 900 – 800 BCE, Egyptian papyri c. 500 – 400 BCE, Neo-Aramaic from c. 1200 CE. A guess that the Persepolis orders were drafted in Aramaic dropped; the Elephantine phrasing (`wh-292`'s) replaced. |
| `wh-310` fall of the Achaemenid Empire | 7 | 5 → 8 | **Arrian has Nabarzanes and Barsaentes wound Darius, not Bessus.** Curtius's 40,000 dead had no source. The line starts with the invasion, 334 BCE; the Babylonian diary's account of Gaugamela set against Arrian's. New glossary term. |

**Read by eye.** *Article:* "the Achaemenid Empire", "the Royal Road", "the Behistun Inscription", "the fall of the
Achaemenid Empire", "a satrap"; the rest bare. *Confusability:* `wh-301`/`wh-302`/`wh-303` the empire, its palace
and its king, Naqsh-i Rustam only on `wh-301`, the canal only on `wh-303`; `wh-303`/`wh-307` the king and his
inscription, the horse story on one and the captives on the other; `wh-305`'s "shopkeeper" FAQ repeats `wh-303`'s third
phrasing in a Think-it-through answer only; `wh-309`/`wh-310` both mention the end of cuneiform in Iran, as a phrasing
on one and an FAQ on the other. *Consistency:* the empire c. 550 – 330 BCE, Darius I 522 – 486, Persepolis begun
520 – 515 and burned 330 across `wh-301`–`wh-304`, `wh-310`. *Against the gr- cards:* `gr-386` dates the Behistun carving
521 – 519 BCE, `wh-307` c. 520 – 518 (Schmitt); `gr-716` has Bessus kill Darius III, where Arrian names two others;
`gr-725` dates treasury staff to 467 BCE from tablets that end in 493, and gives the Apadana's columns 25 m where
Matthews and Fazeli Nashli give 19 m. None edited.

**Glossary.** Eight terms rewritten and *Fall of the Achaemenid Empire* added; *Satrapy* and *Xerxes I* already
agreed. **The Iron Age Near East and Persia deck is done.**

### B32 — `wh-311`–`wh-320`, Greece and the Hellenistic world (2026-10-04)

Run with B31. Wikipedia answered from the middle of this batch, so its locators were written, and the run also
settled three old items: `wh-202`'s "Learn more" link now points at *Ancient Egyptian agriculture* rather than
*Emmer*, and `wh-229` (at Kerma) and `wh-295` (at Byrsa) have locators; `wh-041` and `wh-268` still have none (no
article tried has a primary coordinate). Checks: `wh-audit.js --range=wh-311:wh-320` clean; the rest as B31; all
82 distinct URLs 2xx; `check-citations --card` 0 mismatched. New locators: `wh-316` Sparta, `wh-317` Athens and
`wh-320` Marathon (battle). The Greece collection's own settled rules and chronology were read for each card.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-311` Ancient Greece | 9 | 5 → 11 | **"c. 800 – 146 BCE" had a source for neither end**, and the Chaeronea and Corinth rows were other events' dates; now the three periods, Archaic c. 800 – 479, Classical 479 – 323, Hellenistic 323 – 30 BCE. The 1,035 poleis are the Copenhagen inventory's and the 7.5 – 10 million one estimate's. |
| `wh-312` polis | 7 | 5 → 9 | "Flourished c. 800 – 300 BCE" had no source and ended the polis centuries early; a Pausanias row was another event. Now "Rise, one view c. 800 – 700 BCE", with the slow-growth view beside it; the city-ethnic as the test; dependent poleis and the ethne. |
| `wh-313` Greek colonisation | 7 | 5 → 8 | **"Naxos, about 734 BCE" is a modern year Thucydides never gives**, and "Naucratis granted by Amasis" dated a grant, not the port. Main phase c. 800 – 500 BCE and Syracuse c. 733 BCE, both said to rest on Thucydides' count; the word "colonisation" as debated. |
| `wh-314` Homer | 9 | 5 → 9 | **A 481 BCE row dated an embassy that quoted Homer.** Composition c. 700 BCE as scholars' estimate, West's c. 680 – 640 as one view, pre-eminence by c. 500 BCE; oral composition, the Ionic dialect, the Lives as non-history. The glossary cited a review of a book that is not about Homer. |
| `wh-315` Greek alphabet | 9 | 5 → 9 | The card was ancient tales of who brought the letters; **a Claudius row (41 – 54 CE) was Latin's history**. Now the vowels, c. 800 BCE against the case for the 11th century, Euboea or Cyprus, the oldest finds c. 750 – 700 BCE, the Ionic takeover and Athens in 403/2 BCE. |
| `wh-316` Sparta | 9 | 8 → 9 | **No word of the Spartan mirage**, and Lycurgus as a lawgiver of fact; a Leuctra death toll as a row. Lycurgus semi-legendary, Plutarch writing of a largely Roman-era agoge; state formed c. 800 – 700 BCE, dominant 404 – 371 BCE. |
| `wh-317` Classical Athens | 9 | 7 → 9 | **"Thucydides counted" the fleet and tribute: they are Pericles' reckoning as he reports it**; two non-date rows (fleet and money, plague dead) dropped for 480, 404 and 323 BCE. Laurion silver and Akrigg's population estimate added, each as his. |
| `wh-318` Athenian democracy | 9 | 6 → 9 | Pay and "20,000 fed" rows were not dates; now 508/507, 462/461, 403 and 322 BCE. When "democracy" first fits is a debate; Hansen's attendance and citizen estimates as his; Antipater's ending with Diodorus's "more than 12,000" excluded. |
| `wh-319` Greco-Persian Wars | 8 | 7 → 8 | **Herodotus's 1,700,000-man army was a date-line row**, and two phrasings carried numerals. Now 499 – 479 BCE with the invasions of 490 and 480 – 479; the Peace of Callias "probably" 449 BCE in prose; Cawkwell's Persian-failure view as a view. |
| `wh-320` Battle of Marathon | 9 | 8 → 9 | Eight Herodotus chapters became six modern sources and three ancient. **6,400 and 192 are Herodotus's**, with the 33⅓ ratio doubt in an FAQ; the day is a modern moon reckoning (mid-August or mid-September); the run to Athens as later legend. |

**Read by eye.** *Article:* "Ancient Greece", "Sparta", "Homer", "Classical Athens", "Athenian democracy" bare; "a
polis", "Greek colonisation", "the Greek alphabet", "the Greco-Persian Wars", "the Battle of Marathon". *Confusability:*
`wh-311`/`wh-312` both cite the 1,035 inventory in the background, neither in a phrasing; `wh-313`/`wh-315` share
Pithekoussai, a FAQ on one and a phrasing on the other; `wh-315`'s phrasings keep off `wh-294`'s Cadmus; `wh-317`/`wh-318`
the city and its constitution, the funeral speech only on `wh-317`; `wh-319`/`wh-320` the war and its first battle,
Marathon named in `wh-319`'s background only. *Consistency:* the Classical period 479 – 323 BCE (`wh-311`, Hornblower)
where `docs/greece-chronology.md` and `wh-317` start it at the sack of 480; the Hellenistic end 30 BCE (Shipley) where
the Greece chronology gives 31 (Actium); both pairs stated with their sources. *Against the gr- cards:* `gr-203` gives
Corcyra 733 BCE where `wh-313` uses Syracuse c. 733; `gr-403` gives up to 25,000 Persians at Marathon where `wh-320`
follows Rhodes's c. 20,000. None edited.

**Glossary.** Six terms rewritten (*Ancient Greece*, *Greek colonisation*, *Homer*, *Classical Athens*,
*Greco-Persian Wars*, *Battle of Marathon*); *Polis* kept its text and gained correct picture fields; *Greek
alphabet*, *Sparta* and *Athenian democracy* already agreed.

### B33 — `wh-321`–`wh-330`, Greece and the Hellenistic world (2026-10-04)

Run as B32. Checks: `wh-audit.js --range=wh-321:wh-330` clean but for `W.not-why` notes on four (an FAQ opening "Do",
"Was" or "Were"); the rest as B31; all 87 distinct URLs 2xx; `check-citations --card` 0 mismatched. New locators:
`wh-321` (the pass), `wh-322` (the strait) and `wh-325` (labelled for the Acropolis, the card's own term being the
building). **Nine of the ten old cards cited no modern work at all**: their source lists were chapters of Herodotus,
Thucydides, Plutarch and Aristotle, and each now meets its bar with at least half modern scholarship.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-321` Battle of Thermopylae | 9 | 10 → 9 | **"300 Spartans" and "2 days of assaults" were Herodotus's figures set as date-line rows.** His 1.7 million beside a reviewer's at most 75,000; the days as two modern reckonings (12 – 14 August, mid-September); the oracle as possibly invented afterwards. |
| `wh-322` Battle of Salamis | 9 | 9 → 9 | **"Greek fleet 378 triremes" was Herodotus's count stated as fact and as a row**; now beside Aeschylus's 310 against a thousand and a modern c. 150 a side. "Aeschylus fought there" had no source on the card and dropped. Late September as a modern reckoning. |
| `wh-323` Delian League | 8 | 6 → 9 | A "460 talents" row was not a date. **The treasury's move in 454 BCE is not in Thucydides**: it is inferred from the tribute lists, so said. Founding 478/477, the Eurymedon c. 466 (possibly inflated) and the break-up in 404 BCE. |
| `wh-324` Pericles | 9 | 5 → 9 | No birth row; now c. 495 BCE as one estimate, 494 another. **The Funeral Oration is Thucydides' composition**, how much Pericles said disputed; reforms perhaps Ephialtes'. The glossary called Agariste Cleisthenes' granddaughter: she was his niece. |
| `wh-325` Parthenon | 9 | 5 → 10 | **"Paid for by tribute": the money came mostly from Athena's treasury, which a share of the tribute filled.** A "40 talents" row dropped; the line is the building, 447 – 432 BCE and 1687 CE. The glossary's "stood whole until 1687" ignored a late-Roman fire. |
| `wh-326` Greek theatre | 9 | 5 → 9 | "Flourished c. 500 – 400 BCE" and "Actors 1, 2, 3" had no source. **534 BCE is the Parian Marble's**, perhaps marking only Thespis at work, and the Suda's "first tragedian" is its report. Stone theatres c. 350 – 300 BCE across the Greek world. |
| `wh-327` Socrates | 9 | 7 → 10 | **Plato's and Aristophanes' portraits were stated as fact**; now the Socratic problem, with the three witnesses who differ, and the Delphic oracle as a story biographers split over. Born c. 469 BCE, tried and executed 399 BCE. |
| `wh-328` Plato | 9 | 5 → 9 | **"Burned 1 tragedy" was a row with no source and no date**; it is now Diogenes Laertius's story in an FAQ. Born c. 428 (424/423 on one biography), Academy after 387, died 348/347 BCE; the Forms as Aristotle reports them. |
| `wh-329` Aristotle | 9 | 6 → 9 | **Diogenes Laertius was taken as fact**: twenty years with Plato, Stagira restored at his request, the "pacing" origin of Peripatetic. Now he stayed until Plato died in 347; the covered walk as the likelier origin; the tutoring of Alexander hedged. |
| `wh-330` Peloponnesian War | 8 | 8 → 8 | **Thucydides' "truest cause" was stated as fact**; now his judgement, with the modern debate. The plague's 25 – 30 per cent as one historian's estimate; the war-count row dropped for Sicily 415 – 413 and Aegospotami 405 BCE. |

**Read by eye.** *Article:* "the Battle of Thermopylae", "the Battle of Salamis", "the Delian League", "the
Parthenon", "the Peloponnesian War"; "Greek theatre" and the four persons bare. *Confusability:* `wh-319`–`wh-322`
the war and its three battles, Thermopylae and Salamis named in each other's backgrounds only; `wh-323`/`wh-324`/`wh-325`
the league, the statesman and the temple, the tribute appearing on all three but as a phrasing only on `wh-323`;
`wh-327`/`wh-328`/`wh-329` teacher, pupil and pupil's pupil, the Forms only on `wh-328` (and in `wh-327`'s FAQ as the
reason they are not his), the Clouds only on `wh-327`. *Consistency:* the Classical dates agree with
`docs/greece-chronology.md` throughout. *Against the gr- cards:* `gr-590` puts Thespis c. 560 BCE in Solon's old age
(Plutarch), `wh-326` c. 534 (Parian Marble); `gr-467` calls Agariste a "close relative" where `wh-324` says niece;
`gr-695` credits Philip with the phalanx outright (for `wh-332`, B34). None edited.

**Glossary.** Eight terms rewritten (*Battle of Thermopylae*, *Delian League*, *Pericles*, *Parthenon*, *Greek
theatre*, *Socrates*, *Plato*, *Peloponnesian War*); *Battle of Salamis* and *Aristotle* already agreed.

### B34 — `wh-331`–`wh-340`, Greece and the Hellenistic world and Rome (2026-10-04)

Run as B33, the Rome cards read against the `rm-` collection. Checks: `wh-audit.js --range=wh-331:wh-340` clean but
for `I.duplicate` on `wh-339` and `wh-340`, whose pictures are also `rm-045`'s and `rm-133`'s (picture pass); the rest
as B31; all 86 distinct URLs 2xx; `check-citations --card` 0 mismatched. New locators: `wh-335` Alexandria, `wh-336`
Rome and `wh-338` the Palatine; `wh-337` asked for "Etruria", which has no primary coordinate. Again **almost every
old card cited ancient writers only** (Herodotus, Diodorus, Plutarch, Florus, Polybius, Gellius), retelling them as
fact.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-331` Herodotus | 9 | 7 → 9 | **"Died c. 425 BCE" was in no source**; now born c. 484 (Gellius's figure), still writing in 429, dead before 413 BCE. "Father of history" is Cicero's; the nine books are a Hellenistic division; how far he travelled is debated. |
| `wh-332` Philip II of Macedon | 8 | 7 → 8 | **That he invented the phalanx is Diodorus's claim**, with the modern case for Alexander II beside it; the Vergina Tomb II attribution as disputed, whose each side is. Born c. 382, reigned 359 – 336 BCE, Chaeronea 338. |
| `wh-333` Alexander the Great | 9 | 9 → 9 | **Plutarch's Ganges refusal and army figures were stated as fact**; Arrian has the army stop at the Hyphasis, both now given. The cause of death unknown, poison, typhoid and West Nile as views; born 356, king 336, died at Babylon in June 323 BCE. |
| `wh-334` Hellenistic period | 7 | 6 → 8 | **The lead phrasing hung the period on Polybius's "organic whole", which he dates to 220 – 216 BCE**; the 306 and 168 BCE rows were other events. "Hellenistic" is Droysen's term; 323 – 30 BCE with Green's 334 – 31 also dated. |
| `wh-335` Library of Alexandria | 9 | 5 → 9 | **The card ended the library in Caesar's fire of 48 BCE**, with a dynasty row and a "700,000 books" row. The counts are the ancient writers' and inconsistent; the end is rival stories (48 BCE, 273, 391 CE) and the Arab burning a legend first told c. 1200. |
| `wh-336` Ancient Rome | 9 | 5 → 10 | 753 BCE is Varro's reckoning, 509 BCE perhaps a few years early, 476 CE a convention fixed later; the eastern half to 1453. **A phrasing carried a figure of years** and another a numeral. |
| `wh-337` Etruscan civilisation | 8 | 5 → 9 | **"Flourished c. 800 – 300 BCE" had no source**; now emerged c. 900, Veii's fall 396 (the ancient date; the site lived on), Roman conquest c. 300 – 100 BCE. The Lydian origin is Herodotus's, the native one Dionysius's, and the DNA studies are named both ways. |
| `wh-338` founding of Rome | 9 | 5 → 11 | 753 BCE is labelled traditional and Varro's, beside Timaeus's 813, Fabius's 747, Cato's 751 and Cincius's 728. **A "15 generations" row and a vultures row were not dates.** The Palatine wall of c. 730 – 720 BCE is evidence, not proof of the legend. |
| `wh-339` Roman Kingdom | 8 | 6 → 8 | **The card was Florus's moral history retold as fact.** 753 – 509 BCE is traditional; the 244 years and seven kings are Livy's and Dionysius's; Lucretia and Brutus are Livy's story; the Forum's drainage and two modern views added. Dionysius's own count gives 751 – 507. |
| `wh-340` Roman Republic | 9 | 6 → 10 | **The card was Polybius alone**, with "3 parts" and "1 tribune" as date-line rows. 509 – 27 BCE as traditional, and the end disputed: Flower's last republic c. 60 BCE, Caesar's dictatorship 49, the settlement of 27. |

**Read by eye.** *Article:* "the Library of Alexandria", "the Hellenistic period", "the Etruscan civilisation", "the
founding of Rome", "the Roman Kingdom", "the Roman Republic"; the persons and "Ancient Rome" bare. *Confusability:*
`wh-332`/`wh-333` father and son, Chaeronea only on `wh-332`, Aristotle only on `wh-333`; `wh-310`/`wh-333` the fall of
Persia and its conqueror, Gaugamela named in both backgrounds, the Hyphasis only on `wh-333`; `wh-336`/`wh-338`/`wh-339`/
`wh-340` the civilisation, its founding, its kings and its republic, 753 BCE on three lines but Varro's reckoning
explained on `wh-336` and `wh-338`, Lucretia only on `wh-339`, Polybius's mixed constitution only on `wh-340`.
*Consistency:* 509 and 27 BCE agree across `wh-336`, `wh-339` and `wh-340`; the Hellenistic 323 – 30 BCE with `wh-311`.
*Against the gr- and rm- cards:* `gr-695` credits Philip with the phalanx outright; `gr-802` ends the library in 48 BCE;
`rm-022` starts the Etruscans c. 1000 BCE (Stoddart) where `wh-337` has c. 900 (Posth); `rm-049` dates its Palatine
wall c. 600 – 500 BCE, apparently another structure. None edited.

**Glossary.** Five terms rewritten (*Herodotus*, *Philip II of Macedon*, *Alexander the Great*, *Library of
Alexandria*, *Ancient Rome*); *Hellenistic period*, *Etruscan civilisation*, *Founding of Rome*, *Roman Kingdom* and
*Roman Republic* already agreed. **The Greece and the Hellenistic world deck is done.**

### B35 — `wh-341`–`wh-350`, Rome (2026-10-04)

Run as B34. Checks: `wh-audit.js --range=wh-341:wh-350` clean but for `I.duplicate` on six cards whose pictures are
also `rm-` cards' (`wh-342`, `wh-343`, `wh-344`, `wh-345`, `wh-346`, `wh-349`: picture pass); the rest as B31; all 84
distinct URLs 2xx; `check-citations --card` 0 mismatched. New locators: `wh-347` Cannae (battle) and `wh-348` Byrsa
hill. **Every old card's date line carried at least one row that was not a date** (meeting houses, "10, then 2 more"
tables, "3 commissioners", "24 years", "700 years old", "provinces 2", "500 iugera"), and most cited Livy, Polybius,
Appian or Plutarch alone.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-341` Roman Senate | 9 | 6 → 9 | **"Decrees as law from 27 BCE" had no source**, and the Republic's dates stood for the Senate's. Now `""` and `undatable`: Romulus's founding is Livy's legend, the end a fading in the 7th century CE. Sizes of 300, 600 and 900 each given as whose. |
| `wh-342` Twelve Tables | 8 | 6 → 8 | **Livy's Athens embassy was told as fact**, with four Livy citations; now "Livy says", the years "by tradition" (451 – 450, ratified 449 BCE), the text known only from later quotations, and a modern warning against the story of its making. |
| `wh-343` Conflict of the Orders | 7 | 6 → 8 | **Livy's secession story was fact, and 286 BCE for the last secession was an 1875 dictionary's figure**; now 287. The name and the 494 – 287 frame are modern, the early secessions doubted, the old soldier a recurring motif. |
| `wh-344` Roman legion | 9 | 8 → 10 | **"A standing army" under the Republic: Polybius describes a fresh levy each year.** 4,200 and 5,000 are his; the "Marian reforms" as a modern construct; the line `""` and `undatable`, no source dating the legion's start or end. |
| `wh-345` Punic Wars | 8 | 7 → 9 | **No row dated the wars**, and a 201 BCE peace-terms row was another event's. Now 264 – 146 and each war; Polybius's ship losses as his, with the Aegates rams suggesting he overstated; the salted-earth story a modern fable. |
| `wh-346` Hannibal | 9 | 7 → 9 | **The oath at the altar, the 15 days in the Alps and the army figures were rows of fact**; now Polybius's, the oath disputed, the pass unknown. Born c. 247, exiled 195, died 183 – 181 BCE as Nepos's sources disagree. |
| `wh-347` Battle of Cannae | 8 | 6 → 9 | Every casualty figure is now its writer's: Polybius 70,000, Livy 45,500 foot and 2,700 horse, modern nearer 30,000. **The day, 2 August, is Quintus Claudius's Roman date via Gellius.** The glossary misquoted Livy as 40,000, as `rm-218` does. |
| `wh-348` destruction of Carthage | 8 | 6 → 10 | **The order of events was wrong** (surrender, hostages and arms came before the order to leave the city). "700 years old" and "3 years" rows dropped; the salting a later legend; Cato in Plutarch's words, not the Latin slogan. |
| `wh-349` Roman conquest of Greece | 7 | 6 → 7 | **Philip's 1,000 talents were half at once and half over ten years**, not "over 10 years"; **Achaea became a province only in 27 BCE**, not 146. Now 229 – 146 BCE, the Isthmian proclamation of 196, Corinth 146. |
| `wh-350` Gracchi brothers | 7 | 7 → 9 | **Gaius did not die on the Aventine**: Appian has him flee across the river and have a slave kill him. The 500-iugera limit is Appian's against Livy's summary's 1,000; Plutarch's rival motives his. No birth rows: no source gives one. |

**Read by eye.** *Article:* "the Roman Senate", "the Twelve Tables", "the Conflict of the Orders", "the Roman legion",
"the Punic Wars", "the Battle of Cannae", "the destruction of Carthage", "the Roman conquest of Greece"; "Hannibal"
bare; "the Gracchi brothers" (each phrasing says "the elder" or "the younger of the"). *Confusability:* `wh-341`/`wh-342`/
`wh-343` the council, the code and the struggle, the tribunes only on `wh-343`; `wh-345`/`wh-346`/`wh-347`/`wh-348` the
wars, the general, the battle and the end, the precheck's sibling note between `wh-345` and `wh-348` read and found to be
shared vocabulary only; `wh-348`/`wh-349` both end in 146 BCE, Carthage only on one and Corinth only on the other.
*Against the rm- cards:* `rm-218` quotes Livy's Cannae dead as 40,000 foot (he gives 45,500); `rm-283` states the
500-iugera cap as fact; `rm-119` and `rm-155` date things Livy dates (4,200 men in 346 BCE, the maniple in 340) that this
card leaves to a modern "mid-4th century". None edited.

**Glossary.** Ten terms rewritten: every card's entry had an unsourced claim or a sentence with no marker.

### B36 — `wh-351`–`wh-360`, Rome (2026-10-04)

Run as B35. Checks: `wh-audit.js --range=wh-351:wh-360` clean but for `I.duplicate` on `wh-351` and `wh-354` (pictures
also `rm-094`'s and `rm-352`'s) and a `W.not-why` note on `wh-354`; the rest as B31; all 80 distinct URLs 2xx;
`check-citations --card` 0 mismatched. New locator: `wh-356` (the Curia of Pompey, at Largo di Torre Argentina).
Glossary aliases that named another entry's own key were dropped (*Caesar's civil war* had carried "Pharsalus",
"Battle of Pharsalus" and "Rubicon"; *Gallic Wars* "Vercingetorix" and "Alesia"), since each has its own entry.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-351` Marius and Sulla | 7 | 9 → 8 | **"Office unused 120 years" was cited to Appian, who says 400** (120 is Plutarch's). "Dictator from 82 BCE" had no source and the proscription counts were not a date; now 107 – 86, 88 and 78 BCE. The Marian reforms as a modern debate. |
| `wh-352` Third Servile War | 7 | 7 → 7 | **The 6,000 crucified and the 70,000 and 120,000 armies were stated as fact**; now Appian's. The breakout's three counts (78, about 70, 30 or more) each its writer's; the debate over Spartacus's aims added. 73 – 71 BCE only. |
| `wh-353` Julius Caesar | 9 | 7 → 9 | The old card was Suetonius and Plutarch, with **pirate ransom and calendar rows that were not dates** and "perhaps 102" unattributed. Born c. 100 BCE on the ancient "56th year", Mommsen's 102 as his; consul 59; died 15 March 44 BCE. |
| `wh-354` Gallic Wars | 8 | 6 → 10 | **Plutarch's million killed and "800 cities, 300 nations" were stated as fact**; now beside Velleius's 400,000 and Caesar's counts, with the modern view that such numbers are rhetoric. 58 – 50 BCE and Alesia 52. |
| `wh-355` Caesar's civil war | 7 | 6 → 8 | **"The die is cast" is Suetonius's report**, Plutarch has it in Greek, and one account traces it to Menander; 10/11 January is one modern dating on a drifting calendar. A "6,000 dead" row dropped, Pollio's count now in prose; a phrasing carried 49 BCE. |
| `wh-356` assassination of Julius Caesar | 9 | 5 → 10 | **"Et tu, Brute" is Shakespeare's**, and the 23 wounds are Suetonius's and Plutarch's (Nicolaus gives 35 and more than 80 plotters). Two figure rows dropped; the Curia of Pompey and its surviving base added. |
| `wh-357` Augustus | 9 | 5 → 9 | **Suetonius's "44 years alone" counts from Actium, 31 BCE**, not from 27. Born 23 September 63 BCE, named Augustus 16 January 27 BCE, died 19 August 14 CE; the Res Gestae as self-presentation, "brick to marble" as Suetonius's report. |
| `wh-358` Roman Empire | 9 | 5 → 9 | **Appian's reckonings ("500 years to master Italy") were date-line rows.** From 27 BCE, with the ancient writers' other starting points; 476 CE a convention; the 75 million population one modern estimate. |
| `wh-359` Pax Romana | 8 | 5 → 10 | **The name and the span were stated as ancient**; the phrase is ancient (Pliny), the period name and 27 BCE – 180 CE a modern convention, beside a c. 150 BCE – 235 CE reading. The Greenland lead record and Calgacus's charge, as Tacitus's speech, added. |
| `wh-360` Roman roads | 9 | 5 → 10 | **The four-layer build was an 1875 inference from Vitruvius's rules for floors**; excavation shows layers varying with the ground. Network length as three modern figures, each whose (299,171, 188,555 and c. 100,000 km). |

**Read by eye.** *Article:* "the Third Servile War", "the Gallic Wars", "Caesar's civil war", "the assassination of
Julius Caesar", "the Roman Empire", "the Pax Romana", "Roman roads"; the persons bare. *Confusability:* `wh-353`–`wh-356`
the man, his conquest, his war and his death, the Rubicon only on `wh-355`, the Ides only on `wh-356`, the pirates
only on `wh-353`; `wh-336`/`wh-358` share the 27 BCE, 476 and 1453 CE rows, the civilisation and the imperial state, with
no phrasing in common; `wh-357`/`wh-358` the emperor and the empire, Res Gestae only on `wh-357`; `wh-304`/`wh-360` the
Persian and the Roman roads. *Against the rm- cards:* `rm-175` gives the four courses with thicknesses as fact and
`rm-138` the Appian Way paved in 312 BCE, where Livy has its stone paving later; `rm-313` has the legions come from
Nola where the old card had Capua; `rm-319` dates Sulla's dictatorship to 82 BCE, which no source here prints. None
edited.

**Glossary.** Nine terms rewritten; *Julius Caesar* already agreed.

### B37 — `wh-361`–`wh-370`, Rome (2026-10-04)

Run as B36. **A usage limit stopped the run mid-batch**: six agents died with drafts unfinished; they were relaunched
after the reset with a note to reuse saved pages only after re-checking them (`STEPS.md` in the scratch directory).
Checks: `wh-audit.js --range=wh-361:wh-370` clean but for `W.not-why` notes on `wh-362` and `wh-366`; the rest as B31;
all 85 distinct URLs 2xx. `check-citations --card` first found one mismatch: `wh-368`'s HiMA article is in the issue
labelled 2025 but Crossref dates it 2026, so the citation now reads "no. 14 (2025, published 2026)" and the check is
0. New locators: `wh-362` (the Colosseum, labelled Rome), `wh-365` Pompeii and `wh-368` (Hadrian's Wall, labelled
Northumberland).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-361` Roman aqueduct | 9 | 5 → 9 | **The card was really the Aqua Appia's**, with "9 aqueducts" a row. Now the technology, its first and last at Rome (312 BCE, 226 CE); Frontinus's 441 years and flow figures as his, measured by pipe size not volume, and his book read as self-promotion. |
| `wh-362` Colosseum | 9 | 5 → 9 | **"50,000 spectators" was stated as fact**; now the low end of modern estimates beside the catalogue's 87,000 places. Begun c. 70, opened 80, last hunts 523 CE; Dio's flooded sea-fight is his, with no archaeological trace. |
| `wh-363` Roman law | 9 | 5 → 9 | **The line put three other events' dates on a long tradition** (Gaius's list, Julian's edict, the Digest); now `""` and `undatable`. Two old phrasings also fitted `wh-439`'s Corpus Juris Civilis and were replaced. |
| `wh-364` Roman citizenship | 9 | 5 → 10 | **"The lex Julia gave all Italy citizenship in 90 BCE" came from an 1875 dictionary**; Appian has only the loyal allies admitted at first. Now `""`; Dio's tax motive for 212 CE as his view, with others'. |
| `wh-365` Pompeii | 9 | 5 → 10 | **The line held only Pliny's 24 August**; now the town's own history (walls c. 600 – 500 BCE, colony 80 BCE, buried 79 CE), and both eruption dates with whose: Pliny's August and the park's 2018 case for 24 October. The full toll unknown, about 1,300 victims found. |
| `wh-366` Nero | 9 | 5 → 9 | "Great fire 6 days and 7 nights" and "his 32nd year" were not dates. **The singing is a rumour in Tacitus and fact in Suetonius and Dio**, and the fiddle a later outgrowth; the Christians' punishment is Tacitus's report. Born 15 December 37, died 9 June 68 CE. |
| `wh-367` Trajan | 8 | 5 → 8 | **"The furthest extent" was a modern reckoning stated as fact**; Eutropius is now quoted and named. Dio's reign length dropped for born 18 September 53, emperor 98 – 117 and died August 117 CE (the day disputed). The Pliny-and-Christians phrasing was `wh-373`'s. |
| `wh-368` Hadrian's Wall | 9 | 5 → 9 | **The Jarrow stone's "80 miles" and "divine precept" are editors' restorations**, called far from certain. The Historia Augusta's "separate the barbarians" is attributed; defence or control a debate; begun c. 122, latest coins 403 – 406 CE. |
| `wh-369` Marcus Aurelius | 9 | 5 → 10 | **The title "to himself" was presented as his**; one view makes it a later addition. Plague tolls as Gilliam's and Scheidel's estimates; "five good emperors" Machiavelli's and Gibbon's; a "12 books" row dropped. Born 26 April 121, died 17 March 180 CE. |
| `wh-370` Crisis of the Third Century | 7 | 5 → 9 | **The card leant on the Historia Augusta**, with a "30 named, 22 after padding" row. 235 – 284 CE is a convention, de Blois's 249 – 268 and a climate study's c. 250 – 275 beside it, and the label itself questioned; the claimants as the Augustan History's thirty and Gibbon's nineteen. |

**Read by eye.** *Article:* "the Roman aqueduct" (phrased "a Roman aqueduct"), "the Colosseum", "Roman law", "Roman
citizenship", "Hadrian's Wall", "the Crisis of the Third Century"; the persons and Pompeii bare. *Confusability:*
`wh-342`/`wh-363` the code and the law, the Twelve Tables named on `wh-363` only in the background; `wh-364`/`wh-370`
both in the 3rd century, 212 CE only on `wh-364`; `wh-367`/`wh-368`/`wh-369` emperor, frontier, emperor, Hadrian named
on `wh-367` only as successor. *Against the rm- cards:* `rm-475` begins the Colosseum "under Vespasian, 69 – 79 CE"
where `wh-362` has c. 70; `rm-506` gives 15 forts on the Wall where `wh-368` gives 14 added before completion. None edited.

**Glossary.** Eight terms rewritten; *Roman aqueduct* and *Roman law* already agreed.

### B38 — `wh-371`–`wh-380`, Rome and Ancient India (2026-10-04)

Run as B37, most agents relaunched after the usage limit. The India collection (`in-`) is still empty, so the India
cards had no sibling to compare. Checks: `wh-audit.js --range=wh-371:wh-380` clean but for a `W.not-why` note on
`wh-374` and `L.missing` on `wh-376` (sixteen states: a region request was refused as a locator, and no single capital
stands for them all); the rest as B31; all 75 distinct URLs 2xx; `check-citations --card` 0 mismatched. New locator:
`wh-374` (Nicaea, at İznik). **The *Christianity* glossary entry was kept**: the `wh-373` draft rewrote the site-wide
term around the Roman Empire, and the old entry is general and agrees with the card.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-371` Diocletian | 8 | 5 → 9 | "Tetrarchy" is now said to be the modern scholars' word; the "unique abdication" Eutropius's claim. **Aper was no source's prefect**: now Numerian's father-in-law. Born c. 236 – 245 and died 313 – 316 CE, two accounts each. |
| `wh-372` Constantine the Great | 9 | 7 → 9 | **The vision is now two stories**: Lactantius's dream, the only contemporary one, and Eusebius's midday cross told 25 years later. **The "Edict of Milan" was neither an edict nor issued at Milan**; the deathbed baptism is Eusebius's report. |
| `wh-373` Christianity | 9 | 5 → 11 | **"Made official 380 CE" was the state-religion myth**: the law of 380 defined orthodoxy, and pagan worship was banned only in 391 – 392. A "17th year of Antoninus Verus" row dropped; the 5 per cent by 300 an estimate, whose. |
| `wh-374` First Council of Nicaea | 8 | 5 → 8 | **"Subscribed 318 bishops" was a symbolic figure stated as fact**; now Eusebius's more than 250 and Constantine's more than 300, with the 318 first appearing c. 358. The council did not settle the Bible, now said in an FAQ. |
| `wh-375` fall of the Western Roman Empire | 9 | 5 → 9 | **Odoacer's 13 years and Theoderic's 493 were other events on the line.** 476 CE as a convention, Nepos alive until 480 and the date's choice in 6th-century Constantinople; Gibbon's cause his, the transformation school and its critics named. |
| `wh-376` mahajanapadas | 6 | 5 → 7 | **The "mote hall, elected raja" clan-state picture came from the Sakiyas, who are not one of the sixteen.** The list from AN 3.70 with the Jain list beside it; "c. 600 – 500 BCE" had no source, now a climate study's c. 550 – 322 BCE (converted from its BP). |
| `wh-377` Upanishads | 7 | 5 → 7 | **"Sitting down near" was stated as the name's meaning**; in the oldest passages it means a hidden connection. Olivelle's c. 700 – 500 and c. 300 – 100 BCE replace "no later than 550"; the salt lesson is Uddalaka's, not Yajnavalkya's; the Muktika's 108 a late canon. |
| `wh-378` Hinduism | 9 | 5 → 9 | Pew's 2010 figures replaced by its 2025 report (1.2 billion in 2020); the colonial-era origin of "Hinduism" as one religion's name stated neutrally. `""` and `undatable` kept. |
| `wh-379` varna | 7 | 6 → 7 | **A 1922 view was settled fact, and "varna means colour" rested only on the old racial reading** (dropped). Varna and jati now told apart; Dirks's census argument as his; three named genetic studies of endogamy. |
| `wh-380` Gautama Buddha | 9 | 6 → 10 | **"44 years" of teaching had no source.** The line gives the old c. 563 – 483 BCE (from the chronicles' 218 years) and the newer death c. 405 BCE; the sheltered-prince tale as tradition; the Lumbini pillar quoted. |

**Read by eye.** *Article:* "the First Council of Nicaea", "the fall of the Western Roman Empire", "the mahajanapadas",
"the Upanishads"; "Christianity", "Hinduism", "varna" and the persons bare. *Confusability:* `wh-371`/`wh-372` the
persecutor and the convert, the Great Persecution only on `wh-371`; `wh-372`/`wh-373`/`wh-374` the emperor, the faith and
the council, Milan only on `wh-372`, Pliny and Decius only on `wh-373`; `wh-377`/`wh-378`/`wh-379` text, tradition and
social order, the Purusha hymn only on `wh-379`; `wh-380`/`wh-381` the man and the religion, Lumbini only on `wh-380`.
*Against the rm- cards:* `rm-573` dates the persecution's start to February 303 where Eusebius has March. None edited.

**Glossary.** Nine terms rewritten; *Christianity* kept as above.

### B39 — `wh-381`–`wh-390`, Ancient India (2026-10-04)

Run as B38. Checks: `wh-audit.js --range=wh-381:wh-390` clean but for `W.not-why` notes on `wh-389` and `wh-390`; the
rest as B31; all 59 distinct URLs 2xx. `check-citations --card` first found one mismatch: `wh-382` expanded an author's
initials as "A. G." where Crossref prints "AG", now as Crossref has it, and the check is 0. New locator: `wh-389`
(Sanchi, where the card's stupa stands). **Many old date lines were F. W. Thomas's provisional "at latest" years of
1922 printed as settled**; the new lines say whose reckoning each is.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-381` Buddhism | 9 | 7 → 9 | **"Founder died 483 BCE" and "canon by about 250 BCE" were an old Western dating and a 1922 view stated as fact.** Now "emerged c. 600 – 400 BCE", the prose giving three datings and whose; adherents from Pew's 2025 report; a phrasing that overlapped `wh-380` replaced. |
| `wh-382` Jainism | 8 | 7 → 8 | Now `""` and `undatable`, since Jains hold the teaching has no founder; Mahavira's traditional 599 – 527 and the scholars' c. 468 BCE each whose; the split of c. 300 BCE as tradition; Parshva possibly real, unprovable. A phrasing carried a numeral. |
| `wh-383` Maurya Empire | 7 | 6 → 9 | **"Dynasty lasted 137 years" was a row**; it is the Puranas' figure. Both ends are reconstructions: the start from the Sandrocottus match (one study allows only c. 311 – 305), the end from the 137 years; Megasthenes' details each credited to whoever quotes him. |
| `wh-384` Chandragupta Maurya | 7 | 7 → 8 | **The Jain abdication and death at Shravanabelagola was stated as fact**; it is a tradition grown up after c. 600 CE. Chanakya credited to later texts; the 500 elephants to Strabo and Plutarch (Appian gives none); the armies to Megasthenes and Plutarch; no source names a victor over Seleucus. |
| `wh-385` Arthashastra | 7 | 6 → 7 | **"Traditionally c. 300 BCE" was the only date**; now Olivelle's layered dating as his, composed c. 50 BCE – 125 CE and expanded c. 175 – 300 CE, then rediscovered in 1905; Kautilya as Chanakya a tradition. |
| `wh-386` Ashoka | 8 | 7 → 8 | **The old card said he never names himself, but the Maski edict does.** Reign c. 268 – 232 BCE as Upinder Singh gives it; the Kalinga toll Ashoka's own figure in Rock Edict 13; the conversion stories the Mahavamsa's and the Ashokavadana's. |
| `wh-387` Edicts of Ashoka | 7 | 6 → 7 | **Thomas's 1922 "at latest" dates were printed as settled**; now issued c. 259 – 242 BCE on his reckoning, with Hultzsch's coronation of 264 beside it. Prakrit, Brahmi and Kharosthi, the Greek and Aramaic at Kandahar, and dhamma rather than Buddhism added. |
| `wh-388` spread of Buddhism | 8 | 6 → 9 | **The missions, Mahinda's included, are known only from the Sri Lankan chronicles**; the edicts never mention them. Emperor Ming's dream is the Hou Hanshu's "current tradition". Sri Lanka c. 246 BCE, Korea 372, Japan 538 or 552 CE, agreeing with `cnh-267` and `jp-063`. |
| `wh-389` stupa | 7 | 6 → 9 | **A 19th-century view (the stupa cult as lay, not monastic) was fact**; dropped. The Vedic-mound origin as a widely held view; the 84,000 stupas a legend Faxian heard; Ashoka's Nigali Sagar pillar added. Sanchi's dates off the line, which is `""` and `undatable`. |
| `wh-390` Indo-Greek kingdoms | 6 | 9 → 7 | **Greek rule ended c. 10 CE, when a Scythian governor took Sagala**, not c. 20 CE with the Kushans. Both ends reconstructions, whose; the history rebuilt from coins; the Milindapanha a Buddhist author's portrait. |

**Read by eye.** *Article:* "Buddhism", "Jainism", "Ashoka", "Chandragupta Maurya" bare; "the Maurya Empire", "the
Arthashastra", "the Edicts of Ashoka", "the spread of Buddhism", "a stupa", "the Indo-Greek kingdoms". *Confusability:*
`wh-383`/`wh-384` the state and its founder, Megasthenes on both but the capital only on `wh-383`, Seleucus only on
`wh-384`; `wh-386`/`wh-387` the man and his edicts, Kalinga's toll only on `wh-386`, the Greek kings and the scripts
only on `wh-387`; `wh-381`/`wh-388` the religion and its spread, the branches only on `wh-381`, Mahinda only on `wh-388`.
*Against the gr- cards:* `gr-768` has the elephants decide Ipsus and Seleucus cede "the eastern provinces"; `gr-785`
dates Menander c. 155 – 130 BCE where `wh-390` has c. 165 – 130 (from his coins). None edited.

**Glossary.** Nine terms rewritten; *Buddhism* and the *spread of Buddhism* alias already agreed.

### B40 — `wh-391`–`wh-400`, Ancient India and Ancient China (2026-10-04)

Run as B39, the China cards read against the `cnh-` collection. Checks: `wh-audit.js --range=wh-391:wh-400` clean but
for `I.duplicate` on `wh-398` (its picture is also `cnh-111`'s); the audit's sibling check first caught `wh-396` and
`wh-397` sharing half their content words in their lead phrasings ("an age when the king … the real power"), so
`wh-397`'s lead phrasing was rewritten onto Mencius's story of the chronicle; the rest as B31; all 53 distinct URLs 2xx.
`check-citations --card` reports one mismatch it cannot resolve: `wh-394` cites the Bakhshali response with the
article's own byline, Plofker first, where Crossref lists the five authors in another order, and the work itself wins.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-391` Kushan Empire | 6 | 5 → 7 | **"Kanishka's era long read as 78 CE" sat on the line as if unresolved, and "in Kabul after 25 CE" had no source.** Year one is now 127 CE (Falk; Cribb's coins; most specialists), 78 CE also dated; the Yuezhi origin the Chinese histories'; the Rabatak line and the Sasanian vassal kings added. |
| `wh-392` Greco-Buddhist art | 6 | 5 → 7 | **"Dated pieces 0 of many thousands" was wrong**: five Gandharan Buddhist images carry years. The name a modern label (specialists say Gandharan art); made c. 50 – 500 CE; Gandhara or Mathura as the Buddha image's birthplace an open question, with whose. |
| `wh-393` Gupta Empire | 7 | 8 → 7 | **Samudragupta's poem was said to share a stone with Ashoka's "conquest by dhamma", which is Rock Edict 13, not on the Allahabad pillar.** The exact coronation day hedged; Faxian a pilgrim's report; the Hunnic wars and the "golden age" as Vincent Smith's phrase and a colonial and nationalist idea. |
| `wh-394` Hindu–Arabic numerals | 7 | 6 → 7 | Century-only rows replaced by c. 550 CE (the first full system), the Gwalior zero of 876 CE and the Liber Abaci of 1202; **the Bakhshali radiocarbon dates of 2017 and the reply that contests them** added; al-Khwarizmi's lost book through its Latin version. |
| `wh-395` Classical Sanskrit literature | 6 | 8 → 6 | **The line held three other events' dates**; now Macdonell's c. 200 BCE – 1100 CE as his, and the inscription of 634 CE naming the famous poets. Kalidasa's date credited to tradition and to scholars; **Keith's history was miscited as 1920** (it is 1928). |
| `wh-396` Eastern Zhou | 7 | 5 → 7 | **The phrasings carried years and figures**, and the eclipse material was `wh-397`'s. 770 – 256 BCE, the remnant annexed in 249; the break between its halves as 481 (Chavannes), 475, 453 (Pines) or 403, each whose. A source that called 770 – 476 BCE the "Warring States" dropped. |
| `wh-397` Spring and Autumn period | 7 | 5 → 8 | **The line used other terms' dates** (the Eastern Zhou's span, Duke Huan's reign, 403 BCE). Now c. 770 – 475 BCE and the chronicle's own 722 – 481; the five presiding chiefs as a disputed list; Confucius as the chronicle's maker as Mencius's story. A mint figure cited to a genetics paper dropped. |
| `wh-398` Warring States period | 7 | 5 → 7 | **The phrasings carried years.** Starts of 475, 453 or 403 BCE; the name given in retrospect and carried by the Zhanguo ce; the 400,000 dead after Changping Sima Qian's figure, with a modern study on why it looks too large. "Hundred schools" is in the Zhuangzi; only the school labels are Han. |
| `wh-399` Confucius | 9 | 5 → 9 | **551 BCE was stated as fact**; now 551 – 479 BCE as Sima Qian's traditional dates, with the commentaries' 552. The Analects as compiled by disciples; the Five Classics as later tradition; a "70 generations" row and a pigment paper that said nothing of him dropped. |
| `wh-400` Confucianism | 9 | 5 → 9 | **"Ren peaks" and "li peaks" rows came from a word-count paper, and the man's and the dynasty's dates stood for the tradition's**; now `""` and `undatable`. "Confucianism" as the English label for Ru; the Han adoption of 136 BCE with the debate over its reach. |

**Read by eye.** *Article:* "the Kushan Empire", "the Gupta Empire", "the Eastern Zhou", "the Spring and Autumn
period", "the Warring States period"; "Greco-Buddhist art", "Hindu–Arabic numerals", "Classical Sanskrit literature",
"Confucianism" and "Confucius" bare. *Confusability:* `wh-390`/`wh-391`/`wh-392` the Greek kings, the Kushans and the
art, coins on all three but bilingual only on `wh-390`, Rabatak only on `wh-391`; `wh-396`/`wh-397`/`wh-398` the whole
and its two halves, the dividing years on `wh-396` and the Lu chronicle only on `wh-397`, Changping only on `wh-398`;
`wh-399`/`wh-400` the man and the tradition, the Han's 136 BCE on both but as a phrasing only on `wh-400`. *Against the
cnh- cards:* `cnh-163` starts the Warring States "from 480, 403 or 376 BCE" (480 against Chavannes's 481); `cnh-142`
ends the Spring and Autumn c. 476 BCE against `wh-397`'s c. 475, a one-year convention difference. None edited.

**Glossary.** Ten terms rewritten (*Kushan Empire*, *Greco-Buddhist art*, *Gupta Empire*, *Hindu-Arabic numerals*,
*Sanskrit literature*, *Eastern Zhou*, *Spring and Autumn period*, *Warring States period*, *Confucius*,
*Confucianism*); the shared Zhou entries now agree with both collections. **`wh-301`–`wh-400` are done: the Greece,
Rome and Ancient India decks are complete, and Ancient China continues at `wh-401` (B41).**

### B41 — `wh-401`–`wh-410`, Ancient China (2026-10-15)

Run as B40 (WH_S harness, two cards to an agent, the China cards read against `cnh-`). Commons refused the sandbox at once
(the one check, "too many requests"), so **pictures were skipped** and the judgements are in "Pictures to redo". Checks:
`wh-audit.js --range=wh-401:wh-410` clean but for `W.not-why` notes on `wh-407`, `wh-408` and `wh-410`; the rest as B31; all
74 distinct URLs 2xx on a second look (a DOI and a UCL PDF answered 503/520 once); `check-citations --card` 0 mismatched on
all ten. New locators: `wh-406` (Lintong, for the mausoleum) and `wh-407` (Badaling). `wh-403` has only 4 modern sources of 9
(the rest early-20th-century translations and Han–Tang texts), because Meyer and the other recent work was behind bot walls.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-401` Taoism | 9 | 5 → 9 | **"Born 604 BCE" for Laozi was a later tradition stated as fact**, and a "five major religions" sentence came from a paper that was not about the term. *Daojia* is now Sima Tan's Han label (so no Warring States school of that name); Guodian slips and an anthology view of the *Daodejing*; the Celestial Masters (traditional 142 CE); *wu wei* as effortless action, not "doing nothing". `""` and `undatable`. |
| `wh-402` Legalism | 8 | 5 → 8 | **A date line made Shang Yang's, Han Fei's and Sima Tan's dates the school's own**; now `""` and `undatable`. "Legalism" is *fajia*, a Han label coined by Sima Tan, and no early thinker was a member; Shang Yang's inn story and Han Fei's death are Sima Qian's; Qin law from the Shuihudi and Yuelu slips. "Confucian outside, Legalist inside" could not be sourced and is not used. |
| `wh-403` The Art of War | 9 | 5 → 9 | **A 6th-century Sun Tzu and Helü's reign stood on the date line as the book's date.** Now c. 475 – 221 BCE as the scholars' span, the Yinqueshan tombs (c. 140 – 118 BCE, found 1972), Sima Qian's drill story as his and the book itself silent on drilling, the Han catalogue's 82 *pian*, Amiot's 1772 French. |
| `wh-404` Qin Shi Huang | 9 | 5 → 9 | **"Aged 51" at his death fits neither Sima Qian's 259 nor 210 BCE**; dropped. The paternity (Lü Buwei) is the dynasty's critics'; *huang* + *di* as the title's parts, Chavannes's gloss for the "three sovereigns" dropped; the 460 men put to death and "burying the scholars" a *Shiji* figure and story; a Han Fei claim dropped. |
| `wh-405` Qin dynasty | 8 | 5 → 9 | **"221 – 206 BCE" and "about 15 years" were stated flat**; Sima Qian's Ziying surrender converts to 207 BCE, and 206 is shown as the other count. "The Han kept Qin's commandery system" dropped (the slips show three separate offices in each Qin commandery); Jia Yi's verdict a Han writer's judgement. |
| `wh-406` Terracotta Army | 9 | 5 → 9 | **"8,000 soldiers" is in no source read**: now about 7,000 as an estimate and a little over 2,000 excavated. "Every face unique" not stated (moulds assembled in many combinations); the chromium "anti-rust coating" refuted in 2019; the mausoleum's start 247 or 246 BCE. |
| `wh-407` Great Wall of China | 9 | 5 → 10 | **A question said Meng Tian led 300,000 men north in 214 BCE; in Sima Qian the campaign comes first, and the river wall is the emperor's.** Many walls of 20+ states over almost 2,000 years; the 21,196 km survey total beside the Ming 8,851.8 km; the "visible from space" belief called a myth by NASA; a biocrust claim (Ming earthen wall only) dropped. |
| `wh-408` Han dynasty | 8 | 5 → 8 | **"Wudi made a Confucian state" and "the Xiongnu story is a Han myth" were claims from a first page**; now the debate (van Ess), heqin as the history reports it, the 2 CE census (59,594,978 in the *Han shu*; about 57.7 million by modern reckoning), the 81 BCE salt-and-iron debate. Wudi 141 – 87 BCE, others 140 or 86. |
| `wh-409` Silk Road | 9 | 5 → 9 | **A question carried the year 1877**; the name is Richthofen's, used sparingly, plural as well as singular. "Carried disease" hedged: very little concrete evidence before the Xuanquanzhi latrine, and how plague reached the west is unknown. Zhang Qian, Pliny's sesterces, the Shiji on silk's absence west of Ferghana added. Date line `""` (rows were other events'). |
| `wh-410` scholar-official | 7 | 6 → 8 | **The Han route was recommendation (*xiaolian*), not examination** ("filial and incorruptible" 120 times in the *Hou Han shu*); the examination sequence now Sui – Tang – Song – 1905. An iron-production paper cited for the state's technology dropped; three of four French sources dropped; Kim and Massey's British-influence claim one study's case. |

**Read by eye.** *Article:* "the Art of War", "the Terracotta Army", "the Great Wall of China", "the Han dynasty", "the Silk
Road", "the Qin dynasty"; "Taoism", "Legalism", "scholar-official" and "Qin Shi Huang" bare. *Confusability:*
`wh-404`/`wh-405`/`wh-406` the man, his state and his army, the unified measures on `wh-404` and `wh-405` only, crossbow
ink marks and chromium only on `wh-406`; `wh-405`/`wh-408` the first and the second imperial house, the Xin interregnum only
on `wh-408`; `wh-401`/`wh-402` two schools, the butterfly only on `wh-401`, the fa label only on `wh-402`; `wh-409`/`wh-408`
the routes and the dynasty, Zhang Qian on both but the latrine only on `wh-409`. *Against the cnh- cards:* `cnh-191` and
`cnh-212` end the Qin in 206 BCE where `wh-405` gives 207 with 206 beside it; `cnh-169` begins Shang Yang's reforms in 356
where `wh-402` has 359 "on one reckoning"; `cnh-229` has Zhang Qian set out c. 138 BCE where `wh-409` prints no departure
year (the *Shiji* gives only the Jianyuan period). None edited.

**Glossary.** Eight terms rewritten (*Taoism*, *Legalism*, *The Art of War*, *Qin dynasty*, *Terracotta Army*, *Great Wall*,
*Silk Road*, *Scholar-official*); the old *Taoism* date ("from the 6th century BCE") rested on the legend. `wh-404` and
`wh-408`'s entries already agreed and were kept; the Terracotta Army entry's picture description said "no two faces are
alike" and was corrected.

### B42 — `wh-411`–`wh-420`, Ancient China and Africa and the Americas in antiquity (2026-10-15)

Run as B41, the China cards read against `cnh-`, the Kush and Punt cards against `eg-`; pictures skipped (Commons still
refused). Checks: `wh-audit.js --range=wh-411:wh-420` clean but for `I.duplicate` on `wh-414` (its picture is also
`ko-089`'s); `check-citations --card` 0 mismatched on all ten; all 68 distinct URLs 2xx. New locators: `wh-417`
(Meroë, at Begrawiya) and `wh-419` (the Jos Plateau, a region, some 100 km from the Nok sites). `wh-419` has Peter Breunig
as an author of four sources (precheck counts first authors only), and the Brill abstract page (source 6) could be swapped
if a stricter reading is wanted.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-411` Sima Qian | 7 | 5 → 7 | **"Written privately" and "from the legendary Xia" were wrong**: he held the court post, and the *Shiji* opens with the Yellow Emperor. Birth 145 (a commentator of 737) to 135 BCE, death between 86 and 74 BCE, castration about 98 BCE, the letter to Ren An 91 BCE, each hedged; the 526,500-character count and the "father of Chinese history" label dropped. |
| `wh-412` papermaking | 8 | 5 → 8 | **Talas 751 stood as fact, with a date-line row**; now a tale from later Arabic writers (via Bloom) beside Sogdian letters on paper. Cai Lun's 105 CE is the *Hou Han shu*'s report, not a first sheet; blank paper from tombs of 140 – 87 BCE; fixed-screen and movable-screen sheets told apart. |
| `wh-413` fall of the Han dynasty | 7 | 5 → 7 | **Offices were sold for Ling's own purse, not "divided with the eunuchs"; "condemned by the hundred" was the purges of 166–167 and 169** and a ban lasting to 184. The end is dated three ways (184, 189, 220) and whose each is; no 156 CE census or plague analogy (unsourced). |
| `wh-414` Three Kingdoms | 7 | 5 → 7 | **Wu's imperial title is 229, not 222**, which was a kingship; Shu fell in 263, Wei ended 266, Jin took Wu 280. Chen Shou and Pei Songzhi kept apart from the novel (the Empty City is recorded of Wen Ping); a "China's best novel" vote and a Shu/Wu head-count dropped. |
| `wh-415` Chinese Buddhism | 7 | 5 → 7 | **The dream of Emperor Ming is a legend**; the firmer evidence is the 65 CE edict to the Prince of Chu. An Shigao (c. 148 – 170), Kumarajiva at Chang'an in 402, Faxian in 399, Yungang (460 – 524), 845; "eighteen men", "about 67 CE" and the Northern Wei monk counts dropped; sinification as a contested idea. |
| `wh-416` Kingdom of Kush | 7 | 5 → 7 | **"About 900 BCE" and "750 – 650" for the 25th dynasty were no source's**: the Napatan phase c. 1070 – 300 BCE (one study) beside a late 9th century BCE view, Meroitic to c. 350 CE, the dynasty c. 742 – 656 BCE. Kerma a precursor, not the same kingdom; the end by Aksum's raid debated. |
| `wh-417` Meroë | 7 | 5 → 10 | **The Persée papers behind the old card could not be read**; rebuilt on Strabo, Pliny and the *Res Gestae* for Candace and the Roman war, and on radiocarbon dating for "the Birmingham of ancient Africa" (smelting for over 1,000 years, mostly outside its time as capital). The script read in sound but not understood; the pyramid count and Psamtik II dropped. |
| `wh-418` Kingdom of Aksum | 7 | 5 → 7 | **The stela "33 m, 520 tons" stood in a heritage paper**; Phillipson's standing one is 23 m, and the largest fell while being raised. c. 150 BCE – 700 CE is one study's frame (no settlement on the site before the 1st century CE); coinage from c. 270 CE, Ezana c. 340 CE; "only polity to mint coins" one authority's. |
| `wh-419` Nok culture | 6 | 5 → 6 | **"Earliest large sculpture outside Egypt" was fact and the end date "1 BCE" no source's**; now one ranking, and c. 1500 BCE (the Frankfurt project), figures c. 900 – 400 BCE, found 1928. Iron "oldest in West Africa" contested (Taruga charcoal as early as 280 BCE); looting and function debated. |
| `wh-420` Bantu expansion | 7 | 5 → 7 | **"Some 240 million" speakers was one count** (350 and 300 million elsewhere); the start is "6,000 – 4,000 years ago, depending on the study". The environmental claim narrowed to diversification rate; the early- and late-split, forest-crossing and savanna-corridor routes; gene flow with local groups instead of conquest. |

**Read by eye.** *Article:* "the fall of the Han dynasty", "the Three Kingdoms", "the Kingdom of Kush", "the Kingdom of
Aksum", "the Nok culture", "the Bantu expansion"; "Sima Qian", "papermaking", "Chinese Buddhism" and "Meroë" bare.
*Confusability:* `wh-413`/`wh-414` the fall and the states after it, Dong Zhuo and Cao Cao on both, the Yellow Turbans only on
`wh-413`, Chen Shou and the novel only on `wh-414`; `wh-416`/`wh-417`/`wh-418` the kingdom, its city and its neighbour,
Candace and the Roman war only on `wh-417`, the 25th dynasty only on `wh-416`, coins and stelae only on `wh-418`;
`wh-419`/`wh-420` iron on both but Taruga only on `wh-419`. *Against the cnh- cards:* `cnh-240` gives Sima Qian's birth as
"from 163" (Mayers, no authority per Chavannes) and a 526,500-character count; `cnh-270` has Dong Zhuo enter Luoyang on
22 September 189 where de Crespigny has the 24th; Theobald ends Wei in 265 where de Crespigny (and `cnh-277`/`cnh-293`) have
266; `cnh-291` carries the 1901 "best novel" remark. None edited. `docs/wh-chronology.md` had no Kush row; the sources differ
by a few years on the 25th dynasty (742, 747, 751), and the card follows one.

**Glossary.** Ten terms rewritten (*Sima Qian*, *Papermaking*, *End of the Han dynasty*, *Three Kingdoms*, *Chinese
Buddhism*, *Kingdom of Kush*, *Meroë*, *Kingdom of Aksum*, *Nok culture*, *Bantu expansion*); the old *Kingdom of Kush*,
*Nok culture* and *Bantu expansion* dates (c. 900 BCE, "1 BCE", "c. 4000 – 2000 BCE onwards") agreed with no source.

### B43 — `wh-421`–`wh-430`, Africa and the Americas in antiquity (2026-10-15)

Run as B42; no collection of ours covers these subjects, so `related.js` found nothing to disagree with but `eg-`'s Sahure
and Yam cards. Pictures skipped. Checks: `wh-audit.js --range=wh-421:wh-430` clean but for `L.missing` on `wh-422` (Punt's
place is disputed, so none was requested) and `wh-425` (a culture area; a retry of the locator said "rate limited") and a
`W.not-why` on `wh-429`; the rest as B31; all 70 distinct URLs 2xx; `check-citations --card` 0 mismatched on all ten. New
locators: `wh-421` (Germa) and `wh-427` (the Oaxaca Valley).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-421` Garamantes | 6 | 5 → 7 | **"Defeated by Quirinius about 20 CE" and "Maternus about 100 CE" were wrongly dated**: the Fezzan Project volume has Balbus c. 20 BCE, Quirinius c. 15 BCE (doubtful) and Maternus c. 88 – 92 CE. c. 1000 BCE – 700 CE is that project's phase frame; the foggaras' origin (probably Egypt, late 1st millennium BCE) is its view; Herodotus's chariot hunt is what he says. |
| `wh-422` Land of Punt | 7 | 5 → 7 | **A "c. 2800 BCE" row had no source, and Hatshepsut's reign stood as the expedition's date.** One sourced span, c. 2500 – 1170 BCE, from Sahure's annal to Ramesses III; Hatshepsut's voyage is one of several; the site is placed by whom (Somali coast, Upper Nile, eastern Sudan and Eritrea, Arabia); the baboon study is Dominy et al. 2020. |
| `wh-423` trans-Saharan trade | 8 | 5 → 8 | **"No West African object in the Garamantian oases" was reversed** (a haematite lip-plug and a cowrie in a Fezzan burial); the 3rd-century camel date and the gold-by-the-8th-century row had no source. Now `""` and `undatable`; kept before Islam (the Fatimid gold and Sijilmasa belong to `wh-566`/`wh-567`); the chariot-route idea and the camel dating are views, whose. |
| `wh-424` Olmecs | 8 | 5 → 8 | **"The earliest ballcourt is at Etlatongo" was only the earliest highland one.** The head count, sizes, "severed heads" reading and "humid" had no source; dates are Stark and Stoner's and Blomster's, whose; the name is Nahuatl and later; mother culture against sister cultures; the Cascajal Block disputed. |
| `wh-425` Mesoamerica | 8 | 5 → 8 | **One southern-edge rockshelter's maize date stood for the region** (El Gigante, about 4,400 BP; Tehuacán cobs about 5,600 BP) and a 2021 study's zero proposal was fact. Kirchhoff 1943 as the term's origin, the trait list, two period schemes; `""` and `undatable`. |
| `wh-426` Mesoamerican ballgame | 8 | 5 → 8 | **"One to seven players", "three forms of ulama" and a length-to-width rule rested on a source that would not open.** The losers' sacrifice is now debated (captives and beheading myths, not clearly a defeated team); Paso de la Amada c. 1650 BCE, rubber balls c. 1600 BCE, Etlatongo 1374 BCE midpoint; over 2,300 probable courts. |
| `wh-427` Monte Albán | 7 | 5 → 7 | **The Danzantes were "shamans"; several researchers read them as sacrificed captives, not all agree.** Founded c. 500 BCE with its phases; 17,000 people at the city and over 50,000 in the valley by 150 BCE (one estimate); a Zapotec enclave at Teotihuacan; Tomb 7's Mixtec treasure a later reuse; partial abandonment after 700 – 800 CE, not a collapse. |
| `wh-428` Maya civilisation | 9 | 5 → 9 | **A question carried a figure of years, and "no defensive works anywhere in the Puuc" outran the lidar sample.** Many rival polities, not an empire; period dates whose; 3 – 10 million with the warning that lidar density was extrapolated; drought debated; the Pacunam "60,000 structures" and a 562 CE defeat of Tikal dropped (no open source). |
| `wh-429` Maya script | 8 | 5 → 8 | **"The earliest securely dated Maya script" at San Bartolo was the 260-day-count sign, not the script**; the plaster is "one of the earliest" from a well-dated setting. Sign counts (over 1,000, about 500 at once, about 200 syllabic), Landa's "alphabet" and the 1562 burning, four codices with the Grolier now widely accepted, decipherment credited to several. |
| `wh-430` Long Count | 7 | 5 → 7 | **The date line held another event's date and a constant**: now the earliest firm Long Count date (36 BCE, Chiapa de Corzo, not Maya) and day zero 11 – 13 August 3114 BCE (584,283 or 584,285; "584,284" had no source). The 2012 doomsday a modern idea (Tortuguero names it, Palenque counts to 4772 CE). |

**Read by eye.** *Article:* "the Garamantes", "the Olmecs", "the Mesoamerican ballgame", "the Maya civilisation" (in
question 3 "the Maya civilisation lost its great cities"), "the Maya script", "the Long Count"; "Land of Punt",
"Mesoamerica", "Monte Albán" and "trans-Saharan trade" bare. *Confusability:* `wh-424`/`wh-425`/`wh-426` the people, the
region and the game, the ballcourt at Etlatongo only on `wh-426`, the Tuxtla basalt only on `wh-424`; `wh-428`/`wh-429`/`wh-430`
the civilisation, its writing and its calendar, San Bartolo on `wh-429` only, the doomsday reading only on `wh-430`;
`wh-421`/`wh-423` the people and the trade, foggaras only on `wh-421`. *Against other cards:* `wh-428` gives the Classic
as 250 – 1000 CE (McCool) where `wh-425` cites other schemes (Preclassic 2500 BCE – 150 CE; Classic from about 250 or 150);
`eg-122` dates Sahure c. 2494 – 2345 BCE where Dominy gives about 2480, so `wh-422` prints no Sahure year. None edited.

**Glossary.** Nine terms rewritten (*Garamantes*, *Land of Punt*, *Trans-Saharan trade*, *Olmecs*, the ballgame, *Monte Albán*,
*Maya civilisation*, *Maya script*, *Long Count*); the *Mesoamerica* entry was kept as it stood. The old *Long Count* entry
called 584,283 "the accepted answer" and the old *Maya script* entry dated the script by the calendar sign.

### B44 — `wh-431`–`wh-440`, Africa and the Americas in antiquity and Byzantium (2026-10-15)

Run as B43, the Byzantine cards read against `rm-`/`gr-`. Pictures skipped. Checks: `wh-audit.js --range=wh-431:wh-440` clean
but for `L.missing` on `wh-431` (the locator request "Teotihuacan" found no primary coordinate) and an `S.chip?` false
positive on `wh-439` (source 5 is an English article whose title carries a Greek phrase); the rest as B31; 83 distinct URLs
2xx (a PNAS DOI answered 403 to the checker but is a Crossref-confirmed DOI the saved page was read from).
`check-citations --card` is 0 mismatched on nine cards; `wh-440` reports one it cannot clear: its source 6 is a Greek-script
byline (Τζενη ΑΛΜΠΑΝΗ, exactly as Crossref has it) that the checker's author parser cannot split. New locators: `wh-432`
(Chavín de Huántar), `wh-433` (the Nazca Pampa), `wh-435` (Caral), `wh-437` (Istanbul's historic peninsula) and `wh-440`
(Sultanahmet). `wh-436` rests on six `De Imperatoribus Romanis` entries by different authors, so one encyclopedia supplies
most of the card's sources.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-431` Teotihuacan | 8 | 5 → 8 | **"Many archaeologists argue for collective rule" was the marginal view** (a central-rulers view is widely held): now a stated debate. 80,000 – 100,000 was one conservative estimate; now 75,000 to over 200,000 with each method; the name is Nahuatl and its gloss debated; the 378 CE arrival is Maya inscriptions' report; no start in the 100s BCE or 150 – 450 CE peak could be sourced. |
| `wh-432` Chavín culture | 7 | 5 → 7 | **1200 – 400 BCE was a period, not the site**; now Burger's radiocarbon sequence (founded c. 950, abandoned by 400 BCE) beside Rick's end of use as a temple c. 500. The vilca "carried from far" and cinnabar claims dropped (vilca need not come from far); Tello's "mother culture" disputed; San Pedro only a reading of one plaque. |
| `wh-433` Nazca Lines | 9 | 5 → 9 | **The date line said the lines were in use "to the 15th century"** and a Greek etymology had no source; now c. 100 BCE – 650 CE, two Palpa sites dated 400 – 650 CE by luminescence, a Paracas start c. 750 BCE. The purposes are proposals; the 2019 and 2024 surveys' counts sourced; no "800 lines" figure (none read). |
| `wh-434` Moche culture | 7 | 5 → 8 | **100 – 800 CE stood as fact**; now three attributed ranges (100 – 800, 200 – 900 radiocarbon, 300 – 950). One state, two polities or independent valleys is argued; sacrifice at Huaca de la Luna and the Sipán tombs; an El Niño end disproved at Huacas de Moche (Uceda). |
| `wh-435` Norte Chico civilisation | 6 | 5 → 9 | **"c. 2600 BCE" and a 2900 row were no source's**; c. 3000 – 1800 BCE is the Nature 2004 radiocarbon span, 2627 BCE Mesoweb's date for Caral's earliest parts. Civilisation or society, the 2005 quipu claim (Shady's), the marine-foundations idea challenged by isotopes, the decline hypothesis. |
| `wh-436` Byzantine Empire | 9 | 5 → 9 | **The end was 1430 (Thessaloniki's fall), not 1453**, and the card never said the people called themselves Romans. The start is dated three ways (330, 395, the 280s); the Latin-to-Greek shift; Manzikert as "the mortal blow" set against a ten-year civil war; 1204 – 1261. Hieronymus Wolf not named (no read source does). |
| `wh-437` Constantinople | 9 | 5 → 9 | **A bombard question duplicated `wh-686`/`wh-688`**; a harbour figure rested on a 403 page; "eleven centuries" and the 600 kg ball were model inputs. Byzas a pseudo-historical founder, 11 May 330, the 413 wall (sixty days after the 447 quake, by the inscriptions), the chain, 1204, 1261, 1453. |
| `wh-438` Justinian I | 8 | 5 → 8 | **The plague reached the capital in 542, not 541, and the Gothic War ended in 552, not 554**; a death day had no source and a silk-smuggling story rested on a page that would not open. Procopius's three works told apart (the *Secret History* hostile); the Nika toll of more than 30,000 is his. |
| `wh-439` Corpus Juris Civilis | 7 | 5 → 8 | **"Three years" for the Digest was Justinian's claim (about six on Weber's count)**, and "sent to Italy in 554" and the Bologna revival were unhedged (about 1100, not the 1070s). The Amalfi tale is unsupported; the Novels are in Greek; why English law grew apart. |
| `wh-440` Hagia Sophia | 9 | 5 → 9 | **It was the third church on its site, not the second**, and "the rebuilt dome was higher" is contradicted by recent work (sources differ); the "five-year build" is not in Procopius. Dome fell 7 May 558, reconsecrated 24 December 562; mosque 1453, museum decree 1934 and the 2020 ruling stated neutrally. |

**Read by eye.** *Article:* "the Byzantine Empire", "the Corpus Juris Civilis", "the Norte Chico civilisation", "the Moche
culture", "the Chavín culture", "the Nazca Lines"; "Teotihuacan", "Constantinople", "Hagia Sophia" and "Justinian I" bare.
*Confusability:* `wh-436`/`wh-437` the state and its capital, Latin-to-Greek only on `wh-436`, the walls only on `wh-437`;
`wh-437`/`wh-438`/`wh-439`/`wh-440` city, emperor, law and church, the Nika riot on `wh-438` and `wh-440` (as the riot that burned
the church on `wh-440` only); `wh-431`/`wh-433`/`wh-434` three American cultures, no shared fact. *Against the rm- cards:*
`rm-586` dates a senate to Constantine where Berger credits Constantius (`wh-437` follows Berger); `rm-729` says the
commissioners read "almost 2,000 books" where Baldi counts 1,528 (`wh-439` gives neither). None edited.

**Glossary.** Ten terms rewritten (*Teotihuacan*, *Chavín culture*, *Nazca Lines*, *Moche culture*, *Norte Chico
civilisation*, *Byzantine Empire*, *Constantinople*, *Justinian I*, *Corpus Juris Civilis*, *Hagia Sophia*).

### B45 — `wh-441`–`wh-450`, Byzantium and the Christian East (2026-10-15)

Run as B44, read against `rm-`, `gr-` and `ru-`. Pictures skipped. Checks: `wh-audit.js --range=wh-441:wh-450` clean but for
`I.duplicate` on `wh-443` (its picture is also `ru-044`'s) and `L.missing` on `wh-450` (the Malazgirt request, and a retry as
"Battle of Manzikert", found no coordinate or was rate-limited); the rest as B31; `check-citations --card` 0 mismatched
on all ten. `wh-446`'s Eastern Orthodox glossary entry is a general term: its draft only corrects the old "c. 500 CE –
present" date, which made 500 look like a founding. `wh-450` was cut from one Kurdish and five Turkish sources to one
Turkish (app.js cannot tag Kurdish).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-441` Theodora | 8 | 5 → 8 | **Half the old abstract was about the date of the *Secret History*, not the empress.** Procopius is now attributed work by work (the hostile *Secret History*, the flattering *Buildings*, the *Wars*' Nika speech, which one historian thinks his invention); the marriage is "521 or 522" on one biography, not 525; no birthplace or birth year; cancer a report of Victor of Tunnuna. |
| `wh-442` Plague of Justinian | 7 | 5 → 7 | **"15 to a hundred million" was a gloss of the maximalist case.** First outbreak 541 – 544, pandemic 541 – 750, Constantinople 542; Procopius's five then ten thousand a day his own figure; Aschheim 2013 DNA, and the dispute over scale (Mordechai et al.: 505 papyri show no break) attributed. |
| `wh-443` Greek fire | 8 | 5 → 8 | **Three of five sources said nothing of Greek fire**, and "siege lifted 15 August 718" was Kokoszko and Leszka's date, not Theophanes's. First use c. 672 – 678 (Theophanes's Kallinikos entry; the long siege of 674 – 678 doubted); "Greek fire" a Western name; the recipe unknown (petroleum the majority view); "cannot be put out by water" only "said to". |
| `wh-444` Byzantine Iconoclasm | 7 | 5 → 7 | **726 and the Chalke Gate image were the old card's start**; now c. 730 (Barber), the image story doubted, and the debated causes (Muslim and Jewish influence, military failure) as proposals. Hieria 754, Nicaea II 787, 815 and 843; nearly all sources are the iconophile victors'; a monk-martyr figure had no source. |
| `wh-445` East–West Schism | 8 | 5 → 8 | **"Error lists began in the later 12th century" was wrong**: from the second half of the 11th. The 1054 bull and the synod's answer struck persons, not churches; Photios 858 – 880 on one account; failed unions 1274 and 1439; the bans lifted on 7 December 1965. |
| `wh-446` Eastern Orthodox Church | 8 | 5 → 8 | **The date line held four other events' dates** (Dionysian corpus, Basil's anaphora, Palamas, Crete 2016) and 500 CE read as a founding; now `""` and `undatable`. Pew's nearly 260 million include the Oriental Orthodox; Ukraine's 2019 recognition stated neutrally; Neoplatonism in the corpus one scholar's thesis. "First among equals" not used (no source). |
| `wh-447` Cyril and Methodius | 7 | 5 → 7 | **"Constantine the elder brother" had no source** (and the Blatnograd inscriptions and Glagolitic-origin theories were unverified). Glagolitic is Constantine's; Cyrillic a later adaptation, probably Preslav; the two Lives hagiography; Hadrian's blessing; Cyril d. 14 February 869, Methodius 885, the pupils expelled and welcomed by Boris. |
| `wh-448` Kievan Rus' | 7 | 6 → 7 | **The date line led with 941, a raid, and "1110s", a decade.** Now c. 880, Yaroslav 1036 – 1054, the 1240 sack; the *Primary Chronicle*'s early dates are its own reckoning; Normanists and anti-Normanists both stated, with the 1749 Academy quarrel; Oleg's 907 raid only in Russian annals; 1132 and 1169. |
| `wh-449` First Bulgarian Empire | 7 | 6 → 7 | **One scholar's "komitats resemble the Frankish marches" was fact** and Bardola's marriage plan a hypothesis; both dropped. 681 the conventional start, Boris 864 – 865, Symeon 893 – 927 (tsar title 913, denied, recognised for Peter in 927), the end 1018; Basil's 14,000 – 15,000 blinded "clearly exaggerated". |
| `wh-450` Battle of Manzikert | 7 | 6 → 7 | **"Passed over until the 1950s" is the claim Develi examines and doubts**; an Alexios 1081 row was another event. Release terms from Arabic sources (payment, tribute, captives, probably no land); Psellos writing to shield Michael VII; Matthew of Edessa on traitors and Uz and Pecheneg defectors; the civil war; Bari 1071; armies' sizes unsettled. |

**Read by eye.** *Article:* "the Plague of Justinian", "Byzantine Iconoclasm", "the East–West Schism", "the Eastern Orthodox
Church", "the First Bulgarian Empire", "the Battle of Manzikert" (question 3 "after the Battle of Manzikert"), "the
Kievan Rus'"; "Theodora", "Greek fire" and "Cyril and Methodius" bare. *Confusability:* `wh-444`/`wh-445`/`wh-446` the image
quarrel, the schism and the church, the Filioque only on `wh-445`, theosis only on `wh-446`; `wh-447`/`wh-448`/`wh-449` the
saints, Rus' and Bulgaria, Boris and Cyrillic on `wh-447` and `wh-449` but the exiled pupils only on `wh-447`; `wh-441`/
`wh-438` the empress and the emperor, the Nika speech only on `wh-441`. *Against other cards:* `rm-586` and `wh-437` differ on who gave Constantinople a senate (`wh-437` follows Berger); `ru-036` agrees
with `wh-448` on c. 880 and 1240 and with `ru-057` on Yaroslav's 1036 – 1054; `ru-058` dates the *Russkaya Pravda* 1000 – 1100. None edited.

**Glossary.** Eight terms rewritten (*Theodora*, *Plague of Justinian*, *Greek fire*, *Byzantine Iconoclasm*, *Eastern Orthodox
Church*, *Cyril and Methodius*, *First Bulgarian Empire*, *Battle of Manzikert*); the *East–West Schism* and *Kievan Rus'*
entries already agreed and were kept.

### B46 — `wh-451`–`wh-460`, Byzantium and the Christian East and the Islamic world (2026-10-15)

Run as B45; the religious cards (`wh-455`, `wh-457`–`wh-460`) were drafted with belief attributed to believers ("Muslim
tradition says…") and the earliest sources told from later tradition. Pictures skipped. Checks:
`wh-audit.js --range=wh-451:wh-460` clean (ten of ten); `check-citations --card` first reported mismatches on `wh-457` and
`wh-458`, where a Brill volume (online 2023, print 2024) is now cited "2024; published online 2023" and the check is 0. An
MDPI DOI answers 403 to the URL checker (MDPI refuses the sandbox); the articles were read as the publisher's
PDF and are cited by DOI. No new locators: the events, institutions and persons here have none by design, and `wh-454` kept its region.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-451` Sack of Constantinople | 7 | 5 → 7 | **The old card was about the wrong subject**: an Old Russian chronicle's account, Clari's clergy and Trebizond (whose date row, 1204 – 1461, belongs to another state). Rebuilt on Villehardouin (the 85,000 marks, the 34,000 shortfall, Zara, Alexios's offer of 200,000 marks), Choniates (written for his own purposes), the first entry in July 1203, the storming on 12 April 1204, the Latin Empire to 1261. |
| `wh-452` Fall of Constantinople | 8 | 5 → 8 | **The old card never described the siege** (it was about four Greek historians); one of them, the long chronicle under Sphrantzes's name, is a 16th-century forgery following Leonard's letter. Forces as eyewitnesses give them (Sphrantzes 4,773 Greeks, 200,000 Ottomans; Barbaro 160,000), Orban's gun (a study's model, 600 kg), the boom, ships over Pera, Giustiniani, Constantine's unknown fate. |
| `wh-453` Christianisation of Armenia | 7 | 5 → 7 | **301 CE is Armenian tradition and 314 is Toumanoff's and Young's**; the "first Christian nation" a title resting on one story written long afterwards (Agathangelos, late 5th century, hagiography). A Nisibis 298 claim dropped; Mashtots's alphabet c. 405 as the later phase. |
| `wh-454` Kingdom of Georgia | 7 | 5 → 7 | **Half the old abstract was about David IV's daughter Tamar of Shirvan and Tevdore's murals**, with a mural date row. Now 1008, Tbilisi taken in 1122, Didgori on 12 August 1121 (the royal chronicle's account), Queen Tamar styled both king and queen (so "king not queen" is unsupported), the Golden Age a historians' label, the Mongols, the 1490 division, the 1801 annexation. |
| `wh-455` Ethiopian Orthodox Church | 7 | 5 → 7 | **"Proclaimed c. 333 CE, read as 340 by the Ethiopian calendar" had no source**: Ezana reigned c. 330 – 360 (Butts), crosses only on his gold coins; Frumentius through Athanasius's letter of 356 and Rufinus's later Latin tale; the Nine Saints tradition; the abuna from Alexandria until 1959; the *Kebra Nagast* an early 14th-century epic, so the Ark story legend. |
| `wh-456` pre-Islamic Arabia | 7 | 5 → 7 | **"From c. 1000 BCE", the Hubal detail and "nearly 8,500 inscriptions" had no source.** Saba attested from c. 800 BCE and gone by c. 275 CE, Himyar leading c. 350 – 570 CE, its turn from the old gods (380 – 384) to Judaism then Christianity; Abraha's dated raid of 552; *jahiliyya* a later label; no source read gives the traditional c. 570 Elephant year. |
| `wh-457` Muhammad | 9 | 5 → 10 | **All five old sources were unreadable**, and a question carried "a century". Born in the Year of the Elephant, which later reckoning equates with about 570 CE; the first revelation, Hijra, Badr, Uhud, the Trench, Mecca and death are tradition's account; the Constitution of Medina; the earliest non-Muslim witnesses (Sebeos, the *Doctrina Iacobi* dated 634 or decades later); the sceptical and minimalist views. |
| `wh-458` Hijra | 7 | 5 → 7 | **Two questions carried 622 and 638**, and "Calendar fixed 17 AH / 638 CE" was a translator's conversion: Donner has the calendar introduced in AH 16, Ibn Ishaq and al-Tabari in 17 or 18. Era begins 16 July 622; the Aqaba pledges; Quba on 12 Rabi' I (24 September 622); the Constitution of Medina composite. |
| `wh-459` Quran | 9 | 5 → 9 | **"Readings fixed: Ibn Mujahid, d. 936" was a death date, and his seven were probably not meant as exclusive** (ten are now canonical). Tradition's two collections (Abu Bakr, Uthman) attributed; the Sanaa palimpsest's different lower text; the Birmingham parchment's 568 – 645 CE as the parchment's date; 14 copies sharing one spelling. |
| `wh-460` Islam | 9 | 5 → 10 | **A question duplicated `wh-463`'s conquests clue and carried years**; a Jordan-inscription claim (dated to the 8th century by Lindstedt) and a revisionist assertion dropped. The line of prophets, hadith (Bukhari d. 870, Muslim d. 874), the four Sunni schools, Pew's 2009 figures (1.57 billion), conversion pace; "called itself the believers" is now one proposal, in the card and the glossary. |

**Read by eye.** *Article:* "the Sack of Constantinople", "the Fall of Constantinople", "the Christianisation of Armenia", "the Kingdom of
Georgia", "the Ethiopian Orthodox Church", "pre-Islamic Arabia"; "Muhammad", "Hijra", "Quran" and "Islam" bare.
*Confusability:* `wh-451`/`wh-452` the two Latin and Ottoman captures, Zara and the horses only on `wh-451`, the boom and Giustiniani only on
`wh-452`; `wh-457`/`wh-458` the man and his move, Badr and the earliest outside accounts only on `wh-457`, the calendar and Aqaba only on `wh-458`;
`wh-459`/`wh-460` the book and the religion, the Sanaa palimpsest only on `wh-459`, the schools of law only on `wh-460`.
*Against other cards:* `wh-436`'s Constantinople dates agree; `rm-502` agrees on the Nabataean annexation of 106 CE. None edited.

**Glossary.** Nine terms rewritten and the *Islam* entry corrected (its "called itself the believers" is now "one proposal
is"); *Quran* already agreed and was kept.

### B47 — `wh-461`–`wh-470`, The Islamic world (2026-10-15)

Run as B46, the religious cards (`wh-461`, `wh-462`, `wh-464`) drafted with each side's account attributed. Pictures
skipped. Checks: `wh-audit.js --range=wh-461:wh-470` clean but for `L.missing` on `wh-466` (the locator request
"Old City of Damascus" was refused and a retry rate-limited) and `wh-468` (a region; none requested); `check-cards` first
flagged "Ibn Umar" in a phrasing of `wh-461` (a companion, but the check reads it as a scholar) and the phrasing now says
"one of Muhammad's companions"; `check-citations --card` 0 mismatched on all ten; the 17 URLs the checker counted non-2xx
are MDPI DOIs (403 to the checker, read as the publisher's PDF and cited by DOI), one PNAS DOI and a Russian journal that
answered 000 once and 200 on a second look. New locators: `wh-467` (between Poitiers and Tours), `wh-470` (the Tigris
plain); a retry also wrote the `wh-431` and `wh-450` locators left open in B44 and B45. `wh-461`'s sources are thin (a CREST guide, a
PhD thesis, two studies using the pillars as a frame) because the open-access religious-studies literature was behind bot
walls; every claim carries a quote read on the page.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-461` Five Pillars of Islam | 8 | 5 → 8 | **All five old sources were MDPI pages (unreadable), two off the term.** "The one rite of entry" is now "the main step"; the Ibn Umar saying with its two versions (the order of fasting and pilgrimage differs); zakat about 2.5 per cent above the nisab; Ramadan the ninth month; 2,489,406 pilgrims in 2019; the Twelver Shia roots and branches and khums. `""` and `undatable`. |
| `wh-462` Rashidun Caliphate | 8 | 5 → 8 | **"Tribes revolted when Abu Bakr, not Ali, was chosen" was the Shia framing**; the Ridda wars are tribes wishing to break ties with Medina. 632 – 661; Uthman's copies of the Quran are tradition (a manuscript study finds one early archetype, another scholar puts the official text under Abd al-Malik); Camel 656, Siffin 657; al-Tabari's reports set side by side. |
| `wh-463` early Muslim conquests | 7 | 6 → 8 | **The old card framed the cause as migration against religion and put Talas and Poitiers in as the end.** Counted 632 – 711 CE; the battle dates differ between Arabic chronicles written 150 – 200 years later and contemporary Syriac notes; war-weariness and the plague debated (one survey finds no clear link); conversion slow and not forced; army sizes dropped. |
| `wh-464` Sunni–Shia split | 8 | 5 → 8 | **A question carried a year and a figure, and a hypothesis about a compiler cutting Ali's remarks on A'isha stood as fact.** Succession accounts attributed to each side, Ghadir Khumm read two ways (mawla), Karbala 680, identities forming gradually, Pew's 87 – 90 and 10 – 13 per cent as Pew's broad ranges. |
| `wh-465` Umayyad Caliphate | 7 | 5 → 7 | **Half the old abstract was Cyprus and the Ifriqiya ribats.** 661 – 750 (one recent book counts the empire from 644); Abd al-Malik's Arabic accounts and all-script dinar of 696 – 697; the Second Fitna (680 – 692); the mawali as a long-standing explanation of the fall; no Sind or Dome of the Rock year (sources conflict). |
| `wh-466` Damascus | 9 | 5 → 9 | **A Damascus-mint claim rested on two coins that "may" be from Damascus or Qinnasrin.** "Oldest still inhabited capital" is a modern author's claim on an older scholar's reading; Thutmose III's list in the 15th century BCE; the Umayyad capital 661 – 750; the Great Mosque 705 – 715; the conquest year disputed (635 or AH 14 – 15); no 732 BCE Assyrian year. `""` and `undatable`. |
| `wh-467` Battle of Tours | 8 | 6 → 8 | **A "Raids end c. 800" row was another event, and a French review (unreadable) carried the abstract.** October 732 (10 or 25 October, 733 an Arabic misdating); the Chronicle of 754 and Fredegar's Continuator; Paul the Deacon's 375,000 against 1,500 flagged doubtful; "saved Europe" a 19th-century moment; the field unnamed (Moussais proposed). |
| `wh-468` al-Andalus | 7 | 5 → 9 | **The question carried 711 and "a frontier for eight centuries" (no source), and the abstract was the Mosque of Córdoba.** 711 by the Chronicle of 754; 756, 929, 2 January 1492; no early mosque has been found over a church; convivencia a hope as well as a description. The taifas, 1031 and the Almoravids dropped (no fetchable source). |
| `wh-469` Abbasid Caliphate | 7 | 5 → 8 | **The old abstract was about Baghdad's Round City and a Jewish academy.** 750 – 1258 CE: the Khurasan revolution, descent from al-Abbas, the Zab, the reported feast massacre (attributed, number dropped); Samarra 836 – 892; real power to the Buyids and Turkish sultans; Baybars's shadow caliph in Cairo. |
| `wh-470` Baghdad | 9 | 5 → 9 | **"About 7 million" and "three rings of wall" were off** (a double wall in Le Strange). Founded 762, finished by 766; the Round City known only from texts; about 500,000 as one estimate; the 1258 toll attributed; the "ink" story not used; Ottoman 1534. |

**Read by eye.** *Article:* "the Five Pillars of Islam", "the Rashidun Caliphate", "the early Muslim conquests", "the
Sunni–Shia split", "the Umayyad Caliphate", "the Battle of Tours", "the Abbasid Caliphate"; "Damascus", "Baghdad" and
"al-Andalus" bare. *Confusability:* `wh-462`/`wh-463`/`wh-464` the first caliphs, their conquests and the split, Uthman's Quran
on `wh-462` only, Ghadir Khumm and Karbala only on `wh-464`, battle dates only on `wh-463`; `wh-465`/`wh-466` the dynasty and
its capital, Abd al-Malik on `wh-465` only, the Great Mosque on `wh-466` (and `wh-477`); `wh-467`/`wh-468` the battle and
the state, the governor killed only on `wh-467`; `wh-469`/`wh-470` the dynasty and its city, the Round City only on `wh-470`.
*Against other cards:* none contradicted; `cnh-376` covers Talas and `wh-469` leaves it out.

**Glossary.** Nine terms rewritten (*Five Pillars*, *Rashidun Caliphate*, *Early Muslim conquests*, *Sunni–Shia split*,
*Umayyad Caliphate*, *Battle of Tours*, *al-Andalus*, *Abbasid Caliphate*, *Baghdad*); *Damascus* already agreed.

### B48 — `wh-471`–`wh-480`, The Islamic world (2026-10-15)

Run as B47 (the usage limit cut the first five agents off mid-batch; each was resumed from its transcript, as the
"Lessons from `wh-301`–`wh-400`" say, and nothing was lost). Pictures skipped. Checks: `wh-audit.js --range=wh-471:wh-480`
clean (ten of ten); `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; of the 12 URLs the checker
counted non-2xx, ten are MDPI DOIs and two a Saudi medical journal's DOIs (403 to the checker, read as publisher PDFs or
Europe PMC copies and cited by DOI). New locators: `wh-477` (Córdoba) and `wh-479` (Islamic Cairo). `wh-478` kept its region.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-471` House of Wisdom | 8 | 5 → 8 | **The old card had it as a grand research academy where Greek and Sanskrit works were turned into Arabic, and "disappears after 833".** Now Gutas's reading (the name is a Sasanian term for a palace library; the early reports show a Persian translator and a scribe there for Harun and al-Ma'mun; none shows Greek translation there) set beside the conventional picture; the 1258 destruction a story. `""` and `undatable`. |
| `wh-472` Islamic Golden Age | 8 | 5 → 8 | **The label is a modern one**, shaped by 19th-century European writers (Qidwai); usually 750 – 1258 CE, narrowly 750 – 850 in a book of 1921. The al-Ghazali myth, the Mongol sack as an exaggerated end, paper (751, one historian's account) and the translation movement; "one book in a thousand survives" (Browne's hyperbole) dropped. |
| `wh-473` al-Khwarizmi | 7 | 5 → 7 | **The date line held the caliph's reign and the *Fihrist*'s date instead of his own.** Lived c. 780 – 850 (neither end firmly dated); his birthplace and the House of Wisdom attributed; "algebra" from *al-jabr*, "algorithm" from the Latin form of his name; predecessors in Egypt, Babylonia, India and Greece; "revise Ptolemy's tables" dropped (one source only). |
| `wh-474` Avicenna | 6 | 5 → 8 | **Born "c. 980" was stated flat**; SEP puts it in the 970s. Now c. 970 – 980, died 1037; the autobiography (completed by al-Juzjani) a literary construction; the Canon c. 1025 and Gerard of Cremona's Latin; the flying man; lists of his works from under a hundred to nearly three hundred titles; a 1544 year and "falls under no genus" dropped. |
| `wh-475` Islamic medicine | 7 | 5 → 7 | **Jundishapur as "immediate parent" and "examined, salaried doctors" were overstated.** The 931 examination order is al-Qifti's, via Browne (Savage-Smith doubts it was carried out uniformly); the first Baghdad hospital's origin uncertain; al-Razi, al-Zahrawi, Ibn al-Nafis (found in Berlin in 1924), Cairo 872 and the Mansuri 1284. |
| `wh-476` Islamic art | 8 | 5 → 8 | **"Figures everywhere except in its mosques" is contradicted by the ship with two men in the Damascus mosaics**; "inhabitants left out" and a writing-only coin reform of 696 dropped. The label is ambiguous (art made by or for Muslims, secular too); the Quran only warns against idols (a museum's account); the quasi-crystalline tilings one study's view. `""` and `undatable`. |
| `wh-477` Great Mosque of Córdoba | 8 | 5 → 9 | **Questions and the date line carried years** (962, 756 – 788); the shared-church story is Ibn Idhari's, written long afterwards, and San Vicente is a live argument. Begun 785 or 786 by different studies; the mihrab wing under al-Hakam II (961 – 971); the cathedral inserted from 1523 with the king's permission. The 856 columns and al-Mansur's 987 – 988 dates had no open source. |
| `wh-478` Fatimid Caliphate | 7 | 5 → 7 | **"Sicily held 909 – 1061" and the Mars naming story as fact had no source** (Fatimid rule in Sicily 909 – 965, Kalbid allies to 1053). 909 declared, 5 January 910 proclaimed; Jawhar's conquest 969, al-Mu'izz in Cairo 973; al-Hakim (1009, 1021, the Druze); the Copts as officials; Saladin in 1171. |
| `wh-479` al-Azhar | 7 | 5 → 7 | **Three of five sources never mention al-Azhar**; the 1901 figures stood as present-tense facts. Built 970 – 972, an official school from 988, the Ayyubids' loss of patronage, Baybars's 1266 restoration, Law 103 of 1961; the name from Fatima only "may"; the oldest-university claim attributed to its makers against the Qarawiyyin's. |
| `wh-480` Sufism | 8 | 5 → 8 | **Half the old abstract was al-Fudayl, Bishr, Ibn Arabi and the Chishti order**, leaving out the name's origin and the central practices. Wool the likely source of the name; Rabi'a (d. 801), al-Hallaj (922), al-Ghazali; the Qadiriyya and Mevlevi orders; dhikr and sama; Salafi criticism stated neutrally. `""` and `undatable`. |

**Read by eye.** *Article:* "the House of Wisdom", "the Islamic Golden Age", "the Great Mosque of Córdoba", "the Fatimid
Caliphate"; "al-Khwarizmi", "Avicenna", "Islamic medicine", "Islamic art", "al-Azhar" and "Sufism" bare. *Confusability:*
`wh-471`/`wh-472` the library and the age, translators on both, Sasanian name only on `wh-471`, the al-Ghazali myth only on
`wh-472`; `wh-473`/`wh-474` the mathematician and the physician; `wh-475`/`wh-474` Canon on `wh-474`, bimaristan on `wh-475`;
`wh-478`/`wh-479` the dynasty and its mosque-school, al-Hakim only on `wh-478`, Law 103 only on `wh-479`; `wh-477`/`wh-468`
Córdoba's mosque and its state. *Against other cards:* `wh-478` has al-Azhar as 972 where `wh-479` has built 970 – 972; none edited.

**Glossary.** Nine terms rewritten (*House of Wisdom*, *Islamic Golden Age*, *al-Khwarizmi*, *Avicenna*, *Islamic medicine*,
*Islamic art*, *Fatimid Caliphate*, *al-Azhar*, *Sufism*); the *Great Mosque of Córdoba* entry already agreed.

### B49 — `wh-481`–`wh-490`, The Islamic world and Medieval Europe (2026-10-15)

Run as B48. Pictures skipped. Checks: `wh-audit.js --range=wh-481:wh-490` clean but for `W.not-why` notes on `wh-487`
and `wh-488`; `check-cards` first flagged same-language sources on `wh-481` (two English articles in Italian-titled
journals) and `wh-489` (English articles in the *Revue belge*, beside one tagged French source), which are now declared in
`SAME_LANGUAGE_OK` with their reasons, as earlier batches did; `check-citations --card` 0 mismatched on nine cards, and
`wh-484` reports one it cannot clear: Crossref prints "Maher Y. Abu-Munshar (Corresponding Author)", where the citation
gives the author's name. New locators: `wh-490` (England, a country-level mark for a kingdom with no single point) and
the retried `wh-466` (Damascus). `wh-481`'s and `wh-482`'s book scans on archive.org are tagged `[Paywalled]` (in
copyright); `wh-486`'s early-20th-century and encyclopaedic sources are the best open ones reached.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-481` Ibn Battuta | 7 | 5 → 8 | **"The Rihla was written in 1356" and "died 1368 or 1377" were wrong**: finished December 1355 (Dunn; 1356 is the earliest manuscript's date), died 1368 or 1369, 1377 one study's figure. The doubts about the Volga, China and Constantinople are attributed (Gibb, Dunn, Almonte); Delhi about eight or seven years; the distance figure dropped. |
| `wh-482` Ibn Khaldun | 7 | 5 → 7 | **"First office 1352 under Abu Inan" and "born 2 May 1332" were wrong**: his first post was at Tunis, and Fez came in 1354; only 1332 is given. His Yemeni descent is "claimed"; the Muqaddima's draft by 1377, the 120-year cycle and the "founder of sociology" label attributed to modern readers; Timur in 1401. |
| `wh-483` Seljuk Empire | 7 | 5 → 7 | **"In 1055 they reunited Muslim Asia from Afghanistan to the Mediterranean" was Malik-Shah's later reach (Humphreys)**; 1055 only ended Buyid rule at Baghdad. Dandanqan 1040; the sultan's title through the caliph's sermon and coinage; Nizam al-Mulk's colleges; fragmentation among princes and atabegs; 1157 ends the eastern line only. |
| `wh-484` Saladin | 9 | 5 → 9 | **Two phrasings carried years, and a proteomics paper was cited for Arsuf.** Born 1137 or 1138 (Ibn Shaddad's year 532); vizier 1169; the Fatimid end (September 1171); Hattin 4 July and Jerusalem 2 October 1187; "the whole Transjordan system abandoned" overstated Vannini, now Shawbak; Richard's courtesy and Saladin's European and Muslim memory. |
| `wh-485` Mamluk Sultanate | 7 | 5 → 7 | **All three phrasings carried years, and "the Bahris on a Nile island until 1382" was wrong**: Roda barracks named the Bahri regiment, and the Burjis were a brigade of Qalawun's mamluks (Barquq founded the line in 1382). 1250 – 1517; the Abbasid in Cairo; Acre, the Black Death and the 1260 battle (a date on Lane-Poole alone). |
| `wh-486` Middle Ages | 9 | 5 → 10 | **Century-only date rows ("15th century", "17th century") replaced**, and Bury's pages were wrong. A label made afterwards (Petrarch, the humanists, Cellarius's 1688 history); conventionally c. 500 – 1500; "Dark Ages" avoided for the early part; the early/high/late boundaries move; awkward outside Europe; the Soviet ending in 1640 – 60. |
| `wh-487` Migration Period | 7 | 5 → 8 | **Ammianus's story of the Huns was fact, and "the Visigoths crossed" was anachronistic.** The usual span c. 375 – 568; the Danube crossing 376; Vandals to Africa 429; the cause debated (the Huns restored to a leading role by some); the groups mixed bands and their size unknowable; cemetery genomes show kin and mixed ancestry. |
| `wh-488` Ostrogoths and Visigoths | 9 | 5 → 9 | **"The Visigoths won Adrianople" read the later names back**: the 4th-century groups were Tervingi and Greuthungi, and the east–west gloss is Jordanes's (from Ablabius). Homoian "Arian" creed; Wulfila's Bible; 376, 410; Italy 489 – 526 and Visigothic Spain 507 – 711; Euric and "the whole west" dropped. |
| `wh-489` Clovis I | 7 | 5 → 8 | **A baptism straight after a 496 war and "the title augustus" stood as fact.** Birth c. 466 from Gregory's age of 45; the Alamanni war traditionally 496, the baptism date disputed (508 proposed); Gregory a Catholic bishop who made Clovis his hero; Syagrius 486, Vouillé 507; the "3,000 baptised" and the Tolbiac name dropped. |
| `wh-490` Anglo-Saxon England | 7 | 5 → 8 | **The term is a later label** (rare after the 10th century, back in the 16th); Bede's three-peoples story of 449 is simplified; the Heptarchy a late-16th-century term. The two genetic figures (38 per cent from ten genomes near Cambridge, up to 76 per cent in eastern England) are kept apart; 597, 627, 664, 731, 927. |

**Read by eye.** *Article:* "the Seljuk Empire", "the Mamluk Sultanate", "the Middle Ages", "the Migration Period", "Anglo-Saxon
England" (question 2: "the story of Anglo-Saxon England"); "Ibn Battuta", "Ibn Khaldun", "Saladin" and "Clovis I" bare.
*Confusability:* `wh-483`/`wh-484`/`wh-485` the Seljuks, the Ayyubid founder and the Mamluks, Hattin only on `wh-484`, Ain Jalut
only on `wh-485`; `wh-486`/`wh-487`/`wh-488` the label, the age of movement and two of its peoples, Adrianople on `wh-488` only,
the humanists only on `wh-486`; `wh-481`/`wh-482` two travellers' books, the Rihla only on `wh-481`, the Muqaddima only on `wh-482`.
*Against other cards:* `wh-465`'s Great Mosque and `wh-466`'s agree on 705 – 715; none edited.

**Glossary.** Ten terms rewritten (*Ibn Battuta*, *Ibn Khaldun*, *Seljuk Empire*, *Saladin*, *Mamluk Sultanate*, *Middle
Ages*, *Migration Period*, *Ostrogoths and Visigoths*, *Clovis I*, *Anglo-Saxon England*).

### B50 — `wh-491`–`wh-500`, Medieval Europe (2026-10-15)

Run as B49, which ends this thread's range: **`wh-401`–`wh-500` are done, and Medieval Europe continues at `wh-501` (B51)** (the rest of Ancient China, Africa and the Americas
in antiquity, Byzantium and the Christian East, the Islamic world and the start of Medieval Europe). Pictures skipped.
Checks: `wh-audit.js --range=wh-491:wh-500` clean but for `L.missing` on `wh-497` (a polity across central Europe, none
requested) and, before a retry wrote its locator, on `wh-491`; `check-cards` all pass; `check-citations --card` 0 mismatched on
all ten; of 81 distinct URLs two were non-2xx (an Italian journal's DOI that answered 000 and a PNAS DOI). New locators:
`wh-491` (Sutton Hoo, marked at the River Deben) and `wh-499` (Holy Island).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-491` Sutton Hoo | 7 | 5 → 9 | **"Ship burial c. 625 CE" had no source I could open**; the latest coins date c. 610 – 635, Rædwald died 624 or 625, excavated 1939. "The two oldest ship graves with Snape" contradicted by Bonde and Stylegar and dropped. The Wuffingas probably buried here; the grave goods; no body (acid soil); the Rædwald link usual but unproven. |
| `wh-492` Christian monasticism | 7 | 5 → 10 | **"Begins in Egypt c. 300 CE" and "Cenobitic rules 6th century" were a bare century and an unsourced start.** Antony in the desert c. 285 – 356 (the *Life* credited to Athanasius, c. 356 – 362), Pachomius c. 292 – 346; Paul of Thebes is Jerome's claim; Iona through Bede; women; hermit against cenobite. |
| `wh-493` Rule of Saint Benedict | 7 | 5 → 7 | **The old card said no dish or drink is banned, not even meat: wrong**, RB 39 withholds the flesh of four-footed animals from the healthy. Written c. 530; Benedict's life only from Gregory's *Dialogues*, an edifying book; 73 chapters; made the one rule of Frankish monasteries 816 – 819. |
| `wh-494` Medieval papacy | 7 | 5 → 10 | **The old card covered only the *Liber Pontificalis*, Gregory I and Charlemagne.** Now Pepin's gift, the Donation of Constantine and its forgery, Canossa and Worms, Innocent III, Avignon and the Schism; an "11th-century" in a question and an unsourced sun-and-moon letter dropped. `""` and `undatable`. |
| `wh-495` Charlemagne | 9 | 5 → 9 | **"Never learned to write" and a Saint-Denis boyhood anointing had no source.** Birth 742 or 748; Verden's 4,500 is the Annals' figure and its size disputed; Roncesvalles was Gascons; the coronation on Christmas Day 800 told by Einhard as unplanned; he practised letters under his pillow too late. |
| `wh-496` Carolingian Renaissance | 8 | 5 → 8 | **"Most classical texts survive via Carolingian copies" had no source.** The minuscule's origin disputed (Tours or Corbie); the schools decree of 789, Alcuin at Tours 796 – 804, the Mars letters of 798. |
| `wh-497` Holy Roman Empire | 8 | 5 → 9 | **A question carried "1356", and a missionary-war duty, a Bryce verdict and a two-century quarrel from 1076 had no source.** Otto crowned 2 February 962 against Charlemagne in 800; the name arriving gradually (1157, 1184, 1254); Voltaire's jibe from his own text; seven electors; Worms 1122; Westphalia; dissolved 6 August 1806. |
| `wh-498` Vikings | 9 | 5 → 11 | **"Most Scandinavians farmed", "not Vikings" and "three centuries later" had no source.** 793 – 1066 as one frame beside c. 750 – 1050; the sources are the victims' and the later sagas; Iceland 870 or 877; Greenland c. 985; L'Anse aux Meadows by tree rings, 1021; the horned-helmet myth; DNA flowing both ways. |
| `wh-499` Lindisfarne raid | 7 | 5 → 7 | **"Wearmouth sacked 794" was a second row (the site is uncertain)**, and two sources said nothing of the raid. The Chronicle's 8 January is a miscount, June is Simeon of Durham's and modern accounts' (8 June); Alcuin's letters; the monks' fates are Simeon's; no homeland named for the raiders. |
| `wh-500` Alfred the Great | 9 | 5 → 9 | **Two phrasings carried 878 and 899.** Born 849 by Asser's account; king 871 – 899; Edington and Guthrum's baptism at Aller; the half-at-home levy is the Chronicle's, not Asser's; the Burghal Hidage date debated; Asser's authenticity argued; the cakes a later legend; "the Great" a later byname. |

**Read by eye.** *Article:* "the Rule of Saint Benedict", "the Medieval papacy", "the Carolingian Renaissance", "the Holy Roman
Empire", "the Vikings", "the Lindisfarne raid"; "Sutton Hoo", "Christian monasticism", "Charlemagne" and "Alfred the Great"
bare. *Confusability:* `wh-492`/`wh-493` the movement and its Rule, Antony and Pachomius only on `wh-492`; `wh-494`/`wh-495`/
`wh-497` pope, emperor and empire, the Donation only on `wh-494`, Canossa on `wh-494` only, Voltaire only on `wh-497`;
`wh-498`/`wh-499`/`wh-500` the people, the first raid and the king who beat them, Alcuin's letters on `wh-496` and `wh-499`;
`wh-490`/`wh-491` the kingdoms and the burial. *Against other cards:* none contradicted; none edited.

**Glossary.** Nine terms rewritten (*Sutton Hoo*, *Christian monasticism*, *Rule of Saint Benedict*, *Medieval papacy*,
*Charlemagne*, *Carolingian Renaissance*, *Holy Roman Empire*, *Vikings*, *Alfred the Great*; *Lindisfarne raid* kept as it stood).

### B51 — `wh-501`–`wh-510`, Medieval Europe (2026-10-21)

Run as B50, from a new thread: **`wh-501`–`wh-600` are this thread's range** (Medieval Europe's last twenty, then East Asia, South and Southeast Asia, Africa and the
Steppe). Pictures skipped (Commons answered "too many requests" to the one call tried). Checks: `wh-audit.js --range=wh-501:wh-510` clean but for
`L.missing` on `wh-509` (a type of building: the agent's Beaumaris pin was removed as a misleading mark for the whole type); `check-cards` all pass;
`check-citations --card` 0 mismatched on all ten; of 80 distinct URLs none was non-2xx. archive.org was unreachable to every agent, so no old archive.org
book was re-read: each source it carried was replaced or the claim dropped.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-501` Vinland | 7 | 5 → 7 | **"Reached c. 1000" and "Last voyage 1121" were wrong in kind.** The one measured date is the wood felled in 1021 (Kuitems et al.); c. 1000 is the sagas' reckoning; 1121 is only the annals' note that Bishop Eric went to look for Vinland, his fate unknown. The sagas are no longer both "13th century" (Wallace dates the Greenlanders' Saga after 1310); Vinland's location is argued. |
| `wh-502` feudalism | 9 | 6 → 9 | **A modern construct was written as a medieval system, and the three date rows were three other events** (Fulbert's letter, a 1970s decade, a span for "institutions"). `""` and `undatable`; Brown, Reynolds, Hyams and Cheyette are named in prose, never in a question; John of Toul's "four lords" corrected and an unsourced kneeling dropped. |
| `wh-503` manorialism | 7 | 5 → 7 | **England's specifics were stated as the rule** (three days' week-work, eight-ox teams, virgates) from Seebohm (1890). Court rolls 1246 – 49 and a manumission of 1278 were single documents, not dates for the system: `""` and `undatable`. Variation by region and the east–west split at the Elbe now carry the card. |
| `wh-504` Norman Conquest | 9 | 5 → 9 | **Question 1 carried "1066" and "twenty more years", and a row was Domesday's (`wh-505`).** Landed 28 September, Hastings 14 October, crowned 25 December; army sizes hedged; Harold's death shown as disputed; the murder-fine law corrected (the killer's lord pays first, then the hundred); the elite's replacement backed by 44 English tenants-in-chief. |
| `wh-505` Domesday Book | 8 | 5 → 8 | **"Finished within the year" and "called Domesday by 1179" had no source I could open.** The National Archives say the scribe's work was halted, perhaps by William's death in 1087; the name is "by the 12th century". Ordered at Christmas 1085 (the Chronicle's Gloucester council), surveyed 1086; purpose argued. Question 2 reworded off its own answer. |
| `wh-506` Crusades | 10 | 6 → 10 | **A row was the First Crusade's (1099) and question 1 gave "popes" for decrees of kings** (1188, 1270). One "usual span" row; the word *cruciata* is not found before the 13th century; Egypt, the Baltic and Languedoc added; the 70,000 casualty figure is Ibn Muyassar's, via Hillenbrand. |
| `wh-507` First Crusade | 8 | 6 → 8 | **"The only expedition that took the city it was called to take" was unsourced, and the Rhineland communities were not "destroyed".** Speyer, Worms and Mainz attacked, with the Encyclopaedia Judaica's figures attributed; the Clermont speech survives only in chronicles written after 1099; motives, Piacenza and the Arabic sources attributed. |
| `wh-508` Knights Templar | 9 | 5 → 9 | **"The council of Vienne abolished the order" was wrong**: Clement V suppressed it by *Vox in excelso* (22 March 1312) without condemning it. Founded 1118 (William of Tyre) or 1119 (Barber); the 13 October 1307 arrests, torture and the 1314 burning; the Friday-13th and treasure legends marked as later. |
| `wh-509` castle | 9 | 5 → 9 | **Century-only rows ("12th", "13th century") and "built in England from 1066" made a type into an English event**: `""` and `undatable`. "The Normans introduced the motte-and-bailey" is hedged (four Herefordshire castles before 1066); defence against status is a modern debate; the unsourced "300 arrow loops" dropped. |
| `wh-510` Gothic architecture | 9 | 5 → 9 | **The three devices were treated as the style's definition**: that is Viollet-le-Duc's 19th-century one, and none began at Saint-Denis. Consecrated 11 June 1144 (two sources); "Gothic" is Vasari's insult; Suger's light theory a modern interpretation; "Notre-Dame iron mid-12th century" dropped. |

**Read by eye.** *Article:* "the Norman Conquest", "the Crusades", "the First Crusade", "the Knights Templar", "the Domesday Book" (questions use "Domesday" as printed); "Vinland", "feudalism", "manorialism", "castle" bare. *Confusability:* `wh-504`/`wh-505` the invasion and its survey, Domesday only on `wh-505`; `wh-506`/`wh-507`/`wh-508` the movement, its first expedition and the order, Clermont only on `wh-507`, the Friday arrests only on `wh-508`; `wh-502`/`wh-503` the lord–vassal tie and the estate. *Against other cards:* `wh-495` (Charlemagne) and `wh-490` (England) unchanged; `ru-` and `cnh-` none touched.

**Glossary.** Ten terms rewritten (*Vinland*, *feudalism* and *manorialism* kept to their general sense, *Norman Conquest*, *Domesday Book*, *Crusades*, *First Crusade*, *Knights Templar*, *castle*, *Gothic architecture*).

### B52 — `wh-511`–`wh-520`, Medieval Europe (2026-10-21)

Run as B51. Pictures skipped. Checks: `wh-audit.js --range=wh-511:wh-520` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; of 86 distinct URLs two were non-2xx (an AEA journal page that answers 000 and one more).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-511` medieval university | 8 | 5 → 8 | **Bologna's 1088 and an unsourced "Orléans walkout 1316" stood as fact.** 1088 is a convention fixed for the 800th anniversary of 1888; "universitas" meant any corporation; Paris statutes 1215 and *Parens scientiarum* 1231; women: only a hedged point, no source for "formally excluded". |
| `wh-512` Thomas Aquinas | 8 | 5 → 8 | **The Summa's start is two dates** (1265, Torrell; 1267, the Stanford Encyclopedia), both stated. Born 1224 or 1225 at Roccasecca; the "straw" remark is Reginald's, reported at the 1319 inquiry; 1277, canonised 1323, doctor 1567; "official Thomism" (1879) shown as a modern revival. |
| `wh-513` Magna Carta | 9 | 5 → 9 | **The jury, habeas corpus and "root of democracy" reading was stated as a 1215 fact**; it is attributed to Coke and the 17th century. The numbering (the old "chapter 61") is Davis's; sealed 15 June, annulled 24 August 1215, confirmed 1297; three chapters are still in force, not two. |
| `wh-514` guild | 9 | 5 → 9 | **Three date rows were three other things**: London c. 930 is a peace gild against cattle theft, Ipswich 1201 and Stendal 1233 single documents. `""` and `undatable`; the 884 capitulary against villeins' gilds added; the Epstein–Ogilvie dispute attributed. |
| `wh-515` Hanseatic League | 8 | 5 → 8 | **The "charter of 17 September 1188" is dated 19 September in its own text, and the surviving text is probably a Lübeck falsification of Frederick II's time**; the "named Hansa 1241" claim dropped. 72 towns in the 1469 list against "more than 200"; first diet 1356 – 58; Stralsund terms from Zimmern 1889 only. |
| `wh-516` Black Death | 9 | 5 → 9 | **The death toll was one flat figure**; now a dispute (a quarter to a third, 40 per cent, up to 60) with whose each is. The Chüy origin and the Caffa tale (one manuscript) marked as argued; the Pistoia day dropped (the page title and text differ); flagellants and China dropped, no source. |
| `wh-517` peasant revolt | 9 | 5 → 9 | **"Peasant" used without caveat**: the rebels of 1381 included craftsmen and local officials, and "Peasants' Revolt" replaced rival names in the 1880s. The 1380 poll tax and the 1349 ordinance as causes; Ball's sermon and Smithfield attributed to Walsingham and the *Anonimalle*; "rustics you are" and the Ciompi left out, no source. |
| `wh-518` Hundred Years' War | 10 | 5 → 10 | **The date row ran from Crécy, a year sat in question 2, and the chroniclers' army figures stood.** Now 1337 – 1453, Brétigny 1360, Troyes 1420; the name is later; Gascony against the dynastic claim; the Salic Law a later justification; the longbow debated. "French historians of the early 19th century" dropped (one blog). |
| `wh-519` Joan of Arc | 9 | 5 → 9 | **"Handed over 14 July 1430" was the bishop of Beauvais's demand in the Burgundian camp**; the English had her after mid-November. Born c. 1412 (the Epiphany birthday uncertain); the voices are her own report; Alençon held command, not Joan; verdict annulled 7 July 1456. |
| `wh-520` Reconquista | 8 | 5 → 8 | **The name is 19th-century, in the Royal Academy's dictionary in this sense only in 1936**; a continuous eight-century project is a later national story. The Cid serving both sides, the taifas and Barbastro added; Covadonga left undated (nothing sourced); the Alfonso III chronicle mislabelled and fixed. |

**Read by eye.** *Article:* "the medieval university" is "the _____" in every phrasing; "the Hanseatic League", "the Black Death", "the Hundred Years' War", "the Reconquista", "the Magna Carta" printed as "Magna Carta" bare; "Thomas Aquinas" and "Joan of Arc" bare. *Confusability:* `wh-516`/`wh-517` the plague and the risings after it, the Ordinance of Labourers only on `wh-517`; `wh-518`/`wh-519` the war and the Maid, Troyes only on `wh-518`, Orléans only on `wh-519`; `wh-513`/`wh-514`/`wh-515` charter, guild and league. *Against other cards:* `wh-486` (Middle Ages) and `wh-499` agree; none edited.

**Glossary.** Ten terms rewritten (*Medieval university*, *Thomas Aquinas*, *Magna Carta*, *Guild*, *Hanseatic League*, *Black Death*, *Peasant revolt*, *Hundred Years' War*, *Joan of Arc*, *Reconquista*).

### B53 — `wh-521`–`wh-530`, East Asia (2026-10-21)

Run as B51, first of East Asia. Pictures skipped. Checks: `wh-audit.js --range=wh-521:wh-530` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on nine and one on `wh-522` that is Crossref's name order, not the cited work: Frontiers' article prints "Hongda Tian" while Crossref has "Tian Hongda" (the article's own copyright line reads "Hongda and Yonghu"); left as cited. Of 65 distinct URLs none was non-2xx. A new locator: `wh-522` (the Grand Canal, marked at Hangzhou). Wikisource, ctext and archive.org were unreachable, so no primary text was re-read for the Chinese cards.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-521` Sui dynasty | 7 | 5 → 7 | **"Took the throne from his grandson" and "Daxing from 583" were loose**: the Northern Zhou emperor was a child; the edict was July 582 and the works done by February 583. The "two million a month" labour claim and the granary levy dropped; the *Book of Sui* was written under the Tang (629 – 636). |
| `wh-522` Grand Canal | 8 | 5 → 8 | **The Shanyang cut is 587, not 595**; "close on 3,000 li" and "Huitong 1289 – 92" had no source (length about 1,794 km; Yuan works 1276 – 1291). Labour figures are given as reported; the 2014 listing cited to papers, not UNESCO. |
| `wh-523` Tang dynasty | 8 | 6 → 8 | **Question stems carried years.** The 754 and 764 register figures belong to `wh-527`; Li Yuan "King of Tang", not "Duke"; the 626 coup, the 690 – 705 Zhou interregnum, the 845 persecution and the Diamond Sutra of 868 added. |
| `wh-524` Chang'an | 9 | 5 → 9 | **"Taken 18 July 756" has no source for the day** (the *Zizhi tongjian* dates the fall unclearly): rows are now 756 (rebels) and 763 (Tibetan sack). The DNA burials lie in the eastern suburbs; the 84 km² and one-million figures are one reconstruction's. |
| `wh-525` imperial examination | 7 | 5 → 7 | **"Already in use by 601", the "1044 edict" and "1870 at Hangzhou" were unsourced or another event.** The start is disputed (605 under the Sui, the Tang, or the late Tang); the Han system is separate (a written test only in 132); Ming form 1384; abolished 2 September 1905; the card's own "one in a hundred" was a calculation. |
| `wh-526` woodblock printing | 8 | 5 → 8 | **"Nothing certainly earlier survives" was wrong**: Japan's Hyakumantō Darani (764 – 770) and the Korean sutra (before 751, argued) are earlier; the Diamond Sutra is the oldest dated *complete* printed book. The origin is unknown; a Sui decree of 593 (Cordier) and "Dunhuang rolls of 947 and 980" dropped. |
| `wh-527` An Lushan Rebellion | 8 | 5 → 8 | **The fall from 52.9 to 16.9 million is a count of registered households (755 and 764, Deng), not of deaths.** The day-level dates for Chang'an (13 and 18 July) rest on sexagenary days and are dropped; Shi Chaoyi's end is 762 (Theobald) or 763. |
| `wh-528` Song dynasty | 8 | 6 → 8 | **The card is now the state alone**: the coinage debate, the Grand Canal and unsourced 1279 details are gone. "Over 100 million" is attributed (and Deng's 115 million is households × 5.77); the Northern Song ends 1127 (Lorge) or 1126 (Theobald); the 1005 payments cited. |
| `wh-529` paper money | 9 | 5 → 9 | **A "1032 cap" and "1068 forgery law" were misdated**: the state office is 1023 and the first series 1024; the 1,256,340 strings is each term's quota with no date; the forgery law belongs to the early Xining years. Private notes from the 990s; huizi 1161; Yuan notes 1260; Marco Polo's wonder attributed. |
| `wh-530` gunpowder | 9 | 5 → 9 | **The old rows implied an invention date.** None is known: earliest surviving recipes 1044, the fire lance 1132, the iron bombs at Kaifeng 1232; a Daoist warning of uncertain date; the "fireworks only" story and the Schwarz legend refuted; the 1221 Qizhou bomb unsourced and left out. |

**Read by eye.** *Article:* "the Sui dynasty", "the Grand Canal", "the Tang dynasty", "the imperial examination", "the An Lushan Rebellion", "the Song dynasty" (question 1 supplies "the" before the blank), "woodblock printing" inside "in _____"; "Chang'an", "paper money", "gunpowder" bare. *Confusability:* `wh-521`/`wh-522` the dynasty and its canal, Yang Di's wars only on `wh-521`; `wh-523`/`wh-524`/`wh-527` the dynasty, its capital and the rebellion, Mawei only on `wh-527`, Zhu Wen's 904 move only on `wh-524`; `wh-525`/`wh-526` examinations and printing, the Diamond Sutra on `wh-523` and `wh-526`; `wh-529`/`wh-530` two Song-era inventions. *Against other cards:* `cnh-343` (Sui, 581 – 618, 589), `cnh-329`/`cnh-339` agree, and `cnh-350` dates the Shanyang cut 587 as here; `jp-088`'s Heian-kyō plan is not repeated; none edited.

**Glossary.** Ten terms rewritten (*Sui dynasty*, *Grand Canal*, *Tang dynasty*, *Chang'an*, *Imperial examination*, *Woodblock printing*, *An Lushan Rebellion*, *Song dynasty*, *Paper money*, *Gunpowder*).

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
| `wh-041` | **locator** not written: neither "Homo naledi" nor "Rising Star Cave" has a primary coordinate |
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
| `wh-229` | the Western Deffufa, Kerma only; a cataract landscape would show the region (locator now at Kerma, 2026-10-04) |
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
| `wh-268` | **locator**: none of "Ugarit", "Ras Shamra" or "Minet el-Beida" has a coordinate |
| `wh-269` | a 1916 line drawing where photographs exist |
| `wh-270` | a 1915 printed hand copy with line numbers |
| `wh-272` | fits, but description names a museum; generic `1920px-thumbnail.jpg` URL (audit `I.duplicate`) |
| `wh-276` | the Egtved clothing, one grave; description names a museum |
| `wh-281` | a lump of casting waste of uncertain age |
| `wh-288` | a 1679 Kircher engraving |
| `wh-295` | the Byrsa panorama, also used by the glossary's *Peace of 201 BCE* (locator now at Byrsa, 2026-10-04) |
| `wh-298` | Chinese spade coins only; an early electrum coin would show the western strand |
| `wh-303` | glazed-brick archers from Susa, not Darius |
| `wh-304` | a generic Persepolis tablet, not the road |
| `wh-308` | the Gate of All Nations, not the king |
| `wh-310` | a crop of the Alexander Mosaic, also `wh-333`'s |
| `wh-313` | the Temple of Zeus at Cyrene, one building in one colony |
| `wh-314` | the Hawara papyrus: fair, but description ties it to a dropped claim and the credit names no author |
| `wh-316` | the Menelaion, a shrine outside the city |
| `wh-317` | a relief of trireme rowers, not the city |
| `wh-318` | fine, but description says the slots hold tickets; they are empty |
| `wh-319` | one serpent head from the Plataea tripod |
| `wh-320` | fine, but description says the Soros covers the 192; it is the mound traditionally held to |
| `wh-323` | a fragment of the tribute lists, titled as such, not the league |
| `wh-325` | an 1842 daguerreotype, dim, titled "The colonnade in 1842" |
| `wh-329` | fine, but its title should read simply Aristotle |
| `wh-330` | one Syracusan quarry, not the war |
| `wh-331` | a papyrus of the Histories, not the man |
| `wh-337` | the Piacenza liver, one divination object (`rm-029`'s subject); **locator**: "Etruria" has no coordinate |
| `wh-339` | a relief of lictors (also `rm-045`'s, audit `I.duplicate`) |
| `wh-340` | the Curia Julia (also `rm-133`'s, audit `I.duplicate`), the senate house rather than the Republic |
| `wh-342` | a 1555 woodcut, also `rm-110`'s (audit `I.duplicate`) |
| `wh-343` | a Nerva denarius showing a later vote, also `rm-071`'s (audit `I.duplicate`) |
| `wh-344` | a census relief, not a legion, also `rm-117`'s (audit `I.duplicate`) |
| `wh-345` | an Aegates ram: apt, but also `rm-199`'s (audit `I.duplicate`) |
| `wh-346` | Barcid coins, also `rm-205`'s (audit `I.duplicate`) |
| `wh-349` | the temple of Apollo at Corinth, also `rm-256`'s (audit `I.duplicate`) |
| `wh-351` | a coin of Sulla alone, also `rm-094`'s (audit `I.duplicate`) |
| `wh-352` | the later amphitheatre at Santa Maria Capua Vetere |
| `wh-354` | a Vercingetorix stater, also `rm-352`'s (audit `I.duplicate`) |
| `wh-355` | a coin of Caesar's celebrating Gaul, not the civil war |
| `wh-358` | a labelled modern map |
| `wh-360` | fine, but the description asserts the unsupported four-layer build |
| `wh-367` | a 19th-century plate of a Column relief, not the emperor |
| `wh-371` | the porphyry tetrarchs, all four rather than Diocletian |
| `wh-372` | the Arch of Constantine, a monument, not the man |
| `wh-380` | the Lumbini pillar, evidence about him rather than the Buddha |
| `wh-384` | a generic punch-marked coin; description names a museum |
| `wh-386` | the Dhauli elephant, a site rather than the king |
| `wh-394` | the Gwalior temple building, not the numerals |
| `wh-398` | a 1935 atlas plate with dated labels, also `cnh-111`'s (audit `I.duplicate`) |
| `wh-401` | Laozi on an ox, a picture of the legend rather than of the term |
| `wh-403` | the caption names the wrong holder and says "printed 1190 to 1193"; the Library of Congress record says National Central Library, a lost original |
| `wh-405` | one Qin coin for a whole dynasty |
| `wh-404`, `wh-406`–`wh-410` | judged from title and description only, not re-viewed |
| `wh-412` | a Ming woodcut with a burned-in caption |
| `wh-413` | a fragment of the Xiping stone classics, a cultural object, not the fall |
| `wh-414` | a torn leaf of the Records, also `ko-089`'s (audit `I.duplicate`); its description dates the script unchecked |
| `wh-417` | an 1826 lithograph with "in 1821" in its title; the glossary's photograph of the royal cemetery is better |
| `wh-419` | one head; **locator** is the Jos Plateau, a region some 100 km from the Nok sites |
| `wh-420` | a map whose description says "fewer than a fifth of the languages" (no source) and whose alt is unchecked |
| `wh-422` | the hand of a mummified baboon, not Punt; the glossary's picture of Hatshepsut's fleet at Punt fits better; **locator** not written (Punt has no primary coordinate) |
| `wh-423` | a foggara at Tala, an irrigation technique, not the trade |
| `wh-424` | a San Lorenzo head; its description says "all seventeen known heads" (unsourced) |
| `wh-425` | one Codex Borgia page, not the culture area; **locator** not written (Wikipedia rate-limited the retry) |
| `wh-427` | one stairway of the South Platform, not the city |
| `wh-428` | the Great Plaza at Tikal, one site |
| `wh-429` | title says Yaxchilan, description says the panel is in Mexico City: unverified |
| `wh-430` | Tres Zapotes Stela C; its description gives a file-name range of 600 – 100 BCE against Stuart's 32 BCE |
| `wh-421`, `wh-426` | judged from title and description only |
| `wh-432` | a laser-scan render of one carving, not the temple |
| `wh-431` | **locator** not written ("Teotihuacan" has no primary coordinate) |
| `wh-436` | a Justinian mosaic, one emperor, not the empire |
| `wh-440` | a dome-only view from below; its description says about 30.6 m where the measured dome is 31.19 × 32.55 m |
| `wh-433`, `wh-434`, `wh-435`, `wh-437` | a single figure, one vessel, one pyramid and the walls: acceptable, a wider view would show more |
| `wh-442` | a micrograph of the bacterium, not the event |
| `wh-443` | a Madrid Skylitzes fire-ship miniature, also `ru-044`'s (audit `I.duplicate`) |
| `wh-445` | Photios before a tribunal, only the 9th-century episode |
| `wh-446` | primates at the 2016 council in Chania, one meeting |
| `wh-448` | the Orans mosaic at St Sophia; its description gives tesserae and height figures no card source has; `wh-448` **locator** is the card's own region |
| `wh-449` | one ceramic icon from Preslav, with no author or licence in its credit |
| `wh-450` | **locator** not written ("Malazgirt" and "Battle of Manzikert" found no coordinate or were rate-limited) |
| `wh-447`, `wh-441`, `wh-444` | description ends on an interpretive clause; judged from title and description only |
| `wh-452` | a 19th-century painting with Greek captions burned in |
| `wh-454` | Gelati's apse mosaic; its description calls Gelati David IV's foundation, which no source on the card gives |
| `wh-455` | the Ezana Stone's Greek face, not the church |
| `wh-451`, `wh-453`, `wh-456`–`wh-460` | judged from title and description only |
| `wh-461` | shows only the hajj, and its description calls the pilgrimage "the fifth of the pillars" (the order varies) |
| `wh-463` | the ribat at Sousse, one small strand, not the conquests |
| `wh-465` | a gold dinar; its description names a museum |
| `wh-466` | **locator** not written (the Damascus request was refused and rate-limited); a courtyard mosaic of the Great Mosque, not the city |
| `wh-462`, `wh-464`, `wh-467`–`wh-470` | one building, shrine or painting each: acceptable, a map would show more |
| `wh-473` | the description carries a shelfmark (and the glossary picture's does too) |
| `wh-476` | one Qusayr Amra painting, not the tradition |
| `wh-477` | only the mihrab niche, not the mosque |
| `wh-480` | one Chishti tomb at Ajmer, not Sufism |
| `wh-471`, `wh-472`, `wh-474`, `wh-475`, `wh-478`, `wh-479` | judged from title and description only |
| `wh-487` | a Darum bracteate, one Scandinavian jewellery type; its description ends on an interpretive clause |
| `wh-488` | a Visigothic votive crown only (the glossary's Domagnano gold is Ostrogothic) |
| `wh-490` | the Sutton Hoo helmet, `wh-491`'s subject; a map of the kingdoms would fit |
| `wh-481`–`wh-486`, `wh-489` | judged from title and description only; no portrait of Ibn Battuta or Ibn Khaldun exists |
| `wh-494` | the Lateran basilica façade, a church and not the office |
| `wh-495` | the Aachen throne, not the man; its description carries an unsourced "six centuries" claim |
| `wh-492` | one monk at a monastery gate, a person and not the movement |
| `wh-496` | one manuscript leaf; its description carries a shelfmark |
| `wh-491`, `wh-493`, `wh-497`–`wh-500` | judged from title and description only |
| `wh-501`–`wh-512`, `wh-516`–`wh-520`, `wh-522`, `wh-526`, `wh-527`, `wh-529`, `wh-530` | kept as they stand after B51 – B53: judged from title and description only, not re-viewed |
| `wh-509` | one Beaumaris view for a whole type; **locator** left out by design (a type of building) |
| `wh-513` | the 1297 confirmation, not the 1215 charter; its description says it was "sent to the sheriffs" (unsourced) |
| `wh-514` | one Nuremberg brewer from a charity's house-book, not a guild |
| `wh-515` | a 19th-century engraving of one episode (Stralsund) |
| `wh-521` | the Anji Bridge, one Sui structure |
| `wh-523` | a portrait of Taizong, not the dynasty |
| `wh-524` | the Daming Palace platform, one part of the city |
| `wh-525` | a print file named "drunk in cell" showing examination cells only |
| `wh-528` | a portrait of the founder, not the state (the glossary's Qingming scroll detail fits better) |
