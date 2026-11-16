#!/usr/bin/env python3
"""Every Navajo lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-nv.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `nv_counts.json` (wikitext.py's counts of the Navajo
Wikipedia) and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  Navajo builds its words with prefixes: the noun `amá`
"mother" is `shimá` "my mother", `bimá` "his/her mother"; the verb `yáłtiʼ`
"he/she is speaking" is `yáshtiʼ` "I am speaking" and a dozen more.  A lemma's
Wikipedia frequency here is the sum of the counts of EVERY form Wiktionary gives it: the
bare word, a noun's possessed forms (its own table), its plural, and every
Wiktionary entry that is a form of it ("first-person singular imperfective of
yáłtiʼ" -- 14,800 of kaikki's 17,500 verb entries are such forms), each form
counted ONCE PER ARTICLE (`df`).

A SECOND, SMALLER CORPUS: the 2,500 usage examples of Wiktionary's Navajo entries
(`ex_n`, counted per sentence, under other headwords only).  The Navajo Wikipedia
is nearly all bot-written stubs about animals and plants (median article: 59
words), so a ranking by it alone puts "stag beetle" and "inch" among the
commonest words of the language.  The two are combined into `score`, below.

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE (the TORFL / Hindi /
Zulu rule): each shared form's count is divided among its claimants in
proportion to what each earns from the forms it holds alone, plus one, over two
rounds.

THE LOOSE FALLBACK (`nv.loose`, the Hausa rule).  A corpus token no lemma claims
on the strict key (tone and nasal marks kept) is credited on the loose key
(marks dropped) -- only when it is four letters or more, so a short particle
cannot take the count of another short word written without its marks.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix, a root, a stem or a proper name.  An entry whose every sense
is a form of, or an alternative to, another word is not a lemma; it is kept as
a POINTER (with its tags, so the card can print a verb's "I" form) the
inventory may also resolve through.
"""
import collections, json, math, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nv import norm, loose, nfc, is_navajo, tokens

DUMP, COUNTS, OUT = 'kaikki-nv.jsonl', 'nv_counts.json', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'postp', 'pron',
            'conj', 'particle', 'det', 'num'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'slang', 'euphemistic'}

POSS = {('first-person', 'singular'): 'my', ('third-person',): 'his/her'}


def is_formof(s):
    t = s.get('tags') or []
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    g = re.sub(r'\s*[.;:,]\s*$', '', g)
    return g


def noun_forms(e):
    """A noun's possessed forms (my, his/her), its plural(s) and its head's possessed form."""
    out = []
    for f in e.get('forms') or []:
        t = tuple(sorted(x for x in f.get('tags') or [] if x != 'error-unrecognized-form'))
        fm = nfc(f.get('form', ''))
        if not fm or fm == '-' or 'table-tags' in t or 'inflection-template' in t:
            continue
        if not is_navajo(fm):
            continue
        if t == ('plural',):
            out.append({'k': 'plural', 'f': fm})
        elif t == ('possessed-form',):
            out.append({'k': 'possessed', 'f': fm})
        elif t in (('first-person', 'singular'),):
            out.append({'k': 'my', 'f': fm})
        elif t == ('third-person',):
            out.append({'k': 'his/her', 'f': fm})
        elif t == ('indefinite',):
            out.append({'k': 'indef', 'f': fm})
        elif t and set(t) & {'first-person', 'second-person', 'third-person', 'fourth-person',
                              'indefinite', 'duoplural'}:
            out.append({'k': 'table', 'f': fm})
    return out


def main():
    C = json.load(open(COUNTS, encoding='utf-8'))
    counts = C['df']

    lemmas, pointers = {}, {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_navajo(w) or w.startswith('-') or w.endswith('-'):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')]
        if not real:
            for s in senses:
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_navajo(tw):
                        tags = sorted(x for x in s.get('tags') or [] if x not in ('form-of', 'alt-of'))
                        pointers.setdefault(norm(w), []).append(
                            {'to': norm(tw), 'word': w, 'pos': pos, 'tags': tags,
                             'extra': t.get('extra', '')})
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK)})
        if not gl:
            continue
        ex = []
        for s_ in real:
            for x in s_.get('examples') or []:
                en = x.get('english') or x.get('translation') or ''
                tx = nfc(x.get('text', ''))
                if tx and en and '\n' not in tx and '\n' not in en:
                    ex.append([tx, re.sub(r'\s+', ' ', en).strip()])
        ent = {'pos': pos, 'etym': str(e.get('etymology_number', '') or ''),
               'glosses': gl, 'forms': noun_forms(e) if pos == 'noun' else [], 'ex': ex,
               'ipa': next((s['ipa'] for s in e.get('sounds') or [] if s.get('ipa')), '')}
        L = lemmas.setdefault(norm(w), {'word': w, 'entries': []})
        if L['word'] != L['word'].lower() and w == w.lower():
            L['word'] = w
        L['entries'].append(ent)

    # ---- a possessed form filed as its own noun is a pointer, not a second lemma ----
    # Wiktionary files `bijáád` "his/her leg" beside `ajáád` "leg", and `hakʼéí` "one's kin" beside
    # `akʼéí` "kin", each with the same possession table; each would take half the count and a card
    # of its own.  Nouns linked through each other's tables are one word, and the card is the
    # INDEFINITE a- form (the dictionary form), else one whose gloss is not "his/her …" or "one's …".
    parent = {}

    def find(x):
        while parent.get(x, x) != x:
            x = parent[x]
        return x
    nouns = {k for k, L in lemmas.items() if all(e['pos'] == 'noun' for e in L['entries'])}
    for k in nouns:
        for ent in lemmas[k]['entries']:
            for fm in ent['forms']:
                c = norm(fm['f'])
                if fm['k'] in ('my', 'his/her', 'table', 'indef') and c in nouns and c != k:
                    parent[find(c)] = find(k)
    groups = collections.defaultdict(list)
    for k in nouns:
        groups[find(k)].append(k)

    def rank(k):
        g = lemmas[k]['entries'][0]['glosses'][0]['g'].lower()
        poss = bool(re.match(r"(his|her|its|their|one[’']s|my|your)\b", g))
        indef = any(fm['k'] == 'indef' and norm(fm['f']) == k
                    for e in lemmas[k]['entries'] for fm in e['forms'])
        return (poss, not indef, not k[:1] in 'aá', len(k), k)
    for ks in groups.values():
        if len(ks) < 2:
            continue
        keep = min(ks, key=rank)
        for k in ks:
            if k != keep:
                pointers.setdefault(k, []).append({'to': keep, 'word': lemmas[k]['word'], 'pos': 'noun',
                                                   'tags': ['possessed'], 'extra': ''})
                del lemmas[k]

    # ---- the lemma frequency ----
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        mine = {k} if ' ' not in k else set()
        for ent in L['entries']:
            for fm in ent['forms']:
                mine.add(norm(fm['f']))
        for p, ps in pointers.items():
            if any(x['to'] == k for x in ps):
                mine.add(p)
        for form in mine:
            if ' ' not in form:
                claims[form].add(k)
    # the loose fallback: a token with no strict claimant, four letters or more
    by_loose = collections.defaultdict(set)
    for form, ks in claims.items():
        by_loose[loose(form)] |= ks
    eff = collections.defaultdict(float)
    for tok, c in counts.items():
        if tok in claims:
            eff[tok] += c
        elif len(loose(tok)) >= 4 and loose(tok) in by_loose:
            lf = '~' + loose(tok)
            eff[lf] += c
            claims[lf] = by_loose[loose(tok)]
    own = collections.defaultdict(float)
    for form, ks in claims.items():
        if len(ks) == 1:
            own[next(iter(ks))] += eff.get(form, 0)
    freq = dict(own)
    for _ in range(2):
        nxt = collections.defaultdict(float, own)
        for form, ks in claims.items():
            if len(ks) > 1:
                c = eff.get(form, 0)
                wts = {k: freq.get(k, 0) + 1 for k in ks}
                tot = sum(wts.values())
                for k in ks:
                    nxt[k] += c * wts[k] / tot
        freq = dict(nxt)
    for k, L in lemmas.items():
        if ' ' in k:                         # a multi-word lemma: its rarest word's count, halved
            L['freq'] = min(counts.get(p, 0) for p in k.split()) / 2
        else:
            L['freq'] = round(freq.get(k, 0), 2)

    # ---- the second corpus: Wiktionary's own Navajo example sentences ----
    # A word's count here is the number of example sentences, written under OTHER headwords,
    # that use one of its forms (its own page's examples would credit every illustrated word).
    def key(t):
        if t in lemmas:
            return t
        for x in pointers.get(t, []):
            if x['to'] in lemmas:
                return x['to']
        return None
    exn, nsent = collections.Counter(), 0
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        own = key(norm(e.get('word', '')))
        for s_ in e.get('senses') or []:
            for x in s_.get('examples') or []:
                if not x.get('text'):
                    continue
                nsent += 1
                exn.update({key(t) for t in tokens(x['text'])} - {None, own})
    A = C['articles']
    for k, L in lemmas.items():
        L['ex_n'] = exn.get(k, 0)
        # THE SCORE THE CARDS ARE DEALT BY: the geometric mean of the word's share of each corpus,
        # smoothed by a half so a word absent from one is ordered by the other.  The FILL takes only
        # words present in both (select.py), which keeps out the stubs' species names (Wikipedia only)
        # and the dictionary's one-off example vocabulary (Wiktionary only).
        L['score'] = round(math.sqrt((L['freq'] + 0.5) / A * (L['ex_n'] + 0.5) / nsent) * 1e6, 2)
    print(f'  {nsent} Wiktionary example sentences counted')

    json.dump({'lemmas': lemmas, 'pointers': pointers}, open(OUT, 'w', encoding='utf-8'),
              ensure_ascii=False, sort_keys=True)
    print(f'  {len(lemmas)} lemmas, {len(pointers)} pointers')


if __name__ == '__main__':
    main()
