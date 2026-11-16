# The Khmer (Cambodian) language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Khmer deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped, Thai's above all (`docs/thai-decks-plan.md`) — Khmer, like
Thai, writes no spaces between words — and Amharic's for the frequency source (`docs/amharic-decks-plan.md`).
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this file
says otherwise. Asked for on 2026-11-15: "Add a Cambodian language collection."

**STATUS (2026-11-16): the alphabet deck, A1 and A2 are built** (`.claude/khmer/`, §6–§7). B1 to C1 and a phrases
deck are the next sessions' work.

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
| Khmer B1 Intermediate | `Khmer-B1.folio-deck.json` | 1,000 |
| Khmer B2 Upper Intermediate | `Khmer-B2.folio-deck.json` | 1,500 |
| Khmer C1 Advanced | `Khmer-C1.folio-deck.json` | 1,500 |
| Khmer Phrases and Expressions | `Khmer-Phrases-and-Expressions.folio-deck.json` | — |

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

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 (done) to C1, one level per session: write the
level's inventory into `inventory.py` and its `SCOPE` into `khmer_level.py`, run, read every card, extend the
tables. **Phase 3** — a phrases deck. **Phase 4** — a combined file, gitignored.

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
