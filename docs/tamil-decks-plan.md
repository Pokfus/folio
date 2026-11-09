# The Tamil language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Tamil deck in `decks/`.** It is the plan for a
twelfth language set, built in the shape of the Hindi decks (`docs/hindi-decks-plan.md`), whose pipeline
`.claude/tamil/` was adapted from; `docs/lang-decks.md` is the record of how the earlier sets were built,
and every rule there applies here unless this file says otherwise. Asked for on 2026-11-09: "Add a Tamil
language collection."

**STATUS (2026-11-09): the alphabet deck and A1 are built** (`.claude/tamil/`, §6). A2 to C1 and the
phrases deck are not.

A deck under `decks/` is community content, not a change to Folio, so **no deck this plan produces gets a
changelog line or a version bump**. The collection's first commit did carry one, because it also changed
the APP (the shelf's hue in `app.js`): it shares the day's line with Hindi ("one line per KIND of change per
day"), as Hindi's, Turkish's and Russian's first commits did.

## 1. The decisions — Hindi's, followed

The request named no arrangement, and the owner had answered the same four questions for Hindi that
morning, so they are followed here rather than asked again. **Any of them is the owner's to change.**

1. **Word source: CEFR A1–C1, assembled.** No exam board publishes a graded Tamil word list for learners,
   so each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global descriptor
   for its band, topped up with the commonest remaining lemmas. Each deck's description says so in plain
   words. Sizes as Hindi's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**, then a phrases deck.
2. **An alphabet deck**, first in the collection.
3. **Romanisation on every word card** — Wiktionary's own (ISO 15919: vīṭu, pōkiṟēṉ), the `Roman` field.
4. **This session: plan + alphabet + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Tamil Alphabet — built | `Tamil-Alphabet.folio-deck.json` | 38 |
| Tamil A1 Beginner — built | `Tamil-A1.folio-deck.json` | 500 |
| Tamil A2 Elementary | `Tamil-A2.folio-deck.json` | 750 |
| Tamil B1 Intermediate | `Tamil-B1.folio-deck.json` | 1,000 |
| Tamil B2 Upper Intermediate | `Tamil-B2.folio-deck.json` | 1,500 |
| Tamil C1 Advanced | `Tamil-C1.folio-deck.json` | 1,500 |
| Tamil Phrases and Expressions | `Tamil-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule; "Alphabet" sorts first.

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, forms, romanisation | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Tamil.jsonl`, 89 MB, 13,878 entries) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `ta_full.txt` (19,371 forms — small) | CC BY-SA 4.0 |
| example sentences | Tatoeba `tam` exports (598 Tamil sentences, 566 with an English translation) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 78.7 million (2011–2019), Ethnologue 28th ed., via Wikipedia's infobox, read 2026-11-09 | — |

## 3. The card

One note, two templates (Tamil → English, English → Tamil), `speechLang: 'ta-IN'`. Fields: `Tamil` (the
headword), `Roman`, `Word` (what the speaker reads), `English` (meanings by part of speech), `Forms` (a
noun's plural, accusative and locative, which show the stem its cases are built on: `வீடு` → `வீட்டை`,
`வீட்டில்`; a pronoun's accusative and dative, `என்னை`, `எனக்கு`; a verb's first-person past, infinitive and
adverbial participle, `போனேன்`, `போக`, `போய்`), `Table` (behind a fold: a verb's key non-finite forms and its
present, past and future for all ten persons, and its imperatives; a noun's or pronoun's eight cases, singular
and plural), `Examples` (Tatoeba sentences where there are any, the word in bold, with a speaker). A verb is
cited by its stem, which is its plain imperative (`போ` "go!"), as Wiktionary and the Madras Tamil Lexicon
cite it. The type's CSS is `.claude/tamil/card.css`, Hindi's unchanged.

**Which Tamil: the written standard.** Tamil is diglossic — spoken Tamil differs from the written language
in its verb endings and many common words (written `போகிறேன்` pōkiṟēṉ "I go", said pōṟēṉ). Wiktionary's
headwords and tables are the written forms, and so is the subtitle list (machine-like formal Tamil: `ஒரு`,
`மற்றும்`, `உள்ளது` are near the top). The deck's description says so. A colloquial deck would need a
source this pipeline does not have.

## 4. What Tamil needs that no earlier set did — the findings

- **THE SANDHI CONSONANT** (`ta.bare`): before a word beginning with a hard consonant, Tamil writes that
  consonant doubled onto the end of the word before (`வீட்டுக்குப் போ`). No table lists such a token. A
  token is counted, and matched in a sentence, without the doubled consonant — only when the token itself
  is not a known form and the bare one is, so a word that really ends in one (an English loan) is never cut.
- **THE FOLD** is only NFC plus dropping ZWJ / ZWNJ (`ta.fold`); Tamil has no nukta / chandrabindu problem.
- **CASE CELLS WIKTIONARY CANNOT NAME.** The table tags nominative, accusative, dative, benefactive,
  instrumental and ablative, but the genitive, locative and sociative cells come as
  "error-unrecognized-form". `build_deck.case_of` names them by their ending in the romanisation (-iṉ, -il,
  -ōṭu; -uṭaiya and -iṭam and -uṭaṉ are the alternatives). The tables' empty cells are written `-` and are
  dropped (`ta.is_tamil` demands a letter).
- **HOMOGRAPHS EVERYWHERE.** Wiktionary files most short Tamil words under several etymologies (`கார்` "car"
  / "blackness, the monsoon", `நீ` "you" / "to forsake", `கை` "hand" / "to be bitter"). So an inventory word
  may name its parts of speech (`நீ:pron`, `சரி:intj+noun`) and the card shows ONLY those, in that order
  (Hindi only sorted by it); a fill word may be given one in `select.FILL_POS` (`மீது:postp`); and
  `build_deck.ETYMS` picks the etymology where the first is not the everyday word — chiefly where the
  subtitles' count is a VERB's and the first etymology a noun (`கல்` "to learn", not "stone"; `கூறு` "to
  say", not "part"; `கிடை` "to be obtained", not "lying down").
- **VERB FORMS FILED AS WORDS.** Wiktionary has entries for verb forms under other parts of speech — `வந்து`
  (come's participle) as an interjection "a filler word", `செல்ல` (go's infinitive) as an adverb "at a
  distance", `விட்டு` as a postposition. Each is in `select.EXCLUDE` with its reason, with the counts that
  belonged to another word (`மாட்டு` "to fasten" holds the count of `மாட்டேன்` "will not") and two subtitle
  artefacts (`துடைக்க`, `விழுங்க`, each a single form counted ~100 times).
- **"Synonym of X" ENTRIES** (`இப்போது` → `இப்பொழுது`, `எப்போது`, `எப்போதும்`) take X's meanings
  (`build_deck.resolve_syn`); a case form filed as a pronoun ("sociative of நான்") is never dealt.
- **AN ALTERNATIVE SPELLING** the inventory uses (`வயது`, `ரயில்`, `நிமிடம்`, `தொலைபேசி`, filed under
  `வயசு`, `இரயில்`, `நிமிஷம்`, `தொலைப்பேசி`) takes the target's meanings, its OWN romanisation, and no forms
  line or table (the target's would spell the other word); the fill never deals the target again.
- Wiktionary ends many Tamil glosses with a full stop; it is dropped. Swearing is in `select.SWEARS`.

**Known, left.** The frequency list is small (19k forms) and the counts low, so the fill's lower half is
noisy: the subtitles' crime and science-fiction vocabulary (`துப்பாக்கி` gun, `கொலை` murder, `கிரகம்`
planet, `அணு` atom) is dealt on frequency, as every subtitle-ordered deck on the shelf does. Tatoeba holds
so few Tamil sentences that **321 of A1's 500 words have none** (36 % carry at least one); the
description says so. Some glosses are Wiktionary's oddities (`சிவப்பு` "red, anger, blackness"). A verb's
past is shown in the first person (`போனேன்`), not as a bare stem, because Tamil has no bare past form.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: write
the level's inventory into `inventory.py` and its `SCOPE` into `tamil_level.py`, run, read every card, and
extend `EXCLUDE` / `ETYMS` / `FILL_POS` from what the ranking shows. A larger Tamil frequency list (a web or
news corpus under an open licence) would help the upper levels more than anything else. **Phase 3** — the
phrases deck. **Phase 4** — a combined file, gitignored.

## 6. As built (2026-11-09): the alphabet and A1

`python3 .claude/tamil/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py`
→ `examples.py` → `build_deck.py`, caching in `.claude/tamil-cache/` (gitignored, ~200 MB);
`python3 .claude/tamil/alphabet.py` writes the alphabet deck (reads `lex.json` for the example words'
romanisations; one by hand, `ROMAN_BY_HAND`). `node .claude/tamil/check-tamil.js` is the check. **A re-run
is byte-identical** (verified for both decks). A1: 500 notes, 264 from the inventory and 236 by frequency;
346 with a forms line, 179 with at least one sentence. The alphabet: 38 notes — 12 vowels (each alone and
as its sign on க), the āytam and the puḷḷi, 18 consonants, 6 Grantha letters (ஜ ஷ ஸ ஹ க்ஷ ஸ்ரீ); every sound
side unique (asserted). The shelf's hue is measured: `#CF3F57`, a crimson, 15.8 from its nearest of 58 (re-swept at the merge:
the first sweep's periwinkle, `#6F69D2`, had been taken by Greek in parallel).
