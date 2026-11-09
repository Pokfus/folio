# The Tagalog language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Tagalog deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped (Romanian, Hindi, Russian TORFL, Indonesian UKBI …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Tagalog language collection."

**STATUS (2026-11-09): A1 is built** (`.claude/tagalog/`, §6). A2 to C1 and the phrases deck are not.

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
| Tagalog A2 Elementary | `Tagalog-A2.folio-deck.json` | 750 |
| Tagalog B1 Intermediate | `Tagalog-B1.folio-deck.json` | 1,000 |
| Tagalog B2 Upper Intermediate | `Tagalog-B2.folio-deck.json` | 1,500 |
| Tagalog C1 Advanced | `Tagalog-C1.folio-deck.json` | 1,500 |
| Tagalog Phrases and Expressions | `Tagalog-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

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
measured: `#756366`, a muted taupe 16.5 from its nearest of 53 (France's slate and the Cold War's).
