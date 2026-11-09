# The Telugu language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Telugu deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped, built on the Hindi pipeline
(`docs/hindi-decks-plan.md`, `.claude/hindi/`); `docs/lang-decks.md` is the record of how those were built,
and every rule there applies here unless this file says otherwise. Asked for on 2026-11-09: "Add a Telugu
language collection."

**STATUS (2026-11-09): the alphabet deck and A1 are built** (`.claude/telugu/`, §6). A2 to C1 and the
phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit raised the Hindi line's count instead of
adding one (one line per kind per day) and bumped the version, because it also changed the APP (the shelf's
hue in `app.js`).

## 1. The decisions (2026-11-09)

The request named no word source, script deck or sizes, so **the Hindi collection's answers of the same day
were carried over** — the owner's for a language in the same position (no exam board, an Indic script) —
rather than asking again. Any of them can be overruled on request.

1. **Word source: CEFR A1–C1, assembled** (the UKBI / TORFL / Hindi arrangement). No exam board publishes a
   graded Telugu word list, so each level is a hand-written topic inventory (`inventory.py`) scoped to the
   CEFR global descriptor for its band, topped up with the commonest remaining lemmas. Each deck's
   description says so in plain words. Sizes: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**,
   then a phrases deck.
2. **A Telugu-script alphabet deck** — first in the collection.
3. **Romanisation on every word card** — Wiktionary's own (ISO 15919: nēnu, pustakaṁ), the `Roman` field.
4. **This session: plan + alphabet + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Telugu Alphabet — built | `Telugu-Alphabet.folio-deck.json` | 52 |
| Telugu A1 Beginner — built | `Telugu-A1.folio-deck.json` | 500 |
| Telugu A2 Elementary | `Telugu-A2.folio-deck.json` | 750 |
| Telugu B1 Intermediate | `Telugu-B1.folio-deck.json` | 1,000 |
| Telugu B2 Upper Intermediate | `Telugu-B2.folio-deck.json` | 1,500 |
| Telugu C1 Advanced | `Telugu-C1.folio-deck.json` | 1,500 |
| Telugu Phrases and Expressions | `Telugu-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms, romanisation | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Telugu.jsonl`, 33 MB, 23,342 entries) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `te_full.txt` (12,857 forms — small, and machine-translated, §4) | CC BY-SA 4.0 |
| example sentences | Tatoeba `tel` exports (**314** Telugu–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 83 million (82.97), Census of India 2011, via Wikipedia's infobox, read 2026-11-09 | — |

**The sources are thinner than Hindi's, and the decks say so.** Wiktionary has no entry for many everyday
modern words (`నుండి` "from", `కానీ` "but", `ఇవ్వు` "give", most English loanwords — ఫోను, టిక్కెట్టు,
స్టేషను, డాక్టరు); an inventory word it lacks is dropped, never given a meaning, and `select.py` prints the
list. Tatoeba's 314 pairs give a sentence to 96 of A1's 500 words.

## 3. The card

One note, two templates (Telugu → English, English → Telugu), `speechLang: 'te-IN'`. Fields: `Telugu` (the
headword), `Roman`, `Word` (what the speaker reads), `English` (meanings by part of speech, a noun's gender
where Wiktionary records one), `Forms` (a noun's plural and its oblique where it changes — `ఇల్లు`, `ఇంటి`; a
verb's past and future for "I", where its stem moves — `తిను`, `తిన్నాను`, `తింటాను`), `Table` (behind a fold: a
noun's or pronoun's six cases; a verb's present continuous, past and future by person), `Examples`. The
type's CSS is `.claude/telugu/card.css` (Hindi's, unchanged). Verbs are headed by their dictionary form in
-ు (`తిను`, `చేయు`), the form Wiktionary and Telugu dictionaries list them under.

## 4. What Telugu needs that Hindi did not — the findings

- **THE FOLD** (`te.fold`): a noun's final -ము (the classical, dictionary spelling) and -ం (the modern one)
  are one word — Wiktionary has `పుస్తకము` with `పుస్తకం` as its "alternative form" — and `ళ్ళ` / `ళ్ల` are one
  cluster; the joiners are dropped. Matching only.
- **THE SPELLING A CARD PRINTS** (`extract.py`, `spell` / `spellings`): the modern -ం spelling where Wiktionary
  lists it, else an alternative the subtitles write more often than the headword (`గుర్తు` over `గురుతు`), each
  with **its own romanisation** (pustakaṁ, not pustakamu). An inventory word is printed as written there.
  Where the inventory writes -ం and Wiktionary has only -ము (`కోసం`, `అర్థం`, `కొంచెం`), the romanisation is
  Wiktionary's own -ము → -ṁ rule applied (`build_deck.py`).
- **THE SUBTITLE LIST IS MACHINE-TRANSLATED ENGLISH.** "No." became `సంఖ్య` "number", "go" and "why" were
  transliterated (`గో` "cow", `వై` "the letter Y"), names came through as words (`సారా` "arrack" is Sarah,
  `జో` "hush" is Joe), and "ass" became `గాడిద` "donkey". **And Telugu's case endings make a pronoun's dative
  or genitive a homograph of a rare noun**: `నాకు` "to me" is also the verb "to lick", `మాకు` "to us" a noun
  "tree", `వారి` "their" a noun "water". Each is in `select.EXCLUDE` with its reason, read off the ranking.
- **THE VERB TABLES CARRY NO TENSE.** Wiktionary's conjugation reaches kaikki as untitled blocks whose rows
  carry the person only; only the regular three-blocks-of-seven shape is labelled (by position: present
  continuous, past, future), and only about 35 verbs have it. Any other shape still counts and still matches
  sentences, but is never shown.
- **ONE ETYMOLOGY PER CARD** (`ETYMS`): `చెప్పు` "to tell" / "shoe", `అడుగు` "to ask" / "foot", `పన్ను` "tax" /
  "tooth", `గంట` "cornstalk stub" / "bell, hour", `అని` "battle" / the quotative, `కారు` "to trickle" / "black"
  / "season" / "car". `ONLY` drops a stray homograph in one etymology (`లేదు` "no" is also a noun "bear"),
  `PREFER` and `LEAD` choose the reading and gloss a card opens on (`ప్రతి` "every", `ఉదయం` "morning").
- The single-letter words `ఈ` "this", `ఆ` "that" and `ఏ` "which" are kept (Hindi's fill refused every
  one-letter lemma).

**Known, left.** Wiktionary glosses some function words at length ("first-person plural exclusive pronoun,
we") and some inventory words by an older first sense (`ఒక` "of or pertaining to one"); A1's postpositions
are few because the case endings (`లో` "in", `కి` / `కు` "to") are not Wiktionary entries; the fill carries the
subtitles' crime-drama vocabulary (`హత్య`, `తుపాకి`) on frequency, as every subtitle-ordered deck does.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: write
the level's inventory into `inventory.py` and its `SCOPE` into `telugu_level.py`, run, read every card, add
to `EXCLUDE` what the ranking shows. **Phase 3** — the phrases deck (Wiktionary has 174 `proverb` and 34
`phrase` entries). **Phase 4** — a combined file, gitignored.

## 6. As built (2026-11-09): the alphabet and A1

`python3 .claude/telugu/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py`
→ `examples.py` → `build_deck.py`, caching in `.claude/telugu-cache/` (gitignored, ~140 MB, most of it
Tatoeba's English sentences); `python3 .claude/telugu/alphabet.py` writes the alphabet deck (reads
`lex.json` for the example words' romanisations; one by hand, `ROMAN_BY_HAND`).
`node .claude/telugu/check-telugu.js` is the check. **A re-run is byte-identical** (verified for both
decks). A1: 500 notes, 276 from the inventory and 224 by frequency; 304 nouns, 46 verbs; sentences for 96
(three for 35). The alphabet: 52 notes — 13 vowels (each alone and as its sign on క), 3 signs, 33
consonants, ళ, క్ష and ఱ; every sound side unique (asserted). The shelf's hue is measured: first `#228122`,
19.3 from its nearest of 46 — but Arabic, merged meanwhile, had been measured into `#2A8424`, so it was
re-swept against all 47: `#9D0D6C`, 18.7 from its nearest (Japan). The same sweep run without Hindi lands
next to Hindi's `#9F51B4`, which is how the method was checked. **Re-sweep after merging** (Turkish's lesson).
