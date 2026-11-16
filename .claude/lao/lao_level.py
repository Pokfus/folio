#!/usr/bin/env python3
"""Which Lao level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `LAO_LEVEL` -- the
arrangement every pipeline here uses (`thai_level`, `hindi_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  No examination of Lao for foreigners
publishes a graded word list, so -- like the Thai, Hindi and UKBI Indonesian
decks -- these decks are ASSEMBLED: a hand-written inventory of each level's
topics (`inventory.py`), then the commonest remaining words of Lao by their
count in Lao Wikipedia (`select.py`).  Each level is scoped to the Council of
Europe's CEFR global descriptor for its band, and the deck's description says
both things in plain words.  The plan is `docs/lao-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the script deck's
title carries "Alphabet" and sorts before A1.
"""
import json, os

LEVEL = os.environ.get('LAO_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Lao {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'lao{k}' for k in BANDS}
DECK_FILES = {k: f'Lao-{k.upper()}.folio-deck.json' for k in BANDS}

# Sizes in NOTES, the Thai set's.  Wiktionary holds some 2,400 Lao words in all
# (Thai's 21,000): after A1 about 1,530 usable ones were left, enough for A2's
# 750.  After A2 about 780 were left, 84 of them compound numbers and many plant species,
# lunar months and variant spellings, so B1's cap is 500, not Thai's 1,000 -- and it is not
# reached: the frequency fill runs dry, so B1 is every usable word left that its inventory
# or the fill can deal.  It is the last level Wiktionary can fill (docs/lao-decks-plan.md §5).
TARGET = {'a1': 500, 'a2': 750, 'b1': 500}

BELOW = {k: list(BANDS[:i]) for i, k in enumerate(BANDS)}

SCOPE = {
    'a1': {
        'quote': 'Can understand and use familiar everyday expressions and very basic '
                 'phrases aimed at the satisfaction of needs of a concrete type',
        'gloss': 'able to introduce themselves and others, to ask and answer questions '
                 'about personal details such as where they live, people they know and '
                 'things they have, and to interact in a simple way provided the other '
                 'person talks slowly and clearly and is prepared to help',
        'topics': 'greetings and the polite words, introducing yourself, family, numbers '
                  'and the classifiers they are counted with, telling the time, days and '
                  'months, food and drink, shopping and money, the home, the town and getting '
                  'about, the body and feeling ill, the weather, colours, and the pronouns, '
                  'question words, prepositions and conjunctions every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to manage simple, routine exchanges of information on familiar matters '
                 '— personal and family information, shopping, the local area, work — and to '
                 'describe in simple terms their background, their surroundings and what they '
                 'immediately need',
        'topics': 'relatives and the people around you, jobs, work and study, clothes, more food, '
                  'cooking and eating out, the things of a home, the town and its buildings, '
                  'travel and directions, the countryside, nature, weather and animals, the seasons, '
                  'health and the body, feelings and character, free time, sport and festivals, '
                  'money, tools, telling what happened and comparing, and the everyday verbs of '
                  'moving, dressing and doing',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to produce '
                 'simple connected text on familiar topics, and to describe experiences and '
                 'events, dreams, hopes and ambitions, and briefly give reasons and explanations '
                 'for opinions and plans',
        'topics': 'work, money and society, the law and crime, education, media and technology, '
                  'the parts of the body and illness, the home and its everyday objects, more food, '
                  'nature, weather and animals, travel, Buddhism, festivals and Lao customs, feelings '
                  'and character, and the verbs of doing and changing',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every word a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from lo import fold
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
