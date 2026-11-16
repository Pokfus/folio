#!/usr/bin/env python3
"""Each carded word's romanisation, read off its Wiktionary page: `wikt-tr.json`.

    python3 romanise.py      (from the cache directory, by run.py, after select.py)

WHY A STAGE OF ITS OWN.  The kaikki.org extraction (`lex.json`) carries a
romanisation for most Khmer entries, but for a word that opens on an unstressed
minor syllable it is often not what Wiktionary prints: បង្កើត "to create" is
`bɑɑbɑngkaət` in the extraction and `bɑngkaət` on its page, ប្រទេស "country"
`prɑɑteih` against `prɑteih`, ក្រហម "red" `krɑɑhɑɑm` against `krɑhɑɑm`.  Read
against the live pages for 484 of A1's words on 2026-11-15, 39 differed, and with no
rule that repairs them all (ប្រជាជន keeps its `prɑɑ` on the page).  So the page is
the source: for each word a card shows, the HEADWORD romanisation
(`<span class="headword-tr">`, the first in the Khmer section) is fetched once from
`en.wiktionary.org/w/index.php?title=<word>&action=render` and kept in the cache.
The extraction's romanisation is used only for a word whose page gives none.

WHAT IS FETCHED: every inventory and fill word of the level, the parts of a
composed compound, and the alphabet deck's example words (`alphabet.WORDS`).  A
word already in the cache is not fetched again, so a re-run costs nothing and is
byte-identical; delete `wikt-tr.json` to read the pages afresh.
"""
import concurrent.futures as cf, json, os, re, sys, time, urllib.parse, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from khmer_level import f

OUT = 'wikt-tr.json'
TR = re.compile(r'lang="km-Latn" class="headword-tr[^"]*"[^>]*>([^<]*)<')


def page(w):
    u = 'https://en.wiktionary.org/w/index.php?title=' + urllib.parse.quote(w) + '&action=render'
    for attempt in range(4):
        try:
            req = urllib.request.Request(u, headers={'User-Agent': 'folio-deck-builder/1.0'})
            return urllib.request.urlopen(req, timeout=30).read().decode('utf-8')
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return ''
            time.sleep(2 ** attempt)
        except Exception:
            time.sleep(2 ** attempt)
    return None


def fetch(words):
    have = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
    todo = sorted({w for w in words if w not in have})
    if todo:
        print(f'  reading {len(todo)} Wiktionary pages')
    failed = []
    with cf.ThreadPoolExecutor(4) as ex:
        for w, t in zip(todo, ex.map(page, todo)):
            if t is None:
                failed.append(w)
                continue
            trs = [x.strip() for x in TR.findall(t) if x.strip()]
            have[w] = trs[0] if trs else ''
    json.dump(have, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
    if failed:
        raise SystemExit('could not read: ' + ' '.join(failed) + ' -- run again')
    return have


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    words = set()
    for r in rows:
        words.add(r['word'])
        words.update((r.get('compose') or {}).get('parts', []))
    fetch(words)


if __name__ == '__main__':
    main()
