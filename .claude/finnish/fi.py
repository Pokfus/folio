"""Small Finnish helpers shared by every stage of `.claude/finnish/`.

THE FOLD.  NFC and lower case -- and THE DOTS ARE KEPT, because Finnish keeps
words apart by nothing else (`tuli` "fire" and `tuli` beside `tyli`; `sää`
"weather" and `saa` "gets"; `pää` "head" and `paa`).  The fold is for MATCHING
only: a card prints the dictionary's own spelling.  The subtitle list was read
for a Latin-1 fault like Hungarian's õ/û and has none: ä and ö are in Latin-1.

THE TABLES.  Unlike Hungarian's, Wiktionary's Finnish conjugation and
declension tables come out of the kaikki.org extraction with CLEAN TAGS
(`syön` first-person singular present indicative, `talon` genitive singular),
so every cell is read by its tags, never by position.  Two exceptions, found
reading the extraction (2026-11-15): the participles carry garbled tags
(`syönyt` "infinitive-i-long past"), so the past participle is read off the
perfect (`on syönyt`); and a gap is written `-`, which is skipped.
"""
import re, unicodedata

WORD = re.compile(r"[a-zA-ZåäöÅÄÖšžŠŽéÉüÜ]+")
FI = re.compile(r"^[a-zA-ZåäöÅÄÖšžŠŽéÉüÜ '-]+$")


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    return nfc(s).lower().strip()


def is_fi(s):
    """Latin letters, å ä ö (and the š ž of loanwords), spaces, hyphens and apostrophes --
    and at least one letter."""
    s = (s or '').strip()
    return bool(s) and bool(FI.match(s)) and any(c.isalpha() for c in s)


START = re.compile(r'^[\W\d_]*$|.*[.!?:–—-]\s*["”»]?$', re.S)


def tokens(text):
    """The words of a sentence -- not a case ending written after a colon or a hyphen
    (`EU:n`, `CD-levy`'s second half is a word, `2010-luvulla` is not), and not a
    capitalised word inside the sentence (`Suomi` the country beside `suomi` the
    language), whose count as a dictionary word would be a coincidence."""
    text = nfc(text)
    out = []
    for m in WORD.finditer(text):
        if m.start() and text[m.start() - 1] in ':0123456789':
            continue
        if m.start() > 1 and text[m.start() - 1] == '-' and text[m.start() - 2].isdigit():
            continue
        w = m.group(0)
        if w[:1].isupper() and not START.match(text[:m.start()]):
            continue
        out.append(w)
    return out


PERSONS = [('first-person', 'singular'), ('second-person', 'singular'), ('third-person', 'singular'),
           ('first-person', 'plural'), ('second-person', 'plural'), ('third-person', 'plural')]

# (key, the tags a cell must carry, the tags it must not)
BLOCKS = [
    ('pres', ('indicative', 'present'), ('negative', 'perfect', 'passive')),
    ('neg', ('indicative', 'present', 'negative'), ('perfect', 'passive')),
    ('past', ('indicative', 'past'), ('negative', 'passive')),
    ('perf', ('indicative', 'perfect'), ('negative', 'passive')),
    ('cond', ('conditional', 'present'), ('negative', 'passive')),
    ('imp', ('imperative', 'present'), ('negative', 'passive')),
]


def _cells(conj, need, skip):
    got = []
    for f in conj:
        t = set(f.get('tags') or [])
        fm = nfc(f.get('form', '')).strip()
        if all(n in t for n in need) and not t & set(skip) and 'rare' not in t \
                and fm and fm != '-' and is_fi(fm) and fm not in got:
            got.append(fm)
    return got


def verb_table(forms, word):
    """{'pres', 'neg', 'past', 'perf', 'cond', 'imp': [[forms] x 6] (a gap is []),
        'pass': [present, past], 'inf': [word]} and a list of the blocks that failed.
    A block is kept when its third person singular is there; the imperative's first person
    singular is a gap in every verb."""
    conj = [f for f in forms if f.get('source') == 'conjugation']
    if not conj:
        return {}, []
    out, bad = {}, []
    for key, need, skip in BLOCKS:
        rows = [_cells(conj, need + p, skip)[:2] for p in PERSONS]
        if rows[2]:
            out[key] = rows
        else:
            bad.append(key)
    pas = [(_cells(conj, ('indicative', 'passive', t), ('negative',)) or [''])[0]
           for t in ('present', 'past')]
    if all(pas):
        out['pass'] = pas
    inf = _cells(conj, ('infinitive', 'infinitive-i'), ())
    out['inf'] = [inf[0] if inf else word]
    return out, bad


def participle(v):
    """The past active participle, read off the perfect's third person (`on syönyt`)."""
    perf = (v or {}).get('perf')
    if not perf or not perf[2]:
        return ''
    parts = perf[2][0].split()
    return parts[-1] if len(parts) == 2 else ''
