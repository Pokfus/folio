"""Small Khmer helpers shared by every stage of `.claude/khmer/`.

KHMER IS WRITTEN WITHOUT SPACES BETWEEN WORDS, as Thai is (`.claude/thai/th.py`
is this file's model).  A space in Khmer marks a pause -- the end of a clause, a
list item, a number -- not a word, so a sentence is one run of letters
(`ខ្ញុំញ៉ាំបាយ` is "I / eat / rice").  To find a word in a sentence or count it
in a corpus, `Segmenter` cuts each run into words by MAXIMAL MATCHING against a
dictionary (the fewest dictionary words that cover the run, ties to the longer
first word) -- the classic algorithm for both scripts.  The dictionary is every
Khmer headword of English Wiktionary, so the cut agrees with the words the decks
teach.  A stretch no word covers is taken one CLUSTER at a time (a consonant with
its subscripts, vowel and signs), and a sentence is never dropped for want of a
cut.

A CUT FALLS ONLY BETWEEN CLUSTERS (`clusters`): never before a dependent vowel or
a sign, and never after the COENG (U+17D2), the invisible mark that puts the next
consonant underneath as a subscript (ស + ្ + ត = ស្ត).  Without that rule a plain
substring search finds ត "ta" inside ស្តី.

Two spellings that LOOK THE SAME are one word to every stage (`key`):
  · the subscript ta and the subscript da are a single glyph, ្ត, written in
    Unicode as either COENG TA (U+17D2 U+178F) or COENG DA (U+17D2 U+178A) --
    Wiktionary itself files សួស្តី and សួស្ដី "hello" as two spellings of one
    word.  `key` writes both as COENG TA; it changes no length, so a span found in
    the key of a sentence is the same span in the sentence;
  · the ZERO WIDTH SPACE (U+200B), which Khmer writers type as an invisible word
    break -- the Khmer Wikipedia holds 1.5 million of them -- and the joiners
    and the two invisible inherent-vowel signs (U+17B4, U+17B5) are removed by
    `fold`, so they never split or hide a word.  A zero width space is taken as a
    hard cut by `chunks` before it is removed: the writer has said a word ends
    there.
"""
import re, unicodedata

COENG = '្'
KHMER = re.compile(r'[ក-៝០-៩᧠-᧿]')
# a run of letters that can make words: consonants, independent vowels,
# dependent vowels and signs (the repetition mark ៗ, U+17D7, is not a letter)
RUN = re.compile(r'[ក-៓៝]+')
INVISIBLE = dict.fromkeys(map(ord, '​‌‍⁠﻿឴឵'))


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    """NFC, the invisible marks removed."""
    return nfc(s).translate(INVISIBLE).strip()


def key(s):
    """fold(), and COENG DA written as COENG TA (one glyph, two spellings).  Same length as fold(s)."""
    return fold(s).replace(COENG + 'ដ', COENG + 'ត')


def is_khmer(s):
    """Every letter Khmer (spaces allowed, and the repetition mark ៗ)."""
    s = fold(s)
    if not s:
        return False
    return all(KHMER.match(ch) or ch == ' ' for ch in s)


def chunks(text):
    """The text split on spaces and zero width spaces -- the breaks the writer typed."""
    return [c for c in re.split(r'[\s​]+', nfc(text)) if c]


# A cluster cannot begin with a dependent vowel or a sign (U+17B4-U+17D3, U+17DD),
# nor with the consonant written under a COENG.
def _starts(s):
    """Where a cluster begins in a run of Khmer letters (0 and len(s) included)."""
    out = [0]
    for i in range(1, len(s)):
        c = s[i]
        if '឴' <= c <= '៓' or c == '៝':
            continue
        if s[i - 1] == COENG:
            continue
        out.append(i)
    out.append(len(s))
    return out


class Segmenter:
    """Maximal matching over a trie of the dictionary's KEYS (see `key`)."""

    def __init__(self, words):
        self.trie = {}
        self.words = set()
        for w in words:
            k = key(w)
            if not k or ' ' in k:
                continue
            self.words.add(k)
            node = self.trie
            for ch in k:
                node = node.setdefault(ch, {})
            node[''] = True

    def _ends(self, s, i, exclude=None):
        node, j, out = self.trie, i, []
        n = len(s)
        while j < n:
            node = node.get(s[j])
            if node is None:
                break
            j += 1
            if '' in node and s[i:j] != exclude:
                out.append(j)
        return out

    def _run(self, s, exclude=None):
        starts = _starts(s)
        ok = set(starts)
        n = len(s)
        INF = (10 ** 9, 0)
        best = {n: (0, 0)}
        nxt = {}
        nexts = {starts[k]: starts[k + 1] for k in range(len(starts) - 1)}
        for i in reversed(starts[:-1]):
            b, bj = INF, 0
            for j in self._ends(s, i, exclude):
                if j not in ok:
                    continue
                c = best[j]
                cost = (c[0] + 1, c[1])
                if cost < b or (cost == b and j > bj):
                    b, bj = cost, j
            # an unknown stretch: one cluster
            j = nexts[i]
            c = best[j]
            cost = (c[0] + 3, c[1] + (j - i))
            if cost < b:
                b, bj = cost, j
            best[i], nxt[i] = b, bj
        out, i = [], 0
        while i < n:
            j = nxt[i]
            out.append(s[i:j])
            i = j
        return out

    def segment(self, text):
        """The Khmer words of a text (keys), in order."""
        out = []
        for ch in chunks(text):
            for run in RUN.findall(key(ch)):
                out.extend(self._run(run))
        return out

    def boundaries(self, text):
        """Where a word may start or end in key(text), at two depths: the text's own
        cut (`coarse`), and that plus the cut of each piece into the words it is made
        of (`fine`) -- so បាយ is found in ញ៉ាំបាយ if the dictionary held that whole,
        but only as a second choice.  Returns (key(text), coarse, fine)."""
        t = key(text)
        coarse, fine = set(), set()
        for m in RUN.finditer(t):
            pos = m.start()
            coarse.add(pos)
            for w in self._run(m.group(0)):
                subs = self._run(w, exclude=w) if len(w) > 3 else [w]
                # ONLY A TRUE COMPOUND is cut again: every part a dictionary word
                # of two clusters or more.
                if len(subs) > 1 and all(len(_starts(x)) > 2 and x in self.words for x in subs):
                    q = pos
                    for sub in subs:
                        q += len(sub)
                        fine.add(q)
                pos += len(w)
                coarse.add(pos)
        return t, coarse, fine | coarse
