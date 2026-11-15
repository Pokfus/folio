# The Amharic language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Amharic deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped (Zulu, Hausa, Hindi …); `docs/lang-decks.md` is the
record of how those were built, and every rule there applies here unless this file says otherwise. Asked for
on 2026-11-15: "Add an Amharic language collection." The owner was not asked: the Zulu and Hausa owners'
answers to the same questions, for sources as thin as these, were taken.

**STATUS (2026-11-15): all four planned decks are built** — the fidäl deck, A1, A2 and B1 (`.claude/amharic/`, §6).
B1 holds 494 notes, not 1,000: what the source has left after A2 (§6).

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for a later deck this plan produces. The collection's first commit carried a line and a bump because it also
changed the APP (the shelf's hue in `app.js`) — the Hebrew and Zulu precedent.

## 1. The decisions (2026-11-15, taken from the Zulu and Hausa owners)

1. **Levels: CEFR A1–B1, assembled, at 500 / 750 / 1,000 notes** — the Zulu and Hausa sizes. English
   Wiktionary has about 2,300 Amharic words (2,058 lemmas once spellings are joined, §4), so A1 + A2 + B1
   use most of them; **no B2 or C1**, for want of a source. Each level is a hand-written topic inventory
   (`inventory.py`) scoped to the CEFR global descriptor, topped up by lemma frequency.
2. **An alphabet (fidäl) deck first**, Hindi's counterpart: Amharic is written in the Ethiopic script.
3. **Romanisation on every card** (Hindi, Hausa): Wiktionary's own, under the headword.
4. **No hand glosses** (Zulu, not Hausa): a word Wiktionary lacks is listed in `inventory.py` and not taught.
5. **No speaker button** (Hausa): few devices carry an Amharic voice (§3).
6. **This session: plan + generator + the fidäl deck + A1 + the shelf entry**; A2 and B1 one per session.

| deck | file | notes |
|---|---|---|
| Amharic Alphabet (Fidäl) — built | `Amharic-Alphabet.folio-deck.json` | 44 |
| Amharic A1 Beginner — built | `Amharic-A1.folio-deck.json` | 500 |
| Amharic A2 Elementary — built | `Amharic-A2.folio-deck.json` | 750 |
| Amharic B1 Intermediate — built | `Amharic-B1.folio-deck.json` | 494 (planned 1,000) |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule; "Alphabet" sorts first.

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, romanisation, gender, plurals, declension, usage examples | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Amharic.jsonl`, 4.9 MB, 2,477 entries) | CC BY-SA 4.0 |
| frequency | the Amharic Wikipedia, `amwiki-20261101-pages-articles.xml.bz2` (14,255 articles, 1.74 M tokens), pinned | CC BY-SA 4.0 |
| example sentences | Tatoeba `amh` exports (314 sentences, about 250 with an English translation) | CC BY 2.0 FR |
| the romanisation table (`am.SYL`) | Wiktionary's `Module:Ethi-translit`, checked character for character 2026-11-15 | CC BY-SA 4.0 |
| the fidäl deck's sounds | Wikipedia, "Amharic" § Phonology and "Ge'ez script", read 2026-11-15 | CC BY-SA 4.0 |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 35 million L1 (34.9, 2020), 60 million in all (2019–2020), Ethnologue 28th ed., via Wikipedia's infobox, read 2026-11-15 | — |

Checked and unusable: hermitdave/FrequencyWords has no Amharic list (404); Tatoeba is too small to count.

## 3. The card

One note, two templates (Amharic → English, English → Amharic), `speechLang: 'am-ET'`. Fields: `Amharic`
(the headword), `Roman` (the romanisation), `Word` (the plain headword; the check and the next level's
de-duplication read it), `English` (meanings by part of speech, a noun's gender in its label), `Forms`
(a noun's plural and definite "the …", a verb's infinitive, the word's other spellings, each with its
romanisation), `Examples` (up to three; Wiktionary's carry its romanisation). The CSS is Hausa's (Hindi's),
plus `.uc-exr` for an example's romanisation.

- **A verb is Wiktionary's lemma, the third-person perfective** (ገዛ "he bought", glossed "to buy"), the
  form Amharic dictionaries list; its infinitive comes from the infinitive's own page ("infinitive of
  በላ" gives በላ the infinitive መብላት). **A verb Wiktionary has ONLY as an infinitive page glossed "to …" is
  taught by that infinitive** (መምጣት "to come", ማወቅ "to know", መስጠት "to give").
- **NO SPEAKER BUTTON.** Almost no phone or browser has an Amharic voice (some Windows voices do); a browser
  asked for one without it falls back to another voice, which cannot read the Ethiopic script at all.
  `check-amharic.js` fails on a speaker button.

## 4. What Amharic needs that no earlier set did — the findings

- **THE SCRIPT IS READ BY CODE POINT** (`am.SYL`): the Ethiopic block lays each consonant out as a row of
  eight (seven orders and the labialised -ʷa), with five-form labialised rows for ḳ ḫ k x g; the table is
  generated from the rows and was checked against Wiktionary's own (the seven characters it lacks — ፙ ፘ ፚ
  and the ŋʷ forms — never occur in Amharic).
- **THE KEY** (`am.key`): every match compares a Latin key, built syllable by syllable, never the script.
  The sixth order adds no vowel, so ቤት "bet" and ቤቱ "betu" share their consonants and a suffix peels off
  as letters even though the script changes the last letter's shape.
- **THE HOMOPHONE LETTERS FOLD TOGETHER** — ሀ ሐ ኀ, ሰ ሠ, አ ዐ, ጸ ፀ, and the first order of h and the vowel
  carrier read "a" (ሀ = ሃ, አ = ኣ). Amharic says each set alike and spells common words any way
  (ውሃ / ውሀ / ውኃ "water"; ፀሐይ / ጸሀይ "sun"), so a strict match would split one word three ways.
  **One lemma per key**: Wiktionary's separate pages for ውሃ and ውኃ are one card, headed by the spelling
  the Amharic Wikipedia writes most (`spell` counts), the others under "also spelt".
- **THE FOLD ALSO JOINS TRUE HOMOGRAPHS**: ዓመት "year" and አመት "maidservant", ልዑል "prince" and ሉል "pearl",
  ሴት "woman" and እሴት (the prothetic እ also folds to nothing). Their counts are shared (unavoidable from
  the script), but a card shows **only the headword's own entries and the pages that name it** as an
  alternative or share a gloss (`build_deck.entries_for`) — so ዓመት's card says "year", not "handmaid".
- **THE AFFIXES ARE PEELED, AS A FALLBACK** (`am.stems`): the prepositions written onto the word (በ- ለ- የ-
  ከ- እንደ- ስለ- ወደ-, and the vowel-dropping ባ- ላ- before አ), the definite and possessive endings, the
  plural -očč, the object -n, the clitics -m -s -na, and a perfective verb's person endings (ሄድኩ → ሄደ, by
  re-adding -ä). A key some lemma lists goes to it whole; only an unlisted key is peeled, up to three
  layers, to the first stem a lemma lists (of three letters or more). 35% of the corpus's counted keys
  reach a lemma — most of the rest are names.
- **VERBS ARE COUNTED POORLY**: Wiktionary gives an Amharic verb no conjugation table, and its imperfective
  is another stem (ይሄዳል "he goes" for ሄደ). Verbs rank lower than they are used; the inventory carries
  the everyday ones whatever their count, and the deck's description says so.
- **INFINITIVE TWINS**: a few infinitive pages carry their own gloss beside the verb's (መግዛት "to buy" and
  ገዛ "to buy"). The fill skips an infinitive whose first gloss is a verb's that is taught
  (`select.infinitive_twin`); twins whose glosses differ are excluded by name (መሆን, መግባት, መስራት, መያዝ).
- **WIKTIONARY'S ROMANISATION IS USED, NORMALISED** (`build_deck.romanise`): a few pages type their own in
  another system (q for ḳ, j for ǧ, ǝ for ə, no ʾ before an opening vowel); those letters are put into the
  standard system the fidäl deck teaches. One that still disagrees with the script (ምክንያት "mikiniyati")
  is replaced by the character romanisation without its final ə.
- **WIKTIONARY'S GENERATED DECLENSION TABLES HAVE TWO FAULTS**, both caught on reading A1: a word in -w
  gets a doubled definite (ሰው → "ሰውው"), and a few carry a character outside the alphabet (ፀሐይ →
  "ፀሐዯ"). Neither is shown; `check-amharic.js` fails on the second.
- **THE CORPUS IS ENCYCLOPAEDIC.** Its formulae and headings top the raw counts — ምንጭ (the "Sources"
  heading), the calendar formula የዘመን አቆጣጠር, በኩል "through" counted to ኩል "antimony" — and the months
  of the Ethiopian calendar are frequent from the date lines. `select.EXCLUDE` names each with its reason
  (the months are left for A2 as a set); the fill still reads encyclopaedic (history, government, religion).

**Known, left.** Words A1 would have and English Wiktionary does not, so the deck cannot teach them: አዎ
"yes", አይ "no", እና "and", ግን "but", ለምን "why", ስንት "how many", እዚህ / እዚያ "here / there", ሄደ "to go",
ትምህርት ቤት "school", ልጃገረድ "girl", ቀኝ "right", ቅርብ "near", የለም "there is not" (the full list is in
`inventory.py`). 93 of A1's 500 words have an example sentence. A noun shows a plural or a definite form
only where Wiktionary has one (102 cards have forms). Tatoeba's sentences are printed as written, typos
and all.

## 5. Phases

**Phase 1 (done)** — the pipeline, the fidäl deck, A1. **Phase 2 (done)** — A2, then B1. **Phase 3** — a phrases deck only if asked (Wiktionary
has 7 Amharic phrase entries and one proverb).

## 6. As built (2026-11-15)

`python3 .claude/amharic/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `wikitext.py` →
`extract.py` → `select.py` → `examples.py` → `build_deck.py`, caching in `.claude/amharic-cache/`
(gitignored, ~130 MB); `python3 .claude/amharic/alphabet.py` writes the fidäl deck (reads `lex.json` and the
A1 deck). `node .claude/amharic/check-amharic.js` is the check. **A re-run is byte-identical** (verified for
both decks, from a clean `--re-extract`).

- **A1**: 500 notes, 262 from the inventory and 238 by frequency; 102 with forms, 93 with sentences.
- **The fidäl deck**: 44 notes — the seven orders (each shown across six consonants), the 34 consonants in the
  traditional order with their rows of seven, the labialised -ʷa forms, the rounded ḳʷ kʷ gʷ, and the
  punctuation. A consonant's example word is the first A1 word beginning with its row, as A1 prints it.
- **The shelf's hue** is measured: `#85063D`, a deep wine, 14.7 from its nearest of 70 (§ the comment at
  `lang-amharic` in `app.js`).

**A2 (2026-11-15).** `python3 .claude/amharic/run.py --level a2`: 750 notes, 118 from the inventory and 632 by
frequency; 104 with forms, 24 with sentences; a re-run and a clean `--re-extract` are byte-identical, A1 and the
fidäl deck rebuilt byte-identical alongside. The inventory carries eleven of the thirteen Ethiopian months
(English Wiktionary has no ጥቅምት and no ጳጉሜ) and is short because A2's topics are thin there (the missing words
are listed in `inventory.py`: no coat, driver, hotel, ticket, plate, lunch, radio, "to send", "rich" …). The fill
reaches down to a frequency of 18. What reading the A2 ranking added, each a rule FROM A2 ON so A1's cards stand:
- **the infinitive twins are matched on their first sense** ("to kill, to murder" and "to kill") and an infinitive
  is skipped whenever its verb has an entry at all, at whatever level (`select.first_sense`): the whole-gloss rule
  let ማሰብ, መግደል, መፍራት, መግፋት and others through beside their verbs;
- **an "of" adjective is not taught** (`select.of_adjective`): የባህል "cultural", የፀሐይ "solar", የልብ … are a noun
  with የ- "of" where the noun has its own entry; the possessive pronouns (የኔ "my", የኛ "our") stay;
- **a plural that shares no consonant with its noun is not shown** (`build_deck.forms_line`): Wiktionary gave
  አይጥ "mouse" the plural ሰጎኖች, "ostriches"; a broken plural keeps its root (ወፍ → አዕዋፍ);
- **a month's name keeps its capital** (Wiktionary writes "september" for መስከረም), and so do African,
  Englishman and Jannat;
- **`EXCLUDE` grew by 38**, each with its reason: the twelve Western months' borrowed names (ጁላይ, ሰፕቴምበር …;
  the decks teach the Ethiopian ones), second spellings of words taught (ደሞዝ, ደሀ, እባት, ሌት, ንፋስ, ኡነት, ጦም,
  መስታዎት), glosses that are not the word the corpus counts (ጠራ "to be clear" for "to call", ጭራ "flyswatter"
  for "tail", ከልብ "dog" for "sincerely"), and the encyclopaedia's titles and names (ፊታውራሪ, አቡነ, ኢጣልያ).

**B1 (2026-11-15): 494 notes, not the planned 1,000, because that is what is left.** `python3
.claude/amharic/run.py --level b1`: 24 from the inventory and 470 by frequency; 51 with forms, 6 with sentences; a
re-run and a clean `--re-extract` are byte-identical, the other three decks rebuilt byte-identical alongside. The
fill takes every remaining lemma the Amharic Wikipedia uses at all (down to a count of 1), so the inventory only
adds everyday words English Wiktionary has that the corpus never uses (to sneeze, a pill, a spoon, a rainbow,
to exchange money …). The level reads as what it is — the rest of the dictionary, many of its words concrete and
rarer (tools, animals, plants, spices) — and the deck's description says it is short and why. What reading the
B1 ranking added: twenty more `EXCLUDE` lines (second spellings — ማዎቅ, ትናንትና, ጠጀ, ሲጃራ, አሞት, ብጒንጅ, ቈጠረ,
ኣከስት, ሆመጠጠ; ማረስ, the infinitive of A2's አረሰ; ሮብ, defined only as "synonym of ረቡዕ"; a letter's name, two
languages from the encyclopaedia, a dialect word, and four words of sexual or anatomical vocabulary the level
does not need), and Egypt keeps its capital. ጥቅምቲ ("October", the second month) was not taken for A2's
missing ጥቅምት: it is the Tigrinya spelling. **There is no source here for a B2.**
