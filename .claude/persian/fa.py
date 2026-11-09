"""Small Persian helpers shared by every stage of `.claude/persian/`.

THE FOLD.  Persian text in the wild is written in three ways a dictionary and a
corpus do not agree on, and a match that ignores them loses words:
  · ARABIC LETTER FORMS for the Persian ones -- the subtitle list writes `ي`
    (U+064A) and `ك` (U+0643) where Persian writes `ی` (U+06CC) and `ک` (U+06A9),
    `اين` for `این`;
  · the SHORT-VOWEL MARKS and hamzas are optional (`کِتاب` / `کتاب`, `خانهٔ` /
    `خانه`) -- but NOT the madda: `آب` "water" and `اب` are two entries, and a
    fold that merged them printed one as the other;
  · the ZERO-WIDTH NON-JOINER (U+200C) between a prefix or suffix and its word
    (`می‌روم`) is written, dropped, or a space; Wiktionary's generated tables
    drop it, Tatoeba keeps it, the subtitles have none at all.
So `fold()` decomposes (NFD splits آ أ ؤ ئ ۀ into a base and a mark), drops
every mark but the madda, the tatweel and the joiners, writes the Arabic letters as Persian
ones and recomposes.  The fold is for MATCHING only: what a card prints is the
dictionary's spelling, with the joiner put back (`zwnj`).
"""
import re, unicodedata

MARKS = re.compile('[\u064B-\u0652\u0654-\u065F\u0670\u0640\u200C\u200D\u200E\u200F]')
MAP = str.maketrans({'ي': 'ی', 'ى': 'ی', 'ك': 'ک',
                     'ة': 'ه', 'ۀ': 'ه', 'ہ': 'ه'})
ARAB = re.compile('[؀-ۿﭐ-﷿ﹰ-﻿]')
WORD = re.compile('[ء-غف-ٰٟ-ۓۺ-ۿ‌‍ـ]+')
ZWNJ = '‌'


def nfc(s):
    return unicodedata.normalize('NFC', s or '').translate(MAP)


def fold(s):
    s = unicodedata.normalize('NFD', s or '')
    s = MARKS.sub('', s).translate(MAP)
    return unicodedata.normalize('NFC', s).strip()


def is_persian(s):
    """Every letter in the Arabic script (spaces and the joiner allowed)."""
    s = (s or '').strip()
    if not s:
        return False
    return all(ARAB.match(ch) or ch in ' -‌‍' for ch in s)


def tokens(text):
    """The Persian words of a sentence, in order (punctuation and digits are not words)."""
    return WORD.findall(nfc(text))


def zwnj(form, roman='', stem=''):
    """Put the zero-width non-joiner back where Wiktionary's generated tables drop it.

    The tables write `میروم` for `می‌روم` and `رفتهام` for `رفته‌ام`, which is a
    misspelling a learner would copy.  The ROMANISATION keeps the boundary as a
    hyphen (`mí-ravam`, `rafté-am`, `xâne-hâ`), so the joiner goes back only where
    the romanisation says there is one, at three places a standard text has it:
    after the prefix `می` / `نمی`, before the plural `ها` of the word's own stem,
    and between a final silent `ه` and the ending `ام` / `ای` / `ایم` / `اید` /
    `اند` that follows it."""
    if ZWNJ in form or not roman:
        return form
    r = unicodedata.normalize('NFC', re.sub('\u0301', '', unicodedata.normalize(
        'NFD', roman.lower()))).replace('(', '').replace(')', '')
    out = []
    for tok in form.split(' '):
        if re.search(r'(^|\s)(ne|na)?m[iíē]-', r):
            tok = re.sub(r'^(ن?می)(?=[ء-ۿ])', '\\1' + ZWNJ, tok)
        if '-h' in r and stem and tok.startswith(stem) and tok[len(stem):].startswith('ها'):
            tok = stem + ZWNJ + tok[len(stem):]
        if re.search(r'[eé]-(a|i|ye|y)', r):
            tok = re.sub(r'(ه)(ا(?:م|ی|یم|ید|ند|ت|ش|مان|تان|شان)|مان|تان|شان|ای|ی)$', '\\1' + ZWNJ + '\\2', tok)
        out.append(tok)
    return ' '.join(out)
