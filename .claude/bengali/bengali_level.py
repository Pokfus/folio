#!/usr/bin/env python3
"""Which Bengali level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `BENGALI_LEVEL` -- the
arrangement every pipeline here uses (`hindi_level`, `torfl_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  Bengali has no exam board that publishes
a graded word list for learners, so, like the Hindi, UKBI Indonesian and TORFL
Russian decks, these decks are ASSEMBLED: a hand-written inventory of each
level's topics (`inventory.py`), then the commonest remaining words of everyday
Bengali by lemma frequency (`select.py`).  Each level is scoped to the Council
of Europe's CEFR global descriptor for its band, and the deck's description
says both things in plain words.  The plan is `docs/bengali-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the script deck's
title carries "Alphabet" and sorts before A1 by the rule Russian added.
"""
import json, os

LEVEL = os.environ.get('BENGALI_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Bengali {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'bengali{k}' for k in BANDS}
DECK_FILES = {k: f'Bengali-{k.upper()}.folio-deck.json' for k in BANDS}
TITLES['phr'] = 'Bengali Phrases and Expressions'
DECK_IDS['phr'] = 'bnphrase'
DECK_FILES['phr'] = 'Bengali-Phrases-and-Expressions.folio-deck.json'

# The Hindi set's sizes (the owner's, 2026-11-09), kept for the sister collection.
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000, 'b2': 1500, 'c1': 1500}

BELOW = {k: list(BANDS[:i]) for i, k in enumerate(BANDS)}
BELOW['phr'] = list(BANDS)

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
                  'weather, colours, and the pronouns, question words, postpositions and '
                  'conjunctions every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to manage simple, routine exchanges of information on familiar matters '
                 '— personal and family information, shopping, the local area, work — and to '
                 'describe in simple terms their background, their surroundings and what they '
                 'immediately need',
        'topics': 'relatives and the people around you, work and study, clothes and shopping, '
                  'more food and cooking, the furniture of a home, the town, the countryside, '
                  'the seasons and the points of the compass, travel, health and the body, '
                  'feelings and character, free time, telling what happened and when, giving an '
                  'opinion, the months and the numbers to a crore, and the everyday verbs of '
                  'moving, dressing and doing',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to produce '
                 'simple connected text on familiar topics, and to describe experiences, events, '
                 'dreams, hopes and ambitions and briefly give reasons and explanations for '
                 'opinions and plans',
        'topics': 'work and careers, education and learning, the news, the media and the arts, '
                  'computers and the internet, nature, the weather and the environment, society, '
                  'politics and the law, money and services, health and lifestyle, travel and '
                  'getting about, feelings and relationships, ideas, opinions and reasons, the '
                  'words that connect an argument, describing, and the verbs of doing, including '
                  'the common multi-word verbs',
    },
    'b2': {
        'quote': 'Can understand the main ideas of complex text on both concrete and abstract '
                 'topics, including technical discussions in their field of specialisation',
        'gloss': 'able to interact with a degree of fluency and spontaneity that makes regular '
                 'interaction with native speakers quite possible without strain for either party, '
                 'and to produce clear, detailed text on a wide range of subjects and explain a '
                 'viewpoint on a topical issue, giving the advantages and disadvantages of various '
                 'options',
        'topics': 'business and the economy, politics, the law and society, science and '
                  'technology, language and the arts, the mind and character, the words of argument '
                  'and evaluation, the land and the environment, health and the body, more precise '
                  'description, how and when things happen, and verbs of action',
    },
    'c1': {
        'quote': 'Can understand a wide range of demanding, longer texts, and recognise implicit '
                 'meaning',
        'gloss': 'able to express themselves fluently and spontaneously without much obvious '
                 'searching for expressions, to use language flexibly and effectively for social, '
                 'academic and professional purposes, and to produce clear, well-structured, '
                 'detailed text on complex subjects',
        'topics': 'scholarship and the study of language and mind, the state, the law and public '
                  'life, ideas and political movements, administration, society and the workplace, '
                  'character and judgement, argument and degree, the land, the weather and the '
                  'measure of the world, health and the body, feeling, everyday things, and the '
                  'formal register of written Bengali',
        # WHY C1 IS SMALLER THAN THE PLAN'S 1,500 (the owner's choice, 2026-11-12): the subtitle
        # list runs out of words the levels below have not taught, and what Wiktionary has left
        # is mostly plant names, dialect and archaic literary words.  Nothing was padded in.
        'note': 'This level is smaller than the 1,500 words first planned for it, on purpose. By '
                'this point the subtitle frequency list has no more everyday words that the levels '
                'below have not taught, and most of what the dictionary has left is plant names, '
                'regional dialect and archaic literary words; those were left out rather than used '
                'to reach the number. ',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from bn import fold
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
