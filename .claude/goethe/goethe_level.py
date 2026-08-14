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

TITLES = {'a1': 'Goethe A1 — German', 'a2': 'Goethe A2 — German'}
DECK_IDS = {'a1': 'goethea1', 'a2': 'goethea2'}
DECK_FILES = {'a1': 'Goethe-A1-German.folio-deck.json',
              'a2': 'Goethe-A2-German.folio-deck.json'}

# The Wortliste each level is read from, published by the Goethe-Institut.  B1
# has a list of its own and would take a row apiece in these tables, plus a
# `BELOW` entry so a level is taught on top of the ones under it, exactly as the
# four DELE levels are.
WORTLISTE = {
    'a1': ('goethe_a1.pdf',
           'https://www.goethe.de/pro/relaunch/prf/en/A1_SD1_Wortliste_02.pdf'),
    'a2': ('goethe_a2.pdf',
           'https://www.goethe.de/pro/relaunch/prf/de/'
           'GoetheZertifikat_A2_Wortliste.pdf'),
}

# A2's list REPEATS the A1 vocabulary -- `aus`, `und`, `was` and several hundred
# more are printed in both -- so without this the second deck would teach a
# third of the first one over again.
BELOW = {'a1': [], 'a2': ['a1']}

# WHERE THE WORDS ARE ON THE PAGE, and it is not the same shape twice.  The A1
# list is ONE pair of columns, a headword at x 143-233 and its example from 237;
# the A2 list is TWO pairs side by side on a wider measure, so a page reads down
# the left pair and then down the right, and a rule written for one list finds
# half of the other.  Measured off the x histogram of every list page rather
# than guessed, which is what `COLUMN_X = 236` records for A1 (a threshold at
# the obvious 230 truncates `die Sehenswürdigkeit, -en`, whose `-en` sits at
# 233).  A2's four columns are 35-99, 105-289, 303-369 and 373 on.
LIST_PAGES = {'a1': range(8, 27), 'a2': range(7, 31)}
HEAD_COLUMNS = {'a1': [(0, 236)], 'a2': [(30, 100), (300, 370)]}

# A1 indents its "ableitbare Nebeneinträge" five points; A2 has no such level --
# its Vorwort says derivable compounds are left out altogether rather than
# printed as sub-entries -- and every headword on its pages starts at the
# column's own x, measured.  None means the whole list is main entries.
SUB_INDENT = {'a1': 146, 'a2': None}

GROUP_PAGES = {'a1': range(5, 8), 'a2': range(4, 7)}

# Whether a line OPENING on a bracket can be the continuation of the line above.
# In A2 eighteen of them are -- `(Sg.)`, `(sich),`, `(z. B. Feierabend,` -- and
# four are headwords, a verb with an optional prefix.  In A1 there is no such
# continuation anywhere: every bracketed line is a headword, the eight `(sich)
# anziehen` reflexives and `(Kredit)-Karte, -n`.  So the rule is gated here
# rather than made cleverer, which keeps it inert on A1 BY CONSTRUCTION instead
# of by a re-run -- both of A1's shapes were swallowed by earlier attempts at a
# single predicate.
BRACKET_CONT = {'a1': False, 'a2': True}

# page furniture that sits inside a headword column and is not a word
FURNITURE = {
    'a1': (r'^213082|^Alphabetische$|^wortliste$',),
    'a2': (r'^625050|^WORTLISTE$|^\d+ WORTLISTE$|^WORTLISTE \d+$'
           r'|^GOETHE-ZERTIFIKAT|^ALPHABETISCHER',),
}


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
