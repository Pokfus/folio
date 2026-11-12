# The Polish language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Polish deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Turkish, Hindi, Russian TORFL …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Polish language collection."

**STATUS (2026-11-12): A1, A2, B1 and B2 are built** (`.claude/polish/`, §5). C1, C2 and a phrases deck are not.

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
| Polish A2 — built | `Polish-A2.folio-deck.json` | 750 |
| Polish B1 — built | `Polish-B1.folio-deck.json` | 1,000 |
| Polish B2 — built | `Polish-B2.folio-deck.json` | 1,200 |
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

**A2's scope** is the same centre's "Poziom A2" page (read 2026-11-12). It gives no topic list as A1's does,
but describes the level: the speaker's intentions (thanking, apologising, inviting, wishes, congratulations,
feelings and judgements), place, direction and time, quantity, quality and possession, politeness, table
manners, Polish dishes and mealtimes, Poland in the EU and its regions, name days, birthdays and visits,
dress on official occasions, cultural and artistic life, travel in Poland and Europe, the roles of tourist,
guest, customer, tenant, caller and patient, describing and comparing, antonyms and synonyms; and in its
grammar nouns in -um, the verbs of motion, the modals `trzeba`, `warto`, `należy`, feminine names from
masculine ones and the conjunctions `więc`, `dlatego że`, `kiedy`, `gdy`, `jeśli`, `gdyby`. `inventory.py`
`A2` is written a topic at a time from that summary (`pl_level.SCOPE["a2"]` is what the description says).
**B1's scope** is that centre's "Poziom B1" page (read 2026-11-12), which does list topics: tastes, the family
and its occasions, social life, sport, town and country and public institutions, travel, work and the labour
market, education, recipes, shopping and paying, health and way of life, the environment, the state and
society (politics, the economy, crime), science and technology, the media, culture and stereotypes, plus the
functions (surprise, doubt, sympathy, disappointment, criticism, advice, a toast). **B2's** page (read the
same day) has no topic list: it names roles (sport and its fans, reader, listener, driver, witness, victim of
a crime or an accident), text intents (warning, protest, complaint, recommendation), discussion and formal
writing, and grammar (country adjectives, `lekarski` from `lekarz`, `dojrzałość` from `dojrzały`,
diminutives, `żaden` / `każdy` / `wszyscy`). B2's inventory covers those and takes B1's topics a level
further (work, housing, the media, law, health, relationships, nature, the arts, travel); its comment in
`inventory.py` and its description both say so. **C1 and C2**: start at `/sprawdz-swoj-poziom/poziom-c1`.

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

## 4b. The findings (A2, 2026-11-12)

1. **Most of the inventory lands; what does not is proper nouns, plurals and comparatives.** Wiktionary has
   no live entry for `Polska`, `Europa` or any country name, for a plural (`buty`, `meble`, `schody`, `lody`,
   `pierogi`), or for a comparative (`lepszy`, `mniej`) — the plurals were swapped for their singular
   headwords (`but`, `mebel`, `schód`, `pieróg`, `gołąbek`), the countries dropped, and the comparatives
   are already on their adjective's forms row. `historia`, `internet` and `stolik` are also not in the dump.
2. **Fused clitics are not words** (`select.py` `combined_only`): `żebyś`, `żebym`, `gdybym`, `byś` are
   "Combined form of żeby + -ś" and came into the fill on their own counts.
3. **Homographs exempted from shadowing by a closed-class reading** (`select.py` `EXCLUDE`): `dnia`
   (adverb "daily", counted from dzień), `razy` (raz), `bądź` (być's imperative), `podoba` (podobać), and
   `ego`, whose count is subtitle noise.
4. **Wiktionary's editorial notes are not glosses** (`pl.gloss`): "The meaning of this term is uncertain"
   (`różny`, and A1's `jeśli`, whose card the fix corrected) and "Used other than figuratively or
   idiomatically" (`taki sam`).
5. **Which reading leads** (`build_deck.py` `LEAD`), three more: `halo` (the telephone's "hello?", not the
   moon's halo), `piec` ("to bake", not "oven"), `gołąbek` (the cabbage roll, not "pigeon").
6. **A sentence that is another word's** (`examples.py` `REJECT`): `należy` has no table, so it is found only
   by its own spelling, which is also należeć's "belongs" (`To należy do ciebie`); `piec`'s plural `piece`
   was the English of a manga title.
7. Replaced in the inventory after reading: `marchewka` (Wiktionary's live sense is "redhead"; `marchew` is
   "carrot"), `święta` (filed as "saint"; `święto` teaches the holiday), `stare miasto` (its sentences say
   "an old city").

## 4c. The findings (B1 and B2, 2026-11-12)

1. **More subtitle names and forms in the fill** (`select.py` `EXCLUDE`): `frank`, `tom`, `henr` (names);
   `pierwsza`, `młoda`, `lewa` (an adjective's feminine), `żadnego`, `człowieku`, `powinno`, `cie`, `dna`
   (a case of another word), `działo` (`dziać się`), `święta` (święto's plural), `korekta` (subtitle
   credits), `glina` and `forsa` (counted for slang senses the deck does not teach), `mary` (the name), and
   `dupek` (swearing).
2. **A bare diminutive pointer is a meaning — for a word taught as a diminutive** (`build_deck.py`
   `diminutive`): `kotek`, `domek`, `synek`, `ptaszek` came out as "sweetie", "cabin for animals", a weaving
   term and "checkmark". Read as the target's first gloss ("house (diminutive)"), or the gloss after the
   semicolon (`kotek`: "kitty"), and an entry that is only the pointer (`synek`) is read too. Only for B2's
   "diminutives" topic: applied everywhere, it led A2's `sałatka` with "lettuce" before "salad".
3. **A sense dropped though untagged** (`build_deck.py` `DROP_SENSE`): `ojczyzna`'s joke sense.
4. **Which reading leads**, three more: `tchórz` ("coward", not the polecat), `wart` ("worth"), `dosyć`.
5. **Not in the dump**: most two-word phrases written for an inventory (they are dropped and reported), and
   every plural headword (`zawody`, `wybory`, `śmieci` — the singular was used where it means the same).
   `niczego` resolves only as an adjective ("decent") and `krzak` leads with "mojibake"; both were removed.
6. Every card of B1 and B2 was read. The subtitle fill carries crime-drama words (`detektyw`, `porucznik`,
   `zabójca`) on frequency, as every subtitle-ordered deck on the shelf does.

## 5. How to build, and what to run

    python3 .claude/polish/run.py [--level a1] [--no-fetch]
    node .claude/polish/check-polish.js
    node .claude/build-lang-decks.js

A re-run reproduces the shipped deck byte for byte (checked 2026-11-09). A level is built on the shipped
decks below it (`pl_level.taught_below`). **Every card of A1 was read**; read every card of each new level
too, since the faults above were all found that way; every card of A2, B1 and B2 was read too (2026-11-12).
For C1: find the scope (§2), add `SCOPE["c1"]` (with its `topics` and `with`) in `pl_level.py` and `C1` in
`inventory.py`, run, read, fix, re-run — and re-run every level below to confirm it is unchanged.

The shelf: the `LANGS` row in `.claude/build-lang-decks.js` (`l1: 40`, Ethnologue 27th ed., 2021, via
Wikipedia's infobox, read 2026-11-09) and the hue `lang-polish` `#6B7493` in `app.js` `COLL_THEME`
(measured: first a green, `#318526`, re-swept at the merge when a sibling had taken nearly the same green;
now 15.7 from its nearest neighbour among 57 hues).
