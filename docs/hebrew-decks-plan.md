# The Hebrew language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Hebrew deck in `decks/`.** It is the plan for the
Hebrew set, built the way the Persian set was (`docs/persian-decks-plan.md`); `docs/lang-decks.md` is the record
of how the others were built, and every rule there applies here unless this file says otherwise. Asked for on
2026-11-12: "Add a Hebrew language collection."

**STATUS (2026-11-12): the alphabet deck and A1 are built** (`.claude/hebrew/`). A2 to C1 are planned, not built.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump** for
any deck this plan produces after the first. The first commit carried one changelog item and one bump, because it
also changed the APP (the shelf's hue in `app.js`).

## 1. Decisions

The request named no word source, script deck or romanisation, so the Hindi and Persian answers were carried over
rather than asked again:

1. **Word source: CEFR A1–C1, assembled.** No exam board publishes a graded Hebrew list (the ulpan levels Aleph to
   Hey and the universities' proficiency tests publish none), so a level is a hand-written topic inventory
   (`inventory.py`) scoped to the CEFR global descriptor, topped up with the commonest remaining lemmas. Each deck's
   description says so. Sizes: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500**.
2. **An alphabet deck, first** (`levelRank`'s "Alphabet" rule), with the vowel points.
3. **Every word in both spellings**: the headword UNPOINTED in the full spelling, as Israelis write it and as a
   reader meets it, and beneath it the POINTED form, which says how it is said; then Wiktionary's romanisation with
   the stress marked (shalóm, katáv).
4. **The language taught is modern Israeli Hebrew.**

| deck | file | notes |
|---|---|---|
| Hebrew Alphabet — built | `Hebrew-Alphabet.folio-deck.json` | 45 |
| Hebrew A1 Beginner — built | `Hebrew-A1.folio-deck.json` | 500 |
| Hebrew A2 Elementary | `Hebrew-A2.folio-deck.json` | 750 |
| Hebrew B1 Intermediate | `Hebrew-B1.folio-deck.json` | 1,000 |
| Hebrew B2 Upper Intermediate | `Hebrew-B2.folio-deck.json` | 1,500 |
| Hebrew C1 Advanced | `Hebrew-C1.folio-deck.json` | 1,500 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, forms, pointing, romanisation | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Hebrew.jsonl`, 60 MB, 18,182 entries) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `he_full.txt` | CC BY-SA 4.0 |
| example sentences | Tatoeba `heb` exports, 173,372 Hebrew–English pairs | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 5 million L1, 9 million in all (Ethnologue 2018, via Wikipedia's infobox, read 2026-11-12) | — |

## 3. The card

One note, two templates (Hebrew → English, English → Hebrew), `speechLang: 'he-IL'`. Fields: `Hebrew` (the
unpointed headword, `dir="rtl"`), `Pointed` (the pointed form, empty when it would repeat the headword), `Roman`,
`Word` (what the speaker reads, the unpointed word), `English` (meanings by part of speech, a noun's gender with
it), `Forms` (a noun's plural; a verb's binyan, infinitive, present and future; an adjective's feminine and
plurals), `Table` (behind a fold: a verb's past, present, future and imperative by person; a noun's definite,
construct and possessive forms; a preposition's forms with a pronoun — `שלי`, `איתך`), `Examples` (up to three
Tatoeba sentences, `dir="rtl"`, the word in bold, with a speaker). Every form is shown in the full spelling with its
pointed form beside it. CSS: `.claude/hebrew/card.css` (Persian's, `.uc-he` for an isolated right-to-left run,
`.uc-pt` for the pointed line, and a form kept whole on its line). **A verb is filed under its past "he" form**
(`כתב` katáv), as Wiktionary and every Hebrew dictionary file it, with the infinitive (`לכתוב`) beside it.

## 4. What Hebrew needs that no earlier set did — the findings

- **TWO SPELLINGS OF EVERY FORM** (`he.py`). Wiktionary's forms are POINTED, in the classical spelling the points
  belong to (`דִּבַּרְתִּי`, `לִכְתֹּב`); stripped of the points that is `דברתי`, `לכתב`, which is not how a subtitle,
  a newspaper or Tatoeba spells them (`דיברתי`, `לכתוב`). The full spelling is read from the unpointed row
  Wiktionary writes before a pointed one with the same tags, else from the page the form links to (accepted only
  when it differs from the stripped form by vowel letters alone), else the stripped form (`extract.plene`).
- **ONE SPELLING, SEVERAL WORDS — A CARD TEACHES ONE POINTED WORD** (`choose.py`). `ספר` is sefer "book", safar
  "counted", sapar "barber"; `שם` is shem "name", sham "there", sam "put". Entries with the same pointed form AND
  the same etymology are one word (`שָׁלוֹם` peace / hello); the same pointed form from another origin is not
  (`כִּי` "because" is not `כִּי` "vulture"). Which word a card teaches: the inventory's pointed form (`שם=שָׁם`) or
  part of speech (`יכול:verb`), else the hand list `PICK`, else the word whose OWN forms are commonest — an entry's
  `score` is what the surfaces only it holds earn, and a closed-class word, which has no forms, is scored by its
  spelling's count, so `אתה` is "you" and not the verb "come" whose table holds `שאתה`. A level may teach two words
  of one spelling as two cards (A1: `שם` three times, `פה`, `ישן`), so the uniqueness check is on Word + Pointed.
- **THE PREFIXES.** The subtitles join ו ש ה ב כ ל מ to the word after them (`ובבית`, `שהוא`). A counted surface
  that is a form of some word is that word's; only a surface that is no form of anything is read behind a prefix
  chain (`he.strips`), and a closed-class word takes no prefix reading. The sentences follow the same rule.
- **ROMANISATION.** Most entries give the modern reading; some give a Biblical or scholarly one (`ʕālā`, `qɔm`,
  `raʕăyōn`). The modern one is preferred, scholarly letters are written the modern way (q → k, ḥ → kh, the
  qamats ɔ → a), `ch` → `kh` and `tz` → `ts` so cards agree — except in a word with `צ׳`, whose ch is church's —
  and the three left are `build_deck.ROMAN_BY_HAND`. `check-hebrew.js` fails on any scholarly letter.
- **Form-of entries a beginner learns as words** (`extract.FORM_OK`: `זאת`, `אלה`) are kept and glossed by hand.
- **The fill's exclusions** (`select.EXCLUDE`, each with its reason) are mostly counts that belong to a commoner
  word sharing the spelling (`ביית` is `לבית`, `זימן` is `מזמן`, `לדעת` is the infinitive of `ידע`) and names
  (`דן`, `שוהם`); the subtitles' killing and shooting are left out, as Persian's are.
- **Gloss overrides** (`build_deck.GLOSS`, `LEAD`), each with its reason: `את` the object marker, `אותו`/`אותה` the
  object pronouns, `היה` "to be", `גמר` (an untagged vulgar sense), `פגע`, `אכפת`.

**Known, left.** Wiktionary's glosses for some function words are long (`יש`, `גם`). A few plurals are Wiktionary's
less common one (`יד`: ידות "handles", not the dual ידיים). The forms tables carry no romanisation — the pointed
form is the guide. One A1 word (`שדה תעופה`) has no Tatoeba sentence.

## 5. Phases

**Phase 1 (done 2026-11-12)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: the
level's inventory into `inventory.py`, its `SCOPE` into `hebrew_level.py`, run, read every card. **Phase 3** — a
phrases deck, if asked for.

## 6. As built (2026-11-12)

`python3 .claude/hebrew/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/hebrew-cache/` (gitignored, ~220 MB). `python3
.claude/hebrew/alphabet.py` writes the alphabet (reads `lex.json`). `node .claude/hebrew/check-hebrew.js` is the
check; `node .claude/hebrew/render-hebrew.js a1|alphabet [dir]` imports a deck through the Studio and asserts the
headword and a sentence are laid out right to left and the points survive. **A re-run is byte-identical**
(verified for both decks). A1: 500 notes, 310 from the inventory and 190 by frequency; three sentences for 499.
The alphabet: 45 notes — the 22 letters with בּ/ב, כּ/כ, פּ/פ and שׁ/שׂ a sound to a card (26), the five final
forms, ג׳ ז׳ צ׳, ten vowel points and the dagesh; letters said alike (t: ט ת, k: כּ ק, v: ב ו, kh: ח כ, s: ס שׂ,
silent: א ע) are told apart on the sound side by the word they ask for, and every sound side is unique (asserted).
The hue is measured, `#5E6EC0` (see the `lang-hebrew` comment in `app.js`).
