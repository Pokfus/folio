# The Zulu language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Zulu deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Hindi, Russian TORFL, Indonesian UKBI …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Zulu language collection."

**STATUS (2026-11-09): the noun classes and sounds deck and A1 are built** (`.claude/zulu/`, §6). A2 and B1
are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for a later deck this plan produces. The collection's first commit carried a line and a bump because it also
changed the APP (the shelf's hue in `app.js`, the `levelRank` rule) — the Hindi precedent; it shares Hindi's
line of the same day, one line per kind of change.

## 1. The owner's decisions (2026-11-09)

The sources were measured first and put to the owner, because they are much thinner than Hindi's: English
Wiktionary holds about **2,700 Zulu lemmas** (kaikki: 1,942 nouns, 880 verbs), Tatoeba **about 110** Zulu
sentences with an English translation, and no subtitle frequency list exists for Zulu.

1. **Word source: CEFR A1–B1, assembled** (the UKBI / TORFL / Hindi arrangement): a hand-written topic
   inventory per level (`inventory.py`) scoped to the CEFR global descriptor, topped up by lemma frequency.
   **A1 500 · A2 750 · B1 1,000 notes** — together most of what Wiktionary has; **no B2 or C1**, for want of
   a source.
2. **A first deck of the noun classes and the clicks**, the counterpart of Hindi's alphabet deck (Zulu is
   written in the Latin alphabet).
3. **This session: plan + that deck + A1**; A2 and B1 one per session.

| deck | file | notes |
|---|---|---|
| Zulu Noun Classes and Sounds — built | `Zulu-Noun-Classes.folio-deck.json` | 39 |
| Zulu A1 Beginner — built | `Zulu-A1.folio-deck.json` | 500 |
| Zulu A2 Elementary | `Zulu-A2.folio-deck.json` | 750 |
| Zulu B1 Intermediate | `Zulu-B1.folio-deck.json` | 1,000 |

The titles carry the CEFR band, so `levelRank` sorts them; "Noun Classes" sorts first by a rule added for it
(`.claude/build-lang-decks.js`).

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, noun class, plural, tables, tones, usage examples | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Zulu.jsonl`, 61 MB) | CC BY-SA 4.0 |
| frequency | the Zulu Wikipedia, `zuwiki-20261101-pages-articles.xml.bz2` (13,718 articles, 1.1 M tokens), pinned | CC BY-SA 4.0 |
| example sentences | Tatoeba `zul` exports (≈110 Zulu–English pairs) | CC BY 2.0 FR |
| noun classes, concords, sounds (the first deck) | Wikipedia "Zulu grammar" (its class table cites Ngcobo 2010, *SAJAL* 30(1)) and "Zulu language" § Phonology, read 2026-11-09 | CC BY-SA 4.0 |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 12 million (12.1, Ethnologue, via Wikipedia's infobox, read 2026-11-09) | — |

Checked and unusable: hermitdave/FrequencyWords has no Zulu list (404); Leipzig's corpora refuse this
network (403).

## 3. The card

One note, two templates (Zulu → English, English → Zulu), `speechLang: 'zu-ZA'` (few devices have a Zulu
voice; the app says so in its voice list). Fields: `Zulu` (the headword), `Tone`, `Word` (the headword as
printed; the check and the next level's de-duplication read it), `Say` (what the speaker reads: the headword,
or a verb's infinitive), `English` (meanings by part of speech, a noun's class in its label), `Forms`
(a noun's plural and locative; a verb's infinitive and plural command), `Table` (behind the "Tenses" fold: a
verb's present, present negative, past (the perfect in -ile) and future by person), `Examples`.

- **A noun is printed whole** (umuntu); **a verb, an adjective or a relative by its stem with a hyphen**
  (-hamba, -khulu, -bomvu), as Zulu dictionaries print them, since none stands without a prefix.
- **The tone-marked spelling** (umúntu, -hámba) is Wiktionary's own, under the headword; ordinary writing
  marks no tone.
- **The relative** (`-manzi` "wet") is filed by kaikki under `conj` (head template `zu-rel`); `extract.py`
  gives it its own part of speech, `rel`.

## 4. What Zulu needs that no earlier set did — the findings

- **THE FOLD** (`zu.fold`): NFD, every combining mark dropped, lower case — Wiktionary's tones and its
  depressor mark (`y̤ébo`) never reach a match.
- **A LEMMA FREQUENCY OVER A CONJUNCTIVE ORTHOGRAPHY.** A Zulu word form is a phrase (`ngiyahamba` "I go"),
  so a lemma is counted over every form of its `zu-infl-*` table, its plural and the pointer entries that
  name it; shared forms split in proportion (the TORFL rule), each form counted once per article (`df`) so a
  bot stub repeating itself counts once. **The bare stem of an adjective or relative is not a form** (`-de`
  would claim every `de`); a verb's bare stem is its imperative, already in the table.
- **THE CORPUS IS ENCYCLOPAEDIC.** Wikipedia's stub formulae (`kwesifundazwe`, `yisifunda`, `ngumasipala`)
  and its "Imithombo" (Sources) heading top the raw counts; `select.EXCLUDE` names each, with its reason,
  and the fill takes no proper noun and no lemma of two letters or fewer (one- and two-letter verb stems —
  `-ma`, `-za`, `-ya` — take their counts from prefixes and particles). The fill still reads encyclopaedic
  (government, sport, history), and the deck's description says so.
- **WIKTIONARY'S GLOSS IS SOMETIMES NOT THE WORD THE CORPUS COUNTS** (`izinga` "ridge" vs "level",
  `isiko` "cut" vs "custom", `hlinzeka` "to get skinned" vs "to provide"): excluded from the fill rather than
  re-glossed, since a gloss is never invented.
- **THE VERB TABLE IS POSITIONAL** — measured over all 845 verbs with one: each tagged person lists 18
  present-tagged forms in one order ([0] long present, [4] its negative, [7] the perfect, [11] its
  negative), then the immediate future under its own tag; the third person (class 1) is untagged, so it is
  picked by its prefix and kept only where Wiktionary's table lists the form (`build_deck.verb_table`).
  **Two verbs print no table** (`NO_TABLE`): `-azi`, whose generated table treats it as a verb in -a
  ("ukwazia"), and `-ba`, the irregular copulative, whose generated perfect could not be confirmed.
- **A PAGE WITH TWO NOUNS CAN CARRY ONE TABLE ON BOTH**: `umsebenzi` "work" (class 3) was given class 1
  "worker"'s locative `kumsebenzi`. A person class (1, 1a, 2, 2a) makes its locative with ku-, every other
  with e- or o-; a disagreeing locative is not shown, and `check-zulu.js` fails on one.
- **Homographs** on one page are kept where both are everyday (`-dala` "old" / "to create"); a rare one is
  dropped by name (`DROP`: `ukudla` class 17 "right side", the auxiliary `-de` "always"); a gloss that is
  only "combining stem of …" is never shown, and "synonym of -fuphi" is resolved to the target's own gloss.

**Known, left.** Words A1 would have and English Wiktionary does not, so the deck cannot teach them:
kodwa "but", namuhla "today", ukuthi "that", nini "when", kuphi "where", kungani "why", kancane "slowly",
eduze "near", ekuseni "in the morning", malini "how much", konke "all", udade "sister", ifasitela "window"
(listed in `inventory.py`). 57 of A1's 500 words have an example sentence. Adjectives and relatives show no
agreement forms: their tables are untagged by class in the extract. The twelve class demonstratives (lo,
le, lesi …) all reach A1 by frequency.

## 5. Phases

**Phase 1 (done)** — the pipeline, the noun classes and sounds deck, A1. **Phase 2** — A2, then B1, one per
session: write the level's inventory into `inventory.py` and its `SCOPE` into `zulu_level.py`, run, read every
card. A phrases deck is not planned: Wiktionary has 15 Zulu phrase entries.

## 6. As built (2026-11-09)

`python3 .claude/zulu/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `wikitext.py` → `extract.py` →
`select.py` → `examples.py` → `build_deck.py`, caching in `.claude/zulu-cache/` (gitignored, ~180 MB);
`python3 .claude/zulu/classes.py` writes the first deck (reads `lex.json`). `node .claude/zulu/check-zulu.js`
is the check. **A re-run is byte-identical** (verified for both decks, from a clean extract). A1: 500 notes,
236 from the inventory and 264 by frequency; 414 with forms, 161 with tenses, 57 with sentences. The first
deck: 39 notes — 16 noun classes (1, 2, 1a, 2a, 3–11, 14, 15, 17) and 23 sounds (the three clicks in five
kinds each, hl, dl, b, bh, hh, kl, ph th kh, p t k). The shelf's hue is measured: first `#6D67D1` (18.6 from its
nearest of 46), which Greek's parallel sweep also found, so re-swept at the merge against all 62: `#9A012F`, 15.3 from its nearest.
