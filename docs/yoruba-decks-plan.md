# The Yoruba language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Yoruba deck in `decks/`.** Asked for on
2026-11-15: "Add a Yoruba language collection." `docs/lang-decks.md` is the record of how the earlier sets
were built, and every rule there applies here unless this file says otherwise. The owner was not asked:
the Zulu, Hausa and Amharic owners' answers were taken, the sources being as thin (§2).

**STATUS (2026-11-16): the alphabet deck and all three levels, A1, A2 and B1, are built** (`.claude/yoruba/`,
§6–§8). A phrases deck is next.

## 1. The decisions (taken from the Zulu, Hausa and Amharic sets)

1. **Levels: CEFR A1–B1, at 500 / 750 / 1,000 notes.** Each level is a hand-written topic inventory
   (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up with the commonest remaining
   words of the Yoruba Wikipedia; the description says so. No B2 or C1: English Wiktionary holds about 4,300
   Yoruba words.
2. **No hand glosses** (the Zulu and Amharic rule): a word Wiktionary lacks is reported and dropped.
3. **An alphabet deck first** (letters, tones, nasal vowels), sorted before A1 by `levelRank`'s "Alphabet"
   rule; **a phrases deck after the levels**.
4. **No speaker button** (the Hausa rule): few devices carry a Yoruba voice, and one without it reads the word
   in another language's sounds, which for a tonal language teaches a wrong word. `speechLang: 'yo-NG'` stays
   for `spellTree`. `check-yoruba.js` fails on a speaker button.

| deck | file | notes |
|---|---|---|
| Yoruba Alphabet — built | `Yoruba-Alphabet.folio-deck.json` | 34 |
| Yoruba A1 Beginner — built | `Yoruba-A1.folio-deck.json` | 500 |
| Yoruba A2 Elementary — built | `Yoruba-A2.folio-deck.json` | 750 |
| Yoruba B1 Intermediate — built | `Yoruba-B1.folio-deck.json` | 1,000 |
| Yoruba Phrases and Expressions | `Yoruba-Phrases-and-Expressions.folio-deck.json` | — |

## 2. Sources and licences — and what is missing

| what | source | licence |
|---|---|---|
| meanings, toned spellings, other spellings | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Yoruba.jsonl`, 6,286 entries on 4,877 pages, 4,266 toned spellings kept) | CC BY-SA 4.0 |
| frequency | the Yoruba Wikipedia, dump of 2026-11-01 (pinned; md5 `c6683a37…`), the 8,155 articles of 150 words or more | CC BY-SA 4.0 |
| example sentences | Wiktionary's usage examples (about 1,400, never its dated quotations), then Tatoeba's `yor` exports | CC BY-SA 4.0; CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 48 million L1, 53 total: Wikipedia's "List of languages by total number of speakers" (Ethnologue 2026), read 2026-11-15; the infobox gives 47.9 L1 and 49.9 total (Ethnologue 28th ed., 2023) | — |

**WHAT IS MISSING, measured on 2026-11-15:**
- **Tatoeba has 119 Yoruba sentences, 60 with an English translation**, and hermitdave/FrequencyWords has no
  Yoruba list, so the frequency is the Yoruba Wikipedia's (the Amharic arrangement) and most sentences are
  Wiktionary's own.
- **Wiktionary lacks some of A1's commonest words**: ta ni "who", ibo "where", nígbà wo "when", èló "how
  much", nísinsìnyí "now", ibẹ̀ / níbí / níbẹ̀, tún "again", má "do not", burú, lẹ́wà, rọrùn, dáhùn,
  ọmọbìnrin / ọmọkùnrin, ìyá àgbà / bàbá àgbà, ehín "tooth", òtútù "cold", the greetings with ẹ kú, and
  Yorùbá itself (filed as a proper name). `inventory.py` lists them; none is glossed by hand.

## 3. The card

One note, two templates (Yoruba → English, English → Yoruba). Fields: `Yoruba` (the headword as printed),
`Word` (the same, for the check and the next level's de-duplication), `English` (meanings by part of speech),
`Forms` (other spellings), `Examples` (up to three sentences, the word in bold). The CSS is
`.claude/yoruba/card.css` (Hausa's). No romanisation line: Yoruba is written in the Latin alphabet, and the
tones are already in the spelling.

## 4. What Yoruba needs that no earlier set did — the findings

- **A CARD IS A TONED SPELLING.** Wiktionary titles its Yoruba pages without tones (`ti`) and puts on one
  page every word spelt so, each with its toned headword (tí "which", ti the perfect particle, tì "to push").
  `extract.py` reads the headword line (`head`), not the title: one lemma per toned spelling, its entries
  every part of speech Wiktionary gives that spelling. A headword's closing mark is dropped (`ó dàbọ̀!`).
- **ONE SPELLING IS OFTEN SEVERAL WORDS** (dá has eleven verb entries: "to create", "to stop", "to break" …).
  The card is the spelling, so `build_deck.english` gives the FIRST gloss of each entry before any entry's
  second, four at most a part of speech, weak senses last.
- **THE FREQUENCY IS SHARED OUT BY THE CAREFULLY MARKED ARTICLES** (`wikitext.py`, `extract.py`). About half
  of the Wikipedia's words carry their tones; an unmarked text often drops the dots too (awon for àwọn). A
  word's count is its KEY's (no tones, no dots) article count over all 8,155 articles, times its share of
  that key in the 6,329 articles where at least 35 % of the words are marked — in those, an unmarked `ti` is
  the mid-tone particle, not a careless tí. **Articles under 150 words are not read**: two thirds of the
  Wikipedia are bot stubs, about 14,700 of them on minor planets, which made "kékeré" the sixth word.
- **WEAK SENSES** (`extract.WEAK`, `TAXON`, `SEXUAL`): Ekiti and other dialect senses, rare and offensive ones,
  a plant's or animal's scientific name (ọ̀kan "one" is also *Sorindeia juglandifolia*) and sexual senses are
  shown only after a spelling's ordinary ones, and a lemma of weak senses alone is never dealt by the fill.
- **"ALSO SPELT" ONLY FOR THE SAME LETTERS** (`build_deck.forms_line`): Wiktionary files a dialect's forms as
  plain alternatives (mo / mi, ara / ọra, rẹ̀ / ẹ̀), so only a spelling of the same letters — apart, together
  or hyphenated (ilé-ìwé / iléèwé, ojú ọjọ́ / ojú-ọjọ́) — that the Wikipedia writes in three articles or more is
  shown, plus an inventory word a Wiktionary pointer led elsewhere (tàbí → àbí "or"). `check-yoruba.js`
  asserts it (`POINTED` names the exception).
- **THE FILL'S EXCLUSIONS** (`select.EXCLUDE`, each with its reason): the contractions whose count is not
  the verb's (ló = ní + ó, tó = tí + ó), the object pronoun's vowel-copy forms (in, un, an, án), the
  ordinals past "third" (from the date lines; left for A2), spellings of taught words (baba, lẹ́hìn), ife
  (the city Ifẹ̀ unmarked), orílẹ̀ (orílẹ̀-èdè written apart), ṣíṣe (the verbal noun of ṣe).
- **SMALL CORRECTIONS** in `build_deck.py`, each with its reason: `LEAD` (a gloss to lead with: oṣù "month",
  ìwé "book", ọjà "market", ìdí "reason" …), `LEAD_POS` (nípasẹ̀, lé, pé), `POS_ONLY` (ẹni "person" only).

**Known, left.** Wiktionary's parts of speech are trusted, and a few are odd (gbóná "to be hot" is filed as a
noun, jí "to wake up" as a particle). The days of the week keep Wiktionary's capitals, which differ (ọjọ́ Ajé,
Ọjọ́rú). The fill carries the encyclopaedia's topics (government, sport: agbábọ́ọ̀lù "footballer").

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2 (done)** — A2 then B1, one level per session: write
the level's inventory into `inventory.py` and its `SCOPE` into `yoruba_level.py`; read the ranking for new
exclusions; read every card. **Phase 3** — the phrases deck (Wiktionary's phrase and proverb entries — it has
17 proverbs — and Tatoeba's sentences). A level must leave the levels below it byte-identical.

## 6. As built (2026-11-15): the alphabet and A1

`python3 .claude/yoruba/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `wikitext.py` → `extract.py`
→ `select.py` → `examples.py` → `build_deck.py`, caching in `.claude/yoruba-cache/` (gitignored, ~150 MB).
`python3 .claude/yoruba/alphabet.py` writes the alphabet deck (reads the shipped A1 deck and `lex.json`).
`node .claude/yoruba/check-yoruba.js` is the check. **A re-run is byte-identical** (verified for both decks,
from an empty lexicon and counts).

A1: 500 notes / 1,000 cards, 321 from the inventory (18 topics) and 179 by frequency; sentences for 182, other
spellings for 4. The alphabet: 34 notes — the 25 letters, the three tones (with ọkọ / ọkọ̀ / ọkọ́), the five
nasal vowels and the syllabic nasal; each letter's example is the first A1 word that begins with it (for u,
which begins almost no word, the first that has it). Every sound side is unique (asserted).

The shelf's hue is measured: `#3A5498`, an indigo. Swept against the 74 hues on the page, two points tied at
13.4 — a brick red in the crowded red-brown band (the Viking Age, Russia, Cantonese, Indonesian within 14.3)
and this indigo — and the tie went to the indigo, the colour of adire cloth. 7.2:1 against white.

## 7. As built (2026-11-16): A2

`python3 .claude/yoruba/run.py --level a2`. 750 notes / 1,500 cards: 192 from the inventory (`inventory.A2`, 17
topics scoped to the A2 descriptor, the ordinals A1 held back among them), 558 by frequency; sentences for 197,
other spellings for 8. **A re-run is byte-identical, and A1 and the alphabet still rebuild byte-identical**
(the two new weak-sense patterns below touch no A1 card).

- **THE INVENTORY IS SMALL because Wiktionary is**: of about 330 A2 words looked up, about 140 are missing —
  all twelve Yoruba months (Agẹmọ is filed only as "chameleon"), ìtìjú, bínú, ronú, yàn, tẹ̀lé, dúpẹ́, kún,
  ìjì, mànàmáná, awakọ̀, nọ́ọ̀sì, hòtẹ́ẹ̀lì, rédíò, Ọlọ́run … (`inventory.py` names them). The frequency fill
  carries the rest, so A2 is mostly the Wikipedia's commonest remaining words.
- **AN UNMARKED SPELLING WHOSE MARKED HOMOGRAPH IS COMMONER IS NOT DEALT** (`select.shadowed`, from A2 on):
  iwe "gizzard" beside ìwé "book", ojo "coward" beside òjò "rain", itan "thigh" beside ìtàn — such a word's
  count is mostly its homograph written carelessly. A1 shipped without the rule and is left as it is.
- **MORE EXCLUSIONS** (`select.EXCLUDE`, "Read off the A2 ranking"): the rest of the object pronoun's
  vowel-copies (ún, ín, ọ́n, ọn, mí), verbal nouns of taught verbs (gbígbà, jíjẹ), spoken or short forms of
  taught words (èèyàn, míì), people's names (Ẹ̀gbá, Fúlàní, Aláké), and some twenty words Wiktionary glosses by
  a rare sense where the count is the common one (dájú "to be heartless" for "certain", péré, dìbò, àfojúsùn,
  ayélujára, ìmọ̀ràn …), each with its reason.
- **WEAK SENSES**, two patterns added to `extract.py`: a grass, vine or palm's scientific name (bẹrẹ "the grass
  Anadelphia afzelia") and a vulgar sexual sense (dó is "to settle" first). `LEAD` adds ayò, the game.

**Known, left.** The fill is the encyclopaedia's again: government and history (ṣàkóso, amúnisìn, olú-ìlú),
linguistics (àkọtọ́, sílébù, fonọ́lọ́jì), sport (líìgì). Two thirds of the cards have no sentence.

## 8. As built (2026-11-16): B1

`python3 .claude/yoruba/run.py --level b1`. 1,000 notes / 2,000 cards: 141 from the inventory (`inventory.B1`,
12 topics), 859 by frequency; sentences for 170, other spellings for 5. **A re-run is byte-identical, and A1,
A2 and the alphabet still rebuild byte-identical.** B1 is full: about 1,175 Wiktionary words with a count were
left after A2, unlike the Amharic B1 (494).

- **THE INVENTORY WAS WRITTEN THE OTHER WAY ROUND.** A B1 topic list written first is mostly not in English
  Wiktionary (ìdìbò, ààrẹ, adájọ́, ẹ̀sùn, ìtọ́jú, ìwádìí, àbájáde, ètò, ìyípadà … have no entry), and the fill
  alone reaches 1,000 words. So the inventory was read off the Wiktionary words the fill does NOT reach: about
  140 everyday words and compounds the encyclopaedia rarely writes (household things, trades, schooling,
  machines, health, time words: kẹ́tùrù, áńbúláǹsì, ẹ̀rọ amóhuntutù, iṣẹ́ àmúrelé, lọ́tùn-ún-la), which push out
  the fill's noisiest tail.
- **THE FILL GOES DOWN TO A COUNT OF ONE**, so from B1 on a lemma whose first ordinary sense is a given name, a
  title, another word's dated or dialect spelling, or a plant's name is not dealt (`select.obscure`), and some
  twenty dialect forms, people's names and anatomical words are excluded by name ("Read off the B1 ranking").
  The description says the last words' order means little.

**Known, left.** Much of B1 is traditional culture (drums, Ifá, chieftaincy titles, foods) and natural history,
because that is what Wiktionary's remaining Yoruba entries are; the government, law and health vocabulary a B1
usually has is missing from the source. Synonym pairs are labelled by the shelf's de-duplication ("not ẹyẹlé").
