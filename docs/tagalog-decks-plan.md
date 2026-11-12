# The Tagalog language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Tagalog deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped (Romanian, Hindi, Russian TORFL, Indonesian UKBI …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Tagalog language collection."

**STATUS (2026-11-12): A1 to C1 and the phrases deck are built** (`.claude/tagalog/`, §6–§11). Phase 4, a combined
file, is not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any later deck this plan produces. The collection's first commit carried one (raising the day's existing
"join the Languages section" line) and one bump, because it also changed the APP (the shelf's hue in `app.js`)
— the Hindi, Romanian and Vietnamese precedent.

## 1. Decisions (2026-11-09, taken on Romanian's and Hindi's precedent — the owner may overrule any)

The request named no level, source or size, so each decision copies the shelf's most recent assembled set
(📖 `docs/romanian-decks-plan.md` §1):

1. **Word source: CEFR A1–C1, assembled.** Tagalog (and Filipino, its standardised form) has no CEFR
   examination, and no openly licensed graded word list was found, so each level is a hand-written topic
   inventory (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up with the commonest
   remaining lemmas. Each deck's description says so and claims no examination. Sizes: **A1 500 · A2 750 ·
   B1 1,000 · B2 1,500 · C1 1,500 notes**, then a phrases deck.
2. **No alphabet deck.** Tagalog is written in the Latin alphabet (with ñ and ng in loans and names);
   Baybayin, the pre-colonial script, is not in everyday use and is not taught.
3. **"Tagalog", not "Filipino"**, in the title — the name of the language Wiktionary, Tatoeba and the
   subtitle list file it under. The deck's tags carry both.
4. **This session: plan + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Tagalog A1 Beginner — built | `Tagalog-A1.folio-deck.json` | 500 |
| Tagalog A2 Elementary — built | `Tagalog-A2.folio-deck.json` | 750 |
| Tagalog B1 Intermediate — built | `Tagalog-B1.folio-deck.json` | 1,000 |
| Tagalog B2 Upper Intermediate — built | `Tagalog-B2.folio-deck.json` | 1,500 |
| Tagalog C1 Advanced — built | `Tagalog-C1.folio-deck.json` | 1,500 |
| Tagalog Phrases and Expressions — built | `Tagalog-Phrases-and-Expressions.folio-deck.json` | 386 |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule.

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, marked spellings, aspects, roots, IPA | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Tagalog.jsonl`, 153 MB) | CC BY-SA 4.0 |
| frequency (1) | hermitdave/FrequencyWords, OpenSubtitles 2018, `tl_full.txt` (10,665 forms, ≈95 thousand tokens) | CC BY-SA 4.0 |
| frequency (2), example sentences | Tatoeba `tgl` exports (79,138 Tagalog sentences, ≈611 thousand tokens; 37,700 Tagalog–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 32.8 million, Wikipedia's infobox (Ethnologue 28th ed.), read 2026-11-09 | — |

## 3. The card

One note, two templates (Tagalog → English, English → Tagalog), `speechLang: 'fil-PH'` (the voices a
browser offers are filed as Filipino). Fields: `Tagalog` (the headword as ordinary writing spells it,
`maganda`), `Marked` (Wiktionary's marked spelling, `magandá`, only where it differs), `IPA`, `Word` (the
plain headword, what the speaker reads and what the level-below check compares), `English` (meanings by
part of speech), `Forms` (an affixed verb's three aspects — completed, ongoing, contemplated:
`kumain` · `kumakain` · `kakain` —, an adjective's plural `magaganda`, and the root with its affix where the
etymology names them, `kain + -um-`), `Examples` (up to three Tatoeba sentences, the word in bold, with a
speaker). **No "All forms" table**: Wiktionary's Tagalog conjugation tables come through the extraction with
most cells tagged `error-unrecognized-form`, so a table could not be labelled truthfully. The type's CSS is
`.claude/tagalog/card.css` (Romanian's, with `.uc-acc` for the marked spelling in place of `.uc-a`).

## 4. What Tagalog needs that no earlier set did — the findings

- **THE MARKS ARE A DICTIONARY'S, NOT THE LANGUAGE'S WRITING** (`tl.fold`). Wiktionary files headwords
  unmarked and keeps `magandá`, `batà`, `hindî` as the `canonical` form; subtitles and Tatoeba write no marks.
  The fold drops the acute, grave and circumflex (never the tilde of ñ); the card prints the plain word and,
  beneath it, the marked one, because the stress and the final glottal stop are not written and do change a
  word. 283 of A1's 500 carry a marked spelling, 496 an IPA.
- **A HYPHEN IS PART OF A WORD** (`mag-aral`, `araw-araw`), so a hyphenated token is never split — Romanian's
  clitic rule reversed. A leading apostrophe is a clipping (`'yan`, `'to`): dropped, and the remainder's count
  follows Wiktionary's pointer (`yan` → `iyan`).
- **POINTERS WRITTEN AS PROSE** (`extract.pointer_target`). Besides kaikki's `form_of` / `alt_of`, Tagalog
  Wiktionary writes many pointers only as a gloss — "superseded, pre-2007 spelling of puwede", "pronunciation
  spelling of mayroon", "progressive aspect of kumain". Unread, `kumakain` and `ginagawa` were dealt as A1
  words of their own; read, each passes its count to its lemma.
- **A LEMMA'S OWN SPELLING IS ITS OWN.** An affixed verb's aspect forms are often another lemma's headword:
  `masa`'s completed form is `nasa` "is at", `maari`'s contemplated form is `maaari` "may". Split by weight,
  the rarer lemma took most of the commoner word's count and `masa` "dough" became an A1 word.
- **THE LINKER** (`select.py`): Tagalog joins a vowel-final word to the next with -ng, and the subtitles count
  the joined spelling as a word — `tayong`, `pong`, `bang`, `batang`. Wiktionary's entry under that spelling is
  another word (`tayong` "a suspension of work", `pong` the mahjong set), so a lemma whose spelling is a
  commoner vowel-final lemma plus -ng is not dealt, unless it is a conjunction, preposition or adverb of its own
  (`nang` "when"). `ilang` (whose count is `ilan` + -ng, whose entry is "desert") is excluded by hand.
- **TWO THIN CORPORA, AVERAGED PER MILLION.** OpenSubtitles holds very little Tagalog; Tatoeba six times as
  much, with its contributors' habits (`espada`, `buhusan`, `igik` came from runs of one person's sentences and
  are excluded by name). The two lists are averaged per million so neither outweighs the other by size.
- **CAPITALISED NOUNS ARE THEIR OWN WORDS** (`extract.key_of`): `Linggo` "Sunday" and `linggo` "week", `Lunes`
  "Monday" and `lunes` "odd". A capitalised noun is keyed `cap:` + its fold, counted only where Tatoeba writes it
  capitalised inside a sentence, and matched to example sentences only with its capital. The months are filed
  as proper names (`Enero`, also a surname) and are kept as nouns with their first sense only.
- **THE VERB IS LEARNT AS ITS AFFIXED FORM**: the inventory writes `kumain`, `mag-aral`, `matulog`, never the
  root, which Wiktionary files as a noun (`kain` "act of eating").
- **ONE ETYMOLOGY PER CARD** and the hand tables in `build_deck.py` (`ETYMS`, `DROP_POS`, `DROP_GLOSS`, `LEAD`),
  each with its reason: `kaya` leads with "so, therefore", `baka` with "maybe", `malaman` is "to come to know",
  not "fleshy", `kailangan` loses two glosses of the homograph from `ilang`, `kapatid` its TV5 network senses.
- **A COMMON SPELLING FILED UNDER ANOTHER** (`marumi` under `madumi`, `istasyon` under `estasyon`): the card
  prints the spelling the inventory wrote and the target's meanings, but not the target's IPA, marked spelling
  or aspects, which belong to the other spelling.
- **GRAMMAR NOTES AS GLOSSES**: the markers' only meanings are notes ("marks a noun or noun phrase as the
  clause's pivot …"); a note kept as the one meaning is cut at its first clause (`shorten`).

**Known, left.** `kaniya` is taught in the 2007 orthography's spelling; the commoner `kanya` is a separate
Wiktionary entry ("menstruation") whose count is the pronoun's, so it is excluded. The fill carries Tatoeba's
and the subtitles' vocabulary of killing and dying (`patayin`, `pumatay`, `mamatay`) on frequency, as every
corpus-ordered deck on the shelf does. Days and months are dealt late (counted only where written capitalised).
8 of A1's 500 words have no Tatoeba sentence.

## 5. Phases

**Phase 1 (done)** — the pipeline, A1. **Phase 2** — A2 to C1, one level per session: write the level's
inventory into `inventory.py` and its `SCOPE` into `tl_level.py`, run, read every card, extend `EXCLUDE` /
`ETYMS` / `DROP_POS` / `DROP_GLOSS` with reasons. **Phase 3** — the phrases deck. **Phase 4** — a combined
file, gitignored (and a `PARTS` row in `.claude/combine-decks.py`).

## 6. As built (2026-11-09): A1

`python3 .claude/tagalog/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/tagalog-cache/` (gitignored, ~270 MB).
`node .claude/tagalog/check-tagalog.js` is the check. **A re-run is byte-identical** (verified, with and
without `--re-extract`). A1: 500 notes, 360 from the inventory (twenty-one topics) and 140 by frequency; IPA on
496, a marked spelling on 283, aspects on 91 of the 95 verbs, sentences for 492 (three for 479). The shelf's hue is
measured: first `#756366`, a muted taupe 16.5 from its nearest of 53 — which Swahili, measured in a parallel session, all but took (1.1 from it); re-swept at the merge against 67, outside the magenta band and the greens: `#2A72DB`, an azure 15.2 from its nearest (Greek, French).

## 7. As built (2026-11-12): A2

Asked for on 2026-11-12: "Add Tagalog A2". `python3 .claude/tagalog/run.py --level a2`; A1 rebuilds byte-identical
after every change below, and an A2 re-run is byte-identical. **750 notes, 465 from the inventory (nineteen topics:
relatives, work, clothes, the kitchen, fruit, the home, the town, travel, the natural world, animals, health,
feelings, free time, school, numbers and quantities, time words, colours, describing, everyday verbs, connectors)
and 285 by frequency**, none taught in A1 (`words_below`, read off the shipped A1 file). IPA on 735, a marked
spelling on 427, forms on 203 (140 verbs), sentences for 717 (three for 649).

What reading every card changed, each recorded with its reason in the code:
- **Inventory words left out** (`inventory.py`'s A2 comment): `parang` (Wiktionary files only "meadow"), `Ingles`
  (only "English (person)"), `tita` (only a slang sense), `daungan` (only "place for making a big ship"). Words
  Wiktionary does not file under the inventory's spelling were rewritten to a filed one (`plasa`, `paruparo`,
  `ipadala`, `gumamit`, `palitan`, `pahiram`, `kalihim`) or dropped (`magprito`, `tumigil`, `Pasko`, `internet` …).
- **A second etymology** (`ETYMS`): `sala` "living room", `kilo` "kilogram", `basa` "wet", `suka` "vinegar",
  `alas` "o'clock", `tahanan` "home", `mama` "mum" — each word's first etymology is a rarer homograph.
- **A rarer part of speech dropped** (`DROP_POS`): `sagutin`, `masabi`, `pakainin`, `tapusin`, `tanggapin`,
  `sabihan` — the verb is what the word is learnt as. **Glosses dropped** (`DROP_GLOSS`): slang or a homograph
  merged in (`patatas`, `halaman`, `kalihim`, and `barangay`'s precolonial sense, which hid the modern one).
  **Lead glosses** (`LEAD`): `mahusay` "skillful", `tapat` "sincere".
- **Fill exclusions** (`EXCLUDE`): English in the subtitles (`so`, `on`, `me`, `ya`), Tatoeba runs (`duke`,
  `tiyera`), a second spelling of an inventory word (`ganiyan`, `retrato`), `aling` (alin + -ng), `naglalakad`
  (maglakad's ongoing aspect filed as a noun), `nones` and `pitsa` (counts not their own), `yaon` (archaic),
  `bayag` (vulgar).

**Known, left.** The fill again carries some of the subtitles' violence (`barilin`, `lasunin`, `bangkay`), as A1's
does; 33 words have no Tatoeba sentence.

## 8. As built (2026-11-12): B1

Asked for on 2026-11-12: "Add B1". `python3 .claude/tagalog/run.py --level b1`; A1 and A2 rebuild byte-identical
and a B1 re-run is byte-identical. **1,000 notes, 294 from the inventory (seventeen topics: work, money, study,
health, the media, society and politics, the law, the environment, belief and culture, travel, relationships,
feelings, opinion and argument, abstract description, the verbs of change and of thought, connectors) and 706 by
frequency**, none taught in A1 or A2. IPA on 989, a marked spelling on 545, forms on 302 (203 verbs), sentences for
874 (three for 733).

- **THE INVENTORY IS THINNER THAN A2'S BECAUSE WIKTIONARY IS.** About a hundred of the first draft's 510 words are
  not filed under that spelling — most of them affixed verbs (`magplano`, `magpasya`, `iwasan`, `tanggihan`,
  `magpasalamat`), plus multi-word connectors (`sa halip`, `lalo na`) and loans (`email`, `website`). Where another
  affix of the root is filed it is written instead (`umiwas`, `itanggi`, `isali`, `magpaopera`, `maglarawan`);
  the rest were dropped, never given a meaning. About a hundred more were already taught by A1 or A2. So the fill
  is larger here, and reading it was most of the work.
- **A SECOND SPELLING OF A TAUGHT WORD** (`select.py`, from B1 up so the shipped levels are unchanged): the fill
  dealt `sombrero`, `kompiyuter`, `restoran`, `koryente`, `diyaryo`, `mantekilya`, `madumi` and `gayumpaman` —
  each the lemma that a word already taught (or this level's inventory) is filed under. A lemma a taught word
  points to is now treated as taught. (A2 excluded its two by hand: `ganiyan`, `retrato`.)
- **Exclusions** (`EXCLUDE`): more linker and clipping counts dealt under a homograph (`tsaka`, `palang`, `kalang`,
  `balang`, `satin`, `tong`, `taga`, `kamo`, `luko-luko`), English and Spanish in the subtitles (`la`, `elf`,
  `korea`), counts not the entry's (`kana`, `aya`), insults and swears (`hangal`, `gunggong`, `letse`, `utot`),
  `itik` and `bala` (shown by a sense that is not the word's), and `tita` / `daungan` (left out of A2 for it).
- **Etymologies** (`ETYMS`): `patas` "fair", `malas` "unlucky", `bisa` "visa" first. **Inventory**: `kaso:noun`
  (the lawsuit before the conjunction), and `tubo` and `murahin` dropped (no "profit"; "to slander").

**Known, left.** 126 words have no Tatoeba sentence. The fill keeps the subtitles' crime and death vocabulary
(`pagpatay`, `mamamatay-tao`, `magpakamatay`) on frequency, as the lower levels do.

## 9. As built (2026-11-12): B2

Asked for on 2026-11-12: "Add B2". `python3 .claude/tagalog/run.py --level b2`; A1, A2 and B1 rebuild
byte-identical and a B2 re-run is byte-identical. **1,500 notes, 273 from the inventory (fifteen topics: the
economy, government, the law, science, technology, the environment, medicine, education, the arts and media,
social issues, argument, description, character, verbs, connectors) and 1,227 by frequency**, none taught below.
IPA on 1,484, a marked spelling on 831, forms on 448 (283 verbs), sentences for 975 (three for 605).

- **THE INVENTORY WAS PROBED BEFORE IT WAS WRITTEN.** A draft of 557 words was checked against `lex.json` and the
  lower decks: 171 are not filed in Wiktionary under that spelling (most affixed verbs — `suriin`, `pigilan`,
  `ipagbawal`, `tanggihan` —, English loans like `software`, and phrases like `kawalan ng trabaho`) and 112 were
  already taught, so the inventory holds what is left (less `pandaigdigan`, whose entry is only a pointer). The
  B2 inventory is therefore heavy in Spanish- and English-derived abstract nouns (`ekonomiya`, `konstitusyon`,
  `implasyon`), which is what Wiktionary files; native affixed verbs come through the fill where it has them.
- **THE FILL IS FOUR FIFTHS OF THE DECK, and at this depth the two corpora are thin**: 525 words have no Tatoeba
  sentence. Reading it found the same faults as before at a higher rate (`EXCLUDE`, each with its reason):
  English and names counted under a Tagalog homograph (`am`, `was`, `look`, `boy`, `park`, `pan`, `asap`,
  `haha`, `sharon`, `washington`, `teksas`, `lisa`, `kristo`), verb forms filed as grammar terms or pointers
  (`naganap`, `nagaganap`, `isinama`, `sinama`, `iniba`, `paki`, `yari`), `masa` (A1's finding), Tatoeba runs
  (`postmaster`, `sigay`), and insults and vulgar words. `mani` loses a vulgar sense; `depresyon` leads with
  the mood, not the weather.

**Known, left.** The fill carries much food vocabulary (`tapsilog`, `longsilog`, `siyopaw`, `polboron`) from
Tatoeba's contributors, and the subtitles' crime vocabulary, on frequency.

## 10. As built (2026-11-12): C1

Asked for on 2026-11-12: "Add C1". `python3 .claude/tagalog/run.py --level c1`; A1 to B2 rebuild byte-identical
and a C1 re-run is byte-identical. **1,500 notes, 170 from the inventory (eleven topics: scholarship, history and
heritage, law and governance, economics, science and the mind, ethics and debate, the arts and literature with
the native forms — `salawikain`, `bugtong`, `talinghaga` —, description, character, verbs, connectors) and 1,330
by frequency**, none taught below. IPA on 1,489, a marked spelling on 821, forms on 418 (241 verbs); **sentences for
only 630 (three for 262) — 870 have none**, Tatoeba's Tagalog having little at this depth.

- **Probed as B2's was**: of 455 words drafted, 178 are not filed in Wiktionary (affixed verbs again — `suriin`,
  `pagnilayan`, `ipagtanggol` — and compounds), 105 were taught; `timawa` dropped on reading (its first sense is
  "glutton").
- **The frequency floor is low now** (the last word dealt has 1.6 per million averaged over the two corpora), so
  the fill is less a ranking than a sample of what the two corpora hold: Spanish loans, food, everyday objects,
  some slang (`epal`, `bagets`, `charing`). That is stated honestly by the description's wording ("the commonest
  remaining words"); no C1 list exists to do better from.
- **Exclusions** (`EXCLUDE`): more pointers (`tado`, `sahing`, `pinapaitan`, `nagbaon`, `nagbabaon`,
  `pinagtalunan`), grammar terms (`magaganap`), English (`element`, `real`, `award`, `warden`, `testing`, `limit`,
  `kamping`, `taping`), linker and verb-form counts under a homograph (`sapang`, `takdang`, `gagapang`, `mate`,
  `lingo`), vulgar words (`aa`, `umaa`), `suliranin` (only a flax sense; "problem" is not filed) and `menudo`.
  `pila` takes its second etymology, "line, queue".

## 11. As built (2026-11-12): the phrases deck

Asked for on 2026-11-12: "Add the phrases deck". `python3 .claude/tagalog/run.py --level phr` runs `phrases.py`
(new, Hindi's stage adapted) in place of `select.py`. **386 expressions in three subdecks**, the Indonesian, Turkish
and Hindi arrangement (`docs/lang-decks.md`, "THE PHRASES DECK"): **107 Phrases** (Wiktionary's multi-word phrases
and interjections not tagged idiomatic — `sa tingin ko`, `hindi ko alam`, `tao po`, `bahala na`), **267 Idioms**
(a multi-word entry with a sense tagged idiomatic — `mainit ang ulo`, `magsunog ng kilay`, `ilaw ng tahanan`) and
**12 Proverbs** (Wiktionary's part of speech). Nothing a level teaches is repeated (the levels' inventories teach
`sa wakas`, `una sa lahat` …). A re-run is byte-identical, and A1 to C1 rebuilt by the changed code are
byte-identical (the card's `sub` is read from the row, empty for a level).

- **THE ORDER**: within a subdeck, how many Tatoeba sentences contain the expression's words in sequence, then
  `lex.json`'s frequency estimate, then the spelling. Only 63 of the 386 occur in any Tatoeba sentence; 62 have
  sentences, 38 three. The description says so.
- **Excluded** (`phrases.EXCLUDE`, each with its reason): **phrasebook sentences** — Wiktionary's Tagalog phrases
  include a traveller's phrasebook (`wala akong pera`, `may kanser ako`, `tumawag ka ng pulis`, `naligaw ako`,
  `barado ang inodoro` …, 27 in all), which go by the Turkish and Hindi rule: a sentence built from level words
  is not a set phrase; the formulas stay (`magkano ito`, `ano'ng oras na`, `ilang taon ka na`). **Insults and
  oaths** glossed with obscenities (`mukha mo`, `ka diyan`, `anak ng putsa`, `pusang gala` …) and `berdeng dugo`
  (a derogatory idiom). **The same expression twice** (`hindi ko po alam`, `ano ga iyan`, a longer "how old are
  you", two joined Christmas-and-New-Year greetings) and **pointers** (`huli ka balbon`, `bahala na si Batman`,
  each "synonym of …"). `assalamu alaikum` (Arabic).
- **The check's Marked comparison now decodes HTML entities**: `ano'ng`, `buto't` carry an apostrophe, which the
  card escapes as `&#x27;`; the check compared the escaped text and failed eight correct cards.

**Known, left.** Wiktionary's idiom labels are the source's: a few the deck files as idioms a learner would call
plain (`noong una` "at first"). Sexist idioms (`ibong mababa ang lipad`, `lantang bulaklak`) are kept as
expressions a reader meets, their glosses Wiktionary's. Synonymous idioms are kept side by side (`kabiyak ng
dibdib`, `kapilas ng puso`, `karugtong ng buhay`, all "spouse"), the shelf's duplicate pass labelling them.
`.claude/combine-decks.py` has no Tagalog row (nor any language added since Aug 2026); Phase 4 is not done.

