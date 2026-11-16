#!/usr/bin/env python3
"""Count the word forms of the Mongolian Wikipedia: `mnwiki.xml.bz2` -> `mn_counts.json`.

    python3 wikitext.py      (from the cache directory, by run.py)

WHY WIKIPEDIA.  No subtitle frequency list exists for Mongolian
(hermitdave/FrequencyWords has none, 404 on 2026-11-16) and Tatoeba holds about
2,800 Mongolian sentences, too few to count, so the counts come from the
Mongolian Wikipedia's articles (CC BY-SA 4.0), the dump of 2026-11-01 -- the
Amharic arrangement.  It is an encyclopaedic corpus, which is why the level
decks lead with a hand-written inventory and use the counts to ORDER the cards
and fill what the inventory leaves.

Only main-namespace articles are read (`<ns>0</ns>`), redirects skipped, and
ARTICLES UNDER 150 WORDS ARE NOT READ (the Yoruba rule: a bot stub repeats one
sentence frame thousands of times).  The markup is stripped crudely but enough.
A form is counted at most ONCE PER ARTICLE (`df`), which extract.py uses.
"""
import bz2, collections, json, re, sys, os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mn import tokens, key

DUMP, OUT = 'mnwiki.xml.bz2', 'mn_counts.json'
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
    t = re.sub(r'^=+.*?=+\s*$', ' ', t, flags=re.M)      # headings ("Эх сурвалж")
    return t


def main():
    total, df, spell = collections.Counter(), collections.Counter(), collections.Counter()
    articles = short = 0
    buf = []
    with bz2.open(DUMP, 'rt', encoding='utf-8') as fh:
        for line in fh:
            if '<page>' in line:
                buf = []
            buf.append(line)
            if '</page>' not in line:
                continue
            p = ''.join(buf)
            ns = NS.search(p)
            if not ns or ns.group(1) != '0' or '<redirect' in p:
                continue
            tx = TEXT.search(p)
            if not tx:
                continue
            raw = tokens(strip(tx.group(1)))
            if len(raw) < MIN_WORDS:
                short += 1
                continue
            spell.update(set(raw))
            toks = [key(r) for r in raw]
            articles += 1
            total.update(toks)
            df.update(set(toks))
    json.dump({'articles': articles, 'df': dict(df), 'total': dict(total), 'spell': dict(spell)},
              open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    print(f'  {articles} articles ({short} under {MIN_WORDS} words not read), '
          f'{sum(total.values())} tokens, {len(total)} forms')


if __name__ == '__main__':
    main()
