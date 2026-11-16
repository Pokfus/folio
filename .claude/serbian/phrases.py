#!/usr/bin/env python3
"""The phrases deck's expressions: Serbian set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with one more field, `sub`.  The
Ukrainian stage (`.claude/ukrainian/phrases.py`) re-keyed.

Not a CEFR level: an expression is a unit a frequency list of words cannot
see, which is why the level decks teach so few of them.  Three subdecks, the
Indonesian, Turkish, Hindi and Ukrainian arrangement (`docs/lang-decks.md`,
"THE PHRASES DECK"):

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase or an interjection and does NOT tag idiomatic;
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic;
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`serbian_level.words_below`),
and every sense goes through the level decks' filters: a weak sense (rare,
dialectal, Croatian or Bosnian only, Ijekavian, vulgar ...) is not a reason to
include an expression, a template is not an expression, and `EXCLUDE` names
the rest, each with its reason.

THE ORDER is how many of Tatoeba's Serbian (Cyrillic, Ekavian) sentences
contain the expression -- its verb counted in any form of that verb
(`examples.phrase_parts`) -- then the expression's own frequency estimate,
then its spelling.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sr import fold, tokens
from serbian_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, already imported by the time this
    # runs, so the level stage's lists are loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('serbian_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SWEARS = _select().SWEARS

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj'}

# Never taught, whatever the source says.  Each line says why.  Read off the first build.
EXCLUDE = {
    # IJEKAVIAN OR CROATIAN FORMS of what the deck teaches in the Ekavian standard, or has no
    # Ekavian twin for (the decks teach the standard of Serbia)
    'sretan put': 'the Croatian form of srećan put, which is taught',
    'ljubav je slijepa': 'the Ijekavian form of ljubav je slepa, which is taught',
    'ubiti jednim udarcem dvije muhe': 'the Ijekavian form of ubiti dve muve jednim udarcem, which is taught',
    'faliti po dvije daske': 'Ijekavian (dvije)',
    'put do pakla popločan je dobrim namjerama': 'Ijekavian (namjerama)',
    # the same expression twice: an imperfective twin, a shorter half, a reordering
    'otkrivati toplu vodu': 'the imperfective of otkriti toplu vodu, which is taught',
    'izmišljati toplu vodu': 'the imperfective of izmisliti toplu vodu, which is taught',
    'mi o vuku': 'the first half of mi o vuku, a vuk na vrata, which is taught',
    'ja te volim': 'volim te with the pronoun, which is taught',
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Turkish, Hindi and Ukrainian rule)
    'imam pitanje': 'a sentence built from level words ("I have a question"), not a set phrase',
    'trebam plan grada': 'a phrasebook sentence ("I need a city map"), not a set phrase',
    'trebam taksi': 'a phrasebook sentence ("I need a taxi"), not a set phrase',
    # not an expression
    'muškatni oraščić': 'a compound noun ("nutmeg"), not an expression',
    # religious invocations (the Hindi and Ukrainian rule); the festival greetings stay
    'alahu ekber': 'a religious invocation',
    'allahu ekber': 'a religious invocation',
    'sallallahu alejhi ve sellem': 'a religious honorific',
    'selam alejkum': 'a religious greeting rather than a festival one',
    # crude
    'slabom kurcu i dlaka smeta': 'a crude proverb (its gloss quotes the vulgar wording)',
}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak']]


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
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    rows = []
    for k, (sub, _, pos) in classify(lex).items():
        if k in below or k in excl or any(w in swears for w in k.split()):
            continue
        L = lex[k]
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos if sub != 'Phrases' else '', 'source': 'phrases',
                     'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(s)] for _, s, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        words, alts = examples.phrase_parts(r, lex)
        hits = set()
        for fm in alts[0]:
            for i in index.get(fm, []):
                if i not in hits and examples.seq_hit(toks[i], words, alts):
                    hits.add(i)
        r['count'] = len(hits)
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
