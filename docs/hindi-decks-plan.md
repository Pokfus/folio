# The Hindi language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Hindi deck in `decks/`.** It is the plan for an
eleventh language set in the shape of the ones already shipped (Russian TORFL, Indonesian UKBI, Turkish …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Hindi language collection."

**STATUS (2026-11-12): the alphabet deck, A1 and A2 are built** (`.claude/hindi/`, §6–7). B1 to C1 and
the phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one line and one bump, because it
also changed the APP (the shelf's hue in `app.js`) — the Turkish and Russian precedent.

## 1. The owner's decisions (2026-11-09)

1. **Word source: CEFR A1–C1, assembled** (the UKBI / TORFL arrangement). No exam board publishes a graded
   Hindi word list, so each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR
   global descriptor for its band, topped up with the commonest remaining lemmas. Each deck's description
   says so in plain words. Sizes: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**, then a phrases
   deck.
2. **A Devanagari alphabet deck, yes** — first in the collection.
3. **Romanisation on every word card, yes** — Wiktionary's own (khānā, ma͠i), the `Roman` field.
4. **This session: plan + alphabet + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Hindi Alphabet (Devanagari) — built | `Hindi-Alphabet.folio-deck.json` | 59 |
| Hindi A1 Beginner — built | `Hindi-A1.folio-deck.json` | 500 |
| Hindi A2 Elementary — built | `Hindi-A2.folio-deck.json` | 750 |
| Hindi B1 Intermediate | `Hindi-B1.folio-deck.json` | 1,000 |
| Hindi B2 Upper Intermediate | `Hindi-B2.folio-deck.json` | 1,500 |
| Hindi C1 Advanced | `Hindi-C1.folio-deck.json` | 1,500 |
| Hindi Phrases and Expressions | `Hindi-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule; "Alphabet" sorts first.

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms, romanisation | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Hindi.jsonl`, 170 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `hi_full.txt` (21,309 forms — small) | CC BY-SA 4.0 |
| example sentences | Tatoeba `hin` exports (≈13,300 Hindi–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 345 million, Census of India 2011, via Wikipedia's infobox, read 2026-11-09 | — |

## 3. The card

One note, two templates (Hindi → English, English → Hindi), `speechLang: 'hi-IN'`. Fields: `Hindi` (the
headword), `Roman`, `Word` (what the speaker reads), `English` (meanings by part of speech, a noun's gender
in its label), `Forms` (a noun's plural and oblique plural, an adjective's feminine, a verb's past —
`गया`, `किया`, `दिया`, where Hindi verbs are irregular), `Table` (behind a fold: a verb's key forms, present,
future, subjunctive and imperative by person; a noun's direct / oblique / vocative; a pronoun's case forms),
`Examples` (up to three Tatoeba sentences, the word in bold, with a speaker). The type's CSS is
`.claude/hindi/card.css` (the Russian type's, plus `.uc-rom` / `.uc-fr` for the romanisation).

## 4. What Hindi needs that no earlier set did — the findings

- **THE FOLD** (`hi.fold`): the nukta is optional in ordinary writing (`ज़रूर` / `जरूर`) and chandrabindu and
  anusvara are used interchangeably (`हूँ` / `हूं`, the subtitles' spelling). Every match — frequency,
  inventory, sentences — goes through the fold; the card prints Wiktionary's spelling.
- **A LEMMA FREQUENCY, and three rules found by reading the ranking.** Counts are summed over each lemma's
  table and over every entry that says it is a form of it (`है`, `हूँ` → `होना`); a form several lemmas
  share is split in proportion (the TORFL rule). (1) **An indeclinable word's own spelling is its own** —
  split, `फिर` "again" made `फिरना` a top-100 word and `पीछे` "behind" made `पीछा`. Only for a closed-class,
  adverb or indeclinable-adjective entry: given to EVERY headword (Turkish's rule as written), it handed `कर`
  to "hand; tax", `दिया` to "lamp", `सकता` to "apoplexy" and `दी` to "elder sister". (2) **A verb's
  feminine infinitive claims nothing**: `पानी` "water" is also `पाना`'s feminine infinitive, and the split left
  A1's commonest noun at a count of 0.45, dealt last. (3) A multi-word lemma's table never claims a single
  word; multi-word lemmas (`के लिए`) are dealt by their rarest word's count, halved, and the fill takes none.
- **POINTER ENTRIES THE INVENTORY NEEDS.** The possessives (`मेरा` "genitive of मैं; my, mine") and `वे` are
  form-of entries, and `कुर्सी` / `गरम` are filed as alternative spellings of `कुरसी` / `गर्म`. `extract.py`
  keeps both kinds as pointers; the fill never takes one, an inventory word resolves through them.
- **ONE ETYMOLOGY PER CARD** (`ETYMS` in `build_deck.py`): Hindi homographs from unrelated sources are many
  (`में` "in" / "baa", `पाना` "to get" / "spanner", `मत` "not" / "opinion", `अगर` "if" / "agarwood", `कार`
  "car" / "tax"). The first etymology is kept unless the table names others, each with its reason.
- **"nuqtaless form of X"** is a sense Wiktionary leaves untagged inside many real entries; it is cut by text
  (`extract.POINTER`), as are stray wiki brackets ("[essential]]").
- Hand exclusions from the fill, each with its reason in `select.EXCLUDE`; swearing in `SWEARS`.

**Known, left.** Wiktionary's generated noun tables give uncountables a plural (`पुलिसें`, `आगें`, `देरें`)
— the source's table, shown as it is. Irregular past forms sometimes carry no romanisation (`गए`, `गई`). The
fill carries the subtitles' crime-drama vocabulary (`गोली`, `बंदूक़`, `हमला`) on frequency, as every
subtitle-ordered deck on the shelf does. 7 of A1's 500 words have no Tatoeba sentence.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 (done) to C1, one level per session: write
the level's inventory into `inventory.py` and its `SCOPE` into `hindi_level.py`, run, read every card.
**Phase 3** — the phrases deck (`phrase` / `proverb` entries and idiomatic multi-word lemmas). **Phase 4** —
a combined file, gitignored.

## 6. As built (2026-11-09): the alphabet and A1

`python3 .claude/hindi/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py`
→ `examples.py` → `build_deck.py`, caching in `.claude/hindi-cache/` (gitignored, ~280 MB);
`python3 .claude/hindi/alphabet.py` writes the alphabet deck (reads `lex.json` for the example words'
romanisations; two by hand, `ROMAN_BY_HAND`). `node .claude/hindi/check-hindi.js` is the check. **A re-run
is byte-identical** (verified for both decks). A1: 500 notes, 281 from the inventory and 219 by frequency;
three sentences for 471, none for 7. The alphabet: 59 notes — 11 vowels (each shown alone and as its sign
on क), 4 signs, 33 consonants, the 2 flaps, 4 conjuncts, 5 nukta letters; every sound side unique (asserted).
The shelf's hue is measured: `#9F51B4`, 21.2 from its nearest of 45.

## 7. As built (2026-11-12): A2

`python3 .claude/hindi/run.py --level a2`. 750 notes, 241 from the inventory and 509 by frequency; sentences
for 614, three for 426, none for 136 (Tatoeba's Hindi is small). A re-run is byte-identical, and A1 rebuilt
by the changed code is byte-identical to the shipped file. The inventory (`inventory.py` `A2`) covers
relatives, work, jobs, clothes, cooking, the home, the town, the countryside and animals, seasons and
directions, the months, the numbers to a crore, travel, health, feelings, free time and festivals, time words,
opinion words, describing words and everyday verbs, with Wiktionary's multi-word verbs (`मदद करना`,
`कोशिश करना`, `इंतज़ार करना` …), which the fill never deals. 14 first-draft words had no Wiktionary entry
(`पोती`, `सूरज`, `सूर्य`, `ड्राइवर`, `बालकनी`, `होली`, `दिवाली` — `दीवाली` points at it, and it is missing too —
…) and were dropped or swapped for a spelling that has one (`कालेज`, `कापी`, `कुरता`, `चालक`, `मुहल्ला`), never
given a meaning by hand. The deck's description now names the learner by level (`WHO`), not "a beginner".

**Found on reading every card, and fixed:**
- **Homographs whose first etymology is the wrong word** (`ETYMS`): `राय` "opinion" (not "king"), `पीठ`
  "back" (not "seat"), `सीना` "chest" and "to sew", `जरा` "a little" (not "infirmity"), `धरना` "to hold" and
  "sit-in".
- **A gloss that only names a synonym** ("synonym of जल्दी (jaldī)") is given the synonym's own first
  meaning with the synonym named (`build_deck.SYNONYM`): `जल्द`, `असल`, `निजी`.
- **A suffix** (`-वाला`) is no longer dealt by the fill (`select.py`, Bengali's rule).
- `हथियार`'s vulgar third sense is left out (`GLOSS`); `फ़िल्म`'s romanisation, lost by the extract, is
  Wiktionary's `film` (`ROMAN`); `check-hindi.js` accepts a hyphenated headword (`माता-पिता` "parents").
- New hand exclusions, each with its reason in `select.EXCLUDE`: given names counted as words (`इंदु`,
  `जगदीश`, `समीर`, `प्रिया`, `दिव्या`, `ख़ान`, `सिकंदर`), the subtitles' sound captions (`कराहना`, `हाँफना`,
  `हाँकना`), English counted under a Hindi spelling (`गुड़` ← "good", `मिस`, `हाउस`, `डी`, `कोड़ी` ← "code"), and
  counts belonging to another word (`गलना`, `सो`, `करनी`, `ज़ाती`, `हा`); `कुतिया` joins `SWEARS`.

**Known, left.** The fill carries the subtitles' register (`हत्या`, `बम`, `आतंकवादी`, `लेफ्टिनेंट`, `परमाणु`)
on frequency, as A1 does; `तुलना` leads with Wiktionary's verb "to be weighed" before the noun "comparison".
