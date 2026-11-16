# The Khmer (Cambodian) language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Khmer deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped, Thai's above all (`docs/thai-decks-plan.md`) — Khmer, like
Thai, writes no spaces between words — and Amharic's for the frequency source (`docs/amharic-decks-plan.md`).
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this file
says otherwise. Asked for on 2026-11-15: "Add a Cambodian language collection."

**STATUS (2026-11-16): the alphabet deck, A1, A2, B1 and the phrases deck are built** (`.claude/khmer/`, §6–§9). B2
and C1 are the next sessions' work — and B2 may not reach 1,500 (§8).

## 1. The decisions (2026-11-15)

The request named no word source, script deck or romanisation. The session took the answers the Thai and Hindi
owners gave for the same request rather than ask — **they are the owner's to overturn**:

1. **Word source: CEFR A1–C1, assembled** (the Thai / Hindi / UKBI arrangement). No graded word list for learners
   of Khmer was found, and no proficiency examination for foreigners that publishes one, so each level is a
   hand-written topic inventory (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up with
   the commonest remaining words. Each deck's description says so. Sizes as Thai's: **A1 500 · A2 750 · B1 1,000 ·
   B2 1,500 · C1 1,500 notes**, then a phrases deck — if Wiktionary's 9,100 Khmer words hold out (Amharic's ran
   out at B1; watch the fill at B2).
2. **A Khmer script deck, first in the collection.**
3. **Romanisation on every word card: Wiktionary's own** — its phonetic transcription of Khmer (ទឹក tɨk, ផ្ទះ
   phtĕəh), which shows the vowel each consonant SERIES gives a letter (ក + ា kaa, គ + ា kiə); the spelling alone
   does not, and the government's (GD) and the UN's (UNGEGN) systems are designed for place names.
4. **No speaker button** — the Amharic and Hausa rule: few of the devices Folio runs on have a Khmer voice.
   `speechLang: 'km-KH'` is still declared.
5. **The collection is "Khmer (Cambodian)"** on the shelf (`LANGS` name, like "Persian (Farsi)"), so a reader who
   asked for Cambodian finds it; the decks are titled "Khmer …", the language's English name.
6. **This session: plan + alphabet + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Khmer Alphabet — built | `Khmer-Alphabet.folio-deck.json` | 87 |
| Khmer A1 Beginner — built | `Khmer-A1.folio-deck.json` | 500 |
| Khmer A2 Elementary — built | `Khmer-A2.folio-deck.json` | 750 |
| Khmer B1 Intermediate — built | `Khmer-B1.folio-deck.json` | 1,000 |
| Khmer B2 Upper Intermediate | `Khmer-B2.folio-deck.json` | 1,500 |
| Khmer C1 Advanced | `Khmer-C1.folio-deck.json` | 1,500 |
| Khmer Phrases and Expressions — built | `Khmer-Phrases-and-Expressions.folio-deck.json` | 860 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, some examples | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Khmer.jsonl`, 16 MB, 11,328 entries; 9,424 words kept, 317 of them pointers) | CC BY-SA 4.0 |
| romanisation | each carded word's own Wiktionary page, its headword line (`romanise.py`, read 2026-11-15) | CC BY-SA 4.0 |
| frequency | the Khmer Wikipedia, the dump of 2026-11-01 (pinned): 14,475 articles cut into 8.1 million words | CC BY-SA 4.0 |
| example sentences | Tatoeba `khm` exports (1,311 Khmer–English pairs) | CC BY 2.0 FR |
| the script | the English Wikipedia's "Khmer script", revision 1370721954 (2026-08-22), its IPA after Huffman (1970) | CC BY-SA 4.0 |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 19.5 million L1 (2019), 20.5 million in all (2019–2024), Ethnologue 28th ed., via Wikipedia's infobox, read 2026-11-15 | — |

**hermitdave/FrequencyWords has no Khmer list** (404) — a subtitle list counts space-separated tokens, and Khmer
writes none — and Tatoeba's Khmer is too small to count, hence Wikipedia, as for Amharic.

## 3. The card

One note, two templates (Khmer → English, English → Khmer). Fields: `Khmer` (the headword), `Roman`, `Word`,
`English` (meanings by part of speech), `Forms` (a noun's classifier where Wiktionary names one — it does for two
Khmer entries, so the line is almost always empty), `Examples` (up to three). No forms table: Khmer does not
inflect. The CSS is `.claude/khmer/card.css` (Thai's without the speaker, the line-heights raised: Khmer stacks a
subscript consonant and a vowel below a letter).

## 4. What Khmer needs — the findings

- **NO SPACES BETWEEN WORDS** (`km.Segmenter`, Thai's maximal matching, on a trie of every Khmer headword). A cut
  falls only between CLUSTERS — never before a vowel sign or a mark, never after the COENG (U+17D2) that writes the
  next consonant as a subscript — so ត is not found inside ស្តី. Spaces and zero width spaces (the Khmer Wikipedia
  holds 1.5 million; Khmer writers type them as invisible word breaks) are hard cuts.
- **ONE GLYPH, TWO SPELLINGS** (`km.key`): the subscript ta is written in Unicode as COENG TA or COENG DA, and
  Wiktionary files សួស្តី and សួស្ដី "hello" as two spellings. Every stage matches on the key, which writes both
  as COENG TA and changes no length, so a span found in it is the span in the printed sentence.
- **THE EXTRACTION'S ROMANISATION IS OFTEN NOT WIKTIONARY'S** (`romanise.py`). For a word opening on an unstressed
  minor syllable kaikki's string differs from the page: បង្កើត `bɑɑbɑngkaət` against `bɑngkaət`, ប្រទេស `prɑɑteih`
  against `prɑteih`, ក្រហម `krɑɑhɑɑm` against `krɑhɑɑm` — 39 of the 484 A1 words compared, with no rule that
  repairs them all (ប្រជាជន keeps `prɑɑ` on its page). So each carded word's headword romanisation is read off its
  page once and cached (`wikt-tr.json`); the extraction's is a fallback only.
- **WIKIPEDIA'S ONE-LETTER COUNTS** (`select.EXCLUDE`). A word Wiktionary lacks is cut into the words it is spelt
  with, and a stray letter is the commonest piece: រ, ស, ង, ត, ល, ច, វ, គ, ព, ញ, ក ranked in the first 200 with
  senses like "to move away" and "to tremble". So did syllables of names and loans (អា, រា, នី, កា, ម៉ា, ស៊ី, លី)
  and the heading ឯកសារយោង "references" that closes almost every article. Each is excluded with its reason.
- **THE FIRST DAY'S WORDS LEAD** (`select.LEAD_TOPICS`): an encyclopaedia rarely says hello; the greetings are dealt
  first, then everything by count.
- **HOMOGRAPHS LISTED RARE-FIRST** (`build_deck.ETYMS`, `LEAD`, `DROP`, Thai's tables): លុយ opened on "to wade"
  before "money", ហាង on "pungent" before "shop", ពុក on "rotten" before "father", ពង on "blister" before "egg",
  រឿង on "brilliant" before "story", តែ on "tea" alone (its "but; only" is a second etymology); ក្បាល on "lot,
  plot" and a weed before "head"; បាទ, the man's "yes", carried a formal noun "foot". Inventory parts of speech
  (`លោក:pron`, `កំពុង:particle`, `ថ្លៃ:adj`, `ព្រោះ:conj`, `ប្អូន:noun`) put the everyday reading first.
- **THE TWO POLITE YESES** are both "yes" in Wiktionary; the shelf-wide dedupe pass labels them "not ចាស" and "not
  បាទ" rather than Folio typing "said by a man" (no hand glosses).
- **COMPOSE**: ភាសាខ្មែរ and ភាសាអង់គ្លេស, which Wiktionary lacks, are composed from ភាសា + ខ្មែរ / អង់គ្លេស,
  romanised from the parts' pages; only the English is written here.

**Known, left.** 152 of A1's 500 words have no example sentence (Tatoeba's Khmer is a sixth of Thai's; Wiktionary
adds 66). The fill carries written-register words an encyclopaedia favours (ខេត្ត "province", រដ្ឋបាល
"administration", ព្រះពុទ្ធ "the Buddha"). Not in Wiktionary and dropped from the inventory: ពាក់កណ្តាល "half",
ថ្ងៃស្អែក (ស្អែក kept), ជីតា (តា kept), កាតាប "bag", គ្រុនក្តៅ (គ្រុន kept), សោកសៅ (ព្រួយ instead), ត្នោត as "brown"
(Wiktionary has only the palm). Tatoeba's sentences carry no romanisation.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 and B1 (done) to C1, one level per session: write the
level's inventory into `inventory.py` and its `SCOPE` into `khmer_level.py`, run, read every card, extend the
tables. **Phase 3 (done)** — the phrases deck (§9). **Phase 4** — a combined file, gitignored.

## 6. As built (2026-11-15): the alphabet and A1

`python3 .claude/khmer/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `wikitext.py` → `extract.py` (once)
→ `select.py` → `romanise.py` → `examples.py` → `build_deck.py`, caching in `.claude/khmer-cache/` (gitignored,
~160 MB); `python3 .claude/khmer/alphabet.py` writes the alphabet deck (after A1: its example words are A1's).
`node .claude/khmer/check-khmer.js` is the check. **A re-run is byte-identical**, `--re-extract` included (verified).
A1: 500 notes, 387 from the inventory and 113 by frequency; sentences for 348, three for 212.

The alphabet: 87 notes — the 33 consonants (series, name, consonant sound, subscript, place in the alphabet; the
obsolete ឝ ឞ left out), 16 dependent vowels on ◌ with both series' readings, 13 independent vowels (ឨ left out;
ឱ and ឲ one note), 11 diacritics, 4 punctuation marks and the 10 digits; every sound side unique (asserted — ឋ and ថ
are both [tʰɑː], the place tells them apart). Every sound and description is read from the pinned Wikipedia
revision's tables; the example words are A1's (first by frequency, a single word with the letter standing plain
preferred; for a vowel, one per series, the vowel not followed by a sign that changes it), and the 10 letters A1
has no word for take the commonest Wiktionary word, romanised from its page. ឍ and ឭ have none.

The shelf's hue is measured: `#76281C`, a brick red, 14.3 from its nearest of 73 (`#8D2D39`), greens and the magenta
band left out as for the last sweeps.

## 7. As built (2026-11-16): A2

On request ("Add A2"). `python3 .claude/khmer/run.py --level a2`. 750 notes: 302 from the A2 inventory (19 topics,
`inventory.py` `A2`), 448 by frequency; A1's 500 words are not repeated. Sentences for 278, three for 86 — Tatoeba's
Khmer thins out fast past A1 (472 words have none). A re-run is byte-identical; A1 and the alphabet are unchanged
(verified).

- **The inventory gave 302 of its 330 words**: 45 of the first draft's spellings are not Wiktionary headwords. Where
  Wiktionary has a shorter form it was taken instead (ក្មេក for the in-laws, ភ្លោះ "twins", ជិតខាង, បើកបរ, ច្បារ,
  ស្លាប, វស្សា and ប្រាំង for the seasons, ថ្ងៃខួប, ទូរស័ព្ទចល័ត); the rest were dropped (ព្រលានយន្តហោះ "airport",
  វ៉ាលី "suitcase", ចូលឆ្នាំ "New Year", the comparatives ច្រើនជាង / តិចជាង, the connectors ពេលដែល, មុនពេល,
  ក្រោយពី, ឬក៏, លើកលែងតែ …). Because so much fell out, the fill is the larger half — more than Thai's A2 — and
  carries the written vocabulary of an encyclopaedia (រដ្ឋាភិបាល "government", សង្គ្រាម "war", រាជធានី "capital").
- **A WORD NO SOURCE ROMANISES IS NOT CARDED** (`select.py`, new): Wiktionary's own page prints an empty romanisation
  for some entries, and the extraction has none either. `select.py` now reads the pages itself (`romanise.fetch`,
  200 at a time down the ranking) and drops such a word, printing it: កាមេរ៉ា, ប្ដូរ, បញ្ជូន, កើន, ម្យ៉ាង, ថយ.
- **Twenty-eight more `EXCLUDE` lines**, read off the ranking: the one- and two-letter counts the cut leaves (ស្រ,
  ត្រ, ដា, សេ, វី, ហា, ជី, រេ, សី, គី, មី, អ៊ី, ប្រា, បេ, ឡូ, ខ, រូ, ម៉ — a cow's "moo" —, ដំ, លប់, លោ, ធី, គណ, ទំ, រណ,
  បូ), the half of ហឫទ័យ the cut strands (ទ័យ), and ដង, counted as "times", a sense Wiktionary does not list.
- **A gloss that is only "abstract noun of X"** now counts as a pointer for the fill (ការប្រើប្រាស់).
- **Sense fixes**: `ETYMS` ដោះ (to take off, before "breast"), ទ័ព (army, before "walking"); `LEAD` ទា (duck);
  `DROP` ស្ដី's tree and កង្កែប's antipersonnel mine; inventory parts of speech ដោះ:verb, ខ្ចី:verb (to borrow,
  before "unripe").
- **`check-khmer.js`** now skips the part-of-speech line when it looks for a Khmer sentence in a gloss: the dedupe
  pass's labels ("verb, not កសាង, សង់") are mostly Khmer and were read as glosses.

## 8. As built (2026-11-16): B1

On request ("Add B1"). `python3 .claude/khmer/run.py --level b1`. 1,000 notes: **156 from the B1 inventory** (16 topics,
`inventory.py` `B1`), **844 by frequency**; A1 and A2 are not repeated. Sentences for 210, three for 33 — Tatoeba's
Khmer is used up at this level (790 words have none). A re-run is byte-identical; A1, A2 and the alphabet re-run
unchanged (verified).

- **WIKTIONARY RUNS THIN.** Of the inventory's first draft (about 290 words), 85 were already in A1 or A2 and 71 are
  not Wiktionary headwords (the professions with អ្នក-, most abstract nouns in ការ- and ភាព-, the connectors
  ទោះយ៉ាងណា, ផ្ទុយទៅវិញ, លើសពីនេះ …); the forms Wiktionary does have were taken (ឈ្នួល, ក្រីក្រ, ចំណេះ, អ្នកទេសចរ,
  ពុទ្ធសាសនា, បង្កើន, បន្ថយ …). So the fill is most of the deck, and it is the encyclopaedia's vocabulary: history,
  monarchy, Buddhism, administration. Wiktionary keeps 9,107 Khmer words with a meaning; after B1 about 6,850 remain, many of
  them names, rare plants and compounds, so **B2's 1,500 should be checked against what is left before it is built**
  (Amharic stopped at B1 for this reason).
- **A SHORT WORD NEVER WRITTEN ALONE IS A FRAGMENT** (`solo.py`, new; `select.SOLO_MIN`). The word cut leaves syllables
  of words Wiktionary lacks, and past A2 they crowd the fill with rare senses: ផា "cloth", ទស "ten", ទូរ "to compare",
  ភារ "used in the compound …", ន៏ (a garbled gloss). `solo.py` counts, per article, the words that make a whole chunk
  between typed breaks (spaces, zero width spaces) — no cut involved — and a fill word of three code points or fewer
  must stand alone in at least 8 % of the articles it is counted in. Measured: real short words 12–30 % (លួច 23 %,
  ដែក 21 %, នឹក 30 %), fragments under 5 %; the band from 8 to 10 % still holds real words (ដូន "grandmother", សេក
  "parrot", ភក់ "mud"). 43 words left out at B1. **Gated from B1** (`SOLO_FROM`): A1 and A2 are not rebuilt by it.
- **Bound syllables count as pointers**: a gloss that begins "used in the compound …" or ends "(mainly used in
  composition)" (ប្រាស់, បាល).
- **Hand lines**: `EXCLUDE` ម៉ៅ (counted as the name Mao; the card was "mouse"), ក្រចេះ (counted as the province of
  Kratié; the card was a tree); `SWEARS` ញី (an insult); `ETYMS` រោង ("hall", before the zodiac's Dragon), លប
  ("secretly", before a fish trap).
- **No romanisation on its page, dropped** (the A2 rule): seventeen fill words, among them ឆ្ពោះ, រហ័ស, ស៊ីវិល, ប្រមុខ.

**Known, left.** Some first glosses are Wiktionary's older or narrower sense (មហេសី "maharṣi", ឯកភាព "unit (usually
military)"); a few fill words are tree names likely counted from place names (ត្រាច, ជ្រៃ), which the solo test does
not catch — they stand alone as names too.

## 9. As built (2026-11-16): the phrases deck

On request ("Add a phrases deck"). `python3 .claude/khmer/phrases.py` (after the level decks; a stage of its own,
like Amharic's, not a `run.py` level). 860 notes in two subdecks. A re-run is byte-identical.

- **NOT THAI'S THREE SUBDECKS, BECAUSE THE SOURCE HAS NO IDIOMS.** English Wiktionary files about forty Khmer entries
  as phrases, two as proverbs and none with an idiomatic sense, so the deck takes the Amharic arrangement: **Phrases**
  (35) — the phrase and proverb entries, interjections of more than one word, and the one-word set formulas of
  `ONE_WORD` (ស្វាគមន៍ "welcome", អរុណសួស្តី "good morning") the levels do not teach, in the hand order of `PHRASES`,
  romanised from their pages — then **Sentences** (825): Tatoeba's Khmer sentences of at most eight words on the word
  cut, printed as Tatoeba has them, each card naming its Tatoeba number. No romanisation on a sentence (Tatoeba gives
  none); `check-khmer.js` allows that, and `?` and `!`, on the Sentences subdeck only.
- **The build fails on a Wiktionary entry it has not decided** (`LEFT_OUT`, with reasons): the sounds (ក្រុកៗ a hen's
  clucking), an expletive, a soldiers' command, the layperson's "yes" to royalty, two shorter wordings of "are you
  married?", អញ្ជើញ (B1 teaches it), and four second forms of an English side already taught (អរុណសុវត្ថិ, សុភោជន,
  សុរសភោជន, សូមកុំជក់បារី). **One proverb is left out**: កុំដេកចាំស្លាប់ កុំអង្គុយចាំមាន, whose Wiktionary gloss and
  romanisation are a whole five-couplet poem the headword only begins.
- **ONE ENGLISH SIDE PER SENTENCE**: where Tatoeba has two Khmer sentences for one English one, the first in the
  deck's order (fewest words, then Tatoeba number) is kept. A sentence that is only a level word or a phrase above,
  or that holds Latin letters or digits, is left out.

**Known, left.** The sentences are Tatoeba's as written and were not read one by one; a few carry a contributor's
misspelling (សួរស្តី for សួស្តី "hello" in #11486545). Each card's Tatoeba number is there so a fault can be traced
and the sentence added to `DROP`. If B2 or C1 are built later, `phrases.LEVELS` must list them so no expression is
taught twice.
