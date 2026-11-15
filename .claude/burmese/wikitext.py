#!/usr/bin/env python3
"""Count the words of the Burmese Wikipedia: `mywiki.xml.bz2` -> `my_counts.json`.

    python3 wikitext.py      (from the cache directory, by run.py)

WHY WIKIPEDIA.  No subtitle frequency list exists for Burmese (hermitdave/
FrequencyWords has none: 404 on 2026-11-15), and Tatoeba holds about 590 Burmese
sentences, too few to count, so the counts come from the Burmese Wikipedia's
articles (CC BY-SA 4.0), the dump of 2026-11-01.  It is WRITTEN, LITERARY Burmese
-- the register of သည် and ၏, not of တယ် and ရဲ့ -- and encyclopaedic, which is
why the level decks lead with a hand-written inventory of the spoken language and
use the counts only to ORDER the cards and to fill what the inventory leaves.

Only main-namespace articles are read (`<ns>0</ns>`), redirects skipped; the page
stream is read one page at a time.  The markup is stripped crudely but enough.  A
paragraph in the Zawgyi encoding (`my.zawgyi`) is skipped and counted as skipped.

THE WORDS ARE CUT (`my.Cutter`) against every Burmese headword of English
Wiktionary and its listed alternative forms.  A word is counted at most ONCE PER
ARTICLE (`df`) as well as in total, since a bot stub repeats its own words;
extract.py uses the article count.
"""
import bz2, collections, json, re, sys, os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from my import Cutter, zawgyi, norm, is_burmese

DUMP, DICT, OUT = 'mywiki.xml.bz2', 'kaikki-my.jsonl', 'my_counts.json'

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
    return t


def dictionary():
    words = set()
    for line in open(DICT, encoding='utf-8'):
        e = json.loads(line)
        w = norm(e.get('word', '')).replace(' ', '')
        if is_burmese(w):
            words.add(w)
        for f in e.get('forms') or []:
            if 'alternative' in (f.get('tags') or []) and is_burmese(f.get('form', '')):
                words.add(norm(f['form']).replace(' ', ''))
    return words


def pages(path):
    buf, inside = [], False
    with bz2.open(path, 'rt', encoding='utf-8') as fh:
        for line in fh:
            if '<page>' in line:
                inside, buf = True, []
            if inside:
                buf.append(line)
            if '</page>' in line:
                inside = False
                yield ''.join(buf)


def main():
    cutter = Cutter(dictionary())
    total, df = collections.Counter(), collections.Counter()
    articles = skipped = paras = 0
    for p in pages(DUMP):
        ns = NS.search(p)
        if not ns or ns.group(1) != '0' or '<redirect' in p:
            continue
        tx = TEXT.search(p)
        if not tx:
            continue
        toks = []
        for para in strip(tx.group(1)).split('\n'):
            if not para.strip():
                continue
            paras += 1
            if zawgyi(para):
                skipped += 1
                continue
            toks.extend(cutter.tokens(para))
        if not toks:
            continue
        articles += 1
        total.update(toks)
        df.update(set(toks))
    json.dump({'articles': articles, 'df': dict(df), 'total': dict(total)},
              open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    print(f'  {articles} articles, {sum(total.values())} tokens, {len(total)} words; '
          f'{skipped} of {paras} paragraphs skipped as Zawgyi')


if __name__ == '__main__':
    main()
