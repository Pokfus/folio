#!/usr/bin/env python3
"""Yoruba text helpers shared by every stage of `.claude/yoruba/`.

THE SPELLING.  Standard Yoruba is written in the Latin alphabet with three
letters under a mark (ẹ ọ ṣ, a dot or in older printing a short vertical line)
and TONE MARKS over the vowels and the syllabic nasals: an acute for the high
tone (á), a grave for the low (à), and nothing for the mid (a; a macron, ā, in a
few dictionaries).  The tones are part of the word -- ọkọ "husband", ọkọ̀
"vehicle", ọkọ́ "hoe" -- so a card is ONE TONED SPELLING, and English Wiktionary,
which titles its pages without the tones (`ọkọ`) and gives the toned form in the
headword line, is read by that headword (`extract.py`).

`nfc` puts a word into one Unicode shape: NFC, the vertical line below (U+0329,
e̩ o̩ s̩) written as the dot (ẹ ọ ṣ), and the mid-tone macron dropped -- ordinary
writing leaves the mid tone unmarked, and so do the cards.

THE FOLD (`key`): lower case, no tone marks AND no dots.  Running text is marked
unevenly -- about half of the Yoruba Wikipedia's words carry their tones, and an
unmarked text often drops the dots too (awon for àwọn) -- so every match first
compares keys, and `wikitext.py` / `extract.py` then share a key's count out
among the spellings that have it, in the proportions the carefully marked
articles show.
"""
import re, unicodedata

TONES = '́̀̄'          # acute (high), grave (low), macron (mid)
DOT = '̣'                        # the dot below: ẹ ọ ṣ
TOKEN = re.compile(r"(?:[^\W\d_]|[̀-ͯ])+(?:[-'’](?:[^\W\d_]|[̀-ͯ])+)*")


def nfc(s):
    s = unicodedata.normalize('NFD', s or '').replace('̩', DOT).replace('̄', '')
    s = s.replace('’', "'")
    return unicodedata.normalize('NFC', s).strip()


def strip_tones(s):
    """The word without its tone marks, the dots kept: Wiktionary's page title (ọkọ̀ -> ọkọ)."""
    d = unicodedata.normalize('NFD', nfc(s))
    return unicodedata.normalize('NFC', ''.join(c for c in d if c not in TONES))


def key(s):
    """Lower case, no tones, no dots: the shape every spelling of a word folds to."""
    d = unicodedata.normalize('NFD', nfc(s).lower())
    return ''.join(c for c in d if not unicodedata.combining(c))


def toned(s):
    """Does the word carry a tone mark?"""
    return any(c in TONES for c in unicodedata.normalize('NFD', s or ''))


def is_yoruba(w):
    """A word in the Latin letters Yoruba uses (hyphen, apostrophe and space allowed)."""
    return bool(w) and bool(re.fullmatch(r"[a-z' \-]+", key(w)))


def tokens(text):
    return [nfc(t) for t in TOKEN.findall(nfc(text))]
