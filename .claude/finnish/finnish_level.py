#!/usr/bin/env python3
"""Which Finnish level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `FINNISH_LEVEL` --
the arrangement every pipeline here uses (`hungarian_level`, `greek_level`).
Every intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  Finnish has an examination graded to the
CEFR (the National Certificates of Language Proficiency, YKI, levels 1-6), but
no graded word list for it was found published, so these decks do not claim to
be any exam's vocabulary.  Like the Hungarian, Greek and Hindi decks they are
ASSEMBLED: a hand-written inventory of each level's topics (`inventory.py`),
then the commonest remaining words of everyday Finnish by lemma frequency
(`select.py`).  Each level is scoped to the Council of Europe's CEFR global
descriptor for its band, and the deck's description says both things in plain
words.  The plan is `docs/finnish-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the alphabet deck's
title carries "Alphabet" and sorts before A1.
"""
import json, os

LEVEL = os.environ.get('FINNISH_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Finnish {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'finnish{k}' for k in BANDS}
DECK_FILES = {k: f'Finnish-{k.upper()}.folio-deck.json' for k in BANDS}

# The Hungarian sizes, in NOTES (the plan, §1).
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
                  'weather and the seasons, colours, and the pronouns, question words, '
                  'postpositions and particles every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to manage simple, routine exchanges of information on familiar matters '
                 '— personal and family information, shopping, the local area, work — and to '
                 'describe in simple terms their background, their surroundings and what they '
                 'immediately need',
        'topics': 'relatives and the people around you, jobs and study, clothes, more food and '
                  'cooking, the rooms and furniture of a home, the town and its services, travel '
                  'and holidays, nature, the seasons and the compass, animals, health and the '
                  'body, feelings and character, free time and sport, telling what happened '
                  'when, the higher numbers and measures, and the everyday verbs of moving, '
                  'dressing, cooking and doing',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from fi import fold
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
