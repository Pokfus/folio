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
| B4 | Italy before Rome (`rm-italy`) | `rm-031`–`rm-040` | 10 | 104 | open |
| B5 | Italy before Rome (`rm-italy`) / Rome under the kings (`rm-kings`) | `rm-041`–`rm-050` | 10 | 112 | open |
| B6 | Rome under the kings (`rm-kings`) | `rm-051`–`rm-060` | 10 | 118 | open |
| B7 | Rome under the kings (`rm-kings`) | `rm-061`–`rm-070` | 10 | 132 | open |
| B8 | Rome under the kings (`rm-kings`) | `rm-071`–`rm-080` | 10 | 123 | open |
| B9 | Rome under the kings (`rm-kings`) | `rm-081`–`rm-090` | 10 | 125 | open |
| B10 | The early Republic (`rm-early-republic`) | `rm-091`–`rm-100` | 10 | 126 | open |
| B11 | The early Republic (`rm-early-republic`) | `rm-101`–`rm-110` | 10 | 126 | open |
| B12 | The early Republic (`rm-early-republic`) | `rm-111`–`rm-120` | 10 | 121 | open |
| B13 | The early Republic (`rm-early-republic`) | `rm-121`–`rm-130` | 10 | 121 | open |
| B14 | The early Republic (`rm-early-republic`) | `rm-131`–`rm-140` | 10 | 104 | open |
| B15 | The conquest of Italy (`rm-conquest-italy`) | `rm-141`–`rm-150` | 10 | 109 | open |
| B16 | The conquest of Italy (`rm-conquest-italy`) | `rm-151`–`rm-160` | 10 | 119 | open |
| B17 | The conquest of Italy (`rm-conquest-italy`) | `rm-161`–`rm-170` | 10 | 110 | open |
| B18 | The conquest of Italy (`rm-conquest-italy`) | `rm-171`–`rm-180` | 10 | 104 | open |
| B19 | The Punic Wars (`rm-punic-wars`) | `rm-181`–`rm-190` | 10 | 129 | open |
| B20 | The Punic Wars (`rm-punic-wars`) | `rm-191`–`rm-200` | 10 | 127 | open |
| B21 | The Punic Wars (`rm-punic-wars`) | `rm-201`–`rm-210` | 10 | 128 | open |
| B22 | The Punic Wars (`rm-punic-wars`) | `rm-211`–`rm-220` | 10 | 115 | open |
| B23 | The Punic Wars (`rm-punic-wars`) | `rm-221`–`rm-230` | 10 | 113 | open |
| B24 | The Punic Wars (`rm-punic-wars`) / Rome and the Mediterranean (`rm-mediterranean`) | `rm-231`–`rm-240` | 10 | 120 | open |
| B25 | Rome and the Mediterranean (`rm-mediterranean`) | `rm-241`–`rm-250` | 10 | 123 | open |
| B26 | Rome and the Mediterranean (`rm-mediterranean`) | `rm-251`–`rm-260` | 10 | 118 | open |
| B27 | Rome and the Mediterranean (`rm-mediterranean`) | `rm-261`–`rm-270` | 10 | 122 | open |
| B28 | Rome and the Mediterranean (`rm-mediterranean`) / The Republic in crisis (`rm-crisis`) | `rm-271`–`rm-280` | 10 | 135 | open |
| B29 | The Republic in crisis (`rm-crisis`) | `rm-281`–`rm-290` | 10 | 115 | open |
| B30 | The Republic in crisis (`rm-crisis`) | `rm-291`–`rm-300` | 10 | 143 | open |
| B31 | The Republic in crisis (`rm-crisis`) | `rm-301`–`rm-310` | 10 | 85 | open |
| B32 | The Republic in crisis (`rm-crisis`) | `rm-311`–`rm-320` | 10 | 96 | open |
| B33 | The fall of the Republic (`rm-fall-republic`) | `rm-321`–`rm-330` | 10 | 83 | open |
| B34 | The fall of the Republic (`rm-fall-republic`) | `rm-331`–`rm-340` | 10 | 95 | open |
| B35 | The fall of the Republic (`rm-fall-republic`) | `rm-341`–`rm-350` | 10 | 95 | open |
| B36 | The fall of the Republic (`rm-fall-republic`) | `rm-351`–`rm-360` | 10 | 84 | open |
| B37 | The fall of the Republic (`rm-fall-republic`) | `rm-361`–`rm-370` | 10 | 76 | open |
| B38 | Augustus (`rm-augustus`) | `rm-371`–`rm-380` | 10 | 84 | open |
| B39 | Augustus (`rm-augustus`) | `rm-381`–`rm-390` | 10 | 91 | open |
| B40 | Augustus (`rm-augustus`) | `rm-391`–`rm-400` | 10 | 91 | open |
| B41 | Augustus (`rm-augustus`) | `rm-401`–`rm-410` | 10 | 61 | open |
| B42 | Augustus (`rm-augustus`) / The Julio-Claudians (`rm-julio-claudians`) | `rm-411`–`rm-420` | 10 | 79 | open |
| B43 | The Julio-Claudians (`rm-julio-claudians`) | `rm-421`–`rm-430` | 10 | 72 | open |
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
2. Write `ADDENDUM.md` in the scratch dir: what this collection adds to `.claude/wh-refine/BRIEF.md`
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
