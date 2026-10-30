# The Ancient Rome refinement audit (Oct 2026)

The Ancient Rome collection (`col-40`, `rm-001`–`rm-1000`, plan in `docs/rome-card-plan.md`) is complete, and
was written quickly in bulk. This is the pass that audits and refines ALL of it, in batches of ten in plan
order, to one set of rules — so expect unsourced claims, wrong dates, shaky citations and, Rome's own fault,
Livy retold as fact; and record each one found.

**The model is the Ancient Greece audit, `docs/greece-refinement-audit.md`, and its settled rules apply here
unchanged** — read its "The rules" section; they are not restated. The World History audit
(`docs/wh-refinement-audit.md`) supplied the harness and its lessons. What is mechanical is measured by
`node .claude/rm-audit.js` (report-only; `--range=rm-001:rm-010`, `--card=`, `--summary`, `--worst`), which
is `greece-audit.js` run with a Rome config; what only a reader can judge is read by eye and recorded in the
ledger at the foot of this file, batch by batch.

## The rules

### The Greece rules, as applied here

- **Questions**: 3 phrasings, one sentence each, 20–34 words, blank mid-sentence; **no year, century,
  millennium, decade or AUC year**. Siblings are told apart by who, where and what. No modern scholar named
  (the plan spends none of its two slots), except on a card whose subject IS that person.
- **Background**: 10 sentences, 5 + 5, **270–285 words** (the top of the 270–330 bar, where the mean of
  28.5 words a sentence holds); written for a 15-year-old new to the topic; complete against the term's own
  Wikipedia article as a checklist (never cited); at most 2 sentences on modern discovery and 3 on debate.
- **Sources**: the tiered bar by difficulty (1 → 9, 2 → 8, 3 → 7, 4 → 6, 5 → 5); a modern author in at most
  2 sources; an ancient author in at most 2 (3 where the card is about that author or work); at least half
  modern scholarship; at most one source per non-English language, each with its chip; every URL curled;
  every key quote read on the page fetched; every source pointed at by a marker.
- **Think it through**: exactly 3 FAQs, written apart from the background (4-gram overlap aims under 25%,
  a fault at 50%), each answer 12–60 words with explicit numbered markers into the card's own list.
- **Date line**: ≤ 4 rows, labels ≤ 16 characters, era on every year under 1000, `c.` in front of a range,
  start and end as completely as the sources allow; agrees with `docs/rome-chronology.md` and its pins.
- **Picture**: depicts the whole term; PD, CC0, CC BY or CC BY-SA; a credit naming author and licence; a
  description that names no source, licence or file; on no other card.
- **Locator**: through `add-locators.js`, never typed; a place, site, city, building, battle or state with
  somewhere to stand gets one.
- **Glossary**: each card's answer term has an entry, and the entry and the card agree (date, figures,
  claims). An entry is corrected in the same commit as its card.

### What Rome adds

- **Livy and the regal period are tradition, not fact.** Rome wrote its own early history centuries after
  the events, and the accounts that survive — Livy, Dionysius of Halicarnassus, Plutarch — are late, literary
  and moralising. Seven kings, Romulus's asylum, Lucretia, Horatius at the bridge, Cincinnatus at the plough
  and Coriolanus at the gates are reported as what the Romans told, in the sources' own voice ("Livy says",
  "the tradition held"), never in the card's. What the archaeology of early Rome shows (the Palatine huts,
  the Forum's first paving, the Capitoline temple's platform) is stated separately and is not used to prove
  the story. The plan's own rule on commemoration (`docs/rome-card-plan.md`, "History, not archaeology — and
  the two other pulls") is this rule's reason.
- **A legendary date is labelled as one.** 753 BCE for the founding, 509 BCE for the first consuls, the
  regal reigns and the early-Republic years are an ancient reckoning (Varro's, in the form the collection
  uses), not a record. The date line's label says `Traditional`; the prose says whose reckoning it is. A
  date line that reads "after 753 BCE" dates nothing and is cut (`docs/rome-chronology.md`, "Conventions").
- **Inscriptions and coins are evidence, and are cited as such.** The Fasti, the Lapis Satricanus, the
  Twelve Tables' fragments, the *Res Gestae*, a military diploma or a denarius are contemporary documents
  where the narrative histories are not, and a claim resting on one names it. Cite the corpus or the
  holding museum's record that a reader can open (EDCS, EDH, the Ubi Erat Lupa or a museum page), never a
  dealer's listing.
- **The three faults to hunt first**, the World History audit's, plus Rome's fourth:
  1. a **modern scholar's idea presented as ancient fact** (the "Servian" reforms as one man's act, the
     "Marian reforms" as a programme, the "Pax Romana" as a peace);
  2. a **date that belongs to a different event** (a temple's dedication for its vowing, a law's proposal
     for its passage, a province's conquest for its organisation);
  3. **a figure no source gives** (army sizes, casualty counts and populations especially — the ancient
     figures are reported as ancient figures, with whose they are);
  4. **legend told as history** — Romulus, the kings and the early-Republic heroes (above).
- **For a subject a `gr-` or `wh-` card also covers** (`docs/rome-card-plan.md`, "Living beside the other
  collections"), read that card and note any disagreement in the ledger; never edit it from this audit.

## Working a card

Per card, in this order: questions → date line → background → sources → Think it through → image →
locator → glossary. Write with `node .claude/add-card.js <patch.json> --replace --no-image`, then a second
`--replace` for the picture; locators with `node .claude/add-locators.js`.

After each batch: `rm-audit.js --range=`, `check-questions.js`, `check-style.js`, `check-cards.js
--prefix=rm-`, `check-docs.js`, `split-cards.js --check` and `test-card-plans.js`; then the ledger entry,
chronology rows and pins, pictures to redo, glossary candidates and one changelog line ("N Ancient Rome
cards are rewritten", count and collection only) with a version bump, all in one commit.

## The tools (Batch 0)

| tool | what it does |
|---|---|
| `.claude/rm-audit.js` | report-only per-card check of every mechanical rule — `greece-audit.js` under a Rome config, as `wh-audit.js` is: AUC years in questions (`Q.date`), state locators (`L.missing`), and the card–glossary pairing (`G.none`, `G.date`). World History's deep-time question check is not carried |
| `.claude/wh-refine/` | the World History harness, now for any prefix: `REFINE_PREFIX=rm-` (default `wh-`) picks the cards and the audit script (`<prefix>audit.js`, or `REFINE_AUDIT=`), read through `cfg.js`. The `wh-` run is unchanged (`prep.js 301 302` output byte-identical before and after) |
| `docs/rome-chronology.md` | the conventions (AUC against BCE, consular and Varronian years, legendary dates, regnal dates, BCE/CE only) and the dates the collection commits to, with the `chronology-pins` block `rm-audit.js` checks |

**The baseline, measured before any batch** (`node .claude/rm-audit.js --summary`, 2026-10-04):

```
rm-audit: 1000 card(s), 0 with no finding
  B.sentence-length 904 card(s)
  D.c-in-range      3 card(s)
  D.era             45 card(s)
  D.label           18 card(s)
  D.not-a-date      249 card(s)
  D.not-in-prose    312 card(s)
  G.date            18 card(s)
  G.none            5 card(s)
  I.caption-source  4 card(s)
  I.duplicate       21 card(s)
  I.none            514 card(s)
  L.missing         57 card(s)
  Q.date            564 card(s)
  Q.sibling         113 card(s)
  S.ancient-cap     315 card(s)
  S.bar             329 card(s)
  S.chip?           98 card(s)
  S.lang-cap        52 card(s)
  S.modern-half     615 card(s)
  W.no-marker       1000 card(s)
  W.not-why         2 card(s)
  W.overlap         480 card(s)
  W.overlap-high    583 card(s)
```

As in Greece and World History, three of these are the rules arriving rather than faults found:
`W.no-marker` (no answer was marked before the rule), `S.bar` (the bar rose from a flat 5) and
`B.sentence-length` (the house register ran ~30 words a sentence). The large real findings are `Q.date`
(564 cards carry a date in a question), `S.modern-half` (615 cards rest mostly on ancient authors — Livy is
named 671 times in the collection's text) and `S.ancient-cap` (315), which between them are the
"Livy as fact" fault measured; `I.none` (514 cards without a picture) is the largest gap. `D.not-a-date`
(249) is mostly the regal cards' "after 753 BCE" rows and counts ("12 lictors") put on the date line.
`I.duplicate` (21) and `S.lang-cap` (52) are worth a collection-wide sweep of their own.

## The batches

Ten cards each, in plan order. "Findings" is the baseline count from `rm-audit.js --worst` (findings summed
over the ten cards), the measure for picking the worst batches first; batches are nonetheless done in plan
order unless the user says otherwise.

| batch | deck | cards | n | findings | state |
|---|---|---|---|---|---|
| B1 | Italy before Rome (`rm-italy`) | `rm-001`–`rm-010` | 10 | 94 | **done 2026-10-04** |
| B2 | Italy before Rome (`rm-italy`) | `rm-011`–`rm-020` | 10 | 100 | **done 2026-10-04** |
| B3 | Italy before Rome (`rm-italy`) | `rm-021`–`rm-030` | 10 | 95 | **done 2026-10-04** |
| B4 | Italy before Rome (`rm-italy`) | `rm-031`–`rm-040` | 10 | 104 | **done 2026-10-04** |
| B5 | Italy before Rome (`rm-italy`) / Rome under the kings (`rm-kings`) | `rm-041`–`rm-050` | 10 | 112 | **done 2026-10-04** |
| B6 | Rome under the kings (`rm-kings`) | `rm-051`–`rm-060` | 10 | 118 | **done 2026-10-04** |
| B7 | Rome under the kings (`rm-kings`) | `rm-061`–`rm-070` | 10 | 132 | **done 2026-10-04** |
| B8 | Rome under the kings (`rm-kings`) | `rm-071`–`rm-080` | 10 | 123 | **done 2026-10-04** |
| B9 | Rome under the kings (`rm-kings`) | `rm-081`–`rm-090` | 10 | 125 | **done 2026-10-04** |
| B10 | The early Republic (`rm-early-republic`) | `rm-091`–`rm-100` | 10 | 126 | **done 2026-10-04** |
| B11 | The early Republic (`rm-early-republic`) | `rm-101`–`rm-110` | 10 | 126 | **done 2026-10-15** |
| B12 | The early Republic (`rm-early-republic`) | `rm-111`–`rm-120` | 10 | 121 | **done 2026-10-15** |
| B13 | The early Republic (`rm-early-republic`) | `rm-121`–`rm-130` | 10 | 121 | **done 2026-10-15** |
| B14 | The early Republic (`rm-early-republic`) | `rm-131`–`rm-140` | 10 | 104 | **done 2026-10-15** |
| B15 | The conquest of Italy (`rm-conquest-italy`) | `rm-141`–`rm-150` | 10 | 109 | **done 2026-10-15** |
| B16 | The conquest of Italy (`rm-conquest-italy`) | `rm-151`–`rm-160` | 10 | 119 | **done 2026-10-15** |
| B17 | The conquest of Italy (`rm-conquest-italy`) | `rm-161`–`rm-170` | 10 | 110 | **done 2026-10-15** |
| B18 | The conquest of Italy (`rm-conquest-italy`) | `rm-171`–`rm-180` | 10 | 104 | **done 2026-10-15** |
| B19 | The Punic Wars (`rm-punic-wars`) | `rm-181`–`rm-190` | 10 | 129 | **done 2026-10-15** |
| B20 | The Punic Wars (`rm-punic-wars`) | `rm-191`–`rm-200` | 10 | 127 | **done 2026-10-15** |
| B21 | The Punic Wars (`rm-punic-wars`) | `rm-201`–`rm-210` | 10 | 128 | **done 2026-10-22** |
| B22 | The Punic Wars (`rm-punic-wars`) | `rm-211`–`rm-220` | 10 | 115 | **done 2026-10-22** |
| B23 | The Punic Wars (`rm-punic-wars`) | `rm-221`–`rm-230` | 10 | 113 | **done 2026-10-22** |
| B24 | The Punic Wars (`rm-punic-wars`) / Rome and the Mediterranean (`rm-mediterranean`) | `rm-231`–`rm-240` | 10 | 120 | **done 2026-10-22** |
| B25 | Rome and the Mediterranean (`rm-mediterranean`) | `rm-241`–`rm-250` | 10 | 123 | **done 2026-10-22** |
| B26 | Rome and the Mediterranean (`rm-mediterranean`) | `rm-251`–`rm-260` | 10 | 118 | **done 2026-10-22** |
| B27 | Rome and the Mediterranean (`rm-mediterranean`) | `rm-261`–`rm-270` | 10 | 122 | **done 2026-10-23** |
| B28 | Rome and the Mediterranean (`rm-mediterranean`) / The Republic in crisis (`rm-crisis`) | `rm-271`–`rm-280` | 10 | 135 | **done 2026-10-23** |
| B29 | The Republic in crisis (`rm-crisis`) | `rm-281`–`rm-290` | 10 | 115 | **done 2026-10-23** |
| B30 | The Republic in crisis (`rm-crisis`) | `rm-291`–`rm-300` | 10 | 143 | **done 2026-10-23** |
| B31 | The Republic in crisis (`rm-crisis`) | `rm-301`–`rm-310` | 10 | 85 | **done 2026-10-29** |
| B32 | The Republic in crisis (`rm-crisis`) | `rm-311`–`rm-320` | 10 | 96 | **done 2026-10-29** |
| B33 | The fall of the Republic (`rm-fall-republic`) | `rm-321`–`rm-330` | 10 | 83 | **done 2026-10-29** |
| B34 | The fall of the Republic (`rm-fall-republic`) | `rm-331`–`rm-340` | 10 | 95 | **done 2026-10-29** |
| B35 | The fall of the Republic (`rm-fall-republic`) | `rm-341`–`rm-350` | 10 | 95 | **done 2026-10-29** |
| B36 | The fall of the Republic (`rm-fall-republic`) | `rm-351`–`rm-360` | 10 | 84 | **done 2026-10-29** |
| B37 | The fall of the Republic (`rm-fall-republic`) | `rm-361`–`rm-370` | 10 | 76 | **done 2026-10-29** |
| B38 | Augustus (`rm-augustus`) | `rm-371`–`rm-380` | 10 | 84 | **done 2026-10-30** |
| B39 | Augustus (`rm-augustus`) | `rm-381`–`rm-390` | 10 | 91 | **done 2026-10-30** |
| B40 | Augustus (`rm-augustus`) | `rm-391`–`rm-400` | 10 | 91 | **done 2026-10-30** |
| B41 | Augustus (`rm-augustus`) | `rm-401`–`rm-410` | 10 | 61 | **done 2026-10-30** |
| B42 | Augustus (`rm-augustus`) / The Julio-Claudians (`rm-julio-claudians`) | `rm-411`–`rm-420` | 10 | 79 | **done 2026-10-30** |
| B43 | The Julio-Claudians (`rm-julio-claudians`) | `rm-421`–`rm-430` | 10 | 72 | **done 2026-10-30** |
| B44 | The Julio-Claudians (`rm-julio-claudians`) | `rm-431`–`rm-440` | 10 | 73 | open |
| B45 | The Julio-Claudians (`rm-julio-claudians`) | `rm-441`–`rm-450` | 10 | 76 | open |
| B46 | The Julio-Claudians (`rm-julio-claudians`) / Civil war and the Flavians (`rm-flavians`) | `rm-451`–`rm-460` | 10 | 70 | open |
| B47 | Civil war and the Flavians (`rm-flavians`) | `rm-461`–`rm-470` | 10 | 80 | open |
| B48 | Civil war and the Flavians (`rm-flavians`) | `rm-471`–`rm-480` | 10 | 70 | open |
| B49 | Civil war and the Flavians (`rm-flavians`) | `rm-481`–`rm-490` | 10 | 65 | open |
| B50 | The high empire (`rm-high-empire`) | `rm-491`–`rm-500` | 10 | 78 | open |
| B51 | The high empire (`rm-high-empire`) | `rm-501`–`rm-510` | 10 | 81 | open |
| B52 | The high empire (`rm-high-empire`) | `rm-511`–`rm-520` | 10 | 80 | open |
| B53 | The high empire (`rm-high-empire`) | `rm-521`–`rm-530` | 10 | 93 | open |
| B54 | The high empire (`rm-high-empire`) / The Severans and the third-century crisis (`rm-third-century`) | `rm-531`–`rm-540` | 10 | 78 | open |
| B55 | The Severans and the third-century crisis (`rm-third-century`) | `rm-541`–`rm-550` | 10 | 94 | open |
| B56 | The Severans and the third-century crisis (`rm-third-century`) | `rm-551`–`rm-560` | 10 | 95 | open |
| B57 | The Severans and the third-century crisis (`rm-third-century`) / Diocletian and Constantine (`rm-dominate`) | `rm-561`–`rm-570` | 10 | 94 | open |
| B58 | Diocletian and Constantine (`rm-dominate`) | `rm-571`–`rm-580` | 10 | 77 | open |
| B59 | Diocletian and Constantine (`rm-dominate`) | `rm-581`–`rm-590` | 10 | 89 | open |
| B60 | Diocletian and Constantine (`rm-dominate`) / The Christian empire (`rm-christian-empire`) | `rm-591`–`rm-600` | 10 | 93 | open |
| B61 | The Christian empire (`rm-christian-empire`) | `rm-601`–`rm-610` | 10 | 97 | open |
| B62 | The Christian empire (`rm-christian-empire`) | `rm-611`–`rm-620` | 10 | 93 | open |
| B63 | The end of the western empire (`rm-fall-west`) | `rm-621`–`rm-630` | 10 | 92 | open |
| B64 | The end of the western empire (`rm-fall-west`) | `rm-631`–`rm-640` | 10 | 90 | open |
| B65 | The Roman army (`rm-army`) | `rm-641`–`rm-650` | 10 | 93 | open |
| B66 | The Roman army (`rm-army`) | `rm-651`–`rm-660` | 10 | 90 | open |
| B67 | The Roman army (`rm-army`) | `rm-661`–`rm-670` | 10 | 78 | open |
| B68 | The Roman army (`rm-army`) | `rm-671`–`rm-680` | 10 | 87 | open |
| B69 | The Roman army (`rm-army`) | `rm-681`–`rm-690` | 10 | 105 | open |
| B70 | The Roman army (`rm-army`) / Government, law and citizenship (`rm-government`) | `rm-691`–`rm-700` | 10 | 98 | open |
| B71 | Government, law and citizenship (`rm-government`) | `rm-701`–`rm-710` | 10 | 88 | open |
| B72 | Government, law and citizenship (`rm-government`) | `rm-711`–`rm-720` | 10 | 79 | open |
| B73 | Government, law and citizenship (`rm-government`) | `rm-721`–`rm-730` | 10 | 81 | open |
| B74 | Government, law and citizenship (`rm-government`) | `rm-731`–`rm-740` | 10 | 80 | open |
| B75 | Government, law and citizenship (`rm-government`) | `rm-741`–`rm-750` | 10 | 86 | open |
| B76 | Provinces and frontiers (`rm-provinces`) | `rm-751`–`rm-760` | 10 | 80 | open |
| B77 | Provinces and frontiers (`rm-provinces`) | `rm-761`–`rm-770` | 10 | 92 | open |
| B78 | Provinces and frontiers (`rm-provinces`) | `rm-771`–`rm-780` | 10 | 78 | open |
| B79 | Provinces and frontiers (`rm-provinces`) / Family, household and slavery (`rm-society`) | `rm-781`–`rm-790` | 10 | 74 | open |
| B80 | Family, household and slavery (`rm-society`) | `rm-791`–`rm-800` | 10 | 71 | open |
| B81 | Family, household and slavery (`rm-society`) | `rm-801`–`rm-810` | 10 | 70 | open |
| B82 | Family, household and slavery (`rm-society`) | `rm-811`–`rm-820` | 10 | 82 | open |
| B83 | Family, household and slavery (`rm-society`) / The Roman city and daily life (`rm-daily-life`) | `rm-821`–`rm-830` | 10 | 96 | open |
| B84 | The Roman city and daily life (`rm-daily-life`) | `rm-831`–`rm-840` | 10 | 72 | open |
| B85 | The Roman city and daily life (`rm-daily-life`) | `rm-841`–`rm-850` | 10 | 84 | open |
| B86 | The Roman city and daily life (`rm-daily-life`) | `rm-851`–`rm-860` | 10 | 72 | open |
| B87 | The Roman city and daily life (`rm-daily-life`) / Spectacle and leisure (`rm-spectacle`) | `rm-861`–`rm-870` | 10 | 73 | open |
| B88 | Spectacle and leisure (`rm-spectacle`) | `rm-871`–`rm-880` | 10 | 77 | open |
| B89 | Spectacle and leisure (`rm-spectacle`) | `rm-881`–`rm-890` | 10 | 83 | open |
| B90 | Roman religion and myth (`rm-religion`) | `rm-891`–`rm-900` | 10 | 80 | open |
| B91 | Roman religion and myth (`rm-religion`) | `rm-901`–`rm-910` | 10 | 72 | open |
| B92 | Roman religion and myth (`rm-religion`) | `rm-911`–`rm-920` | 10 | 82 | open |
| B93 | Roman religion and myth (`rm-religion`) | `rm-921`–`rm-930` | 10 | 83 | open |
| B94 | Latin literature and thought (`rm-literature`) | `rm-931`–`rm-940` | 10 | 78 | open |
| B95 | Latin literature and thought (`rm-literature`) | `rm-941`–`rm-950` | 10 | 64 | open |
| B96 | Latin literature and thought (`rm-literature`) | `rm-951`–`rm-960` | 10 | 83 | open |
| B97 | Latin literature and thought (`rm-literature`) | `rm-961`–`rm-970` | 10 | 67 | open |
| B98 | Art, architecture and engineering (`rm-arts`) | `rm-971`–`rm-980` | 10 | 86 | open |
| B99 | Art, architecture and engineering (`rm-arts`) | `rm-981`–`rm-990` | 10 | 71 | open |
| B100 | Art, architecture and engineering (`rm-arts`) | `rm-991`–`rm-1000` | 10 | 76 | open |

## Running a batch (the harness, `.claude/wh-refine/`)

The World History harness, run with `REFINE_PREFIX=rm-`. It keeps its working files in a scratch directory
**outside the repo** (`WH_S`).

1. `REFINE_PREFIX=rm- WH_S=/path/to/scratch node .claude/wh-refine/prep.js 1 10` writes `cur/<id>.json` (the
   card and its glossary entry as they stand), `index.tsv` (every `rm-` card's answer and question, for
   sibling checks) and empty `out/` and `pages/`.
2. Copy `.claude/wh-refine/ADDENDUM-rm.md` (the Rome addendum as it stood after B10, with the lessons of the first
   hundred) to `$WH_S/ADDENDUM.md` and add to it as lessons arrive. It is what this collection adds to `.claude/wh-refine/BRIEF.md`
   (which was written for World History — the addendum overrides it where they differ): the Rome rules
   above, the `rm-` prefix and env var, the hosts that answer and the ones that do not, and "for a subject
   a `gr-` or `wh-` card also covers, read it and note disagreements; never edit it".
3. One research agent per **two** cards, five agents a batch (never more than ten at once), each told to
   read `BRIEF.md` and then `ADDENDUM.md` and to follow both exactly. An agent saves every cited page to
   `pages/<id>-s<N>.txt`, writes `out/<id>.json` and runs `REFINE_PREFIX=rm- WH_S=… node
   .claude/wh-refine/precheck.js <id>` until it says OK.
4. **Read every draft yourself before applying** (questions, date line, the change notes), and check the
   glossary draft's markers and slug (grep `glossary.js` for the slug; `add-glossary.js` overwrites in
   silence).
5. `REFINE_PREFIX=rm- WH_S=… .claude/wh-refine/batch.sh 1 10` curls every citation URL, applies the ten
   drafts, and runs the audit, `check-questions`, `check-cards` and `check-citations`. Then the ledger,
   chronology rows and pins (only figures on the date line), pictures to redo, changelog and version,
   `check-docs`, `split-cards --check`, `test-card-plans`, `check-style`; commit and push.

**Known from the World History run and this one's start.** Wikimedia has refused the sandbox for days: run
the Commons test call once a session and skip pictures on a 429 (they go to "Pictures to redo"). PMC serves
a CAPTCHA (use Europe PMC full text). UCL, the Met's essays, the British Museum, OpenEdition and Persée do
not answer; Livius.org, Perseus, LacusCurtius, archive.org and Europe PMC do.

## Pictures to redo

Cards whose picture was not re-checked because Wikimedia refused the sandbox, or whose current picture a
batch judged wrong. One line per card; a pictures pass works through it.

| card | the current picture | what is wrong, or "not re-checked" |
|---|---|---|
| `rm-001` Ancient Italy | a hut-shaped cinerary urn | one object stands for the peninsula (and fits `rm-008` better); the credit names no author |
| `rm-002` Apennines | Monte Pollino | one peak for a 1,200 km chain; desc and alt are the Italian Commons caption; the glossary copy's desc names its licence |
| `rm-003` Tiber | a painting by van Lint | a painting where a photograph would do; desc and alt repeat the file title |
| `rm-004` Latium | the Alban Hills | `rm-005`'s subject standing for the region; the glossary copy is a labelled map |
| `rm-005` Alban Hills | a painting by Gurlitt | a painting where a photograph would do; desc and alt are the file name |
| `rm-006` Bronze Age Italy | a nuraghe and its village | acceptable (CC0); one region stands for the whole peninsula |
| `rm-007` Terramare culture | an 1877 excavation photograph | shows a dig, not the culture; desc in Italian and names its source; alt is the file name |
| `rm-008` Villanovan culture | a horse bit | one object for a culture; desc is a museum catalogue entry; a biconical urn with its bowl lid would show it |
| `rm-009` Italic peoples | a labelled atlas map of Samnium | a map with burned-in labels, of one region only |
| `rm-010` Latins | none | no picture (`I.none`) |
| `rm-011` Latin League | a map of Latium | burned-in French labels |
| `rm-012` Sabines | a 1781 painting | the legend of the Sabine women, not the people |
| `rm-013` Samnites | a cuirass at the Getty Villa | one object for a people; the caption names the museum and a website |
| `rm-014` Oscan | an inscribed stele | acceptable subject; the caption names the British Museum and garbles a date; the alt is the file name |
| `rm-015` Umbrians | a chart of votive-figurine types | a labelled diagram, not the people |
| `rm-016` Iguvine Tables | the tablets | acceptable (CC BY); desc and alt are thin |
| `rm-017` Volsci | a modern history painting | a painting of an imagined battle; the desc names the painter |
| `rm-018` Ligurians | a map of pre-Roman Iberia | the wrong country; burned-in labels; no author in the credit |
| `rm-019` Veneti | a writing tablet from Este | acceptable subject, though one object stands for a people; the desc and alt want rewriting |
| `rm-020` Messapians | a reference map of southern Italy | a map with burned-in labels, not specific to the Messapians |
| `rm-021` Cisalpine Gauls | a 1911 atlas map | burned-in labels; Italian desc names the atlas |
| `rm-022` Etruscan civilisation | a bronze chariot | weak: one object for a civilisation |
| `rm-023` Etruscan origins | a drawing of an Orvieto inscription | a drawing of one text; the Lemnos stele or a genome figure would fit better |
| `rm-024` Etruscan cities | a map of Etruria | a labelled map; a plateau city (Orvieto, Civita) would show it |
| `rm-025` Etruscan league | none | no picture (`I.none`); the Campo della Fiera excavations would show it |
| `rm-026` Etruscan language | the Orator statue | shows a statue, not the language; alt is the file name |
| `rm-027` Pyrgi Tablets | sheet A alone | one of the three sheets; the desc names the museum |
| `rm-028` Etruscan religion | votive heads | acceptable; the desc "IV-II cen BC" wants rewording |
| `rm-029` haruspicy | a 19th-century line diagram of the Piacenza liver | a diagram where a photograph of the bronze exists |
| `rm-030` Etrusca disciplina | a mirror of Menrva | does not show the discipline; the desc names the museum |
| `rm-031` Etruscan tomb painting | the Tomb of the Augurs | acceptable subject; the desc is a bare Italian label and the alt the file name |
| `rm-032` Tarquinia | a painting in the Tomb of the Leopards | one painting for the city; the desc names the photographer |
| `rm-033` Caere | a Caeretan hydria in the Louvre | one vase for the city |
| `rm-034` Banditaccia necropolis | a sarcophagus relief | one object from one tomb; the desc names the museum. Also a false `I.duplicate` (below) |
| `rm-035` Veii | an 1848 map drawing | burned-in labels; a view of the plateau would show it |
| `rm-036` Vulci | a gold fibula | one object for the city |
| `rm-037` Etruscan bronzework | a cista handle | one handle for the craft; the desc is Commons boilerplate ("public domain", `I.caption-source`) |
| `rm-038` bucchero | a kantharos from Osteria dell'Osa | from a Latin cemetery; alt is the file name; no photographer in the credit |
| `rm-039` Apollo of Veii | the statue | acceptable |
| `rm-040` Etruscan Campania | a Corinthian-style cup | one cup for a region. Also a false `I.duplicate` (below) |
| `rm-041` Etruscan sea power | a ship in the Tomb of the Ship | acceptable |
| `rm-042` Battle of Alalia | a 1915 imagined illustration | an imagined scene; replace if a free photograph of the Velia helmets exists |
| `rm-043` Magna Graecia | the Temple of Hera at Paestum | acceptable |
| `rm-044` Cumae | the approach to the Sibyl's cave | acceptable; the glossary's 1769 painting has a faulty credit |
| `rm-045` Etruscan influence on Rome | a relief of three lictors | also on `wh-339` (`I.duplicate`) |
| `rm-046` Roman Kingdom | a stretch of the Servian Wall | `rm-072`'s subject |
| `rm-047` Forum Boarium | an 1859 watercolour | a painting where a photograph of the temples would do |
| `rm-048` Seven Hills of Rome | none | no picture (`I.none`) |
| `rm-049` Palatine Hill | the hill from the Circus Maximus | acceptable; the glossary copy's credit was moved out of its desc in this batch |
| `rm-050` Capitoline Hill | an 1850 engraving of the Tarpeian Rock | one cliff for the hill; the desc names its source; the glossary copy likewise |
| `rm-051` casa Romuli | a model of the Palatine huts | acceptable; the glossary copy's credit is malformed |
| `rm-052` founding of Rome | a relief of the founding furrow | shows the furrow at Aquileia, not Rome; the glossary's is a labelled 1902 plan |
| `rm-053` Romulus and Remus | a terracotta relief of Faustulus | acceptable subject; the desc names the museum and photographer. Also a false `I.duplicate` |
| `rm-054` Capitoline Wolf | the statue | acceptable; the glossary's is a coin, not the statue |
| `rm-055` Aeneas | an Ara Pacis panel | who it shows is disputed (Aeneas or Numa) |
| `rm-056` Alba Longa | Lake Albano | acceptable |
| `rm-057` ab urbe condita | a detail of the Fasti | acceptable; the desc ends with the photographer's name |
| `rm-058` rape of the Sabine women | the Basilica Aemilia frieze | acceptable; the credit is not in house form |
| `rm-059` Titus Tatius | a denarius of Titurius Sabinus | acceptable |
| `rm-060` Romulus | a painting by Ingres | acceptable |
| `rm-061` Numa Pompilius | a denarius of Pomponius Molo | acceptable; its title carries an unsourced "97 BCE" |
| `rm-062` calendar of Numa | a reconstruction drawing of the Antium calendar | a lettered drawing where a photograph of the fragments exists |
| `rm-063` Tullus Hostilius | a painting by Lo Scheggia | shows Alba's fall rather than the king; credit not in house form |
| `rm-064` Horatii and Curiatii | a fresco by Cesari | acceptable; credit not in house form |
| `rm-065` Ancus Marcius | a denarius of Marcius Censorinus | acceptable |
| `rm-066` Tarquinius Priscus | a painting by Ricci | acceptable; desc names the Getty and the credit a museum number |
| `rm-067` Cloaca Maxima | a 19th-century photograph of the mouth | acceptable |
| `rm-068` Circus Maximus | Platner's printed plan | a plan where a photograph of the valley would do |
| `rm-069` Servius Tullius | a painting by Kauffmann | acceptable; trim the source detail from its desc |
| `rm-070` Servian constitution | a stretch of the Servian Wall | `rm-072`'s subject |
| `rm-071` comitia centuriata | a denarius | also on `wh-343` (`I.duplicate`); the card's own glossary coin would serve |
| `rm-072` Servian Wall | a stretch on the Esquiline | acceptable; the desc quotes Dionysius |
| `rm-073` Roman census | the census frieze of the "Altar of Domitius Ahenobarbus" | acceptable; soften the disputed "late 2nd century BCE" in its desc |
| `rm-074` Tarquinius Superbus | a painting by Alma-Tadema | the desc names Livy 1.54 |
| `rm-075` Temple of Jupiter Optimus Maximus | a relief of a sacrifice before the temple | acceptable; the desc names the museum; a photograph of the foundations would suit better |
| `rm-076` Sibylline Books | a painting by Abildgaard | acceptable; the desc names the museum |
| `rm-077` Lucretia | a panel by Botticelli | acceptable; the desc names the painter |
| `rm-078` expulsion of the kings | a painting by Gavin Hamilton | acceptable; the desc names the painter |
| `rm-079` Lucius Junius Brutus | the Capitoline bronze head | called Brutus only by convention; the 54 BCE denarius would be safer |
| `rm-080` rex sacrorum | a bucchero sherd with REX | doubtful: the graffito may name a king, not the priest |
| `rm-081` comitia curiata | a 19th-century drawing of a Trajanic relief | a drawing of a later relief |
| `rm-082` patres | a bust of an unknown citizen | generic |
| `rm-083` patricians | an Ara Pacis procession fragment | acceptable; no Commons URL in the credit. Also a false `I.duplicate` |
| `rm-084` plebeians | a wash drawing by Vernet | fits only the dropped settlement story |
| `rm-085` gens | the Scipio Barbatus sarcophagus | the desc names the museum and misdescribes which name is painted; the sarcophagus would suit `rm-086` better |
| `rm-086` cognomen | a soldier's tombstone | acceptable. Also a false `I.duplicate` |
| `rm-087` pomerium | a Claudian boundary stone | acceptable; no Commons URL; the desc names the museum; the glossary's is a coin drawing |
| `rm-088` Forum Romanum | the Forum from above | acceptable; no Commons URL; the glossary's is a labelled 1828 plan |
| `rm-089` Lapis Niger | a 19th-century engraving | photographs of the site exist |
| `rm-090` annales maximi | a 1493 printed Livy | shows nothing of the record |
| `rm-091` Roman Republic | an anonymous denarius | acceptable; no Commons URL in the credit |
| `rm-092` consul | a denarius of 54 BCE | acceptable; no Commons URL in the credit |
| `rm-093` Fasti Consulares | the fragments in the Capitoline wall | acceptable; its title should be the term, and the credit lacks the Commons URL |
| `rm-094` imperium | a Sulla denarius | one coin for a concept, and also on `wh-351` (`I.duplicate`) |
| `rm-095` fasces | a relief from Auximum | acceptable; no Commons URL in the credit |
| `rm-096` collegiality | a curule chair on a funerary relief | stands for magistracy, not collegiality; the desc names the museum |
| `rm-097` Horatius Cocles | a painting by Le Brun | acceptable, labelled an imagining |
| `rm-098` Lars Porsena | a Rubens-workshop Mucius Scaevola | shows Mucius rather than Porsena |
| `rm-099` Battle of Lake Regillus | a fresco by Laureti | shows the room's plaques and statues too |
| `rm-100` Foedus Cassianum | the Temple of Castor's columns | `rm-099`/`rm-894`'s subject, not the treaty |
| `rm-101` Conflict of the Orders | a wood engraving of the first secession | shows one episode (`rm-102`'s), not the whole struggle |
| `rm-102` first secession | a river photograph | weak; the description argues and gives a derived figure; the audit's `I.caption-source` hit is the word "commons" |
| `rm-103` tribune of the plebs | a Renaissance costume plate | burned-in text; the description names its source |
| `rm-104` sacrosanctity | none | no picture (`I.none`) |
| `rm-105` concilium plebis | none | no picture (`I.none`) |
| `rm-106` aedileship | a single curule chair | weak; the description names the museum |
| `rm-107` Coriolanus | an 1803 engraving of Shakespeare's scene | the description names the engraver and the gallery |
| `rm-108` Cincinnatus | an 1843 painting | the description names the painter and the museum |
| `rm-109` Roman dictator | Caesar's perpetual-dictator denarius | the exception to the old office, not the office |
| `rm-110` Twelve Tables | a 1555 woodcut | burned-in lettering; also on `wh-342` (`I.duplicate`) |
| `rm-111` decemvirate | none | no picture (`I.none`) |
| `rm-112` Appius Claudius Crassus | an 18th-century painting of Verginia's death | Appius is small in a corner |
| `rm-113` Verginia | a 15th-century painting of three scenes | acceptable (public domain); the description leans on the museum's title. Also a false `I.duplicate` |
| `rm-114` Valerio-Horatian laws | a denarius of Porcius Laeca | commemorates the Porcian appeal legislation, three centuries later |
| `rm-115` Lex Canuleia | a 3rd-century CE marriage relief | illustrates marriage, not the law; the description repeats an arithmetic of its own |
| `rm-116` consular tribunes | a later stretch of the Fasti | acceptable but weak; the description makes a causal claim no source gives |
| `rm-117` censorship | the census frieze of the "Altar of Domitius Ahenobarbus" | also on `wh-344` (`I.duplicate`) |
| `rm-118` quaestorship | not changed | acceptable |
| `rm-119` legion | an Etruscan bronze situla from Bologna | not a legion; the description carries an unsourced inference |
| `rm-120` siege of Veii | the Portonaccio sanctuary | acceptable photograph; the description overclaims ("most of what is left of the city")
| `rm-121` Camillus | an 18th-century painting of the Falerii schoolmaster | one anecdote; the description makes an unsourced claim about the eagle |
| `rm-122` stipendium | aes rude and aes signatum with a balance, in the Palazzo Massimo | shows bronze by weight, not pay; the description says a label reads "metal by weight", which the alt text contradicts |
| `rm-123` battle of the Allia | a Luminais painting | an editorial description no source supports |
| `rm-124` Gallic sack of Rome | Jamin's painting of Brennus and his share of the loot | a painting of `rm-125`'s subject; the description is the file title |
| `rm-125` Brennus | an engraving | right in kind; the description names its source book |
| `rm-126` geese of the Capitol | an 1889 painting of Juno's geese | right in kind (it shows the birds, not the alarm); the description is full of commentary |
| `rm-127` Aius Locutius | the Nova Via | the description names Livy and Cicero and claims nothing of the altar survives, which no source says |
| `rm-128` Licinio-Sextian laws | the Concord temple site | the description names Plutarch |
| `rm-129` Lex Genucia | a page of a Livy manuscript | the description says everything comes from Livy |
| `rm-130` nobiles | the Togatus Barberini holding two ancestral portraits | subject fits; the description names sources |
| `rm-131` cursus honorum | Scipio Barbatus's sarcophagus | one man's epitaph for the whole term; the credit names no author or licence |
| `rm-132` praetorship | an empty curule chair on a funerary relief | a fair picture of the chair, not the office; the description names the comitium, which no source supports |
| `rm-133` Lex Ovinia | the senate house in the Forum | the Curia Iulia front, a late rebuilding; also on `wh-340` (`I.duplicate`) |
| `rm-134` Lex Poetelia | aes rude, bronze weighed out as money | acceptable in kind but weak; one lump of bronze for a law, and the description wants trimming |
| `rm-135` Lex Hortensia | none | no picture (`I.none`) |
| `rm-136` Lex Ogulnia | a bronze veiled man making an offering | acceptable but generic; one sacrificant, not a pontiff or augur |
| `rm-137` Appius Claudius Caecus | a 19th-century painting of Appius led into the senate house | the right scene; the description names Plutarch |
| `rm-138` Via Appia | the paving today | acceptable photograph; the description names Procopius |
| `rm-139` Aqua Appia | a map of Latium with the aqueduct lines | wrong: French caption naming the map's source, burned-in labels |
| `rm-140` aes grave | a cast prow-series piece in Berlin | acceptable; the locator (the Capitoline) looks unsupported |
| `rm-141` Roman expansion in Italy | a map of the stages of the conquest | the right subject, but a map with a burned-in key, dates and names; the glossary's Rothert map is also labelled |
| `rm-142` Latin War | a 1641 painting of Decius Mus's death | one Livy episode, not the war; the description names the painter and the museum |
| `rm-143` Feriae Latinae | the Alban Mount across Lake Albano | fine as a view; the description asserts a temple on the summit, which Hermans says is debated |
| `rm-144` praefectura | none | no picture (`I.none`); the glossary has none either |
| `rm-145` Latin rights | an 1858 facsimile of the Salpensa charter | acceptable; a drawing where the bronze could be photographed |
| `rm-146` municipium | the excavated town of Tusculum | fine; one site for a whole type; the description's "abandoned in the Middle Ages" wants trimming |
| `rm-147` civitas sine suffragio | the main street of the Banditaccia cemetery at Caere | acceptable as a place; the description states Gellius's story as fact |
| `rm-148` colonia | the wall of Cosa | wrong: Cosa is a Latin colony, the opposite of the card's term. **Its locator and `places` id are Alba Fucens, also a Latin colony; a citizen colony (Antium, Terracina) is wanted** |
| `rm-149` Latin colony | the main gate of Norba | acceptable but weak; one town, and an older League colony |
| `rm-150` ager publicus | the Orange cadastre | wrong-ish: an imperial survey of colony land in Gaul; the description claims it records who held each plot |
| `rm-151` Samnite Wars | Samnite warriors on a tomb frieze from Nola | acceptable in kind (a contemporary painting); the title asserts "Samnite" and a 4th-century date more than the source does. The glossary's Rothert map is wrong (first war only, German labels) |
| `rm-152` First Samnite War | the rock of Saticula | acceptable photograph; the description states Livy's story as fact |
| `rm-153` Second Samnite War | a 1906 German atlas plate | German commentary and the compiler's own arrows burned in; the description names the atlas |
| `rm-154` Caudine Forks | the Stretta di Arpaia seen from Forchia | a good photograph; the description says it is "the ground Livy describes", which is disputed |
| `rm-155` maniple | two soldiers on the Altar of Domitius Ahenobarbus | weak: two soldiers, not a formation; the description's claims are unsourced |
| `rm-156` Third Samnite War | a 1906 German atlas plate | burned-in labels; the title names the atlas |
| `rm-157` Battle of Sentinum | a 19th-century engraving of modern Sassoferrato | not the battle or the Roman town |
| `rm-158` Roman conquest of Etruria | a beech wood on Monte Cimino | weak: one episode (the Ciminian crossing), not the conquest |
| `rm-159` conquest of Umbria and Picenum | the upper Tronto valley | weak: a modern village with a clock tower; the description makes unsourced claims |
| `rm-160` Senones | a gold torque from the Montefortino necropolis | acceptable but weak: one object; the burials are disputed |
| `rm-161` Battle of Telamon | the Dying Gaul in the Capitoline Museums | a Roman copy of a statue made for another war; it shows neither the battle nor the place |
| `rm-162` conquest of Cisalpine Gaul | an 1865 engraving of Casteggio (Clastidium) | one town, not the conquest; the description says Marcellus won the spolia opima there as fact |
| `rm-163` Tarentum | the Doric columns of the temple at Taranto | acceptable photograph; the description's "oldest Greek architecture in southern Italy" is unsourced |
| `rm-164` Pyrrhus | the Herculaneum bust identified as Pyrrhus | acceptable (public domain); the identification rests on comparison |
| `rm-165` Battle of Heraclea | the excavated streets of Heraclea | a photograph of the city, not the battle; the description's "the kind of ground the battle was fought on" has no support |
| `rm-166` Battle of Asculum | a Daunian marble table support from Ascoli Satriano | unrelated to the battle |
| `rm-167` Pyrrhic victory | none | no picture (`I.none`); a bust of Pyrrhus would do |
| `rm-168` Battle of Beneventum | a war elephant on a 3rd-century plate | shows an elephant, not the battle; the description names Commons (`I.caption-source`) |
| `rm-169` siege of Tarentum | a didrachm of Taras | one coin for a siege; the description names the collection and dating authority |
| `rm-170` Roman confederation | a 1911 map of the growth of Roman power | a burned-in legend and labels, naming its author, and it shows the allies about 100 BCE |
| `rm-171` socii | none | no picture (`I.none`) |
| `rm-172` formula togatorum | none | no picture (`I.none`) |
| `rm-173` Via Flaminia | the arch of Augustus at Rimini | the terminus, not the road; the description names Smith's dictionary |
| `rm-174` Via Aemilia | Bologna from above | the description names Smith's dictionary and asserts a Bologna street keeps the road's line, which no source read says |
| `rm-175` Roman roads | the first milestone of the Appian Way | the description says it is the object Plutarch describes Gracchus planting, which no source supports |
| `rm-176` Roman triumph | spoils carried in a triumph on the Arch of Titus | a fair, free picture; the description wants rewording (it names the card and Paullus) |
| `rm-177` evocatio | none | no picture (`I.none`); the Portonaccio sanctuary at Veii or the Aventine would do |
| `rm-178` Romanisation of Italy | the Latin colony of Alba Fucens | acceptable photograph of one colony; the description names Velleius and carries an unsourced claim |
| `rm-179` Latin | the Lapis Niger | `rm-089`'s subject standing for the whole language; the title states a century no source read supports |
| `rm-180` Roman Italy | none | no picture (`I.none`); a map of the Augustan regions would do |
| `rm-181` Carthage | an 1847 engraved plan of the site | burned-in labels; a drawing where photographs exist; the description names its source book |
| `rm-182` Carthaginian empire | Reclus's 1905 plate of the Carthaginian empire | a stippled engraving with burned-in French labels, showing a loose sphere of activity |
| `rm-183` Carthaginian constitution | none | no picture (`I.none`) |
| `rm-184` Carthaginian navy | the naval harbour at Carthage from the air | a hand-coloured postcard of unknown authorship whose public-domain status is unverified; the description names Appian |
| `rm-185` Roman–Carthaginian treaties | none | no picture (`I.none`) |
| `rm-186` First Punic War | a 1906 line map of the Punic theatre | lettered with place names; the description names the book and author |
| `rm-187` Mamertines | a Mamertine bronze coin | a fair single object for a people who struck coins; the description names the Berlin cabinet and its own dating |
| `rm-188` Messana | a silver tetradrachm of Zancle | one coin cannot show a city; the description names the Berlin cabinet and a date range |
| `rm-189` Hiero II | a silver 32-litra piece of Syracuse | the right kind of picture; the description wants rewording (it names the museum and its dates disagree with the card) |
| `rm-190` siege of Agrigentum | a 1727 engraving from Thuillier's French Polybius | usable (no photograph can show the siege); the description names its source. Locator added (Agrigento). |
| `rm-191` first Roman fleet | an undated Roman as with a galley prow | a symbol of sea-power, not the fleet; the description admits the museum gives no date |
| `rm-192` corvus | a 1926 line engraving of the boarding bridge | the description says it departs from Polybius (a hooked spike for a pestle, a pivot for the hole) |
| `rm-193` Battle of Mylae | the museum copy of the Duilius inscription base | acceptable (the lettering is legible) but shows the monument, not the battle. Locator added (Mylae, the article's own point). |
| `rm-194` Cape Ecnomus | a three-panel diagram of the battle | the description admits it "departs from the text in places"; one reconstruction among several. Locator added (the article's point off Licata; the site is uncertain). |
| `rm-195` African expedition | a map of the campaign in Africa | burned-in Spanish labels and numbered stages; the description names its provenance. **No locator: Aspis (Kelibia, an identification no page read confirms) is wanted** |
| `rm-196` Regulus | Rosa's painting of Regulus in the spiked barrel | acceptable but second-best: it shows the later legend, not anything in Polybius |
| `rm-197` siege of Lilybaeum | a plate from Thuillier's French Polybius | an 18th-century imagining of the relief; the description names its source. Locator added (Marsala). |
| `rm-198` Hamilcar Barca | Monte Erice, the ancient Eryx | a mountain, not the man; the description asserts "seized in 244 BCE" and "each side was besieging the other" as fact |
| `rm-199` Aegates Islands | a Carthaginian bronze ram from the Egadi | suits the battle but is also on `wh-345` (`I.duplicate`); one of the two cards needs another picture. Locator added (the Aegates Islands). |
| `rm-200` Treaty of Lutatius | none | no picture (`I.none`) |
| `rm-201` Roman annexation of Sicily | the unfinished Doric temple at Segesta | weak: one temple stands for an event and a settlement; a map of Roman Sicily would do |
| `rm-202` provincia | none (main's picture clean-up removed the modius it shared with `rm-269`) | no picture (`I.none`); the bulk-written bronze modius was wrong for the concept |
| `rm-203` Mercenary War | none | no picture (`I.none`) |
| `rm-204` seizure of Sardinia and Corsica | Tharros on the west coast of Sardinia | weak: one coastal site for a two-island event; the description makes unsourced claims |
| `rm-205` Barcid conquest of Spain | two Carthaginian silver coins from the La Puebla de los Infantes hoard | wrong: the description names the museum and its dating; main's clean-up of shared pictures has since settled the duplicate with `wh-346` |
| `rm-206` New Carthage | the excavated Punic wall at Cartagena | acceptable but narrow; the description says two sandstone faces where the wall has a sandstone outer face and a mudbrick inner one. Locator added (Cartagena). |
| `rm-207` Ebro treaty | the lower Ebro near Mora d'Ebre | fine as a photograph; the description is editorial and wants rewording |
| `rm-208` Saguntum | the hilltop of Sagunto | the right subject; the description makes unsourced claims about the walls. Locator added (Sagunto). |
| `rm-209` Second Punic War | a Carthaginian silver tetradrachm | wrong: a single coin for a whole war; the description itself says the types were not struck for the war |
| `rm-210` Hannibal | the Capua bust "traditionally called Hannibal" | weak: not a verified likeness; the description names a photographer (`I.caption-source`) |
| `rm-211` Hannibal's crossing of the Alps | Turner's 1812 *Snow Storm* | weak, not wrong in rights: a Romantic storm with the army reduced to specks; keep unless a period object serves better |
| `rm-212` war elephant | Siamese war elephants photographed about 1870 | acceptable stand-in only: Asian and two thousand years late; a Hellenistic or Punic object would serve better |
| `rm-213` Battle of the Ticinus | the rescue of the consul, a 1790s French engraving | wrong: the description names its source (Mirys's plate) and it shows one episode. Locator added (the Ticino river's point, not a field: the site is disputed). |
| `rm-214` Battle of the Trebia | the Trebbia at Rivergaro | fine as a photograph of the river, not the battlefield; one clause in the description is unsourced. Locator added (the Trebia). |
| `rm-215` Battle of Lake Trasimene | the battle painted into the Vatican wall map of Perugia | wrong: a 1580s fresco with burned-in Latin labels; a photograph of the Tuoro plain would serve. Locator added (Lake Trasimene). |
| `rm-216` Quintus Fabius Maximus | the Schönbrunn statue of Fabius Cunctator | acceptable in kind: an 18th-century marble, not a likeness, and the description says so |
| `rm-217` Fabian strategy | Hannibal's oxen, an 1885 Italian print | wrong: one episode, imagined; the glossary's photograph of the Falernian plain would fit better |
| `rm-218` Battle of Cannae | the field of Cannae, an 1885 engraving | weak: a drawing of the plain; a photograph from Cannae hill would serve. Locator added (Cannae). |
| `rm-219` double envelopment | the closing of the trap at Cannae, a military-academy diagram | wrong: burned-in map text and it is `rm-218`'s subject, not the concept |
| `rm-220` Rome after Cannae | Roman women mourning, an 1885 engraving | wrong: an imagined drawing; the description names its own file name |
| `rm-221` defection of Capua | a tufa votive from ancient Capua | weak: a sanctuary votive, not the revolt; the description claims the treaty kept Capua's "gods", which Livy does not say |
| `rm-222` siege of Syracuse | the Euryalus fortress | acceptable as terrain, though it shows one fort and the description's "built before the siege" needs checking; the glossary painting is weak |
| `rm-223` Spanish campaigns of the Scipios | the bay at Empúries | weak: one bay for a war across Spain; the description names Polybius; also on `gr-217` |
| `rm-224` Scipio Africanus | the Herculaneum bronze bust "long called Scipio" | questionable: not Scipio, and the description names the museum's dating |
| `rm-225` capture of New Carthage | the Punic rampart at Cartagena from above | weak, not wrong: a place, not the capture |
| `rm-226` Battle of Ilipa | a modern diagram of the pre-battle array | wrong: burned-in key; shows only the array. Locator added (the article's point near Alcalá del Río). |
| `rm-227` Hasdrubal's march into Italy | the valley below the Little St Bernard | ok but weak: the pass is not recorded and the description says so |
| `rm-228` Battle of the Metaurus | Hannibal shown his brother's head, an 1818 engraving | wrong: an imagined scene staged indoors, where Livy has the head thrown before the outposts. Locator added (the Metaurus). |
| `rm-229` Scipio's African campaign | the ruins of Utica | wrong: the description says Scipio besieged it through the whole campaign, but the siege lasted about forty days and was abandoned |
| `rm-230` Masinissa | a Numidian bronze catalogued as Masinissa's | partly wrong: "not a portrait from life" is unsourced |
| `rm-231` battle of Zama | Motte's 1906 painting | ok: public domain, no text; the description already says it is a modern imagining. Locator added (the article's point; the site is uncertain, so the zoom is wide). |
| `rm-232` peace of 201 BCE | the circular military-harbour basin at Carthage | questionable: the description asserts the fleet moored there, which no source here says |
| `rm-233` Italy after Hannibal | a Roman field grid near Padua | wrong: northern Italy, later than the war, and the description admits it |
| `rm-234` Third Punic War | a drawn plan of Carthage "as besieged" | wrong: a drawing with burned-in labels; it shows the siege (`rm-235`) |
| `rm-235` destruction of Carthage | the excavated Punic quarter on the Byrsa | weak: houses of the last decades, not the destruction; the description asserts the hill was levelled for a forum, which no source here checks |
| `rm-236` Conference of Naupactus | the harbour of Naupactus on a c. 1935 postcard | weak: a place picture only |
| `rm-237` Illyrian Wars | Risan and its bay | weak: no event of either war; the description names Polybius and says "inland" where the photo shows a coastal town |
| `rm-238` First Macedonian War | an Aetolian League silver drachma | weak: one ally's coin for the war; the dating rests on the museum's attribution |
| `rm-239` Philip V | a silver tetradrachm of Philip V | ok; the title's "about 220 BCE" comes from the file name |
| `rm-240` Second Macedonian War | a modern map of the theatre | wrong: burned-in English labels and arrows; the glossary plate is German-labelled |
| `rm-241` Battle of Cynoscephalae | a three-phase modern diagram | wrong: drawn blocks, a reading the description admits to; the glossary photo is a model phalanx. **No locator: the site is disputed (Hammond: farther west)** |
| `rm-242` Titus Quinctius Flamininus | the gold stater struck for him | probably fine; the description's remark on Hellenistic royal habit is unsourced |
| `rm-243` freedom of the Greeks | Saint-Ours's 1780 painting | ok: a painted imagining, and the description says it puts Flamininus before the crowd against both ancient accounts |
| `rm-244` Antiochus III | a silver tetradrachm | ok-ish; the description makes an unsourced claim to trim |
| `rm-245` Roman–Seleucid War | a modern map of the campaigns | wrong: burned-in labels and an editorial description; the glossary image has the same fault |
| `rm-246` Battle of Thermopylae, 191 BCE | the pass today | fine as a photograph; the description ("more than any other battlefield") is editorial. Locator added (Thermopylae). |
| `rm-247` Battle of Magnesia | a mailed horseman on a plaque from Iraq | wrong: the description admits it does not show this battle; the glossary's engraved map is labelled. Locator added (Magnesia ad Sipylum). |
| `rm-248` Treaty of Apamea | a modern map of the settlement | wrong: burned-in English labels; the glossary's is shared with the Anatolia entry |
| `rm-249` Third Macedonian War | a Finnish-language map | wrong: burned-in Finnish labels; the description editorialises about Livy |
| `rm-250` Perseus | a silver tetradrachm of Perseus | ok in kind; the description names Polybius and says what the coins paid for |
| `rm-251` Battle of Pydna | a museum diorama of the battle | ok-ish: a modern model that the description says makes the phalanx a solid block; a Delphi frieze photograph is on `gr-861`. Locator added (Pydna). |
| `rm-252` Lucius Aemilius Paullus | the Delphi monument frieze in a 19th-century line drawing | wrong: a drawing where photographs exist, and it shows the battle, not the man |
| `rm-253` settlement of Macedonia | a tetradrachm of the first district, struck at Amphipolis | weak, not wrong: the museum dates the type about 158 – 146 BCE, after the settlement |
| `rm-254` Day of Eleusis | Andriessen's pen-and-wash drawing of Laenas's circle | weak: an imagining nearly two thousand years later, and the description names the artist |
| `rm-255` Achaean War | the Kleitor relief "thought to show Polybius" | wrong: a plaster cast of a relief with a conjectural subject; neither war nor place |
| `rm-256` sack of Corinth | the archaic Temple of Apollo with Acrocorinth | acceptable but weak (main's clean-up has since settled the duplicate with `wh-349`); the description says nothing in it is of the sack |
| `rm-257` province of Macedonia | paving of the Egnatian Way at Philippi | weak: one road, not the province. Locator added: a hand-drawn dashed outline, its point fetched from Thessaloniki. |
| `rm-258` province of Asia | the acropolis of Pergamum | wrong: one city; the description names Strabo. Locator added: a hand-drawn dashed outline, its point fetched from Pergamon. |
| `rm-259` bequest of Attalus III | the Great Altar re-erected in Berlin | weak: the altar is Eumenes II's, and the description admits much of it is modern masonry |
| `rm-260` revolt of Aristonicus | the colonnaded street at Ephesus | weak: a Roman-era street for a city that fought the revolt; the description admits it post-dates it |
| `rm-261` Roman conquest of Spain | the Roman theatre at Cartagena | wrong: a later monument that stands for no part of a 200-year conquest |
| `rm-262` Celtiberian Wars | the Botorrita bronze plaques | borderline: they show the Celtiberian language, not the wars |
| `rm-263` Lusitanian War | a street at the Citânia de Briteiros | wrong: a hillfort in the Minho, north of Lusitania, as the description says. **No locator: Lusitania has no point** |
| `rm-264` Viriathus | the monument to Viriato at Viseu | ok in kind: a modern bronze; the description says no ancient likeness survives |
| `rm-265` Numantine War | reconstructed timber towers at Numantia | ok in kind, weak: a visitors' reconstruction of the site, not the siege. Locator added (Numantia). |
| `rm-266` Scipio Aemilianus | a painting of Masinissa's deathbed | wrong: a painting of one scene, titled with the wrong name; the description is a copied caption with a typo and gives Masinissa's dates |
| `rm-267` Roman provincial system | none | no picture (`I.none`) |
| `rm-268` publicani | none | no picture (`I.none`) |
| `rm-269` provincial taxation | a bronze modius from Herculaneum | wrong: imperial-period, one object; it now stays here alone, `rm-202` having lost it in main's clean-up of shared pictures |
| `rm-270` wealth of empire | Vernet's 1789 *Triumph of Aemilius Paulus* | weak: a neoclassical painting nineteen centuries later; a relief, a hoard or a mine would show wealth better |
| `rm-271` Greek influence on Roman culture | none | no picture (`I.none`) |
| `rm-272` philhellenism | none | no picture (`I.none`) |
| `rm-273` Cato the Elder | none | no picture (`I.none`) |
| `rm-274` Bacchanalian affair | none | no picture (`I.none`); the Tiriolo tablet in Vienna would suit if a free image exists. Locator added (Tiriolo). |
| `rm-275` sumptuary law | none | no picture (`I.none`) |
| `rm-276` crisis of the Roman Republic | none | no picture (`I.none`) |
| `rm-277` latifundium | none | no picture (`I.none`) |
| `rm-278` decline of the Italian smallholder | none | no picture (`I.none`) |
| `rm-279` slavery in Italian agriculture | none | no picture (`I.none`); a farm scene or a mosaic of farm slaves would suit |
| `rm-280` First Servile War | the rock at Enna | fine as a photograph; the description narrates Diodorus and Strabo and the credit lacks "via Wikimedia Commons". Locator added (Enna). |
| `rm-281` Tiberius Gracchus | none | no picture (`I.none`); the glossary's Guillaume bronze shows both brothers, so a Tiberius-only picture is wanted |
| `rm-282` lex Sempronia agraria | none | no picture (`I.none`) |
| `rm-283` Gracchan land commission | a boundary stone at Fano (CIL XI 6331) | ok with a caveat: a later restoration naming Licinius, Appius Claudius and Gaius Gracchus; its title ("naming the three commissioners") should be reworded |
| `rm-284` death of Tiberius Gracchus | none | no picture (`I.none`); a free photograph of the Capitol area would do |
| `rm-285` Gaius Gracchus | Guillaume's bronze of the brothers | mostly ok: the credit names no author and the description should say it is a 19th-century bronze; the same sculpture as the glossary picture |
| `rm-286` lex frumentaria | none | no picture (`I.none`) |
| `rm-287` equestrian order | none | no picture (`I.none`) |
| `rm-288` extortion court | none | no picture (`I.none`); the Lex Acilia tablet would suit |
| `rm-289` senatus consultum ultimum | none | no picture (`I.none`) |
| `rm-290` death of Gaius Gracchus | none | no picture (`I.none`) |
| `rm-291` optimates and populares | none | no picture (`I.none`); a bust of Cicero or of Cato the Younger would be apt |
| `rm-292` Jugurthine War | none | no picture (`I.none`); the denarius of Faustus Sulla showing Bocchus surrendering Jugurtha would be the apt picture |
| `rm-293` Jugurtha | none | no picture (`I.none`) |
| `rm-294` Gaius Marius | a portrait head conventionally called Marius | ok on the whole: the description is honest that the name is conventional; its first sentence reads as commentary |
| `rm-295` Marian reforms | a denarius of Fundanius showing Marius as triumphator | weak: a victory type, not the army; the description names a catalogue number and says "BC" |
| `rm-296` capite censi | none | no picture (`I.none`) |
| `rm-297` Cimbri and the Teutones | a book plate of Marius and the Cimbrian ambassadors | wrong: one episode for a whole people, and the description names its source |
| `rm-298` Battle of Arausio | none | no picture (`I.none`). Locator added (Arausio). |
| `rm-299` Battle of Aquae Sextiae | a 1915 illustration by John Harris Valda | wrong: the description names the artist and the book. Locator added (Aquae Sextiae). |
| `rm-300` Battle of Vercellae | Tiepolo's oil of the battle | acceptable as an imagined scene; the description gives museum dimensions and the credit names no painter. Locator added (Vercellae; the site is disputed). |
| `rm-301` consulships of Marius | none | no picture (`I.none`) |
| `rm-302` Saturninus | none | no picture (`I.none`); the glossary's denarius is acceptable, but its description should hedge that the moneyer is the tribune |
| `rm-303` Second Servile War | none | no picture (`I.none`) |
| `rm-304` Marcus Livius Drusus | none | no picture (`I.none`) |
| `rm-305` Social War | none | no picture (`I.none`); the rebels' ITALIA denarius would be the apt picture |
| `rm-306` Italian demand for citizenship | none | no picture (`I.none`) |
| `rm-307` lex Julia | none | no picture (`I.none`) |
| `rm-308` enfranchisement of Italy | none | no picture (`I.none`) |
| `rm-309` Sulla | a portrait head conventionally called Sulla | ok: a photograph, and the description says the identification is traditional |
| `rm-310` First Mithridatic War | a campaign map | wrong: burned-in labels, and the description names its sources instead of describing the map |
| `rm-311` Mithridates VI | the Louvre head of Mithridates as Heracles | ok |
| `rm-312` Asiatic Vespers | a map | wrong: burned-in labels copied from a 2020 book, a doubtful CC0 claim, and the description names its source |
| `rm-313` Sulla's march on Rome | a map | wrong: burned-in labels, and the description names its source and a Wikipedia article |
| `rm-314` Cinna | none | no picture (`I.none`) |
| `rm-315` Marian terror | none | no picture (`I.none`) |
| `rm-316` civil war of 83 BCE | none | no picture (`I.none`) |
| `rm-317` Battle of the Colline Gate | an engraved view | wrong: the description is a library catalogue title and the alt is the file name |
| `rm-318` proscription | none | no picture (`I.none`) |
| `rm-319` Sulla's dictatorship | a Munich marble head labelled "so-called Sulla" | weak: an uncertain portrait stands for an office, and the description reads as a museum label |
| `rm-320` Sullan constitution | none | no picture (`I.none`) |
| `rm-321` fall of the Roman Republic | Gérôme's *Death of Caesar* | weak: one event for a process, and the description is museum text with "BC" |
| `rm-322` revolt of Lepidus | none | no picture (`I.none`) |
| `rm-323` Sertorius | a 1638 painting of Sertorius and the horse's tail | wrong: an imagined scene, and the description names its source institute |
| `rm-324` Sertorian War | excavated skeletons of executed soldiers at Valencia | acceptable as one episode; the description names the museum and makes a claim the card does not source |
| `rm-325` Pompey | the Venice portrait head of Pompey | ok |
| `rm-326` Marcus Licinius Crassus | a Louvre bust | wrong: the description is only "Louvre Museum, Paris.", the alt is the file name, and it differs from the glossary's bust |
| `rm-327` Spartacus | Foyatier's statue of 1830 | ok as an imagined likeness; the description names the Louvre |
| `rm-328` Third Servile War | none | no picture (`I.none`) |
| `rm-329` consulship of 70 BCE | none | no picture (`I.none`) |
| `rm-330` restoration of the tribunate | none | no picture (`I.none`) |
| `rm-331` Cilician piracy | none | no picture (`I.none`) |
| `rm-332` lex Gabinia | none | no picture (`I.none`) |
| `rm-333` Third Mithridatic War | none | no picture (`I.none`) |
| `rm-334` Lucullus | none | no picture (`I.none`); the glossary's is an engraving of a bust only traditionally called Lucullus |
| `rm-335` Pompey's settlement of the East | a map of the Near East in 62 BCE | wrong: a derived map, very likely with burned-in labels |
| `rm-336` Cicero | a marble bust inscribed CICERO | ok |
| `rm-337` trial of Verres | none | no picture (`I.none`) |
| `rm-338` consulship of Cicero | Thorvaldsen's copy of the Capitoline bust | weak: the man, not the year, and close to `rm-336`'s |
| `rm-339` Catiline | Segoni's painting of Catiline's body (1871) | acceptable in kind (no portrait survives); the description names the work and the credit no author |
| `rm-340` Catilinarian conspiracy | none | no picture (`I.none`) |
| `rm-341` debate on the conspirators | none | no picture (`I.none`) |
| `rm-342` Cato the Younger | the Volubilis bronze bust inscribed CATO | ok |
| `rm-343` Julius Caesar | the Green Caesar | ok |
| `rm-344` First Triumvirate | none | no picture (`I.none`) |
| `rm-345` Caesar's first consulship | none | no picture (`I.none`) |
| `rm-346` Publius Clodius Pulcher | none | no picture (`I.none`); the glossary's is an imagined portrait with Latin text on it |
| `rm-347` exile of Cicero | none | no picture (`I.none`) |
| `rm-348` political violence in the late Republic | none | no picture (`I.none`) |
| `rm-349` conference at Luca | none | no picture (`I.none`) |
| `rm-350` Gallic Wars | the reconstructed siege works at Alesia | wrong: one siege (`rm-353`'s subject) for the whole war |
| `rm-351` Commentarii | a 1798 Spanish half-title | weak: a title page with burned-in text stands for the work |
| `rm-352` Vercingetorix | the gold stater bearing his name | ok; the description names the Cabinet des Médailles |
| `rm-353` Alesia | a 19th-century engraving of the fighting | wrong: an imagined scene where photographs of the site exist, and the description names its source book |
| `rm-354` British expeditions | none | no picture (`I.none`) |
| `rm-355` Parthian campaign | none | no picture (`I.none`) |
| `rm-356` Carrhae | the ruins of Harran | acceptable (the town, not the battlefield); the description is a file name and timestamp |
| `rm-357` Titus Annius Milo | none | no picture (`I.none`) |
| `rm-358` sole consulship | none | no picture (`I.none`) |
| `rm-359` Rubicon | the Rubicone at Savignano | ok |
| `rm-360` Caesar's civil war | none | no picture (`I.none`) |
| `rm-361` Battle of Dyrrhachium | a modern plan of the lines | wrong: burned-in English labels |
| `rm-362` Battle of Pharsalus | a Florentine chest panel | wrong: a 15th-century scene that also shows Pompey's death (`rm-363`), shared with the glossary |
| `rm-363` death of Pompey | Tofanelli's *Head of Pompey brought to Caesar* | acceptable: the aftermath, not the killing |
| `rm-364` Alexandrian War | an 1885 engraving of the fight on the mole | acceptable as one episode |
| `rm-365` Battle of Thapsus | a 1732 engraved plan | wrong: lettering burned in |
| `rm-366` Battle of Munda | a Merian engraving of about 1625 | wrong: Latin captions burned in |
| `rm-367` Caesar's dictatorship | the Buca denarius reading CAESAR DICT PERPETVO | ok |
| `rm-368` Julian calendar | the Menologium Rusticum Colotianum | ok |
| `rm-369` Ides of March | Camuccini's *Death of Caesar* (1804 – 05) | acceptable as a reconstruction |
| `rm-370` Marcus Junius Brutus | the EID MAR denarius | ok; the description's "his bearded head, 42 BCE" is wrong (CRRO: 43 – 42 BCE, the head of L. Junius Brutus) |
| `rm-371` Augustus | the Via Labicana statue | ok |
| `rm-372` will of Julius Caesar | the Temple of Divus Julius | acceptable but loosely tied (the pyre, not the will) |
| `rm-373` War of Mutina | a worn denarius of Pansa as moneyer | weak: one consul's coin of 48 BCE, not the war |
| `rm-374` Second Triumvirate | an aureus of Antony and Octavian with III VIR R P C | ok |
| `rm-375` triumviral proscription | none | no picture (`I.none`) |
| `rm-376` death of Cicero | the so-called Tomb of Cicero at Formia | weak: no inscription ties it to him (the description says so) |
| `rm-377` Battle of Philippi | the Philippi plain from Cassius's camp | ok |
| `rm-378` Perusine War | the Etruscan Arch at Perugia | ok |
| `rm-379` Pact of Brundisium | the Roman column at Brindisi | wrong: a place stands for an event |
| `rm-380` Sextus Pompey | a denarius of Sextus Pompey | ok; the description names the findspot |
| `rm-381` Battle of Naulochus | the coast from Tindari towards Capo Milazzo | ok |
| `rm-382` Marcus Agrippa | the Gabii portrait | ok |
| `rm-383` Mark Antony | the Chiaramonti bust | ok |
| `rm-384` Cleopatra VII | the Berlin marble head | ok |
| `rm-385` Donations of Alexandria | the Dendera relief of Cleopatra and Caesarion | wrong: not the ceremony, and the description says the Donations made Caesarion co-ruler (he already was) |
| `rm-386` will of Mark Antony | the Temple of Vesta | acceptable stand-in; the description's "commonly lodged with the Vestals" is unsourced |
| `rm-387` Battle of Actium | Octavian's campsite memorial at Nikopolis | ok |
| `rm-388` annexation of Egypt | an AEGVPTO CAPTA denarius | ok; the description's "about 27 BCE" and named mint are wrong (COS VI is 28 BCE; the mint is uncertain). Locator moved to Alexandria. |
| `rm-389` first settlement | the Curia Julia | ok |
| `rm-390` clipeus virtutis | the marble shield from Arles | ok; the description says Carrara marble, one record Luna |
| `rm-391` princeps | a marble Augustus in the civic crown | acceptable stand-in: the man, not the word; the description carries commentary |
| `rm-392` second settlement | a denarius of Augustus | weak: the man, not the settlement |
| `rm-393` tribunicia potestas | none | no picture (`I.none`); an aureus with TR POT would suit |
| `rm-394` imperium proconsulare maius | the Tropaeum Alpium | wrong: a monument, not the power |
| `rm-395` Principate | the Via Labicana Augustus | ok (shared in kind with `rm-371`) |
| `rm-396` Res Gestae Divi Augusti | the Latin text at Ancyra | wrong: the description names Mommsen's edition and the credit gives a book as author |
| `rm-397` imperial province | a modern map of the provinces in 14 CE | wrong: a coloured map, and the description names Dio |
| `rm-398` discharge gratuity | a discharged soldier's gravestone | weak: one worn tombstone |
| `rm-399` Praetorian Guard | a Claudian relief of praetorians | ok |
| `rm-400` aerarium militare | a gold aureus of Augustus | weak: tied to the fund only by association |
| `rm-401` Temple of Apollo Palatinus | the podium on the Palatine | ok |
| `rm-402` Forum of Augustus | the square and its back wall | ok |
| `rm-403` Ara Pacis | the procession and the scrollwork | ok; the locator marks the modern museum, not the ancient site under Palazzo Fiano |
| `rm-404` Mausoleum of Augustus | the tomb from the entrance side | ok |
| `rm-405` Augustus of Prima Porta | the statue in the Vatican | ok |
| `rm-406` ludi saeculares | none | no picture (`I.none`); the Acta pillar in the Museo Nazionale Romano would suit |
| `rm-407` ius trium liberorum | children in the Ara Pacis procession | acceptable stand-in for a legal right |
| `rm-408` Julia the Elder | Pandateria, where she was sent | weak: a place, not the person; a denarius with her head between Gaius and Lucius would show her |
| `rm-409` Lares Augusti | the Ara dei Vicomagistri | weak: a ward procession of c. 30 – 40 CE, not an Augustan Lares altar; the Belvedere or Vicus Sandaliarius altar would show the Lares |
| `rm-410` princeps iuventutis | Augustus between his grandsons (Corinth) | ok |
| `rm-411` Livia | a portrait head of Livia | ok |
| `rm-412` Agrippa Postumus | a bust identified as Agrippa Postumus | ok (the identification is modern, and the description says so) |
| `rm-413` Nero Claudius Drusus | a portrait of Drusus the Elder | ok |
| `rm-414` Battle of the Teutoburg Forest | the iron face mask from Kalkriese | acceptable: an object from the site, not the battle |
| `rm-415` Divus Augustus | a coin of the deified Augustus | ok; the alt text's "bearded-free" should read "beardless" |
| `rm-416` Julio-Claudian dynasty | the Gemma Claudia | ok |
| `rm-417` Tiberius | a portrait of Tiberius | ok |
| `rm-418` dies imperii | a Roman public calendar (the Fasti Praenestini) | acceptable stand-in: it shows no dies imperii entry |
| `rm-419` Germanicus | a portrait bust of Germanicus | ok |
| `rm-420` Percennius | none | no picture (`I.none`): no portrait of a private soldier exists |
| `rm-421` Arminius | the gravestone of Marcus Caelius | wrong subject: a centurion who died in the Varian war (it suits `rm-414`) |
| `rm-422` Gnaeus Calpurnius Piso | none | no picture (`I.none`) |
| `rm-423` Sejanus | the wall of the praetorian camp | weak: the camp (`rm-399`'s subject), not the man |
| `rm-424` Macro | none | no picture (`I.none`); no certain portrait exists. The Gemonian Stairs locator belongs to Sejanus |
| `rm-425` Capreae | ruins on the heights of Capri | ok |
| `rm-426` maiestas | the senate house in the Roman Forum | weak: a building for a legal concept |
| `rm-427` Caligula | a portrait bust of Gaius | ok; the credit names no author |
| `rm-428` Incitatus | a named racehorse in a Roman mosaic | wrong: the Sousse mosaic shows another horse (Amator); the Circus Maximus locator is in neither source |
| `rm-429` Cassius Chaerea | a covered passage on the Palatine | wrong in kind: a Neronian cryptoporticus built after Gaius's death |
| `rm-430` Claudius | Claudius in the guise of Jupiter | ok |

## Glossary candidates

Terms the batches meet that have no entry, ranked by how many cards use them. Grep the keys AND the aliases
before adding one — `add-glossary.js` overwrites in silence.

| term | cards that use it | found in |
|---|---|---|

## Ledger

Newest last. Each entry says what changed, what was refused and why, and which of the rules no checker can
see were read by eye: the article, confusability with siblings, whether the image depicts the whole term,
and coverage against the term's own article.

### Batch 0 — tooling (2026-10-04)

Shipped `rm-audit.js`, the prefix switch in `.claude/wh-refine/` (`cfg.js`), this file and
`docs/rome-chronology.md`. `greece-audit.js` run directly, `wh-audit.js` and `wh-audit.js --worst` give
byte-identical output before and after; `prep.js 301 302` for `wh-` writes byte-identical files. Nothing on
any card changed.

### B1 — `rm-001`–`rm-010`, Italy before Rome (2026-10-04)

All ten re-researched from scratch by five agents, two cards each, under `.claude/wh-refine/BRIEF.md` and a
Rome addendum; every quoted passage was matched against its saved page by `precheck.js`, every draft went
through `add-card.js --dry-run` and the audit, and every draft was then read by eye before `batch.sh`
applied it. **Pictures were not touched**: Wikimedia answered 429 to the session's one test call, so each
card keeps its picture and the agents' verdicts are in "Pictures to redo" (nine of ten want replacing).

Checks:
- `rm-audit.js --range=rm-001:rm-010` reads clean on seven cards; `rm-010` has no picture (`I.none`), and
  `rm-007` and `rm-008` keep a `W.not-why` note (one FAQ each opens "What").
- `check-questions`, `check-cards --prefix=rm-0NN` (every card), `check-style`, `check-docs`,
  `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card.
- Every citation URL answers 2xx except Posth et al. 2021's DOI (`10.1126/sciadv.abi7673`, cited on
  `rm-009` and `rm-010`): science.org answers 403 to this sandbox; the paper is open access and was read in
  full on Europe PMC.

**What changed, card by card** (sources before → after).

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-001` Ancient Italy | 8 | 7 → 8 | **A question had Strabo picturing Italy as a triangle; Strabo 5.1.2 reports other writers' triangle and rejects it.** The population row ("6 – 16 million, disputed") was not a date; the line is now Iron Age c. 1000 BCE, Social War 91–88, Lex Roscia 49 BCE, the span a recent handbook uses (said as such). The population, Po-plain and Umbrian claims, which their citations did not carry, are gone. A locator (Italian peninsula) added. |
| `rm-002` Apennines | 8 | 5 → 8 | Two questions carried figures the audit reads as dates (1,200 km, 2,912 m). The two Smithsonian volcano pages were about Vesuvius and Campi Flegrei, not the chain, and are gone; Polybius on the water-parting, Varro on transhumance and the Saepinum inscription on the drove roads added. An author's first name cut back to the initial the paper prints. Plan line retitled "The Apennines". |
| `rm-003` Tiber | 8 | 5 → 8 | **A geology card in a history collection** (discharge, glacial incision, terrace heights); now the river's history — Pliny on its old names, the Forum Boarium harbour, the sandbank at the mouth, the Claudian and Trajanic basins, the flood record and the Senate debate in Tacitus. A question carried a century. |
| `rm-004` Latium | 7 | 5 → 7 | The volcanic chronology belonged to `rm-005`; the Acheulian finds, cave burials and salt workshop to no history card; **"drained in the 1930s" had no source**. Now the land of the Latins: its borders, the name's derivations, its spread south as Rome conquered, the Augustan first region. A question carried "millennia". |
| `rm-005` Alban Hills | 6 | 5 → 6 | **The 949 m height and "20 km from Rome" rested on a page that no longer opens**; the height is gone and the distance is the ~30 km the 2025 *Bulletin of Volcanology* paper gives for the caldera. Livy's Alba Longa and Alban Lake stories added, told as his. A question carried "000" (36,000). |
| `rm-006` Bronze Age Italy | 7 | 5 → 7 | The date line read "2nd millennium BCE", which is not a date; now c. 2200 – 950 BCE on the usual Italian scheme, with Terramare and nuraghi rows. A question carried 1700–1100 BCE. Two single-site sources (Calabria, Monte Croce Guardia) gave way to the four phases, diet, Aegean-style pottery and the copper trade to the Balkans. |
| `rm-007` Terramare culture | 7 | 6 → 7 | **The *terra marna* fertiliser etymology was cited to a Reggio Emilia urban paper that is not about the terramare**; now Peet 1909 and Cremaschi 2017 (in Italian, chipped). Oppeano and a general diet paper, neither shown to be about this culture, dropped. "Densest population" rests on one radiocarbon study and says so. Two questions carried years. |
| `rm-008` Villanovan culture | 6 | 5 → 6 | Added that "Villanovan" is a modern name from a hamlet near Bologna (1853), now read as a set of objects rather than a people; Pontecagnano's foundation by Villanovan groups hedged against the local-origin view. Questions carried "120" and a century. |
| `rm-009` Italic peoples | 7 | 5 → 8 | **The old card called the Peligni, Vestini, Marsi, Volsci and Aequi Oscan peoples**; its source lists them as separate Middle-Italic traditions. "Italic" is now said to be a modern linguists' label; Strabo's sacred-spring tale told as his. The line "c. 1000 – 200 BCE" had no event behind its end; now c. 1000 BCE and the Social War, 91 BCE. |
| `rm-010` Latins | 7 | 5 → 8 | **"78–107 settlements" misread one study's network-node counts**, and is gone. The line ended on the traditional 509 BCE unlabelled; it is now the Latin culture's emergence (c. 1050 – 950 BCE) and the Latin War (340 – 338 BCE, Varro's reckoning, said in prose). Livy's Aeneas and the Aborigines told as legend. |

Every glossary entry but `Apennines` (which agreed with its card and was re-verified) was rewritten to agree
with its card and to drop what its sources did not carry; `Ancient_Italy`, `Italic_peoples` and `Latins`
gained dates.
The Think-it-through sets were all written fresh, with markers.

**Not usable from here:** science.org and Springer landing pages (JS challenge; Europe PMC full text used),
MDPI and OUP landing pages (403; Europe PMC copies used), the Smithsonian Global Volcanism Program
(Cloudflare 500), Taylor and Francis, OpenAlex (rate-limited), Livius.org's Social War page (404).

**Read by eye.**
- *Article:* "Ancient Italy", "Latium" and the people names bare; "the Tiber", "the Apennines", "the Alban
  Hills", "the Terramare culture", "the Villanovan culture" take "the" from the question; "Bronze Age Italy"
  bare.
- *Legend as legend:* Livy's Aeneas (`rm-010`), Alba Longa and the Alban Lake (`rm-005`), Strabo's sacred
  spring (`rm-009`) and the triangle (`rm-001`) are each told in the ancient author's voice.
- *Confusability:* checked against `index.tsv`; `rm-004` and `rm-010` share a Think-it-through point (the
  kings' traditional dates as improbable, from one BMCR review) but no question; `rm-006` keeps the
  Terramare to two sentences and no question, leaving `rm-007` its ground.
- *Coverage:* against each term's Wikipedia article as a checklist; the real gaps were history on the
  three geography cards (`rm-002`–`rm-004`) and the name's modernity on `rm-008`/`rm-009`.
- *Overlap with `gr-`/`wh-`:* `wh-256` Bronze Age gives no span for Italy, so no conflict; no other
  `gr-`/`wh-` card covers these ten.

**Locators.** `rm-001` gained one (Italian peninsula) through `add-locators.js`. The other nine keep what
they had: regions and ranges keep their hand-drawn shapes, and `rm-006`, `rm-009` and `rm-010` are periods
or peoples spread over a region with no shape drawn yet.

**Chronology.** The new "Italy before Rome" section carries ten rows; pins added for `rm-001`, `rm-006`–`rm-010`.

### B2 — `rm-011`–`rm-020`, Italy before Rome (2026-10-04)

Run as B1 was, and in parallel with its last agents (ten at once): five agents, two cards each, every quote
checked against its saved page, every draft read by eye before `batch.sh` applied it. Pictures untouched
(Wikimedia still refused); verdicts in "Pictures to redo" (eight of ten want replacing).

Checks: `rm-audit.js --range=rm-011:rm-020` reads **10 of 10 clean**. `check-questions`, `check-cards`,
`check-style`, `check-docs`, `split-cards --check` and `test-card-plans` pass; every citation URL answers
2xx. `check-citations --card` first reported 3 mismatches on `rm-015`/`rm-016`: the drafts dated Zapelloni
Pavia's book 2024 (its open-access e-book) where Crossref and the print say 2023; corrected to 2023 and
re-applied, now 0 mismatched on every card.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-011` Latin League | 6 | 5 → 6 | **The background rested on three Persée articles of which only a first page loads**; their claims (Ferentina placed at the Laghetto di Turno, a "federal army and courts" in 338) are gone, and Ferentina's grove is now "never found". The 338 settlement uses Livy 8.14's own terms; Tarquin's acts are Livy's story. The line read "late 6th century – 338 BCE"; now Traditional 493 BCE (the *foedus Cassianum*, said to be disputed) and Dissolved 338. Questions moved off the Latin Festival, `rm-143`'s subject. |
| `rm-012` Sabines | 7 | 5 → 7 | **"c. 900 BCE" as the start had no source**; the line is now Eretum as a town c. 650 – 550 BCE and the conquest of 290 BCE. The 271 BCE drainage year and the 2,200 m channel rested on one source and are gone, as is a speculative link between Cures' decline and the 174 BCE earthquake. Author first names cut back to the initials the works print. A question carried years. |
| `rm-013` Samnites | 8 | 5 → 8 | **Four old sources would not open** (a lidar paper and three OAPEN books); every claim on them is gone, including "299 hillforts unrecorded", the *meddix tuticus* and the Pietrabbondante armour. The sacred-spring origin is Strabo's story. The line's century row is now Wars with Rome, 343 – 290 BCE, the conventional years. |
| `rm-014` Oscan | 6 | 5 → 6 | **"The first Social War coins read ITALIA in Latin" and "Oscan legends followed in 90 BCE" rested on a page that resets the connection**, and are gone. Strabo on Oscan plays at Rome and Ennius's "three hearts" (through Gellius) added. A question carried dates. The glossary's text stands; its Mnamon citation is corrected. |
| `rm-015` Umbrians | 6 | 5 → 6 | **"A well-defined identity by the 9th century BCE" was one genetics paper's summary**; it is now one view against the main archaeological study, which calls the evidence slender. "Under Rome by c. 260 BCE" is now the final surrender of 268 – 265 BCE. The claim that Livy and Polybius put the Umbrians absent at Sentinum had no source and is gone; the Gubbio sanctuary details went with an MDPI page that answers 403. Two phrasings were about `rm-016`'s tablets. |
| `rm-016` Iguvine Tables | 5 | 5 → 6 | **"c. 200 BCE" on the line had no source** (the sources say the plates were cut at different times from the 3rd to the 1st century); now c. 300 – 1 BCE. "4,000 words" is 4,000 – 5,000. The find is split into the tradition of 1444 and the first secure record, a deed of 1456. |
| `rm-017` Volsci | 5 | 5 → 7 | The capture of Satricum in 488 BCE stood as fact though its source gives it as what ancient writers say; now labelled By tradition, with Antium's ships, 338 BCE, added. Two sentences on Alba Fucens (off the subject) and Satricum's size (not in the cited page) cut. Livy's own voice, Coriolanus as tradition, and the debate over whether any finds mark the Volsci out added. **The glossary said the language survives mainly on the Satricum axe**; it is the one text from a securely Volscian setting. |
| `rm-018` Ligurians | 7 | 5 → 7 | **Everything built on Cato (the Ligurians as unlettered liars, his speech of 190 BCE) came from an article on Persée**, which this run cannot open, and is gone. "A market building" hedged to "perhaps a market", as the survey says. Strabo on the coast road, Livy 40.38 on the deportation to Samnium and the Polcevera ruling of 117 BCE added. |
| `rm-019` Veneti | 6 | 5 → 6 | A century on the line ("Annexed 1st century BCE") is gone; the line is now dated burials c. 900 – 50 BCE and inscriptions c. 550 BCE – 50 CE. Livy's Antenor legend told as his; Polybius on the Veneti drawing the Gauls home from Rome added. **The glossary's "close to Latin" is "slightly similar" in its source.** |
| `rm-020` Messapians | 5 | 5 → 6 | **"Writing ends c. 200 BCE" was a figure no source gives**, and is gone; the 266 BCE triumph over the Sallentini added. **"The house ended in arrowheads, catapult balls and fire" misread its source**, which puts that evidence by a later wall. The *trozzella* claims rested on a Padua page that would not open, and are gone. Herodotus's Cretan origin and the Tarentine defeat told as his; Polybius's manpower figure given as his. |

**Not usable from here:** Persée (first page only), OAPEN (bot wall; Brill chapter DOIs used instead),
numismatics.org (connection reset), De Gruyter (Cloudflare), MDPI, ScienceDirect, the Oxford Classical
Dictionary, Taylor and Francis, Livius.org's Latin League page (404), Gellius on LacusCurtius (404).

**Read by eye.**
- *Article:* every term in B2 is bare or a people's plural taking "the" from the question.
- *Legend as legend:* Tarquin and Ferentina (`rm-011`), the sacred spring (`rm-013`), Coriolanus (`rm-017`),
  Antenor (`rm-019`) and the Cretans at Hyria (`rm-020`) are told in the ancient author's voice.
- *Confusability:* `rm-015` no longer asks about the tablets that are `rm-016`'s; `rm-011`'s questions left
  the Latin Festival to `rm-143`.
- *Overlap with `gr-`/`wh-`:* `gr-214` Taras dates the Tarentine defeat by the Iapygians to 473 BCE; `rm-020`
  leaves it undated, since Herodotus gives no year and Diodorus only an archon year — not a contradiction,
  but the two should be read together when `gr-214` is next touched. No other overlap.

**Locators.** All ten kept what they had (regions keep their shapes; `rm-016` its Gubbio point).

### B3 — `rm-021`–`rm-030`, Italy before Rome: the Etruscans (2026-10-04)

Run as B2: five agents, two cards each, every draft read by eye, applied with `batch.sh`; B4's agents
researched alongside. Pictures untouched (Wikimedia refused); verdicts in "Pictures to redo".

Checks: `rm-audit.js --range=rm-021:rm-030` reads clean on six cards; `rm-025` has no picture (`I.none`), and
`rm-021`, `rm-022` and `rm-028` keep a `W.not-why` note ("How", "Did", "Where"). `check-questions`,
`check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; every citation URL
answers 2xx; `check-citations --card` 0 mismatched on every card.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-021` Cisalpine Gauls | 6 | 5 → 8 | A century range on the line ("4th – 1st century BCE"); now Arrived c. 400 BCE and Citizenship 49 BCE (the Lex Roscia, as on `rm-001`). Livy's Bellovesus told as Livy's, undated. The Monte Bibele claims went with a source of which only the abstract opens. Polybius's tribes, Etruscan Bologna and Marzabotto, and Rome's absorption added; the old half-card on epigraphy cut to one FAQ. |
| `rm-022` Etruscan civilisation | 8 | 5 → 8 | **"c. 800 – 1 BCE" as the inscriptions' span was read as the civilisation's**; the line is now c. 1000 BCE, the defeat off Cumae 474 and Veii 396 (Varronian, said in prose). A chapter whose repository page shows no text and a wine paper behind a 403 are gone. The name Rasenna (Dionysius), the origins question, trade, decline and Latin's replacement of the language added. |
| `rm-023` Etruscan origins | 8 | 5 → 8 | **The old card had Herodotus and Hellanicus both deriving the Etruscans from Anatolia**; Hellanicus, as Dionysius quotes him, made them Pelasgians driven from Greece. Each version is now told in its author's voice. **"Argued after Fascism" had no source.** The 2021 and 2013 genome studies added. Years out of the questions. |
| `rm-024` Etruscan cities | 7 | 5 → 8 | **"549/1,248/914 known sites" were the totals of one study's data set**, not all known sites, and are gone. The line is now the move to plateaus c. 1020 – 900 BCE, full cities c. 750 – 480, and Veii 396 (labelled tradition). A phrasing that overlapped `rm-120` (the siege of Veii) replaced. |
| `rm-025` Etruscan league | 6 | 5 → 8 | A century on the line; now the shrine in use c. 550 BCE – 400 CE and Volsinii taken 264 BCE. **"Tradition credits Porsenna" was cited to a Louvre page that does not say it.** The Campo della Fiera = Fanum Voltumnae identification is now credited to its excavators; Livy's words *concilium* and *foedus*, not "league", are said. The glossary's unsourced "attested from the 4th century BCE" gone. |
| `rm-026` Etruscan language | 7 | 5 → 8 | **The *Liber Linteus* was dated "about 390 BCE" as a book; that is a radiocarbon date for the linen**, and the text is dated by its letters to c. 200 – 150 BCE; the line carries both. A Croatian chapter had been cited under an English title with no chip; both fixed. |
| `rm-027` Pyrgi Tablets | 6 | 5 → 6 | Heurgon 1965 (Persée, first page only) replaced by Wikander 2008 and Herodotus 1.166–67. **The Phoenician "statue" is a disputed reading**, and "500–490" and the "Phoenician calendar" had no source; all gone. "Temple B c. 510" is the sanctuary's monumentalisation in its source, and is relabelled. |
| `rm-028` Etruscan religion | 7 | 5 → 7 | **The Portonaccio deposit was 600–530 with "aristocratic dedicators"**; the source gives 600 – 540/530 and only "limited conclusions" on families. "Life-size" terracottas had no source. The Thesan sentence was about a head; it is about the temple. The gods, the lateness of the written evidence, the afterlife and Livy added. |
| `rm-029` haruspicy | 7 | 5 → 7 | The old sources were Persée papers and a Piacenza museum page, none of which could be re-read; every claim re-sourced. **The liver's "41 names / 27 gods", the Mesopotamian clay-model details and "responsa favoured expansion from c. 300 BCE" had no source that opens**, and are gone. The Assyrian link is one view. New line: first depicted c. 430 – 400 BCE, the Piacenza liver c. 100 BCE, against Alaric 409 CE. |
| `rm-030` Etrusca disciplina | 6 | 5 → 7 | Four Persée sources replaced. **"Latin version c. 56 – 44 BCE" had no source for those years**; the line now dates the Piacenza liver and Cicero's *On Divination* (45 – 44 BCE). Tages told as Cicero's report of the Etruscans' own tale. The Seneca, Livy and sarcophagus claims dropped with their sources. |

**Not usable from here:** Persée (first page only, though one B4 agent read a full PDF there), Cambridge
repository (embargoed or metadata only), PNAS (Cloudflare; Europe PMC 500), Livius.org (timeouts), EDCS (now
needs JavaScript), Springer (JS challenge; Europe PMC used), hrcak.srce.hr (bot check), polipapers.upv.es (TLS).

**Read by eye.**
- *Article:* "the Etruscan civilisation", "the Etruscan league", "the Etruscan language", "the Pyrgi Tablets"
  take "the" from the question; "Etruscan religion", "haruspicy", "Etruscan origins" and "Etruscan cities"
  bare; "the Etrusca disciplina" takes it.
- *Confusability:* the Etruscan cards share vocabulary; each question names what only its term has (Rasenna
  for the civilisation, Hellanicus and Lemnos for origins, the plateaus and Marzabotto for the cities,
  Voltumna for the league, the dropped Greek letters and the linen book for the language). `rm-029` and
  `rm-030` both use the Piacenza liver on the date line, but only `rm-029` asks about it.
- *Overlap with `gr-`/`wh-`:* `wh-337` Etruscan civilisation starts c. 800 BCE where `rm-022` now starts
  c. 1000 BCE (Potts and Smith: a distinct community from the start of the 1st millennium); `wh-337` also asks
  the Herodotus/Dionysius question, so `rm-023` leads with Hellanicus, Lemnos and the genomes. Read
  together when `wh-337` is refined.
- *Chronology:* `rm-024`'s move to plateaus (c. 1020 – 900 BCE) starts before the Villanovan row (c. 900)
  — the two sources date the Final Bronze Age differently, and the rows say whose each is.

**Locators.** All kept. `rm-037`'s agent (B4) notes that a craft card carries an Etruria region locator it
does not need; left for the B4 entry.

### B4 — `rm-031`–`rm-040`, Italy before Rome: Etruscan cities and crafts (2026-10-04)

Run as B3; B5's agents researched alongside. Pictures untouched; verdicts in "Pictures to redo".

Checks: `rm-audit.js --range=rm-031:rm-040` reads clean on three cards. The rest are `W.not-why` notes on
five cards (FAQs opening "What", "How", "Where"), `I.caption-source` on `rm-037` (its current picture's desc
says "public domain"; a picture-pass fix) and **a false `I.duplicate` on `rm-034` and `rm-040`**: their
pictures' thumbnail URLs end in `1920px-thumbnail.jpg`, and the audit keys a picture by its last URL segment,
so every such card (twenty across the site, among them `gr-895`) looks like one picture. Reported, not fixed
here: the fix belongs in `greece-audit.js`, keying on the file-name segment before `thumbnail.jpg`.
`check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass;
every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-031` Etruscan tomb painting | 6 | 5 → 7 | **Four French articles on Persée broke the one-per-language cap**, and their full texts would not open; every claim resting only on them (the shrubs as a sacred precinct, the Augurs' false door, the François Tomb scene, the Charun description) is gone. Line: painted c. 675 – 200 BCE. Tarquinia's four-fifths share and the under-3-per-cent painted figure added. |
| `rm-032` Tarquinia | 6 | 5 → 8 | **"Gave Rome the Tarquins" is Livy's tradition** and is told as such (Demaratus and Lucumo). "200,000 finds" and "510–470 BCE" at Gravisca had no source; the *municipium* claim likewise. The Roman colony at Gravisca, 181 BCE, is now Livy 40.29. |
| `rm-033` Caere | 5 | 5 → 6 | **Herodotus 1.167 has Delphi order the Caeretans to honour the stoned Phocaeans with rites, games and horse races**; the old card said it ordered a sanctuary. The Athenian colony, the Caeretan hydriae (an old question rested on them) and the years 353 and 390 BCE had no readable source. Locator re-resolved on Cerveteri (it was the necropolis's point). |
| `rm-034` Banditaccia necropolis | 5 | 5 → 6 | Five old sources on Persée; tomb regulation, the Campana dispersal and the inscriptions had no source that opens. **The old line dated nothing**; now in use c. 900 – 200 BCE, the Sarcophagus of the Spouses c. 530 – 520 BCE, World Heritage 2004. |
| `rm-035` Veii | 6 | 5 → 7 | **"Among the oldest Etruscan walls" at Piazza d'Armi**: Potts and Smith say those walls are now thought medieval; the wall dates are a hedged FAQ. 396 BCE labelled tradition. The 190 ha and 9 km figures, the Fabii, the Delphi krater and the 46 BCE veterans had no source that opens. A question carried a year. |
| `rm-036` Vulci | 5 | 5 → 5 | **The Lyon tablet names only Caelius Vivenna, not "the Vibenna brothers of Vulci"**; the Vulci link rests on a restored text of Festus and the François Tomb. The tomb is 340 – 310 BCE in its source, not 350 – 325. The 1828 Bonaparte finds and the gods list dropped. |
| `rm-037` Etruscan bronzework | 6 | 5 → 7 | **"Travelled further than anything else the Etruscans made" had no source.** The tin-mine paragraph and its question went with pages that would not fetch. The beaked-jug figures (about 150 in Italy, over 100 outside, most 525 – 400 BCE) re-read and kept; bossed basins, Vulci's workshops, the metal trade with southern France, mirrors and Pliny on Volsinii added. |
| `rm-038` bucchero | 5 | 6 → 6 | **The firing temperature was 600 – 700 °C; Longoni 2023 gives a maximum of 750 – 800 °C**, in a reducing firing. An unsourced "5th – 4th century" row and the clamp or pit-kiln claim dropped. Line: c. 700 BCE / 680 – 630 BCE. |
| `rm-039` Apollo of Veii | 6 | 5 → 7 | **"Dismantled and ritually buried c. 300 BCE" had no source**, nor the assembly marks, "twenty acroteria", "first Tuscan-type temple" or the Pindar bronzes. The date is the museum's 510 – 500 BCE, not c. 500; Found 1916 added; the Menerva dedication and the Niobe reading (hedged) added. A locator on the Portonaccio sanctuary added. |
| `rm-040` Etruscan Campania | 5 | 5 → 7 | **The 438 BCE "Campanian oath" and "writing began c. 700 BCE" had no source.** Line: Pontecagnano c. 900 BCE, the Tabula Capuana c. 470, Capua falls 423 (one modern dating, said so). **The draft stated Pontecagnano's founding by Villanovan groups as fact; its own source says "reportedly" and that some see a local growth, as `rm-008` already does.** Corrected by hand in the abstract, a question and the glossary before applying. |

**Not usable from here:** Persée (only one agent reached a full PDF), the Cambridge repository, De Gruyter.

**Read by eye.**
- *Article:* the city names, "Etruscan tomb painting", "Etruscan bronzework", "bucchero" and "Etruscan Campania"
  bare; "the Banditaccia necropolis" and "the Apollo of Veii" take "the".
- *Confusability:* `rm-031`, `rm-032` and `rm-034` share tombs; each question names what only its term has
  (the cloth ceilings and Tarquinia's share for painting, the Ara della Regina and Demaratus for Tarquinia,
  the Five Chairs and the Sarcophagus of the Spouses for the Banditaccia). `rm-033` and `rm-042` share
  Alalia; `rm-033`'s question asks about Delphi's order and the games, not the battle. `rm-036`'s first two
  phrasings both use Mastarna and Vibenna (identity, then the tomb).
- *Consistency:* `rm-040` brought into line with `rm-008` on Pontecagnano (above).

**Locators.** `rm-033` (Caere, on Cerveteri) and `rm-039` (Portonaccio sanctuary, Veii) through
`add-locators.js`; the rest kept. `rm-037` (a craft) keeps an Etruria region locator it does not need.

### B5 — `rm-041`–`rm-050`, Italy before Rome and the first of the kings (2026-10-04)

The first run of B5 and B6 died when the session hit its usage limit (all ten agents stopped before
writing a draft); both batches were relaunched after the reset. Otherwise run as B4.

Checks: `rm-audit.js --range=rm-041:rm-050` reads clean on four cards; the rest are `W.not-why` notes on
four cards, `rm-048`'s missing picture and `rm-045`'s picture shared with `wh-339`. `check-questions`,
`check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations
--card` 0 mismatched on every card. **Two citation URLs did not answer at apply time** (connection dropped,
twice each): the Velia press release on cultura.gov.it (`rm-042`) and the Colosseum Archaeological Park's
Palatine page (`rm-049`). Both were fetched earlier in the run, their saved text holds every quoted passage,
and they are kept; re-curl them when next touched.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-041` Etruscan sea power | 6 | 7 → 8 | The Persée and OpenEdition sources could not be fetched; the Gravisca inscriptions and their date row, piracy as a Greek invention, Genoa and Provence went with them. **474 BCE for Cumae was cited to Diodorus, who gives an archon year**; a modern source now carries it. The Giens wreck's figures come from the excavators' own report. Two phrasings carried dates. |
| `rm-042` Battle of Alalia | 6 | 6 → 8 | The Aléria claims on unfetchable sources dropped. The line is c. 540 – 535 BCE, as on `rm-033`, with Colonna's c. 545, the founding c. 565 and the Velia temple. **"Italic" helmets** is not what the source says; the reading of the helmets as offerings is credited to the park's director. The modern doubts added: where Herodotus got the story, sixty ships as a stock number, the view that the Greeks lost. A phrasing too close to `rm-033` replaced. |
| `rm-043` Magna Graecia | 7 | 5 → 7 | **"Taras leads c. 385 – 355" and "under Rome from c. 350" had no source**; the line is now the colonies c. 750 – 443 BCE and Tarentum's fall, 272. Written from Rome's side: Pliny's statues of Pythagoras and Alcibiades in the Comitium, Greek surviving at Naples, Velia and Rhegium, the cities that went over to Hannibal. A Gulf of Tarentum locator added. |
| `rm-044` Cumae | 7 | 7 → 7 | **The Aricia date (c. 504 BCE, worked out from 524) and Tarquin's death (495) are conversions of Livy's consular years that the sources make differently**, and are gone. The Campanian capture (421 – 420) and citizenship without the vote (338) added. The legends are Livy's and Dionysius's. The glossary's cited author was "Marina" Catucci; she is Margherita. |
| `rm-045` Etruscan influence on Rome | 7 | 9 → 9 | **Livy was cited four times** (cap 2). The Persée sources, "23 letters" and two unsourced rows are gone. The alphabet coming through the Etruscans is hedged against the Osteria dell'Osa inscription. The line is now Tarquin's accession (614 BCE, Dionysius's tradition), Veii 396 (tradition) and the Etruscans made citizens, 90 – 88. Questions moved off `rm-705`'s lictors, curule chair and toga. |
| `rm-046` Roman Kingdom | 8 | 7 → 9 | **Livy was cited five times.** "244 years" and a "7th century" row came off the line, and "244" out of a question; the line is now 753 – 509 BCE (Varro, labelled tradition), 751 – 507 (Dionysius) and the Forum filled c. 650 – 600. **The old card and glossary stated as fact one scholar's view that Romans wrote history only from c. 200 BCE**; it is now one sceptical view. The archaeology is kept apart from the story. |
| `rm-047` Forum Boarium | 6 | 7 → 8 | **"First temples c. 650 – 550 BCE" was the span of a whole book chapter**, not this site; now c. 600 – 550 BCE (the source's "early 6th century"). The fire and rebuilding rows name their temples. The river harbour, the Late Bronze Age settlement and the Portunus temple added; Hercules, Cacus and Romulus's rite told as Livy's or tradition. An editor's name and a year no fetched page shows were cut from two citations. |
| `rm-048` Seven Hills of Rome | 8 | 5 → 8 | **"The list of seven came later" and a census figure had no source.** Strabo's and Livy's accounts of the kings walling the hills are tradition; the volcanic tuff, the Iron Age burials and the ancient dispute over which seven are added. No date line (a geographic feature, `undatable`). |
| `rm-049` Palatine Hill | 8 | 5 → 9 | **"Perhaps 378 BCE" for a fort rested on a guess in Platner and Ashby.** The line is now Carandini's north-west wall (c. 775 – 750 BCE, labelled disputed) and the 6th-century wall. Livy was cited three times; now twice. The augury and the fortifying are Livy's. |
| `rm-050` Capitoline Hill | 8 | 5 → 9 | Livy was cited four times. The head-in-the-foundations question was `rm-075`'s and the geese `rm-126`'s; both replaced. Tarpeia is Plutarch's. The line is now settlement c. 1500 – 600 BCE, the temple's dedication (tradition, 509), the Gallic siege (390) and the burning of 83 BCE. |

**Read by eye.**
- *Legend as legend:* Tarquin's accession (`rm-045`), the seven kings (`rm-046`), Hercules and Cacus (`rm-047`),
  the kings walling the hills (`rm-048`), Romulus's augury (`rm-049`) and Tarpeia (`rm-050`) are each told in
  an ancient author's voice; `rm-046` keeps the excavated Forum separate from the story.
- *Confusability:* `rm-041`, `rm-042` and `rm-033` all touch Alalia; each now asks something only it has (the
  sea names and Giens for sea power, the forty lost ships and Velia for the battle, Delphi's order for Caere).
  `rm-049` and `rm-050` asked about `rm-075` and `rm-126`'s subjects and no longer do.
- *Overlap with `gr-`/`wh-`:* `gr-215` dates the Campanian capture of Cumae 421 BCE, `rm-044` 421 – 420
  (Livy's 420 reported by Smith); `gr-223` agrees with `rm-043` but for its start date; `wh-339` agrees on
  753 – 509 BCE but puts counts on its date line (a fault for its own audit).

**Locators.** `rm-043` gained a Gulf of Tarentum point (a drawn region would be better). The rest kept theirs.

### B6 — `rm-051`–`rm-060`, Rome under the kings: the founding legends (2026-10-04)

The batch the audit's fourth fault was written for. Every card is a legend or a date reckoned from one, and
every one told it as history: Livy was cited up to four times a card, and five cards had no modern source.
Run as B5, relaunched after the usage limit.

Checks: `rm-audit.js --range=rm-051:rm-060` reads clean on six cards; the rest are `W.not-why` notes on three,
the false `I.duplicate` on `rm-053` (the B4 thumbnail key), and `S.chip?` on `rm-055`, an English BMCR review
of a book with an Italian title — the proxy the Greece audit already documents as misfiring there.
`check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass;
every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card.

**The apply stopped at `rm-055`**: its `leadsTo` pointed at `rm-056`, which the new date lines put *earlier*
(c. 1050 BCE against c. 600 BCE), and `add-card.js` refuses a link that runs backwards. The link (Alba
founded thirty years after Lavinium) was itself a legendary count, so it was deleted with
`add-card-links.js` (`leadsTo: null`) and the last six cards re-applied. `precheck.js` did not catch it.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-051` casa Romuli | 6 | 6 → 8 | **"The rite got out of hand" and "the fire sent the Romans to the Sibylline books" are not in Dio**, who lists the hut fires among portents; nor does he say which hut burned in 38 BCE, so the card says "a hut of Romulus". A year out of a question; a "4th century CE" row off the line. The Palatine huts are a separate sentence that proves nothing about Romulus. |
| `rm-052` founding of Rome | 9 | 5 → 10 | The line is now 21 April 753 BCE labelled tradition (Varro's, in prose), Cato's 751 and a single state c. 700 – 600 BCE. Four years out of a question. **The Palatine wall as confirmation of the legend is one excavator's view**, set against reviewers who deny it. |
| `rm-053` Romulus and Remus | 9 | 6 → 10 | **The old card had one ending, Remus killed for leaping the wall; Livy gives two** (killed in the brawl over the omens, or for the leap), and both are in. "By the 290s" (a decade) is now First attested 296 BCE, the Ogulnii's statue group. Told in Livy's and Plutarch's voice. |
| `rm-054` Capitoline Wolf | 8 | 5 → 9 | **The old card treated the medieval date as settled.** The museum and Colonna still date it to the 5th century BCE; Carruba's single-piece casting and Martini and Galli's clay dates put it in the 8th – 14th centuries CE. Both are on the line and in prose, with whose each is. An unsourced "radiocarbon 2007" cut. |
| `rm-055` Aeneas | 9 | 6 → 10 | **"Troy falls 1183 BCE" and "Alba founded 30 years after Lavinium" were the line**: a mythical figure takes no dates. The line now dates the evidence for him in Italy (Etruscan images c. 600 – 400 BCE, Caesar's coin 47 – 46 BCE). All six old sources were ancient; now 3 of 10. The `leadsTo` link above deleted. |
| `rm-056` Alba Longa | 7 | 6 → 7 | **"After 753 BCE"** is gone; the line is the Latin culture (c. 1050 – 950 BCE, as on `rm-010`) and the fall under Tullus, c. 672 – 640 BCE by tradition. Livy's manuscripts read *Tullii* where the Loeb prints the editor's *Julii*; the card says so. |
| `rm-057` ab urbe condita | 7 | 5 → 9 | Two phrasings carried 47 CE and 753 BCE. **"April 248"**: no source gives the month; now 248 CE. "The era belonged to scholars, not clerks" had no source. Varro's method (Censorinus 21) and the rival founding years (Fabius, Cato, Polybius, Timaeus, from the Loeb notes to Dionysius 1.74) added. |
| `rm-058` rape of the Sabine women | 8 | 5 → 10 | "753 BCE or a few years after" and "683, on one count" replaced by Traditional 753 BCE. **The draft also gave "Also dated 750 BCE"**, its own conversion of Gnaeus Gellius's "fourth year of Romulus" through Varro's era; no source prints 750, so it was cut by hand before applying. |
| `rm-059` Titus Tatius | 7 | 6 → 9 | **"5 years, after 753 BCE / in the 6th year" dated nothing**, and no source gives Tatius a year of his own: the line is now empty. Each act is Livy's, Dionysius's or Plutarch's, and where they differ the card says whose is whose. A modern doubt that Rome ever had a joint kingship added. |
| `rm-060` Romulus | 9 | 6 → 10 | **No fetched page gives 716 BCE** for his end; the line is Traditional 753 BCE, and the prose names Varro's 753 and Cato's 751. The counts (37 years, aged 54 or 55) are in prose. Few historians accept him as historical, and the 8th-century Palatine wall is one excavator's disputed claim. Questions moved off `rm-082` and `rm-083`. |

**Read by eye.**
- *Legend as legend:* every one of the ten; the archaeology of the Palatine (`rm-051`, `rm-052`, `rm-060`) is
  in its own sentences and never offered as proof.
- *Confusability:* `rm-052`, `rm-053` and `rm-060` all carry 753 BCE; their questions ask about the rite and
  the year's reckoning, the twins' upbringing and Remus's death, and Romulus's asylum and disappearance.
- *Overlap with `wh-`:* `wh-338` gives 753 BCE and the vultures, agreeing with `rm-052`, but does not say
  the year is Varro's; read together when `wh-338` is refined.

**Locators.** All kept.

### B7 — `rm-061`–`rm-070`, Rome under the kings: Numa to Servius (2026-10-04)

Run as B6, with B8's agents alongside. Agents were told, after B6, never to convert a regnal year into a BCE
year themselves: each reign on these cards is the span a source prints.

Checks: `rm-audit.js --range=rm-061:rm-070` reads clean on nine cards; `rm-069` keeps a `Q.sibling` lead
(44 per cent of a phrasing's content words shared with `rm-036`, both on Claudius's Mastarna) — read by eye:
the blank takes a king on one and a city on the other. `check-questions`, `check-cards`, `check-style`,
`check-docs`, `split-cards --check`, `test-card-plans` pass; every citation URL answers 2xx;
`check-citations --card` 0 mismatched on every card.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-061` Numa Pompilius | 7 | 5 → 8 | **"715 – 673 BCE" is printed by no source opened**; the line is Traditional 715 – 672 BCE (Foster's Loeb Livy, Fulminante), with Dionysius's 713 in prose, and the books found in 181 BCE. Two count rows ("43 years", "aged over 80") into prose. All five sources were ancient. The modern doubts added: the regal dates, Egeria perhaps Ennius's invention, the Pythagoras tale late. A century out of a question. |
| `rm-062` calendar of Numa | 6 | 5 → 7 | "After 753 BCE" cut; the line is Numa's traditional reign, the painted calendar of Antium (84 – 55 BCE) and its replacement on 1 January 45 BCE. Counts into prose; recent work dropping the ten-month year covered. **The Censorinus citation named the wrong editor** (the page is Cholodniak's 1889 Latin text) and lacked its language chip. |
| `rm-063` Tullus Hostilius | 7 | 6 → 8 | **"673 – 642 BCE" is printed by no source opened**; now Traditional 672 – 640 BCE (the Loeb Livy's margins), as `rm-056` and `rm-064` have it. Livy was cited five times. **The old card said Dionysius reports the arson story; he also rejects it**, and a FAQ says why. |
| `rm-064` Horatii and Curiatii | 7 | 5 → 9 | "After 753 BCE" and "1 of the 6" off the line; now Tullus's traditional reign. The fetial-treaty material left for its own card. **The glossary's "the earliest such appeal Livy records" is not in Livy.** The festival-performance view, the Horatii's monuments and David's invented oath scene added. |
| `rm-065` Ancus Marcius | 7 | 5 → 7 | **"642 – 617 BCE" is printed by no source opened**; now Dionysius's 638 BCE accession and Ostia's traditional 620. **"Salt pits on both banks"**: Livy says only that there were salt-works nearby. Nothing at Ostia is that early (its walled fort is 4th or early 3rd century BCE), and the card says so. |
| `rm-066` Tarquinius Priscus | 7 | 5 → 7 | **All five sources were Livy.** The line is Traditional 616 – 579 BCE and Dionysius's 614 accession, as on `rm-045`. **"The first king from outside Latium"**: Livy makes him the third foreign king. Claudius's Lyon tablet and the absence of a building boom under the first Etruscan kings added. A phrasing overlapping `rm-867` and `rm-068` replaced. |
| `rm-067` Cloaca Maxima | 7 | 5 → 8 | "After 753 BCE" cut; the line carries only archaeology (oldest walls c. 550 – 500 BCE, vaulted after 200, the mouth's arches c. 100, Agrippa's survey 33 BCE). **"Little if anything of the first drain survives" was one 1929 view**; later masonry studies date an open stone-walled channel to the late 6th century, and the card gives both. Livy and Pliny ascribe it to different Tarquins, and the questions say whose is whose. |
| `rm-068` Circus Maximus | 8 | 5 → 8 | "After 753 BCE" cut; the line is the starting gates (329 BCE), Caesar's enlargement (46 BCE), the fire of 64 CE and Trajan's reopening (103 CE). The later history the old card left out added; the disputed seat counts given as disputed. |
| `rm-069` Servius Tullius | 7 | 5 → 7 | **"578 – 535 BCE" had no source for 535**; now Traditional 578 – 534 (Foster's Livy) and Dionysius's 576 accession. Count and prose rows off the line. The birth legends are Livy's and Dionysius's; the modern views on his origin and Claudius's Mastarna added. |
| `rm-070` Servian constitution | 7 | 6 → 7 | **The audit's third fault exactly: one king's programme presented as fact.** "After 753 BCE" and the count rows gone; the line is Servius's traditional reign and a possible reform of 241 BCE. Each modern view is given to the scholar who holds it (no source opened supports "most scholars"). |

**Read by eye.**
- *Two reckonings for the regal years.* Numa, Tullus and Servius follow the Varronian years printed in
  the Loeb Livy; Ancus follows Dionysius (638 BCE), since no opened source prints a Varronian year for
  him; Priscus a common modern reckoning, with Dionysius's 614 beside it. Every row is labelled and the
  prose says whose; `docs/rome-chronology.md` carries both. **`rm-083` and `rm-085` still print Tullus as
  673 – 642 BCE**, a figure no source gives — for B9.
- *Overlap with `wh-`:* `wh-339` says flatly that Servius's mother was a slave; `rm-069` gives it as one
  ancient version among several.

### B8 — `rm-071`–`rm-080`, Rome under the kings: the Servian state to the first consuls (2026-10-04)

Run as B7. Applied with `rm-078` ahead of `rm-077` (by hand rather than `batch.sh`), because `rm-077`'s link
to `rm-078` is checked against `rm-078`'s date line and the shipped one still read "after 753 BCE".

Checks: `rm-audit.js --range=rm-071:rm-080` reads clean on six cards. **`rm-074` had a phrasing sharing
80 per cent of its content words with `rm-044`'s** (Tarquin's death at Cumae, in the same words of Livy);
it was rewritten from the card's own background (the first king to make war and treaties without the senate)
and re-applied. Left as leads, read by eye: `rm-078` against `rm-046` (44 per cent; both have the last king
shut out of Rome, but one blank takes the kingdom and the other its expulsion), `rm-071`'s picture shared
with `wh-343`, and `W.not-why` on four cards. `check-questions`, `check-cards`, `check-style`, `check-docs`,
`split-cards --check`, `test-card-plans` pass; every citation URL answers 2xx; `check-citations --card`
0 mismatched on every card.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-071` comitia centuriata | 6 | 6 → 7 | "The reign of Servius Tullius, after 753 BCE" and the counts (193, 244 years) were the line; it is now the first consuls (509 BCE, tradition) and the reform of 241 – 218 BCE (Botsford's reading of Livy, with an Augustan dating as another view). Servius as founder is what Roman writers said; the gradual growth of the 193 centuries is one modern view. Kept to how the assembly worked. |
| `rm-072` Servian Wall | 7 | 5 → 7 | **"Rebuilt from 377 BCE" was Platner's year for the war tax**; the Loeb margin at Livy 6.31 gives 378. The line is now the earliest wall c. 600 – 500 BCE, the rebuilding from 378 and the repairs of 353. Servius as builder is tradition; the Grotta Oscura wall is after the Gallic sack; Bernard's doubt that one wall ringed all the hills before the 4th century added. |
| `rm-073` Roman census | 8 | 5 → 9 | "After 753 BCE" and counts on the line; now the censors from 443 BCE, Augustus's first census (28 BCE) and the last lustrum (74 CE). Servius's census is tradition, and the 80,000 and 84,700 are Livy's and Dionysius's figures. The *Res Gestae* cited as the inscription it is. Two questions fitting `rm-893` and `rm-117` rebuilt. |
| `rm-074` Tarquinius Superbus | 7 | 6 → 9 | **"535 – 509 BCE": no source opened prints 535**; the line is Dionysius's 532 – 507 (as his translator converts it) and the usual end, 509. The counts (25, 244) are in prose. Livy was cited four times. His death at Cumae and the modern doubts added. One phrasing rewritten at apply time (above). |
| `rm-075` Temple of Jupiter Optimus Maximus | 7 | 5 → 7 | **All five sources were ancient, and the omen and the expulsion were stated as fact (glossary too).** The vowing, the Terminus story, the head and Horatius's dedication are Livy's. The line is built c. 550 – 500 BCE (pottery from the foundation trench, per the Capitoline Museums), dedicated 509 by tradition, burnt 83 BCE, 69 and 80 CE. The 55 × 60 m base is the museum's figure; the smaller-temple reconstruction is a modern debate. |
| `rm-076` Sibylline Books | 7 | 5 → 8 | "After 753 BCE" and counts of books and keepers off the line; now the college enlarged c. 367 BCE, the books burnt in 83 and moved to the Palatine in 12 BCE. The sale to Tarquin is Gellius's and Dionysius's story; no source opened prints a traditional year for it, so there is none. |
| `rm-077` Lucretia | 7 | 5 → 9 | "After 753 BCE" is now Traditional 509 BCE. Ovid's Regifugium version, the absence of any source from her own time, *pudicitia* and Augustine's verdict added; the story is Livy's. |
| `rm-078` expulsion of the kings | 7 | 5 → 8 | "After 753 BCE" and counts; now Traditional 509 BCE and Dionysius's 507. Polybius's first treaty and the censorian records added as the evidence that Romans dated the event; Wiseman's and Armstrong's views given as theirs. Its link to `rm-080` (same year) dropped; the link to `rm-091` kept. `wh-340` prints 509 without the traditional label. |
| `rm-079` Lucius Junius Brutus | 7 | 6 → 8 | "After 753 BCE"; now Traditional 509 BCE, Dionysius's 507 and the 54 BCE denarius of Marcus Brutus. Livy was cited five times; every act is now Livy's or Dionysius's, Cicero's version is set against theirs, and the legend's growth is described. |
| `rm-080` rex sacrorum | 6 | 5 → 8 | The office's creation at the end of the monarchy is Livy's and Dionysius's explanation, against one modern view that it existed under the last kings. The bar on office and on addressing the people, the first holder Manius Papirius, and an inscription from Histonium (EDR175972, 43 – 70 CE) added. |

**Read by eye.** *Legend as legend:* Lucretia, Brutus, the expulsion and the Sibyl's sale are each the
ancient author's. *Confusability:* `rm-077`–`rm-079` share one night; each blank takes a different term
(the woman, the event, the man). *Consistency:* 509 BCE is labelled tradition on all five cards that carry it.

### B9 — `rm-081`–`rm-090`, Rome under the kings: the institutions and the Forum (2026-10-04)

Run as B8, with B10's agents alongside. Checks: `rm-audit.js --range=rm-081:rm-090` reads clean on five cards;
the rest are `W.not-why` notes and the false thumbnail `I.duplicate` on `rm-083` and `rm-086`. `check-questions`,
`check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; every citation URL
answers 2xx; `check-citations --card` 0 mismatched on every card.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-081` comitia curiata | 6 | 5 → 8 | "After 753 BCE" and counts off the line; now Romulus's traditional reign and 63 BCE, when Cicero says thirty lictors stood in for the assembly. **"Sixteen curiae a majority" and "by the Punic Wars" rested only on Smith's 1875 Dictionary**, and are gone. The comitium excavation (early 7th century BCE) added as archaeology. |
| `rm-082` patres | 6 | 5 → 7 | **The old card said Livy and Dionysius both put the rise to 300 senators under Tarquinius Priscus**; each is now given as he tells it. Foster's note that the *patres*/*conscripti* split may be Livy's misunderstanding added. |
| `rm-083` patricians | 8 | 6 → 10 | **"Fewer than 50 families" came from Smith citing Dionysius 1.85, which is about families of Trojan descent**, not patricians; gone. The unsourced "c. 673 – 642 BCE" for Tullus is now 672 – 640 by tradition, as on `rm-063`. The theories of the orders are each given to their holders. Smith's Dictionary article credited to its author, Leonhard Schmitz. |
| `rm-084` plebeians | 8 | 6 → 9 | **Niebuhr's 19th-century reconstruction was told as fact**; it is one view beside Cornell's and C. J. Smith's. The line is Romulus's traditional reign, the first secession (494 BCE) and the Hortensian law (287 BCE). |
| `rm-085` gens | 7 | 6 → 8 | **"300 clans, the figure the sources use" is Niebuhr's inference from Dionysius 2.7**, as Smith's Dictionary itself says: a modern idea given as ancient fact, and gone (from the glossary too). The unsourced "c. 673 BCE" and "after 753 BCE" gone; the line is the Twelve Tables, 451 – 450 BCE by tradition. |
| `rm-086` cognomen | 7 | 5 → 7 | **The old background was mostly about the first name, not the cognomen**, and its line held counts and an unsourced "c. 642 – 617 BCE" Lucumo row. Now undated (`undatable`). The Scipio Barbatus epitaph added as inscriptional evidence. |
| `rm-087` pomerium | 6 | 5 → 8 | "Round the Palatine, after 753 BCE" and Servius's reign as a date gone; the line is Traditional 753 BCE and the extensions of 49 and 75 CE and Hadrian's re-marking of 121 CE. **The Claudius and Vespasian boundary stones are cited from the open EDR records.** Tacitus (Sulla and Augustus only) set against Gellius (Caesar too). **The glossary cited Smith for a claim Smith does not make.** |
| `rm-088` Forum Romanum | 8 | 5 → 8 | **"Drained under Tarquinius Priscus, c. 616 – 579 BCE" and "7 iugera"** gone; Livy's and Dionysius's stories are tradition, set apart from the landfill dated c. 650 – 600 BCE. The line runs to the earthquake of 847 CE and the clearing from 1803. |
| `rm-089` Lapis Niger | 6 | 5 → 7 | **"c. 500 BCE" and "the oldest Latin writing"**: the newest excavation study dates the pillar c. 580 – 550 BCE and calls it Rome's earliest legal text; c. 500 kept as an older dating. The tomb stories (Festus, Dionysius) apart from the archaeology; *recei*, *kalator* and *sakros esed* added; the black paving is later, probably Sullan but disputed. |
| `rm-090` annales maximi | 6 | 5 → 8 | **"133 BCE" had no source.** The line is the 80-book edition, c. 130 – 120 BCE (Mommsen's view, defended by Forsythe, against Frier and Drews). How far back the record reached is given as a debate. |

**Read by eye.** *Legend as legend:* Romulus's curiae, senators and orders (`rm-081`–`rm-084`) and the
Lapis Niger's tomb stories are each the ancient author's. *Confusability:* `rm-081`/`rm-082` and
`rm-083`/`rm-084` are pairs; each phrasing names something only its own term has. *Chronology:* Romulus's
end year (717 BCE, Foster's margins) now stands on four cards; `rm-060` gives only his start, and agrees.

### B10 — `rm-091`–`rm-100`, the early Republic: offices and first wars (2026-10-04)

Run as B9. Applied in an order that puts `rm-096` ahead of `rm-092`, whose link to it is kept (both start in
509 BCE). Checks: `rm-audit.js --range=rm-091:rm-100` reads clean on seven cards; the rest are `W.not-why`
notes and `rm-094`'s picture shared with `wh-351`. `check-questions`, `check-cards`, `check-style`,
`check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched on every
card. One citation URL did not answer at apply time: the CRRO record of RRC 335/10a on numismatics.org
(`rm-099`), fetched earlier in the run with its date range and type saved; kept, re-curl when next touched.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-091` Roman Republic | 9 | 5 → 9 | 509 BCE labelled tradition and 27 BCE labelled a convention (the senate naming Octavian Augustus); two count rows into prose. The founding told as Livy's tradition; Varro's dating problem and the different views of when the Republic ended added. `wh-340` gives 509 – 27 BCE unlabelled with counts on its line. |
| `rm-092` consul | 8 | 5 → 8 | **"Named consuls from 305 BCE" was Smith citing Zonaras 7.19, which is about 449 BCE: 305 is the year from the founding, misread as a BCE year.** Gone. 153 BCE (office from 1 January) kept on a modern source. Lictors, fasces and the colleague's veto left to `rm-095` and `rm-096`. Two phrasings read wrongly with the singular answer in the blank ("the first two consul") and were reworded by hand. |
| `rm-093` Fasti Consulares | 6 | 5 → 8 | **The Regia as its site was stated as fact**; the debate is now named (Simpson for the Regia; Rose, the Capitoline Museums and `rm-046` for Augustus's arch). Two sentences on Flavius's calendar, the other meaning of *fasti*, cut. The early names are a reconstruction, with Lendering's charge that Varro padded the years. The inscription cited from the Capitoline Museums' record. |
| `rm-094` imperium | 7 | 5 → 8 | "From 509 BCE" and counts off the line; the concept is undated (`undatable`). The kings' curiate laws are what Cicero says. |
| `rm-095` fasces | 8 | 5 → 8 | The line held lictor counts and an unlabelled 509; now the Vetulonia tomb (c. 700 – 600 BCE) and the state emblem of 1926. **The Etruscan origin is what Livy 1.8 and Dionysius 3.61 report**; the Vetulonia find is separate, with a study arguing that modern restorers assembled the bundle. A phrasing telling Valerius's lowered fasces in the card's voice now opens "Livy says". |
| `rm-096` collegiality | 7 | 6 → 7 | Count rows off the line; now Traditional 509 BCE. The colleague's veto, Livy 2.1, 2.18 and 2.44, Tiberius Gracchus deposing Octavius, the later revivals and the modern debate on its purpose added. |
| `rm-097` Horatius Cocles | 7 | 7 → 8 | **All seven sources were ancient** (Dionysius three times). Count rows gone; Traditional 508 BCE, the Loeb Livy's margin. Both endings: Livy has him swim to safety, Polybius has him drown on purpose. The glossary no longer treats him as a historical person. A phrasing in the card's voice now opens "In Livy's story". |
| `rm-098` Lars Porsena | 6 | 7 → 8 | All seven sources were ancient (Livy four times). Traditional 508 – 507 BCE. **The version in which Porsena took Rome** is Tacitus's and Pliny's, reported as theirs. |
| `rm-099` Battle of Lake Regillus | 6 | 6 → 7 | Livy was cited three times. The twin horsemen are Dionysius's (Livy leaves them out). The line gives Livy's 499 and Dionysius's 496 (tradition) and the Castor temple's dedication, 484. **"Coins four centuries later"** is the coin record's own 95 – 92 BCE. The lake's site is uncertain; the locator kept as approximate. |
| `rm-100` Foedus Cassianum | 5 | 5 → 7 | All five sources were ancient. Traditional 493 BCE, as on `rm-011`, lasting until the Latin War. **"Four centuries" of the bronze column was a figure no source gives.** Bringmann's mid-4th-century dating (on `rm-011`) is not on this card: its agent dropped the English review because of the audit's language-chip false positive, and the addendum now says not to; worth restoring when the card is next touched. |

**Read by eye.** *Legend as legend:* Horatius, Porsena, Mucius and the Dioscuri are each an ancient author's.
*Confusability:* `rm-092`, `rm-094`, `rm-095` and `rm-096` are one cluster (consul, imperium, fasces,
collegiality); each phrasing names what only its term has, and `rm-092` gave up its lictor and veto
clues to the siblings.

### The first hundred, in sum

`rm-001`–`rm-100` (Italy before Rome, Rome under the kings, the first of the early Republic) are done:
537 sources became 767, every card's Think-it-through was written fresh with markers, and 89 glossary
entries were rewritten. `rm-audit.js --range=rm-001:rm-100` now reads 62 of 100 cards clean; what remains is
26 `W.not-why` notes (an FAQ opening "How" or "Who"), 8 picture duplicates (most the false thumbnail key),
3 cards with no picture, 4 sibling leads read by eye and one language-chip false positive. Every picture is
still the bulk-written one; the "Pictures to redo" table holds a verdict for all hundred.

What the hundred found, again and again:
- **Legend told as history, and dated as if recorded.** "After 753 BCE" stood on some twenty date lines; every
  one is gone, and every regal or early-Republic year is now labelled tradition with whose reckoning it is.
- **Years no source prints.** 716, 673 – 642, 642 – 617, 535, 305 and others: a bulk-written card's regnal span
  is to be distrusted until a page is found that prints it. One (305) was an AUC year read as BCE.
- **Livy as the whole source.** Most cards cited only ancient authors, Livy up to five times; the ancient-author
  cap and the half-modern rule moved every card onto modern scholarship.
- **A modern scholar's inference as ancient fact.** Niebuhr's 300 clans and his plebeian reconstruction, a
  single excavator's Palatine wall, one genetics paper's Umbrian identity.
- **Persée.** A large share of the old sources sat on Persée, which this sandbox cannot open; every claim
  resting only there was re-sourced or dropped.

### B11 — `rm-101`–`rm-110`, the early Republic: the Conflict of the Orders to the dictator and the Twelve Tables (2026-10-15)

Run as B10: two cards to an agent, five agents a batch. Branched from `origin/main` (PR #423, the first hundred, is merged). Checks: `rm-audit.js --range=rm-101:rm-110` reads clean on six cards; the rest are `rm-102`'s `I.caption-source` (the word "commons" in the old picture's description), two cards with no picture, `rm-105`'s language-chip false positive (an English BMCR review of a French-titled book) and `rm-110`'s picture shared with `wh-342`. `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. Nine Wiley chapter DOIs (Raaflaub's volume on `rm-101` and `rm-102`) answer 403 to a script, as every Wiley link does here; Crossref confirms each, and the text was read in an archive.org scan, so they are tagged `[Paywalled]`. The leadsTo texts of `rm-101`–`rm-103` were reworded to say "by tradition" or name the author.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-101` Conflict of the Orders | 7 | 11 → 9 | Livy had nine chapters; now two, with Raaflaub, Cornell, von Ungern-Sternberg and Koptev. **The old "plebeian consul 367 BCE, L. Sextius" row gave the year of the laws for the consulship (366).** The line is Traditional 494 – 287 BCE and the breakthrough of 367 BCE; whether it was one struggle at all is given as a debate. Phrasings with "two centuries" gone. |
| `rm-102` first secession | 7 | 6 → 8 | Told as Livy's and Dionysius's story: Livy's Sacred Mount against Piso's Aventine, Livy's tribunes against Dionysius's five, Menenius Agrippa's fable "by Livy's report". The old `leadsTo` to `rm-100` said Livy sets the treaty "in the middle of the secession"; now the same consular year. |
| `rm-103` tribune of the plebs | 8 | 7 → 9 | "The ancient writers agree there were two at first" was untrue (Dionysius has five); Livy's, Dionysius's and the moderns' counts are each given. **The one-mile limit was credited to Livy as the consuls' remark; it is Livy's narration of what the tribunes feared (3.20).** Line: Traditional 494 BCE, ten tribunes 457 BCE by tradition, Octavius ousted 133 BCE. |
| `rm-104` sacrosanctity | 7 | 5 → 7 | The oath and the 449 law are Dionysius's and Livy's, not events; the "bargain between the orders" claim and "four centuries" in a question gone. The 131 BCE case of the tribune who tried to throw a censor from the rock added from Botsford. |
| `rm-105` concilium plebis | 6 | 7 → 7 | **Laelius Felix's rule (a part-of-the-people meeting is a *concilium*, its vote a *scitum*) was told as law; it is a jurist quoted by Gellius, and late-Republican writers did not keep it.** Volero's law is Livy's story. Who could vote is a modern disagreement. |
| `rm-106` aedileship | 7 | 6 → 7 | **"Curule pair 367 BCE, with the praetorship" gave the year of the laws, not of the office**: now 366 BCE (Abbott). Aediles named from Ceres' temple on one account (Dionysius: overseers of sacred places). The sacrosanctity dispute moved to `rm-104`. |
| `rm-107` Coriolanus | 8 | 9 → 8 | A legend, now "Livy tells", "Plutarch has", with Forsythe's and Salmon's views (a Volscian advance with a native leader; surnames from a conquered town unknown before the late 4th century BCE). Livy, Plutarch and Dionysius each give a different death. Traditional 493 BCE. |
| `rm-108` Cincinnatus | 8 | 7 → 8 | Livy was five of the seven sources. **The 458 tale is argued to be built from rescue stories and the second dictatorship (439) from the Maelius affair**; "standing ideal", an iugera area and "180" gone. |
| `rm-109` Roman dictator | 8 | 5 → 8 | **The old line gave a 449 BCE law ending freedom from appeal; Smith's own text calls the date undetermined**: cut, and the question is left open. The first dictator is Livy's 501 BCE (Larcius or Cloelius, and Dionysius three years later). Sulla's and Caesar's dictatorships told as breaks with the office. |
| `rm-110` Twelve Tables | 8 | 9 → 8 | Livy had six of the nine sources. The Athens embassy is "Livy tells", with the dispute; the 454 BCE row cut. The fragments are cited as Gellius and Cicero quote them; about 105 provisions by one count; the order of twelve tables is a modern arrangement. |

**Read by eye.** *Legend as legend:* the secession, Menenius, Coriolanus, Cincinnatus and the Athens embassy are each an ancient author's. *Confusability:* `rm-103`/`rm-104`/`rm-105`/`rm-106` are one cluster around the tribunate; each phrasing names only what its term has, with the veto left to `rm-096`. *Chronology:* the plebeian consulship is 366 BCE on `rm-106` and `rm-101` (the laws, 367 BCE); `rm-083` still prints 367 for the consulship opening, and `rm-128` will say which. *Overlap:* `wh-342` gives the Twelve Tables as 451 – 449 BCE and agrees.

### B12 — `rm-111`–`rm-120`, the early Republic: the decemvirs to the siege of Veii (2026-10-15)

Run as B11, with B13's agents alongside. Checks: `rm-audit.js --range=rm-111:rm-120` reads clean on seven cards; the rest are `rm-111`'s missing picture, `rm-113`'s false thumbnail `I.duplicate` and `rm-117`'s picture shared with `wh-344`. `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. Three drafts carried a doubled full stop before every footnote marker (an agent habit that `precheck.js` does not catch); fixed before applying, and every later draft is searched for `..<sup`. `rm-116`'s third phrasing named an ancient annalist, which `check-cards` counts as a scholar, and was reworded. **No recent open-access scholarship could be reached for `rm-117` and `rm-118`: their modern half is Smith (1875), Greenidge, Abbott, Ramsay and Tighe, all out of copyright.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-111` decemvirate | 7 | 7 → 7 | Ancient 6 → 2, modern 1 → 5. Livy's story of a fair first board and a tyrannical second is told as his, with the scholarly split on the second board; the "120 lictors" count is Livy's and in prose. Traditional 451, 450 and 449 BCE. |
| `rm-112` Appius Claudius Crassus | 6 | 8 → 6 | Seven ancient sources → two; never called a tyrant in the card's voice; the Claudian pride, the Lucretia doublet and later fears are scholars' views. The "charge 1 only" row is prose. |
| `rm-113` Verginia | 7 | 7 → 7 | **Her death was stated as fact with "Killed 449 BCE"**; now Livy's and Dionysius's story, Traditional 449 BCE. Livy has her mother dead (3.50), which the old text contradicted. The Lucretia doublet is a debate. |
| `rm-114` Valerio-Horatian laws | 6 | 6 → 6 | **449 BCE is not claimed to have made plebiscites binding**; the three laws are Livy's, the acceptance and doubt views each given, and 339 and 287 BCE are "said repeated". The locator (the Campus Martius) is an inference and was kept. |
| `rm-115` Lex Canuleia | 6 | 7 → 6 | **Dionysius was cited for the law and never mentions a marriage law** (Forsythe); the card now says so and uses Livy's voice. The decemvirs' ban is a debated invention. |
| `rm-116` consular tribunes | 6 | 5 → 7 | The number of tribunes per period attributed to Forsythe (three, four from 426 and six from 405 on his reading); Livy's own doubt about which years had consuls; **the first plebeian tribune is Livy's, in a year the list gives as 400 BCE, which Mommsen is reported to have called an error**. |
| `rm-117` censorship | 7 | 5 → 7 | Four of five sources were Livy. **"Tribunes might be plebeian" as the motive was Smith's inference, not Livy's**; gone. Mamercus's law is 434 BCE (Greenidge, Ramsay) or 433 (Smith), and 435 is a rival date for the creation; counts off the line. |
| `rm-118` quaestorship | 7 | 5 → 7 | **"A seat in the senate" in 421 BCE was Smith's inference**, centuries too early; the "only office left open" words are the Icilii's, not Livy's. Tacitus's regal origin and Smith's contrary view are each attributed; eight before Sulla, twenty under him, forty under Caesar. |
| `rm-119` legion | 9 | 5 → 9 | The line printed counts as dates; now the one span a source gives for the change to maniples and Livy's Latin War setting. **The old questions were `rm-155`'s and `wh-344`'s, and a Polybius "fossil" claim no opened source confirms.** Ancient figures (3,000, 4,000, 4,200, 5,000 foot) are Plutarch's and Livy's. The span rests on a thesis (see below). |
| `rm-120` siege of Veii | 7 | 6 → 7 | Livy was cited five times. **"Executed the men who had fled" is Livy's "military punishment"**; the tale is Livy's and Plutarch's throughout, the Troy patterning and the Alban Lake tunnel are a modern view, and the archaeology (continuity at lower intensity) is kept apart. The 562 square kilometres is one estimate. |

**Read by eye.** *Legend as legend:* the decemvirs' two boards, Appius, Verginia, the Athens embassy and the Veii mine are each an ancient author's. *Confusability:* `rm-111`/`rm-112`/`rm-113` share one story, one episode each; `rm-114` and `rm-115` are laws about orders and marriage. *Carry-over:* `rm-119`'s "396 – 264 BCE" is a university thesis's summary and the weakest line on the date lines so far; read again if a better source appears. *Overlap:* no `gr-` or `wh-` card disagrees; `rm-119`'s old questions were duplicates of `rm-155` and `wh-344`.

### B13 — `rm-121`–`rm-130`, the early Republic: Camillus and the Gallic sack to the nobiles (2026-10-15)

Run as B12. Checks: `rm-audit.js --range=rm-121:rm-130` reads clean on all ten cards (every picture is the bulk-written one, still to be redone). `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card. `rm-127`'s first phrasing duplicated its third and was rewritten from the altar's site.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-121` Camillus | 7 | 5 → 7 | Livy x4 and no modern scholarship; now every act is Livy's or Plutarch's, and the line is Veii 396, exile 391 and the sack 390 BCE, each by tradition. Livy gives the fine of 15,000 asses; Plutarch converts it to 1,500 drachmas. **The old card merged two versions of "iron, not gold"**; Livy's, spoken to his men, is used. |
| `rm-122` stipendium | 6 | 6 → 7 | **Livy prints no BCE year for the first pay**; Forsythe and Smith's 1890 edition convert it to 406 BCE and the 1875 edition to 405 (each said in prose). Polybius's rates are reported as his, and as the army of his own day. The "sixteen years earlier" clue is gone from the questions. |
| `rm-123` battle of the Allia | 7 | 5 → 7 | Traditional 390 BCE and Polybius's Greek date, 387 or 386 BCE, replace "by the usual dating"; the "16 km" count row is prose. Army sizes are Plutarch's (40,000) and Diodorus's (24,000 against 70,000); Livy gives none. |
| `rm-124` Gallic sack of Rome | 8 | 5 → 8 | The old men, the beard and the burning are Livy's or Plutarch's telling; the endings are set side by side (Livy and Camillus, Polybius and the Veneti treaty, Diodorus and the ransom). **No source on a Gallic burnt layer was found; the card reports only Forsythe's statement that no incontrovertible evidence has been found.** |
| `rm-125` Brennus | 7 | 5 → 7 | **The scale scene was told as an event and Polybius was credited with the seven months**; Plutarch gives the months, Polybius 2.22 reports them as the Gauls' own boast, and Livy gives no length. The Delphi Brennus of 279 BCE is one clause, a different man. |
| `rm-126` geese of the Capitol | 8 | 5 → 8 | Livy was cited three times. **Livy 5.47 has no golden or silver goose**; the dogs and the censors' contract are Pliny's, and Forsythe's view is that the tale was invented to explain two customs. Manlius's trial dropped to keep the card apart from its sibling. |
| `rm-127` Aius Locutius | 5 | 6 → 6 | The voice is 391 BCE and the altar's ordering 390, both by tradition; the unsourced "aio and loquor" etymology and "Cicero three centuries later" are gone. Livy's named plebeian and Cicero's voice from the grove of Vesta are the two versions. |
| `rm-128` Licinio-Sextian laws | 7 | 8 → 7 | **The law (367 BCE) and the first plebeian consul (366 BCE) are kept apart.** Livy's ten tribunates and five empty years are his story, which Forsythe rejects; the 500 iugera cap is uncertain, and so is whether a plebeian consul was required. |
| `rm-129` Lex Genucia | 6 | 5 → 6 | **Livy credits Genucius only with the bill on lending and found the rest in unnamed authorities**; the one law of that name is modern. The mutiny, the ten-year rule and the "both consuls plebeian" clause are contested; 172 BCE, the first pair of plebeian consuls, is on the line. The Fabius episode and the "10-year" count row cut. |
| `rm-130` nobiles | 6 | 5 → 7 | **"Curule descent" was Mommsen's test given as fact**; the card says whose test is whose (Gelzer's descent from a consul is the usual one) and that the nobiles were a status, never an order. Polybius's masks are worn by men resembling the dead, not by relatives. "First new man L. Sextius" cut. Undated (`""`). Gelzer's own definition could not be read first-hand. |

**Read by eye.** *Legend as legend:* Camillus's exile and return, the ransom scene, the geese, the voice and the Genucian mutiny are each an ancient author's. *Chronology:* four cards now print 390 BCE (Varro) beside 387 – 386 BCE (Polybius); `rm-141` prints 387 for the Polybian date, a harmless difference. *Overlap:* `wh-343` says the Licinio-Sextian law "opened the consulship in 367", which is the law's passing; `gr-787` (Delphi Brennus) agrees with `rm-125`.

### B14 — `rm-131`–`rm-140`, the early Republic: the cursus honorum to the first Roman roads and coinage (2026-10-15)

Run as B13. Checks: `rm-audit.js --range=rm-131:rm-140` reads clean on eight cards; the rest are `rm-133`'s picture shared with `wh-340` and `rm-135`'s missing picture. `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. Three citation URLs answer 403 to a script (the Wiley chapter DOI of Raaflaub's volume on `rm-135`, and an MDPI article on `rm-138`); Crossref confirms both. **`rm-133` has no date line on purpose:** no source prints the law's date. Forsythe and Ungern-Sternberg were read in archive.org scans and are cited by their Wiley or Berkeley DOIs, tagged `[Paywalled]`.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-131` cursus honorum | 7 | 5 → 7 | **"Cursus honorum" is a handbook's name**; no source says the Romans did or did not use it for the Republic. Polybius's ten years of service is his; the lex Villia is Livy 40.44 (180 BCE as Abbott and Smith print it), and the ages (30, 31, 37) are modern reconstructions that disagree. Claims the cited Smith page does not make ("centuries vs tribes", "potestas only") and the lictor and count rows are gone. |
| `rm-132` praetorship | 7 | 5 → 7 | Created with the curule aedileship as Livy's "own interest" bargain, 366 BCE (Greenidge; Abbott prints 367); first plebeian praetor 337 BCE; each praetor count is given with its year and author. **Smith's Praetor entry misprints 356 and 246**; the card uses neither. The existing Praetor glossary entry cites the 1890 edition of that article and may carry them. |
| `rm-133` Lex Ovinia | 6 | 5 → 8 | **"After 339 BCE, before 312 BCE" is a handbook inference**, now prose ("older handbooks placed it…"); Festus is the only direct witness. **Appius's roll was said to come "under" the law; no one can say whether the law came before or after it.** `wh-341` prints "around 318 BCE", which none of the sources read prints. |
| `rm-134` Lex Poetelia | 6 | 5 → 6 | Livy's year 326 BCE and Varro's 313 BCE (Poetelius as dictator) are two rows; **the loop of sixty days is the Twelve Tables' procedure, not nexum**. The Papirius story is Livy's, and moderns read it as a stock tale; the law eased bondage rather than ended it. **Cicero, De re publica 2.59, names no year (a corrupt clause), not "after the decemvirs".** |
| `rm-135` Lex Hortensia | 6 | 5 → 7 | 287 BCE labelled **Conventional**; the secession to the Janiculum is what the sources report (Pliny, a summary of Livy, Dio's fragment). The two earlier laws (449 and 339 BCE) are Livy's; whether one formula underlies all three, and how much it changed, is a debate. Unsourced claims about the plebs' "claimed from the beginning" power cut. |
| `rm-136` Lex Ogulnia | 6 | 5 → 6 | **"The last places still shut" was false: the chief pontificate stayed patrician until 254 BCE.** Livy's figures (four and four before; four pontiffs and five augurs added; eight and nine after) are his, and the moderns' doubts are Smith's, Forsythe's and Botsford's. |
| `rm-137` Appius Claudius Caecus | 7 | 5 → 7 | **"18 months" is the Aemilian law's limit (Livy 9.33), not the time he held office.** The Flavius paragraph and a wrong "half a century later" cut. Diodorus says he only professed blindness (Livy: struck blind); Forsythe's and Mitchell's doubts about the freedmen's sons added. A source in Polish carries its chip. |
| `rm-138` Via Appia | 8 | 5 → 8 | **Diodorus says Appius paved most of it; Livy dates the stone paving to 296 and 293 BCE; Platner and Ashby call the first road gravel.** Procopius says "unencumbered traveller", not "on foot", and calls Appius a consul; the extension dates (291, 281, 264 BCE) are Platner and Ashby's alone and Livy 9.29 does not carry them. |
| `rm-139` Aqua Appia | 7 | 5 → 7 | Frontinus's 11,190 paces and sixty above ground are his, with 16.6 km as Ashby's conversion; Lanciani's different length (16,445 m) and springs are shown as disagreement. **No daily output is given: the figure in the handbooks is Frontinus's gauging at a later point, and Lanciani prints a third.** The glossary entry needed no change. |
| `rm-140` aes grave | 6 | 5 → 6 | "Worth their weight" is an open question; Pliny's first silver (269 BCE) and Mattingly's reductions (c. 245 BCE) are separate rows, each labelled. **The denarius's 211 BCE is not given: no source reachable here prints it** (CRRO, nomisma and numismatics.org were unreachable and Crawford is restricted). |

**Read by eye.** *Legend as legend:* Papirius and the debtor, the Hortensian secession and the Aqua Appia's founding by two censors are each an ancient author's. *Confusability:* `rm-131`/`rm-132` and `rm-133`/`rm-136` are pairs by subject, with each phrasing naming only its term's clues. `rm-122` covers pay and `rm-140` the bronze; neither repeats the other. *Chronology:* the praetorship's 366 BCE agrees with `rm-106`, `rm-128`; Abbott's 367 is said in prose. *Overlap:* `wh-341` (Lex Ovinia, "around 318 BCE") is the only disagreement, left alone.

### B15 — `rm-141`–`rm-150`, the conquest of Italy: the Latin War and the settlement (2026-10-15)

Run as B14. Checks: `rm-audit.js --range=rm-141:rm-150` reads clean on nine cards; the one finding is `rm-144`'s missing picture. `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card. **`rm-148`'s locator could not be corrected:** its stored place is Alba Fucens, a Latin colony, the opposite of the card's term; its agent asked for Minturnae and the apply asked for Terracina as a second try, and both stopped at "no primary coordinate" because the resolver needs Wikipedia, which the sandbox cannot reach. The old locator and its `places` id (`pl:q944515`) stay, and the card goes into "Pictures to redo" with its picture.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-141` Roman expansion in Italy | 7 | 5 → 7 | **"Pyrrhus invited 280 BCE" is gone: no source opened gives that year, and 280 is the battle of the Siris.** The 387 start is Polybius's, set beside Varro's 390; "conquest of Italy" is a modern label whose start varies (340, 299). The "a third of each territory" figure and a false "treaty rather than annexation" claim dropped. |
| `rm-142` Latin War | 7 | 8 → 7 | The Capitol demand, Torquatus's son, Decius's devotio and the Antium beaks are Livy's voice; **the devotio is flagged as a doublet of the Sentinum one**, and only the settlement is stated as history. One row, Traditional 340 – 338 BCE. |
| `rm-143` Feriae Latinae | 6 | 6 → 6 | **Dionysius's Tarquin founding and the Latin magistrate presiding were Smith's/Niebuhr's inference told as fact**; both attributed. "White bull" dropped (no source read says white). Dionysius's 47 cities and Pliny's list of 30 peoples are reported as two documents. Dates: Tarquin 534 – 509 BCE (the source's figure), the list from 451, the leagues' end 338. |
| `rm-144` praefectura | 5 | 5 → 6 | **About 40% of the old abstract was Latin-settlement material that belongs to `rm-142`, `rm-147` and `rm-150`.** Now Livy 9.20 (318 BCE), Livy 26.16 (211), Festus read in Müller's Latin edition (chipped), Smith, Staveley and Abbott and Johnson. Sherwin-White and Oakley were borrow-locked. |
| `rm-145` Latin rights | 7 | 5 → 7 | **The old question and glossary defined it as "the private half of citizenship", which is `rm-147`'s term.** The three-rights list is "one modern account"; "narrowed to commercium only in 268" (Abbott, Greenidge and Forsythe disagree) and 187 dropped. Added the 177 BCE migration quarrel (Livy 41.8), 89 BCE and Vespasian's grant to Spain (c. 74 CE). |
| `rm-146` municipium | 7 | 5 → 7 | **Festus's definition has three senses in Paul's epitome, not two.** The "hospitality" etymology, a claim that municipium people lacked the full vote and "earliest grants 338" (Tusculum is put at 381) corrected. Gellius's colony-and-municipium contrast (Hadrian and Italica, Praeneste and Tiberius) added. |
| `rm-147` civitas sine suffragio | 6 | 5 → 7 | **The old line gave 338 BCE as the "first grants", but Gellius makes Caere first**; his story is Gellius's, and c. 353 BCE is the 1890 dictionary's reckoning. "306 BCE" for Anagnia dropped. Livy 8.14 prints "private rights of citizens", not the Latin phrase. The modern view that the term was coined after the Social War added. |
| `rm-148` colonia | 7 | 6 → 7 | **Ariminum, Cales, Alba and Sora are Latin colonies (`rm-149`), not citizen colonies**; removed. "Veterans from 201 BCE" dropped: Scipio's veterans got land, not a colony. The "300 settlers on two iugera" rule is hedged to Terracina and later. Gellius's "miniatures" quoted as his words. |
| `rm-149` Latin colony | 6 | 5 → 7 | **The old line (338 and 306 BCE) gave the ends of two wars, not colony dates**; now Cales 334 BCE and Aquileia 181 BCE. Smith's colony counts and "almost invariably inland" (which Cosa, Paestum and Ariminum contradict) dropped. Livy's settler figures are his. |
| `rm-150` ager publicus | 7 | 5 → 7 | **The tenth/fifth tithe is Appian alone, a late sole source**, and Smith notes no other ancient source reports it; the 500-iugera limit is hedged as tradition; Livy's two iugera a head after the Latin War is his figure. Gracchan problem one clause. |

**Read by eye.** *Confusability:* the settlement cards are a tight cluster (`rm-144`–`rm-150`); each phrasing names only what its term has, and the old confusion of Latin rights with citizenship without the vote is gone. *Chronology:* `rm-141` and the Allia cards print 387 – 386 for Polybius's year; `rm-143`'s 534 – 509 BCE for Tarquin disagrees with `rm-074`'s Dionysian 532 – 507 BCE, and both are said to be the source's. *Overlap:* `rm-164` (not yet refined) says Tarentum invited Pyrrhus after Rome declared war, which Polybius 1.6 does not.

### B16 — `rm-151`–`rm-160`, the conquest of Italy: the Samnite Wars to the Senones (2026-10-15)

Run as B15. Checks: `rm-audit.js --range=rm-151:rm-160` reads clean on seven cards; the rest are `S.chip?` on `rm-151`, `rm-152` and `rm-156`, all the documented false positive (Wheeler's English BMCR review of a German-titled book). `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card. The Samnite pages in Salmon, Oakley and Cornell were unreadable here, so the modern half rests on Forsythe, Stek, Adcock (CAH VII), two BMCR reviews and, on `rm-155`, a university thesis.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-151` Samnite Wars | 7 | 5 → 7 | Livy's story of 343 BCE is Livy's, set beside the doubts about the Campanian surrender and whether the war happened. **The count of three wars is labelled both traditional and modern: Stek says it goes back to Niebuhr, and ancient authors speak of one long war.** The unsourced "Embratur" and the Caudium and Polybius material dropped. |
| `rm-152` First Samnite War | 6 | 5 → 6 | No mountain is named (the Roberts translation prints "Glaurus"); the Gaurus, Falerii and Carthage-crown details dropped. **Livy's causes are shown as Thucydides-shaped, and the Decius tale is called fiction by Forsythe.** The 354 BCE treaty is the earlier line. |
| `rm-153` Second Samnite War | 6 | 5 → 6 | **The old abstract rested almost wholly on Smith's 1854 entry**; his unread claims (two theatres, a Lucanian alliance, Bovianum sacked in 311 and 305 BCE) dropped. Conventional 326 – 304 BCE with the Varronian caveat; Livy cut from four pages to two. |
| `rm-154` Caudine Forks | 7 | 5 → 7 | Livy's story attributed; **the repudiation is a debate (Forsythe: unhistorical, modelled on a later surrender in Spain; Aston: questioned on legal grounds).** No army size is printed: no "two legions" figure was found in Livy 9.2 – 9.11. Conventional 321 BCE. |
| `rm-155` maniple | 7 | 5 → 8 | **The old card told Livy's and Polybius's armies as one**; they are two accounts about two centuries apart (Livy's fifteen maniples against Polybius's ten, the one explanation Smith's). An unsourced hay-wisp etymology gone. The Samnite-borrowing debate and the articulated-phalanx split are reported as debates. No per-maniple numbers. |
| `rm-156` Third Samnite War | 6 | 5 → 7 | Livy's Lucanian embassy and the Aquilonia oath are "Livy tells", with the 40,000 his; the oath's historicity and the Etruscan and Umbrian share are debates. "Forty years", "second front" and "auxiliaries" were unsourced. |
| `rm-157` Battle of Sentinum | 6 | 5 → 6 | **"A million foot" came from Roberts's translation; the Loeb reads 600,000 foot, 46,000 horse and 1,000 chariots, with the manuscript reading disputed; "8,700 Roman dead" is a sum Livy never prints.** The devotio is Livy's story, copied onto the father in Forsythe's view. The year is out of the question. |
| `rm-158` conquest of Etruria | 6 | 5 → 7 | "Last to submit" and "Rome razed Volsinii and moved its people" unsourced (now "reportedly" slaves or clients). **The 2,000 statues are Metrodorus's charge as Pliny preserves it; the Fasti Triumphales are an Augustan compilation, not contemporary.** The Livy doublet on the Etruscan truces noted. |
| `rm-159` conquest of Umbria and Picenum | 6 | 5 → 7 | "Two consuls in a single campaign", Ocriculum's "favourable terms", "never in arms again" and the Gauls of Livy 10.10 as Senones were unsourced. Livy has the Umbrians leaving Decius behind, not "a consul". Rebuilt line: Mevania 308 (tradition), the Picene treaty 299, the war 268 and Firmum 264 BCE. |
| `rm-160` Senones | 6 | 5 → 7 | **The old card gave Polybius's 30-year treaty to the Senones and "broken 299"**; Polybius says "the Gauls", and the 299 and 283 on the old card were Shuckburgh's marginal notes. Dates now rest on modern authors (Arretium 284, final defeat 283, the land law of 232 BCE). |

**Read by eye.** *Legend as legend:* the Campanian surrender, Decius's devotio (twice, father and son), the Caudine repudiation and the Aquilonia oath are each Livy's. *Confusability:* the three-war cluster (`rm-151`–`rm-153`, `rm-156`) is told apart by cause (Campania, Palaepolis, the Lucanians) and `rm-154`/`rm-157` by their battles. *Chronology:* all Samnite years are Varro's and said to be conventional; `rm-157`'s 295 BCE is the same year `rm-142` gives for the son's devotio. *Overlap:* `wh-337` (Etruscan civilisation) was read for `rm-158` and does not disagree.

### B17 — `rm-161`–`rm-170`, the conquest of Italy: Telamon, Pyrrhus and the confederation (2026-10-15)

Run as B16, with B18's and B19's agents alongside. Checks: `rm-audit.js --range=rm-161:rm-170` reads clean on eight cards; the rest are `rm-167`'s missing picture and `rm-168`'s `I.caption-source` (the description names Commons). `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card. Every modern source on `rm-165` and `rm-166` is of 1898 – 1935; the 2026 De Gruyter chapters would not open. From `rm-161` on the dates are firm (Polybius is near-contemporary), so the line carries no "Traditional" label; the Pyrrhic War's dates are modern histories' conventions.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-161` Battle of Telamon | 6 | 6 → 6 | Five Polybius chapters → one Loeb text; **"vanity and bravado" was Shuckburgh's wording, the Loeb has "proud confidence"**. Every figure (about 50,000 foot, 20,000 horse and chariots; 6,000 Romans at Faesulae) is Polybius's. Frontinus puts the fight near Populonia; Polybius near Telamon. The triumph (224 BCE) added; date line only 225 and 224. |
| `rm-162` conquest of Cisalpine Gaul | 6 | 5 → 8 | Four Polybius chapters → Polybius 2 and 3, Plutarch's Marcellus and five modern items. **Plutarch's Mediolanum story (Marcellus joins Scipio) is set beside Polybius's**; the 224 and 191 BCE campaigns and the Boii revolt against the new colonies added. The province point is stated as Smith has it and nothing on Sulla. |
| `rm-163` Tarentum | 7 | 5 → 9 | **The "greatest Greek city" claim and the 1854 Smith dates (302, 281, 274) are gone.** Founding by the Partheniae is Antiochus's and Ephorus's (Strabo), 706 BCE Eusebius's and 708 BCE Jerome's. The insult to the envoys is Appian's story, with Fronda's and Forsythe's doubts. The glossary's "invited Pyrrhus in 280" and two superlatives fixed. |
| `rm-164` Pyrrhus | 8 | 5 → 9 | **The order of the invitation and the war is not stated: Polybius (after the insult), Plutarch (war already begun) and Appian (after an invasion) are each reported as theirs.** "First Hellenistic army" and "some 25,000 men" dropped; the forces are Plutarch's list. Dodona's oracle is Dio's. |
| `rm-165` Battle of Heraclea | 6 | 5 → 6 | "Rome's first defeat by a Hellenistic army" was fact; it is now one modern history's claim. **The casualty figures are Dionysius's and Hieronymus's, via Plutarch; the "wounds in front" remark is in none of the texts read and is gone.** 280 BCE out of the question. |
| `rm-166` Battle of Asculum | 6 | 5 → 6 | Told as Plutarch's two days against Dionysius's one action with no admitted Roman defeat, then the modern verdict of a costly victory. The "ruin" remark left to `rm-167`; Frank's consul Decius death left out. |
| `rm-167` Pyrrhic victory | 8 | 5 → 9 | **Plutarch puts the remark after Asculum with "we are told"; Diodorus and Dio put a similar one after Heraclea**, and the card gives both rows. Hieronymus stands behind the casualty figures only, not the remark. Merriam-Webster's definition and Diodorus's "Cadmean" added. |
| `rm-168` Battle of Beneventum | 6 | 5 → 7 | Plutarch's and the Dionysius excerpt's accounts of the elephants differ and are both given; the "Roman camp origin" rested on Frontinus alone and is gone. Smith prints 274 BCE; the card uses 275. `gr-847` says "without result", which the sources read do not support. |
| `rm-169` siege of Tarentum | 6 | 5 → 6 | **The old card blended contradictory accounts of the fleet and the terms**; Zonaras, Mommsen, Smith and Frank are now set against one another. Milo's 3,000 men, "own laws" and the tile story dropped. 272 BCE only. |
| `rm-170` Roman confederation | 7 | 5 → 7 | **The old "census 225" was Polybius's returns, not a census**; the figures (over 700,000 foot, 70,000 horse; the Latins 80,000) are his, traced by Brunt to Fabius Pictor, whose grand totals Brunt calls "without value". Undated. The old text repeated the levy details that `rm-171` carries. |

**Read by eye.** *Confusability:* `rm-165`/`rm-166`/`rm-168` each name the elephants and the terrain differently; `rm-163`/`rm-164`/`rm-169` split city, king and siege. `rm-170`/`rm-171`/`rm-172` split the system, the status and the register. *Chronology:* the 387 – 386 BCE Polybian year is not used here. *Overlap:* `gr-846`, `gr-847` and `gr-214` were read; `gr-847` says the Beneventum battle was "without result" and gives the "ruin" remark to Diodorus, which the sources read here only partly support.

### B18 — `rm-171`–`rm-180`, the conquest of Italy: the allies, the roads and Roman Italy (2026-10-15)

Run as B17. Checks: `rm-audit.js --range=rm-171:rm-180` reads clean on five cards; the rest are four missing pictures (`rm-171`, `rm-172`, `rm-177`, `rm-180`) and `rm-176`'s `S.chip?` false positive (Östenberg's English BMCR review of a German-titled book). `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card. `rm-172`'s second phrasing nearly gave its answer away through the word "toga" and was reworded. EDCS, EDH and Pleiades would not load, so the Furlo and Rimini inscriptions on `rm-173` are not read and no tunnel date is given.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-171` socii | 6 | 5 → 6 | **"Allied states paid and clothed their own soldiers" is not in Polybius**; gone, with two Gellius and Appian items not re-read. Polybius's levy orders (6.21), ratio and *extraordinarii* (6.26) and rations (6.39) are his; the modern debate is cited from Dzino's review of the Pfeilschifter/Keller essays. The glossary said the Julian law closed the Social War; it came during it. |
| `rm-172` formula togatorum | 6 | 5 → 6 | **No source gives the register's contents or any army size.** The Lex Agraria is cited from Bruns's Latin edition, where "milites … solent" is a restoration, and the card says so. Mommsen's reconstruction is his alone; 209, 204 and 111 BCE from a modern study. Brunt doubts that the 225 returns relate to the formula (see `rm-170`). |
| `rm-173` Via Flaminia | 7 | 5 → 7 | The censorship date, the purpose and the lengths were stated as fact; **the Periochae give no year, 220 BCE is the modern date, and a passage of Festus seems to date the work to 223 BCE**. A German reference work warns that Livy's 217 BCE march does not prove the road existed in 220. No kilometres: only Smith's itinerary figures in Roman miles. |
| `rm-174` Via Aemilia | 7 | 5 → 7 | **"About 290 km (180 Roman miles)" dropped everywhere: Smith says only "180 miles", not Roman.** Strabo's and Livy's differing lines for the road are each given; the colonies (Bononia 189, Parma and Mutina 183 BCE) rest on the Princeton Encyclopedia and the Cambridge Ancient History. |
| `rm-175` Roman roads | 9 | 5 → 9 | **"Paved from 312 BCE" was wrong: the Appian Way was gravelled first, with a footpath in 296 BCE and paving to Bovillae three years later.** The four layers are Ramsay's 1875 reconstruction by analogy with Vitruvius's floor rules, and a northern Italian study found one or two. The network's certainty (2.737% certain) is Itiner-e's. |
| `rm-176` Roman triumph | 9 | 5 → 9 | **The 5,000-dead rule was stated as fact; it is Valerius Maximus's, "obviously of recent date" in the 1890 dictionary and doubted by Beard and Itgenshorst.** Romulus's triumph and the Fasti Triumphales are in the sources' voice; the two dictionary editions disagree on whether the slave's whisper has earlier support, and the card says so. No Fasti corpus record was reachable. |
| `rm-177` evocatio | 6 | 5 → 8 | **The old line merged the vow (396 BCE) and the dedication (392 BCE)**; now two rows, both by tradition. Whether the Juno story shows the rite at all is a debate; Macrobius's Carthage formula is late (5th century CE) and doubtful. "The Aventine temple stood until the end of paganism" dropped (Platner and Ashby: restored by Augustus, then unmentioned). |
| `rm-178` Romanisation of Italy | 7 | 5 → 10 | **The old "towns taken into Rome" misdescribed the 338 BCE settlement.** The word is shown to be modern (Haverfield 1905), with the Hingley, Mattingly and Terrenato views attributed; Stek and Bispham are reported through reviews. "A third of the land" and "a new colony every few years" dropped. Three sources over the bar, each carrying a named view. |
| `rm-179` Latin | 9 | 5 → 9 | **Livy names no body: the old "asked the senate" is cut**; the Latin text says permission was granted (180 BCE, Cumae). Smith's "shrinking Greek element" is his inference. The Manios fibula is left out: nothing read settles its authenticity. Undated. |
| `rm-180` Roman Italy | 8 | 5 → 8 | **"From the Po to the strait" is wrong**: the Celts held the Po plain and official Italy excluded Cisalpine Gaul; Ariminum (268 BCE) was the northern post. Rhegium follows Polybius (over 300 prisoners executed), not Frontinus's 4,000; the Mamertine material moved to `rm-187`. The name Italia and Corfinium are new angles. |

**Read by eye.** *Confusability:* `rm-171`/`rm-172`/`rm-170` are system, status and register, with each phrasing naming only its own term; `rm-138`/`rm-173`/`rm-174`/`rm-175` are one road cluster, each with its own clue (Gracchus's milestones, the Furlo tunnel, Strabo's line). *Chronology:* `rm-141` and `gr-847` disagree on when the Pyrrhic War ended; `rm-180` uses Polybius's Rhegium. *Overlap:* none beyond that.

### B19 — `rm-181`–`rm-190`, the Punic Wars: Carthage, the origins and the first campaigns (2026-10-15)

Run as B18. Checks: `rm-audit.js --range=rm-181:rm-190` reads clean on seven cards; the rest are `I.none` on `rm-183` and `rm-185` and `rm-190`'s `L.missing`. **`rm-190`'s locator could not be added**: the draft asked for Agrigento, and the resolver needs Wikipedia coordinates, which the sandbox cannot reach (the same "no primary coordinate" as `rm-148`); it is listed under "Pictures to redo" with its picture. `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card. From `rm-186` on, the ancient source is mostly Polybius, a near-contemporary, so these cards carry few "Traditional" labels: the legend here is Dido, the Rhegium garrison's story and the origin of Hiero's rise.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-181` Carthage | 9 | 5 → 9 | **The old "65 years before Rome" was Velleius' count with no attribution**: now Traditional 814 – 813 BCE (Timaeus' count) beside the oldest excavated layers, c. 800 – 750 BCE (bone dates matching the traditional year are criticised as coming from mixed deposits). **360 stadia is Strabo's figure; Appian, Libyca 95 gives no such number.** 700,000 inhabitants is Strabo's unsourced estimate. The Tophet debate added. |
| `rm-182` Carthaginian empire | 8 | 6 → 8 | No modern scholarship before; it also carried the Mercenary War material that belongs to `rm-203`. **"Empire" is said to be a modern label and no Carthaginian source survives**; the 310 BCE and 241 – 237 BCE rows dropped. Its locator omits Iberia. |
| `rm-183` Carthaginian constitution | 7 | 5 → 7 | **"Senate 300" is Movers's 1849 reconstruction, which Gsell calls arbitrary**, not an ancient figure; gone, with "in decline by 218 BCE". Aristotle (c. 335 BCE as Gsell dates the Politics) and Polybius are the two ancient witnesses; Hannibal's reform of 196 BCE is a modern summary of Livy. |
| `rm-184` Carthaginian navy | 7 | 5 → 7 | **The 220 is Appian's figure for the harbour in the second century CE, and it counts slips, not ships**; "261 BCE" was the translator's heading, not Polybius's date. Polybius's 680 ships and 290,000 men at Ecnomus are set beside Tarn's judgement that they are impossible. |
| `rm-185` Roman–Carthaginian treaties | 6 | 5 → 6 | **The old "509 – 508 / c. 306 / 279" gave three Polybian treaties; Polybius dates only the first (to the first consuls) and the third (to Pyrrhus's time), and his second is undated.** 348 BCE is Diodorus's and Livy's; 306 and 279 are Livy's renewals. The Philinus claim is attributed to Philinus. `undatable` is now false. |
| `rm-186` First Punic War | 8 | 6 → 8 | "24 years", "In Africa 255 BCE" and the indemnity row were counts or not dates; the line is 264 – 241 BCE. Polybius is the only ancient source (the other seven are modern); Regulus, the fleet and the peace get a clause each. `wh-345` agrees. |
| `rm-187` Mamertines | 6 | 5 → 6 | **The old line printed "after 289", "c. 280", "271" and "264" as if Polybius gave them; those BCE figures are the translator's margins or Smith's inferences**, now credited to the modern writer who prints each. The Longanus is 268 (Frank) or 265 (Giannelli, Livius.org); `rm-189` prints 268. "Jubellius" is not in Polybius. |
| `rm-188` Messana | 7 | 5 → 7 | Dates are Smith's inferences (Samians not before 493, Anaxilas died 476, crossing 264). **The old question said "renamed Messana"; the rename is Messene, with Messana its Doric form.** "Treaty renewed at the peace" was Smith's inference; replaced by Cicero's federate-city line. |
| `rm-189` Hiero II | 7 | 5 → 7 | **The reign start "269" is Polybius's 54 years counted back from a death in 215 BCE**, with the kingship put 270 – 264 by different scholars and Smith's death before the end of 216. The first treaty ran fifteen years and was renewed in 248 BCE. "268 BCE" and "silver" dropped; the Lex Hieronica and the Syracusia added. |
| `rm-190` siege of Agrigentum | 6 | 5 → 6 | **The 25,000 slaves, 30,000 Roman dead and "six months" are Diodorus 23.9, not Polybius, who says only "many slaves"**; the old "over seven months" came via Smith. Polybius's 50,000 are "people cooped up", not Carthaginians. |

**Read by eye.** *Legend as legend:* Dido and Elissa (Velleius and Justin), the founding date and the Rhegium garrison are each an ancient author's. *Confusability:* `rm-181`–`rm-184` are city, power, constitution and navy; `rm-185`/`rm-186`/`rm-187`/`rm-188` are treaties, war, soldiers and city, with each phrasing naming only its term's clues. *Chronology:* the Longanus (268 or 265) and Rhegium (271 or 270) years carry across `rm-180`, `rm-187` and `rm-189`; each is given with its author. *Overlap:* `wh-345` agrees with `rm-186`; `gr-237` gives "about 490 BCE" for Messana's rename, inside `rm-188`'s window.

### B20 — `rm-191`–`rm-200`, the Punic Wars: the fleet, Regulus and the peace of 241 BCE (2026-10-15)

Run as B19. One agent (`rm-197`/`rm-198`) died on a usage-limit error after writing both drafts; the files were complete and passed `precheck.js`, so they were read and applied without resuming it. Checks: `rm-audit.js --range=rm-191:rm-200` reads clean on five cards; the rest are `L.missing` on `rm-193`, `rm-194`, `rm-197` and `rm-199` (the resolver needs Wikipedia coordinates, which the sandbox cannot reach, so their drafts' locator requests were dropped; each is in "Pictures to redo"), `rm-199`'s real picture duplicate with `wh-345` and `rm-200`'s missing picture. `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check`, `test-card-plans` pass; every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card. The ancient source is Polybius almost throughout, so there is little legend to hunt but plenty of **figures**: every fleet, army and indemnity figure is now his, Diodorus's or a modern estimate, said so.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-191` first Roman fleet | 7 | 5 → 7 | **"Voted 120 ships" dropped: Polybius names no vote, only 100 quinqueremes and 20 triremes, and prints no BCE years**; 261 and 260 cite Livius.org's chronology. The totals differ (Polybius 120, Orosius 130, a 1907 study about 160); "built in 60 days" is Pliny's. The "first navy" claim is doubted. |
| `rm-192` corvus | 6 | 5 → 6 | **Polybius says only "someone suggested" the device**, and names the "ravens" at 1.22 – 23 and 1.27 – 28; the "gangway length" date row and the "rather than anything the ships carried" inference gone. The sizes are his; a 1907 study and Steinby (through a BMCR review) doubt the two-abreast bridge. |
| `rm-193` Battle of Mylae | 6 | 5 → 7 | **The "200 ships" was Diodorus's anecdote about Hannibal's defence, not a count of the battle fleet**; "30, then 50 more" is one reading of Polybius (Rankov reads 50 as the total). The Duilius column's inscription is treated as restored; unsourced claims about Greek marble, the torch-and-flute privilege and Pliny's column dropped. |
| `rm-194` Cape Ecnomus | 6 | 5 → 6 | Polybius's 330 and 350 ships, 140,000 and 150,000 men are his, with how he got them; **the old "mouth of the Himera" is dropped: the site is uncertain** (Rankov and Dio near Heraclea, Livius.org near Licata). |
| `rm-195` African expedition | 6 | 6 → 6 | The old line printed a count and a place as dates and gave "20,000 slaves" as fact; now dates only (256, 255, 255 BCE) and Polybius's figures are his. **Polybius says Regulus opened the talks; Diodorus has Carthage ask.** |
| `rm-196` Regulus | 7 | 6 → 8 | The embassy and torture are later tradition, with the modern doubt attributed. **The "barrel with nails" is not first in Gellius (his spiked chest holds Carthaginian captives); the earliest source verified for Regulus in a nailed chest is Tertullian, *To the Martyrs* 4**, so the card says "later", not "first". The old serpent sentence and "no source of his own century" dropped. |
| `rm-197` siege of Lilybaeum | 6 | 6 → 7 | Six Polybius chapters → Polybius, Diodorus, Cicero and four modern items. Fleet sizes are Polybius's 200, Diodorus's 240 plus 60 light vessels and Scullard's 120. **The sacred-chicken story is one clause in legend voice: Polybius does not mention it, and Scullard says Claudius "is said to have" done it.** |
| `rm-198` Hamilcar Barca | 7 | 5 → 8 | **The old Iberian span ended in 228; Polybius gives only durations, and the BCE years are Scullard's, Frank's and Schulten's.** Hercte's identity is a debate (Monte Pellegrino, Monte Castellaccio, or unknown). The oath is Hannibal's own later account (Polybius 3.11). "Barca = lightning" is Mommsen's alone. His death (Diodorus: drowned fleeing the Orissi; Livy: nine years only) is disputed. |
| `rm-199` Aegates Islands | 7 | 5 → 7 | The old line carried counts; now 10 March 241 BCE (Eutropius's day, accepted by Walbank and Morgan) and the war span. **The loan-funded fleet is Polybius's; his 50 sunk and 70 taken are set beside Diodorus's 117 and 80.** The rams on the seabed suggest triremes, not quinqueremes. Falto's wound rests on Smith alone and is hedged. |
| `rm-200` Treaty of Lutatius | 6 | 5 → 6 | **The old card ran Polybius's Book 1 draft (2,200 talents over 20 years) and his Book 3 ratified text (2,200 within ten years plus 1,000 at once) together as one text**; they are now kept apart, with Frank and Mommsen on the commissioners. Diodorus's arms-and-deserters story dropped. |

**Read by eye.** *Confusability:* `rm-191`–`rm-194` are fleet, device and two battles, with each phrasing naming only its term's clue; `rm-195`/`rm-196` split the expedition and the man; `rm-197`–`rm-200` are siege, general, battle and treaty. *Chronology:* the Longanus, Rhegium and Regulus years agree with `rm-187`/`rm-189`; `rm-198`'s death year (229 – 228) follows the dispute, not one author. *Overlap:* `wh-345` gives only the war's dates and agrees; its picture is shared with `rm-199`.

### The second hundred, in sum

`rm-101`–`rm-200` (the rest of the early Republic, the conquest of Italy and the first of the Punic Wars) are done: 549 sources became 714 and 90 glossary entries were rewritten. `rm-audit.js --range=rm-101:rm-200` reads 72 of 100 cards clean; what remains is 13 cards with no picture, 5 real picture duplicates, 2 `I.caption-source` hits, 5 `S.chip?` false positives (English BMCR reviews of foreign-titled books) and 5 battle cards with no locator. Every picture is still the bulk-written one; the "Pictures to redo" table holds a verdict for each of the two hundred, and the locator list is in the same table.

What the second hundred found, again and again:
- **The early Republic's heroes and laws as events.** Coriolanus, Cincinnatus, Verginia, the decemvirs, the Valerio-Horatian laws, Camillus, the Gallic sack and the Samnite devotiones were told in the card's voice and are now Livy's, Dionysius's or Plutarch's, with Varro's years labelled and the other reckoning (Polybius's 387 – 386 BCE for the sack) set beside them.
- **A year no source prints, or a year belonging to another event.** 367 BCE for the first plebeian consul (366), "18 months" as the length of a censorship, "338 BCE" as the first citizenship without the vote (Gellius makes Caere first), "306 BCE" and "310 BCE" as colony dates, "Pyrrhus invited 280 BCE" and the sack's "usual dating".
- **A translator's heading or margin read as the author's.** Polybius's treaties, the Longanus, Rhegium and "261 BCE" for the fleet were all Shuckburgh's or Smith's.
- **A figure no source gives.** "A million foot" at Sentinum, "300 senators", "290 km", the Appian Way's length, "20,000 slaves", "200 ships" and every Polybian or Diodoran army count that stood as fact; each is now an author's figure, or gone.
- **A handbook's inference as ancient fact.** Smith's account of why consular tribunes were created, the quaestor's seat in the senate, the "ten-year" rule's date, the Lex Ovinia's window and the tithe on public land.
- **Modern scholarship was often out of reach.** For `rm-117`, `rm-118` and several others the modern half is Smith, Greenidge, Abbott and Mommsen (out of copyright); Raaflaub's and Forsythe's volumes were read in archive.org scans and cited by their Wiley or Berkeley DOIs, tagged `[Paywalled]`. A later pass with a library could replace them.

### B21 — `rm-201`–`rm-210`, the Punic Wars: the settlement of Sicily to the Second Punic War (2026-10-22)

Run as B20, with a new session: Wikimedia answered 429, so no picture was touched and every locator request was dropped (`add-locators.js` needs Wikipedia coordinates). Checks: `rm-audit.js --range=rm-201:rm-210` reads clean on four cards; the rest are `L.missing` on `rm-206` and `rm-208`, `I.none` on `rm-203`, `I.duplicate` on `rm-202` (with `rm-269`) and `rm-205` (with `wh-346`), and `I.caption-source` on `rm-210`, all in "Pictures to redo". `check-questions` and `check-cards` pass but for the old `rm-202`/`rm-269` shared picture; every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card (`rm-206`'s Spanish journal article is dated 2014 as its volume, 2015 in Crossref). The ancient source from here is Polybius, near-contemporary, so no "Traditional" labels; the faults are **years no source prints**, **figures that were Livy's or Diodorus's** and a **thin modern half**: where the recent journals would not open (Gerión, Klio, Emerita, Classical Philology), the modern sources are the 1914–30 Cambridge Ancient History chapters, Frank and Lendering, and the card says whose each date is.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-201` Roman annexation of Sicily | 7 | 5 → 7 | **The old claim that the same treaty barred Carthage from attacking Hiero is true only of Polybius's first draft (1.62); the text he quotes at 3.27 protects the allies of both sides.** Two-thirds of the old abstract was Cicero's tithe, which belongs to `rm-778`; it is now the event and the terms, with Cicero's Verrines treated as advocacy. The date line is the 241 BCE peace only. |
| `rm-202` provincia | 7 | 7 → 8 | **"From 241 BCE" is gone: no ancient source read prints a year for the first province**; Frank alone prints 227 for the first resident praetor, labelled a modern account. Added the word's older sense (a task given to a commander) and the debate over when a province in the territorial sense began; Cicero's praise is part of his case. `wh-345` treats the peace as the start of the first province, which this card does not bear out. |
| `rm-203` Mercenary War | 7 | 7 → 7 | **The old "50,000 at the end" is Polybius's figure for a picked force before the trench (1.84), not the army at the end; the Saw killed "more than forty thousand" (1.85).** The end year is 237 (Mulligan, Hoyos's title), not 238, with Polybius's "three years and four months" in prose. Hiero's reasoning was Polybius's own maxim and is no longer given to him; the trench was mid-war, not the end. |
| `rm-204` seizure of Sardinia and Corsica | 7 | 6 → 7 | **"Ceded 238 BCE" was presented as fact: Polybius prints no year; 237 is Hoyos (via Drogula's review), 238 the Enciclopedia Italiana and Bouchier.** The Corsica anecdotes came from Zonaras's epitome of Dio and Polybius never mentions Corsica, so they are dropped. The 1,200 talents are Polybius's, with his verdict that the demand was unjust. |
| `rm-205` Barcid conquest of Spain | 6 | 5 → 7 | The date line held counts ("about 9 years"); it is now landed 237, Hamilcar died 229 (Lendering), Hasdrubal 228 – 221. **"Barcid" and "empire" are said to be modern labels**, with the independence debate; Polybius gives Hasdrubal eight years and Diodorus nine. The crucified chief and "twelve cities" were unsourced and are gone. |
| `rm-206` New Carthage | 7 | 5 → 8 | **The mine figures (400 stades round, 40,000 men) are Strabo 3.2.10 quoting Polybius, not Polybius 10.10**; the abstract says so. The old "c. 228 – 221" ended on Hasdrubal's murder; the founding is c. 229 – 227 (the spread of the modern dates). Archaeology of the wall is stated apart from Polybius's description. |
| `rm-207` Ebro treaty | 6 | 5 → 8 | **"From 219 BCE" had no source; 226 BCE is Schulten's alone (Hallward 226 or 225; Polybius gives no year).** The old claim that Saguntum "had placed itself under Roman protection years before" was stated as fact; the two arguments are now Polybius's report of each side, and Livy's and Appian's different terms are set against his one-line clause. |
| `rm-208` Saguntum | 7 | 5 → 8 | **The siege's eight months are Polybius's alone; Livy gives them only as "some writers" and objects that the consular dates then fail.** The pyre is Livy's story and the melted gold Appian's. "About 7 stades" was a measurement on the date line; the line is now besieged 219 and retaken 212 (Hallward). Polybius says slaves were shared, not "the people". |
| `rm-209` Second Punic War | 8 | 5 → 8 | **The old card called the storming of Saguntum the "occasion"; Polybius 3.6 distinguishes pretext, cause and beginning and calls it a beginning**, giving Hamilcar's anger, Sardinia (the principal cause) and Spain's success as the causes. A page of Cannae and Capua detail is dropped to its own cards; the indemnity and hostages leave the date line. |
| `rm-210` Hannibal | 9 | 6 → 9 | **"Left Carthage at 9, c. 237" and "returned home past 45, c. 202" turned ages into BCE years; the line now carries four years a source prints** (born c. 247, to Spain 237, exile 195, death 183 – 181 with Atticus, Polybius and Sulpicius Blitho). The oath at nine is Hannibal's own later account to Antiochus (Polybius 3.11), with Livy's hedge and the modern split. The Massinissa and Gisgo anecdotes are dropped. |

**Read by eye.** *Confusability:* `rm-201`/`rm-202` are the settlement and the word, `rm-203`/`rm-204` the revolt and Rome's seizure, `rm-205`/`rm-206` the conquest and the city, `rm-207`/`rm-208` the treaty and the town, `rm-209`/`rm-210` the war and the man; the old `rm-207` and `rm-205` phrasings that repeated a clue (the Celtic invasion) were replaced. *Legend:* Livy's Saguntine pyre and Hannibal's oath are each an author's. *Chronology:* the new rows are in `docs/rome-chronology.md`; `rm-204`'s 237/238 and `rm-210`'s three death years are each given with their authors. *Overlap:* `wh-345` and `wh-346` agree on the dates but `wh-345` calls the peace the start of the first province; `wh-346` shares `rm-205`'s picture.

### B22 — `rm-211`–`rm-220`, the Punic Wars: the Alps to Cannae and its aftermath (2026-10-22)

Run as B21. Checks: `rm-audit.js --range=rm-211:rm-220` reads clean on six cards; the rest are `L.missing` on the four battle cards `rm-213`, `rm-214`, `rm-215` and `rm-218` (their drafts' locator requests were dropped; each is in "Pictures to redo"). `check-questions`, `check-cards`, `check-style`, `check-docs`, `split-cards --check` and `test-card-plans` pass; every citation URL answers 2xx except three DOIs whose publishers (PNAS, Oxford) answer 403 to a script and that Crossref confirms; `check-citations --card` 0 mismatched on every card. The modern half of the Ticinus and Trebia is nineteenth-century (Dodge, Mommsen, Ihne, Arnold from archive.org) because the recent chapters were blocked.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-211` Hannibal's crossing of the Alps | 8 | 5 → 8 | **"20,000 foot and 6,000 horse" is Livy's lowest estimate and a modern restatement, not Polybius's**: he gives 12,000 African and 8,000 Iberian foot and at most 6,000 horse from Hannibal's Lacinium inscription. The vinegar-and-fire rock is Livy's, which Polybius does not tell; the pass is unsettled (Little St Bernard, Clapier, Traversette) and attributed to whoever argues each. "Ascent 9 days" leaves the date line. |
| `rm-212` war elephant | 8 | 5 → 8 | The old line (255, 218, 202 BCE) was events converted by the agent and "undatable"; it is now Heraclea 280, Raphia 217, Zama 202 and Thapsus 46. **At Zama the animals did not all "let through lanes" and do no harm: Polybius 15.12 says the rest fell on the skirmishers.** Added the Hellenistic origin, Pyrrhus, the forest-elephant speculation (genetics found savanna elephants in Eritrea) and the Roman response. |
| `rm-213` Battle of the Ticinus | 6 | 5 → 7 | **The rescue of the wounded consul is an open disagreement**: Polybius 10.3 (from Laelius) credits his young son, Livy reports Coelius's Ligurian slave and prefers the son. Polybius prints no BCE year; 218 is Dodge's, and the site is disputed. The 600 prisoners and 2,000 foot leave the date line. |
| `rm-214` Battle of the Trebia | 7 | 5 → 7 | The army figures are Polybius's own (Livy's 18,000 Romans set beside them) and the solstice dating is his alone; **Sempronius's eagerness is Polybius's account, which Ihne argues shifts blame for a friend of the Scipios**. The site is disputed (Mommsen against Ihne). |
| `rm-215` Battle of Lake Trasimene | 7 | 6 → 7 | The old card told Polybius's portrait of Flaminius as the whole battle and put 15,000 dead on the date line. **Livy's omens, Ducarius, his own casualty figures and the earthquake nobody noticed are each an author's, kept apart from Polybius's**; neither names the ground, so the site is debated. A calendar day (24 June) is a modern deduction and not printed. |
| `rm-216` Quintus Fabius Maximus | 7 | 6 → 7 | Now the man, not the dictatorship (that is `rm-217`): Verrucosus and Ovicula from Plutarch, **Cunctator as a later name** (Plutarch's text does not use it), and the career dates 233, 217 and 203 from Feig Vishnia, who takes them from Livy and Valerius Maximus. Fabius Pictor's likely shaping of his image is a modern view. |
| `rm-217` Fabian strategy | 7 | 6 → 7 | **"Adopted 217 BCE" dated the dictatorship as if it were the strategy's adoption**; the line is now the dictatorship and the Society's 1884. The counts (4,000 men, 2,000 oxen) are Polybius's, with Plutarch's different setting (Casilinum). The strategy's later uses (the Fabian Society, Washington) are modern ideas, said so. |
| `rm-218` Battle of Cannae | 8 | 7 → 8 | **Livy's toll was misprinted: 22.49 gives 45,500 foot and 2,700 horse, not 40,000.** Polybius's 70,000 dead, 10,000 captured and the two armies are his; "left bank of the Aufidus" was no source's and is dropped, the site debate (Strauss, Mahaney) added. No battle day is printed; "double envelopment" is left to `rm-219`. |
| `rm-219` double envelopment | 7 | 6 → 7 | The old card retold the battle with Polybius's army figures. **The term is modern military vocabulary**: Schlieffen's Cannae studies, Delbrück's cavalry reading (via Hill) and Liddell Hart's claims for Ilipa against Hallward's "could only outflank" are each attributed; a preface notes Hannibal still lost the war. Date line "" and undatable. |
| `rm-220` Rome after Cannae | 8 | 6 → 8 | Five Livy chapters as five sources are now Livy once with Polybius, Hallward, Stern and Kadleck. **Livy admits his authorities disagree about the prisoners**; the volones, the burial alive and the Delphic mission are his, and "most of the Greek coast" was Livy's claim alone. The counts leave the date line, which is one row, 216. |

**Read by eye.** *Confusability:* `rm-211`/`rm-212` are the march and the weapon; `rm-213`–`rm-215` three battles told by their own clues (cavalry skirmish and the rescue, the ambush in the brambles, the lake and the omens); `rm-216`/`rm-217` the man and the strategy, with the Washington, Fabian Society and oxen clues kept to the strategy; `rm-218`/`rm-219`/`rm-220` the battle, the concept and the aftermath. *Legend:* Livy's vinegar, omens, the slave rescuer, the burial alive and the severed rings are each Livy's. *Chronology:* the Ticinus and Trebia years are Dodge's, the Cannae year a convention. *Overlap:* `wh-347` says Quintus Claudius, quoted by Gellius, gives 2 August for Cannae; not read here and not printed.

### B23 — `rm-221`–`rm-230`, the Punic Wars: Capua and Syracuse to Masinissa (2026-10-22)

Run as B22. Checks: `rm-audit.js --range=rm-221:rm-230` reads clean on eight cards; the rest are `L.missing` on `rm-226` and `rm-228` (their locators could not be added; both are in "Pictures to redo"). `check-questions`, `check-cards` and `check-citations --card` (0 mismatched on every card) pass; every citation URL answers 2xx but one archive.org scan of the Cambridge Ancient History that answered 504 and is kept (it answered earlier). From `rm-221` on, the narrative source is Livy as often as Polybius, so the faults are **Livy's scenes told as events** (Vibius Virrius's banquet, the Capuan consulship demand, Sophonisba's cup, the severed head), **army sizes** (Livy's 56,000 at the Metaurus against Polybius's 10,000, Polybius's 70,000 at Ilipa) and **old modern scholarship**: Hallward in the 1930 Cambridge Ancient History, Dodge, Ihne and Arnold are what archive.org yields, so the modern half is dated; where a recent source was read (Rorres, Richardson, Ridley) it is used.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-221` defection of Capua | 7 | 7 → 7 | Seven Livy citations are now two Livy with Hallward, Dodge, Lendering and two BMCR reviews. **Livy's "Capua ruined Hannibal's army" is moralising that Hallward calls an "annalistic fable" and Dodge "purely hypothetical"**; Vibius Virrius's banquet is Livy's speech. The counts leave the date line (revolted 216, retaken 211). |
| `rm-222` siege of Syracuse | 7 | 7 → 7 | **The siege's length is three authors' three figures** (Polybius eight months, Livy's "third year" for Marcellus, Hallward two and a half years); the burning mirror is a late legend (Rorres). Hieronymus died 214 (Rorres, Hallward). Counts leave the date line. |
| `rm-223` Spanish campaigns of the Scipios | 6 | 6 → 8 | **Livy's 20,000 Celtiberians is his figure, which Hallward doubts**; Hallward calls Livy's order sending Hasdrubal to Italy in 215 clearly false and Marcius's exploits plain fictions. Appian's version of Publius's death added. "For eight years" is out of the question. |
| `rm-224` Scipio Africanus | 8 | 6 → 8 | **"About 24, in 210 BCE" converted an age into a year.** The Ticinus rescue is the Scipio family's tradition (Hallward), against Livy's rival Ligurian slave; the serpent and Capitol stories are legend voice; Polybius's "calculator, not a favourite of fortune" is his argument. The trials are hedged through Glew's review. |
| `rm-225` capture of New Carthage | 6 | 8 → 7 | **Neptune, the lagoon ebb and the captive girl are each an author's** (Polybius's ebb, Livy's midday ebb with a north wind, a sailing guide's "no tides" against both); Livy admits the numbers differ wildly. The date line is 209 only. |
| `rm-226` Battle of Ilipa | 6 | 6 → 6 | **Polybius prints no year**; 206 (Scullard, Goldsworthy, Hornblower) or 207 (Hallward, because Livy's order leaves 207 nearly empty). Polybius's 70,000 and Livy's 50,000 for Hasdrubal are theirs; the congratulation anecdote is dropped. |
| `rm-227` Hasdrubal's march into Italy | 6 | 6 → 7 | Six Livy chapters are now Livy and Polybius with five moderns, **all but one of them 1898–1930**. The council's reasoning is Livy's reconstruction; the Arverni, the roads and Placentia are his; the pass is not named by any source. |
| `rm-228` Battle of the Metaurus | 7 | 8 → 7 | **Nero took 6,000 foot and 1,000 horse (Livy 27.43), not "6,000 men"**; the "250 miles" was Dodge's own conversion and is dropped. Ten elephants and the flank march are Polybius's; Livy's 56,000 and Polybius's 10,000 are each given; the severed head is Livy's story. |
| `rm-229` Scipio's African campaign | 6 | 8 → 6 | Polybius 14.1 – 14.8 were eight sources. **The old Q2 misquoted Polybius's "most splendid" remark** (14.5.15); Livy's 40,000 dead is his, against Gsell's view that neither army was destroyed. The siege of Utica was abandoned, not kept through the campaign. |
| `rm-230` Masinissa | 6 | 6 → 7 | **Polybius says "nine other sons", not "nine grown sons"**, and "ninety" is his word, not a printed year. Sophonisba is Livy's story, with Appian's variant and Gsell's caution. The old four Livy citations are now one. |

**Read by eye.** *Confusability:* `rm-221`/`rm-222` are the revolt and the siege; `rm-223`/`rm-224` the campaigns and the man; `rm-225`/`rm-226` the city's capture and the set-piece battle; `rm-227`/`rm-228` the march and the battle; `rm-229`/`rm-230` the campaign and the king. *Legend:* every Livy set piece named above is told as Livy's. *Chronology:* the Ilipa year is split (206 or 207) and says whose each is. *Overlap:* no `gr-` or `wh-` card disagrees; `rm-223`'s picture is also on `gr-217`; `rm-271` had given 211 BCE for Syracuse's fall; B28 dropped it.

### B24 — `rm-231`–`rm-240`, the Punic Wars to the Macedonian Wars: Zama to the Second Macedonian War (2026-10-22)

Run as B23. Checks: `rm-audit.js --range=rm-231:rm-240` reads clean on nine cards (`rm-235`'s two non-"Why" FAQs were reworded and the card re-applied); the rest is `L.missing` on `rm-231`. `check-questions`, `check-cards` and `check-citations --card` (0 mismatched on every card) pass; every citation URL answers 2xx except two DOIs whose publishers (Wiley, Chicago) answer 403 to a script and that Crossref confirms. From here the narrative source thins to Polybius's fragments, so the faults are **Livy's speeches and figures told as record** and **a year no source prints**: Polybius prints no BCE year anywhere, so every year on these lines is a modern author's.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-231` battle of Zama | 8 | 9 → 8 | Nine chapters of one Polybius page are now Polybius, Livy and Appian with five moderns. **The year 202, the season (spring, early autumn or 19 October) and the site (Zama or Naraggara) are shown as unsettled**; the interview of Scipio and Hannibal is Polybius's report with Ihne's doubt. Polybius's casualties and Appian's differ; no army size is printed. |
| `rm-232` peace of 201 BCE | 7 | 6 → 7 | **Livy's armistice price (25,000 pounds of silver) had been told as a peace term**; the terms are Polybius 15.18, Livy 30.37 and Appian 54, which differ (Appian gives 250 talents a year). Hallward dates the earlier 5,000-talent draft to autumn 203. Hannibal's speech is the author's composition. |
| `rm-233` Italy after Hannibal | 7 | 5 → 10 | **The old card told the debate as settled** and printed 209 for the colonies' refusal (no source), 210 for a loan (a consular year converted) and a 218 – 201 war row. It is now the Toynbee thesis and its critics (Beloch–Brunt, Potter, Rosenstein, Launaro), with no depopulation asserted; Livy's census total is Livy's. Four sentences on debate, because the debate is the subject. |
| `rm-234` Third Punic War | 8 | 8 → 9 | Polybius ×5 and no modern author are now Polybius, Appian ×2, Plutarch and five moderns. **The 58,000 army was Appian's figure; the "just war" maxim is one Polybius quotes from Demetrius.** Cato's fig is Plutarch's "it is said". Motive is a modern debate. |
| `rm-235` destruction of Carthage | 8 | 7 → 8 | Seven Appian citations are now Appian ×2, Polybius, Strabo and four moderns. **The salting of Carthage is stated as a modern myth** (Ridley 1986; Drogula); the 700,000 and 300 cities are Strabo's; Appian's decree forbids living there but not going upon the ground. The counts leave the date line. |
| `rm-236` Conference of Naupactus | 6 | 8 → 6 | Two questions carried 217 and are rewritten; Polybius's "Olympiad" row was not a BCE date. **Agelaus's speech is Polybius's version** (Walbank: "if we can believe"); Justin's storm cloud is Philip's pretext, not Agelaus's. |
| `rm-237` Illyrian Wars | 6 | 7 → 6 | **Polybius's account of the envoy's death is his; Appian's differs and Holleaux doubts that Teuta ordered it.** The years 229, 228 and 219 are Holleaux's. The old question stated the killing as fact. |
| `rm-238` First Macedonian War | 7 | 5 → 7 | **"Every gain of the Illyrian wars" is dropped: the treaty list in Polybius 7.9 omits Issa.** The Aetolian pact is "212 or 211"; the interception of Philip's envoys is Holleaux's account, not Livy's, and Holleaux judges Livy's terms a fabrication. |
| `rm-239` Philip V | 7 | 6 → 8 | **Polybius dates the turn in Philip's character to the Messene affair, not to the war with Rome.** The "c. 2,000" statues and the unsourced Thermum year leave the date line; Polybius is sometimes admiring and sometimes hostile, said so. |
| `rm-240` Second Macedonian War | 7 | 6 → 8 | **"All but six warships" is a sum nobody prints: Polybius 18.44 says five light vessels and the great ship.** Aemilius at Abydos is not clearly the ultimatum (Polybius has it go first to Nicanor at Athens; Mommsen and Holleaux disagree); the Aous and the Malian Gulf parley added. |

**Read by eye.** *Confusability:* `rm-231`/`rm-232` are the battle and the peace; `rm-233`/`rm-234`/`rm-235` the countryside debate, the war and the end of the city; `rm-236`/`rm-237`/`rm-238` the conference, the Adriatic wars and the first war with Macedon; `rm-239`/`rm-240` the king and the second war. *Legend:* Cato's fig, Teuta's order and the Zama interview are each an author's. *Overlap:* `gr-792` says Apamea was "ten thousand talents over ten years", which no source read gives (see `rm-248`); `gr-851`/`gr-852` agree with `rm-239`/`rm-240`.

### B25 — `rm-241`–`rm-250`, Rome and the Mediterranean: Cynoscephalae to the Third Macedonian War (2026-10-22)

Run as B24. Checks: `rm-audit.js --range=rm-241:rm-250` reads clean on eight cards; the rest is `L.missing` on `rm-246` and `rm-247`. `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; every citation URL answers 2xx; `check-citations --card` 0 mismatched on every card. Two housekeeping faults were found and fixed: **`rm-250`'s Wikipedia link and glossary entry pointed at Perseus the hero**, so `wiki-links.json` now maps it to "Perseus of Macedon" by hand (`manual`, not fetched: Wikipedia is unreachable from the sandbox) and the glossary entry for the king is `Perseus_of_Macedon`; **`rm-244`'s and `rm-246`'s glossary entries lacked the alias that the card's answer needs** (`Antiochus III`; `Battle of Thermopylae, 191 BCE`), which the redrafted entries add. Livy and Polybius remain the ancient sources; the modern half is Holleaux, Bevan, Benecke and Mommsen from archive.org and the Cambridge Ancient History (1902–30), with a few recent abstracts.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-241` Battle of Cynoscephalae | 7 | 8 → 8 | Eight Polybius chapters are now Polybius, Livy ×2 and Plutarch with four moderns. **The 8,000 dead and 5,000 captured are Polybius's; Livy rejects the 40,000 and 32,000 of Valerius and Claudius and Plutarch the epigram's 30,000.** The year is the modern reckoning; the site is disputed (Hammond, Sears and Butera). |
| `rm-242` Titus Quinctius Flamininus | 7 | 6 → 7 | **Philip stayed aboard only at the first Nicaea meeting and came ashore the next day (Polybius 18.8)**; "Nicaea 198" is dropped, no source printing it. **Plutarch does not mention the gold stater**; it rests on the British Museum caption and a modern summary. |
| `rm-243` freedom of the Greeks | 6 | 6 → 6 | **The old text gave Plutarch's "all garrisons removed" as fact; Polybius, Eckstein and Holleaux have Roman troops in the Acrocorinth, Demetrias and Chalcis until 194.** The slogan is shown as a diplomatic weapon (Philip, Antiochus, the Aetolians' "words, not things") and the proclamation as a manumission in form. |
| `rm-244` Antiochus III | 7 | 5 → 7 | Polybius ×5 became Polybius, Strabo and five moderns; a question carried a year. **The accession is 223 (Bevan) or 222 (Livius.org); his death place differs between Strabo, Bevan and Livius.org.** "Elephants 150" is a count and goes. |
| `rm-245` Roman–Seleucid War | 6 | 5 → 6 | Now the whole war, not the Sardis terms (Apamea detail). **Livy's Thoas and Hannibal speeches are attributed, and the Hannibal–Scipio talk at Ephesus is an anecdote** Holleaux calls a legend. The old "first war against a power based in Asia" had no source. |
| `rm-246` Battle of Thermopylae, 191 BCE | 6 | 5 → 6 | **The elephants slowed the Roman pursuit, not the Seleucid retreat (Livy 36.19)**; old Q2 said the heights were not held when Antiochus sent Aetolians who failed. Plutarch, Livy and Appian on Cato's march are set side by side, and all three notice the echo of 480 BCE. |
| `rm-247` Battle of Magnesia | 6 | 5 → 7 | **A "324 Roman dead" sum nobody prints** (Livy 300 foot and 24 horse, Appian 24 knights and 300 foot) is gone, and the year is split: 190 (Shuckburgh) or probably January 189 (Holleaux, because the Roman March of that time fell between October and December). Livy and Appian differ on who commanded. |
| `rm-248` Treaty of Apamea | 6 | 5 → 6 | **The indemnity is laid out by stage and source**: Scipio's first terms 15,000 Euboic talents (Polybius), Livy's treaty 12,000 Attic talents over twelve years, Paton's English Polybius reading 12,000 a year. "Treaty of Apamea" is a modern name. The first phrasing duplicated `rm-232` and is replaced. |
| `rm-249` Third Macedonian War | 6 | 5 → 7 | **One Livy anecdote chain with speeches told as record is now the whole war, hedged**: Polybius calls the plot against Eumenes at Delphi the beginning, not the cause; Livy's truce speech is his; the order of fighting round Lake Ohrid is argued (Milivojević). The counts leave the date line. |
| `rm-250` Perseus | 6 | 7 → 8 | The old Polybius question garbled 29.9; **the forged letter in Flamininus's name is Livy's story, and the forger is Livy's, not Polybius's**; the "Alba from 167" row is dropped. Plutarch gives two ways he might have died (starved or kept awake). |

**Read by eye.** *Confusability:* `rm-241`/`rm-242` are the battle and the man; `rm-243`/`rm-244` the slogan and the king; `rm-245`–`rm-248` war, pass, plain and treaty; `rm-249`/`rm-250` the war and the king. *Legend:* the Ephesus talk and the forged letter are each an author's. *Overlap:* `gr-792` says Apamea was "ten thousand talents over ten years", which no source read gives; `gr-793` says Antiochus "took Alexandria" and starts that war in 170, which `rm-254` does not bear out; `rm-245`/`rm-248` agree with the talents as set out here.

### B26 — `rm-251`–`rm-260`, Rome and the Mediterranean: Pydna to the revolt of Aristonicus (2026-10-22)

Run as B25. Checks: `rm-audit.js --range=rm-251:rm-260` reads clean on five cards; the rest are `L.missing` on `rm-251`, `rm-257` and `rm-258` (a battle and two provinces), `I.duplicate` on `rm-256` (with `wh-349`) and `Q.sibling` on `rm-259` (a phrasing shares half its content words with one of `rm-281`'s, which is rewritten in B29 and must not reuse Attalus's money). `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card; every citation URL answers 2xx (one archive.org mirror of Mommsen answered 500 once and 200 on a second try). The ancient narrative is now Livy and the fragments of Polybius, so **the faults are a later date or a story given as record**.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-251` Battle of Pydna | 7 | 5 → 8 | **The old date line printed Livy's casualties as rows, including an "11,000 prisoners" sum Livy never prints**; it is now one day, 22 June 168 BCE, a modern conversion via the eclipse. Polybius's phalanx-against-legion analysis added; the sources' gaps (Livy breaks off) said. The Paelignian standard story is "in one account". |
| `rm-252` Lucius Aemilius Paullus | 6 | 5 → 6 | **The censor and death years (164, 160) come only from the Loeb translator's footnotes, and the card says so.** The old Epirus question had Paullus "promising" to withdraw garrisons where Livy has a ruse; the sons question had him say he "had none" left, where Plutarch's speech says he had lost his children. Livy and Plutarch give opposite orders for the boys' deaths. |
| `rm-253` settlement of Macedonia | 6 | 5 → 6 | **"Trade across the boundaries" was wrong: Livy 45.29 forbids intermarriage and buying land or houses across district borders.** The date line is 167 (the modern year; no ancient source prints one) and 158 (mines reopened). The gold and silver mines closed, the iron and copper stayed open at half the royalty. |
| `rm-254` Day of Eleusis | 6 | 5 → 8 | **The merged telling is separated by author**: Polybius has the vine stick and the copy of the decree, Livy the tablet and the wand, Diodorus follows Polybius, Appian says only "think about it here"; **Eleusis is not in Polybius's surviving text, which has Pelusium.** Date line 168 only. `gr-793` says Antiochus "took Alexandria" and puts that war in 170; this card prints neither. |
| `rm-255` Achaean War | 7 | 9 → 8 | **"Polybius in Africa with Scipio" is Orosius's claim, not Polybius's**, and is dropped. Polybius was an Achaean who despised the war party and later helped settle the cities; his account survives in pieces. The settlement's ban on property in other states is Pausanias's. |
| `rm-256` sack of Corinth | 7 | 5 → 8 | **"Polybius was present" is Strabo's report; "deserted" is set beside Lendering's "not completely deserted"**; Mummius's warning to the shippers is Velleius's. No year is printed for Caesar's colony (46 and 44 are both given). The corrected glossary entry is shared with `gr-864`, which is not edited. |
| `rm-257` province of Macedonia | 6 | 8 → 8 | **"Put down 147 BCE" came from Lendering's bracketed margin year, and "about 860 km" is a figure no source gives.** The line is organised 148 (the Macedonian era) and the uprising 149; Mommsen's two years later and the dispute over the Egnatian Way's builder are hedged. |
| `rm-258` province of Asia | 7 | 7 → 7 | Strabo ×3 and Cicero ×4 are now three ancient and four modern sources. **The tax law is 123 for some, with the companies reaching Asia only about 100 BCE for others**; Phrygia was given to Mithridates V and added in 116. Cicero's letter to Quintus is Cicero's argument. |
| `rm-259` bequest of Attalus III | 7 | 6 → 8 | **Justin's gossip about poisons and bronze-casting was told as fact, and the will as a gift of the "whole kingdom"**; the debate is now stated (kingdom or property; whether Pergamum was freed; Sallust's "forgery"). Rome's slowness is Kallet-Marx's view against Last's "accepted without hesitation". |
| `rm-260` revolt of Aristonicus | 6 | 5 → 6 | **Crassus was killed in 130, not 131, the year he was consul**; the start is 133 or 132. The capture year is dropped because no source prints it. The modern doubt that it was a slave revolt is stated; Aristonicus's death is Strabo's, Last's and Mommsen's separately. |

**Read by eye.** *Confusability:* `rm-251`/`rm-252` are the battle and the man; `rm-253`/`rm-254` the settlement and the circle; `rm-255`/`rm-256` the war and the sack; `rm-257`/`rm-258` the two provinces; `rm-259`/`rm-260` the will and the revolt, with the Eudemus and Blossius clues kept apart. *Legend:* the vine stick, the Paelignian standard, the poison garden and the "Heliopolitae" are each an author's. *Overlap:* `gr-189` and `gr-864` differ slightly on Corinth (details in the drafts); `gr-861` has a Pydna relief photograph; `gr-793` as above.

### B27 — `rm-261`–`rm-270`, Rome and the Mediterranean: the conquest of Spain to the wealth of empire (2026-10-23)

Run as B26, on a new day. Checks: `rm-audit.js --range=rm-261:rm-270` reads clean on four cards; the rest are `S.chip?` on `rm-261`, `rm-262` and `rm-264` (English BMCR reviews of French- or German-titled books: the known false positive), `I.none` on `rm-267` and `rm-268`, and `I.duplicate` on `rm-269` (with `rm-202`). One source (`rm-268`'s Italian Cimma note) was written with its chip after the URL's closing full stop and flagged "NO URL" by `urlcheck`; it was corrected to `…pdf. [in Italian] [Open access]` and the card re-applied. `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card; every citation URL answers 2xx. The modern half of the Spanish cards is Schulten (Cambridge Ancient History vol. 8, 1930) and BMCR reviews of recent French and English books; **Appian's *Iberica* is the one ancient narrative, a second-century CE Greek, so every figure is his and said so**.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-261` Roman conquest of Spain | 7 | 5 → 8 | **The old text said the two Spains "date from" the praetors' lot of 197; Livy 32.28 does not say so** (Schulten prints 197 for the boundary). The Strabo and Justin material is gone; the line is 218, 197, 133, 29 – 19. A reviewer reads Appian as seeing Iberia as an administered empire from the Hannibalic war, so later resistance became rebellion in his telling. |
| `rm-262` Celtiberian Wars | 6 | 6 → 6 | **"First" and "Second" are a modern numbering.** "Fiery war" is a Suidas excerpt of Polybius, not tied to a numbered war; Nobilior's "praetor" is Appian's label (Schulten has him consul); the 1 January start of the consular year is Schulten's. |
| `rm-263` Lusitanian War | 6 | 6 → 7 | **Appian gives no death toll for Galba's massacre: the 30,000 is Suetonius's "they say"**, and Livy's summary says the survivors were sold, not killed. Lendering's margin years were an editor's; the line is 155 – 139 and 150. Lusitania was a region, not a state. |
| `rm-264` Viriathus | 6 | 6 → 8 | **"Rome does not approve" is Eutropius 4.16, not Diodorus 33.21** (the English wording is a reading of the Latin). The ancient authors give eight, eleven and fourteen years for his leadership; Diodorus has the swords by night in his tent where the old text said "in his sleep". |
| `rm-265` Numantine War | 6 | 8 → 7 | **"Naked" is Appian's; Plutarch says "unarmed and in bonds".** "8,000 against 60,000" was a count on the date line; the line is 143 – 133, 137, 134, as Schulten prints them. The war's heavy losses are tied to Gracchus's land reforms by one account only. |
| `rm-266` Scipio Aemilianus | 7 | 6 → 7 | **The old glossary stated the "Scipionic circle" as fact**; reviewers now report that few believe in it as a real group. The old Q3 duplicated `rm-235`'s weeping at Carthage and is replaced. His death in 129 is unexplained, with rumours of murder or suicide (Appian). |
| `rm-267` Roman provincial system | 7 | 8 → 7 | **"Six praetors from 197 BCE" was an agent's conversion (Livy 32.27 prints no year)** and goes. Republican Latin had no word for "governor"; a universal *lex provinciae* is doubted (Richardson, BMCR); the imperialism debate is in. |
| `rm-268` publicani | 6 | 7 → 8 | **"66 BCE" for the Manilian speech and "167 BCE" for the mines were agent conversions** and go. The old card was Cicero ×4; the card now has the share-trading debate (Malmendier, Poitras and Geranio) and a Traditional 493 (Dionysius's date) with the army contract of 216. |
| `rm-269` provincial taxation | 7 | 7 → 7 | **The old card was a string of Cicero's sentences**, claiming "the other provinces yielded barely enough" (rhetoric for Asia). Now the patchwork (Sicily's tenth, Spain's fixed sum and twentieth, Macedonia's halved tribute, Asia's censorial contracts), with Plutarch's debt story. |
| `rm-270` wealth of empire | 7 | 6 → 8 | **"Treasury 157 BCE, per Pliny" is an agent's conversion; Antias's 120,000,000 sesterces is his figure, which Livy doubts.** Cato's caviare complaint was wrongly given to Polybius. Frank's cautions on the totals are added. |

**Read by eye.** *Confusability:* `rm-261`/`rm-262` are the long conquest and the numbered wars; `rm-263`/`rm-264` the war and the man; `rm-265`/`rm-266` the siege and the general; `rm-267`/`rm-268`/`rm-269`/`rm-270` the system, the contractors, the taxes and the wealth, each phrasing using clues only its term has. *Legend:* Galba's massacre numbers and the "fiery war" label are each an ancient author's. *Chronology:* the Spanish years are Schulten's, and where a source prints none (Polybius, Appian) the card says so. *Overlap:* no `gr-` or `wh-` card covers these subjects; the Numantia and Lusitanian cards share nothing with `wh-` cards.

### B28 — `rm-271`–`rm-280`, Rome and the Mediterranean to the Republic in crisis: Greek influence to the First Servile War (2026-10-23)

Run as B27. Two cards (`rm-279`, `rm-280`) were not written by the first `batch.sh` run (the audit showed their old text); `apply.js rm-279 rm-280` wrote them and **every card from `rm-201` to `rm-280` was then compared against its draft** (source count and abstract): no mismatch. Checks: `rm-audit.js --range=rm-271:rm-280` reads clean but for `I.none` on all nine cards that have no picture, `S.chip?` on `rm-272` (an English review of a German-titled book: the known false positive) and `Q.sibling` on `rm-277` (a phrasing shares content words with one of `rm-762`'s, which a later pass must keep apart). `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card; every citation URL answers 2xx. The cards of this batch were mostly **all-ancient**, so the work was the modern half and the date lines.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-271` Greek influence on Roman culture | 8 | 6 → 9 | **The old "Syracuse taken 211 BCE" is dropped (`rm-222`'s sources have the siege ending in 212 and no source read prints a year for Livy's remark)**; Livy's "Greek influence began at Syracuse" is set against Gruen's view. The alphabet (c. 800 – 750) converts "first half of the 8th century"; Horace's line is the agent's own rendering of the Latin. |
| `rm-272` philhellenism | 7 | 6 → 10 | The old card treated the attitude as one thing and had no definition. **"Philhellenism" is a modern term**; Gruen finds no philhellenic party, the Scipionic circle is a Ciceronian ideal, and Postumius Albinus and Lucullus show the double edge. The unsourced date line is dropped (undatable). |
| `rm-273` Cato the Elder | 8 | 6 → 9 | **The old card put Livy's composed Oppian-law speech in Cato's mouth**, and claimed he was "the only Roman whose speeches survive"; the speech is now Livy's, flagged with Dziuba. Old Q1 made a year-free but false claim; all three phrasings are rewritten. The assessment figures are not converted. |
| `rm-274` Bacchanalian affair | 7 | 7 → 7 | **The old question carried "186 BCE" and two date rows were counts.** The decree is now read from the Tiriolo tablet: the limit of five worshippers, the praetor's leave, a quorum of a hundred senators. The 7,000 is Livy's "asserted" figure; the murders and forgeries Livy lists are not in the decree. `gr-994` says the decree "banned" the rites; it limits them. |
| `rm-275` sumptuary law | 7 | 5 → 9 | **The old text gave Livy's and Plutarch's Cato as plain fact; Livy composed those speeches** (Mastrorosa). Livy's 15,000 asses at ten times value replace Plutarch's drachma sum; Gellius's three tiers (100, 30 and 10 asses) added; the laws' ineffectiveness is a modern view. |
| `rm-276` crisis of the Roman Republic | 8 | 5 → 9 | **"Crisis" is a modern concept**; the usual start (133) and end (31 or 27) are conventions, with one critic stopping at 49. Sallust's and Polybius's diagnoses are the ancients' own. A phrasing that `rm-348` already uses (Appian's sword never carried into the assembly) is dropped. |
| `rm-277` latifundium | 6 | 5 → 7 | The old date line held the land law's facts (500 iugera, 133), which belong to `rm-282`/`rm-283`; the card is now the estate type. **Pliny's "six proprietors held half of Africa" is his verdict**; Cato's 240- and 100-iugera model farms are his figures; Launaro's 27 surveys cut against the old idea. Date line "". |
| `rm-278` decline of the Italian smallholder | 7 | 5 → 8 | **Polybius was bent into "in the fleet rather than in the legions"; his sentence says only that men rated under 400 drachmae served at sea.** Tiberius's wild-beasts speech is Plutarch's report; Brunt's census figures carry the dates he prints; the low-count / high-count and survey split is stated. |
| `rm-279` slavery in Italian agriculture | 7 | 5 → 8 | The old line ("prosperous 60 years, then revolt", "3 kinds of instrument") was not dates, and half the abstract was Diodorus's Sicilian herdsmen (now `rm-280`). **Varro only reports that "some divide" slaves into three classes.** Scheidel's "at most 1.5 million" is a model; Strabo's 10,000 a day at Delos is his figure. |
| `rm-280` First Servile War | 7 | 5 → 8 | **"Under Cleon 70,000 slaves" was Livy's figure for one gathering, not the army's size**; Livy's and Diodorus's figures are labelled theirs. The fire-breathing trick is Diodorus's own "trick". The span is c. 135 – 132, with a review's roughly 141 – 131. |

**Read by eye.** *Confusability:* `rm-271`/`rm-272` are the influence and the attitude; `rm-273`/`rm-274`/`rm-275` the man, the affair and the laws, each with only its own clue; `rm-276` the whole period; `rm-277`/`rm-278`/`rm-279`/`rm-280` the estate, the smallholder's fate, the system and the revolt. *Legend:* Eunus's fire-breathing trick, Livy's Oppian-law speeches and Cato's speeches are the ancient authors'. *Chronology:* `rm-271`'s old Syracuse year is gone, which settles the `rm-222` note under B23. *Overlap:* `gr-994` on the Bacchanalia as above; no `gr-` or `wh-` card on sumptuary law, latifundia or the Servile War disagrees.

### B29 — `rm-281`–`rm-290`, the Republic in crisis: the Gracchi (2026-10-23)

Run as B28; after `batch.sh` every draft was compared with its card (source count and abstract): no mismatch. Checks: `rm-audit.js --range=rm-281:rm-290` reads clean but for `I.none` on eight cards that have no picture and `S.chip?` on `rm-281` and `rm-282` (English BMCR reviews of German-titled books: the known false positive). Two drafts were fixed by hand before applying: `rm-282`'s date row "367 BCE, older limit" (a non-date in a value) and `rm-284`'s third phrasing (it repeated "on the Capitol" from the first). `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card; every citation URL answers 2xx. The Gracchan story is told by Plutarch and Appian, who write centuries later from hostile or friendly sources, so **each version of an act, a number or a speech is given to its author**: the 300 dead are Plutarch's, "first bloodshed" is Appian's, Velleius's and Plutarch's, and the head-and-gold tale is Plutarch's.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-281` Tiberius Gracchus | 8 | 6 → 8 | **The old card was mostly `rm-282`, `rm-283` and `rm-284` content under the man's name** (bill terms, the three commissioners, the vote-day urns, the Attalus bequest, the killing); now the man: parentage and Scipio kin, Numantia and the Mancinus treaty (Plutarch's 20,000 attributed), and the motive accounts (Velleius's fear of trial, Gaius's Tuscany story as Gaius's own claim). The Attalus and Eudemus phrasing is gone, which also clears `rm-259`'s `Q.sibling`. |
| `rm-282` lex Sempronia agraria | 6 | 5 → 7 | The old date line carried counts ("Cap 500 iugera, +250 per son"); the card now tells **Plutarch's two drafts (compensation, then withdrawn after the veto)**, the sale ban and its repeal, and the doubt over the older limit (367, By tradition). Appian puts the ceiling at 500 iugera and Livy's summary at 1,000. |
| `rm-283` Gracchan land commission | 6 | 5 → 8 | **The surviving boundary stones (CIL I² 639, 640, 643, 644) do not name Tiberius**: they name Gaius with Appius Claudius and Licinius Crassus, or with Fulvius Flaccus and Papirius Carbo, so they record later boards. Livy's census figures are Livy's and the rise is disputed (Brunt, Rosenstein, de Ligt, Roselaar). The 129 stall is Greenidge's date. |
| `rm-284` death of Tiberius Gracchus | 7 | 5 → 8 | **"Pontifex maximus Nasica" is hedged (Velleius and Greenidge disagree with Appian)**; "first bloodshed" is Appian's, Velleius's and Plutarch's; the 300 dead are Plutarch's (Appian says only many). Plutarch 20 names neither Popillius nor a *quaestio*; Cicero's *Amic.* 37 is Laelius's judgement inside a dialogue. |
| `rm-285` Gaius Gracchus | 8 | 6 → 8 | **The old lead question said he "carried in two years a programme his brother had not attempted" (no source says it)**; the order of his laws is disputed (Livy's summary puts most in the first year, Appian in the second; Last thinks Appian mistook re-election). The franchise offer is to Latins or to all Italians, by author. |
| `rm-286` lex frumentaria | 6 | 5 → 6 | **"The first standing food subsidy" is no source's** (Mommsen notes earlier provincial grain, Last Hellenistic cheap food). The price of 6⅓ asses is Livy's *Periochae* only, "per modius" from Last and Rickman; recipient numbers and cost are stated as unknown; Saturninus's later law (103 or 100) has a price of five-sixths of an as. |
| `rm-287` equestrian order | 7 | 5 → 8 | Now from Livy's tradition through the censors, the public horse and Pliny's 400,000 sesterces to Appian against Plutarch, Brunt's reconciliation and the debate whether the order was a Gracchan creation. **"300 senators + 300 knights" was a count and goes**; Livy's *Periochae* is the weakest witness on the jury law (Brunt). |
| `rm-288` extortion court | 6 | 5 → 7 | **The old card printed 171 BCE for the Spanish case (no source prints it) and never told the court**: the Calpurnian court (149), the Lex Acilia from the Bruns text on archive.org (the 450/100/50 jury selection; single and double restitution), Sulla and 70. The line defining jurors by the public horse sits in a restored gap and is not claimed. |
| `rm-289` senatus consultum ultimum | 6 | 5 → 7 | **The old card said "no source settles" the legal question; moderns have argued it for 150 years.** The name is a modern label (Sallust and Caesar word it differently); Giumetti lists the uses (100, 63, 49); the legal-force debate is three sentences. The 121 BCE crisis belongs to `rm-290`. |
| `rm-290` death of Gaius Gracchus | 7 | 5 → 7 | The old abstract retold the Antyllius incident and the decree (that is `rm-289`) as fact and stopped at the bridge. **Plutarch himself records two versions of the servant's part and Appian gives a third**; the head-and-gold story, the 3,000 dead and the temple of Concord are each attributed. `wh-350` states the death by his slave as fact. |

**Read by eye.** *Confusability:* `rm-281`/`rm-282`/`rm-283`/`rm-284` are the man, the bill, the board and the killing; `rm-285`/`rm-286` the brother and the grain law; `rm-287`/`rm-288` the class and the court; `rm-289`/`rm-290` the decree and the death, with each phrasing keeping to its own term. *Legend:* the Etruscan journey, the head weighed in gold and the club-wielding senators are Plutarch's or Appian's. *Overlap:* `wh-350` as above; `rm-287`'s "300 + 300" jury figure conflicts between sources and is not printed.

### B30 — `rm-291`–`rm-300`, the Republic in crisis: the labels, Jugurtha, Marius and the Cimbri (2026-10-23)

Run as B29; every draft compared with its card: no mismatch. Checks: `rm-audit.js --range=rm-291:rm-300` reads clean on two cards; the rest are `I.none` on five, `L.missing` on `rm-298`, `rm-299` and `rm-300`, and `S.chip?` on `rm-295` and `rm-296` (an English BMCR review of a French-titled book: the known false positive). `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card; every citation URL answers 2xx. The ancient authors are Sallust, Plutarch and Livy's *Periochae*, so **the faults are speeches and anecdotes given as record and labels given to the wrong author**: Sallust never uses "optimates" and "populares", which are Cicero's; "the Marian reforms" is a modern label for piecemeal remarks; the Alpine and Jugurthine set pieces are Plutarch's or Sallust's.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-291` optimates and populares | 7 | 6 → 7 | **The old text said Rome divided "ever after" into two named camps and that Sallust "ties the labels to particular men"; the labels are Cicero's (*Pro Sestio* 96 – 97)**, and Sallust speaks of the Senate and people, nobles, and "parties and factions". The "party" picture is set against Syme, Mouritsen, Robb, Arena and Yakobson. |
| `rm-292` Jugurthine War | 7 | 6 → 7 | **Sallust is hedged as a moralising source with a bribery theme**; the old wording "opposition to the power of the nobility" follows Rolfe's "resistance to their insolence". The years 112, 105 and 104 are Lendering's, not Livy's, and Lendering's own bracket for the capture reads 106 against his article's 105. |
| `rm-293` Jugurtha | 7 | 5 → 9 | **"Left Rome 110 / Handed over 105" is gone: the modern sources disagree on those years.** Scipio's words, the officers' remark, the Massiva murder and the "city for sale" line are Sallust's report; the bribery charge "may or may not be true"; "twenty years ignoring" was unsourced. The old glossary called him Masinissa's "grandson by adoption" (he was a grandson by birth). |
| `rm-294` Gaius Marius | 8 | 6 → 9 | The mule and Cimbri-emergency material is cut (their own cards); **poverty is set against modern doubt, the speech in Sallust 85 is attributed to Sallust, and the seven-times prophecy (Plutarch) is told as legend**. "Consul 7 times" leaves the date line. |
| `rm-295` Marian reforms | 7 | 5 → 8 | **"Marian reforms" is a modern label** (the Cambridge Ancient History of 1932 calls the recruitment "the greatest of the Marian reforms"); the ancient reports (Sallust on the levy, Plutarch on the javelin pin and the mules, Pliny on the eagle) are set out as separate remarks, with Probst's, Rafferty's and Northwood's doubts. The 400 drachmae and 101 javelin rows go. `rm-664` prints 104 BCE for the eagle, which Pliny does not give. |
| `rm-296` capite censi | 5 | 5 → 6 | **The old card equated Polybius's 400-drachmae line with the capite censi; Polybius names no class**, so the equation is now a modern link, said to be one. Gellius's definition is the ancient anchor; the class has no sourced start date, so the date line is empty. |
| `rm-297` Cimbri and the Teutones | 7 | 5 → 8 | The old card was half Arausio and **"four armies in eight years" is a figure no source gives** (Tacitus names five consular armies). Plutarch's 300,000 is his; Celtic or Germanic and the name are hedged; Strabo doubts the flood story; the dates c. 120, 113 and 101 are all Last's. |
| `rm-298` Battle of Arausio | 6 | 5 → 6 | **"Cost more men than any defeat since Cannae" is no ancient source's; it is Mommsen's judgement only.** The consul is Mallius (Last, Mommsen), where Lendering's Livy has Manlius; the date is 6 October 105 (Last). Antias's inflation of numbers was an unsourced claim and goes. |
| `rm-299` Battle of Aquae Sextiae | 6 | 5 → 6 | The old card cited Plutarch three times. **The question printed "102 BCE", and a joined 150,000 – 200,000 range summed two authors' figures nobody prints** (Plutarch's 100,000, Livy's 200,000 and 90,000 and the Teutobodus disagreement are each attributed). The site is debated. |
| `rm-300` Battle of Vercellae | 6 | 5 → 6 | The javelin and chains anecdotes are Plutarch's; **Verona is the only alternative site any source read gives**. 30 July is a modern conversion of Plutarch's Roman day; the Velleius figure was not re-read and is not carried. |

**Read by eye.** *Confusability:* `rm-291` the labels; `rm-292`/`rm-293` the war and the prince; `rm-294`/`rm-295`/`rm-296` the man, the supposed programme and the class; `rm-297`/`rm-298`/`rm-299`/`rm-300` the peoples and their three battles, each phrasing using only its own clue. *Legend:* the seven-times prophecy, the Cimbrian women at the waggons and the chains through the belts are all Plutarch's. *Overlap:* no `gr-` or `wh-` card is about Jugurtha; `wh-351` says Marius was consul 107 – 86 BCE and does not touch these cards.

### The third hundred, in sum

`rm-201`–`rm-300` (the Punic Wars from the settlement of Sicily, Rome and the Mediterranean and the first of the Republic in crisis) are done: 590 sources became 742 and 81 glossary entries were rewritten or added. `rm-audit.js --range=rm-201:rm-300` reads 69 of 100 cards clean once the 25 locators below were added and main's clean-up of shared pictures landed (50 before); what remains is 26 cards with no picture, no picture duplicates, 1 `I.caption-source`, 17 cards with no locator when the batches ran (every battle and place whose request had to be dropped; 25 locators were added afterwards, see "Locators added"), 8 `S.chip?` false positives (English BMCR reviews of foreign-titled books) and 1 `Q.sibling`. Every picture is still the bulk-written one except `rm-202`'s, which main removed: the "Pictures to redo" table holds a verdict for each of the three hundred, and the locator list is in the same table.

What the third hundred found, again and again:
- **A year no source prints.** Polybius prints no BCE year anywhere; Livy's years are an editor's brackets; so "211 BCE" for Syracuse, "197" for the two Spains' origin, "209", "157 BCE, per Pliny", "66 BCE" and "167 BCE" for the publicani and "171 BCE" for the Spanish case were an earlier agent's conversions. Each year on a line now has a modern author who prints it, or is dropped.
- **A count or a sum on the date line.** Armies, dead, talents, hostages, ships, ranks and distances ("58,000", "324 Roman dead", "860 km", "about 9 years") were rows of the old lines; they are prose, attributed to Polybius, Livy, Appian or Plutarch, who often disagree.
- **An ancient speech or anecdote told as event.** Livy's Hannibal and Thoas speeches, Cato's Oppian-law speech, Vibius Virrius's banquet, Sophonisba's cup, the severed head of Hasdrubal and of Gaius Gracchus, the seven-times prophecy and the burning mirror are each now an author's.
- **A modern label given as ancient fact.** "Barcid empire", "the Marian reforms", "the Scipionic circle", "optimates and populares", "the Treaty of Apamea", "the salting of Carthage", the numbered Celtiberian wars and "philhellenism" are said to be modern.
- **The same ancient author many times.** Cards that cited Polybius, Livy or Appian five to nine times as separate chapter links now cite each at most twice; many had no modern scholarship, and in several the modern half is still the 1930 Cambridge Ancient History, Dodge, Mommsen and Ihne from archive.org because the recent chapters were paywalled. A pass with a library could replace them.
- **Housekeeping.** `rm-250`'s Wikipedia link and glossary pointed at Perseus the hero (fixed by hand in `wiki-links.json`); `rm-244`/`rm-246` lacked the glossary alias their answer needs; one source's chip sat after the URL's full stop. After the merge with main, `atlas/data/wars.js`, the war slice (`history-wars.bin` and its twin) and `credits.js` were regenerated (`build-wars.js --install`, `build-war-slice.js --install`): the war table takes its titles and years from the cards, so a rewrite of the Punic-War cards leaves it stale. `rm-208`'s first phrasing named Polybius (`check-cards` counts it as a scholar) and now says "one ancient count".

Overlap notes for the owner (nothing was edited): `gr-792` says Apamea was "ten thousand talents over ten years", which no source read gives; `gr-793` says Antiochus took Alexandria and starts that war in 170; `gr-994` says the Bacchanalian decree "banned" the rites; `wh-350` states Gaius Gracchus's death by his slave as fact; `gr-189` and `gr-864` differ slightly on Corinth.

### Locators added (2026-10-23)

Wikipedia answered after the batches ran, so `add-locators.js` was run on the cards whose requests had been dropped: **`rm-190`, `rm-193`, `rm-194`, `rm-197`, `rm-199`, `rm-206`, `rm-208`, `rm-213`, `rm-214`, `rm-215`, `rm-218`, `rm-226`, `rm-228`, `rm-231`, `rm-246`, `rm-247`, `rm-251`, `rm-257`, `rm-258`, `rm-265`, `rm-274`, `rm-280`, `rm-298`, `rm-299`, `rm-300`**. Every coordinate was fetched from the named article (one title per request, retried through Wikipedia's rate limit), never typed; battles carry the crossed-swords kind where the article names the battle, and the Ticinus is the Ticino river's point because its battle article carries no coordinate and the site is disputed. The two provinces (`rm-257`, `rm-258`) are `region` locators whose dashed outlines are hand-drawn approximations (the province of Macedonia about 148 BCE without Thessaly, Asia as western Anatolia); their `at` is fetched from Thessaloniki and Pergamon, because the provinces' own articles carry no coordinate.

Still without one: `rm-195` (Aspis, an identification no page read confirms), `rm-263` (Lusitania would need a hand-drawn region) and the later cards the audit still lists. `migrate-places.js` derived `places` ids for `rm-218`, `rm-246` and `rm-247` (committed with the locators); the other new toponyms stay "not fetched" in `docs/atlas-places-report.md`. A `migrate-places.js --fetch` run was started and stopped: Wikidata's query service rate-limited it, and the partial cache it wrote rewrote tens of thousands of lines of `places-wikidata.json` and broke `--check`, so the file was restored. `migrate-places --check`, `check-places`, `build-card-places --check`, `build-card-faces --check` and `test-places` pass; the new places reach the Atlas only after a full `--fetch` from an address the query service will answer.

### B31 — `rm-301`–`rm-310`, the Republic in crisis: Marius's consulships to the First Mithridatic War (2026-10-29)

Run as B30 (Commons answered 429, so no picture was touched; locators are left for the end of the session). After `batch.sh` every draft was compared with its card (sources, abstract, questions, date line, Think it through): no mismatch. Checks: `rm-audit.js --range=rm-301:rm-310` reads clean on two cards; the rest are `I.none` on eight and `S.chip?` on `rm-306` (an English BMCR review of a German-titled book: the known false positive). `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. Every citation URL answers 2xx but `rm-305`'s two American Numismatic Society coin records, which answered while the agent read them and then 503 or timed out from the batch run (the server, not the address; kept). LacusCurtius refused every connection this session, so Plutarch, Appian, Velleius and Diodorus were read on Perseus and in archive.org scans. **Every one of the ten old cards was all-ancient or nearly so**; the modern half is the 1923 Heitland, the 1932 Cambridge Ancient History, Greenidge, Mommsen, Broughton and Badian as reported, and BMCR reviews, with Tatum (2020) and Kallet-Marx where they opened. The cards' `timeline` was moved for `rm-305` (91 – 88 BCE) and `rm-308` (90 – 84 BCE) to match the new date lines.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-301` consulships of Marius | 7 | 7 → 8 | All seven old sources were ancient. **The law against a second consulship (about 151 BCE) is now Greenidge's and Mommsen's reading**; "pretending not to aim at it" is Livy's summary's and the staged refusal Plutarch's; Mommsen's "unparalleled" is a 19th-century verdict. Scipio's precedent and the triumphal-dress story are cut. |
| `rm-302` Saturninus | 6 | 5 → 8 | **"Stoned on the Capitol" was wrong and was words on a date line**: Appian has tiles from the senate-house roof, Plutarch the forum. Tribune in 103 and 100; Nonius's murder is Appian's; Cicero's claim that a slave Scaeva killed him is a pleader's for Rabirius. The glossary said "elected three times". |
| `rm-303` Second Servile War | 6 | 5 → 7 | **Diodorus 36 survives only in Photius and the Constantinian excerpts, now said.** The end is attributed (the Cambridge Ancient History puts the turn in 101, Livy's summary has Aquillius proconsul, the ovation 99); Tryphon, Athenion and Triocala added; the glossary's "Florus counts three great slave wars" is not in Florus. |
| `rm-304` Marcus Livius Drusus | 6 | 6 → 7 | **The Palatine house and the dying words are Velleius's**; the jury-law versions disagree and are given; the laws annulled on the auspices; the oath of Philippus (Diodorus 37.11) is disputed. Florus's "throat" story and the child-Cato tale (`rm-342`'s) are not used. |
| `rm-305` Social War | 7 | 6 → 8 | **Velleius's "over 300,000" dead was a date-line row; it is now his figure alone, in prose.** Added the Asculum festival killing, Corfinium renamed Italia (Velleius: Italica), the rebels' ITALIA and Oscan VITELIU denarii as contemporary evidence (the American Numismatic Society's records), Asculum's fall in 89. **prep pulled the Greek Social War's glossary entry**; the right one (`Social_War_(91–87_BCE)`) was redrafted with 91 – 88 BCE. |
| `rm-306` Italian demand for citizenship | 7 | 6 → 7 | The old card told the story in quotations and dated the grant (`rm-307`'s). Now the steps (Flaccus 125, Gaius Gracchus 122, the expulsion law 95, Drusus 91, each Heitland's year) and **the debate in one attributed sentence: the common view that the allies wanted to be Romans against Mouritsen's independence thesis.** Brunt's article was on JSTOR, unread, and is not named. |
| `rm-307` lex Julia | 6 | 6 → 7 | **Who qualified is attributed**: Appian the loyal allies, Velleius those who never took up arms or laid them down early, Cicero (pleading for Balbus) allies and Latins on condition of their assent. "Fundus fieri" is in no source fetched and is not used; the ten tribes moved to `rm-308`. |
| `rm-308` enfranchisement of Italy | 7 | 6 → 9 | **Ten new tribes (Appian) against eight (Velleius)**; the "new conflict" is Appian's verdict; the 900,000 at the census of 70 is Livy's summary's (Lendering's bracketed year not used). Added the lex Pompeia (89), Sulpicius (88), Cinna (87) and the decree of 84. |
| `rm-309` Sulla | 8 | 8 → 9 | **"Praetor by 95 BCE" was wrong**: Broughton has 93, Badian 97, both now named. The old background stopped before his consulship; the mulberry jest, the seal ring, Felix, the Memoirs (Plutarch's slanted source) and the epitaph are each their reporter's. |
| `rm-310` First Mithridatic War | 7 | 7 → 9 | The start is 89 or 88 by author; **the 20,000 talents is Plutarch's; Appian gives five years' taxes plus the war's cost, and nothing is added**; 1 March 86 for Athens is the Cambridge Ancient History's conversion of Plutarch's Kalends of March. The massacre is one clause (`rm-312`'s card). |

**Read by eye.** *Confusability:* `rm-301`/`rm-302` the consulships and the tribune; `rm-303` the Sicilian war (no clue of `rm-280` or `rm-328`); `rm-304`–`rm-308` the tribune, the war, the long demand, the one law and the process, each with its own clue (the ten tribes only on `rm-308`); `rm-309`/`rm-310` the man and the war. *Legend:* the mulberry jest, the seal ring, the Palatine house and Drusus's last words are Plutarch's or Velleius's. *Overlap:* no `gr-` or `wh-` card disagrees on these subjects.

### B32 — `rm-311`–`rm-320`, the Republic in crisis: Mithridates to the Sullan laws (2026-10-29)

Run as B31; after `batch.sh` every draft was compared with its card: no mismatch. Checks: `rm-audit.js --range=rm-311:rm-320` reads clean on five cards; the other five are `I.none` only. `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. Every citation URL answers but three from the batch run: Perseus's Smith's Dictionary entry for `rm-318` (a 302 then 403 from Perseus's rate limit; read and saved by the agent) and a Velleius page on LacusCurtius for `rm-319` (the host refused this sandbox all session; the agent's copy was read before). One phrasing was fixed by hand before applying: `rm-319`'s third ("the holder of Sulla's dictatorship" read the answer back clumsily). All ten old cards were **all-ancient**, Appian and Plutarch cited many times over as separate chapters; the modern half is the 1932 Cambridge Ancient History, Mommsen, Reinach (1890), How and Leigh (1896), Kallet-Marx (1995), Vervaet (2004), Ładoń (2021) and BMCR reviews. Mayor's *Poison King* was read only through an archive.org full-text snippet and is tagged [Paywalled].

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-311` Mithridates VI | 7 | 5 → 7 | **Appian's "57 years" of reign and "40 years" of war were date-line rows**; they are his figures in prose. Born c. 135 – 132 (Reinach and Magowska differ); the poison immunity and the mithridatium are ancient reports; the coins as a new Alexander are contemporary evidence. The old question had him run through by the Gallic officer, which Appian does not say. |
| `rm-312` Asiatic Vespers | 6 | 6 → 8 | **"80,000 – 150,000" joined two authors' figures and "Notice given 30 days" was a count**: Plutarch's 150,000 and Memnon's and Valerius Maximus's 80,000 are given apart, with Kallet-Marx's "who counted?". **The name is modern** (Reinach's "Ephesian Vespers", after the Sicilian Vespers of 1282). |
| `rm-313` Sulla's march on Rome | 7 | 6 → 7 | "The first Roman army to enter the city as an enemy" and the twelve public enemies are **Appian's**; Nola (Plutarch) and Capua (Appian) are both given; the counts leave the date line. |
| `rm-314` Cinna | 6 | 6 → 8 | The deposition row and "by his own army" go; Ancona is the moderns' place (Appian names none); **Cicero's "domination of Lucius Cinna" is a hostile witness's phrase**, set against modern views of a calm, even reforming regime. Velleius's 300 cohorts is `rm-645`'s clue and is not used. |
| `rm-315` Marian terror | 6 | 5 → 7 | **"Marian terror" is a modern label** (How and Leigh's "reign of terror"), and the accounts were reshaped after Sulla won. Appian's and Plutarch's versions of Octavius's and Ancharius's deaths and of who killed the Bardyaei are given side by side; Marius dies 17 days in (Plutarch) or on the Ides of January (Livy's summary). |
| `rm-316` civil war of 83 BCE | 6 | 5 → 7 | Appian's five legions, 6,000 horse and **1,600 ships (Plutarch: 1,200)** were on the date line; both now in prose. No ancient author gives "spring 83" (only Perrin's note), so the landing is dated 83. Added Metellus Pius, Pompey and Crassus, Teanum, Sacriportus, Praeneste and Carbo's flight. |
| `rm-317` Battle of the Colline Gate | 6 | 5 → 8 | Three count rows go; **1 November 82 BCE is Velleius's Kalends of November in the pre-Julian calendar, said so**. The wolves speech is Velleius's, Crassus's wing Plutarch's, the portcullis Appian's; the prisoners killed are Appian's over 8,000, Plutarch's 6,000 and Mommsen's 3,000 – 4,000, never summed. |
| `rm-318` proscription | 7 | 5 → 9 | Appian's 40 senators and 1,600 knights, Plutarch's two talents and Valerius Maximus's 4,700 leave the line. **The 1 June 81 cut-off is Cicero's, pleading for Roscius; Perseus's English renders "Kalendas Iunias" as the first of January, so the Latin is cited** ([in Latin]). Gratidianus's death is a story with its killer disputed. The glossary put "82 BCE" inside Appian's report. |
| `rm-319` Sulla's dictatorship | 7 | 5 → 8 | **The "120 years" on the LacusCurtius page is the translator's footnote; Appian gives only 400**, which Vervaet reads as a slip for the decemvirate; Plutarch and Velleius give 120. The title is read off Appian 1.99; the 24 axes are Appian's; the laying down is end of 81 (Badian), 80 or 79 (Vervaet). |
| `rm-320` Sullan constitution | 6 | 5 → 7 | **"Sullan constitution" is a modern label** (a 1915 history's "so-called") for laws of 81 – 80. The purpose is attributed (Livy's summary, the usual modern reading, two dissents); about 300 new senators and 10,000 Cornelii are Appian's; the undoing of 70 is one clause. |

**Read by eye.** *Confusability:* `rm-310`/`rm-311`/`rm-312` the war, the king and the massacre; `rm-313`/`rm-316`/`rm-317` the two marches and the last battle; `rm-314`/`rm-315` the consul and the killings (the stone oath only on `rm-314`, the Bardyaei only on `rm-315`); `rm-318`/`rm-319`/`rm-320` the lists, the office and the laws. *Legend:* Mithridates's poison, the stone oath, the wolves speech, Gratidianus's head and the Bardyaei are their authors'. *Overlap:* no `gr-` or `wh-` card disagrees on these subjects.

### B33 — `rm-321`–`rm-330`, the fall of the Republic: the framing, Lepidus, Sertorius, Pompey, Crassus, Spartacus and 70 BCE (2026-10-29)

Run as B32; every draft was compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-321:rm-330` reads clean on five cards; the rest are `I.none` and one `S.chip?` on `rm-324` (an English BMCR review of a French-titled book: the known false positive). `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. The URL check reported 16 failures, all LacusCurtius pages (`000`: the host refused the sandbox for most of the session); each was fetched and saved by its agent when the host answered, so they stay. One phrasing was fixed by hand: `rm-326`'s second (Plutarch's "eight months" in the cave is now attributed). `timeline` was moved for `rm-322` (78 – 77 BCE) and `rm-324` (82 – 72 BCE). Eight of the ten old cards were all-ancient.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-321` fall of the Roman Republic | 8 | 6 → 9 | **"The fall of the Republic" is a modern name, and every start and end is a convention, now each given its owner**: 133 the ancient tradition, 88 Appian, 60 Pollio (followed by Syme), 44 the first Cambridge Ancient History, then Actium or 27. Sallust, Lucan and Tacitus speak for themselves; Syme, Gruen and Flower take two sentences. The old line carried words ("Appian's count sixty years"). |
| `rm-322` revolt of Lepidus | 5 | 6 → 7 | **The Milvian Bridge battle and Pompey's part rest on Florus alone and are dropped**; his death is Appian's wasting disease or Plutarch's grief at his wife's adultery; Sallust's speeches for Lepidus and Philippus are Sallust's compositions. He is the triumvir's father. No death year is printed by any source read. |
| `rm-323` Sertorius | 6 | 7 → 8 | The old card had no modern source. **The white fawn is Plutarch's tale, with Appian's version and a modern doubt**; the Mithridates treaty is told both ways. Killed 72, also dated 73 (the second resting only on the Oxford Classical Dictionary entry's title as Crossref records it, the entry itself answering 403). |
| `rm-324` Sertorian War | 6 | 6 → 8 | The war starts in 82 or 80 by modern author; Pompey's letter is Sallust's text; **the sling bullets stamped Q.SERTORI PROCOS are contemporary evidence** (an open 2022 *Journal of Roman Archaeology* survey). Florus is dropped. A 2025 review reports García Domínguez dating the burning of Lauro to 77; the card keeps 76. |
| `rm-325` Pompey | 9 | 8 → 9 | The old line had "and twice later" and "in his 58th year" (which Plutarch contradicts); **the first triumph is 81 BCE in Smith and early 79 in the Cambridge Ancient History, both given**; "Magnus" is Plutarch's report; "First Triumvirate" is said to be modern. The glossary stated the 58th year as fact. |
| `rm-326` Marcus Licinius Crassus | 8 | 6 → 9 | **"Fortune 7,100 talents, per Plutarch" was a date-line row**; it is now Plutarch's figure in prose. The fire-brigade story is Plutarch's, the molten gold Dio's "as some say". "Born c. 115" is printed by no open modern source and goes. |
| `rm-327` Spartacus | 9 | 6 → 9 | The old card had six ancient sources and no modern one. The escapees are Plutarch's 78 against Appian's about 70; **the prophetess wife and the serpent are legend; the Alpine plan is Plutarch's reading, set against modern views**; "more Hellenic than Thracian" is a stock compliment. |
| `rm-328` Third Servile War | 7 | 6 → 7 | **"Crixus killed with 20,000 men" and "60,000 dead, per Livy" were date-line rows**; every figure is now its author's, never summed, and the crucified 6,000 are "one ancient historian"'s in the question too (fixed by hand). The old first phrasing repeated `rm-326`'s six-new-legions clue. |
| `rm-329` consulship of 70 BCE | 5 | 6 → 7 | **"Pompey's age 34, per Appian never quaestor nor praetor" was words on the line.** Appian puts the reconciliation early, Plutarch at the year's end after a knight's dream; the jury-law praetor is Lucius Aurelius Cotta (not Lendering's "Marcus"); the 64 senators expelled and the 900,000 citizens are Livy's summary's. The glossary gave Appian's scene to Plutarch. |
| `rm-330` restoration of the tribunate | 6 | 8 → 7 | Added the agitation of the 70s (Lepidus, Sicinius 76, Cotta's law of 75 — now the first date row —, Macer's speech of 73 as Sallust's composition). **"Moved by Pompey" is now the sources' split between Pompey and both consuls.** |

**Read by eye.** *Confusability:* `rm-321` the framing (no clue of `rm-276`); `rm-322`; `rm-323`/`rm-324` the man (fawn, Osca, banquet) and the war (Pompey's battles, the letter, the bullets); `rm-325`/`rm-326` the two men; `rm-327`/`rm-328` the man and the war; `rm-329`/`rm-330` the year and the law. *Legend:* the fawn, the prophetess and her serpent, the molten gold and Pompey's horse led before the censors are their authors'. *Overlap:* no `gr-` or `wh-` card disagrees.

### B34 — `rm-331`–`rm-340`, the fall of the Republic: the pirates, the East, Cicero and Catiline (2026-10-29)

Run as B33; every draft compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-331:rm-340` reads clean on four cards; the rest are `I.none` and `W.not-why` on three (a third Think-it-through question that does not open "Why": advisory). `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card; every citation URL answers 2xx. Two phrasings were fixed by hand before applying: `rm-338`'s second (it shared Cicero's defence of Rabirius with `rm-302`; now the Macedonia bargain) and the glossary aliases `rm-334` and `rm-335` needed ("Lucullus", "Pompey's settlement of the East") came with their redrafted entries. `timeline` was moved for `rm-333` (74 – 63), `rm-335` (66 – 62) and `rm-340` (October – December 63). **The ten old cards were all-ancient** (Appian, Plutarch and Cicero cited up to four times each); **Cicero's speeches and Sallust's monograph are now named for what they are**: a pleader's or a partisan's case, published after the event.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-331` Cilician piracy | 7 | 5 → 9 | **"Grew from 88 BCE" was Lendering's note, not Appian's**, and the line carried words. Added Crete, Antonius in 102, the piracy law of 101 or 100 from its Delphi and Cnidus copies, the son's failed Cretan war of 74 and the modern doubt about the label "pirate"; Caesar's kidnapping is Plutarch's story; Ostia is Cicero's case for Pompey's command. The glossary had c. 88 and Livy's "forty days". |
| `rm-332` lex Gabinia | 6 | 5 → 7 | **"Command 3 years" leaves the line**; the bill naming no commander is Dio's, not Plutarch's; Plutarch's and Appian's figures for ships and legates are kept apart; the "step to monarchy" and "model for later commands" are modern judgements. No source read names Pompeiopolis, so the card says Soli. |
| `rm-333` Third Mithridatic War | 7 | 6 → 8 | **The start is 74 (the Cambridge Ancient History) or spring 73 (Kallet-Marx, Lendering), both on the line**; Appian's translator's margin year is dropped; Tigranocerta's numbers are Plutarch's; Cicero's speech for the Manilian law is an advocate's case for the knights. |
| `rm-334` Lucullus | 7 | 5 → 9 | The youth anecdotes go; the debt relief in Asia (interest capped at one per cent a month) and the knights' hostility are the moderns' reading; Clodius's mutiny, the triumph delayed to 63, the villas and "Lucullan". **No birth or death year is printed by a source read.** The glossary lacked the alias "Lucullus" (`G.none`). |
| `rm-335` Pompey's settlement of the East | 6 | 6 → 7 | **"Settlement" is a modern name for a bundle of decrees** (the Cambridge Ancient History's "general settlement"); the line was mostly words. Bithynia-Pontus, the client kings, Crete and Syria annexed, Hyrcanus as high priest without a crown; Pompey in the sanctuary is Josephus's; the tribute figures are Plutarch's. |
| `rm-336` Cicero | 9 | 7 → 9 | The whole life now (born 106 to a family of Arpinum, consul 63, killed 43). **The speeches argue a client's case; the letters, not meant for publication, still show him shaping his image.** The Roscius case is left to `rm-318`. |
| `rm-337` trial of Verres | 7 | 6 → 7 | **Verres's crimes are known only from the prosecutor's speeches, now said in the card's voice**; the Divinatio, Hortensius, the exile after the first hearing and the five unspoken books are added; Cicero's 40 million sesterces and Plutarch's 750,000 denarii are each attributed. |
| `rm-338` consulship of Cicero | 7 | 6 → 7 | The conspiracy (`rm-339`–`rm-341`'s) is one clause; **the Commentariolum's authorship is doubted**; the Rullus land bill is Cicero's picture of it; the Macedonia bargain, Rabirius and the mocked poem are added. |
| `rm-339` Catiline | 8 | 6 → 9 | **The old line had him die fighting Antonius; Antonius had gout and Petreius commanded.** The Gratidianus killing and the brother are Plutarch's charges, with the doubt; the "first conspiracy" is Sallust's story, which moderns doubt; Cicero published his speeches in 60 and may have revised them. Sallust puts the wounds in front on the soldiers, not on Catiline. |
| `rm-340` Catilinarian conspiracy | 8 | 8 → 9 | Half the old abstract was the debate and the executions (`rm-341`'s). Now the plot in Rome: Fulvia's leak, the decree of 21 October, Manlius at Faesulae, the night at Laeca's, the First Catilinarian, the Allobroges' letters at the Mulvian Bridge, the arrests. |

**Read by eye.** *Confusability:* `rm-331`/`rm-332` the phenomenon and the law; `rm-333`/`rm-334`/`rm-335` the war, the general and the settlement; `rm-336`/`rm-337`/`rm-338` the man, the trial and the year; `rm-339`/`rm-340` the man and the plot (the debate kept for `rm-341`). *Legend:* the kidnapping, Pompey's sanctuary visit and Catiline's last stand are their authors'. *Overlap:* no `gr-` or `wh-` card disagrees.

### B35 — `rm-341`–`rm-350`, the fall of the Republic: the debate, Cato, Caesar, the triumvirs, Clodius and Gaul (2026-10-29)

Run as B34; every draft compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-341:rm-350` reads clean on three cards; the rest are `I.none` and one `S.chip?` on `rm-348` (an English BMCR review of a German-titled book: the known false positive). `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. The URL check's 15 failures are LacusCurtius pages (`000`, the host refusing the sandbox), each read and saved by its agent when the host answered. One phrasing was fixed by hand: `rm-342`'s second (Plutarch's nearly seven thousand talents from Cyprus is now attributed). `timeline` was moved for `rm-341` (5 December 63) and `rm-350` (58 – 51). **The old cards cited 9 to 13 sources each, all ancient** (Plutarch, Suetonius, Appian and Cicero up to four times); they now have at most two per author and at least half modern.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-341` debate on the conspirators | 6 | 11 → 7 | **5 December 63 is the Nones of December, a Roman date in modern dress, now said**; the counts and "in the temple of Concord" leave the line (no source fetched clearly places the sitting there). The core is now the legality: a decree, not a court, and Cicero's exile in one clause. Sallust's two speeches are his own composition; the Fourth Catilinarian was published later and may be revised. |
| `rm-342` Cato the Younger | 8 | 13 → 8 | **Plutarch was four of the glossary's five sources and much of the card's.** Quaestor 64 or 65 (moderns differ; Perrin's margin date not used); died at 48 (Plutarch) or 49 (Smith); Utica and the *Phaedo* are Plutarch's scene; Caesar's *Anticato* answers his memory. |
| `rm-343` Julius Caesar | 9 | 11 → 9 | **"c. 100 BCE" had no source; 100 BCE is Cary's (from the ancient ages at death), and the 102 view (Mommsen, Holmes) is given.** The whole life now; the Commentaries are his own case; the biographers wrote long after. The pirates are one clause. |
| `rm-344` First Triumvirate | 8 | 9 → 9 | **"First Triumvirate" is now said to be a modern name** (Cary: "constitutionally unjustified"); formed 60 or 59; Varro's *Tricaranus* is known through Appian. Julia's marriage is this card's; the line's "Broken Crassus killed" was words. |
| `rm-345` Caesar's first consulship | 7 | 10 → 8 | Suetonius was cited four times. **"Province Gaul for 5 years" leaves the line: the command's end date is debated (Seager).** The year's laws, Vatinius, the "Julius and Caesar" joke (Suetonius's) and Cicero's letters of 59 as his fears written at the time. |
| `rm-346` Publius Clodius Pulcher | 7 | 11 → 7 | **Cicero, his bitterest enemy, is almost our only witness: said.** Bona Dea, the adoption, the grain and clubs laws, the Senate-house pyre; 18 January 52 is the Cambridge Ancient History's day (Purton's 1875 Asconius converts it to the 20th). |
| `rm-347` exile of Cicero | 7 | 10 → 8 | Plutarch's "sixteenth month" and "twenty thousand young men" go. **The return on 4 September 57 is read off Cicero's own letter (Att. 4.1); the Cambridge Ancient History prints the 9th.** The exile letters are evidence of his state of mind and self-pity; *De domo sua* is a pleader's speech. |
| `rm-348` political violence in the late Republic | 8 | 10 → 10 | Appian was cited four times. **Appian's sword-in-the-assembly verdict is his**; the gangs, the lack of police (Lintott, Nippel) and the burning of the Curia; the old "133 – 44" end had no source and goes. |
| `rm-349` conference at Luca | 6 | 7 → 8 | **The 120 lictors and 200 senators are Plutarch's and Appian's count, prose only**; Appian's slip putting Britain before Luca is dropped; the Ravenna meeting comes from Cicero's own letter; his "recantation" is told as his own account. Gruen's downplaying is left out (no open source). |
| `rm-350` Gallic Wars | 9 | 11 → 9 | **"Tribute 40,000,000 sesterces a year" was a date-line row**; it is Suetonius's figure in prose. The fighting ends in 51 (Uxellodunum), the command in 50; Plutarch's eight hundred towns and three hundred peoples are his. `wh-354` says 58 – 50 BCE. |

**Read by eye.** *Confusability:* `rm-341`/`rm-342` the debate and Cato; `rm-343`/`rm-344`/`rm-345` the man, the compact and the year; `rm-346`/`rm-347`/`rm-348` the tribune, the exile and the theme; `rm-349`/`rm-350` the meeting and the war (the Alesia works kept for `rm-353`). *Legend:* the Utica night, the Bona Dea disguise and the "Julius and Caesar" joke are their authors'. *Overlap:* `wh-354` ends the Gallic Wars in 50 BCE; this card ends the fighting in 51 and the command in 50.

### B36 — `rm-351`–`rm-360`, the fall of the Republic: the Commentaries to the Rubicon and the civil war (2026-10-29)

Run as B35; every draft compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-351:rm-360` reads clean on three cards; the rest are `I.none`, `W.not-why` on two (advisory) and `L.missing` on `rm-356` (Carrhae: locators wait for the end of the session). `check-questions`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-cards` flagged `rm-355`'s first phrasing ("As Crassus…" reads to it as a scholar), which was reworded and re-applied. `check-citations --card` 0 mismatched on every card; the URL check's 5 failures are LacusCurtius pages read and saved when the host answered. One figure was fixed by hand before applying: **`rm-353` gave Caesar's relieving army as 250,000 infantry, the Cambridge Ancient History's figure, while the cited McDevitte translation reads about 240,000; both are now given.** `timeline` was moved for `rm-355` (55 – 53). The old cards were all-ancient, Caesar's own figures standing as date-line rows.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-351` Commentarii | 7 | 7 → 8 | The old abstract was a string of quotations and the line held counts ("in 7 books", "1 of 8"). **What a commentarius was, the third-person voice, Hirtius's eighth book and the continuators (Suetonius: author unknown); Cicero's and Hirtius's praise and Pollio's charge each attributed; the written-at-once and year-by-year views each credited; the modern reading as Caesar's advocacy.** The glossary's 58 – 48 BCE is in no source fetched. |
| `rm-352` Vercingetorix | 8 | 9 → 8 | **Caesar's 80,000 men and thirty days' corn left the line** (and stay with `rm-353`). Caesar is nearly our only witness; Gergovia, scorched earth, the gold staters (the head usually read as Apollo), the three surrender accounts apart, six years' captivity; only Dio records the execution. |
| `rm-353` Alesia | 8 | 9 → 8 | **"Roman lines about 16 km, with 23 redoubts" and "Standards taken 74" were rows; the 16 km was someone's conversion**: Caesar's eleven and fourteen miles stay as his. The Mandubii, Vercassivellaunus, Napoleon III's digs and the Franco-German digs of 1991 – 97; Alaise named as the rival site. |
| `rm-354` British expeditions | 7 | 9 → 7 | Caesar's reason is his own case, the eagle-bearer his set piece, the forty ships lost his figure; Cicero's letters (no silver, no booty but slaves); the tribute perhaps never paid; Walmer–Deal and the Leicester team's Ebbsfleet finds. |
| `rm-355` Parthian campaign | 7 | 9 → 8 | **The old card said flatly that no decree authorised the war; the lex Trebonia let Crassus make war or peace (Holmes)**, so both are given. Ariamnes and Abgarus are one man, a traitor to Plutarch and Dio, doubted by Tarn; Ateius's curse and the Zeugma omens are Plutarch's; the temple plunder Josephus's. |
| `rm-356` Carrhae | 7 | 7 → 7 | **Plutarch's 20,000 killed and 10,000 taken are for the whole campaign, not the battle, and leave the line.** Dio's molten gold, Plutarch's head at the *Bacchae* and Ovid's 9 June (which Holmes accepts) are each attributed; the standards back in 20 BCE. |
| `rm-357` Titus Annius Milo | 6 | 9 → 6 | **Appian's version of the killing is replaced by Asconius's, said to rest on the official records**; the published *Pro Milone* is a later rewrite; the mullets joke is Dio's; Massilia, and death beside Caelius in 48. |
| `rm-358` sole consulship | 6 | 7 → 6 | **The old card followed Appian, who has Cato propose it; Bibulus moved it and Cato backed it.** "After 2 months" is Plutarch's (the Cambridge Ancient History puts Scipio's start in July or August); the intercalary month is Asconius's; the laws and the law of the ten tribunes are added. |
| `rm-359` Rubicon | 9 | 7 → 11 | **Caesar's own *Civil War* never names the river, now said**; 7 January and the night of 10/11 January are modern reckonings in a calendar some seven weeks ahead of the seasons; Suetonius's "iacta alea est" and Plutarch's Greek call each their author's; the piper is Suetonius's portent; the river's identity is disputed (Rosetti 1901, a church court's ruling of 1756). Plutarch's 5,000 foot and 300 horse leave the line. |
| `rm-360` Caesar's civil war | 9 | 11 → 9 | Every author was over the limit. The whole war from Italy to Munda and Sextus fighting on; Caesar's *Civil War* is his own case; the Rubicon's clues are `rm-359`'s; "I came, I saw, I conquered" is Suetonius's placard. |

**Read by eye.** *Confusability:* `rm-351` the work; `rm-352`/`rm-353` the leader and the siege; `rm-354` Britain; `rm-355`/`rm-356` the campaign (march and omens) and the battle (fighting and death); `rm-357`/`rm-358` Milo and the consulship; `rm-359`/`rm-360` the river and the war. *Legend:* the piper, Ateius's curse, the molten gold, the eagle-bearer and the mullets are their authors'. *Overlap:* no `gr-` or `wh-` card disagrees.

### B37 — `rm-361`–`rm-370`, the fall of the Republic: Dyrrhachium to the Ides of March and Brutus (2026-10-29)

Run as B36; every draft compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-361:rm-370` reads clean on all ten cards. `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. The URL check's 10 failures are LacusCurtius pages read when the host answered and one PNAS DOI that answers a script 403 (the article is CC BY-NC-ND and was read in Europe PMC). One phrasing was fixed by hand: `rm-367`'s second (Dio's nine hundred senators is now attributed). The old cards were all-ancient, with Caesar's own casualty figures, Plutarch's dead and Suetonius's wounds as date-line rows. **Several famous days are Roman dates in modern dress, now said on the card**: Pharsalus's 9 August (usually 6 June Julian), Pompey's 28 September, Thapsus's 6 April (modern historians put it in February); Munda's 17 March 45 falls after the reform (Holmes: the new calendar began on 1 January 45), which the card says.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-361` Battle of Dyrrhachium | 6 | 9 → 8 | **Three count rows go; Caesar's losses (960 men, "a number of officers", 32 standards) are his own figures in prose; the old "five tribunes" had no source.** The lines (fifteen miles, Adcock and Holmes), the chara bread, the breakout at the unfinished south end; Caesar's remark is Plutarch's and Suetonius's. Scaeva's shield is `rm-659`'s clue. |
| `rm-362` Battle of Pharsalus | 7 | 9 → 9 | **Caesar's 22,000 against 45,000 and 7,000 horse are his figures, and his 15,000 dead stand apart from Pollio's 6,000 (via Plutarch)**; the strike-at-the-faces order is Plutarch's story, which Holmes called rubbish; the site is disputed in one sentence. |
| `rm-363` death of Pompey | 8 | 7 → 8 | **"Aged 59 or 57, the sources differ" was words on the line**; Velleius's eve-of-birthday against Plutarch's "sixty less one" (Holmes: a blunder) is now a Think-it-through answer. Caesar's tears are Plutarch's; Dio calls them pretence; Adcock reads relief. Appian's variants (Sempronius strikes first) are in the notes. |
| `rm-364` Alexandrian War | 7 | 8 → 8 | **Caesar's own narrative ends at *Civil War* 3.112; a continuator, perhaps Hirtius, wrote the rest.** Plutarch's ten million drachmas in prose; the three legions dropped; the Library's loss a dispute (Seneca's 40,000 rolls, Plutarch, Dio, modern views); the bedding-sack story kept for `rm-384`. The *Bellum Alexandrinum* could not be fetched and is cited through Holmes and Adcock. |
| `rm-365` Battle of Thapsus | 6 | 8 → 6 | **The *Bellum Africum*'s 10,000 enemy dead and fewer than 50 Caesarian dead stand apart from Plutarch's 50,000**; the anonymous officer is named as narrator; "Publius Scipio" is corrected to Metellus Scipio; the fit is Plutarch's "some say". |
| `rm-366` Battle of Munda | 6 | 6 → 6 | The counts leave the line; the *Bellum Hispaniense* is named as narrator; the site is disputed (Way); "fought for his life" is Plutarch's and Appian's. |
| `rm-367` Caesar's dictatorship | 7 | 8 → 7 | **"First tenure 11 days" and "Consulship voted 10 years" leave the line**: the eleven days are Caesar's own account; the 900 senators Dio's and the grain list cut from 320,000 to 150,000 Suetonius's. The DICT PERPETVO denarius (RRC 480/6) is contemporary evidence. July is this card's alone. |
| `rm-368` Julian calendar | 8 | 6 → 8 | **"That year ran 445 days" was a row; Censorinus gives 445 and Macrobius 443.** Sosigenes is Pliny's; the pontiffs' third-year error and Augustus's fix Macrobius's; 1582 in one sentence. |
| `rm-369` Ides of March | 9 | 7 → 9 | **"Wounds 23" and "Mortal wound 1, per Antistius" were rows; they are Suetonius's.** The omens and "more than sixty" are the biographers'; "kai su teknon" is Suetonius's "some have written"; "Et tu, Brute" is Shakespeare's. "Come but not gone" is `rm-900`'s clue. |
| `rm-370` Marcus Junius Brutus | 8 | 9 → 8 | Born c. 85 (disputed, said); Q. Caepio Brutus; the Salamis loan at 48 per cent from Cicero's letters; the EID MAR denarius (CRRO record); the Philippi ghost is Plutarch's. **"Served under Pompey" is softened to "sided with": we do not know that he fought.** |

**Read by eye.** *Confusability:* `rm-361`/`rm-362`/`rm-363`/`rm-364` the siege lines, the battle, the killing and the Egyptian war; `rm-365`/`rm-366` the elephants and Juba, Labienus and the sons; `rm-367`/`rm-368` the office and the calendar; `rm-369`/`rm-370` the day and the man. *Legend:* the last words, the note never read, the ghost at Philippi, the swim with the papers and the fit at Thapsus are their authors'. *Overlap:* no `gr-` or `wh-` card disagrees.

### B38 — `rm-371`–`rm-380`, Augustus: Octavian's rise to Sextus Pompey (2026-10-30)

Run as B37; every draft compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-371:rm-380` reads clean on eight cards; the other two carry `W.not-why` (advisory). `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card; the URL check's 2 failures are a LacusCurtius *Res Gestae* page read when the host answered. Two phrasings were fixed by hand: `rm-371`'s third (Suetonius's "five civil wars" is now one biographer's count) and `rm-376`'s first (it shared the river-islet meeting near Bononia with `rm-374`). `timeline` was moved for `rm-376` (7 December 43) and `rm-377` (October – November 42). **All ten old cards were all-ancient or nearly so, and every old date line carried counts or words** ("Consul 13 times", "44 years", "Umpires 3", "Legions 19 on each side", "Reward 25,000 drachmas a head").

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-371` Augustus | 9 | 5 → 10 | The whole life now; **23 September is Suetonius's Roman day, 13 and 16 January 27 the calendars', 2 September 31 a modern chronology's**; the *Res Gestae* is his own case and Tacitus's two verdicts at the funeral are Tacitus's. The counts and "at Nola" leave the line. |
| `rm-372` will of Julius Caesar | 8 | 5 → 10 | **Each author's legacy to the people is his own: Suetonius's 300 sesterces, Appian's 75 drachmas, Dio's two sums** (which his translator turned into 120 or 300 sesterces); whether a will could adopt is a modern debate. No modern source opened prints the day 13 September; it is Suetonius's Ides, said so. |
| `rm-373` War of Mutina | 6 | 5 → 8 | **Octavian's first consulship was 19 August 43 (Holmes, the Cambridge Ancient History), not 22 September.** Forum Gallorum 14 April (the Fasti) and Mutina 21 April; the Philippics are a pleader's attacks; the murder rumour is Suetonius's and Tacitus's; "at his own expense" is Augustus's own account. |
| `rm-374` Second Triumvirate | 8 | 5 → 8 | **"Second Triumvirate" is the modern historians' name**, with the official title; the lex Titia of 27 November 43, the renewal at Tarentum, Lepidus's fall, and the end in 33 or 32 as moderns differ. The glossary's "several hundred" proscribed had no source. |
| `rm-375` triumviral proscription | 7 | 5 → 8 | **Appian gives "twelve, or, as some say, seventeen" for the first killings; the card had stated seventeen.** The edict is Appian's Greek rendering; his 300 senators and 2,000 knights stay his; Suetonius and Velleius disagree on Octavian's part; book 4's tales are a moralising collection. |
| `rm-376` death of Cicero | 8 | 5 → 10 | **7 December 43 is Tacitus's day, citing Tiro (the Church and Brodribb translation's "5th" is wrong and is not cited).** Livy's account and verdict read in the elder Seneca; the killer as a client Cicero had defended is a later rhetoricians' invention (Gudeman); Fulvia's hairpin is Dio's. |
| `rm-377` Battle of Philippi | 7 | 6 → 8 | Three count rows and "in Macedonia" leave the line; **the two modern dates disagree (Holmes about 23 October and 16 November, the Cambridge Ancient History the second on 23 October), both given**; Appian's figures are his; Octavian's illness and the dream are his own memoirs'. |
| `rm-378` Perusine War | 6 | 6 → 8 | The sacrifice of 300 at the altar of Julius is a rumour (the Cambridge Ancient History and Holmes differ); the Perugia sling bullets are contemporary evidence (Zangemeister's corpus), no insult quoted; Octavian's age is Livy's summary's. |
| `rm-379` Pact of Brundisium | 7 | 5 → 7 | **The year comes from the Cambridge Ancient History and Syme, not White's margin**; the month is September (Syme) or early October (the Cambridge Ancient History); the mediators are Appian's; the Fourth Eclogue gets one hedged sentence. |
| `rm-380` Sextus Pompey | 7 | 5 → 9 | **His naval title is read off his own coin** (RRC 511/3a); the "pirate" picture is the winners', from the *Res Gestae*; the death year 35 is printed by a 2013 review of Welch. Menas's offer at Misenum is Plutarch's. |

**Read by eye.** *Confusability:* `rm-371`/`rm-372` the man and the will; `rm-373`/`rm-374`/`rm-375`/`rm-376` the war, the board (the river-islet meeting only here), the lists and the death; `rm-377`/`rm-378`/`rm-379` the battle, the siege and the pact; `rm-380` the son. *Legend:* the altar of the 300, the dream before Philippi, the hairpin and Menas's offer are their authors'. *Overlap:* no `gr-` or `wh-` card disagrees.

### B39 — `rm-381`–`rm-390`, Augustus: Naulochus to the first settlement and the golden shield (2026-10-30)

Run as B38; every draft compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-381:rm-390` reads clean on nine cards; `rm-388` carries `S.chip?` (an English BMCR review of the German-titled Gallus-stele edition: the known false positive). `check-questions`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-cards` flagged `rm-386`'s third phrasing ("Whether Octavian…" reads to it as a scholar), which was reworded and re-applied. `check-citations --card` 0 mismatched on every card; every citation URL answers 2xx. Two more phrasings were fixed by hand before applying: `rm-383`'s first (it read as if the consul and Antony were two men) and `rm-387`'s first (Cleopatra's sixty ships are now one ancient count). `rm-388`'s locator was moved from Pelusium to Alexandria through `add-locators.js` (the coordinate fetched from the article). `timeline` was moved for `rm-381` (3 September 36), `rm-387` (2 September 31) and `rm-388` (1 August 30). The old cards were all-ancient; most of their date lines held counts ("Ships 300 on each side", "Children by Antony 3", "Thrones 2 of gold", "Informers 2", "Virtues named 4").

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-381` Battle of Naulochus | 6 | 5 → 6 | **3 September 36 is the Fasti Amiternini's day**; Appian's ship counts are his, and the Cambridge Ancient History doubts his 300 a side (Sextus had about 200 at most); Mylae, Tauromenium and Lepidus's fall added. |
| `rm-382` Marcus Agrippa | 8 | 6 → 9 | **"The first Roman given one" (the naval crown) is Velleius's claim**; the Pantheon inscription stands on Hadrian's rebuilding, now said; the aqueducts (Frontinus), Julia and their sons, tribunician power, the world map (Pliny), death in 12. The glossary dated him by the naval crown. |
| `rm-383` Mark Antony | 9 | 6 → 9 | The old card covered only the eastern decade. **Born 83 (Livius) beside Plutarch's age at death (56 or 53); the Median losses are Plutarch's, whose account comes from Antony's officer Dellius**; Cicero is a hostile pleader on the Lupercalia; 1 August 30 from the Cambridge Ancient History (Livius's timeline puts his death after Cleopatra's and is not cited for it). |
| `rm-384` Cleopatra VII | 9 | 5 → 9 | **The bed-sack is Plutarch's (*Caesar*); the asp is Plutarch's "no one knows" with Strabo's two accounts**; her coins and the "let it be done" papyrus are cited through BMCR reviews (the papyrus and coin databases refused); no open source gives 10 August, so the line prints 30 BCE and 12 August is one modern chronology's day. |
| `rm-385` Donations of Alexandria | 6 | 5 → 7 | **"Donations" is a modern label; the thrones and the gymnasium are Plutarch's alone (Dio puts the proclamation "in the assembly")**; the "Queen of Kings" denarius is dated 32 by its ANS record, so it is not said to be struck at the ceremony; the grants' effect is a modern debate. |
| `rm-386` will of Mark Antony | 7 | 5 → 8 | **It is Dio, not Plutarch, who calls the seizure "most lawless"**; the forgery debate (Rostovtzeff forged, Holmes genuine, Syme a partial forgery not ruled out); Dio's fetial rite; *Res Gestae* 25 as Augustus's own account. |
| `rm-387` Battle of Actium | 9 | 6 → 10 | **2 September 31 is Dio's date; the "1 Sept. 2" in the Plutarch scan is the translator's margin.** The blockade, disease and desertions; Plutarch's "flight" against Dio's and the moderns' planned breakout; Horace and Virgil are propaganda; the campsite memorial with its ram sockets is the contemporary evidence. |
| `rm-388` annexation of Egypt | 7 | 5 → 9 | **Gallus's Philae stele (April 29 BCE) is his own boast**; Alexandria taken 1 August 30 (a modern account); the AEGVPTO CAPTA coin; the *Res Gestae*'s "added to the empire" is his own account; senators barred without leave (Tacitus, Dio). |
| `rm-389` first settlement | 7 | 5 → 8 | **"First settlement" is a modern label; Dio's speech is his own composition and his province list his.** 13 and 16 January 27 (the Fasti Praenestini); the Cambridge Ancient History puts the honours three days after the 13th, Holmes and the Fasti put the oak crown on the 13th (the card follows the Fasti). The Egypt-knight row goes. |
| `rm-390` clipeus virtutis | 5 | 5 → 7 | The old abstract was half the name Augustus. **The shield itself now: the four virtues (*Res Gestae* 34, his own account), the Arles copy dated by the eighth consulship (26 BCE), found in 1951**, and the CL V coins. |

**Read by eye.** *Confusability:* `rm-381`/`rm-382` the battle (the grapnel) and the admiral (the crown, the water); `rm-383`/`rm-384` the two lives; `rm-385`/`rm-386`/`rm-387`/`rm-388` the ceremony, the will, the battle and the province; `rm-389`/`rm-390` the session and the shield. *Legend:* the bed-sack, the barge on the Cydnus, the asp and the flight at Actium are their authors'. *Overlap:* no `gr-` or `wh-` card disagrees.

### B40 — `rm-391`–`rm-400`, Augustus: princeps to the military treasury (2026-10-30)

Run as B39; every draft compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-391:rm-400` reads clean on all ten cards once `rm-400`'s second phrasing, which shared 53 per cent of its words with `rm-746`'s (Augustus's 170 million sesterces from his patrimony), was replaced by the fund's three ex-praetor prefects and re-applied. `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card; every citation URL answers 2xx. One more phrasing was fixed by hand before applying: `rm-398`'s second (Dio's twelve thousand sesterces is now one ancient count). **Six of the ten subjects are modern labels and the cards now say so**: "second settlement", "imperium proconsulare maius", "Principate", "imperial" and "senatorial" provinces; the dates the old cards gave their beginnings and ends ("In use 28 BCE – 284 CE", "Era 27 BCE – 284 CE", "Tribune for life 23 BCE") are conventions or errors, each now attributed or dropped. LacusCurtius refused every connection, so Dio and the *Res Gestae* were read in archive.org Loeb scans.

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-391` princeps | 7 | 6 → 8 | **The 284 CE end is a convention no opened source states, and goes**; the line is *princeps senatus* 28 BCE – 14 CE. Tacitus's "neither kingdom nor dictatorship" (*Annals* 1.9) is what some men said at the funeral, not Tacitus's own verdict; the old citation of *Annals* 1.2 for the name is corrected to 1.1. The old lead phrasing used `rm-712`'s *Res Gestae* 34 clue. |
| `rm-392` second settlement | 6 | 5 → 7 | **"Tribune for life" was wrong: he was never a tribune**; the label is modern. Consul resigned on the Alban Mount on 1 July 23 (Dio gives no day; the date is the moderns'); Sestius, Marcellus and Agrippa; the Caepio–Murena plot in 22 (Dio) or 23 (three modern works). |
| `rm-393` tribunicia potestas | 6 | 6 → 7 | **The *Res Gestae*'s "for as long as I lived" has no date, and the Cambridge Ancient History calls Dio's "tribune for life" in 23 inaccurate**: the line is sacrosanct 36, rights voted 30, counted from 23. TR POT on coins (two OCRE records); Tacitus's "summi fastigii vocabulum". The unsourced "patrician by adoption" goes. |
| `rm-394` imperium proconsulare maius | 5 | 5 → 6 | **The Latin name is the modern scholars' label**; the Cambridge Ancient History calls Dio's "once and for all" incorrect; the Cyrene edicts (7 – 6 BCE) are the evidence; the debate in three attributed sentences (McFayden 1928 open access). Last's 1947 article and the SC de Pisone were not read and are not cited. |
| `rm-395` Principate | 7 | 6 → 9 | **A modern name built on *princeps*; the start (27 BCE, since Mommsen) and the ends (235 in Mackay, 284 at Diocletian's accession) are each attributed.** Tacitus's and Dio's verdicts are theirs; Mommsen's dyarchy, Syme and Wiseman in three sentences. |
| `rm-396` Res Gestae Divi Augusti | 7 | 8 → 7 | **"Deposited 13 CE, with his will" is printed by no source read**; the line is completed 14 CE and found at Ankara 1555. The Apollonia, Antioch and Sardis copies; the omissions as modern readings; the text is Augustus's own case. No source read says it omits the proscriptions, so the card does not. |
| `rm-397` imperial province | 7 | 6 → 7 | Dio was cited four times. **Strabo 17.3.25 and Dio 53.12 are now apart, and they differ** (Strabo has Narbonensis and Cyprus with the people from the start; Dio has them handed back); the armed-province rule is qualified (proconsuls led legions in Africa, Macedonia and Illyricum). |
| `rm-398` discharge gratuity | 6 | 6 → 7 | **The old "about 860 million" summed the *Res Gestae*'s 600 and 260 million; it is dropped and each figure is its author's.** One modern account dates the rise to twenty years to 6 CE, not 5, and the card says so. |
| `rm-399` Praetorian Guard | 8 | 7 → 9 | The count rows go. **No modern source read prints 27 BCE as the guard's founding or 23 CE for the camp**: the line is double pay 27 BCE (Dio's settlement, the Cambridge Ancient History's year), first prefects 2 BCE, abolished 312 CE. Tacitus's nine cohorts are a count for Tiberius's reign; the auction of 193 is hedged. |
| `rm-400` aerarium militare | 6 | 6 → 7 | **Dio 55.25 names only the inheritance tax, not the 1 per cent sales tax**, which rests on the Cambridge Ancient History, Smith and Tacitus (the sources record neither its date nor its manner); the *Res Gestae*'s 170 million is Augustus's own account. |

**Read by eye.** *Confusability:* `rm-391` the word, `rm-395` the regime, `rm-392` the year 23, `rm-393`/`rm-394` the two powers (the TR POT numbering and the Cyrene edicts), `rm-396` the text, `rm-397` the provinces, `rm-398`/`rm-399`/`rm-400` the bounty, the guard and the fund (the 170 million kept for `rm-746`). *Legend:* none on these cards; the speeches are Dio's compositions. *Overlap:* no `gr-` or `wh-` card disagrees.

### The fourth hundred, in sum

`rm-301`–`rm-400` (the Republic in crisis from Marius's consulships, the fall of the Republic and Augustus) are done: 670 sources became 796 and 49 glossary entries were rewritten. `rm-audit.js --range=rm-301:rm-400` reads 59 of 100 cards clean; the rest are 37 cards with no picture (`I.none`), 4 `S.chip?` false positives (English BMCR reviews of foreign-titled books) and 7 advisory `W.not-why`. Every picture is still the bulk-written one (Commons answered 429): the "Pictures to redo" table holds a verdict for each.

What the fourth hundred found, again and again:
- **A count on the date line.** Nearly every old line carried an ancient author's figure as a row (Velleius's 300,000 Italian dead, Appian's legions and ships, Plutarch's 7,100 talents, Caesar's 80,000 men and 23 redoubts, Suetonius's 23 wounds, Appian's "Reward 25,000 drachmas a head"). They are prose now, each given to its author, and where two authors disagree (Asiatic Vespers 80,000 against 150,000; Pharsalus 15,000 against 6,000; Brundisium 1,600 ships against 1,200) both stand apart, never as a range.
- **A modern label as ancient fact.** "Asiatic Vespers", "Marian terror", "Sullan constitution", "fall of the Republic", "First" and "Second Triumvirate", "Pompey's settlement", "Donations of Alexandria", the "first" and "second settlement", "imperium proconsulare maius", "Principate", "imperial province" and "civil war of 83 BCE" are each said to be modern.
- **A Roman day in modern dress.** The Colline Gate's 1 November, the debate's 5 December, Pharsalus's 9 August, Pompey's 28 September and Thapsus's 6 April are pre-Julian Roman dates, now said; Munda's 17 March and Naulochus's 3 September fall after the reform; Actium's 2 September is Dio's.
- **The contemporary voices named for what they are.** Cicero's speeches are a pleader's case (Verres, Roscius, Balbus, Rabirius, the Catilinarians, the Philippics), his letters his own fears and self-presentation; Caesar's Commentaries his own account and advocacy (and silent on the Rubicon); Sallust's speeches his compositions; the *Res Gestae* Augustus's own case.
- **Wrong facts the old cards stated.** Saturninus "stoned on the Capitol", Sulla "praetor by 95", Catiline killed fighting Antonius (Petreius commanded), Cato proposing Pompey's sole consulship (Bibulus did), Octavian's first consulship on 22 September (19 August), "Tribune for life" for Augustus, Appian's "120 years" (a translator's footnote), and the "about 860 million" that summed two of Augustus's figures.
- **The modern half.** Almost every old card was all-ancient. The modern half is mostly the 1932 – 34 Cambridge Ancient History (vols. 9 and 10), Holmes, Heitland, Greenidge, Mommsen, Syme (1939) and BMCR reviews, with a few recent open articles (Tatum 2020, the 2022 *Journal of Roman Archaeology* survey, Ładoń 2021, McFayden 1928); a pass with a library could replace them.

Overlap notes for the owner (nothing was edited): `wh-354` ends the Gallic Wars in 50 BCE (the card ends the fighting in 51 and the command in 50).

### Locators added (2026-10-30)

`add-locators.js` (one title per request, retried through Wikipedia's rate limit) gave **`rm-356` Carrhae (fetched from Harran, because the battle's article carries no coordinate), `rm-361` Dyrrhachium, `rm-362` Pharsalus and `rm-365` Thapsus** battle locators at zoom 8, **`rm-364` Alexandria**, and moved **`rm-388`** from Pelusium to Alexandria. `rm-366` Munda gets none: the site is disputed and no sure place stands near it. `migrate-places.js` (offline) derived `places` for `rm-364` and `rm-388`; its offline run also dropped `gr-794`'s Rafah place (its toponym is not in the offline cache), so that card and its `places-spec.json` row were restored by hand and only the Pelusium row, which no card now uses, was removed; `build-places --install`, `build-card-places --install`, `migrate-places --check` and `check-places` pass. Still without one: `rm-303`, `rm-324` and `rm-360` (wars across a region) and `rm-366`.

### B41 — `rm-401`–`rm-410`, Augustus: the monuments, the games, the laws and the heirs (2026-10-30)

Run as B40; every draft compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-401:rm-410` reads clean on eight cards; `rm-402` carries `S.chip?` (an English BMCR review of a German-titled book: the known false positive) and `rm-406` `I.none`. `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. The URL check's failures are LacusCurtius pages (the host refused the sandbox; each page was read and saved when it answered) and three Perseus dictionary entries that now answer a script 403 without a cookie (each saved when the agent fetched it). **Nine of the ten old cards were all-ancient or nearly so; the old date lines carried a place ("Vowed 42 BCE, at Philippi", "Exiled 2 BCE, to Pandateria"), a name ("First burial Marcellus, 23 BCE"), a count ("Interval 110 years") or another event's date ("Event shown Parthian standards, 20 BCE", "Pontifex maximus 12 BCE").**

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-401` Temple of Apollo Palatinus | 6 | 6 → 6 | The vow of 36 rests on Velleius, now said to be a partisan; **9 October 28 is the stone calendars' day; the fire is Ammianus's "night before 19 March" 363** (the old 18 March is Platner's reading, so the line prints the year); the temple and the "House of Augustus" are modern identifications. |
| `rm-402` Forum of Augustus | 7 | 8 → 8 | **The vow at Philippi is Suetonius's and Ovid's, and one modern view holds it was invented later; the dedication day (1 August from Dio, 12 May from Ovid) is argued, so the line prints 2 BCE**; the summi viri elogia added. |
| `rm-403` Ara Pacis | 7 | 6 → 9 | 4 July 13 and 30 January 9 are the calendars' days ("Decreed", not "Voted"); **the old card argued its own reading ("peace as yield") and it goes**; Tellus or Italia, Aeneas or Numa are modern readings; 1938 in one sentence. |
| `rm-404` Mausoleum of Augustus | 7 | 5 → 7 | **"Built 28 BCE" was the year Suetonius says it was begun**; Marcellus laid in it unfinished (Dio); Strabo's description, the Colonna fortress and the concert hall added. |
| `rm-405` Augustus of Prima Porta | 7 | 6 → 7 | **The old line dated the breastplate's scene; it now dates the statue** (a bronze original soon after 20 BCE in one museum's account, the marble 15 CE in another, found 1863); every breastplate figure is a modern reading; the paint traces added. |
| `rm-406` ludi saeculares | 6 | 6 → 6 | **The 110-year saeculum is the Augustan priests' reckoning, not a fact**; 31 May – 3 June 17 BCE from the Acta (found 1890), the choir of 27 and 27 the Acta's; Claudius's games of 47 on another count, with Suetonius's herald. |
| `rm-407` ius trium liberorum | 6 | 6 → 10 | The old card spent its space on an anecdote and Horace; **it now says what the right gave (Gaius: three children for the freeborn, four for a freedwoman)**, the grant as a favour (Pliny, Trajan), Dio's unmarried consuls and Tacitus's "no effect". |
| `rm-408` Julia the Elder | 7 | 7 → 9 | Places off the line; **the revels in the Forum are Dio's and Seneca's, the conspiracy with Iullus Antonius a modern reading**; Tacitus's slow death is his claim. The marriage-list question (`rm-382`'s clue) is replaced. |
| `rm-409` Lares Augusti | 5 | 6 → 6 | **The old card stated as fact Taylor's view that Augustus gave the wards his own household gods and Genius; the Lares Augusti as the old street gods renamed is now set against it**; the Vicus Sandaliarius altar (2 BCE) is the contemporary evidence. |
| `rm-410` princeps iuventutis | 6 | 6 → 6 | **"Dio dates … 17 BCE" was wrong: Dio gives consular years**, so the years are the Cambridge Ancient History's; each brother's naming and death on the line; the C L CAESARES denarius and Nero's coin as OCRE records. |

**Read by eye.** *Confusability:* `rm-401`/`rm-402`/`rm-403`/`rm-404` the temple (the Danaids, the library), the forum (the elogia, the fire wall), the altar (the calendar days, Aeneas or Numa) and the tomb (Strabo's trees); `rm-405` the statue (the find, the paint); `rm-406`/`rm-407` the games and the right; `rm-408`/`rm-410` the daughter and her sons (the firebrands kept for `rm-408`); `rm-409` the wards. *Legend:* Julia's revels and Augustus's "Phoebe" remark are their authors'. *Overlap:* no `gr-` or `wh-` card disagrees.

### B42 — `rm-411`–`rm-420`, Augustus to the Julio-Claudians: Livia to the Pannonian mutiny (2026-10-30)

Run as B41; every draft compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-411:rm-420` reads clean on five cards; the rest carry `W.not-why` (advisory, four cards), `S.chip?` on `rm-414` (an English BMCR review of a German-titled book: the known false positive) and `I.none` on `rm-420`. `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. Every failure in the URL check is a LacusCurtius page saved when the host answered. No `timeline` moved (`rm-414` keeps 9 CE). **The old cards were all-ancient or nearly so (Livia's nine sources were all ancient); their date lines carried ages ("aged 29", "aged 33", "Aged 75"), counts ("Roman losses 3 legions", "Reign counted 23 years", "Legions 3, in Pannonia") and other men's reigns.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-411` Livia | 7 | 9 → 8 | **The poisonings (the figs among them) are rumours Tacitus and Dio pass on, and the Cambridge Ancient History reads them as her enemies' propaganda**; born 58 BCE (no open source prints 59), married 17 January 38; deified 42 in one modern chronology (the Cambridge Ancient History says 41). |
| `rm-412` Agrippa Postumus | 6 | 8 → 8 | **Adopted 27 June 4 CE is Velleius's day** (one modern account 26 June); the reasons for his banishment are the authors' words; who ordered the killing stays open (Tacitus blames Tiberius and Livia; the Cambridge Ancient History and Syme allow Augustus's own order). |
| `rm-413` Nero Claudius Drusus | 6 | 5 → 6 | **The gossip that Octavian was his father is Suetonius's, the woman at the Elbe Dio's tale; the death is two accounts (Livy's summary: a fall from his horse; Dio: disease)**; the canals' course is argued. |
| `rm-414` Battle of the Teutoburg Forest | 7 | 6 → 8 | **No ancient writer names the month: September is a modern reconstruction; no total of dead is given** (Velleius counts the units lost); Augustus's "give me back my legions" is Suetonius's hearsay; Kalkriese since 1987 – 89, with the doubts. |
| `rm-415` Divus Augustus | 6 | 7 → 7 | **The old card called Augustus the first ruler Rome made a god; Julius Caesar had been voted among the state's gods in 42 BCE.** 17 September from the Fasti Amiternini through a modern account; the ex-praetor is Suetonius's, his name and Livia's million Dio's. |
| `rm-416` Julio-Claudian dynasty | 7 | 8 → 9 | **"Julio-Claudian" is the historians' name; Tacitus's Galba speaks of "the family of the Julii and the Claudii"**; 27 BCE – 68 CE with Livius's 31 BCE; 9 June 68 is a modern day (Suetonius gives none). |
| `rm-417` Tiberius | 8 | 7 → 9 | Velleius served under him, Tacitus is hostile, each said; **the smothering by Macro is Tacitus's own claim, beside Suetonius's variants; 16 March 37 rests on the Arval acts (Dio is ten days late)**; no question uses Capri, Sejanus, maiestas or the mutiny. |
| `rm-418` dies imperii | 5 | 7 → 6 | **The old card told Tiberius's accession; it now explains the concept** (the Arval acts for Gaius, Vespasian's 1 July 69); Tiberius's own day is a modern dispute (17 September in the Cambridge Ancient History, early September in Wellesley 1967, read in abstract). The "23 years" row goes. |
| `rm-419` Germanicus | 7 | 7 → 8 | The poisoning and the spells in the walls are Tacitus's report; **the Senate's decree on Piso treats the murder only as the dying man's accusation**; the Tabula Siarensis added; 10 October 19 from the Antium calendar. |
| `rm-420` Percennius | 5 | 7 → 5 | **His speech is Tacitus's composition; the eclipse is 27 September 14 CE in NASA's catalogue (Furneaux: 26 September), Tacitus gives no day**; the Rhine mutiny is kept for `rm-644`. |

**Read by eye.** *Confusability:* `rm-411`/`rm-412` the wife (the figs) and the grandson (Clemens); `rm-413`/`rm-414`/`rm-419` the father (the Elbe), the battle (the bones) and the son (the Antioch spells); `rm-415`/`rm-418` the cult (Atticus's oath) and the counting day (the Arval acts); `rm-416`/`rm-417` the house and the man; `rm-420` the mutineer. *Legend:* the woman at the Elbe, Augustus's cry for his legions and the smothering of Tiberius are their authors'. *Overlap:* `wh-366` gives Nero's death as 9 June 68 CE, as `rm-416` does.

### B43 — `rm-421`–`rm-430`, the Julio-Claudians: Arminius to Claudius (2026-10-30)

Run as B42 (the research agents were stopped by a usage limit mid-hundred and resumed on their saved pages); every draft compared with its card after `batch.sh`: no mismatch. Checks: `rm-audit.js --range=rm-421:rm-430` reads clean on four cards; the rest carry `S.chip?` on `rm-421` and `rm-423` (English BMCR reviews of German-titled books: the known false positive), `I.none` on `rm-422` and `rm-424`, and `W.not-why` (advisory, three cards). `check-questions`, `check-cards`, `check-docs`, `split-cards --check` and `test-card-plans` pass; `check-citations --card` 0 mismatched on every card. The URL check's failures are LacusCurtius pages saved when the host answered and one Perseus dictionary entry (Lewis and Short) that answers a script 403. **The old cards leaned on one ancient author three or four times (Suetonius four times on Capreae, three times on Chaerea and Macro); their date lines carried another man's reign ("Tiberius's reign 14 – 37 CE", "Owner died 24 January 41 CE"), an omen ("Lighthouse fell 37 CE") and a back-calculated birth ("c. 18 BCE").**

| card | bar | sources | the main changes |
|---|---|---|---|
| `rm-421` Arminius | 8 | 9 → 9 | **"c. 18 BCE" was a back-calculation from Tacitus's thirty-seven years and goes; the death is 19 CE (the Cambridge Ancient History) or 21 CE (Furneaux's count), both shown**; "liberator of Germany" is Tacitus's verdict; "Strabo watched the triumph" was wrong (he lists the captives). |
| `rm-422` Gnaeus Calpurnius Piso | 5 | 9 → 6 | **The old card and glossary said the Senate "acquitted" him of poisoning: Tacitus says only that the charge seemed answered, and the decree shows no formal murder charge** (Flower's review); the decree's 10 December 20 CE on the line; Celenderis, the fort he held, keeps its locator. |
| `rm-423` Sejanus | 7 | 9 → 7 | **"Camp built by 23 CE" dated nothing a source prints and goes**; executed 18 October 31 (the Cambridge Ancient History's day: Dio gives none); Drusus's poisoning is Tacitus's report from Apicata's statement and confessions under torture; Velleius wrote at Sejanus's height. |
| `rm-424` Macro | 5 | 8 → 6 | The letter scene from Macro's side only (Dio); **the smothering of Tiberius is Tacitus's version against Dio's, with the Cambridge Ancient History's doubt**; Ennia in three conflicting versions; Egypt and the suicide of 38. The Gemonian Stairs locator was Sejanus's. |
| `rm-425` Capreae | 7 | 10 → 8 | **The lighthouse omen leaves the line; Tacitus's twelve villas are his count, from a passage whose text is unstable**; the debauchery is Tacitus's and Suetonius's, set against the Cambridge Ancient History's note that no first-century writer tells it; the exchange with Naples added. |
| `rm-426` maiestas | 6 | 9 → 8 | The line is now the law's own: the lex Appuleia (100 BCE, Furneaux), the revival of 15 CE and Gaius's of 39 CE (the Loeb translator's margin, said so); **Tacitus's framing is called hostile**; the informers' reward is left to `rm-482`. |
| `rm-427` Caligula | 9 | 9 → 9 | **31 August and 24 January are the moderns' forms of Suetonius's Roman days**; the "little boots" question goes to `rm-662`; the illness of 37 (Philo, a hostile contemporary), the bridge at Baiae, the shells with Winterling's reading, the Temple statue. |
| `rm-428` Incitatus | 7 | 7 → 8 | **The consulship never happened, said plainly; the name means "swift", not "at full gallop"**; Dio's fellow-priest added; a satire on the Senate or a joke, both modern readings; the line is Gaius's reign, the period the anecdote belongs to. |
| `rm-429` Cassius Chaerea | 6 | 8 → 8 | **The old card cited a Russian article that never names him**; the Rhine-mutiny row is Tacitus's mention; the taunts and watchwords Suetonius's; Josephus the fullest narrative, probably drawing on Cluvius Rufus (Wiseman, via BMCR). |
| `rm-430` Claudius | 9 | 9 → 9 | **"Died 54 CE" is now 13 October (Suetonius's third day before the Ides)**; the poisoning is the ancient authors' report, with Suetonius's own admission that the poisoner and method were disputed; the siblings' clues (aqueduct, Fucine lake, maiestas) are dropped. |

**Read by eye.** *Confusability:* `rm-421`/`rm-422` the German (Flavus across the Weser) and the governor (the decree at Seville); `rm-423`/`rm-424` the fallen prefect (Apicata) and his successor (the letter, Ennia); `rm-425`/`rm-426` the island and the law; `rm-427`/`rm-428`/`rm-429` the emperor, the horse and the killer; `rm-430` Claudius behind the curtain. *Legend:* Tiberius on Capri, the horse as consul, the smothering of Tiberius and the mushroom are their authors'. *Overlap:* no `gr-` or `wh-` card disagrees.
