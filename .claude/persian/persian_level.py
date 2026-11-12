#!/usr/bin/env python3
"""Which Persian level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `PERSIAN_LEVEL` -- the
arrangement every pipeline here uses (`torfl_level`, `ukbi_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  Persian has no exam board that publishes a
graded word list -- no DELE, HSK or Goethe of its own (Iran's AMFA test for
foreign students publishes none) -- so, like the Hindi, UKBI Indonesian and
TORFL Russian decks, these decks are ASSEMBLED (the Hindi collection's
arrangement, 2026-11-09, carried over): a hand-written inventory of each level's topics
(`inventory.py`), then the commonest remaining words of everyday Persian by lemma
frequency (`select.py`).  Each level is scoped to the Council of Europe's CEFR
global descriptor for its band, and the deck's description says both things in
plain words.  The plan is `docs/persian-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the script deck's
title carries "Alphabet" and sorts before A1 by the rule Russian added.
"""
import json, os, re

LEVEL = os.environ.get('PERSIAN_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Persian {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'persian{k}' for k in BANDS}
DECK_FILES = {k: f'Persian-{k.upper()}.folio-deck.json' for k in BANDS}
TITLES['phr'] = 'Persian Phrases and Expressions'
DECK_IDS['phr'] = 'faphrase'
DECK_FILES['phr'] = 'Persian-Phrases-and-Expressions.folio-deck.json'

# The Hindi collection's sizes (2026-11-09), carried over, in NOTES.
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
                  'telling the time, days of the week, food and drink, shopping and money, '
                  'the home, the town and getting about, the body and feeling ill, the '
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
        'topics': 'relatives and the people around you, work and study, jobs, clothes and '
                  'shopping, more food and cooking, the furniture of a home, the town, the '
                  'countryside and animals, the seasons and the points of the compass, the months '
                  'of the Iranian calendar, the numbers to a million, travel, health and the body, '
                  'feelings and character, free time and festivals, telling what happened and '
                  'when, giving an opinion, and the everyday verbs of moving, dressing and doing',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to produce '
                 'simple connected text on familiar topics, and to describe experiences and '
                 'events, dreams, hopes and ambitions, and briefly give reasons and explanations '
                 'for opinions and plans',
        'topics': 'work, money and the economy, education, the news, media and technology, '
                  'government, law and society, the environment and the weather, health and '
                  'medicine, travel and transport, the household and its chores, relationships '
                  'and the stages of life, feelings and character, religion and festivals, '
                  'abstract nouns for ideas, reasons and plans, the connectors that join '
                  'sentences, and the verbs of thinking, deciding, arguing and changing',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from fa import fold
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
