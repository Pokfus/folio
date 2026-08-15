#!/usr/bin/env python3
"""Which level is being built, and where its intermediates go.

The stages share one cache directory: the four downloaded corpora sit at the
root under their own names, and everything a stage computes is suffixed with
the level, so A1 and A2 can be built one after the other without either
overwriting the other's working files.
"""
import json, os

LEVEL = os.environ.get('DELE_LEVEL', 'a1').lower()

# the column of the Plan curricular this level reads.  Both levels live on the
# same two pages, as an A1 column beside an A2 one.
COLUMN = LEVEL

TITLES = {'a1': 'DELE A1 — Spanish', 'a2': 'DELE A2 — Spanish',
          'b1': 'DELE B1 — Spanish', 'b2': 'DELE B2 — Spanish',
          'c1': 'DELE C1 — Spanish', 'c2': 'DELE C2 — Spanish',
          'ph': 'Spanish Phrases and Expressions'}
DECK_IDS = {'a1': 'delea1', 'a2': 'delea2', 'b1': 'deleb1', 'b2': 'deleb2',
            'c1': 'delec1', 'c2': 'delec2', 'ph': 'esphrases'}

# what a card files itself under.  The six levels are a DELE level; the phrases
# deck is not a level at all and must not claim to be one.
CATEGORIES = {'ph': 'Spanish phrases'}
DECK_FILES = {'a1': 'DELE-A1-Spanish.folio-deck.json',
              'a2': 'DELE-A2-Spanish.folio-deck.json',
              'b1': 'DELE-B1-Spanish.folio-deck.json',
              'b2': 'DELE-B2-Spanish.folio-deck.json',
              'c1': 'DELE-C1-Spanish.folio-deck.json',
              'c2': 'DELE-C2-Spanish.folio-deck.json',
              'ph': 'Spanish-Phrases.folio-deck.json'}

# a level is taught on top of the ones below it, so their words are excluded.
# The phrases deck sits on top of all six, which is what stops it re-teaching
# the multi-word items the levels already carry -- B2 is built partly on
# connectives like `por consiguiente`, and C1 teaches `hacer falta`.
BELOW = {'a1': [], 'a2': ['a1'], 'b1': ['a1', 'a2'], 'b2': ['a1', 'a2', 'b1'],
         'c1': ['a1', 'a2', 'b1', 'b2'],
         'c2': ['a1', 'a2', 'b1', 'b2', 'c1'],
         'ph': ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']}

# HOW MANY WORDS the level teaches.  A1 and A2 are 500 apiece; B1 is the CEFR's
# own step up -- it is where a learner goes from surviving to holding a
# conversation -- and its column of the inventory is more than twice the size of
# A2's, so it carries 1,000.  B2 doubles again, which is what the jump from
# holding a conversation to arguing a case actually costs.
#
# THE DOUBLING STOPS AT C1, AND THAT IS READ OFF THE INVENTORY RATHER THAN
# ASSUMED.  Continuing it would give C1 4,000 words and C2 8,000, and the
# Cervantes columns do not support anything like that: measured over the two
# Nociones pages, B2's column is 1,735 cells and 4,847 candidate lemmas against
# C1's 1,988 / 6,011 and C2's 1,968 / 6,497.  The C columns are B2's size again,
# not twice and four times it -- which is what the CEFR itself describes, the C
# levels being mostly a deepening of what is already held rather than another
# doubling of the vocabulary.  So the series flattens: 500, 500, 1,000, 2,000,
# 2,000, 2,000, and 8,000 words in all.
#
# The phrases deck is not a level and its size is not a syllabus judgement: it
# is how far down the corpus count the expressions are still ones a learner
# meets.  See `phrases.py`.
TARGET = {'a1': 500, 'a2': 500, 'b1': 1000, 'b2': 2000,
          'c1': 2000, 'c2': 2000, 'ph': 400}

# the two Nociones pages this level's column is printed on.  A1 and A2 share a
# page, B1 and B2 share the next, and C1 and C2 the last.
PAGES = {'a1': 'a1a2', 'a2': 'a1a2', 'b1': 'b1b2', 'b2': 'b1b2',
         'c1': 'c1c2', 'c2': 'c1c2'}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


def words_below():
    """Every word already taught by a lower level, read from its shipped deck.

    Taken from the deck FILE rather than from a working file, so the exclusion
    is against what actually went out -- there is no way for the two to drift,
    and a rebuilt A2 cannot start teaching a word A1 already covers.
    """
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join('..', '..', 'decks', DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        deck = json.load(open(p, encoding='utf-8'))
        for c in deck['cards']:
            w = (c.get('fields') or {}).get('Spanish', '')
            # A headword may carry TWO words -- `el nino, la nina` -- and both
            # are taught, so both are excluded.  Reading only the first would
            # let A2 re-teach a feminine A1 already covers.
            for half in w.split(', '):
                parts = half.split(' ', 1)
                out.add(parts[1] if parts[0] in ('el', 'la', 'los', 'las',
                                                 'el/la', 'los/las') and len(parts) > 1
                        else half)
    return out
