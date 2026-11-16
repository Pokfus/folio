#!/usr/bin/env python3
"""Count the words of the Yoruba Wikipedia: `yowiki.xml.bz2` -> `yo_counts.json`.

    python3 wikitext.py      (from the cache directory, by run.py)

WHY WIKIPEDIA.  No subtitle frequency list exists for Yoruba (hermitdave/
FrequencyWords has none) and Tatoeba holds about 120 Yoruba sentences, too few
to count, so the counts come from the Yoruba Wikipedia's articles (CC BY-SA 4.0),
the dump of 2026-11-01 -- the Amharic arrangement.

ONLY ARTICLES OF 150 WORDS OR MORE ARE READ.  Two thirds of the 42,000 articles
are bot stubs of a line or two -- about 14,700 on minor planets alone ("plánẹ̀tì
kékeré"), which made "kékeré" the sixth word of the language -- and the 8,400
longer ones (4.2 million words) are written prose.  Main namespace only,
redirects skipped; the markup stripped crudely (`strip`).  A spelling is counted
at most ONCE PER ARTICLE (`df`), as for Amharic.

WHAT IS WRITTEN: for every spelling (`yo.nfc`, lower case) its article count over
ALL the articles read (`df`), and over the CAREFULLY MARKED ones alone
(`marked`): an article in which at least 35 % of the Yoruba-looking words carry a
tone mark.  In those, a word written with no tone is a mid-tone word, so their
counts can share an unmarked text's `ti` out among ti, tí and tì (`extract.py`).
"""
import bz2, collections, json, re, sys, os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yo import tokens, toned

DUMP, OUT = 'yowiki.xml.bz2', 'yo_counts.json'
MIN_WORDS = 150
MARKED = 0.35

PAGE = re.compile(r'<page>(.*?)</page>', re.S)
NS = re.compile(r'<ns>(\d+)</ns>')
TEXT = re.compile(r'<text[^>]*>(.*?)</text>', re.S)


def strip(t):
    t = (t.replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"')
          .replace('&amp;', '&'))
    t = re.sub(r'<!--.*?-->', ' ', t, flags=re.S)
    t = re.sub(r'<ref[^>]*/>', ' ', t)
    t = re.sub(r'<ref.*?</ref>', ' ', t, flags=re.S)
    for _ in range(4):                                   # nested templates
        t = re.sub(r'\{\{[^{}]*\}\}', ' ', t)
    t = re.sub(r'\{\|.*?\|\}', ' ', t, flags=re.S)       # tables
    t = re.sub(r'\[\[(?:[^\]|:]+):[^\]]*\]\]', ' ', t)    # files, categories, interwiki
    t = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', t)
    t = re.sub(r'\[https?://\S+\s*([^\]]*)\]', r'\1', t)
    t = re.sub(r'https?://\S+', ' ', t)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = re.sub(r"'{2,}", ' ', t)                         # bold and italic quotes
    t = re.sub(r'^=+.*?=+\s*$', ' ', t, flags=re.M)      # section headings (Ìtọ́kasí ...)
    return t


def main():
    raw = bz2.open(DUMP, 'rt', encoding='utf-8').read()
    df, marked = collections.Counter(), collections.Counter()
    articles = n_marked = words = 0
    for m in PAGE.finditer(raw):
        p = m.group(1)
        ns = NS.search(p)
        if not ns or ns.group(1) != '0' or '<redirect' in p:
            continue
        tx = TEXT.search(p)
        if not tx:
            continue
        toks = [t.lower() for t in tokens(strip(tx.group(1)))]
        if len(toks) < MIN_WORDS:
            continue
        articles += 1
        words += len(toks)
        s = set(toks)
        df.update(s)
        if sum(1 for t in toks if toned(t)) >= MARKED * len(toks):
            n_marked += 1
            marked.update(s)
    json.dump({'articles': articles, 'marked_articles': n_marked, 'df': dict(df),
               'marked': dict(marked)},
              open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    print(f'  {articles} articles ({n_marked} carefully marked), {words} words, {len(df)} spellings')


if __name__ == '__main__':
    main()
