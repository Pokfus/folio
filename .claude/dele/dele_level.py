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
          'b1': 'DELE B1 — Spanish', 'b2': 'DELE B2 — Spanish'}
DECK_IDS = {'a1': 'delea1', 'a2': 'delea2', 'b1': 'deleb1', 'b2': 'deleb2'}
DECK_FILES = {'a1': 'DELE-A1-Spanish.folio-deck.json',
              'a2': 'DELE-A2-Spanish.folio-deck.json',
              'b1': 'DELE-B1-Spanish.folio-deck.json',
              'b2': 'DELE-B2-Spanish.folio-deck.json'}

# a level is taught on top of the ones below it, so their words are excluded
BELOW = {'a1': [], 'a2': ['a1'], 'b1': ['a1', 'a2'], 'b2': ['a1', 'a2', 'b1']}

# HOW MANY WORDS the level teaches.  A1 and A2 are 500 apiece; B1 is the CEFR's
# own step up -- it is where a learner goes from surviving to holding a
# conversation -- and its column of the inventory is more than twice the size of
# A2's, so it carries 1,000.  B2 doubles again, which is what the jump from
# holding a conversation to arguing a case actually costs.
TARGET = {'a1': 500, 'a2': 500, 'b1': 1000, 'b2': 2000}

# the two Nociones pages this level's column is printed on.  A1 and A2 share a
# page, and so do B1 and B2.
PAGES = {'a1': 'a1a2', 'a2': 'a1a2', 'b1': 'b1b2', 'b2': 'b1b2'}


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
