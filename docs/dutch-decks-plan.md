# The Dutch language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Dutch deck in `decks/`.** It is the plan for a
Dutch set built in the Greek decks' shape (`docs/greek-decks-plan.md`, whose pipeline `.claude/dutch/`
adapts); `docs/lang-decks.md` is the record of how every set was built, and every rule there applies here
unless this file says otherwise. Asked for on 2026-11-09: "Create a Dutch language collection."

**STATUS (2026-11-09): A1 is built** (`.claude/dutch/`, §6). A2 to C1 and a phrases deck are not.

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
| Dutch A2 Elementary | `Dutch-A2.folio-deck.json` | 750 |
| Dutch B1 Intermediate | `Dutch-B1.folio-deck.json` | 1,000 |
| Dutch B2 Upper Intermediate | `Dutch-B2.folio-deck.json` | 1,500 |
| Dutch C1 Advanced | `Dutch-C1.folio-deck.json` | 1,500 |

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
