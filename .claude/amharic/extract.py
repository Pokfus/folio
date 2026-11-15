#!/usr/bin/env python3
"""Every Amharic lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-am.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `am_counts.json` (wikitext.py's counts of the Amharic
Wikipedia) and writes `lex.json`.  Level-independent: built once and kept.

ONE LEMMA PER KEY (`am.key`).  Wiktionary often has a page for each spelling of
one word -- ውሃ and ውኃ "water", both with the gloss -- and the homophone letters
make those spellings one key, so they are one lemma here, its senses merged.
The card heads with the spelling the Amharic Wikipedia writes most (`spell`
counts; ties to the first in Unicode order).

WHY A LEMMA FREQUENCY.  Amharic writes its prepositions and endings onto the
word: ቤት "house" is also ቤቱ "the house", ቤቶች "houses", በቤቱ "in the house",
የቤቱ "of the house".  A lemma's frequency here is the sum, over the Wikipedia's
articles (`df`, each key once per article), of the keys of every form Wiktionary
lists for it -- the headword, its other spellings, its plurals, its declension
table where it has one, the infinitive that names a verb -- and then, for a key no
lemma lists, of the first stem `am.stems` reaches by peeling the commonest
prefixes and endings that SOME lemma does list.  A key several lemmas share is
split in proportion to what each earns alone, plus one, over two rounds (the
TORFL / Hindi / Zulu rule).

VERBS ARE COUNTED POORLY, and the deck says so: English Wiktionary gives an
Amharic verb its third-person perfective (ሄደ "he went", the dictionary form) and
at most an infinitive -- no conjugation table -- and an Amharic verb's other
forms are built on other stems (ይሄዳል "he goes").  Only the perfective's
person endings are peeled (ሄድኩ, ሄደች), so a verb ranks lower than it is used;
the inventory carries the everyday verbs whatever their count.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form of or
an alternative to another word is not a lemma; it is kept only as a POINTER the
inventory may resolve through, and an infinitive's pointer gives its verb the
infinitive (`inf`).
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from am import key, nfc, is_amharic, stems

DUMP, COUNTS, OUT = 'kaikki-am.jsonl', 'am_counts.json', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'prep', 'postp', 'pron',
            'conj', 'particle', 'det', 'num'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'slang', 'euphemistic', 'offensive'}

KEEP_TAGS = {'transitive', 'intransitive', 'causative', 'stative', 'copulative',
             'formal', 'informal', 'figuratively', 'honorific', 'masculine', 'feminine'}


def is_formof(s):
    t = s.get('tags') or []
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    g = re.sub(r'\s*[.;:,]\s*$', '', g)
    return g


def head_args(e, name):
    for h in e.get('head_templates') or []:
        if h.get('name') == name:
            return h.get('args') or {}
    return None


def romanisation(e):
    for f in e.get('forms') or []:
        if 'romanization' in (f.get('tags') or []):
            return nfc(f['form'])
    return ''


def gender(e):
    """m, f, 'm or f' (by the person meant), or ''."""
    a = head_args(e, 'am-noun') or {}
    g = a.get('g', '')
    return {'m': 'm', 'f': 'f', 'mf': 'm or f', 'mfbysense': 'm or f'}.get(g, '')


def plurals(e):
    out = []
    for f in e.get('forms') or []:
        t = f.get('tags') or []
        if t == ['plural'] or t == ['also', 'plural']:
            fm = nfc(f.get('form', ''))
            if is_amharic(fm):
                out.append([fm, nfc(f.get('roman', ''))])
    return out


def table(e):
    """The declension table's forms (the definite, the object, the possessives), '-' dropped."""
    out = []
    for f in e.get('forms') or []:
        if f.get('source') != 'declension':
            continue
        t = [x for x in f.get('tags') or [] if x != 'error-unrecognized-form']
        if 'table-tags' in t or 'inflection-template' in t:
            continue
        fm = nfc(f.get('form', ''))
        if fm and fm != '-' and is_amharic(fm):
            out.append({'f': fm, 'r': nfc(f.get('roman', '')), 't': t})
    return out


def alternatives(e):
    return [nfc(f['form']) for f in e.get('forms') or []
            if 'alternative' in (f.get('tags') or []) and is_amharic(nfc(f.get('form', '')))]


def main():
    C = json.load(open(COUNTS, encoding='utf-8'))
    counts, spell = C['df'], C['spell']

    lemmas, pointers, infs = {}, {}, {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_amharic(w):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')
                and 'morpheme' not in (s.get('tags') or [])]
        if not real:
            for s in senses:
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_amharic(tw) and key(tw) != key(w):
                        pointers.setdefault(key(w), key(tw))
                        if 'infinitive' in (s.get('tags') or []):
                            infs.setdefault(key(tw), [w, romanisation(e)])
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK), 'tags': sorted(tags & KEEP_TAGS)})
        if not gl:
            continue
        ex = []
        for s_ in real:
            for x in s_.get('examples') or []:
                en = x.get('english') or x.get('translation') or ''
                if x.get('text') and en and is_amharic_text(x['text']):
                    ex.append([nfc(x['text']), en.strip(), nfc(x.get('roman', '') or '')])
        ent = {'pos': pos, 'word': w, 'roman': romanisation(e), 'g': gender(e) if pos == 'noun' else '',
               'pl': plurals(e), 'table': table(e), 'alts': alternatives(e),
               'glosses': gl, 'ex': ex, 'etym': e.get('etymology_number', '') or ''}
        L = lemmas.setdefault(key(w), {'spellings': [], 'entries': []})
        if w not in L['spellings']:
            L['spellings'].append(w)
        L['entries'].append(ent)

    for k, L in lemmas.items():
        sp = sorted(set(L['spellings']), key=lambda s: (-spell.get(s, 0), s))
        L['word'] = sp[0]
        L['spellings'] = sp
        if k in infs:
            L['inf'] = infs[k]

    # ---- the lemma frequency ----
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        mine = {k}
        for ent in L['entries']:
            for fm, _ in ent['pl']:
                mine.add(key(fm))
            for t in ent['table']:
                mine.add(key(t['f']))
            for a in ent['alts']:
                mine.add(key(a))
        for p, target in pointers.items():
            if target == k:
                mine.add(p)
        for form in mine:
            if form and ' ' not in form:
                claims[form].add(k)
    # every counted key goes to the lemmas that list it, else to the first stem some lemma lists
    assign = collections.defaultdict(float)     # frozenset(claimants) -> count
    unmatched = 0
    for form, c in counts.items():
        ks = claims.get(form)
        if not ks:
            for _, _, s in stems(form):
                if s in claims and len(s) >= 3:
                    ks = claims[s]
                    break
        if ks:
            assign[frozenset(ks)] += c
        else:
            unmatched += c
    own = collections.defaultdict(float)
    for ks, c in assign.items():
        if len(ks) == 1:
            own[next(iter(ks))] += c
    freq = dict(own)
    for _ in range(2):
        nxt = collections.defaultdict(float, own)
        for ks, c in assign.items():
            if len(ks) > 1:
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

    json.dump({'lemmas': lemmas, 'pointers': pointers}, open(OUT, 'w', encoding='utf-8'),
              ensure_ascii=False, sort_keys=True)
    tot = sum(counts.values())
    print(f'  {len(lemmas)} lemmas, {len(pointers)} pointers; '
          f'{100 * (tot - unmatched) / tot:.0f}% of the counted keys reach a lemma')


def is_amharic_text(t):
    return bool(re.search('[ሀ-ፚ]', t or ''))


if __name__ == '__main__':
    main()
