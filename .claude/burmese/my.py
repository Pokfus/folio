#!/usr/bin/env python3
"""Burmese text helpers shared by every stage of `.claude/burmese/`.

THE SCRIPT.  Burmese is written in the Myanmar script (U+1000-U+109F), an abugida:
a consonant letter carries the inherent vowel a, and the other vowels, the tones,
the medial consonants (ျ ြ ွ ှ) and the finals (the asat ်) are marks around it.
The plan is `docs/burmese-decks-plan.md`; read it before changing anything here.

NO SPACES BETWEEN WORDS.  Burmese puts a space between phrases, not words, so the
words are CUT in two steps, with no library (the generator needs none):
  · `syllables` -- a syllable starts at a consonant or an independent vowel, unless
    that letter is a final (followed by the asat ် or the stacking sign ္) or the
    lower half of a stack (after ္).  This is the standard rule of every Burmese
    syllable breaker, written out here;
  · `Cutter` -- forward maximal matching of syllables against a dictionary (every
    Burmese headword of English Wiktionary, names included, so a name is taken whole
    rather than counted as its syllables).  A syllable no dictionary word starts is a
    token of its own.

THE NORMALISATION (`norm`).  NFC, then the misorderings Burmese typing leaves that
NFC does not mend (ု before ိ, ံ before ု), ဥ + ် for ဉ်, ဥ + ီ for ဦ, the digit
zero ၀ between letters for the letter ဝ, and the invisible joiners.  A word is
compared AS SPELT after this, never folded further: Burmese has no homophone
letters written interchangeably in common words, as Amharic has.

ZAWGYI (`zawgyi`).  Much Burmese text was typed in Zawgyi, a font encoding that
puts other letters on the same code points.  A paragraph that carries its marks
(the code points U+1060-U+1097, which standard Burmese never uses, or the vowel ေ
written before its consonant) is not counted.
"""
import re, unicodedata

MY = 'က-႟'
CONS = 'က-အဿ'
INDEP = 'ဣ-ဪ'
ASAT, STACK = '်', '္'
TOKEN_RE = re.compile(f'[{MY}]+')
WORDISH = re.compile(f'^[{MY}]+$')
_START = re.compile(f'[{CONS}{INDEP}၌-၏၀-၉]')
ZAWGYI = re.compile('[ၠ-႗]|(?:^|[\\s၊။(])ေ|ေ[ျြ]')


def norm(s):
    s = unicodedata.normalize('NFC', s or '')
    s = s.replace('​', ' ').replace('‌', '').replace('‍', '').replace('﻿', '')
    s = s.replace('ုိ', 'ို').replace('ံု', 'ုံ')
    s = s.replace('့်', '့်')
    s = s.replace('ဥ်', 'ဉ်').replace('ဦ', 'ဦ')
    s = re.sub(f'(?<=[{CONS}ါ-ှ])၀|၀(?=[ါ-ှ])', 'ဝ', s)
    return s


def zawgyi(text):
    return bool(ZAWGYI.search(text or ''))


def syllables(word):
    """Cut a run of Burmese letters into syllables (module docstring)."""
    w = norm(word)
    out, cur = [], ''
    for i, ch in enumerate(w):
        nxt = w[i + 1] if i + 1 < len(w) else ''
        prev = w[i - 1] if i else ''
        if cur and _START.match(ch) and prev != STACK and nxt not in (ASAT, STACK):
            out.append(cur)
            cur = ''
        cur += ch
    if cur:
        out.append(cur)
    return out


def is_burmese(w):
    """A headword this pipeline teaches: Myanmar letters only, no digits, no spaces."""
    w = norm(w).replace(' ', '')
    return bool(w) and bool(WORDISH.match(w)) and not re.search('[၀-၉]', w)


def key(w):
    """What every match compares: the spelling, normalised, spaces removed."""
    return norm(w).replace(' ', '')


def runs(text):
    """The Burmese runs of a text (between spaces, punctuation and other scripts)."""
    return TOKEN_RE.findall(norm(text).replace('၊', ' ').replace('။', ' '))


class Cutter:
    """Forward maximal matching over syllables against a set of words."""

    def __init__(self, words, longest=8):
        self.words = {key(w) for w in words if w}
        self.longest = longest

    def cut(self, run):
        syl = syllables(run)
        out, i = [], 0
        while i < len(syl):
            for n in range(min(self.longest, len(syl) - i), 0, -1):
                cand = ''.join(syl[i:i + n])
                if n == 1 or cand in self.words:
                    out.append(cand)
                    i += n
                    break
        return out

    def tokens(self, text):
        out = []
        for r in runs(text):
            out.extend(self.cut(r))
        return out
