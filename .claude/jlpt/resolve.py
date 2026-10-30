#!/usr/bin/env python3
"""THE LIST'S JMDICT JOIN IS CHECKED, NOT TRUSTED.  stephenmk/yomitan-jlpt-vocab joins every row of Waller's
lists to a JMdict entry, and a handful of joins are to the wrong homograph: コップ ("a glass") to the slang
entry for "cop", ボタン ("button") to the tree peony, これ ("this") to the interjection "hey", だんだん
("gradually") to the dialect "thank you".  Nothing fails on a wrong join -- the card just teaches the wrong word.

So each row's own English (Waller's definition) is compared with the entry's glosses.  Where they share no word,
another entry with the same spelling and reading does share one, AND that entry is marked common (a JMdict
priority tag) for this spelling while the joined one is not, the row is moved to it.  The last condition is
there because WALLER'S OWN DEFINITION IS SOMETIMES THE MISTAKE: そっと is defined "face of the earth", どうか
"copper coin", せめて "offense" -- and moving those would swap a common word for an obscure homograph.  A row
whose entry shares no word but has no better alternative is left alone: those are paraphrases ("Hate" against
"disliking; hating"), and the join is right.
"""
import re
from collections import defaultdict
from common import load

J = load('jmdict.json')
BY = defaultdict(set)
for s, e in J.items():
    for k in e['k']:
        BY[k['t']].add(s)
    for r in e['r']:
        BY[r['t']].add(s)
STOP = {'to', 'a', 'an', 'the', 'of', 'be', 's'}


def _w(t):
    return {w for w in re.findall(r'[a-z]+', t.lower()) if w not in STOP}


def score(seq, defn):
    g = set()
    for s in J[seq]['s']:
        if set(s['misc']) & {'arch', 'obs', 'rare'}:
            continue
        for x in s['gloss']:
            g |= _w(x)
    return len(_w(defn) & g)


def common(seq, spelling):
    e = J[seq]
    return any(x['pri'] for x in e['k'] + e['r'] if x['t'] == spelling)


def resolve(row):
    """(seq, moved_from or None) for one CSV row."""
    s = row['jmdict_seq']
    if not s or score(s, row['waller_definition']) > 0:
        return s, None
    alts = [a for a in BY[row['kanji'] or row['kana']]
            if a != s and any(r['t'] == row['kana'] for r in J[a]['r'])]
    best = max(sorted(alts), key=lambda a: score(a, row['waller_definition']), default=None)
    sp = row['kanji'] or row['kana']
    if best and score(best, row['waller_definition']) > 0 and common(best, sp) and not common(s, sp):
        return best, s
    return s, None
