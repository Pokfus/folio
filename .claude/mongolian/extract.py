#!/usr/bin/env python3
"""Every Mongolian lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-mn.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and `mn_counts.json` (wikitext.py's counts of the Mongolian
Wikipedia) and writes `lex.json`.  Level-independent: built once and kept.

ONE LEMMA PER CYRILLIC HEADWORD (`mn.key`); its entries are every part of
speech Wiktionary gives that spelling.  Entries filed under the traditional
Mongolian script are not read.

WHY A LEMMA FREQUENCY.  A Mongolian noun is met mostly in its case forms
(байшин, байшинд, байшингаас ...), a verb never in its dictionary form alone
(явах, явна, явсан ...).  A lemma's frequency is the sum, over the Wikipedia's
articles (`df`, each form once per article), of every form Wiktionary lists for
it -- the headword, its declension table where it has one, its plural, its
other spellings, and every form-of page that points to it ("байшингийн:
genitive singular of байшин") -- and then, for a form no lemma lists, of the
first stem `mn.stems` reaches that some lemma lists, a verb being reached
through its stem (`mn.verb_stem`).  A form several lemmas share is split in
proportion to what each earns alone, plus one, over two rounds (the TORFL /
Hindi / Zulu rule).

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix or a proper name.  An entry whose every sense is a form of or
an alternative to another word is not a lemma; it is kept only as a POINTER the
inventory may resolve through.
"""
import collections, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mn import key, nfc, is_mongolian, has_cyrillic, stems, verb_stem

DUMP, COUNTS, OUT = 'kaikki-mn.jsonl', 'mn_counts.json', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'postp', 'pron',
            'conj', 'particle', 'det', 'num'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'slang', 'euphemistic', 'offensive', 'China', 'Inner-Mongolia', 'Buryat',
        'Kalmyk', 'Oirat'}

KEEP_TAGS = {'transitive', 'intransitive', 'causative', 'passive', 'formal', 'informal',
             'figuratively', 'honorific', 'colloquial'}

# the declension table's cells a card may show, by the tags that name each
CELLS = {
    'pl': {'definite', 'nominative', 'plural'},
    'gen': {'genitive', 'indefinite', 'singular'},
    'acc': {'accusative', 'indefinite', 'singular'},
    'dat': {'dative', 'indefinite', 'locative', 'singular'},
    'abl': {'ablative', 'indefinite', 'singular'},
    'ins': {'indefinite', 'instrumental', 'singular'},
}


def is_formof(s):
    t = s.get('tags') or []
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


# A gloss that only names another word's form ("past participle in -сан (-san) of байх",
# "dative-locative singular of байшин"): Wiktionary does not always tag such senses form-of.
GRAMMAR = re.compile(r'\b(participle|converb|cvb|tense|voice|mood|case|singular|plural|genitive|'
                     r'dative|ablative|comitative|possessive|permissive|voluntative|benedictive|'
                     r'supine|harmonic form|eye-spelling|synonym|privative|intensive|indicative|'
                     r'aspect|imperative|narrative|habitual|conditioned form|form)\b.*?'
                     r'\bof ([А-Яа-яЁёӨөҮү][А-Яа-яЁёӨөҮү -]*)')
LETTER = re.compile(r'name of the Cyrillic script letter', re.I)


def grammar_target(g):
    m = GRAMMAR.search(g or '')
    return nfc(m.group(2)).strip() if m else ''


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    g = re.sub(r'\s*[.;:,]\s*$', '', g)
    return g


def romanisation(e):
    for f in e.get('forms') or []:
        if 'romanization' in (f.get('tags') or []) and not f['form'].endswith('declension'):
            return nfc(f['form'])
    return ''


def declension(e):
    """The table's cells (`CELLS`), each the first form whose tags are exactly that set
    (a possessive or directive cell carries more tags and is not read); and every form of
    the table, for the counts."""
    cells, every = {}, []
    for f in e.get('forms') or []:
        if f.get('source') != 'declension':
            continue
        t = set(f.get('tags') or [])
        if t & {'table-tags', 'inflection-template'}:
            continue
        fm = nfc(f.get('form', ''))
        if not fm or fm == '-' or not is_mongolian(fm):
            continue
        # a cell that does not begin as the headword does is a stray of the table's layout
        # (the directive's "руу", the ordinal's "дахь"), not a form of the word
        if key(fm)[:2] != key(e['word'])[:2]:
            continue
        every.append(fm)
        if 'error-unrecognized-form' in t:
            continue
        for name, want in CELLS.items():
            if t == want and name not in cells:
                cells[name] = fm
    return cells, every


def head_plurals(e):
    return [nfc(f['form']) for f in e.get('forms') or []
            if f.get('source') is None and set(f.get('tags') or []) == {'definite', 'plural'}
            and is_mongolian(nfc(f.get('form', '')))]


def derived_verbs(e):
    """The causative and passive Wiktionary's verb headword line names (явуулах, ...)."""
    out = {}
    for f in e.get('forms') or []:
        t = f.get('tags') or []
        fm = nfc(f.get('form', ''))
        if f.get('source') is None and t in (['causative'], ['passive']) and is_mongolian(fm):
            out.setdefault(t[0], fm)
    return out


def alternatives(e):
    return [nfc(f['form']) for f in e.get('forms') or []
            if 'alternative' in (f.get('tags') or []) and is_mongolian(nfc(f.get('form', '')))]


def head_dec(e):
    """'hidden-n' or 'hidden-g' where the headword line names it (the noun's stem ends in
    an unwritten н or г that its case forms show: ус "water", усны "of the water")."""
    for h in e.get('head_templates') or []:
        d = (h.get('args') or {}).get('dec', '')
        if d in ('n', 'g'):
            return 'hidden-' + d
    return ''


def main():
    C = json.load(open(COUNTS, encoding='utf-8'))
    counts, spell = C['df'], C['spell']

    lemmas, pointers = {}, {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS or not is_mongolian(w):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s) and s.get('glosses')
                and not ({'morpheme', 'letter'} & set(s.get('tags') or []))
                and not LETTER.search(s['glosses'][-1])]
        for s in real:
            tw = grammar_target(s['glosses'][-1])
            if tw and is_mongolian(tw) and key(tw) != key(w):
                pointers.setdefault(key(w), key(tw))
        real = [s for s in real if not grammar_target(s['glosses'][-1])]
        if not real:
            for s in senses:
                for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                    tw = nfc(t.get('word', ''))
                    if is_mongolian(tw) and key(tw) != key(w):
                        pointers.setdefault(key(w), key(tw))
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                # an onomatopoeia's homograph (хүн "the sound of ringing a hollow object") and a
                # word "only used in" a compound are weak senses: shown last, never dealt alone
                weak = bool(tags & WEAK) or bool(re.match(r'(the sound of|only used in)\b', g, re.I))
                gl.append({'g': g, 'weak': weak, 'tags': sorted(tags & KEEP_TAGS)})
        if not gl:
            continue
        ex = []
        for s_ in real:
            for x in s_.get('examples') or []:
                en = x.get('english') or x.get('translation') or ''
                if x.get('text') and en and has_cyrillic(x['text']) and x.get('type') != 'quotation':
                    ex.append([nfc(x['text']), en.strip()])
        cells, every = declension(e)
        pl = head_plurals(e)
        if pl and 'pl' not in cells:
            cells['pl'] = pl[0]
        ent = {'pos': pos, 'word': w, 'roman': romanisation(e), 'cells': cells,
               'table': sorted(set(every + pl)), 'alts': alternatives(e),
               'dv': derived_verbs(e) if pos == 'verb' else {}, 'dec': head_dec(e),
               'glosses': gl, 'ex': ex}
        L = lemmas.setdefault(key(w), {'word': w, 'entries': []})
        L['entries'].append(ent)

    # ---- the lemma frequency ----
    claims = collections.defaultdict(set)
    vstems = collections.defaultdict(set)
    for k, L in lemmas.items():
        mine = {k}
        for ent in L['entries']:
            mine.update(key(t) for t in ent['table'])
            mine.update(key(a) for a in ent['alts'])
            if ent['pos'] == 'verb' and ' ' not in k:
                vs = verb_stem(k)
                if len(vs) >= 2:
                    vstems[vs].add(k)
        for form in mine:
            if form and ' ' not in form:
                claims[form].add(k)
    for p, target in pointers.items():
        if target in lemmas and ' ' not in p:
            claims[p].add(target)
    assign = collections.defaultdict(float)     # frozenset(claimants) -> count
    unmatched = 0
    for form, c in counts.items():
        ks = claims.get(form)
        if not ks:
            for _, _, s in stems(form):
                if len(s) < 2:
                    continue
                if s in claims:
                    ks = claims[s]
                    break
                if s in vstems:
                    ks = vstems[s]
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
                wts = {k: freq.get(k, 0) + 1 for k in sorted(ks)}   # sorted: a set's order varies by run
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
          f'{100 * (tot - unmatched) / tot:.0f}% of the counted forms reach a lemma')


if __name__ == '__main__':
    main()
