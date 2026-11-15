#!/usr/bin/env python3
"""Count the word forms of the Amharic Wikipedia: `amwiki.xml.bz2` -> `am_counts.json`.

    python3 wikitext.py      (from the cache directory, by run.py)

WHY WIKIPEDIA.  No subtitle frequency list exists for Amharic (hermitdave/
FrequencyWords has none, 404 on 2026-11-15) and Tatoeba holds about 300 Amharic
sentences, too few to count, so the counts
come from the Amharic Wikipedia's articles (CC BY-SA 4.0), the dump of 2026-11-01.
It is a small and encyclopaedic corpus -- place names, years and bot-written
stubs -- which is why the level decks lead with a hand-written inventory and use
the counts only to ORDER the cards and to fill what the inventory leaves.

Only main-namespace articles are read (`<ns>0</ns>`), redirects skipped.  The
markup is stripped crudely but enough: templates, tables, refs, links' targets,
HTML tags.  A form is counted at most ONCE PER ARTICLE as well as in total
(`df`), since a bot stub repeats its own words; extract.py uses the article count.

WHAT IS COUNTED IS A KEY, not a spelling (`am.key`): the homophone letters folded
together, so ውሃ, ውሀ and ውኃ "water" are one count.  The spellings are counted too
(`spell`, per article), so a card can head with the one Wikipedia writes most.
"""
import bz2, collections, json, re, sys, os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from am import tokens, key

DUMP, OUT = 'amwiki.xml.bz2', 'am_counts.json'

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
    t = re.sub(r'\[\[(?:[^\]|:]+):[^\]]*\]\]', ' ', t)    # files, categories, interwiki (ስዕል:, መደብ:)
    t = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', t)
    t = re.sub(r'\[https?://\S+\s*([^\]]*)\]', r'\1', t)
    t = re.sub(r'https?://\S+', ' ', t)
    t = re.sub(r'<[^>]+>', ' ', t)
    return t


def main():
    raw = bz2.open(DUMP, 'rt', encoding='utf-8').read()
    total, df, spell = collections.Counter(), collections.Counter(), collections.Counter()
    articles = 0
    for m in PAGE.finditer(raw):
        p = m.group(1)
        ns = NS.search(p)
        if not ns or ns.group(1) != '0' or '<redirect' in p:
            continue
        tx = TEXT.search(p)
        if not tx:
            continue
        raw = tokens(strip(tx.group(1)))
        spell.update(set(raw))
        toks = [t for t in (key(r) for r in raw) if t]
        if not toks:
            continue
        articles += 1
        total.update(toks)
        df.update(set(toks))
    json.dump({'articles': articles, 'df': dict(df), 'total': dict(total), 'spell': dict(spell)},
              open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    print(f'  {articles} articles, {sum(total.values())} tokens, {len(total)} forms')


if __name__ == '__main__':
    main()
