# The Polish language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Polish deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Turkish, Hindi, Russian TORFL …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Polish language collection."

**STATUS (2026-11-09): A1 is built** (`.claude/polish/`, §5). A2 to C2 and a phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any further deck this plan produces. The collection's first commit carried one line and one bump,
because it also changed the APP (the shelf's hue in `app.js`) — the Turkish and Hindi precedent.

## 1. Decisions taken without asking (2026-11-09), open to the owner

The request named no level, source or size, so the Turkish and Hindi defaults were followed; each is one
line to change.

1. **Levels: CEFR A1–C2**, one deck each, plus a phrases deck last. Poland's state certificate is issued at
   all six levels (the Act on the Polish language names A1, A2, B1, B2, C1 and C2), so unlike Turkish there
   is a C2 to scope.
2. **Word source: assembled** (the UKBI / TORFL / Hindi arrangement, §2): a hand-written topic inventory per
   level (`inventory.py`), topped up with the commonest remaining words by lemma frequency.
3. **Sizes, in notes: A1 600 · A2 750 · B1 1,000 · B2 1,200 · C1 1,200 · C2 1,200** (`pl_level.SIZE`). A1 is
   600 rather than the siblings' 500 because its topic inventory alone is 476 words, and 500 would have left
   almost no room for the commonest words of speech.
4. **Names: English** — the collection "Polish", decks "Polish A1" … in files `Polish-<LEVEL>.folio-deck.json`,
   which is all `build-lang-decks.js` needs to file and order them.
5. **No alphabet deck.** Polish is written in the Latin script; its nine extra letters and digraphs are a
   pronunciation lesson rather than a script to learn, and a speaker sits beside every headword and sentence.
   Easy to add (`.claude/hindi/alphabet.py` is the model) if wanted.

| deck | file | notes |
|---|---|---|
| Polish A1 — built | `Polish-A1.folio-deck.json` | 600 |
| Polish A2 | `Polish-A2.folio-deck.json` | 750 |
| Polish B1 | `Polish-B1.folio-deck.json` | 1,000 |
| Polish B2 | `Polish-B2.folio-deck.json` | 1,200 |
| Polish C1 | `Polish-C1.folio-deck.json` | 1,200 |
| Polish C2 | `Polish-C2.folio-deck.json` | 1,200 |
| Polish Phrases and Expressions | `Polish-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

## 2. Where the words come from — checked before anything was built

**Does an exam board publish a word list?** The State Commission for the Certification of Proficiency in
Polish as a Foreign Language (certyfikatpolski.pl) examines at all six levels. Its site refuses automated
requests (HTTP 403 from a cloud session, 2026-11-09), and searches for its *Standardy wymagań egzaminacyjnych*
found descriptions of topics and skills but **no vocabulary list** for any level. So, as for Indonesian,
Russian and Hindi, a level's scope is stated and its words are assembled, and the description says so in
those words: "no official word list was found … They are Folio's choice, not the Commission's."

**A1's scope** is the topic list the University of Zielona Góra's certification centre gives for the A1
exam (certyfikatpolski.uz.zgora.pl, "Poziom A1"): *człowiek, rodzina, życie codzienne, wolny czas,
mieszkanie, miejsca, środki transportu, kierunki, praca, szkoła, jedzenie, zakupy, pieniądze, zdrowie, pory
roku, pogoda, rośliny i zwierzęta — nazwy podstawowe*. `inventory.py` is written a topic at a time for those,
plus the categories a beginner needs whole (numbers, days, months, colours) and the closed classes (pronouns,
question words, prepositions, conjunctions). **A2 onwards needs its own topic list found first** — the same
centre's pages for A2 … C2 are the place to start; if none can be found, the CEFR descriptor for the band is
the fallback (the Hindi arrangement).

| input | use | licence |
|---|---|---|
| kaikki.org Polish extract (English Wiktionary), ~900 MB | meanings, part of speech, gender, aspect and partner, the inflection tables | CC BY-SA 4.0 |
| hermitdave/FrequencyWords `content/2018/pl/pl_full.txt` (OpenSubtitles 2018) | order and fill | CC BY-SA 4.0 |
| Tatoeba `per_language/pol` sentences + `pol-eng` links | three example sentences per word | CC BY 2.0 FR |

All three answered from a cloud session on 2026-11-09. `run.py` fetches them into the gitignored
`.claude/polish-cache/`.

## 3. The card — what Polish spends it on

The Goethe / CAPLE / Turkish shape: one note, two templates (Polish → English, English → Polish), fields
`Polish · Word · English · Forms · Examples`, `speechLang` `pl-PL`. The forms row is what a learner cannot
guess, **read from Wiktionary's table, never derived** — Polish stems alternate (`pies → psa`, `ręka → ręce`,
`iść → szedł`, `człowiek → ludzie`):

- **noun**: gender (masculine personal / animate / inanimate, feminine, neuter, plural only; `autobus` is
  "masculine animate or inanimate", as Wiktionary gives both), genitive, locative and instrumental singular,
  nominative and genitive plural — `pies`: masculine animate · psa · psie · psem · psy · psów;
- **verb**: aspect and its partner (`robić` imperfective · perfective `zrobić`; a verb of motion also names
  its determinate partner: `chodzić` · determinate `iść`), then `ja`, `on`, `oni` of the present — of the
  future for a perfective verb, which has no present — and the past of `on`;
- **adjective**: comparative and superlative where Wiktionary gives them (`dobry` → lepszy, najlepszy);
- **personal pronoun**: genitive, dative, accusative, instrumental, locative (`ja` → mnie, mnie, mnie, mną, mnie).
  A gendered pronoun (`ten`, `mój`), a numeral and an impersonal verb (`można`, `trzeba`) show no row.

A reflexive sense, which Wiktionary files under the base verb, is shown as "(się) …": `uczyć` "to teach",
"(się) to learn, to study"; the inventory therefore names `nazywać`, not `nazywać się`.

## 4. The findings (A1)

Each is a rule in the code with the case that forced it; grep the file for the word.

1. **Only the first table** (`extract.py`): many words carry a second, Middle Polish table (`kobieta`'s
   gives `kobietę` as a genitive). Middle and Old Polish senses are dropped at the source …
2. **… but not their parents** (`extract.py`, `pl.parent`): kaikki emits only leaf senses, and a modern
   meaning can exist only as the parent of an archaic leaf — `drzewo` "tree", `brzuch` "belly", `nos`
   "nose", `kuchnia` "kitchen", `gazeta` "newspaper" were all missing until the parent gloss was read.
3. **`i` ("and") is not in the dump** — English Wiktionary splits its largest pages across subpages and the
   extraction carries no Polish entry from them. Its four senses are copied, with the source and date, into
   `extract.py` `SUPPLIED`; nothing else is.
4. **An abbreviation's pointer is not a frequency claim** (`select.py`): `sie` is "abbreviation of sierpień",
   and its 87,050 are subtitles' `się` without the ogonek — August had come out ten times commoner than any
   other month. Only an inflection's pointer (`dziękuję` → `dziękować`) claims.
5. **Shadowing has three owners** (`select.py`): a pronoun's cell always shadows (`nim` "before", `im` "the
   more" are counted from `on`, `oni`); a word that is only an interjection or particle is shadowed by any
   table it sits in (`mu` "moo", `boże`, `jasne`, `musi`); anything else only by a commoner owner — gating
   every word lost `życie` and `rzecz`.
6. **An example is found only through cells no other word claims** (`examples.py` `forms_of`): `mama` had
   been illustrated by "Nie mam usprawiedliwienia" (mieć's `mam`), `ono` by a sentence whose `nie` was the
   negation, `lato` by `sto lat`, `wino` by `wina` "fault".
7. **A regional tag is a capitalised tag** (`pl.regional`): `mój` "husband" is Łowicz dialect with no
   `dialectal` tag.
8. **Which reading leads** is a short table with reasons (`build_deck.py` `LEAD`): `to`, `bez`, `zbyt`, `za`,
   `dość` and `stać` ("to stand", not `stać się` "to happen").
9. Wiktionary's own judgement stands elsewhere: `rodzic` is glossed "parents" (its singular "parent" is
   tagged colloquial), `brązowy` opens on "bronzen" before "brown", and the fill carries the subtitles'
   `zabić` and `broń` on frequency, as every subtitle-ordered deck on the shelf does.

## 5. How to build, and what to run

    python3 .claude/polish/run.py [--level a1] [--no-fetch]
    node .claude/polish/check-polish.js
    node .claude/build-lang-decks.js

A re-run reproduces the shipped deck byte for byte (checked 2026-11-09). A level is built on the shipped
decks below it (`pl_level.taught_below`). **Every card of A1 was read**; read every card of each new level
too, since the faults above were all found that way. For A2: find the scope (§2), add `SCOPE["a2"]` in
`pl_level.py` and `A2` in `inventory.py`, run, read, fix, re-run.

The shelf: the `LANGS` row in `.claude/build-lang-decks.js` (`l1: 40`, Ethnologue 27th ed., 2021, via
Wikipedia's infobox, read 2026-11-09) and the hue `lang-polish` `#318526` in `app.js` `COLL_THEME`
(measured: 18.6 from its nearest neighbour among 46 hues).
