# The Persian (Farsi) language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Persian deck in `decks/`.** It is the plan for a
twelfth language set, built the way the Hindi set was (`docs/hindi-decks-plan.md`); `docs/lang-decks.md` is the
record of how the others were built, and every rule there applies here unless this file says otherwise. Asked
for on 2026-11-09: "Add a Farsi language collection."

**STATUS (2026-11-12): the alphabet deck, A1 and A2 are built** (`.claude/persian/`). B1 to C1 and the phrases
deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump** for
any deck this plan produces. The first commit carried one changelog item (folded into Hindi's line of the same
day) and one bump, because it also changed the APP (the shelf's hue in `app.js`).

## 1. Decisions

The request named no word source, script deck or romanisation, so Hindi's answers of the same day were carried
over rather than asked again:

1. **Word source: CEFR A1–C1, assembled.** No exam board publishes a graded Persian list (Iran's AMFA test
   publishes none), so a level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global
   descriptor, topped up with the commonest remaining lemmas. Each deck's description says so. Sizes: **A1 500 ·
   A2 750 · B1 1,000 · B2 1,500 · C1 1,500**, then a phrases deck.
2. **An alphabet deck, first** (`levelRank`'s "Alphabet" rule).
3. **Romanisation on every word card** — Wiktionary's IRANIAN one (ketâb, xâne), since the script writes no
   short vowels.
4. **The language taught is standard written Iranian Persian**; the Tehrani spoken form is shown beside a word
   where Wiktionary gives one (خانه, spoken خونه).
5. **The collection is "Persian (Farsi)"**, so a reader looking for either name finds it.

| deck | file | notes |
|---|---|---|
| Persian Alphabet — built | `Persian-Alphabet.folio-deck.json` | 39 |
| Persian A1 Beginner — built | `Persian-A1.folio-deck.json` | 500 |
| Persian A2 Elementary — built | `Persian-A2.folio-deck.json` | 750 |
| Persian B1 Intermediate | `Persian-B1.folio-deck.json` | 1,000 |
| Persian B2 Upper Intermediate | `Persian-B2.folio-deck.json` | 1,500 |
| Persian C1 Advanced | `Persian-C1.folio-deck.json` | 1,500 |
| Persian Phrases and Expressions | `Persian-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, forms, romanisation | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Persian.jsonl`, 96 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `fa_full.txt` (445,744 forms) | CC BY-SA 4.0 |
| example sentences | Tatoeba `pes` (Iranian Persian) exports, 8,265 Persian–English pairs | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 91 million (Farsi + Dari + Tajik), Ethnologue 28 via Wikipedia's infobox, read 2026-11-09 | — |

## 3. The card

One note, two templates (Persian → English, English → Persian), `speechLang: 'fa-IR'`. Fields: `Persian` (the
headword, `dir="rtl"`), `Roman`, `Word` (what the speaker reads), `English` (meanings by part of speech),
`Forms` (a noun's plurals — the Arabic plural beside the Persian where Wiktionary gives both; a verb's present
and past stems; an adjective's comparative and superlative; the spoken form), `Table` (behind a fold: a verb's
present, past, future, subjunctive and imperative by person; a noun's plural, object, ezafe, indefinite and
possessive forms; an adjective's "… is" forms), `Examples` (up to three Tatoeba sentences, `dir="rtl"`, the word
in bold, with a speaker). CSS: `.claude/persian/card.css` (Hindi's, plus `.uc-fa` for an isolated right-to-left
run). Every Persian run carries `dir="rtl"` in the field itself (`dir` is allowed on any element by the deck
sanitizer), so a line mixing it with a Latin label keeps each in its own direction.

## 4. What Persian needs that no earlier set did — the findings

- **THE FOLD** (`fa.fold`): the subtitles write the Arabic `ي` `ك` (`اين`), the short-vowel marks and hamzas are
  optional, and the joiner (U+200C) is written, dropped or a space. All three are folded for MATCHING. **The madda
  is not**: a first fold that dropped it merged `آب` "water" with `اب` and the card printed one as the other.
- **THE JOINER PUT BACK** (`fa.zwnj`): Wiktionary's generated tables drop it (`میروم` for `می‌روم`, `رفتهام`,
  `خانهها`), a misspelling a learner would copy. The romanisation keeps the boundary as a hyphen (`mí-ravam`),
  so the joiner goes back exactly where it says: after `می` / `نمی`, before the stem's plural `ها`, between a
  final silent `ه` and an ending; `check-persian.js` fails on a table row whose romanisation has `mi-` and whose
  form has no joiner. A table cell holding two spellings (`خانهمان، خانهمون (xâné-(y)emân, …)`) is split at its
  FIRST bracket, the romanisation having one of its own.
- **THE SPOKEN FORMS COUNT FOR THE WRITTEN WORD.** The subtitles are spoken Tehrani (`خونه`, `یه`, `اون`, `رو`);
  Wiktionary's `alternative` + `colloquial` forms and "Spoken form of X" entries become claims of X. Only those
  tagged Tehrani / Iran are shown on a card (`ایجه` is Kabuli, `حالو` Shirazi).
- **CLASSICAL AND DARI READINGS.** Wiktionary gives `kitāb` / `ketâb`; the Iranian one (listed last) is used, and a
  lone Classical reading has its long vowels written the Iranian way (`īn` → `in`), which for long vowels is
  exact. Some verbs' only table is Classical / Dari (`mē-aftam`, `dar hāl-i aftādan astam`): that table is NOT
  shown. A table's stress marks are dropped so the card spells one way throughout. The extraction's stray
  header row (`باش` tagged a past stem, no romanisation) is skipped.
- **A bare stem claims no frequency** (`رو` is both spoken `را` and `رفتن`'s present stem).
- **The fill's exclusions** (`select.EXCLUDE`, each with its reason) are mostly the subtitles' tokenisation: `می`,
  `ها`, `تر`, `دار` written apart; spoken forms (`منو`, `بهت`, `واسه`, `همش`); `اره` for `آره`.
- **Gloss overrides** (`build_deck.GLOSS`, `LEAD`, `ETYMS`), each with its reason: `را`, `باید`, `الان`, `نفر`, `کی`.

**Known, left.** The `که`, `به`, `و` cards carry Wiktionary's grammatical glosses, long but accurate. The fill
carries the subtitles' crime-drama words (`سلاح`, `شلیک`) on frequency, as every subtitle-ordered deck does.
14 of A1's 500 words have no Tatoeba sentence. `بودن`'s table is not shown (Wiktionary's has no romanised cells).

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 (done 2026-11-12) to C1, one level per session: the level's
inventory into `inventory.py`, its `SCOPE` into `persian_level.py`, run, read every card. **Phase 3** — phrases.

## 6. As built (2026-11-09)

`python3 .claude/persian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/persian-cache/` (gitignored, ~230 MB). `python3
.claude/persian/alphabet.py` writes the alphabet (reads `lex.json`). `node .claude/persian/check-persian.js` is
the check. **A re-run is byte-identical** (verified for both decks). A1: 500 notes, 283 from the inventory and
217 by frequency; three sentences for 461, none for 14. The alphabet: 39 notes — the 32 letters, each in its four
shapes (two for the seven that never join forward), آ, the three short-vowel marks, tašdid, hamze and tanvin;
letters that share a sound (s: س ث ص, z: ز ذ ض ظ, t: ت ط, h: ه ح, ġ: غ ق) are told apart on the sound side by
the word they ask for, and every sound side is unique (asserted). The hue is measured: first `#2A8424`, which a
parallel session's language also took before this merged, so it was re-swept against the 61 hues on main:
`#008763`, 15.7 from its nearest.

## 7. A2 as built (2026-11-12)

Asked for on 2026-11-12: "Add Persian A2." `python3 .claude/persian/run.py --level a2`. **750 notes / 1,500
cards: 255 from the inventory (`inventory.A2`, Hindi's A2 topics rewritten for Iran), 495 by frequency**; three
sentences for 501, none for 73. A re-run is byte-identical, and A1 rebuilt on the day's sources is unchanged.
What A2 needed:

- **THE MONTHS.** Wiktionary files the twelve solar months as proper names (`pos: name`), which the extraction
  dropped, beside OTHER name entries of the same spelling that gloss them as Gregorian months (`فروردین`
  "January" — wrong for Iran, where Farvardin begins on 21 March). `extract.MONTH` keeps only the sense "X (the
  Nth solar month of the Persian calendar)", as a noun. Five month names are homographs (`تیر` arrow, `مهر`
  kindness / seal / dowry, `دی` yester, `آذر` fire, `بهمن` avalanche): `ETYMS` / `LEAD` put the month on the card.
  Consequence: `تیر` "arrow, bullet" is now taught as the month only, and a later level will not teach it again.
- **Seven inventory words are not in Wiktionary** and were dropped, not glossed by hand: خواهرزاده, برادرزاده,
  ساعت مچی, پستخانه (اداره پست taught instead), دوجین, سرماخوردگی (سرما instead), هر روز; `گوجه` is "plum" there,
  so the inventory asks for `گوجه‌فرنگی` "tomato".
- **More homographs** (`ETYMS`): ماده mâdde "matter" not mâde "female", چک "cheque", موزه "museum" not "boot",
  شانه "shoulder" not "comb", سیر "garlic", کمی "a little", روزی "someday", پست "post", علیه "against".
- **Romanisations the extraction misses** (`ROMAN_BY_HAND`), each read off Wiktionary's own headword line:
  نوع now', دی dey, پست post, آرزو ârezu. Two pointer glosses overridden from the entry's own first glosses
  (`دردسر`, `موش`).
- **The fill's exclusions grew** (`select.EXCLUDE`, 55 more, each with its reason): at A2's depth the subtitles'
  ranking is full of English names and letters spelt in Persian (جک, مری, بن, اس, اف), a word's count belonging
  to a form of another (`پای` پا + ی, `توش`, `کارا`), literary verbs whose stems are shared (`یارستن`, `تنیدن`),
  and two vulgar words. The description now names the learner by level (`WHO`, Hindi's wording).
