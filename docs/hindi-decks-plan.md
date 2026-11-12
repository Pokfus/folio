# The Hindi language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Hindi deck in `decks/`.** It is the plan for an
eleventh language set in the shape of the ones already shipped (Russian TORFL, Indonesian UKBI, Turkish …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Hindi language collection."

**STATUS (2026-11-12): the alphabet deck and every level, A1 to C1, are built** (`.claude/hindi/`, §6–10).
The phrases deck is not.

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
| Hindi B2 Upper Intermediate — built | `Hindi-B2.folio-deck.json` | 1,500 |
| Hindi C1 Advanced — built | `Hindi-C1.folio-deck.json` | 1,500 |
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

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2 (done)** — A2 to C1, one level per session: write
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

## 8. As built (2026-11-12): B1

`python3 .claude/hindi/run.py --level b1`. 1,000 notes, 177 from the inventory and 823 by frequency; sentences
for 578, three for 285, none for 422 — Tatoeba's 13,300 Hindi pairs thin out fast past A2. A re-run is
byte-identical, and A1 and A2 rebuilt by the changed code are byte-identical to the shipped files. The
inventory (`inventory.py` `B1`) covers work and the economy, education, the news and technology, government
and law, the environment, health, travel, the household, relationships and the stages of life, feelings,
religion, ideas and plans, the connectors (`यानी`, `चूँकि`, `अर्थात`, `किंतु`, `परंतु` …), describing words and
the verbs of thinking and changing; most of what it names that A2's fill had not already dealt. 19 first-draft
words or multi-word verbs had no Wiktionary entry (`डिग्री`, `प्रोफ़ेसर`, `वोट`, `ऑपरेशन`, `पासवर्ड`, `तय करना`,
`फ़ैसला करना` …) and were dropped, or swapped for one that has an entry (`बेरोज़गार`, `उपाधि`, `प्रमाण`).

**Found on reading every card, and fixed:**
- `ETYMS`: `शुक्र` "gratitude" (not "resplendent; semen"), `बिल` "bill" and "hole".
- A "hyperforeign form of रिवाज" gloss (the nukta where it does not belong) is a spelling note, not a
  meaning, and is dropped (`build_deck.HYPER`); `रिवाज़` shows "custom, tradition".
- Two romanisations the extract lost are read off Wiktionary's Hindi headwords (`ROMAN`): `गर्भवती`
  garbhvatī, `उपग्रह` upgrah.
- New hand exclusions in `select.EXCLUDE`: `दिया` (its count is "gave", the past of देना), names (`संजय`,
  `शेखर`, `विक्टोरिया`, `सीज़र`, `दुर्गा`, `शास्त्री`), English counted under a Hindi spelling (`गूगल`, `बी`,
  `चेक`, `डील`, `लव`, `रोलना`, `लेसना`, `कोर`), the captions' `हाँक`, and counts belonging to another word
  (`हनना`, `चालना`, `बंधा`, `धत`).

**Known, left.** The fill's subtitle register is stronger here than at A2: crime, war and adult vocabulary
(`बलात्कार`, `वेश्या`, `अपहरण`, `मिसाइल`) is dealt on frequency, as the other subtitle-ordered decks deal it — none
of it is swearing, which `SWEARS` keeps out. Some first senses are the rarer ones Wiktionary lists first
(`पद` "foot" before "post", `दस्त` "hand (in compounds)").

## 9. As built (2026-11-12): B2

`python3 .claude/hindi/run.py --level b2`. 1,500 notes, 152 from the inventory and 1,348 by frequency; sentences
for 520, three for 151, none for 980 — past B1 Tatoeba's Hindi has little left to give, and the deck's
description says how many words have sentences. A re-run is byte-identical, and A1, A2 and B1 rebuilt by the
changed code are byte-identical to the shipped files. The inventory (`inventory.py` `B2`) is the register of
written and public Hindi: politics and administration, the law and the courts, the economy and finance, science,
technology, the environment, health and the mind, the arts and media, history and society, the words of
argument (`दावा`, `निष्कर्ष`, `पूर्वाग्रह`, `अवधारणा`), the formal connectors (`अतः`, `तथापि`, `अपितु`, `परिणामस्वरूप`,
`एवं`), and the verbs of reporting and analysing. 20 first-draft items had no Wiktionary entry — mostly
multi-word verbs (`तुलना करना`, `दावा करना`, `ज़ोर देना` …) and compounds (`विकास दर`, `वनों की कटाई`), with
`शेयर`, `सब्सिडी`, `नवीकरणीय`, `जवाबदेह` — and were dropped.

**Found on reading every card, and fixed:**
- `ETYMS`: `जूस` "juice" (not "pea broth"), `गौर` "attention" (ग़ौर करना) and "fair".
- A lemma whose only sense is a "hyperforeign form of" note (`पटाख़ा`) is no longer dealt by the fill — it
  reached the deck with an empty English side (`select.usable`).
- `SYNONYM` now resolves a two-word synonym (`त्यागना` "synonym of त्याग देना" → "to abandon, forsake"), and a
  synonym Wiktionary has no entry for is dropped rather than printed (`मध्यम` "synonym of मध्यदेश").
- New hand exclusions in `select.EXCLUDE`: `सकता` (the form of सकना that A1's note names), `उपशीर्षक`
  (counted from the subtitle files' credit lines), names (`मीरा`, `मोहन`, `मोहिनी`, `माधव`, `जया`, `गीता`, `रहीम`,
  `रहमान`, `सविता`, `शंकर`, `पटेल`, `गब्बर`, `क़ैसर`, `बेन`, `जुंग`, `बोबा`), English counted under a Hindi spelling
  (`होम`, `कुक`, `चिक`), and counts belonging to another word (`बे`, `रसना`, `बीजना`, `पंगा`).

**Known, left.** At B2 the fill reaches lemmas counted 5–10 times in the subtitles, so its ranking is coarse;
some rarer verbs (`सारना`, `सनकना`, `छड़ना`) are dealt on counts that may belong to a commoner word and were not
proven either way. Adult vocabulary is dealt on frequency, as at B1. Some first senses are the rarer ones
Wiktionary lists first (`त्रुटि` "a unit of time" before "error", `शनि` "slow" before "Saturn").

## 10. As built (2026-11-12): C1

`python3 .claude/hindi/run.py --level c1`. 1,500 notes, 133 from the inventory and 1,367 by frequency; sentences
for 318, three for 79, none for 1,182. A re-run is byte-identical, and A1 to B2 rebuilt by the changed code are
byte-identical to the shipped files. The inventory (`inventory.py` `C1`) is the Sanskrit-derived vocabulary of
formal and scholarly Hindi: philosophy and ethics, religion and the inner life, scholarship, the constitution,
development economics, medicine, law and rights, language and literature (`अलंकार`, `उपमा`, `छंद`, `गद्य`),
the shades of feeling (`विषाद`, `ग्लानि`, `वैराग्य`), the abstract nouns and adjectives of formal prose, and the
literary adverbs (`अतएव`, `प्रायः`, `सर्वथा`, `क्रमशः`). **Wiktionary is thin at this level: 49 of the first
draft's items have no entry** (`अंतरात्मा`, `वैश्वीकरण`, `सहिष्णुता`, `दीर्घकालिक`, `वस्तुतः`, every multi-word
term …) and were dropped; two more were taken out because Wiktionary's only sense is not the one the level
wants (`रूपक` "nickel", lacking "metaphor"; `निरोध` "condom", lacking "restraint, detention"). None was given a
meaning by hand.

**THE FILL IS WEAK HERE, and the deck is honest about it only in this note.** Past B2 the subtitle list's
lemmas are counted three or four times each, so the ranking is close to noise: the fill is everyday words a
C1 learner may still lack (`अचार`, `गोभी`, `कुहनी`, `मूँगफली`), registers of literary Hindi, and the residue of
names and borrowings the exclusions below catch. It is still Wiktionary's meaning on every card, and none of it
repeats a lower level.

**Found on reading every card, and fixed:**
- Three romanisations the extract lost are read off Wiktionary's Hindi headwords (`ROMAN`): `कुंडली` kuṇḍlī,
  `मैल` mail, `सर्वथा` sarvathā.
- New hand exclusions in `select.EXCLUDE`: counts belonging to another word (`चंद` "moon" ← "a few", `चल`, `फेंक`
  ← the imperatives, `कहनी`, `मूझना`), English counted under a Hindi spelling (`ओक` ← "OK", `पिक`, `सेम`, `सन`,
  `कोला`, `लावा`, `लोन`, `पिंग`, `ज़ार`), and given names and surnames (`इला`, `मित्रा`, `शांता`, `केतकी`, `अरुण`,
  `ललित`, `विक्रम`, `हरि`, `रजनी`, `रीता`, `जोशी`, `जुगल`).

**Known, left.** The weak fill above; a few low-count verbs whose counts may belong to commoner words were not
proven either way. The phrases deck (Phase 3) is next.
