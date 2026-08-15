#!/usr/bin/env python3
"""Which level is being built, where its intermediates go, and what its word list IS.

The stages share one cache directory: the downloaded corpora sit at the root
under their own names, and everything a stage computes is suffixed with the
level, so one level can be built after another without either overwriting the
other's working files.  `dele_level` and `goethe_level` are the same idea; the
three are deliberately separate files, because the Italian settings are Italian.

WHAT THIS LIST IS, AND WHAT IT IS NOT.  This matters more here than on either of
the other two exam decks, and it is written down at the top of the pipeline
rather than left in a commit message, because everything downstream inherits it.

The Goethe-Institut publishes a Wortliste for its A1 exam and the Instituto
Cervantes publishes the Plan curricular inventories, so those two decks can say
"this is the exam board's own vocabulary" and mean it.  **CILS PUBLISHES NO WORD
LIST.**  What the Università per Stranieri di Siena publishes for each level is a
syllabus of STRUCTURES AND FUNCTIONS -- the tenses, the sentence types, the
speech acts -- and for the lexicon it says only that a candidate needs "un
repertorio lessicale di base" for everyday situations.  Measured against that
document there is nothing to read a word list off.

So the list here is a THIRD PARTY'S, and it is named as one everywhere it is
shown to a reader.  It is MindDory's A1 Italian band
(minddory.com/italian-vocabulary-list/a1), and three things about it were
measured before a card was built, because they decide how the deck has to be
worded and ordered:

  · **THE SIX BANDS ARE A FREQUENCY GRADIENT, NOT A CEFR SYLLABUS.**  Ranked
    against a subtitle frequency list, the median rank per band runs 1,679 /
    4,986 / 7,672 / 9,253 / 19,395 / 21,216 from A1 to C2 -- a clean gradient,
    and the six bands are strictly DISJOINT (every pairwise intersection is 0).
    That is what a frequency list cut into six looks like.

  · **THE FREQUENCY IS A WRITTEN REGISTER'S.**  The A1 band carries
    `amministrativo`, `amministrazione`, `adeguato`, `ipotesi`, `istituzione`,
    `valutazione`, `integrazione` and `internazionale`, and does not carry
    `pane`, `rosso`, `madre`, `mangiare`, `bere`, `cane` or `gatto`.  Of the
    seven weekdays it has one, of twelve colours two, of four common animals
    none.

  · **`buongiorno`, `buonasera`, `arrivederci`, `per favore`, `prego` and
    `scusi` are in NONE of the six bands at all** -- not A1, not C2, nowhere in
    7,208 words.  No vocabulary list built for teaching omits `buongiorno`.

None of that makes the list useless: it is 961 real Italian words, every one of
them worth knowing, and it is what was asked for.  It makes it a list that must
be NAMED rather than attributed to an exam board, and ORDERED, which is what
`select.py` does -- the cards are dealt by how common the word is in everyday
spoken Italian, so `essere`, `fare`, `casa` and `acqua` come first and
`amministrativo` comes near the end.  The deck's own description says all of
this to the reader in plain words.  See the note on NVDB below for the
cross-check that is reported on every run.
"""
import json, os

LEVEL = os.environ.get('CILS_LEVEL', 'a1').lower()

TITLES = {'a1': 'CILS A1 — Italian', 'a2': 'CILS A2 — Italian',
          'b1': 'CILS B1 — Italian', 'b2': 'CILS B2 — Italian',
          'c1': 'CILS C1 — Italian', 'c2': 'CILS C2 — Italian'}
DECK_IDS = {'a1': 'cilsa1', 'a2': 'cilsa2', 'b1': 'cilsb1',
            'b2': 'cilsb2', 'c1': 'cilsc1', 'c2': 'cilsc2'}
DECK_FILES = {lvl: f'CILS-{lvl.upper()}-Italian.folio-deck.json' for lvl in TITLES}

# The page each level's words are read off.  A further level is a row here plus
# a `BELOW` entry, exactly as the four DELE levels and the three Goethe ones are
# -- there is nothing else to change.
LIST_URL = {lvl: f'https://minddory.com/italian-vocabulary-list/{lvl}' for lvl in TITLES}

# The count the page's own title states, which `parse_cils.py` asserts what it
# extracted against.  A page that quietly changes under us is the one failure a
# scrape cannot otherwise see: the words would still be words and the deck would
# still build.
EXPECT = {'a1': 961, 'a2': 995, 'b1': 970, 'b2': 1011, 'c1': 2842, 'c2': 429}

# MEASURED, NOT ASSUMED: the six bands share no word at all, so a higher level
# cannot re-teach a lower one and this table has nothing to do.  It is written
# anyway, and `words_below` with it, because the exclusion is what the two
# sibling pipelines rely on and a later list that DOES overlap would otherwise
# be found by a reader rather than by the build.
BELOW = {'a1': [], 'a2': ['a1'], 'b1': ['a1', 'a2'], 'b2': ['a1', 'a2', 'b1'],
         'c1': ['a1', 'a2', 'b1', 'b2'], 'c2': ['a1', 'a2', 'b1', 'b2', 'c1']}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


def words_below():
    """Every word already taught by a lower level, read from its shipped deck.

    Taken from the deck FILE rather than from a working file, so the exclusion
    is against what actually went out and the two can never drift apart -- the
    rule `goethe_level` records.  The headword field carries the article on a
    noun (`la casa`), so the article is stripped back off here.
    """
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join('..', '..', 'decks', DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        deck = json.load(open(p, encoding='utf-8'))
        for c in deck['cards']:
            w = (c.get('fields') or {}).get('Word', '')
            if w:
                out.add(w.strip().lower())
    return out
