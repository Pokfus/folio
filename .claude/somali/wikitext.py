#!/usr/bin/env python3
"""Count the words of the Somali Wikipedia: `sowiki.xml.bz2` -> `so_counts.json`.

    python3 wikitext.py      (from the cache directory, by run.py)

WHY WIKIPEDIA.  No subtitle frequency list exists for Somali (hermitdave/
FrequencyWords has none) and Tatoeba holds about 160 Somali sentences, too few
to count, so the counts come from the Somali Wikipedia's articles (CC BY-SA 4.0),
the dump of 2026-11-01 -- the Yoruba and Zulu arrangement.

ONLY ARTICLES OF 150 WORDS OR MORE ARE READ (one-line stubs are a bot's
formulae), main namespace only, redirects skipped, the markup stripped crudely
(`strip`).  A spelling is counted at most ONCE PER ARTICLE (`df`), so an article
repeating itself counts once.  Written: every spelling, lower case, with its
article count.
"""
import bz2, collections, json, re, sys, os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from so import tokens

DUMP, OUT = 'sowiki.xml.bz2', 'so_counts.json'
MIN_WORDS = 150

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
    t = re.sub(r'^=+.*?=+\s*$', ' ', t, flags=re.M)      # section headings (Tixraac ...)
    return t


def main():
    raw = bz2.open(DUMP, 'rt', encoding='utf-8').read()
    df = collections.Counter()
    articles = words = 0
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
        df.update(set(toks))
    json.dump({'articles': articles, 'df': dict(df)},
              open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    print(f'  {articles} articles, {words} words, {len(df)} spellings')


if __name__ == '__main__':
    main()
