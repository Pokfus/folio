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
| B54 | East Asia (`wh-east-asia`) | `wh-531`–`wh-540` | 10 | 75 | **done 2026-10-22** |
| B55 | East Asia (`wh-east-asia`) / South and Southeast Asia (`wh-south-asia`) | `wh-541`–`wh-550` | 10 | 89 | **done 2026-10-22** |
| B56 | South and Southeast Asia (`wh-south-asia`) | `wh-551`–`wh-560` | 10 | 76 | **done 2026-10-22** |
| B57 | South and Southeast Asia (`wh-south-asia`) / Africa (`wh-africa`) | `wh-561`–`wh-570` | 10 | 93 | **done 2026-10-22** |
| B58 | Africa (`wh-africa`) | `wh-571`–`wh-580` | 10 | 74 | **done 2026-10-22** |
| B59 | Africa (`wh-africa`) / Steppe empires and the Mongols (`wh-steppe`) | `wh-581`–`wh-590` | 10 | 79 | **done 2026-10-22** |
| B60 | Steppe empires and the Mongols (`wh-steppe`) | `wh-591`–`wh-600` | 10 | 81 | **done 2026-10-22** |
| B61 | The Americas before Columbus (`wh-americas`) | `wh-601`–`wh-610` | 10 | 69 | **done 2026-10-22** |
| B62 | The Americas before Columbus (`wh-americas`) | `wh-611`–`wh-620` | 10 | 68 | **done 2026-10-22** |
| B63 | Renaissance, Reformation and the new science (`wh-renaissance`) | `wh-621`–`wh-630` | 10 | 81 | **done 2026-10-22** |
| B64 | Renaissance, Reformation and the new science (`wh-renaissance`) | `wh-631`–`wh-640` | 10 | 73 | **done 2026-10-22** |
| B65 | Renaissance, Reformation and the new science (`wh-renaissance`) | `wh-641`–`wh-650` | 10 | 81 | **done 2026-10-22** |
| B66 | Renaissance, Reformation and the new science (`wh-renaissance`) / Voyages, conquest and exchange (`wh-voyages`) | `wh-651`–`wh-660` | 10 | 81 | **done 2026-10-22** |
| B67 | Voyages, conquest and exchange (`wh-voyages`) | `wh-661`–`wh-670` | 10 | 76 | **done 2026-10-22** |
| B68 | Voyages, conquest and exchange (`wh-voyages`) | `wh-671`–`wh-680` | 10 | 73 | **done 2026-10-23** |
| B69 | Voyages, conquest and exchange (`wh-voyages`) / The gunpowder empires (`wh-gunpowder`) | `wh-681`–`wh-690` | 10 | 80 | **done 2026-10-23** |
| B70 | The gunpowder empires (`wh-gunpowder`) | `wh-691`–`wh-700` | 10 | 78 | **done 2026-10-23** |
| B71 | The gunpowder empires (`wh-gunpowder`) | `wh-701`–`wh-710` | 10 | 72 | **done 2026-10-23** |
| B72 | Ming and Qing China, Tokugawa Japan (`wh-ming-qing`) | `wh-711`–`wh-720` | 10 | 80 | **done 2026-10-23** |
| B73 | Ming and Qing China, Tokugawa Japan (`wh-ming-qing`) / Slavery and the Atlantic world (`wh-slavery`) | `wh-721`–`wh-730` | 10 | 78 | **done 2026-10-23** |
| B74 | Slavery and the Atlantic world (`wh-slavery`) | `wh-731`–`wh-740` | 10 | 75 | **done 2026-10-23** |
| B75 | Slavery and the Atlantic world (`wh-slavery`) / The age of revolutions (`wh-age-of-revolutions`) | `wh-741`–`wh-750` | 10 | 76 | **done 2026-10-23** |
| B76 | The age of revolutions (`wh-age-of-revolutions`) | `wh-751`–`wh-760` | 10 | 65 | **done 2026-10-23** |
| B77 | The age of revolutions (`wh-age-of-revolutions`) | `wh-761`–`wh-770` | 10 | 72 | **done 2026-10-23** |
| B78 | The age of revolutions (`wh-age-of-revolutions`) / The Industrial Revolution (`wh-industrial`) | `wh-771`–`wh-780` | 10 | 79 | **done 2026-10-23** |
| B79 | The Industrial Revolution (`wh-industrial`) | `wh-781`–`wh-790` | 10 | 82 | **done 2026-10-23** |
| B80 | The Industrial Revolution (`wh-industrial`) | `wh-791`–`wh-800` | 10 | 77 | **done 2026-10-23** |
| B81 | Nations, ideologies and reform (`wh-nations`) | `wh-801`–`wh-810` | 10 | 76 | **done 2026-10-23** |
| B82 | Nations, ideologies and reform (`wh-nations`) | `wh-811`–`wh-820` | 10 | 103 | **done 2026-10-23** |
| B83 | Nations, ideologies and reform (`wh-nations`) / Empire and the colonised world (`wh-imperialism`) | `wh-821`–`wh-830` | 10 | 94 | **done 2026-10-23** |
| B84 | Empire and the colonised world (`wh-imperialism`) | `wh-831`–`wh-840` | 10 | 98 | **done 2026-10-23** |
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

**Lessons from `wh-601`–`wh-800`.**
- **Fifteen agents at once is fine** (two cards each, general-purpose, background), and a batch is applied in the
  background (`batch.sh … > log; echo FIN >> log`) while the next is read; commit and push after every batch.
  `batch.sh` takes about ten minutes for its citation check.
- **`precheck.js` passes drafts that the house rules reject.** Read every draft with `.claude/wh-refine/tools/`
  (`review.js`): a full stop after the markers as well as before them (`fixpunct.js`), a clue that contains the
  answer's own word (`wh-736` "African" beside "Royal African Company", `wh-759` "declaration"), a year left in
  a question, a mean sentence length over 28.5 after a word is added to an abstract (trim elsewhere), a
  date-line row that is another event's date.
- **A translated book is catalogued under its translators** (`check-citations`: `wh-710`), and a journal issue
  Crossref dates a year late wants "(2020, published 2021)" (`wh-745`).
- **Quotation and legend discipline held up**: the speech or letter is attributed to the person it came from
  (Byron on juries, "we possess all things", Kant's answer to *Was ist Aufklärung*), and a remark no source
  gave (the "defend to the death" line, Napoleon on the Code, "ploughed the sea") is left out, not hedged.
- **Sources that answered**: Gutenberg texts, Europe PMC, Cambridge/Brill abstracts, museum and national-archive
  pages, H-France Salon, Library of Congress records; **blocked**: Britannica, Wikisource, JSTOR, Project MUSE,
  OUP and Wiley journal pages, Mount Vernon, Smithsonian. Wikimedia Commons still refuses this sandbox, so
  `wh-601`–`wh-800` have had no picture pass.

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

### B54 — `wh-531`–`wh-540`, East Asia (2026-10-22)

Run as B53. Pictures skipped. Four of the five agents were cut off by a usage limit and resumed by id the next morning; the saved pages and drafts survived. Checks:
`wh-audit.js --range=wh-531:wh-540` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on eight and one each on `wh-531` and `wh-537`, both a name-order case, not a wrong citation:
Crossref prints "Xing Huang" and "Ikeda Yoshifumi" where the works print "Huang Xing" and "Yoshifumi Ikeda", so the citations follow the works; 9 of 81 distinct URLs were non-2xx, all
Japanese or Korean repository and journal downloads (`otani.repo.nii.ac.jp`, `nirc.nanzan-u.ac.jp`) that the agents read through other copies. The markers in the Think-it-through answers of `wh-519`, `wh-541` and `wh-542`
sat before the full stop; moved after it (`wh-519` re-applied).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-531` compass | 9 | 5 → 10 | **Shen Kuo was no longer "the oldest description", and "Europe c. 1190" named the wrong poet.** A Song military manual already floats an iron fish that points south; Neckam (c. 1187, Price) is earlier than Guyot (c. 1208). "At sea by 1119" is written use, from Zhu Yu's notebook; the Han "spoon" is a 1940s reconstruction. |
| `wh-532` movable type | 8 | 5 → 8 | **"60,000 wooden pieces" was the length of the gazetteer Wang Zhen printed, not his type** (his postscript says about 30,000). Bi Sheng's "invented 1041 – 1049" is Shen Kuo's report alone; Wang Zhen c. 1297, not 1298; type never displacing blocks is a modern explanation. |
| `wh-533` Neo-Confucianism | 7 | 5 → 7 | **The name is a Western label for Daoxue and Lixue**, traced to a Latin phrase in Paris in 1687; "school formed c. 1050 – 1200" is replaced by Shao Yong's birth to Zhu Xi's death, the 1196 ban and the 1313 Yuan examination decree. Modern blame for East Asian rigidity is attributed. |
| `wh-534` porcelain | 9 | 6 → 9 | **"Process published 1856, in French" and "named c. 1470 in Venice" were other events.** "True porcelain" is a Western definition (Chinese does not separate it from stoneware); Marco Polo's cowrie *porcellani* attributed; Meissen (1709 – 10) came before the Jesuit's letters; the Belitung wreck is mostly Changsha stoneware. |
| `wh-535` Yuan dynasty | 8 | 5 → 8 | **"Capital Dadu from 1264" was loose**: Khubilai took the old city in 1264, began the new one in 1267, and the Annals date the renaming to 1272. The four-class system is a disputed modern reading; the Yaishan story and "broke with every dynasty" dropped. |
| `wh-536` Marco Polo | 9 | 5 → 9 | **Whether he reached China is attributed by view** (Wood's case, via Jackson; Rossabi; Vogel). The "Millioni" name is three accounts, a 1305 record already naming him; the Yangzhou and Xiangyang claims flagged; the deathbed "not half" story is d'Acqui's report; question 1 lost a numeral. |
| `wh-537` Mongol invasions of Japan | 8 | 5 → 9 | **"Only 13,500 returned" was backwards** (up to 13,500 lost). Khubilai's letter is dated 1266 and reached Hakata in 1268; exact days dropped (calendars differ); fleet sizes attributed; the kamikaze is Japanese tradition; Suenaga's scroll shows no typhoon; the Hakata wall and Takashima wrecks added. |
| `wh-538` Muromachi period | 7 | 5 → 8 | **The name comes from a district that held the Ashikaga offices only after 1378**; "first overseas trade" was wrong (Ming relations resumed in 1401, the investiture a study's reading); the eight-lords and "180,000 families" figures dropped; the Sengoku usually starts in 1493 (see `wh-721`). |
| `wh-539` Zen | 9 | 5 → 9 | **c. 520 for Bodhidharma was a legend's date.** `""` and `undatable`; the patriarch line is attributed to tradition, Eisai 1191 and Dōgen 1223 – 27 to Sōtō sources, and "the religion of the samurai" to the 20th century. |
| `wh-540` Goryeo | 9 | 5 → 9 | **"Capital Songdo" was Gaegyeong (919).** The Yuan shi's "27 kings" is not the whole dynasty; the Khitan wars, the Ganghwa move in 1232 and celadon are sourced; the Japan-fleet figures dropped; the Tripitaka years and "Korea" from Goryeo are not stated (no readable source). |

**Read by eye.** *Article:* "the Yuan dynasty", "the Mongol invasions of Japan", "the Muromachi period" bare of the article in phrasings that supply it, "the _____" kept for "the kingdom of" in `wh-540`; "compass", "movable type", "porcelain", "Zen" with "the" only where the phrasing needs it. *Confusability:* `wh-531`/`wh-532` the compass and movable type are told apart by Shen Kuo's two reports; `wh-532` against `wh-541` (Korea's metal type, Cheongju); `wh-535`/`wh-536` the dynasty and the traveller; `wh-537`/`wh-538` the invasions and the period that followed. *Against other cards:* `cnh-459`/`cnh-460` (Neo-Confucianism, 1196) and `cnh-980` (Shen Kuo c. 1088 against this card's c. 1087, one source's figure) agree to within a year; `ko-016` and `ko-087` agree on Goryeo; `jp-` has no card for the Mongol invasions or Muromachi; none edited.

**Glossary.** Ten terms rewritten (*Compass*, *Movable type*, *Neo-Confucianism*, *Porcelain*, *Yuan dynasty*, *Marco Polo*, *Mongol invasions of Japan*, *Muromachi period*, *Zen*, *Goryeo*).

### B55 — `wh-541`–`wh-550`, East Asia and South and Southeast Asia (2026-10-22)

Run as B54, with all ten agents cut off by the usage limit in turn and resumed by id; a second agent rebuilt `wh-547` and `wh-548` from scratch because the first left no usable pages. Pictures skipped.
Checks: `wh-audit.js --range=wh-541:wh-550` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on eight and one each on `wh-541` and `wh-547`, both Crossref's
given-name-first against the works' family-name-first ("Jae-jeong Lee", "Ky Phuong Tran"), so the citations follow the works; 4 of 74 distinct URLs were non-2xx (the IEP's Ramanuja page answers 500 to the bot but opened for the agent).
archive.org was unreachable to every agent, so the old Murdoch, Smith, Juzjani, Barani and similar sources are replaced or the claim dropped.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-541` Korean metal movable type | 7 | 5 → 7 | **A Joseon king's 1403 type had been made "the first".** It is a Goryeo invention: 1234 is the earliest record (the *Sangjeong yemun*, a report, not a surviving book); the *Jikji* (Cheongju, 1377) is the oldest surviving, and only its second volume is known. The Joseon dates (1403, the 1434 fount) follow; the Gutenberg link is not claimed. |
| `wh-542` Heian period | 8 | 5 → 8 | **"Kamakura 1192" was another card's row.** The period runs 794 – 1185 and ends with the Genpei War (1180 – 1185); 1192 and 1180 are alternative endings. The Fujiwara regency, the end of the missions to China (838, 894) with the "turned inward" reading hedged, kana, Tendai and Shingon, and the warrior side set against the "peaceful" label. |
| `wh-543` Genji Monogatari | 8 | 5 → 9 | **"Written c. 1004" had no source.** The date line is the 1008 diary (it reads a passage of the tale) and the 1020 *Sarashina* diary's copy. Authorship, order, "the first novel" and the later scroll are attributed or hedged; the two text lines (Teika, Kawachi) are stated. |
| `wh-544` samurai | 9 | 5 → 9 | **A tax-exemption thesis and a "streets of Kyoto" claim had no source.** *Saburau* 'to serve': the word named palace attendants before it named the class; the levies ended in 792; the Gempei War; bushidō as a later construction (Nitobe attributed); abolition in 1871, swords banned 1876, Satsuma 1877. |
| `wh-545` Kamakura shogunate | 7 | 5 → 7 | **1185 was stated as the founding year and sat in a question.** The line is 1180 – 1192 with whose date each is in prose (Yoritomo's base 1180, the appointments of constables and stewards 1185, *shōgun* 1192); Jōkyū 1221, Jōei Code 1232, the end in 1333; the cost of the invasions argued, not stated. |
| `wh-546` Harsha | 7 | 5 → 7 | **Troop figures, the Prayāga distribution and his age were unsourced.** The Madhuban plate on the brother's death; the Aihole poem read as a rival's praise (it names the Vindhya, not the Narmada, and carries no battle date); the Harsha era (year 8 = 614 – 15); his faith read from sources that disagree. |
| `wh-547` Chola dynasty | 7 | 5 → 7 | **"Imperial period 985 – 1279" and "overseas campaign 1025 – 1027" had no firm source.** Named in Ashoka's edicts, then all but forgotten; the medieval revival with Vijayalaya (the 9th century by one editor's reckoning, no firm year); the Kadaram raid c. 1025 placed at Kedah, its motive marked as debated; the Tanjore record of 1030 – 31. |
| `wh-548` Delhi Sultanate | 7 | 5 → 7 | **Barani, Ibn Battuta and Afif claims were stated flat**, and "five dynasties" had no source that counts them. Aibak was only a *malik* in 1206; Razia; Alauddin Khalji 1296 – 1316 replaces "price regulations 1290s – 1310s", with Barani attributed against other contemporaries' motives; "theocracy" attributed to one study. Sources 5 and 6 are weak (course slides, a student journal). |
| `wh-549` Vijayanagara Empire | 7 | 5 → 7 | **The foundation stories were stated as fact.** c. 1336 is traditional; the Vidyāraṇya and the Delhi-captive stories are Sewell's rival tales; Razzaq's and Paes's accounts are visitors' reports; the "Hindu bulwark" frame set against sultans who fought one another; Talikota (1565) did not end the state (a rump at Penukonda). Three modern sources are read from abstracts. |
| `wh-550` bhakti | 7 | 5 → 7 | **"Northern poets 15th – 16th centuries" was a century alone.** `""` and `undatable`; "the Bhakti movement" is attributed to Hawley and others as a modern gathering; Ramanuja is 1017 – 1137 by tradition, 1077 – 1157 recently; the unsourced "travelling between shrines" dropped. |

**Read by eye.** *Article:* "the Heian period", "the Kamakura shogunate", "the Chola dynasty", "the Delhi Sultanate", "the Vijayanagara Empire" (the three phrasings of `wh-549` were missing "the" before the blank and were mended), "the samurai"; "Harsha", "bhakti", "Genji Monogatari" bare. *Confusability:* `wh-542`/`wh-544`/`wh-545` the age, the warriors and the first warrior government, the Gempei War on `wh-542` and `wh-544` only as a boundary; `wh-543` against `wh-542` the tale only; `wh-547`/`wh-548`/`wh-549` three southern or northern states told apart by Tanjavur, Delhi and Hampi; `wh-541` against `wh-532` Korea's type against Bi Sheng's. *Against other cards:* `jp-` has no card for these (the Japan deck stops at `jp-092`); `in-` is empty; `cnh-` none contradicted; none edited.

**Glossary.** Nine terms rewritten (*Metal movable type*, *Genji Monogatari*, *Samurai*, *Kamakura shogunate*, *Harsha*, *Chola dynasty*, *Delhi Sultanate*, *Vijayanagara Empire*, *Bhakti*); *Heian period* kept as it stood.

### B56 — `wh-551`–`wh-560`, South and Southeast Asia (2026-10-22)

Run as B55 (five agents cut off by the usage limit and resumed by id). Pictures skipped. Checks: `wh-audit.js --range=wh-551:wh-560` clean but for `L.missing` on `wh-552` until its locator
was written on a retry (the first `add-locators` run was rate-limited); `check-cards` first flagged `wh-560` question 3 ("Oc Eo" read as a scholar's name; the place is now "a port in the Mekong delta"), then all pass;
`check-citations --card` first reported `wh-551` (Cambridge prints 2010, Crossref dates the chapter 2000: now "2010; published online 2000") and `wh-558` (the 1971 issue Crossref dates 1972: now "1971, published 1972"),
both now 0 mismatched; 6 of 71 distinct URLs were non-2xx. archive.org was unreachable to every agent. The Think-it-through markers on this batch were all after the full stop.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-551` Islam in India | 8 | 7 → 8 | **"Sind conquered 712" is one count of 711 – 713** (Lapidus; Arnold has 714); the Chachnama is a 13th-century Persian text claiming to translate an Arabic one, some read it as political thought; the Cheraman Perumal mosque is tradition only; Tarain 1191 and 1192; how far conquest, preaching and social advantage explain conversion is attributed by view. The old "zimmi terms" claim dropped. |
| `wh-552` Indo-Islamic architecture | 7 | 5 → 7 | **"Never built an arch" was a Fergusson (1891) view stated as fact**; now attributed. The Quwwat-ul-Islam mosque is dated 1191 – 1196 and the Alai Darwaza 1310 – 1311, with whose figure is whose; the Taj Mahal row dropped (a Mughal building); Indo-Saracenic is a different, colonial style. New locator (the Qutb complex). |
| `wh-553` Indian Ocean trade | 8 | 5 → 9 | **"Classical period 300 BCE – 400 CE" was one study's own definition and "14th century" a century alone**: `""` and `undatable`. The Hippalus story is the *Periplus*'s, Pliny's 550 million sesterces is his claim; the Cairo Geniza letters and Zheng He added; the "one ocean world" framing is carried by named authors, not stated. |
| `wh-554` Srivijaya | 6 | 5 → 7 | **Yijing's "more than 1,000 priests" is from his *Record* of about 691 – 692, not the visit of 671.** The stones are 682 – 686 (Kedukan Bukit 682 or 23 April 683); the capital at Palembang is disputed (Muara Takus, Jambi); Sanfoqi = Srivijaya rests on convention; the "15th century" and 1178 rows dropped; the Chola raid of 1025. |
| `wh-555` Majapahit | 6 | 5 → 7 | **"Chinese account 1416" and "Islam c. 1475" had no source.** The *Yuan shi*, the *Nagarakretagama* (1365) and the *Pararaton* (c. 1500, with Gajah Mada's oath) are attributed to their sources; the empire's reach and its end (1478 once read as the end; a Demak attack in 1519 by one account) are argued. |
| `wh-556` Khmer Empire | 7 | 5 → 7 | **Jayavarman VII's "1162 – 1201" was wrong: 1181 – 1218.** 802 is a "reported start", from an inscription of the 11th century; the 700,000 – 900,000 population is Klassen's model; the droughts are the tree-ring study's; the Yuan envoy's account attributed. |
| `wh-557` Angkor Wat | 8 | 5 → 8 | **"Largest religious monument", a 220 m moat and 18 – 20,000 figures had no source** (the moat is about 200 m). Built under Suryavarman II (reign from 1113, died about 1150); the astronomical reading is "one scholar's"; Buddhist monks tended it and pilgrims left texts 1541 – 1747, so it was never lost to Mouhot. |
| `wh-558` Pagan Kingdom | 7 | 5 → 8 | **"The Mongols occupied Pagan in 1287" and a three-month siege had no source.** 1044 and 1287 are usual dates; 1057 is the chronicle's date for Thaton (whose remains are Hindu, not Buddhist); 1284 the annals' date for the king's flight; the Lokananda and Ananda dates dropped. |
| `wh-559` Đại Việt | 6 | 5 → 7 | **"Independence 940" is 938 (the Bạch Đằng victory) and 939 (Ngô Quyền's kingship).** Đại Cồ Việt 968; Đại Việt named in 1054 by the annals, doubted by one Vietnamese historian; Ming rule 1407 – 1428; Toda's numismatic book and "Annam 502" dropped. The glossary's end year (1804) has no source and is left out. |
| `wh-560` Indianisation | 6 | 5 → 6 | **A modern concept was treated as a process**: Coedès's word, criticised by Wolters, Mabbett and Vickery as casting the region as a passive recipient. `""` and `undatable`; the "earliest gold" row (a literary Suvarnabhumi) dropped; Oc Eo evidence kept. |

**Read by eye.** *Article:* "the Pagan Kingdom", "the Khmer Empire", "the Indo-Islamic architecture" bare where a phrasing supplies none; "the Srivijaya" avoided; "Majapahit" and "Angkor Wat" bare with "the temple of _____"; "Islam in India" and "Indianisation" bare. *Confusability:* `wh-554`/`wh-555`/`wh-556` three states by their sources (inscriptions of Sumatra, the Pararaton, Zhou Daguan); `wh-556`/`wh-557` the state and its temple, lidar dropped from `wh-556`; `wh-553` against `wh-563`/`wh-564` the ocean's trade, spices and the ship; `wh-551`/`wh-552` the faith and its buildings. *Against other cards:* `in-` is empty, `cnh-` none contradicted; none edited.

**Glossary.** Ten terms rewritten (*Islam in India*, *Indo-Islamic architecture*, *Indian Ocean trade*, *Srivijaya*, *Majapahit*, *Khmer Empire*, *Angkor Wat*, *Pagan Kingdom*, *Đại Việt*, *Indianisation*).

### B57 — `wh-561`–`wh-570`, South and Southeast Asia and Africa (2026-10-22)

Run as B56. Pictures skipped. Checks: `wh-audit.js --range=wh-561:wh-570` clean but for `S.chip?` on `wh-570` (a false positive: Aradeon's article is in English, and the heuristic trips on "des" in the *Journal des africanistes*);
`check-cards` first flagged `wh-565`'s mended question (it ended on the blank, then ran over 34 words; now 34); `check-citations --card` 0 mismatched on all ten; of 67 distinct URLs one was non-2xx (a Wiley DOI that answers 403 to the bot; the agent read the abstract through OpenAlex and cites the DOI).
The Think-it-through markers of all ten sat after the full stop. Sources that archive.org carried were replaced or the claim dropped.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-561` Borobudur | 8 | 6 → 8 | **The 1814 clearing was cited to Raffles, who never mentions it**: now Krom (1927), Cornelius and more than 200 workers, with the hill's name already in a 1709 – 10 report. The hidden foot was buried by the builders, not sealed in 1907 – 11. The "c. 780 – 850" span is attributed (c. 780 start; 750 – 850 in a 2024 study; Krom's reading of the base inscriptions). Unsourced 504, 2,672, 1.6 million and the mandala reading dropped. |
| `wh-562` Anuradhapura | 7 | 5 → 7 | **"Capital c. 437 BCE" is the chronicle's reckoning and no source prints it.** The line starts at the archaeological village (8th century BCE); Geiger's table uses 483 BCE and Deeg begins the period in 377 BCE; the end is 993 (Rajaraja, Sastri) to 1017 (Geiger), with a slow decline in excavation; Fa-Hien's visit has no date of its own (the journey 399 – 414). |
| `wh-563` spice trade | 8 | 7 → 8 | **Barbosa's account and the fall of Malacca were other cards' rows**: `""` and `undatable`. Pliny's prices are his report, set against a modern price study; the "spices hid rotten meat" story is rebutted; the Terqa cloves are the excavators' report; "Venice held a monopoly" has no source and is dropped; the Age of Discovery is a debate. |
| `wh-564` dhow | 8 | 6 → 8 | **"Sewn hulls recorded c. 50 CE" and "seen at Hormuz c. 1290" were two reports made into dates**: `""` and `undatable`. The lateen is unsettled (one team calls an ancient Indian Ocean lateen a myth; Mediterranean pictures show it by late antiquity); Polo's account is his own; the Belitung ship is 9th-century with a disputed origin. |
| `wh-565` Malacca Sultanate | 7 | 6 → 9 | **"Chinese recognition 1409" is Ma Huan's version of the seals alone**: the *Shilu* has Yin Qing sent in 1403 and the ruler made king in 1405. The Malay Annals (which one scholar dates to 1536), Ming records and Pires disagree on the beginning; conversion and Parameswara = Iskandar Shah are disputed; the day of the 1511 capture is not given. |
| `wh-566` Ghana Empire | 7 | 6 → 7 | **The Almoravid conquest of 1076 is a claim, not an event**: Masonen and Fisher call it a myth, and Conrad and Fisher find the dating source dubious. The line is Awdaghust 1054, al-Bakri c. 1067 and the claim marked disputed; "Ghana" was the king's title (Wagadu is the oral name, linked in the late 19th century); Koumbi Saleh is unproven. |
| `wh-567` Sijilmasa | 6 | 5 → 6 | **The "910 – 934 dinars" row was al-Mahdi's reign, and "deserted by c. 1526" was wrong** (building continues into the 18th century): now the revolt c. 1393 and Leo seeing ruins c. 1510. Ibn Battuta left 14 February 1352 (Beckingham's footnote; Villar has 18); the Taghaza crossing is ten days, not twenty; the 64 km wall is Leo's; the coin study does not show West African isotopes. |
| `wh-568` Mali Empire | 8 | 5 → 8 | **Wali's pilgrimage "under Baybars" and a Musa row had no source**; "under Songhai by the early 16th century" is Timbuktu lost c. 1433 and Gambia still held in 1594. The Kirina date (c. 1235) and the Manden Charter are attributed; Ibn Battuta's gift was beef, not fish. The Almoravid capture of Ghana (see `wh-566`) left out of the abstract. |
| `wh-569` Sundiata Keita | 7 | 5 → 7 | **"Reconstructed c. 1230 – 1255", "son's pilgrimage 1259 – 1276" and "the 1390s" had no source**: `""`. Ibn Khaldun is cited for what he reports (the name Mari Jata, a lion-prince); the epic is oral tradition, Niane's French text partly its editor's creation, set against Jansen's nearer-to-performance edition. |
| `wh-570` Mansa Musa | 8 | 5 → 8 | **"Met al-Sahili at Mecca" and a PLOS isotope source were unsupported.** Reigned c. 1312 – 1337, pilgrimage 1324 – 1325; the gold and entourage figures are attributed ranges (80 or 100 loads; 12,000 or "more than 10,000" followers); the fall in the price of gold is al-Umari's; al-Sahili's role is a later tradition one architectural historian calls a myth. |

**Read by eye.** *Article:* "the spice trade" (all three phrasings supply "the"), "the Malacca Sultanate" and "the Mali Empire" with "the" before the blank; "Borobudur", "Anuradhapura", "Sijilmasa", "Sundiata Keita", "Mansa Musa" bare; "dhow" after "a" or "the" as the phrasing needs. *Confusability:* `wh-566`/`wh-568`/`wh-569`/`wh-570` the earlier state, the later one, its founder-hero and its famous king, told apart by al-Bakri, Ibn Battuta, the epic and the Cairo pilgrimage; `wh-563`/`wh-564` goods and ship; `wh-561`/`wh-562` a Buddhist monument in Java and a Buddhist capital in Sri Lanka. *Against other cards:* `wh-481` (Ibn Battuta) dates his departure from Sijilmasa as here ("February 1352"); `wh-482` (Ibn Khaldun) agrees on what he reports of Sundiata; `wh-566` and `wh-568` now agree that the 1076 conquest is not asserted; none edited.

**Glossary.** Ten terms rewritten (*Borobudur*, *Anuradhapura*, *Spice trade*, *Dhow*, *Malacca Sultanate*, *Ghana Empire*, *Sijilmasa*, *Mali Empire*, *Sundiata Keita*, *Mansa Musa*).

### B58 — `wh-571`–`wh-580`, Africa (2026-10-22)

Run as B57. Pictures skipped. Checks: `wh-audit.js --range=wh-571:wh-580` clean but for `W.not-why` on `wh-580` (question 3 opens on Afonso's letter, not "Why", as `wh-487` and `wh-488` did);
`check-cards` all pass; `check-citations --card` 0 mismatched on all ten; of 65 distinct URLs none was non-2xx. No locator needed (all ten kept theirs). archive.org was unreachable to every agent.
Five of the ten cards rest on Cambridge or other abstract pages for some sources (named in each draft's notes), so their "Open access" tags are fewer than the bar's usual half.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-571` Timbuktu | 9 | 5 → 9 | **"Under Mali from 1336" was a chronicle's count, and the Tarikh has Musa taking the town c. 1325 on his way home.** The founding about 1100 is al-Sa'di's story (labelled "said founded"); "university" and "golden age" are attributed; no 700,000 or 25,000 figure, only the inventoried and estimated manuscript counts; the Ibn Battuta source had no Timbuktu passage and is cut. |
| `wh-572` Songhai Empire | 8 | 7 → 8 | **Sonni Ali is 1464 – 1492, not 1468 (when he took Timbuktu).** Tondibi is March 1591 (every source but the *Tarikh es-Soudan*, which has 12 April); the *Tarikh al-fattash*'s authenticity is debated (a why answer); troop figures and a claim about Moroccan guns dropped, no source read. |
| `wh-573` Kanem–Bornu | 6 | 5 → 7 | **The 1391 letter to Cairo is al-Qalqashandi's (794 AH), not al-Umari's**, and "1242 – 1252 Cairo college" is only a translator's footnote citing al-Maqrizi: dropped. Hume's conversion (1086 – 97) and Idris Alooma (1571 – 1603) are Barth's dates, followed by Palmer; "a thousand years" and Leo "c. 1515" dropped. |
| `wh-574` Hausa Kingdoms | 7 | 5 → 7 | **The Kano Chronicle gives reign lengths only: 1349 – 1385, 1438 and 1463 – 1499 are Palmer's reckoning back from 1807**, from a manuscript of the 1880s, and the snake story is Palmer's introduction. "Fulani next reign" was wrong; the 1513 Songhai raid is a translator's note, not Leo's date. |
| `wh-575` Kingdom of Benin | 8 | 5 → 10 | **The capture day of the city (17 February 1897) is the 18th in the diary Roth reprints**: now "February 1897". The Iya earthworks claim is attributed to NASA's report of the Guinness listing; Dapper never went (his picture is imagined); an earlier Ogiso line is tradition; the date line starts c. 1200, rounded from one estimate. |
| `wh-576` Benin Bronzes | 8 | 5 → 8 | **"Taken to Britain" is "looted"**; "mostly cast c. 1500 – 1700" is the Cleveland Museum's plaque dates; the metal is brass or leaded brass (700 objects analysed), the manilla source in the Rhineland "the main source, perhaps not the only one"; the racist doubt that Africans made them is documented from Pitt-Rivers (1900); Germany's 2022 returns sourced. |
| `wh-577` Swahili coast | 7 | 5 → 7 | **"First described c. 50 CE" described Azania and Rhapta, not the Swahili.** The culture dates from the 7th century (ancient DNA, Brielle et al.); the Shirazi story is the Kilwa Chronicle's (16th century); the African-rooted account (Wynne-Jones, Fleisher) is added; Ibn Battuta and Barbosa attributed. |
| `wh-578` Kilwa Kisiwani | 6 | 7 → 6 | **"Settled from c. 800" is now radiocarbon**: first settlement in the early 9th century, the first coral building and the coins at the end of the 10th (Horton et al. 2022). The Shirazi story is attributed; the Portuguese fort is 1505 – 1507; "leading power 13th – 15th centuries" had no source. Source 1 is an author's accepted version. |
| `wh-579` Great Zimbabwe | 9 | 5 → 9 | **"Largest ancient structure south of the Sahara" and "walls built c. 1250 – 1450" had no source.** Occupied c. 1000 – 1800; walls begun c. 1200 (a 2013 Bayesian chronology) against the older 1300 – 1450 peak; wall 11 m and 252 m (an ICCROM study); the Bent and Rhodesian episodes attributed to *Antiquity*'s editorials of 1971 and 1974. |
| `wh-580` Kingdom of Kongo | 7 | 5 → 8 | **The lord of Soyo was baptised before the king**; Thornton himself gives 1482 (2025) and 1483 (1981) for the Portuguese arrival; Afonso 1506 – 1543. The founding story (c. 1350) is tradition; Mbwila and Kimpa Vita dropped, no source; question 3 now quotes Afonso's letter of 1526 on the kidnapping of young nobles. |

**Read by eye.** *Article:* "the Songhai Empire" and "the Hausa Kingdoms" with "the" before the blank; "Timbuktu", "Kilwa Kisiwani", "Great Zimbabwe" bare; "the Kingdom of Kongo" and "the Kingdom of Benin" with "the"; "the Benin Bronzes" (plural verbs). *Confusability:* `wh-575`/`wh-576` the kingdom and its metalwork, told apart by the Dutch visitor and the Iya on one, the lost wax and the Rhineland isotopes on the other; `wh-571`/`wh-572` the town and the empire, Leo's book on `wh-571` only; `wh-577`/`wh-578` the coast and its island town, Azania only on `wh-577`; `wh-568`–`wh-570` not repeated. *Against other cards:* `wh-566`–`wh-570` agree on the Songhai takeover and Timbuktu; none edited. Note for `wh-721`: the Sengoku start is usually 1493, not the Ōnin War (found in `wh-538`).

**Glossary.** Ten terms rewritten (*Timbuktu*, *Songhai Empire*, *Kanem–Bornu Empire*, *Hausa Kingdoms*, *Kingdom of Benin*, *Benin Bronzes*, *Swahili coast*, *Kilwa Kisiwani*, *Great Zimbabwe*, *Kingdom of Kongo*).

### B59 — `wh-581`–`wh-590`, Africa and the Steppe empires and the Mongols (2026-10-22)

Run as B58. Pictures skipped. Checks: `wh-audit.js --range=wh-581:wh-590` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 64 distinct URLs was non-2xx.
Several of the cards lean on abstract pages for some sources (named in each draft's notes). archive.org was unreachable to every agent.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-581` Zagwe dynasty | 6 | 5 → 6 | **The start is three scholars' three dates**: about 1137 (Piovanelli, after the standard account), the 11th century (Derat), the 12th (Muehlbauer); the abstract says whose. The *Kebra Nagast* (edited in the early 14th century) is the Zagwe's rival tradition; the saints' lives are late; Abu Salih's work confuses Nubia with Abyssinia; "alone ordained" and the Ark-and-Solomon claims were not in the cited text and are dropped. |
| `wh-582` Lalibela | 8 | 5 → 8 | **"c. 1180 – c. 1230" is not a source's figure** (Bosc-Tiessé gives "the late 12th century and the first third of the 13th"); occupation from c. 900 – 1000; the "24 years" and "white men" of Alvarez are hearsay; the "New Jerusalem" idea is Heldman's, via Muehlbauer, with Phillipson's caution; the 1978 listing from UNESCO. The Saladin link and angelic help are not asserted. |
| `wh-583` griot | 7 | 5 → 9 | **"Recorded 1795 – 1797" was Park's journey, not a start for the office**: `""` and `undatable`. The refusal of burial is Mollien's 1818 report about the Wolof; Ibn Battuta's account of Mali (1352 – 53) and the *nyamakala* added; castes by 1300 (Tamari) with the "caste" label disputed; the unsourced etymology dropped. |
| `wh-584` Ajami | 5 | 5 → 6 | **The oldest Swahili manuscript is the *Hamziyyah* of 1652, not the *Utendi wa Tambuka* (1728).** The sources disagree on a start (the 11th century, or not common before the 19th), so the line stays `""`; "no writing before colonisation" is a myth, attributed to Ngom; the old Americas-plantation phrasing dropped. |
| `wh-585` Makuria | 5 | 6 → 6 | **John of Ephesus tells of the Nobadae (Julian) and the Alodians (Longinus), and Makuria is only the hostile kingdom between them**; the old card put that story on Makuria. Royal tombs c. 450 – 550, the baqt 651 – 652, the throne hall made a mosque on 29 May 1317; the "six or seven centuries" lines dropped; the 1200 Arabic text is Abu al-Makarim's, not Abu Salih's. |
| `wh-586` composite bow | 7 | 5 → 7 | **The origin is disputed by about two millennia** (4th millennium BCE theories; the first half of the 2nd millennium BCE, Šaffa 2025), so `""` and `undatable`; the oldest dated bows are from Thebes, c. 1600 BCE. The Bronze Age steppe-grave claim and "the weapon mounted archery depended on" dropped; no range or draw weight stated. |
| `wh-587` yurt | 8 | 5 → 8 | **"Described 1253 – 1255" was Rubruck's report, not a date for the tent**: `""` and `undatable`. *Yurt* is a Russian word for the Mongolian *ger* (National Geographic); the "insulates well" claim contradicts the ger studies; the archaeology claim in the old card is not in its cited paper. |
| `wh-588` Yuezhi | 6 | 5 → 6 | **"Zhang Qian sent 140 – 134" was Hirth's bracket for the reign era**, not the mission: now c. 138 BCE left and 126 BCE back, the first defeat c. 176 and the king's death c. 165 BCE, all Hirth's. The Kushan link is the *Hou Hanshu*'s (Hill); the Tocharian link left out, no source read. |
| `wh-589` Huns | 9 | 5 → 9 | **The unsourced claims that Ammianus "never met them" and meant them "barely human" are replaced by Maenchen-Helfen's findings** (hatred and fear, Gothic informants). The Xiongnu origin is attributed; the language is known only from personal names; "c. 370 – 376" is a range built from two sources; the isotope and DNA phrasings (already on `ru-012`) dropped. |
| `wh-590` Attila | 9 | 5 → 9 | **433 as the start was Mierow's sidenote**: now c. 434 – 439 with both views; the envoy's year is 449; the Aquileia row dropped; the battle at the Catalaunian Plains, Leo's embassy and the nosebleed death are attributed to their sources; "Scourge of God" is a later tag. Agrees with `rm-620`, `rm-630` and `rm-631`. |

**Read by eye.** *Article:* "the Zagwe dynasty" with "the" before the blank, "Lalibela", "Ajami", "Makuria" bare; "the Huns" and "the yurt" with "the" where the phrasing needs it; "composite bow" in "the _____" phrasings; "Attila" bare. *Confusability:* `wh-585` (Makuria) against `wh-581`/`wh-582` by the Nile and the highlands; `wh-583`/`wh-584` the singer and the script, Park on `wh-583` only; `wh-587`/`wh-586` the tent and the bow; `wh-588`/`wh-589`/`wh-590` three steppe subjects, the Xiongnu on `wh-588` and `wh-589`, Priscus on `wh-590`. *Against other cards:* `wh-409` agrees on Zhang Qian's return in 126; `wh-487`/`wh-488` (Migration Period, Goths) agree on the 370s; `rm-` agrees on Attila; `ru-012` carries the Huns' isotope and DNA findings, so those phrasings left `wh-589`; none edited.

**Glossary.** Ten terms rewritten (*Zagwe dynasty*, *Lalibela*, *Griot*, *Ajami*, *Makuria*, *Composite bow*, *Yurt*, *Yuezhi*, *Huns*, *Attila*).

### B60 — `wh-591`–`wh-600`, Steppe empires and the Mongols (2026-10-22)

Run as B59, which ends this thread's range: **`wh-501`–`wh-600` are done, and the audit continues at `wh-601` (B61, The Americas before Columbus)**. Pictures skipped (Commons still answers with an error page).
Checks: `wh-audit.js --range=wh-591:wh-600` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on nine and, first, one on `wh-598` (a *Crossroads* issue labelled 2023 that Crossref dates 2024: now "2023, published 2024"), then 0;
of 74 distinct URLs one was non-2xx (a Scientific Reports DOI that answers 429 under load). Locators retried once: `wh-041`, `wh-268` and `wh-425` still have no primary coordinate on Wikipedia, so they stay unwritten along with `wh-337`, `wh-376` and `wh-422`.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-591` Göktürks | 6 | 5 → 7 | **"The earliest writing in any Turkic language" was an unsourced superlative**: now a 2026 Turkish study's claim. 552, the split of 583, the second khaganate c. 682 – 745 (687 in another history) and the stones of 732 and 735 (Ross; Thomsen's 1893 notice read the Chinese date as 733); Tujue is the Chinese name, Göktürk a modern one; the 744 end had no source. |
| `wh-592` Khazars | 7 | 5 → 9 | **"Letters found 16th century" was Akrish's find, printed at Constantinople in 1577** (Schechter's Geniza letter of 1912 is another document). The khaganate runs c. 660 – 965 (Ibn Hawqal has 968 – 69, Dunlop favours 965), not 969; the conversion is dated by Halevi to c. 740 and by Mas'udi to al-Rashid's time; "is said to have adopted Judaism" in question 1; Sarkel c. 833. |
| `wh-593` Genghis Khan | 9 | 5 → 9 | **The birth year is uncertain**: Mongol tradition 1162, Columbia probably 1167. The 1206 title and the fall from a horse are the *Secret History*'s, the incurable illness Juvayni's; the *Secret History*'s date is 1228 in one scholar's reckoning and 1240 in the Russian; the Yassa is doubted; Zerjal's study is stated only as its authors state it; no "40 million". |
| `wh-594` Mongol Empire | 9 | 5 → 9 | **"Widest extent c. 1279" and any km² figure had no source.** "Divided after 1260" is Möngke's death in 1259 and the civil war of 1260 – 64; the largest land-based empire is "a recent Cambridge history's" phrase; the yam, the Great Khans and Karakorum re-sourced; question 1 no longer states the superlative. |
| `wh-595` Mongol conquests | 8 | 5 → 9 | **"Campaigns 1206 – 1279" is a convention**, labelled "Frame". Ryazan fell in December 1237 (the translation's "1238" heading was wrong); Kyiv December 1240 only; Legnica and Mohi 9 and 11 April 1241; the turn back from Hungary on Ögedei's death is a long-held explanation now challenged (Batu never returned); casualties are Juvayni's own claims. |
| `wh-596` Pax Mongolica | 7 | 5 → 7 | **"c. 1250 – 1350" was unsourced** (Di Cosmo gives about 1280 – 1360, hedged with "seemingly") and "Polo 1275 – 1291" belongs to `wh-536`: `""` and `undatable`. Pegolotti's "perfectly safe" is a merchant's claim, Rubruck the counterweight; the Black Death link is a hypothesis; the "by analogy with Pax Romana" origin had no source. |
| `wh-597` Siege of Baghdad | 7 | 5 → 8 | **The old dating source never mentions Baghdad**, and the "minaret 1279" rested on a source giving 1270 and 1279. The siege began in January 1258 (Le Strange) and Rashid al-Din dates the caliph's death to 20 February 1258; the carpet, starvation and gold versions are attributed; death tolls are attributed ranges; Polo's own date for the capture (1255) is wrong. |
| `wh-598` Golden Horde | 8 | 5 → 8 | **"State 1242 – 1502" rests on a Russian-language source alone**; the English survey (Favereau and Pochekaev) gives c. 1260 – 1502, so the line does; this disagrees with `ru-100` (from 1242, citing Gorsky) and is left to that card's pass. The name is a Muscovite coinage of the 16th century (Ulus of Jochi in its day); the "Tatar yoke" is contested (Halperin 2025). |
| `wh-599` Timur | 8 | 5 → 8 | **Russian-language and off-topic papers had been cited for claims they do not make.** Born 8 April 1336 by one 19th-century edition of Clavijo; an emir under a puppet khan who held the title *güregen*; Ibn Khaldun met him in 1401 (agrees with `wh-482`); the iron cage is a disputed tale; skull towers, casualty figures and the 1941 exhumation left out, no readable source. |
| `wh-600` Chinggisids | 7 | 5 → 9 | **The card was rebuilt on the principle itself**, with loose rows ("Four khanates after 1260", "last khanate to the 18th century") replaced by 1206, the Time of Troubles 1359 – 80, the Crimean Khanate 1441 – 1783 and the Kazakh charter of 1822. The Manghit and Khiva claims are not stated (no readable source). Agrees with `ru-091` and `cnh-485`. |

**Read by eye.** *Article:* "the Göktürks" and "the Khazars" with "the" before the blank, "the Mongol Empire" and "the Mongol conquests" with "the" or "During the _____" as the phrasing needs, "the Siege of Baghdad", "the Golden Horde", "the Chinggisids"; "Genghis Khan", "Timur" bare. *Confusability:* `wh-593`/`wh-594`/`wh-595` the man, his state and its wars (the Secret History and the 1206 assembly on `wh-593`; the quriltai and yam on `wh-594`; Ryazan and Mohi on `wh-595`); `wh-595`/`wh-596` the wars and the peace; `wh-598`/`wh-599`/`wh-600` the western khanate, the conqueror who was not a khan and the lineage that could be; the Baghdad siege only on `wh-597`. *Against other cards:* `ru-091` and `cnh-485` agree; `ru-100` dates the Golden Horde from 1242, this card c. 1260 (see `wh-598`); `wh-469` and `wh-470` (Baghdad: "from 1261", the forty days of sack) are consistent with `wh-597`; none edited.

**Glossary.** Ten terms rewritten (*Göktürks*, *Khazars*, *Genghis Khan*, *Mongol Empire*, *Mongol conquests*, *Pax Mongolica*, *Siege of Baghdad*, *Golden Horde*, *Timur*, *Chinggisids*).

### B61 — `wh-601`–`wh-610`, The Americas before Columbus (2026-10-22)

Run as B60: five agents, two cards each, each told the faults to hunt from the card's own old date line and abstract; every draft read by eye. Pictures skipped: Commons answered one test call, then rate-limited (429 twice) the one picture agent on its first search, so no picture changed.
Checks: `wh-audit.js --range=wh-601:wh-610` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 58 distinct URLs non-2xx. Several sources rest on an abstract page only (named in each draft's notes); UNESCO, Britannica, pnas.org and pmc.ncbi.nlm.nih.gov were blocked to every agent.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-601` Tikal | 8 | 6 → 8 | **The date line mixed a decipherment event and a building phase with no start for the city**: now Classic era 250 – 900 CE (one team's span), Recorded arrival 378 CE (what the texts record, with Sihyaj K'ahk' as their reading), Last monument 869 CE; the Ciudadela's c. 300 – 550 is the building's phase date and moved to prose. No source read gives the city's own founding. Population is two differing estimates, the zeolite filtration is the excavators' claim, the forest-loss figures are dropped. |
| `wh-602` Classic Maya collapse | 7 | 6 → 7 | **"Worst 50 years c. 800 – 850" had no source** (McCool and Braun both give 750 – 850); the "aridity spike 750 – 1050" is a climate episode, not the same kind of date. Collapse is framed as a contested label with the rival explanations listed; the 90% population and pollen falls, the rainfall deficit and "eight droughts" (one cave record) are dropped as unsourceable; stelae end "by 998 CE" (James et al.). |
| `wh-603` Chichen Itza | 8 | 5 → 8 | **"Cenote burial c. 500 – 900" was wrong in kind**: the 64 sequenced children lay in an underground cistern near the Sacred Cenote, in use from the early 7th to the mid-12th century (Barquera), not a chamber beside it; the row is dropped. "Decline 10th – 11th century" became a labelled estimate, c. 1025 – 1050 (James et al., who note dissent); the Toltec-invasion idea is a debated view tied to later Quetzalcoatl legends, set beside the Maya-origin and cult-spread views. |
| `wh-604` Toltecs | 7 | 5 → 7 | **Tula Chico, Tula Grande and "height 1050 – 1150" were phases of a site, and the 950 start and the height had no source**: one row, Tollan phase c. 900 – 1150 CE (Healan et al.). The abstract now separates the Toltecs of Mexica memory (Sahagún's informants; toltecatl 'craftsman') from excavated Tula; the Chichen Itza invasion is reported as a view; a gold and shell-pendant claim and an unreachable archive.org Sahagún are gone. |
| `wh-605` Aztec Empire | 9 | 5 → 9 | **"Guiengola siege 1497" is one episode, not the empire's span**: one row, imperial years c. 1430 – 1521 CE, with the prose saying the dates are a convention resting on Tenochca tradition and sources written by the Mexica or the Spanish after 1519 (1428 is the Xaltocan authors' formation year). "Aztec" is an outsider's early-1800s label; Sahagún's nine rulers and the Codex Mendoza tribute are attributed; the Durán land-sharing claim is dropped. |
| `wh-606` Tenochtitlan | 8 | 5 → 8 | **The date line had no founding and two rows of other things** ("Temple rebuilt c. 1375 – 1520" is the Templo Mayor sample's span; "Mexica new year 23 – 24 February" is one team's Gregorian estimate): now one row, Founded (trad.) c. 1325 CE, one popular account's date for a Mexica tradition. Cortés's size, causeway and market claims, Díaz's "Venice" and Sahagún's are "he wrote"; the population is split between a popular account (150,000 – 300,000) and a review (over 50,000 by 1450); the 1521 fall is left to wh-666. |
| `wh-607` Aztec religion | 8 | 5 → 9 | **The date line was calendar lengths, not dates**: emptied, undatable true. The 23 – 24 February new year is Ezcurra's claim and Šprajc disputes it, so it became a Think-it-through answer giving both. Cult and sacrifice claims are attributed ("a friar who recorded the rites says", "Díaz says"); the Spanish-language 1829 Sahagún is replaced by the English *Florentine Codex*; no sacrifice totals are given. |
| `wh-608` Aztec society | 8 | 5 → 8 | **The date line was the empire's span (wh-605's)**: emptied, undatable true. "One hall tried nobles, another commoners" was wrong: in Sahagún the Tlacxitlan hears common folk and sentences nobles. "Slaves below both" was an unsourced ranking; the calpulli article that could not be opened is replaced by Sahagún's merchants book; Xaltocan pottery is the archaeological test of the written accounts. |
| `wh-609` Chinampa | 7 | 5 → 7 | **"Heritage listing 2017" was the FAO agricultural-heritage designation** (the UNESCO declaration for Xochimilco is 1987, from one paper); the date line is emptied (the old rows gave one site, Xaltocan to the 14th century, and the Aztec era as the practice's dates), undatable true. Canal figures are FAO's; the Xaltocan surplus is Morehart's estimate of potential; 25 million person-days is Arco and Abrams's estimate. The old PNAS source never mentions chinampas. |
| `wh-610` Wari Empire | 7 | 5 → 7 | **"Empire" was stated flat**: the empire-versus-interaction-sphere debate (Conlee) is now in the prose; one row, Middle Horizon c. 600 – 1000 CE; the Huaca del Loro and Alca obsidian rows were a site and a material. Population (c. 40,000 in the capital) and area (up to 320,000 km²) are attributed estimates; the end is two competing hypotheses (megadrought versus a population-and-warfare model); the Tiwanaku-rivalry explanation had no source and is dropped. |

**Read by eye.** *Article:* "Tikal", "Chichen Itza", "Tenochtitlan", "Chinampa" bare in the phrasings ("a ____", "on a ____" for the chinampa); "the Classic Maya collapse" as "the so-called ____"; "the Toltecs", "the Aztec Empire", "the Wari Empire" with "the" where the sentence needs it; "Aztec religion" and "Aztec society" as "the ____" or "in ____". Question 1 of `wh-610` had "a true empire" beside the blank "Wari Empire" and now says "state or looser sphere of interaction". *Confusability:* `wh-601`/`wh-602` the city and the collapse (the lidar survey and the Teotihuacan arrival on `wh-601` only); `wh-603`/`wh-604` Chichen Itza and Tula, who share the invasion debate (the children's cistern on `wh-603`, the Mexica memory and the pillars of Pyramid B on `wh-604`); `wh-605`–`wh-608` the empire, the city, the cult and the society (obsidian and the Templo Mayor on `wh-606`, Xaltocan pottery on `wh-605` and `wh-608`, Sahagún's informants on `wh-607` and `wh-608`); `wh-609` against `wh-605` by the Xochimilco fields. *Against other cards:* `wh-428`/`wh-429`/`wh-431` agree on the Maya and Teotihuacan; no `gr-`, `rm-`, `cnh-`, `ru-` or `us-` card covers these ten; none edited.

**Glossary.** Ten terms rewritten (*Tikal*, *Classic Maya collapse*, *Chichen Itza*, *Toltec*, *Aztec Empire*, *Tenochtitlan*, *Aztec religion*, *Aztec society*, *Chinampa*, *Wari Empire*).

### B62 — `wh-611`–`wh-620`, The Americas before Columbus (2026-10-22)

Run as B61. The first `batch.sh` run stopped applying after `wh-615` (its audit then read the old text of `wh-616`–`wh-620`); `apply.js wh-616 … wh-620` was re-run by hand and the audit is clean on all ten.
Checks: `wh-audit.js --range=wh-611:wh-620` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of the distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-611` Tiwanaku | 7 | 5 → 7 | **The date line mixed outputs of one Bayesian model with a genome study's span**: now Modelled start c. 180 CE, Peak influence c. 500 – 1000 CE, Residents left c. 1010 CE, each attributed (Marsh et al. 2023; Popovic et al. 2021; a third account gives 500 – 1150). "Abandoned c. 1010 – 1050" was wrong as a range of abandonment. The drought, state-or-empire and skull-shaping claims are attributed with rival views; Vranich printed only the andesite at 1/25 scale, not the sandstone. |
| `wh-612` Inca Empire | 9 | 5 → 10 | **"Largest state of pre-Columbian America" was stretched from "South America"** (Davidson et al.), and "1438 – 1533" was presented as the empire's dates: it is the traditional chronology (Rowe 1945, built on Cabello Balboa's 1586 chronicle), so the row is labelled Traditional and set against the radiocarbon redating; Cajamarca (1532) and Vilcabamba (1572) added. The 2 million km² and population figures are attributed estimates. |
| `wh-613` Cusco | 8 | 6 → 8 | **The date line was the empire's span plus a visit** ("Cieza saw it 1540s"): emptied, undatable true; no source gives the city's start (Masini describes a pre-Inca Killke settlement). Founder tradition, the Coricancha and the ransom are Cieza's; the puma plan is one architect's "possible form"; the ceques and about 350 shrines are Cobo's account as read by Zecenarro. |
| `wh-614` Machu Picchu | 9 | 5 → 9 | **The 1438 row (Pachacuti's rise) is another event's date**: one row, Occupied c. 1420 – 1532 CE (the Burger study's own), and the prose adds the Bayesian re-analysis (start 1400 – 1435, end 1470 – 1520). The royal-estate reading is stated as what most scholars read from documents; Bingham's own text shows farmers on the terraces. Glossary unchanged. A Science news piece of 15 October 2026 (unread, blocked) is reported to say the traditional Inca chronology "has collapsed". |
| `wh-615` Quipu | 7 | 5 → 7 | **"In use c. 950 – 1950" is one pair of scholars' estimate** (their own abstracts say 850 and 950; another source says 900), and Cieza's visit is an observer's report: emptied, undatable true. The earliest khipus specialists recognise are Wari (Urton); the Caral claim is its excavator's, via Reuters; whether khipus are writing is left open; a wrong page range corrected. |
| `wh-616` Inca road system | 7 | 5 → 7 | **"In use c. 1450 – 1533" ignores the pre-Inca basis, and "World Heritage 2014" is another event's date**: emptied, undatable true. Length is UNESCO's 30,000 km, with 40,000 km as a 2021 review's citation of a 1984 book; D'Altroy was unreadable so its claims are dropped. The relay system is Cieza's and Garcilaso's, who disagree. Tags reordered (technology first) to clear the audit's locator rule for "building". |
| `wh-617` Mississippian culture | 7 | 5 → 7 | **Rows of other things**: "Emerald Mound 1200 – 1600" is one site and "Population peak c. 1150" is a continental North American estimate; one row, Flourished c. 1000 – 1450 CE, one climate study's span (others give 1050 – 1450 and 1000 – 1350). "Mississippian" is an archaeologists' label for varied societies; chiefdoms and the de Soto accounts are attributed; the unsourced "no wheels or metal" and arrow-tip claims are dropped. |
| `wh-618` Cahokia | 7 | 5 → 7 | **"Flourished 1000 – 1350" is a National Park Service span for the culture, "Mitchell Log c. 1124" is one post, and "Abandoned 1350 – 1450" is a midcontinent range**: now Emerged c. 1050 and Abandoned c. 1350 – 1400 (Kessler et al.; Pompeani et al.). Population is attributed (10,000 – 20,000 NPS; 10,200 – 15,300 Tainter; 20,000 or more); Woodhenge is a theory; the decline is debated; the Illini-subtribe name claim had no source and is hedged. |
| `wh-619` Ancestral Puebloans | 7 | 5 → 8 | **"Maize farming from c. 1 CE" is a different event** (maize reached the Southwest by 2100 BCE; c. 1 CE is the Park Service's date for the Tsegi farmers); "left Mesa Verde mid-1200s" became "empty by c. 1280" for the central Mesa Verde region only. 500 – 1300 is the Park Service's span and the Pecos classification a convention. The Anasazi naming dispute is added with both sides; the Picuris accounts are attributed to Picuris; the potato sentences are dropped. |
| `wh-620` Chaco Canyon | 7 | 5 → 7 | **"Elite matriline 800 – 1130" is one 2017 ancient-DNA study of nine people in one crypt**, now a row labelled Crypt burials and stated as its finding, with its authors' caution and the Indigenous researchers' objections; the roof-beam row is dropped (the juniper claim is Lentz's, disputed). Trade is given only as the Park Service's open questions, cacao dropped; decline is presented as debated. |

**Read by eye.** *Article:* "Tiwanaku", "Cusco", "Machu Picchu", "Cahokia", "Chaco Canyon" bare; "the Inca Empire", "the Inca road system", "the Mississippian culture", "the Ancestral Puebloans" with "the"; "a ____" or "one ____" for the quipu. *Confusability:* `wh-612`/`wh-613`/`wh-614` the state, the capital and the estate (the Burger dating on `wh-614`, the Coricancha and ceques on `wh-613`); `wh-615`/`wh-616` the cords and the roads, Cieza on both but about different things; `wh-617`/`wh-618` the culture and its largest city; `wh-619`/`wh-620` the people and the canyon (the Anasazi naming on `wh-619`, the crypt DNA on `wh-620`); `wh-611` against `wh-610` by Lake Titicaca and the genome. *Against other cards:* `us-017` gives the Mississippian culture "c. 1000 – 1600" with a continental "population peak c. 1150" (1600 is Emerald Mound's end, 1150 a Kelly et al. continental figure), so it differs from `wh-617` and is left to that card's pass; `us-018` has Cahokia "c. 1000 – 1350" and "perhaps twenty thousand" without whose, `us-019` gives Monks Mound "about 30 metres" without the base caveat, `us-020` agrees on the abandonment; `us-022` dates farming "from c. 1 CE" regionally and omits the Anasazi dispute, `us-025`/`us-026` agree on the 1280 Four Corners departure; `us-023`/`us-024` give Pueblo Bonito 850 – 1150 and a population; none edited. `wh-428`/`wh-429` and `wh-435` agree. **Cross-card note:** a Science news piece of 15 October 2026 ("Redating the Inca empire", unread, blocked to every agent) is reported to say the traditional Inca chronology "has collapsed"; `wh-612` already labels 1438 – 1533 as traditional.

**Glossary.** Nine terms rewritten (*Tiwanaku*, *Inca Empire*, *Cusco*, *Quipu*, *Inca road system*, *Mississippian culture*, *Cahokia*, *Ancestral Puebloans*, *Chaco Canyon*); *Machu Picchu* kept.

### B63 — `wh-621`–`wh-630`, Renaissance, Reformation and the new science (2026-10-22)

Run as B61, the Italian Renaissance cards read against each other (Vasari and Burckhardt are two sources at most per card). Most of the 1903 *Cambridge Modern History* and archive.org sources the old cards leaned on were unreachable and were replaced by pages read.
Checks: `wh-audit.js --range=wh-621:wh-630` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; of 78 distinct URLs one (the Dialnet PDF cited on `wh-621`) answered 000 in the batch run and 200 on re-check.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-621` Renaissance | 9 | 7 → 10 | **The Renaissance as one period is a 19th-century construction** (Vickers: Burckhardt 1860, after Michelet), so "Era c. 1350 – c. 1550" and "Culmination 1453 – 1527" (the fall of Constantinople to the sack of Rome) are emptied, undatable true; the unsourced "1453 and 1527" is gone from the abstract, a Think-it-through answer and the glossary, which stays general. Seven archive.org sources replaced by ten readable ones. |
| `wh-622` Italian city-states | 8 | 5 → 8 | **"Five powers 1454 – 1494" was the Peace of Lodi to the French invasion**: dropped; "Communes c. 1100 – c. 1200" is one overview's range, so one row, Communes began c. 1100 (Wickham: no single year marks a commune's birth). The "permanent embassies" claim is gone (Frigo: 15th-century diplomacy was shifting alliances); Venice, Genoa, Milan, Florence and the papal lands are all covered. |
| `wh-623` Florence | 9 | 6 → 9 | **The date line was four other events' dates** (Medici rule 1434 – 1494 moved to wh-624; "Duchy from 1530" is the siege, the duchy dates from April 1532): now florin from 1252, priors from 1282 (Machiavelli reports it), republic ended 1532. Population is Villani's estimate and modern ones (94,000 – 120,000 before the Black Death); unsourced claims dropped. Glossary kept (UNESCO-sourced, no conflict). |
| `wh-624` House of Medici | 8 | 6 → 9 | **"Rule in Florence 1434 – 1494" ignored the later rule**: now Medici rule 1434 – 1737 (with the expulsions of 1494 and 1527, the return of 1512, the duchy of April 1532 and the grand duchy of 1569 in the prose), bank from 1397, the Pazzi plot on 26 April 1478, dukes from 1532. The alum monopoly could not be sourced and is dropped; rigged elections and the pope's role are attributed. |
| `wh-625` Renaissance humanism | 7 | 5 → 7 | **The date line mixed three events and an unsourced c. 1340 start** (Humanist schools from 1425, Greek in print by 1518): emptied, undatable true. "Humanism" is a 19th-century word (Duke); the Kristeller and Baron views are attributed; the Aeschylus of 1518 appeared after Aldus died and is the Aldine press's; the Mantua locator belongs to Vittorino's school, not the movement. |
| `wh-626` Petrarch | 7 | 5 → 7 | **The Mont Ventoux climb was stated as fact**: now "he says", with Mann's report that the letter was reworked in 1352 or 1353 and may be literary invention; the row reads "26 April, read as 1336". Crowned 8 April 1341 (Easter) confirmed; death 18 or 19 July by different accounts; "first humanist" and "first to collect" are later labels. |
| `wh-627` Leonardo da Vinci | 9 | 5 → 9 | **"Brain studies c. 1487 – 1509" was not a life date**: the line is now Lived 15 April 1452 – 2 May 1519 and Mona Lisa dated 1503 – 1519 (the Louvre's). Vasari's anecdotes are "Vasari says"; the "c. 1482" date of the letter to Milan is dropped; "seventeen years", "painting mentioned last" and "thousands of pages" dropped. |
| `wh-628` Michelangelo | 9 | 5 → 9 | **Birth is 6 March 1475 new style, 1474 in his father's notebook**; "at twenty-six" (David), the unsourced dissection claim and the Arezzo village are dropped. The block's earlier sculptor is Simone in Vasari and Agostino in the contract, reported as such; the two earliest lives (Vasari, Condivi, who wrote with Michelangelo's materials) disagree on details. |
| `wh-629` linear perspective | 7 | 5 → 7 | **"Treatise 1435" and "San Romano c. 1438 – 1440"** (one painting, not the method): now Reported start c. 1413 (one review citing Kemp) and Alberti wrote 1435 – 1436 (scholars debate which of the Latin and Italian came first). Brunelleschi's panels are lost and known only from Manetti's life of the 1480s; the Vasari publisher is corrected (Philip Lee Warner); no Islamic-optics claim (no readable source). |
| `wh-630` printing press | 9 | 5 → 10 | **"Mainz c. 1440 – c. 1455" bundled Gutenberg's whole career** (wh-631's): now Press at Mainz c. 1450, 42-line Bible c. 1454 – 1455 (Mainz says 1454, the Library of Congress late 1455), Subiaco book 1465 (the first dated book in Italy). The screw press, "first substantial book" and the 5,000-book figure for Italy are dropped; the "260 places, 20 million copies" is one Mainz account's. Sources 5 → 10. |

**Read by eye.** *Article:* "the Renaissance", "the Italian city-states", "Renaissance humanism" and "linear perspective" with "in ____" or "the ____" as the phrasing needs; "Florence", "Petrarch", "Leonardo da Vinci", "Michelangelo" bare; "the House of Medici" as "the ____"; "the printing press" as "the ____". *Confusability:* `wh-621`/`wh-625`/`wh-632` the period, the movement and the northern label; `wh-623`/`wh-624` the city (florin, guilds, Ciompi) and the family (bank, Pazzi, dukes); `wh-626` Petrarch against `wh-625` by the letters to the dead and the laurel; `wh-627`/`wh-628` the two artists, told apart by Vasari's anecdotes; `wh-629`/`wh-630` the method and the machine. *Against other cards:* `rm-970` (Poggio) and `gr-880` (Chrysoloras) are consistent with `wh-621`; `wh-532`/`wh-541` (Bi Sheng, the *Jikji*) agree with `wh-630`; none edited.

**Glossary.** Nine terms rewritten or corrected (*Renaissance* and *Italian city-states* stay general with their dates emptied or corrected; *Renaissance humanism* fixed on two unsourced claims; *House of Medici*, *Petrarch*, *Leonardo da Vinci*, *Michelangelo*, *Linear perspective*, *Printing press* rewritten); *Florence* kept.

### B64 — `wh-631`–`wh-640`, Renaissance, Reformation and the new science (2026-10-22)

Run as B63, the Reformation cards drafted with each side's account attributed ("Protestants held…", "the Catholic Encyclopedia of 1910 describes…"). Pictures skipped. Most old sources were the 1903 *Cambridge Modern History* on archive.org, unreachable to every agent, and were replaced by pages read.
Checks: `wh-audit.js --range=wh-631:wh-640` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 75 distinct URLs non-2xx. `apply.js` stopped at its locator step because a person's locator needs a place name: `wh-631`'s Mainz was written by hand with `name` "Mainz" (the old locator was Strasbourg).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-631` Johannes Gutenberg | 9 | 5 → 9 | **Birth is not recorded**: "Born c. 1398, at Mainz" became c. 1397 – 1406 (the city of Mainz's figure) against 1394 – 1399 in another modern summary. The 1455 Helmasperger record is a notary's report of Fust's oath, not a verdict, and the sources disagree on who won; the Bible's date is each institution's own; "Gutenberg printed the *Catholicon*" is dropped; death is early February 1468 (Mainz gives 3 February). The locator moves from Strasbourg to Mainz. |
| `wh-632` Northern Renaissance | 7 | 5 → 9 | **The date line was five other events' dates** (the Ghent altarpiece, the Arnolfini panel, Dürer's letters, the Reuchlin case): emptied, undatable true. The label is built on comparison with Italy and has no agreed span (one art historian dates it from the late 14th century to about 1580; another study covers 1550 – 1640). The "1516 acquittal" of Reuchlin is wrong: Leo X suspended the case in 1516 and condemned the *Augenspiegel* in 1520; the Ghent verse dating the altarpiece to 1432 is disputed; the unsourced oil-medium, Iberia and Apocalypse claims are dropped. |
| `wh-633` Erasmus | 8 | 5 → 8 | **The birth year was stated flat**: "Born 28 October 1469" became Born (disputed) c. 1466 – 1469 (one reference work gives 1469, another calls 1466 probable, a Dutch review reports a study for 1467); death is 11 or 12 July 1536 (lexicon). "Laid the egg that Luther hatched" is the monks' (Jebb); the free-will treatise of 1524 and Luther's reply of 1525 are dated; "March 1516" is in no page read, so the line says 1516; six manuscripts, 24,000 *Colloquia* copies and the Spanish *Enchiridion* in inns are dropped. |
| `wh-634` Niccolò Machiavelli | 9 | 5 → 9 | **"The Prince written 1513" is a draft**: the letter of 10 December 1513 says he had composed a work on principalities and most scholars think it was finished by spring 1514; it was printed only in 1532. "In office 1498 – 1512" is confirmed (19 June 1498 to 7 November 1512) and relabelled Chancery. "What rulers do, not ought" is an attributed reading beside the Rousseau and satire views; "tortured for several weeks" is dropped (SEP says several weeks, Treccani a few days). |
| `wh-635` Reformation | 9 | 5 → 9 | **The date line was four events and the start was stated as the movement's**: now Usual start 1517 (Schaff's convention), Zwingli preaches 1519, Augsburg peace 25 September 1555 and Usual end 1648; Worms dropped. Catholic and Protestant accounts are attributed (the 1910 *Catholic Encyclopedia*); "Protestant Reformations" in the plural is what current scholarship says. The glossary is redrafted as a general entry. The old five sources were all the 1903 *Cambridge Modern History*. |
| `wh-636` Martin Luther | 9 | 5 → 9 | **The thunderstorm vow is Luther's own later account** and early biographers tell it differently; the birth year rests on Melanchthon's report of the family's belief; "Here I stand" was added in the earliest printed version and most scholars think he probably did not say it; the 1543 tract *On the Jews and Their Lies* is added with the *Encyclopaedia Judaica*'s reading. The unreachable Pollard source in the glossary is replaced. |
| `wh-637` Ninety-five Theses | 8 | 5 → 8 | **The door story rests on Melanchthon's preface of 1546** and historians divide: the documented fact is Luther's letter to Albrecht of Mainz dated 31 October 1517, so the line says Letter dated 31 October 1517 and Reprinted by end of 1517; the 1515 indulgence row is dropped. The Fugger and half-the-money claims are attributed; the Tetzel jingle is labelled a traditional saying. |
| `wh-638` Protestantism | 9 | 5 → 9 | **The date line was five events**: cut to one row, Name arose 19 – 25 April 1529 (Pollard has the Protest read on 19 April, Helmer dates the Letter of Protestation to 20 April and the appeal to 25 April); Denmark 1527, Marburg and Augsburg dropped to prose. The name began as a formal declaration, not a doctrine; the Lutheran, Reformed, Anabaptist and Anglican strands are named; the 37% figure is one report's, resting on church bodies' estimates. |
| `wh-639` John Calvin | 9 | 5 → 9 | **Dates and motives checked**: born 10 July 1509 at Noyon, the *Institutes* first at Basel in 1536, expelled April 1538 and returned in 1541, the Servetus burning of 1553 as the council's act after Calvin pressed for conviction, died 27 May 1564. "Theocracy" is a disputed label (he sat on no council and became a citizen in 1559); predestination was not new (Augustine); Farel's curse is Calvin's own account. |
| `wh-640` English Reformation | 8 | 5 → 8 | **"A change made by statute before a change of belief" was one side of a long debate** and sat in the opening, question 1, the first Think-it-through answer and the glossary: the new opening follows Haigh's account of a process and a historians' label with no precise date (statutes dated, motive and popular acceptance disputed). The four rows (Appeals Act 1533, Supremacy Act 1534, Prayer Book 1549, Settlement 1559) are milestones, in years only because Gee and Hardy's months conflict with Maitland; Maitland's pages 668 – 69 were OCR errors for 568 – 69; Elton and Duffy are not named (no readable source names them). |

**Read by eye.** *Article:* "the Northern Renaissance", "the Reformation", "the English Reformation", "the Ninety-five Theses" ("enclosing the ____") and "Protestantism" ("The word ____") with "the" where the sentence needs it; "Johannes Gutenberg", "Erasmus", "Niccolò Machiavelli", "Martin Luther", "John Calvin" bare. Question 2 of `wh-633` described a conception "on a journey from Italy to England" that the abstract does not state; it was rewritten on the dedication to More. *Confusability:* `wh-630`/`wh-631` the machine and the man (the lawsuits and the Mainz loan on `wh-631`); `wh-635`–`wh-640` the movement, the man, the document, the name, the second reformer and the English break (the Worms refusal on `wh-636`, the door story on `wh-637`, the Speyer protest on `wh-638`, Servetus on `wh-639`, the Appeals Act on `wh-640`); `wh-633` against `wh-632` by the Greek New Testament and Reuchlin. *Against other cards:* no `gr-`, `rm-`, `cnh-`, `ru-` or `us-` card covers these ten; `wh-632` and `wh-633` both give the Greek New Testament of 1516 and agree; none edited.

**Glossary.** Ten terms rewritten or corrected (*Johannes Gutenberg*, *Northern Renaissance*, *Erasmus*, *Niccolò Machiavelli*, *Reformation* as a general entry, *Martin Luther*, *Ninety-five Theses*, *Protestantism* on its 19 April date only, *John Calvin*, *English Reformation*).

### B65 — `wh-641`–`wh-650`, Renaissance, Reformation and the new science (2026-10-22)

Run as B64; the wars-of-religion and witch-trial cards give every toll as a named source's figure and whose. Pictures skipped.
Checks: `wh-audit.js --range=wh-641:wh-650` clean on all ten once `wh-647`'s third Think-it-through question was reworded to open "Why"; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 83 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-641` Henry VIII | 9 | 5 → 9 | **The motive was stated flat**: now "historians weigh the succession, his love for Anne Boleyn and his claim that the marriage was unlawful", with one study's sincere-scruples thesis attributed. The Defender of the Faith title is Leo X's bull of October 1521 (the old card said 1522); the accession day is dropped (no readable source); the wives' fates, the forts and the navy are sourced. |
| `wh-642` Counter-Reformation | 8 | 5 → 8 | **"Counter-Reformation" is a historians' label**: first used in 1776 by a Lutheran legal historian, a negative concept for 19th-century German Protestants, shunned by Catholic historians for Catholic Reformation (Jedin proposed both in 1946), and defended by Firpo as the curia's opposition to reform. The milestones (1537 report, 1542 Inquisition, Trent) are no longer a date line: `""` and undatable. Trent's three periods and uneven application are covered. |
| `wh-643` Jesuits | 8 | 5 → 10 | **Founding is two dates and the birth year is uncertain**: Montmartre vow 15 August 1534 and the bull *Regimini militantis Ecclesiae* of 27 September 1540 (the Society's own history gives 1540); birth "usually 1491", with Polanco's editors and Ignatius's "twenty-sixth year" pointing to about 1495. Membership and school figures are the Society's own; the suppression of 1773 and restoration of 1814 are on the line; polemic is attributed. |
| `wh-644` wars of religion | 8 | 5 → 8 | **The spans are conventions**, labelled by country (Germany 1546 – 1555, France 1562 – 1598 and stretched to 1629 by some, the Netherlands 1568 – 1648). Religion versus noble ambition is an attributed debate; unverified claims dropped; the Thirty Years' War and the Bartholomew massacre are one clause each. |
| `wh-645` St Bartholomew's Day massacre | 8 | 5 → 8 | **The death toll was stated flat**: now attributed (about 1,000 – 10,000 for Paris, 2,000 – 100,000 for all France); who gave the order is De Thou's (the queen approved a plan under Guise) against a historian of 1909 (an unplanned crime of fear); Guise waited in the courtyard rather than killing Coligny. The "Fourth War" row is another event's and is dropped; the Te Deum, jubilee and medal are sourced. |
| `wh-646` Thirty Years' War | 8 | 5 → 8 | **Window and losses corrected**: the Bohemian nobles threw two regents and a secretary, all three surviving; "43 per cent" is the fall in the number of timber felling dates, not timber felled; the loss figures are attributed (Franz about 40 per cent of rural people, Outram, Wilson); "religious war" is attributed to Wilson and Münkler. The line now carries days: 23 May 1618, 8 November 1620, 24 October 1648. |
| `wh-647` Peace of Westphalia | 8 | 5 → 8 | **"Papal protest 26 November 1648" and "ratified 8 February 1649" had no source**: one row, Signed 24 October 1648; the papal brief is mentioned only as dated 1650 by one study. The "Westphalian sovereignty" story is attributed (Gross 1948; a critic in 2001). The Dutch – Spanish treaty (ratified at Münster on 15 May 1648) is separate, and the card's picture shows it. |
| `wh-648` witch trials | 8 | 5 → 8 | **The date line (the bull, the *Malleus*, Bamberg) is replaced by the period**: Whole period c. 1450 – 1750 (one historian's) and Great Hunt 1560 – 1630. Execution figures are per source (Leeson and Russ: 100,000 – 110,000 tried, about half executed; an Oregon course about 50,000 executed; Edinburgh's 60,000 against the "9 million" exaggeration); the abstract no longer says the bull and the *Malleus* supplied the theory behind the trials. |
| `wh-649` Scientific Revolution | 8 | 8 → 10 | **"Usually dated c. 1543 – 1687" is a convention built on two books**: now Conventional 1543 – 1687 (Harvard Library; a Hanover College page). The Royal Society date row and the unsourced academies of 1657 – 1666 are dropped; the label's rise (Koyré, Butterfield), the doubt since the 1970s and Shapin's opening line are attributed. The old Cambridge Modern History sources were unreachable and replaced. |
| `wh-650` Nicolaus Copernicus | 9 | 6 → 9 | **The deathbed copy is a legend** ("is said to"); the unsigned preface is credited to Osiander only on a Cambridge page, and the "1609" claim is gone. The Index: suspended March 1616, corrections 15 May 1620, on the Index until 1835 (the 1835 rests on SEP's Galileo article alone, the 1758 detail is unverified). The Aristarchus line is Archimedes's report. |

**Read by eye.** *Article:* "Henry VIII", "Nicolaus Copernicus" bare; "the Counter-Reformation", "the Jesuits", "the Peace of Westphalia", "the Scientific Revolution", "the Thirty Years' War" and "the St Bartholomew's Day massacre" with "the" where the sentence needs it; "wars of religion" as "the label ____" and "the ____" and "the witch trials" as "the ____". Question 3 of `wh-650` ("its author, ____") was ambiguous with the preface's author and now says "the book's own author". *Confusability:* `wh-641`/`wh-642`/`wh-643` the king, the label and the order; `wh-644`/`wh-645`/`wh-646`/`wh-647` the label, the massacre, the war and the peace (Augsburg on `wh-644`, the window on `wh-646`, the papal brief on `wh-647`); `wh-649`/`wh-650` the period and the astronomer. *Against other cards:* none in `gr-`, `rm-`, `cnh-`, `ru-` or `us-`; `wh-641`'s accession day was dropped (no readable source); none edited.

**Glossary.** Nine terms rewritten (*Henry VIII*, *Counter-Reformation*, *European wars of religion*, *St. Bartholomew's Day massacre*, *Thirty Years' War*, *Peace of Westphalia*, *Witch trials in the early modern period*, *Scientific Revolution*, *Nicolaus Copernicus*); *Jesuits* kept.

### B66 — `wh-651`–`wh-660`, Renaissance, Reformation and the new science and Voyages, conquest and exchange (2026-10-22)

Run as B65; the scientists' dates are labelled by calendar and the voyage cards give each chronicler's version as theirs. Pictures skipped. Most old sources were archive.org books (Rouse Ball, Dreyer, Payne, Beazley) that were unreachable to some agents and were replaced by pages read; where an agent used archive.org or Gutenberg it says so in its notes.
Checks: `wh-audit.js --range=wh-651:wh-660` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; of 70 distinct URLs one (a Royal Society history page on `wh-654`) answers 403 to the URL check though an agent read it.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-651` Galileo Galilei | 9 | 5 → 9 | **The date line stretched one event over two years and the telescope was not Galileo's**: now one Sidereus Nuncius row (March 1610); the telescope is a Dutch invention (Lipperhey's patent request of 1608) that he improved in 1609. The 1616 row is 26 February: the Inquisition's file note records a formal order, Bellarmine's certificate says only that the doctrine could not be held or defended, and the dispute is attributed to the Stanford Encyclopedia. "Eppur si muove" is a Think-it-through answer (no contemporary source; Cambridge calls it apocryphal). |
| `wh-652` Johannes Kepler | 8 | 5 → 8 | **Birth is a Julian date** (27 December 1571, the Gregorian reform came in 1582) and no page read names the calendar of the death on 15 November 1630, so the abstract says "calendar not stated". The ellipse is attributed to the Stanford Encyclopedia, with the area law found first and Kepler never calling his three results "laws"; his mother's trial runs from 1615 for about six years (SEP's "end of 1617" conflicts with the Kepler Commission and Cambridge). Tycho's name on the Tables' title page and "the most accurate observations ever made" are dropped. |
| `wh-653` Isaac Newton | 9 | 5 → 9 | **"Lived 1642 – 1727" mixed two calendars**: now Born and Died each as Old Style and New Style (25 December 1642 / 4 January 1643; 20 March 1727 / 31 March), with the Lucasian chair (October 1669) and the *Principia* (1687); the "plague years" row is gone. The apple rests on Stukeley's account of April 1726; "answered at once" is Newton's later account to de Moivre; the Leibniz dispute, alchemy and theology are added with sources; "about three hundred copies" is dropped. |
| `wh-654` scientific method | 9 | 5 → 9 | **The date line (Vesalius 1543, Bacon 1605 and 1620, the *Principia* 1687) was a list of other events' dates**: emptied, undatable true. The disputed-single-method view is added with Popper, Kuhn and Feyerabend each attributed; Ibn al-Haytham, Bacon and Descartes appear only where a source supports each; "Lord Chancellor", "made no discovery" and the Vesalius claim are dropped. |
| `wh-655` Royal Society | 8 | 5 → 8 | **Foster (1908) conflated Wallis's London meetings of c. 1645 with Boyle's "invisible college"**: each view is now attributed and the date line carries only the first meeting (28 November 1660), the first charter (15 July 1662) and the second (1663). *Philosophical Transactions* began as Oldenburg's own property; the Society took over its finances only in the mid-18th century. Naples 1560, Newton, Sprat and Dublin are dropped. |
| `wh-656` Age of Discovery | 8 | 5 → 8 | **The four-event date line (Ceuta, Bojador, Calicut, the Magellan circuit) is emptied, undatable true**: "Age of Discovery" is the traditional name (Parker), research now roots it in older Eurasian contact, the Western Hemisphere was already inhabited (Library of Congress) and East Polynesia was settled earlier by radiocarbon. The 927 captives, the quadrupled spice price and Dias at the Great Fish River are dropped; Zheng He is left out (no citable page). |
| `wh-657` Henry the Navigator | 8 | 6 → 8 | **"Captives landed 1441 – 1448" became one row, Lagos captives 1444**, with Lived 1394 – 1460, Ceuta 1415 and Bojador passed 1434. "The Navigator" is a later label; the Sagres school is not proven (Beazley left it open in 1899; Polónia and Russell, via Donovan, call it a myth); Zurara is a panegyrist who gives five reasons for the enterprise; unsourced claims are dropped. The Sagres locator is kept. |
| `wh-658` caravel | 8 | 5 → 8 | **"Portuguese use 13th – 16th centuries" was a century alone**: emptied, undatable true. "Up to 300 tons" is dropped (Castro gives 15 – 50 tons); "set aside 1497" is wrong (da Gama's fleet included the caravel *Bérrio*); Zurara calls the 1434 vessel a *barcha*; the origin is hedged (*cáravo*, *qârib*). The claim that Henry invented it is groundless (a modern reference work). |
| `wh-659` Cape Route | 7 | 5 → 8 | **"Quadrupled duties" is dropped and "Dias at the Cape late 1480s" is now a row**: Dias lands 3 February 1488 at Mossel Bay, Gama at the Cape 22 November 1497 (the anonymous Journal; Castanheda and Barros say the 20th), off Calicut 20 May 1498. The Indian Ocean is shown as an existing trade system; one study finds more spice reached Venice than Lisbon in 1500 and 1502; the turn at the Great Fish River is "some historians believe". |
| `wh-660` Vasco da Gama | 9 | 5 → 9 | **Birth is uncertain**: c. 1460 (Ravenstein, who calls 1469 unsupported) or 1448 (a 2019 article). The return to Lisbon is 29 August, 8 or 18 September 1499 in different sources; the Journal's author is unidentified; casualty figures are dropped ("more than half" is the 1504 grant's); the burned Mecca ship of 1502 is told differently by Correia, Barros, Osório and San Román; death at Cochin 24 December 1524 (Ravenstein has a 24/25 discrepancy). |

**Read by eye.** *Article:* "Galileo Galilei", "Johannes Kepler", "Isaac Newton", "Vasco da Gama" bare; "the scientific method", "the Royal Society" ("the ____ of London"), "the Age of Discovery" ("the label ____" in one phrasing), "the Cape Route" and "the caravel" with "the" where the sentence needs it; "Henry the Navigator" bare except "the prince later called ____". Question 3 of `wh-658` said the caravel was "among the least understood of historic ships" and now states only that no wreck has been certainly identified. *Confusability:* `wh-653` against `wh-654` by the *Principia* and the Halley story, `wh-651` against `wh-652` by the telescope and the ellipse; `wh-655` the society and its journal; `wh-657`/`wh-658` the prince and the ship (Gil Eannes and Bojador on `wh-657`, the lateen rig on `wh-658`); `wh-659`/`wh-660` the route and the captain (Dias and the Journal on `wh-659`, Restelo and the Mecca ship on `wh-660`). *Against other cards:* none in `gr-`, `rm-`, `cnh-`, `ru-` or `us-` covers these ten; none edited.

**Glossary.** Ten terms rewritten (*Galileo Galilei*, *Johannes Kepler*, *Isaac Newton*, *Scientific method*, *Royal Society*, *Age of Discovery* with its date emptied, *Henry the Navigator*, *Caravel*, *Cape Route*, *Vasco da Gama*).

### B67 — `wh-661`–`wh-670`, Voyages, conquest and exchange (2026-10-22)

Run as B66, the conquest cards drafted with the chroniclers and conquistadors as sources for what they report ("Cortés says…", "Díaz says…") and every toll or force size given as a participant's claim. Pictures skipped.
Checks: `wh-audit.js --range=wh-661:wh-670` all ten clean (a Q.sibling note on `wh-666`/`wh-665` is only a note); `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 59 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-661` Christopher Columbus | 9 | 5 → 9 | **Payne's 1902 inferences were stated as fact and the date line had no birth**: now Born 1451 (the Italian biographical dictionary), Contract 17 April 1492, First landfall 12 October 1492, Died May 1506 (19 May in the dictionary, 20 May in another account). The log survives only as Las Casas's copy, the landfall island is unresolved, the flat-earth story is a 19th-century myth (Russell), the Taíno carry no population figure, and Bobadilla's arrest of 1500 is added. |
| `wh-662` Treaty of Tordesillas | 8 | 5 → 8 | **The unsourced kilometre conversion, "divided the world" and the Zaragoza row (another event) are dropped**; the treaty's own wording and provenance are added. Ratified by Castile on 2 July and Portugal on 5 September 1494; reasons are attributed (Las Casas for Portugal, Bourne for Castile, Payne for Francis I's jibe); the line was never marked because longitude could not be measured. |
| `wh-663` Magellan expedition | 8 | 5 → 8 | **Both departures are now rows**: left Seville 10 August 1519 and left Sanlúcar 20 September 1519, with Magellan killed on Mactan (27 April 1521) and back at Sanlúcar 6 September 1522. Elcano's *Victoria* completed the circuit; 237 men is Pigafetta's count and 265 comes from later lists; the St Julian details and the Tordesillas-persuasion claim are dropped. |
| `wh-664` conquistador | 8 | 5 → 8 | **The date line (Vera Cruz 1519, Cajamarca 1533, "Encomienda law 1536") was other events' dates**: emptied, undatable true. Funding, the royal fifth and rewards are attributed (Díaz; a capitulación); Díaz and Las Casas are labelled partisan; no casualty or gold figures are given; the Requerimiento is dated to 1513 by one reference work. |
| `wh-665` Hernán Cortés | 8 | 5 → 8 | **Birth is "c. 1485" (MacNutt, "the chroniclers"); no page read prints 1484**. Death at Castilleja de la Cuesta on 2 December 1547 is confirmed. No source says the ships were burned (Díaz: stripped, then destroyed); the Tlaxcalan numbers are an archaeologist's; Cortés's letters tell the campaign his way; the questions were replaced. |
| `wh-666` fall of Tenochtitlan | 7 | 5 → 7 | **"Spaniards out 1520" is dropped and the siege count is Cortés's**: 30 May to 13 August 1521 is his own 75-day count. The allied and dead figures are each the participants' (Cortés about 900 Spaniards and over 150,000 allies, more than 50,000 dead; a 2021 article nearly 70,000 men); Sahagún says twelve brigantines where Cortés says thirteen; Eguía as the carrier is an 1829 editor's note. |
| `wh-667` Francisco Pizarro | 8 | 5 → 8 | **The arrival on 15 November was labelled the seizure and a 3 May 1533 "ransom melted" row had no source**: now Capitulation 26 July 1529, Seized Atahualpa 16 November 1532 (Xerez: entered on the 15th), Killed 26 June 1541; the execution is prose only (Kolata 26 July 1533, Prescott 29 August). The muster of 62 horse and 102 foot is Xerez's, set against Prescott's 177; the birth year is unrecorded. |
| `wh-668` Spanish conquest of the Inca Empire | 7 | 5 → 7 | **The span 1532 – 1572 is now a stated convention** (most scholars treat Vilcabamba's fall and Túpac Amaru's death as the end); the year is removed from the questions; the Potosí and unsourced details are dropped, and the glossary's "landing" became "invasion". Manco's rising (1536), Almagro's death (8 July 1538) and Pizarro's (26 June 1541) are sourced; the Cajamarca-as-whole-story view is called an ideological choice by one historian. |
| `wh-669` Columbian exchange | 8 | 5 → 8 | **The date line (From 1492, Maize in Africa mid-16th century, Cassava in Angola 1593) is cut to Began 1492**; the term was coined by Crosby in 1972 for a many-sided process. Mortality is each source's range with whose it is (75 – 95 per cent and a 10 – 120 million starting population; up to 90 per cent); the flat smallpox toll, the silver claims, the potato and maize in China are dropped (no readable source); Cieza is "says". |
| `wh-670` cocoliztli | 6 | 5 → 6 | **"Smallpox 1519 – 1520" is another event's row and the toll was flat**: now two waves (1545 – 1548, 1576 – 1578; one study dates the later to 1580), the toll attributed (5 – 15 million, up to 80 per cent, to one group of authors, built on reconstructions). The cause is three attributed views (a rodent-borne haemorrhagic fever; *Salmonella enterica* Paratyphi C in ten burials at Teposcolula-Yucundaa; epidemic typhus), with ancient viruses that could not be linked; Hernández's symptoms come via a review. |

**Read by eye.** *Article:* "Christopher Columbus", "Hernán Cortés", "Francisco Pizarro" bare; "the Treaty of Tordesillas", "the Magellan expedition", "the fall of Tenochtitlan", "the Spanish conquest of the Inca Empire", "the Columbian exchange" and "the cocoliztli epidemic" with "the"; "a conquistador" as "a ____". Question 1 of `wh-666` said the siege "lasted seventy-five days" (a figure of days, and Cortés's own count) and now says only that Cortés dated it from the end of May; question 3 of `wh-666` was rebuilt so that the blank reads in place. *Confusability:* `wh-664`–`wh-668` the type, two men and two conquests (the Requerimiento and the capitulación on `wh-664`, the letters and Vera Cruz on `wh-665`, the brigantines and the water pipes on `wh-666`, Cajamarca on `wh-667`, Vilcabamba on `wh-668`); `wh-669`/`wh-670` the exchange and one epidemic (the Quito wheat and Cieza on `wh-669`, Hernández's symptoms on `wh-670`); `wh-661`/`wh-662` the man and the treaty. *Against other cards:* `wh-612` agrees with `wh-667`/`wh-668` on Cajamarca in 1532 and Vilcabamba in 1572 (only `wh-667` prints the day, 16 November, and `wh-612` leaves it off); `wh-605`/`wh-606` agree on the Mexica; none edited.

**Glossary.** Nine terms rewritten (*Treaty of Tordesillas*, *Magellan expedition*, *Conquistador*, *Hernán Cortés*, *Fall of Tenochtitlan*, *Francisco Pizarro*, *Spanish conquest of the Inca Empire*, *Columbian exchange*, *Cocoliztli*); *Christopher Columbus* kept.

### B68 — `wh-671`–`wh-680`, Voyages, conquest and exchange (2026-10-23)

Run as B67: the silver, labour and company cards give every figure as a named source's, and the colonial cards (`wh-679`, `wh-680`) were read against the `us-` cards. Pictures skipped.
Checks: `wh-audit.js --range=wh-671:wh-680` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 76 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-671` Potosí | 7 | 6 → 7 | **The strike, mercury and mita years differ by source and are now labelled rows**: silver found 1545 (1545 or 1546; Cieza says the hill was not worked before 1546), mercury trial 1571 (Bakewell and Acosta; 1570 or 1572 elsewhere), mita begun 1572 – 1573. The flat "a seventh of the men" is Salazar-Soler's 15 per cent average and 9,000 mitayos rising to over 14,000; population over 100,000 by 1600 is Bakewell's; no source was found for the "eight million dead", so it is left out. |
| `wh-672` piece of eight | 8 | 5 → 8 | **"In Manila trade from 1571" and "worth 8 reales" were not a start**: emptied, undatable true, since no source gives the coin a start (it was struck in quantity under Charles V and Philip II). Smith's six million sterling is for gold and silver at Cadiz and Lisbon in about 1776, not Seville, and is dropped; the viceroy's 1574 letter says "gold and silver … nothing else", not "pieces of eight only"; imported coins were melted into ingots in China until the 1730s; legal tender in the United States until the Act of 1857. |
| `wh-673` encomienda | 7 | 5 → 8 | **The date line was wrong**: now Royal order December 1503, Laws of Burgos 27 December 1512, New Laws 1542, Clause revoked 20 October 1545 (the 1545 letter revoked only the inheritance clause). "1497" is Bourne's inference for Columbus's grants to Roldán's rebels (an encyclopedia gives 1499), both attributed; the three-million toll is Las Casas's claim, judged a wild exaggeration by Bourne. |
| `wh-674` Spanish Empire | 8 | 5 → 8 | **The old date line was other events' dates** (the Casa 1503, "two kingdoms by 1574", the Manila court 1584): now In the Americas 1492 – 1898 (one encyclopedia's convention) and Mainland ended 1824. The viceroyalties are dated "between 1535 and 1542" because two sources differ; the unverifiable "two kingdoms by 1574" is dropped; whether the Indies were colonies is an attributed debate. |
| `wh-675` Portuguese Empire | 8 | 5 → 8 | **The date line was three other events' dates** (Albuquerque 1509 – 1515, the split of 1571, Grotius 1609): now Counted as 1415 – 1999 (this card's own reckoning; no source read states it as a convention) and Estado da Índia 1505 – 1961. The Atlantic half the old card omitted is added (Ceuta, Brazil, two attributed slave-trade estimates); the Goa death toll is a 1899 history's, on Albuquerque's own letter; the question about "a conventional reckoning" now reads "one way of counting". |
| `wh-676` Dutch East India Company | 8 | 5 → 9 | **The date line had no end and "Batavia wrecked 1629" was a ship, not the city**: now Chartered 20 March 1602, Directors out 1 March 1796, Charter revoked 1 January 1800 (Dutch National Archives; Gaastra). No source gave 31 December 1799. The *Santa Catarina* seizure is 1603 off Singapore (Borschberg); the "first" claims are dropped or attributed; Banda 1621 and slavery use Vink's figures. |
| `wh-677` East India Company | 8 | 5 → 9 | **The Company's end and its charter were missing or unsourced**: now Chartered 31 December 1600 (Old Style), First voyage 1601, Crown took over 1858, Dissolved 1874. The perpetual-1609, twelve-charters and Roe-to-1619 claims came from unreachable archive.org volumes and are dropped; the 15-year term is a 19th-century history's; Plassey, 1765, 1813 / 1833 and 1857 – 58 are added. |
| `wh-678` Manila galleon | 7 | 5 → 8 | **"Last sailing 1815" is two events**: the Cortes decree of 14 September 1813 and the last sailing to Manila in 1815. The route opened in 1565 (Urdaneta), Manila founded in 1571; voyage lengths and the 50 tons of silver a year are a Library of Congress estimate; the Glasinovic article is behind a bot wall, so it and its Carrión claim are dropped. |
| `wh-679` Jamestown | 8 | 5 → 8 | **The old abstract said the settlement was "abandoned altogether in 1610"**: the survivors were turned back by a relief fleet. Landing is 13 – 14 May 1607 (Percy's 13th and 14th), the first assembly 30 July 1619 (the old line said only 1619), and the first Africans in August 1619 in the source's wording. Powhatan is an agent; the Starving Time tolls are Smith's against the Foundation's; Smith's Pocahontas rescue is attributed. The card's `wiki` read "Jamestown, Saint Helena" (the wrong article) and was corrected in `wiki-links.json`. |
| `wh-680` New England | 8 | 5 → 10 | **"The charter said nothing about religion" was false** (it names converting the Native people as the principal end). The line is Named 1616 and Colonised from 1620. The 1616 – 19 epidemic carries Marr and Cathey's toll range; Pilgrims and Thanksgiving are later labels; Winthrop's sermon went unnoticed until 1838; the Pequot toll is about 300 (Winthrop) against about 600 (Mashantucket Pequot Museum). |

**Read by eye.** *Article:* "Potosí", "Jamestown" bare; "the piece of eight" and "the silver ____" for the coin; "an ____" for the encomienda; "the Spanish Empire", "the Portuguese Empire" (one phrasing "one way of counting begins the ____"), "the Dutch East India Company", "the East India Company" ("the ____ they formed"), "the Manila galleon" and "New France" with "the" where the sentence needs it. Question 2 of `wh-672` had said the viceroy wrote "pieces of eight only" and now follows his letter ("gold and silver … nothing else"). *Confusability:* `wh-671`/`wh-672`/`wh-678` the mountain, the coin and the ship (huayras and the mita on `wh-671`, Smith and China on `wh-672`, Urdaneta and the Cortes decree on `wh-678`); `wh-673`/`wh-674`/`wh-675` the grant, the Castilian empire and the Portuguese one (the Casa and residencia on `wh-674`, cartazes and Brazil on `wh-675`); `wh-676`/`wh-677` the two companies, told apart by the Banda Islands and the *Santa Catarina* on `wh-676` and Roe, Plassey and 1858 on `wh-677`; `wh-679`/`wh-680`/`wh-681` the three colonies. *Against other cards:* `us-052` gives a Kondiaronk death detail that disagrees with the *Dictionary of Canadian Biography* (noted by the `wh-681` agent) and is left to that card's pass; no `us-` card disagrees with `wh-680`; none edited. **Cross-card note:** `wh-679`'s `wiki` field read "Jamestown, Saint Helena" (a wrong article from the glossary pairing) and was corrected to *Jamestown, Virginia* in `.claude/wiki-links.json` (marked `manual`) and re-applied.

**Glossary.** Ten terms rewritten (*Potosí* with its date changed to "silver found 1545", *Piece of eight*, *Encomienda*, *Spanish Empire*, *Portuguese Empire*, *Dutch East India Company*, *East India Company*, *Manila galleon*, *Jamestown*, *New England*).

### B69 — `wh-681`–`wh-690`, Voyages, conquest and exchange and The gunpowder empires (2026-10-23)

Run as B68. Pictures skipped.
Checks: `wh-audit.js --range=wh-681:wh-690` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on nine and one on `wh-688`, which is the journal's own transliteration, not the cited work: the Volgograd paper prints "Tatyana V. Kushch" in its byline (and "Tatiana V. Kushch" under the author note) where Crossref has "Tatiana Kushch"; left as printed. None of 70 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-681` New France | 8 | 5 → 8 | **3 July 1608 is Champlain's arrival, so the row is relabelled Quebec begun**; Montreal's fall (8 September 1760) is added and "ceded whole" is dropped (Acadia went in 1713 and part of Louisiana to Spain). The century-alone clause and the Lescarbot claims are gone; Talon's census figures carry his biographer's reliability caveat. |
| `wh-682` Russian conquest of Siberia | 7 | 5 → 8 | **The Okhotsk 1639 line was wrong**: 1639 is Moskvitin reaching the Pacific coast and the town dates from 1647 / 1648; "about a century" is dropped (the Pacific came in about six decades). The Yermak start (1581 or 1582), the band's size and his death year are attributed to their sources; Fletcher is a named witness (in 1588, not 1591); the smallpox toll is Richards's, set against a 2026 Nature DNA study of the Yakut. |
| `wh-683` James Cook | 9 | 5 → 10 | **Dates rebuilt**: Lived 27 October 1728 – 14 February 1779, Endeavour sails 26 August 1768 from Plymouth (the old 30 June was the Thames), Transit observed 3 June 1769. The stabbed-in-the-back claim and the scurvy "cure" claims are dropped (Samwell has a club first, the printed account a dagger; Short's modern assessment counts ten mild cases); the Gweagal and Māori / Tupaia points on "discovery" are added. |
| `wh-684` mercantilism | 8 | 5 → 8 | **The date line (Navigation Act 1651, classic tract 1664, "attacked 1776") was other events' dates**: emptied, undatable true. Added the doubt that it was a coherent doctrine (Paganelli), the bullion versus balance-of-trade split, Mun's book printed by his son in 1664, Colbert and the Dutch; the East India Company "director" claim and Mun's figures are dropped; Mun's writing date and the coining of the label had no readable source. |
| `wh-685` Mercator projection | 8 | 5 → 8 | **The Greenland comparison is with South America, not Africa** (Snyder, USGS). Sheet counts disagree (Snyder 21; Kljajić and Pöhling 18), so only the size is printed; Wright's 1599 tables stay a labelled row; "standard for navigation" is qualified (Gaspar); a study of 2016 concludes it did not suit the navigation of Mercator's day. |
| `wh-686` bombard | 6 | 5 → 6 | **The date line (Constantinople, the Dardanelles Gun, Lepanto) listed a siege, a gun and an unrelated battle**: emptied, undatable true; the Lepanto sentence is dropped. The 177 kg charge and 600 kg ball are a reconstruction's; Orban's death is reports', set against Leonard of Chios as retold by Pears. Sources 5 → 6. |
| `wh-687` Ottoman Empire | 9 | 5 → 9 | **"1299" is Ottoman tradition's year for Osman**, so the row is Reckoned from 1299 (İnalcık) and Sultanate ended 1 November 1922 (the republic of 29 October 1923 in prose). The "Suleiman crowned 1520" and "Lepanto 1571" rows and the unsourced army, ducat and dock figures are gone; "gunpowder empires" is Hodgson and McNeill's, with Getz's caveat. |
| `wh-688` Mehmed II | 8 | 5 → 8 | **The old line had no life dates**: now Lived 30 March 1432 – 3 May 1481, both reigns and Took the city 29 May 1453 (İnalcık). Gennadios (January 1454) rests on Nicol; the Armenian patriarchate of 1461 is an Armenian Church account and is out of the line; the poisoning story is marked unconfirmed; the 177 kg and 500 m figures stated as fact are dropped. |
| `wh-689` janissary | 7 | 5 → 7 | **"Barracks built after 1453" was not a start**: now Founded c. 1350 – 1400 (Veinstein: probably Murad I, the origins obscure) and Abolished 17 June 1826 (Gül; Veinstein gives 18 June for the shelling). The superlative is dropped; no source gives levy totals; the counts are Veinstein's against Ágoston's and hypothetical. |
| `wh-690` Suleiman the Magnificent | 8 | 5 → 8 | **"Called the Legislator by his own subjects" was wrong**: Emecen traces *Kanuni* to Cantemir's 18th-century history, and "the Magnificent" is a Western title. Now Lived 1494 – 1566 (birth attributed to Lokman; another source gives 1496) and Reigned 1520 – 1566; the "Kitab-i Bahriye 1521" row (Piri Reis's book) is gone; Mustafa's strangling and the concealed death at Szigetvár are attributed. |

**Read by eye.** *Article:* "New France", "Russian conquest of Siberia" ("the ____"), "James Cook", "Mehmed II", "Suleiman the Magnificent" bare; "mercantilism" ("the label ____"), "the Mercator projection", "the bombard", "the Ottoman Empire" and "a janissary" with the article the sentence needs. Question 3 of `wh-684` said the book "attacked" twice and now says "criticised". *Confusability:* `wh-683` the voyages against `wh-661` and `wh-663` by the transit of Venus and Kealakekua Bay; `wh-685` the map against `wh-684` the doctrine; `wh-686` the gun against `wh-688` the sultan (Orban and the walls on `wh-686`, Gennadios and Bellini on `wh-688`); `wh-687`/`wh-688`/`wh-689`/`wh-690` the state, the conqueror, the corps and the lawgiver (the 1922 abolition on `wh-687`, the Auspicious Event on `wh-689`, Szigetvár on `wh-690`). *Against other cards:* `ru-` Siberia cards were read for `wh-682` and not edited; no `gr-`, `rm-`, `cnh-` or `us-` card covers the Ottoman cards; none edited. **Cross-card note:** `wh-688` keeps its picture, whose description and alt say "profile" where the National Gallery says the face is turned slightly toward the viewer.

**Glossary.** Nine terms rewritten (*New France*, *James Cook*, *Mercantilism*, *Mercator projection*, *Bombard*, *Ottoman Empire*, *Mehmed II*, *Janissary*, *Suleiman the Magnificent*); *Russian conquest of Siberia* kept.

### B70 — `wh-691`–`wh-700`, The gunpowder empires (2026-10-23)

Run as B69, which ends this thread's range: **`wh-601`–`wh-700` are done, and the audit continues at `wh-701` (B71, The gunpowder empires)**. The Ottoman, Safavid and Mughal cards attribute belief and tradition to those who hold it ("Twelvers believe…") and the chroniclers as sources for what they report. Pictures skipped.
Checks: `wh-audit.js --range=wh-691:wh-700` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on nine and, first, one on `wh-695` (a Cambridge chapter printed in 2010 that Crossref dates 2000: now "2010; published online 2000"), then 0; none of 66 distinct URLs non-2xx. Drafts of `wh-693` and `wh-694` came back with a doubled full stop before every marker (".." for "."); fixed in the drafts before applying.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-691` Siege of Vienna | 8 | 5 → 8 | **The date line carried Mohács, a different event, and the sizes were stated flat**: now Besieged 27 September – 14 October 1529 (Vienna's city history wiki) with an "Also dated" row ending 15 October (another entry; Berman gives 16 October for the decision to retreat). The "furthest west a sultan went" claim is dropped; the Ottoman force is 80,000 to 150,000 people and the defenders 17,000 to 25,000, each source's own figure; the old 200,000 – 250,000, 16,000 and 72 guns are gone; withdrawal reasons are attributed. |
| `wh-692` Battle of Lepanto | 8 | 5 → 8 | **The date rows are now the League's formation (25 May 1571, signed 20 May), the battle (7 October 1571) and Venice's separate peace (18 March 1573)**. Ship and casualty figures are named sources' (one study 62,100 men and 1,334 guns against 57,700 and 741; 117 Ottoman galleys captured and over 8,000 Christian dead against an encyclopedia's 30,000 killed or captured). The "undeceived" line is a character's in *Don Quixote*, not Cervantes's, so the question now quotes his own words ("the grandest occasion"). |
| `wh-693` millet system | 7 | 5 → 7 | **The old line gave a codification ("Codified 1839 – 1876") as a start**: emptied, undatable true. The abstract sets the account of Gennadius's appointment in January 1454 (from 16th-century patriarchal chronicles) against the fact that the oldest surviving patriarchal berat is of 1662, notes the dispute over the word and the reforms of 1839 – 1865, and leaves out the Armenian patriarchate of 1461 (no readable source). Lybyer and Creasy dropped. |
| `wh-694` Battle of Vienna | 8 | 5 → 8 | **The siege runs 14 July – 12 September 1683** (the Royal Collection Trust; a print of the period gives 13 July), the relief battle on 12 September. Every figure is attributed (200,000 Ottomans in a Habsburg exhibition; 11,000 soldiers in the city, against 13,000 infantry and 7,000 citizens in an older history; a relief force of 70,000 against 85,000 in all and about 77,000 able to fight); a 275,000 muster-roll figure is dropped; no detail of 1529 appears. |
| `wh-695` Safavid Empire | 7 | 5 → 9 | **"Founded 1501 | Chaldiran 1514 | Fell 1722" had no end**: now Shah at Tabriz 1501, Chaldiran 23 August 1514, Isfahan taken 1722 and Line ended 1736 (Roemer: Nader Shah). That Ismail made Twelver Shi'ism the state religion is "one historian says", with an article titled "The Myth of the Clerical Migration to Safawid Iran" disputing how many Arab scholars came; "gunpowder empire" is Hodgson and McNeill's; Sykes-only claims are dropped. |
| `wh-696` Abbas the Great | 7 | 5 → 8 | **"Reigned 1587 – 1629" and "Tabriz retaken 1603"**: now Lived 1571 – 1629, Reigned 1588 – 1629 (Matthee; the Library of Congress study and Haneda give 1587), Armenians moved 1604 – 1605 and Hormuz taken 1622; Tabriz was attacked in September 1603 and retaken by June 1604. The epithet *bozorg*, the ghulam caveat (no source dates the corps), the contested number of deported Armenians (about 400,000 in one article, "thousands" in another) and his sons are added; "halved" tribes, Sherley's artillery and the substitute king are dropped. |
| `wh-697` Isfahan | 8 | 5 → 8 | **"Safavid capital c. 1598 – 1722" made Isfahan a Safavid creation**: emptied, undatable true; the move is attributed (1598 in MIT and OpenStax, a decision of 1590 in Sexton, early-1590s works in the Belleten). The 300,000 population and "largest city" are dropped; population is Olearius's own estimate (about 500,000, over 18,000 houses) and one table's c. 25,000 around 1520; the siege of 1722 carries no death toll beyond "many died of starvation or disease". |
| `wh-698` Twelver Shia Islam | 7 | 5 → 8 | **"Occultation 874 | State religion 1501" mixed a tradition's date with a political process**: emptied, undatable true. 874 and 941 are the Twelver tradition's dates (Institute of Ismaili Studies); beliefs are given as "Twelvers believe"; the Tabriz "two thirds Sunni" claim, the Selim 40,000 figure and the Iran-only glossary sentence are dropped; the conversion is described as coercive by the scholars cited, one of whom calls "state religion" vague. |
| `wh-699` Mughal Empire | 8 | 5 → 9 | **"Line ended 1857" is 1858** (the last emperor was tried and exiled to Rangoon after the rising of 1857): now Founded 1526 and Dynasty ended 1858. The year of the twelve subas is left out (the source's OCR reads 1380 and the *Ain* places its account in the 40th regnal year); "single administration until the early 18th century", the flat 174.5 million rupees and "a century after its power had gone" are dropped; Richards's 1720 periodisation is attributed. |
| `wh-700` Babur | 8 | 5 → 8 | **"Became king at twelve" was wrong**: Babur writes "the twelfth year of my age", so he was eleven. The line is Born 14 February 1483, King of Ferghana June 1494, Won Panipat 21 April 1526, Died 26 December 1530; Beveridge's reading of Babur's Friday gives 20 April, which the abstract says. The elephant count and "aged 48" are dropped; the *Baburnama* is attributed ("Babur writes"). |

**Read by eye.** *Article:* "the Siege of Vienna", "the Battle of Lepanto", "the millet system" ("what later writers called the ____"), "the Safavid Empire", "Isfahan" ("half the world"), "Twelver Shia Islam" ("making ____ the religion of Iran"), "the Mughal Empire" with "the" where the sentence needs it; "Abbas the Great" and "Babur" bare. Question 3 of `wh-693` stated the system as fact and now says "the arrangement later writers call the ____"; the Cervantes question of `wh-692` was rebuilt on his own words. *Confusability:* `wh-691` (1529: Zápolya, mines, rain) against `wh-694` (1683: the Kahlenberg, Sobieski, Kara Mustafa); `wh-692` against `wh-686` by galleasses and Cervantes; `wh-695`/`wh-696`/`wh-697`/`wh-698` the state, the shah, the city and the faith (Chaldiran and the Qizilbash on `wh-695`, the ghulams and the Armenians on `wh-696`, the square and Olearius on `wh-697`, the occultation on `wh-698`); `wh-699`/`wh-700` the empire and its founder (the Ain-i Akbari on `wh-699`, the dovecote and the carts on `wh-700`). `wh-696` and `wh-697` share the locator Isfahan (the shah's capital and the city's own card). *Against other cards:* no `in-` card exists to compare; `wh-687`'s "Reckoned from 1299" agrees with the other Ottoman cards; `wh-695`/`wh-698` agree on 1501; the 1453 conquest is `wh-688`'s. **Cross-card notes for the next threads:** `wh-598` (Golden Horde, c. 1260 – 1502) disagrees with `ru-100` (from 1242), left to that card's pass; `wh-721` (Sengoku) may need its start hedged (usually 1493, found in `wh-538`); `wh-617` and `us-017` disagree on the Mississippian span, and `us-052` has a Kondiaronk death detail the *Dictionary of Canadian Biography* contradicts, all left to those cards' passes. **CI note:** the eager-path size check was red on main before this thread (4289 KB against 3400), and is not this audit's to fix.

**Glossary.** Ten terms rewritten (*Siege of Vienna*, *Battle of Lepanto*, *Millet system*, *Battle of Vienna*, *Safavid Empire*, *Abbas the Great*, *Isfahan*, *Twelver Shia Islam* kept general, *Mughal Empire*, *Babur*).

### B71 — `wh-701`–`wh-710`, The gunpowder empires (2026-10-23)

Run as B70, which ended at `wh-700`: **`wh-601`–`wh-710` are done once this batch lands.** The Mughal cards attribute the chroniclers' reports to the chroniclers (Abu'l-Fazl, Badauni, Lahori) and the Sikh cards attribute belief to Sikhs; `in-` is empty, so there were no Indian cards to compare. Pictures skipped (Wikimedia still refuses this sandbox).
Checks: `wh-audit.js --range=wh-701:wh-710` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on nine and one on `wh-710`, which is a translated book: the Russian edition of Fisher's *The Crimean Tatars* (1978) is catalogued with its translators as authors (Seitkhalilova and Alieva), where the card names Fisher; left as printed. None of 72 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-701` Akbar | 8 | 5 → 8 | **Five guidebooks and histories of 1896 – 1917, two cited for claims they do not carry, are replaced.** The jizya is a labelled row (1564 per Abu'l-Fazl; 1579 per Badauni; Lane-Poole gives 1562); the birth date is the official one; the death is 25 – 27 October 1605 because accounts differ. That he could not read is now "several historians report it" (Jahangir's memoir says nobody knew); the Divine Faith is "historians report"; "tolerance" is a label whose users are named; the Hall of Worship at first admitted only Muslims (a Zoroastrian priest came in 1578 and the first Jesuit mission in 1580), not "Hindus, Jains, Parsis and Jesuits by 1578". |
| `wh-702` Shah Jahan | 8 | 5 → 9 | **"Reigned 1628 – 1658" was an accession date stated flat, and "died December 1666" was wrong**: enthroned 6 February 1628 (Lahori), confined 8 June 1658 (Sarkar) or 18 June (Lane-Poole), died 22 January or 1 February 1666 (both Sarkar). Born 6 January 1592 rests on a note to the *Akbarnama* (an edition of Bernier gives 1593). The "respected like a deity" anecdote and the Peacock Throne fetched "for the Id festival" are dropped; "last seven years a prisoner" is about seven and a half. |
| `wh-703` Taj Mahal | 9 | 5 → 9 | **The old line gave Mumtaz Mahal's death, a vague start and a second burial**: now one row, Built 1632 – 1653 (a university teaching text), with the competing completion dates in the prose (January 1643 in chronicles quoted by Sarkar; 1648 for the tomb and 1653 for the rest per a tourism department; 17 years to 1648 per the Archaeological Survey). "22 years and twenty thousand men" and the scaffolding cost are the jeweller's report ("it is said"). The unsourced 57 and 79 metres are dropped (platform and court sizes are Fergusson's); Ustad Isa as architect rests on an 1771 – 1827 manuscript, and Verroneo is explained. |
| `wh-704` Aurangzeb | 7 | 5 → 9 | **The old line mixed the reign with the jizya, the Deccan move and a death date**: now Born 1618 and Reigned 1658 – 1707, with the death day in prose (20 February 1707 in Sarkar, 4 March in Lane-Poole). "Bigot" and "ascetic" are gone: the piety claims are Lane-Poole's and the jizya of 1679 is a chronicle report; the official history of his first ten years was stopped, so the later years rest on letters. The Burhanpur 36,000 rupees (an unsourced "it is recorded") and the "widest extent" claim are dropped. |
| `wh-705` mansabdar | 6 | 5 → 7 | **The line mixed three other events** (systematised 1575, branding revived 1573, grades listed in the 1590s): emptied, undatable true, since the title is an institution with Persian and earlier Mughal precedent. Smith's 1573 – 74 and 1575 are attributed; "66 grades = the value of Allah" is Abu'l-Fazl's remark with Blochmann's note that only about half existed. The Bernier "no dukedoms" remark and the one-third strength rule are dropped; a Hungarian source behind a captcha is replaced. |
| `wh-706` Sikhism | 8 | 5 → 9 | **Four milestones become one labelled row**: Nanak lived 1469 – 1539, by Sikh tradition. Belief and events are attributed to Sikhs (the book as guru, the Khalsa, Arjan's death); the early records give his birth in Baisakh (April), the festival is kept in Kartik (November). Arjan's execution is the Sikh account, with a historian's point that sources near the time do not speak of martyrdom until the mid-18th century. "A Brahmin, a Khatri and three Sudras" (an 1849 history) is dropped. |
| `wh-707` Maratha Empire | 7 | 5 → 7 | **"Hindu power" and "confederacy" are labels**: one historian holds the state was neither empire nor confederacy, so both are his. The 1719 row reads "per Duff" (Gordon says chauth and sardeshmukhi were not formally granted until long after Shivaji; one source has the treaty made in 1718 and ratified March 1719; the deeds are lost). "Broken 1818" is the Peshwa removed in February 1818, since other Maratha houses survived as princely states. The 15-metre Panipat ditch, which no source gives, and the claim that real power passed to the Peshwas after 1713 are dropped. |
| `wh-708` military revolution | 6 | 5 → 6 | **The line was a coining date and a manual's publication, not a start**: emptied, undatable true. The competing spans sit in the abstract with whose each is (1560 – 1660 in the lecture, 1500 – 1800 in the later reading, a series of revolutions in a third). The old questions carried years and "seventy years" and are rewritten; the Mughal and Ottoman claims (a Hungarian article behind a 403) and the drill-book claims are dropped; the debate is in "one view is" form, with China and Iberian evidence from a review essay. |
| `wh-709` musket | 9 | 5 → 10 | **The line gave other events' dates for a type of object** (wheel-lock 1515, the 1607 drill book, US drill): emptied, undatable true. The Nuremberg 1515 wheel-lock date has no source and the "seven shots between noon and eight" is a one-line anecdote in a 1910 gunmaker's history: both dropped. Sources 5 → 10 from museum, ballistics, Dutch army and Japanese government pages; Mughal use now rests on a museum label alone; the Spanish musket is a museum dating. |
| `wh-710` Crimean Khanate | 7 | 5 → 7 | **"Ceded to Russia 21 September 1783" was unsourced** (annexation manifesto April 1783; the independence of 1774 a fiction, per Fisher). The span 1441 – 1783 is Başer's (as `wh-600`) and the vassalage is "after 1475". The 1571 raid carries Fletcher's and Horsey's own figures (200,000; four hours against six); Haji Girai beating the Golden Horde khan, the Genoese towns falling in one campaign and "greatest of the Tatar powers" are dropped; slave-raiding estimates are contested (Kizilov). |

**Read by eye.** *Article:* "Akbar", "Shah Jahan", "Aurangzeb" bare; "the Taj Mahal", "a mansabdar" ("the rank of a ____"), "Sikhism" bare ("founded ____"), "the Maratha Empire", "the military revolution", "the musket" and "the Crimean Khanate" with "the" where the sentence needs it. Question 1 of `wh-708` had named the historian of the thesis and now says "the historian who proposed this idea". *Confusability:* `wh-701`/`wh-702`/`wh-704` the three emperors (Bairam Khan, Himu and the debates on `wh-701`; the illness, the new capital and the tomb for his wife on `wh-702`; the burial among saints' tombs, Dara's death and the stopped chronicle on `wh-704`); `wh-702`/`wh-703` the builder and the building (the jeweller's scaffolding, the Venetian goldsmith and the water channel on `wh-703`); `wh-705`/`wh-706`/`wh-707` the rank, the faith and the state (the branding roll on `wh-705`, Nanak and the Khalsa on `wh-706`, the Benares priest and chauth on `wh-707`); `wh-708`/`wh-709` the thesis and the gun (the Dutch army appears on both, as a case in `wh-708` and as the drill plates in `wh-709`; the forked rest and the serpentine arm on `wh-709`); `wh-710` the Giray dynasty, the raids on Moscow and the annexation. *Against other cards:* no `in-` card exists; `wh-710` agrees with `wh-600` (1441 – 1783) and with `wh-598` on 1502. None edited.

**Glossary.** Nine terms rewritten (*Akbar*, *Shah Jahan*, *Taj Mahal*, *Aurangzeb*, *Mansabdar* with its date emptied, *Sikhism*, *Maratha Empire*, *Military revolution*, *Crimean Khanate*); *Musket* kept.

### B72 — `wh-711`–`wh-720`, Ming and Qing China, Tokugawa Japan (2026-10-23)

Run as B71. The Ming and Qing cards were read against the `cnh-` cards (the same dates agree except as noted); the *Eminent Chinese of the Ch'ing Period* entries are cited by headword because their printed page ranges could not all be checked. Pictures skipped (Wikimedia still refuses this sandbox).
Checks: `wh-audit.js --range=wh-711:wh-720` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 55 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-711` Ming dynasty | 9 | 7 → 9 | **The old questions carried years and the unread Giles and Kennedy scans carried the claims**, so every claim was re-sourced. Founded 1368 is explained (Hongwu took the title at the end of 1367; the reign name begins 1368); the capital moved in 1421 (decreed 1420); "fell 1644" is Beijing, with Ming princes fighting on for another decade rather than a Southern Ming end year no readable source gave. The 116 ministerial changes, the examination system, penal code and coinage claims are dropped; the drought is a tree-ring record (1625 – 1644) set beside tax and famine causes; the claim that a later sea ban broke the fleet's shipbuilding is one study's argument. |
| `wh-712` Zheng He | 8 | 5 → 8 | **Fleet sizes and ship lengths are now whoever gives them**: 317 ships and nearly 28,000 men (Columbia), 62 treasure ships (the Ming history), and the length of about 138 metres as the Ming history's, which two studies doubt (60 – 76 metres). The 1405 and 1430 orders are the Veritable Records via Wade; the burning of the voyage records rests on one text of 1574. His death is left out (one encyclopedia says 1433, another that he reached Nanjing; no citable source for 1435). "Last order 1430" is relabelled the seventh order. |
| `wh-713` Forbidden City | 9 | 5 → 9 | **The old line listed other events** (the court move, the Wen Yuan Ge, the abdication): now Built 1406 – 1420 (the edict of 1406; official records 1416 – 1420), Court moved 1421, Puyi expelled 5 November 1924 and Museum opened 10 October 1925. The 9,999½-room count is folklore, set against a 2012 count of 9,371 rooms; the Palace Museum gives 961 × 753 metres where Sirén measured 786. The Wen Yuan Ge and missionary paragraphs are dropped. |
| `wh-714` haijin | 6 | 6 → 7 | **"Canton only 1757" and "Ports opened 1685" were other events**: the line is First ordered 1371 (Zurndorfer; an economic study says 1368), Partly lifted 1567 (Longqing licensed junks for every country but Japan), Coast cleared 1661 and Lifted 1684 (Holroyd; Morse's 1685 decree is reported as his). The raiders' identity is disputed (over 80 per cent ethnic Chinese in one study of the Ming records); the link to ship design is one 2026 study's textual argument. |
| `wh-715` fall of the Ming dynasty | 7 | 5 → 8 | **Two rows on one day**: Li Zicheng entered Beijing and the emperor hanged himself, both 25 April (Hummel; no open source gives a gap). Added Wu Sangui and Dorgon meeting 27 May, the Qing entry 6 June and the last Ming claimant's death in June 1662. The causes are attributed (a biographer's bandits-within thesis, the tree-ring drought, taxes); Wu Sangui's motive is "commonly believed". The old Hummel citations, one under the wrong headword, are replaced; two climate papers cited. |
| `wh-716` Qing dynasty | 8 | 6 → 8 | **"Later Jin 1626 under Abahai" was wrong**: Nurhaci founded Later Jin in 1616 and Abahai named the dynasty Qing on 14 May 1636. The line is Named Qing, Beijing taken 6 June 1644 and Abdicated 12 February 1912. The Korea invasion, Taiwan 1683, Nerchinsk, the 1685 ports and the Canton claims are dropped (their sources were unread); the population figures are Columbia's, and "largest and most prosperous state on earth" is one encyclopedia's phrase. |
| `wh-717` Kangxi Emperor | 7 | 5 → 7 | **The reign is now "whose count"**: proclaimed in 1661, the Kangxi era named from 1662, about 60 against 61 years. Oboi was arrested in 1669 (the old card implied personal rule from fourteen), and the Three Feudatories, Nerchinsk ("what is often called China's first treaty with a Western power"), the Rites dispute (Tournon sent to Macao) and the succession dispute (an allegation, as the dictionary reports it) are attributed. The 1685 decree, East India Company factory and coastal evacuation claims are dropped. |
| `wh-718` Qianlong Emperor | 7 | 5 → 7 | **"Drained a treasury his successors never refilled" was wrong**: the dictionary says the treasury was still far from exhausted and gives 200 million taels for tax remissions and six tours; the ten victories are his own list. The Macartney and Canton paragraphs are removed (`wh-719`, `wh-720`). The reign starts 1735 (enthroned 18 October 1735; the era name is counted from 1736); the grandfather prayer is his own account. |
| `wh-719` Canton System | 6 | 5 → 6 | **The "eight regulations of 1759" were wrong**: five regulations were announced in 1760 after Flint's 1759 petition, and the Eight Regulations are the 1831 and 1835 versions. The start is a labelled pair (Morse: an edict of 1757; Liu Yong: 1760). The Cohong of 1720 is Hunter's; Grant says that guild was dissolved in 1721 and an official one ran 1760 – 1771. "Canton System" is a later label; the Howqua wealth figures are dropped. |
| `wh-720` Macartney Embassy | 7 | 5 → 7 | **"We possess all things" is in the first edict (3 October), not the second**, and is Backhouse and Bland's 1914 translation, attributed. The "second audience on 17 September" is the emperor's birthday ceremony (Macartney's journal and Staunton). The kowtow is told by the participants (one knee, the hand-kiss dropped), and why the mission failed is set as Platt against Kitson. |

**Read by eye.** *Article:* "Ming dynasty" ("the ____"), "Zheng He", "Kangxi Emperor", "Qianlong Emperor" bare; "the Forbidden City", "the haijin" ("the Ming prohibition called the ____"), "the fall of the Ming dynasty" ("hastening the ____ that the rebels had begun"), "the Qing dynasty", "the Canton System" ("Under the ____, a name later given to the arrangement") and "the Macartney Embassy" with "the" where the sentence needs it. Question 1 of `wh-719` said "one southern port" and now says "a single". *Confusability:* `wh-711`/`wh-715`/`wh-716` the house, its fall and its successor (the Brocade Guard and Hongwu on `wh-711`, Coal Hill and Wu Sangui on `wh-715`, the Eight Banners and the queue on `wh-716`); `wh-712`/`wh-714` the fleets and the ban (Ma Huan and the burned records on `wh-712`, Wang Zhi and the Zheng family on `wh-714`); `wh-717`/`wh-718` the two emperors (Oboi and Nerchinsk on `wh-717`, the ten victories and Heshen on `wh-718`); `wh-719`/`wh-720` the port system and the embassy (the Cohong and the Hoppo on `wh-719`, the one-knee bow and the jewelled box on `wh-720`). *Against other cards:* `cnh-557` says the Canton regulations were "eight regulations dating from 1760", where `wh-719` (from a Leiden thesis) has five in 1760 and the eight as the 1831 and 1835 versions, and is left to that card's pass; `cnh-551` prints the Qianlong reign from 1736 (the era name) where `wh-718` has 1735 (the enthronement); `cnh-503` and `cnh-539` give Southern Ming end dates (1661 and 1662) that `wh-711` leaves out. No card edited. **Cross-card note:** `wh-720`'s "we possess all things" is Backhouse and Bland's 1914 translation, whose other books are known to be unreliable, so the card names the translators.

**Glossary.** Nine terms rewritten (*Ming dynasty*, *Zheng He*, *Forbidden City*, *Haijin*, *Fall of the Ming dynasty*, *Qing dynasty*, *Kangxi Emperor*, *Qianlong Emperor*, *Canton System*); *Macartney Embassy* kept.

### B73 — `wh-721`–`wh-730`, Ming and Qing China, Tokugawa Japan and Slavery and the Atlantic world (2026-10-23)

Run as B72. The Japan cards were read against `wh-538` and `wh-844` (`jp-` ends at the Nara period, so there was nothing to compare), the slavery cards against the `us-` cards (none yet on these topics). Slave-trade figures are stated by edition and author. Pictures skipped.
Checks: `wh-audit.js --range=wh-721:wh-730` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 70 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-721` Sengoku period | 7 | 5 → 7 | **The start is hedged as labelled rows**: 1467 – 1573 (Segal), 1467 – 1568 (JAANUS), 1493 (Conlan; a 2020 article says consensus has moved to the coup of that year) and 1477 – 1600 (Smolucha). "Firearms 1540s" and "unification by 1590" were other events' dates and are dropped; 1543 for the matchlock is traditional (a monk's account of 1606; the Portuguese writer gives 1542, per Murai). The five archive.org sources are replaced; the Zhanguo borrowing is added. |
| `wh-722` Unification of Japan | 7 | 5 → 7 | **The old line was three milestones and treated 1590 (Odawara) as the unification**: now two phase spans, Nobunaga 1568 – 1582 (Kawai) and Hideyoshi 1582 – 1590 (Wang et al.). The survey runs from 1582, with the consolidated Taikō kenchi of 1594 – 95; "surveyors appointed from 1583", "about eight million koku" and the sword hunt's details beyond the edict are dropped. The Honnō-ji motive is "no decisive evidence" (Kawai). |
| `wh-723` Tokugawa shogunate | 8 | 5 → 9 | **The line led with Sekigahara, the warrior code of 1635 and Perry**: now Ieyasu shogun 1603 (the prose says "1600 or 1603"), Power returned 1867 and Office abolished 3 January 1868. Japan Search and the Nijō Castle site print old-calendar days as Western months, so no 24 March 1603 or 9 November 1867 is cited. The Murdoch-only figures (110,000 men, 15,000 dead) and Perry's "560 men" are dropped; five sources, four of them archive.org, become nine. |
| `wh-724` Sakoku | 7 | 5 → 9 | **"Sakoku" is a label coined in 1801** by Shizuki Tadao as the title of his translation of an appendix to Kaempfer; the four-portals debate (Dutch, Chinese, Korea through Tsushima, the Ryukyu) is attributed. "Nine ships with the vermilion seal" and the other Murdoch details are dropped; the line is Measures 1633 – 1639, Dutch to Dejima 1641, Term coined 1801 and US treaty 1854 in place of "Perry at Uraga 1853". |
| `wh-725` Hangul | 8 | 5 → 8 | **"Announced December 1443" is now "lunar calendar"** (Ryu; no source read gives the Gregorian equivalent), the treatise 1446, the Haerye found 1940, and a new row for the name Hangul first in print in March 1913. Choe Malli's memorial is given with its arguments and the reading that it opposed the pronunciation reform; authorship is split (the annals credit the king, the Haerye was written by Hall of Worthies scholars); the mouth-shape principle is the Haerye's own; the literacy figure is dropped. |
| `wh-726` Atlantic slave trade | 9 | 5 → 9 | **The date line and "died in transit about 2 million" were other events or unsourced**: now Recorded voyages 1514 – 1866 (the Voyages database) and Suppression 1867 (one study). Figures are stated by edition and author: 12.5 and 10.7 million (NEH, 2010), 11.4 and 10 million (Walsh, 2000), about 12.5 and 10.5 million (Micheletti et al., 2020); "two million died" is Beckles et al.'s, attributed. Buxton's 150,000 is a 1840 estimate from the returns of 1836 – 37, which he calls "merely a guess". |
| `wh-727` Middle Passage | 8 | 5 → 9 | **The old line was the Zong case, a surgeon's book and a narrative**: emptied, undatable true (a stage of a trade, no dated start). The Zong killings were in 1781, the case in 1783, and 133 drowned (Krikler); Falconbridge's "frequently stowed" is no longer "all"; the mortality is NEH's figures and three studies' rates, "one in seven" being the card's arithmetic; the Brookes plan is an abolitionist picture (400 figures where the law allowed 454). |
| `wh-728` Triangular trade | 8 | 5 → 8 | **The pamphlet of 1745, the hearing of 1790 – 91 and the ban of 1807 were other events**: emptied, undatable true. The circuit is a historians' label (a 1944 book gave it its classic, not original, form), most recorded voyages were bilateral (about 38 per cent left American ports), the return leg often carried little, and the share of slavery in British growth is disputed; the 1745 pamphlet no longer carries the card. |
| `wh-729` Plantation economy | 7 | 5 → 7 | **The old line was an edition year, one writer's figure and another event's date**: emptied, undatable true. The old abstract made one writer's costing of an estate the definition and misstated it (his price of an enslaved person implies £70 and not £50; he costed 600 acres and not 900); it is now a general account with Caribbean and South Carolina set against each other, and mortality as Harlow's inference and Beckles et al.'s estimate. |
| `wh-730` Sugar plantations in the Caribbean | 8 | 5 → 9 | **The account of 1673 was a reprint** (Ligon's first edition is 1657) and the other row was the 1838 emancipation: emptied, undatable true. The Dutch credit is Harlow quoting a contemporary report; cane left more than two days sours the juice (Ligon), not "within hours"; emancipation is given by empire (British 1834 with 1838 the end of apprenticeship, French 1848, Cuba 1886). |

**Read by eye.** *Article:* "Sengoku period" ("throughout the ____, a long age of civil war"), "the Unification of Japan", "the Tokugawa shogunate" ("Under the ____"), "the Atlantic slave trade", "the Middle Passage", "the triangular trade" ("what historians call the ____"), "the plantation economy" ("the basis of the ____ of the colonial Americas") and "the sugar plantations in the Caribbean" ("on the ____", "reached the ____ at different times") with "the" where the sentence needs it; "Sakoku" and "Hangul" bare. *Confusability:* `wh-721`/`wh-722`/`wh-723` the age, the process and the regime (the Zhanguo name and the matchlock on `wh-721`, the sword hunt and Hōjō on `wh-722`, alternate attendance on `wh-723`); `wh-723`/`wh-724` the regime and the later label (the 1801 coinage and Dejima on `wh-724`); `wh-725` the script (Choe Malli's memorial and the Haerye); `wh-726`/`wh-727`/`wh-728` the trade, the crossing and the circuit (database editions on `wh-726`, the Zong and the Brookes diagram on `wh-727`, Brazilian ports and Liverpool on `wh-728`); `wh-729`/`wh-730` the system and the estate (customs revenue and South Carolina on `wh-729`, cane mills and the Dutch credit on `wh-730`). *Against other cards:* `wh-721` agrees with `wh-538` (1493 reported by Conlan; the end in 1573 matches Segal), which closes the cross-card note carried from B70: the start is hedged as labelled rows; `wh-723` agrees with `wh-844` on 3 January 1868; `cnh-530` (the Imjin War) is consistent. No `us-` or `ko-` card overlaps. None edited.

**Glossary.** Nine terms rewritten (*Sengoku period*, *Unification of Japan*, *Tokugawa shogunate*, *Sakoku*, *Atlantic slave trade*, *Middle Passage*, *Triangular trade*, *Plantation economy*, *Sugar plantations in the Caribbean*); *Hangul* kept.

### B74 — `wh-731`–`wh-740`, Slavery and the Atlantic world (2026-10-23)

Run as B73. The slavery cards attribute every figure and every law to its source, and the laws and treaties are dated one by one; `us-` has no card on these topics yet (`us-444` and `us-445` are planned), so there was nothing to compare. Pictures skipped.
Checks: `wh-audit.js --range=wh-731:wh-740` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 70 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-731` Chattel slavery | 8 | 6 → 8 | **The old line was a Barbados law, a Jamaican code and a convention of 1926**: emptied, undatable true. "Chattel slavery" is a jurists' label; the 1926 Slavery Convention never uses the phrase, and the label is attributed to a 2002 tribunal judgment quoted by Allain. The old claim that Barbados law called enslaved people chattels is corrected: an act of 29 April 1668 declared them real estate. Only the Convention and Ligon are kept of the old sources. |
| `wh-732` Slave codes | 7 | 6 → 7 | **The codes are dated statute by statute**: Barbados 1661, Jamaica 1664 and 1684, South Carolina 1691; the 1692 act restores the death penalty for long absence rather than repealing it; the Jamaican act of 2 March 1792 (checked on the page image) pays an enslaved person who takes a rebel, not "anyone"; drums and horns were banned outright in Barbados. A Jamaican act of 1696 is not asserted. The line is emptied (an umbrella label), undatable true. |
| `wh-733` Slave rebellion | 8 | 5 → 9 | **The old abstract misread the Jamaican act of 1792** (it rewards an enslaved person who takes a rebel, not "anyone"); the card is now a general account (about 70 risings in British colonies from 1649 to 1833 per the Understanding Slavery Initiative; Stono, Tacky's rising of 1760) with the line of other events' dates emptied, undatable true. The card keeps the locator it had (Port Maria), which a general topic arguably should not have. |
| `wh-734` Maroons | 8 | 5 → 9 | **A people with no single start**: the line is emptied, undatable true. The treaty is "1738" in one source, "1738 / 39" in another and 1739 in a third, and each is attributed; Nanny is legendary; the cimarrón etymology is "probable" in the dictionaries; "buffer" is one author's word. The second war, the deportation to Nova Scotia and Sierra Leone are told from the sources; the glossary entry, which agrees, is kept. |
| `wh-735` Asiento | 7 | 6 → 7 | **The old line conflated the contract, its term and its quota**: emptied, undatable true. The British contract was signed at Madrid on 26 March 1713 and given up at the treaties of 1748 and 1750; the 144,000 is a quota in *piezas de Indias*, a unit tied to a person's height and health, not a head count; the £100,000 is García de León's figure; the asiento was also held by the Portuguese and the French before the British. |
| `wh-736` Royal African Company | 7 | 5 → 8 | **The monopoly ended in 1698 (the Act took effect 24 June), not 1697**; chartered 1672, dissolved 1752. About 150,000 captives are Pettigrew's figure; the "DY" branding is the museum's claim, which other researchers do not find conclusive; Colston (deputy governor 1689 – 1690, per an Exeter database) is in a Think-it-through answer. A Brill chapter prints 1689 for the Act where the author's own book has 1698, so the card follows the book. |
| `wh-737` Kingdom of Dahomey | 7 | 6 → 9 | **"Founded about 1625" was a traveller's date**: now a labelled estimate (Law: probably the first half of the 17th century; c. 1600 – 1650), with Allada 1724 and Whydah 1727 and the French conquest of 1892 – 1894. The Amazons and the human sacrifice are the travellers' reports (Norris, Dalzel) and were later used to justify the French occupation; the royal leopard origin is tradition. Only two of nine sources are open. |
| `wh-738` Ashanti Empire | 7 | 5 → 9 | **The line printed other events** (the coast in 1807, 1811 and 1816, the treaty of 1817): now Feyiase 1701 (as dated by McCaskie), the Sagrenti War 1873 – 1874 and annexation 1901. Half the old sources were about Dahomey; the Golden Stool is tradition; the looting of the regalia in 1874 and its sale in London are told from the sources; casualty and indemnity figures are left out. |
| `wh-739` Indian Ocean slave trade | 7 | 5 → 7 | **An observation, an estimate and a treaty are no start**: the line is emptied, undatable true. The 13,000 a year is Colomb's own hedged estimate beside others; one survey dates the non-Atlantic trades to at least 800 CE; the Dutch company's traffic to the Cape is added; the treaty of 1873 only requires the markets to close, so the card does not say they closed. The old glossary's household-not-plantation claim has no source. |
| `wh-740` Trans-Saharan slave trade | 7 | 5 → 7 | **No clean start**: the line is emptied, undatable true; the beginning is disputed (a genetic study says Roman times, another about 1000 BCE, a survey at least 800 CE). Lyon is kept only for what he reports; the figures of traveller-officials are the sources'. The old glossary's unsourced cloth and traveller-only account are replaced. |

**Read by eye.** *Article:* "chattel slavery" ("the label ____"), "Slave codes" ("passed ____"), "a slave rebellion" ("a ____ had often been planned"), "the Maroons" ("to the ____"), "the asiento" ("called an ____"), "the Royal African Company", "the Kingdom of Dahomey", "the Ashanti Empire", "the Indian Ocean slave trade" and "the Trans-Saharan slave trade" with "the" where the sentence needs it. Question 0 and question 2 of `wh-736` said "the west African coast" beside the answer "Royal African Company" and now say "the coast of west Africa". *Confusability:* `wh-731`/`wh-732` the status and the statutes (partus sequitur ventrem and the Yugoslav tribunal on `wh-731`, rewards, drums and horns on `wh-732`); `wh-733`/`wh-734` the rising and the people who escaped (Stono and Tacky on `wh-733`, the treaties and the Trelawny Town deportation on `wh-734`); `wh-735`/`wh-736` the contract and the company (the unit of the quota on `wh-735`, Cape Coast Castle and the 1698 Act on `wh-736`); `wh-737`/`wh-738` the two West African states (the Amazons and the leopard on `wh-737`, the Golden Stool and the Sagrenti War on `wh-738`); `wh-739`/`wh-740` the east and the desert (Zanzibar and the Cape on `wh-739`, camel caravans and the vice-consul on `wh-740`). *Against other cards:* no `us-` card overlaps; `wh-740` gives a genetic study's "about 1000 BCE" as one view of the start, which is looser than `wh-423`; none edited. **Cross-card note:** `wh-733` keeps a locator (Port Maria, a battle) that a general topic arguably should not have.

**Glossary.** Nine terms rewritten (*Chattel slavery*, *Slave codes*, *Slave rebellion*, *Asiento*, *Royal African Company*, *Kingdom of Dahomey*, *Ashanti Empire*, *Indian Ocean slave trade*, *Trans-Saharan slave trade*); *Maroons* kept.

### B75 — `wh-741`–`wh-750`, Slavery and the Atlantic world and The age of revolutions (2026-10-23)

Run as B74. The thinkers (`wh-747`–`wh-750`) are told from their own texts and the stable reference works; the quotations in the questions are the thinkers' own words, and the legends attached to them (the "defend to the death" line, "noble savage") are attributed or left out. `us-` has no card on these subjects (only `us-062`, no disagreement). Pictures skipped.
Checks: `wh-audit.js --range=wh-741:wh-750` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten after one fix (`wh-745`: a journal issue dated 2020 that Crossref dates 2021, now "(2020, published 2021)"); none of 81 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-741` abolitionism | 8 | 6 → 11 | **The old line was three other events** (the committee of 1787, the evidence of 1790 – 91, the ban of 1807): emptied, undatable true, since the movement had several national starts (the Germantown Quaker petition of 1688, the London committee of 1787, the Paris society of 1788, Saint-Domingue from 1791) and several ends (1807, 1834, 1848, 1865, 1888). The Zong figure on an Equiano anecdote and the select-committee claims of 1790 – 91 (the *Abstract of Evidence* was never read) are dropped; the decline thesis is set against its critics. Sources 6 → 11, three over the bar, because the end dates come from five national records. |
| `wh-742` Olaudah Equiano | 8 | 5 → 8 | **"Born 1745, at Essaka" stated his own claim as fact**: now "Born, he said" against a baptismal entry of 9 February 1759 giving Carolina and a muster roll of 1773 giving South Carolina, with Carretta's case, Lovejoy's defence of Igboland and Carey's "we just don't know" attributed. The Zong toll is 130 in Sharp's note, 132 in Hoare and the museum, 133 in Equiano's World ("132 in a lawyer's memoranda" was wrong). Freed 10 July 1766 is the deed the Narrative prints; dismissed 24 March 1787; died 31 March 1797. |
| `wh-743` Slave Trade Act 1807 | 8 | 6 → 8 | **The 283 to 16 vote was on going into committee, not on the whole bill** (Hansard); the line is Royal assent 25 March, In force 1 May and Commons vote 23 February 1807. "Still crossing 150,000 a year in 1840" is Buxton's estimate, which he partly calls a guess; the West Africa Squadron's start and totals are dropped (no readable source); the 1833 Act and £20 million are Bank of England economists' figures; the US Act (in force 1 January 1808) is named as a separate law. |
| `wh-744` creolisation | 6 | 5 → 7 | **The old line was travellers' and planters' sightings** (creole classes 1774 and 1791, John Canoe seen 1816, Palenquero): emptied, undatable true. The old abstract made two 18th-century planter-historians the source of the concept and defined the colonial creole as anyone born in the islands; it is now non-indigenous people born in the colonies (Mufwene), with creolisation a process and for some a political stance (Islam), and the two famous strands of the argument given as "one view" without names. |
| `wh-745` African diaspora | 8 | 5 → 8 | **The old line mixed a span, another event and a study sample**: emptied, undatable true. The term has three senses (continental, cultural, racial; McEachrane); the Atlantic figures are the Voyages database's as reported by Micheletti et al. (12.5 million embarked, 10.5 million disembarked); the 50,281 genomes are a sample and "say nothing about how large the diaspora is"; the Indian Ocean and trans-Saharan traffics are added. An 1840 campaigner and a reparations review are dropped. |
| `wh-746` Age of Enlightenment | 9 | 6 → 9 | **"Defined September 1784" was wrong**: Kant wrote his answer on 30 September 1784 and it was printed in the December issue of the *Berlinische Monatsschrift* (pp. 481 – 94); the September issue carries Mendelssohn's answer. The line of four works' dates is emptied, undatable true: the Enlightenment has no clean start or end (one encyclopedia roots it in the scientific revolution and calls the Terror a convenient close). The four primary extracts that duplicated `wh-747` – `wh-750` are replaced; the Counter-Enlightenment is attributed to one historian of ideas. |
| `wh-747` John Locke | 8 | 5 → 9 | **The questions carried the year, and the abstract gave Locke more credit than any source**: "more than any other single body of work" is dropped, as is the claim that a French writer met the *Essay* "in exile" (Voltaire's own letter has him a guest in England). The Carolina clause is attributed (Armitage, as reported by Tuckness, against Brewer); the Royal African Company shares came from third parties, probably as pay (Smith); the title page of 1690 and the writing in 1679 – 83 are Laslett's. Exact birth and death days are unsourced and dropped. |
| `wh-748` Montesquieu | 8 | 5 → 8 | **"Misread England" is a charge, now attributed**: Stewart reports it and argues against it, and Montesquieu says he does not examine whether the English enjoy the liberty. Madison cites him on 1 February 1788; the chapter on enslaving Africans is read as satire (Sullivan, Goldzink) beside the hot-climate passage of Book 15. "Most used political handbook of the century" (a count finds no single dominant European writer) and the unsourced claim about Geneva and anonymity are dropped; the years leave the questions. |
| `wh-749` Voltaire | 9 | 5 → 10 | **Calas's execution is dated both ways**: Voltaire's own treatise says 9 March 1762 and the Musée protestant 10 March, so the row is labelled "(museum)" and the abstract gives both. The unsourced interpretation in the card's voice ("toleration in his hands was an argument from consequences") is dropped; the antisemitic writings and the slave-trade investments are attributed; Ferney is a deed of 1759; the "defend to the death" line is left off because no scholarly source was read calling it misattributed. Sources 5 → 10. |
| `wh-750` Jean-Jacques Rousseau | 8 | 5 → 8 | **"A prize essay of 1755" was wrong**: the Discourse on Inequality lost the Dijon competition (the *First* Discourse won). Only *Émile* was condemned in Paris, both books in Geneva (SEP). "Noble savage" is attributed to one anthropologist as reported in the Guardian (Crawfurd revived it in 1859); the abandoned children are the *Confessions*'s account; the reading of the general will by Robespierre is Cole's and "hostile writers"'. |

**Read by eye.** *Article:* "abolitionism" ("the transatlantic ____"), "the Slave Trade Act 1807", "creolisation" bare ("is called ____"), "the African diaspora", "the Age of Enlightenment" and "Olaudah Equiano", "John Locke", "Montesquieu", "Voltaire", "Jean-Jacques Rousseau" bare. The quotations in the questions for `wh-747`, `wh-748`, `wh-749` and `wh-750` are the thinkers' own words (Locke on property, Montesquieu on the powers, the Royal Exchange letter, the opening of the *Social Contract*). *Confusability:* `wh-741`/`wh-742`/`wh-743` the movement, the writer and the statute (the sugar boycott and the Brookes plan on `wh-741`, the baptismal entry and the Sierra Leone commissary on `wh-742`, the ministry that gave up its seals on `wh-743`); `wh-744`/`wh-745` the process and the people (Jonkonnu and Palenque on `wh-744`, the genome sample and the Yungas on `wh-745`); `wh-746` the age against its four figures (Kant's motto on `wh-746`, the blank page on `wh-747`, the mock argument for sugar on `wh-748`, the Toulouse merchant on `wh-749`, the unsuccessful prize essay on `wh-750`). *Against other cards:* `wh-727` and `wh-742` give the Zong toll differently by source (133 from Krikler; 130 in Sharp's note, 132 in Hoare, 133 in Equiano's World), each attributed; SEP gives 1690 for the *Two Treatises* where `wh-747` prints 1689 and explains the title page of 1690; none edited. **Cross-card note:** the Dassier credit on the portrait of `wh-748` is unverified (Dassier is known as a medallist).

**Glossary.** Nine terms rewritten (*Abolitionism*, *Olaudah Equiano*, *Slave Trade Act 1807*, *Creolization*, *African diaspora*, *Age of Enlightenment* without its century-alone date, *John Locke*, *Voltaire*, *Jean-Jacques Rousseau*); *Montesquieu* kept.

### B76 — `wh-751`–`wh-760`, The age of revolutions (2026-10-23)

Run as B75. The American and French cards date every document and vote one by one (the Declaration's vote on 2 July against its adoption on 4 July; the French decrees of August 1789); the contested figures (the Terror's dead, the Bastille garrison, the Encyclopédie's articles) are given by source. `us-` has no card on these subjects yet (the Revolution is planned at `us-206`–`us-270`, the Constitution at `us-276`–`us-310`), and no `ru-` or `fr-` card exists, so there was nothing to compare. Pictures skipped.
Checks: `wh-audit.js --range=wh-751:wh-760` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 83 distinct URLs non-2xx. Drafts of `wh-753` and `wh-754` came back with a full stop after the footnote markers as well as before them; fixed in the drafts before applying.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-751` Encyclopédie | 8 | 5 → 8 | **Counts are now whoever gives them**: 74,000 articles and more than 130 contributors are ARTFL's, over 70,000 and over 140 Stanford's, 35 volumes to 1780 Brandeis's. The council ban of 1752 and the condemnation and revoked privilege of 1759 are dated to Chartier (the papal condemnation by year, Cornell). The subscriber figure of about 4,000, any print run and "21.7 million words" are dropped; the old claim that the privilege was "revoked outright" after 1757 and 1758 had no source for 1759. |
| `wh-752` enlightened absolutism | 7 | 6 → 8 | **The old line was three rulers' reigns and a period**: emptied, undatable true. "Enlightened absolutism" is a historians' label (the Physiocrats wrote *despotisme éclairé* from about 1760, none of the princes used it, and Roscher brought the German form into scholarly writing in 1847); a critical study at the congress of 1928 called it "vague and confused". Catherine's instruction borrowed from Montesquieu and Beccaria; Charles III is dropped (no readable source) and Pombal is named only through Hartung. |
| `wh-753` American Revolution | 9 | 6 → 11 | **"Era 1763 – 1789" is a periodisation no source gave**: the line is four dated events (Stamp Act passed 22 March 1765, Tea Party 16 December 1773, Declaration 4 July 1776, Treaty of Paris 3 September 1783). The Stamp Act as "the first direct internal tax" is dropped; Dunmore, Loyalists and Haudenosaunee carry attributed figures; the political-or-social debate is one review essay's; "no taxation without representation" is a slogan that is not the wording of the resolutions of 1765 or 1774. |
| `wh-754` United States Declaration of Independence | 9 | 6 → 10 | **The line mixed a count with dates and left out the vote and the signing**: now adopted 4 July 1776, Lee motion 7 June, vote carried 2 July, mostly signed 2 August (the 4 July signing is Jefferson's recollection; the National Archives calls it a misconception). The 27 charges are the Bill of Rights Institute's count; the claim that every charge begins with the same pronoun was false; the Dunlap broadside was printed overnight 4 – 5 July, with 26 known copies. |
| `wh-755` American Revolutionary War | 8 | 6 → 9 | **The old card had six documents and no scholarship**: every claim re-sourced. The first shot at Lexington is unknown and "the shot heard round the world" is Emerson's hymn of 1837; the French treaties were signed 6 February 1778; Spain entered on 21 June 1779 and Britain declared war on the Dutch on 20 December 1780; the siege of Yorktown ran 28 September – 19 October 1781. "The French squadron decided it" is dropped; Native nations, Black Loyalists and smallpox are added; no overall casualty total is given. |
| `wh-756` United States Constitution | 9 | 6 → 9 | **"In force 1789" is now dated**: signed 17 September 1787 (39 deputies), New Hampshire the ninth state 21 June 1788, legal start 4 March 1789 (the Archives adds that quorums met only on 6 April), Bill of Rights 15 December 1791. The three-fifths and fugitive-slave clauses are attributed and not called compromises; the Northwest Ordinance and "seven articles" are dropped as unsourced. |
| `wh-757` French Revolution | 9 | 6 → 10 | **"Began May 1789" and the two rows for the Bastille and the Rights of Man belong to other cards**: now Estates opened 5 May 1789, Monarchy ended 21 September 1792 and Directory fell 9 November 1799. The end is attributed (the Jacobin dictatorship, the Directory, or the Empire, per Johnston, Lentz and Benigno); "the king's flight and war with Austria destroyed what trust was left", "Louis was executed four months later" and the treasury claim are dropped; the cake remark and a death toll are not mentioned. |
| `wh-758` Storming of the Bastille | 9 | 5 → 9 | **The garrison is a contested count**: 32 men in the Swiss officer's account against 82 invalides and 32 Swiss, or 95 and 30, in Funck-Brentano, and the attackers' dead are 98 (Funck-Brentano) against 82 killed and 15 dead of wounds. The line now separates the three dates that are confused: stormed 14 July 1789, the anniversary festival 14 July 1790 and the holiday law of 6 July 1880. The gunpowder quantity, the key given to Washington and the demolition could not be sourced and are not stated. |
| `wh-759` Declaration of the Rights of Man and of the Citizen | 8 | 6 → 8 | **The old sources are replaced by eight pages actually read**: the Library of Congress record gives the committee on 12 August, the text of 19 articles on 17 August, sessions 20 – 26 August, 17 articles in the end and the king's approval on 5 October 1789; Lafayette's draft of 11 July with Jefferson's help is the Battlefield Trust's. The active-citizen rules, Olympe de Gouges and the Friends of Blacks are added; Question 2 of the draft said "a matching declaration" beside the answer and now says "a matching charter of rights". |
| `wh-760` Reign of Terror | 8 | 7 → 8 | **"About twenty thousand guillotined" had no source** (the headnote of a documents site, which gave "over 200,000 suspects tried" too): the figures are now Linton's (16,594 death sentences from March 1793 to August 1794, about three-quarters on armed rebels and mostly shot; about 40,000 victims and up to 50,000), Hesse's rough 50,000 to 100,000 for the Vendée, each by name. The "Era" row is gone; the start is 5 September 1793 (Royer's call) or 17 September (the Law of Suspects), the end 27 July 1794, and the capital T is some historians' choice. |

**Read by eye.** *Article:* "the Encyclopédie", "enlightened absolutism" ("the label ____"), "the American Revolution", "the United States Declaration of Independence", "the American Revolutionary War", "the United States Constitution", "the French Revolution", "the Storming of the Bastille", "the Declaration of the Rights of Man and of the Citizen" and "the Reign of Terror" with "the" where the sentence needs it. Question 2 of `wh-759` had put "a matching declaration" beside the answer and now says "a matching charter of rights". *Confusability:* `wh-753`/`wh-754`/`wh-755`/`wh-756` the revolution, its charter, its war and its constitution (the Stamp Act and the debate on `wh-753`, the Dunlap broadside and Adams on `wh-754`, Lexington and Saratoga on `wh-755`, the Federalist essay and the ratifying conventions on `wh-756`); `wh-757`/`wh-758`/`wh-759`/`wh-760` the Revolution, the fortress, the charter and the Terror (the tennis court and the end date on `wh-757`, Longchamp and the Swiss officer on `wh-758`, de Gouges on `wh-759`, the Law of Suspects and the capital T on `wh-760`); `wh-751`/`wh-752` the book and the label (the false Neuchâtel address on `wh-751`, the Nakaz on `wh-752`). *Against other cards:* none; `wh-755` and `wh-756` use no figure that `wh-753` and `wh-754` contradict; `wh-760` and `wh-761` (Robespierre, in B77) quote the same speech of 5 February 1794. None edited.

**Glossary.** Eight terms rewritten (*Encyclopédie*, *Enlightened absolutism*, *American Revolution*, *United States Declaration of Independence*, *American Revolutionary War*, *United States Constitution*, *French Revolution*, *Reign of Terror*); *Storming of the Bastille* and *Declaration of the Rights of Man and of the Citizen* kept.

### B77 — `wh-761`–`wh-770`, The age of revolutions (2026-10-23)

Run as B76. The Napoleonic cards no longer rest on the 1904 and 1908 collections of translated documents reached through archive.org, which could not be reopened: dates and figures are from the Fondation Napoléon, the museums, Cambridge and journal articles, each by name. Casualty figures, army sizes and the Haitian toll are given by source or left out. `ru-`, `us-` and the other collections have no card on Napoleon, Robespierre, the Congress of Vienna, Haiti or Bolívar, so there was nothing to compare. Pictures skipped.
Checks: `wh-audit.js --range=wh-761:wh-770` nine clean and one `I.duplicate` on `wh-767`, whose current picture (a generic file also on twenty other cards) is the picture pass's to replace; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 76 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-761` Maximilien Robespierre | 8 | 7 → 8 | **The old card rested on archive.org scans that could not be reopened**: the content of the Law of 22 Prairial, the Declaration of Rights of 24 April 1793, the line that he and Saint-Just pushed the law through over both committees' protest, and the refusal to back Desmoulins are dropped. The law is attributed (Jones and Macdonald: Robespierre and his allies forced it through; Barère's memoirs: the committee disowned it). The Festival of the Supreme Being is 8 June 1794 (Maitron and Mark; Jones and Macdonald print 10 June). The wound at his arrest is told only as a report. |
| `wh-762` Napoleon | 9 | 11 → 9 | **"Consul for life 4 August 1802" and "sailed for exile August 1815" were not sourced or were events**: the line is now Lived 15 August 1769 – 5 May 1821, the Brumaire coup, Empire declared 18 May 1804 and the abdications of April 1814 and 22 June 1815. The Senate voted the consulship on 12 May 1802 (napoleon.org) and the day of the proclamation was not re-sourced. His height (about 1.69 metres against about 1.60 for a Frenchman of the time), the Haiti expedition (Girard) and the contested cause of death are added; the terms of Fontainebleau and Austerlitz details are dropped. |
| `wh-763` Napoleonic Wars | 8 | 11 → 10 | **The old line was four battles with a loose December 1805 and the date of a proclamation as the crossing of Russia**: a war needs its own span, so the line is the museum dating 1803 – 1815 (Royal Museums Greenwich) and the Second Treaty of Paris, 20 November 1815. The start is a convention (the National Army Museum counts one war of 23 years; Bourrienne put the rupture in May 1803 and blamed Malta); the 1812 army numbers and the casualty figures are given by source. |
| `wh-764` Napoleonic Code | 8 | 8 → 9 | **"First book decreed 8 March 1803" was only the decree of one title**: the line is Voted in parts March 1803 – March 1804, Promulgated 21 March 1804, 2,281 articles and Renamed 1807 (Code Napoléon). The drafting commission and Napoleon's part are added; wives' legal position is the code's, as Delage reads it; the spread to Belgium, Luxembourg, Italy, Germany and Chile is stated by source. The remark that his glory was the Code, not forty battles, is left out: no source was found in Las Cases. |
| `wh-765` Battle of Waterloo | 9 | 5 → 9 | **The old card paraphrased the despatch from Gazette scans with no text**: the date line is now only the campaign (15 – 18 June 1815) and the battle. Force and loss figures are the National Army Museum's (72,000 and 246 guns against 68,000 and 156) beside Ropes's totals; the haemorrhoids story, Hugo's sunken road and the Lion Mound are attributed. Waterloo is Wellington's name for his headquarters village, not Blücher's choice. |
| `wh-766` Congress of Vienna | 8 | 8 → 8 | **"In session January 1815" was wrong and three of four rows were other events**: now Opened November 1814 (the day was not sourced; 1 November is often given) and Final Act 9 June 1815. Talleyrand's legitimacy and Ligne's "dances" are attributed to the memoirists; the Concert of Europe is a label, and the congress years differ from the later Concert less sharply than usually depicted; the declaration against the slave trade of 8 February 1815 banned nothing at once. |
| `wh-767` Haitian Revolution | 8 | 10 → 9 | **The row "Slavery restored 20 May 1802" is dropped**: the law formally maintained slavery only where it had not been abolished (Martinique), and Napoleon's separate instructions restored it in Saint-Domingue (Fondation Napoléon). Sonthonax's proclamation of 29 August 1793 is added before the Convention's decree of 4 February 1794. Bois Caïman is attributed as tradition with two uncertain accounts; the indemnity of 1825 is "at least ten times Haiti's annual revenue" and the French losses are attributed. No Haitian death toll was found in a readable source. |
| `wh-768` Toussaint Louverture | 8 | 7 → 8 | **Birth is c. 1743, not "20 May 1743"** (one biographer finds no archival support for the day; early sources list years from 1737 to 1756); death 7 April 1803 at Fort de Joux. His early freedom and slaveholding are attributed; the "trunk of the tree of liberty" quotation and the label "Black Napoleon" are left out, since no source read supports them beyond "it is related". |
| `wh-769` Spanish American wars of independence | 7 | 6 → 7 | **The old question carried "four viceroyalties and three captaincies-general" and the abstract gave "the fifteen years after 1810" as fact**: the span is a convention (Fisher counts 15 years from the first juntas to Ayacucho; OpenStax gives 1808 – 1825; Callao held out to January 1826). The earthquake toll is a patriot account of 1817; loyalty to Ferdinand VII, royalist and patriot recruiting of castes, Indians and slaves, the llaneros and Brazil as a separate case are added; Bolívar's address of 1819 moves to `wh-770`. |
| `wh-770` Simón Bolívar | 9 | 5 → 9 | **The London mission had three commissioners** (Bello, López Méndez and Bolívar), not "a colleague"; "the Liberator" is disputed (Mérida in 1813, or the Caracas council on 14 October 1813). The war-to-the-death decree of 15 June 1813, the Jamaica Letter, Ocaña, the dictatorship of 1828 and the cause of death (tuberculosis most likely, other causes proposed) are added; the deathbed "ploughed the sea" line is not used, since no source gives it as a deathbed saying. "Freed the northern half" was unsourced. |

**Read by eye.** *Article:* "Maximilien Robespierre" and "Napoleon" bare; "the Napoleonic Wars", "the Napoleonic Code" ("the law of private disputes"), "the Battle of Waterloo", "the Congress of Vienna", "the Haitian Revolution" ("the ____ ended with"), "the Spanish American wars of independence" and "Toussaint Louverture", "Simón Bolívar" bare with "the" where the sentence needs it. *Confusability:* `wh-761`/`wh-762` the Incorruptible and the emperor (the Supreme Being and the Convention on `wh-761`, the coronation and the height on `wh-762`); `wh-763`/`wh-764`/`wh-765`/`wh-766` the wars, the code, the battle and the congress (Trafalgar and the retreat from Russia on `wh-763`, the preliminary article on judges on `wh-764`, the farm Blücher named and Grouchy on `wh-765`, Warsaw and Saxony on `wh-766`); `wh-767`/`wh-768` the revolution and its leader (the indemnity on `wh-767`, Fort de Joux and Santo Domingo on `wh-768`); `wh-769`/`wh-770` the wars and the Liberator (the juntas and Ayacucho on `wh-769`, the Angostura address and the last proclamation on `wh-770`). *Against other cards:* `wh-765` says the powers at Vienna declared Napoleon an enemy of the peace of the world, which `wh-766` matches; `wh-760` and `wh-761` quote the same speech of 5 February 1794; none edited. **Cross-card note:** `wh-767`'s picture is the audit's `I.duplicate`.

**Glossary.** Nine terms rewritten (*Maximilien Robespierre*, *Napoleon*, *Napoleonic Wars*, *Battle of Waterloo*, *Congress of Vienna*, *Haitian Revolution*, *Toussaint Louverture*, *Spanish American wars of independence*, *Simón Bolívar*); *Napoleonic Code* kept.

### B78 — `wh-771`–`wh-780`, The age of revolutions and The Industrial Revolution (2026-10-23)

Run as B77. The revolutions are told from the participants' accounts and the encyclopedias, with army sizes and dates that differ by source printed as the sources' own; the Industrial Revolution cards no longer rest on five archive.org books each (Toynbee, Thurston, Farey, Muirhead are replaced or re-read). `us-` has no card on these subjects, so there was nothing to compare. Pictures skipped.
Checks: `wh-audit.js --range=wh-771:wh-780` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 77 distinct URLs non-2xx (three timed out in the batch run and answered on a second).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-771` José de San Martín | 8 | 5 → 8 | **The crossing was January – February 1817, not "January 1817"**: Las Heras's column left on 18 January and the main body on 19 January, and the army stood on the Putaendo plain on 8 – 9 February (Robertson; Mitre). The army's size is an estimate given by source (about 3,550 in Robertson; 4,000 and over 1,000 militiamen in an encyclopedia; 5,500 in a Library of Congress study). The Guayaquil meeting is 26 – 27 July 1822, what was said is attributed to a report and Mitre, and "a British officer watched him leave" is dropped (Hall wrote retrospectively). |
| `wh-772` Mexican War of Independence | 8 | 5 → 8 | **Hidalgo was taken on 21 March 1811, not "in February"**; shot 30 July 1811 (31 July in the Library of Congress and Priestley). "Fought 1810 – 1821" was a convention and is dropped from the line, which is the four dated events from the Grito of 16 September 1810. The bell and the call to arms are "it appears" (the Grito was never written down); the crowd colour is dropped; Morelos is "shot in December 1815" because two sources disagree who captured him; no death-toll source was usable, so none is given. |
| `wh-773` Revolutions of 1848 | 7 | 6 → 9 | **"Began 24 February 1848" was Paris; the Palermo rising of 12 January 1848 came first.** The crown was not refused in May: the king answered the Frankfurt deputation on 3 April 1849 and the Prussian government rejected the constitution and crown on 28 April. Vienna is 30 October (Library of Congress) or 1 November (Maurice) and stays in prose. Hungary's surrender is 13 August 1849 after the Russian intervention; no death toll is given. |
| `wh-774` liberalism | 9 | 5 → 9 | **A concept**: the line (Mill's essay of 1859 and Hobhouse's of 1911) is emptied, undatable stays true, and the year in the third question is gone. No source says the political label began at Cádiz; a Spanish study places political *liberalismo* in 1799 and the liberales of Cádiz as a parliamentary tendency, so the card says "in Spain" and attributes it. Classical against "new" liberalism, the critics and the American use of the word are added; sources 5 → 9. |
| `wh-775` nationalism | 9 | 5 → 9 | **The old claim that nationalism "supplied the argument behind the unification of Italy and Germany and the break-up of the Habsburg, Ottoman and Russian empires" was in none of the cited entries**: Italy now rests on Mazzini's words, Austria-Hungary on Wilson's Fourteen Points, and Germany and Russia are not claimed. Herder and Fichte are disputed "founders" (SEP calls Herder a nationalist "deeply misleading and unjust"); nation against state and the civic-ethnic pair are contested labels. Renan has no readable text and is left out. |
| `wh-776` Industrial Revolution | 9 | 5 → 9 | **"Named by Oxford lectures, 1881" was wrong**: Blanqui's *révolution industrielle* (read in the fifth edition of a book first printed in 1837) and Engels's book of 1845 came first. 1760 – 1840 is the span of Toynbee's own course (his widow's note), 1760 – 1830 is Ashton's title, and the lectures ran October 1881 – May 1882 and were published after his death in 1884; the line says whose each is. Britain-first, gradual growth, wages and child labour are attributed; the Liverpool and Manchester growth claim is dropped. |
| `wh-777` British Agricultural Revolution | 7 | 5 → 7 | **Tull's book is 1733 with a specimen of 1731, and he was not the first to design a drill**; the four-course rotation is no longer Townshend's (a 1912 claim, corrected: over half of Norfolk farmers grew turnips by 1720 and the four-course was widespread only in the 19th century); Bakewell's Longhorns did not last. The line is now the disputed dating of the label (Overton c. 1750 – 1850; Kerridge 1560 – 1767, as reported by Overton). The old "acts 1727 – 1845" is dropped here. |
| `wh-778` enclosure | 7 | 6 → 7 | **"Private acts 1,885" was a misprint**: Slater's table prints 1,385, and it counts acts for common pasture and waste only, not common field; the figure of 1,765,711 acres is Slater's. The line (acts counted, private acts, the general act of 1801) is emptied, undatable true; the two totals of Parliamentary enclosure are Turner's 6.8 million acres and Chapman's 8.75 – 8.85 million, each as reported by Chapman. The folk verse is not used. |
| `wh-779` steam engine | 9 | 5 → 9 | **"First mine engine 1712 at Griff" was wrong**: Newcomen's first engine stood near Dudley Castle in 1712 (Linda Hall; Science Museum), and the Griff owners declined his offer in 1711 (Smiles). The line of three milestones is emptied, undatable true (no single inventor: Hero's aeolipile, Savery, Newcomen, Watt, Trevithick). Savery's patent is 25 July 1698 in one source and 2 July in other web accounts; Watt's patent is 5 January 1769. The 56 centimetre cylinder is dropped. |
| `wh-780` James Watt | 9 | 5 → 9 | **The patent and death get their days**: 5 January 1769 (Science Museum Group) and 25 August 1819. The kettle story is a legend (Smiles); the model repair is in the college session of 1763 – 64 (Hills) and Boldrin and Levine put the condenser idea in late 1764. The partnership began on 1 June 1775 (Smiles) and the act of 1775 extended the patent to 1800; engines built to 1800 are 451 (Science Museum) or 496 (Hills). "Rotative motion devised by Watt" is dropped. |

**Read by eye.** *Article:* "José de San Martín" bare; "the Mexican War of Independence" ("the ____ that ended Spanish rule"), "the Revolutions of 1848" ("during the ____"), "liberalism" and "nationalism" bare ("treats ... as", "spring from ____"), "the Industrial Revolution", "the British Agricultural Revolution" ("What historians call the ____"), "enclosure" bare ("is called ____"), "the steam engine" and "James Watt" with "the" where the sentence needs it. Question 2 of `wh-774` had carried "in 1911" and now carries no year. *Confusability:* `wh-771`/`wh-770` the two liberators (Yapeyú, the Army of the Andes and exile on `wh-771`; Angostura and Boyacá on `wh-770`); `wh-772`/`wh-773` the Mexican war and the European wave (the bell and Plan of Iguala on `wh-772`, the Frankfurt church and Kossuth on `wh-773`); `wh-774`/`wh-775` the two ideas (the justification premise and the new liberals on `wh-774`, Mazzini's remark and the survey on Herder on `wh-775`); `wh-776`/`wh-777`/`wh-778` the age, the farming change and the hedging (the French economist and the wages gap on `wh-776`, turnip-and-clover rotations on `wh-777`, commissioners named in a private act on `wh-778`); `wh-779`/`wh-780` the machine and the man (Savery's piston-less pump and the atmospheric engine on `wh-779`, the model repair and the act of Parliament on `wh-780`). *Against other cards:* none; `wh-769` and `wh-770` were read for `wh-771` and `wh-772` and no phrasing fits them. **Cross-card note:** `wh-779`'s locator is Griff (a colliery), where Newcomen's first engine did not stand (Dudley Castle, per the Linda Hall Library and the Science Museum); the locator is left as it was and wants a move or removal in a locator pass.

**Glossary.** Seven terms rewritten (*Revolutions of 1848*, *Nationalism*, *Industrial Revolution*, *British Agricultural Revolution*, *Enclosure*, *Steam engine*, *James Watt*); *José de San Martín*, *Mexican War of Independence* and *Liberalism* kept.

### B79 — `wh-781`–`wh-790`, The Industrial Revolution (2026-10-23)

Run as B78. The machinery and transport cards no longer rest on the Victorian histories (Baines, Ure, Toynbee, Smiles's page numbers, Thurston) reached through archive.org: the dates are the patents', the statutes' and the museums', and the "firsts" are attributed to whoever claims them. `us-`, `ru-` and `cnh-` have no card on these subjects except `cnh-601` (the cotton mill), which agrees on Cromford in 1771. Pictures skipped.
Checks: `wh-audit.js --range=wh-781:wh-790` nine clean and one `I.none` on `wh-789`, whose old card has no picture (the picture pass's to add); `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 75 distinct URLs non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-781` spinning jenny | 8 | 5 → 8 | **Hargreaves's dates are now whose they are**: invented c. 1764 (Baines), 1767 (Arkwright), patented 1770; the day of the patent could not be sourced and is not printed. The "eight spindles at first, 120 later" row is gone because Baines (8 at first, "sixteen or more" in the patent, 120 later) and Allen (12 at first, a 120-spindle jenny by 1780) differ, and both are given. The naming for a daughter or wife is a legend attributed to Baines; "spun weft rather than warp" is dropped; the mule link and the Blackburn mob remain. Only the 1835 Baines of the old five sources is kept. |
| `wh-782` factory system | 8 | 5 → 8 | **The line listed other events**: emptied, undatable true, since sources give different starts (Ure: Lombe's mill c. 1718 had some elements; the UNESCO summary: Cromford 1771 and 1776 – 77 truly established the Arkwright system; Toynbee: steam in a cotton mill 1785). The Derwent Valley Mills site is itself split on the Lombe mill (begun 1721 or about 1715). Ure is no longer credited with defining the system, and the coinage of the phrase is not claimed (Baines uses it too in 1835); the glossary is rebuilt around Langlois. |
| `wh-783` coal mining | 9 | 5 → 10 | **Coal mining has no single start**: the line of the Davy lamp, its first use and the report of 1842 is emptied, undatable true (Romans used some coal in Britain, per Galloway; widespread use in Northern Song China, per Wagner). The lamp reached the north on 8 January 1816 and was tried at Hebburn the next day (Galloway); Felling 1812 killed 92 and Hartley 1862 killed 204. "15.8 million tonnes consumed in 1829" was one witness's estimate which the committee thought far too low; Galloway's c. 10 million for 1800 and Jevons's 86,292,215 tons for 1863 replace it. |
| `wh-784` Bessemer process | 8 | 5 → 8 | **The dates are Bessemer's own**: patented 17 October 1855 (the first air-blast patent), paper read 13 August 1856 (Bishop and Bessemer's autobiography; 11 August is Turner's), basic lining in spring 1878. Kelly's priority (decided 13 April 1857) and Mushet's lapsed patents are attributed; cast steel never sold in Sheffield for under £50 a ton (Turner) against Bessemer's tool steel at £42; Hanyang in China is the tie to `cnh-`. The Victorian metallurgy books are dropped. |
| `wh-785` railway | 9 | 5 → 10 | **"Locomotive trial October 1829" belongs to `wh-786`**: the line of two openings and a trial is emptied, undatable true, since each "first" (wagonway, public horse line, steam locomotive, steam public line, inter-urban line) is a different claim. The card starts from the Wollaton wagonway, the Surrey Iron Railway of 1803 and Trevithick's locomotive of 1804, and attributes the openings of 27 September 1825 and 15 September 1830 to the museums that claim them. The Sankey viaduct speed and the "rope haulage" sentence are dropped. |
| `wh-786` Stephenson's Rocket | 9 | 5 → 9 | **"The fastest engine at Rainhill" was wrong**: the National Railway Museum says Novelty was faster and broke down. The line is Built 1829, Trials 6 – 14 October 1829 and Preserved 1862; the 56 km/h of the old card was an unloaded run after the prize, and speeds differ by source (48 km/h for a locomotive-only run, 35 mph a "world record" on a Science Museum blog). Booth's boiler idea is attributed to him; the cause of Sans Pareil's failure and the number of runs differ by source and are not printed. |
| `wh-787` Bridgewater Canal | 8 | 5 → 8 | **The line is relabelled and sourced**: First Act 23 March 1759, First coal boat 17 July 1761 (Smiles; the Company calls it the opening) and Mersey Act March 1762. The "first canal" label is disputed (the Sankey Brook Navigation opened in 1757); the halved price of coal is attributed to its reporters; the "castles in the air" engineer is left unnamed; the claims that nobody had crossed a navigable river and of an 18-mile tunnel are dropped or attributed. |
| `wh-788` urbanisation | 8 | 5 → 8 | **The old line was two towns' and one county's census figures** (Liverpool 4,000 in 1685; Lancashire 297,400 in 1750): emptied, undatable true, the Toynbee and Baines figures dropped as unreadable. "Urban" is a convention (Law and Robson: over 2,500 people and over one to the acre; the United Nations relies on national definitions). England and Wales passed half urban by 1851 on three counts (50.2, 51.4 and 54.0 per cent); coal is a driver (about 60 per cent of European city growth, 1750 – 1900); Chadwick's ages at death are a poor measure of life expectancy. |
| `wh-789` child labour | 9 | 5 → 9 | **A concept that is neither British nor of the 1800s only**: the line of British statutes is emptied, undatable true. The card defines child labour as the ILO and UNICEF do, sets Britain between farm work (English farm accounts from 1740 to 1850) and the factory, gives today's estimate (160 million, 70 per cent in agriculture) and calls the Sadler report partisan on the commission's side, with Engels the one major critic to reject the report as overly biased. No British census figure could be sourced openly. The card has no picture (the audit's `I.none`). |
| `wh-790` Factory Acts | 8 | 5 → 9 | **Each row checked against the statutes**: 1802 (42 Geo. III c. 73, 22 June 1802), 1833 (3 & 4 Will. IV c. 103, 29 August 1833), 1847 (10 & 11 Vict. c. 29) and a new row In force 1 May 1848, the date the Act's own text sets (one history says 21 May). "Origin of modern labour law", the visitors "from among themselves" (the 1802 Act has two visitors a year named by the justices) and the fines are dropped; the Mines Act of 1842 has no text layer and its ages are left out. |

**Read by eye.** *Article:* "the spinning jenny", "the factory system" ("under the ____"), "coal mining" bare ("deep ____"), "the Bessemer process", "the railway", "Stephenson's Rocket" bare, "the Bridgewater Canal", "urbanisation" bare ("the result of ____"), "child labour" bare ("define ____") and "the Factory Acts" with "the" where the sentence needs it. *Confusability:* `wh-781`/`wh-782` the machine and the system (the hand wheel and the mob at home on `wh-781`, the Lombe mill and the discipline of the pace on `wh-782`); `wh-783`/`wh-784` the digging and the steelmaking (the safety lamp and women underground on `wh-783`, the tilting converter and phosphorus on `wh-784`); `wh-785`/`wh-786`/`wh-787` the track, the engine and the waterway (the County Durham opening on `wh-785`, Novelty and Sans Pareil on `wh-786`, the aqueduct and the castles in the air on `wh-787`); `wh-788`/`wh-789`/`wh-790` the process, the work and the statutes (back-to-back houses on `wh-788`, the Sadler committee on `wh-789`, the inspectors on `wh-790`). *Against other cards:* `wh-777` and `wh-778` (farming and enclosure) are siblings and do not fit; none edited. **Cross-card note:** `wh-789` has no picture.

**Glossary.** Eight terms rewritten (*Factory system*, *Coal mining*, *Bessemer process*, *Rail transport*, *Stephenson's Rocket*, *Urbanisation*, *Child labour*, *Factory Acts*); *Spinning jenny* and *Bridgewater Canal* kept.

### B80 — `wh-791`–`wh-800`, The Industrial Revolution (2026-10-23)

Run as B79, which ends the range: **`wh-701`–`wh-800` are done**. The Luddite, union and Marx cards are told from the statutes, the debates and the texts themselves (Hansard, the Frame-Breaking Act, the Manifesto's prefaces, Marx's own essay for the opium sentence), and the machinery cards attribute every "first". `ru-`, `us-` and `cnh-` have no card on these subjects (`cnh-587`, `cnh-608`, `cnh-614` and `cnh-616` mention Marxism only in passing). Pictures skipped.
Checks: `wh-audit.js --range=wh-791:wh-800` all ten clean; `check-cards` all pass; `check-citations --card` 0 mismatched on all ten; none of 75 distinct URLs non-2xx (two timed out in the batch run and answered on a second).

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-791` Luddite | 8 | 6 → 9 | **Byron's speech was misreported**: the old card said Byron warned that juries would refuse to convict; his speech asks where the evidence would come from, and the juries point is dropped. The line is Began March 1811, Rawfolds attack April 1812 and York hangings January 1813 (the Hammonds' death-roll of 17, three for Horsfall and 14 more); "risings 1811 – 1813" is the intense years only (sources run to 1817) and "made capital March 1812" is the Act of 20 March 1812. The troops are Hobsbawm's 12,000 (13,000 in another source); Ned Ludd is probably legend; the wrecking is an old trade-union technique, mainly to defend wages. |
| `wh-792` Trade union | 9 | 5 → 9 | **The line was three other events** (the Combination Acts, their repeal, legal status in 1871): emptied, undatable true. The Webbs defined a trade union and found none in the British Isles before the later 17th century; their account of the repeal and the Act of 1825 is theirs, taken from Place's papers; Howell's claim that the Act of 1871 "deliberately withheld" the power to sue is his, and section 9 lets a registered union's trustees sue over its property. Tolpuddle is added. |
| `wh-793` Karl Marx | 9 | 6 → 9 | **The old sources (Spargo, Kirkup, an 1898 Manifesto) are replaced by nine pages read**: born 5 May 1818 at Trier, died 14 March 1883 and buried 17 March (Mehring), *Capital* vol. 1 in 1867, vol. 2 in 1885 and vol. 3 in 1894 edited by Engels. The opium sentence is read with the lines around it, in the essay published in Paris in 1844. "Brückergasse 664", "second child" and the claim that he lived on family money are dropped. |
| `wh-794` Communist Manifesto | 9 | 5 → 9 | **"First copies on 24 February" and "carried by Lessner" have no source**: the day of publication is a disputed row (Hobsbawm: a week or two before the revolutions; the MIA editors: the end of February 1848). The congress is 29 November – 8 December 1847 (MIA editors; Engels says November), the first English version 1850 in the *Red Republican* (June – November 1850 in the MIA), and "the most widely circulated political pamphlet of the century" is dropped. The glossary's 24 February claim was wrong. |
| `wh-795` Socialism | 9 | 5 → 9 | **The old line was a list of milestones for a concept**: emptied, undatable true. The definition is contested (one survey says many, and not the same as statism); the word is Owenite in the *Co-operative Magazine* of November 1827 (Itoh, citing Beer), with no French claim made; "utopian" against "scientific" is Engels's label; relatives (communism per Lenin, anarchism and social democracy per SEP) and regimes that named themselves socialist are attributed. A dictionary of 1924 is reported to have canvassed no fewer than 40 definitions. |
| `wh-796` Second Industrial Revolution | 7 | 5 → 7 | **"Cheap steel from 1856" and "electric supply from the 1880s" were other events**: the span is three labelled rows saying whose (Mokyr 1870 – 1914, Homburg c. 1870 – 1900, Gordon 1870 – 1900 in the prose) and the phrase first printed by Geddes in 1915 (paleotechnic and neotechnic); Landes is credited via an abstract with standardising it. The cable of 1866, the electric-current growth figure and the natural-monopoly argument are dropped; Mokyr says the typical firm stayed small. |
| `wh-797` Electrification | 7 | 5 → 8 | **No source dates a start**: the line (ring dynamo, lightbulb, 5,221 stations) is emptied, undatable true. Godalming claims public supply on 26 September 1881, the IEEE puts Holborn Viaduct from January 1882 and Pearl Street on 4 September 1882; the lamp priority and the war of the currents are attributed. The 5,221 stations are the Census Bureau's own 1912 count with its caveat (directories list more); the delay in factory productivity gains is one economic historian's argument. |
| `wh-798` Electrical telegraph | 8 | 5 → 9 | **No one person invented it**: the line is four claims, Shilling's demonstration 1832 (IEEE milestone text), Gauss and Weber's line May 1833, the Cooke-Wheatstone patent June 1837 (the day is 10 or 12 June by source, so only the month is printed) and Morse's line of 24 May 1844 (US Senate). The first-cable details of Heart's Content, the London – Birmingham line of 1838 and the Bombay same-day claim are dropped; the Atlantic cable failed within months because the technology was immature. |
| `wh-799` Steamship | 9 | 5 → 10 | **The old line implied a "first"**: emptied, undatable true. The firsts are attributed: Charlotte Dundas 1802 ("perhaps the first truly practical", Royal Museums Greenwich), Fulton's boat of 1807 the first commercially successful riverboat, the *Savannah* of 1819 under steam only 80 to 100 hours of 29 days, *Sirius* and *Great Western* in April 1838 (Sirius a day ahead per Smil), the *Britannia* sailing 4 July 1840. "Compound engines from the 1860s" is replaced by Elder's engines of 1854 and 1856; the Fry and Lindsay figures are dropped. |
| `wh-800` Suez Canal | 9 | 6 → 9 | **"Company formed 1854" was the concession** (30 November 1854); the Compagnie universelle was formed on 15 December 1858 and digging began on 25 April 1859. The sale of the Egyptian ruler's shares to Britain was 25 November 1875 (£4 million, Hefler; the Authority's page prints 15 February 1875 and a different sum). The forced-labour toll is whose figure it is (Piquet finds no accurate archives for the highest, 120,000), the length at opening 164 km, and the 1888 Convention is added. The anecdotes from Lesseps's memoir are dropped. |

**Read by eye.** *Article:* "Luddite" bare ("each ____ who joined", "the ____ machine-breakers"), "a trade union" ("the right of the ____"), "Karl Marx" bare, "the Communist Manifesto", "socialism" bare ("the tradition of ____"), "the Second Industrial Revolution", "electrification" bare ("the ____ of cities"), "the electrical telegraph" ("an early British ____ system"), "the steamship" and "the Suez Canal" with "the" where the sentence needs it. *Confusability:* `wh-791`/`wh-792` the breakers and the associations (Sherwood Forest letters and Byron on `wh-791`, the Webbs' definition and the Dorset labourers on `wh-792`); `wh-793`/`wh-794` the man and the pamphlet (the armchair and the graveside speech on `wh-793`, the spectre and the treason trial on `wh-794`); `wh-795`/`wh-796` the creed and the era (the co-operative magazine and Lenin on `wh-795`, the town planner's book on `wh-796`); `wh-797`/`wh-798` the current and the wire (the New Deal cooperatives on `wh-797`, the needles on a diamond dial on `wh-798`); `wh-799`/`wh-800` the ship and the canal (the Cunard sailing on `wh-799`, the French imperial yacht on `wh-800`). *Against other cards:* none; no `ru-`, `us-` or `cnh-` card disagrees; none edited. **Cross-card note:** the card's `Shilling` for the Russian inventor follows the IEEE milestone text, where the common English form is Schilling.

**Glossary.** Ten terms rewritten (*Luddite*, *Trade union*, *Karl Marx*, *The Communist Manifesto*, *Socialism*, *Second Industrial Revolution*, *Electrification*, *Electrical telegraph*, *Steamship*, *Suez Canal*).

### B81 — `wh-801`–`wh-810`, Nations, ideologies and reform (2026-10-23)

Run as B80, with the house rules of the last range added to every agent prompt (markers after the full stop, no numeral or compound number-word in a question, "Why" on every Think-it-through, a clue that never holds the answer's own word). The unification, Bismarck and Crimean cards are told from the texts themselves (the Camera dei deputati's catalogue, Hertslet's treaty texts, Moltke's account, Headlam, the Public Law of Europe wording of the Treaty of Paris), and every "first" or cause is attributed to whoever holds it. No `us-`, `ru-`, `cnh-`, `jp-`, `ko-` or `eg-` card covers these subjects (`ru-` stops at the Mongol invasion), so there is nothing to disagree with. Pictures skipped: Commons answered a plain query but rate-limited `commons.py` search (429), so no picture pass was run.
Checks: `wh-audit.js --range=wh-801:wh-810` all ten with no finding; `check-questions` and `check-cards` pass; `check-citations --card` 0 mismatched on all ten; none of 61 distinct URLs (113 citations) non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-801` nation state | 8 | 5 → 8 | **The line was other events' dates** (Kingdom of Italy 1861, German Empire 1871, Renan's lecture): emptied, undatable true; the years stay in the prose. Mill's and Renan's definitions are attributed to the writers and checked against the texts (the "replied in 1882" implied a reply to Mill that neither text says); "more than 300" German states is the Office of the Historian's figure; the Westphalia origin story is one critic's argument (Osiander, 2001) and not presented as settled; the minority-alienation charge is attributed to the SEP survey. |
| `wh-802` unification of Italy | 8 | 5 → 8 | **The first parliament did not meet at Turin on 2 April 1861**: the Camera dei deputati gives elections on 27 January and 3 February, the first sitting on 18 February and the law naming Victor Emmanuel II King of Italy on 17 March 1861. The two warships off Marsala were British, not Neapolitan; the Thousand are 1,089 (Trevelyan) or 1,087 (Dickinson). Venetia is rewritten from the Vienna treaty of 3 October 1866 (ceded to the Emperor of the French, to be united once the people were consulted); the Venetian plebiscite is not dated because no source read gives the day. The line is now four rows of this event's own dates. |
| `wh-803` Giuseppe Garibaldi | 8 | 5 → 8 | **The Thousand were not in red shirts**: Trevelyan says they left Quarto mostly in civilian dress and only fifty red shirts were issued on the voyage; the shirt's origin (Montevideo, cloth meant for slaughterhouse workers) is attributed to two modern accounts. The landing is 11 May 1860, not "May 1860"; the "neither pay, nor quarters, nor provisions" quotation is dropped (not on any page read, and it belongs to 1849); the old Turin 2 April 1861 sentence is dropped; Teano, Aspromonte and Mentana are added with dates. |
| `wh-804` unification of Germany | 8 | 5 → 8 | **The line was three milestones**: now the span 1866 – 1871 (the German History in Documents and Images account) and the proclamation of 18 January 1871. "Prussia declared the Confederation dissolved" is corrected (Austria acknowledged its end at Prague, 23 August 1866); the southern treaties were signed in November 1870, not carried in by Sedan; the constitution is dated 16 April 1871 and took effect on 4 May. The framing (instalments, a German civil war, a revolution from above) is attributed to the sources that use it. |
| `wh-805` Otto von Bismarck | 8 | 5 → 8 | **The Ems edit is Bismarck's own account**: he struck out words and added none, the effect coming from the form, with Headlam's judgement that "falsification" is not altogether correct and the museum's "sharpened" shown as a disagreement; whether it caused the war is left to historians. The line is Born 1 April 1815, premier 1862, Chancellor 1871 – 1890 and Died 30 July 1898 (the death date rests on the museum; Headlam says "the last day of July"). Unreadable archive.org page claims on the North German Confederation and universal suffrage are dropped; "blood and iron" is the budget committee of 30 September 1862, with his later explanation. |
| `wh-806` Franco-Prussian War | 8 | 5 → 8 | **The republic was proclaimed on 4 September, not two days after Sedan** (Moltke). The line is the French declaration of 19 July 1870, Sedan on 1 September, the armistice of 28 January 1871 and the Frankfurt treaty of 10 May 1871; the emperor's personal surrender (1 September) is separated from the army's capitulation (2 September, 104,000 men by Moltke's count). Casualty figures are attributed to Moltke and Segesvary, and the cause of the war is given as the Hohenzollern candidacy and the Ems telegram with Moltke's own view of French revenge. |
| `wh-807` Austria-Hungary | 7 | 5 → 8 | **"Full legal equality" was a misreading**: Seton-Watson's sentence is about the Pragmatic Sanction of 1723, not the Compromise. The line is now one span, In existence 1867 – 1918 (the Nikolsburg peace was another event); census figures are attributed (the Austrian census of 1910 by language of daily use, German 35.6 per cent; the Hungarian census of 1900, Magyars 45.4 per cent of Transleithania). Karl's manifesto of 16 October 1918 spoke only to the Austrian peoples; the 8 June 1867 coronation and "prison of nations" are left out as unsourced. |
| `wh-808` Tanzimat | 7 | 5 → 7 | **The line is relabelled**: Edict read 3 November 1839 and a labelled span (Altınay 1839 – 1876), because Altınay ends the era in 1876 while Aytemiz ends a first stage in 1856 and follows Tanzimat practices to 1924. The State Department page on 1830s relations, unrelated to the Tanzimat, is dropped. The edict is read from Engelhardt's printed text; "imposed by Europe" is a debate (the 1839 edict called European states as witnesses, the Treaty of Paris says the 1856 edict was the sultan's will); the 1858 land code, the 1869 law on foreign ownership and the debt control of 1881 are added. |
| `wh-809` Crimean War | 8 | 5 → 10 | **The line mixed in Inkerman**: it is now the Ottoman declaration (October 1853), the British and French declaration of 28 March 1854, the siege (October 1854 – September 1855) and the Treaty of Paris of 30 March 1856. The treaty does not open by declaring Ottoman integrity (that is Art. VII); the Russian motive for repudiating the Black Sea clauses is dropped for Hertslet's note of the abrogation in 1871. Disease and casualty figures are attributed to the National Army Museum and Nightingale; the old question put the siege in the Black Sea. The picture's description no longer names the photographer (audit `I.caption-source`). |
| `wh-810` serfdom | 8 | 5 → 8 | **The line was other events' dates**: the Pugachov rising, "early 19th century" as a peak and 1861 (wh-811's) are gone; serfdom has no single start (late 16th century per Moon, the Code of 1649 capping it per Nafziger), so undatable true. The "55 per cent" is Kornilov's figure from the census of 1783, set beside 36 per cent of all people or 43 per cent of the rural population in 1857 – 58 (two modern studies). "Western Europe had shed serfdom" is now a historians' view, attributed, and Paul I's manifesto of 5 April 1797 is read as banning only holiday work (Kornilov), not as a three-day limit. |

**Read by eye.** *Article:* "the nation state" ("an aim at the heart of the ____"), "the unification of Italy", "Giuseppe Garibaldi" bare, "the unification of Germany", "Otto von Bismarck" bare, "the Franco-Prussian War", "Austria-Hungary" bare ("reigned over ____"), "the Tanzimat" ("an edict opening the ____"), "the Crimean War" and "serfdom" bare ("under ____ at its height"). *Confusability:* `wh-801`/`wh-802`/`wh-804` the idea and the two unifications (Mill and Renan on `wh-801`; Marsala, Turin and Porta Pia on `wh-802`; the Hall of Mirrors and the northern federation on `wh-804`); `wh-802`/`wh-803` the process and the man (the parliament on `wh-802`, the red shirt and the wound at Aspromonte on `wh-803`); `wh-804`/`wh-805` the process and the statesman (the shortened telegram and the budget-committee speech on `wh-805`); `wh-805`/`wh-806` the man and the war (the telegram's edit on `wh-805`, the Hohenzollern candidacy, Sedan and the Frankfurt treaty on `wh-806`); `wh-807`/`wh-808` two empires reforming (the Compromise and the census on `wh-807`, the Gülhane edict on `wh-808`); `wh-809`/`wh-810` a war and an institution (the Light Brigade and the Black Sea clause on `wh-809`, the Council Code and the soul tax on `wh-810`). *Against other cards:* none disagree; `wh-804` and `wh-806` share the proclamation at Versailles on 18 January 1871 and agree; none edited.

**Glossary.** Ten terms rewritten (*Nation state*, *Unification of Italy*, *Giuseppe Garibaldi*, *Unification of Germany*, *Otto von Bismarck*, *Franco-Prussian War*, *Austria-Hungary*, *Tanzimat*, *Crimean War*, *Serfdom*).

### B82 — `wh-811`–`wh-820`, Nations, ideologies and reform (2026-10-23)

Run as B81. The American and Russian cards no longer lean on the Miller Center, Hacker or archive.org page numbers that could not be read: the cause of the Civil War rests on the secession declarations and Lincoln's second inaugural, the Emancipation Proclamation on its own text at the National Archives, and the Trail of Tears deaths are four figures with their owners. Suffrage dates are each the country's own (the statutes for Britain), and a "world first" is a claim attributed to whoever makes it. `us-` has no card on Lincoln, the Civil War, Reconstruction, Manifest Destiny or the Trail of Tears (it stops at `us-100`), and `ru-` none on the Crimean reforms or serfdom, so there is nothing to disagree with (`us-083` on California agrees with `wh-816`'s Native population). Pictures skipped.
Checks: `wh-audit.js --range=wh-811:wh-820` ten cards with `I.none` (no picture) as the only finding, the picture pass's; `check-questions` and `check-cards` pass; `check-citations --card` 0 mismatched on all ten; none of 90 distinct URLs (110 citations) non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-811` Emancipation reform of 1861 | 7 | 8 → 7 | **The line is kept; the account is rebuilt on pages read.** The "more than 20 million" is Wallace's figure (his own footnote says 40 million with state peasants) beside Nafziger's 22 million privately owned serfs; the carnival delay and the reading on 5 March are Kropotkin's recollection, not fact; the speech to Moscow nobles of March 1856 is added. Redemption stays four-fifths advanced at 6 per cent over 49 years; dues were halved for 1906 and ended after January 1907 (Kornilov). The productivity claim is one study that separates emancipation (raised output) from the later land reform (lowered it). |
| `wh-812` American Civil War | 9 | 10 → 12 | **The war ended by separate surrenders**: the line is Began 12 April 1861, Lee surrenders 9 April 1865 and Smith surrenders 2 June 1865 (Johnston gave in on 26 April), with the 13th Amendment (ratified 6 December 1865) in the prose. The cause rests on South Carolina's and Mississippi's declarations and Lincoln's second inaugural, with the Lost Cause attributed to its holders and called a myth by the National Park Service. The dead are 618,222 (the long-accepted count), over 750,000 (a census-based study of 2011) and about 698,000 (2024), each with its owner; the Miller Center and Hacker sources could not be read and are dropped. |
| `wh-813` Abraham Lincoln | 9 | 9 → 11 | **The old line gave no dates**: now Lived 12 February 1809 – 15 April 1865 and In office from 4 March 1861. "Whig" and "joined the Republican Party in the mid-1850s" are dropped (no page read gives them); the Miller Center pages are replaced. Added with their sources: the 1860 vote of 39.8 per cent, his Ottawa statement on equality and natural rights, the colonisation address and Greeley letter of August 1862, the habeas proclamation and the five Gettysburg manuscript copies. The 16 June date of the House Divided speech could not be sourced (the edition prints 17 June), so the card says 1858. |
| `wh-814` Emancipation Proclamation | 8 | 8 → 8 | **The 13th Amendment row belonged to another event**: the line is Preliminary 22 September 1862 and Issued 1 January 1863. "Exempted Tennessee" is corrected: the text does not name Tennessee, while Louisiana parishes and Virginia counties are excepted by name; soldier counts are attributed (National Archives "almost 200,000", American Battlefield Trust "more than 200,000"). The Britain-and-public-opinion claim and the cabinet remark of July are dropped as resting on unreadable pages. |
| `wh-815` Reconstruction era | 8 | 9 → 9 | **1865 – 1877 is Foner's dating**: the line now labels it and sets the National Park Service's wider 1861 – 1900 beside it, with the amendments' exact ratification dates (14th 9 July 1868, 15th 3 February 1870). "About 2,000 office-holders" is dropped (Foner gives some 16 in Congress and over 600 in state legislatures); the figure of at least 2,000 lynchings is the Equal Justice Initiative's, for the twelve years. The Freedmen's Bureau (3 March 1865) and the Senate's one-vote short of conviction are sourced. |
| `wh-816` manifest destiny | 8 | 9 → 9 | **The line listed other events' dates** (Texas admitted, the war, the treaty): it is now the phrase's own, July – August 1845 in the *Democratic Review* and 27 December 1845 on Oregon, labelled as Pratt's 1927 finding. O'Sullivan's authorship is attributed to that study (the essay is unsigned); the Senate vote on the treaty is dropped (34 to 14 on one page, 38 to 14 on another); Lincoln's Spot Resolutions are sourced to the National Archives and House records, and the Native population figure to a University of California essay. |
| `wh-817` Trail of Tears | 9 | 9 → 10 | **Deaths are given as four owned figures**: over 1,600 recorded in Ross's detachments (Mooney), over 4,000 (Butler, via the National Park Service), some 4,000 (Cherokee Nation) and three to four thousand (State Department historians). The line starts at the Choctaw removal (1831 – 1832) and drops the Removal Act row; the protests of nearly 16,000 Cherokee and the one-vote margin in the Senate are attributed to Mooney and the *Encyclopedia of North Carolina*. The Cherokee-language name and the phrase's origin are left out because no reliable page opened. |
| `wh-818` women's suffrage | 9 | 13 → 13 | **The line was a list of milestones for a concept**: emptied, undatable true, each date now in the prose with its country. The "world first" claims are each attributed to the source making them (New Zealand's Ministry for Women, the State Library of South Australia, Finland's portal); the 1918 and 1928 Acts are read from the statutes (women of 30 with a property qualification, then equal); the militant and constitutional split is Fawcett's account; "blew up pillar boxes" and forcible-feeding details are dropped as unread. |
| `wh-819` Mary Wollstonecraft | 8 | 9 → 8 | **"The first English feminist" is a 20th-century scholars' label**, now attributed; the vote is a passing hint in the *Rights of Woman*, read in the Gutenberg text, and the book is not said to demand it. "Puerperal fever" is dropped (Godwin gives a retained placenta), so the card says only "days after" the birth. The line is Lived plus the two *Vindications* of 1790 and 1792; Fawcett's remark of 1891 is hers, as a reading of the book. |
| `wh-820` sanitary movement | 7 | 7 → 9 | **The line listed milestones of a movement**: emptied, undatable true, since the sources give different spans (Nosrati and others c. 1834 – 1914, Tulchinsky 1830 – 1875). The Liverpool ages (15 against 35) are flagged as ages at death, not life expectancy (62 per cent of labouring-class deaths were under five); Chadwick's forced resignation in 1854 and the board's dissolution in 1858, Snow's own account (attacks already falling when the handle came off) and the Chancellor's proposal of up to £3,000,000 (Hansard, July 1858) are re-sourced. The old glossary claim about North America is replaced. |

**Read by eye.** *Article:* "the Emancipation reform of 1861" ("the manifesto of the ____"), "the American Civil War", "Abraham Lincoln" bare, "the Emancipation Proclamation", "the Reconstruction era", "manifest destiny" bare ("the nation's ____"), "the Trail of Tears", "women's suffrage" bare ("campaigned for ____"), "Mary Wollstonecraft" bare and "the sanitary movement". *Confusability:* `wh-811`/`wh-810` the law and the institution (the manifesto, redemption dues and Bezdna on `wh-811`); `wh-812`/`wh-813`/`wh-814` the war, the man and the order (Sumter and Appomattox on `wh-812`, the Greeley letter and Gettysburg on `wh-813`, the border states and Annie Davis's letter on `wh-814`); `wh-814`/`wh-815` the order and the era after it (military districts and the Klan on `wh-815`); `wh-816`/`wh-817` the doctrine and the removals (the unsigned essay and the Spot Resolutions on `wh-816`, the treaty signed by a faction and the detachments on `wh-817`); `wh-818`/`wh-819` the movement and the writer (Seneca Falls, Fawcett and the Pankhursts on `wh-818`, Rousseau, Johnson and Godwin's memoir on `wh-819`); `wh-819`/`wh-820` the writer and the reform (Chadwick, the Thames and Snow's pump on `wh-820`). *Against other cards:* none disagree; none edited. **Cross-card note:** `wh-816`'s Senate vote on the treaty is left out because two pages give 34 to 14 and 38 to 14.

**Glossary.** Three terms rewritten (*American Civil War*, *Abraham Lincoln*, *Sanitary movement*); the other seven kept.

### B83 — `wh-821`–`wh-830`, Nations, ideologies and reform and Empire and the colonised world (2026-10-23)

Run as B82. The science cards (germ theory, Darwin, the *Origin*) are told from Darwin Online and the Darwin Correspondence Project, the schooling card from the statutes, and the imperial cards from the Act, Hertslet's treaty texts and Lenin's own quotation of Supan, with every "cause" given as "one view is" and its owner. The Berlin card says what the Act did and did not do; the Congo card states no death toll as fact. `us-` has no card on Darwin or the penny press, and `ru-`, `cnh-`, `in-` have none on these subjects, so there is nothing to disagree with. Pictures skipped.
Checks: `wh-audit.js --range=wh-821:wh-830` ten cards with `I.none` (no picture) as the only finding, the picture pass's; `check-questions` and `check-cards` pass; `check-citations --card` 0 mismatched on all ten; none of 75 distinct URLs (99 citations) non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-821` germ theory of disease | 8 | 9 → 10 | **The line was four other events' dates** (Lister 1867, Koch's anthrax 1876, tuberculosis 1882, cholera 1883 – 84) for a theory with no single start: emptied, undatable true. Semmelweis and Snow are attributed, not given as "the Broad Street pump" fact; Pasteur's germs in the air are by his own account of 1878, with Koch's work of 1876 "published" and earlier discoverers of the bacillus named; Pacini's 1854 description of the cholera bacillus and the postulates (with Loeffler, and their limits for viruses) are added. Hamburg 1892, the Mikulicz mask and Pasteur's vaccine dates are dropped as unread. |
| `wh-822` Charles Darwin | 9 | 9 → 9 | **Dates verified and legends attributed**: Born 12 February 1809, the *Beagle* voyage 27 December 1831 – 2 October 1836, the *Origin* 24 November 1859 and Died 19 April 1882. The Galápagos finch story is a legend (van Wyhe's report of research from the early 1980s); Wallace's essay and the joint reading at the Linnean Society on 1 July 1858, with Darwin absent, are added, as are the first edition ending on "evolved" and Spencer's phrase entering later editions. "Ternate fever" is dropped; the degree is the SEP's "divinity" and graduation in January 1831, attributed. |
| `wh-823` On the Origin of Species | 9 | 9 → 9 | **The first print run was offered to the trade, not sold out to readers**: 1,250 copies were printed and offered to booksellers on 22 November (Freeman), and Darwin's letter says "to the trade" even where his diary says all sold on the first day. The line is Published 24 November 1859 and Sixth edition February 1872 (the Oxford row was another event); "evolution" appears in the sixth edition, not the first; the Oxford meeting is a reception event whose famous version was built later by Darwin's allies. |
| `wh-824` compulsory education | 8 | 9 → 9 | **The line was four countries' milestones for a concept**: emptied, undatable true. England and Wales corrected from the statutes: the 1870 Act (s. 74) only let school boards make byelaws, the 1876 Act made it a parent's duty and the 1880 Act obliged every local authority to make byelaws. Prussia's decree of 12 August 1763 is read in the decree (fee still owed, fine of sixteen groschen); Massachusetts 1852 is Katz's "first", largely unenforced; Weimar 1619 and "52 years" are dropped (no readable source). The glossary's unsourced 17th-century claim is replaced. |
| `wh-825` penny press | 7 | 7 → 7 | **The line listed three papers' dates**: only the *Sun*'s first issue, 3 September 1833, remains. The stamp duty is "an Act that an 1887 history dates to 15 June 1855" (Fox Bourne); "first London penny daily" is hedged since provincial penny dailies came first; circulation figures, steam presses from 1835 and several Petit Journal claims are dropped as unverified or conflicting (the million mark is dated 1886, 1890, 1891 or later by different sources). |
| `wh-826` New Imperialism | 7 | 11 → 8 | **The line listed writings about the era** (Hobson 1902, Lenin 1917): emptied, undatable true, since the bounds are conventions (late 1870s to 1914 for the Scramble, Hobson's 1884 – 1900 peak as Lenin reports it). Supan's table, as Lenin quotes it, replaces the territory figures (Africa 10.8 per cent in 1876, 90.4 per cent in 1900); causes are "one view is" with Gallagher and Robinson, Hobson, Lenin and Cain and Hopkins; Ferry's speech of July 1885 is attributed; Omdurman is sourced to Brown. |
| `wh-827` Scramble for Africa | 8 | 9 → 8 | **Unsourced claims dropped**: "four-fifths of Africa still African-ruled", the Lobengula Maxim episode, the 1890 arms ban and Samori. The line is kept as c. 1880 – 1914, now sourced (Reid: conventionally the late 1870s to the First World War), with Supan's figures given as his; the Berlin myth is answered by a study of 107 borders (median first formed in 1891), and the causes (Egypt, an export-price boom, rivalry) are "one view is". |
| `wh-828` Berlin Conference | 7 | 8 → 7 | **Dates and the 14 governments are read from the Act**: opened 15 November 1884, Act signed 26 February 1885, Arts 34 – 35 on coastal occupation, Britain's recognition of Leopold's Association on 16 December 1884. "Did not divide Africa" is attributed to Wesseling and a study of colonial borders (the median border first formed in 1891); the unreadable UNESCO and Hansard material is dropped, and Keltie's dates (24 and 30 January) conflict with the Act and are not used. |
| `wh-829` Congo Free State | 7 | 9 → 9 | **No death-toll figure is stated as fact**: the Royal Museum for Central Africa's "hundreds of thousands, perhaps several million" sits beside the commission of 1905's own finding that smallpox and sleeping sickness were the main cause. The line is one row, 1 July 1885 (Keith) – 15 November 1908; Casement's report is dated 11 December 1903 and was published in February 1904, not 1904; the annexation is the Chamber's vote of 20 August, effective 15 November 1908. |
| `wh-830` Cecil Rhodes | 8 | 11 → 8 | **The premier row is exact**: 17 July 1890 – January 1896 (Williams; the end date varies by account). "90 per cent of diamonds" and "Maxim guns killed hundreds" are dropped as unsourced; the will also founded scholarships for Germans (Stead), so the card says only "Oxford scholarships"; the Lenin remark is attributed via Stead, and "pure Africa" and "annex the planets" were found in no text read. Glen Grey now quotes Rhodes's "gentle stimulus" beside the SAHO judgement; the 1893 conquest and 280,000 cattle are attributed. |

**Read by eye.** *Article:* "the germ theory of disease" ("to the ____"), "Charles Darwin" bare, "the *Origin*" ("Darwin's ____"), "compulsory education" bare ("an early form of ____"), "the penny press" ("launched the ____"), "the New Imperialism" ("the ____, the burst of colonial expansion"), "the Scramble for Africa", "the Berlin Conference", "the Congo Free State" and "Cecil Rhodes" bare. *Confusability:* `wh-821`/`wh-820` the theory and the reform (the carbolic dressing and the postulates on `wh-821`, the sewers and the Thames on `wh-820`); `wh-822`/`wh-823` the man and the book (Beagle, Malthus and the Abbey on `wh-822`, "one long argument" and the short abstract on `wh-823`); `wh-824`/`wh-825` schooling and the cheap paper (the Prussian regulation and byelaws on `wh-824`, the *Sun* and the stamp tax on `wh-825`); `wh-826`/`wh-827` the era and the partition (Ferry and Hobson on `wh-826`, charters and the median border on `wh-827`); `wh-827`/`wh-828`/`wh-829` the scramble, the conference and the state (the Act's rules on `wh-828`, the rubber commission on `wh-829`); `wh-829`/`wh-830` the state and the magnate (De Beers, the concession and the Raid on `wh-830`). *Against other cards:* none disagree; none edited.

**Glossary.** Four terms rewritten (*Compulsory education*, *Penny press*, *Scramble for Africa*, *Berlin Conference*); the other six kept.

### B84 — `wh-831`–`wh-840`, Empire and the colonised world (2026-10-23)

Run as B83. These are the contested-figure cards of the range, and the rule was the same on each: a casualty, force or death figure is given with its owner and never as one number in the card's voice (Isandlwana, Ulundi, the Boer camps, Adwa, Herero and Nama, Maji Maji, Cawnpore, the Opium War dead). The imperial cards no longer rest on archive.org scans, Dutt, Malleson or the UNESCO General History reached through them. `ru-`, `in-`, `jp-` and `ko-` have no card on these subjects. `cnh-` does: `cnh-561` agrees with `wh-840` on the dates of the first war and the treaty; `cnh-567` dates the burning of the palace to 18 October 1860 where `wh-840`'s sources give 18 and 19 October; `cnh-559`, `cnh-560` and `cnh-557` are not contradicted (the Canton regulations question of `cnh-557` against `wh-719` stays as carried). Pictures skipped.
Checks: `wh-audit.js --range=wh-831:wh-840` ten cards with `I.none` (no picture), the picture pass's, and one `L.missing` (`wh-837`, a state card with no locator: British India is a subcontinent with no single place to stand, as before); `check-questions` and `check-cards` pass; `check-citations --card` 0 mismatched on all ten; none of 75 distinct URLs (89 citations) non-2xx.

| card | bar | sources | the main changes |
|---|---|---|---|
| `wh-831` Anglo-Zulu War | 7 | 8 → 8 | **Casualty figures are now owned**: Isandlwana's dead are over 1,300 (SAHO), nearly 1,500 (Guy) or most of 1,700 (National Army Museum), and the Zulu dead at Ulundi about 6,000 (museum), at least 1,000 (Chelmsford) or no more than 400 (Wolseley). Frere's ultimatum of 11 December 1878 went beyond London's authority (Guy, with the Commons motion rejected 306 to 246); the line is Main fighting 11 January – 4 July 1879, the Ultimatum and the Partition of September 1879 into thirteen chiefdoms. The old questions named a numeral and used "Zulu", the answer's own word. |
| `wh-832` Second Boer War | 8 | 8 → 9 | **The Union of 1910 was another event and the camps are a span**: only Fought, 11 October 1899 – 31 May 1902, remains. Camp deaths are attributed: the National Army Museum's 28,000 Boers, van Heyningen's note that the official 27,927 is inaccurate, and 14,154 known Black deaths, possibly 20,000 or more. The 1,878 and 1,545 deaths are Hobhouse's open letter of 29 September 1901, not her report of June 1901; the Cuban precedent for the camps is added. |
| `wh-833` Battle of Adwa | 7 | 7 → 7 | **The Wuchale and Addis Ababa rows were other events**: the line is 1 March 1896 and the Ethiopian-calendar date (23 Yekatit 1888) in the Geneva museum's text. The Article 17 dispute is attributed (Italian "must" per Hertslet, Amharic "may" per the museum and SAHO); forces (about 100,000 Ethiopians against 18,000 Italians, or 20,000 in SAHO) and losses (about 6,000 Italians killed; 3,500 Ethiopians per the archbishop, as told to a British officer) are each owned; "the only African victory" is narrowed to the only one that ended a conquest. |
| `wh-834` Herero and Nama genocide | 7 | 8 → 7 | **Every contested figure has an owner**: camp deaths of nearly 7,700 of about 17,000 (Bundestag paper), 7,862 of 14,000 (Patin) and 30 – 50 per cent (Graf); a Herero census of 15,130 against an estimate of 80,000. The order of 2 October 1904 and its withdrawal on 9 December (the Bundestag paper, not 8 December as briefed) are dated; the Waterberg row is dropped and the 2021 row is relabelled "German statement", the Foreign Office's announcement of 28 May 2021, not a final treaty. Critics' charge that the talks excluded Herero and Nama is attributed to them. |
| `wh-835` Maji Maji Rebellion | 7 | 7 → 7 | **The 2023 apology and the hanging were other events**: the line is the fighting only, July 1905 – August 1907 (Wright). The deaths are the official German 75,000, the British handbook's 120,000, over 250,000 and up to 300,000 (Bachmann and Kemp), many by famine and disease; the water medicine is Kinjikitile's per Wright and Kolelo's ministers per Iliffe. Steinmeier's speech of 2023 dates the Songea executions to 7 February 1906, so no day is printed. |
| `wh-836` Battle of Plassey | 7 | 9 → 7 | **"Diwani granted 1765" was another event**: the line is the battle only, 23 June 1757. Clive's "more than 40 guns" is set against the museum's 50 and his own count of about 3,000 men against about 50,000; who killed Siraj ud-Daulah differs by source (Mir Jafar's son in the 1908 gazetteer, Mir Jafar in the museum's) and the 2 July date is left out as unsourced. The Black Hole's 123 of 146 is one survivor's account; "the start of empire" is attributed to the gazetteer and to Furber and Glamann, with Buxar called decisive. |
| `wh-837` British Raj | 8 | 10 → 10 | **The Act's date is left out**: no page read states 2 August 1858, so the line starts at the proclamation of 1 November 1858, then the Empress of India durbar of 1 January 1877 and the dominions of 15 August 1947. Princely-state, railway (270 miles in 1857 to 28,054 in 1905), famine and Partition figures are each the gazetteer's or museum's, attributed; "about 1,200 Englishmen ruling 230 million" and a 1899 – 1900 famine toll are dropped, and the drain is Naoroji's argument. |
| `wh-838` Indian Rebellion of 1857 | 8 | 9 → 8 | **Delhi's date is a span**: the National Army Museum's 14 – 21 September 1857, with Gwalior retaken 19 June 1858. The names are attributed (Mutiny, Savarkar's book of 1909, First War of Independence, rebellion), the Cawnpore captives are three sources' three figures (120, 125 and about 200), and the cartridge grease is something the 1908 gazetteer admits was partly true. "Delhi fell next day" is dropped. |
| `wh-839` Indian National Congress | 8 | 8 → 9 | **Surat is dated from an eyewitness**: 27 December 1907 (Nevinson), and the safety-valve phrase is Hume's as quoted by his biographer Wedderburn, with the thesis left open. Besant gives 72 delegates at the first session and the Library of Congress 73; the Lucknow scheme of 29 December 1916 was adopted by the League on 31 December. Only three of nine sources are modern; no fetchable journal article was found. |
| `wh-840` Opium Wars | 8 | 9 → 8 | **The indemnity is 21 million dollars from the treaty text** (Perdue's breakdown gives 20); 21,306 chests were surrendered (Perdue) and about 40,000 a year entered by 1839. Kowloon is placed in the Convention of 1860, against Perdue and Sebring; Elgin's burning of the Summer Palace is attributed to his own order, and the debate between free trade and the drug trade, and "Chinese historians see the wars as unjust", are attributed. |

**Read by eye.** *Article:* "the Anglo-Zulu War", "the Second Boer War", "the Battle of Adwa", "the Herero and Nama genocide", "the Maji Maji Rebellion", "the Battle of Plassey", "the British Raj" ("under the ____"), "the Indian Rebellion of 1857", "the Indian National Congress" and "the Opium Wars" ("the first of the ____"). *Confusability:* `wh-831`/`wh-832` two southern African wars (the camp overrun and Frere's list on `wh-831`, the Rand, the camps and the Pretoria peace on `wh-832`); `wh-833`/`wh-834`/`wh-835` three African encounters (the treaty article and Menelik's army on `wh-833`, the desert and the extermination order on `wh-834`, the cotton and the water medicine on `wh-835`); `wh-836`/`wh-837`/`wh-838` three Indian cards (Mir Jafar and the rain on `wh-836`, the drain and the princely states on `wh-837`, the cartridges and Meerut on `wh-838`); `wh-838`/`wh-839` the rising and the party (the Sanskrit college, the shoe at Surat and the Lucknow pact on `wh-839`); `wh-839`/`wh-840` the party and the wars (Lin's chests, the Cohong and the Summer Palace on `wh-840`). *Against other cards:* see the intro; none edited.

**Glossary.** Three terms rewritten (*Anglo-Zulu War*, *Battle of Adwa*, *Herero and Nama genocide*); the other seven kept.

### The six unwritten locators (2026-10-23)

`wh-041`, `wh-268`, `wh-337`, `wh-376`, `wh-422` and `wh-425` had no locator because their Wikipedia articles carry no primary coordinate (or, for the last four, are areas). All six now have one, through `add-locators.js`, each coordinate fetched and none typed.

| card | locator | how |
|---|---|---|
| `wh-041` Homo naledi | a point at Rising Star Cave, zoom 9 | Wikidata item Q16899337 (`P625`) |
| `wh-268` Ugarit | a point at Ugarit (Ras Shamra), zoom 9 | Wikidata item Q191369 (`P625`) |
| `wh-337` Etruscan civilisation | a dashed region of three blocks, anchored at Tarquinia | the same rings as `rm-022` (Etruria, the Po valley colonies, the Campanian cities), so the two cards agree |
| `wh-376` mahajanapadas | a dashed region from the Punjab to the Bengal edge and Malwa, anchored at Kosambi (Vatsa's capital) | **hand-drawn from the states the card names** (Gandhara in the north-west to Avanti at Ujjain, east to Anga); it leaves out the Deccan state Assaka and the far-north-west Kamboja |
| `wh-422` Land of Punt | two dashed blocks, the Red Sea and Gulf of Aden coast of Sudan, Eritrea, Djibouti and Somalia, and the south-western Arabian coast, anchored at Bab-el-Mandeb | **hand-drawn from the card's own list of proposals** (Mariette: the Somali coast; Kitchen: eastern Sudan and Eritrea; Meeks and Tallet: Arabia); the dash says "about here", since the Egyptians left no map |
| `wh-425` Mesoamerica | a dashed region from the Pánuco river and Sinaloa to Nicoya, anchored at the Valley of Mexico | **hand-drawn from the card's own description** (central and southern Mexico, Belize, Guatemala, El Salvador, with border country in Honduras, western Nicaragua and north-western Costa Rica) |

The three hand-drawn shapes are the one thing the tool does not fetch (its header says so); they are approximate by design and are the part a reader of the map should check. The registry has no place for any of the six, so `migrate-places.js` derived none for them (`wh-631`'s Mainz, written in B64, did resolve and its `places` is now derived too). Also re-run: `migrate-places.js`, `build-card-places.js --install`; `atlas/data/wars.js` was regenerated by `migrate-places.js` because `wh-504`'s war years had changed in an earlier batch (`1066 – 1086` to `1066 – 1066`) and the committed file lagged.

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
| `wh-041` | **locator** written 2026-10-23 at Rising Star Cave, from its Wikidata item (see the locators entry in the ledger) |
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
| `wh-268` | **locator** written 2026-10-23 from Ugarit's Wikidata item (see the locators entry in the ledger) |
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
| `wh-337` | the Piacenza liver, one divination object (`rm-029`'s subject); **locator** written 2026-10-23 as the same dashed region as `rm-022` (see the locators entry in the ledger) |
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
| `wh-422` | the hand of a mummified baboon, not Punt; the glossary's picture of Hatshepsut's fleet at Punt fits better; **locator** written 2026-10-23 as a dashed region (see the locators entry in the ledger) |
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
| `wh-531` | a luopan (a geomancer's compass), not a floating or hung needle |
| `wh-532` | a 1313 woodcut of Wang Zhen's table; its description gives "60,000" wooden types (his postscript says about 30,000) |
| `wh-534` | picture fine, but its description says the glaze "gave the ware its name" (wrong) |
| `wh-536` | a generic caravan from the Catalan Atlas, not Marco Polo |
| `wh-538` | Kinkaku-ji: description says the third Ashikaga shogun "built" it; he took it over |
| `wh-533`, `wh-535`, `wh-537`, `wh-539`, `wh-540` | kept: judged from title and description only (`wh-535` shows the founder, not the dynasty) |
| `wh-541` | a typeset forme in a case; its description says "reproducing a work of 1447" and names Song Hyon's arrangement, neither sourced |
| `wh-545` | a portrait of one man (identification disputed), not the regime |
| `wh-549` | a stone chariot at Hampi; its description says the wheels turn (no source) |
| `wh-541`–`wh-550` (others) | kept: judged from title and description only |
| `wh-551` | the Bhambore foundations; its description says "earliest known mosque in the subcontinent" and ties the site to a conquest in 712 |
| `wh-552` | a corbelled screen; its description says the masons "had never made a true arch" as fact |
| `wh-554` | the Bukit Seguntang Buddha; "the best surviving sculpture" is unsourced |
| `wh-559` | the north gate of the Hồ-dynasty citadel, one dynasty's building |
| `wh-560` | Harihara; "within a few centuries of the first Indian forms" is unsourced |
| `wh-553`, `wh-555`–`wh-558` | kept: judged from title and description only |
| `wh-561` | a row of stupas on the upper terrace, not the whole monument |
| `wh-568` | the Great Mosque of Djenné, a 20th-century rebuilding in one Sahel town |
| `wh-566` | an inscribed plaque from Koumbi Saleh, one find from the proposed capital |
| `wh-562`–`wh-567`, `wh-569`, `wh-570` (others) | kept: judged from title and description only |
| `wh-573` | a colonial-era photograph of one Bornu horseman |
| `wh-575` | a 1668 Dutch view after Dapper, who never went to Benin: an imagined picture |
| `wh-572` | the Tomb of Askia, one monument |
| `wh-578` | a Kilwa view whose description gives "11th – 18th centuries" from the file title (Horton et al. date the earliest mosque stage to the late 10th) |
| `wh-579` | a close view of wall coursing, not the whole site |
| `wh-571`, `wh-574`, `wh-576`, `wh-577`, `wh-580` | kept: judged from title and description only (`wh-571`'s description says the mosque was "rebuilt many times since the 14th century": unsourced) |
| `wh-584` | a Harari legal manuscript (*Kitab al-Fara'id*), an Ethiopian Arabic book, not West African Ajami; the description calls it Harari without a source |
| `wh-588` | a Tillya Tepe crown: "first-century" is stated as fact, and that these burials are Yuezhi is an inference |
| `wh-581` | Yemrehanna Krestos; one small unsourced phrase in its description |
| `wh-582`, `wh-583`, `wh-585`–`wh-587`, `wh-589`, `wh-590` | kept: judged from title and description only |
| `wh-591` | the Bilge Khagan stele; its description says "the oldest surviving writing in a Turkic language" (unsourced) |
| `wh-592` | Sarkel: one fortress, not the khaganate; the description (a 1930s aerial photograph) is unchecked |
| `wh-594` | a 14th-century drawing of warriors, not the empire |
| `wh-595` | one episode (the taking of Suzdal) with Cyrillic text burned in; the credit string carries stray text |
| `wh-596` | a Catalan Atlas caravan with an inscription burned in; the description is an inference |
| `wh-597` | a Persian miniature of the siege whose credit line ("Sayf al-vâhidî et al.") looks wrong |
| `wh-593`, `wh-598`–`wh-600` | kept: judged from title and description only (`wh-599` shows Timur's tomb) |
| `wh-601`–`wh-622`, `wh-625`–`wh-630` | kept as they stand after B61 – B63: judged from title and description only, not re-viewed (`wh-605` shows a tribute folio, `wh-607` one mask, `wh-608` a children's-training folio, `wh-611` the Gateway of the Sun only, `wh-612` one terrace, `wh-625` a library reading room, `wh-629` the Holy Trinity fresco) |
| `wh-623` | Piazza della Signoria, not the city; its description says "begun about 1299", which no source gives |
| `wh-624` | a posthumous portrait of Lorenzo, one member and not the family; the Palazzo Medici or the Magi chapel would fit |
| `wh-631`–`wh-634`, `wh-636`, `wh-637`, `wh-639`, `wh-641`, `wh-643`, `wh-645`, `wh-646`, `wh-648`, `wh-650` | kept as they stand after B64 – B65: judged from title and description only, not re-viewed (`wh-632` shows the Arnolfini panel only; `wh-648` is a chronicle drawing whose description names a place and month, unchecked) |
| `wh-635` | Cranach's *Law and Grace*, a Lutheran allegory of one doctrine and not the whole movement |
| `wh-638` | a 1630 engraving of the Augsburg Confession, one event and not the Speyer protest; the glossary's Cranach altarpiece fits better |
| `wh-640` | the title page of the 1549 Prayer Book, one milestone of a process |
| `wh-642` | the council chamber fresco is the council, not the whole term; the glossary's 1564 Index title page shows one instrument only |
| `wh-644` | judged a poor fit for the label (the entry notes "replace") |
| `wh-647` | Ter Borch's painting of the separate Dutch – Spanish ratification of 15 May 1648 at Münster |
| `wh-649` | Bacon's frontispiece, one book of the era; the glossary's *Principia* title page is also one book |
| `wh-651`, `wh-653`, `wh-655`–`wh-657`, `wh-660`–`wh-664`, `wh-667`, `wh-670` | kept as they stand after B66 – B67: judged from title and description only, not re-viewed |
| `wh-652` | the *Mysterium* diagram; a portrait would show the man |
| `wh-654` | Bacon's title page, one book and not the method |
| `wh-658` | the agent's note says "replace" (judged from title and description) |
| `wh-659` | the agent's note says "replace later, low priority" |
| `wh-665` | a painting with a caption band painted on it |
| `wh-666` | a panel with a caption |
| `wh-668` | one ruin (Vitcos), not the conquest |
| `wh-669` | one crop only |
| `wh-671`, `wh-672`, `wh-674`, `wh-676`, `wh-677`, `wh-679`–`wh-681`, `wh-683`, `wh-685`, `wh-686`, `wh-689`, `wh-690` | kept as they stand after B68 – B69: judged from title and description only, not re-viewed |
| `wh-673` | captions burned into the picture |
| `wh-675` | Goa only |
| `wh-678` | judged from title and description only |
| `wh-682` | a painting of one fight |
| `wh-684` | a Lorrain seaport, generic |
| `wh-687` | one cavalryman |
| `wh-688` | Bellini's portrait, whose description and alt say "profile" where the National Gallery says the face is turned slightly toward the viewer |
| `wh-691`–`wh-693`, `wh-696`–`wh-698`, `wh-700` | kept as they stand after B70: judged from title and description only (`wh-693` shows the Greek case only; `wh-696` is a wall painting of 1647; `wh-697` and `wh-698` carry unchecked title dates) |
| `wh-694` | the Casteels painting of the relief: its description says "painted within two years" (unverified) and its credit names Gonzales Franciscus Casteels where the file says Pauw |
| `wh-695` | an Ottoman miniature of Chaldiran only, one battle and not the state; title and file name disagree on the date |
| `wh-699` | an engraved 1788 map with its own title panel and place lettering burned in |
| `wh-711` | a handscroll of candidates at a pass-list wall: the examination system, not the dynasty |
| `wh-712` | the giraffe painting shows a tribute animal from Bengal, not the admiral or his fleet |
| `wh-713` | one hall only |
| `wh-715` | a tomb only |
| `wh-714`, `wh-716`–`wh-720` | kept as they stand after B72: judged from title and description only (`wh-719`'s description carries an unverified date) |
| `wh-701`–`wh-706`, `wh-709`, `wh-710` | kept as they stand after B71: judged from title and description only, not re-viewed |
| `wh-707` | a portrait of the founder, not the state |
| `wh-708` | one drill plate |
| `wh-721`, `wh-723`, `wh-725` | kept as they stand after B73: judged from title and description only (`wh-723` is an Edo castle screen) |
| `wh-722` | the Hideyoshi portrait: a person, not the process |
| `wh-724` | a scroll detail of the Dutch factory only, not the whole policy |
| `wh-726` | one fort, not the whole trade |
| `wh-727` | the Brookes plan is an abolitionist picture, not the crossing |
| `wh-728` | the triangle map presents the simplification as the whole |
| `wh-729`, `wh-730` | one part of the estate (a mill yard; a boiling house) |
| `wh-731`, `wh-732`, `wh-734`, `wh-735`, `wh-737`, `wh-739`, `wh-740` | kept as they stand after B74: judged from title and description only (`wh-732` is the title page of the French edict of 1685, one example of a code) |
| `wh-733` | a painting of the rising of 1831, one event, not the whole term |
| `wh-736` | an ivory tusk in a museum case, not a depiction of the company |
| `wh-738` | a period print of the yam custom at Kumasi, a drawing |
| `wh-741`, `wh-742`, `wh-747`, `wh-749`, `wh-750` | kept as they stand after B75: judged from title and description only (`wh-741` is the Wedgwood medallion; the Brookes diagram would show the whole movement better) |
| `wh-743` | a portrait of Wilberforce: a person, not a statute |
| `wh-744` | one custom (Jonkonnu) |
| `wh-745` | a doorway at Gorée: one departure point |
| `wh-746` | an imagined 19th-century salon: one setting |
| `wh-748` | the credit "After Jacques-Antoine Dassier" for the Versailles painting is unverified |
| `wh-751`–`wh-753`, `wh-755`, `wh-756`, `wh-758`, `wh-759` | kept as they stand after B76: judged from title and description only (`wh-753` is a lithograph of the Tea Party, one episode; `wh-755` shows only the Yorktown surrender; `wh-756` is a mural of 1940) |
| `wh-754` | the Trumbull painting is an imagined scene of 1819, not the document |
| `wh-757` | the Tennis Court Oath only |
| `wh-760` | the execution of Robespierre only, not the Terror |
| `wh-761`–`wh-766`, `wh-768`, `wh-770` | kept as they stand after B77: judged from title and description only (`wh-763` shows Austerlitz only) |
| `wh-767` | a generic file also on twenty other cards (the audit's `I.duplicate`); the engraving of the burning plain shows only the rising of 1791 |
| `wh-769` | the painting of Ayacucho shows only the last battle; a campaign map would suit |
| `wh-771`, `wh-772`, `wh-774`–`wh-776`, `wh-779`, `wh-780` | kept as they stand after B78: judged from title and description only (`wh-772` shows Hidalgo at Dolores, the opening scene; `wh-774` is Watts's portrait of Mill, one author of one strand; `wh-775` an engraved portrait of Mazzini; `wh-776` one ironworks) |
| `wh-773` | the Vernet barricade painting shows one Paris street in June 1848 |
| `wh-777` | an engraving of Tull's drill: one tool |
| `wh-778` | a plan of a medieval manor, the open fields before enclosure; the glossary's enclosure-award map would suit |
| `wh-781`–`wh-784`, `wh-786`–`wh-788`, `wh-790` | kept as they stand after B79: judged from title and description only (`wh-783` is a drawing of safety lamps, not a pit; `wh-788` is a generic London view, not an industrial town) |
| `wh-785` | the painting of one opening (Stockton and Darlington) |
| `wh-789` | **no picture** on the card (the audit's `I.none`) |
| `wh-791`, `wh-793`, `wh-794`, `wh-796`–`wh-800` | kept as they stand after B80: judged from title and description only (`wh-794` is the cover of the first edition; `wh-796` shows one open-hearth furnace, not the era) |
| `wh-792` | a 2008 photograph of one county's miners' gala, one union tradition |
| `wh-795` | New Lanark, one early experiment, not the concept |
| `wh-805` | a Lenbach painting of Bismarck in uniform, where photographs exist |
| `wh-806` | one episode (Napoleon III and Bismarck after Sedan), not the war |
| `wh-810` | an idealised genre painting of a peasant woman, not bondage, dues or sale |
| `wh-811`–`wh-820` | no picture on the old cards (audit `I.none`); a picture pass would add one each |
| `wh-821`–`wh-830` | no picture on the old cards (audit `I.none`); a picture pass would add one each |
| `wh-831`–`wh-840` | no picture on the old cards (audit `I.none`); a picture pass would add one each |
