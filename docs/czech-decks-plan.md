# The Czech language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Czech deck in `decks/`.** It is the plan for the
Czech set, in the shape of the Polish one (`docs/polish-decks-plan.md`), whose pipeline it adapts;
`docs/lang-decks.md` is the record of how the shelf was built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-16: "Add a Czech language collection."

**STATUS (2026-11-16): A1, A2 and B1 are built** (`.claude/czech/`, §5). B2, C1 and a phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any further deck this plan produces. The collection's first commit carried one line and one bump, because
it also changed the APP (the shelf's hue in `app.js`) — the Turkish, Hindi and Polish precedent.

## 1. Decisions taken without asking (2026-11-16), open to the owner

The request named no level, source or size; each is one line to change.

1. **A1 and A2 come from an OFFICIAL list** — unlike Polish, Hindi or Turkish, whose exam boards publish none.
   The Czech exam for permanent residence (run by NPI ČR, the National Pedagogical Institute) publishes its
   whole A1–A2 lexicon (§2), so those two levels are the Goethe kind: nothing to select, the list resolved
   against Wiktionary and ordered by frequency. Sizes are what the list yields (A1 1,213, A2 1,161 notes).
2. **B1 to C2 have no list** (§2), so they are assembled the Polish way: a topic inventory plus frequency fill.
   **B1 is built** (§4b), 1,000 notes (Polish B1's size, `cs_level.SIZE`), its topics the Threshold Level's.
3. **Names: English** — the collection "Czech", decks "Czech A1", "Czech A2" in `Czech-<LEVEL>.folio-deck.json`.
4. **No alphabet deck.** Czech is written in the Latin script; its háček and čárka letters are a pronunciation
   lesson, and a speaker sits beside every headword and sentence (Polish's decision).
5. **A small A1 supplement of grammar words** (§3) — the one place a level is not the list alone.

| deck | file | notes |
|---|---|---|
| Czech A1 — built | `Czech-A1.folio-deck.json` | 1,213 (1,162 from the list, 51 supplement) |
| Czech A2 — built | `Czech-A2.folio-deck.json` | 1,161 |
| Czech B1 — built | `Czech-B1.folio-deck.json` | 1,000 (294 inventory, 706 frequency) |

## 2. Where the words come from — checked before anything was built

**The official list.** NPI ČR's site for the permanent-residence exam
(https://cestina-pro-cizince.cz/trvaly-pobyt/) publishes the *Soupis lexikálních jednotek* — the appendix to its
*Referenční popis češtiny pro účely zkoušky z českého jazyka pro trvalý pobyt v ČR – úrovně A1, A2* — as a search
tool. Its AJAX endpoint answers a level and a type with the whole table in one page (`soupis.py`): A1 1,205 words,
54 phrases (`fráze`), 59 collocations (`sousloví`), 12 patterns (`vazba`); A2 1,370, 40, 94 and 21. Each row has
its level, part of speech, gender, number and aspect. **Only the entries and their columns are taken** (the
Goethe line): meanings come from Wiktionary, sentences from Tatoeba, and the deck's description says so.

**The list's notation** (resolved in `select.py`): a parenthesis is the sense meant (`jazyk (část těla)`,
`jazyk (řeč)` — two rows, one card); a slash is alternatives (`kuchyň/kuchyně`) or endings (`nerad/a/i`); a
reflexive verb carries its clitic (`bát se`, `dát si`); a row with a blank, `+`, `X`, a comma, or a slash inside
a multi-word row (`neboj/te se`) is a pattern and is not a card, nor is any `vazba`.

**Beyond A2** (checked 2026-11-16, for B1): NPI ČR's citizenship exam is set at B1, but its site publishes a
candidates' manual, a model test and a civics glossary (*Výkladový slovník k testovým úlohám z českých reálií*,
2016 — Czech institutions and history, not a language level's words), and no word list; Charles University's
CCE pages give no list either. So **B1's scope is the fourteen themes of the Council of Europe's *Threshold
Level*** (van Ek and Trim, 1990), the specification the CEFR's B1 descends from (`inventory.py`, `cs_level.SCOPE`).

| input | use | licence |
|---|---|---|
| NPI ČR, Soupis lexikálních jednotek A1, A2 | the words of A1 and A2 (headwords only) | public exam scope |
| kaikki.org Czech extract (English Wiktionary), ~250 MB | meanings, part of speech, gender, aspect and partner, the inflection tables | CC BY-SA 4.0 |
| hermitdave/FrequencyWords `content/2018/cs/cs_full.txt` (OpenSubtitles 2018) | order; the A1 supplement | CC BY-SA 4.0 |
| Tatoeba `per_language/ces` sentences + `ces-eng` links | three example sentences per word | CC BY 2.0 FR |

All answered from a cloud session on 2026-11-16. `run.py` fetches them into the gitignored `.claude/czech-cache/`.

## 3. The two additions to the list, both stated in the description

- **The A1 supplement** (`select.py` `SUPPLEMENT_N`, `WHOLE`): the list is the lexicon of the reference
  description's thematic chapters; its grammar chapters carry the personal and possessive pronouns, most
  prepositions and several numbers — `ty`, `on`, `můj`, `pro` are on neither level's list. A1 adds the 45
  commonest closed-class words (every live entry a pronoun, determiner, preposition, conjunction, particle or
  numeral) on neither list, plus the sets a beginner needs whole (`já` … `ony`, the possessives, one to ten).
  A word the list puts at A2 (`s`, `že`, `k`, `o`) stays at A2.
- **The verb of a collocation**: `dělat` "to do" is on neither list as a word (A1 names it only in `dělat
  sport`). A multi-word row that is not a card and opens with a verb the list does not otherwise name teaches
  that verb (A1: `dělat`, `označit`; A2: `povídat`).

## 4. The card, and the findings

The Polish card: one note, two templates, fields `Czech · Word · English · Forms · Examples`, `speechLang`
`cs-CZ`; nouns show gender, genitive, locative and instrumental singular, nominative and genitive plural; verbs
their aspect and partner, `já`, `on`, `oni` and the past; adjectives a comparative and superlative; personal
pronouns their cases. Each finding is a rule in the code with the case that forced it; grep for the word.

1. **Every table, not the first** (`extract.py`): a Czech conjugation is several boxes, each opened by a
   `table-tags` row; Polish's cut at the second lost every present tense.
2. **A table of another verb** (`extract.py` `BAD_TABLES`): eleven pages pass the wrong stem to the template
   (`sponzorovat`'s table is jmenovat's), which stole `jmenovat se`'s sentences and count. Dropped.
3. **A qualified gender is not a register** (`extract.py`): `den` is headed `m-in,m-an<l:archaic,or,literary>`
   and kaikki copied "archaic, literary" onto every sense — "day" was refused.
4. **`i` is not in the dump** (the Polish mammoth-page finding): its two senses are in `extract.py` `SUPPLIED`.
5. **Pointers** (`cs.target`): `začínat` "imperfective form of začít" and `brzo` "alternative form of brzy" take
   their partner's meaning under their own headword; `děti` "plural of dítě" becomes the lemma's card; `to`'s
   meaning is the English after the colon. A list adjective that is only a comparative (`starší`) is the lemma's
   card (`select.py`).
6. **Colloquial list words are taught, marked** (`cs.COLLOQUIAL`): `kafe`, `tamhle`, `benzinka` — "(colloquial)".
7. **The list's part of speech narrows the entries** (`select.py` `POS`): `moc` "very" lost "power", `jak`
   "how" lost "yak".
8. **Reflexives** (`build_deck.py`): `bát se` reads bát's senses tagged reflexive, unmarked; a base verb marks
   them "(se/si)" (the tag does not say which clitic). `vyčistit si (zuby)` reads the other senses
   (`REFLEXIVE_BASE`). Where Wiktionary has no reflexive sense the card shows all (reported); where that would
   teach the wrong meaning the row is excluded (`select.py` `EXCLUDE`: `objednat se`, `scházet se`, `zapsat se`,
   `zapisovat se`; also `přestoupit`, `lux`).
9. **A comparative only where it is in use** (`build_deck.py` `adj_row`): Wiktionary prints `prvnější`,
   `poslednější`, `celejší`; one absent from the subtitle list's 80,000 spellings is left off.
10. **Frequency** (`select.py`): `oni` "they" is also a cell of literary `onen`, which took its count until a
    pronoun's own spelling was kept as its own; a word whose count went to another (`všechno` → všechen) is
    ordered by its own spelling's rows.
11. Spelling variants the rules allow (`benzin`, `vitamin`, `balon`, `vagon`) read the `-í-`/`-ó-` entry
    Wiktionary has. Not in the dump: abbreviations, `Vánoce` and `Velikonoce` (proper nouns), negated verbs
    (`nesmět`), and most of the list's multi-word rows — reported by `select.py`.

Every card of A1 and A2 was read (2026-11-16).

## 4b. The findings (B1, 2026-11-16)

1. **Most of each theme is already taught**: of ~720 inventory headwords, 294 were new beyond A1–A2, and 16 are not
   in the dump (two-word entries, `fandit`, `nachladit`, `reklamovat` …; reported by `select.py`).
2. **A verb that is only reflexive is taught with its clitic** (`cs.only_reflexive`): the fill had `snažit`,
   `všimnout`, `smát` bare, glossed "(se/si) to try". kaikki's raw gloss says which clitic ("(reflexive with si)
   to deserve"), now kept by `extract.py` as the sense's `c` — so B1 teaches `snažit se`, `všimnout si`, and
   **every deck's "(se/si)" marker became "(se)" or "(si)"** where Wiktionary says which (A1 and A2 rebuilt: 24
   and 35 cards, the marker only). `DROP_SENSE` is matched without the marker.
3. **An imperative is not a noun's owner** (`select.py` `assembled`): `boj`, `pokus`, `dav` were skipped as
   imperatives of verbs (`boj se`, `pokus se`).
4. **The fill's exclusions** (`select.py` `FILL_EXCLUDE`, each with its reason): vocalised prepositions (`ve`,
   `přede`), conditional and fused forms (`bychom`, `tys`; and by gloss, `FUSED`: `te` "combined form of to + je",
   `nehýbat` "negative form of"), vocatives (`mami`), case forms (`spoustu`, `dna`, `jménem`), names (`frank`,
   `dan`, `don`, `marka`), subtitle credits (`korekce`, `titulek`), variants of taught words (`moci`, `zem`),
   `stop`, `um`, and `vteřina` (Wiktionary has only the arcsecond).
5. As on every subtitle-ordered deck of the shelf, the fill carries film-dialogue words (`detektiv`, `poručík`,
   `zbraň`) on frequency.

Every card of B1 was read (2026-11-16).

## 5. How to build, and what to run

    python3 .claude/czech/run.py [--level a1|a2|b1] [--no-fetch]
    node .claude/czech/check-czech.js
    node .claude/build-lang-decks.js

A re-run reproduces the shipped deck byte for byte (checked 2026-11-16). A2 is built on the shipped A1
(`cs_level.taught_below`), B1 on both. For B2: find a scope (§2), add it to `cs_level.BANDS`, `SIZE` and
`SCOPE` and a `B2` list in `inventory.py`, and re-run A1–B1 to confirm they are unchanged.

The shelf: the `LANGS` row in `.claude/build-lang-decks.js` (`l1: 9.8`, `total: 12`, Ethnologue 28th ed. via
Wikipedia's infobox, read 2026-11-16) and the hue `lang-czech` `#3C7675` in `app.js` `COLL_THEME` (measured:
13.8 from its nearest neighbour among 80 hues — re-sweep at the merge if a sibling lands near it).
