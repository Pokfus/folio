"""Small Danish helpers shared by every stage of `.claude/danish/`.

THE FOLD.  NFC and lower case, nothing more.  Æ, Ø and Å are letters of their
own in Danish, not marked vowels, and stripping them would merge words the
language keeps apart by nothing else -- `får` "gets, sheep" and `far` "father",
`hør` "hear!" and `hor` "adultery", `bær` "berry" and `bar` "bare".  The fold
is for MATCHING only: what a card prints is the dictionary's own spelling.

NO ROMANISATION.  Danish is written in the Latin alphabet, so a card carries
no romanisation line and the collection no alphabet deck.
"""
import re, unicodedata

LETTER = 'a-zA-ZæøåÆØÅéÉüÜäÄöÖ'
DANISH = re.compile(rf'^[{LETTER}][{LETTER} \-]*$')
WORD = re.compile(rf'[{LETTER}]+(?:-[{LETTER}]+)*')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    """`I` "you (plural)" is the one word Danish always writes with a capital, and its
    lower case is the preposition `i` "in": the pronoun is kept under the key `I`.
    (A sentence's FIRST word is not folded here -- `examples.py` sets it aside.)"""
    s = nfc(s).strip()
    return s if s == 'I' else s.lower()


def is_danish(s):
    """Every character a Latin letter of Danish (spaces and hyphens allowed)."""
    return bool(DANISH.match(nfc(s or '').strip()))


def tokens(text):
    """The words of a sentence, in order."""
    return WORD.findall(nfc(text))
