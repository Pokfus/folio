#!/usr/bin/env python3
"""The phrases deck's expressions: Tagalog set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with one more field, `sub`.

Not a CEFR level: an expression is a unit a frequency list of words cannot
see.  Three subdecks, the Indonesian, Turkish and Hindi arrangement
(`docs/lang-decks.md`, "THE PHRASES DECK"):

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase or an interjection and does NOT tag idiomatic -- mostly the
            everyday formulas (`hindi ko alam`, `tao po`, `sige na`);
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic (`mainit ang ulo`, `may hangin sa ulo`);
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`tl_level.words_below` -- the
levels' inventories teach a few multi-word entries, `sa wakas`, `una sa
lahat`), a weak sense (rare, dialectal, vulgar ...) is not a reason to include
an expression, a swear word anywhere in it excludes it, and `EXCLUDE` names the
rest, each with its reason.

THE ORDER is how many of Tatoeba's Tagalog sentences contain the expression's
words in sequence (`examples.py`'s matching), then the expression's frequency
estimate in `lex.json`, then its spelling.  Most expressions are found in no
sentence, so the second key does much of the ordering; the description says so.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tl import fold, tokens
from tl_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, so the level stage is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('tagalog_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SWEARS = _select().SWEARS

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj'}

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Turkish and Hindi rule): a statement or
    # question in one person that a learner builds from words the levels teach
    'wala akong pera': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'may kanser ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'tumawag ka ng pulis': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'may tanong ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'hindi ako interesado': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'pakakasalan mo ba ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'wala siyang malay': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'nilalagnat ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'may mga kapatid ka ba': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'saan ka nakatira': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'bakla ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'bulag ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'bingi ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'tatawagan ko ang pulis': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'may iniinom ka bang gamot': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'uulan ba': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'hindi ako marunong mag-Ingles': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'ako ay dalawampung taong gulang': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'kumanan ka': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'naligaw ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'naliligaw ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'barado ang inodoro': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'tumawag ka ng ambulansiya': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'ninakawan ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'may hika ako': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'nananampalataya ka ba sa Diyos': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    'ano ang ginagawa mo': 'a phrasebook sentence a learner builds from the level decks, not a set phrase',
    # insults and oaths
    'mukha mo': "an insult ('your ass')",
    'ka diyan': "an insult ('my ass')",
    'mama mo': "an insult ('your mom')",
    'anak ng tupa': "an oath glossed 'son of a bitch'",
    'anak ng putsa': "an oath glossed 'son of a bitch'",
    'pusang gala': "an oath glossed with two obscenities",
    'berdeng dugo': "a derogatory idiom for homosexuality",
    # the same expression twice, or a pointer to another
    'hindi ko po alam': "hindi ko alam with the polite po, taught as one",
    'ilang taong gulang ka na': "a longer form of ilang taon ka na, taught as one",
    'ano ga iyan': "a regional form of ano ba iyan",
    'huli ka balbon': "its entry is 'synonym of huli ka'",
    'bahala na si Batman': "its entry is 'synonym of bahala na'",
    'sa kasawiang-palad': "a variant of sa kasamaang-palad, taught as one",
    'maligayang Pasko at manigong Bagong Taon': "two greetings the deck teaches apart, joined",
    'maligayang Pasko at masaganang Bagong Taon': "two greetings the deck teaches apart, joined",
    # an Arabic formula (the Hindi rule for religious formulas in another language)
    'assalamu alaikum': "an Arabic greeting, not a Tagalog expression",
}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak']]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly') or k.startswith('cap:'):
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
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(tl)] for _, tl, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        words = fold(r['word']).split()
        n = 0
        for i in index.get(words[0], []):
            ft = toks[i]
            if any(ft[j:j + len(words)] == words for j in range(len(ft) - len(words) + 1)):
                n += 1
        r['count'] = n
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
