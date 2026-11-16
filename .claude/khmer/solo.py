#!/usr/bin/env python3
"""How often each word STANDS ALONE in the Khmer Wikipedia: `solo.json`.

    python3 solo.py      (from the cache directory, by run.py; about twenty seconds)

For every article, the words that make up a whole chunk between the breaks a
writer typed -- spaces and zero width spaces -- are counted once (an article
count, like `km_counts.json`'s `df`).  No word cut is involved.

WHY (B1, 2026-11-16).  A word Wiktionary lacks is cut into the words it is spelt
with, so a stray syllable can rank high on its count -- ផា "cloth", ទស "ten",
ទូរ "to compare", ន៏ -- while almost never being written as a word.  A real
short word stands alone in 12 to 30 per cent of the articles it is counted in
(លួច 23 %, ដែក 21 %, នឹក 30 %); those fragments in under 5 %.  `select.py`
uses the ratio to keep short fragments out of the fill (`SOLO_MIN`).
"""
import bz2, collections, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from km import key, RUN
import wikitext
def main():
    raw = bz2.open('kmwiki-20261101.xml.bz2', 'rt', encoding='utf-8').read()
    solo = collections.Counter()
    for m in wikitext.PAGE.finditer(raw):
        p = m.group(1); ns = wikitext.NS.search(p)
        if not ns or ns.group(1) != '0' or '<redirect' in p: continue
        tx = wikitext.TEXT.search(p)
        if not tx: continue
        t = wikitext.strip(tx.group(1))
        seen = set()
        for ch in re.split(r'[\s​]+', t):
            for r in RUN.findall(key(ch)):
                if r == key(ch).strip('។៕៖ៗ!?.,:;()"\'«»'):
                    seen.add(r)
        solo.update(seen)
    json.dump(dict(solo), open('solo.json', 'w'), ensure_ascii=False)
    print(f'  {len(solo)} words stand alone somewhere')


if __name__ == '__main__':
    main()
