"""Small Hindi helpers shared by every stage of `.claude/hindi/`.

THE FOLD.  Hindi spelling varies in two ways a dictionary and a corpus do not
agree on, and a match that ignores them loses words:
  · the NUKTA is optional in ordinary writing -- `ज़रूर` and `जरूर`, `फ़ोन` and
    `फोन` are the same word, and the subtitles write both;
  · CHANDRABINDU and ANUSVARA are used interchangeably for nasal vowels -- `हूँ`
    (Wiktionary) and `हूं` (much running text).
So `fold()` decomposes (NFD turns the precomposed nukta letters U+0958-095F
into base + U+093C), drops the nukta, writes chandrabindu as anusvara and
recomposes.  The fold is for MATCHING only: what a card prints is the
dictionary's own spelling.
"""
import re, unicodedata

NUKTA = '़'
CHANDRA = 'ँ'
ANUSVARA = 'ं'

DEVA = re.compile(r'[ऀ-ॿ]')
WORD = re.compile(r'[ऀ-ॣ०-ॿ‌‍]+')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    s = unicodedata.normalize('NFD', s or '')
    s = s.replace(NUKTA, '').replace(CHANDRA, ANUSVARA)
    return unicodedata.normalize('NFC', s).strip()


def is_hindi(s):
    """Every letter Devanagari (spaces and hyphens allowed)."""
    s = (s or '').strip()
    if not s:
        return False
    return all(DEVA.match(ch) or ch in ' -‌‍' for ch in s)


def tokens(text):
    """The Devanagari words of a sentence, in order (danda and digits are not words)."""
    return WORD.findall(nfc(text))
