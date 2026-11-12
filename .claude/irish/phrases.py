#!/usr/bin/env python3
"""The phrases deck's expressions: Irish set phrases, verb phrases, expressions, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with two more fields, `sub` and `count`.
Swedish's arrangement (`.claude/swedish/phrases.py`), with the subdecks Irish
needs (`docs/irish-decks-plan.md` §11):

  Phrases         an expression of more than one word that Wiktionary files as
                  a phrase or an interjection -- mostly the everyday formulas
                  (`go raibh maith agaibh`, `go mbeannaí Dia duit`, `a chara`);
  Verb phrases    a verb of more than one word -- a verb and a preposition or an
                  adverb whose meaning a learner cannot read off the verb (`bain
                  amach` "to reach, to achieve", `ba mhaith le` "would like");
  Expressions     the adverbial, prepositional and conjunctional expressions
                  Irish builds out of a preposition and a noun (`ar siúl` "going
                  on", `ar fud` "throughout", `de bhrí go` "because", `ar bith`
                  "any at all") -- Wiktionary files them as adverbs, adjectives,
                  prepositions and conjunctions, and a learner meets them on
                  every page;
  Idioms          an expression of more than one word with a sense Wiktionary
                  TAGS idiomatic (`dhá éan a mharú leis an urchar amháin`) --
                  few, because English Wiktionary tags few Irish idioms;
  Proverbs        Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a verb phrase
outranks an expression outranks a phrase.  Compound NOUNS (1,978 of them, from
`abairt scoilte` to `zú peataí`) are vocabulary rather than expressions and are
left out, as are the multi-word numbers.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`irish_level.words_below`); a weak
sense (rare, dialectal, archaic ...) or a slang one is no reason to include an
expression; a template (`...`) is not an expression; `EXCLUDE` names the rest,
each with its reason.

THE ORDER, within a subdeck, is how many of Tatoeba's Irish sentences contain the
expression -- every word in any of its mutated spellings, a verb phrase's verb in
any form (`examples.phrase_parts`) -- then the expression's frequency estimate
(`extract.py`), then its spelling.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ga import fold, tokens
from irish_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, so the level stage is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('irish_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SWEARS = _select().SWEARS

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Expressions', 'Verb phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj'}
EXPR_POS = {'adv', 'adj', 'prep', 'prep_phrase', 'conj', 'det', 'pron', 'particle'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj'}
CAPS = {'Phrases': 200, 'Expressions': 300, 'Verb phrases': 150, 'Idioms': 100, 'Proverbs': 100}
NOT_A_REASON = {'slang'}

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # A POINTER, NOT A MEANING, OR NO GLOSS THE EXTRACT KEEPS
    'cá mhéad': 'an alternative spelling of cé mhéad (A1); no gloss the extract keeps',
    'gualainn má gualainn': 'no gloss the extract keeps',
    'castar na daoine le chéile ach ní chastar na cnoic ná na sléibhte': 'its gloss is a pointer; the "ar a chéile" spelling is taught',
    'ba dhóigh': 'glossed only as "past/conditional of is dóigh", which is taught',
    'níorbh fholáir': 'glossed only as "past/conditional of ní foláir", which is taught',
    'dia dhuit': 'the older spelling of Dia duit (A1)',
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Hindi, Turkish and Swedish rule)
    'tá grá agam ort': 'a personal sentence ("I love you")', 'tá grá agam dhuit': 'a personal sentence',
    'mo ghrá thú': 'a personal sentence', 'is búdaí mé': 'a personal sentence ("I am a Buddhist")',
    # RUDE, A CURSE, A SLOGAN, OR NOT A PHRASE A LEARNER NEEDS
    'póg mo thóin': 'rude', 'breast tú': 'rude', 'breast é': 'rude',
    'níl aon tóin tinn mar do thóin tinn féin': 'rude', 'caor thine ort': 'a curse',
    'tiocfaidh ár lá': 'a political slogan', 'rinn agus airdrinn': 'a term of verse prosody',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak'] and not (set(g['tags']) & NOT_A_REASON)]


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
            elif e['pos'] == 'verb':
                sub = 'Verb phrases'
            elif e['pos'] in EXPR_POS:
                sub = 'Expressions'
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
                     'pos': pos, 'source': 'phrases', 'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(ga)] for _, ga, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        first, rest = examples.phrase_parts(r, lex)
        n, seen = 0, set()
        for fm in sorted(first):
            for i in index.get(fm, []):
                if i not in seen and examples.seq_hit(toks[i], first, rest):
                    seen.add(i)
                    n += 1
        r['count'] = n
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    kept, have = [], {s: 0 for s in ORDER}
    for r in rows:
        if have[r['sub']] < CAPS[r['sub']]:
            have[r['sub']] += 1
            kept.append(r)
    json.dump(kept, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(kept)} expressions kept of {len(rows)}: ' +
          ', '.join(f'{have[s]} of {by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in kept if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
