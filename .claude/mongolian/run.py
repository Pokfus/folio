#!/usr/bin/env python3
"""Build a Mongolian deck, end to end.

    python3 .claude/mongolian/run.py                 # A1
    python3 .claude/mongolian/run.py --level a2      # another level: a2, b1 (inventory first: inventory.py)
    python3 .claude/mongolian/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/mongolian/run.py --re-extract    # rebuild the counts and the lexicon
    python3 .claude/mongolian/alphabet.py            # the alphabet deck (reads the pinned Wikipedia table)

ONE LEVEL PER RUN (`mongolian_level` reads the level once, at import).  Downloads
its sources into `.claude/mongolian-cache/` (gitignored, about 190 MB, Tatoeba's
English sentences and the Wikipedia dump being most of it) and leaves them there, so a re-run costs
nothing.  Not part of the site.  The plan is `docs/mongolian-decks-plan.md`; read
it before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    wikitext.py     the Mongolian Wikipedia's words, counted (mn_counts.json)
    extract.py      every Mongolian lemma in Wiktionary, compacted, with a LEMMA
                    frequency (built once for all levels: lex.json)
    select.py       the inventory, then the commonest remaining words
    examples.py     Wiktionary's own examples, then Tatoeba's
    build_deck.py   headword, glosses, forms, sentences, and the
                    .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · the Mongolian Wikipedia, the dump of 2026-11-01 (pinned) -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'mongolian-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-mn.jsonl', 'https://kaikki.org/dictionary/Mongolian/kaikki.org-dictionary-Mongolian.jsonl', False),
    ('mnwiki.xml.bz2', 'https://dumps.wikimedia.org/mnwiki/20261101/'
                       'mnwiki-20261101-pages-articles.xml.bz2', False),
    ('mon_sentences_detailed.tsv', TATOEBA + 'mon/amh_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('mon-eng_links.tsv', TATOEBA + 'mon/mon-eng_links.tsv.bz2', True),
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
        # Wikimedia answers urllib's default user agent with 403.
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
    os.environ['MONGOLIAN_LEVEL'] = level            # read by mongolian_level, at import
    print('building level', level.upper())
    sys.path.insert(0, HERE)
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.chdir(CACHE)
    stages = ['select.py', 'examples.py', 'build_deck.py']
    if not os.path.exists('lex.json') or '--re-extract' in sys.argv:
        stages.insert(0, 'extract.py')
    if not os.path.exists('mn_counts.json') or '--re-extract' in sys.argv:
        stages.insert(0, 'wikitext.py')
    for stage in stages:
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
