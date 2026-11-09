"""Small Latin helpers shared by every stage of `.claude/latin/`.

THE FOLD.  A dictionary and a corpus spell Latin differently in four ways, and a
match that ignores them loses words:
  · MACRONS (and the breve, diaeresis and tie bar): Wiktionary writes `amō`,
    `rēgīna`; Tatoeba and most printed texts write `amo`, `regina`;
  · I AND J: `iam` / `jam`, `eius` / `ejus` -- older editions use j;
  · U AND V: `uenio` / `venio` -- some editions write u for both;
  · CAPITALS at the start of a sentence, and the ligatures æ and œ.
So `fold()` decomposes, drops every combining mark, lower-cases, writes j as i
and v as u, and opens the ligatures.  The fold is for MATCHING only: what a card
prints is Wiktionary's spelling, macrons and all (the owner's decision,
2026-11-09).

`macronless()` is what the SPEAKER reads: the headword with its marks removed
but its letters and case kept (an Italian voice -- see the plan -- reads `amo`
and stumbles on `amō`).
"""
import re, unicodedata

MARKS = re.compile(r'[̀-ͯ]')
WORD = re.compile(r"[A-Za-zÀ-ɏ̀-ͯ]+")


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def tidy(s):
    """Wiktionary's display form, minus the marks a learner's card does not want:
    an anceps vowel's macron and breve (`egō̆` -> `ego`) and the tie bar of a diphthong (`e͡i`).
    The macron stays."""
    s = unicodedata.normalize('NFD', s or '')
    # an ANCEPS vowel (macron AND breve: `egō̆`, `ubī̆`, `mihī̆`) is shown unmarked, as
    # textbooks print it: `ego`, `ubi`, `mihi`
    s = s.replace('̄̆', '').replace('̆̄', '')
    s = s.replace('̆', '').replace('͡', '')
    return unicodedata.normalize('NFC', s).strip()


def macronless(s):
    s = unicodedata.normalize('NFD', s or '')
    return unicodedata.normalize('NFC', MARKS.sub('', s)).strip()


def fold(s):
    s = unicodedata.normalize('NFD', s or '')
    s = MARKS.sub('', s).lower()
    s = s.replace('æ', 'ae').replace('œ', 'oe').replace('j', 'i').replace('v', 'u')
    return s.strip()


def is_latin(s):
    """A lower-case Latin word or phrase: letters (with marks), spaces, nothing else.
    A capital is a proper name, a hyphen an affix or an enclitic."""
    s = (s or '').strip()
    if not s or s != s.lower():
        return False
    return all(WORD.match(ch) or ch == ' ' for ch in s)


def tokens(text):
    """The words of a sentence, in order."""
    return WORD.findall(nfc(text))


# A SECOND HEADWORD A CARD TEACHES because running text cannot tell them apart: `hic`
# "this" and `hīc` "here" are one spelling without macrons, and every sentence that
# matches one matches the other, so the card gives both.
ALSO = {'hic': ['hīc']}


def kept(row, L):
    """The Wiktionary entries a selected row stands for (`select.py` says why):
    those spelt as the row's `canon`, then those the DCC list's part of speech allows
    -- each narrowing only if it leaves something."""
    ents = L['entries']
    if row.get('canon'):
        allow = set(row['canon']) | {a for c in row['canon'] for a in ALSO.get(c, [])}
        ents = [e for e in ents if e['canon'] in allow] or ents
    # A HOMOGRAPH OF ANOTHER OPEN CLASS than the DCC list gives is another word: `altus`
    # "high" is also the participle of `alō`, `capiō` "take" also a noun "a taking",
    # `mīlle` also "a mile".  A closed-class neighbour (`ut` adverb and conjunction) stays,
    # and so does a noun beside an adjective (`amīcus` "friend"), which is the adjective
    # used as a noun -- and so does whatever the inventory names after its colon.
    dpos = set(row.get('dccpos') or [])
    if dpos:
        ok = [e for e in ents if e['pos'] in dpos or e['pos'] == row.get('pos')
              or e['pos'] not in ('noun', 'verb', 'intj')
              or (e['pos'] == 'noun' and 'adj' in dpos)]
        ents = ok or ents
    return ents
