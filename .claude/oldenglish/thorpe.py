#!/usr/bin/env python3
"""Ælfric's sentences with Thorpe's own translation, by page: writes `thorpe-pairs.json`.

    python3 thorpe.py      (from the cache directory, by run.py, after extract.py)

WHY (the beginner pass, 2026-11-27; docs/lang-decks.md, "The Old English beginner pass").  The
deck is ranked on Ælfric and its only sentences were Tatoeba's: modern compositions by that
site's contributors (6 of the 382 of four words or more stand in Thorpe or Sweet), for 196 of
the 500 words, with no reference on the card.  Thorpe's 1844 edition prints his translation
FACING the text, and the Project Gutenberg transcription keeps the two as the two cells of one
table row (`td.saxonice`, `td.anglice`).  So a sentence of real prose can be shown with a
translation that is its editor's, and cited by the page it stands on.

HOW A PAIR IS MADE.  Nothing is aligned by guesswork:
  · a row's two cells are split into paragraphs; a row whose cells have different numbers of
    paragraphs is skipped;
  · a paragraph pair is split into sentences at . ? ! before a capital; a pair whose two sides
    have different numbers of sentences is skipped (Thorpe translates sentence for sentence,
    and where he does not the pair is not used);
  · a sentence pair whose two sides break at the same number of semicolons and colons also
    gives each of its clauses as a pair (Thorpe keeps the text's pointing; a clause is short,
    which is what a first reader needs), under the same check;
  · THE ANCHOR CHECK.  A sentence pair is kept only if at least `ANCHOR` of the Old English
    words whose lemma is known have one of that lemma's Wiktionary gloss words, or its Modern
    English descendant, in the English sentence (compared on a crude stem), and the two
    lengths are within `RATIO` of each other.  A pair that slipped a sentence fails it.
  · the page is the last page number the transcription printed in the Old English column
    before the sentence's first word (Thorpe's own pagination: even pages are the text).
The spelling is Thorpe's, untouched: ð and þ as the manuscript has them, an acute where it
marks a long vowel (hé, tácn), no macron and no dot.  The alphabet deck says how to read it.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oe import fold, tokens
from corpus import read

ANCHOR = 0.6
RATIO = (0.55, 2.6)
MIN_KNOWN = 3
REF = 'Ælfric, Catholic Homilies I, ed. Thorpe (1844), p. {}'
STOP = {'the', 'a', 'an', 'of', 'to', 'and', 'in', 'that', 'is', 'be', 'for', 'or', 'with', 'by',
        'it', 'as', 'at', 'on', 'not', 'but', 'from', 'his', 'he', 'this', 'which', 'who'}
CLAUSE = re.compile(r'(?<=[;:])\s+')
SENT = re.compile(r'(?<=[.?!])["”’\')]*\s+(?=["“‘(]*[A-ZÆÞÐ])')


def stem(w):
    w = w.lower()
    for suf in ('eth', 'est', 'ing', 'ed', 'es', 's', 'th', 'st', 'e'):
        if len(w) - len(suf) >= 3 and w.endswith(suf):
            return w[:-len(suf)]
    return w


def clean(b):
    b = re.sub(r'<span class="linenum">.*?</span>', ' ', b, flags=re.S)
    b = re.sub(r'<[^>]+>', ' ', b)
    b = re.sub(r'\[\d+\]', ' ', html.unescape(b))
    return re.sub(r'\s+', ' ', b).strip()


def paragraphs(cell):
    return [p for p in re.findall(r'<p[^>]*>(.*?)</p>', cell, re.S)]


def rows(path):
    """(old english cell, english cell) for every row of the parallel table."""
    s = read(path)
    return re.findall(r'<td class="saxonice">(.*?)</td>\s*<td class="anglice">(.*?)</td>', s, re.S)


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    freq = json.load(open('freq.json', encoding='utf-8'))
    owner = {}
    for key, (_, hs) in freq.items():
        owner.setdefault(key.rstrip('^'), max(hs, key=lambda h: (lex[h]['freq'], h)))
    gl = {}

    def gloss_stems(h):
        if h not in gl:
            ws = set()
            for e in lex[h]['entries']:
                for g in e['glosses']:
                    ws.update(re.findall(r"[a-z]+", g['g'].lower()))
                if e.get('modern'):
                    ws.add(e['modern'].lower())
            gl[h] = {stem(w) for w in ws - STOP}
        return gl[h]

    def anchor(x, y):
        """The share of the known Old English words whose gloss is in the English, or None."""
        tk = tokens(x)
        if not tk or not y or re.search(r'[\[\]{}]', x + y):
            return None
        known = [(fold(t), owner.get(fold(t))) for t in tk]
        known = [(k, h) for k, h in known if h]
        en = {stem(w) for w in re.findall(r"[A-Za-z]+", y)}
        hit = sum(1 for k, h in known if gloss_stems(h) & en)
        r = len(y.split()) / len(tk)
        if len(known) >= MIN_KNOWN and hit >= ANCHOR * len(known) and RATIO[0] <= r <= RATIO[1]:
            return round(hit / len(known), 2)
        return None

    out, page = [], 0
    n_rows = n_par = n_sent = 0
    for oe_cell, en_cell in rows('pg38334.html'):
        n_rows += 1
        po, pe = paragraphs(oe_cell), paragraphs(en_cell)
        if len(po) != len(pe):
            for m in re.finditer(r'\{(\d+)\}', oe_cell):
                page = int(m.group(1))
            continue
        for a, b in zip(po, pe):
            n_par += 1
            # the page a sentence begins on: split the paragraph at the page marks first
            a = re.sub(r'<span class="pagenum">.*?\{(\d+)\}.*?</span>', r' ⟦\1⟧ ', a, flags=re.S)
            b = re.sub(r'<span class="pagenum">.*?</span>', ' ', b, flags=re.S)
            a, b = clean(a), clean(b)
            so, se = SENT.split(a), SENT.split(b)
            ok = len(so) == len(se)
            for x, y in zip(so, se) if ok else ():
                here = page
                marks = re.findall(r'⟦(\d+)⟧', x)
                first = re.match(r'\s*⟦', x) is not None
                x = re.sub(r'\s*⟦\d+⟧\s*', ' ', x).strip()
                if marks and first:
                    here = int(marks[0])
                n_sent += 1
                # a sentence, and -- where both sides break at the same number of ; and : --
                # each of its clauses too: Thorpe keeps the text's pointing, and a clause is short
                cx, cy = CLAUSE.split(x), CLAUSE.split(y)
                units = [(x, y)]
                if len(cx) == len(cy) > 1 and not marks:
                    units += [(u.rstrip(' ;:'), v.rstrip(' ;:')) for u, v in zip(cx, cy)]
                for u, v in units:
                    a_ = anchor(u, v)
                    if a_ is not None:
                        out.append({'p': here, 'oe': u, 'en': v, 'a': a_})
                if marks:
                    page = int(marks[-1])
            if not ok:
                for m in re.finditer(r'⟦(\d+)⟧', a):
                    page = int(m.group(1))
    json.dump(out, open('thorpe-pairs.json', 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'  thorpe: {n_rows} rows, {n_par} paragraph pairs, {n_sent} sentence pairs with equal '
          f'counts; {len(out)} pass the anchor check')


if __name__ == '__main__':
    main()
