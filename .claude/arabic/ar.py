"""Shared helpers for the Arabic decks' generator (`.claude/arabic/`).

THE FOLD.  Arabic is written with its short vowels left out, and every corpus here
mixes vowelled and bare text (Tatoeba's sentences are mostly bare, a few fully
vowelled; the subtitle list is bare; Wiktionary's headwords are fully vowelled).
So matching and counting go through `fold`: the harakat, shadda, sukun, tanwin,
dagger alif and tatweel are removed, and the hamza seats on alif (أ إ آ ٱ) are
read as a bare alif, since a bare text often writes them so.  The CARDS always
print the vowelled form — that is what an A1 learner reads by.
"""
import json, os, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "arabic-cache")
ROOT = os.path.join(HERE, "..", "..")
DECKS = os.path.join(ROOT, "decks")

# U+064B..U+0652 harakat/tanwin/shadda/sukun, U+0670 dagger alif, U+0640 tatweel,
# U+0653..U+065F the rarer combining marks, U+06E1 the Quranic small sukun
MARKS = re.compile("[ً-ٰٟـۡ]")
ALIFS = str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا"})
# the clitics written joined to a word's front: and, so, with, for, like, the article
PREFIXES = ["", "و", "ف", "ب", "ل", "ك", "ال", "وال", "فال", "بال", "كال", "لل", "ولل", "وب", "ول", "فب", "فل"]
WORD = re.compile("[ء-غف-يً-ٰٟٱ]+")


def bare(s):
    """The word without its vowel marks, hamza seats kept (the spelling a card names)."""
    return MARKS.sub("", unicodedata.normalize("NFC", s))


def fold(s):
    """The matching key: no vowel marks, every alif seat read as a bare alif."""
    return bare(s).translate(ALIFS)


def tokens(text):
    return WORD.findall(text)


def load_dict():
    return json.load(open(os.path.join(CACHE, "dict.json"), encoding="utf-8"))
