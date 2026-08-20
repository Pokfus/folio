#!/usr/bin/env python3
"""Write the phrases-and-expressions deck file.

`emit.py`'s sibling.  It shares the card type (`deck_type.py`) and nothing else:
every claim a level's description makes is about a UKBI predicate, and this deck
is not one -- see `PREDICATE_NOTE` below, which is the thing this file most has
to get right.
"""
import json, os, collections

from ukbi_level import f as lvlf
from deck_type import (TYPE_ID, STAMP, FIELDS, CSS,
                       FRONT_ID, BACK_ID, FRONT_EN, BACK_EN)
from phrases import KIND_ORDER, EVERYDAY, IDIOM, PROVERB

DECK = 'idphrase'
TITLE = 'Indonesian Phrases and Expressions'
FILE = 'Indonesian-Phrases-and-Expressions.folio-deck.json'

cards = json.load(open(lvlf('cards.json'), encoding='utf-8'))
entries = json.load(open(lvlf('entries.json'), encoding='utf-8'))
_k = json.load(open(lvlf('kinds.json'), encoding='utf-8'))
kinds, drops = _k['kinds'], _k['drops']
# EVERY FIGURE THE DESCRIPTION QUOTES IS COUNTED, never typed in: how many
# foreign phrases and compound nouns were left out moves the next time the
# dictionary is refreshed, and prose written round today's number would go
# quietly stale.
FOREIGN_OUT = (drops.get('a foreign phrase, the etymology says so', 0)
               + drops.get('an internationalism, the category says so', 0))
NOUNS_OUT = drops.get('a compound noun rather than an expression', 0)
VARIANTS = _k['variants']
TATOEBA = _k['tatoeba']
freq = json.load(open(lvlf('wordlist.json'), encoding='utf-8'))['freq']

for i, (c, e) in enumerate(zip(cards, entries), 1):
    c['id'] = f'u_{DECK}_{i}'
    c['type'] = TYPE_ID
    c['sub'] = kinds[e['word']]

n = len(cards)
per = collections.Counter(kinds[e['word']] for e in entries)
ex0 = sum(1 for e in entries if e['examples'] == 0)
exany = n - ex0
ex3 = sum(1 for e in entries if e['examples'] == 3)
used = sum(1 for e in entries if freq.get(e['word'], 0) > 0)
longest = max(entries, key=lambda e: len(e['word']))['word']

# THE ONE THING THIS DESCRIPTION MOST HAS TO GET RIGHT.  A deck sitting beside
# `UKBI 1 Terbatas` … `UKBI 7 Istimewa` will be read as an eighth predicate
# unless it says otherwise, and there is no eighth predicate.  `SCOPE` in
# `ukbi_level.py` records what happens when a description is written once and
# reprinted: levels 2 and 3 shipped calling themselves the lowest of the seven.
PREDICATE_NOTE = (
    'This is a companion to the seven UKBI decks and not one of them: UKBI has '
    'seven predicates, from Terbatas to Istimewa, and no eighth. It exists '
    'because of something the seven cannot do. Each of those is filled from a '
    'frequency list, and a phrase cannot appear in a frequency list at all — '
    'every word counter treats kambing hitam as kambing and hitam — so the '
    'expressions in them had to be counted separately in a corpus of everyday '
    f'sentences, under a floor, because one occurrence in {TATOEBA:,} '
    'sentences is '
    'not a frequency. Everything below that floor was out of reach of every '
    'level however well known it is, and that is most of the idioms and nearly '
    'all of the proverbs. This deck is what was left behind. '
)

DESC = (
    f'{n} Indonesian phrases, idioms and proverbs, in three subdecks: '
    f'{per[EVERYDAY]} everyday expressions, {per[IDIOM]} idioms and '
    f'{per[PROVERB]} proverbs. Both study directions come as two cards of one '
    'expression — Indonesian → English (see the Indonesian, recall the '
    'meaning) and English → Indonesian (see an English meaning, recall the '
    'Indonesian) — each with a schedule of its own, so recognising an '
    'expression and producing it are learnt separately. '
    'Nothing here is taught by any of the seven UKBI decks, so the two can be '
    'studied together without repeating a single entry. '
    + PREDICATE_NOTE +
    'WHICH EXPRESSIONS THESE ARE, AND WHY THOSE. Wiktionary was not searched '
    'for things that look like phrases; every entry is here because the '
    'dictionary itself says it is an expression, or because a corpus shows it '
    'in use. A proverb is one Wiktionary files as an Indonesian proverb — a '
    'peribahasa. An idiom is an entry with a sense the dictionary tags '
    'idiomatic or figurative, which is it saying that the meaning is not the '
    'sum of the words: kambing hitam is a black goat and a scapegoat, lintah '
    'darat is a land leech and a loan shark. An everyday expression is one '
    'from the dictionary\'s own Indonesian phrasebook, or a phrase, '
    'interjection or verb phrase that turns up at least once in a corpus of '
    'real Indonesian sentences. '
    'What is marked as an expression is taken whatever the corpus says, and '
    'that is deliberate: an idiom is literary and a corpus of chat and news is '
    f'not where idioms live, so only {used} of these {n} occur in one at all. '
    'Filtering on use would have deleted the subject of the deck. Where '
    'nothing but the part of speech suggested an expression, the corpus had to '
    'show it, because there the part of speech is a weak signal — the same '
    'pool holds atas nama, which occurs two dozen times, beside formulas '
    'nobody says. '
    'WHAT WAS LEFT OUT, and each on the dictionary\'s own statement rather '
    'than on a judgement made here. Foreign phrases used in Indonesian are '
    'not Indonesian expressions, and the dictionary marks them: de facto, ad '
    'hominem, s\'il vous plaît and en route are all borrowings it describes as '
    f'unadapted or as internationalisms, and {FOREIGN_OUT} entries go that '
    'way. '
    'Misspellings are entries in their own right — terimah kasih and selamat '
    'tinngal both are — and a deck for a test that marks dimana wrong must not '
    'teach them. Compound nouns are vocabulary rather than expressions: '
    f'{NOUNS_OUT:,} multi-word entries are nouns like tahun cahaya, a light '
    'year, and they '
    'are here only where the dictionary has separately marked them idiomatic. '
    'And a proverb that the dictionary glosses as a synonym of another proverb '
    'is that one in a different spelling — di mana bumi dipijak, di situ '
    f'langit dijunjung has {VARIANTS} — so the deck carries the form the '
    'dictionary names as canonical and not the rest. '
    'Within each subdeck the order is by how often the expression turns up in '
    'those corpora, commonest first. Below a handful of occurrences a count '
    'cannot rank one expression against another, and most of the idioms and '
    'proverbs are below that, so treat the order there as a rough guide rather '
    'than a ranking. '
    'The idiomatic sense is shown first where an entry has both — Wiktionary '
    'lists kambing hitam as "black goat" and then "scapegoat", which on an '
    'idioms card is the wrong way round. The literal sense is kept underneath, '
    'because it is what makes the metaphor legible. '
    'Everything here is standard Indonesian, bahasa baku, because that is what '
    'UKBI tests: an expression whose only senses the dictionary marks slang or '
    'colloquial is left out. '
    f'Real example sentences come with {exany} of the {n} expressions, three '
    f'apiece for {ex3} of them, with the expression picked out in colour and a '
    'speaker beside the sentence and the headword. The rest have none, and '
    'that is the subject rather than a gap: a proverb is not something people '
    'write in a news article or a language-learning sentence bank, so the '
    'sentence corpora simply do not contain it. '
    'Meanings and classification: English Wiktionary, via the kaikki.org '
    'extraction (CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), CC '
    'BY 2.0 FR; English Wiktionary\'s own usage examples (CC BY-SA 4.0); and '
    'Global Voices news articles via the OPUS collection (CC BY 3.0), which '
    'are human translations aligned sentence by sentence automatically, so a '
    'few of the sentences taken from them may not line up exactly with their '
    'English. They are used only where the other two sources have nothing. '
    'Predicate descriptors, for the seven decks this one accompanies: '
    'ukbi.kemendikdasmen.go.id.'
)

meta = {
    'id': DECK,
    'title': TITLE,
    'subtitle': f'{n} expressions · {per[EVERYDAY]} everyday, {per[IDIOM]} '
                f'idioms, {per[PROVERB]} proverbs · both directions',
    'desc': DESC,
    'author': '',
    'language': 'en',
    'color': '#B32821',
    'tags': ['indonesian', 'bahasa indonesia', 'phrases', 'idioms', 'proverbs',
             'peribahasa', 'expressions', 'ukbi'],
    'glossMode': 'site',
    'types': {
        TYPE_ID: {
            'id': TYPE_ID, 'name': 'Indonesian vocabulary', 'speechLang': 'id-ID',
            'fields': FIELDS,
            'cards': [
                {'name': 'Indonesian → English', 'front': FRONT_ID, 'back': BACK_ID},
                {'name': 'English → Indonesian', 'front': FRONT_EN, 'back': BACK_EN},
            ],
            'css': CSS,
        },
    },
    'version': 1,
    'createdAt': STAMP,
    'updatedAt': STAMP,
    'forkedFrom': None,
}

deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta,
        'cards': cards, 'gloss': {}}

out = os.path.abspath(os.path.join('..', '..', 'decks', FILE))
with open(out, 'w', encoding='utf-8') as fh:
    json.dump(deck, fh, ensure_ascii=False)
print('  wrote', out)
print(f'  notes {n} = cards {n * 2} | '
      + ' | '.join(f'{k} {per[k]}' for k in KIND_ORDER)
      + f' | used in a corpus {used} | three sentences {ex3} | none {ex0}')
print(f'  longest: {longest}')
print('  bytes', os.path.getsize(out))
