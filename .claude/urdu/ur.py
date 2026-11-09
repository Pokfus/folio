"""Small Urdu helpers shared by every stage of `.claude/urdu/`.

THE FOLD.  Urdu spelling varies in ways a dictionary and a corpus do not agree
on, and a match that ignores them loses words:
  · the SHORT-VOWEL MARKS (zabar, zer, pesh), tashdid and jazm are written in a
    dictionary's headword and tables (`کِتَابیں`) and almost never in running
    text (`کتابیں`);
  · text typed on an ARABIC keyboard uses the Arabic yeh, kaf and heh
    (`ي ك ه`) where Urdu has its own letters (`ی ک ہ`);
  · the izafat heh (`ۂ`) is also written as a plain heh, and a tatweel or a
    zero-width joiner may sit inside a word.
So `fold()` composes (NFC), drops the marks, writes the Arabic letters as the
Urdu ones and drops tatweel and the joiners.  It does NOT decompose: `ئ`, `ؤ`
and `آ` are letters of their own, and NFD would turn `ئ` into a yeh plus a mark.
The fold is for MATCHING only: what a card prints is `plain()`, the dictionary's
spelling without its vowel marks, which is how Urdu is written.
"""
import re, unicodedata

# fathatan .. sukun, the small marks after it, superscript alef, and the
# small high/low marks of U+06D6-06ED -- vowel and reading signs, never letters
MARKS = re.compile('[ً-ٰٟۖ-ۜ۟-۪ۨ-ۭ]')
# what a card PRINTS keeps tanween (`فوراً` is written so) and the superscript
# alef; it drops only the short vowels, tashdid and jazm
SHORT = re.compile('[َ-ْٕٖ]')
SWAP = str.maketrans({'ي': 'ی', 'ى': 'ی', 'ك': 'ک',
                      'ه': 'ہ', 'ۀ': 'ہ', 'ۂ': 'ہ',
                      'ـ': None, '‌': None, '‍': None, '‏': None,
                      '‎': None})

ARAB = re.compile('[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]')
# a WORD: Arabic-script letters and marks, not punctuation (، ؛ ؟ ۔) or digits
WORD = re.compile('[ء-ٰٟ-ۓە-ۭۺ-ۿݐ-ݿ'
                  'ﭐ-﷿ﹰ-﻿‌‍]+')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    s = nfc(s)
    s = MARKS.sub('', s).translate(SWAP)
    return re.sub(r'\s+', ' ', s).strip()


def plain(s):
    """The spelling a card prints: Wiktionary's, without its short-vowel marks."""
    return re.sub(r'\s+', ' ', SHORT.sub('', nfc(s))).strip()


def is_urdu(s):
    """Every letter Arabic-script (spaces and hyphens allowed)."""
    s = (s or '').strip()
    if not s:
        return False
    return all(ARAB.match(ch) or ch in ' -‌‍' for ch in s) and bool(WORD.search(s))


def tokens(text):
    """The Urdu words of a sentence, in order (punctuation and digits are not words)."""
    return WORD.findall(nfc(text))
