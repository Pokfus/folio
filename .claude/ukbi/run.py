#!/usr/bin/env python3
"""Build a UKBI Indonesian deck, end to end.

    python3 .claude/ukbi/run.py                      # level 1, Terbatas
    python3 .claude/ukbi/run.py --level 2            # Marginal, on top of 1
    python3 .claude/ukbi/run.py --no-fetch           # reuse whatever is cached

ONE LEVEL PER RUN.  `ukbi_level` reads the level once, at import, so a second
level in the same process would be built against the first one's settings.

THE LEVELS ARE NUMBERED FROM THE BOTTOM, which is the opposite of UKBI's own
peringkat I-VII: a learner starts at Terbatas, so Terbatas is level 1.  See
`ukbi_level.py`.

WHERE THE WORDS COME FROM.  **UKBI publishes no vocabulary list** -- it is a
proficiency test rather than a syllabus, and neither it nor the BIPA competency
standards (Permendikbud 27/2017) name the words a candidate is expected to know.
That is the one substantial difference from the sibling generators on this
shelf, which read an exam board's own published list: the Goethe decks read the
Wortliste and the DELE decks read the Instituto Cervantes' Plan curricular.
Here the list is assembled, and `select.py`'s header says exactly how and on
what evidence.  Nothing in the deck claims an official source it has not got.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract_kaikki.py  the whole Indonesian Wiktionary, reduced
    supplement.py      the survival vocabulary the level's descriptor names
    select.py          the words, and the affix family around each
    examples.py        three Tatoeba sentences each
    build_deck.py      meanings, forms rows, sentence markup
    emit.py            the .folio-deck.json

Downloads its sources into `.claude/ukbi-cache/` (gitignored) and leaves them
there, so a re-run costs nothing.  They come to about 175 MB, most of it the
English half of the Tatoeba corpus.  Not part of the site.

SOURCES AND LICENCES, which the deck's own description also states:
  · UKBI predicate descriptors -- ukbi.kemendikdasmen.go.id
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
  · A frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0
"""
import os, sys, runpy, urllib.request, subprocess, shutil, json

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'ukbi-cache'))

TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('id_50k.txt',       'https://raw.githubusercontent.com/hermitdave/FrequencyWords/'
                         'master/content/2018/id/id_50k.txt',                  False),
    ('kaikki-id.jsonl',  'https://kaikki.org/dictionary/Indonesian/'
                         'kaikki.org-dictionary-Indonesian.jsonl',             False),
    ('ind_sent.tsv',     TATOEBA + 'ind/ind_sentences_detailed.tsv.bz2',       True),
    ('eng_sent.tsv',     TATOEBA + 'eng/eng_sentences.tsv.bz2',                True),
    ('ind_eng_links.tsv', TATOEBA + 'ind/ind-eng_links.tsv.bz2',               True),
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
        with urllib.request.urlopen(url) as r, open(tmp, 'wb') as fh:
            shutil.copyfileobj(r, fh)
        if bz:
            subprocess.run(['bunzip2', '-f', tmp], check=True)
        else:
            os.replace(tmp, out)


def main():
    level = '1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1]
    os.environ['UKBI_LEVEL'] = level       # read by ukbi_level, at import
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.makedirs(CACHE, exist_ok=True)
    os.chdir(CACHE)
    sys.path.insert(0, HERE)               # so a stage can `import supplement`
    from ukbi_level import PREDICATES, TARGET, f as lvlf
    name, peringkat, band = PREDICATES[level]
    print(f'building level {level}: {name} (peringkat {peringkat}, score {band}), '
          f'target {TARGET[level]} words')

    # THE DICTIONARY IS REDUCED ONCE AND REUSED.  It is the same file whatever
    # level is being built, so a second level costs nothing here -- but it IS
    # rewritten per level, because a level's file name carries the level and a
    # stale one from a different Wiktionary dump would be read in silence.
    print('--- extract_kaikki.py')
    sys.argv = ['extract_kaikki.py', 'kaikki-id.jsonl', lvlf('wikt.json')]
    runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')

    for stage in ('select.py', 'examples.py', 'build_deck.py', 'emit.py'):
        print(f'--- {stage}')
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
