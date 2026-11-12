# The Romanian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Romanian deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Hindi, Russian TORFL, Indonesian UKBI,
Turkish …); `docs/lang-decks.md` is the record of how those were built, and every rule there applies here
unless this file says otherwise. Asked for on 2026-11-09: "Add a Romanian language collection."

**STATUS (2026-11-12): the collection is complete** — all six CEFR levels, A1 to C2, and the phrases deck (`.claude/romanian/`, §6–§12). Only Phase 4, a combined file, is not built.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any later deck this plan produces. The collection's first commit carried one line and one bump, because
it also changed the APP (the shelf's hue in `app.js`) — the Hindi, Turkish and Russian precedent.

## 1. Decisions (2026-11-09, taken on Hindi's precedent — the owner may overrule any)

The request named no level, source or size, so each decision copies the shelf's most recent assembled set
(📖 `docs/hindi-decks-plan.md` §1), where the owner did answer them:

1. **Word source: CEFR A1–C1, assembled.** No openly licensed graded Romanian word list was found to build
   from, so each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global
   descriptor for its band, topped up with the commonest remaining lemmas. Each deck's description says so
   in plain words and claims no examination. Sizes: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500
   notes**, then a phrases deck. (C2 was added on request on 2026-11-12, §11.)
2. **No alphabet deck.** Romanian is written in the Latin alphabet; its five extra letters (ă â î ș ț) are
   learnt on the words.
3. **IPA on every card that Wiktionary gives one** (451 of A1's 500), in place of Hindi's romanisation:
   Romanian spelling is close to its sound, but the STRESS is neither written nor predictable.
4. **This session: plan + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Romanian A1 Beginner — built | `Romanian-A1.folio-deck.json` | 500 |
| Romanian A2 Elementary — built | `Romanian-A2.folio-deck.json` | 750 |
| Romanian B1 Intermediate — built | `Romanian-B1.folio-deck.json` | 1,000 |
| Romanian B2 Upper Intermediate — built | `Romanian-B2.folio-deck.json` | 1,500 |
| Romanian C1 Advanced — built | `Romanian-C1.folio-deck.json` | 1,500 |
| Romanian C2 Proficiency — built (added on request, §11) | `Romanian-C2.folio-deck.json` | 1,500 |
| Romanian Phrases and Expressions — built | `Romanian-Phrases-and-Expressions.folio-deck.json` | 372 |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule.

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms, IPA | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Romanian.jsonl`, 434 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `ro_full.txt` (≈1.1 million forms) | CC BY-SA 4.0 |
| example sentences | Tatoeba `ron` exports (31,918 Romanian–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 22.2 million, Wikipedia's infobox (Ethnologue 27th ed., 2020), read 2026-11-09 | — |

## 3. The card

One note, two templates (Romanian → English, English → Romanian), `speechLang: 'ro-RO'`. Fields: `Romanian`
(the headword; a verb as the dictionary cites it, `a face`, the particle quieter), `IPA`, `Word` (the bare
headword, what the speaker reads and what the level-below check compares), `English` (meanings by part of
speech, a noun's gender — masculine, feminine or NEUTER — in its label), `Forms` (a noun's plural and
definite form, `casă` → `case`, `casa`; an adjective's feminine and plurals; a verb's first person, past
participle and subjunctive — the three a dictionary gives), `Table` (behind a fold: a verb's present,
imperfect, subjunctive and imperative by person; a noun's indefinite and definite, nominative and genitive,
and vocative; an adjective's eight forms; a pronoun's case forms), `Examples` (up to three Tatoeba
sentences, the word in bold, with a speaker). The type's CSS is `.claude/romanian/card.css` (Hindi's, plus
`.uc-a` for the infinitive's particle).

## 4. What Romanian needs that no earlier set did — the findings

- **THE CEDILLA** (`ro.fold`): the subtitles write ş / ţ (U+015F / U+0163, the old code points) where
  Wiktionary writes ș / ț with the comma below — `şi` 4.27 million against `și` 0.39 million. Every match
  folds the cedilla to the comma; a card prints the comma letters, and `check-romanian.js` fails on a cedilla.
  Nothing else is folded: ă, â and î are letters, and `fată` "girl" is not `față` "face".
- **THE BARE SPELLING YIELDS TO A COMMONER ACCENTED TWIN** (`extract.py`). The subtitles also drop
  diacritics: `si` 1.08 million, `sa` 1.34 million. A surface with no diacritic whose accented twins are
  together commoner hands its count to them in proportion; one commoner than its twins keeps it (`fata`
  "the girl"). 16.5 million tokens moved. Counted as written, `si` made "B (the musical note)" an A1 word.
- **A CELL WITH ITS PARTICLE CLAIMS ITS VERB**: the conjugation table writes `să facă`, `nu face`; the cell
  claims (and the sentence matcher matches) the last word.
- **CLOSED-CLASS HEADWORDS THAT ARE A COMMONER WORD'S FORM.** Hindi's rule (an indeclinable word keeps its
  own spelling) is kept — it is what gives `bine`, `și`, `aici` their counts — but in Romanian many short
  closed-class headwords are also a verb's or pronoun's form: `e` (the letter; really `este` "is"), `o`
  ("oh"; really the article and "her"), `ai` and `au` (articles / "or"; really `avea`), `mă`, `mi`, `ia`,
  `bună`. Each is in `select.EXCLUDE` with its reason; the inventory teaches the real word.
- **ONE ETYMOLOGY PER CARD** and **a part of speech left off a card** (`ETYMS`, `DROP_POS` in
  `build_deck.py`, each with its reason): `mare` is "big" and "sea", `bancă` leads with "bank" not "bench",
  `eu` is not "ego", a colour adjective's noun ("white person") is dropped.
- **GRAMMAR NOTES AS GLOSSES**: Wiktionary writes "Used with an infinitive to form the future…" as senses.
  One is kept only where it is the entry's one meaning (`is_note`); a subsense that is a phrase and its
  translation ("casă de schimb – bureau de change") is replaced by its parent gloss.
- **Placeholder cells**: a defective verb's table writes `-` for a person it lacks (`întâmpla`); `ro.is_ro`
  requires a letter, so none reaches a card.

**Known, left.** A word whose every form is shared with a commoner lemma's table is dealt last on a count near
zero — `luni` "Monday" (the plural of `lună` "month"), `roșie` "tomato" (the feminine of `roșu` "red"); the
inventory keeps them in the deck, only the order suffers. Wiktionary gives no IPA for 49 of A1's 500. Some
first glosses are Wiktionary's own ordering ("to stand" as `avea`'s second sense). The fill carries the
subtitles' crime-drama vocabulary (`ucide`, `omorî`, `armă`, `poliție`) on frequency, as every
subtitle-ordered deck on the shelf does. 2 of A1's 500 words have no Tatoeba sentence.

## 5. Phases

**Phase 1 (done)** — the pipeline, A1. **Phase 2 (done)** — A2 to C1, one level per session: write the level's
inventory into `inventory.py` and its `SCOPE` into `ro_level.py`, run, read every card, extend `EXCLUDE` /
`ETYMS` / `DROP_POS` with reasons. **Phase 3 (done)** — the phrases deck. **Phase 4** — a combined file, gitignored
(and a `PARTS` row in `.claude/combine-decks.py`).

## 6. As built (2026-11-09): A1

`python3 .claude/romanian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` →
`select.py` → `examples.py` → `build_deck.py`, caching in `.claude/romanian-cache/` (gitignored, ~470 MB).
`node .claude/romanian/check-romanian.js` is the check. **A re-run is byte-identical** (verified). A1: 500
notes, 354 from the inventory and 146 by frequency; IPA on 451, forms on 310, sentences for 498 (three for
495). The shelf's hue is measured: first `#2A8424`, 19.5 from its nearest of 46 — which Arabic, measured in a parallel session, also took; re-swept at the merge against 51: `#757839`, 16.7 from its nearest.

## 7. As built (2026-11-09): A2

`python3 .claude/romanian/run.py --level a2`. 750 notes, none taught in A1 (read off the shipped A1 file):
455 from the A2 inventory (fifteen topics — relatives, jobs and study, clothes, food and cooking, the home,
the town, travel, nature and the seasons, animals, health, feelings, free time, time words, quantities,
everyday verbs) and 295 by frequency; IPA on 514, forms on 647, sentences for 736 (three for 684, none for
14). The subtitle says "750 more words, none of them in A1". A re-run is byte-identical, and A1 rebuilt
under the A2 rules is byte-identical to the shipped file. What A2 added:

- **More forms counted as words** (`select.EXCLUDE`): a noun whose generated table claims a commoner noun's
  forms (`geac` "jack (flag)" from `geacă` "jacket", `hain` from `haină`, `secund` from `secundă`), a
  definite form with an entry of its own (`dimineața`, `gura`, `cina`), participles (`făcut`, `fost`), `Tom`
  (every other Tatoeba-and-subtitle line), and `adaptare`, counted from the subtitle files' credit line.
- **Two entries of one etymology that are different words** (`DROP_ENTRY`): `membru` is a neuter "limb"
  (pl. `membre`) and a masculine "member" (pl. `membri`); merged, the card had the limb's gender and plural.
- **A noun cell that is only an ending**: Wiktionary's table prints `avocat`'s definite as "ul". A noun's
  cell under three letters is dropped (nouns only: a verb's imperative may be `fă`, `du`, `zi`).
- More `ETYMS` / `DROP_POS` / `LEAD` rows, each with its reason (`dura` "to last", `pacient` the noun,
  `slujbă` "job" before "divine service").

Feminine agent nouns written in the inventory (`colegă`, `asistentă`, `vecină`) are Wiktionary form-of
entries, so the masculine is taught and its card names no feminine — known, left.

## 8. As built (2026-11-12): B1

`python3 .claude/romanian/run.py --level b1` (asked for on 2026-11-12: "Add Romanian B1"). 1,000 notes, none
taught in A1 or A2: 513 from the B1 inventory (eighteen topics — work and career, education, media and
technology, the environment, society and public life, law and crime, health and lifestyle, relationships and
feelings, character, opinions and argument, linking words, travel and its problems, services and money,
housing, culture and the arts, abstract ideas, thinking and communicating, everyday verbs) and 487 by
frequency; IPA on 522, forms on 878, sentences for 928 (none for 72). A re-run is byte-identical, and A1 and
A2 rebuilt under the B1 rules are byte-identical to the shipped files — on a fresh download of all five
sources, so the Wiktionary extract of 2026-11-12 changed nothing either level reads.

- **Thirty multi-word or newer items are not Wiktionary headwords** and were dropped, as the pipeline does
  (`în_general`, `după_ce`, `sală_de_sport`, `internet`, `online`, `economii` …; the run prints the list).
  Several linking phrases a B1 learner needs are therefore missing — the phrases deck is their place.
- **More forms counted as words** (`select.EXCLUDE`, each with its reason): definite forms whose entry is a
  verb (`masa` "to massage" from *masa* "the table", `data`, `lumina`, `regula`, `forma`, `ancheta`), names
  and English words from the subtitles (`henry`, `martin`, `sir`, `team`), and **bare past participles**
  whose card is only the participle's sense (`găsit`, `luat`, `pierdut`, `speriat` … eighteen). A participle
  that is an adjective in its own right (`obișnuit` "usual", `căsătorit` "married", `cunoscut` "well-known")
  is kept.
- **The inventory's own slips, caught on reading**: `ura` is "to wish" — "to hate" is `urî`; `fie` resolves
  only to a noun "daughter" (the conjunction is filed as a form of `fi`) and `pană` only to "feather" (no
  "breakdown"), so both left the list; `email` leads with "enamel", so the card is `e-mail`. `coș` and `post`
  take their second etymology ("basket", "job") through `ETYMS`.
- Two more swears for `SWEARS` (`porcărie`, `afurisit`), read off the fill.

## 9. As built (2026-11-12): B2

`python3 .claude/romanian/run.py --level b2` (asked for on 2026-11-12: "Add B2"). 1,500 notes, none taught
in A1, A2 or B1: 531 from the B2 inventory (seventeen topics — work and the economy, science, technology and
the internet, politics, law and justice, the environment, health and medicine, the mind and emotions, social
issues, the media, arguing and evaluating, discourse words, culture and the arts, places and geography,
describing people and things, abstract nouns, verbs of change) and 969 by frequency; IPA on 579, forms on
1,318, sentences for 1,111 (none for 389 — Tatoeba's Romanian is thin at this level). A re-run is
byte-identical, and A1, A2 and B1 rebuilt under the B2 rules are byte-identical to the shipped files.

- **59 inventory items are not Wiktionary headwords** and were dropped (mostly multi-word terms:
  `schimbări_climatice`, `sănătate_publică`, `în_concluzie`, `cu_toate_acestea` …; the run prints the list).
- **The fill is two thirds of the deck**, so it carries more of the subtitles' register (crime, war, the
  supernatural) than B1 does — known, as for every subtitle-ordered deck.
- **More forms counted as words** (`select.EXCLUDE`): names (`susan`, `elenă`, `mac`, `mel` …), English words
  from the subtitles (`miss`, `star`, `show`, `cool` …), definite forms whose entry is a verb (`panica`,
  `lista`, `poza`, `planta` …), the subtitle files' credit lines (`sincronizare`, `subtitrare`), and 35 more
  bare past participles. Five more swears and crude words for `SWEARS`.
- **A gloss longer than 90 characters is dropped as a note** (`is_note`), which cost `gratuit` its first
  meaning, "free, without payment (which costs nothing, …)". `LEAD` may now name the opening of such a gloss,
  and the card leads with it; no existing `LEAD` changed a card.
- From the inventory: `ales` (a participle) and `amenințat` (a stray noun) left; `pondera` is "to temper",
  not the "ponder" its one gloss gives, and `sondaj` is glossed only "sounding", not "opinion poll" — both
  left rather than carry a misleading card. `bilă` takes etymology 2 ("ball", not "bile").

## 10. As built (2026-11-12): C1

`python3 .claude/romanian/run.py --level c1` (asked for on 2026-11-12: "Add C1"). 1,500 notes, none taught
in A1 to B2: 544 from the C1 inventory (sixteen topics — economics and finance, politics and the state, law
and rights, science, philosophy, language and rhetoric, society and culture, character and conduct, the
finer shades of feeling, the arts and literature, the planet, medicine, formal-register adjectives,
adverbs and connectors, nuanced verbs, abstract nouns) and 956 by frequency; IPA on 438, forms on 1,319,
sentences for 771 (none for 729 — Tatoeba has little Romanian at this register). A re-run is
byte-identical, and A1 to B2 rebuilt under the C1 rules are byte-identical to the shipped files.

- **28 inventory items are not Wiktionary headwords** and were dropped — chiefly the formal connectors
  (`de_altfel`, `în_fond`, `pe_măsură_ce`, `ceea_ce` …) and `antreprenoriat`, `decarbonizare`.
- **The inventory is where C1 differs from the subtitles**: its words are formal and academic, the fill is
  still the commonest spoken words not yet taught, so the deck is two registers side by side. Known.
- **Inventory words left because their only gloss would mislead**: `or` (resolves to a verb form, not the
  conjunction "whereas"), `raționa` ("to ration", not "to reason"), `consecvență` (glossed "consequence";
  it is consistency), `monetar` (a noun "coin inventory", not the adjective), `concurent` ("concurrent",
  not "competitor"), `citat` (an adjective "quote"). `pluton` and `franc` take the right etymologies.
- More `select.EXCLUDE` rows of the same kinds as B2 (names, film characters, English words, forms counted
  as other words, 42 more bare participles) and four more for `SWEARS`.

## 11. As built (2026-11-12): C2

`python3 .claude/romanian/run.py --level c2` (asked for on 2026-11-12: "Add C2"; §1 left C2 to a request).
The band is new in `ro_level.py` (`BANDS`, `NAMES` "Proficiency", `TARGET` 1,500, its `SCOPE`) and in
`build_deck.py`'s `FOR` / `BELOW_NAMES`; nothing below it changed (A1 to C1 rebuild byte-identical). 1,500
notes, none taught in A1 to C1: 538 from the C2 inventory (thirteen topics — literary and elevated nouns,
the older words alive in literature, faith, rite and tradition, the countryside and its crafts, rhetoric,
style and scholarship, law and administration at their most formal, the finest shades of character, of
feeling and judgement, precise verbs of speech, of sight, movement and manner, rarer adjectives, rarer
adverbs and connectors, abstract and scholarly nouns) and 962 by frequency; IPA on 428, forms on 1,336,
sentences for 617 (none for 883 — Tatoeba barely reaches this register). A re-run is byte-identical.

- **38 inventory items are not Wiktionary headwords** and were dropped (`sorcova`, `plugușor`, `dor_de_ducă`,
  `lua_peste_picior`, `pe_furiș`, `cel_mult` …). Multi-word items the session had composed rather than
  found (`tăcere_adâncă`, `legăna_ușor` …) were removed from the list before the build, not left to drop.
- **Many C2 synonyms share an English gloss** (`pururea` / `pururi`, `abis` / `hău`, `pizmă` / `zavistie`):
  43 notes in 21 groups, each labelled "not …" so the reverse card has one answer, as on every level.
- `elan` and `uric` take their second etymology (élan; the old charter); `primat` gives only "primate" and
  left the list. The same `select.EXCLUDE` kinds as C1 (names, English words, definite forms read as verbs,
  forms counted as words, about 60 bare participles), five more for `SWEARS`, and `țigan` as a slur.
- **The fill is the commonest spoken words not yet taught**, deep in the subtitle list by now, so it sits
  beside a literary inventory: the deck is two registers, as C1 is. Known.

## 12. As built (2026-11-12): the phrases deck

`python3 .claude/romanian/run.py --level phr` runs `phrases.py` in place of `select.py` (asked for on
2026-11-12: "Add the phrases deck"). Ported from Hindi's (📖 `docs/hindi-decks-plan.md` §11): 372 expressions in
three subdecks — **95 Phrases** (Wiktionary's multi-word phrases, prepositional phrases and interjections not
tagged idiomatic: `nu știu`, `îmi pare rău`, `în regulă`, `la mulți ani`), **233 Idioms** (a multi-word entry
with a sense tagged idiomatic, most of them verbs: `a face față`, `a da de urmă`, `a-și ține gura`) and **44
Proverbs** (`cine râde la urmă râde mai bine`, `calul de dar nu se caută la dinți`). Nothing a level teaches is
repeated. Order within a subdeck: Tatoeba sentences containing the expression, then frequency, then spelling;
88 of the 372 occur in Tatoeba, 87 have sentences, 33 have three. IPA on 54 (Wiktionary gives few for an
expression). A re-run is byte-identical, and all six levels rebuilt by the changed code are byte-identical.

**What Romanian needed that Hindi did not:**
- **The verb comes FIRST** (`face față`, `da drumul`; Hindi and Turkish put it last), often after a reflexive
  clitic (`își ține gura`). `examples.phrase_parts` matches the verb in any form of its table and the clitic in
  any person (`pot face față`, `a pierdut trenul`, `îmi țin gura`); the phrases deck only, so the levels keep
  their exact matching.
- **A verb expression that opens with a clitic joins it to the infinitive's a** (`a-și lua lumea în cap`,
  `a-i da lumea peste cap`; `build_deck.CLITIC_A`) — no level headword opens with one.
- **Capitals are a phrase's own** (`slavă Domnului`, `de la A la Z`), so `check-romanian.js`'s alphabet test
  now accepts them; it still fails a cedilla or a foreign letter.
- **The swear list missed a family of oaths**: `select.SWEARS` lists headwords (`pulă`, `pizdă`), the oaths
  write definite and clipped forms (`du-te-n pula mea`, `dă-o-n pizda mă-sii`). `phrases.OATH` names those
  forms; twelve oaths left. A first version listed `morții` and also took `a se da de ceasul morții` ("to make
  desperate efforts"); the oath it was for is caught by `mă-tii`, so it was removed.

**Excluded with reasons** (`phrases.EXCLUDE`): phrasebook sentences built from level words (`te iubesc`,
`sunt gay`, `crezi în Dumnezeu`, `pot să folosesc telefonul Dumneavoastră` …) — the questions and formulas a
phrasebook teaches whole stay (`nu știu`, `cum vă numiți`, `vorbiți engleză`); two oaths; a duplicate idiom; two
cards whose one gloss is a pointer to an expression not in the deck; and a proverb whose subject is the ethnic
slur the C2 deck excludes.

**Known, left.** `a pierde trenul` teaches the idiom "to miss the boat" but its Tatoeba sentences are the literal
"miss the train". A few of Wiktionary's English glosses are crude (`a o face de oaie` "to fuck up") — the
expressions are a learner's to know and the glosses the source's. Wiktionary's labels decide the subdeck:
some idioms are close to literal (`a termina școala` "to graduate").
