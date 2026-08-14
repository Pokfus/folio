#!/usr/bin/env python3
"""Which level is being built, and where its intermediates go.

The stages share one cache directory: the downloaded corpora sit at the root
under their own names, and everything a stage computes is suffixed with the
level, so one level can be built after another without either overwriting the
other's working files.  The DELE pipeline's `dele_level` is the same idea; the
two are deliberately separate files, because the German settings are German.
"""
import json, os

LEVEL = os.environ.get('GOETHE_LEVEL', 'a1').lower()

TITLES = {'a1': 'Goethe A1 — German'}
DECK_IDS = {'a1': 'goethea1'}
DECK_FILES = {'a1': 'Goethe-A1-German.folio-deck.json'}

# The Wortliste each level is read from, published by the Goethe-Institut.  A1
# is the only one shipped so far; A2 and B1 have lists of their own and would
# take a row apiece here, plus a `BELOW` entry so a level is taught on top of
# the ones under it, exactly as the four DELE levels are.
WORTLISTE = {
    'a1': ('goethe_a1.pdf',
           'https://www.goethe.de/pro/relaunch/prf/en/A1_SD1_Wortliste_02.pdf'),
}

BELOW = {'a1': []}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


def words_below():
    """Every word already taught by a lower level, read from its shipped deck.

    Taken from the deck FILE rather than from a working file, so the exclusion
    is against what actually went out and the two can never drift apart.  A1 is
    the bottom of the ladder and has nothing below it; the function is written
    now so that adding A2 is a table row rather than a new idea.
    """
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join('..', '..', 'decks', DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        deck = json.load(open(p, encoding='utf-8'))
        for c in deck['cards']:
            w = (c.get('fields') or {}).get('German', '')
            for half in w.split(', '):
                parts = half.split(' ', 1)
                out.add(parts[1] if parts[0] in ('der', 'die', 'das', 'der/die')
                        and len(parts) > 1 else half)
    return out
