#!/usr/bin/env python3
"""Which Khmer level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `KHMER_LEVEL` -- the
arrangement every pipeline here uses (`thai_level`, `hindi_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  Cambodia publishes no graded word list for
learners of Khmer and no proficiency examination for foreigners was found that
publishes one, so -- like the Thai, Hindi, UKBI Indonesian and Amharic decks --
these decks are ASSEMBLED: a hand-written inventory of each level's topics
(`inventory.py`), then the commonest remaining words of Khmer by their count in
the Khmer Wikipedia (`select.py`).  Each level is scoped to the Council of
Europe's CEFR global descriptor for its band, and the deck's description says both
things in plain words.  The plan is `docs/khmer-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the script deck's
title carries "Alphabet" and sorts before A1.
"""
import json, os

LEVEL = os.environ.get('KHMER_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Khmer {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'khmer{k}' for k in BANDS}
DECK_FILES = {k: f'Khmer-{k.upper()}.folio-deck.json' for k in BANDS}

# Sizes in NOTES -- the Thai and Hindi sets', the closest precedents (assembled lists).
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
        'topics': 'greetings and the polite yes of a man and of a woman, introducing yourself, '
                  'family and the words for older and younger, numbers and the classifiers they '
                  'are counted with, telling the time, days and months, food and drink, shopping '
                  'and money, the home, the town and getting about, the body and feeling ill, the '
                  'weather, colours, and the pronouns, question words, prepositions and '
                  'conjunctions every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to manage simple, routine exchanges of information on familiar matters '
                 '— personal and family information, shopping, the local area, work — and to '
                 'describe in simple terms their background, their surroundings and what they '
                 'immediately need',
        'topics': 'relatives and the people around you, jobs, work and study, clothes, cooking and '
                  'more food, the furniture of a home, the town and its buildings, travel and '
                  'directions, nature and animals, the rainy and the dry season, health and the body, '
                  'feelings and character, free time, sport and festivals, telling what happened and '
                  'when, comparing and giving an opinion, phones and the internet, measures, and the '
                  'everyday verbs of moving, dressing and doing',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to produce '
                 'simple connected text on familiar topics, and to describe experiences and '
                 'events, dreams, hopes and ambitions, and briefly give reasons and explanations '
                 'for opinions and plans',
        'topics': 'work and careers, money, banking and the economy, education, the news, media '
                  'and technology, government, law and society, the environment, health and '
                  'medicine, travel and accommodation, the household, relationships and the stages '
                  'of life, feelings and character, religion, Buddhism and Cambodian custom, the '
                  'nouns for ideas, reasons and plans, the connectors that join sentences, and the '
                  'verbs of thinking, deciding and changing',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every word a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from km import key
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
