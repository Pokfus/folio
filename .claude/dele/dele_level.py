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

TITLES = {'a1': 'DELE A1 — Spanish', 'a2': 'DELE A2 — Spanish'}
DECK_IDS = {'a1': 'delea1', 'a2': 'delea2'}
DECK_FILES = {'a1': 'DELE-A1-Spanish.folio-deck.json',
              'a2': 'DELE-A2-Spanish.folio-deck.json'}

# a level is taught on top of the ones below it, so their words are excluded
BELOW = {'a1': [], 'a2': ['a1']}


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
            # the headword carries its article; the word is what follows it
            parts = w.split(' ', 1)
            out.add(parts[1] if parts[0] in ('el', 'la', 'los', 'las',
                                             'el/la', 'los/las') and len(parts) > 1 else w)
    return out
