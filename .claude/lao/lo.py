"""Small Lao helpers shared by every stage of `.claude/lao/`.

LAO IS WRITTEN WITHOUT SPACES BETWEEN WORDS, as Thai is (`.claude/thai/th.py`,
whose segmenter this is, re-keyed to the Lao block U+0E80-U+0EFF).  A space in
Lao text marks a phrase or a clause, not a word, so a sentence is cut into
words by MAXIMAL MATCHING against a dictionary (the fewest dictionary words
that cover the run, ties going to the longer first word).  The dictionary is
every Wiktionary headword; a letter no word covers is a one-cluster piece, and
a sentence is never dropped for want of a cut.

`fold()` is NFC plus the variants Lao text really has, so that two spellings
of one word count as one:
  · SARA AM written as niggahita + sara aa (U+0ECD U+0EB2) for U+0EB3;
  · ໜ and ໝ written as two letters, ຫ + ນ and ຫ + ມ;
  · the soft hyphen and the zero-width space, which Lao web text scatters
    inside words as line-break hints.

THE ROMANISATION IS READ OFF WIKTIONARY'S IPA (`romanise`).  The kaikki
extraction carries Wiktionary's own romanisation too, but it is not one
system: ສະບາຍດີ is "sa bāi dī", ຂ້ອຍຊື່ "khööj syy ...", and where the module
meets ຍ it breaks (ໄດ້ຍິນ "dn", ນາຍົກ "nk").  The Vientiane IPA Wiktionary
generates beside it is consistent and present on 98% of entries, so the card's
romanisation is a fixed letter-for-sound transcription of that IPA, in the
Paiboon style the Thai decks use (doubled letters for a long vowel; ɛ ɔ ʉ ə;
a final -i and -o for j and w), with each syllable's TONE written after it as
the pitch contour Wiktionary gives, in Chao tone letters (˧˥ rising, ˩˧ low
rising, ˧ mid, ˥˨ high falling, ˧˩ low falling).  Nothing about the sound is
typed by hand.
"""
import re, unicodedata

LAO = re.compile(r'[຀-໿]')
RUN = re.compile(r'[ກ-ໍໜ-ໟ]+')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    s = nfc(s).replace('­', '').replace('​', '')
    s = s.replace('ໍາ', 'ຳ').replace('ຫນ', 'ໜ').replace('ຫມ', 'ໝ')
    return s.strip()


def is_lao(s):
    """Every letter Lao (spaces allowed, and the repetition mark ໆ)."""
    s = (s or '').strip()
    if not s:
        return False
    return all(LAO.match(ch) or ch == ' ' for ch in s)


# A syllable cannot begin with a vowel sign written after (or above, below) its
# consonant, a tone mark, or the subscript ລ -- so a cut may never fall before one.
NO_START = set('ະັາຳິີຶື຺ຸູົຼຽ'
               '່້໊໋໌ໍ')
# ... nor may one fall after a leading vowel (ເ ແ ໂ ໃ ໄ), written BEFORE its consonant.
NO_END = set('ເແໂໃໄ')


class Segmenter:
    def __init__(self, words):
        self.words = {fold(w) for w in words if w and ' ' not in w}
        self.maxlen = max((len(w) for w in self.words), default=1)

    def _run(self, s, exclude=None):
        n = len(s)
        INF = (10 ** 9, 0)
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
        out = []
        for run in RUN.findall(fold(text)):
            out.extend(self._run(run))
        return out

    def boundaries(self, text):
        """Where a word may start or end in `text` (folded): the sentence's own cut
        (`coarse`), and that plus the cut of each true compound into its words (`fine`)."""
        text = fold(text)
        coarse, fine = set(), set()
        for m in RUN.finditer(text):
            pos = m.start()
            coarse.add(pos)
            for w in self._run(m.group(0)):
                subs = self._run(w, exclude=w) if len(w) > 3 else [w]
                if len(subs) > 1 and all(len(x) > 1 and x in self.words for x in subs):
                    q = pos
                    for sub in subs:
                        q += len(sub)
                        fine.add(q)
                pos += len(w)
                coarse.add(pos)
        return text, coarse, fine | coarse


# ---- the romanisation, from Wiktionary's Vientiane IPA -------------------------

TONE = re.compile(r'[˥˦˧˨˩]')
ONSETS = [('t͡ɕ', 'ch'), ('pʰ', 'ph'), ('tʰ', 'th'), ('kʰ', 'kh'), ('kʷʰ', 'khw'), ('kʷ', 'kw'), ('ʔʷ', 'w'),
          ('ɲ', 'ny'), ('ŋ', 'ng'), ('ʋ', 'v'), ('ʔ', ''), ('j', 'y'),
          ('p', 'p'), ('t', 't'), ('k', 'k'), ('b', 'b'), ('d', 'd'), ('s', 's'),
          ('h', 'h'), ('f', 'f'), ('m', 'm'), ('n', 'n'), ('l', 'l'), ('w', 'w')]
VOWELS = [('iːə̯', 'ia'), ('ɯːə̯', 'ʉa'), ('uːə̯', 'ua'), ('iə̯', 'ia'), ('ɯə̯', 'ʉa'), ('uə̯', 'ua'),
          ('aː', 'aa'), ('iː', 'ii'), ('uː', 'uu'), ('eː', 'ee'), ('oː', 'oo'),
          ('ɛː', 'ɛɛ'), ('ɔː', 'ɔɔ'), ('ɯː', 'ʉʉ'), ('ɤː', 'əə'),
          ('a', 'a'), ('i', 'i'), ('u', 'u'), ('e', 'e'), ('o', 'o'),
          ('ɛ', 'ɛ'), ('ɔ', 'ɔ'), ('ɯ', 'ʉ'), ('ɤ', 'ə')]
CODAS = {'': '', 'ʔ': '', 'p̚': 'p', 't̚': 't', 'k̚': 'k', 'm': 'm', 'n': 'n', 'ŋ': 'ng',
         'j': 'i', 'w': 'o', 's': 's'}   # a final s in loanwords (ໄວຣັສ "virus")


def _syllable(s):
    """One IPA syllable -> (letters, tone contour), or None if it does not parse."""
    tone = ''.join(TONE.findall(s))
    seg = re.sub(r'[˥˦˧˨˩()]', '', s)
    out = ''
    for ipa, rom in ONSETS:
        if seg.startswith(ipa):
            out, seg = rom, seg[len(ipa):]
            break
    else:
        return None
    for ipa, rom in VOWELS:
        if seg.startswith(ipa):
            vowel, seg = rom, seg[len(ipa):]
            break
    else:
        return None
    if seg not in CODAS:
        return None
    coda = CODAS[seg]
    # Paiboon writes a final w after o-vowels and i-vowels as -w ("iw", "eew"),
    # where -o would read as another vowel
    if coda == 'o' and vowel[-1:] in ('o', 'i', 'e', 'ɛ'):
        coda = 'w'
    if coda == 'i' and vowel[-1:] in ('i',):
        return None
    return out + vowel + coda, tone


def romanise(ipa):
    """'[sa(ʔ˧˥).baːj˩(˧).diː˩(˧)]' -> 'sa˧˥ baai˩˧ dii˩˧'; '' if any syllable fails."""
    body = (ipa or '').strip().strip('[]/')
    if not body:
        return ''
    out = []
    for syl in body.split('.'):
        r = _syllable(syl)
        if not r or not r[1]:
            return ''
        out.append(r[0] + r[1])
    return ' '.join(out)
