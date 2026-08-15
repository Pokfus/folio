#!/usr/bin/env python3
"""Three real Indonesian sentences for each word, with their English.

The sentences are Tatoeba's (CC BY 2.0 FR).  Indonesian is a much smaller
corpus there than Spanish or German -- 28,192 sentences, of which 22,023 carry
an English pair, against hundreds of thousands for Spanish -- so this was
measured before the level was built rather than assumed: of the 500 words
chosen, 495 occur at least once and 486 at least three times.  A beginner's
vocabulary is exactly the part of a language a small sentence bank covers well,
and the count of words it cannot illustrate is printed on every run and stated
in the deck's own description.

A SENTENCE MAY MATCH ANY MEMBER OF THE WORD'S AFFIX FAMILY, and that is the
point rather than a convenience.  The card for `melihat` teaches a lexeme whose
forms are `lihat`, `melihat` and `dilihat`; a sentence showing the passive is
showing the reader something the headword alone cannot, and Indonesian uses the
passive far more than English does.  So the three sentences are chosen to show
DIFFERENT members of the family where the corpus has them, which is the German
generator's rule about inflected forms carried over to a language that derives
rather than inflects.
"""
import json, re, collections, html

from ukbi_level import f as lvlf

MAX_LEN = 110          # characters; a beginner's example should be readable
MIN_LEN = 12
WANT = 3


def token_rx(word):
    """Whole-word match, tolerant of the hyphen in a reduplication."""
    return re.compile(r'(?<![\w-])' + re.escape(word) + r'(?![\w-])', re.I)


def load_sentences():
    ind = {}
    for line in open('ind_sent.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3 and p[1] == 'ind':
            ind[p[0]] = p[2]
    links = collections.defaultdict(list)
    for line in open('ind_eng_links.tsv', encoding='utf-8'):
        p = line.split()
        if len(p) == 2:
            links[p[0]].append(p[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for line in open('eng_sent.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3 and p[0] in want:
            eng[p[0]] = p[2]
    pairs = []
    for sid, txt in ind.items():
        if not (MIN_LEN <= len(txt) <= MAX_LEN):
            continue
        for e in links.get(sid, []):
            if e in eng:
                pairs.append((txt, eng[e]))
                break
    return pairs


def main():
    wl = json.load(open(lvlf('wordlist.json'), encoding='utf-8'))
    words, fams = wl['words'], wl['families']
    pairs = load_sentences()

    # an inverted index on the lowercased tokens, so each word is not swept
    # over the whole corpus: 500 words x 22,000 sentences of regex is minutes,
    # and this is a second
    idx = collections.defaultdict(list)
    for i, (ind, _eng) in enumerate(pairs):
        for t in set(re.findall(r"[a-z]+(?:-[a-z]+)?", ind.lower())):
            idx[t].append(i)

    out = {}
    stats = collections.Counter()
    for w in words:
        family = fams.get(w, [w])
        # candidate sentences: any family member, longest form first so that a
        # sentence containing `melihat` is credited to `melihat` and not to the
        # `lihat` inside it
        cands = []
        seen = set()
        for form in sorted(family, key=len, reverse=True):
            head = form.split(' ')[0].lower()
            for i in idx.get(head, ()):
                if i in seen:
                    continue
                if token_rx(form).search(pairs[i][0]):
                    seen.add(i)
                    cands.append((form, i))
        # prefer a short sentence, and prefer showing a form not already shown
        cands.sort(key=lambda c: len(pairs[c[1]][0]))
        picked, shown = [], set()
        for form, i in cands:
            if len(picked) >= WANT:
                break
            if form in shown and len(cands) > WANT:
                continue
            shown.add(form)
            picked.append((form, i))
        if len(picked) < WANT:                       # top up, repeats allowed
            for form, i in cands:
                if len(picked) >= WANT:
                    break
                if i not in [j for _f, j in picked]:
                    picked.append((form, i))
        rows = []
        for form, i in picked:
            ind, eng = pairs[i]
            rows.append({'id': ind, 'en': eng, 'form': form})
        out[w] = rows
        stats[min(len(rows), 3)] += 1
        if len(set(f for f, _ in picked)) > 1:
            stats['multi-form'] += 1

    json.dump(out, open(lvlf('examples.json'), 'w', encoding='utf-8'),
              ensure_ascii=False)
    print(f'    sentences: {len(pairs)} usable pairs; '
          f'{stats[3]} words with three, {stats[2]} with two, {stats[1]} with one, '
          f'{stats[0]} with none; {stats["multi-form"]} show more than one form '
          'of the word')


if __name__ == '__main__':
    main()
