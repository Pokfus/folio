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
plus every card tagged `ruler` or `person` it does not catch, confirmed against main on 2026-11-08 for the first
hundred, on 2026-11-12 for the second, on 2026-11-12 for the third and on 2026-11-13 for the fourth (the snapshot of each line is the run's `protected.json`). `cnh-179` (Su Qin
and Zhang Yi) and `cnh-184` (the Four Lords) are tagged `person` but name groups: they are audited as ordinary cards. `cnh-audit.js` reads the block below: on these cards it
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
cnh-102 Di Xin                 (ruler; the person template)
cnh-113 King Wen              (ruler; the person template)
cnh-114 King Wu               (ruler; the person template)
cnh-115 Duke of Zhou          (individual; regent)
cnh-132 King Mu               (ruler; the person template)
cnh-133 King Li               (ruler; the person template)
cnh-135 King Xuan             (ruler; the person template)
cnh-136 King You              (ruler; the person template)
cnh-137 Baosi                 (legendary)
cnh-147 Duke Huan of Qi       (ruler; the person template)
cnh-148 Guan Zhong            (individual; the person template)
cnh-149 Duke Wen of Jin       (ruler; the person template)
cnh-151 King Zhuang of Chu    (ruler; the person template)
cnh-159 Goujian               (ruler)
cnh-166 Li Kui                (individual; the person template)
cnh-167 Marquis Wen of Wei    (ruler)
cnh-168 Shang Yang            (individual; the person template)
cnh-174 King Wuling of Zhao   (ruler; the person template)
cnh-182 Bai Qi                (individual; the person template)
cnh-186 Qu Yuan               (individual; the person template)
cnh-189 Jing Ke               (individual; the person template)
cnh-192 Qin Shi Huang         (ruler; the person template)
cnh-195 Li Si                 (individual; the person template)
cnh-206 Meng Tian             (individual; the person template)
cnh-210 Xu Fu                 (legendary)
cnh-215 Xiang Yu              (individual; the person template)
cnh-216 Emperor Gaozu of Han  (ruler; the person template)
cnh-220 Empress Lü            (ruler; the person template)
cnh-223 Emperor Wu of Han     (individual; the person template)
cnh-226 Modu Chanyu           (ruler; person-cards misses it)
cnh-228 Huo Qubing            (individual; the person template)
cnh-229 Zhang Qian            (individual; the person template)
cnh-237 Dong Zhongshu         (individual; the person template)
cnh-240 Sima Qian             (individual; the person template)
cnh-246 Wang Mang             (ruler; the person template)
cnh-254 Emperor Guangwu       (ruler; the person template)
cnh-257 Ban Chao              (individual; the person template)
cnh-259 Ban Gu                (individual; the person template)
cnh-261 Ban Zhao              (individual; the person template)
cnh-262 Cai Lun               (individual; the person template)
cnh-263 Zhang Heng            (individual; the person template)
cnh-265 Liang Ji              (individual; the person template)
cnh-269 Zhang Jue             (individual; the person template)
cnh-270 Dong Zhuo             (individual; the person template)
cnh-271 Yuan Shao             (ruler; the person template)
cnh-272 Emperor Xian of Han   (ruler; the person template)
cnh-274 Cao Cao               (ruler; the person template)
cnh-278 Cao Pi                (ruler; the person template)
cnh-280 Liu Bei               (ruler; the person template)
cnh-281 Zhuge Liang           (individual; the person template)
cnh-285 Sun Quan              (ruler; the person template)
cnh-286 Guan Yu               (individual; the person template)
cnh-289 Sima Yi               (individual; the person template)
cnh-292 Sun Hao               (ruler; the person template)
cnh-294 Emperor Wu of Jin     (ruler; the person template)
cnh-302 Emperor Min of Jin    (ruler; the person template)
cnh-309 Fu Jian               (ruler; the person template)
cnh-312 Fotudeng              (individual; the person template)
cnh-316 Wang Dao              (individual; the person template)
cnh-317 Zu Ti                 (individual; the person template)
cnh-318 Huan Wen              (individual; the person template)
cnh-319 Wang Xizhi            (individual; the person template)
cnh-320 Tao Yuanming          (individual; the person template)
cnh-321 Gu Kaizhi             (individual; the person template)
cnh-322 Liu Yu                (ruler; the person template)
cnh-327 Emperor Wu of Liang   (ruler; the person template)
cnh-333 Emperor Xiaowen       (ruler; the person template)
cnh-341 Shen Yue              (individual; the person template)
cnh-344 Emperor Wen of Sui    (ruler; the person template)
cnh-349 Emperor Yang of Sui   (ruler; the person template)
cnh-354 Yuwen Huaji           (individual; the person template)
cnh-356 Emperor Gaozu of Tang (ruler; the person template)
cnh-357 Emperor Taizong of Tang (ruler; the person template)
cnh-371 Wu Zetian             (ruler; the person template)
cnh-373 Emperor Xuanzong      (ruler; the person template)
cnh-375 Yang Guifei           (individual; the person template)
cnh-377 An Lushan             (individual; the person template)
cnh-382 Yang Yan              (individual; the person template)
cnh-383 Liu Yan               (individual; the person template)
cnh-388 Xuanzang              (individual; the person template)
cnh-391 Li Bai                (individual; the person template)
cnh-392 Du Fu                 (individual; the person template)
cnh-393 Bai Juyi              (individual; the person template)
cnh-394 Han Yu                (individual; the person template)
cnh-396 Zhu Wen               (ruler; the person template)
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

One row per story the collection tells (the first hundred's rows, then the second's and the third's): the versions, the earliest text each is attested in (with its date
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
| The succession from Yu to Qi | the lords turning from Yu's minister Yi to his son Qi (the *Mencius*); a third telling in the excavated *Rongchengshi* manuscript; Qi killing Yi (the *Bamboo Annals*) — set B6 (`cnh-057`) | `cnh-057` | `cnh-012`, `cnh-054` | — |
| Jie as the bad last king | the last Xia king's cruelty and fall as the *Shiji* and the *Shangshu* tell it; the bad-last-ruler pattern shared with Di Xin, a reading after Lewis — set B6 (`cnh-058`) | `cnh-058` | `cnh-068` | `cnh-102` (Di Xin) |
| Tang's self-offering for rain | five years of drought, the mulberry grove, his hair cut, rain (the *Lüshi Chunqiu*, "Shun min") — set B7 (`cnh-068`) | `cnh-068` | — | — |
| The nine ding | passed from Xia to Shang to Zhou (the *Zuo Zhuan*, Duke Xuan 3; the *Mozi*); the Qin capture and the Si River search (the *Shiji*), carved on Eastern Han shrines — set B9 (`cnh-083`) | `cnh-083` | `cnh-012`, `cnh-028` | `cnh-124` |
| Di Xin as the bad last king | the wine pool and the forest of meat, Daji, Bigan's heart cut out, the burning on the Deer Terrace (the *Shiji*, c. 100 BCE, after Warring States tellings); doubted already in the *Analects* (Zigong: "not as bad as that"); the oldest charge the "Mu shi"'s (he follows his wife's words and neglects the sacrifices); the excavated *Rongchengshi* already tells of evil last rulers; the pattern shared with Jie; one study holds Daji invented — confirmed B11 (`cnh-102`, `cnh-106`) | `cnh-102` | `cnh-103`, `cnh-105`, `cnh-106` | `cnh-058` (Jie) |
| Houji and the birth of the Zhou | Jiang Yuan treading in the god's footprint, the child thrice abandoned and saved, the founder of millet farming; the *Shijing* "Sheng min" (a temple ode to the royal ancestors; one translation names the mother Lady Shengmin), retold in the *Shiji*'s Zhou annals — confirmed B12–B13 (`cnh-111`, `cnh-127`); no open source dates the ode's composition | — | `cnh-111`, `cnh-127` | — |
| The Mandate of Heaven | Heaven taking its charge from the Shang for misrule and giving it to the Zhou; in Western Zhou bronzes (the He zun, the Da Yu ding) and the *Shangshu* "Zhou" chapters held early ("Kang gao", "Shao gao", "Duo shi"); the right to remove a bad ruler as Mencius later reads it (the "mere fellow"); Dong Zhongshu's Han omens — confirmed B11–B12 (`cnh-105`, `cnh-117`: the formula "Yin let fall its command" in four early chapters and on the Da Yu ding); the He zun on no page read | `cnh-117` | `cnh-103`, `cnh-105`, `cnh-111`, `cnh-113`, `cnh-114`, `cnh-118` | — |
| King Wen and King Wu and the conquest | King Wen held at Youli and the *Yijing*'s hexagrams credited to him (Han tradition); the gathering of lords at Mengjin (the *Shiji*'s 800); the oath before battle (the *Shangshu* "Mu shi"); Muye on a *jiazi* morning (the Li gui, a contemporary bronze, names the *jiazi* day); the "Wu cheng" pestles floating in blood, which Mencius refused to believe (82 words of the "Wu cheng" survive, quoted in the *Hanshu*) — confirmed B11–B12 (`cnh-103`, `cnh-104`, `cnh-113`, `cnh-114`; the 800 lords in both the *Shiji*'s Yin and Zhou annals; whether the "Mu shi" is a genuine early Zhou text, no open source said) | `cnh-113`, `cnh-114`, `cnh-104` | `cnh-103`, `cnh-105`, `cnh-111` | — |
| The Duke of Zhou's regency | regent for the young King Cheng, crushing the Three Guards and the Shang prince Wugeng, building the eastern capital, and handing power back after seven years (the *Shangshu* chapters and the *Shiji*); some Warring States texts (the *Xunzi*, "Ru xiao") say he held the throne itself; one study reads the Tsinghua "Jinteng" manuscript the same way; the metal-bound coffer chapter dated late Eastern Zhou by most scholars; the maker of the Zhou rites, a later tradition (the *Zhouli* credited to him, not re-sourced) — confirmed B12 (`cnh-115`, `cnh-114`) | `cnh-115` | `cnh-116`, `cnh-121`, `cnh-122`, `cnh-124` | — |
| The Gonghe regency | two readings: the dukes of Zhou and Shao ruling together (the *Shiji*) or He, the Earl of Gong, ruling (the *Bamboo Annals*, and the *Zhuangzi* as Chavannes notes); the excavated *Xinian* gives the regency fourteen years, whether it names He not confirmed; 841 BCE the first year of the continuous count (one study, Zhang 2023, moves it to 850 – 837 BCE) — confirmed B14 (`cnh-134`) | `cnh-134` | `cnh-133`, `cnh-135` | — |
| Baosi and the beacon fires | Baosi born of the dragons' foam kept since the Xia; King You lighting the beacons to make her laugh until the lords stopped coming (the *Shiji*, c. 100 BCE; a drum version in the *Lüshi Chunqiu*); the excavated *Xinian* (Warring States) tells the fall with no beacons; the "Zheng yue" ode of the *Shijing* names her first — confirmed B14 (`cnh-136`, `cnh-137`), the drum version not checked | `cnh-137` | `cnh-136`, `cnh-138` | — |
| The end of the Western Zhou and the two kings | the Marquis of Shen and the Quanrong kill King You; King Ping raised in the east while a rival, Yuchen, King Hui of Xie, ruled for 21 years until the Marquis of Jin killed him (the *Bamboo Annals*, where the duke of Guo raises him and he is a son of King You, and the *Xinian*, where he is the dead king's younger brother; the *Shiji* gives only Ping) — confirmed B14 (`cnh-138`, `cnh-139`: Zhang 2023, Legge) | `cnh-138`, `cnh-139` | `cnh-136`, `cnh-140`, `cnh-141` | — |
| Jie Zitui and the cold food | the follower passed over after Chong'er's exile, withdrawing with his mother, Mianshang set aside for offerings to him (the Zuo Zhuan, Duke Xi 24, and the *Shiji*); the forest burned to bring him out and the cold-food custom, a later legend — set B15 (`cnh-149`) | — | `cnh-149` | — |
| The burning of the books and burying of the scholars | the 213 BCE order to burn the *Shijing*, the *Shangshu* and the schools' writings outside the court academicians' copies, on Li Si's memorial, and the 212 BCE execution of 460 scholars at Xianyang (the *Shiji*, Qin annals and Li Si's biography, c. 100 BCE); "burying alive" as the traditional reading of 坑; the scholars as Confucians and the burning as a total loss, later Han readings; the *Shiji* itself has Fusu protest that the victims "all model themselves on Confucius"; modern doubters (the victims as *fangshi*, Zufferey 1997; the burying perhaps never done, Eno; Confucianism not the target, Pines; a smaller loss than the tradition says, Strähle); the melon-ditch tale a later legend — confirmed B21 (`cnh-202`) | `cnh-202` | `cnh-195`, `cnh-212` | — |
| Xu Fu and the isles | Xu Fu (the *Shiji* also writes Xu Shi) asking leave in 219 BCE to seek Penglai, Fangzhang and Yingzhou with young men and women, and the great fish in 210 BCE (the *Shiji*, Qin annals); settling a plain and never returning (the *Shiji*, Huainan biography); his landing in Japan near Mount Fuji, first written down in Yichu's compilation of 955 from a Japanese monk's telling (Wu 2014) — agrees with the Penglai row; confirmed B21 (`cnh-210`) | `cnh-210` | `cnh-021`, `cnh-192` | `cnh-021` |
| The Shaqiu plot and the forged edict | the First Emperor's death at Shaqiu in 210 BCE; Zhao Gao, Li Si and Huhai hiding it, the body carried back with salted fish, and the forged edicts ordering Fusu and Meng Tian to die (the *Shiji*, Qin annals and Li Si's biography; Zhao Gao's own phrase 沙丘之謀 in chap. 87) — confirmed B22 (`cnh-211`); the excavated *Zhao Zheng shu* (Peking University slips), in which the emperor is said to name Huhai himself, NOT confirmed (no open source) | `cnh-211` | `cnh-195`, `cnh-206`, `cnh-212` | — |
| The Feast at Hong Gate | Liu Bang's visit to Xiang Yu's camp in 206 BCE, Fan Zeng's signals with the jade, Xiang Zhuang's sword dance, Fan Kuai's entry and Liu Bang's flight (the *Shiji*, Xiang Yu's annals, c. 100 BCE); the account in Gaozu's annals runs to a few lines and adds the armies' boasted sizes — confirmed B22 (`cnh-217`); no open source read calls the speeches set pieces, so the card says only that they are best read as Sima Qian's telling | `cnh-217` | `cnh-214`, `cnh-215`, `cnh-216` | — |
| Xiang Yu at Gaixia | Xiang Yu surrounded in 202 BCE, hearing Chu songs from the Han lines (四面楚歌), his song to Consort Yu and the horse Zhui, the break-out and death at the Wu River (the *Shiji*, Xiang Yu's annals); the *Shiji*'s two accounts differ on when the songs come and name no author for them (a Ming–Qing tale credits Zhang Liang); in the annals Consort Yu only sings with him, her suicide a scene of the later opera *Bawang bie ji* — confirmed B22 (`cnh-218`) | `cnh-218` | `cnh-214`, `cnh-215` | — |
| Liu Bang's dragon birth | his mother dreaming of a god by a great marsh and a dragon over her, the dragon seen over him drunk, the white snake he killed (the *Shiji*, Gaozu's annals); signs of Heaven's choice for a commoner founder — confirmed B22 (`cnh-216`) | — | `cnh-216` | — |
| Wang Mang as usurper | the *Hanshu*'s verdict (Ban Gu, completed after 92 CE): a hypocrite who seized the throne and whose reforms brought chaos; modern readings of him as a reformer (Hu Shi's "socialist emperor", 1928) and as a capable statesman whose record the Eastern Han's historians wrote against (Bielenstein) — confirmed B25 (`cnh-245`–`cnh-248`: the zan's 篡盜之禍 and its Qin comparison, 紫色蛙聲) | `cnh-246` | `cnh-245`, `cnh-247`, `cnh-248`, `cnh-249` | — |
| The Peach Garden oath | Liu Bei, Guan Yu and Zhang Fei swearing brotherhood in a peach garden (the *Romance of the Three Kingdoms*, 14th-century novel, first printed 1522); the *Sanguozhi* says only that the three slept in one bed and were as close as brothers — confirmed B28 (`cnh-280`, de Crespigny) | — | `cnh-280`, `cnh-286`, `cnh-291` | — |
| The Romance and the Records of the Three Kingdoms | Chen Shou's *Sanguozhi* (completed after 280 CE) with Pei Songzhi's notes (429 CE); the storytellers' and the Yuan *Sanguozhi pinghua* (printed 1321 – 1323); the *Romance* credited to Luo Guanzhong (doubted), its oldest preface dated 1494, first printed 1522, revised by Mao Lun with his son Mao Zonggang c. 1679; its "seven parts fact, three parts fiction" (Zhang Xuecheng); the empty-city ruse first told of a Wei commander (the *Weilüe* in Pei's notes); Red Cliffs (the borrowed arrows, the east wind, Huarong), Guandu and Cao Cao's villainy told as the novel's; Guan Yu's deification as `cnh-039` tells it; Diaochan the novel's (the chronicle names only an unnamed maidservant, B27 `cnh-270`) — confirmed B28 – B30 (`cnh-273`, `276`, `281`, `286`, `290`, `291`) | `cnh-291`, `cnh-290` | `cnh-273`, `cnh-274`, `cnh-276`, `cnh-281`, `cnh-286` | `cnh-039` |
| The Seven Sages of the Bamboo Grove | seven men gathering in a bamboo grove at Shanyang to drink and talk (as a group in the 4th century CE — Sun Sheng's *Wei shi chunqiu*, quoted by Pei Songzhi — and the *Shishuo xinyu*, 5th century CE); the grouping and the grove read by modern scholars as a later construction (Spiro: no evidence all seven knew one another; Chen Yinke's Buddhist name for the grove on no page read); the Nanjing brick reliefs, from a tomb of the late 4th or early 5th century, their trees not bamboo (Spiro) — confirmed and corrected B30 (`cnh-300`) | `cnh-300` | `cnh-299` | — |
| The Three Sovereigns and Five Emperors | the lists differ by text: the *Shiji*'s Five Emperors (Yellow Emperor, Zhuanxu, Ku, Yao, Shun); Three Sovereigns as Heavenly, Earthly and Human or Grand (the *Shiji*'s Qin annals), or as Fuxi, Nüwa and Shennong, or Fuxi, Shennong and the Yellow Emperor, or Fuxi, Suiren and Shennong, or Fuxi, Zhurong and Shennong in other texts; Sima Zhen's Tang chapter supplies Fuxi, Nüwa and Shennong — confirmed B1 (`cnh-002`, Chavannes) | `cnh-002` | `cnh-003`–`cnh-007`, `cnh-040` | `cnh-879` |
| Fu Jian's whips and the wind and cranes at Fei River | Fu Jian boasting that his host could dam the Yangtze by throwing in their whips, and his routed army hearing the wind and the cranes' cries as the pursuing Jin (the *Jinshu*, compiled under the Tang, 646 – 648 CE); Xie An playing *weiqi* as the news came (juan 79) — confirmed B31 (`cnh-310`: the whips and the cranes in juan 114; Zhu Xu's shout in neither juan read; the "million" Zhu Xu's rhetoric, not a count) | `cnh-310` | `cnh-308`, `cnh-309`, `cnh-315` | — |
| Wang Xizhi's Orchid Pavilion preface | the gathering at the Orchid Pavilion in 353 CE and Wang Xizhi's preface to its poems; Taizong's love of the original and its burial with him (Tang tellings, He Yanzhi's account); the surviving versions copies — provisional | `cnh-319` | `cnh-357` | — |
| The Peach Blossom Spring | Tao Yuanming's own prose tale of a fisherman finding a hidden valley whose people fled the Qin, told as fiction by its author — provisional | `cnh-320` | — | — |
| Emperor Wu of Liang and Bodhidharma | the emperor's question about his merit and Bodhidharma's "no merit"; a Chan legend first told centuries later (the 8th-century Chan histories), not in the earliest notice of Bodhidharma — provisional | — | `cnh-327` | — |
| The Xuanwu Gate incident as told | Li Shimin killing his brothers Li Jiancheng and Li Yuanji at the palace gate and his father's abdication, in the court histories written under Taizong's own eye (the *Old* and *New Book of Tang*, the *Zizhi tongjian*), which make the brothers the plotters — provisional | `cnh-358` | `cnh-356`, `cnh-357` | — |
| Wu Zetian as the only empress regnant and the hostile tradition | the only woman to rule China as emperor in her own name (the Wu Zhou, 690 – 705 CE); the stories of the strangled daughter and the mutilated rivals from later hostile historians — provisional | `cnh-371`, `cnh-372` | `cnh-364` | — |
| Yang Guifei: the lychees, Mawei and the Song of Everlasting Sorrow | lychees rushed by relay to the court; her death at Mawei Station when the escort mutinied (756 CE); Bai Juyi's "Song of Everlasting Sorrow" (806 CE) and later legend — provisional | `cnh-375` | `cnh-373`, `cnh-377`, `cnh-393` | — |
| An Lushan's adoption by Yang Guifei | An Lushan made Yang Guifei's adopted son, the washing ceremony; told in later histories and anecdote collections — provisional | — | `cnh-377`, `cnh-375` | — |
| Li Bai drowning while embracing the moon | the poet drowning as he leaned from a boat to embrace the moon's reflection; a later legend, against the earlier accounts of illness — provisional | — | `cnh-391` | — |
| Xuanzang and the Journey to the West | Xuanzang's own *Record of the Western Regions* (646 CE) and his disciples' biography; the 16th-century novel *Journey to the West* with Tripitaka and the Monkey King, fiction — agreeing with `in-199` — provisional | — | `cnh-388` | `in-199` |
| Han Yu's memorial on the Buddha's bone | Han Yu's memorial of 819 CE against bringing the finger-bone relic from the Famen Temple into the palace, and his banishment to Chaozhou — provisional | — | `cnh-394`, `cnh-387` | — |

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
| B8 | Shang (`col-3`) | `cnh-071`–`cnh-080` | 10 | 108 | **done 2026-11-09** |
| B9 | Shang (`col-3`) | `cnh-081`–`cnh-090` | 10 | 122 | **done 2026-11-09** |
| B10 | Shang (`col-3`) | `cnh-091`–`cnh-100` | 10 | 131 | **done 2026-11-09** |
| B11 | Shang (`col-3`) | `cnh-101`–`cnh-110` | 10 | 113 | **done 2026-11-12** |
| B12 | Western Zhou (`col-4`) | `cnh-111`–`cnh-120` | 10 | 110 | **done 2026-11-12** |
| B13 | Western Zhou (`col-4`) | `cnh-121`–`cnh-130` | 10 | 119 | **done 2026-11-12** |
| B14 | Western Zhou (`col-4`) | `cnh-131`–`cnh-140` | 10 | 124 | **done 2026-11-12** |
| B15 | Eastern Zhou (`col-5`) | `cnh-141`–`cnh-150` | 10 | 116 | **done 2026-11-12** |
| B16 | Eastern Zhou (`col-5`) | `cnh-151`–`cnh-160` | 10 | 107 | **done 2026-11-12** |
| B17 | Eastern Zhou (`col-5`) | `cnh-161`–`cnh-170` | 10 | 121 | **done 2026-11-12** |
| B18 | Eastern Zhou (`col-5`) | `cnh-171`–`cnh-180` | 10 | 110 | **done 2026-11-12** |
| B19 | Eastern Zhou (`col-5`) | `cnh-181`–`cnh-190` | 10 | 107 | **done 2026-11-12** |
| B20 | Qin (`col-7`) | `cnh-191`–`cnh-200` | 10 | 103 | **done 2026-11-12** |
| B21 | Qin (`col-7`) | `cnh-201`–`cnh-210` | 10 | 93 | **done 2026-11-12** |
| B22 | Qin (`col-7`) / Western Han (`col-10`) | `cnh-211`–`cnh-220` | 10 | 86 | **done 2026-11-12** |
| B23 | Western Han (`col-10`) | `cnh-221`–`cnh-230` | 10 | 80 | **done 2026-11-12** |
| B24 | Western Han (`col-10`) | `cnh-231`–`cnh-240` | 10 | 78 | **done 2026-11-12** |
| B25 | Western Han (`col-10`) / Xin (`col-11`) | `cnh-241`–`cnh-250` | 10 | 66 | **done 2026-11-12** |
| B26 | Xin (`col-11`) / Eastern Han (`col-12`) | `cnh-251`–`cnh-260` | 10 | 67 | **done 2026-11-12** |
| B27 | Eastern Han (`col-12`) | `cnh-261`–`cnh-270` | 10 | 93 | **done 2026-11-12** |
| B28 | Eastern Han (`col-12`) / Three Kingdoms (`col-16`) | `cnh-271`–`cnh-280` | 10 | 92 | **done 2026-11-12** |
| B29 | Three Kingdoms (`col-16`) | `cnh-281`–`cnh-290` | 10 | 84 | **done 2026-11-12** |
| B30 | Three Kingdoms (`col-16`) / Western Jin (`col-18`) | `cnh-291`–`cnh-300` | 10 | 86 | **done 2026-11-12** |
| B31 | Western Jin (`col-18`) / Sixteen Kingdoms (`col-19`) | `cnh-301`–`cnh-310` | 10 | 83 | **done 2026-11-13** |
| B32 | Sixteen Kingdoms (`col-19`) / Eastern Jin (`col-20`) | `cnh-311`–`cnh-320` | 10 | 79 | **done 2026-11-13** |
| B33 | Eastern Jin (`col-20`) / Northern and Southern dynasties (`col-21`) | `cnh-321`–`cnh-330` | 10 | 105 | **done 2026-11-13** |
| B34 | Northern and Southern dynasties (`col-21`) | `cnh-331`–`cnh-340` | 10 | 104 | **done 2026-11-13** |
| B35 | Northern and Southern dynasties (`col-21`) / Sui (`col-22`) | `cnh-341`–`cnh-350` | 10 | 104 | **done 2026-11-13** |
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
| `cnh-071` | an ink rubbing of an inscribed scapula | not re-checked (Commons 429): ok; the credit is not in the house form — fix |
| `cnh-072` | an inscribed plastron with its cracks | not re-checked (Commons 429): ok |
| `cnh-073` | album leaf of Wu Ding dreaming of a helper | not re-checked (Commons 429): ok |
| `cnh-074` | the owl zun made for Fu Hao | not re-checked (Commons 429): ok |
| `cnh-075` | the reconstructed tomb at the Yinxu museum | not re-checked (Commons 429): ok |
| `cnh-076` | a Shang vessel with its owner's mark | not re-checked (Commons 429): ok as an illustration, not of kingship itself |
| `cnh-077` | the graph di in oracle-bone script | not re-checked (Commons 429): ok |
| `cnh-078` | a Shang libation jue | not re-checked (Commons 429): ok: one vessel of the cult |
| `cnh-079` | a sacrificial pit at Yinxu | not re-checked (Commons 429): ok |
| `cnh-080` | the plan of royal grave M1400 | not re-checked (Commons 429): ok |
| `cnh-081` | five ding and four gui from the Guo state tombs | not re-checked (Commons 429): ok |
| `cnh-082` | clay moulds, an ingot and carving tools | not re-checked (Commons 429): ok |
| `cnh-083` | the Hou Mu Wu ding | not re-checked (Commons 429): ok; the credit lacks the Commons link — fix |
| `cnh-084` | a late Shang jia with its mask bands | not re-checked (Commons 429): ok |
| `cnh-085` | a jade ge from Yinxu | not re-checked (Commons 429): ok |
| `cnh-086` | a chariot pit at Yinxu | not re-checked (Commons 429): ok |
| `cnh-087` | bronze dagger-axes from Yinxu | not re-checked (Commons 429): ok |
| `cnh-088` | a museum text panel of the capital moves | not re-checked (Commons 429): wrong: burned-in text — replace |
| `cnh-089` | the inner wall in the modern city | not re-checked (Commons 429): ok |
| `cnh-090` | an excavated palace foundation | not re-checked (Commons 429): ok |
| `cnh-091` | stone sickle blades from Zhengzhou Shang City | not re-checked (Commons 429): ok |
| `cnh-092` | a 1973 satellite photograph of fields near Guandimiao | not re-checked (Commons 429): weak: nothing Shang visible, and the description names its photographer (`I.caption-source`) — replace |
| `cnh-093` | the sixty-day table on a scapula | not re-checked (Commons 429): ok |
| `cnh-094` | none | not re-checked (Commons 429): the card has no picture — an inscribed bone beside its modern characters wanted |
| `cnh-095` | the Tonglüshan copper mine | not re-checked (Commons 429): weak: one copper working, not the neighbours |
| `cnh-096` | a late Shang bronze gui | not re-checked (Commons 429): ok |
| `cnh-097` | cowries from Yinxu | not re-checked (Commons 429): ok; the credit is not in the house form — fix |
| `cnh-098` | two late Shang nao | not re-checked (Commons 429): ok; the credit is not in the house form — fix |
| `cnh-099` | bone hairpins from the workshops | not re-checked (Commons 429): ok as a stand-in: the products, not a workshop |
| `cnh-100` | attendants on a tomb ledge (the reconstructed Fu Hao tomb) | not re-checked (Commons 429): ok |
| `cnh-101` | rubbing of the Hou Mu Wu ding | not re-checked (Commons 429): ok as a stand-in, one object for a group |
| `cnh-102` | 18th-century album leaf of the king | not re-checked (Commons 429): ok |
| `cnh-103` | the Li gui | not re-checked (Commons 429): ok; the description's "made in King Wu's reign" is the majority view (a minority say early King Cheng) — soften |
| `cnh-104` | a Shang bronze axe | not re-checked (Commons 429): weak: a generic axe, not the battle |
| `cnh-105` | rubbing of the Da Yu ding | not re-checked (Commons 429): ok, but the description's claim that it blames Yin's fall on wine was not confirmed — check or soften |
| `cnh-106` | rubbing of a Confucius engraving | not re-checked (Commons 429): partial: one strand (the Song descent) |
| `cnh-107` | a joined pair of fragments | not re-checked (Commons 429): ok, but annotated with burned-in text — a plain rubbing preferred |
| `cnh-108` | an eclipse-recording bone | not re-checked (Commons 429): ok; alt identical to the description |
| `cnh-109` | an ibex-headed knife | not re-checked (Commons 429): retitle (the title is the old card's angle) or replace |
| `cnh-110` | a bone beside its transcription | not re-checked (Commons 429): wrong: burned-in transcription and English — replace |
| `cnh-111` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-112` | the Lai pan inscription | not re-checked (Commons 429): weak: one object for a period, and the credit names no author |
| `cnh-113` | an album portrait | not re-checked (Commons 429): ok |
| `cnh-114` | an album portrait | not re-checked (Commons 429): ok |
| `cnh-115` | an album leaf of the duke | not re-checked (Commons 429): ok |
| `cnh-116` | the Kang Hou gui | not re-checked (Commons 429): ok; its description should say Wey, not Wei |
| `cnh-117` | a woodblock page of the Documents | not re-checked (Commons 429): wrong: a generic page; a Da Yu ding picture wanted |
| `cnh-118` | a chart of eight archaic graphs | not re-checked (Commons 429): wrong: one cell is tian — a bronze or bone tian wanted |
| `cnh-119` | a Liulihe zun | not re-checked (Commons 429): wrong for this card (a Yan vessel, `cnh-120`'s subject); an investiture bronze wanted |
| `cnh-120` | a Liulihe ding | not re-checked (Commons 429): ok |
| `cnh-121` | a Western Zhou gui from Luoyang | not re-checked (Commons 429): wrong: one vessel, not the city |
| `cnh-122` | a chime-bell set | not re-checked (Commons 429): weak: undated bells for "music", not a royal rite |
| `cnh-123` | an inscription inside a Guo Ji ding | not re-checked (Commons 429): ok |
| `cnh-124` | matched ding and gui sets of a Guo lord | not re-checked (Commons 429): ok |
| `cnh-125` | none | not re-checked (Commons 429): the card has no picture — the Lai pan would suit |
| `cnh-126` | an early printed page | not re-checked (Commons 429): ok; retitle to name the term |
| `cnh-127` | a stone-classic rubbing of the first ode | not re-checked (Commons 429): ok |
| `cnh-128` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-129` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-130` | a halberd beside a text panel | not re-checked (Commons 429): wrong: burned-in text, one weapon — replace |
| `cnh-131` | the graph Xianyun in a Duo You ding rubbing | not re-checked (Commons 429): ok; the credit names no author |
| `cnh-132` | a Joseon screen of the Queen Mother's visit | not re-checked (Commons 429): ok |
| `cnh-133` | the Duo You ding with a printed transcription | not re-checked (Commons 429): wrong: burned-in text, a general's vessel — the king's own Hu gui wanted |
| `cnh-134` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-135` | the Mao Gong ding inscription | not re-checked (Commons 429): weak: not the king, and its reign argued — replace |
| `cnh-136` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-137` | a later painting of the beacon story | not re-checked (Commons 429): ok |
| `cnh-138` | a map of the Zhou realm under King Xuan | not re-checked (Commons 429): weak: the kingdom, not the sack |
| `cnh-139` | the Luoyang six-horse chariot pit | not re-checked (Commons 429): weak: an Eastern Zhou burial, not the move |
| `cnh-140` | the Shi Qiang pan | not re-checked (Commons 429): ok; the credit names no licence — check |
| `cnh-141` | a rammed-earth wall at Xinzheng | not re-checked (Commons 429): wrong: one site for an era; no licence in the credit |
| `cnh-142` | a Zheng ruler's tomb bronzes | not re-checked (Commons 429): wrong: one tomb for an era; no licence in the credit |
| `cnh-143` | an 1876 Russian title page | not re-checked (Commons 429): wrong: a translation's title page — the chronicle wanted |
| `cnh-144` | a 1777 printing | not re-checked (Commons 429): ok |
| `cnh-145` | a woodblock of Duke Zhuang of Zheng | not re-checked (Commons 429): wrong: one man for a process |
| `cnh-146` | a lettered modern map | not re-checked (Commons 429): weak: burned-in lettering |
| `cnh-147` | a romance woodblock of Kuiqiu | not re-checked (Commons 429): ok; the credit names no author or licence |
| `cnh-148` | the Wu shrine rubbing of the duke and Guan Zhong | not re-checked (Commons 429): ok; no licence in the credit |
| `cnh-149` | Li Tang's handscroll of the return | not re-checked (Commons 429): ok; no licence in the credit |
| `cnh-150` | a museum diorama | not re-checked (Commons 429): weak: a modern diorama; no licence in the credit |
| `cnh-151` | a woodblock of the king | not re-checked (Commons 429): ok |
| `cnh-152` | a drainage outlet in the Linzi wall | not re-checked (Commons 429): ok as a stand-in |
| `cnh-153` | a ding of a marquis of Jin | not re-checked (Commons 429): ok |
| `cnh-154` | a bronze hu of Chu | not re-checked (Commons 429): ok |
| `cnh-155` | the Qin Gong gui | not re-checked (Commons 429): ok |
| `cnh-156` | a jade disc of Lu | not re-checked (Commons 429): ok |
| `cnh-157` | a woodblock of Duke Xiang | not re-checked (Commons 429): wrong: one duke for a state; no licence in the credit |
| `cnh-158` | Yuyue bronze fittings | not re-checked (Commons 429): ok; no licence in the credit |
| `cnh-159` | the sword of Goujian | not re-checked (Commons 429): ok; no licence in the credit |
| `cnh-160` | the Houma covenant tablets | not re-checked (Commons 429): ok; the credit is not in the house form |
| `cnh-161` | Zhao Meng's bronze dagger-axe | not re-checked (Commons 429): ok |
| `cnh-162` | a Jin bronze jian | not re-checked (Commons 429): ok as a period object; not the partition |
| `cnh-163` | the Marquis Yi of Zeng bells | not re-checked (Commons 429): wrong: one tomb for an era |
| `cnh-164` | a map of the seven states | not re-checked (Commons 429): ok |
| `cnh-165` | Wei spade coins | not re-checked (Commons 429): ok |
| `cnh-166` | none | not re-checked (Commons 429): the card has no picture; the glossary's statue would do |
| `cnh-167` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-168` | the Shang Yang measure | not re-checked (Commons 429): ok as his object |
| `cnh-169` | Qin statutes on bamboo | not re-checked (Commons 429): ok |
| `cnh-170` | a Qin bronze weight | not re-checked (Commons 429): weak: of the empire after 221 BCE |
| `cnh-171` | the blades of a halberd | not re-checked (Commons 429): weak: one weapon |
| `cnh-172` | a crossbow lock | not re-checked (Commons 429): ok; the trigger only |
| `cnh-173` | an army in ranks | not re-checked (Commons 429): ok |
| `cnh-174` | riding bits | not re-checked (Commons 429): ok as a stand-in; not the man |
| `cnh-175` | iron tools | not re-checked (Commons 429): ok |
| `cnh-176` | a knife coin | not re-checked (Commons 429): ok |
| `cnh-177` | a model of Linzi | not re-checked (Commons 429): ok as a stand-in |
| `cnh-178` | a woodblock of Zhang Yi | not re-checked (Commons 429): wrong for this card (one man) — better on `cnh-179` |
| `cnh-179` | a page of the Zhanguo Ce | not re-checked (Commons 429): weak; the credit names no author |
| `cnh-180` | the Sun Bin slips | not re-checked (Commons 429): ok |
| `cnh-181` | an arrowhead | not re-checked (Commons 429): weak: a generic arrowhead |
| `cnh-182` | a later portrait | not re-checked (Commons 429): ok |
| `cnh-183` | a Daoist slip manuscript | not re-checked (Commons 429): wrong: generic, not the Jixia |
| `cnh-184` | a belt hook | not re-checked (Commons 429): wrong: generic |
| `cnh-185` | an edition of the book | not re-checked (Commons 429): ok |
| `cnh-186` | a later portrait | not re-checked (Commons 429): ok |
| `cnh-187` | an illustrated Li Sao | not re-checked (Commons 429): ok |
| `cnh-188` | a labelled map | not re-checked (Commons 429): ok; burned-in labels |
| `cnh-189` | a picture of the attempt | not re-checked (Commons 429): ok; the description misspells "Jin Ke" — fix |
| `cnh-190` | ding in the Hunan Museum | not re-checked (Commons 429): wrong: generic ding, not the royal set |
| `cnh-191` | a map of the Qin heartland | not re-checked (Commons 429): ok |
| `cnh-192` | a later portrait | not re-checked (Commons 429): ok |
| `cnh-193` | a map of the unified realm | not re-checked (Commons 429): ok |
| `cnh-194` | a stele with the title | not re-checked (Commons 429): ok |
| `cnh-195` | calligraphy credited to him | not re-checked (Commons 429): ok as tradition's |
| `cnh-196` | a palace model | not re-checked (Commons 429): weak |
| `cnh-197` | an official's conduct text | not re-checked (Commons 429): ok |
| `cnh-198` | a standard carrying both edicts | not re-checked (Commons 429): ok |
| `cnh-199` | the lesser seal, recut | not re-checked (Commons 429): ok |
| `cnh-200` | the Shuihudi questions and answers | not re-checked (Commons 429): ok |
| `cnh-201` | slips of the Day Book | not re-checked (Commons 429): ok |
| `cnh-202` | an 18th- or 19th-century album leaf of both acts | not re-checked (Commons 429): ok |
| `cnh-203` | a map of the Straight Road and the walls | not re-checked (Commons 429): ok; the Straight Road only, not the highways |
| `cnh-204` | the canal at Xing'an | not re-checked (Commons 429): ok |
| `cnh-205` | the Nanyue palace site in Guangzhou | not re-checked (Commons 429): weak: Nanyue's palace, not the conquest |
| `cnh-206` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-207` | plans and photographs of three watchtowers | not re-checked (Commons 429): weak: burned-in labels; a photograph of a Qin earthen wall wanted |
| `cnh-208` | the mound | not re-checked (Commons 429): ok |
| `cnh-209` | the ranks in Pit 1 | not re-checked (Commons 429): ok |
| `cnh-210` | the statue at Weihai | not re-checked (Commons 429): ok; the caption's departure from Weihai is unsourced — trim |
| `cnh-211` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-212` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-213` | Han tomb figures of a dancer and musicians | not re-checked (Commons 429): ok |
| `cnh-214` | a modern map with printed labels and arrows | not re-checked (Commons 429): weak: burned-in text — replace |
| `cnh-215` | an album portrait | not re-checked (Commons 429): ok |
| `cnh-216` | an album portrait | not re-checked (Commons 429): ok |
| `cnh-217` | the Western Han painted beam from Luoyang | not re-checked (Commons 429): ok |
| `cnh-218` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-219` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-220` | the empress's jade seal | not re-checked (Commons 429): ok |
| `cnh-221` | a silk painting of Emperor Wen | not re-checked (Commons 429): weak: one reign of the two |
| `cnh-222` | a map with printed labels | not re-checked (Commons 429): weak: burned-in labels — replace |
| `cnh-223` | Maoling | not re-checked (Commons 429): ok |
| `cnh-224` | the Han wall at Yumen | not re-checked (Commons 429): weak: the later frontier, not these wars |
| `cnh-225` | a Noin-Ula hanging | not re-checked (Commons 429): ok |
| `cnh-226` | a modern bronze in Ulaanbaatar | not re-checked (Commons 429): ok; the card and glossary describe it differently — check |
| `cnh-227` | Mawangdui silk | not re-checked (Commons 429): weak: Han silk, not the treaty |
| `cnh-228` | the horse trampling a Xiongnu | not re-checked (Commons 429): ok |
| `cnh-229` | the Mogao send-off painting | not re-checked (Commons 429): ok |
| `cnh-230` | the Yumen fort | not re-checked (Commons 429): ok |
| `cnh-231` | a Han beacon tower near Dunhuang | not re-checked (Commons 429): ok |
| `cnh-232` | Zhao Mo's jade suit | not re-checked (Commons 429): ok; the card no longer cites the tomb |
| `cnh-233` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-234` | Han iron tools from Guxing | not re-checked (Commons 429): ok |
| `cnh-235` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-236` | a pottery granary model | not re-checked (Commons 429): weak: a granary, not the transport |
| `cnh-237` | a Qing rubbing of an imagined portrait | not re-checked (Commons 429): ok |
| `cnh-238` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-239` | a fragment of the Xiping stone classics | not re-checked (Commons 429): ok as a stand-in; better on `cnh-852` |
| `cnh-240` | an album portrait | not re-checked (Commons 429): ok |
| `cnh-241` | a page recording the comet of 240 BCE | not re-checked (Commons 429): ok |
| `cnh-242` | the front hall platform | not re-checked (Commons 429): ok |
| `cnh-243` | Han wooden strips | not re-checked (Commons 429): weak: generic documents |
| `cnh-244` | Lady Ban refusing the litter | not re-checked (Commons 429): ok |
| `cnh-245` | the inscription on the Xin standard measure | not re-checked (Commons 429): ok |
| `cnh-246` | a woodblock from a later romance | not re-checked (Commons 429): ok |
| `cnh-247` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-248` | a Han pottery farm model | not re-checked (Commons 429): weak: a farm, not the decree |
| `cnh-249` | a scan of 22 wuzhu coins | not re-checked (Commons 429): ok |
| `cnh-250` | a Song album leaf of a breaching river | not re-checked (Commons 429): ok |
| `cnh-251` | a map of the risings | not re-checked (Commons 429): ok; its description should read Lülin |
| `cnh-252` | a Han relief of a battle at a bridge | not re-checked (Commons 429): weak: a generic battle |
| `cnh-253` | Herrmann's atlas map | not re-checked (Commons 429): weak: printed text |
| `cnh-254` | an album portrait | not re-checked (Commons 429): ok |
| `cnh-255` | a Chengdu tomb tile | not re-checked (Commons 429): weak: a stand-in |
| `cnh-256` | the west wall of Han Luoyang | not re-checked (Commons 429): ok |
| `cnh-257` | a modern statue at Kashgar | not re-checked (Commons 429): ok |
| `cnh-258` | a Han granary on the road west | not re-checked (Commons 429): ok |
| `cnh-259` | a woodblock portrait | not re-checked (Commons 429): ok |
| `cnh-260` | a Song printing | not re-checked (Commons 429): ok |
| `cnh-261` | Ban Zhao at her books | not re-checked (Commons 429): ok |
| `cnh-262` | the tomb of Cai Lun | not re-checked (Commons 429): ok |
| `cnh-263` | a statue of Zhang Heng | not re-checked (Commons 429): ok |
| `cnh-264` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-265` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-266` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-267` | the White Horse Temple | not re-checked (Commons 429): ok |
| `cnh-268` | a map of the rebellion | not re-checked (Commons 429): ok |
| `cnh-269` | none | not re-checked (Commons 429): the card has no picture; its glossary's line drawing has text beside it |
| `cnh-270` | none | not re-checked (Commons 429): the card has no picture; the glossary's would do |
| `cnh-271` | none | not re-checked (Commons 429): the card has no picture; the glossary's would do |
| `cnh-272` | none | not re-checked (Commons 429): the card has no picture; the glossary's would do |
| `cnh-273` | a map of the three states in 262 | not re-checked (Commons 429): ok |
| `cnh-274` | none | not re-checked (Commons 429): the card has no picture; the glossary's Ming portrait would do |
| `cnh-275` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-276` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-277` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-278` | Cao Pi in the Thirteen Emperors Scroll | not re-checked (Commons 429): ok |
| `cnh-279` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-280` | Liu Bei in the Thirteen Emperors Scroll | not re-checked (Commons 429): ok |
| `cnh-281` | a Ming portrait | not re-checked (Commons 429): ok |
| `cnh-282` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-283` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-284` | none | not re-checked (Commons 429): the card has no picture; a Zoumalou slip would suit |
| `cnh-285` | Sun Quan in the Thirteen Emperors Scroll | not re-checked (Commons 429): ok |
| `cnh-286` | Guan Yu captures Pang De | not re-checked (Commons 429): ok |
| `cnh-287` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-288` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-289` | a Ming woodblock portrait | not re-checked (Commons 429): ok |
| `cnh-290` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-291` | three heroes fight Lü Bu | not re-checked (Commons 429): ok |
| `cnh-292` | none | not re-checked (Commons 429): the card has no picture; the glossary's Qing portrait would do |
| `cnh-293` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-294` | Emperor Wu of Jin in the Thirteen Emperors Scroll | not re-checked (Commons 429): ok |
| `cnh-295` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-296` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-297` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-298` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-299` | none | not re-checked (Commons 429): the card has no picture — wanted |
| `cnh-300` | the Seven Sages in a tomb relief | not re-checked (Commons 429): ok; the caption's 5th-century date — Spiro: late 4th or early 5th |
| `cnh-301` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-302` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-303` | the northern states in 338 | not re-checked (Commons rate-limited): ok |
| `cnh-304` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-305` | Herrmann's map of the Sixteen States, 304 – 352 | not re-checked (Commons rate-limited): ok |
| `cnh-306` | a seated Buddha dated 338 | not re-checked (Commons rate-limited): an object of the reign, not the state — acceptable |
| `cnh-307` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-308` | Herrmann's map of the Sixteen States, 352 – 384 | not re-checked (Commons rate-limited): ok |
| `cnh-309` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-310` | Reporting Victory at the Huai and Fei | not re-checked (Commons rate-limited): ok |
| `cnh-311` | the Eastern Jin provinces in 382 | not re-checked (Commons rate-limited): ok |
| `cnh-312` | Shi Hu and Fotudeng | not re-checked (Commons rate-limited): ok |
| `cnh-313` | an Eastern Jin chicken-head ewer | not re-checked (Commons rate-limited): an object of the period — acceptable |
| `cnh-314` | a guardian beast near Nanjing | not re-checked (Commons rate-limited): a Liang tomb beast, not the city — the excavated city wall would be closer |
| `cnh-315` | Xie An, as imagined in the Ming | not re-checked (Commons rate-limited): one man, not the clan |
| `cnh-316` | Wang Dao, from a Qing album of worthies | not re-checked (Commons rate-limited): ok |
| `cnh-317` | Zu Ti in a novel of 1893 | not re-checked (Commons rate-limited): an imagined print, labelled so — ok |
| `cnh-318` | China in 369 | not re-checked (Commons rate-limited): ok |
| `cnh-319` | the Orchid Pavilion Preface, Tang copy | not re-checked (Commons rate-limited): ok |
| `cnh-320` | Tao Yuanming with chrysanthemums | not re-checked (Commons rate-limited): ok |
| `cnh-321` | none | not re-checked (Commons rate-limited): wanted — a free detail of the *Admonitions* scroll, called a later copy |
| `cnh-322` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-323` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-324` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-325` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-326` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-327` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-328` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-329` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-330` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-331` | none | not re-checked (Commons rate-limited): wanted — the Gaxian cave or Yungang |
| `cnh-332` | none | not re-checked (Commons rate-limited): wanted — a Turfan or Dunhuang household register |
| `cnh-333` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-334` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-335` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-336` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-337` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-338` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-339` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-340` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-341` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-342` | none | not re-checked (Commons rate-limited): wanted — a page of an early printing |
| `cnh-343` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-344` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-345` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-346` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-347` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-348` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-349` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-350` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |

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

### B8 — `cnh-071`–`cnh-080`, Shang: oracle bone script to Xibeigang (2026-11-09)

Run as before; all 70 cited URLs answered (four on a second try; a Europe PMC full-text address that returned 500
answered on retry and stays). ScholarSpace pages were read through its open DSpace REST interface where the web pages
showed a bot check, and claims resting on papers no agent could read were dropped. The citation checker's one mismatch
is Tang Jigen's name in Chinese order. **The old cards put counts on every line (4,000 signs, 22,000 sentences, 400
outcomes, 25 diviners, 70 offices, 1,500 objects, 9 kings, 4 ramps, a 133 cm bronze, an ox of 200 kilograms), put a
Neolithic site (Shimao) and an unsupported ratio on a Shang card, told the 1899 "prescription" story as fact, told Fu
Hao's card as her tomb's, gave Wu Ding the beginning of Shang writing without the Huanbei caveat, stated a "10 people to
1 animal" ratio and "13,000 men against the Qiang" that no readable page gives, credited M1004 to Fu Ji (it is Zu
Geng's on the reading followed), and dated Shangdi's attestation as ending at the conquest.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-071` oracle bone script | 7 | 6 → 7 | **Counts off the line, now `In use c. 1250 – 1046 BCE` / `Identified 1899`; the "prescription" story dropped (on no page read), the identification told after Liu et al. 2021 (dragon bones in medicine, compared with Zhou bronze characters); the figures made ranges with their sources (4,000 to 4,600+ signs, about 1,000 to 1,200 read, 150,000 to 160,000 pieces)**; the UNESCO listing left off (no reachable page). |
| `cnh-072` Shang divination | 7 | 5 → 7 | **Every old source walled; re-sourced whole: the preparation, the charge in paired forms, the king's prognostication, the record carved later, the verification; three counts off the line, now `Inscribed c. 1250 – 1046 BCE`**. |
| `cnh-073` Wu Ding | 6 | 5 → 6 | **"The dynasty's own written record begins" with him hedged (bones of the three earlier kings may lie at Huanbei); the Duke of Zhou's speech (59 years, the silence, Gaozong), the *Yijing*'s march on the demon regions, the consorts and the Small King**; questions that were `cnh-069`'s and `cnh-093`'s replaced. Protected: the background carries 1250, 1192, 1201 and 1181. |
| `cnh-074` Fu Hao | 7 | 5 → 7 | **Rebuilt around her, not her tomb (`cnh-075`, `cnh-096`): her domain, troops and hunting, Fu Jing, the Small King, the divination whether she might be married to Shangdi after death, her temple name Mu Xin; "13,000 men against the Qiang" dropped (on no readable page)**; the glossary's date aligned to c. 1200 BCE. Protected: the person template stays. |
| `cnh-075` tomb of Fu Hao | 7 | 5 → 7 | **Counts off the line, now `Buried c. 1250 – 1192 BCE` (within Wu Ding's reign, consistent with `cnh-074`'s c. 1200 BCE) / `Excavated 1976`; "one of only two named occupants" and "about five unlooted burials" dropped; the find (May 1976), the 190 inscribed vessels, the Hou Mu Xin ding, the heated jade parrot and the dissent dating the tomb later**. |
| `cnh-076` Shang kingship | 7 | 5 → 7 | **`Dated c. 1600 – 1046 BCE` (the Chronology Project's table) with the counts in prose; "rather than an officer over subjects" and an alloy sentence dropped; the Shang/Yin names, brother succession as a war need (Lin Yun [in Chinese]), the oracle-bone officials, the *Zuo Zhuan*'s great affairs**. |
| `cnh-077` Shangdi | 6 | 5 → 7 | **`First attested c. 1250 BCE` for a span that ended at the conquest (the Zhou went on sacrificing to him); Eno's view stated as he states it; the missionaries' term question set right (Medhurst and Legge together for Shangdi, against Boone's *shen*)**; the king-as-surrogate paragraph left to `cnh-076`. |
| `cnh-078` Shang ancestor worship | 7 | 5 → 7 | **An ox's weight off the line, now `Recorded c. 1250 – 1046 BCE`; the five-rite cycle of 36 or 37 ten-day weeks, the day-names and the ancestors' place below the gods**; cattle and burial cost left to `cnh-079` and `cnh-100`. |
| `cnh-079` human sacrifice | 8 | 5 → 9 | **A Neolithic site and an unsupported ratio off the line, now `Late Shang c. 1250 – 1046 BCE`; rebuilt on Tang Jigen and Niu Hairu's study of the 191 pits at Xibeigang [in Chinese] (the Qiang victims, the numbers the inscriptions ask for); Shimao one sentence, marked Neolithic; every phrasing carries "under the Shang"**. |
| `cnh-080` Xibeigang | 5 | 5 → 5 | **All five sources new (the old ones walled); counts off the line, now `In use c. 1250 – 1046 BCE`; M1004 given to Zu Geng, not Fu Ji (Mizoguchi and Uchida); the "133 cm bronze" replaced by the Hou Mu Wu ding (832.84 kg) from M260; the unfinished tomb M1576**. |

Read by eye. **Confusability**: the script (`cnh-071`) and the rite (`cnh-072`) split cleanly; Fu Hao the woman (`cnh-074`)
and her tomb (`cnh-075`) no longer share a clue; Di's powers (`cnh-077`) against the rite calendar (`cnh-078`); the
pits (`cnh-079`) against the tombs' order and robbers (`cnh-080`). **Chinese names**: none corrected in this batch;
`商代占卜` (`cnh-072`) and `商代祖先崇拜` (`cnh-078`) are descriptive phrases no open page carries whole — 甲骨占卜 is an
option for the first. **Spellings fixed**: none; 0 hits. **Myth register**: no rows. **Protected lines: unchanged**
(`cnh-073`, `cnh-074`). **For the owner**: the Hou Mu Wu ding — 875 kg on `cnh-101`'s question against the museum's
832.84 kg, as noted at B7. Locator notes for the end: `cnh-075` (the Tomb of Fu Hao article, at Xiaotun) and
`cnh-080` (Xibeigang) have no point.

### B9 — `cnh-081`–`cnh-090`, Shang: ritual bronzes to Panlongcheng (2026-11-09)

Run as before; 73 cited URLs, all answering at least once this session (two National Museum of China pages, which
answered earlier in the run, were unreachable on the last retries, the host flaky all session; a ScholarSpace handle
answered on retry). `cnh-089`'s Europe PMC full-text address, returning 500, was replaced by the article's DOI.
`cnh-086` cites a *Science Advances* paper by its DOI, which answers 403 here; the agent read its Europe PMC full text,
saved as the evidence. **The old cards carried counts and measures as rows (nine ding for a king, a gu and a jue as a
set, 19 mould pieces and 5 cores, a 22.9 cm fangding, Fu Hao's 1.6 tonnes, 13,000 men, two walled cities, 24 km² for
Zhengzhou, 7.5 and 64–110 hectares for Panlongcheng), told the Zhou "nine ding" rule as a Shang fact, set Zhou chariot
pits and Muye's 300 chariots on a Shang card, named Hetian as one of three equal guesses, and said Panlongcheng cast no
vessels.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-081` Chinese ritual bronzes | 7 | 5 → 8 | **Counts off the line, now `Made c. 1600 – 221 BCE`; the nine-ding rule left to `cnh-124` (its Han attestation unreadable here); the card runs from Erlitou to the Han: the vessel sets, each type's name and use, rank, inscriptions, the Qin–Han turn to everyday wares**; the skulls-in-a-yan point and a Gansu inventory dropped. |
| `cnh-082` piece-mould casting | 6 | 5 → 7 | **The Erligang ding's mould count, the potter's ancestor and a mould-reuse dispute dropped (their sources unreadable); `Main use c. 1600 – 256 BCE`; the full casting sequence, the Houma pattern blocks, the lost-wax debate with no start date asserted; pinyin joined, kuàifànfǎ**. |
| `cnh-083` ding | 6 | 5 → 7 | **A measurement, a dateless row and a span matching no event replaced by `First in bronze c. 1700 – 1600 BCE` and `First tetrapods c. 1640 – 1400 BCE`; the nine-ding legend told from the *Zuo Zhuan* and the *Shiji* (the Si River search)**; the Hou Mu Wu given no weight, only the museum's "heaviest", attributed. |
| `cnh-084` Shang bronze decoration | 7 | 5 → 8 | **Counts off the line, now `Dense patterns c. 1500 – 1300 BCE` and `High relief c. 1200 BCE`; patterns cut into the mould sections, the ground spirals and flanges, Loehr's five styles and their confirmation by excavation, the meaning debate; "taotie" kept out of every question (`cnh-027`'s)**. |
| `cnh-085` Shang jade | 7 | 5 → 8 | **Hetian the usual guess but untested, and the "Hetian rind" on Fu Hao's jades shown by the Palace Museum's tests to be burial staining (Xu Lin 2020 [in Chinese]); the "commonest forms" given in Lopes's own words; counts off the line**; Fu Hao's 755 jades left to `cnh-075`. |
| `cnh-086` Shang chariot | 7 | 6 → 7 | **Every Zhou pit and Muye's 300 chariots removed; the vehicle from beyond the Urals by way of Mongolia, drivers buried face down with rein holders and repair kits (Rawson et al. 2020); `In use c. 1200 – 1046 BCE`; Chinese name 商代战车 ("war chariot") → 商代马车 / 商代馬車, Shāngdài mǎchē (the Yinxu Museum's term)**. |
| `cnh-087` Shang warfare | 7 | 5 → 8 | **Troop counts and a weapon count off the line, now `Recorded c. 1250 – 1046 BCE`; the shifting fang label, the Gongfang, Tufang and Renfang campaigns, the dagger-axe, Di Xin's Renfang campaign in day-by-day inscriptions**; the 13,000 against the Qiang kept in prose, credited to a modern tally. |
| `cnh-088` Shang capitals | 7 | 5 → 7 | **Places and a count off the line, now `Seats c. 1600 – 1046 BCE` / `Last seat c. 1250 – 1046 BCE`; the moves as each text gives them (the *Shiji* returning Pan Geng to Bo, the *Bamboo Annals* taking him to Yin, the 273 years after Niu); Zhengzhou's identification as Bo or Ao left open**; Huanbei mentioned, not used as a clue (`cnh-069`'s). |
| `cnh-089` Zhengzhou Shang City | 6 | 5 → 6 | **"24 km²" corrected to the museum's c. 13 km² walled within c. 25 km² of Shang remains, and the inner wall at 6,960 m (An Jinhuai); `In use c. 1509 – 1315 BCE` (radiocarbon) / `Found 1950`; unsourced foundation sizes, an "only piece-mould site" claim and "ten million residents" dropped**. |
| `cnh-090` Panlongcheng | 6 | 5 → 6 | **"Cast no vessels" corrected: the Xiaozui moulds, crucibles and bronze grains show local casting; the unsourced 7.5 ha and 64–110 ha dropped; `Early Shang c. 1500 – 1300 BCE` / `Found 1954`; the stray `translations` field emptied**. |

Read by eye. **Confusability**: the vessel sets (`cnh-081`), the casting (`cnh-082`), the ding (`cnh-083`) and the
decoration (`cnh-084`) each keep their own clues; the Hou Mu Wu stays `cnh-083`'s and `cnh-089`'s largest early Shang
cauldron is the Duling fangding, a different vessel. **Chinese names corrected**: `cnh-086` 商代战车 → 商代马车; `cnh-082`
pinyin kuàifàn fǎ → kuàifànfǎ. **Spellings fixed**: none; 0 hits. **Myth register**: the nine ding passing from Xia to
Shang to Zhou — the *Zuo Zhuan* (Duke Xuan 3) and the *Mozi*; the Qin capture and the Si River search in the *Shiji*;
the search carved on Eastern Han shrines (held for the summary). **Protected lines: unchanged** (none here). Locator
notes for the end: `cnh-089` and `cnh-090` have no point (each has its own article); `cnh-088` covers several sites.

### B10 — `cnh-091`–`cnh-100`, Shang: agriculture to burial practice (2026-11-09)

Run as before; 69 cited URLs, all answering at least once this session (three Europe PMC full-text addresses, whose
DOIs answer 403 here, returned 500 on the last retries; their papers were read and saved when they answered; one was
moved to its DOI, which opens). `cnh-092`'s third phrasing named the Huan River and tripped `check-cards`' scholar
rule (two capitalised words read as a name); it was reworded and the card re-applied. **The old cards' date lines
were counts almost to a row (two millets, 60+ wheat grains, 80.9%, 22 houses, 23 kilns, 269 tombs, a 60-day cycle, a
10-day week, 5 eclipses, 5 script stages, 50% radiogenic lead, 1,000 km, 1.6 tonnes, shell values of 250 and 100,
nao in threes, 167 skeletons, 61 thin sections, 20,000 graves, 200 unlooted), a Zhou bronze rule stood on the music
card, an 852 BCE "Chu supply" row on the cowries, one species' range was given to the whole cowrie family, and the
music card cited no source about Shang music.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-091` Shang agriculture | 7 | 5 → 7 | **Counts off the line, now `Practised c. 1600 – 1046 BCE`; foxtail millet the main crop, broomcorn minor, with rice and legumes; the isotope logic and the Zhengzhou diet; the king's harvest divinations and the *zhongren* field order (Zhu Yanmin [in Chinese]), their status an open question**; claims on walled papers dropped. |
| `cnh-092` Shang countryside | 7 | 5 → 7 | **A site's counts off the line, now `Dated c. 1600 – 1046 BCE`; the Huan valley survey's three settlement levels, Daxinzhuang and the Shandong salt camps added; "arrowheads" narrowed to hairpins**; the Guandimiao sources read from earlier saved copies. |
| `cnh-093` Shang calendar | 7 | 5 → 7 | **Counts off the line, now `Attested c. 1250 – 1046 BCE` / `Eclipses seen 1201 – 1181 BCE` (as on `cnh-073`'s protected line); the week formula, the lunar months and the ritual year *si* as one reconstruction**; a "13th month" left off (no open source states it). |
| `cnh-094` Shang writing | 7 | 5 → 7 | **Stages off the line, now `Written c. 1250 – 1046 BCE` / `Modern shapes c. 200 BCE`; "the only primary script still in use" credited; the script's sphere across Korea, Japan and Vietnam from a French report, the Paekche row dropped (its source walled)**. |
| `cnh-095` Shang neighbours | 7 | 5 → 7 | **Percentages, distances and counts off the line, now `Exchange sphere c. 1500 – 1000 BCE` / `Chariots arrive c. 1200 BCE`; who the neighbours were — the fang label, the Zhou, the north (horses, face-down burials with northern knives), the south (Panlongcheng, Xin'gan, Wucheng)**; the glossary's 1,000 km converted as 620 miles. |
| `cnh-096` Shang bronze | 7 | 5 → 7 | **The recipe, tonnage and distance off the line, now `Dated c. 1600 – 1046 BCE` / `Lead arrives c. 1400 BCE`; a percentage out of the questions; the elite's pure copper against remelted metal, the Tonglüshan mine, the radiogenic-lead debate**; Fu Hao's 1.6 tonnes kept in prose, attributed. |
| `cnh-097` cowrie shell | 8 | 5 → 8 | **Counts and an 852 BCE row off the line, now `In use c. 3300 BCE – 220 CE` / `Peak c. 1600 – 650 BCE` (Peng and Zhu 1995); one species' range no longer given to the whole family; "the first money" credited to later writers; `undatable` now false**. |
| `cnh-098` Shang music | 7 | 5 → 7 | **Rebuilt (the old card cited nothing on Shang music) on *Music in the Age of Confucius*, Gao Zhixi and the National Palace Museum; the Zhou rank rule and the Dasikong percentages gone; `Attested c. 1300 – 1050 BCE`, the end Feng's figure, said so**; a "Zhuolu" that came from an Eastern Zhou site paper is gone. |
| `cnh-099` Shang craft workshops | 7 | 5 → 7 | **Counts off the line, now `In use c. 1250 – 1046 BCE`; the workshops themselves (Niu 2018 [in Chinese]): the foundries, the Tiesanlu bone industry, mould firing, vessel casting kept at the capital**; Guandimiao and the thin sections dropped (walled). |
| `cnh-100` Shang burial practice | 7 | 5 → 7 | **Counts off the line, now `In use c. 1250 – 1046 BCE`, with the 20,000 and 200 credited to Wang 2025 in prose; the waist pit sourced anew (most held a dog, usually a puppy); lineage cemeteries, weapons made for the grave, the Xisima DNA result; Wang's page range corrected**. |

Read by eye. **Confusability**: face-down burials appear in phrasings of `cnh-086` (drivers with rein holders),
`cnh-095` (northern knives) and `cnh-100` (east–west graves against the north–south norm) — three different details,
kept; crops (`cnh-091`) against villages (`cnh-092`); the calendar's cycles (`cnh-093`) against the eclipses on
`cnh-073`'s protected line. **Chinese names**: none corrected; the descriptive phrases 商代历法, 商代文字, 商代音乐 and
商代葬俗 match no open page whole, and `cnh-092`'s 商代农村 might be better as 商代乡村 — for the owner. **Spellings
fixed**: none; 0 hits. **Myth register**: no rows. **Protected lines: unchanged**.

### The first hundred, in sum

`cnh-001`–`cnh-100` (the whole of the Mythology deck, Neolithic China and the Xia, and the first sixty of the Shang)
are done: 534 sources became 699 and 83 glossary entries were rewritten. `cnh-audit.js --range=cnh-001:cnh-100` reads
53 of 100 cards clean; what remains is 21 cards with an advisory `W.not-why` (a Think-it-through question opening "How"
or "Did"), 11 `L.missing` (below), 5 `Z.reading?` leads that are polyphones or the place-name *tóu* (Erlitou, Shaokang,
the White Snake), 4 picture captions naming their source, 3 cards without a picture and one false duplicate (a Commons
thumbnail name). The `check-cnh-spellings.js` baseline of 5 cards and 13 hits is now 2 and 6: the two card hits are on
protected lines (`cnh-012`'s "Shû King", `cnh-014`'s "Tai Kang"), the four glossary hits on entries outside the hundred
(`Liezi`, `Liu_Xin_(scholar)`, `Lü_Buwei`, `Wuxing_(Chinese_philosophy)`). Commons answered 429 to the session's one
test call, so no picture pass was run and "Pictures to redo" holds a line for each of the hundred. Fifty agents worked
two cards each, never more than ten at once (for one short stretch eleven ran, one launched before a slot freed;
nothing was relaunched). Each batch was applied alone and committed with its docs.

What the hundred found, again and again:
- **Myth told as history, and dated by legendary kings.** "Placed under Ku from 2436 BCE", Fuxi's 2852 BCE on the
  dragon, Huangdi's 2697 BCE on the fenghuang, the qilin and Zhuolu, Yao's 2357 BCE on the Three Sovereigns, the Xia's
  2070 BCE on a region, a text and a forged chapter. Every story is now told as its text's, and dated by the text.
- **A transmitted text read as a record.** The Songs of the Five Sons as a Xia document (it is a 4th-century-CE
  forgery), the *Shanhaijing* as a Zhou text of 1122 BCE, Zhang Heng as the oldest telling of Chang'e, the *Bamboo
  Annals*' burial dated by a king's death, the Canon of Yao as a record of Yao.
- **A modern label as ancient fact.** "The Chinese dragon" as one creature, the taotie's name as the Shang's own, the
  type-site names as peoples, "Xia culture" for Erlitou, the Three Sovereigns as one list, the Zhouli's heaven and earth
  read back onto Liangzhu jade.
- **Counts on the date line.** Nearly every Neolithic and Shang card carried areas, counts, weights and percentages as
  rows; all are now in prose, attributed, or gone.
- **A figure no source gives.** Liangzhu's 3,000 workers, 24 km² for Zhengzhou, 875 kg for the Hou Mu Wu, 13,000 men
  against the Qiang, a "10 people to 1 animal" ratio, the 1899 "prescription" story, Sanxingdui's end in 1150 BCE.
- **Converted dates.** Agents twice turned a source's cal BP into BCE themselves (`cnh-042`, `cnh-047`); both were put
  back to the printed form and every later agent was told never to convert.
- **The one-language cap.** `cnh-001` and `cnh-002` cited five French articles each; every card now has at most one
  source per non-English language.

**The Chinese name.** All hundred carry `hanzi`, `traditional` and `pinyin`; corrected were `cnh-032` (十殿阎罗 →
十殿阎王), `cnh-086` (商代战车 → 商代马车) and five pinyin forms (Hòuyì, Shānhǎijīng, sìxiàng, Yígǔpài, kuàifànfǎ). Descriptive
phrases matching no open page whole are listed above for the owner. **Pinyin, for the owner**: the official
orthography would join 夏朝, 商朝 and 禹贡; the collection keeps Xià cháo, Shāng cháo and Yǔ gòng.

**The myth register** was confirmed or corrected on every row it opened with but one (the *Fengsu tongyi* as the source
of Nüwa moulding people, unreachable with ctext shut), and gained rows for Penglai, the Eight Immortals, the White Snake
and Mazu. Held for it from the Xia and Shang batches: the succession from Yu to Qi in three versions (Mencius, the
*Rongchengshi*, the *Bamboo Annals*), Jie as the bad last king (a pattern, after Lewis), Tang's self-offering for rain
(the *Lüshi Chunqiu*, five years of drought) and the nine ding passing from Xia to Shang to Zhou (the *Zuo Zhuan*, the
*Mozi*, the *Shiji*'s Si River search).

**The protected cards** (`cnh-007`, `008`, `010`, `011`, `012`, `014`, `016`, `039`, `055`, `057`, `058`, `068`,
`073`, `074`) kept their `answerDate`, `undatable` and `timeline` byte for byte through every apply (diffed after each).
Every background now carries the years on its card's line. Rows flagged for the owner, left as they stand: `cnh-014`
"Confucius names 2 men" (in *Analects* 14.5 Nangong Kuo names them and Confucius does not reply); `cnh-039` "Made a god
1594" (one study dates the Wanli title 1614) and "Named a sage 1856" (resting on Doré alone); `cnh-058` "Defections from
Kong Jia, 4 reigns earlier" (three reigns, on the king list).

**Hosts.** ctext.org, which answered at the session's start, refused every agent from the first batch on; ScholarSpace
(Hawaiʻi) and Project MUSE began showing bot checks mid-run, and PMC's full text a reCAPTCHA, with Europe PMC's full
text intermittently returning 500. Claims that rested only on what could no longer be read were dropped, not kept on
trust; several well-known figures left the cards for that reason alone (Liangzhu's dam volumes, the 899 BCE eclipse,
the Erligang ding's mould count).

**For the owner, outside the hundred**: `cnh-101` gives the Hou Mu Wu ding as 875 kg in a question (the National Museum
of China: 832.84 kg); `wh-148` dates Longshan 3000 – 2000 BCE (now 3000 – 1900 on `cnh-050`).

### Locators (2026-11-09, the first hundred)

None was added or moved, so `migrate-places.js` was not run. Wikipedia's API answered 429 to every call at the end of
the run, and `add-locators.js` fetches every coordinate (none is ever typed), so the six sites the hundred lacks points
for wait for a later pass, each with its article: `cnh-053` Sanxingdui ("Sanxingdui"), `cnh-063` Erlitou site
("Erlitou", labelled "Erlitou site"), `cnh-075` tomb of Fu Hao ("Tomb of Fu Hao", at Xiaotun), `cnh-080` Xibeigang
("Xibeigang", the cemetery about 800 m north of Wuguan), `cnh-089` Zhengzhou Shang City ("Zhengzhou Shang City") and
`cnh-090` Panlongcheng ("Panlongcheng"). `L.missing` is deliberate on five: the mythic `cnh-019` Kunlun, `cnh-021`
Penglai and `cnh-031` Diyu, the region `cnh-052` Central Plain and the many-site `cnh-088` Shang capitals. Points to
review: `cnh-012` (Yu the Great) and `cnh-068` (Tang of Shang) carry the Xia's and the Shang's region on a card about
one figure; `cnh-049` Liangzhu jade carries the culture's region; `cnh-047`'s point is Chifeng city, not a Hongshan
site; `cnh-048`'s lies about 40 km south-west of the Liangzhu site.

### B11 — `cnh-101`–`cnh-110`, Shang: royal women to what the record says (2026-11-12)

The second hundred's first batch, run as the first hundred's were (`AGENT.md`, the notes file, two cards an agent, at
most ten at once); every draft read by eye, fixed by hand where needed and prechecked again before `batch.sh` applied
it. All cited URLs answered this session; the National Museum of China page (`cnh-101`) resets intermittently and was
read and saved when it answered. **Pictures were not touched** (Commons and the Wikipedia API answered 429 to the
session's one test call). **The old cards put counts on nearly every line (875 kg, 81 and 68 graves, "800 lords",
"28 of 38", "7 families", 90% and 240,000 records, 7,083 radiocarbon dates, 1,000 km), dated the Zhou account "from"
1046 BCE, gave a Location and a Result row to Muye, read a Zhou ode's "beacon of Yin" as the Shang's own words, and
credited 1122 BCE to 19th-century reference books.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-101` Shang royal women | 6 | 5 → 6 | **The 875 kg row and the question's weight gone; the Hou Mu Wu ding now 832.84 kg (National Museum of China) in prose; the Dasikong grave counts dropped (a lineage cemetery, not royal women); the line `Attested c. 1250 – 1046 BCE`**; the fu and hou titles, marriages out, the childbirth divinations; a moved Columbia URL fixed. |
| `cnh-102` Di Xin | 7 | 5 → 7 | **The cruelties told as the *Shiji*'s and the "Mu shi" charge as the oldest; the oracle bones' Renfang campaign added; the bad-last-ruler pattern and the view that Daji was invented; Zigong's doubt from the *Analects***; the "greased" beam (a later gloss) dropped. Protected: the line stays (1105 flagged below). |
| `cnh-103` fall of the Shang | 7 | 6 → 7 | **The "800 lords" count off the line, now `Dated 1046 BCE` / `Also dated 1040 BCE` / `Traditional 1122 BCE`, each said whose (the Project, Nivison, Liu Xin); the *Shiji*'s story told as its; the radiocarbon range from Feng**; the "music masters" are the two chief preceptors; the Stag Terrace treasury (only in the received "Wu cheng") dropped. Pinyin Shāng cháo mièwáng. |
| `cnh-104` Battle of Muye | 7 | 5 → 7 | **Location and Result rows off, now `Fought 1046 BCE` / `Also dated 1044 BCE` (one reading of the Li gui) / `Traditional 1122 BCE`; the army sizes all the *Shiji*'s (300 chariots, 3,000 "tiger" warriors, 45,000, the lords' 4,000, Di Xin's 700,000), the old card's 4,000 against Mencius's 300 corrected; the Li gui's *jiazi* morning; the pestles as the "Wu cheng" Mencius doubted**. |
| `cnh-105` Zhou account of the Shang | 6 | 5 → 6 | **Counts and a "from" value off, now `Composed c. 1046 – 771 BCE`; rebuilt on the "Numerous Officers" and the "Announcement about Drunkenness", the "Yin let fall its command" formula (and the Da Yu ding), the Mandate read as legitimation, the oracle bones against the account**; the Muye material left to `cnh-104`. |
| `cnh-106` Shang in later memory | 6 | 5 → 6 | **The "beacon of Yin" is a Zhou ode put in King Wen's mouth, not the Shang's own warning; the family count off, now `Dynasty fell 1046 BCE` / `Shiji written c. 100 BCE` / `Bones identified 1899`; Song and its hymns, Confucius's Song forebears, the *Fengshen yanyi* (no year on any open page, so no row)**. |
| `cnh-107` oracle bone archives | 6 | 5 → 7 | **Counts off, now `Inscribed c. 1250 – 1046 BCE`; rebuilt as evidence: written at the time and never edited, but the king's concerns; the record starts with Wu Ding; fragments and the *Jiaguwen heji*; diviner groups; writing on perishable materials lost**; a compendium row (1978 – 1982) cut as dating the book, not the archive. Pinyin lower-cased (jiǎgǔ dàng'àn). |
| `cnh-108` Shang chronology | 6 | 5 → 6 | **1122 BCE now Liu Xin's traditional reckoning (Pankenier), not Giles's and Mayers's; the radiocarbon count off; `Conventional c. 1600 – 1046 BCE` / `Traditional end 1122 BCE` / `Eclipses 1201 – 1181 BCE`; 841 BCE as the first secure year; the *Bamboo Annals*' 1027 BCE**. |
| `cnh-109` Shang in the Bronze Age world | 6 | 5 → 6 | **Rebuilt as a comparison, claiming no contact with the west: the chariot beyond the Urals and its arrival, one horse lineage, Seima-Turbino tools, a Hittite horse text beside an oracle-bone search for a paired horse, wheat; the carnelian distance and the exchange row (`cnh-095`'s) off the line**; an uncited closing claim dropped. |
| `cnh-110` Shang record | 6 | 5 → 8 | **"Dated years none before 841" (not a date) now `First firm year 841 BCE`; `Inscribed bones c. 1250 – 1046 BCE` / `Shiji compiled c. 100 BCE`; unsupported claims dropped (no laws or accounts, women only as consorts, a "Zhou invention" cited to Lee who does not say it)**; the small pit graves, the *Shiji*'s own word that the Three Dynasties' years cannot be examined. |

Read by eye. **Confusability**: three drafts gave a phrasing to Song keeping the Shang sacrifices (`cnh-103`, `cnh-106`,
`cnh-116`); `cnh-103`'s was rewritten (the court emptying from within); "Yin let fall its command" stayed `cnh-105`'s
and `cnh-117`'s phrasing went to Dong Zhongshu's omens; answer words in phrasings cleared on `cnh-105` ("Zhou"),
`cnh-107` ("bone"), `cnh-108` ("Shang"), `cnh-109` ("bronze"). **Legend**: every Zhou-conquest story is now the
*Shiji*'s, the "Mu shi"'s or the "Wu cheng"'s; whether the "Mu shi" is a genuine early Zhou text no open source said, so
the cards say nothing either way. **Chinese names corrected**: `cnh-103` pinyin (Shāng cháo, the house split), `cnh-107`
pinyin case; `商代王室女性`, `周人对商的叙述`, `后世记忆中的商`, `甲骨档案` and `青铜时代世界中的商` are descriptive with no
standard term (for the owner). **Spellings fixed**: none needed; 0 hits. **Myth register**: Di Xin as the bad last king
confirmed (the *Shiji*, the "Mu shi" charge the oldest, Zigong's doubt; the excavated *Rongchengshi* already tells of
evil last rulers, Lewis 2016); King Wen and King Wu: the 800 lords in both the *Shiji*'s Yin and Zhou annals, the
*jiazi* morning on the Li gui and in the *Hanshu*'s "Wu cheng" excerpt, the pestles Mencius's quotation; the Mandate:
the formula in the oldest *Shangshu* chapters and on the Da Yu ding. **Protected lines: unchanged** (diffed after the
apply). For the owner: `cnh-102`'s `Birth 1105 BCE` is in no scholarly source read — in Nivison 1999 1105 is the first
year of Di Yi's oracle-bone calendar, likely where it came from; the background says so, and the age rests on it.

### B12 — `cnh-111`–`cnh-120`, Western Zhou: the Zhou dynasty to the eastern colonies (2026-11-12)

Run as B11. Every cited URL answered. **Pictures were not touched** (Commons 429). **The old cards told the founding
legends in their own voice (King Wen's prison and the hexagrams, the Duke of Zhou's coffer prayer, his seven-year
regency as fact), gave the Three Guards a 1039 BCE end and a three-year length no source read prints, misread Mencius's
five ranks, took a "threefold scale" from a forged *Shangshu* chapter as fact, and misread an article twice on the
eastern colonies (the gold earrings are pre-Zhou; the graded bronze sets were dropped at Liulihe).**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-111` Zhou dynasty | 8 | 5 → 9 | **1046 BCE labelled the Chronology Project's, with 1027 BCE beside it; Houji's birth told as the "Sheng min" ode's and the *Shiji*'s; the end as the *Shiji* tells it (256 BCE, the nine ding to Qin)**; "35 years before the empire" and "outlasted every royal house" dropped or restated (the longest-lasting dynasty of ancient Chinese history). No picture (`I.none`). |
| `cnh-112` Western Zhou | 7 | 5 → 7 | **All three phrasings rewritten off siblings' angles (the move east, the bronzes, fengjian); 1046 and 1027 BCE labelled; the fall told as the *Shiji*'s; a stalagmite drought argument as one study's**; the unsourced "clan sign" contrast and the glossary's "1045 or 1047" dropped. |
| `cnh-113` King Wen | 7 | 5 → 7 | **The title told both ways (the *Shiji*: taken by himself in the year Heaven's charge came; later: given by his son); Youli and the hexagrams as the *Shiji*'s, with its own "perhaps"; the *Yijing* authorship a later tradition; the Da Yu ding crediting the mandate to him**. Protected: the line stays (rows flagged below). |
| `cnh-114` King Wu | 7 | 5 → 7 | **"One old reckoning allows him seven years" (against the line's 1043 BCE) dropped; Mengjin's 800 lords as the *Shiji*'s, the "Mu shi" oath and the coffer prayer as the *Shangshu*'s; the Li gui and the Tsinghua "Jinteng" added**; a kiln study cited for Hao removed. Protected: the line stays. |
| `cnh-115` Duke of Zhou | 7 | 5 → 7 | **The legend in the texts' voices: the metal-bound coffer chapter dated late Eastern Zhou by most scholars; the seven years and the handback the *Shiji*'s; the *Xunzi*'s claim that he held the throne itself; the "boy of 13" and a "three-year revolt" dropped**. Protected: the line stays (1035 flagged below). |
| `cnh-116` Rebellion of the Three Guards | 6 | 5 → 7 | **The count, the Result row and the unsourced 1039 BCE end off; now `Began c. 1042 BCE` and the timeline moved to `{at:-1042}` (set-timeline.js); the *Shiji* names two rebel brothers (a later chronicle adds Huoshu) and contradicts itself on the war's length; early bronzes record the eastern campaign**. |
| `cnh-117` Mandate of Heaven | 8 | 5 → 8 | **Centuries on the line made spans: `Attested c. 1046 – 771 BCE` / `Recast 206 BCE – 8 CE`; the Da Yu ding, three *Shangshu* chapters, the "Wen Wang" ode, Mencius's "mere fellow", Xunzi and Dong Zhongshu's omens**; "every later dynasty used it" (cited to a paper that does not say it) dropped. The He zun is on no page read, so the card does not name it. |
| `cnh-118` Tian | 7 | 5 → 7 | **`Attested c. 1046 – 771 BCE` / `Graph defined 100 CE` (the *Shuowen*, presented 121 CE, both in prose); Shang Di and its identification with Tian, Confucius at Yan Hui's death, the Mohists, Xunzi; the "man with a big head" reading of the graph (on no open page) dropped**; the mandate phrasing left to `cnh-117`. |
| `cnh-119` fengjian | 6 | 5 → 7 | **Mencius's five degrees corrected (the Son of Heaven, gong, hou, bo, and zi with nan as one, on four sizes of domain); the "threefold scale" from the *Shangshu* "Wu cheng" dropped; `Practised c. 1046 – 771 BCE`; "feudalism" given as a comparison, the word rendered "enfeoffment"; the Zuo Zhuan's "fences and screens" as the text's**; pinyin lower-cased (fēngjiàn). |
| `cnh-120` Zhou colonies in the east | 6 | 5 → 7 | **Two misreadings of Jaffe fixed (the earrings pre-Zhou; Liulihe's graded sets dropped later); `Under the kings c. 1046 – 771 BCE` / `As rival states 770 – 221 BCE`, the "from c. 1039" and the "over 20 states" count gone; the *Shiji* (King Wu) and the Zuo Zhuan (King Cheng, the Yin clans to Lu and Wey) side by side; the Ke lei and the Yihou Ze gui**. |

Read by eye. **Confusability**: the Song sacrifices stayed `cnh-116`'s and `cnh-106`'s angles (different details);
answer words cleared on `cnh-112` ("western"), `cnh-113` ("king"), `cnh-117` ("Heaven"), `cnh-120` ("Zhou"); `cnh-111`
tells the nine ding passing to Qin, so `cnh-190` was told to take another angle. **Legend**: the founding stories are
now the *Shiji*'s, the odes' and the *Shangshu*'s, each dated. **Chinese names corrected**: `cnh-119` pinyin case;
`东方封国` descriptive (for the owner: 诸侯国 names the states, not the colonisation). **Spellings fixed**: none needed;
0 hits. **Myth register**: Houji confirmed (the "Sheng min" ode, then the *Shiji*); the nine ding confirmed (the *Mozi*,
the *Shiji*'s Qin seizure); the Duke of Zhou's regency confirmed (the *Shiji*'s seven years; the *Xunzi*'s "trod the
register of the Son of Heaven"), the Tsinghua "Jinteng" read by one study as his accession — for the row; the Mandate:
the formula in four *Shangshu* chapters and on the Da Yu ding; the first fiefs the *Shiji*'s King Wu's, the Zuo Zhuan's
King Cheng's. **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-113`'s `Birth c. 1112 BCE`
is in no source read (1112 – 1102 BCE is the Project's reign of the Shang king Wending), nor its ages or places (Bi,
Cheng; the *Shiji* puts his last seat at Feng); `cnh-114`'s `Birth c. 1097 BCE` and ages likewise; `cnh-115`'s 1035 BCE
is Shaughnessy's second start for King Cheng — the Project gives none, and one study ends the regency in 1036.

### B13 — `cnh-121`–`cnh-130`, Western Zhou: Chengzhou to Zhou warfare (2026-11-12)

Run as B11. Every cited URL answered. **Pictures were not touched** (Commons 429). **The old cards carried the Han
ritual books' schemes as Western Zhou fact (the nine-seven-five-three-one ding rule, the 2,500-man *shi*, the 900-mu
well-field, zongfa's "arithmetic"), dated the *Shijing*'s Shang hymns to the Shang (17th – 12th century BCE) and gave
it a "606 – 586 BCE" on no page read, dated the stone classics by Emperor Ling's reign (168 – 189 CE) instead of their
carving, counted "about 10,000" Western Zhou inscriptions where the source counts Shang and Zhou together, and gave
`cnh-124` a 950 – 800 BCE span for a reform its sources place around 850 BCE.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-121` Chengzhou | 6 | 5 → 7 | **c. 1036 BCE credited to one modern reckoning (King Cheng's first year 1042 BCE puts the "Shao gao" in 1036); `Founded c. 1036 BCE` / `Court moved 770 BCE`; the He zun's "dwell in the central land", the oldest written *Zhongguo*; the eight armies stationed there**; Mayers and an unrelated fuel study dropped. The Wangcheng-or-Chengzhou question left out (every source on it refused). |
| `cnh-122` Zhou royal ritual | 7 | 5 → 7 | **The ding-allowance row (a Warring States scheme, `cnh-124`'s subject) off the line; a paper stating as fact that the Duke of Zhou made the rites dropped; the cult taken over from the Shang, the appointment ceremony (king facing south), the temple hymns' feast for the stand-ins of the dead; no Western Zhou royal tomb excavated**. |
| `cnh-123` Western Zhou bronze inscriptions | 6 | 5 → 6 | **The counts off, now `Cast c. 1046 – 771 BCE`; "more than ten thousand" is Shang and Zhou together, about 60 fully dated; the Li gui, the Da Yu ding, the Shi Qiang pan, the Mao Gong ding; the usual pattern of an inscription; the four-element dates and the Project's use of them; the texts chosen to please the court**. |
| `cnh-124` Zhou ritual reform | 6 | 5 → 6 | **Reframed as modern scholars' reconstruction that no ancient text records; `Dated c. 850 BCE` / `In force c. 850 – 600 BCE`, the timeline moved to `{from:-0850,to:-0600}`; the ding scale "described in Warring States texts", graves not always matching it**; a burial from before the reform offered as proof dropped. |
| `cnh-125` zongfa | 6 | 5 → 8 | **The rules told as the Han *Liji* states them (the great line's tablet kept a hundred generations, lesser lines moved after five, no marriage within a surname), the tidy scheme a later account; lineages, marriage alliances on bronzes, the Lai pan's eight generations; `Practised c. 1046 – 771 BCE`**; the odes' root-and-branch reading and Mencius's ranks dropped; pinyin lower-cased (zōngfǎ). No picture. |
| `cnh-126` Book of Documents | 8 | 5 → 9 | **Which chapters are held genuine (about a dozen Western Zhou; the Yao and Shun chapters later on their own showing); Mei Ze's Old Text forgery (317 – 322 CE) and the Tsinghua slips; the stone classics `Cut in stone 175 CE`; `Oldest chapters c. 1046 – 771 BCE` / `Passed to court 179 – 157 BCE`**; the "palace copies burned over three months" claim (on no page read) dropped. |
| `cnh-127` Classic of Poetry | 8 | 5 → 8 | **Counts and the Shang-era hymns off; `Dated c. 900 – 500 BCE` / `Also dated c. 1200 – 600 BCE`, each said whose; the 3,000-to-305 cut credited to the *Shiji* and set against the Wu envoy hearing the songs in Lu in 543 BCE; the Shang hymns as tradition, composed in Song on the modern view; "Sheng min" as a temple ode**. |
| `cnh-128` Zhou reckoning of the year | 6 | 5 → 6 | **`Inscribed c. 1046 – 771 BCE` / `Double dawn 21 April 899 BCE`, the eclipse said to be the Chronology Project's calculation and its visibility at Zheng questioned; the *Shiji*'s three dynastic calendars (Han) against the bronzes' looser practice; the day-cycle count and the 256 BCE end off**. No picture. |
| `cnh-129` well-field system | 7 | 5 → 7 | **No longer Zhou fact: Mencius's advice to Teng, his one ode for evidence, few historians think it was carried out; what the bronzes show (fields counted in named places); Shang Yang's abolition as tradition, Wang Mang's revival; `Attested c. 380 – 300 BCE` / `Revival decreed 9 CE`**; pinyin lower-cased (jǐngtián zhì). No picture. |
| `cnh-130` Zhou warfare | 7 | 6 → 7 | **Both counts off (the 2,500-man *shi* a later commentary's), now `Practised c. 1046 – 771 BCE`; rebuilt on the bronzes: the six armies of the west and eight of Yin, the Xiao Yu ding's own count, the Yu ding's rebel Marquis of E, lineages manning units, one-campaign commands; the odes' 3,000 chariots attributed and flagged**. |

Read by eye. **Confusability**: the Li gui appears in phrasings of `cnh-104` (the *jiazi* day) and `cnh-123` (the
morning star and the scribe's reward) — two details, kept; answer words cleared on `cnh-122` ("royal"), `cnh-123`
("Zhou"), `cnh-124` ("ritual"), `cnh-126` ("book"), `cnh-127` ("classic"), `cnh-128` ("Zhou", "year"); a 900-mu figure
in `cnh-129`'s phrasing read as a year, reworded. **Legend**: the Duke of Zhou as maker of the rites, the well-field
and the five ranks are now later texts' schemes. **Chinese names corrected**: `cnh-125` and `cnh-129` pinyin case;
`周代王室礼仪`, `周代礼制改革` and `周代战争` descriptive (for the owner: 西周战争 would fit `cnh-130`'s scope); `周历` the usual
name, though no open page printed 周曆 in that sense (周正 is the *Shiji*'s term). **Spellings fixed**: none needed; 0
hits. **Myth register**: Houji confirmed again (Fleming 2024 calls the mother "Lady Shengmin", so `cnh-127` says "his
mother"); Yao and Shun: the Canons "on their own showing" later compilations; the Mandate: as the row. **Protected
lines**: none in this batch; the 23 diffed unchanged. Sourcing note for the owner: `cnh-123` and `cnh-130` cite Eno's
open teaching translation of the inscriptions, which asks to be replaced by Cook and Goldin's source book where that is
available; it is not open here.

### B14 — `cnh-131`–`cnh-140`, Western Zhou: the Xianyun to the Western Zhou legacy (2026-11-12)

Run as B11. Every cited URL answered (one Cambridge chapter DOI redirects to its paywalled page). **Pictures were not
touched** (Commons 429). **The old cards put a converted regnal year naming a man ("King Xuan's 1st year, c. 827 BCE")
and a "later called Xiongnu" row on the Xianyun's line, spelt "Quan Rong" and "Gong He", called the 776 BCE eclipse
"beyond dispute", put Yin Jifu's campaign in King Xuan's first year (the *Bamboo Annals* give the fifth), denied that
any ode names Baosi (the "Zheng yue" does), turned one article's point about ewers into "all the heartland bronzes come
from hoards", and gave the move east a count ("Kings at once 2") and a label naming a man.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-131` Xianyun | 5 | 5 → 8 | **The three old rows off; `Battle dated 816 BCE` (one dating of the Duo You ding battle) / `Capital sacked 771 BCE`; rebuilt on the contemporary bronzes (the Duo You ding, the Guo Ji Zibai pan, the Xi Jia pan) and the odes; the Xiongnu link only later commentators' identification**; a Late Shang burial paragraph never tied to the Xianyun dropped. |
| `cnh-132` King Mu | 6 | 5 → 7 | **"Quan Rong" → Quanrong; the *Mu tianzi zhuan* dated as buried early in the 3rd century BCE and robbed in 279 CE, its core argued Western Zhou; the "Lü xing" redemption code; 976 – 922 BCE the Project's, with 957 and 956 BCE as other reckonings**. Protected: the line stays (rows flagged below). |
| `cnh-133` King Li | 6 | 5 → 7 | **The reign as the *Shiji*'s story; the speeches (the shaman's spying, the Duke of Shao's dam, Rong Yi's monopoly) sourced to the *Guoyu*, a Warring States compilation, in Chinese; the king's own tureen and bell as evidence of his time; one study's 870 BCE accession**. Protected: the line stays. |
| `cnh-134` Gonghe regency | 6 | 5 → 6 | **The count and the row naming King Xuan off; `Dated 841 – 828 BCE` (the Project) / `Also dated 850 – 837 BCE` (Zhang 2023); 828 BCE the regency's last year (King Li's death), 827 BCE King Xuan's first; "Gong He" and "Baron" → He, the Earl of Gong; the two readings (the *Shiji*'s two dukes, the *Bamboo Annals*' He); the Hefu inscriptions**. No picture. |
| `cnh-135` King Xuan | 6 | 5 → 7 | **Yin Jifu's Xianyun campaign no longer in the first year; the Lai pan (at least 43 years) and the Xi Jia pan as bronzes of his time; the Qianmu defeat and the census blame told as the *Guoyu*'s and the *Shiji*'s**; the remonstrance-and-suicide story (from Giles, not re-read) dropped. Protected: the line stays. |
| `cnh-136` King You | 6 | 5 → 7 | **The 776 BCE eclipse told as a dispute (not visible at the Zhou capital; one study prefers 781 BCE); the beacons as the *Shiji*'s beside the *Xinian*'s account without them; the two kings from the *Bamboo Annals* and the *Xinian***. No picture. Protected: the line stays (795 flagged below). |
| `cnh-137` Baosi | 6 | 5 → 6 | **The "Zheng yue" ode names her, the earliest mention (Legge dates it to the reign); the dragon foam as the *Shiji*'s retelling of the *Guoyu*; the "evil woman" pattern; the *Xinian* without beacons**. Pinyin Bāosì (the house form). Protected: the line stays. |
| `cnh-138` sack of Haojing | 6 | 5 → 6 | **Location and Result rows off, now `Sacked 771 BCE`; "Quan Rong" → Quanrong; the *Bamboo Annals*, the *Shiji* and the *Xinian* told apart; the raid as the last phase of the Xianyun wars (Li Feng)**; a claim that Chavannes doubted an ally (on no page read) dropped. |
| `cnh-139` Zhou move east | 6 | 5 → 7 | **The count and a label naming a man off; `Dated 770 BCE` / `Also dated 769 BCE` (Legge's conversion of the *Bamboo Annals*) / `First reign 770 – 720 BCE`; the two kings as each text tells them (the duke of Guo's candidate; the *Xinian*'s Yuchen, King Hui of Xie, 21 years)**. |
| `cnh-140` Western Zhou legacy | 6 | 5 → 7 | **"In the flight of 771" (not a date) → `Hoards buried c. 771 BCE` after `Span c. 1046 – 771 BCE`; the ewers claim cut back to what the article says; the royal line's 515 more years at Luoyi, the regional states draining and keeping the court, which *Documents* chapters are held genuine, Confucius's inheritance**. The Zhuangbai hoard left out (no open URL served its sources). |

Read by eye. **Confusability**: the *Xinian*'s siege of the heir in Shen was a phrasing on both `cnh-136` and `cnh-138`;
`cnh-138`'s now gives the *Shiji*'s plunder at Mount Li; "king" cleared from phrasings of `cnh-132`, `cnh-133`, `cnh-135`
and `cnh-136`; the two-kings angle stays `cnh-139`'s. **Legend**: Baosi's laugh and the beacons are the *Shiji*'s, set
against the *Xinian*; King Mu's journey a tomb text's. **Chinese names**: none corrected but `cnh-137`'s pinyin;
`镐京陷落` and `西周遗产` descriptive (犬戎之乱 is the usual name for the sack, for the owner). **Spellings fixed**: "Quan Rong"
on `cnh-132` and `cnh-138`, "Gong He" on `cnh-134` — the batch's 3 card hits are now 0. **Myth register**: the Gonghe
regency confirmed (the *Shiji*'s two dukes; He in the *Bamboo Annals* and the *Zhuangzi*; the *Xinian* gives fourteen
years but whether it names He was not confirmed; Zhang 2023's 850 – 837 BCE); Baosi: the "Zheng yue" ode is earlier
than the *Shiji*, the *Lüshi Chunqiu* drum version not checked; the two kings: the *Xinian* makes Yuchen the dead king's
brother, the *Bamboo Annals* a son, and the ruler is King Hui of Xie (the row had it inverted — corrected). **Protected
lines: unchanged** (diffed after the apply). For the owner: `cnh-132`'s `Birth 992 BCE` is in no source read and its
age (69–70) contradicts the *Shiji* (fifty at accession, 55 years) and the "Lü xing" (a hundred); `cnh-136`'s `Birth
795 BCE` and both ages are in no source read; `cnh-137`'s 781 – 771 BCE is the conventional reign, which Zhang 2023
moves to 790 – 780 BCE. `cnh-133`'s and `cnh-135`'s rows agree with the sources.

### B15 — `cnh-141`–`cnh-150`, Eastern Zhou: the Eastern Zhou to Chengpu (2026-11-12)

Run as B11. Every cited URL answered this session (Eno's two Indiana ScholarWorks handles, on `cnh-147` and `cnh-148`,
returned 500 at the last check after answering earlier; their pages were saved, and the handles are kept). **Pictures
were not touched** (Commons 429). **The old cards called both halves of the Eastern Zhou "named after books", read
Mencius's "no righteous wars in the Spring and Autumn" as about the age (he meant the book), put the Zuo Zhuan's
speeches down as a record and gave it a 468 BCE end on no open page, had the Earl of Zheng send "to condole" with the
king he had wounded (the text says "to comfort"), put the hegemon system on a line of counts, called Guan Zhong "a
native of Qi" (the *Shiji*: of Yingshang), gave Duke Wen nineteen years among the Di (twelve; nineteen is the whole
exile), cited a dissertation about 6th–7th-century CE north China for him, and turned Chengpu's spoils presented to the
king into "casualties".**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-141` Eastern Zhou | 7 | 5 → 7 | **The count and a note off, now `Dated 770 – 256 BCE` / `Also dated 770 – 249 BCE`; the Warring States name given in retrospect, the Spring and Autumn sharing the Lu chronicle's name**; "one voice out of fifteen", "longer half by two centuries" and "longest dynasty" dropped as unsourced. |
| `cnh-142` Spring and Autumn period | 7 | 5 → 7 | **The count off, now `Dated c. 770 – 475 BCE` / `Also dated 770 – 453 BCE` / `Chronicle covers 722 – 481 BCE` (403 BCE in prose), the timeline moved to `{from:-0770,to:-0475}`; the name from the chronicle's title (it just means "annals"); the Mencius phrasing dropped (he meant the book)**; a Rong/Di/Man paragraph cited to a Late Shang paper dropped. |
| `cnh-143` Spring and Autumn Annals | 7 | 5 → 7 | **Confucius as author is Mencius's claim, and Mencius its earliest witness; written year by year by court scribes, not one author (Van Auken); two endings, 481 BCE (Gongyang, Guliang) and 479 BCE (Zuo); the counts off, now `Covers 722 – 481 BCE` / `One version ends 479 BCE`**. |
| `cnh-144` Zuo Zhuan | 6 | 5 → 7 | **The speeches one study's argument for their substance (Pines), set against the compilers' shaping; Zuo Qiuming as Sima Qian's story; `Chronicle years 722 – 479 BCE` / `Completed c. 300 BCE`; the 468 BCE end (on no open page) off the line and the glossary**. |
| `cnh-145` decline of Zhou royal authority | 6 | 5 → 6 | **`Began 771 BCE` / `King wounded 707 BCE` / `Also dated 706 BCE` (the *Shiji* as Chavannes converts it; Legge) / `Ended 256 BCE`; the regnal-year row and Chu's "c. 880 BCE" (Legge's estimate; the *Shiji* says only "in King Yi's time") off; the Xuge scene told as the Zuo Zhuan's ("to comfort the king")**. **Name corrected: 周室衰微 (Zhōu shì shuāiwēi), the *Shiji*'s phrase.** |
| `cnh-146` hegemon system | 6 | 5 → 6 | **The counts off, now `Dated 680 BCE` (the Juan meeting) / `Also dated 679 BCE` / `Royal grant 667 BCE`; the "system" the historians' name, the title unofficial, *ba* explained; the five hegemons one list of several (only Qi and Jin on both traditional lists)**; a dissertation cited for claims it does not make cut to its own pages. |
| `cnh-147` Duke Huan of Qi | 7 | 5 → 7 | **Kuiqiu: the *Shiji* dates the assembly 651 BCE, the line's 650 is Legge's — both in prose; the belt-buckle arrow, the land given to Yan, the bow for the king's meat told as the texts'**; a Song minister's speech (on no page) dropped. Protected: the line stays (Kuiqiu flagged below). |
| `cnh-148` Guan Zhong | 7 | 5 → 7 | **"A native of Qi" corrected (the *Shiji*: of Yingshang, which backs the line's birthplace); 720 BCE called a later reckoning; Bao Shuya's forgiven share, Confucius's answer to Zigong, the refused top rank; the *Guanzi* a later compilation**. Protected: the line stays (720 flagged below). |
| `cnh-149` Duke Wen of Jin | 6 | 5 → 7 | **Twelve years among the Di, nineteen in all; the exile tale a lost romance of about the 4th century BCE summarised in the Zuo Zhuan and excerpted in the *Guoyu*; the *Shiji*'s ages (43 at flight, 62 on return); Jie Zitui and Mianshang as the Zuo Zhuan tells it, the burning and the cold-food custom later legend**; an unrelated dissertation dropped. Protected: the line stays. |
| `cnh-150` Battle of Chengpu | 6 | 5 → 6 | **Location, Casualties (the spoils given to the king) and Result off, now `Fought 632 BCE`; every detail credited to the Zuo Zhuan or the *Shiji*, the 700 chariots hedged, 52,000 men an estimate**. Pinyin Chéngpú zhī zhàn. |

Read by eye. **Confusability**: the Lu chronicle is `cnh-143`'s; `cnh-142`'s phrasing takes only its name, and the
Heyang "hunt" stayed `cnh-149`'s; the Kuiqiu covenant is `cnh-147`'s and `cnh-160`'s, told the same way (651 BCE the
*Shiji*'s, 650 Legge's). **Legend**: the exile romance and Jie Zitui's burning are now later tales; the hegemons' list
is one list. **Chinese names corrected**: `cnh-145` (周王室衰微 → 周室衰微, the *Shiji*'s phrase), `cnh-150` pinyin; `霸主制度`
descriptive. **Spellings fixed**: none needed; 0 hits. **Myth register**: no Zhou row touched but the two kings (Eno
agrees); a row added for Jie Zitui. **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-147`'s
`Kuiqiu covenant 650 BCE` is Legge's figure — the *Shiji* gives 651 BCE; `cnh-148`'s `Birth 720 BCE` is in no source
read (a reference entry titles him c. 723 – 645 BCE) and the ages rest on it; `cnh-149`'s `Birth 696 BCE` is Giles's and
Mayers's only — the *Shiji*'s two ages are a year apart and Maspero makes him 71 at about 630 – 628 BCE. Audit note:
`cnh-152`'s `G.date` reads the wrong entry (`Da_Qi`, whose alias "Qi (Liu Yu)" loses its bracket) — `cnh-477`'s alias
may also catch glossary links for "Qi".

### B16 — `cnh-151`–`cnh-160`, Eastern Zhou: King Zhuang of Chu to the covenant meetings (2026-11-12)

Run as B11. Every cited URL answered this session. **Pictures were not touched** (Commons 429). **The old cards
carried years no source prints (Qi's fall in 220 BCE for 221, Tian He's 385 for 386, Jin's founding 1106 BCE as a
fact, Chu "in the chronicle from 684 BCE", Qin's Feizi in 908 BCE, Duke Xiang made a lord "from 776 BCE" — his second
year), told Goujian's gall and brushwood, the wine poured in the river and Xi Shi in their own voice, paired Qi with
the wrong glossary entry (`Da_Qi`, a 12th-century client state), cited Giles for an unrelated Chu Huan, a Jin paper for
Lu and a dissertation about 6th-century CE north China for Goujian and the covenants, and gave Song a founding year and
Lu two dateless rows.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-151` King Zhuang of Chu | 6 | 5 → 6 | **"The one southern ruler" among the hegemons → "often counted among" them; the tripods told as the Zuo Zhuan's (Duke Xuan 3) and the *Shiji*'s boast of broken hook-tips; the silent bird a *Shiji* story; Bi (597 BCE) from Pines 2018**. Protected: the line stays. |
| `cnh-152` Qi | 7 | 5 → 7 | **Two wrong years fixed (Tian He made marquis 386 BCE; Qi conquered 221 BCE); `Founded c. 1046 BCE` / `Usurped 386 BCE` / `Old line ends 379 BCE` / `Conquered 221 BCE`; the founder as the *Shiji*'s three stories; the glossary pairing moved from `Da_Qi` to `Qi_(state)`**; the Tian family's grain measures, the Linzi coin moulds. |
| `cnh-153` Jin | 7 | 5 → 7 | **1106 BCE labelled `Traditional` (Legge's table); the *Shiji*'s note that no reign years survive for the first five rulers; Tianma-Qucun's radiocarbon dates for the first settlers; `Usurped 678 BCE` / `Split recognised 403 BCE` / `Ended 376 BCE`, 402 BCE gone (agreeing with `cnh-162`)**; the Marquis Su bells. |
| `cnh-154` Chu | 7 | 5 → 7 | **684 BCE (on no page) dropped; `Kingship claimed c. 886 BCE` / `Kingship taken 703 BCE` / `Capital lost 278 BCE` / `Conquered 223 BCE`; Ying first made capital by King Wen, as the *Shiji* says; the Baoshan divination slips; the tripods left to `cnh-151`**. |
| `cnh-155` Qin | 7 | 5 → 7 | **908 BCE (in no source) → `Traditional 897 BCE` (Chavannes, from a later digest); `Made a lord 770 BCE` (not "from 776"); `Capital moved 350 BCE` / `Unified China 221 BCE`; the 177 followers credited to the *Shiji***; the "horse country" and "omen of evil" claims dropped. |
| `cnh-156` Lu | 7 | 5 → 8 | **Two dateless rows off, now `Chronicle 722 – 481 BCE` / `Ruler exiled 517 BCE` / `Destroyed 249 BCE` (no open source gives a founding year or 256 BCE); the royal rites as the *Shiji*'s account and disputed; Legge's opinions no longer fact**; a Jin paper dropped. |
| `cnh-157` Song | 7 | 5 → 7 | **The unsourced c. 1040 BCE founding off; `Bid to lead 641 – 637 BCE` / `Peace meeting 546 BCE` / `Destroyed 286 BCE`; the founding as the *Shiji*'s; Duke Xiang at the Hong from the Zuo Zhuan, with Sima Qian's note that some praised him; Mencius's "man of Song"; King Yan's bag of blood**. |
| `cnh-158` Yue | 6 | 5 → 7 | **`At war 510 – 473 BCE` / `Overthrown 333 BCE` (no source read prints 472 or 306 for Yue's end); the descent from Shaokang and Yu as the *Shiji*'s claim; tattooing, the boatman's song, infantry armies, Chu killing King Wujiang**; the sword of Goujian left out (its museum page would not connect). |
| `cnh-159` Goujian | 6 | 5 → 6 | **The gall as the *Shiji* tells it; the first battle, Fuchai's daily reminder and the fall of Wu as the Zuo Zhuan's; "sleeping on brushwood and tasting gall" a later idiom; Xi Shi an Eastern Han addition; the wine poured in the river (Giles alone) dropped**. Pinyin Gōujiàn. Protected: the line stays. |
| `cnh-160` covenant meeting | 6 | 5 → 6 | **Centuries and a count off, now `Famous covenant 650 BCE` / `Tablets written c. 442 – 424 BCE`; the blood rite credited to later commentators; the Houma and Wenxian oath texts as contemporary evidence; the 546 BCE peace told without a year (no page read prints it)**. Pinyin huìméng. |

Read by eye. **Confusability**: Xiong Qu naming his sons kings was a phrasing on `cnh-145` and `cnh-154`; `cnh-154`'s
now gives the Lu chronicle's "viscounts"; the tripods stay `cnh-151`'s; the Hong battle and the tiger skins stay off
`cnh-161`'s phrasings. **Legend**: Goujian's gall, Xi Shi and the Jin paulownia leaf are now the texts' stories.
**Chinese names corrected**: `cnh-159` and `cnh-160` pinyin. **Spellings fixed**: none needed; 0 hits. **Myth
register**: the nine ding (the Zuo Zhuan, Duke Xuan 3) as the row; the Duke of Zhou: the *Shiji* has him set the
Count of Wei over Song with a written charge. **Protected lines: unchanged** (diffed after the apply). Kuiqiu is 650
BCE on `cnh-160`, as on `cnh-147`'s protected line (Legge); the conventional 651 BCE (the *Shiji*, Chavannes) is
in `cnh-147`'s prose — for the owner, who may want 651 on both. `cnh-159`'s rows agree with the sources (496 is
Mayers's, 465 the *Bamboo Annals*'). Audit note: `cnh-152`'s `G.date` stays as a false lead (it reads `Da_Qi`).

### B17 — `cnh-161`–`cnh-170`, Eastern Zhou: Spring and Autumn warfare to Qin after Shang Yang (2026-11-12)

Run as B11. Every cited URL answered this session. **Pictures were not touched** (Commons 429). **The old cards put
"700 chariots, the largest force named" on a line (on no page read; the Zuo Zhuan's count at one battle), gave Legge's
402 BCE and a "BC" to the partition of Jin, read the "nine tripods struck by lightning" into the *Shiji*'s "the nine ding
shook", dated the Warring States "from 480, 403 or 376" with a count, put Su Qin and Zhang Yi's league on the seven
states' line, named men in Wei's rows, told the immigrant offer of the *Book of Lord Shang* chapter 15 (written after
Changping, 260 BCE) as Shang Yang's own reform, called Qin a "backward country" (a late image, Pines), put Shang Yang
in the Wei ruling house (it was Wey), and gave Li Kui's ever-normal granary "two thousand years".**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-161` Spring and Autumn warfare | 6 | 5 → 7 | **Counts and places off, now `Fought c. 770 – 475 BCE`; 700 kept only as the Zuo Zhuan's count at one battle; army sizes, battle lengths and noble command; the Jin crews dismounting in a pass and Wu's infantry armies**; Rawson (late Shang) and an unrelated Petersen dropped; the tiger skins and the Hong left to `cnh-150` and `cnh-157`. |
| `cnh-162` partition of Jin | 6 | 5 → 6 | **`Divided 453 BCE` / `Recognised 403 BCE` / `Dissolved 376 BCE`, Legge's 402 dropped, the timeline moved to `{from:-0453,to:-0376}`; the siege of Jinyang and the dukes keeping Jiang and Quwo from the Chinese *Shiji*; the lightning gloss dropped**; the years out of the phrasings. |
| `cnh-163` Warring States period | 8 | 5 → 8 | **The name given looking back (the *Shiji* already calls the kingdoms *zhanguo*; the *Zhanguo Ce* later); `Dated c. 475 – 221 BCE` / `Also dated 453 – 221 BCE` / `Also dated 403 – 221 BCE`, the timeline moved to `{from:-0475,to:-0221}` to meet `cnh-142`**; the silkworm simile, a Mencius anecdote and "one book because the rest were burnt" dropped; the glossary's "Zhanguo ce" fixed. |
| `cnh-164` seven warring states | 7 | 5 → 7 | **The Su Qin and Zhang Yi line (`cnh-178`'s and `cnh-179`'s) replaced by `Formed 403 – 386 BCE` / `Conquered 230 – 221 BCE`; the *Shiji*'s own count of seven ("caps and sashes"), the three Jin houses and the Tian, Qin and Chu as outsiders, the conquest state by state**. |
| `cnh-165` rise of Wei | 6 | 5 → 6 | **Rows naming men off, now `Ascendancy 424 – 340 BCE` / `Recognised 403 BCE` / `Destroyed 225 BCE`, a timeline set `{from:-0424,to:-0340}`; Guiling and Maling, the *Bamboo Annals*' 365 BCE for the move against the *Shiji*'s 340, King Hui before Mencius, Daliang flooded**; "the strongest state in China" dropped; the glossary's Zhongshan date corrected (408 BCE). Pinyin Wèiguó juéqǐ. |
| `cnh-166` Li Kui | 6 | 5 → 6 | **455, 407 and 395 BCE carried as a modern reckoning, 407 as one dating of a later tradition about the code; Li Ke and Li Kui as one man only on one modern view (the *Hanshu* lists two); the granary claim cut to what the source says (the principle in the Han granary proposed in 54 BCE)**. No picture. Protected: the line stays (flagged below). |
| `cnh-167` Marquis Wen of Wei | 6 | 5 → 6 | **The years out of the question; sibling angles (Qin's attack, Li Kui's five tests) replaced; his call for talent, Zixia as tutor, Duangan Mu leaping a wall (the *Mencius*), Zhongshan in 408 BCE; four unsourced claims dropped ("the dukes of Jin were puppets")**. Pinyin Wèi Wén Hóu. No picture. Protected: the line stays (flagged below). |
| `cnh-168` Shang Yang | 7 | 5 → 7 | **Born in Wey (衛), not the Wei ruling house; "about 350 BCE" dropped (in office from 359); the *Book of Lord Shang* a compilation (Pines; Duyvendak); the pole at the market gate, the dying minister's advice, the innkeeper and his own law, the body torn apart**. Protected: the line stays. |
| `cnh-169` Shang Yang's reforms | 7 | 6 → 7 | **The immigrant offer moved out (chapter 15, written a century later); `First decrees 356 BCE` / `Second decrees 350 BCE`; the 31 counties the biography's (the annals say 41); "Legalist" a later label; the Shuihudi statutes as the legacy**; Giles's "tithing" and Chen's "equality" dropped. |
| `cnh-170` Qin state after Shang Yang | 6 | 5 → 6 | **`Period 338 – 221 BCE` / `Royal title 325 BCE` / `Expanded south 316 BCE`, the 364 BCE row and counts off; "backward country" replaced by Pines 2012 (Qin within the Zhou world, its outsider image late); Sima Cuo and Shu, Fan Ju's advice, Lü Buwei, Ying in 278 BCE**. |

Read by eye. **Confusability**: the Su Qin league left `cnh-164` for `cnh-178`/`cnh-179`; the five tests stayed
`cnh-166`'s and the Qin attack `cnh-165`'s; Changping's figures go to `cnh-173` (the *Shiji*'s 400,000) and
`cnh-181`. **Legend**: the court speeches and the immigrant offer are now texts dated by their writing. **Chinese
names corrected**: `cnh-165` and `cnh-167` pinyin; `春秋战争`, `魏国崛起` and `商鞅变法后的秦国` descriptive. **Spellings**:
0 hits; a Fan Ju row added (the *Shiji*'s 範睢). **Myth register**: no rows. **Protected lines: unchanged** (diffed after
the apply). For the owner: `cnh-166`'s 455 and 395 BCE (and the ages) are in no source read, and the *Jin shu*'s credit
of the code to him could not be checked; `cnh-167`'s `Reigned 424 – 387 BCE` is the *Shiji*'s — Eno says "usually given
as 446 – 396", Legge 426 – 386; `cnh-168`'s death place "Qin" is loose (the *Shiji*: Mianchi in Zheng, by Qin's troops).

### B18 — `cnh-171`–`cnh-180`, Eastern Zhou: Warring States warfare to Maling (2026-11-12)

Run as B11. Every cited URL answered this session (one Sino-Platonic PDF returned 429 once; Eno's Indiana ScholarWorks handles on `cnh-171` returned 500 at the last check, as on `cnh-147`, after answering; the 5 MB Gutenberg *Shiji* timed out once). **Pictures
were not touched** (Commons 429). **The old cards' lines were counts almost throughout (a head bounty, 240,000 lost at
Yique, "over 400,000" at Shangdang, 480 catties of iron, 30 coppers a picul, 31 districts, "c. 102,100 killed" at
Maling — a figure no source gives), dated a crossbow killing to 599 BCE from the *Shiji*'s story (the Zuo Zhuan says
only that he "shot, and killed him"), gave Chengpu-era chariot counts as the largest force, put the Han's armour on the
iron card, said King Wuling "took Zhongshan in 305 BCE" (the *Shiji*: a peace for four towns, the state destroyed in
296), told the *Shiji*'s Su Qin as fact, had Zhang Yi die as Qin's minister in 310 (he died in Wei), counted Maling's
third-night fires at Giles's 20,000 (the *Shiji*: 30,000), and the card on Su Qin and Zhang Yi had no glossary entry.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-171` Warring States warfare | 6 | 6 → 8 | **Counts off, now `Dated c. 475 – 221 BCE` / `Also dated 453 – 221 BCE` / `Cavalry adopted 307 BCE`; peasant infantry under professional generals, iron, the crossbow, cavalry, wall-defence manuals, the *Sunzi*'s dating and the Yinqueshan *Sun Bin***; the head bounty and Zhongshan left to `cnh-169`, `cnh-173`, `cnh-174`. |
| `cnh-172` Chinese crossbow | 8 | 5 → 8 | **599 BCE dropped (the *Shiji*'s story set beside the Zuo Zhuan's, no year); `First known c. 500 – 400 BCE` / `Common c. 400 – 300 BCE` (one view, from the texts) / `Massed in battle 341 BCE`; how the trigger was cast and assembled; Maling's ten thousand crossbows from the *Shiji***; no open account of the earliest excavated triggers, so no find dates. |
| `cnh-173` mass infantry armies | 6 | 6 → 7 | **The counts off, now `Early use 506 – 476 BCE` / `In use 453 – 221 BCE` / `Battles 293 BCE, 260 BCE`; the army sizes the *Shiji*'s claims (240,000 heads at Yique; 400,000 surrendered at Changping), one recent study arguing the other side; Changping 260 BCE, not Chavannes's 259 for Shangdang**; the Shang Yang material left to its cards. |
| `cnh-174` King Wuling of Zhao | 6 | 5 → 7 | **Zhongshan corrected (a 305 BCE peace; destroyed 296 BCE); the court debate as the *Shiji*'s speeches taken from the *Zhanguo Ce* and read as rhetoric; one study's view of the reform as hiring Hu mercenaries; the refused royal title, the abdication, Shaqiu**. Pinyin Zhào Wǔlíng Wáng. Protected: the line stays (its rows agree with the *Shiji*). |
| `cnh-175` iron in the Warring States | 7 | 6 → 8 | **Rebuilt on the metallurgy (Wagner, Gilmour, Wayman and Michaelson, Lam) instead of texts; 513 BCE dropped (a regnal year no source converts); `Oldest casting c. 500 BCE` / `In wide use c. 400 – 300 BCE`**; the Later Han armour claim off. **Name corrected: 铁 → 战国铁器 (Zhànguó tiěqì).** |
| `cnh-176` Warring States coinage | 6 | 5 → 6 | **Lacouperie's dating, the 228 BCE and "30 coppers" rows off; `Earliest mint c. 640 – 550 BCE` (the radiocarbon-dated Guanzhuang foundry) / `Unified 221 BCE`; the regional types, Qi's knives and the Yan-occupation issue, the ban liang**; Li Kui's budget kept in prose, credited and hedged. |
| `cnh-177` Warring States cities | 6 | 5 → 6 | **`Period 453 – 221 BCE` / `Capital moved 386 BCE` / `Sacked 284 BCE`; the *Zhouli*'s market rules no longer fact; the *Kaogongji* city as prescription; Linzi's coin workshops; the 70,000 households the persuader's claim in the *Shiji*; sacks and capitals moving**; a why answer contradicting the background dropped. No single point (`L.missing`, deliberate). |
| `cnh-178` vertical and horizontal alliances | 5 | 5 → 6 | **The row naming Su Qin off, now `League formed 333 BCE` / `Joint attack 318 BCE` / `Unification 221 BCE`; the strategy from Eno; the 318 campaign's failure; the Su Qin league credited to the *Shiji*; the *Zhanguo Ce* largely fiction (Goldin on Maspero); Mencius's "thief of the people"**. |
| `cnh-179` Su Qin and Zhang Yi | 6 | 5 → 6 | **The *Shiji*'s story told as its, with Sima Qian's own admission that deeds were pinned on Su Qin; Su Qin's story a mid-3rd-century romance (Maspero), Zhang Yi real (minister in Qin 328 – 312 BCE, named by Mencius); the tomb manuscripts tie Su Qin to spying in Qi for Yan; `In office 328 – 312 BCE`; 333, 318 and 310 off**. **A new glossary entry, `Su_Qin_and_Zhang_Yi`** (the old card had none). |
| `cnh-180` Battle of Maling | 6 | 5 → 6 | **Location, Casualties (102,100, in no source) and Result off, now `Dated 341 BCE` / `Also dated 343 BCE` (the *Bamboo Annals*, from Maspero); the fires 30,000, as the *Shiji* says; Maspero's two-battles suggestion; Sun Bin's book recovered in 1972 and compiled early in the 3rd century BCE**. |

Read by eye. **Confusability**: Maling's tree and ten thousand crossbows stay `cnh-172`'s phrasing (out of `cnh-180`'s);
the Yinqueshan treatise `cnh-171`'s; Changping's royal levy at Henei was a phrasing on `cnh-173` and `cnh-181` —
`cnh-181`'s now takes the bought rumour; Li Kui's budget was on `cnh-166` and `cnh-176` — `cnh-176`'s now takes the
Guanzhuang mint. **Legend**: Su Qin's league and the Wuling debate are now texts' tellings. **Chinese names corrected**:
`cnh-175` (铁 → 战国铁器), `cnh-174` pinyin. **Spellings fixed**: none needed; 0 hits. **Myth register**: no rows.
**Protected lines: unchanged** (diffed after the apply); `cnh-174`'s rows agree with the *Shiji* as Chavannes converts
it. For the owner: the `Su_Qin` and `Zhang_Yi` glossary entries still give 333 / 318 / 310 BCE as fact; `cnh-234`'s
line gives 120 BCE for the Han iron monopoly, where Wagner gives 117 BCE.

### B19 — `cnh-181`–`cnh-190`, Eastern Zhou: Changping to the end of the Zhou (2026-11-12)

Run as B11. Every cited URL answered this session. **Pictures were not touched** (Commons 429). **The old cards gave
Changping "c. 700,000 dead, per Sima Qian" (the *Shiji*: 400,000 surrendered and killed, 450,000 in all) and a
converted "April 262 BCE", put the men's names in the Four Lords' date values with death years no source read prints,
dated the Jixia Academy by King Xuan's older reckoning and called it a "paid faculty", dated the *Zhanguo Ce* by Liu
Xiang's life with a chapter count and an unsourced "edition of 1146", dated the *Li Sao* "after 314 BCE" and by Qu
Yuan's life, gave the conquest of the six states an "Order" row, offered the "Jing Ke wounded the king" rumour (which
the *Shiji* itself rejects) as an equal version, and called the duchy of West Zhou "the Western Zhou".**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-181` Battle of Changping | 6 | 5 → 6 | **`Fought 260 BCE` only (the month, place, result and 700,000 off); the *Shiji*'s 400,000 and 450,000 credited and hedged; one recent study on the size of the losses; the Yongluo pits (found 1995) and the reading of the killing as slaughter, not burial alive**. |
| `cnh-182` Bai Qi | 6 | 5 → 6 | **The line's 332, 280 and 258 BCE in prose as one reckoning; Ying, Yiling and the title of Lord of Wu'an; Yique's heads as the *Shiji*'s; the sword at Duyou**. Protected: the line stays (flagged below). |
| `cnh-183` Jixia Academy | 7 | 5 → 7 | **"Jixia Academy" a modern English label (Eno); a community of clients of the state, not of one patron (Meyer); `Active c. 356 – 221 BCE` / `Peak 319 – 284 BCE`, with Xu Gan's late claim of a Duke Huan founding and both reckonings of King Xuan's reign in prose; Xunzi three times libationer; Mencius's absence a "perhaps"**; the chapter counts left to `cnh-850`. |
| `cnh-184` Four Lords of the Warring States | 7 | 5 → 7 | **Names out of the values, now `Active c. 299 – 238 BCE` (Mengchang's ministry to Chunshen's murder); the grouping shown in Jia Yi's essay quoted in the *Shiji*; the 3,000 retainers the *Shiji*'s; the 258 BCE relief of Handan (on no page read) out of the question**. |
| `cnh-185` Zhanguo Ce | 7 | 5 → 7 | **`Compiled c. 100 – 1 BCE` / `Edited 1146 – 1147` (two Song editions, Chavannes; the 1147 one recut the 33 chapters into ten); read by many scholars as fiction or practice speeches; Liu Xiang 77 – 6 BCE (Goldin) or 80 – 9 BCE (Giles)**; the Mawangdui manuscript left out (every host walled). |
| `cnh-186` Qu Yuan | 8 | 5 → 8 | **The *Shiji* story told as tradition; many Chuci poems read as shamans' songs; 311, 299 and 296 BCE from Chavannes's Chu annals; the line's 332, 314 and 295 BCE carried as Giles's and Mayers's reckoning**. Protected: the line stays (flagged below). |
| `cnh-187` Li Sao | 8 | 5 → 8 | **`Written c. 300 BCE` / `Collected c. 77 – 6 BCE`, agreeing with `cnh-029`; Qu Yuan's 332 – 295 BCE kept in prose as Giles's (as on `cnh-186`); what the poem holds, Liu Xiang and Wang Yi, the allegorical reading against its modern rejection, the authorship question**; "grief dispelled" (no source) dropped. |
| `cnh-188` Qin conquest of the six states | 7 | 5 → 7 | **`Fought 230 – 221 BCE` only; each fall in prose as Chavannes prints it (Han 230, Zhao 228, Wei 225, Chu 223, Yan 222, Qi 221); why Qin won (Eno; Pines); Li Si's bribery hedged; the Chu war's 200,000 and 600,000 the *Shiji*'s**. |
| `cnh-189` Jing Ke | 7 | 5 → 7 | **The *Shiji*'s account followed, since it rejects the wounding rumour and names its eyewitness, the physician Xia Wuju; Dan's death told as one chapter's version (the Qin annals have a Qin general take his head); the Yi river song, the Dukang map, the Han carvings**. Protected: the line stays. |
| `cnh-190` end of the Zhou | 7 | 5 → 7 | **`Last king died 256 BCE` / `Annexed 249 BCE` (Hirth) / `Also dated 250 BCE` (Chavannes's Qin annals); the two principalities explained (not the Western and Eastern Zhou periods); the nine ding as tradition, the Si River search the *Shiji*'s**. Pinyin Zhōu cháo mièwáng. |

Read by eye. **Confusability**: Sima Qian's list of thwarted writers was a phrasing on both `cnh-186` and `cnh-187`;
`cnh-186`'s now takes the fisherman, the stone and the dragon boats; Changping's royal levy left `cnh-181` (`cnh-173`
keeps it); the nine ding's capture stays `cnh-111`'s phrasing and the Si River `cnh-083`'s; Jing Ke's attempt stays out
of `cnh-188`. **Legend**: Qu Yuan's life, Jing Ke's dagger and the Four Lords' retinues are now the *Shiji*'s; the
*Zhanguo Ce* a book of speeches, not a record. **Chinese names corrected**: `cnh-190` pinyin; `战国四公子` kept (四君 is the
early term, for the owner). **Spellings fixed**: none needed; 0 hits. **Myth register**: the nine ding as the row.
**Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-182`'s `Birth c. 332 BCE` is in no source
read (the ages rest on it), the *Shiji* makes him Lord of Wu'an in 278 BCE (the line: `Ennobled 280 BCE`), and the Qin
annals put his death in 257 BCE (Maspero and Giles 258); `cnh-186`'s 332 and 295 BCE are Giles's (1898) and c. 314
Mayers's (1874) — the often-cited c. 340 – 278 BCE is in no source read; `cnh-189`'s death place, Xianyang, is on no
saved page (the card says "the Qin court").

### B20 — `cnh-191`–`cnh-200`, Qin: the Qin dynasty to Qin law (2026-11-12)

Run as B11. Every cited URL answered this session. **Pictures were not touched** (Commons 429). **The old cards told
the Han's hostile picture of Qin as fact (Jia Yi's "faults of Qin", the cruelty of its law), put "Emperors 2" and an
undated capital row on the dynasty's line, told Giles's coinage, brush and silk legends of the First Emperor, put a
regnal-year note on the unification's line, called Li Si "historiographer" and "foreign minister" (he was Commandant
of Justice in 221 BCE), gave the abolition of fengjian "about 800 years" as a row, counted 36 commanderies as a date
row, put a Langya verse on Mount Tai and a square-holed coin (no source) on standardisation, and told the Cheng Miao
story from 19th-century handbooks on the script card.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-191` Qin dynasty | 9 | 5 → 9 | **"Emperors 2" and the capital row off; `Ruled 221 – 206 BCE` / `Also dated 221 – 207 BCE` / `Revolt 209 BCE`; the water, black and six doctrine the court's own claim; the Shuihudi codes and the Liye archive as contemporary evidence; the "failure" story traced to Jia Yi; the death-for-lateness the *Shiji*'s telling**. Pinyin Qín cháo. |
| `cnh-192` Qin Shi Huang | 9 | 5 → 9 | **Giles's coinage, brush and silk legends dropped; the Lü Buwei paternity told as two different *Shiji* chapters, later used to brand the house illegitimate; the tours, peaks and seven stones; a childhood in hiding in Handan**; the Peking University *Zhao Zheng shu* left out (no open source). Protected: the line stays (flagged below). |
| `cnh-193` unification of 221 BCE | 8 | 5 → 8 | **The regnal-year row off, now `Completed 221 BCE`; the event itself in order: Qi last, the edict's "broke the agreement" charges, the commanderies, the weapons melted into twelve giants, the 120,000 households moved (the *Shiji*'s), the stones' boast of a swift conquest against its near-decade**; the title debate left to `cnh-194`. |
| `cnh-194` huangdi | 7 | 5 → 7 | **The title's use until 1912 sourced and in prose (the line's "1912 CE" now 1912); the court's Heavenly, Earthly and Grand Sovereign agreeing with `cnh-002`; *zhi*, *zhao* and the imperial pronoun; no phrasing uses "emperor", the answer's own translation**. |
| `cnh-195` Li Si | 8 | 5 → 8 | **Commandant of Justice in 221 BCE, not Giles's titles; the book-burning terms as the *Shiji* gives them; the years out of the questions; the rats, the memorial against expelling foreigners, the yellow dog at Shangcai**. Protected: the line stays (flagged below). |
| `cnh-196` abolition of the fengjian order | 7 | 5 → 7 | **The "800 years" row off, now `Decided 221 BCE`; what fengjian was and "feudalism" as a comparison; Wang Wan's proposal and Li Si's reply; the 213 BCE sequel in one line; the Han's partial restoration and the kingdoms' fall after 154 BCE**; "no later state rested on hereditary lordship" dropped. **Name corrected: 废分封 → 废封建 (fèi fēngjiàn), matching the answer.** |
| `cnh-197` commandery-county system | 7 | 5 → 8 | **The count row off, now `Counties formed 350 BCE` / `Empire-wide 221 BCE`; Chu's county of Deng after 688 BCE; Shang Yang's 31 counties (41 in the Qin annals); the Liye archive of Qianling; the governor, commandant and supervisor; the Han's continuation**; "outlasted by two thousand years" dropped. |
| `cnh-198` Qin standardisation | 6 | 5 → 6 | **`Decreed 221 BCE` / `Edict restated 209 BCE` (the Second Emperor in prose only); the verse put on Mount Tai is the Langya stele's, and dropped; the square-holed coin (no source) dropped; the coinage from the *Shiji*'s treatise on finance; one axle width**. 统一度量衡 kept, though it names weights and measures only (for the owner). |
| `cnh-199` standardisation of the Chinese script | 7 | 5 → 7 | **The Cheng Miao story (19th-century handbooks) left to `cnh-906`/`cnh-907`; the *Shiji* clause and the Li Si biography's 同文書; the three Qin primers in the *Hanshu*; the Liye renaming board; clerical script on Qin slips; the debate (a Han myth on one view; finished only in the mid-Western Han on another); `Ordered 221 BCE` only**. **Name corrected: 书同文 → 书同文字 (shū tóng wénzì), the *Shiji*'s wording.** |
| `cnh-200` Qin law | 7 | 5 → 8 | **The Han verdict attributed (the *Shiji*, Jia Yi) and set against the excavated law: Shuihudi (the tomb dated 217 BCE), the Statute on Checking, the Yuelu case records, the Liye armour fine, the death penalties; `Cases recorded 246 – 222 BCE` / `Empire-wide 221 – 206 BCE`**; the "from"- and "after"-values off. Pinyin Qín lǜ. |

Read by eye. **Confusability**: the Liye well was a phrasing on `cnh-191`, `cnh-197`, `cnh-199` and `cnh-200`; it stays
`cnh-191`'s, and the others now take the county heads, the renaming board and the armour fine without it; the title
debate is `cnh-194`'s, the measures `cnh-198`'s and the script `cnh-199`'s; the ding's capture stays off `cnh-193`.
**Legend**: the Han picture of Qin is now the Han's. **Chinese names corrected**: `cnh-196` (废分封 → 废封建), `cnh-199`
(书同文 → 书同文字), `cnh-191` and `cnh-200` pinyin. **Spellings fixed**: none needed; 0 hits. **Myth register**: the Three
Sovereigns as `cnh-002` and the row. **Protected lines: unchanged** (diffed after the apply). For the owner:
`cnh-192`'s `Death 12 July 210 BCE` is on no page read — Chavannes puts the first day of that month on 22 July and says
the *Shiji*'s day cannot fall in it (`wh-404` carries the same date) — and "February" 259 BCE is a conversion (the
*Shiji* says the first month); `cnh-195`'s `Birth c. 280 BCE` is in no source read, 214 BCE is Giles's alone, and the
*Shiji*'s annals put his death a year later (Chavannes: 207 BCE).

### The second hundred, in sum

`cnh-101`–`cnh-200` (the end of the Shang, the whole of the Western and Eastern Zhou decks and the first ten of the Qin)
are done: 506 sources became 694 and 91 glossary entries were rewritten, one of them new (`Su_Qin_and_Zhang_Yi`; the card
had none). `cnh-audit.js --range=cnh-101:cnh-200` reads 74 of 100 cards clean, against none at the baseline; what remains
is 13 advisory `W.not-why`, 8 cards with no picture (`cnh-111`, `125`, `128`, `129`, `134`, `136`, `166`, `167`), 4
`L.missing` (below), one `Z.reading?` that is a polyphone (`cnh-144`'s 传 read zhuàn) and one false `G.date`
(`cnh-152`, read against `Da_Qi`). `check-cnh-spellings.js` reads 0 card hits over the hundred (the baseline's 7 cards
and 9 hits are fixed: "Quan Rong", "Gong He"; the "T'ien" hits were cited authors, and the row was made alias-only); the
4 glossary hits left are entries outside the hundred. Commons and the Wikipedia API answered 429 at the start and again
at the end, so no picture pass was run and no locator added. Fifty agents worked two cards each, never more than ten at
once; when a draft returned, its clues went into `AGENT.md` and running agents were told of any shared clue (Jin's
partition years, the Warring States' start, Maling's tree, Su Qin's death). Each batch was applied alone, verified field
by field against its drafts, diffed for the protected lines and committed with its docs; `origin/main` was merged once
mid-run (B14) and the protected lines diffed again.

What the hundred found, again and again:
- **Counts and places on the date line.** Nearly every card: 875 kg, "800 lords", Muye's Location and Result, "28 of 38",
  the ding allowance, the 2,500-man *shi*, the 900-mu well-field, 700 chariots, 102,100 killed at Maling, 700,000 at
  Changping, 36 commanderies, "800 years". All are now in prose, attributed and hedged, or gone.
- **The Han's and the ritual books' schemes as Western Zhou fact.** The ding rule, the five ranks, zongfa's arithmetic,
  the well-field, the Zhou rites made by the Duke of Zhou, the Han picture of a cruel Qin. Each is now a later text's
  scheme, set against the bronzes and the excavated statutes (Shuihudi, Liye, Yuelu).
- **Legend told as history.** King Wen's prison and the hexagrams, the Duke of Zhou's coffer, Baosi's beacons, Goujian's
  gall and brushwood, Xi Shi, Jie Zitui's burning, Su Qin's league, Jing Ke's wounding blow, Qu Yuan's life. Each is now
  the *Shiji*'s, the Zuo Zhuan's or a later tale's, dated by its text.
- **A year a source does not print.** Regnal years converted by the old cards (Xuge, Kuiqiu, the crossbow's 599, iron's
  513, Chu's 684, Qin's 908), and years that were simply wrong (Qi's fall in 220, Tian He in 385, 1039 for the Three
  Guards, 468 for the Zuo Zhuan). Dropped, or replaced by the year a source prints with whose it is.
- **A modern label as ancient fact.** "Feudalism", "Spring and Autumn" and "Warring States" as the ages' own names, the
  "hegemon system", the "Jixia Academy", the "Ritual Reform". Each is now said to be a later or modern name.
- **Sources that did not say it.** A dissertation on 6th–7th-century CE north China cited for Duke Wen, Goujian and the
  covenants; a kiln study for Hao; Giles's entry on a 3rd-century CE officer for Jin; a Late Shang paper for the Rong and
  Di. All dropped.

**The Chinese name.** Corrected: `cnh-145` (周王室衰微 → 周室衰微), `cnh-175` (铁 → 战国铁器), `cnh-196` (废分封 → 废封建), `cnh-199`
(书同文 → 书同文字), and the pinyin of fourteen cards (the house split of cháo on `cnh-103`, `cnh-190`, `cnh-191`; lower case
on `cnh-107`, `cnh-119`, `cnh-125`, `cnh-129`; joined Bāosì, Gōujiàn, huìméng; zhī zhàn on `cnh-150`; capital Hóu and Wáng
on `cnh-167`, `cnh-174`; Wèiguó, Qín lǜ). Descriptive phrases matching no open page whole are listed batch by batch for
the owner. **Spellings**: rows added for the Zhou kings, the Spring and Autumn and Warring States states (with Wey for
衛), the battles, the Warring States men, the thinkers and Fan Ju.

**The myth register** gained eight Zhou rows at the start (Di Xin, Houji, the Mandate, King Wen and King Wu, the Duke of
Zhou's regency, the Gonghe regency, Baosi and the beacons, the two kings) and one for Jie Zitui; every one was confirmed
or corrected by the batch that drafted its card (the two kings' row had King Hui of Xie inverted). The four rows held
from the first hundred (the Yu-to-Qi succession, Jie, Tang's rain, the nine ding) were already in the register; the
nine ding were confirmed again (the *Mozi*, the Zuo Zhuan, the *Shiji*).

**The protected cards** (`cnh-102`, `113`, `114`, `115`, `132`, `133`, `135`, `136`, `137`, `147`, `148`, `149`, `151`,
`159`, `166`, `167`, `168`, `174`, `182`, `186`, `189`, `192`, `195`) kept their `answerDate`, `undatable` and `timeline`
byte for byte through every apply and the merge of main. Every background now carries the years on its card's line.
Rows flagged for the owner, left as they stand (details in each batch): birth years in no source read on `cnh-102`
(1105 — Di Yi's first calendar year in Nivison), `113` (1112), `114` (1097), `132` (992, whose age also contradicts the
*Shiji*), `136` (795), `148` (720), `149` (696, Giles and Mayers only), `166` (455 and 395), `182` (332), `195` (280);
`cnh-115`'s 1035 (Shaughnessy's second start, not the Project's); `cnh-147`'s Kuiqiu 650 (Legge; the *Shiji* 651);
`cnh-167`'s reign (the *Shiji*'s; "usually 446 – 396"); `cnh-168`'s death place; `cnh-182`'s ennoblement (278 in the
*Shiji*) and death (257 in the Qin annals); `cnh-186`'s 332 – 295 (Giles; c. 314 Mayers); `cnh-189`'s Xianyang; `cnh-192`'s
12 July 210 (Chavannes: impossible in that month) and "February" 259 (a conversion); `cnh-195`'s 214 (Giles alone) and
208 (the annals: 207). Ages on the person template rest on these birth years.

**For the owner, outside the hundred**: the `Su_Qin` and `Zhang_Yi` glossary entries still give 333 / 318 / 310 BCE as
fact; `cnh-234` dates the Han iron monopoly 120 BCE (Wagner: 117); `cnh-433` and Hirth disagree on the *Zizhi tongjian*
(1084 against 1066 for its submission); `cnh-477`'s `Da_Qi` alias "Qi (Liu Yu)" can catch the plain "Qi"; `wh-404`
carries the First Emperor's 12 July 210 BCE.

### Locators (2026-11-12, the second hundred)

None was added or moved, so `migrate-places.js` was not run: Wikipedia's API answered 429 at the session's start and at
its end, and `add-locators.js` fetches every coordinate. **The sites the second hundred lacks points for**, each with
the article the agents proposed: `cnh-121` Chengzhou ("Luoyi", labelled "Chengzhou"), `cnh-150` Battle of Chengpu
("Battle of Chengpu", labelled "Chengpu", if the article carries coordinates), `cnh-180` Battle of Maling (the site is
disputed — Maspero puts it near Daming; none proposed), `cnh-181` Battle of Changping ("Battle of Changping", at
Gaoping). **The six first-hundred sites still waiting**: `cnh-053` Sanxingdui, `cnh-063` Erlitou site, `cnh-075` tomb of Fu
Hao, `cnh-080` Xibeigang, `cnh-089` Zhengzhou Shang City, `cnh-090` Panlongcheng (articles in the first hundred's note).
`L.missing` is deliberate on `cnh-177` Warring States cities (a class of cities, no one point). Points to review:
`cnh-170`'s polygon looks like the empire of 221 BCE, not Qin before it; `cnh-164`'s polygon of the seven states can stay.

### B21 — `cnh-201`–`cnh-210`, Qin: the Shuihudi texts to Xu Fu (2026-11-12)

The third hundred's first batch, run as the second's were (`AGENT.md`, the notes file, two cards an agent, at most ten
at once); every draft read by eye and prechecked before `batch.sh` applied it. Every cited URL answered (the Hamburg
PDF and a Gutenberg file on a second try). **Pictures were not touched** (Commons and the Wikipedia API answered 429 to
the session's one test call). **The old cards put a century, places and counts on their lines ("Rules 3rd century BCE",
"Xing'an, in modern Guangxi", "Workforce over 700,000 men", "after 206 BCE"), dated the Lingqu canal by an official's
posting and the southern commanderies, cited two French books on most cards, read the walls' biocrust off a study of the
Ming wall, built the Qin roads on a paper that could not be reopened, and told the Shiji's burning of the books, the
mausoleum and Xu Fu in their own voice.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-201` Shuihudi Qin bamboo texts | 5 | 5 → 5 | **"Rules 3rd century BCE" now `Copied c. 244 – 217 BCE` (Chen Wei's view, reported by Wang Xiao) / `Buried c. 217 BCE` / `Found 1975`; the ten texts, the 1,155 slips, Xi's chronicle (306 – 217 BCE), the daybook's Chu–Qin month table, the 2019 study of Xi's skeleton**; the document-weighing story (the First Emperor's, not the slips') and a 2006 Han find dropped. |
| `cnh-202` burning of books and burying of scholars | 7 | 5 → 7 | **The *Shiji*'s account told as its (213 BCE edict, 212 BCE killings) and the doubters added: the victims as *fangshi* (Zufferey), the burying perhaps never done (Eno), Confucianism not the target (Pines), a smaller loss (Strähle)**; the "Texts recovered" row off; Fu Sheng's wall and the melon-ditch legend; two French sources cut to one. |
| `cnh-203` Qin road system | 6 | 5 → 6 | **Every claim built on an unreopenable modelling paper dropped; `Highways begun 220 BCE` / `Straight Road 212 BCE` from the Chinese *Shiji* (治馳道, the 1,800 li "never finished", Sima Qian's return by the road); the route disputed (Sanft); the 2025 Yulin survey**; Giles and Mayers (nothing on roads) out. |
| `cnh-204` Lingqu Canal | 5 | 5 → 5 | **The place sub-row and the commanderies row (`cnh-205`'s) off; `Dated c. 219 BCE` (Aurousseau's inference) / `Also dated 214 BCE`; the *Huainanzi*'s passage on the supervisor Lu, Gao You's gloss, the Tang "marvellous channel", reuse by the Han**; Mayers's 220 BCE (an appointment) and Giles's 86 locks dropped. |
| `cnh-205` Qin conquest of the south | 6 | 5 → 6 | **The card is the conquest, not Zhao Tuo's career (`cnh-232`'s): the luxuries, the five armies, Lu's canal, the night attack and Tu Sui's death from the *Huainanzi* (through Aurousseau) and the *Shiji*; `Campaign c. 221 – 214 BCE` / `Annexed 214 BCE`; the timeline set to 221 – 214 BCE**; Mayers's 215 BCE (Zhao Tuo's posting) and "after 206 BCE" off. |
| `cnh-206` Meng Tian | 6 | 5 → 6 | **Rebuilt on the *Shiji*'s own biography (ch. 88): his family, imprisonment at Yangzhou, refusal to rebel, the veins of the earth, Sima Qian's verdict; the line's 250, 221, 215 and 209 now all in the prose; "34 prefectures" dropped (the editions read 34, 14 or 44)**. Protected: the line stays (flagged below). |
| `cnh-207` Qin long walls | 6 | 5 → 6 | **"from 214 BCE" off; both walls: King Zhaoxiang's state wall (`306 – 251 BCE`, Li et al. 2025) and the imperial line (`Campaign 215 BCE` / `Imperial wall 214 BCE`, Chavannes); the "more than 10,000 li" the *Shiji*'s, never a length; the chapters' 300,000 and 100,000 men**; the biocrust (a Ming-wall study) dropped. |
| `cnh-208` Mausoleum of the First Qin Emperor | 7 | 5 → 7 | **The 700,000-worker row off (the *Shiji*'s figure, in prose); `Begun 246 BCE` (Zhao et al. 2020, Ma et al. 2016) / `Burial 210 BCE` / `Works ended 208 BCE`; the soil mercury, why the chamber is unopened, the workers' DNA, Liyi (231 BCE), the *Hanshu*'s shepherd-boy fire told as a tradition**. |
| `cnh-209` Terracotta Army | 9 | 5 → 9 | **The old card was four science papers; now what the army is: the three pits, the figures' size, the 1974 well, the counts with whose estimate (about 7,000; over 8,000), the paint; `Made c. 247 – 210 BCE` (Quinn et al.) / `Found 1974`**; the chromium no longer a clue. |
| `cnh-210` Xu Fu | 5 | 5 → 6 | **The *Shiji*'s two versions read as alternatives, not a second sailing of "3,000 more"; the Japan landing dated to Yichu's compilation of 955 (Wu 2014); Xu Shi as the *Shiji*'s other writing; Pregadio on the *fangshi***; Mayers's "tinged with superstition" gone. Protected: the line stays. |

Read by eye. **Confusability**: `cnh-204`'s "armour unloosened for three years" phrasing repeated `cnh-205`'s Tu Sui
clue and was rewritten; the forged order and Fusu's death stay `cnh-211`'s (the Meng Tian agent was told), the
well-diggers and paint `cnh-209`'s, the crossbow traps, mercury and shepherd boy `cnh-208`'s, the great fish `cnh-210`'s,
Lu's canal `cnh-204`'s. **Legend**: the burning of the books, Xu Fu's sailings and the tomb's mercury rivers are now
the *Shiji*'s; the Japan landing a tale of 955. **Chinese names corrected**: none needed; `秦平百越` is descriptive (no
standard term found; for the owner). **Spellings fixed**: none needed; 0 hits. **Myth register**: the burning of the
books confirmed and corrected (the *Shiji* itself has Fusu say the victims "all model themselves on Confucius", so the
Confucian reading is not only later Han); Xu Fu and the isles confirmed (the 955 *Yichu liutie* for the Japan tale); the
Penglai row's "c. 91 BCE" against the house c. 100 BCE noted. **Protected lines: unchanged** (diffed after the apply).
For the owner: `cnh-206`'s `Birth c. 250 BCE` is in no source read (the ages rest on it), and its "Yulin, Shaanxi" is
not in the *Shiji*, which has him die at Yangzhou; Giles dates the 300,000 men to 214 BCE against the annals' 215.
**Dates that differ on purpose**: `cnh-208` starts the tomb in 246 BCE (two studies print it) where `cnh-209` starts the
pits c. 247 BCE (Quinn et al.) and `cnh-192` makes him king in 247 BCE; each says whose. `wh-407` gives 34 prefectures
in 214 BCE, a count the texts disagree on.

### B22 — `cnh-211`–`cnh-220`, Qin and Western Han: the Shaqiu plot to Empress Lü (2026-11-12)

Run as B21. Every cited URL answered except Eno's two Indiana handles (`cnh-219`, `cnh-220`), which returned the known
intermittent 500 at the batch check; the agents had read and saved both pages, so they were kept. **Pictures were not
touched** (Commons 429). **The old cards told the *Shiji*'s founding stories in their own voice, put places, army sizes
and casualty counts on their lines (Hong Gate's 400,000 against 100,000; Gaixia's Location, Casualties and Result
rows; "Ziying reigned 46 days"), named men in labels ("Er Shi reigned", "Er Shi died"), cited two French books on most
cards, had Gaozu's labourers die on the road (the *Shiji*: they ran away), and gave the Han dynasty card three
phrasings that belonged to its siblings.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-211` Shaqiu plot | 5 | 5 → 5 | **The plot told as the *Shiji*'s (chaps. 6 and 87): the unsent letter, the salted fish, the forged orders, Zhao Gao's later words; `Took place 210 BCE` only (the place and "Er Shi reigned" off)**; Hu Hai → Huhai. **Name corrected: 沙丘之变 → 沙丘之谋 (Shāqiū zhī móu), the *Shiji*'s own phrase (chap. 87: 夫沙丘之謀).** |
| `cnh-212` fall of the Qin | 7 | 5 → 7 | **"Ziying reigned 46 days" and the man-naming labels off; `Revolt 209 BCE` / `Surrender 206 BCE` / `Also dated 207 BCE`, as `cnh-191`; the *Shiji*'s "several hundred thousand" attributed; Ziying's parentage left open (the sources disagree)**; the glossary's "killed when the victors quarrelled" (no source) dropped. Pinyin Qín cháo mièwáng. |
| `cnh-213` Han dynasty | 9 | 5 → 9 | **The old card was the founding (its phrasings were `cnh-216`'s, `cnh-219`'s and `cnh-221`'s); now the whole dynasty: the 206/202 reckoning, the name from the Han River kingdom, the two halves, the frontier slips, the *Hanshu*, the fall in 220 CE, the Hanren debate; `Ruled 206 BCE – 220 CE` / `Throne taken 202 BCE` / `Interregnum 9 – 23 CE`**; "Lü Hou" gone. |
| `cnh-214` Chu–Han Contention | 7 | 5 → 7 | **The Hong Canal off the line, now `Fought 206 – 202 BCE` / `Treaty 203 BCE`; phrasings only this war answers: the threat to boil Liu Bang's father, Ji Xin's decoy at Xingyang, the back-to-the-river battle at Jingxing**; the glossary's "broken by the side that had asked for it" (no source) dropped. |
| `cnh-215` Xiang Yu | 7 | 5 → 7 | **Mayers (death in 201 BCE, the suicide at Gaixia) and a second French source out; Julu 207 BCE, the hegemon-king title early 206 BCE; the "Afang palace" a later name for the palaces the *Shiji* says burned three months; "brought up by his uncle" (no page) dropped**. Protected: the line stays (flagged below). |
| `cnh-216` Emperor Gaozu of Han | 8 | 5 → 8 | **His labourers ran away on the road (徒多道亡), they did not die; the dragon birth told as the *Shiji*'s; the three articles of law, the three men he used, the Song of the Great Wind**; "first man of no family to rule China" and a "temple name" (no page) dropped. Protected: the line stays (flagged below). |
| `cnh-217` Feast at Hong Gate | 6 | 5 → 6 | **The place and the army sizes off the line, now `Held 206 BCE`; the 400,000 and 100,000 and each side's boasts the *Shiji*'s, in prose; the seating order (Okayasu); the speeches "best read as" Sima Qian's telling**; the glossary's 206 BCE re-cited (Giles prints no year). |
| `cnh-218` Battle of Gaixia | 6 | 5 → 6 | **Location, Casualties and Result off, now `Fought 202 BCE`; the 80,000 the annals' heads taken, "20,000 captured" (no source) dropped; the *Shiji*'s two accounts of the songs; Consort Yu's suicide the later opera's**; Cordier and Mayers out. |
| `cnh-219` Han founding settlement | 6 | 5 → 6 | **The month (Chavannes's conversion) off, now `Made 202 BCE`; what the settlement made: the kingdoms in the east and the commanderies under the court, the kings removed until only Changsha's line outlived the founder; the timeline set to 202 BCE**. **Name corrected: the descriptive 汉初建国安排 → 郡国制 (jùnguózhì), the standard term (Tang 2025).** |
| `cnh-220` Empress Lü | 7 | 5 → 7 | **The "human pig" and the palace child told as the *Shiji*'s; her own basic annals; van Ess on the *Hanshu*'s crueller portrait; Cordier's "came to the throne at fourteen" and "Changle palace, 1 June" dropped (Eno gives twelve), "the only legitimate female reign" dropped**. Protected: the line stays (flagged below). |

Read by eye. **Confusability**: `cnh-213`'s old phrasings were three siblings'; the Chu songs, Consort Yu and the Wu
River stay `cnh-218`'s, the jade ring, sword dance and Fan Kuai `cnh-217`'s, the boiling threat `cnh-214`'s (the Xiang Yu
agent was told, and took Julu, the embroidered clothes and the hegemon-king's kingdoms); answer words cleared on
`cnh-219` ("founding") and `cnh-220` ("empress"); `cnh-217`'s background trimmed to 284 words. **Legend**: Hong Gate,
Gaixia, the dragon birth and the human pig are now the *Shiji*'s. **Chinese names corrected**: `cnh-211` (沙丘之变 →
沙丘之谋), `cnh-219` (汉初建国安排 → 郡国制), `cnh-212` pinyin; `秦朝灭亡` is descriptive (for the owner). **Spellings
fixed**: Hu Hai → Huhai, "Lü Hou" gone; 0 hits. **Myth register**: the Shaqiu plot confirmed from the *Shiji* (the
*Zhao Zheng shu* not confirmed: no open source); Hong Gate confirmed (no open source calls the speeches set pieces, so
the card says only "best read as his telling"); Gaixia confirmed and corrected (the *Shiji* names no author of the
songs; a Ming–Qing tale credits Zhang Liang; Consort Yu only sings in the annals); Liu Bang's dragon birth confirmed.
**Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-215`'s 233 BCE fits the *Shiji*'s "24 at
the rising" only in full years (by *sui*, 232 BCE); `cnh-216`'s 247 BCE is Giles's (the *Shiji* gives none; the rival
256 BCE could not be opened) and its two days are Chavannes's conversions (pp. 381, 401); `cnh-220`'s 241 BCE is in no
source read, Shanfu is her father's home, not a recorded birthplace, and 18 August 180 BCE is Chavannes's conversion
(p. 427). `cnh-245`'s first phrasing says the Xin was proclaimed in 8 CE against its own line's 9 CE (B25 will see it).

### B23 — `cnh-221`–`cnh-230`, Western Han: the Rule of Wen and Jing to the Silk Road (2026-11-12)

Run as B21. Every cited URL answered (the eco-vector journal page on a second try). **Pictures were not touched**
(Commons 429). **The old cards put battle templates on wars (Start, End, Result, "(14 years)", "(under a year)"), named
men in labels ("Wen reigned", "under Modu, north of the Han frontier"), gave the Xiongnu card a battle's date, dated the
Silk Road by Zhang Qian's return with no word that the name is Richthofen's of 1877, said nothing like the route existed
before, had the heqin's breaches always on the Xiongnu side, and gave Huo Qubing and Emperor Wu the clues of their
siblings' cards.** Two cards already applied were corrected from what this batch read and re-applied with it:
`cnh-204` (the Han armies only set out against Nanyue in 112 BCE; it fell in 111) and `cnh-213` (the four north-western
commanderies are no longer dated "about 111 and 60 BCE", which `cnh-231`'s 121/115 BCE contradicts).

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-221` Rule of Wen and Jing | 6 | 5 → 6 | **The man-naming labels off, now `Spanned 180 – 141 BCE` / `First reign 180 – 157 BCE` / `Second reign 157 – 141 BCE`; the land tax halved (168 BCE) and abolished (167 BCE), Tiying's petition and the end of mutilation (the *Hanshu* adds that the floggings killed), Huang-Lao, the *Hanshu*'s comparison with Cheng and Kang**; Chao Cuo left to `cnh-222`. |
| `cnh-222` Rebellion of the Seven States | 6 | 5 → 6 | **The battle template off, now `Fought 154 BCE`; "three months" the *Shiji*'s, with Zhao holding out longer; Chao Cuo's father's poison, the king of Wu "already an emperor of the east", Zhou Yafu cutting Wu's supply road**; Giles's dates (Chao Cuo 155 BCE, Zhou Yafu "A.D. 152") not used. |
| `cnh-223` Emperor Wu of Han | 8 | 5 → 8 | **The crown prince was not "wrongly put to death": Liu Ju rose in arms in the 91 BCE witchcraft affair and killed himself, and so did the empress; the 119 BCE silver-and-tin coins and deerskin money (Cordier), out of use within a year; the lost annals and Sima Qian's possible grudge (Eno)**; the glossary's date "conquered Chosŏn 109 – 108 BCE" now 141 – 87 BCE (the slug is shared with `ko-058`). Protected: the line stays (flagged below). |
| `cnh-224` Han–Xiongnu wars | 7 | 5 → 7 | **The battle template off, now `Fought 133 – 119 BCE`, with the fighting resumed in 99 BCE; the raids as the result of Wu's war, not its cause (Psarras); the *Shiji*'s 140,000 horses out and fewer than 30,000 back; Li Guang's suicide**; Mayi, the golden image and Shuofang kept to their own cards. |
| `cnh-225` Xiongnu | 7 | 5 → 7 | **The man and place in the first value and the battle row off, now `Empire c. 209 BCE – 100 CE` / `Split in two 48 CE`; ancient DNA (Lee 2023), the Huns question (the 2025 genomes, replacing Parker's 1895 judgement), the split of 48/49 CE (de Crespigny), Noin-Ula and Ivolga**. |
| `cnh-226` Modu Chanyu | 6 | 5 → 6 | **Rebuilt on the *Shiji* and Wylie's *Hanshu* 94: the whistling arrows, the seven-day siege of the Han founder broken through his consort, the letter to Empress Lü; Giles's wooden-puppet story labelled as one version; the death month (no source saved) dropped**. Protected: the line stays (flagged below). |
| `cnh-227` heqin | 6 | 5 → 6 | **`Begun c. 200 BCE` / `Abandoned 133 BCE` (Psarras), 162 and 135 BCE in prose; "always broken by the Xiongnu" now the traditional view, against five ruptures between 200 and 133 BCE, the last by the Han; Liu Jing's grandson argument; the commoner's girl sent for the empress's daughter**; 198 BCE (no source prints it) not used. |
| `cnh-228` Huo Qubing | 6 | 5 → 6 | **The Hexi, golden-image and 119 BCE clues (`cnh-231`'s and `cnh-224`'s) replaced: "no use for a house", the offering on Langjuxu, the tomb shaped like the mountains and its horse**. Protected: the line stays (flagged below). |
| `cnh-229` Zhang Qian | 7 | 5 → 7 | **"About 138 BCE" was cited to Hirth, whose translation prints no year: now Yang ("139 or 138 to 126") and Chavannes (138); the year and "thirteen years later" out of the questions; the Wusun mission; 195 and 114 carried as the line gives them**. Protected: the line stays (flagged below). |
| `cnh-230` Silk Road | 9 | 5 → 9 | **The name said to be Richthofen's of 1877 (`Named 1877`); "nothing like it before 126 BCE" replaced by older exchange (Chinese goods at Pazyryk) and the route west of the Pamirs already open; `First mission c. 138 – 126 BCE` / `Regular contact 115 BCE`; the man and the Jiuquan commandery off the line**. |

Read by eye. **Confusability**: the Hexi conquest stays `cnh-231`'s and Mobei `cnh-224`'s (Huo Qubing took neither);
Mayi stays `cnh-227`'s endpoint; the letter to Empress Lü is `cnh-226`'s and not `cnh-220`'s; the Ferghana horses are
`cnh-223`'s naming of the "heavenly horses" and `cnh-230`'s envoys in sight of each other; the Yuezhi, Shu cloth and
Wusun are `cnh-229`'s, the name, Pazyryk and the seeds `cnh-230`'s; `cnh-227`'s background trimmed to 284 words.
**Legend**: Modu's whistling arrows and the Pingcheng siege are the *Shiji*'s. **Chinese names corrected**: none needed
(冒顿 read Mòdú, the reading precheck flags as a polyphone). **Spellings fixed**: none needed; 0 hits. **Myth register**:
no row opened. **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-223`'s line puts his death at
Chang'an where the *Hanshu* has the Wuzha palace in Zhouzhi, and its days and months are in no source read;
`cnh-226`'s "Took Mayi autumn 201 BCE" follows the *Hanshu* (the *Shiji*'s Gaozu annals put it in his 7th year, 200 BCE
in Chavannes); `cnh-228`'s 140 BCE is in no source read, its "First command 121" sits against the *Shiji*'s first
campaign at eighteen in 123 BCE, and Cordier gives his age at death as 24; `cnh-229`'s 195 and 114 BCE are in no source
read (the age c. 80–81 rests on 195), and Chavannes dates the Wusun mission's departure to 115 BCE, which would push his
death later; `cnh-230`'s 115 BCE rests on Giles alone. The `Xiongnu` glossary's Huns sentence still rests on Parker 1895;
`cnh-226`'s picture is described as robed on the card and armoured in its glossary.

### B24 — `cnh-231`–`cnh-240`, Western Han: the Hexi Corridor to Sima Qian (2026-11-12)

Run as B21. Every cited URL answered (the Novosibirsk DOI on a second try). **Pictures were not touched** (Commons 429).
**The old cards misread their own sources (the Hunye king's "four thousand" where the *Hanshu* has 四萬餘人; the 45 BCE
Lelang register read as proof that most people counted were natives, which its source argues against), dated the iron
monopoly by its officials' appointment (120 BCE), had Sang Hongyang "build" the monopolies and Kong Jin complain where the
*Shiji* has Bu Shi, put "Provinces 13"-style counts and a man in their lines, cited a five-part structure, a slogan
(独尊儒术) and a university's "four grades" to texts that do not carry them, and gave Sima Qian Mayers's birth range.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-231` Hexi Corridor | 7 | 5 → 7 | **The Hunye king's following more than 40,000 (the *Hanshu* 四萬餘人), not Wylie's "four thousand"; the settlers sourced to the *Hanshu*'s line on Zhangye and Dunhuang; `Conquered 121 BCE` / `Commandery 121 BCE` / `Also dated 115 BCE`, the dispute in prose (the annals, Yu Taishan, the geography treatise); Heishuiguo graves, radiocarbon on the Gansu walls**. |
| `cnh-232` Nanyue | 7 | 5 → 7 | **Rebuilt on the *Shiji* ch. 113: `Founded 203 BCE` / `Became vassal 196 BCE` / `Annexed 111 BCE` (the man off the line); Empress Lü's iron ban as the cause of the break; the Guangzhou palace's burnt layers**; Zhao Mo's tomb and seal left out (no page opened). |
| `cnh-233` Four Commanderies of Han | 6 | 5 → 6 | **The register claim reversed to what its source argues (the 86% group cannot simply be read as natives); "besieged Pyongyang for a year" was the war; Cordier's placings dropped; the *Hanshu*'s war of 109 – 108 BCE, the punished generals, Lintun merged (82 BCE); `Founded 108 BCE` / `Reduced 82 BCE` / `Register 45 BCE` / `Last one lost 314 CE`** (314, as `ko-071` and `ko-072`). |
| `cnh-234` salt and iron monopoly | 7 | 5 → 7 | **The open decision resolved: 120 BCE is the officials' appointment (in prose); `Set up 117 BCE` (Wagner; Liu and Wood) / `Also dated 119 BCE` (Chavannes) / `Liquor added 98 BCE` / `Suspended 44 – 41 BCE`; Bu Shi, not Kong Jin, complained; the "ploughing with wood" complaint the 81 BCE debate's; "the model every later government reached for" dropped**. **Name corrected: 盐铁专卖 (on no page read) → 盐铁官营 (yántiě guānyíng), Jin and Zhang 2026.** |
| `cnh-235` Discourses on Salt and Iron | 6 | 5 → 6 | **Sang Hongyang ran the monopolies, he did not build them; "more than sixty" worthies and literati, as the text says; "one day's argument" (no source) dropped; the book's own ending (the liquor monopoly and the iron offices inside the passes closed); the man-naming sub-row off: `Debate held 81 BCE` / `Compiled 74 – 49 BCE`**. |
| `cnh-236` equable transport | 5 | 5 → 5 | **The off-topic half (the provinces, the civil service, Wang Mang) cut; rebuilt on the *Shiji*'s account (Chavannes) and the *Yantielun*'s arguments; `First offices 115 BCE` / `Empire-wide 110 BCE`**. |
| `cnh-237` Dong Zhongshu | 7 | 5 → 7 | **Rebuilt on his *Hanshu* biography (ch. 56): 134 BCE is the first order to recommend the filial and incorrupt, "four grades" Cordier's wording from an ordinance of 83 CE, the university left to `cnh-239`; the curtain, the Jiangdu king, the stolen draft on the Liaodong fire**. Protected: the line stays (flagged below). |
| `cnh-238` supremacy of Confucianism | 6 | 5 → 6 | **独尊儒术 is not the *Hanshu*'s wording ("abolished the hundred schools and made the Six Classics shine"); one study credits Sima Guang with the slogan; three views of how far the change went (Fukui via van Ess; van Ess; Wang Baoxuan); `Established 136 BCE`** (the "Emperor Wu" row off). |
| `cnh-239` Taixue | 5 | 5 → 5 | **The 83 CE ordinance and "first state school" / "the road into the civil service" dropped; Dong Zhongshu's memorial, Gongsun Hong's rules (fifty pupils, a yearly test), 3,000 under Emperor Cheng; `Founded 124 BCE` / `Refounded 29 CE` (the man off the line); the *Hou Hanshu*'s 30,000 credited to one modern account (the text could not be opened)**. |
| `cnh-240` Sima Qian | 7 | 5 → 7 | **The old 163 – 145 BCE range was Mayers's 163, which Chavannes rejects: now 145 BCE (a 737 CE commentator's reckoning) or 135 BCE; the calendar reform (`cnh-985`) and the book's structure (`cnh-241`) moved off; the deathbed charge, Mount Tai and the goose feather, Kuaiji, Qi and Lu**. Protected: the line stays (flagged below). |

Read by eye. **Confusability**: Huo Qubing's Hexi raid and the golden image are `cnh-231`'s background only (the card's
phrasings take Hunye, the reeds and Heishuiguo); 134 BCE is shared by `cnh-237` and `cnh-264` (the latter told to agree);
the university is `cnh-239`'s, the slogan and the 136 BCE posts `cnh-238`'s; three backgrounds trimmed to the word cap
(`cnh-231`, `cnh-236`, `cnh-238`). **Legend**: none told. **Chinese names corrected**: `cnh-234` (盐铁专卖 → 盐铁官营).
**Spellings fixed**: none needed; 0 hits. **Myth register**: no row opened. **Protected lines: unchanged** (diffed
after the apply). For the owner: `cnh-237`'s 179 and 104 BCE are in no page read (the Stanford Encyclopedia puts his birth
around 195 BCE), and its "Merit grades" label rests on Cordier; `cnh-240`'s "Grand Astrologer 110 BCE" is the year his
father died — the *Shiji* puts his own appointment three years later, Theobald in 108 BCE.

### B25 — `cnh-241`–`cnh-250`, Western Han and Xin: the Records of the Grand Historian to the avulsion of 11 CE (2026-11-12)

Run as B21. Every cited URL answered except the *Science Advances* DOI (`cnh-250`), which refuses scripted requests;
the paper is open access (PMC9946347) and its page was saved, so it was kept. **Pictures were not touched** (Commons
429). **The old cards dated texts and buildings by other events ("Covers to c. 122 BCE", "Founder died 195 BCE",
"Capital moved 200 BCE"), put counts and people on their lines ("Provinces 13", "Wang Zhengjun 71 BCE – 13 CE"), had Wang
Mang "move on" from one regent's title to another, dated the wuzhu's abolition to 7 CE and its restoration to 26 CE
(the *Hanshu*: 9 CE; the *Hou Hanshu*: 40 CE), tied the Red Eyebrows to the flood of 11 CE on a source that does not,
and leaned on 1890s popular books and Parker 1895.**

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-241` Records of the Grand Historian | 7 | 5 → 7 | **"Covers to c. 122 BCE" (not a date of the text) off; `Written c. 100 BCE` / `Gaps filled 48 – 7 BCE` (Chavannes); the *Taishigong shu* title, Sima Tan's share, Yang Yun; phrasings only this card answers (the copy refused to the king of Dongping, Chu Shaosun's ten chapters, the "famous mountain" copy)**; the five-part arrangement left as `cnh-738`'s clue. |
| `cnh-242` Weiyang Palace | 7 | 5 → 7 | **The two rows of other events off; `Built 199 – 198 BCE` (the *Shiji*, Chavannes) / `Stormed 23 CE` / `World Heritage 2014` (Gao et al., not UNESCO); Xiao He's answer, the jade-cup toast, the 60,000 ox-bone tallies; the city-wall figures left to `cnh-367`**; the glossary's "Built by 193 BCE" redrafted. |
| `cnh-243` regional inspector | 6 | 5 → 6 | **Rebuilt on the inspector (de Crespigny, the *Hanshu*): "Provinces 13" off; `Created 106 BCE` / `Became governors 7 BCE` / `Inspectors again 42 CE` / `Governors again 188 CE`; the six articles (in Liu Zhao's commentary on the *Hou Hanshu*); kept junior on purpose; Liu Yan's 188 CE proposal**. |
| `cnh-244` consort clan | 6 | 5 → 6 | **People off the line, now `Earliest case 188 – 180 BCE` / `Last Han case 189 CE`; the Lü, Huo and Wang families, then the Dou, Deng and Liang and He Jin; the law against in-laws' lavish gifts, the fifteen-year-old dowager of 74 BCE, the Wang family's ten marquises**; a climate paper and three 1890s books dropped; the glossary's Parker-based claim gone. |
| `cnh-245` Xin dynasty | 7 | 6 → 7 | **The 8 CE phrasing gone; 8 CE (Theobald) and 9 CE (Petersen, Giles) in prose with the *Hanshu*'s own wording, the line `Founded 9 CE` / `Ended 23 CE` as `cnh-213`; Ai Zhang's casket, the yellow court colour, Ruzi Ying as "guest"; the "purple colour and croak of frogs" verdict and Bielenstein**; Psarras and Boulger claims their pages do not make dropped; Lulin → Lülin. |
| `cnh-246` Wang Mang | 7 | 5 → 7 | **Shun's dagger and the Dipper at the end, the months nursing Wang Feng, the ban on two-character names; the register's verdicts (Ban Gu; Hu Shi's 1928 "socialist emperor"; Bielenstein)**; the glossary's "four changes of currency" (no source) gone. Protected: the line stays (flagged below). |
| `cnh-247` acting emperor | 6 | 5 → 6 | **He did not "move on" between titles: the *Hanshu* memorial gives 假皇帝 (at the rites) and 攝皇帝 (in common use) at once; the lost Documents chapter hailing the Duke of Zhou as 假王; Liu Chong and Zhai Yi; the proclamation on the "Great Announcement"; `Held 6 – 8 CE` / `Throne taken 9 CE`**; Cordier's and Boulger's counts dropped. |
| `cnh-248` wangtian | 5 | 5 → 5 | **"abandoned within a few years" off the line (no source prints the repeal's Western year), now `Decreed 9 CE`, the treatise's "three years later" in prose; the decree itself (the eight-male rule, the *jing*, banishment for critics, Ou Bo's memorial)**; off-subject passages, a misread of Thierry and two French sources dropped. |
| `cnh-249` wuzhu | 6 | 5 → 6 | **`First struck 118 BCE` / `Abolished 9 CE` (not 7: the regent's coins of 7 CE circulated beside it) / `Restored 40 CE` (not 26) / `Superseded 621 CE` (Lacouperie; Thierry's 618 in prose); the raised rim, the Liu surname dooming the knife coins, the 28 "precious goods", banishment for holding wuzhu**. |
| `cnh-250` avulsion | 6 | 5 → 6 | **Defined from two geomorphology papers, then the *Hanshu*'s 11 CE breach left open because it spared the Yuancheng tombs and Zhang Rong's warning; the Red Eyebrows and Lülin (not in its source) dropped; "embankments on both sides" in 69 CE now "river works"; `Course change 11 CE` / `River works 69 CE`**. |

Read by eye. **Confusability**: the Ruzi Ying deposition is told on `cnh-245` (the "guest" of the new house) and on
`cnh-247` (Wang Mang weeping as he takes the child's hand) — different clues, kept; Wang Mang's death in the palace stays
`cnh-246`'s, not `cnh-242`'s; the five-part arrangement stays `cnh-738`'s; `cnh-241`'s background trimmed to 284 words.
**Legend**: the casket and the portents are the *Hanshu*'s. **Chinese names corrected**: none; `新朝` itself is printed on
no saved page (the *Hanshu* names the dynasty 新) and `河流改道` is a descriptive modern term (both for the owner).
**Spellings fixed**: Lulin → Lülin; 0 hits. **Myth register**: Wang Mang as usurper confirmed (the *Hanshu*'s zan,
篡盜之禍, and the Qin comparison; Hu Shi's "socialist emperor", 1928; Bielenstein's capable statesman); the Duke of Zhou's
regency told as the row tells it (the 假王 precedent). **Protected lines: unchanged** (diffed after the apply). For the
owner: `cnh-246`'s `Death 6 October 23 CE` is a conversion (the *Hanshu*: the third day of the tenth month), Giles gives
his birth as 33 BCE against the line's 45, and 16 BCE is Theobald's (the *Hanshu* prints the regnal year). The plan line
of `cnh-250` dates an event on a concept card; the owner may prefer the line empty.

### B26 — `cnh-251`–`cnh-260`, Xin and Eastern Han: the Red Eyebrows to the Book of Han (2026-11-12)

Run as B21. Every cited URL answered. **Pictures were not touched** (Commons 429). **The old cards put battle templates
on Kunyang (Date, Location, a "June – July" conversion no source gives, "Lulin victory"), a place and a "from" on the
Eastern Han and a count on Luoyang ("Population c. 1,000,000", "Peak Tang dynasty"), named Ban Chao in the protectorate's
line and started it at its revival, said the Han never governed from Luoyang again, called Guangwu's posthumous title a
"temple style", put Kunyang on his card on a Giles citation that does not support it, gave the Book of Han a 36 CE start
no source prints and a chapter count as a date, and cited Giles, Cordier and Boulger for claims their pages do not make.**
The Chinese *Hou Hanshu* and *Sanguozhi* were read from the Kanseki Repository's texts on GitHub (juan numbered by the
Siku edition), and de Crespigny's papers from ANU Open Research — both new routes this batch.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-251` Red Eyebrows | 7 | 5 → 7 | **Rebuilt on the *Hou Hanshu* (Liu Penzi's biography): the trap was not "closed at Xin'an" (Feng Yi won at Xiaodi, the surrender came at Yiyang); the drawing of lots north of Zheng, not "at Huayin"; the cowherd emperor, the spoken rule, the weapons heaped like Mount Xiong'er; `Rose 18 CE` / `Surrendered 27 CE`**; "two Grand Preceptors destroyed" dropped; Giles kept only for his 1898 view of the dye. |
| `cnh-252` Battle of Kunyang | 6 | 5 → 6 | **The battle template off, now `Fought 23 CE`; the 420,000 "called a million", Ju Wuba and the beasts, the thirteen riders, the falling star, the 3,000 at the centre and the Zhi River flood all the *Hou Hanshu*'s (Fan Ye, 398 – 445), with Bielenstein's reading of the portents; Boulger's "last words" (not the *Hanshu*'s) dropped**. |
| `cnh-253` Eastern Han | 7 | 5 → 7 | **The place-and-"from" row off, now `Ruled 25 – 220 CE`; the militia given up, a Xiongnu branch settled inside, the borrowed treatises, the consort families and landlords; the "interruption", the "examination-free bureaucracy" and the Western Regions dropped; Li 2023's article number and Theobald's page date corrected**. |
| `cnh-254` Emperor Guangwu | 7 | 5 → 7 | **"temple style" → posthumous title; "eleven years" → the final victory in 36; "fourteen professors" → fifteen chairs (de Crespigny; Cordier fourteen); Kunyang off both card and glossary (`cnh-252`'s); the name taboo, the Trung sisters, the doubters of the prophetic texts**. **Pinyin Hàn Guāngwǔ Dì → Hàn Guāngwǔdì, joined as Hàn Wǔdì and Hàn Xiàndì.** Protected: the line stays (flagged below). |
| `cnh-255` Chengjia | 6 | 5 → 6 | **Rebuilt on the *Hou Hanshu* ch. 13 in Chinese, Farmer 2020 and de Crespigny; the "White Emperor" epithet, the head sent to Luoyang and Theobald's 28 CE campaign dropped; Dacheng from the *Huayang guozhi*; the twelve-year dream, the granary rumour, the iron-coin song; `Proclaimed 25 CE` / `Fell 36 CE`**; Giles, Cordier and Boulger out. |
| `cnh-256` Luoyang | 7 | 5 → 7 | **The count and "Peak Tang dynasty" off, now `Han capital 25 – 190 CE`; rebuilt on Bielenstein's "Lo-yang in Later Han Times" (1976, a CC0 museum upload); the emperor's return to the ruins in 196; the university and the burning left to `cnh-239` and `cnh-270`**. |
| `cnh-257` Ban Chao | 7 | 5 → 7 | **A native of Pingling, as the line says, not "from Anling"; Chavannes's 1906 translation and Hill's; where Gan Ying turned back disputed (the Persian Gulf or Roman Syria); Yu Taishan's view that his petitions overstated the oases' loyalty; the brush thrown down, the tiger's den, the river too clear**; Cordier, Boulger and Hirth out. Protected: the line stays. |
| `cnh-258` Protectorate of the Western Regions | 6 | 5 → 6 | **`Founded 60 BCE` (Cordier) / `Also dated 59 BCE` (Yu; Hill) / `Revived 74 CE` / `Abandoned 107 CE`, the man-naming row off; what the office did, from the *Hanshu*; Cordier's "military commissioner abolished" (the Xiongnu's own officer) and the misread Yarkand story corrected**. |
| `cnh-259` Ban Gu | 7 | 5 → 7 | **"Thirty years on the history" (not in Hirth) dropped; the White Tiger Hall (79 CE), the Mount Yanran inscription and his death after Dou Xian's fall, the Two Capitals rhapsody; "elder brother" of Ban Chao only (no source opened says twins)**. Protected: the line stays. |
| `cnh-260` Book of Han | 7 | 5 → 7 | **"Begun c. 36 CE" (no source) and "Chapters 100" (a count) off, now `Compiled c. 54 – 80 CE` (Theobald); the nine-grade table, Emperor He's coup and the consorts' chapter; the library catalogue left to `cnh-918`; Yan Shigu's 641 and the 120 *juan* dropped (no page opened)**. |

Read by eye. **Confusability**: Kunyang is `cnh-252`'s alone (off `cnh-254`); the university is `cnh-239`'s and the
burning `cnh-270`'s, not `cnh-256`'s; the White Tiger Hall, Mount Yanran and the Two Capitals are `cnh-259`'s, the
nine-grade table and Emperor He's coup `cnh-260`'s (the Ban Zhao agent was told); the Na gold seal stays `cnh-799`'s.
**Legend**: the Kunyang portents and the Red Eyebrows' lots are the *Hou Hanshu*'s. **Chinese names corrected**:
`cnh-254` pinyin joined. **Spellings fixed**: none needed; 0 hits. **Myth register**: no row opened. **Protected lines:
unchanged** (diffed after the apply). For the owner: `cnh-254`'s 15 January 5 BCE is on no page read (Giles prints 4 BCE)
and Cordier gives his age at death as 63 against the line's 61; `cnh-257`'s line is consistent with the *Hou Hanshu*'s 71
*sui*, but Giles dates him 31 – 101.

### B27 — `cnh-261`–`cnh-270`, Eastern Han: Ban Zhao to Dong Zhuo (2026-11-12)

Run as B21. Every cited URL answered. **Pictures were not touched** (Commons 429). **Half the batch carried traditional
characters in the simplified field (蔡倫, 張衡, 黨錮, 白馬寺, 黃巾之亂, 張角); the old cards put Liang Ji's poisoning of
Emperor Zhi as fact (de Crespigny: a rumour), had the plot against Lady Song the Dowager Deng's (it was the Dowager
Dou's), told Zhang Heng's quake detection and the Book of Great Peace in their own voice, gave the Yellow Turbans a 205
end and a "March" no source prints, and leaned on Cordier, Boulger and an Espesset paper now behind a bot wall.** The
*Hou Hanshu* was read in Chinese from the Kanseki Repository's GitHub texts.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-261` Ban Zhao | 7 | 5 → 7 | **The Nüjie has seven sections, not five (the Columbia translation); Chavannes's 1906 translation of the *Hou Hanshu* biography; Ma Xu named as Theobald and Rošker print him; the tutoring and the tables, the case for teaching girls from eight, the petition for Ban Chao's recall**. Protected: the line stays (flagged below). |
| `cnh-262` Cai Lun | 7 | 6 → 7 | **Western Han hemp paper (Baqiao, Xuanquan) as contemporary evidence that paper is older than him (Ma et al. 2025); the plot was the Dowager Dou's, the inquiry after the Dowager Deng's death in 121; the 114 / 118 disagreement in a why answer; the years out of the questions; duplicate Chavannes entries merged**. **Name corrected: hanzi 蔡倫 → 蔡伦.** Protected: the line stays (flagged below). |
| `cnh-263` Zhang Heng | 8 | 6 → 8 | **"6.5 feet" → 6 ft 7 in; "Longxi, far to the west" (no distance in any source) → Longxi; the inside of the seismoscope from the *Hou Hanshu* (pillar, rods, trigger); one study dates the detected quake to 134 CE; the Lingxian, the rhapsodies, the machine lost at the Han's end; two Science Museum Group records**; the π values and the Lingxian's Chang'e passage (no source to hand) dropped. **Name corrected: hanzi 張衡 → 张衡.** Protected: the line stays. |
| `cnh-264` Filial and Incorrupt | 6 | 5 → 6 | **Recommendation, not examination; `Instituted 134 BCE` (agreeing with `cnh-237`; de Crespigny prints 130 BC for the same *Hanshu* passage) / `Quota reformed 92 CE` / `Tests added 132 CE` (the man-naming label off); the edict against governors who named no one, the probation, the mocking rhyme; Zuo Xiong's age rule as de Crespigny gives it (at least forty; Theobald inverts it)**; Li Ying left to `cnh-266`. |
| `cnh-265` Liang Ji | 6 | 5 → 6 | **The poisoning of Emperor Zhi told as the *Hou Hanshu*'s (Fan Ye, 5th century), with de Crespigny's "rumoured"; the "domineering general", the poisoned cakes, the rabbit park, the bitten-arm oath; the *Hou Hanshu* in Chinese**. Protected: the line stays. |
| `cnh-266` Partisan Prohibitions | 7 | 5 → 7 | **The students' slogans as the sources give them; the hollow pillar attributed to the *Hou Hanshu* and Giles (Sima Guang has a secret chamber); the *Hou Hanshu* named for the 30,000 students, the hundred dead and the six or seven hundred punished; the official beaten to death in 176; Cordier's thousand killed after 172 (de Crespigny: arrests, no recorded executions) not carried**. **Name corrected: hanzi 黨錮 → 党锢.** |
| `cnh-267` White Horse Temple | 7 | 5 → 7 | **The "Legend recorded" row off (Maspero dates the preface late 2nd century, Shmushko the dream story 4th — both in prose), now `Traditional 68 CE`; the legend's growth in stages (Maspero), Xiang Kai's memorial of 166, the modern temple; phrasings off the white horses and the golden dream (`wh-415`, `cnh-882`)**. **Name corrected: hanzi 白馬寺 → 白马寺.** |
| `cnh-268` Yellow Turban Rebellion | 8 | 6 → 8 | **The battle template, "March" and the 205 end (no source) off, now `Rose 184 CE` / `Remnants active 184 – 207 CE` (Theobald's 207); the timeline set to 184 – 207 CE; Ma Yuanyi's betrayal, Lü Qiang's advice, the reign renamed "Peace Achieved", Cao Cao and the Qingzhou surrender (192); the Taiping jing caution on de Crespigny and the Stanford Encyclopedia**. **Name corrected: 黃巾之亂 (traditional, in the hanzi field) → 黄巾起义 (Huángjīn qǐyì), the standard modern term.** |
| `cnh-269` Zhang Jue | 8 | 5 → 8 | **The Book of Great Peace told as a later legend (Theobald), the Espesset claim dropped (the paper is behind a bot wall); confession and charm water, the thirty-six divisions and the azure-sky prophecy, Huangfu Song at Guangzong, the broken coffin; how we know (Sima Guang from Fan Ye)**. **Name corrected: hanzi 張角 → 张角** (read Jué, the house form; Zhang Jiao an alias). Protected: the line stays (flagged below). |
| `cnh-270` Dong Zhuo | 7 | 5 → 7 | **His youth among the Qiang, the two refusals to give up his army, the failure against the Yellow Turbans; the flames over the capital, the march west and the burning of Luoyang, the navel wick; how we know (Fan Ye, Chen Shou); Diaochan left out (the chronicle names only a maidservant)**. Protected: the line stays (flagged below). |

Read by eye. **Confusability**: the confession, the thirty-six divisions and the broken coffin are `cnh-269`'s, Ma Yuanyi
and the "Peace Achieved" reign `cnh-268`'s (its agent was told); the burning of Luoyang `cnh-270`'s (off `cnh-256`); Ban
Gu's and the Book of Han's clues kept off `cnh-261`; the answer word on `cnh-264` ("filial") cleared. **Legend**: the
White Horse founding, the Kunyang-style portents and the Book of Great Peace are later tellings; Diaochan is the novel's.
**Chinese names corrected**: six simplified fields (`cnh-262`, `263`, `266`, `267`, `268`, `269`) and `cnh-268`'s term.
**Spellings fixed**: none needed; 0 hits. **Myth register**: the Romance row gains a note that Diaochan is the novel's (the
*Sanguozhi* has an unnamed maidservant). **Protected lines: unchanged** (diffed after the apply). For the owner:
`cnh-261`'s age 71 – 72 is worked out from 45 and 117, which no source states; `cnh-262`'s 50 – 62 CE is on no page read
(one dictionary: c. 61 – 121); `cnh-269`'s 174 CE is on no page read (ten active years before 184); `cnh-270`'s "Grand
Preceptor 189 – 192" looks wrong — the *Sanguozhi* gives him the title on reaching Chang'an and Theobald and de
Crespigny put it in 191 (in 189 he was Grand Commandant, then Chancellor of State) — and its c. 140 – 149 birth is a
modern estimate.

### B28 — `cnh-271`–`cnh-280`, Eastern Han and Three Kingdoms: Yuan Shao to Liu Bei (2026-11-12)

Run as B21. Every cited URL answered. **Pictures were not touched** (Commons 429). **Five cards carried the simplified
form in `traditional` (三国, 袁绍, 汉献帝, 官渡之战, 赤壁之战, 蜀汉, 刘备); the old battle cards had Location, Casualties and
Result rows ("c. 88,000 casualties", "Yangtze River, China"), the old person cards put years and their siblings' clues in
their questions, Red Cliffs and Cao Cao were told through the *Romance*, the south's population "roughly doubled" (it was
the counties), and de Crespigny was cited three or four times on a card.** The Shu and Wu books of the *Sanguozhi* are on
neither Gutenberg nor the Kanseki Repository; they were read on zggdwx.com or through de Crespigny's translations.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-271` Yuan Shao | 7 | 6 → 7 | **The years out of the questions; the clan's four generations among the Three Excellencies (the *Sanguozhi*, 四世居三公位), the insignia hung on a Luoyang gate, the forged will that set his sons at war; Guandu kept off the questions**. **`traditional` corrected: 袁绍 → 袁紹.** Protected: the line stays (flagged below). |
| `cnh-272` Emperor Xian of Han | 7 | 7 → 7 | **The duplicate *To Establish Peace* entry merged, the Chinese *Sanguozhi* added; the flight down the river bank on silk, Dong Cheng's secret edict and the pregnant consort, the duke's terms; the deposition and abdication left to `cnh-270` and `cnh-278`; "girdle" not used (no source read)**. **`traditional` corrected: 汉献帝 → 漢獻帝.** Protected: the line stays (flagged below). |
| `cnh-273` Three Kingdoms | 9 | 5 → 9 | **"Shu-Han" → Shu Han; the south's population under two million to over three million (the counties doubled); the tripod a commentators' image (the line given to Zhuge Liang in 208 probably added later); the *Records* against the *Romance*, as the register row tells it; the Zoumalou slips in a why**. **`traditional` corrected: 三国 → 三國.** |
| `cnh-274` Cao Cao | 9 | 6 → 9 | **The tuntian and Guandu clues (`cnh-287`'s and `cnh-275`'s) replaced: the Lü Boshe killing as Pei Songzhi's notes tell it (the "rather I wrong the world" line Sun Sheng's, one of three versions), the order seeking men of talent, the plain burial at Gaoling; the Chinese *Sanguozhi* juan 1; the Xigaoxue tomb left out (no open source)**. Protected: the line stays (flagged below). |
| `cnh-275` Battle of Guandu | 7 | 6 → 7 | **Location, Casualties ("c. 88,000", no source) and Result off, and the September – November span (a conversion); `Fought 200 CE`; the armies' sizes said whose (the *Records*' figures, Pei Songzhi's objection); the 70,000 and 80,000 dead attributed in a why; Xu You and the month's food, the thunder carts, the burned letters**. **`traditional` corrected: 官渡之战 → 官渡之戰.** |
| `cnh-276` Battle of Red Cliffs | 9 | 5 → 9 | **Location and Result off, `Fought 208 CE`; the register applied: Huang Gai's fire ships are the *Records*' ("several dozen"; ten in the *Jiangbiao zhuan*), the borrowed arrows, the east wind, the chained ships and Huarong the *Romance*'s; the 800,000 Cao Cao's boast against Zhou Yu's estimate; the site disputed (no locator by design); "one historian wondered whether any fighting took place" (not what de Crespigny says) dropped**. **`traditional` corrected: 赤壁之战 → 赤壁之戰.** |
| `cnh-277` Cao Wei | 8 | 5 → 8 | **`Founded 220 CE` / `Ended 266 CE` (de Crespigny: 4 February 266) / `Also dated 265 CE` (Theobald, Giles, Cordier); the heartland and seventy per cent of the registered people, the surname added to tell it from other Weis, Cao Mao's death (one later account); the Himiko clue (`jp-045`'s) and the nine-rank and tuntian content (`cnh-288`'s, `cnh-287`'s) off; the Zhengshi *xuanxue***. |
| `cnh-278` Cao Pi | 8 | 6 → 8 | **"Died at forty" (the Chinese count, against the line's c. 38 – 39) off card and glossary; the altar at Fanyang and "Shun and Yu" (the *Weishi chunqiu* in Pei's notes), the water sign in Luoyang's name (the *Weilüe*), the *Dianlun*'s one surviving chapter; the seven-step poem a later story (the *Shishuo xinyu*)**. Protected: the line stays (flagged below). |
| `cnh-279` Shu Han | 8 | 6 → 8 | **The year and the Liu Bei, Zhuge Liang and Northern Expeditions clues out of the questions; the two names (Han to itself, Shu to its rivals), Wu's relief armies turning back at the news of the surrender, no official historians; Liu Shan's surrender beside an empty coffin ("is said to") in prose only, the coffin clue left to `cnh-292` (changed in B30 after `Q.sibling`); "smallest of the Three Kingdoms" (no source) dropped; de Crespigny cut to two**. **`traditional` corrected: 蜀汉 → 蜀漢.** |
| `cnh-280` Liu Bei | 9 | 6 → 9 | **The Peach Garden oath told as the register row says (the *Sanguozhi*: one bed, like brothers; the oath the novel's); the shoe-and-mat seller, the night flight to Baidi, the deathbed charge; the glossary's 184 re-pointed to de Crespigny 1991 (Giles gives 185) and an unreferenced Giles source dropped from it**. **`traditional` corrected: 刘备 → 劉備.** Protected: the line stays (flagged below). |

Read by eye. **Confusability**: Guandu stays `cnh-275`'s (off `cnh-271`'s and `cnh-274`'s questions), the abdication
`cnh-278`'s, the borrowed arrows `cnh-276`'s (off `cnh-291`), the deathbed charge `cnh-280`'s (the Zhuge Liang agent was
told); answer words cleared on `cnh-272` ("emperor") and `cnh-273` ("three"); `cnh-278`'s background trimmed to 285
words. **Legend**: the Peach Garden, the borrowed arrows, the east wind, the chained ships and Huarong are the novel's.
**Chinese names corrected**: seven `traditional` fields. **Spellings fixed**: "Shu-Han", "Yangzi" → house forms; 0
hits. **Myth register**: the Peach Garden oath and the Romance against the Records confirmed (`cnh-273`, `276`, `280`);
the "rather I wrong the world" line traced to Sun Sheng in Pei Songzhi's notes. **Protected lines: unchanged** (diffed
after the apply). For the owner: `cnh-271`'s 154 CE is unrecorded (de Crespigny: "no record of Yuan Shao's age"), he
refused the Grand Commandancy in late 196 and became General-in-Chief in spring 197, and Shangshui and Handan are in no
source read (the *Sanguozhi* says Ruyang in Runan); `cnh-272`'s 2 April 181 is on no page read, and de Crespigny dates
the abdication 25 November 220 against the line's 11 December; `cnh-274`'s "King of Wei 217" looks wrong — the
*Sanguozhi* dates the edict to the fifth month of Jian'an 21, which de Crespigny's chronicle, Cordier and Giles give as
216 (only one modern summary says 217, and it also says duke 214 where the chronicle has 213), so the age would be c. 60 –
61; `cnh-278`'s 11 December 220 sits against de Crespigny's 25 November and 29 June 226 is on no page read; `cnh-280`'s
10 June 223 is on no page read, Theobald gives 6 April 221 for the enthronement against the line's 15 May, and Giles
gives 162 for the birth. `cnh-294`'s 8 February 266 sits against de Crespigny's 4 February.

### B29 — `cnh-281`–`cnh-290`, Three Kingdoms: Zhuge Liang to the Records of the Three Kingdoms (2026-11-12)

Run as B21. Every cited URL answered. **Pictures were not touched** (Commons 429). **The old cards put years and their
siblings' clues in their questions (the three visits and the deathbed charge on Zhuge Liang, the refugee colonies on
tuntian, Cao Cao's clue on the Northern Expeditions), told the Romance's Zhuge Liang (the borrowed arrows, the east wind,
the empty city) as his, had Sun Quan proclaim himself at Jianye (he did so at Wuchang), Guan Yu die "at Zhangxiang", the
231 campaign end in defeat, Chen Qun not credited with the nine ranks (the *Sanguozhi* credits him), "a million bushels"
as fact, and a date line whose label named Chen Shou.** The Shu and Wu books of the *Sanguozhi* were read on zggdwx.com
(the Kanseki Repository and Gutenberg copies carry only the Wei books). `cnh-273`'s line was corrected in the same run
(its "from 229 CE" value is now `229 CE`).

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-281` Zhuge Liang | 7 | 6 → 7 | **Years, the three visits and the deathbed charge out of the questions; the *Chu shi biao* (quoted from the Chinese text), the wooden oxen and running horses and the multi-arrow bow, the "sleeping dragon"; the borrowed arrows and east wind sourced as fiction (Sun Quan's ship at Ruxu in 213 the parallel), the empty city first told of Wen Ping; de Crespigny cut to two**; Chen Shou's verdict on his generalship not carried (no page opened). Protected: the line stays (flagged below). |
| `cnh-282` Longzhong Plan | 6 | 6 → 6 | **"Two bases" softened to what the sources print; Sun Quan's seizure of Jing in 219 sourced (*To Establish Peace*); the 215 crisis in a why; the Nanyang question from Zhuge Liang's memorial; the three calls, the "treasury of Heaven", the plan undone behind Guan Yu**; the Xiangyang – Nanyang dispute left out (no open source). |
| `cnh-283` Northern Expeditions | 6 | 7 → 6 | **"took Wudu" → Wudu and Yinping; the 231 campaign a withdrawal for want of grain (Zhang He shot as it fell back), not a defeat; five campaigns, two given up for want of porters; Ma Su executed and Zhuge Liang demoted three grades; Chencang, the Wuzhang farms, the dead Zhuge and the living Zhongda; the last campaign 234 (de Crespigny 1991: 233)**; the headdress story and the Meng Da sentence dropped; the glossary's "won only Wudu" corrected. |
| `cnh-284` Eastern Wu | 7 | 5 → 7 | **The capital moved to Jianye in autumn 229; the naval bases and the 5,000 ships at the surrender, the Funan envoys, the hostage system and the great families; the Zoumalou slips (found 1996, about 140,000; Xu Chang 2022); "Yangzi" → Yangtze**; the Taiwan clue moved off (`cnh-285`'s), the answer word "eastern" cleared. |
| `cnh-285` Sun Quan | 7 | 6 → 7 | **Emperor at Wuchang in 229, the court back to Jianye that year; King of Wu 221; the Yizhou (Taiwan) expedition of 230, the Liaodong alliance, Cao Cao's remark at Ruxu (hearsay from the *Wu li* in Pei's notes), the 250 succession crisis, Chen Shou's verdict; Giles used only where he agrees with the line**. Protected: the line stays (flagged below). |
| `cnh-286` Guan Yu | 7 | 5 → 7 | **He died near Linju (juan 36; juan 47 and the *Tongjian* say Zhangxiang), not flatly "at Zhangxiang"; the Peach Garden and the Huarong road the novel's and the plays'; Yan Liang's parasol, the bone-scraping (in Chen Shou's text), the Fan floods; the deification cut to a clause (`cnh-039`'s)**; the Green Dragon blade and the five passes not told (no source read). Protected: the line stays (flagged below). |
| `cnh-287` tuntian | 6 | 5 → 6 | **"Set up at Xu" (a place) off, now `Revived 196 CE` / `Abolished 264 CE` / `Again abolished 266 CE`; Zao Zhi and Han Hao, the share rates, "a million hu" as a report, the mulberries and clams credited to a lost history in Pei's notes; Zhao Chongguo's Huangshui precedent (61 BCE); the duplicate de Crespigny entry merged**; Giles (Zhao Chongguo as originator) out. |
| `cnh-288` nine-rank system | 6 | 5 → 6 | **The *Sanguozhi*'s biography of Chen Qun does credit him (制九品官人之法羣所建也), against the note the old card followed; the hedge kept that it may have formed earlier (Lu Su's "graded for name and rank", 208); Liu Yi's memorial taken here (off `cnh-298`)**; no Sui abolition year (no source read gives one). |
| `cnh-289` Sima Yi | 7 | 5 → 7 | **The years out of the questions; the Gaoping coup, the sickbed ruse and the clogs over the caltrops (the *Jinshu*); the headdress a story, the empty city the novel's (its oldest form a *Weilüe* fragment about Wen Ping); the line's years each sourced (179 Theobald; Giles 178; 239 Cordier; de Crespigny 238)**. Protected: the line stays (flagged below). |
| `cnh-290` Records of the Three Kingdoms | 7 | 5 → 7 | **"Chen Shou lived 233 CE – c. 300 CE" (a life, a man in the label) off, now `Compiled c. 280 – 297 CE` / `Commentary 429 CE`; the *Huayang guozhi*'s compilation after Wu fell; death c. 297 (the *Jinshu*) or c. 300; Wei as the legitimate line; the Wo chapter kept off the questions (`jp-043`'s)**; the duplicate *Generals of the South* entry merged. |

Read by eye. **Confusability**: the Yizhou fleet was a phrasing on both `cnh-284` and `cnh-285`; it stays `cnh-285`'s and
`cnh-284` takes the Funan envoys; the *Chu shi biao*, the oxen and the sleeping dragon are `cnh-281`'s, the three calls
`cnh-282`'s, Jieting and the dead Zhuge `cnh-283`'s (both agents were told); the deathbed charge `cnh-280`'s; Liu Yi's
saying `cnh-288`'s; `cnh-290`'s background trimmed to 285 words. **Legend**: the borrowed arrows, the east wind and the
empty city are the novel's, the last first told of Wen Ping in the *Weilüe*; the Peach Garden, the Green Dragon blade
and the five passes the novel's. **Chinese names corrected**: none needed. **Spellings fixed**: "Yangzi" → Yangtze;
0 hits. **Myth register**: the Romance and the Records confirmed and extended (the empty city's *Weilüe* origin);
Guan Yu's deification left to `cnh-039`. **Protected lines: unchanged** (diffed after the apply). For the owner:
`cnh-281`'s 23 July 181 and the Wuzhang Plains are on no page read (the year 181 in Giles, Theobald and Cordier);
`cnh-285`'s "Emperor 23 May 229" looks a month off — de Crespigny gives 23 June 229, the *Sanguozhi*'s day; `cnh-286`'s
"Linju, Xiangyang" is wrong (Linju lay in Nan commandery), and the twelfth month of Jian'an 24 may fall in early 220;
`cnh-289`'s 13 March 239 and 7 September 251 are on no page read, Giles prints 178 for the birth and de Crespigny puts Cao
Rui's death in 238.

### B30 — `cnh-291`–`cnh-300`, Three Kingdoms and Western Jin: the Romance to the Seven Sages (2026-11-12)

Run as B21. Every cited URL answered. **Pictures were not touched** (Commons 429). **The old cards dated the Romance by
its printing alone and credited the Mao revision to the son, counted Sun Hao's people at 2,300,000 on no source, put
battle templates on the War of the Eight Princes ("15 years", "Victory of Sima Yue"), made the Seven Sages' line two
men's deaths with an "or" in a value, set the nine-rank sentence and the being-and-nothingness clue on qingtan, cited
Liu Yi's saying on menfa (`cnh-288`'s), converted zhantian's allotments into "5,000 mu", and gave the Jin dynasty card
three phrasings carrying years.** The *Jinshu* was read in Chinese from the Kanseki Repository (juan 1 – 33 only) and on
zggdwx.com.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-291` Romance of the Three Kingdoms | 8 | 5 → 8 | **`Attested 1494` (the oldest preface) / `First printed 1522` / `Revised c. 1679` (the preface's twelfth month of Kangxi 18, early 1680); Mao Lun, the blind father, the main reviser; Luo Guanzhong's authorship doubted; Su Shi's children a friend's report; "seven parts history" traced to Zhang Xuecheng; the empty city first told of a Wei commander; the borrowed arrows left to `cnh-276`**; the glossary dated 1522 and given the 1494 preface. |
| `cnh-292` Sun Hao | 6 | 5 → 6 | **The unsourced 2,300,000 and "one dynasty again" dropped; the surrender bound with a coffin, Wei Zhao's tea, Wuchang and the marquis title; the Chinese *Sanguozhi* with Pei Songzhi's notes**. Protected: the line stays (flagged below). |
| `cnh-293` Jin dynasty | 7 | 5 → 7 | **`Dated 266 – 420 CE` / `Also dated 265 – 420 CE` (Theobald's 8 February 266; Giles's and Cordier's 265) / `Western Jin 266 – 316 CE` / `Eastern Jin 317 – 420 CE`; the founding sacrifice with the southern chanyu present, the name from Sima Zhao's title (not Aguda's Jurchen Jin), the *Jinshu* ordered under the Tang; the years out of the questions**; the glossary `Jin_dynasty_(266–420)` redrafted (the audit's pairing reads the Jurchen entry, below). |
| `cnh-294` Emperor Wu of Jin | 7 | 5 → 7 | **The goat cart in the harem (the *Jinshu*, attributed), the restored 27-month mourning and the nineteen provinces (Giles), the heir kept on Empress Yang Yan's advice; the Wu palace women the *Jinshu*'s "several thousand" against Cordier's and Theobald's 5,000**. Protected: the line stays. |
| `cnh-295` conquest of Wu by Jin | 7 | 6 → 7 | **Rebuilt on the *Jinshu* ch. 42: the wood shavings, the chains and spikes cleared with straw soldiers and oiled torches, Wang Jun passing Wang Hun "with the wind", his memorial; Yang Hu's recommendation of Du Yu sourced (Giles); the line kept (`Campaign 279 – 280 CE` / `Surrender 1 May 280 CE`, the day de Crespigny's own)**; "more than 5,000 ships" and the nineteen provinces dropped; the surrender ritual left to `cnh-292`. |
| `cnh-296` zhantian | 5 | 5 → 5 | **The *Jinshu*'s own rule (ch. 26): 70 mu for a man and 30 for a woman, the *ketian* 50 and 20, the age bands, the *hudiao* levy, land and tenants by rank (50 tenant households for the top ranks; Theobald's 15 noted); "5,000 mu" (the old card's conversion) dropped; whether it was enforced given as two readings (de Crespigny; Chen 1911)**. 占田 kept as the traditional form (the *Jinshu*'s own), against OpenCC's 佔田. |
| `cnh-297` War of the Eight Princes | 6 | 5 → 6 | **The battle template off, now `Fought 291 – 306 CE` / `Also dated 300 – 306 CE` (Zhao Qi's list, "now generally followed", de Crespigny); the *Jinshu*'s annals of Emperor Hui (the one-city orders, the arrows at Tangyin, Liu Yuan's title, the Xianbei sack of Chang'an); Balazs's 291 – 311**; Cordier's 100,000 dead and Chen 1911 dropped. |
| `cnh-298` menfa | 5 | 5 → 5 | **Liu Yi's saying (`cnh-288`'s), the Wang and Xie pairing (`cnh-315`'s) and the shelter quotas (`cnh-296`'s) off the questions; the marriage bar, "Wang and Ma share the realm", the *Shishuo xinyu*'s people; Balazs on the walled estates and the graders' kin; the 5th-century opening to men of humble birth**. |
| `cnh-299` qingtan | 7 | 6 → 7 | **The line tied to the Zhengshi era (240, Spiro) and the Jin's end (420); Wang Yan's capture and deathbed regret the *Jinshu*'s story, with Balazs's view that a historian wrote both speeches; its growth from late-Han "pure criticism"; Xie An's defence (the *Shishuo xinyu* in Chinese)**; the nine-rank sentence and the being-and-nothingness clue (`cnh-856`'s) dropped. |
| `cnh-300` Seven Sages of the Bamboo Grove | 8 | 6 → 8 | **The man-naming labels and the "or" off, now `Lived 205 – 305 CE` / `Leader executed 262 CE` / `Also dated 263 CE`; told as a later grouping (Sun Sheng long after; the *Shishuo xinyu* fixes the name and the grove; Spiro: no evidence all seven knew one another); the Nanjing reliefs late 4th or early 5th century, their trees not bamboo; Ji Kang at his forge, Liu Ling's spade, Ruan Ji's sixty days drunk**. **Pinyin Zhúlín qī xián → Zhúlín Qīxián, joined as the official orthography has it.** |

Read by eye. **Confusability**: the surrender ritual stays `cnh-292`'s, the chains and the wind `cnh-295`'s; the 27
princes `cnh-294`'s; Liu Yi's saying `cnh-288`'s (the menfa agent was told); the goat cart and the nineteen provinces are
`cnh-294`'s; answer word "emperor" cleared on `cnh-294`, its background trimmed to 285 words. **Legend**: the Seven Sages
as a group and the grove are later tellings; Wang Yan's regret the *Jinshu*'s. **Chinese names corrected**: `cnh-300`
pinyin. **Spellings fixed**: none needed; 0 hits. **Myth register**: the Seven Sages confirmed (Sun Sheng, then the
*Shishuo xinyu*; Spiro's doubt) and corrected (the Nanjing tomb late 4th or early 5th century; Chen Yinke's Buddhist name
and the *Wei shi chunqiu* title on no page read); the Romance and the Records confirmed (the 1494 preface; Mao Lun).
**Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-292`'s 242 is Giles's (de Crespigny gives
241) and 3 September 264 is on no page read; `cnh-294`'s 8 February 266 sits against de Crespigny's 4 February.
**`cnh-293`'s glossary**: the card was never paired with the wrong entry on the site — the audit's lookup normalises the
Jurchen entry's alias "Jin dynasty (1115–1234)" to "jin dynasty" and so reads `Jin_dynasty_(1115–1234)`; its `G.date`
on `cnh-293` is that false lead, and the right entry, `Jin_dynasty_(266–420)`, was the one rewritten.

### The third hundred, in sum

`cnh-201`–`cnh-300` (the end of the Qin, the whole of the Western Han, Xin, Eastern Han and Three Kingdoms decks, and the
first eight of the Western Jin) are done: 520 sources became 676 and 53 glossary entries were rewritten. `cnh-audit.js
--range=cnh-201:cnh-300` reads 54 of 100 cards clean, against none at the baseline; what remains is 34 cards with no
picture (Commons answered 429 all session), 18 advisory `W.not-why`, 3 `L.missing` (`cnh-203` and `cnh-207`, a road and
a wall with no point to fetch, and `cnh-276` Red Cliffs, whose site is disputed — none by design), 2 `Z.reading?` that
are polyphones read as the house reads them (冒顿 Mòdú, 角 Jué), one `Z.trad` that is the *Jinshu*'s own form (占田) and
one false `G.date` (`cnh-293`, below). `check-cnh-spellings.js` reads 0 card hits over the hundred (the baseline's 9
cards with a variant are fixed: Hu Hai, Lü Hou, Lulin, Shu-Han; `cnh-204`'s "Cheng Zhou" is a cited author); the 5 glossary hits left are entries outside the hundred.
Fifty agents worked two cards each, never more than ten at once; as each draft came back its clues went into `AGENT.md`
and running agents were told of any shared clue (the forged order, the Gaixia songs, the Hexi conquest, the deathbed
charge, the *Chu shi biao*, Liu Yi's saying) or new route to a source. Each batch was applied alone, verified field by
field against its drafts, diffed for the protected lines and committed with its docs (B29 and B30 were applied back to
back and share their data in the B29 commit); `origin/main` was merged once mid-run (after B23) and the protected lines
diffed again.

What the hundred found, again and again:
- **The *Shiji*, the *Hanshu*, the *Hou Hanshu* and the *Sanguozhi* read as records.** Hong Gate's staging, the Chu songs
  at Gaixia, the dragon birth, the human pig, the Kunyang portents, Liang Ji's poisoned cakes: each is now its text's,
  dated and named, and where a modern reader doubts it (de Crespigny's "rumoured", Bielenstein on Wang Mang, Fukui on
  Ban Gu's "victory of Confucianism"), the card says so.
- **The *Romance of the Three Kingdoms* told as the *Sanguozhi*.** The Peach Garden, the borrowed arrows, the east wind,
  the chained ships, Huarong, the empty city, the Green Dragon blade, Diaochan: all are now the novel's, and the empty
  city is traced to a *Weilüe* story of a Wei commander.
- **Battle templates and people on the date line.** Gaixia, Kunyang, Guandu, Red Cliffs, the Seven States, the Xiongnu
  wars, the Yellow Turbans and the Eight Princes carried Location, Casualties and Result rows ("c. 88,000", "80,000 Chu
  killed, 20,000 captured", "Lulin victory"); labels named men ("Wen reigned", "Er Shi died", "Chen Shou lived"); values
  carried places ("north of the Si river") and counts ("Workforce over 700,000", "Provinces 13", "Ziying reigned 46
  days"). All are now in prose, attributed, or gone.
- **A date belonging to another event.** The iron monopoly dated by its officials' appointment (120 BCE; Wagner's 117),
  the Lingqu canal by an official's posting, the Weiyang Palace by its founder's death, the Shiji by its coverage, the
  wuzhu's abolition and restoration by the wrong reigns (7 and 26 CE; the *Hanshu* and *Hou Hanshu*: 9 and 40 CE).
- **Sources that did not say it.** Wylie's "four thousand" where the *Hanshu* has 四萬餘人; a register read the opposite
  way from its own source (Lelang, 45 BCE); a Ming-wall study for the Qin wall's crust; a climate paper for the consort
  clans; "thirty years on the history" in Hirth; Gaozu's labourers "died" where the *Shiji* has them run away (徒多道亡);
  Sang Hongyang "built" the monopolies; Kong Jin "complained" (it was Bu Shi). All corrected or dropped.
- **Two French or two Chinese sources on one card, and one author three or four times** (Cordier and Chavannes together,
  de Crespigny four times on Shu Han). Every card now has one source per language and a modern author at most twice.

**The Chinese name.** Corrected: `cnh-211` (沙丘之变 → 沙丘之谋, the *Shiji*'s phrase), `cnh-219` (汉初建国安排 → 郡国制),
`cnh-234` (盐铁专卖 → 盐铁官营), `cnh-268` (黃巾之亂 in the simplified field → 黄巾起义); six simplified fields that held
traditional forms (`cnh-262`, `263`, `266`, `267`, `268`, `269`) and seven `traditional` fields that held simplified ones
(`cnh-271`, `272`, `273`, `275`, `276`, `279`, `280`); pinyin on `cnh-212` (Qín cháo), `cnh-254` (Hàn Guāngwǔdì) and
`cnh-300` (Zhúlín Qīxián). Descriptive names kept for want of a standard term, for the owner: 秦平百越, 秦朝灭亡, 新朝 (the
*Hanshu* names the dynasty 新), 河流改道. **Spellings**: rows added for the excavated archives, the Qin's end, the Chu–Han
men, the Han emperors (English order; the joined Chinese forms as aliases), Empress Lü, the Xiongnu and chanyu, Modu,
heqin, the Han men and women, the two capitals, the Western Regions, the four histories, Pei Songzhi, the Red Eyebrows
and Lülin, the Yellow Turbans, the Three Kingdoms men and states, the battles, tuntian and zhantian, the nine-rank
system, the Romance, the Jin, qingtan, menfa and the Seven Sages.

**The myth register** gained ten rows at the start (the burning of the books, Xu Fu, the Shaqiu plot, Hong Gate,
Gaixia, Liu Bang's dragon birth, Wang Mang as usurper, the Peach Garden, the Romance against the Records, the Seven
Sages); every one was confirmed or corrected by the batch that drafted its card. Corrections: the Confucian reading of
the burned scholars is already the *Shiji*'s own (Fusu's protest); Xu Fu's Japan landing is first written in 955; the
*Zhao Zheng shu* could not be confirmed from an open source; Consort Yu's suicide is the opera's; the empty city began as
a Wei story; Diaochan is the novel's; the Nanjing reliefs of the Seven Sages are late 4th or early 5th century and the
*Wei shi chunqiu* title and Chen Yinke's Buddhist grove are on no page read.

**The protected cards** (`cnh-206`, `210`, `215`, `216`, `220`, `223`, `226`, `228`, `229`, `237`, `240`, `246`, `254`,
`257`, `259`, `261`, `262`, `263`, `265`, `269`, `270`, `271`, `272`, `274`, `278`, `280`, `281`, `285`, `286`, `289`,
`292`, `294`) kept their `answerDate`, `undatable` and `timeline` byte for byte through every apply and the merge of main.
Every background now carries the years on its card's line. Rows flagged for the owner, left as they stand (details in
each batch): birth years in no source read on `cnh-206` (250), `220` (241), `228` (140), `229` (195), `237` (179, and
104 for the death), `262` (50 – 62), `269` (174), `271` (154); a birth year given otherwise elsewhere on `cnh-215` (233
fits "24" only in full years), `216` (247 Giles's; 256 unread), `246` (Giles 33), `254` (Giles 4 BCE), `280` (Giles 162),
`289` (Giles 178), `292` (de Crespigny 241); rows that look wrong — `cnh-228`'s "First command 121" (the *Shiji*: 123,
at eighteen), `cnh-240`'s "Grand Astrologer 110" (his father's death; the office three years later), `cnh-270`'s "Grand
Preceptor 189" (191 in the *Sanguozhi*'s order), `cnh-274`'s "King of Wei 217" (216 in the chronicle, Cordier and Giles),
`cnh-285`'s "23 May 229" (de Crespigny: 23 June), `cnh-271`'s "General-in-Chief 196" (197); places — `cnh-206`'s Yulin
(the *Shiji*: Yangzhou), `cnh-223`'s Chang'an (the *Hanshu*: Wuzha palace), `cnh-286`'s "Linju, Xiangyang" (Linju lay in
Nan commandery), `cnh-220`'s Shanfu (her father's home); and the days on the person template, nearly all conversions
or unprinted (`cnh-216`, `220`, `246`, `254`, `272`, `278`, `280`, `281`, `289`, `292`, `294`). Ages rest on these years.

**The open decision on `cnh-234`** is resolved from the sources read: 120 BCE is the year Dongguo Xianyang and Kong Jin were appointed; the monopoly itself is `Set up 117 BCE` (Wagner, and Liu and Wood) / `Also dated 119 BCE` (Chavannes).

**For the owner, outside the hundred**: `cnh-245` and `cnh-213` now agree on 9 CE for the Xin; `wh-407` gives 34
prefectures in 214 BCE (the texts disagree); `cnh-192` and `wh-404` make the First Emperor king in 247 BCE while two
studies start his tomb in 246 BCE; the audit's glossary lookup reads `Jin_dynasty_(1115–1234)` for "Jin dynasty"
because that entry's alias "Jin dynasty (1115–1234)" normalises to the same surface — `cnh-293` was never mispaired on
the site, and its right entry, `Jin_dynasty_(266–420)`, was rewritten; the `Xiongnu` glossary's Huns sentence still rests
on Parker 1895; the Su_Qin and Zhang_Yi entries still state 333 / 318 / 310 BCE as fact (not opened this run).

### Locators (2026-11-12, the third hundred)

Wikipedia's API answered at the end of the run (Commons still 429, so no picture pass), and `add-locators.js` wrote nine
points, each fetched: five of the six first-hundred sites — `cnh-053` Sanxingdui, `cnh-063` Erlitou site, `cnh-075` the tomb of Fu
Hao (labelled Xiaotun), `cnh-089` Zhengzhou Shang City, `cnh-090` Panlongcheng (from its Wikidata item Q217684; the
article carries no primary coordinate) — and all four of the second hundred's: `cnh-121` Chengzhou (the article "Luoyi"
resolves to Luoyang's own point; the Zhou city lies inside the modern one — review), `cnh-150` Chengpu, `cnh-180` Maling
(the article's point; the site is disputed — Maspero puts it near Daming) and `cnh-181` Changping. `cnh-080` Xibeigang has
no article and no Wikidata item with a coordinate, and is still waiting. In the third hundred, `cnh-203` (the Qin roads)
found no article for the Straight Road with a coordinate, `cnh-207` (the Qin walls) has no single point, and `cnh-276`
Red Cliffs has none by design (the site is disputed). `glossary-places.js` was rebuilt (`build-glossary-places.js
--install`), as `check-places.js` asked once the new points were in.

**`migrate-places.js` was NOT re-run.** The new points' toponyms were not in its Wikidata cache, and `--fetch` ran into
the query service's rate limit and stopped at its time cap after the title pass; the partly filled cache would have
re-derived `places` for some 500 cards across the site (1,609 toponyms resolved against 1,161), a change far outside this
audit, so the cache was put back and no card's `places` changed. The nine cards therefore carry a locator but no
`places` id yet; a later session should run `migrate-places.js --fetch` to completion and then the migration, reviewing
its diff. `migrate-places.js --check` reports the same six failures on this branch as on `origin/main` (five `in-` cards
whose derived places they do not carry, and `atlas/data/wars.js` out of step) — none from this audit. Points to review in
the hundred: `cnh-228` Huo Qubing's point is Jiuquan, a Hexi town, not his tomb; `cnh-256` Luoyang's is the modern city,
not the Han–Wei walled site; `cnh-260` (a text) and `cnh-287` (an institution) carry points they need not.

### B31 — `cnh-301`–`cnh-310`, Western Jin and Sixteen Kingdoms: the Disaster of Yongjia to the Battle of Fei River (2026-11-13)

The fourth hundred's first batch, run as the third's were (`AGENT.md`, the notes file, two cards an agent, at most ten
at once); every draft read by eye and prechecked before `batch.sh` applied it. Every cited URL answered. **Pictures were
not touched** (Commons answered with its rate-limit page to the session's one test call). **The old cards cited the
*Jinshu* on Chinese Wikisource (a Wikimedia host, now unreachable) on nearly every card, put a battle template on Fei
River ("Date 30 November 383 CE", a day no page read prints; "Location"; "Result"), named places and men in labels
("Luoyang falls", "Huai executed", "Shi Le emperor", "King of Yan", "Fei River"), carried years in most phrasings, and
told the Fei River numbers, the whips and the cranes in their own voice.** The *Jinshu* was read in Chinese on zggdwx.com
(juan 101–114) and the Kanseki Repository (juan 1–33).

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-301` Disaster of Yongjia | 6 | 5 → 6 | **The labels off: `Capital fell 13 July 311 CE` (de Crespigny's printed day; the *Jinshu* has only the sixth month) / `Emperor killed 313 CE`; who broke in given as the sources differ (the *Jinshu*: Liu Yao and Wang Mi; de Crespigny: Shi Le); the *Jinshu*'s 30,000 dead as its figure; Sogdian Ancient Letter II from Sims-Williams's own note (the old Silk Road Seattle page 403)**; the letter's "Luoyang and Ye were no more" dropped (on no page read). |
| `cnh-302` Emperor Min of Jin | 5 | 5 → 5 | **The coffin surrender (`cnh-292`'s clue) out of the questions: the yeast-cake gruel, the bean-field rhyme, the halberd and the cup-rinsing at Pingyang, all the *Jinshu*'s; his death the *Jinshu*'s version (Cordier blames a Jin raid)**; Theobald's and Giles's birth year 270 (impossible) not used. Protected: the line stays (flagged below). |
| `cnh-303` Sixteen Kingdoms | 7 | 5 → 7 | **Told as Cui Hong's label, from his memorial in the *Weishu* (in Chinese): sixteen houses counted, the book withheld, presented by his son; Holcombe's "as many as twenty-two significant states"; the five peoples left to `cnh-304`; the years out of the questions**; Parker's 1895 Goths-and-Vandals sentence dropped. **Pinyin Shíliù guó → Shíliùguó**, joined as the live Sānguó and Wǔdài Shíguó. |
| `cnh-304` Five Barbarians | 6 | 5 → 6 | **"First states 304 CE" (one event's date for a label) now `Founded states 304 – 439 CE` (Theobald's span, said so); the label in use from the *Jinshu*: the captive Fu Jian refusing his seal to Yao Chang because the Qiang had "no name in the order of the Five Hu"; Guo Qin's 280 plan and Jiang Tong's 299 essay from de Crespigny**; the Wikisource essay and its unsaved quotation dropped. |
| `cnh-305` Han-Zhao | 6 | 5 → 6 | **`Founded 304 CE` / `Imperial title 308 CE` / `Renamed 319 CE` / `Ended 329 CE`; the Han claim told as the *Jinshu*'s (the princess given to Modu), with Holmgren's view of such pedigrees; the chanyu's office beside the school-trained officials**; "a page at the Wei court" and "killing an elder brother" (unsourced) dropped. |
| `cnh-306` Later Zhao | 6 | 5 → 6 | **"Shi Le emperor" off and the end given: `Dated 319 – 351 CE` (Theobald's table; Shi Zhi killed 351, Cordier) / `Also dated 319 – 350 CE` (Ran Min's seizure) / `Imperial title 330 CE`; Shi Le's slavery and his surname from Ji Sang, the guoren and the National University, Ran Min's massacre with the *Jinshu*'s 200,000 as its figure**; the eighteen horsemen dropped; Fotudeng left to `cnh-312`. |
| `cnh-307` Former Yan | 6 | 5 → 7 | **"King of Yan" relabelled `Founded` (337 / 352 / 370 kept); the *Jinshu* juan 111: Kezuhun and Murong Ping's plot against Murong Chui, Murong Ping selling firewood and water to his own troops, the Lu River rout, the 40,000 households moved; Holmgren's caution on the histories' praise**; Cordier's 1,500,000-man army not used. |
| `cnh-308` Former Qin | 7 | 5 → 7 | **"Fei River" relabelled `Defeated` (351 / 383 / 394 kept); Fu Hong's Linwei Di origin, the surname Pu, the wheat-sowing ruse at Fangtou (the *Jinshu*'s), the resettlement that made the collapse quick; the founder Fu Jian (351 – 355) left unnamed so the glossary's Fu Jian link reaches only the nephew**. |
| `cnh-309` Fu Jian | 7 | 5 → 8 | **The years and the whips out of the questions: the Imperial Academy boast, the refusal to kill Murong Chui, Wang Meng's dying plea (the *Jinshu* juan 113); the *Jinshu* named as a Tang compilation; the Laozi and prophecy ban the *Jinshu*'s own; the Heavenly King title the *Jinshu*'s (Theobald gives it to the founder)**. Protected: the line stays (flagged below). |
| `cnh-310` Battle of Fei River | 7 | 5 → 7 | **The battle template off, now `Fought 383 CE`; the *Jinshu*'s 600,000 foot and 270,000 horse against 70,000 (80,000 in juan 79) as its figures, Zhu Xu's "million" its rhetoric; Liu Laozhi's night attack, Mount Bagong, Zhu Xu's secret advice, Fu Rong's fall; Rogers's "Myth of the Battle of the Fei River" cited for its title's doubt**; "present-day Anhui" dropped. |

Read by eye. **Confusability**: the coffin surrender stays `cnh-292`'s; Emperor Huai's servant's robe `cnh-301`'s and the
Pingyang humiliations `cnh-302`'s (the Han-Zhao agent was told); the five peoples `cnh-304`'s and Cui Hong's count
`cnh-303`'s; Fu Jian's seal refused to Yao Chang `cnh-304`'s (the Fu Jian agent was told); the whips and the cranes
`cnh-310`'s, Murong Chui's welcome and Wang Meng's plea `cnh-309`'s (the Former Yan and Qin agent was told); `cnh-307`
tells Murong Chui's flight from the Yan side, `cnh-309` his welcome from the Qin side. "Yangzi" in the drafts' own voice
was made "Yangtze". **Legend**: the whips, the wind and cranes, Murong Ping's firewood, the wheat ruse and the Han
pedigree are now the *Jinshu*'s, a Tang compilation of 646 – 648 CE. **Chinese names corrected**: `cnh-303` pinyin
(joined); `汉赵` kept though no page read prints the two characters together (the *Jinshu* writes the state 漢, later
趙). **Spellings fixed**: none needed; 0 hits (rows added for the hundred). **Myth register**: Fu Jian's whips and the
wind and cranes confirmed in the *Jinshu* juan 114, Xie An's *weiqi* in juan 79; Zhu Xu's shout in neither juan read.
**Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-302`'s "7 June 313" is on no page read (the
*Jinshu*: the fourth month, *renshen* day) and its death may fall early in 318 (the twelfth month of Jianxing 5);
`cnh-309`'s "16 October 385" is on no page read (Giles prints 337 – 384, a slip; Theobald gives the reign as 357 – 384 in
one place and 356 – 384 in another).

### B32 — `cnh-311`–`cnh-320`, Sixteen Kingdoms and Eastern Jin: the lodged commanderies to Tao Yuanming (2026-11-13)

Run as B31. Every cited URL answered but one: Tsyrenov's 2022 article on Wang Dao (`cnh-316`), whose host reset the
connection on the re-curl; the agent had saved its page. **Pictures were not touched.** **The old cards again cited the
*Jinshu* on Chinese Wikisource, used the Wang–Ma saying (`cnh-298`'s) and the Wang–Xie pairing as clues, gave Jiankang a
century, a prose founding and an unowned "over 1,000,000" on its line, named men in the Xie clan's labels, dated the
lodged commanderies with a "from" value and a 341 no page prints, and treated the *Admonitions* scroll as Gu Kaizhi's own
hand.** The *Jinshu* was read on zggdwx.com (juan 62, 65, 79, 80, 98), the *Song shu* and Huijiao's *Gaoseng zhuan* on
the Kanseki Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-311` lodged commanderies | 5 | 5 → 5 | **`In use c. 317 – 589 CE` / `Tuduan act 364 CE` / `Registers merged 413 CE` (Theobald); the old 341 (on no page) dropped; Tan Qixiang's 900,000 given as his 1934 estimate, "one in eight" northerners moved; Jianye as a refuge after Shi Le's attack of 312**; Parker and Cordier out. |
| `cnh-312` Fotudeng | 5 | 5 → 5 | **Rebuilt on Huijiao's *Gaoseng zhuan* (juan 9): a man of the Western Regions surnamed Bo; the lotus, the bells and Liu Yao's capture told as his biographer's; death 349 (Bingenheimer) beside Giles's 348; "a man of India" off the glossary**. Protected: the line stays (flagged below). |
| `cnh-313` Eastern Jin | 7 | 6 → 7 | **"Emperor Yuan 318 CE" relabelled `Throne taken`; Su Jun's rising dated 328; the court's Luoyang speech among Wu and Chu speakers (Chittick); Sun En and Huan Xuan's Chu; the Wang–Ma saying (`cnh-298`'s) off**; Parker out. |
| `cnh-314` Jiankang | 6 | 5 → 7 | **The line made dates: `Founded 212 CE` / `Renamed 313 CE` / `Capital 317 – 589 CE`; the rename for Emperor Min's name taboo (the *Jinshu*'s geography; Cordier, Gaillard and Theobald credit Sima Rui); Chittick's "well over a million" against Gaillard's 90 hectares; the Sui razing 589 (Gaillard misprints 598)**; the glossary made to agree. |
| `cnh-315` Xie clan | 5 | 6 → 6 | **The man-naming labels off: `Statesman lived 320 – 385 CE` / `Victory 383 CE` / `Poet lived 385 – 433 CE`; the Eastern Mountain, the Tang poet's line on the Wang and Xie, Xie Xuan on Lingyun; the *weiqi* the *Jinshu*'s (juan 79)**; "most eminent" softened in the glossary. |
| `cnh-316` Wang Dao | 6 | 6 → 6 | **The Wang–Ma saying out of the questions: the Xinting tears, the coarse cloth, the fan against Yu Liang's dust; the throne-sharing offer in Think it through; Lycas (HAL, barred) replaced by the *Jinshu* juan 65 and Holcombe**. Protected: the line stays (flagged below). |
| `cnh-317` Zu Ti | 6 | 5 → 6 | **The oar oath and the midnight cockcrow told as the *Jinshu*'s (juan 62); the bags of earth as rice; Liu Kun's letter; Theobald's "Wang Dun prompted Dai Yuan's appointment" dropped against the *Jinshu* and Tsyrenov**. Protected: the line stays (flagged below). |
| `cnh-318` Huan Wen | 6 | 5 → 6 | **The years out of the questions: the willows, the fragrant name and the stench, the cut grain at Chang'an; Fangtou 369 (Giles's 368 a slip); the nine bestowals' "before a change of dynasty" dropped; Kleeman on Cheng-Han**. Protected: the line stays. |
| `cnh-319` Wang Xizhi | 7 | 6 → 7 | **The Lanting story (`cnh-357`'s and `cnh-944`'s) off the questions: the geese for the *Daodejing*, the eastern couch, the oath at his parents' tomb (the *Jinshu* juan 80); the burial with Taizong "is said to"; the unconverted 355 dropped**. Protected: the line stays (flagged below). |
| `cnh-320` Tao Yuanming | 7 | 6 → 7 | **The fisherman (`cnh-925`'s) off: the inspector and the five pecks, the ninth-day chrysanthemums, the reign titles against cyclical signs (the *Song shu* juan 93); his own preface to "Back Home" (405); the traditional 365 against a later scholar's 352; the Peach Blossom Spring his own fiction**; the unsourced 376 dropped. Protected: the line stays. |

Read by eye. **Confusability**: Xie An's blocking of Huan Wen stays `cnh-315`'s (the Huan Wen agent was told); Sun En
and Huan Xuan `cnh-313`'s (the Liu Yu agent was told); the 364 *tuduan* `cnh-311`'s; Wang Dao's own clues kept off the
Wang–Ma saying. **Legend**: the *weiqi*, the oar oath, the cockcrow, the geese and the Taizong burial are now each the
*Jinshu*'s or "said to be"; Fotudeng's wonders Huijiao's. **Chinese names corrected**: none needed; 佛图澄 kept as
Fótúdèng against the dictionary's chéng (Wright's "Fo-t'u-teng"; no source read prints the dèng reading — for the
owner). **Spellings fixed**: none needed; 0 hits. **Myth register**: Wang Xizhi's preface confirmed as the card's
mention only (He Yanzhi's account on no page read); the Peach Blossom Spring confirmed as his fiction.
**check-citations**: `cnh-318`'s Tsyrenov 2020 is reported mismatched because its title is cited in transliterated
Russian where Crossref gives the English (the same paper). **Protected lines: unchanged** (diffed after the apply). For
the owner: `cnh-312`'s 232, Kucha, 13 January and the ages are on no page read (Huijiao: the 8th day of the 12th month);
`cnh-316`'s 7 September and `cnh-318`'s 18 August are on no page read; `cnh-317`'s 313 is on no page read and its death
sub-row "Zhengzhou, Henan" looks wrong (Yongqiu is Qi County, under Kaifeng); `cnh-319`'s Linyi and Shan County are on no
page read; `cnh-319` and `cnh-320`'s ages agree with the histories' 59 and 63 in *sui*.

### B33 — `cnh-321`–`cnh-330`, Eastern Jin and the Northern and Southern dynasties: Gu Kaizhi to the Northern Wei (2026-11-13)

Run as B31. Every cited URL answered. **Pictures were not touched**; none of the ten cards has a picture. **The old cards
cited the *Song shu*, *Liang shu*, *Chen shu* and *Wei shu* on Chinese Wikisource, put a battle template on the Hou Jing
rebellion ("4 years", "Result Rebellion crushed by Wang Sengbian"), named a man in the Liang's label ("Hou Jing revolt"),
used "Nan Qi" in the Southern Qi's own voice, gave the Admonitions scroll to Gu Kaizhi's hand, and carried years in most
phrasings.** The histories were read in the Siku text on the Kanseki Repository and on zggdwx.com.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-321` Gu Kaizhi | 7 | 5 → 7 | **No painting proved his: the *Admonitions* scroll perhaps a Tang copy and neither scroll tied to him before the Song (Hu 2009); the unpainted pupils, the Vimalakirti pledge and Pei Kai's three hairs; Kerlan-Stephens's review (c. 345 – 406) the one French source**. Protected: the line stays (flagged below). |
| `cnh-322` Liu Yu | 6 | 5 → 6 | **The *Song shu* juan 1 (zggdwx) for the Wikisource juan 3; the straw-sandal seller of the Jingkou army, the unguarded Dabian pass, Chang'an taken and lost to the Xia; the altar and "eased the later successions" (unsourced) dropped**. Protected: the line stays (flagged below). |
| `cnh-323` Northern and Southern dynasties | 7 | 5 → 7 | **420 told as a convention, 386 or 439 the other northern starts (Theobald after Huang Huixian); the Six Dynasties label (220 – 589) and Chittick's "Jiankang Empire"; the *Beishi*'s "braided caitiffs" and "island barbarians"; Li Yanshou's two histories**; "the *Song shu* written under the Liang" (it was presented under the Southern Qi) dropped. |
| `cnh-324` Liu Song | 6 | 5 → 6 | **The answer word "Liu" and the years out of the questions; Taiwu on Guabu hill with his camels (the *Song shu* juan 95), the document clerks, the Yuanjia era; Giles's 451 beside Theobald's 450 for the raid**; the Han-founder descent and "fourteen princes" dropped. |
| `cnh-325` Southern Qi | 6 | 5 → 7 | **"Nan Qi" made Southern Qi; the register review "begun in 480", Tang Yuzhi's revolt; Hu Xiezhi's family taught court speech (the *Nan shi*, through Chittick); Xiao Luan the founder's nephew (Cordier), not Emperor Wu's cousin**; "early 4th century" (on no page) dropped. |
| `cnh-326` Liang dynasty | 7 | 5 → 8 | **"Hou Jing revolt" relabelled `Rebellion` (548 – 552 kept); the Wen Xuan (`cnh-342`'s) and Hou Jing (`cnh-328`'s) off the questions: the burst Huai dam (its year left off: Theobald 516, Giles 515), the Jiangling library burned, the sixteen classes; the Chu-speaking generals (Chittick)**. **Name 梁 → 梁朝, Liáng cháo** (as 晋朝, 新朝). |
| `cnh-327` Emperor Wu of Liang | 7 | 5 → 7 | **The *Liang shu* juan 3 (Kanseki): the three self-givings to the Tongtai Monastery and the ransoms, the dough victims; Sotomura 1999 (J-STAGE, in Japanese) for 527 and the doubt on the Jiming Temple site; Bodhidharma's "no merit" told as a Buddhist story (Edkins)**. Protected: the line stays (flagged below). |
| `cnh-328` Hou Jing rebellion | 6 | 5 → 6 | **The battle template off: `Rebellion 548 – 552 CE` / `Capital fell 549 CE` / `Usurped throne 551 CE` (Cordier's 552 for the Han title not used); the *Liang shu* juan 56: Xuanwu Lake turned on Taicheng, "Great General of the Universe", the corpse eaten in the market**. |
| `cnh-329` Chen dynasty | 6 | 5 → 7 | **The *Chen shu* juan 7 for Wikisource; the name from the founder's title, his Buddhist vows, "Jade Trees in the Rear Court"; the well left to `cnh-345`; the far-southern fighters (Chittick)**; the glossary's Cordier claim (not on his page) dropped. **Name 陈 → 陈朝, Chén cháo.** |
| `cnh-330` Northern Wei | 7 | 5 → 7 | **The Xiaowen and grotto clues out: the farmers moved to the capital region with land and oxen, Cui Hao's history on roadside stones, the heir's mother killed and the metal image cast (Parker's, hedged); Hershock (Stanford Encyclopedia) and the *Wei shu* juan 35**; the 446 persecution kept off the questions (`cnh-895`'s). |

Read by eye. **Confusability**: Sun En and Huan Xuan stay `cnh-313`'s; the well `cnh-345`'s and Chen Bozhi's clerk
`cnh-326`'s (the Chen agent was told); Xiao Hong's hoard appears in Think it through on both `cnh-326` and `cnh-327`, never
a question; the Luoyang move `cnh-333`'s. **Legend**: Bodhidharma's meeting is a Buddhist story; no source read dates its
first telling (the register row stays provisional). **Chinese names corrected**: `cnh-326` 梁朝 and `cnh-329` 陈朝, the
house form of 晋朝 (`cnh-293`) and 新朝 (`cnh-245`); `cnh-323`'s Nánběicháo left joined (for the owner, as the open pinyin
decision). **Spellings fixed**: `cnh-325`'s "Nan Qi"; "Yangzi" made "Yangtze". **Myth register**: Emperor Wu and
Bodhidharma — the story told as a Buddhist one; its first telling not dated by any page read. **Protected lines:
unchanged** (diffed after the apply). For the owner: `cnh-321`'s 344 is on no page read (the background calls it a modern
reckoning; Kerlan-Stephens gives c. 345); `cnh-322`'s birth is 356 in Giles against Theobald's 363, the *Song shu* gives
his age as 60 by the Chinese count against the line's 59, and Chittick puts the Guanzhong campaign in 417 – 418;
`cnh-327`'s "12 June 549" is on no page read.

### B34 — `cnh-331`–`cnh-340`, Northern and Southern dynasties: the Tuoba to the fubing (2026-11-13)

Run as B31. Every cited URL answered. **Pictures were not touched**; none of the ten cards has a picture. **The old cards
cited the *Wei shu*, *Zhou shu* and *New Book of Tang* on Chinese Wikisource and two Yungang and Longmen papers on
mdpi.com (a barred host), named places in the Tuoba's labels ("At Shengle", "Northern Wei"), put prose in Pingcheng's line
("made the Northern Wei capital"), read the equal-field system as equal land, told the Pingcheng card as the move to
Luoyang (`cnh-333`'s), and carried figures no page gives ("254 caves", Ge Rong's "million", "2,000 officials", "about 630"
garrisons).** The histories were read in the Siku text on the Kanseki Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-331` Tuoba | 6 | 5 → 6 | **The place labels off: `New seat 258 CE` (the *Wei shu*'s own count, converted by Holmgren and Theobald) / `Ruling house 386 – 534 CE` / `Inscription 443 CE` / `Renamed 496 CE`; the Yellow Emperor descent Wei Shou's arrangement (Holmgren); the 443 Gaxian cave sacrifice (the *Wei shu* juan 108; the cave found 1980); Theophylact's Taugast (Yule, Cordier)**. |
| `cnh-332` equal-field system | 7 | 5 → 7 | **Not equal land: "equal" the aim in theory; shares to persons, slaves and oxen; the grain land for life against the heritable mulberry plot; the village heads Li Chong's proposal of 486, kept apart from the 485 edict; the Turfan grave papers (Hansen and Rong) for the Tang system there in 640; Asakawa on Japan's copy**; the old "two shi" dropped (the Siku *Wei shu* prints one). |
| `cnh-333` Emperor Xiaowen | 7 | 5 → 7 | **The *Wei shu* juan 7 (Kanseki): the armoured ride halted by kowtowing ministers, Empress Dowager Feng's cold room, the northern-speech edict and the Henan burials; Giles's "died after a crushing defeat" refused (the *Wei shu*: his army won)**. **Name 孝文帝 → 北魏孝文帝, Běi Wèi Xiàowéndì** (the bare title is also Emperor Wen of Han's). Protected: the line stays (flagged below). |
| `cnh-334` Pingcheng | 6 | 5 → 7 | **`Capital 398 – 494 CE` for the prose value; the card made Pingcheng's own: Yilu's southern capital of 313 and "Lesser Pingcheng", the 398 founding (the *Wei shu* juan 2), the resettled farmers and craftsmen as the *Wei shu* counts them, the western-suburb sacrifice; "nearly one million" one study's figure**; the move to Luoyang left to `cnh-333`; the Mingtang (report unopened) not told. |
| `cnh-335` Yungang Grottoes | 7 | 5 → 7 | **The *Wei shu* juan 114: the horse taking Tanyao's robe and his five caves; 460 – 524 as Heping 1 and Zhengguang 5 (two Europe PMC papers); the emperor-as-Buddha idea "one modern account holds"; Chavannes the one French source; Sirén and the Nelson-Atkins record**; "254 caves", the paint traces and the 1990s digs dropped. |
| `cnh-336` Longmen Grottoes | 7 | 6 → 7 | **The caves moved lower down the cliff, the empress relief sold in fragments (the Nelson-Atkins record: Binyang finished 523), the prince of Anding's inscription; the colossal Buddha "late 7th century" (Sirén 673 – 676 against `cnh-371`'s 675); the glossary's three caves begun in 500 corrected to two**; the Guyang cave (its source on mdpi.com) dropped. |
| `cnh-337` Six Garrisons | 6 | 5 → 6 | **The *Wei shu* annals of Emperor Xiaoming: the Woye rising of 524 and the edict admitting the rewards unpaid; Holmgren 1979 (the law of 519, the Rouran raid of 523, Heyin and no proof of the empress dowager's guilt); Dien on the Yuwen at Wuchuan**; Ge Rong's "million" and the "2,000" officials dropped; the line kept (no page gives a founding year). |
| `cnh-338` Eastern Wei | 6 | 5 → 6 | **The *Wei shu* annals of Emperor Xiaojing: the eleven-year-old, the move to Ye, the stone classics, Gao Cheng's three punches, the poisoning of 551, the Qing editors' note that the juan was restored; Giles's "Kai-feng" and Theobald's misprinted 543 not used**; Cordier's "52 tablets" dropped. |
| `cnh-339` Northern Zhou | 7 | 5 → 7 | **The *Zhou shu* juan 6 (Kanseki): Ye stormed, 3,302,528 households and 55 provinces, the enslaved freed; Yuwen Hu (no relation named: Cordier calls him Yuwen Tai's brother), the 574 ban; Shi Jun's Chinese–Sogdian epitaph (Tan et al.; Sims-Williams); Cordier for 568, 576, 578, 579**; the equal-field allotments left to `cnh-332`. |
| `cnh-340` fubing | 6 | 5 → 6 | **The *New Book of Tang* juan 50: service from 20 to 60 with one's own weapons and grain, the tally, the decline ("attendant officials" become an insult), 120,000 long-serving guards against Chen's 130,000 in ten days; the Sui's move of the soldiers to the farmers' registers (590) corrected in the glossary**; Chen's "first time soldiers were separated from farmers" and the unsourced "about 630" dropped; the end (Tianbao 8) left unconverted. |

Read by eye. **Confusability**: Gao Huan appears on `cnh-337` (risen from the garrisons) and `cnh-338` (ruling from
Jinyang), each from its own side; the Luoyang move stays `cnh-333`'s; the 446 persecution `cnh-895`'s. **Legend**: the
Tuoba's Yellow Emperor descent is now Wei Shou's arrangement; Tanyao's robe the *Wei shu*'s. **Chinese names corrected**:
`cnh-333` 北魏孝文帝 (pinyin Běi Wèi Xiàowéndì, the Han pattern of 汉光武帝). **Spellings fixed**: none needed; 0 hits.
**Myth register**: no row touched. **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-333`'s
days and months are on no page read; the line's "(age 31)" is the *Wei shu*'s 33 by the Chinese count (the background
says so). `cnh-334`'s locator is labelled Datong (the site lies beneath it; the label should say Pingcheng); `cnh-337`'s
point is Wuyuan, one of the six garrisons only; `cnh-340` (an institution) carries a Xi'an point it need not.

### B35 — `cnh-341`–`cnh-350`, Northern and Southern dynasties and Sui: Shen Yue to the Grand Canal (2026-11-13)

Run as B31. Every cited URL answered. **Pictures were not touched**; none of the ten cards has a picture. **The old cards
cited two to five Chinese texts on Chinese Wikisource apiece (over the one-per-language rule and unreachable here), put
hand-converted years on their lines ("Revised 583 CE", "Reorganised 583", "Ten categories 607", the jinshi's 587 and 598)
that no page prints, put `c.` before single years (Wen Xuan, the jinshi), named men and places in labels ("Li Shan's
notes", "Chen conquered", "Jiankang taken", four canal names), read the examination system back onto the Sui, and credited
the *Sui shu*'s treatises to Wei Zheng.** The histories were read in the Siku text on the Kanseki Repository and on
zggdwx.com.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-341` Shen Yue | 6 | 7 → 6 | **Four Wikisource texts cut to the *Book of Liang* juan 13; the "Son of Heaven is sage and wise" reply given to Zhou She, as the *Book of Liang* has it (Giles gives it to Shen Yue); the chestnut banquet, the dream of Emperor He of Qi; Martin 1988 the one French source; "died at 73" out of the prose against the line's age**. Protected: the line stays (flagged below). |
| `cnh-342` Wen Xuan | 7 | 8 → 7 | **`Compiled c. 520 – 531 CE` / `Commentary 658 CE` for "c. 530" and "Li Shan's notes"; the *Book of Liang* juan 8; the Library of Congress record of the 1161 printing; 514 pieces, 130 authors and 38 genres "by one count"; Li Shan the "book basket"**; the Song saying (on no page read) dropped. |
| `cnh-343` Sui dynasty | 8 | 8 → 8 | **`Reunified 589 CE` for "Chen conquered"; the "to run" radical dropped as an omen, the comparison with the Qin, the prefectures and the resettled southern families; the *Book of Sui* (636) named; the 617 end one history gives; Goguryeo left to `cnh-351`**; "Chinese historians date it from 589" (Macgowan, unreread) dropped. **Name 隋 → 隋朝, Suí cháo.** |
| `cnh-344` Emperor Wen of Sui | 7 | 8 → 8 | **The years out of the questions: the horns and scales (the *Sui shu*'s, so told), Daxing below Longshou Hill, his temper and the change of heir; the death sudden and perhaps murder (Cordier); Li Ung Bing (death 605) dropped**. Protected: the line stays (flagged below). |
| `cnh-345` Sui conquest of Chen | 6 | 7 → 8 | **`Capital taken 589 CE` for "Jiankang taken"; the 518,000 men under 90 commanders "from the sea to Ba and Shu" the *Sui shu*'s, with Theobald's "allegedly 500,000"; Chen Shubao died at Chang'an in 604 (buried at Luoyang); the well, the quarrel of He Ruobi and Han Qinhu**; the harvest feints, the Zhuque Gate, the levelled city and the revolts of 590 (unread) dropped. |
| `cnh-346` Kaihuang Code | 6 | 7 → 8 | **"Revised 583 CE" off (the *Sui shu* prints only 開皇三年; told as "the era's third year"); the *Sui shu* juan 25 headed by Zhangsun Wuji, not Wei Zheng; the abolished punishments, the ten abominations, the pruning to five hundred articles; Shiga 2003 the one Japanese source (read from a broken vertical-text extraction, so only "one Japanese legal historian argues")**; Pei Zheng's role dropped. |
| `cnh-347` Three Departments and Six Ministries | 7 | 7 → 7 | **"Reorganised 583" (a hand conversion) off: `Set up 581 CE` / `Recast 607 CE`; Emperor Wen's court in fact five departments; five Wikisource texts cut to the *Sui shu* juan 28; Gao Jiong's and Li Delin's appointments dropped**. **Pinyin sān shěng liù bù → sānshěng liùbù.** |
| `cnh-348` jinshi | 7 | 7 → 7 | **`Founded 606 CE` (Giles) / `System ended 1905` for "c. 606" and "Ten categories 607"; the 587 order told as "the seventh year of the Kaihuang era"; the system itself dated to the Tang (Theobald), not read back onto the Sui; the *Tongdian* juan 14 and Biot 1845**; no page read prints 605 or 607, so no Dated / Also dated pair. |
| `cnh-349` Emperor Yang of Sui | 7 | 7 → 8 | **Three Wikisource texts cut to the *Sui shu* juan 4; the southern wife and the Wu dialect, the concubines' children not raised (the hostile annals'), the posthumous name and the dragon-boat quota; the Jiangdu plot and the strangling left to `cnh-354`**; Giles's birth 580 not used. Protected: the line stays (flagged below). |
| `cnh-350` Grand Canal | 8 | 8 → 8 | **The canal-name labels off: `First cut 587 CE` / `Main works 605 – 610 CE` / `Northern rebuild 1283 – 1291` / `World Heritage 2014`; the length whose (Theobald 1,794 km; Li et al. about 3,200 km for all three sections); the annals' "over a million men and women"; Gandar (a second French book) dropped**; the women-drafted line (the *Zizhi tongjian*'s) dropped. |

Read by eye. **Confusability**: the well stays `cnh-345`'s; the Jiangdu plot, Yang Hao and the strangling `cnh-354`'s (the
Emperor Yang agent was told); the Yongji branch to Zhuo `cnh-350`'s (the Goguryeo agent was told); Daxing below Longshou
Hill `cnh-344`'s (noted for `cnh-367`); the jinshi's clues sent to the mingjing agent. One phrasing on `cnh-343` carried the
answer's word "dynasty" and was reworded; `cnh-345`'s missing comma mended; `cnh-344`'s background trimmed to 285.
**Legend**: Emperor Wen's horns and scales the *Sui shu*'s; Emperor Yang's hostile portrait the annals'. **Chinese names
corrected**: `cnh-343` 隋朝; `cnh-347` pinyin; `隋灭陈之战` kept unconfirmed (no page read prints the compound; the *Sui
shu* writes 伐陳 / 平陳 — for the owner). **Spellings fixed**: none needed; 0 hits. **Myth register**: the scarf at
Emperor Yang's death is the *Zizhi tongjian*'s (juan 185), not the *Sui shu*'s (`cnh-354`, next batch). **check-citations**:
`cnh-346`'s Shiga 2003 reported mismatched because its title is cited in romanised Japanese where Crossref gives the
English (the same paper). **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-341`'s 488 is
Theobald's table (his *Song shu* page says 487), its 1 May on no page read, its Huzhou against the sources' Wukang in
Wuxing; `cnh-344`'s birthplace is the Boruo temple at Fengyi in the *Sui shu*, its 21 July, 4 March, 13 August and Renshou
Palace on no page read, its age 64 by the Chinese count (Cordier) against the line's 63; `cnh-349`'s 21 August 604 and 11
April 618 on no page read. **Outside the hundred**: `wh-522` dates the Mongol rebuild of the canal 1276 – 1291 against
Theobald's 1283 – 1291.
