"""Small Romanian helpers shared by every stage of `.claude/romanian/`.

THE FOLD.  Romanian writes two letters in two ways that a dictionary and a
corpus do not agree on: ș and ț with a COMMA below (U+0219, U+021B, the correct
letters, Wiktionary's) and ş and ţ with a CEDILLA (U+015F, U+0163, the old
code points most subtitle files still use -- `şi` 4.3 million times against
`și` 0.4 million).  `fold()` writes the cedilla as the comma and lowercases,
and nothing else: ă, â and î are distinct letters and a match that dropped them
would make `fată` "girl" and `față` "face" one word.  The fold is for MATCHING;
a card prints Wiktionary's spelling.

`bare()` drops every diacritic.  It is used for ONE thing only, in
`extract.py`: the subtitles also write without diacritics (`si`, `sa`), and a
bare spelling whose accented twin is commoner is credited to that twin.
"""
import re, unicodedata

CEDILLA = str.maketrans({'ş': 'ș', 'ţ': 'ț', 'Ş': 'Ș', 'Ţ': 'Ț'})

LETTERS = 'a-zăâîșțşţáéíóúàèìòù'
WORD = re.compile(r"[a-zăâîșțşţA-ZĂÂÎȘȚŞŢáéíóúàèìòùÁÉÍÓÚ]+(?:-[a-zăâîșțşţA-ZĂÂÎȘȚŞŢ]+)*")
RO = re.compile(r"^[a-zăâîșțşţA-ZĂÂÎȘȚŞŢáéíóúàèìòùÁÉÍÓÚ' -]+$")


def nfc(s):
    return unicodedata.normalize('NFC', s or '').translate(CEDILLA)


def fold(s):
    return nfc(s).lower().strip()


def bare(s):
    s = unicodedata.normalize('NFD', fold(s))
    return ''.join(ch for ch in s if not unicodedata.combining(ch))


def is_ro(s):
    """Latin letters, Romanian's own diacritics, spaces, hyphens (never Cyrillic)."""
    s = (s or '').strip()
    return bool(RO.match(s)) and any(ch.isalpha() for ch in s)


def tokens(text):
    """The words of a sentence, in order. A hyphenated clitic join (`dă-mi`,
    `s-a`) is split, since each part is a word of its own."""
    out = []
    for t in WORD.findall(nfc(text)):
        out += [p for p in t.split('-') if p]
    return out
