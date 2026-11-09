"""Small Greek helpers shared by every stage of `.claude/greek/`.

THE FOLD.  A dictionary and a subtitle corpus write Greek almost alike, so the
fold is deliberately light: NFC, lower case, and final sigma written as medial
(`ς` -> `σ`).  THE ACCENT IS KEPT.  Stripping it would merge words Greek keeps
apart by nothing else -- `η` "the" and `ή` "or", `που` "that, which" and `πού`
"where?", `πως` "that" and `πώς` "how?" -- and hand one word's count to the
other.  The fold is for MATCHING only: what a card prints is the dictionary's
own spelling.

THE ROMANISATION.  Wiktionary gives one for every headword and for every cell
of a noun's or an adjective's table, and the card prints those.  A verb's table
carries none, so `translit()` writes one by Wiktionary's own scheme
(Module:el-translit: β v, η i, υ y, χ ch, ου ou, αυ/ευ av/ev or af/ef before a
voiceless sound, γγ ng, γκ gk, γξ nx, γχ nch, the accent kept as an acute).
Measured against Wiktionary's romanisations of the noun and adjective table
cells (`python3 gr.py`, 2026-11-09): 779 of 300,114 cells disagree (0.26 %),
nearly all polytonic spellings (`Κωνσταντῖνος`), Wiktionary's own inconsistency
over η after a vowel (`ανόητος` anóitos beside `αηδόνι` aïdóni) and loanwords.
"""
import re, unicodedata

GREEK = re.compile(r'[Ͱ-Ͽἀ-῿]')
WORD = re.compile(r'[Ͱ-Ͽἀ-῿]+')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    return nfc(s).lower().replace('ς', 'σ').strip()


def is_greek(s):
    """Every letter Greek (spaces and hyphens allowed)."""
    s = (s or '').strip()
    if not s:
        return False
    return all(GREEK.match(ch) or ch in ' -' for ch in s)


def tokens(text):
    """The Greek words of a sentence, in order."""
    return WORD.findall(nfc(text))


# ---- romanisation (Wiktionary's Module:el-translit, for the cells that carry none) ------
ACUTE = '́'
DIAER = '̈'
ONE = {'α': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'i', 'θ': 'th',
       'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
       'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps',
       'ω': 'o'}
VOICELESS = set('θκξπσςτφχψ')


def _acc(s):
    """'o' + accent -> 'ó' (the accent rides on the first vowel letter written)."""
    return unicodedata.normalize('NFC', s[0] + ACUTE + s[1:])


def translit(word):
    s = unicodedata.normalize('NFD', word or '')
    # letters as (base, accent?, diaeresis?)
    L = []
    for ch in s:
        if ch == ACUTE and L:
            L[-1][1] = True
        elif ch == DIAER and L:
            L[-1][2] = True
        elif unicodedata.category(ch) == 'Mn':
            continue
        else:
            L.append([ch, False, False])
    out, i = [], 0
    consumed_prev = False
    while i < len(L):
        b, ac, di = L[i]
        up = b != b.lower()
        b = b.lower()
        nx = L[i + 1] if i + 1 < len(L) else None
        nb = nx[0].lower() if nx else ''
        piece = None
        if b in 'αεη' and nb == 'υ' and not nx[2]:
            after = L[i + 2][0].lower() if i + 2 < len(L) else ''
            v = 'f' if (after in VOICELESS or after == '' or not GREEK.match(after)) else 'v'
            base = {'α': 'a', 'ε': 'e', 'η': 'i'}[b]
            piece = (_acc(base) if nx[1] or ac else base) + v
            i += 2
        elif b == 'ο' and nb == 'υ' and not nx[2]:
            piece = 'oú' if (nx[1] or ac) else 'ou'
            i += 2
        elif (i == 0 or not GREEK.match(L[i - 1][0])) and (b, nb) in (('μ', 'π'),):
            # word-initial μπ is b (μπίρα bíra); initial ντ and γκ stay nt and gk (ντουλάπα
            # ntoulápa) -- measured against Wiktionary's cells, see __main__
            piece = 'b'
            i += 2
        elif b == 'γ' and nb and nb in 'γκξχ':
            piece = {'γ': 'ng', 'κ': 'gk', 'ξ': 'nx', 'χ': 'nch'}[nb]
            i += 2
        else:
            t = ONE.get(b)
            prev = L[i - 1][0].lower() if i else ''
            # an η after α ε ο ω, which the Latin would read as a diphthong (ζωή zoḯ,
            # βοήθεια voḯtheia, αηδόνι aïdóni): Wiktionary marks it with a diaeresis, as
            # Greek itself marks ϊ.  Wiktionary is not consistent here (ανόητος anóitos), and
            # the rule follows its majority
            if t and prev in ('α', 'ε', 'ο', 'ω') and not di and \
                    (b == 'η' or (b == 'ι' and prev == 'ω')) and not consumed_prev:
                di = True
            if t is None:
                piece = b
            else:
                piece = _acc(t) if ac else t
                if di:
                    piece = unicodedata.normalize('NFC', piece + DIAER) if not ac else \
                        unicodedata.normalize('NFC', t + DIAER + ACUTE)
            i += 1
        consumed_prev = len(piece) > 1 and piece not in ('th', 'ch', 'ps') and \
            not piece.startswith(('th', 'ch', 'ps'))
        if up:
            piece = piece[:1].upper() + piece[1:]
        out.append(piece)
    return unicodedata.normalize('NFC', ''.join(out))


SUPS = re.compile(r'[\u00b9\u00b2\u00b3\u2070-\u209f]+')


def roman_clean(r):
    """Wiktionary's romanisation without its footnote marks (`mía¹`)."""
    return nfc(SUPS.sub('', r or '')).strip()


if __name__ == '__main__':
    # measure translit() against Wiktionary's own table romanisations
    import json, os, sys, collections
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'greek-cache', 'kaikki-el.jsonl')
    n = bad = 0
    miss = collections.Counter()
    for line in open(p, encoding='utf-8'):
        e = json.loads(line)
        for f in e.get('forms') or []:
            if f.get('roman') and is_greek(f.get('form', '')) and ' ' not in f['form']:
                n += 1
                if translit(f['form']) != roman_clean(f['roman']):
                    bad += 1
                    if len(miss) < 25:
                        miss[(f['form'], f['roman'], translit(f['form']))] += 1
    print(f'{n} cells, {bad} disagree ({100 * bad / max(n, 1):.2f}%)')
    for k in list(miss)[:25]:
        print('  ', *k)
