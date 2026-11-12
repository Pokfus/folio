#!/usr/bin/env python3
"""Which Romanian level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `ROMANIAN_LEVEL` -- the
arrangement every pipeline here uses (`torfl_level`, `ukbi_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  Romanian's CEFR certificates (the
Romanian Language Institute's, the universities') publish no openly licensed
graded word list that this pipeline could find -- no DELE, HSK or Goethe list
of its own -- so, like the Hindi, UKBI Indonesian and TORFL Russian decks,
these decks are ASSEMBLED (2026-11-09, on Hindi's precedent): a hand-written inventory of each level's topics
(`inventory.py`), then the commonest remaining words of everyday Romanian by lemma
frequency (`select.py`).  Each level is scoped to the Council of Europe's CEFR
global descriptor for its band, and the deck's description says both things in
plain words.  The plan is `docs/romanian-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the script deck's
Romanian is written in the Latin alphabet, so there is no script deck.
"""
import json, os, re

LEVEL = os.environ.get('ROMANIAN_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1', 'c2')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced', 'c2': 'Proficiency'}

TITLES = {k: f'Romanian {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'romanian{k}' for k in BANDS}
DECK_FILES = {k: f'Romanian-{k.upper()}.folio-deck.json' for k in BANDS}
TITLES['phr'] = 'Romanian Phrases and Expressions'
DECK_IDS['phr'] = 'rophrase'
DECK_FILES['phr'] = 'Romanian-Phrases-and-Expressions.folio-deck.json'

# The sizes, in NOTES -- Hindi's, the shelf's most recent assembled set; C2 (added on
# request, 2026-11-12) the size of C1.
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000, 'b2': 1500, 'c1': 1500, 'c2': 1500}

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
        'topics': 'relatives and the people around you, jobs and study, clothes, more food and '
                  'cooking, the rooms and furniture of a home, the town and its services, travel '
                  'and holidays, nature, the seasons and the compass, animals, health and the '
                  'body, feelings and character, free time and sport, the parts of the day and '
                  'telling what happened when, the higher numbers, and the everyday verbs of '
                  'moving, dressing, cooking and doing',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling where the '
                 'language is spoken, to produce simple connected text on familiar topics, and '
                 'to describe experiences, events, dreams, hopes and ambitions and briefly give '
                 'reasons and explanations for opinions and plans',
        'topics': 'work and careers, education, the media and technology, the environment, '
                  'society and public life, law and crime, health and lifestyle, relationships, '
                  'feelings and character, giving opinions and arguing a point, the linking words '
                  'that join sentences into a text, travel and what goes wrong on it, services, '
                  'money and housing, culture and the arts, abstract ideas, and the verbs of '
                  'thinking, communicating and changing things',
    },
    'b2': {
        'quote': 'Can understand the main ideas of complex text on both concrete and abstract '
                 'topics, including technical discussions in their field of specialisation',
        'gloss': 'able to interact with a degree of fluency and spontaneity that makes regular '
                 'interaction with native speakers quite possible without strain for either party, '
                 'and to produce clear, detailed text on a wide range of subjects and explain a '
                 'viewpoint on a topical issue giving the advantages and disadvantages of various '
                 'options',
        'topics': 'work and the economy, science and research, technology and the internet, '
                  'politics and government, law and justice, the environment and sustainability, '
                  'health and medicine, the mind and the emotions, society and its issues, the '
                  'media, arguing, persuading and evaluating, the words that structure an argument, '
                  'culture and the arts, places and geography, describing people and things, '
                  'abstract nouns, and the verbs of change and action',
    },
    'c1': {
        'quote': 'Can understand a wide range of demanding, longer texts, and recognise implicit '
                 'meaning',
        'gloss': 'able to express ideas fluently and spontaneously without much obvious searching '
                 'for expressions, to use language flexibly and effectively for social, academic '
                 'and professional purposes, and to produce clear, well-structured, detailed text '
                 'on complex subjects',
        'topics': 'economics and finance, politics and the state, law and rights, science and '
                  'knowledge, philosophy, language and rhetoric, society and culture, character and '
                  'conduct, the finer shades of feeling, the arts and literature, the planet, '
                  'medicine, the adjectives, adverbs and connectors of a formal register, nuanced '
                  'verbs, and abstract nouns',
    },
    'c2': {
        'quote': 'Can understand with ease virtually everything heard or read',
        'gloss': 'able to summarise information from different spoken and written sources, '
                 'reconstructing arguments and accounts in a coherent presentation, and to express '
                 'themselves spontaneously, very fluently and precisely, differentiating finer shades '
                 'of meaning even in more complex situations',
        'topics': 'the literary and elevated vocabulary of written Romanian, the older words still '
                  'alive in its literature, rhetoric and style, history, faith and tradition, '
                  'the countryside and its crafts, law, administration and scholarship at their most '
                  'formal, the finest shades of character, feeling and judgement, precise verbs of '
                  'speech, sight, movement and manner, and the rarer adjectives and adverbs that '
                  'separate a fluent speaker from a precise one',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from ro import fold
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
