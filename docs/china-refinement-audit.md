# The China refinement audit (Nov 2026)

The China collection (`china`, `cnh-001`–`cnh-1000`, plan in `docs/china-card-plan.md`) is complete, and was
written quickly in bulk. This is the pass that audits and refines ALL of it, in batches of ten in plan order,
to one set of rules — so expect unsourced claims, wrong dates, shaky citations and, China's own fault, the
sage kings and the Xia told as history; and record each one found.

**The model is the Ancient Rome audit, `docs/rome-refinement-audit.md`, and behind it the Ancient Greece
audit, `docs/greece-refinement-audit.md`, whose settled rules apply here unchanged** — read Greece's "The
rules" section; they are summarised below, not restated in full. What is mechanical is measured by
`node .claude/cnh-audit.js` (report-only; `--range=cnh-001:cnh-010`, `--card=`, `--summary`, `--worst`), which
is `greece-audit.js` run with a China config, plus the Chinese-name checks; the house spellings by
`node .claude/check-cnh-spellings.js`. What only a reader can judge is read by eye and recorded in the ledger
at the foot of this file, batch by batch.

## The rules

### The Greece rules, as applied here

- **Questions**: 3 phrasings, one sentence each, 20–34 words, blank mid-sentence; **no year, century,
  millennium or decade**. Siblings are told apart by who, where and what. No modern scholar named, except on a
  card whose subject IS that person. None gives the answer away: not its own translation ("the Divine Farmer"
  on Shennong), not a name inside the term, not its pinyin gloss.
- **Background**: 10 sentences, 5 + 5, **270–285 words**; written for a 15-year-old new to the topic; complete
  against the term's own Wikipedia article as a checklist (never cited); at most 2 sentences on modern
  discovery and 3 on debate.
- **Sources**: the tiered bar by difficulty (1 → 9, 2 → 8, 3 → 7, 4 → 6, 5 → 5); a modern author in at most
  2 sources; an ancient text (the *Shiji*, the *Shangshu*, the *Shanhaijing*, the *Zuo Zhuan*, the
  *Huainanzi* …) in at most 2 (3 only on a card about that text); at least half modern scholarship; at most
  one source per non-English language, each with its chip; every URL curled; every key quote read on the page
  fetched; every source pointed at by a marker.
- **Think it through**: exactly 3 FAQs, written apart from the background (4-gram overlap aims under 25%, a
  fault at 50%), each answer 12–60 words with explicit numbered markers into the card's own list.
- **Date line**: ≤ 4 rows, labels ≤ 16 characters naming no place and no man, era on every year under 1000,
  `c.` in front of a range, only dates (no counts), start and end as completely as the sources allow; agrees
  with `docs/china-chronology.md` and its pins. **Except on a PROTECTED card** (below), whose line is left as
  it stands.
- **Picture**: depicts the whole term; PD, CC0, CC BY or CC BY-SA; a credit naming author and licence; a
  description that names no source, licence or file; on no other card.
- **Locator**: through `add-locators.js`, never typed; a site with somewhere to stand gets one — the site, not
  a modern city or the province, with the site as its label. A mythic place (Kunlun, Penglai, Diyu) gets none.
- **Glossary**: each card's answer term has an entry, and the entry and the card agree (date, figures, claims,
  spelling). An entry is corrected in the same commit as its card; a slug is never renamed (a variant becomes
  an alias). Grep `glossary.js` before every `add-glossary.js` run: it overwrites in silence.

### What China adds

Hunt these first.

1. **Myth and legend told as history.** The Three Sovereigns and Five Emperors, Pangu, Nüwa, Fuxi, Shennong,
   the Yellow Emperor, Yao, Shun, Yu and the flood, and the Xia's kings are what late texts report: the
   *Shiji* (c. 100 BCE), the *Shangshu*, the *Bamboo Annals* (whose own transmission is disputed), the
   *Shanhaijing*, the *Huainanzi*. The card says so in its own voice ("Sima Qian tells…", "the tradition
   held…") and says when each story is first attested (the Myth register, below). What archaeology shows
   (Erlitou, Taosi, Shimao, Liangzhu) is stated separately and never used to "prove" the Xia.
2. **A transmitted text is evidence of when it was written.** Never cite the *Shiji* as a record of the Shang
   court, or the *Shangshu*'s chapters as Western Zhou documents without saying which are held genuine.
3. **A legendary or reconstructed date is labelled** (on NON-protected cards). The sage kings' and the Xia's
   years are traditional (2070 BCE is the Xia–Shang–Zhou Chronology Project's, and contested); Shang reign
   dates before Wu Ding are not fixed. The label says `Traditional`, the prose says whose reckoning. Never
   "after 2070 BCE" or a converted regnal year a source does not print.
4. **A modern label as ancient fact**: "Xia culture" for Erlitou; the Three Sovereigns' list (the texts
   differ); the Neolithic type-site names (Yangshao, Longshan, Liangzhu are 20th-century labels taken from a
   first-dug village); "taotie" (a later name for the Shang motif); "oracle bones" as a Shang term; the
   "Chinese dragon" as one creature.
5. **A date belonging to another event**: an excavation year as a site's age; one site's radiocarbon dates
   given to a whole culture; the oracle bones' 1899 identification as their date.
6. **A figure no source gives**: site areas, populations, Liangzhu's dam volumes, oracle-bone counts,
   sacrifice totals, bronze weights. Modern estimates are estimates, with a range and whose they are.

- **Oracle bones, bronze inscriptions and excavated objects are contemporary evidence**: cite the corpus or the
  museum record a reader can open, never a dealer.
- **For a subject a `wh-`, `gr-`, `gc-`, `jp-` or `ko-` card also covers** (`wh-396`–`wh-415` is the Ancient
  China survey), read that card and note any disagreement in the ledger; never edit it from this audit.

### Sources (China's own rule)

The open scholarship on early China reachable from this sandbox is English, French (Persée first pages, BEFEO,
*Extrême-Orient Extrême-Occident*, OpenEdition) and Chinese (icm.gov.mo's *Revista de Cultura* PDFs;
`docs/china-card-findings.md` has the survey and how to read a CJK PDF). The audits' rule is **one source per
non-English language**, each chipped (`[in French]`, `[in Chinese]`); a classical text on ctext.org in the
original counts toward Chinese (Legge's or another English translation does not). Where the cap bites, prefer
an English review of the same work, and say in the ledger where a card had to choose.

### Protected date lines

**The date lines of the cards about ONE human being, historical or legendary, are refined in another thread
and are left alone here.** The list is `node .claude/person-cards.js --list` (`individual` and `legendary`)
plus every card tagged `ruler` or `person` it does not catch, confirmed against main on 2026-11-08 (the
snapshot of each line is the run's `protected.json`). `cnh-audit.js` reads the block below: on these cards it
sets the date line's own findings aside (one `P.protected` note counts them) but still checks that the
background carries every year on the line (`D.not-in-prose`) and the pins; `precheck.js` fails a draft whose
patch carries `answerDate`, `undatable` or `timeline` for one of them.

```protected-cards
cnh-007 Yellow Emperor        (ruler; the line is empty)
cnh-008 Chiyou                (legendary)
cnh-010 Yao                   (ruler)
cnh-011 Shun                  (ruler)
cnh-012 Yu the Great          (ruler)
cnh-014 Houyi                 (legendary)
cnh-016 Kuafu                 (legendary)
cnh-039 Guandi                (legendary: Guan Yu deified)
cnh-055 Shaokang              (ruler)
cnh-057 Qi of Xia             (ruler)
cnh-058 Jie of Xia            (ruler)
cnh-068 Tang of Shang         (ruler)
cnh-073 Wu Ding               (ruler)
cnh-074 Fu Hao                (individual; carries the person template)
```

- The draft's patch omits `answerDate`, `undatable` and `timeline`; its `pins` and `chronology` are read from
  the line AS IT STANDS. The protected lines deliberately carry counts, ages and notes ("Reigned: 70 years…",
  "First of: 31 Shang kings", "(age N)"): they are never "fixed" under the dates-only rule and never moved with
  `set-timeline.js`.
- Everything else on these cards — questions, background, sources, why, glossary, the Chinese name — is
  audited as usual, but **the background carries every year on the protected line with the same digits and
  contradicts none of its rows**. A protected row that looks wrong is reported in the ledger for the owner and
  left.
- After every apply, and after every merge of main, each protected card's `answerDate`, `undatable` and
  `timeline` are diffed against the snapshot; a change made here is reverted before committing; a change that
  came from main is taken and re-snapshotted.

### The Chinese name (the answer bubble)

Every `cnh-` card's answer carries the Chinese name the answer bubble shows (`answerNameHTML`;
`docs/reference.md`, "THE ANSWER'S CHINESE NAME"): `hanzi` (simplified), `traditional`, and `pinyin` with tone
marks; `translations` stays `""` (`docs/card-authoring.md`). The renderer prints the traditional line only
where it differs from the simplified, so the collection fills `traditional` on every card and an identical
form is correct. Check each card:

- the characters name the ANSWER TERM itself — not a description, a different term or the plan line's essay
  title ("Chinese mythology" is 中国神话; a mythic place its own name; a modern label its standard modern Chinese
  term) — checked against an open source (ctext.org, a museum record, a Chinese-language article);
- simplified and traditional are each correct and are the same word;
- the pinyin matches the characters syllable by syllable with the right citation tones (the third-tone and
  yi/bu changes left unmarked, as standard), standard word division per the official orthography, a capital on
  proper nouns, and the apostrophe before a syllable opening on a, o or e (Chang'e).

`cnh-audit.js` checks it mechanically: `Z.none` (no hanzi), `Z.pinyin` (the syllables do not match the
characters, or an apostrophe is missing), `Z.trad` (traditional identical where it should differ, or the
reverse — needs `opencc-js` on `NODE_PATH`) and the lead `Z.reading?` (a dictionary reading differs — needs
`pinyin-pro` on `NODE_PATH`; polyphones trip it, and a library's reading is a check, never a source). Install
both OUTSIDE the repo, as Playwright is. A wrong or missing name is corrected in the card's patch (`hanzi`,
`traditional`, `pinyin` are light fields `add-card.js` accepts), sourced in the draft's notes, and recorded in
the ledger.

### House spellings

`docs/china-chronology.md`, "Spellings", is the table: one house form for every name the collection uses,
pinyin without tone marks in English prose, ü kept, the variants as glossary aliases. A 19th-century
translation (Legge's *Shû King*) is quoted and cited as printed; the card's own voice uses the house form.
`check-cnh-spellings.js` is run on the hundred before and after each batch, and on the drafts before applying
(`--drafts=$S/out <ids>`); the ledger reports what it found.

## Myth register

One row per story the first hundred tells: the versions, the earliest text each is attested in (with its date
as scholarship gives it), the card that tells it as its own subject, and the cards that only mention it. **Every
card that touches a story agrees with its row**: the same version named the same way, the same earliest source
and date, the same names for the characters, the same hedging ("the *Huainanzi* tells…", never the card's own
voice). Where two cards tell different versions, each says it is one version and names its source. Where a card
contradicts the register, the card is fixed — or the register is, with a source — in the same batch.

**The attestations below were set in Batch 0 from the standard accounts and are PROVISIONAL**: each is
confirmed or corrected, with its source, by the batch that drafts the row's own card, and marked so.

| story | versions and earliest attestation | own card | mentioned on | outside the hundred |
|---|---|---|---|---|
| Pangu and the separation of heaven and earth | Pangu growing between heaven and earth, and the world made from his body; attested no earlier than the 3rd century CE (Wei Zhao's *Dongji* fragment, Wei Zhao c. 204–273 CE, then Xu Zheng's lost *Sanwu liji*, both known from later quotation) — confirmed B1 (`cnh-003`, Lü Zongli) | `cnh-003` | `cnh-001`, `cnh-005` | `ko-047` |
| Nüwa making people | moulding people from yellow earth; the *Fengsu tongyi* (Ying Shao, late 2nd century CE, known from quotation) — provisional, NOT confirmed in B1 (ctext shut; `cnh-004` names no text) | `cnh-004` | `cnh-001`, `cnh-002` | — |
| Nüwa mending the sky | the five-coloured stones and the turtle's legs; the *Huainanzi* (presented 139 BCE) — confirmed B1 (`cnh-004`, Zürn) | `cnh-004` | `cnh-018` | — |
| Nüwa and Fuxi as a pair | kept apart in the Warring States texts; first named in one passage by the *Huainanzi*; the serpent-tailed couple of Han tomb art (the Luoyang murals of 86–49 BCE a disputed identification; the first naming inscriptions Eastern Han); as siblings and spouses in much later texts (the Tang *Duyi zhi*) — confirmed B1 (`cnh-005`, Zhao 2019), the *Duyi zhi* still provisional | `cnh-005` | `cnh-004` | `cnh-848`, `cnh-851`, `cnh-857`, `cnh-874`, `cnh-969` (Fuxi) |
| Gonggong breaking Mount Buzhou | Gonggong against Zhuanxu (the *Huainanzi* and the *Liezi*); the *Liezi* tells Nüwa's mending first, and Sima Zhen (8th century CE) puts it after the fight; the tilt of heaven and earth — confirmed B2 (`cnh-018`) | `cnh-018` | `cnh-004`, `cnh-016` | — |
| The Yellow Emperor and Chiyou at Zhuolu | the battle at Zhuolu in the *Shiji* (c. 100 BCE); the rain, wind and drought spirits Ying Long and Ba in the *Shanhaijing*, which sets the fight in the wilds of Jizhou, not at Zhuolu; the *Yi Zhoushu* "Chang Mai" version, with the Red Emperor (date disputed); Chiyou himself already in the *Shangshu* "Lü xing" — confirmed B1 (`cnh-009`, `cnh-008`) | `cnh-009` | `cnh-007`, `cnh-008`, `cnh-028`, `cnh-098` | `cnh-790` (Chiyou) |
| Yao, Shun and the abdication | Yao passing over his son for Shun; the "Canon of Yao" of the *Shangshu*, the *Mencius*, and the excavated Chu-script manuscripts *Tang Yu zhi dao*, *Zigao* and *Rongchengshi* (middle Warring States) — confirmed B1 (`cnh-010`, Chik 2023); "c. 300 BCE" on no page read | `cnh-010`, `cnh-011` | `cnh-002`, `cnh-040` | `cnh-131`, `cnh-480` |
| The flood: Gun and Yu | Gun stealing the swelling soil (known only from Han works, the *Shanhaijing* and the *Huainanzi*) or failing for nine years (*Shangshu*), Yu channelling the waters; Yu named on the Bin Gong / Sui Gong *xu* bronze (middle Western Zhou, 9th century BCE, the earliest mention of Yu) — confirmed B2 (`cnh-012`, `cnh-013`: Cook, Chen, Bodde) | `cnh-013` | `cnh-012`, `cnh-010`, `cnh-011`, `cnh-056` | `wh-244`, `cnh-848`, `gc-802`, `gc-820` |
| Houyi shooting the suns | the ten suns and the archer Yi; the *Chuci* "Tianwen" asks of it (at least 4th century BCE; one reading takes the line as one sun), the *Huainanzi* tells it in full (chapter 8); a second Yi, the usurper of Youqiong, in the *Zuo Zhuan* — confirmed B2 (`cnh-014`) | `cnh-014` | `cnh-015` | — |
| Chang'e and the elixir | Heng'e (Chang'e) taking the elixir of the Queen Mother of the West and fleeing to the moon; the excavated *Guicang* slips (Wangjiatai, a Qin tomb, found 1993), then the *Huainanzi* (139 BCE); Zhang Heng's *Lingxian* quotes the oracle — confirmed B2 (`cnh-015`) | `cnh-015` | `cnh-014`, `cnh-020` | — |
| Kuafu chasing the sun | Kuafu racing the sun and dying of thirst, his staff becoming the Deng Forest; the *Shanhaijing* (two tellings: thirst; Yinglong in the "Dahuang beijing"), the *Liezi* — confirmed B2 (`cnh-016`) | `cnh-016` | `cnh-018`, `cnh-028` | — |
| Jingwei filling the sea | the drowned daughter of Yandi become a bird carrying twigs and stones; the *Shanhaijing* "Classic of the Northern Mountains" (the Mount Fajiu passage), the book existing by the early 1st century BCE — confirmed B2 (`cnh-017`) | `cnh-017` | `cnh-028` | — |
| The Queen Mother of the West and Kunlun | named first in the *Zhuangzi* (c. 400 – 300 BCE); a fearsome figure with a leopard's tail in the *Shanhaijing*; the Jade Pool in the *Mu tianzi zhuan*; a goddess of immortality by the Han, with a mass cult in 3 BCE (*Hanshu*); the peaches Eastern Han; Kunlun as the axis mountain — confirmed B2 (`cnh-019`, `cnh-020`) | `cnh-020`, `cnh-019` | `cnh-015`, `cnh-028`, `cnh-070`, `cnh-083` | `cnh-132`, `cnh-900`, `gc-911` |
| The Cowherd and the Weaver Girl | the two stars named in the *Shijing* "Da dong"; the lovers parted by the Milky Way in the Han "Nineteen Old Poems"; the magpie bridge on the seventh night later (the seventh night attested by the early 2nd century CE, the magpie bridge by its end; the old card's *Huainanzi* line found in no text read) — confirmed B4 (`cnh-036`, Laing) | `cnh-036` | — | — |
| Penglai and the isles of the immortals | the isles that sink as boats approach and the Qi and Yan kings' search, in the *Shiji* (c. 91 BCE, the earliest); the *Liezi*'s isles on turtles later (parts of the *Liezi* are 2nd century CE or later) — set B3 (`cnh-021`) | `cnh-021` | — | `cnh-210` (Xu Fu) |
| The Eight Immortals as a group | the eight together first in Yuan drama and birthday pieces (Hu Yinglin's late Ming dating), at most the end of the Southern Song; members' own cults older — set B3 (`cnh-022`) | `cnh-022` | — | — |
| The Legend of the White Snake | Tang snake-woman tales; a West Lake tale of three pagodas (13th–14th century, printed in the mid-16th); the settled form in Feng Menglong's collection (1624), with the umbrella and Leifeng Pagoda; the sympathetic heroine of the 18th-century plays — set B4 (`cnh-037`) | `cnh-037` | — | — |
| Mazu | Lin Moniang's traditional life (960–987); the first court honour (1122) and the title Tianfei (1281), from the Qing *Tianfei xiansheng lu*; the loom legend in two versions — set B4 (`cnh-038`) | `cnh-038` | — | — |
| The Three Sovereigns and Five Emperors | the lists differ by text: the *Shiji*'s Five Emperors (Yellow Emperor, Zhuanxu, Ku, Yao, Shun); Three Sovereigns as Heavenly, Earthly and Human or Grand (the *Shiji*'s Qin annals), or as Fuxi, Nüwa and Shennong, or Fuxi, Shennong and the Yellow Emperor, or Fuxi, Suiren and Shennong, or Fuxi, Zhurong and Shennong in other texts; Sima Zhen's Tang chapter supplies Fuxi, Nüwa and Shennong — confirmed B1 (`cnh-002`, Chavannes) | `cnh-002` | `cnh-003`–`cnh-007`, `cnh-040` | `cnh-879` |

## Working a card

Per card, in this order: questions → date line (non-protected) → background → sources → Think it through →
Chinese name → spellings → locator → glossary. Write with `node .claude/add-card.js <patch.json> --replace
--no-image` (through `.claude/wh-refine/apply.js`); locators with `node .claude/add-locators.js`.

After each batch: `cnh-audit.js --range=`, `check-cnh-spellings.js --range=`, `check-questions.js`,
`check-style.js`, `check-cards.js --prefix=cnh-NNN` on each card, `check-docs.js`, `split-cards.js --check`,
`test-card-plans.js` and `apply-wiki-links.js --check`; the protected diff; then the ledger entry, chronology
rows and pins, pictures to redo, glossary candidates and the one changelog line ("N China cards are
rewritten", count and collection only; one version bump per PR), all in one commit.

## The tools (Batch 0)

| tool | what it does |
|---|---|
| `.claude/cnh-audit.js` | report-only per-card check of every mechanical rule — `greece-audit.js` under a China config, as `rm-audit.js` is: state locators (`L.missing`), the card–glossary pairing (`G.none`, `G.date`), the Chinese name (`Z.none`, `Z.pinyin`, `Z.trad`, `Z.reading?`) and the protected date lines (`P.protected`). Rome's AUC rule is not carried |
| `.claude/check-cnh-spellings.js` | report-only: the Spellings table's variants in a card's own voice and in the `china` glossary entries; `--drafts=<dir> <ids>` reads the drafts |
| `greece-audit.js` `filter` | a config hook that lets a collection set findings aside (China's protected lines); Greece, World History and Rome run byte-identical |
| `.claude/wh-refine/precheck.js` | reads `global.AUDIT_PROTECTED` from the audit and fails a protected card's patch that carries `answerDate`, `undatable` or `timeline`; `P.protected` and `Z.reading?` are notes, not failures |
| `.claude/wh-refine/` | the harness, run with `REFINE_PREFIX=cnh-` (cfg.js pads to three digits; precheck picks `cnh-audit.js`; `related.js` already knew `cnh-`) |
| `.claude/wh-refine/ADDENDUM-cnh.md` | what China adds to `BRIEF.md`, for the drafting agents |
| `docs/china-chronology.md` | the conventions, the Spellings table and the dates the collection commits to, with the `chronology-pins` block `cnh-audit.js` checks |

**The baseline, measured before any batch** (`node .claude/cnh-audit.js --summary`, 2026-11-08, with
`opencc-js` and `pinyin-pro` on `NODE_PATH`):

```
cnh-audit: 1000 card(s), 0 with no finding
  B.length          2 card(s)
  B.sentence-length 930 card(s)
  D.era             38 card(s)
  D.label           21 card(s)
  D.not-a-date      93 card(s)
  D.not-in-prose    401 card(s)
  G.date            21 card(s)
  G.none            4 card(s)
  I.caption-source  4 card(s)
  I.duplicate       1 card(s)
  I.none            730 card(s)
  L.missing         44 card(s)
  Q.date            804 card(s)
  Q.sibling         85 card(s)
  S.ancient-cap     1 card(s)
  S.bar             299 card(s)
  S.chip?           49 card(s)
  S.lang-cap        551 card(s)
  S.modern-cap      5 card(s)
  S.modern-half     41 card(s)
  W.no-marker       1000 card(s)
  W.overlap         583 card(s)
  W.overlap-high    667 card(s)
  Z.none            95 card(s)
  Z.pinyin          1 card(s)
  Z.reading?        39 card(s)
  Z.trad            9 card(s)
```

The large real findings are `Q.date` (dates in the questions), `S.lang-cap` (more than one Chinese or French
source on a card — the original writing leaned on both), `D.not-in-prose`, `Z.none` (95 cards, all after the first
hundred, carry no Chinese name) and the leads `Z.reading?` and `Z.trad`. As in the earlier audits, `W.no-marker` (no answer was marked before
the rule), `S.bar` (the bar rose from a flat 5) and `B.sentence-length` are the rules arriving rather than
faults found. The spellings checker's baseline over the whole collection is in the Batch 0 ledger entry.

## The batches

Ten cards each, in plan order. "Findings" is the baseline count from `cnh-audit.js --worst` (findings summed
over the ten cards, the `P.protected` notes not counted); batches are done in plan order unless the user says
otherwise.

| batch | deck | cards | n | findings | state |
|---|---|---|---|---|---|
| B1 | Mythology (`cn-myth`) | `cnh-001`–`cnh-010` | 10 | 108 | **done 2026-11-08** |
| B2 | Mythology (`cn-myth`) | `cnh-011`–`cnh-020` | 10 | 102 | **done 2026-11-08** |
| B3 | Mythology (`cn-myth`) | `cnh-021`–`cnh-030` | 10 | 108 | **done 2026-11-08** |
| B4 | Mythology (`cn-myth`) | `cnh-031`–`cnh-040` | 10 | 94 | **done 2026-11-08** |
| B5 | Neolithic China and the Xia (`col-2`) | `cnh-041`–`cnh-050` | 10 | 101 | **done 2026-11-09** |
| B6 | Neolithic China and the Xia (`col-2`) | `cnh-051`–`cnh-060` | 10 | 117 | **done 2026-11-09** |
| B7 | Neolithic China and the Xia (`col-2`) / Shang (`col-3`) | `cnh-061`–`cnh-070` | 10 | 116 | **done 2026-11-09** |
| B8 | Shang (`col-3`) | `cnh-071`–`cnh-080` | 10 | 108 | to do |
| B9 | Shang (`col-3`) | `cnh-081`–`cnh-090` | 10 | 122 | to do |
| B10 | Shang (`col-3`) | `cnh-091`–`cnh-100` | 10 | 131 | to do |
| B11 | Shang (`col-3`) | `cnh-101`–`cnh-110` | 10 | 113 | to do |
| B12 | Western Zhou (`col-4`) | `cnh-111`–`cnh-120` | 10 | 110 | to do |
| B13 | Western Zhou (`col-4`) | `cnh-121`–`cnh-130` | 10 | 119 | to do |
| B14 | Western Zhou (`col-4`) | `cnh-131`–`cnh-140` | 10 | 124 | to do |
| B15 | Eastern Zhou (`col-5`) | `cnh-141`–`cnh-150` | 10 | 116 | to do |
| B16 | Eastern Zhou (`col-5`) | `cnh-151`–`cnh-160` | 10 | 107 | to do |
| B17 | Eastern Zhou (`col-5`) | `cnh-161`–`cnh-170` | 10 | 121 | to do |
| B18 | Eastern Zhou (`col-5`) | `cnh-171`–`cnh-180` | 10 | 110 | to do |
| B19 | Eastern Zhou (`col-5`) | `cnh-181`–`cnh-190` | 10 | 107 | to do |
| B20 | Qin (`col-7`) | `cnh-191`–`cnh-200` | 10 | 103 | to do |
| B21 | Qin (`col-7`) | `cnh-201`–`cnh-210` | 10 | 93 | to do |
| B22 | Qin (`col-7`) / Western Han (`col-10`) | `cnh-211`–`cnh-220` | 10 | 86 | to do |
| B23 | Western Han (`col-10`) | `cnh-221`–`cnh-230` | 10 | 80 | to do |
| B24 | Western Han (`col-10`) | `cnh-231`–`cnh-240` | 10 | 78 | to do |
| B25 | Western Han (`col-10`) / Xin (`col-11`) | `cnh-241`–`cnh-250` | 10 | 66 | to do |
| B26 | Xin (`col-11`) / Eastern Han (`col-12`) | `cnh-251`–`cnh-260` | 10 | 67 | to do |
| B27 | Eastern Han (`col-12`) | `cnh-261`–`cnh-270` | 10 | 93 | to do |
| B28 | Eastern Han (`col-12`) / Three Kingdoms (`col-16`) | `cnh-271`–`cnh-280` | 10 | 92 | to do |
| B29 | Three Kingdoms (`col-16`) | `cnh-281`–`cnh-290` | 10 | 84 | to do |
| B30 | Three Kingdoms (`col-16`) / Western Jin (`col-18`) | `cnh-291`–`cnh-300` | 10 | 86 | to do |
| B31 | Western Jin (`col-18`) / Sixteen Kingdoms (`col-19`) | `cnh-301`–`cnh-310` | 10 | 83 | to do |
| B32 | Sixteen Kingdoms (`col-19`) / Eastern Jin (`col-20`) | `cnh-311`–`cnh-320` | 10 | 79 | to do |
| B33 | Eastern Jin (`col-20`) / Northern and Southern dynasties (`col-21`) | `cnh-321`–`cnh-330` | 10 | 105 | to do |
| B34 | Northern and Southern dynasties (`col-21`) | `cnh-331`–`cnh-340` | 10 | 104 | to do |
| B35 | Northern and Southern dynasties (`col-21`) / Sui (`col-22`) | `cnh-341`–`cnh-350` | 10 | 104 | to do |
| B36 | Sui (`col-22`) / Tang (`col-23`) | `cnh-351`–`cnh-360` | 10 | 113 | to do |
| B37 | Tang (`col-23`) | `cnh-361`–`cnh-370` | 10 | 102 | to do |
| B38 | Tang (`col-23`) | `cnh-371`–`cnh-380` | 10 | 104 | to do |
| B39 | Tang (`col-23`) | `cnh-381`–`cnh-390` | 10 | 112 | to do |
| B40 | Tang (`col-23`) / Five Dynasties and Ten Kingdoms (`col-24`) | `cnh-391`–`cnh-400` | 10 | 111 | to do |
| B41 | Five Dynasties and Ten Kingdoms (`col-24`) | `cnh-401`–`cnh-410` | 10 | 102 | to do |
| B42 | Liao (`col-25`) | `cnh-411`–`cnh-420` | 10 | 100 | to do |
| B43 | Northern Song (`col-27`) | `cnh-421`–`cnh-430` | 10 | 102 | to do |
| B44 | Northern Song (`col-27`) | `cnh-431`–`cnh-440` | 10 | 104 | to do |
| B45 | Northern Song (`col-27`) / Southern Song (`col-28`) | `cnh-441`–`cnh-450` | 10 | 100 | to do |
| B46 | Southern Song (`col-28`) | `cnh-451`–`cnh-460` | 10 | 101 | to do |
| B47 | Southern Song (`col-28`) / Western Xia (`col-29`) | `cnh-461`–`cnh-470` | 10 | 94 | to do |
| B48 | Western Xia (`col-29`) / Jurchen Jin (`col-30`) | `cnh-471`–`cnh-480` | 10 | 97 | to do |
| B49 | Jurchen Jin (`col-30`) / Yuan (`col-31`) | `cnh-481`–`cnh-490` | 10 | 110 | to do |
| B50 | Yuan (`col-31`) | `cnh-491`–`cnh-500` | 10 | 100 | to do |
| B51 | Yuan (`col-31`) / Ming (`col-32`) | `cnh-501`–`cnh-510` | 10 | 107 | to do |
| B52 | Ming (`col-32`) | `cnh-511`–`cnh-520` | 10 | 108 | to do |
| B53 | Ming (`col-32`) | `cnh-521`–`cnh-530` | 10 | 105 | to do |
| B54 | Ming (`col-32`) / Qing (`col-33`) | `cnh-531`–`cnh-540` | 10 | 108 | to do |
| B55 | Qing (`col-33`) | `cnh-541`–`cnh-550` | 10 | 109 | to do |
| B56 | Qing (`col-33`) | `cnh-551`–`cnh-560` | 10 | 108 | to do |
| B57 | Qing (`col-33`) | `cnh-561`–`cnh-570` | 10 | 119 | to do |
| B58 | Qing (`col-33`) / Early Republic (`col-35`) | `cnh-571`–`cnh-580` | 10 | 117 | to do |
| B59 | Early Republic (`col-35`) | `cnh-581`–`cnh-590` | 10 | 110 | to do |
| B60 | Early Republic (`col-35`) | `cnh-591`–`cnh-600` | 10 | 118 | to do |
| B61 | Early Republic (`col-35`) / Civil War (`col-36`) | `cnh-601`–`cnh-610` | 10 | 116 | to do |
| B62 | Civil War (`col-36`) | `cnh-611`–`cnh-620` | 10 | 105 | to do |
| B63 | Civil War (`col-36`) | `cnh-621`–`cnh-630` | 10 | 103 | to do |
| B64 | World War II (`col-37`) | `cnh-631`–`cnh-640` | 10 | 97 | to do |
| B65 | World War II (`col-37`) | `cnh-641`–`cnh-650` | 10 | 117 | to do |
| B66 | World War II (`col-37`) / People's Republic of China (`col-38`) | `cnh-651`–`cnh-660` | 10 | 99 | to do |
| B67 | People's Republic of China (`col-38`) | `cnh-661`–`cnh-670` | 10 | 103 | to do |
| B68 | People's Republic of China (`col-38`) | `cnh-671`–`cnh-680` | 10 | 104 | to do |
| B69 | People's Republic of China (`col-38`) | `cnh-681`–`cnh-690` | 10 | 104 | to do |
| B70 | Republic of China (Taiwan) (`col-39`) | `cnh-691`–`cnh-700` | 10 | 99 | to do |
| B71 | The imperial state (`cn-government`) | `cnh-701`–`cnh-710` | 10 | 102 | to do |
| B72 | The imperial state (`cn-government`) | `cnh-711`–`cnh-720` | 10 | 111 | to do |
| B73 | The imperial state (`cn-government`) | `cnh-721`–`cnh-730` | 10 | 105 | to do |
| B74 | The imperial state (`cn-government`) | `cnh-731`–`cnh-740` | 10 | 104 | to do |
| B75 | Society and everyday life (`cn-society`) | `cnh-741`–`cnh-750` | 10 | 101 | to do |
| B76 | Society and everyday life (`cn-society`) | `cnh-751`–`cnh-760` | 10 | 105 | to do |
| B77 | Society and everyday life (`cn-society`) | `cnh-761`–`cnh-770` | 10 | 100 | to do |
| B78 | Society and everyday life (`cn-society`) / The peoples and frontiers of China (`cn-peoples`) | `cnh-771`–`cnh-780` | 10 | 99 | to do |
| B79 | The peoples and frontiers of China (`cn-peoples`) | `cnh-781`–`cnh-790` | 10 | 106 | to do |
| B80 | The peoples and frontiers of China (`cn-peoples`) | `cnh-791`–`cnh-800` | 10 | 111 | to do |
| B81 | Land, trade and money (`cn-economy`) | `cnh-801`–`cnh-810` | 10 | 104 | to do |
| B82 | Land, trade and money (`cn-economy`) | `cnh-811`–`cnh-820` | 10 | 101 | to do |
| B83 | Land, trade and money (`cn-economy`) / Chinese philosophy (`cn-thought`) | `cnh-821`–`cnh-830` | 10 | 100 | to do |
| B84 | Chinese philosophy (`cn-thought`) | `cnh-831`–`cnh-840` | 10 | 98 | to do |
| B85 | Chinese philosophy (`cn-thought`) | `cnh-841`–`cnh-850` | 10 | 98 | to do |
| B86 | Chinese philosophy (`cn-thought`) | `cnh-851`–`cnh-860` | 10 | 88 | to do |
| B87 | Chinese philosophy (`cn-thought`) / Religion and ritual (`cn-religion`) | `cnh-861`–`cnh-870` | 10 | 93 | to do |
| B88 | Religion and ritual (`cn-religion`) | `cnh-871`–`cnh-880` | 10 | 108 | to do |
| B89 | Religion and ritual (`cn-religion`) | `cnh-881`–`cnh-890` | 10 | 105 | to do |
| B90 | Religion and ritual (`cn-religion`) | `cnh-891`–`cnh-900` | 10 | 108 | to do |
| B91 | Religion and ritual (`cn-religion`) / Language and literature (`cn-language`) | `cnh-901`–`cnh-910` | 10 | 104 | to do |
| B92 | Language and literature (`cn-language`) | `cnh-911`–`cnh-920` | 10 | 97 | to do |
| B93 | Language and literature (`cn-language`) | `cnh-921`–`cnh-930` | 10 | 101 | to do |
| B94 | Language and literature (`cn-language`) | `cnh-931`–`cnh-940` | 10 | 91 | to do |
| B95 | Language and literature (`cn-language`) / Art, architecture and music (`cn-arts`) | `cnh-941`–`cnh-950` | 10 | 109 | to do |
| B96 | Art, architecture and music (`cn-arts`) | `cnh-951`–`cnh-960` | 10 | 90 | to do |
| B97 | Art, architecture and music (`cn-arts`) | `cnh-961`–`cnh-970` | 10 | 104 | to do |
| B98 | Art, architecture and music (`cn-arts`) / Science, technology and medicine (`cn-science`) | `cnh-971`–`cnh-980` | 10 | 94 | to do |
| B99 | Science, technology and medicine (`cn-science`) | `cnh-981`–`cnh-990` | 10 | 109 | to do |
| B100 | Science, technology and medicine (`cn-science`) | `cnh-991`–`cnh-1000` | 10 | 99 | to do |
## Running a batch (the harness, `.claude/wh-refine/`)

The World History harness, run with `REFINE_PREFIX=cnh-`. It keeps its working files in a scratch directory
**outside the repo** (`WH_S`).

1. `REFINE_PREFIX=cnh- WH_S=/path/to/scratch node .claude/wh-refine/prep.js 1 100` writes `cur/<id>.json` (the
   card and its glossary entry as they stand), `index.tsv` (every `cnh-` card's answer and question, for
   sibling checks) and empty `out/` and `pages/`. Snapshot the protected cards' `answerDate`, `undatable` and
   `timeline` to `$WH_S/protected.json` from main before any draft.
2. Copy `.claude/wh-refine/ADDENDUM-cnh.md` to `$WH_S/ADDENDUM.md` and add to it as lessons arrive; write one
   `$WH_S/AGENT.md` (paths, reading order, the protected list, the Chinese-name rule, the spellings and the
   myth register, the hard rules, the hunt list, the hosts, and a running USED CLUES list) and one notes file,
   one line per pair.
3. One general-purpose agent per **two** cards, never more than ten at once (count the running ones before
   every launch, and launch exactly as many as just finished). An agent saves every cited page to
   `pages/<id>-s<N>.txt`, writes `out/<id>.json` and runs `REFINE_PREFIX=cnh- WH_S=… node
   .claude/wh-refine/precheck.js <id>` until it says OK.
4. **Read every draft yourself before applying** (`node .claude/wh-refine/show.js $WH_S/out/<id>.json`):
   questions, date line (none on a protected card), the Chinese name, the house spellings, the myth told as the
   register tells it, and the glossary draft's markers and slug.
5. `REFINE_PREFIX=cnh- WH_S=… .claude/wh-refine/batch.sh 1 10` (the urlcheck line commented out for the run,
   the URLs curled beforehand) applies the ten drafts and runs the audit, `check-questions`, `check-cards` and
   `check-citations`. Then the protected diff, the spellings checker, the ledger, chronology rows and pins,
   pictures to redo, changelog, `check-docs`, `split-cards --check`, `test-card-plans`, `check-style`; commit and
   push.

**Hosts on 2026-11-08** (`node .claude/check-reach.js` and one curl each): ctext.org, icm.gov.mo, archive.org,
Persée article pages (not the PDFs), OpenEdition, journal.oraltradition.org, Project MUSE, Cambridge Core
landing pages, brill.com landing pages, J-STAGE, Sino-Platonic Papers, the Palace Museum, the National Museum of
China, the Harvard Art Museums, the Cleveland Museum, the Art Institute of Chicago, nature.com, PLOS, Europe
PMC, DOAJ, Crossref, BMCR and the Stanford Encyclopedia answer. Wikimedia Commons answered 429 (pictures
skipped); Britannica, UNESCO, the British Museum, the Freer|Sackler (asia.si.edu), Princeton, academia.edu,
ScienceDirect, PNAS, MDPI and Oxford Research Encyclopedias answered 403; the Met's essays 429; chinaknowledge.de,
kaogu.cn and ihp.sinica.edu.tw did not answer; the Wayback Machine is down.

## Pictures to redo

Wikimedia answered 429 to the session's one test call, so no picture was re-checked; each card's line says
whether its current picture looks wrong from its title, description and credit.

| card | current | verdict |
|---|---|---|
| `cnh-001` | Fuxi and Nüwa painting | not re-checked (Commons 429): ok, but the description calls Fuxi her brother, a pairing the register dates to much later texts — rewrite the description |
| `cnh-002` | Wu Family Shrine rubbing of the Yellow Emperor | not re-checked (Commons 429): shows one of the eight, not the group; the description's "Five Sovereigns" and its date are wrong — replace or rewrite |
| `cnh-003` | Sancai tuhui woodblock portrait | not re-checked (Commons 429): ok, but his name is printed into the picture |
| `cnh-004` | Xiao Yuncong's woodblock Nüwa | not re-checked (Commons 429): ok |
| `cnh-005` | 1736 woodblock of Fuxi drawing the trigrams | not re-checked (Commons 429): ok; the glossary copy's description names the licence — trim |
| `cnh-006` | ink painting of Shennong chewing herbs | not re-checked (Commons 429): ok; the glossary copy's description names the licence — trim |
| `cnh-007` | portrait of the Yellow Emperor | not re-checked (Commons 429): ok, but the description names the holding museum and the glossary copy's the licence — trim |
| `cnh-008` | Han pictorial-stone rubbing of Chiyou with the five weapons | not re-checked (Commons 429): ok; the glossary copy's description names the licence — trim |
| `cnh-009` | the plain at Zhuolu | not re-checked (Commons 429): ok: the place, since the battle cannot be pictured |
| `cnh-010` | Ma Lin's portrait of Yao | not re-checked (Commons 429): ok |
| `cnh-011` | album-leaf portrait of Shun | not re-checked (Commons 429): ok |
| `cnh-012` | Ma Lin's standing portrait of Yu | not re-checked (Commons 429): ok |
| `cnh-013` | Ming woodblock of Yu ordering the water works | not re-checked (Commons 429): ok as an illustration, but an audience scene, not the flood |
| `cnh-014` | album leaf of an archer in the hunt | not re-checked (Commons 429): doubtful: the leaf is Taikang's cautionary hunting episode, so the rider may be Taikang, not Houyi — replace |
| `cnh-015` | Wu Youru's drawing of Chang'e in the moon | not re-checked (Commons 429): ok; its inscription credits the story to the *Lunheng* |
| `cnh-016` | woodcut of Kuafu striding after the sun | not re-checked (Commons 429): ok; the glossary copy's credit lacks author and licence — fix |
| `cnh-017` | woodcut of the Jingwei bird | not re-checked (Commons 429): ok |
| `cnh-018` | Ming woodblock of Gonggong butting the mountain | not re-checked (Commons 429): right subject, but its title is printed down both side panels — replace |
| `cnh-019` | photograph of the modern Kunlun range | not re-checked (Commons 429): wrong: the modern range is a later identification, not the mythic mountain — replace with a Han or later depiction |
| `cnh-020` | Peach Festival handscroll | not re-checked (Commons 429): ok, though late; a Han relief or mirror would show the early goddess |
| `cnh-021` | Kuniyoshi's triptych of Xu Fu's fleet | not re-checked (Commons 429): wrong-ish: Xu Fu's fleet is `cnh-210`'s subject, not the isle — replace with a painting of the isle |
| `cnh-022` | the Eight on a Yuan celadon vase | not re-checked (Commons 429): ok; the glossary copy's description names photographer and licence — trim |
| `cnh-023` | two of Chen Rong's Nine Dragons | not re-checked (Commons 429): ok; the description names a source book — trim |
| `cnh-024` | the fenghuang in the Imperial Encyclopaedia | not re-checked (Commons 429): ok |
| `cnh-025` | the qilin in a Ming painting manual | not re-checked (Commons 429): ok |
| `cnh-026` | the Suzhou planisphere | not re-checked (Commons 429): ok, but shows the sky, not the four creatures; a four-spirits mirror would show the term |
| `cnh-027` | a taotie face laid in turquoise | not re-checked (Commons 429): ok |
| `cnh-028` | a page of an illustrated edition | not re-checked (Commons 429): ok, but the description names Commons (`I.caption-source`) — rewrite |
| `cnh-029` | Xiao Yuncong's plate of the Mountain Spirit | not re-checked (Commons 429): ok: one poem, not the whole anthology |
| `cnh-030` | the Jade Emperor enthroned | not re-checked (Commons 429): ok |
| `cnh-031` | a king of hell holds court (the Ten Kings scroll) | not re-checked (Commons 429): ok |
| `cnh-032` | a king of hell in his hall (Southern Song album leaf) | not re-checked (Commons 429): ok |
| `cnh-033` | woodblock of the stove god and his clerk | not re-checked (Commons 429): ok; the description names the source compendium — trim |
| `cnh-034` | the door gods on a pair of doors | not re-checked (Commons 429): ok |
| `cnh-035` | Tang pottery figures of the zodiac animals | not re-checked (Commons 429): ok, though four of the twelve |
| `cnh-036` | the meeting on the bridge of magpies | not re-checked (Commons 429): ok |
| `cnh-037` | the tale on the Peking opera stage | not re-checked (Commons 429): ok, but the description ends on the photographer's name — trim; the glossary copy carries its credit in the description |
| `cnh-038` | a Qing figure of the goddess | not re-checked (Commons 429): ok; the glossary copy's credit is a bare address — fix |
| `cnh-039` | the god on a Qing scroll | not re-checked (Commons 429): ok |
| `cnh-040` | Chavannes's plate of a Wu Liang shrine stone | not re-checked (Commons 429): ok |
| `cnh-041` | a painted Yangshao basin from Dahecun | not re-checked (Commons 429): wrong: one culture's basin for the whole Neolithic, and the description stops at "Photograph by" (`I.caption-source`) — replace |
| `cnh-042` | a Peiligang grinding slab with its roller | not re-checked (Commons 429): ok; the credit is not in the house form — fix |
| `cnh-043` | a panicle of broomcorn millet | not re-checked (Commons 429): ok |
| `cnh-044` | a bone flute from Jiahu | not re-checked (Commons 429): ok, but the description stops at "Photograph by" (`I.caption-source`) — rewrite |
| `cnh-045` | model of the Yangshao village at Jiangzhai | not re-checked (Commons 429): ok |
| `cnh-046` | the excavated village under the Banpo hall | not re-checked (Commons 429): ok |
| `cnh-047` | a Hongshan jade pig-dragon | not re-checked (Commons 429): ok |
| `cnh-048` | a section through the Liangzhu city wall | not re-checked (Commons 429): ok |
| `cnh-049` | the Fanshan M12 cong | not re-checked (Commons 429): ok, but the description makes an unsourced superlative and names the museum — trim |
| `cnh-050` | a labelled plan of Taosi | not re-checked (Commons 429): wrong: a line plan of one site, not the culture — replace (the glossary's eggshell cup would do) |
| `cnh-051` | the restored Yuchanyan pot | not re-checked (Commons 429): ok: one early vessel |
| `cnh-052` | a map of late Neolithic cultures | not re-checked (Commons 429): wrong: a drawn map with burned-in numbers on a German base map — replace |
| `cnh-053` | a Sanxingdui bronze mask | not re-checked (Commons 429): ok |
| `cnh-054` | a jade yue axe a museum labels Xia | not re-checked (Commons 429): doubtful: a museum's "Xia" label on an Erlitou-period object — the label itself is the debate |
| `cnh-055` | Shaokang in a Qing woodblock | not re-checked (Commons 429): ok: an imagined portrait, as its description says |
| `cnh-056` | the Map of the Tracks of Yu (1136) | not re-checked (Commons 429): ok |
| `cnh-057` | Qi of Xia, painted under the Qing | not re-checked (Commons 429): ok |
| `cnh-058` | the banishment of Jie (1905 plate) | not re-checked (Commons 429): ok |
| `cnh-059` | Zhongkang's accession (1905 plate) | not re-checked (Commons 429): the next chapter's scene, labelled as such — acceptable |
| `cnh-060` | Eastern Zhou bamboo slips | not re-checked (Commons 429): ok as a stand-in, captioned as not the annals |
| `cnh-061` | a 1920s portrait of Gu Jiegang | not re-checked (Commons 429): ok as a stand-in for the school; the credit gives no licence basis — check |
| `cnh-062` | a white pottery he from Erlitou | not re-checked (Commons 429): ok |
| `cnh-063` | a drain pipe from Erlitou | not re-checked (Commons 429): weak: one object; a site view or the turquoise dragon would show the term |
| `cnh-064` | a bronze jue from Erlitou | not re-checked (Commons 429): ok |
| `cnh-065` | a rubbing of the Li gui inscription | not re-checked (Commons 429): ok in kind; the credit names an uploader, not the maker — fix |
| `cnh-066` | a Shang ceremonial axe | not re-checked (Commons 429): ok |
| `cnh-067` | none | not re-checked (Commons 429): the card has no picture (the old one showed chapter 29, not chapter 3) — a page of chapter 3 wanted |
| `cnh-068` | Tang of Shang imagined (album leaf) | not re-checked (Commons 429): ok, captioned as late |
| `cnh-069` | pit YH127 at Yinxu | not re-checked (Commons 429): ok: one find-spot of the site |
| `cnh-070` | none | not re-checked (Commons 429): the card has no picture — an inscribed vessel's interior or rubbing wanted |

## Glossary candidates

Terms the batches meet that have no entry, ranked by how many cards use them. Grep the keys AND the aliases
before adding one — `add-glossary.js` overwrites in silence.

| term | cards that use it | found in |
|---|---|---|

## Ledger

Newest last. Each entry says what changed, what was refused and why, and which of the rules no checker can see
were read by eye: confusability with siblings, legend told as legend, the Chinese name, the spellings, the myth
register, and the protected lines.

### Batch 0 — tooling (2026-11-08)

Shipped `cnh-audit.js`, `check-cnh-spellings.js`, the `filter` hook in `greece-audit.js`, the protected-card
rule in `precheck.js`, `ADDENDUM-cnh.md`, this file and `docs/china-chronology.md`. `greece-audit.js`,
`wh-audit.js` and `rm-audit.js` give byte-identical `--summary` output before and after. The harness runs with
`REFINE_PREFIX=cnh-` unchanged (`prep.js 1 100` wrote 100 card files and an index of all 1000 cards, `cnh-1000` included). `cnh-070` (retired in Sep 2026, rewritten in Oct 2026 as *Shang bronze inscriptions*) is an
ordinary card to every tool. Nothing on any card changed.

**The spellings baseline** (`check-cnh-spellings.js`, 2026-11-08): 176 variants of the house forms; 1000 card(s) read, 21 with a variant; 42 hit(s) in all; over `cnh-001`–`cnh-100` and the `china` glossary entries, 5 cards and 13 hits — Legge's "Shû King" in `cnh-012`'s background and date line (protected: the line is left; the background is the draft's), "Shao Kang" and "Tai Kang" in `cnh-014`'s background and line (protected line) and in the `Houyi` glossary date, "Lüshi chunqiu" in `cnh-001` and four glossary entries, "Zuozhuan" in `cnh-076` and the `Liu_Xin_(scholar)` entry, and a "Hwang-ti" outside a title in `cnh-024`'s second source.

### B1 — `cnh-001`–`cnh-010`, Mythology: Chinese mythology to Yao (2026-11-08)

All ten re-researched from scratch by five agents, two cards each, under `.claude/wh-refine/BRIEF.md`, the China
addendum and the run's `AGENT.md`; every quoted passage was matched against its saved page by `precheck.js`,
every draft went through `add-card.js --dry-run`, the audit and the spellings checker, and every draft was read by
eye before `batch.sh` applied it. All 72 cited URLs answered 200. **Pictures were not touched**: Wikimedia
answered 429 to the session's one test call. **ctext.org, which answered at the session's start, began answering
403 to every agent mid-run**, so the classical texts were read in Chinese from Project Gutenberg's editions and in
translation from Legge and Chavannes on archive.org; two claims went unsourced for want of it (below). Four drafts
cited Bodde's 1961 chapter through a user upload of the in-copyright book; each now cites the archive.org lending
copy instead (`[Paywalled]`). **The old cards told the sage kings and the gods as history in the card's own voice,
dated myths by other men's reigns (Yao's 2357 BCE on the Three Sovereigns, Huangdi's 2697 BCE on Zhuolu, Ku's on
Chang'e), put counts and places on the date lines ("Chaos endured 18,000 years", "at Luoyang", "in Shandong"), and
broke the one-source-per-language cap on four cards — `cnh-001` cited five French articles, `cnh-002` five.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-001` Chinese mythology | 9 | 7 → 9 | **One French source (Kalinowski) where there were five; the euhemerist reading credited to modern scholars; the date line emptied (a body of myth has no one attestation; `undatable` kept)**; Nüwa told as the *Huainanzi* tells it, Pangu as first in the 3rd century CE; unsourced claims dropped (the Chu silk manuscript, six flood versions, a southern flood myth). |
| `cnh-002` Three Sovereigns and Five Emperors | 7 | 5 → 7 | **The lists shown to differ by text (the *Shiji*'s five; Fuxi, Shennong and the Yellow Emperor; Fuxi, Nüwa and Shennong; Suiren or Zhurong; the Qin court's Heavenly, Earthly and Grand); the old claim that three sovereigns stood "before Huangdi" corrected (in the eight-reign scheme he is the third sovereign)**; the line `Attested 221 BCE` (the Qin court's memorial, Mayers's year) for Yao's accession and a century. |
| `cnh-003` Pangu | 8 | 5 → 8 | **`Attested c. 200 – 300 CE` for a count ("18,000 years") and rows naming men; the earliest witness is Wei Zhao's *Dongji* fragment, then Xu Zheng (Lü Zongli [in Chinese])**; the body-into-world telling given to later texts of disputed date; three French sources cut to one. |
| `cnh-004` Nüwa | 7 | 5 → 7 | **The mending of the sky told as the *Huainanzi*'s (presented 139 BCE); an unsourced "86 – 49 BCE" and places dropped from the line; the glossary's unsourced date and Turfan claim replaced**; she first appears apart from Fuxi. |
| `cnh-005` Fuxi | 7 | 5 → 7 | **`Traditional 3322 BCE` / `Also dated 2852 BCE` (Legge's and Mayers's reckonings) / `Attested c. 500 – 100 BCE` (the *Yijing*'s commentaries) for a "from" value and places; King Wen given only the words of the hexagrams, not the hexagrams**; Chavannes's page reference corrected and chipped. |
| `cnh-006` Shennong | 6 | 5 → 8 | **"Reigned 120 years, then buried at Changsha" off the line; the Yandi identification made later readers' (the *Guoyu* clashes with it); the herbal dated 25 – 220 CE as a book named after him**; the hundred plants from the *Huainanzi*. |
| `cnh-007` Yellow Emperor | 7 | 5 → 7 | **Legend in the card's own voice; the legend traced before the *Shiji* (the *Zuo Zhuan*'s Banquan, Han Fei) and after it (Huang-Lao, the *Huangdi neijing*); the post-1902 "ancestor of the Han" claim and Gu Jiegang's attack**; a Pangu article that never names him dropped. Protected: the line stays empty. |
| `cnh-008` Chiyou | 6 | 5 → 6 | **The 81 brothers attributed to the *Longyu hetu* as Zhang Shoujie quotes it; his absence from the oracle bones; the late Qing Miao-chief reading and today's Miao/Hmong festivals**. Protected: the background carries 2700 and 2600 as the chronologers' 27th century BCE. |
| `cnh-009` Battle of Zhuolu | 6 | 5 → 6 | **The reign of the Yellow Emperor and a count off the line, `Attested c. 100 BCE` (the *Shiji*); three versions told as their texts' — the *Shiji*'s, the *Shanhaijing*'s weather battle (set in the wilds of Jizhou, not at Zhuolu) and the *Yi Zhoushu*'s Red Emperor version**; Banquan left to `cnh-007`. |
| `cnh-010` Yao | 6 | 5 → 7 | **The Canon of Yao read as a later compilation, not a record; 2357 BCE carried as the later traditional chronology's, 70 years and 366 days as the Canon's**; Legge's astronomical dating of the Canon dropped; the Guodian-era abdication manuscripts added. Protected: the line stays. |

Read by eye. **Confusability**: Banquan stayed `cnh-007`'s (out of `cnh-009`); the twined tails and the pairing
stayed `cnh-005`'s (out of `cnh-004`); the egg, the clay and the trigrams stayed out of `cnh-001`; the Qin title
angle was left to `cnh-194` (huangdi). **Legend**: every story is now told in its text's voice, and each card says
when that text was written. **Chinese names corrected**: none — all ten checked against an open page (the Shiji and
Huainanzi texts, the SEP, Lü, Ou Li-chuan, Hanmo Zhang); `中国神话` could not be matched on an open page and stays as
the standard term. **Spellings fixed**: "Lüshi chunqiu" on `cnh-001` (now Lüshi Chunqiu);
`check-cnh-spellings.js --range=cnh-001:cnh-010` now reads 0 card hits
(the five glossary hits left are entries outside the batch: `Houyi`, `Liezi`, `Liu_Xin_(scholar)`, `Lü_Buwei`,
`Wuxing_(Chinese_philosophy)`). **Myth register: rows changed** — Pangu (Wei Zhao's fragment before Xu Zheng, both
3rd century CE), Nüwa mending the sky (the *Huainanzi*, 139 BCE, confirmed), Nüwa and Fuxi as a pair (the Warring
States texts keep them apart; the *Huainanzi* first names them together; the Luoyang murals of 86–49 BCE a disputed
identification), Zhuolu (the *Shiji* confirmed; the *Shanhaijing* sets it in Jizhou; the *Yi Zhoushu* version
added), the Three Sovereigns (two more triads), Yao and Shun (the Tang Yu zhi dao a middle Warring States
manuscript; "c. 300 BCE" on no page read). **Not confirmed**: the *Fengsu tongyi* as the source of Nüwa moulding
people (ctext shut; `cnh-004` says "a separate legend" and names no text). **Protected lines: unchanged** (diffed
after the apply). For the owner: `cnh-008`'s "In Sima Qian 4 lines" and "81 brothers" rows agree with the sources
read; `cnh-010`'s three rows agree with the Canon and the traditional chronology. **Sources**: several cards still
lean on 19th-century reference works (Mayers, Giles, Werner) counted as modern under the half-modern rule, for
want of open post-1950 work on these figures; the later batches were told to prefer post-1950 scholarship. Overlap:
no `wh-` card read disagrees.

### B2 — `cnh-011`–`cnh-020`, Mythology: Shun to the Queen Mother of the West (2026-11-08)

Run as B1: five agents, two cards each; every draft prechecked, read by eye and spell-checked before `batch.sh`
applied it; all 66 cited URLs answered 200. ctext.org stayed shut (403). Owner's fixes before applying: the Bin Gong
xu went to one card only (`cnh-013`; `cnh-012`'s phrasing now asks about Yu's burial at Kuaiji), `cnh-013`'s second
phrasing no longer repeats "flood", and `cnh-018`'s date (the *Huainanzi* dated by Liu An's death, 122 BCE) became
139 BCE, its presentation, with Zürn's review added. Bodde's chapter is cited through the archive.org lending copy,
not a user upload. **The old cards dated myths by other men's reigns ("Placed under Ku from 2436 BCE" on Chang'e,
Yandi's 2737 BCE on Jingwei, Fuxi's 2852 BCE and an "Or" row on Gonggong, King Mu's 1001 and 985 BCE on Kunlun and
the Queen Mother), called Zhang Heng's *Lingxian* the oldest telling of Chang'e, told one Yi where the sources have
two, and drew on Legge alone — four of `cnh-013`'s five sources.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-011` Shun | 6 | 5 → 6 | **Shun known only from much later texts, said in the card's voice; the granary and well told as the *Mencius*'s, Sima Qian's additions marked as his; 2255 BCE one traditional reckoning beside the *Bamboo Annals*' 2042 BCE**; the Warring States abdication manuscripts added. Protected: the line stays. |
| `cnh-012` Yu the Great | 7 | 5 → 7 | **The Bin Gong xu (9th century BCE) as the oldest mention of Yu; Gu Jiegang's view that Yu began as a spirit; the flood and Erlitou links stated as disputed**; "Shû King" in prose is the *Book of Documents*; the nine cauldrons left to `cnh-083`. Protected: the background carries 2205 and 1989. |
| `cnh-013` Chinese flood myth | 8 | 5 → 8 | **`Attested c. 900 – 800 BCE` (the Bin Gong xu, after Cook) for "Set in the reigns of Yao and Shun, from 2357 BCE" and counts; the swelling soil told as known only from Han works (Bodde); the "1920 BCE flood" claim and its critics**; the flood as the raw state of the world, not a punishment. |
| `cnh-014` Houyi | 7 | 5 → 7 | **Two Yis in the sources — the archer who shot the suns (the *Chuci* asks of it; the *Huainanzi* tells it) and the usurper of Youqiong (the *Zuo Zhuan*) — and a tradition that merged them**; the Songs of the Five Sons, an eclipse claim and Feng Meng dropped; pinyin Hòu Yì → Hòuyì. Protected: the background carries 2436 and 2188. |
| `cnh-015` Chang'e | 7 | 6 → 8 | **The Qin-era Wangjiatai *Guicang* slips and then the *Huainanzi* as the oldest tellings, not Zhang Heng; `Attested 139 BCE` for Ku's reign, Zhang Heng's life and a festival**; the name taboo given both views (Han Wendi in modern study; a Tang and a Song emperor in the older handbooks). |
| `cnh-016` Kuafu | 6 | 5 → 6 | **The two *Shanhaijing* tellings (thirst; Yinglong) and the *Liezi* told as their texts'; the second Chinese source replaced by Granet [in French]**. Protected: the background carries 2697 as Mayers's reckoning. |
| `cnh-017` Jingwei | 6 | 5 → 6 | **`Attested c. 100 BCE` (the *Shanhaijing* existed by then) for Yandi's 2737 BCE and counts; the girl's name, spelt like the goddess Nüwa's in pinyin, said to be different characters**. |
| `cnh-018` Gonggong | 6 | 6 → 7 | **Fuxi's 2852 BCE and an "Or" row off the line; in Sima Zhen's version the turtle's legs prop up the earth, not the sky; joining the sky-mending to the fight credited to Sima Zhen (8th century CE); the *Liezi* tells the mending first**. |
| `cnh-019` Kunlun | 7 | 6 → 7 | **`Attested c. 400 – 300 BCE` and `Han accounts` for King Mu's 1001 BCE and "1 of the Shu King's documents"; unsourced heights, the *Erya*'s Sumeru and jade towers dropped; the Han belief that the dead climbed it**. `L.missing` is deliberate: a mythic mountain has no point. |
| `cnh-020` Queen Mother of the West | 6 | 6 → 6 | **The Jade Pool given to the *Mu tianzi zhuan* (found with the *Bamboo Annals*), not the *Annals*; the peaches of immortality as Eastern Han; the *Zhuangzi* as her oldest record; the mass cult of 3 BCE from the *Hanshu***. |

Read by eye. **Confusability**: the Bin Gong xu on `cnh-013` only; the ten suns `cnh-014`'s and the elixir
`cnh-015`'s; Yinglong killing Kuafu `cnh-016`'s (kept out of `cnh-009`); the five-coloured stones `cnh-004`'s
(kept out of `cnh-018`); Kunlun's tiers and river `cnh-019`'s, the Queen Mother's tail and cult `cnh-020`'s.
**Legend**: every story told in its text's voice. **Chinese names corrected**: `cnh-014` pinyin Hòu Yì → Hòuyì (the
house form); the other nine checked and unchanged. **Spellings fixed**: "Shao Kang" and "Tai Kang" in `cnh-014`'s
background and the `Houyi` glossary date; "Shû King" in `cnh-012`'s background. The two hits left are on protected
lines (`cnh-012` "In the Shû King", `cnh-014` "Tai Kang"), which stay. **Myth register: rows changed** — the flood
(the swelling-soil theft known only from Han works; the Bin Gong xu confirmed as the earliest mention of Yu), Houyi
(the *Chuci* line at least 4th century BCE; one reading takes it as a single sun), Chang'e (the Wangjiatai *Guicang*,
then the *Huainanzi*, confirmed), Kuafu (confirmed), Jingwei (confirmed), Gonggong (against Zhuanxu in the *Liezi*
and the *Huainanzi*), the Queen Mother (the *Zhuangzi* her oldest record). **The *Shanhaijing* is dated three ways
across the batch** (existing by c. 100 BCE on `cnh-017`; its oldest parts c. 400 – 300 BCE in one account on
`cnh-019`/`cnh-020`); each card attributes its date, and `docs/china-chronology.md` now says the book has no single
date. **Protected lines: unchanged** (diffed after the apply). **For the owner**: `cnh-014`'s row "Confucius names 2
men who did not die naturally" looks wrong — in the *Analects* (14.5) it is Nangong Kuo who names Yi and Ao, and
Confucius does not reply; the row is left. `cnh-011`'s and `cnh-012`'s rows agree with the sources read. A citation
mismatch on `cnh-012` (Chen Minzhen, Crossref "Minzhen Chen") is a Chinese name in its own order, kept. `cnh-012`'s
point is the Xia dynasty's region on a mythic founder (locator note at the end of the hundred).

### B3 — `cnh-021`–`cnh-030`, Mythology: Penglai to the Jade Emperor (2026-11-08)

Run as B1 and B2; all 72 cited URLs answered (one Czech PDF on a second try); `cnh-030`'s Europe PMC full-text
address, which returned 500, was replaced by the article's DOI. ctext.org stayed shut. Owner's fix before applying:
`cnh-030`'s line labels "Dated / Also dated" became "Cult founded / Also dated". **The old cards dated creatures and
places by legendary kings (Fuxi's 2852 BCE on the dragon, Huangdi's 2697 BCE on the fenghuang and the qilin, Yao's
7th year on the qilin), dated the *Shanhaijing* "Zhou at latest 1122 – 250 BCE", gave Qu Yuan dates no source
prints, told the qilin's capture and the taotie's name as if the Shang had them, and leaned wholly on 1874–1922
handbooks — the dragon's six sources all dated from those years.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-021` Penglai | 6 | 5 → 6 | **The myth dated by the *Shiji* (`Attested c. 91 BCE`), not the First Emperor's voyage (219 BCE, kept in prose); the *Liezi* no longer the 5th-century-BCE first mention (parts of it are 2nd century CE or later)**. `L.missing` is deliberate: a mythic isle. |
| `cnh-022` Eight Immortals | 7 | 6 → 8 | **The "Or" row and counts replaced by `Dated 1271 – 1368` / `Also dated c. 1250 – 1279`; the Yuan dating credited to the late Ming critic Hu Yinglin, not Zhao Yi**; the Ming novel left off for want of a source. |
| `cnh-023` Chinese dragon | 9 | 6 → 9 | **"The Chinese dragon as one creature" undone: the *long*, the *jiao* and others named apart, with Bagley's warning on the one English word; the line dates the Xishuipo shell figure (c. 6,400 years ago), not Fuxi; "only imperial robes had five claws" corrected (the Qing gave five to the three highest grades too)**; the "360 scaly creatures" dropped (the *Shuowen* unread). |
| `cnh-024` Fenghuang | 7 | 6 → 8 | **Huangdi's 2697 BCE off the line; `Official cult 84 BCE` (Huo Guang's report) and `Last reported 1368`; the omen bird told as the *Shangshu* and the *Analects* tell it**; Mayers's entry number read correctly (134, not 184). |
| `cnh-025` Qilin | 7 | 7 → 7 | **The *Bamboo Annals* legend and an unsourced 121 BCE off the line; `Annals entry 481 BCE` and `Described c. 100 CE` (the *Shuowen*); the *Zuo Zhuan*'s and the fuller commentary's versions told apart**; the 1414 giraffe left to `cnh-515`. |
| `cnh-026` Four Symbols | 7 | 7 → 7 | **An empty line filled: `Earliest image c. 433 BCE` (the Zeng Hou Yi lacquer box) and `Full set c. 200 – 100 BCE`; Doré's demon-king tale, Mayers's tiger that whitens at 500 years and a claimed military origin dropped**; Xishuipo in prose only (`cnh-023`'s clue). |
| `cnh-027` Taotie | 6 | 5 → 7 | **The name is later than the motif: the Shang left no word for the face; the *Zuo Zhuan* uses it for a man and the *Lüshi Chunqiu* puts the creature on Zhou cauldrons; `First cast c. 1500 – 1300 BCE` for a regnal year and a count**; Laufer's and Bushell's readings dropped; the split image left to `cnh-084`. |
| `cnh-028` Classic of Mountains and Seas | 6 | 6 → 6 | **"Zhou at latest 1122 – 250 BCE" replaced by `Begun c. 300 – 200 BCE` (one view, attributed), with Liu Xin and Guo Pu in prose; Yu's charts given to tradition; pinyin Shānhǎi jīng → Shānhǎijīng**; Kuafu, Jingwei, the Queen Mother and Chiyou left to their own cards. |
| `cnh-029` Chuci | 6 | 5 → 7 | **Qu Yuan's authorship and the dates 332 – 295 BCE (in no source read) made the traditional attribution, questioned, c. 300 BCE; `Compiled c. 77 – 6 BCE` (Liu Xiang's gathering, carried into Wang Yi's surviving edition)**; the Dragon Boat origin dropped. |
| `cnh-030` Jade Emperor | 7 | 5 → 7 | **The birth legend credited to a Daoist scripture modelled on the Buddha's life; "humiliating peace" credited to one historian; `Cult founded 1012` / `Also dated 1116` for a birthday and a month**; the Chaoshan rites added. |

Read by eye. **Confusability**: Xishuipo `cnh-023`'s (prose only on `cnh-026`); the split image `cnh-084`'s (out of
`cnh-027`); the Tianwen `cnh-029`'s, not `cnh-014`'s; `cnh-023` and `cnh-025` both open a phrasing on a dictionary's
description, with different creatures and clues. **Legend**: each creature and place now dated by its earliest
object or text. **Chinese names corrected**: `cnh-028` pinyin Shānhǎi jīng → Shānhǎijīng (the house form); `cnh-026`
pinyin Sìxiàng → sìxiàng (a common noun, as `lóng`); `cnh-030`'s 玉皇 confirmed on an open page, 大帝 not printed on
one — kept as the standard full title. **Spellings fixed**: none needed; 0 hits before and after. **Myth register:
rows added** — Penglai (the *Shiji* the earliest, c. 91 BCE; the *Liezi* later) and the Eight Immortals (the group
from the Yuan, at most the end of the Southern Song; Hu Yinglin's dating); the fenghuang's earliest texts (the
*Shangshu* "Yi ji", *Analects* 9.9) undated by any source read. **The *Shiji*'s date**: `cnh-009` writes c. 100 BCE,
`cnh-021` c. 91 BCE (its completion, per Mayers); both are approximations of one book and both stand. **Protected
lines: unchanged** (none in this batch). No `wh-`, `jp-` or `ko-` card read disagrees; the zodiac and the dragon on
`jp-`/`ko-` cards are untouched.

### B4 — `cnh-031`–`cnh-040`, Mythology: Diyu to the Chinese legendary period (2026-11-08)

Run as before; all 72 cited URLs answered. Owner's fix before applying: `cnh-040`'s third phrasing said "the
legendary history", a word of the answer, and now says "the account of high antiquity". **The old cards dated the
underworld and the popular gods by emperors' reigns (Huizong and Wanli on Diyu, Han Wudi on Zao Jun, Taizong on the
door gods), by men's lives (Wang Chong on the zodiac and the door gods, Feng Menglong on the White Snake, Bao Zheng on
the ten courts) and by days of the lunar year, credited the ten courts to a Taoist handbook, made Wang Chong the
zodiac's oldest witness, and rested Diyu and the zodiac wholly on 19th- and early-20th-century handbooks.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-031` Diyu | 7 | 7 → 7 | **Five modern sources where all seven were 1880–1920 handbooks; the reigns off the line, which is now empty (no source dates Diyu itself); an unsourced depth, the hell counts and term lengths dropped; the ten kings dated to the later Tang**. `L.missing` is deliberate. |
| `cnh-032` ten courts of hell | 6 | 5 → 7 | **The scheme rests on the Buddhist *Scripture on the Ten Kings* (late Tang; Dunhuang scrolls and Sichuan carvings), not a Taoist handbook; the *Jade Record* a Ming–Qing retelling, with Granny Meng; `Took shape c. 800 – 1000 CE`; Chinese name 十殿阎罗 → 十殿阎王 (Shídiàn Yánwáng)**. |
| `cnh-033` Zao Jun | 7 | 5 → 8 | **The lunar days and Han Wudi's reign off the line; `Imperial rite c. 133 BCE` (the first court sacrifice to the stove, as Chavannes places it); the claim that a magician began the cult, an "every family" figure and an unsourced honey custom dropped**; the *Analects*' stove saying and an older female stove spirit added. |
| `cnh-034` Menshen | 7 | 7 → 7 | **`Attested 76 – 84 CE` (the *Lunheng*, as its translator dates it) for Wang Chong's life, Taizong's reign and an undated row; the spirits spelt Shenshu and Yulü**; the *Fengsu tongyi* detail dropped for want of an open page. |
| `cnh-035` Chinese zodiac | 9 | 7 → 9 | **Wang Chong no longer the oldest witness: the Shuihudi daybook (`Attested c. 217 BCE`) already pairs branches with animals, a horse where the goat now stands; `Years by animal c. 100 CE`**; Fangmatan left out (no open page). |
| `cnh-036` Cowherd and Weaver Girl | 7 | 6 → 7 | **The *Huainanzi* "magpie line" the old card cited is in no text read and is dropped; `Stars attested c. 800 BCE` (the *Shijing* "Da dong") and `Lovers attested c. 100 – 200 CE` (the Nineteen Old Poems)**; the glossary's "a Han treatise the oldest notice" corrected. |
| `cnh-037` Legend of the White Snake | 7 | 5 → 7 | **`Earliest tale c. 1200 – 1400` / `Printed 1624` / `First play 1738` for Feng Menglong's life and a non-span; the rain and the borrowed umbrella already in Feng's 1624 text, not 18th-century additions; the maid a green fish, not a snake**; a Wayback-only source and two ctext sources replaced. |
| `cnh-038` Mazu | 7 | 6 → 7 | **The Song dynasty's span and a 12th-century temple replaced by `Traditional 960 – 987 CE`, `First honoured 1122`, `Named Tianfei 1281` and the UNESCO listing; the loom legend in two versions with their sources; the mast fire attributed to sailors (no source calls it St Elmo's fire); "36 times" a modern count, the Qing list counting 24**. |
| `cnh-039` Guandi | 7 | 6 → 7 | **Werner's folk tale of his youth, told as biography, dropped; Guan Yu the man (Chen Shou, 3rd century) kept apart from the god (the 14th-century novel); "about 1,600 official temples" credited to Doré**; the Macao guild hall added. Protected: the background carries 219, 1594 and 1856. |
| `cnh-040` Chinese legendary period | 6 | 6 → 6 | **`Traditional 2852 BCE` (the legendary history prefaced to Sima Guang's chronicle, as Mayers prints it) and `First sure year 841 BCE` for labels naming men; Sima Qian's own refusal of dated genealogies; the term from Xu Xusheng's book; four modern sources where there were none**. |

Read by eye. **Confusability**: the kings of hell split cleanly — the earth-prison and its entrance (`cnh-031`) against
the judges' calendar, the Ningbo scrolls and Granny Meng (`cnh-032`); the stove god's report (`cnh-033`) against the
door gods' peach tree (`cnh-034`). **Legend**: the White Snake and Mazu told by the dated texts that carry them; the
Cowherd's magpie bridge dated by its sources, not the *Huainanzi*. **Chinese names corrected**: `cnh-032` 十殿阎罗 →
十殿阎王 / 十殿閻王, Shídiàn Yánwáng (Doré's gloss); `cnh-037`'s `Z.reading?` is the polyphone 传 (zhuàn here), a false
lead; the rest checked and unchanged. **Spellings fixed**: none needed; 0 hits. **Myth register: rows confirmed or
added** — the Cowherd and the Weaver Girl confirmed (the stars in "Da dong", late Western Zhou; the lovers in the
Nineteen Old Poems by the 2nd century CE; the seventh night by the early 2nd century and the magpie bridge by its end,
after Laing); two rows added, the White Snake and Mazu. **Protected lines: unchanged**. **For the owner**: `cnh-039`'s
row "Made a god 1594, by the Wanli emperor" — Zavidovskaya (2023) dates the Wanli title to 1614; the row "Named a sage
1856" rests only on Doré (1920); both are left. `cnh-040`'s citation of Chen Minzhen keeps his name in Chinese order
(Crossref's "Minzhen Chen"). The zodiac on `jp-`/`ko-` cards is untouched; no `wh-` card read disagrees.

### B5 — `cnh-041`–`cnh-050`, Neolithic China: the period to Longshan (2026-11-09)

Run as before; all 70 cited URLs answered (the Banpo Museum's page on a second try). **Two new walls**: PMC's full
text now sits behind a reCAPTCHA and Europe PMC's full text returns 500 for many papers, and ScholarSpace (Hawaiʻi)
shows a bot check — so every claim resting only on a paper that could not be re-read was dropped (Liu et al. 2017's
Liangzhu dam figures among them). Owner's fixes before applying: two agents had converted their sources' cal BP into
BCE years (`cnh-042`, `cnh-047`); both lines now print the BP the sources print (`c. 9000 – 7000 BP`, `c. 5800 –
5300 BP`), and every later agent was told never to convert. After applying, `cnh-041`'s timeline moved with its new
line (`set-timeline.js`: `{from:-9000}` → `{from:-8000}`; the three failures of `test-card-timeline.js` are on main
before and after). **The old cards put unsourced spans on the lines ("c. 9000 – 2000 BCE", "by c. 2000 BCE", "from c.
7000 BCE"), turned "6 ka" into 4000 BCE, carried site areas, counts and another culture's dates as rows ("Erlitou
follows from c. 1900 BCE"), gave one site's dates to a whole culture, read the Zhouli's heaven-and-earth meaning back
onto Liangzhu jade, and stated figures from papers they had not read (Liangzhu's 3,000 workers, a fired floor taken
from an Amur-basin paper, a brewing sentence from northwest Sichuan).**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-041` Neolithic China | 8 | 7 → 8 | **An unsourced "c. 9000 – 2000 BCE" replaced by `Domestication c. 8000 – 6000 BCE` and `Late Neolithic c. 2500 – 2000 BCE`; the earliest pottery said to be Upper Palaeolithic, made by foragers (Xianrendong 20,000–12,000 BP)**; questions that were `cnh-043`'s, `cnh-048`'s and `cnh-051`'s replaced; the timeline's start moved to 8000 BCE. |
| `cnh-042` Peiligang culture | 6 | 5 → 6 | **The site count and Tanghu's area off the line; `Dated c. 9000 – 7000 BP` / `Also dated c. 9000 – 7500 BP` as the sources print them; Jiahu's place in or outside the culture said to be disputed**; a sickle study that would not open dropped with its question. |
| `cnh-043` millet and rice farming | 8 | 5 → 8 | **"From"/"by" values and a "6 ka" turned into 4000 BCE replaced by `Rice grown c. 9400 BP` (Shangshan), `Millet grown c. 5800 BCE`, `First fields c. 6000 BP`, each in its source's own form; the Cishan 10,300-year claim attributed and marked disputed**; "bunded paddies by c. 2000 BCE" dropped. |
| `cnh-044` Jiahu | 6 | 5 → 6 | **A converted "Silk c. 6500 BCE" and "Drink from c. 7000 BCE" off the line, now `Lived in c. 7000 – 5500 BCE`, `Excavated 1984 – 1987`, `Re-excavated 2001`; silk protein in two of three tombs, not three; "more than 30" flutes and only the best-kept one playable**; the signs kept hedged, not writing. |
| `cnh-045` Yangshao culture | 7 | 5 → 8 | **The name a modern label from the village Andersson dug in 1921 (prose, not the line); his Western-origin theory, later given up; the phases and the Majiayao offshoot; the 3,000 Henan sites attributed**; a brewing sentence that belongs to migrants in northwest Sichuan dropped. |
| `cnh-046` Banpo | 6 | 9 → 8 | **A place value and an end year resting on an image-only table off the line, now `First settled c. 4800 BCE` and `Excavated 1954 – 1957`; the museum (opened 1958) from its own page; a fired-floor claim taken from an Amur-basin paper dropped**; the fish-face basin and the urn burials left out for want of an open text. |
| `cnh-047` Hongshan culture | 6 | 5 → 6 | **The 4500 – 3000 BCE span credited to its authors; `Ritual peak c. 5800 – 5300 BP` as printed; a 200,000 km² extent, house sizes, village counts and a "ritual specialists" reading dropped (their sources unreadable)**; the end told as an elite's, not a people's. |
| `cnh-048` Liangzhu culture | 6 | 5 → 6 | **Every figure from the 2017 dam paper (300 ha, 3,000 workers, 2.88 million m³, 30 km of canals) and "China's earliest waterworks" dropped, the paper unreadable; two converted rows off the line, now `Flourished c. 3300 – 2300 BCE`; "a metre of clay" corrected to a silt layer**. |
| `cnh-049` Liangzhu jade | 6 | 5 → 7 | **The cong and bi told as the *Zhouli*'s much later heaven-and-earth reading, which the makers may not have shared; `Dated c. 3300 – 2200 BCE` / `Also dated c. 3200 – 2000 BCE` for an unsourced end; a tomb's date off the line**; Lopes's title corrected. |
| `cnh-050` Longshan culture | 7 | 5 → 7 | **Another culture's row and an unsourced split off the line, now `Dated c. 3000 – 1900 BCE` / `Also dated c. 2600 – 1900 BCE`; the name a modern label; seven regional types and the view that Longshan is a period, not one culture**; the glossary's genetic-paper dates replaced. |

Read by eye. **Confusability**: pottery `cnh-051`'s, farming `cnh-043`'s and Liangzhu's works `cnh-048`'s (all out of
`cnh-041`); Jiahu's flutes `cnh-044`'s; the Banpo museum and pens `cnh-046`'s, Andersson and the phases `cnh-045`'s;
the cong and bi `cnh-049`'s, the dams `cnh-048`'s. **Modern labels**: Yangshao, Longshan, Liangzhu and Hongshan now
each said to be named after the first site dug. **Chinese names corrected**: none; `粟作与稻作` matched no open Chinese
page (no Chinese host answered) and stays, with the note that 粟 is foxtail millet only. **Spellings fixed**: none;
0 hits. **Myth register**: no rows (no myth in the batch). **Protected lines: unchanged** (none here). **Disagreements
for the owner**: `cnh-048` (the culture, 3300 – 2300 BCE) and `cnh-049` (its jade, 3300 – 2200 / 3200 – 2000 BCE) rest
on different sources and say so; `wh-148` dates Longshan 3000 – 2000 BCE where `cnh-050` now gives 3000 – 1900. Locator
notes are for the end of the hundred: `cnh-047`'s point is Chifeng city and `cnh-048`'s lies about 40 km from the site.

### B6 — `cnh-051`–`cnh-060`, Neolithic China and the Xia: pottery to the Bamboo Annals (2026-11-09)

Run as before; all 64 cited URLs answered (a Sino-Platonic Papers PDF on a second try, after a 429). ScholarSpace and
Project MUSE showed challenge pages, so two sources were read from copies of the same page saved earlier in the run
(`cnh-055`, `cnh-057`, `cnh-058`), and claims resting only on unreadable copies were dropped (Taosi on `cnh-054`, the
899 BCE eclipse on `cnh-060`). The citation checker's six mismatches are Chinese names kept in Chinese order (Chen
Minzhen, Jia Hongbo; Crossref reverses them). **The old cards put the Xia's traditional dates on cards about a region,
a text and a forged chapter, carried counts and areas as rows, merged the *Zuo Zhuan*'s two tellings of Shaokang,
dated the *Bamboo Annals*' burial by King Xiang's death (295 BCE, Legge's), treated the Songs of the Five Sons as a Xia
document, called the *Tribute of Yu* "the oldest geographical treatise", and gave Sanxingdui an end date (1150 BCE)
no page prints.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-051` Chinese Neolithic pottery | 7 | 5 → 8 | **One scholar's definition of early southern pottery and a BP/BCE muddle off the line, now `Earliest sherds c. 20,000 – 19,000 BP` (Xianrendong), `Diverse forms c. 9000 – 7000 BP`, `Painted wares c. 5000 – 3000 BCE`; the term said to cover late Palaeolithic wares made by foragers (Yuchanyan 18,300–15,430 cal BP)**; an unsourced wheel row dropped. |
| `cnh-052` Central Plain | 7 | 5 → 7 | **The Xia's and Erlitou's dates off a region's line (now empty); rebuilt as the argument over Central Plain centrism, each side attributed (Han Jianye [in Chinese], Shelach, Lee); the Hongshan "five hundred people" corrected to Peterson's "fewer than 1,000"**; the *Shijing* ode where the name first stands. `L.missing` deliberate: a region. |
| `cnh-053` Sanxingdui | 7 | 5 → 7 | **An unsourced end (1150 BCE) replaced by `In use c. 1700 – 1000 BCE` (PNAS 2026), `Pits filled c. 1200 – 1000 BCE`, `Pits found 1986`; "capital of Shu" made the archaeologists' identification; no writing; the site's 12 km² for wall areas from unreadable sources**. |
| `cnh-054` Xia dynasty | 7 | 5 → 7 | **The count of kings and an "Or" row off the line, now `Traditional 2205 BCE` / `Also dated 1989 BCE` / `Reconstructed c. 2070 – 1600 BCE` (the Chronology Project's, said to be contested); Legge's note that the *Annals*' own years give 431, not 471**; Taosi and a "Zhou invention" claim dropped (sources unreadable). |
| `cnh-055` Shaokang | 5 | 5 → 6 | **The *Zuo Zhuan*'s two tellings told apart — in Duke Xiang 4 the minister Mi raises Shaokang and his son Zhu kills Yi; the line's 2070 and 1600, "30 to 40 years" and "10 li square and 500 men" carried and attributed**. Protected: the line stays. |
| `cnh-056` Tribute of Yu | 6 | 5 → 6 | **Another term's dates and counts off the line, now `Written c. 500 – 200 BCE` (Dorofeeva-Lichtmann); most modern scholars date the chapter to the Warring States; "the oldest geographical treatise" dropped; Yu named only in its first and last sentences (Biot, via Chavannes)**. |
| `cnh-057` Qi of Xia | 5 | 5 → 7 | **The succession told in three versions with their sources — Mencius, the *Rongchengshi* manuscript, the *Bamboo Annals*' Qi killing Yi; Gan, "spelt Kan in older translations", so the protected line still reads**; Erlitou stated apart. Protected: the line stays. |
| `cnh-058` Jie of Xia | 6 | 5 → 7 | **2070, 1600 and the seventeen kings sourced; the "bad last ruler" pattern credited to Lewis; modern doubt added; the wine pool left off (no open source tells it of Jie)**. Protected: the line stays. |
| `cnh-059` Songs of the Five Sons | 5 | 5 → 5 | **Not a Xia document, said in the card's voice: one of the extra old-script chapters, first in Mei Ze's copy presented in 317 – 322 CE, now usually labelled a forgery built around older quotations; `Attested 317 – 322 CE` for the Xia's dates and counts**. |
| `cnh-060` Bamboo Annals | 6 | 5 → 6 | **A Xia row, place and count values and a "buried 295" that was King Xiang's death year replaced by `Compiled c. 299 BCE` and `Found 279 CE`; years out of the questions; the ancient-text and current-text story**; the 899 BCE eclipse dropped (source walled). |

Read by eye. **Confusability**: Erlitou's palaces on `cnh-054` and its road grid on `cnh-063` differ by angle; the
succession `cnh-057`'s and the sun boast `cnh-058`'s; Taikang's hunt `cnh-059`'s (kept off `cnh-014`); the *Annals*'
tomb robbery `cnh-060`'s. **Legend**: the Xia's kings told as the *Shiji*, the *Shangshu*, the *Zuo Zhuan* and the
*Bamboo Annals* tell them, with archaeology stated apart. **Chinese names corrected**: none; `cnh-055`'s `Z.reading?`
is the polyphone 少 (shào in the name). **Pinyin, for the owner**: the official orthography would join 夏朝 (Xiàcháo)
and 禹贡 (Yǔgòng); the collection writes Xià cháo and Yǔ gòng, kept for consistency with the dynasty cards.
**Spellings fixed**: none; 0 hits. **Myth register: rows suggested** — the succession from Yu to Qi (Mencius, the
*Rongchengshi*, the *Bamboo Annals*) and Jie as the bad last king (Lewis); held for the hundred's summary. **Protected
lines: unchanged**. **For the owner**: `cnh-058`'s row "Defections from Kong Jia, 4 reigns earlier" looks off by one
(Kong Jia, Gao, Fa, Jie: three reigns before Jie); left. `cnh-056` counts a 2023 *Guangming Ribao* piece by Li Xiaojie
as modern scholarship.

### B7 — `cnh-061`–`cnh-070`, the Xia question and the first of the Shang: Doubting Antiquity to Shang bronze inscriptions (2026-11-09)

Run as before; all 67 cited URLs answered (the National Museum of China and nature.com on a second try). Where
ScholarSpace and Project MUSE showed challenge pages, agents read the same page from a copy saved earlier in the run or
through ScholarSpace's open REST interface, and cited the handle; claims resting only on unreadable sources were
dropped. The citation checker's three mismatches are Chen Minzhen's name in Chinese order. **The old cards said the
Doubting Antiquity School asked whether the Xia existed (Gu Jiegang wrote that its existence "cannot be doubted"),
dated the school by a decade and another event (the 1959 Erlitou find), carried hectares and counts as rows, gave the
Erlitou culture an older radiocarbon range, called the Chronology Project's "112 years" a narrowing (it was the
spread of 44 earlier guesses), and gave the Hou Mu Wu ding a weight (875 kg) the museum does not print.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-061` Doubting Antiquity School | 5 | 5 → 6 | **Gu Jiegang did not doubt the Xia existed, only most of what was told of it (Chen Minzhen 2019); `Begun 1923` (his letter to Qian Xuantong) and `First volume 1926` for a decade, the Erlitou find and a count; pinyin joined, Yígǔpài**; an "evenly split" 1990 seminar dropped (reported otherwise). |
| `cnh-062` Erlitou culture | 6 | 5 → 7 | **`Dated c. 1800 – 1530 BCE` (Xie 2020, on the Chronology Project) / `Also dated c. 1900 – 1500 BCE` (Liu 2003) for an older range; a phases count and 400 ha off the line; "Xia culture" attributed to Chinese archaeologists**; Dongxiafeng and the kaolin vessels added. |
| `cnh-063` Erlitou site | 6 | 5 → 7 | **Three rows of hectares off the line, now `Occupied c. 1750 – 1530 BCE` and `Found 1959`; "about 400 ha" made a range of estimates; the Zhenxun identification set against the advice to keep legend apart from the dig; the first author's name corrected (Liya Xie, not "Liye")**; the tomb number and "the earliest road grid" dropped (unsourced). |
| `cnh-064` Erlitou bronze | 6 | 5 → 7 | **The foundry's area and a mould size off the line; `Foundry c. 1800 – 1700 BCE` / `First vessels c. 1700 – 1600 BCE`; the first vessel forms copying white pottery, the alloy, the absence of radiogenic lead, the turquoise plaques**. |
| `cnh-065` Xia–Shang–Zhou Chronology Project | 5 | 5 → 5 | **"112 years cut to 30" corrected (112 years was the spread of earlier guesses); the radiocarbon window and the astronomical day for the conquest; the 2022 full report keeping a reign table new bronzes contradict (Shaughnessy 2023); criticism and defence both given, the card taking no side**; `Ran 1996 – 2000` / `Results 9 November 2000` / `Full report 2022`. |
| `cnh-066` Shang dynasty | 8 | 5 → 8 | **Whose dates 1600 – 1046 BCE are (the Chronology Project's, which also printed 1044 and 1027); the early, middle and late phases with Huanbei; the oracle bones the dynasty's own records "on present evidence"**; dates out of the questions; the glossary's unsourced oracle-bone count dropped. |
| `cnh-067` Basic Annals of Yin | 6 | 5 → 6 | **`Written c. 100 BCE` for counts and a "none before 841" row; the king list checked against the oracle bones (via Chen 2019), with one sourced difference (Tai Wu before Yong Ji, Nivison)**; Chavannes's 1895 introduction and an unsourced "thousand years" dropped. |
| `cnh-068` Tang of Shang | 6 | 6 → 7 | **Five of six old sources ancient; now the battle-axe and Mingtiao, the Speech of Tang, the drought of five years (not seven) and the mulberry grove from the *Lüshi Chunqiu*, Yi Yin as Tang's cook in a Warring States manuscript, the day-name Tai Yi**. Protected: the background carries 1600. |
| `cnh-069` Yinxu | 6 | 5 → 6 | **A count and a king off the line, now `Occupied c. 1250 – 1046 BCE` / `First seasons 1928 – 1937` / `World Heritage 2006`; Pan Geng's move told as tradition with the *Bamboo Annals*' 273 years attributed; Huanbei (found 1999) and Niu's view that Xiao Yi founded Yinxu**; the glossary's end year aligned to 1046. |
| `cnh-070` Shang bronze inscriptions | 6 | 6 → 8 | **`Cast c. 1300 – 1046 BCE`; the Hou Mu Wu ding's weight corrected in prose to the National Museum of China's 832.84 kg (not 875); claims resting only on Childs-Johnson dropped; the office-title reading cited to Cao Dazhi's own paper [in Chinese]**. |

Read by eye. **Confusability**: Huanbei appears in a phrasing of `cnh-066` (the three-phase division) and of `cnh-069`
(the walled city across the river) — different angles, kept; Erlitou's palaces, dragon and road grid `cnh-063`'s,
its bronzes `cnh-064`'s, its phases and kaolin `cnh-062`'s; Mingtiao `cnh-068`'s (free after `cnh-058`). **Legend**:
Tang's drought and net told as the *Lüshi Chunqiu*'s and the Han historian's. **Chinese names corrected**: `cnh-061`
pinyin Yígǔ pài → Yígǔpài (both sources write Yigupai); the three Erlitou `Z.reading?` leads are the place name's tóu,
false alarms. **Spellings fixed**: none; 0 hits. **Myth register**: Tang's self-offering for rain — the *Lüshi
Chunqiu* "Shun min": five years of drought, the mulberry grove, his hair cut (held for the summary). **Protected
lines: unchanged**. **For the owner**: `cnh-101` (outside the hundred) gives the Hou Mu Wu ding as 875 kg in a
question; the National Museum of China gives 832.84 kg. `cnh-068`'s point is the Shang dynasty's region near
Zhengzhou on a card about one man (locator note at the end).
