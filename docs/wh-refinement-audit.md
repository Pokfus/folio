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
| B1 | Human origins (`wh-evolution`) | `wh-001`–`wh-010` | 10 | 96 | open |
| B2 | Human origins (`wh-evolution`) | `wh-011`–`wh-020` | 10 | 100 | open |
| B3 | Human origins (`wh-evolution`) | `wh-021`–`wh-030` | 10 | 104 | open |
| B4 | Human origins (`wh-evolution`) | `wh-031`–`wh-040` | 10 | 101 | open |
| B5 | Human origins (`wh-evolution`) / The Palaeolithic (`wh-paleolithic`) | `wh-041`–`wh-050` | 10 | 90 | open |
| B6 | The Palaeolithic (`wh-paleolithic`) | `wh-051`–`wh-060` | 10 | 96 | open |
| B7 | The Palaeolithic (`wh-paleolithic`) | `wh-061`–`wh-070` | 10 | 97 | open |
| B8 | The Palaeolithic (`wh-paleolithic`) | `wh-071`–`wh-080` | 10 | 98 | open |
| B9 | The Palaeolithic (`wh-paleolithic`) / Peopling the planet (`wh-peopling`) | `wh-081`–`wh-090` | 10 | 94 | open |
| B10 | Peopling the planet (`wh-peopling`) | `wh-091`–`wh-100` | 10 | 101 | open |
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
