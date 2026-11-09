"""Small Thai helpers shared by every stage of `.claude/thai/`.

THAI IS WRITTEN WITHOUT SPACES BETWEEN WORDS.  That is the one thing every
earlier pipeline here could take for granted and this one cannot: Hindi,
Turkish and Russian sentences split on spaces, a Thai sentence is one run of
letters (`ฉันกินข้าวแล้ว` is "I / eat / rice / already").  So to find a word in
a Tatoeba sentence, `segment()` cuts the sentence into words first, by
MAXIMAL MATCHING against a dictionary (the fewest dictionary words that cover
the run, ties going to the longer first word) -- the classic algorithm for
Thai and the one PyThaiNLP's default tokeniser is built on.  The dictionary is
every Wiktionary headword plus every word of the Thai National Corpus list,
so the cut agrees with the words the decks teach.  A letter no word covers is
a one-letter piece; a sentence is never dropped for want of a cut.

A compound the dictionary holds whole (กินข้าว "to have a meal") hides the
words it is made of, so `boundaries()` also cuts each piece once more without
itself, and a word found only at that depth is a second choice.

Without the cut a plain substring search finds `มา` "to come" inside `หมา`
"dog" and `ตา` "eye" inside `ตาย` "to die"; with it, a word is bolded only
where the sentence actually says it.

`fold()` is NFC plus the one variant Thai text really has: SARA AM written as
nikhahit + sara aa (U+0E4D U+0E32) instead of U+0E33, which looks identical.
"""
import re, unicodedata

THAI = re.compile(r'[ก-๛]')
RUN = re.compile(r'[ก-๎]+')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    s = nfc(s).replace('ํา', 'ำ')
    return s.strip()


def is_thai(s):
    """Every letter Thai (spaces allowed, and the repetition mark ๆ)."""
    s = (s or '').strip()
    if not s:
        return False
    return all(THAI.match(ch) or ch == ' ' for ch in s)


# A Thai syllable cannot begin with a vowel sign written after its consonant,
# a tone mark or the other combining marks -- so a cut may never fall before one.
NO_START = set('ะัาำิีึืฺุู'
               'ๅ็่้๊๋์ํ๎')
# ... nor may one fall after a leading vowel (เ แ โ ใ ไ), which is written
# BEFORE the consonant it is said after.
NO_END = set('เแโใไ')


class Segmenter:
    def __init__(self, words):
        self.words = {fold(w) for w in words if w and ' ' not in w}
        self.maxlen = max((len(w) for w in self.words), default=1)

    def _run(self, s, exclude=None):
        n = len(s)
        INF = (10 ** 9, 0)
        # best[i] = (pieces, unknown letters) to cover s[i:]; nxt[i] = end of the first piece
        best = [INF] * (n + 1)
        nxt = [0] * (n + 1)
        best[n] = (0, 0)
        for i in range(n - 1, -1, -1):
            if s[i] in NO_START and i > 0:
                continue
            for j in range(min(n, i + self.maxlen), i, -1):
                if j < n and s[j] in NO_START:
                    continue
                if s[j - 1] in NO_END:
                    continue
                if best[j] == INF:
                    continue
                piece = s[i:j]
                known = piece in self.words and piece != exclude
                if not known and j - i > 1:
                    # an unknown stretch is taken one cluster at a time
                    if any(ch not in NO_START for ch in piece[1:]):
                        continue
                cost = (best[j][0] + (1 if known else 3), best[j][1] + (0 if known else j - i))
                if cost < best[i]:
                    best[i], nxt[i] = cost, j
        out, i = [], 0
        while i < n:
            j = nxt[i] or n
            out.append(s[i:j])
            i = j
        return out

    def segment(self, text):
        """The Thai words of a sentence, in order (spaces, digits and punctuation are not words)."""
        out = []
        for run in RUN.findall(fold(text)):
            out.extend(self._run(run))
        return out

    def boundaries(self, text):
        """Where a word may start or end in `text` (folded), at two depths: the
        sentence's own cut (`coarse`), and that plus the cut of each piece into the
        words it is made of (`fine`) -- so ข้าว is found in กินข้าว "to have a meal",
        which the dictionary holds as one word, but only as a second choice."""
        text = fold(text)
        coarse, fine = set(), set()
        for m in RUN.finditer(text):
            pos = m.start()
            coarse.add(pos)
            for w in self._run(m.group(0)):
                # ONLY A TRUE COMPOUND is cut again: every part a dictionary word of
                # two letters or more.  ตาย "to die" re-cut is ตา "eye" + a stray ย,
                # and without this test "Did Tom die?" was an example for "eye".
                subs = self._run(w, exclude=w) if len(w) > 3 else [w]
                if len(subs) > 1 and all(len(x) > 1 and x in self.words for x in subs):
                    q = pos
                    for sub in subs:
                        q += len(sub)
                        fine.add(q)
                pos += len(w)
                coarse.add(pos)
        return text, coarse, fine | coarse

    def pieces(self, text):
        """The whole sentence cut into (piece, is_thai_word) pairs, so it can be printed back."""
        text = fold(text)
        out, pos = [], 0
        for m in RUN.finditer(text):
            if m.start() > pos:
                out.append((text[pos:m.start()], False))
            for w in self._run(m.group(0)):
                out.append((w, True))
            pos = m.end()
        if pos < len(text):
            out.append((text[pos:], False))
        return out
