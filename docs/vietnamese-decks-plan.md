# The Vietnamese language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Vietnamese deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Hindi, Russian TORFL, Indonesian UKBI, Turkish …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this file
says otherwise. Asked for on 2026-11-09: "Add a Vietnamese language collection."

**STATUS (2026-11-09): the alphabet-and-tones deck and A1 are built** (`.claude/vietnamese/`, §6). A2 to C1 and
the phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one line and one bump, because it also
changed the APP (the shelf's hue in `app.js`) — the Hindi, Turkish and Russian precedent.

## 1. The decisions (2026-11-09)

The request named no word source, sizes or extras, so the Hindi set's answers were taken as the default — the
owner's most recent decisions for a language with no published list — and are open to change:

1. **Word source: CEFR A1–C1, assembled.** Vietnam's own six-level framework for foreign learners (*Khung năng
   lực tiếng Việt dùng cho người nước ngoài*, 2015) publishes no word list, and no exam board does, so each level
   is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up
   with the commonest remaining words. Each deck's description says so. Sizes: **A1 500 · A2 750 · B1 1,000 ·
   B2 1,500 · C1 1,500 notes**, then a phrases deck.
2. **An alphabet-and-tones deck, first** — Vietnamese needs no script deck, but the six tones and the letters
   that do not sound as in English are what a beginner cannot read off the page.
3. **No romanisation** (the language is written in the Latin alphabet); in its place **the tones named under the
   headword**, one per syllable.
4. **This session: plan + alphabet-and-tones + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Vietnamese Alphabet and Tones — built | `Vietnamese-Alphabet-and-Tones.folio-deck.json` | 35 |
| Vietnamese A1 Beginner — built | `Vietnamese-A1.folio-deck.json` | 500 |
| Vietnamese A2 Elementary | `Vietnamese-A2.folio-deck.json` | 750 |
| Vietnamese B1 Intermediate | `Vietnamese-B1.folio-deck.json` | 1,000 |
| Vietnamese B2 Upper Intermediate | `Vietnamese-B2.folio-deck.json` | 1,500 |
| Vietnamese C1 Advanced | `Vietnamese-C1.folio-deck.json` | 1,500 |
| Vietnamese Phrases and Expressions | `Vietnamese-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule; "Alphabet" sorts first.

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, classifiers, characters, IPA | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Vietnamese.jsonl`, 83 MB) | CC BY-SA 4.0 |
| frequency | OpenSubtitles 2018 Vietnamese monolingual text, from OPUS (`vi.txt.gz`, 5.1 M lines), segmented and counted here | the corpus OPUS distributes from opensubtitles.org (hermitdave's CC BY-SA list is built from the same text) |
| example sentences | Tatoeba `vie` exports (≈22,100 Vietnamese–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 86 million, Ethnologue 28th ed., via Wikipedia's infobox, read 2026-11-09 | — |

## 3. The card

One note, two templates (Vietnamese → English, English → Vietnamese), `speechLang: 'vi-VN'`. Fields:
`Vietnamese` (the headword), `Word` (what the speaker reads), `Tones` (one tone name per syllable, read off the
spelling's marks by `vi.tone`), `English` (meanings by part of speech; a Northern / Southern / register label
after a meaning Wiktionary tags), `Notes` (a noun's classifiers; the characters of a Sino-Vietnamese word), `Sound`
(Wiktionary's IPA, Hanoi and — where it differs — Saigon), `Examples` (up to three Tatoeba sentences, the word in
bold, with a speaker). Vietnamese does not inflect, so there is no forms line and no table. The type's CSS is
`.claude/vietnamese/card.css` (the Hindi type's, less the tables, plus `.uc-tone`, `.uc-notes`, `.uc-ipa`).

## 4. What Vietnamese needs that no earlier set did — the findings

- **A SPACE IS A SYLLABLE, NOT A WORD.** `học sinh` "pupil" is one word of two tokens, so hermitdave's `vi_full.txt`
  is a list of syllables and cannot deal a vocabulary deck. `extract.py` segments the OPUS subtitles itself — greedy
  longest match against every Wiktionary headword up to four syllables (proper names included, so `Việt Nam` is not
  `việt` + `nam`), splitting at punctuation — and counts the segments. It is the textbook baseline and it errs
  (`học sinh viên` → `học sinh` + `viên`), but rarely on common words; a frequency only orders a list. `examples.py`
  segments each Tatoeba sentence the same way, so `học` is never illustrated by a sentence about a `học sinh`.
- **THE FOLD** (`vi.fold`): the tone mark of `oa`, `oe`, `uy` sits in two places in real writing (`hoà` / `hòa`,
  `khoẻ` / `khỏe`); the fold takes the tone off each syllable and writes it as a digit, so both match. The card prints
  Wiktionary's spelling, which mostly keeps the older placement — the description says the newer is equally correct.
- **DECOMPOSED SUBTITLES.** Some OPUS files store a vowel and its marks as separate code points; read raw, `có` splits
  into `co` and the first count had `co`, `u`, `y`, `a`, `ca` among the top 500. Every line is NFC'd first. Lines of
  four or more syllables with no non-ASCII letter (unaccented typing, English) are skipped (35,630 of 5.1 M).
- **ONE ETYMOLOGY PER CARD** (`ETYMS` in `build_deck.py`): homographs are numbered etymologies in Wiktionary — `là`
  "to be" / "fine silk" / "to iron", `súng` "gun" / "water lily", `trà` "tea" / "spectrum of age", `má` "mother" /
  "cheek", `bố` "father" / "burlap", `điều` "thing said" / "cashew". The etymology kept holds the inventory's part of
  speech, else the first with a non-weak meaning, unless the table names others; the classifier and the characters
  are the LEAD entry's own (before this, `tốt` "good" showed the chess pawn's 卒 and `điều` the cashew's classifiers).
- **"synonym of X"** with no gloss of its own (`quyển`, the classifier for books) takes X's first meaning in the same
  part of speech; one with a gloss (`synonym of uống (“to drink”)`) takes the gloss.
- **Slang is weak** (`chuối` "banana; penis", `tím` "purple; gay"), as are letter-name senses (`chờ` "the letter Ch").
- The fill leaves out `mày` / `tao` (pronouns that are insults outside intimacy), and `ngươi`, `thằng`, `chuyện đó`,
  each with its reason in `select.EXCLUDE`.

**Known, left.** Many first glosses for the kinship pronouns are Wiktionary's long usage notes ("I/me (used by
someone with status equal or higher than …)"). Only 55 of A1's nouns carry a classifier — Wiktionary lists one for
those only. The fill carries the subtitles' drama vocabulary (`giết`, `súng`, `bắn`, `cảnh sát`) on frequency, as
every subtitle-ordered deck on the shelf does. One of A1's 500 words (`bún`) has no Tatoeba sentence.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet-and-tones deck, A1. **Phase 2** — A2 to C1, one level per session:
write the level's inventory into `inventory.py` and its `SCOPE` into `vietnamese_level.py`, run, read every card.
**Phase 3** — the phrases deck (`phrase` / `proverb` entries). **Phase 4** — a combined file, gitignored.

## 6. As built (2026-11-09): the alphabet-and-tones deck and A1

`python3 .claude/vietnamese/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/vietnamese-cache/` (gitignored, ~270 MB; the segmentation, about
a minute, is cached in `seg-counts.json` — delete it to recount). `python3 .claude/vietnamese/tones.py` writes the
alphabet-and-tones deck after A1 (it reads the A1 card's meaning and `lex.json`'s IPA for each example word; the
sounds of the tones and letters are written in the script, Hanoi first with the Saigon difference).
`node .claude/vietnamese/check-vietnamese.js` is the check. **A re-run is byte-identical** (verified for both decks).
A1: 500 notes, 344 from the inventory and 156 by frequency; three sentences for 496, none for 1. The alphabet-and-
tones deck: 35 notes — 6 tones, 11 vowels, 18 consonants and pairs; every sound side unique (asserted). The shelf's
hue is measured: `#14659F`, 16.9 from its nearest of 52, greens left out (re-swept at the merge: Greek had
taken a hue 1.0 from the first sweep's `#6D67D1`).
