# The Danish language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Danish deck in `decks/`.** It is the plan for a
Danish set, built in the Swedish decks' shape (`docs/swedish-decks-plan.md`, whose pipeline `.claude/danish/`
adapts); `docs/lang-decks.md` is the record of how every set was built, and every rule there applies here
unless this file says otherwise. Asked for on 2026-11-15: "Add a Danish language collection."

**STATUS (2026-11-15): the plan is complete** — all five levels, A1 to C1, and the phrases deck (§6–§11).

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for a later deck of this plan. The collection's first commit carried one because it also changed the APP — the
shelf's hue in `app.js`.

## 1. The decisions (2026-11-15, taken from the Swedish, Hindi and Greek precedent — the owner was not asked)

The request named no levels, so the session followed the answers the earlier owners gave. **Any of these is the
owner's to overrule.**

1. **Word source: CEFR A1–C1, assembled.** Danish has examinations at these levels — Prøve i Dansk 1, 2 and 3
   and Studieprøven, at the end of the Danish courses for adult learners — but none was found to publish a word
   list, so the decks do not claim to be their vocabulary. Each level is a hand-written topic inventory
   (`inventory.py`) scoped to the CEFR global descriptor, topped up with the commonest remaining lemmas; the
   description says so. Sizes, Hindi's and Swedish's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**.
   · **NOT CHECKED**: whether a CEFR-graded Danish lexicon exists under a licence Folio could use (for Swedish,
     Språkbanken's SVALex and the Kelly list were named; their Danish counterparts were not looked for). Check
     before writing A2's inventory by hand.
2. **No alphabet deck.** Danish is written in the Latin alphabet; æ, ø and å are taught by the words.
3. **No romanisation**, for the same reason.

| deck | file | notes |
|---|---|---|
| Danish A1 Beginner — built | `Danish-A1.folio-deck.json` | 500 |
| Danish A2 Elementary — built | `Danish-A2.folio-deck.json` | 750 |
| Danish B1 Intermediate — built | `Danish-B1.folio-deck.json` | 1,000 |
| Danish B2 Upper Intermediate — built | `Danish-B2.folio-deck.json` | 1,500 |
| Danish C1 Advanced — built | `Danish-C1.folio-deck.json` | 1,500 |
| Danish Phrases and Expressions — built | `Danish-Phrases-and-Expressions.folio-deck.json` | 530 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Danish.jsonl`, 99 MB) | CC BY-SA 4.0 |
| the preposition `i` (missing from that extract) | English Wiktionary, page `i/languages A to L`, Danish section, read 2026-11-15 | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `da_full.txt` | CC BY-SA 4.0 |
| example sentences | Tatoeba `dan` exports (44,450 Danish–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 5.5 million, Wikipedia's infobox (5.52 million, Ethnologue 18th ed., 2012), read 2026-11-15; no second-language figure, so `total` is the same | — |

## 3. The card

One note, two templates (Danish → English, English → Danish), `speechLang: 'da-DK'`. Fields: `Danish` (the
headword, **a noun with its article** — en or et — in `.uc-art`; none on a plural-only noun such as `penge`, a
month or a language's name, `dansk`), `Word` (the bare lemma, what the checks key on), `Say` (what the speaker
reads), `English` (meanings by part of speech, a noun's gender in its label), `Forms` (a noun's definite singular
and plural, `bilen`, `biler`; an adjective's neuter and e-form, `stort`, `store`; **a verb's present, past and
perfect with its auxiliary**, `spiser`, `spiste`, `har spist` — `går`, `gik`, `er gået`), `Table` (behind a fold:
a verb's infinitive, present, past, imperative and perfect, its -s forms and participles; a noun's indefinite and
definite in both numbers; an adjective's forms, comparative and superlative; a pronoun's forms), `Examples` (up to
three Tatoeba sentences, the word in bold). The type's CSS is `.claude/danish/card.css` (Swedish's, unchanged).

## 4. What Danish needs that Swedish did not — the findings

- **THE FOLD KEEPS Æ, Ø AND Å** (`da.fold`), and **keeps the capital of `I`** "you (plural)", the one word Danish
  always writes with a capital, whose lower case is the preposition `i`. The subtitles list is lower-cased, so
  `I` is dealt by its object form `jer`'s count (`select.SAME_AS`), and a sentence's FIRST word `I` matches
  neither (`examples.py`: it may be "I går …", "yesterday").
- **AN ADJECTIVE'S AND A PRONOUN'S TABLE IS ITS HEADWORD LINE.** Wiktionary's Danish adjective tables come through
  the extraction tagged `error-unrecognized-form`, and pronouns have none; their headword lines carry every form
  (`stort`, `store`, `større`, `størst`, `største`; `mig`, `min`), so `extract.table_of` reads those instead.
- **A VERB'S TABLE IS TWO BOXES**, the finite forms and the participles. Swedish's "first table only" rule (there to
  drop a dialectal second table) cut every participle; for a verb both boxes are read.
- **THE PAST PARTICIPLE CELL CARRIES ITS AUXILIARY**: `(have /havde) spist`, `(er /var) gået`, `(have /havde /er
  /var) fulgt`. It is split into the participle and `aux-have` / `aux-være` tags, and the card prints the perfect
  (`har spist`, `er gået`, `har / er fulgt`) — which auxiliary a verb takes is learnt with it.
- **A VERB'S IMPERATIVE CLAIMS NOTHING WHERE ANOTHER LEMMA HEADS THE SPELLING.** The imperative is the bare stem,
  and the stem is constantly another word: `men` "but" (of `mene`), `far` "father" (of `fare`), `end` "than" (of
  `ende`). Claiming, `mene` was dealt as the 17th commonest word and `fare` far above `far`. The cost runs the other
  way where the imperative is the commoner use — `tag` "take!", `lad` "let!", `hold` "hold!", `hør` "listen!" —
  so those nouns and adjectives are in `select.EXCLUDE`.
- **A CLOSED-CLASS WORD SHARING ITS SPELLING WITH A COMMON VERB TAKES HALF.** Swedish's split by what each lemma
  earns alone gave the closed word, which earns nothing alone, almost nothing: `så` "so, then" (also the past of
  `se`) was dealt 497th of A1's 500. Here the closed word takes half and the verbs split the rest — a plain guess,
  stated as one.
- **`i` IS MISSING FROM THE EXTRACT**, as Swedish's was: its senses are written into `extract.SUPPLEMENT` from the
  Wiktionary subpage, with the date read.
- **`da-noun`'S FIRST ARGUMENT IS A DECLENSION CLASS, NOT A GENDER** (`en`, `et`, `n`, `r` …): the gender is read
  from the `head` template's `g` only.
- **A LEARNER'S WORD WIKTIONARY HEADS UNDER ANOTHER**: `mange` "many" is filed as the plural of `mangen`, `alle` of
  `al`; `select.ALIAS` prints the learner's word with the headword's meanings.
- **A READING, NOT A SPELLING**: where Wiktionary's first entry is not the everyday word, the inventory names the part
  of speech (`have:verb`, not "garden"; `men:conj`, not "injury"; `ham:pron`, not "slough") and `select.FILL_POS`
  does the same for the fill (`tro`, `slå`, `prøve`, `lade`, `bede`, `vise`, `vinde` are verbs; `helt` and `nok`
  adverbs; `gift` "married"); `GLOSS`, `LEAD`, `GENDER_FIX` and `DROP_POS` in `build_deck.py` each carry their reason.

**Known, left.** The fill carries the subtitles' crime-drama vocabulary (`dræbe`, `skyde`, `død`) on frequency, as
every subtitle-ordered deck does. `hans` and `hendes` have no Wiktionary entry of their own (only form-of) and are
shown on `han`'s and `hun`'s cards. Mass nouns print their article (`en mælk`, `et smør`): the article is the gender.
One of A1's 500 words (`apotek`) has no Tatoeba sentence.

## 5. Phases

**Phase 1 (done)** — the pipeline and A1. **Phase 2 (done)** — A2 to C1, one level per session: write the level's
inventory into `inventory.py` (and its `SCOPE` is already in `danish_level.py`; add its `STAMP` in `build_deck.py`),
run, read every card. **Phase 3 (done)** — a phrases deck, from Swedish's `phrases.py`.

## 6. As built (2026-11-15): A1

`python3 .claude/danish/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/danish-cache/` (gitignored, ~230 MB).
`node .claude/danish/check-danish.js` is the check. **A re-run is byte-identical** (verified, extract included). A1:
500 notes, 353 from the inventory and 147 by frequency; three sentences for 494, none for 1. Every card was read
once in the session and the faults above fixed. The shelf's hue is measured: the raw winner was a moss green,
refused as one more green; outside the greens and the bright-magenta band, `#752466`, a deep plum, 15.0 from its
nearest of 69.

## 7. As built (2026-11-15): A2

Asked for on 2026-11-15: "Add A2". `python3 .claude/danish/run.py --level a2`; the same stages, no new source.
**750 notes: 287 from a 19-topic inventory** (`inventory.py` `A2`, Swedish A2's topics: seasons and dates, numbers
to a million, the land and nature, weather, animals, clothes, the home and kitchen, food and cooking, work, school,
travel, the town, health, feelings, free time, verbs, describing, time words, connectors — scoped to `SCOPE['a2']`)
**and 463 by frequency**; three sentences for 700, none for 13. Every card was read once. A1 re-runs byte-identical
after every change below, extract included.

**What the A2 ranking turned up**, each fixed with its reason beside it:
- **A rare noun spelt like a common verb or adjective took its count** (`le` "scythe" for "to laugh", `kaste`
  "caste", `tvinge` "clamp", `tjekke` "a Czech", `banke`, `rive`, `hoppe` "mare", `sej` "pollock" for "tough, cool",
  `kær` "pond" for "dear", `fri` "to propose" for "free" …) — now read by `FILL_POS`; `ETYMS` takes `skab`
  "cupboard" and `mål` "goal".
- **More of the imperative's and the definite's counts** reaching another headword: `live` (from `livet`), `læg`,
  `spore` (from `sporet`), `hov`, `luk`, `forsvind`; and forms taught on another card (`hurtigt`, `dårligt`,
  `klokken`, `holdt`, `hørt`, `fader`) — `select.EXCLUDE`. `aflede`'s Wiktionary table lists `lede`'s forms.
- **A bare auxiliary as the perfect**: `svømme`'s headword line splits `er svømmet` into `er` and `har svømmet`, so
  the card printed "perfect: er"; a bare `er` or `har` is no longer taken (`extract.py`).
- **Swearing**: `fandens`, `forbandet`, `pokker`, and `kæft` (from `hold kæft`).
- No gender given (`maskine`, `kursus`, `oberst`, `forskel`, `busstoppested`) — `GENDER_FIX`; `fru` (a title) and
  `aftes` (only in `i aftes`) take no article (`NO_ART`, and the check knows them).
- Inventory words not in Wiktionary were dropped or replaced: `briller` → `brille`, `stoppested` → `busstoppested`,
  `skadet` → `skade`, `overrasket` → `overraske`, `overskyet` → `skyet`, `for nylig` → `nylig`; `metro`, `forstad`,
  `tidligere` and `altså` dropped (`altså` has no extract entry); `misse` (Wiktionary has only "to blink") and `tag`
  "roof" (its count is the imperative "take!", which would deal it first of the deck) left out.

**Known, left.** The fill carries the subtitles' crime vocabulary (`våben`, `pistol`, `mord`, `fængsel`), as A1 does.
`le` "to laugh" shares its English side with `grine` and is labelled by the shelf's dedupe pass ("not grine").

## 8. As built (2026-11-15): B1

Asked for on 2026-11-15: "Add B1". `python3 .claude/danish/run.py --level b1`; no new source. **1,000 notes: 226
from a 16-topic inventory** (`inventory.py` `B1`, Swedish B1's topics: work and the economy, society and politics,
media and technology, the environment, education, relationships, housing, health, travel, culture, feelings and
opinions, thinking and talking, the level's verbs, describing and judging, time, connectors — scoped to
`SCOPE['b1']`) **and 774 by frequency**; three sentences for 730, **none for 87** — Tatoeba's Danish runs thin for
the level's abstract nouns. Every card was read once. A1 and A2 re-run byte-identical.

**Danish Wiktionary is thinner than Swedish here**: 16 inventory words have no entry and were dropped (`praktik`,
`interview`, `program`, `printe`, `annonce`, `udledning`, `tørke`, `lærebog`, `skilsmisse`, `opvarmning`, `akut`,
`booking`, `udstilling`, `overbevise`, `nutildags`, `til sidst`), so the fill carries more of the level than
Swedish's did.

**What the B1 ranking turned up**, each fixed with its reason beside it in `select.py` and `build_deck.py`:
- **More rare nouns over common verbs** (`ride` "kittiwake", `klippe` "bedrock" over "to cut", `putte`, `lette`
  "a Latvian", `spare`, `tømme` "rein", `skinne` "rail", `rode`) — `FILL_POS`; `pille` takes "pill", not "pillar".
- **Counts belonging to another word**: a present tense (`holder`, `tvivler`, `skifter`), a participle
  (`modtaget`), an imperative (`lev`), a past (`lo`), a plural (`onde`, `hellige`, `lange`), a name (`rom`, `van`,
  `el`); formal or old spellings (`broder`, `moder`, `vore`, `vort`, `kong`); and entries whose meaning is not the
  count's (`pinligt` "precisely", `service` "tableware", `sprut` "a squirt", `kædemaske`).
- **Swearing, insults and crude words**: `skiderik`, `nosse`, `forpulet`, `tæve`, `åndssvag`, `patte`, `fis`;
  `voldtage` left out on Swedish's precedent (`våldta`).
- Inventory readings: `slette:verb` ("to delete", not "a plain"), `kælder:noun`. A pointer gloss rewritten
  (`allesammen`), a sexual sense cut (`ride`), genders Wiktionary omits (`seddel`, `jakkesæt`, `point`, `gidsel`,
  `skub`, `sæson` …), and `vegne` (only in `på … vegne`) taking no article.

**Known, left.** The fill carries the subtitles' crime and fantasy vocabulary (`forbrydelse`, `vampyr`, `dæmon`,
`spøgelse`, `heks`), as A1 and A2 do. `tisse` "to pee" was left out as childish rather than taught.

## 9. As built (2026-11-15): B2

Asked for on 2026-11-15: "Add B2". `python3 .claude/danish/run.py --level b2`; no new source. **1,500 notes: only 147
from a 13-topic inventory** (`inventory.py` `B2`, Swedish B2's topics: the economy, politics, law, science and
technology, the environment, health and society, media, culture and society, abstract nouns, arguing, the level's
verbs, evaluating, connectors — scoped to `SCOPE['b2']`) **and 1,353 by frequency**; three sentences for 709, **none
for 327**. Every card was read once. A1, A2 and B1 re-run byte-identical.

**THE LEVEL IS MOSTLY THE FILL, AND SAYS SO.** 29 inventory words have no Danish Wiktionary entry (`konjunktur`,
`arbejdsmarked`, `opposition`, `lovgivning`, `korruption`, `integration`, `teknologi`, `software`, `økosystem`,
`sundhedsvæsen`, `faktor`, `struktur`, `forudsætte` …, listed by the run) and many others were already taught, so 90 %
of B2 is the subtitles' commonest remaining lemmas. The description's counts say how many came from each source, so
this is visible to a reader; and a fifth of the deck has no Tatoeba sentence. **A choice for the owner**: a graded
Danish list under a usable licence (§1), or a second frequency source with less crime drama, would serve B2 and C1
better than more hand inventory against a thin dictionary.

**What the B2 ranking turned up**, each fixed with its reason beside it:
- **Forms and spellings of taught words** (`rimeligt`, `billigt`, `løst`, `sygt`, `pludseligt`; `små`, `dumme`,
  `trætte`, `kristne`; `benet`, `vesten`; `tusinde`, `århundred`, `hall`).
- **Counts belonging to another word**: imperatives (`ryk`, `spar`, `pak`, `fang`, `hiv`, `skru`, `øg`, `flyv`,
  `ødelæg`), presents (`rykker`, `sveder`), a past (`hang`), participles (`overført`, `stjålen`), `syne` (from `synes`).
- **English words and names in the subtitles** (`green`, `in`, `hot`, `kid`, `bridge`, `die`, `my`, `misse`, `gus`,
  `em`, `pentagon`, `gram`, `rap`), and entries met only in fixed phrases (`hu`, `ve`, `bilde`).
- **Swearing, slurs and crude words**: `stodder`, `helvedes`, `hore`, `mær`, `kusse`, `neger`, `liderlig`, `porno`,
  `voldtægt`; a sexual sense cut from `lem`.
- **Rare nouns over verbs and adjectives**: `arve` "pimpernel", `våge` "a hole in the ice", `gylden` "a guilder" —
  `FILL_POS`; `fej` leads with "cowardly". Genders Wiktionary omits (24, `GENDER_FIX`); the languages' names
  (`kinesisk`, `japansk` …) take no article.

**Known, left.** The fill's crime, fantasy and slang vocabulary (`narko`, `strømer`, `lejemorder`, `varulv`, `ork`,
`hash`) stays on frequency, as at every level; so do a few anatomical words (`penis`, `kondom`).

## 10. As built (2026-11-15): C1

Asked for on 2026-11-15: "Add C1" — built the same way as B2; the owner was not asked §9's choice, which stands.
`python3 .claude/danish/run.py --level c1`; no new source. **1,500 notes: only 62 from a 10-topic inventory**
(`inventory.py` `C1`, Swedish C1's topics: academic life, governance, the economy, law and ethics, mind and behaviour,
language and rhetoric, abstract nouns, the level's verbs and adjectives, formal connectors — scoped to
`SCOPE['c1']`) **and 1,438 by frequency**; three sentences for 369, **none for 637**. Every card was read once. A1 to
B2 re-run byte-identical.

**THE THINNEST LEVEL ON THE SHELF FOR SOURCES.** 46 inventory words have no Danish Wiktionary entry (`definition`,
`mekanisme`, `kapital`, `etik`, `integritet`, `afkast`, `påvise`, `fastholde`, `marginal`, `endvidere` …, listed by
the run), so 96 % of C1 is the subtitles' frequency between roughly the 5,000th and 6,500th Danish lemma — a band
of everyday nouns, animals, foods, professions and crime-drama vocabulary more than the academic register the CEFR
descriptor names. **Four in ten cards have no example sentence**: Tatoeba's 44,000 Danish sentences do not reach this
far down the frequency list. The description states both facts in its counts. §9's choice for the owner (a graded
list, or a second corpus) applies here most of all.

**What the C1 ranking turned up**, each fixed with its reason beside it:
- **English in the subtitles** (`out`, `yes`, `hi`, `made`, `gold`, `not`, `he`, `as`, `ask`, `eagle`, `hip`,
  `clean`), a name (`arne`), a dialect form (`moar`).
- **Forms of taught words** (`brutalt`, `besværligt`, `negativt`, `samtidigt`; `kære`; `værsågod`, `grev`) and
  another word's imperative or participle (`bestil`, `lid`).
- **Crude and sexual words, slurs and insults** — more of them at this depth than at any other level (fifteen
  excluded: `pikhoved`, `blowjob`, `onanere`, `tis`, `prut`, `sjuske`, `misfoster`, `tøjte` …); a crude or sexual sense
  cut from `mis`, `skede`, `kæp`, `hed` and `afføring`. Anatomical words (`vagina`, `testikel`, `livmoder`) stay.
- **Wiktionary notes in place of meanings**: `ganske vist` ("used concessively, similar to German zwar") and
  `grundet` ("shallow", where the count is the preposition "owing to") rewritten; `sambo` read as the noun.
- Genders Wiktionary omits (42, `GENDER_FIX`); `fjor`, `overmorgen` (only in `i fjor`, `i overmorgen`) and the ship's
  sides `styrbord`, `bagbord` take no article.

**Known, left.** As at B2, the fill's crime, fantasy and slang vocabulary stays on frequency (`snigmorder`,
`haglgevær`, `enhjørning`, `smølf`).

## 11. As built (2026-11-15): the phrases deck

Asked for on 2026-11-15: "Add the phrases deck." `python3 .claude/danish/run.py --level phr` (after all five
levels); the selection stage is `phrases.py`, Swedish's (`.claude/swedish/phrases.py`) with its four subdecks.
**530 expressions**: 111 Phrases, 234 Particle verbs, 94 Idioms, 91 Proverbs — **every candidate Danish Wiktionary
has**, so the caps (200 / 300 / 250 / 100) cut nothing. Nothing a level teaches is taught again. 206 of the 530 occur
in a Tatoeba sentence and 203 carry one (111 three apiece); 327 have none.

- **The machinery the session first trimmed is back**: `danish_level`'s phr titles, `run.py`'s phrases stage,
  `examples.phrase_parts` / `seq_hit` (a particle verb matched in any form of its verb), the phr branch of
  `build_deck.py` (`desc_phr`, no article on an expression). Each runs for `--level phr` only; the five levels
  re-run byte-identical, extract included.
- **Classification and order** as Swedish's (§11 of `docs/swedish-decks-plan.md`): a proverb outranks an idiom
  outranks a particle verb outranks a phrase; within a subdeck, Tatoeba occurrences, then the frequency estimate.
- **A particle verb's forms** are the head forms of the whole (`holder op`, `holdt op`, `er holdt op`); two slips
  in Wiktionary's are corrected in `HEAD_FIX` (`er ked af ked af`; `mistet sig selv` given as a past).
- **"see you" IS A MEANING**: the phr pointer filter ("see X") dropped `vi ses` and `på gensyn`'s only gloss, so
  both are written in `GLOSS`; as are a paragraph (`om det`), a garble (`vejre morgenluft`), crude glosses
  (`gå i ged`, `løgn og latin`, `et råddent æg …`) and the common/neuter pairs `den her` / `det her`, `den der` /
  `det der`, which the dedupe pass would otherwise only label.
- **`EXCLUDE`** (each with its reason): personal phrasebook sentences (`jeg er sulten`, `jeg elsker dig` — the
  formulas asked and answered whole stay); pointers (`blæse på`, `tro om`, `jokke i spinaten`); the second
  spelling of seven expressions; English, Latin and German (`never mind`, `no offense`, `in vino veritas`, `oder
  was`); technical terms; and rude, sexual or crude expressions (`hold kæft`, `kors i røven`, `spille den af` …,
  twenty-one in all).

**Known, left.** Wiktionary's Danish proverbs are glossed by an English equivalent or a paraphrase, not always the
literal meaning (`plejer er død` "variety is the spice of life"); some idioms are rare or dated (`aber dabei`,
`øretævernes holdeplads`); four pairs of proverbs share an English equivalent and carry the dedupe pass's labels
(`krage søger mage` / `lige børn leger bedst`).
