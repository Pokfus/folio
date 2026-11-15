#!/usr/bin/env python3
"""Up to three example sentences for each word, from Tatoeba.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and `tat.json` (extract.py's Tatoeba pairs, each sentence
already cut into words by its own Jyutping transcription) and writes `examples-<level>.json`:
row key -> up to three [Cantonese, English, Jyutping, [[start, end], ...]] rows.

A WORD IS FOUND ONLY ON THE SENTENCE'S OWN CUTS: its first character starts a transcribed word and
its last ends one, so 日 "day" is never found inside 今日 "today".  AND IN ITS OWN READING: where
the transcription gives the characters another reading the dictionary knows (行 hong4 "a trade" in a
sentence for 行 haang4 "to walk"), it is another word and the sentence is not used for this card -- unless the two
readings share a gloss, which makes them one word said two ways (佢 keoi5 and its casual heoi5, both
"he; she; it").  A reading the dictionary does not know for those characters is taken for the
transcriber's slip, not another word.

THE JYUTPING LINE IS SHOWN ONLY WHERE IT CAN BE TRUSTED.  Tatoeba's transcriptions are made by
machine and then corrected by hand only sometimes: they write 冇 as mou2 some 2,500 times, where
HKCanCor and both dictionaries have mou5.  A sentence's Jyutping is printed only when EVERY word in
it that the dictionaries hold is given one of the dictionaries' own readings; otherwise the sentence
is still used, with no romanisation under it.

THE CHOICE IS DETERMINISTIC: the word in its own reading first, then sentences of 5 to 20
characters (Cantonese's short sentence), then the shorter, then the lower sentence id -- so a re-run
is byte-identical.  Nothing over 40 characters is used (Tatoeba's Cantonese holds whole paragraphs).
Each sentence is used at most once per deck.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yue import fold, is_cjk
from cantonese_level import f

MAXLEN = 40


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    readings = {w: {e['j'] for e in L} for w, L in lex.items()}
    glosses = {(w, e['j']): set(e['g']) | set(e['w']) for w, L in lex.items() for e in L}
    sents = []
    for sid, text, en, cuts in json.load(open('tat.json', encoding='utf-8')):
        n = sum(1 for ch in text if is_cjk(ch))
        if n > MAXLEN:
            continue
        trusted = all(fold(text[a:b]) not in readings or j in readings[fold(text[a:b])]
                      for a, b, j in cuts)
        jp = ' '.join(j for _, _, j in cuts) if trusted else ''
        starts = {a: i for i, (a, _, _) in enumerate(cuts)}
        sents.append((sid, text, en, cuts, starts, n, jp))
    used, out = set(), {}
    n_used = 0
    for row in rows:
        w, want = row['word'], row['jp']
        known = readings.get(w, set())
        cands = []
        for k, (sid, text, en, cuts, starts, n, jp) in enumerate(sents):
            if w not in text:
                continue
            spans, other = [], False
            i = text.find(w)
            while i >= 0:
                if i in starts:
                    t = starts[i]
                    js, end = [], None
                    while t < len(cuts) and cuts[t][1] <= i + len(w):
                        js.append(cuts[t][2])
                        end = cuts[t][1]
                        t += 1
                    if end == i + len(w):
                        got = ' '.join(js)
                        # another reading is another WORD only if it shares no gloss with this
                        # one: 佢 heoi5 is the casual keoi5, both "he; she; it"
                        mine = glosses.get((w, want), set())
                        if got == want or got not in known or mine & glosses.get((w, got), set()):
                            spans.append([i, i + len(w)])
                        else:
                            other = True
                i = text.find(w, i + 1)
            if spans and not other:
                cands.append(((0 if 5 <= n <= 20 else 1, n, sid), k, spans))
        picked = []
        for _, k, spans in sorted(cands):
            if k in used:
                continue
            used.add(k)
            s = sents[k]
            picked.append([s[1], s[2], s[6], spans])
            n_used += 1
            if len(picked) == 3:
                break
        out[row['key']] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    nr = sum(1 for v in out.values() for x in v if x[2])
    print(f'  {len(sents)} Tatoeba pairs of {MAXLEN} characters or fewer; {n_used} sentences used '
          f'({nr} with Jyutping); three for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
