# The Dutch language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Dutch deck in `decks/`.** It is the plan for a
Dutch set built in the Greek decks' shape (`docs/greek-decks-plan.md`, whose pipeline `.claude/dutch/`
adapts); `docs/lang-decks.md` is the record of how every set was built, and every rule there applies here
unless this file says otherwise. Asked for on 2026-11-09: "Create a Dutch language collection."

**STATUS (2026-11-12): all five levels, A1 to C1, are built** (`.claude/dutch/`, §6–§10). The phrases deck (Phase 3) is not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one (adding Dutch to the day's
"collections join the Languages section" line) because it also changed the APP — the shelf's hue in `app.js`.

## 1. The decisions (2026-11-09, taken from the Hindi and Greek precedent — the owner was not asked)

1. **Word source: CEFR A1–C1, assembled.** Dutch HAS examinations at these levels — the inburgeringsexamen
   (A2), the Staatsexamen NT2 (B1, B2) and the CNaVT of KU Leuven (A2–C1) — but no graded word list for any
   of them was found published (one web search, 2026-11-09), so the decks do not claim to be their
   vocabulary. Each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global
   descriptor, topped up with the commonest remaining lemmas; the description says so. Sizes, Hindi's:
   **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**.
2. **NO ALPHABET DECK.** Dutch is written in the Latin alphabet the reader already reads; every other
   new collection of the day had one because its script was new. The sound is carried by **Wiktionary's
   IPA on every word card** instead of a romanisation.
3. **Standard Dutch** (Netherlands and Flanders alike); a sense Wiktionary marks Belgian, Flemish or
   Surinamese is kept but never leads a card (`WEAK` in `extract.py`).

| deck | file | notes |
|---|---|---|
| Dutch A1 Beginner — built | `Dutch-A1.folio-deck.json` | 500 |
| Dutch A2 Elementary — built | `Dutch-A2.folio-deck.json` | 750 |
| Dutch B1 Intermediate — built | `Dutch-B1.folio-deck.json` | 1,000 |
| Dutch B2 Upper Intermediate — built | `Dutch-B2.folio-deck.json` | 1,500 |
| Dutch C1 Advanced — built | `Dutch-C1.folio-deck.json` | 1,500 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms, IPA | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Dutch.jsonl`, 257 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `nl_full.txt` | CC BY-SA 4.0 |
| example sentences | Tatoeba `nld` exports (148,640 Dutch–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 25 million, Wikipedia's infobox (a 2021 figure), read 2026-11-09 | — |

## 3. The card

One note, two templates (Dutch → English, English → Dutch), `speechLang: 'nl-NL'`. Fields: `Dutch` (the
headword, **a noun with its article** — de or het, de/het where Wiktionary gives both — in `.uc-art`), `IPA`
(Wiktionary's first phonemic transcription), `Word` (the bare lemma, what the checks key on), `Say` (article
and noun), `English` (meanings by part of speech, a noun's gender in its label), `Forms` (a noun's plural and
diminutive, an adjective's inflected form, comparative and superlative, a verb's past and past participle —
`at`, `gegeten`), `Table` (verbs only, behind a fold: present and past by person — ik, jij, hij/zij/het,
the plural — the imperative and both participles; a separable verb in its main-clause order, `sta op`),
`Examples` (up to three Tatoeba sentences, the word in bold). The type's CSS is `.claude/dutch/card.css`
(Greek's, with `.uc-ipa`).

## 4. What Dutch needs that no earlier set did — the findings

- **THE FOLD KEEPS THE ACCENTS** (`nl.fold`: NFC, lower case): `één` "one" against `een` "a", `vóór` against
  `voor`. Wiktionary files `één` as an alternative spelling of `een`, so its card is drawn from `een`'s entry
  with the article dropped and the numeral glossed and transcribed (/eːn/) in `build_deck.py`.
- **NEVER A NOUN'S HEADWORD AGAINST A VERB'S CELL.** Carried over from Greek and Hindi and found again at
  once: a Dutch verb's stem is its first person and imperative, and Wiktionary files most as nouns too
  (`kijk` "view", `vraag`, `hoop`, `zorg`), so giving the noun its spelling dealt `kijk`, `zeg`, `wacht` and
  `geef` into A1 with the verbs' counts. What IS kept: a noun's headword against an adjective's cell, and an
  **adjective's headword against a verb's** (`klaar` "ready" against the imperative of `klaren`).
- **A PRONOUN'S OR DETERMINER'S FORM IS A WORD** (`ze`, `we`, `me` "unstressed form of …", `dit` "neuter
  singular of deze"): kept as lemmas, glossed in `GLOSS`. `onze` and `elke` are forms taught on `ons`, `elk`.
- **AN ABBREVIATION CLAIMS NOTHING**: `m` "masculine" pointed at `mannelijk` and handed it the count of `'m`
  "him"; abbreviation, initialism and clipping senses are not form pointers.
- **AN ARCHAIC INDECLINABLE KEEPS NOTHING**: the own-spelling rule needs a live sense (`hou` "friendly" had
  taken all of `houden`'s `hou`).
- **SHADOWED CAPITALS** are kept under `=Word` (`Engels` "English" is not `engels`, a unit of mass), and the
  two language names the inventory teaches, filed by Wiktionary as proper names, are read as the neuter
  nouns they are (`LANG_NAMES`: het Nederlands, het Engels).
- **SEPARABLE VERBS ARE UNDER-RANKED**: the subtitle list counts single words and a main clause writes
  `sta … op`, so `opstaan` earns only its joined forms; the everyday ones belong in the inventory.
- Hand exclusions from the fill, each with its reason, in `select.EXCLUDE` (`zeg`, `wijten`, `paren`, `zat`,
  `gezien`, `beter` …); swearing in `SWEARS`. One etymology per card unless `ETYMS` names more (`weer`
  "again" and "weather", `zijn` "to be" and "his", `meer` "more" not "lake", `bank` the bank first).
  `GENDER_FIX`: `raam` is het (Wiktionary's "n, f" belongs to the "frame" sense).

**Known, left.** The fill carries the subtitles' crime-drama vocabulary (`vermoorden`, `schieten`, `politie`)
on frequency, as every subtitle-ordered deck on the shelf does. Seven of A1's 500 words have no IPA in
Wiktionary (`iedereen`, `juli`, `november` …). Wiktionary gives no perfect auxiliary (hebben or zijn), so the
card does not show one.

## 5. Phases

**Phase 1 (done)** — the pipeline and A1. **Phase 2** — A2 to C1, one level per session: write the level's
inventory into `inventory.py` and its `SCOPE` into `dutch_level.py`, run, read every card. **Phase 3** — a
phrases deck (`phrase` / `proverb` entries and idiomatic multi-word lemmas: `tot ziens`, `eet smakelijk`).

## 6. As built (2026-11-09): A1

`python3 .claude/dutch/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/dutch-cache/` (gitignored, ~400 MB).
`node .claude/dutch/check-dutch.js` is the check. **A re-run is byte-identical** (verified). A1: 500 notes,
380 from the inventory and 120 by frequency; three sentences for 499, one or two for the last; 493 with IPA.
The shelf's hue is measured: `#934F5A`, 15.2 from its nearest of 65 (Visual Art); the first sweep's steel blue went to Vietnamese in a parallel session, so it was re-swept at the merge.

## 7. As built (2026-11-12): A2

`python3 .claude/dutch/run.py --level a2`. 750 notes, 424 from the A2 inventory (`inventory.py`: relatives,
jobs and study, clothes, food and cooking, the home, the town, travel, nature and the compass, animals, health,
feelings, free time, time words, the higher numbers and quantities, everyday verbs) and 326 by frequency; the
A1 deck's words are left out (`words_below`). Three sentences for 746, none for 2; 713 with IPA. A re-run is
byte-identical, and A1 still rebuilds byte for byte under the shared changes. One inventory word not in
Wiktionary as a lemma: `liedje` (a diminutive), taught as `lied`; `Pasen` was dropped (Wiktionary's proper
noun is not extracted; the lower-case `pasen` is a slang verb).

**What the A2 ranking found** (the hand list is in `select.EXCLUDE`, each with its reason):
- **A VERB WHOSE COUNT IS A NOUN'S PLURAL** — the mirror of §4's rule, and the bulk of the fill's faults one
  level up: `kaarten`, `koppen`, `rechten`, `zinnen`, `moorden`, `verhalen`, `buurten`, `gassen`, `landen`,
  `sporen`, `doelen`, `prijzen`, `wonden`, `stemmen`, `zakken`, `gebieden` all ranked on their nouns' plurals.
  Excluded by hand, not by a rule: a real verb (`zakken` "to fail") can share the spelling, and a rule would
  have to tell which forms the subtitles meant.
- **A FORM LISTED IN ANOTHER WORD'S TABLE**: Wiktionary gives `school` as a past of `schuilen` and `lekker` as
  the comparative of `lek`, so each took a common word's count.
- **NAMES AND ENGLISH** fold into lower-case lemmas: `frank`, `peter`, `jack`, `joe`, `miss`.
- **PARTICIPLES AND FORMS** of A1 words: `gemaakt`, `gegeven`, `betaald`, `zoek`, `help`, `goeie`, `slechte`.
- Glosses written in `build_deck.py`: `intussen` (Wiktionary: "synonym of ondertussen", which printed
  nothing), `kopje` (Wiktionary's only sense is a cat's head-rub), `sommige` (an "inflection of" pointer);
  `zeer` leads with "very" (`ETYMS`).

## 8. As built (2026-11-12): B1

`python3 .claude/dutch/run.py --level b1`. 1,000 notes, 340 from the B1 inventory (work and careers,
education, media, society and politics, the environment, housing, health, travel, money, relationships and
feelings, opinion and argument with its connectives, describing things, culture, the verbs of change) and 660
by frequency; A1 and A2 are left out. Three sentences for 949, none for 10; 886 with IPA. A re-run is
byte-identical; A1 and A2 rebuild byte for byte. Five inventory compounds are not Wiktionary lemmas and were
dropped (`kantoorbaan`, `nieuwsbericht`, `verhuurder`, `nutsvoorzieningen`, `gewond`).

**What the B1 ranking found** — §7's faults again, at a larger scale, since the fill is two thirds of the
deck: some thirty verbs or adjectives counted on a noun's plural (`bergen`, `huizen`, `ogen`, `benen`,
`banen` …), forms in another word's table (`hongeren` ← honger, `lassen` ← las, `kies` ← kiezen), names
(`bob`, `helen`, `kim`), English (`big`, `high`, `wow`), nominalised forms (`vreemde`, `Franse`, `oudere`),
participles, and hesitation sounds — every one in `select.EXCLUDE` with its reason. **A POINTER GLOSS PRINTS
AN EMPTY SIDE** and the shelf-wide dedupe pass then labels four empty sides "not …" against one another
(`vanmorgen`, `zulke`, `vele`, `gelukken`): `zulke` is glossed in `build_deck.py`, the other three are
excluded. `pesten` drops its noun (`DROP_POS`: the card game Mau Mau led over "to bully"); `klote` joins
`SWEARS`. Known, left: the fill's crime-drama and fantasy share is larger than A2's (`rechercheur`,
`vingerafdruk`, `vampier`, `heks`), as on every subtitle-ordered deck.

## 9. As built (2026-11-12): B2

`python3 .claude/dutch/run.py --level b2`. 1,500 notes, 354 from the B2 inventory (business and the economy,
politics and law, science and technology, climate, medicine, higher education, media and the arts, abstract
ideas and argument, the connectives of formal writing, character, states of mind, city planning, the verbs
of getting things done) and 1,146 by frequency; A1 to B1 are left out. Three sentences for 1,251, none for
78; 1,209 with IPA. A re-run is byte-identical; A1, A2 and B1 rebuild byte for byte. Sixteen inventory
words are not Wiktionary lemmas and were dropped (among them `cao`, `branche`, `reportage`, `overtuigend`
and five participle adjectives such as `gemotiveerd`, which Wiktionary files only under their verbs).

**Reading 1,146 fill words** was made tractable by a throwaway pass that flagged every fill lemma that is
also a form in another lemma's table or a noun's plural (219 of them); the flagged ones were read first,
most were real words (`groeten`, `glimlachen`, `straffen`), and the rest were read by eye. What it found
is §7–§8 again — plurals (`dagen`, `wegen`, `golven`, `neuzen` …), names (`steven`, `rob`, `pat`), English
(`house`, `girl`, `loser`), nominalised forms, participles of lower levels — plus, new at this level:
- **CRUDE WORDS THAT ARE NOT OATHS** (`pijpen`, `geil`, `poepen`, `pissen`, `zeiken`) and insults
  (`wijf`, `kreng`, `rotzak`, `schoft`) — `SWEARS` now holds both.
- **TWO PLURAL-ONLY NOUNS WITH NO GENDER** (`chips`, `gegevens`) and `kapitaal`'s "nc", which the check
  caught as nouns with no article: `GENDER_FIX`. `chips` also drops its minced-oath interjection.
- Glosses: `laken` (the bedsheet before the broadcloth), `kapitaal` (Wiktionary's senses end in stray
  gender letters); `LEAD`: `inflatie` (not "stomach bloat"), `kijker` (not "telescope").

## 10. As built (2026-11-12): C1

`python3 .claude/dutch/run.py --level c1`. 1,500 notes, 327 from the C1 inventory (law and institutions,
economy and finance, academic and analytical language, argument and rhetoric, the formal register's
connectives, society and ethics, psychology, literature and the arts, science and the environment, formal
verbs, adjectives and adverbs of degree and stance) and 1,173 by frequency; A1 to B2 are left out. Three
sentences for 941, **none for 252** — the sparsest level by far, Tatoeba having few sentences for formal
vocabulary; 1,156 with IPA. A re-run is byte-identical; A1 to B2 rebuild byte for byte.

**Forty-five inventory words are not Wiktionary lemmas** — the most of any level, and the honest limit of an
assembled C1: formal compounds (`belangengroep`, `kansengelijkheid`, `gedragspatroon`), participle adjectives
filed only under their verbs (`gefascineerd`, `verontwaardigd`), the pronominal adverbs (`waardoor`,
`waarbij`, `hiervan`, which the extract does not keep as lemmas), and some that are plainly missing
(`ratificeren`, `inherent`, `validiteit`, `melancholie`). Each was dropped, never given a meaning.
`voorbehoud` was taken out by hand: Wiktionary has only its verb-form entry, not the noun "reservation".

**The fill** (185 flagged by the forms pass, the rest read by eye) found §7–§9's faults once more —
plurals (`ramen`, `tranen`, `gebaren`, `ploegen` …), nominalised forms (`Ierse`, `zwangere`, `schuldige`),
names, English, interjections, two insults and two crude words — and **four more pointer-only entries
that printed an empty English side** (`inmiddels`, `esthetiek`, `luidens`, glossed in `build_deck.py`;
`hemeltje`, excluded) plus `dergelijke` (excluded). `koolstofdioxide` had "nc" (`GENDER_FIX`: het).
