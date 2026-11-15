#!/usr/bin/env python3
"""Amharic text helpers shared by every stage of `.claude/amharic/`.

THE SCRIPT.  Amharic is written in the Ethiopic script (fidäl), an abugida: each
character is a consonant with one of seven vowels ("orders": ä u i a e ə o), and
some consonants have an eighth, labialised form (ሏ lʷa).  The Unicode block lays
the characters out in rows of eight, one row per consonant, so a character's
consonant and vowel are read off its code point (`SYL`).  The romanisation is
English Wiktionary's own (the scholarly one: ä for the first order, ə for the
sixth, ḥ ḫ ś ʿ for the letters Amharic no longer says differently); `SYL` was
checked character for character against Wiktionary's `Module:Ethi-translit`
table on 2026-11-15.  The card prints Wiktionary's romanisation of the WHOLE
word, which also marks gemination (ʿäbbay) the script does not write.

THE FOLD (`key`).  Every match -- frequency, inventory, sentences -- compares a
word's KEY, a plain Latin string built syllable by syllable, never the script:
  · the sixth order adds no vowel (ቤት bet, ቤቱ betu): so a stem whose last
    letter changes its order under a suffix (ቤት + -u = ቤቱ) still ends in the
    same consonants and a suffix strips off as letters (`stems`);
  · THE HOMOPHONE LETTERS FOLD TOGETHER: ሀ ሐ ኀ (all h), ሰ ሠ (s), አ ዐ (the vowel
    carrier), ጸ ፀ (ṣ).  Amharic says each set alike and spells common words with
    any of them (ውሃ, ውሀ, ውኃ "water"; ፀሐይ, ጸሀይ "sun"), so a strict match would
    split one word's count three ways.  For the same reason the first order of
    h and of the vowel carrier is read "a" (ሀ = ሃ, አ = ኣ), as it is said;
  · labialisation is a w (ሏ lwa).
"""
import re, unicodedata

# The consonant of each 8-wide row of the block, in Wiktionary's romanisation.
# A row whose consonant has the five labialised forms (ቈ ቊ ቋ ቌ ቍ) is given as
# its own row with a ʷ.  '' marks a row this pipeline never meets.
ROWS = {
    0x1200: 'h', 0x1208: 'l', 0x1210: 'ḥ', 0x1218: 'm', 0x1220: 'ś', 0x1228: 'r',
    0x1230: 's', 0x1238: 'š', 0x1240: 'ḳ', 0x1248: 'ḳʷ', 0x1250: 'x̣', 0x1258: 'x̣ʷ',
    0x1260: 'b', 0x1268: 'v', 0x1270: 't', 0x1278: 'č', 0x1280: 'ḫ', 0x1288: 'ḫʷ',
    0x1290: 'n', 0x1298: 'ñ', 0x12A0: 'ʾ', 0x12A8: 'k', 0x12B0: 'kʷ', 0x12B8: 'x',
    0x12C0: 'xʷ', 0x12C8: 'w', 0x12D0: 'ʿ', 0x12D8: 'z', 0x12E0: 'ž', 0x12E8: 'y',
    0x12F0: 'd', 0x1300: 'ǧ', 0x1308: 'g', 0x1310: 'gʷ', 0x1318: 'ŋ', 0x1320: 'ṭ',
    0x1328: 'č̣', 0x1330: 'p̣', 0x1338: 'ṣ', 0x1340: 'ṣ́', 0x1348: 'f', 0x1350: 'p',
}
LABIAL_ROWS = {0x1248, 0x1258, 0x1288, 0x12B0, 0x12C0, 0x1310}
VOWELS = ['ä', 'u', 'i', 'a', 'e', 'ə', 'o']
# the labialised rows: ʷä, (gap), ʷi, ʷa, ʷe, ʷə
LABIAL_VOWELS = {0: 'ä', 2: 'i', 3: 'a', 4: 'e', 5: 'ə'}
# the rows with no eighth form, or another one at offset 7
NO_EIGHTH = {0x1200, 0x1240, 0x1250, 0x1280, 0x12A8, 0x12B8, 0x12C8, 0x12D0, 0x12E8,
             0x1308, 0x1318, 0x1340}


def _table():
    t = {}
    for base, c in ROWS.items():
        if base in LABIAL_ROWS:
            for off, v in LABIAL_VOWELS.items():
                t[chr(base + off)] = (c, v)
            continue
        for off, v in enumerate(VOWELS):
            t[chr(base + off)] = (c, v)
        if base not in NO_EIGHTH:
            t[chr(base + 7)] = (c + 'ʷ', 'a')
    t['ኧ'] = ('ʾʷ', 'a')
    t['ጟ'] = ('ŋʷ', 'a')
    return t


SYL = _table()
ETHIOPIC = 'ሀ-ፚⶀ-⷟'
TOKEN = re.compile(f'[{ETHIOPIC}]+')

# the fold of each consonant (the homophones together) and of the first order after h / the carrier
FOLD_C = {'ḥ': 'h', 'ḫ': 'h', 'ś': 's', 'ṣ́': 'S', 'ʿ': '', 'ʾ': '', 'x̣': 'h',
          'ḳ': 'q', 'ǧ': 'j', 'č̣': 'c', 'p̣': 'p', 'ṭ': 'T', 'ṣ': 'S', 'č': 'C',
          'š': 'x', 'ž': 'Z', 'ñ': 'N', 'ŋ': 'N', 'x': 'h'}


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def roman(word):
    """Wiktionary's character romanisation (no gemination: the script has none)."""
    out = []
    for ch in nfc(word):
        if ch in SYL:
            c, v = SYL[ch]
            out.append(c + v)
        else:
            out.append(ch)
    return ''.join(out)


def key(word):
    """The fold every match compares (module docstring)."""
    out = []
    for ch in nfc(word):
        if ch not in SYL:
            if ch.isspace() or ch == '-':
                out.append(' ' if ch.isspace() else '')
            continue
        c, v = SYL[ch]
        lab = c.endswith('ʷ')
        c = c.rstrip('ʷ')
        fc = FOLD_C.get(c, c)
        if v == 'ä' and c in ('h', 'ḥ', 'ḫ', 'ʾ', 'ʿ'):
            v = 'a'
        out.append(fc + ('w' if lab else '') + ('' if v == 'ə' else
                                                {'ä': 'E'}.get(v, v)))
    return re.sub(r'\s+', ' ', ''.join(out)).strip()


def tokens(text):
    return TOKEN.findall(nfc(text))


def is_amharic(w):
    """A headword this pipeline handles: Ethiopic letters, optional spaces."""
    w = nfc(w)
    return bool(w) and bool(re.fullmatch(f'[{ETHIOPIC}]+(?: [{ETHIOPIC}]+)*', w))


# ---- THE AFFIXES, in key space ------------------------------------------------------------
# Amharic writes its prepositions and many endings onto the word (በቤቱ "in the house",
# ቤቶቻችን "our houses").  `stems` peels them off a token's key, one layer at a time, so
# a form Wiktionary's table does not list can still be counted to its word.  Only ever
# a FALLBACK: a token whose whole key some lemma claims goes to that lemma.
PREFIXES = ['ndE', 'slE', 'wEdE', 'bE', 'lE', 'yE', 'kE', 'IndE']
# a prefix before a vowel-initial word loses its vowel: ባንድ = በ + አንድ ("in one")
PREFIX_BEFORE_VOWEL = ['b', 'l', 'y', 'k']
SUFFIXES = [
    'aCacn', 'aCachu', 'aCacEw',          # -aččən, -aččəhu, -aččäw after a plural
    'oCun', 'oC', 'woC',                  # the plural -očč (+ the definite object)
    'aCn', 'aChu', 'aCEw',                # our, your (pl.), their / his (polite)
    'itu', 'wan', 'wa', 'un', 'wo',       # the definite, her, polite your
    'na', 'm', 's', 'n', 'u', 'w', 'e', 'h', 'x',   # and, also, as for, the object, the, my, your
    'ku', 'k', 'EC', 'C',                 # a verb's I, you, she (perfective)
]
# after peeling one of these, the stem is also tried with the perfective's -ä (ሄድኩ -> ሄደ)
VERB_SUFFIXES = {'ku', 'k', 'EC', 'C', 'u', 'n', 'h', 'x', 'aChu'}
VOWEL_START = re.compile(r'^[aeiou]')


def stems(k):
    """Every key reachable from `k` by peeling up to three affixes, in order of the
    fewest peels, then the longest stem; each with its number of peels."""
    seen = {k: 0}
    frontier = [k]
    for depth in (1, 2, 3):
        nxt = []
        for s in frontier:
            outs = []
            for suf in SUFFIXES:
                if s.endswith(suf) and len(s) - len(suf) >= 2:
                    st = s[:-len(suf)]
                    outs.append(st)
                    if suf in VERB_SUFFIXES:
                        outs.append(st + 'E')     # a perfective verb's third person ends in -ä
            for p in PREFIXES:
                if s.startswith(p) and len(s) - len(p) >= 2:
                    outs.append(s[len(p):])
            for p in PREFIX_BEFORE_VOWEL:
                if s.startswith(p) and VOWEL_START.match(s[1:]) and len(s) > 3:
                    outs.append(s[1:])
            for o in outs:
                if o not in seen:
                    seen[o] = depth
                    nxt.append(o)
        frontier = nxt
    return sorted(((d, -len(s), s) for s, d in seen.items() if d), key=lambda x: x)
