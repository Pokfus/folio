"""Small Dutch helpers shared by every stage of `.claude/dutch/`.

THE FOLD.  NFC and lower case, and nothing else.  THE ACCENTS ARE KEPT: Dutch
writes them to tell words apart that are otherwise spelt alike -- `één` "one"
against `een` "a", `vóór` "before" against `voor` "for", `dé` the stressed
article -- and stripping them would hand one word's count to the other.  The
fold is for MATCHING only: what a card prints is the dictionary's own spelling.

A WORD is letters (with the Latin-1 and Latin Extended-A accents Dutch uses),
optionally with an inner apostrophe or hyphen -- `auto's`, `zo'n`, `e-mail` --
which is how Wiktionary writes those plurals and contractions and how the
subtitle list counts them.
"""
import re, unicodedata

LETTER = 'A-Za-zÀ-ÖØ-öø-ÿĀ-ſ'
WORD = re.compile(rf"[{LETTER}]+(?:['’\-][{LETTER}]+)*")
ONLY = re.compile(rf"^[{LETTER}]+(?:['’\- ][{LETTER}]+)*$")


def nfc(s):
    return unicodedata.normalize('NFC', s or '').replace('’', "'")


def fold(s):
    return nfc(s).lower().strip()


def is_dutch(s):
    """Every character a letter (an inner apostrophe, hyphen or space allowed)."""
    return bool(ONLY.match(nfc(s).strip()))


def tokens(text):
    """The words of a sentence, in order."""
    return WORD.findall(nfc(text))


def ipa_of(e):
    """Wiktionary's first PHONEMIC transcription (/…/), else its first of any kind."""
    ss = [s.get('ipa', '') for s in e.get('sounds') or [] if s.get('ipa')]
    for s in ss:
        if s.startswith('/'):
            return s
    return ss[0] if ss else ''
