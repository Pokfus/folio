#!/usr/bin/env python3
"""Navajo text helpers shared by every stage of `.claude/navajo/`.

THE SPELLING IS THE STANDARD ONE, MARKS INCLUDED.  Unlike Hausa or Zulu, ordinary
written Navajo marks its tones (an acute for high: á), its nasal vowels (an
ogonek: ą) and its long vowels (doubled: aa), so the headword IS Wiktionary's
spelling and no second "toned" line is needed.  The pronunciation line under the
headword is Wiktionary's IPA.

THE GLOTTAL STOP is the letter ʼ (U+02BC, MODIFIER LETTER APOSTROPHE), which
Wiktionary uses; running text writes it as ' or ’ or ʻ as often.  Every key
writes it as ʼ (`norm`).

TWO KEYS.  `norm()` is the strict one: NFC, lower case, the glottal stop
unified.  Tone and nasality tell words apart (`tó` water / `to` no word; `bił`
with him / `bii` inside him), so a match is tried on the strict key first.
`loose()` also drops every combining mark (the acute, the ogonek): the Navajo
Wikipedia is not always marked carefully, so a token with NO strict claimant
falls back to the loose key -- a fallback only, never a second count.
"""
import re, unicodedata

GLOTTAL = 'ʼ'
_APOS = re.compile(r"['’‘ʻ`´ʹ]")


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def norm(s):
    return _APOS.sub(GLOTTAL, nfc(s)).lower().strip()


def loose(s):
    s = unicodedata.normalize('NFD', norm(s))
    return unicodedata.normalize('NFC', ''.join(ch for ch in s if not unicodedata.combining(ch)))


# A Navajo token: letters, combining marks and the glottal stop inside or at the end
# of a word (yáłtiʼ, tʼáá).  Navajo never writes a glottal stop at the start of a word.
TOKEN = re.compile(r"[^\W\d_](?:[^\W\d_]|[̀-ͯ" + GLOTTAL + r"])*")


def tokens(text):
    return TOKEN.findall(norm(text))


NAV_LETTERS = set('abcdeghijklmnostwxyzł' + GLOTTAL)


def is_navajo(w):
    """A headword this pipeline handles: Navajo letters and marks, single spaces, an optional affix hyphen."""
    t = loose(w).replace(' ', '').strip('-')
    return bool(t) and set(t) <= NAV_LETTERS
