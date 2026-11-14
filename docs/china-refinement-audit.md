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
hundred, on 2026-11-12 for the second, on 2026-11-12 for the third and on 2026-11-13 for the fourth, on 2026-11-13 for the fifth and on 2026-11-14 for the sixth (the snapshot of each line is the run's `protected.json`). `cnh-179` (Su Qin
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
cnh-401 Shi Jingtang          (ruler; the person template)
cnh-403 Chai Rong             (ruler; the person template)
cnh-407 Li Yu                 (ruler; the person template)
cnh-409 Feng Dao              (individual; the person template)
cnh-413 Abaoji                (ruler; the person template)
cnh-420 Emperor Tianzuo of Liao (ruler; the person template)
cnh-422 Emperor Taizu of Song (ruler; the person template)
cnh-423 Shi Shouxin           (individual; the person template)
cnh-424 Emperor Renzong of Song (ruler; the person template)
cnh-428 Ouyang Xiu            (individual; the person template)
cnh-429 Di Qing               (individual; the person template)
cnh-430 Wang Anshi            (individual; the person template)
cnh-432 Sima Guang            (individual; the person template)
cnh-434 Cai Jing              (individual; the person template)
cnh-439 Bi Sheng              (individual; the person template)
cnh-441 Su Shi                (individual; the person template)
cnh-442 Li Qingzhao           (individual; the person template)
cnh-444 Guo Xi                (individual; the person template)
cnh-445 Emperor Huizong of Song (ruler; the person template)
cnh-448 Emperor Gaozong of Song (ruler; the person template)
cnh-450 Yue Fei               (individual; the person template)
cnh-451 Qin Hui               (individual; the person template)
cnh-459 Zhu Xi                (individual; the person template)
cnh-467 Li Yuanhao            (ruler; the person template)
cnh-475 Wanyan Aguda          (ruler; the person template)
cnh-480 Emperor Shizong of Jin (ruler; the person template)
cnh-484 Yelü Chucai           (individual; the person template)
cnh-485 Kublai Khan           (ruler; the person template)
cnh-486 Bayan of the Baarin   (individual; the person template)
cnh-491 Ayurbarwada           (ruler; the person template)
cnh-493 Guo Shoujing          (individual; the person template)
cnh-496 John of Montecorvino  (individual; the person template)
cnh-497 Drogön Chögyal Phagpa (individual; the person template)
cnh-504 Hongwu Emperor        (ruler; the person template)
cnh-510 Yongle Emperor        (ruler; the person template)
cnh-514 Zheng He              (individual; the person template)
cnh-516 Hongxi Emperor        (ruler; the person template)
cnh-527 Matteo Ricci          (individual; the person template)
cnh-528 Wang Yangming         (individual; the person template)
cnh-532 Wei Zhongxian         (individual; the person template)
cnh-533 Li Zicheng            (individual; the person template)
cnh-534 Chongzhen Emperor     (ruler; person-cards misses it)
cnh-536 Nurhaci               (ruler; the person template)
cnh-538 Hong Taiji            (ruler; the person template)
cnh-540 Dorgon                (individual; the person template)
cnh-545 Kangxi Emperor        (ruler; the person template)
cnh-549 Yongzheng Emperor     (ruler; the person template)
cnh-551 Qianlong Emperor      (ruler; the person template)
cnh-554 Hong Liangji          (individual; the person template)
cnh-555 Heshen                (individual; the person template)
cnh-560 Lin Zexu              (individual; the person template)
cnh-565 Hong Xiuquan          (individual; the person template)
cnh-569 Empress Dowager Cixi  (ruler; the person template)
cnh-575 Sun Yat-sen           (individual; the person template)
cnh-576 Puyi                  (ruler; the person template)
cnh-578 Yuan Shikai           (individual; the person template)
cnh-587 Chen Duxiu            (individual; the person template)
cnh-588 Hu Shi                (individual; the person template)
cnh-589 Lu Xun                (individual; the person template)
cnh-593 Chiang Kai-shek       (individual; the person template)
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
| The Xuanwu Gate incident as told | Li Shimin killing his brothers Li Jiancheng and Li Yuanji at the palace gate and his father's abdication, in the court histories written under Taizong's own eye (the *Old* and *New Book of Tang*, the *Zizhi tongjian*), which make the brothers the plotters — confirmed B36 (`cnh-356`, `cnh-358`: the record descends from the official account Taizong ordered after seeing his historians' work; Sima Guang doubted the banquet plot) | `cnh-358` | `cnh-356`, `cnh-357` | — |
| Wu Zetian as the only empress regnant and the hostile tradition | the only woman to rule China as emperor in her own name (the Wu Zhou, 690 – 705 CE); the stories of the strangled daughter and the mutilated rivals from later hostile historians — B38 (`cnh-371`): told as hostile reports; the strangled daughter in Giles but not in the *Old Book* juan 51, its earliest text still unconfirmed | `cnh-371`, `cnh-372` | `cnh-364` | — |
| Yang Guifei: the lychees, Mawei and the Song of Everlasting Sorrow | lychees rushed by relay to the court; her death at Mawei Station when the escort mutinied (756 CE); Bai Juyi's "Song of Everlasting Sorrow" (806 or 807 CE; Beauchamp prints 807) and later legend — confirmed B38 (`cnh-375`: the lychees told as Mayers's account and Du Fu's poem; the An Lushan love story later lore, Owen) | `cnh-375` | `cnh-373`, `cnh-377`, `cnh-393` | — |
| An Lushan's adoption by Yang Guifei | An Lushan made Yang Guifei's adopted son, the washing ceremony; told in later histories and anecdote collections — confirmed B38 (`cnh-377`: the *Old Book of Tang* juan 200A has him ask for it himself; the three-day washing is the *Zizhi tongjian*'s, juan 216) | — | `cnh-377`, `cnh-375` | — |
| Li Bai drowning while embracing the moon | the poet drowning as he leaned from a boat to embrace the moon's reflection; a later legend, against the earlier accounts of illness — confirmed B40 (`cnh-391`: a legend Hong Mai already doubted in the 12th century) | — | `cnh-391` | — |
| Xuanzang and the Journey to the West | Xuanzang's own *Record of the Western Regions* (646 CE) and his disciples' biography; the 16th-century novel *Journey to the West* with Tripitaka and the Monkey King, fiction — agreeing with `in-199` — provisional | — | `cnh-388` | `in-199` |
| Han Yu's memorial on the Buddha's bone | Han Yu's memorial of 819 CE against bringing the finger-bone relic from the Famen Temple into the palace, and his banishment to Chaozhou — confirmed B39–B40 (`cnh-387`, `cnh-394`: the *Old Book of Tang* juan 160) | — | `cnh-394`, `cnh-387` | — |
| Zhao Kuangyin and the yellow robe at Chenqiao | the troops of the Palace Command mutinying at Chenqiao post station in 960 CE and wrapping their sleeping commander in a yellow robe, so that he "had to" accept the throne from the Later Zhou's child emperor; the Song's own account of its founding, in the *Songshi* juan 1 (compiled under the Yuan, 1343 – 1345); Giles and Theobald doubt his surprise — confirmed B43 (`cnh-422`) | — | `cnh-422`, `cnh-423`, `cnh-402` | — |
| "A cup of wine" and the generals' commands | Emperor Taizu persuading Shi Shouxin and the other palace generals at a banquet in 961 CE to give up their commands for wealth and retirement; first told in Northern Song private notebooks (Sima Guang's, Wang Zeng's and Ding Wei's, as Li Tao's own note in the *Changbian* names them), not the official histories or Veritable Records; the modern doubt on no page read — confirmed and corrected B43 (`cnh-423`) | — | `cnh-423`, `cnh-422`, `cnh-421` | `cnh-380` |
| Li Yu's last lyrics and his poisoning | the captive Southern Tang ruler's lyrics of longing ("Yu meiren" among them) and his death by poison after they were sung; told in Wang Zhi's *Moji* (Northern Song), which names the Prince of Qin as the sender after Xu Xuan's report and closes "so it is said"; his death in 978 CE is recorded, the poisoning a tradition — confirmed and corrected B41 (`cnh-407`) | — | `cnh-407`, `cnh-406` | — |
| Feng Dao, the servant of many houses | Feng Dao serving "four surnames, ten rulers" (Ouyang Xiu's count; his own memoir, the "Changle lao xu", lists four surnames and the Khitan) as minister; Ouyang Xiu's verdict in his *New History of the Five Dynasties* that he knew no shame (Sima Guang's not read); the modern reading of him as a man who kept the government running (Carter 1925) — confirmed and corrected B41 (`cnh-409`: the *New History* juan 54) | — | `cnh-409` | — |
| Bao Zheng as Judge Bao | the historical Bao Zheng, an incorruptible official at Kaifeng under Renzong (his biography in the *Songshi*); Judge Bao the all-seeing judge of Yuan *zaju*, the ballad stories and Ming–Qing fiction (Idema 2011) — confirmed B43 (`cnh-424`) | — | `cnh-424`, `cnh-425` | — |
| Yue Fei: the tattoo, the gold plaques and "no grounds" | the four characters "serve the country with utmost loyalty" on his back (the *Songshi* biography, 1345; his mother tattooing them a later tale); the twelve gold-lettered plaques recalling him in one day; Qin Hui's answer to Han Shizhong that the charge "need not have grounds" (莫須有); the kneeling iron figures of Qin Hui and his wife at the Hangzhou tomb (Henning 2007; their Ming date unconfirmed) — confirmed B45 (`cnh-450`: the tattoo shown to his judge He Zhu, the plaques and 莫須有 all in the *Songshi* juan 365) | `cnh-450` | `cnh-451`, `cnh-452` | — |
| The Jingkang captivity | the Jurchen taking Kaifeng in 1127 and carrying Huizong, Qinzong, the court and its women north; the Southern Song and Jin accounts and the *Songshi* and *Jinshi* (both 1343 – 1345) — confirmed B45 (`cnh-446`: the *Songshi* juan 23 lists the regalia, books, maps and craftsmen taken north) | `cnh-446` | `cnh-445`, `cnh-448`, `cnh-473` | — |
| Li Qingzhao's life in her own postface | her marriage to Zhao Mingcheng, their collecting, and the loss of the collection in the flight south, as her postface to his *Jinshi lu* tells it (the received text closes with 1132; Hong Mai, the earliest account, and some copies give 1134; the postface is absent from the earliest Southern Song editions, Moser) — confirmed and corrected B45 (`cnh-442`) | — | `cnh-442` | — |
| Wang Anshi and Sima Guang as villain and hero | the reformer blamed for the Northern Song's fall and the historian praised as the upright conservative, the Southern Song and later Confucian verdict (the *Songshi* juan 327's closing judgement, citing Zhu Xi); the partisan record (Fuller 2023); Wang's modern rehabilitation (Liang Qichao, on no page cited) — confirmed B43 (`cnh-430`) | — | `cnh-430`, `cnh-431`, `cnh-432` | — |
| Su Shi's Red Cliff rhapsodies | the two "Chibi fu" written in exile at Huangzhou (1082), set at a cliff near Huangzhou where a guest asks whether this is where Cao Cao was beaten (Su Shi's own doubt of the site on no page read); read as literature, not as a record of the battle — confirmed for 1082 B45 (`cnh-441`) | — | `cnh-441` | `cnh-276` (Red Cliffs) |
| The Water Margin and the historical Song Jiang | the bandit leader Song Jiang, whose band and surrender the *Songshi* gives in a few lines under Huizong; the outlaws of the Yuan plays and the 14th–16th-century novel *Water Margin* — provisional | — | `cnh-445` | `cnh-928`, `cnh-929` |
| The Mongol conquests' figures | the death tolls and army sizes of the conquest of the Western Xia, the Jin and the Song as the Persian and Chinese histories give them (Rashid al-Din's 300,000 at Lingzhou, "a tremendous exaggeration" to Howorth; the *Yuanshi*'s styled 400,000 at Yehuling; the 100,000 drowned at Yamen the *Songshi*'s count a week later; Java's ships and men differing by juan), not counts — confirmed B47 – B50 (`cnh-472`, `481`, `464`, `494`) | `cnh-472` | `cnh-481`, `cnh-482`, `cnh-463`, `cnh-483` | — |
| Marco Polo's travels and the doubt | the book dictated in a Genoese prison to Rustichello of Pisa (1298 – 1299), surviving in many differing manuscripts; the doubt that he reached China (the Great Wall, tea and footbinding unmentioned, his name absent from the Chinese record) and the replies (the salt, paper money and the Yangzhou post); some passages survive in one printed edition only (Ramusio's, as Yule notes for the ships' compartments, `cnh-438`, and the city's chessboard plots, `cnh-487`); the dictation placed between late 1298 and mid-1299 (Mascherpa 2025), about 143 manuscripts (the BnF), the Yangzhou governorship mainly Ramusio's (Yule); the doubt Wood's (1995) and the replies de Rachewiltz's and Vogel's — confirmed B44 – B50 (`cnh-495`, `cnh-463`) | `cnh-495` | `cnh-485`, `cnh-487`, `cnh-492` | — |
| Kublai and Phagpa | the Tibetan tellings of Phagpa initiating Kublai and of the priest and patron; the Mongol chronicle of Sanang Setsen (through Howorth) in which Chabui settles who sits higher; the *Yuanshi* juan 202's Imperial Preceptor, "a man of Sakya", who made the script decreed in 1269 — confirmed in part B50 (`cnh-497`; the Tibetan tellings on no page read) | `cnh-497` | `cnh-485` | — |
| The Romance of the Western Chamber | Zhang and Yingying's story from Yuan Zhen's Tang tale "Yingying zhuan" (the *Taiping guangji* juan 488; he leaves her and each marries another), through Zhao Lingzhi's Northern Song guzi ci (Fujita) and the Jin *zhugongdiao* of Master Dong, to Wang Shifu's Yuan *zaju* ("a happy issue", Giles) — confirmed and extended B50 (`cnh-499`) | `cnh-499` | `cnh-498` | `cnh-393` (Yuan Zhen) |
| Zhu Yuanzhang the beggar monk and the mooncake rising | the orphan who begged as a novice of the Huangjue monastery before joining the Red Turbans (his own "Huangling bei" inscription and the *Mingshi*, 1739); the uprising signalled by messages hidden in mooncakes a later folk tale with no Yuan or Ming source — confirmed B51 (`cnh-504`: the *Mingshi* juan 1 — the Huangjue novice, a month later begging round Hefei, three years away; Giles's "Beggar King"); the Huangling stele not read; the mooncake tale on no page read, so told nowhere | — | `cnh-504`, `cnh-501` | — |
| The Hu Weiyong case and its dead | the chancellor executed in 1380 for plotting, the Central Secretariat abolished with him; the purge's tens of thousands of dead (the *Mingshi*'s count, with the later Lan Yu case) a later history's figure, not a count — corrected B51 (`cnh-506`: the *Mingshi* juan 308's "more than 30,000" is the Hu case alone; Hucker gives it as reported, and 15,000 for the Lan Yu list) | `cnh-506` | `cnh-504`, `cnh-507` | — |
| The Jianwen Emperor's escape as a monk | the emperor who vanished when Nanjing fell in 1402, said in later legend to have fled as a monk; the *Mingshi* gives both the fire and the rumour — confirmed B51 (`cnh-509`: the *Mingshi* juan 4 gives the fire, the body passed off as his, and the rumour of a tunnel escape) | — | `cnh-509`, `cnh-510` | — |
| Zheng He's ships | the treasure ships of 44 *zhang* by 18 in the *Mingshi* (1739), against modern doubt of a wooden ship that size; the "1421" claim that the fleets reached America a fringe book, said so if met — confirmed B52 (`cnh-515`: the *Mingshi* juan 304 — 62 ships of 44 zhang by 18, 27,800 men; Groeneveldt 1876 called the dimensions improbable); the "1421" claim not met | `cnh-515` | `cnh-514` | `cnh-819` |
| The Tumu Crisis | the Zhengtong Emperor captured by Esen's Oirats in 1449, the eunuch Wang Zhen blamed for leading the army out (the *Mingshi*); the dead and the army's size the histories' figures — confirmed B52 (`cnh-517`: the *Mingshi* juan 328 blames Wang Zhen and gives the dead and wounded as "several hundred thousand"; the army's 500,000 first written down from hearsay) | `cnh-517` | `cnh-518` | — |
| The Yongle Encyclopedia's surviving volumes | the compilation finished in 1408, the copy of 1562 – 1567, the original lost; the volumes destroyed in 1900 and the some four hundred volumes that survive scattered (the library records) — corrected B52 (`cnh-513`: finished 1408, the Library of Congress; the Qing catalogue's December 1407; the copy of 1562 – 1567) | `cnh-513` | `cnh-510` | — |
| Ricci's map and the memory palace | Ricci's world map printed in Beijing in 1602 (the surviving copies, a library record); the "memory palace" his own treatise on memory, read through Spence's book — map confirmed B53 (`cnh-527`: the Library of Congress record of the 1602 Beijing printing); the memory palace not told (Spence not read) | `cnh-527` | `cnh-526` | — |
| Wang Yangming's bamboo and Longchang | the young Wang staring at bamboo for seven days to "investigate things" and his enlightenment in exile at Longchang (1508), both as his disciples' *Chuanxi lu* and chronological biography tell them — confirmed B53 (`cnh-528`: the bamboo from the *Chuanxi lu* and Longchang, his disciples' telling) | `cnh-528` | — | the `cn-thought` cards on his school |
| The Chongzhen Emperor on Coal Hill | the last Ming emperor hanging himself on Coal Hill (Meishan, Jingshan) as Li Zicheng's army entered Beijing in 1644, the last words the *Mingshi* gives — confirmed B54 (`cnh-534`: the *Mingshi* juan 24 — Wansui shan, Wang Chengen dying with him) | `cnh-534` | `cnh-533`, `cnh-535` | — |
| Chen Yuanyuan and Wu Sangui | Wu Sangui opening Shanhai Pass to the Manchus "for a woman", his concubine Chen Yuanyuan taken by Li Zicheng's men; Wu Weiye's poem "Yuanyuan qu" (17th century) and later telling, against the military situation — confirmed in part B54 (`cnh-533`: the *Mingshi* juan 309 tells it as fact); Wu Weiye's poem on no page read | — | `cnh-533`, `cnh-540`, `cnh-543` | — |
| The Yangzhou massacre's dead | the ten days of killing after Yangzhou fell to Dodo in 1645; the 800,000 dead Wang Xiuchu's eyewitness account's figure (the *Yangzhou shiri ji*), banned under the Qing and reprinted in the late Qing — confirmed B55 (`cnh-542`: the 800,000 the diarist's count of bodies found, through Backhouse and Bland and Aucourt); "banned under the Qing" on no page read; a revolutionary pamphlet reprinting it by 1907 | `cnh-542` | `cnh-539`, `cnh-540` | — |
| Koxinga | Zheng Chenggong, the Ming loyalist given the imperial surname (whence "Koxinga"), driving the Dutch from Taiwan in 1662; later a hero to the Qing, the Republic, the People's Republic and Japan alike — confirmed as far as told B54 – B55 (`cnh-539`, `cnh-544`: Cordier, Theobald) | — | `cnh-539`, `cnh-544` | — |
| The Macartney embassy, the kowtow and the edict | the embassy of 1793 and whether Macartney knelt (the British and Qing accounts differ); Qianlong's edict to George III, "we possess all things", read in full and in context (the Backhouse and Bland translation and later readings) — corrected B56 (`cnh-556`: Macartney's own journal — one knee, the kiss of the hand dropped; Harrison 2017 — the edict drafted after the requests were translated, "we possess all things" in its preamble, famous only from 1914); the Qing kowtow account on no page read | `cnh-556` | `cnh-551`, `cnh-557` | — |
| Lin Zexu's letter to Queen Victoria | the letter of 1839 asking the queen to stop the opium trade, printed in *The Times* and the *Chinese Repository*; never received by her as a state letter — corrected in part B56 (`cnh-560`: written in August 1839 with Deng Tingzhen and Yiliang, printed in the *Chinese Repository* in February 1840 from the *Canton Press*, never received by her); *The Times* on no page read | — | `cnh-560`, `cnh-559` | — |
| Hong Xiuquan's vision | the dream of 1837 after a failed examination, read later through Liang Fa's tract as a call from God and Jesus as his elder brother; told in Hamberg's *Visions of Hung-Siu-Tshuen* (1854) from Hong Rengan's account — confirmed B57 (`cnh-565`: the 1837 illness, the golden-bearded old man, the sword and seal, in Hamberg 1854 from Hong Rengan) | `cnh-565` | `cnh-564` | — |
| The Taiping death toll | twenty to thirty million and higher figures, scholars' estimates over a range (the plan's "Sourcing"), never a count — corrected B57 (`cnh-564`: no page read prints "twenty to thirty million"; S. W. Williams's twenty million through Morse, Theobald's 20 – 50 million, Orlandi's over 20 million, Zhao 2026's 100 million — each an estimate) | `cnh-564` | `cnh-565`, `cnh-566` | — |
| Cixi and the navy money | the funds of the Beiyang fleet diverted to rebuild the Summer Palace and the marble boat, a charge made later and disputed in scope — confirmed as a disputed charge B57 (`cnh-569`: Hummel states it; the *Qingshi gao*'s verdict puts her building below a tenth of earlier emperors') | — | `cnh-569`, `cnh-570` | — |
| The Boxers' invulnerability | the rites and spirit possession said to make the Boxers proof against bullets, as missionary, Qing and Boxer accounts each tell it — confirmed as a set of tellings B58 (`cnh-572`: the missionary Arthur H. Smith's account, 1901) | `cnh-572` | — | — |
| Sun Yat-sen's London kidnapping | his detention in the Chinese Legation in London in 1896 and release after press and Foreign Office pressure; his own *Kidnapped in London* (1897) — confirmed B58 (`cnh-575`: his own *Kidnapped in London*, 1897 — 11 – 23 October 1896) | `cnh-575` | — | — |
| Yuan Shikai and the Hundred Days | Yuan said to have betrayed the reformers' plot to Ronglu in 1898; his own diary and later scholarship dispute it — refined B58 (`cnh-571`, `cnh-578`: the reformers' and most foreign historians' version against Yuan's own account; Hummel's "generally believed"; his diary on no page read) | `cnh-571` | `cnh-578`, `cnh-569` | — |
| Lu Xun's slide show at Sendai | the lantern slide of a Chinese man about to be executed as a spy in the Russo-Japanese War, which he says turned him from medicine to letters; his own preface to *Call to Arms* (1922), the slide never found — confirmed B59 (`cnh-589`: his preface dated 3 December 1922; Takeuchi's doubt, the Fujino memoir's shooting, the slides found but not that one) | `cnh-589` | — | — |
| The May Fourth slogans | "Mr Democracy and Mr Science" (Chen Duxiu in *New Youth*, 1919) and the students' slogans of 4 May 1919, as the period's own texts give them — confirmed in part B59 (`cnh-585`: the students' slogans as Tsi C. Wang's 1927 account gives them, 还我青岛 from the police files; "Mr Democracy and Mr Science" Chen's, *New Youth* January 1919; 外争国权，内惩国贼 on no page read) | `cnh-585` | `cnh-586`, `cnh-587` | — |

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
| B36 | Sui (`col-22`) / Tang (`col-23`) | `cnh-351`–`cnh-360` | 10 | 113 | **done 2026-11-13** |
| B37 | Tang (`col-23`) | `cnh-361`–`cnh-370` | 10 | 102 | **done 2026-11-13** |
| B38 | Tang (`col-23`) | `cnh-371`–`cnh-380` | 10 | 104 | **done 2026-11-13** |
| B39 | Tang (`col-23`) | `cnh-381`–`cnh-390` | 10 | 112 | **done 2026-11-13** |
| B40 | Tang (`col-23`) / Five Dynasties and Ten Kingdoms (`col-24`) | `cnh-391`–`cnh-400` | 10 | 111 | **done 2026-11-13** |
| B41 | Five Dynasties and Ten Kingdoms (`col-24`) | `cnh-401`–`cnh-410` | 10 | 102 | **done 2026-11-13** |
| B42 | Liao (`col-25`) | `cnh-411`–`cnh-420` | 10 | 100 | **done 2026-11-13** |
| B43 | Northern Song (`col-27`) | `cnh-421`–`cnh-430` | 10 | 102 | **done 2026-11-13** |
| B44 | Northern Song (`col-27`) | `cnh-431`–`cnh-440` | 10 | 104 | **done 2026-11-13** |
| B45 | Northern Song (`col-27`) / Southern Song (`col-28`) | `cnh-441`–`cnh-450` | 10 | 100 | **done 2026-11-13** |
| B46 | Southern Song (`col-28`) | `cnh-451`–`cnh-460` | 10 | 101 | **done 2026-11-13** |
| B47 | Southern Song (`col-28`) / Western Xia (`col-29`) | `cnh-461`–`cnh-470` | 10 | 94 | **done 2026-11-13** |
| B48 | Western Xia (`col-29`) / Jurchen Jin (`col-30`) | `cnh-471`–`cnh-480` | 10 | 97 | **done 2026-11-13** |
| B49 | Jurchen Jin (`col-30`) / Yuan (`col-31`) | `cnh-481`–`cnh-490` | 10 | 110 | **done 2026-11-13** |
| B50 | Yuan (`col-31`) | `cnh-491`–`cnh-500` | 10 | 100 | **done 2026-11-13** |
| B51 | Yuan (`col-31`) / Ming (`col-32`) | `cnh-501`–`cnh-510` | 10 | 107 | **done 2026-11-14** |
| B52 | Ming (`col-32`) | `cnh-511`–`cnh-520` | 10 | 108 | **done 2026-11-14** |
| B53 | Ming (`col-32`) | `cnh-521`–`cnh-530` | 10 | 105 | **done 2026-11-14** |
| B54 | Ming (`col-32`) / Qing (`col-33`) | `cnh-531`–`cnh-540` | 10 | 108 | **done 2026-11-14** |
| B55 | Qing (`col-33`) | `cnh-541`–`cnh-550` | 10 | 109 | **done 2026-11-14** |
| B56 | Qing (`col-33`) | `cnh-551`–`cnh-560` | 10 | 108 | **done 2026-11-14** |
| B57 | Qing (`col-33`) | `cnh-561`–`cnh-570` | 10 | 119 | **done 2026-11-14** |
| B58 | Qing (`col-33`) / Early Republic (`col-35`) | `cnh-571`–`cnh-580` | 10 | 117 | **done 2026-11-14** |
| B59 | Early Republic (`col-35`) | `cnh-581`–`cnh-590` | 10 | 110 | **done 2026-11-14** |
| B60 | Early Republic (`col-35`) | `cnh-591`–`cnh-600` | 10 | 118 | **done 2026-11-14** |
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
| `cnh-351` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-352` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-353` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-354` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-355` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-356` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-357` | none | not re-checked (Commons rate-limited): wanted — the glossary's public-domain court portrait would serve |
| `cnh-358` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-359` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-360` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-361` | none | not re-checked (Commons rate-limited): wanted — a Turfan or Dunhuang register |
| `cnh-362` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-363` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-364` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-365` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-366` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-367` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-368` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-369` | none | not re-checked (Commons rate-limited): wanted — An Jia's or Shi Jun's couch |
| `cnh-370` | none | not re-checked (Commons rate-limited): wanted — a dancer on a Sogdian tomb couch |
| `cnh-371` | none | not re-checked (Commons rate-limited): wanted — the glossary's portrait would serve |
| `cnh-372` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-373` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-374` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-375` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-376` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-377` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-378` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-379` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-380` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-381` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-382` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-383` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-384` | none | not re-checked (Commons rate-limited): wanted — the Lhasa treaty pillar |
| `cnh-385` | none | not re-checked (Commons rate-limited): wanted — the Karabalgasun ruins or inscription |
| `cnh-386` | none | not re-checked (Commons rate-limited): wanted — the Dehua stele |
| `cnh-387` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-388` | none | not re-checked (Commons rate-limited): wanted — the glossary's painting would serve |
| `cnh-389` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-390` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-391` | none | not re-checked (Commons rate-limited): wanted — the glossary's portrait would serve |
| `cnh-392` | none | not re-checked (Commons rate-limited): wanted — the glossary's portrait would serve |
| `cnh-393` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-394` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-395` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-396` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-397` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-398` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-399` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-400` | none | not re-checked (Commons rate-limited): the card has no picture — wanted |
| `cnh-401` | an imagined later portrait | not re-checked (Commons rate-limited): ok, said so in its description |
| `cnh-402` | none | not re-checked (Commons rate-limited): wanted — a Later Zhou object or Guo Wei's portrait |
| `cnh-403` | a painted portrait | not re-checked (Commons rate-limited): ok |
| `cnh-404` | none | not re-checked (Commons rate-limited): wanted — Wang Jian's seated statue or the Yongling musician reliefs |
| `cnh-405` | none | not re-checked (Commons rate-limited): wanted — one of Qian Chu's dated bronze stupas of 955 |
| `cnh-406` | none | not re-checked (Commons rate-limited): wanted — a Dong Yuan or Juran landscape |
| `cnh-407` | a Sancai tuhui portrait | not re-checked (Commons rate-limited): ok, an imagined portrait |
| `cnh-408` | none | not re-checked (Commons rate-limited): wanted — a Five Dynasties Yue ware bowl or box |
| `cnh-409` | none | not re-checked (Commons rate-limited): wanted; the glossary's 1694 woodblock has burned-in text — replace |
| `cnh-410` | none | not re-checked (Commons rate-limited): wanted — a Jinyang relic or a map of the Ten Kingdoms |
| `cnh-411` | none | not re-checked (Commons rate-limited): wanted — a Liao map or the Upper Capital's ruins |
| `cnh-412` | none | not re-checked (Commons rate-limited): wanted — a Khitan tomb mural |
| `cnh-413` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-414` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-415` | none | not re-checked (Commons rate-limited): wanted — a rubbing of a small-script epitaph or the 1134 Langjun xingji |
| `cnh-416` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-417` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-418` | none | not re-checked (Commons rate-limited): wanted — a photograph of the whole tower |
| `cnh-419` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-420` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-421` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-422` | none | not re-checked (Commons rate-limited): wanted — the palace portrait |
| `cnh-423` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-424` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-425` | none | not re-checked (Commons rate-limited): wanted — the Iron Pagoda or the excavated Song city |
| `cnh-426` | none | not re-checked (Commons rate-limited): wanted — a portrait of Fan Zhongyan |
| `cnh-427` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-428` | as before | not re-checked (Commons rate-limited): the glossary's picture has burned-in text — replace |
| `cnh-429` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-430` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-431` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-432` | none | not re-checked (Commons rate-limited): wanted — a portrait, or the jar scene |
| `cnh-433` | none | not re-checked (Commons rate-limited): wanted — the surviving draft fragment |
| `cnh-434` | none | not re-checked (Commons rate-limited): wanted — his calligraphy |
| `cnh-435` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-436` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-437` | none | not re-checked (Commons rate-limited): wanted — an old view of Xuzhou |
| `cnh-438` | none | not re-checked (Commons rate-limited): wanted — the Quanzhou ship's hull |
| `cnh-439` | none | not re-checked (Commons rate-limited): wanted — a model of the clay type |
| `cnh-440` | none | not re-checked (Commons rate-limited): wanted — a surviving juan |
| `cnh-441` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-442` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-443` | none | not re-checked (Commons rate-limited): wanted — the bridge section of the scroll |
| `cnh-444` | none | not re-checked (Commons rate-limited): wanted — Early Spring |
| `cnh-445` | none | not re-checked (Commons rate-limited): wanted — a painting or his thin-gold script |
| `cnh-446` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-447` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-448` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-449` | none | not re-checked (Commons rate-limited): wanted — the Su causeway |
| `cnh-450` | none | not re-checked (Commons rate-limited): wanted — the Hangzhou temple or the portrait |
| `cnh-451` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-452` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-453` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-454` | none | not re-checked (Commons rate-limited): wanted — a huizi printing plate |
| `cnh-455` | none | not re-checked (Commons rate-limited): wanted — the Qingjing Mosque or the Kaiyuan pagodas |
| `cnh-456` | none | not re-checked (Commons rate-limited): wanted — a crackled Guan vase |
| `cnh-457` | none | not re-checked (Commons rate-limited): wanted — a hare's fur bowl |
| `cnh-458` | none | not re-checked (Commons rate-limited): wanted — an early printed page |
| `cnh-459` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-460` | none | not re-checked (Commons rate-limited): the glossary's picture shows only an academy — replace |
| `cnh-461` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-462` | none | not re-checked (Commons rate-limited): wanted — a drawing from a military manual |
| `cnh-463` | none | not re-checked (Commons rate-limited): wanted — a counterweight trebuchet drawing |
| `cnh-464` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-465` | none | not re-checked (Commons rate-limited): wanted — the Western Xia tombs |
| `cnh-466` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-467` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-468` | none | not re-checked (Commons rate-limited): wanted — a printed Tangut page |
| `cnh-469` | none | not re-checked (Commons rate-limited): wanted — a page of the canon |
| `cnh-470` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-471` | none | not re-checked (Commons rate-limited): wanted — the walls and stupas |
| `cnh-472` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-473` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-474` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-475` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-476` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-477` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-478` | none | not re-checked (Commons rate-limited): wanted — a Jurchen paizi or seal |
| `cnh-479` | none | not re-checked (Commons rate-limited): wanted — a rubbing of the 1185 Fuyu stele |
| `cnh-480` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-481` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-482` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-483` | as before | not re-checked (Commons rate-limited): the glossary picture's description gives a decade — trim |
| `cnh-484` | as before | not re-checked (Commons rate-limited): a modern bust — weak, replace |
| `cnh-485` | none | not re-checked (Commons rate-limited): wanted — the court portrait |
| `cnh-486` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-487` | none | not re-checked (Commons rate-limited): wanted — the Yuan wall ruins |
| `cnh-488` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-489` | none | not re-checked (Commons rate-limited): wanted — a map of the provinces |
| `cnh-490` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-491` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-492` | none | not re-checked (Commons rate-limited): wanted — a Zhiyuan note |
| `cnh-493` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-494` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-495` | none | not re-checked (Commons rate-limited): wanted — an illuminated manuscript page |
| `cnh-496` | none | not re-checked (Commons rate-limited): wanted |
| `cnh-497` | as before | not re-checked (Commons rate-limited): ok |
| `cnh-498` | none | not re-checked (Commons rate-limited): wanted — the Guangsheng temple mural of actors |
| `cnh-499` | none | not re-checked (Commons rate-limited): wanted — an illustrated Ming edition |
| `cnh-500` | none | not re-checked (Commons rate-limited): wanted — the pair (the British Museum refuses; Commons later) |
| `cnh-501` | none | not re-checked (pictures paused): wanted |
| `cnh-502` | none | not re-checked (pictures paused): wanted |
| `cnh-503` | none | not re-checked (pictures paused): wanted — not the founder's portrait (that is `cnh-504`'s) |
| `cnh-504` | none | not re-checked (pictures paused): the glossary's seated portrait looks right |
| `cnh-505` | none | not re-checked (pictures paused): wanted — a surviving Ming household register |
| `cnh-506` | none | not re-checked (pictures paused): wanted |
| `cnh-507` | none | not re-checked (pictures paused): wanted |
| `cnh-508` | none | not re-checked (pictures paused): wanted |
| `cnh-509` | none | not re-checked (pictures paused): wanted |
| `cnh-510` | none | not re-checked (pictures paused): the glossary's seated portrait looks right |
| `cnh-511` | none | not re-checked (pictures paused): wanted |
| `cnh-512` | none | not re-checked (pictures paused): wanted — the glossary's printed plan carries burned-in English labels |
| `cnh-513` | none | not re-checked (pictures paused): wanted — a surviving volume (a library record) |
| `cnh-514` | none | not re-checked (pictures paused): the glossary's statue looks fine |
| `cnh-515` | none | not re-checked (pictures paused): wanted |
| `cnh-516` | none | not re-checked (pictures paused): the glossary's court portrait looks right |
| `cnh-517` | none | not re-checked (pictures paused): wanted |
| `cnh-518` | none | not re-checked (pictures paused): wanted |
| `cnh-519` | none | not re-checked (pictures paused): wanted |
| `cnh-520` | none | not re-checked (pictures paused): wanted — the *Wokou tujuan* scroll |
| `cnh-521` | none | not re-checked (pictures paused): wanted |
| `cnh-522` | none | not re-checked (pictures paused): wanted |
| `cnh-523` | none | not re-checked (pictures paused): wanted — a sycee ingot |
| `cnh-524` | none | not re-checked (pictures paused): wanted |
| `cnh-525` | none | not re-checked (pictures paused): wanted — a museum's Kraak dish |
| `cnh-526` | none | not re-checked (pictures paused): wanted |
| `cnh-527` | none | not re-checked (pictures paused): the glossary's portrait looks right |
| `cnh-528` | none | not re-checked (pictures paused): the glossary's portrait looks right |
| `cnh-529` | none | not re-checked (pictures paused): wanted — a page of a Ming edition |
| `cnh-530` | none | not re-checked (pictures paused): wanted |
| `cnh-531` | none | not re-checked (pictures paused): wanted |
| `cnh-532` | none | not re-checked (pictures paused): wanted |
| `cnh-533` | none | not re-checked (pictures paused): the glossary's statue is fine |
| `cnh-534` | none | not re-checked (pictures paused): the glossary's picture is a novel's woodblock, an imagined likeness — replace |
| `cnh-535` | none | not re-checked (pictures paused): wanted — the glossary's Hong Taiji portrait shows a founder, not the dynasty |
| `cnh-536` | none | not re-checked (pictures paused): the glossary's portrait looks right |
| `cnh-537` | none | not re-checked (pictures paused): wanted |
| `cnh-538` | none | not re-checked (pictures paused): the glossary's portrait is fine |
| `cnh-539` | none | not re-checked (pictures paused): wanted |
| `cnh-540` | none | not re-checked (pictures paused): the glossary's portrait looks right |
| `cnh-541` | none | not re-checked (pictures paused): wanted |
| `cnh-542` | none | not re-checked (pictures paused): wanted |
| `cnh-543` | none | not re-checked (pictures paused): wanted |
| `cnh-544` | none | not re-checked (pictures paused): wanted |
| `cnh-545` | none | not re-checked (pictures paused): wanted — a court portrait |
| `cnh-546` | none | not re-checked (pictures paused): wanted — the Latin text |
| `cnh-547` | none | not re-checked (pictures paused): wanted |
| `cnh-548` | none | not re-checked (pictures paused): wanted |
| `cnh-549` | none | not re-checked (pictures paused): the glossary's court portrait is fine |
| `cnh-550` | none | not re-checked (pictures paused): wanted |
| `cnh-551` | none | not re-checked (pictures paused): the glossary's portrait looks fine |
| `cnh-552` | none | not re-checked (pictures paused): wanted — a bound set |
| `cnh-553` | none | not re-checked (pictures paused): wanted |
| `cnh-554` | none | not re-checked (pictures paused): the glossary's portrait looks fine |
| `cnh-555` | none | not re-checked (pictures paused): the glossary's portrait is fine |
| `cnh-556` | none | not re-checked (pictures paused): the glossary's picture is fine |
| `cnh-557` | none | not re-checked (pictures paused): the glossary's factories panorama fits |
| `cnh-558` | none | not re-checked (pictures paused): wanted |
| `cnh-559` | none | not re-checked (pictures paused): wanted |
| `cnh-560` | none | not re-checked (pictures paused): the glossary's portrait looks fine |
| `cnh-561` | none | not re-checked (pictures paused): wanted |
| `cnh-562` | none | not re-checked (pictures paused): wanted — the signing aboard the *Cornwallis* |
| `cnh-563` | none | not re-checked (pictures paused): wanted |
| `cnh-564` | none | not re-checked (pictures paused): wanted |
| `cnh-565` | none | not re-checked (pictures paused): the glossary's labelled "alleged likeness" is fine |
| `cnh-566` | none | not re-checked (pictures paused): wanted |
| `cnh-567` | none | not re-checked (pictures paused): wanted |
| `cnh-568` | none | not re-checked (pictures paused): wanted |
| `cnh-569` | none | not re-checked (pictures paused): the current picture is fine |
| `cnh-570` | none | not re-checked (pictures paused): wanted |
| `cnh-571` | none | not re-checked (pictures paused): wanted |
| `cnh-572` | none | not re-checked (pictures paused): wanted |
| `cnh-573` | none | not re-checked (pictures paused): wanted |
| `cnh-574` | none | not re-checked (pictures paused): wanted |
| `cnh-575` | none | not re-checked (pictures paused): the glossary's portrait is fine |
| `cnh-576` | none | not re-checked (pictures paused): the glossary's portrait is fine |
| `cnh-577` | none | not re-checked (pictures paused): wanted |
| `cnh-578` | none | not re-checked (pictures paused): the glossary's photograph is fine |
| `cnh-579` | none | not re-checked (pictures paused): wanted |
| `cnh-580` | none | not re-checked (pictures paused): wanted |
| `cnh-581` | none | not re-checked (pictures paused): wanted |
| `cnh-582` | none | not re-checked (pictures paused): wanted |
| `cnh-583` | none | not re-checked (pictures paused): wanted |
| `cnh-584` | none | not re-checked (pictures paused): the glossary's 1912 German map fits |
| `cnh-585` | none | not re-checked (pictures paused): wanted |
| `cnh-586` | none | not re-checked (pictures paused): wanted — a *New Youth* cover |
| `cnh-587` | none | not re-checked (pictures paused): the glossary's photograph is fine |
| `cnh-588` | none | not re-checked (pictures paused): the glossary's photograph is fine |
| `cnh-589` | none | not re-checked (pictures paused): the glossary's photograph is fine |
| `cnh-590` | none | not re-checked (pictures paused): wanted |
| `cnh-591` | none | not re-checked (pictures paused): wanted |
| `cnh-592` | none | not re-checked (pictures paused): wanted; its locator points at central Guangzhou, not Changzhou Island |
| `cnh-593` | none | not re-checked (pictures paused): the glossary portrait's licence ("Attribution") wants a check |
| `cnh-594` | none | not re-checked (pictures paused): wanted |
| `cnh-595` | none | not re-checked (pictures paused): wanted |
| `cnh-596` | none | not re-checked (pictures paused): wanted |
| `cnh-597` | none | not re-checked (pictures paused): wanted |
| `cnh-598` | none | not re-checked (pictures paused): wanted — the party flag |
| `cnh-599` | none | not re-checked (pictures paused): wanted |
| `cnh-600` | none | not re-checked (pictures paused): wanted — the Bund |

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

### B36 — `cnh-351`–`cnh-360`, Sui and Tang: the Goguryeo–Sui War to the Tang Code (2026-11-13)

Run as B31. Every cited URL answered. **Pictures were not touched**; none of the ten cards has a picture. **The old cards
cited Chinese Wikisource (all seven sources of the Goguryeo war; three or four on most others), put battle templates on
the Goguryeo war ("Casualties 302,300+", a figure no source gives), named places in the walls' labels ("Yulin wall",
"Yugu wall"), dated the Tang by a census ("Census 764 CE", another event), gave the Zhenguan era a "Good harvest 630"
row, dated the Tang Code to 637 (no page fetched prints it), told the scarf at Emperor Yang's death as the *Sui shu*'s,
and misread 贞观 as Zhēnguàn.** The histories were read in the Siku text on the Kanseki Repository and on zggdwx.com.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-351` Goguryeo–Sui War | 6 | 7 → 6 | **The battle template off: `Fought 598 – 614 CE` / `Great invasion 612 CE`; the *Sui shu* juan 4 (the commanders fled with "2,000-odd horsemen") for seven Wikisource sources; the 305,000 and the 2,700 survivors credited to a history drawn from Korean chronicles (Hulbert); the feigned retreats before the Salsu rout; the 614 edict**; "eight or nine in ten", the drums and horns, the 631 mound dropped. |
| `cnh-352` Sui long walls | 5 | 7 → 6 | **The place labels off: `Earlier wall 585 CE` (Mailla's Lingwu wall, said not to be the first) / `Great levy 607 CE` / `Further levy 608 CE`; the million-man levy, the ten days and "five or six in ten died" the Sui annals'; "Yugu" made the Yulin valley**; the *Zizhi tongjian*'s "twenty days" and Yuwen Bi's remark dropped. |
| `cnh-353` Wagang Army | 5 | 5 → 5 | **Two Wikisource texts cut to the *Old Book of Tang*'s Li Mi (juan 53); Wechsler's chapter; the Xingluo granary, Zu Junyan's manifesto, the rout by Wang Shichong; the glossary's c. 611 – 618 made 617 – 618 (611 the first risings, not Wagang's)**; the *Sui shu*'s "7,000 picked men" and Zhai Rang's jailbreak (the *Zizhi tongjian*'s) dropped. |
| `cnh-354` Yuwen Huaji | 5 | 6 → 5 | **"Strangled with his own scarf" corrected: the scarf is the *Zizhi tongjian*'s (juan 185, 自解練巾), not the *Sui shu*'s, so the card says only "strangled" (Cordier); the homesick guards, the Yulin trade, the Xu throne; the answer's word "Yuwen" out of the questions**. Protected: the line stays (flagged below). |
| `cnh-355` Tang dynasty | 8 | 8 → 8 | **"Census 764 CE" off: `Ruled 618 – 907 CE` / `Interrupted 690 – 705 CE`; the census drop left to `cnh-378` (the 764 report of 16.9 million registered, said to count taxpayers, not the living, in Think it through); Olopen's arrival 635 (Parker) for Giles's 636; the *Zizhi tongjian* juan 223 the one Chinese source**; "Men of Tang" (a 1901 source) dropped. |
| `cnh-356` Emperor Gaozu of Tang | 6 | 6 → 6 | **Whose account is whose: the *Old Book of Tang* (juan 1) credits Li Shimin and Liu Wenjing and calls Gaozu irresolute, Wen Daya's diary shows Li Yuan deciding (Theobald); the Turkish horses and his daughter's army, the drink-and-bribes story, Jieli made to dance**; the Kaiyuan tongbao of 621 (a conversion) and the Turkish raid story dropped. Protected: the line stays (flagged below). |
| `cnh-357` Emperor Taizong of Tang | 7 | 8 → 7 | **Three Wikisource texts cut to the *Old Book of Tang* juan 2; the six horsemen and the white horse at the Bian bridge, the brass-mirror saying, the Heavenly Khan; Twitchett on the Veritable Records**; the Yanmen ruse year, the Sui bones and "greatest of rulers" dropped. Protected: the line stays (flagged below). |
| `cnh-358` Xuanwu Gate Incident | 6 | 7 → 7 | **The line kept (Cordier prints 2 July and 4 September 626); the story traced to the record Taizong ordered after seeing his historians' work, Sima Guang's doubt of the banquet plot, Kim 2021 (in Korean): a killing Li Shimin wished to conceal; the two heads, the emperor on the lake, the Prince of Qi's bow**. **Pinyin Xuánwǔ Mén → Xuánwǔmén zhī biàn**, joined as Hóngmén and Lóngmén. |
| `cnh-359` Zhenguan era | 6 | 7 → 7 | **"Good harvest 630" off: `Reign period 627 – 649 CE`; the 29 death sentences and the unbarred gates the *Old Book of Tang*'s claims; the hard first years and the palace women sent home; Wu Jing's manual and its translations (Kornicki); Wei Zheng's mirrors left to `cnh-357`'s question**. **Pinyin Zhēnguàn → Zhēnguān.** |
| `cnh-360` Tang Code | 7 | 7 → 7 | **"Issued 637" off (no page fetched prints it; the *Old Book* has the first month of Zhenguan 11, Theobald 639): `Revision ordered 627 CE` / `Revised 651 CE` / `Commentary 653 CE`; the 92 capital offences cut to exile, Gaozong's commentary; Ho 2015 and Ōtaka 2013 (in Japanese)**; "500 articles" (`cnh-346`'s figure), the 20 grades and the eight privileged groups (unsourced) dropped. |

Read by eye. **Confusability**: Wei Zheng's mirrors were a phrasing on both `cnh-357` and `cnh-359`; they stay `cnh-357`'s
and `cnh-359`'s was rewritten (the palace women sent home); the Yongji branch stays `cnh-350`'s; Emperor Yang's death
`cnh-354`'s; the census `cnh-378`'s. **Legend**: the Xuanwu Gate as Taizong's historians told it; Gaozu's irresolution the
*Old Book*'s; the Zhenguan peace the *Old Book*'s and Wu Jing's portrait. **Chinese names corrected**: `cnh-358` and
`cnh-359` pinyin; `隋征高句丽` kept unconfirmed (no standard term found — for the owner). **Spellings fixed**: the khagan
Illig written Jieli on every card (a row added; `cnh-357`'s and `cnh-359`'s "Xieli" made Jieli). **Myth register**: the
Xuanwu Gate row confirmed (the *Old Book* makes the brothers the plotters; Theobald and Kim read the record as rewritten
in Li Shimin's favour). **check-citations**: `cnh-358`'s Kim 2021 reported for name order (Korean order cited; fine).
**Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-354`'s 22 March 619 is on no page read and
Giles puts the death in 618; `cnh-356`'s 566 is on no page read (the *Old Book*: Tianhe 1; Giles 565) and its age 69 sits
against Cordier's 71 and the *Old Book*'s 70; `cnh-357`'s 28 January 598 is on no page read (the *Old Book*: Kaihuang 18,
twelfth month, *wuwu* day; Giles 597, Wechsler 600), and its 10 July 649 and Cuiwei Palace are read only in the *Old Book*
juan 3 (uncited). The *Zizhi tongjian*'s Siku text reads 39 death sentences for Zhenguan 4 where the *Old Book* has 29.

### B37 — `cnh-361`–`cnh-370`, Tang: koufentian to the Sogdian Whirl (2026-11-13)

Run as B31. Every cited URL answered. **Pictures were not touched**; none of the ten cards has a picture. **The old cards
cited Chinese Wikisource for nearly every source (three to seven Chinese texts a card), dated the Zhengshitang (683, 723)
and the mingjing's pass mark (681) by conversions no page prints, put a battle template on Yinshan ("27 March 630", a
converted lunar date; "Over 10,000 Turkic dead, 100,000 captured"), gave Chang'an a prose founding, an unsourced peak and
an unowned population, dated the West Market by a year no page gives (607) and another card's edict (707), dated the
sabao by unconverted reign years, and counted the Sogdian Whirl's tribute as a span.** The histories, the *Tongdian* and
the *Chang'an zhi* were read in the Siku text on the Kanseki Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-361` koufentian | 5 | 6 → 6 | **Three Wikisource texts cut to the *Tongdian* juan 2 (the statute's figures, the narrow-district half share, the sale rules); the 737 row resting on Ikeda On 1964 (in Japanese: no basic change across the statutes of 624, 719 and 737; the Turfan documents use its terms for holdings far from its rules); Asakawa on Japan's kubunden**; "far below the norm" said only for Turfan, as the abstract says. |
| `cnh-362` zuyongdiao | 6 | 6 → 6 | **The *Old Book of Tang* juan 48: 2 shi of millet, 2 zhang of silk, 20 days' labour or 3 feet of silk a day, the remissions at four, six and seven tenths lost, the Lingnan rice tax; Hansen and Rong on Turfan (after 640, to 755)**; the Tianbao revenue figures dropped; the 780 replacement left to `cnh-381`. |
| `cnh-363` Zhengshitang | 5 | 5 → 5 | **The line emptied: no page read prints 683 or 723; the *Tongdian* juan 21 gives the move as Yongchun 3 (an era with two years) and the renaming as Kaiyuan 11, printed in that form; Pei Yan's brush, Zhang Yue's seal, the ministers' turns with the brush, Yao Shu's record; Hartman and Akagi (Liu Houbin's view)**; Li Hua's essay and the "five offices" dropped. |
| `cnh-364` mingjing | 5 | 5 → 5 | **"Pass mark set 681" (a conversion) off: `Tiejing added 680 CE` (Wong; Biot) / `Law added 786 CE` / `Abolished 1071`; the covered page, six of ten passages and ten oral questions, the set texts; Wong's figures for 845 for the old quota**; the "old at thirty, young at fifty" saying (the *Tang zhiyan*, uncited) dropped; trimmed to 285. |
| `cnh-365` Battle of Yinshan | 6 | 6 → 6 | **The battle template off: `Fought 630 CE`; the *Zizhi tongjian* juan 193 for four Wikisource sources: the frost and drought (Parker's snows his), the fog tied to Su Dingfang's vanguard (the *Old Book*'s Li Jing has none), Princess Yicheng killed, Jieli's stone likeness at Zhaoling (Zhou, SPP 187)**; the Heavenly Khan and the Bian bridge left to `cnh-357`. |
| `cnh-366` Anxi Protectorate | 6 | 7 → 6 | **`Seat moved 658 CE` for the place label, `Lost c. 787 – 791 CE` added; the Four Garrisons named (Karashahr later for Suiye); the move to Kucha in 648 and the return; the Turfan lawsuit (Wu Zhen, SPP 119); Empress Wu's 30,000 at Kucha; Wukong finding Guo Xin in 788**; the claim that the two Western protectorates answered to Anxi dropped. |
| `cnh-367` Chang'an | 7 | 7 → 7 | **`Founded 582 CE` / `Capital 583 – 904 CE` / `Renamed 1369`; the *Chang'an zhi* juan 7 for seven Wikisource sources; Xiong's thesis; about a million a modern estimate with whose; 108 wards one count beside the code's 110; Yuwen Kai's plan, the monasteries and Persian temples, Nara and Kyoto**; the "end of the Silk Road" (unsourced) dropped from the glossary. |
| `cnh-368` West Market | 6 | 6 → 6 | **`Planned 582 CE` / `Abandoned 904 CE` / `Dig report 1961` for "Named Liren 607" (on no page) and "Market edict 707" (`cnh-768`'s); the excavated office and finds, the lone-willow execution ground, the Sogdian taverns (de la Vaissière), the reward money of 815; 300 drumbeats from the code (Xiong notes 200 elsewhere)**; the Princess Guangping story (the *Old Book* only) dropped. |
| `cnh-369` sabao | 5 | 6 → 6 | **`Tombs dated 579 – 580 CE` for "Sui ranks" and "Shrine founded 621" (the source prints only Wude 4); the *Tongdian* juan 40: the sabao equal to the upper fifth grade, the fire priest the lower seventh; An Jia, Shi Jun and Yu Hong (Lerner, SPP 168; de la Vaissière; Sims-Williams; Tan et al.)**; the Sui grades (a second Chinese text) and Yoshida's etymology (no open page) dropped. |
| `cnh-370` Sogdian Whirl | 6 | 6 → 6 | **`Sent as tribute 718 – 729 CE` (Mair's years, quoted by Beauchamp); Kang, Mi and Jumi's tribute (Chavannes); Bai Juyi's "Huxuan nü" (Kanseki) without its adoption line or the lychees; the male dancer on the Sogdian tomb couches; the English name a modern rendering (Lerner)**; the *Old Book*'s Kang ensemble (a second Chinese text) dropped. |

Read by eye. **Confusability**: the jinshi's clues went to the mingjing agent; Wei Zheng's mirrors and the Heavenly Khan
stay `cnh-357`'s; Empress Wu's 30,000 men `cnh-366`'s (the Wu Zetian agent was told); the Persian temples `cnh-367`'s and
the taverns `cnh-368`'s, Shi Jun's epitaph `cnh-339`'s (the sabao agent was told); Bai's "Huxuan nü" `cnh-370`'s (the
Yang Guifei agent was told). **Legend**: Jieli's stone likeness is the tomb's; Yinshan's fog the *Zizhi tongjian*'s.
**Chinese names corrected**: none needed (zūyōngdiào's 調 is diào, the dictionary's tiáo a false lead). **Spellings
fixed**: Jieli throughout. **Myth register**: no row touched. **check-citations**: `cnh-361`'s Ikeda 1964 reported
because its title is cited in romanised Japanese (the same paper). `cnh-365` keeps its `L.missing` (a battle with no point
yet); `cnh-362` shares 44% of a phrasing's words with `cnh-717` (corvée), a different subject. For the owner: `cnh-367`'s
locator looks like the Han city, not the Tang; `cnh-368`'s point is labelled Xi'an; `cnh-370`'s Samarkand point suits no
dance; `cnh-366`'s retaking is the second Changshou year in the *Old Book* against Stein's and Chavannes's 692; Bai Juyi's
own note puts the dancing girls at the end of Tianbao, against the history's Kaiyuan tribute; `jp-088` carries the old
Chang'an line's faults.

### B38 — `cnh-371`–`cnh-380`, Tang: Wu Zetian to the jiedushi (2026-11-13)

Run as B31. Every cited URL answered. **Pictures were not touched**; none of the ten cards has a picture. **The old cards
cited Chinese Wikisource for two or three Chinese texts apiece, put battle templates on Talas ("Casualties 20,000 –
30,000 Tang killed, by Chinese sources") and the An Lushan Rebellion ("7 years, 2 months", "Result Tang victory"), dated
the Kaiyuan era by a "Locust campaign 716" no source converts, counted the jiedushi's "Ten commands 742" on no page, ended
the Hebei provinces with the Tang's fall, read the census drop of 52.9 to 16.9 million as deaths, told the lychees, the
adoption and the strangled daughter in the card's own voice, and gave the Longmen Buddha a firm 675.** The histories were
read in the Siku text on the Kanseki Repository and on zggdwx.com (the *Old Book of Tang* past juan 188).

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-371` Wu Zetian | 8 | 8 → 8 | **Wikisource, an expired Russian site and Mayers replaced: the *Old Book of Tang* juan 6, the two Cambridge chapters, Bottéro; her father Wu Shihuo (not Shiyue); the strangled daughter and the maimings told as hostile historians' reports; the convent, the "two sages", the character zhao, the last decree before Qianling**; "enlarged the empire" and the Longmen 675 dropped. Protected: the line stays (flagged below). |
| `cnh-372` Wu Zhou | 6 | 6 → 6 | **The *Zizhi tongjian* juan 204 with Hu Sanxing: Fu Youyi's nine hundred petitioners, the phoenix, the King Ping descent and Hu's scorn, the Great Cloud temples, the Divine Palace of Myriad Images, the twelve new characters, Wang Qiuli's objection**; the Divine Capital gloss and four Bright Hall dates (on no page cited) dropped. |
| `cnh-373` Emperor Xuanzong | 7 | 7 → 7 | **Two Wikisource texts and Mayers cut to the *New Book of Tang* juan 5; Princess Taiping's fall, the Daodejing commentary and Laozi as ancestor, the Pear Garden; Owen's open-access Du Fu**; the Hanlin claim dropped. Protected: the line stays (flagged below). |
| `cnh-374` Kaiyuan era | 6 | 6 → 7 | **"Locust campaign 716" off (the annal puts Yao Chong's petition in Kaiyuan 3, his biography in 4): `Era 713 – 741 CE`; Du Fu's "Recalling the Past" (Owen), the palace luxuries burned, the locusts driven into fires; the household count of 726 with whose registers; the Kaiyuan tongbao coins older than the era**; the converted 714 and the 140,000 shi dropped. |
| `cnh-375` Yang Guifei | 7 | 7 → 7 | **The *Old Book of Tang* juan 51 for Wikisource; her age at death 38 by the Chinese count (the line's 37 in full years); 719 a modern figure; the lock of hair, Prince Shou and the Taizhen habit; the lychees Mayers's account and Du Fu's poem, not the card's voice; Owen judging the An Lushan lover story later lore**. Protected: the line stays (flagged below). |
| `cnh-376` Battle of Talas | 7 | 7 → 7 | **The battle template off: `Fought 751 CE`; the *Zizhi tongjian* juan 216 (30,000 against 60,000 in its note), the Qarluq defection, the king of Chach beheaded; the paper story al-Tha'alibi's 11th-century tale against paper documents some three decades earlier (Bloom); Du Huan from Hirth and Rockhill**; the old casualty row (no source) dropped. |
| `cnh-377` An Lushan | 7 | 7 → 7 | **Three Wikisource texts cut to the *Old Book of Tang* juan 200A (zggdwx); Rokhshan "one modern view" (de la Vaissière); the sheep theft, Shi Siming his fellow townsman, the adoption he asked for himself ("barbarians put the mother first") all the history's; the whirl left to `cnh-370`, the rebellion's course to `cnh-378`**. Protected: the line stays (flagged below). |
| `cnh-378` An Lushan Rebellion | 7 | 7 → 7 | **The battle template off: `Fought 755 – 763 CE`; the census whose and what: the Board of Revenue's 52,880,488 registered people for 754 (the *Zizhi tongjian* juan 217) and just over 16.9 million for 764 (Cordier), tax registers kept less carefully after the war (Theobald), not a death toll (Cordier's own reading not followed); Shi Siming's jades hedged; the chain of murders**; the 490,000 frontier troops (`cnh-380`'s) and "hanged himself in a wood" (Wikisource only) dropped. |
| `cnh-379` Three Fanzhen of Hebei | 6 | 6 → 6 | **"Tang falls 907" off: `Settled 763 CE` / `Revolt 781 – 785 CE` / `Submitted 819 CE`; the *Old Book of Tang* juan 141: Pugu Huai'en's motive as that history tells it, Tian Chengsi's army and guard, the court's indulgence, the refused succession of 781; O'Byrne 1982 (open) for the war and a modern doubt of Pugu's plan**; Heshuo san zhen added as an alias. |
| `cnh-380` jiedushi | 6 | 6 → 6 | **"Ten commands 742" (on no page) off: `First appointed 711 CE` / `Also dated 710 CE` (Sima Guang's Youzhou, via O'Byrne) / `Curbed 965 CE`; the *Old Book of Tang* juan 38's ten commanders with 490,000 men and 80,000 horses; An Lushan's army 120,000 by one count, 200,000 by another**. |

Read by eye. **Confusability**: Empress Wu's 30,000 at Kucha stay `cnh-366`'s; Bai's "Huxuan nü" and Mawei in it `cnh-370`'s
(the Yang Guifei agent was told); Du Fu's "Recalling the Past" `cnh-374`'s (noted for `cnh-392`); the adoption request is
a phrasing on `cnh-377` (the history's, so told) and a mention on `cnh-375`; the census `cnh-378`'s and the frontier
armies `cnh-380`'s. **Legend**: the lychees, the adoption, the strangled daughter and the paper prisoners are now each a
text's or a tale's; the An Lushan–Yang Guifei love story later lore (Owen). **Chinese names corrected**: none needed.
**Spellings fixed**: none needed; 0 hits. **Myth register**: Wu Zetian's hostile tradition — the strangled daughter is in
Giles but not in the *Old Book* juan 51 (its earliest text still unconfirmed; row stays provisional); Yang Guifei — the
lychees Mayers's and Du Fu's, the *Song of Everlasting Sorrow* dated 807 by Beauchamp against the row's 806 (corrected to
"806 or 807"); An Lushan's adoption — the *Old Book* has him ask for it himself, the three-day washing is the *Zizhi
tongjian*'s (juan 216). **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-371`'s 624 and
Lizhou are on no page read (the age at death is 83 in the *Old Book*, 82 in the *New*); `cnh-373`'s 8 September 712 is on
no page read, Cordier's 12 August 756 is the son's assumption of the title, not the abdication, and Cordier gives the age
at death as 78 by the Chinese count; `cnh-375`'s 719 and her death day are on no page read; `cnh-377`'s 5 February 756 is
on no page read and its 25 January 757 meets Cordier's 30 January and Theobald's February.

### B39 — `cnh-381`–`cnh-390`, Tang: the two-tax system to regulated verse (2026-11-13)

Run as B31. Every cited URL answered. **Pictures were not touched**; none of the ten cards has a picture. **The old cards
cited Chinese Wikisource (two to four Chinese texts a card) and MDPI and Springer articles, named places in labels ("Retook
Chang'an", "Beat the Tang"), gave the Nanzhao a firm 649 – 902 and the Tibetan Empire no span, told the Famen Temple's
self-burnings and the emperor's tears, Li Bai's drowning and Liu Yan's boyhood in their own voice, counted Xuanzang's
translations from an abridgement, and named the Huichang persecution and the Uyghur state by forms no page read prints.**
The histories were read in the Siku text on the Kanseki Repository and on zggdwx.com (the *New Book of Tang* juan 149 and
216, which the Kanseki copy does not reach).

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-381` two-tax system | 6 | 6 → 6 | **Three Wikisource texts cut to the *Old Book of Tang* juan 118 (Yang Yan's memorial); `Superseded 1581` added (as `cnh-522`); the spending-first rule and the merchants' thirtieth, Lu Zhi's "pocket or box", the Song, the Yuan renaming and the single whip; the debate on the peasants' burden; Yang Yan's career left to `cnh-382`**; Giles's "without success" not used against the history. |
| `cnh-382` Yang Yan | 6 | 6 → 6 | **The tax mechanics (`cnh-381`'s) off the questions: Chang Gun and Yuan Zai, Liu Yan's killing on a false charge, Lu Qi's case over the house sale and the "royal aura" temple site; the years out**. Protected: the line stays (flagged below). |
| `cnh-383` Liu Yan | 6 | 6 → 6 | **The *New Book of Tang* juan 149: the ode at Mount Tai at eight and Zhang Yue's "good omen" (said whose), the salt revenue whose (the history's 600,000 strings rising tenfold; Theobald's 400,000 to over 6 million), the grain relay run by officials; the glossary's "born 716" made "715 or 716"**. Protected: the line stays (flagged below). |
| `cnh-384` Tibetan Empire | 7 | 7 → 7 | **`Flourished c. 618 – 842 CE` added (the glossary's span; the old `G.date`); the *New Book of Tang* juan 216 and the Old Tibetan Annals (OTDO Pt 1288); btsanpo glossed from the history's "strong man"; the puppet prince of 763, Wencheng's city and the ochre ban, the old Tang subjects weeping in 822; Lang Darma's death and the break-up**; Theobald's 640 and 823 not used. 吐蕃 kept as Tǔbō. |
| `cnh-385` Uyghur Khaganate | 7 | 7 → 7 | **`Retook capitals 757 CE` for the place label; the 2026 Karabalgasun excavation report (the city, the citadel walls, Tang decrees inlaid in gold), Kalikov on the trilingual inscription, the 762 conversion, the 788 "swooping hawk" name, the 839 revolt before the Kyrgyz; Fu Ma in *The Paper* the one Chinese source**; the Chang'an riots and "useless horses" (unsourced) dropped. **Name 回纥 Huíhé → 回鹘汗国 Huíhú Hánguó** (the state, not the people's pre-788 name). |
| `cnh-386` Nanzhao | 6 | 6 → 6 | **`Traditional 649 CE` / `Recognised 738 CE` / `Beat the Tang 751 CE` / `Fell 902 CE`; the *Zizhi tongjian* juan 216 for three Wikisource juan: the 80,000 men, the refused peace, the 60,000 dead, the Tibetan "younger brother" title, the stele at the gate; Evans from the journal's own site (not an archive.org user upload); Bryson 2015 (first page); the Dehua stele (Brinckmann); the Tai theory superseded**; "32 prefectures" and "took Hanoi 863" dropped. |
| `cnh-387` Famen Temple | 6 | 6 → 6 | **The *Old Book of Tang* juan 19A for the 873 procession (Yizong's last year; Tan's 833 – 873) and the historians' verdict; Wang Yarong 1989 (in French): the Ming pagoda's collapse in 1981, the crypt found 1987, four relics, the tablets of more than 2,700 characters; Tan et al. 2021 (336 objects, sealed 874); Han Yu's memorial mentioned only**; the thirty-year rule, the self-burnings told as fact, Yizong's tears and the 871 statue (Wikisource and MDPI only) dropped. |
| `cnh-388` Xuanzang | 7 | 7 → 7 | **The translations made the card's own (the plan's pair: here the monk's journey and its translations): the nightmares and the whole *Great Perfection of Wisdom Sutra*, Bianji and the *Record*, the Yogacarabhumi and Dharmapala's reading; 74 works (the biography; the old 1,335 chapters from Beal's abridgement); Huili and Yancong's biography in Chinese and Beal, Watters, the Stanford Encyclopedia**; "75 works" and the "hundred countries" (MDPI) dropped. Protected: the line stays (flagged below). |
| `cnh-389` Great Anti-Buddhist Persecution | 6 | 6 → 6 | **The *Old Book of Tang* juan 18A: what the seventh- and eighth-month orders each did, the bronze images melted for coin, the 3,000 Nestorian and Zoroastrian clergy laicised, the Manichaeans struck in 843; Xiong, Hershock, Cordier; Zhao Guizhen's role kept, his "beaten to death" (on no page) dropped; Ennin's figures dropped (no open text of the translation)**. **Name 会昌灭佛 → 会昌法难, Huìchāng fǎnàn** (the Encyclopedia of China's head; 灭佛 a common alternative — for the owner). |
| `cnh-390` regulated verse | 6 | 6 → 6 | **The *New Book of Tang* juan 201 (Song Zhiwen and Shen Quanqi's "regulated" poems); the Yongming roots (Theobald); Owen on Song standards imposed backwards on Tang collections; Martin (in French)**; "couplets 3–4 and 5–6" (on no page read) and a date for the form's fixing (none printed) left out; the line stays empty. |

Read by eye. **Confusability**: the tax mechanics are `cnh-381`'s and the man `cnh-382`'s; Liu Yan's killing is a phrasing on
`cnh-382` and a fact on `cnh-383`; Han Yu's memorial stays `cnh-394`'s, mentioned on `cnh-387`. **Legend**: Liu Yan's
boyhood ode the *New Book*'s; the Famen self-burnings dropped for want of a source. **Chinese names corrected**: `cnh-385`
回鹘汗国 (Hánguó kept against the dictionary's hàn; `cnh-547`'s live "Hànguó" looks wrong — for the owner); `cnh-389`
会昌法难. **Spellings fixed**: none needed; 0 hits. **Myth register**: Han Yu's memorial confirmed (`cnh-387` mentions it as
his warning). **check-citations**: `cnh-385`'s Kalikov 2022 reported for name order (Crossref swaps the names).
**Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-382`'s 727 is printed only by Theobald (the
*Old Book* gives his age as 55 by the Chinese count); `cnh-383`'s 715 is on no page read (the *Old Book*'s age 66 gives it,
the *New*'s 65 gives 716) and its 12 August 780 is on no page read (the history: the seventh month of Jianzhong 1);
`cnh-388`'s 6 April and 5 February are on no page read, Watters puts the return in 646, Theobald gives the departure as 627
and the birth as c. 600 or 596, and Beal prints the death as the 10th month, 13th day of 664. `in-199`, the plan's India
pair for Xuanzang, is not yet written (India stands at `in-100`). `cnh-386`'s point is modern Dali; the Taihe city site
would be closer.

### B40 — `cnh-391`–`cnh-400`, Tang and Five Dynasties: Li Bai to the Sixteen Prefectures (2026-11-13)

Run as B31. Every cited URL answered. **Pictures were not touched**; none of the ten cards has a picture. **The old cards
cited both Tang histories and both histories of the Five Dynasties on Chinese Wikisource, put a battle template on the
Huang Chao rebellion ("9 years", "Result Tang victory"), named a place in the Later Tang's labels ("Shu conquered"), ended
the Sixteen Prefectures with another card's alliance ("Song alliance 1120", `cnh-419`'s), dated the Weizhou mutiny and Han
Yu's recall by conversions, told Li Bai's drowning, Gao Lishi's boots and Han Yu's crocodile in their own voice, and called
Han Yu's cousin his brother.** The *New Book of Tang* (juan 201, 202, 225), the *Old Book of Tang* (juan 160, 166) and
the *New History of the Five Dynasties* (juan 2, 37, 43, 71) were read on zggdwx.com and the Kanseki Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-391` Li Bai | 7 | 7 → 7 | **Two Wikisource histories and Mayers cut to the *New Book of Tang* juan 202; Suyab a modern view (Jao Tsung-i, open access); the boots and Yang Guifei the *New Book*'s; the drowning a legend Hong Mai already doubted in the 12th century; "banished immortal", the Prince of Yong and Guo Ziyi's plea; trimmed to 283**; "around 742" and "12th century" out of the questions. Protected: the line stays (Giles's 705 – 762 not used). |
| `cnh-392` Du Fu | 7 | 7 → 7 | **The *New Book of Tang* juan 201; Ayscough's 1929 volume (a year-by-year record), Owen and Waley; Fang Guan's defence and the Huazhou post, Yan Wu's staff and the Chengdu cottage, the "poet-historian"; "Recalling the Past" left to `cnh-374`**; "754" for the rhapsodies, the Huanhua stream and "both Tang histories" on the beef and wine (unsourced) dropped. Protected: the line stays. |
| `cnh-393` Bai Juyi | 6 | 6 → 6 | **The *Old Book of Tang* juan 166 for two Wikisource histories; Waley's 1919 translations (not his 1949 book, a copyrighted scan); the flower-and-well poems used against him in 815, the singing girl who could recite his ballad, burial beside Ruman at Xiangshan; his fame in Japan (Beauchamp)**; "more poems than any earlier writer" and the "Silla" merchants dropped. Protected: the line stays (flagged below). |
| `cnh-394` Han Yu | 6 | 7 → 6 | **The *Old Book of Tang* juan 160 for Wikisource and an MDPI article; the bone memorial in his own words, the crocodile the court history's story and a legend, the Way passed to Mencius; "elder brother" made "older kinsman" (従父兄); Mayers's first name corrected**; "recalled in 820" (a conversion) and Giles's History (the memorial misdated 803) dropped. Protected: the line stays (flagged below). |
| `cnh-395` Huang Chao rebellion | 7 | 7 → 7 | **The battle template off: `Fought 875 – 884 CE` / `Capital held 881 – 883 CE`; Wang Xianzhi's manifesto (the *New Book of Tang* juan 225); the failed examinations a later history's claim; Canfu in 879 (Gaubil via Cordier; Renaudot 877) and the Siraf account's 120,000 as its figure; Yu Cong's sea-trade argument; "washing the city"; Somers on the Shatuo**; the salt price and "bands from the 850s" dropped. |
| `cnh-396` Zhu Wen | 6 | 7 → 6 | **The *New History of the Five Dynasties* juan 43: Li Zhen's "pure stream" after Baima, the killers of Zhaozong executed; Huazhou handed to the Tang and the name Quanzhong; Standen's chapter**; the claims only juan 1 carries dropped. Protected: the line stays (flagged below). |
| `cnh-397` Five Dynasties and Ten Kingdoms | 7 | 7 → 7 | **Told through the two later histories: Xue Juzheng's five books, Ouyang Xiu's single line and his note that none of the ten belonged to the Central Realm; Clark's point that "Ten Kingdoms" misleads; Cordier's "anarchy" against the modern reading of transition; Standen, Clark, Lorge and the *New History* juan 71**; Parker 1924, Macgowan and the Shatuo and Khitan claims dropped; the histories' dates (on no page read) left out. |
| `cnh-398` Later Liang | 6 | 7 → 6 | **The *New History* juan 2: Kaifeng the Eastern Capital and Luoyang the Western, Ouyang Xiu's refusal to call the Liang false; the last emperor's death given two ways (Cordier; Giles)**; 915 for the Weizhou mutiny (a conversion) dropped. |
| `cnh-399` Later Tang | 6 | 7 → 7 | **"Shu conquered" off (925 in prose): `Ruled 923 – 936 CE` / `Founder killed 926 CE`; the *New History* juan 37: the body burned on a heap of instruments by a man of the Five Workshops (not "by actors"), Jing Xinmo's slap, the three arrows (Ouyang Xiu's hearsay), Li Siyuan**; Giles's 925 for the death not used. |
| `cnh-400` Sixteen Prefectures | 6 | 7 → 6 | **"Song alliance 1120" off (`cnh-419`'s): `Promised 936 CE` / `Handed over 938 CE` (the *Liao shi*'s Huitong 1, which Theobald's table makes 938); "held until the 1120s" made the Jurchen's return of Yanjing and six districts, looted (Cordier), held by the Song 1122 – 1125 (Bretschneider)**. **Pinyin Yān Yún shíliù zhōu → Yānyún Shíliùzhōu**, joined as Shíliùguó. |

Read by eye. **Confusability**: Du Fu's "Recalling the Past" stays `cnh-374`'s; the Song of Everlasting Sorrow is mentioned
on `cnh-393` (its singing-girl clue) and `cnh-375`; Han Yu's memorial `cnh-394`'s, mentioned on `cnh-387`; the three
arrows `cnh-399`'s; Shi Jingtang's person left light for `cnh-401`. **Legend**: Li Bai's drowning, Gao Lishi's boots, the
crocodile and Huang Chao's failed examinations are each a text's or a legend. **Chinese names corrected**: `cnh-400`
pinyin; `黄巢起义` kept unconfirmed (no open page with the compound loaded — for the owner). **Spellings fixed**: none
needed; 0 hits. **Myth register**: Li Bai's drowning confirmed (a legend Hong Mai doubted); Han Yu's memorial confirmed.
**check-citations**: `cnh-391`'s Jao Tsung-i essay reported because Crossref lists the translator-editor (Nicholas Morrow
Williams). **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-393`'s Xinzheng is on no page read
(Waley: Taiyuan) and the *Old Book* gives his death as Dazhong 1, aged 76, against the line's 846; `cnh-394`'s 25 December
and Heyang are on no page read; `cnh-396`'s 852 is on no page read (Giles 854) and its death place "Kaifeng" looks wrong
(Giles and the *New History* put the murder at Luoyang).

### The fourth hundred, in sum

`cnh-301`–`cnh-400` (the end of the Western Jin, the Sixteen Kingdoms, Eastern Jin, Northern and Southern dynasties, Sui
and Tang decks, and the first four of the Five Dynasties) are done: 607 sources became 655 and 87 glossary entries were
rewritten. `cnh-audit.js --range=cnh-301:cnh-400` reads 14 of 100 cards clean, against none at the baseline; what remains is
85 cards with no picture (Commons answered with its rate-limit page all session, so no picture pass ran), 10 advisory
`W.not-why`, 8 `Z.reading?` that are polyphones or place names read as the house reads them (前燕 Yān, 佛图澄 dèng,
高句丽 gōu, 瓦岗 gǎng, 租庸调 diào, 汗国 hán, 法难 nàn, 燕云 Yān), one `L.missing` (`cnh-365` Yinshan, a battle with no
point yet) and one `Q.sibling` (`cnh-362` against `cnh-717`, a different subject). `check-cnh-spellings.js` reads 0 card hits
over the hundred (the baseline's two — "Nan Qi" on `cnh-325`, "Li Po" on `cnh-391`, now an alias — are settled).
Fifty agents worked two cards each, never more than ten at once; as each draft came back its clues went into `AGENT.md` and
running agents were told of any shared clue (Emperor Huai's robe, Fu Jian's seal and Murong Chui, Xie An and Huan Wen, Sun
En and Huan Xuan, the Chen well, Chen Bozhi's clerk, the Jiangdu plot and the scarf, the Yongji branch, the jinshi's clues,
Jieli at Yinshan, Empress Wu at Kucha, the Persian temples and the taverns, Bai's "Huxuan nü"). Each batch was applied
alone, verified field by field against its drafts, diffed for the protected lines and committed with its docs; `origin/main`
was merged after B33 (nothing new) and again before the PR.

What the hundred found, again and again:
- **The *Jinshu* and the Tang court histories cited on Chinese Wikisource.** Nearly every card cited two to seven Chinese
  texts there — over the one-per-language rule and unreachable here. Each card now reads one Chinese text in the Siku
  edition on the Kanseki Repository or on zggdwx.com (the *Old Book of Tang* past juan 188, the *New Book of Tang* past
  juan 75), and claims that rested only on the second or third text were dropped.
- **The histories' stories told as records.** Fu Jian's whips and the wind and cranes, Murong Ping's firewood, Fotudeng's
  lotus, the oar oath and the cockcrow, the geese and the Lanting burial, Emperor Wen's horns and scales, the Xuanwu Gate
  plotters, the Zhenguan peace, the lychees and the adoption, Li Bai's boots and his drowning, Han Yu's crocodile: each is
  now its text's, dated and named (the *Jinshu* a Tang compilation; the *Old Book* compiled under the Later Jin).
- **Conversions on the lines.** "Revised 583", "Reorganised 583", "Ten categories 607", the mingjing's 681, the
  Zhengshitang's 683 and 723, the Kaiyuan locusts' 716, the Weizhou mutiny's 915, Han Yu's recall in 820: each a regnal
  year someone converted; each is now dropped, printed in the source's own form, or replaced by a year a page prints.
- **Battle templates, places and men on the lines.** Fei River, Hou Jing, the Goguryeo war ("Casualties 302,300+"), Yinshan,
  Talas, the An Lushan Rebellion and Huang Chao carried Location, Casualties and Result rows; labels named men ("Huai
  executed", "Shi Le emperor", "Xie An") and places ("Fei River", "Jiankang taken", four canal names); values carried prose
  ("made the Northern Wei capital") and counts ("possibly over 1,000,000"). All are now dates only.
- **A date belonging to another event.** The Tang dated by a census of 764, the Hebei provinces ended by the Tang's fall,
  the Sixteen Prefectures by the alliance of 1120 (`cnh-419`'s), the West Market by another card's edict (707).
- **Figures read the wrong way.** The census drop of 52.9 to 16.9 million read as deaths (now the Board of Revenue's tax
  registers, kept less carefully after the war), Fei River's 870,000 and "a million" (the *Jinshu*'s figures and Zhu Xu's
  rhetoric), the Goguryeo war's casualties (a Korean-chronicle history's), the paper prisoners of Talas (al-Tha'alibi's tale).

**The Chinese name.** Corrected: `cnh-326` 梁 → 梁朝, `cnh-329` 陈 → 陈朝, `cnh-343` 隋 → 隋朝 (the house form of 晋朝 and
新朝), `cnh-333` 孝文帝 → 北魏孝文帝, `cnh-385` 回纥 → 回鹘汗国, `cnh-389` 会昌灭佛 → 会昌法难; pinyin on `cnh-303`
(Shíliùguó), `cnh-347` (sānshěng liùbù), `cnh-358` (Xuánwǔmén zhī biàn), `cnh-359` (Zhēnguān, not Zhēnguàn) and `cnh-400`
(Yānyún Shíliùzhōu). No swapped scripts were found in this hundred. Kept unconfirmed for want of a page printing the
compound, for the owner: 隋灭陈之战, 隋征高句丽, 黄巢起义, and 汉赵 (the *Jinshu* writes the state 漢, later 趙); `cnh-323`'s
Nánběicháo left joined (the open pinyin decision). **Spellings**: rows added for the fall of the Western Jin, the Sixteen
Kingdoms states and rulers, the Five Barbarians, Jiankang, the Eastern Jin men, the Southern and Northern dynasties, the
grottoes, the Sui and Tang emperors (English order), Wu Zetian and the Wu Zhou, the reign periods, the institutions lower
case, Goguryeo, Uyghur, the poets, Xuanzang, Huang Chao and the Five Dynasties, and Jieli (B36); "Yangzi" in the drafts'
own voice was made "Yangtze".

**The myth register** gained eleven rows at the start (Fei River, the Lanting preface, the Peach Blossom Spring, Emperor Wu
and Bodhidharma, the Xuanwu Gate, Wu Zetian's hostile tradition, Yang Guifei, An Lushan's adoption, Li Bai's drowning,
Xuanzang and the *Journey*, Han Yu's memorial). Confirmed: Fei River (the *Jinshu* juan 114 and 79; Zhu Xu's shout in
neither), the Xuanwu Gate (the record Taizong ordered; Sima Guang's doubt), Yang Guifei (the *Song* dated 806 or 807),
An Lushan's adoption (he asked for it himself; the washing the *Zizhi tongjian*'s), Li Bai's drowning (Hong Mai's doubt),
Han Yu's memorial. Still provisional: Bodhidharma (no page read dates its first telling), the strangled daughter (in Giles,
not the *Old Book* juan 51), the Lanting burial (He Yanzhi's account on no page read). The scarf at Emperor Yang's death is
the *Zizhi tongjian*'s, not the *Sui shu*'s (`cnh-354`).

**The protected cards** (`cnh-302`, `309`, `312`, `316`–`322`, `327`, `333`, `341`, `344`, `349`, `354`, `356`, `357`, `371`,
`373`, `375`, `377`, `382`, `383`, `388`, `391`–`394`, `396`) kept their `answerDate`, `undatable` and `timeline` byte for byte
through every apply and the merge of main. Every background now carries the years on its card's line. Rows flagged for the
owner, left as they stand (details in each batch): years on no page read — `cnh-312`'s 232, `cnh-317`'s 313, `cnh-319`'s
303 (c.), `cnh-321`'s 344, `cnh-356`'s 566, `cnh-371`'s 624, `cnh-375`'s 719, `cnh-383`'s 715, `cnh-396`'s 852; a year given
otherwise elsewhere — `cnh-302`'s death (perhaps early 318), `cnh-309` (Giles 384), `cnh-322` (Giles 356), `cnh-341`'s 488
(Theobald's own page 487), `cnh-354`'s death (Giles 618), `cnh-357`'s 598 (Giles 597, Wechsler 600), `cnh-388`'s return
(Watters 646); places — `cnh-312`'s Kucha, `cnh-317`'s Zhengzhou (Yongqiu is Qi County), `cnh-319`'s Linyi and Shan County,
`cnh-341`'s Huzhou (Wukang in Wuxing), `cnh-344`'s Chang'an (the *Sui shu*: the Boruo temple at Fengyi), `cnh-371`'s Lizhou,
`cnh-393`'s Xinzheng (Waley: Taiyuan), `cnh-394`'s Heyang, `cnh-396`'s Kaifeng (the murder was at Luoyang); ages against the
histories' Chinese count (`cnh-322`, `333`, `344`, `356`, `373`, `382`); and the days on the person template, nearly all on no
page read (`cnh-302`, `309`, `312`, `316`, `318`, `322`, `327`, `333`, `341`, `344`, `349`, `354`, `356`, `357`, `371`, `373`,
`375`, `377`, `383`, `388`, `394`, `396`).

**For the owner, outside the hundred**: `in-199` (the plan's India pair for Xuanzang) is not written yet; `wh-522` dates the
Mongol rebuild of the Grand Canal 1276 – 1291 against Theobald's 1283 – 1291; `cnh-768` gives the markets 200 drumbeats where
`cnh-368` gives the code's 300; `cnh-547`'s pinyin "Hànguó" looks wrong (汗国 is hánguó); `jp-088` carries the old Chang'an
line's faults.

### Locators (2026-11-13, the fourth hundred)

**No locator was added.** The Wikipedia API answered with its rate-limit page at the end of the run (as Commons did all
session), so `add-locators.js` could not fetch a point, `migrate-places.js` was not run, and `cnh-080` Xibeigang and
`cnh-203` the Qin Straight Road are still waiting. In the hundred, `cnh-365` Yinshan is the one site card with no point
(`L.missing`). Points to review, as the drafts read them: `cnh-314` Jiankang and `cnh-334` Pingcheng are labelled with the
modern cities over the sites (Nanjing, Datong); `cnh-337`'s Wuyuan is one of the six garrisons only; `cnh-367` Chang'an's
point looks like the Han city, not the Tang; `cnh-368`'s point is labelled Xi'an; `cnh-379`'s Daming is Weibo's seat only;
`cnh-386`'s is modern Dali (the Taihe city site would be closer); `cnh-305`, `307`, `308`, `313`, `324`–`326`, `329`, `330`,
`338`, `339` carry polity polygons; `cnh-340` (an institution), `cnh-346` (a code), `cnh-347` (an office), `cnh-370` (a dance,
at Samarkand) and `cnh-397` (a period, at Kaifeng) carry points they need not. `migrate-places.js --check` and
`build-wars.js --check` were not re-run here; on main they already report the third hundred's known failures.

### B41 — `cnh-401`–`cnh-410`, Five Dynasties and Ten Kingdoms: Shi Jingtang to the Northern Han (2026-11-13)

The fifth hundred's first batch, run as the fourth's were (`AGENT.md`, the notes file, two cards an agent, at most ten at
once); every draft read by eye and prechecked before `batch.sh` applied it. Every cited URL answered. **Pictures were not
touched** (Commons answered 429 to the session's one test call). **The old cards cited both histories of the Five
Dynasties and the *Songshi* on Chinese Wikisource (two to four Chinese texts a card), named places in labels ("Jinling
taken", "Taiyuan fell"), dated the Yue ware by one tribute list, gave the Song tribute figures and the Five Dynasties
rulers' ages from texts not read, and carried regnal-year conversions (Chai Rong's 953, Qian Chu's 956).** Each card now
reads one Chinese text: Ouyang Xiu's *New History of the Five Dynasties* (juan 8, 11, 12, 54, 62, 63, 67, 70) on the
Kanseki Repository, Wang Zhi's *Moji* (`cnh-407`) or the *Songshi* juan 480 (`cnh-408`).

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-401` Shi Jingtang | 6 | 7 → 6 | **The *New History* juan 8 for two Wikisource histories; the cession of the prefectures (`cnh-400`'s clue) out of the phrasings — the north-gate meeting with Yelü Deguang as father and son, the fleeing Emperor Min, Ouyang Xiu's verdict that he would have taken the throne without the Khitan; the 300,000 bolts "by later accounts" (Giles, Cordier, Parker); Iwami for the Shatuo-or-Sogdian debate**. Protected: the line stays (flagged below). |
| `cnh-402` Later Zhou | 6 | 7 → 6 | **The *New History* juan 11; `Ruled 951 – 960 CE` / `Founder died 954 CE` kept (Cordier; Theobald and Giles print 953, the Chinese year straddles); Guo Wei acclaimed on the march against the Khitan, the Confucius grave as Macgowan's retelling; Chenqiao mentioned and hedged (Giles)**; "the end of 950" and "the first month of 951" (conversions) dropped. |
| `cnh-403` Chai Rong | 6 | 7 → 6 | **The *New History* juan 12; Gaoping, the bronze images melted for coin with Ouyang Xiu's 3,336 temples against the 30,000 Cordier copied from Mailla, the three passes taken in 959; "aged 39" said as the Chinese count**; Chai ware (a collectors' legend) and the converted 953 dropped. Protected: the line stays (flagged below). |
| `cnh-404` Former Shu | 5 | 5 → 5 | **The *New History* juan 63; "Wang the Eighth, the thief", Wang Yan's mother and aunt selling offices, Ouyang Xiu's mockery of the omens, Wei Zhuang; the Ten Kingdoms a reference-work grouping**; Carter (Tang Chengdu printing, wrong reign years), "903" and "the 880s" dropped. |
| `cnh-405` Wuyue | 6 | 6 → 6 | **`Dated 907 – 978 CE` / `Also dated 902 – 978 CE` (the titles of 907 and 902, Chavannes, Clark); the arrows against the tidal bore told as Qian Weiyan's memoir of about 1000 (Chavannes), the 84,000 stupas, Ouyang Xiu's tax charge against the older accounts; Yamazaki [in Japanese] for the 910 seawall**; the *Songshi*'s tribute figures (`cnh-408`'s), "13 prefectures", "King of Huaihai" and the converted 956 dropped. |
| `cnh-406` Southern Tang | 6 | 6 → 6 | **"Jinling taken" off: `Ruled 937 – 975 CE`; the *New History* juan 62: Li Bian's adoptions, the claimed descent from Xianzong's son, Xu Xuan's plea and the "two households" answer; Dong Yuan and Juran (the Cleveland Museum); the Huainan war from the Tang side only**; Cao Bin and Caishi (the *Songshi* only) dropped. |
| `cnh-407` Li Yu | 6 | 6 → 6 | **The poisoning told as Wang Zhi's *Moji* (the Prince of Qin's drug, "so it is said"); the Jiangnan renaming, the Fate-resisting Marquis (Giles), the river flowing east (Ya Li); the fall given as 975 (Cordier) and 976 (Theobald); Xu Xuan out of the phrasings (`cnh-406`'s)**; the double pupil, the dukedom and "aged 42" (the cut texts only) dropped. Protected: the line stays (flagged below). |
| `cnh-408` Yue ware | 6 | 6 → 8 | **"Tribute list 978" (one event dating a ware) now `Made c. 265 – 1127 CE`, the span of the museum records read (the Art Institute's Western Jin piece, the Met's Northern Song container — said so); the *Songshi* juan 480's 50,000 pieces and 150 gold-rimmed confirmed (prose only); Lu Yu's three comparisons (Bushell), Samarra and Java**; "the most admired celadon" and Famen's mise ware (on no page read) dropped. |
| `cnh-409` Feng Dao | 6 | 7 → 6 | **Four Wikisource texts cut to the *New History* juan 54; "four surnames, ten rulers" and the Khitan (Ouyang Xiu's count), the Happy Old Man of Changle, the Buddha jest to Yelü Deguang, the classics cut on wood (Carter's translation of the 932 memorial and Tian Min's 953 presentation); "aged 73" dropped against the line**. Protected: the line stays (flagged below). |
| `cnh-410` Northern Han | 5 | 5 → 5 | **"Taiyuan fell" off: `Ruled 951 – 979 CE`; the *New History* juan 70 (it calls the state the Eastern Han): the nephew and uncle forms of the Liao tie, the kept reign title, the Wutai monk's silver mine, Taizu's pledge to Liu Chengjun, Yang Ye; Liu Min's death left undated (954 or 955)**; Gaoliang (`cnh-416`'s) kept out. |

Read by eye. **Confusability**: the prefectures' cession stays `cnh-400`'s and Gaoping `cnh-403`'s (told only in prose on
`cnh-409` and `cnh-410`); Xu Xuan's plea and the "two households" answer `cnh-406`'s (the Li Yu agent was told); the
yellow robe at Chenqiao `cnh-422`'s (mentioned on `cnh-402`, Guo Wei's own yellow flag left out); the Wuyue tribute of Yue
ware `cnh-408`'s. **Legend**: the arrows against the bore (Qian Weiyan's memoir), Li Yu's poisoning (the *Moji*), Feng
Dao's shamelessness (Ouyang Xiu) and Guo Wei at Confucius's grave (Macgowan) are each a text's. **Chinese names
corrected**: none needed; `越窑` kept though no page read prints the compound (the *Songshi* writes 越器); the word division
of 窑 compounds is open (`cnh-457` Jiànyáo against `cnh-955` Dìng yáo) — for the owner. **Spellings fixed**: none needed;
0 hits. **Myth register**: Feng Dao confirmed and corrected (Ouyang Xiu counts four surnames and ten rulers, the memoir
four surnames and the Khitan); Li Yu's poisoning confirmed and corrected (the *Moji* names the Prince of Qin as the
sender, not Taizong); the Chenqiao row unconfirmed (Giles only). **check-citations**: no mismatch. **Protected lines:
unchanged** (diffed after the apply). For the owner: `cnh-401`'s "age 50" (the *New History*: 52 sui; Cordier 56), its
day and Taiyuan on no page read; `cnh-403`'s three days on no page read; `cnh-407`'s 13 August on no page read (the
*Songshi*: the seventh month of Taiping Xingguo 3); `cnh-409`'s 882 on no page read (Giles 881; carried as "the usual
reckoning") and its 21 May. The timelines of `cnh-402`, `405`, `406` and `410` (states) were not set (set-timeline.js
takes event, era, battle and war cards only).

### B42 — `cnh-411`–`cnh-420`, Liao: the Liao dynasty to Emperor Tianzuo (2026-11-13)

Run as B41. Every cited URL answered. **Pictures were not touched**; none of the ten cards
has a picture. **The old cards cited the *Liaoshi*, the *Songshi*, Li Tao's *Changbian*, the *Qidan guozhi*
and the *Sanchao beimeng huibian* on Chinese Wikisource (up to four Chinese texts a card), put a battle template on
Gaoliang River ("Near Youzhou, modern Beijing"; "Decisive Liao victory"), dated the Alliance Conducted at Sea by a
regnal-year conversion ("First contact 1117"), the Liao southern bureau by a year no page prints (948) and the Later
Jin's restoration of the office by a conversion (944), and read the Liao dual offices as "Khitan north, Chinese south" —
the reading the *Liaoshi* itself warns against.** The *Liaoshi* (juan 2, 9, 27, 37, 47) was read on the Kanseki
Repository and zggdwx.com, Ouyang Xiu's *New History* juan 72 on zggdwx.com, the *Songshi* juan 281 and 472 on Kanseki.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-411` Liao dynasty | 7 | 7 → 7 | **`Dated 907 CE – 1125` / `Also dated 916 CE – 1125` (the *Liaoshi*'s 907 against the *Zizhi Tongjian*'s 916; Miao 2023 reads the 907 as a later rewriting); the name Liao given three ways with whose (916, 937, 947) and the Khitan name 983 – 1066; the five capitals (the *Liaoshi* juan 37), the population transfers and the steppe towns (Wright et al. 2025); the Qara Khitai**; the years and the Chanyuan payments (`cnh-417`'s) out of the questions. |
| `cnh-412` Khitan people | 7 | 7 → 7 | **The drum-and-banner chief and the feast (`cnh-413`'s clues) gone; the white-horse rider and the grey-ox cart told as the *Liaoshi*'s (juan 37); Para-Mongolic (Rizzi 2025); Cathay and Kitai (Yule and Cordier); first named in Northern Wei sources**; the Xiongnu ancestry and the consort clans (on no page read) dropped; no date line (no page prints a first attestation's year). |
| `cnh-413` Abaoji | 7 | 7 → 6 | **Three Wikisource texts cut to the *New History* juan 72; Liu Pujiang's 2023 study of the founding year: the *Liaoshi*'s 916 beside khan in 907 and Ouyang Xiu's 922; the feast at the salt lake, the drum and banner and Shulü's advice told as Ouyang Xiu's; Fuyu taken from Bohai and renamed Dongdan**; the birth omens and "war leader from 901" (a conversion) dropped. Protected: the line stays (flagged below). |
| `cnh-414` Bureau of Military Affairs | 6 | 6 → 6 | **"Northern bureau 947 / Southern bureau 948" now `Adopted 947 CE` (the *Liaoshi* juan 47 prints Datong 1 and "the next year"); the Tang eunuchs' office and the Later Jin's restoration; the "Khitan north, Chinese south" reading dropped (the *Liaoshi* juan 45 warns against it)**; 944 (a conversion) dropped. |
| `cnh-415` Khitan scripts | 7 | 7 → 6 | **`Large script 920 CE` / `Suppressed 1191`; the *Liaoshi* juan 2 (begun in the first month, decreed in the ninth of Shence 5); two Unicode proposals (West, Zaytsev and Everson; China's national body) and Róna-Tas; Diela's c. 924 – 925 as one proposal's figure only**; "twenty days" with the Uyghur envoys and the 1983 inscription's length (sources disagree) dropped. |
| `cnh-416` Battle of Gaoliang River | 5 | 5 → 5 | **The battle template off: `Fought 979 CE`; the *Liaoshi* juan 9: Yelü Xiuge and Yelü Xiezhen's flank charge, Han Derang on the walls, the Song ruler's escape in a donkey cart told as the *Liaoshi*'s; the river's place (Bretschneider)**; army sizes and the arrow wound (on no page read) dropped. |
| `cnh-417` Chanyuan Treaty | 6 | 8 → 6 | **Four Wikisource texts cut to the *Songshi* juan 281: Xiao Talin's death by a crossbow bolt, Kou Zhun's 300,000 limit told as the *Songshi*'s, Wang Qinruo's "oath beneath the walls"; Fu Bi and the 1042 increase**; Li Tao's three fingers, the "aunt" title, the January 1005 conversion and the "hundred years" of peace dropped. |
| `cnh-418` Pagoda of Fogong Temple | 7 | 7 → 7 | **Three MDPI papers and two Wikisource texts replaced: the Ming gazetteer of Yingzhou as the source of the 1056 date (Architectura Sinica), the two heights and whose (67.31 m, Shi et al. 2024; 65.84 m, the Chinese Academy of Cultural Heritage [in Chinese]), five storeys outside and nine floors within, the 1974 finds of the Khitan Canon and the tooth relic**; the 26 statues and the module (MDPI only) dropped. |
| `cnh-419` Alliance Conducted at Sea | 6 | 6 → 6 | **"First contact 1117" (a conversion) now `Envoys sent 1118` (Cordier) / `Terms agreed 1120`; four Wikisource texts cut to the *Songshi* juan 472: Ma Zhi renamed Zhao Liangsi, the Deng–Lai sea route, Aguda fixing the line at Gubeikou; the timeline moved to 1118 – 1120**; the horse-buying pretext, the wind-blown refugees and the 500,000 (on no page read) dropped. |
| `cnh-420` Emperor Tianzuo of Liao | 6 | 6 → 6 | **The *Liaoshi* juan 27 (Kanseki) with Gabelentz's 1877 German translation of the Manchu *Liaoshi* for the end: Yelü Yixin's corpse, the Huntong River feast where Aguda would not dance (1112), the capture by Wanyan Loushi, the Prince of Haibin; pinyin Liáo Tiānzuò Dì → Liáo Tiānzuòdì (joined as Liáng Wǔdì)**. Protected: the line stays (flagged below). |

Read by eye. **Confusability**: the drum and banner and the salt-lake feast are `cnh-413`'s (dropped from `cnh-412`); the
Huntong River dance is `cnh-420`'s (the Aguda agent will be told); the Chanyuan payments `cnh-417`'s and Cathay `cnh-412`'s
(both out of `cnh-411`); Yanjing and the six districts stay `cnh-400`'s (out of `cnh-419`). Two phrasings tripped
check-cards' scholar rule ("Han Derang", "Autumn Annals") and were reworded after the apply. **Legend**: the Khitan origin
legend (the *Liaoshi* juan 37), Abaoji's feast (Ouyang Xiu), the donkey cart (the *Liaoshi*), Kou Zhun's limit (the
*Songshi*) are each a text's, all compiled under the Yuan. **Chinese names corrected**: `cnh-420` pinyin (joined).
Kept unconfirmed for want of a page printing the compound: 辽朝 (the house form), 高梁河之战 (the *Liaoshi* writes 高梁之戰;
joined Gāoliánghé may be the house form), 海上之盟 (Theobald prints 海上盟約) — for the owner. **Spellings fixed**: none
needed; 0 hits. **Myth register**: no row touched; a candidate row, the Khitan origin legend (the *Liaoshi* juan 37).
**check-citations**: `cnh-413` and `cnh-414` report Liu Pujiang in Chinese order — fine. **Protected lines: unchanged**
(diffed after the apply). For the owner: `cnh-413`'s 872 on no page read (the *Liaoshi* gives Xiantong 13, not converted
here) and its 6 September on none; `cnh-420`'s 1128 and 1156 on no page read (the *Liaoshi*: died aged 54; Giles 1125;
Cordier 1126), and its days on none. The timelines of `cnh-411` (a dynasty) and `cnh-414`, `415`, `418` (not events) were
not set; `cnh-419`'s was moved to 1118 – 1120.

### B43 — `cnh-421`–`cnh-430`, Northern Song: the Song dynasty to Wang Anshi (2026-11-13)

Run as B41. Every cited URL answered. **Pictures were not touched.** **The old cards cited the *Songshi* (two or three juan a
card), Li Tao's *Changbian* and Ouyang Xiu's essays on Chinese Wikisource, dated Kaifeng by a year no page prints (361 BCE)
and an invented "Peak 1013", put a population count on its line, called 973 the first palace examination (Empress Wu held
one), dated the policy essay by a conversion (1070), and had the *Songshi*'s sources backwards (it neglected the richer
Southern Song record, Theobald after Wang Cengyu).** The *Songshi* (juan 1, 12, 85, 155, 290, 319, 327) and the *Changbian*
juan 2 were read on the Kanseki Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-421` Song dynasty | 8 | 8 → 8 | **The *Songshi* juan 1 for two Wikisource texts; its compilation told the right way round (begun on a Yuan order, finished in about two years, 496 juan, neglecting the southern records); the dynasty named after the Guide command; "commercial revolution" a phrase writers use today**; the years out of the questions. **Pinyin Sòngcháo → Sòng cháo.** |
| `cnh-422` Emperor Taizu of Song | 7 | 7 → 7 | **Three Wikisource texts cut to the *Songshi* juan 1; the yellow robe at Chenqiao told as the *Songshi*'s (Giles and Theobald doubt his surprise); the golden casket and the "candle shadow and axe" as later stories; the colleges and Confucius's portraits (Cordier after Mailla)**; 961 and 976 out of the phrasings, the jinshi re-examination (`cnh-427`'s ground) out. Protected: the line stays (flagged below). |
| `cnh-423` Shi Shouxin | 5 | 5 → 5 | **The banquet told as Li Tao's *Changbian* juan 2, with Li Tao's own note that it came from private notebooks (Sima Guang's, Wang Zeng's, Ding Wei's) and not the official record; the CBDB record for 928 and 984; Mailla for the Chenqiao message and the demotion after Gaoliang**; the monastery and his wealth (the *Songshi* only) dropped. Protected: the line stays (flagged below). |
| `cnh-424` Emperor Renzong of Song | 6 | 6 → 6 | **The *Songshi* juan 12's verdict and the roast mutton; Giles and the CBDB for the dates; Theobald for the regency and the wars; Judge Bao told as the ballad stories' against the historical Bao Zheng (Idema 2011)**; "childless Empress Liu", "consort Li" and "behind a curtain" (unsourced) dropped. |
| `cnh-425` Kaifeng | 7 | 7 → 8 | **"Founding 361 BCE" (on no page read), "Peak 1013 – 1127" (invented) and the population count off: `Song capital 960 CE – 1127` / `Great flood 1642` (Storozum et al. 2020); the *Songshi* juan 85's household figure in prose with whose; the Jewish stele; the walls without wards; the Jurchen Jin's moves (Cordier)**; the *Dongjing Meng Hua Lu* and the scroll (`cnh-435`, `443`) and the converted wall years 956, 1016, 1078 dropped. |
| `cnh-426` Qingli Reforms | 6 | 6 → 6 | **Three Wikisource texts cut to Zhang Xiqing's study [in Chinese] (the examination changes 1044, abolished within a year); Fan Zhongyan's ten proposals, the schools in every prefecture (Cordier), "On Factions" through its published translation, in prose only (`cnh-428`'s clue)**; "war with the Xia began in 1038" (the Xia's founding) dropped. **Pinyin Xīnzhèng → xīnzhèng.** |
| `cnh-427` palace examination | 6 | 6 → 6 | **"First held 973" (wrong: Empress Wu) now `Made regular 973 CE` (the *Songshi*'s 殿試遂爲常制) / `Abolished 1905`; the townsman scandal and the retest, the brief abolition, no one failed and the single essay; the 1070 policy essay (a conversion of Xining 3) given as "early in the Xining reign"**. |
| `cnh-428` Ouyang Xiu | 7 | 7 → 7 | **Four Wikisource texts cut to the *Songshi* juan 319 with Giles's 1884 translations of "Clubs" and "The Old Drunkard's Arbour"; the Jigu lu (Theobald); the 1057 examination (Rong Hengying [in French]); 1045 now in the background**. Protected: the line stays (flagged below). |
| `cnh-429` Di Qing | 6 | 6 → 7 | **Three Wikisource texts cut to the *Songshi* juan 290; the face mark kept, the bronze mask, Kunlun Pass against Nong Zhigao; the horned dog and the strange lights told as the *Songshi*'s**; Ouyang Xiu's memorial (unreachable) and "dismissed 1056" (a conversion) dropped. Protected: the line stays (flagged below). |
| `cnh-430` Wang Anshi | 7 | 7 → 7 | **Three Wikisource texts cut to the *Songshi* juan 327; the memorial "on the spirit, not the letter", the Obstinate Minister, the last years at Jiangning; the villain verdict as the *Songshi*'s (citing Zhu Xi), Fuller 2023 on the partisan record; Jia Bingwei [in French] dates the memorial 1059**; "from 1070 the emperor's own test was an essay" (unsourced) dropped. Protected: the line stays (flagged below). |

Read by eye. **Confusability**: the yellow robe `cnh-422`'s and the banquet `cnh-423`'s (both mentioned on `cnh-421`); the
palace re-examination `cnh-427`'s (out of `cnh-422`); "On Factions" `cnh-428`'s in a phrasing-free form (prose only on
`cnh-426`, at its agent's word); the New Policies themselves left to `cnh-431`; the memoir and the scroll out of `cnh-425`.
**Legend**: the yellow robe (the *Songshi*), the cup of wine (Northern Song notebooks, Li Tao's note), Judge Bao (the
ballads), the horned dog (the *Songshi*), Wang Anshi's villainy (the *Songshi*'s verdict) are each a text's. **Chinese
names corrected**: `cnh-421` and `cnh-426` pinyin; `cnh-428`'s 歐陽脩 kept (the *Songshi* writes both 修 and 脩). **Spellings
fixed**: none needed; 0 hits. **Myth register**: the yellow robe confirmed (the *Songshi* juan 1); the cup of wine confirmed
and corrected (Li Tao names the notebooks; the modern doubt on no page read); Bao Zheng confirmed; Wang Anshi and Sima
Guang confirmed for the *Songshi*'s verdict. **check-citations**: `cnh-428` reports Rong Hengying in Chinese order — fine.
**Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-422`'s days on no page read and its "age 49"
(the *Songshi* juan 3: 50 sui); `cnh-423`'s 961 on no page read ("usually given"); `cnh-424`'s days on no page read;
`cnh-428`'s 1045 dates no page's demotion (Theobald's 1045 is the Jigu lu's start), its days and Mian Prefecture on none
(Giles: Luling); `cnh-429`'s 1008 and 1053 on no page read (Giles puts the rising's end in 1052); `cnh-430`'s 1058 (Jia:
1059), its days on none and "age 64" (the *Songshi*: 68 sui, itself at odds with 1021 – 1086).

### B44 — `cnh-431`–`cnh-440`, Northern Song: the New Policies to the Kaibao Canon (2026-11-13)

Run as B41. Every cited URL answered. **Pictures were not touched.** **The old cards cited the *Songshi* (two juan a card),
Sima Guang's memorial, Shenzong's preface, the *Mengxi bitan*, Wang Zhen's *Nongshu*, the *Goryeosa* and the *Gujin tushu
jicheng* on Chinese Wikisource, rested the New Policies on two dead Columbia PDFs, dated the New Policies' introduction by
Wang Anshi's fall (1076), the Zizhi Tongjian by the span it covers, Xuzhou by a year on no page (573 BCE), and the
watertight compartment by Xu Jing's voyage, whose book describes no such compartments; Bi Sheng was dated "in the 1040s".**
The *Songshi* (juan 85, 181, 327, 336, 472), the Siku front matter of the *Zizhi Tongjian* and of the *Dongjing Meng Hua Lu*,
the *Mengxi bitan* juan 18 and the *Fozu tongji* juan 43 were read on the Kanseki Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-431` New Policies | 6 | 7 → 6 | **"Introduced 1069 – 1076" now `Introduced 1069` (Kojima 2016; 1076 was Wang Anshi's fall) / `Repealed 1085 – 1086` (Theobald's two pages differ, said so); the *Songshi* juan 327 for the Finance Planning Commission, the crop loans, the militia and the Annam proclamation; Shang and Huang 2018**; the dead Columbia PDFs and Cheng Hao's memorial (a third ancient text) dropped. |
| `cnh-432` Sima Guang | 6 | 6 → 6 | **The *Songshi* juan 336; the jar told as the *Songshi*'s (Giles); "a mother changing her son's laws"; the Liao and Xia envoys; "Zuo zhuan" → *Zuo Zhuan***; the Chang'an stonemason (`cnh-434`'s ground) dropped. Protected: the line stays (flagged below). |
| `cnh-433` Zizhi Tongjian | 7 | 7 → 6 | **"Covers 403 BCE – 959 CE" (not the work's own date) off: `Commissioned 1066` / `Named 1067` / `Completed 1084` / `First printed 1086`; the Siku front matter (the presenting memorial, the editors' summary) for three Wikisource texts; Strange and de Crespigny; the Kaoyi, the two rooms of draft, Luoyang**; Shenzong's "mirror" preface (on no page reached) dropped. |
| `cnh-434` Cai Jing | 6 | 6 → 6 | **The *Songshi* juan 472; the five days to restore conscripted labour (Strange), the Yuanyou stele he wrote out himself, the fourth term half-blind, the six villains; the four masters told as Zhang Chou's claim (Theobald)**; the Chang'an stonemason (juan 336) dropped. Protected: the line stays (flagged below). |
| `cnh-435` Dongjing Meng Hua Lu | 5 | 6 → 5 | **The line now `Preface 1147` only ("Describes 1103 – 1127" on no page read; the preface says Chongning guiwei); the Siku text of the preface for the Wikisource copies; Strassberg 1994 (open); the dream of Huaxu in the title, the Qing editors' praise**; the juan 2 details (the wine houses, the theatres) dropped with the second Chinese source. |
| `cnh-436` jiaozi | 6 | 6 → 6 | **The *Songshi* juan 181 on Kanseki; von Glahn's chapter (the OUP host refuses) replaced by Horesh 2012 (open, CC BY); the sixteen houses, the capped issues, the qianyin; the line backed by Theobald and Vissering**; "from 1068" and "the 1070s" (conversions) dropped. |
| `cnh-437` Xuzhou | 6 | 7 → 6 | **"Founding 573 BCE, first recorded as Pengcheng" off: `Royal capital 206 BCE` (Chavannes's *Shiji* [in French]) / `Iron memorial 1078` / `Coal found 1079` (Wagner's translations of Su Shi's memorial and poem); the 36 Liguo ironworks of "several hundred" men each (not "more than a hundred"); the First Emperor's tripod divers**; Wu Juhou's 1083 report (a second Chinese text and a conversion) and the 114,000 tonnes dropped. |
| `cnh-438` watertight compartment | 7 | 7 → 8 | **All three phrasings new (Polo's thirteen compartments and the Quanzhou bulkheads are `cnh-819`'s clues): Franklin's 1785 letter, the bulkheads doing the work of ribs and keel, the Ramusio-only passage; `Wrecked c. 1277` / `Described 1298`; Nanhai I; Zhu Yu**; Xu Jing dropped (his book describes three holds, not watertight compartments). |
| `cnh-439` Bi Sheng | 7 | 7 → 7 | **The *Mengxi bitan* juan 18 (the Sibu congkan text on Kanseki); Wang Zhen's 1314 review through Carter; the Qingli reign 1041 – 1048 (Theobald) carries the line's years; "in the 1040s" and "250 years later" (computed) dropped**; the Yingshan gravestone claim (no open page) left out. Protected: the line stays (flagged below). |
| `cnh-440` Kaibao Canon | 5 | 5 → 5 | **Three Wikisource texts cut to Zhipan's *Fozu tongji* juan 43: Zhang Congxin sent to Yizhou, the blocks presented, Chōnen's request; Jiang Wu's 2019 abstract for 971 and the Jingzhong hypothesis; `Completed 983 CE` given its era**; 991 and 984 (no reachable source) dropped. |

Read by eye. **Confusability**: the jar `cnh-432`'s; the Yuanyou stele `cnh-434`'s (the stonemason dropped from both); the
Kaifeng memoir's details (the wine houses, the theatres) are out of `cnh-435` and the streets out of `cnh-425`; the
crop loans and militia `cnh-431`'s, Wang Anshi's memorial `cnh-430`'s; the woodblock classics `cnh-409`'s and clay type
`cnh-439`'s; `cnh-438` gave up two clues to `cnh-819` (a later deck, read and not edited). `cnh-437`'s `Q.sibling` against
`cnh-083` is the word "tripod" only — a different subject. **Legend**: the jar (the *Songshi*), the four masters (Zhang
Chou), the dream of Huaxu (the title's allusion) are each a text's. **Chinese names corrected**: none needed. **Spellings
fixed**: `cnh-432`'s "Zuo zhuan". **Myth register**: Wang Anshi and Sima Guang confirmed again (the *Songshi* juan 327 quotes
Zhu Xi); Marco Polo: the compartment passage is Ramusio's alone (Yule 1871) — added to the row. **check-citations**: no
mismatch. **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-432`'s 17 November 1019, Guangshan and
"11 October 1086 (age 66)" (the *Songshi* and Cordier: the ninth month, 68 sui), and "Chief minister 1086" (Yuanyou 1 on the
page); `cnh-434`'s 1047 (Theobald 1047, Giles 1046); `cnh-439`'s 1051 rests on modern summaries only. `cnh-440`'s timeline (a
text) was not set.

### B45 — `cnh-441`–`cnh-450`, Northern and Southern Song: Su Shi to Yue Fei (2026-11-13)

Run as B41. Every cited URL answered. **Pictures were not touched.** **The old cards cited the *Songshi* (two juan a card),
the *Xuanhe huapu*, the *Jinshi* and Su Shi's and Li Qingzhao's own texts on Chinese Wikisource, named a place in the
Jingkang line ("Kaifeng fell"), put a battle template on Huangtiandang, dated the Su causeway 1089 (on no page read), and converted Chinese months into Western ones; Yue Fei's
background stopped at "the end of 1141" against his line's 1142.** The *Songshi* (juan 22, 23, 24, 338, 364, 365) and Deng
Chun's *Huaji* juan 10 were read on the Kanseki Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-441` Su Shi | 7 | 7 → 8 | **The *Songshi* juan 338 for the Wikisource texts and Giles's *History*; Yang's open-access Brill book; the poetry case and the Huangzhou farmland, the two Red Cliff rhapsodies dated 1082 and told as literature, Huizhou, Hainan and Changzhou; 1037, 1080 and 1086 now in the background**; Su's own doubt about the site (on no page read) left out. Protected: the line stays (flagged below). |
| `cnh-442` Li Qingzhao | 7 | 7 → 7 | **The afterword's closing date 1132 with Egan's note that other copies and Hong Mai give 1134; the tea contests over book, page and line; the 1132 remarriage and lawsuit; "man" in the tune's name a long song, not a slow one (Egan)**; the Qingzhou burning and Zhao Mingcheng's age (on no page read) dropped. Protected: the line stays. |
| `cnh-443` Along the River During the Qingming Festival | 7 | 7 → 7 | **The size and medium from the Palace Museum's record (24.8 × 528 cm, ink and light colour on silk); Zhang Zhu's colophon of 1186 (Hansen, read from an OCR of her PDF); the arched bridge and the snapped tow-line; the Qing court version of 1736**; "1186" and "1954" out of the questions, "the winter of 1126 to 1127" made 1126 (Hansen). |
| `cnh-444` Guo Xi | 6 | 6 → 7 | **The wiping-cloth story told as Deng Chun's (*Huaji* juan 10); the three distances and the moonlit bamboo (the Linquan gaozhi through its translators); Early Spring and Painter-in-Attendance; "1072" out of the questions**; "wander and live in" (no reachable source) dropped. Protected: the line stays (flagged below). |
| `cnh-445` Emperor Huizong of Song | 7 | 7 → 7 | **The *Songshi* juan 22 and McNair's open catalogue of the Xuanhe huapu (dated 1120; 231 painters, 6,396 paintings); the thin-gold script, the "too frivolous" verdict of his brother's chief councillor, the Daoist hospitals and paupers' cemeteries, Wuguocheng; the *Songshi*'s verdict told as its own**; the converted months dropped. Protected: the line stays (flagged below). |
| `cnh-446` Jingkang incident | 6 | 6 → 6 | **"Kaifeng fell" off: `Sieges 1126` / `Captives taken 1127`; the *Songshi* juan 23's list of what was carted north (vessels, the armillary sphere, the libraries, the maps); the sorcerer's sortie and the Chu puppet; Wyatt on the omen stories written after the fall**; the month conversions dropped. |
| `cnh-447` Battle of Huangtiandang | 5 | 5 → 5 | **The battle template off: `Fought 1130`; the *Songshi* juan 364: Lady Liang's drum, the 48 days and the nominal 100,000 told as its own; Han Shizhong's demand for the two emperors; the channel cut overnight and the fire arrows into becalmed sails**; claims resting only on the *Jinshi* dropped; "Wuzhu" kept out of the prose (it would link to `cnh-249`'s coin). |
| `cnh-448` Emperor Gaozong of Song | 6 | 6 → 6 | **The *Songshi* juan 24; the edict hidden in a messenger's hair, the ten days as a hostage, the adoption of Taizu's descendant and the abdication; Tao's Cambridge History abstract and a Cleveland Museum record**; the year-carrying phrasings and the calligrapher claim (no source found) dropped. Protected: the line stays (flagged below). |
| `cnh-449` West Lake | 7 | 7 → 8 | **"Causeway built 1089" (on no page read) off: `Court settled 1138` (Giles) / `World Heritage 2011`; the Su causeway, Marco Polo's islands and barges, Li Mi's six wells; Bai et al. 2026 and two Cleveland Museum records**; Zhou Mi's "pot that melts gold" and the "eyebrows and eyes" line (unsourced) dropped. |
| `cnh-450` Yue Fei | 7 | 7 → 8 | **The register's way: the four characters shown to his judge He Zhu, the twelve gold plaques, Qin Hui's "need not have grounds", all from the *Songshi* juan 365; his mother's tattooing a later tale and the kneeling figures (Henning 2007); Zong Ze's judgement; 1103, 1140 and 1142 now in the background; "Zuo zhuan" → *Zuo Zhuan***. Protected: the line stays (flagged below). |

Read by eye. **Confusability**: the Su causeway is `cnh-449`'s (out of `cnh-441`); Huizong's catalogue `cnh-445`'s and the
captivity's list `cnh-446`'s; Gaozong's hostage days `cnh-448`'s; the gold plaques and the tattoo `cnh-450`'s, Qin Hui's
spittoon and the "south for southerners" slogan `cnh-451`'s; Di Qing's face mark (`cnh-429`) and Yue Fei's back are kept apart.
One phrasing on `cnh-447` was reworded before the apply to clear check-cards' scholar rule ("Han Shizhong held"); a
helper, `attrib.js`, now runs that pattern over every draft. **Legend**: the rhapsodies (literature), the cloth story (Deng
Chun), Lady Liang's drum (the *Songshi*), the tattoo and the plaques (the *Songshi*), the mother's tattooing (later) are each a
text's. **Chinese names corrected**: none needed; 靖康之变 and 黄天荡之战 kept, no page read printing the compound — for the
owner. **Spellings fixed**: `cnh-450`'s "Zuo zhuan". **Myth register**: Yue Fei confirmed (the *Songshi* juan 365; the
mother's tattooing later; the kneeling figures in Henning, their Ming date unconfirmed); the Jingkang captivity confirmed
(the *Songshi* juan 23); Li Qingzhao's postface confirmed and corrected (1132 in the received text, 1134 in Hong Mai; absent
from the earliest editions, Moser); Su Shi's rhapsodies confirmed for 1082, his doubt of the site unconfirmed.
**check-citations**: no mismatch. **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-441`'s
"Huangzhou exile 1080 – 1086" (Yang: 1080 – 1084; 1086 is the recall) and its 24 August (the *Songshi*: Jianzhong Jingguo 1,
66 sui); `cnh-444`'s death c. 1090 is one of three figures (Taipei: after 1087; Theobald c. 1087); `cnh-445`'s days and "age
52" (the *Songshi*: 54); `cnh-448`'s days and "age 80" (the *Songshi*: 81); `cnh-450`'s "age 38" (the *Songshi*: 39) and Giles's
1103 – 1141.

### B46 — `cnh-451`–`cnh-460`, Southern Song: Qin Hui to Neo-Confucianism (2026-11-13)

Run as B41. Every cited URL answered. **Pictures were not touched.** **The old cards cited the *Songshi*, the *Jinshi*, the
*Chalu*, the *Daguan chalun* and Song notes on Chinese Wikisource, put a battle template on Caishi ("26 – 27 November 1161", a
day no page read prints), dated the huizi "made permanent 1247" and Quanzhou "founded 718" (both on no page read), put a
count and a century on Quanzhou's line, named two men in Jian ware's labels ("Cai Xiang", "Huizong"), gave Neo-Confucianism
the Chinese name 道学 and its glossary a date no row shared, and misread the huizi issue (229 million for 329).** The *Songshi*
(juan 181, 383, 429, 473), the *Jinshi* juan 77, the *Chalu* and Tao Zongyi's *Chuogeng lu* were read on the Kanseki
Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-451` Qin Hui | 6 | 7 → 6 | **The *Songshi* juan 473; carried north after protesting the puppet ruler and back with his household; "southerners south, northerners north" placed in his first, brief ministry; the titles lost and the spittoon (Giles); 1138 carried as Theobald's "a year later" than 1137**; Macgowan (the return in 1131, the payment in gold) and 1206 dropped; the kneeling statues on no page read (flagged). Protected: the line stays (flagged below). |
| `cnh-452` Treaty of Shaoxing | 6 | 6 → 6 | **The *Jinshi* juan 77 (the oath in full) for the Wikisource texts; "your subject Gou", the line in the middle of the Huai, Tang and Deng handed over, the coffin and Lady Wei (not "Empress Wei") returned; the 250,000 taels and 250,000 bolts given as the oath's own figures**; a month conversion and the Dasan Pass (on no page read) dropped; no tribute figure in the questions (clear of `cnh-417`). |
| `cnh-453` Battle of Caishi | 6 | 6 → 6 | **The battle template and its days off: `Fought 1161`; the *Songshi* juan 383: Yu Yunwen sent to reward the troops, Hailing's two horses and his platform, his murder by his officers; the 600,000 Macgowan's figure; the paddle-wheel boats placed at Jinshan**; the thunderclap bombs (on no page read) dropped. |
| `cnh-454` huizi | 5 | 6 → 5 | **"Made permanent 1247" (on no page read) off: `First issued 1160` / `Small notes 1163`; Qian Duanli and the cash stores; terms stretched from three years to nine; the paper from Huizhou and Chizhou; "229 million" corrected to 329 million (the *Songshi*, Theobald)**. |
| `cnh-455` Quanzhou | 6 | 6 → 6 | **"Founding 718", the peak and the population count off: `Prefecture seat 700 CE` / `Named 711 CE` / `World Heritage 2021`; Zaitun and the olive tree, Marco Polo's pepper, Ibn Battuta's junks and the Muslims' own town**; 1087 and Pu Shougeng (no open source) dropped; the 2021 listing rests on one book (UNESCO refuses). |
| `cnh-456` Guan ware | 6 | 6 → 6 | **The labels no longer name places (`First kiln 1111 – 1117` / `Southern kilns c. 1127 – 1279`); the Kaifeng dating told as Ye Zhi's report through the *Chuogeng lu*; Zhu Yan's ranking as printed; the Laohudong and Jiaotanxia kilns (npj Heritage Science 2026)**; "the Kaifeng kiln undiscovered" (no source) dropped. |
| `cnh-457` Jian ware | 7 | 6 → 7 | **"Cai Xiang c. 1049 – 1054" / "Huizong c. 1107 – 1110" (men in labels) now `Made c. 960 CE – 1279` (Dejoie et al.); the *Chalu* on Kanseki; Huizong's two points from a Cleveland record; the three yohen tenmoku as Japan's national treasures (Degawa [in Japanese])**; the glossary's markers renumbered into its own list. |
| `cnh-458` Mengliang lu | 5 | 5 → 5 | **"Preface dated 1274, conventionally" now `Dated 1274` (Cordier's 1903 note) / `Also dated c. 1300` (Strassberg); the Qing editors' puzzle over the cyclical year; built on the Kaifeng memoir's plan**; "a million households" and "17 entertainment quarters" (on no page read) and 1334 dropped. |
| `cnh-459` Zhu Xi | 7 | 7 → 7 | **Two Wikisource histories cut to the *Songshi* juan 429: the trigrams in the sand, the White Deer Grotto rules, nine years in the provinces and forty days at court; the 1313 decree left to `cnh-491` and the ban to `cnh-460`; the floating coffin as Giles's tale**. Protected: the line stays (flagged below). |
| `cnh-460` Neo-Confucianism | 7 | 7 → 7 | **The name 道学 dàoxué → 理学 lǐxué (Theobald prints it); a first row `Masters lived 1017 – 1200` so the card sorts by the school's start and the glossary's date agrees (`G.date` cleared); "Neo-Confucianism" a modern label, the *Songshi*'s "Learning of the Way" admitted unknown in antiquity; De Weerdt 2020 for 1196, the fifty-nine names and 1202; the 1241 tablets**; four Wikisource texts cut to one. |

Read by eye. **Confusability**: the oath's tribute stays in `cnh-452`'s prose, not its questions (clear of `cnh-417`'s figures);
the 1161 sea battle `cnh-461`'s and the river battle `cnh-453`'s; the Kaifeng memoir `cnh-435`'s and the Hangzhou one `cnh-458`'s;
Zhu Xi's academy `cnh-459`'s, the ban and the enshrinement `cnh-460`'s, the 1313 decree `cnh-491`'s. `cnh-451`'s `Q.sibling`
against `cnh-280` and its `Z.reading?` (Qín Huì, a polyphone the house reads Huì) are false alarms. One phrasing on `cnh-453`
was reworded by hand (it read "led the Battle of Caishi"); one on `cnh-455` ("Ibn Battuta counted") was reworded for the
scholar rule. **Legend**: the spittoon (Giles), the oath (the *Jinshi*'s text), Yu Yunwen (the *Songshi*), the floating coffin
(Giles) are each a text's. **Chinese names corrected**: `cnh-460` 道学 → 理学 (lǐxué); 采石之战 kept, no page read printing the
compound. **Spellings fixed**: none needed; 0 hits. **Myth register**: the kneeling statue of Qin Hui unattested on `cnh-451`'s
pages (Henning attests it on `cnh-450`'s). **check-citations**: no mismatch. **Protected lines: unchanged** (diffed after the
apply). For the owner: `cnh-451`'s 1091 (Giles and Tao: 1090), its days and "age 64" (the *Songshi*: 66 sui); `cnh-459`'s days
on no page read and "age 69" (the *Songshi*: 71 sui).

### B47 — `cnh-461`–`cnh-470`, Southern Song and Western Xia: the Battle of Tangdao to Haoshuichuan (2026-11-13)

Run as B41. Every cited URL answered. **Pictures were not touched.** **The old cards put battle templates on Tangdao,
Xiangyang, Yamen and Haoshuichuan (days on no page read; "Casualties: 10,000 Jin losses, 300 warships"; "At least 100,000 Song
dead"), named places in the fire lance's labels ("At De'an", "At Kaifeng", "At Guide") and the Tangut script's ("Juyong arch"),
gave the Tangut people the Western Xia's dates, cited three Chinese histories a card on Chinese Wikisource, wrote "Khubilai" and
"Uighur" in their own voice, and told Marco Polo's claim to have built the Xiangyang engines without the reply.** The *Songshi*
(juan 370, 485, 486), the *Jinshi* juan 116, the *Yuanshi* juan 203, the *Old Book of Tang* juan 198 and the Tangut canon's
Chinese records were read on the Kanseki Repository and zggdwx.com.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-461` Battle of Tangdao | 5 | 5 → 5 | **The battle template off: `Fought 1161`; the *Songshi* juan 370: Li Bao behind Shijiu island, the Jin boatmen sending the soldiers below deck, the oiled-silk sails ablaze, Haizhou relieved first; Lo's book (its contents page)**; three Wikisource texts dropped. |
| `cnh-462` Fire lance | 6 | 6 → 6 | **"At De'an 1132 / At Kaifeng 1232 / At Guide 1233" (places in labels) now `First recorded 1132` / `Used by the Jin 1232 – 1233`; De'an given two ways (the *Songshi*: the lances burned the towers; the siege account as Andrade reads it: they drove off the men); the *Jinshi* juan 116: the night raid by boat at Guide, the flying lance and the heaven-shaking thunder at Kaifeng**; the Dunhuang banner (the Guimet record names no fire lance) dropped. |
| `cnh-463` Battle of Xiangyang | 6 | 7 → 6 | **The battle template and its converted days off: `Besieged 1268 – 1273`; the *Yuanshi* juan 203: the Il-khan's two engineers, Lü Wenhuan's surrender; the supply boats through the blockade; Marco Polo's claim answered by Yule (the Polos could not have arrived before late 1274); the 70,000 Macgowan's; "Khubilai" → Kublai**; the 5,000 boats, the chains and the fire lances (other texts only) dropped. |
| `cnh-464` Battle of Yamen | 6 | 6 → 6 | **The template, 19 March and the casualties row off: `Fought 1279`; the 100,000 bodies the *Songshi*'s count of the drowned seven days after, not a casualty figure; Lu Xiufu and the boy emperor; the chained fleet and the seawater; Wen Tianxiang's poem**; the music signal (the *Yuanshi* only) dropped. |
| `cnh-465` Western Xia | 7 | 7 → 7 | **The *Songshi* juan 486 for the Wikisource texts; the Great State White and High and the Chinese name from its place west of the Song; the *Songshi*'s verdict that it never truly submitted; Renxiao's university and examinations; Li Yuanhao's and the conquest's detail left to `cnh-467` and `cnh-472`**. **Pinyin Xīxià → Xī Xià.** |
| `cnh-466` Tangut people | 7 | 7 → 6 | **"Western Xia 1038 – 1227" (another card's dates on a people) off: no line, as `cnh-412`; the *Old Book of Tang* juan 198: Dangxiang herders of yaks, no grain, burning their dead, the Tuoba chiefs moved inland; Minyak in their own contracts; the language near Lolo and Moso**. |
| `cnh-467` Li Yuanhao | 6 | 7 → 6 | **Three Wikisource texts cut to the *Songshi* juan 485; Shi Jinbo (Brill, open access): Ganzhou 1028, the Weiming surname, the head-shaving edict, the three battles, the 255,000 a year of 1044, the scorched-earth defeat of the Liao; his death by his heir (Cordier) against his brother-in-law (Theobald)**; the nose story dropped. Protected: the line stays (flagged below). |
| `cnh-468` Tangut script | 7 | 7 → 8 | **"Created 1036 / Juyong arch 1345" now `Dated 1036` / `Also dated 1037` / `Late inscription 1345`; Yeli Renrong's twelve books (the *Songshi*); the Juyong carvings once read as Jurchen; Gule's Pearl in the Palm; the 6,000 signs as Nevsky's working dictionary (the Institute of Oriental Manuscripts)**. **Pinyin Xīxiàwén → Xī Xià wén.** |
| `cnh-469` Tangut Tripitaka | 7 | 6 → 7 | **"Song gift 1034 / Yuan printing 1294" now `Translated 1038 – 1090` / `Printed 1293 – 1302` (Theobald's canon page); the Song gift (1034) in prose as Theobald's; the Uyghur monks at the temple, the Hangzhou carving and the thirty sets, the gold Lotus Sutra; "Uighur" → Uyghur**; Laufer's 1294 dropped. **Pinyin → Xī Xià wén Dàzàngjīng.** |
| `cnh-470` Battle of Haoshuichuan | 6 | 6 → 6 | **The battle template off: `Fought 1041`; the pigeons from the sealed boxes and the 10,300 dead told as the *Songshi*'s (Shi Jinbo: "tens of thousands"); Renzong's late meals, Han Qi's haste**; the figures from a second juan dropped. |

Read by eye. **Confusability**: the Il-khan's engines and Lü Wenhuan's surrender are `cnh-463`'s, Lu Xiufu `cnh-464`'s (the
Kublai and Bayan agent was told); Polo's engines `cnh-463`'s, his West Lake `cnh-449`'s, his Zaitun `cnh-455`'s, the Ramusio
passage `cnh-438`'s (the Polo agent was told); the 1161 river and sea battles apart (`cnh-453`, `cnh-461`); the Tangut script's
books `cnh-468`'s and the translations `cnh-469`'s; Li Yuanhao's script order only in prose. **Legend**: the pigeons (the
*Songshi*), Polo's engines (his book, answered by Yule), the 100,000 drowned (the *Songshi*'s count) are each a text's.
**Chinese names corrected**: `cnh-465`, `468`, `469` pinyin (Xī Xià split, as Běi Wèi). Kept unconfirmed for want of a page
printing the compound: 唐岛之战 (Cordier's Chenjia Island: 陈家岛海战 is also used), 襄阳之战, 崖山之战, 好水川之战 — for the owner.
**Spellings fixed**: "Khubilai" (`cnh-463`), "Uighur" (`cnh-469`). **Myth register**: Marco Polo confirmed for the Xiangyang
claim (Yule); the Mongol conquests' figures confirmed as the histories' and Macgowan's. **check-citations**: no mismatch.
**Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-467`'s 1003 on no page read, "10 November 1038
(age 35)" (the *Songshi*: age 30; the memorial: the 11th day of the 10th month) and "19 January 1048 (age 44)" (the *Songshi*
and Cordier: 46).

### B48 — `cnh-471`–`cnh-480`, Western Xia and Jurchen Jin: Khara-Khoto to Emperor Shizong (2026-11-13)

Run as B41. Every cited URL answered. **Pictures were not touched.** **The old cards dated Khara-Khoto by the Western Xia's
founding (1032) and a "peak under Kublai Khan" (not a date), gave the Jurchen people the Jin's and Aguda's dates, named a place
in the Jin's line ("Took Kaifeng"), put a battle template on Hubudagang ("1115, 12th lunar month") and Yehuling ("August –
October 1211", a conversion), dated Caizhou's fall to a day on no page read, dated the meng'an mouke's reform by a conversion
(1175, and Shizong's clue), and cited the *Jinshi*, the *Songshi* and the *Sanchao beimeng huibian* on Chinese Wikisource.**
The *Jinshi* (juan 1, 2, 73, 77) and the *Yuanshi*'s and *Songshi*'s Xia chapters were read on the Kanseki Repository and
zggdwx.com.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-471` Khara-Khoto | 6 | 6 → 6 | **"Founding 1032" (the Xia's year, in Stein) and "Peak: Yuan era" off: `Taken 1226` / `Last dated text 1366` / `Excavated 1908 – 1914`; Kozlov's library at the Institute of Oriental Manuscripts (Zorin); Nishida; the Wikisource and IDP pages replaced**; "1286" (a conversion) dropped. **Pinyin Hēishuǐ chéng → Hēishuǐchéng.** |
| `cnh-472` Mongol conquest of Western Xia | 6 | 6 → 6 | **The *Songshi*/*Jinshi* Wikisource claims dropped; `Fought 1205 – 1227` / `Capital besieged 1209` / `Last campaign 1226 – 1227`; Rashid al-Din's 300,000 given as his figure and called an exaggeration (Howorth); Li Xian's killing as "other accounts"**. **Pinyin Ménggǔ → Měnggǔ** (蒙古 is third tone; corrected after the apply). |
| `cnh-473` Jurchen Jin | 7 | 7 → 7 | **"Took Kaifeng" off: `Dated 1115 – 1234` / `Also dated 1117 – 1234` (the *Jinshi*'s year against Qiu Jingjia 2023, from a 1117 letter to Goryeo); the gold-not-iron naming as the *Jinshi*'s story against the Song version; the capitals Huining, Yanjing and Kaifeng; Hsu 2024 on the Jin tombs, Artemieva 2019**; Parker, Macgowan and Giles and a phrasing reusing `cnh-453`'s Hailing crossing dropped. |
| `cnh-474` Jurchen people | 7 | 7 → 7 | **The line (another card's dates on a people) off: no line, as `cnh-412` (the draft's derived "c. 907 – 960 CE" removed by hand); "cooked" and "raw" on the Khitan registers, the Black Water Mohe, Hanpu's blood price in horses, cattle and gold (the *Jinshi*; Cordier's Mailla: silver), the falcon road, the Jianzhou branch and the Manchus**; everything resting on the unreadable *Sanchao beimeng huibian* dropped. |
| `cnh-475` Wanyan Aguda | 6 | 7 → 6 | **The *Jinshi* juan 2 for two Wikisource texts; Ningjiang with 2,500 men and the freed slaves, the three birds with three arrows and the tablet, the three burials ending at Dafangshan (Sobolev and Soboleva [in Russian]); the fishing-feast dance kept out (`cnh-420`'s)**; Macgowan dropped. Protected: the line stays (flagged below). |
| `cnh-476` Battle of Hubudagang | 5 | 5 → 6 | **The template off: `Fought 1115`; the *Jinshi* (zggdwx) and Gabelentz's German translation of the *Liaoshi*: the captured supply officer, Yelü Zhangnu's plot, the strike at the centre; each army size given to its own text**. |
| `cnh-477` Da Qi | 6 | 5 → 6 | **The *Jinshi* juan 77 for two Wikisource histories; Huang Chunyan 2020; Liu Yu's surrender of Jinan, his ancestors' tablets at Kaifeng, Liu Lin seized; the 300,000 Cordier's figure; Liu Yu's death 1143 (Giles) against 1146 (Cordier, Huang)**; "1136" and the *Songshi*-only claims dropped; the glossary alias "Qi (Liu Yu)" dropped (it caught plain "Qi"). |
| `cnh-478` Meng'an mouke | 5 | 5 → 5 | **"Reformed 1175" (a conversion, and Shizong's clue) off: `Introduced 1114` / `Ended 1234`; every able man serving with his own weapons and food; the Shaiga silver tablet (Usuki [in Japanese]); the shrunken companies of twenty-five**; the intermarriage claim (a misreading of the *Jinshi*) dropped. |
| `cnh-479` Jurchen script | 6 | 6 → 6 | **The *Jinshi* juan 73; three Unicode proposals (West 2023, Zaytsev and West 2025, China's national body 2020); "a Ming dictionary of 1407" corrected (1407 is the Bureau of Translators' founding; its glossaries carry no date); "encoded in Unicode" (only proposed) dropped**. |
| `cnh-480` Emperor Shizong of Jin | 5 | 5 → 5 | **The Jurchen songs in a palace hall; proclaimed while Hailing attacked the south, the Song as nephew; Huining restored as the Upper Capital; the Jurchen examination 1173 (1164 began the translations and schools)**; "Little Yao and Shun" (no citable source) dropped. Protected: the line stays (flagged below). |

Read by eye. **Confusability**: the Huntong River dance is `cnh-420`'s (out of `cnh-475`); Hubudagang's clues `cnh-476`'s; the
script's maker `cnh-479`'s, the Jurchen songs `cnh-480`'s and the shrunken companies `cnh-478`'s; Kozlov's library `cnh-471`'s
(out of `cnh-468`). **Legend**: the gold-not-iron naming (the *Jinshi*), Hanpu's blood price (the *Jinshi*), Rashid al-Din's
300,000 (his figure) are each a text's. **Chinese names corrected**: `cnh-471` (joined), `cnh-472` (Měnggǔ). Kept unconfirmed:
蒙古灭西夏 and 护步答冈之战 — for the owner. **For the owner**: the glossary alias "Liu Yu" belongs to `Emperor_Wu_of_Song`, so
"Liu Yu" on `cnh-477` (劉豫, another man) links to the Liu Song founder. **Spellings fixed**: none needed; 0 hits. **Myth
register**: the Mongol conquests' figures confirmed (Rashid al-Din's 300,000, Howorth's doubt). **check-citations**: `cnh-473`,
`474` and `477` report Qiu Jingjia and Huang Chunyan in Chinese order — fine. **Protected lines: unchanged** (diffed after the
apply). For the owner: `cnh-475`'s 1068 and days on no page read (the *Jinshi*: Xianyong 4, 7th month, 1st day); `cnh-480`'s
1123 and days on no page read (Cordier: aged 67 sui in 1189, which fits).

### B49 — `cnh-481`–`cnh-490`, Jurchen Jin and Yuan: the Battle of Yehuling to the semu (2026-11-13)

Run as B41. Every cited URL answered. **Pictures were not touched.** **The old cards put battle templates on Yehuling and Caizhou
("August – October 1211" and "9 February 1234", conversions of the histories' Chinese months), dated the Lingbei province (1307)
and the semu office rule (1265) by conversions, gave the semu another card's exam year (1313, `cnh-491`'s), carried "CE" on years
after 1000 on the Yuan's and the four classes' lines, cited up to four Chinese histories a card on Chinese Wikisource, and told
the "four-class system" as a law the Yuan wrote down.** The *Jinshi* (juan 18, 93), the *Yuanshi* (juan 4, 6, 58, 81, 91, 157) and
de Rachewiltz's thesis on Yelü Chucai were read on the Kanseki Repository and ANU Open Research.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-481` Battle of Yehuling | 6 | 6 → 6 | **The template off: `Fought 1211`; four Wikisource histories cut to the *Jinshi* juan 93: the back road to Xuande, the army breaking at Huihebao, Zhongdu under martial law; the Daoist master's bleached bones**; Muqali, the *Yuanshi*'s styled 400,000 and the 1212 dating dropped. |
| `cnh-482` Siege of Caizhou | 6 | 6 → 6 | **`Besieged 1233 – 1234` / `Fell 1234` (no page prints "9 February"); the *Jinshi* juan 18: the plea for Song grain, the throne handed to a kinsman, the Youlan pavilion; Meng Gong's Song troops; the Song force given as each text's figure**; the mare's-milk oath and the divided remains (the *Songshi* only) dropped. |
| `cnh-483` Yuan dynasty | 8 | 8 → 9 | **`Proclaimed 1271` / `Conquest ended 1279` / `Driven north 1368` (no "CE" after 1000); the name from the Book of Changes (Frank 2025) through Liu Bingzhong; the *Yuanshi* juan 58's boast of a realm wider than the Han's or the Tang's; the 1290 census from Howorth; the *Yuanshi* compiled 1369 – 1370 in haste (Strassberg, Wylie); the succession murders**. **Pinyin Yuáncháo → Yuán cháo.** |
| `cnh-484` Yelü Chucai | 6 | 6 → 6 | **De Rachewiltz's open 1960 thesis; the refusal to call his Jin sovereign an enemy, the jiaoduan at the Iron Gate told as the *Yuanshi*'s, taxes rather than pasture before Ögedei; the years out of the questions**. Protected: the line stays (flagged below). |
| `cnh-485` Kublai Khan | 8 | 8 → 8 | **One Chinese text, the *Yuanshi* juan 4; Kaiping against Ariq Böke, the Ezhou truce with Jia Sidao on Möngke's death, Polo's "most potent man since Adam"; the birth "usually reckoned as 1215" (Giles 1214, Cordier 1216)**; the histories' age at death (80, against the line's 78) left out. Protected: the line stays (flagged below). |
| `cnh-486` Bayan of the Baarin | 6 | 6 → 6 | **The *Songshi* dropped; "be my Cao Bin", the walled town bypassed on the Han, the clothes and bedding; Xiangyang's and Yamen's clues (`cnh-463`, `464`) kept out; 1236 carried as "usually given"**; regnal-year conversions dropped. Protected: the line stays (flagged below). |
| `cnh-487` Khanbaliq | 6 | 6 → 7 | **"Founding 1267, walls begun" now `Founding 1267` / `Named Dadu 1271` / `Taken 1368`; the *Yuanshi* juan 157: Liu Bingzhong building it north-east of Zhongdu; Polo's whitewashed battlements and twelve gates (the chessboard plots Ramusio's alone); the Ming cutting five li and renaming it Beiping; Cho 2015**; the 1270 register and "10 km a side" (a conversion) dropped. |
| `cnh-488` Four-class system | 6 | 6 → 7 | **Told as historians' label: Funada 1999 [in Japanese] against Koh 2023; `Exams restored 1315` / `Yuan ended 1368`; the quotas from the *Yuanshi* juan 81; darughachi often Chinese**; the penal rule (a second Chinese text) dropped. **Pinyin sì děng rén zhì → sìděngrén zhì (Theobald).** |
| `cnh-489` Xingsheng | 6 | 6 → 6 | **"Lingbei added 1307" (Dade 11 converted) off: `Set up from 1260` / `Dynasty ended 1368`; the *Yuanshi* juan 91's ten provinces plus Zhengdong for Korea; the Franciscan's twelve "Singo" (Yule); the Jiangzhe province; Cordier [in French], Cho Won [in Korean]**; 1284, 1274 and the juan 58 counts dropped. |
| `cnh-490` Semu | 6 | 6 → 6 | **"Office rule 1265 / Exam quotas 1313" (a conversion; `cnh-491`'s year) now `Yuan period 1279 – 1368`; the edict "early in Kublai's reign"; the notebook's 31 kinds, Ahmad of Fenaket and the copper mace, the name near "Muslim"; Funada 1999 [in Japanese], the *Yuanshi* juan 6**; the exam material left to `cnh-488`. |

Read by eye. **Confusability**: Liu Bingzhong names the dynasty on `cnh-483` and builds the city on `cnh-487` (two different
clues); Polo's praise of Kublai `cnh-485`'s, his city `cnh-487`'s; the exam quotas `cnh-488`'s, the 1313 decree `cnh-491`'s; Bayan's
clues clear of `cnh-463` and `cnh-464`. **Legend**: the jiaoduan (the *Yuanshi*), the bleached bones (the Daoist's journey), Polo's
praise (his book) are each a text's. **Chinese names corrected**: `cnh-483` and `cnh-488` pinyin; 大都 Dàdū kept (`Z.reading?` a
polyphone). **Spellings fixed**: none needed; 0 hits. **Myth register**: Marco Polo: the chessboard plots are Ramusio's alone
(Yule 1903) — confirms the row's clause; the Mongol conquests' figures: the *Yuanshi*'s 400,000 at Yehuling a styled figure, the
Song force at Caizhou each text's. **check-citations**: `cnh-489` reports Cho Won's article as "a different paper" because its
title is cited in transliteration — Crossref's own record is the same article. **Protected lines: unchanged** (diffed after the
apply). For the owner: `cnh-484`'s 1190 and 1244 (de Rachewiltz argues 1189 and 1243; the *Yuanshi*: aged 55); `cnh-485`'s 1215
and days on no page read (Giles 1214, Cordier 1216) and "age 78" (the histories: 80); `cnh-486`'s 1236 on no page read (Giles
1237; the *Yuanshi*: 59 sui at death).

### B50 — `cnh-491`–`cnh-500`, Yuan: Ayurbarwada to the David Vases (2026-11-13)

Run as B41. Every cited URL answered when its agent fetched it; at the batch's own curl, ANU Open Research gave empty replies
for de Rachewiltz's thesis (`cnh-494`, `495`, `496` — the agents' saved pages stand, as on `cnh-316` in B32). **Pictures were not
touched.** **The old cards cited the *Yuanshi* (up to five juan a card) on Chinese Wikisource, dated the Zhizheng paper-money
reform by a conversion (1351), the Western Chamber by its story's setting ("Tang tale set 785 – 805 CE"), labelled a row "Register
of Ghosts" (18 characters), carried years in nearly every phrasing, told the Phagpa script's 1280 note as the editors' (it is
about the successor's death), and dated the Fuliang porcelain bureau by a conversion (1278).** The *Yuanshi* (juan 24, 97, 164,
202, 210), Tao Zongyi's *Chuogeng lu* juan 25 and the *Taiping guangji* juan 488 were read on the Kanseki Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-491` Ayurbarwada | 5 | 5 → 5 | **Three Wikisource texts cut to the *Yuanshi* juan 24; Mailla 1779 [in French] for 1313; the abridged handbook "enough to rule the realm", the palace guards against the regency and Khaishan sent for, the exam decree; 1285 carried as "usually given"**; Li Meng's speech and "aged 36" dropped. Protected: the line stays (flagged below). |
| `cnh-492` Jiaochao | 6 | 6 → 6 | **"Zhizheng reform 1351" (a conversion) now `Zhizheng notes 1350` (Theobald); the *Yuanshi* juan 97: notes printed daily for the soldiers, ten ingots for a peck of grain, "old paper the father, copper an adopted son"; Polo's mulberry-bark notes told as his book's; von Glahn 2026's fiat reading**. |
| `cnh-493` Guo Shoujing | 7 | 6 → 7 | **The *Yuanshi* juan 164 for every Wikisource citation; the Shoushi calendar (1280, 1281), the simplified armillary and the gnomon's pinhole (Mercier 2003, MacTutor), the instrument taken to Potsdam, the Tonghui Canal with its locks, the Dengfeng tower; Wylie, Bretschneider**; the bricks story and the Huitong Canal dropped. Protected: the line stays (flagged below). |
| `cnh-494` Mongol invasion of Java | 6 | 6 → 6 | **The *Yuanshi* juan 210 with Groeneveldt's translation; the fleet and army given as each history's own (1,000 ships and 20,000 men; 500 ships; the Serutu boulder's 500 boats, Hung et al. 2022); "late in 1292" made "the last month of the Chinese year"; Majapahit and Raden Wijaya**; Odoric dropped. **Pinyin → Yuán cháo zhēng Zhǎowā**; 征 kept against OpenCC's 徵 (wrong in this sense; `Z.trad` a false alarm). |
| `cnh-495` Travels of Marco Polo | 8 | 8 → 8 | **The card now the book: dictated to Rustichello in 1298 (Mascherpa 2025: late 1298 to mid-1299), first written in French, *Il Milione*, about 143 manuscripts (the BnF), the Z version; the Yangzhou governorship partly a translator's addition (Yule); the doubt as Wood's 1995 claim and the replies (de Rachewiltz; Vogel 2025); the escort of the Mongol bride matched by a Chinese order**; all three phrasings new and clear of the Polo clues on `cnh-438`, `449`, `455`, `463`, `485`, `487`, `492`. |
| `cnh-496` John of Montecorvino | 7 | 6 → 7 | **All three phrasings new (the old ones carried years): King George at mass, the five years' slander, the boys' choir; Moule's translation with its 1289 date for the Wikisource *Yuanshi*; the birthplace "probably" (Yule calls it doubtful)**. Protected: the line stays (flagged below). |
| `cnh-497` Drogön Chögyal Phagpa | 6 | 6 → 7 | **Five Wikisource citations cut to the *Yuanshi* juan 202; the 41 letters (West's BabelStone overview), Liangzhou with Sakya Pandita, the Mahākāla image, Chabui and the seats told as Sanang Setsen's saga (Howorth); the Met's Phagpa-script paiza; Choi 2021**; the editors' "1280" note (about the successor) and 1274 (a conversion) dropped. Protected: the line stays (flagged below). |
| `cnh-498` Zaju | 6 | 6 → 6 | **"Register of Ghosts 1330" (18 characters) now `Catalogue 1330` / `Anthology 1615`; three Chinese texts cut to Tao Zongyi's *Chuogeng lu* juan 25; four acts and a wedge, one singer, the clerk's "undying ghosts"; Ng and Teoh 2026**; Voltaire and Prémare (on no page read) and the Yuan law (it writes 雜戲) dropped. |
| `cnh-499` Romance of the Western Chamber | 6 | 6 → 8 | **"Tang tale set 785 – 805 CE" (a setting) off: `Written c. 1300` / `Earliest edition 1498` / `Translated 1872 – 1880`; the *Yingying zhuan* in the *Taiping guangji* juan 488; the Pujiu monastery, the maid, Baoyu and Daiyu reading it; "a happy issue" (Giles)**; the "five parts" and "sixteen acts" (on no page read) dropped. |
| `cnh-500` David Vases | 5 | 5 → 5 | **1351 and 1929 checked against Pope 1952; Zhang Wenjin's offering at Yushan, the dragon and phoenixes, the elephant-head handles; the Elphinstone and Russell collections and the foundation's name**; "1278" for the Fuliang bureau (a conversion) and "earliest securely dated" (on no page read) dropped. |

Read by eye. **Confusability**: the exam decree `cnh-491`'s (out of `cnh-459`); the paper money's clues `cnh-492`'s and Polo's book
`cnh-495`'s — the Polo agent was told every other card's Polo clue; the Tonghui Canal `cnh-493`'s; the Phagpa script `cnh-497`'s;
zaju's form `cnh-498`'s, the Western Chamber's story `cnh-499`'s. **Legend**: Chabui and the seats (Sanang Setsen), Polo's
paper money (his book), the Western Chamber's sources (each text named) are each a text's. **Chinese names corrected**:
`cnh-494` pinyin. Kept unconfirmed: 元朝征爪哇, 大维德花瓶 — for the owner. **Spellings fixed**: none needed; 0 hits. **Myth
register**: Marco Polo confirmed (dictated 1298, placed 1298 – 1299 by Mascherpa; 143 manuscripts; the Yangzhou post mainly
Ramusio's); the Western Chamber confirmed, with Zhao Lingzhi's Northern Song guzi ci between Yuan Zhen and Master Dong
(Fujita); Kublai and Phagpa: the Mongol telling (Sanang Setsen, through Howorth) beside the *Yuanshi*'s; the Mongol conquests'
figures: Java's ships and men each history's. **check-citations**: no mismatch. **Protected lines: unchanged** (diffed after the
apply). For the owner: `cnh-491`'s 1285 and days on no page read (the *Yuanshi*: Zhiyuan 22, 3rd month) and Yanqing on none;
`cnh-493`'s 1314 on no page read (every source fits 1316); `cnh-496`'s birthplace doubtful (Yule) and its death "about 1328";
`cnh-497`'s Ngari looks wrong (the *Yuanshi*: a man of Sakya) and its days on no page read.

### The fifth hundred, in sum

`cnh-401`–`cnh-500` (the end of the Five Dynasties and Ten Kingdoms, the Liao, Northern Song, Southern Song, Western Xia,
Jurchen Jin and Yuan decks) are done: 631 sources became 635 and 92 glossary entries were rewritten. `cnh-audit.js
--range=cnh-401:cnh-500` reads 87 of 100 cards with nothing but a missing picture, against none at the baseline; what remains is
100 cards with no picture (Commons answered 429 all session, so no picture pass ran), 5 `L.missing` (`cnh-455` Quanzhou and the
battles `cnh-461`, `470`, `476`, `482`), 4 advisory `W.not-why`, 3 `Z.reading?` that are polyphones the house reads as it does
(秦桧 Huì, 大都 dū, 马可·波罗 as a name), one `Z.trad` that is OpenCC's error (`cnh-494`: 征 "to campaign" is never 徵) and two
`Q.sibling` that share words only (`cnh-437` "tripod" against `cnh-083`; `cnh-451` against `cnh-280`). `check-cnh-spellings.js`
reads 0 card hits over the hundred (the baseline's three — "Zuo zhuan" on `cnh-432` and `cnh-450`, "Uighur" on `cnh-469` — and the
"Khubilai" and "Ögödei" the new rows caught on `cnh-463` and `cnh-491` are settled). Fifty agents worked two cards each, never more
than ten at once but for one launch that briefly made eleven; as each draft came back its clues went into `AGENT.md` and running
agents were told of any shared clue (Xu Xuan's "two households", Aguda's refused dance, the Xiangyang engines and Lu Xiufu, every
other card's Marco Polo passage). Each batch was applied alone, verified field by field against its drafts, diffed for the
protected lines and committed with its docs; `origin/main` was merged after B45 (nothing new) and again before the PR.

What the hundred found, again and again:
- **The court histories cited on Chinese Wikisource.** Nearly every card cited two to five Chinese texts there — the *Old* and
  *New Histories of the Five Dynasties*, the *Songshi*, *Liaoshi*, *Jinshi*, *Yuanshi*, Li Tao's *Changbian*, the *Sanchao beimeng
  huibian* — over the one-per-language rule and unreachable. Each card now reads one Chinese text in the Siku edition on the
  Kanseki Repository (KR2a0029–0036, KR2b0007) or on zggdwx.com, and claims that rested only on the second or third text were
  dropped.
- **Conversions on the lines and in the prose.** "First contact 1117", "Southern bureau 948", "Reformed 1175", "Lingbei added
  1307", "Office rule 1265", "Zhizheng reform 1351", "Policy essay 1070", the Caishi, Tangdao, Xiangyang, Yamen, Yehuling and
  Caizhou days, Chai Rong's 953, Qian Chu's 956, Xuzhou's 1083: each a regnal year or a Chinese month someone converted; each is
  now dropped or replaced by a year a page prints.
- **Battle templates and places on the lines.** Gaoliang River, Huangtiandang, Caishi, Tangdao, Xiangyang, Yamen, Haoshuichuan,
  Hubudagang, Yehuling and Caizhou carried Location, Casualties and Result rows ("At least 100,000 Song dead"); labels named
  places ("Jinling taken", "Taiyuan fell", "Kaifeng fell", "Juyong arch", "At De'an") and men ("Cai Xiang", "Huizong"). All are
  now dates only.
- **A date belonging to another thing.** The Tangut and Jurchen peoples carried their states' dates (now no line, as `cnh-412`),
  Khara-Khoto the Xia's founding, the Yue ware one tribute list, the Zizhi Tongjian the span it covers, the watertight
  compartment a voyage whose book describes none, the Western Chamber its story's setting, the semu another card's exam year.
- **Figures read the wrong way.** The 100,000 at Yamen (the *Songshi*'s count of the drowned a week later), Rashid al-Din's
  300,000 (his figure, an exaggeration to Howorth), the *Yuanshi*'s styled 400,000 at Yehuling, the huizi's 229 million (329), the
  Java fleet (each juan its own), the Chanyuan and Shaoxing payments (the oath texts' own figures).

**The Chinese name.** Corrected: `cnh-421` Sòng cháo, `cnh-483` Yuán cháo, `cnh-494` Yuán cháo zhēng Zhǎowā (the house X cháo
split); `cnh-465` Xī Xià, `cnh-468` Xī Xià wén, `cnh-469` Xī Xià wén Dàzàngjīng (split as Běi Wèi); `cnh-420` Liáo Tiānzuòdì and
`cnh-471` Hēishuǐchéng (joined); `cnh-426` xīnzhèng and `cnh-488` sìděngrén zhì; `cnh-472` Měnggǔ (third tone, corrected after
the apply); `cnh-460` 道学 dàoxué → 理学 lǐxué. Kept unconfirmed for want of a page printing the compound, for the owner: 辽朝,
越窑, 高梁河之战, 海上之盟, 靖康之变, 黄天荡之战, 采石之战, 唐岛之战, 襄阳之战, 崖山之战, 好水川之战, 蒙古灭西夏, 护步答冈之战, 元朝征爪哇,
大维德花瓶; the word division of 窑 compounds is open (`cnh-457` Jiànyáo against `cnh-955` Dìng yáo). **Spellings**: rows added for
the Ten Kingdoms, the Khitan and Liao, the Song emperors (English order), Kaifeng and Hangzhou, the Song men and women, the Song
books and currencies, the Tangut and Western Xia, the Jurchen and Jin, the Mongols and Yuan (Genghis Khan as the slug; Kublai in
the card's voice; Khanbaliq and Dadu both house forms) and the Water Margin and the Western Chamber; "Yangzi" never appeared in a
draft's own voice.

**The myth register** gained fifteen rows at the start. Confirmed: the yellow robe (the *Songshi* juan 1), the cup of wine
(Northern Song notebooks, as Li Tao names them), Li Yu's poisoning (the *Moji*, which names the Prince of Qin), Feng Dao (four
surnames and ten rulers, Ouyang Xiu), Bao Zheng (the ballads), Yue Fei (the *Songshi* juan 365; the mother's tattooing later), the
Jingkang captivity (the *Songshi* juan 23), Li Qingzhao's postface (1132, or 1134 in Hong Mai), Wang Anshi and Sima Guang (the
*Songshi*'s verdict citing Zhu Xi), Su Shi's rhapsodies (1082), the Mongol conquests' figures, Marco Polo (1298 – 1299, the
Ramusio-only passages), the Western Chamber (with Zhao Lingzhi's guzi ci between Yuan Zhen and Master Dong). Still provisional:
the Water Margin's Song Jiang (no card told it), Kublai and Phagpa's Tibetan tellings (only the Mongol and Chinese read), the
kneeling statues' Ming date, Su Shi's own doubt of the Red Cliff site.

**The protected cards** (`cnh-401`, `403`, `407`, `409`, `413`, `420`, `422`–`424`, `428`–`430`, `432`, `434`, `439`, `441`, `442`,
`444`, `445`, `448`, `450`, `451`, `459`, `467`, `475`, `480`, `484`–`486`, `491`, `493`, `496`, `497`) kept their `answerDate`,
`undatable` and `timeline` byte for byte through every apply and the merges of main. Every background now carries the years on its
card's line. Rows flagged for the owner, left as they stand (details in each batch): years on no page read — `cnh-409`'s 882,
`cnh-413`'s 872, `cnh-420`'s 1128 and 1156, `cnh-423`'s 961, `cnh-428`'s 1045 (as the demotion's), `cnh-429`'s 1008 and 1053,
`cnh-439`'s 1051 (modern summaries only), `cnh-475`'s 1068, `cnh-480`'s 1123, `cnh-485`'s 1215, `cnh-486`'s 1236, `cnh-491`'s 1285,
`cnh-493`'s 1314, `cnh-467`'s 1003; a year given otherwise elsewhere — `cnh-430`'s 1058 (Jia: 1059), `cnh-434`'s 1047 (Giles 1046),
`cnh-441`'s Huangzhou 1080 – 1086 (Yang: to 1084), `cnh-444`'s c. 1090 (after 1087), `cnh-450` (Giles 1141), `cnh-451`'s 1091
(1090), `cnh-484`'s 1190 and 1244 (de Rachewiltz: 1189 and 1243); places — `cnh-401`'s Taiyuan, `cnh-428`'s Mian Prefecture
(Luling), `cnh-432`'s Guangshan, `cnh-491`'s Yanqing, `cnh-496`'s birthplace (doubtful), `cnh-497`'s Ngari (the *Yuanshi*: Sakya);
ages against the histories' Chinese count (`cnh-401`, `422`, `430`, `432`, `445`, `448`, `450`, `451`, `459`, `467`, `485`); and the
days on the person template, nearly all on no page read.

**For the owner, outside the hundred**: the glossary alias "Liu Yu" belongs to `Emperor_Wu_of_Song`, so "Liu Yu" on `cnh-477` (劉豫,
the Da Qi puppet) links to the Liu Song founder; `cnh-819` (Junk) holds the Polo and Quanzhou bulkhead clues `cnh-438` gave up.

### Locators (2026-11-13, the fifth hundred)

**No locator was added.** The Wikipedia API answered the session's one test call at the end of the run, but the next calls and
`add-locators.js` itself (Quanzhou; Caizhou at Runan County) were rate-limited and wrote nothing, so `migrate-places.js` was not
run and `cnh-080` Xibeigang, `cnh-203` the Qin Straight Road and `cnh-365` Yinshan are still waiting. In the hundred, `cnh-455`
Quanzhou (the article "Quanzhou" has a point) and the battles `cnh-461` Tangdao (its article's point is a whole degree, 37° N
121° E — too coarse), `cnh-470` Haoshuichuan and `cnh-476` Hubudagang (no article; a Wikidata item wanted) and `cnh-482` Caizhou
(Runan County) have no point. Points to review, as the drafts read them: `cnh-416` Gaoliang River is central Beijing (the river
near Xizhimen would be the site); `cnh-418` the pagoda's point is 1.4 km off and labelled with the county; `cnh-453` Caishi is
Ma'anshan's centre, not the crossing; `cnh-464` Yamen should be Yashan, south at the strait; `cnh-471` Khara-Khoto is labelled
"Ejina Banner"; `cnh-481` Yehuling is Zhangjiakou city (the pass is some thirty li west); `cnh-408` Yue ware's is Shaoxing (the
Shanglin Lake kilns would be closer); `cnh-449` West Lake's points at the city. `migrate-places.js --check` and `build-wars.js
--check` were not re-run; on main they already report known failures.

### B51 — `cnh-501`–`cnh-510`, Yuan and Ming: the Red Turban Rebellions to the Yongle Emperor (2026-11-14)

The sixth hundred's first batch, run as the fifth's were (`AGENT.md`, the notes file, two cards an agent, at most ten at once);
every draft read by eye and prechecked before `batch.sh` applied it. Every cited URL answered (two DOIs to bot-walled publishers,
`cnh-501`'s eco-vector article and `cnh-503`'s Wiley one, resolve; the agents' saved pages stand). **Pictures were not touched**
(Commons answered the session's one test call; the owner has not yet chosen a picture pass, so pictures stay paused). **The old
cards cited the *Mingshi*, the *Yuanshi*, the *Huang Ming zuxun*, Gu Yingtai's *Mingshi jishi benmo* and Huang Zongxi on Chinese
Wikisource (two to five Chinese texts a card), carried war templates with converted days (Jingnan's 8 August 1399 and 13 July
1402), named men and places in labels ("Hu executed", "Lan Yu case", "Buir Lake 1388"), and dated a dynasty card by another
card's state ("Southern Ming 1644 – 1661").** Each card now reads one Chinese text, the *Mingshi* (juan 4, 7, 72, 77, 122, 308,
327) in the Siku edition on the Kanseki Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-501` Red Turban Rebellions | 7 | 7 → 7 | **The war template off: `Began 1351` / `Ended 1368` (Karaseva [in Russian]); 14 September 1368 is Xu Da's entry into Dadu (`cnh-487`'s); the *Mingshi* juan 122: the Song descent from Huizong and the white horse and black ox, Han Lin'er's revived Song, Shangdu sacked, the "Red Army" and "Incense Army"; Xu Shouhui's Tianwan**; Jia Lu's labour figures and the one-eyed stone man (the *Yuanshi* only) dropped; the mooncake rising told nowhere (no page). |
| `cnh-502` Northern Yuan | 6 | 7 → 6 | **"Buir Lake 1388" (a place) off: `Began 1368` / `Ended 1388` / `Also dated 1402` (Theobald's two reckonings); the *Mingshi* juan 327: Lan Yu's fireless march, Tögüs Temür strangled, five khans murdered until Guilichi dropped the name; Sagang Sechen's telling through Howorth; Pokotilov [in Russian]**; the fall of Dadu (`cnh-487`'s) out of the background; "Khubilai" → Kublai. |
| `cnh-503` Ming dynasty | 9 | 9 → 9 | **"Southern Ming 1644 – 1661" (`cnh-539`'s) dropped: `Founded 1368` / `Fell 1644`; the *Mingshi* juan 77: the failing notes, 60,545,812 registered under the founder and Zhou Chen on the hidden households; Chen et al. 2024 (sixteen emperors), Xin et al. 2025 (the drought of 1585 – 1590); silver from the Americas**; the census years 1393 and 1578 (conversions) and the name's meaning (on no page) dropped. **Pinyin → Míng cháo.** |
| `cnh-504` Hongwu Emperor | 7 | 7 → 8 | **The *Mingshi* juan 1 for three Wikisource texts: the famine of 1344, the Huangjue novice begging round Hefei, Guo Zixing and Ma; Giles's "Beggar King", Cordier's "empereur mendiant"; the Embroidered Uniform Guard; the Cleveland copper-red bowl from the palace site; Xiaoling's World Heritage listing (Wang et al. 2026)**; the *Huang Ming zuxun* and the juan 3 verdict dropped. Protected: the line stays (flagged below). |
| `cnh-505` lijia system | 6 | 6 → 6 | **"Land registers 1387" (the fish-scale registers, on no page read) off: `First trials 1370` / `Empire-wide 1381`; Hucker 1978 for the 110 households and the ten rotating heads, the remnant households and the elders; Heijdra for the drift**; the Back Lake islands and yellow covers (`cnh-715`'s), the Code's 100 blows and two more Chinese texts dropped. |
| `cnh-506` Hu Weiyong case | 6 | 8 → 6 | **Labels naming men off: `Began 1380` / `Widened 1390` / `Ended 1393` (the year the Hu prosecutions closed with a pardon, Hucker); the *Mingshi* juan 308: the son under the cart, more than 30,000 executed, Li Shanchang reached; the Lan Yu list (15,000) kept apart**; four of five Chinese texts and the converted 1379 Champa envoys dropped. |
| `cnh-507` Central Secretariat | 6 | 7 → 6 | **"Revival banned 1395" (no page ties the ban to that year) off: `Created 220 – 226 CE` / `Yuan adoption 1260` / `Abolished 1380`; the *Mingshi* juan 72: only the drafters kept and the Six Ministries under the throne; Kublai's Secretariat and its branch offices become the sheng; Kim 2016 [in Korean]**; the converted 1368 and 1382 dropped. **Pinyin → Zhōngshūshěng** (joined, as Shūmìyuàn). |
| `cnh-508` Grand Secretariat | 6 | 6 → 6 | **"Academicians 1382" (a conversion) and "Eclipsed c. 1730" (`cnh-550`'s date) off: `Formed 1402` / `Abolished 8 May 1911` (Brunnert and Hagelstrom); the *Mingshi* juan 72; the inner circle of seven after Nanjing fell (Dardess), the draft slips and the eunuchs' vermilion endorsement, Yang Tinghe choosing the Jiajing Emperor**; Xie Jin and Huang Huai (juan 5, not read) dropped. |
| `cnh-509` Jingnan campaign | 6 | 7 → 7 | **The template's converted days off: `Began 1399` / `Ended 1402` (Chan); the *Mingshi* juan 4: "clear the ruler's side", the Jinchuan Gate opened by the Prince of Gu and Li Jinglong, the palace fire, the ruler's fate never settled, 1402 counted as Hongwu 35; Wade's *Ming Shi-lu***; the feigned madness and the *Huang Ming zuxun* clause dropped. **Name → 靖难之役 Jìngnàn zhī yì** (the Palace Museum's lemma). |
| `cnh-510` Yongle Emperor | 7 | 7 → 7 | **The *Mingshi* juan 7; Prince of Yan in 1370, the 1390 campaign against Nayir Bukha, the melted-tin coffin, Annam made the province of Jiaozhi (Wade's *Ming Shi-lu* orders); the histories' verdict on the usurpation's shame; Beijing, the encyclopedia and the voyages left to their own cards**; the voyages-to-find-the-nephew claim and the converted 1380 dropped. Protected: the line stays (flagged below). |

Read by eye. **Confusability**: Khanbaliq's fall stays `cnh-487`'s (14 September 1368 off `cnh-501`); the Hu case's dead `cnh-506`'s,
the abolition itself `cnh-507`'s; the seven advisers `cnh-508`'s and the usurpation `cnh-510`'s; the Jinchuan Gate and the palace
fire `cnh-509`'s; the Embroidered Uniform Guard `cnh-504`'s. **Legend**: the Jianwen Emperor's escape (the *Mingshi* gives the
fire and the rumour), the beggar-monk youth (the *Mingshi* juan 1), the Hu case's dead (the *Mingshi*'s count) are each a text's.
**Chinese names corrected**: `cnh-503` Míng cháo, `cnh-507` Zhōngshūshěng, `cnh-509` 靖难之役 Jìngnàn zhī yì. Kept unconfirmed for
want of a page printing the compound: 红巾 (the badge; 红巾起义 on no page read), 胡惟庸案, 洪武帝 (the Palace Museum prints
洪武皇帝), 永乐帝 — for the owner. **Spellings fixed**: "Khubilai" (`cnh-502`); 0 hits after. **Myth register**: the beggar monk
confirmed (the *Mingshi* juan 1; the Huangling stele not read; the mooncake tale on no page, so not told); the Hu case's dead
confirmed and corrected (the *Mingshi* juan 308's 30,000 is the Hu case alone; Hucker's 15,000 the Lan Yu list); the Jianwen escape
confirmed (the *Mingshi* juan 4). **check-citations**: two false alarms — `cnh-506`'s "Langlois Jr" (Crossref writes "Jr.,") and
`cnh-507`'s Korean title cited in transliteration (the same article). **Protected lines: unchanged** (diffed after the apply). For
the owner: `cnh-504`'s days (21 October 1328, 23 January 1368, 24 June 1398) on no page read as Western dates (the Palace Museum
gives Chinese dates); `cnh-510`'s 2 May 1360 and the reign days on no page read, and its "Nanjing, Jiangsu" birthplace disputed.
The timelines of `cnh-501` (1351 – 1368) and `cnh-506` (1380 – 1393) were set with `set-timeline.js`.

### B52 — `cnh-511`–`cnh-520`, Ming: Beijing to the wokou (2026-11-14)

Run as B51. Every cited URL answered at the batch's own curl. **Pictures were not touched.** **The old cards cited the *Mingshi*
(two to five juan a card), Gu Yingtai's *Mingshi jishi benmo*, the 1431 steles, Ma Huan and the *Dongxi yang kao* on Chinese
Wikisource, dated Beijing by the traditional Zhou enfeoffment of Yan ("Founding 1045 BCE") and by a "Peak 15th – 18th centuries",
gave the Tumu Crisis a battle template, named Jizhou and the Hanlin in labels, and carried regnal-year conversions (Zheng He's 1425
Nanjing post, the wokou's 1369 envoy and 1384 walls, "Fujian cleared 1564").** Each card now reads one Chinese text, the *Mingshi*
(juan 7, 8, 40, 98, 212, 304, 320, 322, 328) in the Siku edition on the Kanseki Repository.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-511` Beijing | 9 | 9 → 9 | **"Founding 1045 BCE" (another event, on no page) and "Peak 15th – 18th centuries" (not a date) off: `Renamed 1403` / `Made capital 1421` / `Confirmed 1441` / `Outer wall 1553` (Sirén, Campbell, Theobald, Cho); the *Mingshi* juan 40; the outer wall cut back to the south, the Tartar and Chinese Cities, the travelling residence and the Nanjing rivalry**; Yule, Cordier and Khanbaliq's clues (`cnh-487`'s) dropped. |
| `cnh-512` Forbidden City | 9 | 9 → 9 | **`Ordered 1406` / `Finished 1420` / `Court moved in 1421` / `Museum founded 1925`; the *Mingshi* juan 7; Campbell 2020 on 1406 against 1417, the eunuch measuring the Nanjing halls, the three halls burned and the critic put to death, Puyi escorted out and the museum the next year (the Palace Museum)**; Sirén's walls and the Columbia page dropped. |
| `cnh-513` Yongle Encyclopedia | 7 | 7 → 7 | **"Completed 1407" now `Completed 1408` (the Library of Congress; the Qing catalogue's December 1407 kept in prose); "Hanlin fire" → `Burned 1900`; the *Mingshi* juan 98: filed by rhyme, titles in red, the *Wenxian dacheng* enlarged under Yao Guangxiao, too costly to print, the copy of 1562 – 1567 by 109 scribes**; the second juan (Xie Jin's death in snow) dropped. |
| `cnh-514` Zheng He | 8 | 9 → 8 | **The *Mingshi* juan 304 for three Wikisource texts; the Ma family of Yunnan, the eunuch Sanbao, first defender of Nanjing under the Hongxi Emperor, the late Qing reformers' navigator and the Belt and Road (Gaffric [in French]); the steles left to `cnh-515`**; the converted 1425 dropped. Protected: the line stays (flagged below). |
| `cnh-515` Ming treasure voyages | 7 | 7 → 8 | **"Changle stele 1431" (no open copy read) off: `First ordered 11 July 1405` / `Voyages 1405 – 1433` / `Last ordered 29 June 1430` (Wade's *Ming Shi-lu*); the *Mingshi*'s 62 ships of 44 zhang and 27,800 men told as its figures, Groeneveldt calling them improbable; Chen Zuyi at Palembang; Ma Huan at Calicut (Rockhill)**; Ma Huan's 63 ships and 180 physicians (on no page read) dropped. |
| `cnh-516` Hongxi Emperor | 6 | 8 → 7 | **The *Mingshi* juan 8 only: Beiping held with ten thousand men against Li Jinglong, the accession amnesty calling the ships home, Zhu Gaoxu and Zhu Gaosui's slanders and the end of slander prosecutions; the halt of 1424 in the background**; juan 149 (Xia Yuanji's advice and jailing) dropped. Protected: the line stays (flagged below). |
| `cnh-517` Tumu Crisis | 6 | 6 → 6 | **The template off: `Army set out 4 August 1449` / `Fought 1 September 1449` / `Captive returned 29 September 1450` (İzbasar [in Turkish] prints each day); the *Mingshi* juan 328: the waterless hill and Wang Zhen's carts, Esen and the red glow, the Prince of Cheng enthroned, Yu Qian against flight; the army's 500,000 first written from hearsay**; two more Chinese texts dropped. |
| `cnh-518` Ming Great Wall | 7 | 7 → 7 | **"Jizhou towers" (a place) → `Hollow towers 1569 – 1571`, `Early walls 1436 – 1464` added before `Main building 1465 – 1620` (Yang, Zhang and Li 2024; agrees with `wh-407`); the *Mingshi* juan 212 (Qi Jiguang); ten provinces from Hushan to Jiayu Pass, the "herding horses" raids (Temule), the drone survey of 602 towers, Geil's building tablet**; four Chinese texts dropped. |
| `cnh-519` tributary system | 7 | 7 → 7 | **Told as a modern scholars' label (Fairbank's) for the Ming's own tribute; the line stays empty (no year a page prints for the term); the *Mingshi* juan 320: Chosŏn named by the Hongwu Emperor, Korea excused gold and silver, the weasel-hair brushes; the Ashikaga "King of Japan" selling the tallies**; the *Huang Ming zuxun*'s fifteen countries and Altan Khan (`cnh-781`'s) dropped. **Name → 朝贡体系 cháogòng tǐxì** (Chen 2020). |
| `cnh-520` Wokou | 6 | 6 → 6 | **"Fujian cleared 1564" (a conversion) off: `Worst raids 1552 – 1557` (Liu 2024); the *Mingshi* juan 322: three in ten true Japanese, Wang Zhi on the Gotō Islands, the twenty raiders steamed to death at Ningbo**; Zhu Wan and Shuangyu (`cnh-521`'s) and the converted 1369 and 1384 dropped. |

Read by eye. **Confusability**: Khanbaliq stays `cnh-487`'s; the move to Beijing in 1421 is `cnh-511`'s clue as the capital and
`cnh-512`'s as the palace (each its own angle); the voyages' ships and figures `cnh-515`'s, Zheng He's life `cnh-514`'s; the halt of
1424 `cnh-516`'s; the Altan Khan investiture left to `cnh-781`. **Legend**: Zheng He's ships (the *Mingshi*'s, doubted since
Groeneveldt), Esen and the red glow (the *Mingshi*), the Tumu army's size (hearsay first written down) are each a text's.
**Chinese names corrected**: `cnh-519` 朝贡 → 朝贡体系 cháogòng tǐxì. Kept unconfirmed: 郑和下西洋 (the *Mingshi* prints
遣太監鄭和帥舟師下西洋, not the bare compound), 洪熙帝 — for the owner. **Spellings fixed**: none needed; 0 hits. **Myth register**:
Zheng He's ships confirmed (the *Mingshi* juan 304: 62 ships, 44 zhang by 18, 27,800 men); the Tumu Crisis confirmed (the *Mingshi*
blames Wang Zhen; its dead "several hundred thousand"); the Yongle Encyclopedia corrected (finished 1408, the Library of Congress;
the Qing catalogue's December 1407). The "1421" claim was not met. **check-citations**: no mismatch. **Protected lines: unchanged**
(diffed after the apply). For the owner: `cnh-514`'s Kunming on no page read (the *Mingshi* and Gaffric: Yunnan); `cnh-516`'s 16
August 1378 on no page read (Theobald: the year only), and its "age 46" against the annals' 48 (Chinese count). The timelines of
`cnh-513` (a text) and `cnh-519` (a concept) were not set; `cnh-515` and `cnh-517` keep theirs.

### B53 — `cnh-521`–`cnh-530`, Ming: the haijin to the Imjin War (2026-11-14)

Run as B51. Every cited URL answered at the batch's own curl but one: the Library of Congress item page for the 1602 Ricci map
(`cnh-527`) walls curl while its JSON record answers; the agent's saved page stands. **Pictures were not touched.** **The old
cards cited the *Mingshi* (up to three juan a card), the *Mingshi jishi benmo*, the *Da Ming lü*, the *Dongxi yang kao*, the
*Qingshi gao*, the *Chuanxi lu*, Ricci's memorial and prefaces, Feng Menglong's prefaces, Lu Xun's history and four Ming notebooks
on Chinese Wikisource; carried converted regnal years ("the twelfth month of 1371", the imperial porcelain orders of 1591 and 1610),
a date no page prints (Kraak ware to 1650, the Sanyan's "c. 1621"), a man in a label ("Xavier died 1552"), and the Imjin War's
template with "Over 1,130,000 dead, captured or missing", a figure no page read gives.** Each card now reads one Chinese text: the
*Mingshi* (juan 78, 81, 195, 205, 320, 326) on the Kanseki Repository, Gui Youguang's preface (the *Sibu congkan* text there), or the
1627 *Xingshi hengyan* preface on zggdwx.com.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-521` haijin | 6 | 6 → 6 | **`First ordered 1371` (Zurndorfer; Kung and Ma's 1368 beside it in prose) / `Partly lifted 1567`; the *Mingshi* juan 205: Zhu Wan's "bandits in officials' caps and gowns", his poison; "not a single plank onto the water"; Yuegang, Shuangyu, the 1,200 boats scuttled; the Qing ban of 1661 – 1684**; five Chinese texts and the converted "twelfth month of 1371" (early 1372) dropped. |
| `cnh-522` Single whip law | 6 | 6 → 6 | **"Zhejiang trial 1561" (Pang Shangpeng, on no page read) off: `First named 1531` (Theobald) / `Empire-wide 1581` (agrees with `cnh-381`); the *Mingshi* juan 78: labour hired from silver on land, Zhang Juzheng's survey, "abolished in name, alive in fact"; Chen Huan-chang 1911, Zurndorfer 2023**; Liang Fang-chung's book (an in-copyright upload) and Hai Rui dropped. **Pinyin → yītiáobiānfǎ** (joined, as `cnh-381`'s liǎngshuìfǎ; Theobald splits it — for the owner). |
| `cnh-523` tael | 7 | 7 → 7 | **"Notes pegged 1375" (the note's date, `cnh-810`'s) off: `Tax commuted 1436` / `Abolished 1933`; the *Mingshi* juan 81 on silver banned and then freed; the name from Malay and the Indian tola; the bookkeeping taels swept away in 1933 (Ma and Zhao 2020); silver under escort (Liu 2023)**; the 37.6-gram conversion and two figures on no page dropped. |
| `cnh-524` Huizhou merchants | 6 | 6 → 6 | **The line stays empty (a group); Gui Youguang's "a scholar who dealt in goods"; some forty Ming story titles (Zhu 2016; Xu and Zhang 2023); the salt families of Hangzhou and Yangzhou; Wang Qishu (Hummel); Chia 2008 on the Huizhou printers**; four notebooks on Wikisource and the claims resting on them dropped. Glossary: its unsourced "c. 1500–1800" removed. |
| `cnh-525` Kraak ware | 6 | 7 → 7 | **"Exported c. 1580 – 1650" (1650 on no page) now `Developed c. 1580` / `Output collapsed 1644` (two V&A records); the *Santa Catarina* taken in 1603 and auctioned in Amsterdam (van Kessel 2025), the panelled rims, the Arita substitutes; the *Witte Leeuw* [in Dutch]; the City University of Macau survey [in Chinese]**; the *Mingshi* juan 82's imperial orders (converted 1591 and 1610, and not export ware) dropped. |
| `cnh-526` Jesuit China missions | 7 | 7 → 7 | **"Xavier died 1552" (a man) off: `First residence 1583` (Brucker) / `Tolerated 1692` / `Suppressed 1773`; the *Mingshi* juan 326: the Nanjing complaint likening the converts to the White Lotus, Wang Fengsu sent away; Xavier at Shangchuan and Ruggieri at Zhaoqing; Yang Guangxian against Schall von Bell; Rule, Parr 2024, Hsia 2022**; Ricci's own clues kept for `cnh-527`. **Name → 耶稣会中国传教团 Yēsūhuì Zhōngguó chuánjiàotuán** (the *People's Daily*). |
| `cnh-527` Matteo Ricci | 7 | 7 → 7 | **Four Wikisource texts cut to the *Mingshi* juan 326; Ma Tang holding him at Linqing, Euclid dictated to Xu Guangqi, Li Zhizao, the condemned eunuch's burial ground; the 1602 map confirmed by the Library of Congress record; Brucker 1912, Hummel, Zhang 2022 [in Spanish]**; the gift list and "fifteen years at Zhaoqing" (the memorial only) dropped. Protected: the line stays. |
| `cnh-528` Wang Yangming | 6 | 7 → 6 | **The *Mingshi* juan 195 for three Wikisource texts; the forty strokes for defending the officials Liu Jin jailed, Longchang, the Prince of Ning taken in thirty-five days, the grotto and the unity of knowing and acting (Henke's 1916 translation, Kim's IEP entry)**; the bamboo out of the phrasings (`cnh-862`'s and `cnh-863`'s clue). Protected: the line stays (flagged below). |
| `cnh-529` Sanyan | 6 | 6 → 6 | **"c. 1621" now `First book 1620` (Yang 1998, Leggieri 2024) / `Second book 1624` / `Third book 1627`; the 1627 preface on zggdwx.com (the only Chinese text): to instruct, caution and awaken; the stories in pairs, Ling Mengchu's debt, the prints found in Japan; the *Yushi mingyan* retitling left undated (1624, or 1626 – 1627)**; Lu Xun's history and the Guan Yu anecdote dropped. |
| `cnh-530` Imjin War | 7 | 7 → 7 | **The template off: `Began 1592` / `Renewed 1597` / `Ended 1598` (Batts and Noordam 2026); the casualty figure and the two days on no page dropped; the *Mingshi* juan 320: Li Rusong at Byeokjegwan, Shen Weijing the "marketplace ruffian" and the Taedong border offer, Yi Sun-sin at Noryang; Seong 2026, the Korean encyclopedia [in Korean]**; the *Jingbirok* and Wang Dewan dropped. |

Read by eye. **Confusability**: Zhu Wan and the Shuangyu raid are `cnh-521`'s (kept off `cnh-520`); the commutation to silver is
`cnh-522`'s and the tael's own 1436 decree `cnh-523`'s, from different angles (the labour levy; the silver ban lifted); Ricci's map,
Euclid and burial `cnh-527`'s, the mission's founding and crises `cnh-526`'s; the bamboo stays with the thought cards. No `ko-` or
`jp-` card covers the Imjin War. **Legend**: Wang Yangming's enlightenment (his disciples' *Chuanxi lu*), the *Mingshi*'s
"marketplace ruffian" (Shen Weijing) are each a text's. **Chinese names corrected**: `cnh-522` yītiáobiānfǎ, `cnh-526`
耶稣会中国传教团. Kept: 壬辰倭乱 (the Korean term in characters, printed by Batts and Noordam as the Chinese name; 万历朝鲜战争 on no
page that would open) — for the owner. **Spellings fixed**: none needed; one checker hit is "Hsia", a cited author's name.
**Myth register**: Ricci's map confirmed (the 1602 Beijing printing, the Library of Congress record), the memory palace not told
(Spence not read); Wang Yangming's bamboo and Longchang confirmed as his disciples' telling. **check-citations**: one false alarm —
`cnh-521`'s "John E. Wills, Jr." (the comma). **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-527`'s
days (6 October 1552, 11 May 1610) and Macerata not checked against a page beyond Brucker; `cnh-528`'s 26 October 1472 and 9 January
1529 on no page read. `cnh-530` keeps its timeline 1592 – 1598.

### B54 — `cnh-531`–`cnh-540`, Ming and Qing: the Donglin movement to Dorgon (2026-11-14)

Run as B51. Every cited URL answered at the batch's own curl. **Pictures were not touched.** **The old cards cited the *Mingshi*
(up to three juan a card), Gu Yingtai's *Mingshi jishi benmo*, Huang Zongxi's *Mingru xuean* and the *Qingshi gao* (up to three juan,
and the abdication edict) on Chinese Wikisource; named places and men in labels ("Took Beijing", "Nanjing court", "Yongli reign");
carried "Lectures began 1604" where the sources date the academy's statutes, a regnal-year reading ("late in 1623"), and details on
no page read (Wei Zhongxian hanging himself "at an inn", Gao Panlong "drowned").** The Ming cards now read one Chinese text, the
*Mingshi* (juan 24, 120, 231, 305, 309) on the Kanseki Repository; the Qing cards read the *Qingshi gao* (juan 1, 2, 25, 130, 218) on
zggdwx.com — the Draft History of Qing, compiled 1914 – 1927 and published in 1928, unfinished and contested, said so where it speaks.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-531` Donglin movement | 6 | 6 → 7 | **"Lectures began 1604" → `Statutes issued 1604` (Theobald) / `Impeachment 1624` / `Purged 1625 – 1626`; the *Mingshi* juan 231: the Song academy at Wuxi where Yang Shi taught, anyone crossing the favourites branded Donglin; the *Water Margin* blacklist of 108; the "new Zhu Xi learning" (Nakao [in Japanese]); Yang Lian's charges in prose only (`cnh-532`'s)**; Huang Zongxi's "label" claim (Wikisource only) and Gao Panlong's drowning dropped. |
| `cnh-532` Wei Zhongxian | 6 | 6 → 7 | **The *Mingshi* juan 305 for three Wikisource texts; the twenty-four charges and the weeping eunuch, the illiterate favourite at the carpenter's bench, the living shrines and the Shandong unicorn (Kennedy in Hummel; Schneewind 2018)**; "at an inn" and "late in 1623" dropped. Protected: the line stays (flagged below). |
| `cnh-533` Li Zicheng | 7 | 7 → 7 | **The *Mingshi* juan 309 only (Gu Yingtai dropped); the post-station courier from Mizhi, the Dashing King's title from his uncle, Li Yan's no-tax slogan, Dashun at Xi'an and the palace set alight; Chen Yuanyuan told as the *Mingshi*'s; 1606 now in the background (Giles)**; the Coal Hill suicide (`cnh-534`'s) and "eighteen years of drought" (on no page) dropped. Protected: the line stays (flagged below). |
| `cnh-534` Chongzhen Emperor | 6 | 6 → 7 | **The *Mingshi* juan 24 for three Wikisource texts; the dawn bell and Coal Hill, Yuan Chonghuan cut to pieces, "a ruler dies with his altars"; the Chongzhen drought (possibly the worst in 1,500 years); Wei Zhongxian out of the phrasings**; the factional-feud speech and the sons sent away (Gu Yingtai only) dropped. Protected: the line stays. |
| `cnh-535` Qing dynasty | 8 | 8 → 8 | **"Took Beijing" (a place) → `Took the capital 6 June 1644` (Fang in Hummel; Theobald); `Named Qing 1636`; `Abdication 12 February 1912` (Couling); the *Qingshi gao* juan 25 for the edict; the Aisin Gioro, the largest empire told as Theobald's, the population passing three hundred million**; the banners and the abdication out of the phrasings. **Pinyin → Qīng cháo.** |
| `cnh-536` Nurhaci | 7 | 7 → 7 | **The *Qingshi gao* juan 1 for two Wikisource texts: the thirteen suits of armour, the state named Jin, the seven grievances, the Western cannon at Ningyuan; the 1599 script as Erdeni and Gagai's (Kennedy in Hummel)**; the 1591 banners (on no page) dropped. Protected: the line stays (flagged below). **Pinyin apostrophe → Nǔ'ěrhāchì.** |
| `cnh-537` Eight Banners | 7 | 8 → 7 | **`Four banners 1601` / `Doubled to eight 1615` / `Mongol eight 1635` / `Chinese eight 1642` (Porter 2018; Theobald's 1591 for the first four in prose); the *Qingshi gao* juan 130: every son a soldier, companies of three hundred; the Hanjun "heavy troops" with the cannon; the banner families on Republican stipends (Elliott, Campbell and Lee 2016)**; Dorgon's clue and two more sources dropped. |
| `cnh-538` Hong Taiji | 6 | 7 → 6 | **The *Qingshi gao* juan 2 for three Wikisource citations; the Yuan seal from Ligdan Khan brought back by Dorgon, Korea made a vassal within a month, the princes' monthly turns ended and Amin jailed; Porter for the 1635 name; the renaming to Manchu left to `cnh-782`**; the glossary's self-contradiction ("died before entering China proper") fixed. Protected: the line stays (flagged below). |
| `cnh-539` Southern Ming | 6 | 7 → 8 | **Places and men off the labels: `First court 1644 – 1645` / `Last court 1646 – 1662` (Kennedy and Yang in Hummel); the *Mingshi* juan 120, which files these rulers as princes with "false" reign titles; Ma Shiying and the Prince of Fu, the rival courts at Guangzhou and Zhaoqing, the dowager Helena's letter to Innocent X; Koxinga mentioned without Taiwan**. **Pinyin → Nán Míng.** |
| `cnh-540` Dorgon | 6 | 6 → 6 | **The *Qingshi gao* juan 218 on zggdwx.com; the refused throne and the co-regency with Jirgalang, the "two suns" letter and Li Wen as its reputed drafter, the robes and pearls charge and the restoration as Prince Rui in 1778 (Hummel); the queue order in prose only**. Protected: the line stays (flagged below). |

Read by eye. **Confusability**: Yang Lian's memorial is in `cnh-531`'s background and `cnh-532`'s phrasing; the Coal Hill suicide
`cnh-534`'s alone (Li Zicheng's card gives the fall of Beijing from the rebels' side); the seven grievances and Ningyuan `cnh-536`'s,
Yuan Chonghuan's death `cnh-534`'s; the banners' organisation `cnh-537`'s, the princes' rotation and Amin `cnh-538`'s; the Southern
Ming's courts `cnh-539`'s, the Yangzhou massacre left to `cnh-542`. **Legend**: Chen Yuanyuan (the *Mingshi* tells it as fact; Wu
Weiye's poem on no page read), the Yuan seal (the *Qingshi gao*), the "two suns" letter's drafter (one Qing writer's report) are each a
text's. **Chinese names corrected**: `cnh-535` Qīng cháo, `cnh-539` Nán Míng, `cnh-536` the apostrophe. Kept: 东林党 (the *Mingshi*'s
東林黨人; 东林运动 on no page), 崇祯帝 (the compound on no page) — for the owner. **Spellings fixed**: none needed; 0 hits. **Myth
register**: Coal Hill confirmed (the *Mingshi* juan 24: Wansui shan, Wang Chengen dying with him); Chen Yuanyuan confirmed in part (the
*Mingshi* juan 309); Koxinga confirmed as far as told (Cordier). **check-citations**: no mismatch. **Protected lines: unchanged**
(diffed after the apply). For the owner: `cnh-532`'s 12 December 1627 looks early (Kennedy: sent away 8 December, the arrest proclaimed
five days later); `cnh-533`'s 22 September 1606 on no page read (Tu in Hummel: "Oct. 3, 1605?"); `cnh-536`'s 14 May 1559 on no page read;
`cnh-538`'s birth and Qing days a day earlier than Cordier's; `cnh-540`'s 8 October 1643 and Yenden on no page read. The timeline of
`cnh-535` (a dynasty) was not set.

### B55 — `cnh-541`–`cnh-550`, Qing: the queue to the Grand Council (2026-11-14)

Run as B51. Every cited URL answered at the batch's own curl. **Pictures were not touched.** **The old cards cited the *Qingshi
gao* (up to three juan a card), Wang Xiuchu's diary, Zou Rong, Shi Lang's memorial, the Sacred Edict, Huang Hongshou, the *Lama
shuo* and the *Dayi juemi lu* on Chinese Wikisource; carried templates with figures no page prints (Penghu's "12,329 killed or
drowned" — two of Shi Lang's own claims added together), places in labels ("Albazin taken", "Lhasa taken", "Lhasa riot"), "Revived
1903" for the Yangzhou diary's reprint, the Grand Council's "1729 or 1732" (the second year a converted regnal year), and Goodrich's
in-copyright book from a user upload.** The Qing cards read the *Qingshi gao* (juan 4, 6, 9, 153, 176, 313, 474, 525) on zggdwx.com;
the Yangzhou card reads the *Mingshi* juan 274 on the Kanseki Repository and the diary in Backhouse and Bland's and Aucourt's
translations; Penghu reads the county's knowledge platform.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-541` queue | 7 | 8 → 7 | **`First ordered 5 June 1644` (Unno-Yamazaki, after Wakeman) / `Enforced 1645` / `Widely cut off 1911`; the *Qingshi gao* juan 4: shave within ten days under military law; the Tarim peoples spared, no rule for women; the Tianjin writers urging imams to cut it; the slogan attributed through Unno-Yamazaki**; "Reimposed" and Martini's line (`cnh-539`'s) dropped. |
| `cnh-542` Yangzhou massacre | 6 | 7 → 7 | **"City fell May 1645 / Revived 1903" now `Besieged 13 May 1645` / `Killing began 20 May 1645` / `Killing ended 29 May 1645` (Hummel); Wang Xiuchu's diary through Backhouse and Bland and Aucourt [in French]: the placards, the 800,000 as his count of bodies found; a revolutionary pamphlet reprinting it by 1907**; Zou Rong (Wikisource only) and "banned under the Qing" (on no page) dropped. Timeline set to 20 – 29 May 1645. |
| `cnh-543` Revolt of the Three Feudatories | 6 | 6 → 6 | **The template off: `Began 1673` / `Ended 1681` (Fang: 28 December 1673 to 7 December 1681 in prose); the *Qingshi gao* juan 474: the governor killed, hair grown, white banners, the King of Zhou crowned at Hengzhou; the emperor's "he will rebel either way"; Nowakowski 2023 [in Polish]**; the claim that three princes all surrendered in 1676 corrected (Shang Zhixin joined in 1676 and submitted in 1677). |
| `cnh-544` Battle of Penghu | 5 | 7 → 6 | **The template off: `Fought July 1683`; "12,329 killed" split into Shi Lang's own claims (over 12,000 Zheng dead, 329 Qing); Shi Lang hit in the eye and back a week later with 56 ships; Liu Guoxuan's flight and Zheng Keshuang's seal; the summer south wind; the Penghu platform [in Chinese], Swisher in Hummel, Po 2019**; 1684 for the prefecture (on no page) dropped. |
| `cnh-545` Kangxi Emperor | 7 | 7 → 7 | **The *Qingshi gao* juan 6; named heir as a smallpox survivor (variolation, *Emerging Infectious Diseases* 2026), the Sacred Edict's sixteen maxims (Milne's translation), the Jesuits on his sofa and the six southern tours; Oboi's fall told as the *Qingshi gao*'s; the "61 years" phrasing replaced**. Protected: the line stays (flagged below). |
| `cnh-546` Treaty of Nerchinsk | 7 | 7 → 7 | **"Albazin taken" (a place) off: `Signed 1689` (7 September, or 27 August by the Russian calendar, in prose from Hummel); sworn in the name of the Christian God, the Latin drafted by Gerbillon and Pereira, Albazin razed and the Argun made a frontier, Songgotu and Tong Guogang sent for fear of Galdan; the *Qingshi gao* juan 153's claim that Nerchinsk was handed over called an error**. Overlap: `ru-274`'s "August 1689" is the Russian calendar's; its "CE" after 1000 is not the cnh- house. |
| `cnh-547` Dzungar Khanate | 6 | 7 → 7 | **`Qing invasion 1755` / `Destroyed 1757 – 1758` (a drafted "c. 1620 – 1758" from Theobald's "after 1620" dropped by the reviewer: no derived span); the *Qingshi gao* juan 313; the Swedish officer's cannon for Tsewang Araptan, the blinded heir of Galdan Tseren, Wei Yuan's four-tenths dead of smallpox; Hummel, Mayers**; Huang Hongshou's 600,000 dropped. **Pinyin → Zhǔngá'ěr Hánguó** (汗 khan, as `cnh-385`; no page prints the compound — for the owner). |
| `cnh-548` Amban | 6 | 7 → 6 | **Places off the labels: `Dated 1727` / `Also dated 1725` (Mayers) / `Reorganised 1751` / `Reforms 1793`; the *Qingshi gao* juan 525; the amban at Urga over Kiakhta, Fuqing and Gyurme Namgyal, the "mediocre puppets" raised to the lamas' rank after the Nepal wars; the reforms told as three tellings (the *Qingshi gao*'s sovereignty, the Tibetan exiles', one historian's); Bespozvannykh 2008 [in Russian]**; the Golden Urn (`cnh-783`'s) and the *Lama shuo* (`cnh-551`'s) dropped. **Name → 办事大臣 bànshì dàchén** (Theobald; 驻藏大臣 names only the Lhasa post). |
| `cnh-549` Yongzheng Emperor | 6 | 7 → 8 | **The *Qingshi gao* juan 9; Zeng Jing's confession printed with the rebuttals (the 1730 book), the altered-will rumour told as unofficial chroniclers', the meltage surcharge made public money (Zelin, open); Lee 2019 [in Korean]**; the plaque (`cnh-732`), the vermilion comments (`cnh-708`) and the converted 1723 for the heir box dropped. Protected: the line stays (flagged below). |
| `cnh-550` Grand Council | 6 | 6 → 6 | **"Founded 1729 or 1732" now `Founded 1729` / `Renamed 1732` / `Abolished 8 May 1911` (Brunnert and Hagelstrom); the *Qingshi gao* juan 176: the duty room behind the Longzong Gate, set up for the Dzungar war, Prince Yi, Zhang Tingyu and Jiang Tingxi, "a hundred and eighty years" of real authority**; the Grand Secretariat's clues (`cnh-508`'s) kept apart. |

Read by eye. **Confusability**: the queue order is `cnh-541`'s (Dorgon's card tells it in prose only); the Yangzhou diary `cnh-542`'s;
Wu Sangui's revolt `cnh-543`'s and Koxinga's heirs at Penghu `cnh-544`'s; Kangxi's phrasings clear of the Feudatories, Taiwan,
Nerchinsk and the Kangxi Dictionary (`cnh-913`); the Golden Urn left to `cnh-783`; the Grand Council's founding `cnh-550`'s, Zeng Jing
`cnh-549`'s. **Legend**: the Yangzhou dead (Wang Xiuchu's count of bodies found), the altered will (unofficial chroniclers), the queue
slogan (attributed) are each a text's. **Chinese names corrected**: `cnh-547` Hánguó, `cnh-548` 办事大臣. Kept unconfirmed: 扬州十日 (the
diary's title 揚州十日記 is printed), 澎湖海战 (the platform's head term is 清鄭澎湖之戰), 准噶尔汗国 — for the owner. **Spellings fixed**:
none needed; 0 hits. **Myth register**: the Yangzhou dead confirmed as the diarist's figure, "banned under the Qing" unconfirmed; Koxinga
confirmed as far as told (Theobald, Cordier); Chen Yuanyuan not told. **check-citations**: no mismatch. **Protected lines: unchanged**
(diffed after the apply). For the owner: `cnh-545`'s "Reigned 5 February 1661" is the Shunzhi Emperor's death day (Hummel: proclaimed
17 February) and its "Old Summer Palace" looks wrong (he died at the Changchun yuan); `cnh-549`'s birthplace and 27 December 1722 on
no page read. The glossary alias "Liu Song" (on `Liu_Song_dynasty`) may catch a sect leader's name on `cnh-558` — noted ahead.

### B56 — `cnh-551`–`cnh-560`, Qing: the Qianlong Emperor to Lin Zexu (2026-11-14)

Run as B51. Every cited URL answered at the batch's own curl but the Library of Congress item page for the Siku Quanshu (`cnh-552`),
which walls curl as in B53; the agent's saved page stands. **Pictures were not touched.** **The old cards cited the *Qingshi gao* (up
to two juan a card), the *Lama shuo*, the *Siku* catalogue's edicts, the *Dayi juemi lu*, Wang Xihou's preface, Hong Liangji's
*Yiyan* and chronological biography and the *Qingchao rouyuan ji* on Chinese Wikisource; cited Goodrich's *Literary Inquisition of
Ch'ien-lung* from an archive.org user upload of an in-copyright reprint (twice on two cards); carried men in labels ("Zhuang case",
"Dai executed"), a place ("At Lintin"), the White Lotus's "c. 100,000 rebels killed" (whose was never said), unattributed opium-chest
figures, and "Treaty of Nanjing" in the card's voice.** The Qing cards read the *Qingshi gao* (juan 14, 154, 319, 344, 369) on
zggdwx.com, the Qianlong Emperor's own seal essay and a *Siku* page itself on the Kanseki Repository, or the *Yiyan* on Shidian guji.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-551` Qianlong Emperor | 7 | 7 → 7 | **The emperor's own essay on the "Old Man of the Ten Completes" seal (Kanseki) for two Wikisource texts; the vow not to outreign his grandfather, the 42,000 poems attributed to him, the Khotan jade seal; the Cleveland portrait record, the Met's poem vase, the Paris-made enamel pot (Liu et al. 2022)**; Giles (its OCR prints 1710) and the *Lama shuo* (`cnh-783`'s ground) dropped. Protected: the line stays; every row matches Hummel. |
| `cnh-552` Siku Quanshu | 7 | 7 → 7 | **`Last sets done 1787` added after `Ordered 1772` / `Named 1773` / `First set done 1782`; a *Siku* page itself (an editors' summary signed by Ji Yun) on the Kanseki Repository; the seasons' colours and the seven sets, the editors' summaries, Wylie's praise of the catalogue; Gandolfo 2020, Shao et al. 2024, the Library of Congress record**; Goodrich's upload and the figures only he gave dropped; the suppression cut to one clause (`cnh-553`'s). |
| `cnh-553` literary inquisition | 6 | 7 → 7 | **Labels naming men off: `Recorded cases 1647 – 1788` (Wang, Yu and Niu 2024, *PLOS ONE*); the Zhuang case's seventy dead and the corpse burned, Dai Mingshi's Southern Ming reign titles, Wang Xihou's dictionary and the taboo names; four Hummel entries; the *Qingshi gao* juan 14**; Goodrich's upload, the 2,320 works and "476 survived" (on no citable page) and Zeng Jing (`cnh-549`'s) dropped. |
| `cnh-554` Hong Liangji | 5 | 8 → 6 | **The *Yiyan*'s "Zhiping pian" on Shidian guji for four Wikisource texts; households multiplying faster than fields, the letter to Prince Cheng and Ili, the Scholar of the New Life; 1793 printed by the Cambridge chapter "Hong Liangji (1793)"; "China's Malthus" hedged as a modern comparison; Columbia's population estimate as theirs**; the register figures dropped; "extreme indecorum" (Hummel). Protected: the line stays. |
| `cnh-555` Heshen | 6 | 7 → 6 | **The *Qingshi gao* juan 319 on zggdwx.com; Cao Xibao's charge and the house rebuilt, the ruyi given to the heir before his naming, the guard at the Qianqing Gate whose son married the Tenth Princess; the hoard as the edict lists it, Backhouse and Bland's 60 million ounces as their figure**; "800 million" not repeated; Macartney out of the phrasings. Protected: the line stays (flagged below). |
| `cnh-556` Macartney Embassy | 7 | 7 → 8 | **"Left Beijing" (a place) → `Departed 7 October 1793`, with `Sailed 26 September 1792` / `Landed 5 August 1793` / `Audience 14 September 1793` (Morse); Macartney's journal: one knee, the kiss of the hand dropped; the edict read in context (Harrison 2017: drafted after the demands were translated, "we possess all things" in the preamble, famous only from 1914); the gifts (Harrison 2018); Ouyang 2020 [in Chinese]**; the Qing kowtow account (on no page) not told. Timeline set to 1792 – 1793. |
| `cnh-557` Canton System | 7 | 7 → 8 | **"Canton System" told as a later name; `One port only 1757` / `Regulations 1760` / `Ended 1842` (Morse and Hummel's 1757 edict against Liu Yong's 1760 order, a dispute); the Flint case told through Hong Renhui (the glossary's "Flint" is the stone), the Flower Gardens three days a month, the Imperial Household's revenue; the *Qingshi gao* juan 154**; the treaty's terms and the dollars (`cnh-562`'s) and "Treaty of Nanjing" dropped. |
| `cnh-558` White Lotus Rebellion | 7 | 7 → 7 | **The template off: `Began 1796` / `Ended 1804`; the casualty figure (on no page) dropped; the manhunt that drove villagers to rise, Gong Jinghan's walled villages (Hummel; the *Qingshi gao* credits Delengtai — both told), Wang Fasheng as a Ming descendant; ter Haar's reading of "White Lotus" as a hostile label, one study's**. |
| `cnh-559` opium trade | 8 | 8 → 8 | **"At Lintin" (a place) → `Offshore depot 1821 – 1839`, with `First edict 1729` / `Company monopoly 1773` / `Import banned 1800` (Morse); the chests each whose: Morse's yearly averages (9,708 for 1821 – 1828, at least 30,000 for 1835 – 1839), Perdue's 40,000 for 1839; Xu Naiji's legalisation memorial; Permanyer Ugartemendia 2015 [in Spanish]**; Columbia's school reading dropped. Glossary: the 1729 edict punished selling for smoking, not smoking. |
| `cnh-560` Lin Zexu | 7 | 7 → 7 | **The *Qingshi gao* juan 369 on zggdwx.com; the letter to Victoria written with two colleagues, the chests mixed with salt and lime at Humen, Ili and Wei Yuan's geography; "died at Chaozhou" taken out of the background (the line's Puning row stands)**; the years and the 20,283 chests out of the phrasings. Protected: the line stays (flagged below). |

Read by eye. **Confusability**: the abdication vow and the seal `cnh-551`'s, the catalogue `cnh-552`'s and the cases `cnh-553`'s; the
edict and the kneeling `cnh-556`'s, the factories' rules `cnh-557`'s; the offshore depot and the chests `cnh-559`'s, Humen and the
letter `cnh-560`'s, the war left to `cnh-561`. **Legend**: Qianlong's edict ("we possess all things", read in context), Heshen's hoard
(the edict's list; Backhouse and Bland's figure theirs), the 42,000 poems ("attributed") are each a text's. **Chinese names**: none
corrected; kept unconfirmed 一口通商 (Theobald only) and 鸦片贸易 (on no page as one word; pinyin lower-cased to yāpiàn màoyì) — for the
owner. **Spellings fixed**: "Treaty of Nanjing" (`cnh-557`); 0 hits after. **Myth register**: the Macartney embassy corrected (one knee,
Macartney's own journal; the edict drafted after the requests were translated, famous only from 1914); Lin Zexu's letter corrected in
part (August 1839, written with Deng Tingzhen and Yiliang, printed in the *Chinese Repository* in February 1840 from the *Canton Press*;
*The Times* on no page read). **check-citations**: no mismatch. **Protected lines: unchanged** (diffed after the apply). For the owner:
`cnh-555`'s 1 July 1750, 22 April 1776 and 12 February 1799 on no page read; `cnh-560`'s 3 October 1840 (Hummel: dismissed 28 September)
and Puning (Hummel and the *Qingshi gao*: Chaozhou). The alias "Liu Song" on `Liu_Song_dynasty` may link the sect leader on `cnh-558`.

### B57 — `cnh-561`–`cnh-570`, Qing: the First Opium War to the First Sino-Japanese War (2026-11-14)

Run as B51. Every cited URL answered at the batch's own curl but one *Science Advances* DOI (`cnh-564`), which resolves to a
bot-walled science.org page; the agent's saved page stands. **Pictures were not touched.** **The old cards cited the treaty texts
(English and Chinese Wikisource), the *Qingshi gao* (up to two juan a card), the Taiping land system, Hong Xiuquan's tracts, the
1924 Kuomintang manifesto, Sun Yat-sen's will and the 1949 Common Programme on Wikisource; carried the war template on every war
with casualty figures no page prints ("c. 3,187 killed, 4,991 wounded", "c. 20,000,000 – 100,000,000 dead", "Over 100,000 killed",
"c. 3,081 – 3,782", "c. 52,069 casualties"), Result rows, sub-notes naming battles and places, and labels naming institutions and
places ("Zongli Yamen", "Fuzhou attacked", "US, UK end").** Each card now reads one Chinese text — the *Qingshi gao* (juan 136, 154,
214, 462, 475) on zggdwx.com, Fan Hongjie's 1924 survey, or Han Yu 2018 — and the treaties in Mayers's and MacMurray's collections.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-561` First Opium War | 8 | 8 → 8 | **The template off: `Began 4 September 1839` / `Ended 29 August 1842` (Perdue, Theobald); the frigates at Chuanbi and Lin's silent report, Zhenjiang's garrison and its commander's death, the *Nemesis*'s debut; the treaty's terms and Lin's destruction of the opium left to their cards**; "Treaty of Nanjing" → Treaty of Nanking. **Pinyin → Dì-yī cì Yāpiàn Zhànzhēng** (agreeing with `cnh-567`). Timeline set to the two days. |
| `cnh-562` Treaty of Nanking | 7 | 8 → 8 | **`Signed 29 August 1842` / `Ratified 26 June 1843` kept; the text and the Bogue précis from Mayers 1902; Hong Kong ceded for careening, the *Cornwallis*, Article XI's "perfect equality", the *Qingshi gao*'s Jinghai Temple and "Baimen treaty"; the indemnity 21 million dollars, not taels**; four Chinese texts dropped; the five ports, the hong debts and "unequal treaty" left to `cnh-599`, `cnh-557`, `cnh-563`. |
| `cnh-563` unequal treaty | 7 | 8 → 9 | **Told as a later label, never a Qing term (who coined it on no page read; Fung and Kaufman place it after the First World War; Fan Hongjie's 1924 survey [in Chinese] shows it in use); `First signed 29 August 1842` / `Abrogation vowed 7 July 1928` (the Nationalist declaration, FRUS) / `Rights given up 11 January 1943` (Ma 2015); the most-favoured-nation clause (Mayers)**; the 1924 congress, Sun's will and the 1949 programme (Wikisource only) dropped. |
| `cnh-564` Taiping Rebellion | 8 | 8 → 8 | **The template off: `Began 1850` / `Also dated 11 January 1851` / `Capital fell 19 July 1864`; the toll given as each source's estimate (S. W. Williams's twenty million through Morse, Theobald's 20 – 50 million, Orlandi's over 20 million, Zhao 2026's 100 million); Suzhou's surrendered kings and Gordon's break with Li Hongzhang (Danko), the Eastern King's fall; Kuhn; Han Yu 2018 [in Chinese]**. **Name → 太平天国运动 Tàipíng Tiānguó yùndòng.** |
| `cnh-565` Hong Xiuquan | 7 | 7 → 7 | **Three Wikisource texts cut to the *Qingshi gao* juan 475; the vision told as Hong Rengan's account in Hamberg 1854, the golden-bearded old man, the sword and seal; Issachar Roberts's refusal to baptise him; the draft history's hostile portrait; Edkins 1861; the background's 1813 made "1814, or 1813 in some accounts"** (it contradicted the line). Protected: the line stays (flagged below). |
| `cnh-566` Nian Rebellion | 6 | 7 → 6 | **The template off: `Dated 1853 – 1868` / `Also dated 1851 – 1868` (Orlandi et al.); Zhang Lexing at Zhiheji and the five banners, Sengge Rinchen killed when his horse stumbled (the *Qingshi gao*), "nian" as a Huaibei word for bands**; Li Hongzhang's fortified villages (Wikisource only) dropped. **Name → 捻军起义 Niǎnjūn qǐyì.** Timeline set to 1853 – 1868. |
| `cnh-567` Second Opium War | 7 | 7 → 8 | **The template off: `Began 8 October 1856` / `Ended 24 October 1860` (Morse); Ye Mingchen and the Guangdong saying, Elgin's burning of the Yuanmingyuan aimed at the emperor, the *Qingshi gao*'s chapter on Britain that leaves out the *Arrow*; Wong 1974 ("not fought over opium"); Hummel**. **Pinyin → Dì-èr cì Yāpiàn Zhànzhēng.** Timeline set to the two days. |
| `cnh-568` Self-Strengthening Movement | 7 | 7 → 9 | **Labels naming institutions and places off: `Foreign office 1861` / `Navy yard 1866` / `Study mission 1872 – 1881` / `Fleet sunk 1884`; "Self-Strengthening" told as a later name (Yangwu yundong the usual Chinese term); Feng Guifen's principle, Yung Wing and the Hartford boys, the Fuzhou yard lost within the hour; the *Qingshi gao* juan 136**; "Beiyang lost 1895" (`cnh-570`'s) and the converted 1891 halt dropped. |
| `cnh-569` Empress Dowager Cixi | 8 | 8 → 8 | **The *Qingshi gao* juan 214; the regents arrested with Prince Gong, the nephew chosen against the adoption rule, Katharine Carl's portrait; the navy money told as a charge (Hummel states it; the *Qingshi gao*'s verdict sets her building below a tenth of earlier emperors'); the Art Institute's surcoat**; Kang Youwei's blame (on no page) and Musillo (walled) dropped. Protected: the line stays (flagged below). |
| `cnh-570` First Sino-Japanese War | 7 | 7 → 7 | **The template off: `Began 25 July 1894` / `War declared 1 August 1894` / `Ended 17 April 1895`; the *Qingshi gao* juan 462 (Ding Ruchang at Weihaiwei), the *Kowshing*, Li Hongzhang shot and the treaty ending Korea's tribute (MacMurray); Hail in Hummel, Fukui 2005 [in Japanese], the Office of the Historian**; the casualty figure dropped. Timeline set to the two days. |

Read by eye. **Confusability**: the treaty's terms are `cnh-562`'s alone (out of `cnh-561` and `cnh-557`); the label `cnh-563`'s;
Hong's vision `cnh-565`'s and the war's kings and toll `cnh-564`'s; the Fuzhou yard `cnh-568`'s, the Beiyang fleet's end `cnh-570`'s;
Cixi's phrasings clear of the 1898 coup, the Boxers and the arsenals. No `jp-` card covers the war. **Legend**: Hong Xiuquan's vision
(Hamberg, from Hong Rengan), the navy money (a charge, disputed), the Taiping toll (estimates) are each a text's. **Chinese names
corrected**: `cnh-561` and `cnh-567` pinyin, `cnh-564` 太平天国运动, `cnh-566` 捻军起义. Kept: 自强运动 (Theobald; 洋务运动 the
commoner term — for the owner), 甲午战争 Jiǎwǔ Zhànzhēng (capitalised as the Opium Wars' Zhànzhēng). **Spellings fixed**: "Treaty of
Nanjing" (`cnh-561`, and the glossary); 0 hits after. **Myth register**: Hong's vision confirmed; the Taiping toll corrected (no page
read prints "twenty to thirty million"); the navy money confirmed as a disputed charge. **check-citations**: no mismatch. **Protected
lines: unchanged** (diffed after the apply). For the owner: `cnh-565`'s 1 January 1814 and 11 January 1851; `cnh-569`'s 21 September 1898
(Hummel: 22 September) and its birth and death places on no page read; `cnh-562`'s "Ratified 26 June 1843" is the exchange of
ratifications (the Queen ratified 28 December 1842).

### B58 — `cnh-571`–`cnh-580`, Qing and the early Republic: the Hundred Days' Reform to the Warlord Era (2026-11-14)

Run as B51. Every cited URL answered at the batch's own curl but two known bot walls (the Library of Congress item page on
`cnh-576`, a JSTOR DOI on `cnh-579`); the agents' saved pages stand. **Pictures were not touched.** **The old cards cited the
edicts, the Articles of Favourable Treatment, the Provisional Constitution, the 1947 constitution, Sun Yat-sen's manifesto and will,
Yuan Shikai's oath, the Empire's mandates and the *Qingshi gao* on Chinese Wikisource (up to five texts a card); carried the Boxer
template with a start day and a death figure on no page ("c. 100,000 dead"), a count in a label ("9-year plan", "Six executed"),
places and men in labels ("Wuchang rising", "Sun inaugurated", "Nanjing capital", "Moved to Taipei", "Yunnan revolt"), and told
Yuan Shikai's betrayal of the reformers as fact.** The Qing and Republican cards read the *Qingshi gao* (juan 25, 464) on zggdwx.com,
or one Chinese article (Wei 2024, Suo Liangzhu), beside the treaty and state-paper series (FRUS, the *China Year Book*).

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-571` Hundred Days' Reform | 7 | 7 → 8 | **"Six executed" (a count) → `Executions 28 September 1898`, with `First decree 11 June 1898` / `Coup 21 September 1898`; the *Qingshi gao* juan 464; Tan Sitong's refusal to flee and the Six Gentlemen; Yuan Shikai's betrayal told as the reformers' and most foreign historians' account against his own (Morse: "with some reserve"); Kwong 1984 and 2000**; 戊戌变法 noted as the commoner name. |
| `cnh-572` Boxer Rebellion | 8 | 8 → 10 | **The template off: `Began 1899` / `Siege 20 June – 14 August 1900` / `Protocol 7 September 1901`; the deaths each Klein's or the State Department historians'; the invulnerability as a missionary's account (Smith 1901); the south kept out by Liu Kunyi and Zhang Zhidong; the 450 million taels the envoys' demand (Root's 1907 letter) and the remission and the students (FRUS)**. No `us-` card covers the indemnity. Timeline set to 1899 – 1901. |
| `cnh-573` Late Qing reforms | 6 | 8 → 8 | **"9-year plan" (a count) off: `Reform edict 29 January 1901` (the de Bary–Lufrano translation) / `Exams abolished 1905` (agrees with `cnh-348`, `cnh-427`) / `Programme 27 August 1908` / `Cabinet named 8 May 1911`; the edict's charge against habit and mediocrity, the bomb at the commissioners' departure, the gentry's petitions rebuffed**; "two months" and "three bonds" (on no page) dropped. Timeline set to 1901 – 1911. |
| `cnh-574` Xinhai Revolution | 7 | 8 → 7 | **Labels naming places and men off: `Began 10 October 1911` / `Republic founded 1 January 1912` / `Abdication 12 February 1912` (Morse's 11 October in prose); the *Qingshi gao* juan 25 quoting the edict; the Wuchang mutiny, the Railway Protection Movement, Li Yuanhong, the Tongmenghui; the cyclical-year name**; the "60-year cycle" sentence and Mongolia dropped. |
| `cnh-575` Sun Yat-sen | 7 | 8 → 9 | **Two Wikisource texts replaced; the London kidnapping "by his own account" (*Kidnapped in London*, 1897: 11 – 23 October 1896) and Cantlie; the sixteen lectures with the sword cane; the Revive China Society founded in Hawaii**; Morse (1867, "ten days") dropped. **Name: 孙中山 kept** (the modern Sun Yat-sen University and the Taipei memorial hall; 孙逸仙 is "Yat-sen" in Chinese). Protected: the line stays (flagged below). |
| `cnh-576` Puyi | 8 | 8 → 10 | **Four Wikisource texts replaced; the *Qingshi gao* juan 25; the twelve days' restoration under Zhang Xun, regent designate at Changchun, Reginald Johnston; the abdication in one sentence, the 1924 escort out (`cnh-512`'s clue) in prose only; Kuzmin and Dmitriev on the restoration**. Protected: the line stays (flagged below). |
| `cnh-577` Republic of China | 8 | 8 → 8 | **"Nanjing capital" and "Moved to Taipei" (places) off: `Proclaimed 1 January 1912` / `Constitution 1 January 1947` / `Government moved December 1949`; five Wikisource texts replaced by the *Qingshi gao* juan 25, the 1912 Provisional Constitution's English text (*AJIL*) and the 1947 constitution (the Ministry of Justice); the year count from the founding, the twenty-two provinces, the move to Taipei**; the Beiyang and Nationalist governments and the later ROC kept to prose. |
| `cnh-578` Yuan Shikai | 7 | 8 → 8 | **Three Wikisource texts replaced by the *Qingshi gao*, Hummel 1944 and McCord 1993; eight years in Seoul, the "ailing foot" and the recall, Song Jiaoren's murder (20 March 1913, McCord); the 1898 part told as Hummel tells it ("generally believed")**; Couling (1860) and Reinsch dropped; the Empire of China out of the phrasings. Protected: the line stays (flagged below). |
| `cnh-579` Empire of China | 6 | 8 → 7 | **"Yunnan revolt" (a place) → `Revolt began December 1915`, with `Votes counted 11 December 1915` / `Throne accepted 12 December 1915` / `Cancelled 22 March 1916` (the *China Year Book* 1916, Putnam Weale); the Yunnan telegrams, the order to burn the vote telegrams, the Hongxian calendar; Wei 2024 [in Chinese]; Goodnow in prose only (FRUS)**; a FRUS document that never carried its claim and Cai E's house watch dropped. |
| `cnh-580` Warlord Era | 7 | 7 → 7 | **Told as a later label (junfa a 1910s word modelled on the Japanese gunbatsu, Yu Shen); `Began 1916` / `Clique wars 1920 – 1924` / `Ended 1928` kept, McCord's textbook end of 1926 in prose; the "caged birds" governor, the nine million dollars, the cliques and Zhang Zuolin the bandit**. **Name → 北洋军阀统治时期 Běiyáng jūnfá tǒngzhì shíqī** (军阀 alone means "warlord"). |

Read by eye. **Confusability**: the 1898 coup is `cnh-571`'s, told on `cnh-578` only in prose and hedged alike on both; the
abdication is `cnh-535`'s and `cnh-574`'s line row but in no phrasing of `cnh-576`; the Republic's founding `cnh-577`'s, its
Beiyang phase `cnh-581`'s; the Empire's votes and telegrams `cnh-579`'s, Yuan's life `cnh-578`'s. **Legend**: the London kidnapping
(Sun's own account), the Boxers' invulnerability (a missionary's), Yuan's betrayal (the reformers' against his own) are each a text's.
**Chinese names corrected**: `cnh-580` 北洋军阀统治时期. Kept: 义和团 (义和团运动 on no page that would open), 百日维新 (戊戌变法 the
commoner name), 孙中山 — for the owner. **Spellings**: two checker hits are names as printed in cited titles ("Sun Yat Sen" on the 1897
title page; "Hsieh Chieh-shih" in FRUS). **Myth register**: Sun's London kidnapping confirmed (his own book); the Boxers' invulnerability
confirmed as a set of tellings; Yuan and the Hundred Days refined (the reformers' and foreign historians' version against Yuan's own
account; his diary on no page read). **check-citations**: one false alarm — `cnh-576`'s "Sergei Kuzmin" (Crossref: "Sergius").
**Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-575`'s 12 November 1866 on no page read and its presidency's
10 March 1912 (Yuan Shikai's inauguration day); `cnh-576`'s days and places on no page read; `cnh-578`'s 2 January 1909 (Tenney: 1 January)
and Beijing as the death place on no page read.

### B59 — `cnh-581`–`cnh-590`, the early Republic: the Beiyang government to the First National Congress (2026-11-14)

Run as B51. Every cited URL answered at the batch's own curl but four Library of Congress pages (`cnh-582`, `cnh-588`), which
wall curl and were read through the same URLs' JSON and text service. **Pictures were not touched.** **The old cards cited the
constitutions, the Twenty-One Demands' text, the Washington treaty, Chen Duxiu's "Call to Youth", Hu Shi's 1917 essay and *A
Madman's Diary* on Chinese Wikisource; leaned on 1914-1918-online and OpenEdition pages now behind a bot wall (every claim on them
re-sourced or dropped); carried a man, a country and places in labels ("Cao Kun elected", "US recognition", "In Beijing", "Qingdao
taken"); and told Chen as elected the party's secretary in his absence and Hu Shi as Dewey's student (on no page read).** Each card
now reads at most one Chinese text (Ouyang Zhesheng 2020, Li Yilu 2025, Wang on the Washington treaty, Suo Liangzhu, the 12371.cn
congress page, the China News Service), beside FRUS, the Office of the Historian, the *China Year Book*, Tsi C. Wang's 1927 *Youth
Movement* and the National Diet Library.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-581` Beiyang government | 6 | 8 → 8 | **Labels naming a man, a country and a place off: `Governed 1912 – 1928` / `Recognised 2 May 1913` (the Office of the Historian) / `Constitution 10 October 1923`; the army Yuan Shikai trained, Wilson's message to the National Assembly, the five thousand dollars a vote for Cao Kun (the *China Year Book*); the 1917 war decision and the restoration (Wheeler)**; the two constitutions (Wikisource) re-sourced through Tenney's 1915 memorandum. |
| `cnh-582` Chinese Labour Corps | 6 | 7 → 7 | **Every claim re-sourced (the old seven sources behind a bot wall); the recruits each source's count (Bailey's "nearly 140,000"; Ta Chen's 1923 study; the French War Ministry's 36,941; a 1918 report's 175,000), the dead each source's (the Canadian War Museum's 2,000; a 2024 state report's "tens of thousands"); the tea-house recruiters and the brass bracelets, the move to the army areas after China declared war; the *Athos* (the *Evening Star*, 1917)**; Noyelles dropped (its open page shows a title only). A phrasing's "four hundred and seventy-six" made "just under five hundred" after the apply. |
| `cnh-583` Twenty-One Demands | 7 | 9 → 8 | **Every claim re-sourced; the night meeting and the dreadnought watermark, the jeweller's-shop simile (Reinsch's telling), the ultimatum setting the fifth group aside; FRUS 1915, the National Diet Library, Naraoka [in Japanese], Zang [in Chinese]; the humiliation day "the day of acceptance" (not "7 or 9 May")**; Wellington Koo's leak (its one source unreachable) dropped. |
| `cnh-584` Shandong Problem | 6 | 7 → 8 | **"Qingdao taken 7 November 1914" (a place; the day only in an uncited telegram) → `Leasehold taken November 1914`, with `Peace ruling 30 April 1919` / `Treaty signed 4 February 1922` / `In force 2 June 1922`; the Washington treaty from FRUS 1922; the promise to Wilson of full sovereignty, the Jinan railway paid in treasury notes; "the Council of Four" made the three present on 30 April; the 1897 occupation made the 1898 lease**. Timeline set to 1914 – 1922. |
| `cnh-585` May Fourth Movement | 7 | 7 → 7 | **`Began 4 May 1919` / `Dismissals 10 June 1919` / `Treaty unsigned 28 June 1919`; the slogans as a student's account gives them (Wang 1927) with 还我青岛 from the police files (Ouyang 2020 [in Chinese]); the 3,000 as the police chief's report; the jailed students' four demands, the Shanghai shutdown and the "single spark" telegram (FRUS); Ciaudo 2021**. Timeline set to 4 May – 28 June 1919. |
| `cnh-586` New Culture Movement | 6 | 7 → 6 | **Told as a later label (coined in the summer of 1919, one study's finding); `First issue 15 September 1915` / `Literary reform January 1917` / `Term coined 1919`; *La Jeunesse* and the six editors, the vernacular textbooks order; Li Yilu 2025 [in Chinese], Forster 2017, the SEP**; "Madman's Diary April 1918" (a title, `cnh-589`'s) off the line; the phrasings name no person (`cnh-587`–`589`'s ground). |
| `cnh-587` Chen Duxiu | 6 | 8 → 7 | **Wikisource and Bisson gone; the "dynamo" of the youth movement (Wang), the 1929 appeal to party comrades admitting Stalin's and the Comintern's line, the three conditions refused (The Militant, the MIA glossary, Elstein in the SEP)**; "elected secretary in his absence" (on no page) and the expulsion year dropped; the "Call to Youth" (`cnh-586`'s clue) and "too busy to attend" (`cnh-590`'s) out of the phrasings. Protected: the line stays. |
| `cnh-588` Hu Shi | 6 | 7 → 9 | **The 1917 essay told through Wang 1927; Cornell and the Columbia dissertation, the recall from Washington (FRUS 1942 — 1942 now in the background), the mainland campaign over the *Dream of the Red Chamber*; Hirata and Shino, the 1938 credentials photograph (the Library of Congress), the 1962 obituary**; "studied under Dewey" and the 1946 and 1948 claims (on no page) dropped. Protected: the line stays (flagged below). |
| `cnh-589` Lu Xun | 7 | 7 → 7 | **The Sendai slide "by the account in his own preface" (1922), with the doubts (Takeuchi; the Fujino memoir's shooting; Suo's report that the slides were found but not that one); the iron house, the League of Left-Wing Writers and the arrest order; *A Madman's Diary* from the Marxists Internet Archive; Robins 2007, Cheng and Akiyoshi 2025**; Barral (walled) dropped. Protected: the line stays (flagged below). |
| `cnh-590` First National Congress of the CCP | 6 | 6 → 6 | **`Opened 23 July 1921` / `Closed c. 31 July 1921` / `Anniversary set 1941` kept (no page prints 1 or 2 August); Saich 1985 re-read in full: the intruder and the police search, the boat on South Lake, Maring and Nikolsky; the delegates as twelve or thirteen, each count whose; the July anniversary chosen because no one recalled the day; Jaivin 2021**; Jin Chongji dropped (one Chinese source). Two phrasings reworded before the apply (the answer's own words). |

Read by eye. **Confusability**: the Beiyang presidency `cnh-581`'s, the cliques `cnh-580`'s; the demands' delivery and the ultimatum
`cnh-583`'s, the Paris ruling and the Washington treaty `cnh-584`'s, the students `cnh-585`'s; the label and *New Youth* as a
magazine `cnh-586`'s, Chen's appeal `cnh-587`'s, Hu's dissertation `cnh-588`'s, the Sendai slide `cnh-589`'s; Chen's absence from the
congress left to `cnh-590`. **Legend**: the Sendai slide (his own preface; doubted), Reinsch's watermark and simile, the May Fourth
slogans (a student's account) are each a text's. **Chinese names**: none corrected; kept unconfirmed 中国劳工旅 (a 2024 report uses
it), 山东问题's traditional form (OpenCC's, no traditional page read). **Spellings fixed**: none needed. **Myth register**: the May Fourth slogans confirmed in
part ("Mr Democracy and Mr Science" Chen's, *New Youth* January 1919; 外争国权，内惩国贼 on no page read); the Sendai slide confirmed
(the preface dated 3 December 1922; the slide never found). **check-citations**: one false alarm — `cnh-582`'s "Live Yu-Sion" (Crossref
in the other order). **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-588`'s 29 October 1938 (the Library of
Congress caption: 28 October); `cnh-589`'s days and Shanghai on no page read; `cnh-590`'s Russian report returned in 1957 (Saich) or 1959
(Jin). The glossary alias "yuan" (on `Yuan_dynasty`) may link the currency and the five yuan on `cnh-597`.

### B60 — `cnh-591`–`cnh-600`, the early Republic: the First United Front to the Shanghai International Settlement (2026-11-14)

Run as B51. Every cited URL answered at the batch's own curl. **Pictures were not touched.** **The old cards cited the Sun–Joffe
statement, the Kuomintang manifestos, Sun's Whampoa address, Chiang Kai-shek's speeches, the organic laws and the 1931 provisional
constitution on Chinese Wikisource, and three archive.org uploads of books possibly in copyright (Tong, Linebarger, Bisson); carried
names, places and counts in labels and values ("Sun–Joffe", "KMT congress", "Baoshan Road", "Founded 1 July 1925, Guangzhou",
"Five yuan", "One-party rule from 1928", "1842, Treaty of Nanjing", "Peak 1932", "Population 1,040,780 Chinese residents"); and gave
the Northern Expedition the war template and the Shanghai massacre a "300+ killed" from an account no allowed host opens.** Each card
reads at most one Chinese text (the Sun Yat-sen Memorial Hall's *Guofu quanji*, the Kuomintang's own chronology, Chen Ganlin 2024,
Wang and Gao 2025, a mainland name page), beside Isaacs, Jordan, Eastman, Lary, FRUS and the Office of the Historian.

| card | bar | sources | the main changes |
|---|---|---|---|
| `cnh-591` First United Front | 7 | 8 → 7 | **"Sun–Joffe" and "KMT congress" → `Joint statement 26 January 1923` / `Party congress January 1924` / `Broke April – July 1927`; the statement through Isaacs's quotation; the West Lake meeting and Maring's question as Chen Duxiu told it, membership from about two thousand to nearly fifty-eight thousand, the Wuhan order; Theobald**; Mao's "first" co-operation, Guangzhou as the congress's seat and "a 1938 history blamed Stalin" (that history is Isaacs) dropped. |
| `cnh-592` Whampoa Military Academy | 7 | 7 → 7 | **`Founding voted January 1924` / `Opened 16 June 1924` (the Memorial Hall's text of Sun's address) / `First action October 1924` / `First campaign 1925`; the army the revolution never had, the cadets' rival leagues, the Merchants' Volunteers disarmed; Isaacs; the formal name in prose**; Chiang's 1925 roster preface and its casualty claim dropped; "Galen" kept out (the glossary's Galen is the physician). |
| `cnh-593` Chiang Kai-shek | 8 | 9 → 8 | **All three phrasings new (the old ones Whampoa's, the Xi'an Incident's and `cnh-609`'s): the secret Methodist baptism, the New Life Movement putting tobacco before opium (an American envoy's remark), the 1945 broadcast read as repaying injury with kindness; the Memorial Hall, FRUS 1930 and 1934, Jordan 1976**; Tong and Linebarger (uploads) and "Baoding" (on no page) dropped. **Name: 蒋介石 kept** (the mainland form; 蔣中正 an alias). Protected: the line stays (flagged below). |
| `cnh-594` Northern Expedition | 7 | 7 → 7 | **The template off: `Began 9 July 1926` / `Ended 29 December 1928` (Jordan); the Socony Hill rescue at Nanjing, Chiang's cease-fire at Jinan, the fifteen Soviet planners and the political workers ahead of the armies**; "General Galen" (a glossary trap) and Zhang Zuolin's flight (`cnh-581`'s) dropped. Timeline set to the two days. |
| `cnh-595` Shanghai massacre | 7 | 8 → 7 | **"Baoshan Road 13 April 1927" (a place) and its "300+ killed" (the account on no allowed host) off: `Coup 12 April 1927`; the gunmen in blue denim with "labour" armbands, Bai Chongxi's soldiers; the toll each source's (foreign reports about fifteen, a Chinese reporter's five soldiers and a score of pickets, Eastman's "several thousand"); the PRC chronicle's "counter-revolutionary coup" (the state's account) beside the Nationalists' "purifying the party"**. Timeline set to 12 April 1927. |
| `cnh-596` Nanjing decade | 6 | 8 → 8 | **Told as a later label counted both ways: `Dated 1927 – 1937` (Eastman) / `Also dated 1928 – 1937` (Lary); tariff autonomy from twelve powers, the wars on the Guangxi generals, Yan Xishan, Feng Yuxiang and the Jiangxi soviets, the "despair" of one history; the New Life Movement undated**; the old dated rows (Wikisource speeches) and 10 October 1928 (`cnh-597`'s) dropped; fabi dropped. Timeline set to 1927 – 1937. |
| `cnh-597` Nationalist government | 7 | 8 → 8 | **"Founded 1 July 1925, Guangzhou" and "Five yuan" off: `Founded 1 July 1925` / `Reorganised 10 October 1928` / `Tutelage ended 25 December 1947`; Wang Jingwei's Guangzhou council, the English title changed at Nanjing, recognition through the tariff treaty (the Office of the Historian, FRUS); Tyau 1930, Nedostup and Liang 2001; Keim [in French]**; "8 October 1928" (FRUS: 3 or 4 October) out of the line. |
| `cnh-598` Kuomintang | 8 | 8 → 8 | **"One-party rule from 1928" off: `Founded 25 August 1912` / `Renamed 10 October 1919` (the party's date, not 1920) / `Reorganised 20 January 1924` / `Tutelage began 3 October 1928`; the alliance made an open party with Song Jiaoren as acting chairman, the Chinese Revolutionary Party renamed, the Leninist political departments; the party's own chronology [in Chinese], Iwao [in French]**; "merged with five groups" and the unequal-treaty claims dropped; a phrasing that gave the name's meaning reworded before the apply. |
| `cnh-599` treaty port | 7 | 8 → 8 | **"1842, Treaty of Nanjing" → `First treaty 1842` / `Factory right 1895` / `Rights given up 1943`; Hart's Maritime Customs, the concessions, extraterritoriality "won by two wars and treaties with seventeen powers"; the China Year Book's 49 customs stations in prose; Chen Ganlin 2024 [in Chinese]**; the five Nanking ports (`cnh-562`'s) out of the phrasings; "Treaty of Nanking" throughout. |
| `cnh-600` Shanghai International Settlement | 7 | 8 → 7 | **Words, a non-date and a count off: `Formed 1863` / `Rights given up 11 January 1943`; the Municipal Council and its ratepayers, the Mixed Court, the park sign told as alleged with its wording disputed; the council's 1925 census in prose (Pott); Wang and Gao 2025 [in Chinese], Xiao-Planes [in French], Bickers and Wasserstrom 1995**; the end in 1945 left out (on no page read). |

Read by eye. **Confusability**: the united front's making and breaking `cnh-591`'s, the academy's cadets `cnh-592`'s, Chiang's own life
`cnh-593`'s, the march north `cnh-594`'s, the coup `cnh-595`'s, the decade `cnh-596`'s, the government's founding and title `cnh-597`'s,
the party's renamings `cnh-598`'s; the five ports and the "unequal treaty" label stay `cnh-562`'s and `cnh-563`'s. **Legend**: the
Shanghai toll (each witness's), the park sign (alleged), the "golden decade" (on no page read) are each said so. **Chinese names**: none
corrected; kept unconfirmed 南京十年 (黄金十年 on no page that would open), 四一二政变 (the PRC's fuller name its "counter-revolutionary
coup") — for the owner. **Spellings fixed**: "Treaty of Nanjing" (`cnh-599`); 0 hits after. **Myth register**: no row touched.
**check-citations**: no mismatch. **Protected lines: unchanged** (diffed after the apply). For the owner: `cnh-593`'s 31 October 1887,
Xikou and its death day and Taipei on no page read. The glossary keys "Galen" (the physician) and "yuan" (the dynasty) would mislink on
these cards and were kept out where they could be.

### The sixth hundred, in sum

`cnh-501`–`cnh-600` (the end of the Yuan, the Ming, the Qing and the early Republic to 1928) are done: 726 sources became 723 and 83
glossary entries were rewritten. `cnh-audit.js --range=cnh-501:cnh-600` reads 87 of 100 cards with nothing but a missing picture;
what remains is 100 cards with no picture (no picture pass was run — Commons answered the session's one test call, the question went
to the owner and pictures stayed paused), 10 advisory `W.not-why`, 4 `L.missing` (`cnh-517` the Tumu Crisis, `cnh-518` the Ming Great
Wall, the states `cnh-547` and `cnh-597`) and 3 `Z.reading?` that are polyphones (靖难 jìngnàn, 汗国 hánguó, 戛 gā). No `Q.sibling`.
`check-cnh-spellings.js` reads 4 hits over the hundred, each a name as a cited source prints it ("Hsia" an author, "Sun Yat Sen" an
1897 title page, "Chieh" in a FRUS name). Fifty agents worked two cards each, never more than ten at once; as each draft came back its
clues went into `AGENT.md`, and the drafts after it were told whose clue was whose. Each batch was applied alone, verified field by
field against its drafts, diffed for the protected lines and committed with its docs; `origin/main` was merged after B54 and again
before the PR.

What the hundred found, again and again:
- **The histories and the state papers cited on Chinese Wikisource.** Nearly every card cited two to five texts there — the *Mingshi*,
  the *Qingshi gao*, the *Mingshi jishi benmo*, the *Huang Ming zuxun*, edicts, treaties, constitutions, manifestos, Sun Yat-sen's will.
  The Ming cards now read the *Mingshi* in the Siku edition on the Kanseki Repository (KR2a0038); the Qing cards the *Qingshi gao* on
  zggdwx.com, said to be the Draft History of Qing (1928), unfinished and contested; the treaties come from Mayers, MacMurray and FRUS;
  the Republic's papers from FRUS, the Office of the Historian and the *China Year Book*.
- **The war template with casualty figures no page prints.** "Over 1,130,000 dead" (Imjin), "12,329 killed or drowned" (two of Shi
  Lang's claims added together), "c. 100,000 rebels killed" (White Lotus), "c. 3,187 killed, 4,991 wounded", "c. 20,000,000 –
  100,000,000 dead" (Taiping), "c. 52,069 casualties", "c. 100,000 dead" (Boxers): every one is off the line, and the figures a source
  does give are told in prose as that source's.
- **Conversions and dates on no page.** The Jingnan days, "the twelfth month of 1371", the imperial porcelain orders of 1591 and 1610,
  "late in 1623", the Grand Council's "1729 or 1732", the White Lotus and Boxer start days, Kraak ware to 1650: each dropped or replaced
  by a year a page prints. One drafted span derived from "after 1620" (`cnh-547`) was dropped by the reviewer.
- **Labels naming men, places, institutions and counts.** "Hu executed", "Lan Yu case", "Xavier died", "Took Beijing", "Albazin taken",
  "Lhasa riot", "At Lintin", "Zongli Yamen", "Sun–Joffe", "9-year plan", "Six executed", "Five yuan", "Population 1,040,780": all now
  dates only.
- **Modern labels told as period fact.** The tributary system, the Canton System, the unequal treaty, Self-Strengthening, the Warlord Era,
  the New Culture Movement, the Nanjing decade and the Southern Ming are now each said to be a later name, with who used it where a page
  says so.
- **Uploads of books in copyright.** Goodrich's *Literary Inquisition*, Liang Fang-chung's single-whip study, Tong and Linebarger on
  Chiang, Bisson: every citation of an archive.org user upload of an in-copyright book is gone.

**The Chinese name.** Corrected: `cnh-503` Míng cháo, `cnh-535` Qīng cháo, `cnh-539` Nán Míng (the house split); `cnh-507`
Zhōngshūshěng and `cnh-522` yītiáobiānfǎ (joined, as `cnh-381`; Theobald splits the second — for the owner); `cnh-509` 靖难之役,
`cnh-519` 朝贡体系, `cnh-526` 耶稣会中国传教团, `cnh-548` 办事大臣, `cnh-564` 太平天国运动, `cnh-566` 捻军起义, `cnh-580`
北洋军阀统治时期; `cnh-547` Hánguó; `cnh-561` and `cnh-567` Dì-yī cì / Dì-èr cì; `cnh-536`'s apostrophe. Kept unconfirmed for want of a
page printing the compound, for the owner: 红巾, 胡惟庸案, 洪武帝, 永乐帝, 洪熙帝, 郑和下西洋, 东林党, 崇祯帝, 扬州十日, 澎湖海战, 准噶尔汗国,
一口通商, 鸦片贸易, 壬辰倭乱 (万历朝鲜战争 on no page that would open), 自强运动 (洋务运动 the commoner term), 义和团, 百日维新 (戊戌变法 the
commoner term), 中国劳工旅, 南京十年 (黄金十年 on no page), 四一二政变. 孙中山 and 蒋介石 kept as the modern mainland forms. **Spellings**:
rows added for the Ming emperors and institutions, Zheng He and the wokou, the late Ming, the Qing conquest and the high Qing, the Canton
trade and the Opium Wars (the Treaty of Nanking by its English title), the Taiping and the Self-Strengthening men, the Boxers and the
reformers, the Republic (Sun Yat-sen and Chiang Kai-shek the English names; Kuomintang the slug's form) and the May Fourth writers (Hu
Shi in the card's voice); "Treaty of Nanjing", "Khubilai" and "Co-hong" were caught and fixed; "Yangzi" never appeared.

**The myth register** gained twenty-two rows at the start, each confirmed or corrected by the batch that drafted its card (the rows
say which): the Hu Weiyong dead, the Yongle Encyclopedia's date, the Macartney kneeling and the edict's context, Lin Zexu's letter and
the Taiping toll corrected; the beggar monk, the Jianwen escape, Zheng He's ships, Tumu, Coal Hill, Hong Xiuquan's vision, the London
kidnapping and the Sendai slide confirmed; Chen Yuanyuan, the Yangzhou dead, the navy money, the Boxers' invulnerability, Yuan Shikai and
the Hundred Days, and the May Fourth slogans confirmed in part or as tellings. The mooncake rising and Ricci's memory palace were told
nowhere.

**The protected cards** (`cnh-504`, `510`, `514`, `516`, `527`, `528`, `532`–`534`, `536`, `538`, `540`, `545`, `549`, `551`, `554`,
`555`, `560`, `565`, `569`, `575`, `576`, `578`, `587`–`589`, `593`) kept their `answerDate`, `undatable` and `timeline` byte for byte
through every apply and the merges of main. Every background now carries the years on its card's line. Rows flagged for the owner, left
as they stand (details in each batch): rows that look wrong — `cnh-532`'s 12 December 1627 (Kennedy: sent away 8 December, the arrest
five days later), `cnh-545`'s 5 February 1661 (his father's death day; proclaimed 17 February) and "Old Summer Palace" (the Changchun
yuan), `cnh-560`'s 3 October 1840 (dismissed 28 September) and Puning (Chaozhou), `cnh-569`'s 21 September 1898 (Hummel: 22 September),
`cnh-575`'s 10 March 1912 (Yuan Shikai's inauguration day), `cnh-578`'s 2 January 1909 (Tenney: 1 January), `cnh-588`'s 29 October 1938
(the Library of Congress caption: 28 October), `cnh-538`'s two days (Cordier a day later); years and places on no page read —
`cnh-533`'s 1606 day (Tu: "Oct. 3, 1605?"), `cnh-510`'s Nanjing birthplace (disputed), `cnh-514`'s Kunming, `cnh-540`'s Yenden; and the
days on the person template, nearly all on no page read.

**For the owner, outside the hundred**: the glossary keys and aliases "Liu Song" (`Liu_Song_dynasty`), "yuan" and "Yuan"
(`Yuan_dynasty`), "Galen" (the physician), "Flint" (the stone), "New Policies" (the Song reforms) and "Shun" (the sage king) would mislink
on these cards; each card kept clear of them where it could. The house capitalisation of an event's pinyin (Xīnhài Gémìng, Jiǎwǔ
Zhànzhēng against lower-case yùndòng) is not settled.

### Locators (2026-11-14, the sixth hundred)

**No locator was added.** The Wikipedia API answered the session's one test call with a rate-limit page, so `add-locators.js` was not
run and `migrate-places.js` was not touched. Still waiting from earlier hundreds: `cnh-080` Xibeigang, `cnh-203` the Qin Straight Road,
`cnh-365` Yinshan, `cnh-455` Quanzhou, `cnh-461` Tangdao, `cnh-470` Haoshuichuan, `cnh-476` Hubudagang, `cnh-482` Caizhou (Runan
County). In this hundred `cnh-517` the Tumu Crisis has no point (the Tumu fortress near Huailai would be the site); `cnh-518` the Ming
Great Wall, and the states `cnh-547` and `cnh-597`, have no single place to stand. Points to review, as the drafts read them: `cnh-592`
Whampoa points at central Guangzhou, not the academy on Changzhou Island; `cnh-525` Kraak ware is Jingdezhen (a ware, not a site);
`cnh-526` the Jesuit missions is Zhaoqing (the first residence); `cnh-582` the Labour Corps is the Chinese cemetery at Nolette;
`cnh-515` the treasure voyages is Changle. `migrate-places.js --check` and `build-wars.js --check` were not re-run; on main they already
report known failures.
