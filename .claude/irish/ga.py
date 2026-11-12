"""Small Irish helpers shared by every stage of `.claude/irish/`.

THE FOLD.  NFC and lower case, nothing more.  The fada (á é í ó ú) is part of
the spelling, not a mark to strip: `sean` "old" and `seán` (a name), `cead`
"permission" and `céad` "hundred", `ait` "odd" and `áit` "place".  The fold is
for MATCHING only: what a card prints is the dictionary's own spelling.

THE INITIAL MUTATIONS.  An Irish word changes its FIRST sound by the word
before it, and the spelling shows it: `bean` "woman", `an bhean` "the woman"
(lenition, an h after the first consonant), `ár mbean` "our woman" (eclipsis,
a consonant written before it), `a hiníon` "her daughter" (h before a vowel),
`an t-uisce` "the water", `an tsráid` "the street" (t before a vowel or an s).
A frequency list and a sentence index see `bhean`, `mbean` and `bean` as three
words, so every stage that counts or matches asks `variants()` for the
mutated spellings of a form and treats them as that form.  Lenition and
eclipsis are generated only where Irish writes them (no lenition of sc, sm,
sp, st; no eclipsis of l, n, r, s), so a variant is a spelling Irish uses.

NO ROMANISATION.  Irish is written in the Latin alphabet, so a card carries
no romanisation line and the collection no alphabet deck.
"""
import re, unicodedata

LETTER = 'a-zA-ZáéíóúÁÉÍÓÚ'
IRISH = re.compile(rf"^[{LETTER}][{LETTER} \-]*$")
# a token: letters, joined by hyphens (t-uisce, n-oíche, leis-sean); an apostrophe
# ends a token, so d'ól, m'athair and b'fhéidir split, and the clitic is dropped
WORD = re.compile(rf'[{LETTER}]+(?:-[{LETTER}]+)*')
CLITIC = {'d', 'm', 'b'}

VOWEL = set('aeiouáéíóú')
LENITE = set('bcdfgmpst')
ECLIPSE = {'b': 'm', 'c': 'g', 'd': 'n', 'f': 'bh', 'g': 'n', 'p': 'b', 't': 'd'}


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    return nfc(s).lower().strip()


def is_irish(s):
    """Every character a letter of Irish (spaces and hyphens allowed)."""
    return bool(IRISH.match(nfc(s or '').strip()))


def tokens(text):
    """The words of a sentence, in order, with a clitic d' / m' / b' dropped."""
    return [t for t in WORD.findall(nfc(text).replace('’', "'")) if fold(t) not in CLITIC]


def variants(form):
    """The mutated spellings of a (folded) form, the form itself first."""
    f = fold(form)
    out = [f]
    if not f or ' ' in f:
        return out
    c, rest = f[0], f[1:]
    if c in LENITE and not (c == 's' and rest[:1] in ('c', 'm', 'p', 't')) and rest[:1] != 'h':
        out.append(c + 'h' + rest)
    if c in ECLIPSE and rest[:1] != 'h':
        out.append(ECLIPSE[c] + f)
    if c in VOWEL:
        out += ['h' + f, 'n-' + f, 't-' + f]
    if c == 's' and (rest[:1] in VOWEL or rest[:1] in ('l', 'n', 'r')):
        out.append('t' + f)
    return out
