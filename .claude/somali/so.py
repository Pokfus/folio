#!/usr/bin/env python3
"""Somali text helpers shared by every stage of `.claude/somali/`.

THE SPELLING.  Standard Somali has been written in the Latin alphabet since 1972
(the official orthography): 21 consonants -- b t j x kh d r s sh dh c g f q k l
m n w h y, with the glottal stop written ' -- and five vowels, a doubled vowel
being long (a / aa).  Ordinary writing marks NO TONE, and the cards print the
ordinary spelling.  English Wiktionary's headword line adds the ACCENT (the high
tone) with an acute or a grave (nín "man", wìil "boy", gabádh "girl"); the card
shows that as a second line, the `Tone` field, the Hausa arrangement.

THE FOLD (`key`): lower case, every combining mark dropped, the curly apostrophe
written straight.  The glottal stop is a letter and is kept (ba'an is not baan).
"""
import re, unicodedata

TOKEN = re.compile(r"[^\W\d_]+(?:'[^\W\d_]+)*")


def nfc(s):
    s = (s or '').replace('’', "'").replace('ʼ', "'").replace('‘', "'")
    return unicodedata.normalize('NFC', s).strip()


def key(s):
    """Lower case, no accents: the ordinary spelling every form folds to."""
    d = unicodedata.normalize('NFD', nfc(s).lower())
    return unicodedata.normalize('NFC', ''.join(c for c in d if not unicodedata.combining(c)))


def accented(s):
    return any(unicodedata.combining(c) for c in unicodedata.normalize('NFD', s or ''))


def is_somali(w):
    """A word in the letters Somali writes (no p, v, z; a space, hyphen and apostrophe allowed)."""
    return bool(w) and bool(re.fullmatch(r"[abcdefghijklmnoqrstuwxy' \-]+", key(w)))


def tokens(text):
    return [nfc(t) for t in TOKEN.findall(nfc(text))]
