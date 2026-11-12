#!/usr/bin/env python3
"""Build a Zulu deck, end to end.

    python3 .claude/zulu/run.py                 # A1
    python3 .claude/zulu/run.py --level a2      # another level: a2, b1 (inventory first: inventory.py)
    python3 .claude/zulu/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/zulu/classes.py             # the noun classes deck (reads lex.json)
    python3 .claude/zulu/phrases.py             # the phrases deck (reads the cache; after B1)

ONE LEVEL PER RUN (`zulu_level` reads the level once, at import).  Downloads its
sources into `.claude/zulu-cache/` (gitignored, about 180 MB, Tatoeba's English
sentences being 110 MB of it) and leaves them there, so a re-run costs nothing.
Not part of the site.  The plan is `docs/zulu-decks-plan.md`; read it before
changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    wikitext.py     the Zulu Wikipedia's word forms, counted (zu_counts.json)
    extract.py      every Zulu lemma, compacted, with a LEMMA frequency
                    (built once for all levels: lex.json)
    select.py       the inventory, then the commonest remaining words
    examples.py     Wiktionary's own examples, then Tatoeba's
    build_deck.py   headword, tones, glosses, class, forms, tenses, sentences,
                    and the .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · the Zulu Wikipedia, the dump of 2026-11-01 (pinned) -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'zulu-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-zu.jsonl', 'https://kaikki.org/dictionary/Zulu/kaikki.org-dictionary-Zulu.jsonl', False),
    ('zuwiki.xml.bz2', 'https://dumps.wikimedia.org/zuwiki/20261101/'
                       'zuwiki-20261101-pages-articles.xml.bz2', False),
    ('zul_sentences_detailed.tsv', TATOEBA + 'zul/zul_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('zul-eng_links.tsv', TATOEBA + 'zul/zul-eng_links.tsv.bz2', True),
]


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    for name, url, bz in SOURCES:
        out = os.path.join(CACHE, name)
        if os.path.exists(out) and os.path.getsize(out) > 0:
            print(f'  have  {name}')
            continue
        print(f'  get   {name}  <- {url}')
        tmp = out + ('.bz2' if bz else '.part')
        # Wikimedia answers urllib's default user agent with 403 (2026-11-12).
        req = urllib.request.Request(url, headers={'User-Agent': 'folio-deck-builder/1.0'})
        with urllib.request.urlopen(req) as r, open(tmp, 'wb') as f:
            shutil.copyfileobj(r, f)
        if bz:
            subprocess.run(['bunzip2', '-f', tmp], check=True)
        else:
            os.replace(tmp, out)


def main():
    level = 'a1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1].lower()
    os.environ['ZULU_LEVEL'] = level            # read by zulu_level, at import
    print('building level', level.upper())
    sys.path.insert(0, HERE)
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.chdir(CACHE)
    stages = ['select.py', 'examples.py', 'build_deck.py']
    if not os.path.exists('lex.json') or '--re-extract' in sys.argv:
        stages.insert(0, 'extract.py')
    if not os.path.exists('zu_counts.json') or '--re-extract' in sys.argv:
        stages.insert(0, 'wikitext.py')
    for stage in stages:
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
