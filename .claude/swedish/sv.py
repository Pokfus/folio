"""Small Swedish helpers shared by every stage of `.claude/swedish/`.

THE FOLD.  NFC and lower case, nothing more.  Å, Ä and Ö are letters of their
own in Swedish, not A and O with marks, and stripping them would merge words the
language keeps apart by nothing else -- `får` "gets, sheep" and `far` "father",
`hår` "hair" and `har` "has", `äta` "to eat" and `åta` "to undertake".  The
fold is for MATCHING only: what a card prints is the dictionary's own spelling.

NO ROMANISATION.  Swedish is written in the Latin alphabet, so unlike the
Hindi, Greek or Urdu decks a card carries no romanisation line and the
collection no alphabet deck.
"""
import re, unicodedata

LETTER = 'a-zA-ZåäöÅÄÖéÉüÜàÀèÈ'
SWEDISH = re.compile(rf'^[{LETTER}][{LETTER} \-]*$')
WORD = re.compile(rf'[{LETTER}]+(?:-[{LETTER}]+)*')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    return nfc(s).lower().strip()


def is_swedish(s):
    """Every character a Latin letter of Swedish (spaces and hyphens allowed)."""
    return bool(SWEDISH.match(nfc(s or '').strip()))


def tokens(text):
    """The words of a sentence, in order."""
    return WORD.findall(nfc(text))
