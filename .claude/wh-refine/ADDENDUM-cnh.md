# ADDENDUM — the China run (cnh-). Read AFTER BRIEF.md; where they differ, THIS wins.

## The run
- Prefix `cnh-`; the cards are China (`china`), plan `docs/china-card-plan.md` (read the line for your card,
  its deck heading, and "Names, dates and romanisation", "Sourcing", "History, not archaeology"). Rules:
  `docs/china-refinement-audit.md` "The rules" (read it — protected lines, the Chinese name, spellings) and its
  "Myth register"; `docs/china-chronology.md` "Conventions" and "Spellings" (read both).
- EVERY harness call carries the prefix: `REFINE_PREFIX=cnh- WH_S=$S node .claude/wh-refine/precheck.js cnh-NNN`.
  Without `REFINE_PREFIX=cnh-` precheck runs the World History audit and is wrong.
- `$S/index.tsv` lists all 1000 `cnh-` cards (id, answer, question) for sibling checks.
- The card's original findings: `docs/china-card-findings.md`, the section `## cnh-NNN` (grep for it; read only
  it) — trust none of its claims without re-reading, but use its host notes.
- You draft only. Never write under /home/user/folio; never run add-card.js, add-glossary.js or any other repo
  writer (precheck runs add-card.js --dry-run for you); never git.

## PROTECTED date lines (refined in another thread — leave them alone)
cnh-007 Yellow Emperor, 008 Chiyou, 010 Yao, 011 Shun, 012 Yu the Great, 014 Houyi, 016 Kuafu, 039 Guandi,
055 Shaokang, 057 Qi of Xia, 058 Jie of Xia, 068 Tang of Shang, 073 Wu Ding, 074 Fu Hao.
- The patch must NOT contain `answerDate`, `undatable` or `timeline` (precheck fails it).
- Give `"pins"` and `"chronology"` from the line AS IT STANDS in cur/<id>.json.
- The lines deliberately carry counts, ages and notes ("70 years…", "First of: 31 Shang kings", "(age N)"):
  never "fix" them. But the BACKGROUND must carry every year on the line with the same digits and must not
  contradict any row. If a row looks wrong, say so in `notes` ("protected row: … looks wrong because …") for the
  owner, and leave it.

## The Chinese name (the answer bubble) — on EVERY card
- `hanzi` (simplified), `traditional` (filled on every card; identical to `hanzi` where the two scripts agree —
  the renderer then shows one line), `pinyin` with tone marks; `translations` stays `""` (set it to `""` in the
  patch if the card carries anything else there).
- Check: the characters name the ANSWER TERM itself (not a description or the plan line's essay title), against
  an open source you save as a page (ctext.org, a museum record, a Chinese-language article); simplified and
  traditional are each correct and the same word; the pinyin matches syllable by syllable with citation tones
  (third-tone and yi/bu changes unmarked), standard word division, a capital on proper nouns, the apostrophe
  before a, o, e inside a word (Chang'e). Joined or split as `docs/china-chronology.md` "Spellings" says
  (Shānhǎijīng, Hòuyì).
- A wrong name: correct `hanzi` / `traditional` / `pinyin` in the patch and say in `notes` what was wrong and
  which saved page confirms the fix. A right name: leave the fields out of the patch and say "name: checked
  against <page>".
- precheck runs `Z.none`, `Z.pinyin`; with NODE_PATH set (below) also `Z.trad` and the lead `Z.reading?`
  (a polyphone may trip it — judge by eye).

## House spellings
- Pinyin in prose, WITHOUT tone marks (they go only in the `pinyin` field); ü kept (Nüwa, Zhinü, Lüshi
  Chunqiu); the house form for every name in `docs/china-chronology.md` "Spellings" (Houyi, Kuafu, Zuo Zhuan,
  Shanhaijing, Shangshu, Taikang, Shaokang …). English names first where the table says so (Yellow Emperor,
  Queen Mother of the West, Book of Documents).
- A 19th-century translation is cited as printed (Legge's *Shû King*), and quoted as printed inside quotation
  marks, but the card's own voice uses the house form.
- Check your draft: `node .claude/check-cnh-spellings.js --drafts=$S/out cnh-NNN` (from the repo root).
- A glossary draft keeps its slug; a variant goes into `aliases`, never into the description.

## Myth register (docs/china-refinement-audit.md)
- Tell each story the way its register row does: the same version named the same way, the same earliest
  source and its date, the same character names, the same hedging ("the *Huainanzi* tells…", never the card's
  own voice). If you tell a different version, say it is one version and name its source.
- The rows are PROVISIONAL: if your research confirms or corrects a row's earliest attestation, say so in
  `notes` as "register: <story>: <attestation and date> (source N)" — the owner updates the register.

## What China adds (hunt these first)
1. **Myth and legend told as history.** The sage kings, the Xia's kings, Pangu, Nüwa, Fuxi, Shennong, the
   Yellow Emperor, Yu and the flood are what late texts report (the *Shiji*, c. 100 BCE; the *Shangshu*; the
   *Bamboo Annals*, disputed transmission; the *Shanhaijing*; the *Huainanzi*). The card says so in its own
   voice and says when each story is first attested. Archaeology (Erlitou, Taosi, Shimao, Liangzhu) is stated
   separately and never "proves" the Xia.
2. **A transmitted text is evidence of when it was written** — never the *Shiji* as a record of the Shang
   court; never the *Shangshu*'s chapters as Western Zhou documents without saying which are held genuine.
3. **A legendary date is labelled** (non-protected cards): `Traditional`, with whose reckoning in prose; 2070
   BCE is the Xia–Shang–Zhou Chronology Project's figure and contested; Shang reigns before Wu Ding are not
   fixed. Never "after 2070 BCE"; never a regnal year converted by you.
4. **A modern label as ancient fact**: "Xia culture" for Erlitou; the Three Sovereigns' list; the type-site
   names (Yangshao, Longshan, Liangzhu are modern labels); "taotie" for the Shang motif (a later name);
   "oracle bones" as a Shang term; the "Chinese dragon" as one creature.
5. **A date belonging to another event**: an excavation year as a site's age; one site's radiocarbon dates
   for a whole culture; 1899 (the oracle bones' identification) as their date.
6. **A figure no source gives**: site areas, populations, Liangzhu's dam volumes, oracle-bone counts,
   sacrifice totals, bronze weights. Modern estimates with a range and whose they are.
- Oracle bones, bronze inscriptions, excavated objects are contemporary evidence: cite the corpus or the
  museum record a reader can open, never a dealer.

## Date line (non-protected cards; on top of BRIEF)
- Only dates: no counts, no "before/after/from/to" values. Labels ≤ 16 characters naming NO place and NO man
  ("Attested", not "In the Huainanzi"; "Traditional", not "Sima Qian's date"). A myth, a motif, a text or a
  concept is dated by its own attestation or making, never by another man's act. A disputed date: two rows
  `Dated` / `Also dated` — never `Or`. A century as its span (`c. 300 – 200 BCE`); never a decade.
- A large figure in prose reads as a year to the checkers ("about 1,500 graves" is fine with the comma; a
  bare "1500 graves" is read as a year): keep the comma in figures over 999 that are not years.
- Give `"pins"` only figures that are ON the date line, e.g. `"1600; 1046"`.

## Sources (on top of BRIEF)
- An ancient TEXT (the *Shiji*, *Shangshu*, *Shanhaijing*, *Zuo Zhuan*, *Huainanzi*, *Liezi*, *Chuci* …) in at
  most 2 sources (3 only on a card about that text); at least HALF modern scholarship (a museum or university
  page counts as modern); a modern author in at most 2.
- One source per non-English language, chipped: ` [in French]`, ` [in Chinese]`. A classical text on ctext.org
  in the original Chinese counts as the Chinese one; Legge's English on ctext or archive.org does not. If the cap
  bites, prefer an English review of the same work and say so in notes.
- A book or chapter with a DOI is cited with the YEAR Crossref gives for it.
- Never cite Wikipedia. Never invent a date, name, figure, DOI, URL, page number or author first name.

## Hosts (tested 2026-11-08)
- ANSWER: ctext.org (texts and Legge), archive.org (full text: `https://archive.org/stream/<id>/<id>_djvu.txt`),
  icm.gov.mo (Revista de Cultura PDFs — a CJK PDF needs a ToUnicode-aware extractor; `pdftotext` may do; see the
  head of docs/china-card-findings.md), persee.fr ARTICLE pages (first page only; the PDF is 403 — a claim must
  be on the page you saved), journals.openedition.org, journal.oraltradition.org, muse.jhu.edu (landing pages),
  cambridge.org and brill.com landing pages (abstracts only), jstage.jst.go.jp, sino-platonic.org, dpm.org.cn
  (Palace Museum), chnmuseum.cn, harvardartmuseums.org, clevelandart.org, artic.edu, nature.com, PLOS, Europe PMC
  (full text XML), DOAJ API, Crossref API, BMCR, plato.stanford.edu, worldhistory.org (not scholarship — avoid).
- DO NOT: Wikimedia/Wikipedia/Commons (make NO calls), britishmuseum.org, asia.si.edu (Freer|Sackler),
  princeton.edu, academia.edu, sciencedirect, pnas.org, mdpi.com, oxfordre.com, Britannica, UNESCO (all 403),
  metmuseum.org essays (429), chinaknowledge.de, kaogu.cn, ihp.sinica.edu.tw (no answer), Wayback (down). One
  try per failing host, then pick another source.

## Images — PAUSED
Wikimedia answered 429 this session. Make no Wikimedia calls; OMIT `image` from the patch. In `notes`, one line:
"image: <ok | wrong because …>" judged from the current image in cur/<id>.json.

## Locator
- `"locator": null` in every draft (it KEEPS the card's existing locator). If the card is a site (Jiahu, Banpo,
  Erlitou, Sanxingdui, Yinxu, Xibeigang, the Fu Hao tomb, Zhengzhou Shang City, Panlongcheng) say in notes
  whether its current point is the site (not a modern city or the province) and its label the site, and what
  English Wikipedia article would give it a point. A mythic place gets none.

## Overlapping collections
Read, never edit: `wh-396`–`wh-415` (the Ancient China survey), `gc-` (China Geography), `jp-`/`ko-` cards on
shared myth. `node .claude/wh-refine/related.js "<regex>"` and `--card <id>`. Note disagreements in `notes` as
"overlap: wh-NNN says X; this card says Y because Z".

## Final reply
One short line per card: id, sources old→new, the main correction, the name check, the image note. Under 150 words.
