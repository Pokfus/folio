"""Small Tagalog helpers shared by every stage of `.claude/tagalog/`.

THE FOLD.  Tagalog is written without its stress marks: a book, a subtitle and
a Tatoeba sentence all write `maganda`, and only a dictionary writes `magandá`
(the acute for a stressed final syllable, the grave for a final glottal stop,
the circumflex for both).  Wiktionary files its headwords UNMARKED and keeps the
marked spelling as the entry's `canonical` form.  `fold()` lowercases and drops
those three marks, and nothing else: the tilde of `ñ` (Spanish loans, `Niño`,
`señorita`) is a letter.  The fold is for MATCHING; a card prints Wiktionary's
plain headword and, beneath it, the marked spelling with the IPA.

THE HYPHEN IS PART OF A WORD.  Tagalog writes a hyphen between a consonant-final
prefix and a vowel-initial root (`mag-aral` "to study", `pag-ibig` "love") and
in a reduplication (`araw-araw` "every day"), so a hyphenated token is ONE word
-- never split, unlike Romanian's clitic joins.

THE APOSTROPHE IS A CLIPPING.  `'yan` (iyan), `'to` (ito), `'di` (hindi): a
leading or trailing apostrophe is dropped and the remaining letters are the
token.  `'yan` then counts as `yan`, which Wiktionary files as a pointer to
`iyan` -- the count follows the pointer (`extract.py`).
"""
import re, unicodedata

MARKS = {'́', '̀', '̂'}          # acute, grave, circumflex (combining)

WORD = re.compile(r"[A-Za-zÑñÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛáéíóúàèìòùâêîôû]+(?:-[A-Za-zÑñÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛáéíóúàèìòùâêîôû]+)*")
TL = re.compile(r"^[A-Za-zÑñÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛáéíóúàèìòùâêîôû' -]+$")


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def unmark(s):
    """Drop the three stress marks, keep ñ."""
    d = unicodedata.normalize('NFD', s or '')
    return unicodedata.normalize('NFC', ''.join(ch for ch in d if ch not in MARKS))


def fold(s):
    return unmark(nfc(s)).lower().strip()


def is_tl(s):
    """Latin letters (with ñ and the stress marks), spaces, hyphens, apostrophes."""
    s = (s or '').strip()
    return bool(TL.match(s)) and any(ch.isalpha() for ch in s)


def tokens(text):
    """The words of a sentence, in order; a hyphenated word is one token."""
    return WORD.findall(nfc(text))
