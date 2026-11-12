#!/usr/bin/env python3
"""The phrases deck's expressions: Hungarian set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with two more fields, `sub` and `count`.
Ported from `.claude/romanian/phrases.py` (2026-11-12, on request: "Add the
phrases deck"; the plan's Phase 3).

Not a CEFR level: an expression is a unit a frequency list of words cannot
see.  Three subdecks, the Indonesian, Turkish, Hindi and Romanian arrangement
(`docs/lang-decks.md`, "THE PHRASES DECK"):

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase or an interjection and does NOT tag idiomatic -- mostly the
            everyday formulas (`jó étvágyat`, `egészségedre`, `nem baj`);
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic (`szemet huny`, `kilóg a lóláb`);
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.  A
plain multi-word noun (`házi feladat`) is a word, not an expression, and is not
here.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`hungarian_level.words_below`),
and every sense goes through the level decks' filters: a weak sense (rare,
dialectal ...) is not a reason to include an expression, a pointer is not a
meaning (`select.POINTER`), an expression with a swear word in it is never used
(`examples.clean`), and `EXCLUDE` names the rest, each with its reason.

THE ORDER is how many of Tatoeba's Hungarian sentences contain the expression
-- an idiom that is a verb matched with its verb in any form and, two words
long, in either order (`examples.phrase_hits`) -- then the expression's own
frequency estimate (`extract.py`), then its spelling.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hu import fold, tokens
from hungarian_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, already imported by the time this
    # runs, so the level stage is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('hungarian_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SEL = _select()

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'intj'}

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # A PERSONAL SENTENCE BUILT FROM LEVEL WORDS, NOT A SET PHRASE (the Romanian and Hindi
    # rule): the phrasebook's questions and formulas (`nem tudom`, `mennyibe kerül`) stay
    'meleg vagyok': 'a personal sentence ("I\'m gay"), not a set phrase',
    'zsidó vagyok': 'a personal sentence ("I\'m Jewish"), not a set phrase',
    'ateista vagyok': 'a personal sentence ("I\'m an atheist"), not a set phrase',
    'keresztény vagyok': 'a personal sentence ("I\'m a Christian"), not a set phrase',
    'muszlim vagyok': 'a personal sentence ("I\'m a Muslim"), not a set phrase',
    'buddhista vagyok': 'a personal sentence ("I\'m a Buddhist"), not a set phrase',
    'nem vagyok vallásos': 'a personal sentence ("I\'m not religious"), not a set phrase',
    'szerelmes vagyok beléd': 'a personal sentence ("I\'m in love with you"), not a set phrase',
    # a term, not an expression
    'azonosítatlan repülő tárgy': 'a term ("unidentified flying object"), not an expression',
    'szervezeti és működési szabályzat': 'an administrative term, not an expression',
    # no meaning, or not a phrase a learner meets
    'most ugrik a majom a vízbe': 'its one gloss is "It can be said in the following cases"',
    'az ember': 'the impersonal "one, you" is grammar, and every sentence matched is the literal "the man"',
    'abszolút filmszínház': 'an internet meme ("absolute cinema"), not a set phrase',
}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak'] and not SEL.POINTER.match(g['g'])]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if '...' in k or '…' in k or k[0] == '-' or k[-1] == '-':
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
    swears = {fold(s) for s in SEL.SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    rows = []
    for k, (sub, _, pos) in classify(lex).items():
        if k in below or k in excl or not examples.clean(lex[k]['word']) \
                or any(fold(w) in swears for w in tokens(k)):
            continue
        L = lex[k]
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos if sub != 'Phrases' else '', 'source': 'phrases',
                     'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(hu)] for _, hu, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        r['count'] = len(examples.phrase_hits(r, lex, toks, index))
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
