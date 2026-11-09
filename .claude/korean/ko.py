#!/usr/bin/env python3
"""Shared paths and the hangul arithmetic for the Korean decks.

Nothing here reads the network.  `run.py` lists the downloads (curl them into `.claude/korean-cache/src/`),
`extract.py` turns them into the JSON the builders read, and every builder reads only that JSON.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
CACHE = os.path.join(ROOT, '.claude', 'korean-cache')
SRC = os.path.join(CACHE, 'src')
DECKS = os.path.join(ROOT, 'decks')

# A FIXED TIMESTAMP, so a rebuild on unchanged inputs writes the same bytes (the UKBI rule).
STAMP = 1794182400000      # 2026-11-09T00:00:00Z
COLOR = '#365442'          # the Korean collection's hue, `lang-korean` in app.js COLL_THEME


def c(name):
    return os.path.join(CACHE, name)


def load(name):
    with open(c(name), encoding='utf-8') as fh:
        return json.load(fh)


def save(name, obj):
    with open(c(name), 'w', encoding='utf-8') as fh:
        json.dump(obj, fh, ensure_ascii=False)


def is_hangul(ch):
    return '가' <= ch <= '힣'


def is_hanja(ch):
    return '一' <= ch <= '鿿' or '㐀' <= ch <= '䶿' or '豈' <= ch <= '﫿'


LEAD = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
VOWEL = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
TAIL = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ',
        'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']


def split(ch):
    """A hangul syllable -> (lead, vowel, tail) jamo; None for anything else."""
    if not is_hangul(ch):
        return None
    n = ord(ch) - 0xAC00
    return LEAD[n // 588], VOWEL[(n % 588) // 28], TAIL[n % 28]


def join(lead, vowel, tail=''):
    return chr(0xAC00 + LEAD.index(lead) * 588 + VOWEL.index(vowel) * 28 + TAIL.index(tail))


def has_tail(ch):
    s = split(ch)
    return bool(s and s[2])


# REVISED ROMANIZATION, letter by letter -- the Hangul deck's own spelling of a single jamo and of a syllable
# read on its own, where no sound change can apply.  A WORD's romanization is never computed here: it is
# Wiktionary's, which applies the sound changes RR spells (학교 hakgyo, 신라 Silla).
RR_LEAD = {'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt', 'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp',
           'ㅅ': 's', 'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'}
RR_VOWEL = {'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o',
            'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu',
            'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i'}
# a final consonant is spelled by the sound it makes at the end of a syllable (RR's own table)
RR_TAIL = {'': '', 'ㄱ': 'k', 'ㄲ': 'k', 'ㄳ': 'k', 'ㄴ': 'n', 'ㄵ': 'n', 'ㄶ': 'n', 'ㄷ': 't', 'ㄹ': 'l', 'ㄺ': 'k',
           'ㄻ': 'm', 'ㄼ': 'l', 'ㄽ': 'l', 'ㄾ': 'l', 'ㄿ': 'p', 'ㅀ': 'l', 'ㅁ': 'm', 'ㅂ': 'p', 'ㅄ': 'p', 'ㅅ': 't',
           'ㅆ': 't', 'ㅇ': 'ng', 'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 't'}


def rr_syllable(ch):
    l, v, t = split(ch)
    return RR_LEAD[l] + RR_VOWEL[v] + RR_TAIL[t]


TENSE = {'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ'}


def rr_from_pron(word, pron):
    """Revised Romanization of a word from its STANDARD PRONUNCIATION written in hangul (KRDict's [가까워지다]),
    used only where Wiktionary gives no romanization.  RR spells the sound changes -- liaison, nasalisation,
    ㄹ-assimilation, aspiration -- which the pronunciation already shows, with two exceptions it writes from
    the spelling: tensification is NOT spelled (학교 [학꾜] is hakgyo), and ㅢ is always ui.  None if the two
    strings do not line up syllable for syllable."""
    pron = pron.split('/')[0].replace('ː', '').replace(' ', '').strip()
    word = word.replace(' ', '')
    if len(pron) != len(word) or not all(is_hangul(c) for c in pron + word):
        return None
    out, prev_tail, prev_wt = [], '', ''
    ASP = {'ㄱ': 'ㅋ', 'ㄺ': 'ㅋ', 'ㄷ': 'ㅌ', 'ㅅ': 'ㅌ', 'ㅂ': 'ㅍ', 'ㄼ': 'ㅍ', 'ㅈ': 'ㅊ'}
    for w, p in zip(word, pron):
        wl, wv, wt = split(w)
        pl, _pv, pt = split(p)
        if pl in TENSE and (TENSE[pl] == wl or (wl == 'ㅇ' and prev_wt not in ('ㄲ', 'ㅆ'))):
            # tensification is not spelled; 없이 [업씨] is eopsi
            pl = TENSE[pl]
            if prev_wt and not prev_tail and out:
                # the sai-siot or a final the pronunciation swallowed: 젓가락 [저까락] is jeotgarak
                out[-1] += RR_TAIL[prev_wt]
        if wl == 'ㅎ' and ASP.get(prev_wt) == pl and not prev_tail and out:
            # ㅎ after a final, as Wiktionary spells it: 착하다 [차카다] is chakhada, 특히 teukhi
            out[-1] += RR_TAIL[prev_wt]
            pl = 'ㅎ'
        if pl == 'ㄹ' and prev_tail == 'ㄹ':
            lead = 'l'
        else:
            lead = RR_LEAD[pl]
        out.append(lead + RR_VOWEL[wv] + RR_TAIL[pt])
        prev_tail, prev_wt = pt, wt
    return ''.join(out)
