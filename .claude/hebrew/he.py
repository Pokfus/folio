"""Small Hebrew helpers shared by every stage of `.claude/hebrew/`.

TWO SPELLINGS OF ONE WORD.  Modern Hebrew is written WITHOUT vowel points, in
the "full" spelling (ktiv male) that adds ו and י as vowel letters: `דיבר`,
`לכתוב`.  Wiktionary gives every form POINTED (niqqud), in the classical
"defective" spelling the points belong to: `דִּבֵּר`, `לִכְתֹּב` -- strip the points
and you get `דבר`, `לכתב`, which is not how a newspaper, a subtitle or a
Tatoeba sentence spells them.  So a form here is always a PAIR:
  · `p` -- the pointed form, which tells a learner how to say it;
  · `w` -- the unpointed full spelling, which is what they will read, and what
    the subtitles and Tatoeba are matched against.
Wiktionary gives the full spelling in three ways (`plene`), and only when it
gives none is the pointed form stripped.

THE FOLD (`fold`) is for MATCHING only: it drops every point and cantillation
mark, the maqaf, and writes the geresh and gershayim as ASCII (the subtitles
write `ג'ורג'`, Tatoeba `ג׳`).  Final letters are KEPT: they are positional and
every source writes them the same way.
"""
import re, unicodedata

POINTS = re.compile('[֑-ׇֽֿׁׂׅׄ]')
HEB = re.compile('[א-ת]')
WORD = re.compile('[א-ת֑-ׇ׳״\'"]+')
GER = str.maketrans({'׳': "'", '״': '"', '’': "'", '־': '-'})


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def unpoint(s):
    """The letters of a pointed form, its points dropped (and the maqaf after a construct form)."""
    s = POINTS.sub('', unicodedata.normalize('NFD', s or ''))
    return unicodedata.normalize('NFC', s).replace('־', '').strip()


def pointed(s):
    return bool(POINTS.search(unicodedata.normalize('NFD', s or '')))


def fold(s):
    return unpoint(s).translate(GER).replace('-', '').strip()


def is_hebrew(s):
    """Every character a Hebrew letter or point (spaces, the maqaf and the geresh allowed)."""
    s = (s or '').strip()
    if not s or not HEB.search(s):
        return False
    return all('֑' <= ch <= '״' or ch in " -'\"" for ch in s)


def tokens(text):
    """The Hebrew words of a sentence, in order (a geresh inside a word is part of it)."""
    out = []
    for t in WORD.findall(nfc(text)):
        t = t.strip('\'"')
        if HEB.search(t):
            out.append(t)
    return out


# THE PREFIXES.  Hebrew writes seven one-letter words joined to the word after them:
# ו "and", ש "that", ה "the", ב "in", כ "as", ל "to", מ "from" -- in a fixed order,
# ו first, then ש (or כש "when", מש), then one of ה ב כ ל מ (`וכשהבית` is rare, `ובבית`,
# `שהילד`, `לבית` common).  After ב כ ל the article's ה is not written (`בבית` is "in
# the house"), which the word's own definite form in Wiktionary's table does not show,
# so a prefix chain is stripped from a token whose whole is not a word.
PREFIX = re.compile('^(ו?)(ש|כש|מש)?([הבכלמ])?')


def strips(tok):
    """Every reading of a token as a prefix chain + a word of two letters or more, longest
    chain first: `ובבית` -> `בבית`, `בית`."""
    out = []
    m = PREFIX.match(tok)
    if not m:
        return out
    a, b, c = m.group(1) or '', m.group(2) or '', m.group(3) or ''
    chains = set()
    for x in ('', a):
        for y in ('', b):
            for z in ('', c):
                pre = x + y + z
                if pre and tok.startswith(pre):
                    chains.add(pre)
    for pre in sorted(chains, key=len, reverse=True):
        rest = tok[len(pre):]
        if len(rest) >= 2:
            out.append(rest)
    return out
