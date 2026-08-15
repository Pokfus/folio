#!/usr/bin/env python3
"""Which UKBI level is being built, and where its intermediates go.

THE LEVELS ARE NUMBERED FROM THE BOTTOM, which is the opposite of how UKBI
itself prints them.  UKBI reports a *peringkat* I–VII from the TOP down, so
Istimewa is peringkat I and Terbatas is peringkat VII.  A learner meets them the
other way round -- Terbatas is where you start -- so the decks are numbered in
the order they are studied and the predicate's own name is carried in the title,
which is the thing a candidate actually quotes.  `UKBI 1 Terbatas` is peringkat
VII, score 251-325.

The stages share one cache directory: the downloaded corpora sit at the root
under their own names and everything a stage computes is suffixed with the
level, so two levels can be built one after the other without either
overwriting the other's working files.
"""
import json, os

LEVEL = os.environ.get('UKBI_LEVEL', '1')

# The seven predicates, bottom-up.  Only level 1 is built today; the rest are
# here so that the exclusion table below has something to name, and so that
# nobody has to guess the order later.  The score bands are UKBI's own
# (ukbi.kemendikdasmen.go.id/front-new/page/predikat).
PREDICATES = {
    '1': ('Terbatas',      'VII', '251-325'),
    '2': ('Marginal',      'VI',  '326-404'),
    '3': ('Semenjana',     'V',   '405-481'),
    '4': ('Madya',         'IV',  '482-577'),
    '5': ('Unggul',        'III', '578-640'),
    '6': ('Sangat Unggul', 'II',  '641-724'),
    '7': ('Istimewa',      'I',   '725-800'),
}

# WHAT EACH LEVEL IS FOR, IN THE BOARD'S OWN WORDS.  This is a table rather than
# prose in `emit.py` because of the fault it exists to fix: that file was written
# for level 1 and templated only the NAME and the NUMBERS, so levels 2 and 3
# shipped calling themselves "the first and most basic level of the UKBI", saying
# each was "the lowest of them", and quoting **Terbatas's descriptor verbatim
# under their own names** -- "untuk keperluan sintas", survival, against a
# predicate whose own descriptor says something else entirely.  Nothing threw and
# every count was right; a description is simply prose, and prose written once
# for one level goes on being printed for every level after it.  **A deck's
# description is the one place that has to state true things about the deck.**
#
# `quote` is the short distinctive phrase of that predicate's descriptor, taken
# verbatim from ukbi.kemendikdasmen.go.id/front-new/page/predikat -- short on
# purpose, because an ellipsis-joined quotation of a paragraph is a quotation
# nobody can check.  `gloss` is the plain-English reading of the whole
# descriptor, `topics` a summary of what THIS level's inventory in
# `supplement.py` actually covers, and `rank` where the predicate sits.
SCOPE = {
    '1': {
        'rank': 'the lowest of the seven',
        'quote': 'hanya mampu berkomunikasi untuk keperluan sintas',
        'gloss': 'able to communicate for survival purposes and no further',
        'topics': 'greetings and politeness, numbers, days and months, telling the '
                  'time, family, food and drink, money and shopping, getting about, '
                  'health and the body, and the closed classes of pronouns, question '
                  'words, prepositions and conjunctions',
    },
    '2': {
        'rank': 'the second from the bottom',
        'quote': 'keperluan kemasyarakatan yang sederhana',
        'gloss': 'not yet adequately proficient: able to manage simple community purposes, '
                 'but unready for complex ones, for any professional purpose, and for '
                 'academic purposes at all',
        'topics': 'describing people, how you feel, the home and what is in it, clothes, '
                  'food, shopping and errands, travelling, health, the weather and the '
                  'natural world, telling a story in order, and giving an opinion',
    },
    '3': {
        'rank': 'the third from the bottom',
        'quote': 'keperluan keprofesian yang tidak kompleks',
        'gloss': 'reasonably proficient: able to communicate for survival, for non-complex '
                 'professional and for non-complex community purposes, while in academic '
                 'communication — the descriptor adds — still "sangat terkendala", very '
                 'much constrained',
        'topics': 'having a job and the trades people work in, the paperwork of an '
                  'office, money at a bank, the state and its offices, getting in touch, '
                  'renting somewhere to live, arranging a journey, being treated, and the '
                  'abstract and connective vocabulary a paragraph is built out of',
    },
}

TITLES = {k: f'UKBI {k} {v[0]} — Indonesian' for k, v in PREDICATES.items()}
DECK_IDS = {k: f'ukbi{k}' for k in PREDICATES}
DECK_FILES = {k: f'UKBI-{k}-{v[0]}-Indonesian.folio-deck.json'
              for k, v in PREDICATES.items()}

# a level is taught on top of the ones below it, so their words are excluded
BELOW = {k: [str(i) for i in range(1, int(k))] for k in PREDICATES}

# HOW MANY WORDS THE LEVEL TEACHES, and this is a decision rather than a figure
# read off anything.  UKBI publishes no vocabulary syllabus at all -- see the
# header of `select.py` -- so there is no list whose length could set this.  What
# the level's own descriptor says is that a candidate at Terbatas "hanya mampu
# berkomunikasi untuk keperluan sintas": able to communicate for SURVIVAL
# purposes and no further.  500 is the size at which a survival vocabulary is
# actually covered -- it is what the sibling A1 decks on this shelf carry (DELE
# A1, and the Goethe A1 list comes to 785) -- and the deck's own description
# says outright that the number is chosen here and not by an exam board.
TARGET = {'1': 500, '2': 750, '3': 1000, '4': 1500, '5': 2000, '6': 2500, '7': 3000}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


def words_below():
    """Every word already taught by a lower level, read from its shipped deck.

    Taken from the deck FILE rather than from a working file, so the exclusion
    is against what actually went out -- there is no way for the two to drift,
    and a rebuilt level cannot start teaching a word a lower one already covers.

    A headword may carry a whole affix family in its `Forms` field (kirim /
    mengirim / dikirim).  Only the HEADWORD is excluded, deliberately: the forms
    are shown beside the word rather than taught as cards of their own, so a
    higher level is still free to teach one of them in its own right if the
    frequency says a learner meets it as a separate lexeme.
    """
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join('..', '..', 'decks', DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'level {LEVEL} is built on {lvl}, but {p} is missing')
        deck = json.load(open(p, encoding='utf-8'))
        for c in deck['cards']:
            w = (c.get('fields') or {}).get('Word', '')
            if w:
                out.add(w)
    return out
