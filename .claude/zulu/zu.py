#!/usr/bin/env python3
"""Zulu text helpers shared by every stage of `.claude/zulu/`.

THE FOLD.  Wiktionary prints a Zulu word with its TONES (umúntu, -hámba, înjá)
and, on some, a mark for the depressor consonant (y̤ébo); ordinary Zulu writing,
the Wikipedia this pipeline counts and the Tatoeba sentences carry neither.  So
every match -- frequency, inventory, sentences -- compares FOLDED words: NFD, every
combining mark dropped, lower case.  The card prints the plain spelling as the
headword and Wiktionary's tone-marked form beneath it.
"""
import re, unicodedata


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    s = unicodedata.normalize('NFD', s or '')
    s = ''.join(ch for ch in s if not unicodedata.combining(ch))
    return s.lower().strip()


# A Zulu token: letters only.  The hyphen of a loan's prefix (i-Afrika) splits it,
# and the prefix then counts as the token `i`, which no lemma claims.
TOKEN = re.compile(r"[a-z]+")


def tokens(text):
    return TOKEN.findall(fold(text))


def is_zulu(w):
    """A headword this pipeline handles: Latin letters, an optional stem hyphen, spaces."""
    return bool(w) and bool(re.fullmatch(r"-?[a-z]+(?: [a-z]+)*", fold(w)))
