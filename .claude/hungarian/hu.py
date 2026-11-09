"""Small Hungarian helpers shared by every stage of `.claude/hungarian/`.

THE FOLD.  NFC and lower case -- and THE ACCENTS ARE KEPT, because Hungarian
keeps words apart by nothing else (`kor` "age" and `kór` "disease", `öt` "five"
and `őt` "him, her", `tör` "to break" and `tőr` "dagger").  One repair: the
subtitle list was mostly typed in a Latin-1 encoding that has no ő or ű, so
1.9 million of its 3.2 million lines write `õ` / `ô` for ő and `û` for ű
(`nõ` beside `nő`).  The fold maps them home, or every word with a long ö or ü
would lose most of its count.  The fold is for MATCHING only: a card prints the
dictionary's own spelling.

THE VERB TABLE (`verb_table`).  Wiktionary's Hungarian conjugation tables come
out of the kaikki.org extraction with their PERSON TAGS SHIFTED BY ONE ROW --
`látok` "I see" is tagged second person, `lát` "he sees" first person plural,
and the conditional and subjunctive carry no mood tag at all -- the fault
Turkish found in its own tables.  So a verb's cells are read by POSITION, the
order the template always writes them in (indefinite: én, te, ő, mi, ti, ők;
then definite; then the `-lak` form), and every block is checked against the
shape it must have before it is used: the present's third person is the
headword, the past's ends in -t, the conditional's in -na/-ne/-ná/-né, the
subjunctive's in -n.  A block that fails is left out and counted, never shown
wrong.  The few templates that ARE tagged properly (`van`) are read by tag.
"""
import re, unicodedata

LETTERS = 'a-záéíóöőúüűA-ZÁÉÍÓÖŐÚÜŰ'
WORD = re.compile(r"[a-záéíóöőúüűõôûA-ZÁÉÍÓÖŐÚÜŰÕÔÛ]+")
HU = re.compile(r"^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ -]+$")
REPAIR = str.maketrans({'õ': 'ő', 'ô': 'ő', 'û': 'ű', 'Õ': 'Ő', 'Ô': 'Ő', 'Û': 'Ű'})


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    return nfc(s).translate(REPAIR).lower().strip()


def is_hu(s):
    """Latin letters, Hungarian's accented vowels, spaces and hyphens -- and at least one letter."""
    s = (s or '').strip()
    return bool(s) and bool(HU.match(s)) and any(c.isalpha() for c in s)


def tokens(text):
    """The words of a sentence -- not a case ending written after a hyphen (`2:30-kor`,
    `CIA-s`), and not a capitalised word inside the sentence (`Korán` "the Quran" beside
    `korán` "early"), whose count as a dictionary word would be a coincidence."""
    text = nfc(text)
    out = []
    for m in WORD.finditer(text):
        if m.start() and text[m.start() - 1] in '-0123456789':
            continue
        w = m.group(0)
        if w[:1].isupper() and not START.match(text[:m.start()]):
            continue
        out.append(w)
    return out


START = re.compile(r'^[\W\d_]*$|.*[.!?:\u2013\u2014-]\s*["\u201e\u201d\u00bb]?$', re.S)


PERSONS = 6
SKIP_TAGS = {'inflection-template', 'table-tags', 'class'}


def _stream(forms):
    """The conjugation cells in order: a word (with its alternatives) or None for a gap."""
    out = []
    for f in forms:
        if f.get('source') != 'conjugation':
            continue
        tags = set(f.get('tags') or [])
        if tags & SKIP_TAGS or 'formal' in tags:
            continue                        # a formal row repeats the plain row after it
        fm = nfc(f.get('form', '')).strip()
        if fm.startswith('or ') and ' ' not in fm[3:] and out and out[-1]:
            if is_hu(fm[3:]) and fm[3:] not in out[-1]['w']:
                out[-1]['w'].append(fm[3:])
            continue
        alt_next = fm.endswith(' or') and ' ' not in fm[:-3]
        if alt_next:
            fm = fm[:-3]
        if not fm or ' ' in fm or fm == '-' or not is_hu(fm):
            if out and out[-1] is not None:
                out.append(None)
            continue
        if out and out[-1] and out[-1].get('open'):
            if fm not in out[-1]['w']:
                out[-1]['w'].append(fm)
            out[-1]['open'] = alt_next
            continue
        out.append({'w': [fm], 'open': alt_next, 't': tags})
    return out


def _run(st, i):
    """Six cells from i with no gap among them, else None."""
    if i + PERSONS > len(st) or any(c is None for c in st[i:i + PERSONS]):
        return None
    return [c['w'] for c in st[i:i + PERSONS]]


ENDS = {
    'past': lambda w: w.endswith('t'),
    'cond': lambda w: w.endswith(('na', 'ne', 'ná', 'né')),
    'subj': lambda w: w.endswith('n'),
}


def verb_table(forms, word):
    """{'pres', 'presdef', 'past', 'pastdef', 'cond', 'subj': [[forms] x 6], 'inf': [forms]}
    with only the blocks that passed their check, and a list of the blocks that failed."""
    conj = [f for f in forms if f.get('source') == 'conjugation']
    if not conj:
        return {}, []
    if any('indicative' in (f.get('tags') or []) for f in conj):
        return _tagged(conj, word)
    st = _stream(forms)
    out, bad = {}, []
    pres = _run(st, 0)
    if not pres or word not in pres[2]:
        return {}, ['present']
    out['pres'] = pres
    i = PERSONS
    d = _run(st, i)
    if d and all(x[0].endswith(('m', 'd', 'a', 'e', 'i', 'k', 'á', 'é')) for x in d[:1]):
        out['presdef'] = d
        i += PERSONS
        if i < len(st) and st[i] and st[i]['w'][0].endswith(('lak', 'lek')):
            i += 1
    # the past: the next run of six
    while i < len(st) and st[i] is None:
        i += 1
    p = _run(st, i)
    if p and ENDS['past'](p[2][0]):
        out['past'] = p
        i += PERSONS
        d = _run(st, i)
        if d and ENDS['past'](d[0][0][:-1] + 't') and d[2][0].endswith(('a', 'e')):
            out['pastdef'] = d
            i += PERSONS
    else:
        bad.append('past')
    inf = [nfc(f['form']) for f in conj if set(f.get('tags') or []) - {'error-unrecognized-form'} == {'infinitive'}]
    inf = inf[0] if inf and inf[0].endswith('ni') and is_hu(inf[0]) else ''
    # the conditional: the six whose first person is the infinitive's stem + -nék (látni,
    # látnék; menni, mennék) -- NOT merely the first -nék, which for `megy` is the archaic
    # past `menék`
    ci = next((j for j in range(i, len(st)) if inf and st[j] and inf[:-2] + 'nék' in st[j]['w']
               and _run(st, j) and ENDS['cond'](_run(st, j)[2][0])), None)
    if ci is None:
        bad.append('conditional')
    else:
        out['cond'] = _run(st, ci)
        i = ci + PERSONS
    # the subjunctive: the next six whose first person ends in -k and third in -n
    si = next((j for j in range(i, len(st)) if _run(st, j) and _run(st, j)[0][0].endswith('k')
               and ENDS['subj'](_run(st, j)[2][0]) and not _run(st, j)[0][0].endswith('nék')), None)
    if si is None:
        bad.append('subjunctive')
    else:
        out['subj'] = _run(st, si)
    if inf:
        out['inf'] = [inf]
    else:
        bad.append('infinitive')
    return out, bad


_TP = [('first-person', 'singular'), ('second-person', 'singular'), ('third-person', 'singular'),
       ('first-person', 'plural'), ('second-person', 'plural'), ('third-person', 'plural')]


def _tagged(conj, word):
    def blk(*need, skip=()):
        rows = []
        for p in _TP:
            got = []
            for f in conj:
                t = set(f.get('tags') or [])
                fm = nfc(f.get('form', '')).strip()
                if fm.endswith(' or'):
                    fm = fm[:-3]
                if all(n in t for n in need + p) and not t & set(skip) and 'formal' not in t \
                        and is_hu(fm) and ' ' not in fm and fm not in got:
                    got.append(fm)
            if not got:
                return None
            rows.append(got[:3])
        return rows
    out = {}
    for k, need in (('pres', ('present', 'indicative', 'indefinite')),
                    ('presdef', ('present', 'indicative', 'definite')),
                    ('past', ('past', 'indicative', 'indefinite')),
                    ('pastdef', ('past', 'indicative', 'definite')),
                    ('cond', ('conditional', 'present', 'indefinite')),
                    ('subj', ('subjunctive', 'present', 'indefinite'))):
        b = blk(*need)
        if b:
            out[k] = b
    inf = [nfc(f['form']) for f in conj if 'infinitive' in (f.get('tags') or [])
           and not {'first-person', 'second-person', 'third-person'} & set(f.get('tags') or [])]
    if inf and is_hu(inf[0]):
        out['inf'] = [inf[0]]
    bad = [k for k in ('pres', 'past', 'cond', 'subj', 'inf') if k not in out]
    if 'pres' in out and word not in out['pres'][2]:
        return {}, ['present']
    return out, bad
