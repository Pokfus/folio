#!/usr/bin/env python3
"""Every Irish lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-ga.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0), the Irish Universal Dependencies treebank (`ga_idt-ud-*.conllu`,
UD_Irish-IDT, CC BY-SA 3.0) and the Tatoeba Irish sentences, and writes
`lex.json`.  Level-independent: built once and kept.

WHY TWO COUNTS.  There is no subtitle list for Irish (hermitdave/FrequencyWords
has none), so the frequency is the sum of two per-million rates:
  · the TREEBANK's, whose ~116,000 words carry hand-checked lemmas -- `tá`,
    `bhí`, `raibh` are all `bí` there, which is exactly a lemma count, with no
    splitting of shared forms.  It is mostly written prose (news, legislation,
    fiction, the web), so on its own it ranks `údarás` "authority" above `bia`
    "food";
  · TATOEBA's ~3,000 sentences, which are conversational.  These carry no
    lemmas, so each word is undone of its initial mutation (`ga.plain`) and
    credited to the lemma it is, or else to the lemmas whose forms it is in,
    shared in proportion to their treebank counts.
The two together put the everyday word above the official one without either
corpus deciding alone.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name (bar `NAME_OK`).  An entry whose every sense
is a form or an alternative spelling of another word is not a lemma: an
alternative spelling becomes a POINTER the inventory may resolve through, and
every such word's spelling joins its lemma's forms.
"""
import collections, glob, json, os, re, sys, csv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ga import nfc, low, tokens, plain, form_key, PRON

DUMP, OUT = 'kaikki-ga.jsonl', 'lex.json'
csv.field_size_limit(10 ** 8)

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'article', 'proverb', 'prep_phrase', 'contraction'}

NAME_OK = {'Éire', 'Gaeilge', 'Béarla', 'Dé Luain', 'Dé Máirt', 'Dé Céadaoin', 'Déardaoin',
           'Dé hAoine', 'Dé Sathairn', 'Dé Domhnaigh'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'uncommon', 'poetic',
        'historical', 'literary', 'nonstandard', 'misspelling', 'Munster', 'Ulster',
        'Connacht', 'Cois-Fharraige', 'Galway', 'Mayo', 'Kerry', 'Donegal', 'Waterford',
        'Cork', 'vulgar', 'derogatory', 'Old-Irish', 'Middle-Irish', 'pre-standard'}

POINTER = re.compile(r'^(?:alternative|obsolete|archaic|dated|rare|nonstandard|pre-standard|'
                     r'superseded|eclipsed|lenited|h-prothesized|t-prothesized)\b[^;]*\bof\b', re.I)

SKIP_FORM_TAGS = {'table-tags', 'inflection-template'}

# A gloss that only NAMES an inflection ("first-person singular present indicative of
# tuig") is a pointer however the entry is tagged: kaikki leaves many untagged, and they
# made `tuigim`, `ithim` and `léinn` cards of their own.
GRAM = set('first-person second-person third-person singular plural present past future '
           'conditional imperative indicative subjunctive habitual genitive vocative dative '
           'nominative participle autonomous analytic synthetic relative dependent independent '
           'comparative superlative lenited eclipsed masculine feminine and or form verbal noun '
           'past/future present/future indicative/imperative habitual/past '
           'subjunctive/past'.split())


def names_inflection(g):
    head, sep, _ = g.partition(' of ')
    return bool(sep) and all(w in GRAM for w in head.replace('/', ' ').split())


# The particles, articles and prepositions no other lemma may claim as its form.
FUNCTION = {'a', 'an', 'na', 'ar', 'ag', 'i', 'le', 'do', 'de', 'go', 'is', 'ní', 'sin', 'seo',
            'ó', 'as', 'faoi', 'mar', 'ach', 'nó', 'gur', 'nach', 'níos', 'ná', 'ba', 'gan'}


def head_args(e):
    """The head template's label/value pairs: {'genitive singular': 'tí', ...}."""
    out = {}
    for h in e.get('head_templates') or []:
        if h.get('name') != 'head':
            continue
        a = h.get('args') or {}
        i = 3
        while str(i) in a or str(i + 1) in a:
            k, v = a.get(str(i), ''), a.get(str(i + 1), '')
            if k and v and '{' not in v and v not in ('-', '~'):
                out.setdefault(k, nfc(v))
            i += 2
        g = a.get('g', '')
        if g:
            out['_g'] = g
    return out


def gender_of(e, h):
    g = h.get('_g', '')
    if g.startswith('m'):
        return 'm'
    if g.startswith('f'):
        return 'f'
    tags = {t for s in e.get('senses', []) for t in (s.get('tags') or [])}
    if 'masculine' in tags and 'feminine' not in tags:
        return 'm'
    if 'feminine' in tags and 'masculine' not in tags:
        return 'f'
    return ''


def ipa_of(e):
    out = []
    for s in e.get('sounds') or []:
        ipa = s.get('ipa')
        if ipa and (ipa.startswith('/') or not out):
            out.append([nfc(ipa), [t for t in (s.get('tags') or [])]])
    return out[:4]


def main():
    lex, forms_of, ptr = {}, collections.defaultdict(set), {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        word, pos = nfc(e.get('word', '')), e.get('pos', '')
        if not word or (pos not in KEEP_POS and not (pos == 'name' and word in NAME_OK)):
            continue
        if word.startswith('-') or word.endswith('-') or '/' in word:
            continue
        key = low(word)
        glosses, points = [], []
        for s in e.get('senses') or []:
            tags = s.get('tags') or []
            gl = s.get('glosses') or []
            if not gl:
                continue
            g = nfc(gl[-1]).strip()
            if 'form-of' in tags or 'alt-of' in tags or POINTER.match(g) or names_inflection(g):
                for fo in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    w = nfc(fo.get('word', ''))
                    if w:
                        points.append((low(w), 'alt-of' in tags or POINTER.match(g) is not None,
                                       sorted(tags)))
                continue
            glosses.append({'g': g, 'tags': sorted(t for t in tags if t not in ('masculine', 'feminine')),
                            'weak': bool(set(tags) & WEAK)})
        for tgt, _, tags in points:
            forms_of[tgt].add(key)
        if not glosses:
            # a pointer: an alternative spelling the inventory may resolve through
            # never through a NONSTANDARD spelling: `na` is the plural article (a form of
            # `an`) and only a nonstandard spelling of `ina`, which it had resolved to
            alts = [t for t, is_alt, tags in points if is_alt and 'nonstandard' not in tags]
            if alts and key not in ptr:
                ptr[key] = {'word': word, 'alt_of': alts[0]}
            # an irregular verb's past (`rinne` "past analytic independent of déan")
            for tgt, _, tags in points:
                if pos == 'verb' and 'past' in tags and 'analytic' in tags and not \
                        set(tags) & {'habitual', 'subjunctive', 'dependent', 'archaic', 'dialectal',
                                     'autonomous', 'Ulster', 'Munster', 'Connacht'}:
                    rank = 0 if 'independent' in tags else 1
                    ptr.setdefault('_past', {}).setdefault(tgt, []).append([rank, word])
            continue
        h = head_args(e)
        table = []
        for fm in e.get('forms') or []:
            t = fm.get('tags') or []
            v = nfc(fm.get('form', ''))
            if not v or set(t) & SKIP_FORM_TAGS or v in ('-', '—'):
                continue
            if low(v) in PRON and pos == 'verb':
                continue        # a table's stray `sí` cell (`cheannaigh sé`, `sí`)
            table.append({'f': v, 't': sorted(t)})
        tt = [fm.get('form') for fm in e.get('forms') or [] if fm.get('tags') == ['table-tags']]
        ent = {'pos': 'name' if pos == 'name' else pos, 'etym': str(e.get('etymology_number', '')),
               'gender': gender_of(e, h), 'glosses': glosses, 'head': {k: v for k, v in h.items()
                                                                       if not k.startswith('_')},
               'table': table, 'ttag': tt[0] if tt else '', 'ipa': ipa_of(e)}
        L = lex.setdefault(key, {'word': word, 'entries': []})
        L['entries'].append(ent)

    pasts = ptr.pop('_past', {})
    for k, v in pasts.items():
        if k in lex:
            lex[k]['past'] = sorted(v)[0][1]
    for k, P in ptr.items():
        if k not in lex:
            lex[k] = P

    # every spelling that stands for a lemma: its head forms, its table, its pointers
    index = collections.defaultdict(set)
    for k, L in lex.items():
        if 'entries' not in L:
            continue
        fs = {k}
        if ' ' in k:
            L['forms'] = [k]      # a phrase's forms never claim one of its words
            continue
        cand = set()
        for e in L['entries']:
            cand.update(form_key(v) for v in e['head'].values())
            cand.update(form_key(t['f']) for t in e['table'])
        # A TABLE'S FORM MUST BEGIN WITH THE LEMMA'S OWN LETTER once its mutation is undone.
        # kaikki's cells carry stray particles and prepositions (`a hiatraigineach` gave
        # `iatraigineach` the form `a`; `ghoill ar` gave `goill` the form `ar`), and one
        # such cell made "iatrogenic" a top-30 word.  The suppletive forms (`tá`, `rinne`,
        # `chuaigh`, `mná`) are entries of their own that say whose form they are, below.
        fs.update(x for x in cand if len(x) > 1 and x not in FUNCTION
                  and any(c[0] == k[0] for c in plain(x)))
        if L.get('past'):
            fs.add(low(L['past']))
        fs.update(x for x in forms_of.get(k, ()) if x not in FUNCTION or x == k)
        fs.discard('')
        L['forms'] = sorted(fs)
        for x in fs:
            index[x].add(k)

    # ---- frequency ---------------------------------------------------------------------
    idt, n_idt = collections.Counter(), 0
    for p in sorted(glob.glob('ga_idt-ud-*.conllu')):
        for line in open(p, encoding='utf-8'):
            c = line.split('\t')
            if len(c) == 10 and c[0].isdigit():
                if c[3] in ('PUNCT', 'NUM', 'SYM', 'X', 'PROPN'):
                    continue
                n_idt += 1
                idt[low(c[2])] += 1
    tat, n_tat = collections.Counter(), 0
    for row in csv.reader(open('gle_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) < 3:
            continue
        for i, tok in enumerate(tokens(row[2])):
            n_tat += 1
            # a capital inside a sentence is a name (Tatoeba's `Tom` is not `tom` "bush")
            if i and tok != tok.lower():
                continue
            # A WORD IS SHARED among every lemma any of its spellings could be -- as written,
            # and with its mutation undone (`bhfuair` is eclipsed `fuair`, the past of
            # faigh, though a table lists it under `fuaigh` "sew" too) -- IN PROPORTION TO
            # THE LEMMAS' TREEBANK COUNTS, plus one (the TORFL rule).  Split evenly,
            # `rinne` made `rinn` "point" an A1 word, `aige` "at him" `uige` "gauze",
            # `leo` "with them" `leo` "slush" and `chun` "towards" `cun` "stoutness"
            claim = set()
            for c in plain(tok):
                if c in lex and 'entries' in lex[c]:
                    claim.add(c)
                claim |= index.get(c, set())
            if claim:
                w = {k: idt.get(k, 0) + 1 for k in claim}
                tot = sum(w.values())
                for k in claim:
                    tat[k] += w[k] / tot
    for k, L in lex.items():
        L['freq'] = round(idt.get(k, 0) * 1e6 / max(n_idt, 1) + tat.get(k, 0) * 1e6 / max(n_tat, 1), 2)
        L['tat'] = round(tat.get(k, 0), 2)
    # a PHRASE is dealt by its rarest word's count, halved (the Hindi rule): an estimate,
    # and only the inventory chooses phrases, so it decides nothing but the order
    for k, L in lex.items():
        if ' ' in k and 'entries' in L:
            ws = [lex[w]['freq'] for w in k.split() if w in lex]
            L['freq'] = max(L['freq'], round(min(ws) / 2, 2) if len(ws) == len(k.split()) else 0)
    json.dump(lex, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    n = sum(1 for L in lex.values() if 'entries' in L)
    print(f'  {n} lemmas, {len(lex) - n} pointers; treebank {n_idt} words, Tatoeba {n_tat}')


if __name__ == '__main__':
    main()
