#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by `score` (extract.py: the Wikipedia count and the Wiktionary-examples
count combined; the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`navajo_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma absent from either corpus (the Wikipedia or Wiktionary's examples):
    this alone keeps out most of the stubs' species names;
  · a lemma whose every sense is weak (rare, archaic, slang ...);
  · a multi-word lemma, a capitalised one (a name), one of two letters or fewer;
  · a lemma that is only a phrase or an interjection (the phrases deck's);
  · the hand list `EXCLUDE`, each line with its reason.  The Navajo Wikipedia is
    mostly bot-written stubs about animals and plants, so most of the list is a
    stub formula's word ("its scientific name", "its body", "inch").
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nv import norm
from navajo_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-16).  Grouped, one reason per group.
_STUB = ('naʼałkaahí atah bichʼiyąʼ yózhí asdzoh yisdzoh áníłtso áníłnééz adéesʼeez tsinsitą́ '
         'hahoodzo náhásdzo yildeeł yiłchozh yilghał bílaʼashdlaʼii naaldlooshii átʼéego hólónígíí '
         'hólóní ádinígíí kééhatʼínígíí deesdoigi yágo łizhiní łigaii diłhiłgo łizhingo chʼilgo halzhin '
         'halchííʼ halbá noodǫ́ǫ́z kʼíjíjin dzígai jíjin kʼídzígai yishtłizh shiyish ditłʼo disxǫs dichʼíízh '
         'biyázhí biyáázh bikétłʼóól naatʼaʼí naaldeehii shijaaʼ jeeh bijeeh biwááshindoon tsinlátah '
         'anákʼee atsiitʼáád anátsʼiin akéshgaan atłʼaaʼ azábąąh tsétah táłkááʼ tsékʼi táłtłʼááh ałʼąą '
         'biyiʼdi bikáaʼdi wónaanídi wónaanídę́ę́ʼ shádiʼááh shádiʼááhdę́ę́ʼ náhookǫs haalʼá sinil shijééʼ '
         'diłdzííd dláád kinsááʼ yistłʼin háálį́ tłʼohtah naʼatłʼoʼii yiyání naalzheehii kʼídzígai')
_SPECIES = ('naʼashǫ́ʼii nahatʼeʼiitsoh mágí chéłchaaʼ łéʼétsoh jááłánii jaaʼabaní wóláchííʼ wáláchííʼ '
            'naʼazhǫǫsh tséʼédǫ́ʼii séigoʼ jaaʼniłtsʼílí tsxilghááh tsʼíʼii iichʼąhii łeesdísí '
            'tsįįłkaałii hasbídí giní tsídiiłbáhí néʼéshjaaʼ naalnoodí naałʼaashii dahiitį́hii '
            'iichʼąhiitsʼósí yaaʼ kʼaalógii táshchozhii naalʼeełí dééł nahachagii tábąąsdísí naatsédlózii '
            'zhį́ʼii tóidoozohii ghą́ą́ʼaskʼidii tsídiiłtsooí deeteel ayáásh chʼoshtsoh łóóʼtsoh tsídiitsoh '
            'tsísʼná chʼagii ábishjaaʼ łeʼesoołii dlǫ́ʼii chį́į́shnézí gáagii')
_SHADES = 'dinilbá dinilgai diniltso diniltsxo dinilchííʼ łichxííʼ'
EXCLUDE = {}
for _w in _STUB.split():
    EXCLUDE[_w] = ('a word of the Navajo Wikipedia\'s animal and plant stubs (their formulas for a '
                   'scientific name, a size in inches, what an animal eats and its body parts), or a '
                   'form of such a word: its count is the stubs\', not the language\'s')
for _w in _SPECIES.split():
    EXCLUDE[_w] = ('a species name from the stubs: the corpus names hundreds of insects, birds and '
                   'animals, and A1 teaches the everyday ones by its inventory')
for _w in _SHADES.split():
    EXCLUDE[_w] = 'a shade of a colour (light grey, pinkish ...): the basic colours are A1\'s, shades later'
EXCLUDE.update({
    'dleesh': 'rhyolitic tuff: a geologist\'s word',
    'tátłʼidgo': '"algae-like": a stub formula',
    'łeetso': 'yellow ochre: not an A1 word',
    'adilohii': '"lassoer": not an A1 word',
    'aleeh': 'glossed as a grammatical formula ("unspecified subject occurs"), not a meaning',
    'ajéí': 'Wiktionary glosses "pleural organs"; the everyday heart is ajéí in a sense it does not give',
    'ałchʼįʼ': 'glossed only as "reciprocal of bichʼįʼ", a pointer, not a meaning',
    'bizis': 'a possessed form ("its bag") filed as its own noun',
    'bitooʼ': 'a possessed form ("its juice") filed as its own noun',
    'wolyéhígíí': 'a relative form of wolyé ("the one that is called"), which A1 teaches',
    'béésh': 'Wiktionary glosses only "flint"; its count is béésh "metal, knife"',
    'wááshindoon': 'government: not an A1 word',
    'atsįʼ': '',  # placeholder removed below
})
del EXCLUDE['atsįʼ']

# A GLOSS THAT IS A TAXON (a Latin name in brackets, a family in -idae) or a grammatical
# form ("simple passive perfective of ...") is never a fill word.
FORMGLOSS = re.compile(r'(?i)^(simple passive|reciprocal of)|\b(im)?perfective of\b|\bfuture (form )?of\b')
TAXON = re.compile(r'\([A-Z][a-z]+(?: [a-z]+)?\)|idae\b|^[A-Z][a-z]+$')


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


def main():
    D = json.load(open('lex.json', encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = norm(w)
            if k not in lex and k in ptr:
                k = ptr[k][0]['to']
            if k in seen or k in below:
                continue
            L = lex.get(k)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'score': L['score'], 'pos': pos,
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    excl = {norm(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['score'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in below or k in excl or ' ' in k or len(k) <= 2:
            continue
        if L['word'][:1] != L['word'][:1].lower() or any(ch.isupper() for ch in L['word'][1:]):
            continue
        if not usable(L) or L['freq'] < 1 or L['ex_n'] < 1:   # in BOTH corpora
            continue
        if all(e['pos'] in ('phrase', 'intj') for e in L['entries']):
            continue
        g0 = [g['g'] for e in L['entries'] for g in e['glosses']]
        if any(TAXON.search(g) for g in g0) or all(FORMGLOSS.search(g) for g in g0):
            continue
        seen.add(k)
        fill.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'score': L['score'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['score'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
