# The Irish language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Irish deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Hindi, Russian TORFL, Indonesian UKBI …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add an Irish language collection."

**STATUS (2026-11-09): A1 is built** (`.claude/irish/`, §6). A2 to C1 and the phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one (folded into the day's Hindi
line) and a bump, because it also changed the APP (the shelf's hue in `app.js`) — the Hindi precedent.

## 1. The decisions (2026-11-09, taken from the Hindi set's, which the owner made the same day)

No questions were put to the owner; each choice copies the Hindi decision it parallels, and any can be
reversed by a later request.

1. **Word source: CEFR A1–C1, assembled** (the Hindi / UKBI / TORFL arrangement). Irish HAS a CEFR
   examination — Teastas Eorpach na Gaeilge (TEG, Maynooth University) — but it publishes syllabuses of
   topics, functions and grammar, not a graded word list, so each level is a hand-written topic inventory
   (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up with the commonest remaining
   lemmas. The deck's description names TEG and says the deck is not its vocabulary. Sizes, the Hindi set's:
   **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**, then a phrases deck.
2. **No script deck** (Irish is written in the Latin alphabet). In its place every card carries **Wiktionary's
   IPA, labelled by dialect** — see §3.
3. **This session: plan + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Irish A1 Beginner — built | `Irish-A1.folio-deck.json` | 500 |
| Irish A2 Elementary | `Irish-A2.folio-deck.json` | 750 |
| Irish B1 Intermediate | `Irish-B1.folio-deck.json` | 1,000 |
| Irish B2 Upper Intermediate | `Irish-B2.folio-deck.json` | 1,500 |
| Irish C1 Advanced | `Irish-C1.folio-deck.json` | 1,500 |
| Irish Phrases and Expressions | `Irish-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms, IPA | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Irish.jsonl`, 112 MB) | CC BY-SA 4.0 |
| frequency (written) | Irish Dependency Treebank, UD_Irish-IDT (train + dev + test, ~116,000 tokens, gold lemmas) | CC BY-SA 3.0 |
| frequency (everyday) and example sentences | Tatoeba `gle` exports (3,040 Irish sentences, 2,451 with an English translation) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| `l1` in `LANGS` | 0.07 million: the 2022 census's 71,968 daily speakers outside education, via Wikipedia's infobox (which gives L1 as "unknown"), read 2026-11-09 | — |

**There is no subtitle frequency list for Irish** (hermitdave/FrequencyWords has no `ga`), which is what
every other assembled set used — hence the two corpora in §4.

## 3. The card

One note, two templates (Irish → English, English → Irish), `speechLang: 'ga-IE'`. Fields: `Irish` (the
headword), `IPA`, `Word` (what the speaker reads), `English` (meanings by part of speech, a noun's gender in
its label), `Forms` (a noun's genitive, plural and form with the article — `an bhean`; an adjective's
comparative and plural; a verb's past, verbal noun and future), `Table` (behind a fold: a noun with and
without the article plus its lenited and eclipsed forms; a regular verb's past, present, future and
conditional by person; a preposition's forms with each pronoun — `agam`, `agat`, `aige` …), `Examples` (up to
three Tatoeba sentences, the word in bold, with a speaker). Verbs are cited by their imperative (`déan`), as
Irish dictionaries cite them. The type's CSS is `.claude/irish/card.css` (the Hindi type's, with `.uc-ipa` /
`.uc-dial` in place of the romanisation).

**THE IPA IS LABELLED BY DIALECT, NEVER CHOSEN.** The Official Standard (An Caighdeán Oifigiúil) fixes
spelling and grammar, not pronunciation; Wiktionary gives Munster, Connacht and Ulster separately, so the card
prints up to three transcriptions with their dialects rather than calling one of them Irish. A transcription
carrying prose (`/ɡə/(as if spelled go; …`) is dropped (`IPA_OK`).

## 4. What Irish needs that no earlier set did — the findings

- **THE MUTATIONS** (`ga.plain`): a corpus writes `an bhean`, `i dteach`, `ár n-athair`, `na hoíche`, `an
  t-uisce`, `an tsráid`, `d'ith`. Every match undoes the mutation first, and only where it IS one: `n`/`t`
  before a vowel without a hyphen only before a capital (`i nÉirinn`) — undone in lower case, `tuigeann` had
  become `t` + `uigeann` and made `uige` "gauze" an A1 word.
- **TWO FREQUENCIES, SUMMED PER MILLION.** The treebank carries hand-checked lemmas (`tá`, `bhí`, `raibh` are
  all `bí`) but is legislation, news and prose; alone it put `ballstát` "member state", `airteagal` and
  `foráil` into A1. So Tatoeba's conversational sentences are counted too, each word credited — undone of its
  mutation — to every lemma it could be, **in proportion to their treebank counts plus one** (the TORFL
  rule): split evenly, `rinne` made `rinn` "point" an A1 word, `aige` "at him" `uige`, `leo` "with them" `leo`
  "slush", `bhfuair` "got" `fuaigh` "sew". **And the fill takes only a lemma Tatoeba uses at least twice.**
  A phrase is dealt by its rarest word's count, halved (the Hindi rule); a capital inside a sentence is a
  name and counts nothing (Tatoeba's `Tom` is not `tom` "bush").
- **A TABLE'S FORM MUST BEGIN WITH THE LEMMA'S LETTER** (mutation undone) and never be a particle: kaikki's
  cells carry stray particles (`a hiatraigineach` gave "iatrogenic" the form `a`, and a top-30 rank). The
  suppletive forms (`tá`, `rinne`, `chuaigh`, `mná`) reach their lemma through their own form-of entries.
- **THE IRREGULAR VERBS' TABLES ARE GARBLED IN THE EXTRACTION** — `déan`'s is a dialect table (`ním`) with no
  past, `téigh`'s past reads `theachaigh`, and `faigh`, `abair`, `tabhair`, `ith` have none. A table is shown
  only when it is one clean table with a past (`table_ok`); the PAST on the forms line comes from
  Wiktionary's own entry for it (`rinne` "past analytic independent of déan", `chuaigh`, `dúirt`, `fuair`,
  `thug`, `d'ith`), the independent form preferred. So `déan` shows past, verbal noun and future but no table.
- **A GLOSS THAT ONLY NAMES AN INFLECTION IS A POINTER** however tagged ("first-person singular present
  indicative of tuig"); they had made `tuigim`, `ithim`, `léinn` cards (`names_inflection`).
- **A VERBAL NOUN OF A VERB ON THE LEVEL IS NOT A CARD** (`déanamh`, `fáil`, `dul`, `ceannach`): the verb's
  card prints it. `ceannach(t)` is two spellings.
- **ONE ETYMOLOGY PER CARD** (`ETYMS`: `sí` "she" not "fairy mound", `inis` "tell" not "island", `má` "if" not
  "plain", with `an`, `do`, `ní`, `sé`, `trí`, `céad`, `glan`, `dún`, `míle` keeping two everyday readings), a
  particle reading after the word's others (`ag` opens on "at"), and **`LEAD`: an everyday gloss Wiktionary
  already lists, moved first** (`ríomhaire` "computer" before "counter", `airgead` "money" before "silver",
  `teanga` "language", `daor` "expensive"); a lead the word no longer has stops the build.
- Hand exclusions from the fill, each with its reason, in `select.EXCLUDE` (`fuil` is `an bhfuil`, `bith` is
  `ar bith`, `féidir` is `is féidir` …).

**Known, left.** **Wiktionary's extract has no entry for the preposition `i` "in"**, so A1 lacks it (reported
and dropped, never written by hand), as it lacks `Dia is Muire duit` and `go luath`. `taitin` is out of the
inventory: wanted for "I like it", but its only gloss is "to shine". Tatoeba's Irish sentences carry some
errors of their own (`an bhean sin` for `na mná sin`, `Ni` for `Ní`), shown as the source has them. 45 of A1's
500 words have no sentence, 21 no IPA.

## 5. Phases

**Phase 1 (done)** — the pipeline, A1. **Phase 2** — A2 to C1, one level per session: write the level's
inventory into `inventory.py` and its `SCOPE` into `irish_level.py`, run, read every card. Beyond B1 the
Tatoeba floor (two uses) will starve the fill — 3,040 sentences are few — and the rule will need revisiting
before B2. **Phase 3** — the phrases deck. **Phase 4** — a combined file, gitignored.

## 6. As built (2026-11-09): A1

`python3 .claude/irish/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py`
→ `examples.py` → `build_deck.py`, caching in `.claude/irish-cache/` (gitignored, ~130 MB).
`node .claude/irish/check-irish.js` is the check. **A re-run is byte-identical** (verified). A1: 500 notes,
281 from the inventory and 219 by frequency; three sentences for 346, none for 45; IPA on 479; a table on 378.
The shelf's hue is measured: `#2A8424`, ΔE 19.5 from its nearest of 46 (Portuguese).
