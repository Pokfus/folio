#!/usr/bin/env python3
"""Count the words of the Khmer Wikipedia: `kmwiki-20261101.xml.bz2` -> `km_counts.json`.

    python3 wikitext.py      (from the cache directory, by run.py; about two minutes on four cores)

WHY WIKIPEDIA.  No published word-frequency list for Khmer was found under an open
licence: hermitdave/FrequencyWords, most decks' source, has no Khmer list (404 on
2026-11-15) -- a subtitle list counts space-separated tokens, and Khmer writes no
spaces between words -- and Tatoeba holds about 2,400 Khmer sentences, too few to
count.  So, as for Amharic, the counts come from the Khmer Wikipedia's articles
(CC BY-SA 4.0), the dump of 2026-11-01, pinned.  It is an encyclopaedic corpus --
place names, Buddhist and royal vocabulary, bot-written stubs -- which is why the
level decks lead with a hand-written inventory and use the counts only to ORDER
the cards and to fill what the inventory leaves.

THE CUT.  Every article is cut into words by `km.Segmenter` (maximal matching
against every Khmer headword of English Wiktionary, every part of speech, names
included so a place name is not cut into common words).  The breaks the writer
typed -- spaces and zero width spaces -- are hard cuts first (`km.chunks`).  A
word Wiktionary lacks is cut into the words it is spelt with, which inflates
short words' counts; `select.EXCLUDE` lists the ones that read as syllables.

Only main-namespace articles are read (`<ns>0</ns>`), redirects skipped; the
markup is stripped crudely but enough.  A word is counted at most ONCE PER
ARTICLE (`df`) as well as in total, since a bot stub repeats its own words;
extract.py uses the article count.
"""
import bz2, collections, json, multiprocessing, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from km import Segmenter, nfc

DUMP, DICT, OUT = 'kmwiki-20261101.xml.bz2', 'kaikki-km.jsonl', 'km_counts.json'

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
    # a link is a hard cut on both sides: its text is one word or name the writer marked
    t = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r' \1 ', t)
    t = re.sub(r'\[https?://\S+\s*([^\]]*)\]', r'\1', t)
    t = re.sub(r'https?://\S+', ' ', t)
    t = re.sub(r'<[^>]+>', ' ', t)
    return t


SEG = None


def init(words):
    global SEG
    SEG = Segmenter(words)


def work(text):
    # only dictionary words are kept: an unknown cluster is a piece, not a word
    return [t for t in SEG.segment(strip(text)) if t in SEG.words]


def articles():
    raw = bz2.open(DUMP, 'rt', encoding='utf-8').read()
    for m in PAGE.finditer(raw):
        p = m.group(1)
        ns = NS.search(p)
        if not ns or ns.group(1) != '0' or '<redirect' in p:
            continue
        tx = TEXT.search(p)
        if tx:
            yield tx.group(1)


def main():
    words = set()
    for line in open(DICT, encoding='utf-8'):
        e = json.loads(line)
        if e.get('pos') not in ('character', 'symbol', 'punct', 'prefix', 'suffix'):
            words.add(nfc(e.get('word', '')))
    total, df = collections.Counter(), collections.Counter()
    n = 0
    with multiprocessing.Pool(4, initializer=init, initargs=(words,)) as pool:
        for toks in pool.imap(work, articles(), chunksize=64):
            if not toks:
                continue
            n += 1
            total.update(toks)
            df.update(set(toks))
    json.dump({'articles': n, 'df': dict(df), 'total': dict(total)},
              open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    print(f'  {n} articles, {sum(total.values())} tokens, {len(total)} words')


if __name__ == '__main__':
    main()
