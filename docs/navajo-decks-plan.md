# The Navajo language decks: the plan (Nov 2026)

**Read this before building, or changing the plan for, any Navajo deck in `decks/`.** It plans one more
language set in the shape of the ones already shipped (Hausa, Zulu, Lao …).
`docs/lang-decks.md` records how those were built, and every rule there applies here unless this file says
otherwise. Asked for on 2026-11-16: "Add a Navajo language collection."

**STATUS (2026-11-16): the collection is complete**: the alphabet and sounds deck, A1, A2, B1 and the phrases
deck (`.claude/navajo/`, §6–§9). A2 has 579 notes, not 750, and B1 307, not 1,000: the counted words ran out
after A1 (§7, §8).

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for a later deck this plan produces. The collection's first commit did carry one line and one bump, because
it also changed the APP (the shelf's hue in `app.js`). That follows the Hausa and Lao precedent.

## 1. The owner's decisions (2026-11-16)

These were asked after a survey of the sources (§2): a rich dictionary, almost no corpus.

1. **Levels: CEFR A1–B1, smaller**, at Hausa's sizes. Each level is a hand-written topic inventory
   (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up with the commonest remaining
   words. The deck's description says so. Sizes: **A1 500 · A2 750 · B1 1,000 notes**.
2. **Extra decks: an alphabet and sounds deck**, first in the collection, **and a phrases deck** after the
   levels.
3. **This session: plan + generator + alphabet + A1 + the shelf entry**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Navajo Alphabet and Sounds (built) | `Navajo-Alphabet.folio-deck.json` | 41 |
| Navajo A1 Beginner (built) | `Navajo-A1.folio-deck.json` | 500 |
| Navajo A2 Elementary (built) | `Navajo-A2.folio-deck.json` | 579 (planned 750) |
| Navajo B1 Intermediate (built) | `Navajo-B1.folio-deck.json` | 307 (planned 1,000) |
| Navajo Phrases and Expressions (built) | `Navajo-Phrases-and-Expressions.folio-deck.json` | 145 |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule. "Alphabet" sorts first.

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, possessed forms, plurals, verb persons, IPA, usage examples | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Navajo.jsonl`, 33 MB, 25,894 entries; about 6,400 lemmas once the form-of entries are folded) | CC BY-SA 4.0 |
| frequency (1) | the Navajo Wikipedia, `nvwiki-20261101-pages-articles.xml.bz2` (22,581 articles, 1.36 M tokens), pinned | CC BY-SA 4.0 |
| frequency (2) | Wiktionary's own Navajo usage examples, 2,539 sentences | CC BY-SA 4.0 |
| example sentences | Wiktionary's usage examples; Tatoeba `nav` (66 sentences) | CC BY-SA 4.0; CC BY 2.0 FR |
| sounds and letters (the alphabet deck) | Wikipedia, "Navajo phonology" and "Navajo language" § Orthography, read 2026-11-16 (they follow McDonough 2003, McDonough and Ladefoged 1993, Young and Morgan 1987) | CC BY-SA 4.0 |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 170,000 (2019 census figure, Wikipedia's infobox, read 2026-11-16); no separate L2 figure | — |

**WHAT IS THIN.** No frequency list exists for Navajo, and Tatoeba holds 66 sentences. The Navajo Wikipedia
is nearly all bot-written stubs about animals and plants: the median article is 59 words, and only 32
articles reach 400. Ranked by it alone, "scientist" (the stub formula for a scientific name), "inch",
"stag beetle" and "he/she is chewing them" are among the commonest words of the language (§4).

## 3. The card

One note, two templates (Navajo → English, English → Navajo), `speechLang: 'nv'`. Fields: `Navajo` (the
headword), `Say` (Wiktionary's IPA), `Word` (the headword as printed; the check and the next level's
de-duplication read it), `English` (meanings by part of speech), `Forms`, `Examples` (up to three). The CSS
is `.claude/navajo/card.css` (Hausa's).

- **The headword is the standard spelling, marks included.** Unlike Hausa or Zulu, ordinary written Navajo
  marks its high tones (á), nasal vowels (ą), long vowels (aa) and the glottal stop (ʼ). So there is no
  second "toned" line; the IPA takes that place, on 288 of A1's 500.
- **Forms**: a noun's "my" and "his/her" forms (`shimá`, `bimá`) from its own possession table, and its
  plural where Wiktionary gives one. A verb's "I" and "you" forms come from Wiktionary's form-of entries:
  the imperfective, or a neuter verb's only form. A perfective or future form is never set beside an
  imperfective headword. 167 of A1's cards have a forms line.
- **NO SPEAKER BUTTON**: no device carries a Navajo voice. `check-navajo.js` fails on one.

## 4. What Navajo needs that no earlier set did: the findings

- **TWO CORPORA, AND A FILL WORD MUST BE IN BOTH.** A Wikipedia-only fill was mostly insects and birds. A
  second count is made over Wiktionary's 2,539 example sentences, crediting only the sentences written under
  *other* headwords, so a word's own page cannot vouch for it. The cards are dealt by the geometric mean of
  the word's share of each corpus, smoothed by a half (`extract.py`, `score`). The fill takes only words
  present in both. That one rule removed nearly every species name. The rest is `select.EXCLUDE`, in three
  groups, each with its reason: the stubs' formula words, species names, and shades of a colour. Two more
  rules sit there too: a gloss that is a taxon, and a gloss that is only a grammatical pointer.
- **A POSSESSED FORM FILED AS ITS OWN NOUN.** Wiktionary has `bijáád` "his/her leg" beside `ajáád` "leg",
  `hakʼéí` "one's kin" beside `akʼéí` "kin", and `binááʼ` beside `anááʼ`, each with the same possession
  table. Nouns linked through each other's tables are one word. The card is the indefinite a- form, the
  dictionary's form (`extract.py`).
- **THE VERB'S FORMS ARE ENTRIES, NOT A TABLE.** 14,800 of kaikki's 17,500 verb entries are "first-person
  singular imperfective of …". They feed the lemma count (a pointer each) and the card's "I" and "you" line.
- **GLOSSES THAT ARE POINTERS, NOT MEANINGS** ("simple passive form of neiłtsoos" under `naaltsoos` "book",
  "reciprocal of bichʼįʼ") are dropped from the card (`build_deck.NOT_A_MEANING`). A part of speech left with
  nothing else is not shown.
- **TWO KEYS** (`nv.py`): strict (tone and nasal marks kept, the glottal stop unified to ʼ), then loose (marks
  dropped). The loose key is a fallback only, for corpus tokens of four letters or more that no lemma claims
  strictly.
- **Wikipedia's bold markup** (`'''`) became a glottal-stop token (`ʼʼ`) until it was stripped
  (`wikitext.py`).

**Known, left.** Some verbs that mean "it is …" print an "I" form Wiktionary gives (`łigai` "it is white",
I `łinishgai`). That is correct Navajo, if odd on a colour. Some of the Wiktionary sentences are glosses of
phrases rather than full sentences (`chidí daanéʼé` "toy truck"). 96 of A1's words have no sentence. The
possessed forms are Wiktionary's own table, so a few are unusual (`shizǫʼ` "my star").

## 5. Phases

**Phase 1 (done):** the pipeline, the alphabet, A1. **Phase 2:** A2 then B1, one level per session. Write the
level's inventory into `inventory.py` and its `SCOPE` into `navajo_level.py`, run it, and read every card.
Wiktionary has the words, so expect the corpus, not the dictionary, to run out first. **Phase 3:** the
phrases deck (Wiktionary's 110 `phrase` entries and its interjections). **Phase 4:** a combined file,
gitignored.

## 6. As built (2026-11-16): the alphabet and A1

`python3 .claude/navajo/run.py [--level a1] [--no-fetch] [--re-extract]`. The stages are `wikitext.py` →
`extract.py` → `select.py` → `examples.py` → `build_deck.py`, caching in `.claude/navajo-cache/` (gitignored,
about 150 MB). `python3 .claude/navajo/alphabet.py` writes the alphabet deck; it reads `lex.json` for the
example words and their IPA. `node .claude/navajo/check-navajo.js` is the check. **A re-run is byte-identical.**

**A1**: 500 notes / 1,000 cards. 294 come from the inventory (`inventory.A1`, 19 topics scoped to the A1
descriptor; every word looked up before it was written) and 206 from the fill. 404 have sentences, three
apiece for 216. Every inventory word was found in Wiktionary. What A1 would have and the source lacks: a
written-out Naabeehó, Bilagáana bizaad "English", "to write", "to learn", "to come", "window" (Wiktionary's
`tsésǫʼ` is "mica").

**The alphabet**: 41 notes. There are 36 letters and digraphs in the orthography table's order (ʼ a b ch chʼ d
dl dz e g gh h hw i j k kʼ kw l ł m n o s sh t tʼ tł tłʼ ts tsʼ w x y z zh). Then come long vowels, high tone,
the falling and rising tones, nasal vowels, and the syllabic ń. Every sound side is unique (asserted), and
every example word is in the A1 lexicon with Wiktionary's IPA.

**The shelf's hue is measured**: `#3C7676`, a turquoise-teal, 13.9 from its nearest of 79 (Economics and
France). The outright winner was a yellow-green at 15.1, but it was refused: it would have been a fourth
green within 15.5 of Middle-earth, Arabic and Geography. Turquoise is also the subject's own colour,
dootłʼizh. **Re-sweep at the merge** if a parallel session has taken a hue near it.

## 7. As built (2026-11-16): A2

`python3 .claude/navajo/run.py --level a2`. **579 notes / 1,158 cards, against the planned 750.** 531 come
from the inventory (`inventory.A2`, 35 topics scoped to the A2 descriptor) and 48 from the fill. 183 have
sentences, three apiece for 35. 169 have IPA and 136 a forms line. A re-run is byte-identical, and A1 still
rebuilds byte-identical.

- **THE COUNTED WORDS RAN OUT AFTER A1.** Only about 130 lemmas outside A1 appear in both corpora, and A2's
  fill took the 48 that survive the exclusions. A second tier was measured and refused: words whose own
  Wiktionary page has an example, ranked by the Wikipedia count. It gave 52 words, mostly stub vocabulary.
  So A2 is almost all the hand-written inventory, and its words have no count of their own. The smoothed
  `score` orders them, which in practice is the Wikipedia count where there is one. Wiktionary has the
  words (about 6,400 lemmas); what is missing is a corpus to rank them. **The level stopped at 579
  rather than adding about 170 more words chosen with no count.** Asking for more fills it from the
  inventory.
- **HOW THE INVENTORY WAS FOUND**: English concepts matched against Wiktionary's glosses ("he/she is …",
  "to …", "it is …", or a noun's first sense), the best-scoring match taken, then every pick read. Navajo
  verbs are often filed under the SHAPE of their object ("he/she is throwing it (a slender flexible
  object)"), so many everyday English verbs ("to give", "to help", "to open") have no single headword. A2
  teaches the ones Wiktionary does file plainly.
- **Readings fixed after reading the cards** (`build_deck.POS_ONLY`, `GLOSS`): the directions `náhookǫs`,
  `haʼaʼaah` and `shádiʼááh` show their noun ("north", "east", "south"), not an unrelated verb;
  `ndikʼąʼ` "cloth" and `naʼniyęęsh` "irrigation" show their noun too. `bighaaʼ`, `tsésǫʼ` and `náhookǫs`
  have their senses reordered or trimmed. Glosses beginning "unpossessed form of" or with raw IPA are
  dropped (`NOT_A_MEANING`). `akąʼ` and `aʼáád` were taken out of the inventory: their first senses are
  anatomical, not "husband" and "wife".

**Known, left.** Two thirds of A2 has no sentence: Wiktionary illustrates few compound nouns, and Tatoeba has
nothing to add. The days of the week are Wiktionary's spellings, which mix two systems (`Damóo Biiskání`,
`Damóo dóó Naakijį́`). Wednesday and Thursday are left out: their entries follow neither of those two patterns
(`Tágíjį́ Ndaʼanish`, `damóodóó dį́ʼíjį́`), and a set of days in three spellings would teach the inconsistency.

## 8. As built (2026-11-16): B1

`python3 .claude/navajo/run.py --level b1`. **307 notes / 614 cards, against the planned 1,000, all from the
inventory** (`inventory.B1`, 14 topics scoped to the B1 descriptor). The fill is empty: no word that both
corpora count is left after A1 and A2's exclusions. 171 have sentences, three apiece for 41. 199 have IPA and
68 a forms line. A re-run is byte-identical, and A1 and A2 still rebuild byte-identical.

- **WHERE THE WORDS CAME FROM.** Matching concepts to glosses, as for A2, finds few abstract nouns, because
  Wiktionary's Navajo glosses rarely open on the bare English word. So B1 was chosen mainly from the remaining
  lemmas English Wiktionary's editors have worked on: those with an IPA line or a usage example of their own
  (about 530 after the exclusions), read by part of speech, with the everyday and B1-shaped ones kept. They
  cover knowledge and opinion, belief and ceremony, government and law, work and money, life events, health,
  feelings, the environment and the modern world. Concept matching added the professions and a few qualities.
  Most of what was refused is technical (verbs of a particular object's shape or motion, "it forms a
  meandering yellow line"), exotic animals, or a compound that names one specific thing.
- **THE DESCRIPTION SAYS SO** (`build_deck.desc`, the `from_inv == n` wording): all its words are the written
  vocabulary, and the counts order only those they know.
- **One gloss fixed**: `tʼáá shį́į́`'s second "gloss" in the extract is a citation of Young and Morgan, and the
  card shows its meaning alone (`GLOSS`).

**Known, left.** B1 is a third of the planned size. Reaching 1,000 would mean about 700 more words chosen with
no count, from entries no editor has illustrated. Several verbs keep Wiktionary's shape-of-object wording
("to pick up, lift, choose, find it (a solid roundish object)"), which is how Navajo itself divides them.

## 9. As built (2026-11-16): the phrases deck

`python3 .claude/navajo/run.py --level phr` runs `phrases.py` in place of `select.py`. **145 expressions / 290
cards in five subdecks** (the card's `sub`): 19 greetings and wishes, 36 everyday phrases, 25 exclamations, 27
set expressions and 38 sentences. A re-run is byte-identical, and the levels are unchanged.

- **THE FIRST FOUR SUBDECKS ARE WIKTIONARY'S OWN ENTRIES**: its Navajo `phrase` and `intj` headwords not
  taught by a level, with its meanings (107 in all). There is no hand gloss anywhere in the collection.
  The set expressions are the `tʼáá …` and `tʼáadoo …` phrases ("anywhere", "without a single exception",
  "just do it") that Navajo uses where English has one word.
- **THE SENTENCES ARE TATOEBA'S**, 38 of its 66 Navajo sentences, each with its contributor's English.
  The card has one sentence per meaning, none built round a foreign name or place (Tom, Ken, Washington),
  and none whose apostrophes cannot be read as glottal stops: `ahé’hee’` has an apostrophe misplaced, and
  normalising it would invent a sound. Each is printed as written, the glottal stop normalised to ʼ.
  A Tatoeba row carries its English itself (`en`), and the builder prints it as the card's English
  (`build_deck.build`).
- **SHOWN WITH ITS PUNCTUATION, KEYED WITHOUT IT** (Hausa's arrangement): `Haash yinílyé?` is the card's
  `Navajo`, `haash yinílyé` its `Word`, and that is the Wiktionary key and the level check's key.
- **NO PROVERBS**: English Wiktionary has no Navajo proverb entry and Tatoeba none either.
- **Synonyms trimmed**: four phrasings of "how are you?" and three of "where are you from?" made the reverse
  cards' labels lists of siblings; two and two are kept. `yáadilá`'s gloss keeps its non-crude senses
  (`GLOSS`).

**Known, left.** Only 8 expressions have an example sentence: Wiktionary illustrates few of its phrase
entries. The two Happy New Year phrases share a gloss, and the deck names each as "not" the other, as the
shelf-wide de-duplication pass does.
