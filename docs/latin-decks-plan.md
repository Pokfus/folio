# The Latin language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Latin deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Hindi, Russian TORFL, Indonesian UKBI …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Latin language collection."

**STATUS (2026-11-12): A1 to B2 are built** (`.claude/latin/`, §6–§9). C1 and the phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any later deck this plan produces. The collection's first commit carried one line and one bump, because
it also changed the APP (the shelf's hue in `app.js`) — the Hindi precedent.

## 1. The owner's decisions (2026-11-09)

1. **Word source: CEFR A1–C1, assembled** (the Hindi / UKBI arrangement). No examination publishes a graded
   Latin list and the CEFR describes living languages, so each level borrows its band's global descriptor as
   a SCOPE only; its core is a hand-written topic inventory (`inventory.py`) in the vocabulary of Roman life,
   topped up by the DCC Latin Core Vocabulary's rank. Each deck's description says so in plain words.
   Sizes (the Hindi set's, proposed here, the owner may change): **A1 500 · A2 750 · B1 1,000 · B2 1,500 ·
   C1 1,500 notes.**
2. **A phrases and mottos deck, yes** — after the levels.
3. **The card shows**: the dictionary form with principal parts (`amō, amāre, amāvī, amātum`; `rēx, rēgis
   m.`), **macrons** on long vowels, the **full declension / conjugation table**, and **example sentences**.
4. **This session: plan + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Latin A1 Beginner — built | `Latin-A1.folio-deck.json` | 500 |
| Latin A2 Elementary — built | `Latin-A2.folio-deck.json` | 750 |
| Latin B1 Intermediate — built | `Latin-B1.folio-deck.json` | 1,000 |
| Latin B2 Upper Intermediate — built | `Latin-B2.folio-deck.json` | 1,500 |
| Latin C1 Advanced | `Latin-C1.folio-deck.json` | 1,500 |
| Latin Phrases and Mottos | `Latin-Phrases-and-Mottos.folio-deck.json` | what the levels leave |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, principal parts, macrons, tables | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Latin.jsonl`, 1.25 GB) | CC BY-SA 4.0 |
| frequency (primary) | Dickinson College Commentaries Latin Core Vocabulary, CSV export (996 rows; Francese et al., 2012–13) | CC BY-SA 3.0 |
| frequency (words outside the DCC list) | a lemma count over Tatoeba's 57,000 Latin sentences | CC BY 2.0 FR |
| frequency (B1 on, beyond the DCC list) | a lemma count over 149 pinned pages of classical authors from The Latin Library (`corpus.py`, §8); only the counts are used | public-domain texts |
| example sentences | Tatoeba `lat` exports (≈40,800 Latin–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| `LANGS` row | `l1: 0` — Latin has no native speakers, so it sorts last | — |

No subtitle frequency list exists for Latin (hermitdave has none), and a reader of Latin reads classical
texts, so the DCC list is the right order rather than a stand-in. **Beyond A1–B1 it runs out**: 1,000 words
cannot fill B2 and C1, so a later phase needs a classical corpus count (Perseus `canonical-latinLit`, CC BY-SA,
is reachable through raw.githubusercontent.com but not listable from a cloud session; The Latin Library
answers). Decide that before A2's fill reaches the end of the DCC list.

## 3. The card

One note, two templates (Latin → English, English → Latin). Fields: `Latin` (the headword with macrons),
`Parts` (the dictionary entry and, in small capitals, the declension or conjugation), `Key` (the fold, for
"taught below"), `Word` (what the speaker reads: the headword without marks), `English` (meanings by part of
speech; a noun's gender, a preposition's case, a verb's deponency in the label), `Forms` (an adjective's
comparative, superlative and adverb), `Table` (behind a fold), `Examples` (up to three Tatoeba sentences).
The type's CSS is `.claude/latin/card.css` (the Hindi type's, with `.uc-pp` / `.uc-cls` for the entry line).

**The speaker is Italian (`speechLang: it-IT`)**: almost no device has a Latin voice, an engine given `la`
falls back to its default (usually English), and an Italian voice gives the Italianate church pronunciation,
a real tradition of spoken Latin. The description says so. Revisit if browsers gain Latin voices.

## 4. What Latin needs that no earlier set did — the findings

- **THE FOLD** (`la.fold`): macrons, breves and tie bars dropped, lower case, `j` → `i`, `v` → `u`, æ / œ
  opened. For matching only; the card prints Wiktionary's spelling.
- **THE MACRON DECIDES HOMOGRAPHS.** The inventory is written with macrons and keeps only the Wiktionary
  entries spelt exactly so: `mālum` apple / `malum` evil, `ōs` mouth / `os` bone, `edō` eat / `ēdō` give out.
  A spelling that matches only without marks is reported. Wiktionary marks hidden quantity (`vēndō`,
  `stēlla`, `iēntāculum`) and the inventory follows it; an **anceps** vowel (`egō̆`, `ubī̆`, `mihī̆`) is shown
  unmarked (`la.tidy`), as textbooks print it.
- **PARTICIPLES THAT ARE ADJECTIVES** (`sapiēns`, `potēns`) are tagged form-of with real meanings; only
  "… participle of X" is a pointer (`extract.is_formof`). **Pronouns filed as forms** (`nōs` "nominative/
  accusative plural of ego: we, us") keep the meaning after the colon.
- **THE DCC ROW MUST BE THE LEMMA**: "ā ab abs" is filed under `ā`, which in Wiktionary is the letter and an
  interjection; a DCC word joins the fill only through an entry of the DCC's part of speech. Letter names
  (`ex` "the letter X") are never a sense.
- **OPEN-CLASS HOMOGRAPHS ARE DROPPED** where the DCC names another class (`altus` is also the participle of
  `alō`, `capiō` also a noun, `mīlle` also "a mile"); a noun beside a DCC adjective stays (`amīcus` "friend"),
  and the inventory's `:pos` always stays and leads (`la.kept`). Two hand tables in `build_deck.py`:
  `ONLY_POS` (`brevis`, `ave`) and `ALSO` in `la.py` (`hic` also teaches `hīc` "here", since unmarked
  sentences cannot tell them apart).
- **A FORM TWO DECK WORDS SHARE PROVES NOTHING** for the examples (`est`: `sum` / `edō`): a sentence counts
  only through a form no other word of the deck owns, or the headword's own spelling; and one sentence per
  set of words (`Te amo` / `Amo te`).
- **THE HEAD LINE IS CUT TO ITS CLASS** (`short_class`): `sum`'s runs to "irregular conjugation, suppletive,
  no passive, no supine stem …". Only "optionally semi-deponent" is not labelled; where Wiktionary gives two
  perfects (`audeō`: ausī / ausus sum) both are shown.
- **LONG GLOSSES ARE CUT AT A SEPARATOR** outside parentheses before 100 characters (`shorten`): Wiktionary's
  own words, in order. `LEAD` reorders five whose first sense is not the everyday one (`putō` "to clean");
  `GLOSS` rewrites three that describe grammar rather than meaning (`ego`, `suī`, `an`).

**Known, left.** `fīō` has no example (its forms are `faciō`'s passive). Tatoeba is learners' Latin, not
classical prose; its sentences use no macrons. Deponent perfects are periphrastic in Wiktionary's table
(`locūtus` + sum) and are left out of the table (the entry line carries `locūtus sum`). Some glosses are
as long-winded as Wiktionary's (`num`).

## 5. Phases

**Phase 1 (done)** — the pipeline and A1. **Phase 2** (A2, B1 and B2 done) — A2 to C1, one level per session: write the level's
inventory into `inventory.py` and its `SCOPE` into `latin_level.py`, run, read every card; decide the corpus
count (§2) before the DCC list runs out. **Phase 3** — the phrases and mottos deck. **Phase 4** — a combined
file, gitignored.

## 6. As built (2026-11-09): A1

`python3 .claude/latin/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/latin-cache/` (gitignored, ~1.4 GB). `node
.claude/latin/check-latin.js` is the check. **A re-run is byte-identical** (verified). A1: 500 notes, 322 from
the inventory and 178 from the DCC list; 392 with a dictionary entry, 399 with a table, three sentences for
499. The shelf's hue is measured: `#75543F`, 16.2 from its nearest of 55. The first sweep (46 hues) found `#6F69D2`,
which Greek's parallel session also found and merged first, so Latin was re-swept at the merge.

## 7. As built (2026-11-12): A2

`python3 .claude/latin/run.py --level a2`. 750 notes: 393 from the A2 inventory (19 topics: the numbers to
a thousand and the ordinals, seasons, the wider family, trades, the market and money, clothing, the house,
the kitchen, the town, travel, the farm, animals, the body, school, games, feelings, describing words, place
and manner, everyday verbs) and 357 from the DCC list; 660 with a dictionary entry, 662 with a table, three
sentences for 704, none for 10. A re-run is byte-identical, and A1 still rebuilds byte-identical.

**THE DCC LIST IS NEARLY SPENT: A2's fill reached rank 891 of 996.** B1 (1,000 notes) cannot be filled from
it; decide the classical corpus count (§2) before building B1.

What A2 added to the pipeline, each read off its cards:
- **An indeclinable noun** (`nefās`: a gender, no genitive, no declension) gets the entry `nefās n.,
  indeclinable` rather than none (`parts_html`).
- **Participles that are only participles in Wiktionary** (`īrātus`, `sapiēns`, `falsus` "false" filed
  under the participle of `fallō`) carry no dictionary entry and are labelled verbs, so they were left out
  of the inventory; `versus` is asked for as `versus:noun` (the line of verse).
- `LEAD` gained `recēdō`, `cohors`, `stilus`; `ONLY_POS` gained `dorsum` (noun; also an adverb "down"),
  `ēsuriō` (verb), `quattuordecim` (number; also "the equestrian order"); `NOT_A_MEANING` now also drops a
  gloss naming `sexual` or `penis` (`virgō`, `membrum`) — A1 is unchanged by it.
- Dropped from the inventory: words Wiktionary does not hold as a lemma here (`lībertus`, `thermae`,
  `epistula`, `litterae`, `tussis` …, printed by `select.py`), `sāpō` (only "an ancient hair product") and
  `allium` (a pointer, "late form of ālium"). The months are not taught: their headwords are capitalised
  adjectives, and `check-latin.js` wants a lower-case headword.

## 8. As built (2026-11-12): B1, and the classical count

**THE CORPUS COUNT (decided here, §2).** `corpus.py` counts word forms over a PINNED list of 149 pages
of The Latin Library (thelatinlibrary.com; Perseus is not listable from a cloud session): Caesar (*Gallic*
and *Civil War*), Cicero (Catilinarians, *De officiis*, *De amicitia*, *De senectute*, *Pro Archia*, *Pro
Milone*, *De finibus* 1, *Tusculans* 1), Sallust, Livy 1–10, Nepos, Seneca *Letters* 1–10, Pliny *Letters*
1–10, Tacitus (*Annals* 1–6, *Histories* 1, *Agricola*, *Germania*), Quintilian 1, Plautus *Amphitruo*,
Catullus, Lucretius, Virgil, Horace (*Odes*, *Satires* 1, *Epistles* 1), Propertius 1, Ovid *Metamorphoses*,
Juvenal 1 — 806,872 lower-case tokens. Pages are cached in `latin-cache/classical/`; `classical.json` is
built once (`run.py` runs the stage for `CORPUS_LEVELS`, again on `--re-extract`) and is byte-identical on
a re-run. The count is `extract.lemma_counts` (refactored out of `extract.py`, whose `lex.json` is
unchanged, md5 checked) with three guards, each read off the first count, where `bellus` had `bellum`'s
count, `magus` `magis`'s and `aeneus` Aeneas's:
- **only lower-case tokens count** (a capital is a name; a sentence's first word is lost evenly);
- **a form a DCC lemma claims goes to the DCC lemmas alone** (`first`);
- **a lemma spelt as a form of a DCC lemma is not offered** (`quod`, `factus`, `maximus`), and in
  `select.py` nor one spelt as a form of a word taught below or chosen for the level (`oblītus` is
  `oblīvīscor`'s, `omissus` `omittō`'s; `shadow_of`, repeated until stable).

**B1**: `python3 .claude/latin/run.py --level b1`. 1,000 notes: 335 from the B1 inventory (17 topics: the
state, the courts, the army, religion, the sea, geography, learning and speaking, the arts, trade, society,
nature, history, mind and character, describing words, connectives, verbs of thinking and doing), the DCC
list's last 52, and 613 from the classical count; 919 with a dictionary entry, 922 with a table, sentences
for 874 (three for 691). **Tatoeba runs thin at this level: 126 words have no example sentence.** A re-run is
byte-identical; A1 still rebuilds byte-identical.

What B1 added to the pipeline:
- **A participle Wiktionary files as a word** (`apertus`, `dīligēns`, `contentus`: a `verb` entry whose
  table has no person) is shown as a *participle* with an adjective's entry and table, after any other entry
  of the spelling (`lūctus` the noun first). This relabelled five secondary senses on A2 ("verb" →
  "participle": `serpēns`, `advocātus`, `versus`, `mercātus`, `dēbitum`) — A2 was rebuilt with it.
- `NOT_A_MEANING` drops a case-and-number label filed as a sense (`dēbitum`'s participle).
- `LEAD` +6 (`sānctus`, `triumphus`, `disserō`, `peragō`, `minor`, `adōrō`), `ONLY_POS` +3 (`sānctus`,
  `prōmptus`, `minor`), `EXCLUDE` (in `select.py`) +8 doublets and fragments (`utque`, `sīquis`, `ulter`,
  `īnsidia`, `tueō`, `spōns`, `quantusque`, `pennus`), each with its reason. The inventory asks for
  `sānctus:verb` (the participle "holy"; the DCC's "adjective" would drop it for the noun "a saint").
- The description names the classical count and its authors when a level uses it (`ORDER_CORPUS`,
  `CORPUS_SOURCE`); A1's and A2's are unchanged.

**Known, left.** Some corpus words are participles of verbs no level teaches yet (`adeptus`, `nactus`,
`dēfūnctus`, `intermissus`) — real words, shown as participles; B2 may teach the verbs. The count folds
macrons, so homographs share it (`mālum`/`malum` were settled by the inventory at A1). B2 and C1 fill
almost wholly from the count, so read their rankings for more collisions before building.

## 9. As built (2026-11-12): B2

`python3 .claude/latin/run.py --level b2`. 1,500 notes: 234 from the B2 inventory (12 topics, the
vocabulary of the treatises: philosophy and ethics, rhetoric, grammar and literature, law and government,
medicine, farming, building and engineering, the heavens and nature, the theatre and music, siege and
fleet, abstract qualities, emotions, the verbs of argument) and 1,266 from the classical count — the DCC
list is spent. 1,426 with a dictionary entry, 1,432 with a table; **sentences for only 1,017 (three for
537): Tatoeba has none for 483 words at this level.** A re-run is byte-identical; A1, A2 and B1 are
unchanged by B2's tables.

Most of the inventory was already taken by the levels below or by the count, so it chiefly adds the
technical terms the count ranks low (`exōrdium`, `aequinoctium`, `vadimōnium`, `catapulta`). Dropped as not
in Wiktionary as a lemma: phrases (`summum bonum`, `senātūs cōnsultum`, `terrae mōtus`, `mīlle passūs`,
`tribūnus mīlitum`, `iūris cōnsultus`) and `grātitūdō`, `falsitās`, `argūmentātiō`, `perōrātiō`, `elegīa`,
`epistula`, `manūmissiō`, `mīliārium`, `orchēstra`, `circumvallātiō`; `astrum` and `cuprum` have only
late senses; `auxilia` is A2's `auxilium`; `cubitus` is here only "a lying down".

Read off its cards: `EXCLUDE` +24, each with its reason — doublets of a deponent taught already (`imitō`,
`misereō`, `cohortō`, `mōliō`), fragments and compounds (`quibuscum`, `nuo`, `uo`, `inlāta`), rare words
counted off a common one's forms (`carinus` ← `carīna`, `cora` ← `cor`, `pessimō` ← `pessimus`,
`aquilus` ← `aquila`, `bēluus` ← `bēlua`), positives behind a comparative (`citer`), wrong lemmas for
the common word (`ānus` for `anus` "old woman", `dēlicia` for `dēliciae`, `tenus` "a cord" for the
preposition), and two whose only sense is dropped on a level deck (`pēnis`, `sexus`). Their places went
to `vās`, `mōlior`, `bēlua`, `dēliciae`, `cōram`, `penes`, `citrā` and others. `ONLY_POS` +3 (`prōrsus`
adverb, `attonitus` participle, `luxus` noun), `LEAD` +1 (`mināx` "threatening").

**For C1**: it fills wholly from the count's next 1,500 (below rank ~3,000), where collisions and late or
rare senses grow; read the ranking before building, and expect Tatoeba to cover barely half the words.
