#!/usr/bin/env python3
"""Which Navajo level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `NAVAJO_LEVEL` -- the
arrangement every pipeline here uses (`hausa_level`, `zulu_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  No exam board publishes a graded Navajo
word list, so, like the Hausa and Zulu decks, these are ASSEMBLED (the owner's
decision, 2026-11-16): a hand-written inventory of each level's topics
(`inventory.py`), then the commonest remaining words by lemma frequency in the
Navajo Wikipedia (`select.py`).  Each level is scoped to the Council of Europe's
CEFR global descriptor for its band, and the deck's description says both
things in plain words.  The plan is `docs/navajo-decks-plan.md`.

THE SIZES ARE HAUSA'S (A1 500, A2 750, B1 1,000; no B2 or C1), the owner's
choice.  English Wiktionary holds about 6,500 Navajo lemmas with real senses, so
the words are there; the corpus that orders them is small and encyclopaedic.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the alphabet deck's
title carries "Alphabet" and sorts before A1.
"""
import json, os

LEVEL = os.environ.get('NAVAJO_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate'}

TITLES = {k: f'Navajo {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'navajo{k}' for k in BANDS}
DECK_FILES = {k: f'Navajo-{k.upper()}.folio-deck.json' for k in BANDS}
TITLES['phr'] = 'Navajo Phrases and Expressions'
DECK_IDS['phr'] = 'nvphrase'
DECK_FILES['phr'] = 'Navajo-Phrases-and-Expressions.folio-deck.json'

# The owner's sizes (2026-11-16), in NOTES.
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000}

BELOW = {k: list(BANDS[:i]) for i, k in enumerate(BANDS)}
BELOW['phr'] = list(BANDS)

LEARNER = {'a1': 'a complete beginner', 'a2': 'a learner who has finished A1',
           'b1': 'a learner who has finished A2'}

SCOPE = {
    'a1': {
        'quote': 'Can understand and use familiar everyday expressions and very basic '
                 'phrases aimed at the satisfaction of needs of a concrete type',
        'gloss': 'able to introduce themselves and others, to ask and answer questions '
                 'about personal details such as where they live, people they know and '
                 'things they have, and to interact in a simple way provided the other '
                 'person talks slowly and clearly and is prepared to help',
        'topics': 'greetings and politeness, introducing yourself, family and kinship, '
                  'numbers, the times of day and the seasons, food and drink, animals, the '
                  'home and the town, the body and feeling ill, the weather and the land, '
                  'colours, the everyday verbs, and the pronouns, question words, '
                  'postpositions and particles every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to communicate in simple and routine tasks requiring a simple and '
                 'direct exchange of information on familiar and routine matters, and to '
                 'describe in simple terms their background, their immediate surroundings '
                 'and matters of immediate need',
        'topics': 'work and jobs, school, free time, ceremony and prayer, money and the town, '
                  'getting about, the home and the yard, clothes and jewellery, food and cooking, '
                  'the animals of the farm and the wild, the land and its plants, the weather, the '
                  'days and the months, directions, the body and feeling ill, feelings and character, '
                  'family and people, and the everyday verbs, describing words and adverbs a simple '
                  'account of one\'s day needs',
    },
}

def f(name):
    """A level's own intermediate: selected.json -> selected-a1.json."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from nv import norm
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            out.add(norm(c['fields']['Word']))
    return out
