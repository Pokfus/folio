#!/usr/bin/env python3
"""Build an Burmese deck, end to end.

    python3 .claude/burmese/run.py                 # A1
    python3 .claude/burmese/run.py --level a2      # another level: a2, b1 (inventory first: inventory.py)
    python3 .claude/burmese/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/burmese/run.py --re-extract    # rebuild the counts and the lexicon
    python3 .claude/burmese/alphabet.py            # the alphabet deck

ONE LEVEL PER RUN (`burmese_level` reads the level once, at import).  Downloads
its sources into `.claude/burmese-cache/` (gitignored, about 230 MB, Tatoeba's
English sentences being most of it) and leaves them there, so a re-run costs
nothing.  Not part of the site.  The plan is `docs/burmese-decks-plan.md`; read
it before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    wikitext.py     the Burmese Wikipedia's words, cut and counted (my_counts.json)
    extract.py      every Burmese lemma in Wiktionary, compacted, with its
                    frequency (built once for all levels: lex.json)
    select.py       the inventory, then the commonest remaining words
    examples.py     Wiktionary's own examples, then Tatoeba's
    build_deck.py   headword, reading, glosses, forms, sentences, and the
                    .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · the Burmese Wikipedia, the dump of 2026-11-01 (pinned) -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'burmese-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-my.jsonl', 'https://kaikki.org/dictionary/Burmese/kaikki.org-dictionary-Burmese.jsonl', False),
    ('mywiki.xml.bz2', 'https://dumps.wikimedia.org/mywiki/20261101/'
                       'mywiki-20261101-pages-articles.xml.bz2', False),
    ('mya_sentences_detailed.tsv', TATOEBA + 'mya/mya_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('mya-eng_links.tsv', TATOEBA + 'mya/mya-eng_links.tsv.bz2', True),
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
    os.environ['BURMESE_LEVEL'] = level            # read by burmese_level, at import
    print('building level', level.upper())
    sys.path.insert(0, HERE)
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.chdir(CACHE)
    stages = ['select.py', 'examples.py', 'build_deck.py']
    if not os.path.exists('lex.json') or '--re-extract' in sys.argv:
        stages.insert(0, 'extract.py')
    if not os.path.exists('my_counts.json') or '--re-extract' in sys.argv:
        stages.insert(0, 'wikitext.py')
    for stage in stages:
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
