#!/usr/bin/env python3
"""Every Somali word in Wiktionary, plus the hand glosses, with a frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-so.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0), `so_counts.json` (wikitext.py's counts of the Somali Wikipedia)
and `hand.py` (Folio's glosses for the core words Wiktionary lacks), and writes
`lex.json`.  Built once for all levels (a level's hand glosses are only dealt
when its inventory names them).

ONE LEMMA PER ORDINARY SPELLING.  Somali writes no tone, so a page title is the
word as a reader meets it (`nin`), and a card is that spelling: every part of
speech Wiktionary gives it (`ka` "from" and `ka` "the") is one card.  The
headword line's ACCENTED spelling (nín, gabádh) is kept per entry as `tone`, and
printed as the card's second line only for the first entry shown (`build_deck`).

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form of
another word (`cun`'s "third-person masculine singular independent past of cun",
`buugga`) is a POINTER: its spelling is counted to the word it names.  A sense
filed rare, archaic, dialectal ... is WEAK, shown only after the ordinary ones.

THE FREQUENCY.  Somali joins its article and its endings to the word (`buugga`
"the book", `magaalada` "the city", `cunay` "ate"), so a lemma is counted over
its FORMS (`generated` and the claims in `main`): the spelling itself, its plurals, the clean one-word
forms Wiktionary's tables give, the pointer entries that name it, and the
regular endings generated here -- a noun's definite article in each of its
shapes (-ka -ga -ha -a, -ta -da -sha, the past -kii / -tii, the demonstratives
-kan -kaas -tan -taas) on the singular and on each plural, and a first-
conjugation verb's commonest endings (-ay -aa -i -a -tay -taa -nay -naa -ayaa),
or a second conjugation's (-ee: -eyay -eyaa -ayn -aysay ...).  The generated
endings are an APPROXIMATION -- no sound change is applied beyond the -o / -e
noun's -a- before the article (magaalo -> magaalada) -- and they are generated
only for a spelling of three letters or more.  A spelling claimed by several
lemmas is shared out in proportion to the lemmas' own counts (each plus one).
A multi-word lemma takes its rarest word's count, halved.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from so import key, nfc, is_somali
from hand import HAND

DUMP, COUNTS, OUT = 'kaikki-so.jsonl', 'so_counts.json', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'prep', 'pron', 'conj',
            'particle', 'det', 'num', 'article'}
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon', 'poetic',
        'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling', 'slang',
        'euphemistic', 'offensive', 'slur', 'proscribed', 'Internet', 'neologism'}
KEEP_TAGS = {'transitive', 'intransitive', 'formal', 'informal', 'figuratively', 'idiomatic',
             'interrogative'}
SEXUAL = re.compile(r'\b(?:erection|penis|vagina|vulva|sexual|intercourse|copulate|testicle|fuck)', re.I)
TAXON = re.compile(r'\([A-Z][a-z]+ [a-z]{3,}\)|^[A-Z][a-z]+ [a-z]{3,}$')

ART_M = ('ka', 'ga', 'ha', 'a', 'kii', 'gii', 'hii', 'ii', 'kan', 'kaas', 'gan', 'gaas')
ART_F = ('ta', 'da', 'sha', 'tii', 'dii', 'shii', 'tan', 'taas', 'dan', 'daas')
VERB1 = ('ay', 'aa', 'i', 'a', 'tay', 'taa', 'day', 'daa', 'nay', 'naa', 'ayaa', 'aya', 'ayay',
         'ayey', 'tid', 'een', 'aan')


def is_formof(s):
    t = s.get('tags') or []
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    return re.sub(r'\s*[.;:,]\s*$', '', g)


def head_args(e):
    for h in e.get('head_templates') or []:
        if h.get('name') == 'so-noun':
            return h.get('args') or {}
    for h in e.get('head_templates') or []:
        if h.get('name') == 'head':
            return h.get('args') or {}
    return {}


def tone(e, page):
    """The accented headword, where it is this page's word with accents added."""
    hd = ''
    for h in e.get('head_templates') or []:
        hd = (h.get('args') or {}).get('head') or ''
        if hd:
            break
    if not hd:
        for f in e.get('forms') or []:
            if 'canonical' in (f.get('tags') or []):
                hd = f['form']
                break
    hd = nfc(hd)
    return hd if hd and hd != page and key(hd) == key(page) else ''


def gender_plural(e):
    """A noun's gender and its plurals, each with its gender: ('m', [('niman', 'm')])."""
    a = head_args(e)
    g = (a.get('g') or '').split('-')[0]
    pls = []
    if 'pl' in a or 'pl2' in a:                   # so-noun
        cand = [(a.get('pl'), a.get('gpl')), (a.get('pl2'), a.get('gpl2') or a.get('gpl'))]
    else:                                          # the generic head: label / form pairs
        cand, label = [], ''
        for i in range(3, 20, 2):
            lab, fm = a.get(str(i)), a.get(str(i + 1))
            if lab is None:
                break
            if lab != 'or':
                label = lab
            if label == 'plural' and fm:            # form i+1 is the template's f<(i-1)/2>
                cand.append((fm, a.get(f'f{(i - 1) // 2}g') or ''))
    for p, gp in cand:
        p = nfc(p or '')
        if p and is_somali(p) and p not in [x for x, _ in pls]:
            pls.append((p, gp or ''))
    if not pls:
        for f in e.get('forms') or []:
            t = f.get('tags') or []
            if 'plural' in t and not ({'possessive', 'definite', 'present', 'past'} & set(t)):
                p = nfc(f['form'])
                if is_somali(p) and ' ' not in p and p not in [x for x, _ in pls]:
                    pls.append((p, 'f' if 'feminine' in t else 'm' if 'masculine' in t else ''))
    if 'p' in (a.get('g') or ''):
        pls = []                                   # a plural-only noun (biyo "water")
    return g, pls


def table_forms(e):
    out = set()
    for f in e.get('forms') or []:
        fm = nfc(f.get('form', ''))
        t = f.get('tags') or []
        if ' ' in fm or '{' in fm or not is_somali(fm) or len(fm) < 3:
            continue
        if {'table-tags', 'inflection-template'} & set(t):
            continue
        out.add(key(fm))
    return out


def stems(w):
    w = key(w)
    out = {w}
    if len(w) >= 3 and w[-1] in 'oe':
        out.add(w[:-1] + 'a')
    return out


def generated(w, pos, g, pls):
    w = key(w)
    if len(w) < 3 or ' ' in w:
        return set()
    out = set()
    if pos == 'noun':
        for s in stems(w):
            out.update(s + x for x in (ART_F if g == 'f' else ART_M))
        for p, gp in pls:
            for s in stems(p):
                out.update(s + x for x in (ART_F if gp == 'f' else ART_M))
    elif pos == 'verb':
        if w.endswith('ee'):
            b = w[:-2]
            out.update([w + 'yay', w + 'yaa', w + 'ya', w + 'yey', b + 'ayn', b + 'aysay',
                        b + 'aysaa', b + 'aynay', b + 'aynaa', b + 'eeyay', b + 'eyay'])
        elif w[-1] not in 'aeiou':
            out.update(w + x for x in VERB1)
    return out


def main():
    df = json.load(open(COUNTS, encoding='utf-8'))['df']
    lemmas, pointers = {}, collections.defaultdict(set)
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        page = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_somali(page):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')
                and not ({'morpheme', 'letter', 'no-gloss'} & set(s.get('tags') or []))
                and not re.search(r'\bof\b.*\b(?:past|present|plural|singular|imperative|'
                                  r'infinitive|definite|form)\b|\b(?:past|present|imperative|'
                                  r'plural|infinitive) (?:form )?of\b', s['glosses'][-1])]
        if not real:
            for s in senses:
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_somali(tw) and key(tw) != key(page):
                        pointers[key(tw)].add(key(page))
                m = re.search(r'\bof ([a-z\']+)$', (s.get('glosses') or [''])[-1])
                if m and key(m.group(1)) != key(page):
                    pointers[key(m.group(1))].add(key(page))
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                weak = bool(tags & WEAK) or bool(SEXUAL.search(g)) or bool(TAXON.search(g))
                gl.append({'g': g, 'weak': weak, 'tags': sorted(tags & KEEP_TAGS)})
        if not gl:
            continue
        ex = []
        for s in real:
            for x in s.get('examples') or []:
                en = (x.get('english') or x.get('translation') or '').strip()
                tx = nfc(x.get('text', ''))
                if tx and en and x.get('type') != 'quotation' and len(tx) <= 160:
                    ex.append([tx, en, [[a, b] for a, b in (x.get('bold_text_offsets') or [])],
                               x.get('text', '')])
        g, pls = gender_plural(e) if pos == 'noun' else ('', [])
        ent = {'pos': pos, 'tone': tone(e, page), 'g': g, 'pl': pls, 'glosses': gl, 'ex': ex,
               'hand': False, 'forms': sorted(table_forms(e))}
        L = lemmas.setdefault(key(page), {'word': page, 'entries': []})
        L['entries'].append(ent)

    # ---- the hand glosses: a row Wiktionary lacks, or a sense it lacks (hand.py) ----
    for w, rows in HAND.items():
        L = lemmas.setdefault(key(w), {'word': nfc(w), 'entries': []})
        for r in rows:
            pos, gloss = r[0], r[1]
            g = r[2] if len(r) > 2 else ''
            pls = [(p.strip(), '') for p in (r[3] if len(r) > 3 else '').split(',') if p.strip()]
            L['entries'].insert(0, {'pos': pos, 'tone': '', 'g': g, 'pl': pls, 'ex': [],
                                    'hand': True, 'forms': [],
                                    'glosses': [{'g': x.strip(), 'weak': False, 'tags': []}
                                                for x in gloss.split(';') if x.strip()]})

    # ---- the frequency: every lemma's forms, a shared form split by the lemmas' own counts ----
    claims = collections.defaultdict(set)
    for h, L in lemmas.items():
        fs = {h}
        for e in L['entries']:
            fs.update(key(p) for p, _ in e['pl'])
            fs.update(e['forms'])
            fs.update(generated(h, e['pos'], e['g'], e['pl']))
        fs.update(pointers.get(h, ()))
        L['_forms'] = fs
        for s in fs:
            claims[s].add(h)
    for h, L in lemmas.items():
        if ' ' in h:
            continue
        base = df.get(h, 0) + 1
        tot = 0.0
        for s in sorted(L['_forms']):              # sorted: a float sum in set order is not stable
            c = df.get(s, 0)
            if not c:
                continue
            share = sum(df.get(o, 0) + 1 for o in sorted(claims[s]) if ' ' not in o)
            tot += c * base / share
        L['freq'] = round(tot, 2)
    for h, L in lemmas.items():
        if ' ' in h:
            parts = [lemmas[p]['freq'] if p in lemmas and 'freq' in lemmas[p] else df.get(p, 0)
                     for p in h.split()]
            L['freq'] = round(min(parts) / 2, 2)
    for L in lemmas.values():
        del L['_forms']
    json.dump({'lemmas': lemmas, 'pointers': {k: sorted(v) for k, v in pointers.items()}},
              open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    print(f'  {len(lemmas)} lemmas ({sum(1 for L in lemmas.values() if any(e["hand"] for e in L["entries"]))} '
          f'with a hand gloss), {len(pointers)} pointed to')


if __name__ == '__main__':
    main()
