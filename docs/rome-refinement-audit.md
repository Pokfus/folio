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
| B1 | Italy before Rome (`rm-italy`) | `rm-001`–`rm-010` | 10 | 94 | open |
| B2 | Italy before Rome (`rm-italy`) | `rm-011`–`rm-020` | 10 | 100 | open |
| B3 | Italy before Rome (`rm-italy`) | `rm-021`–`rm-030` | 10 | 95 | open |
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
