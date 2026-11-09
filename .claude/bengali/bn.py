"""Small Bengali helpers shared by every stage of `.claude/bengali/`.

THE FOLD.  Bengali text varies in ways a dictionary and a corpus do not agree
on, and a match that ignores them loses words:
  · the three NUKTA letters -- ড় ঢ় য় -- exist both precomposed (U+09DC,
    U+09DD, U+09DF) and as base + nukta (U+09BC).  They are composition
    exclusions, so NFC always writes the decomposed pair; `nfc()` is enough;
  · KHANDA TA is written ৎ (U+09CE) or, in older text, ত + hasanta + ZWJ;
  · the ZERO-WIDTH JOINER and NON-JOINER steer only how a conjunct is drawn;
  · `কি` and `কী` are spelt either way in running text for "what" (the 2012
    Bangla Academy rule gives কী for "what" and কি for the yes-no particle,
    and most subtitles ignore it).
So `fold()` normalises, writes khanda ta one way, drops the joiners, and
folds ী to ি in that one word only.  The fold is for MATCHING only: what a
card prints is the dictionary's own spelling.
"""
import re, unicodedata

ZW = '‌‍'
BENG = re.compile(r'[ঀ-৿]')
# letters and signs, never the Bengali digits (U+09E6-09EF) or the danda
WORD = re.compile(r'[ঀ-৥ৰ-৾‌‍]+')


def nfc(s):
    s = unicodedata.normalize('NFC', s or '')
    return s.replace('ত্‍', 'ৎ')


def fold(s):
    s = nfc(s)
    for z in ZW:
        s = s.replace(z, '')
    s = s.strip()
    return ' '.join('কি' if w == 'কী' else w for w in s.split(' '))


def is_bengali(s):
    """Every letter Bengali (spaces and hyphens allowed)."""
    s = (s or '').strip()
    if not s:
        return False
    return all(BENG.match(ch) or ch in ' -' + ZW for ch in s)


def tokens(text):
    """The Bengali words of a sentence, in order (danda and digits are not words)."""
    return WORD.findall(nfc(text))
