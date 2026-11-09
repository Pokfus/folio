# The Hindi language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Hindi deck in `decks/`.** It is the plan for an
eleventh language set in the shape of the ones already shipped (Russian TORFL, Indonesian UKBI, Turkish …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Hindi language collection."

**STATUS (2026-11-09): the alphabet deck, A1, A2 and B1 are built** (`.claude/hindi/`, §6–§8). B2, C1
and the phrases deck are not.

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
| Hindi B1 Intermediate — built | `Hindi-B1.folio-deck.json` | 1,000 |
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

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** (A2 and B1 done) — A2 to C1, one level per session: write
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

## 7. As built (2026-11-09): A2

`python3 .claude/hindi/run.py --level a2 --no-fetch`. 750 notes, **317 from the inventory and 433 by
frequency**; three sentences for 441, none for 128 (the inventory's household words — `घी`, `साबुन`,
`तौलिया` — have no Tatoeba sentence). The sources were re-fetched first and A1 came out byte-identical;
after every A2 rule below, A1 and the alphabet were rebuilt and are still byte-identical, and an A2 re-run
is too. `SCOPE['a2']` quotes the CEFR A2 global descriptor (the TORFL deck's wording); the description's
"for a beginner" became `WHO[LEVEL]`.

**The inventory** (`inventory.A2`, 19 topics, 326 words written). Not Wiktionary headwords, reported and
dropped: `पोती` (only a "female equivalent of पोता" form entry; `पोता` is taught), `ड्राइवर`, `दफ़्तरी`,
`कप`, `आजकल`, `बाद में`, `भरा` (a form of `भरना`), `की वजह से` (taught as `वजह`). Written in Wiktionary's
spelling instead: `कापी` (not कॉपी), `कालिज` (not कॉलेज), `कुरता` (not कुर्ता), and `कभी कभी` / `धीरे धीरे`
spaced, not hyphenated. Words the A1 deck already teaches (`मौसम`, `गरम` …) are skipped by
`words_below`. The months are common nouns in Wiktionary and resolve.

**The findings, each a rule:**
- **A word taught under one spelling is taught under every spelling.** A1's `गरम` is Wiktionary's
  alternative spelling of `गर्म`, and A2's fill dealt `गर्म` — the same word twice across two decks, which
  `check-hindi.js` cannot see (two spellings). `select.py` now adds each lower-level word's `alt_of`
  target to the "below" set, and an inventory word that resolves through a pointer (`साइकिल` → `साइकल`)
  marks its target seen, so the fill does not deal `साइकल` beside it.
- **THE FOLD'S COLLISIONS.** Dropping the nukta merges unrelated words, and the frequency follows the
  commoner: `जरा` "senility" carried the count of `ज़रा` "a little", `ज़ाती` "inherent" that of `जाती`
  (`जाना`'s feminine), `गलना` "to melt" that of `ग़लती` "mistake", `कोड़ी` that of the name Cody, `गुड़`
  "jaggery" that of the English "good". Where the everyday word is under the key, the card takes its
  spelling and its entries (`HEADWORD`: `ज़रा`, `तेज़`; `ETYMS`, `GLOSS` dropping तेज "lustre");
  otherwise the lemma is excluded with its reason.
- **Names in the subtitles**: `सिकंदर`, `इंदु`, `जगदीश`, `समीर`, `प्रिया`, `दिव्या`, `ख़ान`, `हाँकना`
  (Hank), `बेलना` — each a dictionary word whose count is a person. **Sound captions**: `कराहना`,
  `हाँफना` ([कराहता है], [हांफते हुए]). **A lemma whose count is another's forms**: `सो` (the stem of
  `सोना`), `करनी` (`करना`'s feminine infinitive), `दुखना`, `रंगना`, `सीना`, `छाना`, `धरना`, `जन्मना`.
  All in `select.EXCLUDE` (30 lines for A2), each with its reason; `कुतिया` joins `SWEARS`.
- **A POINTER GLOSS is resolved, not shown**: "synonym of जल्दी (jaldī)", "synonym of निज (nij)", "a
  alternative form of मुहल्ला (muhallā)" are replaced by the target's own glosses for the same part of
  speech (`POINTS`, `resolve` in `build_deck.py`). A1 has none, so it is unchanged.
- **A part of speech to lead with** (`POS_FIRST`): `तुलना` "comparison" (not "to be weighed"), `रक्त`
  "blood" (not "red"), `गुरु`, `जल्द`, `असल`, `तेज़`; and `पूर्व:noun` / `दक्षिण:noun` in the inventory.
  More `ETYMS` (`पीठ` "back", not "seat"; `हल` "solution" before "plough"; `गाना` "song" and "to sing")
  and `LEAD` (`कक्षा` "class", `जबकि` "whereas", `दौरान`, `दक्षिण` "south").
- **Slang senses are cut by hand, not by tag** (`CUT`: `बकरी` "smartphone", `भैंस` "laptop computer",
  `टोपी` "glans", `हथियार` "the penis", `गुरु` "a smartass"). Cutting every gloss tagged `slang` or
  `colloquial` was tried and rejected: it changed eight A1 cards, among them `हम` "I" and `यार` "bro".
- `फ़िल्म` has no romanisation in Wiktionary except its plural's: `ROMAN_BY_HAND` (the alphabet deck's
  precedent). `माता-पिता` "parents" is hyphenated: `check-hindi.js` allows a hyphen in `Word`.

**Known, left.** The fill carries the subtitles' register — `हत्या`, `हथियार`, `सबूत`, `लेफ्टिनेंट`,
`राक्षस`, and forms of address (`साहिब`, `श्रीमान`, `मैडम`) beside A1's `सर`, `महोदय` — on frequency, as
A1's does. `सामना` "confrontation" shares `सामने` with A1's `के सामने`; it is a word in its own right
(`सामना करना`) and is kept. Wiktionary's tables still give uncountables and months a plural (`मइयाँ`).

## 8. As built (2026-11-09): B1

`python3 .claude/hindi/run.py --level b1 --no-fetch`. 1,000 notes, **229 from the inventory and 771 by
frequency**; three sentences for 283, none for 412 — Tatoeba's 13,300 Hindi sentences thin out fast past
the commonest words, and the frequency list does too (a B1 fill word is counted 20 to 150 times in
21,309 forms). A1, A2 and the alphabet still rebuild byte-identical after every B1 rule; a B1 re-run is
byte-identical. `SCOPE['b1']` quotes the CEFR B1 global descriptor (the TORFL deck's wording).

**The inventory** (`inventory.B1`, 15 topics, 230 words written; the rest are already in A1 or A2, the
reason the inventory share is smaller than A2's). Not Wiktionary headwords, reported and dropped:
`डिग्री`, `प्रोफ़ेसर`, `प्रमाणपत्र`, `चैनल`, `पासवर्ड`, `सवारी`, `बेरोज़गारी`, `ऑपरेशन`, `शर्मिंदा` (replaced by
Wiktionary's `शर्मसार` "ashamed"), `बिगाड़ना`, `शरारती`.

**The findings, each a rule:**
- **More homographs whose first etymology is the rare one** (`ETYMS`): `मर्द` "man" (not "rubbing"),
  `शुक्र` "gratitude" (not "semen"), `चेक` "cheque" (not "Czech"), `बिल` "bill" (not "hole"), `राय`
  "opinion" (not "king"), `कोट` "coat" (not "fort"), `कुल` "total" before "lineage". `ताली` leads with
  "clapping" (`LEAD`): its "key" is A1's `चाबी`.
- **A second spelling Wiktionary files as a lemma of its own** is invisible to the `alt_of` rule of §7:
  `अमरीकी` (A2 has `अमेरिकी`), `छुपाना` / `छुपना` (`छिपाना` / `छिपना`), `दवाई` (`दवा`), `बाएँ` (the oblique of
  `बायाँ`), `महाराज` beside `महाराजा`. Found by comparing every B1 card's first gloss with A1's and A2's;
  excluded by hand. The other shared glosses are true synonyms — `जल` / `पानी`, `विवाह` / `शादी`, `आवश्यक` /
  `ज़रूरी` — which a B1 learner should meet, and are kept.
- **A hyperforeign spelling**: `रिवाज़` is "hyperforeign form of रिवाज" in Wiktionary. An entry that only
  points at its own key's other entry is dropped (`entries_for`), `POINTS` reads "hyperforeign form of",
  and `HEADWORD` prints `रिवाज`.
- **Names, English words and other words' forms** in the fill, each in `select.EXCLUDE` with its reason
  (27 lines for B1): `संजय`, `शेखर`, `शास्त्री`, `सीज़र`, `विक्टोरिया`, `दुर्गा`; `डील`, `लव`, `गूगल`, `कोर`;
  `दिया` (देना's past — A1's finding, met again as a noun), `जनना` (`जनता`), `चालना` (`चाल`), `हनना`
  (`हनी` "honey"), `रोलना` (`रोल` "role").
- **More slang cuts** (`CUT`): `चालू` "smartass", `तोप` "badass", `हिलाना`, `संयोग`; and `कविता`'s "a
  female given name".
- `उपग्रह` and `गर्भवती` have no romanisation of their own; `ROMAN_BY_HAND` takes Wiktionary's, read where
  another entry links them (`कृत्रिम उपग्रह` kŕtrim upagrah; garbhavtī).

**Known, left.** The fill is thicker with the subtitles' register than A2's (`हत्यारा`, `बंधक`, `मिसाइल`,
`गिरोह`) and with formal Sanskrit words the subtitles' translators favour (`आत्मसमर्पण`, `गुरुत्वाकर्षण`,
`परिधि`); both are frequency, as on every subtitle-ordered deck. A few low counts could not be traced to
another word and were kept (`काई`, `पुताई`, `चक़मक़`, `मलेशियाई`): at this depth one film can make a word.

