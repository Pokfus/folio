#!/usr/bin/env python3
"""Which Amharic level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `AMHARIC_LEVEL` -- the
arrangement every pipeline here uses (`zulu_level`, `hindi_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  No exam board publishes a graded Amharic
word list, so, like the Zulu, Hausa and Hindi decks, these decks are ASSEMBLED: a
hand-written inventory of each level's topics (`inventory.py`), then the
commonest remaining words by lemma frequency (`select.py`).  Each level is scoped
to the Council of Europe's CEFR global descriptor for its band, and the deck's
description says both things in plain words.  THREE LEVELS, A1 to B1, at the
Zulu and Hausa sizes: English Wiktionary holds about 2,300 Amharic words, and
A1 + A2 + B1 (500 + 750 + 1,000) would use most of them; there is no source here
for a B2 or a C1.  B1 IS SHORT OF ITS 1,000 (about 500): that is what the source
has left after A2 (`docs/amharic-decks-plan.md` §6).  The plan is `docs/amharic-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule.
"""
import json, os

LEVEL = os.environ.get('AMHARIC_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate'}

TITLES = {k: f'Amharic {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'amharic{k}' for k in BANDS}
DECK_FILES = {k: f'Amharic-{k.upper()}.folio-deck.json' for k in BANDS}

# In NOTES (the Zulu and Hausa sizes).
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000}

BELOW = {k: list(BANDS[:i]) for i, k in enumerate(BANDS)}

SCOPE = {
    'a1': {
        'quote': 'Can understand and use familiar everyday expressions and very basic '
                 'phrases aimed at the satisfaction of needs of a concrete type',
        'gloss': 'able to introduce themselves and others, to ask and answer questions '
                 'about personal details such as where they live, people they know and '
                 'things they have, and to interact in a simple way provided the other '
                 'person talks slowly and clearly and is prepared to help',
        'topics': 'greetings and politeness, people and the family, numbers, time and the '
                  'days of the week, food and drink, money and shopping, the home, the town '
                  'and getting about, the body and feeling ill, the weather, colours, animals, '
                  'school and work, the everyday verbs, and the pronouns, question words and '
                  'joining words every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to manage simple, routine exchanges of information on familiar matters '
                 '— personal and family information, shopping, the local area, work — and to '
                 'describe in simple terms their background, their surroundings and what they '
                 'immediately need',
        'topics': 'the months of the Ethiopian calendar, clothes, work and jobs, relatives and the '
                  'stages of life, feelings, travel, the countryside and the weather, the body and '
                  'health, food and the kitchen, the things of a home, talking and deciding, the '
                  'everyday verbs of doing, describing things, and the feasts and the faith',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to produce '
                 'simple connected text on familiar topics, and to describe experiences and '
                 'events, dreams, hopes and ambitions, and briefly give reasons and explanations '
                 'for opinions and plans',
        'topics': 'health and the body, the home and the table, money and doing things, the '
                  'world about us, and describing people and things',
    },
}

WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner'}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma key a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from am import key
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            w = (c.get('fields') or {}).get('Word', '')
            if w:
                out.add(key(w))
    return out
