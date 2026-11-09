#!/usr/bin/env python3
"""Which Hindi level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `HINDI_LEVEL` -- the
arrangement every pipeline here uses (`torfl_level`, `ukbi_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  Hindi has no exam board that publishes a
graded word list -- no DELE, HSK or Goethe of its own -- so, like the UKBI
Indonesian and TORFL Russian decks, these decks are ASSEMBLED (the owner's
decision, 2026-11-09): a hand-written inventory of each level's topics
(`inventory.py`), then the commonest remaining words of everyday Hindi by lemma
frequency (`select.py`).  Each level is scoped to the Council of Europe's CEFR
global descriptor for its band, and the deck's description says both things in
plain words.  The plan is `docs/hindi-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the script deck's
title carries "Alphabet" and sorts before A1 by the rule Russian added.
"""
import json, os, re

LEVEL = os.environ.get('HINDI_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Hindi {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'hindi{k}' for k in BANDS}
DECK_FILES = {k: f'Hindi-{k.upper()}.folio-deck.json' for k in BANDS}
TITLES['phr'] = 'Hindi Phrases and Expressions'
DECK_IDS['phr'] = 'hiphrase'
DECK_FILES['phr'] = 'Hindi-Phrases-and-Expressions.folio-deck.json'

# The owner's sizes (2026-11-09), in NOTES.
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
        'topics': 'relatives and the people around you, work and jobs, school and study, '
                  'clothes, more food and cooking, the house and its things, the town and '
                  'the countryside, the points of the compass, travel, health and the body, '
                  'feelings and character, free time, animals, the months and seasons, '
                  'telling what happened and when, the numbers to a crore, and the everyday '
                  'verbs of moving, dressing, cooking and doing',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to produce '
                 'simple connected text on familiar topics, and to describe experiences, events, '
                 'dreams, hopes and ambitions and briefly give reasons for opinions and plans',
        'topics': 'jobs and the workplace, education, the media and the internet, travel and '
                  'what goes wrong on it, the stages of a life, plans and ambitions, the words '
                  'that give reasons and weigh opinions, society, politics and the environment, '
                  'money and the bank, renting a home, relationships, health and treatment, '
                  'feelings, character, and the verbs that describe change',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from hi import fold
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
