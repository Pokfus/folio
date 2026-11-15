"""Small Icelandic helpers shared by every stage of `.claude/icelandic/`.

THE FOLD.  NFC and lower case, nothing more.  á é í ó ú ý, ð, þ, æ and ö are
letters of their own in the Icelandic alphabet, not marked forms of others, and
stripping them would merge words the language keeps apart by nothing else --
`á` "on" and `a`, `ís` "ice" and `is`, `lög` "law" and `log` "flame".  The fold
is for MATCHING only: what a card prints is the dictionary's own spelling.

THE SUBTITLE LIST IS MIS-ENCODED (`SUBS`).  hermitdave/FrequencyWords' Icelandic
list (OpenSubtitles 2018, read 2026-11-15) writes most ð as đ (1.54 million
tokens against 0.22 million correct), þ as ū (`ūú` 130,655, `ūađ` 173,058), ó as
ķ (`gķđur`), ý as ũ (`nũja`), á as ā (`jā`), i as ą (`ekką`) and some ð as õ or
ō (`viõ`, `aō`) -- an old subtitle encoding read through another code page.
`subs_fold` maps those characters back BEFORE counting, so `ađ` and `að` are one
word; none of the eight is a letter of Icelandic, so the map takes nothing from
a correct spelling.  It is applied to the frequency list only.

NO ROMANISATION.  Icelandic is written in the Latin alphabet; its extra letters
are taught by the alphabet deck (`alphabet.py`).
"""
import re, unicodedata

LETTER = 'a-zA-ZáéíóúýÁÉÍÓÚÝðÐþÞæÆöÖ'
ICELANDIC = re.compile(rf'^[{LETTER}][{LETTER} \-]*$')
WORD = re.compile(rf'[{LETTER}]+(?:-[{LETTER}]+)*')

SUBS = str.maketrans({'đ': 'ð', 'Đ': 'Ð', 'ū': 'þ', 'Ū': 'Þ', 'ķ': 'ó', 'Ķ': 'Ó',
                      'ũ': 'ý', 'Ũ': 'Ý', 'õ': 'ð', 'ō': 'ð', 'ā': 'á', 'Ā': 'Á', 'ą': 'i'})


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    return nfc(s).lower().strip()


def subs_fold(s):
    """A subtitle-list word, its mis-encoded letters mapped back, folded."""
    return fold(nfc(s).translate(SUBS))


def is_icelandic(s):
    """Every character a Latin letter of Icelandic (spaces and hyphens allowed)."""
    return bool(ICELANDIC.match(nfc(s or '').strip()))


def tokens(text):
    """The words of a sentence, in order."""
    return WORD.findall(nfc(text))
