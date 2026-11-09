"""Small Irish helpers shared by every stage of `.claude/irish/`.

THE MUTATIONS.  An Irish word changes its first sound by grammar, and a corpus
writes the changed form: `bean` "woman" is `an bhean` "the woman" (lenition),
`teach` "house" is `i dteach` "in a house" (eclipsis), `athair` "father" is
`ár n-athair` "our father", `oíche` "night" is `na hoíche` "of the night",
`uisce` "water" is `an t-uisce`, `sráid` "street" is `an tsráid`.  A
dictionary lists the plain form, so every match strips the mutation first:
`plain()` gives the candidates a token could be, the token itself first.
Lenition is undone only where it is a lenition (an `h` after b c d f g m p s t),
eclipsis only where the eclipsing letter fits the radical (mb, gc, nd, bhf, ng,
bp, dt), and `d'` / `m'` / `b'` (d'ith, m'athair) are dropped.  This is for
MATCHING only: what a card prints is the dictionary's own spelling.
"""
import re, unicodedata

LEN = set('bcdfgmpst')
ECL = {'mb': 'b', 'gc': 'c', 'nd': 'd', 'bhf': 'f', 'ng': 'g', 'bp': 'p', 'dt': 't'}
VOW = set('aeiouáéíóú')
PRON = {'mé', 'tú', 'sé', 'sí', 'muid', 'sinn', 'sibh', 'siad', 'mise', 'tusa', 'seisean',
        'sise', 'muidne', 'sibhse', 'siadsan', 'é', 'í', 'iad'}

WORD = re.compile(r"[A-Za-zÁÉÍÓÚáéíóú][A-Za-zÁÉÍÓÚáéíóú'\-]*")


def nfc(s):
    return unicodedata.normalize('NFC', (s or '').replace('’', "'"))


def low(s):
    return nfc(s).lower().strip()


def tokens(text):
    """The words of a sentence, in order, as written (apostrophes and hyphens kept)."""
    return [t.rstrip("'-") for t in WORD.findall(nfc(text))]


def plain(tok):
    """Every form `tok` could be with its initial mutation undone, `tok` itself first."""
    raw = nfc(tok).strip()
    t = low(tok)
    out = [t]
    # `n` and `t` prefix a vowel WITHOUT a hyphen only before a capital (`i nÉirinn`,
    # `an tUachtarán`); in lower case they are always hyphenated (`ár n-athair`,
    # `an t-uisce`), so `tuigeann` is never `t` + `uigeann`
    cap = len(raw) > 1 and raw[1:2].isupper()

    def add(x):
        if x and x not in out:
            out.append(x)
    for p in ("d'", "m'", "b'"):
        if t.startswith(p) and len(t) > 2:
            add(t[2:])
    for x in list(out):
        if x[:2] in ('n-', 't-', 'h-'):
            add(x[2:])
        if len(x) > 2 and x[0] == 'h' and x[1] in VOW:
            add(x[1:])
        if cap and len(x) > 2 and x[0] in 'nt' and x[1] in VOW:
            add(x[1:])
        if x.startswith('ts') and len(x) > 2:
            add(x[1:])
        if len(x) > 2 and x[0] in LEN and x[1] == 'h':
            add(x[0] + x[2:])
        for e, r in ECL.items():
            if x.startswith(e) and len(x) > len(e):
                add(r + x[len(e):])
    return out


def form_key(form):
    """The one word of a dictionary's multi-word form that stands for the lemma:
    `an bhean` -> bhean, `leis an bhfear` -> bhfear, `cheannaigh sé` -> cheannaigh,
    `níos mó` -> mó."""
    ws = tokens(form)
    if not ws:
        return ''
    if len(ws) > 1 and low(ws[-1]) in PRON:
        return low(ws[-2])
    return low(ws[-1])
