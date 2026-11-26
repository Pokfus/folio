#!/usr/bin/env python3
"""Mongolian text helpers shared by every stage of `.claude/mongolian/`.

THE SCRIPT.  Mongolian (Khalkha, as written in Mongolia) is written in the
Cyrillic alphabet of 1941/1946: Russian's 33 letters plus Ө ө and Ү ү, 35 in
all.  English Wiktionary files most Mongolian words under that spelling, and
some under the traditional Mongolian script (ᠮᠣᠩᠭᠣᠯ) as well; this pipeline
reads the Cyrillic entries only (`is_mongolian`).

THE KEY (`key`) is the lower-cased spelling, NFC.  Nothing is folded: the
letters Mongolian writes are the letters it says, and ө / о, ү / у are
different vowels (өдөр "day", одор is no word).

THE AFFIXES (`stems`).  Mongolian is agglutinative: a noun takes its case and
number endings after it (байшин "house", байшинд "in the house", байшингаас
"from the house", байшингууд "houses"), a verb its tense and mood endings after
its stem (явах "to go", явна "goes", явсан "went", явж "going").  Each ending
comes in up to four spellings by vowel harmony (-аас, -ээс, -оос, -өөс).  A
noun with a Wiktionary declension table has its forms counted from the table
(`extract.py`); `stems` is the FALLBACK for a token no table lists: it peels the
commonest endings, one layer at a time, and a verb is reached through its STEM
(`verb_stem`: the dictionary form less its -х and the vowel before it).  It is
never used to WRITE a form on a card -- a form shown is a form Wiktionary
prints.
"""
import re, unicodedata

CYR = 'А-Яа-яЁёӨөҮү'
TOKEN = re.compile(f'[{CYR}]+(?:-[{CYR}]+)*')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def key(word):
    return re.sub(r'\s+', ' ', nfc(word).lower()).strip()


def tokens(text):
    return TOKEN.findall(nfc(text))


def is_mongolian(w):
    """A headword this pipeline handles: Cyrillic letters, optional spaces or hyphens."""
    w = nfc(w)
    return bool(w) and bool(re.fullmatch(f'[{CYR}]+(?:[ -][{CYR}]+)*', w))


def has_cyrillic(t):
    return bool(re.search(f'[{CYR}]', t or ''))


def verb_stem(k):
    """явах -> яв, идэх -> ид, өгөх -> өг, уух -> уу: the dictionary form less -х and the
    harmonised vowel before it (a long vowel or a diphthong keeps its letters)."""
    if not k.endswith('х') or len(k) < 3:
        return ''
    s = k[:-1]
    if s[-1] in 'аэоө' and len(s) >= 3 and s[-2] != s[-1] and s[-2] not in 'аэоөуүиы':
        s = s[:-1]
    return s


# The endings, longest first within each family; every harmonic spelling written out.
def _h(*forms):
    return list(forms)


NOUN_SUFFIXES = (
    _h('уудын', 'үүдийн', 'уудыг', 'үүдийг', 'уудад', 'үүдэд', 'уудаас', 'үүдээс',
       'уудаар', 'үүдээр', 'уудтай', 'үүдтэй', 'ууд', 'үүд', 'нууд', 'нүүд', 'чууд', 'чүүд') +
    _h('ийнх', 'ынх', 'ийн', 'ын', 'гийн', 'ний', 'ны', 'н') +
    _h('ийг', 'ыг', 'г') +
    _h('нд', 'д', 'т', 'ад', 'эд', 'од', 'өд') +
    _h('иас', 'иос', 'иэс', 'аас', 'ээс', 'оос', 'өөс', 'гаас', 'гээс', 'гоос', 'гөөс', 'наас',
       'нээс', 'ноос', 'нөөс') +
    _h('иар', 'иор', 'аар', 'ээр', 'оор', 'өөр', 'гаар', 'гээр', 'гоор', 'гөөр', 'наар', 'нээр',
       'ноор', 'нөөр') +
    _h('тай', 'тэй', 'той', 'гүй') +
    _h('руу', 'рүү', 'луу', 'лүү') +
    _h('гаа', 'гээ', 'гоо', 'гөө', 'аа', 'ээ', 'оо', 'өө', 'ий', 'ы', 'ч', 'нь', 'минь')
)
VERB_SUFFIXES = (
    _h('хгүй', 'ахгүй', 'эхгүй', 'охгүй', 'өхгүй', 'аагүй', 'ээгүй', 'оогүй', 'өөгүй') +
    _h('на', 'нэ', 'но', 'нө', 'сан', 'сэн', 'сон', 'сөн', 'жээ', 'чээ', 'лаа', 'лээ', 'лоо', 'лөө',
       'в', 'ж', 'ч', 'аад', 'ээд', 'оод', 'өөд', 'даг', 'дэг', 'дог', 'дөг', 'х', 'ах', 'эх', 'ох',
       'өх', 'хаар', 'хээр', 'хоор', 'хөөр', 'хад', 'хэд', 'ход', 'хөд', 'вал', 'вэл', 'вол', 
       'бал', 'бэл', 'бол', 'бөл', 'аарай', 'ээрэй', 'оорой', 'өөрэй', 'я', 'е', 'ё', 'ъя',
       'гаад', 'гээд', 'тал', 'тэл', 'тол', 'төл', 'н', 'сны', 'сний', 'снаас', 'снээс', 'лт', 'лга',
       'лгэ', 'уул', 'үүл', 'ул', 'үл', 'гд', 'лц', 'лд', 'лдаг', 'лдэг')
)
SUFFIXES = sorted(set(NOUN_SUFFIXES + VERB_SUFFIXES), key=lambda s: (-len(s), s))


def stems(k):
    """Every key reachable from `k` by peeling up to two endings, in order of the fewest
    peels, then the longest stem; each with its number of peels."""
    seen = {k: 0}
    frontier = [k]
    for depth in (1, 2):
        nxt = []
        for s in frontier:
            for suf in SUFFIXES:
                if s.endswith(suf) and len(s) - len(suf) >= 2:
                    st = s[:-len(suf)]
                    if st not in seen:
                        seen[st] = depth
                        nxt.append(st)
        frontier = nxt
    return sorted(((d, -len(s), s) for s, d in seen.items() if d), key=lambda x: x)


def peel_one(k, suffixes):
    """Every stem one ending of `suffixes` leaves on `k` (at least three letters)."""
    return {k[:-len(x)] for x in suffixes if k.endswith(x) and len(k) - len(x) >= 3}
