#!/usr/bin/env python3
"""The phrases deck's expressions: Romanian set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the six level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with two more fields, `sub` and `count`.
Ported from `.claude/hindi/phrases.py` (2026-11-12, on request: "Add the
phrases deck").

Not a CEFR level: an expression is a unit a frequency list of words cannot
see, which is why the level decks teach so few of them.  Three subdecks, the
Indonesian, Turkish and Hindi arrangement (`docs/lang-decks.md`, "THE PHRASES
DECK"):

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase, a prepositional phrase or an interjection and does NOT tag
            idiomatic -- mostly the everyday formulas (`îmi pare rău`,
            `ce mai faci`, `în regulă`);
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic (`face față`, `da de urmă`, `din ce în ce`);
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`ro_level.words_below`), and
every sense goes through the level decks' filters: a weak sense (rare,
dialectal, vulgar ...) is not a reason to include an expression, a template is
not an expression, and `EXCLUDE` names the rest, each with its reason.

THE ORDER is how many of Tatoeba's Romanian sentences contain the expression
-- one that is a verb counted with its verb in any form (`examples.py`'s
matching for this deck) -- then the expression's own frequency estimate
(`extract.py`), then its spelling.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ro import fold, tokens
from ro_level import LEVEL, f, words_below
import examples


def _swears():
    # `select` is also a standard-library module, already imported by the time this
    # runs, so the level stage's list is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('romanian_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.SWEARS


SWEARS = _swears()

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj', 'prep'}

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (Hindi's rule, from the Turkish deck): a
    # statement or request a learner builds from the level decks' words -- the questions
    # and formulas a phrasebook teaches whole (`nu știu`, `cum vă numiți`) stay
    'te iubesc': 'a phrasebook sentence ("I love you"), not a set phrase',
    'te urăsc': 'a phrasebook sentence ("I hate you"), not a set phrase',
    'sunt gay': 'a personal sentence built from level words, not a set phrase',
    'crezi în Dumnezeu': 'a personal question built from level words, not a set phrase',
    'credeți în Dumnezeu': 'a personal question built from level words, not a set phrase',
    'pot să folosesc telefonul Dumneavoastră': 'a phrasebook request built from level words',
    'am nevoie de un ghid': 'a phrasebook sentence built from level words',
    'sunteți alergic la vreun medicament': 'a phrasebook question built from level words',
    'am o întrebare': 'a phrasebook sentence built from level words',
    # oaths
    'să-mi trag una': 'an oath ("holy crap")',
    'hai sictir': 'an oath ("get lost", rude)',
    # the same expression twice, or a card that is only a pointer
    'lupta cu morile de vânt': 'the same idiom as se lupta cu morile de vânt, taught',
    'spăla putina': 'its one gloss is a pointer to șterge putina, which is not in the deck',
    'viața nu e mereu roz': 'its one gloss is a pointer to viața nu e roz, which is not in the deck',
    # an ethnic slur, as in the C2 level deck
    'tot țiganul își laudă ciocanul': 'its subject is an ethnic slur (see select.EXCLUDE, C2)',
}

# A WORD THAT MAKES AN EXPRESSION AN OATH, as the expressions write it: `select.SWEARS`
# lists headwords (`pulă`, `pizdă`), the oaths their definite and clipped forms
# (`du-te-n pula mea`, `dă-o-n pizda mă-sii`), which the headword list does not catch.
OATH = {'pula', 'pizda', 'căcat', 'futere', 'sloboz', 'sictir', 'mă-tii', 'mă-sii'}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak']]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if '...' in k or '…' in k or '-' == k[0] or '-' == k[-1]:
            continue
        for e in L['entries']:
            gl = good(e)
            if not gl:
                continue
            tags = {t for g in gl for t in g['tags']}
            if e['pos'] == 'proverb':
                sub = 'Proverbs'
            elif 'idiomatic' in tags and e['pos'] in IDIOM_POS:
                sub = 'Idioms'
            elif e['pos'] in PHRASE_POS:
                sub = 'Phrases'
            else:
                continue
            rank = ORDER.index(sub)
            if k not in rows or rank > rows[k][1]:
                rows[k] = (sub, rank, e['pos'])
    return rows


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    rows = []
    for k, (sub, _, pos) in classify(lex).items():
        if k in below or k in excl or any(fold(w) in swears for w in tokens(k)) \
                or any(w in OATH for w in k.replace('-n ', ' ').replace('-', ' -').split()) \
                or any(o in k for o in ('mă-tii', 'mă-sii')):
            continue
        L = lex[k]
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos if sub != 'Phrases' else '', 'source': 'phrases',
                     'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(ro)] for _, ro, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        sets = examples.phrase_parts(r, lex)
        hits = set()
        for w0 in sets[0]:
            for i in index.get(w0, []):
                if examples.seq_hit(toks[i], sets):
                    hits.add(i)
        r['count'] = len(hits)
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
