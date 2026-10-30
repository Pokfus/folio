#!/usr/bin/env python3
"""Shared paths and the kana arithmetic for the Japanese decks.

Nothing here reads the network.  `fetch.py` fills `.claude/jlpt-cache/` (gitignored), `extract.py`
turns the raw files into the JSON the builders read, and every builder reads only those.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
CACHE = os.path.join(ROOT, '.claude', 'jlpt-cache')
DECKS = os.path.join(ROOT, 'decks')
SRC = os.path.join(CACHE, 'src')


def c(name):
    return os.path.join(CACHE, name)


def load(name):
    with open(c(name), encoding='utf-8') as fh:
        return json.load(fh)


def save(name, obj):
    with open(c(name), 'w', encoding='utf-8') as fh:
        json.dump(obj, fh, ensure_ascii=False)


# A FIXED TIMESTAMP, so a rebuild on unchanged inputs writes the same bytes (the UKBI rule).
STAMP = 1793318400000      # 2026-10-30T00:00:00Z


# ------------------------------------------------------------------------------------- kana
def kata2hira(s):
    return ''.join(chr(ord(ch) - 0x60) if 'ァ' <= ch <= 'ヶ' else ch for ch in s)


def hira2kata(s):
    return ''.join(chr(ord(ch) + 0x60) if 'ぁ' <= ch <= 'ゖ' else ch for ch in s)


def is_kana(s):
    return all(('ぁ' <= ch <= 'ゖ') or ('ァ' <= ch <= 'ヺ') or ch in 'ーゝゞヽヾ・' for ch in s)


def is_kanji(ch):
    return '一' <= ch <= '鿿' or '㐀' <= ch <= '䶿' or ch in '々〆ヶ'


# ROMAJI IS HEPBURN SPELLED FROM THE KANA, LETTER FOR LETTER, and it marks a long vowel only where the
# KANA does.  Kana alone cannot say whether おう is one long vowel (とうきょう, Tōkyō) or two morae across a
# boundary (おもう, omou), so a macron written from おう would be a guess -- wrong on every verb in -ou.
# So おう is "ou", えい is "ei", and only katakana's ー, which IS a written long mark, becomes a macron.
_R = {
 'あ':'a','い':'i','う':'u','え':'e','お':'o','か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
 'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
 'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
 'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo','や':'ya','ゆ':'yu','よ':'yo',
 'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro','わ':'wa','ゐ':'wi','ゑ':'we','を':'o','ん':'n',
 'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go','ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
 'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do','ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
 'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po','ゔ':'vu',
 'ぁ':'a','ぃ':'i','ぅ':'u','ぇ':'e','ぉ':'o','ゃ':'ya','ゅ':'yu','ょ':'yo','ゎ':'wa',
}
_DIGRAPH = {
 'きゃ':'kya','きゅ':'kyu','きょ':'kyo','しゃ':'sha','しゅ':'shu','しょ':'sho','ちゃ':'cha','ちゅ':'chu',
 'ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo','ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','みゃ':'mya',
 'みゅ':'myu','みょ':'myo','りゃ':'rya','りゅ':'ryu','りょ':'ryo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
 'じゃ':'ja','じゅ':'ju','じょ':'jo','ぢゃ':'ja','ぢゅ':'ju','ぢょ':'jo','びゃ':'bya','びゅ':'byu',
 'びょ':'byo','ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
 # the extended katakana combinations loanwords use
 'ふぁ':'fa','ふぃ':'fi','ふぇ':'fe','ふぉ':'fo','てぃ':'ti','でぃ':'di','とぅ':'tu','どぅ':'du',
 'うぃ':'wi','うぇ':'we','うぉ':'wo','しぇ':'she','じぇ':'je','ちぇ':'che','ゔぁ':'va','ゔぃ':'vi',
 'ゔぇ':'ve','ゔぉ':'vo','いぇ':'ye','つぁ':'tsa','つぃ':'tsi','つぇ':'tse','つぉ':'tso',
}
_MACRON = {'a': 'ā', 'i': 'ī', 'u': 'ū', 'e': 'ē', 'o': 'ō'}


def romaji(kana):
    """Hepburn from kana; None if the string holds anything that is not kana (it is then not shown)."""
    h = kata2hira(kana)
    out, i = [], 0
    while i < len(h):
        two = h[i:i + 2]
        ch = h[i]
        if two in _DIGRAPH:
            out.append(_DIGRAPH[two]); i += 2; continue
        if ch == 'っ':
            nxt = h[i + 1:i + 3]
            r = _DIGRAPH.get(nxt) or _R.get(h[i + 1:i + 2], '')
            if r:
                out.append('t' if r.startswith('ch') else r[0])
            i += 1; continue
        if ch == 'ー':
            if out and out[-1] and out[-1][-1] in _MACRON:
                out[-1] = out[-1][:-1] + _MACRON[out[-1][-1]]
            i += 1; continue
        if ch == 'ん':
            nxt = h[i + 1:i + 2]
            # Hepburn writes n' before a vowel or y, so ほんや (hon'ya) is not read ho-nya
            out.append("n'" if nxt and (_R.get(nxt, 'x')[0] in 'aiueoy') else 'n')
            i += 1; continue
        if ch in _R:
            out.append(_R[ch]); i += 1; continue
        if ch in ' ・':
            out.append(' '); i += 1; continue
        if ch in '、。？！「」〜～':
            i += 1; continue
        return None
    return ''.join(out)
