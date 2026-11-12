#!/usr/bin/env python3
"""Which Swedish level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `SWEDISH_LEVEL` -- the
arrangement every pipeline here uses (`greek_level`, `hindi_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  Swedish has examinations at these levels
-- Swedex (A2-B2) and Tisus (C1), and the Swedish for Immigrants courses -- but
no graded word list was found published for any of them, so these decks do not
claim to be their vocabulary.  Like the Greek, Hindi and TORFL Russian decks
they are ASSEMBLED: a hand-written inventory of each level's topics
(`inventory.py`), then the commonest remaining words of everyday Swedish by
lemma frequency (`select.py`).  Each level is scoped to the Council of Europe's
CEFR global descriptor for its band, and the deck's description says both
things in plain words.  The plan is `docs/swedish-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule.
"""
import json, os

LEVEL = os.environ.get('SWEDISH_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Swedish {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'swedish{k}' for k in BANDS}
DECK_FILES = {k: f'Swedish-{k.upper()}.folio-deck.json' for k in BANDS}

# The Hindi and Greek sizes, in NOTES (the plan, §1).
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000, 'b2': 1500, 'c1': 1500}

BELOW = {k: list(BANDS[:i]) for i, k in enumerate(BANDS)}

SCOPE = {
    'a1': {
        'quote': 'Can understand and use familiar everyday expressions and very basic '
                 'phrases aimed at the satisfaction of needs of a concrete type',
        'gloss': 'able to introduce themselves and others, to ask and answer questions '
                 'about personal details such as where they live, people they know and '
                 'things they have, and to interact in a simple way provided the other '
                 'person talks slowly and clearly and is prepared to help',
        'topics': 'greetings and politeness, introducing yourself, family, numbers, '
                  'telling the time, days and months, food and drink, shopping and money, '
                  'the home, the town and getting about, the body and feeling ill, the '
                  'weather, colours, and the pronouns, question words, prepositions and '
                  'little words every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas of '
                 'most immediate relevance',
        'gloss': 'able to communicate in simple and routine tasks requiring a simple and direct '
                 'exchange of information on familiar and routine matters, and to describe in '
                 'simple terms aspects of their background, immediate environment and matters '
                 'in areas of immediate need',
        'topics': 'the seasons and dates, more numbers, the land and nature, the weather, animals, '
                  'clothes, the home and the kitchen, food and cooking, work and jobs, school, '
                  'travel and transport, the town, health, feelings, free time, the everyday verbs '
                  'of these, describing things and people, time words, and the words that join '
                  'one clause to the next',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from sv import fold
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            w = (c.get('fields') or {}).get('Word', '')
            if w:
                out.add(fold(w))
    return out
