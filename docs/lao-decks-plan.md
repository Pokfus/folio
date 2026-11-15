# The Lao language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Lao deck in `decks/`.** It is the plan for a Lao set in
the shape of the Thai one (`docs/thai-decks-plan.md`), whose script, word cut and card it shares;
`docs/lang-decks.md` is the record of how the sets were built, and every rule there applies here unless this file
says otherwise. Asked for on 2026-11-15: "Add a Lao language collection."

**STATUS (2026-11-15): the alphabet and A1 are built** (`.claude/lao/`, §6). A2 onward are not sized yet (§5).

A deck under `decks/` is community content, not a change to Folio: no changelog line for any later deck this plan
produces. The collection's first commit carried one, as Thai's and Finnish's did, because it also changed the APP —
the shelf's hue in `app.js`.

## 1. The decisions (2026-11-15)

The request named no word source, script deck or romanisation. The Thai answers were taken rather than asking —
**they are the owner's to overturn**:

1. **Word source: CEFR A1–C1, assembled.** No examination of Lao for foreigners publishes a graded word list, so
   each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global descriptor for its band,
   topped up with the commonest remaining words. Each deck's description says so.
2. **A Lao script deck, first in the collection.**
3. **Romanisation on every word card, with the TONE** — read off Wiktionary's IPA, not its romanisation (§4).
4. **This session: plan + alphabet + A1.**

| deck | file | notes |
|---|---|---|
| Lao Alphabet — built | `Lao-Alphabet.folio-deck.json` | 79 |
| Lao A1 Beginner — built | `Lao-A1.folio-deck.json` | 500 |
| A2 onward | — | not sized (§5) |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, pronunciation (Vientiane IPA), classifiers, some examples | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Lao.jsonl`, 5.4 MB, 2,751 entries, about 2,400 usable words) | CC BY-SA 4.0 |
| frequency (counts only; no text ships) | the Lao Wikipedia dump `lowiki-20261101-pages-articles`, cut into words here | CC BY-SA 4.0 |
| example sentences | Tatoeba `lao` exports (≈230 Lao–English pairs) | CC BY 2.0 FR |
| the alphabet deck's facts | English Wikipedia, "Lao script" (consonant chart, ligatures, vowels, numerals) and "Lao language" § Indication of tones, read 2026-11-15 | CC BY-SA 4.0 |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 3.69 million L1 (2015) and 0.80 million L2, Ethnologue 27th ed., via Wikipedia's infobox, read 2026-11-15 | — |

**Checked and not used**: hermitdave/FrequencyWords has no Lao list (404; a subtitle list counts space-separated
tokens and Lao writes none); PyThaiNLP's corpora are Thai; the Leipzig Corpora Collection's `lao_community_2017`
downloads, but its download page sits behind a bot challenge, so its licence could not be read — not used.

## 3. The card

One note, two templates (Lao → English, English → Lao), `speechLang: 'lo-LA'` (few devices have a Lao voice). Fields: `Lao` (the headword), `Roman`, `Word` (what the speaker
reads), `English` (meanings by part of speech), `Forms` (a noun's CLASSIFIER where Wiktionary names one), `Examples`
(up to three). No forms table: Lao does not inflect. The CSS is `.claude/lao/card.css` (Thai's).

## 4. What Lao needs that Thai did not — the findings

- **WIKTIONARY'S ROMANISATION IS NOT ONE SYSTEM, SO THE CARD READS THE IPA** (`lo.romanise`). The extraction's
  romanisation mixes schemes (ສະບາຍດີ "sa bāi dī", ຂ້ອຍຊື່ "khööj syy ...") and breaks where its module meets ຍ
  (ໄດ້ຍິນ "dn", ນາຍົກ "nk"). The Vientiane IPA beside it is consistent and present on 98% of entries, so the card
  prints a fixed transcription of it: Paiboon-style letters (a doubled vowel is long; ɛ ɔ ʉ ə; final -i and -o for j
  and w; ch, ny, ng, v), and after each syllable its tone as the contour Wiktionary gives, in Chao tone letters (˧˥,
  ˩˧, ˧, ˥˨, ˧˩). Wiktionary writes an optional part in brackets — ˩(˧), a(ʔ˧˥) — and the brackets are dropped,
  the letters kept. Every syllable of every entry parsed when checked over the whole extraction (2026-11-15). A word with no IPA
  (ຍ້ອນ, ຄືກັນ) is not carded: `select.py` reports it.
- **NO LICENSABLE FREQUENCY LIST, SO WIKIPEDIA IS COUNTED** (`extract.py`). Every Lao run of the dump's article text
  is cut by `lo.Segmenter` against Wiktionary's headwords. **Only a run the dictionary covers whole is counted**:
  Wiktionary holds so few Lao words that a run with an unknown word is cut into its syllables, and a syllable that is
  also a headword took its count — counted over every run, the top sixty held ປະ, ສາ, ຕິ, ຕາ, ອາ, ກາ and more. Even so
  some single syllables still rank on borrowed counts; `select.EXCLUDE` names each with the card it produced.
  Wikipedia is encyclopedic, so the fill carries "province", "government", "republic", "prime minister"; the
  greetings and pronouns are dealt first (`LEAD_TOPICS`).
- **WIKTIONARY LACKS CORE WORDS.** No entry for ວ່າ "that; to say", ຍັງ "still, yet", ເອົາ "to take", ຢາກ "to want",
  ຄິດ "to think", ເຈັບ "to hurt", ກໍ "then", ນ້ອງ "younger sibling", ເອື້ອຍ "elder sister"; ຖ້າ "if" and ແລງ
  "evening" appear only as related words. ກັບ is there only as the verb "to return", not "with". Also missing from
  the A1 inventory: ເພາະ, ເທິງ, ກ້ອງ, ກາງຄືນ, ມື້ອື່ນ, ມື້ວານ, ທ່ຽງ, ຫຼິ້ນ. **They are left out, not glossed by hand**
  (the rule every set keeps); a re-run picks them up when Wiktionary gains them.
- **HOMOGRAPHS, AS IN THAI.** Wiktionary often lists the rare etymology first (ມັນ "yam" before "it", ປາ "to throw
  at" before "fish", ລົດ "to reduce" before "car", ສີ "to rub" before "colour", ເກືອ "to feed" before "salt"). The
  three tables in `build_deck.py` — `ETYMS`, `LEAD`, `PREFER` — and `DROP` fix each, every line with its reason, read
  off the A1 cards.
- **TWO COMPOUNDS COMPOSED** (`select.COMPOSE`): ພາສາລາວ and ພາສາອັງກິດ, romanised from their parts.

**Known, left.** 394 of A1's 500 words have no example sentence (Tatoeba's Lao is a twentieth of its Thai, and
Wiktionary gives few). The fill's 148 words are written, encyclopedic Lao. Some glosses are Wiktionary's terse
first sense. The tones are Vientiane's; other dialects differ.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — the later levels. After A1, Wiktionary has
roughly 1,800 usable Lao words left, much of it names, rare homographs and encyclopedic vocabulary, so Thai's sizes
(A2 750, B1 1,000, B2 1,500, C1 1,500) cannot be met from it. Size them before building: probably one A2 deck of
what remains usable, and stop there unless Wiktionary grows. Write the level's inventory into `inventory.py`, its
`TARGET` and `SCOPE` into `lao_level.py`, run, read every card. **Phase 3** — a phrases deck, if Wiktionary's Lao
phrases (five entries today) ever make one.

## 6. As built (2026-11-15): the alphabet and A1

`python3 .claude/lao/run.py [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` → `examples.py` →
`build_deck.py`, caching in `.claude/lao-cache/` (gitignored, ~135 MB); the Wikipedia dump is pinned to
`20261101`. `python3 .claude/lao/alphabet.py` writes the alphabet deck (reads `lex.json` for the example words'
romanisations). `node .claude/lao/check-lao.js` is the check. **A re-run is byte-identical** (verified for A1,
with and without `--re-extract`). A1: 500 notes, 352 from the inventory and 148 by frequency; 29 show a
classifier; sentences for 106. The alphabet: 79 notes — 27 consonants (class, name word, initial and final sound),
6 ligatures, 27 vowels and vowel forms on ◌, 4 tone marks and 2 signs, the 3 class rules, 10 digits; every sound
side unique (asserted). Two signs (◌໌, ໆ) have no Lao name in the sources, so their speaker reads the example word.
The shelf's hue is measured: `#426A43`, 15.1 from its nearest of 75 (the comment in `app.js` has the sweep).
