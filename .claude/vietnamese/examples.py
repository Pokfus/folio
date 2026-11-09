#!/usr/bin/env python3
"""Three Tatoeba sentences for each word, matched as a WORD, not as syllables.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`vie_sentences_detailed.tsv`, `vie-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Vietnamese, English, [start, length] of the match in syllables] triples.

A SYLLABLE IS NOT A WORD.  `học` "to study" is a syllable of `học sinh`
"pupil", and a sentence about a pupil is no example of the verb.  So each
sentence is segmented the way `extract.py` segments the subtitles (greedy
longest match against every Wiktionary headword) and a word matches where it
is a SEGMENT.  A word matched only inside a longer one is used only when no
sentence has it on its own.  Among the matches the choice is deterministic:
a segment match first, then sentences of four to twelve syllables, then the
shorter, then the lower sentence id -- so a re-run is byte-identical.  A
Vietnamese sentence with several English translations takes the shortest.
Each sentence is used at most once per deck.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vi import fold, nfc, tokens, fold_syl
from vietnamese_level import f

csv.field_size_limit(10 ** 8)
MAXN = 4


def load():
    vie = {}
    for row in csv.reader(open('vie_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            vie[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('vie-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in vie:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for vid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(vid), vie[vid], en[0]))
    pairs.sort()
    return pairs


def segments(syl, keys):
    """Greedy longest match: [(start, length)] over the folded syllables."""
    out, i = [], 0
    while i < len(syl):
        take = 1
        for L in range(min(MAXN, len(syl) - i), 1, -1):
            if ' '.join(syl[i:i + L]) in keys:
                take = L
                break
        out.append((i, take))
        i += take
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    keys = set(lex)
    pairs = load()
    sents = []
    for pid, vi_s, en in pairs:
        syl = [fold_syl(t) for t in tokens(vi_s)]
        sents.append((pid, vi_s, en, syl, segments(syl, keys)))
    index = {}
    for i, s in enumerate(sents):
        for t in set(s[3]):
            index.setdefault(t, []).append(i)
    used, out = set(), {}
    for row in rows:
        words = fold(row['word']).split()
        n = len(words)
        cands = []
        for i in index.get(words[0], []):
            syl, seg = sents[i][3], sents[i][4]
            starts = {a for a, L in seg if L == n}
            hit = None
            for j in range(len(syl) - n + 1):
                if syl[j:j + n] == words:
                    if j in starts and ' '.join(syl[j:j + n]) == ' '.join(words):
                        hit = (0, j)
                        break
                    if hit is None:
                        hit = (1, j)
            if hit:
                cands.append((i, hit[0], hit[1]))

        def rank(c):
            i, own, _ = c
            k = len(sents[i][3])
            return (own, 0 if 4 <= k <= 12 else 1, len(sents[i][1]), sents[i][0])
        picked = []
        for c in sorted(cands, key=rank):
            if c[0] in used:
                continue
            used.add(c[0])
            _, vi_s, en, _, _ = sents[c[0]]
            picked.append([vi_s, en, [c[2], n]])
            if len(picked) == 3:
                break
        out[row['key']] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(pairs)} sentence pairs; three sentences for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
