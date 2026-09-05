# The Spanish collection — an audit

Seven decks, 8,391 notes (16,782 cards), 19,741 example sentences: `DELE-A1` … `DELE-C2` and
`Spanish-Phrases`. Measured on 2026-09-05 against the shipped files in `decks/`, with the scripts
described at the foot of this file. **Nothing here has been changed** — this is the finding list and
the plan, in the shape `docs/refinements-2026-08-27.md` uses.

The collection is in good structural health. The two-direction note shape is right, the cross-level
promise holds (only three lemmas appear in two decks, and all three are the standalone Phrases deck
against a different sense), the reverse direction is almost free of ambiguity because
`dedupe-glosses.py` already did that pass, articles and plurals are right including the `el agua /
las aguas` rule, and 2,048 of 2,084 verbs carry a full conjugation. What follows is what is wrong
with it.

---

## 1. The three headline answers

### Does every card list its most common definitions? **No — and it cannot, by construction.**

`build_deck.py` takes **one part of speech per card** (`for r in [primary]: … break`) and **at most
two Wiktionary senses** from it (`glosses_for(rec, limit=2)`), under a further **96-character
budget** that cuts the second sense off whenever the first is long. Measured: **every one of the
8,391 cards carries exactly one `uc-sense` block, and 3,266 of them (39%) show a single meaning
line.**

The comment defending the one-POS rule says a second record "is nearly always a marginal record of
the same string". That is true of `tu` as an interjection; it is false of exactly the words a
learner most needs, and the cards' own examples prove it:

| card | deck | gloss shown | what is missing | the card's own examples say |
|---|---|---|---|---|
| `apagar` | A2 | "to extinguish (a flame fire) to douse quench slake (thirst" | **to turn off** | *Turn off the kitchen light* ×3 |
| `la planta` | A1 | "plant or of the Chlorophyta, a eukaryote that includes double-membraned chloroplasts…" | floor/storey, sole of the foot | — |
| `la cuenta` | A1 | "count tally operation" | **the bill**, bank account | — |
| `final` | A1 | adjective only | the noun *el final*, "the end" | *Al **final** él mismo será su propia ruina* |
| `la muñeca` | B1 | "wrist" | **doll** | — |
| `la letra` | A2 | "letter (symbol) handwriting" | **lyrics** | — |
| `la copa` | A2 | "stemmed glass goblet crown treetop" | **cup, trophy** | — |
| `la vela` | B2 | "candle wakefulness sleeplessness" | **sail** | — |
| `tomar` | A1 | "to take to select choose" | **to drink, to have** (a coffee) | — |

`apagar` is the clearest case: the pipeline found three perfectly good sentences that all mean *turn
off the light*, and then printed a gloss that does not contain the phrase.

Two further faults sit in the same code.

**138 cards carry a gloss with unbalanced parentheses**, on 255 gloss lines. `comma_parts` splits a
gloss on commas without looking at brackets, so Wiktionary's `final (last, ultimate)` becomes two
bullets, "final (last" and "ultimate)". A one-line guard — refuse the split when any piece has
unbalanced parentheses — fixes all of them.

**`tidy()` truncates at 92 characters mid-parenthetical**, which is the second source of the same
symptom and is where `apagar`'s "(thirst" comes from. Truncate at a bracket boundary or drop the
whole parenthetical.

### Does every card list three different example sentences? **No — 31% do not.**

| deck | notes | 3 examples | 2 | 1 | **none** | % with three |
|---|---|---|---|---|---|---|
| DELE A1 | 496 | 486 | 10 | 0 | 0 | 98.0% |
| DELE A2 | 499 | 487 | 10 | 2 | 0 | 97.6% |
| DELE B1 | 999 | 948 | 39 | 7 | 5 | 94.9% |
| DELE B2 | 1,999 | 1,599 | 165 | 115 | **120** | 80.0% |
| DELE C1 | 1,998 | 1,143 | 267 | 279 | **309** | 57.2% |
| DELE C2 | 2,000 | 761 | 276 | 370 | **593** | 38.0% |
| Spanish Phrases | 400 | 371 | 22 | 5 | 2 | 92.8% |
| **total** | **8,391** | **5,795** | **789** | **778** | **1,029** | **69.1%** |

**1,029 cards (12.3%) have no example at all**, and the failure is concentrated where the deck
description promises the same thing as everywhere else. Every DELE deck's `desc` says "Every word
also carries three real example sentences"; on C2 that is true of 38% of them. The cause is not a
bug — Tatoeba simply does not contain enough sentences using C1/C2 vocabulary — but the sentence in
the description is not true, and a learner meets a card with an empty "In a sentence" fold and no
explanation.

Of the 5,795 cards that do have three, **1,587 (27%) show the same inflected form three times**,
against a description that promises "three different inflected forms rather than the same one three
times". A further **191 cards carry two near-identical sentences** (>82% similar after
normalisation) — `el cierre`: "Por favor, cierre la puerta **tras** de usted" and "…**detrás** de
usted"; `la mansión`: "Los padres de **Mary** viven en una mansión" and "Los padres de **Tom**…".
Tatoeba carries whole families of these and the picker does not de-duplicate near-neighbours.

### Are there mistakes and inconsistencies? **Yes — five kinds, listed below.**

---

## 2. The phrase matcher has no word boundary — 129 wrong example sentences

`examples.py` matches a multi-word headword against the corpus with a bare substring test:

```python
for p in PHRASES:
    if p in low:
        hits.add((p, p))
```

So `cerca de` matches **a**`cerca de`, `una vez` matches **alg**`una vez`, `a casa` matches
`es`**a casa**, `a priori` matches "primera **a prio**ridad", `puesto que` matches "por su**puesto
que**". The MARKING stage does respect word boundaries, so it declines to bold anything — which is
why the fault is exactly visible as an example sentence with no `<b>` in it.

**129 example sentences across 74 cards.** The list, by deck:

- **Spanish-Phrases — 62 cards, 109 sentences.** Worst of the collection: 9.4% of that deck's
  examples do not contain their own phrase.
- **DELE B1 — 6 cards:** `puesto que` (3), `dado que` (3), `o sea` (3), `debido a`, `a menos que`,
  `en fin`.
- **DELE B2 — 4 cards:** `con todo` (2), `a diferencia de`, `en consecuencia`, `en definitiva`.
- **DELE C2 — 2 cards:** `a priori` (2), `darse por vencido`.

**Seventeen phrase cards have every one of their examples wrong**, so the card teaches nothing at
all: `a ver`, `cerca de`, `qué pasa`, `cómo está`, `a mano`, `es decir`, `qué tiene`, `qué va`,
`a saber`, `por hora`, `al tiempo`, `tiempo ha`, `a muerte`, `a conciencia`, `al momento`,
`cuando quiera`, `sí soy`. `cerca de` — a card teaching "near, close to" — is illustrated by three
sentences that all mean "about": *Tom le preguntó a Mary acerca de John.*

The fix is one line, and it is the same lookaround `spellText` already uses for the same reason:

```python
rx = re.compile(r'(?<![0-9a-záéíóúüñ])' + re.escape(p) + r'(?![0-9a-záéíóúüñ])')
```

It will lower the example counts further — those 129 sentences are removals, not repairs — which is
why it belongs in the same pass as §6.

## 3. Twelve wrong headwords in A1: the months take an article

A1 teaches **`el enero`, `el febrero`, `el marzo`** and the other nine. Spanish months are written
without an article — *en enero*, *nací en marzo*, *es enero* — and Wiktionary files them as
masculine nouns, so the deck's own rule ("every noun carries its article, so the gender is learnt
with the word") applied to them mechanically. The speaker reads the article too (`data-say` is the
headword verbatim), so the card also *says* "el enero".

These are the first twelve cards of the collection's first deck, and they teach a beginner a form no
native speaker writes. The months want the same treatment the days of the week already get.

## 4. C2 has taken rare senses of inflected forms and made them headwords

`u_delec2_11` is **`la mía`**, glossed "*a regiment of 100 soldiers in the Spanish protectorate of
Morocco*" — and illustrated with "La tuya es más grande que **la mía**" (*yours is bigger than
mine*). The gloss and the examples are about different words. This is a family:

| card | glossed as | its own examples show |
|---|---|---|
| `la mía` | a Moroccan colonial regiment | the possessive *mine* |
| `la anda` | a bier, a small platform | the verb *andas* |
| `la toca` | kerchief, turban cloth (so to say) | *toca* — plays, touch |
| `el corazones` | hearts (a suit of cards ♥) | plural *corazones*, hearts |
| `el diamantes` | diamonds (a suit ♦) | plural *diamantes*, diamonds |
| `vientos` | adverb, "synonym of *bien*" | the plural noun, winds |
| `cantidades` | adverb, "a lot" | the plural noun, quantities |
| `demonios` | adverb, "the hell" | the plural noun, demons |

`el corazones` and `el diamantes` are additionally ungrammatical: a masculine **singular** article
on a plural noun. Two things went wrong together — the word list let an inflected form through as a
lemma, and `sense_rank` then ranked a marginal sense first because it was the only sense the
inflected spelling had. `.claude/decks/check-senses.js` ranks all eight of these in its Spanish
output; they have simply never been worked through.

## 5. Two other content faults, small but real

- **`la china` (A2)** is glossed "pebble, small stone (usually rounded)" and illustrated with three
  sentences about **China the country**. Real word, wrong sense, and the wrong sense for a
  500-word A2 list.
- **Obscure senses printed beside the ordinary one.** `el aeropuerto` (A1) reads "airport; *a
  Peruvian dish based on fried rice with chicken eggs and various other ingredients*". `el abuelo,
  la abuela` (A1) reads "grandfather; *loose tufts of hair in the nape when one's hair is messed
  up*". These are the `limit=2` rule spending its second slot on the least useful thing in the
  entry — the mirror image of §1, where the second slot is what the useful sense needed.

## 6. Four decks state a card count they do not have

| deck | subtitle says | actually holds |
|---|---|---|
| DELE A1 | 500 words | **496** |
| DELE A2 | 500 more words | **499** |
| DELE B1 | 1,000 more words | **999** |
| DELE B2 | 2,000 more words | **1,999** |
| DELE C1 | 1,998 more words | 1,998 ✓ |
| DELE C2 | 2,000 more words | 2,000 ✓ |

C1 was corrected to its real figure at some point and the other four were not, which is what makes
this an inconsistency rather than rounding. `lang-decks.js` copies the subtitle verbatim, so the
Collections shelf repeats each wrong figure. Either restore the missing words or state the real
count, as C1 does.

## 7. One notable gap in the word list

**`bajo` appears in no Spanish deck at any level** — not as a preposition (*bajo la mesa*), not as
an adjective (*bajo, baja*), not as the noun. It is among the two hundred commonest words in
Spanish and it is in the A1 column of the *Plan curricular* under both *Nociones generales* and the
prepositions inventory. `guía` is likewise absent. Everything else on a 60-word core check is
present, so this is a small hole rather than a systematic one — but `bajo` is a conspicuous one.

---

## Ten ways to improve the collection

Ordered by what they buy per hour of work. The first four are the ones the audit says are worth
doing before anything else.

1. **Give the phrase matcher a word boundary** (§2). One line in `examples.py`, rebuild, and 129
   wrong sentences on 74 cards go away — including 17 cards on which every sentence is currently
   about a different word. This is the single highest-value fix in the collection and it is also the
   one whose absence is invisible on the page: a wrong example reads perfectly.

2. **Raise the sense limit and split the parentheses correctly** (§1). Three changes to
   `build_deck.py`, none large: `glosses_for(limit=2)` → 3–4 with the 96-character budget raised to
   roughly 140; `comma_parts` to refuse a split that leaves unbalanced brackets; `tidy` to truncate
   at a bracket boundary. That alone would restore *to turn off* to `apagar`, *the bill* to
   `la cuenta` and *doll* to `la muñeca`, and clear all 138 broken-parenthesis cards.

3. **Allow a second part of speech where the word really has one.** Not by removing the `break` —
   the comment defending it is right that most second records are junk — but by keeping a second
   POS when it clears a bar: the record has a non-regional, non-archaic sense **and** the headword's
   own example sentences contain a form that only that POS explains. `final`, `bajo`, `la capital`
   and `el frente` are the shape this is for, and the test is one the deck can run on itself,
   because the examples are already there.

4. **Work through `check-senses.js`'s Spanish list, top fifty.** The eight cards in §4 plus
   `la china` are all in it. That script is already written, already report-only, and has never been
   spent on this collection. Fifty cards is an afternoon and it removes every card whose gloss and
   examples are about different words.

5. **Say what a card actually has, instead of promising three examples** (§1). Two halves. Fix the
   four subtitles in §6 so the shelf stops overstating; and rewrite the `desc` sentence "Every word
   also carries three real example sentences" into what is true per deck — on C2 that is "most words
   carry example sentences; the rarest have none, because no open corpus contains them". A deck that
   states its own limits is the house rule everywhere else on the site (a book's `rights`, a map
   card's accessibility note); this is the one place the language decks do not follow it.

6. **De-duplicate near-neighbour examples** (§1). 191 cards show two sentences that differ by a name
   or a synonym. The picker already scores candidates; add a rejection when a candidate is >0.82
   similar to one already chosen, which is the same measure this audit used. It costs a little
   coverage on words with few sentences and buys a third slot that teaches something.

7. **Prefer a different inflected form for the third slot.** 1,587 cards show one form three times.
   The scorer knows each candidate's matched `form`; a modest bonus for a form not yet used would
   turn most of those into the three-different-forms the description already claims — and on a verb
   card, seeing *apago / apagó / apagando* across the three is most of what a conjugation table is
   for.

8. **Fill the empty folds from a second corpus.** 1,029 cards have no sentence, nearly all in C1 and
   C2. Tatoeba is exhausted at that level; the open options that would actually carry C-level
   vocabulary are Wiktionary's own usage examples (already in the `wikt.json` the pipeline loads,
   and currently unused for this) and OpenSubtitles. Wiktionary's are free — the data is on disk —
   and would want a translation, so they are best used as a Spanish-only "in use" line rather than a
   fourth kind of example.

9. **Fix the twelve month cards and the eight C2 inflected-form headwords** (§3, §4). Small, exact,
   and each is a card that currently teaches something wrong rather than something incomplete. The
   months want an `AUTHORED`-style override, which `build_deck.py` already has the machinery for.

10. **Add a `check-spanish.js` to the deck checkers.** Everything in this audit was measured with
    ad-hoc scripts; four of the six faults are exactly checkable and would never have reached the
    shelf with a guard: an example with no `<b>` mark (§2 — exact, not a proxy), a gloss with
    unbalanced parentheses (§1 — exact), a subtitle whose stated count differs from the note count
    (§6 — exact), and a singular article on a plural headword (§4 — exact). The other two are
    judgement. `.claude/decks/check-pinyin.js` is the model: it exists because the Mandarin inputs
    cannot be regenerated, and the same is true here for anyone who does not hold `spa_sent.tsv`.

Two more that are worth stating but did not make the ten, because each is a bigger decision than a
fix:

- **Audit the Phrases word list itself.** `sí soy` ("me relatable"), `tiempo ha`, `a mandar`,
  `quién va` and `hacerlo con` are real Wiktionary entries and are not among the 400 most useful
  Spanish expressions. Deciding what belongs in that deck is an editorial pass, not a script.
- **The speaker reads the article.** 3,723 cards' `data-say` opens on *el* or *la*, which is
  right for gender and wrong for the twelve months. The Mandarin decks solved the equivalent
  problem with a `Say` field on the type; the same escape hatch would serve here.

---

## How this was measured

Ad-hoc Python over the shipped `decks/*.folio-deck.json`, plus `node .claude/decks/check-senses.js
--deck=Spanish`. Nothing was run against the network and no deck was rebuilt. The counts are all
recomputable from the files as they stand; where a figure is a proxy rather than exact it says so
above. The example-mark test (§2) is exact: the pipeline's own marking stage is what declines to
bold a sentence that does not contain the word, so an unbolded example is evidence rather than
inference.
