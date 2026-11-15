"""Small Norwegian (Bokmål) helpers shared by every stage of `.claude/norwegian/`.

THE FOLD.  NFC and lower case, nothing more.  Æ, Ø and Å are letters of their
own, not A and O with marks, and stripping them would merge words the language
keeps apart by nothing else -- `får` "gets, sheep" and `far` "father", `bør`
"should" and `bor` "lives", `sø` and `so`.  The fold is for MATCHING only: what a
card prints is the dictionary's own spelling.

NO ROMANISATION.  Norwegian is written in the Latin alphabet, so a card carries
no romanisation line and the collection no alphabet deck.
"""
import re, unicodedata

LETTER = 'a-zA-ZæøåÆØÅéÉüÜàÀèÈôÔòÒóÓ'
NORWEGIAN = re.compile(rf'^[{LETTER}][{LETTER} \-]*$')
WORD = re.compile(rf'[{LETTER}]+(?:-[{LETTER}]+)*')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    return nfc(s).lower().strip()


def is_norwegian(s):
    """Every character a Latin letter of Norwegian (spaces and hyphens allowed)."""
    return bool(NORWEGIAN.match(nfc(s or '').strip()))


def tokens(text):
    """The words of a sentence, in order."""
    return WORD.findall(nfc(text))
