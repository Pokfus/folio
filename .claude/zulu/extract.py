#!/usr/bin/env python3
"""Every Zulu lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-zu.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `zu_counts.json` (wikitext.py's counts of the Zulu Wikipedia)
and writes `lex.json`.  Level-independent: built once and kept.

WHY A LEMMA FREQUENCY.  Zulu is written conjunctively: the noun `umuntu` is
also `abantu`, `kumuntu`, `ngumuntu`, `womuntu` ...; the verb `-hamba` is
`ngiyahamba`, `bahamba`, `uhambile` and three hundred more.  A word form is a
whole phrase, so a raw form count says almost nothing about a word.  A lemma's
frequency here is the sum of the counts of EVERY form Wiktionary's own table
lists for it (its `zu-infl-*` table, the noun's plural, the bare word), each
form counted ONCE PER ARTICLE (`df`, so a bot stub repeating itself counts once).

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE (the TORFL / Hindi rule):
each shared form's count is divided among its claimants in proportion to what
each earns from the forms it holds alone, plus one, over two rounds.

THE BARE STEM IS NOT A FORM.  An adjective's or relative's stem (`-khulu`,
`-manzi`) never stands alone, and a stem like `-de` would otherwise claim every
`de` in the corpus; only its table's forms count.  A verb's bare stem IS its
singular imperative (`hamba`), which its table already lists.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form of or
an alternative to another word is not a lemma (Wiktionary's plural entries --
`abantu` "plural of umuntu" -- are 228 of them); it is kept only as a POINTER
the inventory may resolve through.  A RELATIVE STEM (`-manzi` "wet", `-ze`
"empty"), which kaikki files under `conj` because its head template is
`zu-rel`, is given its own part of speech, `rel`.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zu import fold, nfc, is_zulu

DUMP, COUNTS, OUT = 'kaikki-zu.jsonl', 'zu_counts.json', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'prep', 'pron',
            'conj', 'particle', 'det'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'slang', 'euphemistic'}

KEEP_TAGS = {'transitive', 'intransitive', 'auxiliary', 'addressee-singular',
             'addressee-plural', 'in-plural', 'colloquial', 'formal', 'informal',
             'figuratively', 'honorific'}


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


def canonical(e):
    for f in e.get('forms') or []:
        if 'canonical' in (f.get('tags') or []):
            return nfc(f['form'])
    return ''


def noun_class(e):
    """(class, plural, plural class) from the zu-noun head: umúntu 1, abántu 2."""
    a = head_args(e, 'zu-noun')
    if not a:
        return '', '', ''
    cls, pcls, pl = a.get('2', ''), a.get('3', ''), a.get('4', '')
    if pcls == '-':
        pcls = ''
    if pl == '-':
        pl = ''
    if pcls and not pl:          # the plural spelt by its class's prefix: Wiktionary's forms have it
        pl = next((nfc(f['form']) for f in e.get('forms') or []
                   if 'plural' in (f.get('tags') or []) and f.get('source') != 'inflection'), '')
    return cls, nfc(pl), pcls


def table(e):
    """The inflection table's forms, in Wiktionary's order, tags kept, '-' cells dropped."""
    out = []
    for f in e.get('forms') or []:
        if f.get('source') != 'inflection':
            continue
        t = [x for x in f.get('tags') or [] if x != 'error-unrecognized-form']
        if 'table-tags' in t or 'inflection-template' in t:
            continue
        fm = nfc(f.get('form', ''))
        if not fm or fm == '-' or not is_zulu(fm.lstrip('-')):
            continue
        out.append({'f': fm, 't': t})
    return out


def main():
    C = json.load(open(COUNTS, encoding='utf-8'))
    counts = C['df']

    lemmas, pointers = {}, {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_zulu(w):
            continue
        if pos == 'conj' and (head_args(e, 'zu-rel') is not None or
                              any('relative' in (s.get('tags') or []) for s in e.get('senses') or [])):
            pos = 'rel'
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')
                and 'morpheme' not in (s.get('tags') or [])]
        if not real:
            for s in senses:
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_zulu(tw.lstrip('-')):
                        pointers.setdefault(fold(w), fold(tw.lstrip('-')))
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
                if x.get('text') and en:
                    ex.append([nfc(x['text']), en.strip()])
        cls, pl, pcls = noun_class(e) if pos == 'noun' else ('', '', '')
        ent = {'pos': pos, 'etym': e.get('etymology_number', '') or '',
               'canon': canonical(e) or w, 'cls': cls, 'pl': pl, 'pcls': pcls,
               'glosses': gl, 'table': table(e), 'ex': ex,
               'ipa': next((s.get('ipa') or s.get('other') for s in e.get('sounds') or []
                            if s.get('ipa') or s.get('other')), '')}
        L = lemmas.setdefault(fold(w), {'word': w, 'entries': []})
        if L['word'] != L['word'].lower() and w == w.lower():
            L['word'] = w            # isonto "week", not iSonto "Sunday", heads the page
        L['entries'].append(ent)

    # ---- the lemma frequency ----
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        mine = set()
        for ent in L['entries']:
            stem = ent['canon'].startswith('-')
            if not stem and ' ' not in k:
                mine.add(k)
            if ent['pl']:
                mine.add(fold(ent['pl']))
            for t in ent['table']:
                if not t['f'].startswith('-'):
                    mine.add(fold(t['f']))
        for p, target in pointers.items():
            if target == k:
                mine.add(p)
        for form in mine:
            if ' ' not in form:
                claims[form].add(k)
    own = collections.defaultdict(float)
    for form, ks in claims.items():
        if len(ks) == 1:
            own[next(iter(ks))] += counts.get(form, 0)
    freq = dict(own)
    for _ in range(2):
        nxt = collections.defaultdict(float, own)
        for form, ks in claims.items():
            if len(ks) > 1:
                c = counts.get(form, 0)
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
    print(f'  {len(lemmas)} lemmas, {len(pointers)} pointers')


if __name__ == '__main__':
    main()
