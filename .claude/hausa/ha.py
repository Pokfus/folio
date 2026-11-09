"""Small Hausa helpers shared by every stage of `.claude/hausa/`.

TWO FOLDS, because ordinary Hausa writing and a dictionary disagree in two ways:

  · TONE AND VOWEL LENGTH are not written in ordinary Hausa (Boko) at all --
    `ruwa`, not Wiktionary's `ruwā`; `mace`, not `màcḕ` -- so every comparison
    drops the combining marks (grave, circumflex, macron, and the tilde of the
    rolled `r̃`).  The toned form is what a CARD prints on its second line; it is
    never what anything is matched on.
  · THE HOOKED LETTERS (ɓ ɗ ƙ ƴ) are often typed without their hooks in running
    text -- the Tatoeba corpus writes `kungiyoyin` for `ƙungiyoyin` and `wadanda`
    for `waɗanda` as often as not -- and `ƴ` is written `'y` in Nigeria.

`norm()` is the STRICT key: lower case, no tone marks, `ƴ` written `'y`, every
apostrophe the plain one.  `loose()` also drops the hooks and the apostrophes.
A hook is a different SOUND -- `ɗa` "son" is not `da` "and", `ƙasa` "land" is
not `kasa` "to fail" -- so `loose()` is a FALLBACK only: a token is matched on its
strict key first, and through `loose()` only when no word has that strict key
(`extract.py`, `examples.py`).  Without that order `ɗa` would take the whole
count of `da`, the commonest word in the language.
"""
import re, unicodedata

HOOKS = str.maketrans({'ɓ': 'b', 'ɗ': 'd', 'ƙ': 'k', 'ƴ': 'y'})
APOS = str.maketrans({'’': "'", 'ʼ': "'", '‘': "'", '`': "'"})
WORD = re.compile(r"[^\W\d_]+(?:'[^\W\d_]+)*|'[^\W\d_]+")


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def untone(s):
    """Drop every combining mark: tone, length and the tilde of r̃."""
    s = unicodedata.normalize('NFD', s or '')
    s = ''.join(ch for ch in s if not unicodedata.combining(ch))
    return unicodedata.normalize('NFC', s)


def norm(s):
    s = untone((s or '').translate(APOS)).lower().strip()
    return s.replace('ƴ', "'y")


def loose(s):
    return norm(s).replace("'y", 'y').translate(HOOKS).replace("'", '')


LETTER = re.compile(r"^[a-zɓɗƙƴ' -]+$")


def is_hausa(s):
    """A Boko headword: Latin letters, the hooked letters, apostrophe, space, hyphen."""
    s = norm(s)
    return bool(s) and bool(LETTER.match(s))


def tokens(text):
    """The words of a sentence, in order, as written (apostrophes made plain)."""
    return WORD.findall(nfc(text).translate(APOS))


# A HAUSA NOUN TAKES ITS SUFFIXES ON THE END: the linker of a genitive (`ruwan
# sha` "drinking water", `ranar Litinin` "Monday"; -n, or -r after a feminine
# noun in -a) and the possessive pronouns, on their own (`gidana` "my house") or
# after the linker (`gidansa` "his house").  A token not found as a word is tried
# with one of these taken off -- longest first, the remainder at least three
# letters -- so `lokacin`, `gidanmu` and `ranar` all count to their nouns.
SUFFIXES = sorted({l + p for l in ('n', 'r') for p in ('a', 'ka', 'ki', 'sa', 'ta', 'mu', 'ku', 'su')}
                  | {'na', 'ka', 'ki', 'sa', 'ta', 'mu', 'ku', 'su', 'n', 'r'},
                  key=lambda x: (-len(x), x))


def stems(key):
    """The candidate nouns under a suffixed token (strict keys), longest suffix first."""
    out = []
    for sfx in SUFFIXES:
        if key.endswith(sfx) and len(key) - len(sfx) >= 3:
            out.append(key[:-len(sfx)])
    return out
