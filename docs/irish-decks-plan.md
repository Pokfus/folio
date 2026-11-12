# The Irish language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Irish deck in `decks/`.** It is the plan for an Irish
(Gaeilge) set, built in the Swedish decks' shape (`docs/swedish-decks-plan.md`, whose pipeline `.claude/irish/`
adapts); `docs/lang-decks.md` is the record of how every set was built, and every rule there applies here unless
this file says otherwise. Asked for on 2026-11-12: "Add an Irish language collection."

**STATUS (2026-11-12): A1, A2 and B1 are built** (`.claude/irish/`, §6–§8). B2, C1 and a phrases deck are planned (§5).

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump** for
any deck this plan produces. The collection's first commit carried one because it also changed the APP — the
shelf's hue in `app.js` — and the `LANGS` row.

## 1. The decisions (2026-11-12, taken from the Swedish, Hindi and Greek precedent — the owner was not asked)

The request named no levels, so the session followed the Hindi owner's answers, as Swedish did. **Any of these is
the owner's to overrule.**

1. **Word source: CEFR A1–C1, assembled.** Irish has a graded examination at these levels, the **Teastas Eorpach
   na Gaeilge** (TEG, Maynooth University's Centre for Irish Language). Its syllabuses (teg.ie, read 2026-11-12)
   describe each level's topics and functions and carry lists of useful words and phrases that they call not
   exhaustive; those lists are the Centre's copyright and are **not copied**. Each level is a hand-written topic
   inventory (`inventory.py`) scoped to the CEFR global descriptor, topped up with the commonest remaining lemmas;
   the description says so. Sizes, Hindi's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**.
   · **A CHOICE FOR THE OWNER**: asking Maynooth's Centre for Irish Language for permission to use the TEG lists
     would let the decks follow the examination itself.
2. **No alphabet deck and no romanisation.** Irish is written in the Latin alphabet; the fada and the mutations
   are taught by the words and their tables.
3. **The Official Standard** (An Caighdeán Oifigiúil) spellings, as Wiktionary heads them. Dialect forms are
   weak senses and never open a card.

| deck | file | notes |
|---|---|---|
| Irish A1 Beginner — built | `Irish-A1.folio-deck.json` | 500 |
| Irish A2 Elementary — built | `Irish-A2.folio-deck.json` | 750 |
| Irish B1 Intermediate — built | `Irish-B1.folio-deck.json` | 1,000 |
| Irish B2 Upper Intermediate | `Irish-B2.folio-deck.json` | 1,500 |
| Irish C1 Advanced | `Irish-C1.folio-deck.json` | 1,500 |
| Irish Phrases and Expressions | `Irish-Phrases-and-Expressions.folio-deck.json` | — |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms, mutations | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Irish.jsonl`, 112 MB) | CC BY-SA 4.0 |
| the preposition `i` (missing from that extract) | English Wiktionary, page `i/languages A to L`, Irish section, read 2026-11-12 | CC BY-SA 4.0 |
| frequency (counts only; no text ships) | the Irish Wikipedia, `gawiki-20261101-pages-articles.xml.bz2` (64,556 articles, 9.6 M tokens), pinned | CC BY-SA 4.0 |
| example sentences | Tatoeba `gle` exports (2,451 Irish–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | Wikipedia's infobox, read 2026-11-12: L1 "unknown"; 115,525 daily speakers outside education (Republic 2022 + NI 2021) as `l1`; 2.1 million who say they can speak it (1,873,997 + 228,600) as `total` | — |

Checked and unusable: hermitdave/FrequencyWords has no Irish list (404 for `2018/ga` and `2016/ga`).

## 3. The card

One note, two templates (Irish → English, English → Irish), `speechLang: 'ga-IE'` (few devices have an Irish voice;
the description says the speaker may be silent). Fields: `Irish` (the headword), `Word` (the same, what the checks
key on), `Say`, `English` (meanings by part of speech, a noun's gender in its label), `Forms` (a noun with the
article, its genitive and plural — `an teach`, `tí`, `tithe`; a verb's present, past, future and verbal noun —
`déanann`, `rinne`, `déanfaidh`, `déanamh`; an adjective's plural and comparative — `móra`, `níos mó`; a pronoun's
emphatic form), `Table` (behind a fold: a verb's six tenses by person with the autonomous form; a noun's article,
genitive and plural forms and its lenited, eclipsed and h-prefixed spellings; an adjective's masculine, feminine,
genitive, plural and comparison; a preposition's forms with a pronoun — `liom`, `leat`, `leis`), `Examples` (up to
three Tatoeba sentences, the word in bold in whichever form or mutation it takes). A verb is headed by its
**imperative singular**, as Irish dictionaries head it (Irish has no infinitive). No article on the headword: Irish
has no indefinite article, and the definite form is the first of the key forms. The type's CSS is
`.claude/irish/card.css` (Swedish's).

## 4. What Irish needs that no earlier set did — the findings

- **THE INITIAL MUTATIONS** (`ga.variants`). A corpus and a sentence index see `bean`, `bhean`, `mbean` as three
  words. Every form a lemma claims claims its lenited, eclipsed, h-, n- and t-prefixed spellings too, generated only
  where Irish writes them (no lenition of sc/sm/sp/st, no eclipsis of l/n/r/s), and the sentence matcher matches
  them (`go holc`, `m'athair`). The tokenizer drops the clitics `d'`, `m'`, `b'`.
- **A TABLE CELL IS A PHRASE** (`extract.claim_word`): `an teach`, `na dtithe`, `bhean mé`, `a bheanann`, `níos mó`.
  A noun's or adjective's cell claims its last word, a verb's its first, a relative `a` and a subject pronoun
  skipped; a pronoun-only cell (`sí`, Wiktionary's "sé / sí" split) or one with a parenthesis claims nothing.
- **A VERB CELL NEVER CLAIMS A CLOSED-CLASS HEADWORD**: `déan`'s table lists the northern `ní sé` "he does", the
  spelling of the negative particle `ní`.
- **A VERBAL NOUN WITH AN ENTRY OF ITS OWN HOLDS ITS OWN COUNT** (`déanamh`, `bheith`); the fill excludes the
  verbal nouns of taught verbs (`déanamh`, `dul`).
- **THE IRREGULAR VERBS' TABLES ARE UNRELIABLE IN THE EXTRACT**: `téigh` gives only the dependent `deachaigh` and a
  dialect `théigh` for its past, `déan` only habitual pasts, and the present cells are northern (`ním`). The eleven
  (`bí abair beir clois déan faigh feic ith tabhair tar téigh`) take their past from `build_deck.IRREG_PAST`
  (bhí, dúirt, rug, chuala, rinne, fuair, chonaic, d'ith, thug, tháinig, chuaigh — the Standard's) and show no
  All forms fold. Dependent forms are left out of every regular verb's table.
- **CAPITALISED HEADWORDS**: Irish capitalises its months, days and languages (`Eanáir`, `Luan`, `Gaeilge`), which
  Wiktionary partly files as names; `extract.CAPS` keeps them. They carry no forms line (`build_deck.NO_FORMS`):
  Wiktionary gives `an tEanáir`, `Eanáirí`, which a learner does not meet.
- **`i` IS MISSING FROM THE EXTRACT** (the mammoth page, as Swedish's `i`): written into `extract.SUPPLEMENT` with
  its personal forms (`ionam`, `ionat`, `ann`, `inti` …) from the subpage, with the date read.
- **THE CORPUS IS ENCYCLOPAEDIC.** Wikipedia's headings (`tagairt` "reference", `nasc` "link"), the pieces of place
  names (`áth`, `cliath` from Baile Átha Cliath, `cill`) and words met only in a phrase (`éis`, `diaidh`, `réir`,
  `measc`, `feadh` — the inventory teaches `tar éis`, `i ndiaidh`, `de réir`, `i measc`, `ar feadh` whole) are in
  `select.EXCLUDE`, each with its reason, as are rare words whose spelling another takes (`fál` ← `fáil`, `iúl` ←
  `Iúil`, `fuaigh` ← `fuair`). Category links are stripped with any namespace (`Catagóir:` carries a fada).
- **A READING, NOT A SPELLING**: the inventory names the part of speech where Wiktionary's first entry is not the
  everyday word (`sí:pron`, not "fairy mound"; `éasca:adj`, not "moon"; `glac:verb`, `ceap:verb`, `má:conj`,
  `olc:adj`); `ETYMS`, `GLOSS`, `LEAD`, `DROP_POS` and `HEAD_FIX` in `build_deck.py` each carry their reason (the
  copula `is` and `ba`, written as meanings; `do` as "to, for" and "your"; `tí tábhairne`, Wiktionary misspelt).

**Known, left.** The fill carries the encyclopaedia's register on frequency (`contae`, `polaiteoir`, `aisteoir`,
`foilsigh`, `bunaigh`), as Swedish's carries the subtitles' crime drama; the description says so. `leis` is dealt
as the adverb "also" (its own entry), not as `le`'s "with him", which `le`'s table shows. Tatoeba is thin for Irish:
111 of A1's 500 words have no sentence.

## 5. Phases

**Phase 1 (done)** — the pipeline and A1. **Phase 2** — A2 and B1 (done) to C1, one level per session: write the level's inventory
into `inventory.py` and its `SCOPE` into `irish_level.py`, add its `STAMP` in `build_deck.py`, run, read every card.
**Phase 3** — a phrases deck (Wiktionary's `phrase` / `proverb` entries and the idioms built on `bí` and a
preposition: `tá ocras orm`, `is maith liom`), on Swedish's `phrases.py`.

## 6. As built (2026-11-12): A1

`python3 .claude/irish/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `wikitext.py` → `extract.py` →
`select.py` → `examples.py` → `build_deck.py`, caching in `.claude/irish-cache/` (gitignored, ~270 MB).
`node .claude/irish/check-irish.js` is the check. **A re-run is byte-identical** (verified from `wikitext.py` on).
A1: 500 notes, 366 from a 23-topic inventory and 134 by frequency; three sentences for 285, none for 111. Every card
was read. The shelf's hue is measured: `#A84293`, an orchid, 15.4 from its nearest (Turkish's rose).

**The shipped A1 carried the placeholder colour `#000000`** in its `meta.color` until the A2 session: the hue was
set in `build_deck.py` after the last A1 build and the file was not rebuilt. Rebuilt on 2026-11-12 with
`#A84293`; nothing else in it changed. The lesson for every level: re-run the level after the last edit to
`build_deck.py`, and compare against the file about to be committed.

## 7. As built (2026-11-12): A2

Asked for on 2026-11-12: "Add A2." `python3 .claude/irish/run.py --level a2`; the same stages, no new source.
**750 notes: 378 from a 30-topic inventory** (`inventory.py` `A2`: seasons and dates, numbers and the personal
numbers — `triúr`, `ceathrar` —, the land and nature, weather, animals, clothes, the home and kitchen, food and
cooking, work, school, travel, the town, health and the body, feelings, people, letters and the phone, shopping,
free time and sport, verbs, describing, time words, connectors — `SCOPE['a2']`) **and 372 by frequency**; three
sentences for 107, **none for 450** (Tatoeba's 2,451 Irish pairs are mostly A1 sentences). Every card was read; A1
re-runs byte-identical after every change below (each A2 table entry names no A1 word).

**What the A2 ranking turned up**, each in `select.EXCLUDE` or a `build_deck.py` table with its reason:
- **Place and personal names' pieces** (`tiobraid`, `doire`, `corcach`, `eo`, `ros`, `cluain`, `ráth`, `rinn`,
  `gall`, `ára`, `art`), and names whose spelling a common word takes: `franc` ← an Fhrainc "France", `rúise` ← na
  Rúise, `fine` ← Fine Gael.
- **A rare word whose table or mutations take a common word's count**: `bail` ← `baile`, `at` ← `atá`, `cál` ←
  `cáil`, `ríog` ← `ríoga`, `dligh` ← `dlí`, `gair` ← `gairm`, `cinn` ← the plural of `ceann`, `clóigh` ← `cló`,
  `airm` ← `arm`'s plural. The shape to look for: a fill word whose gloss is rare and whose count is high.
- **Verbal nouns of taught verbs** (`fáil`, `rá`, `teacht`, `imeacht`, `tarlú`, `gabháil`, `coinneáil`, `athrú`) and
  the dependent past `dearna`; **phrase-only words** (`aice`, `son`, `ais`, `dheas`, `chóir`, `méad`, `éigean`,
  `ionas`); the copula's relative forms (`dar`, `darb`, `gurb`, `inar` …).
- **The wrong sense first**: `ETYMS` takes `staid` "state", `ord` "order", `iris` "magazine", `trácht` "traffic",
  `líon` "number; to fill", `ré` "era", `úd` "yon"; `GLOSS` writes `fadhb` "problem" (Wiktionary's fifth), `altra`
  "nurse", and cuts "testicle" from `cloch` and "marijuana" from `féar`; `LEAD` puts `leagan` "version", `cuairt`
  "visit", `rang` "class" first; the inventory names `seol:verb`, `cas:verb`, `caoin:verb`, `comhair:verb`,
  `láithreach:adv`, `toisc:prep`; `FILL_POS` reads `inis` as "to tell", not "island".
- `check-irish.js` read `uimhir` "number" as a card of labels only (its gloss is a part-of-speech word); it now reads
  the glosses themselves.

**Known, left.** The fill is the encyclopaedia's register even more than A1's (`parlaimint`, `toghchán`,
`príomhchathair`, `miotaseolaíocht`, `fisiceoir`) — the honest result of the only corpus there is, and stated in the
description; a larger inventory is the lever. Fourteen inventory words are not Wiktionary headwords and were dropped
(`cuairteoir`, `idirlíon`, `sóinseáil`, `sceallóg`, `contúirteach`, `tóstaer`, `naipcín`, `folcadán`, `blaincéad`,
`príomhoide`, `cóipleabhar`, `galf`, `dúnta`, `muince`).

## 8. As built (2026-11-12): B1

Asked for on 2026-11-12: "Add B1." `python3 .claude/irish/run.py --level b1`. **1,000 notes: 258 from a 16-topic
inventory** (`inventory.py` `B1`: work and the economy, society and politics, media and technology, the environment,
education, relationships, housing, health, travel, culture, feelings and opinions, explaining and arguing, verbs,
judging, time and frequency, connectors — `SCOPE['b1']`) **and 742 by frequency**; three sentences for 48, **none for
814** — Tatoeba has almost nothing for Irish at this level, and the description says how many carry sentences. Every
card was read; A1 and A2 re-run byte-identical.

**THE DICTIONARY IS THE CEILING HERE.** English Wiktionary has no entry for many everyday modern Irish words — the
first B1 list lost 33 of them: `comhshaol` "environment", `infheistíocht`, `trádáil`, `margaíocht`, `troscán`
"furniture", `athchúrsáil`, `mothúchán`, `inbhuanaithe`, `morgáiste`, `cliant`, `sláinte mheabhrach`, `fón póca` …
A word with no entry is never given a meaning, so the inventory was rewritten from a candidate list tested against the
extract first (only the words present were kept), and the level is the B1 scope as far as the dictionary reaches.
**A CHOICE FOR THE OWNER**: an open Irish–English dictionary would close the gap — the obvious one, the Foclóir
Nua Béarla–Gaeilge / téarma.ie, is not openly licensed, so none was used.

**What the B1 ranking turned up**, each in `select.EXCLUDE` or a `build_deck.py` table with its reason:
- More place and personal names' pieces (`macha`, `sligeach`, `caiseal`, `tuaim`, `iúr`, `srath`, `tulach`, `ísiltír`;
  `aodh`, `ceallach`, `colm`, `flann`, `tuathal`, `oscar`, `bran`, `fiann` ← Fianna Fáil).
- Rare words with a common word's count (`airí` ← the plural of `aire` "minister", `achair` ← `achar`, `garma`,
  `druid`), forms of A1 words (`teo` printed an empty English side, a "synonym of" pointer dropped — excluded; `dubha`),
  the Munster `tig`, phrase-only words (`arna`, `deara`, `té`, `deo`) and five more copula forms.
- The wrong sense first: `ETYMS` takes `fuath` "hate" (not "phantom"), `cainéal` "channel" (not "cinnamon"), `guta`
  "vowel" (not "filth"); `LEAD` puts `inneall` "engine", `sochaí` "society", `deis` "opportunity", `agallamh`
  "interview", `stailc` "strike", `oiliúint` "training" first; the inventory names `tuar:verb` (its noun is
  "excrement") and `séan:verb`; `FILL_POS` reads `meall` as "to entice". `ríomhaireacht` (glossed only "counting")
  and `coireacht` ("wickedness") were dropped from the inventory.

**Known, left.** Three quarters of the level is the encyclopaedia's frequency tail (`núicléach`, `iseatóp`,
`barúntacht`, `ardeaspag`, `fisiceoir`), much of it B2–C1 vocabulary and some of it specialist; it is real Irish and
stated in the description. B2 and C1 will lean on it further, and their inventories will meet the same dictionary
ceiling.
