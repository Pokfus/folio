# The Swahili language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Swahili deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Hindi, Russian TORFL, Indonesian UKBI …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Swahili language collection."

**STATUS (2026-11-09): A1 and A2 are built** (`.claude/swahili/`, §6, §7). B1 to C1 and a phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one (folded into the day's Hindi line)
because it also changed the APP (the shelf's hue in `app.js`) — the Hindi and Turkish precedent.

## 1. Decisions (2026-11-09)

The request named nothing beyond the language, so the session took Hindi's answers, the latest the owner gave
for a language with no exam list — **open to the owner's correction**:

1. **Word source: CEFR A1–C1, assembled.** No exam board publishes a graded Swahili word list that can be
   reused, so each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global
   descriptor for its band, topped up with the commonest remaining lemmas. Each deck's description says so.
   Sizes: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**, then a phrases deck.
2. **No script deck and no romanisation**: Swahili is written in the Latin alphabet, phonetically.
3. **This session: plan + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Swahili A1 Beginner — built | `Swahili-A1.folio-deck.json` | 500 |
| Swahili A2 Elementary — built | `Swahili-A2.folio-deck.json` | 750 |
| Swahili B1 Intermediate | `Swahili-B1.folio-deck.json` | 1,000 |
| Swahili B2 Upper Intermediate | `Swahili-B2.folio-deck.json` | 1,500 |
| Swahili C1 Advanced | `Swahili-C1.folio-deck.json` | 1,500 |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule.

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, noun class, forms | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Swahili.jsonl`, 86 MB, 21,700 entries) | CC BY-SA 4.0 |
| frequency (counts only; no text ships) | OPUS: OpenSubtitles v2024 Swahili (112,000 lines, 540,000 words) and Global Voices v2018q4 Swahili (37,000 lines, 660,000 words) | Global Voices CC BY 3.0; OpenSubtitles as distributed by OPUS |
| example sentences | Tatoeba `swh` exports (≈4,350 Swahili–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 5.3 million, Wikipedia's infobox (Ethnologue 27th ed.; 92 million L2), read 2026-11-09 | — |

**Checked and not used**: hermitdave/FrequencyWords has no Swahili; the Leipzig Corpora Collection's
download page sits behind a bot challenge (not bypassed).

## 3. The card

One note, two templates (Swahili → English, English → Swahili), `speechLang: 'sw-KE'`. Fields: `Swahili`
(the headword as a learner's dictionary prints it), `Word` (what the speaker reads), `English` (meanings by
part of speech, a noun's CLASS in its label — "noun, class 7/8 (ki-vi)", "takes m-wa agreement" for an
animate noun outside class 1/2, "plural only"), `Forms` (a noun's plural; a verb's stem and negative
infinitive; an adjective's or possessive's forms after m-wa, ki-vi and n), `Examples` (up to three Tatoeba
sentences, the word in bold, with a speaker). A verb is printed as its INFINITIVE (`kusoma`, `kwenda`), an
adjective or possessive as its hyphenated STEM (`-zuri`, `-angu`). The type's CSS is `.claude/swahili/card.css`
(Hindi's, without the romanisation rules).

## 4. What Swahili needs that no earlier set did — the findings

- **NO FREQUENCY LIST EXISTS, SO TWO CORPORA ARE COUNTED, AND A WORD MUST BE COMMON IN BOTH.** Summed, the
  subtitles' dubbed historical dramas put `mfalme` "king", `malkia` "queen" and `sultani` in the fill and the
  news site put `blogu`, `mwanablogu` "blogger" and `mtandaoni` "online" there. The rank is the GEOMETRIC MEAN
  of the two corpora's rates per million; a word absent from either scores 0.
- **A VERB IS ALMOST NEVER WRITTEN AS ITS STEM**, so a lemma frequency needs a parser (`sw.VerbParser`): a token
  is credited to a verb when it is the verb's stem (or its subjunctive -e, negative -i) behind a prefix string
  generated from the subject, negative, tense, relative and object markers. Two rules found by reading the
  ranking: (1) **a monosyllabic stem keeps ku- under a tense** (`nilikula`), so `-la` claims only prefixes
  ending in ku — without it, `-la` claimed every token ending in "-la"; (2) **a loan verb (`-fikiri`, `-jibu`,
  `-halifu`) is never credited through the bare subjunctive**: its vowel never changes, so subject + stem is also
  how a noun derived from it is spelt — `uhalifu` "crime" and `mhalifu` "criminal" made `-halifu` "to disobey"
  an A1 word. It knows no verb extensions (Wiktionary lists `-somea`, `-someshwa` as lemmas of their own).
- **THE GENITIVE PARTICLE'S FORMS ARE ITS OWN**: `-a` "of" is written `wa`, `ya`, `la`, `cha`, `za` by class, and
  under the closed-class rule `la` "to eat" took every class-5 "of" and `wa` "to be" every class-1/2 one. They
  go to `-a` (which the fill then excludes, a grammar point), except `kwa` "for, by, with", a word of its own.
- **POINTER GLOSSES** that Wiktionary leaves untagged — "[[Appendix:Swahili noun classes|…]] inflected form of
  -zuri", "Ki class form of amba-", "pa locative class subject inflected …" — are cut by text (`extract.POINTER`);
  a derived verb's meaning after its pointer is KEPT ("Passive form of -elea: to understand" → `-elewa`).
- **ONE ETYMOLOGY PER CARD** (`ETYMS` in `build_deck.py`): `pata` "get" / "hinge", `taka` "want" / "dirt", `pua`
  "nose" / "steel"; `jua` keeps "to know" AND "sun", `ua` "to kill" AND "flower", `basi` "well, then" AND "bus".
- **THE CASE IS WIKTIONARY'S**: the days (proper nouns there, admitted by `NAME_OK`), `Kiswahili`, `Kiingereza`.
- Hand exclusions from the fill, each with its reason, in `select.EXCLUDE` (variant spellings `ndio`,
  `mwanaume`; homographs whose count is another word's — `kuna` "to scrape" is `kuna` "there is", `nina`
  "mother" is `nina` "I have"); swearing in `SWEARS`.

**Known, left.** The fill carries the subtitles' crime vocabulary (`mauaji`, `hatia`) and some news vocabulary
(`serikali`, `rais`, `waziri`) on frequency, as every corpus-ordered deck on the shelf does. Tatoeba's Swahili
is small: 18 of A1's 500 words have no sentence, and a few sentences carry the contributor's typos. Some
Wiktionary senses are odd for a beginner (`-weza` "to be unwell"), shown as the source has them.

## 5. Phases

**Phase 1 (done)** — the pipeline and A1. **Phase 2** — A2 (done) to C1, one level per session: write the level's
inventory into `inventory.py` and its `SCOPE` into `swahili_level.py`, run, read every card.
**Phase 3** — the phrases deck (`phrase` / `proverb` entries — Wiktionary has 34 proverbs — and multi-word lemmas).

## 6. As built (2026-11-09): A1

`python3 .claude/swahili/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py`
→ `examples.py` → `build_deck.py`, caching in `.claude/swahili-cache/` (gitignored, ~200 MB).
`node .claude/swahili/check-swahili.js` is the check. **A re-run is byte-identical** (verified). A1: 500
notes, 277 from the inventory and 223 by frequency; sentences for 482, three apiece for 459.
The shelf's hue is measured: `#6D67D1`, 18.6 from its nearest of 46 (the farthest point, a green at 19.3, was
refused — the section has two greens already — and the next, a magenta at 18.7, is in the band the shelf rejects).

## 7. As built (2026-11-09): A2

`python3 .claude/swahili/run.py --level a2`. 750 notes, 269 from the inventory (17 topics: months, the land
and weather, animals, clothes, the home and kitchen, food, jobs, school, transport, the town, health,
feelings, free time, verbs, describing, time, connectors) and 481 by frequency; sentences for 633, three apiece
for 436, none for 117 (Tatoeba's Swahili is small). A re-run is byte-identical, and **A1 is byte-identical
after every change below** (its card ids are positional: re-dealing it would remap readers' progress).

- **A LOWER LEVEL TAUGHT THE LEMMA, NOT JUST THE HEADWORD** (`select.says_all`). A1 printed `jua` as `kujua`
  and `nani` as `nani`; A2's fill, reading their other entries first, dealt them again as `jua` "sun" and
  `-a nani` "whose" (and `toka`, `jibu`). A lemma is now below if ANY headword it could be printed as is in a
  lower deck's `Word`.
- **A MULTI-WORD LEMMA HAS ITS OWN COUNT** (`seq` in `lex.json`): the geometric mean of how often its words
  occur in sequence. The parts rule gave `kwa sababu`, `juu ya`, `chuo kikuu` a 0 (`ya`, `kikuu` are not
  lemmas), so they were dealt last. Used from A2 up only (`select.rank`); A1 stays on `freq`.
- **THE MONTHS** are proper nouns in Wiktionary, admitted like the days; `Machi` replaces the common noun
  `machi` "a march (walk)" it shares a key with.
- More homographs whose count is a verb form, excluded with reasons: `tuna` "to swell" (`tuna` "we have"),
  `kina` "depth" (`kina` "it has"), `ukiwa` "solitude" (`ukiwa` "when you are"), `kiko` "pipe", and `-hidi`
  "to convert" (the parser splitting `-ahidi` "to promise" at the wrong letter). More etymology choices
  (`paa` roof, `tupa` throw, `chungu` bitter, `panga` arrange) and lead glosses (`mpira` ball, `kiwanda` factory).
  `kuhusu` leads with "about, involving", Wiktionary's own gloss on its `kuhusu` entry.
- **Known, left**: the fill leans on news and drama vocabulary (`mahakama`, `gereza`, `silaha`, `mtukufu`),
  as every corpus-ordered deck on the shelf does; several applicative and passive verbs (`kuletea`,
  `kuchukuliwa`) are lemmas of their own in Wiktionary and come in on their counts.
